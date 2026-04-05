import path from "node:path";
import { slugifyValue } from "./utils.js";

export type OutputFormat = "answer" | "report" | "slides" | "chart";
export type OutputBucket = "answers" | "slides" | "charts";

export interface ReadableOutputFilenameOptions {
  title: string;
  format: string;
  date?: Date | string;
  sequence?: number;
  extension?: string;
}

export interface ChartValidationResult {
  ok: boolean;
  errors: string[];
}

const FORMAT_ALIASES: Record<string, OutputFormat> = {
  answer: "answer",
  markdown: "answer",
  report: "report",
  memo: "report",
  slides: "slides",
  marp: "slides",
  chart: "chart",
  plot: "chart",
  diagram: "chart",
  figure: "chart"
};

const OUTPUT_BUCKETS: Record<OutputFormat, OutputBucket> = {
  answer: "answers",
  report: "answers",
  slides: "slides",
  chart: "charts"
};

const REQUIRED_CHART_SECTIONS = [
  "What this chart shows",
  "Data",
  "Chart Spec",
  "Interpretation",
  "Caveats",
  "Next Questions"
];

export function normalizeOutputFormat(format: string): OutputFormat {
  return FORMAT_ALIASES[format.trim().toLowerCase()] ?? "answer";
}

export function selectOutputBucket(format: string): OutputBucket {
  return OUTPUT_BUCKETS[normalizeOutputFormat(format)];
}

export function buildReadableOutputFilename(options: ReadableOutputFilenameOptions): string {
  const format = normalizeOutputFormat(options.format);
  const dateStamp = toDateStamp(options.date ?? new Date());
  const slug = slugifyValue(options.title).slice(0, 72) || "output";
  const sequence = options.sequence && options.sequence > 1 ? `-${options.sequence}` : "";
  const extension = options.extension?.replace(/^\./, "") || "md";
  return `${dateStamp}-${format}-${slug}${sequence}.${extension}`;
}

export function buildReadableOutputPath(options: ReadableOutputFilenameOptions & { bucket?: OutputBucket }): string {
  const bucket = options.bucket ?? selectOutputBucket(options.format);
  return path.join(bucket, buildReadableOutputFilename(options)).replace(/\\/g, "/");
}

export function validateChartMarkdown(markdown: string): ChartValidationResult {
  const trimmed = markdown.trim();
  const errors: string[] = [];

  if (!trimmed) {
    return {
      ok: false,
      errors: ["Chart markdown is empty."]
    };
  }

  if (!/^#\s+.+/m.test(trimmed)) {
    errors.push("Missing top-level chart title.");
  }

  for (const heading of REQUIRED_CHART_SECTIONS) {
    if (!extractSectionBody(trimmed, heading)) {
      errors.push(`Missing required section: ${heading}.`);
    }
  }

  const dataSection = extractSectionBody(trimmed, "Data");
  if (dataSection && !hasBulletRows(dataSection)) {
    errors.push("The Data section should include at least one bullet row.");
  }

  const chartSpec = extractSectionBody(trimmed, "Chart Spec");
  if (chartSpec) {
    const chartType = extractChartSpecValue(chartSpec, "chart_type");
    if (!chartType) {
      errors.push("Chart Spec must include `chart_type`.");
    } else if (!["bar", "line", "scatter", "table"].includes(chartType.toLowerCase())) {
      errors.push("Chart Spec `chart_type` must be one of: bar, line, scatter, table.");
    }

    for (const key of ["x_axis", "y_axis", "series"]) {
      if (!extractChartSpecValue(chartSpec, key)) {
        errors.push(`Chart Spec must include \`${key}\`.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function toDateStamp(value: Date | string): string {
  if (typeof value === "string") {
    return value.slice(0, 10) || new Date().toISOString().slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

function extractSectionBody(markdown: string, heading: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headingLine = `## ${heading}`;
  const startIndex = lines.findIndex((line) => line.trim() === headingLine);
  if (startIndex === -1) {
    return "";
  }

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    if (line.trim().startsWith("## ")) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines.join("\n").trim();
}

function hasBulletRows(section: string): boolean {
  return section
    .split("\n")
    .map((line) => line.trim())
    .some((line) => /^-\s+/.test(line));
}

function extractChartSpecValue(section: string, key: string): string {
  const lines = section.split("\n");
  const directMatch = lines.find((line) => new RegExp(`^-\\s*${escapeRegExp(key)}\\s*:\\s*.+$`, "i").test(line.trim()));
  if (directMatch) {
    return directMatch.split(":").slice(1).join(":").trim();
  }

  const indentedMatch = lines.find((line) => new RegExp(`^${escapeRegExp(key)}\\s*:\\s*.+$`, "i").test(line.trim()));
  if (indentedMatch) {
    return indentedMatch.split(":").slice(1).join(":").trim();
  }

  return "";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
