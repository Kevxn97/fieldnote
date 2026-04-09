import { promises as fs } from "node:fs";
import path from "node:path";
import { writeContextPack } from "./context-pack.js";
import { loadPrompt } from "./prompts.js";
import { buildSourceBundle, collectSourceImageInputs } from "./source.js";
import { resolveModelForPhase } from "./config.js";
import { runTextResponse } from "./openai.js";
import { KBConfig, ResolvedPaths, SearchResult, SourceRecord } from "./types.js";
import {
  buildFrontmatter,
  ensureDir,
  slugifyValue,
  timestamp,
  toWikiLink,
  truncateText,
  uniqueStrings
} from "./utils.js";
import { buildAskContext, searchMarkdown } from "./search.js";

export type AutoresearchFormat = "report" | "slides" | "chart";

export interface AutoresearchPlanItem {
  query: string;
  why: string;
  priority: "high" | "medium" | "low";
}

export interface AutoresearchPlan {
  title: string;
  focus: string;
  subqueries: AutoresearchPlanItem[];
  notes: string[];
}

export interface AutoresearchEvidenceGroup {
  query: string;
  results: SearchResult[];
}

export interface AutoresearchRunOptions {
  format?: AutoresearchFormat;
  rounds?: number;
  maxSubqueries?: number;
  maxResultsPerQuery?: number;
  budgetChars?: number;
  write?: boolean;
  title?: string;
  imagePaths?: string[];
  progress?: (message: string) => void;
}

export interface AutoresearchRunResult {
  plan: AutoresearchPlan;
  evidence: AutoresearchEvidenceGroup[];
  report: string;
  outputPath?: string;
  contextPackPath?: string;
}

export interface SourceReviewOptions extends AutoresearchRunOptions {
  source: SourceRecord;
}

export function extractJsonPayload(markdown: string): string {
  const fenced = markdown.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const trimmed = markdown.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }
  return markdown.trim();
}

export function normalizePlanItem(item: Partial<AutoresearchPlanItem> | string): AutoresearchPlanItem | null {
  if (typeof item === "string") {
    const query = item.trim();
    if (!query) {
      return null;
    }
    return {
      query,
      why: "Relevant follow-up for the research question.",
      priority: "medium"
    };
  }

  const query = (item.query ?? "").trim();
  if (!query) {
    return null;
  }

  return {
    query,
    why: (item.why ?? "Relevant follow-up for the research question.").trim(),
    priority: normalizePriority(item.priority)
  };
}

export function normalizeAutoresearchPlan(plan: AutoresearchPlan, maxSubqueries = 6): AutoresearchPlan {
  const subqueries = uniqueSubqueries(
    (plan.subqueries ?? [])
      .map((item) => normalizePlanItem(item))
      .filter((item): item is AutoresearchPlanItem => Boolean(item))
  ).slice(0, Math.max(3, maxSubqueries));

  return {
    title: (plan.title || "Autoresearch Report").trim(),
    focus: (plan.focus || "Investigate the question with focused subqueries.").trim(),
    subqueries,
    notes: uniqueStrings((plan.notes ?? []).map((note) => note.trim()).filter(Boolean))
  };
}

export function parseAutoresearchPlan(markdown: string, fallbackQuery = "research question"): AutoresearchPlan {
  const payload = extractJsonPayload(markdown);
  try {
    const parsed = JSON.parse(payload) as Partial<AutoresearchPlan> & { subqueries?: Array<Partial<AutoresearchPlanItem> | string> };
    return ensureMinimumPlan(
      normalizeAutoresearchPlan(
        {
          title: parsed.title ?? "Autoresearch Report",
          focus: parsed.focus ?? fallbackQuery,
          subqueries: parsed.subqueries ?? [],
          notes: parsed.notes ?? []
        },
        6
      ),
      fallbackQuery
    );
  } catch {
    return ensureMinimumPlan(parseLoosePlannerMarkdown(markdown, fallbackQuery), fallbackQuery);
  }
}

export function mergeEvidenceGroups(groups: AutoresearchEvidenceGroup[]): AutoresearchEvidenceGroup[] {
  const byQuery = new Map<string, SearchResult[]>();
  for (const group of groups) {
    const query = group.query.trim();
    if (!query) {
      continue;
    }
    const next = byQuery.get(query) ?? [];
    byQuery.set(query, mergeSearchResults(next, group.results));
  }

  return [...byQuery.entries()].map(([query, results]) => ({
    query,
    results: dedupeSearchResults(results)
  }));
}

export function dedupeSearchResults(results: SearchResult[]): SearchResult[] {
  const byPath = new Map<string, SearchResult>();
  for (const result of results) {
    const existing = byPath.get(result.path);
    if (!existing || result.score > existing.score) {
      byPath.set(result.path, result);
    }
  }
  return [...byPath.values()].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}

export function mergeSearchResults(left: SearchResult[], right: SearchResult[]): SearchResult[] {
  return dedupeSearchResults([...left, ...right]);
}

export function buildEvidenceDigest(groups: AutoresearchEvidenceGroup[]): string {
  const blocks: string[] = [];
  for (const group of groups) {
    const lines = group.results.length
      ? group.results.map((result) => `- ${toWikiLink(result.path)} — ${result.title} (${result.score})\n  - ${result.snippet}`)
      : ["- No search hits."];
    blocks.push(`## Query: ${group.query}\n${lines.join("\n")}`);
  }
  return blocks.join("\n\n");
}

export function buildAutoresearchOutputPath(
  paths: ResolvedPaths,
  title: string,
  format: AutoresearchFormat,
  now = timestamp()
): string {
  const date = now.slice(0, 10);
  const suffix = format;
  const slug = slugifyValue(title).slice(0, 72) || "research";
  return path.join("outputs", "research", `${date}-${slug}-${suffix}.md`).replace(/\\/g, "/");
}

export async function runAutoresearch(args: {
  config: KBConfig;
  paths: ResolvedPaths;
  question: string;
  options?: AutoresearchRunOptions;
}): Promise<AutoresearchRunResult> {
  const format = args.options?.format ?? "report";
  const rounds = clampNumber(args.options?.rounds ?? 2, 1, 3);
  const maxSubqueries = clampNumber(args.options?.maxSubqueries ?? 5, 3, 6);
  const maxResultsPerQuery = clampNumber(args.options?.maxResultsPerQuery ?? 6, 2, 10);
  const budgetChars = clampNumber(args.options?.budgetChars ?? Math.min(args.config.compile.maxContextChars, 20_000), 4_000, args.config.compile.maxContextChars);
  const progress = args.options?.progress;
  emitProgress(progress, `starting autoresearch (${format})`);
  emitProgress(progress, "building initial wiki context");
  const { context: baseContext, pack } = await buildAskContext(args.paths, args.question, budgetChars);
  const contextPack = await writeContextPack({
    paths: args.paths,
    summary: {
      workflow: "autoresearch",
      createdAt: timestamp(),
      title: args.options?.title ?? `Autoresearch: ${args.question}`,
      ...pack
    },
    context: baseContext
  });
  const plannerInstructions = await loadPrompt(args.paths, "autoresearch-planner.md");
  const synthesizerInstructions =
    format === "slides"
      ? await loadPrompt(args.paths, "slides.md")
      : format === "chart"
        ? await loadPrompt(args.paths, "chart.md")
        : await loadPrompt(args.paths, "autoresearch-synthesizer.md");

  let plan = ensureMinimumPlan(
    normalizeAutoresearchPlan(
      {
        title: args.options?.title ?? `Autoresearch: ${args.question}`,
        focus: args.question,
        subqueries: [],
        notes: []
      },
      maxSubqueries
    ),
    args.question
  );

  const evidenceGroups: AutoresearchEvidenceGroup[] = [];
  let evidenceDigest = "";

  for (let round = 1; round <= rounds; round += 1) {
    emitProgress(progress, `round ${round}/${rounds}: planning subqueries`);
    const plannerInput = [
      `Research question: ${args.question}`,
      `Round: ${round} of ${rounds}`,
      `Output format: ${format}`,
      "",
      "Current context:",
      baseContext,
      "",
      evidenceDigest ? "Evidence so far:" : "Evidence so far: none",
      evidenceDigest || "- None"
    ].join("\n");

    const plannerOutput = await runTextResponse({
      model: resolveModelForPhase(args.config, "ask"),
      instructions: plannerInstructions,
      input: plannerInput,
      reasoningEffort: args.config.openai.reasoning.ask
    });

    plan = ensureMinimumPlan(parseAutoresearchPlan(plannerOutput, args.question), args.question);
    plan = normalizeAutoresearchPlan(plan, maxSubqueries);
    emitProgress(progress, `round ${round}/${rounds}: planned ${plan.subqueries.length} subqueries`);

    const roundEvidence = await gatherEvidence(args.paths, plan.subqueries, maxResultsPerQuery, progress, round, rounds);
    evidenceGroups.push(...roundEvidence);
    const merged = mergeEvidenceGroups(evidenceGroups);
    evidenceDigest = buildEvidenceDigest(merged);
    emitProgress(progress, `round ${round}/${rounds}: merged evidence for ${merged.length} query groups`);
  }

  const mergedEvidence = mergeEvidenceGroups(evidenceGroups);
  const synthesizerInput = [
    `Question: ${args.question}`,
    `Output format: ${format}`,
    "",
    "Autoresearch plan:",
    JSON.stringify(plan, null, 2),
    "",
    "Evidence digest:",
    evidenceDigest || "- No evidence found.",
    "",
    "Grounding context:",
    baseContext
  ].join("\n");

  emitProgress(progress, "synthesizing final output");
  const report = await runTextResponse({
    model: resolveModelForPhase(args.config, "ask"),
    instructions: synthesizerInstructions,
    input: synthesizerInput,
    reasoningEffort: args.config.openai.reasoning.ask,
    imagePaths: args.options?.imagePaths
  });

  let outputPath: string | undefined;
  if (args.options?.write !== false) {
    emitProgress(progress, "writing research output");
    outputPath = await writeResearchOutput(args.paths, plan.title, format, report, {
      question: args.question,
      plan,
      evidence: mergedEvidence
    });
    emitProgress(progress, `wrote ${outputPath}`);
  }

  return {
    plan,
    evidence: mergedEvidence,
    report,
    outputPath,
    contextPackPath: contextPack.artifactPath
  };
}

export async function reviewSource(args: {
  config: KBConfig;
  paths: ResolvedPaths;
  source: SourceRecord;
  options?: SourceReviewOptions;
}): Promise<AutoresearchRunResult> {
  const bundle = await buildSourceBundle(args.source, args.config, args.paths);
  const images = await collectSourceImageInputs(args.source, args.paths);
  const reviewQuestion = `Review the source ${args.source.title} and identify what should be added, revised, or questioned in the wiki.`;
  const response = await runAutoresearch({
    config: args.config,
    paths: args.paths,
    question: reviewQuestion,
    options: {
      ...args.options,
      title: args.options?.title ?? `${args.source.title} review`,
      maxSubqueries: args.options?.maxSubqueries ?? 5,
      rounds: args.options?.rounds ?? 2,
      imagePaths: images
    }
  });

  const enriched = `${response.report}\n\n## Source Bundle\n\n${truncateText(bundle, 6000)}\n\n## Related Images\n${images.length ? images.map((imagePath) => `- ${path.relative(args.paths.vaultDir, imagePath).replace(/\\/g, "/")}`).join("\n") : "- None"}`;
  if (response.outputPath) {
    await fs.writeFile(path.join(args.paths.vaultDir, response.outputPath), `${enriched.trim()}\n`, "utf8");
  }

  return {
    ...response,
    report: enriched
  };
}

async function gatherEvidence(
  paths: ResolvedPaths,
  subqueries: AutoresearchPlanItem[],
  maxResultsPerQuery: number,
  progress?: (message: string) => void,
  round?: number,
  totalRounds?: number
): Promise<AutoresearchEvidenceGroup[]> {
  const groups: AutoresearchEvidenceGroup[] = [];
  for (const subquery of subqueries) {
    const prefix = round && totalRounds ? `round ${round}/${totalRounds}` : "autoresearch";
    emitProgress(progress, `${prefix}: searching "${subquery.query}"`);
    const results = await searchMarkdown(paths.wikiDir, subquery.query, maxResultsPerQuery);
    emitProgress(progress, `${prefix}: found ${results.length} hits for "${subquery.query}"`);
    groups.push({
      query: subquery.query,
      results
    });
  }
  return groups;
}

async function writeResearchOutput(
  paths: ResolvedPaths,
  title: string,
  format: AutoresearchFormat,
  body: string,
  metadata: {
    question: string;
    plan: AutoresearchPlan;
    evidence: AutoresearchEvidenceGroup[];
  }
): Promise<string> {
  const relPath = await reserveResearchPath(paths, title, format);
  const absolute = path.join(paths.vaultDir, relPath);
  await ensureDir(path.dirname(absolute));
  const frontmatter = buildFrontmatter({
    kind: "output",
    title,
    format,
    question: metadata.question,
    created_at: timestamp(),
    tags: ["output", "research", format]
  });
  const content = [
    frontmatter.trimEnd(),
    body.trim(),
    "",
    "## Autoresearch Plan",
    JSON.stringify(metadata.plan, null, 2),
    "",
    "## Evidence Summary",
    metadata.evidence.length
      ? metadata.evidence
          .map((group) => `- ${group.query}: ${group.results.slice(0, 3).map((item) => item.path).join(", ") || "no hits"}`)
          .join("\n")
      : "- No evidence gathered."
  ].join("\n");
  await fs.writeFile(absolute, `${content.trim()}\n`, "utf8");
  return relPath;
}

async function reserveResearchPath(paths: ResolvedPaths, title: string, format: AutoresearchFormat): Promise<string> {
  let relPath = buildAutoresearchOutputPath(paths, title, format);
  let counter = 2;
  while (await fileExists(path.join(paths.vaultDir, relPath))) {
    const datedSlug = `${timestamp().slice(0, 10)}-${slugifyValue(title).slice(0, 72) || "research"}-${format}`;
    relPath = path.join("outputs", "research", `${datedSlug}-${counter}.md`).replace(/\\/g, "/");
    counter += 1;
  }
  return relPath;
}

function ensureMinimumPlan(plan: AutoresearchPlan, query: string): AutoresearchPlan {
  const fallback = fallbackSubqueries(query);
  const subqueries = uniqueSubqueries([...plan.subqueries, ...fallback]);
  return normalizeAutoresearchPlan(
    {
      ...plan,
      subqueries
    },
    6
  );
}

function fallbackSubqueries(query: string): AutoresearchPlanItem[] {
  const base = query.trim() || "research question";
  return [
    { query: base, why: "Directly answer the core research question.", priority: "high" },
    { query: `${base} evidence`, why: "Find supporting evidence and source grounding.", priority: "medium" },
    { query: `${base} contradictions`, why: "Check for tension, disagreement, or failure modes.", priority: "medium" },
    { query: `${base} comparisons`, why: "Compare against close alternatives or adjacent concepts.", priority: "low" }
  ];
}

function parseLoosePlannerMarkdown(markdown: string, fallbackQuery: string): AutoresearchPlan {
  const lines = markdown.split("\n").map((line) => line.trim());
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() ?? "Autoresearch Report";
  const focus = lines.find((line) => /^focus:/i.test(line))?.replace(/^focus:/i, "").trim() ?? fallbackQuery;
  const subqueries = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean)
    .map((item) => normalizePlanItem(item))
    .filter((item): item is AutoresearchPlanItem => Boolean(item));
  return {
    title,
    focus,
    subqueries,
    notes: []
  };
}

function normalizePriority(priority: unknown): "high" | "medium" | "low" {
  if (priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }
  return "medium";
}

function uniqueSubqueries(items: AutoresearchPlanItem[]): AutoresearchPlanItem[] {
  const seen = new Set<string>();
  const output: AutoresearchPlanItem[] = [];
  for (const item of items) {
    const key = item.query.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(item);
  }
  return output;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? Math.trunc(value) : min));
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function emitProgress(progress: ((message: string) => void) | undefined, message: string): void {
  progress?.(message);
}
