from llm_kb.markdown import parse_frontmatter, write_frontmatter


def test_frontmatter_roundtrip() -> None:
    body = "# Summary\n\nHello world."
    rendered = write_frontmatter(
        {
            "title": "Sample",
            "concepts": ["memory", "agents"],
            "kind": "source",
        },
        body,
    )
    frontmatter, parsed_body = parse_frontmatter(rendered)
    assert frontmatter["title"] == "Sample"
    assert frontmatter["concepts"] == ["memory", "agents"]
    assert parsed_body.startswith("# Summary")
