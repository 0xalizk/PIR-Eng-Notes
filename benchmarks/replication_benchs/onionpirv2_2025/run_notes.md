## OnionPIRv2 — Replication Benchmarks

### Implementation

- **Repo:** [OnionPIRv2](https://github.com/chenyue42/OnionPIRv2) (paper authors' C++ implementation)
- **Dependency:** [SEAL-For-OnionPIR](https://github.com/helloboyxxx/SEAL-For-OnionPIR)
- **Language:** C++20
- **Build:** CMake + GCC, Intel HEXL enabled

### Hardware

- **Local:** WSL2 Ubuntu 24.04 on x86_64, AVX-512-capable CPU, single-threaded runs pinned to one core
- **Paper:** AWS EC2 c5n.9xlarge, Intel Xeon Platinum 8124M @ 3.00 GHz, 96 GB RAM, single-threaded

**Note:** Compute timings will differ from paper due to hardware and virtualization differences. Query size, response size, and key sizes should match if the same parameter set is used.

### Configs (from paper Table 2)

| Config | Variant | Ring Degree | Native Entry Size | Approx. DB |
|--------|---------|-------------|-------------------|------------|
| O1 | OnionPIRv2 | 2048 | 3.75 KB | ~1 GB |
| O2 | OnionPIRv2 | 2048 | 3.75 KB | ~8 GB |
| O3 | OnionPIRv2 | 4096 | 22.5 KB | ~1 GB |
| O4 | OnionPIRv2 | 4096 | 22.5 KB | ~8 GB |

### Build

The local benchmark harness uses per-profile build directories and passes `-DONIONPIR_PROFILE=<profile>` to CMake so the upstream hardcoded parameter header does not need manual editing between runs.

Primary runner:

```bash
nohup ./scripts/run_onionpirv2_replication.sh --run-id <id> > results/onionpirv2/<id>/launcher.log 2>&1 < /dev/null &
```

### Results

Pending. The detached runner writes:

- `results/onionpirv2/<run-id>/runner.log`
- `results/onionpirv2/<run-id>/<profile>/stdout.log`
- `results/onionpirv2/<run-id>/<profile>/result.json`

### Notes

- The upstream binary always generates a fresh random database at startup.
- The generated `rawDB.bin` is transient and is deleted on clean process exit by upstream code.
- A partial `rawDB.bin` indicates an interrupted run, not a reusable checkpoint.
