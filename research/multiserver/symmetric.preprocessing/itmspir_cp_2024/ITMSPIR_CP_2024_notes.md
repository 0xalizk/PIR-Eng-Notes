## ITMSPIR-CP — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Information-theoretic Multi-server Private Information Retrieval with Client Preprocessing](https://eprint.iacr.org/2024/780) (TCC 2024) |
| **Authors** | Jaspal Singh, Yu Wei, Vassilis Zikas (Purdue University) |
| **Archetype** | Construction (theory-only) + Building-block (PMPRS) |
| **Asymmetry profile** | **Role asymmetry (CK-style)** — Server&nbsp;0 is the *offline server* (linear scan to build hints, contacted once per session); Servers&nbsp;t…2t−1 are *online servers* each receiving one punctured key per query and doing Õ(√n) work. All 2t servers hold the same unencoded DB and are *symmetric in compute kind* (xor-only); only their *temporal role* differs.&#8201;[^1] |
| **Multi-server model** | 2t non-colluding servers (t ≥ 2) with **threshold 1** — security is broken if any two servers collude. Setting t = 2 → 4 servers; setting t = log(n)/2 → 2log(n) servers matches CK20's 2-server asymptotic (with non-colluding servers replacing OWF). Variant in §4.1 doubles to 4t servers to shave online communication.&#8201;[^2] |
| **Security model** | Adaptive, statistical (information-theoretic). One semi-honest server adversary; PMPRS used in the construction is *perfectly* secure (λ = 0, Definition 3).&#8201;[^3] |
| **Additional assumptions** | **None** — first PIR with client preprocessing in the CGK paradigm without any cryptographic assumption (no OWF, no DDH, no LWE).&#8201;[^4] |
| **Correctness model** | Probabilistic with negligible failure: client finds a usable PMPRS key with prob 1 − e^{−λ} after T = λ√n keys; per-query failure independent.&#8201;[^5] |
| **Rounds (online)** | 1 (client → t servers → client), plus a *replenishment* sub-round to t additional servers to refresh the consumed key/hint pair. |
| **Record-size regime** | Bit database DB ∈ {0,1}^n. |

[^1]: §1.1 "Information-theoretic PIR with client preprocessing" (p.4): the construction uses 2t servers, with the offline phase using the first server (Server 0) and online phase using the remaining t servers (servers t…2t−1); §4 (p.20) makes the role split explicit.
[^2]: §1.1 "Limitations" (p.5): "Our multi-server PIR scheme is also limited to threshold 1, and a collusion of two or more servers does violate client query privacy"; §4.1 (p.25) describes the 4t-server variant for reduced bandwidth.
[^3]: §3 Definition 3 (p.13): "A λ-secure PMPRS scheme with λ = 0 is called perfectly secure." Theorem 4 (p.15) shows the proposed PMPRS construction is perfectly secure. Multi-Server PIR security (§2.2, p.11) is defined statistically against an adaptive adversary corrupting one server.
[^4]: Abstract (p.1): "This work initiates the study of unconditional PIR with client prepossessing — where we avoid using any cryptographic assumptions"; §1.3 (p.10): "To the best of our knowledge, there's no previous work on unconditional PIR with client preprocessing."
[^5]: §4 (p.20): "Pr(x ∉ Set(k_0) ∧ … ∧ x ∉ Set(k_{T−1})) = (1 − 1/√n)^{λ√n} ≤ e^{−λ}"; failure probability bounded uniformly per query.

### Lineage
| Field | Value |
|-------|-------|
| **Builds on** | CGK20 [CGK20] — establishes the CGK paradigm (2-server preprocessing PIR) and the *privately puncturable pseudo-random set* primitive, instantiated from OWF. Piano [ZPSZ23] — single-server PRF-based realization with well-partitioned chunked sets (the same chunking structure is reused here). TreePIR [LP23] — first to formalize the *weaker* correctness notion (DotProdEval returns a vector containing the answer at one index) used by PMPRS. |
| **What changed** | (1) Generalizes a privately puncturable PRS to a *(t,n)-privately multi-puncturable random set* (PMPRS) — one Punc call returns t disjoint punctured keys whose union covers Set(k) ∖ {x}. (2) Realizes the primitive **information-theoretically** using a randomness matrix R of dimension t × d over [√n] inside a d-ary tree, eliminating cryptographic dependence. (3) Uses the t puncturings to spread one query across t online servers with a perfectly-simulatable view per server. |
| **Superseded by** | N/A (concurrent line of work; remains the only IT realization in the CGK paradigm). |
| **Concurrent work** | TwoServerSublinearSPIR (2025) and ScalableMSPIR (2025) — both filed in `multiserver/symmetric.preprocessing/`; ITMSPIR-CP precedes them at TCC 2024. |

### Core Idea
The CGK paradigm reduces sublinear-online-time PIR to a *privately puncturable random set* (PPS), traditionally instantiated from OWF (CGK20, Piano) or DDH (TreePIR). Singh–Wei–Zikas observe that the PIR client only needs *one* of the t partial parities returned by the online phase to reconstruct DB[x] — so the one PPS key can be replaced by a primitive that outputs **t disjoint punctured keys** simultaneously, and one's view is perfectly random whenever 2t−1 keys are absent. This relaxation enables an information-theoretic construction: a t × d matrix of uniform random offsets R imposes just enough structure on a √n-size set so that membership and t-puncturing are computable in Õ(1) and Õ(√n) bit-operations respectively, while any single punctured key is trivially simulatable. Online computation collapses to xor-only operations — orders of magnitude faster than OWF/DDH-based PIR-with-preprocessing schemes.&#8201;[^6]

[^6]: §1.1 "New information-theoretic primitive" (p.5) and §1.2 "((log₂ n)/2, n)-PMPRS construction" (pp.6–8): the binary-tree warm-up shows how each of t punctured keys hides x via the missing root-children path components R[i][1 − c_x^i] and the corr term.

### Multi-server Model

| Aspect | Server 0 (Offline) | Servers t … 2t−1 (Online) |
|--------|---------------------|----------------------------|
| **Trust** | Honest-but-curious; each server in isolation has a perfectly simulatable view (threshold 1). |
| **Data held** | Full replica of DB ∈ {0,1}^n, *unencoded*. Identical across all 2t servers. |
| **Phase contacted** | Once per session in the offline phase + once per query in the online replenishment sub-round. | Once per query (one of the t servers per query). |
| **Computation** | Per session: T = λ√n calls to PMPRS.Set ⇒ Õ(λn) total bit-operations. Per query (replenishment): one DotProdEval call ⇒ Õ(√n). | Per query: one DotProdEval(i, k_i, DB) ⇒ Õ(√n) bit-operations (xor-only). |
| **Communication received** | T full PMPRS keys (Õ(λ√n · tn^{1/2t})) in offline; t punctured keys per query in replenishment. | One punctured key k_i (Õ(tn^{1/2t}) bits). |
| **Communication sent** | T hint bits ⇒ Õ(λ√n) | Vector v⃗_i of size d^{i+1} ≤ √n bits per query. |
| **Non-collusion** | Required across **any pair of servers**. Threshold > 1 breaks privacy: a colluding pair sees ≥ 2 out of t punctured keys → the partition leaks the chunk of x.&#8201;[^7] |

[^7]: §1.1 "Limitations" (p.5): threshold-1 limit. §3 Definition 2 "Privacy" (p.12): each *single* punctured key k_i is simulatable from (t, n, i), but joint simulation of two keys is not given.

### Variants

| Variant | Setting | t | Servers | Client storage | Online comm | Online server time | Reference |
|---|---|---|---|---|---|---|---|
| Generic 2t-server PIR | 2t servers, n^{1/2t} integer | any t ∈ [2, log₂(n)/2] | 2t | Õ(λ√n · t² n^{1/2t}) | Õ(√n · t) | Õ(√n) per server | Theorem 12 (p.24) |
| **t = 2 sweet spot** | 4 servers | 2 | 4 | Õ(n^{3/4}) | Õ(n^{1/2}) | Õ(√n) | §1.1 (p.4) |
| **t = log(n)/2** | 2log(n) servers | log(n)/2 | 2log(n) | Õ(√n) | Õ(√n) | Õ(√n) | §1.1 (p.4) — matches CGK20's 2-server OWF result, no crypto |
| **Reduced-bandwidth 4t-server** | 4t servers, threshold 1 | as above | 4t | Õ(λ√n · t² n^{1/2t}) | n^{1/2t + o(1)} | Õ(√n) per server | Theorem 14 (p.26), §4.1 |

The 4t-server variant pairs each online server with a twin and uses an inner 2-server IT PIR (Dvir–Gopi [DG16]) to retrieve only one bit of the v⃗_i vector, dropping online communication to subpolynomial.&#8201;[^8]

[^8]: §4.1 "Improving PIR Communication complexity" (p.25): "consider 4t servers — two servers for each server in the original PIR scheme … the Client can use a 2-server PIR scheme to retrieve just the bit of interest."

### Novel Primitives / Abstractions

#### Privately Multi-Puncturable Random Set (PMPRS) — Section 3

| Field | Detail |
|-------|--------|
| **Name** | (t, n)-Privately Multi-Puncturable Random Set |
| **Type** | Information-theoretic primitive (set-valued generalization of a privately puncturable random set) |
| **Operations** | `Gen(Δ?, 1^t, 1^n) → k` (optionally conditioned on Δ ∈ Set(k)); `Set(k) → S ⊆ [n], |S| = √n` (a *well-partitioned* set: exactly one element per √n-chunk of [n]); `Test(k, x) → {T, F}` (membership in O(poly log n)); `Punc(k, x) → ((S_0,k_0,ind_0), …, (S_{t−1},k_{t−1},ind_{t−1}))` with sets S_0…S_{t−1} pairwise disjoint and ⋃ S_i = Set(k) ∖ {x}; `DotProdEval(i, k_i, DB) → v⃗_i` such that v⃗_i[ind_i] = ⊕_{j ∈ S_i} DB[j].&#8201;[^9] |
| **Security** | Each k_i is **statistically simulatable** from just (t, n, i); the proposed construction is *perfectly* secure (λ = 0, Theorem 4, p.15). Hides the punctured element x from any single punctured key.&#8201;[^10] |
| **Correctness** | *Weak* correctness (TreePIR-style): only the ind_i^{th} bit of the output vector v⃗_i is required to equal ⊕_{j ∈ S_i} DB[j]; other bits unconstrained. Sets S_0…S_{t−1} form an exact disjoint partition of Set(k) ∖ {x}. |
| **Randomness** | Pr[x ∈ Set(Gen(1^t, 1^n))] = 1/√n for any x ∈ [n]; conditioned on Δ being in the set, Pr[x ∈ Set(Gen(Δ, 1^t, 1^n))] = 1/√n for any x not in the same chunk as Δ.&#8201;[^11] |
| **Purpose** | Spread a √n-size partition across t online servers in the CGK paradigm, with each server seeing a perfectly simulatable view; replaces the OWF-based puncturable PRS in CGK20/Piano with an unconditional construction. |
| **Built from** | A t × d random matrix R ∈ ([√n])^{t × d} for d = n^{1/2t} (with the offset of element in chunk c given by ⊕_{i=0}^{t−1} R[i][c^i] over the base-d decomposition of c) plus a single offset corr ∈ [√n] used to align Δ. The construction is visualized as a d-ary tree T_{d,n} of depth t (= ½log_d(n)) over [n] with √n leaves (one per chunk).&#8201;[^12] |
| **Standalone complexity** | Test: O(poly log n). Set: Õ(√n). Punc: Õ(√n) for t ∈ [2, ½log₂(n)] (general bound Õ(√n + t² n^{1/2t})). DotProdEval: Õ(√n). Key sizes: Õ(t n^{1/2t}) (Theorem 8, p.19).&#8201;[^13] |
| **Relationship to prior primitives** | Generalizes CGK20's PPS (the t=1 case is essentially a single-puncturable random set); generalizes Piano's chunked PRF-derived set construction by replacing the PRF with a random matrix R; uses TreePIR's *weaker* correctness notion (vector output, only one bit guaranteed). NOT a DPF — set, not unit-vector. |

[^9]: §3 Definition 1 (PMPRS syntax, p.12): the five algorithms with their input/output types.
[^10]: §3 Definition 2 (Privacy, p.13): "Each punctured key k_i can be simulated using just the parameters t, n, i, … it hides the punctured element x." Theorem 4 (p.15): construction is perfectly secure.
[^11]: §3 Definition 2 (Randomness, p.13).
[^12]: §1.2 "((log₂ n)/2, n)-PMPRS construction" (p.6) introduces the binary-tree variant with t = log₂(n)/2; §3.1 "Proposed PMPRS construction" (p.13) generalizes to d-ary trees with d = n^{1/2t}.
[^13]: Theorem 8 (p.19): "Test runs in O(poly log n); Set in Õ(√n); Punc in Õ(√n + t²n^{1/2t}); DotProdEval in Õ(√n); k and k_i have size Õ(t n^{1/2t})."

##### PMPRS algorithm sketch (Figure 3, p.16)

- **Gen(1^t, 1^n, Δ)** picks t × d uniform matrix R ∈ ([√n])^{t × d}; computes offset of Δ via ChunkCoord(Δ); sets corr = δ_Δ ⊕ (⊕_{i=0}^{t−1} R[i][c_Δ^i]) so that Set(k = (R, corr)) contains Δ. (When Δ is omitted, corr is uniform.)
- **Set((R, corr))** for each chunk c ∈ [√n] computes offset corr ⊕ (⊕_{i=0}^{t−1} R[i][c^i]) (where (c^0, …, c^{t−1}) is the base-d decomposition of c) — yielding one element per chunk.
- **Test((R, corr), x)** computes (c_x, δ_x) ← ChunkCoord(x) and checks corr ⊕ (⊕_{i=0}^{t−1} R[i][c_x^i]) =? δ_x.
- **Punc((R, corr), x)** removes the path from root to chunk c_x in the d-ary tree T_{d,n}, partitioning the remaining tree into t "punctured trees" T'_0, …, T'_{t−1} (the i^{th} tree has root at depth i+1 and one of its children subtrees removed). Each k_i = (R_i, corr_i, r_i) where R_i = R[i+1:][:] (rows ≥ i+1 of R), corr_i = corr ⊕ (⊕_{j=0}^{i−1} R[j][c_x^j]), and r_i = R[i][1 − c_x^i] is one of the two (or d−1) random strings at depth i that is **not** used by δ_x. The vital privacy invariant: k_i contains no information about R[i][c_x^i] — masking δ_x — and no information about which chunk contains x.
- **DotProdEval(i, k_i, DB)** first reconstructs the offset vector δ⃗ for the leaves of T'_i in increasing chunk order (size 2·d^{t−i−1} for binary, generally d^{t−i−1}·(d−1)); then iterates over the d^{i+1} possible "punctured subtrees" at depth i (only one of which is the true T'_i — depending on the unknown chunk index of x), computing for each candidate subtree the xor of DB at the implied set, and appending that to v⃗_i. Exactly one of these — at position ind_i — is the correct ⊕_{j ∈ S_i} DB[j]. Sibling-subtrees only differ in 2·d^{t−i−1} elements, giving the Õ(√n) bound.&#8201;[^14]

[^14]: Pages 14–15 (after Definition 3) describe DotProdEval: "for adjacent element in v⃗_i, their corresponding set S_uw and S_uw' are only different in 2·d^{t−i−1} elements … making the complexity of DotProdEval Õ(√n)"; Theorem 8 (p.19) establishes the bound formally.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **None** — information-theoretic / unconditional. PMPRS perfectly secure (Theorem 4). PIR security statistical against threshold-1 adversaries (Theorem 9). |
| **Encryption / encoding scheme** | None. All operations are bit-XOR. |
| **Ring / Field** | Domain [n] viewed as a disjoint union of √n chunks of √n elements each (Piano-style well-partitioned sets). All offsets live in [√n]. |
| **Key structure** | PMPRS key k = (R, corr) where R ∈ ([√n])^{t × d} (t = ½log_d n, d = n^{1/2t}) and corr ∈ [√n]. Punctured key k_i = (corr_i, r⃗_i, R_i) of size Õ(t n^{1/2t}). |
| **Correctness condition** | (i) After T = λ√n offline keys, Pr[client query x not in any Set(k_j)] = (1 − 1/√n)^{λ√n} ≤ e^{−λ} (negligible in λ for any super-constant λ). (ii) PMPRS *correctness* is exact (Lemma 5, p.17): the partition S_0…S_{t−1} is always a disjoint partition of Set(k) ∖ {x}, and the targeted bit v⃗_i[ind_i] is always exactly ⊕_{j ∈ S_i} DB[j].&#8201;[^15] |

[^15]: §4 (p.20): client-storage failure prob bound; Lemma 5 (p.17): PMPRS correctness is exact.

### Key Data Structures
- **DB:** x ∈ {0,1}^n stored unencoded on all 2t servers (replicated). Central to claiming "no additional server storage after offline phase."
- **Client persistent state:** vector k⃗ = (k_0, …, k_{T−1}) of T = λ√n PMPRS keys (Õ(λn^{1/2 + 1/2t}) bits) plus vector h⃗ = (h_0, …, h_{T−1}) of T hint bits (Õ(λ√n) bits). Total Õ(λ√n · t² n^{1/2t}) for general t; Õ(λ√n) when t = ½log₂(n).&#8201;[^16]
- **d-ary tree T_{d,n}:** mental model only; not stored. Depth t = ½log_d n; √n leaves, one per chunk of [n]; d-ary internal nodes labeled by R[depth][child].
- **Online query:** t punctured keys (k_0, …, k_{t−1}) with sizes Õ(tn^{1/2t}) each, sent one per online server.
- **Per-query response v⃗_i:** vector of length d^{i+1}, total Õ(√n) bits across the t servers.

[^16]: Theorem 12 (p.24): client storage Õ(λ√n · t² n^{1/2t}); for t ∈ [2, log₂ n], Õ(λ√n).

### Database Encoding
- **Representation:** plain bit-string. The d-ary tree partition is a *client-side* mental structure imposed via ChunkCoord; the server stores nothing tree-shaped.
- **Record addressing:** ChunkCoord(x) = (⌊x/√n⌋, x mod √n) ∈ [√n] × [√n]; offsets further bit-decomposed into base-d digits (c_x^0, …, c_x^{t−1}) for tree path interpretation.
- **Preprocessing required:** None on the server beyond replication.

### Protocol Phases (Figure 4, p.21)

| Phase | Actor | Operation | Communication | Frequency |
|-------|-------|-----------|---------------|-----------|
| **Setup** | Client | For i = 1…T: k_i ← PMPRS.Gen(1^t, 1^n); store in vector k⃗ | — | Once / session |
| **Offline upload** | Client → Server 0 | k⃗ (T = λ√n PMPRS keys) | Õ(λ n^{1/2 + 1/2t}) | Once |
| **Hint computation** | Server 0 | For i = 1…T: h_i ← ⊕_{j ∈ Set(k_i)} DB[j] | — (Õ(λn) compute, T·√n xor probes) | Once |
| **Offline download** | Server 0 → Client | h⃗ = (h_1, …, h_T) | Õ(λ√n) bits | Once |
| **Query lookup** | Client | Find i with Test(k⃗[i], x) = T; recover (k, h) ← (k⃗[i], h⃗[i]) | — | Per query |
| **Online puncture** | Client | (S_0,k_0,ind_0), …, (S_{t−1},k_{t−1},ind_{t−1}) ← Punc(k, x) | — | Per query |
| **Online upload** | Client → Server t+i (i ∈ [t]) | k_i (one punctured key per online server) | Õ(t · t n^{1/2t}) total | Per query |
| **Server compute** | Online servers t…2t−1 | v⃗_i ← DotProdEval(i, k_i, DB) | — (Õ(√n) per server) | Per query |
| **Online download** | Each Server t+i → Client | v⃗_i (size d^{i+1}) | Σ_i d^{i+1} = Õ(√n) bits total | Per query |
| **Reconstruct** | Client | DB[x] ← h ⊕ (⊕_{i=0}^{t−1} v⃗_i[ind_i]) | — | Per query |
| **Replenish** | Client | k′ ← Gen(1^t, 1^n, x); (S′_i, k′_i, ind′_i) ← Punc(k′, x); send k′_i to *Server i* (i ∈ [t]) | Õ(t² n^{1/2t}) | Per query |
| **Replenish answer** | Servers 0…t−1 | v⃗′_i ← DotProdEval(i, k′_i, DB) | Õ(√n) total | Per query |
| **Replenish reconstruct** | Client | h′ ← (⊕_{i=0}^{t−1} v⃗′_i[ind′_i]) ⊕ DB[x]; replace (k, h) ← (k′, h′) in client state | — | Per query |

The replenishment sub-round mirrors CK20/Piano's hint-refresh idea: the new key k′ is sampled conditioned on x ∈ Set(k′), then *the same* punctured-key trick is used (against servers 0…t−1, not t…2t−1) to compute the hint bit for k′ without leaking x.&#8201;[^17]

[^17]: §1.2 "2t-server PIR with client preprocessing" (p.9): "the Client samples a new key k′ such that x ∈ Set(k′). It punctures this key k′ at x and it sends its t components to servers 0, 1, …, (t−1) in the online phase."

### Correctness Analysis (Option B — Probabilistic)

| Field | Detail |
|-------|--------|
| **Failure mode** | None of the T = λ√n offline keys k_j contains the queried index x (i.e., Test(k_j, x) = F for all j). |
| **Failure probability** | (1 − 1/√n)^{λ√n} ≤ e^{−λ} (Pr[x ∈ Set(Gen)] = 1/√n by Lemma 6, p.17). |
| **Probability grows over queries?** | No — replenishment maintains the invariant that the client always has T fresh keys whose marginal distributions match offline-phase keys. |
| **Probability grows over DB mutations?** | N/A (static DB). |
| **Adaptive vs non-adaptive** | Adaptive — security definition (§2.2, p.11) explicitly allows the adversary to adaptively pick query indices. |
| **Query model restrictions** | Up to poly(λ) queries per offline phase (Theorem 9, p.21). |
| **Proof technique** | Standard hybrid argument reducing real client view to PMPRS simulation (Lemmas 10–11, pp.21–23): each online query reveals at most one PMPRS punctured key per server, which is simulatable by Definition 2 privacy. |
| **Amplification** | T = λ√n already drives failure to e^{−λ}; no parallel repetition needed. |

### Complexity (Theorem 12, p.24)

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|----------|-------|
| Client storage (general t) | Õ(λ√n · t² n^{1/2t}) | N/A | Persistent |
| Client storage (t ∈ [2, log₂ n]) | Õ(λ√n) | N/A | Persistent |
| Server-side persistent storage | 0 (no extra state after offline) | N/A | Persistent |
| Offline server time | Õ(λn) | N/A | Offline (one-time) |
| Offline client time | Õ(λ√n · t n^{1/2t}); Õ(λ√n) for t ∈ [2, log₂ n] | N/A | Offline |
| Offline communication | Õ(λn^{1/2 + 1/2t}) | N/A | Offline |
| Online server time | Õ(√n) per server | N/A | Online |
| Online client time | Õ(√n + t² n^{1/2t}); Õ(√n) for t ∈ [2, log₂ n] | N/A | Online |
| Online communication | Õ(√n · t); Õ(λ√n) for t ∈ [2, log₂ n] | N/A | Online |
| Amortized comm / query | Õ(√n) | N/A | Across q queries |
| Amortized compute / query (server, client) | Õ(√n) | N/A | Across q queries |

All compute costs are in **bit operations**, which the authors emphasize is orders of magnitude faster than poly(log κ) bit operations needed for one OWF/PRG/AES call in CGK20/Piano/TreePIR.&#8201;[^18]

[^18]: §1.1 "Information-theoretic PIR with client preprocessing" (p.4): "the client/server computation has to perform O(poly log κ) cryptographic operations — each requiring O(poly log κ) bit operations, where κ is the security parameter. The online communication of our scheme has no security parameter multiplicative factor."

### Comparison to Prior Approaches

| Scheme | Servers | Assumption | Online server time | Online comm | Client storage | Online ops kind |
|---|---|---|---|---|---|---|
| CK20 [CGK20] (Thm 14, computational) | 2 | OWF/PRG | Õ(√n) | O(λ² log n) | Õ(λ √n) | OWF (poly log κ ops) |
| CK20 (Thm 22, FHE) | 1 | FHE | Õ(√n) | Õ(√n) | Õ(√n) | FHE |
| Piano [ZPSZ23] | 1 | OWF | Õ(√n) | Õ(√n) | Õ(√n) | PRF (AES) |
| TreePIR [LP23] | 2 | DDH | Õ(√n) | Õ(√n) | Õ(√n) | DDH (group exp) |
| **ITMSPIR-CP, t = 2** | 4 | **None** | Õ(√n) | Õ(√n) | Õ(n^{3/4}) | xor only |
| **ITMSPIR-CP, t = log(n)/2** | 2 log n | **None** | Õ(√n) | Õ(√n) | Õ(√n) | xor only |
| **ITMSPIR-CP, 4t-server (Thm 14)** | 4t | **None** | Õ(√n) per server | n^{1/2t + o(1)} | Õ(λ√n · t²n^{1/2t}) | xor + IT-PIR |

**Key takeaway:** First *unconditional* PIR with client preprocessing in the CGK paradigm. Trades a constant blowup in server count (4 → 2 log n servers) for elimination of cryptographic assumptions and replacement of all crypto operations with bit-XOR — orders of magnitude speedup in online compute when realized.

### Key Tradeoffs & Limitations
- **Threshold-1 only.** Any pair of colluding servers breaks privacy (the joint view of two punctured keys is **not** simulatable). This is strictly weaker than CK20's 2-server (threshold 1 of 2) — extending to higher thresholds is left open.&#8201;[^19]
- **t ≥ 2 required** (i.e., ≥ 4 servers). The PMPRS construction is *non-trivial only for t ≥ 2*; whether unconditional PIR-with-client-preprocessing exists for **2 or 3 servers** is left as the main open question.&#8201;[^20]
- **n^{1/2t} integer.** The base-d tree construction needs n^{1/2t} ∈ ℕ; arbitrary n is handled by padding (Remark 13, p.25) with at most O(tn) dummy elements, preserving asymptotics up to polylog factors.
- **No implementation / benchmarks.** TCC theory paper; concrete bit-operation count claimed practical but not measured.
- **One-time linear server work in offline phase.** Õ(λn) bit-XORs; same as CGK20/Piano.
- **No client anonymity.** Client must persist Õ(λ√n) state between offline and online phases.

[^19]: §1.1 "Limitations" (p.5): "We leave it as future work to explore the possibility of construction PIR with client preprocessing with higher corruption thresholds."
[^20]: §1.1 "Limitations" (p.5): "It remains open if a non-trivial PIR with client preprocessing exists for 2 or 3 servers."

### Comparison with Prior Work

| Metric | ITMSPIR-CP (t = log n/2) | CK20 Thm 14 | Piano | TreePIR |
|--------|--------------------------|--------------|-------|---------|
| Online server time | Õ(√n) bit-ops | Õ(√n) PRG-ops | Õ(√n) AES-ops | Õ(√n) DDH-exp |
| Online comm | Õ(√n) | O(λ² log n) | Õ(√n) | Õ(√n) |
| Online ops cryptographic? | **No (xor only)** | Yes | Yes | Yes |
| Cryptographic assumption | **None** | OWF/PRG | OWF | DDH |
| Server count | 2 log n | 2 | 1 | 2 |
| Client storage | Õ(√n) | Õ(λ √n) | Õ(√n) | Õ(√n) |
| Threshold | 1 of 2 log n | 1 of 2 | n/a | 1 of 2 |
| Offline server time | Õ(λn) | Õ(n) | Õ(n) | Õ(n) |

**Key takeaway:** Trades server count and threshold strength (4 → 2 log n servers, threshold 1 only) for unconditional security and asymptotically faster online operations (xor vs OWF/AES/DDH).

### Portable Optimizations
- **PMPRS abstraction (Section 3).** A reusable IT primitive: (t × d) random matrix + correction term + base-d tree interpretation gives compact private-puncturable-set keys with Õ(t n^{1/2t}) size. Could replace any place a PRF is currently used to derive √n-sized random sets when more than one non-colluding party is available.
- **Adjacent-subtree differential trick.** Inside DotProdEval, the Õ(d^{t−i−1}) saving (vs trivial Õ(d^{t−i})) by exploiting that sibling subtrees differ by only 2·d^{t−i−1} elements is reusable in any tree-based set/parity computation.
- **t-disjoint-puncture template.** The CGK paradigm itself can be reformulated to use *partitioning puncture* (returning t disjoint keys) instead of *single puncture* — increases server count but allows weaker privacy per server, enabling IT instantiations.

### Implementation Notes
- **No implementation.** Theory paper.
- **Practical instantiation.** ChunkCoord and bit-decomp are O(log n)-bit table lookups; R is t × d ≤ ½log(n) × √n integers in [√n] (≈ ½ √n log²n bits total). Server-side DotProdEval is a tight loop of √n DB-bit XORs plus tree-coordinate arithmetic.
- **Open source:** none mentioned.

### Open Problems (stated in §1.1, p.5)
- Does an unconditional PIR with client preprocessing exist for **2 or 3 servers** (currently t ≥ 2 ⇒ ≥ 4 servers)?
- Construct a PIR with client preprocessing tolerating **higher corruption thresholds** (currently threshold 1).
- Realize an unconditional 2-server CGK-paradigm PIR matching CK20 Theorem 11 (statistical) directly without the multi-puncture detour.

### Uncertainties
- Concrete λ. Paper uses statistical security parameter throughout but does not commit to a target value (typical κ = 40 implied).
- The 4t-server variant (Theorem 14, §4.1) instantiates Dvir–Gopi [DG16] as the inner 2-server IT-PIR; final online comm n^{1/2d + o(1)} where d is Dvir–Gopi's matrix-rigidity parameter. Exact mapping of d not laid out in §4.1.
- "Multi-server" header in §2.2 says "l server protocol contains (l+1) parties" — l likely refers to the number of servers (= 2t) with one extra for the client; convention used consistently in §4.
