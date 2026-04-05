import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAskContext } from "../src/search.js";
import { ResolvedPaths } from "../src/types.js";
import { tokenize } from "../src/utils.js";

function buildPaths(root: string): ResolvedPaths {
  const vaultDir = path.join(root, "vault");
  return {
    root,
    vaultDir,
    clippingsDir: path.join(vaultDir, "Clippings"),
    obsidianDir: path.join(vaultDir, ".obsidian"),
    homeFile: path.join(vaultDir, "Home.md"),
    configFile: path.join(root, "kb.config.json"),
    rawDir: path.join(vaultDir, "raw"),
    wikiDir: path.join(vaultDir, "wiki"),
    outputDir: path.join(vaultDir, "outputs"),
    metaDir: path.join(root, ".kb"),
    sourcesFile: path.join(root, ".kb", "sources.json"),
    buildFile: path.join(root, ".kb", "build-state.json"),
    promptsDir: path.join(root, "prompts")
  };
}

test("tokenize removes short noise and lowercases terms", () => {
  assert.deepEqual(tokenize("LLM Knowledge-Base 101!"), ["llm", "knowledge", "base", "101"]);
});

test("buildAskContext prioritizes durable evolve system pages", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-search-"));
  const paths = buildPaths(root);

  await fs.mkdir(path.join(paths.wikiDir, "system"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "concepts"), { recursive: true });

  await fs.writeFile(path.join(paths.wikiDir, "index.md"), "# Index\n\nTop-level map.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "catalog.md"), "# Catalog\n\nCatalog body.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "log.md"), "# Log\n\nRecent activity.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "graph-audit.md"), "# Graph Audit\n\nWeak links and hub gaps.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "review-queue.md"), "# Review Queue\n\nSingle-source follow-ups.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "revision-queue.md"), "# Revision Queue\n\nPriority revisions.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "concepts", "recursion.md"), "# Recursion\n\nGraph-oriented reasoning note.", "utf8");

  const { context } = await buildAskContext(paths, "graph reasoning", 20_000);

  assert.match(context, /# wiki\/system\/graph-audit\.md/);
  assert.match(context, /# wiki\/system\/review-queue\.md/);
  assert.match(context, /# wiki\/system\/revision-queue\.md/);
});
