import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createInterface, Interface } from "node:readline/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { buildDashboardPayload, DashboardPayload } from "./dashboard.js";
import {
  runAddLatestWorkflow,
  runAddWorkflow,
  runAskWorkflow,
  runClipLatestWorkflow,
  runEvolveWorkflow,
  runFileOutputWorkflow,
  runHealWorkflow,
  runImportClippingsWorkflow,
  runReviewWorkflow,
  runSyncWorkflow,
  runUpdateWorkflow,
  WorkflowRunResult,
} from "./cli-workflows.js";
import {
  createTerminalPainter,
  renderTerminalBox,
  renderTerminalDashboard,
  resolveTerminalWidth,
  TerminalPainter,
  TerminalRenderOptions,
} from "./terminal-dashboard.js";

type HubCommandName =
  | "help"
  | "refresh"
  | "import"
  | "sync"
  | "ask"
  | "review"
  | "heal"
  | "evolve"
  | "outputs"
  | "questions"
  | "file"
  | "open"
  | "quit"
  | "unknown";

export interface HubCommand {
  name: HubCommandName;
  raw: string;
  tail: string;
  startsWithSlash: boolean;
  isQuickQuestion: boolean;
}

export interface HubRenderState {
  lastRunTitle: string;
  lastRunLines: string[];
}

export interface HubTargetResolutionArgs {
  root: string;
  payload: DashboardPayload;
  raw: string;
}

export async function startDashboardHub(
  root: string,
  options?: TerminalRenderOptions & { static?: boolean }
): Promise<void> {
  if (options?.static || !process.stdin.isTTY || !process.stdout.isTTY) {
    output.write(renderDashboardHubScreen(await buildDashboardPayload(root), {
      lastRunTitle: "STATIC MODE",
      lastRunLines: options?.static
        ? ["Rendered the command hub once and exited. Re-run `kb` in a TTY when you want the interactive loop."]
        : ["Interactive mode needs a TTY. Re-run `kb` or `kb dashboard` in a terminal to use the command hub."]
    }, options));
    return;
  }

  const hub = new DashboardHub(root, options);
  await hub.run();
}

export function parseHubCommand(raw: string): HubCommand {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { name: "refresh", raw, tail: "", startsWithSlash: false, isQuickQuestion: false };
  }

  const startsWithSlash = trimmed.startsWith("/");
  const normalized = startsWithSlash ? trimmed.slice(1).trim() : trimmed;
  const firstSpace = normalized.search(/\s/);
  const head = (firstSpace === -1 ? normalized : normalized.slice(0, firstSpace)).toLowerCase();
  const tail = firstSpace === -1 ? "" : normalized.slice(firstSpace + 1).trim();
  const wholeLower = normalized.toLowerCase();

  if (!startsWithSlash) {
    switch (head) {
      case "help":
      case "?":
        return { name: "help", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "d":
      case "dashboard":
      case "refresh":
        return { name: "refresh", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "i":
      case "import":
      case "add":
        return { name: "import", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "s":
      case "sync":
        return { name: "sync", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "a":
      case "ask":
        return { name: "ask", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "r":
      case "review":
        return { name: "review", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "h":
      case "heal":
        return { name: "heal", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "e":
      case "evolve":
        return { name: "evolve", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "o":
      case "outputs":
        return { name: "outputs", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "q":
      case "questions":
        return { name: "questions", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "file":
        return { name: "file", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "open":
        return { name: "open", raw, tail, startsWithSlash, isQuickQuestion: false };
      case "x":
      case "quit":
      case "exit":
        return { name: "quit", raw, tail, startsWithSlash, isQuickQuestion: false };
      default:
        return { name: "ask", raw, tail: trimmed, startsWithSlash: false, isQuickQuestion: true };
    }
  }

  switch (head) {
    case "help":
    case "?":
      return { name: "help", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "d":
    case "dashboard":
    case "refresh":
      return { name: "refresh", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "i":
    case "import":
    case "add":
      return { name: "import", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "s":
    case "sync":
      return { name: "sync", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "a":
    case "ask":
      return { name: "ask", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "r":
    case "review":
      return { name: "review", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "h":
    case "heal":
      return { name: "heal", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "e":
    case "evolve":
      return { name: "evolve", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "o":
    case "outputs":
      return { name: "outputs", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "q":
    case "questions":
      return { name: "questions", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "file":
      return { name: "file", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "open":
      return { name: "open", raw, tail, startsWithSlash, isQuickQuestion: false };
    case "x":
    case "quit":
    case "exit":
      return { name: "quit", raw, tail, startsWithSlash, isQuickQuestion: false };
    default:
      return { name: "unknown", raw, tail, startsWithSlash, isQuickQuestion: false };
  }
}

export function renderDashboardHubScreen(
  payload: DashboardPayload,
  state: HubRenderState,
  options?: TerminalRenderOptions
): string {
  const width = resolveTerminalWidth(options?.width);
  const colorEnabled = options?.color ?? Boolean(process.stdout.isTTY);
  const paint = createTerminalPainter(colorEnabled);
  const sections = [
    renderTerminalDashboard(payload, { width, color: colorEnabled }).trimEnd(),
    "",
    renderTerminalBox("COMMAND HUB", buildCommandHubLines(paint), width, paint),
  ];

  if (state.lastRunLines.length > 0) {
    sections.push("");
    sections.push(renderTerminalBox(state.lastRunTitle, trimVisibleLines(state.lastRunLines), width, paint));
  }

  return `${sections.join("\n").trimEnd()}\n`;
}

class DashboardHub {
  private readonly rl: Interface;
  private payload: DashboardPayload | null = null;
  private lastRunTitle = "HUB READY";
  private lastRunLines = [
    "Type /help for the command list, or just type a normal question to jump into /ask.",
    "Obsidian stays the long-form note UI. This hub is the operator console around it."
  ];

  constructor(
    private readonly root: string,
    private readonly options?: TerminalRenderOptions
  ) {
    this.rl = createInterface({ input, output, terminal: true, historySize: 100 });
  }

  async run(): Promise<void> {
    try {
      await this.refreshPayload();
      while (true) {
        this.draw();
        const command = await this.rl.question("hub> ");
        const shouldQuit = await this.handleInput(command);
        if (shouldQuit) {
          break;
        }
      }
    } finally {
      this.rl.close();
      output.write("\n");
    }
  }

  private async handleInput(raw: string): Promise<boolean> {
    const command = parseHubCommand(raw);
    try {
      switch (command.name) {
        case "help":
          this.setLastRun("HELP", helpLines());
          return false;
        case "refresh":
          await this.refreshPayload();
          this.setLastRun("REFRESH", ["Dashboard refreshed."]);
          return false;
        case "import":
          await this.handleImport(command);
          return false;
        case "sync":
          await this.executeWorkflow("SYNC", (progress) =>
            runSyncWorkflow(this.root, {
              deep: command.tail.trim().toLowerCase() === "deep" || command.tail.trim().toLowerCase() === "--deep",
              progress
            })
          );
          return false;
        case "ask":
          await this.handleAsk(command);
          return false;
        case "review":
          await this.handleReview(command);
          return false;
        case "heal":
          await this.handleHeal(command);
          return false;
        case "evolve":
          await this.handleEvolve(command);
          return false;
        case "outputs":
          this.showOutputs();
          return false;
        case "questions":
          this.showQuestions();
          return false;
        case "file":
          await this.handleFile(command);
          return false;
        case "open":
          await this.handleOpen(command);
          return false;
        case "quit":
          this.setLastRun("GOODBYE", ["Leaving the command hub. Your vault is unchanged."]);
          this.draw();
          return true;
        case "unknown":
          this.setLastRun("UNKNOWN COMMAND", [
            `Unknown slash command: ${command.raw.trim()}`,
            "Use /help to see the supported commands."
          ]);
          return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.setLastRun("ERROR", [message]);
      await this.refreshPayload();
      return false;
    }

    return false;
  }

  private async handleImport(command: HubCommand): Promise<void> {
    const direct = command.tail.trim();
    if (direct) {
      const mode = direct.toLowerCase();
      if (mode === "latest" || mode === "latest-clipping" || mode === "latest-clip") {
        const workflow = mode === "latest-clip" || mode === "latest-clipping"
          ? runClipLatestWorkflow
          : runAddLatestWorkflow;
        await this.executeWorkflow("IMPORT", () => workflow(this.root));
        return;
      }
      if (mode === "all" || mode === "clippings") {
        await this.executeWorkflow("IMPORT", () => runImportClippingsWorkflow(this.root));
        return;
      }
      if (mode === "update") {
        await this.executeWorkflow("UPDATE", (progress) => runUpdateWorkflow(this.root, { progress }));
        return;
      }
      await this.executeWorkflow("IMPORT", () => runAddWorkflow(this.root, direct));
      return;
    }

    const mode = (await this.prompt("Import mode [path/latest/latest-clip/all/update]", "path")).toLowerCase();
    if (mode === "latest") {
      await this.executeWorkflow("IMPORT", () => runAddLatestWorkflow(this.root));
      return;
    }
    if (mode === "latest-clip" || mode === "latest-clipping") {
      await this.executeWorkflow("IMPORT", () => runClipLatestWorkflow(this.root));
      return;
    }
    if (mode === "all") {
      await this.executeWorkflow("IMPORT", () => runImportClippingsWorkflow(this.root));
      return;
    }
    if (mode === "update") {
      await this.executeWorkflow("UPDATE", (progress) => runUpdateWorkflow(this.root, { progress }));
      return;
    }

    const target = await this.prompt("Path to source", "");
    if (!target.trim()) {
      this.setLastRun("IMPORT CANCELLED", ["No path provided. Nothing was imported."]);
      return;
    }
    await this.executeWorkflow("IMPORT", () => runAddWorkflow(this.root, target.trim()));
  }

  private async handleAsk(command: HubCommand): Promise<void> {
    const initialQuestion = command.tail.trim();
    const question = initialQuestion || await this.prompt("Question", "");
    if (!question.trim()) {
      this.setLastRun("ASK CANCELLED", ["No question provided."]);
      return;
    }

    const format = normalizeAskFormat(await this.prompt("Format [answer/report/slides/chart]", "answer"));
    const fileIntoWiki = await this.confirm("File output into wiki?", false);
    await this.executeWorkflow("ASK", () =>
      runAskWorkflow(this.root, {
        question: question.trim(),
        format,
        fileIntoWiki
      })
    );
  }

  private async handleReview(command: HubCommand): Promise<void> {
    const sourceSelector = command.tail.trim() || await this.prompt("Source selector", "latest");
    const apply = await this.confirm("Apply follow-up suggestions?", false);
    await this.executeWorkflow("REVIEW", () =>
      runReviewWorkflow(this.root, {
        sourceSelector: sourceSelector.trim() || "latest",
        apply
      })
    );
  }

  private async handleHeal(command: HubCommand): Promise<void> {
    const apply = command.tail.trim().toLowerCase() === "apply" || await this.confirm("Apply additive heal suggestions?", false);
    await this.executeWorkflow("HEAL", () => runHealWorkflow(this.root, { apply }));
  }

  private async handleEvolve(command: HubCommand): Promise<void> {
    const rounds = parsePositiveInt(await this.prompt("Rounds", "2"), 2);
    const maxPages = parsePositiveInt(await this.prompt("Max pages", "4"), 4);
    const untilStable = command.tail.trim().toLowerCase() === "stable" || await this.confirm("Run until stable?", false);
    await this.executeWorkflow("EVOLVE", (progress) =>
      runEvolveWorkflow(this.root, {
        rounds,
        maxPages,
        untilStable,
        progress
      })
    );
  }

  private async handleFile(command: HubCommand): Promise<void> {
    const target = command.tail.trim() || await this.prompt("Output number or path", "");
    if (!target.trim()) {
      this.setLastRun("FILE CANCELLED", ["No output selected."]);
      return;
    }

    const resolved = await resolveHubOutputSelection({
      root: this.root,
      payload: this.payload ?? emptyDashboardPayload(),
      raw: target.trim()
    });
    const title = await this.prompt("Title override (optional)", "");
    await this.executeWorkflow("FILE OUTPUT", () =>
      runFileOutputWorkflow(this.root, {
        output: resolved,
        title: title.trim() || undefined
      })
    );
  }

  private async handleOpen(command: HubCommand): Promise<void> {
    const target = command.tail.trim() || await this.prompt("Open target", "vault");
    const resolved = await resolveHubOpenTarget({
      root: this.root,
      payload: this.payload ?? emptyDashboardPayload(),
      raw: target.trim()
    });
    await openInSystem(resolved);
    this.setLastRun("OPEN", [`Opened ${path.relative(this.root, resolved) || resolved}`]);
  }

  private async executeWorkflow(
    title: string,
    run: (progress: (message: string) => void) => Promise<WorkflowRunResult>
  ): Promise<void> {
    const progressLines: string[] = [];
    this.setLastRun(`RUNNING ${title}`, ["Preparing run..."]);
    this.draw();

    const result = await run((message) => {
      progressLines.push(message);
      this.lastRunTitle = `RUNNING ${title}`;
      this.lastRunLines = trimProgressLines(progressLines);
      this.draw();
    });

    await this.refreshPayload();
    this.setLastRun(title, result.lines);
  }

  private showOutputs(): void {
    const outputs = this.payload?.recentOutputs ?? [];
    if (outputs.length === 0) {
      this.setLastRun("OUTPUTS", ["No generated outputs yet.", "Run /ask first, then use /file or /open when something looks strong."]);
      return;
    }

    this.setLastRun("OUTPUTS", [
      "Recent outputs:",
      ...outputs.map((item, index) => `${index + 1}. ${item.title} -> ${item.path}`),
      "",
      "Next:",
      "- /open output 1",
      "- /file 1"
    ]);
  }

  private showQuestions(): void {
    const questions = this.payload?.spotlightQuestions ?? [];
    if (questions.length === 0) {
      this.setLastRun("QUESTIONS", ["No spotlight questions yet.", "Run /review, /heal, or /ask --file flow to surface more follow-ups."]);
      return;
    }

    this.setLastRun("QUESTIONS", [
      "Spotlight questions:",
      ...questions.map((question, index) => `${index + 1}. ${question}`),
      "",
      "Tip: paste one of these directly at the prompt to jump into /ask."
    ]);
  }

  private async refreshPayload(): Promise<void> {
    this.payload = await buildDashboardPayload(this.root);
  }

  private setLastRun(title: string, lines: string[]): void {
    this.lastRunTitle = title;
    this.lastRunLines = trimVisibleLines(lines);
  }

  private draw(): void {
    if (!this.payload) {
      return;
    }

    output.write("\u001b[2J\u001b[H");
    output.write(renderDashboardHubScreen(this.payload, {
      lastRunTitle: this.lastRunTitle,
      lastRunLines: this.lastRunLines
    }, this.options));
  }

  private async prompt(label: string, defaultValue: string): Promise<string> {
    const suffix = defaultValue ? ` (${defaultValue})` : "";
    const answer = await this.rl.question(`${label}${suffix}: `);
    return answer.trim() || defaultValue;
  }

  private async confirm(label: string, defaultValue: boolean): Promise<boolean> {
    const suffix = defaultValue ? "Y/n" : "y/N";
    const answer = (await this.rl.question(`${label} [${suffix}]: `)).trim().toLowerCase();
    if (!answer) {
      return defaultValue;
    }
    return ["y", "yes"].includes(answer);
  }
}

function buildCommandHubLines(paint: TerminalPainter): string[] {
  return [
    paint.dim("WORKFLOW"),
    `  ${paint.cyan("/import")}   ${paint.gray("i")}   add a source, use the latest clipping, or run the inbox update`,
    `  ${paint.cyan("/sync")}     ${paint.gray("s")}   run the fast incremental source + graph refresh`,
    `  ${paint.cyan("/sync deep")}      full graph rebuild across all entity and concept pages`,
    `  ${paint.cyan("/ask")}      ${paint.gray("a")}   ask a question, choose a format, optionally file it back`,
    `  ${paint.cyan("/review")}   ${paint.gray("r")}   review the latest or selected source against the current wiki`,
    `  ${paint.cyan("/heal")}     ${paint.gray("h")}   run the health pass and optionally apply additive fixes`,
    `  ${paint.cyan("/evolve")}   ${paint.gray("e")}   run the deeper maintenance loop for entities and concepts`,
    "",
    paint.dim("BROWSE"),
    `  ${paint.cyan("/outputs")}    ${paint.gray("o")}   inspect recent outputs, then ${paint.cyan("/file")} or ${paint.cyan("/open")} one`,
    `  ${paint.cyan("/questions")}  ${paint.gray("q")}   inspect surfaced follow-up questions from the workspace`,
    `  ${paint.cyan("/open")} ${paint.dim("...")}        open ${paint.cyan("vault")}, ${paint.cyan("home")}, ${paint.cyan("catalog")}, ${paint.cyan("log")}, or ${paint.cyan("output 1")}`,
    "",
    paint.dim("SYSTEM"),
    `  ${paint.cyan("/refresh")}  ${paint.gray("d")}   redraw the screen`,
    `  ${paint.cyan("/quit")}     ${paint.gray("x")}   leave the hub`,
    "",
    `  ${paint.dim("Tip: type a plain question at the prompt to jump into a quick /ask flow.")}`,
  ];
}

function helpLines(): string[] {
  return [
    "/import",
    "- `path` imports one source",
    "- `latest` pulls the newest importable clipping",
    "- `latest-clip` pulls the newest markdown clip specifically",
    "- `all` imports the whole Clippings inbox",
    "- `update` runs the full inbox -> fast sync workflow",
    "/sync",
    "- no argument = fast incremental refresh",
    "- `deep` = full graph rebuild",
    "/open",
    "- `vault`, `home`, `catalog`, `log`, `review-queue`, `output 1`",
    "Plain text",
    "- If it is not a known command, the hub treats it as a quick question for /ask."
  ];
}

function normalizeAskFormat(raw: string): "answer" | "report" | "slides" | "chart" {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "slides" || normalized === "chart" || normalized === "answer") {
    return normalized;
  }
  return "report";
}

function trimVisibleLines(lines: string[], maxLines = 14): string[] {
  if (lines.length <= maxLines) {
    return lines;
  }
  const visible = lines.slice(0, maxLines - 1);
  visible.push(`... ${lines.length - visible.length} more line(s)`);
  return visible;
}

function trimProgressLines(lines: string[], maxLines = 10): string[] {
  if (lines.length <= maxLines) {
    return lines;
  }
  return lines.slice(-maxLines);
}

function parsePositiveInt(raw: string, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function openInSystem(targetPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child =
      process.platform === "darwin"
        ? spawn("open", [targetPath], { stdio: "ignore" })
        : process.platform === "win32"
          ? spawn("cmd", ["/c", "start", "", targetPath], { stdio: "ignore" })
          : spawn("xdg-open", [targetPath], { stdio: "ignore" });

    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Could not open ${targetPath}. Exit code: ${code ?? "unknown"}`));
    });
  });
}

export async function resolveHubOutputSelection(args: HubTargetResolutionArgs): Promise<string> {
  const normalized = args.raw.trim();
  if (!normalized) {
    throw new Error("No output selected.");
  }

  const outputMatch = normalized.match(/^(?:output\s+)?(\d+)$/i);
  if (outputMatch) {
    const index = Number(outputMatch[1]) - 1;
    const item = args.payload.recentOutputs[index];
    if (!item) {
      throw new Error(`No recent output at position ${index + 1}.`);
    }
    return item.path;
  }

  return resolveHubPathLikeSelection(args.root, normalized);
}

export async function resolveHubOpenTarget(args: HubTargetResolutionArgs): Promise<string> {
  const normalized = args.raw.trim().toLowerCase();
  const systemPages = new Map<string, string>([
    ["vault", "vault"],
    ["home", "vault/Home.md"],
    ["catalog", "vault/wiki/system/catalog.md"],
    ["log", "vault/wiki/system/log.md"],
    ["review-queue", "vault/wiki/system/review-queue.md"],
    ["revision-queue", "vault/wiki/system/revision-queue.md"],
    ["contradictions", "vault/wiki/system/contradictions.md"],
    ["graph-audit", "vault/wiki/system/graph-audit.md"],
  ]);

  const mapped = systemPages.get(normalized);
  if (mapped) {
    return resolveExistingAbsoluteTarget(path.resolve(args.root, mapped));
  }

  const outputMatch = args.raw.match(/^output\s+(\d+)$/i);
  if (outputMatch) {
    return resolveHubPathLikeSelection(args.root, await resolveHubOutputSelection({
      root: args.root,
      payload: args.payload,
      raw: outputMatch[1]
    }));
  }

  return resolveHubPathLikeSelection(args.root, args.raw);
}

async function resolveHubPathLikeSelection(root: string, raw: string): Promise<string> {
  const absoluteCandidate = path.isAbsolute(raw) ? raw : path.resolve(root, raw);
  if (await pathExists(absoluteCandidate)) {
    return absoluteCandidate;
  }

  const vaultCandidate = path.resolve(root, "vault", raw);
  if (await pathExists(vaultCandidate)) {
    return vaultCandidate;
  }

  throw new Error(`Could not resolve "${raw}" to an existing file or directory.`);
}

async function resolveExistingAbsoluteTarget(targetPath: string): Promise<string> {
  if (await pathExists(targetPath)) {
    return targetPath;
  }
  throw new Error(`Could not resolve "${targetPath}" to an existing file or directory.`);
}

function emptyDashboardPayload(): DashboardPayload {
  return {
    summary: {
      name: "Fieldnote",
      model: "gpt-5.4-mini (ask)",
      health: "Empty",
      lastSync: "Not compiled yet",
      stage: "Inbox empty",
      narrative: "Add a few sources to turn this empty vault into a working research workspace.",
      counts: {
        raw: 0,
        wiki: 0,
        outputs: 0,
        questions: 0,
        pendingCompile: 0,
        sourcePages: 0,
        entities: 0,
        concepts: 0
      }
    },
    recentOutputs: [],
    nextActions: [],
    recentActivity: [],
    sourceBreakdown: [],
    outputBreakdown: [],
    spotlightQuestions: []
  };
}
