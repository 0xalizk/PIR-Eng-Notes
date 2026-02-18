# SKILL.v0.md Feedback -- Plinko Paper

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Plinko: Single-Server PIR with Efficient Updates via Invertible PRFs |
| **Authors** | Alexander Hoover, Sarvar Patel, Giuseppe Persiano, Kevin Yeo |
| **Year** | 2024 |
| **ePrint** | 2024/318 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | Construction (theory-only) + Building-block |
| **PDF** | `Papers/Group D - Client Dependent Preprocessing/Plinko_2024_318.pdf` |
| **Total pages** | 32 (24 main body + 8 appendix/references) |

### Archetype Classification Reasoning

Plinko is a dual-contribution paper. It defines a novel cryptographic primitive (invertible PRF, iPRF) and constructs a PIR scheme using that primitive, but has **no implementation or benchmarks** -- only asymptotic analysis and comparison tables. This makes it a **Construction (theory-only) + Building-block** paper.

SKILL.v0.md's archetype table (Section 1) lists both "Construction (theory-only)" and "Building-block" as distinct archetypes. The multi-archetype composition rules (Section 1) say: "If the paper has benchmarks or concrete pseudocode, use the full Construction template as the base." Plinko has concrete pseudocode (Figures 7-8 in the appendix) but no benchmarks. This creates an ambiguity -- the rule keys on "benchmarks OR concrete pseudocode" but the "Construction (theory-only)" archetype says "NO implementation or benchmarks." Pseudocode alone is not the same as an implementation.

---

## 2. What SKILL.v0.md Got Right

### 2.1 Group-based routing (Section 0, Step 1) -- Accurate and Helpful

The routing table correctly directed me to Section 3.2 (PRF/symmetric-key notation) and Section 3.5b (Group D parameters). This was exactly right for Plinko: the paper's cryptographic foundation is OWF/PRF-based, not lattice/FHE-based. The instruction to skip Section 3.1 (Lattice/FHE) was correct -- Plinko uses no lattice cryptography.

### 2.2 Archetype table (Section 1) -- Correct match available

The "Construction (theory-only)" archetype signature -- "Proposes a new PIR scheme with proofs/pseudocode but NO implementation or benchmarks" -- matches Plinko perfectly. The template adaptation instruction ("Full template minus Performance Benchmarks and Implementation Notes. Use 'N/A (no implementation)' in Concrete columns") was exactly right.

The "Building-block" archetype signature -- "Primary contribution is a cryptographic primitive; PIR is the application" -- also correctly matches Plinko, which defines iPRFs as a standalone primitive in Section 4 (pages 10-18) before applying them to PIR in Section 5 (pages 18-23).

### 2.3 Section 3.2 (PRF/symmetric-key notation) -- Mostly relevant

The notation table in Section 3.2 correctly anticipated:
- PRF keys (sk, msk) -- Plinko uses per-block keys K[alpha] (page 21)
- PRF evaluation -- Plinko uses iF.F(k, j) notation
- Puncturable PRF -- correctly listed as used in Plinko
- Invertible PRF (iPRF) -- correctly listed as (Gen, Eval, Invert) and identified as used in Plinko
- Parity / XOR -- correctly anticipated p = XOR of DB entries at set indices (exact match to Plinko's parity computation on page 22)
- Chunk function -- relevant to Plinko's block structure (c = n/w blocks, page 21)

### 2.4 Section 4.5 (Papers with no tables) -- Correctly flags Plinko

The SKILL explicitly names Plinko in Section 4.5 as a paper without benchmarks: "Papers without benchmarks (MulPIR, CK20, Plinko, BarelyDoublyEfficient, WangRen): Extract analytical estimates from inline text." This is accurate -- Plinko has only asymptotic comparison tables (Figures 1, 2, 6) with no concrete performance numbers.

### 2.5 Section 7.3 (Scheme evolution) -- Accurate lineage

The lineage description in Section 7.3 is accurate: "CK20 (2019) -> Piano (2023) -> Plinko (2024, invertible PRFs, worst-case O-tilde(1) updates)." This matches the paper's self-description on pages 4 and 20 where it says "Plinko is built on top of [RMS24]" and can also be applied to Piano [ZPZS24].

### 2.6 Section 7.7 (Parameter relationships, Preprocessing-specific) -- Useful

The "Space-time tradeoff" bullet ("Client storage S x online server time T = O(nw) is the fundamental lower bound (WangRen)") correctly captures Plinko's central contribution: matching the lower bound r * t = Omega(n) for ALL parameterizations of client storage r (page 8, Theorem 5.3).

### 2.7 Scheme name warning (Section 1) -- Not needed but not harmful

Plinko is one of the papers that DOES use its community name in the paper itself. The paper explicitly names the scheme "Plinko" (page 1 abstract, footnote 2 on page 7 explains the name origin from the game).

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Reading order confusion for theory-only + building-block papers (Sections 2.1, 2.2, 2.6)

**Problem:** The SKILL provides three potentially applicable reading paths for Plinko:
- Section 2.1 (Construction, default reading order) -- Pass 3 says "read evaluation before core scheme"
- Section 2.2 (Theory papers) -- says "Skip Pass 3 (no benchmarks exist). Replace with Pass 3-alt"
- Section 2.6 (Building-block papers) -- says "Read the primitive's formal definition... BEFORE its evaluation. This differs from the default order."

These three paths conflict. For Plinko, which is Construction (theory-only) + Building-block:
- There is no evaluation section to read in Pass 3 at all (theory-only)
- The primitive (iPRF, Section 4) should be read before the PIR construction (Section 5) (building-block)
- The paper has a long technical overview (Section 2, pages 6-9) that functions as a "toy protocol" (theory)

**What I actually did:** I read the technical overview (Section 2) as part of Pass 1 extended (following Section 2.2), then read the iPRF definition and construction (Section 4) as Pass 2/Pass 4 of the building-block path, then read the PIR construction (Section 5) as the application. This worked well but was not clearly prescribed by any single reading path.

**Concrete suggestion:** Add a composition rule for multi-archetype reading paths. For example: "When a paper is both theory-only and building-block, use Section 2.2's extended Pass 1 (read the full technical overview), then Section 2.6's primitive-first ordering (read primitive definition and construction before PIR application), and skip Pass 3 entirely."

### 3.2 Pass 0 did not capture the paper structure well enough (Section 2.1)

**Problem:** Pass 0 says to read pages 1-2 and extract "Section headings, page ranges, total length, appendix length." Pages 1-2 of Plinko contain only the abstract and the first half of the Introduction. The section structure is not visible until later. The paper's structure is:
- Section 1: Introduction (pages 1-6)
- Section 2: Technical Overview (pages 6-9)
- Section 3: Preliminaries (pages 9-10)
- Section 4: Invertible PRFs (pages 10-18)
- Section 5: Single-Server PIR (pages 18-23)
- Section 6: Conclusion (page 24)
- Appendix A: Plinko Pseudocode (page 30-31)
- Appendix B: Plinko-Piano (pages 30-32)

**Impact:** Without knowing the section layout, I could not effectively plan which pages to read for each pass. A better approach would be to quickly scan the table of contents or skim page headers to identify section boundaries.

**Concrete suggestion:** Amend Pass 0 to: "Read pages 1-2. If section headings are not visible (common for papers with long introductions), additionally scan pages at intervals (e.g., page 5, 10, 15, 20) to identify section boundaries and total length. Alternatively, check the last 2 pages for references/appendix start to estimate main body length."

### 3.3 Missing guidance on "Pseudorandom Multinomial Sampler" as a building block (Section 7.5)

**Problem:** Section 7.5 lists common cryptographic building blocks used across the 35-paper collection. Plinko introduces a Pseudorandom Multinomial Sampler (PMNS) as a key intermediate primitive between PRP and iPRF (Definition 4.2, page 11). This is a novel abstraction that is not listed in Section 7.5, yet it is central to the paper's construction.

**Concrete suggestion:** Add to Section 7.5:
```
| Pseudorandom Multinomial Sampler (PMNS) | Plinko | Intermediate primitive composing PRP with balls-into-bins sampling to build iPRFs; enables efficient forward/inverse computation |
```

### 3.4 The "Correctness Analysis" section template is awkward for Plinko (Section 6, Option B)

**Problem:** Section 6's Correctness Analysis Option B (Probabilistic Correctness Analysis) asks for fields like "Failure probability," "Probability grows over queries?", "Proof technique," and "Amplification." For Plinko, correctness is essentially inherited from the base scheme [RMS24]. The paper explicitly says on page 23: "As iPRFs are also indistinguishable from random functions, we note that our hint distribution is identical to [RMS24]. As a result, we can directly use the correctness arguments from [RMS24]."

This means the template asks me to fill in details that are not in the paper -- they are in a different paper. The SKILL has no guidance for "correctness by inheritance" where a paper's correctness proof is a reduction to a prior scheme.

**Concrete suggestion:** Add a sub-option to Correctness Analysis:
```
### Option D: Inherited Correctness
_For papers that inherit correctness from a base scheme._
| Field | Detail |
|-------|--------|
| **Base scheme** | <name and reference> |
| **What changed** | <which modifications could affect correctness> |
| **Why correctness is preserved** | <1-2 sentences> |
| **Reference** | <specific theorem/section in the base scheme's paper> |
```

### 3.5 Section 3.5b (Group D critical parameters) is incomplete for Plinko's parameter space

**Problem:** Section 3.5b lists parameters for Group D PRF/symmetric-key schemes. For Plinko, the key parameters are:
- **w** (block size) -- number of consecutive DB indices per block
- **q** (supported queries before refresh) -- listed in SKILL as "Amortization window Q" but Plinko uses lowercase q, and q also appears in the backup hint count
- **lambda * w** (regular hint count) -- number of regular hints
- **c = n/w** (number of blocks) -- blocks the DB is partitioned into
- **c/2 + 1** (block subset size per hint) -- the number of blocks chosen per hint

The SKILL's Section 3.5b does list "Set size |S|" and "Number of sets Q" and "Word size w" and "Amortization window Q," but:
1. It does not distinguish between "block size w" (Plinko) and "word size w" (bits per DB entry). In Plinko, w is a block size (number of entries per block), not a bit-width per entry. The paper uses B for bit-width per entry (Figure 6).
2. It does not capture the regular/backup hint distinction that is central to Plinko and RMS24.
3. The parameter c (number of blocks) is not listed.

**Concrete suggestion:** Add to Section 3.5b:
```
- **Block size** w or |B| -- number of DB entries per block (distinct from entry bit-width B in some papers)
- **Block count** c = n/w -- number of blocks the database is partitioned into
- **Regular vs. backup hints** -- some schemes (RMS24, Plinko) maintain two types of hints with different roles; record counts of each
- **Block subset size** -- number of blocks included per hint (e.g., c/2 + 1 in Plinko)
```

### 3.6 The SKILL's Section 2.4 (Appendix handling) does not emphasize "appendix IS the specification" strongly enough for Plinko

**Problem:** Section 2.4 says: "Algorithm-heavy appendices: When the main body has <3 pages of construction but the appendix has 5+ algorithms, the appendix IS the specification -- read it in full during Pass 4." For Plinko, the main body (Section 5.2, pages 20-23) gives a textual description of the construction, and the appendix (pages 30-32) provides the formal pseudocode (Figures 7 and 8). The main body is more than 3 pages, but the pseudocode is ONLY in the appendix.

I would not have known to read the appendix pseudocode without the general "appendix handling" guidance, and the trigger condition ("<3 pages of construction") is too narrow. In Plinko's case, the main body has ~3 pages of construction text, which barely misses the trigger.

**Concrete suggestion:** Broaden the trigger to: "When the appendix contains pseudocode/algorithms that are not reproduced in the main body (i.e., the main body references them as 'see Appendix X'), the appendix algorithms are essential and must be read during Pass 4, regardless of main body length."

### 3.7 Missing template section for "Formal Model Definitions" within a Construction paper

**Problem:** Plinko defines a formal model for "offline-online PIR" (Definition 5.1, page 19) and "updateable PIR" (Definition 5.2, page 19-20) with formal correctness and privacy games (Figure 5, page 20). These are not just preliminaries -- they are part of the paper's contribution (the paper says "Our definition stresses the offline model of two prior works").

The SKILL's template has a "Formal Definitions" section but only for "Model/definition and Compiler/framework papers." For a Construction paper that also defines a model, the composition rules say to "Add the template adaptations from each secondary archetype," but the Formal Definitions section is not framed as something you would add to a Construction template -- it is framed as belonging to a separate archetype.

**Concrete suggestion:** In the multi-archetype composition rules (Section 1), explicitly note: "If a Construction paper defines formal models/games as part of its contribution (even if it is not primarily a Model/definition paper), include the Formal Definitions section from the Model/definition template."

### 3.8 The "Novel Primitives / Abstractions" template section is good but missing a field

**Problem:** The Novel Primitives template in Section 6 has fields for Name, Interface/Operations, Security definition, Correctness definition, Purpose, Built from, Standalone complexity, and Relationship to prior primitives. For Plinko's iPRF, an important missing field is:

- **Construction technique:** The iPRF is built by composing a PRP with a PMNS (Theorem 4.4, page 12). This composition is the key insight and is distinct from listing what it is "Built from" (which would just say "PRP + PMNS from OWF"). The construction technique -- using balls-into-bins sampling via a binary tree of binomial samples seeded by a PRF -- is the paper's most novel algorithmic contribution.

**Concrete suggestion:** Add a "Construction technique" or "Key algorithmic idea" field to the Novel Primitives template:
```
| **Construction technique** | <e.g., Compose PRP with PMNS; PMNS uses binary tree of binomial samples for efficient forward/inverse computation> |
```

### 3.9 No guidance for papers presenting two variant constructions (Plinko and Plinko-Piano)

**Problem:** Plinko presents two variants: Plinko (based on RMS24, Section 5.2 + Appendix A) and Plinko-Piano (based on Piano/ZPZS24, Appendix B). Both are full constructions with pseudocode. The SKILL's Section 8 (Robustness Guidelines) says "Produce ONE note file per paper. Use the Variants table for a structured comparison." But the Variants table template is designed for minor parameter/tradeoff variants (e.g., Spiral vs. SpiralStream), not for two distinct constructions built on different base schemes.

**Concrete suggestion:** Distinguish between "parametric variants" (same construction, different parameters) and "base-scheme variants" (same technique applied to different base schemes). For the latter, recommend documenting each as a separate sub-construction with its own Protocol Phases and Complexity rows, while sharing the Novel Primitives section.

### 3.10 The lower bound section template needs a "matched by" field

**Problem:** Section 6's Lower Bounds template has "Tightness" as a field. But for Plinko, the central claim is that it matches a known lower bound (r * t = Omega(n) from [CK20, CHK22, Yeo23]) for ALL parameterizations, whereas prior work only matched it for specific values of r. The template does not clearly capture the distinction between "matches a lower bound" and "matches a lower bound across a continuous parameter range."

**Concrete suggestion:** Add a "Matching scope" field:
```
| **Matching scope** | <e.g., "Matches for all r" vs "Matches only when r = O(sqrt(n))"> |
```

### 3.11 SKILL does not mention the significance of "worst-case vs. amortized" for update costs

**Problem:** Section 3.5b lists "Update cost -- per-mutation computation and communication" but does not emphasize the critical distinction between worst-case and amortized update costs. For Plinko, the key differentiator from prior work is that it achieves polylog(n) WORST-CASE update time (not just amortized), while prior OWF-based schemes required sqrt(n) or n worst-case update time even if their amortized cost was polylog(n) (Figure 2, page 3). The comparison table (Figure 6, page 30) has separate columns for worst-case and amortized update time/communication.

The SKILL's Update metrics table (Section 6) does not have separate worst-case and amortized rows. The comparison in Figure 2 of the paper shows this is THE distinguishing feature of Plinko for updates.

**Concrete suggestion:** In the Update metrics sub-table, split each metric into worst-case and amortized:
```
| Cost per DB update (worst-case) | <e.g., O-tilde(1) for Plinko vs sqrt(n) for GZS> |
| Cost per DB update (amortized) | <e.g., polylog(n) for both Plinko and GZS> |
| Communication per update (worst-case) | ... |
| Communication per update (amortized) | ... |
```

---

## 4. Specific Improvement Suggestions

### 4.1 Section 0, Step 2 -- Add a composite archetype entry

Currently the archetype table in Section 0 Step 2 does not have an entry for "Construction (theory-only) + Building-block." Since this combination appears in at least 3 papers in the collection (MulPIR, CK20, Plinko), it deserves an explicit row:

```
| Construction (theory-only) + Building-block | Section 2.2 extended Pass 1 + Section 2.6 primitive-first ordering; skip Pass 3 | Full template minus Performance Benchmarks and Implementation Notes + expanded Novel Primitives |
```

### 4.2 Section 2.2 -- Fix the "toy protocol" guidance for Plinko-type papers

Section 2.2 says: "Theory papers often have 8-12 page introductions with technical overviews and toy protocols. Read the full introduction -- the toy protocol is typically the most accessible description."

For Plinko, the "Technical Overview" (Section 2, pages 6-9) is a SEPARATE section, not part of the Introduction. It contains what the SKILL would call a "toy protocol" -- a simplified OO-PIR scheme (pages 6-7) that is then enhanced with iPRFs. The SKILL should note that technical overviews may appear as separate sections (often Section 2) rather than being embedded in the Introduction.

**Concrete wording change:** In Section 2.2, change "Theory papers often have 8-12 page introductions with technical overviews and toy protocols" to "Theory papers often have long introductions (8-12 pages) or separate Technical Overview sections (labeled 'Technical Overview,' 'Our Techniques,' or 'Overview of Constructions') that contain toy protocols and informal construction sketches. These are typically the most accessible descriptions of the scheme. Read them in full."

### 4.3 Section 3.2 -- Add "Multinomial distribution" notation

Plinko uses MN(n, m) for the multinomial distribution (Definition 4.2, page 11), Binomial(n, p) for binomial distributions (pages 9, 14), and Bernoulli for Bernoulli distributions (page 9). These probability distribution notations are central to the iPRF construction but are not in Section 3.2's notation table.

**Concrete addition:**
```
| Distributions | Binomial(n,p), MN(n,m), Bernoulli | Multinomial distribution for balls-into-bins; used in PMNS construction (Plinko) |
```

### 4.4 Section 7.5 -- Update the iPRF entry

The current entry for iPRF in Section 7.5 reads:
```
| Invertible PRF (iPRF) | Plinko | PRF that can be inverted with the key; enables O-tilde(1) updates |
```

This is accurate but undersells the primitive. A more informative entry:
```
| Invertible PRF (iPRF) | Plinko | PRF with efficient inversion: forward evaluation in O-tilde(1), inversion in time linear in preimage size. Built from PRP + PMNS. Enables O-tilde(1) hint searching and worst-case O-tilde(1) database updates. Strictly stronger security than PRF (adversary gets both forward and inverse oracles). |
```

### 4.5 Section 8 (Validation checklist) -- Add a check for "referenced proofs"

Plinko defers its correctness and security proofs to the base scheme [RMS24]. The validation checklist should include: "[ ] For papers that defer proofs to prior work, identify which properties are inherited and which are novel."

---

## 5. New Patterns or Template Sections the SKILL Should Add

### 5.1 "Technique Portability" section for Building-block papers

Plinko's iPRF is applied to two different base PIR schemes (RMS24 and Piano). The paper explicitly notes that iPRFs "do not generically improve all OO-PIR" because "many rely on specific puncturable properties of their PRFs" (page 8). This analysis of where the technique does and does not transfer is valuable engineering information.

The current template has a "Portable Optimizations" section, but it is framed as an afterthought. For Building-block papers, this should be elevated to a required section with structured fields:

```
## Technique Portability
| Base Scheme | Compatible? | Why / Why Not | Reference |
|-------------|-------------|---------------|-----------|
| RMS24 | Yes | Uses PRFs for random offsets; iPRF substitution preserves all properties | Section 5.2, Appendix A |
| Piano (ZPZS24) | Yes | Same PRF-based offset structure | Appendix B |
| SACM21 (puncturable PRFs) | No | Relies on puncturing, which iPRFs do not provide | Page 8 |
| ZLTS23 | No | Relies on specific PRF properties beyond standard evaluation | Page 8 |
```

### 5.2 "Security Reduction Chain" for papers with layered primitives

Plinko has a layered security reduction: iPRF security reduces to PMNS security + PRP security (Theorem 4.4), PMNS security reduces to PRF security (Theorem 4.7), PRP reduces to OWF, and PIR security reduces to iPRF (forward-only) security which reduces to PRF security (page 23). The template has no structured way to capture this chain.

Suggested addition:
```
## Security Reduction Chain
| Property | Reduces to | Theorem/Proof | Tightness |
|----------|-----------|---------------|-----------|
| PIR privacy | iPRF forward security (= PRF security) | Page 23 | Tight |
| PIR correctness | iPRF correctness + RMS24 correctness | Page 23 | Inherited |
| iPRF security | PMNS security + PRP security | Theorem 4.4 | Tight |
| PMNS security | PRF security (range >= n) | Theorem 4.7 | Tight |
```

### 5.3 Guidance for papers with "balls-into-bins" style probabilistic arguments

Plinko's iPRF construction is built on a balls-into-bins analogy (Section 4.1-4.3, pages 11-16). The binary tree construction for the PMNS (Figure 3, Figure 4) is a novel algorithmic pattern that the SKILL does not have notation for. While this is specific to Plinko, the balls-into-bins framework appears in other PIR papers for correctness analysis (e.g., cuckoo hashing failure probabilities). The SKILL could benefit from a brief note in Section 3.2 or Section 3.4 about probabilistic distribution notation commonly used in Group D papers.

### 5.4 "Amortization Model" clarification

Plinko has a specific amortization model: the client supports q queries before re-executing the offline phase. The re-execution can be amortized by streaming n/q database elements per query (page 22). This "rolling offline phase" pattern also appears in Piano and RMS24. The SKILL's Section 3.5b lists "Amortization window Q" but does not describe the "rolling offline" pattern where the next set of hints is built incrementally during online queries. This is a common pattern in Group D that deserves explicit mention.

**Concrete addition to Section 3.5b:**
```
- **Rolling offline phase** -- some schemes (Piano, RMS24, Plinko) amortize re-preprocessing by streaming a fraction of the database per online query, building the next hint set incrementally. Record: stream size per query (n/q), whether this adds to online communication, and whether it increases query time.
```

---

## 6. Summary Assessment

SKILL.v0.md provided solid guidance for reading Plinko. The Group D routing, PRF notation tables, and archetype classification all worked well. The main weaknesses were:

1. **Reading path conflicts for multi-archetype papers** (3 different paths with no clear composition rule) -- this was the most significant practical problem during reading.
2. **Incomplete parameter coverage** for Plinko's block-based hint structure (block size vs. word size confusion; no regular/backup hint distinction).
3. **Missing "inherited correctness" template option** for papers that reduce correctness to a prior scheme.
4. **Insufficient distinction between worst-case and amortized update costs** in the template, despite this being THE key differentiator for Plinko.
5. **Pass 0 too narrow** -- pages 1-2 were insufficient to plan the reading strategy for a paper with a 6-page introduction.

The SKILL correctly anticipated that Plinko would have no benchmarks (Section 4.5 names it explicitly), correctly placed it in the evolutionary lineage (Section 7.3), and provided relevant PRF/iPRF notation (Section 3.2). The template structure was largely appropriate once I mentally composed the theory-only and building-block adaptations.
