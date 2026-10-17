#!/usr/bin/env bash
set -euo pipefail

OM_ROOT="/workspaces/OpenMontage"
PROJECT_ID="wasl-baniyas-test"

sudo apt-get update
sudo apt-get install -y ffmpeg make git jq

if [ ! -d "$OM_ROOT/.git" ]; then
  git clone --depth 1 https://github.com/calesthio/OpenMontage.git "$OM_ROOT"
else
  git -C "$OM_ROOT" pull --ff-only || true
fi

cd "$OM_ROOT"

python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install piper-tts || true

cd remotion-composer
npm install
cd ..

if [ ! -f .env ]; then
  cp .env.example .env
fi

mkdir -p "projects/$PROJECT_ID/assets/video"
mkdir -p "projects/$PROJECT_ID/assets/images"
mkdir -p "projects/$PROJECT_ID/assets/audio"
mkdir -p "projects/$PROJECT_ID/assets/music"
mkdir -p "projects/$PROJECT_ID/artifacts"
mkdir -p "projects/$PROJECT_ID/renders"

cat > "projects/$PROJECT_ID/TACTIC_INPUT_TEMPLATE.json" <<'JSON'
{
  "project_id": "wasl-baniyas-test",
  "match": {
    "home_team": "بني ياس",
    "away_team": "الوصل",
    "score": null,
    "competition": "دوري أدنوك للمحترفين",
    "date": null
  },
  "stats": {
    "possession": null,
    "shots": null,
    "shots_on_target": null,
    "big_chances": null,
    "xg": null
  },
  "man_of_the_match": null,
  "assets": {
    "goal_videos": [],
    "home_logo": null,
    "away_logo": null,
    "competition_logo": null,
    "music": null
  },
  "production": {
    "pipeline": "hybrid",
    "render_runtime": "remotion",
    "composition_mode": "atelier",
    "aspect_ratio": "9:16",
    "target_resolution": "1080x1920",
    "language": "ar"
  }
}
JSON

cat > "projects/$PROJECT_ID/README_TACTIC.txt" <<'TXT'
TACTIC OpenMontage Test Project

Drop match assets here:
- assets/video/goal_01.mp4, goal_02.mp4, ...
- assets/images/home_logo.png
- assets/images/away_logo.png
- assets/images/competition_logo.png
- optional assets/music/theme.mp3

The structured match data lives in:
- TACTIC_INPUT_TEMPLATE.json

Planned test pipeline:
Intro -> Goals -> Stats -> Man of the Match -> Outro
Pipeline: hybrid
Runtime: Remotion
Composition mode: Atelier
Output: renders/final.mp4
TXT

python - <<'PY'
from pathlib import Path
from tools.tool_registry import registry
registry.discover()
print("\n=== OpenMontage provider menu ===")
try:
    import json
    print(json.dumps(registry.provider_menu_summary(), indent=2))
except Exception as e:
    print("Provider menu check warning:", e)

p = Path("projects/wasl-baniyas-test")
print("\n=== TACTIC lab ready ===")
print(p.resolve())
PY

echo
echo "OpenMontage lab setup complete."
echo "Runtime: $OM_ROOT"
echo "Project: $OM_ROOT/projects/$PROJECT_ID"
echo "Activate with: source $OM_ROOT/.venv/bin/activate"
