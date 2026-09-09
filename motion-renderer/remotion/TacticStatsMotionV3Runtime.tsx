import React from "react";
import type {MatchProps} from "./TacticMatchV6Full";
import {TacticStatsMotionV3,STATS_V3_FRAMES} from "./TacticStatsMotionV3";

const TACTIC_LOGO_URL = "https://drive.usercontent.google.com/download?id=1njAsb_x6rN-el66QpAFKZ0aXWZZYU6Xl&export=download&confirm=t";
const JACKSON_CUTOUT_URL = "https://drive.usercontent.google.com/download?id=19XwXNeGV3JdX2G-_EjLglo8c-QVIvYon&export=download&confirm=t";

export const TacticStatsMotionV3Runtime: React.FC<MatchProps> = (props) => {
  const patched: MatchProps = {
    ...props,
    assets: {
      ...(props.assets || {}),
      tacticLogoUrl: TACTIC_LOGO_URL,
      starPlayerPhotoUrl: JACKSON_CUTOUT_URL,
    },
    starPlayer: props.starPlayer
      ? {...props.starPlayer, photoUrl: JACKSON_CUTOUT_URL}
      : props.starPlayer,
  };

  return <TacticStatsMotionV3 {...patched} />;
};

export {STATS_V3_FRAMES};
