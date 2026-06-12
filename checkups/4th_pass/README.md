### 4th Pass — June 11–12, 2026

Targeted re-audit after the benchmark refactor (PR #2: hint-taxonomy rename + chart metric-applicability + zero-cost backfill). Unlike the per-notes-file 3rd pass, this pass also covered the **group README files**, **reported.json**, and **cross-file consistency** — where several long-standing transcription errors had survived (e.g. YPIR's communication figures were corrected in the notes in pass 3, but the Group-1b README still showed SimplePIR's numbers). Applied via PR #3.

#### Methodology

- 10 audit agents (7 per-group + 3 cross-cutting: taxonomy/classification, data-pipeline, conventions), grounding every finding in the source PDF / README / reported.json.
- One **independent adversarial reviewer per finding** (default-to-refute), re-opening the primary source.
- 67 findings → **62 confirmed**, 5 refuted, 0 unverifiable.

#### Confirmed fixes by group

| Group | Confirmed | Refuted |
|-------|-----------|--------|
| A — FHE-Based PIR (1a) | 9 | 1 |
| B — Stateless Single-Server PIR (1b) | 25 | 1 |
| C — Client-Independent Preprocessing (2a) | 8 | 0 |
| D — Client-Dependent Preprocessing (2b) | 5 | 1 |
| X — Extensions | 9 | 2 |
| M — Multiserver | 4 | 0 |
| CC — Cross-cutting / classification | 2 | 0 |
| **Total** | **62** | **5** |

#### Group A — FHE-Based PIR (1a)

- **[high|benchmark]** `research/Group.1a.Stateless.Client.Stateful.Server/sealpir_2018/sealpir_2018_notes.md:320-321`
  - Transcription error. The SealPIR PDF (PIR with compressed queries, 2017/1142) Figure 9, p.11 lists the EXPAND row for SealPIR(d=2) as 0.05 / 0.11 / 0.23. The third value (n=1,048,576) is 0.23 s in the paper, not 0.11 s (verified in extracted Figure 9: 'EXPAND 
  - **Fix:** In /workspace/research/Group.1a.Stateless.Client.Stateful.Server/sealpir_2018/sealpir_2018_notes.md line 320, change the Expand row third column from 0.11 to 0.23: "| Expand | 0.05 | 0.11 | 0.23 |"
- **[high|taxonomy]** `research/Group.1a.Stateless.Client.Stateful.Server/README.md:1 (heading), 94, 106`
  - FrodoPIR is classified Group 2a (research/Group.2a.Download.Hint/frodopir_2022/, FrodoPIR_2022_notes.md:36 = 'Group 2a — Download-Hint') and ThorPIR is classified Group 2b (research/Group.2b.Interactive.Hint/thorpir_2024/, ThorPIR_2024_notes.md:35 = 'Group 2b 
  - **Fix:** Relocate the FrodoPIR subsection (1a README lines 94-104) into research/Group.2a.Download.Hint/README.md (e.g. after SimplePIR/DoublePIR, matching that file's column format), and relocate the ThorPIR subsection (1a README lines 106-119) int
- **[medium|benchmark]** `research/Group.1a.Stateless.Client.Stateful.Server/sealpir_2018/sealpir_2018_notes.md:293`
  - Derived total uses the wrong Expand value (0.11). With the correct Figure 9 value of 0.23 s (Setup 4.26 + Expand 0.23 + Answer 2.01), the SealPIR total server time at n=2^20 is 6.50 s, not 6.38 s. This 6.38 s figure also propagates to the Comparison table (lin
  - **Fix:** Set Expand at n=1,048,576 to 0.23 s wherever it appears. (1) Line 320 table cell: 0.11 → 0.23. (2) Line 286: "0.11 s [^26]" → "0.23 s [^26]". (3) Line 288 and footnote [^26] (line 293): total server time 4.26 + 0.23 + 2.01 = 6.50 s. (4) Lin
- **[medium|formula]** `research/Group.1a.Stateless.Client.Stateful.Server/xpir_2014/xpir_2014_notes.md:186`
  - Transcription error in the BW-complexity column. The XPIR-2014 PDF (Bandwidth Efficient PIR from NTRU, 2014/232) Table 4, p.11 lists Kushilevitz-Ostrovsky bandwidth complexity as 'α N' (alpha times N), while Boneh-Goh-Nissim is 'α √N'. The notes list both BGN 
  - **Fix:** On line 186 only, change the Kushilevitz-Ostrovsky BW Complexity cell from "alpha sqrt(N)" to "alpha N". Do NOT alter line 185 (Boneh-Goh-Nissim), which correctly remains "alpha sqrt(N)".
- **[medium|benchmark]** `research/Group.1a.Stateless.Client.Stateful.Server/spiral_2022/spiral_2022_notes.md:314`
  - Transcription error (unit). The Spiral PDF (2022/368) Table 3, p.29 lists the 'Best Previous' Query Size for the 2^20 x 256B database as 34 MB, not 34 KB. (Consistent with Table 2, where FastPIR's query at 2^20x256B is 33 MB.)
  - **Fix:** In /workspace/research/Group.1a.Stateless.Client.Stateful.Server/spiral_2022/spiral_2022_notes.md line 314, change the Query Size row from "| Query Size | 34 KB | **14 KB** | 8 MB | **14 KB** | 15 MB |" to "| Query Size | 34 MB | **14 KB** 
- **[medium|taxonomy]** `research/Group.1a.Stateless.Client.Stateful.Server/pirouette_2025/Pirouette_2025_notes.md:60, 534`
  - Cross-reference classification inconsistency. Respire is classified as Group 1a in this repo: its notes header reads 'PIR Category | Group 1a' and it resides in the Group.1a directory (research/Group.1a.Stateless.Client.Stateful.Server/respire_2024/). There is
  - **Fix:** In /workspace/research/Group.1a.Stateless.Client.Stateful.Server/pirouette_2025/Pirouette_2025_notes.md, change "Respire [Group 1b]" to "Respire [Group 1a]" at line 60 and "**Respire [Group 1b]:**" to "**Respire [Group 1a]:**" at line 534.
- **[medium|convention]** `research/Group.1a.Stateless.Client.Stateful.Server/onionpir_2021/onionpir_2021_notes.md:43 (first of 94 named footnote definitions; references throughout, e.g. lines 39, 42, 53, 55, 65, 75-97, 103-449)`
  - CLAUDE.md "Notes File Conventions" mandates: "Footnote labels: numeric only ([^1], [^2]...) — sole exception is ThorPIR's [^18b]." This file uses 94 named (non-numeric) footnote definitions (and matching references). None are the documented ThorPIR exception. 
  - **Fix:** Renumber every footnote in this file to sequential numeric labels ([^1], [^2], ... in order of first appearance), updating BOTH the definitions and ALL matching in-text references so no reference is orphaned and no number collides. The find
- **[low|footnote]** `research/Group.1a.Stateless.Client.Stateful.Server/sealpir_2018/sealpir_2018_notes.md:488`
  - Footnote-resolution mismatch. The '11% to 24%' figure appears in Section 1 (Introduction/abstract, p.1: 'SealPIR introduces between 11% and 24% CPU overhead'). Section 7.1 (p.11) actually states a different range: 'EXPAND procedure introduces CPU overheads of 
  - **Fix:** Change footnote [^39] from "Section 7.1, p. 11." to "Section 1, p. 1: \"SealPIR introduces between 11% and 24% CPU overhead to the server (over XPIR).\"" (matching the citation used by [^28]). Note: Section 7.1, p.11 reports a related but d
- **[low|benchmark]** `research/Group.1a.Stateless.Client.Stateful.Server/pirouette_2025/Pirouette_2025_notes.md:310`
  - Transcription error. The Pirouette PDF (popets-2025-0038 / eprint 2024/680) Table 7, p.11 lists the sequential Pirouette^H computation for the 2^22 x 256 B (1 GB) database as 21 s, not 22 s. (The '22 s' value in the same PDF row belongs to the T-Respire 'par. 
  - **Fix:** In line 310 of Pirouette_2025_notes.md, change the Pirouette^H computation cell from "22 s" to "21 s": "| | Computation | 4 s | 296 s | 26 s | 21 s |"

#### Group B — Stateless Single-Server PIR (1b)

- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:18`
  - Wrong. YPIR PDF (eprint 2024/270) Table 2 (p.20), 32 GB row, YPIR Upload = 2.5 MB (2560 KB). 724 KB is SimplePIR's 32 GB upload, not YPIR's. The scheme's own notes (YPIR_2024_notes.md:173) correctly state 2.5 MB upload.
  - **Fix:** In /workspace/research/Group.1b.Stateless.Client.Stateless.Server/README.md line 18, change the YPIR Query size from "724 KB (upload)" to "2.5 MB (upload)". (Note: separately, line 19's "32 MB (download)" is also wrong — Table 2 gives 12 KB
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:19`
  - Wrong. YPIR PDF Table 2 (p.20), 32 GB YPIR Download = 12 KB. 32 MB is DoublePIR's 32 GB download. YPIR_2024_notes.md:174 correctly states 12 KB.
  - **Fix:** On line 19, change Response size from "32 MB (download)" to "12 KB (download)".
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:62-63`
  - Both values are wrong/absent from the paper. InsPIRe PDF Table 3 (p.20), 1 GB / 64 B: the InsPIRe column with Total Comm = 292 KB (Query 196 KB) has Server Time = 400 ms and Throughput = 2530 MB/s. No InsPIRe 1 GB / 64 B configuration has 960 ms or 1006 MB/s (
  - **Fix:** In research/Group.1b.Stateless.Client.Stateless.Server/README.md change line 62 server computation from "960 ms (online server time)" to "400 ms (online server time)" and line 63 throughput from "1006 MB/s (1 GB, 64 B entry)" to "2530 MB/s 
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:284-285`
  - Same error as README. InsPIRe PDF Table 3 (p.20) gives Server Time 400 ms / Throughput 2530 MB/s for the InsPIRe column with Total = 292 KB (Query 196 KB). 960 ms and 1006 MB/s do not appear for this config.
  - **Fix:** Line 284: change "960 ms (online server time)" to "400 ms (online server time)". Line 285: change "1006 MB/s (1 GB, 64 B entry)" to "2530 MB/s (1 GB, 64 B entry)". These match InsPIRe PDF Table 3 (p.20) for the Query 196 KB / Total 292 KB c
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:338-339`
  - Multiple transcription errors vs InsPIRe PDF Table 2 (p.20), 1 GB row. YPIR Server Time is 140 ms (not 148). SimpleYPIR Server Time = 600 ms (not 148) and Throughput = 1720 MB/s (not 7420) — the notes duplicated YPIR's runtime/throughput into the SimpleYPIR co
  - **Fix:** In Table 2 1 GB row: YPIR Server Time 140 ms (was 148); SimpleYPIR Server Time 600 ms (was 148) and Throughput 1720 MB/s (was 7420); KSPIR Throughput 1310 MB/s (was 1390).
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:335-339`
  - These are HintlessPIR's 8 GB values, not 1 GB. InsPIRe PDF Table 2 (p.20): 1 GB HintlessPIR = Query 128 KB, Download 1748 KB, Total 2236 KB, Server 750 ms, Throughput 1370 MB/s. The 512/3316/4188 figures match the 8 GB HintlessPIR column. Server 470 ms / Throu
  - **Fix:** In the Table 2 (1-bit, 1 GB) HintlessPIR column, set: Upload (Query) = 128 KB, Download = 1748 KB, Total Comm = 2236 KB, Server Time = 750 ms, Throughput = 1370 MB/s. Leave Upload (Keys) = 360 KB unchanged.
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:335-339`
  - InsPIRe PDF Table 2 (p.20) gives a single InsPIRe0 1 GB column: Query 384 KB, Download 36 KB, Total 504 KB, Server 120 ms, Throughput 8750 MB/s. The notes' InsPIRe_0 Query 106 / Total 226 / Server 320 do not match InsPIRe0 at all (106 KB query / ~320 ms resemb
  - **Fix:** In Table 2 (1 GB, 1-bit) InsPIRe_0 column, set: Upload (Query) 384 KB (line 335), Total Comm 504 KB (line 337), Server Time 120 ms (line 338), Throughput 8750 MB/s (line 339). Keep Keys 84 KB and Download 36 KB unchanged. Source: InsPIRe PD
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:343-350`
  - InsPIRe PDF Table 3 (p.20) has NO YPIR column for 64 B entries (columns are SimpleYPIR, KSPIR, HintlessPIR, InsPIRe^(2), InsPIRe). The values shown (Query 384, Total 858, Server 600, Throughput 1720) are a fabrication mixing YPIR's 1-bit query (384 KB) and Sim
  - **Fix:** Remove the entire "YPIR" column from the notes' Table 3 (64 B). The corrected header should be: "| Metric | SimpleYPIR | KSPIR | HintlessPIR | InsPIRe^(2) (selected) | InsPIRe |" with rows using the existing, PDF-verified SimpleYPIR/KSPIR/H
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:349`
  - Internally inconsistent. InsPIRe PDF Table 3 (p.20): Total 292 KB (Query 196 KB) -> Server 400 ms / Throughput 2530 MB/s. Server 280 ms / Throughput ~3670 MB/s belongs to the Total 404 KB (Query 308 KB) column. Also 3620 is not an exact paper value (paper is 3
  - **Fix:** In the notes Table 3 (64 B), keep the InsPIRe column's Query 196 KB / Total 292 KB and change Server Time 280 ms → 400 ms and Throughput 3620 MB/s → 2530 MB/s (PDF Table 3, 1 GB 2^24×64B, InsPIRe sub-column with Query 196 KB). Note: this ma
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:354-361`
  - InsPIRe PDF Table 4 (p.22) for 32 KB entries has columns SimpleYPIR, KSPIR, HintlessPIR, InsPIRe only (no YPIR, no InsPIRe^(2)). 1 GB values: SimpleYPIR Keys 462/Query 112/Download 228/Total 802; KSPIR Keys 2352/Query 14/Download 224/Total 2590; HintlessPIR Ke
  - **Fix:** Rebuild Table 4 (32 KB, 1 GB) from PDF p.22. Header columns: SimpleYPIR | KSPIR | HintlessPIR | InsPIRe (no YPIR, no InsPIRe^(2) standalone header — the InsPIRe block is parameter-variant sub-columns). 1 GB values — SimpleYPIR: Keys 462 KB,
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:443-448`
  - Three problems vs InsPIRe PDF Table 3 (p.20): (1) Table 3 (64 B) has no YPIR data — the YPIR row is fabricated. (2) HintlessPIR 64 B 1 GB Total Comm = 2236 KB, not 2004 KB. (3) InsPIRe Total 292 KB pairs with Server 400 ms / Throughput 2530 MB/s, not 280 ms / 
  - **Fix:** In the "1 GB database, 64 B entries (Table 3)" table: remove the YPIR column (Table 3 has no YPIR; the closest analog is SimpleYPIR: Total 802 KB / Server 600 ms / Throughput 1720 MB/s / Upload Keys 462 KB). Set HintlessPIR Total Comm = 223
- **[high|taxonomy]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:1 (heading), 25, 35, 45, 65`
  - Respire, WhisPIR, Pirouette, and NPIR are all classified Group 1a — they live under research/Group.1a.Stateless.Client.Stateful.Server/ and their notes declare `| **PIR Category** | Group 1a — Stateless Client, Stateful Server |` (Respire_2024_notes.md:38, Whi
  - **Fix:** Either (a) move the four subsections (Respire 2024, WhisPIR 2024, Pirouette 2025, NPIR 2025) out of Group.1b.Stateless.Client.Stateless.Server/README.md and into Group.1a.Stateless.Client.Stateful.Server/README.md, placed in chronological o
- **[high|benchmark]** `docs/reported/data/reported.json:2358-2372`
  - Column-misalignment against InsPIRe primary source (PDF Table 2, p.20). InsPIRe^(2) is a parameter sweep with 6 sub-columns. The 113 KB upload-query / 244-245 KB total-comm point is sub-column 4, whose server time is 440 ms and throughput 2310 MB/s. There is N
  - **Fix:** For the Query=113 KB / Total=244 KB point (InsPIRe^(2) sub-column 4), set metrics: server_time_ms=440, throughput_gbps=2.31 (paper Table 2 = 2310 MB/s; note per CLAUDE.md GiB-vs-GB convention this would be ~2.48 GB/s if the 2^33-bit DB is t
- **[high|benchmark]** `docs/reported/data/reported.json:2375-2389`
  - Column-misalignment vs PDF Table 2 (p.20). InsPIRe has 3 sub-columns for 1 GB 1-bit: query 140/196/308 KB, total 236/292/404 KB, server 650/400/280 ms, throughput 1580/2530/3670 MB/s. The 140 KB-query / 236 KB-total point (minimum-communication column) has ser
  - **Fix:** Make the point self-consistent. Recommended (keep the min-communication column to match the recorded query_size_kb=224 / total 236 KB): set server_time_ms=650 and throughput_gbps=1.58 (paper-reported 1580 MB/s). Alternatively, switch commun
- **[high|benchmark]** `docs/reported/data/reported.json:2392-2406`
  - Column-misalignment vs PDF Table 3 (p.21, 64 B entries, 1 GB). InsPIRe^(2) sub-columns: query 40/60/109/113/214/215 KB, server 1100/670/470/440/360/320 ms, throughput 930/1530/2200/2310/2880/3230 MB/s. The 109 KB-query / 241 KB-total point is sub-column 3 -> s
  - **Fix:** In the InsPIRe^(2) @ 2^24x64B entry (reported.json lines 2398-2402), keep query_size_kb=189 and response_size_kb=52 (109 KB query / 241 KB total = Table 3 sub-column 3), and change server_time_ms from 360 to 470 and throughput_gbps from 2.8
- **[high|benchmark]** `docs/reported/data/reported.json:2409-2423`
  - Column-misalignment vs PDF Table 3 (p.21). InsPIRe sub-columns for 64 B / 1 GB: query 140/196/308/532 KB, total 236/292/404/628 KB, server 650/400/280/210 ms, throughput 1580/2530/3670/4850 MB/s. The 196 KB-query / 292 KB-total point is sub-column 2 -> server 
  - **Fix:** In the 2^24x64B InsPIRe entry, keep query_size_kb=280 (keys 84 + query 196), response_size_kb=12, total 292 KB, but change server_time_ms from 280 to 400 and throughput_gbps from 3.615 to 2.53 (paper Table 3 p.21, InsPIRe sub-column 2: 400 
- **[high|benchmark]** `docs/reported/data/reported.json:2426-2440`
  - Two problems vs PDF Table 4 (p.21, 32 KB entries, 1 GB). (1) Variant label: Table 4 contains NO InsPIRe^(2) column — its scheme columns are SimpleYPIR, KSPIR, HintlessPIR, InsPIRe only; this row cannot be an InsPIRe^(2) measurement. (2) Column-misalignment: th
  - **Fix:** Relabel variant from "InsPIRe^(2)" to "InsPIRe". Keep comm as recorded (query_size_kb=196 i.e. keys84+query112, response_size_kb=96, total 292 — sub-column 3) and correct the timing to match that same column: server_time_ms=1170, throughput
- **[high|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:338-339`
  - Notes table mismatches PDF Table 2 (p.20) and is the source of the reported.json errors above. For InsPIRe^(2): query 113 KB / total 245 KB is the 440 ms / 2310 MB/s column; 480 ms does not exist in the table and 2880 MB/s is the 360 ms / 214 KB column. For In
  - **Fix:** In notes Table 2 (1 GB 1-bit), keeping the existing query/total pairings: InsPIRe^(2) (113 KB query) → Server Time 440 ms, Throughput 2310 MB/s; InsPIRe (140 KB query / 236 KB total) → Server Time 650 ms, Throughput 1580 MB/s. (Separately n
- **[medium|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:23`
  - Built on the wrong 32 MB response figure. Correct YPIR 32 GB download is 12 KB (YPIR PDF Table 2). The arithmetic should be 12 KB / 32 GB.
  - **Fix:** In research/Group.1b.Stateless.Client.Stateless.Server/README.md line 23, change the Concrete cell to: "12 KB / 32 GB ~ 0 (response independent of DB size)" — matching YPIR_2024_notes.md:178 and PDF Table 2 (p.20).
- **[medium|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:338-339`
  - Internally inconsistent vs InsPIRe PDF Table 2 (p.20). InsPIRe^(2) 1 GB has no 480 ms entry (server times are 1100,670,470,440,360,320) and no 245 KB total (totals 172,191,241,244,345,347). For InsPIRe, Total 236 KB pairs with Server 650 ms / Throughput 1580 M
  - **Fix:** Make each column internally consistent to one t-value. InsPIRe (column with Query 140 KB already in notes): Total 236 KB, Server Time 650 ms, Throughput 1580 MB/s. InsPIRe^(2) (use the column matching notes' Query 113 KB): Total 244 KB, Ser
- **[medium|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:360-361`
  - Paper Table 4 (p.22) has no InsPIRe^(2) for 32 KB. The InsPIRe-only columns at 1 GB are: Query 91/98/112/140/196/308 -> Total 271/278/292/320/376/488, Server 4270/2210/1170/640/410/280, Throughput 240/460/880/1600/2500/3620. The notes' "InsPIRe^(2)" (Total 292
  - **Fix:** In notes Table 4 (1 GB row, lines 356-361), the "InsPIRe^(2) (selected)" column is incoherent. Replace it with a single real paper column. Cleanest consistent choice matching the notes' existing Query 112: use the Total-292 column -> Server
- **[medium|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/ypir_2024/YPIR_2024_notes.md:255`
  - YPIR PDF Table 2 (p.20), 8 GB row: Tiptoe Download = 8.6 MB, not 1.7 MB. (1.7 MB is Tiptoe's download at 1 GB.) Other 8 GB values in the row are correct.
  - **Fix:** In line 255, change the Tiptoe Download cell from "1.7 MB" to "8.6 MB" (row: | | Download | 362 KB | 32 KB | 8.6 MB | 1.7 MB | 12 KB |).
- **[medium|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:335-336`
  - These are the 8 GB (2^36) row values from InsPIRe paper Table 2, not the 1 GB row. PDF Table 2 1 GB row for HintlessPIR is Upload (Query) 128 KB, Download 1748 KB (512 KB / 3316 KB appear in the 8 GB section). The notes column conflates the 8 GB HintlessPIR nu
  - **Fix:** In the notes Table 2 (1 GB = 2^33 × 1 bit), HintlessPIR column: set Upload (Query) = 128 KB and Download = 1748 KB (PDF Table 2, 1 GB row). Separately, the HintlessPIR Total Comm on line 337 should also be corrected from 4188 KB to 2236 KB,
- **[low|benchmark]** `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:321`
  - InsPIRe PDF Table 1 (p.19) shows ell_KS = '-' (not applicable) for the InsPIRe0 ring-1 (d=1024) row; only ring-2 (d=2048) has ell_KS = 3. The notes incorrectly populate ell_KS=3 for ring 1.
  - **Fix:** In line 321, change the ell_KS cell for "InsPIRe_0 (ring 1)" from 3 to -- so the row reads: | InsPIRe_0 (ring 1) | 1024 | 32 | 6.4 | 256 | -- | -- | -- | -- |
- **[low|convention]** `research/Group.1b.Stateless.Client.Stateless.Server/README.md:65`
  - Inconsistent year label: the scheme directory is npir_2026, the notes file is NPIR_2026_notes.md, the notes Paper line tags it '(2026)' (NPIR_2026_notes.md:33), and both README.md and research/README.md label it '2026 NPIR'. This README uses '2025'. (The eprin
  - **Fix:** On line 65 of research/Group.1b.Stateless.Client.Stateless.Server/README.md change "#### NPIR (2025)" to "#### NPIR (2026)" to match the directory (npir_2026), notes file Paper-line tag "(2026)", and the root README "2026 NPIR" label.

#### Group C — Client-Independent Preprocessing (2a)

- **[medium|benchmark]** `research/Group.2a.Download.Hint/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md:289`
  - The SpiralStream and SpiralStreamPack online-download values are swapped. Paper Table 8 (p.13) shows SpiralStream online download = 20 KB and SpiralStreamPack online download = 99 KB (verified: "SpiralStream 0.34 0 15 000 20 485" and "SpiralStreamPack 15 0 29 
  - **Fix:** In line 289 swap the two cells: SpiralStream online download 99 -> 20, SpiralStreamPack online download 20 -> 99. Row becomes: | Online download (KB) | 181 | 64 | 128 | 20 | 20 | 20 | 99 | **121** | **32** |
- **[medium|benchmark]** `research/Group.2a.Download.Hint/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md:312`
  - Two DoublePIR values are wrong. Per paper Table 16 (p.31, layout-verified): DoublePIR at 1 B = 0.5 (not 1.0), and at 8 B = 1.8 (not 3.1). The notes' 1.0 corresponds to the 4 B column and 3.1 corresponds to the 16 B column, i.e. the values are read shifted. The
  - **Fix:** In line 312, change the DoublePIR row from "| DoublePIR (MB) | 0.5 | 1.0 | 3.1 | 11 | 86 | 690 |" to "| DoublePIR (MB) | 0.5 | 0.5 | 1.8 | 11 | 86 | 690 |" (1 B: 0.5; 8 B: 1.8 per Table 16, p.31).
- **[medium|formula]** `research/Group.2a.Download.Hint/README.md:59`
  - Numerator has a spurious "+ log sqrt(N)" term. The paper (Incremental Single-Server PIR, Section 4.1, p.11) defines t = ceil(n log q / (log p + log sqrt(N))). The scheme's own notes file (IncrementalPIR_2026_notes.md lines 60, 170, 186, 337) correctly use the 
  - **Fix:** On line 59 of /workspace/research/Group.2a.Download.Hint/README.md, change "t = ceil((n log q + log sqrt(N)) / (log p + log sqrt(N)))" to "t = ceil(n log q / (log p + log sqrt(N)))", matching the paper (Section 4.1, p. 11) and the scheme no
- **[medium|benchmark]** `research/Group.2a.Download.Hint/frodopir_2022/FrodoPIR_2022_notes.md:356`
  - The paper (FrodoPIR, p.7) states concrete security only for PSIR (115 bits) and SOnionPIR (111 bits): "PSIR and SOnionPIR provide 115 and 111 bits of security, respectively." It gives no security-bit figure for CHKPIR; it only says CHKPIR "uses similar underly
  - **Fix:** In the "Security level" row (line 355) of the comparison table, change the CHKPIR cell from "<= 115 bits" to "not stated" (RLWE-based; not separately quantified in the paper). Keep SOnionPIR "<= 111 bits" and PSIR "<= 115 bits" unchanged, a
- **[medium|convention]** `research/Group.2a.Download.Hint/frodopir_2022/FrodoPIR_2022_notes.md:43 (first of 55 named footnote definitions; references throughout, e.g. lines 38, 39, 41, 56-92, 98-444)`
  - CLAUDE.md "Notes File Conventions" mandates footnote labels be numeric only, with ThorPIR's [^18b] as the sole exception. This file uses 55 named (non-numeric) footnote definitions plus their references. None are the documented exception. Verified as genuine f
  - **Fix:** Renumber all 55 footnotes to sequential numeric labels in order of first IN-TEXT appearance (not definition order), updating both the [^name]: definitions and every in-text [^name] reference in lockstep. By first-reference order the mapping
- **[low|benchmark]** `research/Group.2a.Download.Hint/frodopir_2022/FrodoPIR_2022_notes.md:438`
  - Internal inconsistency / typo. The financial formula (verified against FrodoPIR Table 1, p.6) is $(1.9/C x 10^-2 + 1.3 x 10^-5) per query, so the online (C-independent) component is 1.3 x 10^-5, not 1.3 x 10^-3. The same footnote's closing sentence (line 444) 
  - **Fix:** On line 438, change "(1.3*10^-3)" to "(1.3*10^-5)" so the body text matches Table 1 (p. 6) and the footnote's own value of $0.000013.
- **[low|convention]** `research/Group.2a.Download.Hint/frodopir_2022/FrodoPIR_2022_notes.md:43`
  - CLAUDE.md mandates "Footnote labels: numeric only ([^1], [^2]...) -- sole exception is ThorPIR's [^18b]." FrodoPIR is not ThorPIR, yet all ~55 of its footnote labels are non-numeric. The other three Group 2a notes files (SimplePIR/DoublePIR, VeriSimplePIR, Inc
  - **Fix:** Renumber all FrodoPIR footnote labels to sequential numerics ([^1], [^2], ...) in document-definition order, and update every in-text reference to match, per the CLAUDE.md numeric-only convention (ThorPIR's [^18b] being the sole sanctioned 
- **[low|footnote]** `ignored/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md:316`
  - The quoted sentence as written (with 'particularly from plain LWE, has remained elusive') is the Abstract phrasing (PDF lines 18-20), not the body of Section 1 p.2. The Section 1 (p.2) text reads '...this remains essentially the only known construction to date
  - **Fix:** Two acceptable corrections (author's choice): (a) keep the quote as-is but change the citation to "Abstract (p. 1)"; or (b) keep the "Section 1 (p. 2)" citation and replace the quote with the actual p.2 text: "...this remains essentially th

#### Group D — Client-Dependent Preprocessing (2b)

- **[medium|benchmark]** `research/Group.2b.Interactive.Hint/piano_2023/Piano_2023_notes.md:293 (and footnote 42, line 295)`
  - Piano paper Table 3 (p.14, verified via pdftotext line 838 'Extra space' column and the theoretical-schemes block) lists CK20's extra space as O~_λ(√n), not O~_λ(n). The per-query time O~_λ(n) for CK20 is correct, but the extra-space value is wrong. In the pap
  - **Fix:** In the table row for "Extra space", change the CK20 cell from O~_λ(n) to O~_λ(sqrt(n)). In footnote [^42], change "CK20 has O~_λ(n) per-query time and extra space." to "CK20 has O~_λ(n) per-query time and O~_λ(sqrt(n)) extra space."
- **[medium|benchmark]** `research/Group.2b.Interactive.Hint/README.md:50`
  - Contradicts the RMS24 paper. Section 3.6 (p.8) states the two-server online response overhead is 'O(1), or 4x to be precise' and the single-server overhead is 'O(√N/λ)' (confirmed p.8: 'the single-server version has O(√N/λ) amortized response overhead'). The R
  - **Fix:** In research/Group.2b.Interactive.Hint/README.md line 50, change the RMS24 "Response overhead" row. Asymptotic cell: "4x insecure baseline (two-server); O(sqrt(N)/λ) (single-server)". Concrete cell: "4x (two-server); O(sqrt(N)/λ) (single-ser
- **[medium|benchmark]** `ignored/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md:322`
  - Factually incorrect. Theorem B.1 (PDF p.38, IshaiShiWichs_2025_976.pdf) explicitly lists the offline bandwidth: '...every query takes O~(n^{1/3}) online bandwidth, O~(n^{1/6}) offline bandwidth, O~(n^{1/2}) client computation, and O~(n^{2/3}) server computatio
  - **Fix:** Line 322: change the Offline bandwidth cell from "Not explicitly stated in theorem (see [^25])" to "O_tilde(n^{1/6})". Update footnote [^25] to: "Theorem B.1 (2-server preprocessing PIR for unbounded queries) and intro Theorem 1.5: each que
- **[low|footnote]** `research/Group.2b.Interactive.Hint/thorpir_2024/ThorPIR_2024_notes.md:98 (Proof technique field) and 372 (Key Takeaways item 1)`
  - ThorPIR paper p.16 (verified via pdftotext line 767-770) states the two new convergence opportunities 'therefore reduce the number of steps we need to run the shuffle for by more than half' — the 'more than half' refers to a reduction in the number of shuffle 
  - **Fix:** In line 98 (Proof technique field), reword to: 'Refined Markov chain coupling argument. Identifies two new "convergence opportunities" where pair processes can match, increasing the per-round coupling probability and thereby reducing the nu
- **[low|formula]** `ignored/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md:276`
  - Dimensional mismatch. Per PDF Appendix A.3 (p.35), the random vector is r = (r1,r2,r3) in GF(2^k)^3 (three field elements, with r3 != 0); the matrix R derived from r is the 3x3 object in GF(2^k)^{3x3}. The notes assign r itself to GF(2^k)^{3x3}, conflating the
  - **Fix:** Replace the line-276 sentence with: "Each hint entry stores (S, pi) where pi is a special-purpose random permutation over {0,...,n^{1/3}-1}^3 (i.e. GF(2^k)^3, with k = log(n)/3) defined by a random vector r = (r1,r2,r3) in GF(2^k)^3 (with r

#### Group X — Extensions

- **[high|benchmark]** `research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md:277`
  - Transcription error in the Server Cost column. In the paper's Table 5 (p.13), the Private File Download (3GB) row for Client-Aided Gentry-Ramzan (50 generators) reports a Server Cost of 1.4782 US cents (verified via layout extract: '4,955  13.1  1,259  6  1,34
  - **Fix:** In /workspace/research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md line 277, change the Server Cost cell from "0.0016 (approximate)" to "1.4782" (a measured value in Table 5; remove the "(approximate)" qualifier since this r
- **[medium|benchmark]** `research/Group.X.Extensions/README.md:23`
  - Mislabeled row. In Table 5 (p.13, layout-verified columns: #chunks | upload | download | C.Setup | S.Setup | C.Create | S.Respond | C.Process | Cost), the values 1,532 / 1,540 / 1,594 / 1,796 are the S.Setup column; C.Setup is 0 for all Gentry-Ramzan rows. The
  - **Fix:** In research/Group.X.Extensions/README.md line 23, relabel the row header from "C.Setup (ms)" to "S.Setup (ms)" (values 1,532 / 1,540 / 1,594 / 1,796 unchanged). Per PDF Table 5 (p.13), C.Setup is 0 for all Gentry-Ramzan rows. Note also: the
- **[medium|benchmark]** `research/Group.X.Extensions/README.md:24`
  - Mislabeled row. In Table 5 (p.13) the values 3,294 / 2,688 / 3,966 / 7,980 are the C.Create (client query-creation) column, not S.Setup. The notes file's matching table (KeywordPIR_2019_notes.md line 196) correctly labels these as 'C.Create (ms)'.
  - **Fix:** In /workspace/research/Group.X.Extensions/README.md line 24, change the row label from '| S.Setup (ms) | 3,294 | 2,688 | 3,966 | 7,980 |' to '| C.Create (ms) | 3,294 | 2,688 | 3,966 | 7,980 |'. (Separately, line 23's '| C.Setup (ms) | 1,532
- **[medium|benchmark]** `research/Group.X.Extensions/README.md:10`
  - MulPIR download is wrong. Both Table 1 (p.7: MulPIR 288B = 119 up / 119 down) and Table 3 (p.12: MulPIR d=2 = 122 up / 119 down) report MulPIR download = 119 kB, not 122 kB. Consequently the total of 244 kB (= 122+122) is wrong; it should be 241 kB (= 122 uplo
  - **Fix:** In /workspace/research/Group.X.Extensions/README.md line 10 change MulPIR (d=2) Download size from '122 kB' to '119 kB'; line 11 change Total communication from '244 kB' to '241 kB'.
- **[low|benchmark]** `research/Group.X.Extensions/README.md:5`
  - Internal n-size inconsistency. The header says n=2^20 (=1,048,576), but the SealPIR Expand=145 / Response=1,020 figures are the n=2^18 (262,144) column of Table 3 (p.12), while the SealPIR Server Cost=0.0040 is the n=2^20 value (the n=2^18 cost is 0.0033). One
  - **Fix:** In research/Group.X.Extensions/README.md line 13-14, change the SealPIR column to the n=2^20 timings to match the header and the 0.0040 cost: Server Expand (ms) 145 -> 294, and Server Response (ms) 1,020 -> 3,520. (Alternatively, keep timin
- **[low|benchmark]** `research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md:69`
  - Server-time figures do not match any single Table 3 (p.12) column and are internally inconsistent with the listed costs. SealPIR Expand+Response = 145+1,020 = 1,165 at n=2^18 (cost 0.0033) or 294+3,520 = 3,814 at n=2^20 (cost 0.0040) - neither equals 1,185. Mu
  - **Fix:** Pin the SealPIR and MulPIR rows to a single database size n=2^18 (262144), d=2, from Table 3 (p.12): SealPIR Server Time = 1,165 ms (Expand 145 + Respond 1020), Server Cost = 0.0033; MulPIR Server Time = 2,310 ms (Expand 391 + Respond 1919)
- **[low|benchmark]** `research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md:346`
  - The ElGamal and Damgard-Jurik entries in this 1MB-database comparison table pull the wrong Table 5 (p.13) columns. ElGamal S.Respond should be 10,105 (the value 893 is ElGamal's C.Create); ElGamal S.Setup should be 283 (the value 29 is its C.Create). Damgard-J
  - **Fix:** Two corrections only: (1) ElGamal S.Respond: change 893 -> 10,105 (893 is C.Create). (2) Damgård–Jurik S.Setup: change 40,636 -> 2 (40,636 is C.Setup). Do NOT change ElGamal S.Setup — its current value 29 is correct (it is the S.Setup colum
- **[low|taxonomy]** `research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md:324`
  - Construction numbering disagrees with the paper and with this note's own protocol-phases section. In the paper (Section 5, p.10) the formal 'Construction 1' is the cuckoo-hashing construction ('Construction 1. Let (Cuckoo.KeyGen, Cuckoo.Insert) be a cuckoo has
  - **Fix:** Relabel so cuckoo hashing alone is "Construction 1" (matching paper §5 p.10 and the note's own line 162), and simple hashing is presented as an unnumbered warm-up. Concretely: change line 324 from "#### Construction 1: Simple Hashing" to "#
- **[low|protocol]** `research/Group.X.Extensions/keywordpir_2019/KeywordPIR_2019_notes.md:143`
  - The extraction step does not match Procedure 10 of the paper (p.9), which computes h := g^{q_1 q_2} and h' := g'^{q_1 q_2} (the recovery uses the base g^{q_1 q_2}, the order-pi_k subgroup generator). The note's 'h = g'^{q_2}' has no counterpart in the procedur
  - **Fix:** In line 143, replace "Compute h = g'^{q_2}, h' = g'^{q_1*q_2}; solve for d via Pohlig-Hellman in Z_{pi_k}" with "Compute h = g^{q_1*q_2}, h' = g'^{q_1*q_2}; solve h' = h^d for d via Pohlig-Hellman in the order-pi_k subgroup" (per Procedure 

#### Group M — Multiserver

- **[medium|benchmark]** `multiserver/treepir_2023/TreePIR_2023_notes.md:242`
  - The paper (Figure 7, p.23 of eprint 2023/204) reports 16.6 KB as the total end-to-end 'Online Bandwidth' for TreePIR, NOT a per-server response size. Per server the response is sqrt(N)*w = 2^16 bits = 8 KB (~8.3 KB). The note even contradicts itself: line 245 
  - **Fix:** Two valid corrections (pick one, do not do both). Option A (keep per-server row, fix value): change line 242 to "| Response size (per server) | O(sqrt(N) * w) | ~8 KB (8192 bytes = sqrt(N)*w bits, N=2^32, w=1 bit) | Online |". Option B (kee
- **[medium|benchmark]** `research/multiserver/asymmetric.role/treepir_2023/TreePIR_2023_notes.md:209`
  - Same mislabel as the multiserver/ copy: the paper's Figure 7 (p.23) reports 16.6 KB as the total 'Online Bandwidth' (end-to-end), not a per-server download. Per server it is ~8.3 KB (sqrt(2^32) bits = 8 KB). Footnote 9 of this same note correctly attributes 16
  - **Fix:** On line 209, keep the row labeled "(per server)" and replace the concrete value with the per-server download: change "16.6 KB plain; ~50 KB with SPIRAL" to "~8 KB plain (√N·w bits); ~50 KB with SPIRAL" — OR, to preserve the paper-reported f
- **[low|footnote]** `research/multiserver/asymmetric.role/tapir_2025/TAPIR_2025_notes.md:283`
  - Misquote of the Table 1 caption. The TAPIR PDF (eprint 2025/2177, p.11) reads '...are omitted due to high Pointproofs setup costs' (single 'high'). The note inserts an erroneous duplicate 'to high'. The same misquote appears three times in the file (footnote 2
  - **Fix:** Replace all three occurrences of "high to high Pointproofs setup costs" with "high Pointproofs setup costs" (lines 206, 280, 283).
- **[low|footnote]** `research/multiserver/symmetric.dpf/bgi_2015/BGI_2015_notes.md:5`
  - Possible citation-URL mismatch. The local PDF is the EuroCrypt 2015 paper 'Function Secret Sharing' (Boyle-Gilboa-Ishai), confirmed from its title page/abstract. However the linked eprint 2018/707 is a later, distinct report ('Function Secret Sharing: Improvem
  - **Fix:** On line 5, replace the URL https://eprint.iacr.org/2018/707 with the EuroCrypt 2015 source that matches the local PDF and the "(EuroCrypt 2015)" label: https://www.iacr.org/archive/eurocrypt2015/90560300/90560300.pdf — yielding: | **Paper**

#### Group CC — Cross-cutting / classification

- **[high|taxonomy]** `research/README.md:13-39 (classification table)`
  - HarmonyPIR is a real single-server scheme: it lives at research/Group.2b.Interactive.Hint/harmonypir_2026/, its notes declare `| **PIR Category** | Group 2b — Interactive-Hint |` (HarmonyPIR_2026_notes.md:39), and it is present in the data pipeline (docs/repor
  - **Fix:** Add to the Group 2b block of research/README.md (after the WangRen row, line 39): `| HarmonyPIR | 2b | Builds on WangRen (2b): replaces T partitioned permutations with a single size-2N permutation-based hint row; interactive per-window prep
- **[high|taxonomy]** `README.md:Group 2b — Interactive-Hint section (table rows ThorPIR..Piano)`
  - HarmonyPIR (Group.2b.Interactive.Hint/harmonypir_2026/, PIR Category 'Group 2b' per HarmonyPIR_2026_notes.md:39) is a single-server in-scope scheme but is absent from the Group 2b group section in README.md, making README.md inconsistent with the directory con
  - **Fix:** In README.md after line 69 (Piano row) add a Group 2b table row, e.g.: `| 2026 [HarmonyPIR](research/Group.2b.Interactive.Hint/harmonypir_2026/HarmonyPIR_2026_notes.md) | Stateful single-server PIR via format-preserving encryption; single p

#### Refuted (no change)

- `research/Group.1a.Stateless.Client.Stateful.Server/mulpir_2019/mulpir_2019_notes.md:1` — Opened /workspace/research/Group.1a.Stateless.Client.Stateful.Server/mulpir_2019/mulpir_2019_notes.md. Line 1 title is "## MulPIR — Engineering Notes"; line 30 already carries an i
- `research/Group.1b.Stateless.Client.Stateless.Server/inspire_2025/InsPIRe_2025_notes.md:336-337` — InsPIRe PDF Table 2 (1-bit entries), 1 GB = 2^33 row, on p.21 reads: SimpleYPIR Download = 52 KB, Total Comm = 626 KB; KSPIR Download = 52 KB, Total Comm = 2418 KB. These EXACTLY m
- `research/Group.2b.Interactive.Hint/plinko_2024/Plinko_2024_notes.md:318 (Performance Benchmarks table, Piano row)` — Opened the primary source: Plinko_2024_318.pdf, Figure 2 (p.3). The Piano [ZPZS24] OWF row reads — Update Time: Worst-case = n (red), Amortized = polylog(n) (green); Update Comm.: 
- `research/Group.X.Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md:128` — The cited PDF text is column-scrambled (two-column layout). Reconstructed logical order from DistributionalPIR_2025_132.txt: the SimplePIR paragraph runs line 1419→1388: "when usin
- `research/Group.X.Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md:360` — Read the source PDF page 11 (Section 7.2.1, "Performance results"). The paragraph spans two columns. Left column ends: "...when using SimplePIR, our construction increases the quer
