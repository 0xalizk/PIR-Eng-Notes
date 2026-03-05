## Universal PIR Interface — System Architecture

```
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  EDGE CONSUMERS                                                         ║
 ║                                                                         ║
 ║   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐       ║
 ║   │  Wallet  │     │ Frontend │     │   dApp   │     │   Bot    │       ║
 ║   └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘       ║
 ║        │                │                │                │             ║
 ║        │ eth_getBalance │ eth_call       │ eth_getLogs    │             ║
 ║        │ eth_getProof   │ eth_getStorage │ eth_getBlock   │             ║
 ╚════════╪════════════════╪════════════════╪════════════════╪═════════════╝
          │                │                │                │
          └───────┬────────┴───────┬────────┘                │
                  │  Standard RPC  │                         │
                  ▼                ▼                         ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  WALLET SDK  (single integration point — consolidates adapter logic)    ║
 ║                                                                         ║
 ║   Consumers call standard Ethereum JSON-RPC.                            ║
 ║   The SDK intercepts and routes through the PIR adapter transparently.  ║
 ╚══════════════════════════════════╤══════════════════════════════════════╝
                                    │
                                    │  RPC calls
                                    ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  CLIENT-SIDE ADAPTER                                                    ║
 ║                                                                         ║
 ║  ┌───────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  ║
 ║  │ RPC → Schema  │  │  Hint / Preproc  │  │   Schema Router          │  ║
 ║  │   Mapper      │  │    Storage       │  │                          │  ║
 ║  │               │  │                  │  │  1. On first contact     │  ║
 ║  │ Translates    │  │ Persists client- │  │     with each engine,    │  ║
 ║  │ eth_* calls   │  │ side Preprocess- │  │     calls scheme_info()  │  ║
 ║  │ into GraphQL  │  │ Sessions and     │  │     and configures the   │  ║
 ║  │ field lookups │  │ resulting hints  │  │     client (stateful     │  ║
 ║  │               │  │ for stateful     │  │     vs stateless,        │  ║
 ║  │               │  │ schemes          │  │     storage budget).     │  ║
 ║  │               │  │                  │  │                          │  ║
 ║  │               │  │                  │  │  2. Fans out genuine +   │  ║
 ║  │               │  │                  │  │     decoy queries to     │  ║
 ║  │               │  │                  │  │     all k engines.       │  ║
 ║  │               │  │                  │  │                          │  ║
 ║  │               │  │                  │  │  3. Per genuine engine:  │  ║
 ║  │               │  │                  │  │     receives answer      │  ║
 ║  │               │  │                  │  │     from Main and        │  ║
 ║  │               │  │                  │  │     Sidecar in parallel; │  ║
 ║  │               │  │                  │  │     drops whichever is   │  ║
 ║  │               │  │                  │  │     null; exactly one    │  ║
 ║  │               │  │                  │  │     will carry the       │  ║
 ║  │               │  │                  │  │     entry.               │  ║
 ║  └───────────────┘  └──────────────────┘  └──────────────────────────┘  ║
 ╚══════════════════════════════════╤══════════════════════════════════════╝
                                    │
                                    │  GraphQL queries
                                    ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  GRAPHQL SCHEMA  (fixed intermediate representation of Ethereum state)  ║
 ║                                                                         ║
 ║   account(addr)         → { balance, nonce, codeHash, storageRoot }     ║
 ║   storage(addr, slot)   → bytes32                                       ║
 ║   receipt(txHash)       → { logs[], status, gasUsed, blockNumber }      ║
 ║   block(number | hash)  → { header, transactions[], receipts[] }        ║
 ║   code(addr)            → bytes                                         ║
 ║   log(filter)           → { topics[], data, address, txHash }           ║
 ╚══════════════════════════════════╤══════════════════════════════════════╝
                                    │
                                    │  abstract PIR calls
                                    ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  ABSTRACT PIR INTERFACE  (contract all engines implement)               ║
 ║                                                                         ║
 ║   begin_preprocess(server_endpoint, shard_id)                           ║
 ║       → PreprocessSession    # initiates offline protocol;              ║
 ║                              # may be interactive (client↔server)       ║
 ║                              # or download-only (server→client);        ║
 ║                              # session drives the exchange and          ║
 ║                              # yields client_hints on completion.       ║
 ║                                                                         ║
 ║   query(index, hints?) → entry   # single-round PIR retrieval           ║
 ║   update(delta)   → client_hints'    # incremental hint refresh         ║
 ║   scheme_info()   → {                                                   ║
 ║                        type,          # stateful | stateless            ║
 ║                        comm_cost,     # bytes per query                 ║
 ║                        storage_req,   # client-side bytes required      ║
 ║                        rounds,        # online round-trips              ║
 ║                        preprocess_mode  # interactive | download        ║
 ║                      }                                                  ║
 ║                                                                         ║
 ║  NOTE: scheme_info() is called by the Schema Router (Adapter layer)     ║
 ║  before preprocessing begins. The Router uses the returned profile      ║
 ║  to decide, per shard independently, whether to invoke begin_preprocess ║
 ║  (client-stateful path) or skip it (client-stateless path). No global   ║
 ║  scheme selection is performed at this layer.                           ║
 ║                                                                         ║
 ╚═════╤════════════╤════════════╤════════════╤════════════════════════════╝
       │            │            │            │
       │ genuine    │ decoy      │ decoy      │ decoy
       │ query      │ query      │ query      │ query
       ▼            ▼            ▼            ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  SHARDED PIR ENGINES  (k engines: d1 ... dk)                            ║
 ║                                                                         ║
 ║  The adapter fans out to ALL k engines in parallel.                     ║
 ║  Only 1 carries the genuine query; the other k-1 are decoys.            ║
 ║  The server cannot distinguish genuine from decoy.                      ║
 ║                                                                         ║
 ║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ║
 ║  │ Engine d1   │  │ Engine d2   │  │ Engine d3   │  │ Engine dk   │     ║
 ║  │ * genuine   │  │   decoy     │  │   decoy     │  │   decoy     │     ║
 ║  │             │  │             │  │             │  │             │     ║
 ║  │ ┌────┬────┐ │  │ ┌────┬────┐ │  │ ┌────┬────┐ │  │ ┌────┬────┐ │     ║
 ║  │ │Main│Side│ │  │ │Main│Side│ │  │ │Main│Side│ │  │ │Main│Side│ │     ║
 ║  │ │Eng.│car │ │  │ │Eng.│car │ │  │ │Eng.│car │ │  │ │Eng.│car │ │     ║
 ║  │ └──┬─┴──┬─┘ │  │ └──┬─┴──┬─┘ │  │ └──┬─┴──┬─┘ │  │ └──┬─┴──┬─┘ │     ║
 ║  │    │    │   │  │    │    │   │  │    │    │   │  │    │    │   │     ║
 ║  └────┼────┼───┘  └────┼────┼───┘  └────┼────┼───┘  └────┼────┼───┘     ║
 ║       │    │           │    │           │    │           │    │         ║
 ║   main_ans sidecar_ans                                                  ║
 ║   (one non-null, one null -- resolved by adapter Schema Router)         ║
 ╚═══════╪════╪═══════════╪════╪═══════════╪════╪═══════════╪════╪═════════╝
         │    │           │    │           │    │           │    │
         ▼    ▼           ▼    ▼           ▼    ▼           ▼    ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  SIDECAR PATTERN (per-engine detail)                                    ║
 ║                                                                         ║
 ║   Main Engine               Sidecar Engine                              ║
 ║   ─────────────             ──────────────                              ║
 ║   Preprocessed snapshot     Recent updates (last epoch)                 ║
 ║   of the shard.             Not yet folded into snapshot.               ║
 ║   Bulk of the data.         Small, frequently refreshed.                ║
 ║                                                                         ║
 ║   query(idx) on Main    --> answer1  (non-null if key in snapshot)      ║
 ║   query(idx) on Sidecar --> answer2  (non-null if key updated recently) ║
 ║                                                                         ║
 ║   Exactly one of {answer1, answer2} is non-null for any given key.      ║
 ║   The Adapter's Schema Router receives both, drops the null,            ║
 ║   and returns the surviving answer to the caller.                       ║
 ║   No merge logic lives below the adapter layer.                         ║
 ║                                                                         ║
 ║   On epoch boundary: fold sidecar into main, rebuild preprocessing.     ║
 ╚═════════════════════════════════════════════════════════════════════════╝
         │                     │                     │
         ▼                     ▼                     ▼
 ╔═════════════════════════════════════════════════════════════════════════╗
 ║  DATA SHARDS  (each engine maps to one Ethereum data type / partition)  ║
 ║                                                                         ║
 ║  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         ║
 ║  │ Hot State  │  │  Archival  │  │  Receipts  │  │  Contract  │  ...    ║
 ║  │ (latest    │  │  State     │  │  & Logs    │  │  Code      │         ║
 ║  │ accounts,  │  │  (frozen   │  │            │  │            │         ║
 ║  │ storage)   │  │  epochs)   │  │            │  │            │         ║
 ║  └────────────┘  └────────────┘  └────────────┘  └────────────┘         ║
 ╚═════════════════════════════════════════════════════════════════════════╝
```
