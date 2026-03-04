## Plinko — Replication Benchmarks (Correctness Only)

### Implementation

- **Repo:** [rms24-plinko-spec](https://github.com/keewoolee/rms24-plinko-spec) (Python reference spec)
- **Language:** Pure Python
- **Note:** Plinko is a theory paper — this is the only implementation. Performance numbers are meaningless. Focus is on **correctness verification**.

### Hardware

- **Local:** Apple Silicon (M-series)

### Setup

```bash
cd benchmarks/implementations/rms24-plinko-spec/
uv venv .venv && source .venv/bin/activate
uv pip install -r requirements.txt
python -m pytest tests/ -v   # 132 tests, all pass (~2 min)
```

### Correctness Verification

Run date: 2026-03-02. Apple M-series, Python 3.14.2.

Goal: Confirm the spec correctly retrieves the requested DB entry at small scales.

#### Test Suite

132/132 tests pass. Tests use `num_entries=100, security_param=40` (reduced from default 128).

#### Manual Correctness (lambda=40)

| Entries | Entry Size | lambda | Offline (s) | Correct? |
|---------|-----------|--------|------------|----------|
| 100 | 32B | 40 | 9.39 | Yes |
| 256 | 32B | 40 | 18.36 | Yes |
| 1024 | 32B | 40 | 78.78 | Yes |
| 256 | 32B | 80 | 65.09 | Yes |

#### Manual Correctness (lambda=128, default)

Not feasible — even 256 entries does not complete within 120s with the default security parameter.

### Issues & Observations

- **Plinko's offline phase is orders of magnitude slower than RMS24 in Python.** RMS24 completes 2^14 entries in ~15s; Plinko can barely handle 256 entries at lambda=40 in 18s. Root causes:
  1. **Per-entry iPRF inverse** — each DB entry requires PMNS tree traversal + PRP (Swap-or-Not) inverse
  2. **Naive O(n) binomial sampling** in PMNS tree nodes (Bernoulli trial loop instead of BTPE/normal approximation)
  3. **PRP round count scales with lambda** — at lambda=128, each PRP inverse does ~700+ Swap-or-Not rounds, each requiring 2 SHAKE-256 calls
- **RMS24 uses direct O(1) PRF evaluation** per (hint, entry) pair — no inverse, no trees, no binomial sampling
- **This is a spec limitation, not a Plinko design flaw** — a C++ implementation with AES-NI and batch iPRF evaluation would be dramatically faster
- **Original target of 2^14–2^18 is infeasible** in pure Python at any reasonable security parameter
