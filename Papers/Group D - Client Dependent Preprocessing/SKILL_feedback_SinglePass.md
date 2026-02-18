# SKILL.v0.md Feedback -- SinglePass Paper

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Single Pass Client-Preprocessing Private Information Retrieval |
| **Authors** | Arthur Lazzaretti, Charalampos Papamanthou |
| **Year** | 2024 |
| **ePrint** | 2024/303 |
| **Filename** | `SinglePass_2024_303.pdf` |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | **Construction + Update/maintenance** (dual archetype) |
| **Pages** | 21 (13 main body + 8 appendix) |

### Archetype rationale

The paper proposes a new PIR construction (the single-pass preprocessing scheme in Figure 3) with full implementation and benchmarks (Section 4), qualifying as **Construction**. It also devotes a substantial section (Section 5, pages 11-13) and separate benchmarks (Section 6, pages 13-14, Figures 7, 10) to O(1) update algorithms (Edit, Add in Figure 6), qualifying as **Update/maintenance**. The SKILL's multi-archetype composition rules (Section 1, "Composition rules") correctly predict that the full Construction template should be used as the base with Update/maintenance template adaptations stacked on top.

---

## 2. What SKILL.v0.md Got Right

### 2.1 Quick-Start Router (Section 0) -- Effective

The three-step router worked well:
- **Step 1 (Group identification):** The directory path immediately told me this is Group D. The instruction to focus on Section 3.2 (PRF/symmetric notation) and skip Section 3.1 (Lattice/FHE) was correct -- SinglePass uses no FHE at all.
- **Step 2 (Archetype classification):** The archetype table signatures were accurate. "Proposes a new PIR scheme with algorithms and benchmarks" matched Construction, and the Update/maintenance archetype signature (though less explicit) was identifiable from the abstract's mention of O(1) updates.
- **Step 3 (Quick Start checklist):** The 8-step procedure was a clean, actionable checklist. Reading pages 1-2 for Pass 0 was the right scope for this paper.

### 2.2 Reading Order (Section 2.1) -- Mostly Correct

The default Construction reading order (Pass 0 through Pass 4) was appropriate for this paper's structure:

- **Pass 0 (pages 1-2):** Successfully identified the section structure: Section 1 (Introduction, pp. 1-4), Section 2 (Model and Definitions, pp. 4-6), Section 3 (Core Scheme, pp. 6-9), Section 4 (Static Benchmarks, pp. 10-12), Section 5 (Dynamic Databases, pp. 11-13), Section 6 (Dynamic Benchmarks, pp. 13-14), Section 7 (Next Steps, p. 13), plus Appendices A-C.
- **Pass 1 (Intro):** The introduction (pages 1-3) contained a clear toy protocol walkthrough (Section 1.2 "Intuition") with visual diagrams, which the SKILL correctly flags as important for theory papers (Section 2.2) but does NOT flag for Construction papers. This was a gap (see Section 3.2 below).
- **Pass 2 (Background):** Sections 2.1-2.2 (pages 4-6) contained formal definitions and the Fisher-Yates shuffle primitive, matching the SKILL's expected location.
- **Pass 3 (Evaluation):** Sections 4 and 6 (pages 10-14) were located by heading, as the SKILL recommends ("Locate by section title"). This worked perfectly.
- **Pass 4 (Core scheme):** Section 3 (pages 6-9) contained the formal scheme (Figure 3) and security proof via the Show and Shuffle game.

### 2.3 Group D Notation (Section 3.2) -- Relevant

Several entries from the Section 3.2 PRF/symmetric notation table were directly applicable:

| SKILL Entry | Relevance to SinglePass |
|-------------|------------------------|
| Parity / XOR: `p = XOR_{i in S} DB[i]` | Directly used: `h_j = XOR_{i in [Q]} DB_i[p_i(j)]` (Figure 3) |
| Fisher-Yates shuffle / random permutations | Correctly listed in Section 3.2 as used by SinglePass |
| Statistical security kappa | NOT used by SinglePass -- correctness is deterministic, not probabilistic |

### 2.4 Section 3.5b (Group D Critical Parameters) -- Useful

The checklist of Group D parameters to record was helpful:
- **Set size |S|:** In SinglePass, the "set" is a full permutation of [N/Q], so |S| = N/Q = m.
- **Number of sets Q:** Q is the tunable parameter controlling the space-time tradeoff.
- **Word size w:** Used throughout (512, 1024, 2048 bytes in benchmarks).
- **Streaming memory:** The SKILL specifically lists this for "single-pass preprocessing schemes," which directly applies.
- **Update cost:** O(1) per edit, O(1) amortized per addition.
- **Amortization window Q:** Q queries before re-preprocessing (unbounded if using the full permutation representation).

### 2.5 Chart-Only Evaluation Guidance (Section 4.5) -- Critical

SinglePass presents almost ALL benchmarks as charts (Figures 4, 5, 7, 9, 10) with only one small table (Table 2, page 15). The SKILL's guidance on chart-heavy papers was directly applicable: "Extract axis labels, compared schemes, and values for the paper's scheme to +/-10%. Mark as 'approximate.' Synthesize key comparisons into a markdown table." Without this guidance, an agent might miss that the paper's evaluation is almost entirely chart-based.

### 2.6 Multi-Server Guidance (Section 7.1) -- Correctly Flags SinglePass

Section 7.1 correctly identifies SinglePass as a two-server scheme, and Section 7.3 accurately describes it as "2-server, single-pass streaming preprocessing, permutation-based -- NOT PRF-based." This is a useful distinction because the paper explicitly avoids PRFs for its core construction (though PRGs are used for seed compression of permutations).

### 2.7 Update/Maintenance Template (Section 6, Update Metrics) -- Appropriate

The Update metrics sub-table in the Complexity section was appropriate for this paper's contribution:
- Cost per DB update: O(1) for edits
- Communication per update: constant
- Supported mutation types: Edit, Delete (as edit to zero), Add
- The template prompted me to look for these, which I might not have otherwise extracted systematically.

### 2.8 Validation Checklist (Section 8) -- Effective

The checklist items for "Preprocessing schemes" (amortization window stated, client storage recorded) and "Update/maintenance papers" (update metrics filled, composability documented) were directly relevant.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Correctness Model -- Misleading for This Paper

**Problem:** The SKILL's Correctness Analysis section (Section 6, "Correctness Analysis") offers three options: (A) FHE Noise Analysis, (B) Probabilistic Correctness Analysis, (C) No Correctness Analysis. For SinglePass, the correct answer is **(C) -- deterministic correctness**, because the scheme always correctly reconstructs DB[x] (the XOR cancellation is exact). However, the SKILL's guidance for Group D papers in the Quick-Start Router (Section 0, Step 1) says to use Section 3.2 (PRF/symmetric), and Section 3.2's notation table includes entries like "Statistical security kappa," "Failure probability," and "Hypergeometric distribution" that all presuppose probabilistic correctness. An agent following the Group D routing might spend time looking for failure probabilities that do not exist.

**Suggested fix:** Add a note to Section 3.5b or Section 0's Group D row: "Not all Group D schemes have probabilistic correctness. Permutation-based schemes (e.g., SinglePass) may have deterministic correctness (every index is covered by exactly one permutation per chunk). Check Definition 2.2 or equivalent in the paper."

### 3.2 Toy Protocol / Intuition Section -- Not Flagged for Construction Papers

**Problem:** Section 2.1 (Construction reading path) says Pass 1 should extract the "toy protocol if present," but this guidance is buried in the Pass 1 extraction column without emphasis. For SinglePass, Section 1.2 ("Intuition," pages 3-4) is arguably the single most important section for understanding the scheme -- it contains a complete worked example with visual diagrams (N=16, Q=4) that makes the formal scheme (Figure 3) much easier to parse. The SKILL emphasizes toy protocols for Theory papers (Section 2.2: "the toy protocol is typically the most accessible description. Use it as a standalone mini-construction") but does not give similar emphasis for Construction papers.

**Suggested fix:** In Section 2.1 Pass 1, add explicit guidance: "For Construction papers with a 'Technical Overview,' 'Our Techniques,' or 'Intuition' subsection in the Introduction, read it carefully -- it often contains a simplified worked example that is the best entry point to the formal construction. Extract this example as a standalone mini-walkthrough in the notes."

### 3.3 Two-Server Protocol Phase Documentation -- Incomplete Guidance

**Problem:** The Protocol Phases table template (Section 6) has a "Server" column and says "For multi-server schemes, label each server's role." However, SinglePass has a nuanced two-server structure where:
- Server 0 runs the preprocessing (Hint algorithm) and receives the S_refresh query
- Server 1 receives the S_query query and returns the elements needed for reconstruction
- The two servers see DIFFERENT information and privacy is argued separately for each

The SKILL's template does not provide enough guidance on how to document this split. The Answer algorithm is the same for both servers (just look up elements by index), but the queries sent to each server are semantically different (S_refresh vs. S_query). The template row structure encourages listing Answer once, which loses this important distinction.

**Suggested fix:** Add to Section 5 (Figure and Algorithm Interpretation, Protocol flow diagrams): "For two-server schemes where each server receives a different query, document the Query phase as producing two distinct queries (q_0, q_1) and show separate Answer rows for each server. Note what information each server sees and what privacy game covers it."

### 3.4 Show and Shuffle Game -- Novel Proof Technique Not Anticipated

**Problem:** The paper's central proof technique is the "Show and Shuffle" game (Section 3.1, Figure 2), which is a novel security abstraction. This is not a standard technique in the SKILL's building blocks table (Section 7.5) or elsewhere. The SKILL has no guidance on how to handle novel proof abstractions that are not cryptographic primitives per se but are reusable proof techniques. The closest category is "Novel Primitives / Abstractions" in the template, but Show and Shuffle is not a cryptographic primitive -- it is a proof game.

**Suggested fix:** Add a template subsection or note: "For papers that introduce novel proof games, security experiments, or reduction frameworks (not cryptographic primitives), document them under a 'Novel Proof Techniques' subsection. Extract: (1) the game/experiment name, (2) public parameters, (3) adversary's interface, (4) winning condition, (5) the proven bound, (6) how it connects to the scheme's security. These techniques may be reusable across schemes."

### 3.5 "Session-Based" PIR -- Missing Deployment Model

**Problem:** SinglePass introduces the concept of "session-based" PIR, where a client preprocesses on demand, issues a small number of queries, and then deletes its state. This deployment model is explicitly contrasted with the "persistent storage" model used by Checklist and other prior work. The SKILL's Deployment Considerations section (Section 6) has "Session model: persistent client / ephemeral client / session-based" but does not define what "session-based" means or why it matters. SinglePass is the paper that defines this model, and the SKILL should explain it.

**Suggested fix:** In Section 7.2 or a new Section 7.8, add: "Session-based PIR: A deployment model where the client preprocesses on-demand (at session start), issues a bounded number of queries within the session, and discards all state at session end. Key advantage: preprocessing cost is amortized only over the session's queries, so fast preprocessing is critical. SinglePass is the canonical example. Contrast with persistent-state models (Checklist, Piano) where preprocessing is amortized over a long lifetime."

### 3.6 Benchmark Normalization -- Group D Canonical Point Does Not Match

**Problem:** Section 7.4 says "For Group D sublinear schemes, compare at 1 GB and 100 GB." SinglePass benchmarks use databases of up to ~2 million elements with word sizes of 512-2048 bytes (max ~4 GB), but the primary comparison point is 1 million 512-byte elements (~512 MB) for the static case and 3 million 32-byte elements (~96 MB) for the updatable case (Table 2). Neither 1 GB nor 100 GB is a natural comparison point for this paper. The SKILL's guidance is calibrated for Piano/Plinko-scale benchmarks and does not fit SinglePass's target regime.

**Suggested fix:** Soften the Group D normalization guidance: "For Group D sublinear schemes, compare at 1 GB and 100 GB when available. For session-oriented schemes targeting smaller databases (e.g., SinglePass, private encyclopedia use cases), also extract the paper's primary benchmark point. Note the target application's database size."

### 3.7 Application Section Guidance -- Underdeveloped

**Problem:** SinglePass devotes significant space (Sections 4-5, Section 7) to a specific application: a private encyclopedia service (e.g., private Wikipedia). The paper's parameter choices, benchmark normalization (normalizing by client storage), and the session-based model are all driven by this application. The SKILL's "Application Scenarios" template entry says "For papers with detailed application sections (>1 page), extract the application's constraints, parameter choices, and reported performance." This is correct but insufficient -- it does not guide the agent to understand how the application drives the scheme design.

**Suggested fix:** Expand the Application Scenarios guidance: "When the application drives parameter choices and benchmark methodology, document: (1) the application's database profile (size, element type, update frequency), (2) user behavior model (session length, query count per session), (3) which benchmarks are normalized for the application (e.g., fixed client storage, fixed query time), (4) how the application constrains Q or other tunable parameters."

### 3.8 Permutation-Based Schemes -- No Notation Guidance

**Problem:** Section 3.2 includes "Fisher-Yates shuffle / random permutations" and "Random permutations" entries, but the notation used by SinglePass is more specific and not fully covered:
- `P_N` = set of all permutations of [N]
- `p_i` = permutation for chunk i, `p_i : [m] -> [m]`
- `p_i^{-1}(j)` = inverse permutation lookup (critical for O(1) query time)
- `DB_i = DB[i*m : (i+1)*m]` = chunked database
- `ind` = position within chunk such that `p_{i*}(ind) = j*`
- Permutation swapping: `swap p_i(ind) and p_i(r_i)` for refresh

None of these are in the notation tables, yet they are central to understanding the scheme.

**Suggested fix:** Add to Section 3.2 a "Permutation-based notation" sub-table:

| Symbol | Convention | Used by |
|--------|-----------|---------|
| `P_N` | Set of all permutations of [N] | SinglePass |
| `p_i`, `p_i^{-1}` | Permutation and its inverse for chunk/set i | SinglePass |
| `ind` | Position in permutation mapping to target element | SinglePass |
| `DB_i` | i-th chunk of database, `DB[i*m : (i+1)*m]` | SinglePass |
| Permutation swap | Exchange `p(a)` and `p(b)` to refresh state | SinglePass |

### 3.9 The "Single Pass" Property -- Not Captured in Template

**Problem:** The paper's title contribution -- that preprocessing requires exactly one linear pass over the database -- is a property that has no natural home in the template. It is not a complexity metric (the asymptotic cost is O(N), same as multi-pass schemes). It is not a correctness property. It is a *streaming / access pattern* property that affects practical performance (cache efficiency, I/O cost). The SKILL has "Streaming memory" in Section 3.5b but nothing about the number of passes or the streaming nature of preprocessing.

**Suggested fix:** Add to Section 3.5b: "Preprocessing access pattern: single-pass (streaming) vs. multi-pass vs. random-access. Single-pass schemes (SinglePass) read each DB element exactly once, enabling cache-efficient and I/O-optimal preprocessing. Multi-pass schemes (Checklist, with lambda passes) read the DB lambda times. Record the number of passes and whether the access is sequential or random."

### 3.10 Comparison Table Methodology -- Missing "Normalized by" Guidance

**Problem:** SinglePass uses an unusual benchmarking methodology: in Figure 5 (static) and Figure 7 (updatable), tests are "normalized by client storage" -- meaning Q is tuned for SinglePass so that its client storage does not exceed the comparator schemes' client storage. In Appendix C (Figures 9-10), tests are normalized by "number of operations performed by the server online" (i.e., query time). This normalization methodology is not anticipated by the SKILL's benchmark extraction guidance (Section 4, Priority 2).

**Suggested fix:** Add to Section 4, Priority 2: "Note the normalization methodology used in benchmarks. Some papers normalize by fixing one metric (e.g., client storage, query time) and comparing others. Document what was held constant and what varied. This is especially important for schemes with tunable parameters (e.g., Q in SinglePass) where different normalization choices produce different comparative conclusions."

---

## 4. Specific Improvement Suggestions

### 4.1 Section 0, Step 1, Group D Row

**Current:** "PRF-first; use Section 3.5b for Group D parameters"

**Suggested:** "PRF-first (if applicable -- some Group D schemes like SinglePass are permutation-based, not PRF-based); use Section 3.5b for Group D parameters. Check whether correctness is deterministic or probabilistic."

### 4.2 Section 1, Archetype Table, Update/maintenance Row

**Current:** "Adds update mechanisms to existing schemes (e.g., IncrementalPIR, IncPIR)"

**Suggested:** "Adds update mechanisms to existing or new schemes. Updates may be the primary contribution (IncrementalPIR, IncPIR) or a secondary contribution of a new construction (SinglePass). Check whether updates are O(1), O(log N), or require re-preprocessing."

### 4.3 Section 2.1, Pass 3

**Current (heading-based search):** "search for 'Evaluation,' 'Experiments,' 'Implementation,' 'Performance,' 'Benchmarks,' or 'Comparison.'"

**Suggested addition:** "Also search for 'Benchmarking' (used by SinglePass: 'Benchmarking for Static Databases,' 'Benchmarking for Dynamic Databases')."

### 4.4 Section 7.3, Group D Lineage

**Current:** "SinglePass (2024, 2-server, single-pass streaming preprocessing, permutation-based -- NOT PRF-based)."

**Suggested expansion:** "SinglePass (2024, 2-server, single-pass streaming preprocessing, permutation-based -- NOT PRF-based, O(1) updates via permutation swaps, session-based deployment model, removes lambda factor from preprocessing)."

### 4.5 Section 3.4, Complexity Notation

**Current:** "O_lambda(): Hides poly(lambda) factors."

**Suggested addition:** SinglePass makes the lambda-independence of its preprocessing a central contribution. Add a note: "Some Group D schemes (SinglePass) achieve preprocessing independent of lambda, whereas prior schemes (Checklist) require O(lambda * N) preprocessing. When a paper claims lambda-independence, this is typically a major contribution -- verify and document it."

---

## 5. New Patterns or Template Sections the SKILL Should Add

### 5.1 Preprocessing Characterization Sub-Table

For Group D papers, add a structured sub-table to the template:

```markdown
## Preprocessing Characterization
| Property | Value |
|----------|-------|
| Number of DB passes | <e.g., 1 (single-pass) / lambda (multi-pass) / random-access> |
| Streaming compatible | <yes/no> |
| Server computation | <e.g., O(N*w)> |
| Client receives | <e.g., m hint parities + Q permutation seeds> |
| Lambda-dependent | <yes (O(lambda*N)) / no (O(N))> |
| Re-preprocessing trigger | <e.g., never / after Q queries / after N additions> |
```

### 5.2 Novel Proof Technique Section

Add to the template (after Novel Primitives):

```markdown
## Novel Proof Techniques (if applicable)
| Field | Detail |
|-------|--------|
| **Name** | <e.g., Show and Shuffle game> |
| **What it captures** | <e.g., single-round query privacy: adversary cannot distinguish real permutations from freshly sampled ones after a swap> |
| **Parameters** | <e.g., L permutations over [K]> |
| **Proven bound** | <e.g., Pr[SaS -> 1] = 1/2 for any adversary (perfect indistinguishability)> |
| **How used in main proof** | <e.g., Applied T times via hybrid argument to prove privacy for T sequential queries> |
| **Reusability** | <e.g., applicable to any scheme using permutation refresh after element reveal> |
```

### 5.3 Benchmark Normalization Methodology

Add to Section 4, Priority 2:

```markdown
### Benchmark normalization
- **Fixed metric:** <e.g., client storage / query time / server count>
- **Varied metric:** <e.g., Q parameter / ring dimension>
- **Normalization rationale:** <e.g., "we pick Q so client storage does not exceed comparator schemes">
```

### 5.4 Two-Server Query Decomposition

For two-server schemes in the Protocol Phases table, add guidance to show:

```markdown
| Phase | Actor | Server | Operation | Communication |
|-------|-------|--------|-----------|---------------|
| Query Gen | Client | -- | Produce q_0, q_1 | q_0 to S0, q_1 to S1 |
| Answer (refresh) | Server 0 | S0 | Look up S_refresh elements | A_0 to client |
| Answer (query) | Server 1 | S1 | Look up S_query elements | A_1 to client |
| Reconstruct | Client | -- | XOR to recover DB[x], swap to refresh | -- |
```

---

## 6. Summary Assessment

| Dimension | Score (1-5) | Notes |
|-----------|------------|-------|
| Archetype classification | 4 | Correctly identifies Construction; Update/maintenance is identifiable but the signature could be more explicit for secondary archetypes |
| Reading order | 4 | Pass ordering worked well; Pass 3 before Pass 4 was useful; toy protocol guidance was under-emphasized for Construction papers |
| Notation coverage | 3 | PRF/XOR basics covered; permutation-specific notation entirely missing; deterministic correctness path under-documented for Group D |
| Template fit | 3 | Core template sections worked; missing preprocessing characterization, novel proof technique, and benchmark normalization methodology sections |
| Domain knowledge accuracy | 5 | Section 7.3 lineage and Section 7.1 scope correctly describe SinglePass's position; "NOT PRF-based" distinction is accurate and important |
| Chart extraction guidance | 4 | Section 4.5 chart-heavy guidance was directly applicable and necessary; could add guidance on multi-panel chart grids (Figure 5 has 12 panels) |

**Overall:** SKILL.v0.md provided a solid foundation for reading this paper. The Quick-Start Router correctly identified the group, the reading path was efficient, and the template captured most of the paper's content. The main gaps are in Group D notation coverage for permutation-based (vs. PRF-based) schemes, the absence of preprocessing characterization metadata, and insufficient guidance for papers with chart-heavy evaluation sections using non-standard normalization methodologies. The deterministic correctness path for Group D is also under-documented, as the SKILL's Group D guidance implicitly assumes probabilistic correctness.
