## A Survey on Private Information Retrieval — Notes

| Field | Value |
|-------|-------|
| **Paper** | A Survey on Private Information Retrieval |
| **Authors** | William Gasarch (University of Maryland at College Park) |
| **Year** | 2004 |
| **Survey type** | Pedagogical (textbook-style with full proofs) |
| **Scope** | Comprehensive survey of PIR results from 1978 through ~2003, covering information-theoretic multi-server PIR, computational single-server PIR, SPIR, keyword PIR, robust PIR, t-private PIR, PIR with preprocessing, commodity-based PIR, lower bounds, and implications between PIR and other cryptographic primitives |
| **PIR models covered** | k-DB information-theoretic PIR, 1-DB computational PIR (CPIR), SPIR (symmetric PIR), keyword PIR, block PIR, robust PIR (k-out-of-m), Byzantine PIR, t-private PIR, PIR with preprocessing, commodity-based PIR |
| **Excluded topics** | Locally decodable codes, PIR schemes with bounded error probability, quantum PIR, practical/applied PIR implementations, connections to older pre-CGKS papers[^1] |

### Taxonomy of PIR Models

The survey organizes PIR into two fundamental branches, then explores variants of each.[^2]

**Branch 1: Information-Theoretic PIR (Section 3)**
- Requires k >= 2 non-communicating database copies, each with unlimited computational power
- Privacy is unconditional: each individual database gains zero information about the queried index i
- Communication complexity is the primary cost metric (measured in bits)
- All known schemes are 1-round

**Branch 2: Computational PIR / CPIR (Section 4)**
- Requires only 1 database copy (k = 1), but database is computationally bounded
- Privacy holds against computationally bounded adversaries
- Relies on hardness assumptions (QR, one-way functions, homomorphic encryption, phi-hiding)

**Variants (Section 6-7):**
- **Block PIR (PIR(l,n,k))**: Alice retrieves a block of l consecutive bits instead of a single bit
- **Keyword PIR (PERKY(l,N,k))**: Alice searches by keyword rather than by index
- **Robust PIR**: Some databases may crash (k-out-of-m) or return false answers (Byzantine)
- **SPIR**: Alice learns only x_i and nothing else about the database
- **t-private PIR**: Security holds even when up to t databases collude
- **PIR with preprocessing**: Databases precompute and store additional data to reduce online work
- **Commodity-based PIR**: A third party supplies random strings to reduce direct communication

### Schemes Covered

#### Information-Theoretic PIR Upper Bounds (Table 1, p. 5)

| Tool / Technique | Theorem | Ref | 2-DB | 3-DB | 4-DB | k-DB (general) |
|------------------|---------|-----|------|------|------|----------------|
| kth root (XOR + bit arrays) | Th 3.2 | CGKS [23] | no PIR | no PIR | n^{1/2} | k * n^{1/lg k} |
| Covering codes | Th 3.3 | CGKS [23] | n^{1/3} | no PIR | n^{1/4} | (k lg k) n^{1/(lg k + lg lg k)}? |
| Polynomial interpolation | -- | CKGS [22] | n^{1/2} | n^{1/3} | n^{1/4} | (k^2 log k) n^{1/k} |
| Recursion (Ambainis) | Th 3.7 | [2] | n^{1/3} | n^{1/5} | n^{1/7} | 2^{k^2} n^{1/(2k-1)} |
| Linear algebra (Itoh) | -- | [41] | n^{1/3} | n^{1/5} | n^{1/7} | k! n^{1/(2k-1)} |
| Linear algebra (Ishai-Kushilevitz) | -- | [40],[10] | n^{1/3} | n^{1/5} | n^{1/7} | k^3 n^{1/(2k-1)} |
| Poly-heavy (Beimel et al.) | -- | [12] | n^{1/3} | n^{1/5.25} | n^{1/7.87} | n^{O(lg lg k / k lg k)} |

All complexities are up to constant factors.[^3]

#### Computational PIR Schemes

| Scheme | Assumption | # DBs | Communication | Reference |
|--------|-----------|-------|---------------|-----------|
| Kushilevitz-Ostrovsky | QR hardness | 1 | O(n^{1/2+delta}) | [47] |
| Cachin et al. | phi-hiding | 1 | O((lg n)^a) (polylog) | [17] |
| Chor-Gilboa | One-way functions | 2 | O(n^epsilon) | [19] |
| Kushilevitz-Ostrovsky | One-way trapdoor permutations | 1 | n - o(n) | [48] |
| Stern / Mann | Homomorphic encryption | 1 | n^epsilon | [57],[50] |

#### SPIR Schemes (Section 7.2)

| Scheme | # DBs | Communication | Shared randomness | Alice model | Reference |
|--------|-------|---------------|-------------------|-------------|-----------|
| Gertner et al. (honest-but-curious) | k+1 | alpha(n)+(k+1) ceil(lg n), beta(n)+1 | O(n) | Honest-but-curious | [34] |
| Gertner et al. (dishonest) | k+1 | alpha(n)+(k+1) ceil(lg n), 2*beta(n) | O(n + beta(n)) | Dishonest | [34] |
| Gertner et al. (from Th 3.7) | k-DB | O(n^{1/(2k-1)}) | O(n^{1/(2k-1)}) | Dishonest | [34] |
| Gertner et al. (logarithmic DBs) | ceil(lg n)+1 | O(lg^2 n * lg lg n) | O(lg^2 n * lg lg n) | Dishonest | [34] |
| Mishra-Sarkar | 1 | O(n^epsilon) | -- | Dishonest | [51],[52] |

### Model Definitions

#### Definition 2.1 — 1-round k-DB Information Retrieval Scheme[^4]

Database: x = x_1 x_2 ... x_n in {0,1}^n with k non-communicating copies.
1. Alice wants to know x_i.
2. Alice flips coins and computes query strings q_1, ..., q_k. Sends q_j to DB_j.
3. Each DB_j returns answer string ANS_j(q_j).
4. Alice recovers x_i from the coin flips and the ANS_j values.

**Complexity**: sum_{j=1}^{k} |q_j| + |ANS_j(q_j)|.

#### Definition 2.2 — Private Information Retrieval (information-theoretic)[^5]
A k-DB information retrieval scheme where, after the query is made and answered, the database does not have any information about what i is. The database is assumed computationally unbounded. Hence privacy is unconditional: the database does not have enough *information* to figure out anything about i.

#### Definition 2.3 — Computationally Private Information Retrieval (CPIR)[^6]
A k-DB information retrieval scheme where, assuming some limitations on what the database can compute, after the query is made and answered, the database does not have any information about what i is. Privacy rests on computational hardness assumptions.

#### Definition 6.5 — PERKY (Private Retrieval by Keywords)[^7]
There are k databases with the same list of N strings of length l. Alice has a string w in {0,1}^l. Alice wants to determine if w is on the list without the databases knowing anything about w.

#### Definition 7.1 — k-out-of-m PIR (Robust PIR)[^8]
A k-out-of-m PIR scheme is an m-DB PIR scheme that works even if only k of the databases send back answers (the rest return nothing).

#### Definition 7.5 — b-Byzantine k-out-of-m PIR[^9]
A PIR scheme that works even if only k of the m databases return answers and at most b of them return incorrect answers. The b bad databases do not collude.

#### Definition 7.8 — Symmetric PIR (SPIR)
A PIR scheme where, at the end, Alice learns nothing more than x_i. Databases may share a common random string. Two sub-types: (1) honest-but-curious Alice (follows the protocol but tries to infer extra information), and (2) dishonest Alice (may deviate from protocol).

### Key Upper Bounds

**Information-Theoretic PIR:**

1. **Chor et al. (1995/1998)**: k-DB, O((k lg k) n^{1/lg k})-bit PIR scheme. KEY IDEA: View the database as a sqrt(n) x sqrt(n) bit array and use properties of XOR.[^3]

2. **Chor et al. (1995/1998)**: 2-DB, O(n^{1/3})-bit PIR scheme. KEY IDEA: Two databases can do the work of eight. Covering codes help to organize who does what.[^10]

3. **Ambainis (1997)**: k-DB, O(2^{k^2} n^{1/(2k-1)})-bit PIR scheme. KEY IDEAS: The k databases simulate the two databases from the lopsided scheme. Since Alice only needs one bit of what the database is going to send her, apply the PIR scheme recursively to get that bit.[^11]

4. **Beimel et al. (2002)**: k-DB, n^{O(lg lg k / k lg k)}-bit PIR scheme. KEY IDEA: View the database as a polynomial. This is the best known result for general k even at small k.[^12]

5. **Ishai-Kushilevitz (1999/2003)**: k-DB, O(k^3 n^{1/(2k-1)})-bit PIR scheme. Uses linear algebra and secret sharing; improves the constant from k! (Itoh) to k^3.

**Computational PIR:**

6. **Kushilevitz-Ostrovsky (1997)**: Assuming QR is hard, 1-DB, O(n^{1/2+delta})-bit PIR. KEY IDEA: View database as sqrt(n) x sqrt(n) array. A new database is formed which relates to QR.[^13]

7. **Chor-Gilboa (2000)**: If one-way functions exist, there is a 2-DB, O(n^epsilon)-bit PIR scheme. KEY IDEA: Alice does the O(n^{1/3})-bit scheme from Theorem 3.3 on each row, but she sends short seed instead of long message.[^14]

8. **Cachin et al. (1999)**: If the phi-hiding problem is hard, there is a 1-DB probabilistic scheme that uses O((lg n)^a) bits, where a depends on the hardness of the phi-hiding problem.

**Data Variant Upper Bounds:**

9. **Block PIR**: The PIR(l,n,2) problem can be solved with O(n/l + l) bits. KEY IDEA: Use XOR on blocks.[^15]

10. **Keyword PIR**: There exists an O((N+l)(lg N))-bit PERKY(l,N,k) scheme. KEY IDEA: The words are sorted. Alice uses block PIR and binary search.

### Key Lower Bounds

1. **Deterministic lower bound (folklore)**: If Alice uses a deterministic scheme, then n bits are required. This holds even with multiple non-communicating copies.[^16]

2. **Single-DB, unbounded computation**: If the database has unlimited computational power and there is only one copy, then n bits are required (Chor et al. [23]).

3. **Linear PIR lower bound (Theorem 8.5, Itoh [42])**: Any k-DB linear PIR scheme has complexity at least sqrt(n/2k). KEY IDEAS: Using linearity, Alice can reconstruct the answers to any queries she wants. This enables her to obtain a 1-DB sublinear PIR scheme, which contradicts Theorem 8.4.[^17]

4. **Multilinear PIR lower bound (Theorem 8.6, Itoh [42])**: For any k-DB l-multilinear PIR scheme, complexity >= (1/(k-1)^{1/(l+1)} - epsilon) n^{1/(l+1)}.

5. **l-affine PIR lower bound (Theorem 8.7, Itoh [42])**: For any k-DB l-affine PIR scheme, complexity >= (1/(k-1)^{1/(l+1)} - epsilon) n^{1/(l+1)}.

6. **2-DB linear answers, linear queries (Goldreich et al. [36])**: If the database sends back an answer of length a (XOR of database bits), then Alice must send a query of length Omega(n/2^a). Uses equivalence between PIR and locally decodable codes.

7. **2-DB, 1-bit answer, no restriction on query (Beigel, Fortnow, Gasarch [8])**: Alice must send a query of length at least n - 2. This nearly matches the n - 1 upper bound from [23].

8. **Mann's privacy cost lower bound (Theorem 8.1 [50])**: Every k-DB alpha(n)-bit PIR scheme where every database receives the same number of bits has alpha(n) >= (k^2/(k-1) - epsilon) lg n. In particular, any 2-DB equal-query scheme has complexity at least 3.5 lg n.

### Proof Techniques

| Technique | Used in | Description |
|-----------|---------|-------------|
| **XOR masking on bit arrays** | Th 3.2 (CGKS) | View database as sqrt(n) x sqrt(n) array; Alice sends random subsets that XOR to cancel all but the target bit |
| **Covering codes** | Th 3.3, 3.5 (CGKS) | Reduce the number of servers by having each server simulate multiple databases from a higher-k scheme; covering sets determine the assignment |
| **Lopsided protocols + recursion** | Th 3.7 (Ambainis) | One DB sends short answers, the other sends long answers; recursion on the long part using fewer DBs |
| **Polynomial representation** | Th 3.10, 3.4 (Beimel et al., Ishai-Kushilevitz) | Represent x_i as evaluation of a multivariate polynomial; secret-share the evaluation point among k databases |
| **Pseudorandom generators** | Th 4.5 (Chor-Gilboa) | Replace long random query strings with short PRG seeds; databases expand seeds identically |
| **Quadratic residuosity** | Th 4.3 (Kushilevitz-Ostrovsky) | Embed query into QR/non-QR elements of Z_m*; database computes row products; Alice checks residuosity to recover bits |
| **Simulation argument** | Th 5.1 (Beimel et al.) | Build a bit-commitment scheme from a sublinear 1-DB PIR scheme; uses inner product mod 2 as a hard predicate |
| **Communication complexity reduction** | Th 8.5 (Itoh) | Show that linearity lets Alice reconstruct all answers from the database's response to basis queries, reducing k-DB PIR to 1-DB PIR and deriving a contradiction |
| **Conditional Disclosure of Secrets** | Th 7.10-7.12 (Gertner et al.) | Generalization of secret sharing used to transform PIR into SPIR; an extra database holds the random mask |

### Implication Chains

The survey documents a rich web of implications between PIR and fundamental cryptographic primitives.[^18]

```
One-Way Functions  ==>  2-DB o(n)-bit PIR                [Chor-Gilboa, Th 4.5]
One-Way-Perm-Trap  ==>  1-DB (n - o(n))-bit PIR          [Kushilevitz-Ostrovsky, [48]]
(n - o(n))-bit PIR ==>  Oblivious Transfer (OT)          [Di Crescenzo et al., [29]]
OT                 ==>  One-Way Functions                  [standard]
One-Way Functions  ==>  2-DB o(n)-bit PIR                 (cycle closes)
HES (Homomorphic Encryption) ==> 1-DB n^epsilon-bit PIR  [Stern [57], Mann [50]]
1-DB sublinear PIR ==> One-Way Functions exist            [Beimel et al., Th 5.1]
1-DB sublinear PIR ==> Bit-commitment                    [Beimel et al., Th 5.1]
OT  <==>  SPIR (1-out-of-n sublinear)                    [Crepeau [26]; Section 7.2]
PIR (computational) ==> SPIR                              [Naor-Pinkas [53] via O(log n) OTs]
```

Key takeaway: In the computational setting, sublinear 1-DB PIR is *equivalent in power* to one-way functions. And 1-out-of-n sublinear OT and SPIR are equivalent. Since OT can be built from any PIR scheme, and OT implies one-way functions, the existence of any sublinear 1-DB PIR scheme has strong cryptographic implications.[^19]

The survey also notes an important barrier: Impagliazzo and Rudich [39] showed that proving OT from one-way functions alone (without trapdoor) would imply P != NP via a non-relativizing argument, which is considered very difficult. Since OT is equivalent to SPIR and SPIR is close to PIR, this suggests it is unlikely that sublinear PIR can be obtained from one-way functions alone.

### Open Problems

The survey lists four open problems (Section 9, p. 29):[^20]

1. **Beat the poly-heavy barrier**: Find a k-DB PIR scheme that uses less than n^{O(lg lg k / k lg k)} bits. The authors of [12] conjecture their method can yield a k-DB n^{O(1/k^2)} scheme but cannot be pushed further. A plausible goal is to use their method (or others) to obtain a k-DB n^{O(1/k^2)} scheme. Gasarch conjectures this can be done.

2. **Prove lower bounds on unrestricted models**: The only lower bounds known are on fairly restrictive models (linear, multilinear, affine answer functions). It is open to prove any bounds on an unrestricted model. Conjecture: n^{Theta(1/k^2)} is both an upper and lower bound.

3. **Multi-round PIR**: All known PIR schemes are 1-round. Conjecture: if there is a k-DB, n^{alpha(k)}-bit PIR scheme then there is a 1-round k-DB, n^{O(alpha(k))}-bit PIR scheme. It may even be that there is a 1-round k-DB n^{alpha(k)}-bit PIR.

4. **Characterize the computational assumption for sublinear 1-DB PIR**: What conjecture (e.g., the existence of one-way functions) is equivalent to 1-DB o(n)-bit PIR? 1-DB (n - o(n))-bit PIR? 1-DB (n - c)-bit PIR? Gasarch conjectures these questions do not have nice answers.

Additional frustration noted: "The biggest frustration about PIR's is the lack of good lower bounds. This is particularly striking since we are dealing with communication complexity where lower bounds are possible and plentiful."

### Commentary / Author Reflections

Section 10 (p. 29) contains Gasarch's personal commentary after reading 27 PIR papers:

1. **Accessibility**: "Some of the results are simple enough to present in an undergraduate cryptography class. I have taught Theorems 3.3 and 4.3, towards the end of such a course (after the mandatory material was covered) and it worked well."

2. **Interdisciplinary nature**: "PIR is interesting in that it is a simple model and yet proving things about it seems to require knowing material from other fields. Communication Complexity, Computational Number Theory, Complexity Theory, Cryptography, Combinatorics, all play a role. Hence a course on it would be an excellent and motivated way to get into these other subjects."

3. **Significance assessment**: "While I don't see PIR as being fundamental, I do see it as both connecting to fields of interest and using interesting techniques."

### Historical Significance

This survey is one of the foundational reference works for the entire PIR field, published as a column in the Bulletin of the European Association for Theoretical Computer Science (BEATCS), introduced by Lance Fortnow's "Computational Complexity Column." Its significance includes:

1. **First comprehensive survey with full proofs**: Unlike brief summaries, Gasarch provides complete or near-complete proofs for most theorems, making it a self-contained reference. The proof of the 4-DB O(sqrt(n))-bit scheme (Section 3.1), the 2-DB O(n^{1/3})-bit scheme using covering codes (Section 3.2/3.3), and the Kushilevitz-Ostrovsky QR-based CPIR scheme (Section 4.1) are all given in full detail.

2. **Established the standard taxonomy**: The decomposition into information-theoretic vs. computational PIR, and the identification of variant models (SPIR, keyword, robust, t-private, block), became the standard organizational framework used by subsequent surveys and textbooks.

3. **Documented the PIR-to-OWF implication chain**: The careful documentation of how sublinear 1-DB PIR implies one-way functions (via bit-commitment, Theorem 5.1), and the converse direction via pseudorandom generators, established the theoretical landscape that guided subsequent work on computational PIR.

4. **KEY IDEA annotations**: The survey introduces a distinctive pedagogical device -- explicit "KEY IDEA" callouts before proofs -- that make the essential insight of each construction immediately visible. These include:
   - "View the database as a sqrt(n) x sqrt(n) bit array and use properties of XOR" (Th 3.2)
   - "Two databases can do the work of eight. Covering codes help to organize who does what." (Th 3.3)
   - "The k databases simulate the two databases from the lopsided scheme. Since Alice only needs one bit... apply the PIR scheme recursively to get that bit." (Th 3.7)
   - "View the database as a polynomial." (Section 3.4)
   - "View the database as a sqrt(n) x sqrt(n) array. A new database is formed which relates to QR." (Th 4.3)
   - "Alice does the O(n^{1/3})-bit scheme from theorem 3.3 on each row, but she sends short seed instead of long message." (Th 4.5)
   - "Using linearity, Alice can reconstruct the answers to any queries she wants." (Th 8.5)

5. **Time capsule of the field circa 2003**: The survey captures the state of the art before the lattice-based / FHE revolution. All information-theoretic schemes require multiple non-communicating servers. All single-server CPIR schemes rely on number-theoretic assumptions (QR, phi-hiding) or generic one-way functions / homomorphic encryption. The FHE-based approaches that would later dominate practical PIR (starting with Gentry 2009) are entirely absent, making this survey a clear marker of the "pre-FHE" era of PIR.

6. **Notation**: lg denotes log_2 throughout. Database size is n bits. k is the number of database copies. Communication complexity is measured as total bits exchanged (queries + answers).[^4]

[^1]: Section 1, end of introduction (p. 3): "To limit the survey the following topics are omitted: 1. Locally Decodable Codes... 2. PIR's that are allowed to make errors but with low probability... 3. Quantum PIR's... 4. Attempts to make PIR practical in the real-real world... 5. The connection between current PIR work and some of the older papers on the same theme."
[^2]: Section 1 (pp. 1-3) and Section 2 (p. 3-4): The two-branch taxonomy is implicit in the structure: Sections 3 (IT-PIR) and 4-5 (CPIR/implications), with Section 6-7 covering variants of both.
[^3]: Table 1 (p. 5): "Summary of Information Theoretic Schemes, up to a constant factor."
[^4]: Definition 2.1 (p. 3-4) and Notation 1.1 (p. 3): "Throughout this paper we assume that lg is log_2 and returns an integer."
[^5]: Definition 2.2 (p. 4): "A 1-round k-DB Private Information Retrieval Scheme with x in {0,1}^n and k databases is an information retrieval scheme such that, after the query is made and answered, the database does not have any information about what i is."
[^6]: Definition 2.3 (p. 4): "A 1-round k-DB Computationally Private Information Retrieval Scheme... assuming some limitations on what the database can compute, after the query is made and answered, the database does not have any information about what i is."
[^7]: Definition 6.5 (p. 17): "The PrivatE Retrieval by KeYwords problem with parameters (henceforth PERKY(l,N,k)) is as follows..."
[^8]: Definition 7.1 (p. 18): "A k-out-of-m PIR scheme is an m-DB PIR scheme that works even if only k of the databases send back answers (the rest return nothing)."
[^9]: Definition 7.5 (p. 19): "A b-Byzantine k-out-of-m PIR scheme is an m-DB PIR scheme that works even if only k of the PIR schemes return answers and <= b of them return incorrect answers."
[^10]: Theorem 3.3, proof (pp. 6-7): "By the n=8 case of Theorem 3.2 there is an 8-DB O(n^{1/3})-bit PIR scheme. We can decrease the number of databases from eight to two by having two databases simulate the work of eight databases."
[^11]: Theorem 3.7 (p. 8): "KEY IDEAS: The k databases simulate the two databases from the lopsides scheme. Since Alice only needs one bit of what the database is going to send her, apply the PIR scheme recursively to get that bit."
[^12]: Section 3.4 (p. 9): "KEY IDEA: View the database as a polynomial." Theorem is from Beimel, Ishai, Kushilevitz, and Raymond [12].
[^13]: Theorem 4.3 and KEY IDEA (p. 11): "View the database as a sqrt(n) x sqrt(n) array. A new database is formed which relates to QR."
[^14]: Theorem 4.5 and KEY IDEA (p. 12): "Alice does the O(n^{1/3})-bit scheme from theorem 3.3 on each row, but she sends short seed instead of long message."
[^15]: Theorem 6.2 (p. 17): "The PIR(l,n,2) problem can be solved with O(n/l + l) bits." KEY IDEA: Use XOR on blocks.
[^16]: Section 1 (p. 2): "If Alice uses a deterministic scheme then n bits are required. (This is folklore.) This holds even if there are several non-communicating copies of the database."
[^17]: Theorem 8.5, proof (pp. 26-27): "KEY IDEAS: Using linearity Alice can reconstruct the answers to any queries she wants. This enables her to obtain a 1-DB sublinear PIR scheme, which contradicts Theorem 8.4."
[^18]: Section 5.2 (p. 15): Summary of implication chains. "One-Way-Perm-Trap ==> 1-DB (n - o(n))-bit PIR... (n - o(n))-bit PIR ==> OT... OT ==> One-Way... One-Way ==> 2-DB o(n)-bit PIR... HES ==> 1-DB n^epsilon-bit PIR."
[^19]: Section 5.1, Theorem 5.1 (p. 14): "If there is a 1-DB (n/2)-bit PIR scheme then there is a weak bit-commitment scheme." Section 5.2 (p. 15) also notes that Naor and Pinkas [53] provide a general PIR-to-SPIR transformation using a logarithmic number of oblivious transfers.
[^20]: Section 9, Open Problems (p. 29): All four open problems listed verbatim.
