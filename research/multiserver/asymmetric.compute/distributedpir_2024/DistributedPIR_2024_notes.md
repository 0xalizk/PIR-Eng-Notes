## DPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Distributed PIR: Scaling Private Messaging via the Users' Machines](https://eprint.iacr.org/2024/978) (CCS 2024) |
| **Authors** | Elkana Tovey, Jonathan Weiss, Yossi Gilad (Hebrew University of Jerusalem) |
| **Archetype** | System + Construction (asymmetric-compute distributed PIR for metadata-private messaging) |
| **Asymmetry profile** | Hub-and-spoke: a single weak central server holds the message matrix `M` and orchestrates an epoch; clients of the system are conscripted as **client-workers** that perform the bottleneck plaintext-ciphertext matrix-vector multiplications. Server retains only (i) `Q · c⃗` precomputation per group (Freivalds challenge), (ii) per-row scalar `m⃗·q⃗c^T` for verification, and (iii) recursive-PIR's cheap second-step ciphertext-ciphertext multiplication and response assembly. Each worker's load is proportional to the number of messages it reads (one row of `M` per group of `m = ⌈√(n/39)⌉` clients), so total system work scales `O(n^{1.5})` instead of `O(n²)`.&#8201;[^1]&#8201;[^2] |
| **Security model** | Single (logical) honest-but-curious server for **privacy**; arbitrary Byzantine clients/proxies for **availability**. Network attacker can tap or drop. Privacy is proven as Pfitzmann–Hansen *relationship unobservability* via simulation against any PPT adversary corrupting servers and any subset of clients.&#8201;[^3] |
| **Additional assumptions** | IND-CPA security of BGV; semantic security of the underlying recursive PIR (SealPIR-style query expansion); availability of an orthogonal metadata-private dialing protocol used as a black box.&#8201;[^4] |
| **Correctness model** | Probabilistic. Client correctness is inherited from BGV/recursive PIR (deterministic when honest). Verification of delegated work uses Freivalds' randomized check: per-client soundness `≤ 2^{-d}`; per-epoch availability soundness against an adversary corrupting up to `√n` clients is `≤ n / (2^d − √n)` (Theorem 3). The paper deploys `d = 60`.&#8201;[^5] |
| **Rounds (online)** | Per epoch: 1 setup round (server distributes dead drops + compressed queries, clients expand & cache). Per communication round: 1 round-trip per (writer or reader) client to push a 256B message and pull its dead drop's worth of ciphertexts; one client-worker round-trip per assigned PIR job. |
| **Record-size regime** | Fixed at 256 B (text-message size), packed `⌊10 KB / 256⌋ = 39` messages per BGV plaintext. Message matrix `M` has dimensions `⌈√(n/39)⌉ × ⌈√(n/39)⌉` plaintexts.&#8201;[^6] |

[^1]: Abstract (p. 1): "DPIR, a messaging system that uses distributed PIR to let a server storing messages delegate the work to the system's clients, such that each client contributes proportional processing to the number of messages it reads."
[^2]: §3.2 *Scalability* (p. 4): "DPIR reduces server-side overhead to `O(n^{1.5})` by offloading work to clients; the overall work across the entire system, the server and clients, remains `O(n²)` but is sharded and performed in parallel across all system participants."
[^3]: §3.2 *Privacy* (p. 4) and §7.1, Theorem 1 (p. 8): formalizes privacy via Pfitzmann–Hansen relationship unobservability with a simulation-based proof; attacker may tap network and corrupt arbitrary servers/clients. §3.2 *Availability* (p. 4): availability holds despite arbitrary client misbehavior.
[^4]: §4 *Homomorphic Encryption with BGV* (p. 4): "DPIR uses BGV, an IND-CPA secure (leveled) fully homomorphic encryption scheme." §6 *Dialing mechanism* (p. 7): dialing is a black-box orthogonal subroutine.
[^5]: §7.2.1 (p. 8): per-client Freivalds soundness `1 − 2^{-d}`. Theorem 3 (p. 9): with `√n` groups each of `√n` clients, an adversary corrupting `≤ √n` clients evades detection over an entire epoch with probability `≤ n / (2^d − √n)`. §8.1 *Challenge vector* (p. 10): "60-bit entries in the challenge vector."
[^6]: §5.1 *Epoch setup* (p. 6): "with standard security parameters, a BGV plaintext stores about 10KB of data; so, since users' messages are short texts, the server encodes messages for multiple dead drops into one cell matrix `M` (a BGV plaintext). Given `n` users that read/write 256B messages (as in prior work [1, 5]), each cell can pack `⌊10KB/256⌋ = 39` messages. Thus, for `n` clients sending/receiving messages in the epoch (`n`), `M`'s dimensions are `⌈√(n/39)⌉ × ⌈√(n/39)⌉`."

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Topology** | **Hub-and-spoke** (NOT peer-symmetric). One central server is the source of truth for messages and the orchestrator. Clients are heterogeneous, untrusted, and play three roles simultaneously: *sender* (writes to its dead drop), *reader* (issues PIR query), *worker* (executes one assigned matrix-row × query-matrix product per round).&#8201;[^7] |
| **Number of servers** | 1 logical server in the basic deployment. §5.4 sketches a multi-server scaling where each server holds a full copy of `M` and serves a disjoint subset of client groups; servers are kept synced per round and do not collude with each other for privacy purposes (clients still distrust them).&#8201;[^8] |
| **Trust model** | Server: trusted only for **availability**, not privacy — the server may always drop/refuse messages but cannot learn who reads what. Clients: untrusted for both — they may return wrong PIR results to break availability, and the server proves them faulty via Freivalds.&#8201;[^9] |
| **Servers replicate the DB** | Yes (in the multi-server variant). The message matrix `M` is replicated across all servers, identical to prior systems Pung/Addra. Asymmetry is *not* between servers but between the server and its workers.&#8201;[^8] |
| **Asymmetry achieved by** | Outsourcing the **first PIR step** (plaintext × ciphertext matrix-vector product, the dominant cost) to clients organized into groups of `m = ⌈√(n/39)⌉`. Each client in group `G` receives one row `M[i]` of the message matrix and the group's shared compressed query matrix `Q`; the client expands `Q` once at epoch setup and computes `r⃗_i = M[i] · Q` per round. The server only does the cheap **second PIR step** (ciphertext × ciphertext, ~5.5× cheaper) and the verification step, both of which are not the bottleneck (Table 1 shows verification at ≈ `5.5×` lower cost than first-step PIR for 2M messages).&#8201;[^10]&#8201;[^11] |
| **Verification of delegates** | Server runs Freivalds' randomized check (Algorithm 3): pick `c⃗ ∈ {0, 2^d−1}^m` once per epoch; precompute `Q · c⃗` per group; for each client `i`, precompute `m⃗_i · (Q · c⃗)^T`; when client returns `r⃗_i`, check `r⃗_i · c⃗ == m⃗_i · (Q · c⃗)^T`. Cheating client is identified on the fly without batching. The server reuses the same challenge vector for the entire epoch, motivating Theorem 3.&#8201;[^12] |
| **Faulty-client recovery** | Hybrid: if `≤ 75m` clients fail, the server itself processes their jobs (overhead comparable to running verification on the rest); above that threshold the server redistributes the failed jobs to honest clients in the same group (which already hold the right `M` row).&#8201;[^13] |
| **Incentive layer** | Membership in the messaging system is conditioned on correct work: a client must continuously return valid Freivalds-checkable outputs to be allowed to send/read messages. Faulty clients are removed for the rest of the epoch.&#8201;[^14] |

[^7]: §3 *Overview* (p. 4): "Their clients also serve as workers helping the server process PIR queries. This allows DPIR to scale since the number of workers grows with the user base." Figure 3 (p. 7) shows clients organized into groups, each holding one row of `M`.
[^8]: §5.4 *Multi-server deployments* (p. 7): "DPIR naturally benefits from multiple servers. In such a deployment, all servers hold a copy of the message matrix (synced every communication round across the servers, similar to previous systems that relied on compute cluster [1, 5])."
[^9]: §3.2 *Goals and threat model* (p. 4): "the server is only trusted for service availability but clients are not (despite offloading the heavyweight processing work to the clients)." §3.2 *Availability* (p. 4): "DPIR allows users to exchange messages as long as its server follows the protocol, and despite misbehaving clients from other users."
[^10]: §5 *Design* (p. 6) and Figure 3 (p. 7): "Each client also receives their group's queries (in compressed form). In each communication round, it multiplies the message matrix row it receives by the expanded queries."
[^11]: §4.1 *Identifying the bottleneck* (p. 5) and Table 1 (p. 5): for 2M messages, first PIR step costs 3990.26 ms vs 186.92 ms for the second PIR step and 23.57 ms for Freivalds verification — the first step is `~21×` the second and `~169×` verification.
[^12]: §5.2 *Communication round* (p. 6) and §5.2 *On-the-fly verification with Freivalds' algorithm* (p. 7); Algorithm 3 (p. 7); §5.2 *Cached verification step*: "DPIR's server verifies responses from many clients in the same group, this allows caching part of the computation in the verification procedure. Specifically, the server chooses the challenge vector once per epoch and then computes for each group of clients handling the same `m × m` query matrix `Q`, the matrix-challenge product vector `q⃗c ← Q · c⃗`."
[^13]: §5.2.1 *Faulty clients & incentivizing correct work* (p. 8): "we find that processing up to `75m` of faulty clients' jobs gives comparable overhead to running the verification algorithm plus the second PIR-query processing that the server already does (see §4.1). Setting `75m` as a maximal threshold for a server-based recovery, therefore, would not dominate the server's processing time. Otherwise, if there are many faulty clients (e.g., `> 75m`), the server redistributes their work across other clients."
[^14]: §5.2.1 (p. 8): "By disconnecting faulty clients and blocking them until the end of the following epoch, DPIR creates an incentive for correct work: to communicate through DPIR, clients must continuously provide correct outputs. Future deployments of DPIR may include additional penalties such as withholding subscription fees."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Pung (OSDI 2016, SealPIR-based metadata-private messaging) and Addra (OSDI 2021, FastPIR-based VoIP); both use SealPIR/FastPIR's BGV-style FHE PIR. SealPIR (S&P 2018) supplies the recursive-PIR query compression / expansion. Freivalds' 1977 randomized matrix product check provides the verification primitive.&#8201;[^15] |
| **What changed** | Pung/Addra incur `O(n²)` server compute (linear DB scan per of `n` recipients, with `n`-sized DB). DPIR keeps the *same* threat model and message model but **delegates** the first PIR step (plaintext × ciphertext) to clients, and adds a verification layer (Freivalds with `√n` clients × `√n` groups) that does not require the BGV decryption keys. The novel cryptographic ingredient: showing that Freivalds' check is sound when the matrix being checked is filled with BGV ciphertexts encrypted under **different public keys** — relying only on the associativity of `R_q` ring operations.&#8201;[^16] |
| **Superseded by** | None in the collection. |
| **Concurrent work** | VeriSimplePIR (USENIX Sec 2024 — verifiable Group 2a hint-PIR) addresses verifiability of PIR answers but with a different threat model (verifiable single-server) and incurs a costly offline phase incompatible with the per-message DB updates DPIR needs. Plinko/RMS24 also concurrent in the broader sublinear-PIR space.&#8201;[^17] |

[^15]: §1, §2 *Related work* (pp. 1–3): "DPIR, a communication architecture based on PIR that takes a new approach for scalability"; references [1] Addra, [5] Pung, [4] SealPIR, [19] Freivalds 1977.
[^16]: §1 (p. 2) and §7.2.2 *Theorem 2* (p. 9): "To the best of our knowledge, this is the first time that ciphertexts encrypted using different keys are evaluated together to generate a coherent result." Theorem 2: "Let `M` be a matrix consisting of BGV plaintexts, `Q` be a matrix consisting of BGV ciphertexts (encrypted under different keys), and `c⃗` be a random vector of `d`-bit integers. Then `(M × Q) × c⃗ = M × (Q × c⃗)` ... with probability `≥ 1 − 2^{-d}`."
[^17]: §2 *Related work*, *Recent approach for scaling PIR protocols* (p. 2): "VeriSimplePIR ... introduces a verifiability mechanism ensuring that query answers are consistent with the database [15]. However, its verification mechanism is unsuitable for our use-case since it relies on a costly offline communication phase."

### Core Idea

Re-cast SealPIR-style PIR as a matrix-vector product `r⃗ = M · q⃗^T` where `M` is the BGV plaintext message matrix and `q⃗` is the client's BGV-ciphertext query. Stack `m` clients' query vectors into a column matrix `Q`; then the system's per-round work is the matrix–matrix product `R = M · Q`. Crucially, `Q`'s columns are encrypted under **different** public keys (one per recipient), so traditional homomorphic-eval verification doesn't apply — but the only ring operations involved (BGV plaintext × ciphertext multiplication and ciphertext addition) are **associative** on `R_q`, so Freivalds' check `M × (Q · c⃗) − R · c⃗ ?= 0⃗` works coherently even across different keys (Theorem 2). This unlocks: (i) splitting `R = M · Q` across `√n` worker-clients per group, each computing one row `M[i] · Q`; (ii) cheap server-side verification (3 matrix–vector products instead of one matrix–matrix product); (iii) sublinear server work `O(n^{1.5})` total. The result is `4.31×` and `3.25×` lower latency than Pung and Addra at `2^{19}` messages, with the gap widening at scale.&#8201;[^18]

[^18]: §1 (p. 2): "messaging latency scales with `O(n^{1.5})`, rather than `O(n²)` in [1, 5]"; "DPIR provides `4.31×` and `3.25×` better throughput and latency compared to Pung and Addra (respectively)." §7.2.2 Theorem 2 (p. 9) for the cross-key associativity argument.

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | Freivalds verification of a matrix product whose columns are BGV ciphertexts encrypted under **different keys** |
| **Type** | Cryptographic technique (not a new primitive — a new use of an existing one) |
| **Interface / Operations** | `Freivalds(M, Q, R, d)`: pick `c⃗ ←$ {0, 2^d − 1}^ℓ`; output `M × (Q × c⃗) − R × c⃗ == 0⃗`. Here `M` is plaintext, `Q` and `R` consist of BGV ciphertexts (each column under a different `pk_i`).&#8201;[^19] |
| **Security definition** | Soundness: for adversarially chosen `M, Q, R` with `M × Q ≠ R`, Pr_c⃗ [check passes] `≤ 2^{-d}` per check. Theorem 2: associativity holds with probability `≥ 1 − 2^{-d}` even for cross-key ciphertexts. |
| **Correctness definition** | If `R = M × Q`, the check always passes. |
| **Purpose** | Lets the server detect a single dishonest client among the workers in a group of size `m`, without holding the decryption keys (which it cannot, by privacy), and without re-running the expensive matrix multiplication. |
| **Built from** | Freivalds 1977 + the observation that BGV's plaintext-×-ciphertext multiplication and ciphertext addition are associative as polynomial operations in `R_q = Z_q[x] / (x^N + 1)` — see Listing 1 (p. 9) for the pseudocode showing both operations factor cleanly across the two ciphertext components.&#8201;[^20] |
| **Standalone complexity** | 3 matrix-vector products in `R_q` instead of 1 matrix-matrix product; concretely Table 1 (p. 5): for `2M` messages, verification cost `23.57 ms` vs first-PIR cost `3990.26 ms` (`~169×` cheaper). |
| **Relationship to prior primitives** | Generalizes Freivalds from finite-field plaintexts to BGV ciphertexts under heterogeneous keys. |

[^19]: Algorithm 2 (p. 5) and Algorithm 3 (p. 7).
[^20]: §7.2.2 (p. 9) and Listing 1 (p. 9): `BGV_Ciphertext_Add(ctx1, ctx2)` and `BGV_Plaintext_Mult(ptx, ctx)` operate component-wise on the two-polynomial tuples in `R_q`, whose addition and multiplication are associative.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (BGV); IND-CPA security at 128-bit level. |
| **Encryption/encoding scheme(s)** | BGV (leveled FHE) from Microsoft SEAL 4.0. Each client has its own BGV public/secret key pair generated freshly per epoch.&#8201;[^21] |
| **Ring / Field** | `R_q = Z_q[x] / (x^N + 1)` with `N = 2^{12} = 4096`, `q` a 109-bit ciphertext-coefficient modulus, `t = 2^{20}` plaintext-coefficient modulus; Freivalds challenge entries are 60-bit integers (encoded as BGV plaintexts).&#8201;[^22] |
| **Key structure** | Per-epoch per-client BGV `(sk, pk)`; per-epoch group-shared key-switching keys (public, fixed across rounds, stored on disk). No long-term server keys.&#8201;[^23] |
| **Correctness condition** | BGV noise budget must accommodate (i) one query expansion (homomorphic substitutions), (ii) one plaintext-×-ciphertext matrix-vector product, (iii) one ciphertext-×-ciphertext recursive PIR multiplication, plus (iv) verification multiplications by 60-bit scalars. Parameters chosen for "support of up to 33M messages." Verification soundness: `1 − 9.09/10^{12}` per epoch (Theorem 3 with `d = 60`, `n = 2^{20}`).&#8201;[^24] |

[^21]: §4 *Homomorphic Encryption with BGV* (p. 4) and §8 *Implementation* (p. 9): "DPIR uses BGV ... we use the BGV implementation from Microsoft's SEAL library."
[^22]: §8.1 *BGV parameters* (p. 10): "We use the default 128-bit security parameters for BGV with polynomial degree `N = 2^{12}` from the SEAL library. In this setting, DPIR uses a 109-bit ciphertext coefficient modulus `q` and a 20-bit plaintext coefficient modulus `t`. ... The parameters we chose work for matrices of up to 33M messages." §8.1 *Challenge vector*: "use challenge vectors comprised of `d = 60`-bit integer elements."
[^23]: §5.1 *Query distribution* (p. 6): "each client receives matching key-switching keys to expand the queries correctly. These keys are public and are not changing. Thus, they can be stored long on the client's disk."
[^24]: §8.1 (p. 10): "with `2^{20}` clients, and 60-bit entries in the challenge vector, DPIR guarantees its availability goal with `1 − 9.09 / 10^{12}` probability per epoch."

### Key Data Structures
- **Message matrix `M`** of dimension `m × m` BGV plaintexts where `m = ⌈√(n/39)⌉`. Each plaintext packs 39 256B messages (one per dead drop). E.g., `2^{18}` messages → `82 × 82` plaintext matrix (~10 KB each).&#8201;[^25]
- **Compressed query matrix `Q`** per group: 2 ciphertexts per client (recursive PIR — one for column, one for row of `M`), each `O(1)` ciphertexts in compressed form. Group size = `m` clients.&#8201;[^26]
- **Expanded query matrix `Q'`** (`m × m` ciphertexts) cached per-client for the entire epoch (~3.6 GB for `2^{20}` messages on each client per the eval).&#8201;[^27]
- **Per-epoch Freivalds challenge `c⃗`** of length `m`, entries are 60-bit integers encoded as BGV plaintexts (one challenge per group, reused across rounds in the epoch).&#8201;[^28]
- **Server-cached verification helpers**: `q⃗c = Q · c⃗` (per group, ciphertext vector of length `m`), and `mqc = m⃗_i · q⃗c^T` (one scalar per client, ciphertext).&#8201;[^29]
- **Result vector `r⃗_i = M[i] · Q`** of length `m` ciphertexts, returned by client `i` per round.&#8201;[^29]

[^25]: §5.1 (p. 6); §8.1 *Message size* (p. 10): "to support clients exchanging `2^{18}` messages each round, the server will hold a matrix of `82 × 82` BGV plaintexts."
[^26]: §5.1 *Query distribution* and §5.1 *Submitting PIR queries* (p. 6): recursive-PIR query is two compressed ciphertexts; "DPIR distributes a different subset of `m` compressed PIR queries to each group."
[^27]: §10 *Memory* (p. 12): "with 1M clients in the system, each client stores around 3.6GB of expanded queries."
[^28]: §8.1 (p. 10).
[^29]: Algorithm 3 (p. 7).

### Database Encoding

- **Representation**: square `m × m` plaintext matrix; `m = ⌈√(n / 39)⌉` to amortize 39 messages per BGV plaintext.&#8201;[^25]
- **Record addressing**: dead drop `α` lives in cell `M[⌊α/m⌋, α mod m]`. Recursive PIR uses two queries: one selects the column, one selects the row.&#8201;[^30]
- **Preprocessing required**: per-round, the server re-fills `M` with the new round's messages. No NTT preprocessing of `M` is mentioned (operations are scalar/plaintext).
- **Record-size equation**: `floor(plaintext_capacity_bytes / 256B) = 39` messages per cell.

[^30]: §5.1 (p. 6): "the recipient can calculate the cell in `M` that stores the messages from that dead drop (dead drop `d` maps to the cell in row `⌊α/m⌋`, column `α mod m`)." §5.1.1: PIR query has two compressed components — column index and row index.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Epoch setup — registration | Client → Server | register, receive dead drop `α`, group assignment, row of `M[i]`, key-switching keys | row of `M` (~10 KB × `m`) ↓; PRF seeds, dead-drop addr ↓ | Once per epoch |
| Epoch setup — query submission | Client → Server | generate `(sk, pk)`, send compressed PIR query (2 ciphertexts, recursive PIR) | 2 BGV ciphertexts ↑ | Once per epoch |
| Epoch setup — query distribution | Server → Group | distribute `m` compressed queries (one per peer in group) plus key-switching keys | `O(m)` ciphertexts + ksw keys ↓ per client | Once per epoch |
| Epoch setup — query expansion | Client | expand each compressed query into `m`-long ciphertext column vector | — (local) | Once per epoch (cached) |
| Communication round — write | Client (sender) | encrypt+authenticate 256B message, push to dead drop | 256B ↑ | Per round |
| Communication round — server distributes `M` rows | Server → Clients | each client `i` in group `G` receives row `M[i]` | one plaintext row ↓ | Per round |
| Communication round — worker computation | Client (worker) | compute `r⃗_i = M[i] · Q` (`m` BGV plaintext-ciphertext mults summed) | `m` ciphertexts ↑ | Per round |
| Communication round — server verifies | Server | precompute `q⃗c = Q·c⃗` (epoch-cached); on receiving `r⃗_i`, compute `mqc = m⃗_i · q⃗c^T` and check `r⃗_i · c⃗ == mqc` | — | Per round, per worker |
| Communication round — second PIR step | Server | for the *reader* client targeted by query `i`, compute the second-step PIR product (ciphertext × ciphertext) on the assembled response column | one ciphertext ↓ | Per round, per reader |
| Communication round — decode | Client (reader) | decrypt with `sk`, verify MAC, extract message | — | Per round, per reader |

### Communication Breakdown

| Component | Direction | Size (1M users, 256B msg) | Reusable? | Notes |
|-----------|-----------|-------------------------|-----------|-------|
| Compressed queries to a worker | ↓ | 8 MB total per epoch (for `2^{20}`) | Yes, cached for whole epoch | Distributed at epoch start |
| Key-switching keys | ↓ | once per epoch | Yes | Reusable |
| Row of `M` to each worker | ↓ | ~10 KB plaintext per worker per round | No | Refreshed every round |
| Worker's response `r⃗_i` | ↑ | `m` ciphertexts per worker per round | No | Per round |
| Reader's PIR response | ↓ | 1 ciphertext (recursive-PIR) | No | Per round per reader |
| Per-round per-client communication | both | 2 MB (`2^{16}` msgs) — 8 MB (`2^{20}` msgs) | — | §10 *Bandwidth* (p. 12) |

### Correctness / Soundness Analysis

#### Option A: BGV correctness (inherited)

| Phase | Noise tracking | Notes |
|-------|----------------|-------|
| After query expansion | `O(m)` ciphertext substitutions in `R_q` | Bounded by SEAL parameter selection |
| After first PIR step (plaintext × ciphertext × m terms) | additive in `m`, plaintext-ciphertext mult is non-noisy on coefficients up to `t/2` | The dominant work step but cheap noise-wise |
| After second PIR step (ciphertext × ciphertext) | multiplicative noise growth | The expensive noise step but only one per query |
| After Freivalds 60-bit scalar mult | one extra plaintext-ciphertext mult on the response, scalars `< 2^{60}` requires `t = 2^{20}` to avoid overflow with care | DPIR encodes 60-bit scalars across multiple BGV plaintext slots since `t = 2^{20}` |

- **Correctness condition**: noise budget covers depth-2 of the recursive PIR plus the verification scalar multiplication; SEAL parameters `(N=4096, q=109-bit, t=20-bit)` are sufficient for `≤ 33M` messages.&#8201;[^24]
- **Library / version**: SEAL 4.0.

#### Option F: Verification Soundness (the novel security upgrade)

- **Verification mechanism**: per-client Freivalds with shared per-epoch challenge `c⃗ ∈ {0, 2^{60}-1}^m`.&#8201;[^28]
- **Per-client soundness**: Pr[server fails to detect a single faulty client] `≤ 2^{-60}` (Theorem 2).&#8201;[^31]
- **Per-epoch availability soundness**: with `√n` groups of `√n` clients and a fresh challenge per group, an adversary corrupting up to `√n` clients evades detection over a full epoch with probability at most `n / (2^{60} − √n)`. For `n = 2^{20}` this is `≈ 9.09 × 10^{-12}`.&#8201;[^32]
- **Soundness bound proof technique**: union bound over the `√n` groups; each group's challenge is independent; per-group analysis bounds the fraction of `c⃗` values for which a corrupted client's wrong response evades detection.&#8201;[^32]
- **Overhead from verification**: 3 matrix-vector products (Algorithm 2) instead of one matrix-matrix product. Concretely Table 1 (p. 5) shows `4.12 ms` (67k msgs) → `23.57 ms` (2M msgs) per epoch per group of cached precomputation, then a single dot product per response check.&#8201;[^11]

[^31]: §7.2.2 Theorem 2 (p. 9): per-client Freivalds soundness — for adversarially chosen `M, Q, R` with `R ≠ M × Q`, the check `R × c⃗ ≠ M × (Q × c⃗)` holds with probability `≥ 1 − 2^{-d}` over a random `c⃗ ∈ {0, 2^d − 1}^m`; equivalently `Pr[server fails to detect a single corrupted query] ≤ 2^{-d}`.
[^32]: §7.2.2 Theorem 3 and proof (p. 9): "the probability of the adversary corrupting a query and not being caught is upper-bounded by `n / (2^d − √n)`."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (1M msgs, 256B, 1-core CPU) | Phase |
|--------|-----------|--------------------------------------|-------|
| Server total computation per round | `O(n)` (with `n` clients sharing `n^{1.5}` work) | reduces server CPU vs Pung/Addra by `76%–81%` | Online |
| Client (worker) computation per round | `O(n / √n) = O(√n)` (one row · `m`-column product) | "few seconds per communication round even when the client uses just one commodity CPU core" | Online |
| Total system computation per round | `O(n^{1.5})` | dominant constant: BGV plaintext × ciphertext mult cost in `R_q` | Online |
| Round latency vs Pung/Addra | — | `4.31×` faster than Pung, `3.25×` faster than Addra at `2^{19}` messages; gap widens with `n` | — |
| Setup time | grows with `n` and `clients_per_server` | ~5 s (`2^{16}`, 100 cps) — ~30 s (`2^{20}`, 500 cps) | Per epoch |
| Server compute per round (cps=164) | — | scales with `(2^{16}, 2^{18}, 2^{20})` messages | Online |

(Concrete numbers from §1 abstract, §3.2, §9.) All evaluation on AMD EPYC 7662 2.00 GHz, 12-core nodes with 128 GB RAM, 100 Gbps Ethernet, single core per client emulation, 8 GB RAM per client.&#8201;[^33]

[^33]: §9 *Evaluation* (p. 10): "Our evaluation setup consists of one server machine and up to 504 clients spread across 14 machines. ... we deploy the server on a 12-core node with 128GB of RAM. We assume clients operate on less powerful machines, so we allocate 1 core per client and 8GB of RAM. Nodes are connected via 100Gbps Ethernet."

#### Communication metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Server per-client comm per round | `O(√n)` | Scales as `√n` ciphertexts down + `√n` ciphertexts up |
| Server total comm per round | `O(n √n) = O(n^{1.5})` | Aggregates across `n` clients |
| Per-client comm per epoch (1M msgs) | 8 MB | §10 *Bandwidth* |
| Per-client comm per epoch (`2^{16}` msgs) | 2 MB | §10 *Bandwidth* |
| Per-epoch download from server (compressed queries) | `420 KB – 1640 KB` for `2^{16} – 2^{20}` msgs | §9.4 |

### FHE-specific metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Polynomial degree `N` | `2^{12} = 4096` | SEAL default |
| Ciphertext modulus `q` | 109 bits | |
| Plaintext modulus `t` | 20 bits (`t = 2^{20}`) | |
| Multiplicative depth | 2 (one plaintext-×-ciphertext + one ciphertext-×-ciphertext) | Recursive PIR |
| Security level | 128 bits | SEAL default |
| Statistical Freivalds parameter `d` | 60 bits | challenge-vector entry size |

### Key Tradeoffs & Limitations

- **Client CPU cost**: clients must continuously expand and use BGV ciphertexts. A few seconds per round on a single core for `2^{20}` messages — fine for desktops, tight for mobiles. Mitigation: client *proxy* (delegate-of-delegate) — does not break privacy because proxy sees only ciphertexts.&#8201;[^34]
- **Client RAM cost**: ~3.6 GB of expanded queries per client at `2^{20}` messages. Mitigation: stream-then-discard pipeline, RAM ↔ disk swap.&#8201;[^35]
- **Client bandwidth cost**: 8 MB / round at `2^{20}` messages. Mitigation: clients with weak links (10–40 Mbps) still meet round budgets — Figure 8 shows DPIR matching Addra at 40 Mbps.&#8201;[^36]
- **Faulty-client tolerance**: works gracefully up to ~50 % faults; beyond that, full epoch re-setup is cheaper than redistribution.&#8201;[^37]
- **Stragglers**: server imposes a deadline; clients exceeding it are treated as faulty (work redistributed). Stragglers may rejoin the next epoch.&#8201;[^38]
- **No availability against a corrupt server**: like Pung/Addra, a dishonest server can drop all messages; only privacy is preserved against it.
- **Dialing protocol is a black-box dependency** with its own latency cost; DPIR uses keyword-PIR-based dialing (§6) but the architecture is agnostic.&#8201;[^39]
- **Not anonymous-at-cold-start**: clients must register at epoch boundary and stay online for setup; cannot do a single ephemeral query.

[^34]: §3 (p. 4) and §10 *CPU* (p. 12); §10.1 *Mitigation*, *Work delegation* (p. 13): "Users may delegate their clients' work to other machines, e.g., a desktop computer or a service provider that would process their work for a fee. ... Such delegation does not impact DPIR's privacy guarantee."
[^35]: §10 *Memory* (p. 12): "with 1M clients in the system, each client stores around 3.6GB of expanded queries"; §10.1 *RAM optimization* (p. 13).
[^36]: §9.2 *Clients with limited bandwidth* (p. 11): "DPIR's communication latency is higher than the latency we observed in Figure 6 without the bandwidth constraint. Notably, this latency is still better than Pung and comparable to Addra unconstrained ... at around 40mbps, it converges to what we saw earlier."
[^37]: §9.3 *Client faults* (p. 12): "even under a high fault rate, the maximal overhead remains under 25%. Thus, after redistributing the faulty clients' work, DPIR's communication rounds should not incur substantial additional latency. ... when 50% of clients fail. Beyond the 50% fault rate, we find that performing epoch setup again and distributing queries from scratch is cheaper."
[^38]: §5.3 *Stragglers* (p. 8).
[^39]: §6 *Dialing mechanism* (p. 7): keyword-PIR (Chor et al. via SealPIR) for dialing; black-box, replaceable.

### Performance Benchmarks

#### Microbenchmark (Table 1, p. 5; single core, ms)

| #messages | 1st PIR query | 2nd PIR query | Verification |
|-----------|--------------|---------------|--------------|
| 67k | 127.21 | 33.02 | 4.12 |
| 262k | 497.79 | 66.06 | 7.99 |
| 1M | 1993.31 | 132.13 | 17.14 |
| 2M | 3990.26 | 186.92 | 23.57 |

Verification is `~169×` cheaper than the first PIR query at 2M messages — motivates outsourcing.

#### End-to-end communication-round latency (Figure 6, p. 11; clients per server varied)

| #messages | Pung (SealPIR) | Addra (FastPIR) | DPIR | Speedup vs Pung / Addra |
|-----------|---------------|-----------------|------|-------------------------|
| `2^{16}`  | up to ~12 s   | up to ~9 s      | up to ~9 s | similar to Addra at small scale |
| `2^{18}`  | up to ~30 s   | up to ~25 s     | up to ~15 s | `2×` / `1.6×` |
| `2^{20}`  | up to ~120 s  | up to ~100 s    | up to ~30 s | `4×` / `3.3×` |

#### Asymptotic-scaling test (Figure 7, p. 11; clients scale with messages)

| `|messages|` | Pung | Addra | DPIR | Speedup vs Pung / Addra |
|------------|------|-------|------|-------------------------|
| `2^{19}`   | (baseline 1.81× / 1.24×) | — | — | `1.81×` / `1.24×` |
| `2^{21}`   | — | — | — | `4.31×` / `3.25×` |

#### Setup time (Figure 4, p. 10)

- `2^{16}` messages: `~5 s` (100 cps) — `~10 s` (500 cps).
- `2^{20}` messages: `~10 s` — `~30 s`.

#### Memory (§9.4, p. 12)

- Server: `~35 MB / client` at `2^{16}`; `~58 MB / client` at `2^{20}`.
- Client: `540 MB` peak at `2^{16}`; `3.6 GB` at `2^{20}`.

### Implementation Notes

- **Language / Library**: 3,445 lines of C++ on top of SealPIR (Microsoft SEAL 4.0).&#8201;[^40]
- **Polynomial arithmetic**: SEAL's NTT.
- **Parallelism**: each client uses 1 core; server uses 12 cores; multi-server scaling demonstrated up to 15-node cluster.
- **Bandwidth shaping in evaluation**: Linux `tc` to throttle clients to 10–100 Mbps.
- **Open source**: `https://doi.org/10.5281/zenodo.11115954` (artifact).&#8201;[^40]
- **Custom challenge encoding**: instead of using SEAL's scalar-ciphertext mult (which only supports plaintext-modulus-sized scalars), DPIR implements 60-bit scalar-ciphertext multiplication via SEAL internals — `~7%` faster on a recent rewrite, and lowers the Freivalds failure rate vs encoding `c⃗` as 20-bit BGV plaintexts.&#8201;[^41]

[^40]: §8 *Implementation* (p. 9): "We implemented DPIR in 3 445 lines of C++ code, on top of a state-of-the-art PIR query compression and expansion algorithm from SealPIR. ... Our prototype is publicly available." Reference [44] is the artifact.
[^41]: §9 (p. 10): "the new approach is 7% faster ... but the current encoding further diminishes DPIR's verification failure rate (since it uses 60-bit integers in its challenge vector)."

### Multi-Server Variant

§5.4 (p. 8) sketches a multi-server deployment: each server holds a full copy of `M`, syncs per round across servers (similar to Pung/Addra), and serves a disjoint subset of client groups. Privacy is unchanged (clients distrust all servers). The eval (§9) uses this setup to scale beyond 504 clients on the university cluster — each of 14 server-equivalent nodes serves up to 36 clients, totaling 504 clients on one 12-core "server" emulation.

### Open Problems / Future Directions

- **Heterogeneous workloads**: §10.1 *Heterogeneous clients* (p. 13) — split rows of `M` into chunks and assign chunks to clients proportional to their capability. Verification still works on the unsplit `M`, but the server must aggregate chunk results.
- **Mobile-friendly delegation**: client-proxy mechanism (§3, §10.1) is privacy-preserving but trusts the proxy for the client's own messages.
- **Reducing per-epoch RAM**: pipeline expansion (§10.1).

### Uncertainties

- The precise relationship between `m`, group count `√n`, and worker-per-group `√n` clients is consistent across the paper but the proof of Theorem 3 conflates `n` (messages) and `n` (clients) when both equal `n`. The paper implicitly assumes one client per recipient. For asymmetric writer/reader populations the bound would need adaptation.
- Figure 6 latency values are read from the chart and may differ from text by ±10%. The text-quoted speedups (`4.31×`, `3.25×`) are at `2^{19}` (Figure 6/7) and `2^{21}` (Figure 7); they are referenced more reliably than the chart values.
