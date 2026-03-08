## Excluded Schemes

Impracticality and/or multiserver --> excluded.

### BarelyDoublyEfficient (2025)

**Why excluded:** This is a "galactic algorithm" — the first DEPIR construction from plain LWE, achieving server computation O(N / log^2 N). However, every asymptotic bound carries `poly(lambda)` and `polyloglog(N)` factors derived from Williams' technique for batch matrix multiplication. These hidden constants are enormous and uncharacterized; no concrete parameter instantiation is provided in the paper. Even order-of-magnitude estimation is not feasible.


### IshaiShiWichs (2025)

**Why excluded:** The paper's main results include 2-server variants (Theorem B.1), which fall outside this project's single-server scope. The single-server variant (Theorem 4.4) is an information-theoretic construction with O~(n^{2/3}) server time and O~(n^{1/3}) communication, but the construction uses combinatorial set systems whose concrete constants are not analyzed. The paper's primary contribution is foundational (proving OWF/SZK lower bounds for breaking the sqrt(n) barrier), not practical. No implementation exists or is likely feasible with current techniques.
