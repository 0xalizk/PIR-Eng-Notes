## RMS24 (2024) — Footnote Validation

**Notes:** [RMS24_2024_notes.md](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md)
**PDF:** [RMS24_2024_1072.pdf](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_1072.pdf)
**Total footnotes:** 49 | **Correct:** 47 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings
None.

### MINOR Issues
- [\[^3\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md#user-content-fn-3-da0e6ca88cd02c758b4696974589fa9e) — Cites "Section 1 (p.2)" but the quoted text ("Our main idea to address this leakage is for the client to additionally send a dummy subset of indices...") actually appears in Section 3.1 on p.4 of the PDF, not in the Introduction on p.2.
- [\[^9\]](../../../../Schemes/Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md#user-content-fn-9-da0e6ca88cd02c758b4696974589fa9e) — States the 0.4*lambda*sqrt(N) figure is "a conservative estimate for the simpler non-paired strategy." In the PDF (Section 3.4, p.7), the 0.4 figure is the conservative estimate for the paired strategy itself ("say 0.4*lambda*sqrt(N)"), not specifically for the non-paired strategy. The non-paired strategy supports fewer queries; the paired strategy gets close to but fewer than 0.5*lambda*sqrt(N), with 0.4 being the conservative rounding of that.
