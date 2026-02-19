## Group X — Extensions

#### KeywordPIR (2019)

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

#### DistributionalPIR (2025)

| Metric | Asymptotic | Concrete (CrowdSurf: 38 GB Twitter DB, B=24, kappa_avg=0.8, kappa_worst=0.01) | Phase |
|--------|-----------|---------------------------------------|-------|
| Expected server time | O-tilde(k*(1-kappa_worst) + N*kappa_worst) | 0.004 s GPU + negligible CPU (PIR portion) | Online |
| Expected communication | k*log N + C(k)*(1-kappa_worst) + C(N)*kappa_worst | 21 MB total per request | Online |
| Client storage | O(popular DB indices + hint) | 65 MB (hint) per client | Setup (reusable) |
| Server storage | O(N + k) (two encoded databases) | 38 GB + 15 MB popular bucket | Setup |
| Queries per second (SimplePIR, B=24) | -- | 10-195x more than no-batching baseline | Online |
| Queries per second (Respire, B=16-64) | -- | 6.7-12.8x more than no-batching baseline | Online |
| Per-request dollar cost | -- | $0.0057 (CrowdSurf) vs. $0.046 (batch-PIR baseline) = 8x cheaper | Online |
