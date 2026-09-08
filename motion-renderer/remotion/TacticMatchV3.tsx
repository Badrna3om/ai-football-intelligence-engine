import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";
import {
  TacticMatch as TacticMatchV2,
  tacticMatchSchema as baseSchema,
  defaultMatch as defaultMatchV2,
  calculateDuration as calculateDurationV2,
} from "./TacticMatchV2";

const {fontFamily: cairo} = loadFont();
const FPS = 30;
const V3_FIRST_ACT_FRAMES = 585;

export const tacticMatchSchema = baseSchema.extend({
  v3FirstActPreview: z.boolean().optional(),
});
export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  ...defaultMatchV2,
  v3FirstActPreview: false,
};

export const calculateDuration = (p: MatchProps) =>
  p.v3FirstActPreview ? V3_FIRST_ACT_FRAMES : calculateDurationV2(p);

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const ease = Easing.inOut(Easing.cubic);
const mix = (f:number,a:number,b:number,x:number,y:number) => interpolate(f,[a,b],[x,y],{...clamp,easing:ease});
const phase = (f:number,a:number,b:number) => mix(f,a,b,0,1);
const num = (v:any,d=0) => { const n=Number(v); return Number.isFinite(n)?n:d; };
const txt = (v:any,d="") => String(v??d);
const homeColor = (p:MatchProps) => p.design?.homeColor || "#21d4ff";
const awayColor = (p:MatchProps) => p.design?.awayColor || "#f0c153";
const homeBadge = (p:MatchProps) => p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p:MatchProps) => p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const tacticLogo = (p:MatchProps) => p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");
const competitionLogo = (p:MatchProps) => p.assets?.competitionLogoUrl || null;

const Beam:React.FC<{left:number;top:number;height:number;opacity:number;rotate?:number}> = ({left,top,height,opacity,rotate=0}) => (
  <div style={{
    position:"absolute",left,top,width:4,height,
    transform:`rotate(${rotate}deg)`,transformOrigin:"top center",
    background:"linear-gradient(180deg,rgba(255,255,255,.95),rgba(53,215,255,.32),transparent)",
    boxShadow:"0 0 18px rgba(255,255,255,.75),0 0 65px rgba(53,215,255,.35)",
    opacity,
  }}/>
);

const StadiumWorld:React.FC<{p:MatchProps}> = () => {
  const f=useCurrentFrame();
  const introPush=phase(f,0,105);
  const matchPush=phase(f,100,300);
  const statDive=phase(f,315,560);
  const scale=1.02 + introPush*.045 + matchPush*.03 + statDive*.07;
  const y=-8 - matchPush*12 + statDive*34;
  const x=Math.sin(f/38)*7;
  const sweep=interpolate(f%170,[0,169],[-420,1380]);
  const lightPulse=.55+.25*Math.sin(f/17);
  return <AbsoluteFill style={{background:"#02070b",overflow:"hidden"}}>
    <AbsoluteFill style={{transform:`translate(${x}px,${y}px) scale(${scale})`}}>
      <AbsoluteFill style={{background:"radial-gradient(circle at 50% 10%,#193b4f 0%,#091820 31%,#030a0f 60%,#010305 100%)"}}/>
      <div style={{position:"absolute",left:-180,right:-180,top:82,height:470,borderRadius:"50%",border:"2px solid rgba(255,255,255,.09)",boxShadow:"0 0 150px rgba(35,181,222,.13),inset 0 -90px 140px rgba(0,0,0,.76)"}}/>
      <div style={{position:"absolute",left:-100,right:-100,top:176,height:350,borderRadius:"50%",border:"1px solid rgba(255,255,255,.07)"}}/>
      {Array.from({length:22}).map((_,i)=>{
        const px=35+i*49;
        const flicker=.35+.3*Math.sin((f+i*13)/11);
        return <div key={`stadium-light-${i}`} style={{position:"absolute",left:px,top:238,width:9,height:9,borderRadius:"50%",background:"#fff",opacity:.25+Math.max(0,flicker)*.38,boxShadow:"0 0 24px rgba(255,255,255,.78),0 0 58px rgba(79,220,255,.47)"}}/>;
      })}
      <div style={{position:"absolute",left:22,right:22,bottom:-20,height:1180,transform:"perspective(920px) rotateX(58deg)",transformOrigin:"center bottom",background:"linear-gradient(180deg,rgba(7,37,31,.98),rgba(4,20,20,.99))",border:"1px solid rgba(255,255,255,.13)",boxShadow:"0 -55px 120px rgba(0,0,0,.44),inset 0 0 100px rgba(20,170,122,.08)"}}>
        <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:3,background:"rgba(255,255,255,.28)"}}/>
        <div style={{position:"absolute",left:"50%",top:"50%",width:300,height:300,border:"3px solid rgba(255,255,255,.27)",borderRadius:"50%",transform:"translate(-50%,-50%)"}}/>
        <div style={{position:"absolute",left:92,right:92,top:0,height:250,border:"3px solid rgba(255,255,255,.24)",borderTop:0}}/>
        <div style={{position:"absolute",left:92,right:92,bottom:0,height:250,border:"3px solid rgba(255,255,255,.24)",borderBottom:0}}/>
        {Array.from({length:11}).map((_,i)=><div key={`pitch-stripe-${i}`} style={{position:"absolute",left:0,right:0,top:i*107,height:54,background:i%2?"rgba(255,255,255,.012)":"rgba(56,204,146,.028)"}}/>)}
      </div>
      <div style={{position:"absolute",left:sweep,top:-320,width:130,height:2700,transform:"rotate(15deg)",background:"linear-gradient(90deg,transparent,rgba(57,218,255,.30),rgba(255,225,155,.12),transparent)",filter:"blur(20px)",mixBlendMode:"screen",opacity:.9}}/>
      <div style={{position:"absolute",left:0,right:0,top:0,height:580,background:"linear-gradient(180deg,rgba(255,255,255,.025),transparent)"}}/>
      <div style={{position:"absolute",left:74,top:305,width:18,height:950,background:"linear-gradient(180deg,rgba(255,255,255,.15),transparent)",filter:"blur(9px)",opacity:lightPulse*.34}}/>
      <div style={{position:"absolute",right:98,top:360,width:10,height:850,background:"linear-gradient(180deg,rgba(44,211,255,.20),transparent)",filter:"blur(8px)",opacity:lightPulse*.4}}/>
    </AbsoluteFill>
    <AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.06) 56%,rgba(0,0,0,.42))"}}/>
  </AbsoluteFill>;
};

const TeamBadge:React.FC<{src:string|null;color:string;size:number;glow:number}> = ({src,color,size,glow}) => (
  <div style={{width:size,height:size,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle,${color}2b,rgba(0,5,9,.72) 67%)`,border:`1px solid ${color}88`,boxShadow:`0 0 ${55+glow*70}px ${color}44, inset 0 0 55px rgba(255,255,255,.04)`}}>
    {src?<Img src={src} style={{width:"78%",height:"78%",objectFit:"contain",filter:"drop-shadow(0 18px 24px rgba(0,0,0,.55))"}}/>:null}
  </div>
);

const IntroIdentity:React.FC<{p:MatchProps}> = ({p}) => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  const s=spring({frame:f,fps,config:{damping:10,stiffness:135,mass:.75}});
  const leave=phase(f,72,118);
  const logoScale=.62+s*.44+leave*.18;
  const logoY=-40-leave*520;
  const logoOpacity=1-phase(f,96,125);
  const ring=1.7-phase(f,0,48)*.76;
  const flash=interpolate(f,[5,9,13],[0,.75,0],clamp);
  return <>
    <div style={{position:"absolute",left:"50%",top:"48%",width:790,height:790,borderRadius:"50%",border:"1px solid rgba(82,220,255,.18)",transform:`translate(-50%,-50%) scale(${ring})`,opacity:.65-phase(f,60,110)*.55,boxShadow:"0 0 120px rgba(53,215,255,.09)"}}/>
    <div style={{position:"absolute",left:"50%",top:"47%",transform:`translate(-50%,-50%) translateY(${logoY}px) scale(${logoScale})`,opacity:logoOpacity,textAlign:"center"}}>
      <Img src={tacticLogo(p)} style={{width:620,maxHeight:330,objectFit:"contain",mixBlendMode:"screen",filter:"drop-shadow(0 0 34px rgba(62,213,255,.25)) drop-shadow(0 34px 45px rgba(0,0,0,.60))"}}/>
      <div style={{marginTop:38,fontSize:23,fontWeight:900,letterSpacing:4.8,color:"rgba(255,255,255,.72)",opacity:phase(f,18,48)*(1-leave)}}>THE HOME OF FOOTBALL DATA</div>
    </div>
    <AbsoluteFill style={{background:`rgba(255,255,255,${flash})`,mixBlendMode:"screen",pointerEvents:"none"}}/>
  </>;
};

const MatchupLayer:React.FC<{p:MatchProps}> = ({p}) => {
  const f=useCurrentFrame();
  const enter=phase(f,82,150);
  const settle=phase(f,140,205);
  const toScore=phase(f,210,278);
  const fade=1-phase(f,315,360);
  const leftX=-560+enter*300-toScore*80;
  const rightX=560-enter*300+toScore*80;
  const badgeScale=.62+enter*.38-toScore*.28;
  const badgeY=70-toScore*270;
  const namesOpacity=enter*(1-phase(f,215,255));
  const coreScale=.5+enter*.8+toScore*2.3;
  const coreOpacity=(.18+enter*.40-toScore*.34)*fade;
  return <>
    <div style={{position:"absolute",top:145,left:0,right:0,textAlign:"center",opacity:enter*(1-toScore)}}>
      {competitionLogo(p)?<Img src={competitionLogo(p)!} style={{height:100,maxWidth:210,objectFit:"contain",filter:"drop-shadow(0 16px 28px rgba(0,0,0,.50))"}}/>:null}
      <div style={{fontSize:27,color:"rgba(255,255,255,.72)",fontWeight:850,marginTop:10}}>{p.competition}{p.round?` • الجولة ${p.round}`:""}</div>
    </div>
    <AbsoluteFill style={{alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",left:"50%",top:"49%",width:22,height:22,borderRadius:"50%",background:"#fff",transform:`translate(-50%,-50%) scale(${coreScale})`,opacity:coreOpacity,boxShadow:"0 0 28px white,0 0 110px rgba(58,214,255,.62),0 0 220px rgba(58,214,255,.20)"}}/>
      <div style={{position:"absolute",left:"50%",top:"49%",transform:`translate(-50%,-50%) translate(${leftX}px,${badgeY}px) scale(${badgeScale})`,textAlign:"center",opacity:fade}}>
        <TeamBadge src={homeBadge(p)} color={homeColor(p)} size={300} glow={settle}/>
        <div style={{fontSize:43,fontWeight:950,marginTop:24,opacity:namesOpacity,textShadow:"0 16px 35px rgba(0,0,0,.58)"}}>{p.homeTeam}</div>
      </div>
      <div style={{position:"absolute",left:"50%",top:"49%",transform:`translate(-50%,-50%) translate(${rightX}px,${badgeY}px) scale(${badgeScale})`,textAlign:"center",opacity:fade}}>
        <TeamBadge src={awayBadge(p)} color={awayColor(p)} size={300} glow={settle}/>
        <div style={{fontSize:43,fontWeight:950,marginTop:24,opacity:namesOpacity,textShadow:"0 16px 35px rgba(0,0,0,.58)"}}>{p.awayTeam}</div>
      </div>
      <div style={{fontSize:36,fontWeight:900,letterSpacing:3,color:"rgba(255,255,255,.52)",opacity:enter*(1-toScore),transform:`scale(${.5+enter*.5})`}}>VS</div>
    </AbsoluteFill>
  </>;
};

const ScoreImpact:React.FC<{p:MatchProps}> = ({p}) => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  const inP=phase(f,205,270);
  const outP=phase(f,318,370);
  const parts=txt(p.score,"0-0").split("-");
  const h=num(parts[0]),a=num(parts[1]);
  const impact=spring({frame:Math.max(0,f-232),fps,config:{damping:8,stiffness:220,mass:.42}});
  const hCount=Math.round(mix(f,225,258,0,h));
  const aCount=Math.round(mix(f,225,258,0,a));
  const shake=f>=243&&f<251?(f%2===0?8:-8):0;
  const scoreScale=.55+impact*.50+outP*.16;
  const opacity=inP*(1-outP);
  const ring=phase(f,238,290);
  const portalPulse=phase(f,318,342)*(1-phase(f,342,388));
  return <>
    <div style={{position:"absolute",left:"50%",top:"48%",width:680,height:680,borderRadius:"50%",border:"2px solid rgba(255,255,255,.18)",transform:`translate(-50%,-50%) scale(${.18+ring*1.55})`,opacity:(1-ring)*inP,boxShadow:"0 0 95px rgba(53,215,255,.14)"}}/>
    <div style={{position:"absolute",left:"50%",top:"48%",transform:`translate(-50%,-50%) translateX(${shake}px) scale(${scoreScale})`,opacity,textAlign:"center"}}>
      <div style={{fontSize:25,fontWeight:900,letterSpacing:2.2,color:"rgba(255,255,255,.62)",marginBottom:12}}>FINAL SCORE</div>
      <div style={{display:"grid",gridTemplateColumns:"190px 110px 190px",alignItems:"center",direction:"ltr"}}>
        <div><div style={{fontSize:158,lineHeight:.95,fontWeight:950,color:homeColor(p),textShadow:`0 0 42px ${homeColor(p)}45`}}>{hCount}</div><div style={{fontSize:25,fontWeight:900,marginTop:14}}>{p.homeTeam}</div></div>
        <div style={{fontSize:56,color:"rgba(255,255,255,.28)"}}>—</div>
        <div><div style={{fontSize:158,lineHeight:.95,fontWeight:950,color:awayColor(p),textShadow:`0 0 42px ${awayColor(p)}45`}}>{aCount}</div><div style={{fontSize:25,fontWeight:900,marginTop:14}}>{p.awayTeam}</div></div>
      </div>
    </div>
    <div style={{position:"absolute",left:"50%",top:"48%",width:12,height:12,borderRadius:"50%",background:"#fff",transform:`translate(-50%,-50%) scale(${1+portalPulse*14})`,opacity:portalPulse*.52,boxShadow:"0 0 28px white,0 0 120px rgba(54,214,255,.82)"}}/>
  </>;
};

const ShotsPortal:React.FC<{p:MatchProps}> = ({p}) => {
  const f=useCurrentFrame();
  const enter=phase(f,320,402);
  const settle=phase(f,395,455);
  const story=(p.statsCards||[]).find((s:any)=>String(s.id)==="shots") as any;
  const h=story?.homeValue??0, a=story?.awayValue??0;
  const crossbarW=120+enter*700;
  const goalH=70+enter*430;
  const titleTop=mix(f,320,405,520,172);
  const floorDive=phase(f,410,560);
  return <>
    <div style={{position:"absolute",left:"50%",top:"50%",width:crossbarW,height:goalH,transform:`translate(-50%,-50%) perspective(900px) rotateX(${7-floorDive*4}deg)`,transformOrigin:"center bottom",border:"7px solid rgba(255,255,255,.84)",borderBottomWidth:12,opacity:enter,boxShadow:"0 0 46px rgba(255,255,255,.12),inset 0 0 72px rgba(53,215,255,.04)"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",backgroundSize:"72px 72px",opacity:settle}}/>
      {Array.from({length:12}).map((_,i)=>{
        const home=i%2===0; const pr=phase(f,390+i*5,460+i*5);
        const sx=home?60+(i*47)%250:650-(i*43)%250;
        const ex=300+(i*67)%160; const ey=58+(i*71)%300;
        const dx=(ex-sx)*pr,dy=(ey-430)*pr; const len=Math.sqrt(dx*dx+dy*dy);
        const angle=Math.atan2(dy,dx)*180/Math.PI; const col=home?homeColor(p):awayColor(p);
        return <div key={`trail-${i}`} style={{position:"absolute",left:sx,top:430,width:len,height:4,transformOrigin:"left center",transform:`rotate(${angle}deg)`,background:`linear-gradient(90deg,transparent,${col})`,boxShadow:`0 0 16px ${col}`,opacity:.12+pr*.78}}/>;
      })}
    </div>
    <div style={{position:"absolute",left:0,right:0,top:titleTop,textAlign:"center",opacity:enter}}>
      <div style={{fontSize:21,fontWeight:900,letterSpacing:3.6,color:"rgba(255,255,255,.60)"}}>ATTACK VOLUME</div>
      <div style={{fontSize:66,fontWeight:950,marginTop:2}}>التسديدات</div>
    </div>
    <div style={{position:"absolute",left:72,right:72,bottom:112,display:"flex",justifyContent:"space-between",direction:"ltr",opacity:settle}}>
      <div><div style={{fontSize:24,fontWeight:850,color:"rgba(255,255,255,.64)"}}>{p.homeTeam}</div><div style={{fontSize:98,fontWeight:950,lineHeight:1,color:homeColor(p)}}>{Math.round(mix(f,420,475,0,num(h)))}</div></div>
      <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:850,color:"rgba(255,255,255,.64)"}}>{p.awayTeam}</div><div style={{fontSize:98,fontWeight:950,lineHeight:1,color:awayColor(p)}}>{Math.round(mix(f,420,475,0,num(a)))}</div></div>
    </div>
    <Beam left={140} top={470} height={920} rotate={-10} opacity={settle*.16}/>
    <Beam left={930} top={500} height={880} rotate={10} opacity={settle*.13}/>
  </>;
};

const V3FirstAct:React.FC<MatchProps> = (p) => {
  const f=useCurrentFrame();
  const brand=phase(f,110,155);
  return <AbsoluteFill style={{background:"#02070b",fontFamily:cairo,color:"#f7fbff",overflow:"hidden"}}>
    <StadiumWorld p={p}/>
    <IntroIdentity p={p}/>
    <MatchupLayer p={p}/>
    <ScoreImpact p={p}/>
    <ShotsPortal p={p}/>
    <div style={{position:"absolute",left:34,top:30,opacity:brand*.88}}><Img src={tacticLogo(p)} style={{height:56,maxWidth:220,objectFit:"contain",mixBlendMode:"screen",filter:"drop-shadow(0 10px 24px rgba(0,0,0,.50))"}}/></div>
    <div style={{position:"absolute",left:0,right:0,bottom:0,height:74,background:"linear-gradient(180deg,transparent,rgba(0,0,0,.62))",opacity:brand}}/>
    <AbsoluteFill style={{pointerEvents:"none",background:`radial-gradient(circle at 50% 48%,transparent 38%,rgba(0,0,0,${.06+phase(f,500,584)*.10}) 100%)`}}/>
  </AbsoluteFill>;
};

export const TacticMatch:React.FC<MatchProps> = (p) => {
  if (!p.v3FirstActPreview) {
    return <TacticMatchV2 {...p}/>;
  }
  return <V3FirstAct {...p}/>;
};
