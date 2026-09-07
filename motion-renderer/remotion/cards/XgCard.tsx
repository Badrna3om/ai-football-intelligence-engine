import React from "react";
import {interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,TeamBadge,awayColor,count,homeColor,n} from "./shared";

export const XgCard:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();const hv=n(story.homeValue),av=n(story.awayValue),max=Math.max(2.5,hv,av);const pr=interpolate(frame,[18,72],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const row=(side:"home"|"away",value:number)=>{const color=side==="home"?homeColor(p):awayColor(p);return <Glass style={{borderRadius:28,padding:"22px 28px",borderColor:`${color}44`}}><div style={{display:"grid",gridTemplateColumns:"160px 1fr 150px",alignItems:"center",gap:22,direction:"ltr"}}><TeamBadge p={p} side={side} size={108} showName={false}/><div><div style={{fontSize:25,fontWeight:900,textAlign:"right",direction:"rtl"}}>{side==="home"?p.homeTeam:p.awayTeam}</div><div style={{height:28,borderRadius:999,background:"rgba(255,255,255,.08)",overflow:"hidden",marginTop:14}}><div style={{height:"100%",width:`${Math.min(100,(value/max)*100*pr)}%`,background:`linear-gradient(90deg,${color}66,${color})`,boxShadow:`0 0 26px ${color}55`}}/></div></div><b style={{fontSize:62,color,textAlign:"center"}}>{count(value,frame,20,70,2)}</b></div></Glass>};
  return <CardRoot duration={duration} background="xg-v1.webp" darken={0}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:180,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الأهداف المتوقعة</div><div style={{fontSize:24,color:C.muted,marginTop:6}}>EXPECTED GOALS • xG</div></div>
    <div style={{position:"absolute",top:520,left:90,right:90,display:"flex",flexDirection:"column",gap:28}}>{row("home",hv)}{row("away",av)}</div>
    <div style={{position:"absolute",left:120,right:120,bottom:220,textAlign:"center",fontSize:20,color:C.muted}}>مقياس احتمالية التسجيل بناءً على جودة الفرص</div>
  </CardRoot>;
};
