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
    TIER_BADGE, TIER_EDGE_ALPHA,
    HEATMAP_MISSING, rank_color,
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


def _heatmap_data(data):
    """Extract shared heatmap data structures used by T4a-T4d.

    Returns:
        (schemes, columns, field_map, rows, row_tiers)
        where rows is list of dicts mapping column→value (or None).
    """
    schemes = sorted(data, key=lambda s: (GROUP_ORDER.index(s["group"]), s.get("year", 9999)))
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
    higher_is_better = {"Throughput (GB/s)"}

    rows = []
    row_tiers = []
    for s in schemes:
        c = s.get("concrete", {}) or {}
        row = {}
        for col in columns:
            row[col] = c.get(field_map[col])
        rows.append(row)
        row_tiers.append(s.get("data_tier", 1))

    # Compute per-column percentile ranks (0=best, 1=worst)
    col_ranks = {col: {} for col in columns}
    for col in columns:
        vals = [(i, rows[i][col]) for i in range(len(rows)) if rows[i][col] is not None]
        if len(vals) < 2:
            for i, _ in vals:
                col_ranks[col][i] = 0.0
            continue
        reverse = col in higher_is_better  # higher throughput = better = rank 0
        sorted_vals = sorted(vals, key=lambda x: x[1], reverse=reverse)
        n = len(sorted_vals)
        for rank_idx, (i, _) in enumerate(sorted_vals):
            col_ranks[col][i] = rank_idx / (n - 1)

    return schemes, columns, field_map, rows, row_tiers, col_ranks, higher_is_better


def _fmt_val(v):
    """Format a numeric value for heatmap display."""
    if v is None:
        return "—"
    if v >= 1000:
        return f"{v:,.0f}"
    elif v >= 10:
        return f"{v:.1f}"
    elif v >= 0.1:
        return f"{v:.2f}"
    else:
        return f"{v:.3f}"


def t4a_heatmap_enhanced(data):
    """T4a: Enhanced static heatmap with group bands, rank coloring, tier badges."""
    from matplotlib.patches import FancyBboxPatch
    from matplotlib.colors import to_rgba

    schemes, columns, field_map, rows, row_tiers, col_ranks, higher_is_better = _heatmap_data(data)

    n_schemes = len(schemes)
    n_cols = len(columns)

    # Layout constants
    row_h = 0.45
    header_h = 0.6
    col_w = 1.6
    name_col_w = 3.2
    margin_strip_w = 0.08
    total_w = name_col_w + n_cols * col_w + 0.5

    # Compute groups for header rows
    groups_in_order = []
    group_start = {}
    group_end = {}
    for i, s in enumerate(schemes):
        g = s["group"]
        if g not in group_start:
            groups_in_order.append(g)
            group_start[g] = i
        group_end[g] = i

    # Total rows = scheme rows + group header rows + column header
    n_group_headers = len(groups_in_order)
    total_rows = n_schemes + n_group_headers + 1  # +1 for column header
    fig_h = total_rows * row_h + 3.5  # extra for legend/colorbar

    fig, ax = plt.subplots(figsize=(total_w, fig_h))
    ax.set_xlim(0, total_w)
    ax.set_ylim(0, total_rows * row_h + 2.5)
    ax.axis("off")
    ax.invert_yaxis()

    # Starting y position
    y = 0.0

    # Column header row
    ax.add_patch(FancyBboxPatch((name_col_w, y), n_cols * col_w, row_h,
                                boxstyle="square,pad=0", fc="#2c3e50", ec="none"))
    ax.add_patch(FancyBboxPatch((0, y), name_col_w, row_h,
                                boxstyle="square,pad=0", fc="#2c3e50", ec="none"))
    ax.text(name_col_w / 2, y + row_h / 2, "Scheme", ha="center", va="center",
            fontsize=9, fontweight="bold", color="white")
    for j, col in enumerate(columns):
        cx = name_col_w + j * col_w + col_w / 2
        ax.text(cx, y + row_h / 2, col, ha="center", va="center",
                fontsize=8, fontweight="bold", color="white")
    y += row_h

    # Data rows with group headers
    scheme_idx = 0
    for g in groups_in_order:
        # Group header band
        gc = GROUP_COLORS[g]
        bg_rgba = to_rgba(gc, alpha=0.15)
        ax.add_patch(FancyBboxPatch((0, y), total_w - 0.5, header_h,
                                    boxstyle="square,pad=0", fc=bg_rgba, ec="none"))
        ax.text(name_col_w / 2, y + header_h / 2,
                f"Group {g} — {GROUP_NAMES[g]}",
                ha="center", va="center", fontsize=9.5, fontweight="bold", color=gc)
        # Separator line above group header (except first)
        if g != groups_in_order[0]:
            ax.plot([0, total_w - 0.5], [y, y], color="#bdc3c7", linewidth=2, zorder=3)
        y += header_h

        # Scheme rows in this group
        start_i = group_start[g]
        end_i = group_end[g]
        for i in range(start_i, end_i + 1):
            s = schemes[i]
            row = rows[i]
            tier = row_tiers[i]

            # Alternating row background
            row_bg = "#ffffff" if (i - start_i) % 2 == 0 else "#f8f9fa"
            ax.add_patch(FancyBboxPatch((0, y), total_w - 0.5, row_h,
                                        boxstyle="square,pad=0", fc=row_bg, ec="none"))

            # Left margin strip (group color)
            ax.add_patch(FancyBboxPatch((0, y), margin_strip_w, row_h,
                                        boxstyle="square,pad=0", fc=gc, ec="none"))

            # Scheme name
            ax.text(margin_strip_w + 0.15, y + row_h / 2, s["display_name"],
                    ha="left", va="center", fontsize=8.5, color="#2c3e50")

            # Metric cells
            for j, col in enumerate(columns):
                cx = name_col_w + j * col_w
                v = row[col]
                if v is None:
                    # Missing cell
                    ax.add_patch(FancyBboxPatch((cx, y), col_w, row_h,
                                                boxstyle="square,pad=0",
                                                fc=HEATMAP_MISSING, ec="#eeeeee", linewidth=0.5))
                    ax.text(cx + col_w / 2, y + row_h / 2, "—",
                            ha="center", va="center", fontsize=8, color="#bdc3c7")
                else:
                    # Rank-colored cell
                    rn = col_ranks[col].get(i, 0.5)
                    cell_color = rank_color(rn)
                    cell_rgba = to_rgba(cell_color, alpha=0.6)
                    ax.add_patch(FancyBboxPatch((cx, y), col_w, row_h,
                                                boxstyle="square,pad=0",
                                                fc=cell_rgba, ec="#eeeeee", linewidth=0.5))
                    badge = TIER_BADGE.get(tier, "")
                    ax.text(cx + col_w / 2, y + row_h / 2,
                            f"{_fmt_val(v)}{badge}",
                            ha="center", va="center", fontsize=8,
                            fontfamily="monospace", color="#2c3e50")
            y += row_h

    # Color bar below table
    bar_y = y + 0.6
    bar_x = name_col_w
    bar_w = n_cols * col_w
    bar_h = 0.25
    n_segments = 100
    seg_w = bar_w / n_segments
    for k in range(n_segments):
        c = rank_color(k / (n_segments - 1))
        ax.add_patch(FancyBboxPatch((bar_x + k * seg_w, bar_y), seg_w, bar_h,
                                    boxstyle="square,pad=0", fc=c, ec="none"))
    ax.text(bar_x - 0.1, bar_y + bar_h / 2, "Best Rank", ha="right", va="center", fontsize=7.5)
    ax.text(bar_x + bar_w + 0.1, bar_y + bar_h / 2, "Worst Rank", ha="left", va="center", fontsize=7.5)

    # Legend row
    legend_y = bar_y + bar_h + 0.5
    # Tier badges
    ax.text(bar_x, legend_y, "\u2020 Approximate     * Estimated",
            fontsize=8, color="#555555", va="top")
    # Group color swatches
    swatch_x = bar_x + bar_w * 0.55
    for gi, g in enumerate(GROUP_ORDER):
        sx = swatch_x + gi * 2.2
        ax.add_patch(FancyBboxPatch((sx, legend_y - 0.05), 0.25, 0.25,
                                    boxstyle="square,pad=0", fc=GROUP_COLORS[g], ec="none"))
        ax.text(sx + 0.35, legend_y + 0.07, f"{g}: {GROUP_NAMES[g]}",
                fontsize=6.5, va="center", color="#333333")

    ax.set_title("PIR Scheme Heatmap — Enhanced Overview", fontsize=13, pad=15, fontweight="bold")
    fig.tight_layout()

    return save_fig_with_schemes(fig, "top_level", "T4a_heatmap_enhanced.png", schemes)


def t4b_heatmap_interactive(data):
    """T4b: Interactive Plotly heatmap with hover/sort. Returns (path, schemes) or None."""
    try:
        import plotly.graph_objects as go
    except ImportError:
        print("  T4b: plotly not installed, skipping interactive heatmap.")
        return None

    from plot_utils import ensure_output_dir

    schemes, columns, field_map, rows, row_tiers, col_ranks, higher_is_better = _heatmap_data(data)

    # Build matrices for heatmap
    n = len(schemes)
    z_matrix = []    # rank-normalized values for color
    text_matrix = [] # display text
    hover_matrix = []

    for i in range(n):
        z_row = []
        text_row = []
        hover_row = []
        s = schemes[i]
        tier = row_tiers[i]
        badge = TIER_BADGE.get(tier, "")
        tier_label = {1: "Exact", 2: "Approximate", 3: "Estimated"}.get(tier, "Unknown")
        for j, col in enumerate(columns):
            v = rows[i][col]
            if v is None:
                z_row.append(float("nan"))
                text_row.append("—")
                hover_row.append(f"<b>{s['display_name']}</b><br>{col}: N/A<br>Tier: {tier_label}")
            else:
                rn = col_ranks[col].get(i, 0.5)
                z_row.append(rn)
                text_row.append(f"{_fmt_val(v)}{badge}")
                rank_pos = int(rn * (n - 1)) + 1
                hover_row.append(
                    f"<b>{s['display_name']}</b><br>"
                    f"{col}: {_fmt_val(v)}<br>"
                    f"Rank: {rank_pos}/{n}<br>"
                    f"Tier: {tier_label}<br>"
                    f"Group {s['group']}: {GROUP_NAMES[s['group']]}"
                )
        z_matrix.append(z_row)
        text_matrix.append(text_row)
        hover_matrix.append(hover_row)

    # Y-axis labels with group color via HTML
    y_labels = []
    for s in schemes:
        gc = GROUP_COLORS[s["group"]]
        y_labels.append(f"<span style='color:{gc}'>{s['display_name']}</span>")

    # Custom RdYlGn-like colorscale
    colorscale = [
        [0.0, "#27ae60"],
        [0.5, "#f9e79f"],
        [1.0, "#c0392b"],
    ]

    fig = go.Figure(data=go.Heatmap(
        z=z_matrix,
        x=columns,
        y=y_labels,
        text=text_matrix,
        texttemplate="%{text}",
        textfont={"size": 10},
        hovertext=hover_matrix,
        hoverinfo="text",
        colorscale=colorscale,
        zmin=0, zmax=1,
        colorbar=dict(
            title="Rank",
            tickvals=[0, 0.5, 1],
            ticktext=["Best", "Mid", "Worst"],
            len=0.5,
        ),
        xgap=2, ygap=2,
    ))

    # Add group separator lines
    prev_group = None
    for i, s in enumerate(schemes):
        if prev_group is not None and s["group"] != prev_group:
            fig.add_hline(y=i - 0.5, line_width=3, line_color="black", opacity=0.3)
        prev_group = s["group"]

    fig.update_layout(
        title="PIR Scheme Heatmap — Interactive Overview",
        xaxis=dict(side="top", tickfont=dict(size=11)),
        yaxis=dict(autorange="reversed", tickfont=dict(size=10)),
        width=900,
        height=max(600, len(schemes) * 22 + 150),
        margin=dict(l=180, r=60, t=80, b=40),
    )

    out_dir = ensure_output_dir("top_level")
    out_path = out_dir / "T4b_heatmap_interactive.html"
    fig.write_html(str(out_path), include_plotlyjs="cdn")
    print(f"  Saved: {out_path}")

    return (out_path, schemes)


def t4c_ranked_bars(data):
    """T4c: Small multiples — 7 ranked horizontal bar charts."""
    schemes, columns, field_map, rows, row_tiers, col_ranks, higher_is_better = _heatmap_data(data)

    fig, axes = plt.subplots(2, 4, figsize=(20, 14))
    axes_flat = axes.flatten()

    for panel_idx, col in enumerate(columns):
        ax = axes_flat[panel_idx]

        # Get schemes with data for this column, sorted by value (best at top)
        entries = []
        for i, s in enumerate(schemes):
            v = rows[i][col]
            if v is not None:
                entries.append((i, s, v))

        # Sort: for throughput higher=better (descending), others lower=better (ascending)
        reverse = col in higher_is_better
        entries.sort(key=lambda e: e[2], reverse=reverse)

        names = [e[1]["display_name"] for e in entries]
        values = [e[2] for e in entries]
        colors = [GROUP_COLORS[e[1]["group"]] for e in entries]
        alphas = [TIER_EDGE_ALPHA.get(e[1].get("data_tier", 1), 1.0) for e in entries]

        y_pos = range(len(entries))
        bars = ax.barh(y_pos, values, color=colors, height=0.7, edgecolor="white", linewidth=0.3)

        # Apply tier alpha
        for bar, alpha in zip(bars, alphas):
            bar.set_alpha(alpha)

        # Value labels
        for bi, (bar, entry) in enumerate(zip(bars, entries)):
            ax.text(bar.get_width() * 1.02 if bar.get_width() > 0 else 0.001,
                    bar.get_y() + bar.get_height() / 2,
                    _fmt_val(entry[2]), va="center", fontsize=6.5, color="#333333")

        ax.set_yticks(y_pos)
        ax.set_yticklabels(names, fontsize=7)
        ax.set_title(col, fontsize=10, fontweight="bold")

        # Use log scale if range > 100x
        if values:
            vmin = min(v for v in values if v > 0) if any(v > 0 for v in values) else 1
            vmax = max(values)
            if vmax / max(vmin, 1e-10) > 100:
                ax.set_xscale("log")

        ax.tick_params(axis="x", labelsize=7)

    # Legend in the 8th panel
    ax_legend = axes_flat[7]
    ax_legend.axis("off")

    # Group color swatches
    y_start = 0.9
    for gi, g in enumerate(GROUP_ORDER):
        ax_legend.add_patch(mpatches.FancyBboxPatch(
            (0.05, y_start - gi * 0.12), 0.08, 0.06,
            boxstyle="square,pad=0", fc=GROUP_COLORS[g],
            transform=ax_legend.transAxes, clip_on=False))
        ax_legend.text(0.18, y_start - gi * 0.12 + 0.03,
                       f"Group {g}: {GROUP_NAMES[g]}",
                       transform=ax_legend.transAxes, fontsize=8, va="center")

    # Tier alpha legend
    tier_y = y_start - len(GROUP_ORDER) * 0.12 - 0.1
    for tier, label in [(1, "Tier 1: Exact"), (2, "Tier 2: Approximate"), (3, "Tier 3: Estimated")]:
        alpha = TIER_EDGE_ALPHA[tier]
        ax_legend.add_patch(mpatches.FancyBboxPatch(
            (0.05, tier_y), 0.08, 0.06,
            boxstyle="square,pad=0", fc="#888888", alpha=alpha,
            transform=ax_legend.transAxes, clip_on=False))
        ax_legend.text(0.18, tier_y + 0.03, label,
                       transform=ax_legend.transAxes, fontsize=8, va="center")
        tier_y -= 0.12

    ax_legend.text(0.05, tier_y - 0.05,
                   "Schemes with missing data\nomitted from each panel.",
                   transform=ax_legend.transAxes, fontsize=7.5, va="top", color="#666666",
                   style="italic")

    fig.suptitle("PIR Scheme Rankings by Metric", fontsize=14, fontweight="bold", y=0.98)
    fig.tight_layout(rect=[0, 0, 1, 0.96])

    return save_fig_with_schemes(fig, "top_level", "T4c_ranked_bars.png", schemes)


def t4d_parallel_coordinates(data):
    """T4d: Plotly parallel coordinates plot. Returns (path, schemes) or None."""
    try:
        import plotly.graph_objects as go
    except ImportError:
        print("  T4d: plotly not installed, skipping parallel coordinates.")
        return None

    from plot_utils import ensure_output_dir, get_schemes

    # Filter to tiers 1+2 only
    filtered = get_schemes(data, max_tier=2)
    schemes, columns, field_map, rows, row_tiers, col_ranks, higher_is_better = _heatmap_data(filtered)

    if len(schemes) < 3:
        print("  T4d: Too few tier 1+2 schemes, skipping parallel coordinates.")
        return None

    # Build group index for color
    group_to_idx = {g: i for i, g in enumerate(GROUP_ORDER)}
    group_indices = [group_to_idx.get(s["group"], 0) for s in schemes]

    # Build dimensions — one per metric, using percentile ranks
    dimensions = []
    for col in columns:
        vals = []
        for i in range(len(schemes)):
            rn = col_ranks[col].get(i, 0.5)
            vals.append(rn)
        dimensions.append(dict(
            range=[0, 1],
            label=col,
            values=vals,
            tickvals=[0, 0.5, 1],
            ticktext=["Best", "Mid", "Worst"],
        ))

    # Plotly colorscale matching GROUP_COLORS
    group_colorscale = []
    n_groups = len(GROUP_ORDER)
    for i, g in enumerate(GROUP_ORDER):
        pos = i / max(n_groups - 1, 1)
        group_colorscale.append([pos, GROUP_COLORS[g]])

    fig = go.Figure(data=go.Parcoords(
        line=dict(
            color=group_indices,
            colorscale=group_colorscale,
            cmin=0,
            cmax=n_groups - 1,
            showscale=False,
        ),
        dimensions=dimensions,
        labelfont=dict(size=11),
        tickfont=dict(size=9),
    ))

    # Build custom legend text
    legend_parts = [f"<b>Group Colors:</b>"]
    for g in GROUP_ORDER:
        gc = GROUP_COLORS[g]
        legend_parts.append(
            f'<span style="color:{gc}">■</span> Group {g}: {GROUP_NAMES[g]}'
        )
    legend_parts.append(f"<br><b>Schemes ({len(schemes)}, Tiers 1-2 only):</b>")
    for s in schemes:
        gc = GROUP_COLORS[s["group"]]
        legend_parts.append(f'<span style="color:{gc}">—</span> {s["display_name"]}')

    fig.update_layout(
        title="PIR Scheme Parallel Coordinates — Percentile Ranks (Lower = Better)",
        width=1000,
        height=650,
        margin=dict(l=80, r=80, t=80, b=40),
        annotations=[dict(
            text="<br>".join(legend_parts),
            xref="paper", yref="paper",
            x=1.02, y=0.5, xanchor="left", yanchor="middle",
            showarrow=False,
            font=dict(size=9),
            align="left",
        )],
    )

    out_dir = ensure_output_dir("top_level")
    out_path = out_dir / "T4d_parallel_coordinates.html"
    fig.write_html(str(out_path), include_plotlyjs="cdn")
    print(f"  Saved: {out_path}")

    return (out_path, schemes)


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
    results["T4a"] = t4a_heatmap_enhanced(data)
    t4b = t4b_heatmap_interactive(data)
    if t4b is not None:
        results["T4b"] = t4b
    results["T4c"] = t4c_ranked_bars(data)
    t4d = t4d_parallel_coordinates(data)
    if t4d is not None:
        results["T4d"] = t4d
    t5_result = t5_online_vs_offline(data)
    if t5_result is not None:
        results["T5"] = t5_result
    results["T6"] = t6_timeline_scatter(data)
    print("Done with top-level plots.")
    return results


if __name__ == "__main__":
    generate_all_toplevel()
