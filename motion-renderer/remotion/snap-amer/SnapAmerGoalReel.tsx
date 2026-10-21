import React from "react";
import "@dawod/thmanyah-font-web";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";

const FPS = 30;
const INTRO_FRAMES = 150;
const GOAL_LEAD_FRAMES = 36;
const DEFAULT_GOAL_SECONDS = 16;

const goalSchema = z.object({
  minute: z.union([z.string(), z.number()]),
  displayMinute: z.string().optional(),
  scorer: z.string(),
  team: z.string(),
  teamSide: z.enum(["home", "away"]).optional(),
  scoreAfter: z.string(),
  videoUrl: z.string(),
  videoStartSeconds: z.number().optional(),
  durationInSeconds: z.number().optional(),
  goalOrderLabel: z.string().optional(),
  teamBadgeUrl: z.string().optional(),
});

export const snapAmerGoalReelSchema = z.object({
  compositionId: z.string().optional(),
  brandName: z.string().default("سناب عامر"),
  brandLogoUrl: z.string().optional(),
  gameId: z.union([z.string(), z.number()]),
  competition: z.string().optional(),
  competitionLogoUrl: z.string().optional(),
  round: z.string().optional(),
  dateLabel: z.string().optional(),
  timeLabel: z.string().optional(),
  venue: z.string().optional(),
  referee: z.string().optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeBadgeUrl: z.string().optional(),
  awayBadgeUrl: z.string().optional(),
  score: z.string(),
  stadiumImageUrl: z.string().optional(),
  goals: z.array(goalSchema).default([]),
});

export type SnapAmerGoalReelProps = z.infer<typeof snapAmerGoalReelSchema>;

export const defaultSnapAmerGoalReelProps: SnapAmerGoalReelProps = {
  compositionId: "SnapAmerGoalReel",
  brandName: "سناب عامر",
  gameId: 0,
  competition: "",
  round: "",
  dateLabel: "",
  timeLabel: "",
  venue: "",
  referee: "",
  homeTeam: "الفريق الأول",
  awayTeam: "الفريق الثاني",
  score: "0 - 0",
  goals: [],
};

const font = '"Thmanyah Sans", sans-serif';
const WHITE = "#F5F5F2";
const MUTED = "#B8B9BE";
const GOLD = "#C7A75C";
const PANEL = "rgba(5,7,10,.94)";

const safeSeconds = (g:any) => {
  const n = Number(g?.durationInSeconds);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_GOAL_SECONDS;
  return Math.max(6, Math.min(45, n));
};

export const calculateSnapAmerGoalReelDuration = (p:SnapAmerGoalReelProps) =>
  INTRO_FRAMES + p.goals.reduce((sum,g)=>sum + GOAL_LEAD_FRAMES + Math.round(safeSeconds(g)*FPS),0);

const Brand:React.FC<{p:SnapAmerGoalReelProps; small?:boolean}> = ({p,small=false}) => {
  const logoSrc = p.brandLogoUrl === "/snap-amer-logo.png" ? staticFile("snap-amer-logo.png") : p.brandLogoUrl;
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:small?92:150}}>
      {logoSrc ? (
        <Img src={logoSrc} style={{height:small?78:132,maxWidth:small?220:320,objectFit:"contain",filter:"drop-shadow(0 4px 14px rgba(0,0,0,.55))"}}/>
      ) : (
        <div style={{fontFamily:font,fontSize:small?34:48,fontWeight:900,color:WHITE}}>{p.brandName}</div>
      )}
    </div>
  );
};

const Intro:React.FC<{p:SnapAmerGoalReelProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame,fps,config:{damping:18,stiffness:110}});
  const metaOpacity = interpolate(frame,[52,90],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return (
    <AbsoluteFill style={{background:"#07090D",color:WHITE,fontFamily:font,direction:"rtl",overflow:"hidden"}}>
      {p.stadiumImageUrl ? <Img src={p.stadiumImageUrl} style={{position:"absolute",inset:-40,width:"calc(100% + 80px)",height:"calc(100% + 80px)",objectFit:"cover",filter:"blur(18px) brightness(.28) saturate(.85)",transform:"scale(1.08)"}}/> : null}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(4,6,9,.5),rgba(5,8,7,.88) 58%,#07100A 100%)"}}/>
      <div style={{position:"absolute",top:32,left:0,right:0}}><Brand p={p} small/></div>
      <div style={{position:"absolute",top:160,left:126,right:126,border:"1px solid rgba(255,255,255,.16)",height:54,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,color:WHITE}}>{p.competition || ""}</div>
      <div style={{position:"absolute",top:236,left:0,right:0,textAlign:"center",fontSize:24,color:GOLD,fontWeight:700}}>{p.round || ""}</div>
      <div style={{position:"absolute",top:295,left:0,right:0,textAlign:"center",fontSize:54,fontWeight:900}}>المواجهة</div>

      <div style={{position:"absolute",top:430,left:80,right:80,display:"grid",gridTemplateColumns:"1fr 90px 1fr",alignItems:"center",transform:`translateY(${(1-enter)*35}px)`,opacity:enter}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
          {p.homeBadgeUrl ? <Img src={p.homeBadgeUrl} style={{width:220,height:220,objectFit:"contain"}}/> : null}
          <div style={{fontSize:48,fontWeight:900}}>{p.homeTeam}</div>
        </div>
        <div style={{fontSize:52,fontWeight:700,textAlign:"center"}}>×</div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24}}>
          {p.awayBadgeUrl ? <Img src={p.awayBadgeUrl} style={{width:220,height:220,objectFit:"contain"}}/> : null}
          <div style={{fontSize:48,fontWeight:900}}>{p.awayTeam}</div>
        </div>
      </div>

      <div style={{position:"absolute",top:800,left:0,right:0,textAlign:"center",opacity:metaOpacity}}>
        <div style={{fontSize:31,fontWeight:650}}>{p.dateLabel}</div>
        <div style={{fontSize:28,color:GOLD,marginTop:8}}>{p.timeLabel}</div>
        <div style={{fontSize:74,fontWeight:950,marginTop:30,direction:"ltr"}}>{p.score}</div>
      </div>

      <div style={{position:"absolute",left:42,right:42,bottom:90,border:"1px solid rgba(255,255,255,.19)",background:"rgba(4,7,8,.74)",padding:"32px 38px 36px",opacity:metaOpacity}}>
        <div style={{fontSize:36,fontWeight:900,textAlign:"center",marginBottom:26}}>معلومات المباراة</div>
        <div style={{height:1,background:"rgba(255,255,255,.16)",marginBottom:22}}/>
        <div style={{display:"grid",gridTemplateColumns:"130px 1fr",rowGap:22,fontSize:27}}>
          <div style={{color:GOLD}}>الملعب</div><div style={{textAlign:"left",direction:"rtl"}}>{p.venue || "—"}</div>
          <div style={{color:GOLD}}>الحكم</div><div style={{textAlign:"left",direction:"rtl"}}>{p.referee || "—"}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const GoalLead:React.FC<{p:SnapAmerGoalReelProps;g:any;i:number}> = ({p,g,i}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame:f,fps,config:{damping:18,stiffness:150}});
  const minute=g.displayMinute || `${g.minute}'`;
  return <AbsoluteFill style={{background:"#07090D",fontFamily:font,color:WHITE,direction:"rtl"}}>
    <div style={{position:"absolute",top:42,left:0,right:0}}><Brand p={p} small/></div>
    <div style={{position:"absolute",left:52,right:52,bottom:210,borderTop:"3px solid rgba(143,75,216,.92)",paddingTop:38,display:"grid",gridTemplateColumns:"250px 1fr",gap:40,alignItems:"center",opacity:s,transform:`translateY(${(1-s)*32}px)`}}>
      <div style={{textAlign:"center",direction:"ltr"}}>
        <div style={{fontSize:100,fontWeight:950}}>{minute}</div>
        <div style={{fontSize:42,fontWeight:900,color:GOLD,marginTop:12}}>{g.scoreAfter}</div>
      </div>
      <div>
        <div style={{fontSize:28,color:MUTED,marginBottom:12}}>{g.goalOrderLabel || `الهدف ${i+1}`}</div>
        <div style={{fontSize:56,fontWeight:950,lineHeight:1.05}}>{g.scorer}</div>
        <div style={{fontSize:31,fontWeight:800,color:"#8E4DE0",marginTop:13}}>{g.team}</div>
      </div>
    </div>
  </AbsoluteFill>;
};

const GoalScene:React.FC<{p:SnapAmerGoalReelProps;g:any;i:number}> = ({p,g,i}) => {
  const minute=g.displayMinute || `${g.minute}'`;
  const badge=g.teamBadgeUrl || (g.teamSide==="away"?p.awayBadgeUrl:p.homeBadgeUrl);
  const startFrom=Math.max(0,Math.round((g.videoStartSeconds||0)*FPS));
  return <AbsoluteFill style={{background:"#020304",fontFamily:font,color:WHITE,direction:"rtl",overflow:"hidden"}}>
    <Video src={g.videoUrl} startFrom={startFrom} volume={0} style={{position:"absolute",inset:-80,width:"calc(100% + 160px)",height:"calc(100% + 160px)",objectFit:"cover",filter:"blur(28px) brightness(.36) saturate(.75)",transform:"scale(1.08)"}}/>
    <div style={{position:"absolute",top:30,left:0,right:0,zIndex:4}}><Brand p={p} small/></div>
    <Video src={g.videoUrl} startFrom={startFrom} volume={1} style={{position:"absolute",top:350,left:0,width:"100%",height:610,objectFit:"cover",zIndex:2}}/>
    <div style={{position:"absolute",left:0,right:0,bottom:0,height:690,background:PANEL,zIndex:3,borderTop:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{position:"absolute",top:118,left:52,right:52,height:3,background:"linear-gradient(90deg,#7442C8,#A45FF0)"}}/>
      <div style={{position:"absolute",top:165,left:52,right:52,display:"grid",gridTemplateColumns:"250px 1fr",gap:42,alignItems:"center"}}>
        <div style={{textAlign:"center",direction:"ltr"}}>
          <div style={{fontSize:104,fontWeight:950,lineHeight:.95}}>{minute}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:20}}>
            {badge ? <Img src={badge} style={{width:70,height:70,objectFit:"contain"}}/> : null}
            <div style={{fontSize:45,fontWeight:900,color:GOLD}}>{g.scoreAfter}</div>
          </div>
        </div>
        <div>
          <div style={{fontSize:28,color:MUTED,marginBottom:14}}>{g.goalOrderLabel || `الهدف ${i+1}`}</div>
          <div style={{fontSize:58,fontWeight:950,lineHeight:1.08}}>{g.scorer}</div>
          <div style={{fontSize:32,fontWeight:900,color:"#8E4DE0",marginTop:14}}>{g.team}</div>
        </div>
      </div>
    </div>
  </AbsoluteFill>;
};

export const SnapAmerGoalReel:React.FC<SnapAmerGoalReelProps> = (p) => {
  let cursor=INTRO_FRAMES;
  return <AbsoluteFill style={{background:"#000"}}>
    <Sequence from={0} durationInFrames={INTRO_FRAMES}><Intro p={p}/></Sequence>
    {p.goals.map((g,i)=>{
      const leadStart=cursor;
      const clipFrames=Math.round(safeSeconds(g)*FPS);
      const clipStart=leadStart+GOAL_LEAD_FRAMES;
      cursor=clipStart+clipFrames;
      return <React.Fragment key={`${i}-${g.videoUrl}`}>
        <Sequence from={leadStart} durationInFrames={GOAL_LEAD_FRAMES}><GoalLead p={p} g={g} i={i}/></Sequence>
        <Sequence from={clipStart} durationInFrames={clipFrames}><GoalScene p={p} g={g} i={i}/></Sequence>
      </React.Fragment>;
    })}
  </AbsoluteFill>;
};
