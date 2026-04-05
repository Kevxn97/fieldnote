#!/usr/bin/env node
import { Command } from "commander";
import { startDashboardHub } from "./dashboard-hub.js";
import {
  runAddLatestWorkflow,
  runAddWorkflow,
  runAskWorkflow,
  runAutoresearchWorkflow,
  runClipLatestWorkflow,
  runClipWorkflow,
  runCompileWorkflow,
  runFileOutputWorkflow,
  runImportClippingsWorkflow,
  runInitWorkflow,
  runIngestWorkflow,
  runObsidianSetupWorkflow,
  runReviewWorkflow,
  runSearchWorkflow,
  runStatusWorkflow,
  runSyncWorkflow,
  runUpdateWorkflow,
  runHealWorkflow,
  runEvolveWorkflow,
  WorkflowRunResult,
} from "./cli-workflows.js";
import { AskFormat } from "./types.js";

const program = new Command();

program
  .name("kb")
  .description("File-based research workspace for raw sources, compiled wiki knowledge, and reusable outputs.")
  .version("0.1.0")
  .action(async () => {
    await startDashboardHub(process.cwd());
  });

program
  .command("init")
  .description("Create the default vault structure and config files in the current repo.")
  .action(async () => {
    await printWorkflow(runInitWorkflow(process.cwd()));
  });

program
  .command("ingest")
  .description("Copy a local file or directory into raw/ and register it in the source manifest.")
  .argument("<target>", "Local file or directory to import")
  .action(async (target: string) => {
    await printWorkflow(runIngestWorkflow(process.cwd(), target));
  });

program
  .command("add")
  .description("Import a source with one simple command. Clips go to raw/clips, everything else to raw/files or raw/repos.")
  .argument("<target>", "Clip, PDF, repo, dataset, or markdown file")
  .action(async (target: string) => {
    await printWorkflow(runAddWorkflow(process.cwd(), target));
  });

program
  .command("clip")
  .description("Import an Obsidian Web Clipper markdown file or folder into raw/clips.")
  .argument("<target>", "Clipped article markdown file or related clip folder")
  .action(async (target: string) => {
    await printWorkflow(runClipWorkflow(process.cwd(), target));
  });

program
  .command("clip-latest")
  .description("Import the newest markdown clip from the Clippings/ folder.")
  .option("-d, --dir <dir>", "Clippings folder", "")
  .action(async (options: { dir: string }) => {
    await printWorkflow(runClipLatestWorkflow(process.cwd(), { dir: options.dir }));
  });

program
  .command("add-latest")
  .description("Import the newest supported file from the vault Clippings folder with one simple command.")
  .option("-d, --dir <dir>", "Clippings folder", "")
  .action(async (options: { dir: string }) => {
    await printWorkflow(runAddLatestWorkflow(process.cwd(), { dir: options.dir }));
  });

program
  .command("import-clippings")
  .description("Import all supported markdown and PDF files from the Clippings/ folder.")
  .option("-d, --dir <dir>", "Clippings folder", "")
  .option("--limit <limit>", "Import only the newest N clips", "0")
  .action(async (options: { dir: string; limit: string }) => {
    await printWorkflow(
      runImportClippingsWorkflow(process.cwd(), {
        dir: options.dir,
        limit: Number(options.limit)
      })
    );
  });

program
  .command("update")
  .description("Import all supported files from Clippings, run a fast incremental sync, then clear the imported Clippings inbox.")
  .option("-d, --dir <dir>", "Clippings folder", "")
  .option("--deep", "After import, run a deep graph rebuild instead of the fast incremental sync")
  .action(async (options: { dir: string; deep?: boolean }) => {
    await printWorkflow(
      runUpdateWorkflow(process.cwd(), {
        dir: options.dir,
        deep: options.deep,
        progress: (message) => console.log(`[update] ${message}`)
      })
    );
  });

program
  .command("compile")
  .description("Run a full deep rebuild of source, entity, and concept pages, then refresh indexes.")
  .action(async () => {
    await printWorkflow(
      runCompileWorkflow(process.cwd(), {
        progress: (message) => console.log(`[compile] ${message}`)
      })
    );
  });

program
  .command("sync")
  .description("Run a fast incremental sync over changed sources. Use --deep for a full graph rebuild.")
  .option("--deep", "Rebuild all entity and concept pages instead of only impacted nodes")
  .action(async (options: { deep?: boolean }) => {
    await printWorkflow(
      runSyncWorkflow(process.cwd(), {
        deep: options.deep,
        progress: (message) => console.log(`[sync] ${message}`)
      })
    );
  });

program
  .command("review")
  .description("Review one source against the current wiki. With no argument, reviews the most recently imported source.")
  .argument("[source]", "Source id, slug, title, stored path, or original path")
  .option("--apply", "Turn review suggestions into additive follow-up notes and review-queue entries")
  .action(async (sourceSelector: string | undefined, options: { apply?: boolean }) => {
    await printWorkflow(
      runReviewWorkflow(process.cwd(), {
        sourceSelector,
        apply: options.apply
      })
    );
  });

program
  .command("ask")
  .description("Answer a question against the compiled wiki and write the result into outputs/.")
  .argument("<question>", "Research question")
  .option("-f, --format <format>", "answer | report | slides | chart", "answer")
  .option("--file-into-wiki", "Also file the generated answer back into wiki/filed for Obsidian")
  .action(async (question: string, options: { format: AskFormat; fileIntoWiki?: boolean }) => {
    await printWorkflow(
      runAskWorkflow(process.cwd(), {
        question,
        format: options.format,
        fileIntoWiki: options.fileIntoWiki
      })
    );
  });

program
  .command("autoresearch")
  .alias("research")
  .description("Run an experimental broader research workflow: plan subqueries, search the wiki, and synthesize a report, deck, or chart.")
  .argument("<question>", "Research question")
  .option("-f, --format <format>", "report | slides | chart", "report")
  .option("-t, --title <title>", "Override the generated output title")
  .option("--rounds <count>", "Planner/search rounds to run", "2")
  .option("--max-subqueries <count>", "Maximum subqueries per round", "5")
  .option("--max-results-per-query <count>", "Maximum retrieved pages per subquery", "6")
  .option("--file-into-wiki", "Also file the generated research output back into wiki/filed")
  .action(
    async (
      question: string,
      options: {
        format: "report" | "slides" | "chart";
        title?: string;
        rounds: string;
        maxSubqueries: string;
        maxResultsPerQuery: string;
        fileIntoWiki?: boolean;
      }
    ) => {
      await printWorkflow(
        runAutoresearchWorkflow(process.cwd(), {
          question,
          format: options.format,
          title: options.title,
          rounds: Number(options.rounds),
          maxSubqueries: Number(options.maxSubqueries),
          maxResultsPerQuery: Number(options.maxResultsPerQuery),
          fileIntoWiki: options.fileIntoWiki,
          progress: (message) => console.log(`[autoresearch] ${message}`)
        })
      );
    }
  );

program
  .command("heal")
  .description("Run deterministic integrity checks plus a wiki health audit over the current wiki.")
  .option("--apply", "Create additive follow-up question notes and draft article pages from the health audit")
  .action(async (options: { apply?: boolean }) => {
    await printWorkflow(runHealWorkflow(process.cwd(), { apply: options.apply }));
  });

program
  .command("evolve")
  .description("Run an experimental deeper wiki maintenance pass: contradictions, graph audit, revision plan, and cross-page updates.")
  .option("--max-pages <count>", "Maximum number of concept/entity pages to revise in one run", "4")
  .option("--rounds <count>", "Number of iterative maintenance rounds to run", "2")
  .option("--until-stable", "Keep iterating until a quiet round is reached or the round cap is hit")
  .action(async (options: { maxPages: string; rounds: string; untilStable?: boolean }) => {
    await printWorkflow(
      runEvolveWorkflow(process.cwd(), {
        maxPages: Number(options.maxPages),
        rounds: Number(options.rounds),
        untilStable: options.untilStable,
        progress: (message) => console.log(`[evolve] ${message}`)
      })
    );
  });

program
  .command("search")
  .description("Search markdown files in wiki/ with a lightweight lexical scorer.")
  .argument("<query>", "Search query")
  .option("-l, --limit <limit>", "Max results", "8")
  .action(async (query: string, options: { limit: string }) => {
    await printWorkflow(
      runSearchWorkflow(process.cwd(), {
        query,
        limit: Number(options.limit)
      })
    );
  });

program
  .command("status")
  .description("Show current source and wiki counts.")
  .action(async () => {
    await printWorkflow(runStatusWorkflow(process.cwd()));
  });

program
  .command("dashboard")
  .description("Open the interactive CLI command hub around the vault. Use --static for a one-shot render.")
  .option("--static", "Render once and exit")
  .action(async (options: { static?: boolean }) => {
    await startDashboardHub(process.cwd(), { static: options.static });
  });

const obsidian = program.command("obsidian").description("Obsidian-first helpers for vault setup and filing.");

obsidian
  .command("setup")
  .description("Create Obsidian-friendly home notes and templates without touching personal workspace settings.")
  .action(async () => {
    await printWorkflow(runObsidianSetupWorkflow(process.cwd()));
  });

obsidian
  .command("file-output")
  .description("File a generated output back into wiki/filed so it compounds inside the vault.")
  .argument("<output>", "Path to an output markdown file")
  .option("-t, --title <title>", "Override the filed note title")
  .action(async (outputPath: string, options: { title?: string }) => {
    await printWorkflow(
      runFileOutputWorkflow(process.cwd(), {
        output: outputPath,
        title: options.title
      })
    );
  });

const normalizedArgv = process.argv.map((value, index) => (index === 2 && value === "/dashboard" ? "dashboard" : value));

program.parseAsync(normalizedArgv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});

async function printWorkflow(workflow: Promise<WorkflowRunResult>): Promise<void> {
  const result = await workflow;
  for (const line of result.lines) {
    console.log(line);
  }
}
