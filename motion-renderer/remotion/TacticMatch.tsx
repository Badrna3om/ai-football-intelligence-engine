import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily: cairo} = loadFont();

export const FPS = 30;
const OVERLAP = 18;

const storySchema = z
  .object({
    id: z.string().optional(),
    headline: z.string().optional(),
    metric: z.string().optional(),
    homeValue: z.any().optional(),
    awayValue: z.any().optional(),
    homeLabel: z.string().optional(),
    awayLabel: z.string().optional(),
    visual: z.string().optional(),
  })
  .passthrough();

const goalSchema = z
  .object({
    minute: z.any().optional(),
    displayMinute: z.string().optional(),
    scorer: z.string().optional(),
    team: z.string().optional(),
    teamSide: z.string().optional(),
    assist: z.string().nullable().optional(),
    videoUrl: z.string().nullable().optional(),
  })
  .passthrough();

export const tacticMatchSchema = z
  .object({
    githubActionsTest: z.boolean().optional(),
    templateKey: z.string().optional(),
    language: z.string().optional(),
    direction: z.string().optional(),
    fontFamily: z.string().optional(),
    gameId: z.any(),
    competition: z.string().optional(),
    round: z.any().optional(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    score: z.string().optional(),
    introHeadline: z.string().optional(),
    mediaMode: z.string().optional(),
    highlightsVideoUrl: z.string().nullable().optional(),
    highlightsStartSeconds: z.number().optional(),
    goals: z.array(goalSchema).optional(),
    statsCards: z.array(storySchema).optional(),
    starPlayer: z.any().optional(),
    match: z.any().optional(),
    assets: z.any().optional(),
    motionTiming: z.any().optional(),
    design: z.any().optional(),
    musicUrl: z.string().nullable().optional(),
    previewCardsOnly: z.boolean().optional(),
  })
  .passthrough();

export const matchSchema = tacticMatchSchema;
export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  gameId: "preview",
  competition: "TACTIC SPORT",
  round: "",
  homeTeam: "الفريق الأول",
  awayTeam: "الفريق الثاني",
  score: "3 - 2",
  goals: [],
  statsCards: [
    {id: "shots", homeValue: 18, awayValue: 11},
    {id: "shots_on_target", homeValue: 8, awayValue: 4},
    {id: "big_chances", homeValue: 5, awayValue: 2},
    {id: "xg", homeValue: 2.31, awayValue: 1.24},
    {id: "possession", homeValue: 57, awayValue: 43},
  ],
};

const sec = (v: any, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const timings = (p: MatchProps) => ({
  intro: Math.round(sec(p.motionTiming?.introSeconds, 3.2) * FPS),
  matchup: Math.round(sec(p.motionTiming?.matchupSeconds, 4.2) * FPS),
  score: Math.round(sec(p.motionTiming?.finalScoreSeconds, 4.1) * FPS),
  goal: Math.round(sec(p.motionTiming?.goalSeconds, 6.2) * FPS),
  highlights: Math.round(sec(p.motionTiming?.highlightsSeconds, 8) * FPS),
  stat: Math.round(sec(p.motionTiming?.statsCardSeconds, 3.7) * FPS),
  star: Math.round(sec(p.motionTiming?.starPlayerSeconds, 5.2) * FPS),
  outro: Math.round(sec(p.motionTiming?.outroSeconds, 3.8) * FPS),
});

const stat = (p: MatchProps, id: string) =>
  p.statsCards?.find((s: any) => String(s.id) === id);

const hasExactGoalClips = (p: MatchProps) =>
  Array.isArray(p.goals) && p.goals.some((g: any) => Boolean(g.videoUrl));

const addWithOverlap = (cursor: number, duration: number) =>
  cursor === 0 ? duration : Math.max(1, duration - OVERLAP);

export const calculateDuration = (p: MatchProps) => {
  const t = timings(p);
  const shots = stat(p, "shots");
  const onTarget = stat(p, "shots_on_target");
  const big = stat(p, "big_chances");
  const xg = stat(p, "xg");
  const possession = stat(p, "possession");

  if (p.previewCardsOnly) {
    const list = [shots, onTarget, big, xg, possession].filter(Boolean);
    const star = p.starPlayer ? 1 : 0;
    return Math.max(
      1,
      list.length * t.stat + star * t.star -
        Math.max(0, list.length + star - 1) * OVERLAP,
    );
  }

  const durations: number[] = [t.intro, t.matchup, t.score];
  for (const _goal of p.goals || []) durations.push(t.goal);
  if (p.highlightsVideoUrl && !hasExactGoalClips(p)) durations.push(t.highlights);
  if (shots) durations.push(t.stat);
  if (onTarget) durations.push(t.stat);
  if (big) durations.push(t.stat);
  if (xg) durations.push(t.stat);
  if (possession) durations.push(t.stat);
  if (p.starPlayer) durations.push(t.star);
  durations.push(t.outro);

  return Math.max(
    1,
    durations.reduce((sum, d) => sum + d, 0) -
      Math.max(0, durations.length - 1) * OVERLAP,
  );
};

const C = {
  bg: "#02070b",
  bg2: "#07141e",
  white: "#f7fbff",
  muted: "#9fb0bd",
  cyan: "#35d7ff",
  gold: "#e4bd62",
  line: "rgba(255,255,255,.14)",
};

const num = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const txt = (v: any, fallback = "") => String(v ?? fallback);
const homeColor = (p: MatchProps) => p.design?.homeColor || C.cyan;
const awayColor = (p: MatchProps) => p.design?.awayColor || C.gold;
const homeBadge = (p: MatchProps) =>
  p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p: MatchProps) =>
  p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const tacticLogo = (p: MatchProps) =>
  p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");
const stadium = (p: MatchProps) =>
  p.assets?.stadiumImageUrl || p.match?.stadium?.imageUrl || null;
const music = (p: MatchProps) =>
  p.musicUrl || p.assets?.musicUrl || p.assets?.backgroundMusicUrl || null;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const ease = (frame: number, a: number, b: number, from: number, to: number) =>
  interpolate(frame, [a, b], [from, to], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const sceneAlpha = (frame: number, duration: number) => {
  const fade = Math.min(OVERLAP, Math.max(8, Math.floor(duration / 5)));
  return interpolate(
    frame,
    [0, fade, Math.max(fade + 1, duration - fade), duration - 1],
    [0, 1, 1, 0],
    clamp,
  );
};

const countTo = (
  value: any,
  frame: number,
  start = 6,
  end = 40,
  decimals = 0,
) => {
  const v = num(value);
  const n = interpolate(frame, [start, end], [0, v], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
};

const Background: React.FC<{p: MatchProps; intensity?: number}> = ({
  p,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const zoom = 1.04 + frame * 0.00016;
  const bg = stadium(p);
  const sweep = interpolate(frame % 180, [0, 179], [-350, 1450]);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: "hidden"}}>
      {bg ? (
        <Img
          src={bg}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${zoom}) translateY(${Math.sin(frame / 45) * 8}px)`,
            filter: "saturate(.74) contrast(1.12) brightness(.42)",
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 18%, #123148 0%, #06131d 36%, #02070b 76%)",
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,7,12,.28) 45%,rgba(0,3,7,.86))",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.26 * intensity,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",
          backgroundSize: "86px 86px",
          transform: `perspective(800px) rotateX(67deg) translateY(${520 + frame * 0.25}px) scale(1.6)`,
          transformOrigin: "center bottom",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -320,
          left: sweep,
          width: 110,
          height: 2500,
          transform: "rotate(18deg)",
          background:
            "linear-gradient(90deg,transparent,rgba(106,222,255,.22),rgba(255,235,184,.18),transparent)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

const BrandMini: React.FC<{p: MatchProps}> = ({p}) => (
  <Img
    src={tacticLogo(p)}
    style={{
      position: "absolute",
      top: 52,
      left: 52,
      height: 72,
      maxWidth: 250,
      objectFit: "contain",
      zIndex: 50,
      filter: "drop-shadow(0 10px 24px rgba(0,0,0,.45))",
    }}
  />
);

const TeamLogo: React.FC<{
  src: string | null;
  color: string;
  size?: number;
}> = ({src, color, size = 235}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(circle,${color}22 0%,rgba(0,9,16,.68) 64%,rgba(0,0,0,.82) 100%)`,
      border: `1px solid ${color}66`,
      boxShadow: `0 0 80px ${color}22, inset 0 0 35px rgba(255,255,255,.03)`,
    }}
  >
    {src ? (
      <Img src={src} style={{width: "76%", height: "76%", objectFit: "contain"}} />
    ) : null}
  </div>
);

const IntroScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: {damping: 13, stiffness: 115, mass: 0.72},
  });
  const scale = 0.68 + s * 0.34;
  const alpha = sceneAlpha(frame, duration);
  const light = ease(frame, 0, 24, -650, 1450);
  return (
    <AbsoluteFill style={{opacity: alpha, background: "#000", overflow: "hidden"}}>
      <Background p={p} intensity={0.45} />
      <div
        style={{
          position: "absolute",
          top: -400,
          left: light,
          width: 95,
          height: 2700,
          transform: "rotate(19deg)",
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,.8),rgba(91,215,255,.38),transparent)",
          filter: "blur(12px)",
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <Img
          src={tacticLogo(p)}
          style={{
            width: 570,
            maxHeight: 310,
            objectFit: "contain",
            transform: `scale(${scale})`,
            filter:
              "drop-shadow(0 0 46px rgba(53,215,255,.16)) drop-shadow(0 24px 46px rgba(0,0,0,.55))",
          }}
        />
        <div
          style={{
            marginTop: 42,
            fontFamily: cairo,
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: 3,
            color: "rgba(255,255,255,.74)",
            transform: `translateY(${ease(frame, 8, 28, 34, 0)}px)`,
            opacity: ease(frame, 8, 25, 0, 1),
          }}
        >
          THE HOME OF FOOTBALL DATA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MatchupScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const alpha = sceneAlpha(frame, duration);
  const enter = ease(frame, 0, 26, 0, 1);
  const depth = ease(frame, 0, duration - 1, 1.08, 1.18);
  const logoScale = 0.48 + enter * 0.52;
  return (
    <AbsoluteFill style={{opacity: alpha, overflow: "hidden", fontFamily: cairo}}>
      <Background p={p} />
      <BrandMini p={p} />
      <AbsoluteFill
        style={{
          transform: `scale(${depth})`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 255,
            color: C.muted,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {txt(p.competition)} {p.round ? `• الجولة ${p.round}` : ""}
        </div>
        <div
          style={{
            width: 930,
            display: "grid",
            gridTemplateColumns: "1fr 170px 1fr",
            alignItems: "center",
            direction: "ltr",
          }}
        >
          <div
            style={{
              textAlign: "center",
              transform: `translateX(${(1 - enter) * -180}px) scale(${logoScale})`,
            }}
          >
            <div style={{display: "flex", justifyContent: "center"}}>
              <TeamLogo src={homeBadge(p)} color={homeColor(p)} />
            </div>
            <div style={{fontSize: 42, fontWeight: 900, color: C.white, marginTop: 24}}>
              {p.homeTeam}
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 36,
              fontWeight: 900,
              color: "rgba(255,255,255,.6)",
              transform: `scale(${0.7 + enter * 0.3})`,
            }}
          >
            VS
          </div>
          <div
            style={{
              textAlign: "center",
              transform: `translateX(${(1 - enter) * 180}px) scale(${logoScale})`,
            }}
          >
            <div style={{display: "flex", justifyContent: "center"}}>
              <TeamLogo src={awayBadge(p)} color={awayColor(p)} />
            </div>
            <div style={{fontSize: 42, fontWeight: 900, color: C.white, marginTop: 24}}>
              {p.awayTeam}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ScoreScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const alpha = sceneAlpha(frame, duration);
  const parts = txt(p.score, "0 - 0").split("-").map((x) => x.trim());
  const h = num(parts[0]);
  const a = num(parts[1]);
  const impact = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: {damping: 11, stiffness: 170, mass: 0.55},
  });
  const scoreScale = 0.64 + impact * 0.36;
  const ring = ease(frame, 8, 44, 0.3, 1.35);
  return (
    <AbsoluteFill style={{opacity: alpha, fontFamily: cairo, overflow: "hidden"}}>
      <Background p={p} intensity={0.8} />
      <BrandMini p={p} />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,.08)",
          left: 180,
          top: 610,
          transform: `scale(${ring})`,
          opacity: ease(frame, 7, 34, 0.8, 0),
          boxShadow: "0 0 90px rgba(80,209,255,.13)",
        }}
      />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div style={{fontSize: 29, fontWeight: 800, color: C.muted, marginBottom: 28}}>
          النتيجة النهائية
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 58,
            transform: `scale(${scoreScale})`,
            direction: "ltr",
          }}
        >
          <div style={{textAlign: "center", width: 250}}>
            <div style={{display: "flex", justifyContent: "center"}}>
              <TeamLogo src={homeBadge(p)} color={homeColor(p)} size={150} />
            </div>
            <div style={{fontSize: 112, lineHeight: 1, fontWeight: 950, color: homeColor(p), marginTop: 26}}>
              {countTo(h, frame, 3, 24)}
            </div>
            <div style={{fontSize: 28, fontWeight: 900, color: C.white, marginTop: 18}}>{p.homeTeam}</div>
          </div>
          <div style={{fontSize: 56, color: "rgba(255,255,255,.34)", fontWeight: 300}}>—</div>
          <div style={{textAlign: "center", width: 250}}>
            <div style={{display: "flex", justifyContent: "center"}}>
              <TeamLogo src={awayBadge(p)} color={awayColor(p)} size={150} />
            </div>
            <div style={{fontSize: 112, lineHeight: 1, fontWeight: 950, color: awayColor(p), marginTop: 26}}>
              {countTo(a, frame, 3, 24)}
            </div>
            <div style={{fontSize: 28, fontWeight: 900, color: C.white, marginTop: 18}}>{p.awayTeam}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            width: 770,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px 18px",
            opacity: ease(frame, 24, 45, 0, 1),
          }}
        >
          {(p.goals || []).map((g: any, i: number) => (
            <span
              key={`${g.scorer || "goal"}-${i}`}
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,.78)",
                padding: "8px 14px",
                border: "1px solid rgba(255,255,255,.10)",
                borderRadius: 999,
                background: "rgba(1,9,15,.46)",
              }}
            >
              {g.scorer || "هدف"} {g.displayMinute || g.minute || ""}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GoalScene: React.FC<{
  p: MatchProps;
  goal: any;
  index: number;
  duration: number;
}> = ({p, goal, index, duration}) => {
  const frame = useCurrentFrame();
  const alpha = sceneAlpha(frame, duration);
  const side = txt(goal.teamSide).toLowerCase() === "away" ? "away" : "home";
  const color = side === "home" ? homeColor(p) : awayColor(p);
  const reveal = ease(frame, 0, 20, 0.78, 1);
  const clip = ease(frame, 0, 22, 42, 0);
  return (
    <AbsoluteFill style={{opacity: alpha, background: "#000", overflow: "hidden", fontFamily: cairo}}>
      {goal.videoUrl ? (
        <OffthreadVideo
          src={goal.videoUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${reveal})`,
            clipPath: `inset(${clip}% ${clip * 0.45}% ${clip}% ${clip * 0.45}% round ${Math.max(0, 32 - clip * 0.5)}px)`,
          }}
        />
      ) : (
        <Background p={p} />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(0,0,0,.26),transparent 42%,rgba(0,0,0,.72))",
        }}
      />
      <BrandMini p={p} />
      <div
        style={{
          position: "absolute",
          top: 190,
          right: 60,
          fontSize: 26,
          color: C.white,
          fontWeight: 900,
          padding: "10px 18px",
          borderRadius: 999,
          background: `linear-gradient(90deg,${color}cc,rgba(4,10,16,.82))`,
          boxShadow: `0 0 40px ${color}44`,
        }}
      >
        الهدف {index + 1}
      </div>
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          bottom: 120,
          padding: "28px 32px",
          borderRadius: 28,
          background: "linear-gradient(180deg,rgba(3,13,20,.35),rgba(1,8,13,.84))",
          border: "1px solid rgba(255,255,255,.10)",
          backdropFilter: "blur(8px)",
          transform: `translateY(${ease(frame, 7, 30, 90, 0)}px)`,
        }}
      >
        <div style={{fontSize: 48, fontWeight: 950, color: C.white}}>{goal.scorer || "هدف"}</div>
        <div style={{display: "flex", gap: 16, marginTop: 8, fontSize: 26, color: "rgba(255,255,255,.75)"}}>
          <span>{goal.team || (side === "home" ? p.homeTeam : p.awayTeam)}</span>
          <span style={{color}}>{goal.displayMinute || goal.minute || ""}</span>
          {goal.assist ? <span>• صناعة {goal.assist}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const HighlightsScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: sceneAlpha(frame, duration), background: "#000", fontFamily: cairo}}>
      {p.highlightsVideoUrl ? (
        <OffthreadVideo
          src={p.highlightsVideoUrl}
          startFrom={Math.round((p.highlightsStartSeconds || 0) * FPS)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      ) : null}
      <AbsoluteFill style={{background: "linear-gradient(180deg,rgba(0,0,0,.12),transparent 60%,rgba(0,0,0,.55))"}} />
      <BrandMini p={p} />
      <div style={{position: "absolute", top: 165, right: 58, fontSize: 28, fontWeight: 950, color: C.white}}>
        ملخص المباراة
      </div>
    </AbsoluteFill>
  );
};

const StatShell: React.FC<{
  p: MatchProps;
  duration: number;
  title: string;
  kicker: string;
  children: React.ReactNode;
}> = ({p, duration, title, kicker, children}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: sceneAlpha(frame, duration), fontFamily: cairo, overflow: "hidden"}}>
      <Background p={p} intensity={0.7} />
      <BrandMini p={p} />
      <div style={{position: "absolute", top: 185, right: 58, direction: "rtl"}}>
        <div style={{fontSize: 20, letterSpacing: 2, fontWeight: 800, color: C.muted}}>{kicker}</div>
        <div style={{fontSize: 54, fontWeight: 950, color: C.white, marginTop: 4}}>{title}</div>
      </div>
      {children}
    </AbsoluteFill>
  );
};

const ValuePair: React.FC<{
  p: MatchProps;
  frame: number;
  home: any;
  away: any;
  decimals?: number;
  suffix?: string;
}> = ({p, frame, home, away, decimals = 0, suffix = ""}) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      right: 70,
      bottom: 155,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      direction: "ltr",
    }}
  >
    <div>
      <div style={{fontSize: 27, fontWeight: 800, color: C.muted}}>{p.homeTeam}</div>
      <div style={{fontSize: 82, fontWeight: 950, lineHeight: 1, color: homeColor(p)}}>
        {countTo(home, frame, 4, 38, decimals)}{suffix}
      </div>
    </div>
    <div style={{textAlign: "right"}}>
      <div style={{fontSize: 27, fontWeight: 800, color: C.muted}}>{p.awayTeam}</div>
      <div style={{fontSize: 82, fontWeight: 950, lineHeight: 1, color: awayColor(p)}}>
        {countTo(away, frame, 4, 38, decimals)}{suffix}
      </div>
    </div>
  </div>
);

const ShotsScene: React.FC<{p: MatchProps; story: any; duration: number}> = ({p, story, duration}) => {
  const frame = useCurrentFrame();
  const h = num(story.homeValue);
  const a = num(story.awayValue);
  const trails = Math.max(5, Math.min(14, Math.round((h + a) / 3)));
  return (
    <StatShell p={p} duration={duration} title="التسديدات" kicker="ATTACK VOLUME">
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 535,
          height: 620,
          border: "2px solid rgba(255,255,255,.22)",
          borderBottomWidth: 7,
          transform: "perspective(950px) rotateX(9deg)",
          boxShadow: "inset 0 0 80px rgba(53,215,255,.04)",
        }}
      >
        {Array.from({length: trails}).map((_, i) => {
          const progress = interpolate(frame - i * 3, [0, 34], [0, 1], clamp);
          const fromLeft = i % 2 === 0;
          const x = fromLeft ? 80 + (i * 47) % 300 : 690 - (i * 39) % 300;
          const endX = 350 + ((i * 83) % 170) - 85;
          const endY = 95 + ((i * 67) % 300);
          const dx = (endX - x) * progress;
          const dy = (endY - 520) * progress;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const length = Math.sqrt(dx * dx + dy * dy);
          const color = fromLeft ? homeColor(p) : awayColor(p);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 520,
                width: length,
                height: 3,
                transformOrigin: "left center",
                transform: `rotate(${angle}deg)`,
                background: `linear-gradient(90deg,transparent,${color})`,
                boxShadow: `0 0 12px ${color}`,
                opacity: 0.72,
              }}
            />
          );
        })}
      </div>
      <ValuePair p={p} frame={frame} home={h} away={a} />
    </StatShell>
  );
};

const OnTargetScene: React.FC<{p: MatchProps; story: any; duration: number}> = ({p, story, duration}) => {
  const frame = useCurrentFrame();
  const h = Math.max(0, Math.round(num(story.homeValue)));
  const a = Math.max(0, Math.round(num(story.awayValue)));
  const dots = Math.min(18, h + a);
  return (
    <StatShell p={p} duration={duration} title="على المرمى" kicker="TARGET ACCURACY">
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 430,
          left: 180,
          top: 600,
          border: "8px solid rgba(255,255,255,.82)",
          borderBottomWidth: 12,
          boxShadow: "0 0 40px rgba(255,255,255,.10)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      >
        {Array.from({length: dots}).map((_, i) => {
          const isHome = i < h;
          const delay = i * 3;
          const pgr = interpolate(frame - delay, [0, 22], [0, 1], clamp);
          const x = 55 + ((i * 131) % 590);
          const y = 55 + ((i * 97) % 300);
          const color = isHome ? homeColor(p) : awayColor(p);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 23,
                height: 23,
                borderRadius: "50%",
                background: color,
                transform: `scale(${pgr})`,
                opacity: pgr,
                boxShadow: `0 0 20px ${color}`,
              }}
            />
          );
        })}
      </div>
      <ValuePair p={p} frame={frame} home={h} away={a} />
    </StatShell>
  );
};

const BigChancesScene: React.FC<{p: MatchProps; story: any; duration: number}> = ({p, story, duration}) => {
  const frame = useCurrentFrame();
  const h = Math.max(0, Math.round(num(story.homeValue)));
  const a = Math.max(0, Math.round(num(story.awayValue)));
  const pulses = Math.min(12, h + a);
  return (
    <StatShell p={p} duration={duration} title="الفرص الكبيرة" kicker="HIGH VALUE MOMENTS">
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 520,
          left: 190,
          top: 560,
          border: "2px solid rgba(255,255,255,.23)",
          transform: "perspective(900px) rotateX(56deg)",
          transformOrigin: "center bottom",
        }}
      >
        <div style={{position: "absolute", left: 175, right: 175, top: 0, height: 190, border: "2px solid rgba(255,255,255,.20)"}} />
        <div style={{position: "absolute", left: 270, top: 0, width: 160, height: 70, border: "2px solid rgba(255,255,255,.20)"}} />
        {Array.from({length: pulses}).map((_, i) => {
          const isHome = i < h;
          const phase = Math.max(0, frame - i * 4);
          const pulse = 0.7 + Math.sin(phase / 5) * 0.22;
          const color = isHome ? homeColor(p) : awayColor(p);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 70 + ((i * 113) % 545),
                top: 70 + ((i * 79) % 360),
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `3px solid ${color}`,
                transform: `scale(${phase > 0 ? pulse : 0})`,
                boxShadow: `0 0 28px ${color}`,
              }}
            />
          );
        })}
      </div>
      <ValuePair p={p} frame={frame} home={h} away={a} />
    </StatShell>
  );
};

const XgScene: React.FC<{p: MatchProps; story: any; duration: number}> = ({p, story, duration}) => {
  const frame = useCurrentFrame();
  const h = num(story.homeValue);
  const a = num(story.awayValue);
  const max = Math.max(0.1, h, a);
  const hp = interpolate(frame, [4, 44], [0, h / max], {...clamp, easing: Easing.out(Easing.cubic)});
  const ap = interpolate(frame, [4, 44], [0, a / max], {...clamp, easing: Easing.out(Easing.cubic)});
  const row = (name: string, value: number, progress: number, color: string) => (
    <div style={{marginBottom: 70}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 15, direction: "ltr"}}>
        <span style={{fontSize: 28, color: C.white, fontWeight: 850}}>{name}</span>
        <span style={{fontSize: 56, color, fontWeight: 950}}>{countTo(value, frame, 4, 40, 2)}</span>
      </div>
      <div style={{height: 24, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden"}}>
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg,${color}55,${color})`,
            boxShadow: `0 0 24px ${color}`,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
  return (
    <StatShell p={p} duration={duration} title="الأهداف المتوقعة xG" kicker="EXPECTED GOALS">
      <div style={{position: "absolute", left: 100, right: 100, top: 630}}>
        {row(p.homeTeam, h, hp, homeColor(p))}
        {row(p.awayTeam, a, ap, awayColor(p))}
      </div>
    </StatShell>
  );
};

const PossessionScene: React.FC<{p: MatchProps; story: any; duration: number}> = ({p, story, duration}) => {
  const frame = useCurrentFrame();
  const h = Math.max(0, Math.min(100, num(story.homeValue, 50)));
  const a = Math.max(0, Math.min(100, num(story.awayValue, 100 - h)));
  const total = Math.max(1, h + a);
  const target = (h / total) * 100;
  const split = interpolate(frame, [4, 42], [50, target], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <StatShell p={p} duration={duration} title="الاستحواذ" kicker="CONTROL OF THE GAME">
      <div style={{position: "absolute", left: 80, right: 80, top: 660}}>
        <div style={{height: 90, display: "flex", overflow: "hidden", borderRadius: 45, border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 24px 70px rgba(0,0,0,.32)"}}>
          <div style={{width: `${split}%`, background: `linear-gradient(90deg,${homeColor(p)}55,${homeColor(p)})`, transition: "none"}} />
          <div style={{width: `${100 - split}%`, background: `linear-gradient(90deg,${awayColor(p)},${awayColor(p)}55)`}} />
        </div>
        <div style={{display: "flex", justifyContent: "space-between", marginTop: 46, direction: "ltr"}}>
          <div>
            <div style={{fontSize: 30, color: C.muted, fontWeight: 800}}>{p.homeTeam}</div>
            <div style={{fontSize: 96, color: homeColor(p), fontWeight: 950}}>{countTo(h, frame, 4, 42)}%</div>
          </div>
          <div style={{textAlign: "right"}}>
            <div style={{fontSize: 30, color: C.muted, fontWeight: 800}}>{p.awayTeam}</div>
            <div style={{fontSize: 96, color: awayColor(p), fontWeight: 950}}>{countTo(a, frame, 4, 42)}%</div>
          </div>
        </div>
      </div>
    </StatShell>
  );
};

const StarScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const star = p.starPlayer || {};
  const photo = star.imageUrl || star.photoUrl || star.playerImageUrl || p.assets?.starPlayerImageUrl || null;
  const name = star.name || star.playerName || "نجم المباراة";
  const rating = star.rating ?? star.score ?? null;
  const stats = Array.isArray(star.stats)
    ? star.stats.slice(0, 4)
    : [
        star.goals != null ? {label: "أهداف", value: star.goals} : null,
        star.assists != null ? {label: "تمريرات حاسمة", value: star.assists} : null,
        star.shots != null ? {label: "تسديدات", value: star.shots} : null,
        star.keyPasses != null ? {label: "تمريرات مفتاحية", value: star.keyPasses} : null,
      ].filter(Boolean);
  const alpha = sceneAlpha(frame, duration);
  const photoScale = ease(frame, 0, duration - 1, 1.02, 1.085);
  const reveal = ease(frame, 0, 30, 1, 0);
  return (
    <AbsoluteFill style={{opacity: alpha, fontFamily: cairo, overflow: "hidden", background: C.bg}}>
      <Background p={p} intensity={0.5} />
      <BrandMini p={p} />
      <div
        style={{
          position: "absolute",
          width: 860,
          height: 860,
          borderRadius: "50%",
          left: 110,
          top: 500,
          background: "radial-gradient(circle,rgba(228,189,98,.26),rgba(53,215,255,.10) 38%,transparent 70%)",
          filter: "blur(10px)",
          transform: `scale(${0.82 + ease(frame, 0, 40, 0, 0.22)})`,
        }}
      />
      {photo ? (
        <Img
          src={photo}
          style={{
            position: "absolute",
            height: 1280,
            maxWidth: 950,
            objectFit: "contain",
            left: "50%",
            bottom: -55,
            transform: `translateX(-50%) scale(${photoScale})`,
            filter: "drop-shadow(0 34px 60px rgba(0,0,0,.65))",
          }}
        />
      ) : null}
      <AbsoluteFill style={{background: "linear-gradient(180deg,rgba(0,0,0,.18),transparent 48%,rgba(0,0,0,.80))"}} />
      <div style={{position: "absolute", top: 190, right: 58, textAlign: "right"}}>
        <div style={{fontSize: 23, letterSpacing: 2, color: C.gold, fontWeight: 900}}>MAN OF THE MATCH</div>
        <div style={{fontSize: 60, color: C.white, fontWeight: 950, marginTop: 2}}>نجم المباراة</div>
      </div>
      <div style={{position: "absolute", left: 62, right: 62, bottom: 105, direction: "rtl"}}>
        <div style={{fontSize: 58, color: C.white, fontWeight: 950, textShadow: "0 8px 30px rgba(0,0,0,.65)"}}>{name}</div>
        {rating != null ? (
          <div style={{display: "inline-block", marginTop: 12, padding: "8px 18px", borderRadius: 999, background: C.gold, color: "#111", fontSize: 26, fontWeight: 950}}>
            تقييم {rating}
          </div>
        ) : null}
        <div style={{display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, marginTop: 24}}>
          {stats.map((s: any, i: number) => (
            <div
              key={i}
              style={{
                padding: "18px 20px",
                borderRadius: 20,
                background: "rgba(2,12,19,.70)",
                border: "1px solid rgba(255,255,255,.11)",
                backdropFilter: "blur(8px)",
                transform: `translateY(${Math.max(0, 34 - Math.max(0, frame - i * 5) * 1.5)}px)`,
                opacity: ease(frame, 12 + i * 5, 28 + i * 5, 0, 1),
              }}
            >
              <div style={{fontSize: 20, color: C.muted, fontWeight: 700}}>{s.label || s.name || "إحصائية"}</div>
              <div style={{fontSize: 40, color: C.white, fontWeight: 950}}>{s.value ?? s.stat ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: "absolute", inset: 0, background: "#000", transform: `translateX(${reveal * 100}%)`, opacity: 0.78}} />
    </AbsoluteFill>
  );
};

const OutroScene: React.FC<{p: MatchProps; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 15, stiffness: 105}});
  return (
    <AbsoluteFill style={{opacity: sceneAlpha(frame, duration), background: "#010508", fontFamily: cairo, overflow: "hidden"}}>
      <Background p={p} intensity={0.35} />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
        <div
          style={{
            position: "absolute",
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(53,215,255,.16),rgba(228,189,98,.08) 38%,transparent 72%)",
            transform: `scale(${0.82 + s * 0.18})`,
          }}
        />
        <Img
          src={tacticLogo(p)}
          style={{
            width: 560,
            maxHeight: 300,
            objectFit: "contain",
            transform: `scale(${0.78 + s * 0.22})`,
            filter: "drop-shadow(0 20px 50px rgba(0,0,0,.55))",
          }}
        />
        <div style={{fontSize: 31, color: C.white, fontWeight: 900, marginTop: 34}}>خلف كل مباراة… قصة تحكيها الأرقام</div>
        <div style={{fontSize: 20, color: C.muted, letterSpacing: 2, marginTop: 18}}>TACTIC SPORT</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MusicBed: React.FC<{p: MatchProps; goalRanges: Array<[number, number]>}> = ({p, goalRanges}) => {
  const src = music(p);
  if (!src) return null;
  return (
    <Audio
      src={src}
      loop
      volume={(frame) => {
        const inGoal = goalRanges.some(([a, b]) => frame >= a && frame <= b);
        return inGoal ? 0.12 : 0.34;
      }}
    />
  );
};

export const TacticMatch: React.FC<MatchProps> = (p) => {
  const t = timings(p);
  const shots = stat(p, "shots");
  const onTarget = stat(p, "shots_on_target");
  const big = stat(p, "big_chances");
  const xg = stat(p, "xg");
  const possession = stat(p, "possession");

  const scenes: React.ReactNode[] = [];
  const goalRanges: Array<[number, number]> = [];
  let at = 0;
  let sceneCount = 0;

  const push = (key: string, duration: number, node: React.ReactNode) => {
    scenes.push(
      <Sequence key={key} from={at} durationInFrames={duration} premountFor={FPS}>
        {node}
      </Sequence>,
    );
    sceneCount += 1;
    at += duration - (sceneCount > 0 ? OVERLAP : 0);
  };

  if (p.previewCardsOnly) {
    if (shots) push("preview-shots", t.stat, <ShotsScene p={p} story={shots} duration={t.stat} />);
    if (onTarget) push("preview-on-target", t.stat, <OnTargetScene p={p} story={onTarget} duration={t.stat} />);
    if (big) push("preview-big", t.stat, <BigChancesScene p={p} story={big} duration={t.stat} />);
    if (xg) push("preview-xg", t.stat, <XgScene p={p} story={xg} duration={t.stat} />);
    if (possession) push("preview-possession", t.stat, <PossessionScene p={p} story={possession} duration={t.stat} />);
    if (p.starPlayer) push("preview-star", t.star, <StarScene p={p} duration={t.star} />);
    return <AbsoluteFill style={{background: C.bg}}>{scenes}</AbsoluteFill>;
  }

  push("intro", t.intro, <IntroScene p={p} duration={t.intro} />);
  push("matchup", t.matchup, <MatchupScene p={p} duration={t.matchup} />);
  push("score", t.score, <ScoreScene p={p} duration={t.score} />);

  (p.goals || []).forEach((goal: any, index: number) => {
    const start = at;
    push(`goal-${index}`, t.goal, <GoalScene p={p} goal={goal} index={index} duration={t.goal} />);
    goalRanges.push([Math.max(0, start - 6), start + t.goal - OVERLAP + 6]);
  });

  if (p.highlightsVideoUrl && !hasExactGoalClips(p)) {
    push("highlights", t.highlights, <HighlightsScene p={p} duration={t.highlights} />);
  }

  if (shots) push("shots", t.stat, <ShotsScene p={p} story={shots} duration={t.stat} />);
  if (onTarget) push("on-target", t.stat, <OnTargetScene p={p} story={onTarget} duration={t.stat} />);
  if (big) push("big-chances", t.stat, <BigChancesScene p={p} story={big} duration={t.stat} />);
  if (xg) push("xg", t.stat, <XgScene p={p} story={xg} duration={t.stat} />);
  if (possession) push("possession", t.stat, <PossessionScene p={p} story={possession} duration={t.stat} />);
  if (p.starPlayer) push("star", t.star, <StarScene p={p} duration={t.star} />);
  push("outro", t.outro, <OutroScene p={p} duration={t.outro} />);

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <MusicBed p={p} goalRanges={goalRanges} />
      {scenes}
    </AbsoluteFill>
  );
};
