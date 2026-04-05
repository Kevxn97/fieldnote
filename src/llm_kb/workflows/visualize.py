from __future__ import annotations

from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from ..config import AppConfig
from ..paths import RepoPaths
from ..workflows.compile import _load_all_source_summaries
from ..utils import date_slug


def render_concept_chart(config: AppConfig) -> Path:
    repo_paths = RepoPaths.from_config(config)
    source_summaries = _load_all_source_summaries(repo_paths.wiki_sources)
    if not source_summaries:
        raise RuntimeError("No source summaries found. Run `lkb compile` first.")

    counts = Counter(
        concept for summary in source_summaries for concept in summary.concepts
    )
    top_items = counts.most_common(12)
    if not top_items:
        raise RuntimeError("No concepts were found in the wiki.")

    labels = [item[0] for item in top_items][::-1]
    values = [item[1] for item in top_items][::-1]

    plt.figure(figsize=(10, 6))
    plt.barh(labels, values, color="#b0442d")
    plt.xlabel("Source note count")
    plt.title("Concept coverage across the wiki")
    plt.tight_layout()

    output_path = repo_paths.outputs_plots / f"{date_slug()}-concept-coverage.png"
    plt.savefig(output_path, dpi=180)
    plt.close()
    return output_path
