# Quickstart: 2 Commands

Wenn alles schon eingerichtet ist, brauchst du im Alltag meistens nur diese 2 Befehle:

```bash
kb update
kb ask "Was ist neu und wichtig?" --format report --file-into-wiki
```

## Was sie machen

`kb update`
- importiert `.md`- und `.pdf`-Dateien aus `vault/Clippings/`
- baut daraus das Wiki in `vault/wiki/`
- räumt erfolgreich importierte Dateien danach aus `vault/Clippings/` weg

`kb ask ... --file-into-wiki`
- stellt eine Frage gegen das Wiki
- schreibt die Antwort nach `vault/outputs/`
- legt sie zusätzlich in `vault/wiki/filed/` ab

## Wenn du statt Artikel andere Dateien hast

```bash
kb add "/pfad/zur/datei.pdf"
kb sync
kb ask "Was sind die wichtigsten Erkenntnisse?" --format report --file-into-wiki
```

## Optional

Suche:

```bash
kb search "dein suchbegriff"
```

Dashboard:

```bash
kb dashboard
```

Wenn du tiefer gehen willst:

```bash
kb review --apply
kb autoresearch "Welche Spannungen sehe ich gerade im Wiki?" --format report --file-into-wiki
```
