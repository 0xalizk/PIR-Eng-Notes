## HenzingerRagavan — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Two-Server Private Information Retrieval in Sublinear Time and Quasilinear Space](https://eprint.iacr.org/2025/2008) (EuroCrypt 2026, ePrint 2025/2008, dated 23 Feb 2026) |
| **Authors** | Alexandra Henzinger (MIT CSAIL), Seyoon Ragavan (MIT) |
| **Archetype** | Theory + Construction (theory-only, with preliminary implementation) + Building-block (compact polynomial-derivative data structure) |
| **Asymmetry profile** | **Symmetric across both servers** (identical role, identical storage, identical work). The breakthrough is in the **storage–time tradeoff curve** itself, not in load distribution between servers. Filed in `multiserver/symmetric.IT/` because privacy is information-theoretic against any single non-colluding server.&#8201;[^1] |
| **Security model** | Information-theoretic 2-server, 1-private (semi-honest, non-colluding). Generalises to s ≥ 2 servers with collusion threshold t ≤ s−1.&#8201;[^2] |
| **Additional assumptions** | None for the IT scheme. The communication-shrunk variant (§3.3) additionally assumes strongly-compact, multi-hop linearly or fully homomorphic encryption over 𝔽₂.&#8201;[^3] |
| **Correctness model** | **Deterministic** — the reconstruction equation `DB_i = Σ_{t∈T_{D,m,p}} (f(qu₁+t) + f(qu₂+t))` holds for every honest execution (Theorem 3.8).&#8201;[^4] |
| **Rounds (online)** | 1 (client sends one point in 𝔽₂ᵐ to each server in parallel; servers reply with bit strings) |
| **Record-size regime** | Parameterized — n total bits with record length ℓ ∈ {1, 32, 64} bytes evaluated in §6 |

[^1]: Abstract (p.1) + Theorem 3.2 (p.13): "information-theoretically private, two-server PIR-with-preprocessing scheme." Definition 2.3 (p.10) gives information-theoretic t-privacy as identical query distributions to any t-collusion-bounded subset of servers.
[^2]: Section 5 / Theorem 5.3 + Theorem 5.4 (p.22–23): "s-server, information-theoretically t-private PIR-with-preprocessing scheme" parameterised by collusion threshold t ∈ [s−1].
[^3]: Theorem 3.9 (p.17) and §C.2/§C.3 (p.44–48): the LHE/FHE upgrade is over 𝔽₂ with strong compactness and multi-hop properties (Halevi's notion).
[^4]: Theorem 3.8 (p.15): "Let f : 𝔽₂ᵐ → 𝔽₂ be any homogeneous, multilinear polynomial of total degree D. Then, for any two points p ∈ S_{D,1,m} and r ∈ 𝔽₂ᵐ, we have f(p) = Σ_{t∈𝒯_{D,m,p}} (f(r+t) + f(r+p+t))." This is proved combinatorially over 𝔽₂ in equations (3)–(4) (p.16); no probabilistic guarantee is invoked.

### Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 in §3 (main result); generalised to s ≥ 2 constant in §5. Crucially, s does **not** grow with n.&#8201;[^5] |
| **Replication** | Both servers store an **identical** preprocessed data structure (the truth table of f_{DB} : 𝔽₂ᵐ → 𝔽₂ — i.e., its 2ᵐ evaluations on the Boolean cube).&#8201;[^6] |
| **Trust model** | Non-colluding, semi-honest. Privacy is **information-theoretic** (perfect, not statistical): each server's marginal query distribution is identical to a uniformly random point in 𝔽₂ᵐ regardless of i.&#8201;[^7] |
| **Communication topology** | Star — client communicates with each server independently; no server↔server channel. |
| **Server symmetry** | **Fully symmetric**: each server holds the same data structure, runs the same `Answer` algorithm, performs the same number of memory accesses, and sends the same number of bits per query. The asymmetry lives in the *information* the user combines from the two answers, not in the servers' workloads. |
| **Online round structure** | 1 round: client samples r ←$ 𝔽₂ᵐ, sends qu₁ = r and qu₂ = r + p (where p = E_{D,1,m}(i) encodes the index); each server replies with the slice of the truth table inside the Hamming ball of radius ⌊D/2⌋ around its query point. |
| **Realisability of non-collusion** | Standard 2-server cryptographic assumption (different organisations / cloud regions). |

[^5]: Section 1.1, "Extending to more servers" (p.4): "the number of servers is a constant — i.e., it does not grow with the size of the database — and so our schemes support databases of any size." This is contrasted in §1.3 (p.9) with [LLF⁺25] which requires s = ω(1).
[^6]: Construction 3.1 (p.13): "Build Table : 𝔽₂ᵐ → 𝔽₂ that, for each point x ∈ 𝔽₂ᵐ, stores the evaluation f_{DB}(x) ∈ 𝔽₂." Both servers share this same table by Definition 2.1's Preprocess routine (p.10).
[^7]: Section 3.2 (p.15): "Security is immediate" — qu₁ = r and qu₂ = r + p are each uniform in 𝔽₂ᵐ on their own. Definition 2.3 (p.10) defines information-theoretic t-privacy via identical distributions, not statistical distance.

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Beimel–Ishai–Malkin (BIM00, "Reducing the servers computation in PIR") — the original PIR-with-preprocessing model. Direct technical predecessor: Ghoshal–Li–Ma–Dai–Shi ([GLM⁺25], TCC '25), which recast BIM in terms of Hasse derivatives.&#8201;[^8] Polynomial database encoding traces to BIM00, BIK05, WY05, DG16. |
| **What changed** | BIM00 / GLM⁺25 store the truth tables of f_{DB} **and of all its Hasse derivatives up to order ⌊D/s⌋**, costing q^m · Σ_{ℓ≤D/s} (m choose ℓ) = poly(n) storage. This work observes that **Hasse derivatives can be reconstructed on-the-fly from the truth table of f_{DB} alone**, by taking finite differences of evaluations in a Hamming ball. Storage shrinks to just q^m = 2^m = n^{1+o(1)} bits, while per-query memory accesses stay Θ(n^ε) for the same ε.&#8201;[^9] |
| **Superseded by** | N/A (Feb 2026) |
| **Concurrent work** | [LLF⁺25] (Lazzaretti–Liu–Fisch–Miao–Papamanthou, TCC '25) — multi-server doubly efficient PIR with growing s = ω(1); [CIMR25] (Chen–Ishai–Mour–Rosen, ePrint '25) — secret-key PIR with preprocessing.&#8201;[^10] |

[^8]: Section 1.1 "Abstract view of our techniques" (p.4) and §1.2 (p.6–7): "All prior information-theoretic PIR-with-preprocessing schemes (with a constant number of servers and with server time n^{1−Ω(1)}) follow a strategy of Beimel, Ishai, and Malkin … In this protocol, each of the s servers stores the truth table of f_{DB} and of all of its partial derivatives up to order ⌊D/s⌋."
[^9]: §1.2, "Idea 1: Reconstruction via finite differences" (p.6–7) and Theorem 3.2 (p.13). The on-the-fly reconstruction uses Equation (1) (p.7): ∂̄_e f_{DB}(qu) = Σ_{e′≤e, e′∈{0,1}^m} (−1)^{|e−e′|₁} · f_{DB}(qu + e′), which expresses any first-in-each-variable Hasse derivative as a signed sum of 2^{|e|₁} evaluations.
[^10]: §1.3 "Related Work" (p.8–9): [LLF⁺25] achieves n^{1+o(1)} storage and polylog(n) server time **but with three or more servers and ω(1) rounds of server–server interaction via DORAM**. [CIMR25] is in the secret-key (private-key) setting.

### Core Idea

Recast PIR as private polynomial evaluation: the database becomes a homogeneous, multilinear polynomial f_{DB} : 𝔽₂ᵐ → 𝔽₂ of total degree D, with f_{DB}(E_{D,1,m}(i)) = DB_i for a public encoding E_{D,1,m}. To query index i, the client samples r ←$ 𝔽₂ᵐ and sends qu₁ = r, qu₂ = r + p (where p = E_{D,1,m}(i)) — additive secret-sharing of p.&#8201;[^11] Each server, holding the truth table of f_{DB}, replies with the slice {f_{DB}(qu_j + e) : e ∈ {0,1}ᵐ, ‖e‖₁ ≤ ⌊D/2⌋} — i.e., evaluations in a Hamming ball of radius ⌊D/2⌋ around its query point. The client recovers DB_i via a closed-form combinatorial sum (Theorem 3.8) over a carefully defined collection 𝒯_{D,m,p} of sparse offsets, eliminating any explicit derivative computation.&#8201;[^12] Compared to BIM00/GLM⁺25, **storage drops by Θ(n^ε)** because no derivative truth tables are stored; server time and communication per query stay the same asymptotically.

[^11]: Construction 3.1 (p.13): Query(i) samples r ←$ 𝔽₂ᵐ, computes p = E_{D,1,m}(i), outputs (st = p, qu₁ = r, qu₂ = r + p). §1.2 (p.5): "the user samples a random line L : 𝔽_q → 𝔽_q^m with slope p and sends each server one point on this line."
[^12]: Definition 3.5 (p.14) defines 𝒯_{D,m,p} as a collection of sparse vectors of Hamming weight ≤ ⌊D/2⌋ supported on supp(p) (or supp(p)\{i_p} for D even). Theorem 3.8 (p.15) gives the reconstruction identity. Proposition 3.7 (p.15) proves |supp(t)| ≤ ⌊D/2⌋ for every t ∈ 𝒯_{D,m,p}, which bounds each server's read set to a Hamming ball of radius ⌊D/2⌋ around its query.

### Storage–Time Tradeoff (the breakthrough)

For 25 years after BIM00, the best known IT 2-server PIR-with-preprocessing tradeoff was server storage Õ(n^{1/H(θ)}) with server time per query Õ(n^{H(θ)/(H(θ)+H(θ/2))} ⋅ something), and crucially **storage exponent never reached 1+o(1) while keeping time polynomially sublinear**. This work delivers:

| θ | Storage | Server time per query | Communication |
|---|---------|-----------------------|---------------|
| any 0 < θ ≤ 1/2 | n^{1/H(θ) + o(1)} | n^{H(θ/2)/H(θ) + o(1)} | n^{H(θ/2)/H(θ) + o(1)} |
| **θ = 1/2** (Cor. 3.3) | **≤ 1.5·√(log n)·n** bits — **quasilinear n^{1+o(1)}** | **≤ 12·n^{0.82}** | ≤ 12·n^{0.82} |
| **θ = 1/5** (Cor. 3.4) | n^{1.39 + o(1)} | n^{0.65 + o(1)} | n^{0.65 + o(1)} |

The θ = 1/2 point is the **first IT PIR-with-preprocessing with a constant number of servers** to simultaneously achieve quasilinear storage **and** polynomially sublinear server time — closing a gap that prior work could only address one side of (poly(n) storage with sublinear time, or O(n) storage with no sublinear-time guarantee).&#8201;[^13]

[^13]: §1 (p.1–2) and Figure 1 (p.3): "To our knowledge, this is the first information-theoretic PIR with any constant number of servers that has quasilinear server storage n^{1+o(1)} and polynomially sublinear server time n^{1−Ω(1)}." Corollary 3.3 (p.13) states the no-hidden-constants form: storage ≤ 1.5·√(log n)·n bits, server time per query ≤ 12·n^{0.82}, for n > 10⁶.

### Variants

| Variant | Mechanism | Server storage | Server time / query | Communication / query | Best for |
|---------|-----------|----------------|---------------------|-----------------------|----------|
| **§3 IT** (Cor. 3.3, θ=1/2) | Truth table of f_{DB} only; finite differences for derivatives | 1.5·√(log n)·n bits | 12·n^{0.82} | 12·n^{0.82} | Quasilinear storage |
| **§3 IT** (Cor. 3.4, θ=1/5) | Same scheme, different θ | n^{1.39 + o(1)} | n^{0.65 + o(1)} | n^{0.65 + o(1)} | Faster queries, larger storage |
| **§3.3 LHE compression** (Cor. 3.10) | Same IT scheme + linearly homomorphic encryption over 𝔽₂ | n^{1+o(1)} | n^{0.82} · poly(λ) | **n^{0.31} · poly(λ)** | Reducing communication, computational privacy only |
| **§3.3 FHE compression** (Thm 3.9) | Same IT scheme + fully homomorphic encryption over 𝔽₂ | n^{1+o(1)} | n^{0.82} · poly(λ) | **poly(λ) · log n** | Polylog comm., computational privacy only |
| **§5.2 Many-server, storage-optimised** (Thm 5.3) | s ≥ 2 servers, individual degree d > 1, finite differences | n^{α+o(1)}, α = log q / Cnt-Exp_≤(θ,d) | n^{β+o(1)} | n^{β+o(1)} | Quasilinear storage with s ≥ 3 servers |
| **§5.3 Many-server, time-optimised** (Thm 5.4) | s ≥ 2, store truth tables of all Hasse derivatives | larger α | smaller β | smaller β | Faster queries with s ≥ 3 servers |

For s ≥ 2 constant, time exponent is α(s) = 0.5 + 1/log s + o(1/log s) — i.e., approaches √n as the (constant) server count grows.&#8201;[^14]

[^14]: §1.1 "Extending to more servers" (p.4): "with s ≥ 2 servers, the time is n^{α(s)} for α(s) = 0.5 + 1/log s + o(1/log s)." Corollary D.11 (referenced from Thm 5.3, p.22) gives the quasilinear-storage point for general s.

### Novel Primitives / Abstractions

#### Compact polynomial-derivative data structure (the building-block contribution)

| Field | Detail |
|-------|--------|
| **Name** | Truth table of f_{DB} as a "data structure" for fast evaluation of f_{DB} **and its Hasse derivatives** at any point |
| **Type** | Data structure for multivariate polynomial evaluation |
| **Interface / Operations** | Build(f, m, d, q) → Table of size qᵐ · ⌈log q⌉; Read(Table, x ∈ 𝔽_q^m, ℓ) → {∂̄_e f(x) : e ∈ S_{≤ℓ,d,m}} via |HW_{min(ℓ,m),d,m}|·⌈log q⌉ RAM accesses |
| **Security definition** | None — public, deterministic |
| **Correctness definition** | Lemma 5.1 (p.22): for any prime q, polynomial f : 𝔽_q[X₁,…,X_m] → 𝔽_q of individual degree d ∈ [q−1], and any x ∈ 𝔽_q^m, the algorithm correctly outputs all Hasse derivatives ∂̄_e f(x) of order Hamming-weight ≤ ℓ from the Hamming-ball evaluations {f(x + r) : r ∈ HW_{min(ℓ,m),d,m}} |
| **Purpose** | Replace the storage of D+1 truth tables (f_{DB} and all its Hasse derivative tables) with a single truth table; recover derivatives on-the-fly via finite differences. This is the central technical novelty.&#8201;[^15] |
| **Built from** | Finite-difference identity over 𝔽_q for polynomials of bounded individual degree (generalisation of Equation (1) for d = 1 to d ≥ 1) |
| **Standalone complexity** | Build: O(2^m · m) for d=1 (Lemma 2.12 item 2); Read: |HW_{min(ℓ,m),d,m}| · m · poly(d, log q) time and |HW_{min(ℓ,m),d,m}| · ⌈log q⌉ RAM accesses (Cor. 5.2) |
| **Relationship to prior primitives** | **Strict improvement** over BIM00 / [GLM⁺25] which store D+1 separate truth tables. Equivalent in functionality but exponentially smaller in storage (a factor of Θ(n^ε)).&#8201;[^15] Connection to [BKW19, BGG⁺24] fast multivariate-multipoint evaluation noted but our setting is finite-difference-based and works in any characteristic (Hasse derivatives don't vanish over 𝔽₂). |
| **Implications** | (a) New IT homomorphic secret sharing **with preprocessing** (Remark 3.6, p.15), generalising [ILM21]; (b) New "batch-smooth locally decodable code" with constant alphabet, constant batches, quasilinear codeword length, polynomially sublinear queries — first such (§3.4, p.18).&#8201;[^16] |

[^15]: §1.2 "Idea 1: Reconstruction via finite differences" (p.6–7) and Lemma 5.1 (p.22): "we can think of the truth table of a multivariate polynomial f as a 'data structure' for fast evaluation of f and of its Hasse derivatives at any evaluation point." Lemma D.8 is referenced for the d>1 generalisation.
[^16]: §3.4 (p.18), Definition 3.12 (Batch-Smooth LDC) and Remark 3.13: "By setting θ = 1/2, we obtain the first batch-smooth LDC with constant alphabet size, constant number of batches b, codeword length quasilinear in n, and polynomially sublinear number of queries (i.e., q = n^{1−Ω(1)})."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **None** for the IT scheme (§3, §5). For the communication-shrunk variant: strongly-compact, multi-hop linearly or fully homomorphic encryption over 𝔽₂ (Theorem 3.9, p.17). |
| **Encryption/encoding scheme(s)** | IT scheme: polynomial encoding only. LHE variant: any compact, multi-hop LHE over 𝔽₂ (Goldwasser–Micali, ElGamal, Paillier/Damgård–Jurik, Regev, DGI⁺19). FHE variant: any leveled FHE over 𝔽₂ (BV11, BGV12, FV12, GSW13, Halevi17). |
| **Field** | 𝔽_q with q ≥ max(d+1, s) prime. For 2-server multilinear (§3): q = 2, d = 1. For multi-server high-individual-degree (§5): q ≥ s prime, d ∈ [q−1]. |
| **Key structure** | None for IT; standard FHE keys (sk, ek) for compressed variants |
| **Correctness condition** | Deterministic for IT (Theorem 3.8). For HE variants: inherits noise budget of the underlying HE scheme; the evaluated reconstruction circuit has degree ≤ ⌊D/2⌋ = Θ(log n) and at most n^{H(θ/2)/H(θ)+o(1)} monomials per server's contribution (Lemma C.2, p.44). |

### Key Data Structures

- **Database polynomial f_{DB} : 𝔽₂ᵐ → 𝔽₂** — homogeneous, multilinear, total degree D, with f_{DB}(E_{D,1,m}(i)) = DB_i for a public encoding E_{D,1,m}. For the main scheme, m = ⌈log n / H(θ) · (1+o(1))⌉ and D = θ·m ± O(1).&#8201;[^17]
- **Server table** Table : 𝔽₂ᵐ → 𝔽₂ — the truth table of f_{DB} on the Boolean cube; size 2ᵐ bits = n^{1/H(θ)+o(1)} bits. **Identical on both servers.**
- **Encoding E_{D,1,m}(i) ∈ {0,1}ᵐ ⊂ 𝔽₂ᵐ** — the i-th element of S_{D,1,m} = {x ∈ {0,1}ᵐ : Σx_j = D} in lexicographic order. Has Hamming weight exactly D.
- **Reconstruction set 𝒯_{D,m,p}** — a collection of sparse vectors of Hamming weight ≤ ⌊D/2⌋ supported on supp(p) (or supp(p)\{i_p} for D even); Definition 3.5, p.14. |𝒯_{D,m,p}| = Count_≤(⌊D/2⌋, 1, m) = n^{H(θ/2)/H(θ)+o(1)}.

[^17]: Equation (2) (p.15): m = log n / H(θ) · (1 + o(1)). §3.2 (p.15) and Lemma 2.12 item 4 give Count(D,1,m) = 2^{m·(H(θ)+o(1))} ≥ n.

### Database Encoding

- **Representation:** m-variate, homogeneous, multilinear polynomial over 𝔽₂; truth table on the Boolean cube as the "data structure" (§B, Theorem B.3, p.42).
- **Record addressing:** index i ∈ [n] maps to E_{D,1,m}(i) ∈ S_{D,1,m} ⊂ {0,1}ᵐ — i.e., the i-th binary vector of Hamming weight exactly D in lexicographic order.
- **Preprocessing required:** (1) Interpolate f_{DB} from DB via Lemma 2.12 item 1: f_{DB}(x) = Σᵢ DBᵢ · ∏_{j ∈ supp(E_{D,1,m}(i))} x_j; runtime poly(D, m) per index. (2) Evaluate f_{DB} on all of 𝔽₂ᵐ in time O(2ᵐ · m).
- **Record size:** the basic scheme stores 1 bit per record; for ℓ-byte records, the table is replicated ℓ times (or equivalently extended to 𝔽_{2^{8ℓ}}-valued f_{DB}).

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Preprocess | Server (each, identical) | Interpolate f_{DB}, build 2ᵐ-bit truth table on 𝔽₂ᵐ | — | Once at setup; re-run on DB updates per [BS80,OS97,LMW23] decomposable transformation (Remark 2.9, p.11) |
| Query | Client | Sample r ←$ 𝔽₂ᵐ, compute p = E_{D,1,m}(i); output (qu₁=r, qu₂=r+p) | m·log q = Θ(log n) bits ↑ to **each** server | Per query |
| Answer | Server j (each) | For each e ∈ S_{≤⌊D/2⌋,1,m}, look up f_{DB}(qu_j + e) in Table | n^{H(θ/2)/H(θ)+o(1)} bits ↓ per server | Per query |
| Reconstruct | Client | Compute b = Σ_{t∈𝒯_{D,m,p}} (f(qu₁+t) + f(qu₂+t)) | — | Per query |

### Two-Server Protocol Details

| Aspect | Server 1 | Server 2 |
|--------|----------|----------|
| **Data held** | Identical truth table of f_{DB} on 𝔽₂ᵐ (size 2ᵐ bits) | Identical truth table of f_{DB} on 𝔽₂ᵐ (size 2ᵐ bits) |
| **Query received** | qu₁ = r ∈ 𝔽₂ᵐ (uniform, independent of i) | qu₂ = r + p ∈ 𝔽₂ᵐ (uniform, independent of i) |
| **Computation** | Read Table at all qu₁ + e with e ∈ S_{≤⌊D/2⌋,1,m}; return raw bits | Read Table at all qu₂ + e with e ∈ S_{≤⌊D/2⌋,1,m}; return raw bits |
| **Memory accesses** | Count_≤(⌊D/2⌋, 1, m) = n^{H(θ/2)/H(θ)+o(1)} | Same as Server 1 |
| **Security guarantee** | Information-theoretic: qu₁ uniform in 𝔽₂ᵐ regardless of i | Information-theoretic: qu₂ uniform in 𝔽₂ᵐ regardless of i |
| **Non-collusion assumption** | Required — joint adversary corrupting both servers can recover supp(p) = supp(qu₁ ⊕ qu₂) and hence i. |

### Correctness Analysis (Option C: Deterministic)

Deterministic correctness — Theorem 3.8 (p.15): for any homogeneous, multilinear f : 𝔽₂ᵐ → 𝔽₂ of total degree D, any p ∈ S_{D,1,m}, any r ∈ 𝔽₂ᵐ,

f(p) = Σ_{t ∈ 𝒯_{D,m,p}} (f(r + t) + f(r + p + t)).

Proof technique: by linearity reduce to monomials f(x) = ∏_{i ∈ U} x_i for U ⊆ [m] of size D; then f(p) = 1 ⇔ U = supp(p); the inner sum reduces to Σ_{W ⊆ T_p} 1_{U ⊆ (T_r ∩ U) ⊕ (W ∩ U)}, which is 1 iff T_p ⊆ U (i.e., U = supp(p)) and 0 otherwise. Casework via Proposition 3.7's invariant that 𝒯_{D,m,p} contains exactly one of T and supp(p)\T for every T ⊆ supp(p).&#8201;[^18]

[^18]: Theorem 3.8 + Proposition 3.7 + Equations (3)–(4) (p.15–16). The proof is **fully combinatorial over 𝔽₂** and makes no reference to derivatives or Hermite interpolation, despite being equivalent to those constructions (Figure 2, p.6).

### Complexity

#### Core metrics (information-theoretic 2-server scheme, Theorem 3.2)

| Metric | Asymptotic | Concrete (Cor. 3.3, θ = 1/2, n > 10⁶) | Phase |
|--------|-----------|----------------------------------------|-------|
| Server storage (each) | n^{1/H(θ)+o(1)} = 2ᵐ bits | ≤ **1.5·√(log n)·n** bits | Persistent |
| Server preprocessing time (each) | n^{1/H(θ)+o(1)} = O(2ᵐ · m) | ≤ 1.5·√(log n)·n · log n | Once / on update |
| Server memory accesses per query (each) | n^{H(θ/2)/H(θ)+o(1)} | ≤ **12·n^{0.82}** | Online |
| Server time per query (each) | n^{H(θ/2)/H(θ)+o(1)} | ≤ 12·n^{0.82} word-ops | Online |
| Upload (per server) | m · log q = Θ(log n) bits | tens of bits | Online |
| Download (per server) | n^{H(θ/2)/H(θ)+o(1)} bits | ≤ 12·n^{0.82} bits | Online |
| Communication total | 2 × upload + 2 × download = n^{H(θ/2)/H(θ)+o(1)} | ≈ **12·n^{0.82}** bits | — |
| Client time per query | poly(log n) + n^{H(θ/2)/H(θ)+o(1)} (reconstruction) | n^{0.82+o(1)} | Online |

For θ = 1/5 (Corollary 3.4): storage = n^{1.39+o(1)}, server time / comm = n^{0.65+o(1)}.

#### LHE-compressed variant (Corollary 3.10)

| Metric | Asymptotic | Notes |
|--------|-----------|-------|
| Server storage | n^{1+o(1)} | Same as IT |
| Server time per query | n^{0.82} · poly(λ) | Adds FHE.Eval over reconstruction polynomial of degree ⌊D/2⌋ and ≤ n^{H(θ/2)/H(θ)+o(1)} monomials |
| Communication per query | **n^{0.31} · poly(λ)** | Specific to θ = 1/2; for general θ ∈ (0, 1/2], comm = n^{θ·H(θ/2) / (H(θ)·(H(θ)+H(θ/2))) + ε} · poly(λ) |
| Client time per query | n^{0.31} · poly(λ) | Encrypts m bits + decrypts succinct response (uses [KO97]/[BIM04 Thm 4.7] succinct single-server PIR) |

#### FHE-compressed variant (Theorem 3.9)

| Metric | Asymptotic |
|--------|-----------|
| Server storage | n^{1+o(1)} |
| Server time per query | n^{0.82} · poly(λ) |
| Communication per query | **poly(λ) · log n** |
| Client time per query | poly(λ) · log n |

#### Many-server (Theorem 5.3, finite-differences variant)

For s ≥ 2 servers, t ∈ [s−1] collusion threshold, prime q ≥ s, constant d ∈ [q−1], real θ ∈ (0, d) with θt/s < d/(d+1):
- Storage = n^{α+o(1)}, α = log q / Cnt-Exp_≤(θ, d)
- Server time / comm per query = n^{β+o(1)}, β = (s · H(θt/s) + θt log d) / (s · Cnt-Exp_≤(θ, d))

For θ → d/2, t = s−1, q = s, this gives quasilinear storage with server time → √n as s grows.&#8201;[^19]

[^19]: Theorem 5.3 (p.22) + Corollary D.11 (referenced p.22): "With s ≥ 2 servers and collusion threshold t ∈ [s−1], for any database size n ∈ ℕ, prime q ≥ s, constant d ∈ [q−1], and real θ ∈ (0,d) such that θt/s < d/(d+1), there is an s-server, information-theoretically t-private PIR-with-preprocessing scheme with server storage and preprocessing time n^{α+o(1)} and communication, server time, and client time per query n^{β+o(1)}."

### Lower Bounds

| Field | Detail |
|-------|--------|
| **Bound type** | Communication × server-extra-storage tradeoff |
| **Bound statement** | BIM00 lower bound: in any PIR-with-preprocessing scheme with a constant number of servers, if the servers store b ≥ 1 extra bits of information beyond the database (i.e., total storage = n + b), they must answer PIR queries in Ω(n/b) time. Strengthened by Persiano–Yeo to single-server with b = Ω(log n) extra bits → Ω(n log n / b) time.&#8201;[^20] |
| **Variables** | b = extra bits beyond raw DB |
| **Model assumptions** | Servers store DB + b extra bits; non-adaptive queries |
| **Proof technique** | (BIM00, PY22) |
| **Tightness** | Far from tight. Authors note explicitly: "Our new upper bounds are far from these lower bounds, leaving open the question of constructing — or ruling out — better information-theoretic PIR with preprocessing."&#8201;[^21] Open problems posed in §7 (p.26): (1) Can IT PIR-with-preprocessing achieve constant-server, n^{1+o(1)} storage **and** server time n^{1/2−Ω(1)}? (2) Can constant-server, poly(n) storage and server time n^{1−Ω(1)} achieve communication n^{o(1)}? |
| **Implications for this work** | The upper bound n^{1+o(1)} storage + n^{0.82} time is the new state of the art; closing the gap to BIM00's lower bound (which permits n^{1+o(1)} storage with n^{o(1)} time) remains open. |

[^20]: §1.3 "Lower bounds" (p.9): "Beimel, Ishai, and Malkin [BIM00] prove that, in any PIR-with-preprocessing scheme with a constant number of servers, if the servers store b ≥ 1 extra bits of information beyond the database, they must answer PIR queries in Ω(n/b) time. Persiano and Yeo strengthen this bound to show that, in the single-server setting with b = Ω(log n) extra bits, the server must run in Ω(n log n / b) time [PY22]."
[^21]: §1.3 (p.9) + §7 (p.26).

### Connection to Locally Decodable Codes (§3.4)

The construction yields the **first batch-smooth LDC** with all of:
- constant alphabet size (Σ = {0,1}),
- constant number of batches b,
- codeword length **quasilinear** in n (ℓ(n) = n^{1+o(1)}),
- **polynomially sublinear** number of queries (q = n^{1−Ω(1)}).

A b-batch-smooth LDC (Definition 3.12, p.18) requires that for every i ∈ [n] and j ∈ [b], the joint distribution of the j-th batch of q/b queries is identical regardless of i. For BIM00's protocol, prior work could give a 2-batch-smooth LDC but only with codeword length n^{(1+H(θ/2))/H(θ)+o(1)} (Remark 3.13). This work strictly improves to n^{1/H(θ)+o(1)} = n^{1+o(1)} at θ = 1/2.&#8201;[^16]

### Performance Benchmarks (preliminary implementation, §6)

Implementation: 900 lines of Go + 100 lines of C, code at github.com/ahenzinger/finite-diffs-pir. Hardware: AWS r7a.metal-48xl (192 cores, 1.5 TB RAM); networking measured between us-east-1 and us-east-2 AWS availability zones. All experiments shape parameters so the **encoded data structure is exactly 1 TB**; database sizes vary from 0.25 GB to 139 GB across record sizes ℓ ∈ {1, 32, 64} bytes. Throughput is queries/second, multi-threaded to saturate the machine.&#8201;[^22]

#### Storage comparison vs prior work (Table 1, p.24)

For a 1-TB target encoded size, prior IT 2-server PIR-with-preprocessing schemes (BIM00, GLM⁺25 — they coincide in the 2-server setting) would need **4 to 6 orders of magnitude more storage** to support the same database sizes with the same upload/download/server-time:

| n (GB) | This work storage | BIM00/GLM⁺25 storage (1-byte records) |
|--------|-------------------|---------------------------------------|
| 122    | 1 TB              | 1.6 × 10⁵ TB                          |
| 82     | 1 TB              | 1.4 × 10⁶ TB                          |
| 37     | 1 TB              | 4.9 × 10⁶ TB                          |
| 11     | 1 TB              | 4.5 × 10⁶ TB (4,500,000× smaller)     |
| 2      | 1 TB              | 7.6 × 10⁵ TB                          |

The headline 4,500,000× savings (Abstract, p.1) is the 11 GB / 1-byte-record row.&#8201;[^23]

#### Throughput vs linear-time XOR PIR (Table 2, p.24, with networking)

| n (GB) | Records | This work tput (q/s) | XOR PIR tput (q/s) | Storage blowup | Comm. blowup | Mem-accesses saved | Throughput gain |
|--------|---------|----------------------|--------------------|--------------|--------------|--------------------|-----------------|
| 122    | 1B      | 6                    | 6                  | 8×            | 914×         | 351×               | 1.0×            |
| 82     | 1B      | 18                   | 10                 | 12×           | 298×         | 879×               | 1.8×            |
| 37     | 1B      | 121                  | 22                 | 28×           | 101×         | 1,707×             | 5.5×            |
| **11** | **1B**  | **636**              | **71**             | **93×**       | **37×**      | **2,560×**         | **9.0×**        |
| 2      | 1B      | 3,804                | 374                | 512×          | 14×          | 2,926×             | 10.2×           |
| 0.25   | 1B      | 24,252               | 3,673              | 4,022×        | 6×           | 2,560×             | 6.6×            |
| 12     | 32B     | 234                  | 66                 | 85×           | 98×          | 1,050×             | 3.5×            |
| 17     | 64B     | 134                  | 47                 | 60×           | 135×         | 862×               | 2.9×            |

Highlighted row (11 GB / 1B records): **9× higher server throughput than the fastest two-server, linear-time PIR (XOR PIR)**, at the cost of 93× storage and 37× communication blowup.&#8201;[^24]

[^22]: §6 (p.23): "We implement our information-theoretic, two-server PIR scheme from Fig. 3 in 900 lines of Go and 100 lines of C. We run experiments on a r7a.metal-48xl instance on AWS with 192 cores and 1,536 GB of RAM."
[^23]: Abstract (p.1) and §1.1 "Concrete efficiency" (p.4): "On an 11 GB database with 1-byte records, our two-server PIR encodes the database into a 1 TB data structure—which is 4,500,000× smaller than that of prior two-server PIR-with-preprocessing schemes."
[^24]: §6 + Table 2 (p.24, 25): "by blowing up the storage by 93×, our PIR scheme provides a 2,560× decrease in the number of memory accesses per query. Since these memory accesses are RAM accesses to a large array (as opposed to a linear scan) and since the communication is sufficiently larger than in XOR PIR, this translates to 9× higher server throughput than XOR PIR (including networking)."

### Implementation Notes

- **Language / Library:** Go (900 LOC) + C (100 LOC, performance-critical kernels)
- **Polynomial arithmetic:** Truth-table evaluation only (no NTT, no FFT) — the truth table is the data structure
- **Parallelism:** Multi-threaded to saturate the AWS r7a.metal-48xl (192 cores)
- **Networking:** Tested between AWS us-east-1 and us-east-2; cross-region cost included in throughput numbers
- **Open source:** github.com/ahenzinger/finite-diffs-pir
- **Optimisations:** detailed in Appendix E (p.57+)

### Key Tradeoffs & Limitations

- **Communication is the main practical limitation.** Per-query download is Θ(n^ε) for ε ∈ (1/2, 1), concretely megabytes to gigabytes (Table 2). XOR PIR has 4√n bits — one to three orders of magnitude smaller. The HE-compressed variants (§3.3) shrink communication asymptotically but were not implemented; doing so is left to future work.
- **Throughput crossover with XOR PIR is record-size-dependent.** For 64-byte records, this scheme only beats XOR PIR at moderate-large n; for 1-byte records the gain is largest at small-to-medium n (where memory-access-savings dominate over communication blowup).
- **Storage blowup vs raw DB** is 7× to 4,022× in the implemented configurations.
- **Information-theoretic — no computational hardness needed for the IT scheme.** The non-collusion assumption replaces all crypto.
- **Constant servers, but not single-server.** No single-server analogue is known with these parameters; the constant-server constraint distinguishes this from [LLF⁺25] which needs ω(1) servers.

### Comparison with Prior Work

| Metric | This work (θ=1/2) | BIM00 / GLM⁺25 (matched comm.) | LLF⁺25 (3+ servers, DORAM) | LMW23 (single-server, RLWE) |
|--------|-------------------|-------------------------------|---------------------------|-----------------------------|
| Server count | 2 (constant) | 2 (constant) | ω(1) (grows with n) | 1 |
| Server storage | **n^{1+o(1)}** | n^{1/H(θ)+o(1)} = n^{1.39…} for matching comm | n^{1+o(1)} | n^{1+o(1)} |
| Server time per query | n^{0.82+o(1)} | n^{H(θ/2)/H(θ)+o(1)} = n^{0.82} | polylog(n) | n^{o(1)} |
| Communication per query | n^{0.82} (IT), n^{0.31}·poly(λ) (LHE), polylog (FHE) | same (matched) | polylog | polylog |
| Server-server interaction | None | None | Ω(log n) rounds | N/A |
| Privacy | IT | IT | IT (for client–server) | Computational (RLWE) |
| Concrete viability | preliminary impl, 9× faster than linear-time | hypothetical (≥ 5 orders worse storage) | not implemented | "tens of orders of magnitude slower than linear-time PIR" per [OPPW24] |

**Key takeaway:** First constant-server, IT, PIR-with-preprocessing scheme to break the BIM00 storage–time barrier — quasilinear storage **and** polynomially sublinear server time simultaneously. Concretely runs **9× faster than the fastest linear-time 2-server PIR (XOR PIR)** on an 11 GB database, at the cost of 93× storage and 37× communication blowup.

### Open Problems (§7, p.26)

1. **Storage exponent → 1 with time exponent < 1/2:** does an IT PIR-with-preprocessing exist with constant servers, storage n^{1+o(1)}, **and** server time n^{1/2−Ω(1)}? Current Cor. D.11 only achieves n^{1/2+ε} server time for quasilinear storage.
2. **Sublinear time + sublinear communication, IT:** does constant-server IT PIR-with-preprocessing with poly(n) storage, server time n^{1−Ω(1)}, **and** communication n^{o(1)} exist? The HE upgrades give this only computationally; matching-vector codes give subpoly comm. but not double efficiency.
3. **Doubly-efficient IT:** harder still — does constant-server IT PIR-with-preprocessing with poly(n) storage and server time n^{o(1)} exist?
4. **Better data structures for fast multipoint polynomial+derivative evaluation** — interpolating between the §5.2 scheme (truth table only, derivatives via finite differences) and §5.3 (precomputed truth tables of all derivatives). Hybrid schemes that precompute *some* derivatives might dominate both extremes.

### Uncertainties

- Cnt-Exp_≤(θ, d) is defined precisely in Appendix A (Theorem A.2, p.40, derived as a piecewise function involving the Bernstein-style entropy of degree-d distributions); the body of the paper uses it as a black box.
- The constant 12 in "12 · n^{0.82}" (Cor. 3.3) is derived in Appendix C.1 from the chain of inequalities (6)–(9); the rounding bookkeeping is delicate and would need to be re-verified for any non-trivial change to the threshold n > 10⁶.
- Exact leading constants for s ≥ 3 (Cor. D.11) are not stated in the body — only asymptotic forms.
