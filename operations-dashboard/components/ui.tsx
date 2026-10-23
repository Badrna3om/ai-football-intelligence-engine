import type {ReactNode} from "react";
export function PageIntro({title,subtitle}:{title:string;subtitle:string}){return <div className="page-intro"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="stamp">LIVE DATA</span></div>;}
export function Metric({label,value,detail,tone="default"}:{label:string;value:ReactNode;detail?:string;tone?:"default"|"good"|"warn"|"bad"}){return <div className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong>{detail?<small>{detail}</small>:null}</div>;}
export function Panel({title,action,children}:{title:string;action?:ReactNode;children:ReactNode}){return <section className="panel"><div className="panel-head"><h3>{title}</h3>{action}</div>{children}</section>;}
