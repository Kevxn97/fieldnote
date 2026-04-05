import { promises as fs } from "node:fs";
import path from "node:path";
import { BuildState, KBConfig, ResolvedPaths, SourceRecord, WorkflowPhase } from "./types.js";
import { ensureDir, readJson, writeJson } from "./utils.js";

export const DEFAULT_CONFIG: KBConfig = {
  name: "Fieldnote",
  model: "gpt-5.4",
  directories: {
    raw: "vault/raw",
    wiki: "vault/wiki",
    outputs: "vault/outputs",
    meta: ".kb"
  },
  openai: {
    models: {
      compile: "gpt-5.4",
      ask: "gpt-5.4-mini",
      heal: "gpt-5.4",
      evolve: "gpt-5.4"
    },
    reasoning: {
      compile: "medium",
      ask: "medium",
      heal: "medium",
      evolve: "medium"
    }
  },
  compile: {
    maxSourceChars: 30000,
    maxContextChars: 45000
  }
};

export function resolvePaths(root: string, config: KBConfig = DEFAULT_CONFIG): ResolvedPaths {
  const vaultDir = path.join(root, "vault");
  return {
    root,
    vaultDir,
    clippingsDir: path.join(vaultDir, "Clippings"),
    obsidianDir: path.join(vaultDir, ".obsidian"),
    homeFile: path.join(vaultDir, "Home.md"),
    configFile: path.join(root, "kb.config.json"),
    rawDir: path.join(root, config.directories.raw),
    wikiDir: path.join(root, config.directories.wiki),
    outputDir: path.join(root, config.directories.outputs),
    metaDir: path.join(root, config.directories.meta),
    sourcesFile: path.join(root, config.directories.meta, "sources.json"),
    buildFile: path.join(root, config.directories.meta, "build-state.json"),
    promptsDir: path.join(root, "prompts")
  };
}

export async function loadConfig(root: string): Promise<{ config: KBConfig; paths: ResolvedPaths }> {
  const configFile = path.join(root, "kb.config.json");
  const userConfig = await readJson<KBConfig | null>(configFile, null);
  const config = userConfig
    ? {
        ...DEFAULT_CONFIG,
        ...userConfig,
        openai: {
          ...DEFAULT_CONFIG.openai,
          ...userConfig.openai,
          models: {
            ...DEFAULT_CONFIG.openai.models,
            ...userConfig.openai?.models
          },
          reasoning: {
            ...DEFAULT_CONFIG.openai.reasoning,
            ...userConfig.openai?.reasoning
          }
        }
      }
    : DEFAULT_CONFIG;
  return { config, paths: resolvePaths(root, config) };
}

export function resolveModelForPhase(config: KBConfig, phase: WorkflowPhase): string {
  return config.openai.models?.[phase] ?? config.model;
}

export async function ensureProjectStructure(paths: ResolvedPaths): Promise<void> {
  await Promise.all([
    ensureDir(paths.vaultDir),
    ensureDir(paths.rawDir),
    ensureDir(paths.wikiDir),
    ensureDir(paths.outputDir),
    ensureDir(paths.metaDir),
    ensureDir(paths.clippingsDir),
    ensureDir(path.join(paths.clippingsDir, "_assets")),
    ensureDir(path.join(paths.rawDir, "files")),
    ensureDir(path.join(paths.rawDir, "clips")),
    ensureDir(path.join(paths.rawDir, "repos")),
    ensureDir(path.join(paths.rawDir, "images")),
    ensureDir(path.join(paths.wikiDir, "sources")),
    ensureDir(path.join(paths.wikiDir, "entities")),
    ensureDir(path.join(paths.wikiDir, "concepts")),
    ensureDir(path.join(paths.wikiDir, "questions")),
    ensureDir(path.join(paths.wikiDir, "filed")),
    ensureDir(path.join(paths.wikiDir, "system")),
    ensureDir(path.join(paths.outputDir, "answers")),
    ensureDir(path.join(paths.outputDir, "charts")),
    ensureDir(path.join(paths.outputDir, "research")),
    ensureDir(path.join(paths.outputDir, "reviews")),
    ensureDir(path.join(paths.outputDir, "slides")),
    ensureDir(path.join(paths.outputDir, "health")),
    ensureDir(path.join(paths.obsidianDir, "templates")),
    ensureDir(path.join(paths.obsidianDir, "snippets"))
  ]);
}

export async function initializeProject(root: string): Promise<{ config: KBConfig; paths: ResolvedPaths }> {
  const { config, paths } = await loadConfig(root);

  if (!(await fileExists(paths.configFile))) {
    await writeJson(paths.configFile, config);
  }

  await migrateLegacyVaultLayout(paths);
  await ensureProjectStructure(paths);
  await writeJson(paths.sourcesFile, await readJson(paths.sourcesFile, [] as SourceRecord[]));
  await writeJson(paths.buildFile, await readJson(paths.buildFile, emptyBuildState()));

  return { config, paths };
}

export async function loadSources(paths: ResolvedPaths): Promise<SourceRecord[]> {
  return readJson(paths.sourcesFile, [] as SourceRecord[]);
}

export async function saveSources(paths: ResolvedPaths, sources: SourceRecord[]): Promise<void> {
  await writeJson(paths.sourcesFile, sources);
}

export async function loadBuildState(paths: ResolvedPaths): Promise<BuildState> {
  const state = await readJson<BuildState>(paths.buildFile, emptyBuildState());
  return {
    compiledSources: state.compiledSources ?? {},
    entityPages: state.entityPages ?? {},
    conceptPages: state.conceptPages ?? {}
  };
}

export async function saveBuildState(paths: ResolvedPaths, state: BuildState): Promise<void> {
  await writeJson(paths.buildFile, state);
}

export function emptyBuildState(): BuildState {
  return {
    compiledSources: {},
    entityPages: {},
    conceptPages: {}
  };
}

async function fileExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function migrateLegacyVaultLayout(paths: ResolvedPaths): Promise<void> {
  const legacyTargets = [
    { from: path.join(paths.root, "raw"), to: paths.rawDir },
    { from: path.join(paths.root, "wiki"), to: paths.wikiDir },
    { from: path.join(paths.root, "outputs"), to: paths.outputDir },
    { from: path.join(paths.root, "Clippings"), to: paths.clippingsDir },
    { from: path.join(paths.root, ".obsidian"), to: paths.obsidianDir },
    { from: path.join(paths.root, "Home.md"), to: paths.homeFile }
  ];

  await ensureDir(paths.vaultDir);

  for (const target of legacyTargets) {
    if (!(await fileExists(target.from)) || (await fileExists(target.to))) {
      continue;
    }

    await ensureDir(path.dirname(target.to));
    try {
      await fs.rename(target.from, target.to);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}
