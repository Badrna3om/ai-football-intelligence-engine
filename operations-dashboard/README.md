# TACTIC SPORT — Operations Dashboard V1.1

Read-only operations center for the TACTIC/BESKOT automation stack.

## V1.1
- Operations overview
- Matches Control Center with operational filters
- Content production / publish queue filters
- Story Miner review
- System Health with stale-check detection
- Auto refresh every 30 seconds
- Asia/Dubai timestamps
- Server-only Supabase live reads

## Run
```bash
cp .env.example .env.local
# Fill SUPABASE_SECRET_KEY with the server-only sb_secret_... key
npm install
npm run dev
```

Open http://localhost:3000

## Security
The Supabase secret key stays server-side only. Never commit it and never expose it through a NEXT_PUBLIC variable.
Legacy SUPABASE_SERVICE_ROLE_KEY remains supported temporarily for compatibility.

## V2-ready
Future secure server actions can add retry, requeue, approve/reject/defer, rerender, featured toggles and publish approval without moving n8n business logic into the frontend.
