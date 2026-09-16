"use server";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {OPS_COOKIE,tokenForPassword} from "@/lib/auth-core";
import {requireOperator} from "@/lib/auth";
import {patchRows,rpc} from "@/lib/db";

function idOf(formData:FormData,key="id"){
  const value=Number(formData.get(key));
  if(!Number.isSafeInteger(value)||value<=0) throw new Error("Invalid id");
  return value;
}

export async function loginAction(formData:FormData){
  const configured=process.env.TACTIC_DASHBOARD_PASSWORD;
  if(!configured) redirect("/");
  const password=String(formData.get("password")||"");
  if(password!==configured) redirect("/login?error=1");
  const store=await cookies();
  store.set(OPS_COOKIE,await tokenForPassword(configured),{
    httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*7
  });
  redirect("/");
}

export async function logoutAction(){
  const store=await cookies();
  store.delete(OPS_COOKIE);
  redirect("/login");
}

export async function storyDecisionAction(formData:FormData){
  await requireOperator();
  const id=idOf(formData);
  const action=String(formData.get("action")||"");
  if(!["approve","reject","defer"].includes(action)) throw new Error("Invalid story action");
  await rpc("beskot_story_decide",{p_story_id:id,p_action:action,p_defer_hours:6});
  revalidatePath("/stories");
}

export async function publishDecisionAction(formData:FormData){
  await requireOperator();
  const id=idOf(formData);
  const action=String(formData.get("action")||"");
  if(action==="approve"){
    await rpc("beskot_publish_approve",{p_publish_id:id,p_user_id:0});
  }else if(action==="ignore"){
    await rpc("beskot_publish_ignore",{p_publish_id:id,p_user_id:0});
  }else{
    throw new Error("Invalid publish action");
  }
  revalidatePath("/content");
}

export async function contentRequeueAction(formData:FormData){
  await requireOperator();
  const id=idOf(formData);
  await patchRows("beskot_content_jobs",{id:"eq."+id},{
    status:"ready",
    ready_at:new Date().toISOString(),
    available_at:new Date().toISOString(),
    locked_at:null,
    error_message:null,
    rendered_at:null
  });
  await patchRows("beskot_wf12_render_leases",{job_id:"eq."+id},{
    state:"waiting",
    attempts:0,
    lease_until:null,
    retry_at:new Date().toISOString(),
    last_error:null,
    updated_at:new Date().toISOString()
  },true);
  revalidatePath("/content");
}

export async function featuredToggleAction(formData:FormData){
  await requireOperator();
  const gameId=idOf(formData,"game_id");
  const next=String(formData.get("next"))==="true";
  await patchRows("beskot_match_monitor_queue",{game_id:"eq."+gameId},{manual_featured:next});
  revalidatePath("/matches");
  revalidatePath("/matches/"+gameId);
}

export async function forceMonitorCheckAction(formData:FormData){
  await requireOperator();
  const gameId=idOf(formData,"game_id");
  await patchRows("beskot_match_monitor_queue",{game_id:"eq."+gameId},{
    next_check_at:new Date().toISOString()
  });
  revalidatePath("/matches");
  revalidatePath("/matches/"+gameId);
}
