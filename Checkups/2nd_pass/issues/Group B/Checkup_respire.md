## Respire (2024) — Footnote Validation

**Notes:** [Respire_2024_notes.md](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md)
**PDF:** [Respire_2024_1165.pdf](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_1165.pdf)
**Total footnotes:** 37 | **Correct:** 35 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**[\[^25\]](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md#user-content-fn-25-c713fa9a3f971101b991bae9dd9bdb2c)** — The notes say the query size reduction factor is "d/h (e.g., 2048/512 = 3.5x in Respire)" but 2048/512 = 4, not 3.5; the paper's 3.5x figure (p.10) comes from the concrete query size ratio 14 KB / 4 KB, not from the ring dimension ratio d1/d2.

**[\[^34\]](../../../../Schemes/Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md#user-content-fn-34-c713fa9a3f971101b991bae9dd9bdb2c)** — The body text pairs the paper's "~26% slower" claim with the Table 1 numbers "(20.84 s vs 15.44 s)" but those numbers yield ~35% slower, not ~26%; the footnote itself faithfully quotes the paper, so the discrepancy is between the parenthetical context and the cited figure.
