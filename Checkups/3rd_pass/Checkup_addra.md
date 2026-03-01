## Addra / FastPIR (2021) — 3rd Pass Fact-Check

**Notes:** `addra_2021_notes.md`
**PDF:** `Addra_FastPIR_2021_044.pdf`
**Claims checked:** 43 | **Issues found:** 2 | **Minor:** 1 | **Incorrect:** 1

---

### INCORRECT Findings

**1. Record-size description in header table — "96 bytes" misattributed to a single voice frame**

Notes (header table):
> **Record-size regime** | Small (96 bytes — one LPCNet voice frame encoding 40 ms audio)

PDF p.9 (§6, Setup and method):
> "This configuration results in a fixed message size of 96 bytes at each subround as the LPCNet voice codec [73, 74] encodes a 40 ms audio frame into 8 bytes (§2.1)."

PDF p.2 (§2.1): LPCNet operates at 1.6 Kbit/s. One 40 ms frame = 1.6 Kbit/s × 0.04 s = 64 bits = **8 bytes**. A subround is 480 ms = 12 frames × 8 bytes = **96 bytes**.

The notes state that 96 bytes is "one LPCNet voice frame encoding 40 ms audio." This is wrong in both directions: one LPCNet frame is 8 bytes (not 96), and 96 bytes corresponds to 12 frames covering a full 480 ms subround (not one 40 ms frame). The message size is 96 bytes per subround, not per frame.

---

### MINOR Issues

**1. [^7] — Ceiling function omitted from Pung round-trip count**

Notes:
> "two-hop communication pattern is crucial for voice calls vs. Pung's log_2(n+1) round trips."

PDF p.1:
> "a Pung client makes ⌈log_2(n + 1)⌉ round trips to a remote server."

The ceiling function ⌈·⌉ is omitted in the notes. This is a minor imprecision in mathematical notation.

---

### Reviewer Verdict

**INCORRECT Finding 1 — CONFIRMED**

The notes (header table, line 42) read:

> **Record-size regime** | Small (96 bytes — one LPCNet voice frame encoding 40 ms audio)

PDF p.10 (§6, Setup and method, right column) states verbatim: "This configuration results in a fixed message size of 96 bytes at each subround as the LPCNet voice codec encodes a 40 ms audio frame into 8 bytes (§2.1)." The Figure 6 caption on the same page also confirms: "Messages are 96 bytes in size." Additionally, PDF p.2 (§2.1) gives the codec rate as 1.6 Kbit/s, which at 40 ms per frame = 64 bits = 8 bytes per frame — consistent with the p.10 statement. The 96-byte figure is the per-subround message size (480 ms = 12 frames × 8 bytes/frame), not the size of one frame. The notes have this wrong in both directions: one LPCNet frame is 8 bytes, not 96, and 96 bytes corresponds to a full 480 ms subround, not a single 40 ms frame. Severity: INCORRECT. No false positive.

---

**MINOR Issue 1 — CONFIRMED**

PDF p.1 reads: "a Pung client makes ⌈log₂(n + 1)⌉ round trips to a remote server." The notes (line 73) write "log_2(n+1)" without the ceiling operator ⌈·⌉. The ceiling is present in the PDF and is mathematically meaningful (it ensures an integer result). The omission is a notation imprecision; the core claim (logarithmic round-trip count) is correct. Severity: MINOR. No false positive.

---

**Summary (revised):** 2 issues total — 1 INCORRECT, 1 MINOR. Both confirmed; no findings rejected.
