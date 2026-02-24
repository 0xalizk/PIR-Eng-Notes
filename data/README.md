See [also](https://0xalizk.github.io/PIR-Eng-Notes/#overview) which reads off of pir_data.json

<details>
<summary>Scripts</summary>

#### Quick Start

```bash
cd data/  # (formerly Visualization/)
uv venv && uv pip install matplotlib seaborn pandas numpy adjustText
uv run scripts/generate_all.py
```

All outputs go to `output/`.

#### Structure

```
data/
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
| [**T1**](output/top_level#communication-design-space--query-vs-response-size) | Communication scatter: query size vs response size (log-log) |
| [**T2**](output/top_level#server-throughput-comparison) | Throughput bar chart: all schemes with concrete throughput |
| [**T3**](output/top_level#pareto-frontier--communication-vs-server-time) | Pareto frontier: total communication vs server time |
| [**T4**](output/top_level#pir-scheme-heatmap-overview) | Heatmap overview: all 35 schemes, 7 metrics, color-coded |
| [**T5**](output/top_level#online-vs-offline-cost-split) | Online vs offline cost split: stacked bars |
| [**T6**](output/top_level#pir-throughput-evolution-over-time) | Timeline: throughput evolution by publication year |

#### Per-Group

| Plot | Group | Description |
|------|-------|-------------|
| [**A1**](output/group_a#fhe-efficiency-frontier--expansion-factor-vs-server-time) | FHE-Based | Expansion factor vs server time |
| [**A2**](output/group_a#fhe-based-pir-communication-evolution) | FHE-Based | Communication evolution timeline |
| [**A3**](output/group_a#group-a-fhe-based-full-comparison) | FHE-Based | Full comparison heatmap table |
| [**B1**](output/group_b#stateless-pir--throughput-vs-communication-tradeoff) | Stateless | Throughput vs communication scatter |
| [**B2**](output/group_b#stateless-pir--queryresponse-size-comparison) | Stateless | Query/response paired bars |
| [**B3**](output/group_b#stateless-pir--server-computation-time) | Stateless | Server time comparison |
| [**C1**](output/group_c#client-independent-preprocessing--online-throughput) | Client-Indep. | Online throughput bar chart |
| [**C2**](output/group_c#hint-size-vs-online-communication-tradeoff) | Client-Indep. | Hint size vs online communication |
| [**C3**](output/group_c#throughput-scaling-with-database-size) | Client-Indep. | Throughput scaling with DB size |
| [**D1**](output/group_d#client-dependent-preprocessing--online-server-latency) | Client-Dep. | Online latency bars |
| [**D2**](output/group_d#server-vs-client-online-latency) | Client-Dep. | Server vs client latency scatter |
| [**D3**](output/group_d#client-storage-vs-server-computation-tradeoff) | Client-Dep. | Client storage vs server time |
| [**D4**](output/group_d#asymptotic-classification--theory-only-schemes) | Client-Dep. | Asymptotic classification table (theory-only) |
| [**X1**](output/group_x#extensions--narrative-comparison) | Extensions | Narrative comparison table |

### Data

`pir_data.json` is the single source of truth. Each scheme entry has:

- **id, display_name, group, year**: Identification
- **has_implementation, data_tier**: Tier 1 = exact benchmarks, Tier 2 = approximate, Tier 3 = asymptotic only
- **concrete**: Benchmark numbers (query/response KB, server ms, throughput GB/s, etc.)
- **asymptotic**: Big-O complexity expressions
- **group_specific**: Per-group metrics (expansion factor, rate, hint size, etc.)

Data was extracted from the group README.md comparison tables (which were audited against individual scheme notes.md files with zero discrepancies found).

#### Reference DB Sizes

Benchmark numbers in `pir_data.json` are **not normalized** to a common database size — each scheme's concrete metrics come from whatever configuration the paper reported. The table below documents each scheme's reference DB size and where it was sourced from.

| Scheme | DB Size | Source |
|--------|---------|--------|
| SealPIR | 302 MB | [num_entries × entry_size_bytes (1,048,576 × 288B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#complexity) |
| MulPIR | 268 MB | [num_entries × entry_size_bytes (1,048,576 × 256B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md#complexity) |
| OnionPIR | 30.7 GB | [num_entries × entry_size_bytes (1,000,000 × 30720B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md#complexity) |
| Addra/FastPIR | 3.1 MB | [num_entries × entry_size_bytes (32,768 × 96B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md#complexity) |
| Spiral | 8.1 GB | [num_entries × entry_size_bytes (262,144 × 30720B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md#variants) |
| FrodoPIR | 1.1 GB | [num_entries × entry_size_bytes (1,048,576 × 1024B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#complexity) |
| ThorPIR | 386.5 GB | [num_entries × entry_size_bytes (1,073,741,824 × 360B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#complexity) |
| OnionPIRv2 | ~1 GB | [reference_db field: "n=2048, ~1 GB DB"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#complexity) |
| HintlessPIR | 1.1 GB | [num_entries × entry_size_bytes (1,073,741,824 × 1B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md#variants) |
| YPIR | 32 GB | [reference_db field: "32 GB, 1-bit records"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md#variants) |
| Respire | 268 MB | [num_entries × entry_size_bytes (1,048,576 × 256B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md#variants) |
| WhisPIR | 1 / 8 / 16 / 32 GiB | [Figure 4 benchmark DB sizes](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md#complexity) |
| Pirouette | 8.6 GB | [num_entries × entry_size_bytes (33,554,432 × 256B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md#variants) |
| InsPIRe | 1 GB | [reference_db field: "1 GB, 64B entries"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md#variants) |
| NPIR | 8 GB | [reference_db field: "8 GB, 32 KB records"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md#variants) |
| VIA | 32 GB | [reference_db field: "32 GB"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md#variants) |
| SimplePIR | 1 GB | [reference_db field: "1 GB, 1-bit entries"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#variants) |
| DoublePIR | 1 GB | [reference_db field: "1 GB, 1-bit entries"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#variants) |
| VeriSimplePIR | 4–256 GiB | [Figure 7, Figure 8 (range)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md#complexity) |
| BarelyDoublyEfficient | 1 GB | [reference_db field: "1 GB (estimated, theoretical)"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md#complexity) |
| IncrementalPIR | 1 GB | [reference_db field: "1 GB, 1-bit entries"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md#complexity) |
| CK20 | 33.6 MB | [num_entries × entry_size_bytes (1,048,576 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#variants) |
| IncPIR | 33.6 MB | [num_entries × entry_size_bytes (1,048,576 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md#complexity) |
| Piano | 107.5 GB | [num_entries × entry_size_bytes (1,680,000,000 × 64B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md#variants) |
| TreePIR | 512 MB | [N=2^32 × 1 bit](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md#variants) |
| RMS24 | 8.6 GB | [num_entries × entry_size_bytes (268,435,456 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md#variants) |
| IshaiShiWichs | 33.6 MB | [num_entries × entry_size_bytes (1,048,576 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md#complexity) |
| Plinko | 33.6 MB | [num_entries × entry_size_bytes (1,048,576 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md#complexity) |
| SinglePass | 96 MB | [num_entries × entry_size_bytes (3,000,000 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md#complexity) |
| WangRen | 33.6 MB | [num_entries × entry_size_bytes (1,048,576 × 32B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md#complexity) |
| KeywordPIR | 302 MB | [num_entries × entry_size_bytes (1,048,576 × 288B)](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#complexity) |
| DistributionalPIR | 38 GB | [reference_db field: "38 GB Twitter DB, B=24"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#complexity) |
| XPIR (2014) | - | [reference_db: "N=2^32, d=5, bundled"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#complexity) |
| XPIR (2016) | - | [reference_db: "various, pre-processed static"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md#complexity) |
| CwPIR | - | [reference_db: "k=2, n=16384, 1 plaintext"](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md#complexity) |

### Dependencies

- Python 3.10+
- matplotlib, seaborn, pandas, numpy, adjustText
