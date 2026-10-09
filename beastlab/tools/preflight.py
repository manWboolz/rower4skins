#!/usr/bin/env python3
"""Preflight: lay every sheet's rows and columns over each other and list what will fail.

Errors (block the build):
  - a cell that is missing, empty or of the wrong type
  - an enum value that is not allowed, a regex that does not compile, a bad colour
  - a reference to another sheet that does not resolve
  - a duplicate id
  - a system whose class is not implemented in src/
  - a sheet row that no code uses (unimplemented)
Unverified (listed, do not block): hook rows with verified=false. They are checked in the
running game by the hook report the mod writes (UserData/BeastLab/hook_report.txt).
"""
import re
import sys

from sheetlib import REGEX_COLUMNS, SRC, load_all

HEX = re.compile(r"^#[0-9a-fA-F]{6}$")


def check_cell(sheet, row, col, spec, value, ids, errors):
    where = f"{sheet}[{row.get('id', '?')}].{col}"
    kind = spec["type"]
    if value is None:
        errors.append(f"{where}: missing")
        return
    if kind in ("string", "enum"):
        if not isinstance(value, str) or value == "":
            errors.append(f"{where}: empty or not text")
            return
        if kind == "enum" and value not in spec["values"]:
            errors.append(f"{where}: '{value}' not one of {spec['values']}")
    elif kind == "string[]":
        if not isinstance(value, list) or any(not isinstance(v, str) or v == "" for v in value):
            errors.append(f"{where}: must be a list of non-empty text")
            return
    elif kind == "int":
        if not isinstance(value, int) or isinstance(value, bool):
            errors.append(f"{where}: not an int")
    elif kind == "float":
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            errors.append(f"{where}: not a number")
    elif kind == "bool":
        if not isinstance(value, bool):
            errors.append(f"{where}: not true/false")
    else:
        errors.append(f"{where}: unknown column type {kind}")

    if REGEX_COLUMNS.search(col) and isinstance(value, str):
        try:
            re.compile(value, re.I)
        except re.error as e:
            errors.append(f"{where}: bad regex: {e}")
    if col.endswith("color") and isinstance(value, str) and not HEX.match(value):
        errors.append(f"{where}: colour must be #rrggbb")

    ref = spec.get("ref")
    if ref:
        targets = ids.get(ref)
        if targets is None:
            errors.append(f"{where}: refers to unknown sheet '{ref}'")
            return
        for v in value if isinstance(value, list) else [value]:
            if v not in targets:
                errors.append(f"{where}: '{v}' not found in sheet {ref}")


def main():
    sheets = load_all()
    errors, unverified = [], []
    ids = {}
    for name, sheet in sheets.items():
        seen = set()
        for row in sheet["rows"]:
            rid = row.get("id")
            if rid in seen:
                errors.append(f"{name}: duplicate id '{rid}'")
            seen.add(rid)
        ids[name] = seen

    cells = 0
    for name, sheet in sheets.items():
        cols = sheet["columns"]
        for row in sheet["rows"]:
            for extra in set(row) - set(cols):
                errors.append(f"{name}[{row.get('id')}].{extra}: column not declared")
            for col, spec in cols.items():
                cells += 1
                check_cell(name, row, col, spec, row.get(col), ids, errors)

    # Code coverage: every row id must be used by the code, every system class must exist.
    code = "\n".join(p.read_text(encoding="utf-8") for p in SRC.rglob("*.cs") if "Generated" not in p.parts)
    for row in sheets["systems"]["rows"]:
        if not re.search(rf"\bclass\s+{row['cls']}\b", code):
            errors.append(f"systems[{row['id']}]: class {row['cls']} not implemented")
    # Sheets whose rows are consumed one by one by id (others are iterated as whole tables).
    by_id = {"hud": "HudIds", "hooks": "HookIds", "columns_dltb": "DltbColumnIds", "dltb_sources": "DltbSourceIds"}
    for sheet, cls in by_id.items():
        for rid in ids[sheet]:
            if not re.search(rf"\b{cls}\.{re.escape(rid.replace('.', '_'))}\b", code):
                errors.append(f"{sheet}[{rid}]: no code uses it ({cls}.{rid}) - unimplemented")

    for row in sheets["hooks"]["rows"]:
        if not row.get("verified"):
            unverified.append(f"hooks[{row['id']}]: {row['type']}.{row['member']} (from {row['source']})")

    total_rows = sum(len(s["rows"]) for s in sheets.values())
    print(f"preflight: {len(sheets)} sheets, {total_rows} rows, {cells} cells checked")
    if unverified:
        print(f"UNVERIFIED in the running game ({len(unverified)}) - checked by the in-game hook report:")
        for u in unverified:
            print("  ?", u)
    if errors:
        print(f"ERRORS ({len(errors)}):")
        for e in errors:
            print("  x", e)
        return 1
    print("preflight clean (no unfilled cells, all references resolve, every row implemented)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
