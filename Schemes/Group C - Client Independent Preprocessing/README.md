## Group C — Client-Independent Preprocessing

#### SimplePIR/DoublePIR (2022)

| Metric | Asymptotic | Concrete (SimplePIR, 1 GB DB, 1-bit entries) | Concrete (DoublePIR, 1 GB DB, 1-bit entries) | Phase |
|--------|-----------|---------------------------------------------|----------------------------------------------|-------|
| Query size (upload) | O(sqrt(N)) elements in Z_q | 120 KB | 345 KB | Online |
| Response size (download) | O(sqrt(N)) elements in Z_q (SimplePIR); O(kappa * (2n+1)) (DoublePIR) | 120 KB | 345 KB | Online |
| Server computation (online) | 2N operations in Z_q (SimplePIR); 2N + 2(2n+1) * sqrt(N) * kappa (DoublePIR) | — | — | Online |
| Client computation | O(n) per query (key generation + inner product) | < 1 ms | approximately 100 ms (1 GB DB) | Online |
| Throughput | Limited by memory bandwidth | 10.0 GB/s/core | 7.4 GB/s/core | Online |

#### VeriSimplePIR (2024)

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|----------|-------|
| Online query size | O(m * log(q)) = O(sqrt(N) * log(q)) | Same as SimplePIR | Online |
| Online answer size | O(ell * log(q)) = O(sqrt(N) * log(q)) | 1.1-1.5x SimplePIR | Online |
| Online server computation | O(N) (matrix-vector multiply D*u) | Essentially identical to SimplePIR | Online |
| Online client computation | O(sqrt(N)) for Query + O(sqrt(N)) for Verify (PreVerify is Zu = Cv check) + O(sqrt(N)) for Recover | 12-40% overhead vs SimplePIR (Verify step) | Online |
| Offline communication (digest) | O(ell * n * log(q)) for H_1 + O(lambda * m * log(q)) for Z matrices | Dominated by H_1; ~95% of total offline storage. ~2-14 GiB for 4-256 GiB databases (Figure 8) | Offline (once) |
| Offline server computation (preprocessing) | O(N * lambda) (D^T * U, lambda encryptions evaluated) | ~100s for 4 GiB DB, ~200s for 8 GiB DB (single core, dishonest digest) | Offline (once per client) |
| Offline client computation (preprocessing) | O(lambda * n) (lambda LWE encryptions) | Small relative to server | Offline (once per client) |
| Client persistent storage | O(ell * n * log(q) + lambda * ell + lambda * m) for (H_1, C, Z) | ~800 MiB for password-leak application (400M entries) | Throughout |

#### BarelyDoublyEfficient (2025)

| Metric | Asymptotic | Concrete | Phase | Source |
|--------|-----------|----------|-------|--------|
| Preprocessing runtime | O-tilde(N^{1+epsilon}) * poly(lambda) | N/A (no implementation) | Offline | Theorem 3.1 (author-stated) |
| Server's online runtime | O(N / (epsilon * log N)^2) * polyloglog(N) * poly(lambda) | N/A (no implementation) | Online | Theorem 3.1 + footnote 4 (author-stated) |
| Client's online runtime | O-tilde(sqrt(N)) * poly(lambda) | N/A (no implementation) | Online | Theorem 3.1 (author-stated) |
| Online communication | O-tilde(sqrt(N)) * poly(lambda) | N/A (no implementation) | Online | Theorem 3.1 (author-stated) |
| CRS size | O(m * n * log q) = O-tilde(sqrt(N)) * poly(lambda) | N/A (no implementation) | Setup | Corollary 3.1 proof (inferred) |

#### IncrementalPIR (2026)

**Core metrics (online -- identical to SimplePIR):**

| Metric | Asymptotic | Concrete (1GB DB, 1-bit entries) | Phase |
|--------|-----------|----------------------------------|-------|
| Query size | O(sqrt(N) * log q) | 240 KB | Online |
| Response size | O(sqrt(N) * log q) | 240 KB | Online |
| Server computation | O(N) | 95 ms | Online |
| Throughput | O(N / t_server) | 10.5 GB/s | Online |
| Client computation (Query) | O(n) | Negligible (included in online) | Online |
| Client computation (Recover) | O(n) | Negligible | Online |

**Preprocessing metrics (Group C):**

| Metric | Asymptotic | Concrete (1GB DB, 1% col-major) | Phase |
|--------|-----------|--------------------------------|-------|
| Preprocessing computation (entry-level) | O(nM) per M modified entries | 0.77 s | Offline |
| Preprocessing computation (row-level) | O(n * sqrt(N) * M_r) per M_r modified rows | 172.45 s | Offline |
| Preprocessing communication (entry-level) | O(M * (log p + log sqrt(N))) per entry, or O(n * log q + log sqrt(N)) per row-aggregated | 28.50 MB | Offline |
| Preprocessing communication (row-level) | O(M_r * n * log q) per M_r modified rows | 120.75 MB | Offline |
| Hint size (client storage) | sqrt(N) * n * log q bits | 241 MB (for 4GB password DB) | Stored |
| Amortization window | Per-entry (real-time) or per-row (when M' > t in a row) | t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))) | -- |
