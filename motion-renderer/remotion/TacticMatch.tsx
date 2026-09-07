import React from "react";
import {AbsoluteFill,Sequence} from "remotion";
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
import {C,FPS,MatchProps,n} from "./cards/shared";

const statSchema=z.object({id:z.string().optional(),headline:z.string().optional(),metric:z.string().optional(),homeValue:z.any().optional(),awayValue:z.any().optional(),homeLabel:z.string().optional(),awayLabel:z.string().optional(),visual:z.string().optional(),holdSeconds:z.any().optional()}).passthrough();
export const tacticMatchSchema=z.object({
  gameId:z.number().optional(),competition:z.string().optional(),round:z.number().nullable().optional(),homeTeam:z.string().optional(),awayTeam:z.string().optional(),score:z.string().optional(),introHeadline:z.string().optional(),highlightsVideoUrl:z.string().nullable().optional(),goals:z.array(z.any()).optional(),statsCards:z.array(statSchema).optional(),dataStories:z.array(statSchema).optional(),starPlayer:z.any().optional(),match:z.any().optional(),assets:z.any().optional(),cards:z.array(z.any()).optional(),substitutions:z.array(z.any()).optional(),motionTiming:z.any().optional(),design:z.any().optional()
}).passthrough();

export const defaultMatch:MatchProps={competition:"UAE Pro League",round:4,homeTeam:"شباب الأهلي",awayTeam:"الجزيرة",score:"1 - 3",goals:[],statsCards:[]};

const timings=(p:MatchProps)=>({
  intro:Math.round((n(p.motionTiming?.introSeconds)||4.5)*FPS),
  matchup:Math.round((n(p.motionTiming?.matchupSeconds)||5)*FPS),
  goal:Math.round((n(p.motionTiming?.goalSeconds)||5.5)*FPS),
  final:Math.round((n(p.motionTiming?.finalScoreSeconds)||5.5)*FPS),
  stat:Math.max(165,Math.round((n(p.motionTiming?.statsCardSeconds)||5.8)*FPS)),
  star:Math.round((n(p.motionTiming?.starPlayerSeconds)||6.2)*FPS),
  outro:Math.round((n(p.motionTiming?.outroSeconds)||5)*FPS),
});

const allStats=(p:MatchProps)=>p.statsCards?.length?p.statsCards:(p.dataStories||[]);
const statPlan=(p:MatchProps)=>{
  const a=allStats(p);const shots=a.find((x:any)=>x.id==="shots");const onTarget=a.find((x:any)=>x.id==="shots_on_target");const big=a.find((x:any)=>x.id==="big_chances");const xg=a.find((x:any)=>x.id==="xg");const possession=a.find((x:any)=>x.id==="possession");
  const out:any[]=[];if(shots||onTarget)out.push({type:"shots",shots:shots||{},onTarget:onTarget||{}});if(big)out.push({type:"big",story:big});if(xg)out.push({type:"xg",story:xg});if(possession)out.push({type:"possession",story:possession});return out;
};

export const calculateDuration=(p:MatchProps)=>{const t=timings(p);return t.intro+t.matchup+(p.goals?.length||0)*t.goal+t.final+statPlan(p).length*t.stat+(p.starPlayer?t.star:0)+t.outro};

export const TacticMatch:React.FC<MatchProps>=(p)=>{
  const t=timings(p);let cursor=0;const scenes:React.ReactNode[]=[];
  scenes.push(<Sequence key="intro" from={cursor} durationInFrames={t.intro}><IntroCard p={p} duration={t.intro}/></Sequence>);cursor+=t.intro;
  scenes.push(<Sequence key="matchup" from={cursor} durationInFrames={t.matchup}><MatchupCard p={p} duration={t.matchup}/></Sequence>);cursor+=t.matchup;
  (p.goals||[]).forEach((goal:any,index:number)=>{scenes.push(<Sequence key={`goal-${index}`} from={cursor} durationInFrames={t.goal}><GoalCard p={p} goal={goal} index={index} duration={t.goal}/></Sequence>);cursor+=t.goal;});
  scenes.push(<Sequence key="final" from={cursor} durationInFrames={t.final}><FinalScoreCard p={p} duration={t.final}/></Sequence>);cursor+=t.final;
  statPlan(p).forEach((item:any,index:number)=>{let el:React.ReactNode=null;if(item.type==="shots")el=<ShotsCard p={p} shots={item.shots} onTarget={item.onTarget} duration={t.stat}/>;if(item.type==="big")el=<BigChancesCard p={p} story={item.story} duration={t.stat}/>;if(item.type==="xg")el=<XgCard p={p} story={item.story} duration={t.stat}/>;if(item.type==="possession")el=<PossessionCard p={p} story={item.story} duration={t.stat}/>;scenes.push(<Sequence key={`stat-${index}`} from={cursor} durationInFrames={t.stat}>{el}</Sequence>);cursor+=t.stat;});
  if(p.starPlayer){scenes.push(<Sequence key="star" from={cursor} durationInFrames={t.star}><StarPlayerCard p={p} duration={t.star}/></Sequence>);cursor+=t.star;}
  scenes.push(<Sequence key="outro" from={cursor} durationInFrames={t.outro}><OutroCard p={p} duration={t.outro}/></Sequence>);
  return <AbsoluteFill style={{background:C.bg}}>{scenes}</AbsoluteFill>;
};
