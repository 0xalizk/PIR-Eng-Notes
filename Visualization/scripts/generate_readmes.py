"""
Generate per-directory READMEs with captioned plots and footnoted citations.

Each plot gets a 1-column, 2-row table (image + caption) followed by a
footnotes section linking each data point back to its notes file.
"""

import os
from pathlib import Path
from urllib.parse import quote

from plot_config import GROUP_DIR_NAMES
from plot_utils import (
    load_data, get_notes_path, build_footnote_map, OUTPUT_DIR, SCRIPT_DIR,
)

# Group titles for README headings
GROUP_TITLES = {
    "top_level": "Top-Level Cross-Group PIR Plots",
    "group_a": "Group A — FHE-Based PIR",
    "group_b": "Group B — Stateless Single-Server PIR",
    "group_c": "Group C — Client-Independent Preprocessing",
    "group_d": "Group D — Client-Dependent Preprocessing",
    "group_x": "Group X — Extensions",
}

# Plot titles (used in captions). Keyed by plot ID.
PLOT_TITLES = {
    "T1": "Communication Design Space — Query vs Response Size",
    "T2": "Server Throughput Comparison",
    "T3": "Pareto Frontier — Communication vs Server Time",
    "T4": "PIR Scheme Heatmap Overview",
    "T5": "Online vs Offline Cost Split",
    "T6": "PIR Throughput Evolution Over Time",
    "A1": "FHE Efficiency Frontier — Expansion Factor vs Server Time",
    "A2": "FHE-Based PIR Communication Evolution",
    "A3": "Group A (FHE-Based) Full Comparison",
    "B1": "Stateless PIR — Throughput vs Communication Tradeoff",
    "B2": "Stateless PIR — Query/Response Size Comparison",
    "B3": "Stateless PIR — Server Computation Time",
    "C1": "Client-Independent Preprocessing — Online Throughput",
    "C2": "Hint Size vs Online Communication Tradeoff",
    "C3": "Throughput Scaling with Database Size",
    "D1": "Client-Dependent Preprocessing — Online Server Latency",
    "D2": "Server vs Client Online Latency",
    "D3": "Client Storage vs Server Computation Tradeoff",
    "D4": "Asymptotic Classification — Theory-Only Schemes",
    "X1": "Extensions — Narrative Comparison",
}

# Short captions for each plot ID
PLOT_CAPTIONS = {
    "T1": "Log-log scatter of query vs response size across all groups.",
    "T2": "Horizontal bar chart of server throughput (GB/s) by group.",
    "T3": "Server time vs total communication with Pareto frontier overlay.",
    "T4": "Heatmap table of all 35 schemes across key performance metrics.",
    "T5": "Stacked bar comparison of online vs offline communication and computation.",
    "T6": "Throughput evolution over publication year; marker size inversely proportional to communication.",
    "A1": "Scatter of expansion factor vs server time for FHE-based schemes.",
    "A2": "Paired bar chart showing query/response size evolution across FHE-based schemes.",
    "A3": "Full comparison table of all Group A schemes.",
    "B1": "Throughput vs total online communication scatter for stateless schemes.",
    "B2": "Paired horizontal bars of query/response sizes sorted by total communication.",
    "B3": "Horizontal bar chart of server computation time for stateless schemes.",
    "C1": "Bar chart of online throughput for preprocessing-based schemes.",
    "C2": "Scatter of offline hint size vs online communication.",
    "C3": "Throughput scaling with database size (multi-point where available).",
    "D1": "Horizontal bar chart of online server latency (log scale).",
    "D2": "Scatter of server vs client online latency; bubble size indicates client storage.",
    "D3": "Scatter of client storage vs server computation tradeoff.",
    "D4": "Asymptotic complexity table for theory-only Group D schemes.",
    "X1": "Narrative comparison table for extension/variant PIR schemes.",
}


def _make_footnote_entry(idx, scheme, notes_path, output_dir):
    """Build a single footnote line for a scheme.

    Args:
        idx: footnote number (1-based)
        scheme: scheme dict
        notes_path: Path to the notes file, or None
        output_dir: Path to the output subdirectory (for relative path computation)
    Returns:
        footnote string
    """
    name = scheme["display_name"]
    source_ref = scheme.get("source_ref", "")
    estimation_meta = scheme.get("estimation_meta")

    if notes_path is not None:
        # Compute relative path from output_dir to the notes file
        try:
            rel = os.path.relpath(notes_path, output_dir)
        except ValueError:
            rel = str(notes_path)
        notes_filename = notes_path.name
        # Link to performance-benchmarks section
        # URL-encode spaces so links render inside <details> HTML blocks
        rel_encoded = quote(rel, safe="/.#")
        link = f"[{notes_filename}]({rel_encoded}#performance-benchmarks)"
    else:
        link = "(notes file not found)"

    line = f"{idx}. **{name}**"
    if source_ref:
        line += f" — {source_ref} in {link}"
    else:
        line += f" — {link}"

    if estimation_meta is not None:
        conf = estimation_meta.get("confidence", "unknown")
        line += f" *[estimated, confidence: {conf}]*"

    return line


def generate_readme(subdir, plot_results):
    """Generate a README.md for a single output subdirectory.

    Args:
        subdir: directory name (e.g. "top_level", "group_a")
        plot_results: dict of {plot_id: (Path, list_of_scheme_dicts)}
    """
    output_dir = OUTPUT_DIR / subdir
    output_dir.mkdir(parents=True, exist_ok=True)

    title = GROUP_TITLES.get(subdir, subdir)
    lines = [f"## {title}\n"]

    # Sort plot IDs for consistent ordering
    plot_ids = sorted(plot_results.keys())

    for plot_id in plot_ids:
        path, schemes = plot_results[plot_id]
        filename = Path(path).name
        plot_title = PLOT_TITLES.get(plot_id, plot_id)
        caption = PLOT_CAPTIONS.get(plot_id, "")

        # Build footnote map for this plot
        footnote_map = build_footnote_map(schemes)

        # Scheme names with superscripts for caption
        scheme_refs = []
        for s in schemes:
            fn = footnote_map.get(s["id"], "")
            scheme_refs.append(f"{s['display_name']}<sup>{fn}</sup>")
        scheme_list = ", ".join(scheme_refs)

        # Plot section: 1-column, 2-row table
        lines.append(f"### {plot_title}\n")
        lines.append("| |")
        lines.append("|:---:|")
        lines.append(f"| ![{plot_title}]({filename}) |")
        lines.append(f"| <sub>**{plot_title}.** {caption} Schemes: {scheme_list}</sub> |")
        lines.append("")

        # Footnotes section (collapsible)
        lines.append("<details>")
        lines.append('<summary><b style="color: #E67300;">Citations and Footnotes</b></summary>')
        lines.append("")
        for s in schemes:
            fn_num = int(footnote_map[s["id"]])
            notes_path = get_notes_path(s)
            entry = _make_footnote_entry(fn_num, s, notes_path, output_dir)
            lines.append(entry)
        lines.append("")
        lines.append("</details>")
        lines.append("")

    readme_path = output_dir / "README.md"
    readme_path.write_text("\n".join(lines) + "\n")
    print(f"  Saved: {readme_path}")
