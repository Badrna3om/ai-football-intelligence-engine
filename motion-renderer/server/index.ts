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

    if (body.compositionId === "TacticMasterV1" && body.githubActionsTest !== true) {
      const assets = body.assets || {};
      const missing:string[] = [];
      const isUrl = (v:unknown) => /^https?:\/\//i.test(String(v || "").trim());

      if (!isUrl(assets.homeBadgeUrl)) missing.push("assets.homeBadgeUrl");
      if (!isUrl(assets.awayBadgeUrl)) missing.push("assets.awayBadgeUrl");
      if (!isUrl(assets.stadiumImageUrl)) missing.push("assets.stadiumImageUrl");

      const requiredStats = ["shots","shots_on_target","big_chances","xg","possession"];
      const statIds = new Set(
        Array.isArray(body.statsCards) ? body.statsCards.map((x:any)=>String(x?.id || "")) : []
      );
      for (const id of requiredStats) {
        if (!statIds.has(id)) missing.push(`statsCards.${id}`);
      }

      const goals = Array.isArray(body.goals) ? body.goals : [];
      if (goals.length === 0) {
        missing.push("goals");
      } else if (!isUrl(body.highlightsVideoUrl)) {
        goals.forEach((goal:any,index:number)=>{
          if (!isUrl(goal?.videoUrl)) missing.push(`goals[${index}].videoUrl`);
        });
      }

      if (body.starPlayer) {
        const starPhoto =
          body.starPlayer.photoUrl ||
          body.starPlayer.imageUrl ||
          body.starPlayer.playerImageUrl ||
          assets.starPlayerPhotoUrl;
        if (!isUrl(starPhoto)) missing.push("starPlayer.photoUrl");
      }

      if (missing.length) {
        return res.status(422).json({
          message: "TACTIC_MASTER_V1 production payload is incomplete",
          missing,
        });
      }
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
