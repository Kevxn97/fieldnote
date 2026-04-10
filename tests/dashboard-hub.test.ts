import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  parseHubCommand,
  renderDashboardHubScreen,
  resolveHubOpenTarget,
  resolveHubOutputSelection
} from "../src/dashboard-hub.js";
import { buildAskWorkflowSummaryLines } from "../src/cli-workflows.js";
import { resolvePaths } from "../src/config.js";
import { classifyWatchRefreshMode } from "../src/watch-mode.js";

test("parseHubCommand recognizes slash and plain command forms", () => {
  const sync = parseHubCommand("/sync");
  assert.equal(sync.name, "sync");
  assert.equal(sync.startsWithSlash, true);

  const review = parseHubCommand("review latest");
  assert.equal(review.name, "review");
  assert.equal(review.tail, "latest");

  const quickAsk = parseHubCommand("What changed this week?");
  assert.equal(quickAsk.name, "ask");
  assert.equal(quickAsk.isQuickQuestion, true);
  assert.equal(quickAsk.tail, "What changed this week?");
});

test("buildAskWorkflowSummaryLines surfaces preview and vault references", () => {
  const lines = buildAskWorkflowSummaryLines({
    question: "What changed this week in the workspace?",
    format: "report",
    outputPath: "outputs/answers/weekly-brief.md",
    outputMarkdown: [
      "---",
      'kind: "output"',
      "---",
      "",
      "# Weekly Brief",
      "",
      "The workspace now has clearer output visibility in the dashboard.",
      "",
      "## Highlights",
      "- The answer preview is shown directly after /ask.",
      "- Obsidian gets a direct open link."
    ].join("\n"),
    vaultName: "vault",
    filedPath: "wiki/filed/2026-04-10-weekly-brief.md",
    questionPaths: ["wiki/questions/dashboard-preview.md"]
  });

  assert.deepEqual(lines.slice(0, 4), [
    "Generated report: Weekly Brief",
    "Question: What changed this week in the workspace?",
    "Vault page: [[outputs/answers/weekly-brief]]",
    "Obsidian: obsidian://open?vault=vault&file=outputs%2Fanswers%2Fweekly-brief.md"
  ]);
  assert.ok(lines.includes("Filed page: [[wiki/filed/2026-04-10-weekly-brief]]"));
  assert.ok(lines.includes("Follow-up questions: [[wiki/questions/dashboard-preview]]"));
  assert.ok(lines.includes("Preview:"));
  assert.ok(lines.includes("The workspace now has clearer output visibility in the dashboard."));
});

test("buildAskWorkflowSummaryLines skips slide separators in dashboard previews", () => {
  const lines = buildAskWorkflowSummaryLines({
    question: "Turn this into slides",
    format: "slides",
    outputPath: "outputs/slides/weekly-brief.md",
    outputMarkdown: [
      "---",
      "marp: true",
      "theme: default",
      "---",
      "",
      "# Weekly Brief",
      "",
      "## Slide One",
      "- First point",
      "",
      "---",
      "",
      "## Slide Two",
      "- Second point"
    ].join("\n"),
    vaultName: "vault"
  });

  assert.ok(lines.includes("## Slide One"));
  assert.ok(lines.includes("- First point"));
  assert.ok(!lines.includes("---"));
  assert.ok(!lines.includes("- - First point"));
});

test("renderDashboardHubScreen stays ansi-free when color is disabled", () => {
  const output = renderDashboardHubScreen(
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
          path: "outputs/answers/weekly-brief.md",
          excerpt: "Top takeaways from the corpus."
        }
      ],
      nextActions: [
        {
          title: "Generate a reusable brief",
          detail: "Ask one sharp question and save the result as a report.",
          command: 'kb ask "What matters most in this source set?" --format report'
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
      spotlightQuestions: ["What are the key trade-offs in local-first architectures?"],
      systemBrief: {
        title: "System Brief",
        path: "vault/wiki/system/brief.md",
        summary: "A compact guide to the workspace state.",
        highlights: ["Compression should stay visible.", "Static output must remain readable."]
      },
      compressionStats: [
        { label: "Source cap", value: "30,000 chars" },
        { label: "Context cap", value: "45,000 chars" },
        { label: "Workspace compression", value: "5 raw -> 12 wiki files" }
      ]
    },
    {
      lastRunTitle: "ASK",
      lastRunLines: [
        "Wrote outputs/answers/weekly-brief.md",
        "Filed into wiki/filed/2026-04-05-weekly-brief.md"
      ]
    },
    { color: false, width: 84 }
  );

  assert.match(output, /COMMAND HUB/);
  assert.match(output, /ASK/);
  assert.match(output, /\/ask/);
  assert.doesNotMatch(output, /\u001b\[/);
  assert.match(output, /╭─ STATUS/);
  assert.match(output, /◆ Weekly brief/);
  assert.match(output, /SYSTEM BRIEF/);
  assert.match(output, /COMPRESSION \/ PERFORMANCE/);
  for (const line of output.split("\n")) {
    assert.ok(line.length <= 84, `line exceeds width: ${line}`);
  }
});

test("resolveHubOutputSelection and resolveHubOpenTarget respect vault-relative output paths", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-hub-"));
  await fs.mkdir(path.join(root, "vault", "outputs", "answers"), { recursive: true });
  await fs.mkdir(path.join(root, "vault", "wiki", "system"), { recursive: true });
  await fs.writeFile(path.join(root, "vault", "outputs", "answers", "weekly-brief.md"), "# Brief\n", "utf8");
  await fs.writeFile(path.join(root, "vault", "wiki", "system", "catalog.md"), "# Catalog\n", "utf8");

  const payload = {
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
        path: "outputs/answers/weekly-brief.md",
        excerpt: "Top takeaways from the corpus."
      }
    ],
    nextActions: [],
    recentActivity: [],
    sourceBreakdown: [],
    outputBreakdown: [],
    spotlightQuestions: []
  };

  const outputPath = await resolveHubOutputSelection({ root, payload, raw: "1" });
  assert.equal(outputPath, "outputs/answers/weekly-brief.md");

  const openOutputPath = await resolveHubOpenTarget({ root, payload, raw: "output 1" });
  assert.equal(openOutputPath, path.join(root, "vault", "outputs", "answers", "weekly-brief.md"));

  const openCatalogPath = await resolveHubOpenTarget({ root, payload, raw: "catalog" });
  assert.equal(openCatalogPath, path.join(root, "vault", "wiki", "system", "catalog.md"));
});

test("resolveHubOpenTarget rejects missing built-in targets", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-hub-missing-"));
  const payload = {
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
    spotlightQuestions: []
  };

  await assert.rejects(
    resolveHubOpenTarget({ root, payload, raw: "catalog" }),
    /Could not resolve/
  );
});

test("classifyWatchRefreshMode prefers update for clippings changes and sync for raw changes", () => {
  const paths = resolvePaths("/tmp/fieldnote-watch-test");

  assert.equal(
    classifyWatchRefreshMode([path.join(paths.rawDir, "files", "note.md")], paths),
    "sync"
  );
  assert.equal(
    classifyWatchRefreshMode([path.join(paths.clippingsDir, "clip.md")], paths),
    "update"
  );
  assert.equal(
    classifyWatchRefreshMode([
      path.join(paths.rawDir, "files", "note.md"),
      path.join(paths.clippingsDir, "clip.md")
    ], paths),
    "update"
  );
});
