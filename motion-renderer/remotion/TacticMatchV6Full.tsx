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
  TacticMatch as TacticMatchAct,
  tacticMatchSchema as actSchema,
  defaultMatch as defaultAct,
  calculateDuration as calculateAct,
} from "./TacticMatchV6Proof";

const {fontFamily: cairo} = loadFont();
const FULL_FRAMES = 1770;
const ACT_FRAMES = 360;
const GOAL_FRAMES = 155;

const fullGoalSchema = z.object({
  file: z.string(),
  side: z.enum(["home", "away"]),
  scorer: z.string(),
  minute: z.string(),
  assist: z.string().nullable().optional(),
  team: z.string(),
  label: z.string(),
  scoreAfter: z.string().optional(),
});

const motmSchema = z.object({
  name: z.string(),
  team: z.string(),
  rating: z.number(),
  note: z.string().optional(),
  stats: z.array(z.object({label: z.string(), value: z.string()})),
});

export const tacticMatchSchema = actSchema.extend({
  v6FullMatchPreview: z.boolean().optional(),
  v6GoalScenes: z.array(fullGoalSchema).optional(),
  v6XgHome: z.number().nullable().optional(),
  v6XgAway: z.number().nullable().optional(),
  v6Motm: motmSchema.optional(),
});

export type MatchProps = z.infer<typeof tacticMatchSchema>;

export const defaultMatch: MatchProps = {
  ...defaultAct,
  v6FullMatchPreview: false,
};

export const calculateDuration = (p: MatchProps) =>
  p.v6FullMatchPreview ? FULL_FRAMES : calculateAct(p as any);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.inOut(Easing.cubic);
const mix = (f: number, a: number, b: number, x: number, y: number) =>
  interpolate(f, [a, b], [x, y], {...clamp, easing: ease});
const phase = (f: number, a: number, b: number) => mix(f, a, b, 0, 1);
const windowOpacity = (f: number, start: number, end: number, edge = 18) =>
  phase(f, start, start + edge) * (1 - phase(f, end - edge, end));

const homeBadge = (p: MatchProps) =>
  p.assets?.homeBadgeUrl || p.match?.home?.badgeUrl || null;
const awayBadge = (p: MatchProps) =>
  p.assets?.awayBadgeUrl || p.match?.away?.badgeUrl || null;
const competitionLogo = (p: MatchProps) => p.assets?.competitionLogoUrl || null;
const tacticLogo = (p: MatchProps) =>
  p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");
const worldVideo = () => staticFile("v6-world-bg.mp4");

const Badge: React.FC<{src: string | null; size: number; opacity?: number}> = ({src, size, opacity = 1}) => {
  if (!src) return null;
  return (
    <Img
      src={src}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        opacity,
        filter: "drop-shadow(0 22px 34px rgba(0,0,0,.58))",
      }}
    />
  );
};

const BrandDualLogo: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lock = spring({frame: f, fps, config: {damping: 14, stiffness: 105, mass: 0.75}});
  const settle = Math.min(1, lock);
  const leave = phase(f, 118, 142);
  const y = mix(f, 28, 72, 1060, 1740);
  const size = mix(f, 28, 72, 235, 128);
  const opacity = phase(f, 5, 22) * (1 - leave);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y,
          width: size,
          height: size * 0.56,
          transform: `translate(-50%,-50%) scale(${0.76 + settle * 0.24})`,
          zIndex: 80,
          opacity,
        }}
      >
        <Img
          src={tacticLogo(p)}
          style={{width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 14px 28px rgba(0,0,0,.72))"}}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: mix(f, 5, 45, 660, 1280),
          width: 2,
          height: mix(f, 5, 45, 310, 95),
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg,transparent,rgba(255,255,255,.85),rgba(226,188,92,.68),transparent)",
          boxShadow: "0 0 24px rgba(255,255,255,.44)",
          opacity: opacity * (1 - phase(f, 32, 62)),
          zIndex: 79,
        }}
      />
    </>
  );
};

const GoalScene: React.FC<{p: MatchProps; goal: z.infer<typeof fullGoalSchema>}> = ({p, goal}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 16, stiffness: 120, mass: 0.75}});
  const e = Math.min(1, enter);
  const fade = 1 - phase(f, GOAL_FRAMES - 20, GOAL_FRAMES - 1);
  const src = staticFile(goal.file);
  const sideBadge = goal.side === "home" ? homeBadge(p) : awayBadge(p);
  const accent = goal.side === "home" ? (p.design?.homeColor || "#1154D8") : (p.design?.awayColor || "#7A2048");
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#03070b", opacity: fade}}>
      <OffthreadVideo
        src={src}
        volume={0.12}
        style={{
          position: "absolute",
          inset: -40,
          width: "calc(100% + 80px)",
          height: "calc(100% + 80px)",
          objectFit: "cover",
          transform: `scale(${1.14 + f * 0.0002})`,
          filter: "blur(24px) brightness(.26) saturate(.9) contrast(1.15)",
        }}
      />
      <AbsoluteFill style={{background: `linear-gradient(180deg,rgba(2,5,8,.58),rgba(2,8,9,.12) 42%,${accent}22 70%,rgba(2,5,8,.86))`}} />

      <Img
        src={tacticLogo(p)}
        style={{position: "absolute", left: 42, top: 42, width: 126, height: 58, objectFit: "contain", zIndex: 10, opacity: phase(f, 5, 18)}}
      />

      <div
        dir="rtl"
        style={{
          position: "absolute",
          right: 52,
          top: 70,
          minWidth: 235,
          padding: "17px 34px 19px",
          border: "1.5px solid rgba(226,188,92,.88)",
          borderRadius: 42,
          background: "rgba(3,6,9,.76)",
          color: "white",
          fontFamily: cairo,
          fontWeight: 900,
          fontSize: 29,
          textAlign: "center",
          opacity: phase(f, 8, 23),
          transform: `translateY(${(1 - e) * -18}px)`,
          zIndex: 10,
        }}
      >
        {goal.label}
      </div>

      <div
        style={{
          position: "absolute",
          left: 45,
          top: 390,
          width: 990,
          height: 557,
          overflow: "hidden",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,.16)",
          boxShadow: "0 35px 90px rgba(0,0,0,.62)",
          background: "#000",
          transform: `translateY(${(1 - e) * 56}px) scale(${0.965 + e * 0.035})`,
          opacity: phase(f, 4, 20),
          zIndex: 7,
        }}
      >
        <OffthreadVideo
          src={src}
          volume={1}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
        <div style={{position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)"}} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 52,
          right: 52,
          top: 1120,
          height: 350,
          borderRadius: 31,
          border: "1px solid rgba(226,188,92,.46)",
          background: "linear-gradient(180deg,rgba(2,7,10,.88),rgba(2,5,8,.96))",
          boxShadow: "0 30px 80px rgba(0,0,0,.44)",
          opacity: phase(f, 22, 40),
          transform: `translateY(${(1 - phase(f, 22, 40)) * 40}px)`,
          zIndex: 8,
        }}
      >
        <div style={{position: "absolute", left: 42, top: 74}}>
          <Badge src={sideBadge} size={145} />
        </div>
        <div dir="rtl" style={{position: "absolute", left: 220, right: 190, top: 70, fontFamily: cairo, color: "white", textAlign: "center"}}>
          <div style={{fontSize: 50, fontWeight: 950, lineHeight: 1.05}}>{goal.scorer}</div>
          <div style={{fontSize: 22, fontWeight: 800, color: "#e2bc5c", marginTop: 18}}>{goal.team}</div>
          <div style={{fontSize: 19, color: "rgba(255,255,255,.62)", marginTop: 13}}>
            {goal.assist ? `أسيست: ${goal.assist}` : "ركلة جزاء"}
          </div>
          {goal.scoreAfter ? <div style={{fontSize: 17, color: "rgba(255,255,255,.44)", marginTop: 8}}>النتيجة بعد الهدف: {goal.scoreAfter}</div> : null}
        </div>
        <div
          style={{
            position: "absolute",
            right: 34,
            bottom: 34,
            minWidth: 128,
            height: 78,
            padding: "0 20px",
            borderRadius: 30,
            background: `${accent}D9`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: cairo,
            color: "white",
            fontWeight: 950,
            fontSize: 38,
          }}
        >
          {goal.minute}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PitchBackground: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <svg viewBox="0 0 900 1040" style={{position: "absolute", left: 90, top: 430, width: 900, height: 1040, opacity}}>
    <rect x="20" y="20" width="860" height="1000" rx="28" fill="rgba(3,16,18,.52)" stroke="rgba(255,255,255,.24)" strokeWidth="3" />
    <line x1="20" y1="520" x2="880" y2="520" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <circle cx="450" cy="520" r="112" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <rect x="245" y="20" width="410" height="188" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <rect x="325" y="20" width="250" height="82" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <rect x="245" y="832" width="410" height="188" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <rect x="325" y="938" width="250" height="82" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" />
  </svg>
);

const StageHeader: React.FC<{title: string; subtitle?: string; opacity: number}> = ({title, subtitle, opacity}) => (
  <div dir="rtl" style={{position: "absolute", left: 70, right: 70, top: 165, textAlign: "center", fontFamily: cairo, color: "white", opacity, zIndex: 20}}>
    <div style={{fontSize: 53, fontWeight: 950}}>{title}</div>
    {subtitle ? <div style={{fontSize: 20, color: "rgba(255,255,255,.55)", marginTop: 8}}>{subtitle}</div> : null}
  </div>
);

const ScorePair: React.FC<{home: string; away: string; opacity: number; top?: number}> = ({home, away, opacity, top = 315}) => (
  <div style={{position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", alignItems: "center", gap: 72, opacity, zIndex: 21, fontFamily: cairo}}>
    <div style={{width: 240, textAlign: "center", fontSize: 74, fontWeight: 950, color: "#fff"}}>{home}</div>
    <div style={{fontSize: 28, color: "rgba(255,255,255,.36)"}}>—</div>
    <div style={{width: 240, textAlign: "center", fontSize: 74, fontWeight: 950, color: "#fff"}}>{away}</div>
  </div>
);

const StatsJourney: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const homeColor = p.design?.homeColor || "#1154D8";
  const awayColor = p.design?.awayColor || "#7A2048";
  const shotsO = windowOpacity(f, 0, 125, 18);
  const targetO = windowOpacity(f, 95, 230, 18);
  const bigO = windowOpacity(f, 200, 335, 18);
  const xgO = windowOpacity(f, 305, 435, 18);
  const possO = windowOpacity(f, 405, 520, 18);

  const shotsP = phase(f, 12, 96);
  const targetP = phase(f, 110, 205);
  const bigP = phase(f, 216, 304);
  const xgP = phase(f, 320, 405);
  const possP = phase(f, 422, 505);

  const homeShots = Math.round(14 * shotsP);
  const awayShots = Math.round(21 * shotsP);
  const homeTarget = Math.round(7 * targetP);
  const awayTarget = Math.round(9 * targetP);
  const homeBig = Math.round(2 * bigP);
  const awayBig = Math.round(4 * bigP);
  const xgHome = p.v6XgHome ?? 1.46;
  const xgAway = p.v6XgAway ?? 3.0;
  const homePoss = Math.round(mix(possP, 0, 1, 50, 64));
  const awayPoss = 100 - homePoss;

  const homeTrails = [
    [175,890,405,180],[250,840,430,180],[320,900,448,180],[120,760,390,180],[370,790,460,180],[215,700,418,180],[330,650,450,180],
  ];
  const awayTrails = [
    [720,890,500,180],[660,830,478,180],[790,770,520,180],[600,900,465,180],[735,700,510,180],[640,650,475,180],[810,620,525,180],[575,760,458,180],[700,560,495,180],[825,850,535,180],
  ];
  const dots = [
    [365,690],[410,655],[450,720],[390,755],[470,670],[430,800],[500,740],[545,690],[585,655],[625,720],[560,760],[650,680],[600,810],[520,835],[680,760],[720,715],
  ];

  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#02070a"}}>
      <OffthreadVideo
        src={worldVideo()}
        volume={0.08}
        style={{position: "absolute", inset: -45, width: "calc(100% + 90px)", height: "calc(100% + 90px)", objectFit: "cover", filter: "blur(22px) brightness(.18) saturate(.75)", transform: "scale(1.15)"}}
      />
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 45%,rgba(16,71,81,.26),rgba(1,5,7,.92) 72%)"}} />
      <Img src={competitionLogo(p) || ""} style={{position: "absolute", top: 45, left: "50%", transform: "translateX(-50%)", width: 92, height: 92, objectFit: "contain", opacity: 0.72}} />
      <PitchBackground opacity={0.72} />

      <div style={{opacity: shotsO}}>
        <StageHeader title="التسديدات" subtitle="محاولات المباراة تتحول إلى مسارات نحو المرمى" opacity={shotsO} />
        <ScorePair home={String(homeShots)} away={String(awayShots)} opacity={shotsO} />
        <svg viewBox="0 0 900 1040" style={{position: "absolute", left: 90, top: 430, width: 900, height: 1040, opacity: shotsO}}>
          {homeTrails.map((v, i) => {
            const pp = Math.max(0, Math.min(1, shotsP * 1.22 - i * 0.07));
            return <path key={`h-${i}`} d={`M${v[0]} ${v[1]} Q${v[0]+95} ${(v[1]+v[3])/2} ${v[2]} ${v[3]}`} fill="none" stroke={homeColor} strokeWidth="7" strokeLinecap="round" strokeDasharray="520" strokeDashoffset={520 * (1 - pp)} opacity={0.88} />;
          })}
          {awayTrails.map((v, i) => {
            const pp = Math.max(0, Math.min(1, shotsP * 1.25 - i * 0.055));
            return <path key={`a-${i}`} d={`M${v[0]} ${v[1]} Q${v[0]-90} ${(v[1]+v[3])/2} ${v[2]} ${v[3]}`} fill="none" stroke={awayColor} strokeWidth="7" strokeLinecap="round" strokeDasharray="520" strokeDashoffset={520 * (1 - pp)} opacity={0.88} />;
          })}
          <rect x="330" y="120" width="240" height="76" rx="8" fill="rgba(0,0,0,.34)" stroke="rgba(255,255,255,.55)" strokeWidth="4" />
        </svg>
      </div>

      <div style={{opacity: targetO}}>
        <StageHeader title="على المرمى" subtitle="الكرات التي وصلت فعليًا إلى إطار المرمى" opacity={targetO} />
        <ScorePair home={String(homeTarget)} away={String(awayTarget)} opacity={targetO} />
        <svg viewBox="0 0 900 1040" style={{position: "absolute", left: 90, top: 430, width: 900, height: 1040, opacity: targetO}}>
          <rect x="180" y="420" width="540" height="360" rx="8" fill="rgba(0,0,0,.28)" stroke="rgba(255,255,255,.62)" strokeWidth="7" />
          {[180,288,396,504,612,720].map((x) => <line key={`gx${x}`} x1={x} y1="420" x2={x} y2="780" stroke="rgba(255,255,255,.11)" strokeWidth="2" />)}
          {[420,510,600,690,780].map((y) => <line key={`gy${y}`} x1="180" y1={y} x2="720" y2={y} stroke="rgba(255,255,255,.11)" strokeWidth="2" />)}
          {dots.slice(0, 7).map(([x,y], i) => <circle key={`hd${i}`} cx={x} cy={y} r={mix(targetP, i/11, Math.min(1,i/11+.12), 0, 14)} fill={homeColor} stroke="white" strokeWidth="2" />)}
          {dots.slice(7, 16).map(([x,y], i) => <circle key={`ad${i}`} cx={x} cy={y} r={mix(targetP, i/12, Math.min(1,i/12+.12), 0, 14)} fill={awayColor} stroke="white" strokeWidth="2" />)}
        </svg>
      </div>

      <div style={{opacity: bigO}}>
        <StageHeader title="الفرص الكبيرة" subtitle="لحظات عالية الخطورة داخل منطقة الجزاء" opacity={bigO} />
        <ScorePair home={String(homeBig)} away={String(awayBig)} opacity={bigO} />
        <svg viewBox="0 0 900 1040" style={{position: "absolute", left: 90, top: 430, width: 900, height: 1040, opacity: bigO}}>
          {[[320,250,homeColor],[420,330,homeColor],[545,260,awayColor],[625,360,awayColor],[560,470,awayColor],[690,250,awayColor]].map(([x,y,c], i) => {
            const pp = Math.max(0, Math.min(1, bigP * 1.35 - i * .11));
            return <g key={`bc${i}`} opacity={pp}><circle cx={Number(x)} cy={Number(y)} r={34 + pp * 22} fill="none" stroke={String(c)} strokeWidth="8" opacity=".88" /><circle cx={Number(x)} cy={Number(y)} r={10} fill={String(c)} /></g>;
          })}
        </svg>
      </div>

      <div style={{opacity: xgO}}>
        <StageHeader title="xG" subtitle="جودة الفرص المتوقعة" opacity={xgO} />
        <div dir="rtl" style={{position: "absolute", left: 80, right: 80, top: 535, fontFamily: cairo, color: "white", opacity: xgO}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 18}}>
            <div style={{fontSize: 28, fontWeight: 900}}>{p.homeTeam}</div><div style={{fontSize: 68, fontWeight: 950}}>{(xgHome * xgP).toFixed(2)}</div>
          </div>
          <div style={{height: 34, borderRadius: 20, background: "rgba(255,255,255,.08)", overflow: "hidden"}}><div style={{height: "100%", width: `${Math.min(100,(xgHome/3)*100*xgP)}%`, background: `linear-gradient(90deg,${homeColor},#4da2ff)`, borderRadius: 20}} /></div>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 105, marginBottom: 18}}>
            <div style={{fontSize: 28, fontWeight: 900}}>{p.awayTeam}</div><div style={{fontSize: 68, fontWeight: 950}}>{(xgAway * xgP).toFixed(2)}</div>
          </div>
          <div style={{height: 34, borderRadius: 20, background: "rgba(255,255,255,.08)", overflow: "hidden"}}><div style={{height: "100%", width: `${Math.min(100,(xgAway/3)*100*xgP)}%`, background: `linear-gradient(90deg,${awayColor},#d35c86)`, borderRadius: 20}} /></div>
        </div>
        <div style={{position: "absolute", left: "50%", top: 1270, width: 2, height: 205, transform: `translateX(-50%) scaleY(${xgP})`, transformOrigin: "top", background: "linear-gradient(180deg,#e2bc5c,transparent)", opacity: xgO}} />
      </div>

      <div style={{opacity: possO}}>
        <StageHeader title="الاستحواذ" subtitle="توازن السيطرة على الكرة عبر المباراة" opacity={possO} />
        <div style={{position: "absolute", left: 80, right: 80, top: 560, height: 720, borderRadius: 34, overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", opacity: possO}}>
          <div style={{position: "absolute", inset: 0, display: "flex"}}>
            <div style={{width: `${homePoss}%`, height: "100%", background: `linear-gradient(135deg,${homeColor}D9,${homeColor}55)`, transition: "none"}} />
            <div style={{width: `${awayPoss}%`, height: "100%", background: `linear-gradient(225deg,${awayColor}D9,${awayColor}55)`}} />
          </div>
          <div style={{position: "absolute", left: `${homePoss}%`, top: 0, bottom: 0, width: 3, transform: "translateX(-50%)", background: "rgba(255,255,255,.78)", boxShadow: "0 0 25px rgba(255,255,255,.55)"}} />
          <div dir="rtl" style={{position: "absolute", left: 45, top: 245, width: 330, textAlign: "center", fontFamily: cairo, color: "white"}}><div style={{fontSize: 86, fontWeight: 950}}>{homePoss}%</div><div style={{fontSize: 25, fontWeight: 850}}>{p.homeTeam}</div></div>
          <div dir="rtl" style={{position: "absolute", right: 45, top: 245, width: 330, textAlign: "center", fontFamily: cairo, color: "white"}}><div style={{fontSize: 86, fontWeight: 950}}>{awayPoss}%</div><div style={{fontSize: 25, fontWeight: 850}}>{p.awayTeam}</div></div>
        </div>
      </div>

      <div dir="rtl" style={{position: "absolute", left: 0, right: 0, bottom: 86, textAlign: "center", color: "rgba(255,255,255,.42)", fontFamily: cairo, fontSize: 17}}>TACTIC SPORT • رحلة المباراة بالأرقام</div>
    </AbsoluteFill>
  );
};

const MotmScene: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m = p.v6Motm || {name: "نيكولاس جاكسون", team: "أستون فيلا", rating: 8.3, note: "تعادل أعلى تقييم بالمباراة • سجل هدف الفوز", stats: [{label:"الأهداف",value:"1"},{label:"التسديدات",value:"3"},{label:"على المرمى",value:"2"},{label:"تمريرات مفتاحية",value:"3"}]};
  const enter = Math.min(1, spring({frame: f, fps, config: {damping: 15, stiffness: 110, mass: .8}}));
  const badge = awayBadge(p);
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#05070a"}}>
      <OffthreadVideo src={worldVideo()} volume={0.08} style={{position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(26px) brightness(.18) saturate(.8)", transform: "scale(1.18)"}} />
      <AbsoluteFill style={{background: `linear-gradient(145deg,rgba(122,32,72,.78),rgba(3,7,11,.92) 58%,rgba(17,84,216,.26))`}} />
      {badge ? <Img src={badge} style={{position: "absolute", width: 760, height: 760, right: -160, top: 350, objectFit: "contain", opacity: .08, filter: "grayscale(1) brightness(2)"}} /> : null}
      <Img src={tacticLogo(p)} style={{position: "absolute", top: 48, left: 44, width: 145, height: 66, objectFit: "contain", opacity: .9}} />
      <div dir="rtl" style={{position: "absolute", top: 195, left: 70, right: 70, fontFamily: cairo, color: "white", opacity: phase(f, 0, 18)}}>
        <div style={{fontSize: 28, fontWeight: 850, color: "#e2bc5c"}}>نجم المباراة — اختيار تكتيك</div>
        <div style={{fontSize: 78, fontWeight: 950, lineHeight: 1.05, marginTop: 24, transform: `translateY(${(1-enter)*35}px)`}}>{m.name}</div>
        <div style={{fontSize: 28, color: "rgba(255,255,255,.68)", marginTop: 16}}>{m.team}</div>
      </div>
      <div style={{position: "absolute", left: 70, top: 610, width: 310, height: 310, borderRadius: 155, border: "2px solid rgba(226,188,92,.62)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: cairo, background: "rgba(2,6,9,.46)", transform: `scale(${.82+enter*.18})`}}>
        <div style={{fontSize: 112, lineHeight: 1, fontWeight: 950}}>{(m.rating * phase(f, 12, 55)).toFixed(1)}</div>
        <div style={{fontSize: 22, color: "#e2bc5c", marginTop: 12}}>التقييم</div>
      </div>
      <div style={{position: "absolute", right: 80, top: 650, width: 520, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: cairo}}>
        {m.stats.slice(0,4).map((s, i) => {
          const o = phase(f, 35 + i*14, 50 + i*14);
          return <div key={s.label} dir="rtl" style={{height: 160, borderRadius: 24, border: "1px solid rgba(255,255,255,.12)", background: "rgba(2,6,9,.54)", padding: "25px 28px", color: "white", opacity: o, transform: `translateY(${(1-o)*24}px)`}}><div style={{fontSize: 48, fontWeight: 950}}>{s.value}</div><div style={{fontSize: 19, color: "rgba(255,255,255,.58)", marginTop: 10}}>{s.label}</div></div>;
        })}
      </div>
      <div dir="rtl" style={{position: "absolute", left: 70, right: 70, bottom: 250, fontFamily: cairo, color: "white", opacity: phase(f, 75, 100), textAlign: "center"}}>
        <div style={{fontSize: 28, fontWeight: 850}}>{m.note || ""}</div>
      </div>
      <div style={{position: "absolute", left: "50%", bottom: 115, width: 3, height: 100, transform: `translateX(-50%) scaleY(${phase(f,105,140)})`, transformOrigin: "top", background: "linear-gradient(180deg,#e2bc5c,transparent)"}} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{p: MatchProps}> = ({p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = Math.min(1, spring({frame: f, fps, config: {damping: 14, stiffness: 100, mass: .8}}));
  return (
    <AbsoluteFill style={{overflow: "hidden", background: "#020508"}}>
      <OffthreadVideo src={worldVideo()} volume={0.04} style={{position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(28px) brightness(.12) saturate(.65)", transform: "scale(1.2)"}} />
      <AbsoluteFill style={{background: "radial-gradient(circle at 50% 42%,rgba(226,188,92,.12),rgba(1,4,7,.94) 65%)"}} />
      {competitionLogo(p) ? <Img src={competitionLogo(p)!} style={{position: "absolute", top: 140, left: "50%", width: 120, height: 120, transform: "translateX(-50%)", objectFit: "contain", opacity: phase(f, 0, 22)}} /> : null}
      <div style={{position: "absolute", left: "50%", top: 765, width: 430, height: 210, transform: `translate(-50%,-50%) scale(${.8+s*.2})`, opacity: phase(f, 8, 28)}}><Img src={tacticLogo(p)} style={{width: "100%", height: "100%", objectFit: "contain"}} /></div>
      <div dir="rtl" style={{position: "absolute", left: 90, right: 90, top: 1030, fontFamily: cairo, textAlign: "center", color: "white", opacity: phase(f, 25, 48)}}><div style={{fontSize: 35, fontWeight: 900}}>خلف كل مباراة… قصة تحكيها الأرقام</div><div style={{fontSize: 20, color: "rgba(255,255,255,.48)", marginTop: 18}}>TACTIC SPORT | تكتيك سبورت</div></div>
    </AbsoluteFill>
  );
};

const FullFilm: React.FC<{p: MatchProps}> = ({p}) => {
  const goals = p.v6GoalScenes || [];
  const goal2 = goals[1] || {file:"v6-goal-2.mp4",side:"home" as const,scorer:"هوغو فيتلسين",minute:"19′",assist:"يان فيرجيلي",team:"كلوب بروج",label:"هدف التعادل",scoreAfter:"1–1"};
  const goal3 = goals[2] || {file:"v6-goal-3.mp4",side:"away" as const,scorer:"إيمليانو بوينديا",minute:"22′",assist:"جواو غوميز",team:"أستون فيلا",label:"هدف التقدم",scoreAfter:"1–2"};
  const goal4 = goals[3] || {file:"v6-goal-4.mp4",side:"away" as const,scorer:"نيكولاس جاكسون",minute:"43′",assist:"باو توريس",team:"أستون فيلا",label:"هدف الفوز",scoreAfter:"1–3"};
  const goal5 = goals[4] || {file:"v6-goal-5.mp4",side:"home" as const,scorer:"نيكولو تريزولدي",minute:"61′",assist:null,team:"كلوب بروج",label:"تقليص الفارق",scoreAfter:"2–3"};
  return (
    <AbsoluteFill style={{background: "#02060a"}}>
      <Sequence from={0} durationInFrames={ACT_FRAMES}>
        <TacticMatchAct {...(p as any)} v6FirstActPreview={true} />
        <BrandDualLogo p={p} />
      </Sequence>
      <Sequence from={360} durationInFrames={GOAL_FRAMES}><GoalScene p={p} goal={goal2} /></Sequence>
      <Sequence from={515} durationInFrames={GOAL_FRAMES}><GoalScene p={p} goal={goal3} /></Sequence>
      <Sequence from={670} durationInFrames={GOAL_FRAMES}><GoalScene p={p} goal={goal4} /></Sequence>
      <Sequence from={825} durationInFrames={GOAL_FRAMES}><GoalScene p={p} goal={goal5} /></Sequence>
      <Sequence from={980} durationInFrames={520}><StatsJourney p={p} /></Sequence>
      <Sequence from={1500} durationInFrames={150}><MotmScene p={p} /></Sequence>
      <Sequence from={1650} durationInFrames={120}><Outro p={p} /></Sequence>
    </AbsoluteFill>
  );
};

export const TacticMatch: React.FC<MatchProps> = (p) => {
  if (!p.v6FullMatchPreview) return <TacticMatchAct {...(p as any)} />;
  return <FullFilm p={p} />;
};
