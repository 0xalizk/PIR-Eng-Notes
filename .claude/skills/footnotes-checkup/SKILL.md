---
name: footnotes-checkup
description: Validate footnoted citations in PIR engineering notes against source PDFs — supports validating an entire group or a single scheme
argument-hint: "[group or scheme name]"
---

# Footnotes Checkup

Verify every `[^N]` footnoted citation in engineering notes against the source PDF. Scope is strictly footnotes — for a full validation including unfootnoted tables, protocol descriptions, and complexity expressions, use `/full-checkup` instead. Supports two scopes: an entire group or a single scheme. NEVER enter plan mode. Execute directly.

## 1. Critical rules

- Be PRECISE. Only flag genuine, verifiable discrepancies confirmed from the PDF.
- Do NOT flag stylistic choices, editorial decisions, or reasonable simplifications — unless the simplification introduces a factual error or omits a qualifier that changes the scope of the claim (e.g., dropping "for some parameter sets" makes a conditional claim unconditional).
- Do NOT include a "Verified Footnotes" table — report only issues.

## 2. Locate inputs

- **Notes files**: `research/<Group Directory>/<scheme>/<scheme>_notes.md`
- **Source PDFs**: in the same directory as the notes file (one PDF per scheme)

**Scope** (determined by the user's request):
- **Whole group**: process all schemes in the specified group (A, B, C, D, or X)
- **Single scheme**: process only the specified scheme's notes file

## 3. For each notes file

Read the markdown and extract every `[^N]` footnote definition. Read the PDF using the Read tool with the `pages` parameter (e.g., pages "1-20", then "21-40", etc.). Read the ENTIRE paper — do not skip sections.

For each footnote, check **all** of the following against the source PDF:

| Check | What to verify |
|-------|---------------|
| **Page number** | Cited page matches where the content actually appears (off-by-one is the most common error) |
| **Section/figure/table number** | Cited section, figure, or table is correct |
| **Quoted text** | If the footnote quotes the paper, verify it's verbatim — flag omitted qualifiers ("roughly", "approximately"), inserted words, truncated context that changes meaning, or blended quotes (text spliced from non-adjacent locations presented as a single continuous quotation) |
| **Numerical values** | Numbers match the paper exactly — check for swapped table rows/columns, wrong parameter sets, or misattributed values from adjacent entries — see Section 5 |
| **Units** | Bits vs bytes, KB vs KiB, ms vs s — unit errors propagate into order-of-magnitude discrepancies |
| **Arithmetic** | If the footnote derives a value (e.g., "9 * 46 * 4096 bits = ~27 KB"), verify the math |
| **Attribution** | The claim is attributed to the correct paper, not to an external document or a paper that postdates the source |
| **Editorial vs citation** | Flag when subjective commentary (e.g., "below the typical 128-bit target") is mixed into what appears to be a cited claim |
| **Figures and plots** | If the footnote cites a figure, verify data points against axis labels, legend entries, and units — see Section 5 |
| **Table values** | Verify the correct row, column, and parameter set — watch for multi-level headers and adjacent-row swaps — see Section 5 |
| **Mathematical notation** | Verify asymptotic expressions, variable definitions, theorem statements, and concrete vs asymptotic claims — see Section 5 |

## 4. Classify each footnote

Use exactly these three categories:

| Verdict | Criteria | Examples |
|---------|----------|----------|
| **Correct** | Claim, location, and values all match the PDF | — |
| **Minor** | Core claim is right but has a small error that doesn't change the technical meaning | Wrong page (off by 1-2), truncated quote missing a qualifier, slightly imprecise section reference, close paraphrase labeled as quote |
| **Incorrect** | Factual error that misrepresents what the paper says | Fabricated data point, wrong numerical value (>2× off), bits/bytes confusion, claim attributed to wrong source, arithmetic error in derived value |

If a seemingly small error changes the value by more than 2× or changes the asymptotic class (e.g., O(log n) vs O(log log n)), classify it as INCORRECT even if the surrounding claim structure is correct.

## 5. Reading figures, tables, math, and PDFs

### PDF parsing caveats

- **Math garbling in text layer:** For expressions with fraction bars, multi-level subscripts, or decorated operators (hat, tilde, norm bars), the rendered page image is authoritative — the text-extraction layer may garble these. Common failures: ⌊q/p⌋ loses floor brackets → `q/p`; R_{n,q} collapses subscript levels → `R_q`; ‖v‖_∞ loses double bars → `|v|∞`; `mod q` drops silently.
- **Figure downscaling:** Academic paper pages are automatically downscaled for processing; two-column figures are especially affected. When axis labels or legend text appear unclear, fall back to the paper's prose description of the same figure or adjacent tables.
- **Landscape pages:** Wide comparison tables or parameter tables may be landscape-oriented. If a table's column headers appear garbled or truncated, consider that the page may be rotated.

### Figures and plots

- **Read axis labels and units first** before interpreting data points. A log-scale axis changes the meaning of visual distances between points.
- **Match data series to legend entries** — plots with multiple lines/bars often have overlapping colors. Confirm which series the footnote is referencing by checking the legend text, not just position.
- **Distinguish reported vs interpolated values** — if the footnote cites a specific data point (e.g., "throughput of 1.2 GB/s at N=2^20"), verify that exact (N, value) pair appears as a plotted point, not just somewhere along a trend line.
- **Caption vs body text** — figure captions sometimes state different numbers than the surrounding prose. Check which the footnote is actually citing.

### Tables

- **Identify the parameter set** — benchmark tables typically have multiple columns for different configurations (database size, element size, security parameter). Verify the footnote cites the correct column, not an adjacent one.
- **Watch for multi-level headers** — tables with merged header cells (e.g., "Upload" spanning "Query" and "Key" sub-columns) are a common source of column misattribution.
- **Row identity** — when multiple schemes appear in the same table, verify the footnote attributes the value to the correct row. Adjacent rows with similar values are frequently swapped.
- **Table footnotes vs paper footnotes** — some tables have their own footnotes (often marked with symbols like †, ‡, or lowercase letters). These may qualify or override the main cell values.
- **Units in table headers** — check if the header specifies units (e.g., "Time (ms)" vs "Time (s)") separately from the cell values. The footnote may convert units without stating so.

### Mathematical notation

- **Asymptotic notation** — verify the exact expression inside O(·), Õ(·), Ω(·). Common errors: dropping log factors, confusing O(n) with O(n log n), or writing O(√n) when the paper says O(n^{1/2} · log n).
- **Variable definitions** — confirm that variables in the footnote match the paper's definitions. Papers often reuse symbols (n, N, d, k, λ) with different meanings across sections. Check which definition is in scope at the cited location.
- **Theorem/lemma statements** — when a footnote cites a theorem, verify the exact statement including all conditions and quantifiers. Dropping "for sufficiently large n" or "with overwhelming probability" can change the claim.
- **Concrete vs asymptotic** — flag when the footnote conflates a concrete instantiation (e.g., "128-bit security") with an asymptotic statement (e.g., "λ-bit security"), or vice versa.
- **Subscripts and superscripts** — in markdown notes, expressions like `n^{1/3}` or `log_2(n)` may not perfectly mirror the PDF's typeset notation. Verify the mathematical content matches even if the formatting differs.
- **Summations, products, and bounds** — when the footnote reproduces a formula, check every term: base, exponent, index range, and any floor/ceiling operators.

## 6. Common pitfalls

These overlap with checks in Sections 3 and 5 but are called out separately because they are the most frequent sources of confirmed errors across 1300+ validated footnotes in this repo:

1. **Off-by-one page numbers** — the most common minor issue; often caused by PDF page numbers vs printed page numbers
2. **Table row/column misattribution** — citing values from an adjacent row or the wrong parameter column
3. **Wrong-scheme attribution** — citing a value that belongs to a different scheme in the same comparison table or benchmark set
4. **Fabricated intermediate data** — inserting a data point between two real ones that the paper doesn't provide
5. **Bits vs bytes** — causes ~8× discrepancies; always verify units explicitly
6. **Formula transcription errors** — square root scope errors, wrong exponent structure, extra/missing terms, variable name swaps (k for d, N_d for N*d)
7. **Truncated quotes that change meaning** — omitting "roughly", "approximately", "in EXPAND", or other qualifiers
8. **Editorial claims dressed as citations** — subjective interpretations (e.g., "below typical security targets") presented as if the paper said them
9. **Citing external documents** — footnotes should only reference the scheme's own paper, not SKILL files or other papers
10. **O(n) vs Õ(n) tilde omission** — dropping polylog factors changes the asymptotic claim

## 7. Output format

**One file per scheme.** Every scheme gets its own checkup file, even when validating a whole group.

**File naming:** `Checkups/<pass>/issues/Checkup_<scheme>.md`

**When validating a whole group**, create one file per scheme in that group (e.g., 11 files for Group A).

### Template

```markdown
## <Scheme> (<Year>) — <Pass> Footnote Checkup

**Notes:** `<scheme>_notes.md`
**PDF:** `<paper>.pdf`
**Total footnotes:** <N> | **Correct:** <N> | **Minor:** <N> | **Incorrect:** <N>

---

### INCORRECT Findings

**1. [^N]: <Short description>**

- **Statement in notes:** "<exact text from the notes>"
- **Cited location:** <what the footnote claims>
- **What the PDF actually says:** <what you found>
- **Problem:** <precise explanation of the error>

---

### MINOR Issues

**1. [^N]** — <Explanation of the issue.>
```

### Formatting rules

- INCORRECT findings come first, with full detail (statement / cited location / actual / problem)
- MINOR issues come second, with a brief explanation each
- Correct footnotes are not listed — only counted in the header stats
- If there are no INCORRECT findings, write `None.` under the heading
- If there are no MINOR issues, write `None.` under the heading
- When multiple findings share the same root cause (e.g., a systematic page-number offset affecting many footnotes), combine them into a single finding with a summary table listing affected instances

### Reviewer Verdict section

When a separate reviewer agent verifies findings, append a `### Reviewer Verdict` section to the checkup file:

- Each finding gets a **CONFIRMED** or **REJECTED** verdict with a one-line evidence sentence
- If severity was upgraded (e.g., MINOR → INCORRECT), note the change and reason
- Add `**Rejected:** <N>` to the header stats if any findings are rejected; the header counts should reflect only confirmed findings

### Footnote hyperlinks

Every `[^N]` reference in output files should be hyperlinked to the footnote definition in the notes file when feasible. Use the anchor format `#user-content-fn-N` (e.g., `[\[^N\]](path/to/notes.md#user-content-fn-N)`). This is a best-effort convention — bare `[^N]` references are acceptable when constructing links is impractical.
