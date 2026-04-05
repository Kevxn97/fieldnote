import { buildDashboardPayload, DashboardActionItem, DashboardActivityItem, DashboardBreakdownItem, DashboardOutputItem, DashboardPayload } from "./dashboard.js";

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  orange: "\u001b[38;5;214m",
  amber: "\u001b[38;5;221m",
  cyan: "\u001b[38;5;117m",
  green: "\u001b[38;5;114m",
  red: "\u001b[38;5;203m",
  gray: "\u001b[38;5;245m",
  darkGray: "\u001b[38;5;238m",
  white: "\u001b[38;5;255m",
} as const;

export interface TerminalRenderOptions {
  width?: number;
  color?: boolean;
}

export type TerminalPainter = ReturnType<typeof createTerminalPainter>;
const ANSI_PATTERN = /\u001b\[[0-9;]*m/g;

export async function loadTerminalDashboard(root: string, options?: TerminalRenderOptions): Promise<string> {
  const payload = await buildDashboardPayload(root);
  return renderTerminalDashboard(payload, options);
}

export function renderTerminalDashboard(payload: DashboardPayload, options?: TerminalRenderOptions): string {
  const width = resolveTerminalWidth(options?.width);
  const colorEnabled = options?.color ?? Boolean(process.stdout.isTTY);
  const paint = createTerminalPainter(colorEnabled);
  const innerWidth = width - 4;

  const sections = [
    banner(payload, paint, width),
    "",
    renderTerminalBox("STATUS", renderStatus(payload.summary, paint), width, paint),
    "",
    renderTerminalBox("COUNTS", renderCounts(payload.summary.counts, innerWidth, paint), width, paint),
    ...(payload.spotlightQuestions.length > 0 ? [
      "",
      renderTerminalBox("OPEN QUESTIONS", renderSpotlight(payload.spotlightQuestions, innerWidth, paint), width, paint),
    ] : []),
    "",
    renderTerminalBox("SOURCE MIX", renderBreakdown(payload.sourceBreakdown, innerWidth, "No sources imported yet.", paint), width, paint),
    "",
    renderTerminalBox("OUTPUT MIX", renderBreakdown(payload.outputBreakdown, innerWidth, "No generated outputs yet.", paint), width, paint),
    "",
    renderTerminalBox("NEXT ACTIONS", renderActions(payload.nextActions, innerWidth, paint), width, paint),
    "",
    renderTerminalBox("RECENT ACTIVITY", renderActivity(payload.recentActivity, innerWidth, paint), width, paint),
    "",
    renderTerminalBox("RECENT OUTPUTS", renderOutputs(payload.recentOutputs, innerWidth, paint), width, paint),
    "",
    footer(width, paint),
  ];

  return `${sections.join("\n").trimEnd()}\n`;
}

function banner(payload: DashboardPayload, paint: TerminalPainter, width: number): string {
  const topRule = paint.orange("━".repeat(width));
  const title = `  ${paint.orange("✦")}  ${paint.bold(paint.orange("RESEARCH WORKSPACE"))}  ${paint.dim("·")}  ${paint.cyan(payload.summary.name)}`;
  const bottomRule = paint.darkGray("─".repeat(width));
  const narrative = wrapTerminalLine(payload.summary.narrative, width - 4)
    .map((line) => `  ${paint.dim(line)}`)
    .join("\n");
  const hint = `  ${paint.darkGray("Obsidian = library + editing  ·  dashboard = intake, runs, outputs")}`;
  return [topRule, title, bottomRule, narrative, hint].join("\n");
}

function footer(width: number, paint: TerminalPainter): string {
  const hint = "kb · kb dashboard --static · kb --help";
  const dashes = Math.max(0, width - 6 - hint.length);
  return paint.darkGray(`── ${hint} ${"─".repeat(dashes)}`);
}

export function renderTerminalBox(title: string, lines: string[], width: number, paint: TerminalPainter): string {
  const inner = width - 4;
  const coloredTitle = paint.bold(paint.amber(title));
  const dashesAfter = Math.max(0, width - 5 - title.length);
  const top = `${paint.darkGray("╭─")} ${coloredTitle} ${paint.darkGray("─".repeat(dashesAfter) + "╮")}`;
  const wrapped = lines.flatMap((line) => wrapTerminalLine(line, inner));
  const body = wrapped.map((line) => `${paint.darkGray("│")} ${padRight(line, inner)} ${paint.darkGray("│")}`);
  const bottom = paint.darkGray(`╰${"─".repeat(width - 2)}╯`);
  return [top, ...body, bottom].join("\n");
}

function renderBreakdown(items: DashboardBreakdownItem[], innerWidth: number, emptyText: string, paint: TerminalPainter): string[] {
  if (items.length === 0) {
    return [paint.dim(emptyText)];
  }

  const maxValue = Math.max(...items.map((i) => i.value), 1);
  const labelWidth = Math.min(18, Math.max(...items.map((i) => i.label.length), 6));
  const valueWidth = Math.max(...items.map((i) => String(i.value).length), 1);
  const barWidth = Math.max(8, innerWidth - labelWidth - valueWidth - 6);

  return items.slice(0, 6).map((item) => {
    const filled = Math.max(1, Math.round((item.value / maxValue) * barWidth));
    const empty = barWidth - filled;
    const bar = paint.cyan("█".repeat(filled)) + paint.darkGray("░".repeat(empty));
    const valStr = paint.white(String(item.value).padStart(valueWidth));
    return `${paint.gray(padRight(item.label, labelWidth))}  ${bar}  ${valStr}`;
  });
}

function renderActions(actions: DashboardActionItem[], innerWidth: number, paint: TerminalPainter): string[] {
  if (actions.length === 0) {
    return [paint.dim("No suggested actions.")];
  }

  const result: string[] = [];
  for (let i = 0; i < actions.length; i++) {
    if (i > 0) result.push("");
    const titleLines = wrapTerminalLine(actions[i].title, innerWidth - 3);
    result.push(`${paint.amber(`${i + 1}.`)} ${paint.bold(titleLines[0])}`);
    for (let j = 1; j < titleLines.length; j++) {
      result.push(`   ${paint.bold(titleLines[j])}`);
    }
    const detailLines = wrapTerminalLine(actions[i].detail, innerWidth - 3);
    for (const dl of detailLines) {
      result.push(`   ${paint.gray(dl)}`);
    }
    const commandLines = wrapTerminalLine(actions[i].command, innerWidth - 5);
    for (let j = 0; j < commandLines.length; j++) {
      const prefix = j === 0 ? `${paint.cyan("❯")} ` : "  ";
      result.push(`   ${prefix}${paint.cyan(commandLines[j])}`);
    }
  }
  return result;
}

function renderActivity(items: DashboardActivityItem[], innerWidth: number, paint: TerminalPainter): string[] {
  if (items.length === 0) {
    return [paint.dim("No recorded activity.")];
  }

  const result: string[] = [];
  const visible = items.slice(0, 5);
  for (let i = 0; i < visible.length; i++) {
    if (i > 0) result.push("");
    const item = visible[i];
    const titleLines = wrapTerminalLine(item.title, innerWidth - 2);
    result.push(`${paint.cyan("▸")} ${paint.dim(item.time)}  ${paint.amber(item.kind)}  ${titleLines[0]}`);
    for (let j = 1; j < titleLines.length; j++) {
      result.push(`  ${titleLines[j]}`);
    }
    const summaryLines = wrapTerminalLine(item.summary, innerWidth - 2);
    for (const sl of summaryLines) {
      result.push(`  ${paint.gray(sl)}`);
    }
  }
  return result;
}

function renderOutputs(items: DashboardOutputItem[], innerWidth: number, paint: TerminalPainter): string[] {
  if (items.length === 0) {
    return [paint.dim("No generated outputs.")];
  }

  const result: string[] = [];
  const visible = items.slice(0, 4);
  for (let i = 0; i < visible.length; i++) {
    if (i > 0) result.push("");
    const item = visible[i];
    const titleLines = wrapTerminalLine(item.title, innerWidth - 2);
    result.push(`${paint.amber("◆")} ${paint.bold(titleLines[0])}`);
    for (let j = 1; j < titleLines.length; j++) {
      result.push(`  ${paint.bold(titleLines[j])}`);
    }
    const pathLines = wrapTerminalLine(item.path, innerWidth - 2);
    for (const pathLine of pathLines) {
      result.push(`  ${paint.dim(pathLine)}`);
    }
    const excerptLines = wrapTerminalLine(item.excerpt, innerWidth - 2);
    for (const el of excerptLines) {
      result.push(`  ${paint.gray(el)}`);
    }
  }
  return result;
}

// ── Status ─────────────────────────────────────────────

function renderStatus(summary: DashboardPayload["summary"], paint: TerminalPainter): string[] {
  const lw = 12;
  const lines = [
    `${stageIndicator(summary.stage, paint)}  ${paint.gray(padRight("Stage", lw))}${summary.stage}`,
    `${healthIndicator(summary.health, paint)}  ${paint.gray(padRight("Health", lw))}${healthColor(summary.health, paint)}`,
    `${paint.darkGray("·")}  ${paint.gray(padRight("Model", lw))}${summary.model}`,
    `${paint.darkGray("·")}  ${paint.gray(padRight("Last sync", lw))}${summary.lastSync}`,
  ];
  if (summary.counts.pendingCompile > 0) {
    const n = summary.counts.pendingCompile;
    lines.push(`${paint.amber("▲")}  ${paint.gray(padRight("Pending", lw))}${paint.amber(`${n} source${n === 1 ? "" : "s"} changed since last compile`)}`);
  }
  return lines;
}

function stageIndicator(stage: string, paint: TerminalPainter): string {
  if (stage === "In active use") return paint.green("●");
  if (stage === "Ready to generate") return paint.cyan("●");
  if (stage === "Ready to compile") return paint.amber("●");
  return paint.gray("○");
}

function healthIndicator(health: string, paint: TerminalPainter): string {
  if (health === "Healthy") return paint.green("●");
  if (health === "Needs review" || health === "Needs compile") return paint.amber("▲");
  if (health === "Unreviewed") return paint.gray("○");
  return paint.gray("○");
}

function healthColor(health: string, paint: TerminalPainter): string {
  if (health === "Healthy") return paint.green(health);
  if (health === "Needs review" || health === "Needs compile") return paint.amber(health);
  return paint.dim(health);
}

// ── Counts ─────────────────────────────────────────────

function renderCounts(
  counts: DashboardPayload["summary"]["counts"],
  innerWidth: number,
  paint: TerminalPainter,
): string[] {
  const pairs: [string, number][] = [
    ["Sources", counts.raw],
    ["Source pages", counts.sourcePages],
    ["Entities", counts.entities],
    ["Concepts", counts.concepts],
    ["Outputs", counts.outputs],
    ["Questions", counts.questions],
  ];

  const colWidth = Math.floor(innerWidth / 2);
  const lines: string[] = [];

  for (let i = 0; i < pairs.length; i += 2) {
    const left = countCell(pairs[i][0], pairs[i][1], colWidth, paint);
    const right = i + 1 < pairs.length ? countCell(pairs[i + 1][0], pairs[i + 1][1], colWidth, paint) : "";
    lines.push(left + right);
  }

  return lines;
}

function countCell(label: string, value: number, colWidth: number, paint: TerminalPainter): string {
  const labelWidth = 12;
  const valStr = String(value).padStart(4);
  const coloredVal = value > 0 ? paint.bold(paint.white(valStr)) : paint.dim(valStr);
  return padRight(`${paint.gray(padRight(label, labelWidth))} ${coloredVal}`, colWidth);
}

// ── Spotlight ──────────────────────────────────────────

function renderSpotlight(questions: string[], innerWidth: number, paint: TerminalPainter): string[] {
  const result: string[] = [];
  for (let i = 0; i < questions.length; i++) {
    if (i > 0) result.push("");
    const wrapped = wrapTerminalLine(questions[i], innerWidth - 3);
    result.push(`${paint.amber("?")}  ${wrapped[0]}`);
    for (let j = 1; j < wrapped.length; j++) {
      result.push(`   ${wrapped[j]}`);
    }
  }
  return result;
}

// ── Utilities ──────────────────────────────────────────

export function wrapTerminalLine(text: string, width: number): string[] {
  if (width <= 0) {
    return [text];
  }
  if (stripAnsi(text).length <= width) {
    return [text];
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const chunks = chunkAnsiToken(word, width);
    const firstChunk = chunks.shift() ?? word;
    const next = current ? `${current} ${firstChunk}` : firstChunk;
    if (stripAnsi(next).length <= width) {
      current = next;
    } else {
      if (current) {
        lines.push(current);
      }
      current = firstChunk;
    }
    for (const chunk of chunks) {
      if (current) {
        lines.push(current);
      }
      current = chunk;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [text.slice(0, width)];
}

function padRight(value: string, width: number): string {
  const visibleLength = stripAnsi(value).length;
  if (visibleLength >= width) {
    return value;
  }
  return `${value}${" ".repeat(width - visibleLength)}`;
}

function stripAnsi(value: string): string {
  return value.replace(ANSI_PATTERN, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resolveTerminalWidth(width?: number): number {
  return clamp(width ?? process.stdout.columns ?? 100, 72, 108);
}

export function createTerminalPainter(enabled: boolean) {
  const paint =
    (code: string) =>
    (value: string): string =>
      enabled ? `${code}${value}${ANSI.reset}` : value;

  return {
    bold: paint(ANSI.bold),
    dim: paint(ANSI.dim),
    orange: paint(ANSI.orange),
    amber: paint(ANSI.amber),
    cyan: paint(ANSI.cyan),
    green: paint(ANSI.green),
    red: paint(ANSI.red),
    gray: paint(ANSI.gray),
    darkGray: paint(ANSI.darkGray),
    white: paint(ANSI.white),
  };
}

function chunkAnsiToken(text: string, width: number): string[] {
  if (stripAnsi(text).length <= width) {
    return [text];
  }

  const chunks: string[] = [];
  let current = "";
  let visible = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\u001b") {
      const match = text.slice(index).match(/^\u001b\[[0-9;]*m/);
      if (match) {
        current += match[0];
        index += match[0].length - 1;
        continue;
      }
    }

    current += text[index];
    visible += 1;
    if (visible >= width) {
      chunks.push(current);
      current = "";
      visible = 0;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.length > 0 ? chunks : [text];
}
