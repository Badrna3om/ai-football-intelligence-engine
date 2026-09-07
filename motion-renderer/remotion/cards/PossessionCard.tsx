import React from "react";
import {interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,Glass,Header,MatchProps,TeamBadge,awayColor,count,homeColor,n} from "./shared";

const topNodes=[[235,560],[360,640],[515,575],[660,685],[785,590],[450,790],[690,820]];
const bottomNodes=[[250,1130],[390,1240],[535,1160],[700,1270],[820,1160],[430,1390],[690,1430]];
const edges=[[0,1],[1,2],[2,3],[3,4],[1,5],[5,3],[3,6],[6,4],[0,5]];

export const PossessionCard:React.FC<{p:MatchProps;story:any;duration:number}> = ({p,story,duration}) => {
  const frame=useCurrentFrame();const hv=n(story.homeValue),av=n(story.awayValue),sum=Math.max(1,hv+av),hp=hv/sum*100;
  const routeP=interpolate(frame,[14,76],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});const barP=interpolate(frame,[26,76],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const network=(nodes:number[][],color:string,prefix:string)=><>{edges.map(([a,b],i)=>{const [x1,y1]=nodes[a],[x2,y2]=nodes[b];return <path key={`${prefix}e${i}`} d={`M${x1},${y1} Q${(x1+x2)/2+((i%2)?24:-24)},${(y1+y2)/2} ${x2},${y2}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-routeP)} opacity={.72}/>})}{nodes.map(([x,y],i)=><circle key={`${prefix}n${i}`} cx={x} cy={y} r={11+(i%3)} fill="rgba(5,15,24,.92)" stroke={color} strokeWidth="5" opacity={Math.min(1,routeP*1.4)} style={{filter:`drop-shadow(0 0 10px ${color})`}}/>)}</>;
  return <CardRoot duration={duration} background="possession-v2.webp" darken={0}>
    <Header p={p} label="الاستحواذ"/>
    <div style={{position:"absolute",top:190,left:85}}><TeamBadge p={p} side="away" size={118}/></div>
    <div style={{position:"absolute",bottom:170,right:85}}><TeamBadge p={p} side="home" size={118}/></div>
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:"absolute",inset:0}}>
      {network(topNodes,awayColor(p),"a")}{network(bottomNodes,homeColor(p),"h")}
    </svg>
    <Glass style={{position:"absolute",left:165,right:165,top:885,borderRadius:999,padding:"13px 18px",borderColor:"rgba(255,255,255,.2)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",direction:"ltr",gap:18}}><b style={{fontSize:46,color:homeColor(p),width:110,textAlign:"left"}}>{count(hv,frame,24,70)}%</b><div style={{height:42,borderRadius:999,overflow:"hidden",background:"rgba(255,255,255,.08)",display:"flex",direction:"ltr",flex:1}}><div style={{width:`${hp*barP}%`,background:`linear-gradient(90deg,${homeColor(p)}88,${homeColor(p)})`,boxShadow:`0 0 30px ${homeColor(p)}66`}}/><div style={{width:`${(100-hp)*barP}%`,background:`linear-gradient(90deg,${awayColor(p)},${awayColor(p)}88)`,boxShadow:`0 0 30px ${awayColor(p)}66`}}/></div><b style={{fontSize:46,color:awayColor(p),width:110,textAlign:"right"}}>{count(av,frame,24,70)}%</b></div>
    </Glass>
    <div style={{position:"absolute",top:820,left:0,right:0,textAlign:"center",fontSize:24,fontWeight:900,color:C.white}}>شبكة السيطرة والتمرير</div>
  </CardRoot>;
};
