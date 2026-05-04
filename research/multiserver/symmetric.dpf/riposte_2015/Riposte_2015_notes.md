## Riposte — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Riposte: An Anonymous Messaging System Handling Millions of Users](https://arxiv.org/abs/1503.06115) (IEEE S&P 2015; arXiv extended/corrected version, June 2021) |
| **Authors** | Henry Corrigan-Gibbs, Dan Boneh, David Mazières (Stanford) |
| **Archetype** | System (anonymous broadcast messaging / whistleblowing) + Construction (DPF-based PIR-write) |
| **Asymmetry profile** | **Symmetric** — 3-server cluster (two database servers `A`, `B` plus an auxiliary *audit* server) where the two database servers do **identical** work (each holds an `F^n` share of the database, expands one DPF key, performs the same hash/AlmostEqual computation). The audit server only performs cheap string comparisons on `O(√L)` digests it receives from `A` and `B`; it holds no database state.&#8201;[^1] This is **PIR-write** (anonymous one-of-`n` write), not PIR-read — Riposte explicitly runs "PIR in reverse."&#8201;[^2] |
| **Security model** | 3-server with non-collusion. Privacy and disruption resistance both hold against an adversary that controls **at most `t = 1` of the 3 servers** plus arbitrarily many malicious clients (the "three-server variant"). A second `s`-server variant trades performance for `t = s − 1` non-collusion.&#8201;[^3] Servers are trusted for availability (a single server failure halts the system); no assumption on adversarial behaviour beyond the `t`-collusion bound.&#8201;[^4] |
| **Additional assumptions** | OWF (AES-128 in counter mode used as the PRG inside the `(2,1)`-DPF and AlmostEqual); random-oracle modelled hash function (SHA-256 in the corrected protocol; the original S&P 2015 version used Poly1305 as a universal hash, but the corrected version requires a strong RO-modelled hash to fix an active attack on AlmostEqual);&#8201;[^5] DDH in an order-`q` group + Pedersen commitments + NIZK in the ROM for the `s`-server variant's zero-knowledge audit.&#8201;[^6] |
| **Correctness model** | Probabilistic. Underlying DPF is perfectly correct; AlmostEqual completeness ("almost always" accepts well-formed vectors) holds with overwhelming probability over the random oracle. The system as a whole has a tunable per-epoch **collision failure rate** governed by a balls-and-bins analysis: with table of `n ≈ 2.7 m` cells and `m` writers using `k=2`-way collision recovery the expected success rate is `≥ 95%`.&#8201;[^7] Failed clients re-submit in a future epoch. |
| **Rounds (online)** | 1 round client→servers (client uploads one DPF key per server). Server-side: 1 round of database server → audit server, plus 1 round audit server → database servers (returning the OK / Invalid bit). At end of epoch, servers exchange shares to publish the bulletin board (this is offline / coarse-grained). Clients are non-interactive after upload.&#8201;[^8] |
| **Record-size regime** | Application-driven — main evaluation uses 160-byte rows (just large enough for a 140-byte Tweet plus framing); also discusses 4 KB rows for anonymous email.&#8201;[^9] Total table size scales from `n = 64` to `n = 2²⁰` rows × 160 B (≈ 168 MB). |

[^1]: Figure 1 (p. 3): four-step diagram showing client → servers `A`, `B` (write shares of length `O(√L)`); `A`, `B` → audit server (blinded check messages); audit server → `A`, `B` (single OK/Invalid bit); `A`, `B` apply write to local DB. §2.2 (p. 4): "all but one of the servers could collude without compromising client privacy (`t = |Servers| − 1`). For our most efficient scheme, no two servers can collude (`t = 1`)."
[^2]: §2 introduction (p. 3): "Riposte achieves scalable anonymous messaging by running a private information retrieval (PIR) protocol *in reverse*: with reverse PIR, a Riposte client can efficiently *write* into a database maintained at the set of servers without revealing to the servers which row it has written."
[^3]: §1 (p. 2): "two Riposte variants … The first variant scales to very large network sizes (millions of clients) but requires three servers such that no two of these servers collude. The second variant is more computationally expensive, but provides security even when all but one of the `s` servers are malicious."
[^4]: §2.2 (pp. 3–4): "Servers in our system are trusted for availability. The failure—whether malicious or benign—of any one server renders the database state unrecoverable but *does not* compromise the anonymity of the clients. … We make no assumptions about the behavior of malicious servers."
[^5]: Note on p. 14 (top of §6 boxed remark): "this is the extended and corrected version of a paper by the same name that appeared at the IEEE Symposium on Security and Privacy in May 2015. This version corrects an error in the AlmostEqual protocol of Section 5.1 that could allow a malicious database server to de-anonymize a client using an active attack." The corrected protocol "models the hash function as a random oracle, and thus requires using a strong hash function, such as SHA-256. In contrast, the original protocol required a less expensive universal hash function, such as Poly1305."
[^6]: §4.4 (p. 11): the `(s, s−1)`-DPF construction "uses a *seed-homomorphic pseudo-random generator* … It is possible to construct a simple seed-homomorphic PRG from the decision Diffie-Hellman (DDH) assumption." §5.2 (pp. 13–14): the `(s, s−1)` audit uses Pedersen commitments and a non-interactive zero-knowledge proof (Camenisch–Stadler / Cramer–Damgård–Schoenmakers style) instantiated in the ROM.
[^7]: §3.2 (p. 6): basic collision analysis gives `E[SuccessRate] ≈ 1 − m/n + ½(m/n)²`; "if we want an expected success rate of 95% then we need `n ≈ 19.5 m`." With `k=2`-way collision recovery (§3.2 p. 7): `E[SuccessRate] ≈ 1 − ½(m/n)² + ⅓(m/n)³`, yielding `n ≈ 2.7 m`.
[^8]: §3 (p. 3): "a client need only stay online for long enough to upload its write request to the servers. As soon as the servers receive a write request, they can apply it to their local state. … When the servers agree that the epoch has ended, they combine their shares of the database to reveal the clients' plaintext messages."
[^9]: §6.1 (p. 15): "We chose the row length of 160 bytes because it was the smallest multiple of 32 bytes large enough to contain a 140-byte Tweet. … For example, an anonymous email system using Riposte with 4096-byte rows could handle 2.86 requests per second at a table size of 40,960 rows."

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 3 in the main "three-server protocol" variant: 2 *database servers* `A`, `B` (which jointly hold a 2-of-2 additive secret-sharing of the database vector `d ∈ F^n`) + 1 *audit server* (no DB state, only checks digests).&#8201;[^1] The optional `s`-server variant generalises to `s ≥ 3` non-colluding servers using `(s, s−1)`-DPF. |
| **Trust threshold** | `t = 1` (at most one of the 3 servers may collude with arbitrarily many malicious clients) for the three-server variant. `t = s − 1` for the `s`-server variant.&#8201;[^3] |
| **Servers replicate the data?** | The two database servers each hold a full-length share `d_A, d_B ∈ F^n` such that `d = d_A ⊕ d_B` (or `d_A + d_B` over the larger field used for collision recovery). The audit server holds no database state.&#8201;[^10] |
| **Asymmetry kind** | **Compute-symmetric between the two DB servers**; the third party is a *helper* (audit server) doing strictly less work — `O(√L)` hashes, no DB scan — but is required to be present and honest enough that no two of the three collude. We classify this as `symmetric.dpf` (DPF-based, both database servers identical) rather than `asymmetric.role` (where one server is a thin client-helper) because the asymmetric helper holds no replica of the data and is not a "server" in the PIR-database sense — it is an audit oracle. |
| **Non-collusion** | Required between **every pair** of the 3 servers. If `A` + audit collude: they can recover `d_A` and the AlmostEqual transcript, but `d_B` is still uniformly random to them, so no privacy break. If `A` + `B` collude: they recover the database without the audit, breaking privacy entirely. Hence the protocol's stated bound: `t = 1`.&#8201;[^3] |
| **Network model** | Synchronous *time epochs* (e.g., one epoch = a few hours, `m ≈ 10 000` writers, or a fixed time budget). Within an epoch, clients submit asynchronously to the servers; at epoch end, servers reveal their shares. Clients need only be online long enough to upload one write request.&#8201;[^11] |
| **Forward security** | Riposte achieves *forward security*: even if **all** server secret keys (and the encrypted-channel secrets) are compromised after the epoch ends, an adversary still cannot link clients to messages, provided communication channels are forward-secret (e.g., IKEv2/TLS with forward-secret key exchange).&#8201;[^12] |

[^10]: §3.1 toy protocol (p. 5): "we have two servers, `A` and `B`, and each server stores an `L`-bit bitstring, initialized to all zeros. … the bitstrings represent shares of the database state and each 'row' of the database is a single bit." §4.2/4.3 (pp. 8–9): generalised to `d_ℓ = Σ_i Σ_j Eval(k_{i,j}, ℓ) = Σ_i P_{ℓ_i, m_i}(ℓ) ∈ F`.
[^11]: §3 (p. 3): "The Riposte cluster divides time into a series of epochs. During each time epoch, servers collect many write requests from clients. When the servers agree that the epoch has ended, they combine their shares of the database to reveal the clients' plaintext messages." §3 (p. 3): "a client need only stay online for long enough to upload its write request to the servers."
[^12]: §3.3 (p. 7): "Even the first-attempt scheme sketched in Section 3.1 provides *forward security* in the event that all of the servers' secret keys are compromised … the adversary will be unable to determine which of the `n` clients submitted which of the `n` plaintext messages with a non-negligible advantage over random guessing. (We assume here that clients and servers communicate using encrypted channels which themselves have forward secrecy [56].)"

### System Context

| Field | Value |
|-------|-------|
| **Application** | Anonymous broadcast messaging — primary deployments envisioned: anonymous **microblogging** (Twitter-like) and **whistleblowing**, where the system protects against traffic-analysis attacks by a global network adversary while supporting million-user anonymity sets.&#8201;[^13] |
| **Key constraints driving design** | (1) Anonymity sets of millions of users (DC-nets cap at thousands; verifiable mix-nets at ~100 K); (2) latency-tolerant write-only workload (whistleblowers / microbloggers can wait hours per epoch); (3) global passive + active network adversary (rules out Tor / mix-nets); (4) read-heavy: most users are passive readers, only a small fraction write per epoch.&#8201;[^14] |
| **System architecture** | Two database servers + one audit server form one "logical" Riposte cluster. Within an epoch, clients submit DPF-encoded write requests; servers run AlmostEqual + a 3-party check on each request, accept or reject, and apply accepted requests to their local share. At epoch end, servers reveal `d_A ⊕ d_B` to publish the bulletin board (the union of clients' messages). Each "logical" server may be implemented as a state-machine-replicated cluster of physical machines for benign-fault tolerance.&#8201;[^15] |
| **Where PIR fits** | Each *write* is a 3-server DPF-based PIR-write — a `(2,1)`-DPF compresses the `1`-hot write vector `m·e_ℓ ∈ F^L` from `O(L)` bits down to two `O(√L)`-bit DPF keys. This is the "PIR in reverse" formulation of Ostrovsky–Shoup.&#8201;[^2] |
| **Read access** | Riposte is broadcast: at end of epoch the servers publish the entire bulletin board (`d = d_A ⊕ d_B`), so all clients (including read-only clients submitting "empty" cover writes to inflate the anonymity set) see all messages. There is no per-row read protocol — reads are public.&#8201;[^16] |

[^13]: Abstract (p. 1): "Riposte is the first such system, to our knowledge, that simultaneously protects against traffic-analysis attacks, prevents anonymous denial-of-service by malicious clients, and scales to million-user anonymity sets. … For latency-tolerant workloads with many more readers than writers (e.g. Twitter, Wikileaks), we demonstrate that a three-server Riposte cluster can build an anonymity set of 2,895,216 users in 32 hours."
[^14]: §1 (p. 1) and §6.3 (p. 17): "anonymity systems [28, 34], Riposte offers a combination of security and scalability properties unachievable with current designs. … prior DC-net-based systems scaled to 5,120 clients and prior verifiable-shuffle-based systems scaled to 100,000 clients. In contrast, Riposte scales to millions of clients for certain applications." §6.3 (p. 17): "Riposte can handle such large anonymity sets as long as (1) clients are willing to tolerate hours of messaging latency, and (2) only a small fraction of clients writes into the database in each time epoch."
[^15]: §2.2 (p. 4): "To protect against benign failures, server maintainers could implement a single 'logical' Riposte server with a cluster of many physical servers running a standard state-machine-replication protocol [60, 71]."
[^16]: §1 (p. 2): "by having read-only users submit 'empty' writes to the system, the effective anonymity set can be much larger than the number of writers, with little impact on system performance." §3 (p. 3): "After collecting write requests from many clients, the servers combine their shares to reveal the plaintexts represented by the write requests."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | (a) **Distributed Point Functions** of Gilboa–Ishai (EUROCRYPT 2014) [43] and the simpler Chor–Gilboa cPIR (STOC 1997) [21]. (b) **Client/server DC-nets** of Wolinsky et al. (Dissent in Numbers, OSDI 2012) [82] and Chaum's DC-nets [18] for the secret-sharing structure. (c) **Ostrovsky–Shoup private information storage** [72] for the "PIR-in-reverse" formulation. (d) **Goldreich–Micali–Wigderson** secure MPC [47] / Bos–den Boer disrupter detection [12] for the AlmostEqual protocol style. |
| **What changed** | First system to combine all three of: traffic-analysis resistance, disruption resistance against malicious clients, and millions-scale anonymity sets. The novel synthesis is using DPFs (a PIR primitive) "in reverse" to compress what would otherwise be `O(L)`-sized DC-net broadcasts down to `O(√L)`-sized keys. |
| **Superseded by** | **Express** (USENIX Security 2021) — eliminates the third audit server, reduces audit communication from `O(√L)` to `O(λ)`, supports asynchronous reads. **Sabre** (NDSS 2022) — further auditing-cost reduction. |
| **Concurrent work** | Boyle–Gilboa–Ishai "Function Secret Sharing" (EUROCRYPT 2015, [13]) — generalises DPFs; published the same year. Their 2016 follow-up [14] subsumes Riposte's DPF-checking protocol with one that is server-only `O(1)` communication and was used by Express. |

### Core Idea

Riposte synthesises three techniques to build an anonymous bulletin board: (1) a 2-of-2 *additive secret-sharing* of an `F^n` database between two non-colluding servers (DC-net-style write privacy); (2) a `(2,1)`-Distributed Point Function with `O(√L)` keys (Chor–Gilboa cPIR adapted "in reverse") to compress each client's logical `L`-bit write vector down to two `O(√L)`-bit shares — yielding a 4 000× bandwidth reduction at `L = 2²⁰`;&#8201;[^17] and (3) a 3-party *AlmostEqual* check (with a third audit server, or alternatively Pedersen-commitment NIZKs in an `s`-server variant) that lets the two database servers — without learning the write index — confirm that a client's two DPF keys differ at exactly one position, before applying the write. Two-way (or `k`-way) collision recovery via field-arithmetic encoding shrinks the database table to `n ≈ 2.7 m` for 95% delivery, so a 1 M-user epoch needs only a 2.7 M-row table.&#8201;[^18]

[^17]: §4.3 (p. 10): "When using a database table of one million rows in length (`L = 2²⁰`), a row length of 1 KB per row (`F = F_{2⁸¹⁹²}`), and a PRG seed size of 128 bits (using AES-128, for example) the keys will be roughly 263 KB in length. For these parameters, the keys for the naïve construction (Section 3.1) would be 1 GB in length. Application of efficient DPFs thus yields a 4,000× bandwidth savings in this case."
[^18]: §3.2 (p. 7): "Using `k > 2` further reduces the table size as the desired success rate approaches one." `n ≈ 2.7m` for `k = 2` at 95% rate.

### Novel Primitives / Abstractions

#### Primitive 1 — `(s, t)`-Distributed Point Function (formalised; first information-theoretic toy + first DPF for `s ≥ 3` from seed-homomorphic PRG)

| Field | Detail |
|-------|--------|
| **Name** | `(s, t)`-Distributed Point Function (DPF) |
| **Type** | Cryptographic primitive (function-secret-sharing for point functions) |
| **Interface** | `Gen(ℓ, m) → (k_0, …, k_{s−1})` (split point function `P_{ℓ,m}`); `Eval(k, ℓ′) → m′` (evaluate `i`-th share at index `ℓ′`). Correctness: `Σ_i Eval(k_i, ℓ′) = P_{ℓ,m}(ℓ′)`.&#8201;[^19] |
| **Security definition** | `(s,t)`-privacy: any subset of at most `t` keys leaks no information about `(ℓ, m)` — there exists a PPT simulator `Sim(S)` such that `D_{S,ℓ,m} ≈_c Sim(S)`.&#8201;[^20] |
| **Purpose** | Compresses the all-zero-except-one write vector `m·e_ℓ ∈ F^L` from `O(L)` bits to `O(√L)` (or `polylog L`) bits per share. |
| **Built from** | (a) Toy: information-theoretic `(s, s−1)`-DPF with length-`L` keys (no PRG). (b) `(2,1)`-construction: a simplification of Chor–Gilboa cPIR with `O(√L)` keys, using **only AES** (a standard PRG `G : S → F^y`). Database is reshaped as an `x × y` matrix with `xy ≥ L`; the key contains a length-`x` vector `b` of "selector bits", `x` PRG seeds `s`, and a length-`y` "patch" vector `v`. Optimal `x = c√L`, `y = (1/c)√L` with `c = √(β/(1+α))`. (c) `(s, s−1)`-construction: novel construction using a *seed-homomorphic PRG* (DDH-based, e.g., `G(σ) = (σP_1, σP_2, …, σP_y)` over an elliptic curve) to split the patch across `s` keys.&#8201;[^21] |
| **Standalone complexity** | `(2,1)`: Gen `O(√L)`, Eval `O(L)` (full expansion) but `O(1)` per index, key size `(1+α)x + β y = O(√L)`. `(s, s−1)`: same key size but Eval requires `O(L)` *elliptic-curve* scalar multiplications instead of AES (orders of magnitude slower). |
| **Relationship to prior primitives** | Generalises Gilboa–Ishai DPFs [43] from `s = 2` to arbitrary `s` and arbitrary collusion threshold `t`. The `(s, s−1)`-DPF construction is novel to this paper.&#8201;[^22] |

[^19]: Definition 5 (p. 8): "Fix a positive integer `L` and a finite field `F`. An `(s,t)`-distributed point function consists of a pair of possibly randomised algorithms `Gen(ℓ, m) → (k_0, …, k_{s−1})` … `Eval(k, ℓ′) → m′` … For a collection of `s` keys generated using `Gen(ℓ, m)`, the sum of the outputs of these keys (generated using `Eval`) must equal the point function `P_{ℓ,m}`."
[^20]: Definition 5 privacy clause (p. 8): "Let `S` be any subset of `{0, …, s−1}` such that `|S| ≤ t`. … We say that an `(s,t)`-DPF maintains privacy if there exists a p.p.t. algorithm `Sim` such that the following distributions are computationally indistinguishable: `D_{S,ℓ,m} ≈_c Sim(S)`."
[^21]: §4.3 (pp. 9–10) for the `(2,1)` construction with the `x × y` matrix layout, key tuple `(b, s, v)`, and optimal `x = c√L`, `y = (1/c)√L`. §4.4 (pp. 10–11) for the `(s, s−1)` construction using a seed-homomorphic PRG `G : (S, ⊕) → (G^y, ⊗)`. Definition 6 (p. 11): seed-homomorphic PRG.
[^22]: §4.4 (p. 11): "this `(s, s−1)`-DPF construction is novel, as far as we know. In recent work, Boyle et al. present a `(s, s−1)`-DPF construction using only symmetric-key operations, but this construction exhibits a key size *exponential* in the number of servers `s`."

#### Primitive 2 — AlmostEqual three-party check (and `(s, s−1)` ZK audit)

| Field | Detail |
|-------|--------|
| **Name** | AlmostEqual (3-server version) / Pedersen-commitment NIZK audit (`s`-server version) |
| **Type** | 3-party MPC sub-protocol (AlmostEqual) and NIZK protocol (ZK version) for DPF well-formedness |
| **Interface** | Inputs: `v_A ∈ F^n` (server `A`), `v_B ∈ F^n` (server `B`), audit server has no input. Output (to `A` and `B`): single bit *accept* iff `v_A` and `v_B` differ at exactly one index, and one malicious server (and the client) learns nothing about that index.&#8201;[^23] |
| **Security definition** | Completeness, soundness, zero-knowledge in the random-oracle model (corrected version uses RO-modelled SHA-256; original used a universal hash and was actively attackable).&#8201;[^5] |
| **Purpose** | Detect malformed write requests — enforce that one DPF write vector has Hamming weight ≤ 1 (otherwise a malicious client could corrupt many rows in one request, mounting an anonymous DoS). |
| **Built from** | A coin-flipping shared `ρ ∈ {0,1}^λ` between `A` and `B`; `n` random masks `r_i` derived from a PRG seed `σ` shared by `A`, `B`; per-index hashes `m_i = H(v_A[i], r_i)` blinded by `ρ`; the audit server compares the two blinded sequences `m_A`, `m_B` (cyclically shifted by an `f ∈ Z_n` derived from `σ`) for exact equality except at one position. Communication: `O(√L)` from each DB server to the audit server, `O(1)` from audit to DB servers.&#8201;[^24] |
| **Soundness** | Negligible in `λ` (RO assumption). The corrected protocol explicitly closes a soundness gap pointed out by Boyle and Ishai in the original S&P 2015 version.&#8201;[^5] |
| **`(s, s−1)`-variant** | Uses Pedersen commitments to the DPF key components and a discrete-log-style NIZK to prove that the homomorphic sum of the commitments commits to a point function (i.e., to a vector that is zero everywhere except one index, where it commits to `1`).&#8201;[^25] Cost: `Θ(L)` elliptic-curve operations per server per request — drastically more expensive than AlmostEqual but tolerates `s − 1` malicious servers. |

[^23]: §5.1 (pp. 12–13): the three servers "want to execute this check in such a way that the following properties hold: Completeness … Soundness … Zero knowledge. If `v_A` and `v_B` are well formed and the client is honest, then any one actively malicious server can simulate its view of the protocol execution."
[^24]: §5.1 (pp. 12–13) details the protocol; §5.1 (p. 13) summary: "This three-party protocol is very efficient — it only requires `O(√L)` applications of a hash function and `O(√L)` communication from the servers to the auditor."
[^25]: §5.2 (pp. 13–14): "we apply zero-knowledge techniques to allow clients to prove the well-formedness of their write requests. This technique works in combination with the `(s, s−1)`-DPF presented in Section 4.4 and maintains client write-privacy when *all but one* of `s` servers is dishonest. … The keys for the `(s, s−1)`-DPF scheme are tuples `(b_i, s_i, v)` such that `Σ b_i = e_{ℓ_x}`, `Σ s_i = s* · e_{ℓ_x}`, `v = m · e_{ℓ_y} − G(s*)`."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | (a) **Three-server variant:** OWF (for AES-as-PRG) + RO model (for SHA-256). No public-key crypto. (b) **`s`-server variant:** DDH (for seed-homomorphic PRG over P-256) + Pedersen-commitment binding (discrete log) + NIZK-in-ROM (Fiat–Shamir). |
| **Encryption/encoding scheme(s)** | 2-of-2 additive secret-sharing over `F` (binary `F_{2^k}` for the basic scheme, `F_p` with `p = 2⁶⁴ − 59` for collision recovery). DPF for write-vector compression. |
| **Ring / Field** | `F = F_{2^k}` (`k = 8192` for 1 KB rows, `k = 1280` for 160-byte rows) for binary scheme; `F = F_p` with `p = 2⁶⁴ − 59` for two-way collision recovery (each cell stores `(m, m²) ∈ F²`, doubling cell size).&#8201;[^26] |
| **Key structure** | DPF keys: `(b, s, v)` with `b ∈ {0,1}^x`, `s ∈ S^x` (PRG seeds, 128-bit AES keys), `v ∈ F^y`. Audit server holds no long-term key. Per-message AES-CTR nonces bound to epoch ID for replay protection. |
| **Correctness condition** | DPF: deterministic when the field is binary (Case I: equal seeds → `g_A = g_B`, sum cancels; Case II/III: matrix-position case analysis).&#8201;[^27] System-level: probabilistic, with collision rate governed by `m/n` ratio and `k`-way recovery degree. |

[^26]: §3.2 (p. 6): "Let us assume that the messages being written to the database are elements in some field `F` of odd characteristic (say `F = F_p` where `p = 2⁶⁴ − 59`). … the client will actually write the pair `(m_A, m_A²) ∈ F²` into location `ℓ`."
[^27]: Appendix B (pp. 23–24): correctness proof for `(2,1)`-DPF by case analysis on `(ℓ_x, ℓ_y)` versus `(ℓ′_x, ℓ′_y)`.

### Key Data Structures

- Database table: `n × L`-cell array of `F`-elements. Conceptually flat; the DPF Eval treats each cell as one of `xy = L` positions. With `k`-way collision recovery, each cell stores `k` field elements (`m, m², …, m^k`).&#8201;[^28]
- DPF key: tuple `(b, s, v)` where `b ∈ {0,1}^x` is the row-selector bit-vector, `s ∈ S^x` is the seed-vector, `v ∈ F^y` is the patch vector. Size: `(1+α)x + β y` with `α = log_2|S| = 128`, `β = log_2|F|`.&#8201;[^29]
- Audit-server input (per request): two length-`n` blinded hash vectors `m_A, m_B ∈ {0,1}^{λ × n}` of total size `O(√L)` (after compression via the PRG-shifted equality check), plus two `λ`-bit check values `c_A, c_B`, plus two `λ`-bit digests `d_A, d_B` from the client.

[^28]: §3.2 (p. 7): "to handle `k`-way collisions, we increase the size of each cell by a factor of `k` and have each client `i` write `(m_i, m_i², …, m_i^k) ∈ F^k` to its chosen cell."
[^29]: §4.3 (p. 10): `|k| = (1+α)x + β y`; optimal `x = c√L`, `y = (1/c)√L` with `c = √(β/(1+α))`.

### Database Encoding

- **Representation:** flat `F`-vector of length `n` (the bulletin board), additively shared between the two DB servers. The DPF Eval routine internally reshapes as an `x × y` matrix.
- **Record addressing:** rows assigned at random by clients (writers do not need to coordinate), with collision recovery handling up to `k`-way collisions.
- **Preprocessing required:** none (no NTT, no FHE encoding).

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Servers | establish 3 servers, agree on field `F`, table size `n`, epoch ID; pre-share encrypted-channel keys with TLS | — | Once per cluster |
| Write request gen | Client | sample `(ℓ, m)`, run `Gen(ℓ, m) → (k_A, k_B)`, send one DPF key + a hash digest to each DB server over TLS | `O(√L)` ↑ to each of `A`, `B` | Per write |
| AlmostEqual audit | DB servers + audit | `A`, `B` compute blinded hash vectors of their full `Eval(k_·, [n])` images, send to audit server; audit server checks equality except at one index, returns 1 bit | `O(√L)` `A`→audit, `O(√L)` `B`→audit, `O(1)` audit→`A`,`B` | Per write |
| Apply write | DB servers | each adds `Eval(k_·, ·)` (length-`n` `F`-vector) to its local share `d_·` | — | Per accepted write |
| Reveal | DB servers | at end of epoch, exchange `d_A`, `d_B` and publish `d = d_A + d_B` | full DB ↓ to readers | Per epoch |

### Three-Server Protocol Details

| Aspect | Server `A` | Server `B` | Audit server |
|--------|-----------|-----------|--------------|
| **Data held** | share `d_A ∈ F^n` | share `d_B ∈ F^n` | none (ephemeral state per request) |
| **Query received** | DPF key `k_A` | DPF key `k_B` | blinded hash vectors `m_A`, `m_B` and check values `c_A`, `c_B` from `A`/`B`, plus digests `d_A`, `d_B` from client |
| **Computation** | `v_A := Eval(k_A, [n])`, then `n` hashes `H(v_A[i], r_i)`, blind with `ρ`, send to audit | symmetric: `v_B := Eval(k_B, [n])`, `n` hashes, blind with `ρ`, send to audit | (1) compare blinded `m_A`, cyclically-shifted `m_B` for exact-equality-except-one-index; (2) check `c_A = c_B`; (3) check `d_A`, `d_B` match client digests; output 1 bit |
| **Cost per request** | `O(√L)` AES (Eval) + `O(L)` hashes (AlmostEqual) — **dominated by AES expansion at the table sizes evaluated**&#8201;[^30] | identical to `A` | `O(√L)` string comparisons; minimal CPU/storage |
| **Security guarantee** | computational (PRG security of AES) | computational (PRG security of AES) | RO model for `H` |
| **Non-collusion** | required vs `B` (else DB privacy lost) | required vs `A` | required vs both `A` and `B` (else can collude with one DB server to learn write index) |

[^30]: §6 boxed remark (p. 14): "When using Riposte with table size `L`, we expect that the cost of the `O(L)` AES operations required for DPF key expansion to dominate the `O(√L)` hashing operations needed for auditing."

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| DPF key (per server) | client ↑ | `O(√L)` ≈ 263 KB at `L = 2²⁰`, 1 KB rows | No | Per write |
| Client→audit digest | client ↑ | `2λ` (`d_A, d_B`) | No | Per write |
| AlmostEqual (DB→audit) | server ↑ | `O(√L)` per DB server | No | Per write |
| Audit→DB ack bit | audit ↓ | 1 bit | No | Per write |
| Bulletin-board reveal | server ↓ | `n · k · log|F|` bytes | once per epoch | Per epoch |

At `L = 2²⁰` rows × 160 B with `m = 2¹⁰` writers, total data transfer per request from one DB server is **1.23 MB** (compared to 750 MB for a 2-server DC-net at the same parameters).&#8201;[^31]

[^31]: §6, §1 (pp. 2, 15): "Writing into a 377 MB table requires each client to upload less than 1 MB of data to the servers. In contrast, a two-server DC-net-based system would require each client to upload more than 750 MB of data." Figure 5 (p. 16): at `L = 2.5 GB`, total transfer ≈ 1.23 MB per request.

### Correctness Analysis (Probabilistic)

| Field | Detail |
|-------|--------|
| **Failure mode** | Two failure layers: (a) DPF correctness — perfect by Appendix B case analysis (no failure); (b) AlmostEqual completeness — fails with negligible probability over the random oracle if vectors `v_A, v_B` differ in exactly one index (server may falsely reject); (c) **collisions** — two or more writers select the same row, and the `k`-way encoding's polynomial system is unsolvable. |
| **Failure probability** | Collision rate (the dominant practical failure): with table of `n` cells and `m` writers, probability that exactly one ball lands in a given bin is `(m/n)(1 − 1/n)^{m−1}` ≈ `m/n − (m/n)² + ½(m/n)³`. For `k = 2`: `E[SuccessRate] ≈ 1 − ½(m/n)² + ⅓(m/n)³`.&#8201;[^7] AlmostEqual soundness/completeness: negligible in `λ` (RO model). |
| **Probability grows over queries?** | Yes per epoch — a writer who collides must re-submit in a future epoch. Across epochs, no degradation. |
| **Probability grows over DB mutations?** | N/A (no long-term DB; each epoch starts from zero). |
| **Key parameters affecting correctness** | `m` (writers per epoch), `n` (table size), `k` (collision-recovery degree), `λ` (security parameter for AlmostEqual). |
| **Proof technique** | DPF correctness: case analysis (Appendix B). AlmostEqual: completeness + soundness + ZK proofs in Appendix C/D, RO model. Collision rate: balls-and-bins / binomial expansion. |
| **Amplification** | Adaptive table-size doubling: "if too many collisions are detected at the end of an epoch the servers can adaptively double the size of the table so that the next epoch has fewer collisions."&#8201;[^32] |
| **Adaptive vs non-adaptive** | Privacy holds against adaptive adversaries (write-privacy game in Appendix A is fully adaptive). Collision analysis assumes honest writers select rows uniformly; adversarial clients may try to force collisions, but their effect is bounded by `m̂` (the malicious-client bound) and reduces honest cell count to `n − m̂`.&#8201;[^33] |
| **Query model restrictions** | One write per client per epoch; no read protocol (reads are public). Forward security holds across epochs.&#8201;[^12] |

[^32]: §3.2 (p. 7): "if too many collisions are detected at the end of an epoch the servers can adaptively double the size of the table so that the next epoch has fewer collisions."
[^33]: §3.2 (p. 7): "given a bound `m̂` on the number of malicious clients we can calculate the required table size `n`."

### Complexity

#### Core metrics

| Metric | Asymptotic | Concrete (`L = 2²⁰`, 160-byte rows, 3-server variant) | Phase |
|--------|-----------|---------------------------|-------|
| Query (DPF key) size | `O(√L)` | ~263 KB at 1 KB rows; smaller at 160 B | Online |
| Audit traffic per server | `O(√L)` | sub-linear; total client+server transfer 1.23 MB at `L = 2.5 GB` | Online |
| Server computation per write | `O(L)` AES + `O(√L)` hashes (3-server); `O(L)` EC ops (`s`-server) | 1 M-row table → 2.86 req/s on 4-core E3-1260L | Online |
| Client computation per write | `O(√L)` PRG + a few hashes | sub-second JS-feasible; light enough for cover-traffic clients | Online |
| Throughput (writes/sec) | — | 751.5 / 32.8 / 2.86 / 1.4 at `L = 64 / 65 K / 1 M / 2.4 M` 160-byte rows&#8201;[^34] | Online |
| Reveal (epoch end) | `O(n · k · log|F|)` | full table broadcast; once per epoch | Offline |

[^34]: §1 (p. 2): "When the servers maintain a database table large enough to fit 65,536 160-byte Tweets, the system can process 32.8 client write requests per second. … When using a larger 377 MB database table (over 2.3 million 160-byte Tweets), a Riposte cluster can process 1.4 client write requests per second." §6.1 (p. 15): "For a database table of 64 rows, the system handles 751.5 write requests per second. At a table size of 65,536 rows, the system handles 32.8 requests per second. At a table size of 1,048,576 rows, the system handles 2.86 requests per second."

#### `s`-server variant cost (DDH-based)

| Metric | Concrete |
|--------|----------|
| Server PRG cost per Eval | each 32-byte block of PRG output = one P-256 scalar multiplication |
| Throughput at `L = 1024` rows | 1 request / 3.44 s (8-server cluster) |
| Throughput at `L = 10⁶` rows | "nearly one hour" per request — ~12 000× slower than the 3-server protocol&#8201;[^35] |

[^35]: §6.2 (p. 16): "Processing a single request with a table size of one million rows would take nearly one hour with this construction, compared to 0.3 seconds in the AES-based three-server protocol." Figure 7 (p. 17): throughput vs server count.

### System-Level Performance

| Metric | Value | Configuration |
|--------|-------|---------------|
| Largest anonymity set demonstrated | **2,895,216 users in 32 hours** | 3-server cluster, 65,536-row 160-byte table, ~25.19 req/s sustained&#8201;[^36] |
| Throughput at 64-row table | 751.5 req/s | bandwidth-bound by TLS setup at very small `L` |
| Throughput at `L = 10⁶` | 2.86 req/s (3-server); ~1/3600 req/s (8-server) | CPU-bound on AES-NI for 3-server; EC-bound for `s`-server |
| AES throughput ceiling | 605 MB/s in Go (Go crypto), ~3.9 GB/s with OpenSSL — implementation is bound by Go AES, not the algorithm | port to C/AES-NI estimated to give up to 6× speedup |
| Hardware | 4-core Intel E3-1260L @ 2.4 GHz, 16 GB RAM, Ubuntu 14.04, AES-NI | Go implementation, DeterLab testbed |
| Networking | 100 Mbps server↔server, 1 Gbps client↔switch, 20 ms RTT (DeterLab) | "fast WAN" emulation |
| Comparison vs Twitter | to handle 5,700 Tweets/s like 2013 Twitter, would need ~1,750× more DB servers + ~5,250 audit servers (4,000 total) split across 3 datacentres | §6.3 |
| Anonymity set vs prior systems | **2.9 M** vs 5,120 (Dissent DC-nets) and 100,000 (Bayer–Groth verifiable shuffles) | §1 |

[^36]: §6.3 (p. 17): "we configured a cluster of Riposte servers with a 65,536-row database table and left it running for 32 hours. In that period, the system processed a total of 2,895,216 write requests at an average rate of 25.19 requests per second."

### Variants

| Variant | Trust model | Key Difference | Cost | Best For |
|---------|-------------|---------------|------|---------|
| **Three-server** (main) | 3 servers, `t = 1`, no two collude | `(2,1)`-DPF + AlmostEqual audit | AES-only; ~33 req/s at `L = 2¹⁶` | Practical large-scale deployment |
| **`s`-server** | `s` servers, `t = s − 1` | `(s, s−1)`-DPF (DDH seed-homomorphic PRG) + Pedersen+NIZK audit | EC-heavy; ~10⁴× slower | High-security regimes where assuming any 2-of-3 honest is too strong |

### Comparison with Prior Work

| Metric | Riposte (3-svr) | Dissent (DC-nets) [82] | Bayer–Groth verifiable shuffle [5] | Pung (concurrent style; later, single-server) |
|--------|----------------|------------------------|-----------------------------------|-----------------------------------------------|
| Anonymity set scaling | 2.9 M users / 32 h | ≤ 5,120 | ≤ 100 K | n/a (different model) |
| Per-client upload | `O(√L)` ≈ 263 KB | `O(L)` ≈ 750 MB at `L = 2²⁰` | `O(N)` group elements | small (HE ciphertext) |
| Active traffic-analysis resistance | ✓ | ✓ | partial | n/a |
| Crypto needed (steady state) | symmetric only (3-svr) | sym + ZK | `16 N` group exponentiations | RLWE FHE |
| Trust model | 1-of-3 honest | strict (server-only) | 1 honest verifier | 1 server (malicious) |

**Key takeaway:** Riposte is the first single-tier anonymous-broadcast system that simultaneously achieves traffic-analysis resistance, malicious-client disruption resistance, and million-user anonymity sets. Use it when (a) the deployment can field 3 mutually-distrusting non-colluding parties (e.g., 3 datacentres or 3 organisations), (b) write workloads are sparse vs read workloads, and (c) hours-scale latency is acceptable. For lower-latency / 2-server deployments with even better audit cost, see Express (its successor).

### Implementation Notes

- **Language / Library:** Go (standard `crypto` library); source at `https://bitbucket.org/henrycg/riposte/`.&#8201;[^37]
- **PRG:** AES-128-CTR (Go's `crypto/aes`, AES-NI-accelerated); benchmarked at 605 MB/s in Go vs 3.9 GB/s in OpenSSL — 6× headroom by porting hot path to C.
- **Hash:** SHA-256 (corrected protocol; original used Poly1305-AES MAC).
- **EC group (`s`-server only):** NIST P-256 (`crypto/ecdsa` Go library).
- **Polynomial arithmetic:** N/A (no FHE / no NTT).
- **Parallelism:** server CPU-bound on AES expansion; sharding across `k` machines gives near-`k`-fold speedup (DPF Eval is embarrassingly parallel).&#8201;[^38]
- **TLS:** all client↔server and server↔server links use TLS for confidentiality, integrity, and forward-secret session keys.

[^37]: §6 (p. 15): "We wrote the prototype in the Go programming language and have published the source code online at `https://bitbucket.org/henrycg/riposte/`."
[^38]: §1 (p. 2): "the system's capacity to handle client write request scales with the number of available CPU cores. A large Riposte deployment could shard the database table across `k` machines to achieve a near-`k`-fold speedup."

### Application Scenarios

- **Anonymous microblogging (Twitter-like):** 140-byte Tweets in 160-byte rows; 1 M-user anonymity set with 65,536-row table → 0.3% writers per epoch, < 5% collision rate; epoch ≥ 11 hours for 1 M users.&#8201;[^39]
- **Anonymous email:** 4 KB rows; 2.86 req/s at 40,960-row table.
- **Whistleblowing:** anonymous publication into a public bulletin board; tolerates hours of latency.
- **Read-only "cover" clients:** read-only users submit "empty" writes (zero messages into a fixed first row) to inflate the anonymity set without affecting collision rates.&#8201;[^40]

[^39]: §6.3 (p. 17): "to get an anonymity set of roughly 1,000,000 users with a three-server Riposte cluster and a database table of size 65,536, the time epoch must be at least 11 hours long."
[^40]: §6.3 (p. 17): "the client application would also allow read-only users to submit an 'empty' write request to the Riposte cluster that would always write a random message into the first row of the Riposte database. From the perspective of the servers, a read-only client would be indistinguishable from a read-write client."

### Deployment Considerations

- **Database updates:** N/A — each epoch starts from zero; no long-lived DB state.
- **Sharding:** supported — DB table can be sharded across `k` machines per logical server, near-linear speedup.
- **Key rotation / query limits:** one write per client per epoch; AES keys rotated per request (PRG seeds in DPF keys are fresh).
- **Anonymous query support:** native — that *is* the application.
- **Session model:** ephemeral; client need only stay online to upload a single ~1 MB request.
- **Cold start suitability:** yes — no offline phase, no client-state preprocessing.
- **Forward security:** yes — even if all server keys are compromised after the epoch ends, anonymity is preserved.&#8201;[^12]
- **Intersection attacks:** acknowledged but **out of scope** — across many epochs an adversary with sustained surveillance can statistically link clients to message streams. Riposte mitigates by being *large* per epoch (millions of users), not by removing the leak entirely.&#8201;[^41]

[^41]: §2.4 (p. 4): "Riposte makes it infeasible for an adversary to determine which client posted which message *within* a particular time epoch. If an adversary can observe traffic patterns *across* many epochs … intersection attacks typically become more difficult to mount as the size of the anonymity set increases, so Riposte's support for very large anonymity sets makes it less vulnerable to these attacks than are many prior systems."

### Key Tradeoffs & Limitations

- **3 servers must not collude in pairs** — strong deployment assumption; mitigated by recruiting 3 mutually-distrusting orgs / datacentres but still a hard real-world ask.
- **Synchronous epochs** — the system reveals the bulletin board only at epoch boundaries, so per-message latency is ≥ epoch length (hours for million-scale). Express later removes this.
- **AES-bound at large `L`** — DPF Eval is the bottleneck; throughput scales as `1/L` once AES-bound.
- **`s`-server variant is impractical at scale** — `Θ(L)` elliptic-curve scalar multiplications make it unsuitable for `L > 10⁴` rows.
- **No zero-knowledge proofs implemented for the `s`-server variant** — the reported `s`-server throughput is an *upper bound*; with ZK proofs each request would incur an additional `Θ(√L)` EC operations per server, dwarfed only by the `Θ(L)` per-Eval cost.&#8201;[^42]
- **Read leak** — readers see the entire bulletin board, so all messages are public broadcasts. Per-recipient privacy must be added by client-side public-key encryption layered on top.

[^42]: §6.2 (p. 16): "We implemented the basic `s`-server protocol but have not yet implemented the zero-knowledge proofs necessary to prevent malicious clients from corrupting the database state (Section 5.2). These performance figures thus represent an *upper bound* on the `s`-server protocol's performance."

### Portable Optimizations

- **`(2,1)`-DPF with `O(√L)` keys via PRG-stretched matrix layout** — applicable to any 2-server PIR-write or PIR-read system where the database is large but rows are small; the key-size optimisation `(1+α)x + β y` with `xy ≥ L` minimised at `x = c√L`, `y = (1/c)√L` is the standard recipe.
- **AlmostEqual / shifted-blinded equality check** — a generic 3-party "two vectors are almost equal" subroutine usable beyond DPFs whenever you need to check that two MPC participants' inputs differ at exactly one index without revealing which.
- **`k`-way collision recovery via polynomial encoding** — applies to any anonymous mailbox / write system where collisions are frequent; trades cell width for table size.
- **Adaptive table-size doubling** — generic feedback control for write-only protocols with random row selection.
- **Read-only cover clients** — a deployment trick to inflate anonymity sets in any anonymous-broadcast system at low cost.

### Open Problems (stated by authors)

- Does there exist an `(s, s−1)`-DPF for `s > 2` that uses only symmetric-key operations?&#8201;[^43]
- Can disruption resistance be achieved without a non-colluding audit server, while still using only symmetric-key crypto? (This was answered in part by Boyle–Gilboa–Ishai 2016 [14] and exploited by Express in 2021.)
- Can DPFs enable amortised `o(L)` server time per write request for length-`L` databases?

[^43]: §8 (p. 19): "Does there exist an `(s, s−1)`-DPF construction for `s > 2` that uses only symmetric-key operations? Are there efficient techniques (i.e., using no public-key primitives) for achieving disruption resistance without the need for a non-colluding audit server? Are there DPF constructions that enable processing write requests in amortized time `o(L)`, for a length-`L` database?"

### Uncertainties

- The DPF key sizes "roughly 263 KB" at `L = 2²⁰`, `|F| = 2⁸¹⁹²` are quoted directly from §4.3; the smaller experimental setting (160-byte rows) yields proportionally smaller keys, but the paper does not give an exact figure for the 160-byte case.
- "0.3 seconds" for one request at `L = 10⁶` (3-server) appears in §6.2 in passing; the throughput figure of 2.86 req/s at `L = 2²⁰` (§1, §6.1) implies ~0.35 s/request, consistent.
- The corrected version (June 2021 arXiv) explicitly notes its evaluation reflects the corrected DPF-checking protocol; the original IEEE S&P 2015 numbers might be slightly different (cheaper universal hashing vs SHA-256), but the paper cautions only that "the cost of the `O(L)` AES operations … dominates the `O(√L)` hashing operations" so the difference is small.
