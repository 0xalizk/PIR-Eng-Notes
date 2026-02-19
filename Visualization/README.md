## PIR Visualization System

Visual comparison of 35 PIR schemes across 5 groups, covering both concrete benchmarks and asymptotic complexity.

<details>
<summary>Code</summary>

#### Quick Start

```bash
cd Visualization/
uv venv && uv pip install matplotlib seaborn pandas numpy adjustText
uv run scripts/generate_all.py
```

All outputs go to `output/`.

#### Structure

```
Visualization/
  pir_data.json              # Master curated data (source of truth for all plots)
  scripts/
    plot_config.py           # Colors, markers, fonts, group names
    plot_utils.py            # Shared plotting utilities
    plot_toplevel.py         # T1-T6: cross-group comparison plots
    plot_group_a.py          # A1-A3: FHE-based group plots
    plot_group_b.py          # B1-B3: Stateless group plots
    plot_group_c.py          # C1-C3: Client-indep. preprocessing plots
    plot_group_d.py          # D1-D4: Client-dep. preprocessing plots
    plot_group_x.py          # X1: Extensions narrative table
    generate_tables.py       # Markdown summary tables
    generate_all.py          # Master runner
    extract_data.py          # Data extraction helpers (reference)
  output/
    top_level/               # T1-T6 PNGs
    group_a/                 # A1-A3 PNGs
    group_b/                 # B1-B3 PNGs
    group_c/                 # C1-C3 PNGs
    group_d/                 # D1-D4 PNGs
    group_x/                 # X1 PNG
    tables/                  # Markdown summary tables
```

</details>

### Plots

#### Top-Level (Cross-Group)

| Plot | Description |
|------|-------------|
| [**T1**](output/top_level/T1_communication_scatter.png) | Communication scatter: query size vs response size (log-log) |
| [**T2**](output/top_level/T2_throughput_bar.png) | Throughput bar chart: all schemes with concrete throughput |
| [**T3**](output/top_level/T3_pareto_frontier.png) | Pareto frontier: total communication vs server time |
| [**T4**](output/top_level/T4_heatmap_overview.png) | Heatmap overview: all 35 schemes, 7 metrics, color-coded |
| [**T5**](output/top_level/T5_online_vs_offline.png) | Online vs offline cost split: stacked bars |
| [**T6**](output/top_level/T6_timeline_scatter.png) | Timeline: throughput evolution by publication year |

#### Per-Group

| Plot | Group | Description |
|------|-------|-------------|
| [**A1**](output/group_a/A1_fhe_efficiency_frontier.png) | FHE-Based | Expansion factor vs server time |
| [**A2**](output/group_a/A2_evolution_timeline.png) | FHE-Based | Communication evolution timeline |
| [**A3**](output/group_a/A3_full_comparison_heatmap.png) | FHE-Based | Full comparison heatmap table |
| [**B1**](output/group_b/B1_throughput_vs_communication.png) | Stateless | Throughput vs communication scatter |
| [**B2**](output/group_b/B2_query_response_bars.png) | Stateless | Query/response paired bars |
| [**B3**](output/group_b/B3_server_time_comparison.png) | Stateless | Server time comparison |
| [**C1**](output/group_c/C1_online_throughput.png) | Client-Indep. | Online throughput bar chart |
| [**C2**](output/group_c/C2_hint_vs_online_comm.png) | Client-Indep. | Hint size vs online communication |
| [**C3**](output/group_c/C3_throughput_scaling.png) | Client-Indep. | Throughput scaling with DB size |
| [**D1**](output/group_d/D1_online_latency_bars.png) | Client-Dep. | Online latency bars |
| [**D2**](output/group_d/D2_preprocessing_roi.png) | Client-Dep. | Server vs client latency scatter |
| [**D3**](output/group_d/D3_client_storage_vs_server.png) | Client-Dep. | Client storage vs server time |
| [**D4**](output/group_d/D4_asymptotic_classification.png) | Client-Dep. | Asymptotic classification table (theory-only) |
| [**X1**](output/group_x/X1_narrative_table.png) | Extensions | Narrative comparison table |

### Data

`pir_data.json` is the single source of truth. Each scheme entry has:

- **id, display_name, group, year**: Identification
- **has_implementation, data_tier**: Tier 1 = exact benchmarks, Tier 2 = approximate, Tier 3 = asymptotic only
- **concrete**: Benchmark numbers (query/response KB, server ms, throughput GB/s, etc.)
- **asymptotic**: Big-O complexity expressions
- **group_specific**: Per-group metrics (expansion factor, rate, hint size, etc.)

Data was extracted from the group README.md comparison tables (which were audited against individual scheme notes.md files with zero discrepancies found).

### Dependencies

- Python 3.10+
- matplotlib, seaborn, pandas, numpy, adjustText
