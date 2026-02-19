# Group X — Keyword, Symmetric & Distributional PIR

### CGKS Survey (2004)

The CGKS Survey is a pedagogical survey, not a single-scheme construction. Its core comparison tables are:

**Information-Theoretic PIR Upper Bounds:**

| Tool / Technique | 2-DB | 3-DB | 4-DB | k-DB (general) |
|------------------|------|------|------|----------------|
| kth root (XOR + bit arrays) | no PIR | no PIR | n^{1/2} | k * n^{1/lg k} |
| Covering codes | n^{1/3} | no PIR | n^{1/4} | (k lg k) n^{1/(lg k + lg lg k)} |
| Polynomial interpolation | n^{1/2} | n^{1/3} | n^{1/4} | (k^2 log k) n^{1/k} |
| Recursion (Ambainis) | n^{1/3} | n^{1/5} | n^{1/7} | 2^{k^2} n^{1/(2k-1)} |
| Linear algebra (Ishai-Kushilevitz) | n^{1/3} | n^{1/5} | n^{1/7} | k^3 n^{1/(2k-1)} |
| Poly-heavy (Beimel et al.) | n^{1/3} | n^{1/5.25} | n^{1/7.87} | n^{O(lg lg k / k lg k)} |

**Computational PIR Schemes:**

| Scheme | Assumption | # DBs | Communication |
|--------|-----------|-------|---------------|
| Kushilevitz-Ostrovsky | QR hardness | 1 | O(n^{1/2+delta}) |
| Cachin et al. | phi-hiding | 1 | O((lg n)^a) (polylog) |
| Chor-Gilboa | One-way functions | 2 | O(n^epsilon) |
| Kushilevitz-Ostrovsky | One-way trapdoor permutations | 1 | n - o(n) |
| Stern / Mann | Homomorphic encryption | 1 | n^epsilon |

### KeywordPIR (2019)

**SealPIR variants and MulPIR (d=2, n=2^20, 288B entries):**

| Metric | SealPIR | Optimized SealPIR | MulPIR (d=2) | Phase |
|--------|------------|-------------------|-------------|-------|
| Upload size | 61.4 kB | 15.4 kB | 122 kB | Online |
| Download size | 307 kB | 128 kB | 122 kB | Online |
| Total communication | 368.4 kB | 143.4 kB | 244 kB | Online |
| Client Query (ms) | 19 | 19 | 172 | Online |
| Server Expand (ms) | 145 | 294 | 391 | Online |
| Server Response (ms) | 1,020 | 590 (approximate) | 1,919 | Online |
| Server Cost (US cents) | 0.0040 | 0.0028 (approximate) | 0.0026 | Online |

**Gentry-Ramzan (5,000 entries of 288B, no recursion):**

| Metric | GR (1 gen.) | Client-Aided GR (15 gen.) | Client-Aided GR (50 gen.) | Client-Aided GR (100 gen.) |
|--------|------------|---------------------------|---------------------------|----------------------------|
| Upload (kB) | 0.5 | 4.1 | 13.1 | 25.8 |
| Download (kB) | 1.3 | 1.3 | 1.3 | 1.3 |
| C.Setup (ms) | 1,532 | 1,540 | 1,594 | 1,796 |
| S.Setup (ms) | 3,294 | 2,688 | 3,966 | 7,980 |
| S.Respond (ms) | 51,803 | 5,495 | 2,988 | 2,904 |
| Server Cost (US cents) | 0.0145 | 0.0016 | **0.0011** | 0.0014 |

### DistributionalPIR (2025)

| Metric | Asymptotic | Concrete (CrowdSurf: 38 GB Twitter DB, B=24, kappa_avg=0.8, kappa_worst=0.01) | Phase |
|--------|-----------|---------------------------------------|-------|
| Expected server time | O-tilde(k*(1-kappa_worst) + N*kappa_worst) | 0.004 s GPU + negligible CPU (PIR portion) | Online |
| Expected communication | k*log N + C(k)*(1-kappa_worst) + C(N)*kappa_worst | 21 MB total per request | Online |
| Client storage | O(popular DB indices + hint) | 65 MB (hint) per client | Setup (reusable) |
| Server storage | O(N + k) (two encoded databases) | 38 GB + 15 MB popular bucket | Setup |
| Queries per second (SimplePIR, B=24) | -- | 10-195x more than no-batching baseline | Online |
| Queries per second (Respire, B=16-64) | -- | 6.7-12.8x more than no-batching baseline | Online |
| Per-request dollar cost | -- | $0.0057 (CrowdSurf) vs. $0.046 (batch-PIR baseline) = 8x cheaper | Online |
