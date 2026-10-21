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

# X frequently blocks progressive video.twimg.com MP4 URLs with HTTP 403.
# Its HLS manifest is still available, so prefer HLS and use yt-dlp's native
# fragment downloader. Fall back to another format only if no HLS exists.
yt-dlp \
  --no-playlist \
  --no-warnings \
  --socket-timeout 30 \
  --retries 3 \
  --fragment-retries 5 \
  --retry-sleep fragment:1 \
  --referer 'https://x.com/' \
  --user-agent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0.0.0 Safari/537.36' \
  --hls-prefer-native \
  --merge-output-format mp4 \
  -f 'best[protocol^=m3u8]/best' \
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

# Upload directly to Cloudflare R2 using an AWS SigV4 signed PUT.
# This avoids installing awscli/boto3 on every GitHub runner.
export OUT MIME_TYPE OBJECT_KEY
python3 - <<'PY'
import datetime
import hashlib
import hmac
import os
import urllib.parse
import urllib.request

endpoint = os.environ['R2_ENDPOINT'].rstrip('/')
bucket = os.environ['R2_BUCKET']
key = os.environ['OBJECT_KEY'].lstrip('/')
access = os.environ['R2_ACCESS_KEY_ID']
secret = os.environ['R2_SECRET_ACCESS_KEY']
file_path = os.environ['OUT']
content_type = os.environ.get('MIME_TYPE') or 'video/mp4'
region = 'auto'
service = 's3'

u = urllib.parse.urlparse(endpoint)
host = u.netloc
encoded_key = '/'.join(urllib.parse.quote(part, safe='-_.~') for part in key.split('/'))
canonical_uri = f'/{bucket}/{encoded_key}'
url = f'{u.scheme}://{host}{canonical_uri}'

with open(file_path, 'rb') as f:
    body = f.read()
payload_hash = hashlib.sha256(body).hexdigest()
now = datetime.datetime.now(datetime.timezone.utc)
amz_date = now.strftime('%Y%m%dT%H%M%SZ')
date_stamp = now.strftime('%Y%m%d')

canonical_headers = (
    f'content-type:{content_type}\n'
    f'host:{host}\n'
    f'x-amz-content-sha256:{payload_hash}\n'
    f'x-amz-date:{amz_date}\n'
)
signed_headers = 'content-type;host;x-amz-content-sha256;x-amz-date'
canonical_request = '\n'.join([
    'PUT', canonical_uri, '', canonical_headers, signed_headers, payload_hash
])
credential_scope = f'{date_stamp}/{region}/{service}/aws4_request'
string_to_sign = '\n'.join([
    'AWS4-HMAC-SHA256', amz_date, credential_scope,
    hashlib.sha256(canonical_request.encode()).hexdigest(),
])

def sign(key_bytes, msg):
    return hmac.new(key_bytes, msg.encode(), hashlib.sha256).digest()

k_date = sign(('AWS4' + secret).encode(), date_stamp)
k_region = sign(k_date, region)
k_service = sign(k_region, service)
k_signing = sign(k_service, 'aws4_request')
signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()
authorization = (
    f'AWS4-HMAC-SHA256 Credential={access}/{credential_scope}, '
    f'SignedHeaders={signed_headers}, Signature={signature}'
)

req = urllib.request.Request(url, data=body, method='PUT', headers={
    'Content-Type': content_type,
    'Host': host,
    'x-amz-content-sha256': payload_hash,
    'x-amz-date': amz_date,
    'Authorization': authorization,
})
try:
    with urllib.request.urlopen(req, timeout=180) as response:
        if not 200 <= response.status < 300:
            raise RuntimeError(f'R2 upload HTTP {response.status}')
        print(f'R2 upload OK: HTTP {response.status}')
except Exception as exc:
    raise SystemExit(f'R2 upload failed: {exc}')
PY

PUBLIC_BASE="${R2_PUBLIC_URL:-${R2_PUBLIC_BASE_URL:-}}"
if [ -z "$PUBLIC_BASE" ]; then
  echo "R2_PUBLIC_URL is required for callback storage URL" >&2
  exit 22
fi
STORAGE_URL="${PUBLIC_BASE%/}/${OBJECT_KEY}"

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
