import type {ContentJobRow,MatchRow,MonitorRow,PublishRow,StoryRow} from "./types";
const url=process.env.SUPABASE_URL||"https://bfivqrqsojwmeeuptjxw.supabase.co";
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
type RestResult<T>={data:T;count:number|null};
export const dataMode=key?"LIVE":"SNAPSHOT";
function headers(){if(!key)throw new Error("SUPABASE_SECRET_KEY is missing. Add a server-only Supabase secret key in Vercel.");return{apikey:key,Authorization:`Bearer ${key}`,Accept:"application/json",Prefer:"count=exact"};}
async function rest<T>(table:string,params:Record<string,string>):Promise<RestResult<T>>{
 const qs=new URLSearchParams(params);
 const response=await fetch(`${url}/rest/v1/${table}?${qs.toString()}`,{headers:headers(),cache:"no-store"});
 if(!response.ok){const body=await response.text();throw new Error(`${table}: HTTP ${response.status} — ${body.slice(0,240)}`);}
 const range=response.headers.get("content-range");const count=range?.includes("/")?Number(range.split("/")[1]):null;
 return{data:await response.json() as T,count};
}
export async function countRows(table:string,filters:Record<string,string>={}){const r=await rest<unknown[]>(table,{select:"id",limit:"1",...filters});return r.count??0;}
export async function getMatches(limit=50){return rest<MatchRow[]>("beskot_matches",{select:"id,game_id,competition_name,home_team_name,away_team_name,home_score,away_score,status_text,status_group,start_time,is_live,is_ended,content_ready,completeness_score,updated_at",order:"start_time.desc",limit:String(limit)});}
export async function getMonitors(limit=60){return rest<MonitorRow[]>("beskot_match_monitor_queue",{select:"id,game_id,competition_name,home_team_name,away_team_name,next_action,monitor_state,next_check_at,lineup_status,halftime_status,final_status,final_refresh_status,consecutive_errors,last_error,monitor_enabled,is_featured,importance_score,updated_at",order:"updated_at.desc",limit:String(limit)});}
export async function getContentJobs(limit=80){return rest<ContentJobRow[]>("beskot_content_jobs",{select:"id,job_key,game_id,competition_name,scope_type,content_type,template_key,status,priority,attempts,max_attempts,error_message,content_payload,created_at,updated_at,rendered_at,published_at",order:"id.desc",limit:String(limit)});}
export async function getStories(limit=80){return rest<StoryRow[]>("beskot_story_pool",{select:"id,headline,angle,competition_name,game_id,story_scope,primary_entity_name,primary_entity_type,secondary_entity_name,final_score,status,approval_status,expires_at,proposed_at,created_at",order:"id.desc",limit:String(limit)});}
export async function getPublishJobs(limit=40){return rest<PublishRow[]>("beskot_publish_queue",{select:"id,source_job_id,source_content_type,status,priority,attempts,error_message,created_at,updated_at,published_at",order:"id.desc",limit:String(limit)});}
export async function getDashboardData(){
 const [matches,monitors,content,stories,publish,matchesCount,monitorCount,contentCount,publishCount,storyCount,liveCount,contentFailed,publishFailed,awaitingApproval]=await Promise.all([
  getMatches(12),getMonitors(12),getContentJobs(12),getStories(8),getPublishJobs(8),
  countRows("beskot_matches"),countRows("beskot_match_monitor_queue"),countRows("beskot_content_jobs"),countRows("beskot_publish_queue"),countRows("beskot_story_pool"),
  countRows("beskot_matches",{is_live:"eq.true"}),countRows("beskot_content_jobs",{status:"eq.failed"}),countRows("beskot_publish_queue",{status:"eq.failed"}),countRows("beskot_publish_queue",{status:"eq.awaiting_approval"})
 ]);
 return{matches,monitors,content,stories,publish,counts:{matches:matchesCount,monitors:monitorCount,content:contentCount,publish:publishCount,stories:storyCount,live:liveCount,contentFailed,publishFailed,awaitingApproval}};
}