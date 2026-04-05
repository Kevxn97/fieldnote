import { promises as fs } from "node:fs";
import path from "node:path";
import { loadBuildState, loadSources, resolveModelForPhase, saveBuildState } from "./config.js";
import { refreshNavigationArtifacts } from "./navigation.js";
import { createOpenAIClient, requireOpenAIConfigured, runTextResponse } from "./openai.js";
import {
  answerInstructions,
  chartInstructions,
  comparisonDrafterInstructions,
  conceptSynthesizerInstructions,
  contradictionAnalystInstructions,
  entitySynthesizerInstructions,
  graphAuditorInstructions,
  healApplyInstructions,
  healInstructions,
  pageReviserInstructions,
  revisionManagerInstructions,
  slidesInstructions,
  sourceSummarizerInstructions
} from "./prompts.js";
import { buildReadableOutputPath, validateChartMarkdown } from "./output-formats.js";
import { buildAskContext } from "./search.js";
import { buildSourceBundle, collectSourceImageInputs, extractConcepts, extractEntities } from "./source.js";
import { AskFormat, CompileDepth, CompileResult, EvolveResult, HealResult, KBConfig, ResolvedPaths, SourceRecord } from "./types.js";
import {
  buildFrontmatter,
  extractFrontmatterBlock,
  extractFirstHeading,
  listManagedSections,
  managedSection,
  slugifyValue,
  stripFrontmatter,
  stripFirstHeading,
  stripManagedSections,
  timestamp,
  toWikiLink,
  uniqueStrings,
  upsertManagedSection,
  walkFiles
} from "./utils.js";

export async function compileKnowledgeBase(
  config: KBConfig,
  paths: ResolvedPaths,
  options?: { depth?: CompileDepth; progress?: (message: string) => void }
): Promise<CompileResult> {
  requireOpenAIConfigured();
  const depth = options?.depth ?? "deep";
  const progress = options?.progress;
  const sources = await loadSources(paths);
  const buildState = await loadBuildState(paths);
  const removedEntries = await collectRemovedCompiledSourceEntries(paths, buildState, sources);
  pruneCompiledSourceState(buildState, sources);
  const changed = await resolveChangedSources(paths, sources, buildState);
  const changedSourceIds = changed.map((source) => source.id);
  const previousEntries = await collectExistingSourcePageEntries(paths, changed);
  const sourcePages: string[] = [];

  if (changed.length === 0) {
    emitCompileProgress(progress, depth === "deep" ? "no changed sources; refreshing graph + navigation" : "no changed sources; refreshing navigation");
  }

  let sourceIndex = 0;
  for (const source of changed) {
    sourceIndex += 1;
    emitCompileProgress(progress, `source ${sourceIndex}/${changed.length}: ${source.title}`);
    const bundle = await buildSourceBundle(source, config, paths);
    const imagePaths = await collectSourceImageInputs(source, paths);
    const instructions = await sourceSummarizerInstructions(paths, source);
    const generated = await runTextResponse({
      model: resolveModelForPhase(config, "compile"),
      instructions,
      input: bundle,
      reasoningEffort: config.openai.reasoning.compile,
      imagePaths
    });
    const pagePath = await writeSourcePage(paths, source, generated);
    buildState.compiledSources[source.id] = {
      checksum: source.checksum,
      pagePath,
      compiledAt: timestamp()
    };
    sourcePages.push(pagePath);
  }

  emitCompileProgress(progress, "collecting source graph");
  const sourcePageMap = await collectSourcePages(paths, sources);
  const entityMap = buildEntityMap(sourcePageMap);
  const conceptMap = buildConceptMap(sourcePageMap);
  const currentEntries = changed.map((source) => sourcePageMap.get(source.id));
  const impacted = resolveKnowledgeRefreshTargets({
    depth,
    allEntities: [...entityMap.keys()],
    allConcepts: [...conceptMap.keys()],
    previousEntries: [...removedEntries, ...previousEntries.values()],
    currentEntries
  });

  emitCompileProgress(
    progress,
    depth === "deep"
      ? `deep graph rebuild: ${impacted.entities.length} entities, ${impacted.concepts.length} concepts`
      : `incremental graph refresh: ${impacted.entities.length} entities, ${impacted.concepts.length} concepts`
  );
  const entityPages = await synthesizeEntityPages(config, paths, entityMap, buildState, {
    targets: impacted.entities,
    progress
  });
  const conceptPages = await synthesizeConceptPages(config, paths, conceptMap, buildState, {
    targets: impacted.concepts,
    progress
  });

  emitCompileProgress(progress, "refreshing managed sections");
  await refreshManagedSections(paths, sourcePageMap, entityMap, conceptMap, {
    sourceIds: depth === "deep" ? undefined : changedSourceIds,
    entityNames: impacted.entities,
    conceptNames: impacted.concepts
  });
  emitCompileProgress(progress, "refreshing navigation artifacts");
  await refreshNavigationArtifacts(paths);
  await saveBuildState(paths, buildState);

  return {
    sourcePages,
    entityPages,
    conceptPages,
    changedSourceIds,
    depth,
    impactedEntities: impacted.entities,
    impactedConcepts: impacted.concepts
  };
}

export async function answerQuestion(args: {
  config: KBConfig;
  paths: ResolvedPaths;
  question: string;
  format: AskFormat;
  fileIntoWiki?: boolean;
}): Promise<{ outputPath: string; filedPath?: string; questionPaths: string[]; validationWarnings: string[] }> {
  requireOpenAIConfigured();
  const { config, paths, question, format, fileIntoWiki } = args;
  const { context, results } = await buildAskContext(paths, question, config.compile.maxContextChars);
  if (!context.trim()) {
    throw new Error("No wiki context found. Run `kb compile` first.");
  }

  const instructions =
    format === "slides"
      ? await slidesInstructions(paths)
      : format === "chart"
        ? await chartInstructions(paths)
        : await answerInstructions(paths, format === "report" ? "report" : "answer");

  const input = [
    `Question: ${question}`,
    "",
    "Retrieved context:",
    context,
    "",
    "Retrieved file shortlist:",
    ...results.map((result) => `- ${result.path}`)
  ].join("\n");

  const output = await runTextResponse({
    model: resolveModelForPhase(config, "ask"),
    instructions,
    input,
    reasoningEffort: config.openai.reasoning.ask
  });

  const validationWarnings = format === "chart" ? validateChartMarkdown(output).errors : [];
  const outputPath = await writeAnswerFile(paths, question, format, output, results.map((result) => result.path), validationWarnings);
  const filedPath = fileIntoWiki
      ? await import("./obsidian.js").then(({ fileOutputIntoWiki }) =>
        fileOutputIntoWiki({
          root: paths.root,
          paths,
          outputPath: path.join(paths.vaultDir, outputPath),
          title: question
        })
      )
    : undefined;
  const questionPaths = fileIntoWiki ? await promoteSuggestedQuestionsFromOutput(paths, outputPath, output, ["question", "query"]) : [];
  if (fileIntoWiki && questionPaths.length > 0) {
    await refreshNavigationArtifacts(paths);
  }

  return { outputPath, filedPath, questionPaths, validationWarnings };
}

export async function evolveKnowledgeBase(
  config: KBConfig,
  paths: ResolvedPaths,
  options?: { maxPages?: number; rounds?: number; untilStable?: boolean; progress?: (message: string) => void }
): Promise<EvolveResult> {
  requireOpenAIConfigured();
  const maxPages = Math.max(1, Math.min(options?.maxPages ?? 4, 8));
  const untilStable = options?.untilStable ?? false;
  const rounds = Math.max(1, Math.min(options?.rounds ?? (untilStable ? 4 : 2), untilStable ? 6 : 3));
  const progress = options?.progress;
  let contradictionPath = "wiki/system/contradictions.md";
  let graphAuditPath = "wiki/system/graph-audit.md";
  let revisionQueuePath = "wiki/system/revision-queue.md";
  const contradictionSections: string[] = [];
  const graphAuditSections: string[] = [];
  const revisionSections: string[] = [];
  const revisedPages = new Set<string>();
  const createdQuestions = new Set<string>();
  const createdConcepts = new Set<string>();
  let completedRounds = 0;
  let stoppedEarly = false;

  for (let round = 1; round <= rounds; round += 1) {
    emitProgress(progress, `round ${round}/${rounds}: building evolve context`);
    const wikiContext = await buildEvolveContext(paths, config.compile.maxContextChars);
    if (!wikiContext.trim()) {
      throw new Error("No wiki context found. Run `kb sync` first.");
    }

    emitProgress(progress, `round ${round}/${rounds}: running contradiction analyst`);
    const [contradictionReport, graphAudit] = await Promise.all([
      runTextResponse({
        model: resolveModelForPhase(config, "evolve"),
        instructions: await contradictionAnalystInstructions(paths),
        input: wikiContext,
        reasoningEffort: config.openai.reasoning.evolve
      }),
      runTextResponse({
        model: resolveModelForPhase(config, "evolve"),
        instructions: await graphAuditorInstructions(paths),
        input: wikiContext,
        reasoningEffort: config.openai.reasoning.evolve
      })
    ]);
    emitProgress(progress, `round ${round}/${rounds}: running revision manager`);

    const managerInput = [
      `Evolution round: ${round} of ${rounds}`,
      "",
      "Wiki context:",
      wikiContext,
      "",
      "Contradiction analyst report:",
      contradictionReport,
      "",
      "Graph auditor report:",
      graphAudit
    ].join("\n");

    const revisionPlan = await runTextResponse({
      model: resolveModelForPhase(config, "evolve"),
      instructions: await revisionManagerInstructions(paths),
      input: managerInput,
      reasoningEffort: config.openai.reasoning.evolve
    });

    contradictionSections.push(`## Round ${round} of ${rounds}\n\n${contradictionReport.trim()}`);
    graphAuditSections.push(`## Round ${round} of ${rounds}\n\n${graphAudit.trim()}`);
    revisionSections.push(`## Round ${round} of ${rounds}\n\n${revisionPlan.trim()}`);

    contradictionPath = await writeSystemArtifact(paths, "contradictions.md", {
      title: "Contradictions Tracker",
      tags: ["index", "contradictions", "evolve"],
      body: contradictionSections.join("\n\n")
    });
    graphAuditPath = await writeSystemArtifact(paths, "graph-audit.md", {
      title: "Graph Audit",
      tags: ["index", "graph-audit", "evolve"],
      body: graphAuditSections.join("\n\n")
    });
    revisionQueuePath = await writeSystemArtifact(paths, "revision-queue.md", {
      title: "Revision Queue",
      tags: ["index", "revision-queue", "evolve"],
      body: revisionSections.join("\n\n")
    });
    emitProgress(progress, `round ${round}/${rounds}: updated system trackers`);

    const sourcePages = await collectSourcePages(paths, await loadSources(paths));
    const entityMap = buildEntityMap(sourcePages);
    const conceptMap = buildConceptMap(sourcePages);
    const revisionTargets = parsePathReasonBullets(revisionPlan, "Priority Revision Targets").slice(0, maxPages);
    emitProgress(progress, `round ${round}/${rounds}: selected ${revisionTargets.length} revision targets`);

    let targetIndex = 0;
    for (const target of revisionTargets) {
      targetIndex += 1;
      emitProgress(progress, `round ${round}/${rounds}: revising ${targetIndex}/${revisionTargets.length} ${target.path}`);
      const revisedPath = await reviseWikiPage(config, paths, {
        pagePath: target.path,
        rationale: target.rationale,
        contradictionReport,
        graphAudit,
        revisionPlan,
        sourcePages,
        entityMap,
        conceptMap
      });
      if (revisedPath) {
        revisedPages.add(revisedPath);
      }
    }

    emitProgress(progress, `round ${round}/${rounds}: creating follow-up questions`);
    const questionPaths = await createQuestionNotesFromList(paths, collectEvolveQuestionCandidates(revisionPlan), {
      tags: ["question", "evolve"],
      sourceField: "source_report",
      sourcePath: revisionQueuePath,
      whyLine: `- Generated by ${toWikiLink(revisionQueuePath)} during \`kb evolve\`.`
    });
    for (const relPath of questionPaths) {
      createdQuestions.add(relPath);
    }

    emitProgress(progress, `round ${round}/${rounds}: creating concept drafts`);
    const conceptPaths = await createConceptDraftsFromList(
      config,
      paths,
      collectEvolveConceptCandidates(revisionPlan),
      revisionQueuePath,
      wikiContext,
      contradictionReport,
      revisionPlan
    );
    for (const relPath of conceptPaths) {
      createdConcepts.add(relPath);
    }

    await refreshNavigationArtifacts(paths);
    completedRounds = round;
    emitProgress(progress, `round ${round}/${rounds}: refreshed navigation`);

    const roundWasQuiet = revisionTargets.length === 0 && questionPaths.length === 0 && conceptPaths.length === 0;
    if (untilStable && roundWasQuiet) {
      stoppedEarly = round < rounds;
      emitProgress(progress, `round ${round}/${rounds}: stable round reached, stopping early`);
      break;
    }
  }

  emitProgress(progress, "writing evolve archive");
  const archivePath = await writeEvolutionArchive(
    paths,
    contradictionSections.join("\n\n"),
    graphAuditSections.join("\n\n"),
    revisionSections.join("\n\n"),
    [...revisedPages],
    [...createdQuestions],
    [...createdConcepts]
  );
  await refreshNavigationArtifacts(paths);
  emitProgress(progress, `wrote ${archivePath}`);

  return {
    archivePath,
    contradictionPath,
    graphAuditPath,
    revisionQueuePath,
    rounds: completedRounds || rounds,
    stoppedEarly,
    revisedPages: [...revisedPages],
    createdQuestions: [...createdQuestions],
    createdConcepts: [...createdConcepts]
  };
}

export async function healKnowledgeBase(config: KBConfig, paths: ResolvedPaths, options?: { apply?: boolean }): Promise<HealResult> {
  const sources = await loadSources(paths);
  const sourcePages = await collectSourcePages(paths, sources);
  const entityMap = buildEntityMap(sourcePages);
  const conceptMap = buildConceptMap(sourcePages);
  const orphanEntities = await findOrphanEntityPages(paths, entityMap);
  const orphanConcepts = await findOrphanConceptPages(paths, conceptMap);
  const pagesMissingEntities = [...sourcePages.values()]
    .filter((entry) => entry.entities.length === 0)
    .map((entry) => entry.pagePath);
  const pagesMissingConcepts = [...sourcePages.values()]
    .filter((entry) => entry.concepts.length === 0)
    .map((entry) => entry.pagePath);

  const deterministicFindings = [
    `Source count: ${sources.length}`,
    `Compiled source pages: ${sourcePages.size}`,
    `Entity count: ${entityMap.size}`,
    `Concept count: ${conceptMap.size}`,
    `Source pages missing entities: ${pagesMissingEntities.length}`,
    `Source pages missing concepts: ${pagesMissingConcepts.length}`,
    `Orphan entity pages: ${orphanEntities.length}`,
    `Orphan concept pages: ${orphanConcepts.length}`
  ].join("\n");

  let reportBody = [
    "# Knowledge Base Health Report",
    "",
    "## Deterministic Findings",
    ...deterministicFindings.split("\n").map((line) => `- ${line}`),
    "",
    "## Pages Missing Entities",
    ...(pagesMissingEntities.length ? pagesMissingEntities.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Pages Missing Concepts",
    ...(pagesMissingConcepts.length ? pagesMissingConcepts.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Orphan Entity Pages",
    ...(orphanEntities.length ? orphanEntities.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Orphan Concept Pages",
    ...(orphanConcepts.length ? orphanConcepts.map((item) => `- ${item}`) : ["- None"])
  ].join("\n");

  if (sources.length > 0) {
    requireOpenAIConfigured();
    const instructions = await healInstructions(paths);
    const input = [
      "Deterministic findings:",
      deterministicFindings,
      "",
      "Current source index:",
      ...[...sourcePages.values()].map((entry) => `- ${entry.pagePath}: ${entry.title}`),
      "",
      "Current entity index:",
      ...[...entityMap.keys()].map((entity) => `- ${entity}`),
      "",
      "Current concept index:",
      ...[...conceptMap.keys()].map((concept) => `- ${concept}`)
    ].join("\n");

    const generated = await runTextResponse({
      model: resolveModelForPhase(config, "heal"),
      instructions,
      input,
      reasoningEffort: config.openai.reasoning.heal
    });
    reportBody = `${reportBody}\n\n${generated.trim()}`;
  }

  const filePath = path.join(paths.outputDir, "health", `${timestamp().slice(0, 19).replace(/[:T]/g, "-")}-health.md`);
  await fs.writeFile(filePath, `${reportBody.trim()}\n`, "utf8");
  const reportPath = path.relative(paths.root, filePath).replace(/\\/g, "/");
  const appliedPaths = options?.apply
    ? await applyHealSuggestions(
        config,
        paths,
        reportPath,
        reportBody,
        pagesMissingEntities,
        pagesMissingConcepts,
        orphanEntities,
        orphanConcepts,
        sourcePages,
        entityMap,
        conceptMap
      )
    : [];
  if (options?.apply && appliedPaths.length > 0) {
    await refreshNavigationArtifacts(paths);
  }
  return { reportPath, appliedPaths };
}

export function extractBulletItemsFromSection(markdown: string, heading: string): string[] {
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

export function collectHealActionItems(args: {
  reportBody: string;
  pagesMissingEntities: string[];
  pagesMissingConcepts: string[];
  orphanEntities: string[];
  orphanConcepts: string[];
}): string[] {
  const llmSuggestedRepairs = extractBulletItemsFromSection(args.reportBody, "Suggested Repairs");
  const deterministicMissingEntities = args.pagesMissingEntities.map(
    (pagePath) => `Review and add entity coverage for ${toWikiLink(pagePath)}`
  );
  const deterministicMissingConcepts = args.pagesMissingConcepts.map(
    (pagePath) => `Review and add concept coverage for ${toWikiLink(pagePath)}`
  );
  const deterministicOrphanEntities = args.orphanEntities.map(
    (pagePath) => `Review whether orphan entity page ${toWikiLink(pagePath)} should be refreshed, merged, or removed`
  );
  const deterministicOrphans = args.orphanConcepts.map(
    (pagePath) => `Review whether orphan concept page ${toWikiLink(pagePath)} should be refreshed, merged, or removed`
  );

  return uniqueStrings([
    ...deterministicMissingEntities,
    ...deterministicMissingConcepts,
    ...deterministicOrphanEntities,
    ...deterministicOrphans,
    ...llmSuggestedRepairs
  ]);
}

export function collectHealArticleCandidates(reportBody: string): string[] {
  return extractBulletItemsFromSection(reportBody, "High-Value New Article Candidates");
}

export function parsePathReasonBullets(markdown: string, heading: string): Array<{ path: string; rationale: string }> {
  return extractBulletItemsFromSection(markdown, heading)
    .map((item) => {
      const [rawPath, ...rest] = item.split("|");
      const normalizedPath = rawPath?.trim() ?? "";
      return {
        path: normalizedPath,
        rationale: rest.join("|").trim()
      };
    })
    .filter((item) => item.path.endsWith(".md"));
}

export function collectEvolveQuestionCandidates(markdown: string): string[] {
  return extractBulletItemsFromSection(markdown, "New Question Candidates");
}

export function collectEvolveConceptCandidates(markdown: string): string[] {
  return extractBulletItemsFromSection(markdown, "New Concept Candidates");
}

interface SourcePageEntry {
  source: SourceRecord;
  pagePath: string;
  title: string;
  markdown: string;
  entities: string[];
  concepts: string[];
}

interface SourceGraphSlice {
  entities: string[];
  concepts: string[];
}

function emitCompileProgress(progress: ((message: string) => void) | undefined, message: string): void {
  progress?.(message);
}

function pruneCompiledSourceState(
  buildState: Awaited<ReturnType<typeof loadBuildState>>,
  sources: SourceRecord[]
): void {
  const activeSourceIds = new Set(sources.map((source) => source.id));
  for (const sourceId of Object.keys(buildState.compiledSources)) {
    if (!activeSourceIds.has(sourceId)) {
      delete buildState.compiledSources[sourceId];
    }
  }
}

async function resolveChangedSources(
  paths: ResolvedPaths,
  sources: SourceRecord[],
  buildState: Awaited<ReturnType<typeof loadBuildState>>
): Promise<SourceRecord[]> {
  const checks = await Promise.all(
    sources.map(async (source) => {
      const compiled = buildState.compiledSources[source.id];
      if (!compiled || compiled.checksum !== source.checksum) {
        return true;
      }

      const pagePath = compiled.pagePath || path.join("wiki", "sources", `${source.slug}.md`).replace(/\\/g, "/");
      return !(await fileExists(path.join(paths.vaultDir, pagePath)));
    })
  );

  return sources.filter((_, index) => checks[index]);
}

async function collectRemovedCompiledSourceEntries(
  paths: ResolvedPaths,
  buildState: Awaited<ReturnType<typeof loadBuildState>>,
  sources: SourceRecord[]
): Promise<SourceGraphSlice[]> {
  const activeSourceIds = new Set(sources.map((source) => source.id));
  const removedEntries = Object.entries(buildState.compiledSources).filter(([sourceId]) => !activeSourceIds.has(sourceId));

  const graphEntries = await Promise.all(
    removedEntries.map(async ([, entry]) => {
      const absolute = path.join(paths.vaultDir, entry.pagePath);
      try {
        const markdown = await fs.readFile(absolute, "utf8");
        const graphEntry: SourceGraphSlice = {
          entities: extractEntities(markdown),
          concepts: extractConcepts(markdown)
        };
        return graphEntry;
      } catch {
        return null;
      }
    })
  );

  return graphEntries.filter((entry): entry is SourceGraphSlice => Boolean(entry));
}

async function collectExistingSourcePageEntries(
  paths: ResolvedPaths,
  sources: SourceRecord[]
): Promise<Map<string, SourceGraphSlice>> {
  const entries = await Promise.all(
    sources.map(async (source) => {
      const relPath = path.join("wiki", "sources", `${source.slug}.md`).replace(/\\/g, "/");
      const absolute = path.join(paths.vaultDir, relPath);
      try {
        const markdown = await fs.readFile(absolute, "utf8");
        const entry: SourceGraphSlice = {
          entities: extractEntities(markdown),
          concepts: extractConcepts(markdown)
        };
        return [source.id, entry] as const;
      } catch {
        return null;
      }
    })
  );

  return new Map(entries.filter((entry): entry is readonly [string, SourceGraphSlice] => entry !== null));
}

export function collectImpactedKnowledgeNodes(
  previousEntries: Array<SourceGraphSlice | undefined>,
  currentEntries: Array<SourceGraphSlice | undefined>
): { entities: string[]; concepts: string[] } {
  const slices = [...previousEntries, ...currentEntries].filter((entry): entry is SourceGraphSlice => Boolean(entry));
  return {
    entities: uniqueStrings(slices.flatMap((entry) => entry.entities)),
    concepts: uniqueStrings(slices.flatMap((entry) => entry.concepts))
  };
}

export function resolveKnowledgeRefreshTargets(args: {
  depth: CompileDepth;
  allEntities: string[];
  allConcepts: string[];
  previousEntries: Array<SourceGraphSlice | undefined>;
  currentEntries: Array<SourceGraphSlice | undefined>;
}): { entities: string[]; concepts: string[] } {
  if (args.depth === "deep") {
    return {
      entities: uniqueStrings(args.allEntities),
      concepts: uniqueStrings(args.allConcepts)
    };
  }

  return collectImpactedKnowledgeNodes(args.previousEntries, args.currentEntries);
}

async function writeSourcePage(paths: ResolvedPaths, source: SourceRecord, markdown: string): Promise<string> {
  const relPagePath = path.join("wiki", "sources", `${source.slug}.md`).replace(/\\/g, "/");
  const absolute = path.join(paths.vaultDir, relPagePath);
  const withHeader = markdown.startsWith("# ") ? markdown : `# ${source.title}\n\n${markdown.trim()}`;
  const frontmatter = buildFrontmatter({
    kind: "source",
    title: source.title,
    source_id: source.id,
    source_kind: source.kind,
    raw_path: source.storedPath,
    source_url: source.metadata?.sourceUrl,
    authors: source.metadata?.authors,
    published: source.metadata?.published,
    created: source.metadata?.created,
    description: source.metadata?.description,
    source_tags: source.metadata?.tags,
    related_assets: source.relatedAssets,
    tags: ["source", source.kind]
  });
  await fs.writeFile(absolute, `${frontmatter}${withHeader.trim()}\n`, "utf8");
  return relPagePath;
}

async function collectSourcePages(paths: ResolvedPaths, sources: SourceRecord[]): Promise<Map<string, SourcePageEntry>> {
  const map = new Map<string, SourcePageEntry>();

  for (const source of sources) {
    const relPath = path.join("wiki", "sources", `${source.slug}.md`).replace(/\\/g, "/");
    const absolute = path.join(paths.vaultDir, relPath);
    try {
      const markdown = await fs.readFile(absolute, "utf8");
      map.set(source.id, {
        source,
        pagePath: relPath,
        title: extractFirstHeading(markdown),
        markdown,
        entities: extractEntities(markdown),
        concepts: extractConcepts(markdown)
      });
    } catch {
      continue;
    }
  }

  return map;
}

function buildEntityMap(sourcePages: Map<string, SourcePageEntry>): Map<string, SourcePageEntry[]> {
  const map = new Map<string, SourcePageEntry[]>();

  for (const entry of sourcePages.values()) {
    for (const entity of entry.entities) {
      const key = entity.trim();
      if (!key) {
        continue;
      }
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
  }

  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function buildConceptMap(sourcePages: Map<string, SourcePageEntry>): Map<string, SourcePageEntry[]> {
  const map = new Map<string, SourcePageEntry[]>();

  for (const entry of sourcePages.values()) {
    for (const concept of entry.concepts) {
      const key = concept.trim();
      if (!key) {
        continue;
      }
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
  }

  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

async function synthesizeEntityPages(
  config: KBConfig,
  paths: ResolvedPaths,
  entityMap: Map<string, SourcePageEntry[]>,
  buildState: Awaited<ReturnType<typeof loadBuildState>>,
  options?: { targets?: string[]; progress?: (message: string) => void }
): Promise<string[]> {
  const outputs: string[] = [];
  const targets = options?.targets ?? [...entityMap.keys()];
  let index = 0;

  for (const entity of targets) {
    const entries = entityMap.get(entity);
    if (!entries || entries.length === 0) {
      continue;
    }
    index += 1;
    emitCompileProgress(options?.progress, `entity ${index}/${targets.length}: ${entity}`);
    const slug = slugifyValue(entity);
    const relPath = path.join("wiki", "entities", `${slug}.md`).replace(/\\/g, "/");
    const absolute = path.join(paths.vaultDir, relPath);
    const context = entries
      .map((entry) => `## Source: ${entry.title}\nPath: ${entry.pagePath}\n\n${entry.markdown}`)
      .join("\n\n")
      .slice(0, config.compile.maxContextChars);

    const instructions = await entitySynthesizerInstructions(paths, entity);
    const generated = await runTextResponse({
      model: resolveModelForPhase(config, "compile"),
      instructions,
      input: context,
      reasoningEffort: config.openai.reasoning.compile
    });

    const frontmatter = buildFrontmatter({
      kind: "entity",
      title: entity,
      entity,
      source_count: entries.length,
      tags: ["entity"]
    });
    await fs.writeFile(absolute, `${frontmatter}${generated.trim()}\n`, "utf8");
    buildState.entityPages[entity] = {
      pagePath: relPath,
      compiledAt: timestamp()
    };
    outputs.push(relPath);
  }

  return outputs;
}

async function synthesizeConceptPages(
  config: KBConfig,
  paths: ResolvedPaths,
  conceptMap: Map<string, SourcePageEntry[]>,
  buildState: Awaited<ReturnType<typeof loadBuildState>>,
  options?: { targets?: string[]; progress?: (message: string) => void }
): Promise<string[]> {
  const outputs: string[] = [];
  const targets = options?.targets ?? [...conceptMap.keys()];
  let index = 0;

  for (const concept of targets) {
    const entries = conceptMap.get(concept);
    if (!entries || entries.length === 0) {
      continue;
    }
    index += 1;
    emitCompileProgress(options?.progress, `concept ${index}/${targets.length}: ${concept}`);
    const slug = slugifyValue(concept);
    const relPath = path.join("wiki", "concepts", `${slug}.md`).replace(/\\/g, "/");
    const absolute = path.join(paths.vaultDir, relPath);
    const context = entries
      .map((entry) => `## Source: ${entry.title}\nPath: ${entry.pagePath}\n\n${entry.markdown}`)
      .join("\n\n")
      .slice(0, config.compile.maxContextChars);

    const instructions = await conceptSynthesizerInstructions(paths, concept);
    const generated = await runTextResponse({
      model: resolveModelForPhase(config, "compile"),
      instructions,
      input: context,
      reasoningEffort: config.openai.reasoning.compile
    });

    const frontmatter = buildFrontmatter({
      kind: "concept",
      title: concept,
      concept,
      source_count: entries.length,
      tags: ["concept"]
    });
    await fs.writeFile(absolute, `${frontmatter}${generated.trim()}\n`, "utf8");
    buildState.conceptPages[concept] = {
      pagePath: relPath,
      compiledAt: timestamp()
    };
    outputs.push(relPath);
  }

  return outputs;
}

async function refreshManagedSections(
  paths: ResolvedPaths,
  sourcePages: Map<string, SourcePageEntry>,
  entityMap: Map<string, SourcePageEntry[]>,
  conceptMap: Map<string, SourcePageEntry[]>,
  options?: {
    sourceIds?: string[];
    entityNames?: string[];
    conceptNames?: string[];
  }
): Promise<void> {
  const sourceTargets = options?.sourceIds
    ? options.sourceIds
        .map((sourceId) => sourcePages.get(sourceId))
        .filter((entry): entry is SourcePageEntry => Boolean(entry))
    : [...sourcePages.values()];

  for (const entry of sourceTargets) {
    const entityLinks = entry.entities.map((entity) => `- ${toWikiLink(`wiki/entities/${slugifyValue(entity)}.md`)}`);
    const conceptLinks = entry.concepts.map((concept) => {
      const slug = slugifyValue(concept);
      return `- ${toWikiLink(`wiki/concepts/${slug}.md`)}`;
    });
    const content = [
      "## Knowledge Graph",
      `- Source: ${toWikiLink(entry.pagePath)}`,
      `- Raw: ${toWikiLink(entry.source.storedPath)}`,
      ...entityLinks,
      ...conceptLinks
    ].join("\n");
    const updated = upsertManagedSection(entry.markdown, "source-links", content);
    await fs.writeFile(path.join(paths.vaultDir, entry.pagePath), updated, "utf8");
  }

  const entityTargets = options?.entityNames ?? [...entityMap.keys()];
  for (const entity of entityTargets) {
    const entries = entityMap.get(entity);
    if (!entries || entries.length === 0) {
      continue;
    }
    const slug = slugifyValue(entity);
    const relPath = path.join("wiki", "entities", `${slug}.md`).replace(/\\/g, "/");
    const absolute = path.join(paths.vaultDir, relPath);
    if (!(await fileExists(absolute))) {
      continue;
    }
    const current = await fs.readFile(absolute, "utf8");
    const relatedConcepts = uniqueStrings(entries.flatMap((entry) => entry.concepts));
    const relatedEntities = uniqueStrings(entries.flatMap((entry) => entry.entities)).filter((item) => item !== entity);
    const section = [
      "## Evidence Links",
      ...entries.map((entry) => `- ${toWikiLink(entry.pagePath)}`),
      "",
      "## Related Concepts",
      ...(relatedConcepts.length
        ? relatedConcepts.map((item) => `- ${toWikiLink(`wiki/concepts/${slugifyValue(item)}.md`)}`)
        : ["- None"]),
      "",
      "## Related Entities",
      ...(relatedEntities.length
        ? relatedEntities.map((item) => `- ${toWikiLink(`wiki/entities/${slugifyValue(item)}.md`)}`)
        : ["- None"])
    ].join("\n");
    const updated = upsertManagedSection(current, "entity-links", section);
    await fs.writeFile(absolute, updated, "utf8");
  }

  const conceptTargets = options?.conceptNames ?? [...conceptMap.keys()];
  for (const concept of conceptTargets) {
    const entries = conceptMap.get(concept);
    if (!entries || entries.length === 0) {
      continue;
    }
    const slug = slugifyValue(concept);
    const relPath = path.join("wiki", "concepts", `${slug}.md`).replace(/\\/g, "/");
    const absolute = path.join(paths.vaultDir, relPath);
    if (!(await fileExists(absolute))) {
      continue;
    }
    const current = await fs.readFile(absolute, "utf8");
    const relatedConcepts = uniqueStrings(entries.flatMap((entry) => entry.concepts)).filter((item) => item !== concept);
    const section = [
      "## Evidence Links",
      ...entries.map((entry) => `- ${toWikiLink(entry.pagePath)}`),
      "",
      "## Related Concepts",
      ...(relatedConcepts.length
        ? relatedConcepts.map((item) => `- ${toWikiLink(`wiki/concepts/${slugifyValue(item)}.md`)}`)
        : ["- None"])
    ].join("\n");
    const updated = upsertManagedSection(current, "concept-links", section);
    await fs.writeFile(absolute, updated, "utf8");
  }
}

async function writeAnswerFile(
  paths: ResolvedPaths,
  question: string,
  format: AskFormat,
  body: string,
  sourcePaths: string[],
  validationWarnings: string[] = []
): Promise<string> {
  const relPath = await reserveReadableOutputPath(paths, question, format);
  const absolute = path.join(paths.vaultDir, relPath);
  const frontmatter = [
    buildFrontmatter({
      kind: "output",
      question,
      format,
      created_at: timestamp(),
      sources: sourcePaths,
      validation_warnings: validationWarnings.length ? validationWarnings : undefined,
      tags: ["output", format]
    }),
    body.trim()
  ].join("");
  await fs.writeFile(absolute, `${frontmatter.trim()}\n`, "utf8");
  return relPath;
}

async function reserveReadableOutputPath(paths: ResolvedPaths, title: string, format: AskFormat): Promise<string> {
  let relPath = path.join("outputs", buildReadableOutputPath({ title, format })).replace(/\\/g, "/");
  let counter = 2;

  while (await fileExists(path.join(paths.vaultDir, relPath))) {
    relPath = path.join("outputs", buildReadableOutputPath({ title, format, sequence: counter })).replace(/\\/g, "/");
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

async function findOrphanConceptPages(paths: ResolvedPaths, conceptMap: Map<string, SourcePageEntry[]>): Promise<string[]> {
  const conceptDir = path.join(paths.wikiDir, "concepts");
  const files = await walkFilesSafe(conceptDir);
  const validSlugs = new Set([...conceptMap.keys()].map((concept) => slugifyValue(concept)));
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.relative(paths.vaultDir, file).replace(/\\/g, "/"))
    .filter((relPath) => !validSlugs.has(path.parse(relPath).name))
    .sort();
}

async function findOrphanEntityPages(paths: ResolvedPaths, entityMap: Map<string, SourcePageEntry[]>): Promise<string[]> {
  const entityDir = path.join(paths.wikiDir, "entities");
  const files = await walkFilesSafe(entityDir);
  const validSlugs = new Set([...entityMap.keys()].map((entity) => slugifyValue(entity)));
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.relative(paths.vaultDir, file).replace(/\\/g, "/"))
    .filter((relPath) => !validSlugs.has(path.parse(relPath).name))
    .sort();
}

async function applyHealSuggestions(
  config: KBConfig,
  paths: ResolvedPaths,
  reportPath: string,
  reportBody: string,
  pagesMissingEntities: string[],
  pagesMissingConcepts: string[],
  orphanEntities: string[],
  orphanConcepts: string[],
  sourcePages: Map<string, SourcePageEntry>,
  entityMap: Map<string, SourcePageEntry[]>,
  conceptMap: Map<string, SourcePageEntry[]>
): Promise<string[]> {
  const repairItems = collectHealActionItems({
    reportBody,
    pagesMissingEntities,
    pagesMissingConcepts,
    orphanEntities,
    orphanConcepts
  });
  const articleCandidates = collectHealArticleCandidates(reportBody);
  const written: string[] = [];

  for (const item of repairItems) {
    const relPath = await reserveQuestionPath(paths, item);
    if (!relPath) {
      continue;
    }

    const absolute = path.join(paths.vaultDir, relPath);
    const frontmatter = buildFrontmatter({
      kind: "question",
      title: item,
      status: "open",
      created_at: timestamp(),
      source_report: reportPath,
      tags: ["question", "heal"]
    });
    const body = [
      `# ${item}`,
      "",
      "## Why this exists",
      `- Generated by ${toWikiLink(reportPath)} via \`kb heal --apply\`.`,
      "",
      "## Next Step",
      `- ${item}`
    ].join("\n");
    await fs.writeFile(absolute, `${frontmatter}${body}\n`, "utf8");
    written.push(relPath);
  }

  const sourceIndex = [...sourcePages.values()]
    .map((entry) => `- ${entry.title} (${entry.pagePath})`)
    .join("\n");
  const entityIndex = [...entityMap.keys()]
    .map((entity) => `- ${entity}`)
    .join("\n");
  const conceptIndex = [...conceptMap.keys()]
    .map((concept) => `- ${concept}`)
    .join("\n");

  for (const candidate of articleCandidates) {
    const relPath = await reserveConceptDraftPath(paths, candidate);
    if (!relPath) {
      continue;
    }

    const draftBody = await buildHealDraftArticle(config, paths, reportBody, candidate, sourceIndex, entityIndex, conceptIndex);
    const absolute = path.join(paths.vaultDir, relPath);
    const frontmatter = buildFrontmatter({
      kind: "concept",
      title: candidate,
      status: "draft",
      created_at: timestamp(),
      source_report: reportPath,
      tags: ["concept", "heal-draft"]
    });
    const content = draftBody.startsWith("# ") ? draftBody.trim() : `# ${candidate}\n\n${draftBody.trim()}`;
    await fs.writeFile(absolute, `${frontmatter}${content}\n`, "utf8");
    written.push(relPath);
  }

  return written;
}

async function reserveQuestionPath(paths: ResolvedPaths, item: string): Promise<string | null> {
  const slug = slugifyValue(item).slice(0, 80) || "question";
  const baseRelPath = path.join("wiki", "questions", `${slug}.md`).replace(/\\/g, "/");
  if (await fileExists(path.join(paths.vaultDir, baseRelPath))) {
    return null;
  }
  return baseRelPath;
}

export async function promoteSuggestedQuestionsFromOutput(
  paths: ResolvedPaths,
  outputPath: string,
  markdown: string,
  tags: string[] = ["question", "query"]
): Promise<string[]> {
  const questions = extractBulletItemsFromSection(markdown, "Suggested Next Questions");
  const written: string[] = [];

  for (const item of questions) {
    const relPath = await reserveQuestionPath(paths, item);
    if (!relPath) {
      continue;
    }

    const absolute = path.join(paths.vaultDir, relPath);
    const frontmatter = buildFrontmatter({
      kind: "question",
      title: item,
      status: "open",
      created_at: timestamp(),
      source_output: outputPath,
      tags
    });
    const body = [
      `# ${item}`,
      "",
      "## Why this exists",
      `- Promoted from ${toWikiLink(outputPath)} after a research answer was filed back into the wiki.`,
      "",
      "## Next Step",
      `- ${item}`
    ].join("\n");
    await fs.writeFile(absolute, `${frontmatter}${body}\n`, "utf8");
    written.push(relPath);
  }

  return written;
}

async function reserveConceptDraftPath(paths: ResolvedPaths, concept: string): Promise<string | null> {
  const slug = slugifyValue(concept).slice(0, 80) || "concept";
  const baseRelPath = path.join("wiki", "concepts", `${slug}.md`).replace(/\\/g, "/");
  if (await fileExists(path.join(paths.vaultDir, baseRelPath))) {
    return null;
  }
  return baseRelPath;
}

async function buildHealDraftArticle(
  config: KBConfig,
  paths: ResolvedPaths,
  reportBody: string,
  candidate: string,
  sourceIndex: string,
  entityIndex: string,
  conceptIndex: string
): Promise<string> {
  const instructions = await healApplyInstructions(paths);
  const input = [
    `Candidate: ${candidate}`,
    "",
    "Heal report:",
    reportBody,
    "",
    "Current source index:",
    sourceIndex || "- None",
    "",
    "Current entity index:",
    entityIndex || "- None",
    "",
    "Current concept index:",
    conceptIndex || "- None"
  ].join("\n");

  return runTextResponse({
    model: resolveModelForPhase(config, "heal"),
    instructions,
    input,
    reasoningEffort: config.openai.reasoning.heal
  });
}

async function buildEvolveContext(paths: ResolvedPaths, maxChars: number): Promise<string> {
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
  const chunks: string[] = [];
  let usedChars = 0;
  const buildState = await loadBuildState(paths);
  const recentPaths = uniqueStrings(
    [
      ...Object.values(buildState.compiledSources),
      ...Object.values(buildState.entityPages),
      ...Object.values(buildState.conceptPages)
    ]
      .sort((a, b) => b.compiledAt.localeCompare(a.compiledAt))
      .map((entry) => entry.pagePath)
      .slice(0, 8)
  );

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
    } catch {
      continue;
    }
  }

  for (const relPath of recentPaths) {
    const absolute = path.join(paths.vaultDir, relPath);
    try {
      const content = await fs.readFile(absolute, "utf8");
      const chunk = `# ${relPath}\n\n${content.trim()}\n`;
      if (usedChars + chunk.length > maxChars) {
        break;
      }
      chunks.push(chunk);
      usedChars += chunk.length;
    } catch {
      continue;
    }
  }

  return chunks.join("\n\n");
}

async function writeSystemArtifact(
  paths: ResolvedPaths,
  filename: string,
  args: { title: string; tags: string[]; body: string }
): Promise<string> {
  const relPath = path.join("wiki", "system", filename).replace(/\\/g, "/");
  const absolute = path.join(paths.vaultDir, relPath);
  const content = [
    buildFrontmatter({
      kind: "index",
      title: args.title,
      updated_at: timestamp(),
      tags: args.tags
    }).trimEnd(),
    `# ${args.title}`,
    "",
    args.body.trim()
  ].join("\n");
  await fs.writeFile(absolute, `${content.trim()}\n`, "utf8");
  return relPath;
}

async function reviseWikiPage(
  config: KBConfig,
  paths: ResolvedPaths,
  args: {
    pagePath: string;
    rationale: string;
    contradictionReport: string;
    graphAudit: string;
    revisionPlan: string;
    sourcePages: Map<string, SourcePageEntry>;
    entityMap: Map<string, SourcePageEntry[]>;
    conceptMap: Map<string, SourcePageEntry[]>;
  }
): Promise<string | null> {
  const supportedRoots = ["wiki/entities/", "wiki/concepts/"];
  if (!supportedRoots.some((prefix) => args.pagePath.startsWith(prefix))) {
    return null;
  }

  const absolute = path.join(paths.vaultDir, args.pagePath);
  let current: string;
  try {
    current = await fs.readFile(absolute, "utf8");
  } catch {
    return null;
  }

  const pageTitle = extractFirstHeading(current);
  const supportingEntries = args.pagePath.startsWith("wiki/entities/")
    ? findEntriesForEntityPage(args.pagePath, args.entityMap)
    : findEntriesForConceptPage(args.pagePath, args.conceptMap);
  const supportingContext = supportingEntries
    .map((entry) => `## Source: ${entry.title}\nPath: ${entry.pagePath}\n\n${entry.markdown}`)
    .join("\n\n");
  const managedSections = listManagedSections(current);
  const frontmatter = extractFrontmatterBlock(current);
  const currentNarrative = stripManagedSections(stripFrontmatter(current));

  const input = [
    `Revision target: ${args.pagePath}`,
    `Revision rationale: ${args.rationale || "Improve the page using cross-page evidence."}`,
    "",
    "Current page body:",
    currentNarrative,
    "",
    "Supporting source summaries:",
    supportingContext || "- None",
    "",
    "Contradiction analyst report:",
    args.contradictionReport,
    "",
    "Graph audit:",
    args.graphAudit,
    "",
    "Revision plan:",
    args.revisionPlan
  ].join("\n");

  const revisedBody = await runTextResponse({
    model: resolveModelForPhase(config, "evolve"),
    instructions: await pageReviserInstructions(paths, args.pagePath),
    input,
    reasoningEffort: config.openai.reasoning.evolve
  });

  const normalized = revisedBody.startsWith("# ") ? revisedBody.trim() : `# ${pageTitle}\n\n${revisedBody.trim()}`;
  let next = `${frontmatter}${normalized}\n`;
  for (const section of managedSections) {
    next = upsertManagedSection(next, section.name, section.body);
  }
  await fs.writeFile(absolute, `${next.trim()}\n`, "utf8");
  return args.pagePath;
}

function findEntriesForEntityPage(pagePath: string, entityMap: Map<string, SourcePageEntry[]>): SourcePageEntry[] {
  const slug = path.parse(pagePath).name;
  for (const [entity, entries] of entityMap.entries()) {
    if (slugifyValue(entity) === slug) {
      return entries;
    }
  }
  return [];
}

function findEntriesForConceptPage(pagePath: string, conceptMap: Map<string, SourcePageEntry[]>): SourcePageEntry[] {
  const slug = path.parse(pagePath).name;
  for (const [concept, entries] of conceptMap.entries()) {
    if (slugifyValue(concept) === slug) {
      return entries;
    }
  }
  return [];
}

async function createQuestionNotesFromList(
  paths: ResolvedPaths,
  questions: string[],
  args: {
    tags: string[];
    sourceField: "source_report" | "source_output";
    sourcePath: string;
    whyLine: string;
  }
): Promise<string[]> {
  const written: string[] = [];

  for (const item of questions) {
    const relPath = await reserveQuestionPath(paths, item);
    if (!relPath) {
      continue;
    }

    const absolute = path.join(paths.vaultDir, relPath);
    const frontmatter = buildFrontmatter({
      kind: "question",
      title: item,
      status: "open",
      created_at: timestamp(),
      [args.sourceField]: args.sourcePath,
      tags: args.tags
    });
    const body = [
      `# ${item}`,
      "",
      "## Why this exists",
      args.whyLine,
      "",
      "## Next Step",
      `- ${item}`
    ].join("\n");
    await fs.writeFile(absolute, `${frontmatter}${body}\n`, "utf8");
    written.push(relPath);
  }

  return written;
}

async function createConceptDraftsFromList(
  config: KBConfig,
  paths: ResolvedPaths,
  concepts: string[],
  reportPath: string,
  wikiContext: string,
  contradictionReport: string,
  revisionPlan: string
): Promise<string[]> {
  const written: string[] = [];

  for (const candidate of concepts) {
    const relPath = await reserveConceptDraftPath(paths, candidate);
    if (!relPath) {
      continue;
    }

    const absolute = path.join(paths.vaultDir, relPath);
    const draftBody = await runTextResponse({
      model: resolveModelForPhase(config, "evolve"),
      instructions: await comparisonDrafterInstructions(paths, candidate),
      input: [
        `Candidate: ${candidate}`,
        "",
        "Wiki context:",
        wikiContext,
        "",
        "Contradiction report:",
        contradictionReport,
        "",
        "Revision plan:",
        revisionPlan
      ].join("\n"),
      reasoningEffort: config.openai.reasoning.evolve
    });
    const frontmatter = buildFrontmatter({
      kind: "concept",
      title: candidate,
      status: "draft",
      created_at: timestamp(),
      source_report: reportPath,
      tags: ["concept", "evolve-draft"]
    });
    const body = draftBody.startsWith("# ") ? draftBody.trim() : `# ${candidate}\n\n${draftBody.trim()}`;
    const content = [
      frontmatter.trimEnd(),
      body,
      "",
      managedSection(
        "evolve-origin",
        [
          "## Evolve Origin",
          `- Promoted from ${toWikiLink(reportPath)} during \`kb evolve\`.`
        ].join("\n")
      )
    ].join("\n");
    await fs.writeFile(absolute, `${content.trim()}\n`, "utf8");
    written.push(relPath);
  }

  return written;
}

async function writeEvolutionArchive(
  paths: ResolvedPaths,
  contradictionReport: string,
  graphAudit: string,
  revisionPlan: string,
  revisedPages: string[],
  createdQuestions: string[],
  createdConcepts: string[]
): Promise<string> {
  const relPath = path.join("outputs", "health", `${timestamp().slice(0, 19).replace(/[:T]/g, "-")}-evolve.md`).replace(/\\/g, "/");
  const absolute = path.join(paths.vaultDir, relPath);
  const content = [
    buildFrontmatter({
      kind: "output",
      title: "Evolution Run",
      format: "report",
      created_at: timestamp(),
      tags: ["output", "evolve"]
    }).trimEnd(),
    "# Evolution Run",
    "",
    "## Revised Pages",
    ...(revisedPages.length ? revisedPages.map((item) => `- ${toWikiLink(item)}`) : ["- None"]),
    "",
    "## Created Questions",
    ...(createdQuestions.length ? createdQuestions.map((item) => `- ${toWikiLink(item)}`) : ["- None"]),
    "",
    "## Created Concepts",
    ...(createdConcepts.length ? createdConcepts.map((item) => `- ${toWikiLink(item)}`) : ["- None"]),
    "",
    contradictionReport.trim(),
    "",
    graphAudit.trim(),
    "",
    revisionPlan.trim()
  ].join("\n");
  await fs.writeFile(absolute, `${content.trim()}\n`, "utf8");
  return relPath;
}

async function walkFilesSafe(root: string): Promise<string[]> {
  try {
    return await walkFiles(root);
  } catch {
    return [];
  }
}

function emitProgress(progress: ((message: string) => void) | undefined, message: string): void {
  progress?.(message);
}
