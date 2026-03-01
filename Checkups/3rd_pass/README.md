### 3rd Pass — Issues Found

- fact-checked all 34 notes files against source PDFs (one agent per scheme)
- verified every claim: footnoted citations, tables, protocol descriptions, complexity expressions, benchmarks, quotes
- classified discrepancies as Incorrect or Minor
- a second reviewer agent independently re-verified each finding, rejecting false positives and reclassifying severity
- guided by [3rd-pass instructions](INSTRUCTIONS.md) and the [validate-footnotes](../../.claude/skills/validate-footnotes/SKILL.md) skill

| Group | Claims | ${\color{green}\textsf{Confirmed}}$ | ${\color{orange}\textsf{Minor}}$ | ${\color{red}\textsf{Incorrect}}$ | ${\color{gray}\textsf{Rejected}}$ | Papers | Checkup Reports |
|-------|--------|-----------|-------|-----------|----------|--------|-----------------|
| A | 566 | 32 | 16 | 16 | 5 | 11 | [SealPIR](issues/Group%20A/Checkup_sealpir.md), [XPIR-2014](issues/Group%20A/Checkup_xpir_2014.md), [XPIR-2016](issues/Group%20A/Checkup_xpir_2016.md), [MulPIR](issues/Group%20A/Checkup_mulpir.md), [OnionPIR](issues/Group%20A/Checkup_onionpir.md), [OnionPIRv2](issues/Group%20A/Checkup_onionpirv2.md), [Addra](issues/Group%20A/Checkup_addra.md), [CwPIR](issues/Group%20A/Checkup_cwpir.md), [Spiral](issues/Group%20A/Checkup_spiral.md), [FrodoPIR](issues/Group%20A/Checkup_frodopir.md), [ThorPIR](issues/Group%20A/Checkup_thorpir.md) |
| B | 438 | 28 | 17 | 11 | 2 | 8 | [HintlessPIR](issues/Group%20B/Checkup_hintlesspir.md), [YPIR](issues/Group%20B/Checkup_ypir.md), [WhisPIR](issues/Group%20B/Checkup_whispir.md), [Respire](issues/Group%20B/Checkup_respire.md), [NPIR](issues/Group%20B/Checkup_npir.md), [InsPIRe](issues/Group%20B/Checkup_inspire.md), [Pirouette](issues/Group%20B/Checkup_pirouette.md), [VIA](issues/Group%20B/Checkup_via.md) |
| C | 198 | 13 | 7 | 6 | 2 | 4 | [SimplePIR/DoublePIR](issues/Group%20C/Checkup_simplepir_doublepir.md), [VeriSimplePIR](issues/Group%20C/Checkup_verisimplepir.md), [BarelyDoublyEfficient](issues/Group%20C/Checkup_barelydoublyefficient.md), [IncrementalPIR](issues/Group%20C/Checkup_incrementalpir.md) |
| D | 471 | 24 | 21 | 3 | 4 | 9 | [CK20](issues/Group%20D/Checkup_ck20.md), [IncPIR](issues/Group%20D/Checkup_incpir.md), [IshaiShiWichs](issues/Group%20D/Checkup_ishaishiwichs.md), [Piano](issues/Group%20D/Checkup_piano.md), [Plinko](issues/Group%20D/Checkup_plinko.md), [RMS24](issues/Group%20D/Checkup_rms24.md), [SinglePass](issues/Group%20D/Checkup_singlepass.md), [TreePIR](issues/Group%20D/Checkup_treepir.md), [WangRen](issues/Group%20D/Checkup_wangren.md) |
| X | 99 | 11 | 4 | 7 | 1 | 2 | [KeywordPIR](issues/Group%20X/Checkup_keywordpir.md), [DistributionalPIR](issues/Group%20X/Checkup_distributionalpir.md) |
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
