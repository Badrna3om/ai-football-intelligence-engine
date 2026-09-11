import React from "react";
import {z} from "zod";
import {
  TacticMasterV1,
  calculateMasterV1Duration,
} from "./master-v1/TacticMasterV1";
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

export const calculateRouterDuration = (props: TacticMotionRouterProps) => {
  if (props.compositionId === "TacticMasterV1") {
    return calculateMasterV1Duration(props as any);
  }
  if (props.compositionId === "TacticStatsHilalStackV2") {
    return calculateHilalStackV2Duration();
  }
  if (props.compositionId === "TacticStatsHilalReference") {
    return calculateHilalStatsDuration(props as any);
  }
  return calculateDuration(props as any);
};

export const TacticMotionRouter: React.FC<TacticMotionRouterProps> = (props) => {
  if (props.compositionId === "TacticMasterV1") {
    return <TacticMasterV1 {...(props as any)} />;
  }
  if (props.compositionId === "TacticStatsHilalStackV2") {
    return <TacticStatsHilalStackV2 {...(props as any)} />;
  }
  if (props.compositionId === "TacticStatsHilalReference") {
    return <TacticStatsHilalReference {...(props as any)} />;
  }
  return <TacticMatch {...(props as any)} />;
};
