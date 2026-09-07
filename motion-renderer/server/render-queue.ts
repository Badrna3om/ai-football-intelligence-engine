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
  localizedMedia?:string[];
};

type QueueArgs = {
  serveUrl:string;
  rendersDir:string;
  stateDir:string;
  mediaDir:string;
  publicUrl:string;
  localMediaBaseUrl:string;
};

type AnyRecord = Record<string, unknown>;

const isRecord = (value:unknown): value is AnyRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const copyPayload = (data:unknown):AnyRecord => {
  if (!isRecord(data)) return {};
  return JSON.parse(JSON.stringify(data)) as AnyRecord;
};

const extensionFromUrl = (url:string) => {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (/^\.[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {
    // fall through
  }
  return ".mp4";
};

const downloadRemoteFile = async(url:string,out:string) => {
  let lastError:unknown = null;

  for (let attempt=1;attempt<=3;attempt++) {
    const tmp = `${out}.${process.pid}.${crypto.randomUUID()}.tmp`;
    try {
      const response = await fetch(url, {
        redirect:"follow",
        signal:AbortSignal.timeout(300_000),
        headers:{
          "user-agent":"TACTIC-Motion-Renderer/5.8",
          "accept":"video/*,application/octet-stream;q=0.9,*/*;q=0.5",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while downloading ${url}`);
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 1024) {
        throw new Error(`Downloaded media is too small (${bytes.length} bytes): ${url}`);
      }

      fs.writeFileSync(tmp, bytes);
      fs.renameSync(tmp, out);
      return fs.statSync(out).size;
    } catch(error) {
      lastError = error;
      try { fs.rmSync(tmp,{force:true}); } catch {}
      if (attempt < 3) {
        await new Promise((resolve)=>setTimeout(resolve, attempt*1500));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

const localizeVideoMedia = async({
  data,
  jobId,
  mediaDir,
  localMediaBaseUrl,
}:{
  data:unknown;
  jobId:string;
  mediaDir:string;
  localMediaBaseUrl:string;
}) => {
  const payload = copyPayload(data);
  const localized:string[] = [];

  const localize = async(raw:unknown,label:string) => {
    const url = String(raw ?? "").trim();
    if (!/^https?:\/\//i.test(url)) return url;

    const ext = extensionFromUrl(url);
    const filename = `${jobId}-${label}${ext}`;
    const output = path.join(mediaDir,filename);

    const size = await downloadRemoteFile(url,output);
    const localUrl = `${localMediaBaseUrl}/media/${encodeURIComponent(filename)}`;
    localized.push(`${label}:${size}`);
    console.log(`Localized ${label}: ${url} -> ${localUrl} (${size} bytes)`);
    return localUrl;
  };

  if (payload.highlightsVideoUrl) {
    payload.highlightsVideoUrl = await localize(payload.highlightsVideoUrl,"highlights");
  }

  if (Array.isArray(payload.goals)) {
    for (let i=0;i<payload.goals.length;i++) {
      const goal = payload.goals[i];
      if (!isRecord(goal) || !goal.videoUrl) continue;
      goal.videoUrl = await localize(goal.videoUrl,`goal-${i+1}`);
    }
  }

  return {payload,localized};
};

export const makeRenderQueue = ({
  serveUrl,
  rendersDir,
  stateDir,
  mediaDir,
  publicUrl,
  localMediaBaseUrl,
}:QueueArgs) => {
  fs.mkdirSync(rendersDir,{recursive:true});
  fs.mkdirSync(stateDir,{recursive:true});
  fs.mkdirSync(mediaDir,{recursive:true});

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
      const localized = await localizeVideoMedia({
        data:j.data,
        jobId:id,
        mediaDir,
        localMediaBaseUrl,
      });
      j.data = localized.payload;
      j.localizedMedia = localized.localized;
      persistNow();

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
