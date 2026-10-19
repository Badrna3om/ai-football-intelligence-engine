#!/usr/bin/env bash
set -euo pipefail

SOURCE_URL="${SOURCE_URL:-${DOWNLOAD_URL:-}}"
: "${SOURCE_URL:?missing SOURCE_URL}"
REQUEST_ID="${REQUEST_ID:?missing REQUEST_ID}"
FILE_NAME="${FILE_NAME:-${REQUEST_ID}.mp4}"
OBJECT_KEY="${OBJECT_KEY:-raw/${REQUEST_ID}/${FILE_NAME}}"

: "${R2_ENDPOINT:?missing R2_ENDPOINT}"
: "${R2_BUCKET:?missing R2_BUCKET}"
: "${R2_ACCESS_KEY_ID:?missing R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?missing R2_SECRET_ACCESS_KEY}"

mkdir -p work
OUT="work/${FILE_NAME}"

# X/Twitter is resolved and downloaded in the cloud. No FastSaver dependency.
yt-dlp \
  --no-playlist \
  --no-warnings \
  --socket-timeout 30 \
  --retries 3 \
  --fragment-retries 3 \
  --referer 'https://x.com/' \
  --user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0.0.0 Safari/537.36' \
  --merge-output-format mp4 \
  -f 'bv*+ba/b[ext=mp4]/b' \
  -o "$OUT" \
  "$SOURCE_URL"

if [ ! -s "$OUT" ]; then
  echo "yt-dlp returned no media" >&2
  exit 20
fi

SIZE_BYTES=$(stat -c%s "$OUT")
if [ "$SIZE_BYTES" -lt 1024 ]; then
  echo "Downloaded file is unexpectedly small: ${SIZE_BYTES} bytes" >&2
  exit 21
fi

MIME_TYPE=$(file --mime-type -b "$OUT" || true)
DURATION=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT" 2>/dev/null || true)
WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$OUT" 2>/dev/null || true)
HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$OUT" 2>/dev/null || true)
VIDEO_CODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=nw=1:nk=1 "$OUT" 2>/dev/null || true)
AUDIO_CODEC=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of default=nw=1:nk=1 "$OUT" 2>/dev/null || true)
SHA256=$(sha256sum "$OUT" | awk '{print $1}')

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"

aws s3 cp "$OUT" "s3://${R2_BUCKET}/${OBJECT_KEY}" \
  --endpoint-url "$R2_ENDPOINT" \
  --content-type "${MIME_TYPE:-video/mp4}" \
  --only-show-errors

PUBLIC_BASE="${R2_PUBLIC_URL:-${R2_PUBLIC_BASE_URL:-}}"
if [ -n "$PUBLIC_BASE" ]; then
  STORAGE_URL="${PUBLIC_BASE%/}/${OBJECT_KEY}"
else
  STORAGE_URL=$(aws s3 presign "s3://${R2_BUCKET}/${OBJECT_KEY}" --endpoint-url "$R2_ENDPOINT" --expires-in 604800)
fi

[ -n "$STORAGE_URL" ] || { echo "Unable to create R2 access URL" >&2; exit 22; }

jq -n \
  --arg request_id "$REQUEST_ID" \
  --arg object_key "$OBJECT_KEY" \
  --arg file_name "$FILE_NAME" \
  --arg storage_url "$STORAGE_URL" \
  --arg mime_type "${MIME_TYPE:-video/mp4}" \
  --arg duration "${DURATION:-}" \
  --arg width "${WIDTH:-}" \
  --arg height "${HEIGHT:-}" \
  --arg video_codec "${VIDEO_CODEC:-}" \
  --arg audio_codec "${AUDIO_CODEC:-}" \
  --arg sha256 "$SHA256" \
  --argjson size_bytes "$SIZE_BYTES" \
  '{request_id:$request_id,status:"ready",storage_provider:"cloudflare_r2",bucket:env.R2_BUCKET,object_key:$object_key,file_name:$file_name,storage_url:$storage_url,mime_type:$mime_type,size_bytes:$size_bytes,duration:(if $duration=="" then null else ($duration|tonumber) end),width:(if $width=="" then null else ($width|tonumber) end),height:(if $height=="" then null else ($height|tonumber) end),video_codec:(if $video_codec=="" then null else $video_codec end),audio_codec:(if $audio_codec=="" then null else $audio_codec end),sha256:$sha256}' > work/result.json

cat work/result.json
