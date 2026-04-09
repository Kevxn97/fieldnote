export type ReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";
export type WorkflowPhase = "compile" | "ask" | "heal" | "evolve";
export type CompileDepth = "incremental" | "deep";
export type SearchPageKind = "system" | "source" | "entity" | "concept" | "question" | "filed" | "other";

export type AskFormat = "answer" | "report" | "slides" | "chart";

export type SourceKind = "text" | "pdf" | "image" | "directory" | "data";

export interface SourceMetadata {
  sourceUrl?: string;
  authors?: string[];
  published?: string;
  created?: string;
  description?: string;
  tags?: string[];
}

export interface KBConfig {
  name: string;
  model: string;
  directories: {
    raw: string;
    wiki: string;
    outputs: string;
    meta: string;
  };
  openai: {
    models?: Partial<Record<WorkflowPhase, string>>;
    reasoning: {
      compile: ReasoningEffort;
      ask: ReasoningEffort;
      heal: ReasoningEffort;
      evolve: ReasoningEffort;
    };
  };
  compile: {
    maxSourceChars: number;
    maxContextChars: number;
  };
}

export interface ResolvedPaths {
  root: string;
  vaultDir: string;
  clippingsDir: string;
  obsidianDir: string;
  homeFile: string;
  configFile: string;
  rawDir: string;
  wikiDir: string;
  outputDir: string;
  metaDir: string;
  sourcesFile: string;
  buildFile: string;
  promptsDir: string;
}

export interface SourceRecord {
  id: string;
  slug: string;
  title: string;
  kind: SourceKind;
  originalPath: string;
  storedPath: string;
  checksum: string;
  importedAt: string;
  metadata?: SourceMetadata;
  relatedAssets?: string[];
}

export interface BuildState {
  compiledSources: Record<string, { checksum: string; pagePath: string; compiledAt: string }>;
  entityPages: Record<string, { pagePath: string; compiledAt: string }>;
  conceptPages: Record<string, { pagePath: string; compiledAt: string }>;
}

export interface SearchResult {
  path: string;
  title: string;
  score: number;
  snippet: string;
  kind: SearchPageKind;
  backlinks: number;
  freshness: number;
  reasons: string[];
}

export interface ContextPackSummary {
  workflow: "ask" | "review" | "autoresearch";
  createdAt: string;
  title: string;
  query: string;
  budgetChars: number;
  usedChars: number;
  includedFileCount: number;
  prioritizedFileCount: number;
  retrievedFileCount: number;
  includedPaths: string[];
  topResults: Array<{
    path: string;
    title: string;
    score: number;
    kind: SearchPageKind;
  }>;
  artifactPath?: string;
}

export interface CompileResult {
  sourcePages: string[];
  entityPages: string[];
  conceptPages: string[];
  changedSourceIds: string[];
  depth: CompileDepth;
  impactedEntities: string[];
  impactedConcepts: string[];
}

export interface HealResult {
  reportPath: string;
  appliedPaths: string[];
}

export interface EvolveResult {
  archivePath: string;
  contradictionPath: string;
  graphAuditPath: string;
  revisionQueuePath: string;
  rounds: number;
  stoppedEarly: boolean;
  revisedPages: string[];
  createdQuestions: string[];
  createdConcepts: string[];
}
