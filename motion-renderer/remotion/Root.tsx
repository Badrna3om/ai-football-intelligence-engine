import React from "react";
import {Composition} from "remotion";
import {tacticMatchSchema,defaultMatch} from "./TacticMatchV6Full";
import {TacticStatsMotionV3Runtime,STATS_V3_FRAMES} from "./TacticStatsMotionV3Runtime";

export const RemotionRoot:React.FC=()=> (
  <Composition
    id="TacticMatch"
    component={TacticStatsMotionV3Runtime}
    durationInFrames={STATS_V3_FRAMES}
    fps={30}
    width={1080}
    height={1920}
    schema={tacticMatchSchema}
    defaultProps={defaultMatch}
    calculateMetadata={()=>({durationInFrames:STATS_V3_FRAMES})}
  />
);
