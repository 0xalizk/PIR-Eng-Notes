## Piano (2023) — 3rd Pass Fact-Check

**Notes:** `Piano_2023_notes.md`
**PDF:** `Piano_2023_452.pdf`
**Claims checked:** 51 | **Issues found:** 3 | **Minor:** 3 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**1. [^38] "150x speedup" attributed to LAN — should be WAN**

Notes text (footnote 38):
> "Section 1.1 (p.3) and Table 2 (p.12): 'This represents over 150x speedup relative to SimplePIR' (LAN); over WAN, Piano is 72.6 ms vs SimplePIR's extrapolated 10.9 s."

PDF p.3 says:
> "Our scheme achieves **73ms** response time, whereas SimplePIR suffers from 11s or higher response time. **This represents over 150× speedup relative to SimplePIR.**"

This sentence appears in the context of the WAN 100GB / 60ms RTT experiment described in Section 1.1. The 150× figure is the WAN speedup, not the LAN speedup. The LAN speedup at 100GB is ~915× (Table 1, 11.9ms vs 10.9s). The label "(LAN)" in the footnote is therefore incorrect — it should read "(WAN)". The body text of the notes is unaffected; only the footnote annotation mislabels the network condition.

---

**2. [^51] Page reference off by one — TreePIR comparison is on p.15, not p.16**

Notes text (footnote 51):
> "Section 5 (p.16): 'For an 8GB database with 2^28 entries, the best amortized online time results reported in TreePIR are 23ms for the non-recursive scheme and 84ms for the recursive scheme. For comparison, our scheme has an amortized 8ms per-query time under the same setting with 4x local storage.'"

The quoted passage appears in Section 5 "Additional Related Work," Multi-server PIR schemes paragraph (PDF p.15), not p.16. Page 16 is Section 6 "Limitations and Suitable Use Cases." The quote itself is accurate; only the page reference is off by one.

---

**3. [^16] Quoted text from Figure 1 does not match the source**

Notes text (footnote 16):
> "Figure 1 (p.6): 'Update backup table: for each chunk j and k in [M_2], let p_bar_{j,k} <- p_bar_{j,k} XOR DB[Set(sk_bar_{j,k})[j]].'"

PDF Figure 1 (p.6) actually reads:
> "Update backup table: for i ∈ {0, 1, . . . , √n − 1}/{j} and k ∈ [M_2], let p̄_{i,k} ← p̄_{i,k} ⊕ DB[Set(s̄k_{i,k})[j]]."

The footnote is presented with quotation marks but the text does not match. The Figure 1 loop variable is `i` ranging over all chunks except the current chunk `j` (i.e., `{0,...,√n−1}/{j}`), and the updated entry is indexed by `i`, not `j`. The notes' version substitutes `j` for `i` throughout, which obscures the fact that the update excludes the chunk currently being processed. This is an inaccurate quotation; the semantic description in the surrounding notes prose (section Key Data Structures) is correct in substance but the inline "quote" misrepresents the figure.

---

### Reviewer Verdict

All three issues verified against primary sources (PDF p.3, p.6, p.15–16) and the notes file. No false positives found. Summary counts stand unchanged.

**Issue 1 — [^38] "(LAN)" label on the 150x speedup: CONFIRMED**

PDF p.3 is unambiguous. The 150× figure is introduced in a paragraph that opens "We conducted an experiment on a 100GB database with a 60ms RTT coast-to-coast connection" — this is the WAN experiment. The LAN 100GB speedup is ~915× (Table 1: 11.9 ms vs 10.9 s). The footnote annotation "(LAN)" is factually wrong; the parenthetical should read "(WAN)". Severity: Minor (body text of the notes is correct; only the footnote parenthetical is mislabeled).

**Issue 2 — [^51] Page reference p.16 vs p.15: CONFIRMED**

The TreePIR quoted passage ("For an 8GB database with 2^28 entries...") appears in the final paragraph of the Multi-server PIR schemes subsection, which sits entirely on PDF p.15. Section 6 "Limitations and Suitable Use Cases" opens at the top of p.16. The section number (Section 5) is correct; only the page number is off by one. Severity: Minor (quote is verbatim accurate).

**Issue 3 — [^16] Figure 1 loop variable substituted j for i: CONFIRMED**

PDF Figure 1 (p.6) reads: "for i ∈ {0, 1, . . . , √n − 1}/{j} and k ∈ [M_2], let p̄_{i,k} ← p̄_{i,k} ⊕ DB[Set(s̄k_{i,k})[j]]." The footnote replaces every occurrence of `i` with `j`, collapsing the distinction between the outer loop variable (all chunks except the current one) and the chunk index being downloaded. The surrounding prose in the notes is substantively correct, but the passage is presented with quotation marks and does not match the source. Severity: Minor (the notes' Key Data Structures section describes the mechanic correctly; the error is confined to the inline pseudo-quote in the footnote).
