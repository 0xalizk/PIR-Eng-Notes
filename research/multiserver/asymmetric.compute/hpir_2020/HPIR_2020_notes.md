## HPIR — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | [Heterogeneous Private Information Retrieval](https://www.ndss-symposium.org/ndss-paper/heterogeneous-private-information-retrieval/) (NDSS 2020) |
| **Authors** | Hamid Mozaffari, Amir Houmansadr (UMass Amherst) |
| **Archetype** | Construction + Building-block (PIR-tailored multi-secret sharing) |
| **Asymmetry profile** | Two-server (rich + poor) ITPIR. The "rich" server bears `q` of the `q+1` query shares (≈ all upload, ≈ all DB-scan compute, ≈ all download); the "poor" server bears `1` share. Asymmetry knob: degree of heterogeneity `DH = q/1`. Demonstrated `DH = 4/1` on a 2 GB DB → rich/poor ≈ 12.5 s / 4.09 s compute, 2.8 MB / 724 KB communication.&#8201;[^1]&#8201;[^2] |
| **Security model** | Information-theoretic against any non-colluding subset of size ≤ `t` (default `t=1` for two-server). Computational variant when PRNG is used to compress the poor server's queries (security reduces to factoring `n = p₁·…·p_q`).&#8201;[^3] |
| **Additional assumptions** | Non-collusion of PIR servers; for the PRNG variant, hardness of factoring a 2048-bit composite.&#8201;[^4] |
| **Correctness model** | Deterministic (Lagrange interpolation over `Z_n` recovers each secret exactly modulo each prime `p_i`).&#8201;[^5] |
| **Rounds (online)** | 1 (non-interactive: client → servers → client). |
| **Record-size regime** | Parameterized; experiments use `w ∈ {256, 512, 768, 1024}` bits per element (512 bits identified as optimal); records are `s × w` bits with `s = √(N/w)`.&#8201;[^6] |

[^1]: Abstract and Section I (p. 1): "in a two server scenario with a heterogeneity degree of 4/1, to retrieve a 456KB file from a 0.2GB database, the rich (i.e., resourceful) PIR server will do 1.1 seconds worth of computation compared to 0.3 seconds by the poor (resource-constrained) PIR server; this is while each of the servers would do the same 1 seconds of computation in a homogeneous settings. Also, for this given example, our HPIR protocol will impose a 912KB communication bandwidth on the rich server compared to 228KB on the poor server (by contrast to 456KB overheads on each of the servers for a traditional homogeneous design)."
[^2]: Section II/Summary (p. 3) and §VIII-A (p. 12): for a 2 GB DB at `DH=4/1`, "the rich and poor PIR servers will take 12.5 and 4.09 seconds, respectively, whereas the two servers of Goldberg will take 12.04 seconds each."
[^3]: §III (p. 4) defines HPIR as a multi-server PIR with asymmetric compute/communication on non-colluding servers; §VII-B (p. 10): "our protocol is information-theoretically secure if up to `t` servers collude; with large prime numbers, our protocol is computationally secure even if all the servers collude."
[^4]: §VII-B (p. 10): "if the prime numbers are large enough, e.g., `n` has 2048 bits or more, the adversarial servers should solve the factorization problem, which is an NP problem."
[^5]: §VI-D, eq. (12)–(13) (p. 8): client constructs `q`-degree polynomial `φ_k(x)` from `q+1` interpolation points and recovers `D_{β_j,k} = φ_k(x_j) mod p_j`, deterministic.
[^6]: §VIII (p. 11–12): "we choose `s = r = √(N/w)`"; Figure 2 caption: "`w = 512` provides the least overhead."

### Multi-server model

| Aspect | Detail |
|--------|--------|
| **Number of servers** `ℓ` | ≥ 2; the basic and complete protocols are presented for `ℓ = 2` (rich + poor). Generalizes to any `ℓ ≥ q+1` via the same PIR-tailored sharing.&#8201;[^7] |
| **Privacy threshold** `t` | Default `t = 1` for two servers (corruption of either single server reveals nothing). Generalizes: information-theoretic privacy holds against any coalition of ≤ `t` colluding servers.&#8201;[^8] |
| **Trust model** | Honest-but-curious, non-colluding. The paper argues non-collusion is realistic for the target deployments (e.g., NYT origin server vs. Fastly CDN edge): the parties have economic interest in not colluding.&#8201;[^9] |
| **Servers replicate the DB** | Yes — the database matrix `D ∈ F_n^{r×s}` is replicated identically across all PIR servers (standard ITPIR setting).&#8201;[^10] |
| **Asymmetry achieved by** | Sending different *number* of secret-sharing shares to different servers (`q` to rich, `1` to poor), not different content per share. This requires a *non-ramp* multi-secret-sharing scheme (the paper's contribution).&#8201;[^11] |

[^7]: §III (p. 4) and Algorithm VII.1 (p. 10): protocol presented for two servers but generalizes via the underlying `(t+1, ℓ)` PIR-tailored sharing.
[^8]: §IV-C (p. 7): "our HPIR is information-theoretic secure if at least one of the PIR servers does not collude with the others."
[^9]: §III, "non-trusted" paragraph (p. 5): "we assume the PIR servers to *not collude* … this is a realistic assumption as, in our applications, the HPIR servers have no motivation to collude."
[^10]: §II-A, eq. (1) (p. 3): defines the database matrix `D` of dimensions `r × s` over a finite field `F`; replicated across servers as in standard ITPIR.
[^11]: §II-B and §IV (p. 4–6): the paper explicitly designs a *non-ramp* multi-secret-sharing — "the number of shareholders does *not* increase with the number of shared secrets" — so heterogeneity does not require more servers.

### Lineage

| Field | Value |
|-------|--------|
| **Builds on** | Goldberg's ITPIR (S&P 2007, Shamir-share-based) and Henry et al. ITPIR (NDSS 2013, ramp-share-based multi-query). Also draws on Li et al. rPIR (IJIS 2017) for the multi-secret-sharing concept.&#8201;[^12] |
| **What changed** | All prior multi-server PIRs are *homogeneous* (identical load on every server). HPIR replaces the underlying `(t+1, ℓ)` Shamir / ramp scheme with a custom *PIR-tailored* multi-secret-sharing in which (i) secrets are restricted to `{0,1}` (only one is `1`); (ii) `x`-coordinates are secret from the shareholders; (iii) only `t+1` shareholders are needed irrespective of the number of secrets (non-ramp). This lets the client send `q` shares to a rich server and `1` share to a poor server with no inflation in `ℓ`.&#8201;[^13] |
| **Superseded by** | None in this collection (canonical asymmetric multi-server PIR). |
| **Concurrent work** | Li et al. rPIR (2017) used ramp secret sharing for multi-query PIR — it shares secrets unevenly but increases `ℓ` with `q`, so it is not deployable on two servers for `q > 1`.&#8201;[^14] |

[^12]: §II (p. 3) and References [26] (Goldberg 2007), [30] (Henry et al. 2013), [37] (Li et al. 2017).
[^13]: §IV-A (p. 6): "PIR-tailored secret sharing" lists 4 differences from standard secret sharing — `{0,1}` secrets, one-hot encoding, hidden `x`-coordinates per shareholder, hidden generator `x`-coordinates `X`. §IV-B (p. 6) explains the non-ramp property: "the number of shareholders does not increase with the number of shared secrets."
[^14]: §I, "Note that we are not the first…" (p. 2): "Henry et al. [30] and Li et al. [37] have used a multi-secret sharing algorithm for PIR protocols, with the intent of being able to send multiple PIR queries at each round of the protocol. Unfortunately, their multi-secret sharing algorithms are *ramp* schemes, which are not practical for typical applications of HPIR."

### Core Idea

HPIR introduces *asymmetric* multi-server PIR: a rich server (e.g., a CDN edge node) absorbs most of the compute and bandwidth, while a poor server (e.g., a content publisher's origin) handles a small fraction — both enabled by a custom *PIR-tailored multi-secret-sharing* scheme. The client builds `r` polynomials of degree `q` using `q+1` interpolation points whose `x`-coordinates and prime moduli `(p₁, …, p_q)` are kept secret, then sends `q` of the `q+1` query-share columns to the rich server and `1` to the poor server. Each server multiplies its query-share matrix by the database matrix; the client reconstructs each requested record via Lagrange interpolation at `q` distinct `x`-values, extracting one bit per prime `p_i` via `mod p_i`. The asymmetry knob — `DH = q/1` — directly trades poor-server overhead for rich-server overhead.&#8201;[^15]

[^15]: §V–§VII (p. 7–10): high-level design and full Algorithm VII.1 spec. §VIII-D Figure 5 (p. 13) shows the bandwidth tradeoff.

### Novel Primitives / Abstractions

| Field | Detail |
|-------|--------|
| **Name** | PIR-Tailored Multi-Secret Sharing |
| **Type** | Cryptographic primitive (specialised secret-sharing scheme) |
| **Interface / Operations** | `Share(S = {s₁,…,s_q}, t, ℓ, P = {p₁,…,p_q}) → q+1 shares` (one per shareholder), where `s_i ∈ {0,1}` and exactly one `s_i = 1`; `Reconstruct({k ≥ t+1 share, x'-pair}, P) → S` via Lagrange interpolation over `Z_n` then extraction `s_i = f(i) mod p_i`.&#8201;[^16] |
| **Security definition** | Any coalition of `≤ t` shareholders learns nothing about `S` (degree of freedom of secrets remains `> q · r` after `t` points are revealed, due to introduced random variables `r_{i,j}`).&#8201;[^17] |
| **Correctness definition** | Deterministic — given any `k ≥ t+1` shares with known `x'`-coordinates, Lagrange interpolation in `mod n` recovers `f(x)` exactly; reduction `mod p_i` extracts `s_i`.&#8201;[^16] |
| **Purpose** | Enable heterogeneous distribution of shares across `ℓ ≥ 2` servers without increasing `ℓ` with `q` (non-ramp), and enforce the PIR-specific structure (one-hot, hidden coordinates) needed for query privacy. |
| **Built from** | Lagrange polynomial interpolation over `Z_n`, where `n = p₁ · … · p_q` is a composite of `q` distinct `w`-bit primes; relies on `gcd(x_i − x_j, n) = 1` for chosen `x`-coordinates.&#8201;[^18] |
| **Standalone complexity** | Each share: `O(q · w)` bits; share generation: `O(q²)` for Lagrange interpolation; reconstruction: `O(k²)` Lagrange interpolation + `q` `mod p_i` reductions. |
| **Relationship to prior primitives** | Replaces Shamir `(t+1, ℓ)` (Goldberg PIR) and `(t+1, q, ℓ)`-ramp (Henry et al.) — *non-ramp*: shareholder count fixed at `t+1` regardless of secret count. Differs from standard secret sharing in 4 listed ways: secrets in `{0,1}`, one-hot constraint, secret per-shareholder `x`-coordinate, and secret root `X` set.&#8201;[^19] |

[^16]: §IV-B (p. 6–7), eqs. (5)–(6): Sharing creates `q+1` points and reconstructs `s_i = f(i) mod p_i = Σ y_m (∏ (i − x_n)(x_m − x_n)^{-1}) mod p_i`.
[^17]: §IV-C (p. 7): "Our PIR-tailored secret sharing scheme shares `q` secrets using a `t` degree polynomial. We add `q` random variables, `r_i`s, to the polynomial points… Therefore, the adversary's degree of freedom to reconstruct the secrets will be `t + q + 1`. Assuming that the adversary is provided with `t` shares, the degree of freedom given `t` secret shares will be `q + 1`, which is still larger than the number of secrets, `q`."
[^18]: §IV-B (p. 6): primes "are from `{0, 1}` [for secret values], and only one of the secrets could be `1`. Then, the dealer calculates `n = p₁ × p₂ × … × p_q`."
[^19]: §IV-A (p. 6): enumerates 4 differences from standard secret sharing.

### Cryptographic Foundation

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | Information-theoretic (non-collusion of `≤ t` servers); reduces to integer factorisation when PRNG is used or all servers collude with large primes.&#8201;[^20] |
| **Encryption/encoding scheme(s)** | None (no encryption). Privacy comes from secret-sharing the one-hot query vector. |
| **Ring / Field** | `Z_n` where `n = p₁ · p₂ · … · p_q` is a composite of `q` distinct primes each `> 2^w` (so `w`-bit DB elements fit). Basic version uses all `q` primes; the *complete* version (§VII) uses only two primes `P = {p₁, p₂}` to keep element sizes constant.&#8201;[^21] |
| **Key structure** | No long-lived keys. Per query: client generates fresh primes (or reuses from a list), fresh randomisers `r_{i,j}, r'_{i,j}`, fresh `x`-coordinates `X = {x₁,…,x_{q+1}}` and `X' = {x'₁,…,x'_{q+1}}`. PRNG seed (32 B in practice) is the only client-server "state" when PRNG variant is used.&#8201;[^22] |
| **Correctness condition** | Deterministic. Requires `gcd(x_i − x_j, n) = 1` for all `x_i, x_j ∈ X`; primes `p_i > 2^w`; client sets `s = r = √(N/w)`.&#8201;[^23] |

[^20]: §VII-B (p. 10).
[^21]: §VI vs §VII (p. 7, 9): basic uses `q` primes (size grows linearly with `q`); complete fixes at `P = {p₁, p₂}`.
[^22]: §VII-A and §VII-B (p. 10): PRNG used for the poor server's query; "the client sends only one element (the seed of the PRNG)."
[^23]: §VI-A and §VIII-A (p. 7, 12): `gcd(x_i − x_j, n) = 1` constraint; `w = 512` ⇒ `n` has 1024 bits; `s = r = √(N/w)`.

### Key Data Structures
- **Database matrix `D ∈ F^{r×s}`** with `r` rows (records) of `s` `w`-bit elements. Replicated identically on every PIR server.&#8201;[^10]
- **Client polynomials `f_i(x)`** for `1 ≤ i ≤ r` — one degree-`q` polynomial per database row, with `q+1` known interpolation points; `y_{i,j} = (r_{i,j} · p_v) + δ_{i,j} mod n` where `δ_{i,j} = 1` iff row `i` is queried by query `j`.&#8201;[^24]
- **Query matrices `Q_c, Q_r`**: rich server receives `Q_c ∈ Z_n^{q × r}` (`q` rows, evaluations at `x'_1,…,x'_q`); poor server receives `Q_r ∈ Z_n^{1 × r}` (one row, evaluation at `x'_{q+1}`). Sizes: `Q_c` is `q² × r × w` bits in basic version (linear in `q`), `2 × q × r × w` bits in the complete version (constant elements via two-prime trick).&#8201;[^25]
- **Response matrices `R_c = Q_c · D mod n`** and **`R_r = Q_r · D mod n`**: rich server returns a `q × s` matrix, poor server returns a `1 × s` matrix.&#8201;[^26]
- **PRNG seed** (variant): client sends a 32-byte PRNG seed instead of the full `Q_r`, downgrading to computational security but reducing poor-server upload to `O(1)`.&#8201;[^22]

[^24]: §VI-A, eq. (7) (p. 8).
[^25]: §VI-B, eqs. (10)–(11) (p. 8); §VII-A "Communication Costs" (p. 9).
[^26]: §VI-C, eq. (12) (p. 8).

### Database Encoding
- **Representation:** matrix of `r × s` entries over `F`, each entry `w` bits.
- **Record addressing:** to fetch row `β_j`, set the `β_j`-th `δ` to `1` and all others to `0` (one-hot row selection).
- **Preprocessing required:** none beyond loading the matrix into RAM (no NTT, no encoding).&#8201;[^27]
- **Record size equation:** `s × w` bits per record; the paper picks `s = r = √(N/w)`, so each record is `√(N · w)` bits.&#8201;[^6]

[^27]: §VIII (p. 11): "we load the database into the RAM before measuring the time, so the measured times do not include the I/O times."

### Protocol Phases (Complete Version)

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| Initial | Client | Choose `P = {p₁, p₂}` with `p_i > 2^w`, compute `n = p₁ · p₂`, publish `n` (NOT `p₁, p₂`) | (one-time public) | Per session/setup |
| Query Gen | Client | Pick `q` random distinct `α_j ∈ Z_n^*`; build `q+1` `x`-coords per polynomial (`x_{i,j}` even-indexed use `p₁`, odd-indexed use `p₂`); build `y`-coords with `δ_{i,β_j}=1`; Lagrange-interpolate `r` degree-`q` polynomials `f_i(x)`; pick fresh `X' = {x'_1, …, x'_{q+1}}` | — | Per query batch |
| Query Send (rich) | Client → Rich | Send `Q_c[j][i] = f_i(x'_j)` for `1 ≤ i ≤ r, 1 ≤ j ≤ q` (a `q × r` matrix) | `2·q·r·w` ↑ | Per query batch |
| Query Send (poor) | Client → Poor | Send `Q_r[0][i] = f_i(x'_{q+1})` (a `1 × r` matrix) — or just a 32-byte PRNG seed in the PRNG variant | `2·r·w` ↑ (or `2·w` w/ PRNG) | Per query batch |
| Answer | Each server | Compute `R = Q · D mod n` (matrix multiplication) | — | Per query batch |
| Response (rich) | Rich → Client | Return `R_c ∈ Z_n^{q × s}` | `2·q·s·w` ↓ | Per query batch |
| Response (poor) | Poor → Client | Return `R_r ∈ Z_n^{1 × s}` | `2·s·w` ↓ | Per query batch |
| Decode | Client | For each output column `k`, Lagrange-interpolate `φ_k(x)` from `q+1` points `(x'_j, R[j][k])`; extract `D_{β_j,k} = φ_k(α_j) · f_{β_j}(α_j)^{-1} mod p_{(j%2==0 ? 1 : 2)}` | — | Per query batch |

(Reference: Algorithm VII.1, p. 10.)&#8201;[^28]

[^28]: Algorithm VII.1 (p. 10): full pseudocode of P1–P7, S1, C1–C2.

### Two-Server Protocol Details

| Aspect | Rich Server | Poor Server |
|--------|-------------|-------------|
| **Data held** | Full DB copy `D` | Full DB copy `D` |
| **Query received** | `Q_c ∈ Z_n^{q × r}` (`q` shares) | `Q_r ∈ Z_n^{1 × r}` (1 share) — or 32 B PRNG seed |
| **Computation** | `q × r × s` modular multiplications: `R_c = Q_c · D mod n` | `r × s` modular multiplications: `R_r = Q_r · D mod n` |
| **Upload from client** | `2·q·r·w` bits | `2·r·w` bits (or `2·w` bits w/ PRNG) |
| **Download to client** | `2·q·s·w` bits | `2·s·w` bits |
| **Asymmetry ratio** | `q` × poor server (in compute, upload, and download) | baseline `1` |
| **Security guarantee** | IT-private if poor server does not collude (or vice versa); computational under factoring if both collude with PRNG variant | same |
| **Non-collusion assumption** | Required — if both servers collude they can factor `n` (computationally hard) but otherwise reconstruct `f(x)` |

### Communication Breakdown

(For retrieving `q` records from a DB with `r` rows of `s` `w`-bit elements; `s = r = √(N/w)`.)

| Component | Direction | Size (Complete Version) | Notes |
|-----------|-----------|-------------------------|-------|
| Rich-server query | ↑ | `2·q·r·w` bits | Fixed `q+1`-prime field eliminated → only 2 primes |
| Poor-server query | ↑ | `2·r·w` bits | Reducible to `2·w` bits (one PRNG seed) by trading IT for computational security |
| Rich-server response | ↓ | `2·q·s·w` bits | Linear in `q` |
| Poor-server response | ↓ | `2·s·w` bits | Constant in `q` |
| **Comparison** | | | All sizes are 2× larger than Goldberg's because elements are in `Z_n` (`2w`-bit) vs `Z_p` (`w`-bit).&#8201;[^29] |

[^29]: §VII-C (p. 11): "our element size is two times of prior works since our calculations are in `mod n`, where `n` is a multiplication of two prime numbers."

### Correctness Analysis

**Option C: Deterministic Correctness.**

Reconstruction of `D_{β_j,k}` is exact whenever:
1. `gcd(x_i − x_j, n) = 1` for all chosen `x`-coordinates (required for Lagrange inversion mod `n`).&#8201;[^30]
2. Primes `p_i > 2^w` (so `w`-bit DB elements survive the `mod p_i` reduction).&#8201;[^21]
3. The set `X` and `X'` are chosen distinctly (standard Lagrange).

The paper proves correctness via direct algebraic substitution in eqs. (12) and (15). For undesired rows `i ∉ β`, `f_i(α_j) ≡ 0 mod p_l` because the construction (16) sets `y_{i,j} = r_{i,j} · p_l mod n` for those rows — so all undesired rows multiply out to zero modulo the prime corresponding to that query parity.&#8201;[^31]

[^30]: §VI-B "Constraints" (p. 8): "we have the constraint that `gcd(x_i − x_j, n) = 1` for `x_i, x_j ∈ X, i ≠ j`."
[^31]: §VII "Correctness" and eq. (15) (p. 9): explicit derivation that `f_i(α_j) mod p_l = 0` for `i ∉ β`.

### Complexity

| Metric | Asymptotic | Concrete (Complete Version) | Phase |
|--------|-----------|------------------------------|-------|
| Rich-server upload (client→rich) | `O(q · r · w)` | 912 KB at `DH=4/1`, 0.2 GB DB&#8201;[^1] | Online |
| Poor-server upload (client→poor) | `O(r · w)` (or `O(w)` w/ PRNG) | 228 KB at `DH=4/1`, 0.2 GB DB&#8201;[^1] | Online |
| Rich-server download | `O(q · s · w)` | 2.8 MB at `DH=4/1`, 2 GB DB&#8201;[^2] | Online |
| Poor-server download | `O(s · w)` | 724 KB at `DH=4/1`, 2 GB DB&#8201;[^2] | Online |
| Rich-server compute | `O(q · r² · s)` (Strassen: `O(n^{2.8})` for large `q`) | 12.5 s at `DH=4/1`, 2 GB DB&#8201;[^32] | Online |
| Poor-server compute | `O(r² · s)` | 4.09 s at `DH=4/1`, 2 GB DB&#8201;[^32] | Online |
| Total compute | `O((q+1) · r² · s)` | ~16.6 s for `q=4` (vs. 12.04 s × 2 = 24.08 s for Goldberg homogeneous)&#8201;[^32] | Online |
| Client compute (decode) | `O(s · q²)` Lagrange + `q` `mod p_i` extractions | ~500 ms for `q=4` records on 1.5 GB DB (vs. 200 ms for Goldberg)&#8201;[^33] | Online |
| Rounds | `1` | `1` | — |

[^32]: §VIII-A (p. 12) and Table IV (p. 12); §VII-C (p. 11) explains Strassen `O(n^{2.8})` for large `q`.
[^33]: §VIII-B (p. 12) and Figure 4 (p. 13).

### Performance Benchmarks

**Hardware:** desktop with quad-core Intel i7 @ 3.6 GHz, 32 GB RAM, Ubuntu 18.04, single-threaded; C++ wrapped in Rust; uses NTL for big-integer arithmetic; built on Percy++.&#8201;[^34]

**Reproduced Table V (p. 14)** — comparison at DB size 288 MB:

| Protocol | File retrieved | Server computation (s) | UBW (MB) | DBW (MB) |
|----------|----------------|------------------------|----------|----------|
| PIR-PSI [19] | 4 B | 0.528 | 0.02 | 0.03 |
| SealPIR [4] | 288 B | 3.00 | 0.06 | 0.25 |
| Computational HPIR (DH=2/1) | 270 KB | Rich 1.14 / Poor 0.39 | Rich 0.52 / Poor 0.001 | Rich 0.52 / Poor 0.26 |
| RAID-PIR [18] | 540 KB | 0.51 | 0.003 | 0.52 |
| IT HPIR (DH=4/1) | 540 KB | Rich 1.16 / Poor 0.40 | Rich 1.05 / Poor 0.26 | Rich 1.05 / Poor 0.26 |

**Headline asymmetry demonstrated (Abstract / Section VIII-A):**
- 0.2 GB DB, 456 KB file, `DH=4/1`: Rich 1.1 s vs Poor 0.3 s compute; Rich 912 KB vs Poor 228 KB comm. Homogeneous baseline: each server 1.0 s, 456 KB.&#8201;[^1]
- 2 GB DB, 1.4 MB file, `DH=4/1`: Rich 12.5 s vs Poor 4.09 s; Rich 2.8 MB vs Poor 724 KB. Homogeneous baseline (Goldberg): each server 12.04 s, 1.4 MB.&#8201;[^2]
- 2 GB DB, 10.95 MB file, `DH=31/1`: Rich 21.9 MB vs Poor 724 KB download bandwidth; Rich 11.3 MB vs Poor 11.3 MB at `DH=16/16` (homogeneous setting).&#8201;[^35]

[^34]: §VIII (p. 11): "implemented our HPIR protocol in C++, wrapped in Rust… compatible with the Percy++ PIR library… NTL library for big number operations… quad-core i7 CPU @ 3.6 GHz, 32 GB of RAM, Ubuntu 18.04. All of our experiments are single-threaded."
[^35]: §VIII-C (p. 13) and Figure 5 (p. 14).

### Comparison with Prior Work

| Metric | HPIR (DH=4/1, IT) | Goldberg (homogeneous) | Henry et al. (homogeneous) |
|--------|-------------------|--------------------------|------------------------------|
| Min servers `ℓ` | 2 | `t+1 = 2` | `t+q = q+1` (5 for `q=4`) |
| Rich-server compute (2 GB) | 12.5 s | 12.04 s | per-server ~`r²·s` (paper notes this scheme cannot be made HPIR without raising server count) |
| Poor-server compute (2 GB) | **4.09 s** | 12.04 s | n/a |
| Total compute (2 GB) | 16.6 s | 24.08 s | scaled by `ℓ` |
| Rich upload | `2·q·r·w` | `q·r·t·w` (heterogeneous variant inflates `t`) | `r·w` (homogeneous) |
| Poor upload | `2·r·w` (or `2·w` with PRNG) | `q·r·w` (heterogeneous) | n/a |
| Element size | `2w` bits (`mod n`) | `w` bits (`mod p`) | `w` bits |
| Security | IT (or computational w/ PRNG) | IT | IT |

(Sources: Tables III, IV, V, p. 12, 14.)&#8201;[^36]

[^36]: §VII-C and Tables III/IV/V (p. 11–12, 14): communication and computation comparison.

### Key Tradeoffs & Limitations

- **Asymmetry knob `DH = q/1`:** higher `q` → more rich-server load, less poor-server load. For `q=1` HPIR collapses to a (slightly larger-element) homogeneous protocol. Maximum `DH = q/1` is bounded by client tolerance and rich-server provisioning.&#8201;[^37]
- **Element size 2× larger than Goldberg/Henry:** all arithmetic is `mod n` where `n` is `2w`-bit (product of two `w`-bit primes), so each transmitted element is twice the size of the corresponding element in Goldberg's protocol.&#8201;[^29]
- **PRNG variant downgrades to computational security:** sending only a PRNG seed to the poor server is a strict reduction from IT-secure to factoring-secure. The rich server can in principle brute-force the PRNG seed.&#8201;[^38]
- **Homogeneous-version overhead:** when `DH = 1/1`, HPIR is "slightly higher" upload/download than Goldberg and "very close to" Goldberg in compute — the extra cost of the multi-secret-sharing machinery is small even when not exploited.&#8201;[^39]
- **Security depends on prime size when servers fully collude:** with PRNG variant, full collusion reduces to factoring `n`. Paper recommends `n ≥ 2048` bits in that mode.&#8201;[^4]
- **Client computation is `O(s · q²)`:** larger than Goldberg's `O(s)`, but still ≪ server time (e.g., 500 ms vs 12.5 s) — paper argues client cost is "the practical bottleneck" only in homogeneous settings.&#8201;[^33]
- **Database updates / dynamic DB:** not addressed. Multi-server replication assumes synchronised DB across servers; integration with content-publisher-vs-CDN scenarios "requires additional engineering efforts" outside the paper's scope.&#8201;[^40]
- **Honest-but-curious only:** servers that send incorrect/no answer are out of scope (paper notes robustness is a known issue with ITPIR but does not address it).&#8201;[^41]
- **Servers must replicate the entire DB:** standard ITPIR limitation. The "poor" server still stores 100% of the DB, so "poor" really means *bandwidth-and-CPU constrained* during query answering, not *storage constrained*.

[^37]: §VIII (p. 11–12): "Degree of Heterogeneity (DH) … the maximum DH in our protocol is `q/1`, as the client will have `q+1` secret shares to send to the servers."
[^38]: §VII-B "Robustness against colluding servers" (p. 10): "if a PRNG is used for overhead reduction, our protocol's security will change to computational."
[^39]: §VIII-C and Figure 5 (p. 13–14): "the homogeneous version of our protocol imposes computation overheads very close to that of Goldberg's homogeneous protocol."
[^40]: §III "non-trusted" paragraph (p. 5): "integrating HPIR in each of the following scenarios will require additional engineering efforts (e.g., to synchronize the PIR servers), which is out of our scope."
[^41]: §IX (Appendix A) "Robustness" (p. 16) and §III (p. 5): paper assumes honest-but-curious; robustness against malicious or non-responsive servers acknowledged as future work.

### Application Scenarios

The paper targets three motivating applications where one party is naturally rich and the other naturally poor:

1. **Privacy-preserving content delivery (CDNs).** Rich = CDN edge (Fastly); poor = origin server (NYT). NYT's whole business reason for using a CDN is to offload load — homogeneous PIR would defeat that. (§III.A.1, Figure 1, p. 5.)
2. **Private P2P file sharing (Spotify, BitTorrent).** Rich = nearby seeder with high bandwidth; poor = distant seeder with low bandwidth. (§III.A.2, p. 5.)
3. **Query privacy in cache networks (NDN/PSIRP/MobilityFirst).** Rich = upstream router/publisher; poor = client's edge router (gateway). (§III.A.3, p. 5–6.)

In all three the asymmetry is *natural* and existing homogeneous PIR is unsuitable.

### Implementation Notes
- **Language / Library:** C++ wrapped in Rust; built to be drop-in compatible with the Percy++ PIR library (`Reference [43]`); uses NTL for big-integer modular arithmetic.&#8201;[^34]
- **Polynomial arithmetic:** schoolbook `O(q²)` Lagrange interpolation; matrix multiplication is `O(n³)` (Strassen `O(n^{2.8})` for large `q`).&#8201;[^32]
- **CRT decomposition:** N/A — uses CRT-style decomposition implicitly via `mod n = p₁p₂` in the *complete* version, but no per-prime parallel arithmetic.
- **SIMD / vectorization:** none mentioned.
- **Parallelism:** single-threaded for benchmarks (paper notes server matrix-mul is "highly parallelizable" but does not exploit it).&#8201;[^34]
- **Open source:** `https://github.com/SPIN-UMass/HPIR`&#8201;[^42]

[^42]: §II-Summary (p. 3): code link.

### Open Problems (stated by authors)
- Robustness against malicious servers (incorrect or non-responsive).&#8201;[^41]
- DB synchronisation across servers in real-world deployments (e.g., NYT ↔ Fastly).&#8201;[^40]
- Multi-threaded / GPU-accelerated implementation (server matmul is embarrassingly parallel).
- Heterogeneous extension to >2 servers with finer-grained asymmetry profiles (paper sketches a 3-server `(3,1,6)` example but does not benchmark).&#8201;[^43]

[^43]: §V (p. 7): "consider a three-server setting, where the three servers plan to handle 30%, 10%, and 60% of the overall communication/computation overheads… normalized resources of the three servers are 3, 1, 6, respectively."

### Uncertainties
- The Abstract reports a `0.2 GB` headline (`456 KB` file, `1.1s/0.3s`), while §II-Summary and §VIII-A use a `2 GB` headline (`1.4 MB` file, `12.5s/4.09s`). Both are consistent with the asymptotics (`r² ∝ N`, `s ∝ √N`); recorded both.
- The "complete version" eliminates `q-2` of the primes (keeps only `p₁, p₂`), but the rich server's compute is still `O(q · r² · s)` — Table IV confirms `O(q·r²·s)` for the rich server. The paper does not split out arithmetic-cost-per-prime vs number-of-share-rows; both contribute to the rich server's `q×` factor.
- §VII-A "Communication Costs" gives `2·q·r·w` for the rich client→server upload (complete version), while Table III lists `2·(q+1)·r·w`. The off-by-one stems from whether the `q+1`-th share row is counted toward the rich or poor side; in the algorithm pseudocode (P6/P7) the poor server gets the `q+1`-th column. Reported `2·q·r·w` per the algorithm.
- "Element size is `2w` bits" assumes both primes are `w` bits. If primes are `> 2^w` (strictly, paper says `> 2^w`), elements are slightly more than `2w` bits — close enough for asymptotic statements.
