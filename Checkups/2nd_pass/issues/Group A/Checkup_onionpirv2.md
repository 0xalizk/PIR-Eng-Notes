## OnionPIRv2 (2025) — Footnote Validation

**Notes:** [onionpirv2_2025_notes.md](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md)
**PDF:** [FHEPIR_2025_1142.pdf](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/FHEPIR_2025_1142.pdf)
**Total footnotes:** 37 | **Correct:** 36 | **Minor:** 1 | **Incorrect:** 0

---

### INCORRECT Findings

None.

### MINOR Issues

- [\[^13\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-13-e5d4b9a14d7a46dfbe1456431b0920e7) — Footnote uses the phrase "plaintext slots" ("A BFV ciphertext in our implementation has n = 2048 or n = 4096 plaintext slots"), but the paper never uses the word "slots" here; it refers to ring degree n (i.e., polynomial coefficients). "Slots" is standard BFV/CKKS SIMD-batching terminology and can mislead readers into thinking SIMD batching is in play, whereas OnionPIR packs values into individual coefficients.

### Verified Footnotes (36 Correct)

| Footnote | Cited Location | Verdict |
|----------|---------------|---------|
| [\[^1\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-1-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.1, p.11 | Correct |
| [\[^2\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-2-e5d4b9a14d7a46dfbe1456431b0920e7) | Table 2, p.12 | Correct |
| [\[^3\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-3-e5d4b9a14d7a46dfbe1456431b0920e7) | p.2 | Correct |
| [\[^4\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-4-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.5, p.10 | Correct |
| [\[^5\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-5-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.1, p.5 | Correct |
| [\[^6\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-6-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.2, p.5 | Correct |
| [\[^7\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-7-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.12 | Correct |
| [\[^8\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-8-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.1, p.11 | Correct |
| [\[^9\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-9-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.6, p.10-11 | Correct |
| [\[^10\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-10-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^11\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-11-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.3, p.5-6 | Correct |
| [\[^12\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-12-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.5, p.10 | Correct |
| [\[^14\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-14-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.3, p.8 | Correct |
| [\[^15\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-15-e5d4b9a14d7a46dfbe1456431b0920e7) | Table 1, p.3 | Correct |
| [\[^16\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-16-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.1, p.11 | Correct |
| [\[^17\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-17-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.12 | Correct |
| [\[^18\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-18-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.4, p.8 | Correct |
| [\[^19\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-19-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.4, p.9 | Correct |
| [\[^20\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-20-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.5, p.9 | Correct |
| [\[^21\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-21-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.5, p.9 | Correct |
| [\[^22\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-22-e5d4b9a14d7a46dfbe1456431b0920e7) | S3.5, p.10 | Correct |
| [\[^23\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-23-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.3, p.12 | Correct |
| [\[^24\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-24-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.3, p.12 | Correct |
| [\[^25\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-25-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^26\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-26-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^27\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-27-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^28\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-28-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.2, p.11 | Correct |
| [\[^29\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-29-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.2, p.11 | Correct |
| [\[^30\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-30-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^31\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-31-e5d4b9a14d7a46dfbe1456431b0920e7) | Table 2 | Correct |
| [\[^32\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-32-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.12 | Correct |
| [\[^33\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-33-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^34\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-34-e5d4b9a14d7a46dfbe1456431b0920e7) | S4.4, p.13 | Correct |
| [\[^35\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-35-e5d4b9a14d7a46dfbe1456431b0920e7) | S5, p.13 | Correct |
| [\[^36\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-36-e5d4b9a14d7a46dfbe1456431b0920e7) | S5, p.13 | Correct |
| [\[^37\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md#user-content-fn-37-e5d4b9a14d7a46dfbe1456431b0920e7) | S5, p.13 | Correct |
