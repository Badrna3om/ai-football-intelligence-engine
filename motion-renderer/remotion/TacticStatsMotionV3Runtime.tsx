import React from "react";
import {staticFile} from "remotion";
import type {MatchProps} from "./TacticMatchV6Full";
import {TacticStatsMotionV3,STATS_V3_FRAMES} from "./TacticStatsMotionV3";

export const TacticStatsMotionV3Runtime: React.FC<MatchProps> = (props) => {
  const tacticLogoUrl = staticFile("TACTIC_SPORT_logo.png");
  const jacksonCutoutUrl = staticFile("jackson_cutout.png");

  const patched: MatchProps = {
    ...props,
    assets: {
      ...(props.assets || {}),
      tacticLogoUrl,
      starPlayerPhotoUrl: jacksonCutoutUrl,
    },
    starPlayer: props.starPlayer
      ? {...props.starPlayer, photoUrl: jacksonCutoutUrl}
      : props.starPlayer,
  };

  return <TacticStatsMotionV3 {...patched} />;
};

export {STATS_V3_FRAMES};
