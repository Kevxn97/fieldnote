import { promises as fs } from "node:fs";
import path from "node:path";
import { ContextPackSummary, ResolvedPaths, SearchPageKind, SearchResult } from "./types.js";
import { extractFirstHeading, stripExtension, tokenize, truncateText, uniqueStrings, walkFiles } from "./utils.js";

interface WikiSearchDocument {
  absolutePath: string;
  relPath: string;
  normalizedTarget: string;
  title: string;
  content: string;
  searchableText: string;
  kind: SearchPageKind;
  backlinks: number;
  mtimeMs: number;
}

interface WikiSearchCacheEntry {
  signature: string;
  documents: WikiSearchDocument[];
}

export interface AskContextResult {
  context: string;
  results: SearchResult[];
  pack: Omit<ContextPackSummary, "workflow" | "title" | "createdAt" | "artifactPath">;
}

const SEARCH_CACHE = new Map<string, WikiSearchCacheEntry>();
const SYSTEM_PRIORITY_PATHS = [
  "wiki/index.md",
  "wiki/system/brief.md",
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

export async function searchMarkdown(rootDir: string, query: string, limit = 8): Promise<SearchResult[]> {
  const docs = await loadWikiSearchDocuments(rootDir);
  const queryText = query.trim();
  if (!queryText) {
    return [];
  }

  const tokens = tokenize(queryText);
  const intentKinds = inferPreferredKinds(queryText);
  const results: SearchResult[] = [];

  for (const doc of docs) {
    const result = scoreDocument(doc, queryText, tokens, intentKinds);
    if (result) {
      results.push(result);
    }
  }

  return results
    .sort((left, right) =>
      right.score - left.score ||
      right.backlinks - left.backlinks ||
      right.freshness - left.freshness ||
      left.path.localeCompare(right.path)
    )
    .slice(0, limit);
}

export async function buildAskContext(paths: ResolvedPaths, query: string, maxChars: number): Promise<AskContextResult> {
  const budgetChars = Math.max(2_000, maxChars);
  const [docs, results] = await Promise.all([
    loadWikiSearchDocuments(paths.wikiDir),
    searchMarkdown(paths.wikiDir, query, 12)
  ]);
  const byPath = new Map(docs.map((doc) => [doc.relPath, doc]));
  const chunks: string[] = [];
  const includedPaths: string[] = [];
  const included = new Set<string>();
  let prioritizedFileCount = 0;
  let retrievedFileCount = 0;
  let usedChars = 0;

  const includePath = (relPath: string, source: "priority" | "retrieval"): void => {
    if (included.has(relPath)) {
      return;
    }
    const doc = byPath.get(relPath);
    if (!doc) {
      return;
    }
    const chunk = `# ${relPath}\n\n${doc.content.trim()}\n`;
    if (usedChars + chunk.length > budgetChars) {
      return;
    }
    chunks.push(chunk);
    included.add(relPath);
    includedPaths.push(relPath);
    usedChars += chunk.length;
    if (source === "priority") {
      prioritizedFileCount += 1;
    } else {
      retrievedFileCount += 1;
    }
  };

  for (const relPath of SYSTEM_PRIORITY_PATHS) {
    includePath(relPath, "priority");
  }

  for (const result of results) {
    includePath(result.path, "retrieval");
  }

  return {
    context: chunks.join("\n\n"),
    results,
    pack: {
      query,
      budgetChars,
      usedChars,
      includedFileCount: includedPaths.length,
      prioritizedFileCount,
      retrievedFileCount,
      includedPaths,
      topResults: results.slice(0, 8).map((result) => ({
        path: result.path,
        title: result.title,
        score: Number(result.score.toFixed(2)),
        kind: result.kind
      }))
    }
  };
}

async function loadWikiSearchDocuments(rootDir: string): Promise<WikiSearchDocument[]> {
  let files: string[];
  try {
    files = (await walkFiles(rootDir)).filter((file) => file.endsWith(".md")).sort();
  } catch {
    return [];
  }

  const fileStats = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );
  const signature = fileStats
    .map(({ file, stat }) => `${normalizePath(file)}:${stat.size}:${stat.mtimeMs}`)
    .join("|");
  const cached = SEARCH_CACHE.get(rootDir);
  if (cached?.signature === signature) {
    return cached.documents;
  }

  const vaultRoot = path.dirname(rootDir);
  const loaded = await Promise.all(
    fileStats.map(async ({ file, stat }) => {
      const content = await fs.readFile(file, "utf8");
      const relPath = normalizePath(path.relative(vaultRoot, file));
      return {
        absolutePath: file,
        relPath,
        normalizedTarget: normalizePath(stripExtension(relPath)),
        title: extractFirstHeading(content),
        content,
        searchableText: `${extractFirstHeading(content)}\n${relPath}\n${content}`.toLowerCase(),
        kind: inferPageKind(relPath),
        backlinks: 0,
        mtimeMs: stat.mtimeMs,
        outboundLinks: extractWikiLinks(content)
      };
    })
  );

  const backlinkCounts = new Map<string, number>();
  for (const doc of loaded) {
    for (const target of uniqueStrings(doc.outboundLinks.map((item) => normalizePath(stripExtension(item))))) {
      backlinkCounts.set(target, (backlinkCounts.get(target) ?? 0) + 1);
    }
  }

  const documents = loaded.map((doc) => ({
    absolutePath: doc.absolutePath,
    relPath: doc.relPath,
    normalizedTarget: doc.normalizedTarget,
    title: doc.title,
    content: doc.content,
    searchableText: doc.searchableText,
    kind: doc.kind,
    backlinks: backlinkCounts.get(doc.normalizedTarget) ?? 0,
    mtimeMs: doc.mtimeMs
  }));

  SEARCH_CACHE.set(rootDir, { signature, documents });
  return documents;
}

function scoreDocument(
  doc: WikiSearchDocument,
  query: string,
  queryTokens: string[],
  intentKinds: SearchPageKind[]
): SearchResult | null {
  const text = doc.searchableText;
  const titleLower = doc.title.toLowerCase();
  const pathLower = doc.relPath.toLowerCase();
  const queryLower = query.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (queryLower.length > 3 && text.includes(queryLower)) {
    score += 8;
    reasons.push("full query match");
  }

  for (const token of queryTokens) {
    const occurrences = countOccurrences(text, token);
    if (occurrences > 0) {
      score += Math.min(occurrences, 8);
      reasons.push(`mentions ${token}`);
    }
    if (titleLower.includes(token)) {
      score += 6;
      reasons.push("title match");
    }
    if (pathLower.includes(token)) {
      score += 4;
      reasons.push("path match");
    }
    if (path.basename(pathLower, ".md") === token) {
      score += 4;
      reasons.push("slug match");
    }
  }

  if (intentKinds.includes(doc.kind)) {
    score += 4;
    reasons.push(`${doc.kind} intent`);
  }
  if (SYSTEM_PRIORITY_PATHS.includes(doc.relPath)) {
    score += 2.5;
    reasons.push("priority system page");
  }

  const backlinkBonus = Math.min(doc.backlinks, 6) * 0.75;
  if (backlinkBonus > 0) {
    score += backlinkBonus;
    reasons.push("linked from other pages");
  }

  const freshness = computeFreshness(doc.mtimeMs);
  if (freshness > 0) {
    score += freshness;
    reasons.push("recently updated");
  }

  if (score <= 0) {
    return null;
  }

  return {
    path: doc.relPath,
    title: doc.title,
    score,
    snippet: buildSnippet(doc.content, queryTokens),
    kind: doc.kind,
    backlinks: doc.backlinks,
    freshness,
    reasons: uniqueStrings(reasons)
  };
}

function computeFreshness(mtimeMs: number): number {
  const ageDays = Math.max(0, Date.now() - mtimeMs) / 86_400_000;
  if (ageDays <= 1) {
    return 2;
  }
  if (ageDays <= 7) {
    return 1;
  }
  if (ageDays <= 30) {
    return 0.5;
  }
  return 0;
}

function inferPreferredKinds(query: string): SearchPageKind[] {
  const lower = query.toLowerCase();
  const preferred = new Set<SearchPageKind>();

  if (/\b(who|person|people|org|organization|company|product|dataset|project)\b/.test(lower)) {
    preferred.add("entity");
  }
  if (/\b(explain|what is|concept|idea|theme|pattern|method|strategy|trade-off)\b/.test(lower)) {
    preferred.add("concept");
  }
  if (/\b(article|paper|source|document|review|clip)\b/.test(lower)) {
    preferred.add("source");
  }
  if (/\b(summary|overview|catalog|status|recent|changed|question|contradiction|revision|brief)\b/.test(lower)) {
    preferred.add("system");
  }

  return [...preferred];
}

function inferPageKind(relPath: string): SearchPageKind {
  if (relPath.startsWith("wiki/system/")) {
    return "system";
  }
  if (relPath.startsWith("wiki/sources/")) {
    return "source";
  }
  if (relPath.startsWith("wiki/entities/")) {
    return "entity";
  }
  if (relPath.startsWith("wiki/concepts/")) {
    return "concept";
  }
  if (relPath.startsWith("wiki/questions/")) {
    return "question";
  }
  if (relPath.startsWith("wiki/filed/")) {
    return "filed";
  }
  return "other";
}

function extractWikiLinks(markdown: string): string[] {
  return [...markdown.matchAll(/\[\[([^[\]|]+)(?:\|[^\]]+)?\]\]/g)]
    .map((match) => normalizePath((match[1] ?? "").trim()))
    .filter(Boolean);
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

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}
