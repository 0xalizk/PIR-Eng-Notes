# Group D — Footnote Validation Report

This report verifies that each footnote in the Group D PIR scheme notes files accurately cites its source paper. Each footnote's quoted text or claim is checked against the cited location in the PDF.

**Generated**: 2026-02-19

---

## CK20 — Footnote Validation

| # | Cited Location | Claim Summary | Verdict | Notes |
|---|---------------|---------------|---------|-------|
| 1 | Abstract (p.1) | "We present the first protocols for private information retrieval that allow fast (sublinear-time) database lookups without increasing the server-side storage requirements." | Correct | Exact quote from the abstract on p.1. |
| 2 | Section 1 (p.2) | "In particular, in all existing PIR schemes, the work at the servers grows linearly with the database size." | Correct | Confirmed on p.2. |
| 3 | Section 6 (p.28) | "(C+1)(T+1) = Omega-tilde(n)" for any offline/online PIR scheme with C bits of offline communication and T online server probes. | Correct | Theorem 23 on p.28 states "(C+1)(T+1) >= Omega-tilde(n)". The formula matches. |
| 4 | Definition 8 (p.17) | Formal syntax of offline/online PIR. | Correct | Definition 8 on p.17 gives the five-algorithm tuple (Setup, Hint, Query, Answer, Reconstruct) exactly as described. |
| 5 | Definition 8 (p.17) | Security definition in terms of query distribution indistinguishability. | Correct | The Security paragraph under Definition 8 on p.17 defines PIRadv in terms of distinguishing query distributions, matching the notes. |
| 6 | Definition 40 (p.52) | Formal syntax of multi-query offline/online PIR. | Correct | Definition 40 appears on p.52 with the four-algorithm tuple and updated Query/Reconstruct signatures as described. |
| 7 | Games 41-42, Fig. 3 (p.54) | Left-server and right-server security games. | Correct | Games 41 and 42 appear in Fig. 3 on p.54, defining left-server and right-server security games for multi-query PIR. |
| 8 | Definition 46 (p.61) | Single-server security requiring indistinguishability of the combined offline/online view. | Correct | Definition 46 on p.61 defines single-server security via computational indistinguishability of the joint distribution. |
| 9 | Remark 10 (p.18) | Any two-server perfectly secure PIR scheme can be viewed as an offline/online scheme. | Correct | Remark 10 on p.18 states exactly this. |
| 10 | Section 2.1 (p.13), Section 2.3 (p.16) | Formal definition of puncturable pseudorandom sets; GenWith and Shift extensions. | Correct | Section 2.1 on p.13 gives Gen, Punc, Eval. Section 2.3 on p.16 defines GenWith and Shift. |
| 11 | Game 1 (p.14) | Security game for puncturable pseudorandom sets. | Correct | Game 1 appears on p.14 defining the challenger/adversary interaction and PSAdv formula. |
| 12 | Section 2.1 (p.13) | Correctness requirements. | Correct | The Correctness paragraph on p.13 states the two requirements. |
| 13 | Fact 2 (p.14), Theorem 3 / Construction 4 (p.14-15), Theorem 7 (p.15-16) | Three constructions of puncturable pseudorandom sets. | Correct | All three constructions confirmed at cited locations. |
| 14 | Section B.2 (p.39) | Efficiency analysis of Construction 4 from puncturable PRF. | Correct | Section B.2 on p.39 analyzes efficiency of Psi_F (Construction 4), confirming time bounds. |
| 15 | Section 2 (p.12-13) | "A puncturable pseudorandom set is very closely related to a puncturable pseudorandom function." | Correct | Confirmed on p.12-13. |
| 16 | Appendix G (p.68) | Formal definition of sparse DPFs. | Correct | p.68 gives the formal three-tuple (Gen, Choose, Eval) definition. |
| 17 | Appendix G (p.68) | Security property of sparse DPFs. | Correct | p.68 defines security: k_right is computationally indistinguishable from Sim_right output. |
| 18 | Appendix G (p.68) | Correctness of sparse DPFs. | Correct | p.68 states correctness: Eval((K_left)_j) + Eval(k_right) = e_i with high probability. |
| 19 | Appendix G (p.67) | "Unfortunately, such a construction is impossible" (both sides sparse), citing BIM04. | Correct | p.67 states this with the BIM04 lower bound citation. |
| 20 | Appendix G (p.67) | Discussion of the relaxation from standard DPFs to sparse DPFs. | Correct | p.67 discusses the relaxation. |
| 21 | Appendix C.2 (p.49-50) | Failure probability analysis; each read fails with combined probability at most (s-1)/n + 1/n <= 1/2 for s <= n/2. | Partially correct | p.49 shows Pr[j=bottom] <= 1/n and Pr[i_punc != i] = (s-1)/n. The combined bound is s/n <= 1/2. The notes' expression is correct but slightly over-simplifies the component breakdown. |
| 22 | Appendix C.2 (p.50) | Client storage claim for the single-query scheme. | Correct | p.50 states the client stores "kappa + O((n/s(n)) log^2 n)" bits. Matches the notes. |
| 23 | Appendix D.2 (p.58) | Client stores m = O-tilde(n^{1/2}) puncturable pseudorandom set keys. | Correct | p.58 confirms this. |
| 24 | Construction 16 (p.20) | Full specification of two-server PIR with sublinear online time. | Correct | Construction 16 appears on p.20 with the complete algorithm specifications. |
| 25 | Construction 44 (p.56) | Full specification of multi-query offline/online PIR. | Correct | Construction 44 appears on p.56. |
| 26 | Appendix C.2 (p.49) | Failure probability analysis of Construction 16. | Correct | p.49 provides the analysis as described. |
| 27 | Appendix C.2 (p.49-50) | Amplification via lambda parallel repetitions. | Correct | p.49-50 confirms: running lambda instances in parallel drives failure probability to 2^{-lambda}. |
| 28 | Appendix D.2 (p.57) | Multi-query failure probability via union bound. | Correct | p.57-58 analyzes multi-query correctness with union bound giving failure at most T/2^{lambda}. |
| 29 | Appendix C.2 (p.49-50) | Amplification quote about running lambda parallel instances. | Correct | Near-exact quote confirmed on p.49-50. |
| 30 | Theorem 11 (p.18) and Theorem 14 (p.19) | Main complexity results for two-server constructions. | Correct | Both theorems confirmed at cited locations. |
| 31 | Section 4.1 (p.23) | Hint refresh mechanism in the multi-query scheme. | Correct | Section 4.1 on p.23 describes the hint refresh mechanism as described. |
| 32 | Theorem 23 (p.28) | "(C+1)(T+1) = Omega-tilde(n)" formal statement. | Correct | Theorem 23 on p.28 formally states this bound. |
| 33 | Theorem 23 (p.28) | Model restrictions — server stores DB in original form, uses no additional storage. | Correct | Theorem 23 specifies these restrictions. |
| 34 | Appendix F (p.63-66) | Full proof via reduction to Yao's Box Problem. | Correct | Appendix F contains the complete reduction proof. |
| 35 | Section 6 (p.28) | "The offline/online PIR schemes we construct in Section 3 achieve the optimal trade-off, up to log factors." | Correct | Confirmed on p.28. |
| 36 | Remark 24 (p.28) | Lower bound does not preclude schemes with encoded database storage. | Correct | Remark 24 on p.28 states this. |
| 37 | Remark 12 (p.18) | "It is possible to make these hidden factors as small as O(lambda * log n)." | Correct | Remark 12 on p.18 confirms this. |
| 38 | Remark 13 (p.18) | Trading communication for online time. | Correct | Remark 13 on p.18 describes the continuous tradeoff as noted. |
| 39 | Section 5.1 (p.25-27) | Proof of Theorem 20. | Correct | Section 5.1 spans p.25-27, presenting the full proof. |
| 40 | Section 5.1 (p.27) | Rebalancing step using the CGKS95 technique. | Correct | p.27 describes rebalancing using CGKS95 technique. |
| 41 | Theorem 22 (p.27) | FHE-based single-server scheme achieving optimal bounds. | Correct | Theorem 22 on p.27 states the result. |
| 42 | Table 2 (p.6) | Comparison table with stated preamble about omitted factors. | Correct | Table 2 on p.6 includes the quoted preamble and comparison rows. |
| 43 | Section 7 (p.29) | Open questions. | Correct | Section 7 on p.29 lists four open questions matching the notes. |

## IncPIR — Footnote Validation

| # | Cited Location | Claim Summary | Verdict | Notes |
|---|---------------|---------------|---------|-------|
| 1 | Section 4.1 (p.5) | "We start by describing the CK protocol and then describe our approach to make its preprocessing incremental." | Partially correct | Close but not verbatim; paper says "then we describe" vs "then describe". |
| 2 | Section 6.3 (p.11) | "Appendix E discusses how to make the SACM OO-PIR scheme [51] incremental." | Partially correct | Quote is truncated; paper continues "...with similar high-level ideas as those presented here, but with vastly different concrete mechanisms." |
| 3 | Abstract (p.1) | "A major implicit assumption in all of the above works is that the PIR database is immutable." | Correct | Verbatim match. |
| 4 | Definition 2 (p.4) | Formal definition of incremental OO-PIR with eight algorithms. | Partially correct | Definition 2 starts on p.3 and continues onto p.4, not solely p.4. Content is accurate. |
| 5 | Section 5.2 (p.8) | "Our goal is then to devise a procedure to extend the range of the PRS..." | Correct | Verbatim match. |
| 6 | Abstract (p.1) | "the computational cost of updating the hints in our incremental CK scheme (iCK) for a batch of 10,000 updates... is 56x cheaper than preprocessing from scratch." | Correct | Verbatim match. |
| 7 | Section 3.2, Security (p.4) | Security definition for incremental OO-PIR. | Correct | Security definition with P'(i) distribution and max distinguishing advantage confirmed. |
| 8 | Section 3.2, Correctness (p.4) | Correctness definition requires probability >= 1-negl(lambda). | Correct | Correctness definition confirmed. |
| 9 | Definition 4 (p.8) | Formal definition of incremental PRS with Gen, Add, Eval. | Partially correct | Definition 4 spans pp.7-8, not solely p.8. Content is accurate. |
| 10 | Theorem 6, Section A.3 (p.18) | "Psi satisfies security." | Correct | Theorem 6 on p.18 states this. |
| 11 | Section 5.3, Figure 1 (p.9) | Construction of incremental PRS using KDF-derived keys and PRP evaluation. | Correct | Figure 1 on p.9 shows the construction as described. |
| 12 | Section 5.3 (p.9) | "Unfortunately our construction does not preserve the puncturable property since we use a PRP instead of a PRF..." | Correct | Verbatim match of key phrases. |
| 13 | Section 8, Implementation (p.12) | "We use AES to implement a PRF for small range, and then apply Patarin's proposal [49] to the PRF to build a secure PRP." | Partially correct | Quote omits trailing phrase "that has a small power-of-two range." |
| 14 | Section 5.3 (p.9) | aux = [(r_ell, t_ell)] tracks subrange extents and element counts. | Correct | Description matches the paper. |
| 15 | Section 6.2 (p.11) | "The proposed online phase does not meet our correctness definition because the client fails to puncture the set at index i with probability O(1/sqrt(n))." | Partially correct | Quote is slightly truncated; paper continues "where n is the original database size." |
| 16 | Section 3.1 (p.3) | "We consider a database D, which is replicated across both the offline and online servers and consists of n items of size b bits." | Correct | Verbatim match. |
| 17 | Section 4.1 (p.5) | Client hint structure after CK preprocessing. | Correct | Description matches the paper. |
| 18 | Figure 3 (p.10) | DBUpd algorithm producing delta = (delta_add, delta_edit, delta_del). | Correct | Figure 3 on p.10 shows DBUpd as described. |
| 19 | Figure 7 (p.11) | "Client keeps state = (n', j*), where n' is the current database size, and j* indicates which set is currently used for query." | Correct | Verbatim match. |
| 20 | Section 3.3, Additions (p.4) | "We aim to support databases where new items are appended to the end..." | Correct | Verbatim match of quoted portion. |
| 21 | Theorem 9 (p.18) | Security proof for the incremental CK construction. | Correct | Confirmed. |
| 22 | Section 4.1 (p.5) | "It is secure against the online server because q_i is a uniformly random subset of [n] of size sqrt(n)-1." | Correct | Verbatim match. |
| 23 | Section 3.1 (p.3) | "The servers are semi-honest: they do not collude but are interested in learning which objects the client is fetching from the database." | Correct | Verbatim match. |
| 24 | Section 6.2 (p.11) | Concrete failure probability analysis with set size s = n^{1/2}. | Correct | Analysis confirmed at cited location. |
| 25 | Section 4.1, Supporting multiple queries (p.5) | Fresh set sampling via refresh ensures per-query independence. | Correct | Confirmed. |
| 26 | Section 4.2.1, batched additions (p.6) | "the client samples a number w from the hypergeometric distribution HG(n+m, m, sqrt(n))." | Correct | Verbatim match of core phrase. |
| 27 | Section 6.2, Appendix A.4.2 (p.18) | Checklist's modification doubles online communication but achieves negl(lambda) correctness error. | Correct | Confirmed. |
| 28 | Figure 9 (p.13) | Microbenchmarks for N=2^20, b=32 bytes. Query 7.87 ms, Response 0.06 ms, Refresh 4.90 ms. | Correct | All values match. |
| 29 | Figure 9 (p.13) | Full microbenchmark table for three database sizes with 1% addition batch. | Correct | Complete table confirmed. |
| 30 | Theorem 10 (p.19) | "the total computation to the offline server is in expectation O(bm log n)." | Correct | Verbatim match. |
| 31 | Section 3.2, Non-triviality (p.4) | "the size of the update summary delta, update query u_q, and update response u_r should be sublinear in n'." | Correct | Verbatim match. |
| 32 | Section 6.2 (p.11) | "the client can preprocess the database from scratch when the local storage becomes too high." | Partially correct | Content matches but appears on p.14, not p.11 as cited. |
| 33 | Section 3.3, Weak deletion (p.4) | "We relax the above definition to require only that new clients do not learn any deleted items." | Correct | Verbatim match. |
| 34 | Section 3.3 (p.4) | "We consider three types of mutations: addition of new objects, deletion of existing objects, and in-place edits." | Partially correct | Quote is truncated; paper continues "that change the database's content but does not alter its size." |
| 35 | Definition 2 (p.3-4) | DBUpd algorithm specification. | Correct | Verbatim match of key content. |
| 36 | Section 4.2.2 (p.6) and Section 4.2.3 (p.7) | In-place edits: update parities. Deletions: replace with random object. | Correct | Both descriptions match. |
| 37 | Section 4.2.3 (p.7) | Secure deletion against malicious clients is impossible in CK. | Correct | Attack description matches. |
| 38 | Figure 9 (p.13) | IncPrep takes 1.03 sec vs Prep at 58.67 sec for N=2^20 (~57x speedup). | Correct | Values match; 58.67/1.03 ≈ 57x. |
| 39 | Appendix E (p.20) | "we show how to adapt the PPRS in SACM to support our notion of incrementality." | Partially correct | Paraphrase; actual text adds "and obtain our second construction of an incremental offline/online PIR scheme." |
| 40 | Section 8 (p.12) | "we also have a construction for incremental SACM but find that both the original and our incremental version are not yet in practice..." | Partially correct | Paper says "not yet useful in practice" not "not yet in practice." |
| 41 | Section 7 (p.12) | PIR-Tor application with incremental OO-PIR. | Correct | Section 7 on p.12 discusses this application. |
| 42 | Section 1 (p.1) | "an implementation of PIR-Tor that uses our iCK construction improves the throughput achieved by Tor directory nodes by roughly 7x." | Partially correct | Quote is truncated; paper continues "over an implementation of PIR-Tor that uses a state-of-the-art 2-server PIR scheme." |
| 43 | Section 8, Evaluation testbed (p.12) | Hardware and experimental setup details. | Correct | All details (CloudLab m510, 8-core Xeon D-1548, 64GB, Ubuntu 20.04, etc.) match. |
| 44 | Section 8.2 (p.13) | "Compared to DPF-PIR, incremental CK improves the throughput achieved by roughly 6x..." | Correct | Verbatim match of quoted portion. |
| 45 | Section 8.2 (p.13) | "The size of each server's reply is optimal for all three schemes and consists of the size of a data element (2KB)." | Correct | Verbatim match. |
| 46 | Figure 12a (p.14) | Server computation costs over 90-day Tor relay update trace. | Correct | Figure confirmed. |
| 47 | Figure 12b (p.14) | "the percentage of client storage growth is less than 8%" over 90 days. | Correct | Verbatim match. |
| 48 | Section 7 (p.12) | "a server can act as an offline server for one client and an online server for another." | Correct | Verbatim match. |
| 49 | Section 7 (p.12) | "the security is compromised roughly (q/p)^2." | Correct | Verbatim match. |
| 50 | Section 1, Limitations (p.2) | "Our incremental preprocessing schemes work best when the database changes slowly..." | Correct | Verbatim match. |
| 51 | Section 1 (p.1) | "our approach is not black-box. Instead, it requires exploiting the structure of the underlying OO-PIR protocol." | Partially correct | Quote is verbatim but appears on p.5, not p.1. A related statement appears on p.2. |
| 52 | Section 9 (p.14) | "it is unclear how to support incremental preprocessing and PIR-by-keywords..." | Correct | Verbatim match of core content. |
| 53 | Section 5.2, Complications (p.8) | "we use a different key for each of the PRPs... the original set key k becomes a master key..." | Correct | Verbatim match. |
| 54 | Section 8, Implementation (p.12) | "Our incremental CK implementation is ~2,000 lines of C++." | Correct | Verbatim match. |
| 55 | Section 8, Implementation (p.12) | "We generate the hypergeometric sampling for hint updates using multiple Bernoulli samplings." | Correct | Verbatim match. |
| 56 | Section 9 (p.14) | "Since our incremental preprocessing is not black-box, it remains to be seen how to apply it to schemes where the hints are kept at the servers." | Correct | Verbatim match of core content. |

## IshaiShiWichs — Footnote Validation

| # | Cited Location | Claim Summary | Verdict | Notes |
|---|---------------|---------------|---------|-------|
| 1 | Section 2 (p.8) | Defines k-server preprocessing PIR as a two-phase stateful protocol with T(n) polynomial in n. | Correct | p.8 defines Preprocessing and Query phases exactly as described. |
| 2 | Section 2 (p.8) | The simulator is not given the query sequence, capturing the intuition that any single server's view leaks nothing about queries. | Correct | Verbatim match on p.8. |
| 3 | Section 2 (p.9) | Non-adaptive correctness assumes queries are chosen independently of the randomness consumed by the PIR scheme. | Correct | Confirmed on p.9. |
| 4 | Section 2 (p.9) | Adaptive correctness is strictly stronger; the adversary can choose each query after seeing the server's state from prior queries. | Correct | p.9 defines AdaptiveCorrect experiment as described. |
| 5 | Definition 1 (p.20-21) | The (n,t)-PIR model relaxes standard preprocessing PIR in five ways. | Correct | p.20-21 lists all five relaxations. |
| 6 | Definition 3 (p.25) | All known constructions are database-oblivious, making the SZK barrier widely applicable. | Correct | p.25 confirms this statement. |
| 7 | Definition 2 (p.22) | MIA is parameterized as (m, l)-MIA with mutual information and Shannon entropy bounds. | Correct | Definition 2 on p.22 matches. |
| 8 | Section 4.1 (p.12-13) | The set distribution D samples each dimension independently with probability 1/n^{1/6} over m = n^{1/3} elements, yielding expected set size sqrt(n). | Correct | p.12-13 defines D as described; Fact 4.1 on p.13 confirms E[|S|] = sqrt(n). |
| 9 | Definition 5 (p.26) | The vanilla SSB hash relaxes the standard SSB notion in two ways. | Correct | p.26-27 states both relaxations. |
| 10 | Section 4.2 (p.14) | Base scheme achieves correctness probability >= 0.1; amplification uses omega(log n) parallel instances. | Correct | p.14 confirms both claims. |
| 11 | Section 4.1 (p.12-13) | Database index id expressed as a tuple (x,y,z) in base-m representation. | Correct | Verbatim match on p.12-13. |
| 12 | Section 4.2 (p.14) | Client stores L = 20*sqrt(n) hints with set descriptions and parities. | Correct | p.14 confirms the hint structure. |
| 13 | Section 4.2 (p.15) | Planar sets have size n^{1/3}; each hint has n^{1/6} planar sets per dimension. | Correct | p.15 confirms. |
| 14 | Section 3.1 (p.10-11) | Generic construction piggybacks next phase's preprocessing over current phase's queries. | Correct | p.11 describes the piggybacking mechanism as stated. |
| 15 | Section 4.2 (p.14-15) | Query protocol: client sends resampled set, server computes O(n^{1/3}) parities, reconstruction uses 8 parities. | Correct | p.14-15 confirms the protocol details. |
| 16 | Appendix B (p.38-39) | 2-server variant: preprocessing with left server, queries with right server, O(n^{1/3}) online bandwidth. | Partially correct | The O(n^{1/3}) online bandwidth matches Table 1 (p.3). However, the claimed O(n^{2/3}) preprocessing bandwidth is not explicitly stated in the theorem. |
| 17 | Section 4.1 (p.13-14) | Reconstruction identity holds because non-target elements appear in an even number of the 8 sub-cross-products. | Correct | p.14 confirms: "every other element appears an even number of times in the final xor-sum." |
| 18 | Section 4.1 (p.13) | Resample operation re-randomizes the set while keeping the queried point. | Correct | p.13 defines Resample as described. |
| 19 | Section 4.5 (p.17-19) | Failure probability at most 1/e^{20} + (1 - 1/e^{20}) * 0.5 <= 0.6. | Correct | p.18-19 confirms the probability bound. |
| 20 | Section 4.2 (p.14) | Base correctness >= 0.1; omega(log n) parallel instances amplify to 1 - negl(n). | Correct | p.14 confirms. |
| 21 | Appendix A.3 (p.35) | Permutation pi_r uses invertible 3x3 matrix R over GF(2^k). | Correct | p.35 defines pi_r as described; Claim A.1 proves the coordinate collision bound. |
| 22 | Proposition A.2 (p.35) | For arbitrary queries, the probability a distinct point lands in the same set is at most 4.1/sqrt(n). | Correct | Proposition A.2 on p.35 states this bound. |
| 23 | Theorem 3.1 (p.11) | Instantiating with Dvir-Gopi PIR yields n^{1/2+o(1)} client space and O(sqrt(n)) bandwidth when t = sqrt(n). | Correct | p.11 confirms these bounds. |
| 24 | Theorem 4.4 / Theorem A.3 (p.20, p.37) | The tilde-O notation hides a super-logarithmic factor alpha(n) from the parallel repetition. | Correct | p.5 explicitly defines the O_tilde notation with alpha(n). |
| 25 | Theorem B.1 (p.39) | 2-server variant reduces offline bandwidth from O_tilde(n^{1/2}) to O_tilde(n^{1/6}) per query. | Partially correct | The O_tilde(n^{1/6}) claim is not explicitly visible in the theorem statement or Table 1. |
| 26 | Section 4.2 (p.15) | Preprocessing in batches of n^{2/3} bits; client stores current batch plus O(n^{2/3}) set descriptions. | Correct | p.15 confirms batch processing and client space. |
| 27 | Section 4.3 (p.16) | Amortized costs: O(sqrt(n)) bandwidth and client work, O(n^{2/3}) server work per query. | Correct | p.16 "Amortized cost per query" section confirms all values. |
| 28 | Theorem 5.1 (p.21) | Lower bound holds even in the (n,t)-PIR model with arbitrary encoded databases. | Correct | p.21 Theorem 5.1 uses the relaxed model from Definition 1. |
| 29 | Theorem 5.3 (p.24) | Any (m, l)-MIA with l >= m + 1 implies OWFs via false entropy argument. | Correct | p.24 confirms the theorem and proof approach. |
| 30 | Section 5.1.1 (p.24) | Generalization to mutual information applies to hints with large random + small database-dependent components. | Correct | p.24 "Hint Size vs Mutual Information" confirms. |
| 31 | Section 5.1.1 (p.25) | For t = sqrt(n), either download or hint must be Omega(sqrt(n)) in any IT scheme. | Correct | p.25 "Download vs. Communication" section confirms. |
| 32 | Corollary 5.8 (p.28) | SZK barrier combines Claim 5.4, Theorem 5.5, and Theorem 5.7. | Correct | p.28 Corollary 5.8 derives from exactly this chain. |
| 33 | Theorem 1.2 (p.4) | SZK barrier shows Piano's tradeoff is optimal up to super-logarithmic factor in Minicrypt. | Correct | p.4 confirms this statement. |
| 34 | Section 5.2 (p.28) | Proofs fully relativize; ROM construction breaking sqrt(n) barrier would separate SZK from BPP relative to random oracle. | Correct | p.4 and relativization discussion confirm. |
| 35 | Table 1 (p.3) | Comparison of IT preprocessing PIR schemes; paper's constructions are first single-server IT schemes. | Correct | Table 1 on p.3 confirms. |
| 36 | Section 1.3 (p.8) | Attack on Piano's load balancing exploits O_tilde(1) replacement entries per chunk. | Partially correct | Content matches but appears at the p.7-8 boundary straddling Sections 1.2/1.3, not squarely in Section 1.3. |
| 37 | Section 1.1 (p.6) | IT protocols can be distributed without non-black-box use of cryptography. | Correct | p.5-6 confirms this motivation. |
| 38 | Section 1.1 (p.2) | Lower bound implies fundamental tradeoff for truly IT ORAM. | Correct | p.2 confirms this implication. |
| 39 | Appendix B (p.39) | 2-server scheme cannot benefit from adaptive correctness techniques because left server sees random set choices. | Correct | p.38-39 confirms this limitation. |
| 40 | Section 1.1 (p.5) | Open question: can client space, bandwidth, and server computation all be O_tilde(n^{1/2})? | Correct | p.5 confirms this open question. |
| 41 | Section 5.2 (p.28) | ROM construction breaking sqrt(n) barrier would settle SZK vs BPP relative to random oracle. | Correct | Confirmed by the relativization discussion. |

## Piano — Footnote Validation

| # | Cited Location | Claim Summary | Verdict | Notes |
|---|---------------|---------------|---------|-------|
| 1 | Abstract (p.1) | Piano achieves amortized O~(sqrt(n)) server and client computation and O(sqrt(n)) online communication per query. | Correct | Abstract states this verbatim. |
| 2 | Section 1.1 (p.2) | "the only cryptographic primitive we need is pseudorandom functions (PRFs), which can be accelerated through the AES-NI instruction sets." | Partially correct | Quote actually appears on p.3 (Section 1.1, "Open-source implementation"), not p.2. |
| 3 | Section 2 (p.3) | "Suppose the database DB[0...n-1] contains n bits. We divide the indices {0,1,...,n-1} into sqrt(n) chunks each of size sqrt(n)." | Correct | Verbatim match on p.3. |
| 4 | Section 2, "Making a single query" (p.4) | Query protocol: find set with x, replace chunk entry with r, send S', server returns parity, client recovers DB[x]. | Correct | P.4 describes these exact steps. |
| 5 | Section 2, "Supporting unbounded, arbitrary queries" (p.5) | PRP for load balancing and pipelining trick for unbounded queries. | Correct | P.5 describes both mechanisms. |
| 6 | Appendix A (p.20) | "This variant has less storage but comes with more online communication." | Correct | Verbatim match. |
| 7 | Appendix A (p.21) | "In short, the two schemes have the same asymptotic behaviors and they provide a tradeoff between the local storage and the online communication." | Correct | Verbatim match. |
| 8 | Section 2 (p.5-6) | "By sending the whole edited set, we can do puncturing or programming without need of complicated constructions." | Partially correct | Quote actually appears on p.16 (Section 6), not p.5-6. |
| 9 | Section 6 (p.16) | PRF-only assumption and streaming preprocessing avoids FHE. | Partially correct | P.16 discusses streaming avoiding FHE, but the PRF-only quote is from p.3. Split across locations. |
| 10 | Section 1.1 (p.3) and Section 5 (p.13) | PRF-only and first single-server PIR relying solely on OWF with sublinear server computation. | Correct | Both quotes confirmed at cited locations. |
| 11 | Section 2 (p.5) | "the server applies a pseudorandom permutation (PRP) to all indices of the database... The server publishes the PRP key." | Correct | Verbatim match on p.5. |
| 12 | Section 4.1, "Optimization" (p.10) | Master PRF key plus 32-bit tags saves storage by 30%. | Correct | P.10 confirms the optimization and 30% savings. |
| 13 | Theorem 3.3 / Theorem C.3 (p.8, p.26) | Parameter settings and correctness bound 1 - negl(lambda) - negl(kappa). | Correct | Both theorem statements confirmed. |
| 14 | Figure 1 (p.6) | Primary table definition with PRF keys and parities. | Correct | Figure 1 on p.6 defines the primary table. |
| 15 | Figure 1 (p.6) | Replacement entries: "sample and store M_2 tuples of the form (r, DB[r])." | Correct | Verbatim match. |
| 16 | Figure 1 (p.6) | Backup table update formula. | Partially correct | Formula is accurately reproduced; minor index naming discrepancy between notes text and footnote. |
| 17 | Figure 1, "Online query" (p.6) | Steps (a)-(e) for query and step 2 for refresh. | Correct | Figure 1 shows all steps as described. |
| 18 | Theorem 3.3 proof sketch (p.8-9) | Two types of failure events described. | Correct | P.8 states both failure types verbatim. |
| 19 | Section 4.1 (p.10) | kappa = 40 matching SimplePIR's failure probability. | Correct | Verbatim match on p.10. |
| 20 | Theorem 3.3 (p.8) | Correctness for all Q = sqrt(n) ln(kappa) alpha(kappa) queries. | Correct | Confirmed. |
| 21 | Theorem C.3 (p.26) | Union bound and Chernoff bound analysis for failure types. | Correct | P.26 confirms both bounds. |
| 22 | Theorem 3.2 / Lemma C.2 (p.8, p.24) | Primary hint table identically distributed as D_n^{M_1} conditioned on adversary's view. | Correct | Both theorem and lemma confirmed. |
| 23 | Section 2 (p.5) | Duplicate caching, PRP for arbitrary queries, pipelining for unbounded queries. | Correct | P.5 describes all three mechanisms. |
| 24 | Table 1 (p.11) | Performance on 100 GB database (n ~ 1.68 * 10^9, 64-byte entries). | Correct | Table 1 confirmed. |
| 25 | Theorem 3.4 (p.9) | Per-query costs: O_lambda(sqrt(n)) client, O(sqrt(n)) server, O(sqrt(n)) communication. | Correct | Theorem 3.4 states these bounds. |
| 26 | Theorem 3.4 (p.9) | Offline phase costs and "no additional server storage." | Correct | Confirmed. |
| 27 | Table 1 (p.11) | Amortized offline costs at 100 GB: 13.2ms/2.2ms time, 120.5KB communication. | Correct | Table 1 confirmed. |
| 28 | Figure 1, "Offline preprocessing" (p.6) | Streaming download with chunk-by-chunk deletion. | Correct | Figure 1 describes the streaming process. |
| 29 | Theorem 3.4 proof (p.9) | "the client will only store one sqrt(n)-size chunk of the DB at a time." | Correct | Verbatim match on p.9. |
| 30 | Section 2 (p.5) | Pipelining brings 2x cost to local storage. | Correct | Confirmed on p.5 and p.9. |
| 31 | Table 1 (p.11) | SimplePIR 100GB results are extrapolated. | Correct | Table 1 caption confirms. |
| 32 | Table 2 (p.12) | WAN: Piano 72.6ms vs SimplePIR 10.9s; 1.2x slowdown vs non-private. | Correct | Table 2 confirmed. |
| 33 | Section 7 (p.16) | "Piano achieves 73ms response time, which is only 1.2x slowdown w.r.t. a non-private baseline." | Correct | Verbatim match. |
| 34 | Section 6 (p.16) | Private DNS service application. | Correct | P.16 describes this application. |
| 35 | Section 6 (p.16) | Private light-weight blockchain node application. | Correct | P.16 describes this application. |
| 36 | Appendix B.2 (p.23-24) | Hierarchical data structure with L = O(log n) levels for dynamic databases. | Correct | P.23-24 confirm the hierarchical construction and amortized costs. |
| 37 | Appendix B.1 (p.22) | Cuckoo hashing with overflow pile for key-value queries. | Correct | P.22 describes this construction. |
| 38 | Section 1.1 (p.3) and Table 2 (p.12) | "over 150x speedup relative to SimplePIR" (LAN); WAN figures. | Correct | Both sources confirmed. |
| 39 | Section 6 (p.16) | Communication cost limitations: full DB download at setup, O(sqrt(n)) per query. | Correct | Verbatim match on p.16. |
| 40 | Section 6 (p.16) | O(sqrt(n)) communication tradeoff "is actually what makes our solutions practical." | Correct | Verbatim match. |
| 41 | Section 4.3 (p.11-12) | "PRF evaluations are the computation bottleneck when the entry size is not too big." | Correct | Verbatim match. |
| 42 | Table 3 (p.14) | Piano is only scheme with OWF assumption; comparison with CK20, ZLTS23/LP22. | Correct | Table 3 confirmed. |
| 43 | Section 4.3 (p.11) | "for medium-sized databases (1GB/2GB), we outperform SimplePIR by 43.9x - 64.6x." | Correct | Verbatim match. |
| 44 | Section 4.1 (p.10) | "the client just needs to generate a lambda-bit master PRF key msk and a unique short tag tag_i (e.g. 32 bits)." | Correct | Verbatim match. |
| 45 | Section 2 (p.5) | PRP application is independent of queries. | Correct | Confirmed. |
| 46 | Section 4.1 (p.10) | "the core implementation contains only around 800 lines of code... reference implementation... around 160 lines." | Partially correct | The 800-line and 160-line claims appear on p.3, not p.10. P.10 says "approximately 800 lines" but omits the 160-line reference. |
| 47 | Section 4.1, "Parallelization" (p.10) | Client-side preprocessing parallelized; server-side and online on single thread. | Correct | Verbatim match on p.10. |
| 48 | Section 4.1 (p.10) | "Our implementation uses a 64-bit integer to denote a database index." | Correct | Verbatim match. |
| 49 | Section 4.1 (p.10) | Chunk size set to 2*sqrt(n), rounded up to nearest power of 2. | Correct | Verbatim match. |
| 50 | Section 6 (p.16) | "designing a truly practical single-server PIR with O~_lambda(1) communication overhead is one of the major future questions." | Correct | Verbatim match. |
| 51 | Section 5 (p.16) | TreePIR comparison: 23ms/84ms vs Piano's 8ms for 8GB database. | Correct | Verbatim match. |

## Plinko — Footnote Validation

| # | Cited Location | Claim Summary | Verdict | Notes |
|---|---------------|---------------|---------|-------|
| 1 | Section 1 (p.5) | Concurrent work [LP24, FLLP24] achieves efficient updates but uses 2 servers or public-key operations. | Correct | Exact match on p.5. |
| 2 | Section 2, "Hint Searching" (p.7) | Drawback elided: client must "find a hint set containing x," which depends on set representation. | Correct | Exact match on p.7. |
| 3 | Section 2, "Invertible PRFs" (p.7) | iPRFs are a new primitive with efficient inversion algorithm. | Correct | Matches on p.7. |
| 4 | Abstract (p.1) | Scheme uses t = O-tilde(n/r) query time matching r * t = Omega(n) lower bound. | Correct | Exact match in the abstract. |
| 5 | Abstract (p.1) | Plinko is the first updateable PIR scheme with worst-case O-tilde(1) update time. | Correct | Exact match. |
| 6 | Definition 4.1 (p.10) | iPRF is a triple of efficiently computable functions: Gen, F, F^{-1}. | Correct | Matches Definition 4.1 on p.10. |
| 7 | Definition 4.1 (p.10) | iPRF security is strictly stronger than PRF security. | Correct | Confirmed on p.10 and p.11. |
| 8 | Definition 4.1 (p.10) | Correctness requires F^{-1} returns exact pre-image set with overwhelming probability. | Correct | Matches. |
| 9 | Theorem 4.4 (p.12) | iPRF construction: Gen, F, F^{-1} using PRP and MNS composition. | Correct | Theorem 4.4 on p.12 gives exact construction. |
| 10 | Theorem 4.7 (p.16-17) | S requires O(log m) time and log m calls to F. | Correct | Confirmed on p.17. |
| 11 | Section 1 (p.3-4) | Truncated PRP is distinguishable from PRF for most domain/range sizes; BKW17 only considered injective random functions. | Correct | Confirmed on p.3 and p.5-6. |
| 12 | Definition 4.2 (p.11) | Multinomial sampler definition. | Correct | Matches Definition 4.2. |
| 13 | Definition 4.3 (p.11) | PMNS security definition. | Correct | Matches Definition 4.3. |
| 14 | Figure 4 (p.16) | Pseudocode for S, S^{-1}, and children subroutine using Binomial splitting. | Correct | Figure 4 on p.16 confirmed. |
| 15 | Theorem 4.7 (p.16-17) | S requires O(log m) time and log m calls to F. | Correct | Same as #10, confirmed. |
| 16 | Section 1 (p.4) | Plinko achieves trade-off without public-key cryptography, requiring only OWFs. | Correct | Exact match on p.4. |
| 17 | Theorem 4.4 (p.12) | [MR14] Sometimes-Recurse Shuffle with O(log n) calls to underlying PRF. | Partially correct | The [MR14] reference appears in the proof paragraph following the theorem, not in the theorem statement itself. Content is accurate. |
| 18 | Section 5.2, "Correctness" (p.23) | iPRFs indistinguishable from random functions; correctness from RMS24 applies directly. | Correct | Exact match on p.23. |
| 19 | Section 5.2 (p.21) | Database indices partitioned into c := n/w blocks of w consecutive indices. | Correct | Exact match on p.21. |
| 20 | Section 5.2 (p.21) | Regular hint table H with lambda*w hints in slots 0,...,lambda*w-1. | Correct | Exact match. |
| 21 | Section 5.2 (p.21) | Backup table T with q hints in slots lambda*w,...,lambda*w+q-1. | Correct | Exact match. |
| 22 | Section 5.2 (p.22) | Results stored in Cache hash table; repeated queries return cached value. | Correct | Exact match on p.22. |
| 23 | Section 5.2 (p.21) | For each block alpha in P_j, entry i = alpha*w + iF.F(k_alpha, j). | Correct | Exact match. |
| 24 | Section 5.2, "Efficiency" (p.23) | Expected hints containing x-th entry is O-tilde(r/w) = O-tilde(1). | Correct | Exact match. |
| 25 | Section 5.2, "Efficiency" (p.23) | Chernoff bound on hint count with probability 2^{-lambda - log n}. | Correct | Exact match. |
| 26 | Theorem 5.3 (p.20) | Each online query uses O-tilde(n/r) bits of communication. | Correct | Exact match. |
| 27 | Theorem 5.3 (p.20) | Server computes n/r parities per block. | Partially correct | Theorem states O-tilde(n/r) time but doesn't explicitly break down as "n/r parities per block." Reasonable inference from the construction. |
| 28 | Section 5.2, "Efficiency" (p.23) | Client query time O-tilde(n/r) from enumerating offsets. | Correct | Confirmed. |
| 29 | Theorem 5.3 (p.20) | Each online query runs in O-tilde(n/r) time. | Correct | Exact match. |
| 30 | Theorem 5.3 (p.20) | Client uses O-tilde(r) memory. | Correct | Exact match. |
| 31 | Theorem 5.3 (p.20) | Offline phase runs in O-tilde(n) time, O(n) communication. | Correct | Exact match. |
| 32 | Section 5.1 (p.19) | Definition stresses offline model with single streaming pass. | Correct | Matches on p.19. |
| 33 | Section 5.2 (p.22) | "The above only enables querying at most q times." | Correct | Exact match. |
| 34 | Section 5.2 (p.22) | Amortizing offline phase by streaming n/q entries per query. | Correct | Matches on p.22. |
| 35 | Section 5.2, "Update Algorithm" (p.22) | Client performs iPRF inversion to enumerate hints and update parities. | Correct | Exact match. |
| 36 | Section 5.2, "Update Algorithm" (p.22) | Server sends (x, u XOR u') to client. | Correct | Exact match. |
| 37 | Section 5.2, "Additions and Deletions" (p.9) | To delete, overwrite with random info or canonical "deleted" value. | Correct | Exact match on p.9. (Section 1, not 5.2, but page is correct.) |
| 38 | Section 5.2, "Additions and Deletions" (p.9) | Cuckoo-hashing reduces keyword-PIR to standard PIR. | Correct | Matches on p.9. |
| 39 | Section 2, "Efficient Database Updates" (p.8) | Single iPRF call finds all hints containing index; update parities immediately. | Correct | Exact match on p.8. |
| 40 | Appendix B (p.30) | Shows how iPRFs improve Piano client-side computation. | Correct | Exact match on p.30. |
| 41 | Section 1 (p.4) | r * t = Omega(n) lower bound from [CK20, CHK22, Yeo23]. | Partially correct | Factual claim and citations match; exact phrasing varies slightly from p.4. |
| 42 | Section 1 (p.4) | Plinko obtains optimal t = O-tilde(n/r) for any client storage r. | Correct | Matches on p.4. |
| 43 | Figure 1 (p.3) | Comparison table of amortized query time and communication. | Correct | Figure 1 confirmed on p.3. |
| 44 | Section 5.2 (p.23) | iPRF requires security for small domains and ranges; truncated PRPs cannot be used. | Correct | Exact match on p.23. |
| 45 | Appendix B (p.30-32) | Plinko-Piano pseudocode and description. | Correct | Appendix B spans p.30-32 with pseudocode in Figure 8. |
| 46 | Section 1 (p.4) | With r = O(n^{2/3}), prior works need t = O-tilde(n^{2/3}) but lower bound only needs Omega(n^{1/3}). | Correct | Exact match on p.4. |
| 47 | Figure 2 (p.3) and Figure 6 (p.30) | Comprehensive comparison tables of update metrics. | Correct | Both figures confirmed. |
| 48 | Section 2 (p.8) | iPRFs can be applied to Piano and RMS. | Correct | Exact match on p.8. |
| 49 | Section 6 (p.24) | Open possibility of other iPRF applications in cryptography. | Correct | Matches on p.24. |
| 50 | Section 5.2, "Necessity of Database Streaming" (p.23-24) | Sub-linear offline + sub-linear online implies OT via [DMO00]; OT requires public-key [IR89]. | Correct | Exact match on p.23-24. |
| 51 | Section 5.2, "Invertible PRF Requirements" (p.23) | iPRF requires security for small domains and ranges. | Correct | Same as #44. |
| 52 | Section 6 (p.24) | Puncturable iPRF would lead to improvements for single-server PIR using LWE-based puncturable PRFs. | Correct | Exact match on p.24. |
| 53 | Section 6 (p.24) | Nearly-constant online client query time seems possible. | Correct | Exact match on p.24. |
| 54 | Section 6 (p.24) | Open possibility of other iPRF applications. | Correct | Same as #49. |


