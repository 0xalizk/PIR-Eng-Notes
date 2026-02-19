"""
Top-level cross-group PIR plots (T1-T6).
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.lines import Line2D
import matplotlib.patches as mpatches

from plot_config import (
    GROUP_COLORS, GROUP_NAMES, GROUP_ORDER,
    REF_LINE_COLOR, REF_LINE_ALPHA, REF_LINE_STYLE,
    apply_style,
)
from plot_utils import (
    load_data, get_schemes, filter_concrete,
    scheme_color, scheme_marker, scheme_marker_fill, scheme_edge_alpha,
    plot_scheme_point, annotate_points_with_footnotes, add_pareto_frontier,
    make_group_legend, make_tier_legend_handles,
    save_fig_with_schemes, build_footnote_map,
)


def t1_communication_scatter(data):
    """T1: Query Size vs Response Size (log-log scatter)."""
    schemes = filter_concrete(data, ["query_size_kb", "response_size_kb"])

    fig, ax = plt.subplots(figsize=(10, 8))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        x = c["query_size_kb"]
        y = c["response_size_kb"]
        plot_scheme_point(ax, x, y, s, size=70)
        points.append((x, y, s["display_name"], s["id"]))

    for total_kb, label in [(10, "10 KB"), (100, "100 KB"), (1024, "1 MB")]:
        ax.axhline(y=total_kb, color=REF_LINE_COLOR, alpha=0.3, linestyle=":", linewidth=0.8)
        ax.axvline(x=total_kb, color=REF_LINE_COLOR, alpha=0.3, linestyle=":", linewidth=0.8)

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Query Size (KB)")
    ax.set_ylabel("Response Size (KB)")
    ax.set_title("Communication Design Space — Query vs Response Size")

    groups_shown = sorted(set(s["group"] for s in schemes))
    handles = [mpatches.Patch(color=GROUP_COLORS[g], label=f"Group {g}: {GROUP_NAMES[g]}")
               for g in GROUP_ORDER if g in groups_shown]
    handles.extend(make_tier_legend_handles())
    ax.legend(handles=handles, loc="upper left", fontsize=8)

    return save_fig_with_schemes(fig, "top_level", "T1_communication_scatter.png", schemes)


def t2_throughput_bar(data):
    """T2: Throughput Bar Chart (horizontal, log-scale)."""
    schemes = filter_concrete(data, ["throughput_gbps"])
    schemes.sort(key=lambda s: (GROUP_ORDER.index(s["group"]), s["concrete"]["throughput_gbps"]))

    fig, ax = plt.subplots(figsize=(11, max(6, len(schemes) * 0.45)))

    y_positions = []
    labels = []
    colors = []
    values = []
    current_y = 0

    prev_group = None
    for s in schemes:
        if prev_group is not None and s["group"] != prev_group:
            current_y += 0.5
        y_positions.append(current_y)
        fn = build_footnote_map(schemes).get(s["id"], "")
        labels.append(f"{s['display_name']} $^{{{fn}}}$" if fn else s["display_name"])
        colors.append(scheme_color(s))
        values.append(s["concrete"]["throughput_gbps"])
        prev_group = s["group"]
        current_y += 1

    bars = ax.barh(y_positions, values, color=colors, height=0.7, edgecolor="white", linewidth=0.5)

    for i, (bar, s) in enumerate(zip(bars, schemes)):
        c = s["concrete"]
        txt = f"{c['throughput_gbps']:.2f} GB/s"
        if c.get("reference_db"):
            txt += f"  ({c['reference_db']})"
        ax.text(bar.get_width() * 1.05, bar.get_y() + bar.get_height() / 2,
                txt, va="center", fontsize=7.5)

    ax.set_yticks(y_positions)
    ax.set_yticklabels(labels, fontsize=9)
    ax.set_xscale("log")
    ax.set_xlabel("Throughput (GB/s)")
    ax.set_title("Server Throughput Comparison")
    ax.invert_yaxis()

    groups_shown = sorted(set(s["group"] for s in schemes))
    handles = [mpatches.Patch(color=GROUP_COLORS[g], label=f"Group {g}: {GROUP_NAMES[g]}")
               for g in GROUP_ORDER if g in groups_shown]
    ax.legend(handles=handles, loc="lower right", fontsize=8)

    return save_fig_with_schemes(fig, "top_level", "T2_throughput_bar.png", schemes)


def t3_pareto_frontier(data):
    """T3: Server Time vs Total Communication (Pareto frontier)."""
    schemes = filter_concrete(data, ["server_time_ms", "query_size_kb"])

    fig, ax = plt.subplots(figsize=(10, 8))

    footnote_map = build_footnote_map(schemes)
    xs = []
    ys = []
    points = []

    for s in schemes:
        c = s["concrete"]
        total_comm = c["query_size_kb"] + (c.get("response_size_kb") or 0)
        server_ms = c["server_time_ms"]
        xs.append(total_comm)
        ys.append(server_ms)
        plot_scheme_point(ax, total_comm, server_ms, s, size=70)
        points.append((total_comm, server_ms, s["display_name"], s["id"]))

    frontier_idx = add_pareto_frontier(ax, xs, ys)
    for i in frontier_idx:
        s = schemes[i]
        c = s["concrete"]
        total_comm = c["query_size_kb"] + (c.get("response_size_kb") or 0)
        ax.scatter(total_comm, c["server_time_ms"], marker="*", s=200,
                   facecolors=scheme_color(s), edgecolors="black", linewidths=0.5, zorder=10)

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Total Online Communication (KB)")
    ax.set_ylabel("Server Computation (ms)")
    ax.set_title("Pareto Frontier — Communication vs Server Time")

    groups_shown = sorted(set(s["group"] for s in schemes))
    handles = [mpatches.Patch(color=GROUP_COLORS[g], label=f"Group {g}: {GROUP_NAMES[g]}")
               for g in GROUP_ORDER if g in groups_shown]
    handles.append(Line2D([0], [0], marker="*", color="gray", markerfacecolor="gray",
                          markersize=12, linestyle="None", label="Pareto optimal"))
    ax.legend(handles=handles, loc="upper left", fontsize=8)

    return save_fig_with_schemes(fig, "top_level", "T3_pareto_frontier.png", schemes)


def t4_heatmap_overview(data):
    """T4: Heatmap Overview Table of all schemes."""
    import pandas as pd

    # All schemes (including Group X)
    schemes = [s for s in data]
    schemes.sort(key=lambda s: (GROUP_ORDER.index(s["group"]), s.get("year", 9999)))

    columns = ["Query (KB)", "Response (KB)", "Server (ms)", "Throughput (GB/s)",
               "Client (ms)", "Offline (MB)", "Storage (MB)"]
    field_map = {
        "Query (KB)": "query_size_kb",
        "Response (KB)": "response_size_kb",
        "Server (ms)": "server_time_ms",
        "Throughput (GB/s)": "throughput_gbps",
        "Client (ms)": "client_time_ms",
        "Offline (MB)": "offline_hint_mb",
        "Storage (MB)": "client_storage_mb",
    }

    rows = []
    row_labels = []
    row_groups = []
    for s in schemes:
        c = s.get("concrete", {})
        row = []
        for col in columns:
            val = c.get(field_map[col]) if c else None
            row.append(val)
        rows.append(row)
        row_labels.append(s["display_name"])
        row_groups.append(s["group"])

    # Create figure
    n_rows = len(rows)
    n_cols = len(columns)
    fig_height = max(8, 0.4 * n_rows + 2)
    fig, ax = plt.subplots(figsize=(14, fig_height))
    ax.axis("off")

    # Build the table
    cell_text = []
    cell_colors = []

    # Compute per-column min/max for color scaling (excluding None)
    col_vals = {i: [] for i in range(n_cols)}
    for row in rows:
        for j, v in enumerate(row):
            if v is not None:
                col_vals[j].append(v)

    # For throughput, higher is better (green); for others, lower is better
    higher_is_better = {3}  # throughput column index

    for row_idx, row in enumerate(rows):
        text_row = []
        color_row = []
        for j, v in enumerate(row):
            if v is None:
                text_row.append("—")
                color_row.append("#e0e0e0")  # gray for missing
            else:
                # Format the number
                if v >= 1000:
                    text_row.append(f"{v:,.0f}")
                elif v >= 10:
                    text_row.append(f"{v:.1f}")
                elif v >= 0.1:
                    text_row.append(f"{v:.2f}")
                else:
                    text_row.append(f"{v:.3f}")

                # Color scale
                vals = col_vals[j]
                if len(vals) >= 2:
                    vmin, vmax = min(vals), max(vals)
                    if vmax > vmin:
                        # Use log scale for color mapping
                        import math
                        log_v = math.log10(v + 1e-10)
                        log_min = math.log10(vmin + 1e-10)
                        log_max = math.log10(vmax + 1e-10)
                        norm = (log_v - log_min) / (log_max - log_min)
                        norm = max(0, min(1, norm))
                        if j in higher_is_better:
                            norm = 1 - norm  # flip: high = good (green)
                        # Green (good) to Red (bad)
                        r = int(120 + norm * 135)
                        g = int(220 - norm * 100)
                        b = int(120 + norm * 20)
                        color_row.append(f"#{r:02x}{g:02x}{b:02x}")
                    else:
                        color_row.append("#d4edda")
                else:
                    color_row.append("#d4edda")
        cell_text.append(text_row)
        cell_colors.append(color_row)

    table = ax.table(
        cellText=cell_text,
        rowLabels=row_labels,
        colLabels=columns,
        cellColours=cell_colors,
        loc="center",
        cellLoc="center",
    )

    table.auto_set_font_size(False)
    table.set_fontsize(8)
    table.scale(1, 1.3)

    # Color row labels by group
    for i, g in enumerate(row_groups):
        cell = table[i + 1, -1]  # row label cell
        cell.set_text_props(color=GROUP_COLORS.get(g, "black"), fontweight="bold")

    ax.set_title("PIR Scheme Heatmap Overview (Green = Better, Gray = No Data)", fontsize=12, pad=20)

    return save_fig_with_schemes(fig, "top_level", "T4_heatmap_overview.png", schemes)


def t5_online_vs_offline(data):
    """T5: Online vs Offline Cost Split (stacked bars)."""
    schemes = []
    for s in data:
        c = s.get("concrete", {})
        if not c:
            continue
        has_online = c.get("query_size_kb") is not None or c.get("server_time_ms") is not None
        has_offline = c.get("offline_hint_mb") is not None
        if has_online and has_offline:
            schemes.append(s)

    if not schemes:
        print("  T5: No schemes with both online and offline data, skipping.")
        return None

    schemes.sort(key=lambda s: (GROUP_ORDER.index(s["group"]), s.get("year", 9999)))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, max(5, len(schemes) * 0.5)))

    labels = [s["display_name"] for s in schemes]
    y_pos = range(len(schemes))

    online_comm = []
    offline_comm = []
    for s in schemes:
        c = s["concrete"]
        q = c.get("query_size_kb") or 0
        r = c.get("response_size_kb") or 0
        online_comm.append((q + r) / 1024)
        offline_comm.append(c.get("offline_hint_mb") or 0)

    colors_dark = [GROUP_COLORS[s["group"]] for s in schemes]
    colors_light = [GROUP_COLORS[s["group"]] + "66" for s in schemes]

    ax1.barh(y_pos, online_comm, color=colors_dark, height=0.6, label="Online comm (MB)")
    ax1.barh(y_pos, offline_comm, left=online_comm, color=colors_light, height=0.6, label="Offline hint (MB)")
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(labels, fontsize=9)
    ax1.set_xlabel("Communication (MB)")
    ax1.set_title("Communication: Online vs Offline")
    ax1.set_xscale("log")
    ax1.legend(fontsize=8)
    ax1.invert_yaxis()

    online_comp = []
    offline_comp = []
    for s in schemes:
        c = s["concrete"]
        online_comp.append(c.get("server_time_ms") or 0)
        setup_s = c.get("setup_time_s")
        offline_comp.append(setup_s * 1000 if setup_s else 0)

    ax2.barh(y_pos, online_comp, color=colors_dark, height=0.6, label="Online server (ms)")
    ax2.barh(y_pos, offline_comp, left=online_comp, color=colors_light, height=0.6, label="Offline setup (ms)")
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels([], fontsize=9)
    ax2.set_xlabel("Computation (ms)")
    ax2.set_title("Computation: Online vs Offline")
    ax2.set_xscale("symlog", linthresh=1)
    ax2.legend(fontsize=8)
    ax2.invert_yaxis()

    fig.suptitle("Online vs Offline Cost Split", fontsize=13, y=1.02)
    fig.tight_layout()

    return save_fig_with_schemes(fig, "top_level", "T5_online_vs_offline.png", schemes)


def t6_timeline_scatter(data):
    """T6: Year vs Throughput evolution."""
    schemes = filter_concrete(data, ["throughput_gbps"])

    fig, ax = plt.subplots(figsize=(11, 7))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        year = s.get("year", 2020)
        tp = c["throughput_gbps"]

        total_comm = (c.get("query_size_kb") or 100) + (c.get("response_size_kb") or 100)
        size = max(30, min(300, 5000 / (total_comm + 1)))

        fill = scheme_marker_fill(s)
        alpha = scheme_edge_alpha(s)
        facecolor = scheme_color(s) if fill == "full" else "none"
        ax.scatter(year, tp, marker=scheme_marker(s), s=size,
                   facecolors=facecolor, edgecolors=scheme_color(s),
                   linewidths=1.5, zorder=5, alpha=alpha)
        points.append((year, tp, s["display_name"], s["id"]))

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_yscale("log")
    ax.set_xlabel("Publication Year")
    ax.set_ylabel("Throughput (GB/s)")
    ax.set_title("PIR Throughput Evolution Over Time")
    ax.xaxis.set_major_locator(mticker.MaxNLocator(integer=True))

    groups_shown = sorted(set(s["group"] for s in schemes))
    handles = [mpatches.Patch(color=GROUP_COLORS[g], label=f"Group {g}: {GROUP_NAMES[g]}")
               for g in GROUP_ORDER if g in groups_shown]
    handles.append(Line2D([0], [0], marker="o", color="gray", markerfacecolor="gray",
                          markersize=10, linestyle="None", label="Large = low comm"))
    handles.append(Line2D([0], [0], marker="o", color="gray", markerfacecolor="gray",
                          markersize=5, linestyle="None", label="Small = high comm"))
    ax.legend(handles=handles, loc="upper left", fontsize=8)

    return save_fig_with_schemes(fig, "top_level", "T6_timeline_scatter.png", schemes)


def generate_all_toplevel():
    """Generate all top-level plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating top-level plots...")
    results = {}
    results["T1"] = t1_communication_scatter(data)
    results["T2"] = t2_throughput_bar(data)
    results["T3"] = t3_pareto_frontier(data)
    results["T4"] = t4_heatmap_overview(data)
    t5_result = t5_online_vs_offline(data)
    if t5_result is not None:
        results["T5"] = t5_result
    results["T6"] = t6_timeline_scatter(data)
    print("Done with top-level plots.")
    return results


if __name__ == "__main__":
    generate_all_toplevel()
