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

## Operating Media Workflows and Historical Exposure

This repository currently includes **operational GitHub Actions and media-rendering code**, in addition to an analysis prototype. Some Actions are active dependencies of TACTIC / AMER. Do not disable, delete, relocate or privatize these components as a portfolio cleanup without first migrating and verifying the production dispatch/delivery chain.

A bounded automated review on 26 November 2026 found **no obvious hard-coded tokens matching the tested patterns** in the checked-out code or reachable Git blobs. This is **not a guarantee** against credential leakage, weak event validation or unsafe public infrastructure disclosures.

Treat source-visible endpoints, workflow paths, event input conventions and commit history as public information. Review all external callbacks, untrusted event inputs, least-privilege permissions and GitHub Actions secret scopes as part of a dedicated hardening cycle.

For operational boundaries and a migration checklist, see [REPOSITORY_SCOPE.md](REPOSITORY_SCOPE.md).

**Important:** If any real token is found later, revoke and rotate it first. Removing it from the current README or latest commit does not remove earlier public exposure. Do not post the leaked value in issues or pull requests.
