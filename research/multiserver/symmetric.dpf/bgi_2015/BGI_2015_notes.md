## Function Secret Sharing (FSS) — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Function Secret Sharing](https://eprint.iacr.org/2018/707) (EuroCrypt 2015), Boyle, Gilboa, Ishai |
| **Archetype** | Building-block (primary) + Construction (theory-only) + Model/definition |
| **Asymmetry profile** | **Symmetric** — every party runs identical `Eval` on every input; servers do equal work and hold identical DB replicas in the PIR application&#8201;[^1] |
| **Multi-server model** | p-party additive secret sharing of functions; (p−1)-private (any strict subset of keys hides f). Default focus: 2-party (DPF) and p ≥ 3 (multi-party DPF) |
| **Security model** | Computational, semi-honest, t-secure for t ≤ p−1 (default t = p−1). Indistinguishability-based game (Definition 2); equivalent to a simulation-based notion&#8201;[^2] |
| **Additional assumptions** | OWF/PRG (for DPF and FSS for prefix/comparison/interval/`Match_ℓ`); subexp-secure iO + OWF or VBB obfuscation (for general FSS over P/poly); LWE (for the NC¹⇒P/poly completeness statement)&#8201;[^3] |
| **Correctness model** | Deterministic for the comparison/interval scheme `Gen<` (Algorithm 5 returns correct keys with probability 1)&#8201;[^4]; **Probabilistic with negligible failure** for the improved 2-party DPF `Gen•` (Algorithm 1 has a "w←0" failure case that is re-runnable; Corollary 1 derives an error-free DPF from the comparison FSS)&#8201;[^5] |
| **Rounds (online)** | 1 (non-interactive — each party evaluates locally and sends a single share to the reconstructor) |
| **Implementation** | None (theory paper — no benchmarks or code) |

### Lineage

| Field | Value |
|--------|--------|
| **Builds on** | Gilboa–Ishai (Eurocrypt 2014) DPF [reference 26] — keys of size O(λ · n^{log₂ 3}) |
| **What changed** | Improved 2-party DPF from O(λ·n^{log₂ 3}) to **O(λn)** key size and eval time; introduced general FSS notion; first nontrivial p-party DPF (p ≥ 3); FSS for intervals/comparisons/partial-matching; general FSS from obfuscation; FSS↔primitive relations&#8201;[^6] |
| **Superseded by** | Boyle–Gilboa–Ishai CCS 2016 (further DPF tree-tightening); Riposte 2015 (DPF-based application). The Eurocrypt 2015 paper itself remains the reference for the FSS model. |
| **Concurrent work** | Riposte (Corrigan-Gibbs–Boneh–Mazières, 2015) — anonymous broadcast over a related "writing PIR" primitive |

### Core Idea

A **function secret sharing (FSS)** scheme additively shares a *function* f ∈ ℱ (rather than a string) into p succinct keys k₁,…,k_p such that (i) for every input x, ∑ᵢ Eval(i, kᵢ, x) = f(x) over an Abelian group 𝔾, and (ii) any strict subset of the keys reveals nothing about f.&#8201;[^7] DPF is the special case where ℱ is the class of point functions f_{a,b} (output b at input a, 0 elsewhere) and p = 2.&#8201;[^8] The PIR application is downstream: with a DPF for f_{i,1}, two servers each compute ∑_j Eval(b, k_b, j)·DB[j] (a single group element) whose XOR is DB[i], hiding i from any single server.&#8201;[^9]

---

## Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers (p)** | p = 2 (DPF), or p ≥ 3 (multi-party DPF / FSS for comparison) |
| **Trust model** | (p−1)-non-colluding semi-honest servers; default "T-secure" with T = p−1 (any strict subset of corrupted keys leaks nothing about f)&#8201;[^2] |
| **Server roles** | **Symmetric** — each party i runs the same `Eval(i, kᵢ, x)` algorithm; differences in output between parties come from kᵢ alone, not from a role split |
| **Database replication** | Full replication assumed in the PIR application — every server holds the same DB and computes ∑ⱼ Eval(b, k_b, j)·DB[j]&#8201;[^9] |
| **Reconstruction** | Linear additive: client (or any third party) XORs/sums the p output shares over 𝔾 to recover f(x). Decoder is fixed and public.&#8201;[^10] |
| **Communication asymmetry** | None — every server receives one key kᵢ and emits one group element. Query length and answer length are identical across servers. |
| **Privacy threshold** | Default t = p−1 (collusion of all-but-one is allowed). Lower thresholds are also definable and yield smaller keys at the cost of weaker privacy.&#8201;[^11] |

---

## Novel Primitives / Abstractions

### Primitive 1 — Function Secret Sharing (FSS)

| Field | Detail |
|--------|--------|
| **Name** | Function Secret Sharing |
| **Type** | Cryptographic primitive (a generalization of additive secret sharing from elements to functions) |
| **Interface / Operations** | `Gen(1^λ, f) → (k₁,…,k_p)` and `Eval(i, kᵢ, x) → yᵢ ∈ Sᵢ`. Decoder Dec(y₁,…,y_p) = ∑ᵢ yᵢ over 𝔾.&#8201;[^12] |
| **Security definition** | Indistinguishability for any T ⊂ [p] of size ≤ t: adversary picks f₀, f₁ with matching domain/range; challenger samples b, runs Gen(1^λ, f_b), reveals {kᵢ}_{i∈T}; advantage Adv(1^λ, 𝒜) := |Pr[b'=b] − ½| must be negligible. Equivalent to a simulation-based formulation.&#8201;[^2] |
| **Correctness definition** | For all f ∈ ℱ, x ∈ D_f: Pr[(k₁,…,k_p) ← Gen(1^λ, f) : Dec(Eval(1,k₁,x),…,Eval(p,k_p,x)) = f(x)] = 1.&#8201;[^13] |
| **Purpose** | Succinct, function-private representation of a hidden f admitting non-interactive distributed evaluation; underlies 2-server PIR with sublinear query length, private writing/keyword search, low-comm MPC in the preprocessing model |
| **Built from** | OWF/PRG (point/comparison/interval/match classes); iO + OWF (general P/poly) |
| **Standalone complexity** | DPF (this paper, two-party): key size O(λn), eval time O(λn), where n = log₂(domain size). Multi-party DPF: O(λ · 2^{p/2} · N^{1/2}) for N = 2^n. Comparison/interval (2-party): O(n(λ + log\|𝔾\|))&#8201;[^14] |
| **Output share linearity** | Restricted to additive output decoder over 𝔾 (Definition 1). This is what enables share **succinctness**, share **compressibility** (used in PIR-style aggregation), and **function privacy** for free.&#8201;[^10] |
| **Key necessary condition** | If ℱ is "poly-spanning" (rich enough to span the function space efficiently), every party's `Eval(b, k_b, ·)` must itself define a **PRF** over the seed k_b — non-trivially, this falls out of the security definition + linear decoder (Theorem 9).&#8201;[^15] |

### Primitive 2 — Distributed Point Function (DPF)

| Field | Detail |
|--------|--------|
| **Name** | DPF (the p = 2 FSS for point functions P_{a,b}) |
| **Class** | P_{a,b}: {0,1}^n → {0,1}^m, defined by P_{a,b}(a) = b, P_{a,b}(a') = 0^m for a' ≠ a&#8201;[^16] |
| **Improved construction** | (Gen•, Eval•) — Algorithms 1 and 2; key encodes a depth-n binary tree with PRG-derived seeds and "correction words" per level. Trees from k₀ and k₁ agree everywhere except along the root-to-leaf path of a; on that path, seeds diverge pseudorandomly.&#8201;[^17] |
| **Key size** | O(λn) per key (down from O(λ · n^{log₂ 3}) of [Gilboa–Ishai '14]); Eval time O(λn).&#8201;[^14] |
| **Multi-party DPF** | (Gen^{p₀}, Eval^{p₀}) — Algorithms 3 and 4. Views the 2^n-entry truth table of f_{a,b} as a 2^{n/2} × 2^{n/2} grid; each party gets 2^{p−1} correction words and a subset of PRG seeds chosen so that all-but-one rows cancel in expectation.&#8201;[^18] Key size O(2^{n/2} · 2^{(p−1)/2} · (λ + m)) — near-quadratic improvement over the trivial 2^n · m truth-table sharing.&#8201;[^19] |
| **PIR consequence** | For p ≥ 3, yields the first p-server, (p−1)-private PIR with **sublinear query length and constant answer length**, plus the first (p−1)-private sublinear-communication private storage scheme.&#8201;[^20] |

### Primitive 3 — FSS for Comparison / Interval Functions

| Field | Detail |
|--------|--------|
| **Class** | f_{a,g}^<: outputs g ∈ 𝔾 if x < a, 0 otherwise (comparison); f_{(a,b)}: outputs g for a < x < b, 0 otherwise (interval). f^{int}_n is reduced to two comparisons via Transformation 4 (linear combination), with a factor-2 key-size overhead.&#8201;[^21] |
| **Two-key construction** | (Gen<, Eval<) — Algorithms 5 and 6. Same tree structure as DPF, but each node carries an extra group element vᵅ_β ∈ 𝔾; correction words include cv (group elements) chosen so that, on the divergence path, partial sums are 0 if x ≥ a and g if x < a. Errorless: `Gen<` returns correct keys with probability 1.&#8201;[^22] |
| **Key size** | O(n(λ + log\|𝔾\|)) per key (Theorem 6). Yields an error-free DPF for arbitrary Abelian 𝔾 via the identity P_{a,g}(x) = f^<_{a+1,g}(x) + (−f^<_{a,g}(x)) (Corollary 1).&#8201;[^23] |
| **Multi-party comparison FSS** | (Gen^p, Eval^p) — Algorithms 7 and 8. Generalizes the multi-party DPF over arbitrary 𝔾 (\|𝔾\| = q): arrays drawn from E_{p,q}/O_{p,q} (columns sum to 0/1 mod q), plus extra group elements vᵢ. Key size O(2^{n/2} · q^{(p−1)/2} log q); secure against (p−1) coalitions.&#8201;[^24] |

### Primitive 4 — Match/Partial-Matching FSS

| Field | Detail |
|--------|--------|
| **Class** | Match_ℓ: f_{S,v}(x) = g if x_i = v_i for all i ∈ S, 0 otherwise (S ⊆ [n], \|S\| ≤ ℓ; v ∈ 𝔾_1^ℓ). Captures conjunctive predicate matching on ℓ public-position columns.&#8201;[^25] |
| **Construction** | Transformation 6 (FSS for small function classes) applied with the improved DPF: Match_ℓ has \|ℳ\| ≤ O(n^ℓ \|𝔾_1\|^ℓ) functions; FSS via DPF over a domain of size \|ℳ\| gives eval time O(λn^ℓ ℓ log n) and key size O(λℓ log n) (for \|𝔾_1\| ∈ O(1)).&#8201;[^26] |

### Primitive 5 — Closure Transformations on FSS

Transformations from §3.2 — composable rules turning an FSS for ℱ into an FSS for a related class:
1. **Add zero function:** ℱ → ℱ ∪ {0} for free.
2. **Pre-composition with public g:** ℱ → ℱ ∘ g; key size `|g| + size(ℱ)`, time `|g| + time(ℱ)`. Extends to **secret-dependent g** (e.g., g = encrypted portion of f) — this is how NC¹⇒P/poly bootstrapping with FHE works.&#8201;[^27]
3. **Post-composition with linear L:** ℱ → L ∘ ℱ; key size `size(ℱ) + |L|`.
4. **Linear combination:** ℱ + 𝒢 (key size additive, time additive).
5. **Union:** ℱ ∪ 𝒢 (combine via T4).
6. **Small-class FSS:** any ℱ with `time(ℱ) ~ |ℱ|` reduces to DPF over [|ℱ|]: time O(\|ℱ\| · time(DPF) · max\|f\|), key size = size(DPF).&#8201;[^28]

These give FSS for **NC⁰**, **constant-conjunction queries**, and **interval functions** for free from the improved DPF.&#8201;[^29]

---

## Cryptographic Foundation

| Layer | Detail |
|--------|--------|
| **Hardness assumption (DPF, point/interval/comparison/match FSS)** | OWF (equivalently, any PRG) |
| **Hardness assumption (general P/poly FSS)** | (a) VBB obfuscation + OWF; or (b) sub-exponentially secure iO + sub-exponentially secure OWF (via piO of Canetti–Lin–Tessaro–Vaikuntanathan)&#8201;[^30] |
| **Hardness assumption (NC¹ → P/poly bootstrap)** | FHE with decryption in NC¹ (e.g., LWE-based) — Proposition 4&#8201;[^31] |
| **PRG instantiation** | G : {0,1}^λ → {0,1}^{max(2λ+2, m)} for the 2-party DPF; G : {0,1}^λ → {0,1}^{mμ} for the p-party scheme&#8201;[^32] |
| **Output group 𝔾** | Any finite Abelian group. The default is 𝔾 = {0,1}^m with XOR; constructions over arbitrary 𝔾 are also given (Algorithms 5/6 over generic 𝔾, Algorithms 7/8 over any \|𝔾\| = q)&#8201;[^33] |
| **Correctness condition** | Deterministic for `Gen<`; probabilistic for `Gen•` (failure when `G(S^0_{aₙ}[n]) = G(S^1_{aₙ}[n])`, which has probability ≤ negl(λ) and is testable + retryable). The error-free DPF (Corollary 1) eliminates this via two comparison FSSes.&#8201;[^5] |

---

## Improved 2-party DPF Construction (Algorithms 1 & 2)

### Key Data Structures

- **Per-party key k_β** = ((S^β_0[1], S^β_1[1], T^β_0[1], T^β_1[1]), CW_0[1..n−1], CW_1[1..n−1], w)&#8201;[^34]:
  - Two λ-bit "level-1" seeds S^β_0[1], S^β_1[1] (one per child position).
  - Two control bits T^β_0[1], T^β_1[1] (one per child).
  - n−1 pairs of correction words CW_β[i] ∈ {0,1}^{2λ+2}, one per internal level.
  - A final group element w ∈ 𝔽_{2^m} encoding the output b.

- **Per-node tree state during Eval**: `(S, T)` ∈ {0,1}^λ × {0,1}; `G(S)` is parsed as `s_0 ‖ s_1 ‖ t_0 ‖ t_1` per Notation 1.&#8201;[^35]

### Protocol Phases

| Phase | Actor | Operation | Communication | When |
|-------|-------|-----------|---------------|------|
| Key generation | Dealer (client) | `Gen•(1^λ, a, b)` builds two correlated trees of depth n; trees agree off the a-path, diverge on it. Sets w so that XOR of leaf-level PRG outputs equals b. | k_β is sent privately to party β | Once per shared point function |
| Local evaluation | Party β | `Eval•(β, k_β, x)`: walk root-to-leaf along x = x_1…x_n, expanding G(S) and applying CW_T[i] to maintain the invariant. Returns G(S)·w over 𝔽_{2^m}. | None — local | Per query input x |
| Reconstruction | Combiner | XOR the two parties' outputs over {0,1}^m. | One group element per party | Per query |

### Correctness Sketch

For x ≠ a, Eval•(0, k₀, x) and Eval•(1, k₁, x) yield identical (S, T) by an inductive invariant maintained by the correction words `cs_{T,x_i}` and `ct_{T,x_i}` on lines 8–10 of Algorithm 2 — line 7 of Algorithm 1 sets these so that XOR of leaves' PRG outputs is 0 off-path. For x = a, the seeds at the leaf differ; the CW values force the output XOR to equal `(G(S^0_a[n]) + G(S^1_a[n])) · w⁻¹ · b = b`.&#8201;[^36]

### Security Sketch (informal)

All function-dependent information lives in the correction words `cs_{0,·}, cs_{1,·}, ct_{0,·}, ct_{1,·}` and in w. Each CW pair is "masked" by a PRG output `G(S^{β'}_*)` whose seed appears in **only the other party's key**. Thus, given one party's key, the CW pair is computationally indistinguishable from random.&#8201;[^37]

---

## p-party DPF Construction (Algorithms 3 & 4) — high level

- Truth table of f_{a,b} viewed as a 2^{n/2} × 2^{n/2} grid; index `a = (γ, δ)`, `x = (γ', δ')`.
- For each row γ', `Gen^{p₀}` samples ν random λ-bit seeds {s_{γ',j}}_{j∈[2^{p−1}]}, plus 2^{p−1} group-element correction words {cw_j}.
- Each party i gets a `p × 2^{p−1}` binary array `A_{γ'}` chosen from `E_p` (even-parity columns) for γ' ≠ γ and `O_p` (odd-parity columns) for γ' = γ. Party i's key holds the seeds {s_{γ',j} : A_{γ'}[i,j] = 1} plus all 2^{p−1} cw's.
- `Eval^{p₀}(i, kᵢ, x)` parses x = (γ', δ'); for each j with A_{γ'}[i, j] = 1, XORs cw_j ⊕ G(s_{γ',j}); returns the δ'-th component of the result.&#8201;[^38]
- **Correctness** (informal): for γ' ≠ γ each seed s_{γ',j} appears in an even number of keys ⇒ contributions cancel; for γ' = γ each appears odd, leaving a single G(s_{γ,j})·w_j ⊕ cw_j sum; cw_j's are chosen so this sum equals e_δ · b.&#8201;[^39]
- **Security**: any (p−1) keys see seeds from at most p−1 rows of A_{γ'}, and the distribution of any p−1 rows of A_{γ'} is identical whether A_{γ'} ∈_R E_p or A_{γ'} ∈_R O_p; the cw_j's are masked by ⊕ G(s_{γ,j}) for at least one seed not in the coalition.&#8201;[^40]

Key size: **O(2^{n/2} · 2^{(p−1)/2} · (λ + m))** — square-root in N = 2^n, exponential only in p.&#8201;[^19]

---

## PIR Application

The paper's primary motivation is **2-server PIR** (and its multi-server / writing variants).&#8201;[^9] FSS does not "do PIR" as a top-level primitive; instead, given an FSS for the desired query class, a multi-server PIR protocol is a thin wrapper.

### 2-Server PIR from DPF (point-function FSS)

Database D = (D[0], …, D[N−1]) ∈ 𝔾^N held identically by Server₀ and Server₁.

| Step | Actor | Operation |
|------|-------|-----------|
| 1 | Client | Choose retrieval index i ∈ [N]. Run `(k₀, k₁) ← Gen(1^λ, f_{i,1})` for the point function f_{i,1} : [N] → 𝔾. |
| 2 | Client → Server_β | Send k_β. **Query size: O(λ log N) bits**. |
| 3 | Server_β | Compute y_β := ∑_{j ∈ [N]} Eval(β, k_β, j) · D[j] ∈ 𝔾. **Server work: N PRG-tree evaluations + N group multiplications.**&#8201;[^41] |
| 4 | Server_β → Client | Send y_β. **Answer size: \|𝔾\|** (one group element). |
| 5 | Client | Output y₀ + y₁ = ∑_j f_{i,1}(j) · D[j] = D[i]. |

**Security**: each server alone sees only one key k_β, which by FSS security computationally hides i.

**Concrete numbers** (this paper, plugging Theorem 6 / Corollary 1):
- Query size: O(log N · λ) bits per server (e.g., for N = 2^{20}, λ = 128: ~2.5 KB/server).&#8201;[^14]
- Answer size: \|𝔾\| (a single group element — typically one record).
- Server time: O(λ · N) PRG calls + N inner-product ops.

### p-server PIR from p-party DPF

Same template with p servers and key size O(2^{n/2} · 2^{(p−1)/2}(λ + m)). Yields a (p−1)-private p-server PIR with sublinear (≈ √N) query length and constant-size answers — strictly better than known information-theoretic constructions in the (p−1)-private regime under the same answer-length constraint.&#8201;[^20]

### Beyond PIR: read-related applications

| Application | FSS class needed | Notes |
|-------------|------------------|-------|
| **Multi-server keyword search / counting** | Point functions f_{w,1} (DPF); for richer classes (interval, fuzzy match) use comparison/interval/Match_ℓ FSS | Servers report ∑ f(w_j) — count of matches. Adding a randomized sketch returns payloads of bounded matches.&#8201;[^42] |
| **Private writing / incremental secret sharing** | DPF (point-function update increments one shared cell); general FSS for attribute-based writes | Each update = a DPF for f_{u,1}; servers locally add their share to every cell. No collusion learns which cell was updated. **Low-comm "private information storage"** of [Ostrovsky–Shoup STOC '97] — the writing analogue of PIR.&#8201;[^43] |
| **Secure 2-party MPC in the preprocessing model** | FSS for ℱ ∘ Dec (function of two ciphertext inputs) | Reusable correlated randomness; online comm O(\|x\| + \|f(x)\|·poly(λ)), independent of \|f\|. Currently realizable from FHE / reusable garbled circuits but not from OWF — barriers shown in §4.2.&#8201;[^44] |

---

## Complexity (asymptotic)

### Core metrics (no implementation; concrete numbers omitted)

| Metric | Asymptotic | Phase |
|--------|------------|-------|
| **DPF key size (2-party)** | O(λn) where n = log₂ N | Setup |
| **DPF eval time (2-party)** | O(λn) per input (single tree-walk); O(λN) for full-domain expansion | Online |
| **p-party DPF key size** | O(2^{n/2} · 2^{(p−1)/2} · (λ + m)) | Setup |
| **p-party DPF eval time** | O(2^{(p−1)/2} · 2^{n/2} · m) for full domain (one row of seeds + 2^{p−1} CWs) | Online |
| **Comparison/interval FSS key size (2-party)** | O(n(λ + log\|𝔾\|)) | Setup |
| **Match_ℓ FSS** | Eval O(λn^ℓ · ℓ log n); key size O(λℓ log n) (for \|𝔾_1\| ∈ O(1)) | — |
| **2-server PIR query length** | O(λ log N) per server | Online ↑ |
| **2-server PIR answer length** | \|𝔾\| (single group element) | Online ↓ |
| **2-server PIR server time** | O(λN) + N group ops | Online |
| **p-server PIR query length** | O(2^{n/2} · 2^{(p−1)/2}(λ + m)) — sublinear in N | Online ↑ |

---

## Lower Bounds & Barriers

| Field | Detail |
|-------|--------|
| **Bound type** | Necessity (PRF lower bound) and barrier (FHE-or-RGC requirement) |
| **PRF necessity** | For any "poly-spanning" function class ℱ, each share function {Eval(b, ·, ·)} must define a **PRF** family. So FSS for non-trivial classes implies PRFs (hence OWF). Theorem 9.&#8201;[^15] |
| **AC⁰ barrier** | FSS for AC⁰ + symmetric-key encryption with AC⁰-decryption (which exists from sub-exp LPN) implies low-comm secure computation for AC⁰ with reusable preprocessing — currently only known from AC⁰-homomorphic encryption or reusable garbled circuits. **Conclusion**: FSS for AC⁰ from sub-exp LPN alone is unlikely.&#8201;[^45] |
| **P/poly upper-bound implication** | FSS for P/poly is currently only known via iO + OWF (or VBB obfuscation), and any path implies low-comm reusable-preprocessing MPC for P/poly — currently only from FHE / reusable GC.&#8201;[^46] |
| **NC¹ completeness** | Assuming LWE-based FHE with decryption in NC¹: efficient FSS for NC¹ ⇒ efficient FSS for P/poly (Proposition 4). Bootstraps via Transformation 2 with secret-dependent g = encrypted circuit.&#8201;[^31] |
| **Multi-server IT-PIR comparison** | The information-theoretic equivalent of p-party DPF (with 1-bit answers, (p−1) privacy) requires query length linear in N — beaten by the PRG-based p-party DPF. Even relaxed IT-PIR (lower threshold or longer answers) has worse asymptotic communication than DPF-based protocols.&#8201;[^47] |

---

## Formal Definitions

- **Definition 1 — Output Decoder**: Tuple `DEC = (S₁,…,S_p, R, Dec)` with share spaces Sᵢ, output space R, decoder Dec : S₁ × ⋯ × S_p → R. Default in this paper: additive decoder over Abelian 𝔾.&#8201;[^10]
- **Definition 2 — Function Secret Sharing**: A pair (Gen, Eval) of PPT algorithms with the syntax above, satisfying perfect correctness and indistinguishability-based T-security.&#8201;[^48]
- **Definition 3 — Point Function**: P_{a,b}(a) = b, P_{a,b}(a') = 0^m for a' ≠ a.&#8201;[^16]
- **Definition 4 — Poly-spanning class**: ℱ "efficiently spans" itself if for every polynomial p(n) there is a polynomial q(n) and an efficient procedure mapping p(n) input-output pairs to q(n) functions whose sum interpolates the pairs. Examples: multi-bit point functions, comparison functions.&#8201;[^49]
- **Definition 5 — OutputShare family**: For fixed f, b: the family {Eval(b, k_b, ·)}_{k_b} indexed by Gen-sampled keys. This is the family Theorem 9 forces to be a PRF.&#8201;[^50]
- **Definition 6 — Comm-efficient online MPC for ℱ**: in the correlated-randomness model, online comm scales with |x_i| + |f(x_i)| · poly(λ), independent of |f|. FSS for ℱ ∘ Dec implies this.&#8201;[^51]

---

## Key Tradeoffs & Limitations

- **No single-server PIR**: relies on (p−1)-non-collusion. Single-server reduction would require FHE or strong number-theoretic assumptions (cf. §1.2 Related Work).&#8201;[^52]
- **General-FSS via iO is impractical**: theoretical feasibility result only; concrete constructions from OWF cover only point/comparison/interval/Match_ℓ.
- **Output-share linearity is essential**: dropping it (e.g., switching to AND reconstruction) blows up comm to Ω(N) for set-intersection-style functions [reference 37]; switching to fully unrestricted decoders trivializes the notion (each share = full f).&#8201;[^53]
- **2-party DPF correctness is probabilistic** (re-runnable); the comparison-FSS-based DPF (Corollary 1) achieves perfect correctness at 2× key-size overhead.&#8201;[^5]
- **Multi-party key size has 2^{p/2} factor** — practical only for small p (e.g., 3–4); for large p the trivial 2^n truth-table sharing wins.

---

## Comparison with Prior Work (asymptotic)

| Metric | This paper (2-party DPF) | Gilboa–Ishai 2014 [^6] | IT 2-server PIR with 1-bit answers (best known)&#8201;[^47] |
|--------|--------------------------|------------------------|----------------------------------------------------------------|
| Query size per server | O(λ log N) | O(λ log^{log₂ 3} N) ≈ O(λ log^{1.58} N) | Ω(N) (linear) |
| Answer size | O(1) group element | O(1) | O(1) |
| Server time | O(λN) | O(λ · N · log^{0.58} N) | O(N) |
| Trust | computational, 1 honest server | computational, 1 honest server | information-theoretic, 1 honest server |

**Key takeaway:** BGI '15 is the foundational FSS / DPF paper. Use the improved 2-party DPF (Algorithms 1–2) directly for any 2-server symmetric DPF-based PIR; use the comparison/interval extension (Algorithms 5–6) for **range queries**; use Match_ℓ via Transformation 6 for **conjunctive keyword search**. The p-party DPF (Algorithms 3–4) is the right tool when (p−1)-non-collusion is acceptable and p ≤ ~4.

---

## Portable Optimizations

- **GGM-style PRG tree with correction words** (Algorithms 1–2): the canonical "DPF tree" template that all subsequent DPF / 2-server PIR work (Riposte, Express, Splinter, Pirates, Sabre, etc.) inherits. Each non-leaf level uses 2λ+2 bits of correction (two seeds + two control bits).&#8201;[^17]
- **Output-share linearity ⇒ free function privacy + share compressibility**: a 2-server can compress N output shares (one per DB position) into one group element via a linear combination weighted by D[j] — this is the structural reason DPF-based PIR has constant answer length.&#8201;[^54]
- **Transformation library** (§3.2): a small toolkit (zero, pre/post composition, linear combination, union, small-class) lets you derive FSS for new classes from a DPF without redoing the security proof.&#8201;[^28]
- **NC¹ → P/poly via FHE bootstrapping** (Transformation 2 with secret g): blueprint for any "inner FSS for decryption + outer encryption of f" pattern.&#8201;[^27]
- **Errorless-DPF from comparison FSS** (Corollary 1): if probabilistic DPF correctness is unacceptable, build a DPF as the difference of two comparison FSSes at 2× key-size cost.&#8201;[^23]

---

## Open Problems (stated by the authors)

- Improve the asymptotic dependence on N in p-party DPF for p ≥ 3 from O(2^{p/2} · √N) to something polynomial in n = log N, **without** stronger assumptions.&#8201;[^19]
- Construct general FSS for polynomial-time computable ℱ from assumptions weaker than iO/VBB (or prove a barrier beyond §4.2).
- Construct FSS for AC⁰ from LPN or other "low-end" assumptions, despite the §4.2 barrier.

---

## Uncertainties

- **Algorithm 1 line 2 typo-or-spec** : "Set S^1_{¬a₁}[1] ← S^0_{¬a₁}[1]" — confirms the off-path level-1 seeds are *equal* between the two keys (only on-path seeds diverge). Cross-referenced against the security argument and inductive correctness.
- **Multi-party DPF "near-quadratic improvement"** language (abstract) refers to key size O(2^{p/2} · √N · m) vs trivial O(N · m): ratio ≈ √N for fixed p, i.e., the improvement is √N (one polynomial factor in N), not literally "near-quadratic" in n. Interpretation taken from §1.1's concrete formulas.
- The paper omits full proofs of correctness/security for `Gen•/Eval•`, `Gen<`/`Eval<`, `Gen^{p}`/`Eval^{p}`, deferring to the full version. Footnotes cite the relevant lemmas/propositions where stated.

---

[^1]: §1 (p.2) and §2 (p.6): each party runs `Eval(i, kᵢ, x)`; p-party PIR application has all servers compute the same weighted sum of `Eval(b, k_b, j)` over j ∈ [N] (p.9).
[^2]: Definition 2 (p.7): T-security via the indistinguishability game with corrupted set T ⊂ [p], advantage Adv(1^λ, 𝒜) = |Pr[b'=b]−½|. Remark 2(3) (p.8) notes equivalence to a simulation-based formulation.
[^3]: §3.3 (p.22) for VBB and sub-exponential iO results; §3.3 / Theorem 8 (p.22): "Assume the existence of sub-exponentially secure indistinguishability obfuscation and sub-exponentially secure one-way functions." The completeness statement involving LWE is stated in §1.1 (p.5).
[^4]: §3.2 "Two-key FSS for Comparison and Interval Functions" (p.18): "the current Gen algorithm returns correct keys with probability 1."
[^5]: Algorithm 1 lines 14–17 (p.12): if `G(S^0_{aₙ}[n]) ≠ G(S^1_{aₙ}[n])` set w accordingly, else set w ← 0 (failure case). §3.1 (p.11): "Gen• has a negligible probability of failure (expressed by setting w ← 0) … It is always possible to run Gen• again if it fails." Corollary 1 (p.20) gives an error-free DPF via two comparison FSSes.
[^6]: §1.1 "Improved DPF" (p.4): reduction from O(λ · n^{log₂ 3}) to O(λn).
[^7]: Abstract (p.1) and §1 (p.2): "is it possible to split an arbitrary f ∈ ℱ into p functions f_1,…,f_p such that (1) f(x) = ∑ᵢ fᵢ(x), (2) each fᵢ is described by a short key, (3) any strict subset of the keys completely hides f."
[^8]: §1 (p.2): "A DPF can be viewed as a 2-party FSS for the function class ℱ consisting of all point functions, namely all functions f : {0,1}^n → 𝔾 that evaluate to 0 on all but at most one input."
[^9]: §2 "Function-private output shares" / "Succinct, function-private output shares" (p.9): describes the 2-server PIR application explicitly — DPF keys for f_i, server responds with weighted sum, XOR of replies = D[i], single-server views are computationally indistinguishable.
[^10]: Definition 1 (p.6) and "Our setting: Linear share decoding" (p.10): "Linearity of reconstruction provides convenient share *compressibility*. Output shares must themselves be elements of the function output space, immediately guaranteeing share *succinctness*."
[^11]: Remark 2(1) (p.8): "By default, when not otherwise specified, 'secure FSS' will refer to (p−1)-security, in which any strict subset of parties may be corrupted."
[^12]: Definition 2 (p.7): full syntax of Gen and Eval with input/output types.
[^13]: Definition 2 (p.7): "Correctness: For all f ∈ ℱ, x ∈ D_f: Pr[(k_1,…,k_p) ← Gen(1^λ, f) : Dec(Eval(1,k_1,x),…,Eval(p,k_p,x)) = f(x)] = 1."
[^14]: §3.1 (p.11): "reduces the key size and the computational complexity compared to the construction of distributed point functions in [26], from O(λn^{log 3}) to O(λn), making use of a pseudorandom generator with seed length λ." Theorem 6 (p.20) for the comparison FSS.
[^15]: Theorem 9 (p.24): "Let (Gen, Eval) be a FSS scheme … w.r.t. a poly-spanning function class ℱ. Then for every f ∈ ℱ and every b ∈ {0,1}, the function family OutputShare_{f,b} … is a PRF family (against nonuniform adversaries)."
[^16]: Definition 3 (p.10): "the point function P_{a,b} : {0,1}^n → {0,1}^m is defined by P_{a,b}(a) = b and P_{a,b}(a') = 0^m for all a' ≠ a."
[^17]: §3.1 (p.11): "Each party's key, k_0 and k_1, defines a binary tree of depth n with a pseudo-random string at each node … The binary trees defined by k_0 and k_1 are identical except for the path from the root to the target point a = a_1, …, a_n. On this path, the strings in the two trees are chosen pseudo-randomly and independently of each other."
[^18]: §3.1 "A p-party protocol" (p.12): "Consider the 2^n-entry evaluation table of the secret function f_{a,b} as a 2^{n/2} × 2^{n/2} grid"; description of seeds-per-row and 2^{p−1} correction words.
[^19]: §1.1 "Multi-party DPF" (p.4): "the length of each DPF key k_i is O(λ · 2^{p/2} · N^{1/2}). Improving the asymptotic dependence on N (without relying on stronger assumptions) is one of the main questions left open by this work."
[^20]: §1.1 "Multi-party DPF" (p.4): "For p ≥ 3, our p-party DPF implies the first p-server, (p−1)-private PIR protocols with sublinear query length and constant answer length, as well as the first (p−1)-private sublinear-communication storage schemes in the model of [40]."
[^21]: §3.2 "Interval functions" (p.17), Lemma 1 (p.17): "Based on any DPF (i.e., FSS scheme for the class of multi-bit point functions) with key size s, there exists an FSS scheme for family ℱ^{int}_n, with key sizes O(sn)." Note from "Two-key FSS for Comparison and Interval Functions" (p.18): "supporting comparison functions also directly yields FSS for interval functions, with a factor of 2 overhead."
[^22]: Algorithms 5 & 6 (p.19); Lemma 2 / Proposition 1 / Theorem 6 (p.20).
[^23]: Theorem 6 (p.20): "(Gen<, Eval<) is a two-key FSS scheme for the family of comparison functions … with key size O(n(λ + log|𝔾|))." Corollary 1 (p.20): "P_{a,g}(x) = f^<_{a+1,g}(x) + (−f^<_{a,g}(x)) … there exists a two-key scheme for the family of point functions … without errors and with key size O(n(λ + log|𝔾|))."
[^24]: Theorem 7 / Corollary 2 (p.21): "the pair of algorithms (Gen^p, Eval^p) is an FSS scheme for the family of all comparison functions … secure against any coalition of at most p−1 keys and the key size is O(2^{n/2} · q^{(p−1)/2} log q)."
[^25]: §3.2 "Constant-conjunction search queries" (p.17): "Match_ℓ = {f_{S,v} : 𝔾_1^n → 𝔾} where f_{S,v}(x) = g if x_i = v_i ∀i ∈ S, 0 otherwise."
[^26]: §3.2 (p.17): "for N := (n|𝔾_1|)^ℓ, we obtain a FSS scheme supporting Match_ℓ with evaluation time O(λN log N) and key size O(λ log N). For the case of |𝔾_1| ∈ O(1), these correspond to runtime O(λn^ℓ ℓ log n) and key size O(λℓ log n)."
[^27]: §3.2 Transformation 2 (p.16): "Pre-composition with Arbitrary Function … This transformation extends to the case where the choice of function g may be made *dependent* on the secret function f, as long as the corresponding distribution of g is computationally indistinguishable from one independent of f. For example, g may consist of an encryption of some portion of f; indeed, such an approach can be used to bootstrap an FSS scheme for NC¹ to one supporting all P/poly, making use of fully homomorphic encryption (see Section 4.3)."
[^28]: §3.2 "General Transformations" (p.16) — six transformations enumerated.
[^29]: §3.2 "1. NC⁰ functions" / "2. Constant-conjunction search queries" / "3. Interval functions" (pp.16–17).
[^30]: §3.3 (p.22): "First obtain FSS schemes for P/poly given access to a program obfuscator that satisfies a virtual black-box (VBB) notion of security … We then build on top of recent advances in indistinguishability obfuscation (iO) … to demonstrate a similar conclusion from iO with sub-exponential hardness."
[^31]: §4.3 Proposition 4 (p.28): "Assuming the existence of fully homomorphic encryption with perfect correctness and decryption in NC¹, and FSS for NC¹, then there exists a secure FSS scheme for P/poly."
[^32]: Algorithm 1 line 1 (p.12): "Let G : {0,1}^λ → {0,1}^{max{2λ+2, m}} be a PRG." Algorithm 3 line 1 (p.14): "Let G : {0,1}^λ → {0,1}^{mμ} be a PRG."
[^33]: Notation 3 (p.18): "Let 𝔾 be an abelian group with group operation +"; algorithms 5–8 over generic 𝔾.
[^34]: Algorithm 1 line 19 (p.12): "Set k_β ← ((S^β_0[1], S^β_1[1], T^β_0[1], T^β_1[1]), (CW_0[1], CW_1[1], …, CW_0[n−1], CW_1[n−1]), w)."
[^35]: Notation 1 (p.11) and Algorithm 2 line 7 (p.13): "Parse G(S) as G(S) = s_0||s_1||t_0||t_1."
[^36]: §3.1 (pp.11–12): description of how Gen• ensures, on the divergent path, that strings in the two trees are independent and that the leaf-level XOR equals b.
[^37]: §3.1 (p.11): "Intuitively, security holds for (Gen•, Eval•) because all information related to the point function f_{a,b} is encoded in the strings cs, ct, masked by pseudorandom strings whose seeds appear only in the other party's key."
[^38]: §3.1 "A p-party protocol" (pp.12–13): full description of Gen^{p₀}/Eval^{p₀}.
[^39]: §3.1 properties (1)–(2) (p.13): "For each row γ' not equal to the special row γ … the number of parties holding s_{γ',j} in their key is *even*. Thus, during the evaluation phase, all contributions … will cancel out, leaving the desired 0 evaluation. For the special row γ, each s_{γ,j} will appear in an *odd* number of parties' keys."
[^40]: §3.1 properties (3)–(4) (p.13–14): "Given any p−1 keys, Case (1) and (2) are indistinguishable. The correction words … are chosen randomly subject to the constraint … this constraint exactly yields the required correctness guarantee. And, since the cw_j are random up to this condition, then even given any (2^{p−1} − 1) of the seeds … the distribution of these seeds together with all the cw_j's is computationally indistinguishable from random."
[^41]: §1 footnote 3 / §2 (p.9): description of 2-server PIR with DPF — server response is a single weighted-sum group element, XOR of two replies = D[i].
[^42]: §1 (p.3) "Multi-server PIR and secure keyword search": "Letting 𝔾 = ℤ_{m+1} and f = f_{w,1}, the client splits f into p additive shares … Server i computes and sends back to the client ∑_{w_j ∈ D} f_i(w_j). The client can find the number of matches by adding the p group elements." Footnote 41 of [^41] is unrelated; this is a separate application.
[^43]: §1 (p.3) "Incremental secret sharing": "A client who visits URL u can now secret-share the point function f = f_{u,1}, and each server i updates its shared entry of each URL u_j by locally adding f_i(u_j) to this share. The end result is that only position u_j in the shared array is incremented."
[^44]: §4.2 / §4.3 (pp.25–28): MPC implication chain. Definition 6 (p.27): comm-efficient online MPC with online comm O(∑(|x_i^A| + |x_i^B| + |f(x_i^A, x_i^B)|) · p(λ)), independent of |f|.
[^45]: §4.2 (p.25): "FSS for AC⁰ in combination with any symmetric-key encryption scheme with decryption in AC⁰ together imply a form of secure computation only currently known to exist based on existence of AC⁰-homomorphic encryption or reusable garbled circuits for AC⁰. … We conclude that FSS for AC⁰ is unlikely to be achieved based on sub-exponential LPN (or any weaker) assumption alone."
[^46]: §4.2 (p.25, "At the high end") and §4.3 (pp.27–28) Corollary 3: "Assuming FSS for P/poly, there exists communication-efficient online MPC for all P/poly."
[^47]: §1.2 "Information-theoretic multi-server PIR" (p.5): "the length of the query sent to each server must be linear in the database size [5, 45]. … Even with the above relaxations, the asymptotic communication complexity of the best known information-theoretic PIR protocols [15, 47, 21, 4, 6, 19] is worse than that of DPF-based protocols."
[^48]: Definition 2 (p.7): full statement of (Gen, Eval) syntax + correctness + security.
[^49]: Definition 4 (p.24): poly-spanning class definition + Remark 3 examples (multi-bit point and comparison).
[^50]: Definition 5 (p.24): "OutputShare_{f,b} the function family {Eval(b, k_b, ·)}_{k_b}."
[^51]: Definition 6 (p.27): formal statement of communication-efficient online MPC.
[^52]: §1.2 "Single-server PIR" (p.5): "single-server PIR protocols make an intensive (and in some sense inherent) use of public-key cryptography, compared to our PRG-based constructions for DPF and simple instances of FSS. Thus, the computational overhead on the server side, which typically forms the practical efficiency bottleneck, can be much lower in DPF-based protocols."
[^53]: §2 "'Function-private' output shares" / "Succinct, function-private output shares" (pp.8–9): garbled-circuit-based FSS with arbitrary reconstruction yields key size comparable to |f|; AND-reconstruction reduces to set intersection with Ω(N) communication, citing reference 37.
[^54]: §2 (p.9): "But most importantly, the linear structure of the DPF reconstruction enabled the output shares pertaining to all the different elements of the database to be *compressed* into a single short response."
