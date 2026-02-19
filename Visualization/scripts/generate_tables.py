"""
Generate markdown summary tables from pir_data.json.
"""

from pathlib import Path
from plot_config import GROUP_NAMES, GROUP_ORDER
from plot_utils import load_data, ensure_output_dir


def fmt(val, suffix=""):
    """Format a value for table display."""
    if val is None:
        return "—"
    if isinstance(val, float):
        if val >= 1000:
            return f"{val:,.0f}{suffix}"
        elif val >= 10:
            return f"{val:.1f}{suffix}"
        elif val >= 0.1:
            return f"{val:.2f}{suffix}"
        else:
            return f"{val:.3f}{suffix}"
    return str(val) + suffix


def generate_summary_all(data):
    """Generate summary_all.md — all 35 schemes in one table."""
    lines = []
    lines.append("## PIR Scheme Summary — All Groups\n")
    lines.append("| Scheme | Group | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Client (ms) | Tier |")
    lines.append("|--------|-------|------|-----------|--------------|------------|------------------|-------------|------|")

    # Sort by group then year
    sorted_data = sorted(data, key=lambda s: (GROUP_ORDER.index(s["group"]), s.get("year", 9999)))

    for s in sorted_data:
        c = s.get("concrete", {}) or {}
        group_label = f"{s['group']} ({GROUP_NAMES[s['group']]})"
        tier_label = {1: "Exact", 2: "Approx", 3: "Asymp."}.get(s.get("data_tier", 3), "?")

        lines.append(
            f"| {s['display_name']} | {group_label} | {s.get('year', '?')} | "
            f"{fmt(c.get('query_size_kb'))} | {fmt(c.get('response_size_kb'))} | "
            f"{fmt(c.get('server_time_ms'))} | {fmt(c.get('throughput_gbps'))} | "
            f"{fmt(c.get('client_time_ms'))} | {tier_label} |"
        )

    return "\n".join(lines) + "\n"


def generate_summary_per_group(data):
    """Generate summary_per_group.md — per-group detailed tables."""
    lines = []

    for group in GROUP_ORDER:
        group_schemes = sorted(
            [s for s in data if s["group"] == group],
            key=lambda s: s.get("year", 9999)
        )
        if not group_schemes:
            continue

        lines.append(f"## Group {group} — {GROUP_NAMES[group]}\n")

        if group == "A":
            lines.append("| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Rate | F |")
            lines.append("|--------|------|-----------|--------------|------------|------------------|------|---|")
            for s in group_schemes:
                c = s.get("concrete", {}) or {}
                gs = s.get("group_specific", {}) or {}
                lines.append(
                    f"| {s['display_name']} | {s.get('year', '?')} | "
                    f"{fmt(c.get('query_size_kb'))} | {fmt(c.get('response_size_kb'))} | "
                    f"{fmt(c.get('server_time_ms'))} | {fmt(c.get('throughput_gbps'))} | "
                    f"{fmt(gs.get('rate'))} | {fmt(gs.get('expansion_factor'))} |"
                )

        elif group == "B":
            lines.append("| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Offline (MB) |")
            lines.append("|--------|------|-----------|--------------|------------|------------------|-------------|")
            for s in group_schemes:
                c = s.get("concrete", {}) or {}
                gs = s.get("group_specific", {}) or {}
                lines.append(
                    f"| {s['display_name']} | {s.get('year', '?')} | "
                    f"{fmt(c.get('query_size_kb'))} | {fmt(c.get('response_size_kb'))} | "
                    f"{fmt(c.get('server_time_ms'))} | {fmt(c.get('throughput_gbps'))} | "
                    f"{fmt(gs.get('offline_comm_mb', c.get('offline_hint_mb')))} |"
                )

        elif group == "C":
            lines.append("| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Hint (MB) |")
            lines.append("|--------|------|-----------|--------------|------------|------------------|----------|")
            for s in group_schemes:
                c = s.get("concrete", {}) or {}
                gs = s.get("group_specific", {}) or {}
                lines.append(
                    f"| {s['display_name']} | {s.get('year', '?')} | "
                    f"{fmt(c.get('query_size_kb'))} | {fmt(c.get('response_size_kb'))} | "
                    f"{fmt(c.get('server_time_ms'))} | {fmt(c.get('throughput_gbps'))} | "
                    f"{fmt(gs.get('offline_hint_mb', c.get('offline_hint_mb')))} |"
                )

        elif group == "D":
            lines.append("| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Client (ms) | Storage (MB) | Impl? |")
            lines.append("|--------|------|-----------|--------------|------------|------------|-------------|-------|")
            for s in group_schemes:
                c = s.get("concrete", {}) or {}
                impl = "Yes" if s.get("has_implementation") else "No"
                lines.append(
                    f"| {s['display_name']} | {s.get('year', '?')} | "
                    f"{fmt(c.get('query_size_kb'))} | {fmt(c.get('response_size_kb'))} | "
                    f"{fmt(c.get('server_time_ms'))} | {fmt(c.get('client_time_ms'))} | "
                    f"{fmt(c.get('client_storage_mb'))} | {impl} |"
                )

        elif group == "X":
            lines.append("| Scheme | Year | Model | Key Metric |")
            lines.append("|--------|------|-------|-----------|")
            for s in group_schemes:
                gs = s.get("group_specific", {}) or {}
                model = gs.get("pir_variant", "—")
                lines.append(
                    f"| {s['display_name']} | {s.get('year', '?')} | "
                    f"{model} | See notes |"
                )

        lines.append("")

    return "\n".join(lines) + "\n"


def generate_all_tables():
    """Generate all markdown tables."""
    data = load_data()
    outdir = ensure_output_dir("tables")

    print("Generating markdown tables...")

    all_table = generate_summary_all(data)
    (outdir / "summary_all.md").write_text(all_table)
    print(f"  Saved: {outdir / 'summary_all.md'}")

    per_group = generate_summary_per_group(data)
    (outdir / "summary_per_group.md").write_text(per_group)
    print(f"  Saved: {outdir / 'summary_per_group.md'}")

    print("Done with markdown tables.")


if __name__ == "__main__":
    generate_all_tables()
