from __future__ import annotations

from pathlib import Path
import shutil

from ..paths import RepoPaths
from ..utils import date_slug, ensure_directory, slugify


def ingest_paths(repo_paths: RepoPaths, input_paths: list[Path]) -> list[Path]:
    imported: list[Path] = []
    ensure_directory(repo_paths.raw_imports)
    stamp = date_slug()
    for input_path in input_paths:
        resolved = input_path.expanduser().resolve()
        if not resolved.exists():
            raise FileNotFoundError(f"Path does not exist: {resolved}")
        destination = repo_paths.raw_imports / f"{stamp}-{slugify(resolved.stem)}"
        if resolved.is_dir():
            shutil.copytree(resolved, destination, dirs_exist_ok=True)
        else:
            ensure_directory(destination)
            shutil.copy2(resolved, destination / resolved.name)
        imported.append(destination)
    return imported
