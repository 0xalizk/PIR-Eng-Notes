## PIR Engineering Notes

Structured engineering notes for 36 Private Information Retrieval (PIR) research papers, covering scheme design, complexity analysis, cryptographic assumptions, and reported benchmarks. Each paper has a per-scheme notes file produced from the source PDF using a standardized template. All footnoted claims cite specific pages/sections of the original paper.

---

## Key Contributions by Paper

### Group A — FHE-Based PIR

| Paper | Key Contribution |
|-------|-----------------|
| [XPIR-2014](Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md) | First practical NTRU-based single-server cPIR |
| [XPIR-2016](Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md) | Ring-LWE system with auto-optimization of parameters |
| [SealPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md) | Query compression via BFV oblivious expansion (paradigm shift) |
| [MulPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md) | GSW-based compressible FHE for high communication rate |
| [OnionPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md) | External products for noise control, first <1s at scale |
| [OnionPIRv2](Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md) | Multi-base decomposition + NTT-domain DB engineering |
| [FastPIR/Addra](Schemes/Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md) | System: metadata-private voice via one-hot BFV selection |
| [CwPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md) | Constant-weight equality operators, native keyword PIR |
| [Spiral](Schemes/Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md) | Ciphertext translation (Regev-to-GSW), 4 Pareto-optimal variants |
| [FrodoPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md) | Plain LWE with client-independent global hint (functionally Group C) |
| [ThorPIR](Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md) | Client-dependent FHE preprocessing (functionally Group D) |

### Group B — Stateless Single Server PIR

| Paper | Key Contribution |
|-------|-----------------|
| [HintlessPIR](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md) | Composable RLWE preprocessing, LinPIR primitive |
| [YPIR](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md) | Memory-bandwidth-limited throughput, CDKS packing |
| [Respire](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md) | Small-record optimization, 5-ring architecture |
| [WhisPIR](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md) | BGV-based stateless PIR, non-compact BGV optimization |
| [Pirouette](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md) | 36-byte queries via blind rotation |
| [InsPIRe](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md) | InspiRING ring packing, polynomial evaluation |
| [NPIR](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2025/NPIR_2025_notes.md) | NTRU packing for high communication rate |
| [VIA](Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md) | DMux-CMux architecture, 3 variants (VIA/VIA-C/VIA-B) |

### Group C — Client-Independent Preprocessing

| Paper | Key Contribution |
|-------|-----------------|
| [SimplePIR](Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) | 10 GB/s throughput via plain LWE matrix-vector multiply |
| [DoublePIR](Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) | Compressed hints via LWE-on-LWE composition |
| [VeriSimplePIR](Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) | Verifiability via SIS commitments + VLHE |
| [BarelyDoublyEfficient](Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md) | First DEPIR from plain LWE in CRS model (theory) |
| [IncrementalPIR](Schemes/Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md) | Entry-level incremental preprocessing for SimplePIR |

### Group D — Client-Dependent Preprocessing

| Paper | Key Contribution |
|-------|-----------------|
| [CK20](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md) | First sublinear-server cPIR (theory), puncturable pseudorandom sets |
| [Piano](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md) | First practical sublinear-server, PRF-only |
| [Plinko](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md) | Invertible PRFs, O-tilde(1) updates (theory) |
| [TreePIR](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md) | 2-server sublinear via wpPRF primitive |
| [IncPIR](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md) | Incremental hint updates, mutation model |
| [IshaiShiWichs](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2024/IshaiShiWichs_2024_notes.md) | IT-PIR constructions + OWF/SZK lower bounds |
| [RMS24](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2023/RMS24_2023_notes.md) | Dummy subsets, standard correctness |
| [SinglePass](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md) | Streaming single-pass preprocessing, deterministic |
| [WangRen](Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md) | Tight ST = O(nw) tradeoff (theory) |

### Group X — Variants & Surveys

| Paper | Key Contribution |
|-------|-----------------|
| [KeywordPIR](Schemes/Group%20X%20-%20Keyword%20Symmetric%20Distributional%20PIR/keywordpir_2019/KeywordPIR_2019_notes.md) | Comparison of SealPIR, MulPIR, Gentry-Ramzan for keyword PIR |
| [DistributionalPIR](Schemes/Group%20X%20-%20Keyword%20Symmetric%20Distributional%20PIR/distributionalpir_2025/DistributionalPIR_2025_notes.md) | Distribution-dependent PIR model + compiler framework |
| [CGKS Survey](Schemes/Group%20X%20-%20Keyword%20Symmetric%20Distributional%20PIR/cgks_survey_2004/CGKS_Survey_2004_notes.md) | Foundational pedagogical survey of IT-PIR and cPIR theory |
