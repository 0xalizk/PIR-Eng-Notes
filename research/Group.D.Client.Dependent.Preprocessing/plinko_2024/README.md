## Plinko — Estimation Notes

### Tier 3 Value Estimation Methodology

Plinko has a reference implementation (https://github.com/keewoolee/rms24, shared with RMS24). The implementation confirms that **server answer time and communication are identical to RMS24** (same XOR-over-blocks kernel). However, the iPRF (invertible PRF) step that replaces linear hint search is intractable at benchmark-relevant DB sizes, so **client_time is omitted**.

### Source: Reference Implementation Benchmarks (N=64, entry=32B)

| Operation | RMS24 | Plinko | Ratio |
|---|---|---|---|
| Hint generation | 57 ms | 33 s | 580x |
| Query (hint search) | 41 us | 614 ms | 15,000x |
| Server answer | 12 us | 12 us | 1x |
| Update (hint update) | 2 ms | 602 ms | 300x |

Key observation: the **server answer** (XOR parity computation) is identical. All overhead is in the iPRF-dependent client-side operations.

### Why the iPRF is intractable

The iPRF = PRP (Sometimes-Recurse Shuffle) + PMNS (Pseudorandom Multinomial Sampler). The bottleneck is the PRP, which uses Swap-or-Not (SN) rounds based on SHAKE-256.

**SN rounds per recursion level at domain D:**
```
t = ceil(7.23 * lg(D) + 4.82 * security_param + 4.82 * lg(lg(D_0)))
```

At the benchmark config (N=2^29, block_size=2^15=32768):
- iPRF domain = num_reg_hints = 128 * 32768 = 4,194,304
- iPRF range = block_size = 32768
- SN rounds at domain 4M: ceil(7.23*22 + 4.82*128 + 4.82*4.46) = 798 rounds
- Each PRP eval: ~2 recursion levels x 798 rounds x 2 SHAKE-256 calls = ~3,192 SHAKE calls
- iPRF inverse returns ~128 pre-images, each needing a PRP inverse
- **Total per query: ~128 x 3,192 = ~409K SHAKE-256 calls**

Even in optimized C++ (~100ns/SHAKE): 409K x 100ns = ~41ms per query. In the Python reference implementation, this would be ~700ms. This is inherent to the security parameter, not an implementation artifact.

### Concrete estimates for reported.json (config: 2^29 x 64B)

**Query size (~50 KB):** Extrapolated from RMS24 at 2^28 (34 KB). Query format is identical (bitmask over blocks + offset). Scales as ~sqrt(n) * log(n). RMS24's query_size is stable across entry sizes (34.02, 34.06, 34.50 KB for 8B/32B/256B at 2^28), confirming it depends only on n.

**Response size (0.125 KB):** Server returns 2 XOR parities, each of entry_size. Confirmed by reference implementation: at N=64 with 32B entries, response = 64B = 2 x 32B. For 64B entries: 2 x 64 = 128B.

**Server time (~4 ms):** Identical kernel to RMS24 (confirmed at N=64: both 12us). RMS24 at 2^28: 2.4ms (8B), 2.7ms (32B), 4.2ms (256B). Server time scales sub-linearly with entry_size (dominated by memory access pattern, not XOR compute). Interpolating to 2^29 x 64B: ~4ms.

**Client time: omitted (intractable).** The iPRF inverse dominates client computation with ~409K SHAKE-256 calls per query at this config. Even optimized, this is 10-100x slower than RMS24/Piano's ~3ms linear hint scan at comparable scale.

### Confidence

- **Query/response size:** High — identical protocol format, confirmed by reference implementation
- **Server time:** High — identical kernel, confirmed by reference implementation, cross-validated with RMS24 measured data
- **Client time:** N/A — intentionally omitted; iPRF overhead is structural, not a matter of estimation uncertainty
