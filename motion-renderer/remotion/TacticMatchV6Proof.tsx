import React from "react";
import {
  AbsoluteFill,
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
import {
  TacticMatch as TacticMatchV3,
  tacticMatchSchema as v3Schema,
  defaultMatch as defaultMatchV3,
  calculateDuration as calculateDurationV3,
} from "./TacticMatchV3";

const {fontFamily: cairo} = loadFont();
const ACT_A_FRAMES = 360;

const goalSummarySchema = z.object({
  side: z.enum(["home", "away"]),
  scorer: z.string(),
  minute: z.string(),
  assist: z.string().nullable().optional(),
  note: z.string().optional(),
});

export const tacticMatchSchema = v3Schema.extend({
  v6FirstActPreview: z.boolean().optional(),
  v6FootageUrl: z.string().nullable().optional(),
  v6FirstGoalScorer: z.string().optional(),
  v6FirstGoalMinute: z.string().optional(),
  v6FirstGoalAssist: z.string().nullable().optional(),
  v6FirstGoalTeam: z.string().optional(),
  v6GoalLabel: z.string().optional(),
  v6CompetitionNameAr: z.string().optional(),
  v6VenueAr: z.string().optional(),
  v6RefereeAr: z.string().optional(),
  v6RoundLabel: z.string().optional(),
  v6HomeRankLabel: z.string().optional(),
  v6AwayRankLabel: z.string().optional(),
  v6RankContext: z.string().optional(),
  v6GoalsSummary: z.array(goalSummarySchema).optional(),
});

export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  ...defaultMatchV3,
  v6FirstActPreview: false,
  v6FootageUrl: null,
};

export const calculateDuration = (p: MatchProps) =>
  p.v6FirstActPreview ? ACT_A_FRAMES : calculateDurationV3(p);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.inOut(Easing.cubic);
const mix = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: ease});
const phase = (f: number, a: number, b: number) => mix(f, a, b, 0, 1);

const homeBadge = (p: MatchProps) =>
  p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p: MatchProps) =>
  p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const competitionLogo = (p: MatchProps) => p.assets?.competitionLogoUrl || null;
const tacticLogo = (p: MatchProps) =>
  p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");
const worldFootage = (p: MatchProps) =>
  p.v6FootageUrl || staticFile("v6-world-bg.mp4");
const goalFootage = () => staticFile("v6-goal-window.mp4");

const scoreParts = (p: MatchProps) => {
  const raw = String(
    p.score || `${p.match?.home?.score ?? 0}-${p.match?.away?.score ?? 0}`,
  );
  const parts = raw.split(/[-–:]/).map((x) => Number(x.trim()));
  return {
    home: Number.isFinite(parts[0]) ? parts[0] : Number(p.match?.home?.score ?? 0),
    away: Number.isFinite(parts[1]) ? parts[1] : Number(p.match?.away?.score ?? 0),
  };
};

const Badge: React.FC<{src: string | null; size: number; opacity?: number}> = ({
  src,
  size,
  opacity = 1,
}) => {
  if (!src) return null;
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        opacity,
        filter: "drop-shadow(0 28px 38px rgba(0,0,0,.62))",
      }}
    />
  );
};

const MatchWorld: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const goalMode = phase(f, 235, 270);
  const push = mix(f, 0, 359, 1.055, 1.13);
  const panY = mix(f, 0, 359, 0, -32);
  const blur = mix(goalMode, 0, 1, 2.0, 13);
  const brightness = mix(goalMode, 0, 1, 0.42, 0.28);
  const saturation = mix(goalMode, 0, 1, 0.78, 0.92);

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#02060a"}}>
      <OffthreadVideo
        src={worldFootage(p)}
        volume={0}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 46%",
          transform: `translateY(${panY}px) scale(${push + goalMode * 0.05})`,
          filter: `brightness(${brightness}) saturate(${saturation}) contrast(1.12) blur(${blur}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,rgba(2,6,12,${0.48 + goalMode * 0.10}) 0%,rgba(2,6,12,.10) 34%,rgba(2,6,12,.18) 58%,rgba(2,6,12,${0.72 + goalMode * 0.12}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 34%,rgba(76,154,214,${0.14 * (1 - goalMode)}) 0%,transparent 38%,rgba(1,4,8,.36) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const CompetitionHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const src = competitionLogo(p);
  if (!src) return null;

  const lock = spring({frame: f, fps, config: {damping: 14, stiffness: 105, mass: 0.75}});
  const leave = phase(f, 28, 58);
  const goalFade = 1 - phase(f, 232, 255);
  const heroScale = 0.74 + lock * 0.26;
  const top = mix(f, 28, 64, 900, 150);
  const size = mix(f, 28, 64, 520, 118);
  const halo = 1 - phase(f, 20, 44);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top,
          width: size,
          height: size,
          transform: `translate(-50%,-50%) scale(${heroScale})`,
          zIndex: 30,
          opacity: goalFade,
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Img
            key={i}
            src={src}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: `scale(${1 + (4 - i) * 0.032}) translateY(${(4 - i) * 12 * (1 - lock)}px)`,
              opacity:
                i === 4
                  ? 1
                  : Math.max(0, 1 - leave * 1.5) * (0.05 + i * 0.02),
              filter:
                i === 4
                  ? "drop-shadow(0 28px 44px rgba(0,0,0,.68))"
                  : `blur(${10 - i * 1.5}px) brightness(1.6)`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: mix(f, 0, 38, 560, 220),
          width: 2,
          height: mix(f, 0, 38, 760, 120),
          transform: "translateX(-50%)",
          background:
            "linear-gradient(180deg,transparent,rgba(255,255,255,.94),rgba(226,188,92,.72),transparent)",
          boxShadow: "0 0 28px rgba(255,255,255,.70),0 0 90px rgba(226,188,92,.24)",
          opacity: halo,
        }}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1190,
          textAlign: "center",
          fontFamily: cairo,
          color: "white",
          opacity: phase(f, 12, 26) * (1 - phase(f, 28, 46)),
          transform: `translateY(${mix(f, 12, 26, 24, 0)}px)`,
          textShadow: "0 12px 32px rgba(0,0,0,.78)",
          zIndex: 30,
        }}
      >
        <div style={{fontSize: 44, fontWeight: 900}}>
          {p.v6CompetitionNameAr || "دوري أبطال أوروبا"}
        </div>
      </div>
    </>
  );
};

const TeamField: React.FC<{
  side: "left" | "right";
  colorA: string;
  colorB: string;
  badge: string | null;
  entry: number;
  exit: number;
}> = ({side, colorA, colorB, badge, entry, exit}) => {
  const isLeft = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top: 400,
        bottom: -90,
        width: 690,
        left: isLeft ? -36 : undefined,
        right: isLeft ? undefined : -36,
        transform: `translateX(${(1 - entry) * (isLeft ? -740 : 740) + exit * (isLeft ? -760 : 760)}px)`,
        clipPath: isLeft
          ? "polygon(0 6%,100% 0,79% 100%,0 100%)"
          : "polygon(21% 0,100% 6%,100% 100%,0 100%)",
        background: `linear-gradient(${isLeft ? 145 : 215}deg,${colorA} 0%,${colorB} 72%,rgba(3,8,13,.24) 100%)`,
        backdropFilter: "blur(4px)",
        borderTop: "1px solid rgba(255,255,255,.20)",
        zIndex: 2,
        overflow: "hidden",
        opacity: 1 - exit * 0.94,
      }}
    >
      {badge ? (
        <Img
          src={badge}
          style={{
            position: "absolute",
            width: 820,
            height: 820,
            objectFit: "contain",
            left: isLeft ? -230 : 95,
            right: isLeft ? undefined : -230,
            top: 260,
            opacity: 0.09,
            filter: "grayscale(1) brightness(2.1) blur(1px)",
            transform: `rotate(${isLeft ? -12 : 12}deg)`,
          }}
        />
      ) : null}
    </div>
  );
};

const InfoDatum: React.FC<{
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
}> = ({label, value, x, y, width, opacity}) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      fontFamily: cairo,
      color: "white",
      textAlign: "center",
      opacity,
      textShadow: "0 8px 24px rgba(0,0,0,.78)",
      zIndex: 10,
    }}
  >
    <div style={{fontSize: 17, color: "#e2bc5c", fontWeight: 800, marginBottom: 5}}>
      {label}
    </div>
    <div style={{fontSize: 25, fontWeight: 850, lineHeight: 1.25}}>{value}</div>
  </div>
);

const Matchup: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const raw = spring({frame: Math.max(0, f - 32), fps, config: {damping: 15, stiffness: 108, mass: 0.84}});
  const entry = Math.min(1, raw);
  const show = phase(f, 31, 43);
  const textIn = phase(f, 50, 66);
  const infoIn = phase(f, 73, 98);
  const exit = phase(f, 126, 150);
  const seam = phase(f, 40, 60) * (1 - exit);
  const homeColor = p.design?.homeColor || "#1154D8";
  const awayColor = p.design?.awayColor || "#7A2048";

  return (
    <>
      <div style={{opacity: show}}>
        <TeamField
          side="left"
          colorA={`${homeColor}E8`}
          colorB="rgba(8,28,64,.78)"
          badge={homeBadge(p)}
          entry={entry}
          exit={exit}
        />
        <TeamField
          side="right"
          colorA={`${awayColor}E8`}
          colorB="rgba(48,16,36,.78)"
          badge={awayBadge(p)}
          entry={entry}
          exit={exit}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 450,
          bottom: 0,
          width: 2,
          transform: `translateX(-50%) scaleY(${seam}) rotate(7deg)`,
          transformOrigin: "top",
          background:
            "linear-gradient(180deg,rgba(255,255,255,.72),rgba(226,188,92,.62),transparent)",
          zIndex: 4,
          opacity: show,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 118,
          top: 650,
          zIndex: 7,
          opacity: show * (1 - exit),
          transform: `translateY(${(1 - entry) * 70}px) scale(${0.88 + entry * 0.12})`,
        }}
      >
        <Badge src={homeBadge(p)} size={330} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 105,
          top: 665,
          zIndex: 7,
          opacity: show * (1 - exit),
          transform: `translateY(${(1 - entry) * -70}px) scale(${0.88 + entry * 0.12})`,
        }}
      >
        <Badge src={awayBadge(p)} size={350} />
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 60,
          top: 1090,
          width: 430,
          zIndex: 8,
          fontFamily: cairo,
          color: "white",
          opacity: textIn * (1 - exit),
          textAlign: "center",
          textShadow: "0 12px 34px rgba(0,0,0,.72)",
        }}
      >
        <div style={{fontSize: 51, fontWeight: 950, lineHeight: 1.05}}>{p.homeTeam}</div>
        <div style={{fontSize: 20, opacity: 0.72, marginTop: 10}}>
          المركز: {p.v6HomeRankLabel || "—"}
        </div>
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 60,
          top: 1090,
          width: 430,
          zIndex: 8,
          fontFamily: cairo,
          color: "white",
          opacity: textIn * (1 - exit),
          textAlign: "center",
          textShadow: "0 12px 34px rgba(0,0,0,.72)",
        }}
      >
        <div style={{fontSize: 51, fontWeight: 950, lineHeight: 1.05}}>{p.awayTeam}</div>
        <div style={{fontSize: 20, opacity: 0.72, marginTop: 10}}>
          المركز: {p.v6AwayRankLabel || "—"}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 1035,
          transform: `translate(-50%,-50%) scale(${0.8 + seam * 0.2})`,
          color: "rgba(255,255,255,.82)",
          fontFamily: cairo,
          fontSize: 27,
          fontWeight: 900,
          letterSpacing: 4,
          opacity: seam,
          zIndex: 9,
        }}
      >
        VS
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          top: 1315,
          height: 1,
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)",
          opacity: infoIn * (1 - exit),
          zIndex: 9,
        }}
      />

      <InfoDatum label="الملعب" value={p.v6VenueAr || "ملعب يان بريديل"} x={55} y={1360} width={470} opacity={infoIn * (1 - exit)} />
      <InfoDatum label="الحكم" value={p.v6RefereeAr || "ساندرو شيرر"} x={555} y={1360} width={470} opacity={infoIn * (1 - exit)} />
      <InfoDatum label="الجولة" value={p.v6RoundLabel || "الجولة 1"} x={55} y={1500} width={470} opacity={infoIn * (1 - exit)} />
      <InfoDatum label="الترتيب" value={p.v6RankContext || "الجولة الافتتاحية — غير مكتمل"} x={555} y={1500} width={470} opacity={infoIn * (1 - exit)} />
    </>
  );
};

const GoalRow: React.FC<{g: z.infer<typeof goalSummarySchema>; delay: number; base: number}> = ({g, delay, base}) => {
  const f = useCurrentFrame();
  const o = phase(f, base + delay, base + delay + 12);
  return (
    <div
      dir="rtl"
      style={{
        marginBottom: 14,
        opacity: o,
        transform: `translateY(${(1 - o) * 10}px)`,
        textAlign: "right",
      }}
    >
      <div style={{fontSize: 23, fontWeight: 900, color: "white", lineHeight: 1.15}}>
        <span style={{color: "#e2bc5c", marginLeft: 8}}>{g.minute}</span>
        {g.scorer}
      </div>
      <div style={{fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.58)", marginTop: 4}}>
        {g.assist ? `أسيست: ${g.assist}` : g.note || ""}
      </div>
    </div>
  );
};

const ScoreHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const score = scoreParts(p);
  const intro = spring({frame: Math.max(0, f - 135), fps, config: {damping: 12, stiffness: 150, mass: 0.62}});
  const settle = Math.min(1, intro);
  const exit = phase(f, 228, 255);
  const homeNum = Math.round(mix(f, 142, 166, 0, score.home));
  const awayNum = Math.round(mix(f, 142, 166, 0, score.away));
  const visible = phase(f, 130, 145) * (1 - exit);
  const homeGoals = (p.v6GoalsSummary || []).filter((g) => g.side === "home");
  const awayGoals = (p.v6GoalsSummary || []).filter((g) => g.side === "away");

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "390px 0 0 0",
          background: "linear-gradient(90deg,rgba(17,84,216,.34) 0%,rgba(7,15,25,.16) 48%,rgba(122,32,72,.34) 100%)",
          opacity: visible * 0.9,
          zIndex: 3,
        }}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 325,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: cairo,
          fontSize: 30,
          fontWeight: 850,
          color: "rgba(255,255,255,.78)",
          opacity: visible,
          zIndex: 13,
        }}
      >
        النتيجة النهائية
      </div>

      <div
        style={{
          position: "absolute",
          left: 105,
          top: 500,
          width: 330,
          textAlign: "center",
          opacity: visible,
          zIndex: 14,
          transform: `scale(${0.84 + settle * 0.16})`,
        }}
      >
        <div style={{fontFamily: cairo, fontSize: 210, lineHeight: 1, fontWeight: 950, color: "white", textShadow: "0 28px 48px rgba(0,0,0,.55)"}}>{homeNum}</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 105,
          top: 500,
          width: 330,
          textAlign: "center",
          opacity: visible,
          zIndex: 14,
          transform: `scale(${0.84 + settle * 0.16})`,
        }}
      >
        <div style={{fontFamily: cairo, fontSize: 210, lineHeight: 1, fontWeight: 950, color: "white", textShadow: "0 28px 48px rgba(0,0,0,.55)"}}>{awayNum}</div>
      </div>
      <div style={{position: "absolute", left: "50%", top: 590, transform: "translateX(-50%)", color: "rgba(255,255,255,.45)", fontSize: 58, fontWeight: 600, zIndex: 14, opacity: visible}}>—</div>

      <div style={{position: "absolute", left: 165, top: 790, zIndex: 14, opacity: visible}}>
        <Badge src={homeBadge(p)} size={165} />
      </div>
      <div style={{position: "absolute", right: 165, top: 790, zIndex: 14, opacity: visible}}>
        <Badge src={awayBadge(p)} size={165} />
      </div>

      <div dir="rtl" style={{position: "absolute", left: 45, top: 980, width: 450, textAlign: "center", fontFamily: cairo, fontSize: 30, fontWeight: 900, color: "white", opacity: visible, zIndex: 14}}>{p.homeTeam}</div>
      <div dir="rtl" style={{position: "absolute", right: 45, top: 980, width: 450, textAlign: "center", fontFamily: cairo, fontSize: 30, fontWeight: 900, color: "white", opacity: visible, zIndex: 14}}>{p.awayTeam}</div>

      <div style={{position: "absolute", left: 58, top: 1080, width: 450, minHeight: 360, borderTop: "1px solid rgba(255,255,255,.20)", paddingTop: 22, fontFamily: cairo, opacity: visible, zIndex: 14}}>
        {homeGoals.map((g, i) => <GoalRow key={`${g.scorer}-${g.minute}`} g={g} base={162} delay={i * 8} />)}
      </div>
      <div style={{position: "absolute", right: 58, top: 1080, width: 450, minHeight: 430, borderTop: "1px solid rgba(255,255,255,.20)", paddingTop: 22, fontFamily: cairo, opacity: visible, zIndex: 14}}>
        {awayGoals.map((g, i) => <GoalRow key={`${g.scorer}-${g.minute}`} g={g} base={162} delay={i * 8} />)}
      </div>
    </>
  );
};

const FramedGoal: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const show = phase(f, 0, 18);
  const videoIn = phase(f, 5, 24);
  const metaIn = phase(f, 22, 42);
  const logo = tacticLogo(p);
  const scorer = p.v6FirstGoalScorer || "جون مكجين";
  const minute = p.v6FirstGoalMinute || "11′";
  const assist = p.v6FirstGoalAssist || "باو توريس";

  return (
    <AbsoluteFill style={{fontFamily: cairo, color: "white", opacity: show}}>
      <Img
        src={logo}
        style={{
          position: "absolute",
          left: 52,
          top: 72,
          width: 155,
          height: 70,
          objectFit: "contain",
          zIndex: 30,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,.55))",
        }}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 58,
          top: 105,
          minWidth: 245,
          height: 82,
          padding: "0 34px",
          borderRadius: 42,
          border: "1.5px solid rgba(226,188,92,.88)",
          background: "rgba(3,8,13,.74)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          fontWeight: 900,
          zIndex: 30,
          boxShadow: "0 16px 36px rgba(0,0,0,.25)",
        }}
      >
        {p.v6GoalLabel || "الهدف الأول"}
      </div>

      <div
        style={{
          position: "absolute",
          left: 48,
          top: 500,
          width: 984,
          height: 554,
          overflow: "hidden",
          background: "#000",
          transform: `translateY(${(1 - videoIn) * 34}px) scale(${0.965 + videoIn * 0.035})`,
          opacity: videoIn,
          boxShadow: "0 28px 70px rgba(0,0,0,.48)",
          zIndex: 28,
        }}
      >
        <OffthreadVideo
          src={goalFootage()}
          volume={1}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          bottom: 92,
          height: 330,
          borderRadius: 34,
          border: "1px solid rgba(226,188,92,.42)",
          background: "linear-gradient(180deg,rgba(4,10,14,.88),rgba(2,7,11,.96))",
          boxShadow: "0 28px 70px rgba(0,0,0,.38)",
          opacity: metaIn,
          transform: `translateY(${(1 - metaIn) * 34}px)`,
          zIndex: 30,
        }}
      >
        <div style={{position: "absolute", left: 52, top: 70}}>
          <Badge src={awayBadge(p)} size={145} />
        </div>

        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: 235,
            right: 245,
            top: 60,
            textAlign: "right",
          }}
        >
          <div style={{fontSize: 48, lineHeight: 1.15, fontWeight: 950}}>{scorer}</div>
          <div style={{fontSize: 25, marginTop: 14, fontWeight: 800, color: "#e2bc5c"}}>
            {p.v6FirstGoalTeam || "أستون فيلا"}
          </div>
          <div style={{fontSize: 22, marginTop: 10, fontWeight: 700, color: "rgba(255,255,255,.68)"}}>
            أسيست: {assist}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 42,
            bottom: 42,
            width: 178,
            height: 94,
            borderRadius: 47,
            background: "linear-gradient(135deg,#8a6b15,#caa439)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            fontWeight: 950,
            color: "#071018",
          }}
        >
          {minute}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ActA: React.FC<{p: MatchProps}> = ({p}) => (
  <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden", background: "#02060a"}}>
    <MatchWorld p={p} />
    <Matchup p={p} />
    <ScoreHero p={p} />
    <CompetitionHero p={p} />
    <Sequence from={240} durationInFrames={120} premountFor={20}>
      <FramedGoal p={p} />
    </Sequence>
  </AbsoluteFill>
);

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <ActA p={p} />;
};
