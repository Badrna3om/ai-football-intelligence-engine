import React from "react";
import {interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,TeamBadge,awayColor,count,fade,homeColor,n} from "./shared";

export const ShotsCard:React.FC<{p:MatchProps;shots:any;onTarget:any;duration:number}> = ({p,shots,onTarget,duration}) => {
  const frame=useCurrentFrame();
  const switchFrame=Math.round(duration*.54);
  const phase2=fade(frame,switchFrame,switchFrame+16);
  const arrowOpacity=1-phase2;
  const hv=n(shots?.homeValue),av=n(shots?.awayValue),ht=n(onTarget?.homeValue),at=n(onTarget?.awayValue);
  const hCount=Math.min(12,Math.max(0,Math.round(hv))),aCount=Math.min(12,Math.max(0,Math.round(av)));
  const hT=Math.min(10,Math.max(0,Math.round(ht))),aT=Math.min(10,Math.max(0,Math.round(at)));
  const shotProgress=interpolate(frame,[14,Math.max(28,switchFrame-12)],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const ballProgress=interpolate(frame,[switchFrame+4,switchFrame+28],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const statRow=(label:string,h:any,a:any,opacity:number,start:number)=><Glass style={{position:"absolute",left:72,right:72,bottom:130,borderRadius:30,padding:"24px 32px",opacity,borderColor:"rgba(255,255,255,.22)"}}><div style={{display:"grid",gridTemplateColumns:"190px 1fr 190px",alignItems:"center",direction:"ltr"}}><b style={{fontSize:64,color:homeColor(p),textShadow:`0 0 24px ${homeColor(p)}55`}}>{count(h,frame,start,start+34)}</b><div style={{fontSize:29,fontWeight:950,textAlign:"center",color:C.white}}>{label}</div><b style={{fontSize:64,color:awayColor(p),textAlign:"right",textShadow:`0 0 24px ${awayColor(p)}55`}}>{count(a,frame,start,start+34)}</b></div></Glass>;
  return <CardRoot duration={duration} background="shots-v2.webp" darken={0}>
    <Header p={p} label="التسديدات"/>
    <div style={{position:"absolute",top:160,left:70,right:70,display:"grid",gridTemplateColumns:"1fr 1fr",direction:"ltr",alignItems:"start"}}>
      <TeamBadge p={p} side="home" size={138}/><TeamBadge p={p} side="away" size={138}/>
    </div>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0,opacity:arrowOpacity}}>
      <defs><marker id="ah" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,8 L10,4 z" fill={homeColor(p)}/></marker><marker id="aa" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,8 L10,4 z" fill={awayColor(p)}/></marker></defs>
      {Array.from({length:hCount}).map((_,i)=>{const sx=85+(i%6)*54,sy=1330-(i%3)*55,ex=330+(i*71)%290,ey=650+(i*37)%190;return <path key={`h${i}`} d={`M${sx},${sy} Q${260+i*15},${1030-i*8} ${ex},${ey}`} fill="none" stroke={homeColor(p)} strokeWidth="6" strokeLinecap="round" markerEnd="url(#ah)" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-shotProgress)} opacity={.88}/>})}
      {Array.from({length:aCount}).map((_,i)=>{const sx=995-(i%6)*54,sy=1330-(i%3)*55,ex=750-(i*67)%290,ey=650+(i*33)%190;return <path key={`a${i}`} d={`M${sx},${sy} Q${820-i*15},${1030-i*8} ${ex},${ey}`} fill="none" stroke={awayColor(p)} strokeWidth="6" strokeLinecap="round" markerEnd="url(#aa)" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-shotProgress)} opacity={.88}/>})}
    </svg>
    <div style={{position:"absolute",left:215,top:575,width:650,height:365,opacity:phase2}}>
      {Array.from({length:hT}).map((_,i)=><div key={`dh${i}`} style={{position:"absolute",width:38,height:38,borderRadius:99,border:`6px solid ${homeColor(p)}`,left:65+(i*91)%470,top:44+(i*67)%235,transform:`scale(${ballProgress})`,boxShadow:`0 0 16px ${homeColor(p)},0 0 42px ${homeColor(p)}`}}/>)}
      {Array.from({length:aT}).map((_,i)=><div key={`da${i}`} style={{position:"absolute",width:38,height:38,borderRadius:99,border:`6px solid ${awayColor(p)}`,left:95+(i*103)%445,top:64+(i*71)%215,transform:`scale(${ballProgress})`,boxShadow:`0 0 16px ${awayColor(p)},0 0 42px ${awayColor(p)}`}}/>)}
    </div>
    {statRow("إجمالي التسديدات",hv,av,arrowOpacity,18)}
    {statRow("التسديدات على المرمى",ht,at,phase2,switchFrame+5)}
  </CardRoot>;
};
