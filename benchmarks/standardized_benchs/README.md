
| DB Size | 32B entries | 64B entries | 256B entries |
|---------|-------------|-------------|--------------|
| 1 GB | 2^25 | 2^24 | 2^22 |
| 8 GB | 2^28 | 2^27 | 2^25 |
| 32 GB | 2^30 | 2^29 | 2^27 |

If a scheme is not practical (terminates within 10 minutes) the db size is reduced, and the performance is extrapolated on larger db.



### Caveats

- **Hardware:** Apple Silicon, not Intel Xeon. Compute timings differ from papers; communication sizes match exactly.
- **lambda=80** matches papers but is below the 128-bit modern standard.
- **Plinko:** Correctness-only (Python spec too slow for performance benchmarking).

