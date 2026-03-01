## KeywordPIR (2019) — 3rd Pass Fact-Check

**Notes:** `KeywordPIR_2019_notes.md`
**PDF:** `SealPIR_KeywordPIR_2019_1483.pdf`
**Claims checked:** 52 | **Issues found:** 9 | **Minor:** 3 | **Incorrect:** 6

---

### INCORRECT Findings

**1. Cross-Paradigm Comparison table: ElGamal and Damgard-Jurik upload/download/cost values are swapped**

Notes (Cross-Paradigm Comparison table):
> ElGamal | Upload 1,480 kB | Download 0.6 kB | Server Cost 0.0382
> Damgard-Jurik (s=1) | Upload 280 kB | Download 280 kB | Server Cost 0.0091

PDF Table 5 (p. 13), 1MB database section:
- Damgard-Jurik (s=1): upload=1,480 kB, download=0.6 kB, Server Cost=0.0382
- ElGamal: upload=280 kB, download=8 kB, Server Cost=0.0091

The upload, download, and server cost values for ElGamal and Damgard-Jurik are swapped. The 1,480 kB upload and 0.0382 cost belong to Damgard-Jurik, not ElGamal. Additionally, the Damgard-Jurik download is listed as 280 kB in the notes, which matches neither scheme; the correct values are 0.6 kB (Damgard-Jurik) and 8 kB (ElGamal).

---

**2. Comparison with Prior Work table: ElGamal and Damgard-Jurik values are swapped, and Damgard-Jurik download is from the wrong table section**

Notes ([^41], Comparison with Prior Work table):
> ElGamal | Upload 1,480 kB | Download 283 kB | Server Cost 0.0091
> Damgard-Jurik (s=1) | Upload 0.6 kB | Download 614 kB | Server Cost 0.0382

PDF Table 5 (p. 13), 1MB database (5,000 elements of 288B) section:
- Damgard-Jurik (s=1): upload=1,480 kB, download=0.6 kB, Server Cost=0.0382
- ElGamal: upload=280 kB, download=8 kB, Server Cost=0.0091

Two errors here. First, the upload values for both schemes are swapped (1,480 belongs to Damgard-Jurik, not ElGamal; 0.6 belongs to Damgard-Jurik download, not upload). Second, the Damgard-Jurik download of 614 kB and ElGamal download of 283 kB do not appear in the 1MB database section at all — 614 kB appears in the Private File Download section of Table 5 (3GB database, 10,000 elements of 307kB), and 283 kB appears in the C.Setup column for Damgard-Jurik in the 1MB section, not the download column. The notes' header claims the source is "Table 5 (p. 13); 1MB database, 5,000 entries of 288B," but the download values are drawn from a different section or column.

---

**3. Performance Benchmarks table: SealPIR Server Expand (ms) shifted by one column**

Notes (SealPIR vs MulPIR table, [^26]):
> SealPIR [5] (d=2) | Server Expand (ms) | 145 | **590** | 12,891

PDF Table 3 (p. 12), SealPIR (d=2):
- n=262,144: Server Expand=145
- n=1,048,576: Server Expand=**294**
- n=4,194,304: Server Expand=590

The n=1,048,576 column shows 590 in the notes, but the correct value is 294. The value 590 belongs to n=4,194,304. The n=4,194,304 column then also shows 12,891 for Server Expand, which is actually the Server Response value for that column. The Server Expand row is off by one column from n=1,048,576 onward.

---

**4. Performance Benchmarks table: SealPIR Server Cost at n=262,144 is wrong**

Notes (SealPIR vs MulPIR table, [^26]):
> SealPIR [5] (d=2) | Server Cost (US cents) | **0.0040** | 0.0040 | 0.017

PDF Table 3 (p. 12), SealPIR (d=2):
- n=262,144: Server Cost=**0.0033**
- n=1,048,576: Server Cost=0.0040
- n=4,194,304: Server Cost=0.0067

The notes show 0.0040 for n=262,144, which is actually the n=1,048,576 value. The correct value for n=262,144 is 0.0033.

---

**5. Performance Benchmarks table: SealPIR Server Cost at n=4,194,304 is wrong**

Notes (SealPIR vs MulPIR table):
> SealPIR [5] (d=2) | Server Cost | 0.0040 | 0.0040 | **0.017**

PDF Table 3 (p. 12), SealPIR (d=2) at n=4,194,304: Server Cost=**0.0067**.

The notes show 0.017, which is the value for SealPIR (d=3) at n=4,194,304, not SealPIR (d=2). The notes' table is labelled "recursion d=2" throughout.

---

**6. Performance Benchmarks table: MulPIR Download (kB) listed as 122 instead of 119**

Notes (SealPIR vs MulPIR table and Complexity section table):
> MulPIR (d=2) | Download (kB) | **122** | 122 | 122

PDF Table 3 (p. 12), MulPIR (d=2):
- n=262,144: Download=**119**
- n=1,048,576: Download=119
- n=4,194,304: Download=119

The notes consistently list MulPIR download as 122 kB across all database sizes, but Table 3 shows 119 kB for all three. (The upload of 122 kB is correct per Table 3; the download of 119 kB is distinct from the upload.)

---

### MINOR Issues

**A. GR complexity table: column labels "C.Setup" and "S.Setup" are swapped relative to Table 5**

Notes ([^27], GR complexity table):
> C.Setup (ms) | 1,532 | 1,540 | 1,594 | 1,796
> S.Setup (ms) | 3,294 | 2,688 | 3,966 | 7,980

PDF Table 5 (p. 13) column headers and values for GR rows:
- S.Setup: 1,532 / 1,540 / 1,594 / 1,796 (these are server setup times)
- C.Create: 3,294 / 2,688 / 3,966 / 7,980 (these are client query creation times — prime generation)

The notes label 1,532 ms (the server setup / S.Setup in the PDF) as "C.Setup", and label 3,294 ms (the client query creation / C.Create in the PDF) as "S.Setup". The values are correctly transcribed but the column headers are swapped. Footnote [^45] correctly identifies 3,294 as "C.Create" in passing, which contradicts the table label "S.Setup."

---

**B. [^4] footnote quote drops "for some parameter sets" from end of point (3)**

Notes [^4]:
> "(3) introducing a new oblivious expansion algorithm which can further halve the upload communication."

PDF (p. 2, Section 1.1):
> "(3) introducing a new oblivious expansion algorithm which can further halve the upload communication **for some parameter sets**."

The final phrase "for some parameter sets" is dropped, making the claim slightly stronger than the paper states.

---

**C. Complexity section table footnote [^26] describes the wrong column as the primary reference**

Notes [^26]:
> "Values from Table 3 (p. 12), n = 262,144 column (closest to 2^18); for n = 2^20 see the 1,048,576 columns."

The notes describe the n=262,144 column as the primary reference. However, n=262,144 = 2^18, not the most natural reference. More significantly, the SealPIR Server Cost of 0.0040 is listed in the notes in the n=262,144 column but is actually Table 3's value for n=1,048,576 (2^20). The footnote's framing ("closest to 2^18") is imprecise and the values selected do not cleanly correspond to a single column (see Incorrect Finding 4).

---

### Reviewer Verdict

All 9 findings were verified against Table 3 (p. 12), Table 5 (p. 13), and the body text of the PDF. All 9 are CONFIRMED. No findings are rejected.

**1. CONFIRMED.** PDF Table 5 (1MB section) unambiguously shows Damgard-Jurik upload=1,480 kB, download=0.6 kB, Server Cost=0.0382, and ElGamal upload=280 kB, download=8 kB, Server Cost=0.0091. The notes assign all three Damgard-Jurik values to ElGamal and vice versa. The Damgard-Jurik download of 280 kB in the notes matches neither scheme in that section.

**2. CONFIRMED.** PDF Table 5 (1MB section) shows Damgard-Jurik upload=1,480 kB (not 0.6 kB) and ElGamal upload=280 kB (not 1,480 kB) — upload values are swapped. The download values in the notes (283 kB for ElGamal, 614 kB for Damgard-Jurik) are drawn from the wrong column and wrong section respectively: 283 is ElGamal's C.Setup value in the 1MB section, and 614 kB is Damgard-Jurik's download from the 3GB Private File Download section, not the 1MB section.

**3. CONFIRMED.** PDF Table 3 (SealPIR d=2, Server Expand row) reads 145 | 294 | 590 across the three database sizes. The notes show 145 | 590 | 12,891. The middle value is shifted right by one column (590 belongs to n=4,194,304, not n=1,048,576), and the final value of 12,891 matches Server Respond at n=4,194,304, not Server Expand.

**4. CONFIRMED.** PDF Table 3 shows SealPIR (d=2) Server Cost at n=262,144 is 0.0033. The notes show 0.0040, which is the n=1,048,576 value.

**5. CONFIRMED.** PDF Table 3 shows SealPIR (d=2) Server Cost at n=4,194,304 is 0.0067. The notes show 0.017, which is SealPIR (d=3)'s Server Cost at n=4,194,304.

**6. CONFIRMED.** PDF Table 3 shows MulPIR (d=2) Download=119 kB for all three database sizes. The notes consistently show 122 kB. The value 122 kB is MulPIR's upload (also confirmed in Table 3), not its download.

**A. CONFIRMED.** PDF Table 5 column headers for the GR rows are S.Setup (values: 1,532 / 1,540 / 1,594 / 1,796) and C.Create (values: 3,294 / 2,688 / 3,966 / 7,980). The notes label these columns C.Setup and S.Setup respectively — two distinct errors: S.Setup is mislabeled as C.Setup, and C.Create is mislabeled as S.Setup. The values themselves are correctly transcribed. Footnote [^45] in the notes correctly names the 3,294 ms figure as C.Create, which contradicts the table's S.Setup label.

**B. CONFIRMED.** PDF Section 1.1 (p. 2) reads "...which can further halve the upload communication for some parameter sets." The phrase "for some parameter sets" is absent from footnote [^4] in the notes, making the claim unconditional where the paper qualifies it.

**C. CONFIRMED.** The footnote's framing is misleading on two counts: n=262,144 = 2^18 is a non-obvious reference choice, and the SealPIR Server Cost value shown in the notes for the n=262,144 column (0.0040) is actually taken from the n=1,048,576 (2^20) column of Table 3, not the column the footnote claims to cite.

---

**Net summary: 9 confirmed, 0 rejected** (6 INCORRECT, 3 MINOR — header counts unchanged).
