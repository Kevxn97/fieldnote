# Fieldnote

Fieldnote is a file-based research workspace for people who like the idea of an LLM-powered knowledge system, but do not want their notes trapped inside a chat app or opaque database.

The overall shape was motivated by Andrej Karpathy's idea of treating personal research more like a living, accumulating system than a pile of disconnected notes.

It sits on top of an Obsidian-style vault:

- raw sources go into `vault/raw/` or `vault/Clippings/`
- the compiler turns them into a structured markdown wiki in `vault/wiki/`
- answers, reports, slide drafts, and chart briefs land in `vault/outputs/`
- the CLI acts as the operator console for import, sync, review, maintenance, and generation

The idea is simple: instead of asking one-off questions against random files, build a persistent knowledge base that gets better over time.

## What it is

Fieldnote is:

- a local-first workflow in the sense that your data, vault structure, outputs, and build state live as files on disk
- an Obsidian-friendly markdown knowledge graph made of sources, entities, concepts, questions, and filed outputs
- an interactive CLI hub for running the workflow from the terminal
- an OpenAI-powered compiler and synthesis layer on top of that file-based vault

Fieldnote is not:

- a fully offline or on-device AI system
- a replacement for Obsidian as the main reading and editing surface
- a generic SaaS dashboard

Obsidian remains the home for long-lived notes. The CLI is the control panel.

## Why it exists

Most AI research workflows are still too ephemeral:

- you collect material
- ask a good question
- get a decent answer
- and then the result disappears into chat history

Fieldnote tries to make research compound instead.

It helps you:

- keep sources grounded and inspectable
- turn raw reading into reusable structured notes
- ask better questions against accumulated knowledge
- file strong outputs back into the vault so they stay useful
- preserve a transparent, versionable workflow instead of a black box

## How it works

There are three layers:

1. Source layer
   - markdown clips, PDFs, repo snapshots, and local files are imported into `vault/raw/`
2. Wiki layer
   - the compiler creates grounded source pages plus synthesized entity, concept, and question pages in `vault/wiki/`
3. Output layer
   - `kb ask`, `kb review`, `kb autoresearch`, `kb heal`, and `kb evolve` produce reusable outputs and maintenance artifacts in `vault/outputs/` and `vault/wiki/system/`

The daily path is intentionally lightweight:

- `kb update`
  - scan `vault/Clippings/`
  - import new files
  - compile changed sources
  - run a targeted graph refresh for only impacted entities and concepts
  - clear imported inbox files

The deeper maintenance path is explicit:

- `kb sync --deep`
- `kb compile`
- `kb evolve`

That way daily use stays reasonably fast, while the heavier graph cleanup and cross-page revision work stays opt-in.

## What it can do

- import markdown notes, PDFs, repos, and Obsidian Web Clipper files
- preserve local clip attachments by copying them into `vault/raw/images/`
- compile raw sources into:
  - grounded source summaries
  - synthesized entity pages
  - synthesized concept pages
  - follow-up question pages
  - deterministic catalog, indexes, and activity logs
- answer questions against the compiled wiki
- generate reusable outputs such as reports, slide drafts, and chart briefs
- review a single source against the current knowledge base
- run deeper iterative research loops
- audit and maintain the wiki over time
- file strong outputs back into the wiki so they compound

## Main commands

### Daily flow

```bash
kb update
kb sync
kb ask "What are the strongest ideas in this source set?" --format report
```

### Import

```bash
kb add /path/to/article.md
kb add /path/to/paper.pdf
kb add /path/to/repo
kb clip /path/to/clipped-article.md
kb clip-latest
kb add-latest
kb import-clippings
```

### Deep maintenance

```bash
kb sync --deep
kb compile
kb heal
kb heal --apply
kb evolve
kb evolve --rounds 3 --max-pages 6
kb evolve --until-stable
```

### Outputs and review

```bash
kb ask "Summarize the strongest product themes" --format report
kb ask "Turn this into a slide draft" --format slides
kb ask "Make this chart-ready" --format chart
kb ask "What changed this week?" --format report --file-into-wiki
kb review
kb review some-source-slug --apply
kb autoresearch "What contradictions are emerging?" --format report
```

### Interactive CLI hub

```bash
kb
kb dashboard
kb dashboard --static
kb /dashboard
```

The interactive hub is intentionally small and operational. It is there to show status and launch workflows such as:

- `/import`
- `/sync`
- `/ask`
- `/review`
- `/heal`
- `/evolve`
- `/outputs`
- `/open`

It is not meant to be a second note editor.

## Quickstart

### 1. Install and configure

```bash
npm install
cp .env.example .env
# add OPENAI_API_KEY
npm run build
```

### 2. Initialize the vault

```bash
node dist/src/cli.js init
```

### 3. Open the vault in Obsidian

Open only `vault/` as your Obsidian vault, not the repo root.

### 4. Drop source material into the inbox

Put clipped markdown or PDFs into `vault/Clippings/`.

### 5. Run the daily workflow

```bash
kb update
```

### 6. Explore the result

- browse `vault/wiki/` in Obsidian
- use `kb` as the operator console
- inspect generated outputs in `vault/outputs/`

## Demo-friendly mental model

If you want the shortest explanation for someone seeing the repo for the first time:

> Drop sources into an Obsidian-friendly vault, let the CLI compile them into a living markdown knowledge graph, then query and maintain that graph over time.

That is the whole product idea.

## Vault layout

```text
vault/
  Clippings/        # inbox for clipped markdown files and PDFs
  raw/              # imported source-of-truth material
  wiki/
    sources/        # grounded source summaries
    entities/       # named people, orgs, products, datasets, projects
    concepts/       # synthesized themes, methods, comparisons
    questions/      # follow-up questions worth keeping
    filed/          # strong outputs filed back into the wiki
    system/         # catalog, log, indexes, contradiction/audit pages
  outputs/
    answers/
    charts/
    slides/
    reviews/
    research/
    health/
.kb/
  sources.json
  build-state.json
```

## Architecture notes

- `src/*.ts` is the canonical implementation path
- `src/cli.ts` is the main entry point
- `src/cli-workflows.ts` is the shared action layer used by both commands and the interactive hub
- `src/dashboard-hub.ts` implements the interactive CLI command hub
- `src/terminal-dashboard.ts` renders the terminal dashboard view
- there is no web dashboard anymore; Obsidian is the main UI and the terminal hub is the control plane
- the Python paths in this repo are experimental and not part of the main quickstart

## Models

This repo currently uses the OpenAI Responses API with a split model setup:

- `compile`: `gpt-5.4`
- `ask`: `gpt-5.4-mini`
- `heal`: `gpt-5.4`
- `evolve`: `gpt-5.4`

That split is configurable in `kb.config.json`.

## Current limits

- this is still an opinionated side project, not a polished product
- the system is local-first in data and workflow, but model inference still runs through OpenAI
- PDF ingestion can be noisier than plain markdown depending on the source file
- the graph refresh is incremental now, but larger vaults can still take a while on sync
- the terminal hub is intentionally narrow and should stay an operator console, not a full TUI note-taking app

## Why the repo is public

This project is interesting to share precisely because it is not a generic AI wrapper.

It is a concrete experiment in:

- local-first AI workflows
- Obsidian-compatible knowledge systems
- persistent research tooling
- CLI-first operator UX
- making LLM outputs compound instead of disappear

## Follow-up ideas

- tighter incremental graph refresh so daily syncs touch fewer pages
- richer filing workflows from outputs back into the wiki
- improved PDF and image-heavy source ingestion
- optional Agents SDK orchestration once the current workflow shape feels stable
