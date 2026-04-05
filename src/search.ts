import { promises as fs } from "node:fs";
import path from "node:path";
import { ResolvedPaths, SearchResult } from "./types.js";
import { extractFirstHeading, tokenize, truncateText, walkFiles } from "./utils.js";

export async function searchMarkdown(rootDir: string, query: string, limit = 8): Promise<SearchResult[]> {
  const files = (await walkFiles(rootDir)).filter((file) => file.endsWith(".md")).sort();
  const vaultRoot = path.dirname(rootDir);
  const queryTokens = tokenize(query);
  const results: SearchResult[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const relPath = path.relative(vaultRoot, file).replace(/\\/g, "/");
    const title = extractFirstHeading(content);
    const score = scoreDocument(queryTokens, title, content, relPath);
    if (score <= 0) {
      continue;
    }
    results.push({
      path: relPath,
      title,
      score,
      snippet: buildSnippet(content, queryTokens)
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function buildAskContext(paths: ResolvedPaths, query: string, maxChars: number): Promise<{ context: string; results: SearchResult[] }> {
  const results = await searchMarkdown(paths.wikiDir, query, 10);
  const chunks: string[] = [];
  let usedChars = 0;
  const priorityPaths = [
    "wiki/index.md",
    "wiki/system/catalog.md",
    "wiki/system/log.md",
    "wiki/system/source-index.md",
    "wiki/system/entity-index.md",
    "wiki/system/concept-index.md",
    "wiki/system/question-index.md",
    "wiki/system/contradictions.md",
    "wiki/system/graph-audit.md",
    "wiki/system/review-queue.md",
    "wiki/system/revision-queue.md"
  ];
  const included = new Set<string>();

  for (const relPath of priorityPaths) {
    const absolute = path.join(paths.vaultDir, relPath);
    try {
      const content = await fs.readFile(absolute, "utf8");
      const chunk = `# ${relPath}\n\n${content.trim()}\n`;
      if (usedChars + chunk.length > maxChars) {
        break;
      }
      chunks.push(chunk);
      usedChars += chunk.length;
      included.add(relPath);
    } catch {
      continue;
    }
  }

  for (const result of results) {
    if (included.has(result.path)) {
      continue;
    }
    const absolute = path.join(paths.vaultDir, result.path);
    const content = await fs.readFile(absolute, "utf8");
    const chunk = `# ${result.path}\n\n${content.trim()}\n`;
    if (usedChars + chunk.length > maxChars) {
      break;
    }
    chunks.push(chunk);
    usedChars += chunk.length;
  }

  return {
    context: chunks.join("\n\n"),
    results
  };
}

function scoreDocument(queryTokens: string[], title: string, content: string, relPath: string): number {
  const text = `${title}\n${relPath}\n${content}`.toLowerCase();
  let score = 0;

  for (const token of queryTokens) {
    const occurrences = countOccurrences(text, token);
    if (occurrences > 0) {
      score += occurrences;
    }
    if (title.toLowerCase().includes(token)) {
      score += 6;
    }
    if (relPath.toLowerCase().includes(token)) {
      score += 4;
    }
  }

  return score;
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = 0;
  while (index !== -1) {
    index = haystack.indexOf(needle, index);
    if (index !== -1) {
      count += 1;
      index += needle.length;
    }
  }
  return count;
}

function buildSnippet(content: string, queryTokens: string[]): string {
  const lines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const match = lines.find((line) => queryTokens.some((token) => line.toLowerCase().includes(token))) ?? lines[1] ?? lines[0] ?? "";
  return truncateText(match, 180);
}
