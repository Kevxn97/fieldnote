import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { appendLogEntry, refreshNavigationArtifacts } from "../src/navigation.js";
import { ResolvedPaths } from "../src/types.js";

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

test("refreshNavigationArtifacts writes catalog plus entity and question indexes", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-navigation-"));
  const paths = buildPaths(root);

  await fs.mkdir(path.join(paths.wikiDir, "sources"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "entities"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "concepts"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "questions"), { recursive: true });
  await fs.mkdir(path.join(paths.wikiDir, "filed"), { recursive: true });

  await fs.writeFile(path.join(paths.wikiDir, "sources", "paper.md"), '# Paper\n\nA source summary.', "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "entities", "trm.md"), '# TRM\n\nAn entity summary.', "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "concepts", "recursion.md"), '# Recursion\n\nA concept summary.', "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "questions", "next-step.md"), '# Next Step\n\nAn open question.', "utf8");
  await fs.writeFile(path.join(paths.wikiDir, "filed", "brief.md"), '# Brief\n\nA filed output.', "utf8");

  await refreshNavigationArtifacts(paths);

  const catalog = await fs.readFile(path.join(paths.wikiDir, "system", "catalog.md"), "utf8");
  const entityIndex = await fs.readFile(path.join(paths.wikiDir, "system", "entity-index.md"), "utf8");
  const questionIndex = await fs.readFile(path.join(paths.wikiDir, "system", "question-index.md"), "utf8");
  const mainIndex = await fs.readFile(path.join(paths.wikiDir, "index.md"), "utf8");

  assert.match(catalog, /\[\[wiki\/sources\/paper\]\] - A source summary\./);
  assert.match(catalog, /\[\[wiki\/entities\/trm\]\] - An entity summary\./);
  assert.match(catalog, /\[\[wiki\/questions\/next-step\]\] - An open question\./);
  assert.match(entityIndex, /# Entity Index/);
  assert.match(questionIndex, /# Question Index/);
  assert.match(mainIndex, /\[\[wiki\/system\/catalog\]\]/);
  assert.match(mainIndex, /\[\[wiki\/system\/entity-index\]\]/);
  assert.match(mainIndex, /\[\[wiki\/system\/log\]\]/);
});

test("appendLogEntry appends parseable chronological headings", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-navigation-"));
  const paths = buildPaths(root);
  await fs.mkdir(path.join(paths.wikiDir, "system"), { recursive: true });

  await appendLogEntry({
    paths,
    kind: "ask",
    title: "What changed?",
    summary: "Generated a report.",
    files: ["outputs/answers/what-changed.md"]
  });

  const log = await fs.readFile(path.join(paths.wikiDir, "system", "log.md"), "utf8");
  assert.match(log, /^# Activity Log/m);
  assert.match(log, /^## \[\d{4}-\d{2}-\d{2} \d{2}:\d{2}\] ask \| What changed\?/m);
  assert.match(log, /- Summary: Generated a report\./);
  assert.match(log, /\[\[outputs\/answers\/what-changed\]\]/);
});
