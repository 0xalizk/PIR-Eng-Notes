## SinglePass — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Single Pass Client-Preprocessing Private Information Retrieval](https://www.usenix.org/conference/usenixsecurity24/presentation/lazzaretti) (USENIX Security 2024) |
| **Authors** | Arthur Lazzaretti, Charalampos Papamanthou (Yale University) |
| **Archetype** | Construction |
| **PIR Category** | 2-server, role-asymmetric (offline/online split) — exploratory `multiserver/asymmetric.role/`. Conceptually closest to **Group 2b — Client-specific hint (interactive)** in the single-server taxonomy, but inherently 2-server (Server 0 runs `Hint`, Server 1 runs `Answer`).&#8201;[^1] |
| **Security model** | 2-server non-colluding, semi-honest. Privacy holds against an adversary corrupting *either* server (and any number of clients), but not against a joint Server-0/Server-1 adversary.&#8201;[^2] |
| **Additional assumptions** | OWF (PRGs/PRFs for permutation seeds and randomness sampling). No FHE, no DDH, no setup. |
| **Correctness model** | **Deterministic** — by construction, the client's reconstructed value equals DB[x] for any honest execution.&#8201;[^3] |
| **Rounds (online)** | 1 (client sends q₀ to Server 0 and q₁ to Server 1 in parallel; servers reply with A₀, A₁). |
| **Record-size regime** | Parameterized — N w-bit elements; benchmarks at w ∈ {512, 1024, 2048} bytes. |

[^1]: Section 1, "1.1 SinglePass" (p.5968): "We propose SinglePass, the first client-preprocessing PIR scheme whose preprocessing is exactly one linear pass over the database, operating on each element exactly once." Section 2 (p.5970): "SinglePass works in the two-server model, where a database of N bits is replicated in two servers and at least one server behaves honestly."
[^2]: Section 2 (p.5970): "SinglePass privacy holds for any adversary controlling either server and any number of clients, but does not capture an adversary controlling both servers."
[^3]: Section 4 (p.5973), Theorem 4.1 + Appendix A "Correctness" (p.5980): "Correctness: Follows by construction (we reiterate correctness is modeled for honest servers only)." There is no failure-probability term — unlike Piano/Checklist, SinglePass has no replacement/hint-exhaustion path.

### Asymmetry Profile

| Aspect | Server 0 (offline) | Server 1 (online) |
|--------|-------------------|-------------------|
| **Role** | Hint generator (one-time per client session) | Query responder (per-query) |
| **Data held** | Full DB | Full DB |
| **Per-session work** | O(N · w) — single linear streaming pass over DB to compute Q hints, sends hint h ∈ {0,1}^{(N/Q)·w} to client | None offline |
| **Per-query work** | O(Q · w) — return refresh array of Q elements at indices `[p_i(r_i)]` | O(Q · w) — return query array of Q elements at indices `[p_i(ind)]` for i ≠ i\* |
| **Receives from client** | S_refresh (Q random offsets) | S_query (Q indices, with the i\*-th replaced by random r\*) |
| **Single-pass property** | Yes — Server 0 reads each DB element exactly once; preprocessing time is asymptotically optimal per Beimel–Ishai–Malkin&#8201;[^4] | N/A |
| **Asymmetry ratios (vs. symmetric Checklist split)** | Preprocessing: O(N·w) here vs. O(λ·N) in Checklist → 45×–100× faster end-to-end&#8201;[^5] | Query time: 20× faster than Checklist due to dropping the λ factor |

[^4]: Section 1.1 (p.5968): "We propose SinglePass, the first client-preprocessing PIR scheme whose preprocessing is exactly one linear pass over the database … this is asymptotically optimal [5]" — referring to Beimel-Ishai-Malkin's lower bound on server-preprocessing PIR.
[^5]: Abstract (p.5967): "Our approach yields a preprocessing speedup ranging from 45× to 100× and a query speedup of up to 20× when compared to previous state-of-the-art schemes (e.g., Checklist, USENIX SECURITY 2021)."

### Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 |
| **Replication** | Both servers store identical copy of DB |
| **Trust model** | Non-colluding, semi-honest. Either may be corrupted but not both jointly.&#8201;[^2] |
| **Communication topology** | Star — client talks to each server independently; no server-server channel |
| **Server symmetry of role** | **Asymmetric (role split)**: Server 0 is the offline preprocessor (runs `Hint(DB)` once per client session), Server 1 is the online responder (runs `Answer` per query). Both servers run the *same* `Answer` algorithm during a query, but only Server 0 runs `Hint`.&#8201;[^6] |
| **Online round structure** | Client sends q₀ → Server 0 and q₁ → Server 1 in parallel; receives A₀, A₁; reconstructs DB[x] |
| **Realizability of non-collusion** | Authors suggest running each server by a different organization/party.&#8201;[^2] |

[^6]: Section 4, Figure 4 (p.5973), and Section 2 "Definition 2.1" (p.5970): the Hint algorithm runs on Server 0 only; both servers run the same Answer(DB, q_b) algorithm parameterized by which query share they receive.

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Checklist (Kogan–Corrigan-Gibbs, USENIX Security '21, 2-server preprocessing PIR); Beimel–Ishai–Malkin server-preprocessing model; Fisher–Yates–Durstenfeld–Knuth shuffle for compact small-domain permutations.&#8201;[^7] |
| **What changed** | Checklist required λ·√N pseudorandom *sets* in preprocessing (touching each DB element ≈ λ times to hit any index w.h.p.) and used hierarchical-ORAM-style waterfall updates costing O(log N) per mutation. SinglePass replaces the λ random sets with **Q full permutations** of [N/Q], so each DB element is touched exactly once during a single linear pass; updates become O(1) via permutation inverses.&#8201;[^8] |
| **Superseded by** | TAPIR (2025) — same authors, builds directly on SinglePass |
| **Concurrent work** | TreePIR (Lazzaretti–Papamanthou, CRYPTO '23, weak privately-puncturable PRF, 2-server); MIR (Mughees–Sun–Ren, 2023, "amortized sublinear PIR") |

[^7]: Section 1 (p.5968): SinglePass is positioned against Checklist [21] and the offline/online PIR model of Corrigan-Gibbs–Kogan [9]. Section 2 (p.5971): Fisher-Yates references [10, 11, 20] (Durstenfeld 1964, Fisher–Yates 1963, Knuth 1969).
[^8]: Section 1 and Section 1.1 (p.5968): "the preprocessing phase of existing PIR schemes requires λ√N · √N = λ·N database accesses." SinglePass's hint = one permutation × one pass; updates discussed in Section 6, p.5974: "constant-time editing" via inverse permutation lookup.

### Core Idea

SinglePass partitions the N-element DB into Q rows of size m = N/Q (so DB_i = DB[i·m : (i+1)·m]) and lets Server 0 sample Q **independent permutations** p_0, …, p_{Q-1}, each over [m]. Server 0 then computes m hints by summing one element from each row along the permutations: h_j = ⊕_{i ∈ [Q]} DB_i[p_i(j)].&#8201;[^9] To query x = (i\*, j\*), the client locates the column `ind` such that p_{i\*}(ind) = j\* and asks Server 1 for the column `[p_i(ind)]_i` *with the i\*-th entry replaced by a fresh random r\**. In parallel, the client asks Server 0 for a "refresh column" `[p_i(r_i)]_i` chosen at independently random offsets. The XOR of hint h_{ind} with all of A_1's entries except the i\*-th yields DB[x]; the refresh column is XOR-ed into the hints to "swap" the just-used column with a fresh random one, leaving each permutation uniformly distributed from Server 1's view.&#8201;[^10]

[^9]: Section 4, Figure 4 "SinglePass" box (p.5973): Hint(DB) samples p_i ←$ Permute(N/Q) for i ∈ [Q] and computes h_j = ⊕_{i=0}^{Q−1} DB_i[p_i(j)] for j ∈ [m].
[^10]: Section 1.1 "SinglePass working example" + Figure 1 (p.5968–5969); Section 4 (p.5973): Query(ck,x) finds ind, builds S_query = [p_i(ind)] with i\*-th entry replaced by r\* ←$ [m], samples r_i ←$ [N/Q], builds S_refresh = [p_i(r_i)], then swaps p_i(ind) ↔ p_i(r_i) in each permutation. Reconstruct returns DB[x] = (⊕_{i ≠ i\*} A_1[i]) ⊕ h_ind.

### Variants

Single construction; tunable parameter Q ∈ [N] divides N. Q sets a Pareto frontier between client storage and online cost: hint size = (N/Q)·w bits; per-query bandwidth ≈ Q·w; client storage = O(N log N + (N/Q)·w).&#8201;[^11]

[^11]: Table 1 (p.5968) and Theorem 4.1 (p.5973). Larger Q → smaller hint download, larger online communication, larger client permutation storage.

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Show-and-Shuffle experiment |
| **Type** | Cryptographic indistinguishability lemma over small-domain permutations |
| **Interface / Operations** | Adversary picks (ℓ, k) ∈ [L] × [K], experiment exposes a vector v of L permutation values where v_ℓ is uniform in [K] and v_i = P_i(j) for i ≠ ℓ (with j the unique pre-image of k under P_ℓ); experiment then either resamples all P fresh (b=0) or swaps P_ℓ(j) ↔ P_ℓ(r_ℓ) for ℓ' ≠ ℓ (b=1).&#8201;[^12] |
| **Security definition** | Perfect indistinguishability: Pr[SaS_{A,L,K} → 1] = 1/2 for any L, K and any A (Lemma 3.1).&#8201;[^13] |
| **Purpose** | Captures single-query security of SinglePass; iterating it T times (via hybrid argument) yields privacy across a sequence of T adaptive queries. |
| **Built from** | Uniform sampling of small-domain permutations (Fisher–Yates–Durstenfeld–Knuth shuffle) |
| **Standalone complexity** | Permute(N) runs in O(N) time; permutations are stored explicitly to enable O(1) inverse queries.&#8201;[^14] |

[^12]: Section 3, Figure 3 "Show and Shuffle" (p.5971): full game definition.
[^13]: Section 3, Lemma 3.1 (p.5971): "For the Show and Shuffle game defined in Figure 3, denoted as SaS, for any adversary A, for any L,K ∈ ℕ: Pr[SaS_{A,L,K} → 1] = 1/2." Proof in Section 3 (pp.5971–5972).
[^14]: Section 2, Lemma 2.1 (p.5971): "there exists an algorithm Permute(N) that can output a permutation of the set [N] sampled uniformly from the set of all permutations of [N], P_N, in O(N) time." The client stores the whole permutation to evaluate it (and its inverse) in sublinear time per query.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (used to instantiate the PRG that compresses the seed used by Server 0 to communicate permutations to the client). The privacy of the scheme itself (Show-and-Shuffle) is **information-theoretic**; computational security only enters via the PRG-seeded permutation transmission.&#8201;[^15] |
| **Encryption/encoding scheme** | None — XOR/parity only. No FHE, no LWE, no DDH. |
| **Permutation family** | Small-domain permutations over [N/Q] sampled via Fisher-Yates; stored explicitly as arrays of length N/Q. |
| **Key structure** | Client keys ck = {p_i}_{i ∈ [Q]} (Q full permutations of [m] = [N/Q]). |
| **Correctness condition** | Deterministic: ⊕_{i ≠ i\*} DB_i[p_i(ind)] ⊕ h_{ind} = DB_{i\*}[j\*] = DB[x] by construction (h_{ind} XORs in all rows including the i\*-th, so removing all i ≠ i\* terms leaves the i\*-th).&#8201;[^16] |

[^15]: Section 2 (p.5970): "The privacy of the scheme is computational, and the correctness is not." Section 2 (p.5971): "A pseudorandom function can be used to produce a large number of pseudorandom outputs from a single truly random seed. In our construction, however, unlike previous schemes, [PRFs] will not be necessary to argue security." The PRG enters only when sampling each r_i with security parameter λ (Appendix A, p.5980).
[^16]: Section 4, Figure 4 "Reconstruct" (p.5973) and Appendix A "Correctness" (p.5980).

### Key Data Structures

- **Database partition.** DB ∈ ({0,1}^w)^N is reshaped into a Q × m array with m = N/Q, where DB_i = DB[i·m : (i+1)·m].&#8201;[^17]
- **Permutation table** (client). Q permutations p_0, …, p_{Q-1}, each over [m] = [N/Q]. Stored explicitly so that p_i(·) and p_i^{-1}(·) are O(1).&#8201;[^14]
- **Hint vector** (client). h ∈ ({0,1}^w)^m where h_j = ⊕_{i ∈ [Q]} DB_i[p_i(j)]. Hint download size = m·w = (N/Q)·w bits.
- **Server state.** Server 0 and Server 1 each store DB only — no per-client state on either server.&#8201;[^18]

[^17]: Section 4, Figure 4 "Public Parameters" (p.5973): "Let Q,N ∈ ℕ such that Q | N. Let m ∈ ℕ = N/Q. … For i ∈ [Q], let DB_i = DB[i·m : (i+1)·m]."
[^18]: Theorem 4.1 (p.5973): "The server stores only DB."

### Database Encoding

- **Representation:** Q × m matrix view of DB (no algebraic encoding required — XOR over raw bytes).
- **Record addressing:** x ∈ [N] decomposed as (i\*, j\*) ∈ [Q] × [m] via i\* = ⌊x / m⌋, j\* = x mod m. Online query then transforms (i\*, j\*) into (i\*, ind) via ind = p_{i\*}^{-1}(j\*).
- **Preprocessing required:** None beyond the partition view; Server 0 streams DB once during `Hint`.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Hint generation | Server 0 | Sample Q permutations of [m] (seeded PRG); compute m hints h_j = ⊕_i DB_i[p_i(j)] in one streaming pass over DB | (PRG seed + h) ↓ ≈ (N/Q)·w bits + O(λ) | Once per client session |
| Permutation expansion | Client | Expand seed to {p_i}; store inverses | — | Once per session |
| Query gen | Client | Compute ind = p_{i\*}^{-1}(j\*); build S_query (Q indices, i\*-th replaced by r\* ←$ [m]); sample r_i ←$ [m] for i ∈ [Q]; build S_refresh = [p_i(r_i)] | q₀ = S_refresh ↑ to Server 0; q₁ = S_query ↑ to Server 1. Each is Q · log m bits ≈ Q · w_index | Per query |
| Answer | Server 0 / Server 1 | Return A_b = [DB_i[q_b[i]]]_{i ∈ [Q]} (Q-element array) | Q · w bits ↓ | Per query, both servers |
| Reconstruct + state refresh | Client | DB[x] = (⊕_{i ≠ i\*} A_1[i]) ⊕ h_{ind}; for each i ≠ i\* update h_{ind} ← h_{ind} ⊕ A_0[i] ⊕ A_1[i] and h_{r_i} ← h_{r_i} ⊕ A_0[i] ⊕ A_1[i]; swap p_i(ind) ↔ p_i(r_i) in each permutation | — | Per query |

### Two-Server Protocol Details

| Aspect | Server 0 | Server 1 |
|--------|----------|----------|
| **Data held** | Full DB | Full DB |
| **Pre-session role** | Runs `Hint(DB)`: streams DB once, computes m hints, sends (PRG seed, hint vector) to client | None |
| **Per-query input** | q₀ = S_refresh = [p_i(r_i)]_{i ∈ [Q]} (uniformly random column from each permutation) | q₁ = S_query = [p_i(ind)] except entry i\* replaced by uniform r\* (so query column is uniform from S1's view) |
| **Per-query computation** | A_0 = [DB_i[q_0[i]]]_i — one read per row | A_1 = [DB_i[q_1[i]]]_i — one read per row |
| **Output size** | Q · w bits | Q · w bits |
| **Security guarantee** | Computational privacy via PRG (PRG-seeded r_i samples; permutations were uniformly sampled by S0 itself, so S0 sees no information from queries beyond independent uniform refresh columns)&#8201;[^19] | Information-theoretic privacy from Show-and-Shuffle indistinguishability across T queries (S1 never sees the preprocessing)&#8201;[^20] |
| **Non-collusion assumption** | Required — joint S0+S1 view recovers (preprocessing, query column, refresh column) which together leak x |

[^19]: Appendix A, "Privacy: Server 0" (p.5980): "an adversary acting as Server 0 cannot distinguish between b=0 and b=1 in PrivGame⁰. If we use pseudorandomness output by a PRG with security parameter λ rather than true randomness to sample each r_i, we incur a negligible probability of distinguishing, directly from the PRG security definition."
[^20]: Appendix A, "Privacy: Server 1" (p.5980): "the adversary acting as Server 1 does not get access to the preprocessing (since it is run by Server 0), but it does see q_1 for every timestep t ∈ T." Theorem A.1 ("Query indistinguishability") gives perfect indistinguishability of the experiments; PRG security then converts to computational across the seeded sampling.

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| PRG seed (permutations) | S0 → Client | O(λ) | Yes — full session | Compresses Q permutations of [m] |
| Hint vector h | S0 → Client | (N/Q) · w bits | Yes — refreshed in-place per query | Offline download |
| Query S_query | Client → S1 | Q · ⌈log m⌉ bits ≈ Q · w | No | Online |
| Refresh S_refresh | Client → S0 | Q · ⌈log m⌉ bits ≈ Q · w | No | Online |
| Answer A_0, A_1 | S0 → Client, S1 → Client | 2 · Q · w bits | No | Online |

### Correctness Analysis (Option C: Deterministic)

Deterministic correctness — by construction. The proof reduces to noting that h_{ind} = ⊕_{i ∈ [Q]} DB_i[p_i(ind)] and S_query exposes DB_i[p_i(ind)] for all i ≠ i\* (with i\*-th entry replaced by an arbitrary random index r\*, which the client discards). Therefore (⊕_{i ≠ i\*} A_1[i]) ⊕ h_{ind} = DB_{i\*}[p_{i\*}(ind)] = DB_{i\*}[j\*] = DB[x]. After the swap, h_{ind} and h_{r_i} are updated to track the new permutation state so the same invariant holds for all subsequent queries (induction).&#8201;[^21]

[^21]: Theorem 4.1 (p.5973) and Appendix A "Correctness" (pp.5980 ff.): inductive argument over T queries; no failure-probability term.

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (N = 10⁶, w = 512 B) | Phase |
|--------|-----------|---------------------------|-------|
| Query upload (per server) | O(Q · w) | ≈ 0.68 KB | Online |
| Response size (per server) | O(Q · w) | (folded into per-query BW above) | Online |
| Server computation (per server, online) | O(Q · w) | 0.02 ms | Online |
| Client query time | O(Q) | 0.02 ms (incl. roundtrip) | Online |
| Throughput | — | not the relevant metric (sublinear server) | — |

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (N = 10⁶, w = 512 B) | Phase |
|--------|-----------|---------------------------|-------|
| Server 0 preprocessing (Hint) | O(N · w) | 0.122 s for N=3M, w=32B (Table 2); ~order-of-magnitude faster than Checklist's O(λ·N) | Once per client session |
| Client hint download ↓ | O((N/Q) · w + λ) | varies with Q | Offline |
| Client offline upload ↑ | 0 | 0 | — |
| Server per-client storage | 0 | 0 | — |
| Amortized offline / query | O(N/(Q · session_length) · w) | small for session-based use | — |
| Client persistent storage | O(N log N + (N/Q) · w) | 23.3 MB at N=3M, w=32B (Table 2) | — |

#### Update metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per Edit | O(1) | Compute k = p_{i_0}^{-1}(i_1); h_k ← h_k ⊕ DB[i]_old ⊕ DB[i]_new&#8201;[^22] |
| Cost per Add (amortized) | O(1) amortized over N additions | Resample one permutation every N/Q additions, costing O(N/Q); deamortizable to constant per step&#8201;[^23] |
| Cost per Add (worst-case, undeamortized) | O(N/Q) | At the boundary where Q increments and a fresh permutation must be sampled |
| Communication per update | 2w (old + new value) | Edit; Add adds w |
| Deletion semantics | Implemented as Edit with DB[i]_new = 0 (or special delete value) | Section 6 |
| Supported mutation types | Insert (Add), Edit, Delete | |
| Bandwidth growth on Add | +2w per N/Q additions | Q grows by 1 every N/Q additions |

[^22]: Section 6, Figure 7 "Edit" (p.5974–5976): Edit takes O(1) — compute (i_0, i_1) decomposition, look up k = p_{i_0}^{-1}(i_1), patch one hint entry.
[^23]: Section 6, "Additions" + Figure 7 "Add" (p.5974–5976): "we only have to sample the permutation once for every N/Q additions, and sampling the permutation takes O(N/Q) time. Every subsequent addition takes O(1) time … This can be deamortized by sampling a constant part of the permutation at each update."

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass) — Server 0 reads each DB element exactly once.&#8201;[^4] |
| **Client peak memory during preprocessing** | O(N log N + (N/Q)·w) — must store all Q permutations and the hint vector |
| **Number of DB passes** | 1 (asymptotically optimal, matching Beimel–Ishai–Malkin lower bound) |
| **Hint refresh mechanism** | In-place patching: each query rewires two hint entries (h_ind and one h_{r_i}) per row via XOR; permutations are swap-updated. **Hints are never re-downloaded.** No pipelining of a parallel offline phase needed. |

### Asymptotic Comparison (Table 1 verbatim)

| Scheme | Preprocessing Time | Query Time | Query BW | Client Storage | Update Time |
|--------|-------------------|-----------|----------|----------------|-------------|
| Checklist [21] | O(λ · N) | O(√N) | O((log N)(λ log N + w)) | O(N log N + λ √N · w) | O(log N) |
| **SinglePass** | **O(N)** | **O(Q)** | **O(Q · w)** | **O(N log N + (N/Q) · w)** | **O(1)** |

(Reproduced from Table 1, p.5968. λ is the security parameter, e.g., 128.)

### Performance Benchmarks

**Hardware:** AWS EC2 t2.2xlarge, single thread.&#8201;[^24] Implementation: ~300 lines of Go + 150 lines of C (extends Checklist's framework).&#8201;[^25]

**Static-DB benchmark (Figure 6, N up to ~2M, w ∈ {512, 1024, 2048} B, log scale, approximate from chart):**

| w | Preprocessing time | Query time | Query BW | Client storage |
|---|-------------------|-----------|----------|----------------|
| 512 B | 0.01–0.1 s (vs. Checklist 1–10 s → ~50–100×) | ~0.01–0.05 ms (vs. Checklist 0.5–1 ms → ~20×) | ~5–10 KB (Checklist ~5 KB; comparable) | comparable to other schemes when normalized |
| 1024 B | 0.01–0.5 s | ~0.01–0.05 ms | 10–30 KB | comparable |
| 2048 B | 0.05–0.5 s (vs. Checklist 5–50 s) | ~0.05–0.1 ms | 20–80 KB | comparable |

(All values approximate, read from the log-scale charts in Figure 6, p.5975. Tests are normalized by client storage.)

**Updatable-DB benchmark (Table 2, p.5979 — N=3,000,000, w=32 B, batch of 500 updates):**

| Scheme | Preprocessing | Query Time | Query BW | Client Storage | Update Time |
|--------|---------------|-----------|----------|----------------|-------------|
| **SinglePass** | **0.122 s** | **0.02 ms** | **0.68 KB** | **23.3 MB** | **0.19 ms** |
| Checklist | 13.22 s | 0.95 ms | 1.48 KB | 23.6 MB | 3.78 ms |

→ SinglePass ≈ **108× preprocessing**, **47× query**, **2× bandwidth**, **20× update** over Checklist at matched client storage.&#8201;[^26]

[^24]: Section 5 (p.5974): "Benchmarks are all run on an AWS EC2 instance of size t2.2xlarge, on a single thread."
[^25]: Section 5 (p.5973–5974): "SinglePass is implemented in about 300 lines of Go code and 150 lines of C code, as an extension to the existing PIR framework from Checklist [21]." Repo: https://github.com/SinglePass712/Submission.
[^26]: Section 6 evaluation discussion + Table 2 (p.5979): "100× speed-up in preprocessing, over 47× speed-up in query time, an approximate 2× saving in bandwidth and a 19× faster update time."

### Application Scenarios

- **Private encyclopedia / Wikipedia** — typical entries 512–2048 B, total < 2 M entries; fast cold-start preprocessing matters because users want to "browse, query a few items, then leave."&#8201;[^27]
- **Private blocklist lookups** (Checklist's original scenario) — 3 M × 32 B records, batched updates; Table 2 quantifies the speedup.
- **Metadata-hiding communication** (Addra, Pung) — short sessions of moderate size.
- **Private movie streaming** (Popcorn).
- **Session-based PIR**: SinglePass is presented as the right scheme when the *number of queries per session is small* (the regime where Checklist's λ·N preprocessing cost cannot be amortized away).&#8201;[^28]

[^27]: Section 5, "On linear client storage" (p.5974): "databases with a size on the order of a million elements encompass a large array of PIR use cases, including private blocklists [21], metadata-hiding communication [2,3], private movie streaming [15], private wikipedia [27], among others. This is the size of databases we focus on mainly in this work."
[^28]: Section 1.1 (p.5968): "preprocessing becomes much more economical for applications that require a small amount of queries." Figure 5 (p.5974) shows SinglePass beating DPF (no-preprocessing baseline) at as few as **2 queries**, while Checklist needs 50+ to break even.

### Deployment Considerations

- **Database updates:** Native O(1) Edit and amortized O(1) Add via permutation inverses (Section 6). One of the rare 2-server preprocessing PIR schemes with truly constant-time updates.
- **Sharding:** Not discussed; standard horizontal sharding compatible since each shard is an independent SinglePass instance.
- **Anonymous query support:** **No** — the client maintains persistent permutation state and a per-session hint, tied to its identity at Server 0 (the preprocessor). Subscription-style.
- **Session model:** Session-based — a client subscribes by running `Hint` once with Server 0, then issues unlimited queries within that session (each query refreshes the state in place). Hint state can be deleted at session end.
- **Cold start suitability:** Excellent — preprocessing is a single linear pass; per Figure 5, end-to-end SinglePass beats no-preprocessing DPF at just two queries.&#8201;[^28]
- **Amortization crossover:** ~2 queries (vs. DPF baseline); orders of magnitude better than Checklist's 50+ on the same N.

### Key Tradeoffs & Limitations

- **2-server, non-colluding** — fundamentally weaker than single-server PIR; fails if Server 0 and Server 1 collude.&#8201;[^2]
- **Linear client storage** — hint vector is (N/Q)·w bits and Q permutations occupy N log N bits; Q tunes the split but cannot eliminate it. Same regime as Checklist but with no λ factor.&#8201;[^29]
- **Online communication grows with Q** — Q · w per query (for both upload and each server's response) versus Checklist's O((log N)(λ log N + w)). For large Q (e.g., Q = √N), this is asymptotically heavier in some regimes; the chart in Figure 6 confirms SinglePass has higher query bandwidth than TreePIR/Checklist when normalized by client storage.&#8201;[^30]
- **No keyword PIR support natively** — pure index PIR; keyword PIR requires an extra cuckoo-hashing layer (2× overhead) per the authors' note.&#8201;[^31]
- **Deterministic correctness, but only against honest servers** — security model is semi-honest; malicious server (sending wrong A_b) is not handled.

[^29]: Section 5, "On linear client storage" (p.5974): "Just like Checklist, SinglePass suffers from linear client storage. However, because there is no dependency on λ, SinglePass's client storage is only worse than the client storage of previous schemes [9, 21–23, 30] for N greater than one billion elements (this is for a word size of 1024 bytes)."
[^30]: Appendix B (p.5982): "The price we pay is that the query bandwidth with comparison to MIR and Checklist is much increased."
[^31]: Footnote 5 (p.5977): "using cuckoo hashing we can derive a keyword PIR scheme with a 2× overhead [33]."

### Comparison with Prior Work

| Metric | SinglePass | Checklist [21] | TreePIR [23] | Piano (1-server) | DPF (no-preprocessing) |
|--------|------------|---------------|--------------|------------------|----------------------|
| Servers | 2 | 2 | 2 | 1 | 2 |
| Preprocessing | O(N) | O(λ·N) | O(λ·N) | O(√N · N) one-time | None |
| Query time | O(Q) | O(√N) | O(√N) | O(√N) | O(N) |
| Query BW | O(Q · w) | O((log N)(λ log N + w)) | O(√N) | O(√N) | O(λ) |
| Client storage | O(N log N + (N/Q)·w) | O(N log N + λ√N·w) | similar | O(√N) | O(λ) |
| Update | O(1) | O(log N) | O(log N) | re-preprocess | N/A |
| Correctness | Deterministic | Probabilistic | Probabilistic | Probabilistic (Q-bounded) | Deterministic |
| DB params | matched in benchmarks | | | | |

**Key takeaway:** SinglePass is the right 2-server preprocessing PIR for **session-based applications with small-to-moderate query counts on databases up to ~10⁹ entries**. It dominates Checklist on every axis except online bandwidth — and that gap is small for w ≥ 512 B records (sub-MB). For applications needing single-server trust, fall back to Piano or Plinko (Group 2b, single-server, but with probabilistic correctness and worse preprocessing).

### Portable Optimizations

- **Single-pass streaming hint** via Q permutations of [N/Q] (rather than λ random sets of size √N). Generalizes to any 2-server preprocessing PIR where the offline hint is an XOR of one element per "row."
- **Permutation-inverse update trick** (`p^{-1}(j)` to find which hint covers a mutated index) — O(1) per Edit. Composable with any partition-based hint structure storing explicit permutations.
- **Show-and-Shuffle indistinguishability lemma** — a clean primitive for analyzing single-query security of permutation-based hint schemes; reusable for future role-asymmetric 2-server constructions (e.g., TAPIR builds on this).

### Implementation Notes

- **Languages:** Go (~300 LoC) + C (~150 LoC); fork of Checklist's PIR framework.&#8201;[^25]
- **Polynomial / FHE:** none.
- **Permutation arithmetic:** explicit small-domain Fisher-Yates-Durstenfeld-Knuth shuffle; full permutation stored client-side to enable O(1) p_i and p_i^{-1} lookups.
- **Parallelism:** single-thread benchmarks only; trivially parallelizable across rows i ∈ [Q].
- **Open source:** [github.com/SinglePass712/Submission](https://github.com/SinglePass712/Submission) (per paper).&#8201;[^25]

### Open Problems

- **Sublinear client storage** — both Checklist and SinglePass require Θ(N log N) client state; the authors note this as a limitation but not a directly addressed problem.&#8201;[^29]
- **Single-server analog** — closing the gap between role-asymmetric 2-server preprocessing (SinglePass: O(N) prep, deterministic) and best single-server preprocessing (Piano: O(√N · N) prep, probabilistic) remains open.
- **Malicious security** without major overhead.

### Related Papers in Collection

- **CK20** [`asymmetric.role/ck_2020/`] — first sublinear-server cPIR via client preprocessing; SinglePass is in the same role-asymmetric lineage but uses permutations instead of puncturable PRFs.
- **Checklist** (Kogan–Corrigan-Gibbs '21) — direct predecessor; SinglePass eliminates λ factor and waterfall updates.
- **TreePIR** (Lazzaretti–Papamanthou, CRYPTO '23) — same authors; weak privately-puncturable PRF approach. Compared empirically.
- **TAPIR** [`asymmetric.role/tapir_2025/`] — direct successor by the same authors, builds on SinglePass.
- **IncPIR** [`asymmetric.role/incpir_2022/`] — different angle on updatable 2-server preprocessing PIR.
- **Piano** [`Group.2b.Interactive.Hint/piano_2023/`] — single-server analog with probabilistic correctness.
- **MIR** (Mughees–Sun–Ren '23) — concurrent / contemporaneous; benchmarked against in Figures 5–6.

### Uncertainties

- **PRG seed size for permutation transmission** — the paper's `Hint` outputs a hint vector and "the seed used to generate the permutations" but does not specify seed length explicitly. Assumed to be O(λ).
- **w_index for online query encoding** — query upload is "Q indices" but the bit-encoding of each index (log m bits, padded?) is not detailed. Approximated as Q · ⌈log m⌉ bits.
- **Figure 6 chart values** are read from log-scale plots and are approximate (±20%); only Table 2 is exact.
- **Definition 2.1's "client hint h"** lists `Hint` as outputting (ck, h), but the SinglePass `Hint` algorithm in Figure 4 outputs h = {h_j}_{j ∈ [m]} and ck = {p_i}_{i ∈ [Q]} — these are two distinct things; client stores both. The notation is consistent on close reading but easy to misread on first pass.
