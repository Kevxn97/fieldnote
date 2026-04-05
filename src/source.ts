import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import pdf from "pdf-parse";
import { KBConfig, ResolvedPaths, SourceKind, SourceMetadata, SourceRecord } from "./types.js";
import {
  checksumPath,
  ensureDir,
  extractMarkdownListSection,
  pathExists,
  slugifyValue,
  timestamp,
  truncateText,
  uniqueStrings,
  walkFiles
} from "./utils.js";

const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".csv", ".tsv", ".yml", ".yaml", ".html", ".xml"]);
const DATA_EXTENSIONS = new Set([".json", ".csv", ".tsv"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const CLIPPING_IMPORT_EXTENSIONS = new Set([".md", ".pdf"]);

export interface IngestResult {
  source: SourceRecord;
  consumedPaths: string[];
}

export async function ingestPath(
  targetPath: string,
  paths: ResolvedPaths,
  existingSources: SourceRecord[],
  options?: { bucket?: "files" | "clips" }
): Promise<IngestResult> {
  const absolute = path.resolve(targetPath);
  const stats = await fs.stat(absolute);
  const clipMetadata = options?.bucket === "clips" && path.extname(absolute).toLowerCase() === ".md" ? extractClipMetadata(await fs.readFile(absolute, "utf8")) : null;
  const title = clipMetadata?.title || path.basename(absolute);
  const slug = slugifyValue(path.parse(title).name);
  const kind = inferKind(absolute, stats.isDirectory());
  const destination = await reserveDestination(absolute, kind, slug, paths, options);
  const consumedPaths = [absolute];

  await ensureDir(path.dirname(destination));
  if (stats.isDirectory()) {
    await fs.cp(absolute, destination, {
      recursive: true,
      filter: (source) => {
        const basename = path.basename(source);
        return ![".git", "node_modules", "dist", ".next"].includes(basename);
      }
    });
  } else if (options?.bucket === "clips" && path.extname(absolute).toLowerCase() === ".md") {
    const attachmentPaths = await copyClipMarkdownWithAssets({
      sourcePath: absolute,
      destinationPath: destination,
      paths
    });
    consumedPaths.push(...attachmentPaths);
  } else {
    await fs.copyFile(absolute, destination);
  }

  const checksum = await checksumIngestedSource(destination, paths);
  const id = `src_${slug}_${checksum.slice(0, 8)}`;
  const record: SourceRecord = {
    id,
    slug,
    title,
    kind,
    originalPath: absolute,
    storedPath: path.relative(paths.vaultDir, destination).replace(/\\/g, "/"),
    checksum,
    importedAt: timestamp(),
    metadata: clipMetadata
      ? {
          sourceUrl: clipMetadata.sourceUrl,
          authors: clipMetadata.authors,
          published: clipMetadata.published,
          created: clipMetadata.created,
          description: clipMetadata.description,
          tags: clipMetadata.tags
        }
      : undefined,
    relatedAssets:
      options?.bucket === "clips" && path.extname(absolute).toLowerCase() === ".md"
        ? await listStoredClipAssets(paths, path.relative(paths.vaultDir, destination).replace(/\\/g, "/"))
        : undefined
  };

  const withoutOriginal = existingSources.filter((source) => source.originalPath !== absolute);
  withoutOriginal.push(record);
  return {
    source: record,
    consumedPaths: uniqueStrings(consumedPaths)
  };
}

export async function buildSourceBundle(source: SourceRecord, config: KBConfig, paths: ResolvedPaths): Promise<string> {
  const absoluteStoredPath = path.join(paths.vaultDir, source.storedPath);
  const header = [
    `Source ID: ${source.id}`,
    `Title: ${source.title}`,
    `Kind: ${source.kind}`,
    `Raw Path: ${source.storedPath}`,
    ...(source.metadata?.sourceUrl ? [`Source URL: ${source.metadata.sourceUrl}`] : []),
    ...(source.metadata?.authors?.length ? [`Authors: ${source.metadata.authors.join(", ")}`] : []),
    ...(source.metadata?.published ? [`Published: ${source.metadata.published}`] : []),
    ...(source.metadata?.created ? [`Created: ${source.metadata.created}`] : []),
    ...(source.metadata?.description ? [`Description: ${source.metadata.description}`] : []),
    ...(source.metadata?.tags?.length ? [`Tags: ${source.metadata.tags.join(", ")}`] : [])
  ].join("\n");

  if (source.kind === "pdf") {
    const buffer = await fs.readFile(absoluteStoredPath);
    const parsed = await pdf(buffer);
    return `${header}\n\nExtracted text:\n${truncateText(parsed.text || "[no extractable text]", config.compile.maxSourceChars)}`;
  }

  if (source.kind === "directory") {
    const summary = await summarizeDirectory(absoluteStoredPath, config);
    return `${header}\n\nDirectory snapshot:\n${summary}`;
  }

  if (source.kind === "image") {
    return `${header}\n\nThis source is an image asset.\nUse any provided image input as supplemental evidence.\nDo not infer visual details that are not clearly visible.`;
  }

  const raw = await fs.readFile(absoluteStoredPath, "utf8");
  const clipMetadata = source.metadata ?? (source.storedPath.startsWith("raw/clips/") ? extractClipMetadata(raw) : null);
  const relatedAssets = source.relatedAssets ?? (source.storedPath.startsWith("raw/clips/") ? await listStoredClipAssets(paths, source.storedPath) : []);
  const metadataSection = clipMetadata
    ? [
        "",
        "Clip metadata:",
        ...(clipMetadata.sourceUrl ? [`- Source URL: ${clipMetadata.sourceUrl}`] : []),
        ...(clipMetadata.authors?.length ? [`- Authors: ${clipMetadata.authors.join(", ")}`] : []),
        ...(clipMetadata.published ? [`- Published: ${clipMetadata.published}`] : []),
        ...(clipMetadata.created ? [`- Created: ${clipMetadata.created}`] : []),
        ...(clipMetadata.description ? [`- Description: ${clipMetadata.description}`] : []),
        ...(clipMetadata.tags?.length ? [`- Tags: ${clipMetadata.tags.join(", ")}`] : [])
      ].join("\n")
    : "";
  const assetSection = relatedAssets.length
    ? [
        "",
        "Related local assets:",
        ...relatedAssets.map((assetPath) => `- ${assetPath}`),
        "- Treat these as linked source assets available for separate visual review. Do not infer their contents from filenames alone."
      ].join("\n")
    : "";

  return `${header}${metadataSection}${assetSection}\n\nContent:\n${truncateText(raw, config.compile.maxSourceChars)}`;
}

export async function collectSourceImageInputs(source: SourceRecord, paths: ResolvedPaths): Promise<string[]> {
  if (source.kind === "image") {
    return [path.join(paths.vaultDir, source.storedPath)];
  }

  const relatedAssets = source.relatedAssets ?? (source.storedPath.startsWith("raw/clips/") ? await listStoredClipAssets(paths, source.storedPath) : []);
  return relatedAssets
    .filter((assetPath) => IMAGE_EXTENSIONS.has(path.extname(assetPath).toLowerCase()))
    .map((assetPath) => path.join(paths.vaultDir, assetPath))
    .slice(0, 4);
}

export async function collectRawFiles(paths: ResolvedPaths): Promise<string[]> {
  if (!(await pathExists(paths.rawDir))) {
    return [];
  }
  return (await walkFiles(paths.rawDir))
    .map((file) => path.relative(paths.vaultDir, file).replace(/\\/g, "/"))
    .sort();
}

export async function findLatestClip(clippingsDir: string): Promise<string | null> {
  const files = await listClipMarkdownFiles(clippingsDir);
  if (files.length === 0) {
    return null;
  }

  const dated = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );

  dated.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs || a.file.localeCompare(b.file));
  return dated[0]?.file ?? null;
}

export async function findLatestImportableClipping(clippingsDir: string): Promise<string | null> {
  const files = await listImportableClippingFiles(clippingsDir);
  if (files.length === 0) {
    return null;
  }

  const dated = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );

  dated.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs || a.file.localeCompare(b.file));
  return dated[0]?.file ?? null;
}

export async function listClipMarkdownFiles(clippingsDir: string): Promise<string[]> {
  if (!(await pathExists(clippingsDir))) {
    return [];
  }

  return (await walkFiles(clippingsDir))
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .sort();
}

export async function listImportableClippingFiles(clippingsDir: string): Promise<string[]> {
  if (!(await pathExists(clippingsDir))) {
    return [];
  }

  return (await walkFiles(clippingsDir))
    .filter((file) => CLIPPING_IMPORT_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();
}

async function checksumIngestedSource(destinationPath: string, paths: ResolvedPaths): Promise<string> {
  const hash = createHash("sha256");
  hash.update(await checksumPath(destinationPath));

  const assetDir = clipAssetDirectoryForDestination(paths, destinationPath);
  if (await pathExists(assetDir)) {
    const assetFiles = (await walkFiles(assetDir)).sort();
    for (const file of assetFiles) {
      hash.update(path.relative(assetDir, file).replace(/\\/g, "/"));
      hash.update(await checksumPath(file));
    }
  }

  return hash.digest("hex");
}

async function copyClipMarkdownWithAssets(args: {
  sourcePath: string;
  destinationPath: string;
  paths: ResolvedPaths;
}): Promise<string[]> {
  const original = await fs.readFile(args.sourcePath, "utf8");
  const assetMappings = await collectClipAssetMappings(args.sourcePath, args.destinationPath, args.paths, original);
  const rewritten = rewriteClipMarkdownAssetReferences(original, assetMappings);
  await fs.writeFile(args.destinationPath, rewritten, "utf8");
  return assetMappings.map((item) => item.sourcePath);
}

async function collectClipAssetMappings(
  sourcePath: string,
  destinationPath: string,
  paths: ResolvedPaths,
  markdown: string
): Promise<Array<{ rawReference: string; sourcePath: string; copiedPath: string; rewrittenReference: string }>> {
  const rawReferences = uniqueStrings([
    ...extractMarkdownAssetReferences(markdown),
    ...extractObsidianEmbedReferences(markdown)
  ]);
  const mappings: Array<{ rawReference: string; sourcePath: string; copiedPath: string; rewrittenReference: string }> = [];
  const assetRoot = clipAssetDirectoryForDestination(paths, destinationPath);

  for (const rawReference of rawReferences) {
    const resolved = await resolveClipAssetReference(sourcePath, rawReference, paths.vaultDir);
    if (!resolved) {
      continue;
    }

    const relativeAssetPath = buildClipAssetRelativePath(sourcePath, resolved, rawReference);
    const copiedPath = path.join(assetRoot, relativeAssetPath);
    await ensureDir(path.dirname(copiedPath));
    await fs.copyFile(resolved, copiedPath);

    mappings.push({
      rawReference,
      sourcePath: resolved,
      copiedPath,
      rewrittenReference: path.relative(path.dirname(destinationPath), copiedPath).replace(/\\/g, "/")
    });
  }

  return mappings;
}

function rewriteClipMarkdownAssetReferences(
  markdown: string,
  mappings: Array<{ rawReference: string; rewrittenReference: string }>
): string {
  if (mappings.length === 0) {
    return markdown;
  }

  const byReference = new Map(mappings.map((item) => [normalizeClipReference(item.rawReference), item.rewrittenReference]));
  let next = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText: string, target: string) => {
    const normalized = normalizeClipReference(target);
    const replacement = byReference.get(normalized);
    return replacement ? `![${altText}](${replacement})` : match;
  });
  next = next.replace(/!\[\[([^[\]|]+)(\|[^\]]+)?\]\]/g, (match, target: string, alias = "") => {
    const normalized = normalizeClipReference(target);
    const replacement = byReference.get(normalized);
    return replacement ? `![[${replacement}${alias}]]` : match;
  });
  return next;
}

export function extractMarkdownAssetReferences(markdown: string): string[] {
  return [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => normalizeClipReference(match[1] ?? ""))
    .filter(Boolean);
}

export function extractObsidianEmbedReferences(markdown: string): string[] {
  return [...markdown.matchAll(/!\[\[([^[\]|]+)(?:\|[^\]]+)?\]\]/g)]
    .map((match) => normalizeClipReference(match[1] ?? ""))
    .filter(Boolean);
}

function normalizeClipReference(reference: string): string {
  return reference.trim().replace(/^<|>$/g, "");
}

async function resolveClipAssetReference(sourcePath: string, rawReference: string, vaultDir: string): Promise<string | null> {
  const normalized = normalizeClipReference(rawReference);
  if (!normalized || /^(?:[a-z]+:|#)/i.test(normalized) || normalized.startsWith("//")) {
    return null;
  }

  let candidate = path.isAbsolute(normalized) ? normalized : path.resolve(path.dirname(sourcePath), normalized);
  if (path.isAbsolute(normalized) && !(await pathExists(candidate)) && normalized.startsWith("/")) {
    candidate = path.join(vaultDir, normalized.slice(1));
  }

  if (!(await pathExists(candidate))) {
    return null;
  }

  const stats = await fs.stat(candidate);
  return stats.isFile() ? candidate : null;
}

function buildClipAssetRelativePath(sourcePath: string, assetPath: string, rawReference: string): string {
  const normalizedReference = normalizeClipReference(rawReference);
  const clipDir = path.dirname(sourcePath);
  if (!path.isAbsolute(normalizedReference) && !normalizedReference.startsWith("..")) {
    return normalizedReference.replace(/^\.\/+/, "");
  }

  const relativeToClip = path.relative(clipDir, assetPath).replace(/\\/g, "/");
  if (!relativeToClip.startsWith("..")) {
    return relativeToClip;
  }

  return path.basename(assetPath);
}

function clipAssetDirectoryForDestination(paths: ResolvedPaths, destinationPath: string): string {
  return path.join(paths.rawDir, "images", path.parse(destinationPath).name);
}

async function listStoredClipAssets(paths: ResolvedPaths, storedPath: string): Promise<string[]> {
  const assetDir = clipAssetDirectoryForDestination(paths, path.join(paths.vaultDir, storedPath));
  if (!(await pathExists(assetDir))) {
    return [];
  }

  return (await walkFiles(assetDir))
    .map((file) => path.relative(paths.vaultDir, file).replace(/\\/g, "/"))
    .sort();
}

export function extractClipMetadata(markdown: string): (SourceMetadata & { title?: string }) | null {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return null;
  }

  const lines = match[1].split("\n");
  const scalar = new Map<string, string>();
  const listValues = new Map<string, string[]>();
  let activeListKey: string | null = null;

  for (const line of lines) {
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && activeListKey) {
      const values = listValues.get(activeListKey) ?? [];
      values.push(cleanYamlScalar(listMatch[1]));
      listValues.set(activeListKey, values);
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) {
      activeListKey = null;
      continue;
    }

    const key = keyMatch[1].trim().toLowerCase();
    const value = keyMatch[2].trim();
    if (!value) {
      activeListKey = key;
      continue;
    }

    activeListKey = null;
    scalar.set(key, cleanYamlScalar(value));
  }

  const tags = listValues.get("tags") ?? parseInlineTagList(scalar.get("tags"));

  const authors = listValues.get("author") ?? (scalar.get("author") ? [scalar.get("author")!] : undefined);
  return {
    title: scalar.get("title"),
    sourceUrl: scalar.get("source"),
    authors,
    published: scalar.get("published"),
    created: scalar.get("created"),
    description: scalar.get("description"),
    tags: tags.length > 0 ? tags : undefined
  };
}

function cleanYamlScalar(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseInlineTagList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return [];
  }

  return trimmed
    .slice(1, -1)
    .split(",")
    .map((item) => cleanYamlScalar(item))
    .filter(Boolean);
}

function inferKind(targetPath: string, isDirectory: boolean): SourceKind {
  if (isDirectory) {
    return "directory";
  }

  const ext = path.extname(targetPath).toLowerCase();
  if (ext === ".pdf") {
    return "pdf";
  }
  if (IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }
  if (DATA_EXTENSIONS.has(ext)) {
    return "data";
  }
  return TEXT_EXTENSIONS.has(ext) ? "text" : "text";
}

async function reserveDestination(
  sourcePath: string,
  kind: SourceKind,
  slug: string,
  paths: ResolvedPaths,
  options?: { bucket?: "files" | "clips" }
): Promise<string> {
  const ext = path.extname(sourcePath);
  const baseDir =
    kind === "directory"
      ? path.join(paths.rawDir, "repos")
      : kind === "image"
        ? path.join(paths.rawDir, "images")
        : path.join(paths.rawDir, options?.bucket === "clips" ? "clips" : "files");

  let candidate = path.join(baseDir, kind === "directory" ? slug : `${slug}${ext}`);
  let counter = 2;

  while (await pathExists(candidate)) {
    candidate = path.join(baseDir, kind === "directory" ? `${slug}-${counter}` : `${slug}-${counter}${ext}`);
    counter += 1;
  }

  return candidate;
}

async function summarizeDirectory(root: string, config: KBConfig): Promise<string> {
  const files = await walkFiles(root);
  const relFiles = files.map((file) => path.relative(root, file).replace(/\\/g, "/")).sort();
  const important = rankDirectoryFiles(relFiles).slice(0, 8);
  const chunks: string[] = [];

  for (const relFile of important) {
    const fullPath = path.join(root, relFile);
    const ext = path.extname(relFile).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext) && ext !== ".ts" && ext !== ".tsx" && ext !== ".js" && ext !== ".jsx") {
      continue;
    }
    const raw = await fs.readFile(fullPath, "utf8");
    chunks.push(`## ${relFile}\n${truncateText(raw, Math.floor(config.compile.maxSourceChars / 6))}`);
  }

  return [
    "Tree:",
    ...relFiles.map((file) => `- ${file}`),
    "",
    "Selected file excerpts:",
    chunks.join("\n\n")
  ].join("\n");
}

function rankDirectoryFiles(files: string[]): string[] {
  const priorities = ["readme", "package.json", "pyproject.toml", "requirements", "src/", "docs/", "app/", "lib/"];
  return [...files].sort((a, b) => scorePath(b) - scorePath(a) || a.localeCompare(b));

  function scorePath(file: string): number {
    const lower = file.toLowerCase();
    return priorities.reduce((score, token, index) => (lower.includes(token) ? score + (priorities.length - index) * 10 : score), 0);
  }
}

export function extractConcepts(markdown: string): string[] {
  return extractMarkdownListSection(markdown, "Concepts");
}

export function extractEntities(markdown: string): string[] {
  return extractMarkdownListSection(markdown, "Entities");
}
