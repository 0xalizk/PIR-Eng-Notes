"""
Group D (Client-Dependent Preprocessing) plots: D1-D4.
"""

import numpy as np
import matplotlib.pyplot as plt

from plot_config import GROUP_COLORS, apply_style
from plot_utils import (
    load_data, get_schemes, filter_concrete,
    annotate_points_with_footnotes, save_fig, save_fig_with_schemes,
    build_footnote_map,
)

GROUP = "D"
COLOR = GROUP_COLORS[GROUP]


def d1_online_latency_bars(data):
    """D1: Online Latency horizontal bar chart (log scale)."""
    schemes = filter_concrete(data, ["server_time_ms"], group=GROUP)
    schemes.sort(key=lambda s: s["concrete"]["server_time_ms"])

    fig, ax = plt.subplots(figsize=(10, max(4, len(schemes) * 0.6)))

    footnote_map = build_footnote_map(schemes)
    names = [f"{s['display_name']} $^{{{footnote_map.get(s['id'], '')}}}$" for s in schemes]
    y_pos = range(len(schemes))
    times = [s["concrete"]["server_time_ms"] for s in schemes]

    bars = ax.barh(y_pos, times, color=COLOR, height=0.6, edgecolor="white", linewidth=0.5)

    for bar, s in zip(bars, schemes):
        c = s["concrete"]
        t = c["server_time_ms"]
        if t >= 1000:
            txt = f"{t / 1000:.1f} s"
        else:
            txt = f"{t:.2f} ms"
        if c.get("reference_db"):
            txt += f"  ({c['reference_db']})"
        ax.text(bar.get_width() * 1.1, bar.get_y() + bar.get_height() / 2,
                txt, va="center", fontsize=8)

    ax.set_yticks(list(y_pos))
    ax.set_yticklabels(names, fontsize=10)
    ax.set_xscale("log")
    ax.set_xlabel("Server Online Time (ms)")
    ax.set_title("Client-Dependent Preprocessing — Online Server Latency")
    ax.invert_yaxis()

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_d", "D1_online_latency_bars.png", schemes)


def d2_preprocessing_roi(data):
    """D2: Setup Time vs Per-Query Latency scatter (bubble = client storage)."""
    schemes = filter_concrete(data, ["server_time_ms"], group=GROUP)

    fig, ax = plt.subplots(figsize=(10, 7))

    plotted_schemes = []
    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        latency = c["server_time_ms"]
        storage = c.get("client_storage_mb")
        client_ms = c.get("client_time_ms")

        if client_ms is not None and latency is not None:
            size = 60 if storage is None else max(30, min(300, storage / 5))
            ax.scatter(latency, client_ms, color=COLOR, s=size, zorder=5,
                       edgecolors="black", linewidths=0.5, alpha=0.8)
            label = s["display_name"]
            if storage:
                label += f" ({storage:.0f} MB)"
            points.append((latency, client_ms, label, s["id"]))
            plotted_schemes.append(s)

    if points:
        annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Server Online Time (ms)")
    ax.set_ylabel("Client Online Time (ms)")
    ax.set_title("Server vs Client Online Latency\n(bubble size = client storage)")

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_d", "D2_preprocessing_roi.png", plotted_schemes)


def d3_client_storage_vs_server_time(data):
    """D3: Client Storage vs Server Computation scatter."""
    schemes = get_schemes(data, group=GROUP, max_tier=None)
    schemes = [s for s in schemes if
               s.get("concrete", {}).get("client_storage_mb") is not None and
               s.get("concrete", {}).get("server_time_ms") is not None]

    fig, ax = plt.subplots(figsize=(9, 7))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        ax.scatter(c["client_storage_mb"], c["server_time_ms"], color=COLOR, s=80, zorder=5,
                   edgecolors="black", linewidths=0.5)
        points.append((c["client_storage_mb"], c["server_time_ms"], s["display_name"], s["id"]))

    if points:
        annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Client Storage (MB)")
    ax.set_ylabel("Server Online Time (ms)")
    ax.set_title("Client Storage vs Server Computation Tradeoff")

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_d", "D3_client_storage_vs_server.png", schemes)


def d4_asymptotic_classification(data):
    """D4: Asymptotic Classification Table for theory-only schemes."""
    schemes = get_schemes(data, group=GROUP)
    theory_only = [s for s in schemes if s.get("data_tier", 1) == 3]
    theory_only.sort(key=lambda s: s.get("year", 9999))

    if not theory_only:
        print("  D4: No theory-only schemes, skipping.")
        return None

    columns = ["Year", "Query", "Response", "Server", "Client"]

    cell_text = []
    row_labels = []
    for s in theory_only:
        a = s.get("asymptotic", {}) or {}
        row = [
            str(s.get("year", "?")),
            a.get("query_size", "—"),
            a.get("response_size", "—"),
            a.get("server_computation", "—"),
            a.get("client_computation", "—"),
        ]
        cell_text.append(row)
        row_labels.append(s["display_name"])

    fig_height = max(3, len(theory_only) * 0.6 + 2)
    fig, ax = plt.subplots(figsize=(14, fig_height))
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
    table.scale(1, 1.5)

    for i in range(len(theory_only)):
        cell = table[i + 1, -1]
        cell.set_text_props(color=COLOR, fontweight="bold")

    ax.set_title("Asymptotic Classification — Theory-Only Schemes", fontsize=12, pad=20)

    return save_fig_with_schemes(fig, "group_d", "D4_asymptotic_classification.png", theory_only)


def generate_group_d():
    """Generate all Group D plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating Group D plots...")
    results = {}
    results["D1"] = d1_online_latency_bars(data)
    results["D2"] = d2_preprocessing_roi(data)
    results["D3"] = d3_client_storage_vs_server_time(data)
    d4_result = d4_asymptotic_classification(data)
    if d4_result is not None:
        results["D4"] = d4_result
    print("Done with Group D plots.")
    return results


if __name__ == "__main__":
    generate_group_d()
