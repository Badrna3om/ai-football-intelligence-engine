import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";
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

const finiteNumber = (value:unknown):number|null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
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
          "user-agent":"TACTIC-Motion-Renderer/5.9",
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

const probeDuration = (filePath:string):number|null => {
  const result = spawnSync("ffprobe",[
    "-v","error",
    "-show_entries","format=duration",
    "-of","default=nw=1:nk=1",
    filePath,
  ],{
    encoding:"utf8",
    maxBuffer:2*1024*1024,
  });

  if (result.status !== 0) return null;
  const duration = Number(String(result.stdout||"").trim());
  return Number.isFinite(duration) && duration > 0 ? duration : null;
};

const detectSceneCuts = (filePath:string):number[] => {
  const result = spawnSync("ffmpeg",[
    "-hide_banner",
    "-i",filePath,
    "-vf","select=gt(scene\\,0.35),showinfo",
    "-an",
    "-f","null",
    "-",
  ],{
    encoding:"utf8",
    maxBuffer:24*1024*1024,
  });

  const text = `${result.stderr||""}\n${result.stdout||""}`;
  const cuts:number[] = [];
  const re = /pts_time:([0-9]+(?:\.[0-9]+)?)/g;
  let match:RegExpExecArray|null;
  while ((match = re.exec(text))) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) cuts.push(n);
  }

  return [...new Set(cuts.map((x)=>Number(x.toFixed(3))))].sort((a,b)=>a-b);
};

const pickChapterStart = ({
  index,
  segment,
  cuts,
}:{
  index:number;
  segment:number;
  cuts:number[];
}) => {
  if (index === 0) return 0;

  const expected = segment * index;
  const beforeWindow = Math.max(18,segment*0.24);
  const afterWindow = Math.max(10,segment*0.12);
  const inWindow = cuts.filter((x)=>x >= expected-beforeWindow && x <= expected+afterWindow);

  const before = inWindow.filter((x)=>x <= expected);
  if (before.length) return before[before.length-1];
  if (inWindow.length) {
    return inWindow.reduce((best,x)=>Math.abs(x-expected)<Math.abs(best-expected)?x:best,inWindow[0]);
  }

  const prior = cuts.filter((x)=>x < expected);
  return prior.length ? prior[prior.length-1] : expected;
};

const resolveGoalsFromHighlights = ({
  payload,
  highlightsLocalUrl,
  highlightsLocalPath,
}:{
  payload:AnyRecord;
  highlightsLocalUrl:string;
  highlightsLocalPath:string;
}) => {
  if (!Array.isArray(payload.goals) || payload.goals.length === 0) return [] as string[];

  const unresolved = payload.goals.filter((goal)=>isRecord(goal) && !goal.videoUrl);
  if (unresolved.length === 0) return [] as string[];

  const duration = probeDuration(highlightsLocalPath);
  if (!duration) {
    console.warn("Goal resolver skipped: ffprobe could not read highlights duration");
    return [] as string[];
  }

  const cuts = detectSceneCuts(highlightsLocalPath);
  const goalCount = payload.goals.length;
  const segment = duration / goalCount;
  const diagnostics:string[] = [];
  const starts:number[] = [];

  for (let i=0;i<goalCount;i++) {
    const goal = payload.goals[i];
    if (!isRecord(goal)) {
      starts.push(0);
      continue;
    }

    if (goal.videoUrl) {
      const explicitStart = finiteNumber(goal.videoStartSeconds ?? goal.clipStartSeconds);
      starts.push(explicitStart ?? 0);
      continue;
    }

    const chapterStart = pickChapterStart({index:i,segment,cuts});
    const maxSearch = Math.min(duration,chapterStart + Math.min(25,segment*0.32));
    const postChapterCuts = cuts.filter((x)=>x >= chapterStart+3 && x <= maxSearch);

    let clipStart:number;
    let method:string;

    if (postChapterCuts.length) {
      const goalCut = postChapterCuts[0];
      clipStart = goalCut - 5.25;
      method = "scene_goal_cut";
    } else {
      clipStart = chapterStart + Math.min(6.5,Math.max(4.5,segment*0.075));
      method = "scene_chapter_fallback";
    }

    const sceneDuration = finiteNumber(goal.durationInSeconds) ?? 6;
    clipStart = Math.max(0,Math.min(clipStart,Math.max(0,duration-sceneDuration-0.25)));
    clipStart = Number(clipStart.toFixed(2));

    goal.videoUrl = highlightsLocalUrl;
    goal.videoStartSeconds = clipStart;
    goal.clipStartSeconds = clipStart;
    goal.videoSource = "highlights_auto_resolved";
    goal.clipResolverMethod = method;

    starts.push(clipStart);
    diagnostics.push(`goal-${i+1}:${clipStart}s:${method}:chapter=${chapterStart.toFixed(2)}`);
  }

  payload.goalClipResolution = {
    method:"ffmpeg_scene_chapter_v1",
    durationSeconds:Number(duration.toFixed(3)),
    sceneThreshold:0.35,
    sceneCuts:cuts,
    goalStarts:starts,
    autoResolved:diagnostics.length,
  };

  return diagnostics;
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
    if (!/^https?:\/\//i.test(url)) return {url,path:null as string|null};

    const ext = extensionFromUrl(url);
    const filename = `${jobId}-${label}${ext}`;
    const output = path.join(mediaDir,filename);

    const size = await downloadRemoteFile(url,output);
    const localUrl = `${localMediaBaseUrl}/media/${encodeURIComponent(filename)}`;
    localized.push(`${label}:${size}`);
    console.log(`Localized ${label}: ${url} -> ${localUrl} (${size} bytes)`);
    return {url:localUrl,path:output};
  };

  let highlightsLocal:{url:string;path:string|null}|null = null;
  if (payload.highlightsVideoUrl) {
    highlightsLocal = await localize(payload.highlightsVideoUrl,"highlights");
    payload.highlightsVideoUrl = highlightsLocal.url;
  }

  if (Array.isArray(payload.goals)) {
    for (let i=0;i<payload.goals.length;i++) {
      const goal = payload.goals[i];
      if (!isRecord(goal) || !goal.videoUrl) continue;
      const localizedGoal = await localize(goal.videoUrl,`goal-${i+1}`);
      goal.videoUrl = localizedGoal.url;
    }
  }

  if (highlightsLocal?.path && highlightsLocal.url) {
    const goalDiagnostics = resolveGoalsFromHighlights({
      payload,
      highlightsLocalUrl:highlightsLocal.url,
      highlightsLocalPath:highlightsLocal.path,
    });
    localized.push(...goalDiagnostics);
    if (goalDiagnostics.length) {
      console.log(`Auto-resolved ${goalDiagnostics.length} goal clips from localized highlights`);
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
