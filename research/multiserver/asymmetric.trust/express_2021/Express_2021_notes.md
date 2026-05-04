## Express — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Express: Lowering the Cost of Metadata-hiding Communication with Cryptographic Privacy](https://www.usenix.org/conference/usenixsecurity21/presentation/eskandarian) (USENIX Security 2021) |
| **Authors** | Saba Eskandarian (Stanford), Henry Corrigan-Gibbs (MIT CSAIL), Matei Zaharia (Stanford), Dan Boneh (Stanford) |
| **Archetype** | System (whistleblowing) + Construction (DPF-based PIR-write) + Security upgrade (active security against one malicious server via SNIP-wrapped DPF verification) |
| **Asymmetry profile** | **Trust-model asymmetry — 2-server, secure against an unbounded number of malicious clients AND one malicious server.** This is *not* PIR-read; Express is a **PIR-write / anonymous mailbox** scheme. Both servers carry equal computational and bandwidth load (no role/compute asymmetry); the asymmetry is solely in the active-security guarantee — Express tolerates a malicious server, where Riposte (its closest comparator) only tolerates 1-of-3 malicious servers and Pung tolerates a single fully-malicious server with much higher cost.&#8201;[^1] |
| **Security model** | Two non-colluding servers; security holds if at most one of the two is **actively malicious** (deviating arbitrarily from the protocol), and any number of clients are malicious. Metadata-hiding privacy and soundness against malformed writes are both proved in this model.&#8201;[^2] |
| **Additional assumptions** | OWF (for AES-CTR mailbox encryption, PRG-based DPF, PRG-based shared randomness, AES-based SNIP arithmetic). No public-key crypto in the steady-state write/read path. Deployment assumes the two servers' traffic is not jointly censorable.&#8201;[^3] |
| **Correctness model** | Probabilistic. Soundness of the auditing protocol (reject malformed writes with Hamming weight > 1) holds with error `ε = O(1/|F|)`; Express uses `F = F_p` with `p = 2^128 − 159`, so `ε ≈ 2^{-128}`.&#8201;[^4] Metadata-hiding holds unconditionally given DPF privacy and SNIP zero-knowledge. |
| **Rounds (online)** | 1 round client↔servers for the write payload, plus a constant-round server↔server SNIP verification (single multi-party check, communication `O(λ)` between servers). Reads are non-interactive (1 round). |
| **Record-size regime** | Application-driven: experiments span 160 B to 32 KB messages. Mailbox size is fixed per deployment; the SecureDrop-style whistleblowing target uses 32 KB documents.&#8201;[^5] |

[^1]: Abstract and §1 (pp. 1–2): "Express is a two-server system that provides cryptographic security against an arbitrary number of malicious clients and up to one malicious server. This security guarantee falls between that of Riposte [24], which provides security against at most one malicious server out of three total, and Pung [4], which can provide security even in the single-server setting where the server is malicious."
[^2]: §2.2 (p. 3): "A malicious server can stop responding to requests or corrupt the contents of users' mailboxes, but we require that even an actively malicious server cannot break our metadata-hiding property."
[^3]: §2.4 (p. 4): "Express relies on distributing trust among two servers. Thus, if traffic to either server is blocked, the system can no longer be accessed."
[^4]: Appendix B (p. 18): "the audit will reject, except with error probability `ε = O(1/|F|)`. By taking `F` to be a field of size `2^λ`, for security parameter `λ`, we can make the error probability `ε` negligibly small in `λ`." §7 (p. 11): "the prime `p = 2^128 − 159`, since these field elements have a convenient representation in two 64-bit words."
[^5]: §1 (p. 2) and §7 (p. 11): "evaluate Express on message sizes up to 32KB, larger than is used in the evaluations of Pung [4], Riposte [24] and Vuvuzela [58]."

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 (data servers `A` and `B`). Unlike Riposte's 3-server design, Express does **not** require a third auditing server.&#8201;[^6] |
| **Trust threshold** | 1-of-2 malicious tolerance: privacy and soundness hold if either server (but not both) deviates arbitrarily.&#8201;[^2] |
| **Servers replicate the data?** | Yes, both servers hold a 2-of-2 additive secret-sharing of the mailbox vector `D = D_A + D_B ∈ F^n`. Each server stores its own share, the page table mapping virtual→physical addresses (in the clear, because virtual addressing is only an integrity defence), and a per-mailbox AES-CTR key.&#8201;[^7] |
| **Asymmetry kind** | **Asymmetric trust** — both servers do equal work; the only "asymmetry" is that the protocol still holds when one of them is fully Byzantine. This is stronger than Riposte's honest-but-curious-with-1-malicious-out-of-3 and weaker than Pung's single-malicious-server (no trust split). |
| **Non-collusion** | Required. If both Express servers collude they can decrypt every mailbox and break write privacy entirely (the additive shares trivially combine). The deployment scenario envisions two organisations (e.g., WSJ + Washington Post) running one server each.&#8201;[^8] |
| **Network model** | Asynchronous; **no synchronised rounds** between clients (in contrast to Riposte/Pung/Vuvuzela). This is one of Express's two main contributions.&#8201;[^9] |

[^6]: §1 and §4.1 (pp. 1, 6): "our new auditing protocol that drops client computation … to `O(1)` and communication to `O(λ)` while simultaneously *eliminating the need for a third server* to perform audits."
[^7]: §3 and Figure 1 (p. 5, 7): "server `A` holds a vector `D_A ∈ F^n` and server `B` holds a vector `D_B ∈ F^n` such that `D = D_A + D_B`." Figure 1 caption: "Each server stores the conversion from virtual to physical addresses and a distinct key for each mailbox."
[^8]: §2.3 (p. 3): "The approach taken by Express … envisions a commercial infrastructure setting where only a small number of participants (e.g., for our example use case, the Wall Street Journal and the Washington Post) are needed to deploy the system with its full security guarantees."
[^9]: §1 and §3.2 (pp. 2, 5): "any client in Express can read from any mailbox, but each read returns a fresh re-randomized encryption of the mailbox contents that only the mailbox owner can decrypt … In contrast, prior systems such as Riposte, Pung, and Vuvuzela require *every* client to write before *any* client can read, so the whole system is forced to operate in synchronized rounds."

### System Context

| Field | Value |
|-------|-------|
| **Application** | Metadata-hiding messaging — primary deployment scenario is **whistleblowing** (a cryptographically secure variant of SecureDrop). Sources send leaks/tips into journalist-owned mailboxes; only the mailbox owner can read them.&#8201;[^10] |
| **Key constraints driving design** | (a) Asynchronous reads — sources may go quiet for arbitrary periods; (b) plausible deniability via cover traffic generated by the cooperating news org's homepage JavaScript; (c) low client cost so a browser-embedded JS client can run without disrupting page loads.&#8201;[^11] |
| **System architecture** | Two data servers (`A`, `B`) — e.g., WSJ + Washington Post — each holding additive shares of an array of mailboxes. Mailbox owners check their mailboxes asynchronously; clients write via DPF-encoded write requests. JS client embedded in news-org homepages generates cover writes.&#8201;[^11] |
| **Where PIR fits** | Each *write* is a 2-server PIR-write (anonymous one-of-`n` write, not a PIR-read). Reads simply return the encrypted mailbox content (no PIR — they reveal *which* mailbox is read; this is acceptable because mailbox-owner identity is journalist-public).&#8201;[^12] |

[^10]: §1 "Evaluation application" (p. 2): "We evaluate Express as a system for whistleblowers to send messages to journalists while hiding their communications metadata from network surveillance."
[^11]: §1, §6.1, §6.2 (pp. 2, 10): "Express's extremely low client computation and communication requirements lend themselves particularly well to this approach, since the client can easily run in the background on a web browser." §1: "an Express client implemented in JavaScript and embedded in a web page can generate copious cover traffic."
[^12]: §1 "Express architecture" (p. 1): "Crucially, Express hides which client wrote into which mailbox but does *not* hide which client *read* from which mailbox. This requires mailbox owners to check their mailboxes at a fixed frequency."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Riposte (S&P 2015) [24] — same DPF-based 2-of-2 secret-shared mailbox architecture; Boyle–Gilboa–Ishai DPFs [14, 15]; Prio's SNIPs (Boneh, Corrigan-Gibbs, Boneh et al. [11, 23]) for active-security upgrade of the auditing protocol.&#8201;[^13] |
| **What changed vs Riposte** | (i) Eliminates synchronised rounds via a careful read-mode mechanism that re-randomises mailbox contents on read (clients can read at any frequency without leaking metadata about writes); (ii) replaces Riposte's 3-server `Ω(λ√n)` / `Ω(√n)` audit with a 2-server `O(λ)` / `O(1)` audit (SNIP-wrapped Boyle et al. DPF verification); (iii) introduces *virtual addressing* (128-bit virtual addresses → physical mailbox indices) so a malicious client cannot target a specific honest mailbox without knowing its virtual address.&#8201;[^14] |
| **Superseded by** | None in this collection (canonical 2-server actively-secure DPF-based PIR-write). Successor work: Sabre (Vadapalli et al., 2022) — focuses on lower auditing overhead. Spectrum, Riposte successors. |
| **Concurrent / related work** | Pung [4] (single malicious server, public-key, much more expensive); Vuvuzela/Stadium/Karaoke (differential privacy, gradual leakage, faster). |

[^13]: §3 (p. 5) and §4.1 (p. 6): "starting point for Express is a technique for privately writing into mailboxes using distributed point functions [24, 33, 49]"; §4.1 references Boyle et al. verifiable DPF [15] and Prio SNIPs [23] explicitly: "our auditing protocol combines the verifiable DPF protocol of Boyle et al. [15], which only provides security against semi-honest servers, with secret-shared non-interactive proofs (SNIPs) first introduced in the Prio system [23]."
[^14]: §1, §3.2, §4.1, §4.2 (pp. 2, 5, 6–8): consolidated discussion of the three deltas vs Riposte. §1 (p. 6) re Riposte's audit limitations: "Riposte [24] … However, **their** [Riposte's] protocol takes advantage of the structure of a particular DPF construction that is less efficient than the one used by Express. Applying **their** [Riposte's] protocol to the more efficient DPFs used in Express would require client communication and computation `Ω(λn)` and `Ω(n)` respectively as well as the introduction of an additional non-colluding server." The `Ω(λn)` / `Ω(n)` figures are the cost of *naively porting Riposte's audit* to Express-style DPFs — not Express's own audit, which achieves `O(λ)` / `O(1)` via the SNIP-wrapped Boyle et al. verifier.

### Core Idea

Express is a 2-server anonymous-mailbox / PIR-write system where each *write* uses a Distributed Point Function (DPF) to compress the all-zeros-except-at-one-position write vector `m·e_{i*} ∈ F^n` into two `O(λ log N)` keyed function shares `f_A, f_B`, one sent to each server. The servers expand their shares, locally add to their share of the mailbox database, and re-randomise the encrypted contents so reads can be served asynchronously — without any synchronised round structure. The construction's two technical contributions are (1) an `O(λ)`-communication, `O(1)`-client-computation auditing protocol that wraps Boyle et al.'s verifiable DPF inside a Prio SNIP — eliminating Riposte's third "auditor" server while *upgrading* the audit from semi-honest to actively secure against one malicious data server; and (2) virtual addressing (128-bit address space mapped to ~`2^20` physical mailboxes) so a malicious client cannot corrupt a specific honest mailbox without its 128-bit address.&#8201;[^15]

[^15]: §1, §3, §4.1, §4.2, §5 — consolidated. §5 (p. 8): "the core Express protocol does not protect message integrity, so a malicious server could undetectably corrupt the contents of a mailbox. This can be remedied … by using MACs."

### Novel Primitives / Abstractions

#### Primitive 1 — Two-server SNIP-wrapped DPF verifier

| Field | Detail |
|-------|--------|
| **Name** | Two-server actively-secure DPF audit (Express's auditing protocol) |
| **Type** | Cryptographic sub-protocol for DPF correctness verification |
| **Interface** | Client posts `(f_A, f_B, π_A, π_B)`; servers `A`, `B` jointly run a one-shot interactive check that outputs `accept` iff `w := f_A.eval([n]) + f_B.eval([n])` has Hamming weight at most 1 over `F^n`. |
| **Security definition** | Completeness + soundness against malicious clients (negligible accept of bad `w`) + zero-knowledge against one malicious server (one server's view is simulatable from public inputs and its own share alone).&#8201;[^16] |
| **Soundness bound** | `ε = O(1/|F|)`; with `F = F_p`, `p = 2^128 − 159`, `ε ≈ 2^{-128}`.&#8201;[^4] |
| **Purpose** | Detect malformed write requests — the underlying mechanism enforcing that one DPF write touches at most one mailbox. |
| **Built from** | Boyle et al. semi-honest verifiable DPF [15] — the polynomial identity `f(r₁,…,r_n) = (Σ w_i r_i)² − m · (Σ w_i r_i²) ≡ 0` holds iff `w` has weight ≤ 1 — wrapped in a Prio SNIP [11, 23] to upgrade from semi-honest to malicious-server security.&#8201;[^17] |
| **Communication** | `O(λ)` between servers; `O(λ²+\|m\|)` total client→server proof input.&#8201;[^18] |
| **Client computation** | `O(1)` AES + field operations (constant!) — independent of `n`. The client knows `i*`, `r`, `m`, `w_{Ai*}`, `w_{Bi*}`, so it can compute the two SNIP check values `c* = r* · (w_{Ai*} + w_{Bi*})` and `C* = r*² · (w_{Ai*} + w_{Bi*})` directly in `O(1)` despite the servers needing to compute `c, C` via inner products of length `n`.&#8201;[^19] |
| **Relationship to prior primitives** | Strictly stronger than the Boyle et al. semi-honest verifier (adds malicious-server security at no asymptotic cost). Asymptotically smaller than Riposte's 3-server audit (`O(λ)` vs `Ω(λ√n)`). The SNIP itself proves only two field multiplications (`c·c` and `m·C`) → "constant-sized SNIP, i.e., size `O(λ)`."&#8201;[^20] |

[^16]: §4.1 (p. 7): "Properties of auditing protocol … Completeness, Soundness against malicious clients, Zero knowledge against malicious server."
[^17]: §4.1 (p. 6): "the following `n`-variate polynomial equals zero with high probability over the random choices of `r_1, …, r_n` if and only if (1) there is at most one nonzero `w_i` and (2) `m = w_i` for the nonzero value of `w_i`: `f(r_1, …, r_n) = (Σ w_i r_i)² − m·(Σ w_i r_i²)`."
[^18]: §5 Table 2 (p. 9): "Communication … Servers `O(λ)`."
[^19]: §4.1 step 2 "Client derives proof inputs" (p. 8): "the client need not compute them. Thus the client can compute the check values in only `O(1)` time even though the servers must do `O(n)` work to find them."
[^20]: §4.1 (p. 7): "the Boyle et al. verification protocol only requires two multiplications between shared values, the squaring and the multiplication by `m`, this results in a constant-sized SNIP (i.e. size `O(λ)`)."

#### Primitive 2 — Virtual addressing

| Field | Detail |
|-------|--------|
| **Name** | Virtual addressing for targeted-disruption resistance |
| **Type** | Engineering construct (not a cryptographic primitive per se) |
| **Interface** | Each mailbox has a 128-bit *virtual address* `v` and a `log₂(2^20)` ≈ 20-bit *physical address* `p`. Servers maintain a page table `v → p` *in the clear*. Clients send DPF shares `f_A, f_B : 2^λ → F` evaluated *only* at the virtual addresses currently registered, yet the DPF is over the full `2^λ` domain so a malicious client must guess an honest user's `v` to corrupt their mailbox. |
| **Security definition** | A malicious client without knowledge of an honest user's 128-bit virtual address can corrupt that mailbox with probability negligible in `λ`. |
| **Purpose** | Defends against *targeted* disruption that survives the auditing protocol (a write with Hamming weight 1 to a chosen honest mailbox). |
| **Cost** | DPF share size `O(λ²+\|m\|)` (function-domain `2^λ` → DPF tree depth `λ`); page-table lookup `O(1)`. |
| **Why DPFs are essential** | Older "square-root" DPF constructions would make a `2^128`-domain DPF infeasible; only the Boyle et al. log-domain DPF makes virtual addressing practical.&#8201;[^21] |

[^21]: §4.2 (p. 8): "Note that this trick is only possible because Express uses a DPF whose share sizes are *logarithmic* in the function domain size. Using virtual addresses with older square-root DPFs would result in infeasibly large message sizes and computation costs."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF only — used to instantiate AES-CTR (mailbox encryption, shared randomness PRG, DPF PRG, SNIP randomness). No public-key cryptography in the steady-state write/read path. The dialing sub-protocol (§6.2) optionally uses public-key encryption for journalist key publication, but the core protocol does not.&#8201;[^22] |
| **Encryption/encoding scheme(s)** | AES-CTR (mailbox encryption: each mailbox stored under per-mailbox keys `k_A`, `k_B` held only by the owner, encryption is commutative under add → enables read re-randomisation by add-then-decrypt-with-old-counter-then-encrypt-with-new-counter). DPF (Boyle–Gilboa–Ishai 2015/2016) for compressed write requests. SNIP (Prio) for active-security upgrade of audit. |
| **Ring / Field** | `F = F_p` with `p = 2^128 − 159` (prime; "field elements have a convenient representation in two 64-bit words").&#8201;[^4] |
| **Key structure** | Per-mailbox: client owns `k_A`, `k_B` (AES-CTR keys); server `A` holds `K_A`, server `B` holds `K_B` (one of the two each, indexed by physical address). Per-protocol-run: server `A`, `B` agree on a shared seed for `r ∈ F^n` PRG randomness. No long-lived public keys. |
| **Correctness condition** | `(c² − m·C) ≡ 0` iff DPF write has weight ≤ 1 — soundness `O(1/|F|)`. Reads always succeed (deterministic decryption). |

[^22]: §1 "Express only uses lightweight symmetric cryptographic primitives" and §7 (p. 11): "We use OpenSSL for cryptographic operations in C and base our DPF implementation in part on libdpf [18], which is in turn based on libfss."

### Key Data Structures

- **Mailbox database (per server):** array of `n_phys` physical mailboxes (≈ `2^20` actually-registered), each storing AES-CTR ciphertext (with a fresh nonce after each re-encryption). Server `A` has `D_A`, server `B` has `D_B`, with `D_A + D_B = D` plaintext-side.
- **Page table (per server):** `v → p` map from 128-bit virtual addresses to physical indices, stored in the clear (its only purpose is integrity).&#8201;[^23]
- **Per-mailbox keys:** server `A` holds `K_{Ap}` (per physical address `p`); server `B` holds `K_{Bp}`. Client (mailbox owner) holds both `k_A, k_B`.
- **DPF shares `f_A, f_B`:** each is an `O(λ² + |m|)` keyed function from `[2^λ] → F` (or `→ {0,1}^{|m|}` for byte-level messages); generated by client per write.&#8201;[^24]
- **SNIP proof shares `π_A, π_B`:** small (`O(λ)` field elements) proof of "`(c² − m·C) = 0`" from the client.

[^23]: §4.2 (p. 8): "the servers both hold the contents of the page table … in the clear."
[^24]: §3.1 (p. 5): "each function share (`f_A` and `f_B`) has bitlength `O(λ log N + |m|)`."

### Database Encoding

- **Representation:** flat array of `n_phys` mailboxes (no matrix, no NTT, no FHE).
- **Record addressing:** virtual `v ∈ [2^128]` → physical `p ∈ [n_phys]` via in-the-clear page table.
- **Preprocessing required:** none beyond initial registration of each mailbox (allocate `p`, sample random `v`, install AES keys `K_{Ap}, K_{Bp}`).&#8201;[^25]
- **Re-encryption discipline:** servers re-encrypt mailbox contents after each write to keep ciphertexts indistinguishable across reads. Optimisation: only re-encrypt when a *read* follows one or more writes (counter-mode subtraction-then-addition is commutative).&#8201;[^26]

[^25]: §3.2 (p. 6): "A client registering a mailbox uploads keys `k_A` and `k_B` to servers `A` and `B` respectively, and the servers encrypt stored data using the respective key for each mailbox."
[^26]: §3.2 (p. 6): "Our implementation encrypts mailbox contents in counter mode, so re-encryption simply involves subtracting the encryption of the previous count and adding in the new one. Since these operations are commutative, we can implement an optimization where re-encryption is not done on every write but only when a read occurs after one or more writes."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Servers | Initialise empty page table; agree on PRG seed for shared randomness | — | Once |
| Mailbox registration | Client → Servers | Client sends a fresh `(k_A, k_B, message-size)` pair; servers allocate physical index `p`, sample 128-bit virtual address `v`, install per-mailbox AES keys; either server can pick `v` or both can use shared randomness | `O(λ)` ↑ | Once per mailbox |
| Write — Query gen | Client | DPF-share `f_{v,m}: [2^λ] → {0,1}^{\|m\|}` for target virtual address `v` and message `m`; produce SNIP proof shares `π_A, π_B` (uses `O(1)` AES + field ops) | — | Per write |
| Write — Send | Client → A,B | Send `f_A, π_A` to `A`; `f_B, π_B` to `B` | `O(λ²+\|m\|)` ↑ per server | Per write |
| Write — Expand | Each server | Evaluate `w_{·} = (f_·(V_1), …, f_·(V_n))` over the `n` *currently registered* virtual addresses (not over `2^λ`!) | — | Per write |
| Write — Audit | A ↔ B | Servers compute SNIP check inputs `c_·, C_·` via inner products with shared random `r ∈ F^n` and `R = (r_1², …, r_n²)`; verify `c² − m·C = 0` jointly; abort if invalid | `O(λ)` between servers | Per write |
| Write — Commit | Each server | Decrypt own `D_·` slot, add `w_·`, re-encrypt with fresh nonce | — | Per write (or deferred until next read) |
| Read | Owner → A,B | Owner sends `(p, v)` to both servers | `O(\|p\|+\|v\|)` ↑ | Per read |
| Read — Respond | Each server | Verify `v` corresponds to `p` in page table; return `D_{Ap}` (or `D_{Bp}`); replace stored value with fresh encryption of `0` (mailbox emptied) | `\|m\|` ↓ per server | Per read |
| Read — Decrypt | Owner | Decrypt `D_{Ap}`, `D_{Bp}` with `k_A, k_B`; output `m = m_{Ap} + m_{Bp}` | — | Per read |

(Reference: §3, §4, §5, Figure 1.)&#8201;[^27]

[^27]: §5 (p. 8–9) gives the consolidated full protocol incrementally describing all phases above.

### Two-Server Protocol Details

| Aspect | Server A | Server B |
|--------|----------|----------|
| **Data held** | `D_A ∈ F^n` (additive share of mailbox vector), page table, `{K_{Ap}}`, shared seed `r` | `D_B ∈ F^n`, page table, `{K_{Bp}}`, shared seed `r` |
| **Query received per write** | DPF share `f_A` and SNIP share `π_A` | DPF share `f_B` and SNIP share `π_B` |
| **Computation per write** | Evaluate `f_A` at `n` registered virtual addresses → `w_A`; compute `m_A = Σ w_{Ai}`, `c_A = ⟨w_A, r⟩`, `C_A = ⟨w_A, R⟩`; participate in SNIP verify; decrypt-add-re-encrypt own `D_A` slot | Symmetric — same operations on `w_B`, `m_B`, `c_B`, `C_B`, `D_B` |
| **Computation per read** | Decrypt requested `D_{Ap}` row, return it, re-encrypt with `0` | Symmetric on `D_B` |
| **Security guarantee against malicious `B`** | `A`'s view is simulatable from public inputs + `A`'s share alone (zero-knowledge property of SNIP); `B` cannot force acceptance of a malformed write nor learn the target index `i*` | Symmetric |
| **Non-collusion assumption** | **Required.** Both servers colluding can: (i) reconstruct `D = D_A + D_B`, breaking write privacy; (ii) factor any DPF (since they hold both shares); (iii) match write timestamps to mailbox indices. |

(Reference: §3, §4.1, §5.)&#8201;[^28]

[^28]: §4.1 (p. 7), zero-knowledge clause: "for any malicious server there exists an efficient algorithm that simulates the view of the protocol execution with an honest second server and an honest client. The simulator takes as input only the public system parameters and the identity of the malicious server."

### Communication Breakdown

(For one write of `|m|`-bit message in a system with `n` registered mailboxes; `λ = 128`.)

| Component | Direction | Size | Notes |
|-----------|-----------|------|-------|
| DPF share (per server) | client → server | `O(λ² + \|m\|)` ≈ `O(λ log(2^λ) + \|m\|) = O(λ²+\|m\|)` | Constant in `n` thanks to log-sized DPF over `2^λ`-domain virtual addresses |
| SNIP proof share (per server) | client → server | `O(λ)` | Constant |
| Mailbox-write payload total (client) | ↑ | `O(λ²+\|m\|)` | **Independent of `n`** |
| Inter-server SNIP check | A ↔ B | `O(λ)` | Constant |
| Read request | client → server | `O(\|p\|+\|v\|) ≈ 148 bits` | 20-bit physical + 128-bit virtual address |
| Read response | server → client | `\|m\|` (per server) | One mailbox slot |

(Sources: §5 Table 2, §7.1 Figures 3–4.)&#8201;[^29]

[^29]: §5 (p. 9) Table 2 and §7.1 (p. 12): "Express's communication costs are constant regardless of the number of mailboxes, compared to asymptotically `√n` in Riposte."

### Correctness Analysis

#### Option F: Verification Soundness (security upgrade)

| Field | Detail |
|-------|--------|
| **Verification mechanism** | Boyle et al. verifiable DPF wrapped in Prio SNIP. Servers check `(c² − m·C) = 0` over `F = F_p` (`p = 2^128 − 159`); SNIP zero-knowledge ensures one malicious server learns nothing. |
| **Soundness definition** | If the client is malicious and submits `(f_A, f_B)` whose expansion `w = w_A + w_B` has Hamming weight > 1, both honest servers reject except with probability `ε = O(1/|F|) ≈ 2^{-128}`.&#8201;[^4] |
| **Soundness bound** | `ε = O(1/|F|)` — sum of soundness errors of the verifiable-DPF protocol and the SNIP, each individually negligible in `λ` (Appendix B claim).&#8201;[^4] |
| **Zero-knowledge** | A malicious server's view is simulatable in PPT given only public parameters and its own input share. Proof reduces to standard SNIP simulator with a small modification (DPF share as the "input share" instead of explicit `w_A`/`w_B`).&#8201;[^30] |
| **Overhead from verification** | Effectively zero asymptotically: client `O(1)` SNIP work in addition to `O(1)` DPF generation; server SNIP cost is dwarfed by `O(n)` DPF expansion (audit ≈ 5 µs vs DPF expand 20+ ms in benchmarks).&#8201;[^31] |
| **Metadata-hiding** | Defined formally (Appendix A) via simulation: any adversary controlling one server + arbitrary clients can simulate the view of honest writes given only `(time, sender, message size)`, so it learns nothing beyond. Proof reduces to DPF privacy + SNIP zero-knowledge + AES-CTR semantic security.&#8201;[^32] |

[^30]: Appendix A "Metadata-hiding" claim and proof sketch (p. 17) and Appendix B (p. 18): "the construction of `Sim` and subsequent proof of security follow almost directly from the original proof of security for SNIPs used in Prio. … The only difference between this and the standard SNIP simulator is that the server's inputs are compressed in the form of DPF shares instead of being stated explicitly as the vector `w_A` or `w_B`."
[^31]: §7.2 "Auditing" (p. 12): "our protocol runs in `O(1)` time on the client, taking less than 5 microseconds regardless of how many mailboxes are registered on the servers."
[^32]: Appendix A (pp. 16–17): formal metadata-hiding game and proof sketch via simulator using DPF privacy + SNIP zero-knowledge + counter-mode encryption.

### Complexity

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|------------------------------|-------|
| Client per-write communication | `O(λ²+\|m\|)` | 5.0 KB at `n = 2^20`, 160 B msg; 5.39 KB at `n = 2^14`, 160 B msg | Online |
| Server per-write communication | `O(λ)` (between servers) plus the client's upload it received | 5.4 KB at `n = 2^20` (≈ 1×client) | Online |
| Total client compute per write | `O(λ²+\|m\|)` AES + `O(1)` field ops for SNIP | 20 ms (C/Go), 51 ms (JavaScript) for 1 KB msg, independent of `n` | Online |
| Server compute per write | `O(n(λ+\|m\|))` AES evals (DPF expansion dominates) + `O(n)` field ops (audit inner products) | DPF-expansion-bound for `n ≥ 10⁴` | Online |
| Audit-only client compute | `O(1)` AES | < 5 µs for any `n` | Online |
| Audit-only server compute | `O(n)` AES + `O(n)` field ops | dwarfed by DPF expand | Online |
| Read upload | `O(\|p\| + λ) = O(\|v\|)` | ~ 148 bits | Online |
| Read download per server | `\|m\|` | 1 KB / 32 KB | Online |
| Servers required | `2` | `2` (no third audit server) | — |
| Rounds (write) | `1` (client→servers) + `1` SNIP round (servers↔servers) | — | — |
| Rounds (read) | `1` | — | — |

(Sources: §5 Table 2, §7.1–7.3 Figures 3–7.)&#8201;[^33]

[^33]: §5 Table 2 (p. 9) and §7 Figures 3–7 (pp. 11–13).

### Performance Benchmarks

**Hardware:** Three Google Cloud instances (two running the servers, one simulating clients) — 16-core Intel Xeon (Haswell or later), 64 GB RAM each, 15.6 Gbps bandwidth, all in the same datacenter to minimise network noise. Security parameter `λ = 128`. Field `F_p` with `p = 2^128 − 159`. Cryptographic core in C with OpenSSL; server / client higher-level logic in Go. JS client (for cover traffic) uses SJCL [53, 54] and TweetNaCl.js [1].&#8201;[^34]

[^34]: §7 (p. 11): "We evaluate Express on three Google Cloud instances (two running the servers and a third to simulate clients) with 16-core Intel Xeon (Haswell or later) processors with 64GB of RAM each and 15.6 Gbps bandwidth. We run all three in the same datacenter to minimize network latency."

#### Communication (160 B messages, Figures 3–4)

| `n` (mailboxes) | Express server↑↓ | Express client↑↓ | Riposte server | Riposte client | Pung server | Pung client |
|---:|---:|---:|---:|---:|---:|---:|
| `2^14` | 8.34 KB | 5.39 KB | 208 KB | 69 KB | (≫ Riposte) | (≫ Riposte) |
| `2^20` (1M) | ≈ const | ≈ const | ≈ 1.06 MB / 545 KB (extrapolated) | — | ≈ 38 MB / — | — |

Express achieves **25× server-side and 13× client-side savings vs Riposte at `n = 2^14`**, and **195× server-side / 101× client-side at `n = 2^20`**, plus a separate **4631× server-side / 7161× client-side savings vs Pung at 1M mailboxes**. Express does not require a third auditing server (Riposte's auditor uses 13.8 KB additional comm).&#8201;[^35]

[^35]: §7.1 (p. 12): "For `2^14` mailboxes, Express has 8.34KB of communication by the server and 5.39KB by the client … For about one million (`2^20`) mailboxes, Express requires 101× less communication than Riposte on the client side and 195× less on the server side. The communication reduction compared to Pung in this setting is 4,631× on the server side and 7,161× on the client side."

#### Client computation (§7.2)

- Express client to send a 1 KB message: **20 ms in C/Go**, **51 ms in JavaScript** — *independent of `n`*.&#8201;[^36]
- Audit client compute: < 5 µs regardless of `n` (≈ 55,000× less than Riposte at 1M mailboxes).&#8201;[^37]
- JS client size: 72.5 KB; embedding into a news-org page increases page size by ≤ 1.5% (NYT 4.9 MB → +1.5%, WaPo 9.1 MB → +0.8%, WSJ 8.2 MB → +0.9%).&#8201;[^38]

[^36]: §7 (p. 12): "Express requires 20ms of computation to send a write request, even in the presence of one million registered mailboxes, and our JavaScript client performs similarly, requiring 51ms for the same task."
[^37]: §7.2 "Auditing" (p. 12): "less than 5 microseconds regardless of how many mailboxes are registered on the servers. This is about 55,000× less than the client computation cost for auditing in Riposte for one million mailboxes."
[^38]: §7.2 (p. 12): "Our JavaScript implementation with dependent libraries takes 72.5KB of space, so adding our code would increase a site's size by less than 1.5%."

#### Server throughput / latency (Figures 6–7)

- 1 KB messages: Express throughput is **1.4–6.3× Riposte**.&#8201;[^39]
- 32 KB messages: Express's throughput at 32 KB is comparable to Riposte's at 1 KB (i.e., Express handles 32× larger messages at the same DB-scan rate).&#8201;[^40]
- vs Pung (1 KB): Express **1.3–2.6× faster** for 100K–1M mailboxes; vs Pung (10 KB): Express **2–2.9× faster**.&#8201;[^41]
- Latency (write+read): a single 1 KB Express round-trip at `n=10⁴` is 210 ms; at `n = 10⁶` it is 15 s (DPF-expansion-bound).&#8201;[^42]

[^39]: §7.3 "Throughput" (p. 13): "Express's throughput is 1.4–6.3× that of Riposte in our experiments."
[^40]: §7.3 (p. 13): "Express's throughput when handling 32KB messages is comparable to Riposte when handling only 1KB messages for up to about 50,000 mailboxes."
[^41]: §7.3 (p. 13): "Express outperforms Pung by 1.3–2.6× when run with 100–1,000,000 mailboxes for 1KB messages. When we increase the message size to 10KB, we find that Pung is 2–2.9× slower than Express."
[^42]: §7.3 "Latency" (p. 13): "Express takes 210ms to write and then read a 1KB message when there are 10,000 mailboxes and 15 seconds when there are one million mailboxes."

#### Dollar cost (Figure 8, GCP pricing)

- Processing 1M messages with 100K registered mailboxes: Express costs **5.9× less** than Riposte (the next cheapest cryptographic-security system).&#8201;[^43]
- Egress dominates: Pung's 1M-message egress cost exceeds **\$1,000**; Express **\$0.05/M messages**, Riposte **\$4.21/M messages**.
- Hosting only (24 h, server VMs): Express **\$24.68/day** (2 servers), Riposte **\$37.25/day** (3 servers, including auditor), Pung **\$11.75/day** (1 server). Express is ≈ ⅔ the hosting cost of Riposte despite being more sophisticated, because it needs only 2 of 3 server VMs.&#8201;[^44]
- End-to-end whistleblowing app: **6× cost reduction** vs prior cryptographic approaches.&#8201;[^43]

[^43]: §1 and §7.3 "Total system cost" (pp. 1–2, 13): "dropping the end to end cost of running a realistic whistleblowing application by 6×." §7.3: "processing one million messages with Express costs 5.9× less than Riposte."
[^44]: §7.3 (p. 14): "Hosting costs per 24 hours, excluding data costs, are \$11.75 for Pung, \$37.25 for Riposte, and \$24.68 for Express, corresponding to the number of servers each system needs."

### Comparison with Prior Work

| Metric | Express (this paper) | Riposte (S&P 2015) | Pung (OSDI 2016) |
|--------|---------------------|-------------------|-------------------|
| Servers required | 2 | 3 (2 data + 1 auditor) | 1 |
| Trust model | 1-of-2 malicious | 1-of-3 malicious among 3 servers | 1 fully malicious server |
| Crypto primitives | Symmetric only (AES, OWF, DPF, SNIP) | Symmetric (DPFs) but with `Ω(λ√n)` audit | Public-key (PIR with compressed queries + amortised processing) |
| Synchronised rounds? | **No** | Yes (mandatory) | Yes |
| Write client comm (1M mailboxes, 1 KB msg) | ≈ 5 KB | ≈ 545 KB | ≈ 35 MB |
| Write server comm (1M mailboxes, 1 KB msg) | ≈ 8 KB | ≈ 1.6 MB | ≈ 38 MB |
| Audit client compute (1M) | < 5 µs | ≈ 275 ms (`Ω(√n)` field ops) | n/a |
| End-to-end \$ cost / 1M messages (100K mailboxes) | baseline | 5.9× | 4631× |
| Read mode | Asynchronous, any frequency | Synchronous batch reads | Synchronous epochs |

(Sources: §1, §7.1–7.3, Figures 3–8.)&#8201;[^45]

[^45]: Consolidated from §7.1–7.3.

**Key takeaway:** Express is the best-cost cryptographically-private 2-server PIR-write / metadata-hiding messaging system in this regime — it dominates Riposte (3-server) and Pung (1-server) on every cost axis (communication, computation, dollars) at moderate to large mailbox counts, and is the only one of the three to support asynchronous reads. The price paid is the 2-server non-collusion assumption and a slightly weaker active-security guarantee than Pung (Express tolerates one malicious *server*, Pung tolerates the *only* server being malicious — but at >1000× cost).

### Application Scenarios

The paper details one application:

**Whistleblowing à la SecureDrop (§6).** Sources send leaks to journalists. Each journalist registers one mailbox per source and shares the 128-bit virtual address `v` and AES keys `(k_A, k_B)` out-of-band (in person or via the dialing protocol). Cover traffic is generated by JavaScript embedded in the cooperating news-org's homepage (news consumers' browsers act as cover-traffic clients without their explicit awareness — the paper acknowledges this raises ethical considerations and defers to the Conscript paper [26]). 32 KB messages cover the empirical sizes of recent high-profile leaks (US IG whistleblower complaint at 25.3 KB; NYT op-ed at 9 KB).&#8201;[^46]

**Dialing protocol (§6.2).** Bootstraps mailbox-address communication: journalists' public keys are posted alongside their bylines; sources encrypt a fresh `v` under that public key and post via the Riposte broadcast protocol or print QR codes; for higher-volume contacts, a Riposte-style hybrid dialing channel reuses Express's DPF/SNIP machinery on top of a synchronised-round phase.&#8201;[^47]

[^46]: §1 and §6.1 (pp. 2, 10): "Recent high-profile whistleblowing events such as the whistleblower's report to the US intelligence community's inspector general [6] (25.3KB) or last year's anonymous New York Times op-ed [5] (9KB) demonstrate that messages of this length are very relevant to the whistleblowing scenario."
[^47]: §6.2 (p. 11): "the dialing protocol can use a Riposte/Express hybrid approach where the DPF and auditing protocol are those of Express. This means that the dialing protocol relies on the same trust assumptions as the main protocol, and it can even be deployed on the same servers."

### Implementation Notes

- **Languages:** DPF + audit cryptography in **C** with OpenSSL; servers and higher-level orchestration in **Go**; JS client in JavaScript using SJCL [53, 54] and TweetNaCl.js [1].&#8201;[^34]
- **DPF library:** `libdpf` [18], itself based on `libfss` [59, 60] — the implementation does not include the client-side integrity (MAC) extension described in §5 but says it can be added without server-side cost.&#8201;[^48]
- **Field arithmetic:** `F_p` with `p = 2^128 − 159` represented in two 64-bit words.&#8201;[^4]
- **AES:** hardware-accelerated AES-NI (cited as the reason Express's audit is 8× faster than Riposte's even per-AES-eval, since Riposte's audit uses SHA-256 alongside AES).&#8201;[^49]
- **SIMD / vectorisation:** AES-NI; no other SIMD mentioned.
- **Parallelism:** Multi-threaded servers (16-core VMs); single-threaded benchmarks for client.
- **Open source:** `https://github.com/SabaEskandarian/Express`&#8201;[^50]

[^48]: §5 "Message integrity" (pp. 8–9): "Our implementation does not include the client-side integrity checks described in Section 5, but these checks can be added by clients with no impact on server-side code or performance."
[^49]: §7.2 (p. 12): "our protocol uses only hardware-accelerated AES evaluations, whereas Riposte's auditing protocol involves a mix of AES evaluations and more costly SHA256 hashes."
[^50]: §2 (p. 4) and Conclusion (p. 14): "Our open-source implementation of Express is available at https://github.com/SabaEskandarian/Express."

### Deployment Considerations

- **Database updates:** Each write is itself an update (`D_A ← D_A + w_A`); page table grows lazily on registration. Reads zero-out and re-encrypt the relevant slot. No global re-preprocessing required.
- **Sharding:** Not discussed. Servers replicate the whole mailbox array; horizontal scaling would require fresh DPFs per shard.
- **Key rotation / query limits:** No bound on number of writes per mailbox; the SNIP soundness `2^{-128}` is per-write so accumulating to non-negligible failure requires `2^{128}` writes — practically unbounded.
- **Anonymous query support:** Yes for *writes* — clients are stateless (one-shot DPF + SNIP) and need no long-lived identity. Reads are *not* anonymous (the mailbox owner identifies herself by virtual address `v`). This asymmetry (anonymous writes, identified reads) is fundamental to Express's threat model: journalists don't need anonymity, sources do.
- **Session model:** Ephemeral writers, persistent readers (mailbox owners must keep `(k_A, k_B, v)`).
- **Cold start:** Yes — no offline phase, client can write the moment it knows the target's `v`.
- **Censorship sensitivity:** Both servers must be reachable. If either is blocked, the system is unusable. Express is *not* recommended for deployment in countries that block traffic to news organisations.&#8201;[^51]
- **Plausible deniability via cover traffic:** Required for real whistleblowers; relies on cooperating sites embedding JS clients (Conscript pattern [26]).&#8201;[^11]

[^51]: §2.4 (p. 4): "if traffic to either server is blocked, the system can no longer be accessed. Since we envision Express being deployed by major news organizations, Express would not be appropriate for use in countries with a history of blocking traffic to such organizations."

### Key Tradeoffs & Limitations

- **Two-server non-collusion.** A standard 2-server-PIR limitation. If the two cooperating news organisations collude (or are jointly compromised), all metadata is leaked.&#8201;[^8]
- **DoS by malicious server.** A malicious server can selectively drop or corrupt mailboxes (writing garbage). The paper notes this is detectable (clients can MAC their messages) but cannot be prevented in-protocol; differs from Riposte's same-tier defense.&#8201;[^52]
- **Mailbox owners must poll regularly.** Express does not hide *that* a journalist's mailbox is being read (only writes are private). If a journalist's polling pattern correlates with received messages, the polling pattern can leak — paper notes this and recommends fixed-frequency polling per owner.&#8201;[^53]
- **Targeted disruption only mitigated, not eliminated.** Virtual addressing makes it `2^{-128}`-improbable for a malicious client to *target* an honest mailbox, but a malicious client can still trash a mailbox whose virtual address it does know.&#8201;[^54]
- **Mailbox content is overwritten, not concatenated.** A second write overwrites the first; if a source sends two messages and the journalist only reads after the second, the first is lost. The paper recommends one mailbox per (source, message) pair for journalism use.&#8201;[^55]
- **No anonymity for reads.** By design — only the write side is anonymous. Different from Vuvuzela/Stadium which provide bidirectional anonymity at higher cost (and only DP-style, not crypto).
- **Cover traffic ethics.** Embedding JS clients in cooperating news sites generates cover traffic from unaware visitors; the authors defer to Conscript [26] for the ethics/security analysis.&#8201;[^56]
- **Censorship.** Either server's censorship breaks the system. Express targets relatively-open-internet democracies, not high-censorship environments.&#8201;[^51]

[^52]: §2.4 (p. 4): "Express's soundness property prevents in-protocol denial of service attacks by malicious clients, a malicious Express server can launch a denial of service attack by overwriting mailboxes with garbage. This attack will prevent communication … but it can at least be detected. We discuss how clients can add integrity checks to their messages to achieve authenticated encryption over Express."
[^53]: §2.4 (p. 4): "Express does not hide which mailbox a given read accesses. If a mailbox owner changes her mailbox-checking pattern based on the contents of messages received, this may leak something about who is sending her messages."
[^54]: §4 (p. 6) and §4.2 (p. 8): "a malicious client can write random data to *only one mailbox* and corrupt any message a source may send to a journalist over that mailbox. Although this attack is easily detectable when a journalist receives a random message, it still allows for easy disruption."
[^55]: §2.4 (p. 4): "It is thus possible for a second message sent to the same mailbox to overwrite the original contents … messages can be a leak of a single document, where more than one message is not required."
[^56]: §6.1 (p. 10): "Using in-browser JavaScript to give users plausible deniability raises a number of security and ethical concerns. We defer to the Conscript paper [26] for an extensive discussion."

### Portable Optimizations

- **SNIP-wrapped semi-honest verifier → malicious-server verifier.** Generic technique: any 2-server protocol with a *semi-honest* polynomial-identity verifier can be upgraded to malicious-server security at `O(λ)` extra communication, by wrapping the verifier's check in a Prio SNIP. Express demonstrates this for Boyle et al.'s DPF audit; the same recipe could be applied to other 2-server DPF/FSS protocols.
- **Virtual addressing with log-domain DPFs.** Reducing targeted disruption to a guessing problem by enlarging the address space — applicable to any 2-server DPF-based PIR-write that needs targeted-write protection.
- **Counter-mode rerandomisation.** Re-encryption via additive-counter manipulation (subtract old counter encryption, add new counter encryption) is commutative and lets servers defer re-encryption until the next read — applicable beyond Express to any server-side ciphertext rerandomisation pattern.&#8201;[^26]

### Open Problems (stated by authors)

- Reducing mailbox owners' polling cost / hiding the polling pattern altogether.
- Robustness against jointly-malicious or fully Byzantine servers (would require 3+ servers).
- Generalisation to >2 servers with proportionate bandwidth savings (paper's audit construction is intrinsically two-party).
- Application beyond whistleblowing (the paper notes Express can be used for general async messaging if both parties poll, but does not benchmark this).

### Uncertainties

- The benchmark comparison vs Pung at 1 KB / 1M mailboxes asserts "over 7,000× savings" in §1 vs "4,631× server-side / 7,161× client-side" in §7.1 — both consistent (the 7,000+ figure rounds the client-side number). Recorded both.
- §4.1 notes Boyle et al.'s verifiable DPF protocol "only provides security against semi-honest servers, with secret-shared non-interactive proofs (SNIPs) … to achieve security against fully malicious servers" — Express's audit is therefore *malicious-secure for the servers*, but the paper sometimes phrases its threat model as "active security against one malicious server" (single, not both). Recorded as: 1-of-2 active-malicious tolerance — both cannot be malicious simultaneously (collusion breaks privacy trivially).
- The asymptotic SNIP communication is `O(λ)` per write but Table 2 lists *Servers* communication as `O(λ)` total — interpreted as "between the two servers", per the inter-server SNIP exchange.
- Page-table storage on each server is `O(n_phys · (\|v\| + \|p\|))` ≈ `n_phys · 148 bits`; this is the only `Ω(n)` per-mailbox state and is in the clear (its sole purpose is integrity).&#8201;[^23]

### Related Papers in Collection

- **Riposte** (S&P 2015) — direct predecessor, 3-server analogue with same DPF-share architecture but 3-server `Ω(λ√n)` audit and synchronised rounds. (Filed in `multiserver/` if added.)
- **Pung** (OSDI 2016) — single-server PIR-based metadata-hiding, much higher cost.
- **HPIR** (NDSS 2020) — also 2-server, but **asymmetric compute** (`asymmetric.compute/`), not asymmetric trust; honest-but-curious only. Express and HPIR are orthogonal asymmetry profiles.
