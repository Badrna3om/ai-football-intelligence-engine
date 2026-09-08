import React from "react";
import {Composition} from "remotion";
import {TacticMatch,tacticMatchSchema,defaultMatch,calculateDuration} from "./TacticMatchV6Full";

export const RemotionRoot:React.FC=()=> (
  <Composition
    id="TacticMatch"
    component={TacticMatch}
    durationInFrames={1770}
    fps={30}
    width={1080}
    height={1920}
    schema={tacticMatchSchema}
    defaultProps={defaultMatch}
    calculateMetadata={({props})=>({durationInFrames:calculateDuration(props)})}
  />
);
