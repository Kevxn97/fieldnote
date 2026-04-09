import { promises as fs } from "node:fs";
import path from "node:path";
import { ContextPackSummary, ResolvedPaths } from "./types.js";
import { buildFrontmatter, ensureDir, readJson, slugifyValue, timestamp, writeJson } from "./utils.js";

const CONTEXT_PACK_DIRNAME = "context-packs";

export async function writeContextPack(args: {
  paths: ResolvedPaths;
  summary: ContextPackSummary;
  context: string;
}): Promise<ContextPackSummary> {
  const createdAt = args.summary.createdAt || timestamp();
  const dir = path.join(args.paths.metaDir, CONTEXT_PACK_DIRNAME);
  const stamp = createdAt.replace(/[:.]/g, "-");
  const slug = slugifyValue(args.summary.title || args.summary.query).slice(0, 64) || args.summary.workflow;
  const absolute = path.join(dir, `${stamp}-${slug}-${args.summary.workflow}.md`);
  const artifactPath = path.relative(args.paths.root, absolute).replace(/\\/g, "/");
  const summary: ContextPackSummary = {
    ...args.summary,
    createdAt,
    artifactPath
  };

  const body = [
    buildFrontmatter({
      kind: "context-pack",
      workflow: summary.workflow,
      title: summary.title,
      query: summary.query,
      created_at: summary.createdAt,
      budget_chars: summary.budgetChars,
      used_chars: summary.usedChars,
      included_files: summary.includedFileCount
    }).trimEnd(),
    `# Context Pack: ${summary.title}`,
    "",
    "## Snapshot",
    `- Workflow: ${summary.workflow}`,
    `- Query: ${summary.query}`,
    `- Budget chars: ${summary.budgetChars}`,
    `- Used chars: ${summary.usedChars}`,
    `- Included files: ${summary.includedFileCount}`,
    `- Prioritized files: ${summary.prioritizedFileCount}`,
    `- Retrieved files: ${summary.retrievedFileCount}`,
    "",
    "## Top Results",
    ...(summary.topResults.length
      ? summary.topResults.map((result) => `- ${result.path} (${result.kind}, score ${result.score.toFixed(2)})`)
      : ["- None"]),
    "",
    "## Included Files",
    ...(summary.includedPaths.length ? summary.includedPaths.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Prompt Context",
    args.context.trim() || "_No context captured._"
  ].join("\n");

  await ensureDir(dir);
  await fs.writeFile(absolute, `${body.trim()}\n`, "utf8");
  await writeJson(path.join(dir, "latest.json"), summary);
  return summary;
}

export async function readLatestContextPack(paths: ResolvedPaths): Promise<ContextPackSummary | null> {
  return readJson<ContextPackSummary | null>(path.join(paths.metaDir, CONTEXT_PACK_DIRNAME, "latest.json"), null);
}
