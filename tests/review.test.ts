import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReadableReviewStem,
  composeSourceReviewInput,
  extractReviewQuestionCandidates,
  extractReviewUpdateCandidates
} from "../src/review.js";
import type { SourceRecord } from "../src/types.js";

const source: SourceRecord = {
  id: "source_123",
  slug: "less-is-more",
  title: "Less Is More: Recursive Reasoning with Tiny Networks",
  kind: "text",
  originalPath: "/tmp/clippings/article.md",
  storedPath: "raw/clips/less-is-more.md",
  checksum: "abc123",
  importedAt: "2026-04-03T20:00:00.000Z",
  metadata: {
    sourceUrl: "https://arxiv.org/abs/2510.04871",
    authors: ["Andrej Karpathy"],
    published: "2026-04-03",
    description: "A research note about recursive reasoning.",
    tags: ["clippings", "research"]
  },
  relatedAssets: ["raw/images/less-is-more/figure-1.png"]
};

test("buildReadableReviewStem produces a readable, date-prefixed review stem", () => {
  assert.equal(
    buildReadableReviewStem(source.title, "2026-04-03"),
    "2026-04-03-less-is-more-recursive-reasoning-with-tiny-networks-review"
  );
});

test("composeSourceReviewInput includes source metadata, bundle text, and wiki context", () => {
  const input = composeSourceReviewInput({
    source,
    sourceBundle: "Source bundle body.",
    wikiContext: "Relevant wiki page: [[recursive reasoning]]"
  });

  assert.match(input, /Source ID: source_123/);
  assert.match(input, /Source title: Less Is More: Recursive Reasoning with Tiny Networks/);
  assert.match(input, /Source URL: https:\/\/arxiv\.org\/abs\/2510\.04871/);
  assert.match(input, /Authors: Andrej Karpathy/);
  assert.match(input, /Related assets: raw\/images\/less-is-more\/figure-1\.png/);
  assert.match(input, /Source bundle:\nSource bundle body\./);
  assert.match(input, /Relevant wiki context:\nRelevant wiki page: \[\[recursive reasoning\]\]/);
});

test("composeSourceReviewInput falls back to a default wiki context message", () => {
  const input = composeSourceReviewInput({
    source,
    sourceBundle: "Source bundle body.",
    wikiContext: "   "
  });

  assert.match(input, /Relevant wiki context:\n- No additional wiki context supplied\./);
});

test("extractReviewQuestionCandidates and extractReviewUpdateCandidates read their list sections", () => {
  const review = [
    "# Review: Less Is More",
    "",
    "## Bottom Line",
    "- Strong single-source note.",
    "",
    "## Suggested Wiki Updates",
    "- Add an entity page for Karpathy.",
    "- Add an entity page for Karpathy.",
    "- Link the source to [[recursive reasoning]].",
    "- none",
    "",
    "## Open Questions",
    "- Does the note change the broader thesis?",
    "- What follow-up source would clarify the method?",
    "- none"
  ].join("\n");

  assert.deepEqual(extractReviewUpdateCandidates(review), [
    "Add an entity page for Karpathy.",
    "Link the source to [[recursive reasoning]]."
  ]);
  assert.deepEqual(extractReviewQuestionCandidates(review), [
    "Does the note change the broader thesis?",
    "What follow-up source would clarify the method?"
  ]);
});
