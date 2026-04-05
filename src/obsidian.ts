import { promises as fs } from "node:fs";
import path from "node:path";
import { appendLogEntry, refreshNavigationArtifacts } from "./navigation.js";
import { ResolvedPaths } from "./types.js";
import { buildFrontmatter, ensureDir, extractFirstHeading, slugifyValue, stripFirstHeading, stripFrontmatter, timestamp } from "./utils.js";

export async function setupObsidianWorkspace(root: string, paths: ResolvedPaths): Promise<string[]> {
  const templatesDir = path.join(paths.obsidianDir, "templates");
  const snippetsDir = path.join(paths.obsidianDir, "snippets");
  await Promise.all([ensureDir(templatesDir), ensureDir(snippetsDir)]);

  const files = [
    {
      absolute: paths.homeFile,
      body: [
        "# Home",
        "",
        "## Main Views",
        "- [[wiki/index]]",
        "- [[wiki/system/catalog]]",
        "- [[wiki/system/log]]",
        "- [[wiki/system/source-index]]",
        "- [[wiki/system/entity-index]]",
        "- [[wiki/system/concept-index]]",
        "- [[wiki/system/question-index]]",
        "- [[wiki/system/contradictions]]",
        "- [[wiki/system/graph-audit]]",
        "- [[wiki/system/review-queue]]",
        "- [[wiki/system/revision-queue]]",
        "",
        "## Working Areas",
        "- [[Clippings/README]]",
        "- [[raw]]",
        "- [[outputs]]",
        "- [[wiki/filed]]",
        "- [[wiki/entities]]",
        "- [[wiki/questions]]",
        "",
        "## Suggested Obsidian Flow",
        "1. Clip or drop sources into the vault.",
        "2. If you use Web Clipper attachments, point them at `Clippings/_assets/`.",
        "3. Run `kb update` or `kb sync`.",
        "4. Browse `catalog`, `log`, and the graph in Obsidian.",
        "5. Ask questions, review strong single sources, and file strong outputs back into `wiki/filed/`."
      ].join("\n")
    },
    {
      absolute: path.join(paths.clippingsDir, "README.md"),
      body: [
        "# Clippings Inbox",
        "",
        "Use this folder as the Obsidian Web Clipper inbox.",
        "",
        "## Recommended setup",
        "- Save clipped notes into `Clippings/`.",
        "- In Obsidian, set attachment downloads to `Clippings/_assets/`.",
        "- After clipping an article, download the local attachments if you want image-aware ingest.",
        "- Then run `kb update` from the repo root.",
        "",
        "## What `kb update` does",
        "- imports markdown and PDFs from `Clippings/`",
        "- copies referenced local assets into `raw/images/<clip-name>/`",
        "- syncs the wiki",
        "- clears the processed inbox files from `Clippings/`"
      ].join("\n")
    },
    {
      absolute: path.join(templatesDir, "Filed Output.md"),
      body: [
        "# {{title}}",
        "",
        "## Why This Matters",
        "- Key takeaway",
        "",
        "## Supporting Evidence",
        "- [[wiki/index]]",
        "",
        "## Follow-up Questions",
        "- Next question"
      ].join("\n")
    },
    {
      absolute: path.join(templatesDir, "Research Question.md"),
      body: [
        "# {{question}}",
        "",
        "## Context",
        "- Why this question matters",
        "",
        "## Desired Output",
        "- report | slides | chart | answer",
        "",
        "## Notes",
        "- Constraints, scope, or comparisons"
      ].join("\n")
    },
    {
      absolute: path.join(snippetsDir, "llm-kb-callouts.css"),
      body: [
        ".callout[data-callout=\"kb\"] {",
        "  --callout-color: 224, 122, 69;",
        "  --callout-icon: lucide-brain-circuit;",
        "}"
      ].join("\n")
    }
  ];

  const written: string[] = [];
  for (const file of files) {
    try {
      await fs.access(file.absolute);
    } catch {
      await fs.writeFile(file.absolute, `${file.body.trim()}\n`, "utf8");
      written.push(path.relative(paths.vaultDir, file.absolute).replace(/\\/g, "/"));
    }
  }

  return written;
}

export async function fileOutputIntoWiki(args: {
  root: string;
  paths: ResolvedPaths;
  outputPath: string;
  title?: string;
}): Promise<string> {
  const absolute = await resolveOutputPath(args);
  const raw = await fs.readFile(absolute, "utf8");
  const withoutFrontmatter = stripFrontmatter(raw);
  const inferredTitle = args.title ?? extractFirstHeading(withoutFrontmatter);
  const title = inferredTitle === "Untitled" ? path.parse(absolute).name : inferredTitle;
  const body = stripFirstHeading(withoutFrontmatter) || withoutFrontmatter;
  const slug = slugifyValue(title);
  const relSourcePath = path.relative(args.paths.vaultDir, absolute).replace(/\\/g, "/");
  const relTargetPath = await reserveReadableFiledPath(args.paths, slug);
  const absoluteTargetPath = path.join(args.paths.vaultDir, relTargetPath);

  const frontmatter = buildFrontmatter({
    kind: "filed-output",
    title,
    filed_from: relSourcePath,
    filed_at: timestamp(),
    tags: ["filed", "output"]
  });

  const content = [
    frontmatter.trimEnd(),
    `# ${title}`,
    "",
    "<!-- kb:filed-from:start -->",
    "## Filed From",
    `- Output: [[${relSourcePath.replace(/\.md$/, "")}]]`,
    `- Filed at: ${timestamp()}`,
    "<!-- kb:filed-from:end -->",
    "",
    body.trim()
  ].join("\n");

  await ensureDir(path.dirname(absoluteTargetPath));
  await fs.writeFile(absoluteTargetPath, `${content.trim()}\n`, "utf8");
  await refreshNavigationArtifacts(args.paths);
  await appendLogEntry({
    paths: args.paths,
    kind: "file",
    title,
    summary: `Filed generated output back into the wiki from ${relSourcePath}.`,
    files: [relTargetPath, relSourcePath]
  });
  return relTargetPath;
}

async function resolveOutputPath(args: { root: string; paths: ResolvedPaths; outputPath: string }): Promise<string> {
  if (path.isAbsolute(args.outputPath)) {
    return args.outputPath;
  }

  const rootRelative = path.resolve(args.root, args.outputPath);
  if (await fileExists(rootRelative)) {
    return rootRelative;
  }

  const vaultRelative = path.resolve(args.paths.vaultDir, args.outputPath);
  return vaultRelative;
}

async function reserveReadableFiledPath(paths: ResolvedPaths, slug: string): Promise<string> {
  const date = timestamp().slice(0, 10);
  let relPath = path.join("wiki", "filed", `${date}-${slug}.md`).replace(/\\/g, "/");
  let counter = 2;

  while (await fileExists(path.join(paths.vaultDir, relPath))) {
    relPath = path.join("wiki", "filed", `${date}-${slug}-${counter}.md`).replace(/\\/g, "/");
    counter += 1;
  }

  return relPath;
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
