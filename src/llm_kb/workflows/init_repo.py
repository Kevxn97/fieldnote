from __future__ import annotations

from pathlib import Path

from ..config import CONFIG_FILENAME, AppConfig, render_config_template
from ..paths import RepoPaths
from ..utils import ensure_directory


def initialize_repo(config: AppConfig, force: bool = False) -> list[Path]:
    repo_paths = RepoPaths.from_config(config)
    created: list[Path] = []
    for directory in repo_paths.all_directories():
        if not directory.exists():
            ensure_directory(directory)
            created.append(directory)

    config_path = config.root / CONFIG_FILENAME
    if force or not config_path.exists():
        config_path.write_text(render_config_template(config), encoding="utf-8")
        created.append(config_path)

    raw_readme = repo_paths.raw / "README.md"
    if force or not raw_readme.exists():
        raw_readme.write_text(
            "# Raw Sources\n\nDrop original source files here, or use `lkb ingest`.\n",
            encoding="utf-8",
        )
        created.append(raw_readme)

    wiki_index = repo_paths.wiki / "index.md"
    if force or not wiki_index.exists():
        wiki_index.write_text(
            "# Wiki\n\nRun `lkb compile` after adding files to `raw/`.\n",
            encoding="utf-8",
        )
        created.append(wiki_index)

    outputs_readme = repo_paths.outputs / "README.md"
    if force or not outputs_readme.exists():
        outputs_readme.write_text(
            "# Outputs\n\nGenerated answers, reports, slides, and plots land here.\n",
            encoding="utf-8",
        )
        created.append(outputs_readme)

    return created
