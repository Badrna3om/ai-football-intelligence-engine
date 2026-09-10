import React from "react";
import {Composition} from "remotion";
import {TacticMatch,tacticMatchSchema,defaultMatch,calculateDuration} from "./TacticMatchV3";
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
      component={TacticMatch}
      durationInFrames={1590}
      fps={30}
      width={1080}
      height={1920}
      schema={tacticMatchSchema}
      defaultProps={defaultMatch}
      calculateMetadata={({props})=>({durationInFrames:calculateDuration(props)})}
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
