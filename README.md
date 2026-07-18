# AI Football Intelligence Engine

An n8n-based football intelligence workflow that converts verified API-Football match data into grounded, multi-format sports content using OpenAI.

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

## Example Input

```text
Argentina vs France 2022-12-18
```

or:

```text
1234567
```

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
