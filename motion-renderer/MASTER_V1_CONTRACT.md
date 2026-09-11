# TACTIC MOTION — MASTER v1.0

Locked visual reference: V23.

## Immutable
- 1080x1920, 30 fps.
- Scene order: Intro → Match Presentation → Goals → Final Result Timeline → Version-B Stats → MOTM → Outro.
- Goal lower-third motion, result timeline motion, Version-B stat stacking, black/gold MOTM opening sequence.
- Crossfade transitions. No black-frame transitions.
- One TACTIC SPORT logo per scene.
- Missing assist means no assist line.

## Dynamic per match
- gameId, competition, round, dateLabel, timeLabel, venue, referee.
- homeTeam, awayTeam, homeRank, awayRank, score.
- design.homeColor, design.awayColor.
- assets.stadiumImageUrl, homeBadgeUrl, awayBadgeUrl, competitionLogoUrl, tacticLogoUrl, starPlayerPhotoUrl.
- goals: minute, displayMinute, scorer, team, teamSide, assist, scoreAfter, videoUrl, videoStartSeconds, durationInSeconds.
- timelineEvents: minute, type, teamSide, player, label.
- statsCards in fixed order: shots, shots_on_target, big_chances, xg, possession.
- starPlayer: name, team, photoUrl, goals, assists, position, rating, minutes.

## n8n
Send the same render payload to the existing TACTIC Motion endpoint with:
compositionId = TacticMasterV1
templateVersion = TACTIC_MASTER_V1

Do not send layout coordinates. Remotion owns all placement and animation.
