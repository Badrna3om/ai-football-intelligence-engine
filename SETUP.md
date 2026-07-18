# Setup

## Requirements

- A self-hosted or cloud n8n instance
- An API-Football account and API key
- An OpenAI API credential in n8n

## Installation

1. Download `workflows/AI-Football-Intelligence-Engine.json`.
2. Import it into n8n.
3. Open **Load API Configuration**.
4. Replace `YOUR_API_FOOTBALL_KEY` with your API-Football key for local testing.
5. Open **OpenAI Chat Model** and select your own OpenAI credential.
6. Save the workflow.
7. Open the chat and send a Fixture ID or a match query.

## Example Queries

```text
Argentina vs France 2022-12-18
PSG vs Arsenal
1234567
```

For a query without a date, the workflow selects the latest completed head-to-head fixture returned by API-Football. For a query with a date, it fails clearly if the exact match is unavailable.

## Recommended Production Configuration

Do not keep the API key in a Set node in production. Store it using your deployment's secret-management method or an n8n credential and adapt the HTTP requests accordingly.

## Troubleshooting

- **Match not found:** Verify team spelling, date, and API coverage.
- **Missing player statistics:** Some competitions or plans do not expose every endpoint.
- **API quota error:** Check your API-Football dashboard and request limit.
- **OpenAI error:** Reconnect your OpenAI credential and verify model access.
