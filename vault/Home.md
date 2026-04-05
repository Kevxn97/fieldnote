# Home

## Main Views
- [[wiki/index]]
- [[wiki/system/catalog]]
- [[wiki/system/log]]
- [[wiki/system/source-index]]
- [[wiki/system/entity-index]]
- [[wiki/system/concept-index]]
- [[wiki/system/question-index]]
- [[wiki/system/contradictions]]
- [[wiki/system/graph-audit]]
- [[wiki/system/review-queue]]
- [[wiki/system/revision-queue]]

## Working Areas
- [[Clippings/README]]
- [[raw]]
- [[outputs]]
- [[wiki/filed]]
- [[wiki/entities]]
- [[wiki/questions]]

## Suggested Obsidian Flow
1. Clip or drop sources into the vault.
2. For Web Clipper attachments, use `Clippings/_assets/`.
3. Run `kb update` or `kb sync`.
4. Browse `catalog`, `log`, and the graph in Obsidian.
5. File strong outputs back into `wiki/filed/`.

Hier ist die kurze Übersicht:

| Command                                    | Was es macht                                                                                        | Wann du es nutzt                                        |                                                  |                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| `kb update`                                | Holt neue `.md`/`.pdf` aus `vault/Clippings/`, importiert sie, macht `sync`, räumt `Clippings/` auf | Bester Daily-Command                                    |                                                  |                                 |
| `kb add <pfad>`                            | Importiert gezielt eine Datei, PDF, Repo oder Markdown-Quelle                                       | Wenn du etwas manuell hinzufügen willst                 |                                                  |                                 |
| `kb add-latest`                            | Nimmt die neueste importierbare Datei aus `vault/Clippings/`                                        | Für den schnellsten Einzel-Import                       |                                                  |                                 |
| `kb import-clippings`                      | Importiert alle Markdown/PDFs aus `vault/Clippings/`                                                | Wenn du mehrere neue Clips hast                         |                                                  |                                 |
| `kb sync`                                  | Kompiliert `vault/raw/` ins Wiki                                                                    | Wenn neue Quellen schon importiert sind                 |                                                  |                                 |
| `kb review`                                | Prüft die neueste Quelle gegen das aktuelle Wiki und schreibt einen Review                          | Für bewussten Einzelquellen-Review                      |                                                  |                                 |
| `kb review <source>`                       | Prüft genau eine bestimmte Quelle                                                                   | Wenn du eine Quelle gezielt anschauen willst            |                                                  |                                 |
| `kb review --apply`                        | Macht aus guten Review-Follow-ups echte Fragen und Review-Queue-Einträge                            | Wenn Review-Erkenntnisse direkt bleiben sollen          |                                                  |                                 |
| `kb ask "Frage"`                           | Beantwortet Fragen auf Basis des Wikis                                                              | Für normale Recherche                                   |                                                  |                                 |
| `kb ask "Frage" --format report`           | Antwort als strukturierter Report                                                                   | Standard-Empfehlung                                     |                                                  |                                 |
| `kb ask "Frage" --format slides`           | Antwort als Marp-/Slides-Ausgabe                                                                    | Für Präsentationen                                      |                                                  |                                 |
| `kb ask "Frage" --format chart`            | Antwort als chart-orientierter, grounded Output                                                     | Für Vergleiche, Diagramm-Briefs                         |                                                  |                                 |
| `kb ask "Frage" --file-into-wiki`          | Legt die Antwort zusätzlich in `wiki/filed/` ab                                                     | Wenn sie Teil der KB werden soll                        |                                                  |                                 |
| `kb autoresearch "Frage"`                  | Plant Subqueries, sucht iterativ im Wiki und schreibt einen Research-Output                         | Für schwierigere, breitere Fragen                       |                                                  |                                 |
| `kb autoresearch "Frage" --format report   | slides                                                                                              | chart`                                                  | Gleicher Flow, aber mit gewünschtem Outputformat | Wenn du die Form steuern willst |
| `kb autoresearch "Frage" --file-into-wiki` | Filed den Research-Output zusätzlich zurück ins Wiki                                                | Wenn die Recherche dauerhaft bleiben soll               |                                                  |                                 |
| `kb heal`                                  | Prüft das Wiki auf Lücken, Inkonsistenzen und Chancen                                               | Periodischer Health-Check                               |                                                  |                                 |
| `kb heal --apply`                          | Setzt sichere, additive Heal-Vorschläge direkt um                                                   | Wenn gute Vorschläge direkt eingearbeitet werden sollen |                                                  |                                 |
| `kb evolve`                                | Tiefer Wartungsloop für Widersprüche, Graph-Audit und Revisionen                                    | Für größere, gewachsene Wikis                           |                                                  |                                 |
| `kb evolve --rounds 3 --max-pages 6`       | Aggressiverer Evolution-Lauf                                                                        | Wenn du global stärker überarbeiten willst              |                                                  |                                 |
| `kb evolve --until-stable`                 | Lässt den Wartungsloop bis zu einer ruhigen Runde laufen                                            | Für größere Redaktions-/Konsistenz-Pässe                |                                                  |                                 |
| `kb search "query"`                        | Durchsucht das Wiki lokal                                                                           | Schnelles Nachschlagen                                  |                                                  |                                 |
| `kb status`                                | Zeigt Counts und Ordnerstatus                                                                       | Zum schnellen Check                                     |                                                  |                                 |
| `kb dashboard`                             | Startet das lokale Dashboard im Browser                                                             | Wenn du visuell navigieren willst                       |                                                  |                                 |
| `kb obsidian setup`                        | Legt Obsidian-Templates und Startstruktur an                                                        | Einmalig am Anfang                                      |                                                  |                                 |
| `kb obsidian file-output <pfad>`           | Filed eine starke Output-Datei zurück ins Wiki                                                      | Wenn du Outputs später zurückführen willst              |                                                  |                                 |

**Empfohlener Alltag**
- Täglich: `kb update`
- Dann: `kb ask "Was ist neu und wichtig?" --format report --file-into-wiki`
- Wenn eine Quelle besonders wichtig ist: `kb review --apply`
- Für tiefere Fragen: `kb autoresearch "..." --format report --file-into-wiki`
- Ab und zu: `kb heal --apply`
- Seltener, aber wertvoll: `kb evolve --rounds 3 --max-pages 6 --until-stable`

Wenn du willst, mache ich dir noch eine **ultrakurze Version mit nur 5 Commands, die du dir merken musst**.