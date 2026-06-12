## TreePIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [TreePIR: Sublinear-Time and Polylog-Bandwidth Private Information Retrieval from DDH](https://eprint.iacr.org/2023/204) (CRYPTO 2023) |
| **Authors** | Arthur Lazzaretti, Charalampos Papamanthou (Yale University) |
| **Archetype** | Construction + Building-block (introduces *weak privately puncturable PRFs* — wpPRFs — as a new primitive) |
| **PIR Category** | 2-server, role-asymmetric (offline/online split) — exploratory `multiserver/asymmetric.role/`. Conceptually closest to **Group 2b — Client-specific hint (interactive)** in the single-server taxonomy, but inherently 2-server. The online phase optionally recurses on a single-server √N PIR sub-protocol (e.g., Spiral, Döttling et al.) to drive bandwidth from √N down to polylog.&#8201;[^1] |
| **Security model** | 2-server, semi-honest, non-colluding. Privacy holds against an adversary corrupting *either* server (and any number of clients), but not both jointly.&#8201;[^2] |
| **Additional assumptions** | OWFs (the wpPRF and the offline phase need only PRGs/PRFs from OWFs).&#8201;[^3] **DDH** (and only DDH) is required *only* when the optional online recursion is instantiated with the Döttling–Garg–Ishai–Malavolta–Mour–Ostrovsky CRYPTO'19 single-server PIR to drop online bandwidth from √N to polylog.&#8201;[^4] For practical deployments the authors recurse with **SPIRAL** (RLWE) instead, trading the cleaner DDH-only assumption for concrete efficiency. |
| **Correctness model** | **Probabilistic** — for every query, with probability ≥ 1 − ν(λ) the client locates a covering set in the hint table. Failure is per-query (not Q-degrading); the union-bound argument re-runs on every query because online queries refresh the table.&#8201;[^5] |
| **Rounds (online)** | 1 (client → both servers in parallel, both reply). |
| **Record-size regime** | Parameterized — N w-bit elements; benchmarks at w ∈ {1 b, 32 B, 256 B}. Plain TreePIR (no recursion) wins for very small w (≤ a few bytes); TreePIR + SPIRAL wins for medium and large w.&#8201;[^6] |

[^1]: Abstract (p.1): "We propose TreePIR, a two-server PIR protocol with sublinear amortized server time and polylogarithmic bandwidth whose security can be based on just the DDH assumption. TreePIR can be partitioned in two phases that are both sublinear: The first phase is remarkably simple and only requires pseudorandom generators. The second phase is a single-server PIR protocol on only √N indices, for which we can use the protocol by Döttling et al. (CRYPTO 2019) based on DDH, or, for practical purposes, the most concretely efficient single-server PIR protocol."
[^2]: §2.1, Definition 2.2 "PIR privacy" (p.6): "any algorithm serv₁, no PPT adversary A can distinguish the following experiments … queries made to server₁ will appear random to server₁, assuming servers do not collude (as is the case in our model). Privacy for server₀ is defined symmetrically."
[^3]: §1.2 (p.3): "we are able to construct a weaker version of puncturable PRFs (that fits our application) relying solely on the existence of one-way functions." §3 (p.9): the wpPRF "is built using techniques from the GGM construction" — i.e. only a length-doubling PRG (hence OWFs).
[^4]: §4.3 Lemma 4.1 (p.21): "Assuming the Decisional Diffie-Hellman problem is hard, Theorem 4.1 implies a two-server PIR with the same complexities except with polylogarithmic online bandwidth." Proof: replace the √N parities download with the Döttling et al. CRYPTO'19 single-server PIR over √N elements.
[^5]: §4.2 Theorem 4.1 (p.17) and proof eq. (1)–(3) (p.20): the probability that no preprocessed set covers the queried index is (1 − 1/√N)^{λ√N} ≤ (1/e)^λ ≤ ν(λ). The argument is re-run for every query by induction (p.20, end of correctness proof).
[^6]: §5.1, "TreePIR with No Recursion" (p.22) — wins at 2³³ × 1-bit (Fig. 7); §5.2, Fig. 8 and Fig. 9 (p.24) — TreePIR + SPIRAL wins at 2²² × 256 B and 2²⁸ × 32 B.

### Asymmetry Profile

| Aspect | Server 0 (offline) | Server 1 (online) |
|--------|-------------------|-------------------|
| **Role** | Hint generator (one-time per client session) | Query responder (per-query) |
| **Data held** | Full DB | Full DB |
| **Per-session work** | O(λ N log N) — for each of M = λ√N wpPRF keys, evaluate F.Eval(k_i, ·) at √N points and XOR the corresponding DB entries. Sends M parities (each w bits) to client.&#8201;[^7] | None offline |
| **Per-query work** | Optional refresh path (Section A.1 / standard waterfall update); base scheme involves only Server 1 in the online phase | O(√N log N) — given a single punctured wpPRF key, evaluate it across the *entire* domain of √N "puncture guesses" and return the √N parities (one per guess), via the *efficient full evaluation* property.&#8201;[^8] |
| **Receives from client** | Optional fresh punctured key (for refresh) | q₁ = punctured wpPRF key (size λ log N) |
| **Single-pass property** | No — Server 0 does λ passes (one per pseudorandom set). This is *not* asymptotically optimal in the BIM lower-bound sense (which SinglePass later achieves). | N/A |
| **Online communication asymmetry** | N/A | **Upload:** O(λ log N); **Download:** O(√N) words (or O(polylog N) when recursing with single-server PIR). |
| **Asymmetry ratio (vs Checklist)** | Offline server: comparable O(λ N) work; **online server time 3× faster** than Checklist; **persistent client storage 8000× smaller** at N = 2³² × 1 b (1 MB vs 8 GB).&#8201;[^9] | Online bandwidth higher than Checklist when no recursion (16.6 KB vs 0.51 KB), but with recursion drops to ≈ 50 KB independent of N. |

[^7]: §4.2, Figure 6 "Preprocessing" (p.18): "client sets k_i ← F.Gen(1^λ), i = 1, …, M − 1, and sends k₀, …, k_{M−1} to server₀. For all i = 0, …, M − 1 server₀ computes parities p_i = ⊕_{j ∈ S_i} DB[j], where S_i = {v || F.Eval(k_i, v) : v ∈ [√N]}." With M = λ√N keys (Fig. 6 caption "Let M = λ√N") and |S_i| = √N each, total work is M·√N = λN PRG evaluations + λN XORs.
[^8]: §4.2, Figure 6 "Answer" (p.18): "Compute an array of parities P_b = [φ₀, …, φ_{√N}], where φ_i = ⊕_{j ∈ S_i} DB[j], S_i = {v || F.PEval(k_punc, i, v) : v ∈ [√N]}." Theorem 4.1 (p.17) bullet 2: "O(√N log N) online server time." This sublinearity hinges on the wpPRF's *efficient full evaluation* (Definition 3.4, p.12), which gives all √N "potential puncture" sets in O(N log N) time globally — but only O(√N log N) per online query because the client already knows which puncture position to use.
[^9]: §1.2 Abstract claim (p.4–5): "Our implementation of TreePIR shows an amortized query time of over three times faster than Checklist over different tests, using up to 8,000× less client storage." Quantified in Fig. 7 (p.23): Checklist 12574 ms / 8.6 GB / 0.51 KB vs TreePIR 3508 ms / 1.05 MB / 16.6 KB at N = 2³² × 1 bit.

### Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 |
| **Replication** | Both servers store identical copy of DB; no per-client server state.&#8201;[^10] |
| **Trust model** | Non-colluding, semi-honest. Either may be corrupted but not both jointly.&#8201;[^2] |
| **Communication topology** | Star — client talks to each server independently; no server-server channel. |
| **Server symmetry of role** | **Asymmetric (role split)**: Server 0 runs `Preprocessing(client, server₀)` once per client session and assists with refresh; Server 1 runs `Answer(server₁, q₁)` per online query. Both servers run the *same* `Answer` algorithm syntactically, but the construction makes Server 0 also responsible for hint creation in the offline phase.&#8201;[^11] |
| **Online round structure** | Client sends q₀ → Server 0 (refresh / replacement) and q₁ → Server 1 (the punctured wpPRF key) in parallel; receives P₀, P₁; reconstructs DB[x]. |
| **Realizability of non-collusion** | Standard 2-server PIR justification (different organizations / jurisdictions). The paper inherits the same threat-model justification used by Chor–Kushilevitz–Goldreich–Sudan for k-server PIR.&#8201;[^12] |

[^10]: §4.2 Theorem 4.1 (p.17): "No additional server space and O(√N) client space."
[^11]: §4.2, Figure 6 "Our TreePIR construction" (p.18): the offline `Preprocessing` block has actor `(client, server₀)`; the online `Query`, `Answer`, `Reconstruct` blocks involve both `server_b` for `b ∈ {0,1}` symmetrically.
[^12]: §1.3 (p.5): "The first PIR protocol to achieve non-trivial communication was introduced, along with the problem of PIR itself, by Chor et al. [14]. This scheme relies on a two-server assumption, where the database is replicated in two non-colluding servers. This has proven to be a reasonable assumption in practice [25, 30, 33]."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | **GGM PRF** (Goldreich–Goldwasser–Micali, FOCS 1984) — the entire wpPRF is a careful re-engineering of GGM puncturing.&#8201;[^13] **Corrigan-Gibbs–Kogan (CK20, EUROCRYPT 2020)** — first 2-server preprocessing PIR with sublinear amortized online time and O(√N log N) bandwidth; defined the "client-preprocessing" model that TreePIR refines.&#8201;[^14] **Kogan–Corrigan-Gibbs Checklist (USENIX Security '21)** — practical 2-server PIR using puncturable PRFs to compress sets, but with O(N) expected online membership-test time due to non-invertibility of standard PRFs.&#8201;[^15] **Shi–Aviv–Kogan–Hasenplaugh–Pass–Wootters (CRYPTO 2021)** — first to achieve polylog bandwidth + sublinear server time + sublinear client storage simultaneously, but only via *privately puncturable PRFs* (LWE with super-polynomial modulus → 100s of MB / query in practice).&#8201;[^16] **Döttling–Garg–Ishai–Malavolta–Mour–Ostrovsky (CRYPTO 2019)** — single-server polylog-bandwidth PIR from DDH (Trapdoor Hash Functions); used as the recursion base when staying purely in DDH.&#8201;[^4] **SPIRAL** (Menon–Wu, S&P 2022) — RLWE single-server PIR; used as the *practical* recursion base.&#8201;[^17] |
| **What changed** | Shi et al. solved the asymptotic problem (polylog BW + sublinear time + sublinear storage) but with privately puncturable PRFs that need LWE+super-poly modulus, costing hundreds of MB per query. TreePIR replaces that primitive with a strictly weaker one — **wpPRF** — buildable from GGM/OWF, then shows the relaxed correctness still suffices because the client already knows the puncture point. Checklist's O(N) membership test (PRF non-invertibility) is replaced by a single wpPRF evaluation. The result: **same asymptotics as Shi et al., but on OWF + DDH**, and 8000× less client storage than Checklist with 3× faster query.&#8201;[^16]&#8201;[^9] |
| **Superseded by** | **SinglePass** (Lazzaretti–Papamanthou, USENIX Security '24) by the same authors — drops the λ factor in preprocessing (single-pass over DB), trades polylog online BW for O(√N · w) but with deterministic correctness and constant-time updates; same 2-server role-asymmetric model. **TAPIR** (Falzon–Hetz–O'Toole, 2025) extends SinglePass to malicious security with VC-based authentication. |
| **Concurrent work** | None directly comparable in the same year; the closest contemporary is **Piano** (Zhou–Tan–Kogan–Shi–Smith, 2023, single-server sublinear from PRFs) which trades the 2-server assumption for single-server but lacks polylog bandwidth. |

[^13]: §1.2 (p.3): "Our construction is simple and reuses ideas from the celebrated GGM PRF construction [23] in a novel way." §2.3 (p.7): full recap of GGM as a tree of length-doubling PRGs.
[^14]: §1 (p.2) and reference [15]: Corrigan-Gibbs–Kogan EUROCRYPT 2020 introduced the model with offline/online split, sublinear online time, and √N bandwidth via random pseudorandom *sets*; their PRP-PIR uses small-domain PRPs.
[^15]: §1.1 (p.2): "Kogan and Corrigan-Gibbs [33] propose representing their sets with keys derived from puncturable PRFs … Unfortunately, this approach does not directly support fast membership testing (which is crucial in order to find the preprocessed set that contains i during the online phase), due to the non-invertibility of PRFs. Therefore finding a set containing i during the online phase requires O(N) expected time. (In their work, they propose a faster membership test by using a linear-space data structure.)"
[^16]: §1.1, "Client-preprocessing PIR via privately puncturable PRFs" (p.3): "In CRYPTO 2021, Shi et al. [43] addressed the above shortcomings by proposing punctured pseudorandom sets … Their construction is based on privately puncturable PRFs, whose only instantiation is based on LWE [7,13]. As such, although the Shi et al. scheme has excellent asymptotic complexities, it does not seem to have concrete efficiency. Our back-of-the-envelope calculations show communication overhead of hundreds of megabytes, which make it unusable in practice for now." Quantified: §5 (p.22): "an online per query communication cost of over 400 megabytes, given a security parameter of size 128 bits, for any database size."
[^17]: §4.3 (p.21): "On Section 5 we benchmark the performance of our TreePIR paired with SPIRAL [39]. Note that we cannot recurse with a PIR scheme that uses preprocessing based on the database elements (and this includes our TreePIR), since the √N words from the last step of the Answer phase are dynamically generated and entirely dependent on the index we decide to query."

### Core Idea

TreePIR partitions [N] into √N "boxes" of √N indices each and represents a pseudorandom set S as `S = { i || F.Eval(k, i) : i ∈ [√N] }` where F is a wpPRF over domain and range √N — i.e. exactly one element per box, indexed by the wpPRF output.&#8201;[^18] The client offline samples M = λ√N independent wpPRF keys k₀, …, k_{M−1}, sends them to Server 0, and stores the M parities p_i = ⊕_{j ∈ S_i} DB[j]. To query x = x^ℓ ‖ x^r (i.e. box x^ℓ, position x^r), the client (i) samples a fresh key k′ until F.Eval(k′, x^ℓ) = x^r (probabilistic O(√N) trial loop, deamortizable to deterministic via "shifts"), (ii) finds a stored T_j with F.Eval(k_j, x^ℓ) = x^r, (iii) sends the **punctured** keys q₀ ← F.Puncture(k′, x^ℓ) and q₁ ← F.Puncture(k_j, x^ℓ) to the two servers. Each server uses *efficient full evaluation* (Definition 3.4) to enumerate the √N possible "puncture guesses" for the received key in O(√N log N) time and returns the array of √N parities.&#8201;[^19] The client uses its known puncture position x^ℓ as the index into Server 1's array, XORs that parity with the stored hint p_j, and recovers DB[x] = p_j ⊕ P₁[x^ℓ].&#8201;[^20] The remaining √N parities from Server 0 enable a fresh hint entry for the next round (Checklist-style refresh).

The crux: **the client knows the puncture point x^ℓ, so weak correctness suffices** — the wpPRF only needs to evaluate correctly at *non-punctured* points, and the punctured key only needs to hide x^ℓ. This is a strictly weaker requirement than full privately puncturable PRFs (which must also hide *evaluation* at the punctured point), and TreePIR shows it can be met with a simple GGM-style modification.

[^18]: §4.1 (p.15): "Suppose we have a wpPRF F := (Gen, Eval, Puncture, PEval) whose domain and range is √N. We can then define a set S of √N elements in [N] using F. For exposition, let N be an even power of two. Given a uniform random key k ∈ {0,1}^λ, we define our set S as: S = {i || F.Eval(k, i) : i ∈ [√N]}."
[^19]: §4.2, proof of Theorem 4.1 (p.17): "Step 2 of our Answer algorithm runs in O(√N log N) time by the efficient full evaluation property. In Step 1 of our online query phase, we run F.Gen(·) until we find the mapping from x^ℓ to x^r. As is, this runs in *probabilistic* O(√N) time."
[^20]: §4.2, Figure 6 "Reconstruct" (p.18): "DB[x] ← p_j ⊕ P₁[x^ℓ]; T_j ← (k′, P₀[x^ℓ] ⊕ DB[x])." The second line refreshes the hint table by replacing the just-used (k_j, p_j) entry with (k′, p_j′) where p_j′ is the parity of the new set S_{k′} computed from Server 0's response.

### Variants

Two configurations of the same construction:

| Variant | Recursion base | Online BW | Online server time | Best For |
|---------|---------------|-----------|--------------------|----------|
| **TreePIR (plain)** | None — client downloads all √N parities directly | O(√N · w) — 16.6 KB at N = 2³², w = 1 b | O(√N log N) | Tiny elements (membership testing, blocklists, SCT auditing); 1-bit DBs |
| **TreePIR + SPIRAL (practical)** | SPIRAL on the √N parities | ≈ 50 KB (constant) | O(√N log N) + SPIRAL(√N) ≈ +61 ms | Moderate-to-large records (32 B – 256 B+); large N |
| **TreePIR + Döttling et al. (DDH-pure)** | DGI'19 trapdoor-hash PIR | polylog N | O(√N log N) + DGI√N | Asymptotic claim only — not benchmarked, not practical |

The construction also supports a **D-tradeoff** parameter (§4.4, p.21): set size = N^D for any D ∈ (0,1) gives client storage / online time = O(N^{1−D}) and online bandwidth + server time = O(N^D). The default D = 1/2 minimizes the maximum of the two terms.

### Novel Primitives / Abstractions

#### Weak Privately Puncturable PRF (wpPRF)

| Field | Detail |
|-------|--------|
| **Name** | Weak Privately Puncturable PRF (wpPRF) |
| **Type** | Cryptographic primitive (puncturable pseudorandom function with relaxed correctness) |
| **Interface / Operations** | (Gen, Eval, Puncture, PEval) where:&#8201;[^21]<br>• `Gen(1^λ) → k ∈ {0,1}^λ`<br>• `Eval(k, x) → y ∈ {0,1}^m` for x ∈ {0,1}^n<br>• `Puncture(k, i) → k_i` — punctured key at point i (privately — k_i hides i)<br>• `PEval(k_i, j, x) → y` — takes the punctured key, a *guess* j of the punctured point, and an evaluation point x, returns y |
| **Security definition (pseudorandomness)** | Standard PRF security on `(Gen, Eval)` — Definition 2.4 (p.7).&#8201;[^21] |
| **Security definition (security in puncturing)** | Same as standard pPRF: punctured key reveals nothing about Eval(k, x) at the punctured point — Definition 2.6 (p.8).&#8201;[^21] |
| **Security definition (privacy in puncturing)** | The punctured key hides *which point* was punctured — Definition 3.2 (p.12).&#8201;[^22] |
| **Correctness definition (weak correctness in puncturing)** | For any x ≠ punctured point, `Eval(k, x) = PEval(k_x, x, x')` where the second-arg `x` *is* the punctured point itself (passed as the "guess"). I.e. correct evaluation on every non-punctured point requires the evaluator to know the punctured point — Definition 3.3 (p.12).&#8201;[^23] |
| **Efficient full evaluation** | All N "potential puncture sets" `S_j = { (x, PEval(k_i, j, x)) : x ∈ {0,1}^n, x ≠ j }` for j ∈ {0,1}^n can be enumerated in total `O(N log N)` time — Definition 3.4 (p.12).&#8201;[^24] |
| **Purpose** | Compactly represent pseudorandom subsets of [N] of size √N with private puncture and fast membership testing, from OWF only — replacing privately puncturable PRFs (LWE-based, super-poly modulus) in the Shi et al. PIR construction. |
| **Built from** | Length-doubling PRG → GGM tree → modified puncturing that **drops the punctured point from the punctured key** (shipping only the ordered list of co-path siblings). The puncture point becomes an additional *input* to PEval rather than being recoverable from the key.&#8201;[^25] |
| **Standalone complexity** | Gen: O(λ); Eval: O(λ · n) (n = log N tree depth); Puncture: O(λ · n); PEval: O(λ · n) per point; **full evaluation across all N puncture guesses: O(N log N)** — the key non-trivial efficiency property, achieved by sharing evaluations across guesses (sets differ by 2^h elements at level h, so total enumeration cost is Σ_{h=1}^n (2^n / 2^h) · 2^h = N log N).&#8201;[^26] |
| **Relationship to prior primitives** | **Strictly weaker than privately puncturable PRFs** — full-correctness pPRFs require Eval(k, x) = PEval(k_x, x) (no x' input), which provably requires LWE-with-superpoly-modulus or similar. **Strictly stronger than standard puncturable PRFs (Definition 2.5)** — these reveal the punctured point. wpPRFs sit in between, achievable from OWF, suitable when the application *already knows* the puncture point (which is exactly the PIR setting because the client picks the queried index). **Not equivalent to DPFs** — DPFs evaluate to 0 everywhere except at the special point; wpPRFs are pseudorandom everywhere. |

[^21]: §3, Definition 3.1 "Weak Privately Puncturable PRF" (p.11): full algorithm interface; pseudorandomness via Definition 2.4 (p.7); security in puncturing via Definition 2.6 (p.8) inherited from standard pPRFs.
[^22]: §3, Definition 3.2 "Privacy in puncturing" (p.12): adversary picks (x₀, x₁), receives k_{x_b} for random b, must guess b with advantage > ν(λ).
[^23]: §3, Definition 3.3 "Weak correctness in puncturing" (p.12): "for k ← Gen(1^λ), for any point x ∈ {0,1}^n, k_x ← Puncture(k, x), it holds that ∀ x' ∈ {0,1}^n, x' ≠ x, Eval(k, x') = PEval(k_x, x, x')." Note the punctured point x is passed as the *second* argument to PEval; the application must know x to evaluate correctly.
[^24]: §3, Definition 3.4 "Efficient full evaluation" (p.12): "We say F satisfies efficient full evaluation if all sets {S_j}_{j ∈ {0,1}^n} can be enumerated in O(N log N) time."
[^25]: §3 (p.10) and §3.1 Figure 5 "Our wpPRF construction" (p.13): "Puncture(k, i) → k_i: Output list of seeds *not* in path to i, ordered left to right" — the punctured point itself is **not** in the punctured key. PEval(k_i, j, x): "Let y ← G_x((j, k_i)). We denote with G_x((j, k_i)) the leaf node at position x of the tree reconstructed from (j, k_i)." The puncture-point input `j` is what selects which tree-shape to reconstruct.
[^26]: §3.1, proof of Theorem 3.1 (p.13–14): "Given that we run into a transition of height h with exactly 2^n / 2^h times, we have that going through this loop we will take Σ_{h=1}^n (2^n / 2^h) × 2^h = n 2^n = N log N steps." Sets reuse evaluations across consecutive puncture guesses (S_{j+1} differs from S_j by one removal + one addition).

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **OWF** for the wpPRF (via length-doubling PRG → GGM tree).&#8201;[^3] **DDH** is required only to instantiate the optional online recursion via Döttling et al. CRYPTO'19 single-server PIR while staying inside DDH (Lemma 4.1).&#8201;[^4] In practice the recursion is done with **SPIRAL** (RLWE), so the deployed system uses **OWF + RLWE**.&#8201;[^17] |
| **Encryption / encoding scheme** | None for plain TreePIR — XOR/parity over DB only. With recursion, inherits the recursion base's encryption (RLWE for SPIRAL, lattice trapdoors for DGI). |
| **PRG instantiation** | Any length-doubling PRG `G : {0,1}^λ → {0,1}^{2λ}` (Definition 2.3, p.7). Implementation uses standard primitives via the Checklist/SinglePass framework. |
| **PRF instantiation** | GGM tree over the PRG, with TreePIR-specific puncturing (Figure 5, p.13). Domain = range = [√N] for the PIR application. |
| **Key structure** | Client stores M = λ√N wpPRF keys (each λ bits) plus M parities (each w bits). No CRS, no shared randomness, no per-client server state. |
| **Correctness condition** | Pr[query fails] ≤ (1 − 1/√N)^{λ√N} ≤ (1/e)^λ ≤ ν(λ).&#8201;[^5] |

### Key Data Structures

- **Client hint table** `T = { T_j = (k_j, p_j) : j ∈ [M] }` with `M = λ√N`: each entry is a (wpPRF key, parity) pair. Total client storage = O(λ√N) for keys (λ bits each) + O(λ√N · w) for parities. At N = 2³², w = 1 bit: ~1.05 MB.&#8201;[^9]
- **Pseudorandom set** induced by key k: `S(k) = { v || F.Eval(k, v) : v ∈ [√N] }`. Each S(k) contains exactly one index per box, so |S(k)| = √N and S(k) is "partitioned" across the √N boxes.&#8201;[^18]
- **Database view.** DB ∈ {0,1}^N is implicitly viewed as a √N × √N matrix via x = x^ℓ ‖ x^r where |x^ℓ| = |x^r| = log(√N) = (log N)/2.&#8201;[^27]
- **Server state.** Server 0 and Server 1 each hold DB only — no per-client state.&#8201;[^10]

[^27]: §1.4 Notation (p.5): "For any bitstring x, we define x^ℓ, x^r such that x = x^ℓ ‖ x^r, where |x^ℓ| = |x^r| = |x|/2." This implicit √N × √N partition is the foundation of the box-and-position addressing.

### Database Encoding

- **Representation:** Implicit √N × √N matrix; each "row" is one of √N boxes of √N indices.
- **Record addressing:** x ∈ [N] decomposed as x^ℓ ∈ [√N] (box index) ‖ x^r ∈ [√N] (position within box). The wpPRF mapping `F.Eval(k, x^ℓ) = x^r` selects which position in box x^ℓ is in the set.
- **Preprocessing required:** None beyond the partition view; Server 0 reads each DB element approximately λ times during the offline phase (one read per pseudorandom set the element belongs to).
- **Generalization to arbitrary N:** Appendix A.2 (p.28): replace the bit-concatenation `‖` with arithmetic `v · √N + F.Eval(k, v)`; works for any N that is a perfect square. For non-square N, pad to the next square or use ⌈√N⌉ with overflow handled by 0-strings.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Preprocessing — key gen | Client | Sample M = λ√N wpPRF keys k_i ← F.Gen(1^λ) | M·λ bits ↑ to Server 0 | Once per client session |
| Preprocessing — parity comp | Server 0 | For each i, evaluate F.Eval(k_i, ·) at √N points and XOR DB[j] for j ∈ S_i; return p_0, …, p_{M−1} | M·w bits ↓ | Once per client session |
| Preprocessing — store | Client | Build hint table T = {(k_j, p_j)} | — | Once |
| Query gen | Client | Sample fresh k′ until F.Eval(k′, x^ℓ) = x^r; find T_j with F.Eval(k_j, x^ℓ) = x^r; compute q₀ ← F.Puncture(k′, x^ℓ) and q₁ ← F.Puncture(k_j, x^ℓ) | q₀, q₁ each ≈ λ log N bits ↑ | Per query |
| Answer | Server b ∈ {0,1} | Parse q_b = k_punc; compute P_b = [φ_0, …, φ_{√N−1}] where φ_i = ⊕_{j ∈ S_i^punc(b)} DB[j]; return P_b | √N · w bits ↓ per server (or polylog when recursing with single-server PIR over the √N entries) | Per query, both servers |
| Reconstruct + state refresh | Client | DB[x] ← p_j ⊕ P₁[x^ℓ]; refresh T_j ← (k′, P₀[x^ℓ] ⊕ DB[x]) | — | Per query |

### Two-Server Protocol Details

| Aspect | Server 0 | Server 1 |
|--------|----------|----------|
| **Data held** | Full DB | Full DB |
| **Pre-session role** | Runs `Preprocessing(client, server₀)`: receives M wpPRF keys, computes M parities p₀, …, p_{M−1}, sends to client | None |
| **Per-query input** | q₀ = F.Puncture(k′, x^ℓ) — fresh key punctured at queried box | q₁ = F.Puncture(k_j, x^ℓ) — stored key punctured at queried box |
| **Per-query computation** | `Answer(q₀)`: enumerate all √N "puncture-guess" sets via efficient full evaluation, compute and return P₀ array of √N parities | `Answer(q₁)`: same algorithm, returns P₁ |
| **Output size** | √N · w bits (or polylog with recursion) | √N · w bits (or polylog with recursion) |
| **Security guarantee** | wpPRF privacy in puncturing — the punctured key q₀ is computationally indistinguishable from a key punctured at a uniformly random point.&#8201;[^28] | Same — wpPRF privacy in puncturing implies q₁ leaks no information about x^ℓ. |
| **Non-collusion assumption** | Required — joint S0+S1 view recovers (preprocessing, q₀, q₁) which together leak x via the table-search-and-replace structure. |

[^28]: §4.2, "Privacy with respect to server₁" (p.17–19): full reduction proof. "By security in puncturing (Definition 2.6), our wpPRF key punctured key reveals nothing about the evaluation at the punctured point. … advantage in the experiment corresponds exactly to the privacy in puncturing experiment, and thus a PPT algorithm 𝒟 that distinguishes between Sim and Hyb allows one to break the privacy in puncturing property." Privacy w.r.t. server₀ is symmetric (p.19, "Privacy with respect to server₀").

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| Punctured wpPRF key q_b | GGM-style ordered seed list | λ · log N bits ≈ λ · log N | Defines the pseudorandom set S minus the queried box |

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| wpPRF keys (M of them) | Client → S0 | M · λ = λ²√N bits | No (consumed by S0 to build parities) | Offline — Step 1 of Preprocessing |
| Parities (M of them) | S0 → Client | M · w = λ√N · w bits | Yes — refreshed in-place per query | Offline (one-time per session, then patched) |
| Punctured key q₀ | Client → S0 | λ log N bits | No | Online — refresh path |
| Punctured key q₁ | Client → S1 | λ log N bits | No | Online |
| Answer P_b | Server b → Client | √N · w bits (or polylog with single-server PIR recursion) | No | Online |

### Correctness Analysis (Option B: Probabilistic)

| Field | Detail |
|-------|--------|
| **Failure mode** | Queried index x = x^ℓ ‖ x^r not covered by any preprocessed set: ∀ i ∈ [M], F.Eval(k_i, x^ℓ) ≠ x^r. |
| **Failure probability** | Pr[fail] = (1 − 1/√N)^{λ√N} ≤ (1/e)^λ ≤ ν(λ) — derived in Theorem 4.1 proof, eq. (1)–(3) (p.20).&#8201;[^5] |
| **Probability grows over queries?** | **No** — per-query independent. The hint table T is refreshed in-place after every query (T_j replaced by a fresh (k′, p_j′) pair), so the same union-bound argument re-runs unchanged on every query. The proof uses induction over t ∈ {1, …, T} (p.20). |
| **Probability grows over DB mutations?** | N/A in base scheme. Section 5.3 (p.25–26) discusses Checklist-style waterfall updates with the same amortized cost. |
| **Key parameters affecting correctness** | M (number of preprocessed sets) — set to λ√N to drive failure to negligible; |S| = √N (set size); λ = security parameter. |
| **Proof technique** | Independence + union bound: sets are independent because keys are independent; each set covers (x^ℓ, ·) with probability 1/√N; M = λ√N independent failures gives (1 − 1/√N)^{λ√N} ≤ e^{−λ}. |
| **Amplification** | Built-in by setting M = λ√N (vs. just √N which would give constant failure). |
| **Adaptive vs non-adaptive** | Privacy proof handles **adaptive** queries via hybrid argument over the T-query sequence (p.19). Correctness inductive over t (p.20). |
| **Query model restrictions** | Polynomial-sized sequence of queries (Definition 2.1, p.6). No bound on total queries before re-preprocessing — the in-place refresh keeps the table fresh indefinitely. |

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (N = 2³², w = 1 bit, no recursion) | Phase |
|--------|-----------|---------------------------|-------|
| Online server time (per server) | O(√N log N) | folded into amortized 3508 ms / query | Online |
| Online client time | O(√N log N) probabilistic (deterministic via shifts, App. A.1) | folded into amortized total | Online |
| Online upload (per server) | O(λ log N) | sub-KB | Online |
| Online download (per server) | O(√N · w) plain; O(polylog N) with recursion | ~8 KB plain (√N·w bits); ~50 KB with SPIRAL | Online |
| Throughput | not the relevant metric (sublinear server) | — | — |

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (N = 2³², w = 1 bit) | Phase |
|--------|-----------|---------------------------|-------|
| Server 0 preprocessing | O(λN log N) | not separately reported (folded into amortized query) | Once per client session |
| Offline client time | O(λ√N) — sample M keys, store T | small | Offline |
| Offline bandwidth (total) | O(λ√N · w) — keys ↑ + parities ↓ | dominated by parities ≈ λ√N bits = ~1 MB at N=2³² | Offline |
| Server per-client storage | 0 (no extra server state) | 0 | — |
| Client persistent storage | O(λ√N · (w + λ)) ≈ O(√N) words | 1.05 MB | — |

#### Asymptotic Comparison (Figure 1 verbatim)

| Protocol | Server* Time | Client Storage | Bandwidth* | Assumption |
|----------|--------------|----------------|------------|-----------|
| **TreePIR (Theorem 4.1, plain)** | **O(√N log N)** | **O(√N log N)** | **O(√N)** | **OWF** |
| **TreePIR (Lemma 4.1, +DGI19 recursion)** | **O(√N log N)** | **O(√N)** | **O(polylog N)** | **DDH** |
| Shi et al. [43] | O(√N log² N) (with very large hidden λ factors) | O(√N log² N) | O(polylog N) | LWE |
| Checklist [33] | O(√N) | O(N log N) | O(log N) | OWF |
| PRP-PIR [15] | O(√N) | O(√N) | O(√N log N) | OWF |

(* amortized over √N queries; client time is O(√N log N) for all schemes and is omitted from Fig. 1 by the authors.) Reproduced from Figure 1 (p.4).

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Multi-pass random-access — Server 0 makes ~λ passes over DB (one per pseudorandom set), reading each DB element approximately λ times. **Not single-pass / not BIM-optimal** (this is fixed in the follow-up SinglePass).&#8201;[^29] |
| **Client peak memory during preprocessing** | O(λ√N · (λ + w)) — the hint table T |
| **Number of DB passes (server)** | Approximately λ (one per set; some sharing across sets is possible but not exploited in the base scheme) |
| **Hint refresh mechanism** | In-place patching: each query replaces one row of T with a fresh (k′, p_j′) pair derived from Server 0's online response. Hint is never re-downloaded as a whole. Section 5.3 (p.25–26) describes Checklist-style waterfall updates for changing databases. |

[^29]: §1.1 (p.2): The Beimel-Ishai-Malkin lower bound (referenced in [6]) requires at least N database accesses in offline preprocessing; TreePIR's λN exceeds this by a λ factor. SinglePass (Lazzaretti–Papamanthou USENIX'24) achieves the BIM-optimal N accesses by replacing the λ random sets with Q permutations.

### Performance Benchmarks

**Hardware:** AWS EC2 m5d.8xlarge, single thread.&#8201;[^30] Implementation: 530 lines of C++ + 470 lines of Go, available at https://github.com/alazzaretti/treePIR.&#8201;[^31]

#### Database 2³² × 1-bit (Figure 7, p.23, amortized over 2000 queries)

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|----------------|------------------|
| Checklist [33] | 12574 ms | 8.6 GB | 0.51 KB |
| PRP-PIR [15] | — (DNF: implementation OOM at this size) | 1.05 MB | 33.5 MB |
| **TreePIR (plain)** | **3508 ms** | **1.05 MB** | **16.6 KB** |

→ TreePIR ≈ **3.5× faster query** than Checklist with **8000× less client storage**, paying ≈ 30× more bandwidth (still sub-MB). Massive win over PRP-PIR on bandwidth (>2000×) and on usability (PRP-PIR's small-domain PRPs put membership-test overhead into every set evaluation).&#8201;[^32]

#### Database 2²² × 256-byte (Figure 8, p.24, amortized over 200 queries)

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|----------------|------------------|
| Checklist [33] | 140 ms | 78 MB | 0.7 KB |
| PRP-PIR [15] | 315 ms | 67 MB | 721 KB |
| **TreePIR + SPIRAL** | **(89+61) ms = 150 ms** | **67 MB** | **50 KB** |

#### Database 2²⁸ × 32-byte (Figure 9, p.24, amortized over 2000 queries)

| Protocol | Amortized Query Time | Client Storage | Online Bandwidth |
|----------|---------------------|----------------|------------------|
| Checklist [33] | 711 ms | 570 MB | 0.3 KB |
| PRP-PIR [15] | — (impl. did not support this size) | 67 MB | 7.3 MB |
| **TreePIR + SPIRAL** | **(251+61) ms = 312 ms** | **67 MB** | **50 KB** |

→ At larger N, Checklist's client storage explodes (570 MB / 8.6 GB) while TreePIR holds at ≤ 67 MB. The 61 ms SPIRAL overhead is constant across DB sizes.&#8201;[^33]

[^30]: §5 (p.22): "The tests results reflect microbenchmarks run on a single thread in an Amazon Web Services EC2 instance of size m5d.8xlarge."
[^31]: §5 (p.22) and reference [1]: "We implement TreePIR in 530 lines of C++ code and 470 lines of Go code. The source code is available on GitHub [1]." Repo: https://github.com/alazzaretti/treePIR.
[^32]: §5.1, p.23 narrative: "compared to Checklist TreePIR reduces persistent client storage by over 8,000×. Additionally, TreePIR improves total query time by more than 3.5×. We pay for this in communication, but a price small enough to still be practical."
[^33]: §5.2, p.24: "TreePIR + SPIRAL represents the time that each takes, respectively. As shown in the figures, … we pay 61 ms on a database of 2¹¹ elements of size 256 bytes, and the same 61 ms to recurse on a database of 2¹⁴ elements of size 32 bytes."

### Comparison with Shi et al. (CRYPTO 2021) — same asymptotics, much better practice

The only prior scheme with TreePIR's polylog-bandwidth + sublinear-time + sublinear-storage profile is Shi et al. [43], based on **privately puncturable PRFs (LWE)**.&#8201;[^16] Authors estimate (using the Boneh–Kim–Montgomery EUROCRYPT'17 ppPRF parameters): online communication ≥ **2λ⁴ log(λ) · log N**, ≈ **400 MB per query at λ = 128**, *for any database size*. TreePIR's communication is **≥ 8000× smaller** than this estimate at all benchmarked DB sizes.&#8201;[^34]

[^34]: §5 (p.22): "Given the sample parameter instantiation of privately puncturable PRFs by [7], a conservative estimate on the online bandwidth of the Shi et al. scheme is of at least 2λ⁴ log(λ) · log N. This means an online per query communication cost of over 400 megabytes, given a security parameter of size 128 bits, for any database size. This means that by our estimates the communication using TreePIR presents a communication of 8,000× or more over the scheme by Shi et al. in all databases benchmarked."

### Application Scenarios

- **Secure Certificate Transparency (SCT) auditing** [Henzinger et al. 27, 2022]: PIR over 2³³ × 1-bit DB (which certificates are revoked); plain TreePIR is ideal because elements are 1 bit and bandwidth recursion would be wasted.&#8201;[^35]
- **Compromised-credential checking**: any "membership-style" query over very large 1-bit DBs.&#8201;[^36]
- **Private blocklists / ad-targeting opt-out lists** (Checklist's original setting): TreePIR provides the same kind of service with 8000× less client storage at moderate-to-large N.
- **Mobile / laptop deployments where >1 GB of client state is unacceptable**: TreePIR's ~MB-scale state is small enough for phones, even at billion-entry DBs.&#8201;[^37]
- **Medium and large records (32 B – 256 B)**: TreePIR + SPIRAL preserves polylog bandwidth at constant ≈ 50 KB.

[^35]: §5.1 (p.22–23): "Henzinger et al. [27] study the use of PIR for secure certificate transparency (SCT) auditing. Their protocol for SCT requires the use of PIR over a database of 2³³ elements of size only 1 bit."
[^36]: §5.1 (p.23): "Another application that might involve large databases of 1 bit entries would be compromised credential checking services, among other usecases where we are basically 'checking membership' using PIR, but the query is sensitive."
[^37]: §5.2 (p.24–25): "For many client use-cases, such as mobile phones and even laptop computers, half a gigabyte of storage is extremely undesirable. In such cases, TreePIR provides an alternative with faster query times and small client storage, at the cost of higher bandwidth per query."

### Deployment Considerations

- **Database updates:** Supported via Checklist-style waterfall preprocessing (§5.3, p.25–26): log N "subdatabases" of geometrically increasing size, each Add/Remove/Edit is directed to the smallest non-full layer; the layer is re-preprocessed and zeroed, with N total updates between full re-preprocessings. Henzinger et al.'s pre-determined update schedule (e.g., monthly cert refresh for SCT) is also viable.&#8201;[^38]
- **Sharding:** Not discussed; standard horizontal sharding compatible.
- **Anonymous query support:** **No** — client maintains persistent hint table tied to its identity at Server 0. Subscription-style.
- **Session model:** Session-based — preprocess once per (client, server₀) session, then query indefinitely with in-place hint refresh.
- **Cold start suitability:** Moderate — preprocessing is O(λN log N) = ≥ λ DB scans, much heavier than SinglePass's single pass. Best when sessions are long-lived.
- **Amortization crossover:** Authors recommend amortizing over √N queries (the bandwidth/time numbers in Fig. 1 are amortized this way). Plain TreePIR's win over Checklist at 1-bit DBs (Fig. 7) is amortized over 2000 queries.
- **Keyword PIR:** Convertible blackbox via Chor–Gilboa–Naor [14] with O(log N) overhead.&#8201;[^39]

[^38]: §5.3 (p.25–26): "the technique introduced by Kogan and Corrigan-Gibbs [33] is a waterfall-based approach to updates also used in other related primitives such as oblivious RAM [24] and searchable encryption [45]. … For each update to the database, the update is directed to the 0-th layer. … Note that in this manner, updates are amortized, and we go through N updates before having to re-run the preprocessing for the whole database again." Pre-determined schedule from Henzinger et al. [27]: "for example, it is acceptable to update the certificates monthly."
[^39]: §5.3, "PIR by keywords" (p.26): "Chor et al. [14] showed that this can be done in a blackbox fashion with O(log N) overhead for almost all modern PIR schemes."

### Key Tradeoffs & Limitations

- **2-server, non-colluding** — fundamentally weaker trust model than single-server PIR; fails if Server 0 and Server 1 collude.&#8201;[^2]
- **λ-pass preprocessing** — ~λ scans of the DB, vs. SinglePass's later single pass. Heavy for very large DBs / very fresh sessions.&#8201;[^29]
- **Probabilistic correctness** — query may fail with negligible probability even with honest servers; SinglePass and TAPIR replace this with deterministic correctness.&#8201;[^5]
- **Probabilistic client query time** — Step 1 of Online.Query samples a fresh wpPRF key until F.Eval(k′, x^ℓ) = x^r, taking O(√N) trials in expectation. Appendix A.1 deamortizes this via "shifts" sampled offline (technique borrowed from Corrigan-Gibbs–Kogan [15]).&#8201;[^40]
- **Single-server recursion compatibility constraint** — the recursion base must NOT itself depend on database-element-level preprocessing (since the √N parities returned by Server 1 are dynamically generated per query). This rules out preprocessing-based PIR (including TreePIR itself) as the recursion base.&#8201;[^17]
- **No keyword PIR natively** — requires Chor–Gilboa–Naor blackbox conversion (O(log N) overhead).&#8201;[^39]
- **Weak privately puncturable PRFs are application-coupled** — wpPRF is *not* a drop-in replacement for ppPRF in arbitrary applications; it only suffices when the application knows the puncture point at evaluation time.&#8201;[^23]
- **Online server time grows with DB depth** — O(√N log N) vs. Checklist's O(√N), a log-factor penalty in exchange for the storage and bandwidth wins.&#8201;[^41]

[^40]: §A.1 (p.27): "Our protocol in Figure 6 has probabilistic client time due to Step 1 of the Online Query algorithm … In practice, sampling several keys until finding one can be time consuming. … this is achievable by introducing an additional parameter to each of our 'sets', a *shift*. The shift will permute every element in the set by a fixed offset (this technique was used before in [15])."
[^41]: §1.2 / Fig. 1 (p.4) — TreePIR's O(√N log N) server time vs. Checklist's O(√N) is the log-factor cost of using wpPRFs (efficient full evaluation runs in O(√N log N), not O(√N)).

### Comparison with Prior Work

| Metric | TreePIR (plain) | TreePIR + SPIRAL | Checklist [33] | Shi et al. [43] | PRP-PIR [15] | SinglePass [LP24] |
|--------|-----------------|------------------|-----------------|------------------|--------------|-------------------|
| Servers | 2 | 2 | 2 | 2 | 2 | 2 |
| Assumption | OWF | OWF + RLWE | OWF | LWE (super-poly modulus) | OWF | OWF |
| Server time (online, amortized) | O(√N log N) | O(√N log N) + SPIRAL(√N) | O(√N) | O(√N log² N) (large hidden λ⁴) | O(√N) | O(Q) ≈ O(√N) |
| Bandwidth (online, amortized) | O(√N) | O(polylog N) ≈ 50 KB | O(log N) | O(polylog N), ≈ 400 MB concrete | O(√N log N) | O(Q · w) |
| Client storage | O(√N) | O(√N) | O(N log N) | O(√N log² N) | O(√N) | O(N log N + (N/Q)·w) |
| Preprocessing time | O(λ N log N) | O(λ N log N) | O(λ N) | O(N) | O(λ N) | **O(N)** |
| Correctness | Probabilistic | Probabilistic | Probabilistic | Probabilistic | Deterministic | **Deterministic** |
| Update time | O(log N) (waterfall) | O(log N) | O(log N) | not addressed | O(log N) | **O(1)** |

**Key takeaway:** TreePIR is the right 2-server preprocessing PIR when **client storage must stay sub-DB and online bandwidth must stay polylog**, on databases where session length permits amortizing a λ-pass preprocessing. It is the first scheme to match the asymptotic profile of Shi et al. (CRYPTO'21) without needing LWE-with-superpolynomial-modulus, and the first 2-server preprocessing PIR scheme to demonstrate practical polylog bandwidth (≈ 50 KB) on real benchmarks. For lower-storage-still or shorter-session cases, defer to its successor SinglePass; for malicious-server tolerance, defer to TAPIR.

### Portable Optimizations

- **Modified GGM puncturing that ships only the co-path siblings** (drops the punctured point from the punctured key entirely) — applicable to any application that already knows the puncture point during evaluation. Makes private puncturing a property *of the application*, not the primitive.&#8201;[^25]
- **Efficient full evaluation via shared subtrees**: enumerating all N "puncture-guess" sets in O(N log N) time by reusing 2^h evaluations across consecutive guesses. The trick generalizes to any tree-based PRF where adjacent puncture positions differ by a height-h subtree.&#8201;[^26]
- **Set-via-PRF-output construction**: `S(k) = { i ‖ F(k, i) : i ∈ [√N] }` gives a partition-style pseudorandom set with exactly one element per box and a constant-time (one PRF eval) membership test. Applicable to any 2-server PIR or symmetric-PIR construction needing partition-balanced pseudorandom sets.&#8201;[^18]
- **Recursion via an external single-server PIR over √N entries**: cleanly separates the 2-server preprocessing layer from the bandwidth-compression layer; future single-server PIR improvements automatically inherit.&#8201;[^17]

### Implementation Notes

- **Languages:** C++ (~530 LoC) + Go (~470 LoC); fork of the Kogan–Corrigan-Gibbs Checklist framework and the Kales et al. PIR library.&#8201;[^31]
- **Polynomial / FHE arithmetic:** None for plain TreePIR. SPIRAL recursion uses RLWE over Z_q[x]/(x^d + 1); inherits SPIRAL's parameter set.&#8201;[^17]
- **PRG / PRF:** Standard cryptographic PRG / GGM tree (no special hardware acceleration mentioned).
- **Parallelism:** Single-threaded benchmarks; the M = λ√N parities computation is embarrassingly parallel and authors do not exploit it.
- **Open source:** https://github.com/alazzaretti/treePIR

### Open Problems (as discussed)

- Whether wpPRFs from OWF can support applications where the puncture point is *not* known to the evaluator (this would close the gap to full ppPRF and remove the LWE dependence in those settings) — not stated explicitly but implicit in the building-block contribution.
- Pre-deterministic update schedules vs. waterfall vs. de-amortized updates: which model best matches modern PIR-deployment patterns (the SCT and SinglePass papers continue this thread).

### Uncertainties

- Concrete preprocessing wall-clock time is not separately reported in the paper — folded into amortized query times (over 2000 or 200 queries depending on benchmark).
- The exact constants in O(√N log N) server time depend on the underlying PRG implementation; the paper does not report cycle counts or memory-bandwidth utilization.
- "Applications where database elements are very small": the paper benchmarks 1-bit DBs explicitly, but the crossover from "plain TreePIR wins" to "TreePIR + SPIRAL wins" as a function of w is not given as a closed form — only at w=1 (plain wins) and w∈{32, 256} (SPIRAL wins).
