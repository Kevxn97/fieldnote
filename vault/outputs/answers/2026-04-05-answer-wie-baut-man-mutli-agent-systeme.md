---
kind: "output"
question: "wie baut man mutli-agent-systeme"
format: "answer"
created_at: "2026-04-05T19:57:54.275Z"
sources:
  - "wiki/concepts/manager-pattern.md"
  - "wiki/concepts/multi-agent-systems.md"
  - "wiki/sources/a-practical-guide-to-building-agents.md"
  - "wiki/entities/agents-sdk.md"
  - "wiki/concepts/single-agent-systems.md"
  - "wiki/system/catalog.md"
  - "wiki/sources/building-effective-ai-agents.md"
  - "wiki/concepts/human-intervention.md"
  - "wiki/concepts/ai-agents.md"
  - "wiki/concepts/decentralized-handoffs.md"
tags:
  - "output"
  - "answer"
---
# Wie man Multi-Agent-Systeme baut

## Answer
Baue Multi-Agent-Systeme konservativ und in dieser Reihenfolge:

1. **Starte mit einem starken Single-Agent-Design.**  
   Erst wenn ein einzelner Agent die Aufgabe nicht mehr sauber beherrscht, solltest du auf mehrere Agenten aufteilen.

2. **Teile nach Verantwortung auf.**  
   Zerlege den Workflow in spezialisierte Rollen, statt einen Agenten mit immer mehr Aufgaben zu überladen.

3. **Wähle ein Orchestrationsmuster.**  
   - **Manager pattern:** Ein zentraler Manager-Agent steuert den Ablauf und delegiert Teilaufgaben an spezialisierte Agenten.  
   - **Decentralized handoffs:** Peers übergeben die Ausführung direkt aneinander.

4. **Behandle Agenten wie Tools.**  
   Die Dokumentation beschreibt, dass Agenten als aufrufbare Werkzeuge exponiert werden können, damit der koordinierende Agent sie gezielt nutzen kann.

5. **Setze Guardrails und menschliche Eskalation ein.**  
   Mit mehr Agenten werden Validierung, Tool-Schutz, Sicherheitsprüfungen und Human-in-the-loop wichtiger, besonders bei riskanten Aktionen.

**Inferenz:** Praktisch heißt das: erst Klarheit in Aufgaben, Tools und Zuständigkeiten schaffen, dann nur so viel Multi-Agent-Komplexität hinzufügen, wie für Zuverlässigkeit wirklich nötig ist.

## Evidence
- Multi-agent systems are defined as LLM-agent architectures where multiple agents coordinate a workflow by dividing responsibilities across specialized agents, connected either through a central manager or decentralized handoffs. `[[wiki/concepts/multi-agent-systems.md]]`
- The documented guidance says to maximize what a single agent can do before splitting into multiple agents, and to introduce multi-agent design when prompt logic becomes too complex or overlapping tools cause repeated tool-selection mistakes. `[[wiki/concepts/multi-agent-systems.md]]`
- The manager pattern uses a central manager agent to control workflow execution and delegate sub-tasks to specialized agents through tool calls, treating those agents as callable tools. `[[wiki/concepts/manager-pattern.md]]`
- The manager pattern is not presented as the default starting point; the guidance is to strengthen a single agent first and only add manager-based structure when needed. `[[wiki/concepts/manager-pattern.md]]`
- The multi-agent page says that safety and reliability requirements increase with more agents, including layered guardrails, tool safeguards, output validation, and human intervention for failures or high-risk actions. `[[wiki/concepts/multi-agent-systems.md]]`
- The manager pattern page emphasizes that the manager must route work clearly, apply policies consistently, and operate within layered safety controls. `[[wiki/concepts/manager-pattern.md]]`

## Gaps
- Es gibt hier **keinen konkreten Implementierungsleitfaden mit Code, APIs oder Beispielarchitektur** für ein echtes Multi-Agent-System.
- Die Quellen nennen **keine harten Schwellenwerte**, ab wann man von einem Single-Agent- zu einem Multi-Agent-Design wechseln sollte.
- Es fehlen **konkrete Evaluationsmetriken** oder Benchmarks, um Manager-Pattern vs. decentralized handoffs zu vergleichen.
- Die Frage, **wann genau Human-in-the-loop** verpflichtend sein sollte, bleibt in den gefundenen Seiten offen.

## Suggested Next Questions
- Welche Architektur passt besser zu meinem Use Case: **Manager Pattern** oder **Decentralized Handoffs**?
- Ab welcher Art von Tool-Overhead lohnt sich der Wechsel von Single-Agent zu Multi-Agent?
- Wie modelliert man Agenten am besten als **Tools** innerhalb eines Workflow-Systems?
- Welche Guardrails sollte ein Multi-Agent-System mindestens haben?
- Wie evaluiert man Multi-Agent-Systeme gegen Single-Agent-Systeme bei Qualität, Kosten und Latenz?
- Kannst du mir ein einfaches Referenzdesign für ein Multi-Agent-System skizzieren?
