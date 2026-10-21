import React from "react";
import "@dawod/thmanyah-font-web";
import {AbsoluteFill, Img, Sequence, Video, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {z} from "zod";

const FPS = 30;
const INTRO_FRAMES = 156;
const DEFAULT_GOAL_SECONDS = 12;
const FINAL_FADE_FRAMES = 24;
const SNAP_AMER_LOGO = "https://personal-tactic-motion.8kospi.easypanel.host/assets/snapamer.webp";
const STADIUM_BG = "https://personal-tactic-motion.8kospi.easypanel.host/assets/match_presentation_stadium_locked.jpg";

const goalSchema = z.object({
  minute: z.union([z.string(), z.number()]).optional(), addedTime: z.union([z.string(), z.number()]).optional(),
  scorer: z.string().optional(), scorerName: z.string().optional(), playerName: z.string().optional(), player_name_ar: z.string().optional(),
  team: z.string().optional(), teamName: z.string().optional(), score: z.string().optional(), scoreAfter: z.string().optional(),
  homeScoreAfter: z.number().optional(), awayScoreAfter: z.number().optional(), videoUrl: z.string().optional(),
  durationInSeconds: z.number().optional(), sourceDurationInSeconds: z.number().optional(), clipDurationSeconds: z.number().optional(),
  videoStartSeconds: z.number().optional(), clipStartSeconds: z.number().optional(), teamColor: z.string().optional(),
}).passthrough();

export const tacticGoalReelSchema = z.object({
  compositionId:z.string().optional(), gameId:z.union([z.string(),z.number()]), homeTeam:z.string().optional(), awayTeam:z.string().optional(),
  competitionName:z.string().optional(), venue:z.string().optional(), venueName:z.string().optional(), stadium:z.string().optional(),
  matchDate:z.string().optional(), kickoffTime:z.string().optional(), startTime:z.string().optional(), roundName:z.string().optional(),
  roundNum:z.union([z.string(),z.number()]).optional(), homeScore:z.number().optional(), awayScore:z.number().optional(),
  match:z.any().optional(), score:z.any().optional(), assets:z.any().optional(), goals:z.array(goalSchema).default([]),
}).passthrough();

export type TacticGoalReelProps=z.infer<typeof tacticGoalReelSchema>;
export const defaultGoalReelProps:TacticGoalReelProps={compositionId:"TacticGoalReel",gameId:0,homeTeam:"النصر",awayTeam:"نيوم",competitionName:"الدوري السعودي",venue:"",matchDate:"",kickoffTime:"",roundName:"",homeScore:0,awayScore:0,goals:[],assets:{}};

const font='"Thmanyah Sans", sans-serif';
const txt=(v:unknown,f="")=>String(v??f).trim();
const num=(v:unknown,f=0)=>{const n=Number(v);return Number.isFinite(n)?n:f};
const mediaSrc=(v:unknown)=>{const s=txt(v);return s.startsWith("/")?staticFile(s.replace(/^\/+/,"")):s};
const homeTeam=(p:TacticGoalReelProps)=>txt(p.homeTeam||p.match?.home?.name||p.match?.home_team_name_ar||p.match?.home_team_name,"الفريق الأول");
const awayTeam=(p:TacticGoalReelProps)=>txt(p.awayTeam||p.match?.away?.name||p.match?.away_team_name_ar||p.match?.away_team_name,"الفريق الثاني");
const homeScore=(p:TacticGoalReelProps)=>num(p.homeScore??p.score?.home??p.match?.home_score,0);
const awayScore=(p:TacticGoalReelProps)=>num(p.awayScore??p.score?.away??p.match?.away_score,0);
const competition=(p:TacticGoalReelProps)=>txt(p.competitionName||p.match?.competition_name_ar||p.match?.competition_name||p.match?.competition?.name);
const venue=(p:TacticGoalReelProps)=>txt(p.venueName||p.venue||p.stadium||p.match?.venue_name_ar||p.match?.venue_name||p.match?.venue?.name);
const matchDate=(p:TacticGoalReelProps)=>txt(p.matchDate||p.match?.match_date_ar||p.startTime||p.match?.start_time||p.match?.startTime);
const round=(p:TacticGoalReelProps)=>txt(p.roundName||p.match?.round_name_ar||p.match?.round_name||(p.roundNum?`الجولة ${p.roundNum}`:p.match?.round_num?`الجولة ${p.match.round_num}`:""));

// Goal clip policy: always start from the beginning and remove only the final 5 seconds.
const goalSeconds=(g:any)=>{
  const source=Number(g?.sourceDurationInSeconds);
  if(Number.isFinite(source)&&source>5.5)return Math.max(1,source-5);
  const d=Number(g?.durationInSeconds??g?.clipDurationSeconds??g?.duration);
  return Number.isFinite(d)&&d>0?Math.max(1,d-5):DEFAULT_GOAL_SECONDS;
};
const startSeconds=(_g:any)=>0;
const teamAccent=(p:TacticGoalReelProps,g:any)=>{if(g?.teamColor)return g.teamColor;const t=txt(g?.teamName||g?.team||g?.team_name_ar||g?.team_name).toLowerCase();if(t.includes("النصر")||t.includes("nassr"))return "#F4D019";if(t.includes("نيوم")||t.includes("neom"))return "#2EA3E0";if(t&&t===homeTeam(p).toLowerCase())return p.assets?.homePrimaryColor||"#F4D019";if(t&&t===awayTeam(p).toLowerCase())return p.assets?.awayPrimaryColor||"#2EA3E0";return "#D9B45A"};

export const calculateGoalReelDuration=(p:TacticGoalReelProps)=>INTRO_FRAMES+(p.goals||[]).filter((g:any)=>g?.videoUrl).reduce((s:number,g:any)=>s+Math.round(goalSeconds(g)*FPS),0);

const Intro:React.FC<{p:TacticGoalReelProps}>=({p})=>{
  const frame=useCurrentFrame();const {fps}=useVideoConfig();const enter=spring({frame,fps,config:{damping:18,stiffness:120}});
  const hb=p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl;const ab=p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl;const cl=p.assets?.competitionLogoUrl;
  return <AbsoluteFill style={{background:"#050607",color:"white",fontFamily:font,direction:"rtl",overflow:"hidden"}}>
    <Img src={p.assets?.stadiumBackgroundUrl||STADIUM_BG} style={{position:"absolute",inset:-18,width:"108%",height:"108%",objectFit:"cover",filter:"blur(3px) brightness(.62) saturate(1.08)",transform:"scale(1.03)"}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(2,4,8,.08),rgba(1,3,5,.36))"}}/>
    <Img src={p.assets?.brandLogoUrl||SNAP_AMER_LOGO} style={{position:"absolute",top:38,left:"50%",width:150,height:150,objectFit:"contain",transform:"translateX(-50%)"}}/>
    <div style={{position:"absolute",top:205,left:0,right:0,textAlign:"center",fontSize:46,fontWeight:800}}>{competition(p)}</div>
    <div style={{position:"absolute",top:270,left:0,right:0,textAlign:"center",fontSize:34,fontWeight:800,color:"#D9B45A"}}>{round(p)}</div>
    <div style={{position:"absolute",top:350,left:0,right:0,textAlign:"center",fontSize:58,fontWeight:900}}>المواجهة</div>
    {cl?<Img src={cl} style={{position:"absolute",top:430,left:"50%",width:135,height:135,objectFit:"contain",transform:"translateX(-50%)"}}/>:null}
    <div style={{position:"absolute",top:600,left:80,right:80,display:"grid",gridTemplateColumns:"1fr 1fr",gap:110,opacity:enter}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>{hb?<Img src={hb} style={{width:235,height:235,objectFit:"contain"}}/>:null}<div style={{fontSize:52,fontWeight:900}}>{homeTeam(p)}</div></div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>{ab?<Img src={ab} style={{width:235,height:235,objectFit:"contain"}}/>:null}<div style={{fontSize:52,fontWeight:900}}>{awayTeam(p)}</div></div>
    </div>
    <div style={{position:"absolute",top:955,left:0,right:0,textAlign:"center",fontSize:34,fontWeight:700}}>{matchDate(p)}</div>
    <div style={{position:"absolute",top:1080,left:55,right:55,height:430,border:"1px solid rgba(217,180,90,.46)",background:"rgba(0,0,0,.30)",backdropFilter:"blur(4px)",padding:"38px 52px"}}>
      <div style={{fontSize:48,fontWeight:900,textAlign:"center",marginBottom:44}}>معلومات المباراة</div>
      <div style={{display:"grid",gridTemplateColumns:"170px 1fr",alignItems:"center",rowGap:50,fontSize:34}}>
        <div style={{color:"#D9B45A",fontWeight:800}}>الملعب</div><div style={{fontWeight:700}}>{venue(p)}</div>
        <div style={{color:"#D9B45A",fontWeight:800}}>النتيجة النهائية</div><div style={{fontSize:70,fontWeight:900,direction:"ltr"}}>{homeScore(p)} - {awayScore(p)}</div>
      </div>
    </div>
  </AbsoluteFill>
};

const GoalScene:React.FC<{p:TacticGoalReelProps;goal:any;index:number}>=({p,goal,index})=>{
  const accent=teamAccent(p,goal);const minuteRaw=txt(goal.minute||goal.time||goal.goalMinute,"—");const added=txt(goal.addedTime||goal.added_time);
  const minute=added?`${minuteRaw}+${added}′`:`${minuteRaw.replace(/[′']/g,"")}′`;const scorer=txt(goal.scorerName||goal.scorer||goal.player_name_ar||goal.playerName||goal.player_name,`الهدف ${index+1}`);
  const team=txt(goal.teamName||goal.team||goal.team_name_ar||goal.team_name);let score=txt(goal.scoreAfter||goal.score);if(!score&&Number.isFinite(Number(goal.homeScoreAfter))&&Number.isFinite(Number(goal.awayScoreAfter)))score=`${goal.homeScoreAfter} - ${goal.awayScoreAfter}`;
  const badge=(team===homeTeam(p)||team.toLowerCase().includes("nassr")||team.includes("النصر"))?(p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl):(p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl);
  const s=startSeconds(goal);const src=mediaSrc(goal.videoUrl);
  return <AbsoluteFill style={{background:"#020304",fontFamily:font,color:"white",overflow:"hidden"}}>
    <Video src={src} startFrom={Math.round(s*FPS)} volume={1} style={{position:"absolute",inset:-70,width:"114%",height:"114%",objectFit:"cover",filter:"blur(28px) brightness(.42) saturate(.9)",transform:"scale(1.08)"}}/>
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.24)"}}/>
    <Img src={p.assets?.brandLogoUrl||SNAP_AMER_LOGO} style={{position:"absolute",top:28,left:"50%",width:130,height:130,objectFit:"contain",transform:"translateX(-50%)",zIndex:5}}/>
    <div style={{position:"absolute",top:165,left:160,width:760,height:1280,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.55)",zIndex:3}}><Video src={src} startFrom={Math.round(s*FPS)} volume={0} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
    <div style={{position:"absolute",left:45,right:45,bottom:95,height:355,background:"rgba(2,3,5,.88)",borderTop:`6px solid ${accent}`,zIndex:6,padding:"46px 48px",display:"grid",gridTemplateColumns:"300px 1fr",direction:"ltr"}}>
      <div style={{position:"relative",direction:"ltr"}}><div style={{fontSize:88,fontWeight:900,lineHeight:1}}>{minute}</div><div style={{fontSize:48,fontWeight:900,color:accent,marginTop:32}}>{score||""}</div>{badge?<Img src={badge} style={{position:"absolute",left:150,top:112,width:94,height:94,objectFit:"contain"}}/>:null}</div>
      <div style={{direction:"rtl",textAlign:"right",paddingTop:8}}><div style={{fontSize:31,color:"#D2D5DB",fontWeight:700}}>الهدف {index+1===1?"الأول":index+1}</div><div style={{fontSize:62,fontWeight:900,lineHeight:1.15,marginTop:22}}>{scorer}</div><div style={{fontSize:38,fontWeight:900,color:accent,marginTop:18}}>{team}</div></div>
    </div>
  </AbsoluteFill>
};

export const TacticGoalReel:React.FC<TacticGoalReelProps>=(p)=>{
  const frame=useCurrentFrame();
  const {durationInFrames}=useVideoConfig();
  const goals=(Array.isArray(p.goals)?p.goals:[]).filter((g:any)=>g?.videoUrl);
  const fadeStart=Math.max(0,durationInFrames-FINAL_FADE_FRAMES);
  const opacity=interpolate(frame,[fadeStart,durationInFrames-1],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  let cursor=INTRO_FRAMES;
  return <AbsoluteFill style={{background:"#000",opacity}}>
    <Sequence from={0} durationInFrames={INTRO_FRAMES}><Intro p={p}/></Sequence>
    {goals.map((goal:any,index:number)=>{const frames=Math.round(goalSeconds(goal)*FPS);const from=cursor;cursor+=frames;return <Sequence key={`${index}-${goal.videoUrl}`} from={from} durationInFrames={frames}><GoalScene p={p} goal={goal} index={index}/></Sequence>})}
  </AbsoluteFill>
};
