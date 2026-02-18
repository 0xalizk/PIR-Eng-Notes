---
name: pir-paper-analyzer
description: Read PIR research paper PDFs and produce structured engineering notes covering scheme design, complexity, tradeoffs, and reported asymptotics and benchmarks
---

# PIR Paper Analyzer

Produce engineering notes from PIR (Private Information Retrieval) research paper PDFs. Notes should be detailed enough for a cryptography engineer to understand the construction, the primitives, and build a reference implementation. Be concise. Produce footnotes supporting your statements. 

---

## 0. Quick-Start Router

Before reading, determine the paper's **group** and **archetype** to route yourself efficiently.

### Step 1 — Identify the group (from the directory path)

| Group | Notation focus | De-prioritize | Reading notes |
|-------|---------------|---------------|---------------|
| **A — FHE-based** | §3.1 (Lattice/FHE) | §3.2, §3.3 | Full FHE template. Pre-2017 papers (XPIR) may use NTRU or additive-only HE — skip post-2017 notation rows (RGSW, gadget decomposition, automorphisms) if N/A. |
| **B — Stateless single-server** | §3.1 (Lattice/FHE) | §3.2, §3.3 | Identify sub-model first (see below). |
| **C — Client-independent preprocessing** | §3.1 (often plain LWE) | §3.2, §3.3 | Many use plain LWE — skip RLWE/GSW notation if so. DEPIR papers (BarelyDoublyEfficient) are theory/feasibility results. |
| **D — Client-dependent preprocessing** | §3.2 (PRF/symmetric) | §3.1 (unless paper uses FHE) | PRF-first; use §3.7b for Group D parameters. **Not all Group D schemes have probabilistic correctness** — check whether deterministic (SinglePass, WangRen) or probabilistic (Piano, RMS24, CK20). |
| **X — Variants & Surveys** | Varies — see per-paper routing below | Check archetype first | Per-paper routing: **KeywordPIR** → §3.1 + number-theoretic; **DistributionalPIR** → §3.1 + §3.6; **CGKS Survey** → §3.3 + coding theory |

**Group B sub-models** (identify during Pass 0):

| Sub-model | Offline communication | Examples |
|-----------|----------------------|----------|
| **Hintless** | None — no offline phase at all | YPIR, HintlessPIR |
| **CRS / query-bundled** | Keys/parameters from CRS or sent per-query | WhisPIR, InsPIRe |
| **Public-parameter upload** | Client sends public key material offline (not secret-dependent) | NPIR, Spiral |
| **Client-hint upload** | Client uploads secret-key-dependent evaluation keys offline | Pirouette, VIA-C, Respire |

### Cross-group filing exceptions

Some papers are filed in one group but functionally belong to another. Route by function, not directory:

| Paper | Filed in | Route as | Reason |
|-------|----------|----------|--------|
| FrodoPIR | Group A | **Group C** | Plain LWE with client-independent global hint |
| ThorPIR (FHEPIR_2024) | Group A | **Group A + D** | Client-dependent FHE preprocessing |
| VIA-C variant | Group B | **Group B/C border** | Has offline communication (client-hint upload) |
| BarelyDoublyEfficient | Group C | **Group C (theory)** | DEPIR feasibility result — no implementation |

### Step 2 — Classify the archetype (§1) and select reading path (§2)

| Archetype | Reading path | Template base |
|-----------|-------------|--------------|
| Construction | §2.1 (default) | Full template (§6) |
| Construction (theory-only) | §2.1b | Full template minus Performance Benchmarks, Implementation Notes |
| Theory | §2.2 | Full template minus Performance Benchmarks, Implementation Notes; add Lower Bounds |
| Survey | §2.3 | Survey template (§6.1) |
| System | §2.5 | Full template + System Context + System-Level Metrics |
| Building-block | §2.6 | Full template + expanded Novel Primitives |
| Engineering optimization | §2.7 | Full template + Optimization Catalog |
| Model/definition | §2.8 | Full template + Formal Definitions |
| Security upgrade | §2.9 | Full template + Formal Security Properties + Verification Details |
| Update/maintenance | §2.10 | Full template + Update Metrics + Mutation Model |
| Compiler/framework | §2.8 + adaptations | Full template + Compiler Interface |
| Feasibility | §2.1b + adaptations | Full template minus Benchmarks; emphasize theoretical contribution |
| Comparison / multi-paradigm | §2.1 per construction | Full template + Cross-Paradigm Comparison |

### Step 3 — Follow the Quick Start

1. Locate the PDF: use `Glob` with `Papers/**/*.pdf` or a specific group path.
2. **Classify the paper** (§1) — identify archetype(s) before reading.
3. Read pages 1–2 to identify section structure and total page count (Pass 0). If section headings are not visible (common for papers with 5+ page introductions), scan pages at intervals (e.g., 5, 10, 15) to find section boundaries.
4. Follow the reading strategy for the paper's archetype (§2).
5. Extract notation, tables, figures, and protocol structure per §§3–5.
6. Produce engineering notes using the **output template in §6**. Produce footnotes to support statements about the scheme.
7. Write output to `<scheme>_<year>_notes.md` (lowercase scheme name, publication year) in the same directory as the paper's PDF. Example: `spiral_2022_notes.md`, `sealpir_2018_notes.md`.
8. Run the validation checklist (§8) before finalizing.

**Tool notes:**
- Use `Read` with the `pages` parameter. Hard limit: **20 pages per call**. Use 10–15 page chunks.
- Use `Write` to save completed notes. Use `Glob` to discover papers.

---

## 1. Paper Classification

Before reading, identify the paper's **archetype(s)**. Check the abstract and first page.

### Archetype table

| Archetype | Signature | Template adaptation |
|-----------|-----------|-------------------|
| **Construction** | Proposes a new PIR scheme with algorithms and benchmarks | Full template (default) |
| **Construction (theory-only)** | Proposes a new PIR scheme with proofs/pseudocode but NO implementation or benchmarks | Full template minus Performance Benchmarks and Implementation Notes. Use "N/A (no implementation)" in Concrete columns. Extract analytical estimates from inline text. If the paper has concrete parameter analysis (but no running code), add "Estimation Methodology" section. |
| **Feasibility** | Demonstrates that something is possible (first construction in a model) rather than practical performance | Full template minus Benchmarks. Emphasize model, assumptions, and theoretical contribution. Note: feasibility results often have large concrete costs. |
| **Theory** | No implementation/benchmarks; proves asymptotic bounds, lower bounds, or feasibility results | Skip Performance Benchmarks, Implementation Notes. Add Lower Bounds section. Use theory reading path (§2.2). |
| **System** | PIR embedded in a larger application (e.g., Addra voice-call system) | Add System Context section. Add System-Level Metrics table. Extract application constraints that drove PIR design. Use §2.5. |
| **Engineering optimization** | Faster implementation of a known scheme (e.g., OnionPIRv2) | Add Optimization Catalog (known techniques vs novel). Use §2.7. |
| **Building-block** | Primary contribution is a cryptographic primitive; PIR is the application | Add expanded Novel Primitives section. Document the primitive independently. Use §2.6. |
| **Security upgrade** | Adds a security property (e.g., verifiability) to an existing scheme | Expand Security Model. Add Formal Security Properties + Verification Details. Use §2.9. |
| **Model/definition** | Defines a new PIR variant or model (e.g., Distributional PIR, DEPIR) | Add Formal Definitions section. Document the model independently. Use §2.8. |
| **Compiler/framework** | Black-box transformation applicable to multiple schemes | Document compiler interface (input/output/preserved properties/overhead). Separate compiler from instantiation. |
| **Update/maintenance** | Adds update mechanisms to existing schemes (e.g., IncrementalPIR, IncPIR) | Add update-specific metrics, Mutation Model. Document composability with base schemes. Use §2.10. |
| **Survey** | Reviews multiple schemes, may prove no new constructions | Use survey template (§6.1). Use §2.3. Sub-types: *pedagogical* (textbook-style with full proofs, e.g., CGKS), *SoK* (systematization of knowledge), *brief* (short overview). |
| **Comparison / multi-paradigm** | Compares multiple approaches to the same problem (e.g., KeywordPIR comparing SealPIR, MulPIR, Gentry-Ramzan) | Apply per-construction Passes 2-4. Add Cross-Paradigm Comparison section. |

### Multi-archetype papers

Many papers span 2–3 archetypes (e.g., Construction + Building-block, Model/definition + Construction + Compiler/framework).

**Template composition rules:**
1. If the paper has benchmarks or concrete pseudocode, use the **full Construction template as the base**.
2. **Add** the template adaptations from each secondary archetype (they stack, not replace).
3. For dual-contribution papers (e.g., System + Construction with independent contributions), organize the notes with clear top-level headings separating the contributions.
4. When in doubt about primary archetype, classify based on what the paper's abstract emphasizes.

**Reading-path composition rules** (NEW — these govern reading ORDER, not template):
1. When secondary archetype is **Building-block**: use §2.6 primitive-first ordering for primitive sections; use default ordering for PIR application sections.
2. When secondary archetype is **Update/maintenance**: read update mechanism before evaluation (§2.10 ordering).
3. When secondary archetype is **Security upgrade**: read formal security model before evaluation (§2.9 ordering).
4. For **4+ archetypes**: organize by contribution. Apply each archetype's reading path to its respective portion of the paper. Do not try to merge 4 reading orders.
5. For **Construction (theory-only) + Building-block**: extended Pass 1 → primitive definition (§2.6) → construction → skip Pass 3.

### Scheme name warning

Many filenames use community-assigned names that do not appear in the paper. Always verify the scheme name from the paper itself. Known mismatches:
- **XPIR-2014** (Doroz, Sunar, Hammouri, ePrint 2014/232) — NTRU-based; paper calls itself "Bandwidth efficient PIR"
- **XPIR-2016** (Aguilar-Melchor et al., ePrint 2014/1025) — Ring-LWE-based; paper calls itself "XPIR: Private Information Retrieval for Everyone." **These are two different papers with different authors and techniques.**
- **FastPIR** (Addra, ePrint 2021/044) — Uses one-hot selection vectors (NOT equality operators). Paper calls the PIR scheme "FastPIR" in the context of the Addra system.
- **CwPIR** (ePrint 2202.07569) — Uses constant-weight equality operators. Paper uses "CwPIR." **FastPIR and CwPIR are different schemes with different approaches.**
- **MulPIR** — paper does not use the name "MulPIR"
- **OnionPIRv2** — filename may say "FHEPIR_2025"
- **IshaiShiWichs** — paper has no single scheme name; multiple unnamed constructions
- **WangRen** — paper has no branded scheme name
- **RMS24** — paper does not use "RMS24"; community name from author initials
- Papers with no branded name: organize by theorem number or construction number.

---

## 2. PDF Parsing Strategy

### 2.1 Construction papers (default reading order)

| Pass | What to read | What to extract |
|------|-------------|-----------------|
| **0 — Structure scan** | Pages 1–2 (expand to pages 5, 10, 15 if section headings not visible — common for papers with 5+ page introductions) | Section headings, page ranges, total length, appendix length. Plan which pages to read for each pass. |
| **1 — Abstract + Intro** | Page 1 through end of Section 1 (may be 2–12 pages; theory papers and papers with technical overviews have long introductions — read the full intro) | Scheme name, year, core contribution, claimed improvements, threat model. **Toy protocol / technical overview:** Look for sections titled "Technical Overview," "Our Techniques," "Intuition," or "Warmup." Read these carefully — they are often the most accessible description of the construction and explain WHY each design decision was made. Extract toy protocols as standalone mini-constructions. |
| **2 — Background + Building Blocks** | From start of background/preliminaries section through start of core construction. Look for sections titled "Preliminaries," "Background," "Building Blocks," "Our Techniques," "Definitions," or equivalent. Include novel subroutines between preliminaries and main construction. For "Box" / modular presentations, scan Box interfaces during this pass. | Notation definitions, cryptographic building blocks, PIR definition used, novel sub-protocols. For PRF-only Group D papers with no "Preliminaries" section, merge Pass 2 into Pass 1. |
| **3 — Evaluation** | **Locate by section title** — search for "Evaluation," "Experiments," "Implementation," "Performance," "Benchmarks," or "Comparison." Do NOT rely on page position. If no evaluation section exists, extract analytical estimates from theorem statements and inline text. | Performance tables, parameter choices, benchmark hardware, comparison data |
| **4 — Core scheme** | Remaining construction/protocol sections | Algorithms (pseudocode), data structures, protocol phases, security claims |

**Pass 3/4 ordering — read evaluation before core scheme by default**, with these **exceptions**:
1. **Theory-only papers** (no evaluation section): skip Pass 3; extract complexity from theorem statements during Pass 4.
2. **Multi-construction papers** where evaluation references construction-specific terminology: read each construction (Pass 4) then its evaluation (Pass 3) in sequence.
3. **Simple-construction papers** where the construction is ≤3 pages: read construction first — the insight IS the construction.
4. **Tightly-coupled papers** where evaluation uses algorithm/data-structure names defined in the construction: read Pass 4 before Pass 3. Indicators: evaluation has forward-references, parameter tables use construction-specific quantities.
5. **Building-block papers** (§2.6): read the primitive's definition before its evaluation.

**Page range guidance:** Scale proportionally for paper length. For papers with merged sections or non-standard structure, locate sections by heading rather than page number. Count main-body pages separately from appendix pages.

**Short papers (<15 pages):** For papers under 15 pages with simple structure, a linear reading (Pass 0 → full read front-to-back) may be more efficient than the multi-pass approach. Use the pass structure primarily for note organization.

**Papers with multiple constructions:** When a paper presents 2+ constructions:
- **Independent constructions** (different models/assumptions): apply Passes 2–4 to each. Shared preliminaries need only be read once.
- **Compositional/layered constructions** (each builds on prior): read bottom-up; carry forward understanding from lower layers.
- **Incremental variants** (base + improvements): read base construction first, then each delta. Use Variants table for differences.

### 2.1b Construction (theory-only) papers

For papers that propose new constructions with proofs and pseudocode but NO implementation or benchmarks:
- **Pass 1 extended:** Often have 5–12 page introductions with technical overviews and toy protocols. Read the full introduction.
- **Pass 2:** As default.
- **Skip Pass 3.** Instead, extract complexity from theorem statements and any asymptotic comparison table (check the introduction, "Our Results" subsection, and pages 3–8).
- **Pass 4:** Prioritize (1) formal definitions, (2) main constructions / theorem statements, (3) proof techniques (skip mechanical steps), (4) lower bounds if present.
- If the paper has **concrete parameter analysis** without running code, add an "Estimation Methodology" section documenting search space, cost model, and stated estimates.

### 2.2 Theory papers (no implementation)

Skip Pass 3 (no benchmarks exist). Replace with:
- **Pass 3-alt:** Read the **asymptotic comparison table** if one exists (check pages 3–8 and any "comparison" or "our results" subsection). If no comparison table, extract bounds from theorem statements. Also read **lower bound results** (often near end of main body).
- **Pass 1 extended:** Theory papers often have 8–12 page introductions with technical overviews and toy protocols. Read the full introduction.
- **Pass 4:** Prioritize (1) formal definitions, (2) main constructions / theorem statements, (3) proof techniques (skip mechanical details), (4) lower bounds.
- **Information-theoretic papers:** May use entirely different notation (bit-string databases, communication complexity pairs). See §3.3.
- **For 4+ archetype papers** (e.g., CK20): organize by contribution rather than trying to merge reading paths. Apply each archetype's path to its portion.

### 2.3 Survey papers

- **Pass 0 expanded:** Scan pages 1–3 (surveys often have long preambles). Identify scope, covered models, and time period.
- **Pass 1:** Identify the scope (which PIR models, which time period, which techniques). For pedagogical surveys with full proofs, note which constructions are given in detail.
- **Pass 2:** Extract formal model definitions (how many servers, what privacy means, what complexity measures). Look for "KEY IDEA" annotations and extract them verbatim.
- **Pass 3:** Extract the comparison/summary table of schemes covered. For theory-heavy surveys, read constructions BEFORE lower bounds (lower bounds reference constructions).
- **Pass 4:** Extract key upper/lower bounds, implication chains between PIR and other primitives, and open problems.
- **Pass 5 (if applicable):** Read "Commentary," "Reflections," or "Open Problems" sections.

For long surveys (30+ pages), subdivide Pass 3–4 into: (a) construction families, (b) model variants, (c) implications/connections, (d) lower bounds.

### 2.4 Appendix handling

- **Trigger:** Any paper with 5+ pages of appendices, OR any paper where the appendix contains algorithms/pseudocode.
- **Always read:** Extended evaluation tables, pseudocode of algorithms, parameter selection, sample code, sections that introduce NEW constructions or alternative protocol variants (e.g., MulPIR Appendix A contains a complete alternative PIR scheme; CK20 Appendix G introduces Sparse DPFs).
- **Read selectively:** Deferred efficiency proofs that establish key performance claims. Security proofs of novel primitives when the primitive IS the contribution (e.g., VeriSimplePIR's VLHE proofs). Remarks in appendices.
- **Skip:** Routine security reductions, standard definitions reproduced from other papers, mechanical proof steps.
- **Appendix-as-specification:** When the main body has <3 pages of construction but the appendix has 5+ algorithms (e.g., Pirouette, Respire), the appendix IS the specification. Treat Pass 4 as two phases: (a) main body for protocol overview and parameter tables; (b) appendix algorithms in call order. Cross-reference parameter tables while reading appendix algorithms.

### 2.5 System papers

- **Pass 0–1:** As default. Identify the application, its constraints, and where the PIR contribution fits.
- **Pass 1b:** Read the system design section (goals, threat model, architecture) to extract application-driven constraints on the PIR scheme (e.g., latency budget, user count, bandwidth limits).
- **Pass 2–4:** Apply the Construction reading order (§2.1) to the PIR-specific sections only. Adjust page ranges — PIR content may not start until page 5+.
- **Pass 5:** Read system-level evaluation (end-to-end latency, scalability, resource consumption) separately from PIR microbenchmarks.

### 2.6 Building-block papers

- **Pass 0–1:** As default.
- **Pass 2:** Read the primitive's formal definition, algorithms, and interface BEFORE its evaluation. This differs from the default order (Pass 3 before Pass 4) because primitive evaluations reference primitive-specific concepts.
- **Pass 3a:** Read the primitive's standalone evaluation (if it exists separately from the PIR evaluation).
- **Pass 3b:** Read the PIR application evaluation.
- **Pass 4:** Read the full PIR protocol that uses the primitive.
- For papers with **multiple novel primitives** (e.g., InsPIRe), read each primitive in order of increasing complexity, then the constructions that use them.

### 2.7 Engineering optimization papers

- **Pass 0–1:** As default. Focus on identifying which prior scheme is being optimized and what bottleneck is targeted.
- **Pass 2:** Briefly review the prior scheme's structure (the paper usually summarizes it). Focus on what changed. If the optimized scheme uses a different FHE scheme from the predecessor (e.g., WhisPIR uses BGV instead of Spiral's Regev+GSW), read the new scheme's basics.
- **Pass 3:** Read evaluation — this is usually the paper's most important section. Extract speedup factors and identify which phases improved.
- **Pass 4:** Read the optimization techniques. Build an **Optimization Catalog** distinguishing "known techniques incorporated" (from other domains) vs. "novel optimizations" (new to this paper).
- **Warm-up / strawman protocols:** Many engineering papers present simplified versions first (e.g., OnionPIRv2 Section 3.1). Identify these — they show what baseline the paper improves upon.

### 2.8 Model/definition and Compiler/framework papers

- **Pass 0–1:** As default. Identify the new model or compiler being defined.
- **Pass 2:** Read formal definitions carefully — they ARE the contribution, not preliminaries. Extract the model's syntax, security/correctness notions, and relationship to standard PIR.
- **Pass 3:** If the paper has instantiations with benchmarks, read the evaluation.
- **Pass 4:** Read constructions/instantiations. For compiler papers, extract the compiler interface (input, output, preserved properties, overhead, instantiations evaluated).

### 2.9 Security upgrade papers

- **Pass 0–1:** As default. Identify the base scheme being upgraded and the new security property.
- **Pass 2:** Read the formal security model and definitions EARLY — they are the primary contribution.
- **Pass 3:** Read evaluation, focusing on overhead vs. base scheme (not absolute performance).
- **Pass 4:** Read the upgrade construction. Extract what changed from the base scheme.
- Extract: verification mechanism, soundness definition, overhead breakdown per phase, honest-vs-malicious assumptions.

### 2.10 Update/maintenance papers

- **Pass 0–1:** As default. Identify the base scheme and the update model (insert/delete/modify).
- **Pass 2:** Read the base scheme summary (the paper usually provides one). Understand what structures need updating.
- **Pass 3-reordered:** Read the update mechanism BEFORE the evaluation. For update papers, the evaluation compares with/without updates — you need to understand the mechanism first.
- **Pass 4:** Read the full protocol including update algorithms. Extract mutation types, cost per update, aggregation thresholds, deletion semantics.
- **Scenario-based evaluation:** Update papers often evaluate under different update patterns (append-only, random deletions, burst updates). Extract each scenario.

### 2.11 Related Works (optional scanning pass)

For papers whose Related Work section exceeds 1.5 pages, scan for:
- Quantitative arguments about why alternative approaches fail
- Engineering insights not found elsewhere in the paper
- Precise comparisons with concurrent work

### Common PDF parsing pitfalls
- **Subscript/superscript stacking:** Verify both are present (e.g., R_q^{n×m} must have both q and dimensions).
- **Calligraphic vs. bold vs. italic:** A (calligraphic, adversary) vs **A** (bold, matrix) vs _A_ (italic, set).
- **Bracket types:** ⌊x⌋ (floor), ⌈x⌉ (ceiling), ⌊x⌉ (round-to-nearest).
- **Multi-level subscripts:** Papers like VIA use R_{n_1,q_1}, theta_{ctrl,1}. Verify each subscript level.
- **Chart data:** Prefer table values over chart readings. For chart-derived values, report ranges and mark as "approximate."
- **Log-scale charts:** Halfway between 10² and 10³ ≈ 300, not 550. Check axis labels carefully.

---

## 3. Mathematical Expression Extraction

Rely on Claude's native PDF math rendering. Extract expressions directly from the visual representation.

**Group-based routing:** Consult §0 to determine which subsections to read. Group A/B/C papers primarily need §3.1. Group D papers primarily need §3.2. Theory/survey papers may need §3.3. All papers benefit from §3.4 and §3.7.

### 3.1 Lattice/FHE notation (Groups A, B, most of C)

| Symbol class | Convention | Examples & context |
|-------------|-----------|-------------------|
| Vectors | bold lowercase | **v**, **e**, **s** |
| Matrices | bold uppercase | **A**, **D**, **G** |
| Polynomial rings | Z_q[x]/(x^d + 1) or Z_q[x]/(x^n + 1) | R_q, R_{d,q}. WARNING: ring dimension variable varies — `d` or `n`. Always check. |
| Ciphertext structure | varies by scheme | **Scalar Regev:** (**a**, b) ∈ Z_q^n × Z_q; **Matrix Regev:** C ∈ R_q^{(n+1)×n}; **BFV/BGV:** (c_0, c_1) ∈ R_q^2; **GSW/RGSW:** matrix C ∈ R_q^{2m×2}; **NTRU encoding:** c = h·m + e mod q (where h is public key, f^{-1} factor may be implicit); **NGSW encoding:** NTRU analog of GSW; **RLWE' (Gadget RLWE):** encryptions under the gadget vector, used in external products; **Non-compact BGV:** may have >2 components |
| Error distributions | χ (generic), D_{Z,σ} (discrete Gaussian), {-1,0,1} (ternary) | χ_s, χ_e for secret/error; σ for width; ternary for FrodoPIR/FrodoKEM-derived |
| Gadget decomposition | g_z = [1, z, z², …, z^{t−1}]; G = I_n ⊗ g^T | G^{−1}(C) = base-z decomposition. NOTE: a single scheme may use **multiple decomposition bases** with different roles (e.g., z_coeff, z_conv, z_GSW in Spiral). |
| Norms / noise tracking | ‖·‖_∞, ‖·‖_2, ψ_2 (subgaussian), ψ_1 (sub-exponential), Err(ct), θ (variance parameter) | Correctness: ‖e‖_∞ < q/2p. Papers may use **variance-based (σ², θ)**, **worst-case (‖·‖_∞)**, or **sub-Gaussian parameter** tracking. Spiral/VIA/Respire use θ or Err() notation for cascaded noise. |
| Security parameter | λ (lambda) or k | Typically 128 bits, but some papers target other levels (e.g., VIA at 110-bit). WARNING: some papers use k instead of λ. |
| Database | DB or **D**, N elements of w bits each | DB[i], |DB| = N. Some theory papers use n-bit string x ∈ {0,1}^n (n = N·w). Some papers use m for N. |
| Moduli | q (ciphertext), t or p (plaintext) | Multi-modulus schemes use q_1, q_2, ..., q_k with different ring dimensions. Composite moduli: Q = q·q'. Scaling: Δ = ⌊q/p⌋. Some papers use f = ⌈q/p⌉. |
| Rounding | ⌊·⌉_p, ⌊·⌋, ⌊·⌉_{q,p} | ⌊·⌉_{q,p}: lift x ∈ Z_q, output ⌊p/q · x⌉ ∈ Z_p |
| Encoding vs encryption | "encoding" (noisy, may not decrypt) vs "encryption" (decryptable) | **Important distinction:** Spiral uses "encoding" for Regev values that satisfy weaker conditions than full ciphertexts. Affects correctness conditions and composability. |
| NTT domain | â (hat) for evaluation domain; a for coefficient domain | â = NTT(a). Critical for preprocessing optimizations and NTT-domain database storage. |
| Slot encoding | encode_p, decode_p | Isomorphism Z_p^n ↔ R_{n,p} for RLWE plaintext slots |
| Automorphisms / permutations | τ_g, σ^(π), swk_π | Galois automorphisms for query expansion and ciphertext rotation. Also called "substitution" operations in some papers (e.g., SealPIR). |
| Alpha/beta decomposition | α (public component), β (secret component) | Used in composable preprocessing (HintlessPIR). α depends only on public randomness; β depends on the secret key. |
| Negacyclic / anticirculant matrix | N(**a**) | Matrix form of polynomial multiplication in Z_q[x]/(x^n+1). Used in YPIR. Also called "anticirculant matrix." |
| MLWE (Module-LWE) | rank m, module dimension m×n | Bridges LWE (m=1) and RLWE (n=1). Parameterized by module rank m. Used in VIA. |
| High-precision LWE | Large plaintext modulus (e.g., 25-bit) with small ciphertext modulus (e.g., 32-bit) | Used in Pirouette for compact queries. Noise margin is very tight. |

**Plain LWE vs RLWE:** For papers using plain LWE (SimplePIR, DoublePIR, FrodoPIR), ring-specific notation (NTT, automorphisms, slot encoding) does not apply. Focus on matrix-vector operations, the LWE dimension n, and the modulus q.

**Pre-2017 papers (XPIR):** May use NTRU, additive-only homomorphism, modulus chains (not gadget decomposition), and Hermite factor security estimation (not Lattice Estimator). Skip post-2017 notation rows if N/A.

### 3.2 PRF/symmetric-key notation (Group D, some Group C)

| Symbol class | Convention | Examples & context |
|-------------|-----------|-------------------|
| PRF keys | sk, msk | sk_i for i-th hint's PRF key; msk for master key |
| PRF evaluation | PRF_sk(j) or PRF(msk, tag ‖ j) | Output domain varies per scheme |
| PRP | π_sk(i) | Pseudorandom permutation for load balancing (Piano). Small-domain PRPs also used (WangRen). |
| Pseudorandom sets | Set(sk) | Set of indices generated by key sk |
| Chunk function | chunk(i) = ⌊i/√n⌋ | Maps index to chunk |
| Parity / XOR | p = ⊕_{i∈S} DB[i] | XOR of database entries at set indices |
| Statistical security | κ (kappa) | Separate from computational λ; typically 40 bits |
| Puncturable PRF | (Gen, Punc, Eval) | Key can be punctured at a point; used in CK20, Plinko |
| Invertible PRF | (Gen, Eval, Invert) | PRF that can be inverted with the key; used in Plinko |
| Random permutations | Fisher-Yates shuffle | Seed-compressed permutations for preprocessing (SinglePass) |
| Partition-based hints | S_j, h_j | Subsets of DB indices with precomputed parities; used in RMS24, Piano |
| Dummy subsets | D_j | Non-functional subsets for privacy; used in RMS24 |
| Hypergeometric distribution | Hyp(N, K, n) | Sampling without replacement; correctness analysis in IncPIR |
| Hint table | H[i][j] | Matrix of precomputed parities; rows = queries, columns = sets |
| Permutation notation | P_N, p_i, p_i^{-1}, swap(i,j) | Full permutations over [N]; used in SinglePass |
| Relocation / consumption | consumed(i), relocate(i→j) | Data structure operations for maintaining hints after queries; used in WangRen |
| Partition structuring | median-cutoff, block size B | Database partitioning strategies for hint construction |

### 3.3 Multi-server and theory notation

| Symbol class | Convention | Examples |
|-------------|-----------|---------|
| Server count | k | k-DB PIR, k ≥ 2 |
| Database (bit-string) | x ∈ {0,1}^n | n = total bits; DB[i] retrieves i-th bit |
| Communication complexity | (α(n), β(n)) | α = query length, β = answer length per server |
| XOR | ⊕ | Core operation for information-theoretic PIR |
| lg | log₂ | Common in theory papers |
| Number-theoretic | QR (quadratic residuosity), Φ-hiding | Used in foundational constructions (CGKS survey, Gentry-Ramzan KeywordPIR) |
| Coding theory | Covering codes, Hamming distance | Used in multi-server IT-PIR constructions (CGKS survey) |
| Set-theoretic | cross-product sets, planar sets | Used in IshaiShiWichs constructions |

### 3.4 Complexity notation

- **Standard Big-O:** O(N), O(√N), O(N · poly(λ))
- **O_λ():** Hides poly(λ) factors. Definition: f(n,λ) = O_λ(g(n)) means f(n,λ) = O(g(n) · poly(λ)). Common in Group D.
- **Soft-O:** Õ(f) = O(f · polylog(f)). WARNING: some papers define Õ as hiding polylog(n) rather than polylog(f). Always check the paper's definition. Also Ω̃ for lower bounds.
- **Concrete:** "64 KB query", "3.6× response overhead", "149 MB/s throughput"
- Always note whether asymptotic expressions hide poly(λ) or polylog factors.
- **"More precisely" footnotes:** Some papers state simplified bounds in theorems but provide tighter bounds in footnotes or remarks. Check for these.

### 3.5 SIS / commitment notation (for verifiable PIR)

| Symbol class | Convention | Examples |
|-------------|-----------|---------|
| SIS instance | **A** ∈ Z_q^{n×m}, find short **x**: **Ax** = **0** | Commitment scheme basis |
| Norm bound | β (SIS bound) | Solution **x** must satisfy ‖**x**‖ ≤ β |
| Commitment | Com(**m**; **r**) | Binding from SIS hardness |
| VLHE | (KeyGen, Enc, Eval, Verify) | Verifiable Linearly Homomorphic Encryption |
| Digest | d = Hash(DB) | Database commitment for verification |

### 3.6 Distribution / probability notation (for distributional PIR, surveys)

| Symbol class | Convention | Examples |
|-------------|-----------|---------|
| Distribution over queries | D, μ | Query distribution; may be known or unknown to server |
| Statistical distance | Δ(X, Y) or SD(X, Y) | Distance between distributions |
| CDF / inverse CDF | F(x), F^{-1}(p) | Used in distribution-dependent complexity |
| Expected complexity | E_D[cost] | Cost averaged over query distribution D |
| Conditional correctness | Pr[correct | i ∈ S] | Correctness conditioned on query being in a set |

### 3.7 Critical parameters to record

#### 3.7a — FHE-based schemes (Groups A, B, most of C)

For every scheme, extract if stated:
- Ring dimension **n** or **d** (e.g., 2048, 4096, 8192)
- **All** ciphertext moduli **q_1, q_2, ...** with bit-lengths and associated ring dimensions
- Plaintext modulus **t** or **p** (or packing parameter **ρ** for plain-LWE schemes)
- Security level λ in bits; **statistical security κ** if separate
- Hypercube dimension count **d** (reshaping database into d-dimensional array)
- Decomposition bases — may be multiple: z or B, with gadget lengths t = ⌊log_z(q)⌋ + 1. Document each base's role.
- Error distribution width **σ**
- **Multiplicative depth** (often the binding constraint for BFV/BGV — lower depth → smaller q → smaller F → less communication)
- **Amortization window Q** (for preprocessing schemes — queries before re-preprocessing)
- **Packing parameters** — how database elements map to plaintext slots (column-wise vs. row-wise for BFV SIMD; packing ratio for Respire/InsPIRe; packing number φ and column count ℓ for NPIR)
- **Interpolation degree / folding factor** (for InsPIRe and similar schemes)

#### 3.7b — PRF/symmetric-key schemes (Group D)

- **Set size** |S| — number of DB entries per pseudorandom set
- **Number of sets** Q — total hint entries / amortization window
- **Word size** w — bits per DB entry
- **Permutation domain** — for PRP-based load balancing
- **Streaming memory** — for single-pass preprocessing schemes
- **Update cost** — per-mutation computation and communication. Distinguish worst-case vs amortized.
- **Amortization window** Q — queries before re-preprocessing. Note whether amortization is unlimited, bounded, one-time, or per-window.
- **Failure probability** — and whether it degrades over queries or over DB mutations
- **Preprocessing model** — streaming (single-pass) / random-access / multi-pass. Client peak memory during preprocessing. Number of DB passes.
- **Hint refresh mechanism** — pipelining (rolling offline phase) / full re-download / incremental update

---

## 4. Table Extraction

PIR papers contain 3–6 tables on average. Some papers (especially theory-only or chart-heavy) contain zero tables — see §4.5.

### Priority 1 — Complexity comparison tables
Usually Table 1 or 2. Rows = scheme names, columns = complexity metrics.
- Extract: query size, response size, server computation, communication total, client storage
- Note whether entries are asymptotic or concrete
- Flag which row is the paper's own scheme (often bolded or starred)

### Priority 2 — Performance benchmark tables
Found in the evaluation section. Contain concrete measurements.
- Extract: database size (N × w), request KB, response KB, overhead factor (×), throughput (MB/s), latency (ms or s)
- Normalize sizes to a consistent unit (KB or MB). Flag ambiguous source units.
- Record hardware (CPU model, RAM, cores), single-threaded or multi-threaded.
- **Financial cost:** If the paper reports monetary cost (e.g., $/query on AWS), extract all cost components (CPU time, network egress, amortized preprocessing). Note break-even points vs competing schemes.
- **System-level benchmarks:** For System papers, also extract end-to-end latency, scalability metrics, per-user resource consumption, and cluster configuration.
- **Standalone primitive benchmarks:** For Building-block papers, extract the primitive's benchmarks separately from the PIR benchmarks.
- **Dual comparison:** When papers compare against both reference implementations and own reimplementations, extract and label both.

### Priority 3 — Parameter tables
Map security levels to ring dimensions and moduli.
- For multi-modulus schemes, record **all** parameter sets with their associated ring dimensions.
- Note if multiple parameter sets are evaluated.

### Priority 4 — Operation cost tables
Break down costs per homomorphic operation (add, mult, external product, rotation).

### Priority 5 — Lower bound / impossibility tables (theory and survey papers)
Record: the model restriction (linear queries, bounded storage, etc.), the bound, and whether it is tight (matched by an upper bound).

### 4.5 Papers with no tables (chart-only or no-benchmarks)

- **Chart-heavy papers** (WhisPIR, XPIR-2016): Extract axis labels, compared schemes, and values for the paper's scheme to ±10%. Mark as "approximate." Synthesize key comparisons into a markdown table. Note log-scale axes. For stacked bar charts, extract components. For scatter plots and Pareto frontiers, extract boundary points, knee points, and the paper's scheme's position. For dual-axis charts, extract both axis values.
- **Priority ordering for papers with 5+ charts:** Focus on (1) the chart that best shows the paper's main claim, (2) comparison charts with closest competitors, (3) scaling/parameter-sweep charts. Describe qualitative relationships (crossover points, asymptotic trends, which scheme dominates in which regime) alongside data points.
- **Papers without benchmarks** (MulPIR, CK20, Plinko, BarelyDoublyEfficient, WangRen): Extract analytical estimates from inline text (e.g., "1.8 multiplications per byte"), theorem-stated bounds, and author-provided cost analysis. Record page numbers. Mark as "inferred" or "author-estimated."

**For theory-archetype papers, jump directly to this subsection** — do not read through Priority 1–4 first.

---

## 5. Figure and Algorithm Interpretation

### Protocol flow diagrams (most important)
- Extract phase names: Setup, Offline, Query, Response, Decode.
- Record data direction (↑ upload, ↓ download) and whether encrypted or plaintext.
- Classify as stateful (client stores hints) or stateless.
- **Note whether offline phase is streaming (single pass over DB) or random-access.**
- For multi-server schemes, label each server's role and specify which server receives which query/data.
- Describe as numbered steps — do not reproduce diagrams visually.

### Performance comparison charts
- Extract axis labels, compared schemes, and values for the paper's scheme.
- Note log scale vs linear scale.
- Mark chart-derived values as "approximate."
- Note reference/ceiling lines (e.g., "trivial download" baseline).
- For dense chart grids, focus on the paper's scheme and 2–3 closest comparators.
- For Pareto frontiers, extract the frontier shape, axes, knee points, and where the paper's scheme sits.

### Architecture diagrams
- Record data structure layout: matrix, hypercube, tree, or flat array.
- Note which dimensions are "large" vs "binary" (e.g., Spiral: 2^ν₁ × 2 × ... × 2).

### Pseudocode and algorithm figures
- Extract: algorithm name/number, inputs (with types), outputs (with types), key computational steps.
- Note non-standard conventions. **Offline/online highlighting:** Many papers use shading, color-coding, or bold to distinguish offline (preprocessing) operations from online operations in the same algorithm figure. Record which steps are offline.
- For recursive algorithms, trace a small concrete example to verify understanding.
- For papers presenting algorithms in "Box" format (modular primitives), extract each box as a standalone sub-protocol with its interface (inputs, outputs, properties).
- For formal security game figures, extract the game name, oracles provided, and winning condition.
- **Algorithm triage for papers with 5+ algorithms:** Read the main protocol algorithms first (Setup, Query, Answer, Decode), then novel sub-protocols, then standard building-block algorithms last.

---

## 6. Engineering Note Output Template

After completing all passes, produce notes in this format. **Omit sections marked N/A for the paper's archetype** — do not leave them as empty placeholders. See §0 Step 2 for which sections to include per archetype.

```markdown
# <Scheme Name> — Engineering Notes

| Field | Value |
|-------|-------|
| **Paper** | <Title (from paper, not filename)> |
| **Authors** | <e.g., Menon, Wu> |
| **Year** | <Year> |
| **ePrint / Venue** | <ID or conference> |
| **Archetype** | <Primary (+ secondary archetypes) — see §1> |
| **PIR Category** | <Group letter and name — see §7 Taxonomy> |
| **Security model** | <e.g., Semi-honest single-server / Malicious / 2-server non-colluding / Information-theoretic> |
| **Additional assumptions** | <e.g., Circular security / KDM / ROM / CRS model / none> |
| **Correctness model** | <Deterministic / Probabilistic (failure prob ≤ negl(κ)) / Conditional (requires non-adaptive queries) / Occasional (constant failure, amplifiable) / Probabilistic (failure grows over Q queries) / Distribution-dependent / Inherited from base scheme> |
| **Rounds (online)** | <e.g., 1 (non-interactive) / 2> |
| **Record-size regime** | <Small (≤10 KB) / Moderate (10–100 KB) / Large (≥100 KB) / Parameterized> |
| **PDF** | `Papers/<Group>/<filename>.pdf` |

## Lineage
| Field | Value |
|-------|--------|
| **Builds on** | <scheme names + groups; may include non-PIR predecessors (e.g., FrodoKEM)> |
| **What changed** | <1–2 sentences: the prior technique that was replaced/improved and the new mechanism> |
| **Superseded by** | <later paper in collection, if applicable, else "N/A"> |
| **Concurrent work** | <papers published simultaneously addressing similar problems, if noted> |

## Core Idea
<2–3 sentences: the specific problem addressed, the prior technique being replaced (if applicable),
the technical mechanism that solves it, and the claimed advantage over the closest prior scheme>

## Formal Definitions (Model/definition and Compiler/framework papers)
_For papers that define new PIR models, variants, or compilers._
- **Model name:** <e.g., Distributional PIR, DEPIR, Incremental PIR>
- **Syntax:** <operations and their signatures>
- **Security notion:** <informal + formal reference (Definition X.Y)>
- **Correctness notion:** <informal + formal reference>
- **Relationship to standard PIR:** <strict generalization / relaxation / orthogonal>

## Compiler Interface (Compiler/framework papers)
- **Input:** <what the compiler takes (e.g., any single-server PIR scheme)>
- **Output:** <what it produces (e.g., a distributional PIR scheme)>
- **Preserved properties:** <what carries over from the input scheme>
- **Overhead:** <additive/multiplicative cost of the transformation>
- **Instantiations evaluated:** <which base schemes were tested>

## System Context (System papers only)
- **Application:** <e.g., metadata-private voice communication>
- **Key constraint driving PIR design:** <e.g., sub-500ms per-hop latency>
- **System architecture:** <e.g., master-worker with 80 machines>
- **Where PIR fits:** <e.g., each worker answers PIR queries for its DB shard>

## Variants (if applicable)
| Variant | Key Difference | Offline Comm | Online Comm | Best For |
|---------|---------------|-------------|-------------|----------|
| <e.g., Spiral> | <base> | <—> | <14 KB / 180 KB> | <general> |
| <e.g., SpiralStream> | <client uploads expanded query> | <varies> | <varies> | <streaming> |

_For trust-assumption variants, add a "Trust Model" column._
_For continuous tradeoff papers (not discrete variants), extract at least 3 representative operating points: (1) minimum-communication, (2) minimum-computation, (3) sweet spot if identified. Include parameter settings for each._

## Novel Primitives / Abstractions (if applicable)
_For papers that define new cryptographic primitives, data structures, or PIR abstractions. Include one sub-table per primitive._

| Field | Detail |
|-------|--------|
| **Name** | <e.g., Weak Privately Puncturable PRF (wpPRF)> |
| **Type** | <Cryptographic primitive / Data structure / Abstraction / Set distribution> |
| **Interface / Operations** | <e.g., (Gen, Eval, Punc, SimPunc) with input/output types for each> |
| **Security definition** | <e.g., Punctured-key indistinguishability (Definition 3.1)> |
| **Correctness definition** | <e.g., Weak correctness — output at punctured point is unrestricted> |
| **Purpose** | <e.g., Compactly represent pseudorandom subsets with private puncture> |
| **Built from** | <e.g., GGM-tree PRF from OWF> |
| **Standalone complexity** | <e.g., Gen: O(λ), Eval: O(λ), Punc: O(λ·log n)> |
| **Relationship to prior primitives** | <e.g., Weaker than standard puncturable PRF; NOT equivalent to DPF> |

## Cryptographic Foundation

_For lattice/FHE schemes, fill the full table. For PRF-only schemes, simplify: list the minimal assumption (OWF), PRF instantiation (AES-128), and key sizes._

| Layer | Detail |
|-------|--------|
| **Hardness assumption** | <e.g., RLWE / plain LWE / MLWE / NTRU / OWF / information-theoretic> |
| **Encryption/encoding scheme(s)** | <List each with its role, e.g., "Regev encoding: first-dim processing" + "GSW: dimension folding"> |
| **Ring / Field** | <e.g., Z_q[x]/(x^d + 1) with d = 2048. For multi-ring: list each ring and its role> |
| **Key structure** | <e.g., binary secret, per-client PRF keys, shared CRS> |
| **Correctness condition** | <e.g., ‖e‖_∞ < ⌊q/p⌋/2 (FHE), or q ≥ 8ρ²√m (plain LWE), or Pr[fail] ≤ negl(κ) (probabilistic)> |

## Ring Architecture / Modulus Chain (for multi-ring papers)

| Ring | Dimension | Modulus (bits) | Role / Phase |
|------|-----------|---------------|--------------|
| <e.g., R₁> | <2048> | <54-bit> | <Query encryption> |
| <e.g., R₂> | <512> | <27-bit> | <Response compression> |

## Key Data Structures
- <e.g., database as √N × √N matrix, entries as Z_ρ elements>
- <e.g., client hint: Q pseudorandom sets with parity bits>
- <e.g., per-client evaluation keys stored on server: 0.63 MB>

## Database Encoding (if non-trivial)
- **Representation:** <e.g., matrix, hypercube, polynomial coefficients>
- **Record addressing:** <e.g., row-column indexing, polynomial evaluation>
- **Preprocessing required:** <e.g., NTT conversion, polynomial interpolation>
- **Record size equation:** <e.g., each record maps to ℓ coefficients in Z_p>

## Protocol Phases

_List all distinct phases. For multi-server schemes, add a "Server" column specifying which server._

| Phase | Actor | Operation | Communication | When / Frequency |
|-------|-------|-----------|---------------|------------------|
| <e.g., DB Encoding> | Server | <preprocess> | — | Once |
| <e.g., Hint Gen> | Server | <compute hints> | <256 MB ↓> | Per client / Global |
| <e.g., Query Gen> | Client | <encrypt index> | <14 KB ↑> | Per query |
| <e.g., Answer> | Server | <compute> | <32 KB ↓> | Per query |
| <e.g., Decode> | Client | <decrypt> | — | Per query |

## Two-Server Protocol Details (if applicable)

| Aspect | Server 1 | Server 2 |
|--------|----------|----------|
| **Data held** | <e.g., full DB copy> | <e.g., full DB copy> |
| **Query received** | <e.g., DPF key share 1> | <e.g., DPF key share 2> |
| **Computation** | <e.g., expand DPF + inner product> | <e.g., expand DPF + inner product> |
| **Security guarantee** | <e.g., computational (OWF)> | <e.g., statistical> |
| **Non-collusion assumption** | <required — neither server learns the other's query share> |

## Query Structure (for schemes with complex queries)

| Component | Type | Size | Purpose |
|-----------|------|------|---------|
| <e.g., index ciphertext> | <RLWE> | <14 KB> | <Encrypted target index> |
| <e.g., evaluation key> | <RGSW + RLev> | <1.2 GB> | <Server-side computation key> |
| <e.g., PRG seed> | <plaintext> | <32 B> | <Pseudorandom expansion on server> |

## Communication Breakdown (for schemes with multiple communication components)

| Component | Direction | Size | Reusable? | Notes |
|-----------|-----------|------|-----------|-------|
| <e.g., evaluation key> | ↑ | <1.2 GB> | <Yes, across queries> | <Offline> |
| <e.g., index ciphertext> | ↑ | <36 B> | <No> | <Per query> |
| <e.g., response> | ↓ | <256 KB> | <No> | <Per query> |

## Correctness Analysis

_Choose the applicable sub-section(s). Papers may combine Options A+B when FHE noise analysis yields a probabilistic bound._

### Option A: FHE Noise Analysis (for schemes with homomorphic operations)

Papers express noise growth as either:
- **Worst-case bounds:** ‖e‖_∞ < threshold (common in BFV)
- **Variance / sub-Gaussian tracking:** σ², θ, or ψ_2 parameters through each operation (common in Regev+GSW: Spiral, VIA, Respire)
- **Sub-Gaussian parameter tracking:** Track sub-Gaussian parameter through operations; correctness via erfc bounds

_Create one row per noise-accumulating phase:_

| Phase | Noise parameter | Growth type | Notes |
|-------|----------------|-------------|-------|
| <e.g., After query expansion> | <‖e‖_∞ ≤ O(w²)·Err(BFV)> | <additive> | |
| <e.g., After first-dim> | <θ_first = ...> | <multiplicative> | |

- **Correctness condition:** <e.g., ‖e‖_∞ < ⌊q/p⌋/2, or erfc(t/√(2θ)) < 2^{-40}>
- **Independence heuristic used?** <yes/no — if yes, note what the paper assumes is independent and any empirical validation>
- **Empirical noise budget:** <e.g., "1–3 bits remaining" if the paper uses empirical verification>
- **Dominant noise source:** <e.g., "external product in dimension folding">

_For deep noise cascades (5+ phases), a sequential list with theorem references is acceptable instead of a table._

### Option A2: Library-based noise management

_For papers that use an FHE library (e.g., SEAL) as a black box without deriving noise bounds analytically._
- **Library / version:** <e.g., SEAL 4.0>
- **Parameter constraints:** <e.g., "N ≥ 8192 required for depth-2 circuit">
- **Noise growth type per operation:** <e.g., "BFV multiply: quadratic in current noise">
- **Depth constraint:** <e.g., "depth ≤ 2 for chosen parameters">

_For plain LWE or additive-only schemes (no homomorphic multiplications), a single correctness inequality suffices._

### Option B: Probabilistic Correctness Analysis (for PRF/XOR and information-theoretic schemes)

| Field | Detail |
|-------|--------|
| **Failure mode** | <e.g., queried index not covered by any set; hash collision; amplification failure> |
| **Failure probability** | <e.g., Pr[fail] ≤ 2^{-κ} for κ = 40> |
| **Probability grows over queries?** | <yes (degrading) / no (per-query independent)> |
| **Probability grows over DB mutations?** | <yes (degrade per update) / no / N/A> |
| **Key parameters affecting correctness** | <e.g., set size |S|, number of backup entries, word size w> |
| **Proof technique** | <e.g., union bound, hypergeometric tail bound, Chernoff bound> |
| **Amplification** | <e.g., parallel repetition reduces failure from 1/3 to 2^{-κ}> |
| **Adaptive vs non-adaptive** | <Correctness holds for adaptive queries / only non-adaptive / bounded adaptive> |
| **Query model restrictions** | <e.g., at most Q queries per offline phase / no repeated indices> |

### Option C: Deterministic Correctness

_For schemes with deterministic correctness._
- State: "Deterministic correctness — <brief explanation of why>."
- For deterministic correctness with a non-trivial proof (e.g., permutation-based schemes), note the proof technique and key invariant.

### Option D: Inherited Correctness

_For papers that reduce correctness to a base scheme (e.g., security upgrades, compilers)._
- **Base scheme:** <e.g., SimplePIR>
- **What is preserved:** <correctness of base scheme carries through>
- **What is added:** <e.g., verification soundness, update correctness>
- **Additional failure modes:** <e.g., verification may reject valid answers with probability ≤ 2^{-κ}>

### Option E: Distribution-dependent Correctness

_For distributional PIR and similar models._
- **Query distribution:** <e.g., known distribution D over indices>
- **Expected correctness:** <e.g., E_D[Pr[correct]] ≥ 1 - negl(λ)>
- **Worst-case vs average-case:** <which model the paper uses>

### Option F: Verification Soundness (Security upgrade papers)

- **Verification mechanism:** <e.g., SIS-based commitment + VLHE proof>
- **Soundness definition:** <e.g., server cannot forge valid proof for wrong answer>
- **Soundness bound:** <e.g., negligible in λ under SIS assumption>
- **Overhead from verification:** <e.g., 12–40% communication overhead, 2× server computation>

## Complexity

### Core metrics (always include if reported)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Query size | <e.g., O(log N)> | <e.g., 64 KB> | Online |
| Response size | <e.g., O(w)> | <e.g., 128 KB> | Online |
| Server computation | <e.g., O(N·poly(λ))> | <e.g., 1.2 s> | Online |
| Client computation | <e.g., O(1)> | <e.g., 0.3 ms> | Online |
| Throughput | — | <e.g., 149 MB/s> | Online |
| Response overhead | <e.g., O(1)> | <e.g., 3.6×> | — |

### Preprocessing metrics (include for Groups C, D, and schemes with offline phases)

_Note: "Server preprocessing" here means PIR-specific preprocessing (hint generation), distinct from general DB encoding (NTT conversion, matrix layout) which all schemes may have._

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Server preprocessing | <e.g., O(N)> | <e.g., 2.3 s> | Offline (one-time / per-window) |
| Client hint download ↓ | <e.g., O(√N)> | <e.g., 256 MB> | Offline (per client / global) |
| Client offline upload ↑ | <e.g., O(λ)> | <e.g., 14 KB> | Offline (per client) |
| Server per-client storage | <—> | <e.g., 0.63 MB> | Persistent |
| Amortized offline/query | <e.g., O(√N)> | <e.g., 12 ms> | Amortized over Q = <window> queries |
| Client persistent storage | <e.g., O(√N)> | <e.g., 16 MB> | — |

### Preprocessing Characterization (for Group D and streaming schemes)

| Aspect | Value |
|--------|-------|
| **Preprocessing model** | <Streaming (single-pass) / Random-access / Multi-pass> |
| **Client peak memory** | <e.g., O(√N)> |
| **Number of DB passes** | <e.g., 1> |
| **Hint refresh mechanism** | <Pipelining / Full re-download / Incremental> |

### FHE-specific metrics (include for Groups A, B, and FHE-based schemes)

| Metric | Asymptotic | Concrete (benchmark params) | Phase |
|--------|-----------|---------------------------|-------|
| Public parameters | <e.g., O(N)> | <e.g., 30 MB> | Setup (once) |
| Expansion factor (F) | <e.g., 2log q/log t> | <e.g., 4.2> | — |
| Communication rate | <e.g., n²/(n²+n)> | <e.g., 0.44> | — |
| Multiplicative depth | <e.g., O(log d)> | <e.g., 3> | — |

_NOTE: Expansion factor F = q/t for single-modulus schemes. For schemes with modulus switching, effective F uses the post-switch modulus q', not the original q. Communication rate = 1/F._
_WARNING: "Rate" measures information efficiency (higher is better). "Throughput" measures speed (higher is better). They are different metrics._

### If-reported metrics (include only when the paper provides them)

| Metric | Value | Notes |
|--------|-------|-------|
| Financial server cost | <e.g., $0.000011/query on AWS c5n.2xlarge> | Break down: CPU + network + amortized preprocessing |
| Memory bandwidth utilization | <e.g., 10 GB/s, memory-bound> | Core metric for SimplePIR-family and YPIR |
| Verification overhead | <e.g., 12–40% over base scheme> | Security upgrade papers |

### Update metrics (for Update/maintenance papers)

| Metric | Value | Notes |
|--------|-------|-------|
| Cost per DB update (worst-case) | <e.g., O(√N) server computation> | |
| Cost per DB update (amortized) | <e.g., O(1) amortized over batch> | |
| Communication per update | <e.g., 4 KB per mutation> | |
| Aggregation threshold | <e.g., batch M updates, re-preprocess when M > √N> | |
| Deletion semantics | <Strong (provably removed) / Weak (lazy) / N/A> | |
| Supported mutation types | <Insert / Delete / Modify / Append-only> | |

## Mutation Model (for Update/maintenance papers)

| Aspect | Detail |
|--------|--------|
| **Update types supported** | <Insert / Delete / Modify> |
| **Who initiates updates** | <Server unilaterally / Client-triggered / External> |
| **Consistency model** | <Immediate / Eventual / Batched> |
| **Impact on hints** | <e.g., each update invalidates O(√N) hint entries> |
| **Re-preprocessing trigger** | <e.g., after M updates / when failure prob exceeds threshold> |

_Omit entire sub-tables that don't apply. For theory-only papers, write "N/A (no implementation)" in Concrete columns.
For sublinear-server schemes, throughput is not meaningful — use query latency.
When amortized costs are reported, always state the amortization window (e.g., "over Q = √n·ln n queries")._

## Optimization Catalog (Engineering optimization papers)

| Optimization | Known/Novel | Source | Improvement | Applicable to |
|-------------|-------------|--------|-------------|---------------|
| <e.g., NTT-domain DB storage> | Known | <from SEAL> | <2× server speedup> | <Any NTT-based PIR> |
| <e.g., Multi-base decomposition> | Novel | <this paper> | <30% noise reduction> | <GSW-based schemes> |

## System-Level Performance (System archetype only)

| Metric | Value | Configuration |
|--------|-------|---------------|
| End-to-end latency | <e.g., 726 ms p99> | <e.g., 32K users, 80 machines> |
| Server provisioning | <e.g., 0.085 CPU per user> | |
| Client bandwidth (down/up) | <e.g., 1.46 Mbps / 30 Kbps> | |
| Scalability limit | <e.g., 65K users before latency exceeds budget> | |

## Lower Bounds (if applicable)

| Field | Detail |
|-------|--------|
| **Bound type** | <Communication / Computation / Space-time tradeoff / Impossibility / Barrier> |
| **Bound statement** | <e.g., (C+1)(T+1) = Ω̃(n) where C = offline comm, T = online server probes> |
| **Variables** | <define each variable in the bound> |
| **Model assumptions** | <e.g., server stores DB unencoded, no extra storage; non-adaptive queries> |
| **Proof technique** | <e.g., reduction to Yao's Box Problem> |
| **Tightness** | <e.g., "our construction matches up to polylog factors"> |
| **Matching upper bound** | <which construction achieves the bound, if any> |
| **Implications** | <e.g., PIR => OWF, PIR => SZK (if stated)> |

## Formal Security Properties (Security upgrade papers)

| Property | Informal Description | Formal Location | Hardness Assumption |
|----------|---------------------|-----------------|-------------------|
| <e.g., Verification Soundness> | <e.g., Server cannot forge valid proof for wrong answer> | <Definition 3.2, p. 8> | <SIS> |

## Performance Benchmarks

_If the evaluation has ≤ 10 rows, reproduce verbatim. If larger, extract the paper's scheme and 2–3 closest comparators.
For papers without benchmarks, write: "No implementation. Analytical estimates: <summarize>."
For chart-only papers, synthesize key data points into a table and mark values as "approximate."_

_Always state: database parameters (N, w), hardware (CPU, RAM, cores), threading model._

## Cross-Paradigm Comparison (for Comparison / multi-paradigm papers)

| Approach | Paradigm | Query Size | Response Size | Server Time | Best For |
|----------|----------|-----------|--------------|-------------|----------|
| <e.g., SealPIR-based> | <FHE selection-vector> | ... | ... | ... | ... |
| <e.g., Gentry-Ramzan> | <Number-theoretic> | ... | ... | ... | ... |

## Application Scenarios (if discussed)
- <e.g., Private DNS — 10^6 records × 32B, tolerance for preprocessing>

_For papers with >1 page application content, extract: application parameters, deployment protocol, cost analysis, privacy comparison with non-PIR approach, which scheme variant is best for the application._

## Composability (for Update/maintenance and Compiler/framework papers)
| Base Scheme | Integration Point | Improvement | Limitations |
|------------|-------------------|-------------|-------------|
| <e.g., SimplePIR> | <hint update phase> | <224× faster preprocessing> | <requires batch size ≥ M> |

## Deployment Considerations (if discussed)
- **Database updates:** <e.g., re-preprocess per shard / incremental O(1) / not addressed>
- **Sharding:** <yes/no, strategy>
- **Key rotation / query limits:** <e.g., max 2^52 queries before rekey>
- **Anonymous query support:** <yes (stateless) / no (client state reveals identity)>
- **Session model:** <persistent client / ephemeral client / session-based>
- **Cold start suitability:** <yes (no offline comm) / no (requires preprocessing)>
- **Amortization crossover:** <e.g., becomes cheaper than X after Y queries>

## Key Tradeoffs & Limitations
- <e.g., requires client-dependent preprocessing — not suitable for anonymous access>
- <e.g., throughput degrades below 4 KB entry sizes>

## Comparison with Prior Work

| Metric | This scheme | <Comparator 1> | <Comparator 2> |
|--------|------------|----------------|----------------|
| Query size | | | |
| Response size | | | |
| Server time | | | |
| Throughput | | | |
| Client storage | | | |
| DB params | <must match across columns> | | |

_For papers presenting tradeoff curves (Pareto frontiers), describe the frontier instead of picking a single point._
_When a paper uses multiple comparison regimes (e.g., with vs without offline comm), label the regime per row or create separate tables._

**Key takeaway:** <1–2 sentences: when to prefer this scheme>

## Portable Optimizations (if applicable)
_Techniques from this paper that could be applied to other PIR schemes._
- <e.g., negacyclic matrix encoding for LWE-to-RLWE conversion (applicable to any RLWE-based PIR)>

## Implementation Notes
- **Language / Library:** <e.g., C++ with SEAL 4.0>
- **Polynomial arithmetic:** <NTT-based / schoolbook / N/A (plain LWE or PRF-based)>
- **CRT decomposition:** <e.g., q = product of two 28-bit primes, CRT with AVX for 2× speedup>
- **SIMD / vectorization:** <e.g., AVX2, AVX-512, none mentioned>
- **Parallelism:** <single-threaded / multi-threaded / GPU / distributed (N machines)>
- **Lines of Code (LOC):** <if mentioned>
- **Open source:** <link if provided>

## Open Problems (if discussed)
_Extract open problems stated by the authors._
- <e.g., "Can DEPIR be achieved from plain LWE without CRS?">

## Uncertainties
_List notation ambiguities, garbled expressions, or low-confidence extractions._
- <e.g., "n" used for both ring dimension and DB size on page 7 — interpreted as ring dimension>
```

### 6.1 Survey template

For survey/SoK papers, replace most of the above with:

```markdown
# <Survey Title> — Notes

| Field | Value |
|-------|-------|
| **Paper** | <Title> |
| **Authors** | <Authors> |
| **Year** | <Year> |
| **Survey type** | <Pedagogical (textbook-style) / SoK (systematization) / Brief overview> |
| **Scope** | <e.g., "Foundational IT-PIR and cPIR theory, 1995–2004"> |
| **PIR models covered** | <e.g., k-server IT-PIR, 1-server cPIR, SPIR, keyword PIR> |
| **Excluded topics** | <what the survey explicitly does NOT cover> |

## Taxonomy of PIR Models
_For surveys covering multiple PIR models, document the taxonomy._

| Model | Servers | Privacy | Correctness | Key Parameters |
|-------|---------|---------|-------------|----------------|
| <e.g., k-server IT-PIR> | k ≥ 2 | Information-theoretic | Perfect | k, communication |

## Schemes Covered
| Scheme | Authors | Year | Model | # Servers | Communication | Assumption | Key Result | Section |
|--------|---------|------|-------|-----------|---------------|------------|------------|---------|

## Model Definitions
_Extract formal definitions of each PIR model the survey covers._

## Key Upper Bounds
_Best known constructions with their complexity._

## Key Lower Bounds
_Impossibility results with their model assumptions._

## Proof Techniques
| Technique | Used In | Core Mechanism |
|-----------|---------|----------------|
| <e.g., Covering codes> | <CGKS k-server PIR> | <Encode queries as codewords> |

## Implication Chains
_Connections between PIR and other primitives._
- <e.g., "sublinear 1-DB PIR exists ⟹ OWF exist">

## Open Problems
_List with status if known from later papers in the collection._

## Commentary / Author Reflections (if present)

## Historical Significance
_Which results became foundations for modern schemes in Groups A–D._
```

---

## 7. PIR Domain Knowledge

### 7.1 Scope

The 35 papers in this collection primarily address **computational PIR** (cPIR) — security from computational hardness assumptions. Key exceptions:
- **IshaiShiWichs (Group D):** Proves information-theoretic constructions and lower bounds (perfect privacy, no computational assumptions).
- **TreePIR, SinglePass, CK20 (Group D):** Use **two-server non-colluding** models alongside or instead of single-server.
- **CGKS Survey (Group X):** Covers foundational multi-server information-theoretic PIR, cPIR, SPIR, keyword PIR, robust PIR, t-private PIR, lower bounds, and PIR-to-OWF/OT implications.

### 7.2 Taxonomy (5 groups)

| Group | Key property | Representative schemes |
|-------|-------------|----------------------|
| **A — FHE/HE-based** | Server computes homomorphically on the client's encrypted query against the plaintext database. Includes BFV, BGV, GSW, NTRU, and Regev+GSW composition — not limited to "fully" homomorphic encryption. | XPIR, SealPIR, MulPIR, OnionPIR, OnionPIRv2, CwPIR, FastPIR/Addra, Spiral |
| **B — Stateless single-server** | No persistent per-client state on the **client** between queries. Server may store ephemeral per-query evaluation keys but NOT persistent per-client state. **Sub-models:** *Hintless* (no offline comm: YPIR, HintlessPIR), *CRS/query-bundled* (keys from CRS or per-query: WhisPIR, InsPIRe), *Public-parameter upload* (public key material offline: NPIR), *Client-hint upload* (secret-key-dependent keys offline: Pirouette, VIA-C, Respire). | HintlessPIR, YPIR, Respire, WhisPIR, Pirouette, InsPIRe, NPIR, VIA |
| **C — Client-independent preprocessing** | Server generates one global hint shared by all clients ("global preprocessing"). Client downloads it once. DEPIR papers (BarelyDoublyEfficient) achieve sublinear server computation — currently theoretical. | SimplePIR, DoublePIR, FrodoPIR, VeriSimplePIR, IncrementalPIR |
| **D — Client-dependent preprocessing** | Each client gets a personalized offline hint. Includes both single-server and two-server schemes. Not all Group D schemes have probabilistic correctness (SinglePass, WangRen are deterministic). | Piano, Plinko, TreePIR (2-server), CK20 (2-server+1-server), IncPIR (2-server), SinglePass (2-server), WangRen, IshaiShiWichs, RMS24 |
| **X — Variants & Surveys** | Keyword PIR, symmetric PIR, distributional PIR, model-defining papers, foundational surveys, and multi-contribution comparison papers | SealPIR/KeywordPIR, DistributionalPIR, CGKS Survey |

**Key concept — DEPIR:** Doubly-Efficient PIR achieves sublinear server computation via preprocessing. BarelyDoublyEfficient is the first from plain LWE in the CRS model (a theory/feasibility result, not yet practical).

**Server preprocessing vs PIR preprocessing:** "Server preprocessing" (NTT conversion, database encoding) is present in almost all PIR schemes. This is distinct from PIR-specific preprocessing: *client-independent* (Group C global hint), *client-dependent* (Group D per-client hints), and *offline communication* (Group B client uploads). Do not conflate them.

**CRS model:** Several Group B papers (HintlessPIR, YPIR, InsPIRe, BarelyDoublyEfficient) operate in the Common Reference String model, where a trusted setup produces public parameters. This is distinct from the random oracle model (used by YPIR for Fiat-Shamir).

**Cross-group notes:**
- FrodoPIR is filed in Group A but uses plain LWE with client-independent preprocessing — functionally Group C.
- ThorPIR (FHEPIR_2024_482) is filed in Group A but its contribution is client-dependent FHE preprocessing — functionally Group D.
- VIA-C has offline communication, straddling Group B and Group C.

### 7.3 Scheme evolution (key lineages)

**FHE-based (Group A):**
- **XPIR lineage:** XPIR-2014 (Doroz et al., NTRU-based PIR, ePrint 2014/232) and XPIR-2016 (Aguilar-Melchor et al., Ring-LWE-based system with auto-optimization, ePrint 2014/1025) are separate papers. XPIR-2016 was the first practical cPIR system with configurable parameters.
- **Selection-vector branch:** SealPIR (2017, paradigm shift: query compression via BFV oblivious expansion) → MulPIR (2019, GSW-based compressible FHE for high communication rate, has concrete parameter analysis but no running implementation) → OnionPIR (2021, external products for noise control, first to achieve <1 second at scale) → OnionPIRv2 (2025, engineering-optimized with multi-base decomposition and NTT-domain DB).
- **Regev+GSW composition branch:** Gentry-Halevi (2019, theoretical) → Spiral (2022, practical ciphertext translation, 4 variants with Pareto-optimal tradeoffs).
- **Equality-operator branch:** CwPIR (2022, constant-weight equality operators, enables practical single-round keyword PIR — orthogonal to the selection-vector line). **Note:** FastPIR/Addra (2021) uses one-hot selection vectors (NOT equality operators) — it is a system paper embedding a BFV-based PIR scheme, distinct from CwPIR.
- **NTRU-based sub-lineage:** XPIR-2014 (NTRU) → ... → NPIR (2025, NTRU packing for high communication rate).

**Two fundamental approaches within Group A:**
1. **Selection-vector communication:** Client sends encrypted selection vector, expanded via oblivious expansion on server (SealPIR, MulPIR, OnionPIR, FastPIR/Addra).
2. **Equality-operator computation:** Server computes selection vector using encrypted equality operators against each DB identifier (CwPIR). Naturally supports keyword PIR without extra rounds.

**Preprocessing elimination (Groups B/C):** SimplePIR (2022, 10 GB/s via plain LWE) → DoublePIR (2022, smaller hints) → HintlessPIR (2023, eliminates hint via composable RLWE preprocessing, introduces LinPIR) → YPIR (2024, eliminates offline comm via CDKS packing) → Respire (2024, subring techniques for small records) → VIA (2025, DMux-CMux replaces coefficient expansion). Branch from Spiral: WhisPIR (2024, BGV-based, builds on Spiral not SimplePIR). InsPIRe (2025, novel ring packing InspiRING). NPIR (2025, NTRU-based packing). Pirouette (2025, 36-byte queries via high-precision bit decomposition).

**Sublinear server (Group D):** CK20 (2019, first sublinear-server cPIR without extra server storage, theory-only, puncturable pseudorandom sets) → Piano (2023, PRF-only, first practical sublinear) → Plinko (2024, invertible PRFs, worst-case O̅(1) updates, theory-only). TreePIR (2023, 2-server, weak privately puncturable PRFs — NOT DPFs, NOT equivalent to puncturable PRFs). SinglePass (2024, 2-server, single-pass streaming preprocessing, permutation-based — NOT PRF-based). RMS24 (2024, dummy subsets, standard correctness). WangRen (2024, tight space-time tradeoff ST = O(nw), relocation data structure, theory-only). IshaiShiWichs (2024, information-theoretic constructions + lower bounds).

**Verifiable/incremental:** VeriSimplePIR (2024, adds verifiability to SimplePIR via SIS commitments + VLHE). IncrementalPIR (2026, entry-level incremental preprocessing for SimplePIR). IncPIR (2021, incremental hint updates for mutable databases, 2-server).

### 7.4 Key performance metrics

- **Query size** — bytes client → server
- **Response size** — bytes server → client
- **Expansion factor (F)** — ciphertext_size / plaintext_size. For single-modulus RLWE: F ≈ 2log(q)/log(t). For schemes with modulus switching, use the post-switch modulus. For plain LWE Regev: F ≈ (n+1). Not applicable for PRF-only schemes. NOTE: for preprocessing schemes, large F does not necessarily kill performance because preprocessing amortizes the cost.
- **Communication rate** — plaintext_bits / response_bits (1.0 optimal). WARNING: some papers use the inverse (expansion factor). Always check the paper's definition. **Rate ≠ throughput:** rate measures information efficiency, throughput measures speed.
- **Response overhead** — response_size / element_size (1× optimal; practical: 2–10×)
- **Server computation** — CPU time or throughput (MB/s). For sublinear schemes, use query latency.
- **Throughput** — database_size / server_time. Meaningful only for linear-computation schemes. Memory-bandwidth-limited for schemes like YPIR, SimplePIR.
- **Memory bandwidth utilization** — Core metric for SimplePIR-family and YPIR. These schemes are memory-bound, not compute-bound.
- **Client storage** — hint size for preprocessing schemes (0 for hintless Group B)
- **Financial cost** — $/query on cloud infrastructure. Combine CPU + network costs. May be the metric that resolves communication-computation tradeoffs.
- **Multiplicative depth** — For FHE schemes, often the binding constraint on parameters. Lower depth → smaller q → smaller F → less communication. Not relevant for XPIR (additive-only) or PRF-based schemes.
- **Query format** — LWE ciphertext / RLWE ciphertext / packed RLWE / evaluation keys / PRF seed. A key differentiator for Group B schemes.
- **Keyword PIR support** — native (single-round, equality operators) / reducible (hash table + extra round) / not supported.
- **Record-size regime** — Small (≤10 KB), Moderate (10–100 KB), Large (≥100 KB). Some schemes excel in one regime but not others (e.g., Respire optimized for small records, NPIR for moderate).

**Benchmark normalization:**
- **Groups A/B (pre-2024):** N = 2²⁰ × 256 bytes (256 MB) as the canonical comparison point.
- **Groups A/B (2024+):** Also extract 1 GB and 32 GB benchmarks — these papers target larger databases.
- **Group D sublinear schemes:** Compare at 1 GB and 100 GB (Group D benchmarks differ substantially).

### 7.5 Common cryptographic building blocks

| Primitive | Used by | Role |
|-----------|---------|------|
| BFV | SealPIR, OnionPIR, OnionPIRv2, FastPIR/Addra, ThorPIR | Leveled homomorphic encryption |
| BGV | WhisPIR | Leveled HE with modulus switching. Non-compact variant may have >2 ciphertext components. |
| Regev + GSW composition | Spiral, Respire, YPIR, VIA, HintlessPIR | High-rate HE via external products |
| BFV SIMD batching | SealPIR, XPIR-2016, FastPIR/Addra, OnionPIR | Packing multiple DB elements into BFV plaintext slots |
| RLWE / Ring-LWE | Most Groups A & B | Hardness assumption; NTT-based polynomial arithmetic |
| RLWE' (Gadget RLWE) | Pirouette, Spiral, Respire, VIA | Encryptions under gadget vector; used in external products |
| LWE (plain) | SimplePIR, DoublePIR, FrodoPIR | No ring structure — matrix-vector multiply |
| MLWE (Module-LWE) | VIA-C, VIA-B | Bridges LWE and RLWE; parameterized by module rank m |
| NTRU | XPIR-2014, NPIR | Different key structure (f, h), different noise model |
| NTRU packing | NPIR | Packing multiple NTRU encodings for rate improvement |
| NTRU encoding (Regev-like) | NPIR | NTRU analog of Regev encoding; uses f^{-1} factor |
| NGSW encoding | NPIR | NTRU analog of GSW; used for external products |
| GSW / RGSW | MulPIR, Spiral, OnionPIR, OnionPIRv2, Respire, VIA | External products for dimension folding |
| Oblivious query expansion (Expand) | SealPIR, OnionPIR, OnionPIRv2, Spiral, WhisPIR, NPIR | Expands compressed query into selection vector on server. SealPIR's most influential contribution. |
| Coefficient / index expansion | SealPIR, OnionPIR, Spiral, WhisPIR, NPIR, Respire | Expands single ciphertext into N ciphertexts via tree of automorphisms. Depth ceil(log_2(N)). |
| Automorphisms | WhisPIR, Respire, Spiral, SealPIR, OnionPIR, VIA | Query expansion; rotation of packed ciphertexts. Also "substitution." |
| Key switching / Modulus switching | Spiral, Respire, WhisPIR, YPIR, VIA | Key switching: translating between keys. Modulus switching: reducing ciphertext modulus for compression. |
| DecompMul | OnionPIR, OnionPIRv2 | Decomposed multiplication reducing noise in external products |
| LWE-to-RLWE conversion | VIA, YPIR, Respire, HintlessPIR, InsPIRe | Converts LWE ciphertexts to RLWE form; critical for query compression |
| Ring packing (CDKS) | YPIR, InsPIRe | Compresses multiple encodings into fewer via FFT-style automorphisms. InspiRING is a variant. |
| Ring switching | VIA, Respire | Maps ciphertexts between rings of different dimensions |
| Subring embedding / dimension reduction | Respire | Maps to a smaller ring for efficiency |
| Sample extraction | VIA, Spiral, Respire, Pirouette | Extracts LWE ciphertext from RLWE ciphertext |
| CMux / DMux | VIA, Spiral, Respire, OnionPIR | Homomorphic multiplexer/demultiplexer via external products. DMux (VIA) is dual of CMux — selects one of N databases to expand. |
| CRot (Controlled Rotation) | VIA | Homomorphic conditional rotation of RLWE ciphertext |
| Blind rotation | Pirouette | Rotates encrypted polynomial by encrypted amount. From TFHE/FHEW bootstrapping. |
| Negacyclic LUT evaluation | Pirouette | Look-up table evaluation via blind rotation |
| CRT decomposition | HintlessPIR, YPIR, Respire | Extends RLWE computation from NTT-friendly primes to arbitrary moduli |
| Composable preprocessing | HintlessPIR, YPIR | Precomputing public-randomness-dependent parts offline. Alpha/beta decomposition. |
| Homomorphic polynomial evaluation | InsPIRe | Evaluating polynomials on encrypted inputs for database encoding |
| PRG seed compression | VIA, Respire, Spiral, SealPIR, YPIR, SimplePIR | Client sends PRG seed instead of random components; ubiquitous |
| Constant-weight equality operator | CwPIR | Selection vector via depth O(log k) circuit; enables keyword PIR |
| Ciphertext translation (ScalToMat, RegevToGSW) | Spiral | Converting between Regev and GSW ciphertext types |
| Ciphertext compression | MulPIR | Reducing ciphertext size at the cost of additional computation |
| Copy/routing networks (Beneš network) | OnionPIR | Routing encrypted data through permutation network |
| Cuckoo hashing / multi-choice hashing | SealPIR (keyword), Respire (batch) | Load-balanced bucket assignment for keyword/batch PIR |
| DPF (Distributed Point Function) | Multi-server constructions, IncPIR | Compact unit-vector in O(λ) bits |
| PRF (Pseudorandom Function) | Piano, Plinko, RMS24, preprocessing schemes | Deriving hints from compact seeds |
| PRP (Pseudorandom Permutation) | Piano, WangRen | Load balancing: converts arbitrary to random queries. Small-domain PRP also used. |
| Puncturable PRF | CK20, Plinko | Key puncturing for private subset representation |
| Invertible PRF (iPRF) | Plinko | PRF that can be inverted with the key; enables O̅(1) updates |
| wpPRF (weak privately puncturable PRF) | TreePIR | Hides punctured index in GGM tree. Weaker than standard puncturable PRF. |
| Fisher-Yates shuffle / random permutations | SinglePass | Seed-compressed permutations for streaming preprocessing |
| OWF (One-way functions) | CK20, Piano, Plinko, WangRen | Minimal assumption for Group D schemes |
| SIS (Short Integer Solution) | VeriSimplePIR | Commitment scheme for verifiable PIR |
| VLHE (Verifiable Linearly Homomorphic Encryption) | VeriSimplePIR | Novel primitive enabling verifiable PIR |
| Fiat-Shamir transform | VeriSimplePIR, YPIR | Converting interactive proofs to non-interactive in ROM |
| Linearly homomorphic encryption | CK20 (single-server) | Weaker than FHE; supports only linear operations |
| Batch PIR | Respire, DistributionalPIR, KeywordPIR | Retrieving multiple items per query; often via Cuckoo hashing |
| NTT-domain database preprocessing | OnionPIRv2, YPIR | Storing database in NTT domain to avoid per-query NTT |
| Backup / replacement hints | Piano, RMS24 | Extra hint entries to handle query collisions or exhaustion |
| Galois group / trace function | InsPIRe, NPIR | Ring structure operations for packing |
| Polynomial interpolation encoding | InsPIRe | Encoding database as polynomial evaluations |

### 7.6 Standard security levels

- **128-bit security** — most common target, but not universal. VIA targets 110-bit; OnionPIRv2 intentionally uses 100-bit for performance comparison. Some papers target different levels.
  - RLWE: ring dimension d ≥ 2048 with moderate q.
  - Plain LWE: dimension n ≥ 1024 with small q (e.g., q = 2³²).
  - NTRU: similar dimension constraints but different estimation (Hermite factor for pre-2016 papers, Lattice Estimator for newer).
  - Security depends on the (n, log q, σ) triple. Increasing q without increasing n weakens security.
- Concrete parameters follow the HE Standard and the Lattice Estimator.
- **Statistical security κ** (separate from computational λ): Used in Piano, CK20, RMS24 for probabilistic correctness. Typically κ = 40.
- **Circular security / KDM:** Some Group B papers (HintlessPIR, Pirouette, VIA) require circular security or key-dependent message security assumptions. Flag these in the metadata table.
- **Conjectured security:** Some papers use parameter sets whose security relies on unproven conjectures (e.g., ThorPIR's LWR-based parameters). Flag in Uncertainties.

### 7.7 Parameter relationships (engineering intuition)

#### FHE-specific
- **Security:** log(q)/n ratio must stay below HE Standard thresholds.
- **Expansion factor:** F ≈ q/t. Larger q → larger F → more communication. With modulus switching, effective F uses the post-switch modulus.
- **Noise budget:** Larger q/t ratio → more room for noise → supports deeper circuits.
- **Dimension tradeoff:** Higher hypercube dimension d reduces response overhead but increases server computation and noise complexity.
- **Multi-modulus chains:** Modern Group B schemes use 3–5 moduli (q₁, q₂, ...) with different ring dimensions. Each modulus switch trades noise headroom for smaller ciphertexts.
- **Multiplicative depth:** For BFV/BGV schemes, often THE primary optimization target. Lower depth → smaller q → smaller F → less communication.
- **Recursion depth d:** Higher d reduces query size (from O(n) to O(d · n^{1/d})) but increases response size and server computation. d=1 (no recursion) has the largest queries but smallest answers. FastPIR/Addra achieves good performance at d=1; most other BFV-based schemes require d≥2.

#### Preprocessing-specific (Group D)
- **Space-time tradeoff:** Client storage S × online server time T = O(nw) is the fundamental lower bound (WangRen). More storage → faster queries.
- **Amortization:** Q queries amortize the offline preprocessing cost. Larger Q → lower per-query cost but higher upfront cost. Two dimensions: offline communication / Q and offline computation / Q.
- **Consumable hints:** Some schemes (Piano) consume hint entries per query. Backup/replacement mechanisms handle exhaustion.
- **Update sensitivity:** Worst-case update cost varies from O(1) (Plinko) to O(√N) to full re-preprocessing. Critical for mutable databases.
- **Streaming vs random-access preprocessing:** Streaming (SinglePass) requires only one pass over the database with bounded memory. Random-access may require multiple passes or random seeks.

---

## 8. Robustness Guidelines

### Confidence labels
Tag every extracted value: **"exact"** (copied from table), **"approximate"** (read from chart ±10%), **"inferred"** (calculated from other values or extracted from inline text), or **"author-estimated"** (analytical estimate provided by authors, not measured).

### Uncertainties
Do not interrupt the user for ambiguous notation during batch processing. Record all ambiguities in `## Uncertainties`. Only ask interactively when processing a single paper AND the ambiguity would change the scheme's fundamental classification.

### Cross-references
When a scheme builds on or compares to another paper in this collection, name it with its group: e.g., "builds on SealPIR [Group A]." Add a `## Related Papers in Collection` section listing related papers and relationships.

### Multi-variant papers
Produce ONE note file per paper. Use the Variants table for a structured comparison. Add separate rows in Complexity and Benchmarks per variant. Note variant differences inline in Protocol Phases.

### Remark / Note / Observation blocks
Pay special attention to "Remark," "Note," and "Observation" blocks in papers — they often contain:
- **Model assumptions** (e.g., independence heuristic in Spiral's Remark 2.18)
- **Parameter constraints** (e.g., empirical parameter choices)
- **Performance insights** (e.g., crossover points, bottleneck identification)
- **Variant/generalization hints** (e.g., "this extends to the multi-server case")
Also look for "KEY IDEA" annotations in survey papers — extract these verbatim.
For theory papers, Remarks are especially dense with insight — check both main body and appendix.

### Common notation collisions across papers
- **n**: Ring dimension in some papers, database size in others (XPIR, FastPIR/Addra use opposite conventions). Always verify from context.
- **d**: Ring dimension or hypercube dimension count — check which.
- **t**: Plaintext modulus or communication threshold or decomposition parameter — check which.
- **w**: Element bit-width in most papers, but hash function count in XPIR's batch codes.
- **k**: Security parameter (MulPIR) or server count (theory papers) or decomposition parameter or Hamming weight (CwPIR).
- **δ**: Scaling factor or correctness error or database difference — varies widely.

### Validation checklist
Before writing the final note, verify:

**Always check:**
- [ ] Paper archetype(s) identified and correct sections included/omitted
- [ ] Scheme name matches what the paper calls it (not just the filename)
- [ ] Core Idea is filled (not placeholder text)
- [ ] At least 2 items in Cryptographic Foundation
- [ ] Complexity table has at least 3 metrics filled
- [ ] PIR Category matches the paper's directory group (or deviation is noted with explanation)
- [ ] No placeholder markers (e.g., `<e.g.,`) remain
- [ ] All chart-derived values marked as "approximate"
- [ ] PDF path matches the actual file
- [ ] Notation collisions are documented in Uncertainties

**Construction papers:**
- [ ] Protocol Phases has at least Query + Response rows
- [ ] For multi-variant papers, each variant has rows in Complexity/Benchmarks
- [ ] For multi-construction papers, each construction is documented

**Theory papers:**
- [ ] Lower bounds are extracted if present
- [ ] Theorem statements are recorded
- [ ] Toy protocol / technical overview is extracted if present

**Preprocessing schemes:**
- [ ] Amortization window is stated
- [ ] Client storage is recorded
- [ ] Preprocessing model (streaming/random-access) is noted

**Security upgrade papers:**
- [ ] Formal Security Properties table is filled
- [ ] Overhead vs base scheme is stated

**Update/maintenance papers:**
- [ ] Update metrics are filled (both worst-case and amortized if applicable)
- [ ] Mutation Model is documented
- [ ] Composability is documented

**Multi-archetype papers:**
- [ ] All archetype-specific template sections are included
- [ ] Reading-path composition rules were followed (§1)

**Chart-heavy papers (5+ charts):**
- [ ] Charts were prioritized (main claim → comparisons → scaling)
- [ ] All chart-derived values marked "approximate"

**Two-server papers:**
- [ ] Per-server roles and security guarantees are documented
- [ ] Non-collusion assumption is stated
