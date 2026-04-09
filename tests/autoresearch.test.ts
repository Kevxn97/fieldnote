import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { AutoresearchEvidenceGroup, AutoresearchPlan, buildAutoresearchOutputPath, dedupeSearchResults, extractJsonPayload, mergeEvidenceGroups, mergeSearchResults, normalizeAutoresearchPlan, normalizePlanItem, parseAutoresearchPlan } from "../src/autoresearch.js";
import { ResolvedPaths, SearchResult } from "../src/types.js";

function buildPaths(root: string): ResolvedPaths {
  const vaultDir = path.join(root, "vault");
  return {
    root,
    vaultDir,
    clippingsDir: path.join(vaultDir, "Clippings"),
    obsidianDir: path.join(vaultDir, ".obsidian"),
    homeFile: path.join(vaultDir, "Home.md"),
    configFile: path.join(root, "kb.config.json"),
    rawDir: path.join(vaultDir, "raw"),
    wikiDir: path.join(vaultDir, "wiki"),
    outputDir: path.join(vaultDir, "outputs"),
    metaDir: path.join(root, ".kb"),
    sourcesFile: path.join(root, ".kb", "sources.json"),
    buildFile: path.join(root, ".kb", "build-state.json"),
    promptsDir: path.join(root, "prompts")
  };
}

function buildResult(pathName: string, score: number, title = pathName, snippet = `${title} snippet`): SearchResult {
  return {
    path: pathName,
    title,
    score,
    snippet,
    kind: "other",
    backlinks: 0,
    freshness: 0,
    reasons: []
  };
}

test("extractJsonPayload unwraps fenced and bare payloads", () => {
  assert.equal(
    extractJsonPayload("```json\n{\"title\":\"Plan\"}\n```"),
    "{\"title\":\"Plan\"}"
  );
  assert.equal(extractJsonPayload("  {\"title\":\"Plan\"}  "), "{\"title\":\"Plan\"}");
});

test("normalizePlanItem applies defaults and trims strings", () => {
  assert.equal(normalizePlanItem("   "), null);
  assert.deepEqual(normalizePlanItem("  compare paper A and paper B  "), {
    query: "compare paper A and paper B",
    why: "Relevant follow-up for the research question.",
    priority: "medium"
  });
  assert.deepEqual(
    normalizePlanItem({
      query: "  check contradictions  ",
      why: "  verify tension  ",
      priority: "high"
    }),
    {
      query: "check contradictions",
      why: "verify tension",
      priority: "high"
    }
  );
});

test("normalizeAutoresearchPlan dedupes, clamps, and keeps notes unique", () => {
  const plan = {
    title: "  Research Snapshot  ",
    focus: "  Focus area  ",
    subqueries: [
      "Alpha",
      "alpha",
      { query: "Beta", why: "b", priority: "low" },
      { query: "Gamma", why: "c", priority: "medium" },
      { query: "Delta", why: "d", priority: "medium" },
      { query: "Epsilon", why: "e", priority: "high" }
    ] as unknown as AutoresearchPlan["subqueries"],
    notes: ["  note one  ", "note one", "note two"]
  } as AutoresearchPlan;

  assert.deepEqual(normalizeAutoresearchPlan(plan, 4), {
    title: "Research Snapshot",
    focus: "Focus area",
    subqueries: [
      { query: "Alpha", why: "Relevant follow-up for the research question.", priority: "medium" },
      { query: "Beta", why: "b", priority: "low" },
      { query: "Gamma", why: "c", priority: "medium" },
      { query: "Delta", why: "d", priority: "medium" }
    ],
    notes: ["note one", "note two"]
  });
});

test("parseAutoresearchPlan reads loose markdown fallback plans", () => {
  const plan = parseAutoresearchPlan(
    [
      "# Research Title",
      "focus: Evaluate grounded search behavior",
      "",
      "- first follow-up",
      "- second follow-up"
    ].join("\n"),
    "fallback question"
  );

  assert.equal(plan.title, "Research Title");
  assert.equal(plan.focus, "Evaluate grounded search behavior");
  assert.deepEqual(plan.subqueries.map((item) => item.query), [
    "first follow-up",
    "second follow-up",
    "fallback question",
    "fallback question evidence",
    "fallback question contradictions",
    "fallback question comparisons"
  ]);
});

test("merge and dedupe search results keep best score per path", () => {
  const results = [
    buildResult("wiki/a.md", 4, "A"),
    buildResult("wiki/b.md", 1, "B"),
    buildResult("wiki/a.md", 7, "A"),
    buildResult("wiki/c.md", 3, "C")
  ];

  assert.deepEqual(dedupeSearchResults(results), [
    buildResult("wiki/a.md", 7, "A"),
    buildResult("wiki/c.md", 3, "C"),
    buildResult("wiki/b.md", 1, "B")
  ]);

  assert.deepEqual(
    mergeSearchResults([buildResult("wiki/a.md", 2, "A")], [buildResult("wiki/a.md", 5, "A"), buildResult("wiki/d.md", 1, "D")]),
    [
      buildResult("wiki/a.md", 5, "A"),
      buildResult("wiki/d.md", 1, "D")
    ]
  );
});

test("mergeEvidenceGroups merges repeated queries", () => {
  const groups: AutoresearchEvidenceGroup[] = [
    {
      query: "alpha",
      results: [buildResult("wiki/a.md", 2, "A"), buildResult("wiki/b.md", 1, "B")]
    },
    {
      query: "alpha",
      results: [buildResult("wiki/a.md", 4, "A"), buildResult("wiki/c.md", 3, "C")]
    }
  ];

  assert.deepEqual(mergeEvidenceGroups(groups), [
    {
      query: "alpha",
      results: [
        buildResult("wiki/a.md", 4, "A"),
        buildResult("wiki/c.md", 3, "C"),
        buildResult("wiki/b.md", 1, "B")
      ]
    }
  ]);
});

test("buildAutoresearchOutputPath uses readable dated filenames", () => {
  const paths = buildPaths("/tmp/llm-kb");
  assert.equal(
    buildAutoresearchOutputPath(paths, "Karpathy-style research flow", "report", "2026-04-03T12:34:56.000Z"),
    path.join("outputs", "research", "2026-04-03-karpathy-style-research-flow-report.md").replace(/\\/g, "/")
  );
  assert.equal(
    buildAutoresearchOutputPath(paths, "Slides title", "slides", "2026-04-03T12:34:56.000Z"),
    path.join("outputs", "research", "2026-04-03-slides-title-slides.md").replace(/\\/g, "/")
  );
});
