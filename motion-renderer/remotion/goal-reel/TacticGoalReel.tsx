import React from "react";
import "@dawod/thmanyah-font-web";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";

const FPS = 30;
const INTRO_FRAMES = 150;
const CARD_FRAMES = 42;
const DEFAULT_GOAL_SECONDS = 8;

const goalSchema = z.object({
  minute: z.union([z.string(), z.number()]).optional(),
  addedTime: z.union([z.string(), z.number()]).optional(),
  scorer: z.string().optional(),
  scorerName: z.string().optional(),
  playerName: z.string().optional(),
  player_name_ar: z.string().optional(),
  team: z.string().optional(),
  teamName: z.string().optional(),
  score: z.string().optional(),
  scoreAfter: z.string().optional(),
  homeScoreAfter: z.number().optional(),
  awayScoreAfter: z.number().optional(),
  videoUrl: z.string().optional(),
  durationInSeconds: z.number().optional(),
}).passthrough();

export const tacticGoalReelSchema = z.object({
  compositionId: z.string().optional(),
  gameId: z.union([z.string(), z.number()]),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  competitionName: z.string().optional(),
  venue: z.string().optional(),
  venueName: z.string().optional(),
  stadium: z.string().optional(),
  matchDate: z.string().optional(),
  kickoffTime: z.string().optional(),
  startTime: z.string().optional(),
  roundName: z.string().optional(),
  roundNum: z.union([z.string(), z.number()]).optional(),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  match: z.any().optional(),
  score: z.any().optional(),
  assets: z.any().optional(),
  goals: z.array(goalSchema).default([]),
}).passthrough();

export type TacticGoalReelProps = z.infer<typeof tacticGoalReelSchema>;

export const defaultGoalReelProps: TacticGoalReelProps = {
  compositionId: "TacticGoalReel",
  gameId: 0,
  homeTeam: "الفريق الأول",
  awayTeam: "الفريق الثاني",
  competitionName: "",
  venue: "",
  matchDate: "",
  kickoffTime: "",
  roundName: "",
  homeScore: 0,
  awayScore: 0,
  goals: [],
  assets: {},
};

const txt = (v: unknown, fallback = "") => String(v ?? fallback).trim();
const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const getHomeTeam = (p:TacticGoalReelProps) =>
  txt(p.homeTeam || p.match?.home?.name || p.match?.home_team_name_ar || p.match?.home_team_name, "الفريق الأول");
const getAwayTeam = (p:TacticGoalReelProps) =>
  txt(p.awayTeam || p.match?.away?.name || p.match?.away_team_name_ar || p.match?.away_team_name, "الفريق الثاني");
const getHomeScore = (p:TacticGoalReelProps) =>
  num(p.homeScore ?? p.score?.home ?? p.score?.homeScore ?? p.match?.home_score, 0);
const getAwayScore = (p:TacticGoalReelProps) =>
  num(p.awayScore ?? p.score?.away ?? p.score?.awayScore ?? p.match?.away_score, 0);
const getCompetition = (p:TacticGoalReelProps) =>
  txt(p.competitionName || p.match?.competition_name_ar || p.match?.competition_name || p.match?.competition?.name);
const getVenue = (p:TacticGoalReelProps) =>
  txt(p.venueName || p.venue || p.stadium || p.match?.venue_name_ar || p.match?.venue_name || p.match?.venue?.name);
const getDate = (p:TacticGoalReelProps) =>
  txt(p.matchDate || p.startTime || p.match?.start_time || p.match?.startTime);
const getKickoff = (p:TacticGoalReelProps) => txt(p.kickoffTime || p.match?.kickoff_time);
const getRound = (p:TacticGoalReelProps) =>
  txt(p.roundName || p.match?.round_name_ar || p.match?.round_name || (p.roundNum ? `الجولة ${p.roundNum}` : p.match?.round_num ? `الجولة ${p.match.round_num}` : ""));

const goalSeconds = (goal:any) => {
  const d = Number(goal?.durationInSeconds ?? goal?.clipDurationSeconds ?? goal?.duration);
  return Number.isFinite(d) && d > 0 ? Math.min(20, Math.max(3, d)) : DEFAULT_GOAL_SECONDS;
};

export const calculateGoalReelDuration = (p:TacticGoalReelProps) => {
  const goals = Array.isArray(p.goals) ? p.goals.filter((g:any)=>g?.videoUrl) : [];
  return INTRO_FRAMES + goals.reduce((sum:any,g:any)=>sum + CARD_FRAMES + Math.round(goalSeconds(g)*FPS), 0);
};

const bg = "#070A0F";
const gold = "#D9B45A";
const white = "#F6F7F9";
const muted = "#AEB4C0";
const font = '"Thmanyah Sans", sans-serif';

const Intro:React.FC<{p:TacticGoalReelProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame,fps,config:{damping:18,stiffness:120}});
  const homeBadge = p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl;
  const awayBadge = p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl;
  const competitionLogo = p.assets?.competitionLogoUrl;
  const score = `${getHomeScore(p)}  —  ${getAwayScore(p)}`;
  const meta = [getRound(p), getVenue(p), getDate(p), getKickoff(p)].filter(Boolean);

  return <AbsoluteFill style={{background:bg,color:white,fontFamily:font,direction:"rtl",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 18%,rgba(217,180,90,.17),transparent 38%),linear-gradient(180deg,#0D121B 0%,#05070B 100%)"}}/>
    <div style={{position:"absolute",top:78,left:64,right:64,display:"flex",justifyContent:"center",alignItems:"center",gap:22,opacity:enter}}>
      {competitionLogo ? <Img src={competitionLogo} style={{height:94,maxWidth:210,objectFit:"contain"}}/> : null}
      <div style={{fontSize:34,fontWeight:700,color:muted,textAlign:"center"}}>{getCompetition(p)}</div>
    </div>
    <div style={{position:"absolute",top:330,left:70,right:70,display:"grid",gridTemplateColumns:"1fr 230px 1fr",alignItems:"center",gap:24,transform:`scale(${.92+.08*enter})`,opacity:enter}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:26}}>
        {homeBadge ? <Img src={homeBadge} style={{width:220,height:220,objectFit:"contain"}}/> : <div style={{width:180,height:180,borderRadius:"50%",border:`2px solid ${gold}`}}/>}
        <div style={{fontSize:46,fontWeight:900,textAlign:"center",lineHeight:1.1}}>{getHomeTeam(p)}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
        <div style={{fontSize:112,fontWeight:900,letterSpacing:-4,color:gold,direction:"ltr"}}>{score}</div>
        <div style={{height:3,width:160,background:gold,opacity:.7}}/>
        <div style={{fontSize:26,color:muted}}>النتيجة النهائية</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:26}}>
        {awayBadge ? <Img src={awayBadge} style={{width:220,height:220,objectFit:"contain"}}/> : <div style={{width:180,height:180,borderRadius:"50%",border:`2px solid ${gold}`}}/>}
        <div style={{fontSize:46,fontWeight:900,textAlign:"center",lineHeight:1.1}}>{getAwayTeam(p)}</div>
      </div>
    </div>
    <div style={{position:"absolute",bottom:190,left:80,right:80,display:"flex",flexDirection:"column",gap:18,alignItems:"center",opacity:interpolate(frame,[55,95],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}}>
      {meta.map((m,i)=><div key={i} style={{fontSize:i===1?34:30,fontWeight:i===1?700:500,color:i===1?white:muted,textAlign:"center"}}>{m}</div>)}
    </div>
  </AbsoluteFill>;
};

const GoalCard:React.FC<{p:TacticGoalReelProps;goal:any;index:number}> = ({p,goal,index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame,fps,config:{damping:20,stiffness:170}});
  const minuteRaw = txt(goal.minute || goal.time || goal.goalMinute, "—");
  const added = txt(goal.addedTime || goal.added_time);
  const minute = added ? `${minuteRaw}+${added}'` : /'/.test(minuteRaw) ? minuteRaw : `${minuteRaw}'`;
  const scorer = txt(goal.scorerName || goal.scorer || goal.player_name_ar || goal.playerName || goal.player_name, `الهدف ${index+1}`);
  const team = txt(goal.teamName || goal.team || goal.team_name_ar || goal.team_name);
  let score = txt(goal.scoreAfter || goal.score);
  if (!score && Number.isFinite(Number(goal.homeScoreAfter)) && Number.isFinite(Number(goal.awayScoreAfter))) score = `${goal.homeScoreAfter} — ${goal.awayScoreAfter}`;
  return <AbsoluteFill style={{background:bg,color:white,fontFamily:font,direction:"rtl",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(217,180,90,.16),transparent 45%),radial-gradient(circle at 80% 20%,rgba(255,255,255,.06),transparent 32%)"}}/>
    <div style={{width:860,borderTop:`3px solid ${gold}`,borderBottom:`1px solid rgba(217,180,90,.35)`,padding:"54px 30px 58px",display:"flex",flexDirection:"column",alignItems:"center",gap:22,transform:`translateY(${(1-enter)*55}px)`,opacity:enter}}>
      <div style={{fontSize:82,fontWeight:900,color:gold,direction:"ltr"}}>{minute}</div>
      <div style={{fontSize:62,fontWeight:900,textAlign:"center",lineHeight:1.05}}>{scorer}</div>
      {team ? <div style={{fontSize:34,fontWeight:500,color:muted}}>{team}</div> : null}
      {score ? <div style={{fontSize:72,fontWeight:900,direction:"ltr",marginTop:8}}>{score}</div> : null}
      <div style={{fontSize:24,color:muted,marginTop:8}}>الهدف {index+1}</div>
    </div>
  </AbsoluteFill>;
};

const GoalVideo:React.FC<{goal:any}> = ({goal}) => (
  <AbsoluteFill style={{background:"#000"}}>
    <Video
      src={goal.videoUrl}
      startFrom={Math.max(0,Math.round(num(goal.videoStartSeconds ?? goal.clipStartSeconds,0)*FPS))}
      volume={1}
      style={{width:"100%",height:"100%",objectFit:"cover"}}
    />
  </AbsoluteFill>
);

export const TacticGoalReel:React.FC<TacticGoalReelProps> = (p) => {
  const goals = (Array.isArray(p.goals) ? p.goals : []).filter((g:any)=>g?.videoUrl);
  let cursor = INTRO_FRAMES;
  return <AbsoluteFill style={{background:bg}}>
    <Sequence from={0} durationInFrames={INTRO_FRAMES}><Intro p={p}/></Sequence>
    {goals.map((goal:any,index:number)=>{
      const cardStart = cursor;
      const clipFrames = Math.round(goalSeconds(goal)*FPS);
      const clipStart = cardStart + CARD_FRAMES;
      cursor = clipStart + clipFrames;
      return <React.Fragment key={`${index}-${goal.videoUrl}`}>
        <Sequence from={cardStart} durationInFrames={CARD_FRAMES}><GoalCard p={p} goal={goal} index={index}/></Sequence>
        <Sequence from={clipStart} durationInFrames={clipFrames}><GoalVideo goal={goal}/></Sequence>
      </React.Fragment>;
    })}
  </AbsoluteFill>;
};
