import React from "react";
import {Img,interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,awayBadge,awayColor,count,fade,homeBadge,homeColor,n} from "./shared";

export const BigChancesCard:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();
  const hv=Math.max(0,Math.round(n(story.homeValue))),av=Math.max(0,Math.round(n(story.awayValue)));
  const teamChip=(side:"home"|"away",top:number)=>{const badge=side==="home"?homeBadge(p):awayBadge(p),color=side==="home"?homeColor(p):awayColor(p),name=side==="home"?p.homeTeam:p.awayTeam,value=side==="home"?hv:av;return <Glass style={{position:"absolute",top,left:340,width:400,borderRadius:26,padding:"12px 20px",display:"grid",gridTemplateColumns:"90px 1fr 80px",alignItems:"center",gap:14,direction:"rtl",borderColor:`${color}77`,opacity:fade(frame,8,28)}}>{badge&&<Img src={badge} style={{width:78,height:78,objectFit:"contain"}}/>}<div><b style={{fontSize:27}}>{name}</b><div style={{fontSize:17,color}}>الفرص الكبيرة</div></div><b style={{fontSize:56,color,textAlign:"center"}}>{count(value,frame,34,76)}</b></Glass>};
  const dots=(value:number,side:"home"|"away")=>Array.from({length:Math.min(12,value)}).map((_,i)=>{const topHalf=side==="away";const color=topHalf?awayColor(p):homeColor(p);const x=285+((i*103+55)%510),y=topHalf?520+((i*73+25)%280):1130+((i*71+45)%285);const start=28+i*5;const sc=interpolate(frame,[start,start+14],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});const pulse=.9+.1*Math.sin((frame-i*4)/5);return <div key={`${side}${i}`} style={{position:"absolute",left:x,top:y,width:42,height:42,borderRadius:99,background:color,transform:`scale(${sc*pulse})`,boxShadow:`0 0 14px ${color},0 0 42px ${color}`,border:"2px solid rgba(255,255,255,.55)"}}/>});
  return <CardRoot duration={duration} background="big-chances-v2.webp" darken={0}>
    <Header p={p} label="الفرص الكبيرة"/>
    {teamChip("away",245)}
    {teamChip("home",1470)}
    {dots(av,"away")}{dots(hv,"home")}
    <div style={{position:"absolute",top:430,left:0,right:0,textAlign:"center",fontSize:19,color:C.muted,opacity:fade(frame,12,30)}}>كل نقطة مضيئة = فرصة كبيرة</div>
  </CardRoot>;
};
