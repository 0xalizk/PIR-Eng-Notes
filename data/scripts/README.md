
#### Generating plots 

```bash
cd data/  # (formerly Visualization/)
uv venv && uv pip install matplotlib seaborn pandas numpy adjustText
uv run scripts/generate_all.py
```

All outputs go to `output/`.

#### Deps

- Python 3.10+
- matplotlib, seaborn, pandas, numpy, adjustText
