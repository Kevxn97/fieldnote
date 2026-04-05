import { promises as fs } from "node:fs";
import path from "node:path";
import { collectSourceImageInputs, buildSourceBundle } from "./source.js";
import { requireOpenAIConfigured, runTextResponse } from "./openai.js";
import { KBConfig, ResolvedPaths, SourceRecord } from "./types.js";
import {
  buildFrontmatter,
  ensureDir,
  extractMarkdownListSection,
  pathExists,
  slugifyValue,
  timestamp,
  toWikiLink,
  upsertManagedSection,
  uniqueStrings
} from "./utils.js";

export interface SourceReviewResult {
  reviewPath: string;
  questionCandidates: string[];
  updateCandidates: string[];
}

export interface AppliedSourceReviewResult {
  questionPaths: string[];
  reviewQueuePath?: string;
}

export function buildReadableReviewStem(title: string, date = timestamp().slice(0, 10)): string {
  const slug = slugifyValue(title).slice(0, 60) || "source-review";
  return `${date}-${slug}-review`;
}

export function composeSourceReviewInput(args: {
  source: SourceRecord;
  sourceBundle: string;
  wikiContext: string;
}): string {
  const context = args.wikiContext.trim() || "- No additional wiki context supplied.";
  const metadataLines = [
    `Source ID: ${args.source.id}`,
    `Source title: ${args.source.title}`,
    `Source kind: ${args.source.kind}`,
    `Stored path: ${args.source.storedPath}`,
    ...(args.source.metadata?.sourceUrl ? [`Source URL: ${args.source.metadata.sourceUrl}`] : []),
    ...(args.source.metadata?.authors?.length ? [`Authors: ${args.source.metadata.authors.join(", ")}`] : []),
    ...(args.source.metadata?.published ? [`Published: ${args.source.metadata.published}`] : []),
    ...(args.source.metadata?.created ? [`Created: ${args.source.metadata.created}`] : []),
    ...(args.source.metadata?.description ? [`Description: ${args.source.metadata.description}`] : []),
    ...(args.source.relatedAssets?.length ? [`Related assets: ${args.source.relatedAssets.join(", ")}`] : [])
  ];

  return [
    "Review target:",
    ...metadataLines.map((line) => `- ${line}`),
    "",
    "Source bundle:",
    args.sourceBundle.trim(),
    "",
    "Relevant wiki context:",
    context
  ].join("\n");
}

export function extractReviewQuestionCandidates(markdown: string): string[] {
  return extractMarkdownListSection(markdown, "Open Questions");
}

export function extractReviewUpdateCandidates(markdown: string): string[] {
  return extractMarkdownListSection(markdown, "Suggested Wiki Updates");
}

export async function reviewSourceRecord(args: {
  config: KBConfig;
  paths: ResolvedPaths;
  source: SourceRecord;
  wikiContext: string;
}): Promise<SourceReviewResult> {
  requireOpenAIConfigured();

  const [sourceBundle, imagePaths, reviewPrompt] = await Promise.all([
    buildSourceBundle(args.source, args.config, args.paths),
    collectSourceImageInputs(args.source, args.paths),
    loadReviewPrompt(args.paths)
  ]);

  const output = await runTextResponse({
    model: args.config.openai.models?.compile ?? args.config.model,
    instructions: reviewPrompt,
    input: composeSourceReviewInput({
      source: args.source,
      sourceBundle,
      wikiContext: args.wikiContext
    }),
    reasoningEffort: args.config.openai.reasoning.compile,
    imagePaths
  });

  const reviewPath = await writeReadableReviewFile(args.paths, args.source, output);
  return {
    reviewPath,
    questionCandidates: uniqueStrings(extractReviewQuestionCandidates(output)),
    updateCandidates: uniqueStrings(extractReviewUpdateCandidates(output))
  };
}

export async function applySourceReviewSuggestions(args: {
  paths: ResolvedPaths;
  source: SourceRecord;
  reviewPath: string;
  questionCandidates: string[];
  updateCandidates: string[];
}): Promise<AppliedSourceReviewResult> {
  const questionPaths = await createReviewQuestionNotes(args.paths, args.reviewPath, args.questionCandidates);
  const reviewQueuePath = args.updateCandidates.length
    ? await upsertReviewQueue(args.paths, args.source, args.reviewPath, args.updateCandidates)
    : undefined;

  return {
    questionPaths,
    reviewQueuePath
  };
}

async function writeReadableReviewFile(paths: ResolvedPaths, source: SourceRecord, markdown: string): Promise<string> {
  const relPath = await reserveReadableReviewPath(paths, source.title);
  const absolute = path.join(paths.vaultDir, relPath);

  await ensureDir(path.dirname(absolute));
  const frontmatter = buildFrontmatter({
    kind: "output",
    format: "review",
    title: `Review: ${source.title}`,
    reviewed_source: source.storedPath,
    reviewed_source_id: source.id,
    reviewed_at: timestamp(),
    tags: ["output", "review"]
  });

  const body = markdown.trim().startsWith("# ")
    ? markdown.trim()
    : `# Review: ${source.title}\n\n${markdown.trim()}`;

  await fs.writeFile(absolute, `${frontmatter}${body}\n`, "utf8");
  return relPath;
}

async function createReviewQuestionNotes(paths: ResolvedPaths, reviewPath: string, questions: string[]): Promise<string[]> {
  const written: string[] = [];

  for (const question of uniqueStrings(questions)) {
    const relPath = await reserveQuestionPath(paths, question);
    if (!relPath) {
      continue;
    }

    const absolute = path.join(paths.vaultDir, relPath);
    const frontmatter = buildFrontmatter({
      kind: "question",
      title: question,
      status: "open",
      created_at: timestamp(),
      source_output: reviewPath,
      tags: ["question", "review"]
    });
    const body = [
      `# ${question}`,
      "",
      "## Why this exists",
      `- Promoted from ${toWikiLink(reviewPath)} after a single-source review.`,
      "",
      "## Next Step",
      `- ${question}`
    ].join("\n");
    await fs.writeFile(absolute, `${frontmatter}${body}\n`, "utf8");
    written.push(relPath);
  }

  return written;
}

async function reserveQuestionPath(paths: ResolvedPaths, item: string): Promise<string | null> {
  const slug = slugifyValue(item).slice(0, 80) || "question";
  const baseRelPath = path.join("wiki", "questions", `${slug}.md`).replace(/\\/g, "/");
  if (await pathExists(path.join(paths.vaultDir, baseRelPath))) {
    return null;
  }
  return baseRelPath;
}

async function upsertReviewQueue(
  paths: ResolvedPaths,
  source: SourceRecord,
  reviewPath: string,
  updateCandidates: string[]
): Promise<string> {
  const relPath = path.join("wiki", "system", "review-queue.md").replace(/\\/g, "/");
  const absolute = path.join(paths.vaultDir, relPath);
  const sectionName = `review-${source.slug}`.slice(0, 64);
  const sectionBody = [
    `## ${source.title}`,
    `- Review: ${toWikiLink(reviewPath)}`,
    `- Source: ${toWikiLink(`wiki/sources/${source.slug}.md`)}`,
    "",
    "### Suggested Updates",
    ...updateCandidates.map((item) => `- ${item}`)
  ].join("\n");

  const base = (await pathExists(absolute))
    ? await fs.readFile(absolute, "utf8")
    : [
        buildFrontmatter({
          kind: "index",
          title: "Review Queue",
          updated_at: timestamp(),
          tags: ["index", "review-queue"]
        }).trimEnd(),
        "# Review Queue",
        "",
        "Single-source review suggestions that should be folded back into the wiki."
      ].join("\n");

  let next = upsertManagedSection(base, sectionName, sectionBody);
  next = next.replace(/updated_at: "[^"]+"/, `updated_at: ${JSON.stringify(timestamp())}`);
  await fs.writeFile(absolute, `${next.trim()}\n`, "utf8");
  return relPath;
}

async function reserveReadableReviewPath(paths: ResolvedPaths, title: string): Promise<string> {
  const date = timestamp().slice(0, 10);
  const slug = buildReadableReviewStem(title, date);
  let relPath = path.join("outputs", "reviews", `${slug}.md`).replace(/\\/g, "/");
  let counter = 2;

  while (await fileExists(path.join(paths.vaultDir, relPath))) {
    relPath = path.join("outputs", "reviews", `${slug}-${counter}.md`).replace(/\\/g, "/");
    counter += 1;
  }

  return relPath;
}

async function loadReviewPrompt(paths: ResolvedPaths): Promise<string> {
  const promptPath = path.join(paths.promptsDir, "source-review.md");
  return fs.readFile(promptPath, "utf8");
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
