## Group A — FHE-Based

| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Rate | F |
|--------|------|-----------|--------------|------------|------------------|------|---|
| XPIR (2014) | 2014 | 32.0 | 784.0 | — | — | — | — |
| XPIR (2016) | 2016 | — | — | — | 2.25 | — | 5.50 |
| SealPIR | 2018 | 64.0 | 256.0 | 1,650 | — | — | 5.20 |
| MulPIR | 2019 | 26,624 | 0.57 | 3,000 | — | 0.44 | 2.27 |
| OnionPIR | 2021 | 64.0 | 128.0 | 101,000 | — | — | 4.20 |
| Addra/FastPIR | 2021 | 1,024 | 64.0 | 398.0 | — | — | — |
| CwPIR | 2022 | 216.0 | 106.0 | 9,700 | — | — | — |
| Spiral | 2022 | 14.0 | 84.0 | 24,520 | 0.32 | 0.36 | — |
| FrodoPIR | 2022 | 4,096 | 3.56 | 825.4 | 1.27 | — | 3.56 |
| ThorPIR | 2024 | 389.0 | 389.0 | 7,600 | — | — | — |
| OnionPIRv2 | 2025 | 16.0 | 13.5 | 800.0 | 1.11 | — | 3.60 |

## Group B — Stateless

| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Offline (MB) |
|--------|------|-----------|--------------|------------|------------------|-------------|
| HintlessPIR | 2023 | 453.0 | 3,080 | 613.0 | 1.75 | — |
| YPIR | 2024 | 724.0 | 32,768 | 2,640 | 12.1 | — |
| Respire | 2024 | 4.10 | 2.00 | 1,260 | 0.20 | 3.90 |
| WhisPIR | 2024 | 20.0 | 700.0 | 15,000 | — | — |
| Pirouette | 2025 | 0.036 | 2.00 | 60,000 | 0.14 | — |
| InsPIRe | 2025 | 280.0 | 12.0 | 960.0 | 1.01 | — |
| NPIR | 2025 | 84.0 | 128.0 | 14,870 | 0.55 | — |
| VIA | 2025 | 674.8 | 15.5 | 10,286 | 3.11 | — |

## Group C — Client-Indep. Preproc.

| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Throughput (GB/s) | Hint (MB) |
|--------|------|-----------|--------------|------------|------------------|----------|
| SimplePIR | 2022 | 120.0 | 120.0 | — | 10.0 | 121.0 |
| DoublePIR | 2022 | 345.0 | 345.0 | — | 7.40 | 16.0 |
| VeriSimplePIR | 2024 | — | — | — | — | — |
| BarelyDoublyEfficient | 2025 | 1,500 | 1,500 | 500.0 | — | — |
| IncrementalPIR | 2026 | 240.0 | 240.0 | 95.0 | 10.5 | 241.0 |

## Group D — Client-Dep. Preproc.

| Scheme | Year | Query (KB) | Response (KB) | Server (ms) | Client (ms) | Storage (MB) | Impl? |
|--------|------|-----------|--------------|------------|------------|-------------|-------|
| CK20 | 2019 | 28.0 | 28.0 | 5,000 | — | — | No |
| IncPIR | 2021 | 8.18 | 2.00 | 0.10 | 7.87 | — | Yes |
| Piano | 2023 | 100.0 | 0.064 | 11.9 | 11.9 | 839.0 | Yes |
| TreePIR | 2023 | 2.00 | 16.6 | 1,754 | 1.00 | — | Yes |
| RMS24 | 2023 | 34.0 | 0.064 | 2.70 | 1.00 | — | Yes |
| IshaiShiWichs | 2024 | 4.00 | 4.00 | 2,000 | — | — | No |
| Plinko | 2024 | 32.0 | 0.032 | 5.00 | — | 0.10 | No |
| SinglePass | 2024 | 0.68 | 0.68 | — | 0.020 | — | Yes |
| WangRen | 2024 | 2.50 | 0.032 | 0.50 | — | 0.034 | No |

## Group X — Extensions

| Scheme | Year | Model | Key Metric |
|--------|------|-------|-----------|
| KeywordPIR | 2019 | keyword (optimized SealPIR) | See notes |
| DistributionalPIR | 2025 | distributional | See notes |

