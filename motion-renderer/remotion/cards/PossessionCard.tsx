import React from "react";
import {interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,TeamBadge,awayColor,count,homeColor,n} from "./shared";

export const PossessionCard:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();const hv=n(story.homeValue),av=n(story.awayValue),sum=Math.max(1,hv+av),hp=hv/sum*100;
  const routeP=interpolate(frame,[12,72],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});const barP=interpolate(frame,[28,74],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const hc=Math.max(4,Math.min(12,Math.round(hv/7))),ac=Math.max(4,Math.min(12,Math.round(av/7)));
  return <CardRoot duration={duration} background="possession-v1.webp" darken={0}>
    <Header p={p} label="إحصائيات المباراة"/>
    <div style={{position:"absolute",top:165,left:0,right:0,textAlign:"center"}}><div style={{fontSize:62,fontWeight:950}}>الاستحواذ</div><div style={{fontSize:20,color:C.muted,marginTop:5}}>POSSESSION</div></div>
    <div style={{position:"absolute",top:345,left:80,right:80,display:"grid",gridTemplateRows:"1fr 1fr",height:1120}}><div style={{alignSelf:"start",justifySelf:"start"}}><TeamBadge p={p} side="away" size={110}/></div><div style={{alignSelf:"end",justifySelf:"end"}}><TeamBadge p={p} side="home" size={110}/></div></div>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0}}>
      {Array.from({length:ac}).map((_,i)=>{const x1=210+(i*61)%320,y1=540+(i*83)%390,x2=390+(i*89)%300,y2=590+(i*117)%370;return <path key={`a${i}`} d={`M${x1},${y1} Q${(x1+x2)/2+30},${(y1+y2)/2-50} ${x2},${y2}`} fill="none" stroke={awayColor(p)} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-routeP)} opacity={.72}/>})}
      {Array.from({length:hc}).map((_,i)=>{const x1=850-(i*59)%320,y1=1060+(i*79)%360,x2=690-(i*87)%300,y2=1090+(i*113)%340;return <path key={`h${i}`} d={`M${x1},${y1} Q${(x1+x2)/2-30},${(y1+y2)/2+45} ${x2},${y2}`} fill="none" stroke={homeColor(p)} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-routeP)} opacity={.72}/>})}
    </svg>
    <Glass style={{position:"absolute",left:80,right:80,bottom:76,borderRadius:30,padding:"24px 30px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",direction:"ltr"}}><div><b style={{fontSize:64,color:homeColor(p)}}>{count(hv,frame,24,70)}%</b><div style={{fontSize:20}}>{p.homeTeam}</div></div><div style={{textAlign:"right"}}><b style={{fontSize:64,color:awayColor(p)}}>{count(av,frame,24,70)}%</b><div style={{fontSize:20}}>{p.awayTeam}</div></div></div>
      <div style={{height:42,borderRadius:999,overflow:"hidden",background:"rgba(255,255,255,.08)",display:"flex",direction:"ltr",marginTop:20}}><div style={{width:`${hp*barP}%`,background:`linear-gradient(90deg,${homeColor(p)}88,${homeColor(p)})`,boxShadow:`0 0 28px ${homeColor(p)}55`}}/><div style={{width:`${(100-hp)*barP}%`,background:`linear-gradient(90deg,${awayColor(p)},${awayColor(p)}88)`,boxShadow:`0 0 28px ${awayColor(p)}55`}}/></div>
    </Glass>
  </CardRoot>;
};
