import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
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
const PROOF_FRAMES = 90;

export const tacticMatchSchema = v3Schema.extend({
  v6FirstActPreview: z.boolean().optional(),
  v6FootageUrl: z.string().nullable().optional(),
  v6FirstGoalScorer: z.string().optional(),
  v6FirstGoalMinute: z.string().optional(),
  v6CompetitionNameAr: z.string().optional(),
});

export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  ...defaultMatchV3,
  v6FirstActPreview: false,
  v6FootageUrl: null,
};

export const calculateDuration = (p: MatchProps) =>
  p.v6FirstActPreview ? PROOF_FRAMES : calculateDurationV3(p);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.inOut(Easing.cubic);
const mix = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: ease});
const phase = (f: number, a: number, b: number) => mix(f, a, b, 0, 1);

const homeBadge = (p: MatchProps) => p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p: MatchProps) => p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const competitionLogo = (p: MatchProps) => p.assets?.competitionLogoUrl || null;
const footage = (p: MatchProps) => p.v6FootageUrl || staticFile("v6-first-goal.mp4");

const MatchWorld: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const sharpen = phase(f, 54, 88);
  const push = mix(f, 0, 89, 1.07, 1.16);
  const pan = mix(f, 0, 89, 0, -32);

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#03070c"}}>
      <OffthreadVideo
        src={footage(p)}
        volume={0.18}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 48%",
          transform: `translateY(${pan}px) scale(${push})`,
          filter: `brightness(${0.38 + sharpen * 0.10}) saturate(${0.78 + sharpen * 0.16}) contrast(1.12) blur(${2.4 - sharpen * 1.8}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg,rgba(2,7,12,.52) 0%,rgba(2,7,12,.14) 34%,rgba(2,7,12,.22) 61%,rgba(2,7,12,.72) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 36%,rgba(74,149,206,.16) 0%,rgba(4,11,18,.02) 32%,rgba(1,4,8,.48) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 8,
          background: "linear-gradient(90deg,transparent,rgba(226,188,92,.82),transparent)",
          opacity: 0.7,
          filter: "blur(3px)",
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
  const leave = phase(f, 30, 52);
  const heroScale = 0.74 + lock * 0.26;
  const top = mix(f, 30, 58, 900, 180);
  const size = mix(f, 30, 58, 510, 138);
  const halo = 1 - phase(f, 22, 44);

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
          zIndex: 6,
        }}
      >
        {[0,1,2,3,4].map((i) => {
          const ghost = Math.max(0, 1 - leave * 1.4);
          return (
            <Img
              key={i}
              src={src}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `translateZ(0) scale(${1 + (4 - i) * 0.035}) translateY(${(4 - i) * 13 * (1 - lock)}px)`,
                opacity: i === 4 ? 1 : ghost * (0.06 + i * 0.025),
                filter: i === 4
                  ? "drop-shadow(0 30px 46px rgba(0,0,0,.64))"
                  : `blur(${10 - i * 1.5}px) brightness(1.5)`,
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: mix(f, 0, 40, 560, 240),
          width: 2,
          height: mix(f, 0, 40, 760, 120),
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg,transparent,rgba(255,255,255,.92),rgba(226,188,92,.72),transparent)",
          boxShadow: "0 0 28px rgba(255,255,255,.72),0 0 100px rgba(226,188,92,.25)",
          opacity: halo,
        }}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1195,
          textAlign: "center",
          fontFamily: cairo,
          color: "white",
          opacity: phase(f, 14, 28) * (1 - phase(f, 30, 46)),
          transform: `translateY(${mix(f, 14, 28, 26, 0)}px)`,
          textShadow: "0 12px 32px rgba(0,0,0,.78)",
        }}
      >
        <div style={{fontSize: 44, fontWeight: 900}}>{p.v6CompetitionNameAr || "دوري أبطال أوروبا"}</div>
      </div>
    </>
  );
};

const Badge: React.FC<{src: string | null; size: number}> = ({src, size}) => {
  if (!src) return null;
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: "drop-shadow(0 34px 42px rgba(0,0,0,.66))",
      }}
    />
  );
};

const Matchup: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entry = spring({frame: Math.max(0, f - 38), fps, config: {damping: 15, stiffness: 110, mass: 0.82}});
  const names = phase(f, 52, 68);
  const line = phase(f, 47, 65);

  const homeX = mix(entry, 0, 1, -560, -270);
  const awayX = mix(entry, 0, 1, 560, 285);
  const homeY = mix(entry, 0, 1, 1140, 940);
  const awayY = mix(entry, 0, 1, 720, 850);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: homeY,
          transform: `translate(-50%,-50%) translateX(${homeX}px) rotate(-7deg) scale(${0.80 + entry * 0.20})`,
          zIndex: 5,
        }}
      >
        <Badge src={homeBadge(p)} size={420} />
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: awayY,
          transform: `translate(-50%,-50%) translateX(${awayX}px) rotate(6deg) scale(${0.80 + entry * 0.20})`,
          zIndex: 5,
        }}
      >
        <Badge src={awayBadge(p)} size={440} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 84,
          right: 84,
          top: 1280,
          height: 2,
          transformOrigin: "center",
          transform: `scaleX(${line})`,
          background: "linear-gradient(90deg,rgba(255,255,255,.03),rgba(255,255,255,.78),rgba(226,188,92,.80),rgba(255,255,255,.78),rgba(255,255,255,.03))",
          boxShadow: "0 0 24px rgba(255,255,255,.16)",
        }}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 72,
          bottom: 278,
          width: 450,
          fontFamily: cairo,
          color: "white",
          opacity: names,
          transform: `translateY(${(1 - names) * 30}px)`,
          textShadow: "0 12px 34px rgba(0,0,0,.82)",
        }}
      >
        <div style={{fontSize: 58, fontWeight: 950, lineHeight: 1.1}}>{p.homeTeam}</div>
        <div style={{fontSize: 22, fontWeight: 700, opacity: 0.64, marginTop: 10}}>HOME</div>
      </div>

      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 72,
          bottom: 140,
          width: 470,
          fontFamily: cairo,
          color: "white",
          textAlign: "right",
          opacity: names,
          transform: `translateY(${(1 - names) * 34}px)`,
          textShadow: "0 12px 34px rgba(0,0,0,.82)",
        }}
      >
        <div style={{fontSize: 58, fontWeight: 950, lineHeight: 1.1}}>{p.awayTeam}</div>
        <div style={{fontSize: 22, fontWeight: 700, opacity: 0.64, marginTop: 10}}>AWAY</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 1200,
          transform: `translate(-50%,-50%) scale(${0.7 + line * 0.3})`,
          color: "white",
          fontFamily: cairo,
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: 5,
          opacity: line * 0.78,
          textShadow: "0 8px 24px rgba(0,0,0,.8)",
        }}
      >
        VS
      </div>
    </>
  );
};

const Proof: React.FC<{p: MatchProps}> = ({p}) => (
  <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden", background: "#02060a"}}>
    <MatchWorld p={p} />
    <CompetitionHero p={p} />
    <Matchup p={p} />
  </AbsoluteFill>
);

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <Proof p={p} />;
};
