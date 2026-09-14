import "server-only";
import type {ContentJobRow,MatchRow,MonitorRow,PublishRow,StoryRow} from "./types";

const url=process.env.SUPABASE_URL||"https://bfivqrqsojwmeeuptjxw.supabase.co";
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;

type RestResult<T>={data:T;count:number|null};
type MatchPageInput={page?:number;pageSize?:number;status?:string;q?:string;competition?:string;featured?:boolean};
type ContentPageInput={page?:number;pageSize?:number;status?:string};

export const dataMode=key?"LIVE":"SNAPSHOT";

function baseHeaders(prefer="count=exact"){
  if(!key) throw new Error("SUPABASE_SECRET_KEY is missing. Add a server-only Supabase secret key in Vercel.");
  return {
    apikey:key,
    Authorization:"Bearer "+key,
    Accept:"application/json",
    "Content-Type":"application/json",
    Prefer:prefer
  };
}

function safeSearch(v:string){
  return v.replace(/[,*()]/g," ").trim().slice(0,80);
}

async function rest<T>(table:string,params:Record<string,string>):Promise<RestResult<T>>{
  const qs=new URLSearchParams(params);
  const response=await fetch(url+"/rest/v1/"+table+"?"+qs.toString(),{
    headers:baseHeaders(),
    cache:"no-store"
  });
  if(!response.ok){
    const body=await response.text();
    throw new Error(table+": HTTP "+response.status+" — "+body.slice(0,240));
  }
  const range=response.headers.get("content-range");
  const count=range?.includes("/")?Number(range.split("/")[1]):null;
  return {data:await response.json() as T,count};
}

export async function rpc<T=unknown>(name:string,body:Record<string,unknown>):Promise<T>{
  const response=await fetch(url+"/rest/v1/rpc/"+name,{
    method:"POST",
    headers:baseHeaders("return=representation"),
    body:JSON.stringify(body),
    cache:"no-store"
  });
  if(!response.ok){
    const text=await response.text();
    throw new Error(name+": HTTP "+response.status+" — "+text.slice(0,320));
  }
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}

export async function patchRows<T=unknown>(
  table:string,
  filters:Record<string,string>,
  body:Record<string,unknown>,
  allowEmpty=false
):Promise<T[]>{
  const qs=new URLSearchParams(filters);
  const response=await fetch(url+"/rest/v1/"+table+"?"+qs.toString(),{
    method:"PATCH",
    headers:baseHeaders("return=representation"),
    body:JSON.stringify(body),
    cache:"no-store"
  });
  if(!response.ok){
    const text=await response.text();
    throw new Error(table+": HTTP "+response.status+" — "+text.slice(0,320));
  }
  const data=await response.json() as T[];
  if(!allowEmpty&&data.length===0) throw new Error(table+": no rows updated");
  return data;
}

export async function countRows(table:string,filters:Record<string,string>={}){
  const r=await rest<unknown[]>(table,{select:"id",limit:"1",...filters});
  return r.count??0;
}

export async function getMatches(limit=50){
  return rest<MatchRow[]>("beskot_matches",{
    select:"id,game_id,competition_name,home_team_name,away_team_name,home_score,away_score,status_text,status_group,start_time,is_live,is_ended,content_ready,completeness_score,updated_at",
    order:"start_time.desc",
    limit:String(limit)
  });
}

export async function getMatchesPage(input:MatchPageInput={}){
  const page=Math.max(1,Number(input.page||1));
  const pageSize=Math.min(50,Math.max(10,Number(input.pageSize||25)));
  const params:Record<string,string>={
    select:"id,game_id,competition_name,home_team_name,away_team_name,home_score,away_score,status_text,status_group,start_time,is_live,is_ended,content_ready,completeness_score,updated_at",
    order:"start_time.desc",
    limit:String(pageSize),
    offset:String((page-1)*pageSize)
  };

  if(input.status==="live") params.is_live="eq.true";
  if(input.status==="ended") params.is_ended="eq.true";
  if(input.status==="pending"){
    params.is_live="eq.false";
    params.is_ended="eq.false";
  }
  if(input.competition) params.competition_name="eq."+input.competition;

  const q=safeSearch(input.q||"");
  if(q) params.or="(home_team_name.ilike.*"+q+"*,away_team_name.ilike.*"+q+"*)";

  if(input.featured){
    const f=await rest<{game_id:number}[]>("beskot_match_monitor_queue",{
      select:"game_id",
      is_featured:"eq.true",
      limit:"500"
    });
    const ids=[...new Set(f.data.map(x=>x.game_id).filter(Boolean))];
    if(ids.length===0) return {data:[] as MatchRow[],count:0,page,pageSize};
    params.game_id="in.("+ids.join(",")+")";
  }

  const result=await rest<MatchRow[]>("beskot_matches",params);
  return {...result,page,pageSize};
}

export async function getCompetitionOptions(){
  const r=await rest<{competition_name:string|null;competition_name_ar:string|null;priority:number|null}[]>("beskot_competitions",{
    select:"competition_name,competition_name_ar,priority",
    enabled:"eq.true",
    order:"priority.desc",
    limit:"100"
  });
  const seen=new Set<string>();
  return r.data.filter(x=>{
    const n=x.competition_name||"";
    if(!n||seen.has(n)) return false;
    seen.add(n);
    return true;
  });
}

export async function getMonitors(limit=60){
  return rest<MonitorRow[]>("beskot_match_monitor_queue",{
    select:"id,game_id,competition_name,home_team_name,away_team_name,next_action,monitor_state,next_check_at,lineup_status,halftime_status,final_status,final_refresh_status,consecutive_errors,last_error,monitor_enabled,is_featured,importance_score,manual_featured,updated_at",
    order:"updated_at.desc",
    limit:String(limit)
  });
}

export async function getMonitorsByGames(gameIds:number[]){
  const ids=[...new Set(gameIds.filter(Boolean))];
  if(ids.length===0) return {data:[] as MonitorRow[],count:0};
  return rest<MonitorRow[]>("beskot_match_monitor_queue",{
    select:"id,game_id,competition_name,home_team_name,away_team_name,next_action,monitor_state,next_check_at,lineup_status,halftime_status,final_status,final_refresh_status,consecutive_errors,last_error,monitor_enabled,is_featured,importance_score,manual_featured,updated_at",
    game_id:"in.("+ids.join(",")+")",
    limit:String(ids.length)
  });
}

export async function getMonitorByGame(gameId:number){
  const r=await rest<MonitorRow[]>("beskot_match_monitor_queue",{
    select:"id,game_id,competition_name,home_team_name,away_team_name,next_action,monitor_state,next_check_at,lineup_status,halftime_status,final_status,final_refresh_status,consecutive_errors,last_error,monitor_enabled,is_featured,importance_score,manual_featured,updated_at",
    game_id:"eq."+gameId,
    limit:"1"
  });
  return r.data[0]||null;
}

export async function getMatchByGame(gameId:number){
  const r=await rest<MatchRow[]>("beskot_matches",{
    select:"id,game_id,competition_name,home_team_name,away_team_name,home_score,away_score,status_text,status_group,start_time,is_live,is_ended,content_ready,completeness_score,updated_at",
    game_id:"eq."+gameId,
    limit:"1"
  });
  return r.data[0]||null;
}

export async function getContentJobs(limit=80){
  return rest<ContentJobRow[]>("beskot_content_jobs",{
    select:"id,job_key,game_id,competition_name,scope_type,content_type,template_key,status,priority,attempts,max_attempts,error_message,content_payload,created_at,updated_at,rendered_at,published_at",
    order:"id.desc",
    limit:String(limit)
  });
}

export async function getContentJobsPage(input:ContentPageInput={}){
  const page=Math.max(1,Number(input.page||1));
  const pageSize=Math.min(50,Math.max(10,Number(input.pageSize||25)));
  const params:Record<string,string>={
    select:"id,job_key,game_id,competition_name,scope_type,content_type,template_key,status,priority,attempts,max_attempts,error_message,content_payload,created_at,updated_at,rendered_at,published_at",
    order:"id.desc",
    limit:String(pageSize),
    offset:String((page-1)*pageSize)
  };
  if(input.status&&input.status!=="all"&&input.status!=="approval") params.status="eq."+input.status;
  const result=await rest<ContentJobRow[]>("beskot_content_jobs",params);
  return {...result,page,pageSize};
}

export async function getContentJobsByGame(gameId:number){
  return rest<ContentJobRow[]>("beskot_content_jobs",{
    select:"id,job_key,game_id,competition_name,scope_type,content_type,template_key,status,priority,attempts,max_attempts,error_message,content_payload,created_at,updated_at,rendered_at,published_at",
    game_id:"eq."+gameId,
    order:"id.desc",
    limit:"50"
  });
}

export async function getStories(limit=80){
  return rest<StoryRow[]>("beskot_story_pool",{
    select:"id,headline,angle,competition_name,game_id,story_scope,primary_entity_name,primary_entity_type,secondary_entity_name,final_score,status,approval_status,expires_at,proposed_at,created_at",
    order:"id.desc",
    limit:String(limit)
  });
}

export async function getStoriesPage(page=1,pageSize=24,status?:string){
  const params:Record<string,string>={
    select:"id,headline,angle,competition_name,game_id,story_scope,primary_entity_name,primary_entity_type,secondary_entity_name,final_score,status,approval_status,expires_at,proposed_at,created_at",
    order:"id.desc",
    limit:String(pageSize),
    offset:String((Math.max(1,page)-1)*pageSize)
  };
  if(status&&status!=="all"){
    if(status==="pending") params.approval_status="eq.pending";
    else params.approval_status="eq."+status;
  }
  const result=await rest<StoryRow[]>("beskot_story_pool",params);
  return {...result,page,pageSize};
}

export async function getContentJobsByIds(ids:number[]){
  const unique=[...new Set(ids.filter(Boolean))];
  if(unique.length===0) return {data:[] as ContentJobRow[],count:0};
  return rest<ContentJobRow[]>("beskot_content_jobs",{
    select:"id,job_key,game_id,competition_name,scope_type,content_type,template_key,status,priority,attempts,max_attempts,error_message,content_payload,created_at,updated_at,rendered_at,published_at",
    id:"in.("+unique.join(",")+")",
    limit:String(unique.length)
  });
}

export async function getStoriesByGame(gameId:number){
  return rest<StoryRow[]>("beskot_story_pool",{
    select:"id,headline,angle,competition_name,game_id,story_scope,primary_entity_name,primary_entity_type,secondary_entity_name,final_score,status,approval_status,expires_at,proposed_at,created_at",
    game_id:"eq."+gameId,
    order:"id.desc",
    limit:"50"
  });
}

export async function getPublishJobs(limit=40){
  return rest<PublishRow[]>("beskot_publish_queue",{
    select:"id,source_job_id,source_content_type,status,priority,attempts,error_message,created_at,updated_at,published_at",
    order:"id.desc",
    limit:String(limit)
  });
}

export async function getPublishJobsPage(page=1,pageSize=25,status?:string){
  const params:Record<string,string>={
    select:"id,source_job_id,source_content_type,status,priority,attempts,error_message,created_at,updated_at,published_at",
    order:"id.desc",
    limit:String(pageSize),
    offset:String((Math.max(1,page)-1)*pageSize)
  };
  if(status==="approval") params.status="eq.awaiting_approval";
  if(status==="failed") params.status="eq.failed";
  const result=await rest<PublishRow[]>("beskot_publish_queue",params);
  return {...result,page,pageSize};
}

export async function getPublishJobsByGame(gameId:number){
  return rest<PublishRow[]>("beskot_publish_queue",{
    select:"id,source_job_id,source_content_type,status,priority,attempts,error_message,created_at,updated_at,published_at",
    game_id:"eq."+gameId,
    order:"id.desc",
    limit:"50"
  });
}

export async function getDashboardData(){
  const [matches,monitors,content,stories,publish,matchesCount,monitorCount,contentCount,publishCount,storyCount,liveCount,contentFailed,publishFailed,awaitingApproval]=await Promise.all([
    getMatches(12),getMonitors(12),getContentJobs(12),getStories(8),getPublishJobs(8),
    countRows("beskot_matches"),countRows("beskot_match_monitor_queue"),countRows("beskot_content_jobs"),countRows("beskot_publish_queue"),countRows("beskot_story_pool"),
    countRows("beskot_matches",{is_live:"eq.true"}),countRows("beskot_content_jobs",{status:"eq.failed"}),countRows("beskot_publish_queue",{status:"eq.failed"}),countRows("beskot_publish_queue",{status:"eq.awaiting_approval"})
  ]);
  return {matches,monitors,content,stories,publish,counts:{matches:matchesCount,monitors:monitorCount,content:contentCount,publish:publishCount,stories:storyCount,live:liveCount,contentFailed,publishFailed,awaitingApproval}};
}
