## Checking correctness of cited claims:

- reads every footnoted claim in a group's notes files
- looks up the cited page/section in the source PDF
- flags incorrect claims/citations

### 1st Pass — Feb 20, 2026

**[Issues](1st_pass/issues#1st-pass--issues-found) found:** Group [A](1st_pass/issues/Checkup_groupA.md) - [B](1st_pass/issues/Checkup_groupB.md) - [C](1st_pass/issues/Checkup_groupC.md) - [D](1st_pass/issues/Checkup_groupD.md) - [X](1st_pass/issues/Checkup_groupX.md)

**[Fixes](1st_pass/fixes#1st-pass--fixes-applied) applied:** Group [A](1st_pass/fixes/Fixes_groupA.md) - [B](1st_pass/fixes/Fixes_groupB.md) - [C](1st_pass/fixes/Fixes_groupC.md) - [D](1st_pass/fixes/Fixes_groupD.md) - [X](1st_pass/fixes/Fixes_groupX.md)

### 2nd Pass — Feb 21, 2026

**[Issues](2nd_pass/issues#2nd-pass--issues-found) found:** Group [A](2nd_pass/issues/Group%20A#group-a--fhe-based-pir) - [B](2nd_pass/issues/Group%20B#group-b--stateless-single-server-pir) - [C](2nd_pass/issues/Group%20C#group-c--client-independent-preprocessing) - [D](2nd_pass/issues/Group%20D#group-d--client-dependent-preprocessing) - [X](2nd_pass/issues/Group%20X#group-x--extensions)

**[Fixes](2nd_pass/fixes#2nd-pass--fixes-applied) applied:** Group [A](2nd_pass/fixes/Fixes_groupA.md) - [B](2nd_pass/fixes/Fixes_groupB.md) - [D](2nd_pass/fixes/Fixes_groupD.md) - [X](2nd_pass/fixes/Fixes_groupX.md)

### 3rd Pass — Mar 2, 2026

**[Issues](3rd_pass#3rd-pass--issues-found) found:** [All 34 schemes](3rd_pass/README.md) (fact-check + independent reviewer per scheme)

**[Fixes](3rd_pass/fixes#3rd-pass--fixes-applied) applied:** Group [A](3rd_pass/fixes/Fixes_groupA.md) - [B](3rd_pass/fixes/Fixes_groupB.md) - [C](3rd_pass/fixes/Fixes_groupC.md) - [D](3rd_pass/fixes/Fixes_groupD.md) - [X](3rd_pass/fixes/Fixes_groupX.md)

---

<details>
<summary><b>All INCORRECT fixes across 3 passes — before & after (39 logical errors, 19 schemes)</b></summary>

<br>

*Cross-pass issues (persisted from 1st/2nd pass) marked with †*

#### Group A — FHE Based PIR

| Scheme | Error | Before | After |
|--------|-------|--------|-------|
| [SealPIR](3rd_pass/fixes/Fixes_groupA.md) | XPIR(d=3) comparison table — 3 values from wrong DB row † | `2,560 KB` / `8.03 ms` / `3.68 s` | `4,064 KB` / `12.74 ms` / `4.84 s` |
| [XPIR-2014](3rd_pass/fixes/Fixes_groupA.md) | [^14] "per ciphertext" should be "per retrieval" | `~32 KB per ciphertext` | `~32 KB per retrieval` |
| [XPIR-2016](3rd_pass/fixes/Fixes_groupA.md) | Encryption params table column mislabeled + phantom duplicate | `"Max h_a (sums)"` + dup Security col | `"Max Sec (bits)"`, duplicate removed |
| [XPIR-2016](3rd_pass/fixes/Fixes_groupA.md) | U, D bandwidth misattributed to server | `bandwidth (U, D) from the server` | `client determines (U, D) via own test` |
| [MulPIR](3rd_pass/fixes/Fixes_groupA.md) | [^12] G₂ base in §5.2 | `log_{2^{51}} Q` | `log_{2^{53}} Q` |
| [Addra](3rd_pass/fixes/Fixes_groupA.md) | Record-size regime description | `one LPCNet frame encoding 40 ms` | `12 LPCNet frames of 8 B = 480 ms subround` |
| [CwPIR](3rd_pass/fixes/Fixes_groupA.md) | Table 6 Folklore PIR multiplicative depth † | `⌈log₂ n⌉` | `⌈log₂⌈log₂ n⌉⌉` |
| [FrodoPIR](3rd_pass/fixes/Fixes_groupA.md) | Financial cost exponent (×3 locations) | `1.3 × 10⁻³` | `1.3 × 10⁻⁵` |
| [FrodoPIR](3rd_pass/fixes/Fixes_groupA.md) | SOnionPIR financial cost (×2 locations) | `$8.8 × 10⁻⁵` | `$6.4 × 10⁻⁴` |
| [FrodoPIR](3rd_pass/fixes/Fixes_groupA.md) | PSIR / SOnionPIR security levels swapped | `SOnionPIR ≤115, PSIR ≤111` | `SOnionPIR ≤111, PSIR ≤115` |
| [FrodoPIR](3rd_pass/fixes/Fixes_groupA.md) | Table 7 row label | `2^14 × 30 KB` | `2^18 × 30 KB` |
| [ThorPIR](3rd_pass/fixes/Fixes_groupA.md) | Theorem 3.2 prior bound formula garbled | Numerator/denominator terms mixed | Corrected to match §2.5 formula |
| [ThorPIR](3rd_pass/fixes/Fixes_groupA.md) | [^7] 750 bits ≠ bootstrapping yield | `~750 bits … allowing 8 levels` | 750 bits = PRG noise consumption (no bootstrapping) |
| [ThorPIR](3rd_pass/fixes/Fixes_groupA.md) | [^15] 0.86 s/op missing GPU context | `relaxed bootstrapping at 0.86s/op` | `0.86s/op on a GPU (~50× over 43s CPU)` |

#### Group B — Stateless Single-Server PIR

| Scheme | Error | Before | After |
|--------|-------|--------|-------|
| [HintlessPIR](3rd_pass/fixes/Fixes_groupB.md) | Lemma 19 Condition 2 sqrt scope † | `√(ℓ·N) · n·σ·γ·p_j²` | `√ℓ · N · n·σ·γ·p_j²` |
| [YPIR](3rd_pass/fixes/Fixes_groupB.md) | Complexity table query size † | `724 KB` | `2.5 MB` |
| [YPIR](3rd_pass/fixes/Fixes_groupB.md) | Complexity table response size † | `32 MB` | `12 KB` |
| [YPIR](3rd_pass/fixes/Fixes_groupB.md) | Response overhead (derived from above) | `32 MB / 32 GB = 0.001×` | `12 KB / 32 GB ≈ 0` |
| [Respire](3rd_pass/fixes/Fixes_groupB.md) | Pr[fail] formula has spurious "1 −" prefix † | `Pr[fail] ≤ 1 − 2·d₂·n_vec·exp(…)` | `Pr[fail] ≤ 2·d₂·n_vec·exp(…)` |
| [InsPIRe](3rd_pass/fixes/Fixes_groupB.md) | Table 2 comparison values from 8 GB block (should be 1 GB) | YPIR Query `1024 KB`, KSPIR Keys `462 KB` | YPIR Query `384 KB`, KSPIR Keys `2352 KB` |
| [InsPIRe](3rd_pass/fixes/Fixes_groupB.md) | Table 3 KSPIR / HintlessPIR keys swapped | KSPIR `360 KB`, Hintless `128 KB` | KSPIR `2352 KB`, Hintless `360 KB` |
| [InsPIRe](3rd_pass/fixes/Fixes_groupB.md) | Communication Breakdown table source | `From Table 2` | `From Table 3` |
| [Pirouette](3rd_pass/fixes/Fixes_groupB.md) | LWEtoRGSW noise formula (two errors) | `N·(L²/4)·(σ²_br + σ²_cext + σ²_sq)` | `N·(‖s‖²_∞/4)·(σ²_br + σ²_cext) + σ²_sq` |
| [Pirouette](3rd_pass/fixes/Fixes_groupB.md) | Table 7 T-Respire query size at 2²⁰×256B | `55 B` | `144 B` |
| [VIA](3rd_pass/fixes/Fixes_groupB.md) | Table 1 HintlessPIR Offline Comp at 32 GB | `--` | `9252.3 s` |

#### Group C — Client-Independent Preprocessing

| Scheme | Error | Before | After |
|--------|-------|--------|-------|
| [SimplePIR/DoublePIR](3rd_pass/fixes/Fixes_groupC.md) | Complexity table upload/download both 345 KB † | Up `345 KB`, Down `345 KB` | Up `313 KB`, Down `32 KB` |
| [SimplePIR/DoublePIR](3rd_pass/fixes/Fixes_groupC.md) | Protocol Phases DoublePIR Answer download † | `≈345 KB` | `≈32 KB` |
| [BarelyDoublyEfficient](3rd_pass/fixes/Fixes_groupC.md) | Theorem 2.1 preprocessing exponent structure | `O(m^{2+ε} · \|R\|)` | `O(m^{2+ε·log\|R\|})` |
| [BarelyDoublyEfficient](3rd_pass/fixes/Fixes_groupC.md) | LPR10 reduction direction reversed | `worst-case → average-case` | `average-case → worst-case` |
| [IncrementalPIR](3rd_pass/fixes/Fixes_groupC.md) | Threshold formula t — extra numerator term (×5 locations) | `⌈(n log q + log√N) / …⌉` | `⌈n log q / …⌉` |
| [IncrementalPIR](3rd_pass/fixes/Fixes_groupC.md) | VeriSimplePIR "before combination" count | `(n+λ)(m+λ)` | `nm + λ·l` |

#### Group D — Client-Dependent Preprocessing

| Scheme | Error | Before | After |
|--------|-------|--------|-------|
| [IncPIR](3rd_pass/fixes/Fixes_groupD.md) | Response size | `2 KB` | `32 B` |
| [IshaiShiWichs](3rd_pass/fixes/Fixes_groupD.md) | Parity bits per hint | `8 associated parity bits` | `O(n^{1/6}) associated parity bits` |
| [RMS24](3rd_pass/fixes/Fixes_groupD.md) | Response overhead 2×/4× reversed (×3 locations) † | `2× (two-server), 4× (single)` | `4× (two-server), O(√N/λ) (single)` |

#### Group X — Extensions

| Scheme | Error | Before | After |
|--------|-------|--------|-------|
| [KeywordPIR](3rd_pass/fixes/Fixes_groupX.md) | ElGamal / Damgard-Jurik values swapped (×2 tables) | EG Up `1,480 kB`, DJ Up `280 kB` | EG Up `280 kB`, DJ Up `1,480 kB` |
| [KeywordPIR](3rd_pass/fixes/Fixes_groupX.md) | SealPIR Server Expand column-shifted † | n=1M: `590`, n=4M: `12,891` | n=1M: `294`, n=4M: `590` |
| [KeywordPIR](3rd_pass/fixes/Fixes_groupX.md) | SealPIR Server Cost (×3 locations) | n=262K: `0.0040`, n=4M: `0.017` | n=262K: `0.0033`, n=4M: `0.0067` |
| [KeywordPIR](3rd_pass/fixes/Fixes_groupX.md) | MulPIR Download (×3 tables) | `122 kB` | `119 kB` |
| [DistributionalPIR](3rd_pass/fixes/Fixes_groupX.md) | SimplePIR performance baseline conflated | `5-77× less server work` | Split: `10-195×` (vs no batch) + `5.1-77×` (vs batch codes) |

</details>
