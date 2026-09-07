import React from "react";
import {AbsoluteFill,Easing,Img,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily}=loadFont();

export const FPS=30;
export const C={bg:"#061019",white:"#F7FAFC",muted:"#9BAAB8",cyan:"#22D4FF",gold:"#E7C264",line:"rgba(255,255,255,.14)"};
export type MatchProps=any;

export const n=(v:any)=>{const x=Number(v);return Number.isFinite(x)?x:0};
export const t=(v:any,d="")=>String(v??d);
export const homeColor=(p:MatchProps)=>p.design?.homeColor||C.cyan;
export const awayColor=(p:MatchProps)=>p.design?.awayColor||C.gold;
export const homeBadge=(p:MatchProps)=>p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl;
export const awayBadge=(p:MatchProps)=>p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl;
export const teamBadge=(p:MatchProps,side:"home"|"away")=>side==="home"?homeBadge(p):awayBadge(p);
export const teamColor=(p:MatchProps,side:"home"|"away")=>side==="home"?homeColor(p):awayColor(p);
export const templateSrc=(name:string)=>staticFile(`assets/templates/${name}`);

export const sceneOpacity=(frame:number,duration:number)=>interpolate(frame,[0,10,Math.max(11,duration-12),duration-1],[0,1,1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
export const rise=(frame:number,start=0,end=20,px=36)=>interpolate(frame,[start,end],[px,0],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
export const pop=(frame:number,start=0,end=20)=>interpolate(frame,[start,end],[.72,1],{easing:Easing.out(Easing.back(1.35)),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
export const fade=(frame:number,start=0,end=16)=>interpolate(frame,[start,end],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
export const count=(value:any,frame:number,start=0,end=42,decimals=0)=>{
  const v=n(value);const p=interpolate(frame,[start,end],[0,1],{easing:Easing.out(Easing.cubic),extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return decimals?(v*p).toFixed(decimals):Math.round(v*p).toString();
};

export const TemplateBackground:React.FC<{name:string;darken?:number}> = ({name,darken=.08}) => <AbsoluteFill>
  <Img src={templateSrc(name)} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
  {darken>0&&<AbsoluteFill style={{background:`rgba(0,5,10,${darken})`}}/>}
</AbsoluteFill>;

export const Brand:React.FC<{p:MatchProps;large?:boolean;animated?:boolean}> = ({p,large=false,animated=false}) => {
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const s=animated?spring({frame,fps,config:{damping:16,stiffness:105}}):1;
  return <Img src={p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png")} style={{height:large?118:72,maxWidth:large?390:275,objectFit:"contain",transform:`scale(${animated?.82+.18*s:1})`,filter:"drop-shadow(0 10px 22px rgba(0,0,0,.35))"}}/>;
};

export const Competition:React.FC<{p:MatchProps;large?:boolean;name?:boolean;animated?:boolean}> = ({p,large=false,name=true,animated=false}) => {
  const frame=useCurrentFrame();const logo=p.assets?.competitionLogoUrl;
  return <div style={{display:"flex",alignItems:"center",gap:14,direction:"rtl",transform:`scale(${animated?pop(frame,6,28):1})`}}>
    {logo&&<Img src={logo} style={{height:large?138:62,maxWidth:large?240:120,objectFit:"contain",filter:"drop-shadow(0 8px 18px rgba(0,0,0,.25))"}}/>}
    {name&&<b style={{fontFamily,fontSize:large?32:19,color:C.white}}>{p.competition}</b>}
  </div>;
};

export const Header:React.FC<{p:MatchProps;label:string;showCompetition?:boolean}> = ({p,label,showCompetition=true}) => <div style={{position:"absolute",zIndex:40,top:48,left:48,right:48,display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center"}}>
  <div>{showCompetition&&<Competition p={p}/>}</div>
  <div style={{fontFamily,fontSize:24,fontWeight:900,color:C.white,padding:"11px 22px",border:`1px solid ${C.line}`,borderRadius:999,background:"rgba(1,8,13,.78)",boxShadow:"0 12px 28px rgba(0,0,0,.24)"}}>{label}</div>
  <div style={{justifySelf:"end"}}><Brand p={p}/></div>
</div>;

export const Glass:React.FC<{children:React.ReactNode;style?:React.CSSProperties}> = ({children,style}) => <div style={{background:"linear-gradient(180deg,rgba(7,21,32,.94),rgba(4,14,23,.86))",border:`1px solid ${C.line}`,boxShadow:"0 22px 68px rgba(0,0,0,.36)",backdropFilter:"blur(14px)",...style}}>{children}</div>;

export const TeamBadge:React.FC<{p:MatchProps;side:"home"|"away";name?:string;size?:number;showName?:boolean}> = ({p,side,name,size=150,showName=true}) => {
  const frame=useCurrentFrame();const url=teamBadge(p,side);const color=teamColor(p,side);const label=name||(side==="home"?p.homeTeam:p.awayTeam);
  return <div style={{fontFamily,textAlign:"center",transform:`translateY(${rise(frame,4,24,28)}px) scale(${pop(frame,4,24)})`}}>
    <div style={{width:size,height:size,borderRadius:999,border:`2px solid ${color}66`,background:`radial-gradient(circle,${color}16,rgba(3,12,20,.82) 66%)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",boxShadow:`0 0 38px ${color}22`}}>{url&&<Img src={url} style={{width:"82%",height:"82%",objectFit:"contain"}}/>}</div>
    {showName&&<b style={{display:"block",fontSize:30,color:C.white,marginTop:12}}>{label}</b>}
  </div>;
};

export const Score:React.FC<{p:MatchProps;score?:string;size?:number}> = ({p,score,size=88}) => {
  const [h,a]=t(score||p.score,"0 - 0").split("-").map((x)=>x.trim());
  return <div style={{fontFamily,display:"flex",alignItems:"center",justifyContent:"center",gap:18,direction:"ltr"}}><b style={{fontSize:size,color:homeColor(p)}}>{h}</b><span style={{fontSize:size*.38,color:C.muted}}>–</span><b style={{fontSize:size,color:awayColor(p)}}>{a}</b></div>;
};

export const GoldShimmer:React.FC<{opacity?:number}> = ({opacity=.5}) => {
  const frame=useCurrentFrame();const x=interpolate(frame%150,[0,149],[-500,1250]);
  return <AbsoluteFill style={{pointerEvents:"none",overflow:"hidden"}}><div style={{position:"absolute",top:-250,left:x,width:150,height:2400,transform:"rotate(17deg)",background:`linear-gradient(90deg,transparent,rgba(255,214,117,${opacity}),transparent)`,filter:"blur(13px)",mixBlendMode:"screen"}}/></AbsoluteFill>;
};

export const PositionAr=(v:any)=>{const s=t(v).toLowerCase();const map:Record<string,string>={"left forward":"جناح أيسر","right forward":"جناح أيمن","centre-forward":"مهاجم صريح","center forward":"مهاجم صريح","attacker":"مهاجم","midfielder":"وسط","defender":"مدافع","goalkeeper":"حارس مرمى"};return map[s]||t(v)};

export const CardRoot:React.FC<{children:React.ReactNode;duration:number;background:string;darken?:number}> = ({children,duration,background,darken}) => {const frame=useCurrentFrame();return <AbsoluteFill style={{fontFamily,color:C.white,direction:"rtl",opacity:sceneOpacity(frame,duration),background:C.bg}}><TemplateBackground name={background} darken={darken}/>{children}</AbsoluteFill>};
