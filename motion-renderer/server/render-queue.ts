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
  recoveredAfterRestart?:boolean;
  interruptedByRestart?:boolean;
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

  const loadState = () => {
    if (!fs.existsSync(stateFile)) return;
    try {
      const raw = fs.readFileSync(stateFile,"utf8");
      const parsed = JSON.parse(raw || "{}");
      for (const [id,value] of Object.entries(parsed)) {
        const j = value as Job;
        if (!j || typeof j !== "object" || !j.status) continue;

        const out = path.join(rendersDir,`${id}.mp4`);
        if (fs.existsSync(out)) {
          j.status = "completed";
          j.progress = 1;
          j.videoUrl = `${publicUrl}/renders/${id}.mp4`;
          j.recoveredAfterRestart = true;
          j.completedAt = j.completedAt || new Date().toISOString();
          jobs.set(id,j);
          continue;
        }

        if (j.status === "in-progress") {
          j.status = "failed";
          j.error = "Render process was interrupted by a container/server restart before the final MP4 was written.";
          j.errorCode = "RENDER_INTERRUPTED_BY_RESTART";
          j.interruptedByRestart = true;
          j.completedAt = new Date().toISOString();
          jobs.set(id,j);
          continue;
        }

        jobs.set(id,j);
        if (j.status === "queued") pending.push(id);
      }
      persistNow();
    } catch (e) {
      console.error("TACTIC persistent job state could not be loaded", e);
      const corrupt = `${stateFile}.corrupt-${Date.now()}`;
      try { fs.renameSync(stateFile,corrupt); } catch {}
    }
  };

  loadState();

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
    delete j.error;
    delete j.errorCode;
    persistNow();

    const started = Date.now();
    try {
      const c = await selectComposition({
        serveUrl,
        id:"TacticMatch",
        inputProps:j.data as Record<string,unknown>,
      });
      const out = path.join(rendersDir,`${id}.mp4`);

      await renderMedia({
        composition:c,
        serveUrl,
        codec:"h264",
        outputLocation:out,
        inputProps:j.data as Record<string,unknown>,
        concurrency:1,
        imageFormat:"jpeg",
        jpegQuality:90,
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
    } catch(e) {
      j.status = "failed";
      j.error = e instanceof Error ? e.message : String(e);
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
    jobs.set(id,{
      status:"queued",
      progress:0,
      data,
      createdAt:new Date().toISOString(),
    });
    pending.push(id);
    persistNow();
    void next();
    return id;
  };

  if (pending.length) void next();

  return {jobs,createJob,stateFile};
};
