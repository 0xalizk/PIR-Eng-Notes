## XPIR (2014) — Footnote Validation

**Notes:** [xpir_2014_notes.md](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md)
**PDF:** [XPIR_2014_232.pdf](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/XPIR_2014_232.pdf)
**Total footnotes:** 25 | **Correct:** 24 | **Minor:** 1 | **Incorrect:** 0

---

### INCORRECT Findings

None.

### MINOR Issues

- [\[^6\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-6-b57deeceac035ba5fd62d388973804fc) — The footnote quotes the divisibility condition as "q_i | q_{i+1}", meaning the larger modulus divides the smaller one in the decreasing chain q_0 > q_1 > ... > q_d. Mathematically, for modulus reduction to produce integer ratios the correct relationship is q_{i+1} | q_i (smaller divides larger). The PDF itself has an ambiguous subscript ("q_i|q_{k+1}" on p. 6, where k+1 appears to be a typo), so the notes mirror the source's own notational confusion rather than introducing a new error. Still, the divisibility direction as written in the notes is technically backwards.

### Verified Correct

- [\[^1\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-1-b57deeceac035ba5fd62d388973804fc) — Section 4.1, p. 7. Correctness condition ||c^{2^d} f^{2^d}||_inf < q_d/2 confirmed verbatim in the PDF.
- [\[^2\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-2-b57deeceac035ba5fd62d388973804fc) — Section 3, p. 5, footnote 3. Quote about w-bit entries handled by w parallel function evaluations confirmed verbatim.
- [\[^3\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-3-b57deeceac035ba5fd62d388973804fc) — Abstract, p. 1. "more than 1000 times smaller" bandwidth claim confirmed verbatim.
- [\[^4\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-4-b57deeceac035ba5fd62d388973804fc) — Section 4, p. 5. Stehle-Steinfeld NTRU variant [12] and RLWE reduction confirmed. PDF references [13] for original NTRU and [12] for Stehle-Steinfeld modification; the footnote correctly attributes the variant.
- [\[^5\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-5-b57deeceac035ba5fd62d388973804fc) — Section 4, p. 6. No relinearization due to single-user setting and perfect binary tree circuit confirmed verbatim.
- [\[^6\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-6-b57deeceac035ba5fd62d388973804fc) — Section 4, p. 6. Decreasing odd prime moduli chain and divisibility specialization from [16] confirmed. See MINOR note above regarding divisibility direction.
- [\[^7\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-7-b57deeceac035ba5fd62d388973804fc) — Section 4, p. 6. KeyGen description with f^(i) = 2u^(i) + 1 and h^(i) = 2g^(i)(f^(i))^{-1} confirmed verbatim from the PDF primitives listing.
- [\[^8\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-8-b57deeceac035ba5fd62d388973804fc) — Section 4.1, p. 7. Noise growth equation with modulus reduction rate kappa confirmed verbatim.
- [\[^9\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-9-b57deeceac035ba5fd62d388973804fc) — Section 2.1, p. 3. Matrix M of size 2^{h/2} x 2^{h/2} confirmed. The footnote correctly uses variable h from Section 2.1; the notes body uses l (from Section 3 onward), which is a consistent variable rename within the notes.
- [\[^10\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-10-b57deeceac035ba5fd62d388973804fc) — Section 5, p. 8. Query vector Q = [xi_i(x),...,xi_{l-1}(x)] sent to PIR server confirmed verbatim (including the original's grammatical "send" for "sent").
- [\[^11\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-11-b57deeceac035ba5fd62d388973804fc) — Section 5, p. 9. Single-ciphertext response R sent back to PIR client confirmed verbatim.
- [\[^12\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-12-b57deeceac035ba5fd62d388973804fc) — Section 5, p. 8. Batching by Smart and Vercauteren [8,9] via CRT confirmed verbatim.
- [\[^13\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-13-b57deeceac035ba5fd62d388973804fc) — Section 5, p. 9. Single Query batching of row bits y_i and D_y confirmed from the Single Query paragraph.
- [\[^14\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-14-b57deeceac035ba5fd62d388973804fc) — Table 2, p. 10. All parameter values confirmed: (512, 16384)/1024/32 MB/784 KB; (250, 8190)/630/3.9 MB/154 KB; (160, 4096)/256/0.625 MB/44 KB.
- [\[^15\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-15-b57deeceac035ba5fd62d388973804fc) — Inferred from Table 2. Arithmetic verified: 32 MB / 1024 = 32 KB per retrieval; 784 KB / 1024 = 0.766 KB per retrieval. Correct.
- [\[^16\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-16-b57deeceac035ba5fd62d388973804fc) — Table 3, p. 10. All timing values confirmed: Bundled (d=5) index 4.45 ms, data 0.22 ms; Bundled (d=4) 0.71/0.09; Bundled (d=3) 0.31/0.04; Single (d=5) 4.56/37; Single (d=4) 2.03/7.45; Single (d=3) 1.29/3.40. Hardware "Intel Pentium @ 3.5 Ghz" confirmed.
- [\[^17\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-17-b57deeceac035ba5fd62d388973804fc) — Section 4, p. 5. Depth 5 or 6 for 2^32 and 2^64 confirmed verbatim.
- [\[^18\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-18-b57deeceac035ba5fd62d388973804fc) — Section 6, p. 9. C++ implementation with NTL version 6.0 [17] confirmed verbatim. Section 6 begins at bottom of p. 9.
- [\[^19\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-19-b57deeceac035ba5fd62d388973804fc) — Table 1, p. 7. All (gamma, d) values for n = 2^13, 2^14, 2^15 across log_2(q) = 512, 640, 768, 1024, 1280 confirmed against the PDF table.
- [\[^20\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-20-b57deeceac035ba5fd62d388973804fc) — Section 4.1, p. 7. Feasibility boundary delta^n <= 1.01^n confirmed verbatim.
- [\[^21\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-21-b57deeceac035ba5fd62d388973804fc) — Table 4, p. 11. All query size comparison values confirmed: BGN (96 MB, 384 KB, 24 KB), K-O (32 MB, 128 KB, 8 KB), Ours Single (32 MB, 249 KB, 80 KB), Ours Bundled (32 KB, 406 B, 320 B).
- [\[^22\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-22-b57deeceac035ba5fd62d388973804fc) — Section 6, p. 10. Factors of 1024, 1200, and 3072 compared to BGN, Melchor-Gaborit, and K-O confirmed verbatim. Editorial note about 3072x vs. 1000x is an accurate clarification.
- [\[^23\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-23-b57deeceac035ba5fd62d388973804fc) — Section 6, p. 10-11. Ciphertext size growing ~1.26x from 256 to 2^16 entries in bundled case confirmed verbatim.
- [\[^24\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-24-b57deeceac035ba5fd62d388973804fc) — Section 6, p. 10. Bundled Query d=4 with 1 GB rows being ~8x slower than K-O confirmed verbatim.
- [\[^25\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md#user-content-fn-25-b57deeceac035ba5fd62d388973804fc) — Section 3, p. 4-5. Retrieval formula f(x) = SUM (x = y) D_y (mod 2) with equality test as PROD (x_i + y_i + 1) confirmed verbatim.
