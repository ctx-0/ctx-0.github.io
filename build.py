from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape


ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"


def load_yaml(name: str):
    with (DATA_DIR / name).open(encoding="utf-8") as file:
        return yaml.safe_load(file)


def build(today: date) -> None:
    environment = Environment(
        loader=FileSystemLoader(ROOT / "templates"),
        autoescape=select_autoescape(("html", "xml")),
        undefined=StrictUndefined,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = environment.get_template("index.html.j2")
    reading_data = load_yaml("reading.yaml")
    html = template.render(
        site=load_yaml("site.yaml"),
        reading_entries=reading_data["entries"],
        projects=load_yaml("projects.yaml"),
        quotes=load_yaml("quotes.yaml") or [],
        writing=load_yaml("writing.yaml"),
    )
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"Built index.html using {today.isoformat()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the static homepage.")
    parser.add_argument(
        "--today",
        type=date.fromisoformat,
        default=date.today(),
        help="Override the build date using YYYY-MM-DD.",
    )
    args = parser.parse_args()
    build(args.today)


if __name__ == "__main__":
    main()
