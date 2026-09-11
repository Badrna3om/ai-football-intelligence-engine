import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {loadFont} from "@remotion/google-fonts/Cairo";
import {TacticMatchPresentationLayered} from "../match-presentation/TacticMatchPresentationLayered";
import {TacticStatsHilalStackV2} from "../stats-hilal-reference/TacticStatsHilalStackV2";
import {MASTER_V1, MASTER_V1_STAT_ORDER} from "./rules";
import {TacticMasterV1Props, tacticMasterV1Schema, defaultMasterV1Props} from "./schema";

const {fontFamily:cairo}=loadFont();
const clamp={extrapolateLeft:"clamp" as const,extrapolateRight:"clamp" as const};
const ease=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{...clamp});
const num=(v:unknown,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d;};
const txt=(v:unknown,d="")=>String(v??d);
const transparentPixel="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const homeColor=(p:TacticMasterV1Props)=>p.design?.homeColor||"#F7D117";
const awayColor=(p:TacticMasterV1Props)=>p.design?.awayColor||"#2D9CFF";
const homeBadge=(p:TacticMasterV1Props)=>p.assets?.homeBadgeUrl||p.match?.home?.badgeUrl||transparentPixel;
const awayBadge=(p:TacticMasterV1Props)=>p.assets?.awayBadgeUrl||p.match?.away?.badgeUrl||transparentPixel;
const tacticLogo=(p:TacticMasterV1Props)=>p.assets?.tacticLogoUrl||staticFile("TACTIC_SPORT_logo.png");
const stadium=(p:TacticMasterV1Props)=>p.assets?.stadiumImageUrl||p.match?.stadium?.imageUrl||null;
const competitionLogo=(p:TacticMasterV1Props)=>p.assets?.competitionLogoUrl||null;

const rgba=(hex:string,a:number)=>{
  const h=String(hex||"").replace("#","");
  const v=h.length===3?h.split("").map((x)=>x+x).join(""):h;
  if(!/^[0-9a-fA-F]{6}$/.test(v))return "rgba(255,255,255,"+a+")";
  const n=parseInt(v,16);
  return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")";
};

const scoreParts=(score:unknown)=>{
  const m=txt(score,"0-0").match(/(\d+)\s*[-–—]\s*(\d+)/);
  return m?[Number(m[1]),Number(m[2])]:[0,0];
};

const goalFrames=(goal:any)=>{
  const s=Math.max(MASTER_V1.minGoalSeconds,Math.min(MASTER_V1.maxGoalSeconds,num(goal?.durationInSeconds,MASTER_V1.defaultGoalSeconds)));
  return Math.round(s*MASTER_V1.fps);
};

export const calculateMasterV1Duration=(p:TacticMasterV1Props)=>{
  const durations=[
    MASTER_V1.introFrames,
    MASTER_V1.presentationFrames,
    ...(p.goals||[]).map(goalFrames),
    MASTER_V1.resultFrames,
    MASTER_V1.statsFrames,
    p.starPlayer?MASTER_V1.motmFrames:0,
    MASTER_V1.outroFrames,
  ].filter((x)=>x>0);
  return durations.reduce((a,b)=>a+b,0)-Math.max(0,durations.length-1)*MASTER_V1.transitionFrames;
};

const Fade:React.FC<{duration:number;children:React.ReactNode}>=({duration,children})=>{
  const f=useCurrentFrame();
  const enter=ease(f,0,MASTER_V1.transitionFrames);
  const exit=1-ease(f,Math.max(0,duration-MASTER_V1.transitionFrames),Math.max(1,duration-1));
  return <AbsoluteFill style={{opacity:Math.min(enter,exit),fontFamily:cairo,color:"white"}}>{children}</AbsoluteFill>;
};

const StadiumBase:React.FC<{p:TacticMasterV1Props;dark?:number}>=({p,dark=.34})=>{
  const f=useCurrentFrame();
  const bg=stadium(p);
  const drift=Math.sin(f/37)*5;
  return <AbsoluteFill style={{background:"#02070b",overflow:"hidden"}}>
    {bg?<Img src={bg} style={{width:"100%",height:"100%",objectFit:"cover",transform:"scale(1.035) translateX("+drift+"px)",filter:"brightness(.66) contrast(1.08)"}}/>:
      <AbsoluteFill style={{background:"radial-gradient(circle at 50% 18%,#19394a 0%,#09161e 38%,#020609 78%)"}}/>}
    <div style={{position:"absolute",left:0,top:0,bottom:0,width:"50%",background:"linear-gradient(90deg,"+rgba(homeColor(p),MASTER_V1.teamTintOpacity)+",transparent)"}}/>
    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"50%",background:"linear-gradient(270deg,"+rgba(awayColor(p),MASTER_V1.teamTintOpacity)+",transparent)"}}/>
    <AbsoluteFill style={{background:"rgba(0,0,0,"+dark+")"}}/>
  </AbsoluteFill>;
};

const Brand:React.FC<{p:TacticMasterV1Props;top?:number;left?:number;width?:number}>=({p,top=34,left=34,width=220})=>
  <Img src={tacticLogo(p)} style={{position:"absolute",top,left,width,maxHeight:75,objectFit:"contain",zIndex:30,filter:"drop-shadow(0 12px 24px rgba(0,0,0,.55))"}}/>;

const Intro:React.FC<{p:TacticMasterV1Props}>=({p})=>{
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame:f,fps,config:{damping:13,stiffness:100,mass:.8}});
  const comp=competitionLogo(p);
  return <AbsoluteFill>
    <StadiumBase p={p} dark={.52}/>
    <AbsoluteFill style={{alignItems:"center",justifyContent:"center"}}>
      {comp?<Img src={comp} style={{width:330,height:330,objectFit:"contain",transform:"scale("+(.72+s*.28)+")",filter:"drop-shadow(0 22px 45px rgba(0,0,0,.62))"}}/>:null}
      <Img src={tacticLogo(p)} style={{position:"absolute",bottom:315,width:430,maxHeight:145,objectFit:"contain",opacity:ease(f,18,48)}}/>
    </AbsoluteFill>
  </AbsoluteFill>;
};

const Presentation:React.FC<{p:TacticMasterV1Props}>=({p})=>
  <TacticMatchPresentationLayered
    competitionName={txt(p.competition)}
    roundLabel={p.round?"الجولة "+p.round:""}
    dateLabel={txt(p.dateLabel)}
    timeLabel={txt(p.timeLabel)}
    homeName={p.homeTeam}
    awayName={p.awayTeam}
    homeLogo={homeBadge(p)}
    awayLogo={awayBadge(p)}
    homePrimary={homeColor(p)}
    awayPrimary={awayColor(p)}
    venue={txt(p.venue,"—")}
    referee={txt(p.referee,"—")}
    homeRank={p.homeRank}
    awayRank={p.awayRank}
    neutralBackground={stadium(p)||undefined}
    tacticLogo={tacticLogo(p)}
  />;

const goalTitle=(p:TacticMasterV1Props,g:any,index:number)=>{
  if(g?.title||g?.label)return txt(g.title||g.label);
  const after=scoreParts(g?.scoreAfter);
  const side=txt(g?.teamSide).toLowerCase()==="away"?"away":"home";
  if(g?.scoreAfter){
    const own=side==="home"?after[0]:after[1];
    const opp=side==="home"?after[1]:after[0];
    if(own<opp && opp-own===1)return "هدف تقليص الفارق";
    if(own===opp && own>0)return "هدف التعادل";
  }
  return index===0?"الهدف الأول":index===1?"الهدف الثاني":"الهدف "+(index+1);
};

const GoalScene:React.FC<{p:TacticMasterV1Props;goal:any;index:number;duration:number}>=({p,goal,index,duration})=>{
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const side=txt(goal?.teamSide).toLowerCase()==="away"?"away":"home";
  const color=side==="home"?homeColor(p):awayColor(p);
  const badge=side==="home"?homeBadge(p):awayBadge(p);
  const team=txt(goal?.team,side==="home"?p.homeTeam:p.awayTeam);
  const video=goal?.videoUrl||p.highlightsVideoUrl||null;
  const startFrames=Math.max(0,Math.round(num(goal?.videoStartSeconds??goal?.clipStartSeconds,0)*fps));
  const card=ease(f,8,32);
  const cardY=1320+(1-card)*270;
  const title=goalTitle(p,goal,index);
  return <AbsoluteFill style={{background:"#000",fontFamily:cairo,color:"white",overflow:"hidden"}}>
    {video?<>
      <OffthreadVideo src={video} startFrom={startFrames} style={{position:"absolute",inset:-100,width:"calc(100% + 200px)",height:"calc(100% + 200px)",objectFit:"cover",filter:"blur(34px) brightness(.30) saturate(.82)",transform:"scale(1.12)"}}/>
      <OffthreadVideo src={video} startFrom={startFrames} style={{position:"absolute",left:70,right:70,top:365,width:940,height:610,objectFit:"cover",borderRadius:22,boxShadow:"0 28px 80px rgba(0,0,0,.55)"}}/>
    </>:<StadiumBase p={p} dark={.46}/>}
    <Brand p={p} top={30} left={360} width={360}/>
    <div style={{position:"absolute",left:42,right:42,top:1320,height:430,borderRadius:30,background:"rgba(3,10,15,.97)"}}/>
    <div style={{position:"absolute",left:42,right:42,top:cardY,height:430,borderRadius:30,background:"linear-gradient(180deg,rgba(3,10,15,.96),rgba(2,7,11,.99))",border:"1px solid rgba(255,255,255,.12)",boxShadow:"0 28px 65px rgba(0,0,0,.45)",overflow:"hidden"}}>
      <div style={{position:"absolute",left:72,right:72,top:28,height:5,borderRadius:4,background:color}}/>
      <div style={{position:"absolute",left:38,top:115,width:220,textAlign:"left",direction:"ltr"}}>
        <div style={{fontSize:64,fontWeight:950}}>{goal?.displayMinute||String(goal?.minute||"")+"′"}</div>
        <Img src={badge} style={{width:82,height:82,objectFit:"contain",marginTop:8}}/>
        {goal?.scoreAfter?<div style={{fontSize:34,fontWeight:900,color,marginTop:12}}>{goal.scoreAfter}</div>:null}
      </div>
      <div style={{position:"absolute",right:55,top:100,width:650,textAlign:"right",direction:"rtl"}}>
        <div style={{fontSize:38,fontWeight:900}}>{title}</div>
        <div style={{fontSize:58,fontWeight:950,marginTop:28}}>{goal?.scorer||"هدف"}</div>
        <div style={{fontSize:32,fontWeight:900,color,marginTop:8}}>{team}</div>
        {goal?.assist?<div style={{fontSize:23,color:"rgba(255,255,255,.64)",marginTop:12}}>أسيست: {goal.assist}</div>:null}
      </div>
    </div>
  </AbsoluteFill>;
};

const normalizedEvents=(p:TacticMasterV1Props)=>{
  const explicit=Array.isArray(p.timelineEvents)?p.timelineEvents:[];
  if(explicit.length)return [...explicit].sort((a:any,b:any)=>num(a.minute)-num(b.minute));
  return (p.goals||[]).map((g:any)=>({
    minute:g.minute,
    displayMinute:g.displayMinute,
    type:"goal",
    teamSide:txt(g.teamSide).toLowerCase()==="away"?"away":"home",
    player:g.scorer,
    label:"هدف",
  })).sort((a:any,b:any)=>num(a.minute)-num(b.minute);
};

const ResultScene:React.FC<{p:TacticMasterV1Props;duration:number}>=({p,duration})=>{
  const f=useCurrentFrame();
  const [hs,as]=scoreParts(p.score);
  const events=normalizedEvents(p);
  const prog=ease(f,38,duration-28);
  const y0=750,y1=1615;
  return <AbsoluteFill style={{fontFamily:cairo,color:"white"}}>
    <StadiumBase p={p} dark={.28}/>
    <Brand p={p} top={28} left={28} width={215}/>
    <div style={{position:"absolute",top:80,left:0,right:0,textAlign:"center"}}>
      <div style={{fontSize:32,fontWeight:800}}>{p.competition}</div>
      <div style={{fontSize:25,color:"#d8b85d",fontWeight:900,marginTop:6}}>{p.round?"الجولة "+p.round:""}</div>
      <div style={{fontSize:68,fontWeight:950,marginTop:20}}>النتيجة النهائية</div>
    </div>
    <div style={{position:"absolute",top:300,left:70,right:70,height:300,display:"grid",gridTemplateColumns:"1fr 180px 1fr",alignItems:"center",direction:"ltr"}}>
      <div style={{textAlign:"center"}}><Img src={homeBadge(p)} style={{width:190,height:190,objectFit:"contain"}}/><div style={{fontSize:40,fontWeight:950,color:homeColor(p)}}>{p.homeTeam}</div></div>
      <div style={{fontSize:92,fontWeight:950,textAlign:"center"}}>{hs} <span style={{fontSize:48,color:"rgba(255,255,255,.55)"}}>–</span> {as}</div>
      <div style={{textAlign:"center"}}><Img src={awayBadge(p)} style={{width:190,height:190,objectFit:"contain"}}/><div style={{fontSize:40,fontWeight:950,color:awayColor(p)}}>{p.awayTeam}</div></div>
    </div>
    <div style={{position:"absolute",left:48,right:48,top:630,bottom:105,borderRadius:30,background:"rgba(2,9,14,.79)",border:"1px solid rgba(235,242,246,.45)",boxShadow:"0 24px 70px rgba(0,0,0,.38)"}}>
      <div style={{fontSize:36,fontWeight:950,textAlign:"center",marginTop:30}}>أحداث المباراة</div>
      <div style={{position:"absolute",left:"50%",top:y0-630,width:4,height:(y1-y0)*prog,background:"rgba(245,247,248,.95)",transform:"translateX(-50%)"}}/>
      <div style={{position:"absolute",left:"50%",top:y0-645,transform:"translateX(-50%)",fontSize:23}}>0</div>
      {events.map((ev:any,i:number)=>{
        const minute=Math.max(0,Math.min(90,num(ev.minute)));
        const frac=minute/90;
        const eventP=ease(prog,Math.max(0,frac-.03),Math.min(1,frac+.03));
        const y=y0-630+(y1-y0)*frac;
        const side=ev.teamSide==="away"?"away":"home";
        const col=side==="home"?homeColor(p):awayColor(p);
        const prev=i>0?num(events[i-1].minute):-100;
        const next=i<events.length-1?num(events[i+1].minute):999;
        const crowded=(minute-prev<13)||(next-minute<13);
        const nudge=crowded?(i%2===0?-28:34):0;
        return <React.Fragment key={i}>
          <div style={{position:"absolute",left:"50%",top:y-8,width:16,height:16,borderRadius:ev.type==="yellow_card"?3:999,background:ev.type==="yellow_card"?"#f5c928":col,border:"1px solid white",transform:"translateX(-50%) scale("+eventP+")"}}/>
          <div style={{position:"absolute",top:y-30+nudge,width:360,opacity:eventP,direction:"rtl",textAlign:side==="home"?"right":"left",left:side==="home"?58:552,right:side==="home"?undefined:58}}>
            <div style={{fontSize:28,fontWeight:950,color:col}}>{ev.displayMinute||String(ev.minute)+"′"}</div>
            <div style={{fontSize:25,fontWeight:900}}>{ev.player||""}</div>
            <div style={{fontSize:19,color:ev.type==="yellow_card"?"#f5c928":col}}>{ev.label||""}</div>
          </div>
        </React.Fragment>;
      })}
      {prog>.98?<div style={{position:"absolute",left:"50%",top:y1-620,transform:"translateX(-50%)",fontSize:23}}>90</div>:null}
    </div>
  </AbsoluteFill>;
};

const StatsScene:React.FC<{p:TacticMasterV1Props}>=({p})=>{
  const ordered=MASTER_V1_STAT_ORDER.map((id)=>p.statsCards?.find((s:any)=>String(s.id)===id)).filter(Boolean);
  return <TacticStatsHilalStackV2
    compositionId="TacticStatsHilalStackV2"
    gameId={num(p.gameId)}
    competition={p.competition}
    round={p.round}
    homeTeam={p.homeTeam}
    awayTeam={p.awayTeam}
    statsCards={ordered as any}
    design={{homeColor:homeColor(p),awayColor:awayColor(p)}}
    assets={{
      homeBadgeUrl:homeBadge(p),
      awayBadgeUrl:awayBadge(p),
      competitionLogoUrl:competitionLogo(p),
      tacticLogoUrl:tacticLogo(p),
      starPlayerPhotoUrl:p.assets?.starPlayerPhotoUrl||p.starPlayer?.photoUrl||null,
      stadiumImageUrl:stadium(p),
    } as any}
    starPlayer={p.starPlayer}
  />;
};

const MotmScene:React.FC<{p:TacticMasterV1Props}>=({p})=>{
  const f=useCurrentFrame();
  const star:any=p.starPlayer||{};
  const photo=star.photoUrl||star.imageUrl||star.playerImageUrl||p.assets?.starPlayerPhotoUrl||null;
  const teamSide=txt(star.team)===txt(p.awayTeam)?"away":"home";
  const badge=teamSide==="home"?homeBadge(p):awayBadge(p);
  const open=ease(f,12,55);
  const reveal=ease(f,42,78);
  const statIn=(i:number)=>ease(f,78+i*6,103+i*6);
  const cols=[
    [star.goals??0,"هدف"],
    [star.assists??0,"أسيست"],
    [star.position??"—","المركز"],
    [star.rating??"—","التقييم"],
    [star.minutes??90,"دقيقة"],
  ];
  return <AbsoluteFill style={{background:"#030303",fontFamily:cairo,color:"white",overflow:"hidden"}}>
    <Brand p={p} top={38} left={45} width={245}/>
    <div style={{position:"absolute",left:0,right:0,top:145,textAlign:"center"}}>
      <div style={{fontSize:24,color:"#d8b85d"}}>★</div>
      <div style={{fontSize:65,fontWeight:950,fontFamily:"Arial Black, sans-serif",fontStyle:"italic"}}>MAN OF THE MATCH</div>
      <div style={{fontSize:34,marginTop:8}}>نجم المباراة</div>
    </div>
    <div style={{position:"absolute",left:205,top:365,width:670,height:1100,clipPath:"polygon(50% 0%,92% 11%,96% 18%,96% 84%,86% 94%,50% 100%,14% 94%,4% 84%,4% 18%,8% 11%)",background:"linear-gradient(160deg,#0c0c0c,#050505)",border:"2px solid #d8b85d",boxShadow:"0 30px 85px rgba(0,0,0,.62)"}}>
      <div style={{position:"absolute",left:"50%",top:70,bottom:250,width:2,background:"#d8b85d",transform:"translateX(-50%) scaleY("+(1-open)+")",opacity:1-open}}/>
      {photo?<Img src={photo} style={{position:"absolute",left:65,right:65,top:85,width:540,height:690,objectFit:"contain",opacity:reveal,transform:"translateY("+((1-reveal)*65)+"px) scale("+(1.04+.04*reveal)+")",filter:"drop-shadow(0 28px 38px rgba(0,0,0,.58))"}}/>:null}
      <div style={{position:"absolute",right:72,top:105,width:118,height:118,borderRadius:"50%",border:"2px solid #d8b85d",display:"flex",alignItems:"center",justifyContent:"center",opacity:reveal}}><Img src={badge} style={{width:105,height:105,objectFit:"contain"}}/></div>
      <div style={{position:"absolute",left:45,right:45,bottom:195,height:82,clipPath:"polygon(5% 0%,95% 0%,100% 50%,95% 100%,5% 100%,0 50%)",background:"#050505",border:"1px solid #d8b85d",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontWeight:950,color:"#e8c45e",opacity:reveal}}>{star.name||"نجم المباراة"}</div>
      <div style={{position:"absolute",left:40,right:40,bottom:65,display:"grid",gridTemplateColumns:"repeat(5,1fr)",direction:"ltr"}}>
        {cols.map((c:any,i:number)=><div key={i} style={{textAlign:"center",borderRight:i<4?"1px solid rgba(216,184,93,.38)":"none",opacity:statIn(i),transform:"translateY("+((1-statIn(i))*18)+"px)"}}>
          <div style={{fontSize:30,fontWeight:950,color:"#e8c45e"}}>{String(c[0])}</div>
          <div style={{fontSize:15,marginTop:8}}>{c[1]}</div>
        </div>)}
      </div>
    </div>
    <div style={{position:"absolute",left:205,top:365,width:(670/2)*(1-open),height:1100,background:"#050505",borderRight:"1px solid #d8b85d",transformOrigin:"left center"}}/>
    <div style={{position:"absolute",right:205,top:365,width:(670/2)*(1-open),height:1100,background:"#050505",borderLeft:"1px solid #d8b85d",transformOrigin:"right center"}}/>
  </AbsoluteFill>;
};

const Outro:React.FC<{p:TacticMasterV1Props}>=({p})=>{
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const s=spring({frame:f,fps,config:{damping:14,stiffness:95}});
  return <AbsoluteFill>
    <StadiumBase p={p} dark={.60}/>
    <AbsoluteFill style={{alignItems:"center",justifyContent:"center",fontFamily:cairo,color:"white"}}>
      <Img src={tacticLogo(p)} style={{width:580,maxHeight:220,objectFit:"contain",transform:"scale("+(.72+s*.28)+")"}}/>
      <div style={{fontSize:32,fontWeight:900,marginTop:42}}>خلف كل مباراة… قصة تحكيها الأرقام</div>
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const TacticMasterV1:React.FC<TacticMasterV1Props>=(p)=>{
  const scenes:React.ReactNode[]=[];
  let end=0;
  let count=0;
  const push=(key:string,duration:number,node:React.ReactNode)=>{
    const start=count===0?0:end-MASTER_V1.transitionFrames;
    scenes.push(<Sequence key={key} from={start} durationInFrames={duration} premountFor={MASTER_V1.fps}><Fade duration={duration}>{node}</Fade></Sequence>);
    end=start+duration;
    count++;
  };
  push("intro",MASTER_V1.introFrames,<Intro p={p}/>);
  push("presentation",MASTER_V1.presentationFrames,<Presentation p={p}/>);
  (p.goals||[]).forEach((g:any,i:number)=>{const d=goalFrames(g);push("goal-"+i,d,<GoalScene p={p} goal={g} index={i} duration={d}/>);});
  push("result",MASTER_V1.resultFrames,<ResultScene p={p} duration={MASTER_V1.resultFrames}/>);
  push("stats",MASTER_V1.statsFrames,<StatsScene p={p}/>);
  if(p.starPlayer)push("motm",MASTER_V1.motmFrames,<MotmScene p={p}/>);
  push("outro",MASTER_V1.outroFrames,<Outro p={p}/>);
  return <AbsoluteFill style={{background:"#000"}}>{scenes}</AbsoluteFill>;
};

export {tacticMasterV1Schema,defaultMasterV1Props};
