## CK20 — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Private Information Retrieval with Sublinear Online Time](https://eprint.iacr.org/2019/1075) (Eurocrypt 2020; full version 2022-03-28) |
| **Archetype** | Construction (theory-only) + Building-block + Theory (lower bound) |
| **Asymmetry profile** | **Role asymmetry** — offline server runs Õ(n) work scanning DB once; online server runs Õ(√n) probing only ~√n bits. The two servers are interchangeable replicas of the same DB; only their *temporal role* per session differs. |
| **Multi-server model** | Two non-colluding servers (statistical security) **or** single server (computational security via LHE/FHE). Servers store DB *unencoded* and keep no extra state.&#8201;[^1] |
| **Security model** | Honest-but-curious (single-query schemes, §3); active/malicious one of the two servers (multi-query scheme, §4, security proven in Appendix D).&#8201;[^2] |
| **Additional assumptions** | None (statistical 2-server) / OWF/PRG (computational 2-server) / Linearly-Homomorphic Enc + standard sublinear-comm 1-server PIR (1-server O(n^{2/3})) / FHE (1-server O(√n)) |
| **Correctness model** | Probabilistic with negligible failure after λ parallel repetitions; perfect correctness achievable via non-private fallback at negligible security cost.&#8201;[^3] |
| **Rounds (online)** | 1 (single-server: client → server → client; two-server: client → online server → client). Offline phase is a separate prior round with the offline server. |
| **Record-size regime** | Bit-database (n bits). Appendix C.1 discusses extension to longer rows. |

[^1]: §1.2 "A lower bound" (p.4): the lower bound is proved against schemes "in which the servers store the database in unencoded form and keep no additional state"; the construction inherits this property — Theorem 23 (p.28).
[^2]: §4 (p.22): the multi-query security definition (Appendix D) "accounts for an active (fully malicious) adversary that controls either of the two servers, and can adaptively choose the database indices that the client queries."
[^3]: §3.3 (p.21): "the scheme fails if either i_punc ≠ i_pir or i_pir ∉ ∪_j S_j … by running O(λ) instances of the scheme in parallel … we can drive the overall failure probability to be negligible in λ"; perfect correctness via non-private fallback when the protocol detects an error.

### Lineage
| Field | Value |
|-------|-------|
| **Builds on** | Pudlák–Rödl 1993 / 1997 [PR93, PRS97] (3-party 2-server PIR with marginally sublinear online time) ; Beimel–Ishai–Malkin 2004 [BIM04] PIR-with-preprocessing lower bound (linear server-time barrier without extra storage); Boneh–Lewi–Wu 2017 [BLW17] (privately constrained PRFs implying 2-server schemes with linear online server). |
| **What changed** | First 2-server *and* first single-server offline/online PIR with **truly sublinear (Õ(√n) or Õ(n^{2/3})) online server time** while the servers store the DB *unencoded*. Introduces the *puncturable pseudorandom set* (PPS) primitive as the key new building block. |
| **Superseded by** | Piano (2023, single-server PRF-only realization of the same offline/online template — eliminates the second server in the bit-DB regime); Plinko (2024, invertible-PRF improvements); SinglePass / TreePIR / IncPIR / TAPIR (extensions of the offline/online split to streaming, mutable, and per-record databases). |
| **Concurrent work** | Hamlin, Ostrovsky, Weiss, Wichs [HOWW18] PANDA — relaxes to mutable server state. Patel, Persiano, Yeo [PPY18] — offline/online with linear online time, sublinear *online public-key ops*. CK20 is the first to push *all* online server time below n. |

### Core Idea
Push the unavoidable Ω(n) PIR work into a **query-independent offline phase**. In the offline phase the client requests parities of √n random size-√n subsets of [n] from one server (the *offline server*). Online, the client locates a hint set S_j containing its target index i, sends S_j∖{i*} (almost — with bias toward i — see §1.5 toy protocol) to the second *online server*, which XORs only those √n DB bits and returns one parity bit; the client recovers x_i using the hint. The compression key is a new primitive — *puncturable pseudorandom sets (PPS)* — letting the client send a √n-element set as a short PRF-derived key, and a punctured key that hides which element was removed.&#8201;[^4]

[^4]: §1.5 "Technical overview" (pp.9–11) and §3.3 "Construction of PIR from puncturable pseudorandom sets" (pp.20–21).

### Multi-server Model

| Aspect | Offline server | Online server |
|--------|----------------|---------------|
| **Trust** | Honest-but-curious (semi-honest); active adversary tolerated in multi-query variant |
| **Data held** | Full replica of DB x ∈ {0,1}^n (unencoded, identical to online server's copy)&#8201;[^5] |
| **Phase contacted** | Once, in offline phase | Once per online query |
| **Computation** | Õ(n) — scans entire DB to build hint | Õ(√n) — probes ~√n bits only |
| **Communication received** | One PPS set key + √n shifts (Õ(√n) bits) | One punctured set key (poly(λ, log n) bits) |
| **Communication sent** | √n parity bits = Õ(√n) | 1 parity bit per query |
| **Non-collusion assumption** | Required: collusion would reveal both S and i, breaking privacy. Each server, in isolation, sees a distribution independent of i.&#8201;[^6] |

[^5]: §3.1 Definition 8 (p.17): both servers' Hint and Answer algorithms operate on the same x ∈ {0,1}^n.
[^6]: §1.5 (p.10): "the values that both servers see are distributed independently of the index i that the client is trying to read"; security against each server is reduced separately.

In the **single-server** specializations (Theorems 20, 22, Remark 21) the same server plays both roles across the two phases; security relies on hiding the offline query inside an LHE/FHE ciphertext so the server learns nothing about which set was requested.&#8201;[^7]

[^7]: §5 (p.24) and §5.1 "An unbalanced scheme" (p.25): "the offline phase, the client obtains the hint without leaking anything about it to the server" via LHE; same server handles both phases.

### Variants

| Variant | Theorem | Setting | Offline comm | Online comm | Online server time | Assumption |
|---|---|---|---|---|---|---|
| Two-server statistical | Thm 11 (p.18) | 2-server, single-query | O(λ √n log²n) | O(λ √n log n) | Õ_λ(√n) | None (perfect PPS via Fact 2) |
| Two-server computational | Thm 14 (p.19) | 2-server, single-query | O(λ √n log n) | O(λ² log n) | Õ_λ(√n) | PRG / OWF |
| Two-server multi-query | Thm 17 (p.22) | 2-server, q adaptive queries from one offline | O(λ √n log n) | O(λ √n log n) | Õ_λ(√n) | PRP |
| Two-server multi-query (low-comm) | Cor 18 (p.22) | 2-server, q queries | (down to O(λ² log n) per query) | O(λ² log n) | Õ_λ(n^{5/6}) | PRG (online time worsens) |
| Single-server LHE | Thm 20 (p.25) | 1-server, single query | Õ_λ(n^{2/3}) | Õ_λ(n^{1/3}) (after rebalancing) | Õ_λ(n^{2/3}) | LHE + sublinear-comm 1-server PIR |
| Single-server FHE | Thm 22 (p.27) | 1-server, single query | Õ_λ(√n) | Õ_λ(√n) | Õ_λ(√n) | FHE |
| Single-server "much simpler" | Rem 21 (p.25) | 1-server, single query | O(√n) | O(√n) | linear bits ops, no PK in online | LHE |

Communication-time tradeoff (Remark 13, p.18): for any C(n) ≤ n/2, one can obtain offline comm = C(n) bits and online server time Õ(n/C(n)) — generalizing the √n point.

### Novel Primitives / Abstractions

#### Puncturable Pseudorandom Set (PPS) — Section 2

| Field | Detail |
|-------|--------|
| **Name** | Puncturable Pseudorandom Set (with size s : ℕ → ℕ) |
| **Type** | Cryptographic primitive (set-valued analog of a puncturable PRF) |
| **Operations** | `Gen(1^λ, n) → sk`; `Punc(sk, i) → sk_p`; `Eval(sk) → S ⊆ [n], |S| = s(n)`; extended with `GenWith(1^λ, n, i) → sk` (sample uniformly conditioned on i ∈ Eval(sk)) and `Shift(sk, δ) → sk′` such that `Eval(sk′) = {i + δ mod n : i ∈ Eval(sk)}`.&#8201;[^8] |
| **Security** | PPS adversary's advantage in Game 1 (p.14) is at most 1/(n−s(n)+1) + negl. Implies Eval(Gen) is computationally indistinguishable from a uniform s-subset (Proposition 34, Appendix B.1).&#8201;[^9] |
| **Correctness** | `Eval(Punc(sk, i)) = S ∖ {i}` for all i ∈ S. Imperfect-correctness gap (negl probability) closed by treating sk = ⊥ as a fixed set [s] (Remark 5, p.14). |
| **Purpose** | Compactly send a √n-subset (key length O(λ + log n)) and a punctured √n-subset that hides the removed element. |
| **Built from** | Tree-based puncturable PRF [BW13, KPTZ13, BGI14] from any length-doubling PRG (GGM tree) — Construction 4 (p.15) sets s(n) = √(n/2) and rejection-samples until distinct outputs. Set keys: λ + O(log n) bits; punctured keys: O(λ log n) bits.&#8201;[^10] Alternative: PRP-based PPS with `InSet` fast-membership test in poly(λ, log n) (Theorem 7, p.15; Appendix B.4). |
| **Standalone complexity** | Gen / Punc / Eval all run in s(n)·poly(λ, log n) time. |
| **Relationship to prior primitives** | Strictly weaker than DPF — PPS is a *set* representation, not a unit-vector. Output of Eval has the inherent biased distribution (no element appears more often than 1/(n−s+1)). Recast as "sparse DPF" in Appendix G.&#8201;[^11] |

[^8]: §2.1 Definition (p.13) and §2.3 (p.16) for the (Shift, GenWith) extensions.
[^9]: §2.1 "Security" (p.13) defines `PSAdv` as the gap from the optimal non-trivial guessing probability 1/(n−s(n)+1); Proposition 34 (Appendix B.1, p.37) derives pseudorandomness of the set itself.
[^10]: §2.2 Theorem 3 (p.14), Construction 4 (p.15), Corollary 6 (p.14): PPS with set keys O(λ + log n), punctured keys O(λ log n) from any PRG.
[^11]: §7 "Open questions" (p.29) and Appendix G — the construction is recast as a *sparse distributed point function* abstraction.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumptions** | (Statistical): None — information-theoretic. (Computational 2-server): existence of PRGs / OWF. (Single-server Thm 20): linearly homomorphic encryption over a finite field with a primitive n-th root of unity (e.g., Paillier [Pai99] / Damgård-Jurik [DJ01] / Okamoto-Uchiyama [OU98]) **and** an existing sublinear-comm 1-server PIR with linear server time (e.g., [CMS99]). (Single-server Thm 22): FHE [Gen09]. |
| **Encryption / encoding scheme(s)** | LHE (additive) for the single-server LHE construction; FHE (any) for the FHE construction. Plaintexts encode the indicator vector v ∈ {0,1}^n of the offline set S (component-wise encryption of v). |
| **Ring / Field** | Field F with primitive n-th root of unity, used so that the server's `ct_h = ct_S · Circ(x)` matrix-vector product can be computed by FFT in Õ_λ(n) instead of Õ(n²).&#8201;[^12] |
| **Key structure** | Two-server: PPS key sk (λ + O(log n) bits), punctured key sk_p (O(λ log n) bits), plus √n shifts δ_1, …, δ_√n compressible to one PRG seed. Single-server: LHE key + n LHE ciphertexts in offline phase. |
| **Correctness condition** | (i) Client's target index i ∈ ∪_j S_j (Pr[fail] ≈ 1/n; reduced by m = √n log n shifts and λ parallel repetitions). (ii) Punctured index matches PIR target (Pr[fail] = (s−1)/n; absorbed into the same λ-fold parallel repetition).&#8201;[^13] |

[^12]: §5.1 "Server computes the parities for all possible shifts of S" (p.26): the matrix is `Circ(x)` with primitive n-th root of unity; FFT yields Õ_λ(n) total work.
[^13]: §3.3 (p.21): "the scheme fails if either i_punc ≠ i_pir or i_pir ∉ ∪_{j∈[m]} S_j. The probability of the former is (s−1)/n and, by setting m ≈ n log n / s, we can drive down the probability of the latter to be approximately 1/n."

### Key Data Structures
- **DB:** x ∈ {0,1}^n stored *unencoded* on both servers — central to the lower bound.
- **Client persistent state (between offline and online):** PPS set key sk (λ + O(log n) bits), m = (n/s) log n shifts δ_1, …, δ_m (compressible to a single λ-bit PRG seed), and m parity bits h_1, …, h_m (i.e., m = √n log n bits total). Total Õ_λ(√n) bits per repetition.&#8201;[^14]
- **Hint h:** for each shift δ_j, the parity h_j = ⊕_{i∈S_j} x_i where S_j = Shift(sk, δ_j). Output is a binary string of length m.
- **Online query:** punctured PPS key q = Punc(sk_q, i_punc) ∈ K_p, of size κ_p = O(λ log n) bits (computational) or O(s log n) bits (statistical, Fact 2).

[^14]: Lemma 15 (p.19): client stores O(λκ + (λn/s(n)) log²n) bits between phases.

### Protocol Phases (Two-Server Single-Query, Construction 16, p.20)

| Phase | Actor | Operation | Communication | Frequency |
|-------|-------|-----------|---------------|-----------|
| **Setup** | Client | sk ← Gen(1^λ, n); δ_1,…,δ_m ←$ [n]; ck ← (sk, δ_1,…,δ_m); q_h ← sk | — | Once / session |
| **Offline upload** | Client → Offline server | sk + δ vector | Õ_λ(√n) bits (one PPS key + PRG seed for shifts) | Once |
| **Hint** | Offline server | for j ∈ [m]: S_j ← Eval(Shift(sk, δ_j)); h_j ← ⊕_{i∈S_j} x_i | — (Õ_λ(n) compute) | Once |
| **Offline download** | Offline server → Client | h = (h_1,…,h_m) | m = √n log n bits | Once |
| **Query** | Client | find j with i_pir + δ_j ∈ Eval(sk); flip Bernoulli((s−1)/n) bit b; puncture sk_q at i_punc; output q ← Punc(sk_q, i_punc) | — | Per query |
| **Online upload** | Client → Online server | q (punctured PPS key) | O(λ log n) bits | Per query |
| **Answer** | Online server | S* ← Eval(q) (size s−1); a ← ⊕_{i∈S*} x_i | — | Per query (probes s−1 = Õ(√n) bits) |
| **Online download** | Online server → Client | one bit a | 1 bit | Per query |
| **Reconstruct** | Client | if b = 0: x_i ← h_j − a mod 2 | — | Per query |

The whole protocol is run in λ parallel independent instances to drive the failure probability to 2^{−λ} (Theorem 11).

### Key construction details and intuition

**The "two key bits" b ∈ Bernoulli((s−1)/n).** Without the bias, sending S_j ∖ {i} would leak that i was the dropped element. Sending S′ = S_j ∖ {i*} where i* = i with probability 1 − (√n−1)/n and i* is a uniform other element of S_j with the remaining probability makes S′ a uniformly random size-(√n−1) subset, *independent* of i. The client succeeds whenever b = 0 (event probability (n − s + 1)/n).&#8201;[^15] In Construction 16, b = 0 corresponds to "puncture at i_pir" and b = 1 to "puncture at a random other element of the set"; Reconstruct returns ⊥ when b = 1, signaling the need for a re-run via parallel repetition.

[^15]: §1.5 "A toy protocol" (p.9): the bias 1 − (√n−1)/n is precisely what makes the second server's view i.i.d. uniform over (√n−1)-subsets; the resulting per-instance failure prob is O(1/√n), reduced to 2^{−λ} via λ parallel runs.

**Hint compression via random shifts (the "patched" toy scheme).** A naive offline phase would send √n explicit subsets at Ω(n log n) cost. CK20 sends *one* PPS key sk (Õ(λ) bits) + a vector of √n random shifts δ_j and reconstructs S_j ← {i + δ_j : i ∈ S} on the server. The shift vector itself is compressed to a single PRG seed in the computational variant (Lemma 15 footnote, p.19).

**Multi-query refresh idea (§4, p.23).** After using set S_j to read x_i, the client must replace S_j with a fresh size-√n set S_new whose joint distribution with the remaining hints matches the original, *and* must obtain its parity h_new without leaking i. Solution: (1) use PPS biased sampling to draw S_new conditioned on i ∈ S_new; (2) send Punc(S_new, i) to the *left* (offline) server to get the parity of S_new ∖ {i}; XOR with x_i (just learned) to obtain h_new. This converts one offline phase into support for arbitrarily many adaptive queries without re-running the linear-time offline phase.

**Single-server reduction (§5.1, p.25–27).**
1. Client encrypts the indicator vector v ∈ {0,1}^n of the offline set S under LHE: ct_S ∈ G^n.
2. Server computes ct_h = ct_S · Circ(x) via FFT in Õ_λ(n) work, obtaining encryptions of *all n shifted parities* h_1, …, h_n.
3. Client retrieves the m shifted entries it actually needs via a batch single-server PIR [IKOS04 §5] in m·poly(λ, log n) communication and Õ_λ(n) server work.
4. Client decrypts and proceeds exactly as in the two-server online phase.
5. Rebalance with n^{1/3} buckets of size n^{2/3} (CGKS95 §4.3 trick) to reach total comm Õ_λ(n^{2/3}).

### Correctness Analysis (Option B — Probabilistic)

| Field | Detail |
|-------|--------|
| **Failure mode 1** | Target index i not contained in any of the m sampled shifted sets ∪_j S_j. |
| **Failure prob 1** | ≈ 1/n with m = (n/s) log n = √n log n.&#8201;[^16] |
| **Failure mode 2** | Punctured index i_punc differs from i_pir (Bernoulli(b=1) event used to randomize the punctured set). |
| **Failure prob 2** | (s−1)/n ≈ 1/√n per repetition. |
| **Combined failure** | Per parallel instance Pr[fail] = O(1/√n). |
| **Probability grows over queries?** | Single-query scheme: per-query independent. Multi-query scheme (§4): correctness preserved because hint refresh keeps joint distribution invariant; security holds adaptively up to polynomially many queries. |
| **Probability grows over DB mutations?** | N/A (DB is static; updates not addressed by CK20). |
| **Amplification** | Run λ independent parallel instances → Pr[overall fail] ≤ 2^{−λ}. Optionally: detect failure (negligible event) and read x_i non-privately to obtain *perfect* correctness at negligible security loss.&#8201;[^17] |
| **Adaptive vs non-adaptive** | Non-adaptive (Theorem 11) for the single-query construction; *adaptive* in the multi-query construction (Theorem 17 / Appendix D), even against a fully malicious server. |
| **Query model restrictions** | Single-query scheme: one online query per offline phase. Multi-query scheme: arbitrarily many adaptive queries per offline phase. |
| **Proof technique** | Game-hopping reduction to PPS security (which itself reduces to PRG/OWF or PRP). Lemma 36 ("key lemma", Appendix B.6) shows Punc(GenWith(1^λ, n, i), i) is computationally indistinguishable from Punc(Gen(1^λ, n), i*) for fresh i* — enabling the simulation that hides i. |

[^16]: §3.3 (p.21).
[^17]: §3.3 (p.21–22): "if the client detects an error (which happens with only a negligible probability), it simply reads its desired bit from the database using a non-private lookup."

### Complexity (Theorem 11, statistical 2-server, hides poly(λ))

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|----------|-------|
| Offline communication | O(λ √n log² n) | N/A (no implementation) | Offline (one-time per session) |
| Offline server time | Õ_λ(n) | N/A | Offline (linear scan) |
| Online communication | O(λ √n log n) | N/A | Online |
| Online server time | Õ_λ(√n) | N/A | Online |
| Online server probes | s − 1 = O(√n) | N/A | Online |
| Client time / memory | Õ_λ(√n) | N/A | Persistent |

**Theorem 14 (computational 2-server, with PRG):** offline comm O(λ √n log n), online comm O(λ² log n), other costs unchanged.&#8201;[^18]

[^18]: Theorem 14 (p.19).

**Theorem 17 (multi-query, with PRP):** identical online costs but a single offline run amortizes over q adaptive online queries, giving amortized total work Õ(n/q + √n).&#8201;[^19]

[^19]: §1.2 "Two-server PIR with sublinear amortized total time" (p.4) and Theorem 17 (p.22).

**Single-server (Theorem 20, LHE):** offline comm Õ_λ(n^{2/3}), offline server time Õ_λ(n), online comm Õ_λ(n^{1/3}), online server time Õ_λ(n^{2/3}), client memory Õ_λ(n^{2/3}). No public-key ops in the online phase.

**Single-server (Theorem 22, FHE):** offline comm + online time Õ_λ(√n).

### Lower Bound (Theorem 23, §6)

| Field | Detail |
|-------|--------|
| **Bound type** | Communication–time tradeoff for offline/online PIR |
| **Bound statement** | For any offline/online PIR scheme that (i) stores DB unencoded, (ii) keeps no extra server state, (iii) uses C bits of offline download, (iv) probes T DB bits online, and (v) succeeds with prob ≥ ε ≥ ½ + Ω(1): (C+1)(T+1) ≥ Ω̃(n).&#8201;[^20] |
| **Variables** | C = client-side offline communication, T = online server probe count, n = DB size. |
| **Model assumptions** | Both 2-server *and* single-server schemes covered. Computational security suffices (lower bound holds against any computationally-secure scheme of this form). DB unencoded, no extra storage. |
| **Proof technique** | Reduction from offline/online PIR to **Yao's Box Problem** (Yao 1990 [Yao90]); a known communication-time lower bound for the Box Problem then yields the (C+1)(T+1) ≥ Ω̃(n) bound.&#8201;[^21] |
| **Tightness** | Matched up to log factors by the constructions: Theorem 11 attains C = Õ(√n), T = Õ(√n); Theorem 22 attains C = Õ(√n), T = Õ(√n) in the single-server FHE setting. |
| **Implication** | Any sublinear-online-time PIR with unencoded DB **must** have polynomial offline communication (Ω̃(√n)) — rules out the Cachin-Micali-Stadler-style polylog-comm scheme [CMS99] when online time is required to be sublinear. |

[^20]: Theorem 23 (p.28).
[^21]: §6 (p.28) and Appendix F: "We prove Theorem 23 by showing that an offline/online PIR scheme implies a solution for a computational task called 'Yao's Box Problem.'"

### Comparison to Prior Approaches (Table 2, p.6 — selected rows)

| Scheme | Setting | Offline (Time / Comm) | Online (Time / Comm) | Extra storage |
|--------|---------|-----------------------|----------------------|----------------|
| [BIM04] PIR-with-preproc, 2-server | 2-server | 0 / 0 | n^{0.55} / n^{0.55} | server: n^{37.7} |
| [BIM04] (smaller storage point) | 2-server | 0 / 0 | n^{0.9} / n^{0.9} | server: n^{1.27} |
| [DIO01] | 2-server | n / n (one-time) | log n / log n | server: mn |
| [BLW17] privately-constrained PRFs | 2-server | log n / n / log n | log n / *n* / log n | 0 |
| **CK20 Theorem 11** | 2-server | n^{1/2} / n / n^{1/2} | n^{1/2} / **n^{1/2}** / n^{1/2} | **0** |
| **CK20 Theorem 14** | 2-server | n^{1/2} / n / n^{1/2} | n^{1/2} / **log n** / log n | **0** |
| **CK20 Theorem 17** (multi-query) | 2-server | n^{1/2}/q / n/q / n^{1/2}/q | n^{1/2} / n^{1/2} / n^{1/2} | 0 |
| [CMS99] / [Lip05] | 1-server | 0 / 0 / 0 | log^c n / *n* / log^c n | 0 |
| [BIPW17] OLDC + VBB Obf. | 1-server | 0 / 0 / 0 | n^ε / **n^ε** / n^ε | 0 |
| **CK20 Theorem 20** (LHE) | 1-server | n^{2/3} / n / n^{2/3} | n^{2/3} / **n^{1/3}** / n^{2/3} | 0 |
| **CK20 Theorem 22** (FHE) | 1-server | n^{1/2} / n / n^{1/2} | n^{1/2} / **log n** / n^{1/2} | 0 |
| [BIM04] lower bound | — | — | ≥ n / β | — | server: 0 (only for unencoded DB) |
| **CK20 Theorem 23 lower bound** | — | — / n/β | β / — | 0 (unencoded DB) |

(Bold cells highlight the cells that became online cost with sublinear server time and zero extra server storage — the core CK20 contribution.)

### Key Tradeoffs & Limitations
- **Total communication is Ω̃(√n) — not polylog.** This is *inherent* (Theorem 23) for any unencoded-DB, sublinear-online-time scheme. Standard polylog-comm cPIR schemes (CMS99, Lip05) require full DB scan online.&#8201;[^22]
- **One-shot offline phase.** Each offline interaction enables at most one online query in the basic Theorem 11/14 schemes; the multi-query extension (Theorem 17, §4) requires a non-trivial *hint refresh* protocol that contacts the offline server again on every query (just for hint refresh, not for the answer).
- **No implementation / benchmarks.** Theory paper; concrete efficiency claimed up to poly(λ, log n) factors and Remark 12 (p.18) states hidden factors can be made as small as O(λ log n).
- **Single-server FHE variant relies on FHE.** The √n-online-time single-server scheme requires FHE; the LHE-only construction degrades to n^{2/3}.
- **No client anonymity.** Client must persist Õ(√n) state between offline and online phases — does not support anonymous one-shot lookups.
- **Anonymous-query and stateless-server use cases not addressed.** Both servers store the same DB unencoded but neither stores per-client state — so server-side multi-tenant scaling is OK, but the client must remember its hint.

[^22]: §1.3 "Limitations" (p.4–5) and Theorem 23 (p.28).

### Comparison with Prior Work

| Metric | CK20 (Thm 11) | [BIM04] PIR-w-preproc | [BLW17] privately-constrained PRFs | [DIO01] |
|--------|---------------|-----------------------|-----------------------------------|---------|
| Online server time | Õ(√n) | n^{0.55}–n^{0.9} | n (linear) | log n |
| Online comm | Õ(√n) (Thm 14: log n) | n^{0.55}–n^{0.9} | log n | log n |
| Extra server storage | **0** | n^{1.27}–n^{37.7} | 0 | mn (per client × clients) |
| Assumption | None / OWF | None | LWE | OWF |
| Offline server time | Õ(n) | 0 (after one-time encoding) | n | n |

**Key takeaway:** The first scheme to achieve sublinear online server time **with zero extra server storage** in both 2-server and 1-server (under LHE/FHE) settings, at the unavoidable cost of Ω̃(√n) total communication.

### Portable Optimizations
- **Puncturable Pseudorandom Sets (Section 2)** — the PPS abstraction (later recast as *sparse DPFs* in Appendix G) is reusable in any setting that needs to communicate a compact pseudorandom subset and its puncturing. Picked up in subsequent sublinear-online-time work (Piano, Plinko, TreePIR's wpPRF) and broadly in FSS-based PIR.
- **Hint refresh via punctured-set query (§4)** — pattern of contacting the heavy server with a punctured version of the just-used set to obtain a fresh independent hint without re-running the linear offline phase. Reused in Piano and follow-ups.
- **LHE × Circulant matrix via FFT (§5.1)** — when a server holds the DB and the client encrypts an indicator vector, the server can FFT-compute *all n cyclic shifts of the parity* in Õ(n) time, then the client retrieves a sparse subset via batch PIR. Generic technique applicable to any LHE.
- **Yao's Box Problem reduction (§6, Appendix F)** — proof template for offline/online PIR-style lower bounds.

### Implementation Notes
- **No implementation.** Theory-only paper.
- **PRG instantiation in practice:** any standard length-doubling PRG (AES-CTR, ChaCha) suffices for the GGM-tree-based PPS. Set/punctured-key sizes are dominated by λ log n bits.
- **Open-source follow-ups:** Piano (USENIX 2024) provides the first practical implementation in the same offline/online template; TreePIR/SinglePass extend to streaming and 2-server statistical settings.

### Open Problems (stated in §7, p.29)
- Construct an offline/online PIR scheme with **online time o(n)**, total client storage o(n), and online time **polylog(n)** (currently √n).
- Does Theorem 22 (single-server √n-online) follow from an assumption weaker than FHE?
- Can the **multi-query** scheme (Section 4) be realized in the **single-server** setting?
- Are there simpler **sparse DPF** (Appendix G) constructions than the ones implied by the PIR schemes?

### Uncertainties
- Concrete benchmark numbers — none reported by CK20; any numerical comparison must come from later implementations (Piano 2023 onward).
- Tight constants in Õ_λ(·) hidden by Remark 12 — paper claims λ log n suffices but does not derive explicit constants.
