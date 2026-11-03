import Link from "next/link";
import {Suspense,type ReactNode} from "react";
import {AutoRefresh} from "./auto-refresh";
import {authEnabled,isOperator} from "@/lib/auth";
import {logoutAction} from "@/app/actions";

const nav=[["الرئيسية","/","◈"],["المباريات","/matches","◉"],["المحتوى","/content","▣"],["Story Miner","/stories","✦"],["صحة النظام","/health","◇"]];

export async function Shell({children}:{children:ReactNode}){
  const operator=authEnabled()?await isOperator():false;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">T</div><div><strong>TACTIC SPORT</strong><small>Operations Center</small></div></div>
      <nav>{nav.map(([label,href,icon])=><Link key={href} href={href}><span>{icon}</span>{label}</Link>)}</nav>
      <div className="sidebar-foot">
        <span className="dot online"/>
        <div><strong>{operator?"Operator":"Production"}</strong><small>Asia/Dubai</small></div>
        {operator?<form action={logoutAction}><button className="logout-button" type="submit">خروج</button></form>:null}
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><span className="eyebrow">TACTIC / BESKOT</span><h1>مركز العمليات</h1></div>
        <div className="top-actions">
          <Suspense fallback={<div className="live-chip"><span className="dot online"/>Auto</div>}><AutoRefresh/></Suspense>
          <div className="live-chip"><span className={"dot "+(operator?"online":"")}/>{operator?"Actions ON":"Read-only"}</div>
        </div>
      </header>
      {children}
    </main>

    <nav className="mobile-nav">
      {nav.slice(0,4).map(([label,href,icon])=><Link key={href} href={href}><span>{icon}</span><small>{label}</small></Link>)}
    </nav>
  </div>;
}
