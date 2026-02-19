"""
Group A (FHE-Based PIR) plots: A1-A3.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from plot_config import GROUP_COLORS, apply_style
from plot_utils import (
    load_data, get_schemes, filter_concrete,
    scheme_color, annotate_points_with_footnotes, save_fig_with_schemes,
    build_footnote_map,
)

GROUP = "A"
COLOR = GROUP_COLORS[GROUP]


def a1_fhe_efficiency_frontier(data):
    """A1: Expansion Factor vs Server Time scatter."""
    schemes = get_schemes(data, group=GROUP, max_tier=None)
    schemes = [s for s in schemes if
               s.get("group_specific", {}).get("expansion_factor") is not None and
               s.get("concrete", {}).get("server_time_ms") is not None]

    fig, ax = plt.subplots(figsize=(10, 7))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        F = s["group_specific"]["expansion_factor"]
        t = s["concrete"]["server_time_ms"]
        ax.scatter(F, t, color=COLOR, s=80, zorder=5, edgecolors="white", linewidths=0.5)
        points.append((F, t, s["display_name"], s["id"]))

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_yscale("log")
    ax.set_xlabel("Expansion Factor (F)")
    ax.set_ylabel("Server Time (ms)")
    ax.set_title("FHE Efficiency Frontier — Expansion Factor vs Server Time")

    return save_fig_with_schemes(fig, "group_a", "A1_fhe_efficiency_frontier.png", schemes)


def a2_evolution_timeline(data):
    """A2: Communication evolution from XPIR (2014) to Spiral (2022)."""
    schemes = filter_concrete(data, ["query_size_kb"], group=GROUP)
    schemes.sort(key=lambda s: s.get("year", 9999))

    fig, ax = plt.subplots(figsize=(11, 6))

    footnote_map = build_footnote_map(schemes)
    names = [s["display_name"] for s in schemes]
    years = [s.get("year", 0) for s in schemes]
    x_labels = [f"{n} $^{{{footnote_map.get(s['id'], '')}}}$\n({y})" for n, y, s in zip(names, years, schemes)]
    x_pos = range(len(schemes))

    query_sizes = [s["concrete"]["query_size_kb"] for s in schemes]
    response_sizes = [s["concrete"].get("response_size_kb") or 0 for s in schemes]

    bar_width = 0.35
    bars1 = ax.bar([x - bar_width / 2 for x in x_pos], query_sizes,
                   bar_width, label="Query Size (KB)", color=COLOR, alpha=0.8)
    bars2 = ax.bar([x + bar_width / 2 for x in x_pos], response_sizes,
                   bar_width, label="Response Size (KB)", color=COLOR, alpha=0.4)

    for bar in bars1:
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, h, f"{h:.0f}",
                    ha="center", va="bottom", fontsize=7)
    for bar in bars2:
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width() / 2, h, f"{h:.0f}",
                    ha="center", va="bottom", fontsize=7)

    ax.set_xticks(list(x_pos))
    ax.set_xticklabels(x_labels, fontsize=8, rotation=45, ha="right")
    ax.set_yscale("log")
    ax.set_ylabel("Size (KB)")
    ax.set_title("FHE-Based PIR Communication Evolution")
    ax.legend()

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_a", "A2_evolution_timeline.png", schemes)


def a3_full_comparison_heatmap(data):
    """A3: Full comparison heatmap table for all Group A schemes."""
    schemes = get_schemes(data, group=GROUP)
    schemes.sort(key=lambda s: s.get("year", 9999))

    columns = ["Year", "Query (KB)", "Response (KB)", "Server (ms)", "Throughput (GB/s)", "Rate", "F"]

    cell_text = []
    row_labels = []
    for s in schemes:
        c = s.get("concrete", {}) or {}
        gs = s.get("group_specific", {}) or {}
        row = [
            str(s.get("year", "?")),
            f"{c['query_size_kb']:.1f}" if c.get("query_size_kb") else "—",
            f"{c['response_size_kb']:.1f}" if c.get("response_size_kb") else "—",
            f"{c['server_time_ms']:,.0f}" if c.get("server_time_ms") else "—",
            f"{c['throughput_gbps']:.2f}" if c.get("throughput_gbps") else "—",
            f"{gs['rate']:.4f}" if gs.get("rate") else "—",
            f"{gs['expansion_factor']:.1f}" if gs.get("expansion_factor") else "—",
        ]
        cell_text.append(row)
        row_labels.append(s["display_name"])

    fig_height = max(4, len(schemes) * 0.45 + 2)
    fig, ax = plt.subplots(figsize=(12, fig_height))
    ax.axis("off")

    table = ax.table(
        cellText=cell_text,
        rowLabels=row_labels,
        colLabels=columns,
        loc="center",
        cellLoc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.4)

    # Color row labels
    for i in range(len(schemes)):
        cell = table[i + 1, -1]
        cell.set_text_props(color=COLOR, fontweight="bold")

    ax.set_title("Group A (FHE-Based) Full Comparison", fontsize=12, pad=20)

    return save_fig_with_schemes(fig, "group_a", "A3_full_comparison_heatmap.png", schemes)


def generate_group_a():
    """Generate all Group A plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating Group A plots...")
    results = {}
    results["A1"] = a1_fhe_efficiency_frontier(data)
    results["A2"] = a2_evolution_timeline(data)
    results["A3"] = a3_full_comparison_heatmap(data)
    print("Done with Group A plots.")
    return results


if __name__ == "__main__":
    generate_group_a()
