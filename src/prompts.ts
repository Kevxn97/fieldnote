import { promises as fs } from "node:fs";
import path from "node:path";
import { ResolvedPaths, SourceRecord } from "./types.js";

export async function loadPrompt(paths: ResolvedPaths, filename: string): Promise<string> {
  const promptPath = path.join(paths.promptsDir, filename);
  return fs.readFile(promptPath, "utf8");
}

export async function sourceSummarizerInstructions(paths: ResolvedPaths, source: SourceRecord): Promise<string> {
  const base = await loadPrompt(paths, "source-summarizer.md");
  return `${base.trim()}\n\nSource metadata:\n- Source ID: ${source.id}\n- Title hint: ${source.title}\n- Kind: ${source.kind}\n- Raw file: ${source.storedPath}`;
}

export async function conceptSynthesizerInstructions(paths: ResolvedPaths, conceptName: string): Promise<string> {
  const base = await loadPrompt(paths, "concept-synthesizer.md");
  return `${base.trim()}\n\nTarget concept: ${conceptName}`;
}

export async function comparisonDrafterInstructions(paths: ResolvedPaths, title: string): Promise<string> {
  const base = await loadPrompt(paths, "comparison-drafter.md");
  return `${base.trim()}\n\nTarget comparison page: ${title}`;
}

export async function entitySynthesizerInstructions(paths: ResolvedPaths, entityName: string): Promise<string> {
  const base = await loadPrompt(paths, "entity-synthesizer.md");
  return `${base.trim()}\n\nTarget entity: ${entityName}`;
}

export async function answerInstructions(paths: ResolvedPaths, format: "answer" | "report"): Promise<string> {
  const base = await loadPrompt(paths, "research-answer.md");
  const mode = format === "report" ? "Use a memo-like tone." : "Use a direct answer tone.";
  return `${base.trim()}\n\nAdditional mode:\n- ${mode}`;
}

export async function slidesInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "slides.md");
}

export async function chartInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "chart.md");
}

export async function healInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "heal.md");
}

export async function healApplyInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "heal-apply.md");
}

export async function contradictionAnalystInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "contradiction-analyst.md");
}

export async function graphAuditorInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "graph-auditor.md");
}

export async function revisionManagerInstructions(paths: ResolvedPaths): Promise<string> {
  return loadPrompt(paths, "revision-manager.md");
}

export async function pageReviserInstructions(paths: ResolvedPaths, pagePath: string): Promise<string> {
  const base = await loadPrompt(paths, "page-reviser.md");
  return `${base.trim()}\n\nTarget page: ${pagePath}`;
}
