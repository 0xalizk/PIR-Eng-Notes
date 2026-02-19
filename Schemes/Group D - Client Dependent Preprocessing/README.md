# Group D — Client-Dependent Preprocessing

### CK20 (2019)

| Metric | Asymptotic | Concrete | Phase |
|--------|-----------|---------|-------|
| Online query size | O(lambda * kappa_p) where kappa_p = O(lambda log n) for PRF-based construction | N/A (no implementation) | Online |
| Online response size | lambda bits (lambda parallel instances, 1 bit each) | N/A (no implementation) | Online |
| Online server computation | O-tilde_lambda(sqrt(n)) | N/A (no implementation) | Online |
| Client online computation | O-tilde(s(n) + n/s(n)) * poly(lambda) = O-tilde_lambda(sqrt(n)) | N/A (no implementation) | Online |

### IncPIR (2021)

| Metric | Asymptotic | Concrete (N=2^20, b=32B) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(sqrt(n) * log(n')) | 8.18 KB | Online |
| Response size | O(b) | 2 KB (optimal) | Online |
| Server computation (online) | O(sqrt(n)) XORs | < 0.1 ms | Online |
| Client computation (query) | O(sqrt(n) * log(n)) PRP evals | 7.87 ms | Online |
| Refresh communication | O(sqrt(n) * log(n')) | 8.18 KB | Online |

### Piano (2023)

| Metric | Asymptotic | Concrete (100 GB, n = 1.68 * 10^9, 64-byte entries) | Phase |
|--------|-----------|------------------------------------------------------|-------|
| Query size (upload) | O(sqrt(n)) | 100 KB | Online |
| Response size (download) | O(1) | 64 bytes (one entry) | Online |
| Server computation | O(sqrt(n)) | 11.9 ms | Online |
| Client computation | O_lambda(sqrt(n)) expected | 11.9 ms (dominated by hint search: O(sqrt(n)) PRF evaluations) | Online |
| Client storage | O_lambda(sqrt(n) log kappa alpha(kappa)) | 839 MB | Persistent |

### TreePIR (2023)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (to each server) | O(lambda * log N) | ~2 KB (at N = 2^32) | Online |
| Response size (per server) | O(sqrt(N) * w) | 16.6 KB (N=2^32, w=1 bit) | Online |
| Server computation (each server) | O(sqrt(N) * log N) | ~1754 ms per server (amortized, N=2^32, w=1 bit) | Online |
| Client computation | O(sqrt(N)) probabilistic; O(sqrt(N)) deterministic with shift | <1 ms | Online |
| Total online bandwidth | O(sqrt(N)) (base); O(polylog N) (with DDH recursion) | 16.6 KB (base, N=2^32, w=1); 50 KB (with SPIRAL) | Online |

### RMS24 (2023)

| Metric | Asymptotic | Concrete (2^28 entries x 32 bytes = 8 GB) | Phase |
|--------|-----------|-------------------------------------------|-------|
| Query size (request) | O(sqrt(N) * log N) bits | 34 KB (two-server); 34 KB (single-server) | Online |
| Response size | O(w) -- constant (two-server); O(w) per query (single-server) | 64 bytes (two parities, w=32) | Online |
| Server computation | O(sqrt(N)) | 2.7 ms (two-server); 2.7 ms online (single-server) | Online |
| Client computation | O(sqrt(N)) | < 1 ms (finding hint + subset construction) | Online |
| Response overhead | 2x insecure baseline (two-server); 4x (single-server) | 2x (two-server); 4x (single-server) | -- |

### IshaiShiWichs (2024)

Construction 2: Sublinear Server Computation (Theorem 4.4/A.3)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Response size (online bandwidth) | O_tilde(n^{1/3}) | N/A (no implementation) | Online |
| Server computation | O_tilde(n^{2/3}) | N/A (no implementation) | Online |
| Client computation | O_tilde(n^{1/2}) | N/A (no implementation) | Online |
| Offline bandwidth | O_tilde(n^{1/2}) | N/A (no implementation) | Per query (amortized) |
| Client space | O_tilde(n^{2/3}) | N/A (no implementation) | -- |

### Plinko (2024)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query upload (communication) | O-tilde(n/r) bits | N/A (no implementation) | Online |
| Response (communication) | O-tilde(n/r) bits | N/A (no implementation) | Online |
| Server computation | O-tilde(n/r) | N/A (no implementation) | Online |
| Client computation (query) | O-tilde(n/r) | N/A (no implementation) | Online |
| Total query time (client + server) | O-tilde(n/r) | N/A (no implementation) | Online |

### SinglePass (2024)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size (total, both servers) | O(Q * w) | 0.68 KB (3M x 32B DB, Q=10) | Online |
| Response size (total, both servers) | O(Q * w) | (same order as query) | Online |
| Server computation | O(Q) per server (Q lookups) | -- | Online |
| Client computation (Query) | O(Q) | 0.02 ms | Online |
| Client computation (Reconstruct) | O(Q * w) | -- | Online |

### WangRen (2024)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | O(T log n) bits | N/A (no implementation) | Online |
| Response size | O(Tw) bits | N/A (no implementation) | Online |
| Server computation | O(T) accesses to w-bit entries | N/A (no implementation) | Online |
| Client computation | O(T) XORs of w-bit entries + O(T) small-domain PRP calls | N/A (no implementation) | Online |
| Amortized communication | O(Tw + T log n) bits per query | N/A (no implementation) | Online + amortized preprocessing |
