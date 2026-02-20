## Group C — Footnote Validation Checkup

### Summary

| Paper | Footnotes | Issues |
|-------|-----------|--------|
| SimplePIR / DoublePIR (2022) | 45 | 5 issues + 1 body text issue |
| VeriSimplePIR (2024) | 47 | 3 issues |
| BarelyDoublyEfficient (2025) | 29 | 0 issues |
| IncrementalPIR (2026) | 36 | 1 issue |
| **Total** | **157** | **9 footnote issues + 1 body text issue** |

Most issues are minor (section/page misattributions, naming errors). One non-trivial algebraic error was found: VeriSimplePIR [^9] is missing a multiplicative factor in a correctness condition formula.

---

### Paper 1: SimplePIR / DoublePIR (2022)

**File:** `Schemes/Group C - Client Independent Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md`
**Total footnotes:** 45

#### Verified Correct

[^1], [^2], [^3], [^4], [^6], [^8], [^9], [^10], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^20], [^22], [^23], [^25], [^26], [^27], [^28], [^29], [^30], [^31], [^32], [^33], [^34], [^35], [^36], [^37], [^38], [^39], [^41], [^42], [^43], [^44], [^45]

#### Issues Found

**[^5] — Minor source mismatch (naming)**
- **Notes claim:** "Table 1 (p.3) and Section 1 (p.1): SimplePIR achieves 10 GB/s/core; the fastest prior single-server scheme (SpiralStreamPack) achieves 1,314 MB/s."
- **Paper says:** Table 1 (p.3) attributes 1,314 MB/s to "Spiral family [76]", not specifically "SpiralStreamPack". The name "SpiralStreamPack" appears in Table 8 (p.13) and in the prose on p.12, not in Table 1. The throughput number is correct; the specific variant name is misattributed to Table 1.

**[^7] — Minor section reference error**
- **Notes claim:** "Section 3.1 (p.4) and Section 2 'Plain learning with errors' (p.3)"
- **Paper says:** The direct quote "We base our PIR schemes on the standard learning-with-errors (LWE) problem — not the ring variant" appears on p.3 under a bold "Plain learning with errors" heading, which is within Section 1 (Introduction), not Section 2 ("Related work and comparison") or Section 3.1 ("Learning with errors (LWE)"). The quote itself is verbatim correct; only the section attribution is off.

**[^21] — Correct footnote, but body text Variants table has errors it supports**
- **Footnote text:** "Table 8 (p.13): SimplePIR online: 121 KB up, 121 KB down. DoublePIR online: 313 KB up, 32 KB down." — This is **correct** per Table 8.
- **Body text issue (lines 39–40):** The Variants table lists DoublePIR upload as "approximately 345 KB" and download as "approximately 345 KB". Table 8 shows upload = 313 KB and download = 32 KB (total = 345 KB). The 345 KB figure is the **total** online communication, not the individual upload/download values. The Variants table incorrectly uses 345 KB for both directions.

**[^24] — Confusing / self-contradictory wording**
- **Notes claim:** "Table 8 (p.13): SimplePIR offline download = 0 MB server-to-client hint download is 121 MB; DoublePIR offline download = 16 MB."
- **Paper says:** Table 8 shows SimplePIR Offline: Upload = 0 MB, Download = 121 MB. The footnote says "offline download = 0 MB" then immediately says "hint download is 121 MB" — the "0 MB" refers to the offline **upload**, not download. The word "download" is used incorrectly for the 0 MB figure. The actual numbers (0 upload, 121 download, 16 MB for DoublePIR) are all correct.

**[^40] — Minor inaccuracy in characterization**
- **Notes claim:** "The LWE-based construction achieves hint size λ, ciphertext size 1 per bit, and Apply/Dec time λ — all linear or constant in the security parameter."
- **Paper says (Table 11, p.23):** For "This work (LWE)": Hint = λ, Key = λ, Ct/bit = 1, Preproc = n/a, Enc = λ, **Apply = 1**, Dec = λ. The Apply time is 1 (constant), not λ. The footnote's phrasing "Apply/Dec time λ" incorrectly attributes λ cost to Apply. The broader claim "all linear or constant" is technically true (Apply is constant, Dec is linear), but the specific "Apply/Dec time λ" is inaccurate.

#### Additional Body Text Issue (not a footnote, but noticed during review)

**Line 119 — Mathematical typo in norm bound:**
- **Notes say:** `||db[i_row, :]|| <= sqrt(N) * (p/2)^2 = N^{1/4} * p/2`
- **Paper says (p.20):** `||db[i_row, :]|| ≤ √(√N · ⌊p/2⌋²) = N^{1/4} · ⌊p/2⌋`
- The notes are missing the outer square root. It should be `||db[i_row, :]|| <= sqrt(sqrt(N) * (p/2)^2) = N^{1/4} * p/2`.

---

### Paper 2: VeriSimplePIR (2024)

**File:** `Schemes/Group C - Client Independent Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md`
**Total footnotes:** 47

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^8], [^10], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^20], [^21], [^22], [^23], [^24], [^25], [^26], [^27], [^28], [^29], [^30], [^31], [^32], [^33], [^35], [^36], [^37], [^38], [^39], [^40], [^41], [^42], [^43], [^44], [^45], [^46], [^47]

#### Issues Found

**[^7] — Minor count error**
- **Notes claim (footnote text):** "Construction 4.1 (p. 7): Full VLHE API definition with seven algorithms."
- **Paper says:** Construction 4.1 (p. 7) defines **eight** algorithms: Setup, Commit, VerCom, Encrypt, Eval, Decrypt, Prove, Verify. The notes' body text (line 43) correctly lists all eight; only the footnote's count of "seven" is wrong.

**[^9] — Algebraic error in correctness condition**
- **Notes claim (line 45):** "q >= sigma * 2\*ell\*p^2 * sqrt(2m * ln(2/delta)) (eq. 6, p. 9)"
- **Paper says (eq. 6, p. 9):** `q ≥ 2σmℓp² · √(2ℓ · ln(2/δ))`, equivalently `(√mℓ) · 2σℓp² · √(2m · ln(2/δ))`.
- The notes formula `σ · 2ℓp² · √(2m · ln(2/δ))` is missing a multiplicative factor of `√(mℓ)` compared to the paper's second form (or equivalently missing the factor `m` from the first form). This is a non-trivial algebraic error that would give an incorrect (too-small) lower bound on q.

**[^34] — Footnote misattribution**
- **Context:** [^34] is cited at line 151 next to "12-40% overhead vs SimplePIR (Verify step)".
- **Footnote text:** "Section 6 (p. 12): 'When the honest assumption is introduced, the communication overhead of VeriSimplePIR drops to 13% to 20%.'"
- The 13-20% figure is about **communication** overhead with honest digest — not the 12-40% **computation** overhead cited in context. The 12-40% computation figure is supported by [^33], not [^34]. The footnote and its citation point are mismatched.

---

### Paper 3: Barely Doubly-Efficient SimplePIR (2025)

**File:** `Schemes/Group C - Client Independent Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md`
**Total footnotes:** 29

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^7], [^8], [^9], [^10], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^20], [^21], [^22], [^23], [^24], [^25], [^26], [^27], [^28], [^29]

#### Issues Found

None. All 29 footnotes accurately cite the paper. Quotes are verbatim or faithful paraphrases, page references are correct, section/definition/theorem/figure attributions are accurate, and mathematical expressions match the source.

---

### Paper 4: IncrementalPIR / iSimplePIR (2026)

**File:** `Schemes/Group C - Client Independent Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md`
**Total footnotes:** 36

#### Verified Correct

[^1], [^2], [^3], [^4], [^5], [^6], [^7], [^8], [^9], [^10], [^11], [^12], [^13], [^14], [^15], [^16], [^17], [^18], [^19], [^21], [^22], [^23], [^24], [^25], [^26], [^27], [^28], [^29], [^30], [^31], [^32], [^33], [^34], [^35], [^36]

#### Issues Found

**[^20] — Minor page/section misattribution**
- **Notes claim (footnote text):** "Section 2.3 (p. 8): 'Strong deletion... is the ideal property for practical applications' but 'secure deletion against malicious clients is impossible in SimplePIR.'"
- **Paper says:** The first quote ("Strong deletion is the ideal property for practical applications") is correctly from Section 2.3 (p. 8). However, the second quote ("secure deletion against malicious clients is impossible in SimplePIR") does NOT appear in Section 2.3 (p. 8). It appears on p. 12 in Section 4.1, within the discussion below Theorem 3: "In fact, secure deletion against malicious clients is impossible in SimplePIR." Section 2.3 (p. 8) says strong deletion is "particularly challenging in the preprocessing model" but does not use the word "impossible." The impossibility claim is correct but is attributed to the wrong section/page.

---
