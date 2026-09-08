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
const FPS = 30;
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
  p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");
const footage = (p: MatchProps) =>
  p.v6FootageUrl || staticFile("v6-first-goal.mp4");

const scoreParts = (p: MatchProps) => {
  const raw = clean(p.score, `${p.match?.home?.score ?? 0}-${p.match?.away?.score ?? 0}`);
  const parts = raw.split(/[-–:]/).map((x) => Number(x.trim()));
  return {
    home: Number.isFinite(parts[0]) ? parts[0] : Number(p.match?.home?.score ?? 0),
    away: Number.isFinite(parts[1]) ? parts[1] : Number(p.match?.away?.score ?? 0),
  };
};

const Environment: React.FC = () => {
  const f = useCurrentFrame();
  const push = mix(f, 0, 335, 1, 1.085);
  const rise = mix(f, 0, 335, 0, -28);
  const slash = mix(f, 0, 100, -460, 1380);
  const portalDarken = phase(f, 294, 336);

  return (
    <AbsoluteFill style={{background: "#020407", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          transform: `translateY(${rise}px) scale(${push})`,
          background:
            "radial-gradient(circle at 50% 22%, rgba(28,58,78,.72) 0%, rgba(7,17,25,.92) 34%, #020407 72%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -220,
            right: -220,
            bottom: -420,
            height: 1190,
            transform: "perspective(1100px) rotateX(63deg)",
            transformOrigin: "center bottom",
            border: "2px solid rgba(255,255,255,.12)",
            background:
              "linear-gradient(90deg, rgba(14,68,49,.68), rgba(8,43,36,.88), rgba(14,68,49,.68))",
            boxShadow: "0 -80px 170px rgba(0,0,0,.72)",
          }}
        >
          <div style={{position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,.25)"}} />
          <div style={{position: "absolute", left: "50%", top: "47%", width: 350, height: 350, borderRadius: "50%", border: "3px solid rgba(255,255,255,.23)", transform: "translate(-50%,-50%)"}} />
          <div style={{position: "absolute", left: 90, right: 90, top: 0, height: 280, border: "3px solid rgba(255,255,255,.19)", borderTop: 0}} />
        </div>
        <div
          style={{
            position: "absolute",
            left: slash,
            top: -300,
            width: 110,
            height: 2600,
            transform: "rotate(17deg)",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), rgba(226,188,92,.30), transparent)",
            filter: "blur(18px)",
            opacity: 0.72,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(0,0,0,${portalDarken * 0.46})`}} />
      <AbsoluteFill style={{background: "linear-gradient(180deg,rgba(0,0,0,.06),transparent 45%,rgba(0,0,0,.46))"}} />
    </AbsoluteFill>
  );
};

const TacticSignature: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const intro = spring({frame: f, fps, config: {damping: 13, stiffness: 125, mass: 0.7}});
  const leave = phase(f, 30, 46);
  const sweep = mix(f, 3, 31, -330, 650);
  const flash = interpolate(f, [22, 26, 31], [0, 0.32, 0], clamp);
  const opacity = 1 - phase(f, 35, 47);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity}}>
      <div style={{position: "relative", width: 660, height: 360, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${-leave * 90}px) scale(${0.91 + intro * 0.09 + leave * 0.05})`}}>
        <Img
          src={tacticLogo(p)}
          style={{
            width: 570,
            maxHeight: 300,
            objectFit: "contain",
            mixBlendMode: "screen",
            filter: "drop-shadow(0 26px 38px rgba(0,0,0,.58))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: sweep,
            top: -70,
            width: 95,
            height: 510,
            transform: "rotate(16deg)",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.94),rgba(226,188,92,.56),transparent)",
            filter: "blur(10px)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`, mixBlendMode: "screen"}} />
    </AbsoluteFill>
  );
};

const CompetitionReveal: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const src = competitionLogo(p);
  const enter = phase(f, 38, 80);
  const lock = phase(f, 78, 88);
  const exit = phase(f, 94, 111);
  if (!src) return null;

  const fragmentCount = 8;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: mix(f, 40, 108, 920, 205),
          width: mix(f, 38, 108, 470, 145),
          height: mix(f, 38, 108, 470, 145),
          transform: `translate(-50%,-50%) scale(${1 - exit * 0.02})`,
        }}
      >
        {Array.from({length: fragmentCount}).map((_, i) => {
          const staggerStart = 42 + i * 2;
          const t = phase(f, staggerStart, staggerStart + 30);
          const side = i % 2 === 0 ? -1 : 1;
          const dx = side * (64 + i * 9) * (1 - t);
          const dy = ((i % 3) - 1) * 48 * (1 - t);
          const rot = side * (5 - i * 0.35) * (1 - t);
          const x1 = (i / fragmentCount) * 100;
          const x2 = ((i + 1) / fragmentCount) * 100 + 0.6;
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
                clipPath: `polygon(${x1}% 0, ${x2}% 0, ${x2}% 100%, ${x1}% 100%)`,
                transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${1.07 - t * 0.07})`,
                opacity: enter * (1 - lock),
                filter: `blur(${(1 - t) * 4}px) drop-shadow(0 24px 34px rgba(0,0,0,.52))`,
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
            filter: "drop-shadow(0 24px 38px rgba(0,0,0,.54))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: mix(f, 82, 100, -180, 520),
            top: -60,
            width: 70,
            height: 590,
            transform: "rotate(14deg)",
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)",
            filter: "blur(9px)",
            opacity: lock * (1 - exit),
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: cairo,
          color: "white",
          opacity: phase(f, 68, 84) * (1 - exit),
          transform: `translateY(${mix(f, 68, 84, 24, 0)}px)`,
        }}
      >
        <div style={{fontSize: 42, fontWeight: 900}}>{p.v6CompetitionNameAr || "دوري أبطال أوروبا"}</div>
        <div style={{fontSize: 24, fontWeight: 700, opacity: 0.62, marginTop: 10}}>الجولة {p.round || p.match?.round || 1}</div>
      </div>
    </>
  );
};

const FreeBadge: React.FC<{src: string | null; size: number; glow: string}> = ({src, size, glow}) => {
  if (!src) return null;
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: `drop-shadow(0 30px 34px rgba(0,0,0,.62)) drop-shadow(0 0 42px ${glow})`,
      }}
    />
  );
};

const MatchupHero: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enterF = Math.max(0, f - 108);
  const settle = spring({frame: enterF, fps, config: {damping: 14, stiffness: 110, mass: 0.85}});
  const toScore = phase(f, 192, 220);
  const opacity = phase(f, 105, 120) * (1 - phase(f, 216, 232));
  const badgeScale = 0.82 + settle * 0.18 - toScore * 0.22;
  const leftX = -350 + settle * 82 - toScore * 92;
  const rightX = 350 - settle * 82 + toScore * 92;
  const names = phase(f, 126, 148) * (1 - phase(f, 194, 212));
  const anchor = competitionLogo(p);

  return (
    <>
      {anchor ? (
        <Img
          src={anchor}
          style={{position: "absolute", top: 104, left: "50%", width: 122, height: 122, objectFit: "contain", transform: "translateX(-50%)", opacity: phase(f, 102, 118) * (1 - toScore * 0.28), filter: "drop-shadow(0 16px 20px rgba(0,0,0,.48))"}}
        />
      ) : null}
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", opacity}}>
        <div style={{position: "absolute", left: "50%", top: "48%", transform: `translate(-50%,-50%) translateX(${leftX}px) scale(${badgeScale})`, textAlign: "center"}}>
          <FreeBadge src={homeBadge(p)} size={320} glow="rgba(25,92,255,.20)" />
          <div dir="rtl" style={{fontFamily: cairo, fontSize: 48, fontWeight: 950, marginTop: 30, color: "white", opacity: names, textShadow: "0 14px 32px rgba(0,0,0,.66)"}}>{p.homeTeam}</div>
        </div>
        <div style={{position: "absolute", left: "50%", top: "48%", transform: `translate(-50%,-50%) translateX(${rightX}px) scale(${badgeScale})`, textAlign: "center"}}>
          <FreeBadge src={awayBadge(p)} size={320} glow="rgba(160,36,81,.24)" />
          <div dir="rtl" style={{fontFamily: cairo, fontSize: 48, fontWeight: 950, marginTop: 30, color: "white", opacity: names, textShadow: "0 14px 32px rgba(0,0,0,.66)"}}>{p.awayTeam}</div>
        </div>
        <div style={{fontFamily: cairo, fontSize: 34, fontWeight: 900, letterSpacing: 3, color: "rgba(255,255,255,.70)", opacity: phase(f, 138, 154) * (1 - toScore), transform: `scale(${mix(f, 138, 154, 0.7, 1) * (1 - toScore * 0.42)})`}}>VS</div>
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
  const hCount = Math.round(mix(f, 222, 246, 0, s.home));
  const aCount = Math.round(mix(f, 222, 246, 0, s.away));
  const circle = phase(f, 228, 275);

  return (
    <>
      <div style={{position: "absolute", left: "50%", top: "48%", width: 650, height: 650, border: "2px solid rgba(255,255,255,.15)", borderRadius: "50%", transform: `translate(-50%,-50%) scale(${0.35 + circle * 1.18})`, opacity: intro * (1 - circle) * (1 - portal), boxShadow: "0 0 90px rgba(255,255,255,.06)"}} />
      <div dir="rtl" style={{position: "absolute", top: 360, left: 0, right: 0, textAlign: "center", fontFamily: cairo, fontSize: 30, fontWeight: 850, letterSpacing: 0.5, color: "rgba(255,255,255,.65)", opacity: intro * (1 - portal)}}>النتيجة النهائية</div>
      <div style={{position: "absolute", left: "50%", top: "49%", transform: `translate(-50%,-50%) scale(${0.72 + impact * 0.28})`, opacity: intro * (1 - portal * 0.45), display: "flex", alignItems: "center", gap: 62, color: "white", fontFamily: cairo, fontWeight: 950, textShadow: "0 28px 45px rgba(0,0,0,.58)"}}>
        <span style={{fontSize: 230, transform: `translateX(${-portal * 195}px)`}}>{hCount}</span>
        <span style={{fontSize: 72, opacity: 0.5, transform: `scaleX(${1 - portal * 0.72})`}}>—</span>
        <span style={{fontSize: 230, transform: `translateX(${portal * 195}px)`}}>{aCount}</span>
      </div>
      <div style={{position: "absolute", left: 130 - portal * 130, top: 1230 + portal * 70, transform: `scale(${0.72 - portal * 0.2})`, opacity: intro * (1 - portal * 0.78)}}><FreeBadge src={homeBadge(p)} size={190} glow="rgba(25,92,255,.15)" /></div>
      <div style={{position: "absolute", right: 130 - portal * 130, top: 1230 + portal * 70, transform: `scale(${0.72 - portal * 0.2})`, opacity: intro * (1 - portal * 0.78)}}><FreeBadge src={awayBadge(p)} size={190} glow="rgba(160,36,81,.18)" /></div>
    </>
  );
};

const FootagePortal: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const open = phase(f, 0, 42);
  const width = mix(f, 0, 42, 16, 1080);
  const glow = 1 - phase(f, 30, 48);
  const info = phase(f, 66, 88);
  const clipSrc = footage(p);

  return (
    <AbsoluteFill style={{alignItems: "center", justifyContent: "center"}}>
      <div style={{position: "absolute", left: "50%", top: "50%", width, height: 1920, transform: "translate(-50%,-50%)", overflow: "hidden", boxShadow: `0 0 ${50 + 120 * glow}px rgba(255,255,255,${0.25 * glow})`}}>
        <OffthreadVideo
          src={clipSrc}
          style={{position: "absolute", left: "50%", top: "50%", width: 1080, height: 1920, transform: "translate(-50%,-50%)", objectFit: "cover"}}
          volume={1}
        />
        <AbsoluteFill style={{background: `linear-gradient(180deg,rgba(0,0,0,${0.14 * open}),transparent 48%,rgba(0,0,0,${0.48 * open}))`}} />
      </div>
      <div style={{position: "absolute", left: "50%", top: 0, bottom: 0, width: 5, transform: "translateX(-50%)", background: "white", boxShadow: "0 0 22px white,0 0 90px rgba(226,188,92,.80)", opacity: glow}} />
      <div dir="rtl" style={{position: "absolute", right: 58, bottom: 122, fontFamily: cairo, color: "white", textAlign: "right", opacity: info, transform: `translateY(${(1 - info) * 24}px)`, textShadow: "0 8px 24px rgba(0,0,0,.78)"}}>
        <div style={{fontSize: 74, fontWeight: 950}}>{p.v6FirstGoalMinute || "11′"}</div>
        <div style={{fontSize: 40, fontWeight: 900, marginTop: -3}}>{p.v6FirstGoalScorer || "جون مكجين"}</div>
        <div style={{fontSize: 25, fontWeight: 750, opacity: 0.76, marginTop: 8}}>أستون فيلا يفتتح التسجيل</div>
      </div>
    </AbsoluteFill>
  );
};

const FirstAct: React.FC<{p: MatchProps}> = ({p}) => {
  return (
    <AbsoluteFill style={{fontFamily: cairo, color: "white", overflow: "hidden"}}>
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
};

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FirstActPreview) return <TacticMatchV3 {...p} />;
  return <FirstAct p={p} />;
};
