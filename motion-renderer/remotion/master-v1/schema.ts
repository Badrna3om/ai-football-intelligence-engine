import {z} from "zod";
import {tacticMatchSchema as baseSchema, defaultMatch as baseDefault} from "../TacticMatchV2";

export const masterTimelineEventSchema = z.object({
  minute: z.union([z.number(), z.string()]),
  displayMinute: z.string().optional(),
  type: z.enum(["goal", "yellow_card", "red_card", "penalty", "event"]).default("event"),
  teamSide: z.enum(["home", "away"]),
  player: z.string().optional(),
  label: z.string().optional(),
}).passthrough();

export const tacticMasterV1Schema = baseSchema.extend({
  compositionId: z.literal("TacticMasterV1").optional(),
  templateVersion: z.string().optional(),
  dateLabel: z.string().optional(),
  timeLabel: z.string().optional(),
  venue: z.string().optional(),
  referee: z.string().optional(),
  homeRank: z.union([z.string(), z.number()]).optional(),
  awayRank: z.union([z.string(), z.number()]).optional(),
  timelineEvents: z.array(masterTimelineEventSchema).optional(),
}).passthrough();

export type TacticMasterV1Props = z.infer<typeof tacticMasterV1Schema>;

export const defaultMasterV1Props:TacticMasterV1Props = {
  ...baseDefault,
  compositionId: "TacticMasterV1",
  templateVersion: "TACTIC_MASTER_V1",
  gameId: 4788292,
  competition: "دوري روشن السعودي",
  round: 6,
  homeTeam: "النصر",
  awayTeam: "أبها",
  score: "2 - 1",
  dateLabel: "9 سبتمبر 2026",
  timeLabel: "9:00 م",
  venue: "الأول بارك",
  referee: "شكري الحنفوش",
  homeRank: 2,
  awayRank: 18,
  goals: [
    {minute:22, displayMinute:"22′", scorer:"كريستيانو رونالدو", team:"النصر", teamSide:"home", assist:"أنجيلو بورجيس", scoreAfter:"1 - 0", durationInSeconds:12},
    {minute:58, displayMinute:"58′", scorer:"عبدالله الحمدان", team:"النصر", teamSide:"home", assist:null, scoreAfter:"2 - 0", durationInSeconds:12},
    {minute:75, displayMinute:"75′", scorer:"نبيل فقير", team:"أبها", teamSide:"away", assist:null, scoreAfter:"2 - 1", durationInSeconds:9},
  ],
  timelineEvents: [
    {minute:22, type:"goal", teamSide:"home", player:"كريستيانو رونالدو", label:"هدف"},
    {minute:58, type:"goal", teamSide:"home", player:"عبدالله الحمدان", label:"هدف"},
    {minute:64, type:"yellow_card", teamSide:"away", player:"بدر المطيري", label:"بطاقة صفراء"},
    {minute:75, type:"goal", teamSide:"away", player:"نبيل فقير", label:"هدف"},
  ],
  statsCards: [
    {id:"shots", headline:"التسديدات", homeValue:19, awayValue:5},
    {id:"shots_on_target", headline:"على المرمى", homeValue:6, awayValue:2},
    {id:"big_chances", headline:"الفرص الكبيرة", homeValue:3, awayValue:0},
    {id:"xg", headline:"الأهداف المتوقعة xG", homeValue:1.13, awayValue:0.26},
    {id:"possession", headline:"الاستحواذ", homeValue:67, awayValue:33},
  ],
  starPlayer: {
    name:"كريستيانو رونالدو",
    team:"النصر",
    rating:8.4,
    position:"ST",
    minutes:90,
    goals:1,
    assists:0,
  },
  design: {homeColor:"#F7D117", awayColor:"#2D9CFF"},
};
