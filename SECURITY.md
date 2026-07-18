# Security

## Secret Handling

This repository must never contain:

- API-Football keys
- OpenAI API keys
- n8n credential IDs
- n8n instance IDs
- production webhook URLs
- exported execution data containing secrets

The included workflow uses the placeholder:

```text
YOUR_API_FOOTBALL_KEY
```

## If a Key Was Exposed

1. Revoke it immediately in the provider dashboard.
2. Create a new key.
3. Remove the secret from every workflow export and commit.
4. Review API usage for unexpected requests.
5. Do not reuse the exposed key.

## Safe Contributions

Before committing an n8n export:

1. Remove credentials and credential IDs.
2. Replace keys and tokens with placeholders.
3. Remove instance metadata and pinned production data.
4. Search the export for `apiKey`, `token`, `secret`, `authorization`, and provider headers.
