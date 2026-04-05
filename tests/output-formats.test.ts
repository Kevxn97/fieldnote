import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  buildReadableOutputFilename,
  buildReadableOutputPath,
  selectOutputBucket,
  validateChartMarkdown
} from "../src/output-formats.js";

test("selectOutputBucket maps output formats to the expected folders", () => {
  assert.equal(selectOutputBucket("answer"), "answers");
  assert.equal(selectOutputBucket("report"), "answers");
  assert.equal(selectOutputBucket("memo"), "answers");
  assert.equal(selectOutputBucket("slides"), "slides");
  assert.equal(selectOutputBucket("marp"), "slides");
  assert.equal(selectOutputBucket("chart"), "charts");
  assert.equal(selectOutputBucket("diagram"), "charts");
});

test("buildReadableOutputFilename returns a dated, readable filename", () => {
  const filename = buildReadableOutputFilename({
    title: "What is new and important?",
    format: "report",
    date: "2026-04-03T12:34:56Z",
    sequence: 2
  });

  assert.equal(filename, "2026-04-03-report-what-is-new-and-important-2.md");
});

test("buildReadableOutputPath places outputs into the expected bucket", () => {
  const outputPath = buildReadableOutputPath({
    title: "Tiny Networks",
    format: "slides",
    date: "2026-04-03"
  });

  assert.equal(outputPath, path.posix.join("slides", "2026-04-03-slides-tiny-networks.md"));
});

test("validateChartMarkdown accepts a grounded chart brief", () => {
  const result = validateChartMarkdown([
    "# Research Trend Chart",
    "",
    "## What this chart shows",
    "A simple trend over three dated sources.",
    "",
    "## Data",
    "- 2026-04-01 | Paper A | 10",
    "- 2026-04-02 | Paper B | 15",
    "",
    "## Chart Spec",
    "- chart_type: line",
    "- x_axis: date",
    "- y_axis: count",
    "- series: papers",
    "",
    "## Interpretation",
    "The series rises over time.",
    "",
    "## Caveats",
    "This is a small sample.",
    "",
    "## Next Questions",
    "- What explains the change?"
  ].join("\n"));

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateChartMarkdown rejects chart markdown without required structure", () => {
  const result = validateChartMarkdown([
    "# Broken Chart",
    "",
    "## What this chart shows",
    "Something vague.",
    "",
    "## Data",
    "No bullets here.",
    "",
    "## Chart Spec",
    "- x_axis: date",
    "- y_axis: count",
    "- series: papers"
  ].join("\n"));

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /Data section should include at least one bullet row/);
  assert.match(result.errors.join("\n"), /chart_type/);
  assert.match(result.errors.join("\n"), /Missing required section: Interpretation/);
});

test("prompt files enforce the grounded slide and chart contract", async () => {
  const slidesPrompt = await fs.readFile(path.join(process.cwd(), "prompts/slides.md"), "utf8");
  const chartPrompt = await fs.readFile(path.join(process.cwd(), "prompts/chart.md"), "utf8");

  assert.match(slidesPrompt, /marp: true/);
  assert.match(slidesPrompt, /paginate: true/);
  assert.match(slidesPrompt, /6-10 slides/);
  assert.match(slidesPrompt, /title slide first/);
  assert.match(slidesPrompt, /Main-agent integration points:/);

  assert.match(chartPrompt, /chart_type: bar \| line \| scatter \| table/);
  assert.match(chartPrompt, /Do not invent numbers/);
  assert.match(chartPrompt, /If the material is not sufficient for a real chart/);
  assert.match(chartPrompt, /Main-agent integration points:/);
});
