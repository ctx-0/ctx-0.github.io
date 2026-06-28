from __future__ import annotations

import argparse
import calendar
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape


ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
PERIODS = ("favourites", "recent", "last month", "some time ago")


def load_yaml(name: str):
    with (DATA_DIR / name).open(encoding="utf-8") as file:
        return yaml.safe_load(file)


def parse_read_date(value: str | date) -> date:
    if isinstance(value, date):
        return value

    value = str(value)
    if len(value) == 7:
        year, month = map(int, value.split("-"))
        return date(year, month, calendar.monthrange(year, month)[1])

    return datetime.strptime(value, "%Y-%m-%d").date()


def group_reading(entries: list[dict], today: date) -> list[dict]:
    grouped = defaultdict(list)

    for entry in entries:
        item = dict(entry)
        item["_read_date"] = parse_read_date(item["read_date"])
        age = (today - item["_read_date"]).days

        if age < 0:
            raise ValueError(f"read_date cannot be in the future: {item['read_date']}")
        if age <= 7:
            period = "recent"
        elif age <= 31:
            period = "last month"
        else:
            period = "some time ago"

        grouped[period].append(item)
        if item.get("favorite"):
            grouped["favourites"].append(item)

    for items in grouped.values():
        items.sort(key=lambda item: item["_read_date"], reverse=True)

    return [
        {"label": period, "entries": grouped[period]}
        for period in PERIODS
        if grouped[period]
    ]


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
        reading_groups=group_reading(reading_data["entries"], today),
        projects=load_yaml("projects.yaml"),
        current_work=load_yaml("current_work.yaml"),
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
