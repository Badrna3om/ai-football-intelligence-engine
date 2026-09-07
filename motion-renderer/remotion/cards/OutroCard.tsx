import React from "react";
import {useCurrentFrame} from "remotion";
import {Brand,CardRoot,Competition,MatchProps,rise} from "./shared";

export const OutroCard:React.FC<{p:MatchProps;duration:number}> = ({p,duration}) => {
  const frame=useCurrentFrame();
  return <CardRoot duration={duration} background="outro-v1.webp" darken={.03}>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      <div style={{transform:`translateY(${rise(frame,0,24,42)}px)`}}><Brand p={p} large animated/></div>
      <div style={{height:50}}/>
      <Competition p={p} large animated name={false}/>
      <div style={{fontSize:66,fontWeight:950,lineHeight:1.38,marginTop:46,transform:`translateY(${rise(frame,28,56,40)}px)`}}>خلف كل مباراة…<br/>قصة تحكيها الأرقام</div>
      <div style={{width:250,height:5,borderRadius:8,marginTop:30,background:"linear-gradient(90deg,#E7C264,#22D4FF)"}}/>
    </div>
  </CardRoot>;
};
