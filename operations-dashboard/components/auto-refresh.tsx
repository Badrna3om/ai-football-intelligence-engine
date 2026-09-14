"use client";

import {usePathname,useRouter,useSearchParams} from "next/navigation";
import {useEffect,useMemo,useState} from "react";

function policy(pathname:string,status:string|null){
  if(pathname==="/matches"){
    if(status==="live") return {seconds:30,label:"Live"};
    if(status==="pending") return {seconds:60,label:"Pending"};
    if(status==="ended") return {seconds:180,label:"Ended"};
    return {seconds:60,label:"Matches"};
  }
  if(pathname==="/health") return {seconds:60,label:"Health"};
  if(pathname==="/content") return {seconds:90,label:"Content"};
  if(pathname==="/stories") return {seconds:120,label:"Stories"};
  return {seconds:60,label:"Overview"};
}

export function AutoRefresh(){
  const router=useRouter();
  const pathname=usePathname();
  const searchParams=useSearchParams();
  const status=searchParams.get("status");
  const p=useMemo(()=>policy(pathname,status),[pathname,status]);
  const [left,setLeft]=useState(p.seconds);
  const [paused,setPaused]=useState(false);

  useEffect(()=>{
    setLeft(p.seconds);

    const onVisibility=()=>{
      const hidden=document.visibilityState!=="visible";
      setPaused(hidden);
      if(!hidden) setLeft(p.seconds);
    };

    onVisibility();
    document.addEventListener("visibilitychange",onVisibility);

    const tick=setInterval(()=>{
      if(document.visibilityState!=="visible") return;
      setLeft(v=>v<=1?p.seconds:v-1);
    },1000);

    const refresh=setInterval(()=>{
      if(document.visibilityState==="visible") router.refresh();
    },p.seconds*1000);

    return()=>{
      document.removeEventListener("visibilitychange",onVisibility);
      clearInterval(tick);
      clearInterval(refresh);
    };
  },[router,p.seconds]);

  return <div className="live-chip" title={"Adaptive refresh: "+p.seconds+"s"}>
    <span className={"dot "+(paused?"":"online")}/>
    {paused?"Paused":p.label+" "+left+"s"}
  </div>;
}
