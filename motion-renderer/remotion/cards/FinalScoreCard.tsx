import React from "react";
import {CardRoot,Competition,C,Glass,Header,MatchProps,Score,TeamBadge,awayColor,homeColor} from "./shared";

const countSide=(items:any[],side:string)=>items.filter((x)=>String(x.teamSide||x.side).toLowerCase()===side).length;

export const FinalScoreCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const cards=p.cards||p.match?.cards||[];const subs=p.substitutions||p.match?.substitutions||[];
  return <CardRoot duration={duration} background="final-score-v1.webp" darken={.03}>
    <Header p={p} label="النتيجة النهائية" showCompetition={false}/>
    <div style={{position:"absolute",top:170,left:48,right:48,textAlign:"center"}}>
      <Competition p={p} large animated/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 240px 1fr",alignItems:"center",direction:"ltr",marginTop:32}}>
        <TeamBadge p={p} side="home" size={190}/><Score p={p} size={96}/><TeamBadge p={p} side="away" size={190}/>
      </div>
      <Glass style={{borderRadius:28,padding:"18px 22px",marginTop:28,textAlign:"right"}}>
        <div style={{fontSize:18,color:C.muted,marginBottom:12}}>الهدافون</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{(p.goals||[]).slice(0,6).map((g:any,i:number)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",borderRadius:14,background:"rgba(255,255,255,.035)"}}><b style={{fontSize:21}}>{g.scorer}</b><span style={{fontSize:19,color:String(g.teamSide).toLowerCase()==="home"?homeColor(p):awayColor(p)}}>{g.displayMinute}</span></div>)}</div>
      </Glass>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:14,direction:"ltr"}}>
        <Glass style={{borderRadius:22,padding:"18px 20px",borderColor:`${homeColor(p)}44`}}><b style={{fontSize:22}}>{p.homeTeam}</b><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}><div><span style={{color:C.muted}}>الكروت</span><strong style={{display:"block",fontSize:40,color:homeColor(p)}}>{countSide(cards,"home")}</strong></div><div><span style={{color:C.muted}}>التبديلات</span><strong style={{display:"block",fontSize:40,color:homeColor(p)}}>{countSide(subs,"home")}</strong></div></div></Glass>
        <Glass style={{borderRadius:22,padding:"18px 20px",borderColor:`${awayColor(p)}44`}}><b style={{fontSize:22}}>{p.awayTeam}</b><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}><div><span style={{color:C.muted}}>الكروت</span><strong style={{display:"block",fontSize:40,color:awayColor(p)}}>{countSide(cards,"away")}</strong></div><div><span style={{color:C.muted}}>التبديلات</span><strong style={{display:"block",fontSize:40,color:awayColor(p)}}>{countSide(subs,"away")}</strong></div></div></Glass>
      </div>
    </div>
  </CardRoot>;
};
