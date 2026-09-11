import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily: cairo} = loadFont();
const FPS = 30;
const STEP = 92;
const CARD_ACTIVE_TOP = 860;
const STACK_TOP = 545;
const STACK_GAP = 162;
const CARD_W = 930;
const ACTIVE_H = 292;
const COMPACT_H = 146;
const STACK_HOLD = 38;
const STATS_END = STEP * 5 + STACK_HOLD;
const MOTM_FRAMES = 185;

const statSchema = z.object({
  id: z.string(),
  headline: z.string().optional(),
  homeValue: z.union([z.number(), z.string()]),
  awayValue: z.union([z.number(), z.string()]),
}).passthrough();

export const tacticStatsHilalStackV2Schema = z.object({
  compositionId: z.string().optional(),
  gameId: z.number(),
  competition: z.string().optional(),
  round: z.union([z.number(), z.string()]).optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  statsCards: z.array(statSchema),
  design: z.object({homeColor:z.string().optional(), awayColor:z.string().optional()}).optional(),
  assets: z.object({
    homeBadgeUrl:z.string().nullable().optional(),
    awayBadgeUrl:z.string().nullable().optional(),
    competitionLogoUrl:z.string().nullable().optional(),
    tacticLogoUrl:z.string().nullable().optional(),
    starPlayerPhotoUrl:z.string().nullable().optional(),\n    stadiumImageUrl:z.string().nullable().optional(),
  }).optional(),
  starPlayer: z.any().optional(),
}).passthrough();

export type StackProps = z.infer<typeof tacticStatsHilalStackV2Schema>;

export const defaultHilalStackV2Props: StackProps = {
  compositionId:"TacticStatsHilalStackV2",
  gameId:4781124,
  competition:"UAE Pro League",
  round:4,
  homeTeam:"شباب الأهلي",
  awayTeam:"الجزيرة",
  design:{homeColor:"#E3242B", awayColor:"#F4F6FA"},
  assets:{homeBadgeUrl:null,awayBadgeUrl:null,competitionLogoUrl:null,tacticLogoUrl:null,starPlayerPhotoUrl:null},
  statsCards:[
    {id:"shots",headline:"التسديدات",homeValue:13,awayValue:17},
    {id:"shots_on_target",headline:"على المرمى",homeValue:4,awayValue:5},
    {id:"big_chances",headline:"الفرص الكبيرة",homeValue:0,awayValue:5},
    {id:"xg",headline:"الأهداف المتوقعة xG",homeValue:1.51,awayValue:1.48},
    {id:"possession",headline:"الاستحواذ",homeValue:62,awayValue:38},
  ],
  starPlayer:{name:"فليسيو ميلسون",team:"الجزيرة",rating:8.3,position:"LW",stats:{Assists:"1",KeyPasses:"6",TotalShots:"4",BigChancesCreated:"3"}},
};

export const calculateHilalStackV2Duration = () => STATS_END + MOTM_FRAMES;

const clamp={extrapolateLeft:"clamp" as const, extrapolateRight:"clamp" as const};
const out=Easing.out(Easing.cubic);
const inOut=Easing.inOut(Easing.cubic);
const num=(v:unknown,d=0)=>{const x=Number(v);return Number.isFinite(x)?x:d;};
const hexRgb=(hex:string)=>{const c=String(hex||"").replace("#","");const v=c.length===3?c.split("").map(x=>x+x).join(""):c;if(!/^[0-9a-fA-F]{6}$/.test(v))return{r:30,g:210,b:255};return{r:parseInt(v.slice(0,2),16),g:parseInt(v.slice(2,4),16),b:parseInt(v.slice(4,6),16)};};
const rgba=(hex:string,a:number)=>{const {r,g,b}=hexRgb(hex);return `rgba(${r},${g},${b},${a})`;};
const safeColor=(hex:string|undefined,fallback:string)=>{const h=/^#[0-9a-fA-F]{6}$/.test(hex||"")?hex!:fallback;const {r,g,b}=hexRgb(h);const l=(.2126*r+.7152*g+.0722*b)/255;if(l>.9)return"#E8EDF3";if(l<.12)return `#${[r,g,b].map(x=>Math.min(255,x+70).toString(16).padStart(2,"0")).join("")}`;return h;};
const hc=(p:StackProps)=>safeColor(p.design?.homeColor,"#22D4FF");
const ac=(p:StackProps)=>safeColor(p.design?.awayColor,"#F2C14E");
const logo=(p:StackProps)=>p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png");
const count=(v:number,lf:number,dec=0)=>{const x=interpolate(lf,[8,48],[0,v],{...clamp,easing:out});return dec?x.toFixed(dec):String(Math.round(x));};

const Stadium:React.FC<{p:StackProps;opacity?:number}>=({p,opacity=1})=>{
  const f=useCurrentFrame(); const left=hc(p), right=ac(p); const sweep=interpolate(f%180,[0,179],[-500,1480]);
  return <AbsoluteFill style={{opacity,background:"#020508",overflow:"hidden"}}>
    <AbsoluteFill style={{background:`radial-gradient(circle at 16% 28%,${rgba(left,.22)},transparent 31%),radial-gradient(circle at 84% 28%,${rgba(right,.17)},transparent 31%),radial-gradient(circle at 50% 12%,#173142 0%,#08131b 36%,#020508 72%)`}}/>
    <div style={{position:"absolute",left:-210,right:-210,top:105,height:430,borderRadius:"50%",border:"2px solid rgba(255,255,255,.08)",boxShadow:"inset 0 -100px 150px rgba(0,0,0,.74),0 0 120px rgba(47,185,225,.10)"}}/>
    {Array.from({length:20}).map((_,i)=><div key={i} style={{position:"absolute",left:40+i*52,top:300+(i%2)*14,width:8,height:8,borderRadius:"50%",background:"#fff",opacity:.28+.18*Math.sin((f+i*9)/9),boxShadow:`0 0 18px white,0 0 42px ${rgba(i%2?right:left,.45)}`}}/>)}
    <div style={{position:"absolute",left:42,right:42,bottom:-280,height:950,transform:"perspective(960px) rotateX(61deg)",transformOrigin:"center bottom",background:"linear-gradient(180deg,#073c2d,#031b16)",border:"1px solid rgba(255,255,255,.11)",boxShadow:"0 -55px 120px rgba(0,0,0,.5)"}}/>
    <div style={{position:"absolute",left:sweep,top:-340,width:120,height:2600,transform:"rotate(15deg)",background:"linear-gradient(90deg,transparent,rgba(74,213,255,.20),rgba(255,223,153,.09),transparent)",filter:"blur(20px)",mixBlendMode:"screen"}}/>
    <AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.08) 55%,rgba(0,0,0,.48))"}}/>
  </AbsoluteFill>;
};

const Badge:React.FC<{src?:string|null;color:string;name:string}>=({src,color,name})=><div style={{width:130,height:130,display:"flex",alignItems:"center",justifyContent:"center",filter:`drop-shadow(0 14px 26px ${rgba(color,.32)})`}}>{src?<Img src={src} style={{width:122,height:122,objectFit:"contain"}}/>:<div style={{width:110,height:110,borderRadius:28,border:`2px solid ${color}`,background:rgba(color,.13),display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,fontWeight:950,color}}>{name.trim().charAt(0)}</div>}</div>;

const Header:React.FC<{p:StackProps;opacity:number}>=({p,opacity})=><div style={{opacity}}>
  <Img src={logo(p)} style={{position:"absolute",left:34,top:30,width:190,height:58,objectFit:"contain"}}/>
  <div style={{position:"absolute",right:34,top:38,textAlign:"right"}}>
    <div style={{fontSize:18,color:"#D7B65F",fontWeight:900}}>{p.competition||""}</div>
    <div style={{fontSize:18,color:"rgba(255,255,255,.62)",fontWeight:700,marginTop:2}}>{p.round?`الجولة ${p.round}`:""}</div>
  </div>
  <div style={{position:"absolute",left:0,right:0,top:145,textAlign:"center"}}><div style={{fontSize:50,fontWeight:950,color:"white"}}>إحصائيات المباراة</div></div>
  <div style={{position:"absolute",left:150,right:150,top:245,display:"flex",justifyContent:"space-between",alignItems:"center",direction:"ltr"}}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:250}}><Badge src={p.assets?.homeBadgeUrl} color={hc(p)} name={p.homeTeam}/><div style={{fontSize:29,fontWeight:900,marginTop:8}}>{p.homeTeam}</div></div>
    <div style={{fontSize:32,fontWeight:900,color:"rgba(255,255,255,.42)"}}>VS</div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:250}}><Badge src={p.assets?.awayBadgeUrl} color={ac(p)} name={p.awayTeam}/><div style={{fontSize:29,fontWeight:900,marginTop:8}}>{p.awayTeam}</div></div>
  </div>
</div>;

const Football:React.FC<{x:number;y:number;color?:string;progress:number;size?:number}>=({x,y,progress,size=30})=>{
  const lift=(1-progress)*70; const rot=(1-progress)*-120;
  return <div style={{position:"absolute",left:x,top:y-lift,width:size,height:size,opacity:progress,transform:`scale(${.35+.65*progress}) rotate(${rot}deg)`,filter:"drop-shadow(0 5px 7px rgba(0,0,0,.50))"}}>
    <svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="g" cx="35%" cy="30%"><stop offset="0%" stopColor="#fff"/><stop offset="72%" stopColor="#e9edf1"/><stop offset="100%" stopColor="#b7bec5"/></radialGradient></defs><circle cx="50" cy="50" r="47" fill="url(#g)" stroke="#111" strokeWidth="2"/><polygon points="50,25 62,34 58,49 42,49 38,34" fill="#111"/><polygon points="18,42 31,36 39,49 31,61 16,57" fill="#111"/><polygon points="82,42 69,36 61,49 69,61 84,57" fill="#111"/><polygon points="34,78 43,62 57,62 66,78 50,88" fill="#111"/><path d="M38 34 L30 22 M62 34 L70 22 M31 61 L24 74 M69 61 L76 74 M43 62 L31 61 M57 62 L69 61" stroke="#555" strokeWidth="2" fill="none"/></svg>
  </div>;
};

const Goal3D:React.FC<{p:StackProps;home:number;away:number;lf:number;compact:number}>=({p,home,away,lf,compact})=>{
  const w=260-compact*40,h=150-compact*34; const all=Math.min(14,Math.max(0,Math.round(home+away)));
  return <div style={{position:"absolute",left:"50%",top:95-compact*10,width:w,height:h,transform:`translateX(-50%) perspective(620px) rotateX(${5+compact*2}deg)`,transformOrigin:"center bottom"}}>
    <div style={{position:"absolute",inset:0,border:"7px solid rgba(255,255,255,.93)",borderBottomWidth:10,boxShadow:"0 0 20px rgba(255,255,255,.16),0 12px 24px rgba(0,0,0,.34)",backgroundImage:"repeating-linear-gradient(0deg,rgba(255,255,255,.17) 0 1px,transparent 1px 17px),repeating-linear-gradient(90deg,rgba(255,255,255,.17) 0 1px,transparent 1px 22px)",backgroundColor:"rgba(1,8,12,.28)"}}/>
    <div style={{position:"absolute",left:-18,top:8,width:18,height:h-2,transform:"skewY(-28deg)",borderLeft:"3px solid rgba(255,255,255,.55)",borderBottom:"3px solid rgba(255,255,255,.35)",backgroundImage:"repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 17px)"}}/>
    <div style={{position:"absolute",right:-18,top:8,width:18,height:h-2,transform:"skewY(28deg)",borderRight:"3px solid rgba(255,255,255,.55)",borderBottom:"3px solid rgba(255,255,255,.35)",backgroundImage:"repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 17px)"}}/>
    {Array.from({length:all}).map((_,i)=>{const homeBall=i<Math.round(home);const pr=interpolate(lf-i*3,[10,25],[0,1],clamp);return <Football key={i} x={22+((i*47)%Math.max(70,w-60))} y={34+((i*31)%Math.max(50,h-65))} progress={pr} size={compact>.5?21:28}/>;})}
    <div style={{position:"absolute",left:15,bottom:-30,fontSize:13,color:hc(p),fontWeight:900}}>● {Math.round(home)}</div>
    <div style={{position:"absolute",right:15,bottom:-30,fontSize:13,color:ac(p),fontWeight:900}}>{Math.round(away)} ●</div>
  </div>;
};

const MiniPitch:React.FC<{p:StackProps;home:number;away:number;lf:number;compact:number}>=({p,home,away,lf,compact})=>{
  const total=Math.min(10,Math.round(home+away)); return <div style={{position:"absolute",left:"50%",top:100,width:280,height:135,transform:`translateX(-50%) scale(${1-compact*.22})`,border:"2px solid rgba(255,255,255,.40)",background:"linear-gradient(180deg,rgba(24,88,58,.72),rgba(9,48,34,.80))",boxShadow:"inset 0 0 35px rgba(255,255,255,.025)"}}><div style={{position:"absolute",left:"50%",top:0,bottom:0,width:2,background:"rgba(255,255,255,.24)"}}/><div style={{position:"absolute",left:"50%",top:"50%",width:58,height:58,border:"2px solid rgba(255,255,255,.24)",borderRadius:"50%",transform:"translate(-50%,-50%)"}}/>{Array.from({length:total}).map((_,i)=>{const isH=i<Math.round(home);const pr=interpolate(lf-i*5,[8,22],[0,1],clamp);return <div key={i} style={{position:"absolute",left:20+((i*53)%238),top:18+((i*37)%95),width:13,height:13,borderRadius:"50%",background:isH?hc(p):ac(p),opacity:pr,transform:`scale(${.25+.75*pr})`,boxShadow:`0 0 14px ${rgba(isH?hc(p):ac(p),.65)}`}}/>;})}</div>;
};

const Bars:React.FC<{p:StackProps;home:number;away:number;lf:number;compact:number;possession?:boolean}>=({p,home,away,lf,compact,possession=false})=>{
  const max=possession?100:Math.max(.1,home,away); const hp=interpolate(lf,[8,48],[0,home/max],{...clamp,easing:out}); const ap=interpolate(lf,[8,48],[0,away/max],{...clamp,easing:out});
  return <div style={{position:"absolute",left:"50%",top:118,width:320,height:95,transform:`translateX(-50%) scale(${1-compact*.2})`}}>{possession?<><div style={{height:42,borderRadius:24,overflow:"hidden",display:"flex",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.13)"}}><div style={{width:`${hp*100}%`,background:`linear-gradient(90deg,${rgba(hc(p),.4)},${hc(p)})`}}/><div style={{width:`${ap*100}%`,background:`linear-gradient(90deg,${ac(p)},${rgba(ac(p),.35)})`}}/></div></>:<><div style={{height:28,marginBottom:20,borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,.07)"}}><div style={{height:"100%",width:`${hp*100}%`,background:`linear-gradient(90deg,${rgba(hc(p),.35)},${hc(p)})`,boxShadow:`0 0 16px ${rgba(hc(p),.35)}`}}/></div><div style={{height:28,borderRadius:16,overflow:"hidden",background:"rgba(255,255,255,.07)"}}><div style={{height:"100%",width:`${ap*100}%`,background:`linear-gradient(90deg,${rgba(ac(p),.35)},${ac(p)})`,boxShadow:`0 0 16px ${rgba(ac(p),.28)}`}}/></div></>}</div>;
};

const ShotTicks:React.FC<{p:StackProps;home:number;away:number;lf:number;compact:number}>=({p,home,away,lf,compact})=>{
  const max=18; return <div style={{position:"absolute",left:"50%",top:126,width:340,height:75,transform:`translateX(-50%) scale(${1-compact*.18})`,display:"flex",justifyContent:"center",alignItems:"center",gap:10}}><div style={{display:"flex",flexDirection:"row-reverse",gap:4}}>{Array.from({length:max}).map((_,i)=>{const on=i<Math.min(max,Math.round(home));const pr=interpolate(lf-i,[8,30],[0,1],clamp);return <div key={i} style={{width:8,height:on?42:25,borderRadius:5,background:on?hc(p):"rgba(255,255,255,.14)",opacity:on?pr:.5,boxShadow:on?`0 0 10px ${rgba(hc(p),.48)}`:"none"}}/>;})}</div><div style={{width:2,height:55,background:"rgba(255,255,255,.25)"}}/><div style={{display:"flex",gap:4}}>{Array.from({length:max}).map((_,i)=>{const on=i<Math.min(max,Math.round(away));const pr=interpolate(lf-i,[8,30],[0,1],clamp);return <div key={i} style={{width:8,height:on?42:25,borderRadius:5,background:on?ac(p):"rgba(255,255,255,.14)",opacity:on?pr:.5,boxShadow:on?`0 0 10px ${rgba(ac(p),.45)}`:"none"}}/>;})}</div></div>;
};

const StackCard:React.FC<{p:StackProps;id:string;index:number}>=({p,id,index})=>{
  const f=useCurrentFrame(); const start=index*STEP; const lf=f-start; if(lf<0||f>=STATS_END)return null;
  const card:any=p.statsCards.find((x:any)=>String(x.id)===id)||p.statsCards[index]||{homeValue:0,awayValue:0,headline:id}; const home=num(card.homeValue),away=num(card.awayValue);
  const enter=interpolate(lf,[0,14],[0,1],{...clamp,easing:out}); const settle=interpolate(lf,[50,82],[0,1],{...clamp,easing:inOut});
  const top=interpolate(settle,[0,1],[CARD_ACTIVE_TOP,STACK_TOP+index*STACK_GAP],clamp); const h=interpolate(settle,[0,1],[ACTIVE_H,COMPACT_H],clamp); const compact=settle;
  const title=card.headline||({shots:"التسديدات",shots_on_target:"على المرمى",big_chances:"الفرص الكبيرة",xg:"الأهداف المتوقعة xG",possession:"الاستحواذ"} as any)[id]||id;
  const decimals=id==="xg"?2:0; const suffix=id==="possession"?"%":"";
  return <div style={{position:"absolute",left:(1080-CARD_W)/2,top,width:CARD_W,height:h,borderRadius:26-compact*8,background:"linear-gradient(180deg,rgba(3,18,27,.93),rgba(2,10,16,.96))",border:"1px solid rgba(255,255,255,.16)",boxShadow:`0 24px 58px rgba(0,0,0,.42),0 0 32px ${rgba(hc(p),.045)}`,opacity:enter,overflow:"hidden"}}>
    <div style={{position:"absolute",left:0,right:0,top:0,height:4,background:`linear-gradient(90deg,${hc(p)},rgba(255,255,255,.55),${ac(p)})`}}/>
    <div style={{position:"absolute",left:28,top:compact>0.55?35:95,width:170,textAlign:"left"}}><div style={{fontSize:compact>.5?45:76,fontWeight:950,color:hc(p),lineHeight:1}}>{count(home,lf,decimals)}{suffix}</div></div>
    <div style={{position:"absolute",right:28,top:compact>0.55?35:95,width:170,textAlign:"right"}}><div style={{fontSize:compact>.5?45:76,fontWeight:950,color:ac(p),lineHeight:1}}>{count(away,lf,decimals)}{suffix}</div></div>
    <div style={{position:"absolute",left:205,right:205,top:compact>.5?17:25,textAlign:"center",fontSize:compact>.5?21:28,fontWeight:900,color:"rgba(255,255,255,.92)"}}>{title}</div>
    {id==="shots"?<ShotTicks p={p} home={home} away={away} lf={lf} compact={compact}/>:null}
    {id==="shots_on_target"?<Goal3D p={p} home={home} away={away} lf={lf} compact={compact}/>:null}
    {id==="big_chances"?<MiniPitch p={p} home={home} away={away} lf={lf} compact={compact}/>:null}
    {id==="xg"?<Bars p={p} home={home} away={away} lf={lf} compact={compact}/>:null}
    {id==="possession"?<Bars p={p} home={home} away={away} lf={lf} compact={compact} possession/>:null}
  </div>;
};

const statEntries=(s:any)=>{
  if(Array.isArray(s))return s.slice(0,5).map((x:any)=>({label:String(x.label||x.name||"إحصائية"),value:String(x.value??"")}));
  if(s&&typeof s==="object")return Object.entries(s).slice(0,5).map(([k,v])=>({label:String(k).replace(/([A-Z])/g," $1").trim(),value:String(v)}));
  return [];
};

const MotmPage:React.FC<{p:StackProps;opacity:number}>=({p,opacity})=>{
  const f=useCurrentFrame()-STATS_END; const star:any=p.starPlayer||{}; const photo=star.photoUrl||star.imageUrl||p.assets?.starPlayerPhotoUrl||null; const rating=num(star.rating,8.3); const stats=statEntries(star.stats);
  const cardIn=interpolate(f,[0,25],[.9,1],{...clamp,easing:out}); const titleIn=interpolate(f,[0,18],[30,0],{...clamp,easing:out}); const photoIn=interpolate(f,[10,42],[90,0],{...clamp,easing:out});
  return <AbsoluteFill style={{opacity,background:"#020202",fontFamily:cairo,color:"white",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 49%,${rgba(star.team===p.homeTeam?hc(p):ac(p),.12)},transparent 42%)`}}/>
    <Img src={logo(p)} style={{position:"absolute",left:42,top:36,width:225,height:62,objectFit:"contain"}}/>
    <div style={{position:"absolute",left:0,right:0,top:128,textAlign:"center",transform:`translateY(${titleIn}px)`}}><div style={{fontSize:20,color:"#D9B75C",fontWeight:900,letterSpacing:3}}>★</div><div style={{fontSize:65,fontWeight:950,letterSpacing:1,color:"#E7C161",textShadow:"0 8px 26px rgba(229,190,93,.15)"}}>MAN OF THE MATCH</div><div style={{fontSize:32,marginTop:8,fontWeight:700}}>نجم المباراة</div></div>
    <div style={{position:"absolute",left:120,top:330,width:840,height:1050,transform:`scale(${cardIn})`,transformOrigin:"center top",clipPath:"polygon(12% 8%,50% 0%,88% 8%,94% 18%,94% 86%,84% 96%,50% 100%,16% 96%,6% 86%,6% 18%)",background:"linear-gradient(160deg,#0b1720,#071019 58%,#10100d)",border:"2px solid #D6B45B",boxShadow:"0 30px 80px rgba(0,0,0,.6),inset 0 0 80px rgba(255,255,255,.025)"}}>
      <div style={{position:"absolute",inset:14,clipPath:"polygon(12% 8%,50% 0%,88% 8%,94% 18%,94% 86%,84% 96%,50% 100%,16% 96%,6% 86%,6% 18%)",border:"1px solid rgba(214,180,91,.55)"}}/>
      {photo?<Img src={photo} style={{position:"absolute",left:85,right:85,bottom:225,height:700,width:670,objectFit:"contain",transform:`translateY(${photoIn}px)`,filter:"drop-shadow(0 28px 32px rgba(0,0,0,.55))"}}/>:null}
      <div style={{position:"absolute",right:68,top:118}}><Badge src={star.team===p.homeTeam?p.assets?.homeBadgeUrl:p.assets?.awayBadgeUrl} color={star.team===p.homeTeam?hc(p):ac(p)} name={star.team||"★"}/></div>
      <div style={{position:"absolute",left:70,right:70,bottom:205,height:78,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(2,2,2,.92)",border:"1px solid #D6B45B",fontSize:37,fontWeight:950,color:"#E8C563"}}>{star.name||"نجم المباراة"}</div>
      <div style={{position:"absolute",left:65,right:65,bottom:80,height:100,display:"grid",gridTemplateColumns:"repeat(5,1fr)",direction:"ltr"}}>
        {[{label:"أهداف",value:star.goals??stats[0]?.value??"1"},{label:"أسيست",value:star.assists??stats[1]?.value??"0"},{label:"المركز",value:star.position||"FW"},{label:"تقييم",value:count(rating,f,1)},{label:"دقائق",value:star.minutes??"90"}].map((x,i)=><div key={i} style={{textAlign:"center",borderRight:i<4?"1px solid rgba(214,180,91,.34)":"none"}}><div style={{fontSize:36,fontWeight:950,color:"#E7C161"}}>{x.value}</div><div style={{fontSize:18,fontWeight:800,color:"rgba(255,255,255,.84)",marginTop:7}}>{x.label}</div></div>)}
      </div>
    </div>
    <div style={{position:"absolute",left:150,right:150,bottom:150,display:"flex",justifyContent:"space-between",fontSize:29,fontWeight:900,direction:"ltr"}}><span style={{color:hc(p)}}>{p.homeTeam}</span><span style={{color:"#D6B45B"}}>VS</span><span style={{color:ac(p)}}>{p.awayTeam}</span></div>
    <div style={{position:"absolute",right:70,bottom:58,fontSize:19,color:"rgba(255,255,255,.72)",fontWeight:800}}>X  ·  Instagram  ·  TikTok  ·  TACTIC SPORT</div>
  </AbsoluteFill>;
};

export const TacticStatsHilalStackV2:React.FC<StackProps>=(p)=>{
  const f=useCurrentFrame(); const statsOpacity=interpolate(f,[STATS_END-22,STATS_END+4],[1,0],clamp); const motmOpacity=interpolate(f,[STATS_END-8,STATS_END+18],[0,1],clamp);
  return <AbsoluteFill style={{fontFamily:cairo,color:"white",background:"#020508"}}>
    {f<STATS_END+10?<><Stadium p={p} opacity={statsOpacity}/><Header p={p} opacity={statsOpacity}/><div style={{opacity:statsOpacity}}>{["shots","shots_on_target","big_chances","xg","possession"].map((id,i)=><StackCard key={id} p={p} id={id} index={i}/>)}</div></>:null}
    {f>=STATS_END-10?<MotmPage p={p} opacity={motmOpacity}/>:null}
  </AbsoluteFill>;
};
