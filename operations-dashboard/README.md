# TACTIC SPORT — Operations Dashboard V1

Read-only operations center for the TACTIC/BESKOT automation stack.

## V1
- Operations overview
- Matches Control Center
- Content production / publish queues
- Story Miner review
- System Health / workflow diagnostics

The dashboard does not mutate n8n or Supabase state in V1.

## Run
```bash
cp .env.example .env.local
# Fill SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Open http://localhost:3000

## Security
The service-role key stays server-side only. Never commit it or expose it through NEXT_PUBLIC variables.

## V2-ready
Future secure server actions can add retry, requeue, approve/reject/defer, rerender, featured toggles and publish approval without moving n8n business logic into the frontend.
