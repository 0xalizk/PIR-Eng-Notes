## TAPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [TAPIR: A Two-Server Authenticated PIR Scheme with Preprocessing](https://eprint.iacr.org/2025/2177) (2025) |
| **Authors** | Francesca Falzon, Laura Hetz, Annamira O'Toole (ETH Zurich) |
| **Archetype** | Construction + Security upgrade (adds authentication + malicious-server abort to SinglePass) + Update/maintenance (appends + edits) |
| **Asymmetry profile** | 2-server, role-asymmetric **client-preprocessing** APIR. Server 1 *generates and updates* the per-client hint during the offline phase by streaming the DB; Server 2 supplies look-up records during the online phase. The role asymmetry is inherited from SinglePass [LP24], but TAPIR makes the offline streaming **bilateral** (both servers stream the DB during preprocessing) so that integrity holds even against a malicious hint generator.&#8201;[^1]&#8201;[^2] On top, TAPIR adds **authentication via deterministic vector commitments** so the client can detect a malicious server returning wrong records (selective-failure protection).&#8201;[^3] |
| **Security model** | Malicious 2-server with abort, non-colluding, **at least one server is semi-honest**. Privacy *and* integrity hold against an adaptive adversary that may corrupt one of the two servers, choose `DB_init`, and adaptively interleave look-up and update queries.&#8201;[^4] |
| **Additional assumptions** | Binding deterministic vector commitment (Merkle tree → CRHF; Pointproofs → bilinear groups + trusted setup).&#8201;[^5] No CRS/ROM beyond what the chosen VC requires. |
| **Correctness model** | Deterministic when both servers are honest. Under malicious one-of-two server, client either outputs the correct record or aborts (`⊥`); never accepts a wrong record except with `negl(λ)` probability (integrity).&#8201;[^6] |
| **Rounds (online)** | 1 (Query → Answer → Recon). Offline: 1 round of `RequestHint` + streamed `AnsHintReq` from each server. |
| **Record-size regime** | Demonstrated on 32 B records (Key Transparency target). Architecture is record-size-agnostic; commitments are over `M`-vectors of `ℓ_r`-byte records. |

[^1]: Abstract (p. 1): "we propose TAPIR: the first two-server APIR scheme to achieve both sublinear communication and computation complexity for queries, while also supporting updates. Our scheme builds upon the unauthenticated two-server PIR scheme SinglePass (Lazzaretti and Papamanthou, USENIX'24)."
[^2]: §4.2 (p. 7), Challenge 1: "In SinglePass, the client and one server preprocess the database to compute a hint stored at the client. Upgrading this step to be secure against a malicious server poses a challenge … we assume a streaming model, in which both servers stream the database to the client. The client checks that the records streamed from both servers match and then computes the hint locally."
[^3]: §1 Contributions, "A New Scheme" (p. 2): "we combine SinglePass with a vector commitment (VC) scheme, carefully ensuring protection against selective failure attacks. This protection is not trivial, as a client may abort with equal probability when receiving incorrect information regardless of the queried record."
[^4]: §3.1 Threat Model (p. 4): "In the multi-server setting, we assume that at least one server is semi-honest and does not collude with the other (possibly malicious) servers." §3.2 (p. 5): the games allow the adversary to adaptively choose `DB_init`, pick the malicious-server index `good ∈ [k]`, and interleave query/update oracle calls.
[^5]: §5.3 Theorems 5.3.1–5.3.3 (p. 11): "Let VC be a vector commitment scheme with binding such that VC.Commit is deterministic." §6 (p. 11): instantiations are Merkle trees and Pointproofs [GRWZ20] (the latter requires trusted setup).
[^6]: §3.2.1–3.2.3, Defs. 4–6 (p. 5–6): correctness for honest execution; integrity defined as `Pr[client outputs x ≠ ⊥ ∧ x ≠ DB[idx]] ≤ negl(λ)`; privacy defined via a left-or-right indistinguishability game with abort.

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers `k`** | 2 (the construction is presented for `k=2`; the formal definitions cover general `k ≥ 1`).&#8201;[^7] |
| **Trust model** | At least one server is **semi-honest**, the other may be **malicious**. Non-colluding. Client knows neither which server is honest nor whether either is malicious.&#8201;[^4] |
| **Server roles** | **Asymmetric**. In the offline phase, Server 1 plays the original SinglePass "hint generator" role: it samples the per-partition permutations, XORs records into hints, and sends the seeds + hint to the client. Server 2 plays the "look-up" role: it returns records at the client-supplied indices. **TAPIR's modification:** during the offline phase, both servers stream the DB; the client compares the streams and re-runs the hint computation locally — neutralising a malicious hint-generator.&#8201;[^2]&#8201;[^8] |
| **DB replication** | Yes — both servers hold full copies of `DB` *and* of `~DB` (the secondary database of VC opening proofs).&#8201;[^9] |
| **Non-collusion** | Required. If both servers collude, integrity is lost (the malicious adversary controls both responses).&#8201;[^4] |
| **Symmetric vs asymmetric in TAPIR** | Online roles asymmetric (Server 1 holds permutations; Server 2 receives the index-set query). Offline roles **symmetric for hint generation** (both stream DB, client computes hint), but the *ownership* of the permutations remains with Server 1 in SinglePass tradition. |

[^7]: §3 (p. 4): "Definition 2. A k-server APIR scheme with preprocessing"; §3 (p. 4) further: "We note that the security definitions for the single- and multi-server settings differ in their threat model … In the multi-server setting, we assume at least one server is honest." Construction in §5 is for `k=2`.
[^8]: §4.1 (p. 6): "To achieve privacy in SinglePass, the two servers are assigned distinct roles. Server 1 is responsible for computing the hint during the offline phase and providing updates to it during the online phase … Server 2 is responsible for supplying the values required for the client to reconstruct the queried record during the online phase."
[^9]: §5.1.2 (p. 8): "Both servers maintain copies of DB and ~DB, along with pp, as part of their state."

### Security upgrade

TAPIR augments SinglePass [LP24] (which is *unauthenticated*: a malicious server can return wrong records and the client has no way to detect it) with **authentication** (integrity-with-abort against malicious adversaries). Three challenges and their resolutions:

1. **Privately computing the hint.** SinglePass has the client preprocess the DB *with one server*; a malicious hint-generator could insert garbage. TAPIR resolves this by having **both servers stream the database** during `AnsHintReq`. The client checks that the streamed records match across servers (`resp[1] = resp[2]`) and only then computes the hint locally. By stream-and-compare, no information leaks to the servers (just like the SinglePass leakage profile) and the malicious server cannot bias the hint.&#8201;[^2]&#8201;[^10]

2. **Selective-failure attack.** A malicious server can return a wrong record at the queried index; the client aborts. If the client only verifies the *reconstructed* record, the server learns whether `idx` was inside the query set vs. a chaff index — leaking the query. TAPIR resolves this by **verifying every record in the answer**, not just the reconstructed one. Each look-up returns `Q` records (one per partition); the client checks the VC opening proof `π_{b,q}` for every `(q, b) ∈ [Q] × {1,2}`. If *any* check fails, the client aborts uniformly across all queries.&#8201;[^11]

3. **Updates under adaptive adversaries.** SinglePass only proves security for static DB and non-adaptive queries. TAPIR formalises **updateable APIR with preprocessing** (Def. 3) supporting adaptive adversaries that interleave query and update oracles, and provides game-based proofs of integrity, privacy-with-abort, and correctness (Theorems 5.3.1–5.3.3).&#8201;[^12]

[^10]: §5.1.2 (p. 8): "If hq_b ≠ ⊥, the server proceeds to stream a copy of the database. Streaming allows the client to verify the equality of corresponding records across both servers, mitigating the risk of a malicious server providing inconsistent data. If the received information is not equal, the client aborts."
[^11]: §5 (p. 9), Recon, lines 9–15: "Verify commitments / for q ∈ [pp.Q] do / for b ∈ {1,2} do / v ← VC.Verify(com_q, qry_{b,q}, rec_{b,q}, π_{b,q}); if ¬v then st_C.abort ← true; return". Comment p. 10 (after Fig. 6): "since the requested records leak nothing about the queried index, aborting if the opening proofs in the answers are invalid, leaks nothing about the queried index. In contrast, if we were to only check the opening proof of the reconstructed record, then the servers could carry out a selective failure attack."
[^12]: §5.2 + Defs. 3, 4, 5, 6 (p. 4–6, 9–10); Theorems 5.3.1, 5.3.2, 5.3.3 (p. 11): correctness, integrity, privacy-with-abort under adaptive query and update oracles.

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | **SinglePass** [LP24] (USENIX'24) — single-pass 2-server preprocessing PIR with sublinear online phase, but unauthenticated. **APIR** [CNC+23] formalisation (Colombo et al.) — selective-failure-secure APIR with linear server time. **Vector commitments** [CF13] (Catalano–Fiore) and **Pointproofs** [GRWZ20] (Gorbunov et al., aggregatable VC). |
| **What changed vs. SinglePass** | (1) Bilateral DB streaming during offline so integrity survives a malicious hint generator. (2) VC commitments computed *per partition* (not per DB) and embedded as the digest. (3) Online answer carries opening proofs for all returned records; client verifies all proofs (selective-failure mitigation). (4) Adaptive game-based security and updates. |
| **What changed vs. APIR-Matrix-MT/PP and APIR-DPF** [CNC+23] | Adds **client preprocessing** so server online cost is sublinear in `N` (vs. linear for the [CNC+23] schemes), and adds **support for updates**. |
| **Superseded by** | None (newest in collection). |
| **Concurrent work** | FMS25 (Falk–Mishra–Shtepel) — generic semi-honest→malicious compiler for PIR, applicable in both single- and multi-server settings; AB25 (Alon–Beimel) — definitional work on malicious APIR; Crust [WLZ+23] — single-server verifiable PIR with sublinear server time, but requires the dedicated preprocessing server to be honest.&#8201;[^13] |

[^13]: §1.2 Prior Work (p. 2): "Crust [WLZ+23] extends [CK20] to provide verifiability, but its security relies on the strong assumption that the dedicated preprocessing server is honest. This assumption is much stronger than those of related multi-server APIR schemes [CNC+23], which assume at least one of the servers to be honest without specifying which one. Alon and Beimel [AB25] modify the compiler of [EKN22] to generically convert a semi-honest PIR scheme into one with security-with-abort. Falk et al. [FMS25] present a generic compiler that converts a PIR scheme into a malicious-secure PIR scheme in both single- and multi-server settings."

### Core Idea

TAPIR layers **deterministic vector commitments** on top of SinglePass's permutation-based 2-server preprocessing PIR to obtain the first multi-server APIR with sublinear online communication *and* sublinear online server computation, plus support for appends and edits. The DB is partitioned into `Q = ⌈N/M⌉` blocks; each partition gets its own VC commitment, and a secondary database `~DB` stores the per-record opening proofs in lock-step with `DB`. During online, each server returns `Q` records (one per partition) — `Q-1` are pseudorandom chaff and one carries the answer hash-XOR'd into the client's hint — together with their opening proofs. The client **verifies every proof** (defeating selective-failure) and then XORs to recover the record exactly as in SinglePass.&#8201;[^14]&#8201;[^15]

[^14]: §5.1 (p. 8): "Our scheme proceeds in two phases: an offline phase, where the client preprocesses the database, followed by an online phase, where the client queries the server based on the preprocessed information. The preprocessing phase allows communication and computational complexities of the online phase to be sublinear in the database size."
[^15]: §5 Fig. 5 (p. 9), Recon lines 7–15: client computes `(rec_{1,1}||π_{1,1}, …)` from `ans[1]`, identical for `ans[2]`, then verifies every `(com_q, qry_{b,q}, rec_{b,q}, π_{b,q})` and only XORs the surviving values into the hint to recover `x = (⊕_{q ∈ [Q]\{q*}} rec_{2,q}) ⊕ h_ind`.

### Formal Definitions

#### Updateable `k`-server APIR with preprocessing (Def. 3, §3, p. 4)

Algorithms (from Def. 2 and Def. 3):
- `(st_{S_b}, pp_b) ← Setup(sp, DB_init)` — per-server setup; produces server state and public parameters.
- `(st_C, hq) ← RequestHint(pp)` — client requests a hint, given combined public parameters.
- `(st'_{S_b}, resp_b) ← AnsHintReq(st_{S_b}, hq_b)` — each server computes its hint response.
- `(st'_C, hint) ← VerSetup(st_C, resp)` — client verifies and finalises hint.
- `(st'_C, qry) ← Query(st_C, idx)` — client query for `idx ∈ [N]`; produces per-server query shares `qry = (qry_b)_{b ∈ [k]}`.
- `(st'_{S_b}, ans_b) ← Answer(st_{S_b}, qry_b)` — each server answers.
- `(st'_C, x, hint') ← Recon(st_C, hint, ans)` — client reconstructs record `x` (or `⊥`) and refreshes the hint.
- `(st'_{S_b}, pp'_b, U_b) ← UpdateDB(st_{S_b}, U)` — server applies a sequence of updates `U`, outputs new public params and update info.
- `(st'_C, hint') ← UpdateHint(st_C, hint, pp, U)` — client updates its hint using the verified update info.

Security games (Fig. 1, p. 5): correctness `G^{Corr-APIR}`, integrity `G^{Int-APIR}`, privacy-with-abort `G^{Priv-APIR}`. Adversary may corrupt one server (multi-server setting only — highlighted in teal in the paper), pick the initial DB, and interleave query / reconstruction / update oracles (Fig. 2, p. 6).

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Determined by the chosen VC: **TAPIR-MT** = collision-resistant hash (Merkle trees, no trusted setup); **TAPIR-PP** = `q`-SBDH / similar pairing assumption + trusted setup (Pointproofs [GRWZ20]). PRF for permutations is OWF-based. No FHE/lattice assumptions.&#8201;[^16] |
| **Encryption/encoding scheme(s)** | None. Privacy comes from SinglePass's pseudorandom-permutation Show-and-Shuffle structure (Lemma A.1.1, restated from [LP24]). Integrity comes from VC binding. |
| **Ring / Field** | Records `∈ {0,1}^{ℓ_r}`; hint XOR is over `{0,1}^{ℓ_r}`. Pointproofs uses a pairing-friendly group (BLS12-381 in the implementation, via standard Pointproofs library).&#8201;[^17] |
| **Key structure** | Per-client client key `ck = {σ_q : [M]→[M]}_{q ∈ [Q]}` (one Fisher–Yates–Durstenfeld–Knuth permutation per partition, generated locally from server-supplied seeds); per-client hint `(h_1, …, h_M)` of `M` records; per-server state `(DB, ~DB, pp)`. |
| **Correctness condition** | Deterministic. Requires (1) `pp[1] = pp[2]` (public parameters match across servers) and (2) `resp[1] = resp[2]` during streaming, and (3) all VC opening proofs verify in `Recon`. Otherwise abort.&#8201;[^18] |

[^16]: §6 (p. 11): "We implement our scheme with both Pointproofs [GRWZ20] and Merkle trees as the vector commitment (VC) scheme (we refer to these implementations as TAPIR-PP and TAPIR-MT, respectively)."
[^17]: §6 (p. 11), footnote 2: "https://github.com/yacovm/PoL/tree/main/pp" — Pointproofs implementation. Pointproofs [GRWZ20] uses bilinear pairings.
[^18]: §5.1.2 (p. 8) and Fig. 4 RequestHint lines 3–4: client sets `st_C.abort ← true` and returns if `pp[1] ≠ pp[2]`. Fig. 4 AnsHintReq + Fig. 5 line 3: similar abort if `resp[1] ≠ resp[2]`. Fig. 5 Recon lines 13–14: VC verification failure aborts.

### Key Data Structures

- **Database `DB ∈ {0,1}^{N × ℓ_r}`** — replicated on both servers.
- **Partitions** — `DB` is split into `Q = ⌈N/M⌉` blocks of size `M` (default `M = √N`). `DB_q` denotes partition `q`; `DB_q[m]` is the `m`-th record of partition `q`.&#8201;[^19]
- **Secondary database `~DB`** — same shape as `DB`; `~DB_q[m]` stores the VC opening proof for the `m`-th record of partition `q`. Replicated on both servers.&#8201;[^9]
- **Per-partition commitments `com_q ← VC.Commit(DB_q)`** — `Q` digests, aggregated into `pp.d = (com_1, …, com_Q)`. Public.
- **Public parameters `pp = (M, ℓ_r, λ, d)` with `pp.N = N`, `pp.Q = Q`** — sent to client during `RequestHint`; checked for equality across servers.
- **Client state `st_C = (pp, ck, q*, ind, …)`**; `ck = (σ_1, …, σ_Q)` is the secret permutation key; `q*` and `ind = σ_{q*}^{-1}((idx-1) mod M + 1)` are set by `Query`, then unset by `Recon`.
- **Per-client hint `hint = (h_1, …, h_M)`** with `h_m = ⊕_{q ∈ [Q]} DB_q[σ_q(m)]`. Same structure as SinglePass.&#8201;[^20]
- **Query `qry = (qry_1, qry_2)`**: `qry_1` and `qry_2` each list `Q` indices into `[M]`. They differ only at the partition `q*` (true target index for one, random `r* ←$ [M]` for the other).&#8201;[^21]
- **Answer `ans_b`**: vector of `Q` records with their VC opening proofs, `(rec_{b,1}||π_{b,1}, …, rec_{b,Q}||π_{b,Q})`.&#8201;[^22]
- **Update info `U_b = {(op, idx, x_new ⊕ x_old)}`** returned by each server after `UpdateDB`; client uses to refresh hint.&#8201;[^23]

[^19]: §2 Preliminaries (p. 3): "We consider a database DB with N ∈ ℕ records … Our scheme divides the database into Q partitions of size M where Q = ⌈N/M⌉. We denote the q-th partition by DB_q."
[^20]: §4.1 (p. 7), eq. for `h_m` and Fig. 3b: `h_m = ⊕_{q ∈ [3]} DB_q[σ_q(m)]` for the running example.
[^21]: §5 Fig. 5 Query lines 8–13 (p. 9): client samples `(r*, r_1, …, r_{pp.Q}) ←$ [pp.M]^{pp.Q+1}`, sets `qry_{1,q}.qry_{1,q} ← σ_q(r_q)`, `qry_{2,q}.qry_{2,q} ← σ_q(ind)`, then if `q ≠ q*` swaps the two so that `qry_{2,q*} ← r*`.
[^22]: §5 Fig. 5 Answer lines 4–5 (p. 9): each server returns `[DB_q[qry_{b,q}] || ~DB_q[qry_{b,q}] : q ∈ [Q]]`.
[^23]: §5.2.1 Fig. 6 UpdateDB (p. 10): `U' ← U' ∪ {(op, idx, x_new ⊕ x_old)}` per edit; the server then accumulates per-partition deltas, recomputes VC commitments and opening proofs.

### Database Encoding

- **Representation:** flat array of `N` records of `ℓ_r` bytes, padded to capacity `M·Q` records (with `0`-records).
- **Record addressing:** index `idx ∈ [N]` maps to partition `q* = ⌈idx / M⌉` and offset `m* = ((idx-1) mod M) + 1`. The actual position fetched in partition `q` is `σ_q(m*)` (target) or `σ_q(r_q)` (chaff).&#8201;[^24]
- **Preprocessing required:** per-partition VC commitment + per-record opening proof. For Merkle trees, opening proof is the `O(log_2 M)` authentication path; for Pointproofs, opening proof is a single group element.&#8201;[^25]
- **Record-size equation:** records are `ℓ_r` bytes; total DB size is `N · ℓ_r` bytes, plus `~DB` of size `N · |proof|`.

[^24]: §4.1 (p. 7): "the client must first find the partition, q*, and index within the partition, m*, that map to the index idx in the original database, i.e., DB[idx] = DB_{q*}[m*]. The client then computes ind ∈ [M] such that σ_{q*}(ind) = m*."
[^25]: §6.2 (p. 12): "A Pointproofs proof is compact and only comprises a single group element, whereas each Merkle tree proof comprises an authentication path of size O(log_2 M)."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Each server (b ∈ {1,2}) | Partition `DB_init`, pad, compute `com_q ← VC.Commit(DB_q)` for each `q`, compute and store all opening proofs in `~DB`, build `pp_b = (M, ℓ_r, λ, d)`. | — | Once |
| RequestHint | Client → both servers | Receive `(pp_1, pp_2)`; check `pp_1 = pp_2`; send `hq_b = "Stream DB, please!"` to both. | `O(\|pp\|)` ↓ | Per client (joins) |
| AnsHintReq | Each server | Stream the full DB to the client. | `O(N · ℓ_r)` ↓ per server (× 2 total) | Per client |
| VerSetup | Client | Verify `resp[1] = resp[2]`; sample `σ_q ← Permute(M)` for each `q ∈ [Q]`; reconstruct `DB ← resp[1]`; compute `h_m = ⊕_{q ∈ [Q]} DB_q[σ_q(m)]` for `m ∈ [M]`; store `ck = {σ_q}, hint = (h_1,…,h_M)`. | — | Per client |
| Query | Client → both servers | Compute `q*, m*, ind`. Sample `(r*, r_1,…,r_Q) ←$ [M]^{Q+1}`. For each partition `q`: `qry_{1,q} ← σ_q(r_q)`; `qry_{2,q} ← σ_q(ind)`; if `q ≠ q*` swap them, else set `qry_{2,q*} ← r*`. Send `qry_b` to server `b`. | `O(Q · log M)` ↑ per server | Per query |
| Answer | Each server | For each partition `q`: return `(DB_q[qry_{b,q}], ~DB_q[qry_{b,q}])` — i.e., the record + its opening proof. | `O(Q · (ℓ_r + \|proof\|))` ↓ per server | Per query |
| Recon | Client | Verify all `2·Q` proofs against `pp.d`. If any fails, abort. Else compute `x = (⊕_{q ∈ [Q]\{q*}} rec_{2,q}) ⊕ h_ind` (where `ind = st_C.ind`). Update hint by XOR'ing `rec_{1,q} ⊕ rec_{2,q}` into the affected slots. | — | Per query |
| UpdateDB | Each server | Apply `U`: for `op = edit`, update `DB_q[m] ← x_new` and `com_q ← VC.Update(com_q, m, x_old, x_new)`. For `op = add`, may create new partition and `VC.Commit` it. Recompute opening proofs in `~DB`. Output `U_b = {(op, idx, x_new ⊕ x_old)}` and updated `pp'_b`. | `O(\|U\|)` ↓ to client | Batched |
| UpdateHint | Client | Verify `pp'_1 = pp'_2 ∧ U_1 = U_2`. Generate fresh permutations for any new partitions. For each `(op, idx, Δx) ∈ U`: locate `(q̂, m̂)`, compute `ind = σ_q^{-1}(m̂)`, set `hint_ind ← hint_ind ⊕ Δx`. | — | Per update batch |

### Two-Server Protocol Details

| Aspect | Server 1 | Server 2 |
|--------|----------|----------|
| **Data held** | Full `DB`, full `~DB`, `pp_1`. | Full `DB`, full `~DB`, `pp_2`. |
| **Offline role** | Streams DB to client during `AnsHintReq` (TAPIR change vs. SinglePass, where only Server 1 streamed; here *both* stream).&#8201;[^2] | Streams DB to client during `AnsHintReq`. |
| **Online query received** | `qry_1` — `Q` indices, `qry_{1,q}` is `σ_q(r_q)` for `q ≠ q*` and `σ_q(ind)` (target) for `q = q*` after swap. | `qry_2` — `Q` indices, `qry_{2,q}` is `σ_q(ind)` for `q ≠ q*` and `r*` (random chaff) for `q = q*` after swap.&#8201;[^21] |
| **Computation** | `Q` lookups + `Q` proof fetches. | `Q` lookups + `Q` proof fetches. |
| **Security guarantee** | Privacy holds if Server 1 is the malicious one (Server 2 does not see `q*`); integrity holds because client verifies all proofs from both. | Symmetric. |
| **Non-collusion assumption** | Required: if both servers collude they jointly see all `2·Q` query indices and can de-permute. |

### Query Structure

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| `qry_1` | `Q` indices in `[M]` | `Q · log_2 M` bits | Pseudorandom set sent to Server 1 (one chaff per partition + one true at `q*`) |
| `qry_2` | `Q` indices in `[M]` | `Q · log_2 M` bits | Pseudorandom set sent to Server 2 (true index at every `q ≠ q*`, one random at `q*`) |

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Public parameters `pp` | ↓ | `O(Q · \|com\|)` | yes (public) | `Q` partition digests, broadcast once |
| Hint stream `resp_b` | ↓ | `N · ℓ_r` per server (`2·N·ℓ_r` total) | per client | Doubled vs. SinglePass — bilateral streaming |
| Online query `qry_b` | ↑ | `Q · log_2 M` per server | no | Set of indices |
| Online answer `ans_b` | ↓ | `Q · (ℓ_r + \|proof\|)` per server | no | `\|proof\| = O(log_2 M)` for MT, `O(1)` for PP |

### Correctness Analysis

**Option C: Deterministic Correctness** when both servers are honest. **Option D / F: Inherited + verification soundness** when one server is malicious.

- **Honest case (Theorem 5.3.1):** Hint correctness `h_m = ⊕_q DB_q[σ_q(m)]` is preserved across queries by the SinglePass invariant; bilateral streaming guarantees `DB_1 = DB_2` so client recovers the right partitioning; deterministic VC.Commit ensures `com_{1,q} = com_{2,q}` so `pp_1 = pp_2` and no false abort.&#8201;[^26]
- **Adaptive integrity (Theorem 5.3.2):** Reduces to VC binding. If a malicious response would cause the client to accept a value `x ≠ DB[idx]`, then either `pp_1 ≠ pp_2` (caught at line 3 of RequestHint) or there exists a partition `q` where `VC.Verify(com_q, qry_{bad,q}, rec_{bad,q}, π_{bad,q}) = 1` with `rec_{bad,q} ≠ DB_q[qry_{bad,q}]` — a binding break.&#8201;[^27]

[^26]: §B.1 Proof of Correctness (p. 16): "By correctness of the vector commitment scheme VC and since VC.Commit is assumed to be deterministic, for each q ∈ [pp.Q_init] we have com_{1,q} = com_{2,q} = VC.Commit(DB_q)" — and then induction over `T_q` lookups using SinglePass's hint invariant.
[^27]: §B.2 Proof of Integrity (p. 17): "Because the commitment com_q is correct (due to the determinism of VC.Commit we must have pp_1 = pp_2 for honestly generated parameters), this would violate the binding property of VC."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (`N = 2^{20}`, 32 B records, `M = √N ≈ 2^{10}`) | Phase |
|--------|-----------|--------------------------------------------------------------|-------|
| Online BW (total, sum over both servers, query + response) | `O(√N · (ℓ_r + \|proof\|))` ; MT proof = `O(log √N)`, PP proof = `O(1)` | TAPIR-MT 776.98 KiB; TAPIR-PP 69.65 KiB&#8201;[^28] | Online |
| Online query (uplink only, indices) | `O(√N · log √N)` bits | ~1.28 KiB at `N = 2^{20}` (`Q · log_2 M = 2^{10}·10` bits per server); the online BW figures above are dominated by the response (records + proofs) | Online |
| Online server time per query (each) | `Õ(√N)` | TAPIR-MT 0.39 s; TAPIR-PP 2.63 s | Online |
| Online client time | `O(√N · t_verify)` | TAPIR-MT 0.02 s; TAPIR-PP 0.05 s | Online |
| Rounds | 1 | 1 | Online |

[^28]: Table 1 (p. 11): row for `N = 2^{20}`, record size 32 B. TAPIR-MT online BW = 776.98 KiB, RT = 0.39 s; TAPIR-PP online BW = 69.65 KiB, RT = 2.63 s; SinglePass online BW = 69.50 KiB, RT = 0.05 s.

#### Preprocessing metrics

| Metric | Asymptotic | Concrete (`N = 2^{20}`) | Phase |
|--------|-----------|-------------------------|-------|
| Server-side one-time setup time (per server) | `Q · t_VC.Commit(M) + N · t_VC.Open` | TAPIR-MT 1.45 s; TAPIR-PP 105 304.90 s (≈ 29 h) at `N = 2^{20}` — the two variants differ by ~70 000× because Pointproofs digest setup is dramatically more expensive than Merkle-tree commit; at `N = 2^{22}` TAPIR-PP rises to 844 441.96 s (~234 h), which is why TAPIR-PP is omitted for `N > 2^{22}`.&#8201;[^29] | Offline (one-time) |
| Server-side one-time setup BW | `O(N · ℓ_r)` to disk + `O(N · \|proof\|)` | TAPIR-MT 75 852.05 kiB (~74 MiB); TAPIR-PP 75 938.00 kiB at `N = 2^{20}` (the small ~86 kiB delta is extra Pointproofs digest material in `pp`) | Offline (one-time) |
| Per-client offline runtime (server) | `O(N)` for streaming both copies | TAPIR-MT 0.02 s; TAPIR-PP 0.05 s at `N = 2^{20}` — comparable across VC choice since the dominant cost is streaming the DB to the client (the §6.2 note that "client-dependent offline runtime of TAPIR does not depend on the selected vector commitment scheme" applies here).&#8201;[^30] | Offline (per client) |
| Per-client offline BW (down) | `2 · N · ℓ_r` (bilateral stream) + `pp` | At `N = 2^{20}`, `2 · N · ℓ_r = 2 · 2^{20} · 32 B = 64 MiB` of streaming per client (off-chart for Pointproofs in Fig. 7 due to digest material in `pp`). | Offline (per client) |
| Client-side offline runtime | `O(N)` | Hint computation matches SinglePass (the dominant cost is XOR over `N` records) | Offline |
| Client persistent storage | `O(M · ℓ_r) + O(Q · \|σ\|)` | `M = √N` hint slots + `Q` permutations stored as Knuth-shuffle data | Persistent |

[^29]: Table 1 (p. 11), row for `N = 2^{20}`, record size 32 B. The "Offline RT (1-Time)" column reads TAPIR-MT = **1.45 s** and TAPIR-PP = **105 304.90 s** — the two variants differ by ~70 000×, not "essentially identical": Pointproofs one-time digest generation is the bottleneck for TAPIR-PP and is what forces the omission of TAPIR-PP for `N > 2^{22}` (Table 1 caption: "omitted due to high to high Pointproofs setup costs"). The 75 852.05 / 75 938.00 figures are the **Offline BW (kiB)** column at the same `N`, not RT.
[^30]: §6.2 (p. 12): "the client-dependent offline runtime of TAPIR does not depend on the selected vector commitment scheme … this offline runtime is up to 8× higher for N = 2^{24} due to the setup time" relative to SinglePass. Table 1 (p. 11) "Offline RT (Per-Client)" column at `N = 2^{20}`: TAPIR-MT = 0.02 s; TAPIR-PP = 0.05 s.

#### Update metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per DB update (server, amortized over batch of 500) | TAPIR-MT 0.005 ms (`N = 2^{10}`) → ~100 ms (`N = 2^{22}`); TAPIR-PP 0.005–370.5 ms across same range&#8201;[^31] | Per-update; PP slower due to bilinear-pairing commitment update |
| Cost per DB update (client, amortized over batch of 500) | up to 0.005 ms at `N = 2^{22}` (TAPIR-MT) | Lightweight: permutation gen + XOR + mod/div |
| Communication per update batch (500 ops) | 83.48 B (`N = 2^{10}`) – 86.01 B (`N = 2^{22}`) per update tuple, similar for both VCs&#8201;[^32] | Independent of VC for ADD/EDIT (just the `(op, idx, Δx)` tuple) |
| Supported mutation types | **add** (append), **edit** (modify) — explicit; delete not addressed.&#8201;[^33] | |
| Aggregation threshold | None enforced; updates can be applied per-batch. New partitions trigger fresh `VC.Commit`; ADD operations may force new-partition commits when crossing `M` boundary. | |
| Deletion semantics | N/A (paper supports only add + edit) | |

[^31]: §6.4 + Fig. 9 (p. 13): "the largest observed amortized client runtime is just 0.005 ms at N = 2^{22} for TAPIR-MT. TAPIR-PP incurs slightly higher cost than TAPIR-MT, due to the equality check of the public parameters containing bilinear group elements as opposed to hash function outputs. The server runtime is higher but remains practical, especially since update computations are client-independent. Amortized runtimes range from 0.005 ms (N = 2^{10}, TAPIR-MT) to 370.5 ms (N = 2^{14}, TAPIR-PP)."
[^32]: §6.4 (p. 13): "Bandwidth costs are modest, ranging from 83.48 B (N = 2^{10}, TAPIR-MT) to 86.01 B (N = 2^{22}, TAPIR-MT). The bandwidth of TAPIR-MT and TAPIR-PP are comparable across ADD, EDIT, and BOTH operations, since the client only receives the update tuples (identical for both schemes) and the public parameters with the updated digest."
[^33]: §1.1 Contributions, "Support for Updates (§5.2)" (p. 2): "We extend our scheme to support updates, making TAPIR the first APIR scheme with preprocessing that handles dynamic databases in an efficient and provably secure manner." §5.2 (p. 10): pseudocode covers `op ∈ {add, edit}`.

### Mutation Model

| Aspect | Detail |
|--------|--------|
| **Update types supported** | `add` (append new record at end of last partition; may create new partition), `edit` (modify existing record in place). |
| **Who initiates updates** | External (paper does not specify; updates are server-side `UpdateDB` calls with arbitrary `U`). |
| **Consistency model** | Batched. `UpdateDB` processes a list of updates `U`, commits new partition digests, and outputs `U_b` to the client; client must run `UpdateHint` before issuing more queries.&#8201;[^34] |
| **Impact on hints** | Per `(op, idx, Δx)`, the client locates `(q̂, m̂)`, computes the affected hint slot `ind = σ_{q̂}^{-1}(m̂)`, and sets `hint_ind ← hint_ind ⊕ Δx` — `O(1)` per update.&#8201;[^35] |
| **Re-preprocessing trigger** | Not required (the hint is incrementally maintained). New partitions require fresh `Permute(M)` calls on the client (one per new partition). |
| **Adaptive adversary** | Update games allow `T_u + T_q ≤ poly(λ)` calls, interleaved with query oracles. Privacy and integrity hold under both lookup and update queries (Theorems 5.3.2, 5.3.3).&#8201;[^36] |

[^34]: §5.2 + Fig. 6 (p. 10): UpdateDB and UpdateHint pseudocode. Updates flow server → server → client.
[^35]: §5.2.2 (p. 10): "UpdateHint takes as input the client state st_C, the current hint hint, the updated public parameters pp_1, pp_2, and the update information U_1, U_2 from the two servers. Step (i) verifies consistency of the new parameters and updates. … Step (iii) updates the hint using the verified update information. For each (op, idx, x) ∈ U_1, the client uses its secret permutations {σ_q}_{q ∈ [Q]} to locate the partition and offset of idx. The client computes ind ← σ_q^{-1}(m̂) and sets hint_ind ← hint_ind ⊕ x."
[^36]: §3.2.2 Def. 5 + §3.2.3 Def. 6 (p. 5–6): adaptive integrity / privacy with abort; Theorem 5.3.2 + 5.3.3 (p. 11) prove these hold.

### Formal Security Properties

| Property | Informal Description | Formal Location | Hardness Assumption |
|----------|---------------------|-----------------|---------------------|
| **Correctness** | Honest-server execution returns `DB[idx]`. | Def. 4 (p. 5); Theorem 5.3.1 (p. 11) | None (statistical). |
| **Adaptive Integrity** | For any PPT adversary controlling one server (and `T_q + T_u ≤ poly(λ)` adaptive query/update calls), client either outputs `DB[idx]` or `⊥`; advantage in returning `x ≠ ⊥ ∧ x ≠ DB[idx]` is `negl(λ)`. | Def. 5 (p. 5–6); Theorem 5.3.2 (p. 11) | VC binding (CRHF for MT, `q`-SBDH for PP). |
| **Adaptive Privacy with Abort** | Left-or-right indistinguishability over query indices, holding even when the server learns whether the client aborted. | Def. 6 (p. 6); Theorem 5.3.3 (p. 11) | Show-and-Shuffle indistinguishability of SinglePass (Lemma A.1.1) + integrity. |
| **Show-and-Shuffle indistinguishability** | The transcript `(qry_0, qry_1)` is computationally indistinguishable from a fresh independent permutation pair. | Lemma A.1.1 (p. 15), restated from [LP24, §3.1] | OWF (PRP). |

### Variants

| Variant | VC scheme | Online BW | Online server RT | Best for |
|---------|-----------|-----------|--------------------|----------|
| **TAPIR-MT** | Merkle tree | Larger (auth paths grow `log_2 M`) | Smaller (cheap hash ops) | Bandwidth-tolerant, latency-sensitive deployments and KT (`N ≥ 2^{20}`); 22.64× server RT overhead vs. SinglePass at `N = 2^{24}` but only 1.37× client RT.&#8201;[^37] |
| **TAPIR-PP** | Pointproofs (aggregatable VC) | Near-optimal (single group element per query, comparable to SinglePass) | Larger (pairings + exponentiations dominate Recon and aggregation) | Bandwidth-constrained, latency-tolerant; **0.11% online BW overhead** vs. SinglePass at `N = 2^{22}`.&#8201;[^38] |

[^37]: §6.2 (p. 12): "The online runtime of TAPIR-MT (for N = 2^{24}) is overall 22.64× higher than SinglePass, with only 1.37× overhead for the server and 54.15× overhead for the client."
[^38]: Abstract (p. 1): "TAPIR incurs as little as 0.11% online bandwidth overhead for databases of size 2^{22}, compared to the unauthenticated SinglePass."

### Performance Benchmarks

**Hardware:** single machine with two Intel Xeon Gold 6258R CPUs @ 2.7 GHz (28 cores each) and 384 GB DDR4. Implementation in Go, using existing libraries for Merkle trees and Pointproofs; SinglePass and APIR reference impls extended for fair comparison.&#8201;[^39] All online numbers averaged over ≥ 25 runs.

**Reproduced from Table 1 (p. 11)** — record size 32 B; columns are `(Offline BW [kiB], Offline RT 1-Time [s], Offline RT Per-Client [s], Online BW [kiB], Online RT [s])`:

| `N`     | Scheme         | Offline BW | Off RT 1-Time | Off RT Per-Client | Online BW | Online RT |
|---------|----------------|-----------|---------------|--------------------|-----------|-----------|
| `2^{18}` | APIR-DPF       | —         | —             | —                  | 1.43      | 0.04      |
| `2^{18}` | APIR-Matrix-MT | 0.10      | 0.58          | 0.00               | 49.68     | 0.01      |
| `2^{18}` | TAPIR-MT       | 18 982.05 | 0.33          | 0.08               | 354.00    | 0.01      |
| `2^{18}` | TAPIR-PP       | 19 025.02 | 13 162.05     | 0.10               | 34.66     | 0.99      |
| `2^{18}` | SinglePass     | 18.52     | 0.00          | 0.01               | 34.50     | 0.01      |
| `2^{20}` | TAPIR-MT       | 75 852.05 | 1.45          | 0.02               | 776.98    | 0.39      |
| `2^{20}` | TAPIR-PP       | 75 938.00 | 105 304.90    | 0.05               | 69.65     | 2.63      |
| `2^{20}` | SinglePass     | 37.02     | 0.00          | 0.05               | 69.50     | 0.05      |
| `2^{22}` | TAPIR-MT       | 303 256.05 | 5.51          | 1.86               | 1 690.98  | 0.05      |
| `2^{22}` | TAPIR-PP       | 303 427.92 | 844 441.96    | 1.63               | 139.66    | 8.79      |
| `2^{22}` | SinglePass     | 74.03     | 0.00          | 0.24               | 139.51    | 0.00      |
| `2^{24}` | TAPIR-MT       | 1 212 720.05 | 22.14      | 7.65               | 3 662.97  | 0.12      |
| `2^{24}` | SinglePass     | 148.03    | 0.00          | 0.96               | 279.51    | 0.01      |

Note: TAPIR-PP and APIR-Matrix-PP omitted for `N > 2^{22}` due to "high to high Pointproofs setup costs."&#8201;[^40]

[^39]: §6 (p. 11): "Our protocol is implemented in Go, utilizing and adapting existing libraries for Merkle trees and Pointproofs. … We compare our approach against the two-server APIR schemes of [CNC+23] (denoted APIR-DPF and APIR-Matrix), and we compare our scheme to SinglePass [LP24]." §6.1 (p. 11): hardware spec.
[^40]: Table 1 caption (p. 11): "Results for APIR-Matrix-PP and TAPIR-PP (N > 2^{22}) are omitted due to high to high Pointproofs setup costs."

**Online comparison (from §6.3 + Fig. 8, p. 12):** for `N ≥ 2^{20}`, TAPIR-MT is the fastest APIR scheme online, outperforming APIR-Matrix-MT and APIR-DPF by up to **5.83×** and **23.82×** respectively. TAPIR-MT online BW is 13.11× SinglePass at `N = 2^{20}` (worst); TAPIR-PP online BW is 0.11% over SinglePass at `N = 2^{22}` (best).

**Update batch of 500 (Fig. 9, p. 13):** TAPIR-MT amortized client RT ≤ 0.005 ms at `N = 2^{22}`; server RT scales from 0.005 ms (`N = 2^{10}`) to ~100 ms (`N = 2^{22}`). EDIT batches incur slightly less BW than ADD (no new partitions). All update operations are sublinear in `N`.

### Application Scenarios

#### Key Transparency (KT) — primary motivating application&#8201;[^41]

- **Setting:** Untrusted KT server hosts a dictionary mapping user IDs → public keys (32 B each, e.g., Curve25519 — used by WhatsApp and Proton). Users want to verify their own and others' keys.
- **Why APIR fits:** Look-ups must be both **private** (the server should not learn whose key was queried) and **integrity-protected** (no malicious key substitution). Existing deployed KT systems (Google, Meta, Proton, Keybase, IETF KT) lack query privacy.
- **TAPIR's claim:** Scales to `N = 2^{24}` keys (16M users) with 32 B records on TAPIR-MT, with sub-second online RT and small batched-update bandwidth — practical for KT.

#### Future use cases noted

- **Keyword PIR** (TAPIR over a keyword index, black-box): contact discovery, medical look-up, message app key servers.&#8201;[^42]
- **DB partitioning at scale:** TAPIR can be parallelised across `p` sub-DBs [HSW23] for horizontal scaling.&#8201;[^43]

[^41]: §6.5 Application: Key Transparency (p. 13): "KT can be instantiated by extending index-based APIR to support keyword search (see [CD24, HLP+25] and §7) … APIR fills this gap by providing query privacy with abort even against adversarial servers." Discussion of WhatsApp / Proton (Curve25519 = 32 B keys).
[^42]: §7 Conclusion, "Support for Keywords" (p. 14): "While (A)PIR usually assumes knowledge of a record's index, many applications rely on keywords. Our scheme can be extended in a black-box way to support keyword queries [CD24, HLP+25]."
[^43]: §7 Conclusion, "Optimizations" (p. 14): "the database can be partitioned into p sub-databases [HSW23], with TAPIR running on each in parallel. This adds minor overhead but reduces per-database cost and enables trivial parallelization of both phases."

### Comparison with Prior Work

For `N = 2^{20}`, 32 B records (from Table 1 + §6.3 + Fig. 8):

| Metric | TAPIR-MT | TAPIR-PP | APIR-DPF | APIR-Matrix-MT | APIR-Matrix-PP | SinglePass |
|--------|----------|----------|----------|-----------------|------------------|------------|
| Online BW | 776.98 KiB | 69.65 KiB | 1.56 B | 104.36 KiB | n/a (omitted) | 69.50 KiB |
| Online server RT (sum over both servers) | 0.39 s | 2.63 s | 776.98 s (linear) | 0.36 s | n/a | 0.05 s |
| Server scaling | sublinear `Õ(√N)` | sublinear `Õ(√N)` | linear `O(N)` | linear `O(N)` | linear `O(N)` | sublinear `Õ(√N)` |
| Authentication | yes | yes | yes (DPF + MAC) | yes (Merkle) | yes (Pointproofs) | **no** |
| Updates | yes | yes | no | no | no | no |
| Trusted setup | no | yes (PP only) | no | no | yes (PP only) | no |
| Honest-server requirement | 1 of 2 | 1 of 2 | 1 of 2 | 1 of 2 | 1 of 2 | 1 of 2 (not authenticated) |

**Key takeaway:** TAPIR is the first multi-server APIR with **sublinear online server time *and* updates**. For applications with `N ≥ 2^{20}` and stable record sizes (e.g., KT), TAPIR-MT is the right pick: it dominates APIR-Matrix-MT and APIR-DPF in online RT for medium-to-large `N` while paying only 1.37× server RT overhead and ~13× BW overhead vs. unauthenticated SinglePass. TAPIR-PP closes the BW gap (~0% overhead vs. SinglePass) but pays 5.8 magnitudes more in online RT — pick PP only if BW is the binding constraint.&#8201;[^44]

[^44]: §6.2 (p. 12) and §6.3 (p. 12–13): explicit overhead comparison; Fig. 8 (p. 13) for online BW/RT scaling curves.

### Key Tradeoffs & Limitations

- **Bilateral DB streaming doubles offline BW.** The offline phase requires *both* servers to stream the full DB to the client (`2 · N · ℓ_r`) — this is the price of malicious-secure hint generation without heavy MPC. Streaming is one-time per client.&#8201;[^2]
- **Pointproofs setup is the bottleneck for TAPIR-PP at scale.** One-time setup of Pointproofs at `N = 2^{22}` already takes ~234 hours. Above `N = 2^{22}`, TAPIR-PP and APIR-Matrix-PP are not benchmarkable on the test machine.&#8201;[^40]
- **Modular VC choice is a feature.** TAPIR is generic over any binding deterministic VC. Better VCs (faster aggregation, no trusted setup, smaller proofs) plug in directly. The paper explicitly leaves "future advances in VC constructions" as the path to better TAPIR variants.&#8201;[^45]
- **No deletion semantics.** Updates support `add` and `edit`. Deletes can be emulated by `edit` to a tombstone, but the paper does not formalise this.
- **Selective-failure mitigation requires verifying *all* `2·Q` proofs.** This is `2·Q` VC verifications per query (≈ 2·√N). For VCs with expensive verify (Pointproofs), this dominates client-side online RT.&#8201;[^11]
- **Static during a query batch.** Updates must be flushed (UpdateDB → UpdateHint) between query batches; no concurrent online queries during update.
- **Honest-but-curious not enough — actually requires "1 honest of 2" against malicious.** If both servers act maliciously *and* coincidentally modify the database the same way, integrity is lost (§3.1, p. 4).&#8201;[^46]
- **Hint streamed = client must store `M·ℓ_r ≈ √N · ℓ_r` plus `Q` permutations.** For `N = 2^{24}` and 32 B records, this is ~32 KB hint + permutation seeds. Acceptable for KT, may be limiting for `√N`-large applications.

[^45]: §1.1 Contributions, "A New Scheme" (p. 2): "Our model treats the VC as a black-box, only requiring that the commitment is deterministic. This design offers implementation simplicity for practitioners while ensuring direct benefits from future advances in VC constructions."
[^46]: §3.1 (p. 4): "We note that if all servers act maliciously, they could (by coincidence or via additional information) modify the database in the same manner, hence fooling the client into accepting incorrect information. Without making strong assumptions about the database, we cannot bound this probability and, therefore, require at least one semi-honest server."

### Portable Optimizations

- **Bilateral stream-and-compare** to upgrade any 1-streaming-server preprocessing PIR to malicious security with abort. Adds zero leakage (both servers see the same access pattern they would have seen anyway) and the client's local hint computation is identical.&#8201;[^2]
- **Verify-all-records-then-XOR pattern** for selective-failure mitigation in any preprocessing PIR where the answer is a XOR of one-per-partition records: verify every returned record's commitment (not just the reconstructed one) so the abort decision is independent of the queried index.&#8201;[^11]
- **Partition-level VC commitments** (one digest per partition rather than one over all of DB) so that `add` operations only require fresh `VC.Commit` of the new partition, not re-commit of the whole DB.&#8201;[^47]
- **Pointproofs aggregation in `Answer`** to amortise verification across partitions: one aggregated proof per query rather than `Q` proofs, saving `Q-1` exponentiations and pairings. TAPIR-PP shifts this aggregation server-side rather than client-side.&#8201;[^48]

[^47]: §5.2.1 Fig. 6 lines 18–25 (p. 10): partition-scoped VC.Update for in-partition edits; VC.Commit + per-record VC.Open only triggered for new partitions added by `add` operations crossing the `M` boundary.
[^48]: §6 (p. 11): "For TAPIR-PP, we reduce per-query bandwidth and verification cost by aggregating Pointproofs across database partitions, thereby lowering both online bandwidth and runtime. A single Pointproofs proof requires two exponentiations and two pairings, whereas aggregating across ℓ vectors requires only 1 + ℓ of each — saving one exponentiation and one pairing per vector. Our implementation performs aggregation in Answer, shifting part of the verification cost to the server and allowing it to send a single proof instead of Q."

### Implementation Notes

- **Language / Library:** Go. Repos: `github.com/dedis/apir-code` (APIR-DPF/Matrix base), `github.com/yacovm/PoL/tree/main/pp` (Pointproofs), `github.com/SinglePass712/Submission` (SinglePass), `github.com/dimakogan/checklist` (linear matrix PIR), `github.com/osu-crypto/libOTe`. TAPIR source: `github.com/laurahetz/TAPIR`.&#8201;[^49]
- **Polynomial arithmetic:** N/A (no FHE). Pointproofs uses a pairing-friendly group (BLS12-381 standard).
- **CRT decomposition:** N/A.
- **SIMD / vectorization:** not mentioned.
- **Parallelism:** §7 future work — partition-level parallelism via [HSW23]; current implementation is single-threaded per server.&#8201;[^43]
- **Open source:** `https://github.com/laurahetz/TAPIR` (linked in §6, p. 11).

[^49]: §6 (p. 11) and footnotes 1–5: source code links.

### Open Problems (stated by authors)

- **Verifiability via zero-knowledge proofs** as an alternative to bilateral streaming for malicious-secure hint generation.&#8201;[^50]
- **Better/faster VCs** with smaller setup, smaller proofs, or no trusted setup (Pointproofs setup at `N = 2^{22}` is the practical bottleneck for TAPIR-PP).&#8201;[^45]
- **Native deletion semantics** (paper supports add + edit only).
- **Native keyword PIR** (paper sketches a black-box reduction but does not benchmark).&#8201;[^42]
- **Database partitioning for parallelism** at very large scale.&#8201;[^43]

[^50]: §4.2 (p. 7): "Other approaches may also be possible, e.g., by using zero-knowledge proof techniques, which we leave as a direction for future work."

### Uncertainties

- Table 1 reports `Offline BW` with TAPIR-MT and TAPIR-PP at *different* but very close values (e.g., `N = 2^{18}`: 18 982.05 vs. 19 025.02 KiB; `N = 2^{20}`: 75 852.05 vs. 75 938.00). The paper does not break down what contributes the small delta; likely additional Pointproofs digest material in `pp`.
- Table 1 reports TAPIR-PP `Offline RT (1-Time)` of 105 304.90 s (≈ 29 hours) at `N = 2^{20}` and 844 441.96 s (≈ 234 hours) at `N = 2^{22}`. These are server-side one-time costs (Pointproofs digest generation), amortised across all clients — not per-client costs. Per-Client offline RT remains modest (0.02–1.86 s across the benchmarked range). This dramatic asymmetry between TAPIR-MT (1.45 s) and TAPIR-PP (105 304.90 s) one-time setup at `N = 2^{20}` is the principal cost of choosing Pointproofs and is what forces omission of TAPIR-PP for `N > 2^{22}`.
- The paper's "online server runtime" totals are reported as a single number without specifying whether it is the max or sum over the two servers. Throughout these notes I report the per-server max where the paper is ambiguous; cross-check against §6.3 Fig. 8 if exact attribution matters.
- Pointproofs aggregation uses bilinear pairings; specific curve (BLS12-381 vs. BN254) is not stated in §6 but is standard for Pointproofs implementations.
