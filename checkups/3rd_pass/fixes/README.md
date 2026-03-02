### 3rd Pass — Fixes Applied

Applied fixes for all confirmed 3rd-pass issues plus unresolved issues persisting from 1st/2nd passes. Each fix was verified against the source PDF. An independent reviewer agent re-checked every fix for correctness, completeness, and regressions.

| Group | Schemes | Fixes | Cross-pass fixes | Review |
|-------|---------|-------|-----------------|--------|
| [A](Fixes_groupA.md) | 11 | 31 | SealPIR comparison table, [^8], [^9]; CwPIR depth; XPIR-2016 [^36] | [PASS](Review_groupA.md) |
| [B](Fixes_groupB.md) | 8 | 33 | HintlessPIR sqrt scope, YPIR table values, Respire Pr[fail] table | [PASS](Review_groupB.md) |
| [C](Fixes_groupC.md) | 4 | 16 | SimplePIR/DoublePIR 345 KB in Complexity + Protocol Phases tables | [PASS](Review_groupC.md) |
| [D](Fixes_groupD.md) | 9 | 37 | RMS24 2x/4x reversal + systematic page offset | [PASS](Review_groupD.md) |
| [X](Fixes_groupX.md) | 2 | 12 | KeywordPIR Table 3 column shift, ElGamal/Damgard-Jurik swaps | [PASS](Review_groupX.md) |
| **Total** | **34** | **129** | | **5/5 PASS** |

#### Approach

- **Holistic fixes**: when correcting a value, searched the entire notes file for all occurrences (tables, prose, footnotes) to avoid the incomplete-fix pattern that caused issues to persist across passes
- **Cross-pass persistent issues**: 8 issues that survived from 1st/2nd passes were prioritized — root cause was footnote-only fixes that left sibling tables unchanged
- **Independent review**: a separate agent re-read each fixed notes file and PDF to verify correctness, completeness, and absence of regressions
