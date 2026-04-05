from __future__ import annotations

import os
import tomllib
from dataclasses import dataclass
from pathlib import Path


def _read_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    data: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        data[key.strip()] = value.strip()
    return data


@dataclass(slots=True)
class KnowledgeBaseConfig:
    root: Path
    project_name: str
    raw_dir: Path
    vault_dir: Path
    output_dir: Path
    state_dir: Path
    model: str
    reasoning_effort: str
    web_host: str
    web_port: int
    web_reload: bool
    openai_api_key: str | None
    max_search_results: int = 8

    @property
    def wiki_dir(self) -> Path:
        return self.vault_dir / "wiki"

    @property
    def catalog_path(self) -> Path:
        return self.state_dir / "catalog.json"

    @property
    def run_log_dir(self) -> Path:
        return self.state_dir / "runs"


def load_config(root: str | Path | None = None) -> KnowledgeBaseConfig:
    root_path = Path(root or os.getenv("KB_ROOT") or ".").resolve()
    env_values = _read_env_file(root_path / ".env")

    def get_value(name: str, default: str) -> str:
        return os.getenv(name) or env_values.get(name) or default

    config_path = root_path / "knowledge_base.toml"
    file_config: dict[str, object] = {}
    if config_path.exists():
        file_config = tomllib.loads(config_path.read_text(encoding="utf-8"))

    project_name = str(file_config.get("project_name", "LLM Knowledge Base"))
    raw_dir = root_path / str(file_config.get("raw_dir", get_value("KB_RAW_DIR", "raw")))
    vault_dir = root_path / str(file_config.get("vault_dir", get_value("KB_VAULT_DIR", "vault")))
    output_dir = root_path / str(file_config.get("output_dir", get_value("KB_OUTPUT_DIR", "outputs")))
    state_dir = root_path / str(file_config.get("state_dir", get_value("KB_STATE_DIR", ".kb")))

    return KnowledgeBaseConfig(
        root=root_path,
        project_name=project_name,
        raw_dir=raw_dir,
        vault_dir=vault_dir,
        output_dir=output_dir,
        state_dir=state_dir,
        model=str(file_config.get("model", get_value("OPENAI_MODEL", "gpt-5.4"))),
        reasoning_effort=str(
            file_config.get(
                "reasoning_effort",
                get_value("OPENAI_REASONING_EFFORT", "medium"),
            )
        ),
        web_host=str(file_config.get("web_host", get_value("KB_WEB_HOST", "127.0.0.1"))),
        web_port=int(str(file_config.get("web_port", get_value("KB_WEB_PORT", "8000")))),
        web_reload=str(file_config.get("web_reload", get_value("KB_WEB_RELOAD", "true"))).lower()
        in {"1", "true", "yes", "on"},
        openai_api_key=os.getenv("OPENAI_API_KEY") or env_values.get("OPENAI_API_KEY"),
        max_search_results=int(str(file_config.get("max_search_results", "8"))),
    )
