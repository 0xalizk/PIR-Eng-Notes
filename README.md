## PIR Engineering Notes

Structured engineering notes for 36 Private Information Retrieval (PIR) research papers, covering scheme design, complexity analysis, cryptographic assumptions, and reported benchmarks. Each paper has a per-scheme notes file produced from the source PDF using a standardized template. All footnoted claims cite specific pages/sections of the original paper.

---

## Key Contributions by Paper

### Group A — FHE-Based PIR

| Paper | Key Contribution |
|-------|-----------------|
| XPIR-2014 | First practical NTRU-based single-server cPIR |
| XPIR-2016 | Ring-LWE system with auto-optimization of parameters |
| SealPIR | Query compression via BFV oblivious expansion (paradigm shift) |
| MulPIR | GSW-based compressible FHE for high communication rate |
| OnionPIR | External products for noise control, first <1s at scale |
| OnionPIRv2 | Multi-base decomposition + NTT-domain DB engineering |
| FastPIR/Addra | System: metadata-private voice via one-hot BFV selection |
| CwPIR | Constant-weight equality operators, native keyword PIR |
| Spiral | Ciphertext translation (Regev-to-GSW), 4 Pareto-optimal variants |
| FrodoPIR | Plain LWE with client-independent global hint (functionally Group C) |
| ThorPIR | Client-dependent FHE preprocessing (functionally Group D) |

### Group B — Stateless Single Server PIR

| Paper | Key Contribution |
|-------|-----------------|
| HintlessPIR | Composable RLWE preprocessing, LinPIR primitive |
| YPIR | Memory-bandwidth-limited throughput, CDKS packing |
| Respire | Small-record optimization, 5-ring architecture |
| WhisPIR | BGV-based stateless PIR, non-compact BGV optimization |
| Pirouette | 36-byte queries via blind rotation |
| InsPIRe | InspiRING ring packing, polynomial evaluation |
| NPIR | NTRU packing for high communication rate |
| VIA | DMux-CMux architecture, 3 variants (VIA/VIA-C/VIA-B) |

### Group C — Client-Independent Preprocessing

| Paper | Key Contribution |
|-------|-----------------|
| SimplePIR | 10 GB/s throughput via plain LWE matrix-vector multiply |
| DoublePIR | Compressed hints via LWE-on-LWE composition |
| VeriSimplePIR | Verifiability via SIS commitments + VLHE |
| BarelyDoublyEfficient | First DEPIR from plain LWE in CRS model (theory) |
| IncrementalPIR | Entry-level incremental preprocessing for SimplePIR |

### Group D — Client-Dependent Preprocessing

| Paper | Key Contribution |
|-------|-----------------|
| CK20 | First sublinear-server cPIR (theory), puncturable pseudorandom sets |
| Piano | First practical sublinear-server, PRF-only |
| Plinko | Invertible PRFs, O-tilde(1) updates (theory) |
| TreePIR | 2-server sublinear via wpPRF primitive |
| IncPIR | Incremental hint updates, mutation model |
| IshaiShiWichs | IT-PIR constructions + OWF/SZK lower bounds |
| RMS24 | Dummy subsets, standard correctness |
| SinglePass | Streaming single-pass preprocessing, deterministic |
| WangRen | Tight ST = O(nw) tradeoff (theory) |

### Group X — Variants & Surveys

| Paper | Key Contribution |
|-------|-----------------|
| KeywordPIR | Comparison of SealPIR, MulPIR, Gentry-Ramzan for keyword PIR |
| DistributionalPIR | Distribution-dependent PIR model + compiler framework |
| CGKS Survey | Foundational pedagogical survey of IT-PIR and cPIR theory |
