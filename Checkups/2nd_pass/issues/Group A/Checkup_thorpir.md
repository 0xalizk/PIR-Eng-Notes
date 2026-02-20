## ThorPIR (2024) — Footnote Validation

**Notes:** [thorpir_2024_notes.md](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md)
**PDF:** [FHEPIR_2024_482.pdf](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/FHEPIR_2024_482.pdf)
**Total footnotes:** 23 | **Correct:** 22 | **Minor:** 0 | **Incorrect:** 1

---

### INCORRECT Findings

#### [\[^8\]](../../../../Schemes/Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md#user-content-fn-8-5ed4c8df6d0cf7056920fa3002fe1a3a): Partition count and partition size are swapped

- **Statement in notes:** "each of the K = 2^20 partitions contains Q = 2^10 elements. Each BFV ciphertext can hold D = 32768 slots, so 2880/3 = 960 ciphertexts per partition (3 bits per slot)."
- **Cited location:** Footnote describes the database partitioning structure for N = 2^30, Q = 2^10
- **What the PDF actually says:** Algorithm 2 (p.14) defines "Let K := N/Q. DB = db_1,...,db_Q where each db_i in {0,1}^K." There are Q = 2^10 partitions (db_1,...,db_Q), each of size K = N/Q = 2^20 elements. Section 3.1.1 (p.13) confirms: "K := N/Q" is the partition size, with Q permutations tau_1,...,tau_Q operating on Q partitions.
- **Problem:** The footnote inverts the partition count and partition size. It claims K = 2^20 partitions each containing Q = 2^10 elements, when the paper defines Q = 2^10 partitions each containing K = 2^20 elements. Although both yield N = 2^30 total entries, this misrepresents the fundamental data structure: the Q Thorp shuffle permutations correspond to Q partitions (not K), and K is the domain size of each permutation (not the partition count). The body text (line 91) also states "split into K = N/Q partitions db_1,...,db_K" which should read "Q partitions db_1,...,db_Q, each of size K = N/Q." Additionally, the "960 ciphertexts per partition" figure is ambiguous: 2880/3 = 960 is the number of ciphertext columns needed to represent 2880-bit elements at 3 bits per slot, not the total ciphertext count for a partition of K = 2^20 elements.

---

### MINOR Issues

None.
