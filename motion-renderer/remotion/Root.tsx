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
  </>
);
