import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily: cairo} = loadFont();
export const FPS = 30;
const OVERLAP = 24;

const storySchema = z.object({
  id: z.string().optional(), headline: z.string().optional(), metric: z.string().optional(),
  homeValue: z.any().optional(), awayValue: z.any().optional(), visual: z.string().optional(),
}).passthrough();
const goalSchema = z.object({
  minute: z.any().optional(), displayMinute: z.string().optional(), scorer: z.string().optional(),
  team: z.string().optional(), teamSide: z.string().optional(), assist: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
}).passthrough();

export const tacticMatchSchema = z.object({
  githubActionsTest: z.boolean().optional(), templateKey: z.string().optional(), language: z.string().optional(),
  direction: z.string().optional(), fontFamily: z.string().optional(), gameId: z.any(), competition: z.string().optional(),
  round: z.any().optional(), homeTeam: z.string(), awayTeam: z.string(), score: z.string().optional(),
  introHeadline: z.string().optional(), mediaMode: z.string().optional(), highlightsVideoUrl: z.string().nullable().optional(),
  highlightsStartSeconds: z.number().optional(), goals: z.array(goalSchema).optional(), statsCards: z.array(storySchema).optional(),
  starPlayer: z.any().optional(), match: z.any().optional(), assets: z.any().optional(), motionTiming: z.any().optional(),
  design: z.any().optional(), musicUrl: z.string().nullable().optional(), previewCardsOnly: z.boolean().optional(),
}).passthrough();
export const matchSchema = tacticMatchSchema;
export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  gameId: "preview", competition: "TACTIC SPORT", round: "", homeTeam: "الفريق الأول", awayTeam: "الفريق الثاني",
  score: "3 - 2", goals: [], statsCards: [
    {id:"shots",homeValue:18,awayValue:11},{id:"shots_on_target",homeValue:8,awayValue:4},
    {id:"big_chances",homeValue:5,awayValue:2},{id:"xg",homeValue:2.31,awayValue:1.24},
    {id:"possession",homeValue:57,awayValue:43},
  ],
};

const sec=(v:any,d:number)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:d};
export const timings=(p:MatchProps)=>({
  intro:Math.round(sec(p.motionTiming?.introSeconds,3.4)*FPS), matchup:Math.round(sec(p.motionTiming?.matchupSeconds,4.4)*FPS),
  score:Math.round(sec(p.motionTiming?.finalScoreSeconds,4.4)*FPS), goal:Math.round(sec(p.motionTiming?.goalSeconds,6.4)*FPS),
  highlights:Math.round(sec(p.motionTiming?.highlightsSeconds,8)*FPS), stat:Math.round(sec(p.motionTiming?.statsCardSeconds,5.0)*FPS),
  star:Math.round(sec(p.motionTiming?.starPlayerSeconds,6.0)*FPS), outro:Math.round(sec(p.motionTiming?.outroSeconds,4.2)*FPS),
});
const stat=(p:MatchProps,id:string)=>p.statsCards?.find((s:any)=>String(s.id)===id);
const hasGoalClips=(p:MatchProps)=>Array.isArray(p.goals)&&p.goals.some((g:any)=>Boolean(g.videoUrl));

export const calculateDuration=(p:MatchProps)=>{
  const t=timings(p); const ds:number[]=[];
  const shots=stat(p,"shots"), on=stat(p,"shots_on_target"), big=stat(p,"big_chances"), xg=stat(p,"xg"), pos=stat(p,"possession");
  if(p.previewCardsOnly){
    if(shots)ds.push(t.stat); if(on)ds.push(t.stat); if(big)ds.push(t.stat); if(xg)ds.push(t.stat); if(pos)ds.push(t.stat); if(p.starPlayer)ds.push(t.star);
  } else {
    ds.push(t.intro,t.matchup,t.score); (p.goals||[]).forEach(()=>ds.push(t.goal));
    if(p.highlightsVideoUrl&&!hasGoalClips(p))ds.push(t.highlights);
    if(shots)ds.push(t.stat); if(on)ds.push(t.stat); if(big)ds.push(t.stat); if(xg)ds.push(t.stat); if(pos)ds.push(t.stat);
    if(p.starPlayer)ds.push(t.star); ds.push(t.outro);
  }
  return Math.max(1,ds.reduce((a,b)=>a+b,0)-Math.max(0,ds.length-1)*OVERLAP);
};

const C={bg:"#010609",deep:"#06121a",white:"#f7fbff",muted:"#91a5b3",cyan:"#35d7ff",gold:"#e9bf5b"};
const clamp={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const num=(v:any,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const txt=(v:any,d="")=>String(v??d);
const hc=(p:MatchProps)=>p.design?.homeColor||C.cyan;
const ac=(p:MatchProps)=>p.design?.awayColor||C.gold;
const hb=(p:MatchProps)=>p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl||null;
const ab=(p:MatchProps)=>p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl||null;
const logo=(p:MatchProps)=>p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png");
const stadium=(p:MatchProps)=>p.assets?.stadiumImageUrl||p.match?.stadium?.imageUrl||null;
const compLogo=(p:MatchProps)=>p.assets?.competitionLogoUrl||null;
const music=(p:MatchProps)=>p.musicUrl||p.assets?.musicUrl||p.assets?.backgroundMusicUrl||null;
const interp=(f:number,a:number,b:number,x:number,y:number)=>interpolate(f,[a,b],[x,y],{...clamp,easing:Easing.out(Easing.cubic)});
const enterP=(f:number)=>interp(f,0,OVERLAP,0,1);
const exitP=(f:number,d:number)=>interp(f,Math.max(0,d-OVERLAP),d-1,0,1);
const alpha=(f:number,d:number)=>Math.min(enterP(f),1-exitP(f,d)+0.001);
const count=(v:any,f:number,dec=0)=>{const x=interp(f,6,42,0,num(v));return dec?x.toFixed(dec):Math.round(x).toString()};

const World:React.FC<{p:MatchProps;scene:number;energy?:number}> = ({p,scene,energy=1})=>{
  const f=useCurrentFrame(); const bg=stadium(p); const drift=Math.sin((f+scene*23)/33)*10; const zoom=1.06+scene*.008+f*.00032;
  const sweep=interpolate((f+scene*31)%165,[0,164],[-480,1540]);
  return <AbsoluteFill style={{background:C.bg,overflow:"hidden"}}>
    {bg?<Img src={bg} style={{width:"100%",height:"100%",objectFit:"cover",transform:`scale(${zoom}) translate(${drift}px,${-8+Math.cos(f/41)*7}px)`,filter:"saturate(.72) contrast(1.18) brightness(.36)"}}/>:<AbsoluteFill style={{background:"radial-gradient(circle at 50% 22%,#17364a 0%,#07131b 38%,#010609 78%)"}}/>}
    <AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,7,12,.20) 42%,rgba(0,3,7,.88))"}}/>
    <div style={{position:"absolute",left:sweep,top:-350,width:125,height:2700,transform:"rotate(17deg)",background:`linear-gradient(90deg,transparent,rgba(73,218,255,${.20*energy}),rgba(255,221,144,${.14*energy}),transparent)`,filter:"blur(18px)",mixBlendMode:"screen"}}/>
    {Array.from({length:18}).map((_,i)=><div key={i} style={{position:"absolute",left:(i*137+scene*61)%1080,top:(i*251+f*(.32+(i%3)*.09))%1920,width:2+(i%3),height:2+(i%3),borderRadius:"50%",background:"rgba(255,255,255,.44)",boxShadow:"0 0 12px rgba(82,220,255,.42)",opacity:.18+(i%4)*.08}}/>)}
  </AbsoluteFill>;
};

const Brand:React.FC<{p:MatchProps}> = ({p})=><Img src={logo(p)} style={{position:"absolute",top:52,left:52,height:72,maxWidth:250,objectFit:"contain",zIndex:80,filter:"drop-shadow(0 14px 30px rgba(0,0,0,.55))"}}/>;
const TeamLogo:React.FC<{src:string|null;color:string;size?:number}> = ({src,color,size=210})=><div style={{width:size,height:size,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,${color}20,rgba(0,8,14,.75) 66%)`,border:`1px solid ${color}66`,boxShadow:`0 0 75px ${color}2c,inset 0 0 35px rgba(255,255,255,.025)`}}>{src?<Img src={src} style={{width:"76%",height:"76%",objectFit:"contain"}}/>:null}</div>;
const Scene:React.FC<{p:MatchProps;duration:number;scene:number;children:React.ReactNode;energy?:number}> = ({p,duration,scene,children,energy})=>{const f=useCurrentFrame();const e=enterP(f),x=exitP(f,duration);const camera=1.035+e*.018+x*.055;return <AbsoluteFill style={{opacity:alpha(f,duration),fontFamily:cairo,color:C.white,overflow:"hidden"}}><World p={p} scene={scene} energy={energy}/><AbsoluteFill style={{transform:`scale(${camera}) translateY(${(e-x)*-4}px)`}}>{children}</AbsoluteFill></AbsoluteFill>};

const EnergyCore:React.FC<{color?:string;scale?:number;opacity?:number}> = ({color=C.cyan,scale=1,opacity=.7})=><div style={{position:"absolute",left:"50%",top:"50%",width:22,height:22,borderRadius:"50%",background:color,transform:`translate(-50%,-50%) scale(${scale})`,opacity,boxShadow:`0 0 20px ${color},0 0 80px ${color}99,0 0 180px ${color}55`}}/>;

const IntroScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:f,fps,config:{damping:11,stiffness:135,mass:.72}});const push=interp(f,0,duration-1,1,1.16);const flash=interpolate(f,[4,8,12],[0,.6,0],clamp);return <Scene p={p} duration={duration} scene={0} energy={1.2}><AbsoluteFill style={{alignItems:"center",justifyContent:"center",transform:`scale(${push})`}}><div style={{position:"absolute",width:780,height:780,borderRadius:"50%",border:"1px solid rgba(86,219,255,.18)",transform:`scale(${.45+s*.75})`,opacity:1-s*.72,boxShadow:"0 0 95px rgba(53,215,255,.13)"}}/><Img src={logo(p)} style={{width:600,maxHeight:330,objectFit:"contain",transform:`scale(${.66+s*.39})`,filter:"drop-shadow(0 0 50px rgba(53,215,255,.20)) drop-shadow(0 32px 56px rgba(0,0,0,.66))"}}/><div style={{marginTop:44,fontSize:23,fontWeight:900,letterSpacing:4,color:"rgba(255,255,255,.72)",opacity:interp(f,10,32,0,1)}}>THE HOME OF FOOTBALL DATA</div></AbsoluteFill><AbsoluteFill style={{background:`rgba(255,255,255,${flash})`,mixBlendMode:"screen"}}/></Scene>};

const MatchupScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();const e=enterP(f);const x=exitP(f,duration);const spread=190*(1-e)-105*x;return <Scene p={p} duration={duration} scene={1}><Brand p={p}/><div style={{position:"absolute",top:220,left:0,right:0,textAlign:"center"}}>{compLogo(p)?<Img src={compLogo(p)!} style={{height:92,maxWidth:180,objectFit:"contain"}}/>:null}<div style={{fontSize:25,color:C.muted,fontWeight:800,marginTop:10}}>{p.competition}{p.round?` • الجولة ${p.round}`:""}</div></div><AbsoluteFill style={{alignItems:"center",justifyContent:"center"}}><div style={{width:920,display:"grid",gridTemplateColumns:"1fr 150px 1fr",alignItems:"center",direction:"ltr"}}><div style={{textAlign:"center",transform:`translateX(${-spread}px) translateZ(${(1-e)*-700}px) scale(${.58+e*.42})`}}><div style={{display:"flex",justifyContent:"center"}}><TeamLogo src={hb(p)} color={hc(p)}/></div><div style={{fontSize:42,fontWeight:950,marginTop:22}}>{p.homeTeam}</div></div><div style={{textAlign:"center",fontSize:34,fontWeight:900,color:"rgba(255,255,255,.50)",transform:`scale(${.5+e*.5-x*.45})`}}>VS</div><div style={{textAlign:"center",transform:`translateX(${spread}px) translateZ(${(1-e)*-700}px) scale(${.58+e*.42})`}}><div style={{display:"flex",justifyContent:"center"}}><TeamLogo src={ab(p)} color={ac(p)}/></div><div style={{fontSize:42,fontWeight:950,marginTop:22}}>{p.awayTeam}</div></div></div><EnergyCore scale={1+x*14} opacity={x*.8}/></AbsoluteFill></Scene>};

const ScoreScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const parts=txt(p.score,"0-0").split("-");const h=num(parts[0]),a=num(parts[1]);const s=spring({frame:Math.max(0,f-4),fps,config:{damping:9,stiffness:210,mass:.46}});const x=exitP(f,duration);const shake=f>7&&f<12?(f%2?7:-7):0;const ring=interp(f,8,42,.15,1.55);const strobe=interpolate(f,[7,9,12],[0,.72,0],clamp);return <Scene p={p} duration={duration} scene={2} energy={1.25}><Brand p={p}/><AbsoluteFill style={{alignItems:"center",justifyContent:"center",transform:`translateX(${shake}px)`}}><div style={{fontSize:27,fontWeight:900,color:C.muted,marginBottom:24}}>النتيجة النهائية</div><div style={{display:"grid",gridTemplateColumns:"220px 170px 220px",alignItems:"center",direction:"ltr",transform:`scale(${.58+s*.43+x*.22})`}}><div style={{textAlign:"center"}}><div style={{display:"flex",justifyContent:"center"}}><TeamLogo src={hb(p)} color={hc(p)} size={132}/></div><div style={{fontSize:136,lineHeight:1,fontWeight:950,color:hc(p),marginTop:18}}>{count(h,f)}</div><div style={{fontSize:27,fontWeight:900,marginTop:14}}>{p.homeTeam}</div></div><div style={{textAlign:"center",fontSize:54,color:"rgba(255,255,255,.30)"}}>—</div><div style={{textAlign:"center"}}><div style={{display:"flex",justifyContent:"center"}}><TeamLogo src={ab(p)} color={ac(p)} size={132}/></div><div style={{fontSize:136,lineHeight:1,fontWeight:950,color:ac(p),marginTop:18}}>{count(a,f)}</div><div style={{fontSize:27,fontWeight:900,marginTop:14}}>{p.awayTeam}</div></div></div><div style={{position:"absolute",width:680,height:680,borderRadius:"50%",border:"2px solid rgba(255,255,255,.12)",transform:`scale(${ring})`,opacity:1-interp(f,8,42,0,1),boxShadow:"0 0 100px rgba(53,215,255,.12)"}}/><EnergyCore scale={1+x*24} opacity={x}/></AbsoluteFill><AbsoluteFill style={{background:`rgba(255,255,255,${strobe})`,mixBlendMode:"screen"}}/></Scene>};

const GoalScene:React.FC<{p:MatchProps;goal:any;index:number;duration:number}> = ({p,goal,index,duration})=>{const f=useCurrentFrame();const e=enterP(f);const side=txt(goal.teamSide).toLowerCase()==="away"?"away":"home";const color=side==="home"?hc(p):ac(p);const portal=interp(f,0,OVERLAP,46,0);return <AbsoluteFill style={{opacity:alpha(f,duration),background:"#000",fontFamily:cairo,overflow:"hidden"}}>{goal.videoUrl?<OffthreadVideo src={goal.videoUrl} style={{width:"100%",height:"100%",objectFit:"cover",transform:`scale(${1.16-e*.14})`,clipPath:`inset(${portal}% ${portal*.55}% ${portal}% ${portal*.55}% round ${Math.max(0,36-portal*.6)}px)`}}/>:<World p={p} scene={3+index}/>}<AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.28),transparent 42%,rgba(0,0,0,.78))"}}/><Brand p={p}/><div style={{position:"absolute",top:182,right:56,padding:"10px 20px",borderRadius:999,background:`linear-gradient(90deg,${color}d9,rgba(3,9,14,.80))`,fontSize:25,fontWeight:950}}>الهدف {index+1}</div><div style={{position:"absolute",left:58,right:58,bottom:110,transform:`translateY(${(1-e)*80}px)`}}><div style={{fontSize:52,fontWeight:950}}>{goal.scorer||"هدف"}</div><div style={{fontSize:25,color:"rgba(255,255,255,.76)",marginTop:8}}>{goal.team||(side==="home"?p.homeTeam:p.awayTeam)} <span style={{color}}>{goal.displayMinute||goal.minute||""}</span>{goal.assist?` • صناعة ${goal.assist}`:""}</div></div></AbsoluteFill>};

const HighlightsScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();return <AbsoluteFill style={{opacity:alpha(f,duration),background:"#000",fontFamily:cairo}}>{p.highlightsVideoUrl?<OffthreadVideo src={p.highlightsVideoUrl} startFrom={Math.round((p.highlightsStartSeconds||0)*FPS)} style={{width:"100%",height:"100%",objectFit:"cover",transform:`scale(${1.06+f*.0004})`}}/>:null}<AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.15),transparent 55%,rgba(0,0,0,.65))"}}/><Brand p={p}/><div style={{position:"absolute",top:170,right:58,fontSize:30,fontWeight:950}}>ملخص المباراة</div></AbsoluteFill>};

const StatTitle:React.FC<{title:string;kicker:string}> = ({title,kicker})=><div style={{position:"absolute",top:178,right:58,direction:"rtl"}}><div style={{fontSize:18,fontWeight:900,letterSpacing:2.3,color:C.muted}}>{kicker}</div><div style={{fontSize:56,fontWeight:950,marginTop:2}}>{title}</div></div>;
const Values:React.FC<{p:MatchProps;f:number;h:any;a:any;dec?:number;suffix?:string}> = ({p,f,h,a,dec=0,suffix=""})=><div style={{position:"absolute",left:70,right:70,bottom:142,display:"flex",justifyContent:"space-between",direction:"ltr"}}><div><div style={{fontSize:25,color:C.muted,fontWeight:850}}>{p.homeTeam}</div><div style={{fontSize:86,lineHeight:1,fontWeight:950,color:hc(p)}}>{count(h,f,dec)}{suffix}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:25,color:C.muted,fontWeight:850}}>{p.awayTeam}</div><div style={{fontSize:86,lineHeight:1,fontWeight:950,color:ac(p)}}>{count(a,f,dec)}{suffix}</div></div></div>;

const GoalFrame:React.FC<{p:MatchProps;f:number;tilt:number;trails?:boolean;dotsH?:number;dotsA?:number}> = ({p,f,tilt,trails=false,dotsH=0,dotsA=0})=>{const total=Math.min(18,dotsH+dotsA);return <div style={{position:"absolute",left:180,top:570,width:720,height:470,border:"7px solid rgba(255,255,255,.74)",borderBottomWidth:12,backgroundImage:"linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)",backgroundSize:"72px 72px",transform:`perspective(950px) rotateX(${tilt}deg)`,transformOrigin:"center bottom",boxShadow:"0 0 50px rgba(255,255,255,.08),inset 0 0 70px rgba(53,215,255,.025)"}}>{trails?Array.from({length:12}).map((_,i)=>{const home=i%2===0;const pgr=interpolate(f-i*2,[0,38],[0,1],clamp);const sx=home?60+(i*53)%270:650-(i*41)%270;const ex=290+(i*71)%150;const ey=70+(i*83)%280;const dx=(ex-sx)*pgr,dy=(ey-410)*pgr;const len=Math.sqrt(dx*dx+dy*dy);const ang=Math.atan2(dy,dx)*180/Math.PI;const col=home?hc(p):ac(p);return <div key={i} style={{position:"absolute",left:sx,top:410,width:len,height:3,transformOrigin:"left center",transform:`rotate(${ang}deg)`,background:`linear-gradient(90deg,transparent,${col})`,boxShadow:`0 0 12px ${col}`,opacity:.74}}/>}):null}{Array.from({length:total}).map((_,i)=>{const home=i<dotsH;const pr=interpolate(f-i*3,[0,24],[0,1],clamp);const col=home?hc(p):ac(p);return <div key={i} style={{position:"absolute",left:45+(i*137)%610,top:45+(i*101)%320,width:22,height:22,borderRadius:"50%",background:col,transform:`scale(${pr})`,opacity:pr,boxShadow:`0 0 22px ${col}`}}/>})}</div>};

const ShotsScene:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration})=>{const f=useCurrentFrame();const x=exitP(f,duration);return <Scene p={p} duration={duration} scene={20}><Brand p={p}/><StatTitle title="التسديدات" kicker="ATTACK VOLUME"/><GoalFrame p={p} f={f} tilt={8+x*-8} trails/><Values p={p} f={f} h={story.homeValue} a={story.awayValue}/></Scene>};
const OnTargetScene:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration})=>{const f=useCurrentFrame();const e=enterP(f),x=exitP(f,duration);const h=Math.max(0,Math.round(num(story.homeValue))),a=Math.max(0,Math.round(num(story.awayValue)));return <Scene p={p} duration={duration} scene={21}><Brand p={p}/><StatTitle title="على المرمى" kicker="TARGET ACCURACY"/><GoalFrame p={p} f={f} tilt={x*56} dotsH={h} dotsA={a}/><div style={{position:"absolute",left:180,top:570,width:720,height:470,border:`2px solid rgba(53,215,255,${.18*e})`,boxShadow:`0 0 ${60+80*e}px rgba(53,215,255,.08)`,transform:`perspective(950px) rotateX(${x*56}deg)`,transformOrigin:"center bottom"}}/><Values p={p} f={f} h={h} a={a}/></Scene>};

const BigScene:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration})=>{const f=useCurrentFrame();const e=enterP(f),x=exitP(f,duration);const h=Math.max(0,Math.round(num(story.homeValue))),a=Math.max(0,Math.round(num(story.awayValue))),total=Math.min(12,h+a);const collapse=1-x*.72;return <Scene p={p} duration={duration} scene={22}><Brand p={p}/><StatTitle title="الفرص الكبيرة" kicker="HIGH VALUE MOMENTS"/><div style={{position:"absolute",left:190,top:555,width:700,height:500,border:"2px solid rgba(255,255,255,.25)",transform:`perspective(900px) rotateX(${56-e*2}deg) scaleY(${collapse})`,transformOrigin:"center bottom"}}><div style={{position:"absolute",left:180,right:180,top:0,height:185,border:"2px solid rgba(255,255,255,.18)"}}/>{Array.from({length:total}).map((_,i)=>{const home=i<h;const col=home?hc(p):ac(p);const pr=interpolate(f-i*3,[0,20],[0,1],clamp);return <div key={i} style={{position:"absolute",left:65+(i*113)%555,top:58+(i*81)%350,width:36,height:36,borderRadius:"50%",border:`3px solid ${col}`,transform:`scale(${pr*(.82+Math.sin((f+i)/5)*.15)})`,boxShadow:`0 0 26px ${col}`}}/>})}</div><Values p={p} f={f} h={h} a={a}/></Scene>};

const XgScene:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration})=>{const f=useCurrentFrame();const x=exitP(f,duration);const h=num(story.homeValue),a=num(story.awayValue),m=Math.max(.1,h,a);const hp=interp(f,5,48,0,h/m),ap=interp(f,5,48,0,a/m);const gap=74-x*50;const row=(name:string,v:number,pr:number,col:string,top:number)=><div style={{position:"absolute",left:100,right:100,top}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",direction:"ltr"}}><b style={{fontSize:28}}>{name}</b><b style={{fontSize:58,color:col}}>{count(v,f,2)}</b></div><div style={{height:26,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden",marginTop:12}}><div style={{height:"100%",width:`${pr*100}%`,borderRadius:999,background:`linear-gradient(90deg,${col}55,${col})`,boxShadow:`0 0 24px ${col}`}}/></div></div>;return <Scene p={p} duration={duration} scene={23}><Brand p={p}/><StatTitle title="الأهداف المتوقعة xG" kicker="EXPECTED GOALS"/><div style={{transform:`translateY(${x*gap}px)`}}>{row(p.homeTeam,h,hp,hc(p),610)}{row(p.awayTeam,a,ap,ac(p),790)}</div></Scene>};

const PossScene:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration})=>{const f=useCurrentFrame();const x=exitP(f,duration);const h=Math.max(0,Math.min(100,num(story.homeValue,50))),a=Math.max(0,Math.min(100,num(story.awayValue,100-h))),total=Math.max(1,h+a),target=h/total*100,split=interp(f,5,48,50,target);const beam=x;return <Scene p={p} duration={duration} scene={24} energy={1.2}><Brand p={p}/><StatTitle title="الاستحواذ" kicker="CONTROL OF THE GAME"/><div style={{position:"absolute",left:78,right:78,top:690,height:94,borderRadius:50,overflow:"hidden",display:"flex",border:"1px solid rgba(255,255,255,.15)",boxShadow:"0 30px 75px rgba(0,0,0,.38)"}}><div style={{width:`${split}%`,background:`linear-gradient(90deg,${hc(p)}55,${hc(p)})`}}/><div style={{width:`${100-split}%`,background:`linear-gradient(90deg,${ac(p)},${ac(p)}55)`}}/></div><div style={{position:"absolute",left:"50%",top:620,width:4,height:420,transform:`translateX(-50%) scaleY(${beam})`,transformOrigin:"center",background:"white",boxShadow:"0 0 25px white,0 0 80px rgba(53,215,255,.75)",opacity:beam}}/><Values p={p} f={f} h={h} a={a} suffix="%"/></Scene>};

const normalizeStarStats=(star:any)=>{if(Array.isArray(star?.stats))return star.stats.slice(0,4).map((s:any)=>({label:s.label||s.name||"إحصائية",value:s.value??s.stat??"—"}));if(star?.stats&&typeof star.stats==="object")return Object.entries(star.stats).slice(0,4).map(([k,v])=>({label:k,value:v}));return [{label:"أهداف",value:star?.goals},{label:"تمريرات حاسمة",value:star?.assists},{label:"تسديدات",value:star?.shots},{label:"تمريرات مفتاحية",value:star?.keyPasses}].filter(x=>x.value!=null)};
const StarScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();const star=p.starPlayer||{};const photo=star.imageUrl||star.photoUrl||star.playerImageUrl||p.assets?.starPlayerPhotoUrl||p.assets?.starPlayerImageUrl||null;const name=star.name||star.playerName||"نجم المباراة";const rating=star.rating??star.score??null;const stats=normalizeStarStats(star);const e=enterP(f),x=exitP(f,duration);const photoScale=1.02+interp(f,0,duration-1,0,.065);const light=interp(f,0,35,1,0);return <Scene p={p} duration={duration} scene={25} energy={1.35}><Brand p={p}/><div style={{position:"absolute",left:"50%",top:260,width:6,height:1120,transform:`translateX(-50%) scaleY(${1-e})`,background:"white",boxShadow:"0 0 35px white,0 0 120px rgba(53,215,255,.7)",opacity:1-e}}/><div style={{position:"absolute",width:980,height:980,left:50,top:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(233,191,91,.30),rgba(53,215,255,.12) 40%,transparent 70%)",transform:`scale(${.65+e*.42-x*.22})`,filter:"blur(8px)"}}/>{photo?<Img src={photo} style={{position:"absolute",height:1370,maxWidth:1010,left:"50%",bottom:-70,objectFit:"contain",transform:`translateX(-50%) scale(${photoScale})`,filter:"brightness(1.08) contrast(1.08) drop-shadow(0 38px 70px rgba(0,0,0,.70))"}}/>:null}<AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.10),transparent 48%,rgba(0,0,0,.86))"}}/><div style={{position:"absolute",top:178,right:58,textAlign:"right"}}><div style={{fontSize:22,letterSpacing:2.2,color:C.gold,fontWeight:950}}>MAN OF THE MATCH</div><div style={{fontSize:62,fontWeight:950,marginTop:2}}>نجم المباراة</div></div><div style={{position:"absolute",left:62,right:62,bottom:92,direction:"rtl"}}><div style={{fontSize:60,fontWeight:950,textShadow:"0 10px 36px rgba(0,0,0,.70)"}}>{name}</div>{rating!=null?<div style={{display:"inline-block",marginTop:10,padding:"7px 18px",borderRadius:999,background:C.gold,color:"#111",fontSize:25,fontWeight:950}}>تقييم {rating}</div>:null}<div style={{display:"flex",gap:14,marginTop:24,flexWrap:"wrap"}}>{stats.map((s:any,i:number)=><div key={i} style={{minWidth:210,padding:"14px 18px",borderTop:`2px solid ${i%2?ac(p):hc(p)}`,background:"linear-gradient(180deg,rgba(2,12,19,.70),rgba(1,7,11,.45))",transform:`translateY(${(1-interp(f,15+i*5,34+i*5,0,1))*32}px)`,opacity:interp(f,15+i*5,34+i*5,0,1)}}><div style={{fontSize:18,color:C.muted,fontWeight:750}}>{s.label}</div><div style={{fontSize:38,fontWeight:950}}>{String(s.value)}</div></div>)}</div></div><div style={{position:"absolute",left:"50%",top:"50%",width:20,height:20,borderRadius:"50%",background:"white",transform:`translate(-50%,-50%) scale(${1+x*24})`,opacity:x,boxShadow:"0 0 30px white,0 0 140px rgba(53,215,255,.8)"}}/><AbsoluteFill style={{background:`rgba(255,255,255,${light*.08})`,mixBlendMode:"screen"}}/></Scene>};

const OutroScene:React.FC<{p:MatchProps;duration:number}> = ({p,duration})=>{const f=useCurrentFrame();const {fps}=useVideoConfig();const s=spring({frame:f,fps,config:{damping:13,stiffness:120}});const ring=interp(f,0,44,1.8,.92);return <Scene p={p} duration={duration} scene={26} energy={.75}><AbsoluteFill style={{alignItems:"center",justifyContent:"center"}}><div style={{position:"absolute",width:760,height:760,borderRadius:"50%",border:"1px solid rgba(53,215,255,.18)",transform:`scale(${ring})`,boxShadow:"0 0 100px rgba(53,215,255,.10)"}}/><Img src={logo(p)} style={{width:570,maxHeight:310,objectFit:"contain",transform:`scale(${.62+s*.38})`,filter:"drop-shadow(0 28px 60px rgba(0,0,0,.60))"}}/><div style={{fontSize:31,fontWeight:950,marginTop:34}}>خلف كل مباراة… قصة تحكيها الأرقام</div><div style={{fontSize:19,color:C.muted,letterSpacing:2.3,marginTop:16}}>TACTIC SPORT</div></AbsoluteFill></Scene>};

const MusicBed:React.FC<{p:MatchProps;goalRanges:Array<[number,number]>}> = ({p,goalRanges})=>{const src=music(p);if(!src)return null;return <Audio src={src} loop volume={(f)=>goalRanges.some(([a,b])=>f>=a&&f<=b)?.11:.38}/>};

export const TacticMatch:React.FC<MatchProps> = (p)=>{
  const t=timings(p), shots=stat(p,"shots"), on=stat(p,"shots_on_target"), big=stat(p,"big_chances"), xg=stat(p,"xg"), pos=stat(p,"possession");
  const scenes:React.ReactNode[]=[]; const goalRanges:Array<[number,number]>=[]; let end=0; let countScenes=0;
  const push=(key:string,d:number,node:React.ReactNode)=>{const start=countScenes===0?0:end-OVERLAP;scenes.push(<Sequence key={key} from={start} durationInFrames={d} premountFor={FPS}>{node}</Sequence>);end=start+d;countScenes++;return start};
  if(p.previewCardsOnly){if(shots)push("p-shots",t.stat,<ShotsScene p={p} story={shots} duration={t.stat}/>);if(on)push("p-on",t.stat,<OnTargetScene p={p} story={on} duration={t.stat}/>);if(big)push("p-big",t.stat,<BigScene p={p} story={big} duration={t.stat}/>);if(xg)push("p-xg",t.stat,<XgScene p={p} story={xg} duration={t.stat}/>);if(pos)push("p-pos",t.stat,<PossScene p={p} story={pos} duration={t.stat}/>);if(p.starPlayer)push("p-star",t.star,<StarScene p={p} duration={t.star}/>);return <AbsoluteFill style={{background:C.bg}}>{scenes}</AbsoluteFill>}
  push("intro",t.intro,<IntroScene p={p} duration={t.intro}/>);push("matchup",t.matchup,<MatchupScene p={p} duration={t.matchup}/>);push("score",t.score,<ScoreScene p={p} duration={t.score}/>);
  (p.goals||[]).forEach((g:any,i:number)=>{const st=push(`goal-${i}`,t.goal,<GoalScene p={p} goal={g} index={i} duration={t.goal}/>);goalRanges.push([Math.max(0,st-8),st+t.goal-8])});
  if(p.highlightsVideoUrl&&!hasGoalClips(p))push("highlights",t.highlights,<HighlightsScene p={p} duration={t.highlights}/>);
  if(shots)push("shots",t.stat,<ShotsScene p={p} story={shots} duration={t.stat}/>);if(on)push("on",t.stat,<OnTargetScene p={p} story={on} duration={t.stat}/>);if(big)push("big",t.stat,<BigScene p={p} story={big} duration={t.stat}/>);if(xg)push("xg",t.stat,<XgScene p={p} story={xg} duration={t.stat}/>);if(pos)push("pos",t.stat,<PossScene p={p} story={pos} duration={t.stat}/>);if(p.starPlayer)push("star",t.star,<StarScene p={p} duration={t.star}/>);push("outro",t.outro,<OutroScene p={p} duration={t.outro}/>);
  return <AbsoluteFill style={{background:C.bg}}><MusicBed p={p} goalRanges={goalRanges}/>{scenes}</AbsoluteFill>;
};
