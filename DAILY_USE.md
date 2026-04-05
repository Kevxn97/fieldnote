# Daily Use

Kurze Übersicht der wichtigsten Befehle für den Alltag.

## Setup

Einmalig im Repo:

```bash
npm install
npm run build
npm link
cp .env.example .env
```

Danach in `.env` den `OPENAI_API_KEY` setzen.

## Daily Flow

Repo/Vault vorbereiten:

```bash
kb init
kb obsidian setup
```

Wichtig:
- In Obsidian nur den Ordner `vault/` öffnen.
- Nicht das ganze Repo als Vault öffnen.

Webartikel aus Obsidian Web Clipper importieren:

```bash
kb clip "/pfad/zum/artikel.md"
```

Noch einfacher für den Alltag:

```bash
kb update
```

Andere Quellen importieren:

```bash
kb add "/pfad/zur/datei.pdf"
kb add "/pfad/zum/repo"
```

Wiki neu kompilieren:

```bash
kb sync
```

Frage stellen:

```bash
kb ask "Was sind die wichtigsten Ideen?" --format report
```

Einzelquelle bewusst prüfen:

```bash
kb review
kb review "less-is-more-recursive-reasoning-with-tiny-networks" --apply
```

Breitere Recherche mit iterativer Suche:

```bash
kb autoresearch "Welche Widersprüche tauchen gerade auf?" --format report --file-into-wiki
```

Antwort direkt zurück ins Wiki ablegen:

```bash
kb ask "Was sind die wichtigsten Ideen?" --format report --file-into-wiki
```

Suche im Wiki:

```bash
kb search "agent orchestration"
```

Status prüfen:

```bash
kb status
```

Dashboard starten:

```bash
kb dashboard
```

## Praktischer Minimal-Flow

Wenn du schon eingerichtet bist, reichen meistens diese zwei Befehle:

```bash
kb update
kb ask "Was ist neu und wichtig?" --format report --file-into-wiki
```

`kb update`
- holt `.md`- und `.pdf`-Dateien aus `vault/Clippings/`
- importiert sie nach `vault/raw/`
- führt `kb sync` aus
- räumt die erfolgreich importierten Dateien in `vault/Clippings/` auf

## Wichtige Ordner

- `vault/raw/` = Rohquellen
- `vault/wiki/` = generiertes Wiki
- `vault/wiki/filed/` = zurückgespeicherte Antworten
- `vault/outputs/` = Reports, Slides, Charts, Reviews, Research Runs, Health Checks
- `vault/.obsidian/` = Obsidian Templates und Snippets
