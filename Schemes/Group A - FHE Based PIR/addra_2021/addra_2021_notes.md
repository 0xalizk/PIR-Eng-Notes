## Addra / FastPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Addra: Metadata-Private Voice Communication over Fully Untrusted Infrastructure](https://eprint.iacr.org/2021/044) (2021) |
| **Archetype** | System + Construction |
| **PIR Category** | Group A — FHE/HE-based |
| **Security model** | Semi-honest single-server (untrusted server; adversary controls entire communication infrastructure) |
| **Additional assumptions** | BFV semantic security (lattice-based); AES-CBC for content encryption |
| **Correctness model** | Deterministic (BFV decryption correctness with chosen parameters; q >> p ensures noise budget) |
| **Rounds (online)** | 1 (non-interactive: query uploaded once per round, reused across subrounds) |
| **Record-size regime** | Small (96 bytes — one LPCNet voice frame encoding 40 ms audio) |

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | XPIR [4] (Group A), SealPIR [6] (Group A), Pung [9] (system) |
| **What changed** | Prior CPIR schemes (XPIR, SealPIR) apply SIMD vectorization *across columns* of the DB matrix; FastPIR applies it *across rows*, using one-hot selection vectors at depth d=1 (no recursion), combined with optimized BFV rotation trees to pack m column outputs into a single ciphertext. |
| **Superseded by** | N/A (system contribution; FastPIR's PIR technique is a point in the design space, not a general-purpose PIR improvement) |
| **Concurrent work** | N/A |

### Core Idea

Addra is the first system that hides voice-call metadata over *fully untrusted* infrastructure for tens of thousands of users. The key PIR innovation is FastPIR, a BFV-based CPIR scheme operating at recursion depth d=1 that uses one-hot encoded selection vectors and row-wise SIMD batching to simultaneously achieve small Answer output size *and* low server CPU time.[^1] Prior CPIR schemes (XPIR, SealPIR) trade one for the other: d=1 gives small output but large query/CPU cost in XPIR; d=2 shrinks the query but inflates the response.[^2] FastPIR eliminates this tension through two rotation optimizations (sections 4.3, 4.4) that reduce the cost of packing column outputs into a single response ciphertext.

<a id="fn-1"></a>
[^1]: Paper p.5-6: "FastPIR works without recursion and thus keeps the smaller CPIR answer size. However, it optimizes the computation time for Answer."
<a id="fn-2"></a>
[^2]: Paper p.5: recursion with d >= 2 shrinks the query to d * d-th-root(n) ciphertexts but "increases the CPIR Answer output size exponentially with d."

### System Context (Addra)

- **Application:** Metadata-private peer-to-peer voice communication (VoIP-like)
- **Key constraint driving PIR design:** Sub-500 ms per-hop latency. Voice packets generated every 500 ms; each hop in the infrastructure must process within this budget to avoid unbounded packet build-up.[^3]
- **System architecture:** Master-worker cluster on AWS EC2 (logically centralized, physically distributed). One master (c5.24xlarge: 96 vCPU, 192 GiB RAM, 25 Gbps NIC) plus up to 100 worker machines (c5.12xlarge: 48 vCPU, 96 GiB RAM, 12 Gbps NIC).[^4]
- **Where PIR fits:** During each subround of the communication phase, the master compiles all mailbox contents into a message library and broadcasts it to workers. Each worker answers its assigned subset of CPIR queries using FastPIR's Answer procedure. Results are pushed back to clients.[^5]
- **Round structure:** A round = 5 minutes of voice call. Within a round: one dialing phase (exchange PIR queries) + t subrounds of communication (each subround = 480 ms = one voice packet exchange). The CPIR query is generated once during dialing and reused across all subrounds.[^6]
- **Two-hop message delivery:** Caller pushes message to server (1 hop); server answers callee's PIR query and pushes response (2nd hop). This is critical for low latency vs. Pung's log_2(n+1) round trips.[^7]
- **Cover traffic:** Devices not in a call still participate — they call themselves (query their own mailbox) and write encrypted random messages. This prevents traffic analysis from join/leave timing.[^8]

<a id="fn-3"></a>
[^3]: Paper p.1, Introduction: "each hop in the communication infrastructure must not spend longer than this time period to process and forward the packet."
<a id="fn-4"></a>
[^4]: Paper p.10: "For the master, we use a machine of type c5.24xlarge... For the workers, we use the compute-optimized machines of type c5.12xlarge."
<a id="fn-5"></a>
[^5]: Paper p.9: "the master receives CPIR queries from all devices and shards them across the workers."
<a id="fn-6"></a>
[^6]: Paper p.5: "our prototype runs a round every five minutes, and a subround every 480 ms."
<a id="fn-7"></a>
[^7]: Paper p.5: "a sender pushes a message to the server... this two-hop communication pattern is crucial for voice calls."
<a id="fn-8"></a>
[^8]: Paper p.5: "if a device does not initiate or pick up a call... it calls itself."

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | RLWE (Ring Learning With Errors) via BFV |
| **Encryption/encoding scheme** | BFV (Brakerski/Fan-Vercauteren) with SIMD batching |
| **Ring / Field** | Z_q[x]/(x^N + 1) with N = 2^{12} = 4096. Plaintext: Z_p with p = 270337 (19-bit prime, p ≡ 1 mod 2N). Ciphertext modulus: q = 109-bit composite (product of a 54-bit prime 18014398509309953 and a 55-bit prime 36028797018652673).[^9] |
| **Key structure** | Standard BFV public/secret key pair. Rotation keys required for BFV.RowRotate and BFV.ColRotate. Each rotation key = 128 KiB; full set of all possible rotation keys = 256 MiB. In practice, generate log_2(N/2) keys for power-of-two rotations.[^10] |
| **Correctness condition** | BFV decryption correctness: noise must remain below q/(2p) after all homomorphic operations. Parameters chosen per the HE security standard [5] for 128-bit security.[^11] |

<a id="fn-9"></a>
[^9]: Paper p.8-9: "we choose N = 2^{12}, p a 19-bit prime 270337, and q a 109-bit composite..."
<a id="fn-10"></a>
[^10]: Paper p.6: "each rotation key is 128 KiB, and the set of all possible rotation keys is 256 MiB... in practice, one generates log_2(N/2) keys."
<a id="fn-11"></a>
[^11]: Paper p.9: "These parameters provide a 128-bit security level as guided by the homomorphic encryption standard [5]."

### BFV SIMD Batching — Details

BFV operates on plaintext vectors of dimension N, where each component is an element of Z_p. The paper views a BFV plaintext as a matrix with 2 rows and N/2 columns.[^12]

Key homomorphic operations used by FastPIR:
- **BFV.Add(c_0, c_1):** Component-wise vector addition of encrypted plaintexts.
- **BFV.ScMult(v_0, c_1):** Plaintext-ciphertext multiplication (component-wise). This is the core operation for the one-hot selection.
- **BFV.RowRotate(c_0, i):** Rotates the encrypted plaintext cyclically right by i positions, row-wise. Cost depends on i: power-of-two rotations are fast (single call); non-power-of-two rotations decompose into log_2(i+1) recursive calls.[^13]
- **BFV.ColRotate(c_0):** Swaps the two rows of the plaintext matrix representation.

<a id="fn-12"></a>
[^12]: Paper p.6: "we will view a BFV plaintext as a matrix with two rows and N/2 columns."
<a id="fn-13"></a>
[^13]: Paper p.7: "a call to BFV.RowRotate with an input i = 7 translates into three rotations by amounts one, two, and four."

### Key Data Structures

- **Database (mailbox library):** n mailboxes, each storing one message of m components (m = number of Z_p elements per message). Viewed as a matrix L in Z_p^{n x m}. For Addra: m = ceil(96 bytes / (19-bit plaintext capacity)) elements per mailbox.[^14]
- **Query:** A set of n/N BFV ciphertexts (basic version, Figure 3) or n/(N/2) ciphertexts (optimized version, Figure 5), each encrypting a segment of the one-hot encoding of the target index idx.[^15]
- **Response:** A single BFV ciphertext packing all m columns of the selected row.

<a id="fn-14"></a>
[^14]: Paper p.7: "a server holds a library L of n messages where each message has m components."
<a id="fn-15"></a>
[^15]: Paper p.8: Figure 5 shows the optimized Query producing q_0, ..., q_{n/(N/2)-1}.

### Database Encoding

- **Representation:** n x m matrix L in Z_p^{n x m}. The n rows are split into groups of N (or N/2 for the optimized variant) so that each group aligns with one BFV plaintext dimension.
- **Constraint:** n must be a multiple of N/2 (optimized version). If not, pad L with empty rows.[^16]
- **Record addressing:** Row = mailbox index; columns = message components.
- **Preprocessing required:** None beyond padding. The database is stored in plaintext (not NTT-domain).

<a id="fn-16"></a>
[^16]: Paper p.8: "n = k * (N/2) for some k >= 1, and m is even and <= N."

### Protocol Phases

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Registration | Client + Server | Client obtains mailbox ID, auth token, n | Minimal | Once |
| Dialing | Client | Generate PIR query q = Query(M_peer, n); send to server | Query ↑ (see size below) | Once per round (every 5 min) |
| PIR distribution | Master | Shard CPIR queries across workers | Internal (master→workers) | Once per round |
| Subround: Write | Client | Encrypt voice packet with AES, send (M_self, tkn, ciphertext) to server | ~96 bytes ↑ (encrypted) | Every 480 ms |
| Subround: Library broadcast | Master | Compile all mailbox messages; broadcast to workers | Internal (master→workers) | Every 480 ms |
| Subround: Answer | Workers | Compute resp = Answer(mailboxes, q) for each assigned query | — | Every 480 ms |
| Subround: Response push | Server | Push PIR response to client | Response ↓ (see size below) | Every 480 ms |
| Decode | Client | Decode PIR response, decrypt with AES, play audio | — | Every 480 ms |

### FastPIR Construction (d=1, One-Hot Encoding)

#### Why d=1 Works Well Here

In Addra's setting, the CPIR query is generated *once per round* (every 5 minutes) and reused across all subrounds (every 480 ms). The query cost is amortized over ~625 subrounds. Even though d=1 produces a larger query than d=2, the amortization makes query size nearly irrelevant. What matters is the *per-subround* Answer time and response size — both of which d=1 optimizes.[^17]

<a id="fn-17"></a>
[^17]: Paper p.5: "the protocol amortizes the cost of generating and transferring a PIR query across subrounds of a round."

#### Basic Version (Figure 3, Section 4.2)

**Query(idx, n):**
1. Create a one-hot vector f of length n: f_i = 1 if i == idx, else 0.
2. Split f into k = n/N segments of length N.
3. Encrypt each segment as a BFV ciphertext: q_i = BFV.Enc(pk, (f_{i*N}, ..., f_{(i+1)*N-1})).
4. Return q = (q_0, ..., q_{k-1}).

**Answer(L, q):**
1. For each column j in [0, m-1]:
   - Initialize sum_j = BFV.Enc(pk, 0).
   - For each row group i in [0, k-1]: extract the i-th column segment p_{i,j}, compute t_{i,j} = BFV.ScMult(p_{i,j}, q_i), add to sum_j.
   - Result: sum_j encrypts a vector whose entries are zero except for the entry corresponding to idx, which contains L[idx][j].
2. Combine m column results into a single ciphertext using RowRotate and ColRotate:
   - For j < N/2: rotate sum_j by j positions, add to s_top.
   - For j >= N/2: rotate sum_j by (j - N/2) positions, add to s_bot.
   - Return BFV.Add(s_top, BFV.ColRotate(s_bot)).

**Decode(ans, idx):**
1. Decrypt: ans_pt = BFV.Dec(sk, ans).
2. If idx mod N > N/2: apply ColRotate to the plaintext.
3. RowRotate the plaintext to align the target entry to position 0.

#### Row-wise vs Column-wise Vectorization

FastPIR's key insight: prior schemes (XPIR, SealPIR) apply vectorization *across columns* of L — each BFV plaintext packs N elements from the same column (different rows). FastPIR applies vectorization *across rows* — the one-hot query consumes one BFV slot per row, and the ScMult selects the target row. This is more efficient because: (a) each query ciphertext operates on N rows simultaneously, (b) the server only needs to combine m column outputs (not n row outputs).[^18]

<a id="fn-18"></a>
[^18]: Paper p.7: "The difference is that these prior CPIR schemes apply vectorization across columns of the matrix, while FastPIR applies it across rows of the matrix, which is a more efficient use of vectorization in the PIR context."

#### Optimization 1: Reducing CPU Cost of Rotations (Section 4.3)

**Problem:** Combining m column outputs requires m calls to BFV.RowRotate. Non-power-of-two rotation amounts are expensive (decomposed into log_2(i+1) sub-rotations).

**Solution:** Arrange the m vectors as leaves of a binary tree. When creating a parent at height h, rotate the right child by 2^{h-1} positions (always a power-of-two) and add to the left child. This ensures *only fast (power-of-two) rotations* are used.[^19]

**Effect:** Replaces m potentially-slow rotations with m fast rotations (all power-of-two amounts).

<a id="fn-19"></a>
[^19]: Paper p.8: "FastPIR rotates the right child by 2^{h-1} positions and adds the rotated vector to the left child... the effect is that FastPIR combines m ciphertexts in lines 22 and 25 in Figure 3 using m fast rotations."

#### Optimization 2: Reducing Number of Rotations (Section 4.4)

**Problem:** The basic version produces one ciphertext per column, requiring m rotations to combine.

**Solution:** Exploit the 2-row matrix representation of BFV plaintexts. Instead of selecting one element per row, select *two* elements: idx-th and (idx + N/2)-th entries. The query encrypts vectors with two non-zero entries. This retrieves two columns of L per ciphertext, halving the number of ciphertexts and eliminating ColRotate.[^20]

**Trade-off:** Query size doubles (2x increase) because each query vector has two non-zero entries. But this is acceptable since query cost is amortized.

**Effect:** Reduces rotation count by 2x and eliminates BFV.ColRotate entirely.

<a id="fn-20"></a>
[^20]: Paper p.8: "This optimization reduces the number of calls to BFV.RowRotate by a factor of two, and eliminates the call to BFV.ColRotate."

### Complexity

#### Core Metrics

| Metric | Asymptotic | Concrete (n=32,768, m=96B) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(n/N) ciphertexts = O(n) | 1,024 KiB (FastPIR, d=1)[^21] | Online (amortized over subrounds) |
| Response size | 1 ciphertext | 64 KiB[^22] | Per subround |
| Server Answer time | O(n * m) scalar-ciphertext multiplications + O(m) rotations | 398 ms per worker (32K users, 80 workers)[^23] | Per subround |
| Client Query time | O(n/N) encryptions | 21.3 ms[^24] | Once per round |
| Client Decode time | 1 decryption + O(1) rotations | 0.36 ms[^24] | Per subround |

<a id="fn-21"></a>
[^21]: Paper p.13, Figure 10: FastPIR query size = 1,024 KiB for n=32,768, m=96B.
<a id="fn-22"></a>
[^22]: Paper p.13, Figure 10: FastPIR answer size = 64 KiB for all m values at n=32,768.
<a id="fn-23"></a>
[^23]: Paper p.10: "of which 398 ms is for CPIR query processing at the workers."
<a id="fn-24"></a>
[^24]: Paper p.13, Figure 10: Client CPU costs for Query and Decode.

#### FHE-specific Metrics

| Metric | Value |
|--------|-------|
| Plaintext dimension N | 4096 (2^{12}) |
| Plaintext modulus p | 270337 (19-bit prime, p ≡ 1 mod 2N) |
| Ciphertext modulus q | 109-bit composite (54-bit x 55-bit) |
| Security level | 128 bits |
| Multiplicative depth | 1 (ScMult is plaintext-ciphertext multiply; no ciphertext-ciphertext multiply) |
| Expansion factor (F) | ~682x for raw ciphertext vs plaintext (64 KB ciphertext / 96 bytes payload)[^25] |
| Recursion depth d | 1 (no recursion) |

<a id="fn-25"></a>
[^25]: Paper p.11: "Addra encrypts the 96 bytes into a 64 KB ciphertext, which is a 682x increase."

### System-Level Performance

| Metric | Value | Configuration |
|--------|-------|---------------|
| **End-to-end latency (p99)** | 726 ms | 32,768 users, 80 workers |
| **End-to-end latency** | 254 ms | 4,096 users, 80 workers |
| **End-to-end latency** | 1,678 ms | 65,536 users, 80 workers[^26] |
| **Latency breakdown (32K)** | 398 ms CPIR processing + 186 ms library broadcast + ~142 ms network | 80 workers |
| **Server CPU per subround** | 22.3 minutes total | 32,768 users, 480 ms subround |
| **Server CPU provisioning** | 1,338 seconds = 2,788 CPUs = **0.085 CPU per user** | 32,768 users[^27] |
| **Client download** | 55.1 MiB per round (~39 MiB communication phase + ~16 MiB dialing) | 32,768 users, 5-min round |
| **Client upload** | 1.08 MiB per round | 32,768 users |
| **Client download bandwidth** | 1.46 Mbps | Steady state |
| **Client upload bandwidth** | 30 Kbps | Steady state |
| **Client CPU** | ~27.5 seconds per 5-min round (94% from dialing protocol) | 32,768 users[^28] |
| **Mean jitter** | 4.1 ms (4K users) to 36.8 ms (32K users) | 80 workers |
| **Scalability limit** | ~65K users (beyond which CPIR processing exceeds 480 ms subround budget) | 80 workers[^29] |
| **Network RTT (client-server)** | 51 ms mean | US West ↔ US East |

<a id="fn-26"></a>
[^26]: Paper p.10: "Addra's message latency is 254 ms for 4,096 users and increases to 1678 ms for 65,536 users."
<a id="fn-27"></a>
[^27]: Paper p.11: "Addra's server consumes 22.3 minutes of CPU time... 0.085 CPU per user."
<a id="fn-28"></a>
[^28]: Paper p.11: "An Addra client consumes ~27.5 seconds of CPU time per five-minute round... 94% of this time is from the dialing protocol."
<a id="fn-29"></a>
[^29]: Paper p.10: "for 65,536 users... the processing time is higher than the 480 ms subround time budget."

### Performance Benchmarks — FastPIR Microbenchmarks (Isolated CPIR Comparison)

**Hardware:** Single AWS c5.12xlarge instance (48 vCPU, 3.6 GHz, 96 GiB RAM). All libraries configured for 128-bit security.[^30]

#### Answer CPU Time (ms) — from Figure 9

| n | m | XPIR (d=1) | XPIR (d=2) | SealPIR (d=1) | SealPIR (d=2) | FastPIR (d=1) |
|---|---|-----------|-----------|--------------|--------------|--------------|
| 2^{15} | 96B | ~30 | ~30 | ~3 | ~20 | ~2 |
| 2^{20} | 96B | ~800 | ~900 | ~100 | ~600 | ~60 |
| 2^{20} | 256B | ~3000 | ~2500 | ~300 | ~2000 | ~200 |
| 2^{20} | 1024B | ~10000 | ~8000 | ~1000 | ~7000 | ~700 |

*Values approximate, read from log-scale Figure 9.*

#### Concrete Costs at n=32,768 (from Figure 10)

| Metric | XPIR (d=1) | XPIR (d=2) | SealPIR (d=1) | SealPIR (d=2) | FastPIR (d=1) |
|--------|-----------|-----------|--------------|--------------|--------------|
| **Query size (KiB), m=96B** | 33,856 | 2,112 | 32 | 64 | 1,024 |
| **Query size (KiB), m=256B** | 95,328 | 3,520 | 96 | 64 | 1,024 |
| **Query size (KiB), m=1024B** | 524,288 | 8,192 | 512 | 64 | 1,024 |
| **Answer size (KiB)** | 32 | 256 | 32 | 320 | 64 |
| **Client Query CPU (ms), m=96B** | 118.6 | 7.4 | 0.7 | 1.4 | 21.3 |
| **Client Query CPU (ms), m=256B** | 335.2 | 12.4 | 2.0 | 1.4 | 21.4 |
| **Client Decode CPU (ms)** | 0.1 | 0.41 | 0.19 | 1.88 | 0.36 |

<a id="fn-30"></a>
[^30]: Paper p.12: "We microbenchmarked the XPIR, SealPIR, and FastPIR libraries on a single CPU of an AWS instance of type c5.12xlarge."

#### At n=1,048,576 (from Figure 10)

| Metric | XPIR (d=1) | XPIR (d=2) | SealPIR (d=1) | SealPIR (d=2) | FastPIR (d=1) |
|--------|-----------|-----------|--------------|--------------|--------------|
| **Query size (KiB), m=96B** | 1,082,432 | 11,776 | 928 | 64 | 32,768 |
| **Query size (KiB), m=256B** | 3,050,432 | 19,776 | 2,752 | 64 | 32,768 |
| **Answer size (KiB)** | 32 | 288 | 32 | 320 | 64 |
| **Client Query CPU (ms), m=96B** | 3801.8 | 41.5 | 19.2 | 1.4 | 679.0 |

### FastPIR Optimization Impact (from Figure 9 labels)

| Variant | Description | Relative Cost (vs full FastPIR, at n=2^{15}, m=256B) |
|---------|-------------|------------------------------------------------------|
| F-1 | No rotation optimizations (Sections 4.3, 4.4 disabled) | 2.73x more expensive |
| F-2 | Only Section 4.4 optimization disabled | 1.45x more expensive |
| F (full) | Both optimizations enabled | 1.0x (baseline) |

As n increases, the benefit of rotation optimizations diminishes because the Answer procedure becomes dominated by BFV.ScMult and BFV.Add operations rather than rotations.[^31]

<a id="fn-31"></a>
[^31]: Paper p.12-13: "as n increases the lower the CPU time benefit of the optimizations diminishes... dominated by the time to run BFV.ScMult and BFV.Add."

### Comparison with Prior Work (System-Level)

| Metric | Addra | Pung-XPIR (d=2) | Pung-SealPIR (d=2) |
|--------|-------|-----------------|-------------------|
| **Message latency (32K users, 80 machines)** | 726 ms (p99) | 5,200 ms | — |
| **Server CPU per subround** | 22.3 min | 77.1 min (3.45x higher) | — |
| **CPU per user** | 0.085 | 0.29 | — |
| **Client download (5-min round)** | 55.1 MiB | 250 MiB (4.6x higher) | — |
| **Client upload (5-min round)** | 1.08 MiB | 313 MiB (289x higher) | — |
| **Latency improvement** | — | 7.2x slower than Addra | — |
| **Hop count** | 2 | log_2(n+1) | — |

**Key takeaway:** Addra achieves 7.2x lower latency than Pung at 32K users, primarily because of (a) 2-hop message delivery vs. Pung's tree-based multi-round retrieval, and (b) FastPIR's lower Answer CPU time vs. XPIR/SealPIR.

### Correctness Analysis

#### Option A2: Library-based Noise Management

- **Library / version:** Microsoft SEAL 3.5[^32]
- **Parameter constraints:** N = 4096, multiplicative depth = 1 (only plaintext-ciphertext multiply, no ciphertext-ciphertext multiply). The BFV.ScMult operation does not consume a full multiplication level.
- **Depth constraint:** The circuit depth is effectively 1 (one ScMult per query ciphertext against the database, followed by additions and rotations). Rotations consume noise but do not increase multiplicative depth.
- **Key observation:** Because FastPIR only performs plaintext-ciphertext multiplications (BFV.ScMult) and never ciphertext-ciphertext multiplications, the noise growth is much more controlled than schemes requiring ct-ct multiplication (like SealPIR with query expansion). This allows a smaller ring dimension (N=4096 vs typical N=8192+).[^33]

<a id="fn-32"></a>
[^32]: Paper p.8: "Microsoft SEAL library v3.5 [68]."
<a id="fn-33"></a>
[^33]: The absence of ct-ct multiplication is implicit in the construction (Figures 3 and 5): all multiplications are BFV.ScMult(plaintext, ciphertext).

### Implementation Notes

- **Language / Library:** C++ with Microsoft SEAL 3.5 (for BFV operations)
- **FastPIR LOC:** ~1,000 lines of C++[^34]
- **Addra total LOC:** ~2,000 lines of C++ (on top of existing libraries)[^35]
- **Additional libraries:**
  - libscapi [1] for Cramer-Shoup public-key encryption (dialing protocol, 3072-bit key, 128-bit security)
  - OpenSSL AES-CBC (128-bit key) for content encryption
  - rpclib [3] for master-worker RPC (message library broadcasting)
  - Mozilla LPCNet [56] for voice encoding/decoding (1.6 Kbit/s)
- **Polynomial arithmetic:** NTT-based (via SEAL)
- **Parallelism:** Distributed across worker machines (each worker handles a shard of CPIR queries). Within each worker, SEAL uses multi-threaded NTT operations on 48 vCPUs.
- **Open source:** https://github.com/ishtiyaque/FastPIR (FastPIR library), https://github.com/ishtiyaque/Addra (full system)

<a id="fn-34"></a>
[^34]: Paper p.8: "Our prototype of FastPIR is ~1000 lines of C++."
<a id="fn-35"></a>
[^35]: Paper p.9: "Our prototype of Addra is ~2,000 lines of C++."

### Deployment Considerations

- **Database updates:** Mailbox contents change every subround (480 ms). The master recompiles the message library and re-broadcasts to workers each subround. No incremental update mechanism — full library broadcast each time.[^36]
- **Scalability bottleneck:** The time to broadcast the mailbox library from master to workers is the immediate scalability ceiling. At 65K users, CPIR processing alone (1,186 ms) exceeds the 480 ms subround budget.[^37]
- **Sharding:** CPIR queries are sharded across workers, but the full database (message library) must be replicated to every worker.
- **Client requirements:** Clients must remain online even when idle (cover traffic). Assumes unlimited data plans.[^38]
- **Dialing protocol:** Based on Pung/Alpenhorn. Runs infrequently (every 5 minutes). Server broadcasts encrypted "hello" messages to all clients. Inefficient but acceptable due to low frequency.[^39]
- **Session model:** Persistent (clients maintain state: mailbox ID, auth token, peer's phone number, encryption key, and the CPIR query across subrounds).
- **Cold start suitability:** No (requires registration and dialing phase before communication).

<a id="fn-36"></a>
[^36]: Paper p.9: "during each subround, it waits to receive messages from the clients, compiles them into a message library, and broadcasts the entire message library to the workers."
<a id="fn-37"></a>
[^37]: Paper p.10: "for 65,536 users... 1,186 ms... higher than the 480 ms subround time budget."
<a id="fn-38"></a>
[^38]: Paper p.2: "Addra assumes clients with unlimited data plans."
<a id="fn-39"></a>
[^39]: Paper p.9: "Addra runs this protocol infrequently (every five minutes)."

### Key Tradeoffs & Limitations

- **Query size vs Answer time:** FastPIR's d=1 approach produces larger queries than SealPIR (d=2), but this is acceptable because queries are amortized over hundreds of subrounds. The per-subround Answer time and response size are what matter for voice-call latency.
- **Bandwidth overhead:** 682x ciphertext expansion means Addra consumes 1.46 Mbps download for 96-byte voice packets. This is orders of magnitude more than non-private VoIP but acceptable for modern broadband.[^40]
- **Quadratic scaling:** PIR overhead grows quadratically with user count (more queries AND larger database per query). The paper does not currently scale beyond ~65K users.[^41]
- **Cover traffic cost:** Total network transfers are high even for idle clients, requiring unlimited data plans.
- **No asynchronous messaging:** Addra targets synchronous voice calls only. It cannot retrieve long-lived messages (unlike Pung which supports email/chat).[^42]
- **Single-point-of-failure:** The master node is a coordination bottleneck. Distributing or eliminating the master is future work.
- **Library broadcast bottleneck:** Every subround, the full message library must be broadcast from master to all workers. This is the near-term scalability wall.

<a id="fn-40"></a>
[^40]: Paper p.11: "64 KB ciphertext, which is a 682x increase."
<a id="fn-41"></a>
[^41]: Paper p.2: "does not currently scale to hundreds of thousands or a few million users due to the overhead of PIR which grows quadratically."
<a id="fn-42"></a>
[^42]: Paper p.14: "Addra cannot retrieve long-lived messages from the server, which is a requirement for such applications."

### Open Problems (as stated by the authors)

- Scaling Addra to hundreds of thousands or millions of users.[^43]
- Accelerating CPIR computation via GPUs and FPGAs on worker machines.
- Exploring efficient master-worker architectures (distributing the master, reducing broadcast).
- Running PIR on heterogeneous systems.
- Extending from peer-to-peer voice calls to group calls.
- Designing a more efficient dialing protocol under Addra's strong threat model.

<a id="fn-43"></a>
[^43]: Paper p.14: "Our future work involves further scaling Addra from tens of thousands of users to hundreds of thousands or a few million users."

### Uncertainties

- The exact BFV parameters (noise budget, number of rotation keys generated) are not fully specified; the paper states N=4096, p=270337, q=109-bit composite, and references SEAL 3.5 defaults for the rest.
- The breakdown of the 726 ms latency does not fully account for all components (398 ms CPIR + 186 ms broadcast + ~142 ms unspecified network/overhead).
- Per-worker parallelism details (how many threads SEAL uses on each 48-vCPU worker) are not stated.
- The paper does not provide Answer CPU time for FastPIR in the system context at the per-query level (only aggregate across all queries per subround). The microbenchmarks in Section 6.5 are on a different machine (single c5.12xlarge) than the system evaluation (cluster of c5.12xlarge workers + c5.24xlarge master).
