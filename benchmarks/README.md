## PIR Benchmarks

- [`/replication_benchs`](/replication_benchs): replicating paper-reported benchmarks
- [`/standarized_benchs`](standarized_benchs): running a standardized grid for apples-to-apples cross-scheme comparison:

### Caveats

- **Hardware:** Apple Silicon, not Intel Xeon. Compute timings differ from papers; communication sizes match exactly.
- **lambda=80** matches papers but is below the 128-bit modern standard.
- **Plinko:** Correctness-only (Python spec too slow for performance benchmarking).

