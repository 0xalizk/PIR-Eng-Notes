## DualSourceSPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Dual-Source Symmetric PIR without Data Replication or Shared Randomness](https://ieeexplore.ieee.org/document/10619444) (IEEE ISIT 2024) |
| **Authors** | Rémi A. Chou (University of Texas at Arlington) — single author.&#8201;[^1] |
| **Archetype** | Theory + Building-block (a binary-adder-MAC SPIR coding scheme) — no implementation, no benchmarks. |
| **Asymmetry profile** | **Content asymmetry.** Two non-colluding servers hold *independent* (non-replicated) file collections; the client retrieves one file from each server simultaneously. Each server has its own data — no replication of any kind across servers, and no shared/correlated randomness, no noisy channel.&#8201;[^2] |
| **Security model** | Information-theoretic SPIR (symmetric PIR): client privacy from each server *and* file privacy of the unselected files from the client. Honest-but-curious, non-colluding servers.&#8201;[^3] |
| **Additional assumptions** | (i) A noiseless **binary-adder multiple access channel** `Y = X₁ + X₂` (over ℤ, output in {0,1,2}) is available from servers to client — this MAC is the *only* extra resource. (ii) A noiseless public broadcast channel for interactive messages. (iii) No shared randomness, no replication, no noisy channel.&#8201;[^4] |
| **Correctness model** | Vanishing-error asymptotic: the recovery error probability `ℙ[(F̂_{1,Z₁}, F̂_{2,Z₂}) ≠ (F_{1,Z₁}, F_{2,Z₂})]` and all leakage terms tend to 0 as the channel block length `n → ∞`.&#8201;[^5] |
| **Rounds (online)** | Multi-round interactive over the public channel (`r_t` rounds per channel use, generally), but the achievability scheme used in the proof needs only the MAC + a few public messages — no interaction strictly needed for `L₁=L₂=2`.&#8201;[^6] |
| **Record-size regime** | Asymptotic — file sizes `nR_i` bits scale with the number of MAC channel uses `n`. The paper characterises *rates* (`R_i = file-bits / channel-uses`), not concrete byte sizes. |

[^1]: Title page: "Dual-Source Symmetric PIR without Data Replication or Shared Randomness", Rémi A. Chou, University of Texas at Arlington. The author header lists only Chou; the user's "Wang/Banawan/Ulukus" attribution is incorrect.
[^2]: Abstract (p. 1): "we leverage a noiseless binary adder channel and employ two non-colluding servers with independent content. Furthermore, we characterize the optimal file rates …"; §I (p. 1): "two non-colluding servers can enable information-theoretically secure SPIR with positive rates for both servers simultaneously."
[^3]: Definition 2 (p. 2): equations (3)–(6) capture client-privacy of `Z_i` from each server, and (5)–(6) ensure each server's content is hidden from the other server's view; (7) ensures the unselected files `F_{1,L₁\{Z₁}}, F_{2,L₂\{Z₂}}` remain hidden from the client (SPIR-style symmetric privacy). §II ¶3 (p. 2): honest-but-curious participants.
[^4]: §I (p. 1): "the servers and the client can have access to a noiseless adder multiple-access channel, but no noisy channels nor pre-shared correlated randomness are available at the parties." §II eq. (1): the MAC is `Y = X₁ + X₂` with `X_i ∈ {0,1}`, `Y ∈ {0,1,2}`; arithmetic is over ℤ (not 𝔽₂), so observing `Y=0` or `Y=2` reveals both inputs.
[^5]: Definition 2 eqs. (2)–(7) (p. 2): "lim_{n→∞} ℙ[(F̂₁,Ẑ₁, F̂₂,Ẑ₂) ≠ (F₁,Z₁, F₂,Z₂)] = 0" and the corresponding mutual-information leakage terms `→ 0`.
[^6]: §V-A and Algorithm 1 (p. 4): for `L₁ = L₂ = 2` the protocol is one MAC block of length `n` followed by two public broadcasts (one per server) and one client decoding step — effectively non-interactive beyond the MAC. The general `L₁=L₂` reduction (§V-B, Algorithm 2) iterates Algorithm 1 `L−1` times.

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** ℓ | Exactly **2** non-colluding servers. Server collusion collapses the model to single-server SPIR over a noiseless channel, which is impossible — so non-collusion is necessary, not just convenient.&#8201;[^7] |
| **Server content** | Server `i ∈ {1,2}` holds `L_i` files `(F_{i,1}, …, F_{i,L_i})` with `F_{i,ℓ} ∈ {0,1}^{nR_i}`. **All `L₁ + L₂` files are independently and uniformly distributed** — no replication of any file across servers and no shared randomness.&#8201;[^8] |
| **Client request** | Client picks `(Z₁, Z₂) ∈ ⟦1,L₁⟧ × ⟦1,L₂⟧` and wishes to retrieve `(F_{1,Z₁}, F_{2,Z₂})` — exactly **one file from each server**, two files total.&#8201;[^9] |
| **Trust model** | Honest-but-curious, non-colluding. SPIR (symmetric) — both directions of privacy enforced.&#8201;[^3] |
| **Channel resources** | (i) Noiseless **binary-adder MAC** servers→client (the only "extra" resource); (ii) noiseless **public broadcast** for setup and interactive rounds. No noisy channels, no shared/correlated randomness, no replication.&#8201;[^4] |
| **Local randomness** | `U₀, U₁, U₂` — independent local randomness at the client, server 1, server 2 respectively. Critically these are **not** correlated across parties.&#8201;[^10] |

[^7]: §II penultimate paragraph (p. 2): "if the servers are colluding, then no positive rates are achievable, as the setting reduces to an SPIR setting between one client and one server over a noiseless channel, for which it is known that information-theoretic security cannot be achieved, e.g., [10]." [10] = Sun-Jafar 2018, IEEE Trans. IT.
[^8]: Definition 1 bullets 1–2 (p. 2): "For `i ∈ {1,2}`, `L_i` independent random variables `(F_{i,ℓ})_{ℓ ∈ ⟦1,L_i⟧}` uniformly distributed over `{0,1}^{nR_i}`". Independence across `i` is implicit in the definition and made explicit in §II ¶1: "two non-colluding servers with independent content."
[^9]: Definition 1, the client's selection `(Z₁, Z₂) = (i,j)` (p. 2): "the client is requesting the files `(F_{1,i}, F_{2,j})`."
[^10]: Definition 1 bullet 3 (p. 2): "`U₀, U₁, U₂`, three independent random variables, which represent local randomness available at the client, Server 1, and Server 2, respectively."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | (i) Sun-Jafar 2018 [10] — capacity of single-server (replicated) SPIR with shared randomness; (ii) Wang-Skoglund line [11–13] on SPIR over coded/colluding/eavesdropper channels; (iii) Crépeau-Kilian style OT-from-noisy-channels [4–8]; (iv) Brassard-Crépeau-Santha 1996 [15] on OT/intersecting-codes — used for the achievability one-time-pad lemma.&#8201;[^11] |
| **What changed** | Removes **all three** standard "extra resources" used to make IT-SPIR feasible (data replication, shared/correlated randomness, noisy channels), and instead leverages a single **noiseless adder MAC** with **independent server content**. This is the first IT-secure multi-server SPIR variant that avoids the replication assumption.&#8201;[^12] |
| **Builds on (author)** | Chou's earlier "Pairwise oblivious transfer" [14] (ITW 2020) — the Pairwise-OT lemma is the key tool for both the converse (Lemma 5 of [14]) and the achievability one-time-pad lemma.&#8201;[^13] |
| **Superseded by** | None in this collection. The user's note mentions "and follow-up journal 2025" — not present in this PDF, which is the ISIT 2024 4-page conference version (pp. 2065–2069). |
| **Concurrent work** | None cited as concurrent. |

[^11]: References [10]–[15] (p. 4): Sun-Jafar capacity result; Wang-Skoglund 2018/2019 papers on SPIR with eavesdroppers / coded storage; Brassard-Crépeau-Santha 1996 on OT and intersecting codes.
[^12]: §I ¶2–¶4 (p. 1): "The first approach consists in considering additional resources at the client and the server in the form of correlated randomness, which could, for instance, be obtained through a noisy channel… The second approach consists in replicating data in multiple servers and assuming that the servers share randomness, e.g. [9]–[13]." Then ¶3: "we propose to perform SPIR under information-theoretic security guarantees without shared randomness, a noisy channel, or data replication. Instead, we leverage a noiseless binary adder channel and employ two non-colluding servers with independent content."
[^13]: References [14] (p. 4): R. A. Chou, "Pairwise oblivious transfer," IEEE ITW 2020. §IV (p. 3) cites "[14, Lemma 5]" for the converse and §V-A eq. (18) cites "a modified version of the one-time pad lemma" traceable to [14].

### Core Idea

Two non-colluding servers store **independent** file collections. The client reaches them through a noiseless **binary-adder MAC** `Y = X₁ + X₂`. By coordinating their channel inputs `(X₁, X₂)` so that the sum `Y` carries one bit of useful information per channel use (encoded via positions where `Y = 1`, which mask which input was 0 vs 1), each server can transmit **a one-time-padded version of its full file list to the client without leaking the unmasked files to the *other* server**, while the client — who knows the MAC output `Y` and decides which positions to use — extracts exactly the requested file from each server. The result is the first IT-secure SPIR scheme that simultaneously avoids replication, shared randomness, and noisy resources, and the paper completely characterises the achievable **(R₁, R₂) rate region**.&#8201;[^14]

[^14]: Theorem 1 (p. 2): the SPIR² capacity region `C_{SPIR²}(L₁, L₂) = {(R₁, R₂) : (L₁−1)R₁ + (L₂−1)R₂ ≤ 1/2}`. The factor ½ corresponds to the loss from MAC-positions where `Y ∈ {0,2}` are publicly observable to both servers and only `Y = 1` carries privacy.

### Formal Definitions

The paper formalises a new SPIR variant: **"Dual-Source SPIR"** = SPIR with two non-colluding servers holding **independent** content over a binary-adder MAC.

- **Model name:** `(n, L₁, L₂, 2^{nR₁}, 2^{nR₂})` dual-source SPIR protocol (Definition 1, p. 2).
- **Syntax:** Servers `i = 1, 2` hold `L_i` independent uniform files `F_{i,ℓ} ∈ {0,1}^{nR_i}` and local randomness `U_i`; the client has selection `(Z₁, Z₂)` and randomness `U₀`. The protocol runs `n` MAC channel uses interleaved with `r_t` rounds of public broadcasts per channel use; the messages `(M_{i,t,j})` are functions of each party's local view at the time of transmission. After `n` channel uses the client outputs `(F̂_{1,Z₁}, F̂_{2,Z₂})`.&#8201;[^15]
- **Security notion:** Achievability requires *all four* leakage terms (3)–(6) to vanish — `I(F_{1,L₁} X₁ⁿ U₁ A; Z₁ Z₂)`, `I(F_{2,L₂} X₂ⁿ U₂ A; Z₁ Z₂)`, `I(F_{1,L₁} X₁ⁿ U₁ A; F_{2,L₂})`, `I(F_{2,L₂} X₂ⁿ U₂ A; F_{1,L₁})` (where `A = (A₁, A₂)` is the public communication transcript) — plus the file-privacy term (7) `I(Z₁ Z₂ Yⁿ U₀ A; F_{1,L₁\{Z₁}} F_{2,L₂\{Z₂}})`. Together these give two-sided client privacy, two-sided server privacy, and SPIR-style file privacy.&#8201;[^16]
- **Correctness notion:** `ℙ[(F̂₁, F̂₂) ≠ (F_{1,Z₁}, F_{2,Z₂})] → 0` (eq. (2)).
- **Capacity region:** `C_{SPIR²}(L₁, L₂)` = closure of all achievable `(R₁, R₂)` pairs.
- **Relationship to standard PIR:** Strict generalisation in the multi-server model, but **incomparable** to single-server SPIR — the latter is *infeasible* over noiseless channels without extra resources, so single-server SPIR's `C_{SPIR} = (0,0)` (red dot in Figure 2) lies strictly *inside* `C_{SPIR²}(L₁,L₂)`. The paper visualises this as: the dual-source region is a proper triangle; the "no extra resources, single server" point is the origin.&#8201;[^17]

[^15]: Definition 1 (p. 2): full description of the `(n, L₁, L₂, 2^{nR₁}, 2^{nR₂})` protocol: MAC channel input `(X_{1,t}, X_{2,t})` is a function of each server's view `V_{i,t}`; the public messages `M_{i,t,j}` are functions of the cumulative view through round `j`.
[^16]: Definition 2 eqs. (2)–(7) (p. 2): the five mutual-information conditions plus the recovery condition.
[^17]: Figure 2 (p. 3) and §III ¶3 (p. 3): "The x-coordinate (resp. y-coordinate) of `C_{SPIR}` is defined as the SPIR capacity between Server 1 (resp. Server 2) and client in the absence of Server 2 (resp. Server 1), i.e., `C_{SPIR} = (0,0)`." — illustrating the gap between single-server SPIR (no positive rate possible) and dual-source SPIR (entire triangular region achievable).

### Main Result — Capacity Region

**Theorem 1 (p. 2):** The dual-source SPIR capacity region is

```
C_{SPIR²}(L₁, L₂) = { (R₁, R₂) : (L₁ − 1)R₁ + (L₂ − 1)R₂ ≤ 1/2 }.
```

Achievable **without time-sharing**.&#8201;[^18]

**Symmetric corollary (Corollary 1, p. 3):** When `L₁ = L₂ = L`,

```
C_{SPIR²}(L) = { (R₁, R₂) : R₁ + R₂ ≤ 1/(2(L−1)) },
```

and along the diagonal `R₁ = R₂ = R`,

```
R ≤ 1/(4(L−1)).
```

**Geometric reading:** The region is a triangle with vertices `(0, 0)`, `(1/(2(L₁−1)), 0)`, `(0, 1/(2(L₂−1)))` — see Figure 2.&#8201;[^17] The capacity scales as `1/L_i` in the number of files at server `i`, exactly as in standard SPIR (since the unselected `L_i − 1` files must remain hidden, leaking proportionally to their count); the factor `1/2` arises from the MAC structure (only positions with `Y = 1` give private bits, occurring with probability ≤ 1/2 under the optimal symmetric input distribution).&#8201;[^14]

[^18]: Theorem 1 (p. 2): "Moreover, any rate pair in `C_{SPIR²}(L₁, L₂)` is achievable without time-sharing." This means a single coding scheme (not a convex combination of corner-point schemes) attains every interior point — a stronger achievability statement.

### Lower Bounds (Converse)

The converse (§IV, pp. 3–4) shows `(L₁−1)R₁ + (L₂−1)R₂ ≤ ½` is necessary.

| Step | Tool / argument | Reference |
|------|-----------------|-----------|
| **Outer bound to a max-entropy expression** | `(L₁−1)R₁ + (L₂−1)R₂ ≤ max_{p_{X₁} p_{X₂}} H(X₁ X₂ | Y)` | Proposition 1 (p. 3) |
| **Lemma 1** — single-file from a single server is determined by the server-and-client view | `I(F_{1,z₁}; Yⁿ U₀ X₁ⁿ A₁, Z₁ = z₁, Z₂ = z₂) = 0` (and the symmetric statement) | Lemma 1, eqs. (8)–(9) (p. 3) |
| **Lemma 2** — file privacy of unselected files | `H(F_{1,L₁\{Z₁}} | X₁ⁿ A Z₁ Z₂) = o(n)`; symmetric for server 2 | Lemma 2, eqs. (15)–(16) (p. 3); proof uses [8, Lemma 3] (Ahlswede-Csiszár OT capacity bound), Fano's inequality, and Lemma 1 |
| **Lemma 3** — entropy bound combining both servers' unselected files | `H(F_{1,L₁\{Z₁}} F_{2,L₂\{Z₂}} | Z₁ Z₂) ≤ H(X₁ⁿ X₂ⁿ | Yⁿ) + o(n)` | Lemma 3 (p. 3) |
| **Final assembly** | `(L₁−1)nR₁ + (L₂−1)nR₂ ≤ H(X₁ⁿ X₂ⁿ | Yⁿ) + o(n) ≤ Σ_t H((X₁)_t (X₂)_t | Y_t) + o(n) ≤ n max_{p_{X₁} p_{X₂}} H(X₁ X₂ | Y)` | end of §IV (p. 4); single-letterised via chain rule & uniform `T ∈ ⟦1,n⟧`; combined with [14, Lemma 5] (Chou's pairwise-OT bound) to get `≤ ½`.&#8201;[^19] |

[^19]: §IV final paragraph (p. 4): "By Proposition 1, it is sufficient to [14, Lemma 5] to obtain the converse part of Theorem 1." The pairwise-OT bound from Chou ITW 2020 evaluates `max_{p_{X₁} p_{X₂}} H(X₁ X₂ | Y) = 1/2` for the binary adder MAC.

**Tightness:** The bound is matched by the Algorithm-1/Algorithm-2 achievability scheme — the region is **exactly characterised** (capacity, not just inner/outer bounds).

### Achievability — Coding Scheme

#### Building block: `L₁ = L₂ = 2` (Algorithm 1, p. 4)

A clean two-file-per-server protocol that realises every corner point of the region.

| Step | Action | Who |
|------|--------|-----|
| 1 | Sample `(X₁ⁿ, X₂ⁿ) ~ Unif({0,1})ⁿ × Unif({0,1})ⁿ` and transmit over the MAC; client observes `Yⁿ = X₁ⁿ + X₂ⁿ`. | Server 1 & Server 2 |
| 2a | Define `G ≜ {i : Y_i ∈ {0,2}}` ("public" positions, server inputs determined) and `B ≜ {i : Y_i = 1}` ("private" positions, server inputs hidden). | Client |
| 2b | Set `M ≜ min(|G|, |B|)`. | Client |
| 2c | Partition `G = G₁ ⊔ G₂` and `B = B₁ ⊔ B₂` with `|G_j| = |B_j| = αM` (any `α ∈ [0,1]`). | Client |
| 2d | Define share-sets `S_0^{(i)} ≜ G if Z_i = 0 else B`, `S_1^{(i)} ≜ B if Z_i = 0 else G`, for each server `i ∈ {1,2}`. Note: when `Z_j = i`, the client can determine `X_j^n[S_i^{(j)}]` from `Yⁿ` (because those are public-`G` positions for the chosen file). | Client |
| 2e | If `||G|/n − ½| > n^{−t}` (small `t < ½`), abort — concentration step. | Client |
| 3 | Client publicly broadcasts `(S₀^{(1)}, S₁^{(1)}, S₀^{(2)}, S₁^{(2)})` to both servers. | Client → both |
| 4a | Server 1 broadcasts `(M_{1,0}, M_{1,1}) = (X₁ⁿ[S₀^{(1)}] ⊕ F_{1,1}, X₁ⁿ[S₁^{(1)}] ⊕ F_{1,2})`. | Server 1 → public |
| 4b | Server 2 broadcasts `(M_{2,0}, M_{2,1}) = (X₂ⁿ[S₀^{(2)}] ⊕ F_{2,1}, X₂ⁿ[S₁^{(2)}] ⊕ F_{2,2})`. | Server 2 → public |
| 5 | If `Z_1 = i ∈ {0,1}`, client computes `M_{1,i} ⊕ X₁ⁿ[S_i^{(1)}] = F_{1,1+i}`. Symmetric for server 2. | Client |

Why it works:
- **Correctness:** for the chosen file at server `j`, `Z_j` selects which subset (`G` or `B`) the client treats as "public for that file". For positions in `G`, the client knows `X_j^n` exactly from `Yⁿ` ∈ {0,2}; XOR-pad is removable.&#8201;[^20]
- **Server privacy of `F_{j, 1−Z_j}` (the unselected file):** the *other* file at server `j` is XOR-padded by `X_j^n` at indices the client cannot recover (positions where `Y = 1`, so `X_j` is uniform conditional on `Y`). This is the modified one-time-pad lemma. The "twist" is that `(M_{1,0}, M_{1,1})` is a function of `(X_1^n, F_{1,1}, F_{1,2}, S_0^{(1)}, S_1^{(1)})` and the SPIR conditions reduce to an OT-pad analysis.&#8201;[^21]
- **Client privacy of `Z_i` from server `j`:** `(S_0, S_1)` look uniform-random partitions to each server; the server cannot distinguish the case `Z_j = 0` from `Z_j = 1` because the partition labelling is identically distributed.
- **Rate:** `|G| ≈ n/2` private positions split as `αM/(L_j−1)` per file, giving `R₁ + R₂ ≤ 1/2` for `L = 2`. The parameter `α ∈ [0,1]` interpolates between the two corner points without time-sharing.&#8201;[^18]

[^20]: Algorithm 1 step 2d–5 (p. 4): when `Y_i ∈ {0,2}` the value of `X_1` (and `X_2`) is determined (`Y=0 ⇒ X_1=X_2=0`, `Y=2 ⇒ X_1=X_2=1`); when `Y_i = 1` the value of `X_1` is uniform conditional on `Y` and the other input.
[^21]: §V-A eq. (18) (p. 3): `I(F_{1,1} F_{1,2} X_1^n A; F_{2,1} F_{2,2}) = I(F_{1,1} F_{1,2} X_1^n M_{2,0} M_{2,1} S_0^{(1)} S_1^{(1)} S_0^{(2)} S_1^{(2)}; F_{2,1} F_{2,2}) = 0`, "where (a) holds because `(M_{1,0}, M_{1,1})` is a function of `(X_1^n, F_{1,1}, F_{1,2}, S_0^{(1)}, S_1^{(1)})`, (b) holds by a modified version of the one-time pad lemma."

#### General `L₁ = L₂ = L` (Algorithm 2, p. 4)

The general case is reduced to `L = 2` by a classical OT-from-OT amplification (Brassard-Crépeau-Santha 1996, ref [15]).

| Step | Action |
|------|--------|
| 1 | Each server `j ∈ {1,2}` constructs `L−1` length-`(L−1)` "code" sequences `(C_{j,t}[1], C_{j,t}[2])_{t ∈ ⟦1,L−1⟧}` where the entries are XOR combinations of the `L` files: `C_{j,1}[1] = F_{j,1}`, `C_{j,1}[2] = S_{j,1}` (a fresh random pad); for general `t`, `C_{j,t}[1] = F_{j,t} ⊕ S_{j,t−1}` and `C_{j,t}[2] = S_{j,t−1} ⊕ S_{j,t}`; the last code line embeds the `L`-th file via XOR-cumulant of the pads. |
| 2 | Client computes a selection vector `Z_{j,t} ∈ {0,1}` indicating, for each `t`, which of the two code-positions to retrieve via Algorithm 1, defined as `Z_{j,t} = 1{t < Z_j}`. |
| 3 | For `t = 1, …, L−1`, run Algorithm 1 with the two-file pair `(C_{j,t}[1], C_{j,t}[2])` and selection `(Z_{1,t}, Z_{2,t})`. |
| 4 | Client reconstructs `F_{j,Z_j} = ⊕_{t=1}^{Z_j} C_{j,t}[2] ⊕ C_{j,Z_j}[1]` (or `⊕_{t=1}^{Z_j} C_{j,t}[2]` if `Z_j = L`).&#8201;[^22] |

The reduction loses a factor of `L−1` (each Algorithm-1 invocation gives ½ rate; spread over `L−1` rounds gives `1/(2(L−1))` per server), which exactly matches Theorem 1.

[^22]: Algorithm 2 (p. 4): describes the construction of `(C_{j,t}[1], C_{j,t}[2])` as XOR-cumulant codes of the `L` files, the selection rule `Z_{j,t} = 1 + 1{t < Z_j}`, and the reconstruction in step 6. "The analysis of Algorithm 2 is omitted due to space constraints" — only Algorithm 1 is fully analysed in the conference paper.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | None — **information-theoretic**. No computational assumptions. |
| **Encryption / encoding** | Bit-wise XOR one-time pad of files with `X_i^n[S]` strings. The "encryption keys" are the per-server channel inputs `X_i^n`, ephemeral and never reused. |
| **Channel resource** | Noiseless **binary-adder MAC** `Y = X₁ + X₂` over ℤ (output alphabet {0,1,2}). This is the *only* extra primitive — replaces shared randomness, replication, and noisy channels of prior approaches.&#8201;[^4] |
| **Key structure** | No long-term keys. Each protocol round samples fresh uniform `(X₁^n, X₂^n)`. |
| **Correctness condition** | Concentration of `|G|/n ≈ ½` (eq. (19) `||G|/n − ½| ≤ n^{−t}` for `t < ½`); achieved with vanishing failure by Hoeffding-type bounds on i.i.d. uniform sums.&#8201;[^23] |

[^23]: Algorithm 1 step 2e (p. 4): "If `||G|/n − ½| ≤ n^{−t}` then the client sends to Servers 1 and 2 the sets … otherwise the client aborts the protocol." Vanishing abort probability via standard concentration on `|G| = #{i : Y_i ∈ {0,2}} = #{i : X_{1,i} = X_{2,i}}`, which is `Bin(n, ½)`.

### Key Data Structures

- **MAC inputs** `X_1^n, X_2^n ∈ {0,1}^n` — uniform i.i.d. per server, transmitted over the adder MAC.
- **MAC output** `Y^n ∈ {0,1,2}^n` — observed by the client only.
- **Public partitions** `(S_0^{(i)}, S_1^{(i)})` of indices into "use-`G`" (positions where `X_i` is determined by `Y`) vs "use-`B`" (positions where `X_i` is hidden), broadcast on the public channel.
- **Pad-XOR messages** `M_{i, k} = X_i^n[S_k^{(i)}] ⊕ F_{i, k+1}` — public broadcasts from each server.
- **No client hint, no server preprocessing** — pure online-only protocol.

### Communication Breakdown (asymptotic, per protocol run)

| Component | Direction | Size | Purpose |
|-----------|-----------|------|---------|
| MAC inputs `(X_1^n, X_2^n)` | Server `i` → MAC | `n` channel uses | Provides shared (one-way) secret bits at private positions |
| Partition broadcasts `(S_0, S_1)` | Client → public | `O(n log L)` bits | Tells servers which positions to pad which file with |
| Pad-XOR ciphertexts `(M_{i,0}, M_{i,1})` | Server → public | `2 · nR_i` bits per server (for `L=2`); `(L−1) · nR_i` for general `L` | The padded files |
| **Total useful payload** | downlink | `nR_1 + nR_2` bits | Two retrieved files |
| **Channel-use rate** | `(R_1, R_2)` constrained by `(L_1−1)R_1 + (L_2−1)R_2 ≤ ½` |

No noisy-channel uses, no shared-randomness bits, no pre-distributed keys — the entire resource cost is the MAC and the public broadcast.

### Correctness Analysis — Option B (Probabilistic, vanishing failure)

| Field | Detail |
|-------|--------|
| **Failure mode** | (i) Concentration failure: `|G|/n` deviates from `½` by more than `n^{−t}` → protocol aborts (eq. (19)). (ii) Asymptotic mutual-information leakage `→ 0` rather than `= 0` — formally vanishing-error not perfect. |
| **Failure probability** | `Pr[abort] ≤ exp(−Ω(n^{1−2t}))` by Hoeffding for any fixed `t < ½` — vanishing in `n`. |
| **Probability grows over queries?** | Each protocol run is independent (fresh `X_i^n`); no degradation over repeated queries. |
| **Probability grows over DB mutations?** | N/A — files are not mutated in the model. |
| **Key parameters affecting correctness** | `n` (channel block length), `t` (concentration exponent), `α` (operating-point parameter `∈ [0,1]`). |
| **Proof technique** | Hoeffding/Chernoff for concentration; OT-capacity bound (Ahlswede-Csiszár [8, Lemma 3]) for the converse; modified one-time-pad lemma for security; Fano's inequality for converse. |
| **Adaptive vs non-adaptive** | Non-adaptive — selections `(Z₁, Z₂)` are fixed before the protocol run. |
| **Honest-but-curious** | Required. Malicious parties are explicitly listed as an open problem.&#8201;[^24] |

[^24]: §VI (p. 4): "an open problem is to address malicious parties who might attempt to cheat."

### Security Analysis Highlights

The achievability proof reduces to the four leakage equations (3)–(7) of Definition 2:
- **(3)–(4) Client privacy:** `I(F_{i,L_i} X_i^n U_i A; Z_1 Z_2) → 0` per server. Holds because the client's broadcasts `(S_0^{(i)}, S_1^{(i)})` are identically distributed regardless of which `Z_j` is selected — the partition is symmetric in the labelling.
- **(5)–(6) Cross-server content privacy:** `I(F_{i, L_i} X_i^n U_i A; F_{j, L_j}) → 0` for `i ≠ j` — proved via the modified one-time-pad lemma using `(X_j^n)` at private positions as fresh i.i.d. pad bits independent of server `i`'s view.&#8201;[^21]
- **(7) Unselected-file privacy from client:** `I(Z_1 Z_2 Y^n U_0 A; F_{1, L_1\{Z_1}} F_{2, L_2\{Z_2}}) → 0` — the unselected files at each server appear XOR-padded with `X_i^n[B]` bits that the client cannot recover from `Y^n` (for positions in `B`, `Y_i = 1` and `(X_{1,i}, X_{2,i})` are uniformly distributed over `{(0,1),(1,0)}` given `Y_i`).

### Performance / Concrete Parameters

**N/A** — this is an information-theoretic capacity paper. No implementation, no benchmarks, no concrete parameter tables. The "performance" is the rate-region characterisation; concrete byte-level comparisons would require fixing a finite block length `n` and a desired error/leakage exponent, which the paper does not do.

### Variants

The paper presents **one** scheme but with two algorithmic descriptions:

| Variant | Setting | Description |
|---------|---------|-------------|
| Algorithm 1 | `L₁ = L₂ = 2` | Direct one-shot scheme; achieves any point in the triangle `{R₁ + R₂ ≤ ½}` via the parameter `α ∈ [0,1]`. |
| Algorithm 2 | `L₁ = L₂ = L` (general) | Black-box reduction to Algorithm 1: instantiate `L−1` independent runs of Algorithm 1 on XOR-cumulant codes of the `L` files (Brassard-Crépeau-Santha [15] OT amplification). |

Asymmetric `L₁ ≠ L₂` is asserted by Theorem 1 but not given a separate algorithm in the conference paper.

### Open Problems and Limitations

- **Malicious parties:** Honest-but-curious only; covering active adversaries is left open.&#8201;[^24]
- **Asymmetric `L₁ ≠ L₂`:** Theorem 1 covers the rate region but the explicit coding scheme is presented only for `L₁ = L₂`. The general case is not given an algorithm in the conference version.&#8201;[^25]
- **Beyond binary-adder MAC:** The paper uses one specific MAC (binary adder over ℤ). What other multiple-access channels enable the same kind of result, and what is the corresponding capacity, is not addressed.
- **Finite-blocklength rates:** All claims are asymptotic; no second-order / dispersion-style analysis.

[^25]: §V intro (p. 3): "For clarity of presentation, we focus on the case `L₁ = L₂`. Specifically, we present our coding scheme in Section V-B, which shows that the case `L₁ = L₂` can be reduced to the special case `L₁ = L₂ = 2`, which we treat in Section V-A." General `L₁ ≠ L₂` is implicit in Theorem 1's statement but no separate code is given.

### Uncertainties

- The user's metadata in the prompt attributed the paper to "Wang, Banawan, Ulukus" — this is **incorrect**; the PDF lists Rémi A. Chou as the **single author**. Notes corrected accordingly.
- The user's prompt mentions "and follow-up journal 2025"; the supplied PDF is the 5-page ISIT 2024 conference version (pp. 2065–2069) and contains no journal citation. If a 2025 journal version exists with extended proofs (e.g., for `L₁ ≠ L₂`), it is not in scope of these notes.
- Algorithm 2's correctness/security analysis is "omitted due to space constraints" in the conference paper — the reduction is plausible (it is the BCS '96 OT amplification recipe) but the leakage bookkeeping for the SPIR conditions (5)–(7) over `L−1` composed runs is not explicitly written.
