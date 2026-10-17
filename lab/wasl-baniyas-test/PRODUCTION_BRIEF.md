# TACTIC OpenMontage Lab — بني ياس × الوصل

## Objective
Produce a premium vertical Arabic post-match motion recap from real goal footage plus verified TACTIC match data. This is an OpenMontage quality experiment only; it is not connected to n8n or production publishing.

## Match
- UAE Pro League — Round 6
- Baniyas 0–2 Al Wasl
- 16 Oct 2026 — Baniyas Stadium
- Goal 1: 11' مهدي طارمي — assist نيكولاس خيمينيز
- Goal 2: 45+1' كاميرون بويرتاس

# TACTIC Visual Identity — non-negotiable

## Core look
- 1080 × 1920 vertical, designed for social/mobile viewing.
- Arabic-first composition with correct RTL shaping and punctuation.
- Use **Thmanyah / خط ثمانية** for all Arabic typography. Do not use Cairo as fallback unless Thmanyah is unavailable and the run is explicitly marked as blocked.
- Dark matte sports-broadcast world: near-black backgrounds, subtle tactical pitch/grid geometry, restrained gold highlights, crisp off-white typography.
- Premium football broadcast energy, not a generic Instagram template.
- Real match footage is the hero. Graphics frame and amplify the football moment; they must never dominate it.
- Avoid large static cards that cover the goal action.
- Avoid decorative clutter, emoji, generic stock icons, and canned social-media transitions.

## Composition language
- Strong hierarchy: one visual idea per beat.
- Keep safe margins for vertical/mobile viewing.
- Team crests should be clean, sharp, and proportionally balanced.
- TACTIC branding should be present but restrained: small persistent brand mark or short logo sting, never oversized.
- Use depth through subtle blur, parallax, light sweeps, masked reveals, and controlled scale movement.
- Gold is an accent, not the dominant fill color.
- Use fast, confident transitions around goals; slower, readable motion for stats.

## Goal footage treatment
- Goal clips must occupy most of the screen. Prefer full-bleed or near-full-bleed treatment.
- If source aspect ratio is horizontal, use a tasteful blurred/extended background while keeping the actual footage as large as possible.
- Do not shrink the real footage into a small center rectangle with excessive dead space.
- Lower-third must be broadcast-style and compact: scorer + minute + optional assist, occupying no more than roughly 18–22% of frame height.
- Preserve the decisive football action and celebration; do not crop the ball, scorer, goal mouth, or key reaction.
- Commentary/audio from the source clip should be preserved and should peak around the scoring moment.

## Intro
- Duration target: 3–4 seconds.
- Start with a quick TACTIC logo sting or tactical-line reveal.
- Reveal competition identity, both team crests, team names, and final score.
- Use cinematic crest entrances: masked slide/scale, subtle light sweep, or opposing lateral movement.
- Avoid simply placing two static logos above static text.
- End the intro with momentum that cuts directly into Goal 1.

## Required sequence
1. **Intro / Match identity** — TACTIC sting, team crests, competition, final score.
2. **Goal 1** — real clip, compact scorer lower-third, minute 11', assist line.
3. **Goal 2** — real clip, compact scorer lower-third, minute 45+1'.
4. **Stat sequence** — one metric at a time, animated as a visual system rather than static cards:
   - التسديدات: بني ياس 19 — 13 الوصل
   - على المرمى: بني ياس 4 — 6 الوصل
   - الفرص الكبيرة: بني ياس 1 — 2 الوصل
   - xG: بني ياس 1.57 — 2.57 الوصل
   - الاستحواذ: بني ياس 46% — 54% الوصل
5. **Man of the Match** — كاميرون بويرتاس, rating 8.3, goal 1, key passes 2, passing 55/62 (89%), touches 76.
6. **Outro** — final score, team crests, TACTIC identity.

# Motion language for statistics — MUST be genuinely animated

## Global stat rules
- Stats must not be pre-rendered as one static image.
- Numeric values should count up from zero or animate into place.
- Each metric should have its own motion metaphor.
- Reveal one metric, let it breathe, then transition to the next.
- Reading time target: roughly 1.7–2.3 seconds per metric.
- Team comparison must remain visually obvious at all times.

## Possession
- Animated split bar that fills from center or from opposite sides.
- Values count from 0 to 46% and 54%.
- The winning side receives a subtle gold emphasis.

## xG
- Twin progressive meters or energy bars.
- Values animate from 0.00 to 1.57 and 2.57.
- Use smooth progressive fill, not a static number reveal.

## Shots
- Directional shot trails or short tactical trajectories toward a stylized goal zone.
- Counts rise to 19 and 13.
- Do not use unrelated decorative particles.

## Shots on target
- Use target dots / goal-face markers / focused shot indicators.
- Counts rise to 4 and 6.
- Keep the visualization clean enough to read instantly.

## Big chances
- Use a penalty-box / chance-zone visual language with pulses or highlighted areas.
- Counts rise to 1 and 2.
- Avoid making this look like a full analytical heatmap if we do not have event coordinates.

# Man of the Match — hero moment
- Must use Cameron Puertas cutout/portrait when available.
- Portrait enters with a controlled hero reveal: masked rise, lateral parallax, or light sweep.
- Rating 8.3 should count up or lock in with an impact beat.
- Supporting stats stagger in around the player, not as four identical static boxes.
- The visual should feel like a broadcast award moment.
- Do not fabricate a portrait or substitute another player.

# Audio direction
- Energetic cinematic sports bed with percussion and tension/release.
- Preserve source commentary and crowd sound in both goal clips.
- Duck the music under commentary automatically.
- Let commentary and crowd peak at the scoring moment.
- Use restrained whooshes, low impacts, risers, and logo sting SFX.
- No excessive EDM drops, comedy SFX, or constant whooshing.
- Music should feel like premium sports broadcast / match recap, not generic corporate background music.

# Transition language
- Goals: quick kinetic cuts, directional wipes, short zoom transitions, or tactical-line wipes.
- Stats: cleaner, slower transitions with continuity between metrics.
- MOTM: premium hero reveal.
- Outro: resolve energy with final score + crest lockup + TACTIC sting.
- Do not use the same transition for every scene.

# Source-of-truth rules
- Use `tactic_match.json` for all match facts and numbers.
- Do not infer or fabricate any statistic.
- Goal footage is supplied as `assets/video/goal_01.mp4` and `assets/video/goal_02.mp4`.
- Team/competition/Tactic logos must come from supplied assets or the TACTIC library.
- MOTM cutout must come from the supplied TACTIC asset library.
- If an asset is missing, report it as a blocker rather than silently substituting unrelated material.

# OpenMontage execution path
- Pipeline: `hybrid`
- Runtime: `remotion`
- Composition mode: `atelier`
- Real footage is the anchor medium.
- Use custom scene design and custom animation logic.
- Do not fall back to generic premade scene-card templates.
- Prefer a single coherent visual system across the video rather than unrelated scene styles.

# Deliverable quality gates
The render is not approved unless all are true:
- Goal footage is correctly ordered and fills the vertical frame appropriately.
- Arabic uses Thmanyah and has no missing glyph boxes, overlap, clipping, or reversed punctuation.
- Both team crests and TACTIC identity are visible and clean.
- Music is present and correctly ducked under commentary.
- Statistics are truly animated: count-up/fill/trails/dots/pulses, not static cards merely sliding onto screen.
- MOTM includes the player cutout and feels like a hero moment.
- Final score is correct: بني ياس 0 - 2 الوصل.
- Output passes ffprobe and visual review.

# Style target in one sentence
**A premium Arabic football broadcast package: dark tactical environment, Thmanyah typography, restrained gold, large real goal footage, compact broadcast lower-thirds, expressive data motion, cinematic sports audio, and a strong player-hero finish.**
