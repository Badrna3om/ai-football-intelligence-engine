# TACTIC Cloud Media Worker

Cloud downloader used by `TACTIC Motion — Match Media Collector v3.1 Cloud R2`.

## Flow

`n8n -> repository_dispatch -> GitHub Actions -> download resolved MP4 -> ffprobe -> Cloudflare R2 -> n8n callback -> Motion Producer`

The X/Twitter URL is still resolved by the existing FastSaver node in n8n. GitHub Actions only downloads the resolved MP4 URL and uploads it to R2, so n8n no longer carries the large video binary.

## GitHub Actions secrets

Configure these repository secrets before enabling the n8n v3.1 workflow:

- `R2_ENDPOINT` — `https://<account-id>.r2.cloudflarestorage.com`
- `R2_BUCKET` — bucket name, e.g. `tactic-video-media`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BASE_URL` — optional. Leave empty for a private bucket; the worker generates a 7-day presigned URL.
- `TACTIC_N8N_CALLBACK_SECRET` — must match the secret used by the n8n `Normalize Cloud Download Callback` node.

## Dispatch

Event type: `tactic-cloud-video-download`

Expected `client_payload`:

```json
{
  "download_url": "https://resolved-video.example/video.mp4",
  "request_id": "x_123456_...",
  "file_name": "TeamA__TeamB__goal__x_123456.mp4",
  "object_key": "raw/2026/TeamA__TeamB/TeamA__TeamB__goal__x_123456.mp4",
  "callback_url": "https://N8N_HOST/webhook/tactic-cloud-video-ready",
  "meta": {
    "team_a": "TeamA",
    "team_b": "TeamB",
    "media_type": "goal",
    "tweet_id": "123456",
    "next_workflow_id": "..."
  }
}
```

## Callback

Success callback includes `storage_provider=cloudflare_r2`, bucket/object key, signed/public `storage_url`, duration, dimensions, codecs, file size, SHA-256 and the original `meta` object.

The Telegram-video branch of the collector remains on Google Drive unchanged.
