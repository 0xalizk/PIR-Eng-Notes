# SKILL.v0.md Feedback -- TreePIR

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | TreePIR: Sublinear-Time and Polylog-Bandwidth Private Information Retrieval from DDH |
| **Authors** | Arthur Lazzaretti, Charalampos Papamanthou |
| **Year** | 2023 |
| **ePrint** | 2023/204 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | Construction + Building-block (primary: Construction; secondary: Building-block for wpPRF) |
| **PDF** | `Papers/Group D - Client Dependent Preprocessing/TreePIR_2023_204.pdf` |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Quick-Start Router (Section 0) -- Effective

The three-step router worked well for TreePIR. Step 1 correctly identified Group D from the directory path, and the routing table's guidance to focus on Section 3.2 (PRF/symmetric-key notation) and skip Section 3.1 (Lattice/FHE) was accurate. TreePIR's core primitive is a modified GGM-tree PRF, not an FHE-based scheme. The instruction to use Section 3.5b for Group D parameters was also appropriate.

### 2.2 Archetype Classification (Section 1) -- Mostly Effective

The archetype table correctly identifies TreePIR as a multi-archetype paper: Construction + Building-block. The Building-block archetype entry (row in Section 1) even explicitly names TreePIR's wpPRF as an example, which was a strong signal confirming the classification. The "signature" column for Building-block ("Primary contribution is a cryptographic primitive; PIR is the application") fits perfectly -- the wpPRF primitive in Section 3 of the paper IS the main intellectual contribution, with the PIR protocol in Section 4 being a relatively straightforward application of it.

The multi-archetype composition rules (Section 1, "Composition rules") correctly guided me to use the full Construction template as the base (since the paper has benchmarks) and add the Building-block adaptations (expanded Novel Primitives section).

### 2.3 Building-block Reading Path (Section 2.6) -- Excellent Fit

The Building-block reading path was the most valuable piece of guidance. Its instruction to "Read the primitive's formal definition, algorithms, and interface BEFORE its evaluation" (Section 2.6, Pass 2) was exactly right for this paper. TreePIR devotes pages 9-14 to defining and constructing the wpPRF primitive before even mentioning the PIR protocol. Following the SKILL's guidance to read Section 3 (wpPRF) before Section 5 (Performance) before Section 4 (PIR protocol) produced a natural, comprehensible reading order.

### 2.4 PRF/Symmetric-key Notation Table (Section 3.2) -- Relevant

The notation table at Section 3.2 was relevant. The entries for "PRF keys" (sk, msk), "PRF evaluation" (PRF_sk(j)), and "Puncturable PRF" ((Gen, Punc, Eval)) all had direct counterparts in TreePIR. The wpPRF entry in the building blocks table (Section 7.5) is also accurate: "Hides punctured index in GGM tree. Weaker than standard puncturable PRF; serves different purpose than DPFs."

### 2.5 Group D Critical Parameters (Section 3.5b) -- Partially Useful

The Section 3.5b parameters for Group D were partially useful. "Set size |S|" maps to sqrt(N) in TreePIR. "Number of sets Q" maps to M = lambda * sqrt(N). "Amortization window Q" is relevant (queries before re-preprocessing). However, several parameters listed don't apply: "PRP domain" (TreePIR doesn't use PRPs in the base scheme), "Streaming memory" (not a streaming scheme), "Update cost" (updates are discussed briefly but aren't a primary contribution).

### 2.6 Domain Knowledge (Section 7) -- Accurate for TreePIR

Section 7.3's lineage information for Group D is accurate. The description "TreePIR (2023, 2-server, weak privately puncturable PRFs -- NOT DPFs, NOT equivalent to puncturable PRFs)" correctly captures the key distinctions. The lineage placing TreePIR after CK20 in the sublinear-server evolution is correct.

### 2.7 Complexity Notation (Section 3.4) -- Helpful

The O_lambda() notation warning was useful. TreePIR's paper states "Unless explicitly, our big-O notation O(.) hides factors in the security parameter" (page 6, Section 1.4). The SKILL's warning about this convention (Section 3.4) correctly flagged that this is common in Group D papers.

### 2.8 Template Structure (Section 6) -- Good Base

The template's Novel Primitives / Abstractions table (with fields for Name, Interface/Operations, Security definition, Correctness definition, Purpose, Built from, Standalone complexity, Relationship to prior primitives) was an excellent fit for documenting the wpPRF. Every field had a clear answer from the paper.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Pass Order for Multi-archetype (Construction + Building-block) Papers -- Ambiguous

**Problem**: The SKILL provides separate reading paths for Construction (Section 2.1) and Building-block (Section 2.6) papers, and the composition rules say to "Add the template adaptations from each secondary archetype." But the reading PATHS conflict in pass ordering:

- Construction (Section 2.1): Pass 3 (Evaluation) before Pass 4 (Core scheme)
- Building-block (Section 2.6): Pass 2 (Primitive definition) before Pass 3a (Primitive evaluation) before Pass 3b (PIR evaluation) before Pass 4 (PIR protocol)

For TreePIR, the Building-block path was clearly better, but the SKILL doesn't explicitly state how to merge conflicting reading paths for multi-archetype papers. The composition rules (Section 1) only address *template* composition, not *reading path* composition.

**Specific improvement**: Add a rule to Section 1's composition rules: "When reading paths conflict, use the secondary archetype's reading path for sections that fall under the secondary contribution (e.g., the primitive sections), and the primary archetype's reading path for the rest. For Construction + Building-block papers, follow Section 2.6 for the primitive sections and Section 2.1 for the PIR protocol sections."

### 3.2 Two-Server Model Guidance -- Insufficient

**Problem**: TreePIR is a two-server non-colluding scheme, but the SKILL's guidance for two-server protocols is scattered and thin. The Protocol Phases template (Section 6) mentions a "Server" column for multi-server schemes, and Section 7.1 notes that TreePIR uses a two-server model. But there is no structured guidance for reading two-server papers. Key questions that arose during reading and are not addressed:

1. How to document privacy with respect to EACH server separately (TreePIR defines privacy separately for server_0 and server_1, pages 6-7).
2. How to document which server receives which data in the offline phase (server_0 gets PRF keys; server_1 sees nothing offline).
3. How to handle the asymmetry -- server_0 does offline work, both servers answer online queries, but their computational roles differ.
4. TreePIR's security definitions (Definition 2.2) use a simulation-based approach that is specific to two-server settings -- the SKILL doesn't mention simulation-based security at all.

**Specific improvement**: Add a subsection to Section 2 or Section 6: "Two-server protocol documentation: For two-server schemes (TreePIR, CK20, SinglePass, IncPIR), document: (a) which server holds which data and when, (b) privacy guarantees per server (often defined separately via simulation), (c) whether servers interact with each other, (d) collusion model (non-colluding is standard), (e) whether both servers are needed for all phases."

### 3.3 Correctness Option B -- Missing "Deterministic from OWF" Category

**Problem**: TreePIR has an interesting correctness model that doesn't cleanly fit the SKILL's Correctness Analysis options (Section 6, "Correctness Analysis"). The paper proves correctness holds "with probability 1 - nu(lambda)" (Definition 2.1), which sounds like Option B (Probabilistic Correctness Analysis). But the failure mode is very specific: the only source of failure is that the client might not find a set containing the query index during preprocessing (page 20, equations 1-3). This failure probability is (1/e)^lambda, which is negligible. Crucially, once the client finds a valid set, the answer is deterministically correct -- there is no ongoing degradation, no amplification needed, and no hash collisions or sampling issues.

The SKILL's Option B template asks about "Probability grows over queries?" and "Amplification" -- these are misleading for TreePIR. The probability does NOT grow (each query independently samples a fresh key), and amplification is irrelevant (the scheme either finds a set or doesn't; it doesn't produce wrong answers).

**Specific improvement**: Add a sub-option to Option B: "Option B2: Negligible search failure. For schemes where the only failure mode is a sampling/search step (e.g., TreePIR finding a covering set, Piano finding a matching chunk), document: (a) the failure event, (b) the per-query failure probability (typically negl(lambda)), (c) whether failure means 'abort and retry' or 'wrong answer', (d) whether the optimization in Appendix A (deterministic client time via shifts) eliminates this failure mode entirely."

### 3.4 Variant Documentation -- Tradeoff Continuum Not Well Handled

**Problem**: TreePIR's Section 4.4 ("Tuning Efficiencies") describes a continuous tradeoff parameterized by D in (0,1): setting the wpPRF domain/range to N^D gives server time N^D, bandwidth N^D, client storage N^(1-D), and online client time N^(1-D). The paper fixes D = 1/2 throughout, but the continuum is a core feature.

The SKILL's Variants table (Section 6) has a note: "For papers with a continuous tradeoff (not discrete variants), describe the tradeoff axes and representative operating points." This guidance exists but is easy to miss because it's a small italic note under the Variants table. For TreePIR, the tradeoff is arguably more important than any discrete variant.

Additionally, the paper presents two main operating modes: (1) TreePIR without recursion (download sqrt(N) parities directly), and (2) TreePIR + SPIRAL (recurse with a single-server PIR scheme on the sqrt(N)-size database). These ARE discrete variants but the distinction is subtle -- variant (2) is a composition with an external scheme, not an internal parameter change.

**Specific improvement**: Elevate the continuous-tradeoff guidance from an italic note to a proper subsection within the Variants section of the template. Add guidance: "For schemes that compose with external PIR schemes (e.g., TreePIR + SPIRAL), document the composition as a variant, noting which external scheme was used and why, what interface the composition requires from the external scheme (e.g., 'any single-server PIR with no preprocessing'), and the combined complexity."

### 3.5 Scheme Name Verification -- TreePIR Is Correct (No Issue)

The SKILL's scheme name warning (Section 1) lists known mismatches but does not mention TreePIR. This is correct -- the paper explicitly names its scheme "TreePIR" throughout (first on page 4: "Our scheme, TreePIR, was developed to bridge the gap"). No issue here, but noting for completeness.

### 3.6 The "Builds on" Lineage Field -- Missing Non-PIR Predecessors Guidance for Primitives

**Problem**: The Lineage section's "Builds on" field says to include "non-PIR predecessors (e.g., FrodoKEM)" but doesn't provide enough guidance for papers that build on non-PIR *cryptographic primitive* literature. TreePIR builds on:
- CK20 / Corrigan-Gibbs & Kogan [15] (PIR predecessor)
- Shi et al. [43] (PIR predecessor with puncturable pseudorandom sets)
- GGM PRF construction [23] (non-PIR, core primitive)
- Kiayias et al. [32] (pPRF formalization, non-PIR)

The GGM construction is not a PIR scheme and not a system like FrodoKEM -- it's a foundational PRF construction from the 1980s. The SKILL should guide the agent to distinguish between "PIR lineage" and "primitive lineage" for Building-block papers.

**Specific improvement**: In the Lineage section of the template (Section 6), add: "For Building-block papers, separately list PIR lineage (which PIR schemes this builds on) and primitive lineage (which cryptographic primitive constructions this builds on, e.g., GGM PRF, ORAM, DPF)."

### 3.7 Application Scenarios Guidance -- Underweight for TreePIR

**Problem**: TreePIR devotes significant space (pages 22-23) to discussing concrete application scenarios: Secure Certificate Transparency (SCT) auditing with 2^33 elements of 1 bit, and compromised credential checking. The SKILL's Application Scenarios section (Section 6) says "For papers with detailed application sections (>1 page), extract the application's constraints, parameter choices, and reported performance." This is adequate guidance, but the template places Application Scenarios late and doesn't prompt the agent to connect application scenarios to the Variants table (i.e., which variant is best for which application).

For TreePIR, the key insight is that plain TreePIR (no recursion) is better than TreePIR + SPIRAL for small-element databases, which is exactly the SCT use case. This connection between application and variant is not prompted by the template.

**Specific improvement**: In the Application Scenarios section of the template, add: "For papers with multiple variants, note which variant is best for each application scenario and why."

### 3.8 Appendix Handling -- Correct but Could Be More Specific

**Problem**: The SKILL's Section 2.4 (Appendix handling) says to "Always read: ... parameter selection" and "sections that introduce NEW constructions or alternative protocol variants." TreePIR's appendices are short (pages 27-28) and contain two important items:

1. Appendix A.1: Deterministic Client Time via "shifts" -- this is a practically important optimization that eliminates the probabilistic client time from the main construction.
2. Appendix A.2: Generalizing to non-perfect-square database sizes.

The SKILL's guidance would correctly identify Appendix A.1 as an "alternative protocol variant" to read. However, the guidance doesn't specifically flag "optimizations that change the computational model (e.g., from probabilistic to deterministic)" as high-priority appendix content.

**Specific improvement**: In Section 2.4, add to the "Always read" list: "Optimizations that change the scheme's computational model (e.g., making client time deterministic instead of expected/probabilistic)."

### 3.9 Security Model Documentation -- Simulation-Based Security Not Covered

**Problem**: TreePIR's privacy definition (Definition 2.2) uses a simulation-based approach: "A PIR scheme is private w.r.t. server_1 if there exists a PPT simulator Sim, such that for any algorithm serv_0, no PPT adversary A can distinguish..." This is a standard simulation-based definition for two-server PIR, but the SKILL's Security Model field in the template only offers examples like "Semi-honest single-server / Malicious / 2-server non-colluding / Information-theoretic." The SKILL never mentions simulation-based definitions, real-ideal paradigm, or how to document the simulator construction.

**Specific improvement**: In the metadata table of the template (Section 6), expand the Security model examples to include: "2-server non-colluding (simulation-based)". Add a note: "For simulation-based security definitions, document: (a) what the simulator Sim receives as input, (b) what it must produce, (c) whether the simulation is perfect or computational, (d) whether the definition handles adaptive queries."

### 3.10 The "Comparison with Prior Work" Table -- Missing Guidance on Incomparable Schemes

**Problem**: TreePIR's comparison (Figure 1, page 4) compares against schemes with fundamentally different assumptions (OWF vs LWE vs DDH) and different models (some require linear client storage, some have different amortization). The SKILL's Comparison table (Section 6) requires "DB params" to "match across columns" but doesn't address how to handle comparisons where the trust model or assumption strength varies across columns.

TreePIR's Figure 1 highlights cells in red/green to show where each scheme is worse/better, which is a pattern the SKILL doesn't mention.

**Specific improvement**: Add to the Comparison section: "When comparing schemes with different assumptions or models, add 'Assumption' and 'Model' rows to the table. Note that stronger assumptions (e.g., LWE) may enable better asymptotics but at higher concrete cost (e.g., Shi et al.'s privately puncturable PRFs from LWE have 400+ MB communication despite polylog asymptotics)."

---

## 4. Specific Improvement Suggestions (Summary)

| # | Section | Suggestion | Priority |
|---|---------|-----------|----------|
| 1 | Section 1, Composition rules | Add reading-path merging rules for multi-archetype papers, not just template merging | High |
| 2 | Section 2 or 6 | Add two-server protocol documentation subsection (per-server privacy, data distribution, asymmetry, simulation-based security) | High |
| 3 | Section 6, Correctness Analysis | Add Option B2 for "negligible search failure" schemes where failure = abort-and-retry, not wrong answer | Medium |
| 4 | Section 6, Variants | Elevate continuous-tradeoff guidance; add guidance for composition-with-external-scheme variants | Medium |
| 5 | Section 6, Lineage | Add "primitive lineage" vs "PIR lineage" distinction for Building-block papers | Low |
| 6 | Section 6, Application Scenarios | Add prompt to connect application scenarios to specific variants | Low |
| 7 | Section 2.4, Appendix handling | Add "model-changing optimizations" (e.g., probabilistic to deterministic) to "Always read" list | Low |
| 8 | Section 6, Security model | Expand to cover simulation-based security definitions | Medium |
| 9 | Section 6, Comparison | Add guidance for comparing across different assumptions/models | Low |
| 10 | Section 3.2 | Add wpPRF-specific notation: PEval(k_i, j, x) has THREE arguments (punctured key, guess of punctured point, evaluation point) -- this is unique to wpPRFs and easy to confuse with standard pPRF PEval(k_x, x') which has TWO | Medium |

---

## 5. New Patterns or Template Sections to Add

### 5.1 "Reduction Structure" Section for Papers That Reduce PIR to Smaller PIR

TreePIR's core technique is reducing PIR on N elements to PIR on sqrt(N) elements. This "PIR-to-smaller-PIR" reduction pattern is not unique -- it appears in several Group D papers (CK20 also reduces the problem). The SKILL should add template guidance for documenting reduction-based constructions:

```markdown
## Reduction Structure (if applicable)
| Field | Value |
|-------|-------|
| **Reduces from** | PIR on N elements |
| **Reduces to** | PIR on sqrt(N) elements |
| **Reduction mechanism** | wpPRF-based pseudorandom sets partition DB into sqrt(N) chunks; offline parity computation reduces to fetching from sqrt(N)-size parity database |
| **What the reduction preserves** | Privacy (via wpPRF puncturing privacy) |
| **What the reduction costs** | O(lambda * sqrt(N)) offline communication for hint setup |
| **Composability** | Can compose with ANY single-server PIR scheme that does not require preprocessing (e.g., SPIRAL); cannot compose with preprocessing-based PIR schemes |
```

### 5.2 "Primitive Hierarchy" for Building-block Papers

TreePIR carefully positions wpPRF within a hierarchy: PRF < pPRF (puncturable PRF) < privately puncturable PRF, and wpPRF is a relaxation of privately puncturable PRF with weaker correctness but equivalent privacy. This hierarchy is critical for understanding the contribution. The SKILL's Novel Primitives table has "Relationship to prior primitives" but could benefit from a more structured approach:

```markdown
## Primitive Hierarchy (Building-block papers)
| Primitive | Privacy | Correctness | Efficiency | Assumption | Example |
|-----------|---------|-------------|-----------|------------|---------|
| PRF | N/A | Standard | O(n) eval | OWF | GGM |
| pPRF | Hides eval at punctured point | Standard (correct everywhere except punctured point) | O(n*lambda) key | OWF | GGM pPRF |
| Privately puncturable PRF | Hides eval AND punctured point | Standard | Super-poly modulus | LWE | [7,13] |
| **wpPRF (this paper)** | **Hides eval AND punctured point** | **Weak (correct only when given correct puncture guess)** | **O(n*lambda) key, O(N log N) full eval** | **OWF** | **GGM-based** |
```

### 5.3 "Amortization Analysis" Sub-section

TreePIR's benchmarks (Figures 7, 8, 9) report "amortized query time" over different numbers of queries (200 or 2000), and the paper is clear that the offline cost is amortized over sqrt(N) queries. The SKILL asks for the amortization window but doesn't guide the agent to document:
- The amortization formula (offline_cost / num_queries + online_cost)
- How the amortized cost changes with the number of queries (especially for the first few queries vs. steady state)
- Whether the benchmarks report fully amortized or partially amortized numbers

This matters because TreePIR's Figure 7 reports amortized query time over 2000 queries (which is well above the sqrt(2^32) ~ 65536 amortization window), while Figure 8 uses only 200 queries (below the sqrt(2^22) ~ 2048 window). The SKILL should prompt the agent to check whether the reported amortization is above or below the theoretical window.

### 5.4 Guidance on "Probabilistic vs Deterministic Client Time"

TreePIR's base protocol has EXPECTED O(sqrt(N)) client time (because Step 1 of Query samples random keys until finding a covering set), but Appendix A.1 provides a deterministic variant using "shifts." This probabilistic-to-deterministic distinction is important for engineering and the SKILL doesn't have a template field for it. Add to the Complexity table a note: "Client computation type: deterministic / expected / worst-case" with guidance to check appendices for optimizations that change the type.

---

## 6. Overall Assessment

SKILL.v0.md was **effective overall** for reading TreePIR. The Quick-Start Router correctly identified the group and notation focus. The Building-block reading path was the best-fitting path and produced a natural reading order. The PRF/symmetric-key notation table and Group D parameters were relevant. The template captured most of the paper's content.

The main gaps are:
1. **Two-server model documentation** -- the SKILL is clearly written with single-server schemes as the default, and two-server specifics are an afterthought.
2. **Reading path merging** for multi-archetype papers -- template composition is addressed, but reading order composition is not.
3. **Reduction-based constructions** -- TreePIR's "PIR on N to PIR on sqrt(N)" reduction is a common pattern in Group D that deserves its own template section.
4. **Simulation-based security** -- common in two-server settings but unmentioned.

The SKILL's greatest strength for this paper was the Building-block archetype and its reading path, which perfectly matched TreePIR's structure (primitive first, then application). The explicit mention of TreePIR's wpPRF in the archetype table and building blocks table (Section 7.5) also helped confirm the classification quickly.
