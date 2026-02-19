# SinglePass — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Single Pass Client-Preprocessing Private Information Retrieval](https://eprint.iacr.org/2024/303) (2024) |
| **Archetype** | Construction |
| **PIR Category** | Group D — Client-Dependent Preprocessing |
| **Security model** | 2-server non-colluding (semi-honest, at least one server honest) |
| **Additional assumptions** | PRG security (for seed-compressed permutations); information-theoretic correctness and security against each server individually |
| **Correctness model** | Deterministic |
| **Rounds (online)** | 1 (client sends q_0, q_1 to servers; each server responds with A_b) |
| **Record-size regime** | Moderate (512–2048 bytes in benchmarks) |

## Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Checklist [Group D] (Kogan & Corrigan-Gibbs, USENIX Security 2021); CK20 [Group D] (Corrigan-Gibbs & Kogan, EUROCRYPT 2020) for the client-preprocessing PIR model; Fisher-Yates shuffle (Durstenfeld 1964, Fisher & Yates 1963, Knuth 1969) |
| **What changed** | Prior client-preprocessing schemes (Checklist, TreePIR, MIR, Piano) require preprocessing proportional to lambda * N database accesses because they sample lambda * sqrt(N) independent pseudorandom subsets. SinglePass replaces pseudorandom subsets with random permutations via Fisher-Yates shuffle, achieving preprocessing in O(N) time with a single linear pass over the database, eliminating the lambda factor.[^1] |
| **Superseded by** | N/A |
| **Concurrent work** | MIR (Mughees, Ren; 2023) — also a 2-server client-preprocessing scheme, benchmarked against[^2] |

[^1]: Abstract (p.1): "we propose the first client-preprocessing PIR scheme with 'single pass' client-preprocessing... it requires exactly one linear pass over the database. This is in stark contrast with existing works, whose preprocessing is proportional to lambda * N."
[^2]: Section 4 (p.10): MIR [30] is listed as one of three novel state-of-the-art client preprocessing PIR schemes benchmarked against.

## Core Idea

SinglePass addresses the fundamental bottleneck of client-preprocessing PIR: existing schemes require lambda * N database accesses during preprocessing (where lambda = 128 is the security parameter), making the offline phase roughly 128x slower than necessary. The paper replaces the standard approach of sampling lambda * sqrt(N) independent pseudorandom subsets with Q random permutations over chunks of size m = N/Q, generated via Fisher-Yates shuffle from a single PRG seed.[^3] Each column j of the permutation matrix yields a hint h_j = XOR of DB_i[p_i(j)] for i in [Q], and the client stores these hints alongside the permutations. Because the permutations are generated from a compact seed, the preprocessing is a single linear pass over the database in O(N * w) time.[^4] The "Show and Shuffle" lemma (Lemma 3.1) proves that after each query, performing a random swap on each permutation produces a distribution identical to freshly sampled permutations, enabling unlimited queries with deterministic correctness and perfect security against each server individually.[^5]

[^3]: Section 1 (p.2): "Our contribution: PIR preprocessing in a single pass... the preprocessing performs one linear pass over the database, operating on each element exactly once."
[^4]: Theorem 3.1 (p.8–9): Hint runs in O(N * w) time and outputs a hint of size (N/Q) * w bits.
[^5]: Lemma 3.1 (p.7): "Show and Shuffle Perfect Indistinguishability... for any adversary A, for any L, K in N: Pr[SaS_{A,L,K} -> 1] = 1/2."

## Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Show and Shuffle game |
| **Type** | Security abstraction |
| **Interface / Operations** | Parametrized by L, K in N. Adversary picks (l, k), sees L permutations partially revealed (one value replaced with random), then must distinguish swapped permutations from freshly sampled ones. |
| **Security definition** | Perfect indistinguishability: Pr[SaS -> 1] = 1/2 for any adversary (Lemma 3.1, p.7)[^6] |
| **Correctness definition** | N/A (security game, not a primitive) |
| **Purpose** | Models exactly one round of the PIR query: after showing one element from each permutation and performing a random swap, the resulting permutations are uniformly distributed — enabling inductive security across unlimited queries[^7] |
| **Built from** | Uniform random permutations |
| **Standalone complexity** | N/A |
| **Relationship to prior primitives** | Novel to this paper. Replaces the puncturable/invertible PRF approach used in CK20/Plinko/TreePIR. Information-theoretic — no cryptographic assumption needed for this component. |

[^6]: Lemma 3.1 (p.7): The Show and Shuffle game achieves perfect indistinguishability (probability exactly 1/2) for any adversary.
[^7]: Section 3.1 (p.6–7): "This experiment models exactly one round of our PIR query, and will help us show that after each query, the resulting state of the client's hint is completely uniform."

## Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | PRG security (implied by OWF) — used only for seed-compressed permutation representation. The correctness and the core Show-and-Shuffle security argument are information-theoretic.[^8] |
| **Key structure** | Per-client PRG seed q_h for generating Q permutations via Fisher-Yates shuffle. Each permutation p_i is over domain [N/Q]. Client stores expanded permutations (and optionally their inverses) after preprocessing.[^9] |
| **Correctness condition** | Deterministic — by construction, the hint h_{ind} XORed with the Q-1 non-target elements from Server 1's answer always yields DB[x].[^10] |

[^8]: Section 2.2.1 (p.5): "Unlike previous schemes, [PRFs] will not be necessary to argue security." The PRG is only used for compressing the randomness to generate the permutations.
[^9]: Appendix A (p.16): "the client can store only the seed used for the permutations... by Lemma 2.1 this would require Query to run in O(N) time." Alternatively, storing expanded permutations gives O(Q) query time.
[^10]: Appendix A, Correctness proof (p.17): "Follows by construction... h_j = XOR_{i in Q} DB_i[p_i(j)], so XOR_{i != i*} A_1[i] XOR h_{ind} = DB_{i*}[j*] = DB[x]."

## Key Data Structures

- **Database partitioning:** DB is an array of N elements of size w bits, partitioned into Q chunks DB_0, ..., DB_{Q-1} of m = N/Q elements each. DB_i = DB[i*m : (i+1)*m].[^11]
- **Permutations:** Q permutations p_0, ..., p_{Q-1}, each a permutation of [m] = [N/Q], generated via Fisher-Yates shuffle from a PRG seed. Stored in expanded form (or as seed + O(N) re-expansion).[^12]
- **Hint array:** m values h_0, ..., h_{m-1}, each of w bits, where h_j = XOR_{i in [Q]} DB_i[p_i(j)]. This is the column-wise XOR across all Q chunks under the permuted indices.[^13]
- **Client keys (ck):** The Q permutations {p_i}_{i in [Q]}. Updated in-place after each query via swap operations.[^14]
- **Client state total:** O(N log N + (N/Q) * w) bits — the permutations (N indices, each log N bits) plus the hint (m = N/Q entries of w bits).[^15]

[^11]: Figure 3 (p.9): "Let DB be an array of N elements of size w. For i in [Q], let DB_i = DB[i*m : (i+1)*m]."
[^12]: Section 2.2.2 (p.5–6): Permutations generated by Fisher-Yates shuffle in O(N) time total via Lemma 2.1.
[^13]: Figure 3, Hint algorithm (p.9): h_j = XOR_{i=0}^{Q-1} DB_i[p_i(j)] for j in [m].
[^14]: Figure 3, Query step 5 (p.9): "For i in [Q], i != i*, swap p_i(ind) and p_i(r_i)."
[^15]: Theorem 3.1 (p.9 and p.16): "The client stores a state with O(N log N + (N/Q) * w) bits."

## Database Encoding

- **Representation:** Flat array of N elements of w bits, logically partitioned into Q sub-arrays of m = N/Q elements each.
- **Record addressing:** Two-level index x = (i*, j*) where i* in [Q] identifies the chunk and j* in [m] identifies the position within the chunk. The global index maps as i* = floor(x / m), j* = x mod m.[^16]
- **Preprocessing required:** None on the server side. The server holds DB in plaintext. All preprocessing is client-side (permutation generation + hint computation via one streaming pass).[^17]

[^16]: Figure 3, Query step 1 (p.9): "Parse x = (i*, j*). Find ind in [m] such that p_{i*}(ind) = j*."
[^17]: Section 1 (p.1): "such approaches store no additional bits per client at the server."

## Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| **Hint (Preprocessing)** | Server 0 + Client | Server 0 generates Q permutations via Fisher-Yates shuffle from PRG seed q_h, computes hints h_j = XOR_{i in [Q]} DB_i[p_i(j)], sends (q_h, h) to client | Seed + (N/Q) * w bits ↓ | Once per session |
| **Query** | Client | Parse x = (i*, j*), find ind = p_{i*}^{-1}(j*), build S_query (Q elements for Server 1) and S_refresh (Q elements for Server 0), swap permutations | Q elements ↑ to each server | Per query |
| **Answer** | Server 0 + Server 1 | Each server looks up Q elements from DB by the indices in q_b, returns A_b | Q * w bits ↓ from each server | Per query |
| **Reconstruct** | Client | DB[x] = XOR_{i in [Q], i != i*} A_1[i] XOR h_{ind}; then update hints using A_0 and A_1 | — | Per query |

## Two-Server Protocol Details

| Aspect | Server 0 | Server 1 |
|--------|----------|----------|
| **Data held** | Full DB copy | Full DB copy |
| **Role in preprocessing** | Generates permutations (from PRG seed q_h), computes hints, sends (q_h, h, ck) to client[^18] | None |
| **Query received** | S_refresh = [p_i(r_i) : i in [Q]] — Q random indices, one per chunk[^19] | S_query — Q indices: for chunk i != i*, sends p_i(ind); for chunk i*, sends a replacement random element r*[^20] |
| **Computation** | Look up Q elements DB_i[S_refresh[i]] and return as A_0 | Look up Q elements DB_i[S_query[i]] and return as A_1 |
| **Security guarantee** | Computational (PRG security for seed compression; information-theoretic if true randomness used)[^21] | Information-theoretic (each query is Q uniform random elements of [N/Q], perfectly indistinguishable via Show-and-Shuffle)[^22] |
| **Non-collusion assumption** | Required — neither server learns the other's query share |

[^18]: Figure 3 (p.9): Hint algorithm is run by Server 0, producing (ck, h) for the client.
[^19]: Figure 3, Query step 4–5 (p.9): S_refresh = [p_i(r_i) : i in [Q]], where r_i are sampled uniformly from [N/Q].
[^20]: Section 1.2 (p.3): "we send the column that ind belongs to to Server 1, replacing p_1(2) with a random element."
[^21]: Appendix A (p.17): Server 0 privacy relies on PRG security; each q_0 = S_refresh consists of Q uniform random elements of [N/Q], independent of the query.
[^22]: Appendix A (p.17) and Appendix B (p.17–19): Server 1 privacy proved via hybrid argument using Show-and-Shuffle indistinguishability (Lemma 3.1).

## Correctness Analysis

### Option C: Deterministic Correctness

Deterministic correctness — the scheme always returns the correct answer by construction. Each hint h_j = XOR_{i in [Q]} DB_i[p_i(j)], so for a query to index x = (i*, j*) with ind = p_{i*}^{-1}(j*), Server 1 returns A_1 containing DB_i[p_i(ind)] for i != i* (and a random element for chunk i*). The client computes XOR_{i != i*} A_1[i] XOR h_{ind} = XOR_{i != i*} DB_i[p_i(ind)] XOR XOR_{i in [Q]} DB_i[p_i(ind)] = DB_{i*}[p_{i*}(ind)] = DB_{i*}[j*] = DB[x].[^23]

[^23]: Appendix A, Correctness (p.17): "After a correct preprocessing... h_j = XOR_{i in Q} DB_i[p_i(j)]... XOR_{i != i*} A_1[i] XOR h_{ind} = DB_{i*}[j*] = DB[x]."

The key invariant maintained across queries is that after the swap operations in Reconstruct, each hint h_j still equals XOR_{i in [Q]} DB_i[p_i(j)] under the updated permutations. The swap h_k = h_k XOR DB_i[p_i(k)] XOR DB_i[p_i(v)] correctly accounts for the element being removed and added at position k.[^24]

[^24]: Appendix A (p.17): "for each swap between p_i(k) and p_i(v), we let h_k = h_k XOR DB_i[p_i(k)] XOR DB_i[p_i(v)], effectively removing the old element from this hint's position and adding the new one."

## Complexity

### Core metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (total, both servers) | O(Q * w) | 0.68 KB (3M x 32B DB, Q=10)[^25] | Online |
| Response size (total, both servers) | O(Q * w) | (same order as query) | Online |
| Server computation | O(Q) per server (Q lookups) | — | Online |
| Client computation (Query) | O(Q) | 0.02 ms[^26] | Online |
| Client computation (Reconstruct) | O(Q * w) | — | Online |

[^25]: Table 2 (p.15): SinglePass query bandwidth = 0.68 KB for 3M x 32B updatable database.
[^26]: Table 2 (p.15): SinglePass query time = 0.02 ms for 3M x 32B updatable database.

### Preprocessing metrics

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Server preprocessing (Hint) | O(N * w) | 0.122 s (3M x 32B)[^27] | Offline (once per session) |
| Client hint download ↓ | O((N/Q) * w) | 23.3 MB (3M x 32B)[^28] | Offline (per client) |
| Client offline upload ↑ | — | — | — |
| Server per-client storage | 0 (server stores only DB)[^29] | 0 | Persistent |
| Client persistent storage | O(N log N + (N/Q) * w) | 23.3 MB (3M x 32B)[^30] | — |

[^27]: Table 2 (p.15): SinglePass preprocessing time = 0.122 s for updatable database of 3M x 32B elements.
[^28]: Table 2 (p.15): SinglePass client size = 23.3 MB for 3M x 32B updatable database.
[^29]: Theorem 3.1 (p.9): "The server stores only DB."
[^30]: Table 2 (p.15): Client storage 23.3 MB; this includes both the hint array and the expanded permutations.

### Preprocessing Characterization

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | Streaming (single-pass) |
| **Client peak memory** | O(N log N + (N/Q) * w) — dominated by the expanded permutations[^31] |
| **Number of DB passes** | 1[^32] |
| **Hint refresh mechanism** | In-place update via swap (per-query hint maintenance); full re-download not needed for unlimited queries |

[^31]: Theorem 3.1 (p.16): Client stores the permutations (N entries of log N bits each) and the hint (N/Q entries of w bits each).
[^32]: Abstract (p.1): "it requires exactly one linear pass over the database."

### Update metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per DB edit (worst-case) | O(1) — one permutation inverse lookup + one XOR | h_k = h_k XOR DB[x]_old XOR DB[x]_new[^33] |
| Cost per DB addition (amortized) | O(1) amortized | Every N/Q additions, a new permutation must be sampled in O(N/Q) time; individual additions are O(1)[^34] |
| Update time (batch of 500) | 0.19 ms (3M x 32B)[^35] | |
| Supported mutation types | Edit, Add, Delete (delete = edit to zero)[^36] | |

[^33]: Section 5 (p.11): "the client can update its hint by simply updating h_k = h_k XOR DB[x]_old XOR DB[x]_new, after calculating k. Since all these steps take constant time, editing takes constant time."
[^34]: Section 5 (p.11): "We first sample a new permutation p_Q... Note that we only have to sample the permutation once for every N/Q additions, and sampling the permutation takes O(N/Q) time. Every subsequent addition takes O(1) time."
[^35]: Table 2 (p.15): SinglePass update time = 0.19 ms for a batch of 500 updates.
[^36]: Section 5 (p.11): "We also define a deletion to be an edit where DB[x]_new equals 0 (or a special delete value)."

## Performance Benchmarks

**Static database (session-based scenario):** Benchmarked on AWS EC2 t2.2xlarge, single thread. Implementation: approximately 300 lines of Go + 150 lines of C, extending the Checklist PIR framework.[^37] Compared against Checklist, TreePIR, MIR, and DPF (state-of-the-art two-server PIR without preprocessing). Tests normalized by client storage — Q chosen so SinglePass uses comparable client storage to each competitor.[^38]

[^37]: Section 4 (p.10): "Our static scheme is implemented in only about 300 lines of Go code and 150 lines of C code, as an extension to the existing PIR framework from Checklist."
[^38]: Section 4 (p.10): "we normalize the tests by client storage... we can benchmark the performance of the schemes when given similar client resources."

**Key findings from Figure 4 (total end-to-end time, 1M x 512B static DB):**[^39]
- SinglePass beats DPF (no preprocessing) after just 2 queries (approximate, from chart)
- Other schemes (Checklist, TreePIR, MIR) require 50+ queries to beat DPF
- SinglePass total end-to-end time at 2 queries is approximately 0.5 s vs approximately 5–10 s for Checklist/TreePIR/MIR (approximate, from chart on log scale)

[^39]: Figure 4 (p.10): "Results show that whereas other schemes start beating DPF after 50+ queries, the total end-to-end time of SinglePass is already better even when performing two queries."

**Updatable database benchmark (Table 2, 3M x 32B):**

| Scheme | Preprocessing Time (s) | Query Time (ms) | Query BW (KB) | Client Size (MB) | Update Time (ms) |
|--------|----------------------|----------------|--------------|-----------------|-----------------|
| **SinglePass** | 0.122 | 0.02 | 0.68 | 23.3 | 0.19 |
| Checklist | 13.22 | 0.95 | 1.48 | 23.6 | 3.78 |

(exact, from Table 2)[^40]

[^40]: Table 2 (p.15): "Comparison for Updatable Database with 3,000,000 32-byte elements. The update time is for a batch of 500 updates."

**Appendix C normalized-by-query-time benchmarks (approximate, from charts):**[^41]
- When normalized by number of server operations (fixing query time), SinglePass achieves 50–100x better preprocessing time and approximately 80x better storage
- Query bandwidth is higher (150 KB–3 MB range) but authors note "3MB is the size of an average web page"

[^41]: Appendix C (p.19): "SinglePass achieves 50-100x better preprocessing time and approximately 80x better storage across the board, with similar query time."

## Application Scenarios

- **Private encyclopedia service:** The primary application scenario motivating the benchmarks. A user browses a private encyclopedia website, performs a short session of queries, then leaves. Fast preprocessing is critical because it happens "on demand" when the user arrives.[^42]
- **Private blocklist lookups:** Mentioned as a deployment scenario from Checklist. The updatable variant of SinglePass is benchmarked against Checklist's blocklist parameters (3M x 32B elements, batches of 500 updates).[^43]
- **Session-based PIR:** SinglePass is particularly suited for "session-based" use cases where the client preprocesses on demand, issues a small number of queries, and then discards the state. The preprocessing cost is approximately equal to a single non-preprocessing PIR query, so the scheme "breaks even" after just 1–2 queries.[^44]

[^42]: Section 4 (p.10): "The choice of parameters picked throughout the section reflect a sample use case of a private encyclopedia service, where a user would browse to a private encyclopedia website, access a couple of articles privately, and afterwards leave."
[^43]: Table 2 (p.15): "we provide a benchmark of SinglePass and Checklist for the blocklist application studied in Checklist."
[^44]: Section 1 (p.2): "our scheme does not require the client to perform offline computation for extended periods of time... the first query runs at approximately the cost of a single PIR query for a non-preprocessing PIR scheme."

## Deployment Considerations

- **Database updates:** O(1) edits and O(1) amortized additions. Server streams changes to client; client updates hint locally. No re-preprocessing required.[^45]
- **Sharding:** Not discussed.
- **Key rotation / query limits:** Unlimited queries per session. The Show-and-Shuffle mechanism maintains security for any number T of adaptive queries.[^46]
- **Anonymous query support:** No — client state is personalized (client-dependent preprocessing). Client identity is revealed by the preprocessing relationship.
- **Session model:** Session-based. Client preprocesses, issues queries, and can discard state. Also supports persistent sessions for updatable databases.
- **Cold start suitability:** Excellent — preprocessing is O(N) (single DB pass), roughly the cost of one non-preprocessing PIR query. Other schemes require O(lambda * N) preprocessing.[^47]
- **Keyword PIR support:** Not native (index-based only). Can be reduced to keyword PIR via cuckoo hashing with approximately 2x overhead.[^48]

[^45]: Section 5 (p.11): Edit and Add algorithms run in O(1) time.
[^46]: Theorem 3.1 (p.8): Security holds "for any N(lambda), T(lambda) in N" (any polynomial number of queries).
[^47]: Section 1 (p.1): "the preprocessing roughly equals the cost of a single PIR query for a non-preprocessing PIR scheme."
[^48]: Footnote 6 (p.13): "our single pass scheme is a pure PIR scheme that only supports index queries. However, using cuckoo hashing it could be translated to a keyword PIR scheme with a 2x overhead."

## Key Tradeoffs & Limitations

- **Client storage scales linearly with N:** Client storage is O(N log N + (N/Q) * w), which is linear in N. However, the lambda factor is eliminated, so for practical parameters (w = 1024 bytes, Q = sqrt(N), lambda = 128), SinglePass storage is smaller than Checklist's O(N log N + lambda * sqrt(N) * w) for N greater than approximately 1 billion.[^49]
- **Query bandwidth grows with Q:** Query bandwidth is O(Q * w), higher than Checklist's O(log(N) * (lambda * log(N) + w)). This is the main cost paid for faster preprocessing.[^50]
- **Two-server model required:** Unlike Piano (single-server), SinglePass requires two non-colluding servers.[^51]
- **Permutation storage:** The expanded permutations require N * log(N) bits. This can be reduced by storing only the PRG seed, but then Query time increases from O(Q) to O(N) since the permutations must be re-expanded for each query.[^52]

[^49]: Section 1 (p.2): "for a word size of 1024 bytes, Q = sqrt(N), lambda = 128 our storage is only worse than the client storage for previous schemes for N greater than one billion elements."
[^50]: Table 1 (p.2): SinglePass query bandwidth is O(Q * w) vs Checklist's O(log(N) * (lambda * log(N) + w)).
[^51]: Section 2.1 (p.4): "Throughout this work, we will operate entirely over the two server model."
[^52]: Appendix A, Footnote 7 (p.16): "We can store the inverse along with the permutation with constant overhead. In practice, for some scenarios, it might be beneficial to not store the inverse in order to save space."

## Comparison with Prior Work

### Asymptotic comparison (Table 1, exact)

| Metric | SinglePass | Checklist |
|--------|-----------|-----------|
| Preprocessing time | O(N) | O(lambda * N) |
| Query time | O(Q) | O(sqrt(N)) |
| Query BW | O(Q * w) | O(log(N) * (lambda * log(N) + w)) |
| Client storage | O(N log N + (N/Q) * w) | O(N log N + lambda * sqrt(N) * w) |
| Update time | O(1) | O(log N) |

Q is a tunable parameter in [N] controlling the tradeoff between query time and storage.[^53]

[^53]: Table 1 (p.2): "Q in [N] is a parameter that determines query time and size, along with storage."

### Concrete comparison (Table 2, 3M x 32B updatable DB, exact)

| Metric | SinglePass | Checklist |
|--------|-----------|-----------|
| Preprocessing time | 0.122 s | 13.22 s |
| Query time | 0.02 ms | 0.95 ms |
| Query BW | 0.68 KB | 1.48 KB |
| Client size | 23.3 MB | 23.6 MB |
| Update time (batch 500) | 0.19 ms | 3.78 ms |

**Key takeaway:** SinglePass achieves 100x faster preprocessing, 47x faster queries, and 19x faster updates compared to Checklist at comparable client storage, at a modest cost of lower query bandwidth efficiency. It is ideal for session-based scenarios where preprocessing must be fast and the number of queries may be small (as few as 1–2).

## Portable Optimizations

- **Permutation-based hint construction:** Replacing independent pseudorandom subsets with random permutations over database chunks eliminates the lambda factor from preprocessing. This technique could apply to any client-preprocessing PIR scheme that currently uses pseudorandom sets.[^54]
- **Show-and-Shuffle state refresh:** The swap-based hint refresh mechanism (replace one permutation entry with a random swap after each query) is a general technique for maintaining uniform permutation distributions across adaptive queries. It avoids the need for re-sampling or puncturable PRFs.[^55]
- **O(1) update via permutation inverse:** Since each database element appears in exactly one hint (determined by the permutation inverse), edits require updating exactly one hint entry. This is inherently cheaper than schemes where each element appears in sqrt(N) independent sets.[^56]

[^54]: Section 1 (p.2): "the preprocessing roughly equals the cost of a single PIR query" — achieved by the permutation approach rather than independent random subsets.
[^55]: Lemma 3.1 (p.7): Show and Shuffle perfect indistinguishability enables unlimited queries without hint degradation.
[^56]: Section 5 (p.11): "our new single pass PIR scheme only preprocesses each element exactly once. Since our hint only consists of a single (partitioned) permutation of the database, we can update the hint data structure in O(1) time."

## Implementation Notes

- **Language / Library:** Go (approximately 300 lines) + C (approximately 150 lines), built as an extension to the Checklist PIR framework[^57]
- **Polynomial arithmetic:** N/A (no FHE; purely XOR-based)
- **SIMD / vectorization:** Not mentioned
- **Parallelism:** Single-threaded in benchmarks[^58]
- **Benchmark hardware:** AWS EC2 t2.2xlarge instance[^59]
- **Open source:** Not explicitly linked in the paper

[^57]: Section 4 (p.10): "Our static scheme is implemented in only about 300 lines of Go code and 150 lines of C code, as an extension to the existing PIR framework from Checklist."
[^58]: Section 4 (p.10): "All schemes are run on a single thread."
[^59]: Section 4 (p.10): "Benchmarks are all run on an AWS EC2 instance of size t2.2xlarge."

## Open Problems

- Can single-pass preprocessing be achieved in the **single-server** setting (removing the two-server requirement)?[^60]
- Can the **linear dependency** of client storage on N be eliminated (achieving sublinear client storage with single-pass preprocessing)?[^60]

[^60]: Section 7 (p.13): "Some natural next questions for this line of work are whether we can have a client-preprocessing PIR scheme whose efficiency is independent of lambda, and that operates in the single server setting; and whether we can get rid of the linear dependency of our scheme's client state and the database size."

## Uncertainties

- **Concrete query bandwidth for static benchmarks:** The static database benchmarks (Section 4, Figures 4–5) are presented only as charts on log scale, not as tables. Exact values for preprocessing time, query time, bandwidth, and storage for specific (N, w, Q) configurations in the static setting are not tabulated — only the updatable scenario has Table 2.
- **Permutation storage format:** The paper notes that storing the inverse permutation alongside the forward permutation has "constant overhead" (Footnote 7, p.16) but does not specify whether the implementation stores both or only one direction.
- **MIR reference [30]:** Cited as "Preprint" — exact publication venue unclear at time of this paper's writing.

## Related Papers in Collection

- **Checklist [Group D]** — Primary comparator. SinglePass eliminates the lambda factor from Checklist's preprocessing.
- **TreePIR [Group D]** — 2-server client-preprocessing scheme by the same authors. Benchmarked against in Section 4.
- **CK20 [Group D]** — Foundational client-preprocessing PIR model paper (2-server + single-server). SinglePass follows the same model (Definition 2.1).
- **Piano [Group D]** — Single-server client-preprocessing scheme. Different model (single-server, probabilistic correctness) but addresses the same preprocessing bottleneck.
- **MIR [Group D]** — Concurrent 2-server client-preprocessing scheme. Benchmarked against in Section 4.
