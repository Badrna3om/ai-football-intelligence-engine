#!/usr/bin/env python3
import http.cookiejar
import os
import re
import sys
import urllib.parse
import urllib.request

SOURCE_URL = os.environ.get("SOURCE_URL") or (sys.argv[1] if len(sys.argv) > 1 else "")
OUT = os.environ.get("OUT") or (sys.argv[2] if len(sys.argv) > 2 else "")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/155 Safari/537.36"

if not SOURCE_URL or not OUT:
    raise SystemExit("usage: download_sss.py <x_url> <output_path>")

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
headers = {"User-Agent": UA, "Accept": "text/html,*/*"}

html = opener.open(
    urllib.request.Request("https://ssstwitter.com/", headers=headers), timeout=30
).read().decode("utf-8", "replace")

match = re.search(r'''include-vals="tt:'([^']+)',ts:(\d+),source:'form'"''', html)
if not match:
    raise SystemExit("SSSTWITTER_TOKEN_NOT_FOUND")

body = urllib.parse.urlencode({
    "id": SOURCE_URL,
    "tt": match.group(1),
    "ts": match.group(2),
    "source": "form",
}).encode()

post_headers = {
    **headers,
    "Content-Type": "application/x-www-form-urlencoded",
    "HX-Request": "true",
    "HX-Target": "target",
    "HX-Current-URL": "https://ssstwitter.com/",
}

result = opener.open(
    urllib.request.Request(
        "https://ssstwitter.com/", data=body, headers=post_headers, method="POST"
    ),
    timeout=60,
).read().decode("utf-8", "replace")

link = re.search(r'''data-directurl="(https://ssscdn\.io/ssstwitter/[^"]+)"''', result)
if not link:
    link = re.search(r'''href="(https://ssscdn\.io/ssstwitter/[^"]+)"''', result)
if not link:
    raise SystemExit("SSSTWITTER_SIGNED_CDN_NOT_FOUND")

os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
request = urllib.request.Request(
    link.group(1),
    headers={"User-Agent": UA, "Referer": "https://ssstwitter.com/", "Accept": "*/*"},
)
with urllib.request.urlopen(request, timeout=180) as response, open(OUT, "wb") as target:
    while True:
        chunk = response.read(1024 * 1024)
        if not chunk:
            break
        target.write(chunk)

size = os.path.getsize(OUT)
if size < 1024:
    raise SystemExit(f"SSSTWITTER_FILE_TOO_SMALL:{size}")
print(f"SSSTWITTER_DOWNLOAD_OK bytes={size}")
