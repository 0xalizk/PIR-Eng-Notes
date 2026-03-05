## Universal PIR Interface — System Architecture

Full-system schematic for a sharded Ethereum PIR deployment with a universal
interface layer. Corresponds to the design in Sections 5 and 7 of the Ethereum
PIR design post (notes.ethereum.org).

```
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  EDGE CONSUMERS                                                         ║
 ║                                                                         ║
 ║    ┌──────────┐      ┌──────────┐      ┌──────────┐    ┌──────────┐    ║
 ║    │  Wallet  │      │ Frontend │      │   dApp   │    │   Bot    │    ║
 ║    └────┬─────┘      └────┬─────┘      └────┬─────┘    └────┬─────┘    ║
 ║         │                 │                  │               │          ║
 ║         │  eth_getBalance │  eth_call        │  eth_getLogs  │          ║
 ║         │  eth_getProof   │  eth_getStorage  │  eth_getBlock │          ║
 ╚═════════╪═════════════════╪══════════════════╪═══════════════╪══════════╝
           │                 │                  │               │
           └────────┬────────┴─────────┬────────┘               │
                    │    Standard RPC  │                         │
                    ▼                  ▼                         ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  WALLET SDK  (single integration point — consolidates adapter logic)    ║
 ║                                                                         ║
 ║    Consumers call standard Ethereum JSON-RPC.                           ║
 ║    The SDK intercepts and routes through the PIR adapter transparently. ║
 ╚═══════════════════════════════════╤═════════════════════════════════════╝
                                     │
                                     │  RPC calls
                                     ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  CLIENT-SIDE ADAPTER                                                    ║
 ║                                                                         ║
 ║  ┌────────────────┐  ┌───────────────────┐  ┌────────────────────────┐  ║
 ║  │  RPC → Schema  │  │   Hint / Preproc  │  │    Schema Router       │  ║
 ║  │    Mapper      │  │     Storage        │  │                        │  ║
 ║  │                │  │                    │  │  Maps GraphQL fields   │  ║
 ║  │ Translates     │  │  Persists client-  │  │  to the correct       │  ║
 ║  │ eth_* calls    │  │  side state when   │  │  shard / engine       │  ║
 ║  │ into GraphQL   │  │  using stateful    │  │  for each query       │  ║
 ║  │ field lookups  │  │  PIR schemes       │  │                        │  ║
 ║  └────────────────┘  └───────────────────┘  └────────────────────────┘  ║
 ╚═══════════════════════════════════╤═════════════════════════════════════╝
                                     │
                                     │  GraphQL queries
                                     ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  GRAPHQL SCHEMA  (fixed intermediate representation of Ethereum state)  ║
 ║                                                                         ║
 ║    account(addr)         → { balance, nonce, codeHash, storageRoot }    ║
 ║    storage(addr, slot)   → bytes32                                      ║
 ║    receipt(txHash)       → { logs[], status, gasUsed, blockNumber }     ║
 ║    block(number | hash)  → { header, transactions[], receipts[] }       ║
 ║    code(addr)            → bytes                                        ║
 ║    log(filter)           → { topics[], data, address, txHash }          ║
 ╚═══════════════════════════════════╤═════════════════════════════════════╝
                                     │
                                     │  abstract PIR calls
                                     ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  ABSTRACT PIR INTERFACE  (contract all engines implement)               ║
 ║                                                                         ║
 ║    preprocess(db)  → client_hints     # offline, may store client state ║
 ║    query(index, hints?) → entry       # single-round PIR retrieval     ║
 ║    update(delta)   → client_hints'    # incremental hint refresh       ║
 ║    scheme_info()   → { type, comm_cost, storage_req, rounds }          ║
 ║                                                                         ║
 ║  ┌─────────────────────────────────────────────────────────────────┐    ║
 ║  │  Scheme Selection (decision hint)                               │    ║
 ║  │                                                                 │    ║
 ║  │    client_storage_budget > threshold ?                          │    ║
 ║  │       │                                                         │    ║
 ║  │       ├── YES → Client-Stateful    (Piano, IncPIR, TreePIR)    │    ║
 ║  │       │         Low comm, requires local hint ~√n               │    ║
 ║  │       │                                                         │    ║
 ║  │       └── NO  → Client-Stateless   (SealPIR, YPIR, Spiral)    │    ║
 ║  │                 Higher comm, zero client storage                │    ║
 ║  └─────────────────────────────────────────────────────────────────┘    ║
 ╚══════╤════════════╤════════════╤════════════╤══════════════════════════╝
        │            │            │            │
        │ genuine    │ decoy      │ decoy      │ decoy
        │ query      │ query      │ query      │ query
        ▼            ▼            ▼            ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  SHARDED PIR ENGINES   (k engines: d₁ … dₖ)                            ║
 ║                                                                         ║
 ║  The adapter fans out to ALL k engines in parallel.                     ║
 ║  Only 1 carries the genuine query; the other k−1 are decoys.           ║
 ║  The server cannot distinguish genuine from decoy.                      ║
 ║                                                                         ║
 ║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  ║
 ║  │  Engine d₁   │ │  Engine d₂   │ │  Engine d₃   │ │  Engine dₖ   │  ║
 ║  │  ★ genuine   │ │    decoy     │ │    decoy     │ │    decoy     │  ║
 ║  │              │ │              │ │              │ │              │  ║
 ║  │  ┌────┬────┐ │ │  ┌────┬────┐ │ │  ┌────┬────┐ │ │  ┌────┬────┐ │  ║
 ║  │  │Main│Side│ │ │  │Main│Side│ │ │  │Main│Side│ │ │  │Main│Side│ │  ║
 ║  │  │Eng.│car │ │ │  │Eng.│car │ │ │  │Eng.│car │ │ │  │Eng.│car │ │  ║
 ║  │  └──┬─┴──┬─┘ │ │  └──┬─┴──┬─┘ │ │  └──┬─┴──┬─┘ │ │  └──┬─┴──┬─┘ │  ║
 ║  │     │    │   │ │     │    │   │ │     │    │   │ │     │    │   │  ║
 ║  └─────┼────┼───┘ └─────┼────┼───┘ └─────┼────┼───┘ └─────┼────┼───┘  ║
 ║        │    │           │    │           │    │           │    │       ║
 ╚════════╪════╪═══════════╪════╪═══════════╪════╪═══════════╪════╪═══════╝
          │    │           │    │           │    │           │    │
          ▼    ▼           ▼    ▼           ▼    ▼           ▼    ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  SIDECAR PATTERN (per-engine detail)                                    ║
 ║                                                                         ║
 ║    Main Engine               Sidecar Engine                             ║
 ║    ─────────────             ──────────────                             ║
 ║    Preprocessed snapshot     Recent updates (last epoch)                ║
 ║    of the shard.             Not yet folded into snapshot.              ║
 ║    Bulk of the data.         Small, frequently refreshed.               ║
 ║                                                                         ║
 ║    query(idx) on Main   ──►  answer₁                                    ║
 ║    query(idx) on Sidecar ──► answer₂                                    ║
 ║    final = merge(answer₁, answer₂)                                      ║
 ║                                                                         ║
 ║    On epoch boundary: fold sidecar into main, rebuild preprocessing.    ║
 ╚═══════════════════════════════════════════════════════════════════════════╝
          │                     │                     │
          ▼                     ▼                     ▼
 ╔═══════════════════════════════════════════════════════════════════════════╗
 ║  DATA SHARDS  (each engine maps to one Ethereum data type / partition)  ║
 ║                                                                         ║
 ║  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐           ║
 ║  │  Hot State │ │  Archival  │ │  Receipts  │ │  Contract  │   ...     ║
 ║  │  (latest   │ │  State     │ │  & Logs    │ │  Code      │           ║
 ║  │  accounts, │ │  (frozen   │ │            │ │            │           ║
 ║  │  storage)  │ │  epochs)   │ │            │ │            │           ║
 ║  └────────────┘ └────────────┘ └────────────┘ └────────────┘           ║
 ╚═══════════════════════════════════════════════════════════════════════════╝
```

### Legend

| Symbol | Meaning |
|--------|---------|
| `★` | Genuine query (exactly 1 per fan-out) |
| `Main Eng.` | Main PIR engine over a preprocessed DB snapshot |
| `Sidecar` | Lightweight PIR engine over recent (mutable) updates |
| `d₁ … dₖ` | k sharded engines; the adapter queries all k in parallel |
| `→` | Data flow direction (top to bottom = request path) |

### Key Design Points

- **Transparency**: Edge consumers use unmodified `eth_*` RPC calls. The Wallet
  SDK and adapter handle all PIR mechanics invisibly.
- **Fixed IR**: The GraphQL schema is the stable contract between the adapter
  and the PIR backend. Adding a new RPC method only requires a new mapper — the
  engine layer is untouched.
- **Decoy queries**: Every request fans out to all k engines. Since the server
  sees identical-looking queries on every shard, it learns nothing about which
  shard the client actually cares about.
- **Sidecar pattern**: Ethereum state mutates every ~12 s. The sidecar absorbs
  recent writes so the main engine's expensive preprocessing isn't repeated
  every block. On epoch boundaries the sidecar folds into the main engine.
- **Scheme flexibility**: The abstract interface lets operators swap PIR schemes
  per shard (e.g., a stateful scheme for hot state where clients query
  repeatedly, a stateless scheme for archival lookups).
