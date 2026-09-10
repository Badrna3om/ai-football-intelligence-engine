import React from "react";
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {z} from "zod";

export const tacticMatchPresentationLayeredSchema = z.object({
  competitionName:z.string(), roundLabel:z.string(), dateLabel:z.string(), timeLabel:z.string(),
  homeName:z.string(), awayName:z.string(), homeLogo:z.string(), awayLogo:z.string(),
  homePrimary:z.string(), awayPrimary:z.string(), homeSecondary:z.string().optional(), awaySecondary:z.string().optional(),
  venue:z.string(), referee:z.string(), homeRank:z.union([z.string(),z.number()]).optional(), awayRank:z.union([z.string(),z.number()]).optional(),
  neutralBackground:z.string().optional(), tacticLogo:z.string().optional(),
});
export type MatchPresentationProps=z.infer<typeof tacticMatchPresentationLayeredSchema>;

export const defaultMatchPresentationProps:MatchPresentationProps={
  competitionName:"دوري روشن السعودي",roundLabel:"الجولة 6",dateLabel:"9 سبتمبر 2026",timeLabel:"9:00 م",
  homeName:"النصر",awayName:"أبها",homeLogo:"/assets/alnassr.png",awayLogo:"/assets/abha.png",
  homePrimary:"#F2C521",awayPrimary:"#2D9CFF",homeSecondary:"#0B2A66",awaySecondary:"#8D243D",
  venue:"الأول بارك",referee:"شكري الحنفوش",homeRank:2,awayRank:18,
  tacticLogo:"/assets/tactic-sport.png",
};

const fade=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
const rgba=(hex:string,a:number)=>{const h=hex.replace("#","");const n=parseInt(h.length===3?h.split("").map(x=>x+x).join(""):h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};
const StadiumIcon=({color}:{color:string})=><svg width="48" height="48" viewBox="0 0 48 48"><ellipse cx="24" cy="14" rx="17" ry="8" fill="none" stroke={color} strokeWidth="2.6"/><ellipse cx="24" cy="14" rx="9" ry="4" fill="none" stroke={color} strokeWidth="2"/><path d="M7 14v17c0 5 34 5 34 0V14M12 20v12M18 22v12M24 22v13M30 22v12M36 20v12" fill="none" stroke={color} strokeWidth="2.2"/></svg>;
const WhistleIcon=({color}:{color:string})=><svg width="48" height="48" viewBox="0 0 48 48"><circle cx="18" cy="28" r="9" fill="none" stroke={color} strokeWidth="2.8"/><path d="M25 24l16-8v8l-14 7M10 18l7 5" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export const TacticMatchPresentationLayered:React.FC<MatchPresentationProps>=(p)=>{
 const f=useCurrentFrame(); const {fps}=useVideoConfig();
 const enter=spring({frame:f,fps,config:{damping:18,stiffness:90,mass:.8}});
 const card=spring({frame:f-38,fps,config:{damping:20,stiffness:85,mass:.9}});
 const info=fade(f,54,70); const exit=interpolate(f,[205,225],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});
 const show=enter*exit;
 return <AbsoluteFill style={{fontFamily:"Cairo, Noto Sans Arabic, sans-serif",color:"white",overflow:"hidden",background:"#05090c",direction:"rtl"}}>
   {/* Layer 0: neutral background only. Never contains team identity. */}
   {p.neutralBackground?<Img src={p.neutralBackground} style={{position:"absolute",width:"100%",height:"100%",objectFit:"cover",filter:"brightness(.28) blur(1px)",transform:"scale(1.04)"}}/>:<AbsoluteFill style={{background:"radial-gradient(circle at 50% 40%,#182027 0%,#080d11 52%,#020405 100%)"}}/>}
   <AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.05) 55%,rgba(0,0,0,.62))"}}/>
   {/* Layer 1: dynamic team tints. Low opacity by design. */}
   <div style={{position:"absolute",inset:0,right:"50%",background:`radial-gradient(circle at 90% 45%,${rgba(p.homePrimary,.16)},transparent 58%),linear-gradient(90deg,${rgba(p.homePrimary,.14)},transparent 82%)`}}/>
   <div style={{position:"absolute",inset:0,left:"50%",background:`radial-gradient(circle at 10% 45%,${rgba(p.awayPrimary,.16)},transparent 58%),linear-gradient(270deg,${rgba(p.awayPrimary,.14)},transparent 82%)`}}/>
   {/* Layer 2: giant watermark logos, supplied per match. */}
   <Img src={p.homeLogo} style={{position:"absolute",width:560,height:560,objectFit:"contain",left:-165,top:265,opacity:.13,filter:`drop-shadow(0 0 24px ${rgba(p.homePrimary,.22)})`}}/>
   <Img src={p.awayLogo} style={{position:"absolute",width:560,height:560,objectFit:"contain",right:-165,top:265,opacity:.13,filter:`drop-shadow(0 0 24px ${rgba(p.awayPrimary,.22)})`}}/>
   {/* Layer 3: center separator, dynamic gradient only. */}
   <div style={{position:"absolute",top:355,left:539,width:2,height:430,opacity:.75,background:`linear-gradient(${p.homePrimary},rgba(255,255,255,.7),${p.awayPrimary})`,boxShadow:`0 0 18px ${rgba(p.homePrimary,.35)},0 0 24px ${rgba(p.awayPrimary,.25)}`}}/>
   <div style={{position:"absolute",top:610,left:523,width:34,textAlign:"center",fontSize:38,opacity:.9}}>×</div>
   {/* Layer 4: header and match identity. */}
   {p.tacticLogo&&<Img src={p.tacticLogo} style={{position:"absolute",top:34,right:52,width:245,opacity:.92}}/>}
   <div style={{position:"absolute",top:92,left:205,width:670,height:74,border:`1.5px solid ${rgba(p.homePrimary,.78)}`,borderRadius:10,background:"rgba(4,12,18,.72)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:35,opacity:show}}>{p.competitionName}</div>
   <div style={{position:"absolute",top:184,width:"100%",textAlign:"center",fontSize:31,fontWeight:800,color:p.homePrimary,opacity:show}}>{p.roundLabel}</div>
   <div style={{position:"absolute",top:235,width:"100%",textAlign:"center",fontSize:73,fontWeight:900,opacity:show}}>المواجهة</div>
   {/* Layer 5: hero logos + names. */}
   <div style={{position:"absolute",top:385,left:105,width:350,textAlign:"center",transform:`translateX(${(1-enter)*-80}px)`,opacity:show}}><Img src={p.homeLogo} style={{width:285,height:285,objectFit:"contain"}}/><div style={{fontSize:51,fontWeight:900,color:p.homePrimary,marginTop:18}}>{p.homeName}</div></div>
   <div style={{position:"absolute",top:385,right:105,width:350,textAlign:"center",transform:`translateX(${(1-enter)*80}px)`,opacity:show}}><Img src={p.awayLogo} style={{width:285,height:285,objectFit:"contain"}}/><div style={{fontSize:51,fontWeight:900,color:p.awayPrimary,marginTop:18}}>{p.awayName}</div></div>
   <div style={{position:"absolute",top:785,width:"100%",textAlign:"center",fontSize:32,opacity:show}}>{p.dateLabel}</div>
   <div style={{position:"absolute",top:838,width:"100%",textAlign:"center",fontSize:36,fontWeight:900,color:p.homePrimary,opacity:show}}>{p.timeLabel}</div>
   {/* Layer 6: information card. It is structural; no team pixels baked in. */}
   <div style={{position:"absolute",left:55,top:925,width:970,height:600,border:"1.5px solid rgba(230,240,245,.68)",borderRadius:28,background:"linear-gradient(180deg,rgba(4,12,17,.88),rgba(4,10,14,.76))",boxShadow:"0 24px 70px rgba(0,0,0,.42)",transform:`translateY(${(1-card)*90}px) scale(${.97+.03*card})`,opacity:card*exit,overflow:"hidden"}}>
     <div style={{position:"absolute",left:0,top:88,bottom:28,width:8,borderRadius:8,background:p.homePrimary}}/><div style={{position:"absolute",right:0,top:88,bottom:28,width:8,borderRadius:8,background:p.awayPrimary}}/>
     <div style={{fontSize:43,fontWeight:900,textAlign:"center",paddingTop:45}}>معلومات المباراة</div>
     <div style={{position:"absolute",top:155,left:44,right:44,height:190,border:"1px solid rgba(255,255,255,.28)",borderRadius:18,opacity:info}}>
       <div style={{height:94,borderBottom:"1px solid rgba(255,255,255,.25)",display:"flex",alignItems:"center",padding:"0 32px",gap:18}}><StadiumIcon color={p.homePrimary}/><b style={{fontSize:31,color:p.homePrimary}}>الملعب</b><span style={{marginRight:"auto",fontSize:30}}>{p.venue}</span></div>
       <div style={{height:94,display:"flex",alignItems:"center",padding:"0 32px",gap:18}}><WhistleIcon color={p.awayPrimary}/><b style={{fontSize:31,color:p.awayPrimary}}>الحكم</b><span style={{marginRight:"auto",fontSize:30}}>{p.referee}</span></div>
     </div>
     <div style={{position:"absolute",top:385,width:"100%",textAlign:"center",fontSize:29,opacity:info}}>الترتيب قبل المباراة</div>
     <div style={{position:"absolute",top:452,left:52,width:395,height:104,border:`1.5px solid ${rgba(p.homePrimary,.9)}`,borderRadius:18,display:"flex",alignItems:"center",padding:"0 24px",gap:18,opacity:info}}><Img src={p.homeLogo} style={{width:58,height:58,objectFit:"contain"}}/><b style={{fontSize:30,color:p.homePrimary}}>{p.homeName}</b><b style={{marginRight:"auto",fontSize:46,color:p.homePrimary}}>{p.homeRank??"—"}</b></div>
     <div style={{position:"absolute",top:452,right:52,width:395,height:104,border:`1.5px solid ${rgba(p.awayPrimary,.9)}`,borderRadius:18,display:"flex",alignItems:"center",padding:"0 24px",gap:18,opacity:info}}><Img src={p.awayLogo} style={{width:58,height:58,objectFit:"contain"}}/><b style={{fontSize:30,color:p.awayPrimary}}>{p.awayName}</b><b style={{marginRight:"auto",fontSize:46,color:p.awayPrimary}}>{p.awayRank??"—"}</b></div>
     <div style={{position:"absolute",top:458,left:"50%",height:92,width:1,background:"rgba(255,255,255,.5)"}}/>
   </div>
 </AbsoluteFill>;
};

export const calculateMatchPresentationDuration=()=>230;
