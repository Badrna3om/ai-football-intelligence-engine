import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily} = loadFont();

const statSchema = z.object({
  id: z.string().optional(),
  headline: z.string().optional(),
  metric: z.string().optional(),
  homeValue: z.any().optional(),
  awayValue: z.any().optional(),
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
  highlightsVideoUrl: z.string().nullable().optional(),
  highlightsStartSeconds: z.number().nullable().optional(),
  goals: z.array(z.any()).optional(),
  statsCards: z.array(statSchema).optional(),
  dataStories: z.array(statSchema).optional(),
  starPlayer: z.any().nullable().optional(),
  match: z.any().optional(),
  assets: z.any().optional(),
  cards: z.array(z.any()).optional(),
  substitutions: z.array(z.any()).optional(),
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
  goals: [],
  statsCards: [],
  starPlayer: null,
};

const FPS = 30;
const C = {
  bg: "#040C13",
  bg2: "#071923",
  white: "#F8FBFD",
  muted: "#9DB0BC",
  home: "#25D7FF",
  away: "#F3C75A",
  line: "rgba(255,255,255,.15)",
  panel: "rgba(5,17,26,.90)",
};

const num = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const text = (v: unknown, d = "") => String(v ?? d).trim();
const clamp = (v:number,a:number,b:number) => Math.min(b,Math.max(a,v));
const homeColor = (p:MatchProps) => text(p.design?.homeColor, C.home) || C.home;
const awayColor = (p:MatchProps) => text(p.design?.awayColor, C.away) || C.away;
const homeBadge = (p:MatchProps) => p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl;
const awayBadge = (p:MatchProps) => p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl;

const frames = (p:MatchProps,key:string,fallback:number) => {
  const raw = num(p.motionTiming?.[key]);
  return Math.max(30, Math.round((raw > 0 ? raw : fallback) * FPS));
};

const timing = (p:MatchProps) => ({
  intro: frames(p,"introSeconds",5.2),
  matchup: frames(p,"matchupSeconds",6.5),
  goal: frames(p,"goalSeconds",6.2),
  final: frames(p,"finalScoreSeconds",7.0),
  stat: Math.max(174,frames(p,"statsCardSeconds",5.8)),
  star: frames(p,"starPlayerSeconds",7.2),
  outro: frames(p,"outroSeconds",5.5),
});

const sourceStats = (p:MatchProps) => p.statsCards?.length ? p.statsCards : (p.dataStories || []);
const getStat = (p:MatchProps,id:string) => sourceStats(p).find((s:any)=>text(s?.id).toLowerCase()===id);

const statPlan = (p:MatchProps) => {
  const shots = getStat(p,"shots");
  const onTarget = getStat(p,"shots_on_target");
  const big = getStat(p,"big_chances");
  const xg = getStat(p,"xg");
  const possession = getStat(p,"possession");
  const plan:any[] = [];
  if (shots || onTarget) plan.push({kind:"shots_combo",shots,onTarget});
  if (big) plan.push({kind:"big_chances",story:big});
  if (xg) plan.push({kind:"xg",story:xg});
  if (possession) plan.push({kind:"possession",story:possession});
  return plan;
};

export const calculateDuration = (p:MatchProps) => {
  const t=timing(p);
  const goals=p.goals||[];
  return t.intro+t.matchup+goals.length*t.goal+t.final+statPlan(p).length*t.stat+(p.starPlayer?t.star:0)+t.outro;
};

const fadeScene = (f:number,d:number) => interpolate(
  f,[0,12,Math.max(13,d-14),d-1],[0,1,1,0],
  {extrapolateLeft:"clamp",extrapolateRight:"clamp"}
);
const rise = (f:number,a=0,b=20,from=34) => interpolate(f,[a,b],[from,0],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const pop = (f:number,a=0,b=24) => interpolate(f,[a,b],[.72,1],{easing:Easing.out(Easing.back(1.35)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const reveal = (f:number,a=0,b=18) => interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const count = (value:number,progress:number,decimals=0) => decimals ? (value*progress).toFixed(decimals) : Math.round(value*progress).toString();

const Brand:React.FC<{p:MatchProps;large?:boolean;animated?:boolean}> = ({p,large,animated}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=animated?spring({frame:f,fps,config:{damping:16,stiffness:105}}):1;
  const glow=animated?interpolate(f,[0,16,42],[0,.75,.25],{extrapolateRight:"clamp"}):0;
  return <div style={{filter:`drop-shadow(0 0 ${18*glow}px rgba(37,215,255,.75))`,transform:`scale(${animated?.80+.20*s:1})`}}>
    <Img src={p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png")} style={{height:large?112:68,maxWidth:large?390:270,objectFit:"contain"}}/>
  </div>;
};

const CompetitionLogo:React.FC<{p:MatchProps;large?:boolean;withName?:boolean;animated?:boolean}> = ({p,large,withName=true,animated}) => {
  const f=useCurrentFrame();
  const logo=p.assets?.competitionLogoUrl;
  return <div style={{display:"flex",alignItems:"center",gap:14,direction:"rtl",transform:`scale(${animated?pop(f,5,28):1})`}}>
    {logo&&<Img src={logo} style={{height:large?132:58,maxWidth:large?240:115,objectFit:"contain"}}/>}
    {withName&&<b style={{fontFamily,fontSize:large?28:18,color:C.white}}>{text(p.competition)}</b>}
  </div>;
};

const Header:React.FC<{p:MatchProps;label:string;showCompetition?:boolean}> = ({p,label,showCompetition=true}) => (
  <div style={{position:"absolute",top:48,left:44,right:44,zIndex:50,display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center"}}>
    <div>{showCompetition&&<CompetitionLogo p={p}/>}</div>
    <div style={{fontFamily,color:C.white,fontSize:21,fontWeight:900,padding:"11px 22px",border:`1px solid ${C.line}`,borderRadius:999,background:"rgba(2,9,14,.72)",direction:"rtl"}}>{label}</div>
    <div style={{justifySelf:"end"}}><Brand p={p}/></div>
  </div>
);

const Backdrop:React.FC<{p:MatchProps}> = ({p}) => {
  const f=useCurrentFrame();
  const hb=homeBadge(p),ab=awayBadge(p);
  return <AbsoluteFill style={{background:`radial-gradient(circle at 50% 12%,${homeColor(p)}18,transparent 30%),linear-gradient(180deg,${C.bg2},${C.bg} 73%)`,overflow:"hidden"}}>
    {hb&&<Img src={hb} style={{position:"absolute",width:560,height:560,right:-160,top:150,objectFit:"contain",opacity:.045,filter:"grayscale(1)",transform:`rotate(${2+Math.sin(f/90)}deg)`}}/>}
    {ab&&<Img src={ab} style={{position:"absolute",width:560,height:560,left:-160,bottom:80,objectFit:"contain",opacity:.045,filter:"grayscale(1)",transform:`rotate(${-2+Math.sin(f/100)}deg)`}}/>}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,.015),transparent 26%,rgba(0,0,0,.17))"}}/>
  </AbsoluteFill>;
};

const Panel:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>> = ({children,style}) => <div style={{background:C.panel,border:`1px solid ${C.line}`,boxShadow:"0 26px 72px rgba(0,0,0,.30)",...style}}>{children}</div>;

const TeamBadge:React.FC<{name:string;url?:string|null;color:string;size?:number;animated?:boolean}> = ({name,url,color,size=220,animated}) => {
  const f=useCurrentFrame();
  const p=animated?pop(f,8,32):1;
  return <div style={{textAlign:"center",transform:`scale(${p})`}}>
    <div style={{width:size,height:size,borderRadius:999,border:`2px solid ${color}55`,margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,rgba(255,255,255,.07),${color}11 68%,transparent)`,boxShadow:`0 18px 58px ${color}24`}}>
      {url?<Img src={url} style={{width:"80%",height:"80%",objectFit:"contain"}}/>:<b style={{fontFamily,fontSize:size*.36,color}}>{name.slice(0,1)}</b>}
    </div>
    <b style={{fontFamily,fontSize:38,color:C.white,display:"block",marginTop:14,lineHeight:1.25}}>{name}</b>
  </div>;
};

const Score:React.FC<{p:MatchProps;score?:string;size?:number}> = ({p,score,size=90}) => {
  const [h,a]=text(score||p.score,"0 - 0").split("-").map(x=>x.trim());
  return <div style={{display:"flex",gap:20,justifyContent:"center",alignItems:"center",direction:"ltr",fontFamily}}>
    <b style={{fontSize:size,color:homeColor(p)}}>{h}</b>
    <span style={{fontSize:size*.4,color:C.muted}}>–</span>
    <b style={{fontSize:size,color:awayColor(p)}}>{a}</b>
  </div>;
};

const formatDate = (v:unknown) => {
  const s=text(v); if(!s)return "";
  const d=new Date(s); if(Number.isNaN(d.getTime()))return s;
  const uae=new Date(d.getTime()+4*3600*1000);
  return `${String(uae.getUTCDate()).padStart(2,"0")}/${String(uae.getUTCMonth()+1).padStart(2,"0")} • ${String(uae.getUTCHours()).padStart(2,"0")}:${String(uae.getUTCMinutes()).padStart(2,"0")} UAE`;
};

const Intro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,direction:"rtl"}}>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <div style={{transform:`translateY(${rise(f,0,24)}px)`}}><Brand p={p} large animated/></div>
      <div style={{marginTop:94}}><CompetitionLogo p={p} large withName={false} animated/></div>
      <div style={{fontSize:24,color:C.muted,marginTop:38,opacity:reveal(f,20,40)}}>{text(p.competition)} {p.round?`• الجولة ${p.round}`:""}</div>
      <div style={{fontSize:70,fontWeight:950,lineHeight:1.3,maxWidth:900,marginTop:72,transform:`translateY(${rise(f,34,62)}px)`,opacity:reveal(f,34,56)}}>{p.introHeadline||`${p.homeTeam} × ${p.awayTeam}`}</div>
      <div style={{width:250,height:5,borderRadius:999,marginTop:38,background:`linear-gradient(90deg,${awayColor(p)},${homeColor(p)})`,transform:`scaleX(${reveal(f,52,78)})`}}/>
    </div>
  </AbsoluteFill>;
};

const InfoCard:React.FC<{label:string;value:any;frame:number;delay:number}> = ({label,value,frame,delay}) => <Panel style={{borderRadius:22,padding:"18px 24px",opacity:reveal(frame,delay,delay+16),transform:`translateY(${rise(frame,delay,delay+16)}px)`}}>
  <div style={{fontSize:16,color:C.muted}}>{label}</div>
  <div style={{fontSize:25,fontWeight:900,marginTop:5}}>{text(value,"—")}</div>
</Panel>;

const Matchup:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const f=useCurrentFrame();
  const rankH=p.match?.home?.rank??p.match?.home?.position??"—";
  const rankA=p.match?.away?.rank??p.match?.away?.position??"—";
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,direction:"rtl"}}>
    <Header p={p} label="المواجهة" showCompetition={false}/>
    <div style={{position:"absolute",top:160,left:52,right:52,bottom:70,textAlign:"center"}}>
      <CompetitionLogo p={p} large animated/>
      <div style={{fontSize:46,fontWeight:950,marginTop:32,opacity:reveal(f,16,36)}}>الجولة {p.round??"—"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 150px 1fr",alignItems:"center",direction:"ltr",marginTop:58}}>
        <TeamBadge name={text(p.awayTeam)} url={awayBadge(p)} color={awayColor(p)} size={245} animated/>
        <div style={{fontSize:68,fontWeight:950}}>×</div>
        <TeamBadge name={text(p.homeTeam)} url={homeBadge(p)} color={homeColor(p)} size={245} animated/>
      </div>
      <div style={{fontSize:22,color:C.muted,marginTop:30}}>{formatDate(p.match?.startTime)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:42,textAlign:"right"}}>
        <InfoCard label="الملعب" value={p.match?.venue} frame={f} delay={50}/>
        <InfoCard label="الحكم" value={p.match?.referee} frame={f} delay={60}/>
        <InfoCard label="ترتيب الفريقين" value={`${p.homeTeam} #${rankH}   •   ${p.awayTeam} #${rankA}`} frame={f} delay={70}/>
      </div>
    </div>
  </AbsoluteFill>;
};

const runningScore=(goals:any[],idx:number)=>{let h=0,a=0;goals.slice(0,idx+1).forEach(g=>{if(String(g?.teamSide).toLowerCase()==="home")h++;else if(String(g?.teamSide).toLowerCase()==="away")a++;});return`${h} - ${a}`;};

const GoalScene:React.FC<{p:MatchProps;goal:any;index:number;duration:number}> = ({p,goal,index,duration}) => {
  const f=useCurrentFrame();
  const isHome=String(goal?.teamSide).toLowerCase()==="home";
  const color=isHome?homeColor(p):awayColor(p);
  const badge=isHome?homeBadge(p):awayBadge(p);
  const start=num(goal?.videoStartSeconds??goal?.clipStartSeconds);
  const cardY=interpolate(f,[10,28,Math.max(30,duration-24),duration-1],[92,0,0,110],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,overflow:"hidden"}}>
    {goal?.videoUrl&&<>
      <OffthreadVideo src={goal.videoUrl} startFrom={Math.round(start*FPS)} muted style={{position:"absolute",inset:-90,width:"calc(100% + 180px)",height:"calc(100% + 180px)",objectFit:"cover",filter:"blur(36px) brightness(.27) saturate(.9)"}}/>
      <div style={{position:"absolute",top:500,left:0,right:0,height:620,background:"#000",boxShadow:"0 30px 85px rgba(0,0,0,.55)"}}><OffthreadVideo src={goal.videoUrl} startFrom={Math.round(start*FPS)} style={{width:"100%",height:"100%",objectFit:"contain",background:"#000"}}/></div>
    </>}
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(3,9,14,.90),transparent 31%,transparent 67%,rgba(3,9,14,.96) 84%)"}}/>
    <Header p={p} label={`الهدف ${index+1}`} showCompetition={false}/>
    <div style={{position:"absolute",top:160,left:0,right:0,display:"flex",justifyContent:"center"}}><CompetitionLogo p={p} large withName={false} animated/></div>
    <Panel style={{position:"absolute",zIndex:20,left:50,right:50,bottom:78,borderRadius:30,padding:"24px 28px",transform:`translateY(${cardY}px)`,borderColor:`${color}55`}}>
      <div style={{display:"grid",gridTemplateColumns:"115px 1fr 180px",alignItems:"center",gap:22,direction:"ltr"}}>
        {badge&&<Img src={badge} style={{width:96,height:96,objectFit:"contain"}}/>}
        <div style={{direction:"rtl",textAlign:"right"}}><div style={{fontSize:40,fontWeight:950}}>{text(goal?.scorer,"هدف")}</div>{goal?.assist&&<div style={{fontSize:20,color:C.muted,marginTop:8}}>صناعة: {goal.assist}</div>}</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:54,fontWeight:950,color}}>{text(goal?.displayMinute,goal?.minute?`${goal.minute}'`:"")}</div><Score p={p} score={runningScore(p.goals||[],index)} size={38}/></div>
      </div>
    </Panel>
  </AbsoluteFill>;
};

const eventSide=(e:any)=>String(e?.teamSide||e?.side||e?.team_side||"").toLowerCase();
const EventCount:React.FC<{title:string;events:any[];side:"home"|"away";color:string;frame:number;delay:number}> = ({title,events,side,color,frame,delay}) => {
  const c=events.filter(e=>eventSide(e)===side).length;
  const progress=reveal(frame,delay,delay+20);
  return <Panel style={{borderRadius:18,padding:"14px 18px",opacity:progress}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:18,color:C.muted}}>{title}</span><b style={{fontSize:30,color}}>{count(c,progress)}</b></div></Panel>;
};

const FinalScore:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const f=useCurrentFrame();
  const cards=p.cards||p.match?.cards||[];
  const subs=p.substitutions||p.match?.substitutions||[];
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,direction:"rtl"}}>
    <Header p={p} label="النتيجة النهائية" showCompetition={false}/>
    <div style={{position:"absolute",top:165,left:50,right:50,bottom:58,textAlign:"center",transform:`translateY(${rise(f,0,24)}px)`}}>
      <CompetitionLogo p={p} large animated/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 230px 1fr",alignItems:"center",direction:"ltr",marginTop:46}}>
        <TeamBadge name={text(p.homeTeam)} url={homeBadge(p)} color={homeColor(p)} size={190} animated/>
        <Score p={p} size={96}/>
        <TeamBadge name={text(p.awayTeam)} url={awayBadge(p)} color={awayColor(p)} size={190} animated/>
      </div>
      <Panel style={{borderRadius:24,padding:"18px 22px",marginTop:34,textAlign:"right"}}>
        <div style={{fontSize:18,color:C.muted}}>الهدافون</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>{(p.goals||[]).slice(0,6).map((g:any,i:number)=><div key={i} style={{padding:"11px 14px",borderRadius:14,background:"rgba(255,255,255,.035)",display:"flex",justifyContent:"space-between",opacity:reveal(f,36+i*5,52+i*5)}}><b style={{fontSize:19}}>{text(g.scorer)}</b><span style={{fontSize:18,color:String(g.teamSide).toLowerCase()==="home"?homeColor(p):awayColor(p)}}>{text(g.displayMinute)}</span></div>)}</div>
      </Panel>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12,direction:"ltr"}}>
        <EventCount title="الكروت" events={cards} side="home" color={homeColor(p)} frame={f} delay={60}/><EventCount title="الكروت" events={cards} side="away" color={awayColor(p)} frame={f} delay={64}/>
        <EventCount title="التبديلات" events={subs} side="home" color={homeColor(p)} frame={f} delay={68}/><EventCount title="التبديلات" events={subs} side="away" color={awayColor(p)} frame={f} delay={72}/>
      </div>
    </div>
  </AbsoluteFill>;
};

const TeamTop:React.FC<{p:MatchProps}> = ({p}) => <div style={{position:"absolute",zIndex:20,top:205,left:64,right:64,display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,direction:"ltr"}}>
  <div style={{display:"flex",alignItems:"center",gap:16}}>{homeBadge(p)&&<Img src={homeBadge(p)} style={{width:92,height:92,objectFit:"contain"}}/>}<div><b style={{fontFamily,fontSize:28,color:C.white}}>{p.homeTeam}</b><div style={{width:95,height:5,borderRadius:999,marginTop:10,background:homeColor(p)}}/></div></div>
  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:16,direction:"rtl"}}>{awayBadge(p)&&<Img src={awayBadge(p)} style={{width:92,height:92,objectFit:"contain"}}/>}<div><b style={{fontFamily,fontSize:28,color:C.white}}>{p.awayTeam}</b><div style={{width:95,height:5,borderRadius:999,marginTop:10,background:awayColor(p)}}/></div></div>
</div>;

const ShotArrow:React.FC<{x1:number;y1:number;x2:number;y2:number;color:string;progress:number;opacity:number}> = ({x1,y1,x2,y2,color,progress,opacity}) => {
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy),ang=Math.atan2(dy,dx)*180/Math.PI;
  return <div style={{position:"absolute",left:x1,top:y1,width:len,height:4,transformOrigin:"0 50%",transform:`rotate(${ang}deg) scaleX(${progress})`,background:color,borderRadius:999,opacity,boxShadow:`0 0 14px ${color}77`}}><div style={{position:"absolute",right:-2,top:-6,width:0,height:0,borderTop:"8px solid transparent",borderBottom:"8px solid transparent",borderLeft:`15px solid ${color}`}}/></div>;
};

const GoalGraphic:React.FC<{p:MatchProps;frame:number;phase:number}> = ({p,frame,phase}) => {
  const arrowsProgress=phase===0?reveal(frame,22,78):interpolate(frame,[0,20],[1,0],{extrapolateRight:"clamp"});
  const dotsProgress=phase===1?pop(frame,12,34):0;
  const ha=13,aa=17;
  return <div style={{position:"relative",width:900,height:760,margin:"0 auto"}}>
    <div style={{position:"absolute",left:190,top:110,width:520,height:300,border:"6px solid rgba(255,255,255,.88)",boxShadow:"0 0 28px rgba(255,255,255,.09)"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.10) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.10) 2px,transparent 2px)",backgroundSize:"65px 60px"}}/>
      {phase===1&&<>{Array.from({length:4}).map((_,i)=><div key={`hd${i}`} style={{position:"absolute",width:34,height:34,borderRadius:99,border:`5px solid ${homeColor(p)}`,left:`${17+(i*21)%62}%`,top:`${17+(i*29)%55}%`,transform:`scale(${dotsProgress})`,boxShadow:`0 0 24px ${homeColor(p)}99`}}/>)}{Array.from({length:5}).map((_,i)=><div key={`ad${i}`} style={{position:"absolute",width:34,height:34,borderRadius:99,border:`5px solid ${awayColor(p)}`,left:`${24+(i*19+9)%58}%`,top:`${14+(i*25+8)%60}%`,transform:`scale(${dotsProgress})`,boxShadow:`0 0 24px ${awayColor(p)}99`}}/>)}</>}
    </div>
    {phase===0&&<>{Array.from({length:Math.min(ha,10)}).map((_,i)=><ShotArrow key={`h${i}`} x1={70+(i%5)*25} y1={650-Math.floor(i/5)*42} x2={265+(i*47)%330} y2={170+(i*37)%180} color={homeColor(p)} progress={clamp(arrowsProgress-i*.035,0,1)} opacity={.92}/>)}{Array.from({length:Math.min(aa,10)}).map((_,i)=><ShotArrow key={`a${i}`} x1={830-(i%5)*25} y1={650-Math.floor(i/5)*42} x2={635-(i*43)%330} y2={165+(i*31)%185} color={awayColor(p)} progress={clamp(arrowsProgress-i*.035,0,1)} opacity={.92}/>)}</>}
  </div>;
};

const StatsBottomCard:React.FC<{p:MatchProps;label:string;home:number;away:number;progress:number;visible:number}> = ({p,label,home,away,progress,visible}) => <Panel style={{position:"absolute",left:70,right:70,bottom:88,borderRadius:26,padding:"20px 26px",display:"grid",gridTemplateColumns:"150px 1fr 150px",alignItems:"center",opacity:visible,transform:`translateY(${(1-visible)*35}px)`}}>
  <b style={{fontFamily,fontSize:56,color:homeColor(p),textAlign:"center"}}>{count(home,progress)}</b>
  <b style={{fontFamily,fontSize:29,color:C.white,textAlign:"center"}}>{label}</b>
  <b style={{fontFamily,fontSize:56,color:awayColor(p),textAlign:"center"}}>{count(away,progress)}</b>
</Panel>;

const ShotsCombined:React.FC<{p:MatchProps;shots:any;onTarget:any;duration:number}> = ({p,shots,onTarget,duration}) => {
  const f=useCurrentFrame();
  const half=Math.floor(duration/2);
  const phase=f<half?0:1;
  const lf=phase===0?f:f-half;
  const hv=num(shots?.homeValue),av=num(shots?.awayValue),hot=num(onTarget?.homeValue),aot=num(onTarget?.awayValue);
  const statProgress=phase===0?reveal(lf,20,70):reveal(lf,10,44);
  const cardVisible=phase===0?interpolate(lf,[12,30,half-18,half-1],[0,1,1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"}):interpolate(lf,[6,22],[0,1],{extrapolateRight:"clamp"});
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white}}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:135,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>التسديدات</div><div style={{fontSize:20,color:C.muted,marginTop:8}}>إجمالي التسديدات + التسديدات على المرمى</div></div>
    <TeamTop p={p}/>
    <div style={{position:"absolute",top:345,left:0,right:0}}><GoalGraphic p={p} frame={lf} phase={phase}/></div>
    <StatsBottomCard p={p} label={phase===0?"إجمالي التسديدات":"التسديدات على المرمى"} home={phase===0?hv:hot} away={phase===0?av:aot} progress={statProgress} visible={cardVisible}/>
  </AbsoluteFill>;
};

const Pitch:React.FC<{p:MatchProps;children?:React.ReactNode}> = ({p,children}) => <div style={{position:"relative",width:720,height:1080,margin:"auto",background:"linear-gradient(90deg,#0C3B25,#0A4728 12%,#0C3B25 24%,#0A4728 36%,#0C3B25 48%,#0A4728 60%,#0C3B25 72%,#0A4728 84%,#0C3B25)",border:"4px solid rgba(255,255,255,.82)",boxShadow:`-8px 0 28px ${homeColor(p)}44,8px 0 28px ${awayColor(p)}44`}}>
  <div style={{position:"absolute",left:0,right:0,top:"50%",height:3,background:"rgba(255,255,255,.72)"}}/><div style={{position:"absolute",width:180,height:180,borderRadius:999,border:"4px solid rgba(255,255,255,.72)",left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}/>
  <div style={{position:"absolute",left:150,right:150,top:0,height:230,borderLeft:"4px solid rgba(255,255,255,.72)",borderRight:"4px solid rgba(255,255,255,.72)",borderBottom:"4px solid rgba(255,255,255,.72)"}}/><div style={{position:"absolute",left:150,right:150,bottom:0,height:230,borderLeft:"4px solid rgba(255,255,255,.72)",borderRight:"4px solid rgba(255,255,255,.72)",borderTop:"4px solid rgba(255,255,255,.72)"}}/>
  <div style={{position:"absolute",left:255,right:255,top:-28,height:32,border:"4px solid rgba(255,255,255,.8)",background:"rgba(255,255,255,.08)"}}/><div style={{position:"absolute",left:255,right:255,bottom:-28,height:32,border:"4px solid rgba(255,255,255,.8)",background:"rgba(255,255,255,.08)"}}/>{children}
</div>;

const BigChances:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const f=useCurrentFrame();
  const hv=Math.max(0,Math.round(num(story.homeValue))),av=Math.max(0,Math.round(num(story.awayValue)));
  const progress=reveal(f,18,70);
  const dots=(countN:number,color:string,top:boolean)=>Array.from({length:Math.min(countN,9)}).map((_,i)=>{
    const x=13+((i*27+11)%72), y=top?7+((i*19+7)%27):66+((i*23+9)%26), delay=30+i*5;
    const sc=pop(f,delay,delay+18);
    return <div key={`${top?"t":"b"}${i}`} style={{position:"absolute",width:36,height:36,borderRadius:99,left:`${x}%`,top:`${y}%`,background:color,transform:`scale(${sc})`,boxShadow:`0 0 28px ${color}AA`,opacity:sc}}/>;
  });
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white}}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:140,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الفرص الكبيرة</div><div style={{fontSize:20,color:C.muted,marginTop:8}}>BIG CHANCES</div></div>
    <div style={{position:"absolute",top:275,left:0,right:0,display:"flex",justifyContent:"center"}}><Pitch p={p}>{dots(av,awayColor(p),true)}{dots(hv,homeColor(p),false)}
      <div style={{position:"absolute",top:54,left:20,right:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:12}}>{awayBadge(p)&&<Img src={awayBadge(p)} style={{width:74,height:74,objectFit:"contain"}}/>}<div><b style={{fontFamily,fontSize:22,color:C.white}}>{p.awayTeam}</b><div style={{fontFamily,fontSize:30,fontWeight:950,color:awayColor(p)}}>{count(av,progress)}</div></div></div></div>
      <div style={{position:"absolute",bottom:54,left:20,right:20,display:"flex",alignItems:"center",justifyContent:"flex-end"}}><div style={{display:"flex",alignItems:"center",gap:12,direction:"rtl"}}>{homeBadge(p)&&<Img src={homeBadge(p)} style={{width:74,height:74,objectFit:"contain"}}/>}<div><b style={{fontFamily,fontSize:22,color:C.white}}>{p.homeTeam}</b><div style={{fontFamily,fontSize:30,fontWeight:950,color:homeColor(p)}}>{count(hv,progress)}</div></div></div></div>
    </Pitch></div>
  </AbsoluteFill>;
};

const Xg:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const f=useCurrentFrame(); const progress=reveal(f,12,58); const h=num(story.homeValue),a=num(story.awayValue),mx=Math.max(2.5,h,a);
  const row=(label:string,v:number,c:string,badge?:string)=> <Panel style={{borderRadius:26,padding:"28px 28px",marginBottom:28}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",direction:"rtl"}}><div style={{display:"flex",alignItems:"center",gap:14}}>{badge&&<Img src={badge} style={{width:74,height:74,objectFit:"contain"}}/>}<b style={{fontFamily,fontSize:30,color:C.white}}>{label}</b></div><b style={{fontFamily,fontSize:68,color:c}}>{count(v,progress,2)}</b></div><div style={{height:28,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden",marginTop:20}}><div style={{height:"100%",width:`${clamp((v/mx)*100*progress,0,100)}%`,background:`linear-gradient(90deg,${c}66,${c})`,boxShadow:`0 0 25px ${c}66`}}/></div></Panel>;
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white}}><Header p={p} label="إحصائيات المباراة"/><div style={{position:"absolute",top:150,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الأهداف المتوقعة</div><div style={{fontSize:22,color:C.muted,marginTop:8}}>xG</div></div><div style={{position:"absolute",top:440,left:90,right:90}}>{row(p.homeTeam||"",h,homeColor(p),homeBadge(p))}{row(p.awayTeam||"",a,awayColor(p),awayBadge(p))}</div></AbsoluteFill>;
};

const PassArrow:React.FC<{x:number;y:number;rot:number;color:string;progress:number;delay:number;frame:number}> = ({x,y,rot,color,progress,delay}) => {
  const pp=clamp((progress-delay)/Math.max(.01,1-delay),0,1); return <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:110,height:4,transform:`rotate(${rot}deg) scaleX(${pp})`,transformOrigin:"0 50%",background:color,borderRadius:999,boxShadow:`0 0 12px ${color}77`,opacity:.8}}><div style={{position:"absolute",right:-1,top:-5,borderTop:"7px solid transparent",borderBottom:"7px solid transparent",borderLeft:`13px solid ${color}`}}/></div>;
};

const Possession:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const f=useCurrentFrame(); const progress=reveal(f,10,70); const h=num(story.homeValue),a=num(story.awayValue),sum=Math.max(1,h+a),hp=h/sum*100;
  const arrows=(color:string,upper:boolean)=>Array.from({length:10}).map((_,i)=><PassArrow key={`${upper?"u":"l"}${i}`} x={12+((i*17+8)%64)} y={(upper?13:61)+((i*19)%22)} rot={-45+((i*29)%90)} color={color} progress={progress} delay={i*.055} frame={f}/>);
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white}}><Header p={p} label="إحصائيات المباراة"/><div style={{position:"absolute",top:140,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الاستحواذ</div><div style={{fontSize:20,color:C.muted,marginTop:8}}>POSSESSION</div></div><div style={{position:"absolute",top:285,left:0,right:0,display:"flex",justifyContent:"center"}}><Pitch p={p}>{arrows(awayColor(p),true)}{arrows(homeColor(p),false)}</Pitch></div><Panel style={{position:"absolute",left:75,right:75,bottom:74,borderRadius:28,padding:"20px 26px"}}><div style={{display:"flex",justifyContent:"space-between",direction:"ltr",alignItems:"end"}}><div><b style={{fontFamily,fontSize:56,color:homeColor(p)}}>{count(h,progress)}%</b><div style={{fontFamily,fontSize:23,color:C.white}}>{p.homeTeam}</div></div><div style={{textAlign:"right"}}><b style={{fontFamily,fontSize:56,color:awayColor(p)}}>{count(a,progress)}%</b><div style={{fontFamily,fontSize:23,color:C.white}}>{p.awayTeam}</div></div></div><div style={{height:38,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden",display:"flex",direction:"ltr",marginTop:16}}><div style={{width:`${hp*progress}%`,background:homeColor(p)}}/><div style={{width:`${(100-hp)*progress}%`,background:awayColor(p)}}/></div></Panel></AbsoluteFill>;
};

const positionAr=(v:unknown)=>{const s=text(v).toLowerCase();const m:Record<string,string>={"left forward":"جناح أيسر","right forward":"جناح أيمن","centre-forward":"مهاجم صريح","center forward":"مهاجم صريح","attacker":"مهاجم","midfielder":"وسط","defender":"مدافع","goalkeeper":"حارس مرمى"};return m[s]||text(v);};
const shimmer = (f:number) => `${-180+(f%150)*2.4}%`;

const Star:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig(); const s=spring({frame:f,fps,config:{damping:17,stiffness:92}}); const player=p.starPlayer||{}; const st=player.stats||{}; const photo=player.photoUrl||p.assets?.starPlayerPhotoUrl; const teamBadge=String(player.teamId||"")===String(p.match?.home?.id)?homeBadge(p):awayBadge(p)||homeBadge(p); const gold=awayColor(p);
  const curated=[["Key Passes","تمريرات مفتاحية"],["Big Chances Created","فرص كبيرة صنعها"],["Assists","تمريرات حاسمة"],["Total Shots","تسديدات"]].filter(([k])=>st[k]!=null).slice(0,4);
  const progress=reveal(f,24,76);
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,direction:"rtl"}}><Header p={p} label="نجم المباراة"/>
    <div style={{position:"absolute",top:155,left:46,right:46,bottom:70,borderRadius:36,overflow:"hidden",background:"linear-gradient(135deg,rgba(5,18,27,.96),rgba(3,11,18,.96))",border:`1px solid ${C.line}`,boxShadow:"0 30px 90px rgba(0,0,0,.38)"}}>
      <div style={{position:"absolute",inset:0,background:`linear-gradient(115deg,transparent 0 32%,${gold}12 33%,transparent 34% 100%)`}}/>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"51%",overflow:"hidden"}}>{photo?<Img src={photo} style={{position:"absolute",left:-10,bottom:70,width:"112%",height:"84%",objectFit:"contain",objectPosition:"center bottom",transform:`translateY(${(1-s)*70}px) scale(${.94+.06*s})`,filter:`drop-shadow(0 0 28px ${gold}33)`}}/>:<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:180,color:gold}}>★</div>}<div style={{position:"absolute",inset:0,borderRight:`2px solid ${gold}55`,transform:"skewX(-7deg) translateX(35px)"}}/></div>
      <div style={{position:"absolute",right:48,top:115,width:"48%",textAlign:"right"}}>
        <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",gap:14,direction:"rtl"}}>{teamBadge&&<Img src={teamBadge} style={{width:118,height:118,objectFit:"contain",transform:`scale(${pop(f,8,34)})`}}/>}<div><div style={{fontSize:32,fontWeight:950}}>{player.team||""}</div><div style={{fontSize:18,color:C.muted,marginTop:3}}>{positionAr(player.position||player.positionGroup)}</div></div></div>
        <div style={{fontSize:58,fontWeight:950,lineHeight:1.25,marginTop:34,opacity:reveal(f,20,42)}}>{player.name||player.nameEn||"نجم المباراة"}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:36}}><div style={{fontSize:23,fontWeight:850}}>أفضل لاعب في المباراة</div><div style={{width:145,height:145,borderRadius:999,border:`3px solid ${gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,fontWeight:950,color:gold,position:"relative",overflow:"hidden",boxShadow:`0 0 25px ${gold}33`}}>{count(num(player.rating),progress,1)}<div style={{position:"absolute",top:0,bottom:0,width:"40%",left:shimmer(f),background:"linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent)",transform:"skewX(-20deg)"}}/></div></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:15,marginTop:32}}>{curated.map(([k,label],i)=>{const delay=40+i*7;const vis=reveal(f,delay,delay+18);return <Panel key={k} style={{borderRadius:20,padding:"18px 20px",opacity:vis,transform:`translateY(${(1-vis)*24}px)`,position:"relative",overflow:"hidden"}}><div style={{fontSize:16,color:C.muted}}>{label}</div><div style={{fontSize:46,fontWeight:950,color:i%2?homeColor(p):gold,marginTop:7}}>{count(num(st[k]),clamp((progress-i*.08),0,1))}</div><div style={{position:"absolute",top:0,bottom:0,width:"35%",left:shimmer(f+i*18),background:`linear-gradient(90deg,transparent,${gold}22,transparent)`,transform:"skewX(-20deg)"}}/></Panel>})}</div>
      </div>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",border:`2px solid ${gold}22`,borderRadius:36}}/><div style={{position:"absolute",top:0,bottom:0,width:"20%",left:shimmer(f),background:`linear-gradient(90deg,transparent,${gold}13,transparent)`,transform:"skewX(-16deg)",pointerEvents:"none"}}/>
    </div>
  </AbsoluteFill>;
};

const Outro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{opacity:fadeScene(f,duration),fontFamily,color:C.white,direction:"rtl"}}><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}><Brand p={p} large animated/><div style={{fontSize:64,fontWeight:950,lineHeight:1.38,marginTop:64,transform:`translateY(${rise(f,24,52)}px)`,opacity:reveal(f,22,48)}}>خلف كل مباراة…<br/>قصة تحكيها الأرقام</div><div style={{width:250,height:5,borderRadius:999,marginTop:34,background:`linear-gradient(90deg,${awayColor(p)},${homeColor(p)})`,transform:`scaleX(${reveal(f,45,74)})`}}/></div></AbsoluteFill>;
};

export const TacticMatch:React.FC<MatchProps> = (p) => {
  const t=timing(p),goals=p.goals||[],plan=statPlan(p); let cursor=0; const scenes:React.ReactNode[]=[];
  scenes.push(<Sequence key="intro" from={cursor} durationInFrames={t.intro}><Intro p={p} duration={t.intro}/></Sequence>); cursor+=t.intro;
  scenes.push(<Sequence key="matchup" from={cursor} durationInFrames={t.matchup}><Matchup p={p} duration={t.matchup}/></Sequence>); cursor+=t.matchup;
  goals.forEach((goal:any,index:number)=>{scenes.push(<Sequence key={`goal-${index}`} from={cursor} durationInFrames={t.goal}><GoalScene p={p} goal={goal} index={index} duration={t.goal}/></Sequence>);cursor+=t.goal;});
  scenes.push(<Sequence key="final" from={cursor} durationInFrames={t.final}><FinalScore p={p} duration={t.final}/></Sequence>); cursor+=t.final;
  plan.forEach((item:any,index:number)=>{if(item.kind==="shots_combo")scenes.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={t.stat}><ShotsCombined p={p} shots={item.shots} onTarget={item.onTarget} duration={t.stat}/></Sequence>);if(item.kind==="big_chances")scenes.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={t.stat}><BigChances p={p} story={item.story} duration={t.stat}/></Sequence>);if(item.kind==="xg")scenes.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={t.stat}><Xg p={p} story={item.story} duration={t.stat}/></Sequence>);if(item.kind==="possession")scenes.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={t.stat}><Possession p={p} story={item.story} duration={t.stat}/></Sequence>);cursor+=t.stat;});
  if(p.starPlayer){scenes.push(<Sequence key="star" from={cursor} durationInFrames={t.star}><Star p={p} duration={t.star}/></Sequence>);cursor+=t.star;}
  scenes.push(<Sequence key="outro" from={cursor} durationInFrames={t.outro}><Outro p={p} duration={t.outro}/></Sequence>);
  return <AbsoluteFill style={{background:C.bg}}><Backdrop p={p}/>{scenes}</AbsoluteFill>;
};
