import express from "express";
import {bundle} from "@remotion/bundler";
import {ensureBrowser} from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import {makeRenderQueue} from "./render-queue";

const PORT = Number(process.env.PORT || 80);
const PUBLIC_URL = (process.env.PUBLIC_URL || "http://127.0.0.1:18080").replace(/\/$/, "");
const LOCAL_MEDIA_BASE_URL = `http://127.0.0.1:${PORT}`;
const RENDERS_DIR = path.resolve("renders");
const STATE_DIR = path.resolve("state");
const MEDIA_DIR = path.resolve("media");

async function main() {
  fs.mkdirSync(RENDERS_DIR, {recursive: true});
  fs.mkdirSync(STATE_DIR, {recursive: true});
  fs.mkdirSync(MEDIA_DIR, {recursive: true});

  await ensureBrowser();

  const serveUrl = await bundle({
    entryPoint: path.resolve("remotion/index.ts"),
  });

  const q = makeRenderQueue({
    serveUrl,
    rendersDir: RENDERS_DIR,
    stateDir: STATE_DIR,
    mediaDir: MEDIA_DIR,
    publicUrl: PUBLIC_URL,
    localMediaBaseUrl: LOCAL_MEDIA_BASE_URL,
  });

  const app = express();
  app.use("/renders", express.static(RENDERS_DIR));
  app.use("/media", express.static(MEDIA_DIR, {
    acceptRanges: true,
    cacheControl: false,
    fallthrough: false,
  }));
  app.use(express.json({limit: "25mb"}));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "tactic-motion-github-runner",
      version: "1.1.0-local-media",
      publicUrl: PUBLIC_URL,
      localMedia: true,
    });
  });

  app.post("/renders", (req, res) => {
    const body = req.body || {};
    if (!body.gameId || !body.homeTeam || !body.awayTeam) {
      return res.status(422).json({
        message: "gameId, homeTeam and awayTeam are required",
      });
    }

    return res.json({jobId: q.createJob(body)});
  });

  app.get("/renders/:id", (req, res) => {
    const job = q.jobs.get(req.params.id);
    if (!job) return res.status(404).json({message: "Job not found"});
    res.json(job);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TACTIC Motion GitHub runner listening on ${PORT}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
