"use client";
import {useRouter} from "next/navigation";
import {useEffect,useState} from "react";

export function AutoRefresh({seconds=30}:{seconds?:number}){
  const router=useRouter();
  const [left,setLeft]=useState(seconds);
  useEffect(()=>{
    const tick=setInterval(()=>setLeft(v=>v<=1?seconds:v-1),1000);
    const refresh=setInterval(()=>router.refresh(),seconds*1000);
    return()=>{clearInterval(tick);clearInterval(refresh);};
  },[router,seconds]);
  return <div className="live-chip"><span className="dot online"/>Auto {left}s</div>;
}
