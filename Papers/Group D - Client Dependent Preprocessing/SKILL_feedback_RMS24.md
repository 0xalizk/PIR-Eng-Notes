# SKILL.v0.md Feedback -- RMS24 (Dummy Subsets PIR)

## 1. Paper Identification

| Field | Value |
|-------|-------|
| **Paper** | Simple and Practical Amortized Sublinear Private Information Retrieval using Dummy Subsets |
| **Authors** | Ling Ren, Muhammad Haris Mughees, I Sun |
| **Year** | 2024 |
| **Venue** | CCS '24 |
| **ePrint** | 2023/1072 |
| **Group** | D -- Client Dependent Preprocessing |
| **Archetype classification** | Construction (primary) |
| **Filename** | `RMS24_2023_1072.pdf` |
| **Total pages** | 14 (all main body, no appendix) |

---

## 2. What SKILL.v0.md Got Right

### 2.1 Group-based routing (Section 0, Step 1) -- Effective

The routing table correctly directed me to Section 3.2 (PRF/symmetric-key notation) and Section 3.5b (Group D parameters) while telling me to skip Section 3.1 (Lattice/FHE notation). This was exactly correct for RMS24. The paper uses no FHE at all -- it is purely PRF/XOR-based with AES-128 as the PRF instantiation. Following the Group D row saved significant time by preventing me from hunting for ring dimensions, ciphertext moduli, or noise analysis that simply do not exist in this paper.

### 2.2 Archetype classification (Section 1) -- Straightforward

The "Construction" archetype signature ("Proposes a new PIR scheme with algorithms and benchmarks") matched perfectly. The paper presents two concrete constructions (two-server and single-server), complete pseudocode (Algorithms 1-5), correctness and privacy proofs, implementation in C++, and extensive benchmark tables. No secondary archetype was needed. The classification was unambiguous from the abstract alone.

### 2.3 Pass 0 structure scan (Section 2.1) -- Useful

Reading pages 1-2 first was valuable. The paper's structure was immediately clear: Section 1 (Introduction, pages 1-3), Section 2 (Model and Preliminary, page 3), Section 3 (Algorithms, pages 4-9), Section 4 (Evaluation, pages 10-12), Section 5 (Related Works, pages 12-14), Section 6 (Conclusion, page 14). The two-page scan revealed Table 1 (the asymptotic comparison) on page 2, which is exactly the kind of anchoring information Pass 0 is designed to surface.

### 2.4 Pass 3 before Pass 4 strategy -- Helpful

Reading the evaluation section (pages 10-12) before diving deep into the algorithms (pages 4-9) was genuinely helpful. Knowing that the two-server scheme achieves 34 KB communication and 2.7 ms computation at N=2^28 made it easier to understand WHY the dummy subset technique matters -- it eliminates the lambda-factor blowup that plagues competing schemes. The SKILL's advice to "anchor your reading of the construction" with evaluation results worked well here.

### 2.5 PRF/symmetric-key notation table (Section 3.2) -- Mostly relevant

Several entries from the Section 3.2 table were directly applicable:
- **PRF evaluation**: `PRF("select" || j || k)` and `PRF("offset" || j || k)` -- the paper uses exactly this convention with tagged PRF calls (page 5-6).
- **Parity / XOR**: `P = XOR_{i in S} DB[i]` -- central to the scheme.
- **Partition-based hints**: `S_j, h_j` -- the paper uses partition-based hint construction with sqrt(N) partitions.
- **Dummy subsets**: `D_j` -- this entry in Section 3.2 was clearly added FOR this paper, and it matches exactly.
- **Statistical security kappa** -- the paper uses lambda=80 for the computational security parameter.

### 2.6 Section 3.5b (Group D critical parameters) -- Good coverage

The checklist prompted me to look for set size, number of sets, word size, amortization window, and failure probability. The paper provides all of these:
- Set size: sqrt(N)/2 + 1 partitions per hint, one index per partition
- Number of hints M = lambda * sqrt(N) (main) + lambda * sqrt(N) (backup, single-server only)
- Word size: 8 bytes and 32 bytes tested
- Amortization: 0.5 * lambda * sqrt(N) queries (two-server), 0.4 * lambda * sqrt(N) queries (single-server)
- Failure probability: (1 - 1/(2*sqrt(N)))^{lambda*sqrt(N)} < e^{-lambda/2}

### 2.7 Table extraction guidance (Section 4) -- Well-structured

The priority ordering (complexity comparison tables first, then benchmarks, then parameters) matched the paper's structure. Table 1 (asymptotic comparison, page 2) is Priority 1. Tables 2 and 3 (benchmark results, pages 11-12) are Priority 2. The guidance to extract database parameters (N, w), hardware, and threading model was relevant -- the paper specifies AWS m5.8xlarge, single-threaded, and various (N, w) combinations.

### 2.8 Algorithm/pseudocode extraction guidance (Section 5) -- Applicable

The paper has 5 formal algorithms in "Algorithm X" format. The SKILL's advice to extract "algorithm name/number, inputs, outputs, key computational steps" worked well. The suggestion to note "highlighted lines = offline operations" was not applicable here (no color coding), but the general structure guidance was solid.

### 2.9 Correctness Analysis Option B (Section 6, template) -- Perfect fit

The template's "Option B: Probabilistic Correctness Analysis" section was precisely what was needed. The paper has:
- Failure mode: no hint contains the queried index
- Failure probability: e^{-lambda/2}
- Proof technique: Lemma 1 (each hint covers index i with probability >= 1/(2*sqrt(N))), then union bound over M hints
- Adaptive vs non-adaptive: supports adaptive queries (a key differentiator from Piano PIR)

### 2.10 Scheme name warning (Section 1) -- Appreciated but not triggered

The paper does not use a branded scheme name (it refers to itself as "our scheme" or "this paper" throughout). The SKILL warns about this pattern ("Papers with no branded name: organize by theorem number or construction number"). The filename "RMS24" is a community-assigned identifier from the authors' initials. This warning would be more useful if it explicitly listed RMS24 among the known mismatches.

---

## 3. What SKILL.v0.md Got Wrong or Was Lacking

### 3.1 Two-server vs. single-server variant handling -- Insufficient guidance

**Problem**: RMS24 presents TWO distinct schemes (two-server, Section 3.3; single-server, Section 3.4) that share a common hint construction (Section 3.1-3.2) but differ fundamentally in the offline phase, hint replenishment mechanism, and amortization properties. The SKILL's guidance for "Papers with multiple constructions" (Section 2.1, last paragraph) says: "apply Passes 2-4 to each construction. Shared preliminaries need only be read once." This is too vague for this paper.

**What was confusing**: The two variants share algorithms but have different algorithms for hint replenishment (Algorithm 3 for two-server, Algorithm 5 for single-server) and different offline algorithms (Algorithm 1 for two-server, Algorithm 4 for single-server). The SKILL does not help me decide how to organize notes for two variants that share the online algorithm (Algorithm 2) but diverge in offline phases. The "Variants" table in the template (Section 6) is designed for scheme variants like Spiral vs. SpiralStream, where variations are parameter-level. Here, the variants are structurally different protocols.

**Suggestion**: Add to Section 2.1's "Papers with multiple constructions" paragraph: "For papers presenting server-model variants (e.g., 2-server and 1-server versions of the same core idea), document the shared core construction once, then use the Variants table with columns for 'Server Model,' 'Offline Mechanism,' 'Amortization,' and 'Key Tradeoff.' Give each variant its own rows in Protocol Phases and Complexity tables rather than trying to merge them."

### 3.2 Missing notation: partition-based database structuring

**Problem**: Section 3.2 lists "Partition-based hints" and "Dummy subsets" but does not document the partition structure of the database itself. RMS24 divides the database into sqrt(N) equal-sized partitions of size sqrt(N) each, then builds hints by selecting one index from each of sqrt(N)/2 + 1 partitions. This "partition + sampling" structure is the foundation of the entire scheme but is not captured in the notation table.

**Suggestion**: Add to Section 3.2:

| Symbol class | Convention | Examples & context |
|-------------|-----------|-------------------|
| Database partitioning | DB divided into sqrt(N) partitions of size sqrt(N) | Partition k contains indices [k*sqrt(N), (k+1)*sqrt(N) - 1]. Used in TreePIR, RMS24, Piano |
| Partition membership | partition(i) = floor(i / sqrt(N)) | Maps index to partition number |

### 3.3 Cutoff/median-based partition selection -- Not documented

**Problem**: A key technique in RMS24 is the use of PRF-derived pseudorandom values and a median cutoff to deterministically select exactly sqrt(N)/2 partitions for each hint. The paper computes V_j = [v_{j,0}, ..., v_{j,sqrt(N)-1}] where v_{j,k} = PRF("select" || j || k), finds the median, and selects the half with values below the median. This cutoff-median technique is central to both space efficiency and membership testing, but the SKILL has no notation or building-block entry for it.

**Suggestion**: Add to Section 7.5 (building blocks table):

| Primitive | Used by | Role |
|-----------|---------|------|
| Median-cutoff partition selection | RMS24 | Deterministically selects exactly half of partitions using PRF values and their median; enables O(1) membership testing |

### 3.4 Pass 1 guidance for introduction length -- Slightly miscalibrated

**Problem**: Section 2.1 says Pass 1 should cover "Page 1 through end of Section 1 (may be 2-12 pages; theory papers and papers with technical overviews have long introductions)." RMS24's introduction runs pages 1-3 (about 2.5 pages) but packs in: (a) the CK20 blueprint and its leakage problem, (b) the dummy subset solution at a high level, (c) Table 1 (the main asymptotic comparison), (d) concrete performance numbers, (e) the distinction from Piano PIR's weaker correctness model. This is a construction paper with a moderately long intro that contains a crucial "overview of existing stateful PIR" subsection. The SKILL does not distinguish between theory papers with long technical overviews and construction papers with essential motivational context in the introduction.

**Suggestion**: Amend the Pass 1 description: "Construction papers may also have extended introductions (3-5 pages) when they include 'overview of existing approaches' or 'our techniques' subsections. Read these fully -- they often contain the clearest explanation of WHY the new technique works, which anchors the later formal treatment."

### 3.5 Correctness model distinction (standard vs. weaker) -- Template gap

**Problem**: A major contribution of RMS24 is achieving STANDARD PIR correctness (correctness holds for arbitrary, adaptively chosen query sequences) as opposed to Piano PIR's weaker model (requires queries to have no adversarial influence). The template's "Correctness model" field in the header table lists options but does not adequately capture this distinction. The options include "Conditional (requires non-adaptive queries)" which partially covers Piano's model, but there is no guidance on how to document the COMPARISON of correctness models between the paper's scheme and its competitors.

**Suggestion**: Add to the template header's correctness model field: "When the paper explicitly contrasts its correctness model against a weaker model used by competitors, note both: 'Standard (adaptive) -- vs. Piano's non-adaptive restriction.' This distinction is a primary contribution in papers like RMS24."

### 3.6 Amortization model nuances -- Underspecified

**Problem**: Section 3.5b says to record "Amortization window Q" and "Note whether amortization is unlimited, bounded, one-time, or per-window." RMS24 has a nuanced amortization model:
- Two-server: unlimited queries (hint replenishment is online, free amortization), but the offline phase runs once.
- Single-server: bounded to 0.4 * lambda * sqrt(N) queries before re-running the offline phase (which requires streaming the entire database).

The SKILL does not capture the distinction between schemes where the amortization bound triggers a lightweight refresh vs. a full database re-stream. This matters enormously for deployment.

**Suggestion**: Add to Section 3.5b: "**Refresh cost**: What happens when the amortization window is exhausted? Options: (a) lightweight online refresh (e.g., two-server hint replenishment), (b) full database re-stream (e.g., single-server backup hints exhausted), (c) re-run offline protocol with server. The refresh cost is often the practical bottleneck."

### 3.7 Privacy proof technique -- No template section

**Problem**: RMS24's privacy proof (Section 3.5) is elegant and concise: the dummy subset makes the bit vector b and offset vector r independent of the query index (Lemma 2: Pr(b | i) = Pr(b | i') for all i, i'). The SKILL's template has no dedicated section for privacy proof techniques. The "Cryptographic Foundation" section asks for hardness assumptions and the "Correctness Analysis" section covers correctness, but there is no analogous section for recording the privacy argument.

**Suggestion**: Consider adding a brief "Privacy Argument" sub-section to the template, at least for Group D PRF-based schemes where privacy proofs tend to be short and illuminating: "**Privacy mechanism**: <1-2 sentences: why the server learns nothing>. **Proof technique**: <e.g., statistical independence of query encoding from index, reduction to PRF pseudorandomness>."

### 3.8 Compact encoding vs. explicit subset sending -- Missing engineering detail

**Problem**: The paper describes an important optimization where instead of sending two explicit subsets S and S' (which would cost sqrt(N) * log(N) bits), the client sends a bit vector b (sqrt(N) bits) and an offset vector r (sqrt(N) * log(sqrt(N)) bits), reducing communication by roughly half. This kind of encoding optimization is a "portable optimization" but the SKILL's guidance does not prompt for it. The "Portable Optimizations" section exists in the template but there is no guidance on what to look for.

**Suggestion**: Add to Section 5 or as a note in the template's "Portable Optimizations" section: "Look for compact encodings of protocol messages. Papers often describe a natural but inefficient encoding first, then present a compact alternative. Document both the straightforward and compact encodings with their sizes."

### 3.9 Backup hints mechanism -- Underdocumented building block

**Problem**: The single-server scheme critically depends on "backup hints" (from Corrigan-Gibbs et al. [9]), where the client pre-downloads extra hints during the offline phase to use for hint replenishment without contacting the server. This is a reusable technique across Group D papers but is not listed in Section 7.5's building blocks table.

**Suggestion**: Add to Section 7.5:

| Primitive | Used by | Role |
|-----------|---------|------|
| Backup hints | CK20 (single-server), RMS24 (single-server), Piano | Pre-downloaded spare hints for client-local hint replenishment; converts 2-server schemes to 1-server at cost of increased client storage and bounded amortization |

### 3.10 Reading order for this specific paper was suboptimal

**Problem**: The default construction reading order (Pass 0 -> 1 -> 2 -> 3 -> 4) had me read the background (Section 2, page 3) before the evaluation (Section 4, pages 10-12), which was fine. But the paper's Section 3 (Algorithms) is really the core and should be read in a specific sub-order: Section 3.1 (overview and hint construction concept) -> Section 3.2 (details of partition selection and membership testing) -> Section 3.5 (correctness and privacy proofs) -> THEN Section 3.3 (two-server specifics) and Section 3.4 (single-server specifics). The SKILL's Pass 4 ("remaining construction/protocol sections") gives no guidance on internal ordering when a large construction section has interleaved sub-protocols and proofs.

**Suggestion**: Add to Section 2.1, Pass 4: "For papers with large construction sections (5+ pages), identify the internal structure first: look for a 'high-level overview' subsection, shared mechanisms, variant-specific subsections, and inline proofs. Read the overview and shared mechanisms first, then variant-specific sections, then proofs."

### 3.11 Section 5 (Related Works) contained critical technical insights -- Not flagged

**Problem**: The SKILL does not mention reading "Related Works" sections. For RMS24, Section 5 (pages 12-14) contains crucial technical comparisons, including a detailed analysis of WHY TreePIR's approach of invoking a single-server FHE-based PIR to mitigate response overhead is impractical (NTT preprocessing on sqrt(N) entries would cost 1100ms, slower than running Spiral on the full database). This is not just background -- it is an engineering insight that belongs in the notes. The SKILL's reading passes skip Related Works entirely.

**Suggestion**: Add to Section 2.1: "**Pass 5 (optional) -- Related Work**: For papers that contain detailed technical comparisons in their Related Work section (not just citation lists), scan for quantitative arguments about why alternative approaches fail. These often contain valuable engineering insights. Flag 'Related Work' sections that exceed 1.5 pages as likely containing technical depth."

---

## 4. Specific Improvement Suggestions (with proposed wording)

### 4.1 Section 0, Step 1 table -- Add "two-server" note for Group D

Current: "PRF-first; use Section 3.5b for Group D parameters"

Proposed: "PRF-first; use Section 3.5b for Group D parameters. **Many Group D papers present both 2-server and 1-server variants** -- document shared core once, then variant-specific offline/replenishment separately."

### 4.2 Section 1 scheme name warning -- Add RMS24

Add to the known mismatch list:
"- **RMS24** -- paper has no branded scheme name; referred to as 'our scheme' or 'this paper' throughout."

### 4.3 Section 3.2 -- Add "compact bit-vector encoding"

Add row:

| Compact request encoding | b in {0,1}^{sqrt(N)}, r in [sqrt(N)]^{sqrt(N)} | Bit vector b encodes subset membership; offset vector r encodes index within partition. Used in RMS24 to halve request size vs. explicit subset encoding. |

### 4.4 Section 7.3 -- Update RMS24 lineage description

Current (last line of Sublinear server paragraph): "RMS24 (2024, dummy subsets, standard correctness)."

Proposed: "RMS24 (2024, dummy subsets for leakage elimination, achieves standard adaptive correctness without parallel repetition, partition-based hints from TreePIR with novel median-cutoff selection and compact encoding)."

### 4.5 Section 7.4 -- Add "correctness guarantee strength" as a metric

Add to the key performance metrics list:
"- **Correctness guarantee** -- Standard (adaptive queries) / Non-adaptive only / Requires parallel repetition. A critical differentiator within Group D; stronger correctness often comes at efficiency cost."

---

## 5. New Patterns or Template Sections Suggested

### 5.1 "Server Model Variants" structured comparison

For papers presenting both k-server and 1-server versions (RMS24, CK20, potentially TreePIR), the template would benefit from a structured side-by-side:

```markdown
## Server Model Variants
| Property | Two-Server | Single-Server |
|----------|-----------|---------------|
| Offline mechanism | Dedicated offline server | Client streams entire DB |
| Hint replenishment | Online (offline server computes new hint) | Local (consume backup hint) |
| Amortization | Unlimited (modulo offline phase) | Bounded: 0.4*lambda*sqrt(N) queries |
| Response overhead | O(1) (constant, 4x) | O(sqrt(N)/lambda) amortized |
| Client storage | O(lambda*sqrt(N)) | O(lambda*sqrt(N)) (main + backup) |
| Trust model | 2 non-colluding servers | Single server |
```

### 5.2 "Leakage Analysis" section for Group D papers

Many Group D papers analyze what information the server learns from the client's queries. RMS24's core contribution is eliminating the leakage present in the CK20 blueprint (server learns which partition the queried index does NOT belong to). A template section for this would be:

```markdown
## Leakage Analysis
| Baseline scheme | Leakage | This paper's mitigation |
|----------------|---------|----------------------|
| CK20 blueprint | Server learns queried index is not in sqrt(N)/2 partitions | Dummy subset covers remaining partitions; server cannot distinguish real from dummy |
```

### 5.3 Guidance on "streaming offline phase" documentation

RMS24's single-server offline phase (Algorithm 4) processes the database in a single streaming pass, partition by partition. The SKILL mentions "Note whether offline phase is streaming (single pass over DB) or random-access" in Section 5 (protocol flow diagrams), but does not provide guidance on WHAT to record about streaming phases. Suggest adding:

"For streaming offline phases, record: (a) streaming order (e.g., partition-by-partition), (b) memory required during streaming (beyond final hint storage), (c) whether streaming is parallelizable, (d) total data volume streamed (may exceed DB size if multiple passes)."

---

## 6. Summary Assessment

SKILL.v0.md was **largely effective** for guiding the reading of RMS24. The Group D routing, PRF/symmetric notation focus, and construction reading order all worked well. The template's probabilistic correctness analysis (Option B) was a precise fit. The main gaps are:

1. **Multi-variant papers** (two-server vs. single-server) need more structured guidance than the current "apply Passes 2-4 to each construction" advice.
2. **Partition-based database structuring** and **median-cutoff selection** are missing from the notation and building-block tables despite being central to multiple Group D papers.
3. **Privacy proof techniques** have no dedicated template section, even though they are often the most elegant and concise part of Group D papers.
4. **Related Works sections** with technical depth (like RMS24's Section 5) are systematically skipped by the reading passes, losing engineering insights.
5. **Correctness model comparison** (standard vs. weakened models) is a key differentiator within Group D but the template does not prompt for it prominently.

Overall confidence that SKILL.v0.md would produce good engineering notes for this paper: **7/10**. The notes would capture the scheme's mechanics and performance, but would likely underemphasize the correctness model distinction (the paper's primary theoretical contribution) and miss the engineering insights buried in Related Works.
