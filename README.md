<p align="center"><strong>BADRELDIN — PRODUCTION AI PORTFOLIO</strong><br/><a href="https://github.com/Badrna3om">Profile</a> · <a href="https://github.com/Badrna3om/tactic-ai-media-platform">TACTIC / AMER</a> · <a href="https://github.com/Badrna3om/buaskoor-ai-commerce-platform">Commerce</a> · <a href="https://github.com/Badrna3om/ai-restaurant-operating-system">Restaurant</a> · <a href="https://github.com/Badrna3om/ai-content-automation-for-e-commerce">Marketing</a></p>

# AI Football Intelligence Engine

A standalone prototype for evidence-first match interpretation, player identity resolution and structured output validation. **It is distinct from the operational [TACTIC × AMER production platform](https://github.com/Badrna3om/tactic-ai-media-platform).**

## Portfolio quick view

**Evidence-First Football Analysis · Prototype**  
[Workflow](workflow-overview.png) · [Structured report](post-match-intelligence-report.png)

**What this proves:** fact-based data retrieval, identity matching, LLM validation and deterministic failure handling.

> **Disclosure:** The repository is for public technical review. Operating credentials, private infrastructure, customer data and confidential business logic are excluded.

---

## What It Does

- Resolves a match from a Fixture ID or team names
- Supports date-specific lookup without silently selecting another match
- Fetches match facts, team statistics, events, lineups, and player data
- Uses Player IDs to disambiguate abbreviated names
- Scores data completeness before generating analysis
- Separates verified facts from tactical hypotheses
- Produces structured material for articles, X threads, short-form video, and tactical visuals
- Validates the final JSON before returning it to the n8n chat

## Architecture

```mermaid
flowchart LR
    A[Chat Input] --> B[Load API Configuration]
    B --> C[Resolve Fixture]
    C --> D[API-Football Data]
    D --> E[Extract Tactical Insights]
    E --> F[Grounded AI Analysis]
    F --> G[Parse and Validate JSON]
    G --> H[Format Final Output]
    H --> I[n8n Chat]
```

## Workflow Overview

![AI Football Intelligence Engine workflow](workflow-overview.png)

## Example Input

```text
Argentina vs France 2022-12-18
```

or:

```text
1234567
```

## Example Outputs

### Post-Match Intelligence Report

![Post-match intelligence report](post-match-intelligence-report.png)

### Multi-Platform Content Package

![Multi-platform sports content package](multi-platform-content-package.png)

## Output Modules

- Data-quality assessment
- Executive match summary
- Verified match facts
- Short-video content material
- Formation and statistical comparison
- Player-impact and turning-point analysis
- Clearly labelled tactical hypotheses
- X thread and article structure
- Five evidence-based tactical image prompts

## Engineering Highlights

- Exact-date fixture validation
- API request tracking
- Parallel data retrieval
- Player identity resolution by Player ID
- Compact structured data to reduce model context
- Evidence-first prompting
- JSON parsing and schema validation
- Clear failure states instead of fabricated fallback data
- Sanitized public workflow with no embedded credentials

## Stack

- n8n
- API-Football
- OpenAI
- JavaScript
- Structured JSON

## Project Direction

This workflow is the post-match intelligence foundation for a larger AI sports newsroom:

1. Daily Match Selector
2. Pre-Match Content Engine
3. Live Match Monitor
4. Post-Match Intelligence
5. Multi-Platform Content Factory
6. Human Approval and Publishing

## Quick Start

See [SETUP.md](SETUP.md). Import the workflow from:

```text
workflows/AI-Football-Intelligence-Engine.json
```

## Security

The public workflow contains no working API keys or OpenAI credential IDs. Never commit secrets. See [SECURITY.md](SECURITY.md).

## Status

Working prototype. API coverage and available statistics vary by competition, match, and subscription plan.
