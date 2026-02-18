# SKILL.v0.md Feedback -- CK20 (Private Information Retrieval with Sublinear Online Time)

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Private Information Retrieval with Sublinear Online Time |
| **Authors** | Henry Corrigan-Gibbs and Dmitry Kogan |
| **Year** | 2019 (Eurocrypt 2020, full version March 2022) |
| **ePrint** | 2019/1075 |
| **Filename** | `CK20_SublinearOnline_2019_1075.pdf` |
| **Group** | D -- Client Dependent Preprocessing |
| **Total pages** | 68 (32 main body + 36 appendix) |
| **Archetype classification attempted** | Construction (theory-only) + Building-block + Model/definition + Lower bound |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Quick-Start Router (Section 0) was useful for initial orientation

The group-based routing in Section 0, Step 1 correctly identified that Group D papers should focus on Section 3.2 (PRF/symmetric notation) and Section 3.5b (Group D parameters). The table entry for Group D noting "PRF-first; use Section 3.5b for Group D parameters" was accurate for CK20's two-server constructions. The note "unless paper uses FHE, e.g., ... CK20 single-server" was a valuable warning -- CK20's single-server scheme (Section 5, Theorem 20) does use linearly homomorphic encryption, so this cross-reference was precise and saved confusion.

### 2.2 Multi-archetype classification (Section 1) was essential

CK20 is genuinely multi-archetype and the composition rules in Section 1 were necessary. The paper is simultaneously:
- **Construction (theory-only)**: Multiple new PIR constructions (Theorems 11, 14, 17, 20, 22) with pseudocode (Constructions 16, 44) but NO implementation or benchmarks.
- **Building-block**: The primary contribution is the *puncturable pseudorandom set* primitive (Section 2), which is defined, constructed, and analyzed independently before being applied to PIR.
- **Model/definition**: The paper defines the formal model of *offline/online PIR* (Definition 8, Definition 40, Definition 46) as a new PIR variant.
- **Theory/Lower bound**: Section 6 proves a tight lower bound (Theorem 23) via reduction to Yao's Box Problem.

The composition rule "if the paper has benchmarks or concrete pseudocode, use the full Construction template as base" (Rule 1) worked, since the paper has concrete pseudocode (Constructions 16 and 44). Rule 2 ("Add the template adaptations from each secondary archetype") also applied correctly.

### 2.3 Archetype table entries (Section 1) were accurate

The "Construction (theory-only)" signature -- "proposes a new PIR scheme with proofs/pseudocode but NO implementation or benchmarks" -- matched CK20 perfectly. The instruction to "Use 'N/A (no implementation)' in Concrete columns" and "Extract analytical estimates from inline text" was exactly right for this paper.

### 2.4 Papers with multiple constructions (Section 2.1)

The note "When a paper presents 2+ independent constructions (e.g., ... CK20 ...), apply Passes 2-4 to each construction" was directly relevant. CK20 presents at least four distinct constructions: (1) two-server statistically secure (Theorem 11/Construction 16), (2) two-server computationally secure (Theorem 14), (3) two-server multi-query (Theorem 17/Construction 44), (4) single-server (Theorem 20), and (5) single-server with FHE (Theorem 22, informal). This explicit callout of CK20 by name was one of the most helpful aspects of the skill.

### 2.5 Notation sections (Section 3.2 and 3.3)

Section 3.2 (PRF/symmetric-key notation) captured the key notation elements well:
- Puncturable PRF (Gen, Punc, Eval) -- directly used in CK20.
- Statistical security kappa separate from computational lambda -- CK20 uses this distinction.
- Parity / XOR notation -- core to CK20's hint structure.

Section 3.3 (Multi-server and theory notation) was also relevant since CK20 uses the bit-string database model x in {0,1}^n and communication complexity pairs.

### 2.6 Section 4.5 (Papers without benchmarks)

The explicit listing of CK20 among "Papers without benchmarks" with the instruction to "Extract analytical estimates from inline text (e.g., '1.8 multiplications per byte'), theorem-stated bounds, and author-provided cost analysis" was exactly on target. CK20's results are purely asymptotic.

### 2.7 Appendix handling (Section 2.4)

The guidance to read appendices containing algorithms/pseudocode was essential. CK20's appendix is 36 pages and contains Construction 44 (the multi-query scheme, Appendix D), which is a complete PIR protocol specification. The guidance "When the main body has <3 pages of construction but the appendix has 5+ algorithms, the appendix IS the specification" was not quite triggered (the main body has Construction 16 on page 20), but the instruction "Always read: pseudocode of algorithms" correctly flagged the need to read Appendix D. The callout "CK20 Appendix G introduces Sparse DPFs" was also accurate -- Appendix G defines an alternative cryptographic abstraction (sparse distributed point functions).

### 2.8 Domain knowledge (Section 7)

Section 7.3 (Scheme evolution) correctly placed CK20 in the Group D lineage: "CK20 (2019, first sublinear-server cPIR without extra server storage, theory-only, puncturable pseudorandom sets) -> Piano (2023) -> Plinko (2024)." This historical framing was useful for understanding CK20's significance.

Section 7.5 (Building blocks) correctly listed "Puncturable PRF" with "CK20, Plinko" in the Used-by column, and "Linearly homomorphic encryption" with "CK20 (single-server)."

### 2.9 Complexity notation (Section 3.4)

The definitions of O_lambda() and soft-O (tilde-O) were directly relevant. CK20 uses both notations extensively and defines them explicitly (page 12, Section 1.6). The SKILL's warning "some papers define tilde-O as hiding polylog(n) rather than polylog(f). Always check the paper's definition" was useful -- CK20 defines tilde-O(g(n)) = O(g(n) * poly(log n)).

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Archetype classification is unwieldy for CK20 (Section 1)

**Problem**: CK20 spans 4+ archetypes (Construction-theory-only, Building-block, Model/definition, Theory/Lower-bound). The composition rules say to "Add the template adaptations from each secondary archetype (they stack, not replace)" but do not explain how to handle a paper where the number of archetypes is this high. The result is that the template becomes overwhelmingly large.

**Specific issue**: The paper defines *two new cryptographic primitives* (puncturable pseudorandom sets in Section 2 and sparse DPFs in Appendix G), presents *five constructions* (Theorems 11, 14, 17, 20, 22), defines *three formal models* (Definitions 8, 40, 46), and proves *a lower bound* (Theorem 23). Stacking all archetype-specific template sections creates a massive output.

**Suggestion**: Add a heuristic for papers with 4+ archetypes: "When a paper spans 4+ archetypes, organize by contribution rather than by archetype. Create one top-level section per independent contribution (e.g., 'Puncturable Pseudorandom Sets,' 'Two-Server PIR Constructions,' 'Single-Server PIR Constructions,' 'Lower Bound') and apply the relevant archetype template to each section." This contribution-centric organization would match CK20's natural structure better than archetype-centric stacking.

### 3.2 Reading order (Pass 0-4) does not work well for this paper (Section 2.1)

**Problem**: The default Construction reading order says to read evaluation (Pass 3) before the core scheme (Pass 4). But CK20 has no evaluation section at all -- no benchmarks, no implementation, no charts. The theory-only reading path (Section 2.2) says "Skip Pass 3" and "Replace with Pass 3-alt: Read the asymptotic comparison table." Table 2 (page 6) is an asymptotic comparison table, so this partially works. But the instruction "if no comparison table exists, extract bounds from theorem statements" understates the situation: for CK20, the comparison table IS the main results summary.

**More fundamentally**: The reading order for a paper with a 12-page introduction (pages 1-12), a building-block primitive section (pages 12-16), formal definitions (pages 16-18), constructions spread across main body and appendices (pages 18-27 main + 36 pages appendix), and a lower bound section (pages 28-29) does not map well to the 5-pass model.

**What I actually did**: (1) Read pages 1-2 for structure (Pass 0), (2) Read pages 3-12 for the full introduction including the toy protocol in Section 1.5 (Extended Pass 1), (3) Read pages 12-16 for the puncturable pseudorandom set primitive (this is both Pass 2 background AND a Building-block contribution), (4) Read pages 16-20 for formal definitions and Construction 16, (5) Read pages 21-29 for the remaining main body, (6) Read pages 33-68 for appendices containing Construction 44 and the lower bound proof. The 5-pass model did not cleanly separate these concerns.

**Suggestion**: Add a note to Section 2.2 (Theory papers): "For theory papers with multiple contributions (primitives + constructions + lower bounds), the 5-pass model may not cleanly separate concerns. Consider a contribution-based reading order instead: (1) Structure scan, (2) Introduction + technical overview, (3) Novel primitives/definitions, (4) Constructions in order of complexity, (5) Lower bounds, (6) Appendix constructions and proofs."

### 3.3 The toy protocol guidance is buried and underspecified (Section 2.2)

**Problem**: Section 2.2 mentions "'toy protocol' is typically the most accessible description. Use it as a standalone mini-construction." This is critically important for CK20 -- the toy protocol in Section 1.5 (pages 9-11) is the most readable description of the core idea and is essential for understanding the later formal constructions. But this guidance appears only in the theory-papers subsection. An agent following the default Construction reading path might miss it.

**Suggestion**: Promote the toy-protocol instruction to the main reading guidance (Section 2.1) or the Quick-Start Router. Add: "For papers with a 'Technical Overview' or 'Our Techniques' section in the introduction, this section often contains a toy protocol that is the most accessible entry point to the construction. Read it carefully during Pass 1, even if the paper is classified as Construction rather than Theory." CK20's Section 1.5 is titled "Technical overview" and runs 3 pages with a complete toy protocol.

### 3.4 Missing guidance for "offline/online" as a structural pattern (Section 7)

**Problem**: The SKILL's taxonomy (Section 7.2) places CK20 in Group D (Client-dependent preprocessing), which is correct. But the paper's central concept -- the *offline/online model* -- is not well represented in the SKILL's conceptual framework. The offline/online model is a structural pattern that cuts across Groups C and D: the offline phase is query-independent, the online phase is query-dependent, and the key innovation is achieving *sublinear online server time*.

The Protocol Phases template (Section 6) lists "Offline" and "Online" as generic phases, but does not highlight the specific significance of sublinear online time. For CK20, the distinction between Omega(n) offline server time and o(n) online server time IS the paper's thesis.

**Suggestion**: Add to Section 7.2 or 7.4: "Offline/online PIR: A structural pattern where the server performs query-independent Omega(n) work in an offline phase, enabling o(n) online server time. CK20 introduced this model. Key metrics: offline communication, online communication, online server time, offline server time, and the lower bound C*T = tilde-Omega(n). Distinguish from standard preprocessing where the server may still do O(n) online work."

### 3.5 The "Novel Primitives" template is too narrow for CK20 (Section 6)

**Problem**: The Novel Primitives table in the template (Section 6) asks for one primitive with fields like Name, Interface, Security definition, etc. CK20 defines TWO new primitives:
1. **Puncturable pseudorandom sets** (Section 2) -- the main building block, with three constructions (Fact 2, Theorem 3/Construction 4, Theorem 7) and extensions (Shift, GenWith, InSet).
2. **Sparse distributed point functions** (Appendix G) -- an alternative abstraction that reframes the PIR constructions.

The template has a single "Novel Primitives / Abstractions" section with one table. For a paper defining multiple related primitives with multiple constructions of each, this is insufficient.

**Suggestion**: Change "Novel Primitives / Abstractions (if applicable)" to allow multiple primitives. Add: "For papers defining 2+ novel primitives, duplicate the table for each primitive. If a primitive has multiple constructions (e.g., information-theoretic, PRG-based, PRP-based), list them as sub-rows or in a separate 'Constructions of <Primitive>' sub-section."

### 3.6 Lower bound extraction guidance is minimal (Section 6)

**Problem**: The "Lower Bounds (if applicable)" template section asks for bound statement, model assumptions, proof technique, and tightness. This is adequate for a sentence-level summary but does not guide extracting the structure of a lower bound proof. CK20's lower bound (Theorem 23) has a sophisticated structure: reduction from offline/online PIR to Yao's Box Problem, then applying a known time/space lower bound (Theorem 48). The bound is (C+1)(T+1) = tilde-Omega(n), where C = offline communication bits and T = online database probes.

The skill does not distinguish between:
- **Communication lower bounds** (how many bits must be communicated)
- **Computation lower bounds** (how much work the server must do)
- **Combined trade-off lower bounds** (C*T product bounds)
- **Model-specific restrictions** (e.g., "servers store DB in unmodified form")

**Suggestion**: Expand the Lower Bounds section with sub-fields: "(a) Bound type: communication / computation / trade-off / impossibility. (b) Variables: define each variable in the bound (e.g., C = offline comm bits, T = online probes). (c) Model restriction: what the server is NOT allowed to do. (d) Reduction: from what problem. (e) Matching upper bound: cite the theorem that achieves the bound."

### 3.7 "Correctness model" options do not cover CK20 well (Section 6)

**Problem**: The Correctness model field in the metadata table lists options including "Probabilistic (failure prob <= negl(kappa))" and "Probabilistic (failure grows over Q queries)." CK20's correctness model is more nuanced:
- Each single read fails with probability at most 1/2 (page 49: "each read fails with probability at most s/n <= 1/2 for s <= n/2").
- Running lambda instances in parallel drives the failure probability to 2^{-lambda}.
- The client can detect failures and fall back to a non-private lookup, achieving *perfect correctness* at the cost of negligible security loss.
- For the multi-query scheme (Section 4), the failure probability per query remains the same, but a union bound gives failure probability at most T/2^{lambda} over T queries.

None of the listed options precisely capture "constant failure probability, amplifiable via parallel repetition to negl(lambda), with optional detection and fallback."

**Suggestion**: The existing "Occasional (constant failure, amplifiable)" option almost fits but should be expanded. Add to the list: "Occasional-with-detection (constant per-instance failure, detectable by client, amplified via parallel repetition, optionally convertible to perfect correctness with negligible security loss)." CK20 is the canonical example.

### 3.8 Two-server model documentation is underdeveloped (Section 6)

**Problem**: The Protocol Phases table has a "Server" column (S1, S2), which is useful. But CK20's two-server model has a crucial structural property: the *offline server* and the *online server* are different servers, and which server does what matters enormously for security. The left/right (or offline/online) server distinction is fundamental -- the offline server sees the hint request but not the query, while the online server sees the query but not the hint. Security is defined separately for each server (Games 41 and 42, page 54).

The SKILL mentions "For multi-server schemes, label each server's role" (Section 5) but does not provide guidance on how to document *per-server security guarantees*, which are essential for two-server schemes.

**Suggestion**: Add to the Security Model documentation: "For two-server schemes, document: (a) which server participates in which phase, (b) what each server learns (its 'view'), (c) the security guarantee per server (statistical vs. computational), and (d) the non-collusion assumption." For CK20: the offline server has statistical security, the online server has statistical or computational security depending on the variant, and the servers must not collude.

### 3.9 Missing guidance for formal definition extraction (Section 2.8)

**Problem**: Section 2.8 (Model/definition papers) says "Read formal definitions carefully -- they ARE the contribution." But it does not provide specific guidance for *what to extract* from a formal definition. CK20 provides three separate formal definitions (Definitions 8, 40, 46) with increasing generality. Each defines syntax (algorithm tuple), correctness, and security separately. The syntax, correctness, and security notions differ between the single-query two-server model, the multi-query two-server model, and the single-server model.

**Suggestion**: Add to Section 2.8: "For each formal definition, extract: (1) the algorithm tuple with input/output types, (2) the correctness game/condition, (3) the security game/condition with advantage definition, (4) the efficiency requirements, and (5) how it relates to the other definitions in the paper. For papers with multiple related definitions (e.g., single-query vs. multi-query), organize them in a hierarchy showing what each extension adds."

### 3.10 The Remark/Note guidance (Section 8) was useful but could be more prominent

**Problem**: Section 8 says to "Pay special attention to 'Remark,' 'Note,' and 'Observation' blocks." CK20 contains 11 numbered remarks (Remarks 5, 9, 10, 12, 13, 19, 21, 24, 37, 38, 39, 43), many of which contain critical information:
- Remark 9 (Online running time): Clarifies that "online time" means database probes via oracle access, not wall-clock time.
- Remark 10: Every two-server IT-PIR scheme is already an offline/online scheme.
- Remark 12: Running times can be made as small as O(lambda * log n) with care.
- Remark 13: Trading communication for online time -- continuous tradeoff.
- Remark 21: A simpler scheme with O(sqrt(n)) everything exists (no public-key crypto online).
- Remark 37: Extension to multi-bit database rows.
- Remark 39: Connection to the 3-SUM problem.
- Remark 43: Malicious security holds for free because queries are independent of answers.

These remarks are scattered through the paper and are easy to miss. The SKILL's guidance to look for them is helpful, but it should be stronger: "For theory papers, Remarks often contain the most deployment-relevant insights."

---

## 4. Specific Improvement Suggestions

### 4.1 Add "Offline/Online PIR" as a recognized model in Section 7.2

**Current text** (Section 7.2, Group D entry): "Each client gets a personalized offline hint."

**Suggested addition** after the Group D row or as a new subsection:
> **Offline/Online PIR model**: Introduced by CK20. The protocol has two phases: (1) an offline phase, executed *before* the client knows its query index, where the server does O(n) work and the client receives a hint; (2) an online phase, executed *after* the client chooses its index, where the server does o(n) work. The fundamental lower bound is (C+1)(T+1) = tilde-Omega(n), where C = offline communication and T = online probes [CK20, Theorem 23]. This model is the ancestor of Group D sublinear-server schemes (Piano, Plinko, TreePIR).

### 4.2 Expand the archetype table with a "Multi-contribution theory" entry

**Suggested new row in Section 1 archetype table**:

| Multi-contribution theory | Introduces new primitives, new formal models, multiple constructions, and lower bounds; no implementation | Organize notes by contribution (primitive, constructions, lower bound). Use Building-block template for the primitive, Model/definition template for formal definitions, Construction (theory-only) for each scheme, and Lower Bounds section. |

### 4.3 Add pass guidance for papers with extended technical overviews

**Suggested addition to Section 2.1** (or a new bullet in Section 2.2):
> **Extended technical overviews (8+ pages)**: Some theory papers have introductions that span 8-12 pages and include a complete toy protocol, improvement sequence, and proof sketches. For such papers, Pass 1 should cover the entire introduction (not just pages 1-2). The toy protocol in the technical overview is often the single most useful artifact for engineering understanding. Extract it as a "Simplified Scheme" in the notes.

### 4.4 Add sparse DPF to the building blocks table

**Suggested addition to Section 7.5**:

| Sparse DPF (Sparse Distributed Point Function) | CK20 (Appendix G) | Alternative abstraction for offline/online PIR; relaxation of standard DPF where right key evaluation is sparse |

### 4.5 Clarify the "Variants" table for continuous tradeoff papers

CK20's Remark 13 describes a continuous tradeoff: for any function C(n) <= n/2, setting offline communication to C(n) bits gives online server time tilde-O(n/C(n)). The Variants table format (with discrete rows) does not naturally accommodate continuous tradeoffs. The SKILL notes "For papers with a continuous tradeoff (not discrete variants), describe the tradeoff axes and representative operating points" -- this guidance exists but is easy to miss because it appears as a small italicized note under the Variants table.

**Suggestion**: Move the continuous-tradeoff guidance into the Variants section header and make it a bolded instruction.

### 4.6 Add guidance for "rebalancing" as a standard technique

CK20 uses a "rebalancing" technique (page 27) from [CGKS95, Section 4.3] to trade client upload for client download, converting an unbalanced scheme (heavy upload, light download) into a balanced one. This is a recurring technique in PIR. The SKILL's "Portable Optimizations" section could mention: "Rebalancing (CGKS95 Section 4.3): Partition the database into sub-databases, run the PIR scheme on each, and use a single outer query. Converts upload-heavy schemes to balanced ones."

---

## 5. New Patterns or Template Sections the SKILL Should Add

### 5.1 "Simplified / Toy Protocol" section

CK20's toy protocol (Section 1.5, pages 9-11) is far more accessible than the formal constructions. The notes template should have an optional section:

```
## Simplified Protocol / Toy Scheme (if present)
_For papers that present a simplified version of the main construction in the introduction._
- **Location in paper:** <e.g., Section 1.5, pages 9-11>
- **What it achieves:** <e.g., o(n) online time but super-linear offline communication>
- **What it omits:** <e.g., puncturable pseudorandom sets, multi-query support>
- **Step-by-step description:** <numbered steps>
```

### 5.2 "Improvement sequence" extraction

CK20 presents the toy protocol and then systematically improves it via three modifications (reducing online communication via puncturable pseudorandom sets, refreshing client state for multi-query support, converting two-server to single-server). This "problem -> toy solution -> improvement 1 -> improvement 2 -> final construction" structure is common in theory papers and should be documented.

**Suggested template section**:
```
## Construction Evolution (if paper presents incremental improvements)
| Step | Problem Addressed | Technique | Result |
|------|------------------|-----------|--------|
| Toy scheme | Baseline | Random partition + XOR parities | o(n) online but Omega(n log n) offline comm |
| + Derandomization | Reduce offline comm + storage | Single set + random shifts | tilde-O(sqrt(n)) offline |
| + Puncturable sets | Reduce online comm | Compressed set representation | O(lambda * log n) online comm |
| + State refresh | Support multiple queries | GenWith + refresh via left server | Unbounded adaptive queries |
| + LHE encryption | Single-server | Encrypt offline query homomorphically | tilde-O(n^{2/3}) comm + time |
```

### 5.3 Per-server security analysis template

For two-server schemes, add:
```
## Per-Server Security
| Server | Phase | View | Security Level | Game/Definition |
|--------|-------|------|---------------|-----------------|
| Offline (left) | Offline | Hint request q_h | Statistical / Computational | Definition 8 / Game 41 |
| Online (right) | Online | Query q | Statistical / Computational | Definition 8 / Game 42 |
| Collusion | Both | q_h + q | NOT secure | Non-collusion assumed |
```

### 5.4 Formal definition hierarchy template

For papers defining multiple related formal models:
```
## Formal Definitions Hierarchy
| Definition | Name | Location | Extends | Key Addition |
|-----------|------|----------|---------|-------------|
| Def 8 | Offline/Online PIR (single-query, two-server) | p. 17 | Standard PIR | Offline/online split, two servers |
| Def 40 | Multi-query offline/online PIR | p. 52 (Appendix D) | Def 8 | Stateful Query, updated hint, adaptive queries |
| Def 46 | Single-server offline/online PIR | p. 61 (Appendix E) | Def 8 | Same server for both phases |
```

### 5.5 Yao's Box Problem and other external reductions

CK20's lower bound relies on a reduction to Yao's Box Problem. The SKILL should maintain a small catalog of external problems used in PIR lower bounds:
- **Yao's Box Problem** [Yao90]: Used by CK20 for offline/online PIR lower bounds.
- **Communication complexity lower bounds**: Used for standard PIR lower bounds.
- **LDC (Locally Decodable Code) connections**: Used for DEPIR impossibility results.

This would help agents recognize when a lower bound proof is a standard reduction vs. a novel argument.

---

## 6. Summary Assessment

SKILL.v0.md performed well as a starting guide for CK20, particularly in:
- Correctly identifying the paper's multi-archetype nature and naming it explicitly in several sections
- Providing relevant notation guidance for Group D papers
- Warning about the absence of benchmarks
- Pointing to the appendices as containing essential constructions

The main gaps are:
1. **The 5-pass reading model breaks down** for theory papers with extended introductions, multiple constructions, and significant appendix content. A contribution-based reading order would be more natural.
2. **Multi-archetype papers with 4+ archetypes** need a different organizational strategy (contribution-centric rather than archetype-centric).
3. **Two-server model documentation** needs per-server security analysis guidance.
4. **The toy protocol** is the single most useful artifact in the paper but the guidance to extract it is buried in a subsection for theory papers.
5. **Lower bound extraction** needs more structured guidance (bound type, variables, model restrictions, reduction source, matching upper bound).
6. **Correctness model options** need "occasional with detection and amplification" as a named option.
7. **The offline/online PIR model** deserves its own entry in the domain knowledge section, given that CK20 introduced it and it is foundational to all of Group D.
