## IncPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Incremental Offline/Online PIR](https://eprint.iacr.org/2021/1438) (USENIX Security 2022) |
| **Authors** | Yiping Ma, Ke Zhong, Tal Rabin, Sebastian Angel (UPenn / Algorand Foundation / Microsoft Research) |
| **Archetype** | Update/maintenance (primary) + Construction + Building-block (incremental PRS) |
| **Asymmetry profile** | 2-server CK-style **role split**: one *offline* server streams the DB once and produces the client hint; one *online* server answers the per-query parities. Adds **incremental updates**: when the DB mutates by `m = o(n)` items, the offline server runs `IncPrep` whose cost is `O(b·m·log n)` rather than the `O(b·(n+m)·log n)` of redoing `Prep` from scratch.&#8201;[^1]&#8201;[^2] |
| **Security model** | Semi-honest, two non-colluding servers (offline + online). Computational, under the hardness of the underlying PRP/PRF (instantiated with AES).&#8201;[^3] |
| **Additional assumptions** | Existence of pseudorandom permutations / functions (OWF). No CRS, no FHE, no trusted setup. |
| **Correctness model** | **Probabilistic with two failure modes**: (i) *PPRS puncture* failure with probability `O(1/√n)` (mitigated to `negl(λ)` via Checklist's two-server amplification, App. A.4.2); (ii) *coverage* failure — the queried index `i` may not appear in any of the `√n·log n` sets, with concrete probability ≈ `1/n` initially that grows to `O(1/n^{1−o(1)})` after `m = o(n)` mutations.&#8201;[^4] |
| **Rounds (online)** | 1 (online query + parallel set-refresh to offline server). |
| **Record-size regime** | Designed for moderate records (e.g., 2 KB Tor relay descriptors); evaluation uses 32 B and 2 KB items. Communication is `O(b·√n)` so the cost is dominated by record size `b` once `b ≥ log n` bits.&#8201;[^5] |

[^1]: §3.2 (p. 3): "The cost of these algorithms depends on the number of mutations and not on the size of the original database."
[^2]: §6.1 (p. 9–10) and Theorem 2 (p. 10): "the computational cost to the offline server for `IncPrep` with `m` operations (specified by `op`) on a size-`n` database is in expectation `O(b·m·log n)`, with data item size `b`, set size `s`, and `J = (n/s)·log n`. In contrast, preprocessing from scratch for the entire updated database requires `O(b·(m + n)·log n)` server computation."
[^3]: §3 (p. 2–3) and §3.1 (p. 3): two-server OO-PIR following CK; servers are semi-honest and do not collude. PRP instantiated via Patarin's Feistel construction over AES (§8 Implementation, p. 12).
[^4]: §6.2 "Failure probability" (p. 11): "the probability that the client fails to puncture the set at index `i` with probability `O(1/√n)` … we can employ the refinement to CK given in Checklist [40] to reduce this error to `negl(λ)`. Besides the aforementioned puncturing failure, another source of failure is when an index is not in any of the sets for which the client has hints. … Concretely, suppose the database is roughly `1/n`. When the size of the database grows to `n + m` where `m = o(n)`, the probability of failing to find `i` in any of `n/s` sets is `(1 − s/(n + m))^{n/s}`, which is asymptotically `(1/e)^{1−o(1)}`. With a factor of `log n` more sets, this probability is `O(1/n^{1−o(1)})`."
[^5]: §8 (p. 12) and §8.2 (p. 13): evaluation uses `b = 32 B` (microbenchmarks) and `b = 2 KB` (Tor relay descriptors); §6.2 (p. 11) discusses `O(b·√n)` online communication and notes "communication cost is reasonable given that element sizes in real databases are larger than one bit (§8)."

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 |
| **Roles** | **Offline server** runs `Prep` / `DBUpd` / `IncPrep` (`HintRes`, `EvalDiff`). **Online server** runs `Resp` (the per-query XOR over a punctured set). Both servers hold the full database `D`.&#8201;[^6] |
| **Trust model** | Semi-honest, non-colluding. If both collude, the offline server's view of the client's previous refresh queries can be combined with the online server's view to learn the queried index.&#8201;[^7] |
| **Servers replicate the DB?** | Yes — `D` is held by both servers; on update, both servers locally apply `op` to compute `D'`. Only the offline server interacts with the client during the update phase.&#8201;[^8] |
| **Asymmetry kind** | *Role asymmetry* — the offline server bears `O(b·n·log n)` initial preprocessing and `O(b·m·log n)` per update, then is silent during normal queries; the online server stays at `O(b·√n)` per query but does no preprocessing. After many queries, the offline server is also touched by per-query *refresh* requests of size `O(√n)`.&#8201;[^9] |
| **Role assignment in deployments** | Tor PIR-Tor application: a server can act as offline for one client and online for another; the trusted directory authority propagates relay descriptors so any pair of directory authorities can serve a client's `(offline, online)` pair.&#8201;[^10] |

[^6]: Definition 1 (p. 3) and Definition 2 (p. 3): `Prep`, `Resp` executed by offline/online server respectively; `IncPrep = (DBUpd, HintReq, HintRes, HintUpd)` with `DBUpd, HintRes` on the offline server.
[^7]: §3.1 "Security" (p. 3): "An OO-PIR scheme is secure if for all PPT adversaries `A`, `max_{i,j∈[n]} {Pr[A(P(i)) = 1] − Pr[A(P(j)) = 1]} ≤ negl(λ)`" — defined separately for each server's view; non-collusion is implicit in the two-server model.
[^8]: Definition 2 / `DBUpd` (p. 3): "the online server also updates `D` with `op`, but does not produce `δ` or interact with clients during offline phase."
[^9]: §4.1 "Reducing costs" (p. 5): "the total communication and storage costs are `O(b·√n·log n)`"; §6.2 (p. 10): the per-query refresh sends `√n − 1` indices in the clear to the offline server, which returns one parity.
[^10]: §7 (p. 11–12) "Assigning roles to directory servers": "a server can act as an offline server for one client and an online server for another. … the client can then decide on two random directory servers to use as an offline server and an online server, respectively."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | **CK** (Corrigan-Gibbs & Kogan, EUROCRYPT 2020) — 2-server offline/online PIR with `√n·log n` sets and a punctured PRF; **Checklist** (Kogan & Corrigan-Gibbs, USENIX 2021) — bucket-based DB partitioning that is an alternative incremental design and supplies a `negl(λ)` correctness amplification used here; **SACM** (Shi, Aqeel, Chandrasekaran, Maggs, CRYPTO 2021) — single-server-style preprocessing PIR with private puncturable PRFs, which the paper also extends to incremental form (deferred to App. E).&#8201;[^11] |
| **What changed** | Replaces CK's `Prep`-from-scratch on every DB mutation with `IncPrep`. Three mechanisms: (1) **Set-extension trick** (§4.2.1) — for `m` insertions, each existing CK-set `S_j ⊂ [n]` is probabilistically updated by sampling `w ∼ HG(n+m, m, s)` and replacing `w` random indices in `S_j` with `w` indices from `[n+1, n+m]`, preserving uniform-random distribution over `[n+m]`. (2) **Incremental PRS** (§5) — a new compressed representation of pseudorandom sets that supports `Add(aux, m) → aux'` so that a single secret key can describe a set whose range has been extended (multiple times). Built from PRPs over multiple subranges plus per-extension auxiliary tuples. (3) **In-place edits and deletions** (§4.2.2–4.2.3) — deletions use lazy replacement with a random mask, supporting weak deletion only.&#8201;[^12] |
| **Superseded by** | None in this collection (this is the canonical incremental 2-server preprocessing PIR). |
| **Concurrent work** | Checklist (Kogan & Corrigan-Gibbs, USENIX 2021) tackles the same problem via exponentially-sized buckets — fundamentally different approach (bucketed DB structure vs. incremental hint update). The paper compares directly and notes Checklist increases online communication and per-query fetched-objects count, which IncPIR avoids.&#8201;[^13] |

[^11]: §1 (p. 1): "we extend two recent two-server offline/online PIR protocols: (1) the Corrigan-Gibbs and Kogan scheme (CK) [23], and (2) the Shi, Aqeel, Chandrasekaran, and Maggs scheme (SACM) [51]." §4.1 (p. 5) describes the CK base; §6.2 (p. 11) cites Checklist [40] for the correctness improvement.
[^12]: §4.2.1, §5, §4.2.2, §4.2.3 (p. 6–8): three new mechanisms — set-extension probabilistic procedure, incremental PRS construction, lazy deletion via random masks.
[^13]: §2 "The challenge of mutability" (p. 2): "In independent work, Checklist [40] explores the idea of an offline/online PIR database that supports additions. Despite the similar objectives, our approaches are fundamentally different. Checklist leverages ideas known from ORAM [33], dividing the database into 'buckets' whose capacity grows exponentially. … The key idea behind this scheme is that while updates to a bucket require redoing the preprocessing for that bucket from scratch to obtain the new hints, most updates impact smaller buckets and larger buckets change less frequently — hence the savings. In contrast, our work aims to make the preprocessing itself incremental … our technique does not require the online server to maintain `log n` buckets and does not increase the number of objects fetched by the client per query — which could be significant when objects are large."

### Core Idea

CK's offline/online PIR has the client receive `√n·log n` pseudorandom subsets `{S_j}` of `[n]` (compressed via a punctured PRF) plus their parities `{p_j = ⊕_{e∈S_j} D[e]}`; queries are `O(√n)` and amortise an `O(b·n·log n)` offline phase. The catch: any DB mutation invalidates *every* set the client holds, forcing a full `Prep` redo. **IncPIR** supplies an `IncPrep` whose cost is proportional to the number `m` of mutations, not to `n`. The two technical pieces are: (1) a probabilistic *set-extension* procedure — for additions, each set `S_j` is updated by sampling `w` from a hypergeometric `HG(n+m, m, s)` and replacing `w` random elements of `S_j` with `w` random indices in `[n+1, n+m]`, which provably keeps each updated `S_j` a uniform random subset of `[n+m]` (Theorem 3, App. A.1); (2) an *incremental pseudorandom set* primitive `Ψ = (Gen, Add, Eval)` that compactly represents these extended sets via a master key plus per-extension auxiliary tuples `[(r_ℓ, t_ℓ)]_{ℓ∈[L]}`, where `Add(aux, m) → aux'` updates the auxiliary information without re-deriving the whole set. Eval computes the set as `⋃_{ℓ∈[L]} Set^{[r_ℓ]}(KDF(k, ℓ), Σ_{z<ℓ} r_z)` of size `t_ℓ` per subrange. In-place edits cost only a parity update per affected set; deletions are *weak* (existing clients keep their hints) and implemented by replacing the deleted slot with a fresh random mask.&#8201;[^14]

[^14]: §3 (p. 2–3), §4–§6 (p. 5–10), Figures 1–8.

### Formal Definitions

The paper formally defines **Incremental Offline/Online PIR** (Definition 2, §3.2):

- **Inherited from OO-PIR (Def. 1, CK):** `Prep(D) → h`, `Query(h, i) → q_i`, `Resp(D, q_i) → r_i`, `Recov(h, r_i) → d_i`.
- **New incremental algorithms:**
  - `DBUpd(D, op) → (D', δ)`: deterministic, offline-server-side; takes original `D` and a list of operations `op` (additions, deletions, in-place edits at certain positions), outputs the new database `D'` and an update *summary* `δ`. The size of `δ` is small and excludes the data items themselves.
  - `HintReq(h, δ) → u_q`: randomised, client-side; takes the hint `h` and `δ`, outputs an *update query* `u_q`.
  - `HintRes(D', u_q) → u_r`: deterministic, offline-server-side; takes the new database `D'` and `u_q`, outputs an *update response* `u_r`. **Cost of this algorithm should be proportional to the number of changes between `D` and `D'`.**
  - `HintUpd(h, u_r) → h'`: deterministic, client-side; takes `h` and `u_r`, outputs a new hint `h'` valid for `D'`.&#8201;[^15]

The paper also formalises three weakened/auxiliary notions:

- **Strong vs. weak deletion** (§3.2): *strong* means once an item is deleted, no client can retrieve it, including those who never saw it; *weak* means only *new* clients (with no pre-existing hint) cannot retrieve it. The paper proves strong deletion is *impossible* when the hint is stored at the client (an existing hint encodes parity information that lets the client recover deleted items by querying others and XORing).&#8201;[^16]
- **Pseudorandom set (PRS)** (Def. 3, copied from CK): `(Gen, Eval)`; security says `Eval(Gen(1^λ, n))` is computationally indistinguishable from a uniformly random size-`s` subset of `[n]`.&#8201;[^17]
- **Incremental PRS** (Def. 4, novel, §5.1): `(Gen, Add, Eval)` where `Gen(1^λ, n) → (k, aux)`, `Add(aux, m) → aux'`, `Eval(k, aux) → S ⊆ [n+...+m...]`. Correctness, security, and *non-triviality* require the symmetric difference `|S ⊖ S'|` to be `o(g(n))` (i.e., much smaller than the expected `g(n) = s²/(n + o(n²))` of two independently sampled sets), so updates do not cause "too many" elements to change.&#8201;[^18]

[^15]: Definition 2 (p. 3): full text of the eight-algorithm interface.
[^16]: §3.2 "Deletions" (p. 4): "if a client fetches an object from the database before the object is deleted, it is impossible to prevent the client from accessing this object again since the client could have saved a copy. … *Strong deletion* … ensures that once this object is deleted from the server(s), the client will be unable to retrieve it. … *Weak deletion* … only new clients do not learn any deleted items. … We show that in OO-PIR schemes where the hint is stored at the client, strong deletion is very difficult to achieve (§4.2.3)."
[^17]: Definition 3 (p. 7): standard PRS interface from CK.
[^18]: Definition 4 and Theorem 1 (p. 8): incremental PRS definition; "We say that an incremental PRS scheme is non-trivial if `E[|S ⊖ S'|] = o(g(n))`."

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | **Incremental Pseudorandom Set (Incremental PRS), Ψ = (Gen, Add, Eval)** |
| **Type** | Cryptographic primitive (specialised data-compression for pseudorandom subsets) |
| **Interface** | `Gen(1^λ, n) → (k, aux)`; `Add(aux, m) → aux'`; `Eval(k, aux) → S ⊆ [n + Σ ranges]` of size `s`. After `L` calls to `Add`, `aux` is a list of `L+1` tuples `[(r_ℓ, t_ℓ)]_{ℓ∈[L+1]}` where `r_ℓ` is the size of the `ℓ`-th subrange and `t_ℓ` is the number of elements drawn from that subrange.&#8201;[^19] |
| **Security definition** | `(k, aux) ← Gen(1^λ, n); aux' ← Add(k, m); S ← Eval(k, aux')` is computationally indistinguishable from a uniformly random size-`s` subset of `[n + m]` (Theorem 6, App. A.3). |
| **Correctness definition** | After any sequence of `Add` operations totaling extension `m`, `Eval` outputs a size-`s` subset of `[n + m]` (Theorem 5, App. A.3). |
| **Non-triviality** | `E[\|S ⊖ S'\|] = o(g(n))` where `g(n) = s²/(n + o(n²))` is the expected symmetric difference of two independent uniform subsets (Theorem 7). For `s = √n` and `m = o(n)`, `E[\|S ⊖ S'\|] = 2 · w` where `w ∼ HG(n+m, m, s)`, giving expectation `O(s · m / (n+m)) = o(√n)`.&#8201;[^20] |
| **Purpose** | Enable a client to update its compressed representations of the `√n·log n` CK sets after `m` DB additions without re-deriving every set from scratch and without re-sending huge keys. |
| **Built from** | One PRP per subrange (`PRP^{[r_ℓ]}`), keyed by `k_ℓ ← KDF(k, ℓ)` from a master key `k`. PRPs are instantiated as Patarin's Feistel construction over AES, then mapped to arbitrary range size via Black–Rogaway "cycle walking."&#8201;[^21] |
| **Standalone complexity** | `Gen`: `O(λ)`; `Add`: `O(s)` (one hypergeometric sample plus uniform sampling of `w` points in the new subrange); `Eval`: `O(s · L)` PRP evaluations spread across `L` subranges. |
| **Relationship to prior primitives** | Strict generalisation of CK's PRS (which has only `Gen, Eval`). **Loses** punctureability — IncPIR cannot puncture the incremental PRS while preserving the puncture-key compactness, because PRPs (used here for collision-freeness) lack the GGM-tree structure that CK exploits for `O(log n)`-size punctured keys. As a result, IncPIR's online query is `O(√n)` indices in the clear instead of CK's `O(log n)` punctured key — strictly worse asymptotically but practical when DB elements are large (§6.2, §8.2).&#8201;[^22] |

[^19]: §5.3, Figure 1 (p. 9): pseudocode of `Gen`, `Add`, `Eval`. "A set is represented using a key `k` and some short auxiliary information `aux`. The latter is a list of tuples `[(r_ℓ, t_ℓ)]_{ℓ∈[L]}`, where `L` is the number of subranges of a set."
[^20]: Theorem 7 / non-triviality proof (App. A.3.2, p. 18): "`E[\|S ⊖ S'\|] = 2w` where `w ∼ HG(n+m, m, s)`, and `E[w] = (n/(m+n))·s`. Since `s = √n`, and `m = o(n)`, `E[\|S ⊖ S'\|] = 2·E[w] = 2·(o(1)·√n)/(1+o(1)) = o(√n)`."
[^21]: §8 "Implementation" (p. 12): "Implementing our PRP requires care since the range (and domain) can be very small because the database operator could add just a handful of elements; typical PRP constructions can be very insecure. We use AES to implement a PRF for small range, and then apply Patarin's proposal [49] to build a secure PRP that has a small power-of-two range. Finally, we use the technique by Black and Rogaway [9] for turning a PRP with a power-of-two range into a PRP with an arbitrary range."
[^22]: §5.3 / Figure 1 caption discussion (p. 9): "Unfortunately our construction does not preserve the puncturable property since we use a PRP instead of a PRF and there does not exist puncturable PRP constructions [10]. For our incremental CK, this results in less succinct online communication (`O(√n)`), but in practice it works well (§8). Designing a puncturable incremental PRS is an interesting open question."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (instantiated as AES-128). Specifically, security of `s(n)`-time-secure PRPs over small-range domains.&#8201;[^23] |
| **Encryption/encoding scheme(s)** | None — IncPIR is information-theoretic in structure (XOR parities), with computational privacy coming from the pseudorandomness of the sets. |
| **Ring / Field** | `F_2^b` (XOR over `b`-bit DB elements). |
| **Key structure** | Per CK-set (and there are `J = (n/s) log n ≈ √n log n` such sets): a master PRS key `k_j` plus a list `aux_j = [(r_ℓ, t_ℓ)]_{ℓ∈[L+1]}` whose length grows with the number of `IncPrep` rounds. Subrange-specific PRP keys derived as `k_ℓ ← KDF(k_j, ℓ)`. |
| **Correctness condition** | Probabilistic — see "Failure probability" footnote.&#8201;[^4] |

[^23]: App. A.2 "Secure puncturable PRS from partially secure PRP" (p. 16): the formal reduction shows `s(n)`-time-secure PRPs (rather than fully secure) suffice for the `s(n)` queries that PRS makes — important for the very small ranges encountered after a small number of additions.

### Key Data Structures

- **CK sets `S_j ⊂ [n]`**, `J = √n · log n` of them, each of size `s = √n`. Each `S_j` is a pseudorandom subset.&#8201;[^24]
- **Hint at client** (initial): `h = {(k_j, aux_j, p_j)}_{j∈[J]}` where `k_j` is a PRS key, `aux_j` is the auxiliary information for the incremental PRS, and `p_j = ⊕_{e∈S_j} D[e]` is the parity. After `IncPrep` runs, `h` becomes `h' = {(k_j, aux'_j, p'_j)}_{j∈[J]}` with the auxiliary structure extended by the `Add` operation.&#8201;[^25]
- **Update summary `δ = (δ_add, δ_edit, δ_del)`**:
  - `δ_add = ("add", m_add)` — just the count of additions (data appended on the server).
  - `δ_edit = ("edit", [x_1, …, x_{m_edit}], [X_1, …, X_{m_edit}], [X'_1, …, X'_{m_edit}])` — list of edit indices and the parity differences `X_z = D^*[x_z] ⊕ X'_z = D^*[x_z] ⊕ D'[x_z]`.
  - `δ_del = ("del", [y_1, …, y_{m_del}], [Y_1, …, Y_{m_del}], [Y'_1, …, Y'_{m_del}])` — similar but with `Y'_z = r_z` a fresh random mask replacing the deleted item.&#8201;[^26]
- **Update query `u_q`** (client → offline server): a list `Q ⊆ [J]` of set indices that contain at least one changed index, each accompanied by its updated `aux` value. For additions, all `J` sets typically appear (since `Add` modifies every set's `aux`); for edits/deletions, only the (much smaller) set of impacted sets is sent.&#8201;[^27]
- **Update response `u_r`** (offline server → client): `{p'_j}_{j∈Q}` — the parity differences for each affected set, computed via `EvalDiff` (Figure 5) which outputs the symmetric difference `S ⊖ S'` between old and new sets without materialising either.&#8201;[^28]

[^24]: §4.1 (p. 5): "the client represents `h` as `√n · log n` independent random sets and their parities, where each set contains `√n` indices sampled uniformly at random."
[^25]: Figure 2 (p. 9): `Prep(D) → h`, where `h = {(k_j, aux_j, p_j)}_{j∈[J]}` is sent from the offline server to the client.
[^26]: Figure 3 / `DBUpd` algorithm (p. 10): produces `δ_add, δ_edit, δ_del` with parity differences for edits and replacement masks for deletions.
[^27]: Figure 4 / `HintReq` algorithm (p. 10): client builds `Q` and `aux'` per affected set.
[^28]: Figure 5 / `HintRes` and `EvalDiff` (p. 10): offline server iterates over `Q` and computes the parity difference `p'_j = ⊕_{e∈(S_j ⊖ S'_j)} D'[e]` for each set, where the symmetric difference is computed via `EvalDiff(k, aux, aux')`.

### Database Encoding

- **Representation:** Flat array `D[1..n]` of `b`-bit elements; both servers hold an exact copy.
- **Record addressing:** Direct integer index `i ∈ [n]`.
- **Preprocessing required:** `Prep` partitions `[n]` into `J = √n · log n` random sets each of size `√n` and computes their XOR parities. With incremental PRS, the partition is implicit: each `S_j = ⋃_{ℓ∈[L]} Set^{[r_ℓ]}(KDF(k_j, ℓ), Σ_{z<ℓ} r_z)` where the subranges grow with each addition batch.
- **Mutation handling on the server:** `DBUpd(D, op)`:
  - Additions append `m_add` new elements at indices `n+1, …, n+m_add` (the paper restricts to append-only insertions).
  - In-place edits at positions `x_1, …, x_{m_edit}` replace `D[x_z]` with `D'[x_z]` and record `X_z = D[x_z] ⊕ D'[x_z]` in `δ`.
  - Deletions at positions `y_1, …, y_{m_del}` replace `D[y_z]` with a *fresh random `b`-bit mask* `r_z`, with `Y_z = D[y_z] ⊕ r_z` recorded.&#8201;[^29]

[^29]: Figure 3 / `DBUpd` (p. 10): explicit pseudocode; deletions replaced via "`Y'_z ← {0,1}^b for all z ∈ [m_del]`"; the server keeps the parity difference for the client to apply.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Initial Prep | Offline server | Sample `J = √n log n` PRS keys; compute `S_j = Eval(k_j, aux_j)`; XOR-fold `D[e]` over `e ∈ S_j` to get `p_j` | `O(b · √n · log n)` ↓ | Once, per client |
| **DBUpd** | Both servers | Apply `op` to `D → D'`; offline produces `δ` with parity differences for edits/deletions | `O(\|op\| · b)` ↓ to client (`δ`) | Per mutation batch |
| **HintReq** | Client | Build `Q` set of impacted CK-sets (via `Member` on each changed index); generate updated `aux'_j` for each set in `Q` (or all sets if additions); send `(j, aux'_j)` per set in `Q` | `O(\|Q\| · \|aux\|)` ↑ | Per mutation batch |
| **HintRes** | Offline server | For each `j ∈ Q`: derive `S_j ⊖ S'_j` via `EvalDiff`; XOR `D'[e]` for each `e` in symmetric difference; return parity differences `{p'_j}_{j∈Q}` | `O(b · \|Q\|)` ↓ | Per mutation batch |
| **HintUpd** | Client | XOR `p'_j` into `p_j`, update `aux_j ← aux'_j`, retain `k_j` | — | Per mutation batch |
| Online Query | Client | Find `j*` such that `i ∈ S_{j*}` (linear scan with `Member` calls); puncture `S_{j*}` at `i` (probabilistically remove `i` or remove a random other element); send the punctured set's element list to online server | `O(b · √n)` ↑ | Per query |
| Online Resp | Online server | XOR `D'[e]` for each `e` in received set; return one `b`-bit parity | `b` ↓ | Per query |
| Online Recov | Client | XOR returned parity with `p_{j*}` to recover `D'[i]` (with `1 − O(1/√n)` probability) | — | Per query |
| **Refresh** | Client → Offline server | Sample fresh PRS key for the consumed set; send a new set's element list (≈ `√n` indices) and receive its parity | `O(b · √n)` ↑ ↓ | Per query |

(Reference: Figures 2–8, p. 9–12.)&#8201;[^30]

[^30]: Figures 2 (Prep), 3 (DBUpd), 4 (HintReq), 5 (HintRes/EvalDiff), 6 (HintUpd), 7 (Query / Refresh / QueryRecov / RefreshRecov), 8 (Resp), p. 9–11.

### Two-Server Protocol Details

| Aspect | Offline server | Online server |
|--------|----------------|---------------|
| **Data held** | Full DB `D` (and `D'` after update) | Full DB `D` (and `D'` after update) |
| **What client receives during Prep** | `h = {(k_j, aux_j, p_j)}_{j∈[J]}` (size `O(b · √n · log n)`) | — |
| **What client sends during query** | Refresh: a set `S_new` of size `√n − 1` (in the clear, no PRS compression) | The punctured set `S^* = S \ {i}` of size `√n − 1` (in the clear) |
| **Server computation per query** | `O(b · √n)` (XOR over fresh refresh set) | `O(b · √n)` (XOR over received punctured set) |
| **Server computation per mutation batch** | `IncPrep`: `O(b · m · log n)` in expectation (over choice of which sets are impacted) — proportional to number of changes. From scratch: `O(b · (n + m) · log n)`.&#8201;[^31] | Just applies `op` locally to `D → D'` (constant-cost) |
| **Non-collusion assumption** | Required — if both colluded they could correlate the client's refresh set (offline) with the queried set (online) and recover the queried index. Tor-PIR deployment: 2 random directory servers from `p` total; security holds with probability `(q/p)²` if `q` are adversarial. |

[^31]: Theorem 2 (p. 11): "the computational cost to the offline server for `IncPrep` with `m` operations on a size-`n` database is in expectation `O(b · m · log n)`."

### Update Metrics + Mutation Model (per §3.2 archetype)

| Aspect | Detail |
|--------|--------|
| **Update types supported** | Additions (append-only at positions `n+1, …, n+m`); in-place edits at arbitrary positions; weak deletions (replace with random mask). Insertions at *arbitrary* positions are not supported because they would re-index every subsequent element.&#8201;[^32] |
| **Who initiates updates** | Database operator (server-side). Offline server runs `DBUpd` deterministically; the resulting `δ` is delivered to clients. |
| **Consistency model** | Eventual: clients learn the new DB only after running `IncPrep` themselves. Until they do, their hints reflect the old `D`. |
| **Aggregation threshold** | None forced — the client can run `IncPrep` after every batch of `m` ops or only when failure probability becomes too high. The paper recommends `m = o(n)`; once `m = Θ(n)` it's cheaper to redo `Prep` from scratch. |
| **Re-preprocessing trigger** | When the cumulative `m` causes the failure probability `(1/e)^{1−o(1)}` to exceed an application threshold, or when the auxiliary list `aux = [(r_ℓ, t_ℓ)]_{ℓ∈[L+1]}` becomes too long (each set's `aux` length grows with the number of `Add` calls). The paper notes that the per-query *Refresh* operation also has the side benefit of resetting one set's `aux` to a single-tuple form `(n', s)`.&#8201;[^33] |
| **Deletion semantics** | **Weak deletion only.** Strong deletion is *impossible* for any client-stored-hint OO-PIR (informal proof in §3.2): an existing hint encodes the parity of a set containing the deleted index; the client can recover the deleted item by querying the other `√n − 1` indices in that set. *Honest* clients (who never queried the deleted item) follow the protocol and use the random mask correctly. *Malicious* clients (existing hint-holders) can recover deleted items by XORing — explicitly attacked in §4.2.3. The paper treats strong deletion as out-of-scope.&#8201;[^34] |
| **Cost per addition (offline)** | `O(b · m · log n)` total (Theorem 2); per-set cost is `O(b · w · log n)` where `w ∼ HG(n+m, m, s)`. |
| **Cost per addition (client)** | `O(\|Q\| · \|aux\|) ≈ O(√n · log n)` for additions (all sets typically affected). |
| **Cost per edit** | `O(b · m_edit · log n)` server, `O(m_edit · log n)` client lookups via `Member`. Only sets containing the edited index are touched. |
| **Cost per deletion** | Same as edit (`O(b · m_del · log n)` server) since deletion is implemented as edit-with-random-mask. |
| **Communication per update** | `\|δ\|` ≈ `O((m_add + m_edit + m_del) · b)` (offline → client); `\|u_q\|` ≈ `O(\|Q\| · \|aux\|)` (client → offline); `\|u_r\|` ≈ `O(\|Q\| · b)` (offline → client). For 1% additions on `n = 2^{20}`, IncPrep communication is 0.76 MB vs. 0.74 MB for full Prep — close, because additions affect all sets.&#8201;[^35] |
| **Failure probability after `m` mutations** | Without `log n`-multiplier, fail prob ≈ `(1 − s/(n+m))^{n/s} ≈ (1/e)^{1−o(1)}`. With the `log n`-multiplier (i.e., `J = (n/s) log n` sets), `O(1/n^{1−o(1)})`. Concrete: at `n = 2^{20}, s = 2^{10}, J = 2^{14}`, fail prob is `10^{-7}`; after `m = 2^{18}` additions it grows to `10^{-6}`. The paper uses two-server amplification (Checklist [40] App. A.4.2) to get `negl(λ)`.&#8201;[^36] |

[^32]: §3.3 "Types of updates considered" (p. 4): "*Additions.* … if the initial database is of size `n`, then after `m` additions the database has size `n+m` and the last `m` items are new. We make this restriction because supporting insertions at arbitrary locations is difficult without preprocessing the database from scratch as a single insertion changes the indexing of all subsequent objects. *In-place edits.* After `m` in-place edits, the updated database is still of size `n`, and up to `m` of the `n` items have changed."
[^33]: §6.2 (p. 11): "After the refresh is complete, the refreshed set's auxiliary information will simply consist of one tuple, `(n', s)`. Notice that refreshing a set has the nice side effect of reducing the size of the auxiliary information since we no longer need to maintain all the subranges of the incremental PRS (since a refreshed set is basically a set generated from scratch). As a result, when the number of queries following a database update is such that the client has used every set at least once, the client's auxiliary information will be in a state that is comparable to preprocessing the new database from scratch."
[^34]: §3.2 "Deletions" (p. 4) and §4.2.3 "Deletion against malicious clients" (p. 7): "secure deletion against malicious clients is impossible in CK: when the client obtains the parities for its sets it has in effect an encoding of *all* of the items in the database and there is no way for the server to remove the contribution of the deleted item. … Our approach for honest clients does work with malicious clients that join the system *after* the element is deleted since they will not have a copy of the parity for the deleted object."
[^35]: §8.1 "Update costs" and Figure 9 (p. 12–13): "Communication costs. Incremental CK incurs higher offline communication … because the client needs to also send auxiliary information to the server."
[^36]: §6.2 "Failure probability" (p. 11): cited inline; concrete numbers for `n = 2^{20}` to `2^{18}` mutations.

### Mutation Model

| Aspect | Detail |
|--------|--------|
| **Constraint regime** | Best when DB changes slowly — "a few percent of entries are added, deleted, or updated at a given time."&#8201;[^37] |
| **Breakdown threshold** | When DB doubles or triples in size, "maintaining multiple preprocessed databases and querying all of them might be a better choice." Past this, redoing Prep is preferred to IncPrep.&#8201;[^37] |
| **Index stability** | Required for additions to be append-only; arbitrary insertions would re-index downstream items, invalidating all hints. |
| **Query-update interleaving** | Each online query *also* triggers a per-query refresh of the consumed set. After enough queries, all sets are refreshed and `aux` returns to its single-tuple form — so query traffic itself "resets" hint state.&#8201;[^33] |

[^37]: §1 "Limitations" (p. 2): "Our incremental preprocessing schemes work best when the database changes slowly … When the database changes significantly (e.g., doubles or triples in size), maintaining multiple preprocessed databases and querying all of them might be a better choice."

### Correctness Analysis

**Option B: Probabilistic Correctness Analysis.**

| Field | Detail |
|-------|--------|
| **Failure modes** | (i) **Coverage failure**: the queried index `i` is not contained in *any* of the client's `√n · log n` sets. (ii) **Puncture failure**: in CK's design, with probability `O(1/√n)` the puncture step in `Query` (`α ← Bernoulli((s−1)/n')`) results in a set not containing `i`. |
| **Failure probability (no amplification)** | Coverage: `1 − (1 − (1 − s/n)^{n/s})^{log n} ≈ O(1/n)` for fresh DB, `O(1/n^{1−o(1)})` after `m = o(n)` additions. Puncture: `O(1/√n)`. |
| **Failure probability (with amplification)** | `negl(λ)` via the Checklist refinement (App. A.4.2): the client sends the same query — minus index `i` — to *both* servers. Each server returns the parity for the set with `i` removed; the client XORs to recover `D[i]`. This eliminates the puncturing failure mode; the coverage failure mode is independent and handled by choosing `J = √n · log n` (not `√n`). |
| **Probability grows over queries?** | No — per-query independent. |
| **Probability grows over DB mutations?** | Yes (slowly) — coverage failure grows from `O(1/n)` to `O(1/n^{1−o(1)})` as `m` grows from `0` to `o(n)`. Past `m = o(n)`, scheme breaks down (recommend full re-preprocessing). |
| **Key parameters affecting correctness** | Set size `s = √n`, number of sets `J = (n/s) · log n = √n · log n`, mutation count `m`, data block size `b`. |
| **Proof technique** | Hypergeometric sampling preserves uniformity (Theorem 3, App. A.1); the symmetric difference `\|S ⊖ S'\|` has expectation `2 · E[w] = O(s · m / (n+m))` (Theorem 7); union bound over `J` sets for coverage failure; Bernoulli analysis for puncture failure. |
| **Adaptive vs non-adaptive** | Security model assumes computational PPT adversary; correctness analysis is non-adaptive in the queries (each query is for a fixed `i`). |
| **Query model restrictions** | A set cannot be reused (per CK) — once consumed, it must be refreshed via the refresh operation. The amortisation window over `J = √n · log n` sets bounds the number of queries before re-preprocessing or before exhausting fresh sets (though refresh is amortised inline with queries). |

(Reference: Theorems 1 (PRS properties), 2 (computational cost), 8 (Π correctness), 9 (Π security), 10 (Π non-triviality), Appendix A.)&#8201;[^38]

[^38]: Theorems 1, 2, 8, 9, 10 (p. 8, 11, 18); App. A (p. 15–18) gives full proofs.

### Complexity

#### Online (per-query, after IncPrep is complete)

| Metric | Asymptotic | Concrete (`n = 2^{20}`, `b = 32 B`, batch size 1% additions) | Phase |
|--------|-----------|--------------------------------------------------------------|-------|
| Online query (client → online server) | `O(b · √n)` | 8.18 KB ↑ | Online |
| Online response (online server → client) | `O(b)` | 2 KB (one element) | Online |
| Refresh upload (client → offline server) | `O(b · √n)` | 8.18 KB ↑ | Online |
| Refresh response (offline server → client) | `O(b)` | 2 KB | Online |
| Online server compute | `O(b · √n)` | 0.06 ms (XOR over `√n − 1` elements, `b = 32 B`) | Online |
| Client query CPU | `O(√n)` PRP evals + `O(√n)` XORs | 7.87 ms (`Query`) + 4.90 ms (`Refresh`) | Online |
| Combined online communication | `O(b · √n)` | 16.4 KB total per query | Online |

#### Preprocessing / Update (per batch of `m = 1%` additions on `n = 2^{20}`)

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|----------|-------|
| **Initial `Prep` server compute** | `O(b · n · log n)` | 58.67 s | One-time per client |
| **Initial `Prep` client compute** | `O(√n · log n)` | 1.28 ms | One-time per client |
| **Initial `Prep` communication** | `O(b · √n · log n)` | 0.74 MB ↓ | One-time per client |
| **`IncPrep` server compute** | `O(b · m · log n)` | 1.03 s (~57× faster than Prep) | Per batch |
| **`IncPrep` client compute** | `O(\|Q\| · \|aux\|)` | 3.96 s (dominated by hypergeometric sampling for all sets) | Per batch |
| **`IncPrep` communication (offline ↔ client)** | `O(\|Q\| · (\|aux\| + b))` | 0.76 MB | Per batch |
| **Memory-bounded throughput (online)** | — | server spends `< 0.1 ms` per query → effective query rate is XOR-bandwidth-limited | — |

(Source: Figure 9 microbenchmarks, p. 13.)&#8201;[^39]

[^39]: Figure 9 (p. 13): "Microbenchmarks for the operations in incremental CK when adding a batch of new elements (1% of the original database)" — full table for `n ∈ {2^{16}, 2^{18}, 2^{20}}`.

### Performance Benchmarks

**Hardware:** CloudLab `m510` machines (8-core 2 GHz Intel Xeon D-1548, 64 GB RAM, Ubuntu 20.04). Network latency between machines: 20 ms; throughput ≈ 1.1 Gbps. Single-threaded; results averaged over 10 trials with stddev `< 10%` of the mean.&#8201;[^40]

**Implementation:** ~2,000 lines of C++. PRP via AES + Patarin Feistel + Black-Rogaway cycle walking; PRG-based GGM puncturable PRF for the CK baseline; hypergeometric sampling via multiple Bernoulli draws.&#8201;[^41]

**Microbenchmarks for incremental CK (Figure 9, p. 13)** — adding 1% new elements per batch, `b = 32 B`:

| DB size `n` | 2^16 | 2^18 | 2^20 |
|-------------|------|------|------|
| Prep client (ms) | 0.36 | 0.74 | 1.28 |
| Query client (ms) | 3.93 | 6.48 | 7.87 |
| Refresh client (ms) | 1.35 | 2.07 | 4.90 |
| **IncPrep client (ms)** | 0.06 | 0.50 | 3.96 |
| Prep server (s) | 3.64 | 14.52 | 58.67 |
| Resp server (ms) | 0.02 | 0.04 | 0.06 |
| **IncPrep server (s)** | 0.07 | 0.25 | 1.03 |
| Prep comm (MB) | 0.18 | 0.37 | 0.74 |
| Query comm (KB) | 2.04 | 4.09 | 8.18 |
| Refresh comm (KB) | 2.04 | 4.09 | 8.18 |
| **IncPrep comm (MB)** | 0.19 | 0.38 | 0.76 |

**Headline savings (§1):** for `n = 10^6`, `b = 2 KB`, batch of `m = 10^4` updates: incremental CK is **56× faster than Prep from scratch** for the offline server's compute (savings more pronounced when fewer updates).&#8201;[^42]

**PIR-Tor integration (§7, §8):** with `n = 7,000` Tor relays (`b = 2 KB` each), 3 days of historical Tor relay updates per batch:
- Online phase (Figure 10a, 11a, p. 13): incremental CK improves throughput by `~6×` over DPF-PIR (no offline phase) and matches CK's online cost. Online comm: ~6 KB query + ~2 KB response per server (combined), ~16.4 KB total.
- Offline / hint update (Figure 10b, 11b, p. 13): IncPrep achieves **2–4× speedup** over preprocessing from scratch (depending on batch size), with bigger savings for smaller batches.&#8201;[^43]
- Long-term cost (Figure 12, p. 14): over 90 days of Tor relay churn, IncPrep server cost is ~1/3 of cost from scratch; client storage growth `< 8%`.&#8201;[^44]

[^40]: §8 "Evaluation testbed" (p. 12).
[^41]: §8 "Implementation" (p. 12).
[^42]: §1 (p. 1): "the computational cost of updating the hints in our incremental CK scheme (iCK) for a batch of 10,000 updates (additions, deletions, edits) is `56×` cheaper than preprocessing from scratch; the savings are even more pronounced when there are fewer updates."
[^43]: §8.3 "Offline performance and costs" (p. 13).
[^44]: §8.3 "Computation and storage costs" + Figure 12 (p. 13–14): "as shown in Figure 12b, the client storage over a period of 90 days grows based on the client's query and server's update frequency. … the percentage of client storage growth is less than `8%`."

### Composability

| Base scheme | Integration point | Improvement | Limitations |
|-------------|-------------------|-------------|-------------|
| **CK (Corrigan-Gibbs & Kogan, EUROCRYPT 2020)** | Replace CK's PRS with the new incremental PRS Ψ; add `IncPrep = (DBUpd, HintReq, HintRes, HintUpd)` algorithms; lift online query from `O(log n)` punctured key to `O(√n)` indices in the clear | 2–4× faster offline updates; 56× cheaper than re-preprocessing for 1% mutation batches; concrete benefit grows with smaller mutation batches | (a) **Loses puncturing** — online comm goes from `O(log n)` to `O(√n)` (acceptable when `b ≥ 1`-bit, problematic for tiny elements). (b) Works only when `m = o(n)`; past that, full Prep is cheaper. |
| **SACM (Shi-Aqeel-Chandrasekaran-Maggs, CRYPTO 2021)** | Discussed in App. E of the extended report. SACM uses a *private puncturable PRF* (PPRF) which is incompatible with IncPRS replacement, so the iSACM construction uses different mechanisms (vastly different concrete details). | Provides incremental updates for SACM's offline-online PIR | Higher online communication than iCK because of cryptographic-key handling; iSACM not benchmarked in main body — see §1 "the cost is higher online communication (though still sublinear in the size of the updated database)."&#8201;[^45] |

[^45]: §1 (p. 1): "For our incremental version of SACM, called iSACM, the cost is higher online communication (though still sublinear in the size of the updated database), since our construction is not compatible with a specific cryptographic primitive used in SACM (a private puncturable PRF [51])."

### Application Scenarios

The paper highlights three motivating applications (§1, §2):

1. **Anonymous video streaming (Popcorn [35]):** clients stream movies via PIR; the movie catalog has frequent additions, deletions, and codec-update edits. Without incremental preprocessing, every catalog change forces a fresh `O(b·n·log n)` Prep on every client.
2. **Anonymous messaging (Pung [6], Talek [20]):** mailbox databases gain new messages every few minutes; high mutation rate makes redo-from-scratch the bottleneck.
3. **Contact discovery (DP5 [12]):** users register and deregister continuously; account churn benefits directly from `O(m)` updates.
4. **PIR-Tor (§7, §8):** Tor's directory servers update every 10–15 minutes with relay churn; clients query relay descriptors privately. Authors implement a hypothetical PIR-Tor with 70K relays (current Tor scale) and show iCK improves directory throughput by ~7× over Gilboa–Ishai 2-server DPF-PIR.&#8201;[^46]

[^46]: §1 (p. 1): "an implementation of PIR-Tor [47] that uses our iCK construction improves the throughput achieved by Tor directory nodes by roughly `7×` over an implementation of PIR-Tor that uses a state-of-the-art 2-server PIR scheme [13]."

### Key Tradeoffs & Limitations

- **Lost puncturability → larger online communication.** The replacement of CK's GGM-PRF (puncturable, succinct keys) by a PRP-based incremental PRS pushes the online query size from `O(log n)` (compressed punctured key) to `O(√n)` (indices in the clear). For `n = 2^{20}` and `b = 32 B`, this is 8.18 KB vs. ~hundreds of bytes — practical but asymptotically worse.&#8201;[^22]
- **Incremental PRS not puncturable.** Open problem (§5.3): designing a puncturable incremental PRS would restore CK's `O(log n)` online comm. Existing puncturable PRP constructions are unknown.&#8201;[^22]
- **Storage growth at the client.** Each `IncPrep` extends every set's `aux` by one tuple, bloating client storage by `O(\|Q\| · \|aux\|)`. The per-query refresh resets one set's `aux` to a single tuple — but storage between updates can grow if queries are sparse. Empirically, `< 8%` growth over 90 days for Tor.&#8201;[^33]
- **Strong deletion impossible.** Any client that already saw the deleted item retains the parity that includes it and can recover the deleted value. Only weak deletion is supported. This is a *fundamental* limitation of client-stored-hint OO-PIR, not just of IncPIR.&#8201;[^34]
- **Append-only insertions.** Insertions at arbitrary positions would re-index all downstream items, invalidating every hint. Restricted to appending at `n+1, n+2, …`.&#8201;[^32]
- **Coverage failure scales with `m`.** Concrete failure probability grows from `10^{-7}` (fresh) to `10^{-6}` after `m = 2^{18}` additions on `n = 2^{20}`. With Checklist's amplification, reduced to `negl(λ)` at the cost of doubled online comm.&#8201;[^4]
- **PRP over small ranges is the implementation pain point.** For small DB additions, the new subrange `[n+1, n+m]` may have `m < 100`, so off-the-shelf PRPs are insecure. Patarin Feistel + cycle walking is fragile to implement correctly.&#8201;[^21]
- **Not compatible with PIR-by-keywords.** When mutations change keywords of existing items or add new keywords, the underlying search data structure (e.g., binary search tree) rotates — invalidating all hints regardless of incremental preprocessing. Open problem.&#8201;[^47]
- **Two-server, non-collusion required.** Like CK, IncPIR is fundamentally a 2-server scheme. It does *not* generalise to single-server PIR.

[^47]: §9 "Discussion" (p. 14): "it is unclear how to support incremental preprocessing and PIR-by-keywords [21] given that mutations that changes the keywords of existing items or add new keywords would impact the underlying search data structure."

### Comparison with Prior Work

(For 7K Tor relays, `b = 2 KB`. Sources: Figures 10–12, p. 13–14, and §8.)

| Metric | iCK (this paper) | CK (baseline) | DPF-PIR (Gilboa-Ishai) | Checklist |
|--------|------------------|---------------|------------------------|-----------|
| Online query throughput | ~6× DPF-PIR | matches iCK | baseline (no offline) | reported similar to CK |
| Online query (combined) | ~16.4 KB | similar | smaller (cryptographic keys) | larger (must fetch from every bucket) |
| Online response | ~2 KB (1 element) | 2 KB | 2 KB | `> 2 KB` (one element per bucket × log n buckets) |
| Server response time | < 0.1 ms | ~0.1 ms | ~50–100 ms (DPF expansion) | similar to CK per bucket × log n |
| Update model | **Incremental** | None (full Prep) | None | Bucketed (incremental in different sense) |
| Update cost (1% mutations) | 2–4× faster than Prep from scratch | redo Prep `O(b · n · log n)` | redo Prep | rebuilds individual buckets |
| Online cost growth with updates | minimal (refresh covers it) | redo full Prep | n/a | online comm grows with `log n` |
| Per-query objects fetched | O(√n) | O(log n) (punctured key) | O(1) | log n (one per bucket) |
| Strong deletion | No | No | No | No |
| Multi-server | 2 (offline, online), non-colluding | 2, non-colluding | 2, non-colluding | 2, non-colluding |

**Key takeaway:** when DB mutations are frequent and small (`m = o(n)` per batch), iCK is the right choice — it preserves CK's online sublinearity and adds 56× faster updates on the offline server with `< 8%` storage growth on the client. For `b ≥ 1` byte (real DB items), the loss of puncturing is practically negligible. Its weakness is small-element regimes (where punctured keys would be smaller than indices) and large mutation batches (`m = Θ(n)` should redo from scratch).

### Portable Optimizations

- **Probabilistic set-extension preserves uniformity.** Theorem 3 (App. A.1) shows that for a uniform `S ⊆ [n]` of size `s`, replacing `w ∼ HG(n+m, m, s)` random elements of `S` with `w` random elements of `[n+1, n+m]` yields a uniform `S' ⊆ [n+m]` of size `s`. **Applicable to:** any preprocessing PIR scheme that requires uniform random subsets and supports incremental DB growth.
- **Set-key with auxiliary tuples for incremental compression.** Representing an extended pseudorandom set as a master key + list `[(r_ℓ, t_ℓ)]_ℓ` per subrange, with PRPs derived via `KDF(k, ℓ)`, is a general way to make set-based hint structures compactly updatable. **Applicable to:** other 2-server schemes that compress hints as keyed PRSes.
- **Refresh-as-state-reset.** Per-query refresh has the unintended benefit of resetting `aux` to a single tuple — providing automatic garbage collection of the auxiliary chain. **Applicable to:** any incremental data structure where some operations also implicitly reset internal state.

### Implementation Notes

- **Language / Library:** ~2,000 lines of C++.
- **PRP construction:** AES-128 → Feistel via Patarin's proposal → power-of-two-range PRP → arbitrary-range PRP via Black–Rogaway cycle walking. Required because added DB ranges may be very small (`m < 100`).&#8201;[^21]
- **PRG-based GGM puncturable PRF:** used only for the CK baseline (not iCK). When evaluating PPRF at consecutive points `1, …, s`, breadth-first expansion in the PRG tree reduces costs.
- **Hypergeometric sampling:** Multiple Bernoulli samplings; for the CK baseline, GGM construction instantiates the puncturable PRF from a PRG.
- **Number of sets `J`:** chosen so that failure probability `≈ 10^{-6}` per query.
- **Polynomial / FHE arithmetic:** N/A (PRF/symmetric-key scheme).
- **Parallelism:** single-threaded benchmarks (paper notes server XOR is trivially parallelisable).
- **Open source:** not explicitly cited in main body; extended report referenced as [46].

### Open Problems (stated by authors)

- **Puncturable incremental PRS** (§5.3, p. 9): "Designing a puncturable incremental PRS is an interesting open question." Would restore CK's `O(log n)` online comm.&#8201;[^22]
- **Single-server incremental preprocessing** (§9): "designing efficient preprocessing for single-server PIR remains an open question (existing schemes rely on obfuscation [15, 18, 23]), and ensuring that the preprocessing is incremental is an exciting direction."
- **Hint-at-server incremental preprocessing** (§9): "If the database items are large, OO-PIR schemes where the hints are stored at the client (e.g., CK and SACM) are a poor fit. Since our incremental preprocessing is not black-box, it remains to be seen how to apply it to schemes where the hints are kept at the servers [8]."
- **Incremental PIR-by-keywords** (§9): how to support both incremental DB updates and PIR-by-keywords (Chor-Gilboa-Naor [21]) without full Prep redo when keywords change.
- **Strong deletion in OO-PIR** (§3.2): impossible when hints are at the client; can hint-at-server schemes achieve it incrementally?

### Uncertainties

- **`O(\|Q\| · \|aux\|)` for the client side of `IncPrep`** — for additions, `\|Q\| = J = √n · log n` (all sets are touched) and `\|aux\|` can grow with the number of historical batches `L`, so the asymptotic bound depends on amortisation history. Theorem 2's `O(b · m · log n)` is for the offline server only. The benchmark `IncPrep` client time in Figure 9 (3.96 s for `n = 2^{20}`, `m = 1%`) is dominated by `J = 2^{14}` hypergeometric samplings, suggesting `O(J)` total — consistent with the "all sets touched" interpretation.
- **The `2−4×` figure for offline speedup vs. the `56×` figure for compute speedup** are consistent: the `56×` is for server CPU time on a 1% batch; the `2−4×` is for end-to-end offline phase including communication, where comm is similar between Prep and IncPrep. Both reported as the paper states them.
- **Failure-probability formulae use mixed bases.** §6.2 uses `(1 − s/n)^{n/s}` (probability that one set misses index `i`) raised to `J = (n/s) log n`. The "asymptotically `(1/e)^{1−o(1)}`" claim (per-set) and the `O(1/n^{1−o(1)})` claim (overall) are compatible up to the `log n` factor; the paper rounds this in slightly different ways at different points. Reported the most explicit form (concrete `10^{-7}` → `10^{-6}`).
- **Whether `IncPrep` re-uses CK's correctness amplification** is implied (Theorem 8 cites Checklist's improvement) but the main-body figures are reported without amplification; the App. A.4.2 derivation shows the doubling cost. Reported both regimes.
