## IncPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Incremental Offline/Online PIR (extended version)](https://eprint.iacr.org/2021/1438) (2021) |
| **Archetype** | Construction + Update/maintenance |
| **PIR Category** | Group D — Client-Dependent Preprocessing |
| **Security model** | 2-server non-colluding, semi-honest |
| **Additional assumptions** | OWF (for PRF/PRP instantiation); non-collusion between offline and online servers |
| **Correctness model** | Probabilistic (failure probability grows over DB mutations; see Correctness Analysis) |
| **Rounds (online)** | 1 (client sends set to online server, receives XOR parity) |
| **Record-size regime** | Small (32-byte Tor relay descriptors in evaluation; general b-bit objects) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Corrigan-Gibbs and Kogan (CK) [Group D] two-server offline/online PIR scheme [^1]; Shi, Aqeel, Chandrasekaran, and Maggs (SACM) [Group D] puncturable PRS-based scheme [^2] |
| **What changed** | CK and SACM assume immutable databases; all existing offline/online PIR schemes require complete repreprocessing from scratch when the database mutates. IncPIR introduces *incremental preprocessing* that updates existing hints at cost proportional to the number of mutations m, not the database size n. The key technical contribution is an *incremental pseudorandom set* (PRS) that extends a compressed set representation to new database ranges without re-sampling from scratch. |
| **Superseded by** | IncrementalPIR (2026) [Group C] addresses single-server incremental preprocessing for SimplePIR but in a fundamentally different model (LWE-based, not XOR/set-based) |
| **Concurrent work** | Checklist [40] (Kogan and Corrigan-Gibbs, USENIX Security 2021) addresses additions via ORAM-inspired bucket splitting; fundamentally different approach |

[^1]: Section 4 (p.5): "We start by describing the CK protocol and then we describe our approach to make its preprocessing incremental."
[^2]: Section 6.3 (p.11): "Appendix E discusses how to make the SACM OO-PIR scheme [51] incremental with similar high-level ideas as those presented here, but with vastly different concrete mechanisms."

### Core Idea

IncPIR addresses the problem that all existing offline/online PIR schemes require complete repreprocessing when the database changes, which defeats the benefits of preprocessing for mutable databases.&#8201;[^3] The paper introduces *incremental preprocessing*: four new algorithms (DBUpd, HintReq, HintRes, HintUpd) that allow the client to update its existing hint h to reflect database additions, deletions, and in-place edits at a cost proportional to the number of mutations m rather than the database size n.&#8201;[^4] The core technical mechanism is an *incremental pseudorandom set* (PRS) that extends the range of a PRF/PRP-generated set from [n] to [n+m] by probabilistically replacing existing elements with new-range elements according to a hypergeometric distribution, storing only compact auxiliary information rather than explicit indices.&#8201;[^5] This enables the CK protocol's hints to remain valid after mutations without sacrificing security (every set remains a uniform random subset of the updated database range). For a batch of 10,000 updates on a 1M-item database, incremental preprocessing is 56x cheaper than preprocessing from scratch.&#8201;[^6]

[^3]: Abstract (p.1): "A major implicit assumption in all of the above works is that the PIR database is immutable."
[^4]: Definition 2 (p.3-4): Formal definition of incremental OO-PIR with eight algorithms.
[^5]: Section 5.2 (p.8): "Our goal is then to devise a procedure to extend the range of the PRS; in other words, to obtain S' in [n+m] by modifying, in expectation, only a handful of elements in S."
[^6]: Abstract (p.1): "the computational cost of updating the hints in our incremental CK scheme (iCK) for a batch of 10,000 updates (additions, deletions, edits) is 56x cheaper than preprocessing from scratch."

### Formal Definitions

- **Model name:** Incremental Offline/Online PIR (Definition 2, p.3-4)
- **Syntax:** Eight algorithms: four inherited from OO-PIR (Prep, Query, Resp, Recov) and four new (DBUpd, HintReq, HintRes, HintUpd)&#8201;[^4]
- **Security notion:** For all PPT adversaries A, max_{i,j in [n']} |Pr[A(P'(i))=1] - Pr[A(P'(j))=1]| <= negl(λ), where P'(i) includes IncPrep followed by Query (Definition 2, p.4)&#8201;[^7]
- **Correctness notion:** After applying IncPrep, the client recovers the correct item from the updated database D' with probability >= 1 - negl(λ) (Definition 2, p.4)&#8201;[^8]
- **Relationship to standard PIR:** Strict generalization of OO-PIR (Definition 1); an OO-PIR scheme is an incremental OO-PIR where IncPrep simply re-runs Prep from scratch

[^7]: Section 3.2, Security (p.4): Security definition for incremental OO-PIR.
[^8]: Section 3.2, Correctness (p.4): Correctness definition requires probability >= 1-negl(λ) after IncPrep + standard Query/Resp/Recov.

### Novel Primitives / Abstractions

#### Incremental Pseudorandom Set (PRS)

| Field | Detail |
|-------|--------|
| **Name** | Incremental Pseudorandom Set (Incremental PRS) |
| **Type** | Cryptographic primitive |
| **Interface / Operations** | Gen(1^λ, n) -> (k, aux): outputs set key and auxiliary info; Add(aux, m) -> aux': extends range by m; Eval(k, aux) -> S: outputs the set (Definition 4, p.8)&#8201;[^9] |
| **Security definition** | PPT adversary cannot distinguish S from a random size-s subset of [n] (or [n+m] after Add); security from PRP security&#8201;[^10] |
| **Correctness definition** | Eval(k, aux) outputs a set S in [n] of size s; after Add(aux, m), Eval(k, aux') outputs S' in [n+m] of size s&#8201;[^9] |
| **Purpose** | Compactly represent pseudorandom subsets whose range can be incrementally extended without re-sampling from scratch |
| **Built from** | PRP (pseudorandom permutation) over arbitrary domains; KDF (key derivation function) for deriving per-subrange keys&#8201;[^11] |
| **Standalone complexity** | Gen: O(λ); Add: O(1) auxiliary storage update; Eval: O(s) PRP evaluations (s = set size)&#8201;[^9] |
| **Relationship to prior primitives** | Extends CK's PRS (Definition 3, p.7) with the Add operation. Cannot be made puncturable (unlike CK's PRS) because PRP-based construction precludes puncturable PRP constructions&#8201;[^12] |

[^9]: Definition 4 (p.7-8): Formal definition of incremental PRS with Gen, Add, Eval.
[^10]: Theorem 6, Section A.3 (p.18): "Psi satisfies security."
[^11]: Section 5.3, Figure 1 (p.9): Construction of incremental PRS Psi using KDF-derived keys and PRP evaluation.
[^12]: Section 5.3 (p.9): "Unfortunately our construction does not preserve the puncturable property since we use a PRP instead of a PRF... there does not exist puncturable PRP constructions."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (for PRF, PRP, and KDF instantiation)&#8201;[^13] |
| **Encryption/encoding scheme** | None — no FHE; uses XOR-based parity computation on plaintext database entries |
| **Key structure** | Per-client: sqrt(n) * log(n) PRP keys (one per set), each derived via KDF from a master key; auxiliary information aux per set tracking subrange structure&#8201;[^14] |
| **Correctness condition** | Pr[fail] = O(1/sqrt(n)) per query due to puncturing failure; reducible to negl(λ) via Checklist's refinement (Appendix A.4.2)&#8201;[^15] |

[^13]: Section 8, Implementation (p.12): "We use AES to implement a PRF for small range, and then apply Patarin's proposal [49] to the PRF to build a secure PRP that has a small power-of-two range."
[^14]: Section 5.3 (p.9): aux = [(r_ell, t_ell)]_{ell in [L]} tracks subrange extents and element counts.
[^15]: Section 6.2 (p.11): "The proposed online phase does not meet our correctness definition because the client fails to puncture the set at index i with probability O(1/sqrt(n)) where n is the original database size."

### Key Data Structures

- **Database D:** Array of n items, each of size b bits, replicated across both offline and online servers&#8201;[^16]
- **Client hint h:** J = (n/s) * log(n) entries, each consisting of a set key k_j, auxiliary information aux_j, and a parity p_j = XOR_{e in S_j} D[e], where S_j has size s = sqrt(n)&#8201;[^17]
- **Update summary delta:** Triple (delta_add, delta_edit, delta_del) containing batch mutation descriptors — indices of added items, (index, old/new value) pairs for edits, and (index, old/random-mask) pairs for deletions&#8201;[^18]
- **Incremental PRS auxiliary info aux_j:** List of tuples [(r_ell, t_ell)]_{ell in [L]} where r_ell is the subrange size and t_ell is the number of elements selected from that subrange; L grows by 1 per Add invocation&#8201;[^14]
- **Client state:** Tuple (n', j*) tracking current database size and which set was last used for a query&#8201;[^19]

[^16]: Section 3.1 (p.3): "We consider a database D, which is replicated across both the offline and online servers and consists of n items of size b bits."
[^17]: Section 4.1 (p.5): Client hint structure after CK preprocessing.
[^18]: Figure 3 (p.10): DBUpd algorithm producing delta = (delta_add, delta_edit, delta_del).
[^19]: Figure 7 (p.11): "Client keeps state = (n', j*), where n' is the current database size, and j* indicates which set is currently used for query."

### Database Encoding

- **Representation:** Flat array D[1], ..., D[n], each entry b bits
- **Record addressing:** Direct index addressing; additions are appended to the end (D[n+1], ..., D[n+m])&#8201;[^20]
- **Preprocessing required:** None on the database itself; preprocessing produces client-side hints via XOR aggregation
- **Record size equation:** Each parity p_j = XOR_{e in S_j} D[e] has size b bits

[^20]: Section 3.3, Additions (p.4): "We aim to support databases where new items are appended to the end: if the initial database is of size n, then after m additions the database has size n+m."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Prep | Offline server + Client | Server generates J = sqrt(n)*log(n) random sets S_j of size sqrt(n), computes parities p_j = XOR_{e in S_j} D[e]; client stores (k_j, aux_j, p_j) | O(b*sqrt(n)*log(n)) bits downward | Once (initial) |
| DBUpd | Offline server | Groups mutations in op, produces D' and summary delta | delta sent to client | Per mutation batch |
| HintReq | Client | Processes delta: updates aux_j for additions; identifies affected sets for edits/deletions | u_q sent to offline server | Per mutation batch |
| HintRes | Offline server | For additions: computes EvalDiff (symmetric difference parity); for edits/deletions: computes parity of changed items in each affected set | u_r sent to client | Per mutation batch |
| HintUpd | Client | Updates parities: p_j <- p_j XOR p'_j for each affected set | -- (local) | Per mutation batch |
| Query | Client | Finds set S containing target index i; probabilistically removes i; sends remaining indices to online server | O(sqrt(n) * log(n')) bits upward | Per query |
| Resp | Online server | Computes XOR of D[e] for all e in the received set | b bits downward | Per query |
| Recov | Client | Recovers D[i] = p_S XOR r_i | -- (local) | Per query |
| Refresh | Client + Both servers | Generates new set, gets parity from offline server | O(sqrt(n) * log(n')) bits | Per query (amortized) |

### Two-Server Protocol Details

| Aspect | Server 1 (Offline) | Server 2 (Online) |
|--------|----------|----------|
| **Data held** | Full DB copy D (updated to D') | Full DB copy D (updated to D') |
| **Query received** | Update query u_q (set keys + aux for affected sets); refresh set indices | Query q_i (set indices with target removed) |
| **Computation** | EvalDiff for additions; parity computation for edits/deletions; parity for refresh sets | XOR of DB entries at received indices |
| **Security guarantee** | Computational (OWF) — sees only set keys and auxiliary info, never learns queried index&#8201;[^21] | Computational — sees a random-looking subset of sqrt(n)-1 indices, computationally indistinguishable from random&#8201;[^22] |
| **Non-collusion assumption** | Required — if servers collude, the offline server's knowledge of set structure combined with the online server's query reveals the target index&#8201;[^23] |

[^21]: Theorem 9 (p.18): Security proof for the incremental CK construction.
[^22]: Section 4.1 (p.5): "It is secure against the online server because q_i is a uniformly random subset of [n] of size sqrt(n)-1."
[^23]: Section 3.1 (p.3): "The servers are semi-honest: they do not collude but are interested in learning which objects the client is fetching from the database."

### Correctness Analysis

#### Option B: Probabilistic Correctness Analysis

| Field | Detail |
|-------|--------|
| **Failure mode** | (1) Puncturing failure: client fails to remove target index i from the set used for querying (probability O(1/sqrt(n))). (2) Coverage failure: target index i is not contained in any of the client's sets (probability grows as database grows via additions).&#8201;[^15] |
| **Failure probability** | Puncturing: O((s-1)/n') per query where s = sqrt(n), n' = current DB size. Coverage: (1 - s/n')^{n'/s} per set, approximately 1/e for one set; with J = sqrt(n)*log(n) sets, approximately 1/n overall.&#8201;[^24] |
| **Probability grows over queries?** | No — per-query probability is independent (each query uses a fresh set via refresh)&#8201;[^25] |
| **Probability grows over DB mutations?** | Yes — as the database grows from n to n+m, the probability that target index i appears in any set decreases because each set still has size s = sqrt(n) but the range expands to [n+m]&#8201;[^24] |
| **Key parameters affecting correctness** | Set size s = sqrt(n); number of sets J = (n/s)*log(n) = sqrt(n)*log(n); database growth ratio m/n |
| **Proof technique** | Hypergeometric tail bounds (HG(n+m, m, sqrt(n))) for the number of elements replaced per set during Add; union bound over sets for coverage&#8201;[^26] |
| **Amplification** | Checklist's refinement (Appendix A.4.2) doubles online query/refresh size but reduces puncturing error from O(1/sqrt(n)) to negl(λ)&#8201;[^27] |
| **Adaptive vs non-adaptive** | Non-adaptive (single-query definition; multiple queries discussed in Section 4.1 via refresh) |
| **Query model restrictions** | Each set used for at most one query, then refreshed; unlimited queries via refresh mechanism |

[^24]: Section 6.2, Failure probability (p.11): Concrete failure probability analysis with set size s = n^{1/2}.
[^25]: Section 4.1, Supporting multiple queries (p.5): Fresh set sampling via refresh ensures per-query independence.
[^26]: Section 4.2.1, batched additions (p.6): "the client samples a number w from the hypergeometric distribution HG(n+m, m, sqrt(n))."
[^27]: Section 6.2, Appendix A.4.2 (p.18): Checklist's modification doubles online communication but achieves negl(λ) correctness error.

#### Concrete failure probability examples

For a database of size 2^20 with sets of size 2^10:&#8201;[^24]
- Initially: failure probability approximately 10^{-7}
- After 2^10 additions: failure probability still approximately 10^{-7}
- After 2^18 additions: failure probability increases to approximately 10^{-6}

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (N=2^20, b=32B) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(sqrt(n) * log(n')) | 8.18 KB | Online |
| Response size | O(b) | 2 KB (optimal) | Online |
| Server computation (online) | O(sqrt(n)) XORs | < 0.1 ms | Online |
| Client computation (query) | O(sqrt(n) * log(n)) PRP evals | 7.87 ms | Online |
| Refresh communication | O(sqrt(n) * log(n')) | 8.18 KB | Online |

[^28]: Figure 9 (p.13): Microbenchmarks for N=2^20, b=32 bytes. Query 7.87 ms client, Response 0.06 ms server, Refresh 4.90 ms client.

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (N=2^20, b=32B) | Phase |
|--------|-----------|---------------------------|-------|
| Server preprocessing (Prep) | O(b * n * log(n)) | 58.67 sec server; 1.28 ms client | Offline (one-time) |
| Client hint download | O(b * sqrt(n) * log(n)) | 0.74 MB | Offline (per client) |
| IncPrep (1% batch) | O(b * m * log(n)) | 1.03 sec server; 3.96 sec client | Per mutation batch |
| IncPrep communication | O(b * sqrt(n) * log(n)) — sublinear in n' for edits/deletions; similar to Prep for additions | 0.76 MB (1% batch) | Per mutation batch |

[^29]: Figure 9 (p.13): Full microbenchmark table for three database sizes with 1% addition batch.

#### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Random-access (server and client both need to identify and access specific sets and DB entries) |
| **Client peak memory** | O(b * sqrt(n) * log(n)) — stores J = sqrt(n)*log(n) set keys, aux info, and parities |
| **Number of DB passes** | 1 for initial Prep; incremental updates do not require DB passes |
| **Hint refresh mechanism** | Incremental — IncPrep updates existing hints proportional to mutation count m |

#### Update metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per DB update (worst-case, additions) | O(b * m * log(n)) server computation&#8201;[^30] | Each set samples from HG distribution; all J sets potentially affected |
| Cost per DB update (amortized, additions) | O(b * log(n)) per addition | Amortized over m additions in a batch |
| Cost per DB update (edits/deletions) | O(b * m_edit * |Q|) or O(b * m_del * |Q|) | Q = number of affected sets; each affected set requires one parity XOR update |
| Communication per update | delta: O(m * b) bits; u_q: O(affected sets * aux size); u_r: O(|Q| * b) | Sublinear in n for edits/deletions; similar to Prep for additions&#8201;[^31] |
| Aggregation threshold | Re-preprocess from scratch when client storage exceeds threshold or failure probability exceeds tolerance | Client storage grows with each Add; refresh mechanism gradually resets aux&#8201;[^32] |
| Deletion semantics | Weak deletion (new clients cannot retrieve deleted items; existing clients could reconstruct via hint)&#8201;[^33] |
| Supported mutation types | Insert (append), Delete (replace with random mask), Modify (in-place edit)&#8201;[^34] |

[^30]: Theorem 10 (p.19): "the total computation to the offline server is in expectation O(bm log n)."
[^31]: Section 3.2, Non-triviality (p.4): "the size of the update summary delta, update query u_q, and update response u_r should be sublinear in n'."
[^32]: Section 6.2 (p.14): "the client can preprocess the database from scratch when the local storage becomes too high."
[^33]: Section 3.3, Weak deletion (p.4): "We relax the above definition to require only that new clients do not learn any deleted items."
[^34]: Section 3.3 (p.4): "We consider three types of mutations: addition of new objects, deletion of existing objects, and in-place edits that change the database's content but does not alter its size."

### Mutation Model

| Aspect | Detail |
|--------|--------|
| **Update types supported** | Insert (append to end), Delete (replace with random mask), Modify (in-place edit)&#8201;[^34] |
| **Who initiates updates** | Server (database operator) unilaterally applies mutations; notifies clients via delta&#8201;[^18] |
| **Consistency model** | Batched — mutations are grouped into a batch op; client updates hints once per batch&#8201;[^35] |
| **Impact on hints** | Additions: each set probabilistically gains/loses elements via hypergeometric sampling; all J sets affected. Edits: only sets containing the edited index need parity updates. Deletions: only sets containing the deleted index need parity updates, plus item is masked with random value.&#8201;[^36] |
| **Re-preprocessing trigger** | When client storage grows excessively from accumulated aux info, or when failure probability becomes too high due to database growth. Refresh mechanism (per-query set replacement) gradually reduces aux size as sets are regenerated from scratch.&#8201;[^32] |

[^35]: Definition 2 (p.3-4): "DBUpd(D, op) -> (D', delta), a deterministic algorithm executed by offline server that takes in the original database D, and a set of operations op."
[^36]: Section 4.2.2 (p.6): In-place edits — "the client only needs to update the parities of all of the sets that contain the index of the object that has changed." Section 4.2.3 (p.7): Deletions — "we handle deletions by replacing the data with a uniform random object r."

#### Strong vs Weak Deletion

The paper distinguishes two deletion semantics:&#8201;[^33]

**Strong deletion** guarantees that even clients who have never queried the deleted item cannot retrieve it after deletion. The paper proves this is impossible in OO-PIR schemes where hints are stored at the client: the hint implicitly encodes information about all objects, so a client can reconstruct deleted items using the hint and online queries to other items.&#8201;[^37]

**Weak deletion** guarantees only that *new* clients (who preprocess after the deletion) cannot retrieve deleted items. This is achievable: the server replaces the deleted item with a random mask r, and clients who join after deletion will have hints reflecting only the masked value.&#8201;[^33]

[^37]: Section 4.2.3, Deletion against malicious clients (p.7): "Indeed, secure deletion against malicious clients is impossible in CK... The client holds a set S that includes the index e and other indices. It uses the online server as an oracle to obtain each and every item at indices in S except for e."

### Composability

| Base Scheme | Integration Point | Improvement | Limitations |
|------------|-------------------|-------------|-------------|
| CK (Corrigan-Gibbs & Kogan) [^1] | Prep phase + new IncPrep phase using incremental PRS | 56x cheaper preprocessing for 10K updates on 1M DB; 2-4x speedup in hint update throughput&#8201;[^38] | Online communication increases from O(polylog(n)) to O(sqrt(n)) because incremental PRS is not puncturable&#8201;[^12]; client storage grows over time with accumulated aux info |
| SACM (Shi, Aqeel, Chandrasekaran, Maggs) [^2] | PRS replacement in SACM's set construction | Incremental updates for SACM's suffix-based PRS (Appendix E)&#8201;[^39] | Hint size is as large as the database for N=2^20; not yet practical&#8201;[^40] |
| PIR-Tor [^41] | CK-based directory server PIR | 7x throughput improvement over DPF-PIR baseline for Tor directory lookups&#8201;[^42] | Requires mutable relay database; limited to 2-server non-colluding model |

[^38]: Figure 9 (p.13): IncPrep takes 1.03 sec vs Prep at 58.67 sec for N=2^20 (approx 57x speedup).
[^39]: Appendix E (p.20): "we show how to adapt the PPRS in SACM to support our notion of incrementality and obtain our second construction of an incremental offline/online PIR scheme."
[^40]: Section 8 (p.12): "we also have a construction for incremental SACM but find that both the original and our incremental version are not yet useful in practice (for a database with 2^20 items, the size of the hints in both schemes is as large as the database)."
[^41]: Section 7 (p.12): PIR-Tor application with incremental OO-PIR.
[^42]: Section 1 (p.1): "an implementation of PIR-Tor that uses our iCK construction improves the throughput achieved by Tor directory nodes by roughly 7x over an implementation of PIR-Tor that uses a state-of-the-art 2-server PIR scheme."

### Performance Benchmarks

**Hardware:** CloudLab m510 machines (8-core 2 GHz Intel Xeon D-1548, 64 GB RAM), Ubuntu 20.04. Network: 20 ms latency, 1.1 Gbps throughput. Results averaged over 10 trials, standard deviations < 10% of mean.&#8201;[^43]

[^43]: Section 8, Evaluation testbed (p.12): Hardware and experimental setup.

#### Microbenchmarks (Figure 9, 1% addition batch, b=32 bytes)

| Metric | N = 2^16 | N = 2^18 | N = 2^20 |
|--------|----------|----------|----------|
| **Client CPU** | | | |
| Prep (ms) | 0.36 | 0.74 | 1.28 |
| Query (ms) | 3.93 | 6.48 | 7.87 |
| Refresh (ms) | 1.35 | 2.07 | 4.90 |
| IncPrep (sec) | 0.06 | 0.50 | 3.96 |
| **Server CPU** | | | |
| Prep (sec) | 3.64 | 14.52 | 58.67 |
| Resp (ms) | 0.02 | 0.04 | 0.06 |
| IncPrep (sec) | 0.07 | 0.25 | 1.03 |
| **Communication** | | | |
| Prep (MB) | 0.18 | 0.37 | 0.74 |
| Query (KB) | 2.04 | 4.09 | 8.18 |
| Refresh (KB) | 2.04 | 4.09 | 8.18 |
| IncPrep (MB) | 0.19 | 0.38 | 0.76 |

[^29]

#### Update cost comparison (N=2^20, b=32B)

| Operation | IncPrep Server | Prep from scratch Server | Speedup |
|-----------|---------------|-------------------------|---------|
| 1% additions | 1.03 sec | 58.67 sec | ~57x&#8201;[^38] |
| Edits/deletions | Cheaper than additions | 58.67 sec | > 57x (inferred) |

#### Throughput under load (Figure 10, approximate chart-derived values)

| Scheme | Online throughput (queries/sec) | Online latency at low load (ms) |
|--------|-------------------------------|-------------------------------|
| DPF-PIR baseline | ~600 (approximate) | ~50 (approximate) |
| CK (non-incremental) | ~800 (approximate) | ~40 (approximate) |
| Incremental CK | ~4000 (approximate) | ~10 (approximate) |

Incremental CK achieves approximately 6x higher throughput than DPF-PIR because it performs no cryptographic operations during the online phase (indices are sent in the clear).&#8201;[^44]

[^44]: Section 8.2 (p.13): "Compared to DPF-PIR, incremental CK improves the throughput achieved by roughly 6x. Since incremental CK performs no cryptography (the indices are sent in the clear), it achieves a higher throughput and lower latency."

#### PIR-Tor evaluation (7K Tor relays, b=2KB)

**Online communication (Figure 11a, approximate):**

| Scheme | Online query (KB) | Online response (KB) |
|--------|------------------|---------------------|
| DPF-PIR | ~0.5 (approximate) | ~2 (approximate) |
| CK | ~4 (approximate) | ~2 (approximate) |
| Incremental CK | ~6 (approximate) | ~2 (approximate) |

Response size is optimal (2 KB = one data element) for all three schemes.&#8201;[^45]

[^45]: Section 8.2 (p.13): "The size of each server's reply is optimal for all three schemes and consists of the size of a data element (2KB)."

**Offline communication (Figure 11b, log-scale, approximate):**

| Scheme | Prep query (KB) | Prep response (KB) | IncPrep query (KB) | IncPrep response (KB) |
|--------|-----------------|-------------------|--------------------|----------------------|
| CK | ~10^1 (approximate) | ~10^4 (approximate) | N/A | N/A |
| Incremental CK | ~10^1 (approximate) | ~10^4 (approximate) | ~10^2 (approximate) | ~10^3 (approximate) |

**Server computation over time (Figure 12a, 3-month Tor relay trace):**

Server computation for incremental updates is proportional to the number of relay additions per batch, and is significantly lower than re-preprocessing from scratch. Per-change server cost is approximately 0.2 sec; amortized cost approaches approximately 0.5 sec.&#8201;[^46]

[^46]: Figure 12a (p.14): Server computation costs over 90-day Tor relay update trace.

**Client storage growth (Figure 12b):**

Client local storage grows over time due to accumulated auxiliary information in the incremental PRS. Over 90 days, storage growth is less than 8% across all query frequencies tested (100, 200, 500 queries between updates). Higher query frequency reduces storage growth because refresh operations replace incremented sets with fresh ones.&#8201;[^47]

[^47]: Figure 12b (p.14): "the percentage of client storage growth is less than 8%" over 90 days.

### Application Scenarios

#### PIR-Tor (Section 7)

- **Application parameters:** ~7,000 Tor relays (growing over time), each relay descriptor ~2 KB. Clients query directory servers every 10-15 minutes.&#8201;[^41]
- **Deployment protocol:** Tor directory servers are split into offline and online roles; a server can be offline for one client and online for another. Client picks two random directory servers as offline/online pair.&#8201;[^48]
- **Privacy benefit:** PIR prevents directory servers from learning which relays a client is interested in, improving resistance to traffic analysis.
- **Cost analysis:** With p directory servers and adversary controlling q, security probability approximately (q/p)^2 per client.&#8201;[^49]
- **Why incremental PIR matters:** Tor relay database mutates continuously (relays join/leave); without incremental preprocessing, clients must re-preprocess every update cycle, negating the benefits of offline/online PIR.&#8201;[^41]

[^48]: Section 7, Assigning roles (p.12): "a server can act as an offline server for one client and an online server for another."
[^49]: Section 7 (p.12): "the security is compromised roughly (q/p)^2."

### Deployment Considerations

- **Database updates:** Incremental — IncPrep cost proportional to mutation count m, not database size n&#8201;[^30]
- **Sharding:** Not discussed; the 2-server model requires full DB replication
- **Key rotation / query limits:** No explicit limit; each set is refreshed after use, providing unlimited queries. Client storage grows slowly with accumulated aux info.
- **Anonymous query support:** No — client state (set keys, parities) ties queries to a specific client identity; hints are client-dependent
- **Session model:** Persistent client — client must maintain hint state across queries and updates
- **Cold start suitability:** No — requires full Prep phase (O(n) computation) before first query
- **Amortization crossover:** Incremental preprocessing is beneficial when mutation rate m is small relative to n; when database doubles or triples in size, re-preprocessing from scratch may be preferable&#8201;[^50]

[^50]: Section 1, Limitations (p.2): "Our incremental preprocessing schemes work best when the database changes slowly (e.g., a few percent of entries are added, deleted, or updated at a given time)."

### Key Tradeoffs & Limitations

- **Online communication regression:** Because incremental PRS is not puncturable, online query sends sqrt(n) indices in the clear rather than CK's polylog(n) communication via punctured PRF keys. In practice this is acceptable since b > 1 bit for real applications (Section 8).&#8201;[^12]
- **Client storage growth:** Auxiliary information aux accumulates with each Add invocation, growing client storage. Refresh mechanism gradually resets this, but storage still grows over time (< 8% over 90 days in evaluation).&#8201;[^47]
- **Weak deletion only:** Strong deletion is provably impossible for client-hint OO-PIR schemes. Existing clients can reconstruct deleted items from their hints.&#8201;[^37]
- **Not black-box:** The incremental technique requires modifying the internal structure of the base OO-PIR scheme (PRS replacement, hint update algorithms); it cannot be applied as a generic wrapper.&#8201;[^51]
- **Additions must be appended:** Insertions at arbitrary positions would change all subsequent indices, requiring full repreprocessing. Items can only be added to the end of the database.&#8201;[^20]
- **Keyword PIR incompatibility:** Incremental preprocessing combined with keyword PIR (where clients query by keyword rather than index) remains an open problem because mutations may change keywords or add new keywords, disrupting the underlying search data structure.&#8201;[^52]

[^51]: Section 3.4 (p.5): "our approach is not black-box. Instead, it requires exploiting the structure of the underlying OO-PIR protocol."
[^52]: Section 9 (p.14): "it is unclear how to support incremental preprocessing and PIR-by-keywords given that mutations that changes the keywords of existing items or add new keywords would impact the underlying search data structure."

### Comparison with Prior Work

| Metric | Incremental CK (this paper) | CK [23] (non-incremental) | DPF-PIR [30,1] |
|--------|------------|----------------|----------------|
| Online query size | O(sqrt(n) * log(n')) — indices in clear | O(polylog(n)) — punctured PRF key | O(λ) — DPF key |
| Online response size | O(b) — optimal | O(b) — optimal | O(b) — optimal |
| Online server computation | O(sqrt(n)) XORs | O(sqrt(n)) XORs | O(n) — full DB scan |
| Preprocessing server computation | O(b * n * log(n)) | O(b * n * log(n)) | None |
| IncPrep server computation | O(b * m * log(n)) | O(b * n * log(n)) (full repreprocessing) | N/A |
| Client storage | O(b * sqrt(n) * log(n)) + growing aux | O(b * sqrt(n) * log(n)) (via PPRS) | O(1) |
| Mutation support | Insert, Delete, Modify | None (immutable) | None (immutable) |
| DB params | N=2^20, b=32B | N=2^20, b=32B | N=2^20, b=32B |

**Key takeaway:** IncPIR is the scheme of choice for 2-server non-colluding PIR deployments where the database mutates at a moderate rate (a few percent per update cycle). The 56x preprocessing speedup over CK comes at the cost of increased online communication (indices in the clear vs. punctured keys) and weak-only deletion semantics. For static databases, non-incremental CK or DPF-PIR remain preferable depending on whether preprocessing cost or online communication is the binding constraint.

### Portable Optimizations

- **Hypergeometric sampling for set extension:** The technique of sampling w from HG(n+m, m, s) to determine how many elements to replace when extending a set's range from [n] to [n+m] is applicable to any PIR scheme using pseudorandom subsets (Piano, RMS24, TreePIR). It provides a rigorous way to maintain uniformity of set membership after range extension.&#8201;[^26]
- **PRP-from-PRF for arbitrary domains:** The chain PRF -> small-domain PRP (Patarin [49]) -> arbitrary-domain PRP (Black-Rogaway [9]) is a practical recipe for building PRPs over non-power-of-two domains, useful in any scheme requiring random permutations over database indices.&#8201;[^13]
- **KDF-based key derivation for subranges:** Using a KDF to derive per-subrange keys from a master key (Section 5.3) provides a clean separation between the original set and its extensions, preventing correlations between PRPs operating on different ranges.&#8201;[^53]
- **Weak deletion via random masking:** Replacing deleted items with random masks and using the in-place edit mechanism to update hints is a simple technique applicable to any XOR-parity-based hint system.&#8201;[^36]

[^53]: Section 5.2, Complications (p.8): "we use a different key for each of the PRPs... the original set key k becomes a master key used to derive keys k_1 and k_2 by a key derivation function KDF."

### Implementation Notes

- **Language / Library:** C++ (~2,000 lines)&#8201;[^54]
- **Polynomial arithmetic:** N/A (no FHE; XOR-based parity computation)
- **PRP construction:** AES for PRF over small range -> Patarin's Feistel construction [49] for small-domain PRP -> Black-Rogaway [9] cycle walking for arbitrary-domain PRP&#8201;[^13]
- **Puncturable PRF (CK baseline):** GGM construction [32] with breadth-first expansion for evaluating at continuous points 1, 2, ..., s&#8201;[^55]
- **Hypergeometric sampling:** Multiple Bernoulli samplings&#8201;[^55]
- **SIMD / vectorization:** Not mentioned
- **Parallelism:** Single-threaded per query; evaluation uses 8-core machines but parallelism model not specified
- **Open source:** DPF library at https://github.com/dkales/dpf-cpp [1]; IncPIR implementation not explicitly linked

[^54]: Section 8, Implementation (p.12): "Our incremental CK implementation is ~2,000 lines of C++."
[^55]: Section 8, Implementation (p.12): "We generate the hypergeometric sampling for hint updates using multiple Bernoulli samplings."

### Open Problems

- **Puncturable incremental PRS:** Designing an incremental PRS that preserves puncturability would restore CK's polylog online communication while maintaining incremental preprocessing. "Designing a puncturable incremental PRS is an interesting open question."&#8201;[^12]
- **Single-server incremental preprocessing:** This paper addresses only two-server schemes. "designing efficient incremental preprocessing for single-server PIR remains an open question (existing schemes rely on obfuscation)."&#8201;[^52]
- **Keyword PIR with incremental preprocessing:** Supporting mutations that change keywords or add new keywords without disrupting the search data structure is unresolved.&#8201;[^52]
- **Server-side hint storage:** Extending incremental preprocessing to schemes where hints are stored at the servers (e.g., Beimel et al. [8]) remains open.&#8201;[^56]

[^56]: Section 9 (p.14): "Since our incremental preprocessing is not black-box, it remains to be seen how to apply it to schemes where the hints are kept at the servers."

### Related Papers in Collection

- **CK (Corrigan-Gibbs & Kogan, 2020) [Group D]:** Base scheme that IncPIR makes incremental. CK introduces the offline/online model with puncturable pseudorandom sets.
- **SACM (Shi et al., 2021) [Group D]:** Alternative base scheme; IncPIR provides an incremental version in Appendix E, but it is not yet practical.
- **Checklist (Kogan & Corrigan-Gibbs, 2021) [Group D]:** Concurrent work addressing database additions via ORAM-inspired bucket splitting. Fundamentally different approach: Checklist uses exponentially-growing buckets and requires the client to query log(n) buckets.
- **Piano (2023) [Group D]:** Later single-server sublinear PIR with PRF-based sets; could potentially benefit from IncPIR's hypergeometric set extension technique.
- **IncrementalPIR (2026) [Group C]:** Later work addressing incremental preprocessing for SimplePIR in the single-server model; cites IncPIR as inspiration for the multi-server incremental definition.

### Uncertainties

- **n vs N notation:** The paper uses n for database size (number of items) throughout. This is consistent within the paper but differs from some other papers in the collection that use N.
- **Cycle walking cost:** The paper notes (Section 8) that PRP evaluation for non-power-of-two ranges is more expensive due to cycle walking [9], making IncPrep computation "not strictly linear in the number of additions." The exact overhead is not quantified.
- **SACM practicality:** The paper states SACM's incremental version is "not yet in practice" with hints as large as the database at N=2^20 [^40], but does not provide concrete benchmarks for incremental SACM.
- **Figure 10, 11, 12 values:** All values extracted from charts are approximate (marked accordingly). The paper does not provide tabular data for these figures.
- **Failure probability parameter J:** The paper chooses J such that failure probability is approximately 10^{-6} but does not specify the exact formula used for this calibration in the evaluation section (the theoretical analysis in Section 6.2 uses J = sqrt(n)*log(n)).
