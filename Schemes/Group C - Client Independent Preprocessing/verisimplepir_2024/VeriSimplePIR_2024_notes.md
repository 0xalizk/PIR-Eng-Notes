## VeriSimplePIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [VeriSimplePIR: Verifiability in SimplePIR at No Online Cost for Honest Servers](https://eprint.iacr.org/2024/341) (2024) |
| **Archetype** | Construction + Security upgrade + Building-block (VLHE) |
| **PIR Category** | Group C — Client-Independent Preprocessing |
| **Security model** | Malicious single-server verifiable PIR (stateful) |
| **Additional assumptions** | SIS (Short Integer Solution), LWE, Random Oracle Model (Fiat-Shamir heuristic) |
| **Correctness model** | Statistical (correctness error delta from LWE noise; verification soundness 1 - 2^{-λ}) |
| **Rounds (online)** | 1 (non-interactive; query + answer + verify) |
| **Record-size regime** | Flexible (benchmarks use 1-bit entries; scales with database size in GiB) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | SimplePIR (Henzinger et al., USENIX Security 2023, Group C); Extractable SIS commitments (Baum et al., CRYPTO 2018) |
| **What changed** | SimplePIR is semi-honest only — a malicious server can equivocate on the database between queries, perform selective-failure attacks, or alter entries to learn client queries. VeriSimplePIR adds verifiability via SIS-based commitments and a novel VLHE primitive, ensuring all responses are consistent with a fixed, committed database. The key innovation is a *reusable* preprocessed proof: a single offline proof enables verification of arbitrarily many online queries with essentially no online overhead for honest servers.[^1] |
| **Superseded by** | None identified at time of writing |
| **Concurrent work** | APIR / APIR+ (Colombo et al., USENIX Security 2023) — authenticated PIR with weaker security (assumes honest digest); Dietz and Tessaro (ePrint 2023/1804) — DDH-based APIR variant without honest digest assumption, but no implementation[^2] |

[^1]: Abstract (p. 1): "VeriSimplePIR is a stateful verifiable PIR scheme guaranteeing that all queries are consistent with a fixed, well-formed database."
[^2]: Section 8, Related Work (p. 13): Dietz and Tessaro "construct a DDH-based variant of APIR without the need for an honest digest assumption. However, there is no public implementation or concrete performance analysis."

### Core Idea

VeriSimplePIR's central contribution is adding *verifiability* to SimplePIR — the ability for a client to confirm that server responses are consistent with a fixed, committed database — at essentially zero online cost for honest servers. The scheme introduces two key mechanisms: (1) a *Verifiable Linearly Homomorphic Encryption* (VLHE) primitive that pairs Regev LWE encryption with SIS-based extractable commitments, enabling the server to prove that its homomorphic evaluation was performed correctly; and (2) a *reusable preprocessed proof* protocol where a one-time offline phase produces a single proof (pi) that can verify an arbitrary number of subsequent query-response pairs.[^3] The verification leverages the observation that the proof Z = CD is a linear function of D, so the server can compute D^T C^T = Z^T homomorphically using the VLHE construction without knowing the client's secret challenge C.[^4] Only the *exactly correct* ciphertext passes verification with probability better than 2^{-λ}, giving the strictest possible soundness guarantee.[^5] The online communication overhead is 1.1-1.5x SimplePIR and online computation on the server is essentially the same, because verification costs are pushed entirely into the preprocessing phase.[^6]

[^3]: Section 1.2, Our Contributions (p. 2): "We construct and implement VeriSimplePIR, the first efficient, verifiable PIR scheme achieving industrial-strength security without compromising state-of-the-art performance."
[^4]: Section 4.2 (p. 9): "The second observation is that the proof Z = CD is, in fact, computed as a linear function evaluation defined by D. That is, we can use construction 4.1 on the matrix D^T where the ciphertexts encrypt the rows of the challenge C."
[^5]: Section 1.2 (p. 2): "only responses that are exactly correct will pass verification with a probability greater than 2^{-λ}."
[^6]: Abstract (p. 1): "The online communication overhead is roughly 1.1-1.5x SimplePIR, and the online computation time on the server is essentially the same."

### Novel Primitives / Abstractions

#### VLHE (Verifiable Linearly Homomorphic Encryption)

| Field | Detail |
|-------|--------|
| **Name** | VLHE (Verifiable Linearly Homomorphic Encryption) |
| **Type** | Cryptographic primitive / encryption scheme with verifiable evaluation |
| **Interface / Operations** | **Setup**(1^n, 1^m, q) -> pp (A in Z_q^{m x n}); **Commit**(A, D) -> (H, Z) where H = DA, Z = CD; **VerCom**(A, H, Z) -> Accept/Reject; **Encrypt**(A, mu) -> (u, s); **Eval**(D, u) -> v = Du; **Decrypt**(H, s, v) -> v' = floor((v - H*s) / Delta); **Prove**(A, H, u, v, D) -> Z via Fiat-Shamir; **Verify**(A, H, u, v, Z) -> Accept/Reject[^7] |
| **Security definition** | Semantic security from LWE (ciphertexts indistinguishable from random). Verification uniqueness: under SIS hardness, only the correct ciphertext v = Du passes verification (Lemma 4.1). A computationally bounded server cannot produce any v-tilde != Du with a valid proof Z-tilde.[^8] |
| **Correctness definition** | Decryption correctness holds when Delta/2 > \|\|De\|\|_inf (noise bound). The extractability of SIS commitments guarantees the evaluated function D satisfies \|\|D\|\|_inf <= 2*ell*p, slightly larger than the honest bound \|\|D\|\|_inf <= p. The ciphertext modulus must satisfy q >= 2*sigma*m*ell*p^2 * sqrt(2*ell * ln(2/delta)) (eq. 6, p. 9).[^9] |
| **Purpose** | Enable verifiable homomorphic evaluation: the server proves it applied the committed linear function D to the client's ciphertext correctly, without learning the plaintext. This is the core building block that makes VeriSimplePIR possible. |
| **Built from** | Regev LWE encryption [Reg09] + Extractable SIS commitments [BBC+18] + Fiat-Shamir transform [FS87] for non-interactivity. The commitment H = DA is simultaneously an LWE public key component and an SIS commitment to D.[^10] |
| **Standalone complexity** | Commit: O(ell * m * n) multiplications in Z_q. Prove: one hash (Fiat-Shamir) + matrix multiplication Z = CD in Z^{λ x m}. Verify: one hash + check \|\|Z\|\|_inf <= ell * p + check Z * [A; u] = C * [H; v]. Batch verification of tau ciphertext pairs costs only one additional hash over all tau tuples (eq. 5, p. 8).[^11] |
| **Relationship to prior primitives** | Extends Regev LWE encryption with a verification layer. The SIS commitment structure D * [A; u] = [H; v] (eq. 3) is the key algebraic identity that ties encryption to commitment. Differs from APIR's MAC-based approach — VLHE uses proof-of-knowledge rather than plaintext MACs, achieving stronger security with less overhead.[^12] |

[^7]: Construction 4.1 (p. 7): Full VLHE API definition with eight algorithms.
[^8]: Lemma 4.1, Verification Uniqueness (p. 8): "Assuming the hardness of SIS_{n,m,q,beta} for beta = 4*ell*p, v-tilde = Du must hold."
[^9]: Section 4.1.1, Correctness (p. 8) and eq. (6) (p. 9): correctness requirement for the preprocessing variant with enlarged plaintext space Z_{p*ell}.
[^10]: Section 4 (p. 7): "the basic equation that we will use throughout this section is D [A u] = [H v], which also has the form of an extractable SIS commitment described in section 2.2."
[^11]: Section 4.1.2 (p. 8-9): "the only piece of the BatchProve and BatchVerify algorithms that grow with tau is the computation of the hash function Hash on the tau tuples and, of course, the matrix multiplication itself."
[^12]: Section 1.1 (p. 2): APIR "introduces significant overhead since each plaintext bit is mapped to roughly λ (security parameter) bits in the encoding."

#### Reusable VLHE Proof Protocol

| Field | Detail |
|-------|--------|
| **Name** | Reusable VLHE Proof (Preprocessed Verification) |
| **Type** | Protocol optimization / proof-reuse mechanism |
| **Interface / Operations** | Full protocol in Figure 6 (p. 10): Server commits to D and D^T via two VLHE instances (H_1, H_2). Client samples challenge C, encrypts rows of C under A_2, sends ciphertexts U. Server computes V = D^T * U and BatchProve. Client verifies, stores proof pi = (C, Z). Online: client runs PreVerify(u, v, C, Z) to check Zu = Cv.[^13] |
| **Purpose** | Avoid recomputing a fresh proof Z for every query. A single preprocessed proof can verify arbitrarily many subsequent queries as long as no verification failure occurs. |
| **Built from** | Two VLHE instances (Construction 4.1): one for the database function D (online evaluation), one for D^T (proof preprocessing). |
| **Standalone complexity** | Preprocessing: λ encryptions under A_2 + server computes D^T * U (dominant cost). Online verification: one check Zu = Cv, which is a simple inner product — essentially free.[^14] |

[^13]: Figure 6 (p. 10): Full protocol diagram for computing reusable VLHE proofs.
[^14]: Section 4.2 (p. 9): "We present a useful protocol to compute a reusable VLHE proof. When a fixed linear function is applied to many encrypted vectors, this reusable proof averts repeatedly computing and sending a fresh Z for every response ciphertext."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumptions** | (1) LWE: decisional Learning with Errors — (n, q, chi)-LWE for both the PIR encryption and the semantic security of the VLHE scheme. (2) SIS: Short Integer Solution — SIS_{n,m,q,beta} for binding of the database commitment and verification uniqueness.[^15] |
| **Encryption scheme** | Regev LWE ("hoisted" variant from SimplePIR/Henzinger et al.): ciphertext (A, As + Delta*mu + e) where Delta = floor(q/p), secret s in Z_q^n, error e from chi^m. The matrix A is reused across ciphertexts; secret s is sampled independently per ciphertext.[^16] |
| **Commitment scheme** | Extractable SIS-based commitments (Figure 1, p. 3): Prover commits to D via H = DA. Verifier sends random binary challenge C in {0,1}^{λ x ell}. Prover responds with Z = CD. Verifier checks \|\|Z\|\|_inf <= B and ZA = CH. Extractability (Lemma 2.2): an efficient extractor can recover D from any prover succeeding with probability > 2^{-λ+2}.[^17] |
| **Ring / Field** | Z_q (integers mod q) — no ring structure. All operations are matrix/vector arithmetic over Z_q. Benchmarks use log(q) = 32 (SimplePIR parameters) or log(q) = 64 (VeriSimplePIR optimal).[^18] |
| **Random oracle** | Hash function modeled as random oracle for the Fiat-Shamir transform, making the interactive SIS commitment protocol non-interactive. C = Hash(A, H) in the commitment phase; C = Hash(A, H, u, v) in the evaluation phase.[^19] |
| **Correctness condition** | LWE decryption requires Delta/2 > \|\|De\|\|_inf. For the preprocessing variant, q >= 2*sigma*m*ell*p^2 * sqrt(2*ell * ln(2/delta)) (eq. 6). For the online phase, q >= p * sigma * \|\|D\|\|_inf * sqrt(2m * ln(2/delta)) (eq. 2). The honest digest assumption relaxes this to \|\|D\|\|_inf <= p (vs. extractability bound of 2*ell*p).[^20] |

[^15]: Section 2.1 (p. 3): SIS definition. Section 2.3 (p. 4): LWE definition. Construction 5.1 (p. 10): "assume the hardness of SIS_{n,m,q,beta_1} for beta_1 = 4*ell*p and SIS_{n,ell,q,beta_2} for beta_2 = 4mp."
[^16]: Section 2.3, Linearly Homomorphic Encryption (p. 4): "The plaintext space of the LHE scheme is vectors over Z_p... A ciphertext encrypts a vector mu in Z_p^m."
[^17]: Figure 1 and Lemma 2.2 (p. 3): Extractability from [BBC+18, Lemma 3].
[^18]: Section 6, Experimental Setup (p. 11): "All SimplePIR benchmarks throughout this work use log(q) = 32, log(n) = 10, and log(p) chosen to minimize online communication."
[^19]: Section 2.2, Fiat-Shamir Transform (p. 4): "the prover generates the challenge C <- Hash(A, H) and then computes the response Z <- CD."
[^20]: Section 6, item 3, Optional Assumption of Honest Digest (p. 11): honest bound ||D||_inf <= p vs extractability bound ||D||_inf <= 2*ell*p.

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Setup | Both | pp <- Setup(1^λ, 1^N, t): generate uniform random A_1 in Z_q^{m x n} and A_2 in Z_q^{ell x n}. Both parties obtain A_1, A_2. | Public parameters (A matrices) | Once globally |
| Digest (Commitment) | Server -> Client | Server commits to database D: computes H_1 = D*A_1 (commitment to D), H_2 = D^T*A_2 (commitment to D^T), and corresponding proofs Z_1, Z_2. Client runs DigVer to verify both commitments.[^21] | d = (H_1, Z_1, H_2, Z_2) sent to client. Size dominated by H_1 (ell x n matrix over Z_q). | Once per client (or on DB change) |
| Proof Preprocessing | Client + Server | Client samples C in {0,1}^{λ x ell}, encrypts rows of C as λ ciphertexts under A_2. Server computes V = D^T * U, runs BatchProve. Client runs BatchVerify, checks Z * A_1 = C * H_1. If all pass, stores proof pi = (C, Z).[^22] | Client -> Server: U (λ ciphertexts). Server -> Client: V, Z_pi. | Once per client (reusable for all future queries) |
| Query | Client | Same as SimplePIR: write index i as (i_r, i_c) in [ell] x [m]. Encrypt u = A_1*s + e + floor(q/p) * b_{i_c}. Output (q, st) = ((u, (s, i))). | q (one LWE ciphertext, m elements of Z_q) upward | Per query |
| Answer | Server | Same as SimplePIR: v <- D*u. | a = v (ell elements of Z_q) downward | Per query |
| Verify | Client | Run PreVerify(u, v, C, Z): check that Z*u = C*v. If Accept, proceed to decrypt. If Reject, set pi <- bottom and rerun Proof Preprocessing.[^23] | -- (local computation) | Per query |
| Recover | Client | Same as SimplePIR: decrypt v using H_1 and s, extract r = v[i_r]. | -- (local computation) | Per query |

[^21]: Construction 5.1, Digest (p. 10): "Compute H_1, Z_1 <- VLHE.Commit(A_1, D) and H_2, Z_2 <- VLHE.Commit(A_2, D^T). Output d <- (H_1, Z_1, H_2, Z_2)."
[^22]: Construction 5.1, PrQry and PrRec (p. 10-11): Client encrypts challenge, server responds with homomorphic evaluation and batch proof.
[^23]: Construction 5.1, Verify (p. 11): "Output the result of VLHE.PreVerify(A_1, H_1, u, v, C, Z)." Figure 3 (p. 6): "If Verify outputs Reject, set pi <- bottom and rerun PrQry."

### Formal Security Properties

| Property | Definition | Mechanism | Proved Where |
|----------|-----------|-----------|--------------|
| **Verification Completeness** | Honest server's responses always pass both preprocessing and online verification (Pr = 1). | Follows from VLHE correctness: ||Z||_inf bound is never exceeded for honest D with ||D||_inf <= p. ZA = CH holds by construction.[^24] | Definition A.1 (p. 16), Lemma C.1 (p. 18) |
| **Digest Binding** | Computationally infeasible for server to produce two distinct databases D != D' with the same digest. Also infeasible to produce a proof a_pi passing PrRec for a fake digest. | SIS hardness: if D != D' but DA = D'A, then (D - D')A = 0 is a short SIS solution, contradicting hardness assumption (Lemma 2.3, p. 4).[^25] | Definition A.2 (p. 17), Lemma C.2 (p. 18) |
| **Verification Soundness** | If Verify accepts answer a for query q, then a = Answer(D, q) with probability >= 1 - 2^{-λ}. Only the exactly correct ciphertext passes. | VLHE verification uniqueness (Lemma 4.1): under SIS, v-tilde = Du is the only response passing Verify. The challenge C is secret from the server; guessing C*x = 0 for x != 0 has probability <= 2^{-λ} (Lemma 2.4).[^26] | Definition A.3 (p. 17), Lemma C.3 (p. 18) |
| **Query Hiding (Malicious Server)** | Malicious server learns nothing about client's query index, even across multiple queries, as long as proof pi != bottom. | Follows from LWE semantic security of the Regev encryption + perfect completeness of PreVerify (no leakage from verification when honest). Simulation-based proof shows REAL and IDEAL distributions are indistinguishable.[^27] | Definition A.4 (p. 17), Lemma C.4 (p. 18) |
| **Extractability** | From any computationally bounded prover that passes the commitment protocol, an efficient extractor can recover the committed database D. | SIS extractability (Lemma 2.2): extractor makes O(ell * log(ell) / epsilon) calls to prover, recovers D with ||D||_inf <= 2B. This is critical: no need to trust the digest is "honest" — any digest, even one produced by a malicious server, is sufficient for security.[^28] | Lemma 2.2 (p. 3), Lemma 2.3 (p. 4) |

[^24]: Lemma C.1 (p. 18): "the bound on Z will never be exceeded as long as the database D is within the honest bound ||D||_inf <= p."
[^25]: Lemma C.2 (p. 18): "This follows directly from the SIS hardness assumptions given in construction 5.1."
[^26]: Lemma 2.4 (p. 4): "Pr[C * x = 0] <= 2^{-λ}" for any nonzero x, when C is sampled from {0,1}^{λ x ell}.
[^27]: Lemma C.4 (p. 18): "This follows from lemma B.3 along with the correctness of the VLHE parameters."
[^28]: Section 1.2 (p. 2): "any digest, even one produced by a malicious server, is sufficient to commit to some database."

### Correctness Analysis

#### Option D: Inherited from SimplePIR

The base PIR operations (Query, Answer, Recover) are identical to SimplePIR. Correctness of the PIR retrieval itself depends on the LWE noise bound: decryption succeeds when Delta/2 > ||D*e||_inf, where e is the encryption error vector. The probability of decryption failure is bounded by delta = 2*exp(-pi * (Delta / (s * sqrt(m) * ||D||_inf))^2) (p. 5, eq. 2). VeriSimplePIR inherits this analysis directly.[^29]

#### Option F: Verification Soundness

The verification adds a second correctness dimension: can a malicious server fool the client into accepting an incorrect answer?

- **Soundness probability:** >= 1 - 2^{-λ}. The only value a that will pass Verify(pp, d, q, a, pi) is a = Answer(D, q) for the committed database D.[^30]
- **Strictness:** This is *uniqueness* soundness — not just that the answer decrypts correctly, but that it is the *unique* ciphertext consistent with the committed function D and the query q. Even a single bit change in the response ciphertext will cause verification to reject.
- **Proof reusability:** The preprocessed proof pi can be safely reused for arbitrarily many queries as long as no verification failure occurs. If a failure occurs, the client must discard C and Z and rerun the preprocessing phase, because a verification failure may leak information about C.[^31]
- **Honest digest optimization:** If the digest is assumed honest (||D||_inf <= p rather than the extractability bound 2*ell*p), the ciphertext modulus constraint relaxes from eq. (6) to eq. (2), allowing a smaller q and better performance.[^32]

[^29]: Section 2.3, LHE Correctness (p. 4-5): Decryption correctness analysis inherited directly by VeriSimplePIR's online phase.
[^30]: Definition A.3 (p. 17): "Verify(pp, d, pi, q, a) = Accept implies a = Answer(D, q)" with probability >= 1 - 2^{-λ}.
[^31]: Section 4.2, Security (p. 9): "when verification fails, leakage on C may occur. Then, the client must discard C and the corresponding Z and rerun the proof preprocessing phase."
[^32]: Section 6, item 3 (p. 11): "the VLHE correctness must account for a database D that is as large as the extractability bound of ||D||_inf <= 2*ell*p, which is larger than the honest database bound of ||D||_inf <= p."

### Complexity

#### Core Metrics

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|----------|-------|
| Online query size | O(m * log(q)) = O(sqrt(N) * log(q)) | Same as SimplePIR | Online |
| Online answer size | O(ell * log(q)) = O(sqrt(N) * log(q)) | 1.1-1.5x SimplePIR[^34] | Online |
| Online server computation | O(N) (matrix-vector multiply D*u) | Essentially identical to SimplePIR | Online |
| Online client computation | O(sqrt(N)) for Query + O(sqrt(N)) for Verify (PreVerify is Zu = Cv check) + O(sqrt(N)) for Recover | 12-40% overhead vs SimplePIR (Verify step)[^33] | Online |
| Offline communication (digest) | O(ell * n * log(q)) for H_1 + O(λ * m * log(q)) for Z matrices | Dominated by H_1; ~95% of total offline storage. ~2-14 GiB for 4-256 GiB databases (Figure 8) | Offline (once) |
| Offline server computation (preprocessing) | O(N * λ) (D^T * U, λ encryptions evaluated) | ~100s for 4 GiB DB, ~200s for 8 GiB DB (single core, dishonest digest)[^35] | Offline (once per client) |
| Offline client computation (preprocessing) | O(λ * n) (λ LWE encryptions) | Small relative to server | Offline (once per client) |
| Client persistent storage | O(ell * n * log(q) + λ * ell + λ * m) for (H_1, C, Z) | ~800 MiB for password-leak application (400M entries)[^36] | Throughout |

[^33]: Section 6 (p. 12): "VeriSimplePIR without the honest digest assumption has a 12% to 40% slowdown in the compute time and a 40% to 50% increase in the total communication."
[^34]: Section 6 (p. 12): "When the honest assumption is introduced, the communication overhead of VeriSimplePIR drops to 13% to 20%."
[^35]: Section 6 (p. 12): "the offline computation with a dishonest digest is roughly 100 seconds for a 4 GB database and roughly 200 seconds for an 8 GB database."
[^36]: Section 7, Password Leak Detection (p. 13): "The only overhead from VeriSimplePIR is the roughly 800 MB of data that each client must locally store throughout the online phase."

#### Verification-Specific Metrics

| Metric | Detail |
|--------|--------|
| Online verification cost | PreVerify: check Z*u = C*v — one matrix-vector multiply in Z^{λ x m} times Z_q^m. Essentially free relative to the PIR computation. |
| Proof size (pi) | C in {0,1}^{λ x ell} + Z in Z^{λ x m}. Stored client-side, not communicated online. |
| Verification failure recovery | Requires full rerun of Proof Preprocessing phase (new C, new encryptions, new server evaluation). |
| Batch verification | tau ciphertext pairs can be batch-verified with a single hash + one matrix multiplication (eq. 5, p. 8). Cost grows linearly with tau. |

### Performance Benchmarks

#### Experimental Setup

Hardware: Single thread of Intel i7 at 2.5 GHz, 32 GB RAM. Ubuntu 20. C/C++ compiled with clang++ v10, -O3. All SimplePIR benchmarks use log(q) = 32, log(n) = 10. VeriSimplePIR uses log(q) = 64 (optimal for 64-bit machine). Database entries are 1-bit (entry size has essentially no effect on parameters due to tight packing).[^37]

[^37]: Section 6, Experimental Setup (p. 11): "All computational benchmarks presented here were run on a single thread of a machine running Ubuntu 20 with an Intel i7 chip operating at 2.5 GHz with 32 GB of RAM."

#### Online Phase (Figure 7, p. 13)

**Online Computation Time (seconds, per query):**

| Database Size | SimplePIR | SimplePIR (64-bit) | VeriSimplePIR (honest digest) | VeriSimplePIR |
|--------------|-----------|-------------------|------------------------------|---------------|
| 4 GiB | ~0.5 | ~0.5 | ~0.5 | ~0.55 |
| 8 GiB | ~1.0 | ~1.0 | ~0.9 | ~1.1 |
| 16 GiB | ~2.0 | ~2.0 | ~1.8 | ~2.5 |

Key observation: VeriSimplePIR with honest digest *outperforms* standard SimplePIR on computation, because the larger q = 2^64 lets it pack more database bits per machine word, improving throughput on a 64-bit machine.[^38]

**Online Communication (MiB, per query, upload + download equal):**

| Database Size | SimplePIR | SimplePIR (64-bit) | VeriSimplePIR (honest digest) | VeriSimplePIR |
|--------------|-----------|-------------------|------------------------------|---------------|
| 4 GiB | ~0.5 | ~1.0 | ~0.6 | ~0.7 |
| 16 GiB | ~1.0 | ~2.0 | ~1.1 | ~1.4 |
| 64 GiB | ~2.0 | ~4.0 | ~2.3 | ~2.8 |
| 256 GiB | ~4.0 | ~6.0 | ~4.5 | ~5.5 |

[^38]: Section 6 (p. 12): "the VeriSimplePIR protocol is able to pack more database bits into each machine word, which results in an improved throughput on a 64-bit machine."

#### Offline Phase (Figure 8, p. 13)

**Offline Communication (GiB, one-time per client):**

| Database Size | SimplePIR | VeriSimplePIR (honest digest) | VeriSimplePIR |
|--------------|-----------|------------------------------|---------------|
| 4 GiB | ~2 | ~3 | ~4 |
| 8 GiB | ~4 | ~5 | ~7 |
| 64 GiB | ~8 | ~10 | ~14 |
| 256 GiB | ~12 | ~14 | ~14 |

The VeriSimplePIR bars split into persistent storage (>95% is H_1, plus C and Z) and ephemeral communication (>95% is H_2, discarded after preprocessing).[^39]

[^39]: Section 6 (p. 12): "This data is dominated (> 95%) by the size of the digest H_1... the top of the bar represents the data that is not stored once the proof preprocessing phase is finished. Again, this data is almost entirely (> 95%) the matrix H_2."

#### Overhead vs SimplePIR (Base Scheme)

| Metric | Overhead (without honest digest) | Overhead (with honest digest) |
|--------|--------------------------------|------------------------------|
| Online computation | 12-40% slowdown | Faster (due to 64-bit q optimization) |
| Online communication | 40-50% increase | 13-20% increase |
| Offline communication | ~2x SimplePIR | ~1.5x SimplePIR |
| Offline computation (server) | ~100s per 4 GiB (new cost) | ~100s per 4 GiB (new cost) |
| Client storage | ~800 MiB for 8 GiB DB (new cost) | ~800 MiB for 8 GiB DB (new cost) |

### Comparison with Prior Work

#### VeriSimplePIR vs APIR / APIR+ (Section 6.1, p. 12)

Comparison uses the non-preprocessed "VLHE PIR" variant (no per-client offline phase) against APIR/APIR+:

| Metric | VLHE PIR | APIR | APIR+ |
|--------|----------|------|-------|
| Online computation (1-bit entries) | 1x | ~25x | ~5x |
| Online communication (1-bit entries) | 1x | ~1.7x (40% more) | 7-12x |
| Offline communication (1-bit entries) | 1x | N/A (>45 GB below DB threshold) | ~4.5x smaller |
| Offline comm (64 GiB DB, 32-bit entries) | 1x | worse | ~7x larger |

APIR+ performance degrades as entry bitwidth grows (Figure 9, p. 14). At 1024-bit entries, APIR+ offline communication is ~7x that of VLHE PIR. VLHE PIR outperforms both APIR protocols on all metrics for 32-bit entries and above.[^40]

[^40]: Section 6.1 (p. 12): "By the time the database entry bitwidth reaches 1024, the offline communication of APIR+ is roughly 7x the offline communication of the VLHE PIR."

#### VeriSimplePIR vs Other Semi-Honest Schemes (Section 7, p. 13)

For the password-leak-detection application (400M entries, 20 bytes each, ~8 GiB):

| Metric | VeriSimplePIR | DoublePIR | Spiral |
|--------|--------------|-----------|--------|
| Online communication | Competitive | Worse | Competitive |
| Online computation | Competitive | Competitive | ~25x slower |
| Security model | Malicious-verifiable | Semi-honest | Semi-honest |
| Client storage overhead | ~800 MiB | None | None |

[^41]

[^41]: Section 7 (p. 13): "DoublePIR is worse in both online communication and online computation, and Spiral has around 25x slower online computation than VeriSimplePIR."

### Key Tradeoffs & Limitations

1. **Statefulness:** VeriSimplePIR is inherently stateful — the client must store the digest H_1, challenge C, and proof Z throughout the protocol lifetime. This is ~800 MiB for the password-leak application, feasible for desktop/laptop but potentially prohibitive for mobile devices.[^42]

2. **Preprocessing cost:** The one-time offline phase requires the server to perform O(N * λ) work (homomorphic evaluation of D^T on λ ciphertexts). This is ~100-200s for 4-8 GiB databases and scales linearly. This cost is per-client and must be repeated if verification ever fails.

3. **Honest digest assumption tradeoff:** Assuming the digest is honest (||D||_inf <= p) reduces the ciphertext modulus requirement, allowing better packing and improved performance (13-20% communication overhead instead of 40-50%). But it requires trusting the digest, which can be established by having it signed by trusted parties.[^43]

4. **Verification failure recovery:** If PreVerify ever rejects, the client must discard C and Z and rerun the full preprocessing phase, because the failure may have leaked information about C. For an honest server this never happens (perfect completeness), but it is a concern for servers that are intermittently malicious.

5. **No protection against denial of service:** The scheme detects malicious behavior but cannot prevent a server from simply refusing to respond or sending garbage. The client can detect this but has no recourse other than finding a different server.

6. **Database update model:** When the database changes, the server must recommit (new H_1, H_2) and clients must rerun DigVer and Proof Preprocessing. No incremental update mechanism is discussed.

[^42]: Section 7 (p. 13): "The only overhead from VeriSimplePIR is the roughly 800 MB of data that each client must locally store throughout the online phase."
[^43]: Section 6, item 3 (p. 11): "if the digest is signed by a sufficient number of trusted parties, a client can be confident that the digest was generated with a database D such that ||D||_inf <= p."

### Open Problems

1. **Adding malicious security to sublinear-online PIR:** The paper notes that several recent works achieve sublinear online complexity (CGHK22, LMW23, ZPSZ23) but remain semi-honest. "It remains an interesting open question how to add malicious security to these schemes."[^44]

2. **PGP-like server network for digest verification:** The paper suggests exploring a PGP-style trust network where multiple servers vouch for the digest's honesty, similar to the proposal by Colombo et al. [CNCG+23].[^45]

3. **Reducing client storage:** The ~800 MiB client-side storage is the main practical limitation. The paper suggests that infrequent-query clients could store only a hash of the digest rather than the full H_1, redownloading and reverifying when needed.[^46]

4. **Full implementation of the password-leak-detection application:** The paper discusses this as a promising application but leaves "a full implementation of this system" to future work.[^47]

[^44]: Section 8, Sublinear Semi-honest PIR (p. 14): "It remains an interesting open question how to add malicious security to these schemes."
[^45]: Section 7 (p. 13): "We leave a full implementation of this system as well as exploration of other applications (such as the PGP server proposed in the work of Colombo et al.) for future work."
[^46]: Section 7 (p. 13): "If clients make infrequent queries, they could avoid storing the full digest and instead only store a hash of the digest."
[^47]: Section 7 (p. 13).

### Uncertainties

- **Benchmark precision from figures:** The online and offline benchmarks (Figures 7, 8, 9) are presented as bar charts without exact numerical tables. The values reported in these notes are approximate readings from the figures. The paper's prose provides some exact ratios (e.g., "12% to 40%", "1.1-1.5x") which are more reliable.

- **Fiat-Shamir in ROM:** The non-interactive version of the protocol relies on the Fiat-Shamir heuristic, modeled in the Random Oracle Model. The security proofs (Appendices B, C) are given for the interactive variant (Figure 5), with non-interactivity following from Fiat-Shamir. The security of the deployed (non-interactive) scheme thus depends on the ROM assumption.

- **Concrete SIS parameters:** The paper states delta = 1.005 for the root Hermite factor (p. 3) and notes that current best lattice reduction algorithms achieve delta around 1.01, with delta = 1.005 "conjectured to be totally out of reach of thorough experiments" [CN11]. The concrete parameter choices for the SIS instances (beta_1 = 4*ell*p, beta_2 = 4mp) are given symbolically but the final numerical values depend on the chosen n, m, ell, q, p which vary by database size.

- **Scaling to very large databases:** The offline computation scales linearly with N. For very large databases (>16 GiB), the preprocessing time and client storage may become impractical. The paper benchmarks offline communication up to 256 GiB databases but does not report preprocessing computation times beyond 8 GiB.

- **Multi-query amortization:** The paper does not discuss batch or multi-query PIR. Unlike SealPIR's PBC-based mPIR, VeriSimplePIR has no amortization mechanism for clients retrieving multiple records.
