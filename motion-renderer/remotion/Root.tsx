import React from "react";
import {Composition} from "remotion";
import {
  TacticMotionRouter,
  tacticMotionRouterSchema,
  defaultRouterProps,
  calculateRouterDuration,
} from "./TacticMotionRouter";
import {
  TacticStatsHilalReference,
  tacticStatsHilalReferenceSchema,
  defaultHilalStatsProps,
  calculateHilalStatsDuration,
} from "./stats-hilal-reference/TacticStatsHilalReference";
import {
  TacticStatsHilalStackV2,
  tacticStatsHilalStackV2Schema,
  defaultHilalStackV2Props,
  calculateHilalStackV2Duration,
} from "./stats-hilal-reference/TacticStatsHilalStackV2";
import {
  TacticMatchPresentationLayered,
  tacticMatchPresentationLayeredSchema,
  defaultMatchPresentationProps,
  calculateMatchPresentationDuration,
} from "./match-presentation/TacticMatchPresentationLayered";

export const RemotionRoot:React.FC=()=> (
  <>
    <Composition
      id="TacticMatch"
      component={TacticMotionRouter}
      durationInFrames={1590}
      fps={30}
      width={1080}
      height={1920}
      schema={tacticMotionRouterSchema}
      defaultProps={defaultRouterProps}
      calculateMetadata={({props})=>({durationInFrames:calculateRouterDuration(props)})}
    />
    <Composition
      id="TacticStatsHilalReference"
      component={TacticStatsHilalReference}
      durationInFrames={600}
      fps={30}
      width={1080}
      height={1920}
      schema={tacticStatsHilalReferenceSchema}
      defaultProps={defaultHilalStatsProps}
      calculateMetadata={({props})=>({durationInFrames:calculateHilalStatsDuration(props)})}
    />
    <Composition
      id="TacticStatsHilalStackV2"
      component={TacticStatsHilalStackV2}
      durationInFrames={645}
      fps={30}
      width={1080}
      height={1920}
      schema={tacticStatsHilalStackV2Schema}
      defaultProps={defaultHilalStackV2Props}
      calculateMetadata={()=>({durationInFrames:calculateHilalStackV2Duration()})}
    />
    <Composition
      id="TacticMatchPresentationLayered"
      component={TacticMatchPresentationLayered}
      durationInFrames={230}
      fps={30}
      width={1080}
      height={1920}
      schema={tacticMatchPresentationLayeredSchema}
      defaultProps={defaultMatchPresentationProps}
      calculateMetadata={()=>({durationInFrames:calculateMatchPresentationDuration()})}
    />
  </>
);
