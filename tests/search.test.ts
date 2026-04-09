import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAskContext, searchMarkdown } from "../src/search.js";
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
  await fs.writeFile(path.join(paths.wikiDir, "system", "brief.md"), "# Brief\n\nOperator summary.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "catalog.md"), "# Catalog\n\nCatalog body.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "log.md"), "# Log\n\nRecent activity.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "graph-audit.md"), "# Graph Audit\n\nWeak links and hub gaps.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "review-queue.md"), "# Review Queue\n\nSingle-source follow-ups.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "system", "revision-queue.md"), "# Revision Queue\n\nPriority revisions.", "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "concepts", "recursion.md"), "# Recursion\n\nGraph-oriented reasoning note.", "utf8");

  const { context, pack } = await buildAskContext(paths, "graph reasoning", 20_000);

  assert.match(context, /# wiki\/system\/brief\.md/);
  assert.match(context, /# wiki\/system\/graph-audit\.md/);
  assert.match(context, /# wiki\/system\/review-queue\.md/);
  assert.match(context, /# wiki\/system\/revision-queue\.md/);
  assert.ok(pack.prioritizedFileCount >= 4);
  assert.ok(pack.usedChars <= 20_000);
});

test("searchMarkdown uses structural hints like page kind and backlinks", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-search-rank-"));
  const paths = buildPaths(root);

  await fs.mkdir(path.join(paths.wikiDir, "system"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "concepts"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "entities"), { recursive: true });

  await fs.writeFile(
    path.join(paths.wikiDir, "concepts", "multi-agent-systems.md"),
    "# Multi-Agent Systems\n\nRouting and orchestrator workers are central patterns.\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(paths.wikiDir, "entities", "agent-corp.md"),
    "# Agent Corp\n\nA company building tools.\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(paths.wikiDir, "system", "catalog.md"),
    "# Catalog\n\n- [[wiki/concepts/multi-agent-systems]]\n- [[wiki/concepts/multi-agent-systems]]\n",
    "utf8"
  );

  const results = await searchMarkdown(paths.wikiDir, "routing orchestrator systems", 5);

  assert.equal(results[0]?.path, "wiki/concepts/multi-agent-systems.md");
  assert.equal(results[0]?.kind, "concept");
  assert.ok((results[0]?.backlinks ?? 0) >= 1);
  assert.ok((results[0]?.reasons ?? []).length > 0);
});
