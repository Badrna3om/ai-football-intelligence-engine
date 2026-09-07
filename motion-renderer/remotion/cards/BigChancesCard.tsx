import React from "react";
import {Img,interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,awayBadge,awayColor,count,fade,homeBadge,homeColor,n} from "./shared";

export const BigChancesCard:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();const hv=Math.max(0,Math.round(n(story.homeValue))),av=Math.max(0,Math.round(n(story.awayValue)));
  const teamTag=(side:"home"|"away",top:number,left:number)=>{const badge=side==="home"?homeBadge(p):awayBadge(p),color=side==="home"?homeColor(p):awayColor(p),name=side==="home"?p.homeTeam:p.awayTeam;return <Glass style={{position:"absolute",top,left,width:290,borderRadius:24,padding:"12px 16px",display:"flex",alignItems:"center",gap:14,direction:"rtl",borderColor:`${color}55`,opacity:fade(frame,8,28)}}>{badge&&<Img src={badge} style={{width:72,height:72,objectFit:"contain"}}/>}<div><b style={{fontSize:24}}>{name}</b><div style={{fontSize:17,color}}>الفرص الكبيرة</div></div></Glass>};
  const dots=(countValue:number,side:"home"|"away")=>Array.from({length:Math.min(12,countValue)}).map((_,i)=>{const topHalf=side==="away";const color=topHalf?awayColor(p):homeColor(p);const x=300+((i*97+55)%480),y=topHalf?430+((i*71+30)%235):1260+((i*67+45)%225);const start=24+i*5;const sc=interpolate(frame,[start,start+14],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});const pulse=.92+.08*Math.sin((frame-i*4)/5);return <div key={`${side}${i}`} style={{position:"absolute",left:x,top:y,width:38,height:38,borderRadius:99,background:color,transform:`scale(${sc*pulse})`,boxShadow:`0 0 12px ${color},0 0 34px ${color}`,border:"2px solid rgba(255,255,255,.45)"}}/>});
  return <CardRoot duration={duration} background="big-chances-v1.webp" darken={0}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:165,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الفرص الكبيرة</div><div style={{fontSize:20,color:C.muted,marginTop:5}}>BIG CHANCES</div></div>
    {teamTag("away",420,155)}{teamTag("home",1370,635)}
    {dots(av,"away")}{dots(hv,"home")}
    <Glass style={{position:"absolute",left:100,right:100,bottom:75,borderRadius:30,padding:"20px 28px"}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",direction:"ltr"}}><div style={{textAlign:"center",borderRight:`1px solid ${C.line}`}}><b style={{fontSize:72,color:homeColor(p)}}>{count(hv,frame,42,82)}</b><div style={{fontSize:22}}>{p.homeTeam}</div></div><div style={{textAlign:"center"}}><b style={{fontSize:72,color:awayColor(p)}}>{count(av,frame,42,82)}</b><div style={{fontSize:22}}>{p.awayTeam}</div></div></div></Glass>
  </CardRoot>;
};
