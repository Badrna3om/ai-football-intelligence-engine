# OpenMontage Production Prompt — TACTIC Wasl vs Baniyas

Use the project data in `tactic_match.json` and the style contract in `PRODUCTION_BRIEF.md` as the source of truth.

Create a **single cohesive 1080x1920 Arabic vertical match recap** for Baniyas 0–2 Al Wasl using the **hybrid pipeline**, **Remotion runtime**, and **Atelier composition mode**.

You are not making a slideshow. You are creating a premium Arabic football broadcast package.

## Critical priorities
1. The real goal footage is the hero and should occupy most of the vertical frame.
2. All Arabic typography must use **Thmanyah** with correct RTL shaping.
3. Include team crests, competition identity, and restrained TACTIC branding.
4. Add a cinematic sports music bed while preserving and prioritizing goal commentary/crowd audio.
5. Statistics must be animated natively in motion, not rendered as static cards that merely slide in.
6. Use Cameron Puertas cutout for the MOTM hero reveal.
7. Do not invent any data or substitute missing assets without explicitly reporting the blocker.

## Editorial rhythm
- Intro: 3–4 s
- Goal 1: keep the decisive action + reaction, compact lower-third only
- Goal 2: same treatment
- Stat package: ~9–12 s total, one stat at a time
- MOTM: ~4–6 s
- Outro: ~2–3 s
- Total target: roughly 38–50 s depending on goal clip length

## Avoid
- Small horizontal footage floating in a large empty vertical canvas
- Oversized lower-thirds covering the action
- Generic social-media card templates
- Static stat screenshots
- All stats visible at once
- Repeating one transition everywhere
- Excessive gold or decorative noise
- Missing glyph boxes or non-Thmanyah Arabic font fallback

## Required animated stat treatments
- Possession: opposing split bars fill to 46% / 54%, numbers count up
- xG: twin progressive meters count to 1.57 / 2.57
- Shots: tactical shot trails + count-up to 19 / 13
- Shots on target: goal/target dots + count-up to 4 / 6
- Big chances: penalty-box / chance-zone pulse + count-up to 1 / 2

## MOTM
Create a broadcast award-style hero scene for **كاميرون بويرتاس**:
- cutout hero reveal
- 8.3 rating animated into place
- 1 goal
- 2 key passes
- 89% passing accuracy
- 76 touches
- supporting numbers should stagger around the player rather than appear in identical boxes

## Audio mix
Use an energetic, cinematic sports bed. Duck music beneath source commentary and crowd sound, then let the original match audio peak naturally around each goal. Add restrained impact/whoosh/riser accents only where they improve the edit.

## Final review before export
Reject and revise your own render if any of these are true:
- footage is too small
- a lower-third blocks the decisive action
- Arabic is malformed
- logos are missing
- music is absent
- stats are static rather than genuinely animated
- MOTM is a static text card without player cutout

Export the approved result to `renders/final.mp4` and produce the normal OpenMontage artifacts/checkpoints for the project.
