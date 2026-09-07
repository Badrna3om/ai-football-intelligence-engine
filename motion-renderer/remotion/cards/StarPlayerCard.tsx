import React from "react";
import {Img,interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,GoldShimmer,Glass,Header,MatchProps,PositionAr,awayColor,count,fade,homeBadge,homeColor,awayBadge} from "./shared";

const statLabels:Record<string,string>={"Key Passes":"تمريرات مفتاحية","Big Chances Created":"فرص كبيرة صنعها","Assists":"تمريرات حاسمة","Total Shots":"تسديدات","Expected Assists":"xA"};

export const StarPlayerCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();const s=p.starPlayer||{};const st=s.stats||{};const side:String=String(s.team||"")===String(p.homeTeam||"")?"home":"away";const color=side==="home"?homeColor(p):awayColor(p);const badge=side==="home"?homeBadge(p):awayBadge(p);const photo=s.photoUrl||p.assets?.starPlayerPhotoUrl;
  const playerY=interpolate(frame,[0,24,Math.max(25,duration-18),duration],[120,0,0,100],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const playerOpacity=interpolate(frame,[0,16,Math.max(17,duration-14),duration],[0,1,1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const stats=Object.keys(statLabels).filter((k)=>st[k]!=null).slice(0,4);
  return <CardRoot duration={duration} background="star-player-v2.webp" darken={0}>
    <Header p={p} label="نجم المباراة"/>
    <div style={{position:"absolute",left:5,top:205,width:545,height:1560,opacity:playerOpacity,transform:`translateY(${playerY}px)`}}>{photo&&<Img src={photo} style={{position:"absolute",left:-35,bottom:0,width:"118%",height:"98%",objectFit:"contain",objectPosition:"center bottom",filter:"drop-shadow(0 34px 48px rgba(0,0,0,.58))"}}/>}</div>
    <div style={{position:"absolute",top:250,left:530,right:55,direction:"rtl"}}>
      <div style={{height:250,display:"flex",alignItems:"center",justifyContent:"center",opacity:fade(frame,10,28)}}>{badge&&<Img src={badge} style={{width:190,height:190,objectFit:"contain",filter:`drop-shadow(0 0 28px ${color}55)`}}/>}</div>
      <div style={{textAlign:"center",marginTop:12,opacity:fade(frame,18,38)}}><div style={{fontSize:52,fontWeight:950,lineHeight:1.18}}>{s.name||s.nameEn||"نجم المباراة"}</div><div style={{fontSize:22,color:C.muted,marginTop:10}}>{s.team||""} • {PositionAr(s.position||s.positionGroup)}</div></div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginTop:42,opacity:fade(frame,28,46)}}><div><div style={{fontSize:18,color:C.muted}}>التقييم</div><b style={{fontSize:25}}>أفضل لاعب في المباراة</b></div><div style={{width:148,height:148,borderRadius:999,border:`4px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,fontWeight:950,color,boxShadow:`0 0 18px ${color},0 0 48px ${color}55`}}>{count(s.rating||0,frame,32,70,1)}</div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginTop:58}}>{stats.map((k,i)=><Glass key={k} style={{borderRadius:22,padding:"20px 16px",minHeight:170,opacity:fade(frame,42+i*8,58+i*8),borderColor:`${color}44`}}><div style={{fontSize:18,color:C.muted}}>{statLabels[k]}</div><div style={{fontSize:56,fontWeight:950,color:i%2?C.cyan:C.gold,marginTop:14}}>{count(st[k],frame,46+i*8,78+i*8)}</div></Glass>)}</div>
    </div>
    <GoldShimmer opacity={.30}/>
  </CardRoot>;
};
