## Benchmarks Setup — Progress Log

### Completed

1. **Directory scaffold created** — all folders and files in place:
   ```
   benchmarks/
     README.md
     PLAN.md (this file)
     implementations/              # gitignored — cloned repos
       README.md
     replication_benchs/
       README.md
       <scheme>/run_notes.md
     standardized_benchs/
       README.md
       <scheme>/run_notes.md
   ```

2. **README.md written** — setup instructions, parameter tables, conventions, caveats

3. **.gitignore updated** — added `benchmarks/implementations/*/`

4. **Repos cloned:**
   - `S3PIR` from `github.com/renling/S3PIR`
   - `rms24-plinko-spec` from `github.com/keewoolee/rms24-plinko-spec`

5. **S3PIR explored:**
   - **CLI:** `./build/s3pir --one-server <Log2 DB Size> <Entry Size> <Output File>`
   - **Output:** CSV with columns: Variant, Log2 DBSize, EntrySize(Bytes), NumQueries, Offline Time (s), Online Time (ms), Amortized Compute Time Per Query (ms)
   - **No threading** — entirely single-threaded, no OpenMP/pthreads/std::thread
   - **Makefile uses `g++`** — on macOS this maps to Apple Clang (arm64), should work
   - **Links `-lcryptopp`** directly in CXXFLAGS (unusual but functional)
   - **`-DSimLargeServer`** builds a variant that simulates large DBs with <0.5 GB RAM (useful for 64 GB configs)
   - **benchmark.sh** tiers: SMALL (R1-R2, ~3 min), LARGE (R1-R4, ~1.25h), FULL (R1-R5, ~2.5h)
   - Both `--one-server` and `--two-server` variants benchmarked per config

6. **Python spec explored:**
   - Modules: `pir.rms24`, `pir.plinko`, `pir.keyword_pir`, `pir.primitives`
   - Has `demo.py` at root, `tests/` directory, `requirements.txt`
   - Not yet checked if it imports/runs cleanly

7. **CryptoPP installed** — `brew install cryptopp` → CryptoPP 8.9.0 at `/opt/homebrew/`

8. **S3PIR built** — `make CXX="g++ -I/opt/homebrew/include -L/opt/homebrew/lib"`
   - Builds both `s3pir` and `s3pir_simlargeserver`
   - Warnings only (VLA extensions, deprecated `-Ofast`), no errors

9. **SMALL replication run (R1–R2):**
   - One-server: R1 offline 4.53s / online 0.19ms, R2 offline 73.71s / online 0.79ms
   - Two-server: R1 offline 2.86s / online 0.19ms, R2 offline 51.62s / online 0.81ms
   - Logged in `rms24_2024/replication_benchs/run_notes.md`

10. **Standardized S1 configs (1 GB tier):**
    - S1-32 (2^25 × 32B): offline 155.40s, online 1.25ms/q, amortized 2.20ms/q
    - S1-64 (2^24 × 64B): offline 81.00s, online 0.87ms/q, amortized 1.36ms/q
    - S1-256 (2^22 × 256B): offline 22.29s, online 0.54ms/q, amortized 0.82ms/q
    - Logged in `rms24_2024/standardized_benchs/run_notes.md`

11. **Python specs verified:**
    - Dependencies: `uv pip install -r requirements.txt` (just pytest)
    - Test suite: 132/132 pass (2 min 17s)
    - **RMS24 spec:** Correctness verified at 2^14 for 32B/64B/256B entries (lambda=128)
    - **Plinko spec:** Correctness verified at n=100–1024 with lambda=40 only. Default lambda=128 is infeasible even at n=256 — offline phase >120s due to per-entry iPRF inverse with naive O(n) binomial sampling and ~700+ PRP Swap-or-Not rounds per inverse call
    - Logged in both `plinko_2024/replication_benchs/run_notes.md` and `plinko_2024/standardized_benchs/run_notes.md`

12. **Cross-check completed:**
    - Python and C++ use identical parameter formulas (verified for all 14 configs)
    - Core algorithm equivalent: blocks (Py) = partitions (C++), same hint/query structure
    - PRFs differ: SHAKE-256 (Py) vs AES-128 ECB (C++) — cannot interoperate but individually correct
    - C++ has hardcoded PRF key "1234567812345678" (benchmark artifact, not production-safe)
    - Python allocates 2M backup hints vs C++'s 1.5M (one-server variant)
    - Logged in `rms24_2024/replication_benchs/run_notes.md`

13. **LARGE replication R3–R4 complete:**
    - R3 (2^28 × 8B): offline 1242s, online 3.25ms/q, amortized 5.15ms/q
    - R4 (2^28 × 32B): offline 1269s, online 22.38ms/q, amortized 24.31ms/q
    - Offline nearly identical (~1250s) despite 4x entry size — dominated by partition/cutoff computation
    - Online scales ~7x with 4x entry size (XOR parity over larger entries)

15. **Communication sizes computed** from protocol spec via Python Params:
    - Formula: query = ceil(c/8) + (c/2)×4 bytes (mask + offsets), response = 2 × entry_size
    - R4 computed = 34.06 KB, matches paper's ~34.1 KB
    - All 14 configs (R1-R5 + S1-S3) tabulated in run_notes.md files

14. **S2 standardized complete:**
    - S2-32 = R4 (reused): offline 1269s, online 22.38ms/q
    - S2-64 (2^27 × 64B): offline 649s, online 17.44ms/q, amortized 19.43ms/q
    - S2-256 (2^25 × 256B): offline 179s, online 9.25ms/q, amortized 10.34ms/q

16. **R5 complete** (via `s3pir_simlargeserver`):
    - R5 (2^28 × 256B): offline 1486s, online 4.19ms/q, amortized 6.46ms/q

17. **S3 standardized complete** (via `s3pir_simlargeserver`):
    - S3-32 (2^30 × 32B): offline 4975s, online 6.69ms/q, amortized 10.49ms/q
    - S3-64 (2^29 × 64B): offline 2556s, online 5.06ms/q, amortized 8.96ms/q
    - S3-256 (2^27 × 256B): offline 704s, online 2.87ms/q, amortized 5.02ms/q

### All RMS24 benchmarks complete.

Remaining work (optional):
- Two-server variants for R3–R5 (lower priority — paper focuses on one-server)
- Cross-compare with mpc4j S3PIR implementation when scaling to other schemes

### Key Findings

#### Threading
S3PIR is **single-threaded by design**. Multi-threaded benchmarks would require source modifications. Out of scope.

#### Plinko Performance
The Python reference spec is ~1000x slower than RMS24 at equivalent parameters due to per-entry iPRF inverse (PMNS tree traversal + PRP Swap-or-Not rounds). This is a **spec limitation, not a design flaw** — a C++ implementation with AES-NI and batch iPRF would be dramatically faster. Plinko benchmarks are correctness-only; standardized performance comparison requires a production implementation.

#### Cross-Implementation Compatibility
Python spec and C++ S3PIR implement the same RMS24 protocol with identical parameter scaling. They cannot interoperate (different PRFs) but are independently correct. Both verified at small scale.

### Hardware Note

- Local: Apple Silicon (M-series), Apple Clang 17.0.0, arm64
- Paper: AWS m5.8xlarge, Intel Xeon Platinum 8175M
- AES-NI -> ARM Crypto Extensions mapping should be transparent via CryptoPP
- Compute timings will differ; communication sizes should match exactly
