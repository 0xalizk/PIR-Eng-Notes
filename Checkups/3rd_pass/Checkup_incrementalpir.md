## IncrementalPIR (2026) — 3rd Pass Fact-Check

**Notes:** `IncrementalPIR_2026_notes.md`
**PDF:** `IncrementalPIR_2026_030.pdf`
**Claims checked:** 36 | **Issues found:** 3 | **Minor:** 1 | **Incorrect:** 2

---

### INCORRECT Findings

**1. Threshold formula `t` — extra term in numerator (appears in multiple locations)**

The notes state in the Core Idea section:

> "t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N)))"

And in [^5], the notes quote the paper as:

> "Let t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))). When M' > t, the server computes the differences..."

And the same erroneous formula appears a third time in the Update Metrics table under "Aggregation threshold t":

> "t = ceil((n * log q + log sqrt(N)) / (log p + log sqrt(N))) — when M' > t modifications in a row, switch to row aggregation"

What the PDF actually says (Section 4.1, p. 11):

> "Let t = ⌈n log q / (log p + log √N)⌉."

The numerator in the PDF is simply `n log q`. The notes add `+ log sqrt(N)` to the numerator, which does not appear in the paper. The denominator `(log p + log √N)` is correct. This error is replicated across three distinct locations in the notes.

---

**2. VeriSimplePIR "before combination" operation count — incorrect formula in Composability table**

[^24] The Composability section states:

> "Compatible schemes: DoublePIR [26] (nm -> n operations), APIR [16] (n*sqrt(N) -> n), VeriSimplePIR [14] ((n+λ)(m+λ) -> (n+λ)), YPIR [38] (d_1 * l_1 -> d_1)"

The "before" count for VeriSimplePIR is given as `(n+λ)(m+λ)`.

What Table 1 (p. 14) actually shows for VeriSimplePIR [14]:

- Before combination: `(nm + λl)×, (nm + λl)+`
- After combination: `(n + λ)×, (n + λ)+`

The notes write `(n+λ)(m+λ)`, which expands to `nm + nλ + λm + λ²` — a different expression from `nm + λl`. The PDF uses `l` (a separate dimension parameter), not `λ`. This is a misreading of the table. The correct "before" value is `nm + λl`, not `(n+λ)(m+λ)`.

---

### MINOR Issues

**1. [^5] section quote attribution — footnote quotes text that spans p. 11 but threshold formula attribution is imprecise**

The footnote [^5] presents the threshold formula as a direct quote: "Let t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N))). When M' > t, the server computes the differences... and sums the results into an intermediate vector."

The second sentence ("When M' > t...") is a paraphrase of p. 11 prose, not a verbatim quote. The paper says: "When M' > t, the server computes the differences corresponding to all modified entries in the i-th row, multiplies them by the relevant row of A, and sums the results into an intermediate vector." The notes compress this to "the server computes the differences... and sums the results into an intermediate vector," which elides "corresponding to all modified entries in the i-th row, multiplies them by the relevant row of A." This is an ellipsis presented without ellipsis markers, which could mislead. However, since the primary error here is the wrong formula (flagged as INCORRECT above), this is a secondary concern and classified as MINOR.

---

### Reviewer Verdict

**INCORRECT 1 — Threshold formula `t` (numerator error, three locations): CONFIRMED**

PDF p. 11 states the formula as `t = ⌈n log q / (log p + log √N)⌉` — the numerator is `n log q` alone. The notes add `+ log sqrt(N)` to the numerator in all three locations (Core Idea paragraph, [^5], and the Update Metrics table). The PDF text is unambiguous: the fraction reads "n log q" over "log p + log √N" with no additional term in the numerator. Error is genuine and replicated across three distinct locations.

**INCORRECT 2 — VeriSimplePIR "before combination" operation count: CONFIRMED**

PDF Table 1 (p. 14) shows the "Before combination" entry for VeriSimplePIR [14] as `(nm + λl)×, (nm + λl)+`. The notes write `(n+λ)(m+λ)`, which expands to `nm + nλ + λm + λ²` — a different expression. The PDF uses `l` as a dimension parameter distinct from `λ`; the notes conflate the two. The misreading is confirmed by direct inspection of Table 1.

**MINOR 1 — [^5] ellipsis without markers: CONFIRMED**

PDF p. 11 reads: "the server computes the differences corresponding to all modified entries in the i-th row, multiplies them by the relevant row of **A**, and sums the results into an intermediate vector." The notes omit the middle clause without any ellipsis markers, presenting the truncation as a complete quote. The omission does not change the high-level meaning but violates verbatim-quote conventions. Confirmed as a minor issue, secondary to INCORRECT 1 which affects the same footnote.

---

**Revised summary: 2 INCORRECT, 1 MINOR — counts unchanged, all findings confirmed, no false positives.**
