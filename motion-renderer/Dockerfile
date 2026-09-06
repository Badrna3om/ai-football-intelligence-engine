FROM node:22-bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=80
RUN apt-get update && apt-get install -y --no-install-recommends \
 libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 \
 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
 libpango-1.0-0 libcairo2 libx11-6 libx11-xcb1 libxcb1 libxext6 libxrender1 libxi6 \
 libxtst6 libglib2.0-0 ca-certificates fonts-dejavu-core fonts-noto-core ffmpeg \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx remotion browser ensure
COPY . .
EXPOSE 80
CMD ["npm","start"]
