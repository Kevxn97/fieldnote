import { Dirent, FSWatcher, promises as fs, watch as watchFs } from "node:fs";
import path from "node:path";
import { initializeProject } from "./config.js";
import { runSyncWorkflow, runUpdateWorkflow } from "./cli-workflows.js";
import { ResolvedPaths } from "./types.js";
import { pathExists } from "./utils.js";

const DEFAULT_DEBOUNCE_MS = 400;
const WATCH_SKIP_DIRS = new Set([".git", "node_modules", "dist", ".next", ".turbo"]);

export interface WatchModeOptions {
  debounceMs?: number;
  progress?: (message: string) => void;
}

export type WatchRefreshMode = "sync" | "update";

export async function runWatchWorkflow(root: string, options?: WatchModeOptions): Promise<void> {
  const { paths } = await initializeProject(root);
  const session = new WorkspaceWatchSession(paths, {
    debounceMs: options?.debounceMs,
    progress: options?.progress ?? ((message) => console.log(`[watch] ${message}`))
  });
  await session.run();
}

export function classifyWatchRefreshMode(changedPaths: string[], paths: ResolvedPaths): WatchRefreshMode | null {
  let sawRaw = false;
  let sawClippings = false;

  for (const changedPath of changedPaths) {
    if (isWithinPath(changedPath, paths.clippingsDir)) {
      sawClippings = true;
      continue;
    }
    if (isWithinPath(changedPath, paths.rawDir)) {
      sawRaw = true;
    }
  }

  if (sawClippings) {
    return "update";
  }
  if (sawRaw) {
    return "sync";
  }
  return null;
}

class WorkspaceWatchSession {
  private readonly debounceMs: number;
  private readonly progress: (message: string) => void;
  private readonly watchers = new Map<string, FSWatcher>();
  private readonly ignoredPaths = new Map<string, number>();
  private readonly pendingPaths = new Set<string>();
  private debounceTimer: NodeJS.Timeout | null = null;
  private stopped = false;
  private running = false;
  private flushRequestedWhileRunning = false;
  private shutdownResolver: (() => void) | null = null;
  private readonly shutdownPromise: Promise<void>;

  constructor(
    private readonly paths: ResolvedPaths,
    options?: WatchModeOptions
  ) {
    this.debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.progress = options?.progress ?? ((message) => console.log(`[watch] ${message}`));
    this.shutdownPromise = new Promise<void>((resolve) => {
      this.shutdownResolver = resolve;
    });
  }

  async run(): Promise<void> {
    this.installSignalHandlers();
    await this.rescanWatchers();
    this.progress(
      `Watching ${path.relative(this.paths.root, this.paths.clippingsDir) || this.paths.clippingsDir} and ${path.relative(this.paths.root, this.paths.rawDir) || this.paths.rawDir}`
    );
    await this.refresh("startup");
    await this.shutdownPromise;
  }

  private installSignalHandlers(): void {
    const handleSignal = (signal: NodeJS.Signals) => {
      this.progress(`Received ${signal}. Stopping watch mode.`);
      void this.stop();
    };

    process.once("SIGINT", handleSignal);
    process.once("SIGTERM", handleSignal);
  }

  private async refresh(reason: string): Promise<void> {
    if (this.stopped) {
      return;
    }

    const changedPaths = [...this.pendingPaths];
    this.pendingPaths.clear();
    const mode = reason === "startup" ? "update" : classifyWatchRefreshMode(changedPaths, this.paths);
    if (!mode) {
      return;
    }

    this.running = true;
    this.progress(`Detected ${changedPaths.length} change(s); running fast ${mode} refresh (${reason}).`);

    try {
      const result =
        mode === "update"
          ? await runUpdateWorkflow(this.paths.root, {
              progress: (message) => this.progress(message),
              onWatchPaths: (paths) => this.registerIgnoredPaths(paths)
            })
          : await runSyncWorkflow(this.paths.root, { progress: (message) => this.progress(message) });

      for (const line of result.lines) {
        this.progress(line);
      }

      if (result.watchPaths?.length) {
        this.registerIgnoredPaths(result.watchPaths);
      }
    } catch (error) {
      const message = error instanceof Error ? error.stack || error.message : String(error);
      this.progress(`Refresh failed: ${message}`);
      process.exitCode = 1;
    } finally {
      await this.rescanWatchers();
      this.running = false;
      if (this.pendingPaths.size > 0 || this.flushRequestedWhileRunning) {
        this.flushRequestedWhileRunning = false;
        this.armDebounce();
      }
    }
  }

  private async stop(): Promise<void> {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.clearDebounce();
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.shutdownResolver?.();
  }

  private async rescanWatchers(): Promise<void> {
    if (this.stopped) {
      return;
    }

    const nextDirectories = new Set(await collectWatchDirectories([this.paths.rawDir, this.paths.clippingsDir]));
    for (const [directory, watcher] of this.watchers) {
      if (!nextDirectories.has(directory)) {
        watcher.close();
        this.watchers.delete(directory);
      }
    }

    for (const directory of nextDirectories) {
      if (this.watchers.has(directory)) {
        continue;
      }
      try {
        const watcher = watchFs(directory, { persistent: true }, (_eventType, filename) => {
          this.handleFsEvent(directory, filename);
        });
        watcher.on("error", (error) => {
          const message = error instanceof Error ? error.message : String(error);
          this.progress(`Watcher error on ${path.relative(this.paths.root, directory) || directory}: ${message}`);
          this.requestRefresh();
        });
        this.watchers.set(directory, watcher);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.progress(`Could not watch ${path.relative(this.paths.root, directory) || directory}: ${message}`);
        process.exitCode = 1;
      }
    }
  }

  private handleFsEvent(directory: string, filename: string | Buffer | null): void {
    if (this.stopped) {
      return;
    }

    const changedPath =
      filename == null || filename.length === 0
        ? directory
        : path.resolve(directory, Buffer.isBuffer(filename) ? filename.toString("utf8") : filename);

    if (this.shouldIgnorePath(changedPath)) {
      return;
    }

    this.pendingPaths.add(changedPath);
    this.requestRefresh();
  }

  private requestRefresh(): void {
    if (this.stopped) {
      return;
    }

    if (this.running) {
      this.flushRequestedWhileRunning = true;
      return;
    }

    this.armDebounce();
  }

  private armDebounce(): void {
    if (this.stopped) {
      return;
    }

    this.clearDebounce();
    this.debounceTimer = setTimeout(() => {
      void this.refresh("changes");
    }, this.debounceMs);
  }

  private clearDebounce(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  private registerIgnoredPaths(pathsToIgnore: string[]): void {
    const expiry = Date.now() + Math.max(this.debounceMs * 3, 1200);
    for (const targetPath of pathsToIgnore) {
      this.ignoredPaths.set(path.resolve(targetPath), expiry);
    }
  }

  private shouldIgnorePath(changedPath: string): boolean {
    const normalizedChangedPath = path.resolve(changedPath);
    const now = Date.now();

    for (const [ignoredPath, expiresAt] of this.ignoredPaths) {
      if (expiresAt <= now) {
        this.ignoredPaths.delete(ignoredPath);
        continue;
      }
      if (pathsOverlap(normalizedChangedPath, ignoredPath)) {
        return true;
      }
    }

    return false;
  }
}

async function collectWatchDirectories(roots: string[]): Promise<string[]> {
  const directories = new Set<string>();

  for (const root of roots) {
    if (!(await pathExists(root))) {
      continue;
    }
    await walkWatchDirectories(root, directories);
  }

  return [...directories].sort();
}

async function walkWatchDirectories(root: string, directories: Set<string>): Promise<void> {
  if (shouldSkipWatchDirectory(root)) {
    return;
  }

  directories.add(root);

  let entries: Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    await walkWatchDirectories(path.join(root, entry.name), directories);
  }
}

function shouldSkipWatchDirectory(targetPath: string): boolean {
  return WATCH_SKIP_DIRS.has(path.basename(targetPath));
}

function isWithinPath(targetPath: string, parentPath: string): boolean {
  const relative = path.relative(parentPath, targetPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function pathsOverlap(left: string, right: string): boolean {
  return isWithinPath(left, right) || isWithinPath(right, left);
}
