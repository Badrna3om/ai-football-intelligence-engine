import React from "react";
import {interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,TeamBadge,awayColor,count,fade,homeColor,n} from "./shared";

export const ShotsCard:React.FC<{p:MatchProps;shots:any;onTarget:any;duration:number}> = ({p,shots,onTarget,duration}) => {
  const frame=useCurrentFrame();const sw=Math.round(duration*.52);const p2=fade(frame,sw,sw+16);const arrowOpacity=1-p2;
  const hv=n(shots?.homeValue),av=n(shots?.awayValue),ht=n(onTarget?.homeValue),at=n(onTarget?.awayValue);
  const hCount=Math.min(9,Math.max(0,Math.round(hv))),aCount=Math.min(9,Math.max(0,Math.round(av)));
  const hT=Math.min(9,Math.max(0,Math.round(ht))),aT=Math.min(9,Math.max(0,Math.round(at)));
  const shotProgress=interpolate(frame,[12,Math.max(24,sw-12)],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const ballProgress=interpolate(frame,[sw+5,sw+34],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const statRow=(label:string,h:any,a:any,opacity:number)=><Glass style={{position:"absolute",left:70,right:70,bottom:92,borderRadius:30,padding:"22px 30px",opacity}}><div style={{display:"grid",gridTemplateColumns:"180px 1fr 180px",alignItems:"center",direction:"ltr"}}><b style={{fontSize:58,color:homeColor(p)}}>{count(h,frame,opacity===1?18:sw+6,opacity===1?56:sw+36)}</b><div style={{fontSize:28,fontWeight:900,textAlign:"center",color:C.white}}>{label}</div><b style={{fontSize:58,color:awayColor(p),textAlign:"right"}}>{count(a,frame,opacity===1?18:sw+6,opacity===1?56:sw+36)}</b></div></Glass>;
  return <CardRoot duration={duration} background="shots-v1.webp" darken={0}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:170,left:60,right:60,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>التسديدات</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",marginTop:24,direction:"ltr"}}><TeamBadge p={p} side="home" size={128}/><TeamBadge p={p} side="away" size={128}/></div></div>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0,opacity:arrowOpacity}}>
      <defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill={homeColor(p)}/></marker><marker id="aa" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill={awayColor(p)}/></marker></defs>
      {Array.from({length:hCount}).map((_,i)=>{const sx=65+(i%5)*42,sy=1390-(i%3)*62,ex=320+(i*67)%360,ey=760+(i*31)%170;return <path key={`h${i}`} d={`M${sx},${sy} Q${260+i*18},${1120-i*8} ${ex},${ey}`} fill="none" stroke={homeColor(p)} strokeWidth="6" strokeLinecap="round" markerEnd="url(#ah)" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-shotProgress)} opacity={.9}/>})}
      {Array.from({length:aCount}).map((_,i)=>{const sx=1015-(i%5)*42,sy=1390-(i%3)*58,ex=760-(i*63)%360,ey=760+(i*29)%170;return <path key={`a${i}`} d={`M${sx},${sy} Q${820-i*18},${1120-i*7} ${ex},${ey}`} fill="none" stroke={awayColor(p)} strokeWidth="6" strokeLinecap="round" markerEnd="url(#aa)" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-shotProgress)} opacity={.9}/>})}
    </svg>
    <div style={{position:"absolute",left:270,top:665,width:540,height:335,opacity:p2}}>
      {Array.from({length:hT}).map((_,i)=><div key={`dh${i}`} style={{position:"absolute",width:34,height:34,borderRadius:99,border:`5px solid ${homeColor(p)}`,left:40+(i*73)%410,top:32+(i*61)%230,transform:`scale(${ballProgress})`,boxShadow:`0 0 28px ${homeColor(p)}`}}/>)}
      {Array.from({length:aT}).map((_,i)=><div key={`da${i}`} style={{position:"absolute",width:34,height:34,borderRadius:99,border:`5px solid ${awayColor(p)}`,left:62+(i*83)%390,top:48+(i*57)%210,transform:`scale(${ballProgress})`,boxShadow:`0 0 28px ${awayColor(p)}`}}/>)}
    </div>
    {statRow("إجمالي التسديدات",hv,av,arrowOpacity)}
    {statRow("التسديدات على المرمى",ht,at,p2)}
  </CardRoot>;
};
