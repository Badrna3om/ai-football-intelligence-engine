import React from "react";
import {Img,interpolate,useCurrentFrame} from "remotion";
import {CardRoot,C,GoldShimmer,Glass,Header,MatchProps,PositionAr,TeamBadge,awayColor,count,fade,homeColor} from "./shared";

const statLabels:Record<string,string>={"Key Passes":"تمريرات مفتاحية","Big Chances Created":"فرص كبيرة صنعها","Assists":"تمريرات حاسمة","Total Shots":"تسديدات","Expected Assists":"xA"};

export const StarPlayerCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();const s=p.starPlayer||{};const st=s.stats||{};const side:String=String(s.team||"")===String(p.homeTeam||"")?"home":"away";const color=side==="home"?homeColor(p):awayColor(p);const photo=s.photoUrl||p.assets?.starPlayerPhotoUrl;
  const playerY=interpolate(frame,[0,24,Math.max(25,duration-18),duration],[120,0,0,100],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const playerOpacity=interpolate(frame,[0,16,Math.max(17,duration-14),duration],[0,1,1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
  const stats=Object.keys(statLabels).filter((k)=>st[k]!=null).slice(0,4);
  return <CardRoot duration={duration} background="star-player-v1.webp" darken={0}>
    <Header p={p} label="نجم المباراة"/>
    <div style={{position:"absolute",left:18,top:250,width:505,height:1420,opacity:playerOpacity,transform:`translateY(${playerY}px)`}}>{photo&&<Img src={photo} style={{position:"absolute",left:-20,bottom:0,width:"112%",height:"95%",objectFit:"contain",objectPosition:"center bottom",filter:"drop-shadow(0 30px 40px rgba(0,0,0,.5))"}}/>}</div>
    <div style={{position:"absolute",top:245,left:515,right:60,direction:"rtl"}}>
      <div style={{display:"flex",justifyContent:"flex-start",opacity:fade(frame,12,30)}}><TeamBadge p={p} side={side as any} size={125}/></div>
      <div style={{marginTop:24,opacity:fade(frame,20,38)}}><div style={{fontSize:52,fontWeight:950,lineHeight:1.18}}>{s.name||s.nameEn||"نجم المباراة"}</div><div style={{fontSize:21,color:C.muted,marginTop:10}}>{s.team||""} • {PositionAr(s.position||s.positionGroup)}</div></div>
      <div style={{display:"flex",alignItems:"center",gap:18,marginTop:34,opacity:fade(frame,28,46)}}><div style={{width:146,height:146,borderRadius:999,border:`3px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:58,fontWeight:950,color,boxShadow:`0 0 30px ${color}55`}}>{count(s.rating||0,frame,32,70,1)}</div><div><div style={{fontSize:18,color:C.muted}}>التقييم</div><b style={{fontSize:24}}>أفضل لاعب في المباراة</b></div></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:38}}>{stats.map((k,i)=><Glass key={k} style={{borderRadius:22,padding:"18px 16px",minHeight:150,opacity:fade(frame,42+i*8,58+i*8),borderColor:`${color}33`}}><div style={{fontSize:17,color:C.muted}}>{statLabels[k]}</div><div style={{fontSize:50,fontWeight:950,color:i%2?C.cyan:C.gold,marginTop:8}}>{count(st[k],frame,46+i*8,76+i*8)}</div></Glass>)}</div>
    </div>
    <GoldShimmer opacity={.22}/>
  </CardRoot>;
};
