## CGKS — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Private Information Retrieval](https://dl.acm.org/doi/10.1145/293347.293350) — Chor, Goldreich, Kushilevitz, Sudan. FOCS 1995, JACM 45(6), Nov 1998, pp. 965–982. |
| **Archetype** | Theory + Construction (theory-only) + Lower Bounds (foundational / model-defining) |
| **Asymmetry profile** | **Symmetric** — every one of the k servers receives an independently uniform query subset and replies with a single XOR parity bit; queries are interchangeable and answer functions are identical (A_1 = ... = A_k).&#8201;[^1] All servers do O(n) bit-XOR work; no role split, no preprocessing, no per-server state. |
| **Multi-server model** | k ≥ 2 non-colluding servers, each holding an identical replica of the database x ∈ {0,1}^n. The *Single-Server Case* is proved impossible for any non-trivial communication (Theorem 5.1.1).&#8201;[^2] |
| **Security model** | Information-theoretic (perfect privacy); each server's marginal view is identically distributed regardless of the queried index i. Computationally-unbounded servers cannot learn anything about i.&#8201;[^3] Honest-but-curious — randomized server strategies offer no advantage in this setting.&#8201;[^4] |
| **Additional assumptions** | None — no cryptographic primitive is used. Privacy is unconditional. Non-collusion of servers is **required** (a colluding pair recovers i in the basic 2-server scheme).&#8201;[^5] |
| **Correctness model** | Deterministic (perfect): R(i, r, A_1(x, Q_1(i,r)), ..., A_k(x, Q_k(i,r))) = x_i for every x, i, r. No failure probability anywhere in the paper's main constructions.&#8201;[^6] |
| **Rounds (online)** | 1 (one-round / non-interactive): user simultaneously queries all k servers and reconstructs x_i from the k replies.&#8201;[^7] |
| **Record-size regime** | Bit-database (single-bit retrieval) in §3; extended to ℓ-bit blocks (PIR_k(n, ℓ)) in §4. |

[^1]: §2.1 Definition 2.1.1 (p.969) and §2.1 (p.970): "in our schemes all servers have the same answer function (i.e., A_1 = ... = A_k), and the k query functions are very similar"; privacy requirement Pr[Q_s(i,r) = q] = Pr[Q_s(j,r) = q] for every server s.
[^2]: §5.1 (pp.979–980): "if there is only one copy of the database available then n bits must be exchanged and hence the trivial solution is optimal"; the bound holds even with interaction.
[^3]: §2.2 "Perfect Privacy" (p.970): "even a (possibly malicious) computationally-unbounded server cannot get any indication on the identity of the desired item."
[^4]: §2.2 "Deterministic Server Strategies" (p.970): randomized server strategies "do not offer any advantage over deterministic ones in our context (where the concerns are correctness and privacy of the user)."
[^5]: §3.1 (p.972): in the basic 2-server scheme each server sees a uniformly random subset S ⊆ [n] (or S ⊕ i) — collusion lets the two servers compute (S) ⊕ (S ⊕ i) = {i}, recovering i. §2.2 "Noncollusion" (p.970) discusses the assumption explicitly.
[^6]: §2.1 Correctness equation (p.970): R(i, r, A_1(x, Q_1(i,r)), ..., A_k(x, Q_k(i,r))) = x_i for **every** x, i, r — no probability.
[^7]: §2.1 Definition 2.1.1 (p.969): "one round … the user … produces k queries, one per server. The servers respond … The user reconstructs the desired bit x_i from these k replies."

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Pudlák–Rödl 1993 (3-party communication / tensor-rank: implicitly yields o(n) 2-server PIR);&#8201;[^8] Babai–Kimmel–Lokam 1995 (simultaneous-messages model — gives O(n^{H_2(1/(k+1))}) for k servers); coding-theoretic covering codes (Hamming codes, Honkala 1991). |
| **What changed** | First definition of *Private Information Retrieval* as an independent primitive; first sub-linear (and explicit) constructions: O(n^{1/3}) for k=2, O(n^{1/k}) for constant k, polylog n with O(log n) servers. Established the impossibility of single-server information-theoretic PIR. |
| **Superseded by** | k-server upper bounds: Ambainis 1997 → O(n^{1/(2k−1)}); subsequent locally-decodable-code-based schemes (Yekhanin '07, Efremenko '09, Dvir–Gopi). The **single-server impossibility** is not superseded — it stands as an unconditional barrier (only computational PIR escapes it: Kushilevitz–Ostrovsky 1997). |
| **Concurrent work** | Babai–Kimmel–Lokam 1995 (STACS) — simultaneous-messages protocols giving polylog-communication PIR for k ≥ log n.&#8201;[^9] Pudlák–Rödl 1993 (motivated by tensor rank, not PIR). |

[^8]: §1.2 (p.967): "A first indication that something better than the user asking for a copy of x can be done is given by a result of Pudlák and Rödl"; via their 3-party protocol one obtains 2-server PIR with o(n) communication, specifically O(n · log log n / log n).
[^9]: §1.2 (pp.967–968): Babai et al. give "for 2 ≤ k < log_2 n players … total communication is O(k n^{H_2(1/(k+1))})" and polylog for k ≥ log_2 n; converted to PIR with k(k−1) log_2 n extra bits.

### Core Idea

Replicate the database across k non-colluding servers; the user splits its query into k correlated random subsets whose XOR isolates index i. **Basic 2-server (§3.1):** pick a uniform random S ⊆ [n], send S to server 1 and S ⊕ {i} to server 2; each server returns the XOR of x_j over its received set; the user XORs the two reply bits and gets x_i. Communication: 2n + 2. **d-cube generalization (§3.2):** embed [n] in [ℓ]^d and use 2^d servers, each indexed by a binary string σ ∈ {0,1}^d that selects between two random subsets per axis; total comm 2^d · (d · n^{1/d} + 1). **Covering-codes (§3.3):** server emulation via a radius-1 covering code C_d ⊆ {0,1}^d reduces 2^d servers to k = |C_d| servers at the cost of an extra n^{1/d} answer per non-codeword neighbor. The net rate is k + (2^d + (d−1)k) · n^{1/d} bits, giving the celebrated **2-server O(n^{1/3})** point and **4-server O(n^{1/4})** point.&#8201;[^10]

[^10]: §3.3 Theorem 3.3.1 + Corollary 3.3.2 (pp.975–976): "two servers (i.e., k = 2), the communication complexity is 12n^{1/3} + 2 … four servers (i.e., k = 4), the communication complexity is 28n^{1/4} + 4."

### Multi-server Model

| Aspect | All k servers (symmetric) |
|--------|----------------------------|
| **Trust** | Honest-but-curious; perfect privacy holds even if a server is computationally unbounded. |
| **Data held** | Identical replica of x ∈ {0,1}^n; no encoding, no preprocessing, no per-server state.&#8201;[^11] |
| **Phase contacted** | Once per query (one-round protocol). |
| **Computation per query** | O(n) XORs (bitwise). For the covering-code scheme each server effectively XORs (d+1)·n bits to emulate the missing servers' subcubes (Remark 3.3.3).&#8201;[^12] |
| **Communication received** | Subset description: 2^d + (d−1)k subsets total across the protocol → d · n^{1/d} bits per non-codeword neighbor for §3.3; n bits per server for §3.1. |
| **Communication sent** | 1 bit per subset (a single XOR). For §3.1: 1 bit; §3.2: 1 bit; §3.3: 1 + n^{1/d} bits per server. |
| **Non-collusion assumption** | **Required.** Two colluding servers in the basic scheme reconstruct i exactly (by S ⊕ (S ⊕ {i})). Extends to t-private generalizations (§2.2 "Coalitions") tolerating collusions up to t < k.&#8201;[^13] |

[^11]: §1 (p.966): "We view the database as a binary string x = x_1 ⋯ x_n of length n. Identical copies of this string are stored by k ≥ 2 servers."
[^12]: §3.3 Remark 3.3.3 (p.976): "for each of the servers the computation time is only linear in n … (d+1) · n bits are xored during the server's computation."
[^13]: §2.2 "Coalitions" (pp.970–971): "the privacy requirement … can be generalized to coalitions of up to t < k servers by requiring that, for every s_1, ..., s_t ∈ [k], the joint distribution of (Q_{s_1}(i,r), ..., Q_{s_t}(i,r)) … is independent of i." t-private k-server schemes were given in the omitted §1.1 material.

### Variants (Constructions in the Paper)

| Variant | Section | k (servers) | Total Communication | Per-server up / down | Method |
|---|---|---|---|---|---|
| Basic 2-server | §3.1 (p.972) | 2 | 2n + 2 | n / 1 | Random subset S vs S ⊕ {i} |
| d-cube hypercube | §3.2 (pp.972–973) | 2^d | 2^d · (d · n^{1/d} + 1) | d · n^{1/d} / 1 | Embed [n] in [ℓ]^d, σ ∈ {0,1}^d-indexed servers |
| Covering-codes (radius 1) | §3.3 (pp.974–976) | |C_d| ≥ 2^d/(d+1) | k + (2^d + (d−1)k) · n^{1/d} | d · n^{1/d} / 1 + n^{1/d} | Emulate non-codeword servers via balls of radius 1 |
| **2-server (d=3 cover)** | §3.3 Cor 3.3.2 | **2** | **12 n^{1/3} + 2** | 3 n^{1/3} / 1 + n^{1/3} | C_3 = {(0,0,0), (1,1,1)} (perfect Hamming) |
| **4-server (d=4 cover)** | §3.3 Cor 3.3.2 | **4** | **28 n^{1/4} + 4** | 4 n^{1/4} / 1 + n^{1/4} | 4 codewords in {0,1}^4 (volume bound) |
| ℓ-block PIR (block transform) | §4.1 Prop 4.1.1 | inherited k | ℓ · (k bits up + k·β_k(n) down) → α_k(n) up + ℓβ_k(n) down per server | unchanged up / ℓ down | Re-use one query for ℓ rows of an m × n matrix |
| ℓ-block PIR (asymmetric transform) | §4.1 Prop 4.1.2 | inherited k | m · α_k(n) up + 1 down per server | scaled up / 1 down | Server XORs its m sub-answers |
| n ≤ ℓ block scheme | §4.2 Cor 4.2.1 | 2 | 4ℓ | 2ℓ / ℓ | Apply Prop 4.1.1 to basic 2-server |
| n ≤ ℓ²/4 block scheme | §4.2 Cor 4.2.2 | 4 | 8ℓ | 2√n / ℓ | Apply Prop 4.1.1 to d=2 hypercube |

**Asymptotic envelope (omitted from JACM version):** §1.1 (p.967) records that the FOCS 1995 paper additionally gave (i) **O(n^{1/k})** schemes for any constant k (polynomial-interpolation based); (ii) **(1/3 log n + 1)-server polylog** schemes with total communication 1/3·(1+o(1)) · log_2² n · log_2 log(2n). Both were dropped from the JACM version because Ambainis 1997 subsumed (i) and the polylog construction was based on related techniques. Also dropped: t-private c·t(n)-server constructions with O(t(n) · ⁿ√n) communication.&#8201;[^14]

[^14]: §1.1 (p.967): the original FOCS version contained "Schemes for a constant number, k, of servers with communication complexity O(n^{1/k})" and "A scheme for 1/3 log_2 n + 1 servers with total communication complexity 1/3(1 + o(1)) · log_2² n · log_2 log(2n)" — both omitted "[f]ollowing a recommendation by an anonymous referee."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | **None** — information-theoretic. Privacy = literal independence of each server's view from the queried index i.&#8201;[^15] |
| **Encryption/encoding scheme(s)** | None. The "ciphertext" of a query is a uniformly random subset of [n] (or product of subsets); the answer is a parity bit (XOR over the received set). |
| **Ring / Field** | F_2 implicitly — answers are bits; arithmetic is XOR. §4.1 (proposition after 4.1.2) generalizes the answer-aggregation to "arbitrary fixed functions … into elements of some finite Abelian group" with cardinality at most 2^{β_k(n)}, summation done over that group, but the main constructions stay over F_2.&#8201;[^16] |
| **Key structure** | No keys. Per-query randomness r ∈ {0,1}^{ℓ_rnd} of the user (uniform). |
| **Correctness condition** | Deterministic identity — index i appears in an odd number of the 2^d subcubes selected, all other indices appear in an even number; XOR cancels them.&#8201;[^17] |

[^15]: §2.1 (p.970): privacy as Pr[Q_s(i,r) = q] = Pr[Q_s(j,r) = q] taken over uniformly chosen r — distributional equality, not computational indistinguishability.
[^16]: §4.1 (p.978): "g and the f_p s are arbitrary fixed functions mapping binary strings into elements of some finite Abelian group … and g is a homomorphism."
[^17]: §3.2 (p.973): "(i_1, ..., i_d) is the only position that is contained in an odd number of subcubes. Actually position (i_1, ..., i_d) appears in a single subcube … all other positions appear in an even number of subcubes."

### Key Data Structures

- **Database x**: binary string x_1 ⋯ x_n, stored identically by all k servers, no encoding.
- **d-dimensional embedding**: identify [n] with [ℓ]^d where ℓ = n^{1/d}; index i ↦ (i_1, ..., i_d). Used in §3.2 and §3.3.
- **User's per-axis subsets**: 2d random subsets S_t^0, S_t^1 ⊆ [ℓ] (t ∈ [d]), with S_t^1 = S_t^0 ⊕ {i_t} (membership flip at coordinate i_t). One pair per dimension.
- **Server label** σ ∈ {0,1}^d (or codeword c ∈ C_d in §3.3): selects which of S_t^0 or S_t^1 to send to that server.
- **Covering code C_d** ⊆ {0,1}^d with radius 1 (every binary d-string is within Hamming distance 1 of some codeword); k = |C_d|; volume bound k ≥ 2^d / (d + 1).&#8201;[^18]

[^18]: §3.3 (p.975): "the number of codewords k satisfies k ≥ 2^d/(d+1) (this is the volume bound …). For d = 3 and d = 7, these covering codes are perfect codes (all balls are disjoint)."

### Database Encoding

- **Representation:** flat bit-string x ∈ {0,1}^n in §3.1; reshape to ℓ-cube [ℓ]^d for §3.2/§3.3 (logical only — server stores x verbatim).
- **Record addressing:** position j ∈ [n] ↔ tuple (j_1, ..., j_d) ∈ [ℓ]^d via the natural base-ℓ encoding.
- **Preprocessing required:** none; server holds raw x.
- **Block-PIR encoding (§4):** view the m-by-n matrix as m rows of n bits; each query is replayed against m rows in parallel.

### Protocol Phases (Basic 2-Server, §3.1)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Query Gen | User | Sample uniform S ⊆ [n]; compute S' = S ⊕ {i} | — | Per query |
| Query Send | User → Server 1 | Send subset S | n bits ↑ | Per query |
| Query Send | User → Server 2 | Send subset S' | n bits ↑ | Per query |
| Answer | Server s | Compute b_s = ⊕_{j ∈ Q_s} x_j | — | Per query |
| Reply | Server s → User | Send b_s | 1 bit ↓ | Per query |
| Decode | User | Output x_i = b_1 ⊕ b_2 | — | Per query |

### Protocol Phases (d-cube, §3.2; example k = 2^d servers)

1. User chooses d uniform random subsets S_1^0, ..., S_d^0 ⊆ [ℓ]; defines S_t^1 = S_t^0 ⊕ {i_t} for t ∈ [d].
2. For each server name σ = σ_1 ⋯ σ_d ∈ {0,1}^d: user sends (S_1^{σ_1}, ..., S_d^{σ_d}) — d subsets, d · n^{1/d} bits.
3. Server σ replies with ⊕_{j_1 ∈ S_1^{σ_1}, ..., j_d ∈ S_d^{σ_d}} x_{j_1, ..., j_d} — a single bit.
4. User XORs the 2^d received bits → x_i.

### Protocol Phases (Covering-Codes, §3.3)

1. User picks i = (i_1, ..., i_d) and 2d random subsets as in §3.2.
2. For each codeword c ∈ C_d: user sends the corresponding d-tuple of subsets to server SRV_c.
3. Server SRV_c replies with: (a) its own subcube XOR (1 bit) and (b) for each non-codeword c' at Hamming distance 1, the partial XOR over the modified t-th axis (n^{1/d} bits, since varying axis t means scanning over each of the ℓ = n^{1/d} possible flipped positions).
4. User reconstructs every emulated server's bit from these partial answers and XORs all 2^d bits → x_i.&#8201;[^19]

[^19]: §3.3 (p.974): "SRV_000 … can produce the query (S_1^{σ_1}, S_2^{σ_2}, S_3^1), sent to SRV_001. Specifically, it knows S_1^{σ_1} and S_2^{σ_2} and it also knows that S_3^1 is of the form S_3^0 ⊕ {j}, for some j ∈ {1, 2, ..., ³√n}. Thus, SRV_000 can emulate SRV_001 by sending the ³√n bits corresponding to the ³√n possible queries which could have been sent to SRV_001."

### Correctness Analysis (Option C — Deterministic)

Deterministic correctness — **no failure probability**. The proof technique is the cancellation argument of §3.2: in the cube scheme, only the target tuple (i_1, ..., i_d) appears in an odd number (exactly one) of the 2^d subcubes (S_1^{σ_1} × ⋯ × S_d^{σ_d}), all other positions appear in an even number, so they cancel modulo 2.&#8201;[^20] The covering-codes scheme inherits correctness from the cube scheme — it merely changes who computes which 2^d bits, not the bits themselves.

[^20]: §3.2 (p.973): "for every t ∈ [d], i_t appears in exactly one of the sets S_t^0, S_t^1. Each of the other positions … appears in an even number of subcubes."

### Privacy Analysis (Information-Theoretic)

**Single-server view** (§3.2): each subset S_t^{σ_t} is an independently uniform subset of [ℓ] (because S_t^1 = S_t^0 ⊕ {i_t} and S_t^0 itself is uniform, so S_t^1 is also uniform). A server therefore sees d independently uniform subsets, identically distributed for every i.&#8201;[^21] **Covering-codes** (§3.3): "the privacy of the original 2^d-server scheme is clearly preserved (since the queries to each SRV_c are chosen in the same way as in the 2^d-server scheme; it is only the answer function that is different)."&#8201;[^22] **Coalitions** (§2.2 / §1.1): t-private generalization requires the joint distribution of any t queries to be independent of i.

[^21]: §3.2 (p.973): "from the point of view of each server, it receives a sequence of d uniformly and independently chosen subsets of [ℓ]. Thus, the queries to each server are distributed in the same way, for each possible value of i = (i_1, ..., i_d)."
[^22]: §3.3 (p.974): privacy preservation under emulation.

### Complexity

#### Communication (asymptotic, total over all servers)

| Variant | Total comm | Per-server up | Per-server down |
|---|---|---|---|
| §3.1 (k = 2) | 2n + 2 | n | 1 |
| §3.2 (k = 2^d) | 2^d · (d · n^{1/d} + 1) | d · n^{1/d} | 1 |
| §3.3 (k ≥ 2^d/(d+1)) | k + (2^d + (d−1)k) · n^{1/d} | d · n^{1/d} | 1 + (varies) · n^{1/d} |
| §3.3 (k = 2, d = 3) | 12 n^{1/3} + 2 | 3 n^{1/3} | 1 + n^{1/3} |
| §3.3 (k = 4, d = 4) | 28 n^{1/4} + 4 | 4 n^{1/4} | 1 + n^{1/4} |
| §3.3 generic | Ω(k · log_k n^{1/(log k + log log k)}) | — | — |
| Omitted (FOCS '95): polynomial interpolation | O(n^{1/k}) for constant k | — | — |
| Omitted: O(log n) servers | 1/3(1+o(1)) · log² n · log log n | — | — |

#### Computation

- **User:** linear in communication complexity (Remark 3.3.3, p.976).
- **Server:** linear in n. For the covering-code scheme, each server XORs (d+1) · n bits across its emulated subcubes.&#8201;[^23]

[^23]: §3.3 Remark 3.3.3 (p.976): "for each of the servers the computation time is only linear in n … the server SRV_c needs to compute the exclusive-or of the bits in n^{1/d} subcubes [for each Hamming-1 neighbor] … all together (d+1) · n bits are xored."

#### Concrete numbers (Table I, p.975 — total communication in bits)

| d | 2^d | k = #codewords | Asymptotic | n = 2^20 | n = 2^30 | n = 2^40 |
|---|----|----------------|-----------|---------|----------|---------|
| 3 | 8 | 2 | 12 n^{1/3} | 1,224 | 12,300 | 123,864 |
| 4 | 16 | 4 | 28 n^{1/4} | 924 | 5,096 | 28,700 |
| 5 | 32 | 7 | 60 n^{1/5} | 1,020 | 3,900 | 15,420 |
| 6 | 64 | 12 | 124 n^{1/6} | 1,249 | 3,968 | 12,598 |
| 7 | 128 | 16 | 224 n^{1/7} | 1,792 | 4,480 | 11,872 |
| 8 | 256 | 32 | 480 n^{1/8} | 2,715 | 6,458 | 15,360 |

Reproduced verbatim from Table I — exact values from the paper.

### Lower Bounds

| Field | Detail |
|-------|--------|
| **Bound 1 — single-server impossibility** | Any one-server information-theoretic PIR with perfect privacy requires **n bits of total communication** (the trivial download).&#8201;[^24] |
| **Bound type** | Communication lower bound + impossibility of nontrivial single-server IT-PIR |
| **Variables** | n = database size; one server holding x ∈ {0,1}^n. |
| **Model assumptions** | Information-theoretic privacy (Definition 2.1.1 with k = 1); user may be interactive (multi-round). The bound holds even with interaction. |
| **Proof technique** | Counting argument (§5.1, p.980): if fewer than 2^n possible communications C exist for index i, two distinct databases x ≠ y both produce the same C; by privacy, C must be possible for *every* index j on both x and y; pick j with x_j ≠ y_j to derive contradiction (user must output both x_j and y_j on the same C). |
| **Tightness** | Trivial — trivial download achieves n. |
| **Implications** | Replication is **necessary** for sublinear IT-PIR — motivates the entire k-server line. The bound is bypassed only by switching to *computational* privacy (Kushilevitz–Ostrovsky 1997) or by adding *preprocessing* (later Group 2a/2b work). |

[^24]: §5.1 Theorem (informal, pp.979–980): "if there is only one copy of the database available then n bits must be exchanged and hence the trivial solution is optimal in this case. The lower bound holds even if the communication between the user and the database allows interaction."

| Field | Detail |
|-------|--------|
| **Bound 2 — restricted 2-server linear-summation queries** | If both servers receive a single linear-summation query (q a subset, answer ⊕_{j ∈ q} x_j) with single-bit reply, then each query must be at least **n − 1 bits long**.&#8201;[^25] |
| **Bound type** | Query-length lower bound under model restriction (linear-summation answers, 1-bit reply) |
| **Proof technique** | Claim 5.2.1 (p.980): possible queries to server 1 are closed under XOR with any unit vector e_h, so there are at least 2^{n−1} possible queries → n − 1 bits to encode. |
| **Tightness** | Matched up to ±1 by §3.1: end of §5 (p.981) notes the §3.1 upper bound can be improved to n − 1 bits per server (using even-cardinality subsets for server 1, odd for server 2). |
| **Why restricted** | The bound only rules out *single linear-summation query, single-bit answer* schemes — the §3.2/§3.3 schemes evade it by using multiple subsets per server and by allowing >1-bit answers (§3.3). |

[^25]: §5.2 Claim 5.2.1 (p.980): "Suppose that q is possible for (i, 1). Then each query at even (respectively, odd) Hamming distance from q is possible for (i, 1) (respectively, (i, 2)) … the set of possible queries for each server has cardinality at least 2^{n−1}, requiring a query description length of at least n − 1 bits."

| Field | Detail |
|-------|--------|
| **Bound 3 — trivial floor** | log n + 1 bits is required for any number of servers (the user must at minimum communicate i and receive x_i).&#8201;[^26] |

[^26]: §5 (p.979): "The only obvious lower bound is log n bits which holds for any number of servers (this follows from communication complexity considerations and not using any privacy argument)."

**Open problems (stated in §5):** "The question of proving lower bounds on private information retrieval schemes remains one of the most intriguing open problems of this paper." The k = 2 information-theoretic PIR communication bound between Ω(log n) and O(n^{1/3}) is left open; was eventually narrowed by later work but remains unresolved at the time of writing.

### Generic Communication-Balancing Transformation (§3.4 + §4.1)

The basic and cube schemes are *unbalanced* — long queries up, single-bit answers down. Two transformations:

- **Block expansion (Prop 4.1.1, p.977):** if PIR_k(n, 1) sends α_k(n) bits up and receives β_k(n) bits down, then PIR_k(n, ℓ) sends α_k(n) bits up and receives ℓ · β_k(n) bits down. Re-uses the same query against m = ℓ rows of an m × n matrix.
- **Asymmetric server-aggregation (Prop 4.1.2, p.977):** under the additional hypothesis that the user reconstructs by ⊕_{p=1}^k τ_p (mod 2), PIR_k(m·(n−1), 1) is solvable with m · α_k(n) bits up and **1 bit down** — server pre-XORs its m sub-answers. Both basic (§3.1) and cube (§3.2) schemes satisfy the hypothesis.&#8201;[^27]
- **§4.2 corollaries:** for short databases (n ≤ ℓ block size) the 2-server overhead is just 4× (Cor 4.2.1); for n ≤ ℓ²/4 the 4-server overhead is 8× (Cor 4.2.2). This made the §3.1 / §3.2 schemes "applicable to records of sizes 2^15 and 2^20 for databases containing 2^30 and 2^40 bits, respectively" — i.e., reasonable for moderately-sized records.&#8201;[^28]

[^27]: §4.1 Proposition 4.1.2 (p.977): one-bit answer from each server when the user's reconstruction is a XOR of server replies; "the schemes presented in Sections 3.1–3.2 (but not those derived in Sections 3.3–3.4) meet the hypothesis of the proposition."
[^28]: §4.2 (p.979): record-size regimes for §3.1 (2-server) and §3.2 (4-server with d=2) at databases of 2^30 and 2^40 bits.

### Subsequent Work Acknowledged (§1.3)

- **Ambainis 1997**: recursively builds (k+1)-server schemes from k-server, achieving O(n^{1/(2k−1)}).
- **Ostrovsky–Shoup 1997**: private information *storage* (read + write), uses Oblivious RAM, multi-round, encoded data per server.
- **Chor–Gilboa 1997**: relaxes to *computational* privacy, gets 2-server O(n^ε) under OWF.
- **Kushilevitz–Ostrovsky 1997**: **single-server computational** PIR under Quadratic Residuosity, communication O(n^ε) — the first scheme to evade the §5.1 lower bound by relaxing privacy to computational.
- **Gertner–Ishai–Kushilevitz–Malkin 1998**: SPIR (database privacy) — log overhead on top of any IT-PIR.

These citations situate the paper as the **anchor** for both the IT-PIR and the cPIR research lines.

### Cryptographic / Coding-Theoretic Building Blocks (Glossary)

| Primitive / Tool | Section | Role |
|---|---|---|
| Random subset of [n] (uniformly chosen) | §3.1 | Single-server query in the basic scheme; uniform distribution gives privacy. |
| Subset-flip operator S ⊕ a | §3 notation, p.972 | XOR a single element into/out of a subset; isolates the queried index. |
| Hypercube embedding [n] = [ℓ]^d | §3.2 | Reduces query length to d · n^{1/d} per server at the cost of 2^d servers. |
| Covering code C_d ⊆ {0,1}^d, radius 1 | §3.3 | Server-count reduction via emulation; |C_d| ≥ 2^d/(d+1) (volume bound). |
| Hamming code (perfect, d=3, d=7) | §3.3 (p.975) | Provides minimum-size covering codes for those dimensions. |
| Linear-summation queries | §3 intro (p.971), §5.2 | Query = subset, answer = XOR; the canonical query type for §3 schemes. |

### Key Tradeoffs & Limitations

- **Sublinearity requires replication.** The single-server case is impossible (§5.1) — the entire research line of IT-PIR exists because k ≥ 2 unlocks o(n) communication.
- **Non-collusion is fragile.** Two colluding servers in the §3.1 scheme recover i exactly. Coalition-resistant variants (omitted from JACM version) need t-private constructions and pay extra communication.
- **Sub-polynomial savings only with many servers.** O(n^{1/k}) for constant k; polylog n requires Θ(log n) servers. There is no constant-server polylog scheme in this paper (and none was known until much later — and only in coded forms via locally-decodable codes).
- **No preprocessing, no client storage.** Each query restarts from scratch — every query costs Θ(n) server work even when k servers are used. The Group 2a/2b "preprocessing" approach is explicitly absent here.
- **Asymptotic constants are large.** Table I shows that even at n = 2^40, the 4-server scheme uses 28,700 bits; the 8-server scheme drops to 15,360 — practical breakeven against trivial download (n bits) needs n much larger than 12³ = 1728 to give the 2-server scheme any advantage over downloading.
- **Computation is Θ(n) per server.** Like Group 2a single-server IT-friendly PIR, the server is memory-bandwidth-bound; communication shrinks but XOR work over the full DB does not.

### Comparison with Closest Prior / Concurrent Work

| Approach | Servers k | Total comm | Privacy | Model |
|---|---|---|---|---|
| Trivial download | 1 | n | perfect | — |
| Pudlák–Rödl '93 (via 3-party) | 2 | O(n · log log n / log n) | perfect | derived |
| Babai–Kimmel–Lokam '95 | 2 | O(n^{H_2(1/3)}) ≈ O(n^{0.92}) | perfect | simultaneous-msgs |
| Babai–Kimmel–Lokam '95 (k = log n) | log n | polylog n | perfect | simultaneous-msgs |
| **CGKS '95 §3.1** | **2** | **2n + 2** | perfect | linear-summation |
| **CGKS '95 §3.2 (d=2)** | **4** | **4(2 √n + 1) ≈ 8√n** | perfect | linear-summation |
| **CGKS '95 §3.3 (d=3)** | **2** | **12 n^{1/3} + 2** | perfect | linear-summation + covering codes |
| **CGKS '95 §3.3 (d=4)** | **4** | **28 n^{1/4} + 4** | perfect | linear-summation + covering codes |
| **CGKS '95 (FOCS, omitted)** | constant k | O(n^{1/k}) | perfect | polynomial interpolation |
| **CGKS '95 (FOCS, omitted)** | 1/3 log n | (1+o(1))/3 · log²n · log log n | perfect | polynomial interpolation |

**Key takeaway:** CGKS established the *vocabulary* (k-server PIR, linear-summation, covering-code emulation), the *first nontrivial upper bounds* (O(n^{1/k}) and O(n^{1/3}) for k=2), and the *single-server impossibility* — anchoring the entire IT-PIR taxonomy and motivating the move to computational PIR (Kushilevitz–Ostrovsky '97) when sub-replication communication is required.

### Portable Optimizations

- **Subset-XOR query format with random offset:** the trick S vs S ⊕ {i} reappears in DPF-based schemes (where the DPF replaces the long subset description) and in Group 2b PRF-based hint schemes (Piano, RMS24, CK20) where pseudorandom subsets are sent compressed.
- **Hypercube embedding of [n] into [ℓ]^d:** the d-cube structure underpins recursive reductions still used in Spiral, OnionPIR, and Respire (modulo cryptographic encryption replacing the subset-XOR randomness).
- **Covering-code server emulation:** a generic server-count reduction technique; reused in subsequent IT-PIR / multi-server DEPIR papers when balancing replication factor against per-query work.
- **Block expansion (§4.1):** the recipe for amortizing one query over ℓ-bit records — directly inherited by every modern Group 1a PIR (selection-vector schemes amortize query expansion across packed plaintext slots).

### Open Problems (per §5 and §1.3)

- **Tight communication lower bound for k-server IT-PIR.** Only log n is unconditional; even k = 2 has a gap between Ω(log n) and O(n^{1/3}).
- **Coalition resistance.** Constructions tolerating t < k colluding servers with O(t(n) · ⁿ√n) communication appeared in the omitted §1.1 material; tightness was open.
- **Removing the linear-summation restriction in §5.2.** The n − 1 bound only applies to one-shot linear-summation queries with single-bit answers; bounds for general queries were left open.

### Uncertainties

- The omitted §1.1 schemes (constant-k O(n^{1/k}); log-n-server polylog) are described only by their parameters in the JACM version — full constructions live in the FOCS 1995 proceedings or in the original tech report (CGKS 1995). Treat the "subsumed by Ambainis 1997" annotation as the canonical reference for the constant-k scheme.
- The covering-code volume bound k ≥ 2^d/(d+1) is tight for d ∈ {3, 7} (Hamming codes); for other d, Table I uses best-known covering numbers from Honkala 1991. Better covering codes (if discovered) would automatically improve the constants in Theorem 3.3.1 — but the asymptotic O(n^{1/d}) form does not change.
- "Communication" throughout the paper is in **bits** (not bytes); Table I row values are exact bit counts.

### Related Papers in Collection

- **`research/multiserver/symmetric.IT/henzinger_ragavan_2026/`** — modern IT-PIR (likely improving k-server constants or restricting to a specific code family).
- **`research/multiserver/symmetric.dpf/bgi_2015/`** (BGI 2015 DPFs) — modern compression of the §3.1 subset-XOR query into a logarithmic key, applied to k = 2 servers.
- **`research/multiserver/symmetric.depir/`** — DEPIR papers that introduce server preprocessing on top of the k-server IT-PIR baseline.
- **`research/multiserver/asymmetric.role/ck_2020/`** (CK20) — single-server preprocessing PIR that descends from the k-server line via *replacing* one of the two servers with offline preprocessing of the same DB. CK20 explicitly cites the §5.1 single-server impossibility as the barrier they overcome via computational privacy.
- **Single-server line (main repo, Groups 1a/1b/2a/2b):** all single-server schemes in the main repo are *computational* and rely on FHE / LWE / OWF — the §5.1 impossibility is the "why" for that entire literature.
