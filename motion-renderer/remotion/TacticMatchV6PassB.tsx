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
const V6_FIRST_ACT_FRAMES = 450;

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
  p.v6FirstActPreview ? V6_FIRST_ACT_FRAMES : calculateDurationV3(p);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.inOut(Easing.cubic);
const mix = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: ease});
const phase = (f: number, a: number, b: number) => mix(f, a, b, 0, 1);
const clean = (v: unknown, d = "") => String(v ?? d).trim();

const homeBadge = (p: MatchProps) =>
  p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p: MatchProps) =>
  p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const competitionLogo = (p: MatchProps) => p.assets?.competitionLogoUrl || null;
const tacticLogo = (p: MatchProps) =>
  p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo_v6.png");
const footage = (p: MatchProps) =>
  p.v6FootageUrl || staticFile("v6-first-goal.mp4");

const scoreParts = (p: MatchProps) => {
  const raw = clean(
    p.score,
    `${p.match?.home?.score ?? 0}-${p.match?.away?.score ?? 0}`,
  );
  const parts = raw.split(/[-–:]/).map((x) => Number(x.trim()));
  return {
    home: Number.isFinite(parts[0]) ? parts[0] : Number(p.match?.home?.score ?? 0),
    away: Number.isFinite(parts[1]) ? parts[1] : Number(p.match?.away?.score ?? 0),
  };
};

const PitchFloor: React.FC = () => {
  const f = useCurrentFrame();
  const drift = mix(f, 0, 335, 0, -36);
  return (
    <div
      style={{
        position: "absolute",
        left: -220,
        right: -220,
        top: 1010 + drift,
        height: 1160,
        transform: "perspective(1150px) rotateX(64deg)",
        transformOrigin: "center top",
        borderTop: "2px solid rgba(255,255,255,.18)",
        background:
          "linear-gradient(90deg,rgba(8,63,54,.76),rgba(8,42,48,.88) 47%,rgba(9,61,54,.76))",
        boxShadow: "0 -90px 200px rgba(22,88,122,.18)",
        opacity: 0.94,
      }}
    >
      <div style={{position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,.26)"}} />
      <div style={{position: "absolute", left: "50%", top: 180, width: 420, height: 420, transform: "translateX(-50%)", border: "2px solid rgba(255,255,255,.22)", borderRadius: "50%"}} />
      <div style={{position: "absolute", left: 165, right: 165, top: 0, height: 360, border: "2px solid rgba(255,255,255,.19)", borderTop: 0}} />
      <div style={{position: "absolute", left: 335, right: 335, top: 0, height: 165, border: "2px solid rgba(255,255,255,.17)", borderTop: 0}} />
    </div>
  );
};

const Environment: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(f, 0, 335, 1, 1.055);
  const portal = phase(f, 294, 336);
  const beamA = mix(f, 0, 140, -170, 40);
  const beamB = mix(f, 0, 180, 1220, 955);

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#07121c"}}>
      <AbsoluteFill
        style={{
          transform: `scale(${push})`,
          background:
            "radial-gradient(circle at 50% 20%,rgba(37,99,134,.54) 0%,rgba(11,31,45,.52) 31%,rgba(7,18,28,.98) 72%),linear-gradient(180deg,#0b2130 0%,#07111a 52%,#061018 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: beamA,
          top: -260,
          width: 390,
          height: 1680,
          transform: "rotate(17deg)",
          background: "linear-gradient(90deg,transparent,rgba(120,195,236,.12),rgba(255,255,255,.09),transparent)",
          filter: "blur(24px)",
          opacity: 0.72,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: beamB,
          top: -330,
          width: 330,
          height: 1750,
          transform: "rotate(-19deg)",
          background: "linear-gradient(90deg,transparent,rgba(226,188,92,.12),rgba(255,255,255,.08),transparent)",
          filter: "blur(28px)",
          opacity: 0.58,
        }}
      />
      <div style={{position: "absolute", left: 84, right: 84, top: 235, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent)"}} />
      <PitchFloor />
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 50%,transparent 45%,rgba(0,0,0,.28) 100%)"}} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${portal * 0.22})`}} />
    </AbsoluteFill>
  );
};

const TacticSignature: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 135, mass: 0.72}});
  const leave = phase(f, 31, 44);
  const sweep = mix(f, 4, 30, -280, 610);
  const opacity = 1 - phase(f, 37, 47);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity}}>
      <div
        style={{
          position: "relative",
          width: 660,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${-leave * 72}px) scale(${0.93 + enter * 0.07 + leave * 0.03})`,
        }}
      >
        <Img
          src={tacticLogo(p)}
          style={{
            width: 575,
            maxHeight: 270,
            objectFit: "contain",
            filter: "drop-shadow(0 24px 42px rgba(0,0,0,.46))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: sweep,
            top: -110,
            width: 86,
            height: 540,
            transform: "rotate(16deg)",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.92),rgba(226,188,92,.48),transparent)",
            filter: "blur(12px)",
            opacity: 0.8,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const CompetitionReveal: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const src = competitionLogo(p);
  if (!src) return null;

  const lock = phase(f, 77, 90);
  const exit = phase(f, 94, 110);
  const count = 8;
  const size = mix(f, 39, 109, 500, 158);
  const top = mix(f, 39, 109, 850, 165);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top,
          width: size,
          height: size,
          transform: "translate(-50%,-50%)",
        }}
      >
        {Array.from({length: count}).map((_, i) => {
          const t = phase(f, 41 + i * 2, 71 + i * 2);
          const side = i % 2 === 0 ? -1 : 1;
          const x1 = (i / count) * 100;
          const x2 = ((i + 1) / count) * 100 + 0.8;
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
                clipPath: `polygon(${x1}% 0,${x2}% 0,${x2}% 100%,${x1}% 100%)`,
                transform: `translate(${side * (70 + i * 8) * (1 - t)}px,${((i % 3) - 1) * 52 * (1 - t)}px) rotate(${side * (5.5 - i * 0.35) * (1 - t)}deg) scale(${1.08 - t * 0.08})`,
                filter: `blur(${(1 - t) * 4}px) drop-shadow(0 24px 36px rgba(0,0,0,.48))`,
                opacity: phase(f, 39, 53) * (1 - lock),
              }}
            />
          );
        })}
        <Img
          src={src}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: lock,
            filter: "drop-shadow(0 26px 42px rgba(0,0,0,.50))",
          }}
        />
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: cairo,
          color: "white",
          opacity: phase(f, 68, 84) * (1 - exit),
          transform: `translateY(${mix(f, 68, 84, 24, 0)}px)`,
        }}
      >
        <div style={{fontSize: 46, fontWeight: 900}}>{p.v6CompetitionNameAr || "دوري أبطال أوروبا"}</div>
        <div style={{fontSize: 25, fontWeight: 700, opacity: 0.66, marginTop: 9}}>الجولة {p.round || p.match?.round || 1}</div>
      </div>
    </>
  );
};

const Badge: React.FC<{src: string | null; size: number; glow?: string}> = ({src, size, glow = "rgba(255,255,255,.08)"}) => {
  if (!src) return null;
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: `drop-shadow(0 28px 34px rgba(0,0,0,.52)) drop-shadow(0 0 34px ${glow})`,
      }}
    />
  );
};

const MatchupHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const settle = spring({frame: Math.max(0, f - 108), fps, config: {damping: 15, stiffness: 112, mass: 0.82}});
  const toScore = phase(f, 192, 220);
  const opacity = phase(f, 105, 120) * (1 - phase(f, 216, 232));
  const names = phase(f, 124, 145) * (1 - phase(f, 194, 212));
  const leftX = -370 + settle * 92 - toScore * 72;
  const rightX = 370 - settle * 92 + toScore * 72;
  const scale = 0.84 + settle * 0.16 - toScore * 0.15;
  const anchor = competitionLogo(p);

  return (
    <>
      {anchor ? (
        <Img
          src={anchor}
          style={{
            position: "absolute",
            top: 88,
            left: "50%",
            width: 150,
            height: 150,
            objectFit: "contain",
            transform: "translateX(-50%)",
            opacity: phase(f, 101, 116) * (1 - toScore * 0.18),
            filter: "drop-shadow(0 15px 20px rgba(0,0,0,.42))",
          }}
        />
      ) : null}
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity}}>
        <div style={{position: "absolute", left: "50%", top: "46%", transform: `translate(-50%,-50%) translateX(${leftX}px) scale(${scale})`, textAlign: "center"}}>
          <Badge src={homeBadge(p)} size={350} glow="rgba(25,95,255,.22)" />
          <div dir="rtl" style={{fontFamily: cairo, fontSize: 50, fontWeight: 950, marginTop: 32, color: "white", opacity: names, textShadow: "0 12px 28px rgba(0,0,0,.58)"}}>{p.homeTeam}</div>
        </div>
        <div style={{position: "absolute", left: "50%", top: "46%", transform: `translate(-50%,-50%) translateX(${rightX}px) scale(${scale})`, textAlign: "center"}}>
          <Badge src={awayBadge(p)} size={350} glow="rgba(160,36,81,.24)" />
          <div dir="rtl" style={{fontFamily: cairo, fontSize: 50, fontWeight: 950, marginTop: 32, color: "white", opacity: names, textShadow: "0 12px 28px rgba(0,0,0,.58)"}}>{p.awayTeam}</div>
        </div>
        <div style={{fontFamily: cairo, fontSize: 33, fontWeight: 900, letterSpacing: 2, color: "rgba(255,255,255,.72)", opacity: phase(f, 136, 153) * (1 - toScore), transform: `scale(${mix(f, 136, 153, 0.72, 1) * (1 - toScore * 0.45)})`}}>VS</div>
      </AbsoluteFill>
    </>
  );
};

const FinalScore: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = scoreParts(p);
  const intro = phase(f, 207, 229);
  const impact = spring({frame: Math.max(0, f - 225), fps, config: {damping: 10, stiffness: 190, mass: 0.55}});
  const portal = phase(f, 294, 336);
  const homeN = Math.round(mix(f, 222, 246, 0, s.home));
  const awayN = Math.round(mix(f, 222, 246, 0, s.away));
  const ring = phase(f, 226, 260) * (1 - phase(f, 260, 286));
  const anchor = competitionLogo(p);

  return (
    <>
      {anchor ? (
        <Img src={anchor} style={{position: "absolute", left: "50%", top: 92, width: 136, height: 136, objectFit: "contain", transform: "translateX(-50%)", opacity: intro * (1 - portal * 0.4)}} />
      ) : null}
      <div style={{position: "absolute", left: "50%", top: 780, width: 760, height: 760, borderRadius: "50%", border: "2px solid rgba(255,255,255,.18)", transform: `translate(-50%,-50%) scale(${0.58 + ring * 0.72})`, opacity: ring * 0.72, boxShadow: "0 0 120px rgba(76,160,210,.10)"}} />
      <div dir="rtl" style={{position: "absolute", top: 286, left: 0, right: 0, textAlign: "center", fontFamily: cairo, fontSize: 31, fontWeight: 850, color: "rgba(255,255,255,.72)", opacity: intro * (1 - portal)}}>النتيجة النهائية</div>

      <div style={{position: "absolute", left: 112 - portal * 90, top: 665 + portal * 30, width: 250, textAlign: "center", opacity: intro * (1 - portal * 0.82)}}>
        <Badge src={homeBadge(p)} size={205} glow="rgba(25,95,255,.18)" />
        <div dir="rtl" style={{fontFamily: cairo, color: "white", fontSize: 31, fontWeight: 900, marginTop: 22, lineHeight: 1.25}}>{p.homeTeam}</div>
      </div>
      <div style={{position: "absolute", right: 112 - portal * 90, top: 665 + portal * 30, width: 250, textAlign: "center", opacity: intro * (1 - portal * 0.82)}}>
        <Badge src={awayBadge(p)} size={205} glow="rgba(160,36,81,.20)" />
        <div dir="rtl" style={{fontFamily: cairo, color: "white", fontSize: 31, fontWeight: 900, marginTop: 22, lineHeight: 1.25}}>{p.awayTeam}</div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 790,
          transform: `translate(-50%,-50%) scale(${0.74 + impact * 0.26})`,
          display: "flex",
          alignItems: "center",
          gap: 50,
          color: "white",
          fontFamily: cairo,
          fontWeight: 950,
          opacity: intro * (1 - portal * 0.46),
          textShadow: "0 28px 46px rgba(0,0,0,.48)",
        }}
      >
        <span style={{fontSize: 235, transform: `translateX(${-portal * 205}px)`}}>{homeN}</span>
        <span style={{fontSize: 62, opacity: 0.5, transform: `scaleX(${1 - portal * 0.76})`}}>—</span>
        <span style={{fontSize: 235, transform: `translateX(${portal * 205}px)`}}>{awayN}</span>
      </div>

      <div dir="rtl" style={{position: "absolute", top: 1115, left: 0, right: 0, textAlign: "center", fontFamily: cairo, color: "rgba(255,255,255,.58)", fontSize: 24, fontWeight: 700, opacity: intro * (1 - portal)}}>أستون فيلا يحسم مواجهة بخمسة أهداف</div>
    </>
  );
};

const FootagePortal: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const open = phase(f, 0, 42);
  const width = mix(f, 0, 42, 8, 1080);
  const edge = 1 - phase(f, 27, 49);
  const info = phase(f, 65, 88);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width,
          height: 1920,
          transform: "translate(-50%,-50%)",
          overflow: "hidden",
          boxShadow: `0 0 ${55 + edge * 115}px rgba(210,235,255,${0.22 * edge})`,
        }}
      >
        <OffthreadVideo
          src={footage(p)}
          style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%"}}
          volume={1}
        />
        <AbsoluteFill style={{background: `linear-gradient(180deg,rgba(3,10,16,${0.18 * open}) 0%,transparent 42%,rgba(2,8,13,${0.60 * open}) 100%)`}} />
      </div>
      <div style={{position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, transform: "translateX(-50%)", background: "rgba(255,255,255,.95)", boxShadow: "0 0 24px white,0 0 86px rgba(226,188,92,.68)", opacity: edge}} />
      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 58,
          bottom: 108,
          width: 520,
          fontFamily: cairo,
          color: "white",
          textAlign: "right",
          opacity: info,
          transform: `translateY(${(1 - info) * 26}px)`,
          textShadow: "0 9px 25px rgba(0,0,0,.86)",
        }}
      >
        <div style={{fontSize: 76, fontWeight: 950, lineHeight: 1}}>{p.v6FirstGoalMinute || "11′"}</div>
        <div style={{fontSize: 42, fontWeight: 900, marginTop: 5}}>{p.v6FirstGoalScorer || "جون مكجين"}</div>
        <div style={{fontSize: 25, fontWeight: 750, opacity: 0.78, marginTop: 7}}>أستون فيلا يفتتح التسجيل</div>
      </div>
    </AbsoluteFill>
  );
};

const FirstAct: React.FC<{p: MatchProps}> = ({p}) => (
  <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden", background: "#07121c"}}>
    <Environment />
    <TacticSignature p={p} />
    <CompetitionReveal p={p} />
    <MatchupHero p={p} />
    <FinalScore p={p} />
    <Sequence from={294} durationInFrames={156} premountFor={20}>
      <FootagePortal p={p} />
    </Sequence>
  </AbsoluteFill>
);

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <FirstAct p={p} />;
};
