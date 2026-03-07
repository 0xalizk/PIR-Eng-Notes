🌐 **[Comparative benchs](https://0xalizk.github.io/PIR-Eng-Notes)**

## PIR Engineering Notes

**TLDR**: [Deep reading](https://gist.github.com/0xalizk/50f0d78712c6afe952ab2f9a2cc07434) of PIR papers to extract eng. notes ([eg](research/Group.A.FHE.Based.PIR/thorpir_2024/thorpir_2024_notes.md)) and [visualize](https://0xalizk.github.io/PIR-Eng-Notes/) comparative benchs/asymptotics. The correctness of these notes are [continuously validated](checkups/README.md#checking-correctness-of-cited-claims):
- Scheme grouping [based on this taxonomy](https://hackmd.io/@keewoolee/SJyGoXCzZe#Taxonomy)
- Multi-server schemes are excluded
- Engineering notes ([eg](/research/Group.A.FHE.Based.PIR/thorpir_2024/thorpir_2024_notes.md)) for 30 Private Information Retrieval (PIR) research papers with [validated](https://github.com/0xalizk/PIR-Eng-Notes/tree/main/checkups#checking-correctness-of-cited-claims) [[2]](https://github.com/0xalizk/PIR-Eng-Notes/tree/main/.claude/skills/footnotes-checkup) footnotes [eg](https://github.com/0xalizk/PIR-Eng-Notes/blob/main/research/Group.A.FHE.Based.PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-1-3308a358ac26db24fd1f223243da4392)
- Per-scheme notes are produced by reading the source PDF (incl. tables/figures which Claude can do) using a [standardized methodology](.claude/skills/pir-paper-analyzer/SKILL.md). 


| [![Communication](data/output/top_level/T1_communication_scatter.png)](https://0xalizk.github.io/PIR-Eng-Notes/#communication) | [![Client Compute](data/output/top_level/T7_client_compute.png)](https://0xalizk.github.io/PIR-Eng-Notes/#client-cost) | [![Offline & Storage](data/output/top_level/T8_offline_storage.png)](https://0xalizk.github.io/PIR-Eng-Notes/#offline-storage) |
|:---:|:---:|:---:|

### Group A — FHE-Based PIR

| Paper &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Key Contribution |
|-------------------------------|-----------------|
| 2025 [OnionPIRv2](research/Group.A.FHE.Based.PIR/onionpirv2_2025/onionpirv2_2025_notes.md) | Multi-base decomposition + NTT-domain DB engineering |
| 2024 [ThorPIR](research/Group.A.FHE.Based.PIR/thorpir_2024/thorpir_2024_notes.md) | Client-dependent FHE preprocessing (functionally Group D) |
| 2022 [FrodoPIR](research/Group.A.FHE.Based.PIR/frodopir_2022/frodopir_2022_notes.md) | Plain LWE with client-independent global hint (functionally Group C) |
| 2022 [Spiral](research/Group.A.FHE.Based.PIR/spiral_2022/spiral_2022_notes.md) | Ciphertext translation (Regev-to-GSW), 4 Pareto-optimal variants |
| 2022 [CwPIR](research/Group.A.FHE.Based.PIR/cwpir_2022/cwpir_2022_notes.md) | Constant-weight equality operators, native keyword PIR |
| 2021 [FastPIR/Addra](research/Group.A.FHE.Based.PIR/addra_2021/addra_2021_notes.md) | System: metadata-private voice via one-hot BFV selection |
| 2021 [OnionPIR](research/Group.A.FHE.Based.PIR/onionpir_2021/onionpir_2021_notes.md) | External products for noise control, first <1s at scale |
| 2019 [MulPIR](research/Group.A.FHE.Based.PIR/mulpir_2019/mulpir_2019_notes.md) | GSW-based compressible FHE for high communication rate |
| 2018 [SealPIR](research/Group.A.FHE.Based.PIR/sealpir_2018/sealpir_2018_notes.md) | Query compression via BFV oblivious expansion (paradigm shift) |
| 2016 [XPIR-2016](research/Group.A.FHE.Based.PIR/xpir_2016/xpir_2016_notes.md) | Ring-LWE system with auto-optimization of parameters |
| 2014 [XPIR-2014](research/Group.A.FHE.Based.PIR/xpir_2014/xpir_2014_notes.md) | First practical NTRU-based single-server cPIR |

### Group B — Stateless Single Server PIR

| Paper &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Key Contribution |
|-------------------------------|-----------------|
| 2026 [NPIR](research/Group.B.Stateless.Single.Server.PIR/npir_2026/NPIR_2026_notes.md) | NTRU packing for high communication rate |
| 2025 [VIA](research/Group.B.Stateless.Single.Server.PIR/via_2025/VIA_2025_notes.md) | DMux-CMux architecture, 3 variants (VIA/VIA-C/VIA-B) |
| 2025 [InsPIRe](research/Group.B.Stateless.Single.Server.PIR/inspire_2025/InsPIRe_2025_notes.md) | InspiRING ring packing, polynomial evaluation |
| 2025 [Pirouette](research/Group.B.Stateless.Single.Server.PIR/pirouette_2025/Pirouette_2025_notes.md) | 36-byte queries via blind rotation |
| 2024 [WhisPIR](research/Group.B.Stateless.Single.Server.PIR/whispir_2024/WhisPIR_2024_notes.md) | BGV-based stateless PIR, non-compact BGV optimization |
| 2024 [Respire](research/Group.B.Stateless.Single.Server.PIR/respire_2024/Respire_2024_notes.md) | Small-record optimization, 5-ring architecture |
| 2024 [YPIR](research/Group.B.Stateless.Single.Server.PIR/ypir_2024/YPIR_2024_notes.md) | Memory-bandwidth-limited throughput, CDKS packing |
| 2023 [HintlessPIR](research/Group.B.Stateless.Single.Server.PIR/hintlesspir_2023/HintlessPIR_2023_notes.md) | Composable RLWE preprocessing, LinPIR primitive |

### Group C — Client-Independent Preprocessing

| Paper &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Key Contribution |
|-------------------------------|-----------------|
| 2026 [IncrementalPIR](research/Group.C.Client.Independent.Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md) | Entry-level incremental preprocessing for SimplePIR |
| 2025 [BarelyDoublyEfficient](research/Group.C.Client.Independent.Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md) | First DEPIR from plain LWE in CRS model (theory) |
| 2024 [VeriSimplePIR](research/Group.C.Client.Independent.Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md) | Verifiability via SIS commitments + VLHE |
| 2022 [DoublePIR](research/Group.C.Client.Independent.Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) | Compressed hints via LWE-on-LWE composition |
| 2022 [SimplePIR](research/Group.C.Client.Independent.Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md) | 10 GB/s throughput via plain LWE matrix-vector multiply |

### Group D — Client-Dependent Preprocessing

| Paper &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Key Contribution |
|-------------------------------|-----------------|
| 2025 [IshaiShiWichs](research/Group.D.Client.Dependent.Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md) | IT-PIR constructions + OWF/SZK lower bounds |
| 2024 [WangRen](research/Group.D.Client.Dependent.Preprocessing/wangren_2024/WangRen_2024_notes.md) | Tight ST = O(nw) tradeoff (theory) |
| 2024 [Plinko](research/Group.D.Client.Dependent.Preprocessing/plinko_2024/Plinko_2024_notes.md) | Invertible PRFs, Õ(1) updates (theory) |
| 2024 [RMS24](research/Group.D.Client.Dependent.Preprocessing/rms24_2024/RMS24_2024_notes.md) | Dummy subsets, standard correctness |
| 2023 [Piano](research/Group.D.Client.Dependent.Preprocessing/piano_2023/Piano_2023_notes.md) | First practical sublinear-server, PRF-only |

### Group X — Extensions

| Paper &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Key Contribution |
|-------------------------------|-----------------|
| 2025 [DistributionalPIR](research/Group.X.Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md) | Distribution-dependent PIR model + compiler framework |
| 2019 [KeywordPIR](research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md)&#8201;[^1] | Comparison of SealPIR, MulPIR, Gentry-Ramzan for keyword PIR |

[^1]: The "MulPIR" referenced in KeywordPIR is the Ali et al. [[1]](https://eprint.iacr.org/2019/1483) implementation of Gentry & Halevi's "Compressible FHE with Applications to PIR" [[2]](https://eprint.iacr.org/2019/733), which is already covered under [mulpir_2019](research/Group.A.FHE.Based.PIR/mulpir_2019/mulpir_2019_notes.md#mulpir--engineering-notes). Open-source implementations: [[3](https://github.com/apple/swift-homomorphic-encryption)] [[4](https://github.com/tlepoint/fhe.rs)].

### Note: schemes below span multiple groups

| &nbsp; &nbsp; &nbsp; &nbsp; $\color{darkorange}{\textsf{Scheme}}$ &nbsp; &nbsp; &nbsp; &nbsp; | $\color{darkorange}{\textsf{Why}}$ |
|:----------------------------------------------------------------------:|-----|
| 2025&nbsp;[VIA](research/Group.B.Stateless.Single.Server.PIR/via_2025/VIA_2025_notes.md) | Base VIA is Group B (hintless); VIA-C straddles B/C — its offline evaluation-key upload is client-independent preprocessing |
| 2024&nbsp;[ThorPIR](research/Group.A.FHE.Based.PIR/thorpir_2024/thorpir_2024_notes.md) | Group A + D hybrid — FHE-based construction, but client sends encrypted PRG seeds and server performs per-client homomorphic preprocessing |
| 2022&nbsp;[FrodoPIR](research/Group.A.FHE.Based.PIR/frodopir_2022/frodopir_2022_notes.md) | Filed A (LWE-based) but functionally Group C — server computes a single client-independent global hint matrix; no per-client preprocessing |
| 2022&nbsp;[CwPIR](research/Group.A.FHE.Based.PIR/cwpir_2022/cwpir_2022_notes.md) | Filed A (FHE-based) but its core innovation — constant-weight equality operators — enables native single-round keyword PIR (a Group X extension model) |
