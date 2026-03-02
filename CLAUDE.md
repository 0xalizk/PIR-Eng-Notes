# PIR Engineering Notes — Project Conventions

## Scope
- Single-server PIR schemes only (multi-server excluded)
- Scheme grouping based on [this taxonomy](https://hackmd.io/@keewoolee/SJyGoXCzZe#Taxonomy)
- Group X excluded from top-level scatter plots (different problem class)
- Cross-group filing exceptions are documented in root README

## File Naming
- **Folders**: always lowercase — `<scheme>_<year>/` (e.g., `hintlesspir_2023/`). Avoid spaces in folders and file names, use '.' instead.
- **Notes files**: preserve scheme's canonical capitalization — `<Scheme>_<year>_notes.md` (e.g., `HintlessPIR_2023_notes.md`). Group A files are all-lowercase as a historical artifact; do not "fix" this.
- **PDFs**: keep original filenames, do not rename
- **Group directories**: `Group.<LETTER>.<Description>` (e.g., `Group.B.Stateless.Single.Server.PIR`)

## Notes File Conventions
- Title: `## <Scheme> — Engineering Notes` (em-dash `—`, never `--`)
- Headings: `##` max (title), `###` for sections, `####` for subsections — never use `#`
- Section "Cryptographic Foundation" (singular, not "Foundations")
- Footnote labels: numeric only (`[^1]`, `[^2]`...) — sole exception is ThorPIR's `[^18b]`

## Data Pipeline
- `docs/data/pir_data.json` is the source of truth for paper-reported benchmarks (symlinked from `data/pir_data.json`)
- Units: communication in KB, computation in ms, throughput in GB/s, storage in MB
- Tiers: 1 = exact benchmarks, 2 = approximate from figures, 3 = derived from asymptotics 
- Site title "PIR Benchs" is intentional abbreviation — do not "correct" it

## GitHub Pages Site
- Location: `docs/` (HTML + Plotly.js)
- `.nojekyll` in `docs/` disables Jekyll
- Charts use Plotly 2.35.2 via CDN with SRI hash
- After `renderCharts()`, anchor scroll is re-triggered with a 600ms delay (Plotly is async)
