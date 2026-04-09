import { promises as fs } from "node:fs";
import path from "node:path";
import { runAutoresearch } from "./autoresearch.js";
import { writeWorkspaceBrief } from "./brief.js";
import { initializeProject, loadSources, saveSources } from "./config.js";
import { writeContextPack } from "./context-pack.js";
import { appendLogEntry, refreshNavigationArtifacts } from "./navigation.js";
import { fileOutputIntoWiki, setupObsidianWorkspace } from "./obsidian.js";
import { applySourceReviewSuggestions, reviewSourceRecord } from "./review.js";
import { buildAskContext, searchMarkdown } from "./search.js";
import {
  findLatestClip,
  findLatestImportableClipping,
  ingestPath,
  listImportableClippingFiles,
} from "./source.js";
import { AskFormat, ResolvedPaths, SourceRecord } from "./types.js";
import { uniqueStrings, walkFiles } from "./utils.js";
import {
  answerQuestion,
  compileKnowledgeBase,
  evolveKnowledgeBase,
  healKnowledgeBase,
  promoteSuggestedQuestionsFromOutput,
} from "./wiki.js";

export interface WorkflowRunResult {
  lines: string[];
  watchPaths?: string[];
}

export type ProgressReporter = (message: string) => void;

export async function runInitWorkflow(root: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  await refreshNavigationArtifacts(paths);
  return {
    lines: [
      `Initialized knowledge-base workspace in ${paths.root}`,
      `Config: ${path.relative(root, paths.configFile)}`
    ]
  };
}

export async function runIngestWorkflow(root: string, target: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const sources = await loadSources(paths);
  const { source } = await ingestPath(target, paths, sources);
  const nextSources = sources.filter((item) => item.originalPath !== source.originalPath);
  nextSources.push(source);
  await saveSources(paths, nextSources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: source.title,
    summary: `Imported ${source.kind} source into ${source.storedPath}.`,
    files: [source.storedPath]
  });

  return {
    lines: [`Imported ${source.kind}: ${source.storedPath}`]
  };
}

export async function runAddWorkflow(root: string, target: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const sources = await loadSources(paths);
  const { source } = await ingestPath(target, paths, sources, {
    bucket: inferBucket(target, paths)
  });
  const nextSources = sources.filter((item) => item.originalPath !== source.originalPath);
  nextSources.push(source);
  await saveSources(paths, nextSources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: source.title,
    summary: `Added ${source.kind} source into ${source.storedPath}.`,
    files: [source.storedPath]
  });

  return {
    lines: [`Added ${source.kind}: ${source.storedPath}`]
  };
}

export async function runClipWorkflow(root: string, target: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const sources = await loadSources(paths);
  const { source } = await ingestPath(target, paths, sources, { bucket: "clips" });
  const nextSources = sources.filter((item) => item.originalPath !== source.originalPath);
  nextSources.push(source);
  await saveSources(paths, nextSources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: source.title,
    summary: `Imported clipped source into ${source.storedPath}.`,
    files: [source.storedPath]
  });

  return {
    lines: [`Imported clipped source: ${source.storedPath}`]
  };
}

export async function runClipLatestWorkflow(
  root: string,
  options?: { dir?: string }
): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const latest = await findLatestClip(resolveClippingsDir(root, paths, options?.dir ?? ""));
  if (!latest) {
    throw new Error("No markdown clips found in Clippings.");
  }

  const sources = await loadSources(paths);
  const { source } = await ingestPath(latest, paths, sources, { bucket: "clips" });
  const nextSources = sources.filter((item) => item.originalPath !== source.originalPath);
  nextSources.push(source);
  await saveSources(paths, nextSources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: source.title,
    summary: `Imported latest clip into ${source.storedPath}.`,
    files: [source.storedPath]
  });

  return {
    lines: [`Imported latest clip: ${source.storedPath}`]
  };
}

export async function runAddLatestWorkflow(
  root: string,
  options?: { dir?: string }
): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const latest = await findLatestImportableClipping(resolveClippingsDir(root, paths, options?.dir ?? ""));
  if (!latest) {
    throw new Error("No importable files found in Clippings.");
  }

  const sources = await loadSources(paths);
  const { source } = await ingestPath(latest, paths, sources, { bucket: inferBucket(latest, paths) });
  const nextSources = sources.filter((item) => item.originalPath !== source.originalPath);
  nextSources.push(source);
  await saveSources(paths, nextSources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: source.title,
    summary: `Added latest source into ${source.storedPath}.`,
    files: [source.storedPath]
  });

  return {
    lines: [`Added latest source: ${source.storedPath}`]
  };
}

export async function runImportClippingsWorkflow(
  root: string,
  options?: { dir?: string; limit?: number }
): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const clippingsDir = resolveClippingsDir(root, paths, options?.dir ?? "");
  const files = await listImportableClippingFiles(clippingsDir);
  if (files.length === 0) {
    throw new Error(`No importable files found in ${path.relative(root, clippingsDir) || clippingsDir}`);
  }

  const withTimes = await Promise.all(
    files.map(async (file) => ({
      file,
      stat: await fs.stat(file)
    }))
  );
  withTimes.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs || a.file.localeCompare(b.file));

  const limit = options?.limit ?? 0;
  const selected = Number.isFinite(limit) && limit > 0 ? withTimes.slice(0, limit) : withTimes;

  let sources = await loadSources(paths);
  const imported: string[] = [];

  for (const entry of selected) {
    const { source } = await ingestPath(entry.file, paths, sources, { bucket: inferBucket(entry.file, paths) });
    sources = sources.filter((item) => item.originalPath !== source.originalPath);
    sources.push(source);
    imported.push(source.storedPath);
  }

  await saveSources(paths, sources);
  await appendLogEntry({
    paths,
    kind: "ingest",
    title: "Bulk clipping import",
    summary: `Imported ${imported.length} clipping file(s) from ${path.relative(root, clippingsDir) || clippingsDir}.`,
    files: imported
  });

  return {
    lines: [
      `Imported ${imported.length} clip(s):`,
      ...imported.map((storedPath) => `- ${storedPath}`)
    ]
  };
}

export async function runUpdateWorkflow(
  root: string,
  options?: { dir?: string; progress?: ProgressReporter; deep?: boolean; onWatchPaths?: (paths: string[]) => void }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const clippingsDir = resolveClippingsDir(root, paths, options?.dir ?? "");
  options?.progress?.(`Scanning ${path.relative(root, clippingsDir) || clippingsDir}`);
  const files = await listImportableClippingFiles(clippingsDir);
  const importedOriginals: string[] = [];
  const importedStored: string[] = [];
  const watchPaths = new Set<string>();

  let sources = await loadSources(paths);

  if (files.length > 0) {
    const withTimes = await Promise.all(
      files.map(async (file) => ({
        file,
        stat: await fs.stat(file)
      }))
    );
    withTimes.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs || a.file.localeCompare(b.file));

    for (const entry of withTimes) {
      options?.progress?.(`Importing ${path.basename(entry.file)}`);
      const result = await ingestPath(entry.file, paths, sources, { bucket: inferBucket(entry.file, paths) });
      const { source } = result;
      sources = sources.filter((item) => item.originalPath !== source.originalPath);
      sources.push(source);
      importedOriginals.push(...result.consumedPaths);
      importedStored.push(source.storedPath);
      watchPaths.add(path.resolve(entry.file));
      watchPaths.add(path.join(paths.vaultDir, source.storedPath));
      for (const assetPath of source.relatedAssets ?? []) {
        watchPaths.add(path.join(paths.vaultDir, assetPath));
      }
      options?.onWatchPaths?.(uniqueStrings([...watchPaths]));
    }

    await saveSources(paths, sources);
  }

  options?.progress?.("Compiling workspace");
  const result = await compileKnowledgeBase(config, paths, {
    depth: options?.deep ? "deep" : "incremental",
    progress: options?.progress
  });
  await appendLogEntry({
    paths,
    kind: "update",
    title: "Clippings inbox update",
    summary: `Imported ${importedStored.length} clipping file(s), ran a ${result.depth} wiki sync, and cleaned the processed inbox files.`,
    files: importedStored
  });
  if (importedOriginals.length > 0) {
    options?.progress?.("Cleaning imported clipping files");
    options?.onWatchPaths?.(uniqueStrings(importedOriginals.map((original) => path.resolve(original))));
    await removeImportedClippings(clippingsDir, importedOriginals);
    for (const original of importedOriginals) {
      watchPaths.add(path.resolve(original));
    }
  }

  const lines: string[] = [];
  if (importedStored.length > 0) {
    lines.push(`Imported ${importedStored.length} clipping file(s):`);
    lines.push(...importedStored.map((storedPath) => `- ${storedPath}`));
  } else {
    lines.push("No new clipping files found. Ran sync only.");
  }
  lines.push(...formatCompileLines("Synced", result));
  lines.push(
    `Cleaned ${importedOriginals.length} clipping file(s) from ${path.relative(root, clippingsDir) || clippingsDir}`
  );
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines, watchPaths: uniqueStrings([...watchPaths]) };
}

export async function runCompileWorkflow(
  root: string,
  options?: { progress?: ProgressReporter }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await compileKnowledgeBase(config, paths, {
    depth: "deep",
    progress: options?.progress
  });
  await appendLogEntry({
    paths,
    kind: "compile",
    title: "Wiki compile",
    summary: `Ran a ${result.depth} compile and refreshed ${result.sourcePages.length} source page(s), ${result.entityPages.length} entity page(s), and ${result.conceptPages.length} concept page(s).`,
    files: [...result.sourcePages, ...result.entityPages, ...result.conceptPages].slice(0, 12)
  });

  return {
    lines: [...formatCompileLines("Compiled", result), `Updated ${await writeWorkspaceBrief(root)}`]
  };
}

export async function runSyncWorkflow(
  root: string,
  options?: { deep?: boolean; progress?: ProgressReporter }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await compileKnowledgeBase(config, paths, {
    depth: options?.deep ? "deep" : "incremental",
    progress: options?.progress
  });
  await appendLogEntry({
    paths,
    kind: "sync",
    title: options?.deep ? "Vault sync (deep)" : "Vault sync",
    summary: options?.deep
      ? `Deep-synced ${result.changedSourceIds.length} changed source(s) with a full graph rebuild.`
      : `Synced ${result.changedSourceIds.length} changed source(s) with a targeted graph refresh.`,
    files: [...result.sourcePages, ...result.entityPages, ...result.conceptPages].slice(0, 12)
  });

  return {
    lines: [...formatCompileLines("Synced", result), `Updated ${await writeWorkspaceBrief(root)}`]
  };
}

export async function runReviewWorkflow(
  root: string,
  options?: { sourceSelector?: string; apply?: boolean; budgetChars?: number }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const source = await resolveSourceSelection(paths, options?.sourceSelector);
  const { context, pack } = await buildAskContext(
    paths,
    source.title,
    options?.budgetChars ?? Math.min(config.compile.maxContextChars, 30_000)
  );
  const contextPack = await writeContextPack({
    paths,
    summary: {
      workflow: "review",
      createdAt: new Date().toISOString(),
      title: `Review: ${source.title}`,
      ...pack
    },
    context
  });
  const result = await reviewSourceRecord({
    config,
    paths,
    source,
    wikiContext: context
  });

  let appliedQuestionPaths: string[] = [];
  let reviewQueuePath: string | undefined;
  if (options?.apply) {
    const applied = await applySourceReviewSuggestions({
      paths,
      source,
      reviewPath: result.reviewPath,
      questionCandidates: result.questionCandidates,
      updateCandidates: result.updateCandidates
    });
    appliedQuestionPaths = applied.questionPaths;
    reviewQueuePath = applied.reviewQueuePath;
    await refreshNavigationArtifacts(paths);
  }

  await appendLogEntry({
    paths,
    kind: "review",
    title: source.title,
    summary: options?.apply
      ? `Reviewed ${source.title}, created ${appliedQuestionPaths.length} follow-up question note(s), and updated the review queue.`
      : `Reviewed ${source.title} against the current wiki.`,
    files: [result.reviewPath, ...(reviewQueuePath ? [reviewQueuePath] : []), ...appliedQuestionPaths]
  });

  const lines = [`Reviewed source: ${source.title}`, `Wrote ${result.reviewPath}`];
  if (result.questionCandidates.length > 0) {
    lines.push(`Open questions found: ${result.questionCandidates.length}`);
    lines.push(...result.questionCandidates.map((question) => `- ${question}`));
  }
  if (result.updateCandidates.length > 0) {
    lines.push(`Suggested wiki updates: ${result.updateCandidates.length}`);
    lines.push(...result.updateCandidates.map((item) => `- ${item}`));
  }
  if (appliedQuestionPaths.length > 0) {
    lines.push(`Created follow-up question notes: ${appliedQuestionPaths.length}`);
    lines.push(...appliedQuestionPaths.map((relPath) => `- ${relPath}`));
  }
  if (reviewQueuePath) {
    lines.push(`Updated ${reviewQueuePath}`);
  }
  lines.push(`Saved context pack ${contextPack.artifactPath}`);
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines };
}

export async function runAskWorkflow(
  root: string,
  options: { question: string; format: AskFormat; fileIntoWiki?: boolean; budgetChars?: number }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await answerQuestion({
    config,
    paths,
    question: options.question,
    format: options.format,
    fileIntoWiki: options.fileIntoWiki,
    budgetChars: options.budgetChars
  });
  await appendLogEntry({
    paths,
    kind: "ask",
    title: options.question,
    summary: `Generated a ${options.format} answer${result.filedPath ? " and filed it back into the wiki" : ""}.`,
    files: [result.outputPath, ...(result.filedPath ? [result.filedPath] : []), ...result.questionPaths]
  });

  const lines = [`Wrote ${result.outputPath}`];
  if (result.validationWarnings.length > 0) {
    lines.push("Chart validation warnings:");
    lines.push(...result.validationWarnings.map((warning) => `- ${warning}`));
  }
  if (result.filedPath) {
    lines.push(`Filed into ${result.filedPath}`);
  }
  if (result.questionPaths.length > 0) {
    lines.push(`Created ${result.questionPaths.length} follow-up question note(s):`);
    lines.push(...result.questionPaths.map((relPath) => `- ${relPath}`));
  }
  if (result.contextPackPath) {
    lines.push(`Saved context pack ${result.contextPackPath}`);
  }
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines };
}

export async function runAutoresearchWorkflow(
  root: string,
  options: {
    question: string;
    format: "report" | "slides" | "chart";
    title?: string;
    rounds?: number;
    maxSubqueries?: number;
    maxResultsPerQuery?: number;
    budgetChars?: number;
    fileIntoWiki?: boolean;
    progress?: ProgressReporter;
  }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await runAutoresearch({
    config,
    paths,
    question: options.question,
    options: {
      format: options.format,
      title: options.title,
      rounds: options.rounds,
      maxSubqueries: options.maxSubqueries,
      maxResultsPerQuery: options.maxResultsPerQuery,
      budgetChars: options.budgetChars,
      progress: options.progress
    }
  });

  let filedPath: string | undefined;
  let questionPaths: string[] = [];
  if (options.fileIntoWiki && result.outputPath) {
    filedPath = await fileOutputIntoWiki({
      root: paths.root,
      paths,
      outputPath: path.join(paths.vaultDir, result.outputPath),
      title: options.title ?? options.question
    });
    questionPaths = await promoteSuggestedQuestionsFromOutput(paths, result.outputPath, result.report, ["question", "research"]);
    await refreshNavigationArtifacts(paths);
  }

  await appendLogEntry({
    paths,
    kind: "research",
    title: options.title ?? options.question,
    summary: `Ran autoresearch in ${options.format} mode over ${result.evidence.length} evidence group(s).`,
    files: [result.outputPath ?? "", ...(filedPath ? [filedPath] : []), ...questionPaths].filter(Boolean)
  });

  const lines: string[] = [];
  if (result.outputPath) {
    lines.push(`Wrote ${result.outputPath}`);
  }
  lines.push(`Subqueries: ${result.plan.subqueries.length}`);
  lines.push(`Evidence groups: ${result.evidence.length}`);
  if (result.contextPackPath) {
    lines.push(`Saved context pack ${result.contextPackPath}`);
  }
  if (filedPath) {
    lines.push(`Filed into ${filedPath}`);
  }
  if (questionPaths.length > 0) {
    lines.push(`Created follow-up question notes: ${questionPaths.length}`);
    lines.push(...questionPaths.map((relPath) => `- ${relPath}`));
  }
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines };
}

export async function runHealWorkflow(
  root: string,
  options?: { apply?: boolean }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await healKnowledgeBase(config, paths, { apply: options?.apply });
  await appendLogEntry({
    paths,
    kind: "heal",
    title: options?.apply ? "Health check with apply" : "Health check",
    summary: options?.apply
      ? `Wrote a health report and applied ${result.appliedPaths.length} additive wiki change(s).`
      : "Wrote a health report without applying follow-up changes.",
    files: [result.reportPath, ...result.appliedPaths]
  });

  const lines = [`Wrote ${result.reportPath}`];
  if (result.appliedPaths.length > 0) {
    lines.push(`Applied ${result.appliedPaths.length} additive heal change(s):`);
    lines.push(...result.appliedPaths.map((relPath) => `- ${relPath}`));
  } else if (options?.apply) {
    lines.push("No new additive heal changes were created.");
  }
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines };
}

export async function runEvolveWorkflow(
  root: string,
  options?: { maxPages?: number; rounds?: number; untilStable?: boolean; progress?: ProgressReporter }
): Promise<WorkflowRunResult> {
  const { config, paths } = await initializeProject(root);
  const result = await evolveKnowledgeBase(config, paths, {
    maxPages: options?.maxPages,
    rounds: options?.rounds,
    untilStable: options?.untilStable,
    progress: options?.progress
  });
  await appendLogEntry({
    paths,
    kind: "evolve",
    title: "Wiki evolution loop",
    summary: `Completed ${result.rounds} evolution round(s), revised ${result.revisedPages.length} page(s), and created ${result.createdQuestions.length} question note(s).`,
    files: [
      result.archivePath,
      result.contradictionPath,
      result.graphAuditPath,
      result.revisionQueuePath,
      ...result.revisedPages,
      ...result.createdQuestions,
      ...result.createdConcepts
    ].slice(0, 20)
  });

  const lines = [
    `Wrote ${result.archivePath}`,
    `Rounds: ${result.rounds}`,
    ...(result.stoppedEarly ? ["Stopped early after reaching a quiet/stable round."] : []),
    `Updated ${result.contradictionPath}`,
    `Updated ${result.graphAuditPath}`,
    `Updated ${result.revisionQueuePath}`,
    `Revised pages: ${result.revisedPages.length}`,
    ...result.revisedPages.map((relPath) => `- ${relPath}`)
  ];
  if (result.createdQuestions.length > 0) {
    lines.push(`Created question notes: ${result.createdQuestions.length}`);
    lines.push(...result.createdQuestions.map((relPath) => `- ${relPath}`));
  }
  if (result.createdConcepts.length > 0) {
    lines.push(`Created concept drafts: ${result.createdConcepts.length}`);
    lines.push(...result.createdConcepts.map((relPath) => `- ${relPath}`));
  }
  lines.push(`Updated ${await writeWorkspaceBrief(root)}`);

  return { lines };
}

export async function runSearchWorkflow(
  root: string,
  options: { query: string; limit?: number }
): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const results = await searchMarkdown(paths.wikiDir, options.query, options.limit ?? 8);
  if (results.length === 0) {
    return { lines: ["No results."] };
  }

  const lines: string[] = [];
  for (const result of results) {
    lines.push(`${result.score.toFixed(2).padStart(6, " ")}  ${result.path}`);
    lines.push(`      ${result.title}`);
    lines.push(`      ${result.kind} · backlinks ${result.backlinks} · ${result.reasons.slice(0, 2).join(", ")}`);
    lines.push(`      ${result.snippet}`);
  }
  return { lines };
}

export async function runStatusWorkflow(root: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const sources = await loadSources(paths);
  const wikiPages = (await walkFiles(paths.wikiDir)).filter((file) => file.endsWith(".md"));

  return {
    lines: [
      `Sources: ${sources.length}`,
      `Markdown pages: ${wikiPages.length}`,
      `Vault dir: ${path.relative(root, paths.vaultDir)}`,
      `Raw dir: ${path.relative(root, paths.rawDir)}`,
      `Wiki dir: ${path.relative(root, paths.wikiDir)}`,
      `Outputs dir: ${path.relative(root, paths.outputDir)}`
    ]
  };
}

export async function runObsidianSetupWorkflow(root: string): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const written = await setupObsidianWorkspace(root, paths);
  if (written.length === 0) {
    return { lines: ["Obsidian support files already exist."] };
  }

  return {
    lines: ["Created:", ...written.map((file) => `- ${file}`)]
  };
}

export async function runFileOutputWorkflow(
  root: string,
  options: { output: string; title?: string }
): Promise<WorkflowRunResult> {
  const { paths } = await initializeProject(root);
  const relPath = await fileOutputIntoWiki({
    root,
    paths,
    outputPath: options.output,
    title: options.title
  });

  return {
    lines: [`Filed ${relPath}`]
  };
}

export function inferBucket(target: string, paths: ResolvedPaths): "files" | "clips" {
  const absolute = path.resolve(target);
  const relativeToVault = path.relative(paths.vaultDir, absolute).replace(/\\/g, "/");
  const ext = path.extname(absolute).toLowerCase();
  if ((ext === ".md" || ext === ".pdf") && (relativeToVault.startsWith("Clippings/") || absolute.includes(`${path.sep}Clippings${path.sep}`))) {
    return "clips";
  }
  return "files";
}

export function resolveClippingsDir(root: string, paths: ResolvedPaths, explicitDir: string): string {
  if (explicitDir) {
    return path.resolve(root, explicitDir);
  }

  const candidates = [paths.clippingsDir, path.join(root, "Clippings")];
  return candidates[0] ?? path.join(root, "Clippings");
}

export async function removeImportedClippings(clippingsDir: string, files: string[]): Promise<void> {
  for (const file of files) {
    await fs.rm(file, { force: true });
    await removeEmptyParentDirs(path.dirname(file), clippingsDir);
  }
}

export async function resolveSourceSelection(paths: ResolvedPaths, selector?: string): Promise<SourceRecord> {
  const sources = await loadSources(paths);
  if (sources.length === 0) {
    throw new Error("No sources found yet. Import something first with `kb add`, `kb add-latest`, or `kb update`.");
  }

  const ordered = [...sources].sort((a, b) => b.importedAt.localeCompare(a.importedAt));
  if (!selector || selector.trim().toLowerCase() === "latest") {
    return ordered[0];
  }

  const needle = selector.trim().toLowerCase();
  const exactMatches = ordered.filter((source) =>
    [
      source.id,
      source.slug,
      source.title,
      source.storedPath,
      source.originalPath,
      path.basename(source.originalPath),
      path.basename(source.storedPath)
    ].some((value) => value.toLowerCase() === needle)
  );
  if (exactMatches.length === 1) {
    return exactMatches[0];
  }
  if (exactMatches.length > 1) {
    throw new Error(buildAmbiguousSourceError(selector, exactMatches));
  }

  const partialMatches = ordered.filter((source) =>
    [source.title, source.slug, source.storedPath, source.originalPath, path.basename(source.originalPath), path.basename(source.storedPath)]
      .some((value) => value.toLowerCase().includes(needle))
  );
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }
  if (partialMatches.length > 1) {
    throw new Error(buildAmbiguousSourceError(selector, partialMatches));
  }

  throw new Error(`No source matched "${selector}". Use \`kb status\` or inspect \`.kb/sources.json\` to find a valid source identifier.`);
}

async function removeEmptyParentDirs(startDir: string, stopDir: string): Promise<void> {
  let current = startDir;
  const absoluteStopDir = path.resolve(stopDir);

  while (current.startsWith(absoluteStopDir) && current !== absoluteStopDir) {
    const entries = await fs.readdir(current);
    if (entries.length > 0) {
      return;
    }
    await fs.rmdir(current);
    current = path.dirname(current);
  }
}

function buildAmbiguousSourceError(selector: string, matches: SourceRecord[]): string {
  const preview = matches
    .slice(0, 5)
    .map((source) => `- ${source.title} (${source.storedPath})`)
    .join("\n");
  return `Source selector "${selector}" matched multiple sources:\n${preview}`;
}

function formatCompileLines(
  verb: "Compiled" | "Synced",
  result: Awaited<ReturnType<typeof compileKnowledgeBase>>
): string[] {
  return [
    `${verb} ${result.changedSourceIds.length} changed source(s).`,
    `Graph refresh: ${result.depth === "deep" ? "deep rebuild" : "targeted incremental"}`,
    `Source pages refreshed: ${result.sourcePages.length}`,
    `Impacted entities: ${result.impactedEntities.length}`,
    `Entity pages refreshed: ${result.entityPages.length}`,
    `Impacted concepts: ${result.impactedConcepts.length}`,
    `Concept pages refreshed: ${result.conceptPages.length}`
  ];
}
