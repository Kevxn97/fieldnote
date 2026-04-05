from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .config import AppConfig


@dataclass(slots=True)
class RepoPaths:
    root: Path
    raw: Path
    raw_imports: Path
    wiki: Path
    wiki_sources: Path
    wiki_concepts: Path
    outputs: Path
    outputs_answers: Path
    outputs_slides: Path
    outputs_reports: Path
    outputs_plots: Path
    cache: Path
    state_dir: Path

    @classmethod
    def from_config(cls, config: AppConfig) -> "RepoPaths":
        raw = config.root / config.paths.raw
        wiki = config.root / config.paths.wiki
        outputs = config.root / config.paths.outputs
        cache = config.root / config.paths.cache
        return cls(
            root=config.root,
            raw=raw,
            raw_imports=raw / "imports",
            wiki=wiki,
            wiki_sources=wiki / "sources",
            wiki_concepts=wiki / "concepts",
            outputs=outputs,
            outputs_answers=outputs / "answers",
            outputs_slides=outputs / "slides",
            outputs_reports=outputs / "reports",
            outputs_plots=outputs / "plots",
            cache=cache,
            state_dir=cache / "state",
        )

    def all_directories(self) -> list[Path]:
        return [
            self.raw,
            self.raw_imports,
            self.wiki,
            self.wiki_sources,
            self.wiki_concepts,
            self.outputs,
            self.outputs_answers,
            self.outputs_slides,
            self.outputs_reports,
            self.outputs_plots,
            self.cache,
            self.state_dir,
        ]
