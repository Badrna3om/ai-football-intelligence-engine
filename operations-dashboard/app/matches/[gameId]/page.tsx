import Link from "next/link";
import {notFound} from "next/navigation";
import {PageIntro,Panel} from "@/components/ui";
import {StatusPill} from "@/components/status-pill";
import {fmtDate,truncate} from "@/lib/format";
import {getContentJobsByGame,getMatchByGame,getMonitorByGame,getPublishJobsByGame,getStoriesByGame} from "@/lib/db";
import {authEnabled,isOperator} from "@/lib/auth";
import {contentRequeueAction,featuredToggleAction,forceMonitorCheckAction,publishDecisionAction,storyDecisionAction} from "@/app/actions";

export const dynamic="force-dynamic";

export default async function MatchDetail({params}:{params:Promise<{gameId:string}>}){
  const gameId=Number((await params).gameId);
  if(!Number.isSafeInteger(gameId)) notFound();

  const [match,monitor,content,stories,publish,operator]=await Promise.all([
    getMatchByGame(gameId),
    getMonitorByGame(gameId),
    getContentJobsByGame(gameId),
    getStoriesByGame(gameId),
    getPublishJobsByGame(gameId),
    isOperator()
  ]);
  if(!match) notFound();

  const titles=new Map(content.data.map(j=>[j.id,j.content_payload?.headline||j.content_payload?.image_text||j.job_key||"بدون عنوان"]));
  const actionsAvailable=authEnabled()&&operator;

  return <>
    <div className="detail-back"><Link href="/matches" className="text-link">← العودة للمباريات</Link></div>
    <PageIntro title={(match.home_team_name||"—")+" × "+(match.away_team_name||"—")} subtitle={(match.competition_name||"—")+" · Game "+gameId}/>
    <div className="metric-grid compact">
      <div className="metric"><span>الحالة</span><strong className="metric-small"><StatusPill value={match.status_text}/></strong><small>{fmtDate(match.start_time)}</small></div>
      <div className="metric"><span>النتيجة</span><strong>{match.home_score??"—"} : {match.away_score??"—"}</strong><small>Score</small></div>
      <div className="metric"><span>اكتمال البيانات</span><strong>{match.completeness_score??0}%</strong><small>Data completeness</small></div>
      <div className="metric"><span>Monitor</span><strong className="metric-small"><StatusPill value={monitor?.monitor_state}/></strong><small>{monitor?.next_action||"—"}</small></div>
      <div className="metric"><span>Featured</span><strong>{monitor?.is_featured?"نعم":"لا"}</strong><small>{monitor?.manual_featured?"Manual":"Policy"}</small></div>
    </div>

    <Panel title="Match Control">
      <div className="control-strip">
        <div><b>Next Check</b><span>{fmtDate(monitor?.next_check_at)}</span></div>
        <div><b>Lineup</b><span>{monitor?.lineup_status||"—"}</span></div>
        <div><b>Halftime</b><span>{monitor?.halftime_status||"—"}</span></div>
        <div><b>Final</b><span>{monitor?.final_status||"—"}</span></div>
        <div><b>Refresh</b><span>{monitor?.final_refresh_status||"—"}</span></div>
      </div>
      {actionsAvailable&&monitor?<div className="action-row">
        <form action={forceMonitorCheckAction}><input type="hidden" name="game_id" value={gameId}/><button className="secondary-button" type="submit">Check الآن</button></form>
        <form action={featuredToggleAction}><input type="hidden" name="game_id" value={gameId}/><input type="hidden" name="next" value={monitor.manual_featured?"false":"true"}/><button className="secondary-button" type="submit">{monitor.manual_featured?"إلغاء Featured اليدوي":"تثبيت Featured"}</button></form>
      </div>:<div className="locked-note">التحكم Read-only حتى يتم تفعيل كلمة مرور المشغل.</div>}
    </Panel>

    <Panel title={"Content Jobs · "+content.data.length}>
      <div className="table-wrap"><table>
        <thead><tr><th>ID / العنوان</th><th>Type</th><th>Status</th><th>Attempts</th><th>Error</th><th>Updated</th><th>Action</th></tr></thead>
        <tbody>{content.data.map(j=><tr key={j.id}>
          <td><span className="mono">#{j.id}</span><strong className="job-title block">{titles.get(j.id)}</strong></td>
          <td>{j.content_type||"—"}<small className="block">{j.template_key||"—"}</small></td>
          <td><StatusPill value={j.status}/></td>
          <td>{j.attempts??0}/{j.max_attempts??0}</td>
          <td className="error-cell">{truncate(j.error_message,70)}</td>
          <td>{fmtDate(j.updated_at)}</td>
          <td>{actionsAvailable&&["failed","rendered"].includes(j.status||"")?<form action={contentRequeueAction}><input type="hidden" name="id" value={j.id}/><button className="mini-button" type="submit">{j.status==="rendered"?"Rerender":"Retry"}</button></form>:"—"}</td>
        </tr>)}</tbody>
      </table></div>
    </Panel>

    <div className="two-col">
      <Panel title={"Stories · "+stories.data.length}>
        <div className="stack">{stories.data.length?stories.data.map(s=><div className="ops-item" key={s.id}>
          <div><strong>{s.headline||"بدون عنوان"}</strong><small>#{s.id} · Score {s.final_score??"—"} · {s.approval_status||s.status}</small></div>
          {actionsAvailable&&["pending","proposed","deferred"].includes((s.approval_status||s.status||"").toLowerCase())?<div className="action-row compact-actions">
            <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="approve"/><button className="mini-button good-button">Approve</button></form>
            <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="defer"/><button className="mini-button">Defer</button></form>
            <form action={storyDecisionAction}><input type="hidden" name="id" value={s.id}/><input type="hidden" name="action" value="reject"/><button className="mini-button danger-button">Reject</button></form>
          </div>:null}
        </div>):<div className="empty">لا توجد قصص مرتبطة بهذه المباراة.</div>}</div>
      </Panel>

      <Panel title={"Publish Queue · "+publish.data.length}>
        <div className="stack">{publish.data.length?publish.data.map(p=><div className="ops-item" key={p.id}>
          <div><strong>{titles.get(p.source_job_id||0)||("Publish #"+p.id)}</strong><small>#{p.id} · Source #{p.source_job_id||"—"}</small></div>
          <div className="row-meta"><StatusPill value={p.status}/>{actionsAvailable&&["awaiting_approval","pending","failed"].includes(p.status||"")?<div className="action-row compact-actions">
            <form action={publishDecisionAction}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="action" value="approve"/><button className="mini-button good-button">Approve</button></form>
            <form action={publishDecisionAction}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="action" value="ignore"/><button className="mini-button danger-button">Ignore</button></form>
          </div>:null}</div>
        </div>):<div className="empty">لا توجد مهام نشر مرتبطة بهذه المباراة.</div>}</div>
      </Panel>
    </div>
  </>;
}
