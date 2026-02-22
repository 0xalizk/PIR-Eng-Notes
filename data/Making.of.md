## Making of this directory

Design rationale and decisions for the comparative visualization of PIR schemes' metrics and paper-reported benchmarks and/or asymptotics.

### Data Pipeline

1. **Audit (Step 0):** Cross-checked all 5 group README.md comparison tables against the 34 individual scheme notes.md files. Result: zero discrepancies across all groups. The README tables faithfully reflect the source-of-truth notes.md files.

2. **Data Extraction (Step 1):** Rather than fragile regex parsing of heterogeneous markdown tables, the data was hand-curated into `pir_data.json` from the verified README tables. Each scheme gets a structured entry with concrete benchmarks, asymptotic complexity, and group-specific metrics.

3. **Data Confidence Tiers:** Schemes are classified into three tiers to prevent apples-to-oranges comparisons:
   - **Tier 1 (26 schemes):** Exact paper-reported benchmarks. Filled markers in plots.
   - **Tier 2 (2 schemes):** Approximate values (WhisPIR, VeriSimplePIR). Open markers.
   - **Tier 3 (7 schemes):** Asymptotic complexity only, no implementation. Excluded from scatter plots, shown in tables only.

<details>
<summary>Data sources by tier</summary>

#### Tier 1 — Direct benchmarks (26 schemes)

| Scheme | Source |
|--------|--------|
| 2026 IncrementalPIR | Table 2 |
| 2025 DistributionalPIR | Section 7.2.1, Figure 9, Figure 10, Table 12 |
| 2025 InsPIRe | Table 2, Table 3 |
| 2025 NPIR | Table 1 |
| 2025 OnionPIRv2 | Table 2 |
| 2025 Pirouette | Table 7 |
| 2025 VIA | Table 1, Table 2 |
| 2024 Respire | Table 1, Table 2 |
| 2024 SinglePass | Table 2 |
| 2024 YPIR | Table 2 |
| 2023 HintlessPIR | Table 1, Table 2 |
| 2023 Piano | Table 1 |
| 2023 RMS24 | Table 2, Table 3 |
| 2023 TreePIR | Figure 7, Figure 8, Figure 9 |
| 2022 CwPIR | Table 7, Table 8 |
| 2022 DoublePIR | Table 1, Table 8 |
| 2022 FrodoPIR | Table 6, Table 7 |
| 2022 SimplePIR | Table 1, Table 8 |
| 2022 Spiral | Table 3, Table 5 |
| 2021 Addra/FastPIR | Figure 9, Figure 10 |
| 2021 IncPIR | Figure 9, Figure 10 |
| 2021 OnionPIR | Table 3, Table 4 |
| 2019 KeywordPIR | Table 3, Table 4 |
| 2018 SealPIR | Figure 9 |
| 2016 XPIR | Figure 6, Figure 7, Figure 8 |
| 2014 XPIR | Table 2, Table 3 |

#### Tier 2 — Approximate values (2 schemes)

| Scheme | Source | How estimated |
|--------|--------|---------------|
| 2024 VeriSimplePIR | Figure 7, Figure 8 | Values read from paper figures (approximate) |
| 2024 WhisPIR | Figure 1, Figure 2, Figure 4 | Values read from paper figures (approximate) |

#### Tier 3 — Analytical estimates (7 schemes)

| Scheme | Source | How derived |
|--------|--------|-------------|
| 2025 BarelyDoublyEfficient | Theorem 3.1 | Asymptotic formulas with N=2^33 bits; unknown poly(λ) constants |
| 2024 IshaiShiWichs | Table 1, Theorem 4.4 | Information-theoretic Õ(n^{2/3}) server, Õ(n^{1/3}) comm at n=2^28 |
| 2024 Plinko | Figure 1, Figure 6 | Asymptotic Õ(n/r) at r=√n for N=2^20 entries; no implementation |
| 2024 ThorPIR | Table 2 | Concrete numbers from Table 2 (proven-security variant) at N=2^30 |
| 2024 WangRen | Theorem 4.1 | Balanced tradeoff T=√n at N=2^20 entries; calibrated vs RMS24 |
| 2019 CK20 | Theorem 14 | Two-server computational with s=√n, λ=128, n=2^28 bits |
| 2019 MulPIR | Section 5, Appendix A | Analytical cost model: rate=4/9, ~1.72 mults/byte, ring dim 2^12 |

</details>

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
