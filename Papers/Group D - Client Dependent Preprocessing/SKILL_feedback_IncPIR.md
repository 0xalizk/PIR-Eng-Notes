# SKILL.v0.md Feedback: IncPIR (2021/1438)

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Incremental Offline/Online PIR (extended version) |
| **Authors** | Yiping Ma, Ke Zhong, Tal Rabin, Sebastian Angel |
| **Year** | 2021 (USENIX Security 2022) |
| **ePrint** | 2021/1438 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | **Update/maintenance + Construction + Model/definition** (multi-archetype) |
| **PDF** | `Papers/Group D - Client Dependent Preprocessing/IncPIR_2021_1438.pdf` |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Multi-archetype classification was well-supported (Section 1)

The archetype table in Section 1 includes an "Update/maintenance" row whose signature -- "Adds update mechanisms to existing schemes (e.g., IncrementalPIR, IncPIR)" -- exactly matches this paper. The paper is explicitly called out by name. The multi-archetype composition rules (Section 1, rules 1-3) correctly guided me to use the full Construction template as the base (because the paper has benchmarks and pseudocode) and then layer on Update/maintenance adaptations (update metrics, composability) and Model/definition adaptations (formal definitions of Incremental OO-PIR and Incremental PRS). This was the correct approach.

### 2.2 Group D routing was accurate (Section 0, Step 1)

The Quick-Start Router correctly directed me to Section 3.2 (PRF/symmetric-key notation) and away from Section 3.1 (Lattice/FHE). IncPIR is indeed PRF-based with no FHE, so skipping lattice notation saved time. The routing note "PRF-first; use Section 3.5b for Group D parameters" was directly applicable.

### 2.3 PRF/symmetric notation table covered this paper well (Section 3.2)

The notation table in Section 3.2 included several entries that mapped directly to IncPIR's constructs:
- **Pseudorandom sets** and **PRS (Definition 3)** matched IncPIR's core building block.
- **Parity / XOR** (`p = XOR_{i in S} DB[i]`) was the fundamental operation.
- **Hypergeometric distribution** `HG(N, K, n)` was explicitly listed as "used in IncPIR" -- this was directly helpful since hypergeometric sampling is central to the incremental update procedure (Section 4.2.1, page 6).
- **Puncturable PRF** was correctly noted as used in CK (the base scheme IncPIR extends).
- **Hint table** notation was relevant.

### 2.4 The Update/maintenance template sections were well-designed (Section 6)

The template's "Update metrics" table (cost per DB update, communication per update, aggregation threshold, deletion semantics, supported mutation types) was an excellent fit for this paper, which explicitly addresses all three mutation types (additions, in-place edits, deletions) and has distinct costs for each. The "Composability" table was also directly applicable since the paper applies its incremental technique to two base schemes (CK and SACM).

### 2.5 Reading path for multiple constructions was correctly flagged (Section 2.1)

The note at the bottom of Section 2.1 -- "Papers with multiple constructions: When a paper presents 2+ independent constructions (e.g., KeywordPIR, CK20, IncPIR), apply Passes 2-4 to each construction" -- was helpful. IncPIR presents incremental CK (main body, Sections 4-6) and incremental SACM (Appendix E), plus the Incremental PRS primitive (Section 5). This guidance correctly told me to treat each separately.

### 2.6 Appendix handling was accurate (Section 2.4)

The trigger "any paper where the appendix contains algorithms/pseudocode" fired correctly. The appendix (pages 15-22) contains Appendix E with a complete second construction (incremental SACM) with its own algorithms (Figures 13, 14, 17-19), plus proofs of the incremental PRS primitive's properties. The guidance to read algorithm-heavy appendices in full during Pass 4 was the right call.

### 2.7 Deletion semantics distinction was prescient

The template's "Deletion semantics" row with options "Strong (provably removed) / Weak (lazy) / N/A" perfectly matched the paper's own distinction between "strong deletion" and "weak deletion" (Section 3.3, page 4). This is evidence that the SKILL was informed by this paper.

### 2.8 Scheme evolution lineage was accurate (Section 7.3)

The lineage note "IncPIR (2021, incremental hint updates for mutable databases, 2-server)" is factually correct and placed in the right evolutionary context.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Pass 3 (Evaluation) before Pass 4 (Core scheme) was counterproductive for this paper

**SKILL reference:** Section 2.1, Pass ordering: "Read evaluation (Pass 3) before the core scheme (Pass 4). Knowing the target metrics anchors your reading of the construction."

**Problem:** For IncPIR, reading the evaluation (Section 8, pages 12-14) before the core construction (Sections 4-6, pages 5-11) would have been confusing and unhelpful. The evaluation discusses "IncPrep costs" vs. "Prep costs," compares incremental CK to CK baseline and DPF-PIR, and shows Figure 9's microbenchmarks -- none of which make sense without first understanding:
1. What the CK base protocol does (Section 4.1)
2. How incremental modifications work (Sections 4.2, 5, 6)
3. What the Incremental PRS primitive is (Section 5)

This is a general weakness for **Update/maintenance** papers: the evaluation compares "with update mechanism" vs. "without," so the update mechanism itself must be understood first. The SKILL should add an exception for Update/maintenance archetypes: read the base scheme and the update mechanism (Pass 4) before the evaluation (Pass 3).

### 3.2 Model/definition reading path (Section 2.8) did not account for papers defining new models that are NOT the primary contribution

**SKILL reference:** Section 2.8: "Read formal definitions carefully -- they ARE the contribution, not preliminaries."

**Problem:** IncPIR defines two new formal objects -- Incremental OO-PIR (Definition 2, page 3-4) and Incremental PRS (Definition 4, page 7) -- but these definitions are embedded within the construction narrative, not in a standalone "Definitions" section. The paper's primary contribution is the construction, not the model. The definitions serve the construction, not the other way around.

The Section 2.8 path says to "Read formal definitions carefully -- they ARE the contribution." For IncPIR, they are NOT the primary contribution; the constructions are. The SKILL should distinguish between:
- **Model-primary papers** (where the model IS the contribution, e.g., a paper that defines DEPIR)
- **Model-secondary papers** (where a new model is defined in service of a construction)

For model-secondary papers, the definitions should be read inline during Pass 4, not elevated to a primary pass.

### 3.3 Missing guidance on two-server protocol documentation

**SKILL reference:** Section 6, Protocol Phases table has columns for "Server" and mentions "For multi-server schemes, label each server's role."

**Problem:** This guidance is too sparse for IncPIR's two-server model. The paper has a very specific server role structure:
- **Offline server:** Runs Prep, DBUpd, HintRes. Stores the full database. Performs preprocessing and hint updates.
- **Online server:** Runs Resp. Stores the full database. Handles online queries. Has NO knowledge of which sets the client holds.

The security model depends critically on non-collusion between these two servers. The SKILL should provide a dedicated sub-template for two-server schemes that captures:
1. Which server runs which algorithm
2. What each server knows/doesn't know
3. What the non-collusion assumption buys
4. Whether server roles can be played by the same entity in different contexts (IncPIR's PIR-Tor deployment has directory servers playing both roles for different clients)

### 3.4 No guidance on "base scheme summary" for update/derivative papers

**Problem:** A significant portion of IncPIR (Section 4.1, pages 5-6) is a summary of the CK protocol that it extends. The SKILL provides no guidance on how to document this. Should the engineer notes include a full summary of the base scheme? A minimal summary? Just a reference?

**Suggested addition:** For Update/maintenance and Engineering optimization papers, add guidance: "Include a 'Base Scheme Summary' subsection (3-5 bullet points) covering the base scheme's hint structure, online protocol, and key parameters. This is NOT a replacement for reading the base scheme's own notes, but provides self-contained context for understanding the modifications."

### 3.5 Incremental PRS is a novel primitive but does not fit the "Novel Primitives" template well

**SKILL reference:** Section 6, "Novel Primitives / Abstractions" table.

**Problem:** The template asks for "Interface / Operations," "Security definition," "Correctness definition," "Standalone complexity," etc. The Incremental PRS (Definition 4, Section 5.3, Figure 1) has an unusual structure:
- It has `Gen`, `Add`, and `Eval` operations -- but `Add` modifies `aux` (auxiliary information), not the key.
- Its "correctness" involves the set still being a random subset of the extended range after additions.
- Its "non-triviality" is about the symmetric difference between old and new sets being small.
- Its complexity is not standalone -- it depends on the number of range extensions `L`.

The template's fields like "Standalone complexity" and "Relationship to prior primitives" work fine, but "Security definition" and "Correctness definition" need to accommodate primitives whose properties are about set distributions rather than encryption/decryption.

**Suggestion:** Add a note in the Novel Primitives section: "For non-encryption primitives (e.g., pseudorandom set constructions, accumulators), adapt Security/Correctness fields to match the primitive's actual properties (e.g., pseudorandomness, non-triviality)."

### 3.6 Section 3.2 is missing PRP-related notation specific to IncPIR

**SKILL reference:** Section 3.2, PRF/symmetric-key notation table.

**Problem:** IncPIR uses PRPs in a specific way that is not covered:
- **Small-domain PRPs** built from PRFs via Patarin's proposal and Black-Rogaway cycle walking (page 12). The SKILL mentions "Small-domain PRPs also used (WangRen)" but does not mention IncPIR's use.
- **Power-of-two range extension** for PRPs (Black-Rogaway technique, page 12). This is an implementation detail that matters for understanding the evaluation.
- **Breadth-first PRG tree expansion** for evaluating puncturable PRFs at consecutive points (page 12). This optimization is not documented.

**Suggestion:** Expand the PRP row in Section 3.2 or add implementation technique notes: "For PRPs over non-power-of-two domains, papers may use cycle walking (Black-Rogaway). For evaluating PRFs at consecutive points, breadth-first PRG tree expansion reduces cost."

### 3.7 Correctness Option B does not capture IncPIR's degrading failure model well

**SKILL reference:** Section 6, Correctness Analysis, Option B.

**Problem:** IncPIR has a distinctive correctness model where failure probability *increases* as the database grows via additions, because set sizes are kept constant while the database range expands. The paper analyzes this carefully (page 11): for n = 2^20 with set size 2^10, failure probability is ~10^-7 initially, but grows to ~10^-6 after 2^18 additions.

The Option B table has a row "Probability grows over queries?" but the issue in IncPIR is not growth over queries -- it is growth over *database additions*. The failure probability grows as a function of the number of mutations, not the number of queries. This is a different degradation axis.

**Suggestion:** Change "Probability grows over queries?" to "Probability degrades over time?" with options: "yes (per query) / yes (per DB mutation) / yes (per both) / no (static)". Add "DB size at which re-preprocessing is recommended" as an additional field.

### 3.8 "Occasional correctness" model not well-explained

**SKILL reference:** Section 1, Archetype table, "Update/maintenance" row mentions IncPIR. Section 6 header table has correctness model options including "Occasional (constant failure, amplifiable)."

**Problem:** The paper's incremental SACM construction (Appendix E) achieves "occasional correctness" (a term from SACM [51]), where the online query fails with small but non-negligible probability. This is distinct from the CK-based construction's negligible failure probability. The SKILL lists "Occasional" as a correctness model option but does not explain what it means or how it differs from "Probabilistic." The SACM paper defines it as: the online query may fail with constant probability, but the client can detect failure and retry.

**Suggestion:** Expand the correctness model options in the header table with brief definitions:
- "Occasional: fails with constant (non-negligible) probability; client can detect failure and retry/amplify"
- "Probabilistic (degrading): failure probability grows with DB size or query count"

### 3.9 The "Builds on" lineage field is too simple for papers that extend multiple base schemes

**SKILL reference:** Section 6, Lineage table.

**Problem:** IncPIR extends two independent base schemes (CK [23] and SACM [51]) with different mechanisms and different resulting properties. The "Builds on" and "What changed" fields assume a single lineage. For IncPIR, a single "What changed" field cannot capture:
- For iCK: Added incremental PRS to replace explicit set storage; added HintReq/HintRes/HintUpd algorithms; kept the CK online protocol structure.
- For iSACM: Adapted the incremental approach to SACM's suffix-based PRS; handled related elements differently; achieved occasional (not negligible) correctness.

**Suggestion:** For papers that extend multiple base schemes, allow multiple rows in the Lineage table, one per base scheme. Or add a "Lineage per variant" sub-table.

### 3.10 No guidance on PIR-Tor or other application case studies

**SKILL reference:** Section 6, "Application Scenarios" says to extract application constraints and performance.

**Problem:** IncPIR devotes an entire section (Section 7, pages 12-13) to PIR-Tor as a case study, including:
- How to assign offline/online server roles to Tor directory servers
- Load balancing analysis
- Security probability ((q/p)^2 for q corrupted out of p servers)
- A 3-month trace-driven evaluation with real Tor relay data

The "Application Scenarios" section in the template is a bullet list, which is insufficient for a full-section case study. The SKILL should note: "For papers with full application case studies (>1 page), use the System Context sub-template to document the application, even if the paper's primary archetype is not System."

### 3.11 Chart-heavy evaluation guidance was needed but not precisely enough

**SKILL reference:** Section 4.5 on chart-only papers.

**Problem:** IncPIR has ONE table (Figure 9) and FIVE charts (Figures 10a, 10b, 11a, 11b, 12a, 12b). The charts are the primary evaluation artifact. While Section 4.5 provides guidance for "chart-heavy papers," it focuses on papers with NO tables. IncPIR has both tables and charts, and the charts contain different information than the table. The SKILL should clarify that chart extraction guidance applies even when some tables exist, if the charts contain additional data not in the tables.

---

## 4. Specific Improvement Suggestions

### 4.1 Add Update/maintenance exception to Pass ordering (Section 2.1)

**Current text (Section 2.1):** "Read evaluation (Pass 3) before the core scheme (Pass 4)."

**Suggested addition after that sentence:**
> Exception: For Update/maintenance papers, read the base scheme summary and update mechanism (Pass 4) before the evaluation (Pass 3). The evaluation compares "with updates" vs. "without updates," which requires understanding the update mechanism first.

### 4.2 Add "Base Scheme Summary" to the Update/maintenance template adaptation (Section 1)

**Current text (Section 1, Update/maintenance row):** "Add update-specific metrics... Document composability with base schemes."

**Suggested expansion:**
> Add update-specific metrics (cost per update, communication per update, aggregation threshold, deletion semantics). Include a "Base Scheme Summary" subsection (3-5 bullet points) documenting the base scheme's hint structure, online protocol, and key parameters. Document composability with base schemes. For papers extending multiple base schemes, create separate sub-sections per base scheme.

### 4.3 Expand correctness degradation field (Section 6, Option B)

**Current field:** "Probability grows over queries? yes (degrading) / no (per-query independent)"

**Suggested replacement:**
> "Probability degrades? No (static) / Yes, over queries / Yes, over DB mutations / Yes, over both. If yes, state the degradation rate and the threshold at which re-preprocessing is recommended."

### 4.4 Add two-server protocol sub-template (Section 6, Protocol Phases)

**Suggested addition after the Protocol Phases table:**
> **Two-server schemes:** Document each server's role, what information each server holds, the non-collusion assumption, and whether roles are symmetric or asymmetric. For asymmetric roles (e.g., offline server vs. online server), specify which algorithms each server executes and what cross-server information flow is prohibited.

### 4.5 Fix Section 3.2 to include IncPIR's PRP usage

**Current PRP row:** "pi_sk(i) | Pseudorandom permutation for load balancing (Piano). Small-domain PRPs also used (WangRen)."

**Suggested expansion:**
> "pi_sk(i) | Pseudorandom permutation for load balancing (Piano), incremental set construction (IncPIR), and tight space-time tradeoffs (WangRen). Small-domain PRPs built from PRFs via Patarin/cycle-walking also used (IncPIR, WangRen)."

### 4.6 Add Section 3.2 entry for Incremental PRS

**Suggested new row in Section 3.2:**

> | Incremental PRS | (Gen, Add, Eval) with aux | Pseudorandom set whose range can be extended via Add(aux, m) without regenerating the key. aux stores subrange metadata. Used in IncPIR. |

### 4.7 Add non-triviality to Section 3.2

IncPIR's non-triviality definition (the hint, query, response, and update communication must all be sublinear in database size) is a critical formal property that the SKILL does not call out as a general concept for Group D schemes. Many Group D papers have similar non-triviality requirements.

**Suggested new row in Section 3.2:**
> | Non-triviality | Sublinearity of hint + query + response in n | Ensures the scheme is cheaper than downloading the whole database. Critical for preprocessing schemes. |

---

## 5. New Patterns or Template Sections the SKILL Should Add

### 5.1 "Mutation Model" section for Update/maintenance papers

IncPIR carefully distinguishes three mutation types (additions, in-place edits, deletions) with different costs and mechanisms for each. The current template does not have a dedicated place for this. Suggested new section:

```markdown
## Mutation Model (Update/maintenance papers)

| Mutation Type | Supported? | Mechanism | Cost (computation) | Cost (communication) | Correctness Impact |
|--------------|-----------|-----------|-------------------|---------------------|-------------------|
| Addition | | | | | |
| In-place edit | | | | | |
| Deletion (strong) | | | | | |
| Deletion (weak) | | | | | |
| Arbitrary insertion | | | | | |
```

### 5.2 "Base Scheme Summary" sub-section

For papers that modify or extend existing schemes:

```markdown
## Base Scheme Summary
_Brief self-contained description of the scheme(s) this paper modifies._

### <Base Scheme Name>
- **Model:** <e.g., 2-server offline/online>
- **Hint structure:** <e.g., sqrt(n) log n sets of size sqrt(n) with XOR parities>
- **Online protocol:** <e.g., find set containing i, remove i, send remaining indices to online server>
- **Key limitation addressed:** <e.g., hints depend on all items -- any mutation invalidates them>
```

### 5.3 Formal property: "Non-triviality" documentation

IncPIR defines non-triviality with specific sublinearity requirements for the initial hint, online query, online response, update summary, update query, and update response. This is a more nuanced non-triviality than most papers. The SKILL should add non-triviality as a standard field in the header table for Group D papers, with a note about what quantities must be sublinear.

### 5.4 Pattern: "Security against whom?" for two-server schemes

IncPIR's security is defined differently against the offline server vs. the online server (Section 3.1, page 3). The offline server sees h (the hint) but not the queried index; the online server sees the query but not the hint. After incremental updates, security requires that the combination of IncPrep + Query still hides the queried index from both servers independently.

The SKILL should add a "Per-server security" sub-template for multi-server papers:

```markdown
## Per-Server Security (multi-server schemes)

| Server | What it sees | What it must NOT learn | Security mechanism |
|--------|-------------|----------------------|-------------------|
| Offline | hint h, update queries u_q | queried index i | hint is independent of query |
| Online | query q_i (set of indices) | queried index i | set is pseudorandom, i is hidden |
```

### 5.5 Pattern: Trace-driven evaluation

IncPIR uses real Tor relay update traces (3 months, February-May 2021) to evaluate incremental preprocessing. This "trace-driven evaluation" pattern also appears in other PIR application papers. The SKILL should note this as an evaluation methodology:

**Suggested addition to Section 4, Priority 2:**
> For application-driven evaluations, note whether benchmarks use synthetic workloads or real-world traces. If trace-driven, record the trace source, time period, and key statistics (e.g., "Tor relay updates, Feb-May 2021, ~7K initial relays, 3-day update batches").

---

## 6. Summary Assessment

**Overall SKILL.v0.md quality for this paper: 7/10**

The SKILL correctly identified the paper's archetypes, routed to the right notation sections, and provided a template that covered most of the paper's content. The Update/maintenance archetype was clearly designed with IncPIR in mind (it is even named in the archetype table). The PRF/symmetric notation was directly applicable.

The main gaps were:
1. **Pass ordering** (evaluation before construction is wrong for update papers) -- medium impact
2. **Two-server documentation** -- the template is too sparse for multi-server protocols -- medium impact
3. **Base scheme summary** -- no guidance on documenting the scheme being extended -- low-medium impact
4. **Correctness degradation axis** -- queries vs. mutations distinction missing -- low impact
5. **Model-secondary vs. model-primary** distinction missing -- low impact

The SKILL's strongest contribution was the **Update metrics** template and the **Composability** table, which were tailor-made for this type of paper. The weakest area was the **reading order** guidance, which assumed evaluation is always understandable before the construction -- an assumption that breaks for papers whose contribution is a modification to an existing scheme.
