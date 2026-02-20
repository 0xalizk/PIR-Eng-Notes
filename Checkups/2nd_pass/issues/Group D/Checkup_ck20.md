## CK20 (2019) — Footnote Validation

**Notes:** [CK20_2019_notes.md](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md)
**PDF:** [CK20_SublinearOnline_2019_1075.pdf](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_SublinearOnline_2019_1075.pdf)
**Total footnotes:** 43 | **Correct:** 32 | **Minor:** 11 | **Incorrect:** 0

---

### INCORRECT Findings

None.

### MINOR Issues

- [\[^1\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-1-0e312aa0b9c3b615253ff22d01b81e0d) — Attributes quote to "Abstract (p.1)." The abstract appears on the unnumbered title page; printed page numbering begins at the Introduction. Trivial pagination convention difference.

- [\[^2\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-2-0e312aa0b9c3b615253ff22d01b81e0d) — Quoted text is accurate and location correct. The quote is slightly truncated from the full sentence in the PDF, which continues with clarification about linear scans.

- [\[^3\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-3-0e312aa0b9c3b615253ff22d01b81e0d) — Describes "C bits of offline communication" but Theorem 23 (p.28) specifically defines C as the number of bits the client *downloads* in the offline phase, not total offline communication. The notes' own body text (Lower Bounds section) correctly says "C: bits the client downloads in the offline phase," so the footnote's wording is slightly looser than the formal definition.

- [\[^10\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-10-0e312aa0b9c3b615253ff22d01b81e0d) — Section and page references correct. The notes omit the trivial constraint `s(n) <= n` from the definition preamble.

- [\[^13\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-13-0e312aa0b9c3b615253ff22d01b81e0d) — The notes state Construction 4 produces "keys of length O(lambda log n) and punctured keys of length O(lambda log n)." Theorem 3 (p.14) gives key sizes parameterized by the underlying PRF key lengths kappa(lambda,n) and kappa_p(lambda,n). The O(lambda log n) values only hold for the GGM-tree instantiation (Corollary 6). The footnote conflates the general theorem with its specific instantiation.

- [\[^14\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-14-0e312aa0b9c3b615253ff22d01b81e0d) — Page reference correct. Description says "Efficiency analysis of Construction 4" but Section B.2 is titled "Proof of Theorem 3" (efficiency analysis is one subsection of the proof).

- [\[^15\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-15-0e312aa0b9c3b615253ff22d01b81e0d) — Quoted text accurate but slightly truncated: the PDF says "puncturable pseudorandom function ('puncturable PRF')" and the notes omit the parenthetical abbreviation.

- [\[^19\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-19-0e312aa0b9c3b615253ff22d01b81e0d) — Attributes standard DPFs to "GI14" alone. The PDF (p.66-67) references DPFs collectively via [GI14, BGI15, BGI16]. Simplification.

- [\[^22\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-22-0e312aa0b9c3b615253ff22d01b81e0d) — The notes write the client storage as "O(lambda * kappa + ...)" using kappa as a variable, but the PDF (p.50) writes "lambda * |kappa| + ..." using |kappa| (the key length). Substantively equivalent but notation differs.

- [\[^28\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-28-0e312aa0b9c3b615253ff22d01b81e0d) — Cites "p.57" but the union-bound result `T/2^lambda` appears on p.58. The analysis begins on p.57 so the range is slightly off.

- [\[^42\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-42-0e312aa0b9c3b615253ff22d01b81e0d) — The footnote text itself (quoting the polylog-omission caveat) is accurate. However, the comparison table it supports (notes lines 306-313) lists the assumption for Thm 17 as "None," while Table 2 in the PDF (p.6) lists it as "OWF" (PRPs imply OWFs). The notes' own body text at line 145 correctly states "PRP existence" for Thm 17. This is a body-table discrepancy, not a footnote-text error, but it is directly associated with this footnote's referenced material.

### Correct Footnotes

The following 32 footnotes were verified against the PDF with no issues found:

- [\[^4\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-4-0e312aa0b9c3b615253ff22d01b81e0d) — Definition 8 (p.17): Formal syntax of offline/online PIR confirmed.
- [\[^5\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-5-0e312aa0b9c3b615253ff22d01b81e0d) — Definition 8 (p.17): Security definition via query distribution indistinguishability confirmed.
- [\[^6\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-6-0e312aa0b9c3b615253ff22d01b81e0d) — Definition 40 (p.52): Multi-query offline/online PIR syntax confirmed.
- [\[^7\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-7-0e312aa0b9c3b615253ff22d01b81e0d) — Games 41-42, Fig. 3 (p.54): Left-server and right-server security games confirmed.
- [\[^8\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-8-0e312aa0b9c3b615253ff22d01b81e0d) — Definition 46 (p.61): Single-server security requiring joint (q_h, q) indistinguishability confirmed.
- [\[^9\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-9-0e312aa0b9c3b615253ff22d01b81e0d) — Remark 10 (p.18): Any two-server perfectly secure PIR can be viewed as offline/online confirmed.
- [\[^11\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-11-0e312aa0b9c3b615253ff22d01b81e0d) — Game 1 (p.14): Security game for puncturable pseudorandom sets confirmed.
- [\[^12\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-12-0e312aa0b9c3b615253ff22d01b81e0d) — Section 2.1 (p.13): Correctness requirements confirmed.
- [\[^16\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-16-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix G (p.68): Formal definition of sparse DPFs confirmed.
- [\[^17\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-17-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix G (p.68): Security property of sparse DPFs confirmed.
- [\[^18\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-18-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix G (p.68): Correctness of sparse DPFs confirmed.
- [\[^20\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-20-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix G (p.67): Discussion of relaxation from standard DPFs to sparse DPFs confirmed.
- [\[^21\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-21-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix C.2 (p.49-50): Failure probability analysis and amplification confirmed. Arithmetic (s/n <= 1/2 for s <= n/2) matches Eq. 15 and surrounding text.
- [\[^23\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-23-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix D.2 (p.58): Client stores m = Otilde(n^{1/2}) puncturable pseudorandom set keys confirmed.
- [\[^24\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-24-0e312aa0b9c3b615253ff22d01b81e0d) — Construction 16 (p.20): Full specification of two-server PIR confirmed.
- [\[^25\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-25-0e312aa0b9c3b615253ff22d01b81e0d) — Construction 44 (p.56): Full specification of multi-query PIR confirmed.
- [\[^26\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-26-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix C.2 (p.49): Failure probability analysis of Construction 16 confirmed.
- [\[^27\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-27-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix C.2 (p.49-50): Amplification via lambda parallel repetitions confirmed.
- [\[^29\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-29-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix C.2 (p.49-50): Quoted text about parallel instances driving failure to 2^{-lambda} confirmed.
- [\[^30\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-30-0e312aa0b9c3b615253ff22d01b81e0d) — Theorem 11 (p.18) and Theorem 14 (p.19): Main complexity results confirmed at stated pages.
- [\[^31\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-31-0e312aa0b9c3b615253ff22d01b81e0d) — Section 4.1 (p.23): Hint refresh mechanism in multi-query scheme confirmed.
- [\[^32\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-32-0e312aa0b9c3b615253ff22d01b81e0d) — Theorem 23 (p.28): "(C+1)(T+1) = Omega-tilde(n)" formal statement confirmed.
- [\[^33\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-33-0e312aa0b9c3b615253ff22d01b81e0d) — Theorem 23 (p.28): Model restrictions (server stores DB in original form, no additional storage) confirmed.
- [\[^34\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-34-0e312aa0b9c3b615253ff22d01b81e0d) — Appendix F (p.63-66): Full proof via Yao's Box Problem reduction confirmed. Definition 47 (p.64), Theorem 48 (p.64), Lemma 50 (p.65).
- [\[^35\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-35-0e312aa0b9c3b615253ff22d01b81e0d) — Section 6 (p.28): Optimality claim ("achieve the optimal trade-off, up to log factors") confirmed.
- [\[^36\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-36-0e312aa0b9c3b615253ff22d01b81e0d) — Remark 24 (p.28): Lower bound does not preclude encoded-DB schemes confirmed.
- [\[^37\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-37-0e312aa0b9c3b615253ff22d01b81e0d) — Remark 12 (p.18): "It is possible to make these hidden factors as small as O(lambda log n)" confirmed.
- [\[^38\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-38-0e312aa0b9c3b615253ff22d01b81e0d) — Remark 13 (p.18): Continuous communication-time tradeoff confirmed.
- [\[^39\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-39-0e312aa0b9c3b615253ff22d01b81e0d) — Section 5.1 (p.25-27): Proof of Theorem 20 confirmed across stated pages.
- [\[^40\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-40-0e312aa0b9c3b615253ff22d01b81e0d) — Section 5.1 (p.27): Rebalancing step confirmed. (See Minor note above re: CGKS95 Section 4.3 specificity.)
- [\[^41\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-41-0e312aa0b9c3b615253ff22d01b81e0d) — Theorem 22 (p.27): FHE-based single-server scheme achieving optimal bounds confirmed.
- [\[^43\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md#user-content-fn-43-0e312aa0b9c3b615253ff22d01b81e0d) — Section 7 (p.29): Four open questions match the notes' enumeration confirmed.
