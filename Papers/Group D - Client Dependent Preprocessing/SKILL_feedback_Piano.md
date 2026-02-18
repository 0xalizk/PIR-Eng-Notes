# SKILL.v0.md Feedback -- Piano Paper Evaluation

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Piano: Extremely Simple, Single-Server PIR with Sublinear Server Computation |
| **Authors** | Mingxun Zhou, Andrew Park, Elaine Shi, Wenting Zheng |
| **Year** | 2023 (revised for IEEE S&P 2024) |
| **ePrint** | 2023/452 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | Construction (primary) |
| **Total pages** | 27 (16 main body + 11 appendix) |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Group routing (Section 0, Step 1) -- Excellent

The Group D routing instructions at Section 0 were immediately helpful. The skill correctly directed me to:
- Focus on Section 3.2 (PRF/symmetric-key notation) instead of Section 3.1 (Lattice/FHE) -- Piano uses only PRFs and PRPs, no FHE at all.
- Use Section 3.5b for Group D-specific critical parameters.
- Skip Sections 3.1, 3.3 entirely.

This saved significant time. The paper has zero FHE content, so skipping Section 3.1 was exactly correct.

### 2.2 Archetype classification (Section 1) -- Correct and clear

Piano clearly matches the "Construction" archetype: it proposes a new PIR scheme with algorithms, proofs, and benchmarks. The signature "Proposes a new PIR scheme with algorithms and benchmarks" is an exact match. No ambiguity here.

However, Piano also has a secondary archetype -- it could reasonably be classified as a multi-archetype paper: **Construction + Model/definition** because Appendix B defines a dynamic (key-value) PIR variant with a formal syntax (Init, Query, Insert, Update, Delete) and a hierarchical data structure construction. The skill's multi-archetype composition rules (Section 1, "Multi-archetype papers") do mention this possibility, and rule 1 correctly says to use the Construction template as base since the paper has benchmarks.

### 2.3 PRF/symmetric-key notation table (Section 3.2) -- Highly relevant

The notation table in Section 3.2 was directly applicable to Piano. Specifically:
- **PRF keys** (sk, msk): Piano uses `sk_i` for primary table PRF keys and `sk_bar_{j,k}` for backup keys, plus a master key `msk` with tag-based evaluation -- all matching the table's entries.
- **PRP** (`pi_sk(i)`): Piano uses PRP for load balancing to convert arbitrary queries to random queries (page 5) -- exactly as described in the table.
- **Parity / XOR** (`p = XOR_{i in S} DB[i]`): This is the core operation in Piano.
- **Statistical security kappa**: Piano uses `kappa` = 40 for statistical security and `lambda` = 128 for computational security, precisely matching the table's distinction.
- **Chunk function** (`chunk(i) = floor(i/sqrt(n))`): Piano defines `chunk(i) = floor(i/sqrt(n))` on page 7 -- the skill's table has this exact notation.
- **Partition-based hints** (`S_j, h_j`): Piano's primary table entries are `(S, p)` pairs with precomputed parities, matching this row.

### 2.4 Pass 0 structure scan (Section 2.1) -- Effective

Reading pages 1-2 for a structure scan was useful. From these two pages I could identify:
- Section structure: 1 Introduction (p.1-3), 2 Main Construction (p.3-6), 3 Formal Definitions and Security Proofs (p.7-9), 4 Evaluation (p.10-13), 5 Additional Related Work (p.13-16), 6 Limitations and Suitable Use Cases (p.16), 7 Conclusion (p.16), plus Appendices A-C (p.20-27).
- Total length: 27 pages (16 main body + 11 appendix).
- The paper's "Note" footer on page 1 flagging that this is a major revision of the conference version was valuable context.

### 2.5 Reading evaluation before core scheme (Section 2.1, Pass 3 before Pass 4) -- Useful

The skill's instruction to read the evaluation (Section 4, pages 10-13) before the core construction deep-dive was genuinely helpful for Piano. Knowing the concrete numbers (73ms at 100GB, 150x speedup over SimplePIR, 800 LOC in Go) before reading the formal protocol description on pages 3-9 gave me anchoring metrics. I knew what performance the construction was achieving, which made the design choices (chunking, backup tables, PRP for load balancing) more interpretable.

### 2.6 Correctness analysis Option B (Section 6, template) -- Well-suited

The "Option B: Probabilistic Correctness Analysis" template was the correct choice for Piano. The failure modes (queried index not covered by any set; running out of backup entries) exactly match Piano's two failure events described in Theorem 3.3 (page 8-9) and the full proof in Appendix C.3 (pages 26-27). The template fields for failure probability, proof technique (union bound + Chernoff bound), and key parameters affecting correctness were all directly applicable.

### 2.7 Section 7 domain knowledge (Section 7.3) -- Accurate lineage

The skill's lineage description in Section 7.3 ("Sublinear server" paragraph) correctly places Piano:
- "CK20 (2019, first sublinear-server cPIR...) -> Piano (2023, PRF-only, first practical sublinear)"
- This matches the paper's own positioning (pages 2-3, 13-14).
- The skill correctly notes Piano is "PRF-only" -- the paper emphasizes this as its key differentiator.

### 2.8 Complexity notation (Section 3.4) -- Critical for this paper

The `O_lambda()` and `O_tilde()` notation explanations were essential. Piano uses both extensively:
- `O_tilde(sqrt(n))` hiding polylog factors (defined in footnote 1, page 2).
- `O_lambda(sqrt(n))` hiding poly(lambda) factors.
The skill's warning "Always note whether asymptotic expressions hide poly(lambda) or polylog factors" was directly relevant -- Piano's Theorem 3.4 (page 9) uses both simultaneously.

### 2.9 Appendix handling (Section 2.4) -- Appropriate trigger

The appendix trigger ("Any paper with 5+ pages of appendices") correctly fired: Piano has 11 pages of appendices. The guidance to always read pseudocode/algorithms was relevant (Appendix A has the variant scheme with Figure 3's algorithm). The guidance to read extensions that introduce new constructions was critical -- Appendix B's dynamic database extension is a substantial contribution.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Pass 2 ("Background + Building Blocks") is nearly empty for PRF-only papers

**Problem:** The skill's Pass 2 (Section 2.1) says to read "background/preliminaries/related-work section through start of core construction" and extract "Notation definitions, cryptographic building blocks, PIR definition used, novel sub-protocols." For Piano, there is no standalone Preliminaries or Background section. The paper goes directly from Introduction (Section 1) to Main Construction (Section 2). The formal definitions appear later in Section 3.1. The related work is in Section 5 (pages 13-16).

**Impact:** Pass 2 produced almost nothing. The construction IS the building blocks for PRF-only papers -- there's no separate "preliminaries" section because the only primitive is a PRF, which needs no introduction.

**Suggestion:** Add a note under Section 2.1 or create a Group D-specific reading path adaptation: "For PRF-only Group D papers (Piano, RMS24, WangRen), Pass 2 may be empty or very short. The paper may not have a separate Preliminaries section because its only cryptographic building block (PRF) is standard. In this case, merge Pass 2 into Pass 1 (the introduction often contains the technical overview) and proceed to Pass 3."

### 3.2 The reading order doesn't account for "incremental presentation" papers

**Problem:** Piano uses a distinctive pedagogical structure that the skill doesn't address. The construction is presented incrementally across pages 3-6:
1. First: single query (page 4)
2. Then: multiple distinct queries (page 5)
3. Then: arbitrary queries via PRP (page 5)
4. Then: unbounded queries via pipelining (page 5)
5. Finally: full formal protocol in Figure 1 (page 6)

The skill's Pass 4 says "Read remaining construction/protocol sections" but doesn't advise how to handle this incremental build-up style. I found myself naturally reading linearly through pages 3-6, which worked well, but the skill gave no guidance on this.

**Suggestion:** Add to Section 2.1, Pass 4: "Some papers (especially in Group D) present constructions incrementally -- first a simplified 'toy' version, then progressively adding features (multiple queries, arbitrary queries, unbounded queries). Read these in order; each layer builds on the previous. The final complete protocol (often in a figure/box) is the authoritative specification, but the incremental steps explain WHY each component exists."

### 3.3 Missing guidance on "streaming preprocessing" as a key design pattern

**Problem:** Piano's offline phase is a streaming single-pass scan over the database (page 4: "a streaming algorithm which makes a single linear scan over the database, while consuming only O_tilde(sqrt(n)) local storage"). This is a critical engineering feature -- the client never needs to hold more than one chunk in memory. The skill mentions "streaming" once in Section 5 ("Note whether offline phase is streaming (single pass over DB) or random-access") but provides no template section to document it and no guidance on what to extract about it.

**Suggestion:** In Section 3.5b (Group D critical parameters), add:
- **Preprocessing model**: streaming (single-pass) / random-access / multi-pass
- **Client memory during preprocessing**: peak memory required during offline phase (distinct from persistent client storage)
- **Parallelizability of preprocessing**: single-threaded / multi-threaded / distributed

These are engineering-critical distinctions. Piano's streaming property means the client's memory usage during preprocessing is O(sqrt(n)), not O(n), which is a major practical advantage.

### 3.4 The template's "Cryptographic Foundation" table is awkward for PRF-only schemes

**Problem:** The template (Section 6) says: "For PRF-only schemes, simplify: list the minimal assumption (OWF), PRF instantiation (AES-128), and key sizes." This is helpful but the full table format with rows for "Ring / Field", "Encryption/encoding scheme(s)", "Correctness condition" feels forced for Piano. The paper's security relies on OWF (any PRF), and the implementation uses AES-128 with AES-NI. There is no ring, no encryption scheme, and the correctness condition is probabilistic (not a noise bound).

**Suggestion:** Provide an explicit alternative table for PRF-only schemes:

```
| Layer | Detail |
|-------|--------|
| **Hardness assumption** | OWF (any secure PRF suffices) |
| **PRF instantiation** | AES-128 via AES-NI |
| **Key structure** | Master key msk (lambda bits) + per-hint tags (32 bits each) |
| **PRP instantiation** | <if applicable> |
| **Correctness model** | Probabilistic: Pr[fail] <= negl(kappa) + negl(lambda) |
| **Key parameters** | kappa = 40 (statistical), lambda = 128 (computational) |
```

### 3.5 No guidance on the "pipelining" / amortization trick

**Problem:** Piano's key trick for supporting unbounded queries is a pipelining technique (page 5): "during the current window of Q queries, we run the preprocessing phase of the next Q queries." The client maintains two sets of hints -- one active, one being prepared. This doubles client storage but removes the query limit. The skill's template has an "Amortization window Q" field in Section 3.5b, but there's no guidance on documenting the pipelining mechanism itself, which is distinct from the amortization window.

**Suggestion:** Add to Section 3.5b:
- **Hint refresh mechanism**: pipelining (concurrent preprocessing) / re-download / incremental update
- **Storage multiplier from pipelining**: e.g., 2x for Piano's dual-hint approach

### 3.6 Appendix B (dynamic databases) deserves template support

**Problem:** Piano's Appendix B presents a full dynamic database extension using hierarchical data structures (Bentley-Saxe technique). This includes a formal syntax (Init, Query, Insert, Update, Delete), a construction, and a performance analysis. The skill's template has a "Deployment Considerations" section with "Database updates" but this is a single bullet point, inadequate for a full dynamic extension with its own complexity analysis (amortized O_lambda(log n) communication per update, O(log n) server computation per update).

The skill's "Update/maintenance" archetype (Section 1) is close but treats update support as the paper's primary contribution, whereas for Piano it's a secondary extension in the appendix.

**Suggestion:** Add guidance for papers that include dynamic extensions as secondary contributions: "When a Construction paper includes a dynamic/update extension in an appendix, document it in a dedicated subsection under 'Variants' or as a separate 'Extensions' section. Extract: (1) the update syntax, (2) the data structure used (e.g., hierarchical/log-structured), (3) amortized update costs, (4) whether it supports Insert/Delete/Modify, (5) the overhead relative to the static scheme."

### 3.7 The "Comparison with Prior Work" table needs Group D-specific guidance

**Problem:** The template's comparison table (Section 6) lists metrics like "Query size, Response size, Server time, Throughput, Client storage." For Piano, the comparison is fundamentally different from Group A/B/C papers. Piano's Table 3 (page 14) compares along dimensions of Assumption, Communication, Per-query time, and Extra space -- and the comparators include theoretical schemes (CK20, CHK22) alongside practical ones (SimplePIR, XPIR). The skill's template doesn't distinguish between theoretical and practical comparators, or between asymptotic and concrete comparison tables.

**Suggestion:** Add a note: "For Group D papers, separate the comparison into: (1) an asymptotic table comparing against theoretical schemes (showing assumption, asymptotic communication, per-query time, extra space), and (2) a concrete benchmark table comparing against practical implementations. These serve different purposes: the asymptotic table shows theoretical positioning; the concrete table shows practical viability."

### 3.8 Missing guidance on extracting the paper's own lower bound matching claims

**Problem:** Piano claims to match the CHK22 lower bound (ST = Omega(n)) up to polylogarithmic factors. This is a significant theoretical contribution (page 3: "Our scheme matches this lower bound up to poly-logarithmic factors"). The skill has a "Lower Bounds" template section but it's focused on papers that prove new lower bounds. There's no guidance for papers that claim to match existing lower bounds.

**Suggestion:** In the "Lower Bounds" section, add: "If the paper does not prove a new lower bound but claims to match or approach an existing one, record: (1) the referenced lower bound and its source, (2) the gap (if any) between the paper's construction and the bound, (3) which parameters/metrics achieve tightness and which don't."

### 3.9 The skill doesn't guide extraction of the "Note" footers

**Problem:** Piano has two important "Note" footers on page 1: one stating this is a major revision of the conference version, and another updating experimental results. The skill's Section 8 ("Robustness Guidelines") mentions "Remark / Note / Observation blocks" but focuses on in-text blocks, not footnote-style revision notes at the bottom of the first page. These revision notes are critical metadata -- they tell you this ePrint version differs substantially from the original.

**Suggestion:** Add to Section 8: "Check for revision notes on page 1 (often in footnotes or a note block). These indicate whether the paper has been substantially revised from an earlier version. Record the venue of the final version and any significant changes mentioned."

### 3.10 Variant documentation for Appendix A's alternative scheme

**Problem:** Piano's Appendix A presents a variant with different tradeoffs (less storage but more online communication -- sends an offset vector instead of a full set). The Variants table in the template accommodates this, but the skill gives no guidance on how thoroughly to read appendix variants. Section 2.4 says to read "sections that introduce NEW constructions or alternative protocol variants" but doesn't say whether to apply the full Pass 2-4 treatment or just extract key differences.

**Suggestion:** Add to Section 2.4: "For appendix variants of the main construction, extract: (1) what changed relative to the main scheme (typically one protocol phase), (2) the tradeoff (e.g., less storage vs. more communication), (3) asymptotic complexity differences. Do NOT apply full Pass 2-4 unless the variant uses fundamentally different techniques."

---

## 4. Specific Improvement Suggestions (with concrete wording)

### 4.1 Add to Section 0, Step 1 (Group D row)

Current text: "PRF-first; use Section 3.5b for Group D parameters"

Suggested addition: "PRF-first; use Section 3.5b for Group D parameters. Note: many Group D papers lack a Preliminaries section -- merge Pass 2 into Pass 1 if no separate background section exists."

### 4.2 Add to Section 2.1, Pass 4

Current text: "Remaining construction/protocol sections"

Suggested addition after the pass table: "**Incremental construction style:** Some papers (common in Group D, e.g., Piano) present constructions incrementally: a toy single-query version, then extensions for multiple queries, arbitrary queries, and unbounded queries. Read these layers in order -- each explains one design decision. The final boxed protocol figure is the authoritative specification."

### 4.3 Add to Section 3.2 (PRF/symmetric-key notation)

Add new row to the table:

| Symbol class | Convention | Examples & context |
|-------------|-----------|-------------------|
| Master PRF with tags | PRF(msk, tag_i \|\| j) | Compact key representation: one master key + short per-hint tags instead of independent per-hint keys. Piano uses 32-bit tags for 30% storage savings. |

### 4.4 Add to Section 3.5b (Group D critical parameters)

Add these parameters:
- **Preprocessing model** -- streaming (single-pass) / random-access / multi-pass. Determines peak client memory during offline phase.
- **Client peak memory during preprocessing** -- distinct from persistent client storage (e.g., Piano: O(sqrt(n)) during preprocessing vs O_lambda(sqrt(n)) persistent)
- **Hint refresh mechanism** -- pipelining / re-download / incremental. Determines how unbounded queries are supported.
- **Hint consumption model** -- consumable (each hint used once, then replaced) / reusable / mixed

### 4.5 Expand Section 6 template -- add Extensions section

After "Variants (if applicable)" add:

```
## Extensions (if applicable)
_For papers that include secondary constructions in appendices (e.g., dynamic DB support, keyword PIR, batch PIR)._

| Extension | Location | Technique | Key Overhead vs Base | Supported Operations |
|-----------|----------|-----------|---------------------|---------------------|
```

### 4.6 Add to Section 8 (Validation checklist), under "Preprocessing schemes"

Add:
- [ ] Preprocessing model is stated (streaming vs random-access)
- [ ] Hint refresh mechanism is documented
- [ ] Peak client memory during preprocessing is distinguished from persistent storage

---

## 5. New Patterns or Template Sections to Add

### 5.1 Pattern: "Self-contained OWF-only construction"

Piano introduces a significant pattern in the PIR landscape: a construction that uses only OWF (one-way functions) as its cryptographic assumption, with no FHE, no lattice problems, and no heavy-weight primitives. The skill should recognize this as a design pattern because it has engineering implications:
- Implementation is dramatically simpler (~800 LOC vs. thousands for FHE-based schemes)
- No dependency on FHE libraries (SEAL, OpenFHE, etc.)
- Performance is determined by PRF evaluation speed (AES-NI) and memory access patterns, not by polynomial arithmetic
- Security analysis is simpler (simulation-based, using PRF pseudorandomness)

**Suggestion:** Add to Section 7.2 or 7.5 a note: "OWF-only constructions (Piano, Plinko, WangRen) use only standard symmetric-key primitives. Their performance profiles differ fundamentally from FHE-based schemes: bottleneck is memory access patterns and PRF evaluation speed, not polynomial arithmetic or noise management."

### 5.2 Pattern: Dual security parameters (kappa and lambda)

Piano uses two separate security parameters: kappa (statistical, = 40) for probabilistic correctness and lambda (computational, = 128) for PRF security. The skill mentions this in Section 3.2 and Section 7.6, but the template's "Security model" field doesn't have a standard way to record both. The correctness probability is 1 - negl(lambda) - negl(kappa), which couples both parameters.

**Suggestion:** In the header table of the template, split or expand the security parameter fields:

```
| **Computational security** | lambda = 128 (PRF security) |
| **Statistical security** | kappa = 40 (correctness) |
| **Failure probability** | 1 - negl(lambda) - negl(kappa), matching SimplePIR's 2^{-40} |
```

### 5.3 Pattern: Concrete parameter choices driven by super-constant function

Piano's complexity involves alpha(kappa), defined as "any super-constant function, i.e., alpha(kappa) = omega(1)." In the implementation, they set Q = sqrt(n) * ln(n), which implicitly fixes alpha. The relationship between the theoretical alpha(kappa) and the concrete parameter choices is subtle and important for reproducibility. The skill should guide extraction of how theoretical parameters are instantiated in practice.

**Suggestion:** Add to Section 3.5b or Section 4: "For Group D schemes with super-constant or slowly-growing functions in their complexity (e.g., alpha(kappa) = omega(1) in Piano), record: (1) the theoretical definition, (2) the concrete instantiation used in benchmarks, (3) how it affects the amortization window Q."

### 5.4 Template section: "Comparison to Non-Private Baseline"

Piano explicitly compares against a non-private database access baseline (Table 2, page 12). For a 100GB database, Piano has only 1.2x overhead vs. the non-private baseline (72.6ms vs 61.0ms). This is a striking result that demonstrates practical viability but has no dedicated place in the template.

**Suggestion:** Add to the "Comparison with Prior Work" section: "If the paper compares to a non-private baseline, record the overhead factor (e.g., 1.2x for Piano at 100GB). This is the most intuitive measure of practical viability for non-specialists."

### 5.5 Missing from the building blocks table (Section 7.5)

The skill's building blocks table (Section 7.5) lists "PRP (Pseudorandom Permutation)" with Piano as a user. However, it should also list:
- **Cuckoo hashing** used by Piano in Appendix B.1 for keyword PIR support (the table lists it only for SealPIR and Respire)
- **Hierarchical data structures (Bentley-Saxe)** used by Piano in Appendix B.2 for dynamic database support -- this technique is not in the building blocks table at all

**Suggestion:** Add to Section 7.5:

| Primitive | Used by | Role |
|-----------|---------|------|
| Hierarchical data structures (Bentley-Saxe) | Piano, IncPIR, Checklist | Log-structured merge for dynamic database support |

---

## 6. Overall Assessment

SKILL.v0.md performed well for Piano. The Group D routing, PRF notation tables, and probabilistic correctness template were all well-suited. The main gaps are:

1. **Structural**: The 5-pass reading order assumes a Preliminaries section exists. PRF-only papers often skip this, going straight from Introduction to Construction. The skill should handle this gracefully.

2. **Engineering detail**: The skill captures asymptotic complexity and benchmark numbers well but misses several engineering-critical distinctions for Group D papers: streaming vs. random-access preprocessing, peak memory during preprocessing, hint consumption/refresh models, and pipelining for unbounded queries.

3. **Incremental presentation style**: Piano builds its construction layer-by-layer (single query -> multiple -> arbitrary -> unbounded). This pedagogical structure is common in Group D papers and the skill should recognize it as a pattern.

4. **Extensions in appendices**: The skill handles "main body" variants but lacks guidance for substantial appendix extensions (dynamic databases, keyword PIR) that represent secondary contributions.

5. **Non-private baselines**: Piano's most striking result (1.2x overhead vs. non-private) has no template home. This metric is arguably the most important for practical adoption arguments.

The skill's strongest aspect for this paper was the notation table in Section 3.2 -- nearly every symbol class matched Piano's usage. The weakest aspect was the implicit assumption that all papers have a substantial "Background/Preliminaries" section requiring a dedicated reading pass.
