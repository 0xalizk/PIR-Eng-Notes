## Group A — FHE-Based PIR

#### XPIR (2014)

| Metric | Asymptotic | Concrete (benchmark params) | Phase | Confidence |
|--------|-----------|---------------------------|-------|------------|
| Query size (Bundled) | O(alpha log N) | 32 KB (d=5, N=2^32, epsilon=1024) | Online | exact |
| Query size (Single) | O(alpha log N) | 32 MB (d=5, N=2^32) | Online | exact |
| Response size (Bundled) | O(alpha) | 784 KB (d=5, N=2^32) | Online | exact |
| Response size (Single) | O(alpha) | 784 KB (d=5, N=2^32) | Online | exact |
| Per-query bandwidth (Bundled, normalized by epsilon) | O(alpha log N / epsilon) | ~32 KB query + ~0.77 KB response per retrieval (d=5) | Online | inferred |
| Server computation per row (Bundled, d=5) | — | 4.45 ms index comparison + 0.22 ms data aggregation = 4.67 ms total | Online | exact |
| Server computation per row (Single, d=5) | — | 4.56 ms index comparison + 37 ms data aggregation = 41.56 ms total | Online | exact |

#### XPIR (2016)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(d * n^{1/d} * F * l_0) where F = expansion factor | d=1: n * 128 Kbit (1024,60) or n * 512 Kbit (2048,120); d=2: 2*sqrt(n) * ciphertext_size | Online |
| Response size | O(F^d * l) | F^d * l where F ~= 5-6 | Online |
| Server computation | O(n * l) — linear scan of entire database | 18-22 Gbit/s throughput (pre-processed static); ~5 Gbit/s (dynamic) | Online |
| Client computation (query gen) | O(d * n^{1/d}) encryptions | 700–850 Mbit/s | Online |
| Client computation (decryption) | O(d * l / l_0) decryptions | 710 Mbit/s – 5 Gbit/s depending on modulus | Online |
| Throughput (user-perceived) | Depends on n, d, bandwidth | ~15/n Gbit/s for d=1 (approximate, from Figure 6) | Online |

#### SealPIR (2018)

| Metric | Asymptotic | Concrete (N=2^20, d=2, 288B elements) | Phase |
|--------|-----------|---------------------------------------|-------|
| Query size | O(d * ceil(N^{1/d} / N_ring) * \|ct\|) | 64 KB | Online |
| Response size | O(F^{d-1} * \|ct\|) | 256 KB | Online |
| Server computation (Expand) | O(d * N^{1/d}) substitutions | 0.11 s | Online |
| Server computation (Answer) | O(N) plaintext-ct multiplications | 0.5 s | Online |
| Server computation (total) | O(N + d*N^{1/d}) | 1.65 s (Setup + Expand + Answer) | Online |
| Client computation (Query) | O(d) encryptions | 3.37 ms | Online |
| Client computation (Extract) | O(F^{d-1}) decryptions | 1.39 ms | Online |
| Response overhead | F^{d-1} | F = approximately 5-12 depending on t'; for d=2, 1 ciphertext response | -- |

#### MulPIR (2019)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(N_1 * n'_1 * m'_1 * d * log Q) | Section 5: ~198 MB; Appendix A (online): ~26 MB; Appendix A (with key-switching gadgets): ~209 MB total | Online (upload) |
| Response size | O(L * n'_1 * n'_2 * d * log q) | ~(9/4) * plaintext size (rate 4/9 approximately 0.44) | Online (download) |
| Server computation | Õ(log log λ + log log log N) per bit of DB | Section 5: ~2.3 mod-q multiplications per byte; Appendix A: ~1.8 mod-q multiplications per byte | Online |
| Client computation | Encryption + decryption | N/A (no implementation) | Online |
| Communication rate | 1 - epsilon for any epsilon > 0 (asymptotic, requiring bootstrapping) | 4/9 approximately 0.44 (concrete, without bootstrapping) | -- |
| Response overhead | O(1) | 2.25x vs non-private (i.e., rate 0.44 means 1/0.44 approximately 2.27x expansion) | -- |

#### OnionPIR (2021)

| Metric | Asymptotic | Concrete (N = 10^6, 30 KB entries) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(1) ciphertexts (single BFV ct) | 64 KB | Online |
| Response size | O(1) ciphertexts (single BFV ct) | 128 KB | Online |
| Server computation | O(N) polynomial multiplications | ~101 s (N = 2^18) | Online |
| Client computation | Encrypt + decrypt (negligible) | Not reported separately | Online |
| Response overhead (F) | 2 log q / log t | 4.2x | — |

#### Addra/FastPIR (2021)

| Metric | Asymptotic | Concrete (n=32,768, m=96B) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(n/N) ciphertexts = O(n) | 1,024 KiB (FastPIR, d=1) | Online (amortized over subrounds) |
| Response size | 1 ciphertext | 64 KiB | Per subround |
| Server Answer time | O(n * m) scalar-ciphertext multiplications + O(m) rotations | 398 ms per worker (32K users, 80 workers) | Per subround |
| Client Query time | O(n/N) encryptions | 1.4 ms | Once per round |
| Client Decode time | 1 decryption + O(1) rotations | 0.36 ms | Per subround |

#### CwPIR (2022)

| Metric | Asymptotic | Concrete (k=2, n=16384, 1 plaintext payload) | Phase |
|--------|-----------|----------------------------------------------|-------|
| Query size (upload) | O(k-th root of (k! * n) + k) bits, mapped to ciphertexts | 216 KB | Online |
| Response size (download) | s ciphertexts (s = number of payload plaintexts) | 106 KB | Online |
| Server computation (total) | n * k * M + n * s * PM (selection vector + inner product) | 9.7 s (n=256, single-thread) to 2500 s (n=65536, single-thread); 0.8-640 s parallelized | Online |
| Multiplicative depth | ceil(log_2 k) (for equality operator) | 1 (k=2), 2 (k=3 or 4) | -- |
| Expansion factor (F) | 2 log q / log t (standard BFV) | Not explicitly stated; N=8192 default modulus | -- |

#### Spiral (2022)

| Metric | Asymptotic | Concrete (2^18 x 30KB, 7.9 GB) | Concrete (2^14 x 100KB, 1.6 GB) | Phase |
|--------|-----------|-------------------------------|--------------------------------|-------|
| Query size | O(d log q) | 14 KB | 14 KB | Online |
| Response size | O(dn^2 log q_1 + dn log q_2) | 84 KB | 242 KB | Online |
| Server computation | O(N * n^2(n+1) * d) | 24.52 s | 4.92 s | Online |
| Client computation (Setup) | O(d * rho * n^2 * m) | ~700 ms | ~700 ms | Offline (once) |
| Client computation (Query) | O(d) | ~30 ms | ~30 ms | Per query |
| Client computation (Extract) | O(dn^2) | < 1 ms | < 1 ms | Per query |
| Public parameter size | O(d * n^2 * m * rho) | 18 MB | 17 MB | Offline (once) |
| Rate | n^2 log p / (n^2 log q_1 + n log q_2) | 0.3573 | 0.1969 | -- |
| Throughput | -- | 322 MB/s | 114 MB/s | -- |

#### FrodoPIR (2022)

| Metric | Asymptotic | Concrete (m = 2^20, w = 1 KB) | Phase |
|--------|-----------|-------------------------------|-------|
| Query size | O(m * log(q)) | 4096 KB (4 MB) | Online |
| Response size | O(omega * log(q)) | 3.556 KB | Online |
| Server computation | O(m * omega) mults | 825.37 ms | Online |
| Client query computation | O(1) (single vector add) | 0.34 ms | Online |
| Client output computation | O(omega) | 0.43 ms | Online |
| Response overhead | < 3.6x | 3.556x (over 1 KB element) | -- |
| Throughput | O(m * w / server_time) | ~1.27 GB/s | Online |

#### ThorPIR (2024)

| Metric | Asymptotic | Phase |
|--------|-----------|-------|
| Preprocessing depth | O_λ(1) | Offline |
| Offline bandwidth | O(N^{2/3}) | Offline |
| Preprocessing time (client) | O_λ(N) (decryption) | Offline |
| Preprocessing time (server) | O_λ(N) (FHE computation) | Offline |
| Online query + answer time (client) | O_λ(Q) | Online |
| Online bandwidth | O(N^{1/3}) per query | Online |
| Online server time | O(Q) per query | Online |
| # queries per epoch | N^{1/3} (for Q = T = N^{1/3}) | -- |
| Client storage | O(N^{2/3}) | Persistent |
| Update time | O_λ(1) per element update | Online |

#### OnionPIRv2 (2025)

| Metric | Asymptotic | Concrete (n=2048, ~1 GB DB) | Concrete (n=4096, ~8 GB DB) | Phase |
|--------|-----------|---------------------------|---------------------------|-------|
| Query size | O(n log q) | 16 KB | 64 KB | Online |
| Response size | O(n log q') | 13.5 KB | 57 KB | Online |
| Response overhead | O(log q' / log t) | 3.6x | 2.53x | — |
| Server computation | O(N * n * log q / log t) | ~0.8 s (0.9 GB) | ~6.9 s (7.5 GB) | Online |
| Throughput | — | 1109 MB/s | 1098 MB/s | Online |
| Per-client server storage | — | 0.63 MB | 2.9 MB | Persistent |
