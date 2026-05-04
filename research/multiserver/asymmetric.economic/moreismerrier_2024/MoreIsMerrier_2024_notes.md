## More is Merrier — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [More is Merrier: Relax the Non-Collusion Assumption in Multi-Server PIR](https://arxiv.org/abs/2201.07740) (IEEE S&P 2024) |
| **Authors** | Tiantian Gong (Purdue), Ryan Henry (Calgary), Alexandros Psomas (Purdue), Aniket Kate (Purdue / Supra Research) |
| **Archetype** | Model/definition + System (game-theoretic mechanism + smart-contract implementation). The PIR engine is treated as a black box. |
| **Asymmetry profile** | **Economic / rational asymmetry.** Standard multi-server PIR assumes pair-wise non-collusion among `k` queried servers. This paper *relaxes* non-collusion to a *rationality assumption*: servers are utility-maximisers whose collusion is deterred by small fees `λ_s`, fines `λ_f`, rewards `λ_r`, and penalties `λ_p` settled on a public bulletin board. Asymmetry knob: the pool size `ℓ ≫ k` of available servers — many cheap servers replace the cryptographic non-collusion assumption.&#8201;[^1] |
| **Security model** | Computational 1-privacy of the underlying `(ℓ, k, 1)`-PIR scheme, *plus* a game-theoretic non-collusion outcome at subgame-perfect / sequential equilibrium. Threat model: all servers are rational or malicious; no honest non-colluding party is required. Static corruption.&#8201;[^2] |
| **Additional assumptions** | Public bulletin board with payment-execution functionality (instantiated as an Ethereum smart contract); perfectly hiding & computationally binding commitment scheme (SHA-3); EUF-CMA digital signatures (ECDSA); zk-SNARKs (Groth16 / Plonk / LegoSNARK / collaborative zkSNARKs) when malicious servers are admitted. The base PIR provides *computational 1-privacy* (e.g., Boyle-Gilboa-Ishai 2-server cPIR or Hafiz-Henry `k`-server cPIR).&#8201;[^3] |
| **Correctness model** | Inherited from the underlying PIR scheme. The collusion-deterrence layer adds *probabilistic statistical* non-collusion when malicious servers are present (failure ≤ 2^{−η}, e.g., η=40), and deterministic non-collusion at equilibrium when all servers are rational.&#8201;[^4] |
| **Rounds (online)** | 1 PIR round + bulletin-board commitments per query. Collusion resolution is a separate off-equilibrium phase (only triggered if a server reports). |
| **Record-size regime** | Inherited from base PIR; the mechanism's overhead is independent of `w`. Paper benchmarks gas costs only — not record sizes. |

[^1]: Abstract (p. 1) and §1.1 Contributions (p. 2): "We focus on the prominent privacy-preserving computation task of multi-server 1-private information retrieval (PIR) that inherently assumes no pair-wise collusion. … We can make deviations undesired via small amounts of rewards and penalties, thus significantly raising the bar for collusion resistance. We design and implement a collusion mitigation mechanism on a public bulletin board with payment execution functions, considering only rational and malicious parties with no honest non-colluding servers."
[^2]: §2.2 Threat model (p. 3): "We assume all servers are either rational, i.e., taking actions that maximize utilities, or malicious, i.e., behaving arbitrarily. We assume static corruption faced with a malicious adversary. There are no honest non-colluding servers."
[^3]: §1.1 (p. 2), §2.3 Solution overview (p. 4), §6.1 Implementation (p. 11–12): bulletin board = Ethereum smart contract; `Comm(·)` is "perfectly hiding and computationally binding" (Figure 1 caption, p. 4); SHA-3 commitments + ECDSA signatures (§6.1, p. 11); zk-SNARKs via Groth16/Plonk/LegoSNARK or collaborative zkSNARKs (§4.2, p. 9, §6.1, p. 12). §2.1 (p. 3) requires the underlying scheme to satisfy "computational 1-privacy" per Hafiz-Henry's definition.
[^4]: §3 (p. 5–8) proves SPE for rational-only servers; §4.1 Statistical non-collusion outcome (p. 9) gives `1 − 2^{−η}` success when `θℓ` servers are malicious.

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Setting** | `(ℓ, k, 1)`-PIR with `ℓ ≫ k`. The user `U` holds a query for `D_a` (entry `a` in DB `D` of `N` entries). At each query, the user samples `k` server indices from a pool of `ℓ` and runs the underlying `k`-server PIR with them.&#8201;[^5] |
| **Number of servers `ℓ`** | Large pool (paper benchmarks `ℓ ∈ {1000, 10000}`, `k ∈ {2, 3, 4, 5}`). The mechanism's feasibility region grows with `ℓ`.&#8201;[^6] |
| **Servers queried per request `k`** | Same as the underlying PIR scheme; typically `k ≥ 2`. Each query touches `k` distinct servers chosen uniformly at random from the `ℓ`-pool.&#8201;[^7] |
| **Trust model** | **Rationality + bounded-malicious.** A fraction `θ ∈ [0, 1)` of servers may be statically malicious (deviate arbitrarily, ignore incentives); the remaining `(1−θ)ℓ` are rational utility-maximisers. *No* honest non-colluding parties are required. Standard multi-server PIR is recovered as the special case `θ=0` and `λ_p = λ_f = ∞`.&#8201;[^2]&#8201;[^8] |
| **How non-collusion is relaxed** | Replace "the `k` queried servers are guaranteed not to collude" with "the `k` queried servers are guaranteed *not to find collusion profitable*". Achieved by structuring the post-query game so that any successful collusion is reported by ≥1 colluder for a reward `λ_r`, and any non-reporter is fined `λ_p`. As long as the secret's worth `V` is bounded and `λ_s + (k−1)/k · λ_p > V`, the unique SPE strategy profile is non-collusion.&#8201;[^9] |
| **Servers replicate the DB** | Yes — standard multi-server PIR assumption (each server holds an identical copy of `D`). Inherited from the underlying scheme.&#8201;[^5] |
| **Channels** | Servers may collude over *any* unobserved channel (anonymous, covert, etc.); communications can be simulated and denied — so the mechanism must work without observing collusion attempts.&#8201;[^10] |
| **Coalition handling** | Servers can also form *strong coalitions* (mutually-trusted cliques sharing all information). The paper bounds maximum coalition size via cooperative-game-theoretic core analysis (§5.2): for `k=2` coalitions don't grow at all; for `k ≥ 3` coalition size is capped, e.g., `⌊(k−2)(kℓ−k+1)/(k−1)²⌋` for the constant-coalition-value case.&#8201;[^11] |

[^5]: §2.1 Definitions (p. 3): "A set of `ℓ` servers `S = {S_i | i ∈ [ℓ]}` maintain identical databases consisting of `N` entries, `D = {D_i | i ∈ [N]}`. To query entry `a`, a user `U` generates `k` queries and sends them to `k` (distinct) servers."
[^6]: §3.3 Existence of solution & Figure 4 (p. 8): "For `ℓ ≫ k`, there always exist parameter assignments…" and the 3D feasibility plot uses `ℓ=10000, V=100, k ∈ {2,3,4,5}`. §6.1 (p. 11–12) and Table 1 use the same parameter regime.
[^7]: §2.1 Definitions (p. 3): standard `(ℓ, k, 1)`-PIR with `k` queries to `k` distinct servers.
[^8]: §4 Malicious client or servers (p. 8–9): "We now consider the client or `θ ∈ [0, 1)` of the `ℓ` servers to be malicious. Malicious servers behave arbitrarily and ignore incentives."
[^9]: §3.1 Theorem 3.1 (p. 5): "In the `k`-party collusion game `G` in `(ℓ, k, 1)`-PIR, the strategy profiles of all `ℓ` servers playing `\bar C D` or `C D` in rounds one and two are the only two SPEs when `λ_p > 0` and `λ_s + (k−1)/k λ_p > V`."
[^10]: §2.2 Threat model (p. 3): "servers can communicate with each other over any unobserved communication channels, e.g., anonymous channels that keep the communication covert and undetectable. Further, we assume the communication is simulatable so that a server can generate the communication transcripts on its own, and colluding servers can self-protect by denying having the conversation."
[^11]: §5.2 Strong coalitions (p. 10–11): cooperative-game core analysis; constant coalition value `D(s) = cV` ⇒ for `k=2` coalition does not grow; for `k≥3` size capped at `⌊(k−2)(kℓ−k+1)/(k−1)²⌋`.

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | (a) Multi-server PIR — Hafiz-Henry `k`-server cPIR (PoPETs 2019) and Boyle-Gilboa-Ishai 2-server cPIR (CCS 2016) as black-box plug-ins. (b) Game theory — Selten's subgame-perfect equilibrium (1988); Friedman's repeated-games folk theorem (1971); Kreps-Wilson sequential equilibrium (1982). (c) Mechanism design for collusion deterrence — Mangipudi-Lu-Psomas-Kate "Collusion-Deterrent Threshold Information Escrow" (CSF 2023); Yakira-Grayevsky-Asayag rational threshold cryptosystems (2019); Dong et al. "Betrayal, Distrust and Rationality" (CCS 2017); Wang-Luo-Cheung MPC-with-collusion-deterrence (TIFS 2017).&#8201;[^12] |
| **What changed** | Prior "anti-collusion in distributed crypto" works (a) operate in MPC/threshold-crypto where correctness-targeted collusion is the concern, not privacy-targeted collusion; (b) split the user secret value `V` among colluders (so individual incentives shrink); (c) rely on undercover police / dummy collusion. *More is Merrier* targets *privacy-targeted* collusion in PIR specifically: each colluder gets the *full* `V` (not `V/k`), servers may hold arbitrary prior knowledge, and the mechanism uses *self-reporting* among rational colluders rather than a trusted decoy.&#8201;[^13] |
| **Superseded by** | None. |
| **Concurrent / related work** | Yakira et al. (2019) slashing for threshold crypto; Ciampi-Lu-Zikas (2022) collusion-preserving secure computation. None target multi-server PIR specifically.&#8201;[^14] |

[^12]: §2 (p. 3): cites Hafiz-Henry [47] and Boyle-Gilboa-Ishai [11] for the suitable underlying PIR; §3 (p. 5) and footnote 3 (p. 5) cite Selten [79] for SPE; §3.2 (p. 7) cites Friedman [37] for the folk theorem; §A.1 (p. 17) cites Kreps-Wilson [58] for sequential equilibrium; §7 Related work (p. 13) cites Mangipudi et al. [64], Yakira et al. [91], Dong et al. [29], Wang et al. [87], [88].
[^13]: §7 Related work (p. 13): "The four major differences from mitigating *privacy-targeted collusion* are that (1) … (2) Privacy-targeted collusion can happen (repeatedly) long after the protocol has terminated. (3) False accusations from parties with information advantages are not a concern there. But in privacy-targeted collusion, servers may hold arbitrary private knowledge…"
[^14]: §7 Related work (p. 13): comparison with Yakira et al. and Ciampi et al.

### Core Idea

The non-collusion assumption in multi-server PIR is a soft target: rational servers may collude over covert channels precisely *because* the protocol cannot detect them. *More is Merrier* turns this against the colluders by re-framing collusion as a *prisoner's-dilemma game* on a public bulletin board. After every PIR query, each queried server has a small commitment to its query and response posted to a smart contract `CC`; if any subset later colludes to learn `f(D_a)` for some non-trivial `f`, *one* of them is incentivised to defect — submit a collusion report `(f, inputs, output)` to `CC` — by a reward `λ_r` plus seizure of the others' deposits `λ_p`. As long as the user's secret worth `V < λ_s + (k−1)/k · λ_p`, the unique SPE has every server playing "do not collude". With `ℓ ≫ k` available servers, sampled at random per query and never repeated, even the *infinitely-repeated* game has the non-colluding equilibrium as the unique SPE under a suitable discount-rate condition. The PIR engine itself is plug-in; the only added overhead is a few signed commitments per query and a (rare) zk-SNARK during dispute resolution.&#8201;[^15]

[^15]: §1 Introduction (p. 1–2), §2.3 Solution overview (p. 4), §3 Collusion deterrence (p. 5–8), §6 Game design flow and implementation (p. 11–12).

### Formal Definitions

- **Model name:** Rational/incentive-compatible multi-server PIR (no separate name in paper).
- **Underlying PIR syntax (Definition 1, p. 3):** standard Hafiz-Henry `(ℓ, k, 1)`-PIR with random variables `(I, Q, R, Y)` for index, query, response, reconstructed entry. Correctness: `Pr[Y = D_i | I = i] = 1`. *Computational 1-privacy:* for all `i, i^* ∈ [N]`, `{Q | I = i}_{λ ∈ N}` and `{Q | I = i^*}_{λ ∈ N}` are computationally indistinguishable.&#8201;[^16]
- **Collusion game `G` (Single-shot, §3.1):** sequential game with three rounds — (1) collude `C` or not `\bar C`; (2) input amicably `A` (correct query share) or deceitfully `D` (gibberish); (3) report collusion `R` or not `\bar R`. Solution concept: subgame-perfect equilibrium (SPE).&#8201;[^17]
- **Repeated game `G_R` (§3.2):** infinitely many runs of `G` with discount factor `δ ∈ [0, 1)`. Strategy profiles `\bar C A \bar R` or `C A R` are unique SPEs under `δ/(1−δ)·(1−q)V < λ_r ≤ λ_p` and `λ_s + λ_p > (1/k)(λ_r + λ_p) + V` where `q = (ℓ−k)…(ℓ−2k+2)/(ℓ−1)…(ℓ−k+1)`.&#8201;[^18]
- **Coalition / cooperative game (§5.2):** characteristic function `v(C) = p_s · sV + (k/ℓ)·s·λ_s` for coalition `C ⊆ S` of size `s`; solution = core allocation. Goal: keep grand coalition undesirable.&#8201;[^11]

[^16]: Definition 1 (p. 3): full statement of `(ℓ, k, 1)`-PIR correctness and computational 1-privacy.
[^17]: §3.1 (p. 5–6) and Figure 2 (p. 6): three rounds of strategy choices `(C/\bar C, A/D, R/\bar R)`.
[^18]: Theorem 3.2 (p. 7): repeated-game SPE with discount `δ ∈ [0, 1)` and rotation probability `q`.

### Mechanism Design / Incentive Structure

#### Players and payments

| Player | Action | Receives | Pays |
|--------|--------|----------|------|
| **User `U`** | Pays `k` service fees per query | service from each server | `k · λ_s` per query |
| **Each queried server `S_{id_i}`** | Answers PIR query, posts response commitment | `λ_s` per query (after privacy period) | deposit `≥ k_max · max(λ_p, λ_f)` upfront |
| **Whistleblower** | Submits collusion evidence to `CC` | `λ_r` reward + `(k−1)·λ_p` from accomplices | (gas cost of the report) |
| **Accomplice (silent colluder)** | – | – | penalty `λ_p` and loss of service fee |
| **False accuser** | Submits invalid report | – | fine `λ_f` |

(Reference: Figure 1 "Normal Service" + "Collusion Resolution", p. 4; intuition list at the end of §2.3.)

#### Public bulletin board (`BB`) and coordinator contract (`CC`)

- **`BB`** is instantiated as Ethereum block storage; messages posted include user query commitments, response commitments, and signatures.&#8201;[^19]
- **`CC`** is a Solidity smart contract — source published at github/haas256/PIR — exposing entry points: `Deposit`, `PostRequests`, `SubmitResponse`, `ClaimServiceFee`, `Accuse`, `CheckCircuits`, `VerifyExchange`, `VerifyGeneralFunc`, `zkVerify`. It custodies deposits, executes `PaymentExec`, and verifies collusion evidence.&#8201;[^20]
- **Companion queries `ω ≥ 1`:** each PIR query is paired with `ω` random *companion* queries on uniformly random indices. The user permutes the `(ω+1)·k` queries before posting commitments and sending de-commit info. Servers cannot tell which is the real query, so an honest queried server cannot single-handedly fabricate a fake collusion accusation against another server (the false-accusation probability is `(ω+2)/(2(ω+1))` per query, mitigated by the fine `λ_f`).&#8201;[^21]

[^19]: §2.3 Solution overview (p. 4): "We treat Ethereum as a public bulletin board"; §6.1 (p. 11): "We treat Ethereum as a public bulletin board and conveniently implement the coordinator contract as a smart contract on Ethereum. The source code in Solidity is made available [43]."
[^20]: §6 Algorithm 1 and §6.1 (p. 11): essential `CC` functions enumerated.
[^21]: §3.1 "Counter false accusations" (p. 6) and §2.3 "ω ≥ 1 random companion queries" (p. 4).

#### Parameter constraints (from Theorem 3.1, Theorem 3.2, Proposition 1)

For the unique non-colluding SPE, the parameter system must simultaneously satisfy:

| # | Inequality | Purpose |
|---|------------|---------|
| ① | `λ_f > ((ω+2)/ω) · λ_r` | Discourages false accusations by informed servers |
| ② | `(k−1)·λ_s > λ_r` | Discourages users from framing servers via fake accusations |
| ③ | `(δ/(1−δ))·(1 − ((ℓ−k)…(ℓ−2k+2))/((ℓ−1)…(ℓ−k+1)))·V < λ_r ≤ λ_p` | Repeated-game incentive for first-mover collusion reporters |
| ④ | `λ_s + λ_p > (1/k)(λ_r + λ_p) + V` | Single-shot and per-round incentive for `\bar C` and `D` |
| ⑤ | `λ_s ≤ (V/k)·ξ` for `ξ ∈ (0, 1)` | Affordability for users — service fee bounded fraction of secret worth |

Existence (Proposition 1, §3.3): for `ℓ ≫ k`, all five inequalities are jointly satisfiable. Example feasible point (Figure 4, p. 8): `k=2, ℓ=10000, V=100, w=1, λ_s=2, λ_f=200, λ_p=200, λ_r=0.99, δ=0.99`.&#8201;[^22]

[^22]: §3.3 Proposition 1 (p. 8) and Figure 4 (p. 8): existence proof and worked feasible parameter region.

#### Why "more is merrier"

`q = (ℓ−k)(ℓ−k−1)…(ℓ−2k+2) / ((ℓ−1)(ℓ−2)…(ℓ−k+1))` is the probability that the same `k`-subset is *not* re-queried in a given round; `q → 1` as `ℓ → ∞` for fixed `k`. The discount-condition ③ tightens as `q → 1` — i.e., a larger pool makes the discount-rate constraint easier to satisfy and shrinks the required reward `λ_r`. Equivalently: with many cheap servers and rare repeat-encounters, the colluding group of any given query are "strangers" who have no future leverage on each other, so the reward to defect dominates the loss of future cooperation.&#8201;[^23]

[^23]: Theorem 3.2 (p. 7) and §3.3 (p. 8): `q` definition and feasibility analysis. Figure 4 shows feasibility shrinks as `δ → 1` (high patience) and `ℓ` decreases.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Inherited from the underlying multi-server PIR (computational 1-privacy under e.g., DCR, OWF, factoring). The mechanism layer adds: collision-resistant hash (SHA-3) for commitments, EUF-CMA digital signatures (ECDSA), and (when malicious servers are present) zk-SNARKs for privacy-preserving collusion verification. |
| **Encryption/encoding scheme(s)** | None added by the mechanism. PIR queries/responses are committed with a perfectly-hiding, computationally-binding commitment `Comm(·)` (SHA-3-based) and signed.&#8201;[^24] |
| **Ring / Field** | N/A at the mechanism layer; inherited from base PIR (e.g., Boyle-Gilboa-Ishai uses GF(2); Hafiz-Henry uses GF(2)). zk-SNARKs use Pedersen commitments over an elliptic curve with generators `g, h` and modulus `N`.&#8201;[^25] |
| **Key structure** | Each server holds an ECDSA keypair for `BB` postings; users hold an ECDSA keypair for query commitments. No long-lived shared secret. Ethereum addresses serve as identities. |
| **Correctness condition** | Probabilistic non-collusion outcome with failure ≤ `2^{−η}` when `θℓ` servers are malicious, where `η` is statistical security parameter (paper uses `η=40`); satisfied when `((1−θ)ℓ choose 0)(θℓ choose k)/(ℓ choose k) + ((1−θ)ℓ choose 1)(θℓ choose k−1)/(ℓ choose k) ≤ 2^{−η}` (constraint S\* in §4.1).&#8201;[^26] |

[^24]: Figure 1 caption (p. 4): "`Comm(·)` is a perfectly hiding and computationally binding commitment scheme and `Sign(·)` is a secure digital signature scheme." §6.1 (p. 11) instantiates with SHA-3 and ECDSA.
[^25]: §4.2 Privacy-preserving verification (p. 9): Pedersen commitment with generators `g, h` and modulus `N`.
[^26]: §4.1 Statistical non-collusion outcome (p. 9), inequality (S\*).

### Underlying PIR options (plug-in)

The paper benchmarks two multi-server PIR engines as suitable plug-ins (Appendix B):

| Scheme | Servers | Communication | Notes |
|--------|---------|---------------|-------|
| Boyle-Gilboa-Ishai 2-server cPIR (CCS 2016) | `k = 2` | DPF-based; small queries | "highly efficient for million-sized databases"&#8201;[^27] |
| Hafiz-Henry `k`-server cPIR (PoPETs 2019) | `k = 2^K` | DPF-tree-based; `(k/(k−1))×` overhead | most efficient `k`-server cPIR for the paper's range&#8201;[^28] |

For both, query-side sampling of DPF keys is "less than 100 µs" and key-expansion on the server side is `≈ 0.5 ms` for a database with `2^{20}` rows; reconstruction is `≈ 130 ms` for a `1 GiB` entry. Compared in Appendix B against SealPIR (`O(√N)` comm, `~100×` response overhead), OnionPIR (`O(log N)` comm, `4.2×` overhead), Corrigan-Gibbs-Henzinger (`O(√N)` comm, sublinear server with hint), and SimplePIR (`6.5 GiB/s/core`, `O(√N)` comm with `124 MB` hint).&#8201;[^29]

[^27]: Appendix B.1 (p. 18): "Boyle-Gilboa-Ishai's construction for 2-server cPIR. This construction utilizes a PRG-based 2-party Distributed Point Function (DPF)."
[^28]: Appendix B.2 (p. 18): Hafiz-Henry's `k = 2^K`-server construction with `(2,2)`-DPF key shares and concatenation; "the answer reconstruction time is almost constant for each extra bit retrieved."
[^29]: Appendix B.2 "Efficiency comparison" (p. 18–19).

### Key Data Structures

- **Bulletin board entries.** For each PIR query, the user posts `2k` commitments-with-signatures `(c, σ) = (Comm(Q_i), Sign(c))` (real queries) and `(c', σ') = (Comm(Q'_i), Sign(c'))` (companion queries), plus a signed list of server indices `id = (id_1, …, id_k)`. After answering, each server posts response commitments `(c^1_{id_i}, σ^1, c^2_{id_i}, σ^2)`.&#8201;[^30]
- **Server deposits.** Held by `CC`. Must exceed `λ_p + λ_f` (paper recommends `k_{max} · max(λ_p, λ_f)` to absorb worst-case fines per query lifetime).
- **Self-insurance pool.** Service fees `λ_s` from completed queries are *detained* in `CC` for the privacy-protection period `T` (so leaving servers don't escape with their fees before potential whistleblowers report). Tension parameter `σ' = ((k−1)Ω − ℓ)/(k²Ω) · λ_p(1−r')^T / (λ_s(1+r)^T)` captures fee-pool adequacy; paper shows `σ' ≤ 1` is achievable for realistic deposit-interest rates `r ≈ 0.0001` and discount rates `r' = 0`.&#8201;[^31]
- **Journal data structure** (in `CC`): `Journal[id].pkList`, `Journal[id].filed`, `Journal[id].witness` — tracks accusations and prevents double-fining. (Algorithm 1, lines 1–14, p. 11.)

[^30]: Figure 1 "Normal Service" lines 1–7 (p. 4): explicit listing of commitments, signatures, and indices posted.
[^31]: §5.1 "A server is leaving the system" (p. 10): self-insurance pool design and tension formula.

### Database Encoding

N/A at the mechanism layer; inherited from base PIR scheme.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | `CC` deployment | Deploy Solidity coordinator on Ethereum | one-time | once (`4.7M gas` ≈ `$8.63`)&#8201;[^32] |
| Server enrollment | Each server | Lock deposit `≥ k·max(λ_p, λ_f)` in `CC` | one-time | per server (`105K gas` ≈ `$0.19` per `Deposit`) |
| User enrollment | User | Lock service-fee deposit | one-time | per user |
| Query gen | User | Sample real index `a`, `ω` companion indices, run base PIR `Q_1,…,Q_k`; commit & sign; post `(c, c', id, σ_id)` to `BB` | `O(k(ω+1))` commitments ↑ | per query (`405K gas` ≈ `$0.74` for `PostRequests`)&#8201;[^32] |
| De-commit to servers | User | Send de-commit info over secure channel to selected `k` servers | direct | per query |
| PIR answer | Each server | Verify de-commits, run base-PIR answer locally, post response commitments to `BB` | `O(1)` commitments ↑ per server | per query (`97K gas` ≈ `$0.18` per `SubmitResponse`)&#8201;[^32] |
| Decode | User | Verify commitments, retrieve responses, reconstruct `D_a` | — | per query |
| Service-fee claim | Server | After `T` time units, claim `λ_s` from pool | — | per query (`33K gas` ≈ `$0.06` per `ClaimServiceFee`)&#8201;[^32] |
| **Accusation** (rare, off-equilibrium) | Whistleblower | Submit `(f(·), inputs, output)` evidence to `CC` | — | only if collusion happens (`224K gas` ≈ `$0.41` per `Accuse`)&#8201;[^32] |
| **Verification** (rare) | `CC` | `CheckCircuits + VerifyExchange + VerifyGeneralFunc + (zkVerify)` | — | per accusation |
| **PaymentExec** (rare) | `CC` | Take `λ_p` from accomplices, distribute `λ_r` to accuser, fine `λ_f` if rejected | — | per accusation |

(Reference: Figure 1, p. 4; Algorithm 1, p. 11; Table 1, p. 13.)

[^32]: Table 1 (p. 13): gas and dollar costs for one-time deployment and each function call. Posting requests "cost about 0.74 dollars" (§6.1, p. 11).

### Two-Server Protocol Details (when `k=2`)

| Aspect | Server 1 | Server 2 |
|--------|----------|----------|
| **Data held** | Full DB copy `D` | Full DB copy `D` |
| **Query received** | One DPF key (Boyle-Gilboa-Ishai) or one Hafiz-Henry key share | symmetric |
| **Computation** | Standard base-PIR answer (e.g., DPF expansion + `XOR` aggregation) | symmetric |
| **Bulletin commitments** | `Comm(Q_1), Sign(...)`, then `Comm(A_1), Sign(...)` after answering | symmetric |
| **Security guarantee** | Computational 1-privacy of base scheme | symmetric |
| **Non-collusion assumption** | **Replaced** by SPE of the bulletin-board game; no longer required to hold a priori |

### Communication Breakdown (additive overhead vs base PIR)

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| Query commitments + sigs | ↑ to `BB` | `O(k(ω+1) · |hash|)` per query | No | SHA-3 hash ≈ 32 B; ECDSA sig ≈ 64 B&#8201;[^33] |
| Response commitments + sigs | ↑ to `BB` per server | `O(|hash|)` per server per query | No | |
| Server-to-user de-commits | ↓ direct | `O(1)` per server | No | Off-chain |
| Accusation evidence | ↑ to `CC` | `O(|f| + |inputs| + |output|)` | No | Only if collusion happens |
| zk-SNARK proof (malicious case) | ↑ to `CC` | `O(λ)` Plonk/Groth16 proof | No | Per accusation |

The communication overhead added is "approximately the 'Normal service' functions are transmitting fixed-length commitments of the random companion queries and the functions for 'Collusion resolution'." For SealPIR/XPIR baselines on `N=2^16`, the SHA-3 + ECDSA cost is "three orders of magnitude less" than computing the PIR response itself (`0.1ms` per signature vs `~100ms` per response).&#8201;[^34]

[^33]: §6.1 (p. 12): "Computing SHA-3 hash costs 30 base gas and 6 gas every 256 bits, and verifying ECDSA signatures involves recovering the signer with ecrecover, which consumes 3000 gas."
[^34]: §6.1 "Cryptographic, communication and computation overhead" (p. 12).

### Correctness Analysis

**Option D: Inherited Correctness + Probabilistic Non-Collusion.**

| Field | Detail |
|-------|--------|
| **Base scheme** | Any computational `(ℓ, k, 1)`-PIR satisfying Definition 1; benchmarked with Boyle-Gilboa-Ishai and Hafiz-Henry. |
| **What is preserved** | Base-PIR correctness `Pr[Y = D_i | I = i] = 1` and computational 1-privacy. |
| **What is added (rational case)** | Unique SPE `\bar C A \bar R` or `C A R` ⇒ no successful collusion at equilibrium (Theorems 3.1, 3.2). |
| **What is added (malicious case)** | With `θℓ` malicious servers, statistical non-collusion outcome with probability `1 − 2^{−η}` (Corollaries 2, 3, §4.1). Inequality `S\*` constrains `θ`.&#8201;[^26] |
| **Failure mode** | (i) ≥ k − 1 of the `k` queried servers are simultaneously *malicious* (probability bounded by `S\*`); (ii) the user falsely accuses servers (rate-limited by the framing-fine `λ_f`); (iii) malicious clients with prior knowledge of the queried index (mitigated by §4.3 traceable secret sharing). |
| **Proof technique** | (a) SPE proof by backward induction on the 3-round extensive game (`k=2` Figure 2; `k=3` Figure 3; general `k` by induction). (b) Repeated-game proof shows colluders earn higher returns from defecting (reporting) than from sustained cooperation under condition ③. (c) Statistical bound is union of "exactly `k−1` or all `k` queried servers are malicious".&#8201;[^17]&#8201;[^18] |
| **Adaptive vs non-adaptive** | The repeated-game analysis assumes static corruption (a fixed `θℓ` malicious set); rational players adapt their strategies but not their type. |
| **Query-model restrictions** | Servers must be sampled uniformly at random; user cannot reveal which queried-pair contains the real query before posting commitments. |

### Complexity (mechanism overhead only — base PIR is plug-in)

| Metric | Asymptotic | Concrete (Ethereum) | Phase |
|--------|-----------|---------------------|-------|
| Contract deployment | O(1) | `4,697,299` gas ≈ `$8.63` | Setup (one-time)&#8201;[^32] |
| `Deposit` per server | O(1) | `105,436` gas ≈ `$0.19` | Setup (per server) |
| `PostRequests` per query | O(`k(ω+1)`) | `405,657` gas ≈ `$0.74` | Online (per query) |
| `SubmitResponse` per server per query | O(1) | `97,400` gas ≈ `$0.18` | Online (per server per query) |
| `ClaimServiceFee` | O(1) | `33,103` gas ≈ `$0.06` | Online (per server per privacy period) |
| `Accuse` | O(`|f|`) | `223,766` gas ≈ `$0.41` | Off-equilibrium (per accusation) |
| `CheckCircuits` (non-triviality of `f`) | O(`|f|`) | `66,991+` gas ≈ `$0.12+` | Off-equilibrium |
| `VerifyExchange` (de-committed query/response) | O(1) | `61,822` gas ≈ `$0.11` | Off-equilibrium |
| `VerifyGeneralFunc` (general `f` plaintext) | O(`|f|`) | `275,279` gas ≈ `$0.51` | Off-equilibrium |
| `zkVerify` (Plonk verification when servers malicious) | O(λ) | `2,286,423` gas ≈ `$4.20` | Off-equilibrium |
| Proof generation (collaborative zkSNARK, per constraint) | — | `≈ 488 µs/constraint` for 2 parties | Off-equilibrium&#8201;[^35] |

(Source: Table 1, p. 13.)

[^35]: §6.2 (p. 12): "the least efficient case is multiple accused parties generating proofs with collaborative zkSNARKs. This takes only ≈488 µs per constraint for two parties [73]."

### Variants

| Variant | Key Difference | Threat Model | Best For |
|---------|---------------|--------------|----------|
| **Single-shot, all-rational** | Basic SPE analysis (§3.1); `λ_r = 0`, `λ_s + (k−1)/k λ_p > V` | All servers rational | Single or known-finite-runs PIR service |
| **Infinitely-repeated, all-rational** | Adds reporting reward `λ_r > 0`; condition ③ on discount factor `δ` | All servers rational, large `ℓ` | Long-lived deployments (most realistic) |
| **+ Malicious clients** (§4.3) | Adds traceable-secret-sharing for query/answer generation | Malicious `U`, rational servers | When user privacy must hide query from accomplices |
| **+ Malicious servers** (§4.1, §4.2) | Adds zkSNARK collusion resolution; statistical security `1 − 2^{−η}` | `θ` malicious servers + `(1−θ)` rational | Public deployments where some servers may misbehave arbitrarily |
| **Blind collusion** (Appendix A) | Players play `D` without verifying inputs; sequential-equilibrium (not SPE) analysis | Rational, non-input-verifying | Underlying PIR with no verification gadgets |

### Strong-Coalition Bound (§5.2)

When servers form mutually-trusted coalitions of size `s`, the cooperative-game core requires `v(C) = p_s sV + (k/ℓ)s λ_s` where `p_s = (s choose k−1)(ℓ−s choose 1) / (ℓ choose k)` is the probability the coalition holds ≥ `k−1` of the `k` queried slots. Two depreciation models considered:

| Coalition value model | `D(s)` | Result |
|-----------------------|---------|--------|
| Constant per-secret value | `D(s) = cV` | `k=2`: coalition does not grow at all. `k≥3`: max size `⌊(k−2)(kℓ−k+1)/(k−1)²⌋`. |
| Linear depreciation | `D(s) = cV/s` | `k=2`: max size 2. `k ≥ 3`: tighter bound via the cubic `c_1 s² + c_2 s + c_3` with `c_1, c_2, c_3` defined in §5.2 (root via online Desmos plot).&#8201;[^36] |

Intuitively: as more parties learn a secret, individual value decreases (rivalrous knowledge) and cooperative gains from adding members go negative.

[^36]: §5.2 (p. 11) and reference [42] (Gong, Desmos calculator).

### Implementation Notes

- **Smart contract:** Solidity, Ethereum mainnet target. Source at github.com/haas256/PIR (cited as [43]).&#8201;[^20]
- **Commitment / signature:** SHA-3 hash + ECDSA. ECDSA verification uses `ecrecover` (3000 gas). Signing time ≈ 0.1 ms per message off-chain.&#8201;[^33]
- **zk-SNARKs:** Groth16 for fixed `f`, Plonk for general arithmetic circuits, LegoSNARK for polynomial commitments, collaborative zkSNARKs (Ozdemir-Boneh USENIX 2022) when multiple accused servers must jointly prove. Circom 2.0 used as the front-end compiler. Plonk is used in the implemented verifier contract.&#8201;[^37]
- **Pedersen commitments** for hiding accuser's `s` and accused's claimed output `g^s`: range proofs (Bünz et al., S&P 2018) prove `c' = c/g^s ≠ commitment-to-zero` (i.e., that the alleged output mismatches the de-committed input).&#8201;[^25]
- **Oracle for non-triviality of `f`:** off-chain Chainlink oracle performs taint analysis on smart-contract bytecode (via EthIR + Securify) when `f` is too complex to verify on-chain.&#8201;[^38]
- **Auxiliary-info window `Δ`:** time given to accused servers to provide auxiliary information; set `Δ > max{δ_1, δ_2}` where `δ_1` is max offline time (e.g., 14 days based on Lightning hashlocked-time contracts; Ethereum inactivity penalties motivate ~36 days) and `δ_2` is DDoS downtime (Cloudflare 2023: 99% of attacks last < 3 hours, 86% < 10 min).&#8201;[^39]
- **Proof-collection window `Δ\*`:** `Δ\* = δ_1 + δ_2 + ` proof generation time.

[^37]: §6.1 "Zero-knowledge coordinator" (p. 12) and §4.2 (p. 9): zkSNARK schemes and Circom front-end.
[^38]: §6.1 (p. 12): Chainlink + EthIR + Securify oracle for non-triviality verification of `f(·)`.
[^39]: §6.2 "Set Δ and Δ\*" (p. 12–13): blockchain-derived bounds on offline and DDoS windows.

### Application Scenarios

The paper highlights **blockchain light-client privacy** as the killer application. Public blockchains have thousands of full nodes (Ethereum: ~10K reachable; Bitcoin: ~10K reachable per Bitnodes 2023), giving `ℓ ≫ k` natively. Existing solutions either rely on inefficient query-by-anonymisation, trusted hardware, or coding-based PIR with strong non-collusion. *More is Merrier* lets a light client query the public-blockchain-replicating nodes via standard cPIR plus the on-chain incentive game.&#8201;[^40]

[^40]: §1 Introduction (p. 1) and §1.1 "Relevance to Blockchain Privacy" (p. 3): "Blockchains are particularly suitable application scenarios for our mechanism as prominent blockchains have thousands of full nodes [10], [36]."

### Performance Benchmarks

The paper reports **on-chain gas costs only** — *not* PIR throughput, query latency, or end-to-end timing for the cryptographic layer (those are determined by the plug-in PIR scheme; see Appendix B for indicative figures). Reproduced Table 1 (p. 13):

| Function | Gas | USD (Aug 2023, [84]) |
|----------|-----|----------------------|
| Contract deployment | 4,697,299 | $8.63 |
| `Deposit(·)` | 105,436 | $0.19 |
| `PostRequests(·)` | 405,657 | $0.74 |
| `SubmitResponse(·)` | 97,400 | $0.18 |
| `ClaimServiceFee(·)` | 33,103 | $0.06 |
| `Accuse(·)` | 223,766 | $0.41 |
| `CheckCircuits(·)` | 66,991+ | $0.12+ |
| `VerifyExchange(·)` | 61,822 | $0.11 |
| `VerifyGeneralFunc(·)` | 275,279 | $0.51 |
| `zkVerify(·)` | 2,286,423 | $4.20 |

(Off-equilibrium costs `Accuse / CheckCircuits / VerifyExchange / VerifyGeneralFunc / zkVerify` are paid only when an actual collusion event happens — at equilibrium they never fire.)

### Key Tradeoffs & Limitations

- **Lower bar, not zero bar.** The mechanism does *not* prove collusion is impossible — it raises the price. If the secret worth `V` exceeds `λ_s + (k−1)/k λ_p`, rational servers will collude. For very high-value secrets (large `V`) the deposits `λ_p` must scale up correspondingly.&#8201;[^41]
- **Function `f(·)` non-triviality must be verifiable.** The whistleblower must report a non-trivial `f(·)` over user secrets. Verifying non-triviality on-chain is impractical for arbitrary smart contracts; paper falls back to a Chainlink oracle. This is a real assumption: a zkSNARK that proves "I learned bit `i` of `D_a`" is required to be expressible as an arithmetic circuit.&#8201;[^38]
- **Privacy worth `V` must be *known and bounded*.** The system designer must pick `V` upfront (Proposition 1). Underestimating `V` allows profitable collusion; overestimating wastes deposits.
- **Patient adversaries.** As `δ → 1`, the discount-rate condition ③ tightens: very patient colluders are harder to deter. The paper handles this by requiring large `ℓ` so `q → 1`.&#8201;[^42]
- **Bounded malicious fraction.** Inequality `S\*` requires the malicious fraction `θ` to be small enough that the probability of `≥ k−1` malicious servers in a queried set is `≤ 2^{−η}`. For `k=2, η=40`: `θ ≤ 2^{−20}` if naively bounded; for larger `k` the bound loosens since the probability term decays in `k`.&#8201;[^26]
- **Smart-contract trust.** The mechanism trusts Ethereum's liveness and finality, plus the external Chainlink oracle and Circom/Plonk circuit correctness. Re-orgs of `BB` could allow short-window evidence tampering.
- **No incentive for honest reporting outside the SPE.** A *blind* colluder (one who plays `D` without verifying inputs) only achieves *sequential equilibrium* (Appendix A, Theorem A.1), not SPE. The paper's "main body" assumes input-verification gadgets exist in the underlying PIR (e.g., Hafiz-Henry's redundant-key construction).&#8201;[^43]
- **Self-insurance pool tension.** Sufficient detained-fee pool to cover `(k−1)·Ω/ℓ` worth of fines in the worst case. For small `ℓ` (relative to query rate `Ω`) the pool may be insufficient; mitigated by interest accrual `r` over privacy period `T`.&#8201;[^31]
- **Strong coalitions cap protocol generality.** When mutually-trusted cliques are pre-formed, only the bound from §5.2 applies; if a coalition reaches `k` members, all bets are off.&#8201;[^11]
- **Excludes general MPC tasks for now.** The framework is tailored to PIR's structure (correctness-targeted vs privacy-targeted distinction). Extending to general secret-sharing-style privacy applications is left as future work.&#8201;[^44]

[^41]: §3.1 Theorem 3.1 (p. 5): "λ_s + (k−1)/k λ_p > V" — explicit dependence on bounded `V`.
[^42]: §3.2 (p. 7) and §3.3 (p. 8): condition ③ tightens with `δ`.
[^43]: §3.1 "Blind collusion" (p. 6) and Appendix A (p. 16–18): without verification, only sequential equilibrium achievable; main body addresses verifying case.
[^44]: §8 Concluding remarks (p. 13): "One intriguing direction for future work is to study mechanisms for other secret-sharing-style applications or generic MPC."

### Open Problems (stated by authors)

- Mechanisms for general MPC tasks beyond PIR.&#8201;[^44]
- Tight collusion-resistance for general-access-structure secret sharing (footnote 2, p. 2).
- Designing on-chain non-triviality checks for `f(·)` without an oracle.
- Lowering `zkVerify` cost (currently $4.20 dominates per-accusation costs).
- Tighter coalition-size bounds for value-functions other than constant or linear-depreciation.&#8201;[^11]

### Uncertainties

- Table 1's costs were measured in Aug 2023; ETH/USD volatility means the dollar figures shift, but gas amounts are stable.
- The paper writes "λ_p" sometimes to mean per-server penalty and sometimes total penalty pool; reading carefully against Theorem 3.1 disambiguates: `λ_p` is the per-server fine (so total seized from `(k−1)` accomplices is `(k−1)λ_p`).
- Inequality ③'s exact form (`δ/(1−δ)·(1−q)V < λ_r ≤ λ_p`) appears in Theorem 3.2 as the `λ_r` lower bound; Proposition 1 ③ writes the same bound with `q` expanded. Both refer to the same constraint.
- The "self-insurance" tension `σ' ≤ 1` derivation in §5.1 assumes constant query arrival rate `Ω/T`; bursty traffic could break the bound.
