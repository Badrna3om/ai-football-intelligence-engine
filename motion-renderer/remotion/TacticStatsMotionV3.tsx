import React from "react";
import {AbsoluteFill,Img,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/Cairo";
import type {MatchProps} from "./TacticMatchV6Full";

const {fontFamily:cairo}=loadFont();
const clamp={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const mix=(f:number,a:number,b:number,x:number,y:number)=>interpolate(f,[a,b],[x,y],clamp);
const ph=(f:number,a:number,b:number)=>mix(f,a,b,0,1);
const sceneOpacity=(f:number)=>ph(f,0,12)*(1-ph(f,106,120));
const CBLUE="#1591ff";
const GOLD="#e6bd54";

const getHome=(p:MatchProps)=>p.design?.homeColor||"#1154D8";
const getAway=(p:MatchProps)=>p.design?.awayColor||"#7A2048";
const homeBadge=(p:MatchProps)=>p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl||"";
const awayBadge=(p:MatchProps)=>p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl||"";
const tacticLogo=(p:MatchProps)=>p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png");
const homeName=(p:MatchProps)=>(p as any).homeTeam||p.match?.home?.name||"الفريق الأول";
const awayName=(p:MatchProps)=>(p as any).awayTeam||p.match?.away?.name||"الفريق الثاني";

const Bg:React.FC<{p:MatchProps}>=({p})=>{
 const hc=getHome(p),ac=getAway(p);
 return <AbsoluteFill style={{background:"#02070c",overflow:"hidden",fontFamily:cairo}}>
   <AbsoluteFill style={{background:`radial-gradient(circle at 10% 38%,${hc}88 0%,transparent 36%),radial-gradient(circle at 91% 43%,${ac}88 0%,transparent 38%),linear-gradient(180deg,#06111a 0%,#020609 62%,#061007 100%)`}}/>
   <div style={{position:"absolute",left:-120,top:220,width:620,height:1050,background:`linear-gradient(115deg,${hc}cc,transparent)`,clipPath:"polygon(0 15%,100% 0,54% 100%,0 88%)",opacity:.34}}/>
   <div style={{position:"absolute",right:-120,top:220,width:620,height:1050,background:`linear-gradient(245deg,${ac}d9,transparent)`,clipPath:"polygon(0 0,100% 15%,100% 88%,46% 100%)",opacity:.34}}/>
   <div style={{position:"absolute",left:90,right:90,bottom:116,height:2,background:`linear-gradient(90deg,transparent,${GOLD},#fff2b0,${GOLD},transparent)`,boxShadow:`0 0 20px ${GOLD}`}}/>
   <div style={{position:"absolute",left:-20,right:-20,bottom:0,height:460,background:"radial-gradient(ellipse at 50% 100%,rgba(28,73,18,.7),transparent 65%)"}}/>
 </AbsoluteFill>;
};

const Brand:React.FC<{p:MatchProps}>=({p})=><Img src={tacticLogo(p)} style={{position:"absolute",left:52,top:58,width:390,height:150,objectFit:"contain",objectPosition:"left center",zIndex:50,filter:"drop-shadow(0 14px 30px rgba(0,0,0,.55))"}}/>;

const Header:React.FC<{title:string;sub?:string;f:number}>=({title,sub,f})=>{
 const e=spring({frame:f,fps:30,config:{damping:16,stiffness:110,mass:.72}});
 return <div dir="rtl" style={{position:"absolute",right:95,top:210,width:690,zIndex:30,transform:`translateY(${(1-e)*-30}px)`,opacity:ph(f,0,14),textAlign:"right"}}>
   <div style={{fontSize:76,fontWeight:900,color:"white",lineHeight:1.05,textShadow:"0 8px 30px rgba(0,0,0,.72)"}}>{title}</div>
   {sub?<div style={{fontSize:31,fontWeight:800,color:GOLD,marginTop:2}}>{sub}</div>:null}
   <div style={{height:3,marginTop:18,background:`linear-gradient(90deg,transparent 0%,${GOLD} 22%,#fff1a5 52%,${GOLD} 76%,transparent 100%)`,transform:`scaleX(${ph(f,5,28)})`,transformOrigin:"right",boxShadow:`0 0 16px ${GOLD}`}}/>
 </div>;
};

const TeamValue:React.FC<{side:"home"|"away";p:MatchProps;value:number|string;suffix?:string;f:number}>=({side,p,value,suffix="",f})=>{
 const isHome=side==="home",src=isHome?homeBadge(p):awayBadge(p),name=isHome?homeName(p):awayName(p),accent=isHome?getHome(p):getAway(p);
 const e=spring({frame:Math.max(0,f-8),fps:30,config:{damping:16,stiffness:120,mass:.75}});
 const numeric=typeof value==="number"?value:Number(value)||0;
 const shown=typeof value==="number"?Math.round(numeric*ph(f,14,52)*100)/100:value;
 return <div style={{position:"absolute",top:360,left:isHome?95:575,width:410,textAlign:"center",zIndex:25,opacity:ph(f,4,18),transform:`translateX(${(1-e)*(isHome?-50:50)}px)`}}>
   <Img src={src} style={{width:210,height:210,objectFit:"contain",filter:`drop-shadow(0 20px 35px rgba(0,0,0,.62)) drop-shadow(0 0 12px ${accent}66)`}}/>
   <div style={{fontSize:150,lineHeight:1,fontWeight:900,color:"white",letterSpacing:-5,textShadow:`0 4px 0 ${accent},0 0 22px ${accent}`}}>{shown}{suffix}</div>
   <div dir="rtl" style={{fontSize:39,fontWeight:900,color:"white",marginTop:8,textShadow:"0 8px 25px rgba(0,0,0,.75)"}}>{name}</div>
 </div>;
};

const MidDivider=()=> <div style={{position:"absolute",left:539,top:410,width:2,height:420,background:`linear-gradient(180deg,transparent,${GOLD},transparent)`,opacity:.72}}/>;

const GoalFrame:React.FC<{children?:React.ReactNode}>=({children})=><div style={{position:"absolute",left:105,top:930,width:870,height:410,zIndex:15}}>
 <svg viewBox="0 0 870 410" width="100%" height="100%" style={{overflow:"visible"}}>
   <defs><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   <rect x="15" y="20" width="840" height="330" rx="5" fill="rgba(0,0,0,.18)" stroke="rgba(255,255,255,.82)" strokeWidth="7"/>
   {Array.from({length:14}).map((_,i)=><line key={`v${i}`} x1={20+i*64} y1="24" x2={20+i*64} y2="348" stroke="rgba(255,255,255,.2)" strokeWidth="2"/>)}
   {Array.from({length:7}).map((_,i)=><line key={`h${i}`} x1="18" y1={35+i*50} x2="852" y2={35+i*50} stroke="rgba(255,255,255,.2)" strokeWidth="2"/>)}
   {children}
 </svg>
</div>;

const Shots:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const hc=getHome(p),ac=getAway(p); const op=sceneOpacity(f);
 const bluePaths=["M-50 320 Q120 280 300 110","M-60 230 Q150 230 360 190","M-40 365 Q150 330 400 250","M-55 150 Q110 170 280 70","M-60 285 Q160 290 450 150","M-50 120 Q170 120 520 220"];
 const redPaths=["M930 325 Q760 280 590 110","M940 210 Q760 220 530 190","M920 365 Q730 330 470 260","M930 130 Q760 170 590 70","M940 290 Q720 295 430 150","M925 100 Q710 120 350 220"];
 return <AbsoluteFill style={{opacity:op}}><Header title="التسديدات" f={f}/><TeamValue side="home" p={p} value={14} f={f}/><TeamValue side="away" p={p} value={21} f={f}/><MidDivider/><GoalFrame>
   <defs><marker id="ab" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={hc}/></marker><marker id="ar" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill={ac}/></marker></defs>
   {bluePaths.map((d,i)=>{const q=ph(f,24+i*5,48+i*5);return <path key={d} d={d} fill="none" stroke={hc} strokeWidth="6" strokeLinecap="round" markerEnd="url(#ab)" pathLength="1" strokeDasharray="1" strokeDashoffset={1-q} opacity={q} filter="url(#glow)"/>})}
   {redPaths.map((d,i)=>{const q=ph(f,28+i*5,52+i*5);return <path key={d} d={d} fill="none" stroke={ac} strokeWidth="6" strokeLinecap="round" markerEnd="url(#ar)" pathLength="1" strokeDasharray="1" strokeDashoffset={1-q} opacity={q} filter="url(#glow)"/>})}
 </GoalFrame></AbsoluteFill>;
};

const Target:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const hc=getHome(p),ac=getAway(p);const op=sceneOpacity(f);
 const blue=[[170,85],[250,145],[350,105],[195,235],[310,280],[420,220],[135,305]];
 const red=[[570,80],[660,120],[760,90],[540,180],[640,215],[735,175],[590,290],[690,300],[785,265]];
 const ball=(xy:number[],i:number,color:string,fromLeft:boolean)=>{const q=spring({frame:Math.max(0,f-20-i*4),fps:30,config:{damping:12,stiffness:145,mass:.52}});const x=mix(q,0,1,fromLeft?-120:990,xy[0]),y=mix(q,0,1,360,xy[1]);return <g key={`${color}${i}`} transform={`translate(${x},${y}) scale(${.45+.55*Math.min(1,q)})`} opacity={Math.min(1,q)}><circle r="15" fill="white" stroke={color} strokeWidth="7" filter="url(#glow)"/><circle r={26+10*Math.sin(Math.max(0,f-20-i*4)/5)} fill="none" stroke={color} strokeWidth="3" opacity={.35}/></g>};
 return <AbsoluteFill style={{opacity:op}}><Header title="على المرمى" f={f}/><TeamValue side="home" p={p} value={7} f={f}/><TeamValue side="away" p={p} value={9} f={f}/><MidDivider/><GoalFrame>{blue.map((x,i)=>ball(x,i,hc,true))}{red.map((x,i)=>ball(x,i,ac,false))}</GoalFrame></AbsoluteFill>;
};

const BigChances:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const hc=getHome(p),ac=getAway(p),op=sceneOpacity(f); const pts=[{x:235,y:190,c:hc,d:20},{x:300,y:300,c:hc,d:28},{x:640,y:120,c:ac,d:18},{x:720,y:210,c:ac,d:26},{x:780,y:300,c:ac,d:34},{x:620,y:315,c:ac,d:42}];
 return <AbsoluteFill style={{opacity:op}}><Header title="الفرص الكبيرة" sub="Big Chances" f={f}/><TeamValue side="home" p={p} value={2} f={f}/><TeamValue side="away" p={p} value={4} f={f}/><MidDivider/>
 <div style={{position:"absolute",left:105,top:930,width:870,height:410,zIndex:15,border:`3px solid ${GOLD}`,boxShadow:`0 0 28px ${GOLD}33`,background:"rgba(0,0,0,.28)"}}><svg viewBox="0 0 870 410" width="100%" height="100%"><rect x="12" y="12" width="846" height="386" fill="none" stroke="rgba(255,255,255,.52)" strokeWidth="4"/><line x1="435" y1="12" x2="435" y2="398" stroke="rgba(255,255,255,.45)" strokeWidth="3"/><circle cx="435" cy="205" r="66" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="3"/>{pts.map((pt,i)=>{const q=spring({frame:Math.max(0,f-pt.d),fps:30,config:{damping:9,stiffness:170,mass:.5}});const pulse=.5+.5*Math.sin(Math.max(0,f-pt.d)/4);return <g key={i} opacity={Math.min(1,q)} transform={`translate(${pt.x},${pt.y}) scale(${Math.min(1,q)})`}><circle r="18" fill={pt.c} stroke="white" strokeWidth="4" filter="url(#glow)"/><circle r={28+12*pulse} fill="none" stroke={pt.c} strokeWidth="4" opacity={.55-.25*pulse}/></g>})}</svg></div>
 </AbsoluteFill>;
};

const Xg:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const hc=getHome(p),ac=getAway(p),op=sceneOpacity(f),q=ph(f,18,92); const home=Number((p as any).v6XgHome??1.46),away=Number((p as any).v6XgAway??3);
 const line=(v:number,color:string,offset:number)=>{const y0=355,yEnd=355-(v/3.2)*285;const d=`M55 355 L150 ${350-offset*.2} L235 ${335-offset*.4} L330 ${310-offset*.7} L430 ${290-offset} L520 ${250-offset*1.2} L610 ${210-offset*1.4} L700 ${175-offset*1.5} L805 ${yEnd}`;return <><path d={d} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-q} filter="url(#glow)"/><circle cx={55+750*q} cy={355+(yEnd-355)*q} r="12" fill="white" stroke={color} strokeWidth="6" opacity={q}/></>};
 return <AbsoluteFill style={{opacity:op}}><Header title="الأهداف المتوقعة" sub="xG" f={f}/><TeamValue side="home" p={p} value={Math.round(home*q*100)/100} f={f}/><TeamValue side="away" p={p} value={Math.round(away*q*100)/100} f={f}/><MidDivider/>
 <div style={{position:"absolute",left:90,top:900,width:900,height:500,zIndex:15}}><svg viewBox="0 0 870 430" width="100%" height="100%"><line x1="55" y1="355" x2="830" y2="355" stroke="rgba(255,255,255,.72)" strokeWidth="3"/><line x1="55" y1="60" x2="55" y2="355" stroke="rgba(255,255,255,.72)" strokeWidth="3"/>{[0,1,2,3].map(v=><g key={v}><line x1="55" y1={355-v*92} x2="830" y2={355-v*92} stroke="rgba(255,255,255,.18)" strokeDasharray="8 8"/><text x="14" y={362-v*92} fill="white" fontSize="28">{v}</text></g>)}{line(home,hc,4)}{line(away,ac,48)}</svg></div>
 </AbsoluteFill>;
};

const Possession:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const hc=getHome(p),ac=getAway(p),op=sceneOpacity(f),q=ph(f,18,78),home=50+(64-50)*q,away=50+(36-50)*q,split=50+(64-50)*q;
 return <AbsoluteFill style={{opacity:op}}><Header title="الاستحواذ" sub="Possession" f={f}/><TeamValue side="home" p={p} value={Math.round(home)} suffix="%" f={f}/><TeamValue side="away" p={p} value={Math.round(away)} suffix="%" f={f}/><MidDivider/>
 <div style={{position:"absolute",left:105,top:930,width:870,height:410,zIndex:15,border:`3px solid ${GOLD}`,overflow:"hidden",background:"rgba(0,0,0,.28)"}}><div style={{position:"absolute",inset:0,right:`${100-split}%`,background:`linear-gradient(135deg,${hc}dd,${hc}88)`}}/><div style={{position:"absolute",inset:0,left:`${split}%`,background:`linear-gradient(225deg,${ac}dd,${ac}88)`}}/><div style={{position:"absolute",left:`${split}%`,top:0,bottom:0,width:5,background:GOLD,boxShadow:`0 0 25px ${GOLD}`,transform:"translateX(-50%)"}}/><div style={{position:"absolute",left:`${split}%`,top:"50%",width:38,height:38,borderRadius:"50%",background:"white",border:`6px solid ${GOLD}`,boxShadow:`0 0 22px ${GOLD}`,transform:"translate(-50%,-50%)"}}/><div dir="rtl" style={{position:"absolute",left:0,top:150,width:`${split}%`,textAlign:"center",fontSize:62,fontWeight:900,color:"white"}}>{Math.round(home)}%</div><div dir="rtl" style={{position:"absolute",right:0,top:150,width:`${100-split}%`,textAlign:"center",fontSize:62,fontWeight:900,color:"white"}}>{Math.round(away)}%</div></div>
 </AbsoluteFill>;
};

const Motm:React.FC<{p:MatchProps;f:number}>=({p,f})=>{
 const op=sceneOpacity(f),ac=getAway(p),m=(p as any).v6Motm||{},player=(p as any).starPlayer||{},photo=player.photoUrl||`https://imagecache.365scores.com/image/upload/f_png,c_limit,q_auto:eco,dpr_1/Players/${player.playerId||52355416}`; const e=spring({frame:f,fps:30,config:{damping:16,stiffness:105,mass:.8}}); const rating=Number(m.rating||player.rating||8.3); const stats=(m.stats||[{label:"هدف",value:"1"},{label:"تسديدات",value:"3"},{label:"على المرمى",value:"2"},{label:"تمريرات مفتاحية",value:"3"}]).slice(0,4);
 return <AbsoluteFill style={{opacity:op}}><Header title="نجم المباراة" sub="Man of the Match" f={f}/>
 <div style={{position:"absolute",left:-15,bottom:85,width:570,height:1440,zIndex:15,transform:`translateX(${(1-Math.min(1,e))*-90}px) scale(${.94+.06*Math.min(1,e)})`,transformOrigin:"bottom center"}}><Img src={photo} style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"bottom center",filter:"drop-shadow(0 30px 45px rgba(0,0,0,.72))"}}/></div>
 <div style={{position:"absolute",right:90,top:430,width:500,zIndex:25,textAlign:"center"}}><Img src={awayBadge(p)} style={{width:190,height:190,objectFit:"contain",filter:`drop-shadow(0 0 24px ${ac}88)`}}/><div dir="rtl" style={{fontSize:58,fontWeight:900,color:"white",marginTop:10}}>{m.name||player.name||"نجم المباراة"}</div><div dir="rtl" style={{fontSize:38,fontWeight:850,color:GOLD,marginTop:6}}>{m.team||player.team||awayName(p)}</div>
 <div style={{width:220,height:220,borderRadius:"50%",margin:"35px auto 22px",display:"flex",alignItems:"center",justifyContent:"center",border:`5px solid ${GOLD}`,boxShadow:`0 0 28px ${GOLD}66`,fontSize:78,fontWeight:900,color:"white",transform:`rotate(${(1-ph(f,28,62))*-16}deg) scale(${.86+.14*ph(f,28,62)})`}}>{(rating*ph(f,25,65)).toFixed(1)}</div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>{stats.map((s:any,i:number)=>{const q=spring({frame:Math.max(0,f-42-i*9),fps:30,config:{damping:13,stiffness:135,mass:.58}});return <div key={i} style={{height:150,border:`2px solid ${GOLD}`,borderRadius:18,background:"rgba(18,7,11,.68)",display:"flex",flexDirection:"column",justifyContent:"center",opacity:Math.min(1,q),transform:`translateY(${(1-Math.min(1,q))*28}px) scale(${.9+.1*Math.min(1,q)})`,boxShadow:`inset 0 0 28px ${ac}33`}}><div style={{fontSize:58,fontWeight:900,color:"white"}}>{s.value}</div><div dir="rtl" style={{fontSize:22,fontWeight:800,color:"white"}}>{s.label}</div></div>})}</div>
 <div dir="rtl" style={{marginTop:25,border:`2px solid ${GOLD}`,padding:"16px 12px",fontSize:27,fontWeight:900,color:"white",background:"rgba(0,0,0,.38)",opacity:ph(f,82,104)}}>سجل هدف الفوز</div></div>
 </AbsoluteFill>;
};

export const TacticStatsMotionV3:React.FC<MatchProps>=(p)=>{
 const frame=useCurrentFrame();
 const starts=[0,105,210,315,420,525];
 return <AbsoluteFill><Bg p={p}/><Brand p={p}/>
   <Shots p={p} f={frame-starts[0]}/>
   <Target p={p} f={frame-starts[1]}/>
   <BigChances p={p} f={frame-starts[2]}/>
   <Xg p={p} f={frame-starts[3]}/>
   <Possession p={p} f={frame-starts[4]}/>
   <Motm p={p} f={frame-starts[5]}/>
 </AbsoluteFill>;
};

export const STATS_V3_FRAMES=645;
