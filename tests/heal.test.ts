import test from "node:test";
import assert from "node:assert/strict";
import { collectHealActionItems, collectHealArticleCandidates, extractBulletItemsFromSection } from "../src/wiki.js";

test("extractBulletItemsFromSection reads markdown bullet sections and ignores none", () => {
  const markdown = `
# Knowledge Base Health Report

## Suggested Repairs
- Fix backlinks for concept pages
- None

## High-Value New Article Candidates
- Compare HRM against TRM
`;

  assert.deepEqual(extractBulletItemsFromSection(markdown, "Suggested Repairs"), ["Fix backlinks for concept pages"]);
  assert.deepEqual(extractBulletItemsFromSection(markdown, "High-Value New Article Candidates"), ["Compare HRM against TRM"]);
});

test("collectHealActionItems combines deterministic and LLM-derived follow-ups", () => {
  const reportBody = `
# Knowledge Base Health Report

## Suggested Repairs
- Add stronger links between recursion concepts

## High-Value New Article Candidates
- Compare HRM against TRM
`;

  const items = collectHealActionItems({
    reportBody,
    pagesMissingEntities: ["wiki/sources/tiny-networks.md"],
    pagesMissingConcepts: ["wiki/sources/tiny-networks.md"],
    orphanEntities: ["wiki/entities/hrm.md"],
    orphanConcepts: ["wiki/concepts/old-concept.md"]
  });

  assert.deepEqual(items, [
    "Review and add entity coverage for [[wiki/sources/tiny-networks]]",
    "Review and add concept coverage for [[wiki/sources/tiny-networks]]",
    "Review whether orphan entity page [[wiki/entities/hrm]] should be refreshed, merged, or removed",
    "Review whether orphan concept page [[wiki/concepts/old-concept]] should be refreshed, merged, or removed",
    "Add stronger links between recursion concepts"
  ]);
});

test("collectHealArticleCandidates extracts article candidates separately", () => {
  const reportBody = `
# Knowledge Base Health Report

## High-Value New Article Candidates
- Compare HRM against TRM
- Research agenda for tiny recursive models
`;

  assert.deepEqual(collectHealArticleCandidates(reportBody), [
    "Compare HRM against TRM",
    "Research agenda for tiny recursive models"
  ]);
});
