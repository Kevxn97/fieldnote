from __future__ import annotations

from pathlib import Path
import asyncio

import typer
from rich.console import Console
from rich.table import Table

from .config import load_config
from .paths import RepoPaths
from .search import load_index, search_documents
from .workflows.ask import answer_question
from .workflows.compile import compile_vault
from .workflows.heal import heal_wiki
from .workflows.ingest import ingest_paths
from .workflows.init_repo import initialize_repo
from .workflows.visualize import render_concept_chart


app = typer.Typer(help="Build and query a local-first LLM knowledge base.")
console = Console()


@app.command()
def init(force: bool = typer.Option(False, help="Overwrite starter files if they already exist.")) -> None:
    config = load_config()
    created = initialize_repo(config, force=force)
    console.print(f"Initialized knowledge-base scaffolding in {config.root}")
    for path in created:
        console.print(f"  - {path.relative_to(config.root)}")


@app.command()
def ingest(paths: list[Path]) -> None:
    if not paths:
        raise typer.BadParameter("Provide at least one local file or directory.")
    config = load_config()
    repo_paths = RepoPaths.from_config(config)
    imported = ingest_paths(repo_paths, paths)
    console.print("Imported into raw/imports:")
    for destination in imported:
        console.print(f"  - {destination.relative_to(config.root)}")


@app.command()
def compile(force: bool = typer.Option(False, help="Rebuild all source summaries even if hashes match.")) -> None:
    config = load_config()
    stats = asyncio.run(compile_vault(config, force=force))
    console.print("Compile complete.")
    for key, value in stats.items():
        console.print(f"  - {key}: {value}")


@app.command()
def ask(
    question: str,
    format: str = typer.Option("markdown", help="Output format: markdown or marp."),
) -> None:
    if format not in {"markdown", "marp"}:
        raise typer.BadParameter("format must be `markdown` or `marp`.")
    config = load_config()
    output_path = asyncio.run(answer_question(config, question, output_format=format))
    console.print(f"Wrote answer to {output_path.relative_to(config.root)}")


@app.command()
def heal() -> None:
    config = load_config()
    output_path = asyncio.run(heal_wiki(config))
    console.print(f"Wrote heal report to {output_path.relative_to(config.root)}")


@app.command()
def search(query: str, top_k: int = typer.Option(8, help="Maximum results to return.")) -> None:
    config = load_config()
    repo_paths = RepoPaths.from_config(config)
    documents = load_index(repo_paths.cache / "search-index.json")
    if not documents:
        raise RuntimeError("Search index not found. Run `lkb compile` first.")
    hits = search_documents(documents, query, top_k=top_k)
    table = Table(title=f"Search results for: {query}")
    table.add_column("Score", justify="right")
    table.add_column("Title")
    table.add_column("Path")
    table.add_column("Snippet")
    for hit in hits:
        table.add_row(
            f"{hit.score:.2f}",
            hit.title,
            hit.path,
            hit.snippet[:120],
        )
    console.print(table)


@app.command()
def visualize() -> None:
    config = load_config()
    output_path = render_concept_chart(config)
    console.print(f"Wrote concept chart to {output_path.relative_to(config.root)}")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
