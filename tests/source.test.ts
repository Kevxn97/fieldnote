import test from "node:test";
import assert from "node:assert/strict";
import { extractConcepts, extractEntities } from "../src/source.js";

test("extractEntities reads the Entities section from source summaries", () => {
  const markdown = `
# Tiny Recursive Model

## Summary
Summary text.

## Entities
- HRM
- Tiny Recursive Model
- None

## Concepts
- Recursive reasoning
- Small models
`;

  assert.deepEqual(extractEntities(markdown), ["HRM", "Tiny Recursive Model"]);
});

test("extractConcepts still reads Concepts separately from Entities", () => {
  const markdown = `
# Tiny Recursive Model

## Entities
- HRM

## Concepts
- Recursive reasoning
- Hierarchical reasoning
`;

  assert.deepEqual(extractConcepts(markdown), ["Recursive reasoning", "Hierarchical reasoning"]);
});
