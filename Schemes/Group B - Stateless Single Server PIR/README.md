## Group B — Stateless Single-Server PIR

#### HintlessPIR (2023)

| Metric | Asymptotic | Concrete (2^30 x 1B = 1.07 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(sqrt(m) + n) | 453 KB | Online |
| Response size | O(sqrt(m) + n) | 3080 KB | Online |
| Server computation | nm + O_tilde(sqrt(m) * n) | 613 ms (single-thread) | Online |
| Client computation | -- | 51.00 ms | Online (recovery) |
| Throughput | -- | 1750 MB/s (single-thread) | Online |
| Response overhead | O(1) constant factor > SimplePIR | ~33x (current impl); ~9x with optimizations | -- |

#### YPIR (2024)

| Metric | Asymptotic | Concrete (32 GB, 1-bit records) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(sqrt(N) * log q / log p + d * log d * log q) | 724 KB (upload) | Online |
| Response size | O(d^2 * kappa * log q-hat / d2) | 32 MB (download) | Online |
| Server computation | O(N * d) | 2.64 s | Online |
| Client computation | -- | Negligible (decryption + rounding) | Online |
| Throughput | O(M) where M = memory bandwidth | 12.1 GB/s/core | Online |
| Response overhead | -- | 32 MB / 32 GB = 0.001x (response independent of DB size) | -- |

#### Respire (2024)

| Metric | Concrete (256 MB, 2^20 x 256B) | Concrete (1 GB, 2^22 x 256B) | Concrete (8 GB, 2^25 x 256B) | Phase |
|--------|-------------------------------|-------------------------------|-------------------------------|-------|
| Query size | 4.1 KB | 7.7 KB | 14.8 KB | Online |
| Response size | 2.0 KB | 2.0 KB | 2.0 KB | Online |
| Server computation | 1.26 s | 3.48 s | 20.84 s | Online |
| Throughput | 204 MB/s | 295 MB/s | 393 MB/s | Online |
| Offline communication | 3.9 MB | 3.9 MB | 3.9 MB | Offline (per client) |

#### WhisPIR (2024)

| Metric | Concrete (benchmark params) | Phase |
|--------|---------------------------|-------|
| Query size (upload) | ~10--30 KB (depends on B, w) (approximate, from Figure 2) | Online |
| Response size (download) | ~200--1200 KB (depends on p, chunks, k) (approximate, from Figure 1) | Online |
| Total communication | ~300--3000 KB (approximate, from Figures 2, 4) | Online |
| Server computation | ~0.5--30 s single-threaded (approximate, from Figures 2, 4; varies with DB size and param settings) | Online |
| Client computation | "A few dozen milliseconds regardless of the database size" (key generation, encryption, decryption) | Online |

#### Pirouette (2025)

| Metric | Asymptotic | Concrete (2^25 x 256 B = 8 GB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(log q) = O(1) w.r.t. N | 36 B (Pirouette) / 60 B (Pirouette^H) | Online |
| Response size | O(N_1 * log Q_1) | ~2 KB | Online |
| Server computation (seq.) | O(N) | 60 s (Pirouette) / 55 s (Pirouette^H) | Online |
| Throughput (seq.) | -- | 137 MB/s (Pirouette) / 148 MB/s (Pirouette^H) | Online |
| Throughput (32-core par.) | -- | 585 MB/s (Pirouette full par.) / 178 MB/s (Pirouette^H par. Phase 0) | Online |

#### InsPIRe (2025)

| Metric | Asymptotic (InsPIRe) | Concrete (1 GB, 64 B entries) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | (N/t)*log_2(q) + (d*ell_ks + 4*ell_gsw*d + 2*d)*log_2(q) | 196 KB upload (query) + 84 KB upload (keys) | Online |
| Response size | 2*d*log_2(q) | 12 KB | Online |
| Total communication | d*ell_ks*log_2(q) + (N/t)*log_2(q) + 4*ell_gsw*d*log_2(q) + 2*d*log_2(q) (Theorem 12) | 292 KB | Online |
| Server computation | O(N*d + t*ell_ks*d^2 + t*ell_gsw*d*lg(d)) online | 960 ms (online server time) | Online |
| Throughput | -- | 1006 MB/s (1 GB, 64 B entry) | Online |

#### NPIR (2025)

| Metric | Asymptotic | Concrete (32 KB records, 8 GB DB) | Phase |
|--------|-----------|----------------------------------|-------|
| Query size | O(N * log q * (1 + t_g)) | 84 KB | Online |
| Response size | O(N * phi * log q_1) | 128 KB | Online |
| Server computation | O(N * ell * phi) multiplications + O(phi) packing ops | 14.87 s | Online |
| Client computation | O(1 + t_g) encryptions + O(phi) decryptions | 1.62 ms | Online |
| Throughput | -- | 550.91 MB/s | Online |
| Response overhead | O(1) | 4x (128 KB / 32 KB) | -- |

#### VIA (2025)

| Metric | Asymptotic | Concrete (32 GB) | Phase |
|--------|-----------|-------------------|-------|
| **VIA** | | | |
| Query size | O_lambda(log N) | 674.75 KB | Online |
| Response size | O_lambda(1) | 15.5 KB | Online |
| Server computation | O_lambda(N) | 10.286 s | Online |
| Throughput | -- | 3.11 GB/s | Online |
| **VIA-C** | | | |
| Query size | O_lambda(log N) | 0.659 KB | Online |
| Response size | O_lambda(1) | 1.439 KB | Online |
| Server computation | O_lambda(N) | 20.307 s | Online |
| Throughput | -- | 1.58 GB/s | Online |
| Offline communication | O_lambda(1) | 14.8 MB up | Offline (once) |
| Offline computation | O_lambda(N) | 67.539 s | Offline (once) |
| **VIA-B (T=256, 1 GB, 1-byte records)** | | | |
| Query size | -- | 145.31 KB | Online |
| Response size | -- | 1.81 KB | Online |
| Offline communication | -- | 14.8 MB up | Offline (once) |
