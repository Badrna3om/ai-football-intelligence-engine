import React from "react";
import {Img,OffthreadVideo,interpolate,useCurrentFrame} from "remotion";
import {CardRoot,Competition,C,FPS,Glass,Header,MatchProps,Score,awayBadge,awayColor,homeBadge,homeColor,n,t} from "./shared";

const runningScore=(goals:any[],index:number)=>{let h=0,a=0;goals.slice(0,index+1).forEach((g)=>String(g.teamSide).toLowerCase()==="home"?h++:a++);return `${h} - ${a}`};

export const GoalCard:React.FC<{p:MatchProps;goal:any;index:number;duration:number}> = ({p,goal,index,duration}) => {
  const frame=useCurrentFrame();const home=String(goal.teamSide).toLowerCase()==="home";const color=home?homeColor(p):awayColor(p);const badge=home?homeBadge(p):awayBadge(p);const start=n(goal.videoStartSeconds||goal.clipStartSeconds);
  const panelY=interpolate(frame,[8,26,duration-24,duration-1],[95,0,0,100],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  return <CardRoot duration={duration} background="goal-v1.webp" darken={.02}>
    <Header p={p} label={`الهدف ${index+1}`} showCompetition={false}/>
    <div style={{position:"absolute",top:160,left:0,right:0,display:"flex",justifyContent:"center"}}><Competition p={p} large animated name={false}/></div>
    {goal.videoUrl?<div style={{position:"absolute",top:505,left:0,right:0,height:650,overflow:"hidden",background:"#000"}}>
      <OffthreadVideo src={goal.videoUrl} startFrom={start*FPS} style={{width:"100%",height:"100%",objectFit:"contain"}}/>
    </div>:<div style={{position:"absolute",top:505,left:54,right:54,height:650,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,color:C.muted}}>لقطة الهدف غير متوفرة</div>}
    <Glass style={{position:"absolute",left:54,right:54,bottom:88,borderRadius:30,padding:"24px 28px",transform:`translateY(${panelY}px)`,borderColor:`${color}66`}}>
      <div style={{display:"grid",gridTemplateColumns:"120px 1fr 170px",alignItems:"center",direction:"ltr",gap:18}}>
        {badge&&<Img src={badge} style={{width:100,height:100,objectFit:"contain"}}/>}
        <div style={{direction:"rtl"}}><div style={{fontSize:43,fontWeight:950}}>{t(goal.scorer)}</div>{goal.assist&&<div style={{fontSize:21,color:C.muted,marginTop:7}}>صناعة: {t(goal.assist)}</div>}</div>
        <div style={{textAlign:"center"}}><div style={{fontSize:56,fontWeight:950,color}}>{t(goal.displayMinute,goal.minute?`${goal.minute}'`:"")}</div><Score p={p} score={runningScore(p.goals||[],index)} size={38}/></div>
      </div>
    </Glass>
  </CardRoot>;
};
