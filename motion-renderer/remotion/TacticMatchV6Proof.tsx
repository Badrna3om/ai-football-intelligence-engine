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
  const sharpen = phase(f, 48, 88);
  const push = mix(f, 0, 89, 1.06, 1.15);
  const pan = mix(f, 0, 89, 0, -26);

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#03070c"}}>
      <OffthreadVideo
        src={footage(p)}
        volume={0.16}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 46%",
          transform: `translateY(${pan}px) scale(${push})`,
          filter: `brightness(${0.40 + sharpen * 0.10}) saturate(${0.76 + sharpen * 0.20}) contrast(1.12) blur(${2.0 - sharpen * 1.4}px)`,
        }}
      />
      <AbsoluteFill style={{background: "linear-gradient(180deg,rgba(2,6,12,.48) 0%,rgba(2,6,12,.10) 32%,rgba(2,6,12,.16) 58%,rgba(2,6,12,.72) 100%)"}} />
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 35%,rgba(76,154,214,.14) 0%,rgba(4,11,18,.02) 34%,rgba(1,4,8,.46) 100%)"}} />
    </AbsoluteFill>
  );
};

const CompetitionHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const src = competitionLogo(p);
  if (!src) return null;

  const lock = spring({frame: f, fps, config: {damping: 14, stiffness: 105, mass: 0.75}});
  const leave = phase(f, 28, 52);
  const heroScale = 0.74 + lock * 0.26;
  const top = mix(f, 28, 58, 900, 165);
  const size = mix(f, 28, 58, 520, 128);
  const halo = 1 - phase(f, 20, 42);

  return (
    <>
      <div style={{position: "absolute", left: "50%", top, width: size, height: size, transform: `translate(-50%,-50%) scale(${heroScale})`, zIndex: 10}}>
        {[0,1,2,3,4].map((i) => (
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
              opacity: i === 4 ? 1 : Math.max(0, 1 - leave * 1.5) * (0.05 + i * 0.02),
              filter: i === 4 ? "drop-shadow(0 28px 44px rgba(0,0,0,.68))" : `blur(${10 - i * 1.5}px) brightness(1.6)`,
            }}
          />
        ))}
      </div>

      <div style={{position: "absolute", left: "50%", top: mix(f, 0, 38, 560, 220), width: 2, height: mix(f, 0, 38, 760, 120), transform: "translateX(-50%)", background: "linear-gradient(180deg,transparent,rgba(255,255,255,.94),rgba(226,188,92,.72),transparent)", boxShadow: "0 0 28px rgba(255,255,255,.70),0 0 90px rgba(226,188,92,.24)", opacity: halo}} />

      <div dir="rtl" style={{position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", fontFamily: cairo, color: "white", opacity: phase(f, 12, 26) * (1 - phase(f, 28, 44)), transform: `translateY(${mix(f, 12, 26, 24, 0)}px)`, textShadow: "0 12px 32px rgba(0,0,0,.78)", zIndex: 10}}>
        <div style={{fontSize: 44, fontWeight: 900}}>{p.v6CompetitionNameAr || "دوري أبطال أوروبا"}</div>
      </div>
    </>
  );
};

const Badge: React.FC<{src: string | null; size: number}> = ({src, size}) => {
  if (!src) return null;
  return <Img src={src} style={{width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 32px 42px rgba(0,0,0,.62))"}} />;
};

const TeamField: React.FC<{
  side: "left" | "right";
  colorA: string;
  colorB: string;
  badge: string | null;
  entry: number;
}> = ({side, colorA, colorB, badge, entry}) => {
  const isLeft = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top: 410,
        bottom: -80,
        width: 690,
        left: isLeft ? -36 : undefined,
        right: isLeft ? undefined : -36,
        transform: `translateX(${(1 - entry) * (isLeft ? -740 : 740)}px)`,
        clipPath: isLeft
          ? "polygon(0 6%,100% 0,79% 100%,0 100%)"
          : "polygon(21% 0,100% 6%,100% 100%,0 100%)",
        background: `linear-gradient(${isLeft ? 145 : 215}deg,${colorA} 0%,${colorB} 72%,rgba(3,8,13,.28) 100%)`,
        backdropFilter: "blur(4px)",
        borderTop: "1px solid rgba(255,255,255,.20)",
        zIndex: 2,
        overflow: "hidden",
        boxShadow: isLeft ? "55px 0 120px rgba(0,0,0,.20)" : "-55px 0 120px rgba(0,0,0,.20)",
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
      <div style={{position: "absolute", inset: 0, background: isLeft ? "linear-gradient(90deg,rgba(255,255,255,.05),transparent 48%)" : "linear-gradient(270deg,rgba(255,255,255,.05),transparent 48%)"}} />
    </div>
  );
};

const Matchup: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const raw = spring({frame: Math.max(0, f - 32), fps, config: {damping: 15, stiffness: 108, mass: 0.84}});
  const entry = Math.min(1, raw);
  const show = phase(f, 31, 43);
  const names = phase(f, 50, 67);
  const seam = phase(f, 40, 60);

  return (
    <>
      <div style={{opacity: show}}>
        <TeamField side="left" colorA="rgba(17,84,216,.88)" colorB="rgba(8,28,64,.76)" badge={homeBadge(p)} entry={entry} />
        <TeamField side="right" colorA="rgba(122,32,72,.88)" colorB="rgba(48,16,36,.76)" badge={awayBadge(p)} entry={entry} />
      </div>

      <div style={{position: "absolute", left: "50%", top: 450, bottom: 0, width: 2, transform: `translateX(-50%) scaleY(${seam}) rotate(7deg)`, transformOrigin: "top", background: "linear-gradient(180deg,rgba(255,255,255,.72),rgba(226,188,92,.62),transparent)", boxShadow: "0 0 24px rgba(255,255,255,.18)", zIndex: 4, opacity: show}} />

      <div style={{position: "absolute", left: 118, top: 690, zIndex: 6, opacity: show, transform: `translateY(${(1-entry) * 70}px) scale(${0.88 + entry * 0.12})`}}>
        <Badge src={homeBadge(p)} size={350} />
      </div>
      <div style={{position: "absolute", right: 105, top: 705, zIndex: 6, opacity: show, transform: `translateY(${(1-entry) * -70}px) scale(${0.88 + entry * 0.12})`}}>
        <Badge src={awayBadge(p)} size={370} />
      </div>

      <div dir="rtl" style={{position: "absolute", left: 72, top: 1205, width: 420, zIndex: 7, fontFamily: cairo, color: "white", opacity: names, transform: `translateY(${(1-names) * 32}px)`, textShadow: "0 12px 34px rgba(0,0,0,.72)"}}>
        <div style={{fontSize: 64, fontWeight: 950, lineHeight: 1.05}}>{p.homeTeam}</div>
      </div>

      <div dir="rtl" style={{position: "absolute", right: 72, top: 1330, width: 430, zIndex: 7, fontFamily: cairo, color: "white", textAlign: "right", opacity: names, transform: `translateY(${(1-names) * 34}px)`, textShadow: "0 12px 34px rgba(0,0,0,.72)"}}>
        <div style={{fontSize: 64, fontWeight: 950, lineHeight: 1.05}}>{p.awayTeam}</div>
      </div>

      <div style={{position: "absolute", left: "50%", top: 1195, transform: `translate(-50%,-50%) scale(${0.8 + seam * 0.2})`, color: "rgba(255,255,255,.82)", fontFamily: cairo, fontSize: 28, fontWeight: 900, letterSpacing: 5, opacity: seam, textShadow: "0 8px 24px rgba(0,0,0,.8)", zIndex: 8}}>VS</div>
    </>
  );
};

const Proof: React.FC<{p: MatchProps}> = ({p}) => (
  <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden", background: "#02060a"}}>
    <MatchWorld p={p} />
    <Matchup p={p} />
    <CompetitionHero p={p} />
  </AbsoluteFill>
);

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <Proof p={p} />;
};
