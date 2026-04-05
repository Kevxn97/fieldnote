from __future__ import annotations

import argparse
import sys

from .config import load_config
from .catalog import build_catalog, load_catalog, save_catalog
from .paths import ensure_project_layout
from .search import search_catalog
from .workflows import ask_question, compile_knowledge_base, heal_knowledge_base, ingest_sources, initialize_project


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="kb", description="LLM Knowledge Bases CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init", help="Create the local vault structure and starter files.")

    ingest = subparsers.add_parser("ingest", help="Copy or link files into raw/.")
    ingest.add_argument("sources", nargs="+")
    ingest.add_argument("--mode", choices=["copy", "link"], default="copy")

    compile_cmd = subparsers.add_parser("compile", help="Build or refresh the wiki.")
    compile_cmd.add_argument("--no-openai", action="store_true")

    ask = subparsers.add_parser("ask", help="Answer a question against the local catalog.")
    ask.add_argument("question")
    ask.add_argument("--limit", type=int, default=None)
    ask.add_argument("--no-openai", action="store_true")

    heal = subparsers.add_parser("heal", help="Run deterministic and optional LLM health checks.")
    heal.add_argument("--no-openai", action="store_true")

    search = subparsers.add_parser("search", help="Search the local catalog from the terminal.")
    search.add_argument("query")
    search.add_argument("--limit", type=int, default=8)

    subparsers.add_parser("status", help="Show catalog counts and project status.")

    return parser


def _print_result(summary: str, files_written: list[str], trace: list[str]) -> None:
    print(summary)
    if files_written:
        print("\nFiles written:")
        for path in files_written:
            print(f"- {path}")
    if trace:
        print("\nTrace:")
        for item in trace:
            print(f"- {item}")


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    config = load_config()
    ensure_project_layout(config)

    if args.command == "init":
        result = initialize_project(config)
        _print_result(result.summary, result.files_written, result.trace)
        return 0

    if args.command == "ingest":
        result = ingest_sources(config, args.sources, mode=args.mode)
        _print_result(result.summary, result.files_written, result.trace)
        return 0

    if args.command == "compile":
        result = compile_knowledge_base(config, use_openai=not args.no_openai)
        _print_result(result.summary, result.files_written, result.trace)
        return 0

    if args.command == "ask":
        result = ask_question(config, args.question, limit=args.limit, use_openai=not args.no_openai)
        _print_result(result.summary, result.files_written, result.trace)
        return 0

    if args.command == "heal":
        result = heal_knowledge_base(config, use_openai=not args.no_openai)
        _print_result(result.summary, result.files_written, result.trace)
        return 0

    if args.command == "search":
        snapshot = load_catalog(config)
        if snapshot.total_documents == 0:
            snapshot = build_catalog(config)
            save_catalog(config, snapshot)
        results = search_catalog(snapshot, args.query, limit=args.limit)
        if not results:
            print("No matches found.")
            return 0
        for result in results:
            print(f"{result.score:>5.1f}  {result.record.title}  ({result.record.rel_path})")
            if result.record.excerpt:
                print(f"      {result.record.excerpt}")
        return 0

    if args.command == "status":
        snapshot = load_catalog(config)
        if snapshot.total_documents == 0:
            snapshot = build_catalog(config)
            save_catalog(config, snapshot)
        print(f"Project: {snapshot.project_name}")
        print(f"Generated at: {snapshot.generated_at}")
        print(f"Raw: {snapshot.by_zone['raw']}")
        print(f"Wiki: {snapshot.by_zone['wiki']}")
        print(f"Outputs: {snapshot.by_zone['outputs']}")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
