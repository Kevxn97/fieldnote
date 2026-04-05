from __future__ import annotations

from pathlib import Path

from .config import KnowledgeBaseConfig


def ensure_project_layout(config: KnowledgeBaseConfig) -> list[Path]:
    directories = [
        config.raw_dir,
        config.vault_dir,
        config.wiki_dir,
        config.output_dir,
        config.state_dir,
        config.run_log_dir,
        config.wiki_dir / "sources",
        config.wiki_dir / "concepts",
        config.output_dir / "reports",
        config.output_dir / "plots",
        config.output_dir / "slides",
    ]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
    return directories


def relative_to_root(path: Path, root: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()

