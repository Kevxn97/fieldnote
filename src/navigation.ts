import { promises as fs } from "node:fs";
import path from "node:path";
import { ResolvedPaths } from "./types.js";
import { buildFrontmatter, ensureDir, extractFirstHeading, stripFirstHeading, stripFrontmatter, timestamp, toWikiLink, truncateText, walkFiles } from "./utils.js";

interface NavEntry {
  absolutePath: string;
  relPath: string;
  title: string;
  summary: string;
}

export async function refreshNavigationArtifacts(paths: ResolvedPaths): Promise<void> {
  await ensureDir(path.join(paths.wikiDir, "system"));
  const [sourceEntries, entityEntries, conceptEntries, questionEntries, filedEntries] = await Promise.all([
    collectNavEntries(path.join(paths.wikiDir, "sources"), paths),
    collectNavEntries(path.join(paths.wikiDir, "entities"), paths),
    collectNavEntries(path.join(paths.wikiDir, "concepts"), paths),
    collectNavEntries(path.join(paths.wikiDir, "questions"), paths),
    collectNavEntries(path.join(paths.wikiDir, "filed"), paths)
  ]);

  const sourceIndex = renderSectionIndex({
    title: "Source Index",
    kind: "index",
    tags: ["index", "sources"],
    entries: sourceEntries
  });

  const conceptIndex = renderSectionIndex({
    title: "Concept Index",
    kind: "index",
    tags: ["index", "concepts"],
    entries: conceptEntries
  });

  const entityIndex = renderSectionIndex({
    title: "Entity Index",
    kind: "index",
    tags: ["index", "entities"],
    entries: entityEntries
  });

  const questionIndex = renderSectionIndex({
    title: "Question Index",
    kind: "index",
    tags: ["index", "questions"],
    entries: questionEntries
  });

  const catalog = renderCatalog({
    sourceEntries,
    entityEntries,
    conceptEntries,
    questionEntries,
    filedEntries
  });

  const mainIndex = renderMainIndex({
    sourceEntries,
    entityEntries,
    conceptEntries,
    questionEntries,
    filedEntries
  });

  await Promise.all([
    fs.writeFile(path.join(paths.wikiDir, "system", "source-index.md"), `${sourceIndex}\n`, "utf8"),
    fs.writeFile(path.join(paths.wikiDir, "system", "entity-index.md"), `${entityIndex}\n`, "utf8"),
    fs.writeFile(path.join(paths.wikiDir, "system", "concept-index.md"), `${conceptIndex}\n`, "utf8"),
    fs.writeFile(path.join(paths.wikiDir, "system", "question-index.md"), `${questionIndex}\n`, "utf8"),
    fs.writeFile(path.join(paths.wikiDir, "system", "catalog.md"), `${catalog}\n`, "utf8"),
    fs.writeFile(path.join(paths.wikiDir, "index.md"), `${mainIndex}\n`, "utf8")
  ]);
}

export async function appendLogEntry(args: {
  paths: ResolvedPaths;
  kind: "ingest" | "compile" | "sync" | "ask" | "heal" | "file" | "update" | "evolve" | "review" | "research";
  title: string;
  summary: string;
  files?: string[];
}): Promise<string> {
  const logPath = path.join(args.paths.wikiDir, "system", "log.md");
  await ensureDir(path.dirname(logPath));

  let current = "";
  try {
    current = await fs.readFile(logPath, "utf8");
  } catch {
    current = [
      buildFrontmatter({
        kind: "index",
        title: "Activity Log",
        tags: ["index", "log"]
      }).trimEnd(),
      "# Activity Log",
      "",
      "Append-only operational history for ingests, syncs, queries, and health passes.",
      ""
    ].join("\n");
  }

  const stamp = timestamp().slice(0, 16).replace("T", " ");
  const entry = [
    `## [${stamp}] ${args.kind} | ${args.title}`,
    `- Summary: ${args.summary}`,
    ...(args.files && args.files.length
      ? [
          "- Files:",
          ...args.files.map((file) => `  - ${toWikiLink(file)}`)
        ]
      : []),
    ""
  ].join("\n");

  await fs.writeFile(logPath, `${current.trimEnd()}\n\n${entry}`, "utf8");
  return path.relative(args.paths.vaultDir, logPath).replace(/\\/g, "/");
}

async function collectNavEntries(dir: string, paths: ResolvedPaths): Promise<NavEntry[]> {
  try {
    const files = (await walkFiles(dir)).filter((file) => file.endsWith(".md")).sort();
    const entries: NavEntry[] = [];

    for (const file of files) {
      const raw = await fs.readFile(file, "utf8");
      const relPath = path.relative(paths.vaultDir, file).replace(/\\/g, "/");
      const title = extractFirstHeading(raw);
      const summary = summarizeMarkdown(raw);
      entries.push({
        absolutePath: file,
        relPath,
        title,
        summary
      });
    }

    return entries;
  } catch {
    return [];
  }
}

function summarizeMarkdown(markdown: string): string {
  const body = stripFirstHeading(stripFrontmatter(markdown))
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("<!-- kb:") && !line.startsWith("## "));
  return truncateText(body[0] ?? "No summary yet.", 160);
}

function renderSectionIndex(args: {
  title: string;
  kind: "index";
  tags: string[];
  entries: NavEntry[];
}): string {
  return [
    buildFrontmatter({
      kind: args.kind,
      title: args.title,
      tags: args.tags
    }).trimEnd(),
    `# ${args.title}`,
    "",
    ...(args.entries.length
      ? args.entries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`)
      : ["- No pages yet."])
  ].join("\n");
}

function renderCatalog(args: {
  sourceEntries: NavEntry[];
  entityEntries: NavEntry[];
  conceptEntries: NavEntry[];
  questionEntries: NavEntry[];
  filedEntries: NavEntry[];
}): string {
  return [
    buildFrontmatter({
      kind: "index",
      title: "Catalog",
      tags: ["index", "catalog"]
    }).trimEnd(),
    "# Catalog",
    "",
    "Content-oriented inventory of the wiki with one-line summaries.",
    "",
    "## Sources",
    ...(args.sourceEntries.length ? args.sourceEntries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`) : ["- None"]),
    "",
    "## Entities",
    ...(args.entityEntries.length ? args.entityEntries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`) : ["- None"]),
    "",
    "## Concepts",
    ...(args.conceptEntries.length ? args.conceptEntries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`) : ["- None"]),
    "",
    "## Questions",
    ...(args.questionEntries.length ? args.questionEntries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`) : ["- None"]),
    "",
    "## Filed Outputs",
    ...(args.filedEntries.length ? args.filedEntries.map((entry) => `- ${toWikiLink(entry.relPath)} - ${entry.summary}`) : ["- None"])
  ].join("\n");
}

function renderMainIndex(args: {
  sourceEntries: NavEntry[];
  entityEntries: NavEntry[];
  conceptEntries: NavEntry[];
  questionEntries: NavEntry[];
  filedEntries: NavEntry[];
}): string {
  return [
    buildFrontmatter({
      kind: "index",
      title: "Research Workbench",
      tags: ["index", "home"]
    }).trimEnd(),
    "# Research Workbench",
    "",
    "## Overview",
    `- Source pages: ${args.sourceEntries.length}`,
    `- Entity pages: ${args.entityEntries.length}`,
    `- Concept pages: ${args.conceptEntries.length}`,
    `- Open questions: ${args.questionEntries.length}`,
    `- Filed outputs: ${args.filedEntries.length}`,
    `- Catalog: ${toWikiLink("wiki/system/catalog.md")}`,
    `- Activity log: ${toWikiLink("wiki/system/log.md")}`,
    `- Source index: ${toWikiLink("wiki/system/source-index.md")}`,
    `- Entity index: ${toWikiLink("wiki/system/entity-index.md")}`,
    `- Concept index: ${toWikiLink("wiki/system/concept-index.md")}`,
    `- Question index: ${toWikiLink("wiki/system/question-index.md")}`,
    `- Contradictions tracker: ${toWikiLink("wiki/system/contradictions.md")}`,
    `- Review queue: ${toWikiLink("wiki/system/review-queue.md")}`,
    `- Revision queue: ${toWikiLink("wiki/system/revision-queue.md")}`,
    "",
    "## Featured Entities",
    ...(args.entityEntries.length ? args.entityEntries.slice(0, 12).map((entry) => `- ${toWikiLink(entry.relPath)}`) : ["- None"]),
    "",
    "## Featured Concepts",
    ...(args.conceptEntries.length ? args.conceptEntries.slice(0, 12).map((entry) => `- ${toWikiLink(entry.relPath)}`) : ["- None"])
  ].join("\n");
}
