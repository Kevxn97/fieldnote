import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";

test("wiki-page prompts enforce article-style writing instead of meta wiki commentary", async () => {
  const promptFiles = [
    "prompts/concept-synthesizer.md",
    "prompts/comparison-drafter.md",
    "prompts/entity-synthesizer.md",
    "prompts/page-reviser.md"
  ];

  for (const relPath of promptFiles) {
    const content = await fs.readFile(path.join(process.cwd(), relPath), "utf8");
    assert.match(content, /internal wiki article/i, `${relPath} should explicitly require wiki-article style`);
    assert.match(content, /(Do not use meta phrases|Remove meta wording)/i, `${relPath} should actively forbid meta wording`);
  }
});
