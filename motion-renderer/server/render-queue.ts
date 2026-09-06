import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {renderMedia, selectComposition} from "@remotion/renderer";

type JobStatus = "queued"|"in-progress"|"completed"|"failed";
export type Job = {
  status:JobStatus;
  progress:number;
  videoUrl?:string;
  error?:string;
  errorCode?:string;
  data:unknown;
  createdAt:string;
  startedAt?:string;
  completedAt?:string;
  elapsedSeconds?:number;
};

type QueueArgs = {
  serveUrl:string;
  rendersDir:string;
  stateDir:string;
  publicUrl:string;
};

export const makeRenderQueue = ({serveUrl,rendersDir,stateDir,publicUrl}:QueueArgs) => {
  fs.mkdirSync(rendersDir,{recursive:true});
  fs.mkdirSync(stateDir,{recursive:true});

  const stateFile = path.join(stateDir,"jobs.json");
  const jobs = new Map<string,Job>();
  const pending:string[] = [];
  let running = false;
  let lastPersistAt = 0;

  const snapshot = () => Object.fromEntries(jobs.entries());
  const persistNow = () => {
    const tmp = `${stateFile}.${process.pid}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(snapshot(), null, 2), "utf8");
    fs.renameSync(tmp, stateFile);
    lastPersistAt = Date.now();
  };
  const persistThrottled = () => {
    if (Date.now() - lastPersistAt >= 1000) persistNow();
  };

  const next = async() => {
    if (running) return;
    const id = pending.shift();
    if (!id) return;
    const j = jobs.get(id);
    if (!j || j.status !== "queued") return void next();

    running = true;
    j.status = "in-progress";
    j.startedAt = new Date().toISOString();
    j.progress = 0;
    persistNow();

    const started = Date.now();
    try {
      const composition = await selectComposition({
        serveUrl,
        id:"TacticMatch",
        inputProps:j.data as Record<string,unknown>,
      });

      const out = path.join(rendersDir,`${id}.mp4`);
      await renderMedia({
        composition,
        serveUrl,
        codec:"h264",
        outputLocation:out,
        inputProps:j.data as Record<string,unknown>,
        concurrency:2,
        imageFormat:"jpeg",
        jpegQuality:88,
        onProgress:({progress}) => {
          j.progress = progress;
          j.elapsedSeconds = Math.round((Date.now()-started)/1000);
          persistThrottled();
        },
      });

      j.status = "completed";
      j.progress = 1;
      j.completedAt = new Date().toISOString();
      j.elapsedSeconds = Math.round((Date.now()-started)/1000);
      j.videoUrl = `${publicUrl}/renders/${id}.mp4`;
      persistNow();
    } catch(error) {
      j.status = "failed";
      j.error = error instanceof Error ? error.message : String(error);
      j.errorCode = "RENDER_FAILED";
      j.completedAt = new Date().toISOString();
      j.elapsedSeconds = Math.round((Date.now()-started)/1000);
      persistNow();
    } finally {
      running = false;
      void next();
    }
  };

  const createJob = (data:unknown) => {
    const id = crypto.randomUUID();
    jobs.set(id,{status:"queued",progress:0,data,createdAt:new Date().toISOString()});
    pending.push(id);
    persistNow();
    void next();
    return id;
  };

  return {jobs,createJob,stateFile};
};
