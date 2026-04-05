from __future__ import annotations

import shutil
from pathlib import Path

from .config import KnowledgeBaseConfig
from .markdown import slugify
from .paths import ensure_project_layout


def write_starter_files(config: KnowledgeBaseConfig) -> list[str]:
    ensure_project_layout(config)
    written: list[str] = []

    config_file = config.root / "knowledge_base.toml"
    if not config_file.exists():
        config_file.write_text(
            "\n".join(
                [
                    f'project_name = "{config.project_name}"',
                    f'raw_dir = "{config.raw_dir.relative_to(config.root).as_posix()}"',
                    f'vault_dir = "{config.vault_dir.relative_to(config.root).as_posix()}"',
                    f'output_dir = "{config.output_dir.relative_to(config.root).as_posix()}"',
                    f'state_dir = "{config.state_dir.relative_to(config.root).as_posix()}"',
                    f'model = "{config.model}"',
                    f'reasoning_effort = "{config.reasoning_effort}"',
                    f'web_host = "{config.web_host}"',
                    f"web_port = {config.web_port}",
                    f'web_reload = {"true" if config.web_reload else "false"}',
                    "",
                ]
            ),
            encoding="utf-8",
        )
        written.append(config_file.relative_to(config.root).as_posix())

    home_path = config.wiki_dir / "Home.md"
    if not home_path.exists():
        home_path.write_text(
            "\n".join(
                [
                    "---",
                    "generated_by: kb init",
                    "---",
                    "",
                    "# Home",
                    "",
                    "This vault is maintained by the knowledge-base tooling.",
                    "",
                    "## Workflow",
                    "",
                    "- Add sources into `raw/`.",
                    "- Run `kb compile` to build or refresh the wiki.",
                    "- Run `kb ask` to generate reports into `outputs/`.",
                    "- Run `kb heal` to find gaps and inconsistencies.",
                    "",
                ]
            ),
            encoding="utf-8",
        )
        written.append(home_path.relative_to(config.root).as_posix())

    return written


def ingest_paths(
    config: KnowledgeBaseConfig,
    sources: list[str],
    *,
    mode: str = "copy",
) -> list[str]:
    ensure_project_layout(config)
    written: list[str] = []
    for source in sources:
        source_path = Path(source).expanduser().resolve()
        if not source_path.exists():
            raise FileNotFoundError(f"Source does not exist: {source_path}")

        target_name = f"{slugify(source_path.stem)}{source_path.suffix.lower()}"
        target_path = config.raw_dir / target_name
        counter = 2
        while target_path.exists():
            target_name = f"{slugify(source_path.stem)}-{counter}{source_path.suffix.lower()}"
            target_path = config.raw_dir / target_name
            counter += 1

        if mode == "link":
            target_path.symlink_to(source_path)
        else:
            shutil.copy2(source_path, target_path)
        written.append(target_path.relative_to(config.root).as_posix())
    return written

