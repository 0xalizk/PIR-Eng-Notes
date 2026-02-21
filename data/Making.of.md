## Making of this directory

Design rationale and decisions for the comparative visualization of PIR schemes' metrics and paper-reported benchmarks and/or asymptotics.

### Data Pipeline

1. **Audit (Step 0):** Cross-checked all 5 group README.md comparison tables against the 34 individual scheme notes.md files. Result: zero discrepancies across all groups. The README tables faithfully reflect the source-of-truth notes.md files.

2. **Data Extraction (Step 1):** Rather than fragile regex parsing of heterogeneous markdown tables, the data was hand-curated into `pir_data.json` from the verified README tables. Each scheme gets a structured entry with concrete benchmarks, asymptotic complexity, and group-specific metrics.

3. **Data Confidence Tiers:** Schemes are classified into three tiers to prevent apples-to-oranges comparisons:
   - **Tier 1 (26 schemes):** Exact paper-reported benchmarks. Filled markers in plots.
   - **Tier 2 (2 schemes):** Approximate values (WhisPIR, VeriSimplePIR). Open markers.
   - **Tier 3 (7 schemes):** Asymptotic complexity only, no implementation. Excluded from scatter plots, shown in tables only.

### Key Design Decisions

#### Why not normalize across hardware?
Different schemes benchmark on different hardware (x86, ARM, GPU), different DB sizes (1 GB to 100 GB), and different entry sizes (1 bit to 30 KB). Normalizing would require assumptions about hardware scaling that would mislead more than inform. Instead, each plot annotates the benchmark configuration.

#### Why exclude Group X from top-level plots?
Group X contains extension schemes (KeywordPIR, DistributionalPIR) that solve different problems from standard index-PIR. Including them in the same scatter plots would be misleading. They get a narrative comparison table (X1) instead.

#### Why Pareto frontier on T3?
The communication-vs-computation tradeoff is THE fundamental PIR design question. The Pareto frontier directly answers "which scheme should I use?" — anything not on the frontier is dominated by another scheme.

#### Why separate online/offline in T5?
Groups C and D "hide" their cost in preprocessing. Without T5, these schemes look impossibly cheap. The stacked bar shows the true total cost, revealing where the work actually goes.

### Normalization

- **Communication:** All values in KB
- **Computation:** All values in ms
- **Throughput:** All values in GB/s
- **Storage:** All values in MB
- **Missing data:** Excluded from plots (gray cells in heatmaps)
- **Each scheme uses its own benchmark configuration** — no cross-hardware normalization
