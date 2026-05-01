# Multi-Server PIR — Exploratory Notes

**Scope:** The main repo (per the root [`research/README.md`](../README.md) taxonomy) covers single-server PIR only. This folder is **exploratory** and tracks selected multi-server schemes — added after a question about asymmetric server overheads surfaced a richer multi-server landscape than the single-server-only scope allowed.

**Status:** Not part of the canonical scheme inventory. Not benchmarked in `docs/reported/data/reported.json`. Notes here may be lighter than mainline notes (some are theory-only papers without implementation).

---

## Why multi-server is excluded from the main repo

Multi-server PIR uses a fundamentally different trust model (k≥2 non-colluding servers, or relaxations thereof) and a different problem class — the "single-server" benchmarking comparison stops being apples-to-apples. The two key facts that motivate this exploratory folder:

1. **Sublinear server work is achievable in single-server PIR via preprocessing alone** (Groups 2a, 2b in main taxonomy) — multi-server is not required for that.
2. **Asymmetric server overhead is a distinct multi-server phenomenon** with no single-server analogue. This was the question that triggered the folder.

---

## Taxonomy: by overhead profile across servers

### Asymmetric (different servers carry different loads)

| Subfolder | Asymmetry kind | Examples |
|-----------|----------------|----------|
| [`asymmetric.role/`](asymmetric.role/) | **Role split** — one server streams DB once (offline), another answers queries (online). The dominant pattern in modern preprocessing 2-server PIR. | CK20, SinglePass, TAPIR, IncPIR |
| [`asymmetric.compute/`](asymmetric.compute/) | **Heterogeneous compute/communication** — protocol explicitly assigns more work to one server (strong/weak split, central+delegates, etc.) | HPIR (Mozaffari NDSS '20), DistributedPIR (CCS '24) |
| [`asymmetric.content/`](asymmetric.content/) | **Non-replicated data** — servers hold different content, not copies of the same DB | Dual-Source SPIR |
| [`asymmetric.trust/`](asymmetric.trust/) | **Trust-model asymmetry** — secure against different fault models per server (e.g., 1 malicious + others honest) | Express |
| [`asymmetric.economic/`](asymmetric.economic/) | **Rational/incentive asymmetry** — non-collusion replaced by economic mechanisms | More-is-Merrier (S&P '24) |

### Symmetric (all servers carry the same load)

| Subfolder | Class | Examples |
|-----------|-------|----------|
| [`symmetric.IT/`](symmetric.IT/) | **Information-theoretic** — unconditional security, no crypto assumptions | CGKS '95, Yekhanin, Efremenko, Dvir-Gopi, Henzinger-Ragavan |
| [`symmetric.dpf/`](symmetric.dpf/) | **DPF / FSS-based** — query distributed via Distributed Point Functions | BGI '15, Riposte |
| [`symmetric.depir/`](symmetric.depir/) | **Doubly-Efficient PIR** — preprocessed DB → polylog server work | BIPW '17, Multi-Server DEPIR Classical |
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

## Notable findings during analysis

- **BIPW vs CHR identification.** The PDF at `cs.ucr.edu/~silas/papers/depir.pdf` (planned as BIPW '17) was actually **Canetti-Holmgren-Richelson '17** ("Towards Doubly Efficient Private Information Retrieval"), the concurrent TCC '17 DEPIR paper. The folder was renamed `bipw_2017/` → `chr_2017/`.
- **Dual-Source SPIR authorship.** Single-authored by **Rémi A. Chou** (UT Arlington), not Wang/Banawan/Ulukus as initially attributed.
- **Cross-cutting primitive: puncturable random sets.** CK20 introduces the abstraction; IncPIR weakens it for incrementality; ITMSPIR_CP makes it *information-theoretic* via the new PMPRS primitive; SinglePass replaces it with permutations entirely. This primitive line is the load-bearing technical thread across the entire role-asymmetric corpus.
- **DPF lineage.** BGI '15 → Riposte '15 (3-server with audit) → Express '21 (2-server, 1 malicious) — each generation halves the trust assumption.
