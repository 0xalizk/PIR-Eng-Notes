# Multi-Server PIR — Exploratory Notes

**Scope:** The main repo (per the root [`research/README.md`](../README.md) taxonomy) covers single-server PIR only. This folder is **exploratory** and tracks selected multi-server schemes — added after a question about asymmetric server overheads surfaced a richer multi-server landscape than the single-server-only scope allowed.

**Status:** Not part of the canonical scheme inventory. Not benchmarked in `docs/reported/data/reported.json`. Notes here may be lighter than mainline notes (some are theory-only papers without implementation).

---

## What multi-server PIR adds (vs. single-server)

Single-server PIR universally pays Ω(N) server work per query in the standard model — a structural floor that comes from "if a server skips position i, the query distribution leaks that i isn't being asked." Multi-server PIR uses k≥2 non-colluding servers (or some relaxation thereof) to **trade trust for asymptotically better resource usage** along three axes that single-server cannot reach:

1. **Communication.** O(N^{1/k}) (CGKS '95) → N^{o(1)} (Yekhanin / Efremenko / Dvir-Gopi) — sub-polynomial total bits, with no FHE.
2. **Server work after preprocessing.** Polylog(N) per query in DEPIR (BIPW '17, CHR '17, Multi-Server DEPIR '25) — the only way to escape the Ω(N) floor.
3. **Asymmetric server overhead.** A distinct phenomenon with no single-server analogue: protocols that deliberately put unequal load on different servers (HPIR's rich/poor split, CK20's offline/online split, DistributedPIR's central+delegates).

The asymmetric-overhead axis is what made this folder worth building — it isn't visible in the single-server taxonomy at all.

---

## Comparison axes

Useful dimensions for cross-comparing the 18 schemes here. The first is the new dimension multi-server adds; the rest are familiar from the single-server side but apply differently.

| Axis | Values | Why it matters |
|------|--------|----------------|
| **Asymmetry profile** | None / Role / Compute / Content / Trust / Economic | Which server bears which load; whether protocol can be deployed on heterogeneous infrastructure (CDN + origin, smartphone + edge, etc.). |
| **Number of servers** k | 2 / 3 / O(log N) / unbounded | More servers → looser per-server load and stronger non-collusion; but more deployment friction. |
| **Trust threshold** t | 1 / k−1 / fractional | Max colluders that preserve privacy. t=1 is "any one honest"; t=k−1 is "all but one corrupt". |
| **Adversary model** | Honest-but-curious / 1-of-k malicious / fully malicious | Whether protocol survives active deviation. Only Express (1-of-2 malicious) and TAPIR (with auth) here go beyond HBC. |
| **Security flavor** | IT / Statistical / Computational(OWF/DDH/RLWE/factoring) / SPIR | IT > statistical > computational; SPIR adds DB privacy. Most papers here are IT or statistical — single-server PIR is mostly computational. |
| **Per-server online work** | Θ(N) / Õ(√N) / polylog(N) | Sublinear requires preprocessing. Polylog is DEPIR territory. |
| **Online communication** | Θ(N) / Õ(√N) / polylog / O(λ log N) | DPF-based schemes get O(λ log N) for the query; downloads can still be Õ(√N). |
| **Preprocessing model** | None / Server-side / Offline-online (CK-style) / DEPIR-encoded DB | Determines cold-start, update cost, and per-client state. |
| **Database mutability** | Static / Re-preprocess / Incremental updates | Only IncPIR and TAPIR support O(Δ) incremental updates. |
| **Operation** | PIR-read / PIR-write / Both | Riposte, Express, DistributedPIR are PIR-write (anonymous mailbox). |
| **Maturity** | Theory-only / Construction-with-pseudocode / Implemented-and-benchmarked | About half the corpus is theory-only. |

---

## Master comparison table

Headline numbers; consult per-scheme notes for parameters, caveats, and concrete benchmarks.

### Asymmetric (heterogeneous server loads)

| Scheme | k | Trust | Security | Server work | Online comm | Preprocessing | Distinguishing feature |
|--------|---|-------|----------|------------|-------------|---------------|-----------------------|
| **HPIR** | 2 | t=1 (HBC) | IT (or factoring under collusion) | Rich Θ(qN) / Poor Θ(N) | Rich qrw / Poor rw | None | Tunable rich/poor compute & comm via multi-secret-sharing |
| **DistributedPIR** | 1 + n workers | HBC | Computational (BGV + Freivalds soundness) | Central reduced from N² to N^{1.5} | O(√N) per round | Per-epoch BGV setup | Workers verify each other; messaging system |
| **CK20** | 2 | t=1 (HBC) | Statistical (2-server) / OWF (online comm) | Offline Õ(N) / Online Õ(√N) | Õ(√N) | Offline server streams DB | Foundational offline/online split; PPS primitive |
| **IncPIR** | 2 | t=1 (HBC) | Computational (OWF) | + O(b·m·log N) per update batch | Õ(√N) | CK-style + incremental | Update cost ∝ changes, not DB size |
| **SinglePass** | 2 | t=1 (HBC) | Statistical | Offline 1× DB pass / Online Õ(√N) | Õ(√N) | Single offline pass (optimal per BIM) | 45–100× faster prep than Checklist; permutation-based |
| **TAPIR** | 2 | t=1 (HBC) + 1 mal abort | Computational (VC + SinglePass) | SinglePass + VC verify | Õ(√N) + auth proofs | Bilateral DB streaming | First 2-server APIR with sublinear comm + comp + updates |
| **DualSourceSPIR** | 2 | t=1 (HBC) | IT SPIR | Θ(N) per server | Capacity (L_i−1)R_i ≤ 1/2 | None | No replication, no shared randomness, no noisy channels |
| **Express** | 2 | t=1 **malicious** | Computational (DPF+SNIP) | Θ(N) per server | O(λ) | None | DPF-write; 1-of-2 malicious; whistleblowing |
| **MoreIsMerrier** | ℓ ≫ k | t=k−1 **rational** | Computational (any cPIR) | Inherits base PIR | Inherits + commitment | Smart contract setup | Non-collusion replaced by Nash equilibrium |

### Symmetric (uniform server loads)

| Scheme | k | Trust | Security | Server work | Online comm | Preprocessing | Distinguishing feature |
|--------|---|-------|----------|------------|-------------|---------------|-----------------------|
| **CGKS '95** | k | t=k−1 | IT | Θ(N) | k·O(N^{1/k}) | None | Foundational; proves single-server IT-PIR impossible |
| **HenzingerRagavan** | 2..s | t=1..s−1 | IT | N^{0.82}, → 1/2 + 1/log s | n^{0.82} | N^{1+o(1)} storage | Breaks BIM '04 storage-time wall after 25 years |
| **BGI** | p | t=p−1 | Computational (PRG) | Θ(N) per server | O(λ log N) per key | None | FSS / DPF foundational primitive |
| **Riposte** | 3 | 1 mal of 3 | Computational (DPF + audit) | Θ(N) | O(λ log N) | None | DPF-write; 3rd auditor server; anonymous broadcast |
| **CHR '17** | 1 | n/a | Computational (HPN) | Polylog(N) | Polylog(N) | N^{1+o(1)} encoded DB | Single-server DEPIR feasibility (concurrent w/ BIPW) |
| **MultiServerDEPIR** | 3 (or O(log N)) | t=k−1 | IT or computational | O(log³ N) (3-server) | Polylog | N · polylog N preproc | Practical DEPIR via DORAM; bypasses FHE blow-up |
| **ScalableMSPIR** | S | t=S−1 | IT | Tradeoff knob: equal / min-bw / min-bottleneck | n^{Õ(1/S)} achievable | Server-side | Generic balancing compiler; storage↔BW dial |
| **ITMSPIR_CP** | 2t | t=1 | IT | Online Õ(√N) | Õ(√N) | Õ(λN) offline | First IT-secure CK-paradigm PIR; PMPRS primitive |
| **TwoServerSublinearSPIR** | 2 | t=1 (HBC) | Statistical SPIR | Online Õ(√N) | Õ(√N) | CK-style + masked hints | First 2-server SPIR with stat. security + sublinear |

---

## Taxonomy: by overhead profile across servers

### Asymmetric (different servers carry different loads)

| Subfolder | Asymmetry kind | Examples |
|-----------|----------------|----------|
| [`asymmetric.role/`](asymmetric.role/) | **Role split** — one server streams DB once (offline), another answers queries (online). The dominant pattern in modern preprocessing 2-server PIR. | CK20, SinglePass, TAPIR, IncPIR |
| [`asymmetric.compute/`](asymmetric.compute/) | **Heterogeneous compute/communication** — protocol explicitly assigns more work to one server (strong/weak split, central+delegates, etc.) | HPIR (NDSS '20), DistributedPIR (CCS '24) |
| [`asymmetric.content/`](asymmetric.content/) | **Non-replicated data** — servers hold different content, not copies of the same DB | Dual-Source SPIR |
| [`asymmetric.trust/`](asymmetric.trust/) | **Trust-model asymmetry** — secure against different fault models per server (e.g., 1 malicious + others honest) | Express |
| [`asymmetric.economic/`](asymmetric.economic/) | **Rational/incentive asymmetry** — non-collusion replaced by economic mechanisms | More-is-Merrier (S&P '24) |

### Symmetric (all servers carry the same load)

| Subfolder | Class | Examples |
|-----------|-------|----------|
| [`symmetric.IT/`](symmetric.IT/) | **Information-theoretic** — unconditional security, no crypto assumptions | CGKS '95, Henzinger-Ragavan |
| [`symmetric.dpf/`](symmetric.dpf/) | **DPF / FSS-based** — query distributed via Distributed Point Functions | BGI '15, Riposte |
| [`symmetric.depir/`](symmetric.depir/) | **Doubly-Efficient PIR** — preprocessed DB → polylog server work | CHR '17, Multi-Server DEPIR |
| [`symmetric.preprocessing/`](symmetric.preprocessing/) | **Other preprocessing models** — not strictly DEPIR but with offline phase | Scalable MSPIR, IT-MSPIR-CP, 2-Server Sublinear SPIR |

---

## Conventions

- Inherited from main repo: lowercase folders (`<scheme>_<year>/`), capitalized notes files (`<Scheme>_<year>_notes.md`), original PDF filenames.
- **No `reported.json` entries** — this folder is descriptive, not benchmarked.
- **No auto-audit** — the auto-audit rule in main `CLAUDE.md` doesn't apply to this exploratory folder.

---

## File index

### Asymmetric (different servers carry different loads)

| Scheme | Year | Asymmetry | Notes |
|---|---|---|---|
| HPIR | 2020 | Compute/comm (rich/poor servers, multi-secret-sharing) | [HPIR_2020_notes.md](asymmetric.compute/hpir_2020/HPIR_2020_notes.md) |
| DistributedPIR | 2024 | Hub-and-spoke (central server delegates to client-workers, Freivalds verification) | [DistributedPIR_2024_notes.md](asymmetric.compute/distributedpir_2024/DistributedPIR_2024_notes.md) |
| CK20 | 2020 | Role (offline server: Õ(n) once / online server: Õ(√n) per query) | [CK_2020_notes.md](asymmetric.role/ck_2020/CK_2020_notes.md) |
| IncPIR | 2022 | Role + incremental updates | [IncPIR_2022_notes.md](asymmetric.role/incpir_2022/IncPIR_2022_notes.md) |
| SinglePass | 2024 | Role (single-pass offline preprocessing) | [SinglePass_2024_notes.md](asymmetric.role/singlepass_2024/SinglePass_2024_notes.md) |
| TAPIR | 2025 | Role + authentication (vector-commitment-based APIR) | [TAPIR_2025_notes.md](asymmetric.role/tapir_2025/TAPIR_2025_notes.md) |
| DualSourceSPIR | 2024 | Content (servers hold independent non-replicated DBs; binary-adder MAC) | [DualSourceSPIR_2024_notes.md](asymmetric.content/dualsourcespir_2024/DualSourceSPIR_2024_notes.md) |
| Express | 2021 | Trust (1-of-2 malicious-server tolerance via DPF + audit SNIP) | [Express_2021_notes.md](asymmetric.trust/express_2021/Express_2021_notes.md) |
| MoreIsMerrier | 2024 | Economic/rational (collusion deterrence via bulletin board + payments) | [MoreIsMerrier_2024_notes.md](asymmetric.economic/moreismerrier_2024/MoreIsMerrier_2024_notes.md) |

### Symmetric (all servers carry the same load)

| Scheme | Year | Class | Notes |
|---|---|---|---|
| CGKS | 1995 | IT (foundational k-server PIR; single-server impossibility) | [CGKS_1995_notes.md](symmetric.IT/cgks_1995/CGKS_1995_notes.md) |
| HenzingerRagavan | 2026 | IT (2-server quasilinear space + n^{0.82} time, breakthrough on BIM '04) | [HenzingerRagavan_2026_notes.md](symmetric.IT/henzinger_ragavan_2026/HenzingerRagavan_2026_notes.md) |
| BGI | 2015 | DPF/FSS foundational (Function Secret Sharing) | [BGI_2015_notes.md](symmetric.dpf/bgi_2015/BGI_2015_notes.md) |
| Riposte | 2015 | DPF-write (3-server anonymous messaging) | [Riposte_2015_notes.md](symmetric.dpf/riposte_2015/Riposte_2015_notes.md) |
| CHR | 2017 | DEPIR (single-server feasibility from HPN; concurrent with BIPW '17) | [CHR_2017_notes.md](symmetric.depir/chr_2017/CHR_2017_notes.md) |
| MultiServerDEPIR | 2025 | DEPIR (3-server practical via DORAM; bypasses single-server FHE blow-up) | [MultiServerDEPIR_2025_notes.md](symmetric.depir/multiserverdepir_2025/MultiServerDEPIR_2025_notes.md) |
| ScalableMSPIR | 2025 | Preprocessing (3 constructions + balancing compiler; tradeoff knob) | [ScalableMSPIR_2025_notes.md](symmetric.preprocessing/scalablemspir_2025/ScalableMSPIR_2025_notes.md) |
| ITMSPIR_CP | 2024 | IT preprocessing (PMPRS primitive; 2t-server unconditional CK-paradigm) | [ITMSPIR_CP_2024_notes.md](symmetric.preprocessing/itmspir_cp_2024/ITMSPIR_CP_2024_notes.md) |
| TwoServerSublinearSPIR | 2025 | SPIR upgrade on CK20 (statistical security + DB privacy) | [TwoServerSublinearSPIR_2025_notes.md](symmetric.preprocessing/twoserversublinearspir_2025/TwoServerSublinearSPIR_2025_notes.md) |

**Total**: 18 schemes (9 asymmetric, 9 symmetric).

---

## Notable cross-cutting threads

- **Puncturable random sets** are the load-bearing primitive across the role-asymmetric line: CK20 introduces it (PPS); IncPIR weakens it for incremental updates; ITMSPIR_CP makes it *information-theoretic* via the new PMPRS primitive; SinglePass replaces it with permutations entirely. TAPIR layers vector commitments on top.
- **DPF lineage**: BGI '15 (foundational FSS) → Riposte '15 (3-server with audit) → Express '21 (2-server, 1 malicious) — each generation halves the trust assumption.
- **DEPIR practicality gap**: CHR '17 + BIPW '17 established feasibility; LMW '23 brought it to single-server under standard RLWE; Multi-Server DEPIR '25 brought it to *concretely* fast (≈1 ms on 8 GB) by trading single-server for 3-server + DORAM.
- **The BIM '04 wall**: the IT preprocessing lower bound that stood for 25 years was only just broken by Henzinger-Ragavan '26 via a compact polynomial-derivative data structure.

---

## Notable findings during analysis

- **BIPW vs CHR identification.** The PDF at `cs.ucr.edu/~silas/papers/depir.pdf` (planned as BIPW '17) was actually **Canetti-Holmgren-Richelson '17** ("Towards Doubly Efficient Private Information Retrieval"), the concurrent TCC '17 DEPIR paper. The folder was renamed `bipw_2017/` → `chr_2017/`.
- **Dual-Source SPIR authorship.** Single-authored by **Rémi A. Chou** (UT Arlington), not Wang/Banawan/Ulukus as initially attributed.
