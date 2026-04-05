from pathlib import Path

from llm_kb.utils import make_source_id, slugify


def test_slugify() -> None:
    assert slugify("My Great Article.pdf") == "my-great-article-pdf"


def test_make_source_id() -> None:
    assert make_source_id(Path("imports/demo/paper.md")).startswith("imports-demo-paper-md")
