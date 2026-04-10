# Purpose
Repo-specific instructions for the `fieldnote` project.

## Product shape
- This repo is a file-based knowledge-base compiler for Obsidian-style vaults.
- `vault/` is the only intended Obsidian-visible surface.
- `vault/raw/` stores imported source material.
- `vault/Clippings/_assets/` is the preferred Obsidian Web Clipper attachment inbox when users want local image capture alongside clipped markdown.
- Obsidian clip imports should preserve referenced local attachments by copying them into `vault/raw/images/<clip-slug>/` and keeping the copied raw markdown links usable.
- `vault/wiki/` stores compiled markdown knowledge pages.
- `wiki/system/catalog.md` is the persistent content-oriented catalog.
- `wiki/system/log.md` is the append-only chronological activity log.
- `wiki/system/brief.md` is the one-page operator brief refreshed by major workflows so humans and agents can re-enter the workspace quickly.
- `vault/outputs/` stores generated answers, reports, and slide decks.
- `vault/outputs/reviews/` stores single-source review artifacts.
- `vault/outputs/research/` stores broader iterative autoresearch runs.
- `kb` with no subcommand should open the interactive CLI command hub when running in a TTY.
- `kb dashboard` is the preferred lightweight CLI control panel around the vault: inbox counts, wiki coverage, next actions, recent activity, reusable outputs, and prompt-driven actions.
- `kb dashboard --static` is the preferred one-shot render for smoke tests and non-interactive verification.
- `kb /dashboard` is a supported alias for the same terminal dashboard.
- `npm run install:kb` is the supported one-time bootstrap for exposing the built CLI as `~/.local/bin/kb` when `~/.local/bin` is already on `PATH`.
- `kb update` is the preferred one-shot daily inbox workflow for `vault/Clippings/`: import, run the fast incremental sync, then clear imported inbox files.
- `kb sync` should stay fast and incremental for daily use: changed source pages plus targeted entity/concept refresh only.
- `kb sync --deep` and `kb compile` are the explicit slower full-graph rebuild paths.
- `kb watch` is the preferred live operator mode when the inbox is active: watch `vault/Clippings/` and `vault/raw/`, debounce changes, then run the safe fast refresh path.
- `kb review` is the preferred single-source human-in-the-loop workflow when one source should be inspected against the current wiki before wider synthesis.
- `kb autoresearch` is the preferred deeper question workflow when simple `kb ask` retrieval is not enough.
- `kb ask`, `kb review`, and `kb autoresearch` should use budgeted context packs and persist the latest pack under `.kb/context-packs/` so prompt compression stays inspectable.
- Long-running commands such as `kb autoresearch` and `kb evolve` should emit step-by-step terminal progress so the user can see what is happening live.
- `kb sync` and `kb update` should also emit visible terminal progress when a run may take longer than a quick source-only refresh.
- `kb heal --apply` should remain additive and safe: create follow-up questions, draft concept pages, or system notes, but do not delete or silently rewrite source summaries.
- `kb evolve` is the deeper, slower maintenance loop for cross-page revision, contradiction tracking, graph auditing, and multi-agent synthesis. Prefer it for periodic wiki upkeep, not every daily import.
- `kb evolve --rounds <n>` is the preferred way to make that loop more aggressive instead of broadening everyday `kb update`.
- `kb evolve --until-stable` is the preferred way to let maintenance continue until the wiki reaches a quiet round.
- `.kb/` stores manifests and build metadata.
- `.kb/context-packs/` stores the latest human-inspectable context-pack artifacts used to ground ask/review/research prompts.

## Wiki schema
- Treat the repo like a persistent LLM-maintained wiki, not a one-shot RAG cache.
- Raw files in `vault/raw/` are immutable source-of-truth inputs. Read them, do not rewrite them.
- The main wiki node types are:
- `source`: grounded summaries in `vault/wiki/sources/`
- `entity`: named people, orgs, projects, products, datasets in `vault/wiki/entities/`
- `concept`: ideas, methods, themes, comparisons in `vault/wiki/concepts/`
- `question`: open follow-up questions in `vault/wiki/questions/`
- `filed-output`: user-valuable generated outputs filed back into `vault/wiki/filed/`
- Deterministic navigation artifacts live in `vault/wiki/system/`, especially `catalog.md`, `log.md`, and the per-type indexes.
- `vault/wiki/system/contradictions.md`, `vault/wiki/system/graph-audit.md`, and `vault/wiki/system/revision-queue.md` are durable system pages for deeper evolution passes.
- `vault/wiki/system/review-queue.md` is the durable backlog for single-source review follow-ups.
- `vault/wiki/system/brief.md` should stay concise, operator-facing, and deterministic; prefer a compact snapshot, compression signals, recent activity, and recommended next actions over long narrative prose.
- `kb ask` should compound the wiki: answers go to `vault/outputs/`, and when filed back they should strengthen the wiki rather than disappear into terminal history.
- `kb ask --format chart` should produce grounded chart briefs, not decorative made-up visuals.
- If an answer contains strong follow-up questions, promote them into `vault/wiki/questions/`.
- Prefer revising `entity` and `concept` pages during global maintenance. Source pages should stay grounded summaries, not absorb all synthesis work.
- Concept and entity pages should read like clear internal wiki articles. Avoid meta-editorial language about "the wiki", "this page", or "the source set" unless the page is explicitly about process.
- During compile, locally copied clip images may be passed as bounded secondary evidence; they should refine grounded summaries, not become an excuse to hallucinate beyond visible details.
- Preserve LLM-authored prose outside managed sections; deterministic passes may refresh links, indexes, and graph scaffolding inside managed sections only.

## Stack
- TypeScript CLI on Node.js.
- OpenAI Responses API via the official `openai` SDK.
- Default model split: `compile` and `heal` use `gpt-5.4`; `ask` uses `gpt-5.4-mini`, configurable in `kb.config.json`.
- `src/*.ts`, especially the CLI, `cli-workflows`, terminal dashboard, and dashboard hub modules, are the canonical implementation path for the current MVP.
- The legacy Python implementation has been removed from the public product path. Do not reintroduce parallel Python sidecars unless the user explicitly asks for them.
- Obsidian is the primary frontend assumption for the vault. Favor markdown structure, frontmatter, backlinks, and file-based flows over app-only UX.

## Working rules
- Keep diffs small and additive.
- Do not invent OpenAI request fields, model IDs, or SDK helpers.
- Prefer deterministic file generation for indexes and manifests.
- Prefer updating the catalog and log as persistent navigation artifacts, not just ephemeral terminal output.
- Keep LLM-written markdown separated from deterministic managed sections.
- When editing source or concept pages, preserve content outside managed sections whenever possible.
- Prefer real Obsidian-compatible paths and conventions, especially `.obsidian/templates`, `.obsidian/snippets`, wiki links, and file-based filing flows.

## Managed markdown sections
- This repo uses HTML comment markers for deterministic sections:
- `<!-- kb:SECTION:start -->`
- `<!-- kb:SECTION:end -->`
- Only overwrite the content inside those markers when refreshing links or indexes.

## Prompt files
- Prompt templates live in `prompts/`.
- Keep them explicit about grounding, completion criteria, and output contracts.
- If prompt behavior changes, update the docs and tests when relevant.

## Verification
- Run `npm run build` after meaningful changes.
- Run `npm test` when search, parsing, or deterministic generation logic changes.
- If the CLI dashboard changes, also run `node dist/src/cli.js dashboard --static` and verify the terminal output remains readable and aligned. If you touched the interactive loop, also do a brief TTY smoke test with `node dist/src/cli.js`.

## Delivery
- Document new commands or workflows in `README.md`.
- Keep `AGENTS.md` in sync with the actual repo structure and conventions.
