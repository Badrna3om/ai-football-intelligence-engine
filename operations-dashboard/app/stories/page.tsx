import Link from "next/link";
import {Metric,PageIntro,Panel} from "@/components/ui";
import {StatusPill} from "@/components/status-pill";
import {fmtDate,number,truncate} from "@/lib/format";
import {countRows,getStoriesPage} from "@/lib/db";
import {authEnabled,isOperator} from "@/lib/auth";
import {storyDecisionAction} from "@/app/actions";

export const dynamic="force-dynamic";
const filters=[["all","الكل"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"],["deferred","Deferred"]];

function hrefOf(status:string,page:number){
  const p=new URLSearchParams();
  if(status!=="all") p.set("status",status);
  if(page>1) p.set("page",String(page));
  const q=p.toString();
  return q?"/stories?"+q:"/stories";
}

export default async function StoriesPage({searchParams}:{searchParams:Promise<{status?:string;page?:string}>}){
  const p=await searchParams;
  const active=p.status||"all";
  const page=Math.max(1,Number(p.page||1));
  const [stories,operator,pendingCount,approvedCount]=await Promise.all([
    getStoriesPage(page,24,active),
    isOperator(),
    countRows("beskot_story_pool",{approval_status:"eq.pending"}),
    countRows("beskot_story_pool",{approval_status:"eq.approved"})
  ]);
  const actionsAvailable=authEnabled()&&operator;
  const pages=Math.max(1,Math.ceil((stories.count??0)/24));
  const avg=stories.data.length?stories.data.reduce((sum,s)=>sum+Number(s.final_score||0),0)/stories.data.length:0;

  return <>
    <PageIntro title="Story Miner" subtitle="مراجعة القصص واتخاذ القرار مباشرة من لوحة العمليات."/>
    <div className="filter-bar">
      {filters.map(([value,label])=><Link key={value} className={"filter-chip "+(active===value?"active":"")} href={hrefOf(value,1)}>{label}</Link>)}
    </div>
    <div className="metric-grid compact">
      <Metric label="إجمالي القصص" value={number(stories.count)}/>
      <Metric label="Pending" value={number(pendingCount)} tone={pendingCount?"warn":"default"}/>
      <Metric label="Approved" value={number(approvedCount)} tone="good"/>
      <Metric label="متوسط Score" value={avg.toFixed(1)}/>
      <Metric label="Actions" value={actionsAvailable?"ON":"LOCKED"} detail={actionsAvailable?"Operator session":"Read-only"} tone={actionsAvailable?"good":"warn"}/>
    </div>

    <Panel title="القصص">
      <div className="story-grid">{stories.data.map(s=><article className="story-card" key={s.id}>
        <div className="story-top"><span className="score-badge">{s.final_score?.toFixed(1)??"—"}</span><StatusPill value={s.approval_status||s.status}/></div>
        <small>{s.competition_name||"—"} · #{s.id}{s.game_id?" · Game "+s.game_id:""}</small>
        <h3>{s.headline||"بدون عنوان"}</h3>
        <p>{truncate(s.angle,180)}</p>
        <div className="story-footer"><span>{s.primary_entity_name||"—"}</span><span>{fmtDate(s.proposed_at||s.created_at)}</span></div>
        {actionsAvailable&&["pending","proposed","deferred"].includes((s.approval_status||s.status||"").toLowerCase())?<div className="story-actions">
          <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="approve"/><button className="mini-button good-button">Approve</button></form>
          <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="defer"/><button className="mini-button">Defer 6h</button></form>
          <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="reject"/><button className="mini-button danger-button">Reject</button></form>
        </div>:null}
      </article>)}</div>
    </Panel>

    <div className="pagination">
      <Link className={"filter-chip "+(page<=1?"disabled":"")} href={hrefOf(active,page>1?page-1:1)}>السابق</Link>
      <span>صفحة {page} من {pages}</span>
      <Link className={"filter-chip "+(page>=pages?"disabled":"")} href={hrefOf(active,page<pages?page+1:page)}>التالي</Link>
    </div>
  </>;
}
