from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from llm_knowledge_base.catalog import build_catalog, load_catalog
from llm_knowledge_base.config import load_config
from llm_knowledge_base.markdown import extract_markdown_links, slugify
from llm_knowledge_base.search import search_catalog
from llm_knowledge_base.workflows import (
    ask_question,
    compile_knowledge_base,
    heal_knowledge_base,
    initialize_project,
)


class CoreWorkflowTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.config = load_config(self.root)

    def tearDown(self) -> None:
        self.tempdir.cleanup()

    def test_init_writes_starter_files(self) -> None:
        result = initialize_project(self.config)
        self.assertTrue((self.root / "knowledge_base.toml").exists())
        self.assertTrue((self.root / "vault/wiki/Home.md").exists())
        self.assertIn("knowledge_base.toml", result.files_written)

    def test_compile_creates_source_pages_and_catalog(self) -> None:
        initialize_project(self.config)
        raw_file = self.root / "raw/retrieval-notes.md"
        raw_file.parent.mkdir(parents=True, exist_ok=True)
        raw_file.write_text("# Retrieval Notes\n\nLong context beats brittle RAG at small scale.", encoding="utf-8")

        result = compile_knowledge_base(self.config, use_openai=False)
        self.assertEqual(result.mode, "deterministic")
        self.assertTrue((self.root / ".kb/catalog.json").exists())
        self.assertTrue((self.root / "vault/wiki/sources/retrieval-notes.md").exists())
        self.assertTrue((self.root / "vault/wiki/Index.md").exists())

    def test_search_prefers_matching_titles(self) -> None:
        initialize_project(self.config)
        raw_file = self.root / "raw/agent-memory.md"
        raw_file.parent.mkdir(parents=True, exist_ok=True)
        raw_file.write_text("# Agent Memory\n\nCompoundable outputs improve future answers.", encoding="utf-8")
        compile_knowledge_base(self.config, use_openai=False)

        snapshot = load_catalog(self.config)
        results = search_catalog(snapshot, "Agent Memory", limit=5)
        self.assertTrue(results)
        self.assertIn("agent-memory", results[0].record.rel_path)

    def test_ask_and_heal_write_reports(self) -> None:
        initialize_project(self.config)
        raw_file = self.root / "raw/knowledge.md"
        raw_file.parent.mkdir(parents=True, exist_ok=True)
        raw_file.write_text("# Knowledge\n\nEvery answer compounds into the wiki.", encoding="utf-8")
        compile_knowledge_base(self.config, use_openai=False)

        ask_result = ask_question(self.config, "What compounds into the wiki?", use_openai=False)
        heal_result = heal_knowledge_base(self.config, use_openai=False)

        self.assertTrue(any(path.startswith("outputs/reports/") for path in ask_result.files_written))
        self.assertTrue(any(path.startswith("outputs/reports/") for path in heal_result.files_written))
        self.assertTrue((self.root / "vault/wiki/System Health.md").exists())


class MarkdownHelpersTests(unittest.TestCase):
    def test_slugify(self) -> None:
        self.assertEqual(slugify("LLM Knowledge Base"), "llm-knowledge-base")

    def test_extract_markdown_links(self) -> None:
        links = extract_markdown_links("[[Home]] and [Docs](vault/wiki/Docs.md)")
        self.assertEqual(links, ["Home", "vault/wiki/Docs.md"])


if __name__ == "__main__":
    unittest.main()
