# TACTIC OpenMontage Lab — بني ياس × الوصل

## Objective
Produce a premium vertical Arabic post-match motion recap from real goal footage plus verified TACTIC match data. This is an OpenMontage quality experiment only; it is not connected to n8n or production publishing.

## Match
- UAE Pro League — Round 6
- Baniyas 0–2 Al Wasl
- 16 Oct 2026 — Baniyas Stadium
- Goal 1: 11' مهدي طارمي — assist نيكولاس خيمينيز
- Goal 2: 45+1' كاميرون بويرتاس

## Visual direction
- 1080 × 1920 vertical
- Arabic-first layout, RTL safe
- Dark matte football/broadcast aesthetic
- White typography with restrained gold accents
- Cairo-compatible Arabic typography
- Tactical pitch/grid texture as a subtle background device
- Clean, premium, cinematic motion; avoid generic social-media template look
- Use real footage as the visual anchor; graphics support the footage, never overpower it

## Required sequence
1. **Intro / Match identity** — team crests, competition, final score tease.
2. **Goal 1** — real clip, scorer lower-third, minute 11', assist line.
3. **Goal 2** — real clip, scorer lower-third, minute 45+1'.
4. **Stat sequence** — reveal one metric at a time with enough reading time:
   - التسديدات: بني ياس 19 — 13 الوصل
   - على المرمى: بني ياس 4 — 6 الوصل
   - الفرص الكبيرة: بني ياس 1 — 2 الوصل
   - xG: بني ياس 1.57 — 2.57 الوصل
   - الاستحواذ: بني ياس 46% — 54% الوصل
5. **Man of the Match** — كاميرون بويرتاس, rating 8.3, goal 1, key passes 2, passing 55/62 (89%), touches 76.
6. **Outro** — final score and TACTIC identity.

## Motion language
- Possession: animated split bar.
- Shots: directional shot trails / count-up.
- Shots on target: target/goal dots or focused count-up.
- Big chances: box/chance-map inspired reveal.
- xG: twin progressive meter with numeric count-up.
- MOTM: portrait/cutout hero reveal, rating count-up, supporting stats staggered.
- Stats must NOT all appear at once. Each card should enter, breathe, and transition cleanly.

## Audio
- Energetic cinematic sports bed.
- Preserve goal commentary/audio where usable.
- Duck music under commentary and let commentary peak around goals.
- Add restrained impact/whoosh transitions; avoid excessive SFX.

## Source-of-truth rules
- Use `tactic_match.json` for match facts and numbers.
- Do not infer or fabricate any statistic.
- Goal footage will be supplied separately as `assets/video/goal_01.mp4` and `goal_02.mp4`.
- If an asset is absent, report it as a blocker rather than silently substituting unrelated material.

## OpenMontage path
- Pipeline: `hybrid`
- Runtime: `remotion`
- Composition mode: `atelier`
- Real footage is the anchor medium.
- This is hero-quality work: custom visual language, not stock scene cards.

## Success criteria
- Goal footage is correctly ordered and not cropped badly.
- Arabic text has no overlap, clipping, reversed punctuation, or unreadable timing.
- Stats are visually animated and readable.
- MOTM card feels like a hero moment, not a static slide.
- Audio transitions are clean and commentary remains intelligible.
- Final output passes ffprobe and visual review.
