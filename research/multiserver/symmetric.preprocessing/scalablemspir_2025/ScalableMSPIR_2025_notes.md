## Scalable MSPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Scalable Multi-Server Private Information Retrieval](https://eprint.iacr.org/2024/765) (TCC 2025; ePrint 2024/765, full version)&#8201;[^1] |
| **Authors** | Ashrujit Ghoshal (IIT Madras), Baitian Li, Yaohua Ma, Chenxin Dai (Tsinghua IIIS), Elaine Shi (CMU). Author ordering randomized.&#8201;[^1] |
| **Archetype** | Construction (theory-only) + Building-block (generic balancing technique). Multi-construction paper presenting three scalable schemes plus a generic compiler. |
| **PIR Category** | S-server (S non-colluding), information-theoretically secure, with **server-side global preprocessing**. Filed under exploratory `multiserver/symmetric.preprocessing/`. Conceptually closest to Beimel–Ishai–Malkin's [BIM04] preprocessing PIR family in the single-server taxonomy.&#8201;[^2] |
| **Asymmetry profile** | **Symmetric across servers** — each server holds the same encoded DB and runs the same `Answer` algorithm; queries are identically distributed across servers (Assumption 7.1). The paper's *tradeoff knob* is between **per-query bandwidth, per-server computation, per-server storage, and number of servers S** — not between servers.&#8201;[^3] |
| **Security model** | S non-colluding servers, **information-theoretic privacy** (no hardness assumptions): for any pair of indices, the marginal distribution of any single server's query is identical. Privacy holds against any S−1 colluding servers (security against any single server's view, not S−1 — see §3 Definition).&#8201;[^4] |
| **Additional assumptions** | None — IT-secure. Uses only finite-field arithmetic and multiplicity codes (Kopparty–Saraf–Yekhanin); no FHE, no DDH, no PRG. |
| **Correctness model** | **Deterministic** — Hermite interpolation of Hasse derivatives recovers `DB[i]` exactly whenever the parameter constraint `S·t > d` is satisfied.&#8201;[^5] |
| **Rounds (online)** | 1 (client sends a single field-element vector to each of the S servers; servers reply in parallel). |
| **Doubly efficient?** | Yes for Theorems 1.1, 1.2 when S = ω(1); for Theorem 1.3 when S is super-polylogarithmic. (DEPIR = n^o(1) bandwidth+computation per query, n^{1+o(1)} server space.)&#8201;[^6] |

[^1]: Title page (p.1): "Scalable Multi-Server Private Information Retrieval" with footnote "A preliminary version of this paper appears in the proceedings of TCC 2025. This is the full version" and "Author ordering is randomized." Authors and affiliations listed: Ashrujit Ghoshal (IIT Madras), Baitian Li, Yaohua Ma, Chenxin Dai (Tsinghua IIIS), Elaine Shi (CMU).
[^2]: §1 (p.4): "we revisit multi-server PIR, where a client interacts with S non-colluding servers." §3 Definition 3.1 (p.16) defines S-server PIR with global preprocessing where each server runs `DB̃_s ← Preproc_s(DB)`.
[^3]: §7 (p.36) "Natural assumptions on the underlying PIR scheme": Assumption 7.1 (p.36) — "Each server s ∈ ⟦S⟧ uses same deterministic preprocessing algorithm DB̃ ← Preproc(DB) and response algorithm Answer(DB̃,Q_s)" and "for any s_1,s_2 ∈ ⟦S⟧, the distributions {Q_{s_1}: ...} and {Q_{s_2}: ...} are identical." All known S-server PIR schemes (including those in this paper) satisfy this.
[^4]: §3 Definition 3.1, "Security" (p.16): "for any n,S, for any i_1,i_2 ∈ ⟦n⟧ and any s ∈ ⟦S⟧, the distributions {Q_s : (Q_0,…,Q_{S−1}) ← Query(n,i_1)} and {Q_s : (Q_0,…,Q_{S−1}) ← Query(n,i_2)} are identical." Privacy is per-single-server view — the construction only argues privacy against one corrupted server in §4.2.2 (p.21) and §6.3 (p.32).
[^5]: §4.2.1 "Proof of Correctness" (p.21): correctness "immediately follows from Claim 4.6" which uses Hermite interpolation when S·t > d. §6.2 "Proof of Correctness" (p.32) argues correctness for the polynomial-space variant deterministically.
[^6]: §1.1 "Relation to doubly-efficient" (p.5): "in the literature [LMW23, LLFP24], it is customary to use the term doubly efficient to describe a PIR scheme that achieves n^{o(1)} bandwidth and computation per query, and n^{1+o(1)} server space … in Theorem 1.1 and Theorem 1.2, we achieve the notion of doubly efficient as long as S is a super-constant function in n. In Theorem 1.3, we would satisfy doubly efficient as long as S is super-polylogarithmic in n."

### Asymmetry Profile

| Aspect | Detail |
|--------|--------|
| **Inter-server symmetry** | All S servers are identical: same `Preproc`, same `Answer`, identically distributed query messages. The construction is a *natural* PIR scheme per Assumption 7.1.&#8201;[^3] |
| **Tradeoff knob** | The paper does **not** trade asymmetry between servers; instead it sweeps a *Pareto frontier* over four metrics — per-server bandwidth, per-server computation, per-server space, and number of servers S — by varying the multiplicity-code parameters (m, q, d, t) and the polynomial-preprocessing data structure. |
| **The "balancing" knob (§7)** | A generic compiler that trades **server space and computation** ↔ **bandwidth**: partition DB into B = n^{1−μ} blocks of n^μ bits, run base PIR on each block, aggregate via XOR into two slots controlled by per-block random bits. Result: bandwidth O(n^{1−μ}·C_up(n^μ) + C_down(n^μ)), server work O(n^{1−μ}·T_answer(n^μ)), storage O(n^{1−μ}·M(n^μ)).&#8201;[^7] |
| **What it is not** | Not role-asymmetric (no offline-server vs. online-server split like SinglePass/TAPIR). Not content-asymmetric (no shard split). Not trust-asymmetric. |

[^7]: §7.4 "Efficiency" + Lemma 7.2 (p.39): "for any 0 < μ ≤ 1, there exists an S-server PIR scheme satisfying Assumption 7.1, it can achieve O(n^{1−μ}·C_up(n^μ)+C_down(n^μ)) per-server bandwidth, O(n^{1−μ}·T_answer(n^μ)) per-server computation … with O(n^{1−μ}·M(n^μ)) server storage and O(n^{1−μ}·T_preproc(n^μ)) preprocessing time." Compared to "naïve balancing" (CGKS95, BIM04 Lemma 4.4) which works only when upload > download (p.14), this technique handles the opposite (and more common) regime.

### Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | S, parameterizable: super-constant (Thms 1.1, 1.2), super-polylogarithmic (Thm 1.3), or constant (poly-space setting, Thm 1.4 / §6). |
| **Replication** | All S servers store the *same* preprocessed encoding `DB̃ ← Preproc(DB)` of the n-bit database.&#8201;[^3] |
| **Trust model** | Non-colluding, semi-honest. Privacy holds against any single corrupted server's view; the paper does not analyze threshold collusion. |
| **Communication topology** | Star — client talks to each server independently in parallel; no server-server channel. |
| **Server symmetry of role** | **Fully symmetric** — every server runs the identical deterministic `Preproc` and `Answer` (Assumption 7.1). The s-th server is distinguished only by the field element λ_s the client multiplies its random direction `v⃗` by. |
| **Online round structure** | Client sends z⃗_s = u⃗ + λ_s·v⃗ (or λ_s·u⃗+v⃗ in §6's optimization) to each server; server returns ⟨∂̄^a⃗ ∘ F(z⃗_s)⟩ for all a⃗ ∈ A_{<t,m}; client runs Hermite interpolation. |
| **Realizability of non-collusion** | Standard multi-server PIR assumption — different organizations / jurisdictions running each server. Not addressed concretely. |
| **Comparison to BIM04** | BIM04 [BIM04] is the closest prior work — same model (S-server, server-side preprocessing), same multiplicity-code-style algebraic structure, but BIM04's server space grows as n^{ω(S²/log S)} (anti-scalable), while this paper's storage scales **down** with S. |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Beimel–Ishai–Malkin '04 [BIM04] (preprocessing S-server PIR from polynomial encodings); Woodruff–Yekhanin '05 [WY05] (geometric / multilinear-polynomial 2-server PIR with balancing); Kopparty–Saraf–Yekhanin '14 [KSY14] (multiplicity codes); Bhargava–Ghosh–Guo–Kumar–Umans '24 [BGG⁺24] (fast multivariate multipoint evaluation); Kedlaya–Umans '08 [KU08] (fast modular composition / polynomial multipoint evaluation); Lin–Mook–Wichs '23 [LMW23] (DEPIR from RingLWE — borrowed for DB-to-polynomial interpolation, Lemma 2.2).&#8201;[^8] |
| **What changed** | (i) Uses *Hasse derivatives* and *order-t* multiplicity codes to reduce field size & redundancy, getting `t·S > d` as the only correctness constraint (vs. BIM04's stronger requirements). (ii) Couples multiplicity codes with [BGG⁺24]'s polynomial preprocessing to break the bandwidth/storage coupling that limits BIM04. (iii) Introduces a **new generic balancing theorem** for the regime upload < download (opposite of CGKS95's classical balancing), which is the regime preprocessing PIR actually lives in.&#8201;[^9] |
| **Concurrent work** | Lazzaretti–Liu–Fisch–Papamanthou '24 [LLFP24] "Multi-server doubly efficient PIR" (ePrint 2024/829) — also from multiplicity codes; Singh–Wei–Zikas '24 [SWZ24] "IT multi-server PIR with client preprocessing" (TCC '24, n^{O(1/S)} bandwidth but computation stuck at n^{1/2}). The present paper improves over both: strictly better than [LLFP24]'s constructions in §5 (Remark 5.6), and unlike [SWZ24] also scales computation. |
| **Superseded by** | None as of TCC 2025 — represents state-of-the-art scalable multi-server PIR. |

[^8]: §1 "Introduction" (p.4) lists prior work; §4.1 "Preliminaries on Multiplicity Codes" (p.17) cites [KSY14] for the multiplicity-code definition; §5 (p.23) attributes polynomial preprocessing to [BGG⁺24] (Theorem 5.1) and [KU08] (Theorem 5.2); §4.2 (p.19) cites [LMW23, Lemma 2.2] for DB → polynomial interpolation.
[^9]: §1.1 "Our Main Results" (p.4–5); §1.2 "A generic balancing technique" (p.7): "this naïve balancing trick is tailored for the case when the original PIR scheme has more upload bandwidth than download bandwidth … Unfortunately, Beimel et al. [BIM04]'s preprocessing PIR scheme as well as our improved version in §6 have the opposite behavior."

### Core Idea

Encode the n-bit DB as an m-variate polynomial F ∈ 𝔽_q[X_1,…,X_m] of total degree ≤ d by placing DB[i] as either a *coefficient* (§4.2, §6) or an *evaluation* (alternative interpretation) at the q-ary representation E(i) of i. To query index i with E(i) = u⃗, the client samples a fresh random direction v⃗ ←$ 𝔽_q^m and S distinct nonzero scalars λ_0,…,λ_{S−1}, then sends z⃗_s = u⃗ + λ_s·v⃗ (or λ_s·u⃗ + v⃗ in §6) to server s. Each server returns the evaluation of F together with all its **Hasse derivatives up to order t−1** at z⃗_s — this is exactly the order-t multiplicity-code symbol at z⃗_s.&#8201;[^10] Setting f(λ) := F(u⃗ + λv⃗), the chain rule for Hasse derivatives (Lemma 4.3) lets the client locally reconstruct ∂̄^{(k)}f(λ_s) for all 0 ≤ k < t and all s ∈ ⟦S⟧. Since deg(f) ≤ d and **S·t > d**, Hermite interpolation of Hasse derivatives (Lemma 4.4 [BGKM22]) recovers f, and f(0) = F(u⃗) = DB[i].&#8201;[^11]

The three settings of Theorems 1.1–1.3 differ only in *how the server stores its precomputations* and *how the parameters (m, q, d, t) are chosen*:
- **§4 (Theorem 1.1, equal scaling)**: server stores the table of values ∂̄^a⃗ ∘ F at every point of 𝔽_q^m for every a⃗ ∈ A_{<t,m}. Storage O(|A_{<t,m}|·q^m·log q).
- **§5.1 (Theorem 1.2, min bandwidth)**: server replaces brute-force tables with the polynomial-preprocessing data structure of [BGG⁺24] for each ∂̄^a⃗ ∘ F. This decouples server space from m, allowing larger m → smaller bandwidth.
- **§5.2 (Theorem 1.3, min online bottleneck)**: same idea but uses the *faster-evaluation* preprocessing of [KU08] (smaller online time, larger storage) so that bandwidth and computation scale at the same rate.

[^10]: §4.2 "PIR Family from Multiplicity Codes" (p.19–20): the formal `Preproc/Query/Answer/Recons` quadruple. Query: "the client uniformly generates v⃗ ∈ 𝔽_q^m and sets u⃗ = E(i). Then it picks S distinct and nonzero elements in 𝔽_q called λ_0,…,λ_{S−1}. For s ∈ ⟦S⟧ the client sets z⃗_s = u⃗ + λ_s v⃗." Answer: "the s-th server … sends ans_{s,a⃗} = ∂̄^a⃗ ∘ F(z⃗_s) … back to the client." Recons: applies the chain rule then Hermite-interpolates f.
[^11]: §4.1 Lemma 4.3 "Chain rule for Hasse derivatives" (p.18): ∂̄^{(k)}g(λ) = Σ_{a⃗ ∈ A_{k,m}} ∂̄^a⃗ ∘ f(u⃗+λv⃗) · v⃗^a⃗. Lemma 4.4 "Hermite interpolation of Hasse derivatives" [Has36, BGKM22] (p.18). Claim 4.6 (p.19) packages these into the correctness statement S·t > d. The constraint q ≥ S+1 ensures S distinct nonzero λ_s exist.

### Variants

The paper presents **three main constructions** plus a **fourth (poly-space)** plus a **balancing compiler**, all instantiating the same algebraic template with different parameter regimes and different polynomial-preprocessing data structures.

| Variant | Section | Goal | Per-server bandwidth | Per-server computation | Server storage | Doubly-efficient when |
|---------|---------|------|----------------------|------------------------|----------------|-----------------------|
| **Equal scaling** (Thm 1.1 / 4.9 / Cor 4.10) | §4.3 | All metrics scale at the same rate Õ(n^{2/(log S − 1)}) | Õ(n^{2/(log S −1)} log S) | Õ(n^{2/(log S −1)} log S) | Õ(n^{1+2/(log S−1)}·S·polylog n) | S = ω(1) |
| **Min bandwidth** (Thm 1.2 / 2.2 / Cor 5.4) | §5.1 | Minimize per-server bandwidth subject to scalability in *all* metrics | n^{Õ(log² S/(S log log S))+O(log S/log n)}·polylog(n,S) | n^{Õ(log² S/(S log log S)) + O(1/log log S) + O(log S/log n)}·polylog(n,S) | n^{1+O(log² S/(S log log S))+O(log log S/log log S)+O(log S/log n)}·polylog(n,S) | S = ω(1) |
| **Min online bottleneck** (Thm 1.3 / 2.3 / Cor 5.8) | §5.2 | Minimize max(bandwidth, server time) — same scaling rate for both | n^{Õ(1/S^{1/ω(1)}) + O(log S/log n)}·polylog(n)·log S | n^{Õ(1/S^{1/ω(1)}) + O(log S/log n)}·polylog(n,S) | n^{1+Õ(1/S^{1/ω(1)})+O(log S/log n)+O(log log n·ω(1)/log S)}·polylog(n,S) | S super-polylogarithmic in n |
| **Poly-space** (Thm 1.4 / 6.4 / Cor 6.5) | §6 | Polynomial server space, minimize bandwidth — direct improvement over [BIM04] | Õ(n^{(1+ε)/S} log S) | Õ(n^{(1+ε)/S} log S) | n^{0.368·ε·S^{(1+o(1))}/ε} | (S constant — focus is on poly-space, not DEPIR) |
| **Poly-space + balancing** (Cor 6.8 / Thm 1.5) | §6.5 + §7 | Apply the new balancing trick to Thm 1.4 with α = 1/(S+1) | O(n^{(1+ε)/(S+1)} log S) | O(n^{(2+ε)/(S+1)} log S) | poly(n) | — |
| **Generic balancing compiler** (Lemma 7.2) | §7 | Black-box transform of any "natural" S-server PIR | O(n^{1−μ}C_up(n^μ) + C_down(n^μ)) | O(n^{1−μ}T_answer(n^μ)) | O(n^{1−μ}M(n^μ)) | depends on base scheme |

The poly-space construction (§6) further uses a **multilinear** polynomial F = Σ_i DB[i]·X⃗^{E(i)} where E maps indices to {0,1}^m bit-strings of Hamming weight exactly d (with m chosen via Lemma 6.1 so that (m choose d) ≥ n). Reconstruction extracts DB[i] as the coefficient of λ^d in f(λ) = F(λu⃗ + v⃗) — a different decoding than standard multiplicity-code decoding (Remark 6.2).&#8201;[^12]

[^12]: §6.1 "Construction" (p.31): F(X⃗) = Σ_{i∈⟦n⟧} DB[i]·X⃗^{E(i)} where E maps to {0,1}^m of Hamming weight exactly d. §6.2 Claim 6.3 (p.32): proves DB[i] = Coeff_{λ^d}(f(λ)) when f = F(λu⃗+v⃗). Remark 6.2 (p.30): "we encode a database with a multiplicity code of order-⌈(d+1)/S⌉ evaluations of degree-d multilinear polynomials in m variables, and use the multilinear property to give an alternate reconstruction technique." The optimization q = S (rather than S+1) saves one factor in field size, achievable because letting λ_s ∈ 𝔽_q (allowed to be zero) does not leak u⃗.

### Novel Primitives / Abstractions

| # | Name | Detail |
|---|------|--------|
| 1 | **Hasse-derivative multiplicity-code PIR template** | Generalizes the BIM04 / WY05 polynomial-encoding paradigm to arbitrary order-t multiplicity codes, exposing parameters (m, q, d, t) that can be tuned independently. The client only needs `S·t > d` for correctness — strictly weaker than prior 2-server multilinear constructions which need `S > d`.&#8201;[^11] |
| 2 | **Polynomial-data-structure server** | Replaces the server's brute-force evaluation table with a [BGG⁺24]/[KU08] data structure. Storage drops from n·q^m to roughly n^{1+o(1)} while online evaluation remains n^{o(1)}.&#8201;[^13] |
| 3 | **Generic balancing compiler (Lemma 7.2)** | Black-box transform of any "natural" S-server preprocessing PIR (Assumption 7.1) that has download ≫ upload, into a scheme with balanced (smaller total) bandwidth at the cost of `n^{1−μ}` computation/storage blowup. Reduces to running the base PIR on B = n^{1−μ} blocks and aggregating answers via XOR into two control-bit slots so all S servers can collectively recover all S per-block answers (vs. naïve balancing that reduces upload only).&#8201;[^14] |
| 4 | **Two-slot XOR aggregation invariant** | Per-block random control bits b_j and per-server slot bits b'_{j,s} ensure: (i) for the relevant block r, ≥1 server XORs into slot 0 and ≥1 into slot 1 (so the client recovers ans_{r,0} and ans_{r,s'} for some s' via combining the two servers' two-slot output); (ii) for every non-relevant block j ≠ r, all S servers XOR into the same slot b_j so they cancel under XOR. This is the technical heart of §7.&#8201;[^15] |

[^13]: §5 (p.23–24): "instead of pre-compute the evaluation of the polynomials at all points, [the server] stores a data structure. In the online phase, the server uses this data structure to evaluate the polynomials at the desired point." Theorem 5.1 cites [BGG⁺24, JACM 2024] for the polynomial-preprocessing primitive: PolyPreprocess time (16d'(log d'+log log q))^m·polylog, EvalPoly time 16^m·polylog. Theorem 5.2 cites [KU08] (slower preprocessing, faster evaluation).
[^14]: §7 "A Generic Balancing Method" (p.36–39); Lemma 7.2 (p.39). Acknowledgments (p.39): "We gratefully acknowledge Yuval Ishai and Henry Corrigan-Gibbs for suggesting the generic balancing technique. The version described in our paper is a slight improvement of their original idea."
[^15]: §2.5 "Our idea" (p.15) and §7.1 (p.37): "For the relevant block r, at least one server XORs the answer into slot 0, and at least one server XORs the answer into slot 1 … For each non-relevant blocks j ≠ r, all servers XOR the answer of block j in the same random slot b_j." Equations (1) and (2) on p.15 show the recovery argument. Appendix B (p.46+) removes the "naturalness" Assumption 7.1 by first compiling any PIR to a natural one with S-factor blowup.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **None** — privacy is information-theoretic. The construction relies only on uniform sampling of v⃗ ∈ 𝔽_q^m and the algebraic identity z⃗_s = u⃗ + λ_s v⃗ being uniformly distributed when v⃗ is uniform (so each individual server's view is independent of u⃗).&#8201;[^4] |
| **Encoding scheme** | **Multiplicity codes** of order t over 𝔽_q (Kopparty–Saraf–Yekhanin '14, [KSY14]): codewords are (∂̄^a⃗ ∘ F(x⃗))_{a⃗∈A_{<t,m}, x⃗∈𝔽_q^m}, parameterized by m (variables), d (total degree), t (multiplicity order), q (field size).&#8201;[^16] |
| **Correctness condition** | `t · S > d` (Hermite interpolation needs ≥ d+1 derivative-values; each server contributes t Hasse derivatives of f, so S servers contribute S·t of them; we need S·t > d).&#8201;[^11] |
| **Field-size constraints** | q ≥ S+1 (need S distinct nonzero λ_s for the §4 construction; q ≥ S suffices in §6 where one λ_s may be zero). q must be a prime or prime power. By Bertrand's postulate, q can be chosen ≤ 2S. |
| **Encoding constraints** | (i) q^m ≥ n (injective map E: ⟦n⟧ → 𝔽_q^m exists). (ii) (m+d choose m) ≥ n (m-variate degree-d polynomial has ≥ n monomials, enough to interpolate n values). (iii) S·t > d. |
| **Key structure** | None — no secret keys; client randomness is only v⃗ ∈ 𝔽_q^m and (λ_0,…,λ_{S−1}) which are sent in the clear (the λ_s only define the multiplicity-code coordinates). |

[^16]: §4.1 Definition 4.5 "Multiplicity Code [KSY14]" (p.18): "Encode_{t,d,m,q}(F) = ((∂̄^a⃗ ∘ F(x⃗))_{a⃗∈A_{<t,m}})_{x⃗∈𝔽_q^m}." The code has length q^m, alphabet size q^{(m+t−1 choose m)}.

### Notation

| Symbol | Meaning |
|--------|---------|
| n | Database size in bits |
| S | Number of (non-colluding) servers |
| q | Field size; must be prime power, q ≥ S+1 |
| m | Number of variables in the polynomial F |
| d | Total degree of F (or `d' ≤ md` = individual degree per variable, in §5) |
| t | Multiplicity-code order — number of Hasse-derivative orders each server returns |
| λ_s | Distinct nonzero element of 𝔽_q assigned to server s |
| u⃗ | E(i), the q-ary (or {0,1}^m in §6) encoding of the queried index i |
| v⃗ | Uniformly random masking vector in 𝔽_q^m |
| z⃗_s | u⃗ + λ_s·v⃗ (§4–§5) or λ_s·u⃗ + v⃗ (§6) — point sent to server s |
| F | The encoding polynomial (∈ 𝔽_q[X_1,…,X_m]) of the DB |
| ∂̄^a⃗ ∘ F | Hasse partial derivative of F with multi-index a⃗ ∈ ℕ^m |
| A_{<t,m} | {a⃗ ∈ ℕ^m : wt(a⃗) < t} — index set of Hasse-derivative orders the server returns |
| H(θ) | Binary entropy function — appears in §6 storage exponent |
| ω(1) | Arbitrarily slow super-constant function (used for asymptotic separation) |
| C_up, C_down | Per-server upload, download bandwidth of underlying PIR (in §7 balancing lemma) |

### Protocol Phases

| Phase | Who | What | Cost (§4 base scheme, asymptotic) |
|-------|-----|------|-------------------------------------|
| **Preproc** (one-time, per server) | Each server s ∈ ⟦S⟧ | Interpolate F from {DB[i]}_{i∈⟦n⟧} via [LMW23, Lemma 2.2]; for each a⃗ ∈ A_{<t,m}, precompute table T_{a⃗}[x⃗] = ∂̄^a⃗ ∘ F(x⃗) at all x⃗ ∈ 𝔽_q^m using fast multipoint evaluation [KU11, Lemma 4.7]. | Time O((m+t−1 choose m)·q^m·m·polylog q). All S servers do the same deterministic work — output identical encoded DB. |
| **Query** | Client | Sample v⃗ ←$ 𝔽_q^m and S distinct nonzero λ_0,…,λ_{S−1}; set u⃗ = E(i); for each s ∈ ⟦S⟧ send Q_s = z⃗_s = u⃗ + λ_s v⃗ to server s. | Communication: m·log q bits to each server (S·m·log q total upload). |
| **Answer** | Each server s | For each a⃗ ∈ A_{<t,m}, look up ans_{s,a⃗} = T_{a⃗}[z⃗_s]; return all of them. | Server time O((m+t−1 choose m)·log q). Download (m+t−1 choose m)·log q per server. |
| **Recons** | Client | (1) Apply chain rule (Lemma 4.3): for each s and each k ∈ {0,…,t−1}, compute ∂̄^{(k)}f(λ_s) = Σ_{a⃗∈A_{k,m}} ans_{s,a⃗}·v⃗^a⃗. (2) Hermite-interpolate f from {(λ_s, ∂̄^{(k)}f(λ_s))} to recover f. (3) Output f(0) = F(u⃗) = DB[i]. | Client time O(S·(m+t−1 choose m)·m·polylog q) + O(poly(d, log q)). |

For §6 (poly-space), `Answer` returns ∂̄^a⃗ ∘ F(z⃗_s) at z⃗_s = λ_s·u⃗ + v⃗, and `Recons` extracts DB[i] = Coeff_{λ^d}(f) instead of f(0).

### Complexity

#### §4 base (equal-scaling, Theorem 4.9)

| Metric | Asymptotic | Notes |
|--------|-----------|-------|
| Per-server upload | m·log q ≈ (log n / log q)·log q = O(log n) | Tiny — single field-element vector per server |
| Per-server download | (m+t−1 choose m)·log q = O(n^{2/log q}·log q) | The Pareto-relevant download |
| Total upload (S servers) | O(S·log n) | |
| Total download (S servers) | O(S·n^{2/log q}·log q) | |
| Per-server computation | O((m+t−1 choose m)·log q) = O(n^{2/log q} log q) | Just `\|A_{<t,m}\|` lookups + transmission |
| Client computation | O(S·n^{2/log q}·polylog q·polylog n + S²·polylog q) | First term is chain-rule, second is Hermite interpolation |
| Per-server storage | (m+t−1 choose m)·q^m·log q ≈ n^{1+2/log q}·q·log q | Brute-force tables; this is the metric §5 reduces |
| Preprocessing time | (m+t−1 choose m)·q^m·m·polylog q | One-time, deterministic, identical across servers |

With q ≈ S(n)/2, `2/log q = O(1/log S)`, giving Theorem 1.1's `n^{O(1/log S)}` scaling.

#### §5.1 (min-bandwidth, Theorem 5.3 / Corollary 5.4)

Setting m ≈ log n / log log S, d' ≈ S^{1/m}, t ≈ md'/S:

| Metric | Asymptotic |
|--------|-----------|
| Per-server bandwidth | n^{Õ(log² S/(S log log S))+O(log S/log n)}·polylog(n,S) |
| Per-server computation | n^{Õ(log² S/(S log log S))+O(1/log log S)+O(log S/log n)}·polylog(n,S) |
| Client computation | n^{Õ(log² S/(S log log S))+O(log S/log n)}·polylog(n,S) — bounded by S·(m+t−1 choose m)·m·polylog q + (md')²·polylog q |
| Per-server storage / preproc | n^{1+Õ(log² S/(S log log S))+O(log log S/log log S)+O(log S/log n)}·polylog(n,S) |

#### §5.2 (min-bottleneck, Theorem 5.7 / Corollary 5.8)

For ω(1) any super-constant function in o(log n): m ≈ log n·ω(1)/log S, d' ≈ S^{1/ω(1)}, t = θ(md'/S):

| Metric | Asymptotic |
|--------|-----------|
| Per-server bandwidth | n^{Õ(1/S^{1/ω(1)})+O(log S/log n)}·polylog(n)·log S |
| Per-server computation | n^{Õ(1/S^{1/ω(1)})+O(log S/log n)}·polylog(n,S) |
| Per-server storage | n^{1+Õ(1/S^{1/ω(1)})+O(log S/log n)+O(log log n·ω(1)/log S)}·polylog(n,S) |

#### §6 (poly-space, Theorem 6.4 / Corollary 6.5)

Multilinear polynomial; m = log n / H(θ)·(1+o(1)), d = θm, t = ⌈(d+1)/S⌉, q ≈ S:

| Metric | Asymptotic |
|--------|-----------|
| Per-server bandwidth | n^{(1+o(1))·H(θ/S)/H(θ)}·log S |
| Per-server computation | n^{(1+o(1))·H(θ/S)/H(θ)}·log S |
| Client computation | n^{(1+o(1))·H(θ/S)/H(θ)}·S·log² S |
| Per-server storage | n^{(1+o(1))(log S+1+H(θ/S))/H(θ)} ≤ n^{0.368·ε·S^{(1+o(1))}/ε} |

For sufficiently small ε, large S, n: bandwidth Õ(n^{(1+ε)/S}), storage n^{0.368ε·S^{1+o(1)/ε}}. This *strictly improves* [BIM04, Thm 4.3]'s storage by a factor of S/log S in the exponent (Table 2, p.35).&#8201;[^17]

[^17]: §6.4 "Comparison with Beimel et al." (p.35): "For S = 3, our field size q = 3, and log q < S − 1. Specifically, for S = 3, Beimel et al.'s constant in the exponent is (3−1)/log(3) ≈ 1.26 times larger than ours." Table 2 (p.35) shows numerical exponents for ε = 0.5: e.g., for S = 10, our optimized storage 19.9255 vs. BIM04 51.5976; for S = 16, 47.8135 vs. 179.0431.

### Numerical exponents (ε = 0.5, from Table 2)

| S | q | θ | Comm/Work exponent | Our storage exponent (optimized) | Our storage (unoptimized) | [BIM04]'s storage exponent |
|---|---|---|--------------------|----------------------------------|---------------------------|----------------------------|
| 2 | 2 | 0.4110 | 0.75 | 1.7735 | 2.3723 | 1.7735 |
| 3 | 3 | 0.2259 | 0.5 | 2.5563 | 3.0947 | 3.0947 |
| 4 | 4 | 0.1410 | 0.375 | 3.7832 | 4.3318 | 5.4874 |
| 5 | 5 | 0.0956 | 0.3 | 5.4051 | 6.4724 | 9.0947 |
| 6 | 7 | 0.0687 | 0.25 | 8.0230 | 8.0230 | 14.0940 |
| 10 | 11 | 0.0262 | 0.15 | 19.9255 | 19.9255 | 51.5976 |

(Values are the exponent c such that the metric is Θ(n^{c+o(1)}). e.g. comm/work exponent 0.75 means n^{0.75+o(1)}.)

### Lower Bounds (relevant baselines, not new)

| Field | Detail |
|-------|--------|
| **BIM04 lower bound** | [BIM04, BFG03] "Reducing the Servers' Computation in PIR": classical (no-preprocessing) PIR requires server work Ω(n) per query. Preprocessing breaks this. |
| **Razborov–Yakhanin** | [RY06] showed n^{1/3} bandwidth is optimal for *bilinear* and *group-based* 2-server PIR. The paper's Theorem 1.5 (2-server, n^{(1+ε)/3} bandwidth, n^{(2+ε)/3} computation) "almost matches" this bound while strictly improving WY05's computation from n/polylog n down to n^{(2+ε)/3}.&#8201;[^18] |
| **Tightness** | The paper does **not** prove its upper bounds match a lower bound; it claims state-of-the-art among existing constructions. |

[^18]: §1.2 "A generic balancing technique" (p.7), Theorem 1.5: "There exists an information-theoretic 2-server PIR scheme with n^{(1+ε)/3} bandwidth and n^{(2+ε)/3} computation per query, while requiring a polynomial amount of server space. … almost matches the O(n^{1/3}) bandwidth achieved by Woodruff and Yekhanin [WY05], but we significantly improve their computation cost, from n/polylog n to n^{(2+ε)/3}." Razborov–Yakhanin's lower bound discussed in same paragraph: "n^{1/3} bandwidth is optimal for a natural class of bilinear and group-based 2-server PIR schemes [RY06]."

### Performance Benchmarks

**No implementation.** This is a theory-only paper; no concrete benchmarks. The only numerical comparison is the asymptotic-exponent table (Table 2 above, ε = 0.5 in the poly-space setting).

### Comparison with Prior Work (summary; from Figure 1 and §1)

| Scheme | Setting | Per-server bandwidth | Per-server work | Server space |
|--------|---------|----------------------|-----------------|--------------|
| **This paper, Thm 1.1** (equal scaling) | S = ω(1) | Õ(n^{O(1/log S)}) | Õ(n^{O(1/log S)}) | Õ(n^{1+O(1/log S)}) |
| **This paper, Thm 1.2** (min bandwidth) | S = ω(1) | n^{Õ(1/S)} | n^{Õ(1/log log S)} | n^{1+o(1)} |
| **This paper, Thm 1.3** (min bottleneck) | S superpolylog | n^{Õ(1/S^{1/ω(1)})} | n^{Õ(1/S^{1/ω(1)})} | n^{1+Õ(1/S^{1/ω(1)})+o(1)} |
| **This paper, Thm 1.4** (poly-space) | constant S | Õ(n^{(1+ε)/S}) | Õ(n^{(1+ε)/S}) | n^{0.368ε·S^{(1+o(1))}/ε} |
| **This paper, Thm 1.5** (poly-space + balancing, 2-server) | S = 2 | n^{(1+ε)/3} | n^{(2+ε)/3} | poly(n) |
| [BIM04] | constant S | n^{(1+ε)/S} | n^{(1+ε)/S} | n^{0.368·(S/log S)·ε·S^{(1+o(1))}/ε} |
| [WY05] (2-server) | S = 2 | n^{1/3+ε} | n/polylog n | poly(n) |
| [BIM04] (parameterizable S) | scalable family | n^{O(1/S)} | n^{O(1/S)} | n^{ω(S²/log S)} **anti-scalable** |
| [LLFP24] Thm 4.1 | super-const S | (matches Thm 1.3 only) | (matches) | (matches) |
| [LLFP24] Thm 5.2 | super-const S | (Thm 1.1 needs fewer servers for same bandwidth) | (this paper better) | (this paper better) |
| [SWZ24] Thm 14 | client-side preproc | n^{O(1/S)} | **n^{1/2} flat** (does not scale) | poly(n) (uses ~n^{1/2} *client* space) |

**Key takeaway:** First multi-server PIR family that scales **all** of bandwidth, computation, and server space simultaneously with S. Becomes doubly efficient with only super-constant S (Thms 1.1, 1.2) — strictly improving prior IT-DEPIR which required super-logarithmically many servers.

### Composability

| Base scheme | Integration point | Improvement | Limitations |
|-------------|-------------------|-------------|-------------|
| Any "natural" S-server preprocessing PIR (Assumption 7.1 — same det. preprocessing across servers, identically distributed queries) | Black-box wrap via §7 / Lemma 7.2 (and unconditionally via Appendix B) | Trades n^{1−μ}× server work/storage for reduced bandwidth when download ≫ upload | Cannot reduce bandwidth when upload ≥ download (use [CGKS95] Lemma 4.4 / [BIM04] Lemma 4.4 instead). Increases server work and storage by n^{1−μ}× factor. |

The compiler is the paper's most directly *portable* contribution — it applies to any future preprocessing PIR scheme with the right asymmetric-bandwidth profile.

### Application Scenarios

- **Settings 1 / 2 / 3** (intro, p.4–5):
  - **Equal scaling**: storage, computation, network costs are similar.
  - **Min bandwidth**: network transmission dominates compute and storage (the classical PIR motivation).
  - **Min bottleneck**: storage is cheap, want fast query response.
- The paper does not analyze concrete deployment (e.g., DNS sizes, specific DB sizes); it cites the standard PIR application list ([Fea, obl, SCV+21] private DNS, [DRRT18, sig] private contact discovery, [HDCG+23] private web search, [hav] password leak checking).

### Deployment Considerations

- **Database updates:** Not addressed. Updating any DB[i] requires recomputing all of F's coefficients and all Hasse-derivative tables — full re-preprocessing.
- **Sharding:** §7's balancing technique is itself a sharding construction (B = n^{1−μ} blocks).
- **Anonymous query support:** Yes — IT-secure, no client state, single-round.
- **Session model:** Stateless on both sides (after one-time preprocessing).
- **Cold start suitability:** Online phase only — no offline communication. But preprocessing time/space is large (asymptotically n^{1+o(1)} but with large hidden constants).
- **Practicality:** **Theory-only.** Concrete constants in [BGG⁺24] preprocessing (16d'^m factors), m^m polylog factors, and large q^m tables make implementation likely impractical for current n. The paper is a feasibility / scalability result.

### Key Tradeoffs & Limitations

- **Theoretical only** — no implementation, no benchmarks; concrete factors in [BGG⁺24] / [KU08] data structures are large.
- **Doubly-efficient regime** requires S to grow with n (S = ω(1) for Thms 1.1, 1.2; S superpolylog for Thm 1.3) — for any constant S, scheme is *not* doubly efficient.
- **Server space is one-time** but the n^{1+o(1)} bound has nontrivial polylog and (16d')^m factors hidden inside.
- **Naturalness assumption** (Assumption 7.1) for the balancing compiler is satisfied by all known schemes but requires Appendix B's S-factor compiler if violated.
- **Privacy is per-server** — does not capture multi-server collusion (any 2-of-S coalition would break privacy in the §4 construction).
- **No malicious-server protection** — semi-honest only.

### Portable Optimizations

- **Generic balancing for download-heavy preprocessing PIR** (§7, Lemma 7.2) — applicable to any natural S-server preprocessing PIR (BIM04, WY05, LLFP24, this paper, plus future ones). Worked example for the 2-server poly-space setting yields Thm 1.5's improvement over WY05.
- **Hasse-derivative reduction `S·t > d`** (vs. classical `S > d`) — gives polynomial factors in field size and storage that compound across all variants.
- **Polynomial-preprocessing data structure swap** (§5) — replacing brute-force evaluation tables with [BGG⁺24]/[KU08] data structures is a generic recipe to decouple bandwidth from server space in algebraic PIR.
- **q = S optimization in poly-space setting** (§6, p.30) — saves polynomial factors in server storage by allowing one λ_s to be zero (since v⃗ alone provides the masking).

### Implementation Notes

- **Language / library:** None — theory-only.
- **Polynomial arithmetic:** would require fast multivariate multipoint evaluation [KU11, BGG⁺24] and Hermite interpolation of Hasse derivatives [BGKM22] — both nontrivial to implement.
- **Open source:** Not applicable.

### Open Problems (stated or implied)

- **Achieve full DEPIR (n^{1+o(1)} space, n^{o(1)} bandwidth & computation) with polylogarithmically many servers**, beyond the current super-constant requirement. (Implicit in the gap between Thms 1.2 and 1.3.)
- **Match WY05's n^{1/3} bandwidth at 2 servers without n^{(2+ε)/3} computation overhead** (i.e., improve Thm 1.5).
- **Support DB updates** without full re-preprocessing.
- **Concrete instantiation and benchmarking** — the entire paper is asymptotic; bridging to practice would require choosing concrete (m, q, d, t) and engineering [BGG⁺24] preprocessing.

### Related Papers in Collection

- **BIM04** [Beimel–Ishai–Malkin] — direct ancestor; this paper improves BIM04's poly-space scheme by S/log S in the storage exponent and is the first to make BIM04's S-parameterized framework actually scalable.
- **WY05** [Woodruff–Yekhanin] — geometric 2-server PIR with the only prior n^{1/3} bandwidth result; this paper's Thm 1.5 nearly matches it with much better computation.
- **LLFP24** [Lazzaretti–Liu–Fisch–Papamanthou, ePrint 2024/829] — concurrent and closely related (also multiplicity codes); Remark 5.6 details the comparison.
- **SWZ24** [Singh–Wei–Zikas, TCC '24] — concurrent; uses *client*-side preprocessing instead, scales bandwidth but not computation. Filed in the wider multi-server collection.
- **LMW23** [Lin–Mook–Wichs] — single-server DEPIR from RingLWE; this paper borrows their DB → polynomial interpolation lemma but is otherwise IT-secure.
- **BGG⁺24** [Bhargava–Ghosh–Guo–Kumar–Umans, JACM '24] — fast multivariate multipoint evaluation; the polynomial-preprocessing primitive that enables Thms 1.2, 1.3.

### Uncertainties

- The paper uses two slightly different point conventions: §4–§5 sends z⃗_s = u⃗ + λ_s·v⃗; §6 sends z⃗_s = λ_s·u⃗ + v⃗. Both are correct — the second is an optimization that (combined with multilinear F and Coeff_{λ^d}-decoding) saves a factor in field size by allowing one λ_s = 0.
- Theorem 1.3's exponent `Õ(1/S^{1/ω(1)})` is unusual asymptotic notation — ω(1) here is "an arbitrarily slow super-constant function," so 1/ω(1) is "an arbitrarily slow vanishing positive function." The paper notes this abuse of notation explicitly.
- The "1+ε" exponents in §6 hide an `o(1)` correction — exact constants depend on θ ∈ (0, 1/2] which is itself a tunable parameter (Lemma 6.1).
- The acknowledgment to Ishai and Corrigan-Gibbs for the balancing technique idea suggests the §7 idea predates this paper as folklore; the *theorem* is novel here.
- Per-server vs. total bandwidth: the paper reports *per-server* metrics; total (across S servers) bandwidth is S× larger, which is hidden by the polylog(S) in most theorems.
