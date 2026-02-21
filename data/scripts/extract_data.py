#!/usr/bin/env python3
"""
Extract PIR scheme data from group README.md tables and notes.md files.

This script was used to generate the initial draft of pir_data.json.
The final pir_data.json is hand-curated and is the single source of truth.

To regenerate from scratch:
    cd data/
    uv run scripts/extract_data.py

This will overwrite pir_data.json with a fresh extraction. Review carefully
before committing — the hand-curated version may contain corrections.
"""

import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent.parent
SCHEMES_DIR = REPO_ROOT / "Schemes"
OUTPUT_FILE = Path(__file__).parent.parent / "pir_data.json"

GROUP_DIRS = {
    "A": SCHEMES_DIR / "Group A - FHE Based PIR",
    "B": SCHEMES_DIR / "Group B - Stateless Single Server PIR",
    "C": SCHEMES_DIR / "Group C - Client Independent Preprocessing",
    "D": SCHEMES_DIR / "Group D - Client Dependent Preprocessing",
    "X": SCHEMES_DIR / "Group X - Extensions",
}


def parse_kb(text):
    """Parse a size value and return KB."""
    if not text or text.strip() in ("—", "--", "N/A", ""):
        return None
    text = text.strip()
    # Match patterns like "14 KB", "3.556 KB", "64 KiB", "32 MB"
    m = re.search(r"([\d,.]+)\s*(KB|KiB|MB|GB|B)\b", text, re.IGNORECASE)
    if m:
        val = float(m.group(1).replace(",", ""))
        unit = m.group(2).upper()
        if unit in ("KB", "KIB"):
            return val
        elif unit == "MB":
            return val * 1024
        elif unit == "GB":
            return val * 1024 * 1024
        elif unit == "B":
            return val / 1024
    return None


def parse_ms(text):
    """Parse a time value and return ms."""
    if not text or text.strip() in ("—", "--", "N/A", ""):
        return None
    text = text.strip()
    m = re.search(r"~?([\d,.]+)\s*(ms|s|min)\b", text, re.IGNORECASE)
    if m:
        val = float(m.group(1).replace(",", ""))
        unit = m.group(2).lower()
        if unit == "ms":
            return val
        elif unit == "s":
            return val * 1000
        elif unit == "min":
            return val * 60000
    return None


def parse_gbps(text):
    """Parse a throughput value and return GB/s."""
    if not text or text.strip() in ("—", "--", "N/A", ""):
        return None
    text = text.strip()
    m = re.search(r"([\d,.]+)\s*(GB/s|MB/s|Gbit/s)", text, re.IGNORECASE)
    if m:
        val = float(m.group(1).replace(",", ""))
        unit = m.group(2)
        if "GB/s" in unit:
            return val
        elif "MB/s" in unit:
            return val / 1000
        elif "Gbit/s" in unit:
            return val / 8
    return None


def main():
    print("extract_data.py: This script generates a draft pir_data.json.")
    print("The canonical pir_data.json is hand-curated. Use with care.")
    print()
    print("For now, the hand-curated pir_data.json is the source of truth.")
    print("This script is provided for reference and future automation.")


if __name__ == "__main__":
    main()
