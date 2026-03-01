## RMS24 — 3rd Pass Fact-Check

**Notes:** `RMS24_2024_notes.md`
**PDF:** `RMS24_2024_1072.pdf`
**Claims checked:** 87 | **Issues found:** 3 | **Minor:** 2 | **Incorrect:** 1 | **Rejected:** 1

---

### INCORRECT Findings

**1. Core Idea section and Complexity table: wrong response overhead for single-server**

Notes (Core Idea, line 71):
> "O(1) online response overhead (2x the insecure baseline for two servers, 4x for one server)"

Notes (Complexity table, Response overhead row):
> "2x insecure baseline (two-server); 4x (single-server)"

PDF says:

- Table 1 (p.2): Single-server "This paper" response column shows **O(√N/λ)**, not O(1) or 4x.
- Section 3.6 (p.10): "The online response overhead is O(1), or **4×** to be precise, since the online server and the offline server both send back two parities." — This 4x statement is explicitly about the **two-server** scheme.
- Section 3.6 (p.10) on single-server: "The only difference from the two-server case is that the response overhead is **O(√N/λ)** because the O(N) offline communication is amortized over 0.5λ√N online queries."

The notes have the two-server and single-server numbers reversed in the complexity table ("2x two-server; 4x single-server"), and the Core Idea sentence attributes "4x" to the single-server setting, which the paper does not support. The paper's explicit 4x claim is for two-server; single-server response overhead is O(√N/λ), not 4x. The "2x" figure for two-server comes only from the abstract's approximate phrasing ("only twice that of simply fetching"), whereas the body of the paper (Section 3.6) says 4x for two-server.

---

### MINOR Issues

**1. Systematic page-number undercount from Section 3.4 onward**

Beginning with footnotes citing §3.4, all page references in the notes are off by exactly 1 (one page too low). The notes' page assignments for early sections (§1–§3.3) are correct, but from §3.4 onward a consistent one-page shift is present. The affected footnotes and their incorrect vs. correct page references are:

| Footnote | Section cited | Notes says | PDF actual |
|----------|--------------|------------|------------|
| [^9] | §3.4 | p.7 | p.8 |
| [^17] | §3.4 | p.7 | p.8 |
| [^31] | §3.4 | p.7-8 | p.8 |
| [^1], [^10], [^14], [^22], [^23] | §3.5 | p.8 | p.9 |
| [^24] | §3.5 | p.9 | p.10 |
| [^25] | §3.5 | p.8-9 | p.9-10 |
| [^8], [^19], [^28] | §3.6 | p.9 | p.10 |
| [^21] | §3.6 | p.9 | p.10 |
| [^13], [^32], [^33], [^38], [^39], [^40], [^41], [^42] | §4.1 / §4.2 / §4.3 | p.9 or p.10 | p.11 |
| [^37] | §4.1 | p.10 | p.11 |
| [^27], [^29], [^30], [^34] | Tables 2/3 / §4.3 | p.11 | p.12 |

All quoted content and numerical values in these footnotes are correct; only the page numbers are wrong.

**2. [^12] page range slightly broad**

Notes [^12] (§2 PRF paragraph):
> "Section 2 (p.3-4)"

The PRF discussion ("PRF is one of the most common cryptographic primitives...") is contained entirely on p.3. Section 3 begins on p.4, so "p.3-4" overstates the range. Should be p.3 only.

**3. [^4] Piano PIR discussion attributed to Section 5 without page — paraphrase not flagged as such**

Notes [^4]:
> "Section 5 (p.13): Piano PIR weakens the correctness guarantee and requires non-adversarial query sequences; publishing the permutation key enables an adversary to force queries into the same partition and cause correctness failure (paraphrase of discussion on p.13)."

The notes do label this a paraphrase, which is correct. However, the relevant detailed discussion of Piano's permutation-key attack appears across both p.13 and p.14 (§5 spans both pages, and the specific piano discussion about the permutation key and partition-forcing attack continues past p.13). The single page reference "p.13" is imprecise; the discussion runs p.13–14. This is a minor range understatement, not a content error.

---

### Reviewer Verdict

**Method:** Full PDF (all 14 pages) and notes read directly. Page mapping established by anchoring Table 1 (correctly cited as p.2 in all early footnotes) and counting section positions across the 14 physical PDF pages. The printed page numbers in the ACM paper's footers are confirmed to match physical page numbers 1-for-1 throughout.

Physical page locations confirmed:
- Table 1: physical p.2 (= printed p.2) — matches notes, no offset
- §3.1: physical p.3-4 — notes cite p.4, accepted as correct by checkup
- §3.4: physical p.6 — notes cite p.7 (one too high)
- §3.5: physical p.7 — notes cite p.8 (one too high)
- §3.6: physical p.8 — notes cite p.9 (one too high)
- §4.1/4.2/4.3 + Tables: physical pp.8-10 — notes cite pp.9-11 (one too high)
- §5 Piano PIR discussion: physical p.11-12 — notes cite p.13 for [^4] (one too high for physical p.12 content; the detailed attack paraphrase is on physical p.12)
- References: physical p.13-14

The consistent pattern is that notes cite one page too high (not too low) from §3.4 onward. The checkup's table correctly identifies which footnotes are affected but incorrectly states the direction ("one page too low" / "notes say p.7, actual p.8"), when in fact notes say p.7 but actual is p.6 for §3.4, and similarly throughout. However, this direction error in the checkup's description does not change which footnotes are affected or the nature of the error — it is still a uniform off-by-one page error throughout.

---

#### INCORRECT Finding 1 — CONFIRMED

The PDF is unambiguous on both counts.

Table 1 (physical p.2): "This paper" two-server Response = O(1); "This paper" single-server Response = O(√N/λ). There is no 4x figure in the single-server row.

Section 3.6 (physical p.8, right column, two-server paragraph): "The online response overhead is O(1), or 4× to be precise, since the online server and the offline server both send back two parities." The immediately following single-server paragraph: "The only difference from the two-server case is that the response overhead is O(√N/λ) because the O(N) offline communication is amortized over 0.5λ√N online queries."

The notes' Core Idea sentence (line 71) attributes "4x" to the single-server setting and "2x" to two-server — the exact opposite of what the paper says. The Complexity table row (line 254) has the same reversal. The "2x" figure from the abstract is an approximation; Section 3.6 explicitly corrects it to "4x to be precise" for two-server. No 4x figure appears anywhere in the paper for single-server. **CONFIRMED.**

---

#### MINOR Finding 1 — CONFIRMED (direction of error in checkup description is inverted, but the finding itself is valid)

The checkup correctly identifies that notes cite one page off from §3.4 onward and lists all affected footnotes accurately. The description says "one page too low" but the actual error is one page too high (notes cite p.7 where physical/printed is p.6 for §3.4, etc.). This is an error in the checkup's prose description, not a false positive — the underlying finding that all these footnotes have wrong page numbers is correct.

The scope claim (uniform from §3.4 onward through Tables 2/3) is confirmed. Physical page mapping shows every cited section from §3.4 through §4.3 has notes citing one page higher than the actual printed page. The [^4] footnote for §5 also fits this pattern (notes cite p.13 for content on physical p.12). All quoted content and numerical values in the affected footnotes are correct; only page numbers are consistently off. **CONFIRMED** as a MINOR issue with the caveat that the checkup misstates the direction of the offset.

---

#### MINOR Finding 2 — CONFIRMED

Physical p.3 contains the PRF discussion in §2 ("PRF is one of the most common cryptographic primitives and can be instantiated from any one-way function"). Section 3 begins on the same physical page (p.3), in the right column. The PRF text does not extend to physical p.4. The notes' citation "Section 2 (p.3-4)" overstates the range; p.3 is correct. **CONFIRMED.**

---

#### MINOR Finding 3 — REJECTED (false positive)

The checkup claims the Piano PIR permutation-key discussion "continues past p.13" and should cite p.13-14. This is incorrect.

Physical p.12 contains the entire Piano PIR discussion in §5 including the permutation-key attack ("easily force the client to query many entries in the same partition and make Piano PIR fail in correctness") and the conclusion of that discussion. Physical p.13 is the references page. Under the uniform one-page offset established above, physical p.12 = printed p.13 (i.e., the notes citing [^4] as "p.13" correctly identifies the page where this content lives). Physical p.13 (references) = printed p.14, which contains no Piano PIR content.

The [^4] citation "p.13" is accurate. The discussion does not continue to p.14. The finding that it should cite "p.13-14" is a false positive. **REJECTED.**

---

### Net summary

| Finding | Checkup verdict | Reviewer verdict |
|---------|----------------|-----------------|
| INCORRECT 1: 2x/4x response overhead reversal | INCORRECT | CONFIRMED |
| MINOR 1: Systematic page-number offset from §3.4 onward | MINOR | CONFIRMED (direction in checkup prose is inverted but finding is valid) |
| MINOR 2: [^12] p.3-4 range overstated | MINOR | CONFIRMED |
| MINOR 3: [^4] p.13 range understated | MINOR | REJECTED — p.13 is correct, the discussion does not continue to p.14 |

**3 confirmed, 1 rejected.**

Header correction: 1 Incorrect, 2 Minor confirmed (MINOR Finding 3 is a false positive).
