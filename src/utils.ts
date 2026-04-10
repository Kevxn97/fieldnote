import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import slugify from "slugify";

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(file: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function slugifyValue(value: string): string {
  return slugify(value, { lower: true, strict: true, trim: true }) || "item";
}

export function timestamp(): string {
  return new Date().toISOString();
}

export function stripExtension(filePath: string): string {
  const ext = path.extname(filePath);
  return ext ? filePath.slice(0, -ext.length) : filePath;
}

export function toWikiLink(filePath: string): string {
  const normalized = stripExtension(filePath).replace(/\\/g, "/");
  return `[[${normalized}]]`;
}

export function toObsidianOpenUri(vaultName: string, filePath: string): string {
  const normalizedVault = vaultName.trim() || "vault";
  const normalizedFile = filePath.replace(/\\/g, "/");
  return `obsidian://open?vault=${encodeURIComponent(normalizedVault)}&file=${encodeURIComponent(normalizedFile)}`;
}

export function truncateText(input: string, maxChars: number): string {
  if (input.length <= maxChars) {
    return input;
  }
  return `${input.slice(0, maxChars)}\n\n[truncated]`;
}

export function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

export function extractFrontmatterBlock(markdown: string): string {
  const match = markdown.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? match[0] : "";
}

export function extractMarkdownListSection(markdown: string, heading: string): string[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) {
    return [];
  }

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().startsWith("## ")) {
      break;
    }
    sectionLines.push(line);
  }

  return uniqueStrings(
    sectionLines
      .map((line) => line.trim())
      .filter((line) => /^-\s+/.test(line))
      .map((line) => line.replace(/^-\s+/, "").trim())
      .filter((line) => line && line.toLowerCase() !== "none")
  );
}

export function extractMarkdownSectionText(markdown: string, heading: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) {
    return "";
  }

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().startsWith("## ")) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

export function stripFirstHeading(markdown: string): string {
  return markdown.replace(/^#\s+.+\n+/, "").trim();
}

export function buildFrontmatter(values: Record<string, string | number | boolean | string[] | undefined>): string {
  const lines = ["---"];

  for (const [key, value] of Object.entries(values)) {
    if (value == null) {
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${JSON.stringify(item)}`);
      }
      continue;
    }
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }

  lines.push("---", "");
  return lines.join("\n");
}

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

export async function walkFiles(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function checksumFile(file: string): Promise<string> {
  const buffer = await fs.readFile(file);
  return createHash("sha256").update(buffer).digest("hex");
}

export async function checksumDirectory(root: string): Promise<string> {
  const hash = createHash("sha256");
  const files = (await walkFiles(root)).sort();

  for (const file of files) {
    hash.update(path.relative(root, file));
    hash.update(await fs.readFile(file));
  }

  return hash.digest("hex");
}

export async function checksumPath(targetPath: string): Promise<string> {
  const stats = await fs.stat(targetPath);
  if (stats.isDirectory()) {
    return checksumDirectory(targetPath);
  }
  return checksumFile(targetPath);
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function managedSection(name: string, body: string): string {
  return `<!-- kb:${name}:start -->\n${body.trim()}\n<!-- kb:${name}:end -->`;
}

export function listManagedSections(markdown: string): Array<{ name: string; body: string }> {
  const matches = markdown.matchAll(/<!-- kb:([a-z0-9-]+):start -->\n?([\s\S]*?)\n?<!-- kb:\1:end -->/g);
  return [...matches].map((match) => ({
    name: match[1] ?? "",
    body: (match[2] ?? "").trim()
  }));
}

export function stripManagedSections(markdown: string): string {
  return markdown
    .replace(/<!-- kb:[a-z0-9-]+:start -->\n?[\s\S]*?\n?<!-- kb:[a-z0-9-]+:end -->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function upsertManagedSection(markdown: string, name: string, body: string): string {
  const nextSection = managedSection(name, body);
  const pattern = new RegExp(`<!-- kb:${name}:start -->[\\s\\S]*?<!-- kb:${name}:end -->`, "m");
  if (pattern.test(markdown)) {
    return markdown.replace(pattern, nextSection);
  }
  return `${markdown.trim()}\n\n${nextSection}\n`;
}

export function extractFirstHeading(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const width = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: width }, () => worker()));
  return results;
}
