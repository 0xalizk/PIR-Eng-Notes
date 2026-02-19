"""
Group X (Extensions) plots: X1.
Too few schemes for meaningful scatter plots — narrative comparison table only.
"""

import matplotlib.pyplot as plt

from plot_config import GROUP_COLORS, apply_style
from plot_utils import load_data, get_schemes, save_fig_with_schemes

GROUP = "X"
COLOR = GROUP_COLORS[GROUP]


def x1_narrative_table(data):
    """X1: Narrative Comparison Table for extension schemes."""
    schemes = get_schemes(data, group=GROUP)
    schemes.sort(key=lambda s: s.get("year", 9999))

    columns = ["Year", "Model", "Key Metric", "Value"]

    cell_text = []
    for s in schemes:
        c = s.get("concrete", {}) or {}
        gs = s.get("group_specific", {}) or {}

        if s["id"] == "keywordpir_2019":
            cell_text.append([
                str(s.get("year", "")),
                gs.get("pir_variant", "keyword"),
                "Total comm (optimized SealPIR)",
                f"{gs.get('total_comm_kb', '?')} KB",
            ])
            cell_text.append([
                "",
                "",
                "Server cost",
                f"${gs.get('server_cost_cents', 0) / 100:.6f}",
            ])
        elif s["id"] == "distributionalpir_2025":
            cell_text.append([
                str(s.get("year", "")),
                gs.get("pir_variant", "distributional"),
                "Per-request cost (CrowdSurf)",
                f"${gs.get('per_request_cost', '?')}",
            ])
            cell_text.append([
                "",
                "",
                "Speedup over baseline",
                gs.get("speedup_over_baseline", "—"),
            ])
            cell_text.append([
                "",
                "",
                "Client hint storage",
                f"{c.get('offline_hint_mb', '?')} MB",
            ])

    row_labels = []
    label_idx = 0
    for i, row in enumerate(cell_text):
        if row[0]:  # Non-empty year = new scheme
            row_labels.append(schemes[label_idx]["display_name"])
            label_idx = min(label_idx + 1, len(schemes) - 1)
        else:
            row_labels.append("")

    fig_height = max(3, len(cell_text) * 0.5 + 2)
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
    table.scale(1, 1.5)

    ax.set_title("Extensions — Narrative Comparison", fontsize=12, pad=20)

    return save_fig_with_schemes(fig, "group_x", "X1_narrative_table.png", schemes)


def generate_group_x():
    """Generate all Group X plots. Returns dict of {plot_id: (path, schemes)}."""
    apply_style()
    data = load_data()

    print("Generating Group X plots...")
    results = {}
    results["X1"] = x1_narrative_table(data)
    print("Done with Group X plots.")
    return results


if __name__ == "__main__":
    generate_group_x()
