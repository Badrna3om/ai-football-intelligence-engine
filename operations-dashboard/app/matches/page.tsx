import Link from "next/link";
import {PageIntro,Panel} from "@/components/ui";
import {StatusPill} from "@/components/status-pill";
import {fmtDate} from "@/lib/format";
import {getCompetitionOptions,getMatchesPage,getMonitorsByGames} from "@/lib/db";

export const dynamic="force-dynamic";
const filters=[["all","الكل"],["live","Live"],["pending","Pending"],["ended","Ended"]];

function hrefOf(base:Record<string,string|undefined>,patch:Record<string,string|undefined>){
  const p=new URLSearchParams();
  for(const [k,v] of Object.entries({...base,...patch})) if(v) p.set(k,v);
  const q=p.toString();
  return q?"/matches?"+q:"/matches";
}

export default async function MatchesPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const p=await searchParams;
  const page=Math.max(1,Number(p.page||1));
  const active=p.status||"all";
  const q=p.q||"";
  const competition=p.competition||"";
  const featured=p.featured==="1";

  const [matches,competitions]=await Promise.all([
    getMatchesPage({page,pageSize:25,status:active,q,competition,featured}),
    getCompetitionOptions()
  ]);
  const monitors=await getMonitorsByGames(matches.data.map(m=>m.game_id));
  const map=new Map(monitors.data.map(m=>[m.game_id,m]));
  const total=matches.count??0;
  const pages=Math.max(1,Math.ceil(total/matches.pageSize));
  const base={status:active==="all"?undefined:active,q:q||undefined,competition:competition||undefined,featured:featured?"1":undefined};

  return <>
    <PageIntro title="مركز المباريات" subtitle="فلترة مباشرة من Supabase مع 25 مباراة فقط في كل صفحة لتقليل الضغط."/>
    <form className="ops-filter-form" method="get">
      <input name="q" defaultValue={q} placeholder="ابحث باسم الفريق"/>
      <select name="competition" defaultValue={competition}>
        <option value="">كل البطولات</option>
        {competitions.map(c=><option key={c.competition_name||""} value={c.competition_name||""}>{c.competition_name_ar||c.competition_name}</option>)}
      </select>
      {active!=="all"?<input type="hidden" name="status" value={active}/>:null}
      {featured?<input type="hidden" name="featured" value="1"/>:null}
      <button className="secondary-button" type="submit">تطبيق</button>
      <Link className={"filter-chip "+(featured?"active":"")} href={hrefOf(base,{featured:featured?undefined:"1",page:undefined})}>Featured</Link>
      <Link className="filter-chip" href="/matches">مسح</Link>
    </form>

    <div className="filter-bar">
      {filters.map(([value,label])=><Link key={value} className={"filter-chip "+(active===value?"active":"")} href={hrefOf(base,{status:value==="all"?undefined:value,page:undefined})}>{label}</Link>)}
    </div>

    <Panel title={"المباريات · "+total}>
      <div className="table-wrap"><table>
        <thead><tr><th>المباراة</th><th>البطولة</th><th>الحالة</th><th>النتيجة</th><th>البيانات</th><th>Monitor</th><th>Next Action</th><th>Next Check</th><th>تفاصيل</th></tr></thead>
        <tbody>{matches.data.map(m=>{const monitor=map.get(m.game_id);return <tr key={m.id}>
          <td><strong>{m.home_team_name}</strong><span className="muted"> × </span><strong>{m.away_team_name}</strong><small className="block">Game {m.game_id}</small></td>
          <td>{m.competition_name||"—"}</td>
          <td><StatusPill value={m.status_text}/></td>
          <td className="score">{m.home_score??"—"} : {m.away_score??"—"}</td>
          <td><div className="progress"><i style={{width:(m.completeness_score??0)+"%"}}/></div><small>{m.completeness_score??0}%</small></td>
          <td><StatusPill value={monitor?.monitor_state}/>{monitor?.is_featured?<small className="block gold-text">Featured</small>:null}</td>
          <td className="mono">{monitor?.next_action||"—"}</td>
          <td>{fmtDate(monitor?.next_check_at)}</td>
          <td><Link className="text-link" href={"/matches/"+m.game_id}>فتح ←</Link></td>
        </tr>})}</tbody>
      </table></div>

      <div className="pagination">
        <Link className={"filter-chip "+(page<=1?"disabled":"")} href={hrefOf(base,{page:page>2?String(page-1):undefined})}>السابق</Link>
        <span>صفحة {page} من {pages}</span>
        <Link className={"filter-chip "+(page>=pages?"disabled":"")} href={hrefOf(base,{page:page<pages?String(page+1):String(page)})}>التالي</Link>
      </div>
    </Panel>
  </>;
}
