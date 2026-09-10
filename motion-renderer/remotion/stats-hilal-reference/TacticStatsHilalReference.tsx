import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {z} from "zod";
import {loadFont} from "@remotion/google-fonts/Cairo";

const {fontFamily: cairo} = loadFont();
const FPS = 30;
const SCENE_FRAMES = 120;
const MOTM_FRAMES = 150;

const statCardSchema = z.object({
  id: z.string(),
  headline: z.string().optional(),
  metric: z.string().optional(),
  homeValue: z.union([z.number(), z.string()]),
  awayValue: z.union([z.number(), z.string()]),
  homeLabel: z.string().optional(),
  awayLabel: z.string().optional(),
  visual: z.string().optional(),
}).passthrough();

export const tacticStatsHilalReferenceSchema = z.object({
  compositionId: z.string().optional(),
  gameId: z.number(),
  competition: z.string().optional(),
  round: z.union([z.number(), z.string()]).optional(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  statsCards: z.array(statCardSchema),
  design: z.object({
    homeColor: z.string().optional(),
    awayColor: z.string().optional(),
  }).optional(),
  assets: z.object({
    homeBadgeUrl: z.string().nullable().optional(),
    awayBadgeUrl: z.string().nullable().optional(),
    competitionLogoUrl: z.string().nullable().optional(),
    tacticLogoUrl: z.string().nullable().optional(),
    starPlayerPhotoUrl: z.string().nullable().optional(),
  }).optional(),
  starPlayer: z.any().optional(),
  includeMotm: z.boolean().optional(),
}).passthrough();

export type HilalStatsProps = z.infer<typeof tacticStatsHilalReferenceSchema>;

export const defaultHilalStatsProps: HilalStatsProps = {
  compositionId: "TacticStatsHilalReference",
  gameId: 4788164,
  competition: "دوري روشن السعودي",
  round: 5,
  homeTeam: "الهلال",
  awayTeam: "الشباب",
  design: {homeColor: "#0B74FF", awayColor: "#ECEFF4"},
  assets: {
    homeBadgeUrl: null,
    awayBadgeUrl: null,
    competitionLogoUrl: null,
    tacticLogoUrl: null,
    starPlayerPhotoUrl: null,
  },
  statsCards: [
    {id: "shots", headline: "إجمالي التسديدات", homeValue: 24, awayValue: 7, visual: "ticks"},
    {id: "shots_on_target", headline: "التسديدات على المرمى", homeValue: 6, awayValue: 1, visual: "goal_dots"},
    {id: "big_chances", headline: "الفرص الكبيرة", homeValue: 3, awayValue: 1, visual: "chance_map"},
    {id: "xg", headline: "الأهداف المتوقعة xG", homeValue: 4.04, awayValue: 0.77, visual: "xg_bars"},
    {id: "possession", headline: "الاستحواذ", homeValue: 62, awayValue: 38, visual: "possession"},
  ],
  includeMotm: false,
};

export const calculateHilalStatsDuration = (p: HilalStatsProps) => {
  const cards = Math.max(1, p.statsCards?.length || 0);
  return cards * SCENE_FRAMES + (p.includeMotm ? MOTM_FRAMES : 0);
};

const clamp = {extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const};
const ease = Easing.inOut(Easing.cubic);
const out = Easing.out(Easing.cubic);

const n = (v: unknown, d = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
};

const hexToRgb = (hex: string) => {
  const cleaned = String(hex || "").trim().replace("#", "");
  const v = cleaned.length === 3 ? cleaned.split("").map((c) => c + c).join("") : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return {r: 34, g: 212, b: 255};
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
};

const rgba = (hex: string, a: number) => {
  const {r, g, b} = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

const safeAccent = (hex: string, fallback: string) => {
  const raw = /^#[0-9a-fA-F]{6}$/.test(hex || "") ? hex : fallback;
  const {r, g, b} = hexToRgb(raw);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance > 0.88) {
    return `#${[r, g, b].map((x) => Math.max(175, Math.min(236, x - 20)).toString(16).padStart(2, "0")).join("")}`;
  }
  if (luminance < 0.15) {
    return `#${[r, g, b].map((x) => Math.min(255, x + 58).toString(16).padStart(2, "0")).join("")}`;
  }
  return raw;
};

const homeColor = (p: HilalStatsProps) => safeAccent(p.design?.homeColor || "#0B74FF", "#0B74FF");
const awayColor = (p: HilalStatsProps) => safeAccent(p.design?.awayColor || "#ECEFF4", "#ECEFF4");
const tacticLogo = (p: HilalStatsProps) => p.assets?.tacticLogoUrl || staticFile("TACTIC_SPORT_logo.png");

const countTo = (value: number, frame: number, decimals = 0, start = 8, end = 54) => {
  const x = interpolate(frame, [start, end], [0, value], {...clamp, easing: out});
  return decimals > 0 ? x.toFixed(decimals) : String(Math.round(x));
};

const sceneOpacity = (frame: number, duration = SCENE_FRAMES) => {
  const enter = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: out});
  const leave = interpolate(frame, [duration - 12, duration - 1], [1, 0], {...clamp, easing: ease});
  return Math.min(enter, leave);
};

const StadiumBackground: React.FC<{p: HilalStatsProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const hc = homeColor(p);
  const ac = awayColor(p);
  const sweep = interpolate(frame % 180, [0, 179], [-520, 1480]);
  const pulse = 0.42 + 0.14 * Math.sin(frame / 17);

  return (
    <AbsoluteFill style={{background: "#02070b", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(circle at 16% 25%, ${rgba(hc, 0.23)} 0%, transparent 31%),
            radial-gradient(circle at 84% 27%, ${rgba(ac, 0.18)} 0%, transparent 30%),
            radial-gradient(circle at 50% 14%, rgba(41,91,120,.34) 0%, rgba(6,20,29,.92) 35%, #02070b 73%)`,
        }}
      />

      <div style={{position: "absolute", left: -210, right: -210, top: 135, height: 450, borderRadius: "50%", border: "2px solid rgba(255,255,255,.09)", boxShadow: `0 0 145px ${rgba(hc, 0.12)}, inset 0 -100px 160px rgba(0,0,0,.76)`}} />
      <div style={{position: "absolute", left: -80, right: -80, top: 245, height: 310, borderRadius: "50%", border: "1px solid rgba(255,255,255,.07)"}} />

      {Array.from({length: 18}).map((_, i) => {
        const left = 52 + i * 57;
        const flick = 0.38 + 0.24 * Math.sin((frame + i * 9) / 10);
        return <div key={i} style={{position: "absolute", left, top: 322 + (i % 2) * 12, width: 8, height: 8, borderRadius: "50%", background: "white", opacity: flick, boxShadow: `0 0 20px white, 0 0 54px ${rgba(i % 2 ? ac : hc, 0.45)}`}} />;
      })}

      <div style={{position: "absolute", left: 45, right: 45, bottom: -260, height: 920, transform: "perspective(1000px) rotateX(62deg)", transformOrigin: "center bottom", background: "linear-gradient(180deg,rgba(8,53,38,.94),rgba(2,21,17,.98))", border: "1px solid rgba(255,255,255,.10)", boxShadow: "0 -60px 120px rgba(0,0,0,.46), inset 0 0 110px rgba(16,150,98,.08)"}}>
        {Array.from({length: 11}).map((_, i) => <div key={i} style={{position: "absolute", left: 0, right: 0, top: i * 82, height: 41, background: i % 2 ? "rgba(255,255,255,.008)" : "rgba(45,185,120,.025)"}} />)}
      </div>

      <div style={{position: "absolute", left: sweep, top: -350, width: 115, height: 2650, transform: "rotate(15deg)", background: "linear-gradient(90deg,transparent,rgba(82,213,255,.20),rgba(255,235,175,.11),transparent)", filter: "blur(20px)", mixBlendMode: "screen", opacity: 0.85}} />
      <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 650, background: "linear-gradient(180deg,rgba(255,255,255,.025),transparent)"}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.08) 56%,rgba(0,0,0,${pulse}))`}} />
    </AbsoluteFill>
  );
};

const TeamMark: React.FC<{name: string; color: string; badge?: string | null; side: "home" | "away"}> = ({name, color, badge, side}) => {
  const first = name.trim().charAt(0) || (side === "home" ? "H" : "A");
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: 250}}>
      <div style={{width: 142, height: 142, display: "flex", alignItems: "center", justifyContent: "center", filter: `drop-shadow(0 16px 26px ${rgba(color, .30)})`}}>
        {badge ? <Img src={badge} style={{width: 132, height: 132, objectFit: "contain"}} /> : (
          <div style={{width: 122, height: 122, borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 66, fontWeight: 950, color, border: `2px solid ${rgba(color,.70)}`, background: `linear-gradient(145deg,${rgba(color,.17)},rgba(2,10,16,.80))`, boxShadow: `0 0 46px ${rgba(color,.18)}, inset 0 0 25px rgba(255,255,255,.04)`}}>{first}</div>
        )}
      </div>
      <div style={{fontSize: 31, fontWeight: 900, color: "#fff", marginTop: 8}}>{name}</div>
    </div>
  );
};

const PersistentHeader: React.FC<{p: HilalStatsProps}> = ({p}) => {
  const hc = homeColor(p);
  const ac = awayColor(p);
  return (
    <>
      <div style={{position: "absolute", left: 34, top: 28, display: "flex", alignItems: "center", gap: 12}}>
        {p.assets?.competitionLogoUrl ? <Img src={p.assets.competitionLogoUrl} style={{height: 54, width: 54, objectFit: "contain"}} /> : null}
        <div style={{fontSize: 18, color: "rgba(255,255,255,.75)", fontWeight: 800}}>{p.competition || ""}</div>
      </div>
      <Img src={tacticLogo(p)} style={{position: "absolute", right: 36, top: 30, width: 180, height: 52, objectFit: "contain", opacity: .96}} />

      <div style={{position: "absolute", top: 122, left: 0, right: 0, textAlign: "center"}}>
        <div style={{fontSize: 20, color: "#d9b85f", fontWeight: 900}}>{p.round ? `الجولة ${p.round}` : "إحصائيات المباراة"}</div>
        <div style={{fontSize: 58, lineHeight: 1.15, color: "white", fontWeight: 950, marginTop: 16, textShadow: "0 12px 34px rgba(0,0,0,.55)"}}>إحصائيات المباراة</div>
        <div style={{fontSize: 22, color: "rgba(255,255,255,.64)", fontWeight: 700, marginTop: 8}}>الأرقام تحكي ما لم يقله الملعب</div>
      </div>

      <div style={{position: "absolute", top: 325, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 50, direction: "ltr"}}>
        <TeamMark name={p.homeTeam} color={hc} badge={p.assets?.homeBadgeUrl} side="home" />
        <div style={{fontSize: 40, color: "rgba(255,255,255,.55)", fontWeight: 600}}>×</div>
        <TeamMark name={p.awayTeam} color={ac} badge={p.assets?.awayBadgeUrl} side="away" />
      </div>
    </>
  );
};

const GlassModule: React.FC<{p: HilalStatsProps; title: string; duration?: number; children: React.ReactNode}> = ({p, title, duration = SCENE_FRAMES, children}) => {
  const frame = useCurrentFrame();
  const alpha = sceneOpacity(frame, duration);
  const y = interpolate(frame, [0, 18], [28, 0], {...clamp, easing: out});
  const hc = homeColor(p);
  const ac = awayColor(p);
  return (
    <div style={{position: "absolute", left: 62, right: 62, top: 810, height: 410, opacity: alpha, transform: `translateY(${y}px)`, borderRadius: 28, background: "linear-gradient(180deg,rgba(2,16,24,.77),rgba(2,12,19,.90))", border: "1px solid rgba(255,255,255,.16)", boxShadow: `0 26px 70px rgba(0,0,0,.38), inset 0 0 70px ${rgba(hc,.035)}, 0 0 46px ${rgba(ac,.035)}`, overflow: "hidden", backdropFilter: "blur(10px)"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg,${hc},rgba(255,255,255,.65),${ac})`, boxShadow: `0 0 20px ${rgba(hc,.30)}`}} />
      <div style={{height: 74, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25, fontWeight: 900, color: "rgba(255,255,255,.90)", borderBottom: "1px solid rgba(255,255,255,.08)"}}>{title}</div>
      {children}
    </div>
  );
};

const ValueSides: React.FC<{p: HilalStatsProps; frame: number; home: number; away: number; decimals?: number; suffix?: string}> = ({p, frame, home, away, decimals = 0, suffix = ""}) => (
  <>
    <div style={{position: "absolute", left: 34, top: 128, width: 180, textAlign: "left"}}>
      <div style={{fontSize: 68, lineHeight: 1, fontWeight: 950, color: homeColor(p), textShadow: `0 0 22px ${rgba(homeColor(p),.28)}`}}>{countTo(home, frame, decimals)}{suffix}</div>
    </div>
    <div style={{position: "absolute", right: 34, top: 128, width: 180, textAlign: "right"}}>
      <div style={{fontSize: 68, lineHeight: 1, fontWeight: 950, color: awayColor(p), textShadow: `0 0 22px ${rgba(awayColor(p),.25)}`}}>{countTo(away, frame, decimals)}{suffix}</div>
    </div>
  </>
);

const TickBars: React.FC<{p: HilalStatsProps; home: number; away: number}> = ({p, home, away}) => {
  const frame = useCurrentFrame();
  const maxTicks = 24;
  const leftCount = Math.min(maxTicks, Math.max(0, Math.round(home)));
  const rightCount = Math.min(maxTicks, Math.max(0, Math.round(away)));
  return (
    <GlassModule p={p} title="إجمالي التسديدات">
      <ValueSides p={p} frame={frame} home={home} away={away} />
      <div style={{position: "absolute", left: 238, right: 238, top: 146, height: 86, display: "flex", alignItems: "center", justifyContent: "center", gap: 8}}>
        <div style={{display: "flex", flexDirection: "row-reverse", gap: 5, alignItems: "center"}}>
          {Array.from({length: maxTicks}).map((_, i) => {
            const shown = interpolate(frame - i * 1.3, [8, 36], [0, 1], clamp);
            const active = i < leftCount;
            return <div key={`h-${i}`} style={{width: 8, height: active ? 52 : 30, borderRadius: 4, background: active ? homeColor(p) : "rgba(255,255,255,.19)", opacity: active ? shown : .5, transform: `scaleY(${active ? .45 + .55 * shown : 1})`, boxShadow: active ? `0 0 12px ${rgba(homeColor(p),.45)}` : "none"}} />;
          })}
        </div>
        <div style={{width: 2, height: 72, background: "rgba(255,255,255,.23)", margin: "0 10px"}} />
        <div style={{display: "flex", gap: 5, alignItems: "center"}}>
          {Array.from({length: maxTicks}).map((_, i) => {
            const shown = interpolate(frame - i * 1.3, [8, 36], [0, 1], clamp);
            const active = i < rightCount;
            return <div key={`a-${i}`} style={{width: 8, height: active ? 52 : 30, borderRadius: 4, background: active ? awayColor(p) : "rgba(255,255,255,.19)", opacity: active ? shown : .5, transform: `scaleY(${active ? .45 + .55 * shown : 1})`, boxShadow: active ? `0 0 12px ${rgba(awayColor(p),.40)}` : "none"}} />;
          })}
        </div>
      </div>
      <div style={{position: "absolute", left: 80, right: 80, bottom: 48, height: 3, background: `linear-gradient(90deg,${homeColor(p)},rgba(255,255,255,.20),${awayColor(p)})`, opacity: .86}} />
    </GlassModule>
  );
};

const MiniGoalDots: React.FC<{p: HilalStatsProps; home: number; away: number; title?: string; chanceMode?: boolean}> = ({p, home, away, title = "التسديدات على المرمى", chanceMode = false}) => {
  const frame = useCurrentFrame();
  const h = Math.max(0, Math.min(10, Math.round(home)));
  const a = Math.max(0, Math.min(10, Math.round(away)));
  return (
    <GlassModule p={p} title={title}>
      <ValueSides p={p} frame={frame} home={home} away={away} />
      <div style={{position: "absolute", left: 355, top: 115, width: 240, height: 150, border: "4px solid rgba(255,255,255,.70)", borderBottomWidth: 7, boxShadow: "0 0 24px rgba(255,255,255,.08), inset 0 0 30px rgba(255,255,255,.02)", backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)", backgroundSize: "30px 30px"}}>
        {Array.from({length: h}).map((_, i) => {
          const reveal = interpolate(frame - i * 4, [8, 24], [0, 1], clamp);
          const x = 18 + ((i * 61) % 180);
          const y = 20 + ((i * 37) % 95);
          return <div key={`hd-${i}`} style={{position: "absolute", left: x, top: y, width: chanceMode ? 18 : 15, height: chanceMode ? 18 : 15, borderRadius: chanceMode ? 5 : "50%", background: homeColor(p), opacity: reveal, transform: `scale(${.25 + .75 * reveal}) rotate(${chanceMode ? 45 : 0}deg)`, boxShadow: `0 0 16px ${rgba(homeColor(p),.72)}`}} />;
        })}
        {Array.from({length: a}).map((_, i) => {
          const reveal = interpolate(frame - i * 4 - 5, [8, 24], [0, 1], clamp);
          const x = 32 + ((i * 73 + 90) % 170);
          const y = 24 + ((i * 49 + 22) % 92);
          return <div key={`ad-${i}`} style={{position: "absolute", left: x, top: y, width: chanceMode ? 18 : 15, height: chanceMode ? 18 : 15, borderRadius: chanceMode ? 5 : "50%", border: `3px solid ${awayColor(p)}`, background: chanceMode ? rgba(awayColor(p),.16) : awayColor(p), opacity: reveal, transform: `scale(${.25 + .75 * reveal}) rotate(${chanceMode ? 45 : 0}deg)`, boxShadow: `0 0 16px ${rgba(awayColor(p),.60)}`}} />;
        })}
      </div>
      <div style={{position: "absolute", left: 80, right: 80, bottom: 48, height: 3, background: `linear-gradient(90deg,${homeColor(p)},rgba(255,255,255,.20),${awayColor(p)})`, opacity: .86}} />
    </GlassModule>
  );
};

const XgBars: React.FC<{p: HilalStatsProps; home: number; away: number}> = ({p, home, away}) => {
  const frame = useCurrentFrame();
  const max = Math.max(.1, home, away);
  const hp = interpolate(frame, [8, 54], [0, home / max], {...clamp, easing: out});
  const ap = interpolate(frame, [8, 54], [0, away / max], {...clamp, easing: out});
  return (
    <GlassModule p={p} title="الأهداف المتوقعة xG">
      <ValueSides p={p} frame={frame} home={home} away={away} decimals={2} />
      <div style={{position: "absolute", left: 360, top: 110, width: 230, height: 190, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 34}}>
        <div style={{width: 62, height: 150, display: "flex", alignItems: "flex-end", background: "rgba(255,255,255,.06)", borderRadius: "10px 10px 3px 3px", overflow: "hidden"}}>
          <div style={{width: "100%", height: `${hp * 100}%`, background: `linear-gradient(180deg,${homeColor(p)},${rgba(homeColor(p),.42)})`, boxShadow: `0 0 28px ${rgba(homeColor(p),.45)}`}} />
        </div>
        <div style={{width: 62, height: 150, display: "flex", alignItems: "flex-end", background: "rgba(255,255,255,.06)", borderRadius: "10px 10px 3px 3px", overflow: "hidden"}}>
          <div style={{width: "100%", height: `${ap * 100}%`, background: `linear-gradient(180deg,${awayColor(p)},${rgba(awayColor(p),.32)})`, boxShadow: `0 0 28px ${rgba(awayColor(p),.35)}`}} />
        </div>
      </div>
      <div style={{position: "absolute", left: 320, right: 320, bottom: 68, height: 2, background: "rgba(255,255,255,.22)"}} />
      <div style={{position: "absolute", left: 80, right: 80, bottom: 48, height: 3, background: `linear-gradient(90deg,${homeColor(p)},rgba(255,255,255,.20),${awayColor(p)})`, opacity: .86}} />
    </GlassModule>
  );
};

const Possession: React.FC<{p: HilalStatsProps; home: number; away: number}> = ({p, home, away}) => {
  const frame = useCurrentFrame();
  const total = Math.max(1, home + away);
  const target = (home / total) * 100;
  const split = interpolate(frame, [8, 54], [50, target], {...clamp, easing: out});
  const spin = interpolate(frame, [0, 75], [-65, 0], clamp);
  return (
    <GlassModule p={p} title="الاستحواذ">
      <ValueSides p={p} frame={frame} home={home} away={away} suffix="%" />
      <div style={{position: "absolute", left: 300, right: 300, top: 155, height: 55, display: "flex", overflow: "hidden", borderRadius: 30, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.05)"}}>
        <div style={{width: `${split}%`, background: `linear-gradient(90deg,${rgba(homeColor(p),.45)},${homeColor(p)})`, boxShadow: `0 0 26px ${rgba(homeColor(p),.38)}`}} />
        <div style={{width: `${100 - split}%`, background: `linear-gradient(90deg,${awayColor(p)},${rgba(awayColor(p),.35)})`, boxShadow: `0 0 26px ${rgba(awayColor(p),.28)}`}} />
      </div>
      <div style={{position: "absolute", left: "50%", top: 130, width: 100, height: 100, borderRadius: "50%", transform: `translateX(-50%) rotate(${spin}deg)`, background: `conic-gradient(${homeColor(p)} 0 ${split}%, ${awayColor(p)} ${split}% 100%)`, boxShadow: "0 18px 32px rgba(0,0,0,.35)"}}>
        <div style={{position: "absolute", inset: 16, borderRadius: "50%", background: "#06121a", border: "1px solid rgba(255,255,255,.18)"}} />
      </div>
      <div style={{position: "absolute", left: 80, right: 80, bottom: 48, height: 3, background: `linear-gradient(90deg,${homeColor(p)},rgba(255,255,255,.20),${awayColor(p)})`, opacity: .86}} />
    </GlassModule>
  );
};

const Motm: React.FC<{p: HilalStatsProps}> = ({p}) => {
  const frame = useCurrentFrame();
  const star: any = p.starPlayer || {};
  const photo = star.photoUrl || star.imageUrl || p.assets?.starPlayerPhotoUrl || null;
  const rating = n(star.rating, 8.3);
  const name = String(star.name || "نجم المباراة");
  const alpha = sceneOpacity(frame, MOTM_FRAMES);
  return (
    <div style={{position: "absolute", left: 62, right: 62, top: 760, height: 560, opacity: alpha, borderRadius: 30, background: "linear-gradient(180deg,rgba(3,18,25,.76),rgba(2,11,17,.92))", border: "1px solid rgba(255,255,255,.15)", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.42)"}}>
      <div style={{position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `linear-gradient(90deg,${homeColor(p)},#d6b45c,${awayColor(p)})`}} />
      {photo ? <Img src={photo} style={{position: "absolute", left: 15, bottom: -30, width: 360, height: 520, objectFit: "contain", filter: "drop-shadow(0 28px 34px rgba(0,0,0,.55))"}} /> : null}
      <div style={{position: "absolute", right: 36, top: 38, textAlign: "right", width: 500}}>
        <div style={{fontSize: 18, color: "#d6b45c", fontWeight: 900}}>MAN OF THE MATCH</div>
        <div style={{fontSize: 42, color: "white", fontWeight: 950, marginTop: 4}}>نجم المباراة</div>
        <div style={{fontSize: 38, color: "white", fontWeight: 900, marginTop: 36}}>{name}</div>
        <div style={{marginTop: 24, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 18}}>
          <div style={{fontSize: 28, color: "rgba(255,255,255,.68)", fontWeight: 800}}>التقييم</div>
          <div style={{fontSize: 76, lineHeight: 1, color: "#e5c15f", fontWeight: 950}}>{countTo(rating, frame, 1, 10, 62)}</div>
        </div>
      </div>
    </div>
  );
};

const findCard = (p: HilalStatsProps, id: string, fallbackIndex: number) => {
  const exact = p.statsCards?.find((x: any) => String(x.id).toLowerCase() === id);
  return exact || p.statsCards?.[fallbackIndex] || {homeValue: 0, awayValue: 0, headline: id};
};

const StatScene: React.FC<{p: HilalStatsProps; id: string; index: number}> = ({p, id, index}) => {
  const card: any = findCard(p, id, index);
  const home = n(card.homeValue);
  const away = n(card.awayValue);
  if (id === "shots") return <TickBars p={p} home={home} away={away} />;
  if (id === "shots_on_target") return <MiniGoalDots p={p} home={home} away={away} />;
  if (id === "big_chances") return <MiniGoalDots p={p} home={home} away={away} title="الفرص الكبيرة" chanceMode />;
  if (id === "xg") return <XgBars p={p} home={home} away={away} />;
  return <Possession p={p} home={home} away={away} />;
};

export const TacticStatsHilalReference: React.FC<HilalStatsProps> = (p) => {
  const order = ["shots", "shots_on_target", "big_chances", "xg", "possession"];
  return (
    <AbsoluteFill style={{fontFamily: cairo, color: "white", background: "#02070b", overflow: "hidden"}}>
      <StadiumBackground p={p} />
      <PersistentHeader p={p} />
      {order.map((id, index) => (
        <Sequence key={id} from={index * SCENE_FRAMES} durationInFrames={SCENE_FRAMES} premountFor={12}>
          <StatScene p={p} id={id} index={index} />
        </Sequence>
      ))}
      {p.includeMotm ? (
        <Sequence from={order.length * SCENE_FRAMES} durationInFrames={MOTM_FRAMES} premountFor={12}>
          <Motm p={p} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
