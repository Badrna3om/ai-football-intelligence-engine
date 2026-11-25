# Repository Scope & Production Dependency

**Review date:** 26 November 2026  
**Audience:** Maintainers, reviewers, prospective employers and security reviewers

## What this public repository contains

This repository mixes several related but **operationally different** components:

| Component | Classification | Public exposure |
| --- | --- | --- |
| `workflows/AI-Football-Intelligence-Engine.json` | Portfolio-oriented match analysis prototype | Sanitized example workflow |
| `motion-renderer/` | Media-rendering source and templates | **Public implementation**, not a sample-only diagram |
| `cloud-media-worker/` | Media acquisition and transfer implementation | **Public implementation** |
| `.github/workflows/` | Automation pipelines and dispatch handlers | **Some are active production dependencies** |
| `render-requests/`, `delivery-requests/` | Historical processing/trigger artifacts | Operational examples; assess each before reuse |
| `README.md`, `examples/`, `SETUP.md` | Supporting documentation | Public technical reference |

The public [TACTIC × AMER portfolio case study](https://github.com/Badrna3om/tactic-ai-media-platform) is intentionally high-level. **Do not conflate its private-system disclosure policy with this repository's public code.** Being publicly accessible is not evidence that every contained file is safe or authorized for third-party reuse.

## Confirmed operational dependency

The repository's GitHub Actions history included **successful `repository_dispatch` runs for the Cloud Media Worker on 25 November 2026**. Therefore the repository cannot safely be treated as an abandoned prototype.

Before moving, disabling, renaming, privatizing, deleting or splitting any component, the maintainer must:

1. Inventory the upstream systems that dispatch work to this repository.
2. Inventory all GitHub Actions secrets, callback destinations, storage destinations and media consumers **without publishing their values**.
3. Prepare an equivalent operational location and secrets configuration.
4. Perform a controlled test using non-sensitive, non-production media.
5. Switch the upstream dispatcher to the replacement.
6. Validate end-to-end completion, callbacks, media access, delivery and failure recovery.
7. Only then retire the old workflow. Retain a rollback path.

**Do not disable active triggers or rewrite Git history as a cosmetic portfolio change.**

## Security observations

- Automated pattern scanning of the checked-out revision and reachable Git-history blobs **did not identify obvious live tokens** in the supported token formats tested. This is not a comprehensive secret audit.
- Some source files disclose service integration details and external endpoints; assume that public source and past commits have already been copied or indexed.
- GitHub Actions use repository secrets by name and external media endpoints. The repository should not be assumed to be secret-free merely because no token literal was found.
- An external callback or URL supplied in an automation event should always be checked against policy before making outbound requests.
- The historical Git tree may remain publicly accessible even if a file is later deleted from the default branch.

## Recommended long-term separation

**Phase A — keep production stable:** retain active render / media workflows and implement credentials, endpoint and event-input review.

**Phase B — migration:** move the actual production worker to an operationally controlled repository or deployment process, preserving callbacks, credentials, dispatch contracts and rollback.

**Phase C — portfolio:** keep only intentionally curated, sanitized, rights-cleared public examples in a separate repository. The dedicated TACTIC case-study repository already fulfills the non-source-code showcase role.

## Boundaries of this document

This note does not expose credential values, private logs, new API entry points, or undocumented deployment instructions. It does not claim the workflows are exploit-free, that all historical code has been vetted, or that migration has occurred.
