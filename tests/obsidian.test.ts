import test from "node:test";
import assert from "node:assert/strict";
import { buildFrontmatter, stripFrontmatter, toObsidianOpenUri } from "../src/utils.js";

test("buildFrontmatter formats scalar and list values for Obsidian-friendly markdown", () => {
  const frontmatter = buildFrontmatter({
    title: "Example",
    kind: "filed-output",
    tags: ["filed", "output"]
  });

  assert.match(frontmatter, /^---/);
  assert.match(frontmatter, /title: "Example"/);
  assert.match(frontmatter, /kind: "filed-output"/);
  assert.match(frontmatter, /tags:\n  - "filed"\n  - "output"/);
});

test("stripFrontmatter removes a leading yaml block", () => {
  const markdown = ['---', 'title: "Example"', '---', '', '# Note'].join("\n");
  assert.equal(stripFrontmatter(markdown), "# Note");
});

test("toObsidianOpenUri builds a vault-relative open link", () => {
  assert.equal(
    toObsidianOpenUri("vault", "outputs/answers/weekly brief.md"),
    "obsidian://open?vault=vault&file=outputs%2Fanswers%2Fweekly%20brief.md"
  );
});
