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
const ACT_A_FRAMES = 300;

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
  p.v6FirstActPreview ? ACT_A_FRAMES : calculateDurationV3(p);

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
const footage = (p: MatchProps) => p.v6FootageUrl || staticFile("v6-act-a.mp4");

const scoreParts = (p: MatchProps) => {
  const raw = String(p.score || `${p.match?.home?.score ?? 0}-${p.match?.away?.score ?? 0}`);
  const parts = raw.split(/[-–:]/).map((x) => Number(x.trim()));
  return {
    home: Number.isFinite(parts[0]) ? parts[0] : Number(p.match?.home?.score ?? 0),
    away: Number.isFinite(parts[1]) ? parts[1] : Number(p.match?.away?.score ?? 0),
  };
};

const MatchWorld: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const goalReveal = phase(f, 218, 278);
  const push = mix(f, 0, 299, 1.055, 1.16);
  const panY = mix(f, 0, 299, 0, -42);
  const dark = mix(goalReveal, 0, 1, 0.48, 0.08);
  const blur = mix(goalReveal, 0, 1, 2.0, 0.0);
  const brightness = mix(goalReveal, 0, 1, 0.42, 0.92);
  const saturation = mix(goalReveal, 0, 1, 0.78, 1.02);

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#02060a"}}>
      <OffthreadVideo
        src={footage(p)}
        volume={0.38}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 48%",
          transform: `translateY(${panY}px) scale(${push})`,
          filter: `brightness(${brightness}) saturate(${saturation}) contrast(1.11) blur(${blur}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,rgba(2,6,12,${dark}) 0%,rgba(2,6,12,${dark * 0.24}) 34%,rgba(2,6,12,${dark * 0.34}) 58%,rgba(2,6,12,${dark * 1.35}) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 34%,rgba(76,154,214,${0.15 * (1 - goalReveal)}) 0%,transparent 38%,rgba(1,4,8,${0.34 * (1 - goalReveal)}) 100%)`,
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
  const goalFade = 1 - phase(f, 218, 244);
  const heroScale = 0.74 + lock * 0.26;
  const top = mix(f, 28, 64, 900, 158);
  const size = mix(f, 28, 64, 520, 124);
  const halo = 1 - phase(f, 20, 44);

  return (
    <>
      <div style={{position: "absolute", left: "50%", top, width: size, height: size, transform: `translate(-50%,-50%) scale(${heroScale})`, zIndex: 20, opacity: goalFade}}>
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

      <div dir="rtl" style={{position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", fontFamily: cairo, color: "white", opacity: phase(f, 12, 26) * (1 - phase(f, 28, 46)), transform: `translateY(${mix(f, 12, 26, 24, 0)}px)`, textShadow: "0 12px 32px rgba(0,0,0,.78)", zIndex: 20}}>
        <div style={{fontSize: 44, fontWeight: 900}}>{p.v6CompetitionNameAr || "دوري أبطال أوروبا"}</div>
      </div>
    </>
  );
};

const Badge: React.FC<{src: string | null; size: number; opacity?: number}> = ({src, size, opacity = 1}) => {
  if (!src) return null;
  return <Img src={src} style={{width: size, height: size, objectFit: "contain", opacity, filter: "drop-shadow(0 32px 42px rgba(0,0,0,.62))"}} />;
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
  const slideOut = exit * (isLeft ? -760 : 760);
  return (
    <div
      style={{
        position: "absolute",
        top: 405,
        bottom: -90,
        width: 690,
        left: isLeft ? -36 : undefined,
        right: isLeft ? undefined : -36,
        transform: `translateX(${(1 - entry) * (isLeft ? -740 : 740) + slideOut}px)`,
        clipPath: isLeft
          ? "polygon(0 6%,100% 0,79% 100%,0 100%)"
          : "polygon(21% 0,100% 6%,100% 100%,0 100%)",
        background: `linear-gradient(${isLeft ? 145 : 215}deg,${colorA} 0%,${colorB} 72%,rgba(3,8,13,.24) 100%)`,
        backdropFilter: "blur(4px)",
        borderTop: "1px solid rgba(255,255,255,.20)",
        zIndex: 2,
        overflow: "hidden",
        boxShadow: isLeft ? "55px 0 120px rgba(0,0,0,.20)" : "-55px 0 120px rgba(0,0,0,.20)",
        opacity: 1 - exit * 0.92,
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
  const names = phase(f, 50, 67) * (1 - phase(f, 138, 166));
  const seam = phase(f, 40, 60) * (1 - phase(f, 142, 168));
  const toScore = phase(f, 138, 178);
  const goalExit = phase(f, 214, 260);

  const homeColor = p.design?.homeColor || "#1154D8";
  const awayColor = p.design?.awayColor || "#7A2048";

  return (
    <>
      <div style={{opacity: show}}>
        <TeamField side="left" colorA={`${homeColor}E8`} colorB="rgba(8,28,64,.78)" badge={homeBadge(p)} entry={entry} exit={goalExit} />
        <TeamField side="right" colorA={`${awayColor}E8`} colorB="rgba(48,16,36,.78)" badge={awayBadge(p)} entry={entry} exit={goalExit} />
      </div>

      <div style={{position: "absolute", left: "50%", top: 450, bottom: 0, width: 2, transform: `translateX(-50%) scaleY(${seam}) rotate(7deg)`, transformOrigin: "top", background: "linear-gradient(180deg,rgba(255,255,255,.72),rgba(226,188,92,.62),transparent)", boxShadow: "0 0 24px rgba(255,255,255,.18)", zIndex: 4, opacity: show}} />

      <div style={{position: "absolute", left: 118 - toScore * 38 - goalExit * 230, top: 690 + toScore * 18, zIndex: 6, opacity: show * (1 - goalExit), transform: `translateY(${(1-entry) * 70}px) scale(${0.88 + entry * 0.12 - toScore * 0.28})`}}>
        <Badge src={homeBadge(p)} size={350} />
      </div>
      <div style={{position: "absolute", right: 105 - toScore * 38 - goalExit * 230, top: 705 + toScore * 18, zIndex: 6, opacity: show * (1 - goalExit), transform: `translateY(${(1-entry) * -70}px) scale(${0.88 + entry * 0.12 - toScore * 0.28})`}}>
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

const ScoreHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scoreParts(p);
  const enter = spring({frame: Math.max(0, f - 146), fps, config: {damping: 12, stiffness: 145, mass: 0.62}});
  const settle = Math.min(1, enter);
  const exit = phase(f, 214, 258);
  const label = phase(f, 152, 170) * (1 - exit);
  const homeNum = Math.round(mix(f, 150, 178, 0, s.home));
  const awayNum = Math.round(mix(f, 150, 178, 0, s.away));
  const homeX = -185 - exit * 330;
  const awayX = 185 + exit * 330;

  return (
    <>
      <div dir="rtl" style={{position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", fontFamily: cairo, color: "rgba(255,255,255,.76)", fontSize: 29, fontWeight: 800, opacity: label, zIndex: 12, textShadow: "0 10px 28px rgba(0,0,0,.66)"}}>النتيجة النهائية</div>

      <div style={{position: "absolute", left: "50%", top: 895, transform: `translate(-50%,-50%) scale(${0.72 + settle * 0.28})`, zIndex: 12, opacity: phase(f, 142, 158) * (1 - exit * 0.85)}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 52, fontFamily: cairo, color: "white", fontWeight: 950, textShadow: "0 32px 60px rgba(0,0,0,.62)"}}>
          <span style={{fontSize: 276, lineHeight: 1, transform: `translateX(${homeX}px)`}}>{homeNum}</span>
          <span style={{fontSize: 60, opacity: 0.56, transform: `scaleX(${1 - exit * 0.75})`}}>—</span>
          <span style={{fontSize: 276, lineHeight: 1, transform: `translateX(${awayX}px)`}}>{awayNum}</span>
        </div>
      </div>

      <div dir="rtl" style={{position: "absolute", left: 52, right: 52, top: 1260, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: cairo, color: "white", fontSize: 34, fontWeight: 900, opacity: phase(f, 160, 178) * (1 - exit), zIndex: 12, textShadow: "0 10px 28px rgba(0,0,0,.72)"}}>
        <span>{p.homeTeam}</span>
        <span>{p.awayTeam}</span>
      </div>
    </>
  );
};

const GoalIdentity: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const show = phase(f, 248, 275);
  const accent = phase(f, 238, 260);

  return (
    <>
      <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 430, background: `linear-gradient(180deg,transparent,rgba(2,7,12,${0.62 * show}) 72%,rgba(2,7,12,${0.88 * show}) 100%)`, zIndex: 15, pointerEvents: "none"}} />
      <div style={{position: "absolute", left: 58, bottom: 112, width: 6, height: 155, background: "linear-gradient(180deg,#ffffff,#e2bc5c)", transformOrigin: "bottom", transform: `scaleY(${accent})`, boxShadow: "0 0 28px rgba(226,188,92,.35)", zIndex: 16}} />
      <div dir="rtl" style={{position: "absolute", left: 90, bottom: 105, width: 650, fontFamily: cairo, color: "white", opacity: show, transform: `translateY(${(1-show) * 28}px)`, textShadow: "0 10px 28px rgba(0,0,0,.86)", zIndex: 16}}>
        <div style={{fontSize: 78, fontWeight: 950, lineHeight: 1}}>{p.v6FirstGoalMinute || "11′"}</div>
        <div style={{fontSize: 43, fontWeight: 900, marginTop: 10}}>{p.v6FirstGoalScorer || "جون مكجين"}</div>
        <div style={{fontSize: 24, fontWeight: 700, opacity: 0.72, marginTop: 8}}>أستون فيلا يفتتح التسجيل</div>
      </div>
    </>
  );
};

const ActA: React.FC<{p: MatchProps}> = ({p}) => (
  <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden", background: "#02060a"}}>
    <MatchWorld p={p} />
    <Matchup p={p} />
    <ScoreHero p={p} />
    <CompetitionHero p={p} />
    <GoalIdentity p={p} />
  </AbsoluteFill>
);

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <ActA p={p} />;
};
