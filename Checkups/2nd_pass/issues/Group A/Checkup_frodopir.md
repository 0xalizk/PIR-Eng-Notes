## FrodoPIR (2022) — Footnote Validation

**Notes:** [frodopir_2022_notes.md](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md)
**PDF:** [FrodoPIR_2022_981.pdf](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/FrodoPIR_2022_981.pdf)
**Total footnotes:** 56 | **Correct:** 53 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

- [\[^throughput\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-throughput-51f2701b06eed1d5c31958d7f742e211) — States derived throughput for 1 KB elements as "~1.27 GB/s" but dividing 1 GB by the 825.37 ms server response time from Table 6 yields ~1.21 GB/s; arithmetic is off by ~5%.

- [\[^safebrowsing\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-safebrowsing-51f2701b06eed1d5c31958d7f742e211) — Cites Appendix B (p. 35-36) but gives "~6 MB" offline download and "~3.2 KB response" figures that come from the general 1 KB element benchmarks (Table 6), not from the SafeBrowsing-specific configuration in Appendix B, which uses w = 256 bits, m = 2^18 per shard, yielding 180 KB download per shard (~2.82 MB total for 16 shards) and 0.1 KB response (Table 8, p. 38).

- [\[^shard\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md#user-content-fn-shard-51f2701b06eed1d5c31958d7f742e211) — Attributes the specific example of sharding a 2^24-element database into 16 shards of 2^20 to "Section 5.4, p. 16-17," but that example appears in Section 6.2, p. 21; Section 5.4 discusses sharding in general terms only.
