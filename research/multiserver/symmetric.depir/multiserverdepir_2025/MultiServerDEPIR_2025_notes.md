## Multi-Server DEPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Multi-Server Doubly Efficient PIR in the Classical Model and Beyond](https://eprint.iacr.org/2024/829) (ePrint 2024/829, 2024–2025) |
| **Authors** | Arthur Lazzaretti, Zeyu Liu, Ben Fisch (Yale); Peihan Miao (Brown); Charalampos Papamanthou (Yale)&#8201;[^1] |
| **Archetype** | Construction (theory-only) + Feasibility + Building-block (DORAM-to-PIR reduction). Three multi-server DEPIR constructions, no implementation, asymptotic-only analysis.&#8201;[^2] |
| **Asymmetry profile** | **Symmetric across servers** — every server holds the same `~DB`, runs the same `Answer` algorithm, and faces the same per-query load. The number of servers `k` ranges from 3 (DORAM scheme) to `o(log N)` (recursive scheme) to `Õ(log N)` (first scheme).&#8201;[^3] |
| **Security model** | Information-theoretic against any subset of `≤ k−1` non-colluding servers. Theorems 2 & 3 use the standard non-communicating multi-server PIR definition (Def. 1). Theorem 4 uses a strengthened definition (Def. 2) that allows servers to communicate online and maintain global state, with privacy of the client's index against any `k−1` colluding servers.&#8201;[^4] |
| **Additional assumptions** | None for the IT constructions in §4–§5. Theorem 4 inherits whatever assumption the underlying DORAM uses: GigaDORAM (computational, OWF-style) gives `O(log³ N)` query, and MetaDORAM (information-theoretic) gives similar asymptotics; none rely on FHE or DDH/LWE.&#8201;[^5] |
| **Correctness model** | Deterministic for §4–§5 (perfect Lagrange interpolation over `F_q`); inherited from DORAM in §6 (statistical, `1 − negl(λ)`).&#8201;[^6] |
| **Rounds (online)** | §4 and §5: 1 round (client → all `k` servers → client). §6: depends on DORAM — GigaDORAM and MetaDORAM are constant-round but require server-server communication during the read.&#8201;[^7] |
| **Record-size regime** | Bit databases `DB ∈ {0,1}^N` throughout; word-size extension is implicit (each entry mapped to one `F_q` value via the polynomial interpolation lemma).&#8201;[^8] |

[^1]: Title page (p. 1): "Multi-Server Doubly Efficient PIR in the Classical Model and Beyond. Arthur Lazzaretti¹, Zeyu Liu¹, Ben Fisch¹, Peihan Miao², Charalampos Papamanthou¹. ¹Yale University ²Brown University." Authors listed alphabetically among students, then advisors.
[^2]: Abstract (p. 1) and §1.1 (p. 4): "we discuss two different settings for multi-server DEPIR" — the non-colluding/non-communicating setting yields Theorems 2 and 3, while the communicating/stateful setting yields Theorem 4. No implementation; all results are asymptotic.
[^3]: Table 1 (p. 4): Theorem 2 uses `Õ(log N)` servers, Theorem 3 uses `o(log N)`, Theorem 4 uses 3 servers. All servers in every construction are interchangeable (run identical `Answer`).
[^4]: §2.1 Definition 1 (p. 7–8) — privacy: `Pr[Query(i₁,j) = q] = Pr[Query(i₂,j) = q]` for every server `j` (perfect privacy per server). Definition 2 (p. 9) — game-based privacy of any view of `≤ k−1` servers.
[^5]: §6 (p. 20, 23): "While GigaDORAM is based on computational privacy, we can also use other DORAM constructions with information-theoretic privacy achieving similar asymptotics (e.g., [24])." Reference [24] = MetaDORAM (Falk, Noble, Ostrovsky 2024).
[^6]: §4 Theorem 2 proof (p. 13–14) and §5 Theorem 3 proof (p. 17–19): correctness reduces to "`f(0) = P(encode(i))`" — exact Lagrange interpolation. §6 Theorem 4 (p. 22–23): correctness inherited from DORAM, hence `≥ 1 − negl(λ)` per Def. 2.
[^7]: Fig. 1 (p. 14) and Fig. 2 (p. 18): client sends one query to each server, each server returns one answer — 1 online round. Fig. 4 (p. 22) DORAM-based: `Read([DB'], [i])` is invoked by the `k` servers as an MPC sub-protocol, requiring online server-server communication.
[^8]: §1 (p. 2) and §2.1 Def. 1 (p. 7): "client holds an index `i ∈ [N]`, and `k` non-colluding servers hold the same database `DB ∈ {0,1}^N`." Multi-bit retrieval handled implicitly via the encoding `encode : [N] → F_p^m`.

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** `k` | Theorem 2: `k = dm + 1 = Õ(log N) = O(log N · log log N / log log log N)`. Theorem 3: `k = m·d/L = o(log N)` (recursive, with `L` derivative levels). Theorem 4: `k = 3` (DORAM-based).&#8201;[^9] |
| **Privacy threshold** | Any `k − 1` colluding servers learn nothing about the client index. For Theorems 2 & 3, privacy is per-server (each individual server's view is uniform on `F_q^m`); since the `q_j` are independent, this extends to any `k−1` collusion. For Theorem 4, Def. 2 explicitly games this over `k−1` server views.&#8201;[^10] |
| **Trust model** | Honest-but-curious, **non-colluding**. The paper acknowledges this is the standard relaxation that distinguishes multi-server from single-server DEPIR; §7 sketches replacing it with a *rational-server* assumption à la Gong et al. [35].&#8201;[^11] |
| **Server replication** | Yes for §4–§5 — every server stores the same preprocessed polynomial `~P` (and the same derivative tables in §5). For §6, the database is **secret-shared** across the `k` servers via DORAM `Init`, so each server holds a different share `~DB_j = [DB']_j` of the same encoded database.&#8201;[^12] |
| **Server-server communication** | None at query time for §4–§5 (the standard multi-server PIR setting). Required at query time for §6 (DORAM-based) — servers run a `Read` MPC together. Offline communication to synchronise database content is permitted in all settings.&#8201;[^13] |
| **Relationship to DEPIR motivation** | Single-server DEPIR (Lin-Mook-Wichs STOC '23) achieves `N^{o(1)}` query time but requires algebraic homomorphic encryption with `~100×` server-storage blowup that makes it impractical. The paper's contribution is to leverage non-collusion to remove the FHE while preserving DEPIR efficiency, bringing storage overhead down toward `N^{1+o(1)}` (or `N · polylog N` in §6).&#8201;[^14] |

[^9]: §4 Theorem 2 (p. 13): "Number of servers: `Õ(log(N)) = O(log(N) log log(N) / log log log(N))`." §5 Theorem 3 (p. 17): "Number of servers: `o(log(N))`." §6 (p. 20): "with only 3 servers, we can achieve information-theoretic PIR with `O(log³(N))` online runtime and communication."
[^10]: §4 privacy proof (p. 15): "since `~v` is sampled uniformly at random from `F_q^m`, `j·~v + encode(i)` is indistinguishable from a uniformly randomly drawn vector from `F_q^m`." §2.1 Def. 2 (p. 9): "the new game asks the adversary to distinguish the view of any subset of the servers (up to `k−1` servers)."
[^11]: §7 "Rational instead of honest servers" (p. 24): "as all prior works [78,8,30], our work assumes that the servers do not collude. … one interesting direction is to relax this assumption further. Instead of assuming all the servers to be semi-honest and not to collude with each other, can we relax this assumption to assume the servers to be rational players?" Cites Gong et al. [35].
[^12]: §4 Fig. 1 (p. 14): `Preprocess(DB)` returns `~DB = ~P` to *every* server. §6 Fig. 4 (p. 22): `Preprocess` step 1: "Server `j ∈ [k]` obtains the share `[DB]_j`," step 2: "All `k` servers together run `[DB'] ← Init([DB])`."
[^13]: §1 (p. 5): "while the standard multi-server PIR setting enforces non-communication between servers, offline communication is still required to ensure synchronization between databases." §6 (p. 20): "Given the relaxation on communication and statefulness …" — Theorem 4 is the only construction needing online server-server communication.
[^14]: §1 (p. 3): single-server DEPIR by Lin et al. [57] uses Algebraic Homomorphic Encryption; "the scheme by Lin et al., implemented as is, still incurs astronomical empirical costs despite their very nice asymptotic efficiencies." §1.1 (p. 4): "Since our constructions do not rely on any heavy cryptographic tools (and most constructions require no cryptographic tools at all), our work is notably empirically much more efficient in practice than the work by Lin et al."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Woodruff–Yekhanin (geometric multi-server PIR, 2005) for the polynomial-evaluation query template; Beimel–Ishai–Malkin (Reducing Servers' Computation in PIR, J. Crypt. 2004) for the multi-server preprocessing model; Kedlaya–Umans (polynomial preprocessing, SICOMP 2011) and Bhargava–Ghosh–Kumar–Mohapatra (Fast Multivariate Multipoint Evaluation, FOCS 2022) for the fast-evaluation data structures; Lin–Mook–Wichs (STOC '23) for the polynomial-preprocessing PIR template; Lu–Ostrovsky DORAM (TCC 2013) and GigaDORAM (USENIX '23) for §6.&#8201;[^15] |
| **What changed** | (1) Replaces FHE (used by single-server DEPIR [57]) with **polynomial-evaluation queries over `F_q`**, exploiting non-collusion to hide the index without any encryption. (2) Substitutes the Kedlaya–Umans preprocessing of [57] with the Bhargava et al. [10] preprocessing, which works over small-characteristic fields (`p = d^{o(1)}`) and shrinks both the preprocessing time and the number of servers. (3) Introduces the recursive *L-level derivative* construction (§5) to push servers below `log N`. (4) Observes that DORAM directly yields PIR, getting `O(log³ N)` query with 3 servers. |
| **Superseded by** | Concurrent and follow-up work by Ghoshal–Li–Ma–Dai–Shi [30, 31] tightens some asymptotics (`N^{1+o(1)}` preprocessing with `ω(1)` servers in [31]), but does not cover the communicating-server setting that yields Theorem 4. The DORAM-based scheme of §6 dominates everything asymptotically.&#8201;[^16] |
| **Concurrent work** | [30] (Ghoshal et al., ePrint 2024/765) — same problem (IT multi-server DEPIR), different parameter trade-offs; achieves `poly(N)` preprocessing with `polylog(N)` servers and `polylog(N)` online cost. The paper's Theorem 2 obtains better preprocessing time at slightly worse query time. See Appendix A.&#8201;[^17] |

[^15]: §3 (p. 10–12) restates Woodruff–Yekhanin [78] as the starting point. §1 (p. 2) credits Beimel et al. [7,8] for the multi-server preprocessing model. §2.2 Theorem 1 (p. 10) restates Bhargava et al. [10] Thm. 6.1 as the polynomial-preprocessing primitive. §1 (p. 3): "Lin et al. [57] which makes use of a polynomial preprocessing algorithm by Kedlaya and Umans [47]." §6 (p. 20–23) uses Lu–Ostrovsky DORAM [62] and GigaDORAM [25].
[^16]: Appendix A (p. 31): "newer version of [30] was after the original version and our original version is [31]. They achieve close to `N^{1+o(1)}` preprocessing time and storage, close to `N^{o(1)}` online time and communication, with `ω(1)` servers. … While this improves upon their older result, it is still dominated by our DORAM-based constructions."
[^17]: §1.1 "Comparison with concurrent and independent work" (p. 6) and Appendix A (p. 31): "their work does not cover the communicating server setting in Theorem 6 [Theorem 4 in this version], that is unique to our work."

### Core Idea

The paper extracts DEPIR — server preprocessing with `N^{1+o(1)}` time/storage and `N^{o(1)}` per-query work — into the multi-server setting *without* heavy cryptography. The key observation is that non-collusion already hides the client's index, so encryption can be replaced by a Woodruff–Yekhanin-style polynomial query: the client sends each server `j` the value `q_j = j · ~v + encode(i)` for a uniformly random `~v ∈ F_q^m`, and each server evaluates a *preprocessed* multivariate polynomial `~P` at `q_j`. The client recovers `DB[i] = P(encode(i)) = f(0)` from the `k` returned evaluations via Lagrange interpolation. Three constructions trade servers vs. preprocessing: (i) `Õ(log N)` servers with `N^{1+o(1)}` preprocessing (Theorem 2); (ii) `o(log N)` servers via `L`-level derivatives at the cost of `N^{2+o(1)}` preprocessing (Theorem 3); (iii) just 3 servers with `N · polylog N` preprocessing and `O(log³ N)` query, by reducing PIR to Distributed ORAM (Theorem 4). Construction (iii) dominates asymptotically and concretely (≈1 ms per query on an 8 GB DB by GigaDORAM benchmarks).&#8201;[^18]&#8201;[^19]

[^18]: §1.1 "New PIR schemes for non-colluding, non-communicating servers" (p. 4) and §3–§4 (p. 10–13). The exact Lagrange recovery is laid out in Fig. 1 (p. 14): `Reconstruct` interpolates `f` of degree `dm` from `k = dm+1` evaluations and outputs `f(0)`.
[^19]: §6 "Realization and efficiency of DORAM" (p. 23): "using GigaDORAM [25], we achieve quasi-linear preprocessing time, and `O(log³(N))` online time and communication. … this in fact allows us to make one PIR query against 8GB of database with only about 1ms, according to the benchmarks in [25]."

### Formal Definitions

#### Definition 1 — Multi-server DEPIR with server preprocessing (non-communicating)

A `k`-server, server-preprocessing PIR is a 4-tuple of PPT algorithms&#8201;[^20]:
- `Preprocess: DB ∈ {0,1}^N → ~DB` — runs once, server-side.
- `Query: (i ∈ [N], j ∈ [k]) → q_j` — client builds the `j`-th server's query.
- `Answer: (~DB, q_j) → a_j` — each server computes its answer.
- `Reconstruct: (a_1, …, a_k) → {0,1}` — client recovers `DB[i]`.

**Correctness:** `Pr[Reconstruct(i, a_1, …, a_k) = DB[i]] = 1`.
**Privacy (per server):** `Pr[Query(i_1, j) = q] = Pr[Query(i_2, j) = q]` for every `i_1, i_2 ∈ [N]`, every `j ∈ [k]` and every `q` in the output space.
**Doubly efficient:**
1. Preprocessing time and `|~DB|` are both `N^{1+o(1)}`.
2. Total runtime of `k · Query + k · Answer + Reconstruct` is `N^{o(1)}`, and total communication `|q_1| + … + |q_k| + |a_1| + … + |a_k|` is `N^{o(1)}`.

[^20]: §2.1 Definition 1 (p. 7–8): full PPT-algorithm definition, correctness, privacy, and the "doubly efficient" property splitting preprocessing-efficient from query-efficient.

#### Definition 2 — Communicating, stateful multi-server DEPIR

Servers may communicate online and maintain *global* state. The four procedures become&#8201;[^21]:
- `Preprocess(DB) → (~DB_j)_{j∈[k]}` — server `j` holds its own piece `~DB_j`.
- `Query(i) → q_1, …, q_k` — produces `k` queries.
- `Answer((~DB_j)_j, (q_j)_j) → (a_j)_j` — interactive between the `k` servers; *implicitly* updates each `~DB_j`.
- `Reconstruct(a_1, …, a_k) → {0,1}`.

**Correctness:** `Pr[Reconstruct(i, a_1, …, a_k) = DB[i]] ≥ 1 − negl(λ)` (statistical, due to DORAM).
**Privacy (game-based):** for any two query sequences `(i_{1,1}, …, i_{1,w})` and `(i_{2,1}, …, i_{2,w})`, and any `j ∈ [k]`, `View_j(1) ≈ View_j(2)`. The view of any `≤ k−1` servers is indistinguishable across the two adversarial sequences.
**Doubly efficient:** same `N^{1+o(1)}` preprocessing and `N^{o(1)}` query asymptotics as Def. 1, but with the new interfaces.

The paper notes this is a strict relaxation (servers communicate, state is global) but argues it matches updatable PIR's existing requirements: any PIR with mutable databases already needs offline server-server sync, and "global state" is just the database itself — no per-client state.&#8201;[^22]

[^21]: §2.1 Definition 2 (p. 9).
[^22]: §1.1 "New PIR schemes in the multi-server setting with communication" (p. 5): "since PIR schemes assume the databases on all servers to be identical, communication is required at least to synchronize the data between all servers. The difference is that in this setting, communication is necessary at query time. Similarly, the cost of (global) statefulness is also minor, since most use cases of PIR consider dynamic databases and require periodic updates."

### Storage and Preprocessing Concretely

| Construction | Servers `k` | `~DB` storage per server | Preprocess time | Query time | Comm |
|--------------|-------------|--------------------------|-----------------|------------|------|
| §3 W&Y (no preprocessing baseline) | `k < p < 2k` | DB unchanged | — (linear-time interpolation) | `O(N / log^r N)` for constant `r` | `O(k² log k · N^{1/(2k−1)})` |
| §4 Theorem 2 (first scheme) | `Õ(log N)` | `N^{1+o(1)}` | `N^{1+o(1)}` | `N^{o(1)}` | `N^{o(1)}` |
| §5 Theorem 3 (recursive) | `o(log N)` | `N^{2+o(1)}` | `N^{2+o(1)}` | `N^{o(1)}` | `N^{o(1)}` |
| §6 Theorem 4 (DORAM, communicating) | 3 | `T_Init = N · polylog N` (per server, secret-shared) | `T_Init` | `T_Read = O(log³ N)` | `O(log³ N)` |

Concrete parameter choice for Theorem 2&#8201;[^23]:
- `d^m = N` and `d = log log N = 2^{log log log N}`, giving `m = O(log N / log log log N)`.
- `p = O(log log N) = d^{o(1)}` (this is the small-characteristic constraint imposed by Bhargava et al.'s preprocessing).
- `α` set so `p^α = q ≥ k+1`, giving `α = O(log_p k) = O(log N)^{1 / log log log N}`.
- `k = m · d = Õ(log N)`.
- Preprocessing of one polynomial: `(αdp)^m · 4^m · poly(α, d, m, p)`. Each factor evaluates to `N^{o(1)}` except `d^m = N`, so a single polynomial costs `N^{1+o(1)}`. Multiplying by `dm + 1 = polylog N` servers gives total polynomial preprocessing `N^{1+o(1)}`. Adding the `N · polylog N` interpolation step (Lemma 1) leaves `N^{1+o(1)}` overall.
- Server storage `|~DB| = N^{1+o(1)}`; this is a substantial improvement over single-server DEPIR's reported `~100×` blow-up.

Concrete parameter choice for Theorem 3 (recursive)&#8201;[^24]:
- `d^d = N` ⇒ `d = log N / W(log N)` (Lambert W function), `m = d`, `L = log N / W(log N)^{1.5}`.
- `p = O(L)` (smallest prime ≥ `L+1` by Bertrand's postulate), `α = 1 + o(1)`.
- Servers: `k = m · d / L = O(log N / √W(log N)) = o(log N)`.
- Preprocessing time per polynomial: `N^{2+o(1)}`. Number of polynomials (across `L` derivative levels): `m^L + 1 = O(N^{1/√W(log N)}) = N^{o(1)}`. Total preprocessing `N^{2+o(1)}`.
- Server storage scales the same: `N^{2+o(1)}`.

Concrete parameter notes for Theorem 4 (DORAM)&#8201;[^25]:
- 3 servers; database secret-shared (additive secret sharing) across them per Init.
- Preprocessing inherits `T_Init` from the chosen DORAM. GigaDORAM: quasi-linear `N · polylog N` Init.
- Per-query online: 3 servers run a constant-round MPC `Read` together, `O(log³ N)` per server in time and communication.
- Updates: DORAM supports `Write` natively, so updatable PIR is free at `O(log³ N)` per update.

[^23]: §4 efficiency proof (p. 15–16): "We set `d^m = N` and `d = log log(N) = 2^{log log log(N)}` … we set `p = O(log log(N)) = d^{o(1)}` … `α = O(log_p k)`. Number of servers: `k = m·d = O(log N · log log N / log log log N) = Õ(log N)`. … the total preprocessing time for a single function is `N^{1+o(1)}`. For `dm+1 = polylog(N)` servers, the total polynomial preprocessing time is thus `N^{1+o(1)}`. … the interpolation time is `N · polylog(N)`."
[^24]: §5 efficiency proof (p. 17–19): full parameter setting and `m^L + 1 = O(N^{1/√W(log N)}) = N^{o(1)}` count of derivative polynomials, leading to `N^{2+o(1)}` total preprocessing.
[^25]: §6 (p. 20–23): "`O(log³(N))` online runtime and communication with quasi-linear preprocessing." Footnote 4 (p. 20): "This can be further reduced to only `ω(log² N)` [25] but we use `O(log³(N))` for simplicity."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | None for §4–§5 (information-theoretic). §6: depends on chosen DORAM — GigaDORAM is computational (requires PRF/OWF for ciphertext rerandomisation); MetaDORAM is information-theoretic.&#8201;[^26] |
| **Encoding scheme(s)** | (1) `encode : [N] → F_q^m` — deterministic `d`-ary encoding `i = Σ_j ~i_j · d^{j−1}` (per [57] Claim 4.2.1). (2) Multivariate polynomial interpolation: a degree-`d`-per-variable, `m`-variate polynomial `P : F_q^m → F_q` such that `P(encode(i)) = DB[i]`. (3) Polynomial preprocessing `~P ← PolyPreProcess(P)` per Bhargava et al. Theorem 1. |
| **Ring / Field** | `F_q` where `q = p^α` for prime `p` and `α ∈ Z⁺`. The constraint `p = d^{o(1)}` (small characteristic) is essential — this is where the construction departs from Lin–Mook–Wichs, who use Kedlaya–Umans (any field). |
| **Key structure** | None. No long-lived keys; per query the client samples fresh `~v ← F_q^m`. Pure "secret-share via random offset" — `q_j = j · ~v + encode(i)` looks uniform on `F_q^m` to any single server. |
| **Correctness condition** | Deterministic. (i) `f : F_q → F_q` defined by `f(λ) = P(encode(i) + λ ~v)` has degree `≤ dm`, so `dm + 1` distinct evaluations suffice (Lemma 1 in [57] / Lemma 1 here). (ii) Lemma 3 (§5) generalises: `k` evaluations of `f` plus `k` first derivatives plus … plus `k` `L`-th derivatives uniquely determine a polynomial of degree `k(L+1) − 1`. (iii) Field characteristic must satisfy `p ≥ L + 1` for the derivative-based version.&#8201;[^27] |

[^26]: §6 (p. 23): "While GigaDORAM is based on computational privacy, we can also use other DORAM constructions with information-theoretic privacy achieving similar asymptotics (e.g., [24])."
[^27]: §3 Lemma 2 (p. 12), §5 Lemma 3 (p. 16). Statement of Lemma 3 requires "`F_q` has characteristics `p` greater than or equal to `L + 1`."

### Key Data Structures

- **Database polynomial `P : F_q^m → F_q`** of individual degree `< d` per variable — interpolates the bit database via `P(encode(i)) = DB[i]`.&#8201;[^28]
- **Preprocessed polynomial `~P`** (output of `PolyPreProcess(P)`) — a data structure over `F_q^m` that supports point evaluation in `4^m · poly(α, d, m, p) = N^{o(1)}` time. Storage `N^{1+o(1)}`.
- **Derivative polynomials `P_{x_{z₁},…,x_{z_ℓ}, ℓ}` for ℓ ∈ [L], (z_1, …, z_ℓ) ∈ [m]^ℓ** (Theorem 3 only) — `m^L + 1 = N^{o(1)}` polynomials in total, each preprocessed via `PolyPreProcess`. Stored alongside `~P`.
- **Per-query random vector `~v ∈ F_q^m`** — sampled uniformly per query.
- **Per-server query `q_j = j · ~v + encode(i) ∈ F_q^m`** — `m` field elements, totalling `m · log q = polylog N` bits.
- **Per-server answer `a_j = ~P(q_j)`** for Theorem 2; for Theorem 3 it's `~P(q_j)` plus all `~P_{z_1,…,z_ℓ, ℓ}(q_j)` for `ℓ ∈ [L]` and `(z_1, …, z_ℓ) ∈ [m]^ℓ`. Each answer is a single field element (or `m^L + 1 = N^{o(1)}` field elements in §5).&#8201;[^29]
- **DORAM-shared database `(~DB_j)_j = ([DB']_j)_j`** (Theorem 4) — additive secret shares of an ORAM-encoded database, one share per server.

[^28]: §2.3 Lemma 1 (Lemma B.1 of [57], p. 10): given `d^m` values `{y_{x_1, …, x_m}}`, one can interpolate a polynomial of individual degree `< d` in time `O(d^m · m · poly log q) = N · polylog N`.
[^29]: §4 Fig. 1 step Answer (p. 14) and §5 Fig. 2 step Answer (p. 18).

### Database Encoding

- **Representation:** Bit database `DB ∈ {0,1}^N` is interpolated as a multivariate polynomial `P` over `F_q` via the `d`-ary encoding `encode(i) = (~i_1, …, ~i_m) ∈ F_q^m` with `i = Σ ~i_j · d^{j−1}` and `d^m ≥ N`.
- **Record addressing:** `DB[i] = P(encode(i))`. Server-side this becomes `~P(encode(i))`.
- **Preprocessing required:** (1) interpolation `Lemma 1` — `O(N · polylog N)`. (2) polynomial preprocessing `PolyPreProcess` — `(αdp)^m · 4^m · poly(α, d, m, p)` per polynomial, set to `N^{1+o(1)}` overall.
- **Record size equation:** Each `DB[i]` is one bit; the encoding lifts it to one element of `F_p` (Theorem 1's image is `F_q`, but `P` outputs values in `F_p ⊂ F_q`).&#8201;[^30]

[^30]: §2.2 Theorem 1 (p. 10): "for an `m`-variate polynomial `P : F_q^m → F_q` … there exists an algorithm `PolyPreProcess` …" Outputs `~P(~x) = P(~x)`.

### Protocol Phases

#### §4 First construction (Theorem 2)

| Phase | Actor | Operation | Communication | Frequency |
|-------|-------|-----------|---------------|-----------|
| Setup | Server | Interpolate `P` from DB; `~P ← PolyPreProcess(P)`; store `~DB = ~P` | — (every server gets identical `~P`) | Once |
| Query Gen | Client | Sample `~v ← F_q^m`; for `j ∈ [k]`, compute `q_j = j · ~v + encode(i)` | `k · m · log q = N^{o(1)}` ↑ | Per query |
| Answer | Each server `j` | Return `a_j = ~P(q_j)` | `k · log q = polylog N` ↓ | Per query |
| Reconstruct | Client | Interpolate `f : F_q → F_q` of degree `dm` through points `(j, a_j)` for `j ∈ [k]`; output `f(0)` | — | Per query |

#### §5 Recursive construction (Theorem 3)

Same `Preprocess` plus, for each `ℓ ∈ [L]` and `(z_1, …, z_ℓ) ∈ [m]^ℓ`, compute `P_{x_{z_1},…,x_{z_ℓ}, ℓ} = ∂^ℓ P / ∂x_{z_1} … ∂x_{z_ℓ}` and `~P_{…} ← PolyPreProcess(P_{…})`. `Query` is identical. `Answer` returns all `~P_{…}(q_j)` values. `Reconstruct` uses Eq. (1) and Lemma 3: chain rule recovers `f^ℓ(λ_j)` for each derivative level, then a degree-`dm` polynomial is determined from `k` points × `(L+1)` derivative orders.&#8201;[^31]

[^31]: §5 Fig. 2 (p. 18) and Eq. (1): `f^ℓ(j) = Σ_{(z_1,…,z_ℓ)} (∂^ℓ P / ∂x_{z_1}…∂x_{z_ℓ})(j·~v + encode(i)) · ∏_{i ∈ [ℓ]} ~v_{z_i}`.

#### §6 DORAM-based construction (Theorem 4)

| Phase | Actor | Operation | Communication | Frequency |
|-------|-------|-----------|---------------|-----------|
| Setup | All `k` servers | `[DB'] ← Init([DB])` (additive shares of DB) — server `j` stores `~DB_j = [DB']_j` | DORAM-internal (offline) | Once + on every DB mutation |
| Query | Client | Secret-share `i` into `[i]_j`; send `q_j = [i]_j` to server `j` | `O(N^{o(1)})` ↑ | Per query |
| Answer | All `k` servers | Run `[DB[i]], [DB'] ← Read([DB'], [i])` jointly (DORAM MPC); server `j` outputs `a_j = [DB[i]]_j` | `O(log³ N)` server-server (per server) + `O(log³ N)` ↓ to client | Per query |
| Reconstruct | Client | Add the `k` shares `a_1, …, a_k` to recover `DB[i]` | — | Per query |

### Communication Breakdown

Theorem 2&#8201;[^32]:
- Query (↑): `k · m · log q = O(log N · log log N / log log log N · log N · log log log N · …) = polylog N = N^{o(1)}`.
- Answer (↓): `k · log q = polylog N = N^{o(1)}`.

Theorem 3: same shapes — `m · log q` per query, total `N^{o(1)}` answer (since `m^L + 1 = N^{o(1)}` field elements per server response).

Theorem 4: `O(log³ N)` per direction, dominated by DORAM `Read` cost. Concretely, GigaDORAM benchmarks give ≈1 ms per query on 8 GB.

[^32]: §4 efficiency proof (p. 16): "The query size is simply `m` `F_q` elements, and thus `polylog(N)`. The answer size is bounded by the total runtime of all the servers, which is thus `N^{o(1)}`. Thus, the total online communication is also `N^{o(1)}`."

### Correctness Analysis

#### Option C — Deterministic Correctness (Theorems 2, 3)

- §4 (Theorem 2): the function `f(λ) = P(encode(i) + λ · ~v)` is a univariate polynomial of degree `dm` in `λ`. The client sees `dm + 1 = k` evaluations `f(j) = ~P(q_j) = P(q_j)`. Lagrange interpolation recovers `f`, and `f(0) = P(encode(i)) = DB[i]`.&#8201;[^33]
- §5 (Theorem 3): the client sees `k` evaluations of `f` plus `k` evaluations of each derivative `f^ℓ` for `ℓ ∈ [L]`. By Lemma 3, this uniquely determines a polynomial of degree `≤ k(L+1) − 1 ≥ dm` (parameters chosen so this holds), and the field characteristic constraint `p ≥ L+1` ensures the derivative arguments are well-defined.&#8201;[^34]

[^33]: §4 Theorem 2 proof, "Correctness" (p. 13): "we simply need to argue that `f(0) = P(i)`. This is simple since we have `dm+1` distinct points and are recovering a function `f` of degree `dm`. Follows as in [78]."
[^34]: §5 Theorem 3 proof, "Correctness" (p. 19): "since we have `k` unique points of `f`, `k` corresponding first derivatives of `f`, and so on, up to `k` corresponding `L`-th derivatives of `f`, we can uniquely determine a function `f` with degree `d·m ≤ k(L+1) − 1`."

#### Option D — Inherited Correctness (Theorem 4)

Correctness reduces to DORAM correctness: `Read([DB'], [i])` returns the shares of `DB[i]` with probability `≥ 1 − negl(λ)`. Client reconstruction is a sum over the `k` additive shares.&#8201;[^35]

[^35]: §6 Theorem 4 proof (p. 23): "the correctness and privacy follow directly from DORAM and secret sharing."

### Complexity

| Metric | Theorem 2 (Õ(log N) servers) | Theorem 3 (o(log N) servers) | Theorem 4 (3 servers, communicating) |
|--------|------------------------------|------------------------------|---------------------------------------|
| **Number of servers `k`** | `Õ(log N) = O(log N · log log N / log log log N)` | `o(log N) = O(log N / √W(log N))` | 3 |
| **Server preprocessing time** | `N^{1+o(1)}` | `N^{2+o(1)}` | `T_Init = N · polylog N` |
| **Server storage `|~DB|`** | `N^{1+o(1)}` (per server, replicated) | `N^{2+o(1)}` (per server, replicated) | `O(N · polylog N)` (per server, secret-shared share) |
| **Client query time** | `N^{o(1)}` | `N^{o(1)}` | `O(log³ N)` |
| **Per-server query time** | `4^m · poly(α, d, m, p) = N^{o(1)}` | `(m^L + 1) · 4^m · poly(α, d, m, p) = N^{o(1)}` | `O(log³ N)` (MPC `Read` step) |
| **Total online time (sum across `k`)** | `N^{o(1)}` | `N^{o(1)}` | `O(log³ N)` |
| **Total online communication** | `N^{o(1)}` | `N^{o(1)}` | `O(log³ N)` |
| **Preprocessing model** | Server-only, single pass; replicated identical `~P` to each server | Server-only, single pass | Distributed `Init` MPC across `k` servers (offline) |

### Lower Bounds

- **Persiano–Yeo [71]:** any server-preprocessing single-server PIR scheme with query time `Ω(t)` must store a hint of size `Ω(N log N / t)`. The `N^{1+o(1)}` storage of Theorem 2 is `N^{o(1)}` away from this bound — i.e., the construction is essentially optimal for `t = N^{o(1)}`.&#8201;[^36]
- **Beimel–Ishai–Malkin [8] (Thm 4.9):** sets the prior bar at `polylog(N)` query time and `polylog(N)` communication using `O(polylog N)` servers and `poly(N)` preprocessing — Theorem 2 strictly improves on the preprocessing exponent (`N^{1+o(1)}` vs. `poly N`) at slightly worse query time, while using fewer servers.

[^36]: §1 (p. 2): "Persiano and Yeo [71] recently tighten the lower bounds shown by Beimel et al., showing that any server preprocessing scheme in the single server setting with query time `Ω(t)` must have the server store a hint of at least size `Ω(N log N/t)`, for any number of servers." §1.1 (p. 4): "Our result is only a `N^{o(1)}` factor from the lower bound proven by Persiano and Yeo (SODA '22) for this setting."

### Performance Benchmarks

No implementation. Author-stated concrete claims:

- **Theorem 4 / GigaDORAM:** "one PIR query against 8 GB of database with only about 1 ms, according to the benchmarks in [25]." This is *not* measured by this paper; it is a quoted upper bound on what running their scheme on top of an existing DORAM implementation would yield.&#8201;[^37]
- **Theorems 2, 3:** asymptotic only; both are theoretical results designed to map out the (preprocessing × server-count) trade-off space, not deployed.

[^37]: §6 (p. 23): "Concretely, this in fact allows us to make one PIR query against 8GB of database with only about 1ms, according to the benchmarks in [25], which is also orders of magnitude faster than any existing PIR construction."

### Comparison with Prior Work

| Scheme | # Servers | Preprocessing | Online Time | Communication | Notes |
|--------|-----------|---------------|-------------|---------------|-------|
| Woodruff–Yekhanin (W&Y, 2005) [78] | 2 | None | `N / polylog^r N` | `N^{1/3}` | No preprocessing baseline |
| Beimel–Ishai–Malkin (BIM, 2004) [8] | `k` (constant) | `poly(N)` | `O(N^{1/k+ε})` | `O(N^{1/k+ε})` | Constant `k` family |
| Beimel–Ishai–Malkin (BIM, 2004) [8] | `O(polylog N)` | `poly(N)` | `polylog N` | `polylog N` | Polylog-server family |
| Ghoshal et al. [30, 31] (concurrent, ePrint 2024/765) | `k` tunable | `poly(N)` (or `N^{1+o(1)}` in [31]) | `O(N^{1−γ(k−1)+ε})` (or `N^{o(1)}`) | `O(N^{γ+ε})` (or `N^{o(1)}`) | Concurrent |
| **This paper, Theorem 2** | **`Õ(log N)`** | **`N^{1+o(1)}`** | **`N^{o(1)}`** | **`N^{o(1)}`** | First IT DEPIR |
| **This paper, Theorem 3** | **`o(log N)`** | **`N^{2+o(1)}`** | **`N^{o(1)}`** | **`N^{o(1)}`** | Sub-log servers |
| **This paper, Theorem 4** | **3** | **`N · polylog N`** | **`O(log³ N)`** | **`O(log³ N)`** | Communicating, dominates concretely |
| Lin–Mook–Wichs (single-server DEPIR, STOC '23) [57] | 1 | `N^{1+o(1)}` | `N^{o(1)}` | `N^{o(1)}` | Requires AHE; ~100× storage blow-up |

Source: Table 1 (p. 4) and Appendix A (p. 31).&#8201;[^38]

[^38]: Table 1 (p. 4): "Comparisons to prior works. `N` is the number of bits in a database, and `k`, `ε` are tunable constants in [8]. `γ` is a tunable constant satisfying `1/(k+1) ≤ γ ≤ 1/k` in [30]."

**Key takeaway:** The DORAM-based scheme of §6 dominates asymptotically (3 servers, quasi-linear preprocessing, `polylog N` query) at the cost of online server-server communication. For the standard non-communicating setting, Theorem 2 is `N^{o(1)}` from the Persiano–Yeo lower bound and uses fewer servers than [8]'s polylog-server scheme. Theorem 3 is the only known construction with `o(log N)` servers and any `poly N` preprocessing.

### Application Scenarios

- **Updatable PIR:** the §6 construction inherits DORAM's `Write` operation, supporting database mutations at `O(log³ N)` per update — matching the read cost. Compared to existing updatable PIR constructions [55, 27, 43], the cost of updating state is no larger than the cost of serving a query.&#8201;[^39]
- **Oblivious Message Retrieval (OMR):** §6 sketches a multi-server OMR construction by replacing the trusted hardware in [44] with a `k`-server MPC + DORAM, yielding poly-logarithmic online time per retrieval. Concrete efficiency vs. existing single-server OMR remains open.&#8201;[^40]
- **Blockchains:** because DORAM-based PIR can be sustained against an unbounded adversary using IT DORAM (e.g., MetaDORAM [24]), the construction is a candidate for blockchain-adjacent PIR settings (private signaling, anonymous messaging) where computational assumptions are undesirable.

[^39]: §6 "Updatable PIR" (p. 23): "DORAM, in addition, supports writes as well, which means that the servers can simply jointly use DORAM writes to update the database with `O(log³(N))` time. … the cost of updating the state is not larger than the cost of serving the client query."
[^40]: §6 "Further application to Oblivious Message Retrieval" (p. 23): "in [44], the authors introduced a way to build OMR with trusted hardware plus ORAM. One could easily replace this trusted hardware with MPC and ORAM with DORAM."

### Key Tradeoffs & Limitations

- **Non-collusion is load-bearing.** All three constructions require a strict honest-but-curious non-collusion assumption. §7 sketches a rational-server alternative via a public smart-contract (cost ≈ \$10 setup on Ethereum) per Gong et al. [35], but this is future work, not implemented.
- **Number of servers `k` is super-constant** in §4–§5. `Õ(log N)` and `o(log N)` may be impractical to deploy in a real `k`-party honest-but-curious infrastructure.
- **§5 trades preprocessing for fewer servers** — `N^{2+o(1)}` storage and preprocessing are heavy. The L-derivative construction saves servers but quadratically inflates storage.
- **§6 requires online server-server communication** and *global* server state (synchronised DORAM). The paper argues this is acceptable since updatable PIR also needs sync, but it does break the strict non-communicating multi-server PIR model.
- **No implementation.** All concrete claims are author estimates; the §6 ≈1 ms claim is borrowed from GigaDORAM's existing benchmarks, not measured by this paper.
- **Small-characteristic field constraint.** Bhargava et al.'s preprocessing requires `p = d^{o(1)}` — this rules out direct use of arbitrary fields and forces the parameter regime in §4.&#8201;[^41]

[^41]: §4 (p. 13): Bhargava et al. "introduces some new constraints (e.g., the characteristic of `F_q` the polynomial works over `p` needs to be `d^{o(1)}` where `d` is the individual degree of the polynomial)."

### Open Problems

Authors highlight the following open questions in §7&#8201;[^42]:
1. **Reduce server count to constant.** For the non-communicating model, can we reduce to a constant number (ideally 2) of non-colluding servers while maintaining `N^{1+o(1)}` preprocessing and `N^{o(1)}` query?
2. **Computational PIR variants.** Can lightweight computational assumptions (e.g., OWF) reduce the number of servers or online time without ruining practicality? In non-preprocessing PIR, DPFs already give 2-server `O(log N)`-comm computational PIR, but no 2-server *IT* PIR with `O(log N)` is known.
3. **Relaxed honesty for DORAM.** Can DORAM with `k > 3` be built assuming only 1-out-of-`k` (or `t ≪ k`) honest parties without efficiency loss? This directly affects Theorem 4.
4. **Replace non-collusion with rational-server.** §7 sketches a public-contract approach (Gong et al. [35]) but does not formalise or analyse it for these constructions.

[^42]: §7 "Future work" (p. 24–25): four bullet points listed verbatim.

### Implementation Notes

- **No implementation.** §1.1 (p. 4): "since our constructions do not rely on any heavy cryptographic tools (and most constructions require no cryptographic tools at all), our work is notably empirically much more efficient in practice than the work by Lin et al."
- **Languages / Libraries:** N/A. The §6 construction would, in practice, plug into GigaDORAM's existing C++ implementation [25] for `Init`/`Read`.
- **Polynomial arithmetic:** Theorems 2/3 require Bhargava et al.'s [10] preprocessing — not yet implemented to the authors' knowledge.
- **Open source:** None.

### Related Papers in Collection

- [`symmetric.depir/chr_2017/`](../chr_2017/) — Canetti–Holmgren–Richelson "Towards Doubly Efficient PIR" (2017), the original DEPIR paper. Its assumption (Hidden Permutation with Noise / permuted puzzles) was non-standard, motivating Lin et al.'s standard-assumption DEPIR and the present work's IT multi-server alternative.
- [`symmetric.preprocessing/`](../symmetric.preprocessing/) — siblings on multi-server preprocessing (Scalable MSPIR by Ghoshal et al. [30, 31] is the concurrent work directly compared in Appendix A).
- [`symmetric.IT/`](../symmetric.IT/) — Chor–Goldreich–Kushilevitz–Sudan (1995) introduced the IT multi-server model that this paper extends with preprocessing.
- Single-server context: BarelyDoublyEfficient (single-server DEPIR from plain LWE in CRS, theory) and the Lin–Mook–Wichs single-server DEPIR [57] are the contrast points.

### Uncertainties

- **Exact formula for `α` in Theorem 2.** The proof writes `α = O(log_p k) = O(log N)^{1 / log log log N}`. The notation is ambiguous between `(log N)^{1/log log log N}` and `O(log_p k)`; both are `N^{o(1)}` but the explicit exponent differs.
- **Theorem 4 storage.** The paper states `T_Init` for both preprocessing time and server storage in Table 1, treating them as the same quantity. GigaDORAM's per-server storage is roughly `O(N · log N)` in the published benchmarks, but this is not pinned down precisely in the text.
- **Concurrent-work numbering.** The paper compares to "Theorem 6" of [30] in Appendix A but Table 1 only lists Theorems 2, 3, 4 of *this* paper — the §1.1 references to "Theorem 6 unique to our work" appear to refer to an earlier draft labelling; the current ePrint version (v2/v3) consolidates this as Theorem 4.
