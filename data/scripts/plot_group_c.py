"""
Group C (Client-Independent Preprocessing) plots: C1-C3.
"""

import numpy as np
import matplotlib.pyplot as plt

from plot_config import GROUP_COLORS, apply_style
from plot_utils import (
    load_data, get_schemes, filter_concrete,
    annotate_points_with_footnotes, save_fig_with_schemes,
    build_footnote_map,
)

GROUP = "C"
COLOR = GROUP_COLORS[GROUP]


def c1_online_throughput(data):
    """C1: Online Throughput Comparison bar chart."""
    schemes = filter_concrete(data, ["throughput_gbps"], group=GROUP)
    schemes.sort(key=lambda s: s["concrete"]["throughput_gbps"], reverse=True)

    fig, ax = plt.subplots(figsize=(9, 5))

    footnote_map = build_footnote_map(schemes)
    names = [f"{s['display_name']} $^{{{footnote_map.get(s['id'], '')}}}$" for s in schemes]
    values = [s["concrete"]["throughput_gbps"] for s in schemes]

    bars = ax.bar(range(len(schemes)), values, color=COLOR, width=0.6, edgecolor="white")

    for bar, v, s in zip(bars, values, schemes):
        c = s["concrete"]
        txt = f"{v:.1f} GB/s"
        if c.get("reference_db"):
            txt += f"\n({c['reference_db']})"
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.2,
                txt, ha="center", va="bottom", fontsize=8)

    ax.set_xticks(range(len(schemes)))
    ax.set_xticklabels(names, fontsize=10)
    ax.set_ylabel("Throughput (GB/s)")
    ax.set_title("Client-Independent Preprocessing — Online Throughput")

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_c", "C1_online_throughput.png", schemes)


def c2_hint_vs_online_comm(data):
    """C2: Offline Hint Size vs Online Communication scatter."""
    schemes = get_schemes(data, group=GROUP, max_tier=None)
    schemes = [s for s in schemes if
               s.get("group_specific", {}).get("offline_hint_mb") is not None and
               s.get("concrete", {}).get("query_size_kb") is not None]

    fig, ax = plt.subplots(figsize=(9, 7))

    footnote_map = build_footnote_map(schemes)
    points = []
    for s in schemes:
        c = s["concrete"]
        gs = s.get("group_specific", {})
        hint_mb = gs["offline_hint_mb"]
        online_kb = c["query_size_kb"] + (c.get("response_size_kb") or 0)
        ax.scatter(online_kb, hint_mb, color=COLOR, s=100, zorder=5,
                   edgecolors="white", linewidths=0.5)
        points.append((online_kb, hint_mb, s["display_name"], s["id"]))

    annotate_points_with_footnotes(ax, points, footnote_map)

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Total Online Communication (KB)")
    ax.set_ylabel("Offline Hint Size (MB)")
    ax.set_title("Hint Size vs Online Communication Tradeoff")

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_c", "C2_hint_vs_online_comm.png", schemes)


def c3_throughput_scaling(data):
    """C3: Throughput Scaling with DB Size (multi-point data from Respire)."""
    # Use Respire's multi-point data from group_specific
    respire = None
    for s in data:
        if s["id"] == "respire_2024":
            respire = s
            break

    # Also get SimplePIR/DoublePIR/IncrementalPIR single-point data
    group_c = get_schemes(data, group=GROUP, max_tier=1)
    throughput_schemes = [s for s in group_c if s.get("concrete", {}).get("throughput_gbps")]

    fig, ax = plt.subplots(figsize=(10, 6))

    # Plot Respire multi-point data
    if respire and respire.get("group_specific", {}).get("concrete_variants"):
        variants = respire["group_specific"]["concrete_variants"]
        db_sizes_mb = [256, 1024, 8192]  # from the data
        throughputs = [v["throughput_mbps"] / 1000 for v in variants]  # Convert to GB/s
        ax.plot(db_sizes_mb, throughputs, "o-", color=GROUP_COLORS["B"], markersize=8,
                label="Respire (Group B, multi-point)", linewidth=2)
        for db, tp in zip(db_sizes_mb, throughputs):
            ax.text(db, tp + 0.02, f"{tp:.3f}", ha="center", va="bottom", fontsize=8)

    # Plot single-point schemes
    for s in throughput_schemes:
        c = s["concrete"]
        # Estimate DB size from reference_db
        db_str = c.get("reference_db", "")
        db_mb = None
        if "1 GB" in db_str:
            db_mb = 1024
        elif "100 GB" in db_str:
            db_mb = 102400

        if db_mb:
            ax.scatter(db_mb, c["throughput_gbps"], color=COLOR, s=100, zorder=5,
                       edgecolors="black", linewidths=0.5)
            ax.text(db_mb, c["throughput_gbps"] * 1.05, s["display_name"],
                    ha="center", va="bottom", fontsize=9)

    ax.set_xscale("log")
    ax.set_xlabel("Database Size (MB)")
    ax.set_ylabel("Throughput (GB/s)")
    ax.set_title("Throughput Scaling with Database Size")
    ax.legend(fontsize=9)

    # Collect all schemes shown in this plot
    plotted_schemes = []
    if respire:
        plotted_schemes.append(respire)
    plotted_schemes.extend(throughput_schemes)

    fig.tight_layout()
    return save_fig_with_schemes(fig, "group_c", "C3_throughput_scaling.png", plotted_schemes)


def generate_group_c():
    """Generate all Group C plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating Group C plots...")
    results = {}
    results["C1"] = c1_online_throughput(data)
    results["C2"] = c2_hint_vs_online_comm(data)
    results["C3"] = c3_throughput_scaling(data)
    print("Done with Group C plots.")
    return results


if __name__ == "__main__":
    generate_group_c()
