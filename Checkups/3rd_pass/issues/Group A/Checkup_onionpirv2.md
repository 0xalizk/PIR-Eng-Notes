## OnionPIRv2 — 3rd Pass Fact-Check

**Notes:** `onionpirv2_2025_notes.md`
**PDF:** `FHEPIR_2025_1142.pdf`
**Claims checked:** 52 | **Issues found:** 2 | **Minor:** 2 | **Incorrect:** 0

---

### INCORRECT Findings

None.

---

### MINOR Issues

**1. [^14] Wrong section reference**

Notes text:
> [^14]: §3.3, p.8: "Recall that a BFV ciphertext consists of two components, and one of them is sampled uniformly randomly from R mod q. So, the client can generate it pseudorandomly from a short random seed and send the seed to the server."

The quoted text appears verbatim on p.8, but under **§3.4** ("Standard Techniques Incorporated by OnionPIRv2"), in the "Pseudorandom component in BFV." subsection — not §3.3. Section 3.3 is "Query Compression" and ends on p.5–6; §3.4 begins on p.8. The page number (p.8) is correct but the section label is wrong.

Fix: Change `§3.3, p.8` to `§3.4, p.8`.

---

**2. BFV decryption formula: `round` vs `floor`**

Notes text (Cryptographic Foundation table, Correctness condition row):
> BFV decryption: round((c_0 + c_1 * s) / Delta) mod t where Delta = floor(q/t)

PDF p.2 states the decryption operation as:

> ⌊(c_0 + c_1*s) / Δ⌋ mod t

The paper uses floor (⌊·⌋) throughout, not rounding. The notes substitute `round(...)` for `⌊...⌋`. For BFV correctness the operation is specifically floor, not nearest-integer rounding. This is a minor but technically imprecise transcription.

Fix: Change `round((c_0 + c_1 * s) / Delta)` to `floor((c_0 + c_1 * s) / Delta)` (or use ⌊·⌋ notation).

---

### Reviewer Verdict

**Issue 1 — [^14] Wrong section reference: REJECTED (false positive)**

The fact-checker claimed the pseudorandom component text belongs to §3.4, not §3.3. This is incorrect. On p.8, the "Pseudorandom component in BFV." subsection appears *before* the §3.4 heading ("3.4 Standard Techniques Incorporated by OnionPIRv2"). It is the final subsection of §3.3 "Query Compression". The section label `§3.3` in the notes is correct. The page number (p.8) is also correct. No fix needed.

**Issue 2 — BFV decryption formula `round` vs `floor`: CONFIRMED (minor)**

PDF p.2 unambiguously shows the BFV decryption as `⌊(c_0 + c_1·s)/Δ⌋ mod t` — a floor operation. The notes write `round((c_0 + c_1 * s) / Delta)`. Floor and nearest-integer rounding are not equivalent (they differ by up to 0.5 in the fractional part), and the paper uses floor consistently throughout §2.1. The substitution of `round` for `floor` is a genuine minor transcription imprecision. Fix stands: change `round(...)` to `floor(...)`.

---

**Updated summary:** Claims checked: 52 | Issues found: 1 | Minor: 1 | Incorrect: 0 | Rejected (false positive): 1
