import test from "node:test";
import assert from "node:assert/strict";
import { collectImpactedKnowledgeNodes, resolveKnowledgeRefreshTargets } from "../src/wiki.js";

test("collectImpactedKnowledgeNodes unions previous and current graph references", () => {
  const impacted = collectImpactedKnowledgeNodes(
    [
      { entities: ["OpenAI", "Anthropic"], concepts: ["Agents", "Guardrails"] },
      { entities: ["Obsidian"], concepts: ["Local-first"] }
    ],
    [
      { entities: ["OpenAI", "MemGPT"], concepts: ["Agents", "Memory"] }
    ]
  );

  assert.deepEqual(impacted, {
    entities: ["OpenAI", "Anthropic", "Obsidian", "MemGPT"],
    concepts: ["Agents", "Guardrails", "Local-first", "Memory"]
  });
});

test("resolveKnowledgeRefreshTargets keeps fast sync targeted and deep sync global", () => {
  const incremental = resolveKnowledgeRefreshTargets({
    depth: "incremental",
    allEntities: ["OpenAI", "Anthropic", "Obsidian", "MemGPT"],
    allConcepts: ["Agents", "Guardrails", "Local-first", "Memory"],
    previousEntries: [{ entities: ["Anthropic"], concepts: ["Guardrails"] }],
    currentEntries: [{ entities: ["MemGPT"], concepts: ["Memory"] }]
  });

  assert.deepEqual(incremental, {
    entities: ["Anthropic", "MemGPT"],
    concepts: ["Guardrails", "Memory"]
  });

  const deep = resolveKnowledgeRefreshTargets({
    depth: "deep",
    allEntities: ["OpenAI", "Anthropic", "Obsidian", "MemGPT"],
    allConcepts: ["Agents", "Guardrails", "Local-first", "Memory"],
    previousEntries: [],
    currentEntries: []
  });

  assert.deepEqual(deep, {
    entities: ["OpenAI", "Anthropic", "Obsidian", "MemGPT"],
    concepts: ["Agents", "Guardrails", "Local-first", "Memory"]
  });
});

test("incremental targets preserve old graph context when a source is replaced with a new slug", () => {
  const targets = resolveKnowledgeRefreshTargets({
    depth: "incremental",
    allEntities: ["Old Entity", "New Entity"],
    allConcepts: ["Old Concept", "New Concept"],
    previousEntries: [{ entities: ["Old Entity"], concepts: ["Old Concept"] }],
    currentEntries: [{ entities: ["New Entity"], concepts: ["New Concept"] }]
  });

  assert.deepEqual(targets, {
    entities: ["Old Entity", "New Entity"],
    concepts: ["Old Concept", "New Concept"]
  });
});
