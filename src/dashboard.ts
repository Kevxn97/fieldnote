import { promises as fs } from "node:fs";
import path from "node:path";
import { initializeProject, loadBuildState, loadSources, resolveModelForPhase } from "./config.js";
import { BuildState } from "./types.js";
import { extractFirstHeading, stripFrontmatter, truncateText, walkFiles } from "./utils.js";

export interface DashboardSummary {
  name: string;
  model: string;
  health: string;
  lastSync: string;
  stage: string;
  narrative: string;
  counts: {
    raw: number;
    wiki: number;
    outputs: number;
    questions: number;
    pendingCompile: number;
    sourcePages: number;
    entities: number;
    concepts: number;
  };
}

export interface DashboardOutputItem {
  title: string;
  path: string;
  excerpt: string;
}

export interface DashboardBreakdownItem {
  label: string;
  value: number;
}

export interface DashboardActionItem {
  title: string;
  detail: string;
  command: string;
}

export interface DashboardActivityItem {
  time: string;
  kind: string;
  title: string;
  summary: string;
}

export interface DashboardPayload {
  summary: DashboardSummary;
  recentOutputs: DashboardOutputItem[];
  nextActions: DashboardActionItem[];
  recentActivity: DashboardActivityItem[];
  sourceBreakdown: DashboardBreakdownItem[];
  outputBreakdown: DashboardBreakdownItem[];
  spotlightQuestions: string[];
}

export function extractOpenQuestionsFromMarkdown(markdown: string): string[] {
  const sectionMatch = markdown.match(/^## Open Questions\s*([\s\S]*?)(?=^##\s|\Z)/m);
  if (!sectionMatch) {
    return [];
  }

  return sectionMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line))
    .map((line) => line.replace(/^-\s+/, ""));
}

export function countOpenQuestionsInMarkdown(markdown: string): number {
  const sectionMatch = markdown.match(/^## Open Questions\s*([\s\S]*?)(?=^##\s|\Z)/m);
  if (!sectionMatch) {
    return 0;
  }

  return sectionMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line)).length;
}

export function inferHealthLabel(args: { rawCount: number; wikiCount: number; latestHealthMarkdown: string | null }): string {
  if (args.rawCount === 0) {
    return "Empty";
  }
  if (args.wikiCount === 0) {
    return "Needs compile";
  }
  if (!args.latestHealthMarkdown) {
    return "Unreviewed";
  }

  const body = args.latestHealthMarkdown.toLowerCase();
  const noMissingConcepts = body.includes("source pages missing concepts: 0");
  const noOrphans = body.includes("orphan concept pages: 0");
  return noMissingConcepts && noOrphans ? "Healthy" : "Needs review";
}

export async function buildDashboardPayload(root: string): Promise<DashboardPayload> {
  const [{ config, paths }, buildState, sources] = await Promise.all([
    initializeProject(root),
    initializeProject(root).then(({ paths }) => loadBuildState(paths)),
    initializeProject(root).then(({ paths }) => loadSources(paths))
  ]);

  const [wikiFiles, outputFiles, latestHealthMarkdown] = await Promise.all([
    listMarkdownFiles(paths.wikiDir),
    listMarkdownFiles(paths.outputDir),
    readLatestHealthMarkdown(paths.outputDir)
  ]);

  const [recentOutputs, questionCount, recentActivity, spotlightQuestions] = await Promise.all([
    collectRecentOutputs(paths.vaultDir, paths.outputDir, 6),
    countOpenQuestions(wikiFiles),
    collectRecentActivity(paths.wikiDir, 6),
    collectSpotlightQuestions(wikiFiles, 3)
  ]);

  const pendingCompile = sources.filter(
    (s) => buildState.compiledSources[s.id]?.checksum !== s.checksum
  ).length;
  const pageCounts = countWikiPageKinds(wikiFiles);

  const health = inferHealthLabel({
    rawCount: sources.length,
    wikiCount: wikiFiles.length,
    latestHealthMarkdown
  });

  return {
    summary: {
      name: config.name || "Research Workbench",
      model: `${resolveModelForPhase(config, "ask")} (ask)`,
      health,
      lastSync: latestSyncLabel(buildState),
      stage: inferWorkspaceStage({
        rawCount: sources.length,
        wikiCount: wikiFiles.length,
        outputCount: outputFiles.length
      }),
      narrative: inferWorkspaceNarrative({
        rawCount: sources.length,
        wikiCount: wikiFiles.length,
        outputCount: outputFiles.length,
        questionCount,
        health
      }),
      counts: {
        raw: sources.length,
        wiki: wikiFiles.length,
        outputs: outputFiles.length,
        questions: questionCount,
        pendingCompile,
        sourcePages: pageCounts.sourcePages,
        entities: pageCounts.entities,
        concepts: pageCounts.concepts,
      }
    },
    recentOutputs,
    nextActions: buildNextActions({
      rawCount: sources.length,
      wikiCount: wikiFiles.length,
      outputCount: outputFiles.length,
      questionCount,
      health
    }),
    recentActivity,
    sourceBreakdown: buildSourceBreakdown(sources),
    outputBreakdown: buildOutputBreakdown(paths.outputDir, outputFiles),
    spotlightQuestions,
  };
}

async function listMarkdownFiles(rootDir: string): Promise<string[]> {
  try {
    return (await walkFiles(rootDir)).filter((file) => file.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

async function countOpenQuestions(files: string[]): Promise<number> {
  let total = 0;
  for (const file of files) {
    const markdown = await fs.readFile(file, "utf8");
    total += countOpenQuestionsInMarkdown(stripFrontmatter(markdown));
  }
  return total;
}

async function collectSpotlightQuestions(files: string[], limit: number): Promise<string[]> {
  const questions: string[] = [];
  for (const file of files) {
    const markdown = await fs.readFile(file, "utf8");
    questions.push(...extractOpenQuestionsFromMarkdown(stripFrontmatter(markdown)));
  }
  return questions.slice(0, limit);
}

async function collectRecentOutputs(root: string, outputDir: string, limit: number): Promise<DashboardOutputItem[]> {
  const files = await listMarkdownFiles(outputDir);
  const datedFiles = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );

  const recent = datedFiles.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs).slice(0, limit);
  const items: DashboardOutputItem[] = [];

  for (const entry of recent) {
    const raw = await fs.readFile(entry.file, "utf8");
    const markdown = stripFrontmatter(raw);
    items.push({
      title: extractFirstHeading(markdown),
      path: path.relative(root, entry.file).replace(/\\/g, "/"),
      excerpt: firstMeaningfulParagraph(markdown)
    });
  }

  return items;
}

async function collectRecentActivity(wikiDir: string, limit: number): Promise<DashboardActivityItem[]> {
  const logPath = path.join(wikiDir, "system", "log.md");
  let markdown = "";
  try {
    markdown = await fs.readFile(logPath, "utf8");
  } catch {
    return [];
  }

  const sections = markdown.split(/^## /m).slice(1);
  const items: DashboardActivityItem[] = [];

  for (const section of sections) {
    const lines = section.split("\n");
    const heading = lines[0]?.trim() ?? "";
    const match = heading.match(/^\[(.+?)\]\s+([a-z-]+)\s+\|\s+(.+)$/i);
    if (!match) {
      continue;
    }

    const summaryLine = lines.find((line) => line.startsWith("- Summary:"));
    items.push({
      time: match[1],
      kind: match[2],
      title: match[3],
      summary: truncateText(summaryLine?.replace(/^- Summary:\s*/, "") ?? "Recorded workspace activity.", 180)
    });
  }

  return items.slice(-limit).reverse();
}

async function readLatestHealthMarkdown(outputDir: string): Promise<string | null> {
  const healthDir = path.join(outputDir, "health");
  const files = await listMarkdownFiles(healthDir);
  if (files.length === 0) {
    return null;
  }

  const dated = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );
  const latest = dated.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)[0];
  return fs.readFile(latest.file, "utf8");
}

function firstMeaningfulParagraph(markdown: string): string {
  const lines = stripFrontmatter(markdown)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  return truncateText(lines[0] ?? "Generated output.", 180);
}

export function countWikiPageKinds(files: string[]): { sourcePages: number; entities: number; concepts: number } {
  const relPaths = files.map((file) => file.replace(/\\/g, "/"));
  return {
    sourcePages: relPaths.filter((file) => file.includes("/sources/")).length,
    entities: relPaths.filter((file) => file.includes("/entities/")).length,
    concepts: relPaths.filter((file) => file.includes("/concepts/")).length
  };
}

function buildSourceBreakdown(sources: Awaited<ReturnType<typeof loadSources>>): DashboardBreakdownItem[] {
  const counts = new Map<string, number>();
  for (const source of sources) {
    const label = source.kind === "directory" ? "repos" : source.kind;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));
}

function buildOutputBreakdown(outputDir: string, outputFiles: string[]): DashboardBreakdownItem[] {
  const counts = new Map<string, number>();
  for (const file of outputFiles) {
    const rel = path.relative(outputDir, file).replace(/\\/g, "/");
    const segment = rel.split("/")[0] || "outputs";
    counts.set(segment, (counts.get(segment) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label: label.replace(/-/g, " "), value }));
}

function inferWorkspaceStage(args: { rawCount: number; wikiCount: number; outputCount: number }): string {
  if (args.rawCount === 0) {
    return "Inbox empty";
  }
  if (args.wikiCount === 0) {
    return "Ready to compile";
  }
  if (args.outputCount === 0) {
    return "Ready to generate";
  }
  return "In active use";
}

function inferWorkspaceNarrative(args: {
  rawCount: number;
  wikiCount: number;
  outputCount: number;
  questionCount: number;
  health: string;
}): string {
  if (args.rawCount === 0) {
    return "Add a few sources to turn this empty vault into a working research workspace.";
  }
  if (args.wikiCount === 0) {
    return "Your source inbox is loaded. One compile pass will turn it into a searchable workspace.";
  }
  if (args.outputCount === 0) {
    return "The knowledge layer is ready. Generate a first brief, report, or slide draft to make the workspace feel alive.";
  }
  if (args.health === "Needs review" || args.health === "Unreviewed") {
    return "The workspace is producing artifacts. A review pass will tighten coverage and promote stronger follow-up questions.";
  }
  if (args.questionCount > 0) {
    return "The workspace is active and already surfacing follow-up questions worth resolving in the next run.";
  }
  return "Sources, wiki pages, and reusable outputs are all in motion. This is ready to demo as a local-first research workspace.";
}

function buildNextActions(args: {
  rawCount: number;
  wikiCount: number;
  outputCount: number;
  questionCount: number;
  health: string;
}): DashboardActionItem[] {
  const actions: DashboardActionItem[] = [];

  if (args.rawCount === 0) {
    actions.push({
      title: "Import the first source",
      detail: "Drop in a markdown file, PDF, repo snapshot, or clipped article to seed the workspace.",
      command: "kb add /path/to/source"
    });
  } else {
    actions.push({
      title: "Refresh the inbox",
      detail: "Pull the latest file or clipping into the raw source layer so the workspace keeps compounding.",
      command: "kb update"
    });
  }

  if (args.rawCount > 0 && args.wikiCount === 0) {
    actions.push({
      title: "Compile the workspace",
      detail: "Turn raw material into source pages, entities, concepts, and navigation artifacts.",
      command: "kb sync"
    });
  } else if (args.wikiCount > 0) {
    actions.push({
      title: "Generate a reusable brief",
      detail: "Ask one sharp question and save the result as a report, answer, chart brief, or deck.",
      command: 'kb ask "What matters most in this source set?" --format report'
    });
  }

  if (args.health === "Needs review" || args.health === "Unreviewed") {
    actions.push({
      title: "Audit the workspace",
      detail: "Run a health or review pass to tighten weak areas and surface follow-up work.",
      command: "kb heal"
    });
  } else if (args.questionCount > 0) {
    actions.push({
      title: "Resolve an open question",
      detail: "Use the wiki's own follow-up queue to decide what to synthesize next.",
      command: 'kb autoresearch "What contradictions should I resolve next?" --format report'
    });
  } else {
    actions.push({
      title: "Deepen the graph",
      detail: "Run a broader maintenance loop when the workspace already has enough material to revise.",
      command: "kb evolve --rounds 2 --max-pages 6"
    });
  }

  return actions.slice(0, 3);
}

export function latestSyncLabel(buildState: BuildState): string {
  const compiledAt = [
    ...Object.values(buildState.compiledSources).map((entry) => entry.compiledAt),
    ...Object.values(buildState.entityPages).map((entry) => entry.compiledAt),
    ...Object.values(buildState.conceptPages).map((entry) => entry.compiledAt)
  ]
    .filter(Boolean)
    .sort()
    .at(-1);

  if (!compiledAt) {
    return "Not compiled yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(compiledAt));
}
