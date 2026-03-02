## Group B (Stateless Single-Server PIR) — 3rd Pass Fixes Applied

### HintlessPIR (2023) — 1 fix applied

---

**Fix 1 — Cryptographic Foundation table: sqrt(ell * N) should be sqrt(ell) * N in Lemma 19 Condition 2**
- Issue ref: Checkup Incorrect Finding (cross-pass persistent issue)
- Location: Cryptographic Foundation table, Correctness condition row
- What changed: In Lemma 19 Condition 2, the square root applies only to ell; N is outside the radical
- Old: `sqrt(ell * N) * n * sigma * gamma * p_j^2`
- New: `sqrt(ell) * N * n * sigma * gamma * p_j^2`

---

### YPIR (2024) — 7 fixes applied

---

**Fix 1 — Complexity table: Query size 724 KB should be 2.5 MB**
- Issue ref: Checkup Incorrect Finding 1 (cross-pass persistent issue)
- Location: Complexity core metrics table, Query size row
- What changed: 724 KB is SimplePIR's query at 32 GB; YPIR's query at 32 GB is 2.5 MB per Table 2 (p.20)
- Old: `724 KB (upload)`
- New: `2.5 MB (upload)`

---

**Fix 2 — Complexity table: Response size 32 MB should be 12 KB**
- Issue ref: Checkup Incorrect Finding 2 (cross-pass persistent issue)
- Location: Complexity core metrics table, Response size row
- What changed: 32 MB is DoublePIR's response; YPIR's response at 32 GB is 12 KB per Table 2 (p.20)
- Old: `32 MB (download)`
- New: `12 KB (download)`

---

**Fix 3 — Complexity table: Response overhead recalculated**
- Issue ref: Derived from Fix 2
- Location: Complexity core metrics table, Response overhead row
- What changed: Updated to reflect corrected 12 KB response
- Old: `32 MB / 32 GB = 0.001x`
- New: `12 KB / 32 GB ~ 0`

---

**Fix 4 — Protocol Phases table: Query Gen output range corrected**
- Issue ref: Holistic propagation of Fix 1
- Location: Protocol Phases table, Query Gen row
- What changed: Lower bound 724 KB is SimplePIR's value; YPIR's minimum is 846 KB (at 1 GB, Table 2)
- Old: `724 KB -- 2.5 MB`
- New: `846 KB -- 2.5 MB`

---

**Fix 5 — Protocol Phases table: Answer (Modulus switch) output corrected**
- Issue ref: Holistic propagation of Fix 2
- Location: Protocol Phases table, Answer (Modulus switch) row
- What changed: The 32 MB upper bound is DoublePIR's value; YPIR's response is consistently 12 KB across sizes
- Old: `12 KB -- 32 MB`
- New: `12 KB`

---

**Fix 6 — [^17]: Page reference off by one**
- Issue ref: Checkup Minor Finding 3
- Location: Footnote [^17]
- What changed: Section 1.2 is on p.4, not p.5
- Old: `Section 1.2 (p.5)`
- New: `Section 1.2 (p.4)`

---

**Fix 7 — [^42]: Section reference corrected**
- Issue ref: Checkup Minor Finding 4
- Location: Footnote [^42]
- What changed: The cited content is in Section 2.1, not Section 3
- Old: `Section 3 (p.10)`
- New: `Section 2.1 (p.10)`

---

### WhisPIR (2024) — 3 fixes applied

---

**Fix 1 — [^23] and Correctness Analysis table: B_chi should be B_Y**
- Issue ref: Checkup Minor Finding 1
- Location: Footnote [^23] and Correctness Analysis table (Fresh encryption and Key switching rows)
- What changed: The bound variable is B_Y (bound on the output), not B_chi (bound on the error); also ||e'|| corrected to ||e|| in the footnote
- Old (footnote): `B_chi` / `||e'||`
- New (footnote): `B_Y` / `||e||`
- Old (table rows): `B_chi`
- New (table rows): `B_Y`

---

**Fix 2 — [^48]: Dropped qualifier restored**
- Issue ref: Checkup Minor Finding 2
- Location: Footnote [^48]
- What changed: Added missing qualifier from the original paper text
- Old: ends at base claim
- New: added `(excluding significant changes in the database size)`

---

### Respire (2024) — 4 fixes applied

---

**Fix 1 — Cryptographic Foundation table: Failure bound formula has spurious "1 - " prefix**
- Issue ref: Checkup Incorrect Finding 1 (cross-pass persistent issue)
- Location: Cryptographic Foundation table, Correctness condition row
- What changed: The formula should not have "1 - " before the bound; Theorem 3.3 gives a direct upper bound
- Old: `Pr[fail] <= 1 - 2*d2*n_vec * exp(...)`
- New: `Pr[fail] <= 2*d2*n_vec * exp(...)`

---

**Fix 2 — [^14]: Section and page reference corrected**
- Issue ref: Checkup Minor Finding 2
- Location: Footnote [^14]
- What changed: The cited content is in Section 1.1 (p.2), not Section 4.2 (p.18)
- Old: `Section 4.2 (p.18)`
- New: `Section 1.1 (p.2)`

---

**Fix 3 — [^31]: Page reference off by one**
- Issue ref: Checkup Minor Finding 3
- Location: Footnote [^31]
- What changed: Section 1 begins on p.2, not p.1
- Old: `Section 1 (p.1)`
- New: `Section 1 (p.2)`

---

**Fix 4 — Total pages: Appendix page count overcounts**
- Issue ref: Checkup Minor Finding 4
- Location: Header metadata table, Total pages field
- What changed: The 31 non-main-body pages include 4 pages of references (pp.24-27), not just appendices
- Old: `54 (23 main body + 31 pages of appendices A-E)`
- New: `54 (23 main body + 4 pages references + 27 pages appendices A-E)`

---

### NPIR (2026) — 3 fixes applied

---

**Fix 1 — [^29]: Page reference off by one**
- Issue ref: Checkup Minor Finding 1
- Location: Footnote [^29]
- What changed: Section 1.1 is on p.3, not p.4
- Old: `Section 1.1 (p.4)`
- New: `Section 1.1 (p.3)`

---

**Fix 2 — [^34]: Page reference off by one**
- Issue ref: Checkup Minor Finding 2
- Location: Footnote [^34]
- What changed: Section 1.1 is on p.3, not p.4
- Old: `Section 1.1 (p.4)`
- New: `Section 1.1 (p.3)`

---

**Fix 3 — [^16]: Inaccurate paraphrase of server operation**
- Issue ref: Checkup Minor Finding 3
- Location: Footnote [^16]
- What changed: The paper says "performs database setup," not "converts the database format"
- Old: `"the server converts the database format (polynomial encoding + NTT conversion)."`
- New: `"the server performs database setup (polynomial encoding + NTT conversion)."`

---

### InsPIRe (2025) — 6 fixes applied

---

**Fix 1 — Table 2 (1-bit entries, 1 GB): Comparison scheme values from wrong DB size block**
- Issue ref: Checkup Incorrect Finding 1
- Location: Table 2 (1-bit entries) comparison rows for YPIR, SimpleYPIR, KSPIR, HintlessPIR
- What changed: Values were transcribed from the 8 GB block of PDF Table 2 instead of the 1 GB block. Replaced entire comparison rows with correct 1 GB values.
- Key changes: YPIR Query 1024 KB -> 384 KB, KSPIR Keys 462 KB -> 2352 KB, YPIR Total 1498 KB -> 858 KB, plus server times and throughputs updated throughout

---

**Fix 2 — Table 2: KSPIR Upload (Keys) at 1 GB**
- Issue ref: Checkup Incorrect Finding 1 (sub-finding)
- Location: Table 2, KSPIR row, Upload (Keys) column
- What changed: KSPIR keys value was wrong
- Old: `462 KB`
- New: `2352 KB`

---

**Fix 3 — Table 3 (64 B entries, 1 GB): KSPIR and HintlessPIR keys swapped**
- Issue ref: Checkup Incorrect Finding 5
- Location: Table 3, KSPIR and HintlessPIR rows, Upload (Keys) column
- What changed: The Upload (Keys) values for KSPIR and HintlessPIR were swapped; totals recalculated
- KSPIR Upload (Keys): `360 KB` -> `2352 KB` (KSPIR Total: `598 KB` -> `2590 KB`)
- HintlessPIR Upload (Keys): `128 KB` -> `360 KB` (HintlessPIR Total: `2004 KB` -> `2236 KB`)

---

**Fix 4 — Communication Breakdown table: Cites Table 2 instead of Table 3**
- Issue ref: Checkup Incorrect Finding 2
- Location: Communication Breakdown table header
- What changed: The table draws 64 B entry data, which is Table 3, not Table 2
- Old: `From Table 2 (1 GB, 64 B entry)`
- New: `From Table 3 (1 GB, 64 B entry)`

---

**Fix 5 — [^6]: Page reference off by one**
- Issue ref: Checkup Minor Finding 4
- Location: Footnote [^6]
- What changed: Section 3.2 is on p.11, not p.12
- Old: `Section 3.2 (p.12)`
- New: `Section 3.2 (p.11)`

---

**Fix 6 — [^16]: Dropped qualifier restored**
- Issue ref: Checkup Minor Finding 3
- Location: Footnote [^16]
- What changed: Added missing qualifier from the original paper text
- Old: ends at base claim
- New: added `(with multiplicative security loss proportional to the number of queries)`

---

### Pirouette (2025) — 6 fixes applied

---

**Fix 1 — Correctness Analysis table: LWEtoRGSW noise formula has two errors**
- Issue ref: Checkup Incorrect Finding 1
- Location: Correctness Analysis table, "After LWEtoRGSW (Phase 0)" row
- What changed: (a) L^2/4 should be ||s||_inf^2/4 (L is gadget basis, ||s||_inf is secret key infinity norm); (b) sigma^2_sq is additive, not inside the parentheses multiplied by N*(||s||_inf^2/4)
- Old: `sigma^2_C <= N * (L^2/4) * (sigma^2_br + sigma^2_cext + sigma^2_sq)`
- New: `sigma^2_C <= N * (||s||_inf^2 / 4) * (sigma^2_br + sigma^2_cext) + sigma^2_sq`

---

**Fix 2 — Table 7: T-Respire query size at 2^20 x 256 B**
- Issue ref: Checkup Incorrect Finding 2
- Location: Table 7 (reproduced, sequential execution), 2^20 x 256 B row, T-Respire Query Size column
- What changed: 55 B is Pirouette^H's value at that DB size, not T-Respire's
- Old: `55 B`
- New: `144 B`

---

**Fix 3 — [^7]: Theorem A.22 page range**
- Issue ref: Checkup Minor Finding 3
- Location: Footnote [^7]
- What changed: Theorem A.22 is entirely on p.26; it does not begin on p.25
- Old: `Theorem A.22 (p.25--26)`
- New: `Theorem A.22 (p.26)`

---

**Fix 4 — [^42]: Theorem A.22 page reference**
- Issue ref: Checkup Minor Finding 4
- Location: Footnote [^42]
- What changed: Theorem A.22 is on p.26, not p.25
- Old: `Theorem A.22 (p.25)`
- New: `Theorem A.22 (p.26)`

---

**Fix 5 — [^41]: Section 5.3 page reference**
- Issue ref: Checkup Minor Finding 5
- Location: Footnote [^41]
- What changed: The cited passage is on p.12, not p.13
- Old: `Section 5.3 (p.13)`
- New: `Section 5.3 (p.12)`

---

**Fix 6 — [^5]: Source location of "increases the query size from 36 B to 60 B"**
- Issue ref: Checkup Minor Finding 6
- Location: Footnote [^5]
- What changed: The exact sentence appears in Section 1.1 (p.2), not Section 4.2 (p.9)
- Old: `Section 4.2 (p.9)`
- New: `Section 1.1 (p.2)`

---

### VIA (2025) — 3 fixes applied

---

**Fix 1 — Table 1 (32 GB): HintlessPIR Offline Comp shown as "--" but PDF reports 9252.3 s**
- Issue ref: Checkup Incorrect Finding 1
- Location: Performance Benchmarks, Table 1, 32 GB section, HintlessPIR Offline Comp cell
- What changed: The 32 GB entry has a measured value in the PDF; only 1 GB and 4 GB are blank
- Old: `--`
- New: `9252.3 s`

---

**Fix 2 — [^3]: Section citation for "87.6x" figure**
- Issue ref: Checkup Minor Finding 1
- Location: Footnote [^3]
- What changed: The "87.6x" figure appears in Section 5.2 (p.17), not Section 4.2 (p.13)
- Old: `Section 4.2 (p.13)`
- New: `Section 5.2 (p.17)`

---

**Fix 3 — [^34]: Dropped phrase "in the one-hot vector length"**
- Issue ref: Checkup Minor Finding 2
- Location: Footnote [^34]
- What changed: The quote omitted a terminal phrase that specifies what the logarithmic scaling is with respect to
- Old: `"...introducing only logarithmic noise variance."`
- New: `"...introducing only logarithmic noise variance in the one-hot vector length."`

---

### Summary

| Scheme | Incorrect fixes | Minor fixes | Total fixes |
|--------|----------------|-------------|-------------|
| HintlessPIR | 1 (Fix 1) | 0 | 1 |
| YPIR | 3 (Fixes 1-3) | 4 (Fixes 4-7) | 7 |
| WhisPIR | 0 | 3 (Fixes 1-2*) | 3 |
| Respire | 1 (Fix 1) | 3 (Fixes 2-4) | 4 |
| NPIR | 0 | 3 (Fixes 1-3) | 3 |
| InsPIRe | 4 (Fixes 1-4) | 2 (Fixes 5-6) | 6 |
| Pirouette | 2 (Fixes 1-2) | 4 (Fixes 3-6) | 6 |
| VIA | 1 (Fix 1) | 2 (Fixes 2-3) | 3 |

*WhisPIR Fix 1 touched both a footnote and two table rows for the same variable-name issue.

**Total fixes applied: 33 discrete edits across 8 schemes.**

Cross-pass persistent issues resolved: 3/3
- HintlessPIR Fix 1: sqrt(ell * N) -> sqrt(ell) * N
- YPIR Fixes 1-2: 724 KB -> 2.5 MB query, 32 MB -> 12 KB response
- Respire Fix 1: removed spurious "1 - " from failure bound
