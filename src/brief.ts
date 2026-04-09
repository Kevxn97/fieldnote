import { promises as fs } from "node:fs";
import path from "node:path";
import { buildDashboardPayload } from "./dashboard.js";
import { readLatestContextPack } from "./context-pack.js";
import { initializeProject } from "./config.js";
import { buildFrontmatter, ensureDir, timestamp } from "./utils.js";

export async function writeWorkspaceBrief(root: string): Promise<string> {
  const [{ paths }, payload, latestContextPack] = await Promise.all([
    initializeProject(root),
    buildDashboardPayload(root),
    initializeProject(root).then(({ paths }) => readLatestContextPack(paths))
  ]);

  const relPath = path.join("wiki", "system", "brief.md").replace(/\\/g, "/");
  const absolute = path.join(paths.vaultDir, relPath);
  const lines = [
    buildFrontmatter({
      kind: "index",
      title: "Workspace Brief",
      updated_at: timestamp(),
      tags: ["index", "brief", "workspace"]
    }).trimEnd(),
    "# Workspace Brief",
    "",
    payload.summary.narrative,
    "",
    "## Snapshot",
    `- Stage: ${payload.summary.stage}`,
    `- Health: ${payload.summary.health}`,
    `- Last sync: ${payload.summary.lastSync}`,
    `- Model: ${payload.summary.model}`,
    `- Sources: ${payload.summary.counts.raw}`,
    `- Source pages: ${payload.summary.counts.sourcePages}`,
    `- Entities: ${payload.summary.counts.entities}`,
    `- Concepts: ${payload.summary.counts.concepts}`,
    `- Outputs: ${payload.summary.counts.outputs}`,
    `- Open questions: ${payload.summary.counts.questions}`,
    "",
    "## Compression",
    ...(latestContextPack
      ? [
          `- Latest workflow: ${latestContextPack.workflow}`,
          `- Latest query: ${latestContextPack.query}`,
          `- Context budget: ${latestContextPack.budgetChars} chars`,
          `- Context used: ${latestContextPack.usedChars} chars`,
          `- Included files: ${latestContextPack.includedFileCount}`,
          ...(latestContextPack.artifactPath ? [`- Context pack: ${latestContextPack.artifactPath}`] : [])
        ]
      : ["- No context pack captured yet. Run `kb ask`, `kb review`, or `kb autoresearch`."]),
    "",
    "## Recommended Next Actions",
    ...(payload.nextActions.length
      ? payload.nextActions.flatMap((action) => [
          `- ${action.title}`,
          `  - ${action.detail}`,
          `  - Command: ${action.command}`
        ])
      : ["- None"]),
    "",
    "## Open Questions",
    ...(payload.spotlightQuestions.length
      ? payload.spotlightQuestions.map((question) => `- ${question}`)
      : ["- None surfaced yet."]),
    "",
    "## Recent Activity",
    ...(payload.recentActivity.length
      ? payload.recentActivity.slice(0, 4).map((item) => `- ${item.time} · ${item.kind} · ${item.title} — ${item.summary}`)
      : ["- No recorded activity yet."])
  ];

  await ensureDir(path.dirname(absolute));
  await fs.writeFile(absolute, `${lines.join("\n").trim()}\n`, "utf8");
  return relPath;
}
