export const MASTER_V1 = {
  id: "TACTIC_MASTER_V1",
  reference: "V23",
  fps: 30,
  width: 1080,
  height: 1920,
  transitionFrames: 12,
  statsFrames: 498,
  introFrames: 105,
  presentationFrames: 230,
  resultFrames: 270,
  motmFrames: 225,
  outroFrames: 120,
  defaultGoalSeconds: 10.5,
  maxGoalSeconds: 12,
  minGoalSeconds: 6,
  timelineMaxMinute: 90,
  teamTintOpacity: 0.15,
  locked: true,
} as const;

export const MASTER_V1_STAT_ORDER = [
  "shots",
  "shots_on_target",
  "big_chances",
  "xg",
  "possession",
] as const;

export const MASTER_V1_RULES = [
  "TACTIC SPORT brand logo is fixed to public/assets/brand/TACTIC_SPORT_MASTER.png and can never be overridden by a match payload.",
  "V23 is the immutable visual master.",
  "No baked team colors: all team accents come from design.homeColor and design.awayColor.",
  "The stadium is the neutral base layer; team tints remain translucent.",
  "Goal lower thirds animate in. Never render an assist line when assist is empty.",
  "Result events stay at their true minute positions while text may offset to avoid collisions.",
  "The result timeline grows from 0 to 90 and reveals events chronologically.",
  "Statistics use Version-B choreography: hero entry, count-up, settle to stack, next card.",
  "MOTM begins closed, opens from center, then reveals player, badge, name and metrics.",
  "Transitions are short crossfades. Black-frame transitions are forbidden.",
  "Background music is continuous; match commentary/audio remains audible over the music bed.",
] as const;
