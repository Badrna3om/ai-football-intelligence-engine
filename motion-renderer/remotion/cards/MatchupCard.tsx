import React from "react";
import {useCurrentFrame} from "remotion";
import {CardRoot,Competition,C,Glass,Header,MatchProps,TeamBadge,fade,rise} from "./shared";

export const MatchupCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  const info=(label:string,value:any,start:number)=><Glass style={{borderRadius:24,padding:"18px 24px",opacity:fade(frame,start,start+16),transform:`translateY(${rise(frame,start,start+18,28)}px)`}}><div style={{fontSize:16,color:C.muted}}>{label}</div><div style={{fontSize:27,fontWeight:900,marginTop:4}}>{value||"—"}</div></Glass>;
  const hr=p.match?.home?.rank??p.match?.homeRank??"—";const ar=p.match?.away?.rank??p.match?.awayRank??"—";
  return <CardRoot duration={duration} background="matchup-v1.webp" darken={.04}>
    <Header p={p} label="المواجهة" showCompetition={false}/>
    <div style={{position:"absolute",top:150,left:54,right:54,textAlign:"center"}}>
      <Competition p={p} large animated/>
      <div style={{fontSize:50,fontWeight:950,marginTop:22}}>الجولة {p.round}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 120px 1fr",alignItems:"center",direction:"ltr",marginTop:50}}>
        <TeamBadge p={p} side="away" size={250}/><div style={{fontSize:72,fontWeight:950}}>×</div><TeamBadge p={p} side="home" size={250}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:42,textAlign:"right"}}>
        {info("الملعب",p.match?.venue,54)}
        {info("الحكم",p.match?.referee,62)}
        {info("الترتيب",`${p.awayTeam} #${ar}   •   ${p.homeTeam} #${hr}`,70)}
      </div>
    </div>
  </CardRoot>;
};
