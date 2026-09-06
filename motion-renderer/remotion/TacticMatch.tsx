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

const storySchema = z.object({
  id: z.string().optional(),
  headline: z.string().optional(),
  metric: z.string().optional(),
  homeValue: z.union([z.number(), z.string()]).nullable().optional(),
  awayValue: z.union([z.number(), z.string()]).nullable().optional(),
  homeLabel: z.string().optional(),
  awayLabel: z.string().optional(),
  visual: z.string().optional(),
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
  statsCards: [],
  starPlayer: null,
};

const FPS = 30;
const INTRO = 90;
const MATCHUP = 120;
const HIGHLIGHTS = 270;
const STAT = 135;
const STAR = 165;
const OUTRO = 105;

export const calculateDuration = (p: MatchProps) => {
  const stats = Math.min(5, (p.statsCards?.length ?? p.dataStories?.length ?? 0));
  return INTRO + MATCHUP + (p.highlightsVideoUrl ? HIGHLIGHTS : 0) + stats * STAT + (p.starPlayer ? STAR : 0) + OUTRO;
};

const C = {
  bg: "#050C14",
  bg2: "#0A2132",
  white: "#F7FAFC",
  muted: "#91A4B8",
  cyan: "#19D9FF",
  blue: "#238CFF",
  gold: "#E7C264",
  line: "rgba(255,255,255,.12)",
};

const font = "'Noto Sans Arabic','DejaVu Sans',Arial,sans-serif";
const n = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const tx = (v: unknown, d = "") => String(v ?? d).trim();

const fade = (frame:number, duration:number) => {
  const a = interpolate(frame,[0,10],[0,1],{extrapolateRight:"clamp"});
  const b = interpolate(frame,[duration-10,duration],[1,0],{extrapolateLeft:"clamp"});
  return a*b;
};

const Background:React.FC<{accent?:string}> = ({accent=C.cyan}) => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:`radial-gradient(circle at 50% 12%,${accent}22,transparent 34%),linear-gradient(180deg,${C.bg2},${C.bg} 72%)`,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:-160,opacity:.12,transform:`translateY(${(frame*.7)%120-60}px) rotate(-6deg)`,backgroundImage:`linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)`,backgroundSize:"90px 90px"}}/>
    <div style={{position:"absolute",left:-120,right:-120,bottom:190,height:540,border:`2px solid ${accent}30`,borderRadius:"50% 50% 0 0",transform:"perspective(900px) rotateX(65deg)"}}/>
    <div style={{position:"absolute",left:52,right:52,top:54,height:1,background:`linear-gradient(90deg,transparent,${accent},transparent)`}}/>
  </AbsoluteFill>;
};

const Brand:React.FC<{logo?:string|null}> = ({logo}) => logo
  ? <Img src={logo} style={{height:50,maxWidth:260,objectFit:"contain"}}/>
  : <div style={{fontFamily:font,fontSize:29,fontWeight:950,letterSpacing:1,color:C.white}}>TACTIC <span style={{color:C.cyan}}>SPORT</span></div>;

const Top:React.FC<{p:MatchProps;label:string}> = ({p,label}) => <div style={{position:"absolute",top:68,left:60,right:60,zIndex:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
  <Brand logo={p.assets?.tacticLogoUrl}/>
  <div style={{fontFamily:font,color:C.white,fontSize:20,fontWeight:850,direction:"rtl"}}>{label} <span style={{color:C.muted}}>• {tx(p.competition)}{p.round?` • الجولة ${p.round}`:""}</span></div>
</div>;

const Glass:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>> = ({children,style}) => <div style={{background:"linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025))",border:`1px solid ${C.line}`,boxShadow:"0 30px 90px rgba(0,0,0,.30)",...style}}>{children}</div>;

const Badge:React.FC<{name:string;url?:string|null;color:string}> = ({name,url,color}) => <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
  <div style={{width:220,height:220,borderRadius:999,border:`2px solid ${color}88`,display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,rgba(255,255,255,.10),${color}18 70%,transparent)`,boxShadow:`0 20px 80px ${color}22`}}>
    {url ? <Img src={url} style={{width:"78%",height:"78%",objectFit:"contain"}}/> : <div style={{fontFamily:font,fontSize:90,fontWeight:950,color}}>{name.slice(0,1)}</div>}
  </div>
  <div style={{fontFamily:font,fontSize:38,fontWeight:950,color:C.white,textAlign:"center",maxWidth:390}}>{name}</div>
</div>;

const Score:React.FC<{score?:string}> = ({score}) => {
  const [h,a]=tx(score,"0 - 0").split("-").map(x=>x.trim());
  return <div dir="ltr" style={{fontFamily:font,display:"flex",alignItems:"center",gap:24}}><b style={{fontSize:110,color:C.cyan}}>{h}</b><span style={{fontSize:50,color:C.muted}}>–</span><b style={{fontSize:110,color:C.gold}}>{a}</b></div>;
};

const Intro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const s=spring({frame,fps,config:{damping:18,stiffness:90}});
  return <AbsoluteFill style={{fontFamily:font,color:C.white,opacity:fade(frame,duration),direction:"rtl"}}><Background/><Top p={p} label="FINAL MOTION"/>
    <div style={{position:"absolute",top:350,left:75,right:75,transform:`translateY(${(1-s)*55}px)`,opacity:s}}><div style={{fontSize:25,color:C.cyan,fontWeight:850}}>قراءة المباراة في أقل من دقيقة</div><div style={{fontSize:74,fontWeight:950,lineHeight:1.25,marginTop:18}}>{p.introHeadline||`${p.homeTeam} × ${p.awayTeam}`}</div><div style={{height:6,width:220,borderRadius:20,marginTop:28,background:`linear-gradient(90deg,${C.cyan},${C.gold})`}}/></div>
    <div style={{position:"absolute",bottom:115,left:75,right:75,display:"flex",justifyContent:"space-between",alignItems:"end"}}><div style={{fontSize:21,color:C.muted}}>خلف كل مباراة… قصة تحكيها الأرقام</div><Score score={p.score}/></div>
  </AbsoluteFill>;
};

const Matchup:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const s=spring({frame,fps,config:{damping:17,stiffness:100}});
  const comp=p.assets?.competitionLogoUrl;
  return <AbsoluteFill style={{fontFamily:font,color:C.white,opacity:fade(frame,duration),direction:"rtl"}}><Background accent={C.gold}/><Top p={p} label="النتيجة النهائية"/>
    <div style={{position:"absolute",top:235,left:55,right:55,bottom:115,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",transform:`scale(${.92+.08*s})`}}>
      {comp && <Img src={comp} style={{height:105,maxWidth:280,objectFit:"contain"}}/>}
      <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 260px 1fr",alignItems:"center",gap:18}}><Badge name={tx(p.homeTeam)} url={p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl} color={C.cyan}/><div style={{display:"flex",justifyContent:"center"}}><Score score={p.score}/></div><Badge name={tx(p.awayTeam)} url={p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl} color={C.gold}/></div>
      <Glass style={{padding:"18px 32px",borderRadius:22,fontSize:20,color:C.muted,textAlign:"center"}}>المباراة • {tx(p.match?.venue,"الملعب")} {p.match?.referee?`• الحكم ${p.match.referee}`:""}</Glass>
    </div>
  </AbsoluteFill>;
};

const Highlights:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const src=p.highlightsVideoUrl;
  if(!src) return null;
  return <AbsoluteFill style={{background:C.bg,color:C.white,opacity:fade(frame,duration),fontFamily:font}}>
    <OffthreadVideo src={src} startFrom={Math.round((p.highlightsStartSeconds||0)*FPS)} muted={false} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(5,12,20,.65),transparent 28%,transparent 68%,rgba(5,12,20,.86))"}}/>
    <Top p={p} label="أبرز اللقطات"/>
    <div style={{position:"absolute",left:55,right:55,bottom:90,display:"flex",justifyContent:"space-between",alignItems:"center",direction:"rtl"}}><div><div style={{fontSize:42,fontWeight:950}}>{p.homeTeam} × {p.awayTeam}</div><div style={{fontSize:20,color:C.muted,marginTop:8}}>Highlights • المصدر المرئي للمباراة</div></div><Score score={p.score}/></div>
  </AbsoluteFill>;
};

const valueText=(v:unknown,id?:string)=> id==="possession"?`${n(v)}%`:id==="xg"?n(v).toFixed(2):String(v??"-");

const Stat:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const progress=interpolate(frame,[5,42],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hv=n(story.homeValue), av=n(story.awayValue), max=Math.max(hv,av,1);
  return <AbsoluteFill style={{fontFamily:font,color:C.white,opacity:fade(frame,duration),direction:"rtl"}}><Background/><Top p={p} label={tx(story.headline,"إحصائيات المباراة")}/>
    <div style={{position:"absolute",top:250,left:65,right:65}}>
      <div style={{fontSize:58,fontWeight:950,textAlign:"center"}}>{tx(story.headline)}</div><div style={{fontSize:20,color:C.muted,textAlign:"center",marginTop:9}}>{tx(story.metric)}</div>
      <div style={{marginTop:80,display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
        {[{label:story.homeLabel||p.homeTeam,v:hv,c:C.cyan,url:p.assets?.homeBadgeUrl},{label:story.awayLabel||p.awayTeam,v:av,c:C.gold,url:p.assets?.awayBadgeUrl}].map((x,i)=><Glass key={i} style={{height:590,borderRadius:34,padding:34,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{height:100,display:"flex",alignItems:"center",gap:16}}>{x.url&&<Img src={x.url} style={{width:72,height:72,objectFit:"contain"}}/>}<div style={{fontSize:27,fontWeight:900}}>{x.label}</div></div>
          <div style={{fontSize:120,fontWeight:950,color:x.c}}>{valueText(x.v,story.id)}</div>
          <div style={{width:"100%",height:22,borderRadius:20,background:"rgba(255,255,255,.08)",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(x.v/max)*100*progress)}%`,borderRadius:20,background:x.c,boxShadow:`0 0 28px ${x.c}55`}}/></div>
          <div style={{height:135,width:"100%",position:"relative",opacity:.8}}>{Array.from({length:Math.min(10,Math.max(1,Math.round(x.v)))}).map((_,k)=><div key={k} style={{position:"absolute",width:15,height:15,borderRadius:99,background:x.c,left:`${8+(k*17)%84}%`,top:`${10+(k*31)%72}%`,transform:`scale(${progress})`,boxShadow:`0 0 15px ${x.c}`}}/>)}</div>
        </Glass>)}
      </div>
    </div>
  </AbsoluteFill>;
};

const Star:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame(); const s=p.starPlayer||{}; const st=s.stats||{};
  const curated=[["Key Passes","تمريرات مفتاحية"],["Big Chances Created","فرص كبيرة صنعها"],["Assists","تمريرات حاسمة"],["Total Shots","تسديدات"]].filter(([k])=>st[k]!=null);
  const photo=s.photoUrl||p.assets?.starPlayerPhotoUrl;
  return <AbsoluteFill style={{fontFamily:font,color:C.white,opacity:fade(frame,duration),direction:"rtl"}}><Background accent={C.gold}/><Top p={p} label="نجم المباراة"/>
    <div style={{position:"absolute",top:225,left:55,right:55,bottom:95}}><Glass style={{height:"100%",borderRadius:38,padding:38,display:"grid",gridTemplateColumns:"330px 1fr",gap:36}}>
      <div style={{position:"relative",borderRadius:30,overflow:"hidden",background:`radial-gradient(circle,${C.gold}25,transparent 65%)`}}>{photo?<Img src={photo} style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center bottom"}}/>:<div style={{fontSize:140,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>★</div>}<div style={{position:"absolute",left:0,right:0,bottom:0,height:220,background:"linear-gradient(transparent,rgba(5,12,20,.96))"}}><div style={{position:"absolute",bottom:24,left:22,right:22}}><div style={{fontSize:38,fontWeight:950}}>{s.name||s.nameEn||"نجم المباراة"}</div><div style={{fontSize:18,color:C.muted,marginTop:8}}>{s.team||""} • {s.position||""}</div></div></div></div>
      <div style={{display:"flex",flexDirection:"column"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:27,color:C.gold,fontWeight:900}}>أفضل تقييم</div><div style={{fontSize:19,color:C.muted,marginTop:8}}>أبرز أرقام اللاعب</div></div><div style={{width:145,height:145,borderRadius:999,border:`3px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:58,fontWeight:950,color:C.gold}}>{s.rating??"-"}</div></div>
      <div style={{marginTop:46,display:"grid",gridTemplateColumns:"1fr 1fr",gap:17}}>{curated.slice(0,4).map(([k,label],i)=><div key={k} style={{padding:24,borderRadius:22,background:"rgba(255,255,255,.05)",border:`1px solid ${C.line}`}}><div style={{fontSize:18,color:C.muted}}>{label}</div><div style={{fontSize:50,fontWeight:950,color:i%2?C.gold:C.cyan,marginTop:7}}>{st[k]}</div></div>)}</div></div>
    </Glass></div>
  </AbsoluteFill>;
};

const Outro:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const s=spring({frame,fps,config:{damping:18,stiffness:90}});
  return <AbsoluteFill style={{fontFamily:font,color:C.white,opacity:fade(frame,duration),direction:"rtl"}}><Background accent={C.gold}/><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transform:`scale(${.92+.08*s})`}}><Brand logo={p.assets?.tacticLogoUrl}/><div style={{fontSize:70,fontWeight:950,lineHeight:1.3,marginTop:38}}>خلف كل مباراة…<br/>قصة تحكيها الأرقام</div><div style={{height:6,width:230,borderRadius:20,marginTop:30,background:`linear-gradient(90deg,${C.cyan},${C.gold})`}}/><div style={{fontSize:24,color:C.muted,marginTop:35}}>{p.homeTeam} {p.score} {p.awayTeam}</div></div></AbsoluteFill>;
};

export const TacticMatch:React.FC<MatchProps> = (p) => {
  const stats=(p.statsCards?.length?p.statsCards:p.dataStories)||[];
  let cursor=0;
  const sections:React.ReactNode[]=[];
  sections.push(<Sequence key="intro" from={cursor} durationInFrames={INTRO}><Intro p={p} duration={INTRO}/></Sequence>); cursor+=INTRO;
  sections.push(<Sequence key="match" from={cursor} durationInFrames={MATCHUP}><Matchup p={p} duration={MATCHUP}/></Sequence>); cursor+=MATCHUP;
  if(p.highlightsVideoUrl){sections.push(<Sequence key="highlights" from={cursor} durationInFrames={HIGHLIGHTS}><Highlights p={p} duration={HIGHLIGHTS}/></Sequence>);cursor+=HIGHLIGHTS;}
  stats.slice(0,5).forEach((story:any,i:number)=>{sections.push(<Sequence key={`stat-${i}`} from={cursor} durationInFrames={STAT}><Stat p={p} story={story} duration={STAT}/></Sequence>);cursor+=STAT;});
  if(p.starPlayer){sections.push(<Sequence key="star" from={cursor} durationInFrames={STAR}><Star p={p} duration={STAR}/></Sequence>);cursor+=STAR;}
  sections.push(<Sequence key="outro" from={cursor} durationInFrames={OUTRO}><Outro p={p} duration={OUTRO}/></Sequence>);
  return <AbsoluteFill>{sections}</AbsoluteFill>;
};
