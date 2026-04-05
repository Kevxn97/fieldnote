import test from "node:test";
import assert from "node:assert/strict";
import { countOpenQuestionsInMarkdown, countWikiPageKinds, inferHealthLabel, latestSyncLabel } from "../src/dashboard.js";
import { renderTerminalDashboard } from "../src/terminal-dashboard.js";

test("countOpenQuestionsInMarkdown counts bullets in the open questions section only", () => {
  const markdown = `
# Example

## Open Questions
- First
- Second

## Raw References
- raw/files/example.md
`;

  assert.equal(countOpenQuestionsInMarkdown(markdown), 2);
});

test("inferHealthLabel reflects empty and healthy states", () => {
  assert.equal(inferHealthLabel({ rawCount: 0, wikiCount: 0, latestHealthMarkdown: null }), "Empty");
  assert.equal(
    inferHealthLabel({
      rawCount: 4,
      wikiCount: 12,
      latestHealthMarkdown: "Source pages missing concepts: 0\nOrphan concept pages: 0"
    }),
    "Healthy"
  );
});

test("countWikiPageKinds works with Windows-style paths", () => {
  const counts = countWikiPageKinds([
    "C:\\repo\\vault\\wiki\\sources\\alpha.md",
    "C:\\repo\\vault\\wiki\\entities\\beta.md",
    "C:\\repo\\vault\\wiki\\concepts\\gamma.md",
    "C:\\repo\\vault\\wiki\\concepts\\delta.md"
  ]);

  assert.deepEqual(counts, {
    sourcePages: 1,
    entities: 1,
    concepts: 2
  });
});

test("latestSyncLabel includes entity page timestamps", () => {
  const label = latestSyncLabel({
    compiledSources: {
      one: { checksum: "a", pagePath: "wiki/sources/one.md", compiledAt: "2026-04-05T10:00:00.000Z" }
    },
    entityPages: {
      entity: { pagePath: "wiki/entities/entity.md", compiledAt: "2026-04-05T12:00:00.000Z" }
    },
    conceptPages: {
      concept: { pagePath: "wiki/concepts/concept.md", compiledAt: "2026-04-05T11:00:00.000Z" }
    }
  });

  assert.equal(label, new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date("2026-04-05T12:00:00.000Z")));
});

test("renderTerminalDashboard prints key sections without ANSI when color is disabled", () => {
  const longSlug = "very-long-output-name-that-should-wrap-cleanly-even-without-any-spaces-or-breakpoints";
  const output = renderTerminalDashboard(
    {
      summary: {
        name: "Demo Workspace",
        model: "gpt-5.4-mini (ask)",
        health: "Healthy",
        lastSync: "Apr 5, 2026, 12:34 PM",
        stage: "In active use",
        narrative: "Sources, wiki pages, and reusable outputs are all in motion.",
        counts: {
          raw: 5,
          wiki: 12,
          outputs: 3,
          questions: 2,
          pendingCompile: 1,
          sourcePages: 5,
          entities: 4,
          concepts: 3
        }
      },
      recentOutputs: [
        {
          title: "Weekly brief",
          path: `outputs/answers/${longSlug}.md`,
          excerpt: "Top takeaways from the corpus."
        }
      ],
      nextActions: [
        {
          title: "Generate a reusable brief",
          detail: "Ask one sharp question and save the result as a report.",
          command: `kb ask "${longSlug}" --format report`
        }
      ],
      recentActivity: [
        {
          time: "2026-04-05 12:30",
          kind: "ask",
          title: "Weekly brief",
          summary: "Generated a report and filed it back into the workspace."
        }
      ],
      sourceBreakdown: [{ label: "text", value: 5 }],
      outputBreakdown: [{ label: "answers", value: 3 }],
      spotlightQuestions: ["What are the key trade-offs in local-first architectures?"]
    },
    { color: false, width: 84 }
  );

  assert.match(output, /RESEARCH WORKSPACE/);
  assert.match(output, /╭─/);
  assert.match(output, /NEXT ACTIONS/);
  assert.match(output, /RECENT OUTPUTS/);
  assert.doesNotMatch(output, /\u001b\[/);
  for (const line of output.split("\n")) {
    assert.ok(line.length <= 84, `line exceeds width: ${line}`);
  }
});
