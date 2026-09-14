import Link from "next/link";
import {Metric,PageIntro,Panel} from "@/components/ui";
import {StatusPill} from "@/components/status-pill";
import {fmtDate,number,truncate} from "@/lib/format";
import {countRows,getCompetitionOptions,getContentJobsByIds,getContentJobsPage,getPublishJobsPage} from "@/lib/db";
import {authEnabled,isOperator} from "@/lib/auth";
import {contentRequeueAction,publishDecisionAction} from "@/app/actions";
import type {ContentJobRow} from "@/lib/types";

export const dynamic="force-dynamic";
const filters=[["all","الكل"],["failed","Failed"],["rendered","Rendered"],["approval","Awaiting Approval"]];

const typeLabels:Record<string,string>={
  round_best_keeper:"أفضل حارس / الأكثر تصديًا",
  round_top_scorer:"هداف البطولة",
  round_most_shots:"الأكثر تسديدًا",
  round_next_fixtures:"مباريات الجولة القادمة",
  round_best_player:"نجم الجولة",
  round_player_of_round:"نجم الجولة",
  round_team_of_week:"تشكيلة الجولة",
  round_best_xi:"تشكيلة الجولة",
  round_lineup:"تشكيلة الجولة",
  match_lineup:"تشكيلة المباراة",
  match_result:"نتيجة المباراة",
  story:"قصة تحريرية"
};

function technicalTitle(j?:ContentJobRow){
  return j?.content_payload?.headline || j?.content_payload?.image_text || j?.content_payload?.title || j?.job_key || "بدون عنوان";
}

function editorialTitle(j:ContentJobRow,competitionAr?:string){
  const base=
    j.content_payload?.headline ||
    j.content_payload?.title ||
    typeLabels[j.content_type||""] ||
    j.content_type ||
    "محتوى";
  const competition=competitionAr||j.competition_name||"";
  const round=Number(j.content_payload?.through_round||j.round_num||0);
  const parts=[base];
  if(competition) parts.push(competition);
  if(round>0) parts.push("الجولة "+round);
  if(j.scope_type==="match"&&j.game_id) parts.push("مباراة #"+j.game_id);
  return parts.join(" — ");
}

function hrefOf(status:string,page:number){
  const p=new URLSearchParams();
  if(status!=="all") p.set("status",status);
  if(page>1) p.set("page",String(page));
  const q=p.toString();
  return q?"/content?"+q:"/content";
}

export default async function ContentPage({searchParams}:{searchParams:Promise<{status?:string;page?:string}>}){
  const p=await searchParams;
  const active=p.status||"all";
  const page=Math.max(1,Number(p.page||1));
  const [jobs,publish,operator,renderedCount,readyCount,publishedCount,failedCount,competitions]=await Promise.all([
    getContentJobsPage({page,pageSize:25,status:active}),
    getPublishJobsPage(page,25,active),
    isOperator(),
    countRows("beskot_content_jobs",{status:"eq.rendered"}),
    countRows("beskot_content_jobs",{status:"eq.ready"}),
    countRows("beskot_publish_queue",{status:"eq.published"}),
    countRows("beskot_content_jobs",{status:"eq.failed"}),
    getCompetitionOptions()
  ]);

  const actionsAvailable=authEnabled()&&operator;
  const publishSources=await getContentJobsByIds(publish.data.map(x=>x.source_job_id||0));
  const total=active==="approval"?(publish.count??0):(jobs.count??0);
  const pages=Math.max(1,Math.ceil(total/25));
  const byId=new Map([...jobs.data,...publishSources.data].map(j=>[j.id,j]));
  const competitionMap=new Map(competitions.map(c=>[c.competition_name||"",c.competition_name_ar||c.competition_name||""]));

  return <>
    <PageIntro title="Content Production" subtitle="كل مهمة تظهر بوصف تحريري واضح: نوع المحتوى + البطولة + الجولة، مع التفاصيل التقنية كسطر ثانٍ."/>
    <div className="filter-bar">
      {filters.map(([value,label])=><Link key={value} className={"filter-chip "+(active===value?"active":"")} href={hrefOf(value,1)}>{label}</Link>)}
    </div>

    <div className="metric-grid compact">
      <Metric label="Rendered" value={number(renderedCount)}/>
      <Metric label="Ready" value={number(readyCount)}/>
      <Metric label="Published" value={number(publishedCount)} tone="good"/>
      <Metric label="Failed" value={number(failedCount)} tone={failedCount?"bad":"good"}/>
      <Metric label="Actions" value={actionsAvailable?"ON":"LOCKED"} detail={actionsAvailable?"Operator session":"Read-only"} tone={actionsAvailable?"good":"warn"}/>
    </div>

    {active!=="approval"?<Panel title={"Content Jobs · "+(jobs.count??0)}>
      <div className="table-wrap"><table>
        <thead><tr><th>المحتوى</th><th>النوع</th><th>Template</th><th>Game</th><th>Priority</th><th>Status</th><th>Attempts</th><th>Error</th><th>Updated</th><th>Action</th></tr></thead>
        <tbody>{jobs.data.map(j=><tr key={j.id}>
          <td className="content-description-cell">
            <strong className="content-editorial-title">{editorialTitle(j,competitionMap.get(j.competition_name||""))}</strong>
            <small className="content-tech-line"><span className="mono">#{j.id}</span> · {j.content_type||"—"} · {j.job_key||"—"}</small>
          </td>
          <td>{typeLabels[j.content_type||""]||j.content_type||"—"}<small className="block">{j.scope_type||""}</small></td>
          <td className="mono">{j.template_key||"—"}</td>
          <td>{j.game_id?<Link className="text-link" href={"/matches/"+j.game_id}>{j.game_id}</Link>:"—"}</td>
          <td>{j.priority??0}</td>
          <td><StatusPill value={j.status}/></td>
          <td>{j.attempts??0}/{j.max_attempts??0}</td>
          <td className="error-cell">{truncate(j.error_message,52)}</td>
          <td>{fmtDate(j.updated_at)}</td>
          <td>{actionsAvailable&&["failed","rendered"].includes(j.status||"")?<form action={contentRequeueAction}><input type="hidden" name="id" value={j.id}/><button className="mini-button" type="submit">{j.status==="rendered"?"Rerender":"Retry"}</button></form>:"—"}</td>
        </tr>)}</tbody>
      </table></div>
    </Panel>:null}

    {(active==="all"||active==="approval"||active==="failed")?<Panel title={"Publish Queue · "+(publish.count??0)}>
      <div className="table-wrap"><table>
        <thead><tr><th>ID</th><th>المحتوى المصدر</th><th>Type</th><th>Status</th><th>Priority</th><th>Attempts</th><th>Updated</th><th>Action</th></tr></thead>
        <tbody>{publish.data.map(p=>{const source=p.source_job_id?byId.get(p.source_job_id):undefined;return <tr key={p.id}>
          <td className="mono">#{p.id}</td>
          <td className="content-description-cell">
            {source?<><strong className="content-editorial-title">{editorialTitle(source,competitionMap.get(source.competition_name||""))}</strong><small className="content-tech-line">Source <span className="mono">#{source.id}</span> · {technicalTitle(source)}</small></>:<strong>Source #{p.source_job_id||"—"}</strong>}
          </td>
          <td>{p.source_content_type||"—"}</td>
          <td><StatusPill value={p.status}/></td>
          <td>{p.priority??0}</td><td>{p.attempts??0}</td><td>{fmtDate(p.updated_at)}</td>
          <td>{actionsAvailable&&["awaiting_approval","pending","failed"].includes(p.status||"")?<div className="action-row compact-actions">
            <form action={publishDecisionAction}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="action" value="approve"/><button className="mini-button good-button">Approve</button></form>
            <form action={publishDecisionAction}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="action" value="ignore"/><button className="mini-button danger-button">Ignore</button></form>
          </div>:"—"}</td>
        </tr>})}</tbody>
      </table></div>
    </Panel>:null}

    <div className="pagination">
      <Link className={"filter-chip "+(page<=1?"disabled":"")} href={hrefOf(active,page>1?page-1:1)}>السابق</Link>
      <span>صفحة {page} من {pages}</span>
      <Link className={"filter-chip "+(page>=pages?"disabled":"")} href={hrefOf(active,page<pages?page+1:page)}>التالي</Link>
    </div>
  </>;
}
