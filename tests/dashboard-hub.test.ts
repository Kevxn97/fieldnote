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
      spotlightQuestions: ["What are the key trade-offs in local-first architectures?"]
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
