"""
Shared plotting utilities for PIR visualization.
"""

import json
import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.lines import Line2D
from pathlib import Path

from plot_config import (
    GROUP_COLORS, GROUP_NAMES, GROUP_ORDER, GROUP_DIR_NAMES,
    TIER_MARKERS, TIER_MARKER_FILL, TIER_EDGE_ALPHA,
    ANNOTATION_SIZE, PARETO_COLOR, PARETO_ALPHA, PARETO_LINE_WIDTH,
    apply_style,
)

# Resolve paths relative to this script
SCRIPT_DIR = Path(__file__).parent
DATA_FILE = SCRIPT_DIR.parent / "pir_data.json"
OUTPUT_DIR = SCRIPT_DIR.parent / "output"


def load_data(path=None):
    """Load the master PIR data JSON file."""
    p = Path(path) if path else DATA_FILE
    with open(p) as f:
        return json.load(f)


def get_schemes(data, group=None, max_tier=None, require_fields=None):
    """Filter schemes by group, data tier, and required concrete fields.

    Args:
        data: list of scheme dicts
        group: filter to single group letter (e.g. "A"), or None for all
        max_tier: include schemes with data_tier <= max_tier (e.g. 2 = tiers 1+2)
        require_fields: list of concrete field names that must be non-null
    Returns:
        filtered list of scheme dicts
    """
    out = []
    for s in data:
        if group and s["group"] != group:
            continue
        if max_tier is not None and s.get("data_tier", 3) > max_tier:
            continue
        if require_fields:
            concrete = s.get("concrete", {})
            if not concrete:
                continue
            if any(concrete.get(f) is None for f in require_fields):
                continue
        out.append(s)
    return out


def filter_concrete(data, fields, group=None):
    """Get schemes with concrete data for given fields. Shorthand for get_schemes."""
    return get_schemes(data, group=group, max_tier=None, require_fields=fields)


def scheme_color(scheme):
    """Get the color for a scheme based on its group."""
    return GROUP_COLORS.get(scheme["group"], "#7f7f7f")


def scheme_marker(scheme):
    """Get the marker style for a scheme based on its data tier."""
    tier = scheme.get("data_tier", 1)
    return TIER_MARKERS.get(tier, "o")


def scheme_marker_fill(scheme):
    """Get marker fill style based on data tier."""
    tier = scheme.get("data_tier", 1)
    return TIER_MARKER_FILL.get(tier, "full")


def scheme_edge_alpha(scheme):
    """Get marker edge alpha based on data tier."""
    tier = scheme.get("data_tier", 1)
    return TIER_EDGE_ALPHA.get(tier, 1.0)


def plot_scheme_point(ax, x, y, scheme, size=60, zorder=5, **kwargs):
    """Plot a single scheme point with correct color/marker/fill."""
    fill = scheme_marker_fill(scheme)
    color = scheme_color(scheme)
    alpha = scheme_edge_alpha(scheme)
    facecolor = color if fill == "full" else "none"
    edgecolor = color
    ax.scatter(
        x, y,
        marker=scheme_marker(scheme),
        s=size,
        facecolors=facecolor,
        edgecolors=edgecolor,
        linewidths=1.5,
        zorder=zorder,
        alpha=alpha,
        **kwargs,
    )


def annotate_points(ax, points, fontsize=None):
    """Add labels to scatter points with simple offset.

    Args:
        ax: matplotlib axes
        points: list of (x, y, label) tuples
        fontsize: annotation font size
    """
    if fontsize is None:
        fontsize = ANNOTATION_SIZE

    for x, y, label in points:
        ax.annotate(
            label, (x, y),
            textcoords="offset points",
            xytext=(6, 4),
            fontsize=fontsize,
            alpha=0.85,
        )


def add_pareto_frontier(ax, xs, ys, labels=None, minimize_x=True, minimize_y=True):
    """Draw Pareto frontier on scatter plot. Returns indices of Pareto-optimal points.

    Points on the frontier are those not dominated by any other point.
    Default: minimize both axes (lower-left = better).
    """
    points = list(zip(xs, ys, range(len(xs))))
    # Sort by x
    points.sort(key=lambda p: p[0] if minimize_x else -p[0])

    frontier_indices = []
    best_y = float("inf") if minimize_y else float("-inf")

    for x, y, idx in points:
        if minimize_y and y <= best_y:
            frontier_indices.append(idx)
            best_y = y
        elif not minimize_y and y >= best_y:
            frontier_indices.append(idx)
            best_y = y

    if len(frontier_indices) >= 2:
        fx = [xs[i] for i in frontier_indices]
        fy = [ys[i] for i in frontier_indices]
        ax.plot(fx, fy, color=PARETO_COLOR, alpha=PARETO_ALPHA,
                linewidth=PARETO_LINE_WIDTH, linestyle="-", zorder=2)

    return frontier_indices


def make_group_legend(ax, groups_shown=None, loc="upper right", **kwargs):
    """Add a group color legend to axes."""
    if groups_shown is None:
        groups_shown = GROUP_ORDER
    handles = []
    for g in groups_shown:
        if g in GROUP_COLORS:
            handles.append(mpatches.Patch(color=GROUP_COLORS[g], label=f"Group {g}: {GROUP_NAMES[g]}"))
    ax.legend(handles=handles, loc=loc, **kwargs)


def make_tier_legend_handles():
    """Create legend handles showing tier 1 (filled), tier 2 (open), tier 3 (estimated)."""
    h1 = Line2D([0], [0], marker="o", color="gray", markerfacecolor="gray",
                markersize=8, linestyle="None", label="Tier 1: Exact benchmarks")
    h2 = Line2D([0], [0], marker="D", color="gray", markerfacecolor="none",
                markersize=8, linestyle="None", label="Tier 2: Approximate")
    h3 = Line2D([0], [0], marker="s", color="gray", markerfacecolor="none",
                markersize=8, linestyle="None", alpha=0.55, label="Tier 3: Estimated")
    return [h1, h2, h3]


def ensure_output_dir(subdir):
    """Create output subdirectory if it doesn't exist. Returns Path."""
    d = OUTPUT_DIR / subdir
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_fig(fig, subdir, filename):
    """Save figure to the correct output subdirectory."""
    d = ensure_output_dir(subdir)
    path = d / filename
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)
    print(f"  Saved: {path}")
    return path


def build_footnote_map(schemes):
    """Build a mapping from scheme id to sequential footnote number.

    Args:
        schemes: list of scheme dicts (in plot order)
    Returns:
        dict mapping scheme_id → footnote number string ("1", "2", ...)
    """
    footnote_map = {}
    for i, s in enumerate(schemes, start=1):
        footnote_map[s["id"]] = str(i)
    return footnote_map


def annotate_points_with_footnotes(ax, points, footnote_map, fontsize=None):
    """Add labels with footnote superscripts to scatter points.

    Args:
        ax: matplotlib axes
        points: list of (x, y, label, scheme_id) tuples
        footnote_map: dict from scheme_id to footnote number string
        fontsize: annotation font size
    """
    if fontsize is None:
        fontsize = ANNOTATION_SIZE

    for item in points:
        x, y, label, scheme_id = item
        fn = footnote_map.get(scheme_id, "")
        display = f"{label} $^{{{fn}}}$" if fn else label
        ax.annotate(
            display, (x, y),
            textcoords="offset points",
            xytext=(6, 4),
            fontsize=fontsize,
            alpha=0.85,
        )


def get_notes_path(scheme):
    """Resolve the notes file path for a scheme.

    Returns:
        Path object to the notes file, or None if not found.
    """
    schemes_dir = SCRIPT_DIR.parent.parent / "Schemes"
    group = scheme["group"]
    group_dir_name = GROUP_DIR_NAMES.get(group, "")
    group_dir = schemes_dir / f"Group {group} - {group_dir_name}"

    scheme_id = scheme["id"]

    # Try direct directory match first (e.g. sealpir_2018/sealpir_2018_notes.md)
    matches = list(group_dir.glob(f"{scheme_id}/*_notes.md"))
    if matches:
        return matches[0]

    # Try matching by directory name containing the full scheme_id
    name_part = scheme_id.rsplit("_", 1)[0]  # e.g. "simplepir" from "simplepir_2022"
    all_notes = sorted(group_dir.glob("**/*_notes.md"))

    # First pass: exact directory name match with scheme_id
    for m in all_notes:
        if scheme_id in m.parent.name:
            return m

    # Second pass: look for shared files (e.g. simplepir_doublepir_2022)
    for m in all_notes:
        dir_name = m.parent.name
        # Check if the name_part appears as a word boundary in the directory name
        # e.g. "simplepir" in "simplepir_doublepir_2022" but not in "verisimplepir_2024"
        parts = dir_name.split("_")
        if name_part in parts:
            return m

    # Third pass: broader substring match
    for m in all_notes:
        if name_part in m.parent.name or name_part in m.name:
            return m

    return None


def save_fig_with_schemes(fig, subdir, filename, schemes):
    """Save figure and return (path, schemes_list) for README generation.

    Args:
        fig: matplotlib figure
        subdir: output subdirectory name
        filename: output filename
        schemes: list of scheme dicts that appear in this plot
    Returns:
        tuple of (Path, list of scheme dicts)
    """
    path = save_fig(fig, subdir, filename)
    return (path, schemes)
