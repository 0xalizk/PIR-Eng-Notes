# SKILL.v0.md Feedback -- WangRen_2024_1845.pdf

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Single-Server Client Preprocessing PIR with Tight Space-Time Trade-off |
| **Authors** | Zhikun Wang, Ling Ren |
| **Year** | 2024 |
| **ePrint** | 2024/1845 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | Construction (theory-only) + Building-block + Lower bound extension |
| **Total pages** | 29 (21 main body + 8 appendix) |

### Archetype classification notes

The SKILL's archetype table (Section 1) was partially helpful but required deliberation. This paper is:

1. **Construction (theory-only):** It proposes a new PIR scheme (Construction 4.2) with formal algorithms and proofs but NO implementation or benchmarks. The SKILL correctly flags WangRen as a "no benchmarks" paper in Section 4.5.

2. **Building-block:** The relocation data structure (Section 3, Construction 3.5) is an independently-defined, independently-proven primitive that is the paper's primary technical contribution. This maps cleanly to the Building-block archetype.

3. **Lower bound extension:** Appendix B extends two existing lower bounds (Yeo23, ISW24) to w-bit entries and proves a new communication barrier (Theorem B.4). This does not cleanly map to any single archetype in the SKILL's table. It is closest to "Theory" but it is not a standalone theory paper -- it is an appendix contribution alongside a construction.

**The multi-archetype composition rules (Section 1) worked well here.** Rule 1 ("if the paper has concrete pseudocode, use the full Construction template as the base") correctly identified the base. Rule 2 ("add template adaptations from each secondary archetype") correctly directed me to add Novel Primitives and Lower Bounds sections.

---

## 2. What SKILL.v0.md Got Right

### 2.1 Quick-Start Router (Section 0) -- Effective

The group-based routing table correctly directed me to:
- Use Section 3.2 (PRF/symmetric-key notation) as the primary notation reference
- Skip Section 3.1 (Lattice/FHE) entirely -- the paper uses zero FHE
- Use Section 3.5b for Group D parameters

This saved significant time. The paper indeed uses PRFs, PRPs, XOR parities, and OWFs exclusively.

### 2.2 Scheme Name Warning (Section 1) -- Directly Relevant

The SKILL explicitly warns: "WangRen -- paper has no branded scheme name." This is accurate. The paper never names its scheme. It refers to it only as "our scheme," "our construction," or "Construction 4.2." This warning prevented me from wasting time searching for a scheme name.

### 2.3 Section 4.5 (Papers without benchmarks) -- Accurate

The SKILL lists WangRen among papers without benchmarks and correctly directs: "Extract analytical estimates from inline text (e.g., '1.8 multiplications per byte'), theorem-stated bounds, and author-provided cost analysis." This was exactly the right guidance. The paper's Theorem 1.1 and Theorem 4.1 provide the key complexity claims, and Lemma 4.9 proves them. Section 4.3 (Efficiency) provides the analytical breakdown.

### 2.4 PRF/Symmetric-Key Notation Table (Section 3.2) -- Partially Relevant

Several entries in the Section 3.2 table were directly applicable:
- **PRP:** `pi_sk(i)` -- the paper uses small-domain PRPs extensively (the DS data structure's permutation P). The SKILL correctly notes "Small-domain PRPs also used (WangRen)."
- **PRF keys:** `sk, msk` -- the paper uses a master key `ck_hat` from which per-row PRP keys are derived.
- **Parity / XOR:** `p = XOR_{i in S} DB[i]` -- the paper's hint structure `h_c = XOR_{j in [T]} DB_j[DS_j.Access(c)]` is exactly this pattern.
- **Chunk function:** `chunk(i) = floor(i/sqrt(n))` -- the paper uses `j = floor(i/m)` to identify the hint table row, which is the same pattern.

### 2.5 Group D Critical Parameters (Section 3.5b) -- Useful

The SKILL's Section 3.5b checklist helped me systematically extract:
- Amortization window Q = n/T (correctly prompted)
- Word size w (correctly prompted)
- Update cost O(1) PRP calls (correctly prompted)
- The "Failure probability" entry prompted me to note that this scheme has **deterministic correctness** (Lemma 4.4), which is unusual for Group D

### 2.6 Space-Time Tradeoff (Section 7.7) -- Directly Referenced

The SKILL's Section 7.7 states: "Space-time tradeoff: Client storage S x online server time T = O(nw) is the fundamental lower bound (WangRen)." This is exactly the paper's main result. The SKILL correctly identifies this paper as establishing the tight tradeoff.

### 2.7 Pass 0 (Structure Scan) -- Appropriate

Reading pages 1-2 first was valuable. I identified:
- Section structure: 1 Introduction (pp. 1-9), 2 Preliminaries (pp. 9-12), 3 Relocation Data Structure (pp. 12-17), 4 PIR Scheme (pp. 17-22), A Appendix (pp. 25-27), B Appendix (pp. 27-29)
- No evaluation/benchmarks section (confirming theory-only archetype)
- Total 29 pages

### 2.8 Appendix Handling (Section 2.4) -- Good Guidance

The SKILL's appendix handling rules correctly triggered for this paper:
- Appendix A contains deferred efficiency proofs (Lemmas A.1-A.4) that establish the construction's key complexity claims -- the SKILL says to "read selectively: deferred efficiency proofs that establish the paper's key performance claims." Correct.
- Appendix B contains new lower bound extensions -- the SKILL says "always read: sections that introduce NEW constructions or alternative protocol variants." Appendix B introduces new theorems (B.1-B.4), so it qualifies.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Theory-Only Construction Reading Path Mismatch (Section 2.1 vs 2.2)

**Problem:** The SKILL presents two reading paths -- Section 2.1 for Construction papers and Section 2.2 for Theory papers. WangRen is a "Construction (theory-only)" paper, which falls between them. The SKILL's archetype table (Section 1) says to use "Full template minus Performance Benchmarks and Implementation Notes" but does not clearly say which *reading path* to follow.

Section 2.1 says "Read evaluation (Pass 3) before the core scheme (Pass 4)." But for a theory-only construction, there IS no evaluation section. Section 2.2 says "Skip Pass 3" and replace with "Pass 3-alt: Read the asymptotic comparison table." But this paper has no comparison table either -- its comparisons are embedded in the introduction text (pages 2-3).

**What actually worked:** I followed a hybrid path:
- Pass 0: pages 1-2 (SKILL's guidance worked)
- Pass 1: pages 1-9 (extended intro, including the full technical overview which IS the most accessible description -- SKILL Section 2.2 correctly predicts this)
- Pass 2: pages 9-12 (Preliminaries -- standard)
- Pass 3: Skipped (no evaluation exists) -- but I did not find it useful to search for a "comparison table" as Section 2.2 suggests, because the comparisons were already in Pass 1
- Pass 4: pages 12-22 + Appendices (core construction)

**Suggestion:** Add a "Construction (theory-only)" reading path (perhaps Section 2.1b) that explicitly says:
```
For construction papers without benchmarks:
- Pass 0-1: As default. Extended intro likely contains technical overview.
- Pass 2: As default.
- Pass 3: Skip. Extract complexity claims from theorem statements
  (usually in Section 1.1 or wherever "Our Contributions" appears).
  Do NOT search for evaluation/benchmark sections.
- Pass 4: Read core construction + appendices with deferred proofs.
```

### 3.2 Building-Block Reading Path Conflict (Section 2.6)

**Problem:** The SKILL's Section 2.6 says for Building-block papers: "Pass 2: Read the primitive's formal definition, algorithms, and interface BEFORE its evaluation. This differs from the default order." But for WangRen, there is no separate evaluation for the primitive (the relocation data structure). Its "evaluation" is its efficiency proof (Theorem 3.3, proved in Appendix A.1), which is interleaved with the correctness and security proofs. The SKILL's guidance to look for a "Pass 3a: primitive's standalone evaluation" and "Pass 3b: PIR application evaluation" does not map onto this paper's structure at all.

**What actually worked:** I read Section 3 linearly (definition -> construction -> correctness -> security -> efficiency), then Section 4 linearly. The primitive and PIR construction are clearly demarcated by section boundaries, not by evaluation/theory boundaries.

**Suggestion:** Amend Section 2.6 to note that for theory-only building-block papers, the "evaluation" is the efficiency theorem and its proof, which is typically part of the construction section or an appendix, not a standalone evaluation section.

### 3.3 Missing Notation: Relocation/Consumption Semantics (Section 3.2)

**Problem:** The paper introduces a novel data structure paradigm -- "consuming" hint table columns and "relocating" entries -- that is not captured by any notation entry in Section 3.2. This is the paper's central technical concept:
- `C` -- array of consumed positions (columns)
- `DS.Access(c)`, `DS.Locate(e)`, `DS.Relocate(c)` -- data structure operations
- The helper graph G with chains and cycles
- `Hist` -- relocation history data structure
- `m' = 2m` -- the expanded hint table width (m real entries + m empty slots)

The SKILL's Section 3.2 has entries for "Hint table" (`H[i][j]`), "Partition-based hints" (`S_j, h_j`), and "Dummy subsets" (`D_j`), but none of these capture the relocation/consumption pattern. This is a fundamentally different hint management strategy from all other Group D papers.

**Suggestion:** Add to Section 3.2:

```
| Relocation data structure | DS, Access, Locate, Relocate |
  Positions consumed per query; elements relocated to empty slots.
  Used in WangRen. |
| Consumed positions | C | Array tracking which hint table
  columns have been used |
| Expanded hint table | m' = 2m, with m real + m empty positions |
  Extra positions for relocation targets |
```

### 3.4 Deterministic Correctness in a Group D Paper (Section 6 Template)

**Problem:** The SKILL's Correctness Analysis section (Option B) for Group D papers assumes probabilistic correctness: "Failure mode," "Failure probability," "Probability grows over queries?" etc. But WangRen has **deterministic correctness** (Lemma 4.4 -- "perfect correctness"). The template should handle this gracefully.

Option C exists ("No Correctness Analysis -- deterministic correctness, no noise") but it is framed as being for "XOR-based schemes." WangRen IS an XOR-based scheme with deterministic correctness, but calling it "no analysis needed" undersells it -- the paper spends significant effort proving correctness (Lemma 4.3, 4.4). The correctness proof is non-trivial because it must show that hints remain valid after relocations.

**Suggestion:** Expand Option C to acknowledge that deterministic correctness can still require substantial proof work:
```
### Option C: Deterministic Correctness
_For schemes with deterministic (perfect) correctness._
- **Correctness statement:** <e.g., "All recovered entries are correct
  for all honest executions" (Lemma 4.4)>
- **Key invariant:** <e.g., "Hints remain correct after every query
  because each entry contributes to exactly one hint column">
- **Non-trivial aspects:** <e.g., "Correctness through relocations
  requires proving hint values track column parities (Lemma 4.3)">
```

### 3.5 Security Model Nuance: Perfect vs Computational (Not in Template)

**Problem:** WangRen first proves **perfect security** using truly random permutations (Lemma 4.7, 4.8), then argues that replacing random permutations with PRPs gives computational security. This two-step proof structure (ideal-world perfect security -> computational indistinguishability) is common in Group D papers but is not captured in the SKILL's template.

The SKILL's metadata table has "Security model" as a single field (e.g., "Semi-honest single-server"). WangRen's security is more nuanced:
- Perfect security in the random permutation model
- Computational security under OWF (via PRP)
- Adaptive query security (the adversary chooses queries based on previous server responses)

**Suggestion:** Consider adding a "Security proof technique" entry to the template's metadata or Cryptographic Foundation section:
```
| **Security proof structure** | <e.g., Perfect security in ideal model
  (random permutations) + computational indistinguishability via PRP.
  Adaptive queries supported.> |
```

### 3.6 The "Builds On" Lineage is Non-Obvious (Section 6 Template)

**Problem:** The SKILL's Lineage section asks for "Builds on: scheme names + groups." For WangRen, the primary predecessor is LP24 (Lazzaretti-Papamanthou, "Single Pass Client-Preprocessing PIR," USENIX Security 2024), which is filed in this collection as `SinglePass`. But the relationship is unusual -- WangRen does not modify SinglePass. Rather, it takes the hint table organization idea from LP24's two-server scheme and solves the problem of making it work with a single server and sublinear storage. The SKILL's "What changed" field ("which algorithm/phase was modified and how") does not quite capture this "took an idea from a two-server scheme and solved two open problems to make it single-server" relationship.

**Suggestion:** Consider expanding the "What changed" field's examples to include this pattern: "Adapted [predecessor]'s [specific idea] from [different model] to [new model] by solving [specific challenges]."

### 3.7 Missing Archetype: "Lower Bound Extension" or "Theoretical Contribution Appendix"

**Problem:** The paper's Appendix B is a significant standalone theoretical contribution: it extends Yeo23's lower bound to w-bit entries (Theorem B.1), extends it to amortized probes (Theorem B.2), extends ISW24's SZK barrier to w-bit entries (Theorem B.3), and proves a new amortized communication barrier (Theorem B.4). None of the SKILL's archetypes cleanly capture "appendix that extends prior lower bounds." The closest is the "Theory" archetype, but this paper is not a theory paper -- it has a concrete construction.

The SKILL's multi-archetype composition rules say to "add the template adaptations from each secondary archetype." For Theory, the adaptation is "Add Lower Bounds section." This worked, but the discovery process was indirect.

**Suggestion:** In Section 1, under the multi-archetype notes, add a note: "Papers with appendices proving new lower bounds or extending prior bounds should include the Lower Bounds template section, even if the paper's primary archetype is Construction."

### 3.8 Pass 1 Length Underestimated for Theory-Heavy Construction Papers

**Problem:** The SKILL (Section 2.1) says Pass 1 covers "Page 1 through end of Section 1 (may be 2-12 pages; theory papers and papers with technical overviews have long introductions)." WangRen's introduction runs pages 1-9, which is at the upper end. The SKILL's "(may be 2-12 pages)" range is technically correct, but the guidance "read the full intro" buried in Section 2.2 (Theory papers) is more important for this paper. The technical overview (Section 1.2, pages 3-7) IS the most accessible description of both the single-server adaptation and the relocation data structure.

This is correctly predicted by the SKILL's Section 2.2: "Theory papers often have 8-12 page introductions with technical overviews and toy protocols. Read the full introduction -- the toy protocol is typically the most accessible description." But this guidance is under "Theory papers," not "Construction (theory-only)" papers.

**Suggestion:** Move the "read the full intro" guidance to apply to ALL papers with long introductions (>5 pages), not just Theory papers. Or duplicate it in a "Construction (theory-only)" reading path.

### 3.9 Database Update Support Underrepresented

**Problem:** WangRen briefly addresses database updates (page 22, "Handling database updates"), showing O(1) expected PRP calls and two XORs per update. The SKILL's template has an "Update/maintenance" archetype with detailed update metrics, but this paper is NOT an Update/maintenance paper -- updates are a side benefit, not the main contribution. The template's guidance ("for Update/maintenance papers") makes it unclear whether to include update information for papers where updates are discussed but not the focus.

The paper's update mechanism is elegant (because each DB entry contributes to exactly one hint, updates are cheap) and worth documenting, but the full Update metrics table (cost per update, communication per update, aggregation threshold, deletion semantics, supported mutation types) is overkill.

**Suggestion:** Add a lightweight "Deployment Considerations > Database updates" entry for papers that mention updates but are not primarily about updates. The current template has this under "Deployment Considerations" but it only says "re-preprocess per shard / incremental O(1) / not addressed." It could be expanded: "For papers where updates are discussed as a side benefit, include a brief note under Deployment Considerations. Reserve the full Update Metrics sub-table for Update/maintenance archetype papers."

### 3.10 Novel Data Structure as a Primitive -- Template Inadequacy

**Problem:** The SKILL's "Novel Primitives / Abstractions" template section is designed for cryptographic primitives (PRFs, PRPs, etc.) with "Interface / Operations," "Security definition," etc. WangRen's relocation data structure (Section 3) is a data structure, not a cryptographic primitive. It has:
- Three operations (Access, Locate, Relocate) with formal correctness and security definitions
- Two security experiments (Experiment 3.1 and 3.2) defining "perfect security"
- Efficiency guarantees (O(1) expected time per operation)
- A clean separation between the ideal construction (random permutations, Section 3) and the computational instantiation (PRPs, Section 4)

The "Novel Primitives" template mostly fits, but the "Security definition" field does not cleanly capture the experiment-based definition. And the "Built from" field assumes cryptographic building blocks, not algorithmic structures (the DS is built from a permutation + hash map + array, which are not cryptographic).

**Suggestion:** Expand the Novel Primitives template to accommodate data structure primitives:
```
| **Type** | <Cryptographic primitive / Data structure / Abstraction> |
| **Security definition** | <For data structures: experiment-based
  indistinguishability from ideal (Experiments X.Y and X.Z).
  For crypto primitives: game-based definition (Definition X.Y)> |
| **Built from** | <e.g., permutation (random or PRP) + hash map +
  array. For crypto: GGM-tree PRF from OWF> |
```

---

## 4. Specific Improvement Suggestions

### 4.1 Add "Construction (theory-only)" to Reading Path Table (Section 0, Step 2)

Current table has no explicit entry for "Construction (theory-only)." Add:

```
| Construction (theory-only) | S2.1 modified: skip Pass 3,
  extend Pass 1, read appendix proofs | Full template minus
  Performance Benchmarks, Implementation Notes |
```

### 4.2 Fix Section 7.3 Lineage Entry for WangRen

Current text in Section 7.3 says: "WangRen (2024, tight space-time tradeoff ST = O(nw), relocation data structure)." This is accurate but could be enriched:

```
WangRen (2024, tight space-time tradeoff ST = O(nw),
novel relocation data structure replaces linear-storage
permutation arrays; adapts LP24's hint table from 2-server
to 1-server).
```

### 4.3 Section 3.2: Add Small-Domain PRP Complexity

The SKILL's Section 3.2 mentions PRPs but does not note the complexity of small-domain PRP evaluation, which is critical for WangRen's efficiency analysis. Add:

```
| Small-domain PRP cost | O(log N + poly log lambda) per
  evaluation [MR14] | Critical for WangRen -- each DS
  operation requires O(1) expected PRP calls |
```

### 4.4 Section 7.7: Expand Preprocessing-Specific Intuition

The SKILL's Section 7.7 correctly states the ST = O(nw) tradeoff. Expand to note the parametric nature:

```
- **Parametric tradeoff:** WangRen's scheme is parameterized
  by T (server online time). Setting T = sqrt(n) gives the
  "balanced" point S = O(sqrt(n) * w * log n), T = O(sqrt(n)).
  The scheme can be tuned to any point on the ST = O(nw) curve.
```

### 4.5 Complexity Notation (Section 3.4): Add Tilde-Omega

The paper uses `Omega-tilde(n)` notation (hiding polylog factors in lower bounds). Section 3.4 covers `O-tilde` but not `Omega-tilde`. Add:

```
- **Tilde-Omega:** Omega-tilde(f) = Omega(f / polylog(f)).
  Used in lower bounds. WARNING: same ambiguity as O-tilde
  regarding what the polylog hides.
```

---

## 5. New Patterns or Template Sections the SKILL Should Add

### 5.1 "Proof Architecture" Section for Theory-Heavy Papers

WangRen's proof structure is worth documenting but has no natural home in the current template. The paper proves:
1. DS correctness (Lemmas 3.13-3.15)
2. DS perfect security (Lemma 3.16, via induction on relocation count)
3. DS efficiency (Theorem 3.3, deferred to Appendix A.1)
4. PIR correctness (Lemmas 4.3-4.4)
5. PIR perfect security (Lemma 4.7-4.8, via DS security + PRP indistinguishability)
6. PIR efficiency (Lemma 4.9, with client time deferred to Appendix A.2)
7. Lower bound extensions (Appendix B, Theorems B.1-B.4)

**Suggestion:** Add an optional "Proof Architecture" section to the template for theory-heavy papers:
```
## Proof Architecture (for theory-heavy papers)
| Claim | Location | Technique | Dependencies |
|-------|----------|-----------|--------------|
| <e.g., DS Correctness> | <Lemma 3.13-3.15> |
  <Graph-based: helper graph G with chains> | <Definition 3.6> |
```

### 5.2 "Helper Graph / Visualization" Pattern for Data Structure Papers

WangRen uses a helper graph G (Definition 3.6, Figure 4) as an analytical tool to reason about the relocation data structure. The graph has chains and cycles, and the operations (Access, Locate, Relocate) correspond to traversals. This visual/analytical structure is independently useful for understanding the scheme but is not captured by the current template.

**Suggestion:** In the "Key Data Structures" template section, add guidance: "For papers using graphs or other analytical structures to reason about data structure operations, document the analytical structure alongside the data structure."

### 5.3 "Communication Barrier" vs "Lower Bound" Distinction

WangRen distinguishes between:
- **Lower bounds** (Theorems B.1, B.2): Unconditional results that any scheme must satisfy (ST = Omega(nw))
- **Communication barriers** (Theorems B.3, B.4): Conditional results saying that beating certain communication thresholds implies a hard problem in SZK (which is not known to follow from OWF)

The SKILL's template has "Lower Bounds" but does not distinguish barriers from lower bounds. The paper's Section 1.1 says "our protocol meets a communication barrier" -- this is a weaker claim than matching a lower bound.

**Suggestion:** Expand the Lower Bounds template section:
```
## Lower Bounds and Barriers (if applicable)
### Lower Bounds
- **Statement:** <unconditional>
- **Model:** <assumptions on server storage, client state>

### Communication Barriers
- **Statement:** <conditional -- breaching implies hard problem in X>
- **Complexity class:** <e.g., SZK>
- **Interpretation:** <e.g., "barrier against PIR schemes using only
  symmetric-key crypto and database-oblivious queries">
```

### 5.4 Streaming Preprocessing as a Key Deployment Property

WangRen's HintConstruct phase (Construction 4.2) streams the entire database once, updating hints incrementally. This "streaming preprocessing" property is important for deployment (requires only O(w) working memory for the DB scan, not random access). The SKILL's Protocol Phases template has a column "When / Frequency" but does not specifically prompt for streaming vs random-access preprocessing.

The SKILL's Section 5 (Protocol flow diagrams) mentions "Note whether offline phase is streaming (single pass over DB) or random-access," which is good, but this should also be reflected in the template's Protocol Phases table or Deployment Considerations.

### 5.5 Query Independence Assumption

WangRen's efficiency analysis requires that queries are independent of the scheme's internal randomness (footnote 1, page 17). This is handled by an additional PRP at the beginning of the protocol (described in Appendix A.2, "Efficiency for arbitrary queries"). This is a subtle assumption that affects the efficiency claims but not correctness or security. The SKILL does not have guidance for documenting such assumptions.

**Suggestion:** In the Correctness Analysis or Complexity section, add a field:
```
| **Efficiency assumptions** | <e.g., Queries independent of scheme
  randomness (handled by additional PRP on indices)> |
```

---

## 6. Summary Assessment

**Overall, SKILL.v0.md was moderately effective for this paper.** The quick-start router, group-based notation routing, and scheme name warnings were immediately helpful. The PRF/symmetric-key notation table covered approximately 60% of the paper's notation. The archetype classification system identified the right archetypes, and the multi-archetype composition rules worked as designed.

**The main gaps were:**
1. No explicit reading path for "Construction (theory-only)" papers -- had to mentally merge Sections 2.1 and 2.2
2. The template assumes Group D papers have probabilistic correctness -- WangRen has deterministic correctness
3. The Novel Primitives template is biased toward cryptographic primitives, not data structures
4. No guidance for documenting lower bound extensions that are secondary contributions
5. The distinction between lower bounds and communication barriers is not captured

**The SKILL's strongest contribution was preventing wasted effort:** the scheme name warning, the "no benchmarks" flag, and the group-based notation routing collectively saved at least one full reading pass worth of time.
