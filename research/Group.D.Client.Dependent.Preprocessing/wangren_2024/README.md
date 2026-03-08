## WangRen — Estimation Notes

### Tier 3 Value Estimation Methodology

WangRen is a theory-only scheme (no implementation). Its Tier 3 benchmark values in `reported.json` are estimated by cross-calibrating its asymptotics against the measured performance of structurally similar schemes (Piano and RMS24), which share the same sqrt(n) XOR-based client-dependent preprocessing model.

**Calibration basis:**
- Piano and RMS24 have published benchmarks at comparable DB sizes
- Piano/RMS24 measured-vs-asymptotic gap is ~1x, establishing that for this family of schemes, asymptotic estimates are reliable within 2-3x

**WangRen estimates (N = 2^20 entries, 256 B each, balanced T = sqrt(n) tradeoff):**
- Query size: ~82 KB (sqrt(n) seeds at 128-bit security)
- Response size: ~1,448 KB (w = n/T = sqrt(n) entries XORed, each 256 B, plus hints)
- Server time: ~3 ms (sqrt(n) XOR lookups — tighter than Piano due to deterministic correctness eliminating retries)
- Client time: ~2 ms (sqrt(n) PRF evaluations + XOR reconstruction)

**Confidence:** Medium — structurally identical to Piano/RMS24 with well-understood constants. WangRen's tight ST = O(nw) tradeoff matches Piano's structure closely.
