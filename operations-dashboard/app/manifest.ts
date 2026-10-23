import type {MetadataRoute} from "next";

export default function manifest():MetadataRoute.Manifest{
  return {
    name:"TACTIC SPORT Operations Center",
    short_name:"TACTIC Ops",
    description:"مركز عمليات TACTIC SPORT لمراقبة المباريات والمحتوى والنشر.",
    start_url:"/",
    scope:"/",
    display:"standalone",
    orientation:"any",
    background_color:"#08090b",
    theme_color:"#08090b",
    lang:"ar",
    dir:"rtl",
    categories:["sports","productivity"],
    icons:[
      {src:"/icons/tactic.svg",sizes:"any",type:"image/svg+xml",purpose:"any"},
      {src:"/icons/tactic-maskable.svg",sizes:"any",type:"image/svg+xml",purpose:"maskable"}
    ]
  };
}
