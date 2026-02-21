"""
Shared configuration for PIR visualization plots.
Colors, markers, font sizes, group names, and style settings.
"""

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — no GUI windows
import matplotlib.pyplot as plt
import matplotlib as mpl

# --- Group Definitions ---
GROUP_COLORS = {
    "A": "#1f77b4",  # Blue  - FHE-Based
    "B": "#2ca02c",  # Green - Stateless
    "C": "#ff7f0e",  # Orange - Client-Indep. Preprocessing
    "D": "#d62728",  # Red   - Client-Dep. Preprocessing
    "X": "#7f7f7f",  # Gray  - Extensions
}

GROUP_NAMES = {
    "A": "FHE-Based",
    "B": "Stateless",
    "C": "Client-Indep. Preproc.",
    "D": "Client-Dep. Preproc.",
    "X": "Extensions",
}

GROUP_ORDER = ["A", "B", "C", "D", "X"]

# --- Data Tier Visual Encoding ---
# Tier 1: exact paper-reported benchmarks → filled markers
# Tier 2: approximate values → open markers
# Tier 3: estimated from asymptotic/analytical models → open square, dimmer
TIER_MARKERS = {
    1: "o",   # filled circle
    2: "D",   # diamond (open)
    3: "s",   # square (open, dimmer)
}

TIER_MARKER_FILL = {
    1: "full",
    2: "none",
    3: "none",
}

TIER_EDGE_ALPHA = {
    1: 1.0,
    2: 1.0,
    3: 0.55,
}

# --- Group Directory Names (for notes file path resolution) ---
GROUP_DIR_NAMES = {
    "A": "FHE Based PIR",
    "B": "Stateless Single Server PIR",
    "C": "Client Independent Preprocessing",
    "D": "Client Dependent Preprocessing",
    "X": "Extensions",
}

# --- Font Sizes ---
TITLE_SIZE = 14
AXIS_LABEL_SIZE = 12
TICK_SIZE = 10
LEGEND_SIZE = 9
ANNOTATION_SIZE = 7.5

# --- Figure Defaults ---
DEFAULT_FIG_SIZE = (10, 7)
DEFAULT_DPI = 150
SAVE_DPI = 200

# --- Reference Line Styles ---
REF_LINE_COLOR = "#cccccc"
REF_LINE_ALPHA = 0.5
REF_LINE_STYLE = "--"

# --- Pareto Frontier ---
PARETO_COLOR = "#333333"
PARETO_ALPHA = 0.4
PARETO_LINE_WIDTH = 1.5


# --- Heatmap Color Config ---
HEATMAP_GOOD = "#27ae60"    # green
HEATMAP_MID = "#f9e79f"     # yellow
HEATMAP_BAD = "#c0392b"     # red
HEATMAP_MISSING = "#f5f5f5" # light gray

TIER_BADGE = {1: "", 2: "\u2020", 3: "*"}  # †, *


def rank_color(rank_norm):
    """Map a normalized rank [0=best, 1=worst] to a green→yellow→red color.

    Uses a 3-stop linear interpolation for perceptual uniformity.

    Args:
        rank_norm: float in [0, 1] where 0=best and 1=worst
    Returns:
        hex color string
    """
    rank_norm = max(0.0, min(1.0, rank_norm))
    # Three stops: green(0) → yellow(0.5) → red(1)
    if rank_norm <= 0.5:
        t = rank_norm / 0.5
        r = int(39 + t * (249 - 39))     # 27ae60 → f9e79f
        g = int(174 + t * (231 - 174))
        b = int(96 + t * (159 - 96))
    else:
        t = (rank_norm - 0.5) / 0.5
        r = int(249 + t * (192 - 249))   # f9e79f → c0392b
        g = int(231 + t * (57 - 231))
        b = int(159 + t * (43 - 159))
    return f"#{r:02x}{g:02x}{b:02x}"


def apply_style():
    """Apply consistent matplotlib style across all plots."""
    plt.style.use("seaborn-v0_8-whitegrid")
    mpl.rcParams.update({
        "font.size": TICK_SIZE,
        "axes.titlesize": TITLE_SIZE,
        "axes.labelsize": AXIS_LABEL_SIZE,
        "legend.fontsize": LEGEND_SIZE,
        "figure.figsize": DEFAULT_FIG_SIZE,
        "figure.dpi": DEFAULT_DPI,
        "savefig.dpi": SAVE_DPI,
        "savefig.bbox": "tight",
        "axes.grid": True,
        "grid.alpha": 0.3,
    })
