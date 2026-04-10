---
kind: "output"
question: "was sind managed agents in claude ?"
format: "answer"
created_at: "2026-04-10T19:41:22.551Z"
sources:
  - "wiki/sources/what-is-claude-managed-agents.md"
  - "wiki/entities/claude-managed-agents.md"
  - "wiki/entities/claude.md"
  - "wiki/system/entity-index.md"
  - "wiki/sources/building-effective-ai-agents.md"
  - "wiki/sources/a-practical-guide-to-building-agents.md"
  - "wiki/system/concept-index.md"
  - "wiki/entities/claude-agent-sdk.md"
  - "wiki/entities/claude-sonnet-45.md"
  - "wiki/concepts/multi-agent-coordination.md"
  - "wiki/system/catalog.md"
  - "wiki/concepts/event-streaming.md"
tags:
  - "output"
  - "answer"
---
# Was sind Managed Agents in Claude?

## Answer
Managed Agents in Claude sind eine von Anthropic beschriebene API-/Plattform-Schicht für den Bau und Betrieb produktionsreifer Agenten in größerem Maßstab. Entwickler definieren dabei Tools, Persona, Fähigkeiten, Sandbox-Umgebung und Erfolgskriterien; Claude führt die Arbeit dann in isolierten Ausführungs-Kontexten aus, bis die Aufgabe als erledigt gilt. Dazu gehören laut den vorhandenen Notizen auch Agent-Sessions, parallele Ausführung und Event-Streaming für Tool-Calls. **Inferenz:** Es handelt sich also nicht просто um einen einzelnen Chatbot-Call, sondern um eine kontrollierte Laufzeit für längere Arbeitsabläufe. `[[wiki/entities/claude-managed-agents.md]]` `[[wiki/concepts/agent-sessions]]` `[[wiki/concepts/sandbox-environments]]` `[[wiki/concepts/event-streaming]]`

## Evidence
- Claude Managed Agents wird als „suite of APIs for building and deploying production-ready agents at scale“ beschrieben; Entwickler legen Tools, Personas, Capabilities, Sandbox-Umgebung und Success Criteria fest. `[[wiki/entities/claude-managed-agents.md]]`
- Claude arbeitet dabei in isolierten Ausführungskontexten; beschrieben werden Agent-Sessions und isolierte Container. `[[wiki/entities/claude-managed-agents.md]]` `[[wiki/concepts/agent-sessions]]` `[[wiki/concepts/isolated-containers]]`
- Die Umgebung kann Dateisystemzugriff, Bash, Websuche, gemountete Repositories, installierte Pakete und kontrollierten Netzwerkzugang enthalten. `[[wiki/entities/claude-managed-agents.md]]`
- Ein zentrales Muster ist rubric-based completion: Claude iteriert so lange, bis explizite Erfolgskriterien erfüllt sind. `[[wiki/entities/claude-managed-agents.md]]` `[[wiki/concepts/rubric-based-evaluation]]`
- Tool-Calls können in Echtzeit als Event-Stream an die Anwendung zurückfließen. `[[wiki/entities/claude-managed-agents.md]]` `[[wiki/concepts/event-streaming]]`
- Mehrere Sessions können parallel als separate Container laufen. `[[wiki/entities/claude-managed-agents.md]]` `[[wiki/concepts/parallel-task-execution]]`
- Memory, outcomes und multi-agent orchestration werden erwähnt, aber nur als begrenzte Research-Preview. `[[wiki/entities/claude-managed-agents.md]]`

## Gaps
- Der genaue API-Umfang der „suite of APIs“ ist in den vorliegenden Notizen nicht vollständig beschrieben. `[[wiki/entities/claude-managed-agents.md]]`
- Die Grenzen der Sandbox/Container, etwa Runtime-Limits, Paketumfang und Netzrestriktionen, bleiben unklar. `[[wiki/entities/claude-managed-agents.md]]`
- Details zu Memory, Outcomes und Multi-Agent-Orchestrierung sind als Research Preview nur angerissen, nicht ausformuliert. `[[wiki/entities/claude-managed-agents.md]]`

## Suggested Next Questions
- Welche konkreten APIs umfasst Claude Managed Agents genau?
- Wie unterscheiden sich Managed Agents von einem normalen Claude-Chat oder Claude Code?
- Welche Tools und Sandbox-Rechte sind standardmäßig erlaubt oder verboten?
- Wie funktioniert Event-Streaming bei Agent-Sessions technisch und praktisch?
- Was ist in der Research Preview zu Memory, Outcomes und Multi-Agent-Orchestrierung بالفعل enthalten?
- Wie werden Erfolgskriterien und Rubrics für Managed Agents am besten formuliert?
