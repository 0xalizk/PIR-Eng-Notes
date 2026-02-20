---
name: validate-footnotes
description: Validate footnoted citations in PIR engineering notes against source PDFs — supports validating an entire group or a single scheme
argument-hint: "[group or scheme name]"
---

# Validate Footnotes

Verify every footnoted citation in engineering notes against the source PDF. Supports two scopes: an entire group or a single scheme. NEVER enter plan mode. Execute directly.

## 1. Locate inputs

- **Notes files**: `Schemes/<Group Directory>/<scheme>/<scheme>_notes.md`
- **Source PDFs**: in the same directory as the notes file (one PDF per scheme)

**Scope** (determined by the user's request):
- **Whole group**: process all schemes in the specified group (A, B, C, D, or X)
- **Single scheme**: process only the specified scheme's notes file

## 2. For each notes file

Read the markdown and extract every `[^N]` footnote definition. For each footnote, check **all** of the following against the source PDF:

| Check | What to verify |
|-------|---------------|
| **Page number** | Cited page matches where the content actually appears (off-by-one is the most common error) |
| **Section/figure/table number** | Cited section, figure, or table is correct |
| **Quoted text** | If the footnote quotes the paper, verify it's verbatim — flag omitted qualifiers ("roughly", "approximately"), inserted words, or truncated context that changes meaning |
| **Numerical values** | Numbers match the paper exactly — check for swapped table rows/columns, wrong parameter sets, or misattributed values from adjacent entries |
| **Units** | Bits vs bytes, KB vs KiB, ms vs s — unit errors propagate into order-of-magnitude discrepancies |
| **Arithmetic** | If the footnote derives a value (e.g., "9 * 46 * 4096 bits = ~27 KB"), verify the math |
| **Attribution** | The claim is attributed to the correct paper, not to an external document or a paper that postdates the source |
| **Editorial vs citation** | Flag when subjective commentary (e.g., "below the typical 128-bit target") is mixed into what appears to be a cited claim |

## 3. Classify each footnote

Use exactly these three categories:

| Verdict | Criteria | Examples |
|---------|----------|----------|
| **Correct** | Claim, location, and values all match the PDF | — |
| **Minor** | Core claim is right but has a small error that doesn't change the technical meaning | Wrong page (off by 1-2), truncated quote missing a qualifier, slightly imprecise section reference, close paraphrase labeled as quote |
| **Incorrect** | Factual error that misrepresents what the paper says | Fabricated data point, wrong numerical value (>2x off), bits/bytes confusion, claim attributed to wrong source, arithmetic error in derived value |

## 4. Output format

**File naming** — append a `YYYYMMDD_HHMM` timestamp so new checkups never overwrite previous ones:
- **Whole group**: `Checkups/Checkup_group<X>_<YYYYMMDD_HHMM>.md`
- **Single scheme**: `Checkups/Checkup_<scheme>_<YYYYMMDD_HHMM>.md`

Examples: `Checkup_groupA_20260219_1430.md`, `Checkup_sealpir_20260219_1430.md`

Use this exact structure (adapt the header line for single-scheme scope):

```markdown
## Group <X> Footnote Validation Report
<!-- or for single scheme: ## <Scheme> Footnote Validation Report -->

**Date:** <YYYY-MM-DD>
**Scope:** All <N> engineering notes in Group <X> (<Group Name>)
<!-- or for single scheme: **Scope:** <Scheme> (<Year>), Group <X> -->
**Method:** Each footnote's cited location was checked against the source PDF to verify correctness of the claim, quote, page number, and section reference.

---

### Summary

| # | Paper | Notes File | Total FN | Correct | Minor | Incorrect |
|---|-------|-----------|----------|---------|-------|-----------|
| 1 | <Name> (<Year>) | `<path>` | <N> | <N> | <N> | <N> |
| ... | ... | ... | ... | ... | ... | ... |
| | **TOTALS** | | **<N>** | **<N>** | **<N>** | **<N>** |

**Accuracy rate:** <N>/<Total> = **<X>%** fully correct, <N>/<Total> = **<X>%** correct or minor, <N>/<Total> = **<X>%** incorrect

---

### INCORRECT Findings (<N> total)

#### 1. <Paper> — [^N]: <Short description>

- **Statement in notes:** "<exact text from the notes>"
- **Cited location:** <what the footnote claims>
- **What the PDF actually says:** <what you found>
- **Problem:** <precise explanation of the error>

---

### MINOR Issues by Paper

#### <Paper> (<Year>) — <N> minor issues

**[^N]** — <One-line explanation of the issue.>
```

Key formatting rules:
- INCORRECT findings come first, with full detail (statement / cited location / actual / problem)
- MINOR issues come second, grouped by paper, one line each
- Correct footnotes are only counted in the summary table, not listed individually
- Papers in the summary table are ordered as they appear in the group's root README
- When referencing repo files, use short hyperlinks — never write out raw paths as plain text:
  - Notes file: `[SealPIR notes](Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md)`
  - Source PDF: `[SealPIR PDF](Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/SealPIR_2018.pdf)`

## 5. Footnote hyperlinks in fix/checkup files

When a fix or checkup file refers to a specific footnote (e.g., `[^36]`), it **must** be a clickable hyperlink that goes directly to the **footnote body** at the bottom of the rendered GitHub page — not to the in-text reference in the middle.

GitHub renders footnote bodies with anchors in the format:

```
#user-content-fn-NAME-HASH
```

where `HASH` is a 32-character hex string unique to each file (same hash for all footnotes within one file, but different across files). This hash is **not deterministic from local data** — it must be scraped from the rendered GitHub page. It is stable across page loads but changes when file content changes.

**To create a footnote hyperlink:**

1. Get the per-file hash by curling the file's GitHub page and extracting it:
   ```
   curl -s https://github.com/<REPO>/blob/main/<PATH> | grep -oP 'user-content-fn-\w+-\K[a-f0-9]{32}' | head -1
   ```
2. Build the link: `[\[^N\]](../../../<URL-encoded-path>#user-content-fn-N-HASH)`
   - Escape the brackets (`\[^N\]`) so GitHub doesn't treat it as footnote syntax
   - URL-encode spaces as `%20` in the path
   - Use the correct relative path prefix for the fix file's location

**Example:**
```markdown
[\[^36\]](../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md#user-content-fn-36-e88a300f49f79b7b67cb031ed32aaa68)
```

**Important caveats:**
- Hashes change when file content changes, so after any edit to a notes file, re-scrape its hash and update all fix file links that reference it
- GitHub strips `<a>` tags from inside `[^N]:` footnote definitions, so custom anchors cannot be injected
- The hash differs between the GitHub API and the web view — always scrape from the web view

## 6. Common pitfalls to watch for

These are the most frequent error patterns found across 1300+ validated footnotes in this repo:

1. **Off-by-one page numbers** — the most common minor issue; often caused by PDF page numbers vs printed page numbers
2. **Table row/column misattribution** — citing values from an adjacent row or the wrong parameter column
3. **Fabricated intermediate data** — inserting a data point between two real ones that the paper doesn't provide
4. **Bits vs bytes** — causes ~8x discrepancies; always verify units explicitly
5. **Citing external documents** — footnotes should only reference the scheme's own paper, not SKILL files or other papers
6. **Truncated quotes that change meaning** — omitting "roughly", "approximately", "in EXPAND", or other qualifiers
7. **Editorial claims dressed as citations** — subjective interpretations (e.g., "below typical security targets") presented as if the paper said them
