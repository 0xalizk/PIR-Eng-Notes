## CHR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Towards Doubly Efficient Private Information Retrieval](https://www.cs.ucr.edu/~silas/papers/depir.pdf) (Canetti, Holmgren, Richelson — TCC 2017) |
| **Archetype** | Feasibility + Theory + Building-block (introduces a new hardness assumption: HPN) |
| **Asymmetry profile** | Symmetric (single-server DEPIR — no servers to compare; the polylog property is *across queries* via amortized preprocessing, not across servers) |
| **Multi-server model** | Single-server. The paper is a single-server DEPIR feasibility result; concurrent independent work BIPW '17 covers an analogous multi-server / OLDC angle&#8201;[^1]. |
| **Security model** | Semi-honest single-server (server runs `Resp` and sometimes `Process` honestly — "honest-but-curious")&#8201;[^2]. Two flavors: bounded-query designated-client (statistical security from OWF) and unbounded-query designated-client (computational security from new HPN assumption)&#8201;[^3]. |
| **Additional assumptions** | Bounded-query scheme: any one-way function (instantiated via small-domain pseudorandom permutations [MRS09])&#8201;[^4]. Unbounded-query scheme: Hidden Permutation with Noise (HPN), a new search problem on multivariate polynomials over `F^m`&#8201;[^5]. |
| **Correctness model** | Bounded-query: statistical 2^{-λ} (perfect when underlying LDC is perfect)&#8201;[^6]. Unbounded-query: probabilistic — noise points break interpolation unless the chosen evaluation set `T` avoids them. |
| **Rounds (online)** | 1 (non-interactive: client sends `q`, server replies `a`)&#8201;[^7]. |
| **Record-size regime** | Theory paper — DB is `{0,1}^N` (single bits). |

### Lineage
| Field | Value |
|-------|--------|
| **Builds on** | BIM '04 (multi-server PIR with preprocessing)&#8201;[^8]; Reed–Muller / locally-decodable codes; Goldreich–Rothblum '17 (DEPIR coined as "doubly efficient" by paraphrase from [GR17])&#8201;[^9]; ORAM line [GO96, Ajt10, DMN11, SCSL11] (motivating contrast — ORAM requires updatable client state)&#8201;[^10]. |
| **What changed** | First single-server PIR with **stateless client** + **read-only DB** + **sublinear (polylog) per-query work for both server and client**, after a polynomial-time preprocessing. Replaces ORAM's updatable-client model and BIM '04's multi-server requirement. |
| **Superseded by** | Lin–Mook–Wichs (STOC '23) — first single-server DEPIR from standard assumptions (Ring-LWE)&#8201;[^11]. Concrete single-server DEPIR remains theoretical; later works (BarelyDoublyEfficient 2024) followed. |
| **Concurrent work** | Boyle–Ishai–Pass–Wootters (BIPW '17, ePrint 2017/567) — independent and simultaneous; their *OLDC* primitive corresponds to designated-client DEPIR here, and their *pk-PIR* corresponds to public-client DEPIR (modulo a non-adaptive-queries restriction)&#8201;[^1]. |

### Core Idea
A doubly-efficient PIR scheme has a polynomial-time preprocessing `Process(K, DB) → DB̃` after which **both** `Query`, `Resp`, and `Dec` run in time sublinear (ideally polylogarithmic) in `N`&#8201;[^12]. The construction starts from a Reed–Muller-style LDC: encode `DB ∈ {0,1}^N` as the truth table of the low-degree extension `D̂ : F^m → F` of degree `m·(|H|-1)`, choose a degree-`d` curve `φ : F → F^m` through the target, and recover `D(i) = φ(0)` by interpolating the server's responses on `(x_1, …, x_k) = (φ(1), …, φ(k))`&#8201;[^13]. The server can trivially break this by interpolating `i = φ(0)` itself, so CHR adds three independent "alterations": (1) secret evaluation points `(α_1, …, α_k)` instead of `(1, …, k)`; (2) random noise points injected into the query; (3) a secret pseudorandom permutation `π ∈ Perm(F^m)` applied to `D̂` at preprocessing — the server stores the truth table of `D̂ ∘ π^{-1}` and the client masks queries by `π`&#8201;[^14]. The bounded-query scheme uses (3) alone over a generic `t`-smooth LDC; the unbounded-query candidate combines (2) and (3) (in the simpler form analyzed) and reduces security to HPN.

### Formal Definitions (DEPIR model)

The paper formalizes DEPIR in §2 via five algorithms&#8201;[^12]:

- `Keygen(1^λ) → K` — samples a (long-term) key.
- `Process(K, DB) → DB̃` — preprocesses the database into an encoded form `DB̃`.
- `Query(K, i) → (q, st)` — produces a query and short local state.
- `Resp^{DB̃}(q) → a` — the server's response, with **RAM access** to `DB̃`.
- `Dec(K, st, a) → DB_i` — the client decodes the answer.

**Double efficiency** (Definition 1): all algorithms run in `poly(λ)`, `|DB̃| = poly(λ, N)`, and `Query`, `Resp`, `Dec` run in time **sublinear in `N`** — ideally polylogarithmic. `Resp` is given **RAM (random-access) access** to `DB̃`, not streaming&#8201;[^12].

Three security regimes (with variants)&#8201;[^15]:

1. **Designated-client** (Definition 2): `K` is private to the client. Variants: (a) "DB hidden from server" (server only learns `DB̃` ← `Process(K, DB)`); (b) "DB known to server, queries hidden". Bounded variant: `B`-bounded DEPIR — privacy holds for ≤ `B` queries; the *amortized storage overhead* is defined as `|DB̃| / B`.
2. **Public-client** (Definition 3): `K` is public. Many clients can share the same `DB̃`. Sub-cases: adaptive vs. non-adaptive DB-vs.-key generation; "public client with secret preprocessing key" (Keygen also outputs a separate secret key used only by `Process`).
3. **Public-preprocessing**: even the randomness used by `Keygen` is public (or `Keygen` deterministically outputs its random tape, and `Process` is deterministic).

Other refinements (all in §2): `database privacy` (simulator gets only `N`, not `DB`); `non-adaptive database generation`; `global key generation`. Definitions are explicitly stated as a self-contained game-based reformulation of an "ideal PIR functionality" inspired by UC security&#8201;[^16].

### No-Go Result for Public-Preprocessing DEPIR (§3)

Section 3 shows a natural template for **public-preprocessing** DEPIR fails when the encoding is any **linear** code&#8201;[^17].

- **Template** (general LDC version): view `DB ∈ {0,1}^N` as a function `H^m → {0,1}`; let `D̂ : F^m → F` be the low-degree extension of degree `|H|-1`; the server stores the truth table of `D̂`. The client samples query `Q ← Q_i` (a set of locations in the encoded DB) such that `D̂|_Q` determines `DB[i]`. Privacy requires `Q_i ≈_c Q_{i'}` for `i ≠ i'`. **Interpolability** requires that any `g` of degree `|H|-1` agreeing with `D̂` on `Q` also agrees with `D̂` (hence `DB`) on `i`&#8201;[^18].
- **Definition 4 (`Q` determines `i`):** `Q ⊆ [M]` *determines* `i ∈ [N]` if for every `m, m' ∈ Σ^N` with `C(m)|_Q = C(m')|_Q`, `m_i = m'_i`.
- **Proposition 1:** for any **linear** code `C : F^N → F^M`, given `Q`, the set of indices `i ∈ [N]` determined by `Q` is at most `|Q|`, and they can be enumerated in `poly(M)` time via Gaussian elimination (the criterion is "`e_i` is in the span of the rows of the generator `G` indexed by `Q`")&#8201;[^19].

A polylogarithmic `|Q|` thus determines only polylogarithmically many indices, so the server can simply **enumerate the determined indices** for `Q_i` and `Q_{i'}` and learn whether `i ∈` that set — breaking privacy. This rules out the entire "linear LDC + public preprocessing" approach, including Reed–Muller&#8201;[^20]. Whether **any** public-preprocessing DEPIR exists is left open.

### Bounded-Query Designated-Client Construction (§4)

#### 4.1 Trivial scheme (warm-up)

`Keygen` samples a uniform permutation `π : [N] → [N]`; `Process(π, DB)` outputs `DB̃` defined by `DB̃(i) = DB(π(i))`; query is `q = π(i)`; response is `DB̃(q) = DB(i)`. Server storage `Õ(N)`, server work `O(1)`, but supports **only one query** with a stateless client&#8201;[^21]. Concatenating `B` copies gives a `B`-query scheme with `Θ̃(BN)` storage — the baseline that §4.2 improves to `Õ(B + poly(N))`.

#### 4.2 LDC + permutation scheme (main result of §4)

Builds on **any** `t`-smooth `k`-query LDC (Definition 5)&#8201;[^22]. *Smoothness* means `Query(i)` outputs each `(j_{s_1}, …, j_{s_t})` uniformly over `[M]^t` — a relaxation of the standard LDC definition; no error-correction is needed and decoding queries are non-adaptive&#8201;[^23].

Key sampled `π_1, …, π_k : [M] → [M]` i.i.d. uniform permutations (compressed to seeds via small-domain PRPs [MRS09] for `O(λ)` key size)&#8201;[^24]. Process outputs `DB̃ = (DB̃^{(1)}, …, DB̃^{(k)})` where `DB̃^{(i)}` is `LDC.Enc(DB)` permuted by `π_i`, i.e. `DB̃^{(i)}_{π_i(j)} = LDC.Enc(DB)_j`&#8201;[^25]. Query `(j_1, …, j_k) ← LDC.Query(i)`; client sends `(π_1(j_1), …, π_k(j_k))`. Server returns the corresponding entries; client runs `LDC.Dec`. Perfect correctness inherits from the LDC.

**Reed–Muller instantiation:** field `F` and integer `m` with `|H|^m = N`, `|F|^m = M`; `D̂ ∈ F^{F^m}` is the low-degree extension; queries are points on a random degree-`t` curve through `i`, with `k ≥ m·t·(|H|-1)`&#8201;[^26].

**Theorem 1:** the LDC + permutations scheme is `B`-bounded designated-client DEPIR with statistical `2^{-λ}`-security, when the parameters satisfy `2Bk^{t-1}(B/M)^{t/2-1} ≤ 2^{-λ-1}`&#8201;[^27]. Provides database privacy.

**Two example parameter regimes** for the Reed–Muller instantiation&#8201;[^28]:

| Regime | Choice | Storage `M` | Server overhead `k` | Client overhead | Comment |
|--------|--------|-------------|--------------------|-----------------|---------|
| **Low Work** | `|H| = λ`, `m = log N / log λ`, `|F| = (2λ⁶B)^{1/m}` | `M = 2λ⁶B` | `k = λ³` | `λ³` | Amortized storage overhead `|DB̃|/B = poly(λ) = λ⁶`. Requires `N⁴ ≤ B ≤ 2^λ / λ³`. |
| **Low Server Storage** | `|H| = max(λ, N^ε)`, parameters tuned so `M = max(N·λ^{1/ε}, 2k²B)` | `M = N · poly(λ)` whenever `B = o(N^{1-2ε}/λ²)` | `k = O(λ·N^ε)` | `t = O(λ)` | For any constant `ε > 0`. Trades larger `k` for `Õ(N) + poly(B)` storage. |

**Proof outline:** by deferred sampling of the lazy `π_i`, the `ℓ`-th query `(π_1(j_1), …, π_k(j_k))` reveals only, for each coordinate, the prior queries that hit the same image. Let `S_1, …, S_k ⊆ [ℓ-1]` be these subsets. They inherit `t`-wise independence from the LDC, and each `S_i = ∅` with probability `≥ 1 - B/M`. Lemma 1 (`t`-wise independent variables with the same marginals are statistically `(kε)^{t/2} + k^{t-1}ε^{t/2-1}` close — a special case of a generalization of Braverman's "polylog independence fools AC^0" [Bra09] for fan-in conjunctions) bounds the per-query distance, then a `B`-step hybrid gives total advantage `Bε`&#8201;[^29].

#### 4.3 Linear attack when queries exceed `B` (§4.3)

For Reed–Muller (and any LDC whose `Query` outputs lie in affine planes `V_i ⊂ [M]^k` of dimension `t·dim([M])` and is **locally correctable**, supporting queries to any `i ∈ [M]`), a polytime adversary distinguishes `B = M^{1+o(1)}` queries to a fixed `i` from queries to random `i`:

**QueryDist algorithm:** maintain variables `v_{s,j'_s} ∈ [M]` (intuitively `v_{s,j'_s} = j_s` if `π_s(j_s) = j'_s`); each query `(j'_{α,1}, …, j'_{α,k})` adds the linear constraint `(v_{1,j'_{α,1}}, …, v_{k,j'_{α,k}}) ∈ V_i`; check via Gaussian elimination whether the constraint set has a non-constant satisfying assignment. Set `B = kλM^{1+o(1)}`. Lemma 3: returns FIXED w.p. 1 if all queries are for the same `i`; returns RANDOM w.p. `1 - 2^{-Ω(λ)}` if queries are for random indices&#8201;[^30].

#### 4.4 Statistical lower bounds (matching upper bounds)

- **Theorem 2:** any statistically `δ`-secure (correctness `ε`) **public-client** DEPIR has answer size `|a| ≥ (1 - H(ε+δ))N - O(log N)`&#8201;[^31]. Holds even for non-adaptive `δ`-security. Proof: a `Reconstruct` algorithm (Claim 3) recovers `≥ (1-ε-δ)N` bits of `DB` from `(pk, q, a)` regardless of `i`, so `H(DB | a) ≤ H(ε+δ)N + O(log N)` (Claim 4 via Stirling + Jensen); since `DB` has entropy `N`, `|a| ≥ N - H(DB|a)`.
- **Theorem 3:** any `B`-bounded statistically `δ_dc`-secure designated-client DEPIR with answer size `|a| = o(N)` and correctness `o(1)` has key size `|sk_dc| = Ω(B)`&#8201;[^32]. Argued by releasing the key (turning the scheme into a public-client one), then applying Theorem 2 plus the BTV12/Dod12 mutual-information lemma `2ε² ≤ I(M;C) ≤ 2ε log(|M|/ε)` to lower-bound `|sk|` by an entropy gap.

The combination implies the §4.2 scheme is essentially tight: statistical security forces `|a| ≈ N` or `|sk| ≈ B`. Computational security is therefore *necessary* to escape this — motivating §5.

### Unbounded-Query Candidate and HPN (§5)

#### 5.1 Candidate scheme (combines alterations 2 and 3)

Parameters: `m < t < r < k < |F|`, `H ⊂ F` with `|H|^m = N`, `m(t-1)(|H|-1) < r`, `|F|^m = poly(n)`, `|F|^t = n^{ω(1)}`&#8201;[^33].

- `Keygen(1^λ, N)` — draw permutations `τ ← P(F^{m+1})`, `π ← P(F^m)` from a pseudorandom-permutation family `P` with seed length `λ`, and a subset `T ⊂ [k]` with `|T| = r`. Output `K = (seed_π, seed_τ, T)`.
- `Process(K, DB)` — interpret `DB` as a function `H^m → {0,1}` (zero outside `H^m`), compute the low-degree extension `D̂ : F^m → F`, and output the table `{(x, τ(x, D̂(π^{-1}(x))))}_{x ∈ F^m}`. So the server holds `D̂ ∘ π^{-1}` re-randomized one further time per row through `τ`&#8201;[^34].
- `Query(K, i)` — let `z ∈ H^m` correspond to `i`; pick `(x_1, …, x_k) ← V_z` (a random degree-`t` curve through `z`); output `ȳ = (y_1, …, y_k)` where `y_i = π(x_i)` for `i ∈ T` and `y_i ←$ F^m` for `i ∉ T`. Set `st = (seed_τ, T)`.
- `Resp^{DB̃}(q)` — for each row `(y_i, y'_i) ∈ DB̃` find the entry; output `a = (y'_1, …, y'_k)`.
- `Dec(st, a)` — for `i ∈ T`, set `(x_i, α_i) = τ^{-1}(y'_i)`. Interpolate the unique univariate polynomial `ψ : F → F` of degree `≤ m(t-1)(|H|-1)` with `ψ(i) = α_i` for `i ∈ T`. Output `ψ(0)` (or `⊥`).

Intuition: the `r` "true" coordinates indexed by `T` provide `r > m(t-1)(|H|-1) = deg(ψ)` interpolation points, sufficient for unique recovery. The `k - r` noise coordinates and the `π` permutation jointly hide which coordinates are real and which evaluation points lie on the curve — preventing the `O(λ)`-server-time attack of §4.3.

#### 5.2–5.4 The HPN problem and reductions

**HPN distribution `D(π, z, T)`** (Definition 6): draw `x̄ ← V_z` (degree-`t` curve through `z`), output `ȳ = (y_1, …, y_k)` where `y_i = π(x_i)` for `i ∈ T`, otherwise `y_i ←$ F^m`&#8201;[^35].

**HPN Assumption** (Definition 7)&#8201;[^36]:
- **Search:** given polynomially many `(z_α, ȳ_α ← D(π, z_α, T))` for fixed random `π ∈ Perm(F^m)` and random `T ⊂ [k]` with `|T| = r`, no PPT adversary recovers `π` with non-negligible probability.
- **Decision:** `D(π, z, T)` is computationally indistinguishable from uniform `F^{km}` (`{z_α}` published, fresh `π`, `T`).

Note: `k ≈ d² = (m(t-1)(|H|-1))²` — only quadratically more samples than degrees of freedom in the degree-`d` curve — so an unbounded adversary may not even uniquely determine `φ` given `π`. `l = r` (number of correct coordinates) can be much larger&#8201;[^37].

**Claim 5:** the candidate scheme is secure assuming **decisional** HPN — the simulator just sends a uniform `ȳ_α ←$ F^{km}` for each adaptive query; static-to-adaptive holds because `|F|^m = poly(n)` (the simulator pre-samples enough random transcripts and matches them to adaptive queries by `z_α`)&#8201;[^38].

**Theorem 4 (search-to-decision reduction):** decisional HPN ≤ search HPN, via two sub-algorithms&#8201;[^39]:
- **CLEAN** (§5.3): given a decisional distinguisher with advantage `δ`, recover a `T' ⊂ T` of size `≥ t+1` by replacing one coordinate at a time with random and watching when `A`'s acceptance probability shifts by `≥ δ/2k`. Runs in `O(nk³t/δ²)` expected time (Lemma 5).
- **RecoverPerm** (§5.4): given many `D(π, z_α, T)` samples (with each `z ∈ H^m` appearing `≥ B = mλ|F|^{3m+3}` times), set up linear constraints `(v_{y_{α,1}}, …, v_{y_{α,k}}) ∈ V_{z_α}` over variables `v_y ∈ F^m`; solve via linear algebra; verify the resulting map is a permutation. Lemma 6: outputs `π' = π` with overwhelming probability. Lemma 7 establishes the algebraic uniqueness — if `f_1, …, f_k : F^m → F^m` with `Pr_{x̄ ← V_z}[f̄(x̄) ∈ V_z] ≥ 1 - |F|^{-(2m+2)}` for all `z`, then `f_i(x_i) = Ax_i + φ(i)` for a single matrix `A ∈ F^{m×m}` and a curve `φ` of degree ≤ `t`; in particular `A = I` and `b ∈ V_0`, forcing `f̄` to fix `V_z` exactly&#8201;[^40].

This means a search adversary suffices to break decisional HPN, making the **search** version (no adaptive-coefficient choice for `φ`) the cleanest target for cryptanalysis&#8201;[^39].

#### Cryptanalytic notes (§1.1, §3-related)

- HPN superficially resembles "noisy polynomial interpolation" [NP06, BN00, GKS10]; differences: HPN hides the algebraic structure of `F^m` via permutation, and uses **multivariate** rather than univariate polynomials — known interpolation-with-noise techniques (Coppersmith–Sudan [CS03]) do not extend through a hidden permutation&#8201;[^41].
- Public-client extension via VBB obfuscation of `Query` and authenticated `Dec` is sketched in [BIPW17]; CHR does not pursue this&#8201;[^1].

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Hidden Permutation with Noise (HPN) |
| **Type** | New computational hardness assumption |
| **Interface / Operations** | Sample `π ←$ Perm(F^m)`, `T ⊂ [k]` with `|T| = r`. Distribution `D(π, z, T)`: draw degree-`t` curve `x̄ = (x_1, …, x_k)` with `x` passing through `z`; output `y_i = π(x_i)` if `i ∈ T`, else `y_i ←$ F^m` (decision version). Search version: recover `π` from samples. |
| **Security definition** | Definition 7 (Search and Decision, p.19). Static and adaptive variants — for `|F|^m = poly(n)` they are equivalent. |
| **Correctness / setup** | `m < t < r < k < |F|`; `m(t-1)(|H|-1) < r` (so `r` true points uniquely interpolate the degree-`d` univariate restriction); `|F|^t = n^{ω(1)}` (so brute-force search over `T` is super-polynomial); `k ≈ d²` is the recommended sample budget&#8201;[^33]. |
| **Purpose** | Enables unbounded-query designated-client DEPIR by hiding which curve points are real vs. noise. |
| **Built from** | Pseudorandom permutations (small-domain PRP from OWF, e.g. [MRS09]) + multivariate polynomial structure. |
| **Standalone complexity** | Sample size `poly(N)`, evaluation `poly(λ, N)`. Standard-assumption status: **unknown** — no reduction to LWE/LPN given&#8201;[^42]. |
| **Relationship to prior primitives** | Distinct from noisy polynomial interpolation [NP06] — adds hidden permutation and multivariate polynomials. Distinct from LPN (additive noise vs. replacement noise). |

| Field | Detail |
|-------|--------|
| **Name** | `t`-smooth Locally Decodable Code (used as a generic substrate) |
| **Type** | Relaxation of standard LDC |
| **Interface / Operations** | `(Enc, Query, Dec)`. `Enc : Σ^N → Σ^M` deterministic; `Query : [N] → [M]^k` randomized; `Dec(st, c_{j_1}, …, c_{j_k}) → m_i`. |
| **Security / smoothness** | `t`-smooth: for every distinct `s_1, …, s_t ∈ [k]`, `(j_{s_1}, …, j_{s_t})` is uniformly distributed on `[M]^t` (Definition 5)&#8201;[^22]. |
| **Correctness** | Inherits LDC perfect correctness; CHR drops error-correction and assumes non-adaptive decoding queries. |
| **Purpose** | Substrate for §4.2's permutation-based scheme. |
| **Built from** | Reed–Muller / multivariate polynomials are the canonical instantiation; CHR's analysis is generic. |
| **Relationship** | Weaker than locally-correctable codes (used in §4.3); stronger than locally-decodable in requiring uniform `t`-tuples. |

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Bounded-query: any one-way function (used for small-domain PRPs [MRS09]). Unbounded-query: HPN (this paper). |
| **Encryption/encoding scheme(s)** | Plaintext database is symmetrically encrypted entry-wise with a key derived from `K` before `Process` (omitted in protocol descriptions for clarity)&#8201;[^43]. The "encoding" of `DB` is its low-degree extension `D̂` (Reed–Muller codeword). |
| **Ring / Field** | Finite field `F` with `polylog(N) ≤ |F| ≤ poly(N)` depending on regime. `H ⊂ F` with `|H|^m = N`; `m = log N / log log N` for the low-work regime. |
| **Key structure** | `K = π` (one or more permutations of `[M]` or `F^m`, compressed to PRP seeds of length `λ`); plus `T ⊂ [k]` of size `r`; plus encryption key. |
| **Correctness condition** | Bounded scheme: perfect (inherits LDC). Unbounded scheme: `|T| = r > m(t-1)(|H|-1) = deg(D̂ ∘ φ)` so the `r` permutation-removed points uniquely determine `ψ = D̂ ∘ φ` of degree `≤ d`. |

### Key Data Structures

- **Server-side `DB̃`:** truth table over `F^m`. In the bounded scheme `DB̃` is a `k`-tuple of permuted Reed–Muller codeword copies — total size `k · |F|^m`. In the unbounded scheme `DB̃` is a single table of `(y, τ(y, D̂(π^{-1}(y))))` rows over `F^m` — total `|F|^m` rows&#8201;[^34].
- **Client state:** `K = (seed_π, seed_τ, T)`, total `O(λ + r·log k)`. The client is **stateless across queries** (no growing state, no updatable hint).
- **No per-client server state.** Single server, single preprocessed `DB̃`; all clients sharing `K` query the same table.

### Database Encoding

- **Representation:** low-degree extension. View `DB ∈ {0,1}^N` as `D : H^m → {0,1}` for `H ⊂ F`, `|H|^m = N`. Extend to `D̂ : F^m → F`, the unique `m`-variate polynomial of total degree `≤ m(|H|-1)` that agrees with `D` on `H^m`. The truth table of `D̂` (over all `|F|^m` points) is the encoded DB&#8201;[^44].
- **Record addressing:** `i ∈ [N]` ↔ `z ∈ H^m` via lex order; `D(i) = D̂(z)`.
- **Preprocessing required:** compute `D̂`'s truth table (`Õ(|F|^m · poly(m, |H|))` time via standard low-degree-extension evaluation).
- **Permutation step:** apply `π` (and `τ`) to the row indices and values before handing to the server.

### Protocol Phases

| Phase | Actor | Operation | Communication | When |
|-------|-------|-----------|---------------|------|
| Keygen | Client | sample PRP seeds + `T` | — | Once |
| Process | Server (or trusted setup) | encrypt + low-degree extend + permute → `DB̃` | — | Once, time `poly(λ, N)` |
| Query | Client | sample curve `φ` of degree `t` through `z`; permute & noise the `k` points | `O(k · m log|F|) = polylog(N)` ↑ | Per query |
| Resp | Server | `k` RAM lookups in `DB̃` | `O(k · log|F|)` ↓ | Per query |
| Dec | Client | invert `τ` on `T`-coords; univariate Lagrange interpolation; evaluate at `0` | — | Per query |

Online server work is `polylog(N)` (just `k` RAM probes); online client work is `polylog(N)` (curve sampling + interpolation of a degree-`d = polylog(N)` polynomial).

### Correctness Analysis

**Bounded-query scheme (§4.2):** Perfect correctness inherited from the underlying LDC. The permutation just relabels codeword positions; `LDC.Dec` is identical to the unpermuted decoding because `DB̃^{(i)}_{π_i(j)} = LDC.Enc(DB)_j`&#8201;[^25].

**Unbounded-query scheme (§5.1):** Correctness on the `T`-indexed coordinates is deterministic — `α_i = D̂(φ(i))` for all `i ∈ T` provided `D̂` is the unique low-degree extension and `φ` was the curve chosen. Then `ψ = D̂ ∘ φ` has degree `≤ m(t-1)(|H|-1) < r = |T|`, so Lagrange interpolation on `T` recovers `ψ` exactly, and `ψ(0) = D̂(z) = DB(i)`. The client must know `T` (it does: it's part of `st`); the noise positions `[k] \ T` are simply ignored. Failure mode: none for the protocol itself — `Dec` outputs `⊥` only if the alleged `(α_i)_{i∈T}` are inconsistent with any low-degree univariate, which happens only if the server is malicious (out of model)&#8201;[^45].

### Complexity

**Asymptotic only — no implementation.**

| Metric | Bounded scheme (§4.2 Low-Work regime) | Bounded scheme (§4.2 Low-Server-Storage regime) | Unbounded scheme (§5.1) |
|--------|--------------------------------------|------------------------------------------------|-------------------------|
| Query size (↑) | `O(k · log|F|) = poly(λ)` | `O(k · log|F|) = O(λ N^ε log N)` | `polylog(N) · poly(λ)` |
| Response size (↓) | `O(k · log|F|) = poly(λ)` | `O(k · log|F|) = O(λ N^ε log N)` | `polylog(N) · poly(λ)` |
| Server computation (online) | `O(k) = λ³` RAM probes | `O(λ N^ε)` RAM probes | `polylog(N)` RAM probes |
| Client computation | `poly(λ) = λ³` (interpolation) | `O(λ N^ε)` | `polylog(N) · poly(λ)` |
| **Server storage `\|DB̃\|`** | `2λ⁶ B` | `N · poly(λ)` (whenever `B = o(N^{1-2ε}/λ²)`) | `\|F\|^m = poly(λ, N)` |
| Amortized storage / query | `\|DB̃\|/B = poly(λ) = λ⁶` | depends on `B` | `\|DB̃\|/∞ → 0` |
| **Preprocessing time** | `poly(λ, N)` | `poly(λ, N)` | `poly(λ, N)` |
| Client persistent storage | `O(λ)` (PRP seeds) | `O(λ)` | `O(λ + r log k) = polylog(N)` |
| Online rounds | 1 | 1 | 1 |
| Query bound `B` | `N⁴ ≤ B ≤ 2^λ / λ³` | `B = o(N^{1-2ε}/λ²)` | unbounded (under HPN) |

References: Theorem 1 + the two example-parameter blocks for §4.2&#8201;[^28]; §5.1 candidate spec and parameter constraint `|F|^m = poly(n), |F|^t = n^{ω(1)}`&#8201;[^33].

**Note on `Resp` access model:** all complexities assume `Resp` has **RAM access** to `DB̃` — a critical distinction from streaming. The `polylog(N)` server time would not be possible with streaming access&#8201;[^12].

### Lower Bounds

| Field | Detail |
|-------|--------|
| **Theorem 2** (answer-size bound) | Public-client statistically-`δ`-secure DEPIR with correctness `ε` ⇒ `\|a\| ≥ (1 - H(ε+δ))N - O(log N)`. Holds even for non-adaptive `δ`-security&#8201;[^31]. |
| **Theorem 3** (key-size bound) | `B`-bounded statistically-`δ_dc`-secure designated-client DEPIR with `\|a\| = o(N)`, `ε = o(1)`, `δ_dc = o(1)` ⇒ `\|sk_dc\| = Ω(B)`&#8201;[^32]. |
| **Variables** | `N` = DB size; `B` = bounded-query bound; `δ`, `δ_dc` = privacy advantages; `ε` = correctness error; `H(·)` = binary entropy. |
| **Model assumptions** | Both bounds assume statistical (information-theoretic) security; the §4.2 scheme uses pseudorandom permutations to compress the `Ω(B)` key down to `O(λ)`, sidestepping Theorem 3's premise. |
| **Proof technique** | Theorem 2: construct `Reconstruct` from any single query; bound `H(DB \| a)` via Stirling/Jensen entropy. Theorem 3: release the key, reduce to Theorem 2, plus BTV12/Dod12 mutual-information lemma `2ε² ≤ I(M;C) ≤ 2ε log(\|M\|/ε)`. |
| **Tightness** | The §4.2 scheme matches Theorem 3 up to `poly(λ)` factors when computational PRPs are used; up to constant factors when statistical permutations are used (i.e., key size grows linearly with `B`). |
| **Implications** | (i) **Information-theoretic single-server DEPIR is impossible** with succinct answers and short keys — computational assumptions are necessary. (ii) Public-client DEPIR cannot achieve information-theoretic security with non-trivial succinctness. |

### Key Tradeoffs & Limitations

- **Public-preprocessing DEPIR (the strongest variant) is unsolved**, and §3 rules out the most natural template (any linear LDC encoding).
- **HPN is a brand-new assumption** with no known reduction to LWE/LPN/SIS; unfalsified after 7+ years (Lin–Mook–Wichs 2023 obtained DEPIR from RLWE via different techniques).
- **`B`-bounded scheme** requires re-preprocessing (or fresh key) every `B` queries; the parameter range `N⁴ ≤ B` of the low-work regime is impractically large for a "low" `B` interpretation (intended as `B = poly(N)`, not `B = polylog(N)`).
- **No implementation, no concrete benchmarks.** All costs are asymptotic — `poly(λ)` factors hidden in `Process` are likely large for the LDC + permutation construction.
- **Adaptive vs. non-adaptive HPN:** the search-to-decision reduction (Theorem 4) handles only the static (selective) variant; adaptive search HPN is not reduced to anything simpler.
- **Designated-client only:** no construction for public-client DEPIR. Concurrent BIPW '17 obtained pk-PIR via VBB obfuscation of `Query`, but only for non-adaptive queries&#8201;[^1].
- **Encrypted DB:** the symmetric-encryption pre-step is a hidden constant cost in `Process` and means the server learns nothing about plaintext content but sees `Õ(N)`-size ciphertext.

### Open Problems

The paper explicitly leaves these:

- **Public-preprocessing DEPIR:** does any construction exist? The §3 no-go rules out only the linear-LDC template. (Open until at least 2024.)&#8201;[^46]
- **Reduce HPN to standard assumptions** (LWE / LPN / coding) — or break it.
- **Adaptive HPN reduction:** extend Theorem 4 to adaptive search HPN.
- **Cryptanalysis of the (1)+(2)+(3)-combined scheme** (all three alterations together): the paper proves only the (2)+(3) variant secure under HPN; the all-three variant is suggested as a more conservative target without a security reduction.
- **Optimize parameters / instantiate with non-Reed–Muller LDCs:** the §4.2 analysis is generic in the LDC; better LDCs would improve concrete bounds.

### Uncertainties

- The paper uses `n` and `N` somewhat interchangeably in §5 (`|F|^m = poly(n)` vs. `|F|^m = poly(N)`); both refer to the database size — interpreted as the same quantity.
- The exact `poly(λ)` exponent in `Process` is not pinned down; "fast" is `λ⁶` for low-work, `λ³` for low-server-storage in `k`/server overhead, but the multiplicative constant for `LDC.Enc` over `F^m` of size `M = poly(λ, B)` is left implicit.
- "Unbounded number of queries" for the §5 candidate is contingent on HPN holding for `poly(N)` samples; the polynomial is not bounded by the paper.

### Footnotes

[^1]: Section 1.2 "Independent Work" (p. 5): "The problem we consider has been independently studied by Boyle, Ishai, Pass and Wootters [BIPW17]. … The notions of designated-client (resp., public-client) doubly-efficient PIR from the present work correspond to the notions of OLDC (resp., pk-PIR) from [BIPW17] (with the exception that they make the additional restriction of non-adaptive queries)." [BIPW17] additional contributions listed: VBB-obfuscation transformation from OLDC to pk-PIR, two barriers (data-structures barrier and LDC barrier), span-program-based ruling out of secret-linear-code learning attacks, and OLDC ⇒ OWF.

[^2]: Section 2 (p. 6): "we only consider honest-but-curious database servers, i.e. we trust the database server to run Resp (and sometimes also Process) as specified."

[^3]: Section 1.1 "Our contributions" item 1 (p. 2): bounded-query scheme based on any one-way function. Item 2 (p. 2): unbounded-query scheme whose security reduces to HPN.

[^4]: Section 4.2 (p. 10): "By using pseudo-randomness in our schemes, the client storage can be reduced to poly(λ), where λ is a security parameter for computational hardness." References [MRS09] for small-domain pseudorandom permutations.

[^5]: Section 1.1 item 2 + Section 5 (pp. 2, 18): "we introduce a new computational problem, which we call the hidden permutation with noise (HPN) problem … HPN is a noisy learning problem and is thus superficially similar to other 'standard' cryptographic assumptions (e.g. LWE, LPN), but we do not know of any reduction to these assumptions."

[^6]: Theorem 1 (p. 11): the §4.2 scheme is `B`-bounded designated-client DEPIR with statistical `2^{-λ}`-security; the perfect correctness statement appears immediately after the scheme description (p. 10).

[^7]: Section 2 Definition 1 (p. 6): scheme is `(Keygen, Process, Query, Resp, Dec)` — `Query` produces `(q, st)`, server returns `a = Resp^{DB̃}(q)`, client decodes via `Dec(K, st, a)`. No back-and-forth.

[^8]: Abstract (p. 1): "Beimel, Ishai and Malkin (JoC 2004) show PIR schemes where, following a linear-work preprocessing stage, the server's work per query is sublinear in the database size. However, that work only addresses the case of multiple non-colluding servers."

[^9]: Section 1 (p. 2): "Paraphrasing [GR17], we call this primitive doubly efficient PIR (DEPIR)." [GR17] = Goldreich-Rothblum, "Simple doubly-efficient interactive proof systems for locally-characterizable sets," ECCC 2017.

[^10]: Section 1 paragraph beginning "Is this bottleneck really inevitable?" (pp. 1–2): contrasts ORAM, which "inherently require[s] the client to (a) keep secret state and (b) be able to update the database."

[^11]: Stated by reference in concurrent multi-server-DEPIR-2025 paper (p. 2 of MultiServerDEPIR_2025.pdf): "Very recently, in a seminal paper by Lin et al. [57] which makes use of a polynomial preprocessing algorithm by Kedlaya and Umans [47] to achieve a PIR scheme which preprocesses in time `O_λ(N^{1+o(1)})` …"

[^12]: Definition 1 (p. 6): "Π is doubly efficient if all algorithms are polynomial in λ, |DB̃| = poly(λ, N), and Query, Resp, Dec are sublinear in N, where Resp is given RAM access to DB̃. (Ideally, these algorithms are polylogarithmic in N.)"

[^13]: Section 1.1 Candidate constructions and analysis (p. 3): "D̂ is the truth table of the low degree extension of D … client chooses a line φ : F → F^m such that φ(0) = i, and sets q = (φ(1), …, φ(k)) where k = d+1. Upon receiving the server's response (x_1, …, x_k), client recovers D(i) = φ(0) by interpolation."

[^14]: Section 1.1 (p. 4): the three alterations (1) secret evaluation points, (2) random noise points, (3) preprocessing-time encryption + secret pseudorandom permutation `π ∈ Perm(F^m)` of `D̂` so the server stores `D̂ ∘ π^{-1}`.

[^15]: Section 2 (pp. 6–8): three security levels — Designated client (Definition 2), Public client (Definition 3), Public preprocessing — plus variants: bounded-query DEPIR with amortized storage overhead `|DB̃|/B`, database privacy, non-adaptive database generation, global key generation, public client with secret preprocessing key.

[^16]: Section 2 (p. 6): "Our formal notions of security are inspired by UC security, and can be formulated via realizing appropriate variants of an 'ideal PIR functionality'. However, for self-containment we present them directly via the following games."

[^17]: Section 3 (p. 8): "we show that even this general template fails, as long as the LDC in use is *linear* — which rules out the vast majority of the LDCs studied in the literature. We are inspired by a recent work of Kalai and Raz [KR17]."

[^18]: Section 3 (p. 8): the template's interpolability condition: "DB̃|_Q determines DB(i). That is, any m-variate polynomial g of degree |H|-1 which agrees with D̂ on Q also agrees with D̂ (and therefore DB) on i."

[^19]: Proposition 1 + Definition 4 (p. 8): "Let C : F^N → F^M be a linear code. Then there is a poly(M)-time algorithm which takes as input a set of queries Q ⊆ [M], and outputs all indices i ∈ [N] which are determined by Q. Furthermore, there are at most |Q| such indices." Proof via "e_i is in the row span of G_Q."

[^20]: Section 3 (p. 8): the linear-LDC template fails because `|Q|` is `polylog(N)` and `Q_i ≈_c Q_{i'}` requires the determined-index sets to also be indistinguishable, which Proposition 1 rules out.

[^21]: Section 4.1 (p. 9): trivial scheme `Keygen` outputs uniform `π : [N] → [N]`; `Process(K, DB)(i) = DB(π(i))`; `Query(K, i)` outputs `q = π(i)`; "If the client is allowed to keep long-term state … then one can obtain a B-query scheme by concatenating B single-query schemes, resulting in server (and client) storage which is Θ̃(BN). With a stateless client however, it is not even clear how to support 2 queries."

[^22]: Definition 5 (p. 10): LDC is `(Enc, Query, Dec)` with `Enc : Σ^N → Σ^M` deterministic, `Query : [N] → [M]^k` randomized with state, `Dec` p.p.t. "The locally decodable code is said to be t-smooth if when sampling (st, (j_1, …, j_k)) ← Query(i), (j_{s_1}, …, j_{s_t}) is uniformly distributed on [M]^t for every distinct s_1, …, s_t."

[^23]: Section 4.2 footnote 2 (p. 10): "Our definition differs from the standard definition of locally decodable codes in that it does not require any robustness against codeword errors, and we assume that the decoding queries are non-adaptive."

[^24]: Section 4.2 (p. 10): "By using pseudo-randomness in our schemes, the client storage can be reduced to poly(λ)" + reference to [MRS09] small-domain PRP for compressing the `q` permutation keys.

[^25]: Section 4.2 `Process` description (p. 10): "Output `DB̃ = (DB̃^{(1)}, …, DB̃^{(k)})`, where `DB̃^{(i)}` is defined by permuting the coordinates of `LDC.Enc(DB)` by `π_i`. That is, `DB̃^{(i)}_{π_i(j)} = LDC.Enc(DB)_j`."

[^26]: Section 4.2 "The Reed-Muller Based Scheme" (p. 11): `H ⊂ F` with `|H|^m = N`, `|F|^m = M`; correctness needs `|F| ≥ m·t·(|H|-1) + 1`; encoding outputs `D̂ ∈ F^{F^m}`; query is `(x_1, …, x_k) = (φ(1), …, φ(k))` for random degree-`t` curve through `z`; decode via univariate Lagrange.

[^27]: Theorem 1 (p. 11): "the above SSPIR scheme is a B-bounded designated client DEPIR scheme with statistical 2^{-λ}-security. Furthermore, the scheme provides database privacy." Parameter constraint `2Bk^{t-1}(B/M)^{t/2-1} = 2^{-λ}` appears in both example parameter blocks.

[^28]: Section 4.2 "Example Parameters" (p. 11): "Low Work" with `|H| = λ`, `m = log N / log λ`, `|F| = (2λ⁶B)^{1/m}`, `M = 2λ⁶B`, `k = λ³`, `t = 2(λ + log(2Bk) + 1)`, valid for `N⁴ ≤ B ≤ 2^λ/λ³`. "Low Server Storage" with `|H| = max(λ, N^ε)`, `m = log N / log|H|`, `k = O(λ N^ε)`, `M = max(N λ^{1/ε}, 2k²B) = N · poly(λ)` when `B = o(N^{1-2ε}/λ²)`.

[^29]: Lemma 1 + Lemma 2 (pp. 12–13): `t`-wise independent variables with the same marginals where Pr[X_i = ★] ≥ 1 - ε satisfy `d_TV(X̄, Ȳ) ≤ (kε)^{t/2} + k^{t-1}ε^{t/2-1}`. Lemma 2 generalizes Braverman's [Bra09] AC^0-fooling result to single conjunctions with non-uniformly-distributed `X'_i`.

[^30]: Section 4.3 (pp. 14–15): the QueryDist algorithm and Lemma 3. Specifically (p. 15): "If QueryDist is given inputs `{(j'_{α,1}, …, j'_{α,k})}` which are all queries for the same index, it outputs fixed with probability 1. If given … queries to random indices, it outputs random with probability `1 - 2^{-Ω(λ)}` over the queries."

[^31]: Theorem 2 (p. 16): "In any statistically δ-secure public-client DEPIR with correctness error ε: |a| ≥ (1 - H(ε+δ))N - O(log N). In fact, this lower bound holds even if the PIR is only non-adaptively δ-secure."

[^32]: Theorem 3 (p. 17): "In any B-bounded-query statistically `δ_dc`-secure, (1-ε)-correct designated-client DEPIR, the key size `|sk_dc|` satisfies `|sk_dc| ≥ (1 - 2δ_dc - H((1-δ_pc)/2))·B - O(log B)` … In particular, if |a| = o(N), ε = o(1), and `δ_dc = o(1)`, then `|sk_dc| = Ω(B)`."

[^33]: Section 5.1 "Notation" (p. 19): "let `(m, t, r, k, F)` be such that `m < t < r < k < |F|` and `H ⊂ F` such that `|H|^m = N` and `m(t-1)(|H|-1) < r`. Also, `|F|^m = poly(n)` while `|F|^t = n^{ω(1)}`."

[^34]: Section 5.1 `Process` description (p. 19): "let `D̂ : F^m → F` be the low degree extension … Output `DB̃ = {(x, τ(x, D̂(π^{-1}(x))))}_{x ∈ F^m}`."

[^35]: Definition 6 (p. 19): "Let (m, t, r, k, F) be such that … For π ∈ Perm(F^m), z ∈ F^m and T ⊂ [k], let D(π, z, T) be the distribution which: draws x̄ ← V_z and outputs ȳ ∈ F^{mk} where y_i = π(x_i) if i ∈ T and y_i ←$ F^m otherwise."

[^36]: Definition 7 "The HPN Assumption" (p. 20): Search and Decision versions stated formally. Search: Pr_{π,T,{ȳ_α}}[A({ȳ_α}) = π] < δ. Decision: ∣Pr_{ȳ_α ← D(π,z_α,T)}[A({ȳ_α}) = 1] − Pr_{ȳ_α ← F^{km}}[A({ȳ_α}) = 1]∣ > δ has probability < δ over π, T.

[^37]: Section 5 (p. 18): "The parameters are set so that k ≈ d^2; however l can be significantly larger, so a sample may not uniquely determine φ even if π is known."

[^38]: Claim 5 (p. 20): "The candidate scheme is secure assuming decisional HPN." Proof sketch given via a static-to-adaptive argument exploiting `|F|^m = poly(n)`.

[^39]: Theorem 4 (p. 20) and §5.3–5.4: search-to-decision reduction via two algorithms, CLEAN (recovers `T' ⊂ T` of size `≥ t+1`) and RecoverPerm (recovers `π` via linear algebra from `B = mλ|F|^{3m+3}` samples per address `z ∈ H^m`).

[^40]: Lemma 7 (p. 22): "Suppose `f_1, …, f_k : F^m → F^m` are such that Pr_{x̄ ← V_z}[f̄(x̄) ∈ V_z] ≥ 1 - |F|^{-(2m+2)} for all z ∈ F^m. Then there exists a curve φ : F → F^m of degree at most t satisfying φ(0) = 0 such that f_i(x_i) = x_i + φ(i) for all i = 1, …, k. In particular, if all f_i are equal then each f_i is the identity function." This algebraic uniqueness drives RecoverPerm's correctness.

[^41]: Section 1.1 "Related Work" (p. 5): "[NP06] Naor-Pinkas noisy polynomial interpolation … two main differences between this assumption and our HPN assumption are that (i) we completely hide the algebraic structure of the underlying field by permuting the polynomial's domain, and (ii) we work with multivariate polynomials rather than univariate polynomials, which can sometimes make reconstruction problems much more difficult [GKS10]."

[^42]: Section 1.1 (p. 3): "HPN is a noisy learning problem and is thus superficially similar to other 'standard' cryptographic assumptions (e.g. LWE, LPN), but we do not know of any reduction to these assumptions." (Status remained unchanged through 2017–2023; LMW '23 instead obtained DEPIR from RLWE via Kedlaya-Umans modular composition rather than HPN.)

[^43]: Section 4 "Database encryption" (p. 9): "In both schemes the first step in the preprocessing of the database is to encrypt each entry, using some semantically secure symmetric encryption, with a key that's part of the clients secret key … For simplicity of presentation, we omit the encryption step from the description of both schemes."

[^44]: Section 1.1 (p. 3): "the database D ∈ {0,1}^N choose a field F of size polylog(N) and a subset H ⊂ F of size log N. The database is viewed as a function D : H^m → {0,1}, where m = log N / log log N so that |H^m| = N. With this setup in place, D̂ is the truth table of the low degree extension of D. That is, D̂ = {D̂(x) : x ∈ F^m}, where D̂ : F^m → F is the unique m-variate polynomial of degree at most (|H|-1) in each variable, such that D̂(i) = D(i) for all i ∈ H^m. The total degree of D̂ is d = O(log² N)."

[^45]: Section 5.1 `Dec` description (p. 19): "Let ψ : F → F be the unique univariate polynomial of degree at most m(t-1)(|H|-1) such that ψ(i) = α_i for all i ∈ T. Output ⊥ if no such polynomial exists; otherwise output ψ(0)." With honest server and `r = |T| > deg(ψ)`, `ψ` exists uniquely.

[^46]: Section 3 opening (p. 8): "Whether public-preprocessing doubly efficient PIR schemes exist is left as a fascinating open question." The §3 result rules out only the linear-LDC template, not the general question.
