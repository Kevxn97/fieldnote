from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib  # type: ignore[no-redef]


CONFIG_FILENAME = "lkb.toml"


@dataclass(slots=True)
class CompileConfig:
    concurrency: int = 3
    max_source_chars: int = 16_000
    reasoning_effort: str = "medium"


@dataclass(slots=True)
class AskConfig:
    top_k: int = 6
    reasoning_effort: str = "medium"


@dataclass(slots=True)
class HealConfig:
    top_k: int = 10
    reasoning_effort: str = "medium"


@dataclass(slots=True)
class PathsConfig:
    raw: str = "raw"
    wiki: str = "wiki"
    outputs: str = "outputs"
    cache: str = ".cache"


@dataclass(slots=True)
class ProjectConfig:
    name: str = "Research Vault"
    model: str = "gpt-5.4"


@dataclass(slots=True)
class AppConfig:
    root: Path
    project: ProjectConfig
    paths: PathsConfig
    compile: CompileConfig
    ask: AskConfig
    heal: HealConfig


def default_config(root: Path) -> AppConfig:
    return AppConfig(
        root=root,
        project=ProjectConfig(),
        paths=PathsConfig(),
        compile=CompileConfig(),
        ask=AskConfig(),
        heal=HealConfig(),
    )


def load_config(root: Path | None = None) -> AppConfig:
    resolved_root = (root or Path.cwd()).resolve()
    config = default_config(resolved_root)
    config_path = resolved_root / CONFIG_FILENAME
    if not config_path.exists():
        return config

    with config_path.open("rb") as handle:
        data = tomllib.load(handle)

    project_data = data.get("project", {})
    paths_data = data.get("paths", {})
    compile_data = data.get("compile", {})
    ask_data = data.get("ask", {})
    heal_data = data.get("heal", {})

    return AppConfig(
        root=resolved_root,
        project=ProjectConfig(
            name=project_data.get("name", config.project.name),
            model=project_data.get("model", config.project.model),
        ),
        paths=PathsConfig(
            raw=paths_data.get("raw", config.paths.raw),
            wiki=paths_data.get("wiki", config.paths.wiki),
            outputs=paths_data.get("outputs", config.paths.outputs),
            cache=paths_data.get("cache", config.paths.cache),
        ),
        compile=CompileConfig(
            concurrency=int(compile_data.get("concurrency", config.compile.concurrency)),
            max_source_chars=int(
                compile_data.get("max_source_chars", config.compile.max_source_chars)
            ),
            reasoning_effort=compile_data.get(
                "reasoning_effort", config.compile.reasoning_effort
            ),
        ),
        ask=AskConfig(
            top_k=int(ask_data.get("top_k", config.ask.top_k)),
            reasoning_effort=ask_data.get(
                "reasoning_effort", config.ask.reasoning_effort
            ),
        ),
        heal=HealConfig(
            top_k=int(heal_data.get("top_k", config.heal.top_k)),
            reasoning_effort=heal_data.get(
                "reasoning_effort", config.heal.reasoning_effort
            ),
        ),
    )


def render_config_template(config: AppConfig | None = None) -> str:
    cfg = config or default_config(Path.cwd())
    return "\n".join(
        [
            "[project]",
            f'name = "{cfg.project.name}"',
            f'model = "{cfg.project.model}"',
            "",
            "[paths]",
            f'raw = "{cfg.paths.raw}"',
            f'wiki = "{cfg.paths.wiki}"',
            f'outputs = "{cfg.paths.outputs}"',
            f'cache = "{cfg.paths.cache}"',
            "",
            "[compile]",
            f"concurrency = {cfg.compile.concurrency}",
            f"max_source_chars = {cfg.compile.max_source_chars}",
            f'reasoning_effort = "{cfg.compile.reasoning_effort}"',
            "",
            "[ask]",
            f"top_k = {cfg.ask.top_k}",
            f'reasoning_effort = "{cfg.ask.reasoning_effort}"',
            "",
            "[heal]",
            f"top_k = {cfg.heal.top_k}",
            f'reasoning_effort = "{cfg.heal.reasoning_effort}"',
            "",
        ]
    )
