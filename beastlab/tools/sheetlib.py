"""Shared loader for the BeastLab design sheets (sheets/*.json)."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHEETS = ROOT / "sheets"
SRC = ROOT / "src" / "BeastLab"


def load_all():
    sheets = {}
    for path in sorted(SHEETS.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        data["_file"] = path.name
        sheets[data["sheet"]] = data
    return sheets


def pascal(name):
    return "".join(p[:1].upper() + p[1:] for p in re.split(r"[_\W]+", name) if p)


REGEX_COLUMNS = re.compile(r"(^match$|_match$|_regex$)")
