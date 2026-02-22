## Making of this directory

<details>
<summary><strong>Tier 1</strong> (~74%) Exact — direct benchmarks from an implementation (26 schemes)</summary>

| Scheme | Source |
|--------|--------|
| 2026 IncrementalPIR | [Table 2](../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md) |
| 2025 DistributionalPIR | [Section 7.2.1, Figure 9, Figure 10, Table 12](../Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) |
| 2025 InsPIRe | [Table 2, Table 3](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md) |
| 2025 NPIR | [Table 1](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md) |
| 2025 OnionPIRv2 | [Table 2](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md) |
| 2025 Pirouette | [Table 7](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) |
| 2025 VIA | [Table 1, Table 2](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md) |
| 2024 Respire | [Table 1, Table 2](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) |
| 2024 SinglePass | [Table 2](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) |
| 2024 YPIR | [Table 2](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) |
| 2023 HintlessPIR | [Table 1, Table 2](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md) |
| 2023 Piano | [Table 1](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) |
| 2023 RMS24 | [Table 2, Table 3](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md) |
| 2023 TreePIR | [Figure 7, Figure 8, Figure 9](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) |
| 2022 CwPIR | [Table 7, Table 8](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) |
| 2022 DoublePIR | [Table 1, Table 8](../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) |
| 2022 FrodoPIR | [Table 6, Table 7](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) |
| 2022 SimplePIR | [Table 1, Table 8](../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) |
| 2022 Spiral | [Table 3, Table 5](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md) |
| 2021 Addra/FastPIR | [Figure 9, Figure 10](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md) |
| 2021 IncPIR | [Figure 9, Figure 10](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) |
| 2021 OnionPIR | [Table 3, Table 4](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) |
| 2019 KeywordPIR | [Table 3, Table 4](../Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md) |
| 2018 SealPIR | [Figure 9](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) |
| 2016 XPIR | [Figure 6, Figure 7, Figure 8](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md) |
| 2014 XPIR | [Table 2, Table 3](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md) |

</details>

<details>
<summary><strong>Tier 2</strong> (~6%) Approximate — estimated from analytical models in the paper (2 schemes)</summary>

| Scheme | Source | How estimated |
|--------|--------|---------------|
| 2024 VeriSimplePIR | [Figure 7, Figure 8](../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) | Values read from paper figures (approximate) |
| 2024 WhisPIR | [Figure 1, Figure 2, Figure 4](../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) | Values read from paper figures (approximate) |

</details>

<details>
<summary><strong>Tier 3</strong> (~20%) Asymptotic — derived from theoretical complexity bounds only (7 schemes)</summary>

| Scheme | Source | How derived |
|--------|--------|-------------|
| 2025 BarelyDoublyEfficient | [Theorem 3.1](../Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md) | Asymptotic formulas with N=2^33 bits; unknown poly(λ) constants |
| 2024 IshaiShiWichs | [Table 1, Theorem 4.4](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) | Information-theoretic Õ(n^{2/3}) server, Õ(n^{1/3}) comm at n=2^28 |
| 2024 Plinko | [Figure 1, Figure 6](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) | Asymptotic Õ(n/r) at r=√n for N=2^20 entries; no implementation |
| 2024 ThorPIR | [Table 2](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) | Concrete numbers from Table 2 (proven-security variant) at N=2^30 |
| 2024 WangRen | [Theorem 4.1](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) | Balanced tradeoff T=√n at N=2^20 entries; calibrated vs RMS24 |
| 2019 CK20 | [Theorem 14](../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) | Two-server computational with s=√n, λ=128, n=2^28 bits |
| 2019 MulPIR | [Section 5, Appendix A](../Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) | Analytical cost model: rate=4/9, ~1.72 mults/byte, ring dim 2^12 |

</details>

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
