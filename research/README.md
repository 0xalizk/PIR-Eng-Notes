# PIR Scheme Classification Taxonomy

Based on the [client-state architecture taxonomy](https://notes.ethereum.org/U9xM4VOPR9isPK7lOZJUQg?view#41-Taxonomy):

- **1a** — Stateless Client, Stateful Server: server caches per-client crypto material (eval keys, public keys)
- **1b** — Stateless Client, Stateless Server: no per-client state anywhere; CRS or public-parameter model
- **2a** — Download-Hint: client downloads a server-computed global hint matrix
- **2b** — Interactive-Hint: bidirectional hint generation (client streams DB or interactive preprocessing)
- **X** — Extensions: orthogonal problem class, not classified by state architecture

| Scheme | Group | Rationale | Source |
|--------|-------|-----------|--------|
| XPIR-2014 | 1a | Client generates per-session NTRU key pairs; server requires client's public key to evaluate homomorphic circuit | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/xpir_2014/xpir_2014_notes.md#protocol-phases), paper p.6 (Section 4) |
| XPIR | 1a | Client uploads Ring-LWE encryption parameters; server uses client-specific ciphertexts for recursive absorb operations | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/xpir_2016/xpir_2016_notes.md#protocol-phases), paper p.7 (Section 3.1) |
| SealPIR | 1a | Client uploads 2.9 MB substitution keys for oblivious query expansion | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/sealpir_2018/sealpir_2018_notes.md#protocol-phases), paper p.5 (Section 3.4-3.5) |
| MulPIR | 1a | Appendix A variant requires 183 MB of key-switching matrices for automorphisms (theory-only) | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/mulpir_2019/mulpir_2019_notes.md#protocol-phases), paper p.20 (Section 5.2) |
| OnionPIR | 1a | Client provides RGSW(-s) plus Galois/relinearization keys for query unpacking | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/onionpir_2021/onionpir_2021_notes.md#protocol-phases), paper p.8 (Section 4.4) |
| FastPIR/Addra | 1a | BFV one-hot selection with d=1; per-client eval keys required for homomorphic answer computation | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/addra_2021/addra_2021_notes.md#protocol-phases), paper p.5-6 (Section 4.2) |
| CwPIR | 1a | BFV constant-weight queries require per-client FHE keys for expansion and equality evaluation | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/cwpir_2022/cwpir_2022_notes.md#protocol-phases), paper p.6 (Section 3.1) |
| Spiral | 1a | Client uploads 14-18 MB public parameters (conversion key + automorphism keys) | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/spiral_2022/spiral_2022_notes.md#protocol-phases), paper p.18 (Section 4.1) |
| OnionPIRv2 | 1a | Server stores 0.63-2.9 MB RGSW(s) + evaluation keys per client | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/onionpirv2_2025/onionpirv2_2025_notes.md#protocol-phases), paper p.6 (Section 3.3) |
| WhisPIR | 1a | Client uploads BGV switching key tuples enabling server-side automorphisms for index expansion | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/whispir_2024/WhisPIR_2024_notes.md#protocol-phases), paper p.6 (Section 3.1) |
| Respire | 1a | Client uploads 3.9 MB public parameters (query packing + compression keys) across 5-ring architecture | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/respire_2024/Respire_2024_notes.md#protocol-phases), paper p.2 (Section 1.1) |
| Pirouette | 1a | Client uploads 1.2 GB evaluation keys (blind-rotation, key-switching, squaring, automorphism keys) | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/pirouette_2025/Pirouette_2025_notes.md#protocol-phases), paper p.13 (Figure 4) |
| NPIR | 1a | Client uploads 0.89-1.44 MB public parameters (NTRU packing key + expansion key) | [Protocol Phases](Group.1a.Stateless.Client.Stateful.Server/npir_2026/NPIR_2026_notes.md#protocol-phases), paper p.13 (Figure 4) |
| HintlessPIR | 1b | No eval keys uploaded; composable RLWE preprocessing in CRS model; fresh keys sampled per query | [Protocol Phases](Group.1b.Stateless.Client.Stateless.Server/hintlesspir_2023/HintlessPIR_2023_notes.md#protocol-phases), paper p.8-9 (Section 4) |
| YPIR | 1b | No offline communication; CDKS packing eliminates hints; packing key sent per-query (not cached) | [Protocol Phases](Group.1b.Stateless.Client.Stateless.Server/ypir_2024/YPIR_2024_notes.md#protocol-phases), paper p.11-12 (Construction 3.1) |
| InsPIRe | 1b | CRS model with query-bundled key material; no per-client state on server | [Protocol Phases](Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md#protocol-phases), paper p.15 (Section 6) |
| VIA | 1b | Base VIA is fully hintless: DMux-CMux pipeline with no offline communication, no per-client state | [Protocol Phases](Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_notes.md#protocol-phases), paper p.10 (Figure 4) |
| VIA-BC | 1a | VIA-C and VIA-B variants upload 14.8 MB per-client eval keys (LWE-to-RLWE + response compression keys) | [Protocol Phases](Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_notes.md#protocol-phases), paper p.14-15 (Figures 8-9) |
| SimplePIR | 2a | Client downloads global LWE hint matrix (121 MB for 1 GB DB); hint is client-independent | [Protocol Phases](Group.2a.Download.Hint/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#protocol-phases--simplepir), paper p.7 (Section 4) |
| DoublePIR | 2a | Client downloads compressed hint (16 MB); two-level structure reduces hint vs SimplePIR | [Protocol Phases](Group.2a.Download.Hint/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md#protocol-phases--doublepir), paper p.8 (Section 5.1) |
| FrodoPIR | 2a | Client downloads global LWE hint matrix M = A*D (5.5-6.3 MB); resolves old Group A (now 1a) to Group C (now 2a) cross-filing | [Protocol Phases](Group.2a.Download.Hint/frodopir_2022/frodopir_2022_notes.md#protocol-phases), paper p.14 (Table 2) |
| VeriSimplePIR | 2a | Same hint model as SimplePIR plus verifiable commitments; client downloads digest containing H1 matrix | [Protocol Phases](Group.2a.Download.Hint/verisimplepir_2024/VeriSimplePIR_2024_notes.md#protocol-phases), paper p.10 (Construction 5.1) |
| IncrementalPIR | 2a | Inherits SimplePIR's hint download; adds incremental StateUpdate for DB mutations | [Protocol Phases](Group.2a.Download.Hint/incrementalpir_2026/IncrementalPIR_2026_notes.md#protocol-phases), paper p.5 (Construction 1) |
| Piano | 2b | Client streams entire DB to build PRF-based hint parities; interactive preprocessing per query window | [Protocol Phases](Group.2b.Interactive.Hint/piano_2023/Piano_2023_notes.md#protocol-phases), paper p.6 (Figure 1) |
| Plinko | 2b | Client streams DB to build invertible-PRF hint table; interactive offline phase per query window (theory-only) | [Protocol Phases](Group.2b.Interactive.Hint/plinko_2024/Plinko_2024_notes.md#protocol-phases), paper p.8-9 (Section 4) |
| RMS24 | 2b | Dummy-subset hints with interactive preprocessing; offline server generates hints via shared PRF key | [Protocol Phases](Group.2b.Interactive.Hint/rms24_2024/RMS24_2024_notes.md#protocol-phases), paper p.5-6 (Section 3.2) |
| WangRen | 2b | Client streams entire DB per preprocessing window; tight S*T tradeoff, interactive setup (theory-only) | [Protocol Phases](Group.2b.Interactive.Hint/wangren_2024/WangRen_2024_notes.md#protocol-phases), paper p.21 (Section 4.3) |
| ThorPIR | 2b | Client-dependent FHE preprocessing: server homomorphically shuffles DB under client's BFV key; resolves old Group A (now 1a) + D (now 2b) hybrid classification | [Protocol Phases](Group.2b.Interactive.Hint/thorpir_2024/thorpir_2024_notes.md#protocol-phases), paper p.6-7 (Section 3) |
| KeywordPIR | X | Keyword PIR (query by key, not index); orthogonal to client-state architecture | [Protocol Phases](Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md#protocol-phases), paper p.5 (Section 3) |
| DistributionalPIR | X | Distribution-dependent model; reduces to any underlying PIR scheme via routing | [Protocol Phases](Group.X.Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md#protocol-phases), paper p.8 (Section 4) |
