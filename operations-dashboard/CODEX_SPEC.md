# Codex brief — TACTIC Operations Dashboard V1

Build and maintain a production-grade read-only dashboard over the existing TACTIC SPORT / BESKOT automation stack.

Workflow map: WF09A Planner → WF09B Dispatcher → WF09C Match Worker → WF11 Content Orchestrator → WF12 Production → Publish Queue.

Pages: Overview, Matches, Content Production, Story Miner, System Health.

Hard constraints: Arabic RTL first; dark TACTIC visual language with gold accents; read-only in V1; no browser exposure of Supabase service role; do not duplicate n8n business logic; display timestamps in Asia/Dubai; do not modify motion-renderer or existing n8n workflows.

V2 extension points: retry/requeue, featured toggle, story approve/reject/defer, rerender, publish approval, health recovery actions.
