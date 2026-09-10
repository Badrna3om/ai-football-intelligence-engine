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
  if (props.compositionId === "TacticStatsHilalReference") {
    return calculateHilalStatsDuration(props as any);
  }
  return calculateDuration(props as any);
};

export const TacticMotionRouter: React.FC<TacticMotionRouterProps> = (props) => {
  if (props.compositionId === "TacticStatsHilalReference") {
    return <TacticStatsHilalReference {...(props as any)} />;
  }
  return <TacticMatch {...(props as any)} />;
};
