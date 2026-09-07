import React from "react";
import {useCurrentFrame} from "remotion";
import {Brand,CardRoot,Competition,C,MatchProps,rise} from "./shared";

export const IntroCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  return <CardRoot duration={duration} background="intro-v1.webp" darken={.03}>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <div style={{transform:`translateY(${rise(frame,0,24,40)}px)`}}><Brand p={p} large animated/></div>
      <div style={{height:96}}/>
      <Competition p={p} large animated name={false}/>
      <div style={{height:38}}/>
      <div style={{fontSize:26,color:C.muted}}>الجولة {p.round} • {p.competition}</div>
      <div style={{height:58}}/>
      <div style={{fontSize:72,fontWeight:950,lineHeight:1.28,maxWidth:900,transform:`translateY(${rise(frame,34,62,42)}px)`}}>{p.introHeadline||`${p.homeTeam} × ${p.awayTeam}`}</div>
      <div style={{width:230,height:5,borderRadius:8,marginTop:36,background:"linear-gradient(90deg,#E7C264,#22D4FF)"}}/>
    </div>
  </CardRoot>;
};
