import test from "node:test";
import assert from "node:assert/strict";
import { collectEvolveConceptCandidates, collectEvolveQuestionCandidates, parsePathReasonBullets } from "../src/wiki.js";
import { listManagedSections, stripManagedSections } from "../src/utils.js";

test("parsePathReasonBullets reads path-and-rationale revision targets", () => {
  const markdown = `
# Revision Plan

## Priority Revision Targets
- wiki/concepts/recursion.md | reconcile the stronger and weaker definitions
- wiki/entities/trm.md | fold new evidence into the main entity page
`;

  assert.deepEqual(parsePathReasonBullets(markdown, "Priority Revision Targets"), [
    {
      path: "wiki/concepts/recursion.md",
      rationale: "reconcile the stronger and weaker definitions"
    },
    {
      path: "wiki/entities/trm.md",
      rationale: "fold new evidence into the main entity page"
    }
  ]);
});

test("collectEvolveQuestionCandidates and concept candidates read manager sections", () => {
  const markdown = `
# Revision Plan

## New Question Candidates
- What evidence best supports TRM over HRM?
- Which claims are now stale?

## New Concept Candidates
- Recursive evaluation strategy
`;

  assert.deepEqual(collectEvolveQuestionCandidates(markdown), [
    "What evidence best supports TRM over HRM?",
    "Which claims are now stale?"
  ]);
  assert.deepEqual(collectEvolveConceptCandidates(markdown), ["Recursive evaluation strategy"]);
});

test("stripManagedSections removes deterministic wiki blocks while preserving narrative", () => {
  const markdown = `
---
title: "Example"
---

# Example

Intro text.

<!-- kb:source-links:start -->
## Knowledge Graph
- [[wiki/concepts/example]]
<!-- kb:source-links:end -->

Closing text.
`;

  assert.match(stripManagedSections(markdown), /Intro text\./);
  assert.match(stripManagedSections(markdown), /Closing text\./);
  assert.equal(listManagedSections(markdown)[0]?.name, "source-links");
});
