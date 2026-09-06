import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily} = loadFont();

const storySchema = z.object({
  id: z.string().optional(),
  headline: z.string().optional(),
  metric: z.string().optional(),
  homeValue: z.union([z.number(), z.string()]).nullable().optional(),
  awayValue: z.union([z.number(), z.string()]).nullable().optional(),
  homeLabel: z.string().optional(),
  awayLabel: z.string().optional(),
  visual: z.string().optional(),
  holdSeconds: z.number().optional(),
}).passthrough();

export const tacticMatchSchema = z.object({
  templateKey: z.string().optional(),
  gameId: z.number().optional(),
  competition: z.string().optional(),
  round: z.number().nullable().optional(),
  homeTeam: z.string().optional(),
  awayTeam: z.string().optional(),
  score: z.string().optional(),
  introHeadline: z.string().optional(),
  mediaMode: z.string().optional(),
  highlightsVideoUrl: z.string().nullable().optional(),
  highlightsStartSeconds: z.number().nullable().optional(),
  goals: z.array(z.any()).optional(),
  statsCards: z.array(storySchema).optional(),
  dataStories: z.array(storySchema).optional(),
  starPlayer: z.any().nullable().optional(),
  match: z.any().optional(),
  assets: z.any().optional(),
  cards: z.array(z.any()).optional(),
  motionTiming: z.any().optional(),
  design: z.any().optional(),
}).passthrough();

export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  competition: "UAE Pro League",
  round: 4,
  homeTeam: "شباب الأهلي",
  awayTeam: "الجزيرة",
  score: "1 - 3",
  introHeadline: "الجزيرة يحسم المواجهة أمام شباب الأهلي",
  highlightsVideoUrl: null,
  goals: [],
  statsCards: [],
  starPlayer: null,
};

const FPS = 30;
const C = {
  bg: "#061019",
  bg2: "#0B1C28",
  panel: "rgba(8,19,29,.80)",
  white: "#F7FAFC",
  muted: "#9BAAB8",
  home: "#22D4FF",
  away: "#E7C264",
  line: "rgba(255,255,255,.14)",
};

const n = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const tx = (v: unknown, d = "") => String(v ?? d).trim();
const clamp = (v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));

const sec = (p:MatchProps,key:string,fallback:number) => {
  const raw = n(p.motionTiming?.[key]);
  return Math.max(1, Math.round((raw > 0 ? raw : fallback) * FPS));
};

const timings = (p:MatchProps) => ({
  intro: sec(p,"introSeconds",4.5),
  matchup: sec(p,"matchupSeconds",5),
  goal: sec(p,"goalSeconds",6),
  final: sec(p,"finalScoreSeconds",5),
  stat: sec(p,"statsCardSeconds",5.2),
  star: sec(p,"starPlayerSeconds",6),
  outro: sec(p,"outroSeconds",5),
});

export const calculateDuration = (p: MatchProps) => {
  const t = timings(p);
  const stats = Math.min(5, (p.statsCards?.length ?? p.dataStories?.length ?? 0));
  const goals = p.goals?.length ?? 0;
  const mediaFallback = goals === 0 && p.highlightsVideoUrl ? sec(p,"highlightsSeconds",8) : 0;
  return t.intro + t.matchup + goals * t.goal + mediaFallback + t.final + stats * t.stat + (p.starPlayer ? t.star : 0) + t.outro;
};

const enter = (frame:number) => interpolate(frame,[0,12],[0,1],{extrapolateRight:"clamp"});

const GlassWipe:React.FC<{duration:number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame,[Math.max(0,duration-14),duration-1],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp",easing:Easing.inOut(Easing.cubic)});
  return <div style={{position:"absolute",top:-240,bottom:-240,left:-520,width:760,zIndex:80,transform:`translateX(${p*1900}px) rotate(-13deg)`,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.08),rgba(34,212,255,.24),rgba(255,255,255,.10),transparent)",backdropFilter:"blur(18px)",pointerEvents:"none"}}/>;
};

const Brand:React.FC<{logo?:string|null}> = ({logo}) => logo
  ? <Img src={logo} style={{height:44,maxWidth:210,objectFit:"contain"}}/>
  : <div style={{fontFamily,fontSize:26,fontWeight:900,color:C.white,letterSpacing:.5}}>TACTIC <span style={{color:C.home}}>SPORT</span></div>;

const CompetitionMark:React.FC<{p:MatchProps;compact?:boolean}> = ({p,compact}) => {
  const logo = p.assets?.competitionLogoUrl;
  return <div style={{display:"flex",alignItems:"center",gap:10,direction:"rtl"}}>
    {logo && <Img src={logo} style={{height:compact?34:56,maxWidth:compact?90:140,objectFit:"contain"}}/>}
    <div style={{fontFamily,color:C.white,fontSize:compact?17:22,fontWeight:800}}>{tx(p.competition)}</div>
  </div>;
};

const Header:React.FC<{p:MatchProps;label:string}> = ({p,label}) => <div style={{position:"absolute",top:54,left:54,right:54,zIndex:30,display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center"}}>
  <div style={{justifySelf:"start"}}><CompetitionMark p={p} compact/></div>
  <div style={{fontFamily,color:C.white,fontSize:20,fontWeight:800,direction:"rtl",padding:"10px 18px",border:`1px solid ${C.line}`,borderRadius:999,background:"rgba(3,10,16,.42)"}}>{label}</div>
  <div style={{justifySelf:"end"}}><Brand logo={p.assets?.tacticLogoUrl}/></div>
</div>;

const MasterBackdrop:React.FC<{p:MatchProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const homeBadge = p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl;
  const awayBadge = p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl;
  return <AbsoluteFill style={{background:`radial-gradient(circle at 50% 20%,rgba(34,212,255,.12),transparent 30%),linear-gradient(180deg,${C.bg2},${C.bg} 72%)`,overflow:"hidden"}}>
    {homeBadge && <Img src={homeBadge} style={{position:"absolute",width:560,height:560,objectFit:"contain",right:-130,top:180,opacity:.045,filter:"grayscale(1)",transform:`rotate(${2+Math.sin(frame/90)*1.5}deg)`}}/>}
    {awayBadge && <Img src={awayBadge} style={{position:"absolute",width:560,height:560,objectFit:"contain",left:-130,bottom:120,opacity:.045,filter:"grayscale(1)",transform:`rotate(${-2+Math.sin(frame/100)*1.3}deg)`}}/>}
    <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",backgroundSize:"90px 90px",opacity:.35}}/>
  </AbsoluteFill>;
};

const Panel:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>> = ({children,style}) => <div style={{background:C.panel,border:`1px solid ${C.line}`,boxShadow:"0 28px 80px rgba(0,0,0,.30)",backdropFilter:"blur(16px)",...style}}>{children}</div>;

const Badge:React.FC<{name:string;url?:string|null;color:string;size?:number}> = ({name,url,color,size=210}) => <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,minWidth:0}}>
  <div style={{width:size,height:size,borderRadius:999,border:`2px solid ${color}66`,display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,rgba(255,255,255,.08),${color}12 68%,transparent)`,boxShadow:`0 20px 70px ${color}24`}}>
    {url ? <Img src={url} style={{width:"78%",height:"78%",objectFit:"contain"}}/> : <div style={{fontFamily,fontSize:size*.38,fontWeight:900,color}}>{name.slice(0,1)}</div>}
  </div>
  <div style={{fontFamily,fontSize:34,fontWeight:900,color:C.white,textAlign:"center",lineHeight:1.25,maxWidth:350}}>{name}</div>
</div>;

const splitScore = (score?:string) => tx(score,"0 - 0").split("-").map(x=>x.trim());

const ScoreFixed:React.FC<{score?:string;size?:number}> = ({score,size=96}) => {
  const [h,a] = splitScore(score);
  return <div style={{fontFamily,display:"flex",flexDirection:"row-reverse",alignItems:"center",justifyContent:"center",gap:22,direction:"ltr"}}>
    <b style={{fontSize:size,color:C.home}}>{h}</b>
    <span style={{fontSize:size*.42,color:C.muted}}>–</span>
    <b style={{fontSize:size,color:C.away}}>{a}</b>
  </div>;
};

const formatDate = (v:unknown) => {
  const s = tx(v);
  if(!s) return "";
  const d = new Date(s);
  if(Number.isNaN(d.getTime())) return s;
  return `${String(d.getUTCDate()).padStart(2,"0")}/${String(d.getUTCMonth()+1).padStart(2,"0")} • ${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")} UTC`;
};

const Intro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:17,stiffness:95}});
  const comp=p.assets?.competitionLogoUrl;
  return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:enter(frame)}}>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transform:`scale(${.90+.10*s})`}}>
      <Brand logo={p.assets?.tacticLogoUrl}/>
      {comp && <Img src={comp} style={{height:110,maxWidth:260,objectFit:"contain",marginTop:58}}/>}
      <div style={{fontSize:20,color:C.muted,marginTop:22}}>{tx(p.competition)} {p.round?`• الجولة ${p.round}`:""}</div>
      <div style={{fontSize:72,fontWeight:950,lineHeight:1.3,maxWidth:910,marginTop:34}}>{p.introHeadline||`${p.homeTeam} × ${p.awayTeam}`}</div>
      <div style={{width:230,height:5,borderRadius:10,marginTop:32,background:`linear-gradient(90deg,${C.home},${C.away})`}}/>
    </div>
    <GlassWipe duration={duration}/>
  </AbsoluteFill>;
};

const Matchup:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:18,stiffness:100}});
  const home=p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl;
  const away=p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl;
  return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:enter(frame)}}>
    <Header p={p} label="المواجهة"/>
    <div style={{position:"absolute",top:190,left:55,right:55,bottom:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",transform:`translateY(${(1-s)*26}px)`}}>
      <CompetitionMark p={p}/>
      <div style={{fontSize:22,color:C.muted}}>{p.round?`الجولة ${p.round}`:""}</div>
      <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 160px 1fr",alignItems:"center",gap:24,direction:"ltr"}}>
        <Badge name={tx(p.awayTeam)} url={away} color={C.away}/>
        <div style={{fontSize:62,fontWeight:950,color:C.white,textAlign:"center"}}>×</div>
        <Badge name={tx(p.homeTeam)} url={home} color={C.home}/>
      </div>
      <div style={{fontSize:22,color:C.muted}}>{formatDate(p.match?.startTime)}</div>
      <Panel style={{width:"100%",borderRadius:28,padding:"24px 30px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,direction:"rtl"}}>
        <div><div style={{fontSize:16,color:C.muted}}>الملعب</div><div style={{fontSize:23,fontWeight:800,marginTop:5}}>{tx(p.match?.venue,"—")}</div></div>
        <div><div style={{fontSize:16,color:C.muted}}>الحكم</div><div style={{fontSize:23,fontWeight:800,marginTop:5}}>{tx(p.match?.referee,"—")}</div></div>
      </Panel>
    </div>
    <GlassWipe duration={duration}/>
  </AbsoluteFill>;
};

const runningScore = (goals:any[],idx:number) => {
  let h=0,a=0;
  goals.slice(0,idx+1).forEach((g)=>{ if(String(g?.teamSide).toLowerCase()==="home") h++; else if(String(g?.teamSide).toLowerCase()==="away") a++; });
  return `${h} - ${a}`;
};

const GoalScene:React.FC<{p:MatchProps;goal:any;index:number;duration:number}> = ({p,goal,index,duration}) => {
  const frame=useCurrentFrame();
  const src=goal?.videoUrl||p.highlightsVideoUrl;
  const fallbackStart=n(p.highlightsStartSeconds)+(index*Math.max(5,Math.round(duration/FPS)));
  const startSec=n(goal?.videoStartSeconds||goal?.clipStartSeconds||fallbackStart);
  const score=runningScore(p.goals||[],index);
  const teamSide=String(goal?.teamSide||"").toLowerCase();
  const teamColor=teamSide==="home"?C.home:C.away;
  const badge=teamSide==="home"?(p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl):(p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl);
  return <AbsoluteFill style={{fontFamily,color:C.white,opacity:enter(frame),overflow:"hidden"}}>
    {src ? <>
      <OffthreadVideo src={src} startFrom={Math.round(startSec*FPS)} muted style={{position:"absolute",inset:-80,width:"calc(100% + 160px)",height:"calc(100% + 160px)",objectFit:"cover",filter:"blur(34px) brightness(.34) saturate(.9)",transform:"scale(1.12)"}}/>
      <div style={{position:"absolute",top:375,left:0,right:0,height:608,background:"#000",boxShadow:"0 30px 80px rgba(0,0,0,.45)"}}>
        <OffthreadVideo src={src} startFrom={Math.round(startSec*FPS)} muted={false} style={{width:"100%",height:"100%",objectFit:"contain",background:"#000"}}/>
      </div>
    </> : <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 45%,${teamColor}1f,transparent 38%)`}}/>}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(4,10,16,.78),transparent 24%,transparent 62%,rgba(4,10,16,.96) 82%)"}}/>
    <Header p={p} label={`الهدف ${index+1}`}/>
    <div style={{position:"absolute",left:48,right:48,bottom:74,direction:"rtl"}}>
      <div style={{height:3,background:`linear-gradient(90deg,transparent,${teamColor},transparent)`,marginBottom:22}}/>
      <div style={{display:"grid",gridTemplateColumns:"150px 1fr 180px",alignItems:"center",gap:24}}>
        <div style={{fontSize:52,fontWeight:950,color:teamColor,textAlign:"center"}}>{tx(goal?.displayMinute,goal?.minute?`${goal.minute}'`:"")}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start",gap:18}}>
          {badge&&<Img src={badge} style={{width:76,height:76,objectFit:"contain"}}/>}
          <div><div style={{fontSize:36,fontWeight:950}}>{tx(goal?.scorer,"هدف")}</div><div style={{fontSize:19,color:C.muted,marginTop:5}}>{tx(goal?.team)}{goal?.assist?` • صناعة ${goal.assist}`:""}</div></div>
        </div>
        <ScoreFixed score={score} size={58}/>
      </div>
    </div>
    <GlassWipe duration={duration}/>
  </AbsoluteFill>;
};

const HighlightsFallback:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  if(!p.highlightsVideoUrl) return null;
  return <AbsoluteFill style={{fontFamily,color:C.white,opacity:enter(frame)}}>
    <OffthreadVideo src={p.highlightsVideoUrl} startFrom={Math.round(n(p.highlightsStartSeconds)*FPS)} muted style={{position:"absolute",inset:-70,width:"calc(100% + 140px)",height:"calc(100% + 140px)",objectFit:"cover",filter:"blur(32px) brightness(.35)",transform:"scale(1.12)"}}/>
    <div style={{position:"absolute",top:390,left:0,right:0,height:608,background:"#000"}}><OffthreadVideo src={p.highlightsVideoUrl} startFrom={Math.round(n(p.highlightsStartSeconds)*FPS)} muted={false} style={{width:"100%",height:"100%",objectFit:"contain"}}/></div>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(4,10,16,.78),transparent 25%,transparent 68%,rgba(4,10,16,.92))"}}/>
    <Header p={p} label="أبرز اللقطات"/>
    <div style={{position:"absolute",left:55,right:55,bottom:80,display:"flex",justifyContent:"space-between",alignItems:"center",direction:"rtl"}}><div style={{fontSize:38,fontWeight:900}}>{p.homeTeam} × {p.awayTeam}</div><ScoreFixed score={p.score} size={62}/></div>
    <GlassWipe duration={duration}/>
  </AbsoluteFill>;
};

const FinalScore:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const goals=p.goals||[];
  const home=p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl;
  const away=p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl;
  return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:enter(frame)}}>
    <Header p={p} label="النتيجة النهائية"/>
    <div style={{position:"absolute",top:205,left:55,right:55,bottom:80,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <CompetitionMark p={p}/>
      <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 250px 1fr",alignItems:"center",gap:16,direction:"ltr",marginTop:52}}>
        <Badge name={tx(p.awayTeam)} url={away} color={C.away} size={175}/>
        <ScoreFixed score={p.score} size={92}/>
        <Badge name={tx(p.homeTeam)} url={home} color={C.home} size={175}/>
      </div>
      <Panel style={{width:"100%",borderRadius:28,padding:"22px 26px",marginTop:48}}>
        <div style={{fontSize:19,color:C.muted,marginBottom:16}}>الهدافون</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {goals.slice(0,6).map((g:any,i:number)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderRadius:16,background:"rgba(255,255,255,.035)",gap:12}}><span style={{fontSize:20,fontWeight:800}}>{tx(g.scorer)}</span><span style={{fontSize:18,color:String(g.teamSide).toLowerCase()==="home"?C.home:C.away}}>{tx(g.displayMinute,g.minute?`${g.minute}'`:"")}</span></div>)}
          {goals.length===0&&<div style={{fontSize:20,color:C.muted}}>لا توجد بيانات أهداف</div>}
        </div>
      </Panel>
    </div>
    <GlassWipe duration={duration}/>
  </AbsoluteFill>;
};

const animatedValue=(v:number,progress:number,decimals=0)=> decimals>0?(v*progress).toFixed(decimals):Math.round(v*progress).toString();

const StatTitle:React.FC<{p:MatchProps;story:any}> = ({p,story}) => <>
  <Header p={p} label="إحصائيات المباراة"/>
  <div style={{position:"absolute",top:205,left:55,right:55,textAlign:"center",direction:"rtl"}}>
    <div style={{fontFamily,fontSize:56,fontWeight:950,color:C.white}}>{tx(story.headline)}</div>
    <div style={{fontFamily,fontSize:20,color:C.muted,marginTop:7}}>{tx(story.metric)}</div>
  </div>
</>;

const TeamValues:React.FC<{p:MatchProps;story:any;progress:number;decimals?:number;suffix?:string}> = ({p,story,progress,decimals=0,suffix=""}) => {
  const hv=n(story.homeValue),av=n(story.awayValue);
  return <div style={{position:"absolute",left:65,right:65,bottom:95,display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,direction:"ltr"}}>
    <Panel style={{borderRadius:24,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderColor:`${C.away}44`}}><div style={{fontFamily,fontSize:22,fontWeight:850,color:C.white}}>{story.awayLabel||p.awayTeam}</div><div style={{fontFamily,fontSize:50,fontWeight:950,color:C.away}}>{animatedValue(av,progress,decimals)}{suffix}</div></Panel>
    <Panel style={{borderRadius:24,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderColor:`${C.home}44`}}><div style={{fontFamily,fontSize:22,fontWeight:850,color:C.white}}>{story.homeLabel||p.homeTeam}</div><div style={{fontFamily,fontSize:50,fontWeight:950,color:C.home}}>{animatedValue(hv,progress,decimals)}{suffix}</div></Panel>
  </div>;
};

const GoalOutline:React.FC<{children?:React.ReactNode}> = ({children}) => <div style={{position:"relative",width:720,height:410,border:"6px solid rgba(255,255,255,.82)",borderBottomWidth:8,boxShadow:"inset 0 0 0 1px rgba(255,255,255,.16)"}}>
  <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.12) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.12) 2px,transparent 2px)",backgroundSize:"72px 68px"}}/>{children}
</div>;

const ShotsVisual:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[6,50],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=Math.min(12,Math.round(n(story.homeValue))), av=Math.min(12,Math.round(n(story.awayValue)));
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:390,left:0,right:0,display:"flex",justifyContent:"center"}}><svg width="820" height="650" viewBox="0 0 820 650">
    <rect x="210" y="70" width="400" height="225" fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="6"/>
    <g stroke="rgba(255,255,255,.13)" strokeWidth="2">{Array.from({length:6}).map((_,i)=><line key={`v${i}`} x1={210+i*80} y1="70" x2={210+i*80} y2="295"/>)}{Array.from({length:4}).map((_,i)=><line key={`h${i}`} x1="210" y1={70+i*56} x2="610" y2={70+i*56}/>)}</g>
    {Array.from({length:av}).map((_,i)=>{const x1=70+(i%4)*34,y1=560-Math.floor(i/4)*40,x2=275+(i*47)%275,y2=120+(i*37)%120;return <line key={`a${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.away} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-progress)} opacity={.85}/>;})}
    {Array.from({length:hv}).map((_,i)=>{const x1=750-(i%4)*34,y1=560-Math.floor(i/4)*40,x2=545-(i*43)%275,y2=125+(i*31)%115;return <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.home} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-progress)} opacity={.85}/>;})}
  </svg></div><TeamValues p={p} story={story} progress={progress}/><GlassWipe duration={duration}/></AbsoluteFill>;
};

const OnTargetVisual:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[5,42],[0,1],{easing:Easing.out(Easing.back(1.4)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=Math.min(9,Math.round(n(story.homeValue))), av=Math.min(9,Math.round(n(story.awayValue)));
  const dots=(count:number,color:string,offset:number)=>Array.from({length:count}).map((_,i)=><div key={`${color}${i}`} style={{position:"absolute",width:34,height:34,borderRadius:99,border:`5px solid ${color}`,left:`${12+((i*23+offset)%70)}%`,top:`${12+((i*31+offset)%64)}%`,transform:`scale(${progress})`,boxShadow:`0 0 24px ${color}88`}}/>);
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:450,left:0,right:0,display:"flex",justifyContent:"center"}}><GoalOutline>{dots(av,C.away,7)}{dots(hv,C.home,19)}</GoalOutline></div><TeamValues p={p} story={story} progress={progress}/><GlassWipe duration={duration}/></AbsoluteFill>;
};

const BigChanceVisual:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[6,48],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=Math.min(8,Math.round(n(story.homeValue))), av=Math.min(8,Math.round(n(story.awayValue)));
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:390,left:0,right:0,display:"flex",justifyContent:"center"}}>
    <div style={{width:690,height:640,border:"4px solid rgba(255,255,255,.55)",position:"relative",background:"linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.01))"}}>
      <div style={{position:"absolute",left:160,right:160,top:0,height:180,borderLeft:"4px solid rgba(255,255,255,.40)",borderRight:"4px solid rgba(255,255,255,.40)",borderBottom:"4px solid rgba(255,255,255,.40)"}}/>
      <div style={{position:"absolute",left:160,right:160,bottom:0,height:180,borderLeft:"4px solid rgba(255,255,255,.40)",borderRight:"4px solid rgba(255,255,255,.40)",borderTop:"4px solid rgba(255,255,255,.40)"}}/>
      <div style={{position:"absolute",left:0,right:0,top:"50%",height:2,background:"rgba(255,255,255,.25)"}}/>
      {Array.from({length:av}).map((_,i)=><div key={`a${i}`} style={{position:"absolute",width:40,height:40,borderRadius:99,background:C.away,left:`${15+(i*17)%68}%`,top:`${12+(i*23)%30}%`,transform:`scale(${progress})`,boxShadow:`0 0 24px ${C.away}99`}}/>)}
      {Array.from({length:hv}).map((_,i)=><div key={`h${i}`} style={{position:"absolute",width:40,height:40,borderRadius:99,background:C.home,left:`${18+(i*19)%65}%`,bottom:`${12+(i*21)%30}%`,transform:`scale(${progress})`,boxShadow:`0 0 24px ${C.home}99`}}/>)}
    </div>
  </div><TeamValues p={p} story={story} progress={progress}/><GlassWipe duration={duration}/></AbsoluteFill>;
};

const XgVisual:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[6,50],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=n(story.homeValue),av=n(story.awayValue),max=Math.max(2.5,hv,av);
  const meter=(label:string,value:number,color:string)=> <div style={{marginBottom:54}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",direction:"rtl",marginBottom:14}}><div style={{fontFamily,fontSize:28,fontWeight:850,color:C.white}}>{label}</div><div style={{fontFamily,fontSize:64,fontWeight:950,color}}>{animatedValue(value,progress,2)}</div></div><div style={{height:28,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${clamp((value/max)*100*progress,0,100)}%`,background:`linear-gradient(90deg,${color}66,${color})`,borderRadius:999,boxShadow:`0 0 32px ${color}77`}}/></div></div>;
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:480,left:105,right:105}}>{meter(story.homeLabel||p.homeTeam||"",hv,C.home)}{meter(story.awayLabel||p.awayTeam||"",av,C.away)}<div style={{fontFamily,fontSize:18,color:C.muted,textAlign:"center",direction:"rtl"}}>مقياس الأهداف المتوقعة xG</div></div><GlassWipe duration={duration}/></AbsoluteFill>;
};

const PossessionVisual:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[6,48],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=n(story.homeValue),av=n(story.awayValue),sum=Math.max(1,hv+av),homePct=hv/sum*100;
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:535,left:85,right:85}}>
    <div style={{display:"flex",justifyContent:"space-between",direction:"rtl",marginBottom:24}}><div style={{fontFamily,fontSize:64,fontWeight:950,color:C.home}}>{animatedValue(hv,progress)}%</div><div style={{fontFamily,fontSize:64,fontWeight:950,color:C.away}}>{animatedValue(av,progress)}%</div></div>
    <div style={{height:62,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden",display:"flex",direction:"ltr"}}><div style={{width:`${(100-homePct)*progress}%`,background:C.away,boxShadow:`0 0 30px ${C.away}66`}}/><div style={{width:`${homePct*progress}%`,background:C.home,boxShadow:`0 0 30px ${C.home}66`}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginTop:24,direction:"ltr"}}><div style={{fontFamily,fontSize:28,fontWeight:850,color:C.away}}>{story.awayLabel||p.awayTeam}</div><div style={{fontFamily,fontSize:28,fontWeight:850,color:C.home}}>{story.homeLabel||p.homeTeam}</div></div>
  </div><GlassWipe duration={duration}/></AbsoluteFill>;
};

const GenericStat:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[6,48],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return <AbsoluteFill style={{opacity:enter(frame)}}><StatTitle p={p} story={story}/><div style={{position:"absolute",top:480,left:120,right:120}}><Panel style={{borderRadius:34,padding:48}}><TeamValues p={p} story={story} progress={progress}/></Panel></div><GlassWipe duration={duration}/></AbsoluteFill>;
};

const Stat:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const id=tx(story.id).toLowerCase();
  const visual=tx(story.visual).toLowerCase();
  if(id==="shots"||visual==="shot_trails") return <ShotsVisual p={p} story={story} duration={duration}/>;
  if(id==="shots_on_target"||visual==="goal_dots") return <OnTargetVisual p={p} story={story} duration={duration}/>;
  if(id==="big_chances"||visual==="chance_map") return <BigChanceVisual p={p} story={story} duration={duration}/>;
  if(id==="xg"||visual==="xg_meter") return <XgVisual p={p} story={story} duration={duration}/>;
  if(id==="possession"||visual==="possession_bar") return <PossessionVisual p={p} story={story} duration={duration}/>;
  return <GenericStat p={p} story={story} duration={duration}/>;
};

const positionAr = (v:unknown) => {
  const s=tx(v).toLowerCase();
  const map:Record<string,string>={"left forward":"جناح أيسر","right forward":"جناح أيمن","centre-forward":"مهاجم صريح","center forward":"مهاجم صريح","attacker":"مهاجم","midfielder":"وسط","defender":"مدافع","goalkeeper":"حارس مرمى"};
  return map[s]||tx(v);
};

const Star:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:18,stiffness:96}});
  const player=p.starPlayer||{};
  const st=player.stats||{};
  const photo=player.photoUrl||p.assets?.starPlayerPhotoUrl;
  const curated=[["Key Passes","تمريرات مفتاحية"],["Big Chances Created","فرص كبيرة صنعها"],["Assists","تمريرات حاسمة"],["Total Shots","تسديدات"]].filter(([k])=>st[k]!=null).slice(0,4);
  return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:enter(frame)}}><Header p={p} label="نجم المباراة"/><div style={{position:"absolute",top:195,left:55,right:55,bottom:80}}><Panel style={{height:"100%",borderRadius:36,padding:38,display:"grid",gridTemplateColumns:"1.08fr .92fr",gap:32,transform:`scale(${.96+.04*s})`}}>
    <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{fontSize:20,color:C.away,fontWeight:850}}>نجم المباراة</div>
      <div style={{fontSize:52,fontWeight:950,lineHeight:1.25,marginTop:10}}>{player.name||player.nameEn||"نجم المباراة"}</div>
      <div style={{fontSize:20,color:C.muted,marginTop:8}}>{player.team||""} • {positionAr(player.position||player.positionGroup)}</div>
      <div style={{display:"flex",alignItems:"center",gap:18,marginTop:32}}><div style={{width:126,height:126,borderRadius:999,border:`3px solid ${C.away}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,fontWeight:950,color:C.away}}>{player.rating??"-"}</div><div><div style={{fontSize:17,color:C.muted}}>التقييم</div><div style={{fontSize:23,fontWeight:850,marginTop:4}}>أفضل لاعب في المباراة</div></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:38}}>{curated.map(([k,label],i)=><div key={k} style={{padding:"18px 20px",borderRadius:20,background:"rgba(255,255,255,.045)",border:`1px solid ${C.line}`}}><div style={{fontSize:16,color:C.muted}}>{label}</div><div style={{fontSize:42,fontWeight:950,color:i%2?C.away:C.home,marginTop:5}}>{st[k]}</div></div>)}</div>
    </div>
    <div style={{position:"relative",borderRadius:30,overflow:"hidden",background:`radial-gradient(circle at 50% 42%,${C.away}25,transparent 62%)`}}>{photo?<Img src={photo} style={{position:"absolute",left:0,right:0,bottom:0,width:"100%",height:"92%",objectFit:"contain",objectPosition:"center bottom"}}/>:<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:160,color:C.away}}>★</div>}<div style={{position:"absolute",left:0,right:0,bottom:0,height:200,background:"linear-gradient(transparent,rgba(6,16,25,.95))"}}/></div>
  </Panel></div><GlassWipe duration={duration}/></AbsoluteFill>;
};

const Outro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:18,stiffness:92}});
  const comp=p.assets?.competitionLogoUrl;
  return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:enter(frame)}}><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transform:`scale(${.92+.08*s})`}}><Brand logo={p.assets?.tacticLogoUrl}/>{comp&&<Img src={comp} style={{height:88,maxWidth:220,objectFit:"contain",marginTop:38}}/>}<div style={{fontSize:64,fontWeight:950,lineHeight:1.35,marginTop:34}}>خلف كل مباراة…<br/>قصة تحكيها الأرقام</div><div style={{width:230,height:5,borderRadius:10,marginTop:28,background:`linear-gradient(90deg,${C.home},${C.away})`}}/><div style={{marginTop:28}}><ScoreFixed score={p.score} size={56}/></div><div style={{fontSize:22,color:C.muted,marginTop:10}}>{p.homeTeam} × {p.awayTeam}</div></div><GlassWipe duration={duration}/></AbsoluteFill>;
};

export const TacticMatch:React.FC<MatchProps> = (p) => {
  const t=timings(p);
  const stats=(p.statsCards?.length?p.statsCards:p.dataStories)||[];
  const goals=p.goals||[];
  let cursor=0;
  const sections:React.ReactNode[]=[];

  sections.push(<Sequence key="intro" from={cursor} durationInFrames={t.intro}><Intro p={p} duration={t.intro}/></Sequence>); cursor+=t.intro;
  sections.push(<Sequence key="matchup" from={cursor} durationInFrames={t.matchup}><Matchup p={p} duration={t.matchup}/></Sequence>); cursor+=t.matchup;

  if(goals.length>0){
    goals.forEach((goal:any,index:number)=>{sections.push(<Sequence key={`goal-${index}`} from={cursor} durationInFrames={t.goal}><GoalScene p={p} goal={goal} index={index} duration={t.goal}/></Sequence>);cursor+=t.goal;});
  } else if(p.highlightsVideoUrl){
    const hd=sec(p,"highlightsSeconds",8);
    sections.push(<Sequence key="highlights" from={cursor} durationInFrames={hd}><HighlightsFallback p={p} duration={hd}/></Sequence>);cursor+=hd;
  }

  sections.push(<Sequence key="final" from={cursor} durationInFrames={t.final}><FinalScore p={p} duration={t.final}/></Sequence>); cursor+=t.final;
  stats.slice(0,5).forEach((story:any,index:number)=>{const d=Math.max(60,Math.round((n(story.holdSeconds)>0?n(story.holdSeconds):t.stat/FPS)*FPS));sections.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={d}><Stat p={p} story={story} duration={d}/></Sequence>);cursor+=d;});
  if(p.starPlayer){sections.push(<Sequence key="star" from={cursor} durationInFrames={t.star}><Star p={p} duration={t.star}/></Sequence>);cursor+=t.star;}
  sections.push(<Sequence key="outro" from={cursor} durationInFrames={t.outro}><Outro p={p} duration={t.outro}/></Sequence>);

  return <AbsoluteFill style={{background:C.bg}}><MasterBackdrop p={p}/>{sections}</AbsoluteFill>;
};
