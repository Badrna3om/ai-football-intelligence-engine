import React from "react";
import {AbsoluteFill,Sequence,OffthreadVideo,staticFile} from "remotion";
import {z} from "zod";
import {IntroCard} from "./cards/IntroCard";
import {MatchupCard} from "./cards/MatchupCard";
import {GoalCard} from "./cards/GoalCard";
import {FinalScoreCard} from "./cards/FinalScoreCard";
import {ShotsCard} from "./cards/ShotsCard";
import {BigChancesCard} from "./cards/BigChancesCard";
import {PossessionCard} from "./cards/PossessionCard";
import {XgCard} from "./cards/XgCard";
import {StarPlayerCard} from "./cards/StarPlayerCard";
import {OutroCard} from "./cards/OutroCard";

export const FPS=30;
const storySchema=z.object({id:z.string().optional(),headline:z.string().optional(),metric:z.string().optional(),homeValue:z.any().optional(),awayValue:z.any().optional(),homeLabel:z.string().optional(),awayLabel:z.string().optional(),visual:z.string().optional()}).passthrough();
const goalSchema=z.object({minute:z.any().optional(),displayMinute:z.string().optional(),scorer:z.string().optional(),team:z.string().optional(),teamSide:z.string().optional(),assist:z.string().nullable().optional(),videoUrl:z.string().nullable().optional()}).passthrough();
export const matchSchema=z.object({
  githubActionsTest:z.boolean().optional(),templateKey:z.string().optional(),language:z.string().optional(),direction:z.string().optional(),fontFamily:z.string().optional(),gameId:z.any(),competition:z.string().optional(),round:z.any().optional(),homeTeam:z.string(),awayTeam:z.string(),score:z.string().optional(),introHeadline:z.string().optional(),mediaMode:z.string().optional(),highlightsVideoUrl:z.string().nullable().optional(),highlightsStartSeconds:z.number().optional(),goals:z.array(goalSchema).optional(),statsCards:z.array(storySchema).optional(),starPlayer:z.any().optional(),match:z.any().optional(),assets:z.any().optional(),motionTiming:z.any().optional(),design:z.any().optional(),previewCardsOnly:z.boolean().optional()
}).passthrough();
export type MatchProps=z.infer<typeof matchSchema>;
const sec=(v:any,d:number)=>{const n=Number(v);return Number.isFinite(n)&&n>0?n:d};
export const timings=(p:MatchProps)=>({intro:Math.round(sec(p.motionTiming?.introSeconds,4.5)*FPS),matchup:Math.round(sec(p.motionTiming?.matchupSeconds,5)*FPS),goal:Math.round(sec(p.motionTiming?.goalSeconds,5.5)*FPS),highlights:Math.round(sec(p.motionTiming?.highlightsSeconds,10)*FPS),final:Math.round(sec(p.motionTiming?.finalScoreSeconds,5)*FPS),stat:Math.round(sec(p.motionTiming?.statsCardSeconds,5.8)*FPS),star:Math.round(sec(p.motionTiming?.starPlayerSeconds,6.2)*FPS),outro:Math.round(sec(p.motionTiming?.outroSeconds,5)*FPS)});
const stat=(p:MatchProps,id:string)=>p.statsCards?.find((s:any)=>String(s.id)===id);
const hasExactGoalClips=(p:MatchProps)=>Array.isArray(p.goals)&&p.goals.some((g:any)=>!!g.videoUrl);
export const calculateDuration=(p:MatchProps)=>{
  const t=timings(p);
  if(p.previewCardsOnly){
    let total=0;
    if(stat(p,"shots")) total+=t.stat;
    if(stat(p,"big_chances")) total+=t.stat;
    if(stat(p,"possession")) total+=t.stat;
    if(p.starPlayer) total+=t.star;
    return total;
  }
  const goals=(p.goals||[]).length*t.goal;
  const highlights=p.highlightsVideoUrl&&!hasExactGoalClips(p)?t.highlights:0;
  return t.intro+t.matchup+goals+highlights+t.final+t.stat*4+(p.starPlayer?t.star:0)+t.outro;
};

const HighlightsScene:React.FC<{p:MatchProps}> = ({p}) => <AbsoluteFill style={{background:"#03080d"}}>{p.highlightsVideoUrl&&<OffthreadVideo src={p.highlightsVideoUrl} startFrom={Math.round((p.highlightsStartSeconds||0)*FPS)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}<AbsoluteFill style={{background:"linear-gradient(180deg,rgba(0,0,0,.08),transparent 55%,rgba(0,0,0,.4))"}}/><div style={{position:"absolute",top:70,left:0,right:0,textAlign:"center",fontSize:34,fontWeight:900,color:"white",fontFamily:"Cairo"}}>ملخص المباراة</div></AbsoluteFill>;

export const TacticMatch:React.FC<MatchProps>=(p)=>{
  const t=timings(p);const shots=stat(p,"shots"),onTarget=stat(p,"shots_on_target"),big=stat(p,"big_chances"),xg=stat(p,"xg"),possession=stat(p,"possession");
  if(p.previewCardsOnly){
    let cursor=0;
    const preview:React.ReactNode[]=[];
    if(shots){preview.push(<Sequence key="preview-shots" from={cursor} durationInFrames={t.stat}><ShotsCard p={p} shots={shots} onTarget={onTarget||{}} duration={t.stat}/></Sequence>);cursor+=t.stat;}
    if(big){preview.push(<Sequence key="preview-big" from={cursor} durationInFrames={t.stat}><BigChancesCard p={p} story={big} duration={t.stat}/></Sequence>);cursor+=t.stat;}
    if(possession){preview.push(<Sequence key="preview-possession" from={cursor} durationInFrames={t.stat}><PossessionCard p={p} story={possession} duration={t.stat}/></Sequence>);cursor+=t.stat;}
    if(p.starPlayer){preview.push(<Sequence key="preview-star" from={cursor} durationInFrames={t.star}><StarPlayerCard p={p} duration={t.star}/></Sequence>);cursor+=t.star;}
    return <AbsoluteFill style={{background:"#03080d"}}>{preview}</AbsoluteFill>;
  }
  let at=0;const goals=p.goals||[];const scenes:React.ReactNode[]=[];
  scenes.push(<Sequence key="intro" from={at} durationInFrames={t.intro}><IntroCard p={p} duration={t.intro}/></Sequence>);at+=t.intro;
  scenes.push(<Sequence key="matchup" from={at} durationInFrames={t.matchup}><MatchupCard p={p} duration={t.matchup}/></Sequence>);at+=t.matchup;
  goals.forEach((g:any,i:number)=>{scenes.push(<Sequence key={`goal-${i}`} from={at} durationInFrames={t.goal}><GoalCard p={p} goal={g} index={i} duration={t.goal}/></Sequence>);at+=t.goal;});
  if(p.highlightsVideoUrl&&!hasExactGoalClips(p)){scenes.push(<Sequence key="highlights" from={at} durationInFrames={t.highlights}><HighlightsScene p={p}/></Sequence>);at+=t.highlights;}
  scenes.push(<Sequence key="final" from={at} durationInFrames={t.final}><FinalScoreCard p={p} duration={t.final}/></Sequence>);at+=t.final;
  if(shots){scenes.push(<Sequence key="shots" from={at} durationInFrames={t.stat}><ShotsCard p={p} shots={shots} onTarget={onTarget||{}} duration={t.stat}/></Sequence>);at+=t.stat;}
  if(big){scenes.push(<Sequence key="big" from={at} durationInFrames={t.stat}><BigChancesCard p={p} story={big} duration={t.stat}/></Sequence>);at+=t.stat;}
  if(xg){scenes.push(<Sequence key="xg" from={at} durationInFrames={t.stat}><XgCard p={p} story={xg} duration={t.stat}/></Sequence>);at+=t.stat;}
  if(possession){scenes.push(<Sequence key="possession" from={at} durationInFrames={t.stat}><PossessionCard p={p} story={possession} duration={t.stat}/></Sequence>);at+=t.stat;}
  if(p.starPlayer){scenes.push(<Sequence key="star" from={at} durationInFrames={t.star}><StarPlayerCard p={p} duration={t.star}/></Sequence>);at+=t.star;}
  scenes.push(<Sequence key="outro" from={at} durationInFrames={t.outro}><OutroCard p={p} duration={t.outro}/></Sequence>);
  return <AbsoluteFill style={{background:"#03080d"}}>{scenes}</AbsoluteFill>;
};
