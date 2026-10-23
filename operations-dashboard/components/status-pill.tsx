const good=new Set(["ready","rendered","published","completed","approved","active","asset_ready"]);
const bad=new Set(["failed","error","rejected","disabled","stale"]);
const warn=new Set(["pending","awaiting_approval","proposed","deferred","locked","lineup_pending","final_waiting"]);
export function StatusPill({value}:{value?:string|null}) {
  const n=(value||"unknown").toLowerCase();
  const tone=good.has(n)?"good":bad.has(n)?"bad":warn.has(n)?"warn":"neutral";
  return <span className={`pill ${tone}`}>{value||"—"}</span>;
}
