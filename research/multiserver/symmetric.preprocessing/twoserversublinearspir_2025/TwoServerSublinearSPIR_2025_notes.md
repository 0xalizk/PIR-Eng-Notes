## TwoServerSublinearSPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Two-Server Sublinear PIR with Symmetric Privacy and Statistical Security](https://eprint.iacr.org/2025/1313) (ePrint 2025/1313) |
| **Authors** | Shuaishuai Li (Zhongguancun Lab); Anyu Wang, Cong Zhang, Xiaoyun Wang (Tsinghua University)[^1] |
| **Archetype** | Construction (theory-only) + Security upgrade — adds **symmetric privacy (SPIR)** to the statistical 2-server PIR of Corrigan-Gibbs–Kogan (EUROCRYPT '20).[^2] |
| **Asymmetry profile** | (i) **Role asymmetry, CK-style** — left server LS runs the offline hint generation, right server RS answers online queries. (ii) **Security asymmetry layered on top**: the construction adds **DB privacy (SPIR)** while preserving CK's **statistical security** for client privacy.[^3] Filed under [`multiserver/symmetric.preprocessing/`](../) because both servers carry the same offline+online roles structurally; the role split is between phases, not between distinct hardware tiers. |
| **Security model** | 2-server, **non-colluding, semi-honest**. Statistical (information-theoretic up to a 2^{-λ} statistical-distance term). The protocol additionally **requires shared private randomness between the two servers** (unknown to the client) — proved unavoidable by Gertner–Ishai–Kushilevitz–Malkin (STOC '98).[^4] |
| **Additional assumptions** | Information-theoretic protocol per se. Generating server-shared randomness in a single online round-trip needs a **single-pass key-agreement** primitive (e.g., Diffie–Hellman); if computational offline security is acceptable, this falls back to a public-key step. Both servers must maintain a shared randomness pool, refreshed/extended as queries are answered.[^5] |
| **Correctness model** | **Probabilistic** — each protocol invocation succeeds with probability ≥ 1/2 (the failure event is `b=0 ∨ k=0`); λ-fold parallel repetition drives failure to 2^{-λ}. The statistical-distance / privacy bound is also negligible in λ.[^6] |
| **Rounds (online)** | 1 (client → LS, client → RS in parallel; one answer back from each). |
| **Record-size regime** | Large-field entries (Protocol 3.1) for compact analysis; binary entries DBᵢ ∈ {0,1}^l (Protocols 3.2, 4, 5.2) for small records. |

[^1]: Title page (p.1).
[^2]: Abstract + §1.1 (p.2): "We extend this seminal work to the symmetric PIR (SPIR) context … Our main result is the introduction of the first two-server SPIR protocols that achieve both sublinear online time and statistical security." Remark 2 (p.3): "the protocols of [16] are in fact the state-of-the-art two-server PIR with sublinear online time and statistical security" — [16] is Corrigan-Gibbs–Kogan, EUROCRYPT 2020.
[^3]: §1.1 "Our Contributions" (p.2): "we obtain the first statistical two-server SPIR protocol with Õ(n^{1/2}) online time." §3 (p.11) introduces the protocol; §1.2 (p.4) reviews the CK '20 base. The role split appears in the offline stage where only LS receives `S` and `{δ_j}` and computes hint values.
[^4]: §1.1 (p.2): "Our protocols make an additional assumption that the two servers share some private randomness that is unknown to the client. This assumption has been proved to be unavoidable for achieving statistical security in two-server SPIR [25]." Reference [25] = Gertner, Ishai, Kushilevitz, Malkin, STOC 1998.
[^5]: Remark 4 (p.8): the servers may set up shared randomness via a single-pass key-agreement (Diffie–Hellman) protocol with the client as the message relay; if a higher round count is acceptable, plain PKE works. The body protocols themselves treat shared randomness as already-established.
[^6]: Appendix A.1 (p.21) for Protocol 3.1: "the probability that … the query fails will be at most 2^{-λ}" by running λ copies. §3.3 complexity analysis (p.13) and Theorem 1 bullets (p.3) state "negligible" failure / statistical distance in λ.

### Asymmetry Profile

| Aspect | Left Server (LS) — offline hint role | Right Server (RS) — online answer role |
|--------|--------------------------------------|----------------------------------------|
| **Data held** | Full DB | Full DB |
| **Per-session offline work** | Compute w = (ln 4)·n^{1/2} masked hints `h_j = r_j + Σ_{i ∈ S_j} DBᵢ` over the client-supplied subset `S` and shifts `{δ_j}`; send hints to client. Computation Õ(l·n), communication Õ(l·n^{1/2}).[^7] | None offline |
| **Per-query online work** | Compute `a₀ = r̂·α₀ + r̃` (Protocol 3.1) or inner-product over a sublinear masked vector (Protocol 3.2 / 4 / 5.2). Õ(1) field op (3.1) or Õ(n^{1/2}) (binary 3.2). | Compute `h* = Σ_{i ∈ S*} DBᵢ` over the client-supplied size-(n^{1/2}−1) subset, then mask: `a₁ = r̂·α₁ − r_k − h* − r̃`. Õ(l·n^{1/2}) computation, Õ(n^{1/2}) communication.[^8] |
| **Dominant phase** | Linear offline scan over DB | Sublinear online subset-sum over DB |
| **Single-pass property** | Yes — LS streams DB once during the offline stage to compute `{h_j}`. | N/A |
| **Asymmetry direction** | Linear-time data-touching server (offline) | Sublinear-time responder (online) — the regime that makes "sublinear online time" meaningful |

[^7]: Protocol 3.1 "Offline stage" steps 1–6 (p.12) and §3.3 "Offline complexity" (p.13): "the total computation and communication are Õ(ln) and Õ(ln^{1/2}), respectively. Moreover, the client-storage is Õ(ln^{1/2})."
[^8]: Protocol 3.1 "Online stage" Answer step (p.12) and §3.3 "Online complexity" (p.13): "the total computation and communication are Õ(ln^{1/2}) and Õ(l + n^{1/2})."

### Multi-server Model

| Aspect | Detail |
|--------|--------|
| **Number of servers** | 2 |
| **Replication** | Both LS and RS hold an identical copy of DB. |
| **Trust model** | Non-colluding, semi-honest. Privacy holds against either server alone (and unbounded computation w.r.t. the protocol payload), but **fails** if LS and RS collude.[^9] |
| **Communication topology** | Star — client ↔ LS and client ↔ RS independently. Server↔server channel is **only** required to set up shared randomness; once established, the protocol uses no server-server messages.[^5] |
| **Server symmetry of role** | Asymmetric (role split): LS runs the offline phase (hint computation), RS handles online answers. Both run a small online step (LS contributes `a₀` for output masking in Protocols 3.1/3.2/4/5.2). |
| **Online round structure** | 1 round-trip: client sends `(S, {δ_j})` upload only in offline stage; per online query, client sends a query message to LS (a vector, e.g. `v₀`) and another to RS (`(S*, k, α₁)` or `(S*, v₁)`); each server replies once. |
| **Realizability of non-collusion** | Authors note shared randomness can be established via Diffie–Hellman key agreement using the client as a one-pass relay, avoiding direct server↔server channels.[^5] |
| **Cross-server primitive needed** | Shared randomness pool (Õ(n^{1/2}) for single-query; O(n^{1/2}+β) or O(n^{2/3}+βn^{1/3}) randomness elements for multi-query). |

[^9]: Standard 2-server model assumed throughout. §1 (p.1): "the prerequisite that the client can access multiple non-colluding servers." §2.1 Definition 1 separates left- and right-server privacy as independent simulators.

### Formal Security Properties

The paper formalizes **two-server SPIR** as a three-party protocol (CL, LS, RS) with one new privacy property beyond standard PIR, all stated in the **statistical** sense (negligible distance in λ, no computational reductions).[^10]

| Property | Definition | Adversary captured |
|----------|------------|--------------------|
| **Correctness** | For each α ∈ Q, Pr[xₐ ≠ DBₐ] is negligible. | Honest execution |
| **Client privacy (statistical)** | There exists a simulator S such that S(Q, {DBₐ}_{α∈Q}) ≈_s client's view. **Crucially: S is given only the retrieved values, not the database.** This is the SPIR strengthening over PIR: the client must not be able to learn anything about non-retrieved entries.[^11] | Honest-but-curious client |
| **Left-server privacy (statistical)** | There exists S such that S(DB) ≈_s LS's view. LS learns nothing about Q. | Honest-but-curious LS |
| **Right-server privacy (statistical)** | There exists S such that S(DB) ≈_s RS's view. RS learns nothing about Q. | Honest-but-curious RS |
| **Joint server collusion** | **Not protected** — the model assumes non-colluding servers. |

The SPIR upgrade differs from base CK '20 PIR in two structural places, which the construction must repair:

1. **Hint leakage during offline stage.** In CK '20, LS sends hint values `h_j = Σ_{i ∈ S_j} DBᵢ` directly to the client; this leaks DB content. **Fix (Idea 1)**: LS uses fresh shared masks `r_j` and sends `h_j = r_j + Σ DBᵢ` (masked hints). Masks are unknown to the client → masked hints are uniform, leaking nothing about DB.[^12]
2. **Failure-case leakage.** In CK '20 the client returns `h_k − h*` on success; if `k > 0` but `b = 0`, the client learns `DB_{α*}` for some α* ≠ α — a DB-privacy violation. **Fix (Idea 2)**: instead of returning `DB_{α*}`, return `r̂·(α − α*) + DB_{α*}`, where `r̂` is fresh shared randomness and entries lie in a large field (log|F| ≥ λ). Whenever α* ≠ α, this is statistically uniform; whenever α* = α (only on real success), the client recovers `DB_α`.[^13]

The shared randomness `(r₁,...,r_w, r̃, r̂)` therefore carries two distinct roles: per-hint masks (`r_j`) and an output mask (`r̂`).

[^10]: §2.1 "Definition 1 (Two-Server SPIR)" (p.11): three-party protocol; correctness is negligible failure; client/left/right server privacy each defined via a simulator with statistical indistinguishability.
[^11]: §1 (p.2): "[Gertner et al.] introduced symmetric private information retrieval (SPIR), which builds upon the foundation of PIR by imposing an additional layer of privacy: the client should only obtain the entries it has requested." Definition 1 (p.11) reflects this by giving the client-side simulator only `{DBₐ}_{α∈Q}`.
[^12]: §1.3 "Idea 1: using masked hints" (p.7): "the left server uses a random value to mask each hint and sends the masked hints to the client. Note that the masked hints are in fact random values, hence leaking nothing about the database."
[^13]: §1.3 "Idea 2: masking the output" (p.7): "let the client obtain r̂·(α−α*) + DB_{α*} instead of DB_{α*} … if log|F| ≥ λ, then by setting r̂ to a random non-zero field element, we know that r̂·(α−α*) + DB_{α*} is statistically indistinguishable from a random field element when α* ≠ α."

### Lineage

| Field | Value |
|-------|-------|
| **Builds on** | **Corrigan-Gibbs–Kogan, EUROCRYPT 2020** [16]: statistical 2-server PIR with sublinear online time (single-query Õ(n^{1/2}) online; multi-query via PIR-balancing à la Chor–Goldreich–Kushilevitz–Sudan).[^14] |
| **Foundational** | **Gertner–Ishai–Kushilevitz–Malkin, STOC '98** [25]: introduced SPIR; proved that statistical 2-server SPIR requires shared server randomness. **Beimel–Ishai–Malkin, CRYPTO '00 / J.Crypto '04** [7,8]: first sublinear-server PIR via preprocessing (n^{0.5+ε} online, n^{3.2} server storage). **Chor–Goldreich–Kushilevitz–Sudan, FOCS '95** [12]: PIR-balancing technique. |
| **What changed vs CK '20** | (a) LS withholds raw hint values during offline → sends masked hints; (b) Adds output mask `r̂·(α−α*)` to plug failure-case DB leakage; (c) Adds `b=0` random-output dummy `r̃` so failed queries return uniform; (d) Multi-query variant **appends** new hints rather than replacing them, to avoid revealing `k` to RS; (e) Balancing technique **adapted to SPIR**: standard CGKS balancing leaks one entry per subdatabase to the client, breaking SPIR — paper introduces a single-round inner-product gadget over shared randomness to extract only the desired sub-answer.[^15] |
| **Adjacent / contemporary** | **Singh–Wei–Zikas, TCC '24** [41]: information-theoretic 2t-server PIR with client preprocessing (t≥2). **Ishai–Shi–Wichs, CRYPTO '24** [30]: lower bounds for statistically secure single-server preprocessing PIR. |
| **Status** | Theory-only — no implementation, no benchmarks, ePrint-only as of 2025. |

[^14]: §1.2 (p.4): "the statistically secure two-server PIR protocols of Corrigan-Gibbs and Kogan [16]. Their single-query protocol achieves Õ(n^{1/2}) online time and requires Õ(n^{1/2}) offline communication and client storage."
[^15]: §1.5 "A Balancing Technique for Two-Server SPIR" (p.9–10): "this technique does not apply seamlessly to SPIR because the client will obtain an entry from each subdatabase, while only one of these entries is its desired output. … we show how to achieve this in a single roundtrip by utilizing shared randomness between the servers."

### Core Idea

The paper takes CK '20's statistical 2-server PIR and surgically adds **database privacy** by injecting **server-shared masks** into three places:

1. **Hints are masked at LS** (`h_j ← r_j + Σ DBᵢ`) so that the offline transcript is uniform from the client's view (Idea 1).
2. **Online output is masked with `r̂·(α − α*) + DBₐ*`** (a shared, secret, non-zero field element times the gap between requested and used indices) so failure cases that touch the wrong DB entry produce statistically random values (Idea 2).
3. **In the multi-query variant**, hints are **appended** to a hint-index-set `M` rather than replaced, so that revealing the hint slot `k` to RS does not leak information across queries — without this, a repeated `k` across two queries would let RS infer a relation between α and α'.[^16]

The single-query protocol then transmits a **secret-shared linear function of α − α*** to the two servers (`α₀ + α₁ = lift(α − α*)` over `F`); LS contributes `r̂·α₀ + r̃` and RS contributes `r̂·α₁ − r_k − h* − r̃`. The client adds `a₀ + a₁ + h_k = r̂·(α−α*) + DBₐ*`, which equals `DBₐ` precisely when α* = α (success) and is uniform otherwise.

The **balancing technique** (Construction 5.1) splits DB into n_r subdatabases, each of size n_c = n/n_r, and runs the basic SPIR per subdatabase. The naive composition would leak n_r answers to the client (only one of which is wanted) — violating SPIR. Instead, the client takes `e_j` (a unit vector picking the wanted subdatabase index in [n_r]) as input to a **single-round secure inner-product** built from two shared random vectors `η₀, η₁` (with `η₀, η₁` known only to the servers) plus shared scalars `η̄, η̃`; the resulting answer to the client is `⟨a₀, e_j⟩` and `⟨a₁, e_j⟩`, which lets the basic SPIR's `Extract` recover only DBₐ.

[^16]: §1.4 "Challenge 1: revealing k hinders multi-query" (p.8): "if the two queries use the same k > 0, then the right server knows that the set S_1* ∪ {α} in the hint table is replaced with S_2* ∪ {α'}, which implies that α ∈ S_2* ∪ {α'}." Idea 2 of §1.4 ("appending new hints"): "let the server append the new mask to the mask vector instead of replacing the consumed mask."

### Variants

The paper presents **four protocols** plus one balancing meta-construction:

| Protocol | Setting | Highlights |
|----------|---------|-----------|
| **Protocol 3.1** (single-query SPIR, large field) | DB entries treated as field elements with log|F| ≥ max(λ, |DBᵢ|) | Output-masking via `r̂·(α−α*)` requires large field; otherwise simple. |
| **Protocol 3.2** (single-query SPIR, binary entries) | DBᵢ ∈ {0,1}^l | Replaces the failure-case argument: instead of large-field masking, the failure case sets `Sₖ` choice such that the client always gets a uniform `r̄` value when query fails. Avoids the λ-fold blowup for small entries.[^17] |
| **Protocol 4** (multi-query SPIR with linear client storage) | β queries, binary entries | Mask vector `r` is **append-only**; hint index-set `M` tracks unconsumed hints. Linear offline communication and linear client storage. Achieves Õ(n^{1/2}) **amortized** online time when β = Θ(n^{1/2}). |
| **Construction 5.1** (balancing meta-construction for SPIR) | Generic transformation | Takes any single-round 2-server SPIR `(BasicQuery, BasicAnswer, BasicExtract)` and produces a balanced version with n_r·S_r(n_c)+1 randomness, S_q(n_c)+2n_r query size, n_r·S_a(n_c)+4l answer size. Statistical-security preserving. |
| **Protocol 5.2** (multi-query SPIR with sublinear client storage) | β queries, binary, balanced | Combines Protocol 4 + Construction 5.1. Setting n_c = Θ(n^{2/3}), n_r = Θ(n^{1/3}), running offline per Θ(n^{1/3}) queries → Õ(n^{2/3}) amortized online time and Õ(n^{2/3}) client storage. |

[^17]: Remark 5 (p.9): "if we adopt the same idea of hiding k as in our multi-query protocol (but the hint sets are still sampled in the same way as in the single-query scheme), then we no longer require to mask the output. The reason is that whenever the query fails, the client always obtains a random value r̄. This gives us a single-query SPIR protocol that does not rely on large fields."

### Novel Primitives / Abstractions

#### Masked-hint structure

| Field | Detail |
|-------|--------|
| **Name** | Masked hint table |
| **Type** | Server-side preprocessing structure with statistical hiding |
| **Interface** | LS holds masks `(r₁, …, r_w)` shared with RS; for client-supplied `(S, {δⱼ})`, LS computes `Sⱼ = {i + δⱼ}_{i∈S}` and `hⱼ = rⱼ + Σ_{i∈Sⱼ} DBᵢ`; sends `{hⱼ}` to client. |
| **Security definition** | The hint values `{hⱼ}` received by the client are statistically uniform over `F^w` (Protocol 3.1) or `D^w` (Protocols 3.2/4/5.2) — they leak nothing about DB.[^18] |
| **Purpose** | Repairs CK '20's hint leakage for SPIR. |
| **Cost** | Each hint requires one fresh shared random element; total hint mask storage is w = (ln 4)·n^{1/2} per session (single-query / per offline stage refresh). |

[^18]: §1.3 "Idea 1: using masked hints" (p.7) and Protocol 3.1 step 4 (p.12). Privacy proof in Appendix A.2 (p.21–22).

#### Output mask via field multiplication

| Field | Detail |
|-------|--------|
| **Name** | Output mask `r̂·(α − α*)` |
| **Type** | Plug for failure-case DB leakage |
| **Interface** | Servers share `r̂ ←$ F*`. Client secret-shares `lift(α − α*) = α₀ + α₁`, sends `α_b` to server `b`. Servers reply with `a_b` containing `r̂·α_b` term plus a fresh zero-sharing `(r̃, −r̃)`. Client sums to get `r̂·(α − α*) + DBₐ*`. |
| **Security definition** | If α* ≠ α, then `r̂·(α − α*)` is uniform over `F* + DBₐ*`, so the recovered value is statistically indistinguishable from uniform when log|F| ≥ λ.[^13] When α* = α (genuine success), the term is 0 and recovery yields DBₐ. |
| **Purpose** | Makes the protocol statistically SPIR-secure even on the (≤1/2) failure event. |

#### Append-only hint index-set `M`

| Field | Detail |
|-------|--------|
| **Name** | Append-only hint maintenance |
| **Type** | Multi-query state machine |
| **Interface** | Initial M = [w]. On each query, find smallest `k ∈ M` with α ∈ Sₖ. On success, M ← M ∪ {w+u}\{k} and a new hint `(S_{w+u}, h_{w+u})` is appended; mask vector grows from length `|r|` to `|r|+1`. |
| **Security definition** | Lemma 1 (Appendix C, p.25): for any u ∈ [β], the hints `{(Sⱼ, hⱼ)}_{j∈M_u}` are identically distributed to `{(Sⱼ, hⱼ)}_{j∈M_{u+1}}` — making subsequent queries indistinguishable.[^19] |
| **Cost** | Mask vector grows by 1 per successful query → linear (β-dependent) shared randomness. |

[^19]: Appendix C "Lemma 1" (p.25) and §1.4 Idea 2 (p.9): "let the server append the new mask to the mask vector instead of replacing the consumed mask."

#### Single-round SPIR-balancing inner product (Construction 5.1)

| Field | Detail |
|-------|--------|
| **Name** | Shared-randomness inner-product gadget for SPIR balancing |
| **Type** | Black-box compiler from single-round 2-server SPIR to a balanced (subdatabase-decomposed) variant |
| **Interface** | Servers share two random vectors `η₀, η₁ ∈ A_b^{n_r}` and two random scalars `η̄, η̃`. Client samples `b₀ ←$ F_2^{n_r}`, sets `b₁ = e_{α_r} ⊕ b₀`. LS computes `ã₀ = a₀ ⊕ η₀, c₀ = ⟨η₀, b₀⟩ ⊕ η̄, d₀ = ⟨η₁, b₀⟩ ⊕ η̃`; RS symmetrically. Client recovers `⟨a₀, e_{α_r}⟩ ⊕ c₀ ⊕ c₁` (and the analog for `a₁`).[^20] |
| **Security definition** | Theorem 8 (p.16): if BasicSPIR is statistically secure, Construction 5.1 is statistically secure. Proof via a hybrid game where `Hybrid 0` (real with `η_b` known to no one) is shown identical to the simulated view. |
| **Purpose** | Lets balancing reduce client storage to Õ(n^{2/3}) without the standard CGKS leakage of one entry per subdatabase. |
| **Cost** | n_r·S_r(n_c) + 1 randomness; +2n_r query overhead; +4l answer overhead; +O(n_r) extract time. |

[^20]: Construction 5.1 (p.15–16); correctness derivation expands `⟨a₀, e_{α_r}⟩ = ⟨ã₀ ⊕ η₀, e_{α_r}⟩ = ⟨ã₀, e_{α_r}⟩ ⊕ ⟨η₀, e_{α_r}⟩` and uses shared `η₀` to cancel into `c₀ ⊕ c₁`.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **None** for the protocol's statistical security per se — privacy is information-theoretic given the shared-randomness setup. The "extra" assumption is the **existence of a single-pass key-agreement protocol** for setting up the shared randomness in one round-trip without server-server channels (e.g., Diffie–Hellman); pure information-theoretic setup is possible if servers have a private channel.[^5] |
| **Primary primitive** | Information-theoretic masking: additive masks over `F` (large field, log|F| ≥ λ) for Protocol 3.1; XOR masks over `{0,1}^l` for Protocols 3.2/4/5.2. |
| **Field requirement** | Large field for Protocol 3.1: `log|F| ≥ max(λ, |DBᵢ|)`. Protocols 3.2/4/5.2 work directly over `{0,1}^l` and avoid the λ-blowup for small entries. |
| **Random sources** | Shared between LS and RS (unknown to client): `r₁,…,r_w, r̃, r̂` (single-query) and grows with β (multi-query). Client-side random: subset `S`, shifts `{δⱼ}`, decision bit `b`, decoy index `α*`, additive sharing `(α₀, α₁)` or `(v₀, v₁)`. |
| **Key structure** | No long-term keys. All randomness is per-session (offline stage) or per-query. |
| **Correctness condition** | Per-query success probability ≥ 1/2 (events `b=1` and `α − δₖ ∈ S` for some `k ∈ [w]`). λ parallel repetitions push failure to 2^{-λ}.[^6] |

### Key Data Structures

- **Database** `DB = {DBᵢ}_{i∈[[n]]}` ∈ `F^n` (Protocol 3.1) or `({0,1}^l)^n` (Protocols 3.2/4/5.2). Treated as `[[n]] = {0,…,n−1}` indexed by the additive group `Z_n`.
- **Subset and shifts** `(S, {δⱼ}_{j∈[w]})` — `S ⊂ [[n]]` of size `n^{1/2}` (single-query) or `w` size-`n^{1/2}` subsets `S₁,…,S_w` (multi-query, Protocol 4); `δⱼ ∈ [[n]]` shifts. `w = (ln 4)·n^{1/2}` chosen so per-query failure ≤ 1/2.
- **Hint table** `(Sⱼ, hⱼ)_{j∈[w]}` stored client-side. `Sⱼ = {i+δⱼ}_{i∈S}`; `hⱼ = rⱼ + Σ_{i∈Sⱼ} DBᵢ`. Size: w·(n^{1/2}·log n + l) bits.
- **Shared randomness vector** `r = (r̃, r₁, …, r_w)` plus `r̂ ∈ F*` (Protocol 3.1). For multi-query, three more `(r_{w+u}, r̄_u, r̃_u)` per query.
- **Hint index-set** `M` (multi-query) — set of indices into the (growing) hint vector still unconsumed.
- **Subdatabase decomposition** (Construction 5.1) — `DB = (RB_t)_{t∈[n_r]}` with `RB_t = {DB_{(t−1)n_c+i}}_{i∈[n_c]}`.

### Database Encoding

- **Representation:** unstructured array. Protocol 3.1 lifts entries into a field `F` with `log|F| ≥ max(λ, |DBᵢ|)`; Protocols 3.2/4/5.2 keep raw bytes and work over XOR.
- **Index space:** `[[n]] = {0, …, n−1}` viewed as the additive group `Z_n`. `α − δⱼ` is computed mod n.
- **Address transform online:** client picks `k` such that `α − δₖ ∈ S`, then queries the right server with `S* = Sₖ \ {α*}` of size `n^{1/2} − 1`.
- **Preprocessing required:** None on the DB itself — LS streams the raw DB once during offline.

### Protocol Phases (Protocol 3.1, single-query large-field SPIR — canonical)

| Phase | Actor | Operation | Communication | When |
|-------|-------|-----------|---------------|------|
| Setup (one-time) | LS, RS | Establish shared randomness `(r̃, r₁,…,r_w, r̂)` via single-pass DH or pre-shared channel | O(λ + n^{1/2}·log|F|) over server-server channel or via client relay | One-time per session |
| Offline 1 | CL | Sample `S ←$ subset of [[n]] of size n^{1/2}`; sample `δ₁,…,δ_w ←$ [[n]]` with `w = (ln 4)·n^{1/2}` | Send `(S, {δⱼ})` ↑ to LS | Once per session |
| Offline 2 | LS | For `j ∈ [w]`: compute `Sⱼ = {i+δⱼ}_{i∈S}`, `hⱼ = rⱼ + Σ_{i∈Sⱼ} DBᵢ` (single linear pass over DB) | Send `{hⱼ}` ↓ to CL | Once per session |
| Offline 3 | CL | Store hint table `(S, {(δⱼ, hⱼ)}_{j∈[w]})` | — | Once per session |
| Query | CL | (a) sample bit `b` (0 with prob (n^{1/2}−1)/n, else 1); (b) decide `k`: if `α − δⱼ ∉ S` ∀j, set `k=0` (failure path); else smallest `k` with `α − δₖ ∈ S`, set `S_query = {i+δₖ}_{i∈S}`; (c) form `S* = S_query \ {α*}` with α* = α if b=1 else random in `S_query \ {α}`; (d) sample additive sharing of `lift(α − α*)` as `α₀ + α₁`; (e) send `α₀` to LS and `(S*, k, α₁)` to RS (or `⊥` if `k=0`) | `α₀` ↑ to LS (O(log|F|)); `(S*, k, α₁)` ↑ to RS (O(n^{1/2}·log n + log|F|)) | Per query |
| Answer | LS, RS | LS: `a₀ = r̂·α₀ + r̃`. RS: `h* = Σ_{i∈S*} DBᵢ`, `a₁ = r̂·α₁ − rₖ − h* − r̃`. RS sends random if `k=0`. | `a₀` ↓, `a₁` ↓ each O(log|F|) | Per query |
| Extract | CL | If `k > 0` and `b = 1`: return `xₐ = a₀ + a₁ + hₖ`. Else `⊥`. | — | Per query |

### Two-Server Protocol Details (Protocol 3.1)

| Aspect | LS | RS |
|--------|----|-----|
| **Data held** | Full DB | Full DB |
| **Pre-session** | Receives `(S, {δⱼ})`; computes `{(Sⱼ, hⱼ)}` once via streaming DB pass | None |
| **Per-query input** | `α₀ ∈ F` (one share) | `(S*, k, α₁)` (n^{1/2}−1 indices, hint slot, share) |
| **Per-query computation** | `a₀ = r̂·α₀ + r̃` (Õ(1) field op) | `h* = Σ_{i∈S*} DBᵢ` (Õ(l·n^{1/2})), `a₁ = r̂·α₁ − rₖ − h* − r̃` |
| **Output size** | log|F| | log|F| |
| **Security guarantee** | Statistical: LS only sees `(S, {δⱼ}, α₀)` — `α₀` is a random additive share, independent of α; `(S, {δⱼ})` independent of α by client randomness.[^21] | Statistical: RS only sees `(S*, k, α₁)` — `S*` is shown to be a random size-(n^{1/2}−1) subset of `[[n]]\{α}`-style, marginally uniform over [[n]] by careful k-distribution argument; `α₁` is a uniform share.[^22] |
| **Non-collusion required?** | Yes — joint LS+RS view recovers (`{(Sⱼ, hⱼ)}, S*, k, α₀+α₁`), which together let them learn α. |

[^21]: Appendix A.3 "Left-Server Privacy" (p.22).
[^22]: Appendix A.4 "Right-Server Privacy" (p.22–23): the proof shows `S* = S_query \ {α*}` is a random size-(n^{1/2}−1) subset of `[[n]]` regardless of whether the query succeeds or fails.

### Communication Breakdown

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Subset + shifts `(S, {δⱼ})` | CL → LS | Õ(n^{1/2}) | Per session | Offline |
| Hint values `{hⱼ}` | LS → CL | Õ(l·n^{1/2}) | Stored client-side; consumed (Protocol 3.1) or appended (Protocol 4) | Offline |
| Query share α₀ | CL → LS | Õ(1) field elt | No | Online |
| Query message `(S*, k, α₁)` | CL → RS | Õ(n^{1/2}·log n) | No | Online |
| Answer `a₀` | LS → CL | Õ(1) field elt | No | Online |
| Answer `a₁` | RS → CL | Õ(1) field elt | No | Online |

### Correctness Analysis

Probabilistic correctness with explicit failure bound. Per Appendix A.1 (p.21):

- **E₁** = event that `b = 0` (paper's "failure case 1"). Pr[E₁] = (n^{1/2}−1)/n ≤ 1/4 for n ≥ 4.
- **E₂** = event that no `k ∈ [w]` satisfies `α − δₖ ∈ S` ("failure case 2"). Since `S` is a random size-`n^{1/2}` subset and each `δⱼ` is uniform, Pr[E₂] = (1 − n^{1/2}/n)^w ≤ e^{-w/n^{1/2}} = e^{-ln 4} = 1/4 for `w = (ln 4)·n^{1/2}`.
- Therefore Pr[failure] = Pr[E₁ ∪ E₂] ≤ 1/2.
- λ parallel runs → Pr[all fail] ≤ 2^{-λ}.

The 1/2 base success probability is **inherited from CK '20** with the same parameter `w = (ln 4)·n^{1/2}`. The additional output mask `r̂·(α − α*)` does not change correctness on success (α* = α implies the masking term is 0).

### Complexity

#### Theorem 1 — Single-Query SPIR (Protocol 3.1, large field)

| Metric | Asymptotic |
|--------|-----------|
| Offline communication | Õ(n^{1/2}) |
| Offline computation | Õ(n) |
| Online communication | Õ(n^{1/2}) |
| Online computation | Õ(n^{1/2}) |
| Shared server randomness | Õ(n^{1/2}) |
| Client storage | Õ(n^{1/2}) |
| Online rounds | 1 |

Letting `l = log|F|` (or entry length): offline computation Õ(l·n), offline communication Õ(l·n^{1/2}), client storage Õ(l·n^{1/2}); online computation Õ(l·n^{1/2}), online communication Õ(l + n^{1/2}).[^23]

#### Theorem 2 — Multi-Query SPIR with Linear Client Storage (Protocol 4)

| Metric | Asymptotic (β queries) |
|--------|------------------------|
| Offline communication | Õ(n) |
| Offline computation | Õ(n) (single offline phase amortizing β = Θ(n^{1/2}) queries) |
| Online communication / query | Õ(n^{1/2}) |
| Online computation / query | Õ(n^{1/2}) |
| Server-shared randomness | Õ(n^{1/2} + β) |
| Client storage | Õ(n) |
| Amortized online time (β = Θ(n^{1/2})) | Õ(n^{1/2}) |

Remark 1 (p.3): linear offline communication is **non-trivial** for SPIR, because the trivial "download the whole DB" approach **violates DB privacy** by definition. A genuine SPIR protocol with linear offline communication is therefore still a meaningful result.[^24]

#### Theorem 3 — Multi-Query SPIR with Sublinear Client Storage (Protocol 5.2 = balanced Protocol 4)

| Metric | Asymptotic (β queries) |
|--------|------------------------|
| Offline communication | Õ(n^{2/3}) |
| Offline computation | Õ(n) |
| Online communication / query | Õ(n^{1/3}) |
| Online computation / query | Õ(n^{2/3}) |
| Server-shared randomness | O(n^{2/3} + β·n^{1/3}) |
| Client storage | Õ(n^{2/3}) |
| Amortized online time (β = Θ(n^{1/3})) | Õ(n^{2/3}) |

Achieved by setting `n_c = Θ(n^{2/3})`, `n_r = Θ(n^{1/3})` and running the offline stage every Θ(n^{1/3}) queries.

[^23]: §3.3 "Complexity Analysis" (p.13): Protocol 3.1 randomness Õ(ln^{1/2}); offline computation/communication Õ(ln) and Õ(ln^{1/2}); client storage Õ(ln^{1/2}); online computation/communication Õ(ln^{1/2}) and Õ(l+n^{1/2}).
[^24]: Remark 1 (p.3): "Recall that PIR does not protect database privacy, hence a trivial PIR protocol would be for the client to directly download and save the entire database during the offline stage. However, since SPIR protects database privacy, it does not allow any database information leakage during the offline stage. Consequently, there is no such trivial SPIR protocol."

### Asymptotic Comparison (Table 1, p.4 — verbatim)

| Metric | [25] (GIKM '98) | [7,8] (BIM '00–'04) | [16] (CK '20, single) | [16] (CK '20, multi) | §3 (this) | §4 (this) | §5 (this) |
|--------|---------|---------|-----------------|----------------|-----------|-----------|-----------|
| Offline Comp | 0 | poly(n) | Õ(n) | Õ(n) | Õ(n) | Õ(n) | Õ(n) |
| Offline Comm | 0 | o(n) | Õ(n^{1/2}) | Õ(n^{2/3}) | Õ(n^{1/2}) | Õ(n) | Õ(n^{2/3}) |
| Online Comp | Õ(n) | n^{0.6+o(1)} | Õ(n^{1/2}) | Õ(n^{2/3}) | Õ(n^{1/2}) | Õ(n^{1/2}) | Õ(n^{2/3}) |
| Online Comm | Õ(n^{1/3}) | n^{0.6+o(1)} | Õ(n^{1/2}) | Õ(n^{1/3}) | Õ(n^{1/2}) | Õ(n^{1/2}) | Õ(n^{1/3}) |
| Server-storage | Õ(n^{1/3}) | n^{3.2+o(1)} | 0 | 0 | Õ(n^{1/2}) | Õ(n^{1/2}) | Õ(n^{2/3}) |
| Client-storage | 0 | 0 | Õ(n^{1/2}) | Õ(n^{2/3}) | Õ(n^{1/2}) | Õ(n) | Õ(n^{2/3}) |
| Multi-query | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Symmetric (SPIR) | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |

GIKM '98 [25] is **non-preprocessing**; the "Server-storage" column there refers to required shared-randomness storage.

### Performance Benchmarks

**N/A** — paper has no implementation, no concrete benchmarks. Theory-only theorems with hidden polylogarithmic factors. The Õ(·) absorbs `polylog(n)` and `log|F|` factors.

### Estimation Methodology

The paper does not provide concrete parameter recommendations. The closest the paper comes to a concrete number is the bandwidth comparison in Table 1, which is asymptotic only.

For a back-of-envelope sanity check at n = 2^{20} (cf. BIM's "even at n=2^{20} the n^{3.2} encoding would be much too large to materialize"):

- Single-query offline communication ≈ `(ln 4)·n^{1/2}·l ≈ 1450·l` bits per session for n = 2^{20}.
- Single-query online communication ≈ `n^{1/2}·log n ≈ 1024·20 = 20.5 Kb` for the query upload.
- Server-shared randomness ≈ `n^{1/2}·log|F| ≈ 1024·128 = 16 KB` per session for λ=128, large field.

These are **author estimates derived from asymptotics** — the paper itself stops at Õ(·) bounds.

### Application Scenarios

- **Data marketplaces** ([1], [2] in the references — Dawex, Quodd) where the database owner profits from each requested record and must not leak unrequested rows.[^25]
- **Statistically secure private databases** where computational hardness (LWE, DDH) is unacceptable — e.g., long-term archives that must remain secure against future quantum/algorithmic advances.
- **Subscription PIR with audit** where the operator wants cryptographic assurance that clients consume exactly one record per query (SPIR semantics align with metering).

[^25]: §1 "Symmetric privacy in PIR" (p.2): "in many contexts where data sensitivity is paramount (e.g., the data market [1, 2]), the privacy of the database is equally crucial."

### Deployment Considerations

- **Database updates:** Not addressed. The hint-table is computed once per session over a static DB; DB mutations would require regenerating hints (offline restart).
- **Sharding:** Construction 5.1's balancing technique already shards DB into `n_r` subdatabases — naturally compatible with horizontal sharding.
- **Anonymous queries:** Not directly. Each session ties the client to LS via `(S, {δⱼ})` upload, although this leaks nothing about the query target.
- **Session model:** Session-based with offline refresh. Single-query (Protocols 3.1/3.2) requires fresh offline per query; Protocol 4 amortizes offline over Θ(n^{1/2}) queries; Protocol 5.2 over Θ(n^{1/3}).
- **Cold-start suitability:** Poor for one-shot lookups — LS must do Õ(n) offline work before the first query.
- **Server-randomness setup:** Requires a single-pass DH (or equivalent single-flow key agreement) at session start, with the client as relay — Remark 4. If the offline stage may be only computationally secure, this is a clean engineering compromise.

### Key Tradeoffs & Limitations

- **Theory-only — no implementation.** All claims are asymptotic; concrete constants and polylog factors hidden.
- **2-server, non-colluding** — fundamental model limitation; collusion breaks both client privacy and DB privacy.
- **Shared server randomness is required** — proved unavoidable [25] but represents an engineering setup cost (Õ(n^{1/2}) to Õ(n^{2/3}) shared bytes per session).
- **Probabilistic correctness with 1/2 success** — λ-fold parallel repetition needed to amplify, multiplying every cost (offline comm, online comm, computation, randomness) by λ.
- **Large-field requirement for Protocol 3.1** — log|F| ≥ λ even for tiny entries → λ-factor blowup. Protocol 3.2 fixes this for binary entries.
- **Multi-query randomness grows with β** — Õ(n^{1/2} + β) for Protocol 4, O(n^{2/3} + β·n^{1/3}) for Protocol 5.2. β is bounded by the number of queries between offline refreshes.
- **No malicious security** — semi-honest only.
- **No concrete benchmarks vs. SinglePass / Checklist / Piano** — these are computationally secure (PRF-based) and thus not directly comparable, but practical readers cannot estimate the constant-factor overhead the SPIR upgrade imposes.

### Comparison with Prior Work

| Metric | TwoServerSublinearSPIR §3 | CK '20 [16] (single) | GIKM '98 [25] | BIM '00 [7,8] | SinglePass '24 |
|--------|---------------------------|----------------------|---------------|---------------|----------------|
| Servers | 2 | 2 | 2 | 2 | 2 |
| SPIR (DB privacy) | ✓ | ✗ | ✓ | ✗ | ✗ |
| Statistical security | ✓ | ✓ | ✓ | ✓ | ✗ (computational, OWF/PRG) |
| Sublinear online time | ✓ — Õ(n^{1/2}) | ✓ — Õ(n^{1/2}) | ✗ — Õ(n) | ✓ — n^{0.6+o(1)} | ✓ — O(Q) |
| Server-storage | Õ(n^{1/2}) randomness | 0 | Õ(n^{1/3}) randomness | n^{3.2+o(1)} encoding | 0 (DB only) |
| Client-storage | Õ(n^{1/2}) | Õ(n^{1/2}) | 0 | 0 | O(N log N + (N/Q)·w) |
| Single-server analog | (Open) | (Open) | N/A | N/A | (Open) |

**Key takeaway:** This is the **first protocol** in the row "2-server SPIR ∧ statistical ∧ sublinear-online" — that intersection was previously empty. The cost is a pragmatic but unavoidable shared-randomness assumption (matching [25]'s lower bound) and probabilistic correctness inherited from CK '20.

### Portable Optimizations

- **Masked-hint trick** (`hⱼ = rⱼ + Σ DBᵢ` with shared mask) — generic SPIR upgrade for any preprocessing PIR where the hint phase otherwise leaks DB content. Applies to any 2-server scheme with shared randomness.
- **Output mask `r̂·(α − α*)`** — generic plug for "wrong-entry-on-failure" leakage in probabilistic PIR. Requires large field but is otherwise a black-box repair.
- **Append-only hint maintenance** — generic technique for hiding hint slot `k` across multiple queries when reusing a single offline phase.
- **SPIR-balancing with shared inner-product gadget** (Construction 5.1) — black-box balancing that preserves SPIR. Applies to any single-round 2-server SPIR.

### Implementation Notes

- **No code, no parameters, no benchmarks.** Implementer would need to (a) pick a large field for Protocol 3.1 (e.g., `F_p` with p ≈ 2^λ for λ=128), (b) instantiate shared-randomness setup (single-pass DH or PRG-from-shared-seed), (c) implement subset-membership check `α − δⱼ ∈ S` ∀j efficiently — paper notes that pre-sorting `S` lexicographically lets binary search reduce this to Õ(n^{1/2}·log n), avoiding hash tables.[^26]
- **Languages:** N/A.
- **FHE / lattices:** none.
- **Parallelism:** the offline `{hⱼ}` computation parallelizes trivially across `j ∈ [w]`. λ-fold correctness amplification parallelizes across copies.

[^26]: §1.2 footnote 7 (p.5): "we can let the client sort S in some lexicographic order during the offline stage, which takes only Õ(n^{1/2}) computation … To check whether α − δⱼ ∈ S for all j ∈ [w], we can use the binary search algorithm, which takes only Õ(w log n) = Õ(n^{1/2}) computation."

### Open Problems

- **Tighter polylog factors / concrete constants.** Õ(·) hides at least one log n factor (subset operations) plus the λ-fold repetition needed for amplification — and possibly more.
- **Sublinear amortized time below Õ(n^{2/3}) for SPIR.** The paper achieves Õ(n^{1/2}) amortized only with **linear** client storage; Õ(n^{2/3}) is the best with sublinear client storage. PIR-balancing à la CGKS does not seamlessly transfer to SPIR (Remark 1).
- **Single-server statistical SPIR with sublinear online time** — known impossible by the long-standing lower bound that single-server PIR with sublinear communication implies OWFs [5,17]. So the 2-server requirement here is essentially tight for the statistical setting.
- **Removing shared randomness** — proved impossible by [25] (Gertner et al. STOC '98). Settled.
- **Malicious server tolerance.**
- **Implementation and concrete benchmarking** vs. computationally-secure 2-server SPIR (e.g., DPF-based) to quantify the cost of statistical security.

### Related Papers in Collection

- **CK_2020** [`asymmetric.role/ck_2020/`] — the direct base scheme; this paper layers SPIR on top.
- **SinglePass_2024** [`asymmetric.role/singlepass_2024/`] — same 2-server preprocessing model but **computationally** secure (OWF/PRG); single-pass linear offline; **deterministic** correctness; no DB privacy.
- **TAPIR_2025** [`asymmetric.role/tapir_2025/`] — successor to SinglePass; computationally secure.
- **IncPIR_2022** [`asymmetric.role/incpir_2022/`] — updatable 2-server preprocessing PIR (computational).
- **CGKS_1995** [`symmetric.IT/cgks_1995/`] — k-server information-theoretic PIR; no DB privacy, no sublinear server.
- **ScalableMSPIR_2025** [`symmetric.preprocessing/scalablemspir_2025/`] — sibling in this preprocessing folder.
- **ITMSPIR_CP_2024** [`symmetric.preprocessing/itmspir_cp_2024/`] — Singh–Wei–Zikas (TCC '24); IT 2t-server PIR with client preprocessing; cited as [41] in this paper.
- **Piano** [`Group.2b.Interactive.Hint/piano_2023/`] — single-server analog of the preprocessing model; computational, probabilistic.

### Uncertainties

- **Concrete constants in Õ(·)** are not stated; expected to be at least one factor of `log n` plus the λ amplification factor.
- **Whether shared-randomness setup overhead** (single-pass DH per session) ever becomes the bottleneck for short sessions is not analyzed.
- **No discussion of update model** — adding/deleting DB entries presumably forces a fresh offline stage; not addressed.
- **Polylog factor in Theorem 4 (balancing)** — `T_q(n/n_r) + O(n_r)` etc. — concrete `n_r` choice for Protocol 5.2 is `Θ(n^{1/3})`, but the paper does not analyze multi-round balancing (n_r > 2 layers).
