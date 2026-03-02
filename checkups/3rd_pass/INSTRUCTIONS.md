## 3rd Pass Fact-Check Instructions

You are performing a 3rd-pass fact-check of PIR engineering notes against their source research paper PDF. Two previous passes already caught and fixed many issues. Your job is to find any REMAINING issues.

### Steps

1. Read the full notes file.
2. Read the PDF using the Read tool with the `pages` parameter (e.g., pages "1-20", then "21-40", etc.). Read the ENTIRE paper — do not skip sections.
3. For EVERY claim in the notes (footnoted and unfootnoted), verify against the PDF:
   - Page/section references in footnotes
   - Quoted text accuracy (exact words, no dropped/added text)
   - Numerical values (benchmarks, complexities, parameters)
   - Mathematical expressions (correct transcription)
   - Scheme comparisons/attributions (right scheme, right numbers)
   - Units (bits vs bytes, KB vs MB)
   - Algorithmic descriptions
   - Derived calculations (check arithmetic)
4. Classify each discrepancy as INCORRECT (factually wrong) or MINOR (imprecise wording, off-by-one page ref, etc.).
5. Write findings to the specified output file.

### Known Error Patterns (from 2 previous passes — these specific issues were fixed, but similar patterns may recur):
- Wrong page/section references (most common by far)
- Values attributed to the wrong scheme (e.g., SimplePIR's number attributed to HintlessPIR)
- Arithmetic errors in derived calculations (e.g., 2048/512 = 4 not 3.5)
- Dropped/added words in quotes, or blended quotes from different source locations
- Bits/bytes unit confusion
- O(n) vs Otilde(n) tilde omission
- Editorial claims or formalizations presented as paper findings without disclaimer
- Mixed sources (body text vs table) without clarification
- Formula variable mix-ups (e.g., k! vs d!, N_d vs N*d)
- Reversed comparisons (X vs Y swapped)
- "Total" vs "online" computation not distinguished
- Conflated theorem/corollary references
- Oversimplified technical claims

### Output Format

Write a markdown file with exactly this structure:

```
## {SCHEME_NAME} — 3rd Pass Fact-Check

**Notes:** `{notes_filename}`
**PDF:** `{pdf_filename}`
**Claims checked:** N | **Issues found:** N | **Minor:** N | **Incorrect:** N

---

### INCORRECT Findings

[Detailed findings, or "None."]

---

### MINOR Issues

[Detailed findings, or "None."]
```

For each issue, include:
- The footnote reference (e.g., [^7]) if applicable
- Quote the relevant text from the notes
- Quote what the PDF actually says (with page/section)
- Explain the discrepancy

### Critical Rules
- Be PRECISE. Only flag genuine, verifiable discrepancies confirmed from the PDF.
- Do NOT flag stylistic choices, editorial decisions, or reasonable simplifications.
- Do NOT include a "Verified Footnotes" table — report only issues.
- PDF text extraction can garble complex math (nested fractions, multi-level subscripts, decorated operators). The visual page rendering is authoritative for these.
- Two-column figures may be downscaled. Fall back to prose descriptions when chart data is unclear.
