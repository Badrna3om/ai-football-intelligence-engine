import React from "react";
import {z} from "zod";
import {
  TacticMatch,
  tacticMatchSchema,
  defaultMatch,
  calculateDuration,
} from "./TacticMatchV3";
import {
  TacticStatsHilalReference,
  calculateHilalStatsDuration,
} from "./stats-hilal-reference/TacticStatsHilalReference";
import {
  TacticStatsHilalStackV2,
  calculateHilalStackV2Duration,
} from "./stats-hilal-reference/TacticStatsHilalStackV2";

export const tacticMotionRouterSchema = tacticMatchSchema.extend({
  compositionId: z.string().optional(),
  includeMotm: z.boolean().optional(),
}).passthrough();

export type TacticMotionRouterProps = z.infer<typeof tacticMotionRouterSchema>;

export const defaultRouterProps: TacticMotionRouterProps = {
  ...defaultMatch,
  compositionId: "TacticMatch",
};

export const calculateRouterDuration = (props: TacticMotionRouterProps) => {\n  if (props.compositionId === "TacticMasterV1") {\n    return calculateMasterV1Duration(props as any);\n  }
  if (props.compositionId === "TacticStatsHilalStackV2") {
    return calculateHilalStackV2Duration();
  }
  if (props.compositionId === "TacticStatsHilalReference") {
    return calculateHilalStatsDuration(props as any);
  }
  return calculateDuration(props as any);
};

export const TacticMotionRouter: React.FC<TacticMotionRouterProps> = (props) => {\n  if (props.compositionId === "TacticMasterV1") {\n    return <TacticMasterV1 {...(props as any)} />;\n  }
  if (props.compositionId === "TacticStatsHilalStackV2") {
    return <TacticStatsHilalStackV2 {...(props as any)} />;
  }
  if (props.compositionId === "TacticStatsHilalReference") {
    return <TacticStatsHilalReference {...(props as any)} />;
  }
  return <TacticMatch {...(props as any)} />;
};
