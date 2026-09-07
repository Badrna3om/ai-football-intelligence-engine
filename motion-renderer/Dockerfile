FROM node:22-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=80
RUN apt-get update && apt-get install -y --no-install-recommends \
 libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 \
 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
 libpango-1.0-0 libcairo2 libx11-6 libx11-xcb1 libxcb1 libxext6 libxrender1 libxi6 \
 libxtst6 libglib2.0-0 ca-certificates fonts-dejavu-core fonts-noto-core ffmpeg librsvg2-bin \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx remotion browser ensure
COPY . .
RUN mkdir -p /app/public/assets/templates /tmp/tactic-templates \
 && for f in /app/assets/templates/*.svg; do \
      b="$(basename "$f" .svg)"; \
      rsvg-convert -w 1080 -h 1920 "$f" -o "/tmp/tactic-templates/${b}.png"; \
      ffmpeg -hide_banner -loglevel error -y -i "/tmp/tactic-templates/${b}.png" -frames:v 1 -c:v libwebp -quality 88 "/app/public/assets/templates/${b}.webp"; \
      test -s "/app/public/assets/templates/${b}.webp"; \
    done \
 && ffmpeg -hide_banner -loglevel error -y \
   -f lavfi -i "color=c=black@0.0:s=900x220:d=1" \
   -vf "format=rgba,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='TACTIC':fontcolor=white:fontsize=96:x=42:y=(h-text_h)/2,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='SPORT':fontcolor=0x22D4FFFF:fontsize=96:x=410:y=(h-text_h)/2" \
   -frames:v 1 /app/public/TACTIC_SPORT_logo.png \
 && test -s /app/public/TACTIC_SPORT_logo.png
EXPOSE 80
CMD ["npm","start"]
