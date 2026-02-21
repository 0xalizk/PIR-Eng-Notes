"""
Group B (Stateless Single-Server PIR) plots: B1-B3.
"""

import numpy as np
import matplotlib.pyplot as plt

from plot_config import GROUP_COLORS, apply_style
from plot_utils import (
    load_data, get_schemes, filter_concrete,
    scheme_color, annotate_points_with_footnotes, save_fig_with_schemes,
    build_footnote_map,
)

GROUP = "B"
COLOR = GROUP_COLORS[GROUP]


def b1_throughput_vs_communication(data):
    """B1: Throughput vs Total Communication scatter."""
    schemes = filter_concrete(data, ["throughput_gbps", "query_size_kb"], group=GROUP)

    fig, ax = plt.subplots(figsize=(10, 7))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        total_comm = c["query_size_kb"] + (c.get("response_size_kb") or 0)
        tp = c["throughput_gbps"]
        ax.scatter(total_comm, tp, color=COLOR, s=80, zorder=5, edgecolors="white", linewidths=0.5)
        points.append((total_comm, tp, s["display_name"], s["id"]))

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Total Online Communication (KB)")
    ax.set_ylabel("Throughput (GB/s)")
    ax.set_title("Stateless PIR — Throughput vs Communication Tradeoff")

    return save_fig_with_schemes(fig, "group_b", "B1_throughput_vs_communication.png", schemes)


def b2_query_response_paired_bars(data):
    """B2: Query/Response Paired Bars sorted by total communication."""
    schemes = filter_concrete(data, ["query_size_kb"], group=GROUP)
    schemes.sort(key=lambda s: (s["concrete"]["query_size_kb"] + (s["concrete"].get("response_size_kb") or 0)))

    fig, ax = plt.subplots(figsize=(10, max(4, len(schemes) * 0.6)))

    footnote_map = build_footnote_map(schemes)
    names = [f"{s['display_name']} $^{{{footnote_map.get(s['id'], '')}}}$" for s in schemes]
    y_pos = range(len(schemes))

    query_sizes = [s["concrete"]["query_size_kb"] for s in schemes]
    response_sizes = [s["concrete"].get("response_size_kb") or 0 for s in schemes]

    bar_height = 0.35
    ax.barh([y - bar_height / 2 for y in y_pos], query_sizes,
            bar_height, label="Query (KB)", color=COLOR, alpha=0.9)
    ax.barh([y + bar_height / 2 for y in y_pos], response_sizes,
            bar_height, label="Response (KB)", color=COLOR, alpha=0.4)

    for i in range(len(schemes)):
        q = query_sizes[i]
        r = response_sizes[i]
        total = q + r
        ax.text(max(q, r) * 1.1, i, f"Total: {total:.0f} KB", va="center", fontsize=7.5)

    ax.set_yticks(list(y_pos))
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xscale("log")
    ax.set_xlabel("Size (KB)")
    ax.set_title("Stateless PIR — Query/Response Size Comparison")
    ax.legend(fontsize=9)
    ax.invert_yaxis()

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_b", "B2_query_response_bars.png", schemes)


def b3_server_time_comparison(data):
    """B3: Server time comparison bars."""
    schemes = filter_concrete(data, ["server_time_ms"], group=GROUP)
    schemes.sort(key=lambda s: s["concrete"]["server_time_ms"])

    fig, ax = plt.subplots(figsize=(10, max(4, len(schemes) * 0.5)))

    footnote_map = build_footnote_map(schemes)
    names = [f"{s['display_name']} $^{{{footnote_map.get(s['id'], '')}}}$" for s in schemes]
    y_pos = range(len(schemes))
    times = [s["concrete"]["server_time_ms"] for s in schemes]

    bars = ax.barh(y_pos, times, color=COLOR, height=0.6, edgecolor="white", linewidth=0.5)

    for i, (bar, s) in enumerate(zip(bars, schemes)):
        c = s["concrete"]
        txt = f"{c['server_time_ms']:,.0f} ms"
        if c.get("reference_db"):
            txt += f"  ({c['reference_db']})"
        ax.text(bar.get_width() * 1.05, bar.get_y() + bar.get_height() / 2,
                txt, va="center", fontsize=7.5)

    ax.set_yticks(list(y_pos))
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xscale("log")
    ax.set_xlabel("Server Time (ms)")
    ax.set_title("Stateless PIR — Server Computation Time")
    ax.invert_yaxis()

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_b", "B3_server_time_comparison.png", schemes)


def generate_group_b():
    """Generate all Group B plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating Group B plots...")
    results = {}
    results["B1"] = b1_throughput_vs_communication(data)
    results["B2"] = b2_query_response_paired_bars(data)
    results["B3"] = b3_server_time_comparison(data)
    print("Done with Group B plots.")
    return results


if __name__ == "__main__":
    generate_group_b()
