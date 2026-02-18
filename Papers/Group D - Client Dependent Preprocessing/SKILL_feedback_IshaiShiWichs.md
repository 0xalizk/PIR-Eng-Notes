# SKILL.v0.md Feedback -- IshaiShiWichs_2024_976.pdf

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | PIR with Client-Side Preprocessing: Information-Theoretic Constructions and Lower Bounds |
| **Authors** | Yuval Ishai, Elaine Shi, Daniel Wichs |
| **Year** | 2025 (ePrint 2024/976) |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification attempted** | Theory + Construction (theory-only) + Model/definition |
| **Actual best-fit archetype** | Multi-archetype: Theory (primary) + Construction (theory-only) + Model/definition. Lower bounds are a co-equal contribution alongside the constructions, not subordinate. |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Archetype classification was largely accurate (Section 1)

The archetype table in Section 1 correctly identifies "Construction (theory-only)" and "Theory" as distinct categories. The paper has both novel constructions (Theorems 3.1, 3.2, 4.3, 4.4, A.3, B.1) and lower bound / barrier results (Theorems 1.1, 1.2, 5.1). The "Theory" archetype signature ("No implementation/benchmarks; proves asymptotic bounds, lower bounds, or feasibility results") matches this paper well.

The "IshaiShiWichs" entry in the scheme name warning table (Section 1) correctly notes "paper has no single scheme name; multiple unnamed constructions." This was helpful -- it saved time searching for a branded name that does not exist.

### 2.2 Pass 1 extended guidance for theory papers was very helpful (Section 2.2)

The instruction "Theory papers often have 8-12 page introductions with technical overviews and toy protocols. Read the full introduction" was precisely correct. The introduction runs from page 1 through page 9 (Sections 1-1.3), roughly 9 pages. It contains the key comparison table (Table 1, page 3), all major theorem statements (1.1-1.5), the technical highlight for the lower bound proof (Section 1.2), and the adaptive correctness attack on Piano (Section 1.3). Reading all of this before anything else was the right call.

### 2.3 Multi-server and theory notation section was relevant (Section 3.3)

The theory notation table (Section 3.3) correctly identifies the bit-string database convention (x in {0,1}^n), communication complexity pairs, and XOR as core operations. This paper uses exactly these conventions.

### 2.4 Quick-Start Router worked for initial orientation (Section 0)

Step 1 (Group D from directory path) and Step 2 (classify archetype from abstract) both worked. The router correctly directs Group D papers to Section 3.2 (PRF/symmetric notation), though this paper actually needs Section 3.3 (theory notation) more -- see issue below.

### 2.5 Appendix handling guidance was useful (Section 2.4)

The trigger "any paper where the appendix contains algorithms/pseudocode" correctly flagged Appendices A and B as must-read. The guidance "When the main body has <3 pages of construction but the appendix has 5+ algorithms, the appendix IS the specification" applies partially: the main construction (Section 4) is self-contained, but the upgrade to unbounded/arbitrary/adaptive queries (Appendix A) and the 2-server variant (Appendix B) are full additional constructions that cannot be skipped.

### 2.6 Correctness model options in the template header were helpful

The template's correctness model field lists "Conditional (requires non-adaptive queries)" and "Probabilistic" as options. This paper explicitly distinguishes non-adaptive and adaptive correctness, which maps to these options. The template was expressive enough to capture this distinction.

### 2.7 The "Papers with multiple constructions" guidance (Section 2.1) was useful

The instruction "apply Passes 2-4 to each construction" correctly models this paper's structure, which has at least 4 independent constructions (Sections 3.1, 3.2, 4, and the Appendix A upgrade) plus a 2-server variant (Appendix B).

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Group D routing to Section 3.2 (PRF/symmetric notation) was misleading

**SKILL Section 0, Step 1 and Section 3, header:** The Quick-Start Router says Group D papers should primarily use Section 3.2 (PRF/symmetric-key notation) and skip Section 3.1 (Lattice/FHE). This paper is in Group D but is an *information-theoretic* paper that uses *no PRFs, no symmetric-key cryptography, and no lattices*. The relevant notation is Section 3.3 (multi-server and theory notation), plus a substantial amount of notation that does not appear in any of Sections 3.1-3.3 (set distributions, cross-products X x Y x Z, resampling operations, parity computations, planar sets, Mutual Information Amplification, SSB hashing, SZK/CEA problems).

**Recommendation:** The router should have a conditional: "If the paper is information-theoretic (no computational assumptions), use Section 3.3 regardless of group." Alternatively, add a note to the Group D row: "Exception: IshaiShiWichs is information-theoretic -- use Section 3.3 and skip Sections 3.1, 3.2."

### 3.2 No reading path for papers with co-equal constructions AND lower bounds

**SKILL Sections 2.1-2.2:** The reading paths treat constructions (Pass 2-4) and lower bounds ("Read lower bound results, often near the end of the main body") as separate concerns, with lower bounds appearing as a subordinate afterthought in Pass 3-alt or Pass 4. But in this paper, the lower bounds (Section 5, pages 20-28) are a co-equal contribution consuming 9 pages. They introduce novel intermediate primitives (MIA, SSB hash), novel definitions ((n,t)-PIR, database-oblivious (n,t)-PIR, single-record (n,t)-PIR), and novel proof techniques (PIR -> MIA -> OWF chain; PIR -> SSB hash -> SZK barrier).

The skill does not tell you *when* to read lower bounds relative to the constructions. For this paper, reading the lower bounds after the constructions was fine, but a reader following the skill literally would have underweighted Section 5 because the skill treats lower bounds as a secondary extraction target.

**Recommendation:** Add a "Theory + Construction" composite reading path that explicitly allocates a full pass to lower bound sections when the paper's abstract indicates co-equal lower bound contributions. Something like:

> "Pass 3-alt (lower bounds): If the abstract mentions lower bounds as a primary contribution, allocate a full pass. Read formal definitions of the model being bounded (they may differ from the construction's model), the bound statement, proof technique (at intuition level), tightness analysis, and implications for computational schemes."

### 3.3 The template lacks a section for "Intermediate Primitives / Reductions" in theory papers

**SKILL Section 6 (template):** The template has "Novel Primitives / Abstractions" which is designed for cryptographic building blocks (PRFs, wpPRFs, etc.). This paper introduces *complexity-theoretic* intermediate notions:
- Mutual Information Amplification (MIA) -- a new two-party protocol primitive (Definition 2)
- Vanilla Somewhere Statistical Binding (SSB) hash function (Definition 5)
- Conditional Entropy Approximation (CEA) promise problem (Definition 6)
- The (n,t)-PIR relaxed model (Definition 1)
- Database-oblivious (n,t)-PIR (Definition 3)
- Single-record (n,t)-PIR (Definition 4)

These are not cryptographic primitives in the engineering sense -- they are theoretical constructs used in reduction chains. The "Novel Primitives" template section does not fit well because its fields ("Interface / Operations," "Standalone complexity," "Built from") assume an implementable primitive.

**Recommendation:** Add a "Reduction Chain / Proof Architecture" section for theory papers:

```
## Reduction Chain (Theory papers with lower bounds)
| Step | From | To | Key Lemma/Theorem | Intuition |
|------|------|----|-------------------|-----------|
| 1 | (n,t)-PIR with small hint+comm | (m,l)-MIA | Theorem 5.2 | PIR client = Alice, PIR server = Bob; hint is mutual info, DB chunk is shared key |
| 2 | Non-trivial MIA | OWF existence | Theorem 5.3 | MIA has noticeable false entropy => OWF by [IL89] |
| 3 | Database-oblivious (n,t)-PIR | Vanilla SSB hash | Theorem 5.5 | Replace hint with pairwise-independent hash of DB records |
| 4 | Vanilla SSB hash | Hard problem in SZK | Theorem 5.7 | SSB hash => CEA instance distinguishable from null |
```

### 3.4 Correctness analysis template (Option B) is insufficient for this paper's correctness model

**SKILL Section 6, Correctness Analysis, Option B:** The template asks for "Failure mode," "Failure probability," and "Amplification." This paper has a much more nuanced correctness story:

1. The warmup scheme (Section 4) achieves correctness probability >= 0.1 for a *single instance* (not 1 - negl(n)).
2. Amplification via omega(log n) parallel repetitions boosts to 1 - negl(n).
3. The warmup only supports bounded (sqrt(n)/10), random, distinct queries.
4. Appendix A upgrades to unbounded, arbitrary, adaptive queries via a novel permutation-based technique.
5. The paper explicitly attacks Piano [ZPSZ24] for lacking adaptive correctness (Section 1.3, page 8).

The Option B template does not have fields for "query model restrictions" (bounded vs unbounded, random vs arbitrary, distinct vs repeated, adaptive vs non-adaptive). These are first-class concerns in this paper and in the broader Group D literature.

**Recommendation:** Add to Option B:

```
| **Query model** | <Bounded Q = ... / Unbounded / Adaptive / Non-adaptive / Random-only / Arbitrary> |
| **Upgrade path** | <How the paper goes from restricted to full model, if applicable> |
| **Base correctness probability** | <e.g., >= 0.1 per instance before amplification> |
```

### 3.5 The "Complexity" table cannot represent this paper's multiple constructions with different tradeoffs

**SKILL Section 6, Complexity:** The template has a single Complexity section with "Core metrics" and "Preprocessing metrics." This paper presents at least 5 distinct constructions (Theorems 3.1, 3.2, 4.3/4.4, A.3, B.1) with fundamentally different complexity tradeoffs. The paper itself presents these in Table 1. The template's single-table format forces either picking one construction or creating an ungainly merged table.

**Recommendation:** For papers with multiple independent constructions (especially theory papers presenting a spectrum of tradeoffs), the template should explicitly support a per-construction complexity table:

```
## Complexity by Construction
### Construction 1: From 2-server Linear PIR (Theorem 3.1)
| Metric | Asymptotic | Notes |
| ... | ... | ... |

### Construction 2: From PRF-based (Theorem 3.2)
| ... | ... | ... |
```

Alternatively, the template could support reproducing the paper's own comparison table (Table 1) as a summary, with per-construction detail sections below.

### 3.6 The skill does not guide extraction of "implication results" (PIR => OWF, PIR => SZK)

**SKILL Section 6, Lower Bounds:** The template has a "Lower Bounds" section with fields for bound statement, model assumptions, proof technique, and tightness. But the *implications* of this paper's lower bounds (PIR with certain parameters implies OWF existence; database-oblivious PIR implies a hard problem in SZK) are not just lower bounds -- they are *connections between PIR and complexity theory*. The Lower Bounds template section is too narrow.

**Recommendation:** Add an "Implications / Connections" field to the Lower Bounds section:

```
| **Implications** | <e.g., "Any (n,t)-PIR with hint+comm < t(1-ct/n)-1 implies OWF" (Theorem 5.1); "Any database-oblivious PIR circumventing the lower bound implies a hard problem in SZK" (Corollary 5.8)> |
| **Barrier type** | <Information-theoretic impossibility / Computational barrier (implies crypto) / Complexity barrier (implies separation)> |
```

### 3.7 Pass 0 structure scan needs to account for theory papers' unusual section structure

**SKILL Section 2.1, Pass 0:** The instruction says to identify "section headings, page ranges, total length, appendix length." This worked, but the skill does not prepare the reader for theory papers where:
- The "construction" sections (3 and 4) are interleaved with "reduction" sections (5) and "upgrade" appendices (A, B).
- There is no "Evaluation," "Experiments," or "Performance" section at all.
- The most important table (Table 1, asymptotic comparison) appears on page 3, inside the introduction.

The Pass 0 output should flag these structural anomalies for theory papers so the reader can plan appropriately.

**Recommendation:** Add to Pass 0 for theory papers: "Note whether the paper has an asymptotic comparison table in the introduction (common in theory papers -- this serves as the equivalent of an evaluation section). Note whether appendices contain full constructions vs. just proofs."

### 3.8 The notation section misses key theory-paper concepts used in this paper

**SKILL Section 3.3:** The theory notation table is too sparse. It covers server count k, bit-string databases, communication complexity pairs, XOR, lg, and number-theoretic primitives. This paper uses several concepts not covered:

- **Cross-product set representation:** S = X x Y x Z where X, Y, Z are subsets of {0,...,m-1}
- **Succinct set descriptions:** desc(S) -- compact representation of a set via its coordinate subsets
- **Parity over cross-product sets:** parity(S) = XOR_{(x,y,z) in S} DB[x,y,z]
- **Planar sets:** {x} x Y x Z, X x {y} x Z, X x Y x {z} -- cross-sections of a 3D set
- **Resampling:** Resample(S, (x,y,z)) -- redraw set coordinates while forcing membership of a specific element
- **Streaming pass:** single sequential scan over DB, O(n) bandwidth, sublinear space
- **Piggybacking:** overlapping preprocessing of the next window with queries of the current window
- **Amortization window Q = sqrt(n)/10:** number of queries before re-preprocessing
- **Base-m representation:** id = (x,y,z) where m = n^{1/3}, so id in {0,...,m-1}^3

**Recommendation:** Add a "Group D information-theoretic notation" subsection or expand Section 3.3 with entries for cross-product sets, parity operations, streaming passes, and piggybacking.

### 3.9 The skill gives no guidance on reading correctness proofs in theory papers

**SKILL Section 2.2, Pass 4:** The instruction says "Prioritize (1) formal definitions, (2) main constructions / theorem statements, (3) proof techniques (skip mechanical details), (4) lower bounds." For this paper, the correctness proof (Section 4.5, pages 17-19) is essential because it reveals the paper's key technical insight: the probability analysis uses a novel argument about the distribution of the hint table after Q queries. The proof technique (analyzing T*_good and T*_bad hint subsets, using Proposition 4.2 to bound collision probability) is non-trivial and directly relevant to understanding why the construction works.

The skill should distinguish between "routine security proofs" (which can be skipped) and "novel correctness arguments" (which reveal the construction's core mechanism).

**Recommendation:** In Section 2.2 Pass 4 or Section 2.4, add: "For theory papers, read correctness proofs when the correctness probability is non-trivial (e.g., constant probability before amplification). The proof technique often reveals the paper's key insight about why the construction works."

### 3.10 The template's "Cryptographic Foundation" section does not fit information-theoretic papers

**SKILL Section 6, Cryptographic Foundation:** The template asks for "Hardness assumption," "Encryption/encoding scheme(s)," "Ring / Field," "Key structure," and "Correctness condition." For an information-theoretic paper:
- Hardness assumption = "None (information-theoretic)"
- Encryption/encoding = N/A
- Ring / Field = N/A (the paper works over {0,1}^n with XOR, or Z_6 in the permutation construction of Appendix A.3)
- Key structure = N/A

Four of five fields are N/A. The section feels forced for this paper type.

**Recommendation:** Add a note: "For information-theoretic papers, replace Cryptographic Foundation with a minimal 'Security Model' entry: Perfect privacy (simulation-based), no computational assumptions. State whether constructions are unconditional or conditional on a model (e.g., streaming pass, bounded queries)."

### 3.11 The "Comparison with Prior Work" template section assumes concrete benchmarks

**SKILL Section 6, Comparison with Prior Work:** The template table has columns for "Query size," "Response size," "Server time," "Throughput," "Client storage," "DB params," and "Financial cost." These are concrete performance metrics. This paper's comparisons are purely asymptotic (Table 1: Compute, Comm, Space, # servers). The template should explicitly support an asymptotic comparison table format for theory papers.

**Recommendation:** Add an asymptotic variant of the comparison table:

```
### Asymptotic Comparison (theory papers)
| Construction | Server Computation | Communication (online) | Communication (offline) | Client Space | Server Space | # Servers |
|---|---|---|---|---|---|---|
```

---

## 4. Specific Improvement Suggestions

### 4.1 Section 0 (Quick-Start Router), Step 1 table, Group D row

**Current:** "Notation focus: Section 3.2 (PRF/symmetric). Skip Section 3.1 (unless paper uses FHE)."

**Suggested:** "Notation focus: Section 3.2 (PRF/symmetric) for computational schemes. Exception: IshaiShiWichs is information-theoretic -- use Section 3.3 (theory notation). Skip Sections 3.1 and 3.2 for information-theoretic papers."

### 4.2 Section 1 (Paper Classification), Archetype table

**Add new row:**

| Archetype | Signature | Template adaptation |
|-----------|-----------|-------------------|
| **Theory (constructions + lower bounds)** | Proves new constructions AND new lower bounds/barriers as co-equal contributions. No implementation. | Full template minus Performance Benchmarks and Implementation Notes. Add Lower Bounds section with Implications/Connections. Add Reduction Chain section. Use per-construction complexity tables. |

### 4.3 Section 2.2 (Theory papers), Pass 3-alt

**Current:** "Read the asymptotic comparison table if one exists (check pages 3-8 and any 'comparison' or 'our results' subsection in the introduction)."

**Suggested addition:** "For papers with co-equal lower bound contributions, allocate a separate pass to the lower bounds section. Do not treat lower bounds as a subsidiary of Pass 4. Extract: (a) the formal model being bounded (it may be weaker/more general than the construction's model), (b) the reduction chain (intermediate primitives and their relationships), (c) tightness relative to the paper's own constructions, (d) implications for computational schemes."

### 4.4 Section 3.5b (Group D critical parameters)

**Current list** focuses on PRF-based scheme parameters (set size |S|, number of sets Q, word size w, etc.).

**Suggested addition for information-theoretic Group D papers:**
- **Database representation dimension:** d (e.g., d=3 for base-m^{1/d} representation)
- **Cross-product set expected size:** |S| = sqrt(n) (from coordinate sampling probability 1/n^{1/6} per dimension)
- **Set description size:** |desc(S)| = 3 * n^{1/6}
- **Number of planar sets per hint:** n^{1/6}
- **Amplification factor:** omega(log n) parallel repetitions
- **Amortization window Q:** sqrt(n)/10 (bounded, random, distinct) or unbounded (with Appendix A upgrade)

### 4.5 Section 7.3 (Scheme evolution), Group D paragraph

**Current:** "IshaiShiWichs (2024, information-theoretic constructions + lower bounds)."

**Suggested expansion:** "IshaiShiWichs (2024/2025, first information-theoretic single-server preprocessing PIR constructions + tight lower bounds. Proves that any scheme beating the sqrt(n) client-space/bandwidth tradeoff implies OWF, and that database-oblivious schemes circumventing this bound imply SZK-hard problems. Validates Piano's near-optimality under OWF assumption. Constructions build on Dvir-Gopi 2-server PIR [DG16] and Mughees et al. [MIR23] PRF-based constructions. Novel techniques: cross-product sets with XOR parity reconstruction, customized almost-pairwise-independent permutations for adaptive correctness, MIA as an intermediate notion connecting PIR to OWF)."

### 4.6 Section 6 (Template), Formal Definitions section

**Current:** The Formal Definitions section says "For papers that define new PIR models, variants, or compilers" and lists Model name, Syntax, Security notion, Correctness notion, Relationship to standard PIR.

**Suggested addition:** This paper defines 6 formal models/primitives (Definitions 1-6). The template should note: "For papers defining 3+ formal models, organize definitions in a table showing the hierarchy/relationships (e.g., which definition is a restriction of which). For intermediate notions used only in proofs (MIA, SSB hash, CEA), document them in the Reduction Chain section rather than Formal Definitions."

### 4.7 Section 8 (Validation checklist), Theory papers

**Current checklist item:** "Lower bounds are extracted if present."

**Suggested additions:**
- [ ] Reduction chain from lower bound to implication is documented
- [ ] Each construction is documented separately with its own complexity row
- [ ] Model definitions used in lower bounds are documented (they may differ from construction definitions)
- [ ] Tightness of lower bounds relative to upper bounds is stated
- [ ] Adaptive vs non-adaptive correctness distinction is noted if the paper discusses it

---

## 5. New Patterns or Template Sections the Skill Should Add

### 5.1 "Adaptive vs Non-Adaptive Correctness" as a first-class distinction

This paper makes a major contribution by:
1. Demonstrating an explicit adaptive correctness attack on Piano (Section 1.3)
2. Defining adaptive correctness formally (Section 2, page 9)
3. Constructing a scheme achieving adaptive correctness (Appendix A)

The SKILL template's correctness model field mentions "adaptive/non-adaptive" in parentheses but does not explain the distinction or flag it as important for Group D papers. For Group D specifically, adaptive correctness is a major differentiator: Piano, RMS24, and Ghoshal et al. [GZS24a] only achieve non-adaptive correctness. This should be highlighted in the Group D routing notes.

### 5.2 "Streaming Preprocessing" as a key property to extract

Multiple Group D papers feature streaming preprocessing (single sequential pass over the database, sublinear working memory). This paper makes streaming preprocessing a central design feature of all its constructions. The template's Protocol Phases table has a "Client-Independent?" column but no "Streaming?" column or field. Add:

```
| **Preprocessing model** | <Streaming (single pass, O(n^{2/3}) working memory) / Random-access / Interactive / One-round> |
```

### 5.3 "Piggybacking" as a recognized pattern

The paper uses "piggybacking" -- overlapping the preprocessing of the next query window with the current window's queries -- as a fundamental technique. This is also used in Piano and Mughees et al. [MIR23]. The skill should add this to the building blocks table (Section 7.5):

```
| Piggybacking / amortized preprocessing | IshaiShiWichs, Piano, MIR23 | Client performs next-window preprocessing during current-window queries; amortizes O(n) preprocessing over Q = sqrt(n) queries |
```

### 5.4 Template section: "Connections to Complexity Theory" (for theory papers)

This paper proves connections between PIR and complexity theory (OWF existence, SZK hardness). The template has no section for this. Add:

```
## Connections to Complexity Theory (if applicable)
- **PIR => OWF:** <statement and conditions>
- **PIR => SZK:** <statement and conditions>
- **ORAM connections:** <if any>
- **Barrier results:** <what cannot be achieved without strong assumptions>
```

### 5.5 The comparison table (Table 1) format is worth standardizing for information-theoretic papers

This paper's Table 1 has columns: Scheme, Compute, Comm, Space (client/server), # servers. This is a clean format that recurs across information-theoretic PIR theory papers. The skill should provide this as a template for the "Asymptotic Comparison" table in theory papers, distinct from the concrete-benchmark comparison table used for construction papers.

---

## 6. Summary Assessment

**Overall, SKILL.v0.md was moderately helpful for this paper.** The archetype classification, Pass 1 extended reading strategy, and appendix handling guidance all worked well. The scheme name warning was valuable.

**The main gaps are:**
1. The Group D routing assumes PRF/symmetric-key notation, which is wrong for this information-theoretic paper.
2. The reading path does not adequately handle papers with co-equal construction and lower-bound contributions.
3. The template lacks support for theory-paper-specific structures: reduction chains, multiple-construction complexity tables, asymptotic comparison tables, connections to complexity theory, and adaptive vs non-adaptive correctness as a first-class distinction.
4. The notation sections (3.1-3.3) do not cover the combinatorial/set-theoretic notation central to this paper (cross-product sets, parity, planar sets, resampling, base-m representation).

**Effort estimate:** Approximately 40% of the paper's content (the combinatorial construction in Section 4, the lower bound proof machinery in Section 5, and the adaptive correctness upgrade in Appendix A) falls outside what the skill's current notation sections and template can cleanly capture. An agent following the skill would produce notes that are structurally correct (right archetype, right reading order) but would struggle with the template -- many sections would be N/A or require awkward adaptation, and the most important contributions (the reduction chain PIR -> MIA -> OWF, and the SZK barrier) have no natural home in the template.
