import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  buildDashboardPayload,
  countOpenQuestionsInMarkdown,
  countWikiPageKinds,
  inferHealthLabel,
  latestSyncLabel
} from "../src/dashboard.js";
import { initializeProject, saveSources } from "../src/config.js";
import type { SourceRecord } from "../src/types.js";
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

  assert.match(output, /DEMO WORKSPACE/);
  assert.match(output, /╭─/);
  assert.match(output, /NEXT ACTIONS/);
  assert.match(output, /RECENT OUTPUTS/);
  assert.doesNotMatch(output, /\u001b\[/);
  for (const line of output.split("\n")) {
    assert.ok(line.length <= 84, `line exceeds width: ${line}`);
  }
});

test("renderTerminalDashboard surfaces optional system brief and compression stats", () => {
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
      recentOutputs: [],
      nextActions: [],
      recentActivity: [],
      sourceBreakdown: [],
      outputBreakdown: [],
      spotlightQuestions: [],
      systemBrief: {
        title: "System Brief",
        path: "wiki/system/brief.md",
        summary: "A compact orientation layer for the workspace.",
        highlights: ["Compression stays visible.", "Keep the dashboard readable."]
      },
      compressionStats: [
        { label: "Raw corpus", value: "12.0 KB across 5 sources" },
        { label: "Latest prompt pack", value: "12,000 / 20,000 chars" },
        { label: "Context cap", value: "45,000 chars" }
      ]
    },
    { color: false, width: 84 }
  );

  assert.match(output, /SYSTEM BRIEF/);
  assert.match(output, /COMPRESSION \/ PERFORMANCE/);
  assert.match(output, /Latest prompt pack/);
  assert.match(output, /Compression stays visible\./);
  for (const line of output.split("\n")) {
    assert.ok(line.length <= 84, `line exceeds width: ${line}`);
  }
});

test("buildDashboardPayload includes the system brief when present", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-dashboard-"));
  const { paths } = await initializeProject(root);
  const source: SourceRecord = {
    id: "source-1",
    slug: "source-1",
    title: "Source One",
    kind: "text",
    originalPath: path.join(root, "source-one.md"),
    storedPath: "raw/files/source-one.md",
    checksum: "abc123",
    importedAt: "2026-04-05T12:00:00.000Z"
  };

  await saveSources(paths, [source]);
  await fs.mkdir(path.join(paths.wikiDir, "system"), { recursive: true });
  await fs.mkdir(path.join(paths.metaDir, "context-packs"), { recursive: true });
  await fs.writeFile(
    path.join(paths.wikiDir, "system", "brief.md"),
    [
      "# Workspace Brief",
      "",
      "The dashboard should surface a compact summary of the workspace.",
      "",
      "- Compression remains visible.",
      "- Keep static output readable."
    ].join("\n"),
    "utf8"
  );
  await fs.writeFile(
    path.join(paths.metaDir, "context-packs", "latest.json"),
    JSON.stringify({
      workflow: "ask",
      createdAt: "2026-04-05T12:30:00.000Z",
      title: "Workspace question",
      query: "What changed?",
      budgetChars: 20000,
      usedChars: 12000,
      includedFileCount: 5,
      prioritizedFileCount: 2,
      retrievedFileCount: 3,
      includedPaths: ["wiki/system/brief.md"],
      topResults: [{ path: "wiki/system/brief.md", title: "Workspace Brief", score: 12, kind: "system" }]
    }, null, 2),
    "utf8"
  );

  const payload = await buildDashboardPayload(root);

  assert.ok(payload.systemBrief);
  assert.equal(payload.systemBrief?.title, "Workspace Brief");
  assert.equal(payload.systemBrief?.path, "vault/wiki/system/brief.md");
  assert.match(payload.systemBrief?.summary ?? "", /compact summary/);
  assert.match(payload.compressionStats?.[0]?.label ?? "", /Raw corpus/);
  assert.match(payload.compressionStats?.[2]?.label ?? "", /Latest prompt pack/);
  assert.ok((payload.compressionStats ?? []).length >= 4);
});
