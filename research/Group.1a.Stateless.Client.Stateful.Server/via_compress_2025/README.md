## VIA Compress — Engineering Notes

VIA Compress (VIA-C in the paper) and its Batched variant (VIA-B) require an offline upload of 14.8 MB of per-client evaluation keys (LWE-to-RLWE, RLWE-to-RGSW, response compression). This places them in Group 1a: the server becomes stateful (stores per-client keys), while the client remains "stateless" in the taxonomy sense — it holds its own secret key but does not download any DB-dependent hint from the server. The 14.8 MB flows client → server, not server → client, which distinguishes 1a from Group 2a (where the server sends DB-dependent hints to the client).

VIA Compress shares the same paper, PDF, and engineering notes as VIA Hintless (the base variant, Group 1b):

- **PDF**: [../../Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_2074.pdf](../../Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_2074.pdf)
- **Notes**: [../../Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_notes.md](../../Group.1b.Stateless.Client.Stateless.Server/via_2025/VIA_2025_notes.md)
