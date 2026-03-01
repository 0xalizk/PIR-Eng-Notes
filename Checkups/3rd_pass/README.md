### 3rd Pass — Issues Found

- fact-checked all 34 notes files against source PDFs (one agent per scheme)
- verified every claim: footnoted citations, tables, protocol descriptions, complexity expressions, benchmarks, quotes
- classified discrepancies as Incorrect or Minor
- a second reviewer agent independently re-verified each finding, rejecting false positives and reclassifying severity
- guided by [3rd-pass instructions](INSTRUCTIONS.md) and the [validate-footnotes](../../.claude/skills/validate-footnotes/SKILL.md) skill

| Group | Claims | ${\color{green}\textsf{Confirmed}}$ | ${\color{orange}\textsf{Minor}}$ | ${\color{red}\textsf{Incorrect}}$ | ${\color{gray}\textsf{Rejected}}$ | Papers | Checkup Reports |
|-------|--------|-----------|-------|-----------|----------|--------|-----------------|
| A | 566 | 32 | 16 | 16 | 5 | 11 | [SealPIR](Checkup_sealpir.md), [XPIR-2014](Checkup_xpir_2014.md), [XPIR-2016](Checkup_xpir_2016.md), [MulPIR](Checkup_mulpir.md), [OnionPIR](Checkup_onionpir.md), [OnionPIRv2](Checkup_onionpirv2.md), [Addra](Checkup_addra.md), [CwPIR](Checkup_cwpir.md), [Spiral](Checkup_spiral.md), [FrodoPIR](Checkup_frodopir.md), [ThorPIR](Checkup_thorpir.md) |
| B | 438 | 28 | 17 | 11 | 2 | 8 | [HintlessPIR](Checkup_hintlesspir.md), [YPIR](Checkup_ypir.md), [WhisPIR](Checkup_whispir.md), [Respire](Checkup_respire.md), [NPIR](Checkup_npir.md), [InsPIRe](Checkup_inspire.md), [Pirouette](Checkup_pirouette.md), [VIA](Checkup_via.md) |
| C | 198 | 13 | 7 | 6 | 2 | 4 | [SimplePIR/DoublePIR](Checkup_simplepir_doublepir.md), [VeriSimplePIR](Checkup_verisimplepir.md), [BarelyDoublyEfficient](Checkup_barelydoublyefficient.md), [IncrementalPIR](Checkup_incrementalpir.md) |
| D | 471 | 24 | 21 | 3 | 4 | 9 | [CK20](Checkup_ck20.md), [IncPIR](Checkup_incpir.md), [IshaiShiWichs](Checkup_ishaishiwichs.md), [Piano](Checkup_piano.md), [Plinko](Checkup_plinko.md), [RMS24](Checkup_rms24.md), [SinglePass](Checkup_singlepass.md), [TreePIR](Checkup_treepir.md), [WangRen](Checkup_wangren.md) |
| X | 99 | 11 | 4 | 7 | 1 | 2 | [KeywordPIR](Checkup_keywordpir.md), [DistributionalPIR](Checkup_distributionalpir.md) |
| **Total** | **1,772** | **108** | **65** | **43** | **14** | **34** | |

#### Methodology

- **Fact-checker agent** (×34, parallel): Read the full notes file and entire PDF. Verified every claim — footnoted citations, unfootnoted table values, protocol phase descriptions, complexity expressions, benchmark numbers, quoted text. Classified each discrepancy as INCORRECT (factually wrong) or MINOR (imprecise wording, off-by-one page ref, dropped qualifier, etc.).
- **Reviewer agent** (×34, sequential per scheme): Independently re-read the checkup report, notes, and PDF. For each reported finding, classified as CONFIRMED or REJECTED (false positive). Upgraded severity where warranted (e.g., CwPIR depth error MIN→INC, InsPIRe table swap MIN→INC). Appended a `### Reviewer Verdict` section to each checkup file.
- **False-positive rate:** 14 of 122 original findings (11.5%) were rejected by reviewers.

#### Common error patterns found in this pass

- **Table value misattribution** (most common): Values from the wrong row, column, or table section (e.g., YPIR values from 8 GB block labeled as 1 GB; ElGamal/Damgard-Jurik swaps in KeywordPIR; DoublePIR upload/download conflated)
- **Off-by-one page references**: Systematic page offsets in RMS24 (all footnotes from §3.4 onward), individual off-by-one errors in many schemes
- **Formula transcription errors**: Square root scope errors (HintlessPIR √(ℓN) vs √ℓ·N), garbled prior-bound formulas (ThorPIR Morris et al. bound)
- **Missing context qualifiers**: GPU vs CPU not distinguished (ThorPIR 0.86s), dropped parenthetical phrases from quotes
- **Reversed comparisons**: Two-server vs single-server overhead swapped (RMS24), security levels transposed (FrodoPIR)
- **Wrong exponents/magnitudes**: FrodoPIR 10^{-3} vs 10^{-5} (two orders of magnitude)
