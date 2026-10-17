import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  Video,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const GOLD = '#E7B84B';
const GOLD2 = '#FFE29A';
const BG = '#07090C';
const PANEL = '#11161C';
const WHITE = '#F6F5EF';
const MUTED = '#87919D';

const fontCss = `
@font-face{font-family:Thmanyah;src:url('${staticFile('thmanyah-bold.otf')}') format('opentype');font-weight:700;font-style:normal;}
*{box-sizing:border-box}
`;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = (v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));

const BrandBg: React.FC<{energy?:number}> = ({energy=0.4}) => {
  const f = useCurrentFrame();
  const drift = (f*0.55)%220;
  return <AbsoluteFill style={{background:BG, overflow:'hidden'}}>
    <AbsoluteFill style={{
      background:'radial-gradient(circle at 68% 24%, rgba(231,184,75,.16), transparent 32%), radial-gradient(circle at 20% 82%, rgba(255,255,255,.05), transparent 36%)'
    }}/>
    <AbsoluteFill style={{opacity:.16+energy*.08, transform:`translateY(${drift-220}px)`, backgroundImage:'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize:'110px 110px'}}/>
    <div style={{position:'absolute', left:-260, top:250, width:900, height:170, background:GOLD, opacity:.08, transform:'rotate(-18deg)'}}/>
    <div style={{position:'absolute', right:-320, bottom:210, width:1100, height:220, background:'#fff', opacity:.025, transform:'rotate(-18deg)'}}/>
  </AbsoluteFill>;
};

const Logo:React.FC<{src:string,size:number}> = ({src,size}) => <Img src={staticFile(src)} style={{width:size,height:size,objectFit:'contain'}}/>;

const Intro:React.FC = () => {
  const f=useCurrentFrame();
  const p=spring({frame:f,fps:30,config:{damping:13,mass:.7,stiffness:120}});
  const sweep=interpolate(f,[12,55],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
  return <AbsoluteFill>
    <BrandBg energy={1}/>
    <div style={{position:'absolute',left:60,right:60,top:80,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <Img src={staticFile('tactic_logo.png')} style={{width:250,objectFit:'contain'}}/>
      <div style={{fontFamily:'Thmanyah',color:GOLD,fontSize:30,letterSpacing:1}}>دوري أدنوك للمحترفين • الجولة 6</div>
    </div>
    <div style={{position:'absolute',left:0,right:0,top:340,textAlign:'center',fontFamily:'Thmanyah',color:WHITE}}>
      <div style={{fontSize:42,color:MUTED,marginBottom:24,opacity:clamp((f-4)/18)}}>النهاية • استاد بني ياس</div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:74,transform:`scale(${.72+.28*p})`,opacity:p}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20}}><Logo src="baniyas_logo.png" size={240}/><div style={{fontSize:48}}>بني ياس</div></div>
        <div style={{fontSize:150,lineHeight:1,fontVariantNumeric:'tabular-nums'}}>0 <span style={{color:GOLD,fontSize:80}}>—</span> 2</div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20}}><Logo src="wasl_logo.png" size={240}/><div style={{fontSize:48}}>الوصل</div></div>
      </div>
      <div style={{marginTop:110,fontSize:92,lineHeight:1.1,transform:`translateY(${36*(1-sweep)}px)`,opacity:sweep}}>الوصل يحسمها بثنائية</div>
      <div style={{margin:'34px auto 0',width:interpolate(sweep,[0,1],[0,670]),height:8,background:`linear-gradient(90deg, transparent, ${GOLD}, transparent)`,boxShadow:`0 0 32px ${GOLD}`}}/>
    </div>
  </AbsoluteFill>;
};

const GoalScene:React.FC<{video:string;minute:string;scorer:string;assist?:string;index:number}> = ({video,minute,scorer,assist,index}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const inP=spring({frame:f-7,fps,config:{damping:16,stiffness:130}});
  const tag=interpolate(f,[18,40],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
  const pulse=1+Math.sin(f*.18)*.01;
  return <AbsoluteFill style={{background:'#000',overflow:'hidden'}}>
    <Video src={staticFile(video)} startFrom={0} style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',filter:'brightness(.6) blur(28px)',transform:'scale(1.12)'}} volume={1}/>
    <Video src={staticFile(video)} startFrom={0} style={{position:'absolute',left:0,right:0,top:215,width:'100%',height:1230,objectFit:'cover',transform:`scale(${pulse})`,boxShadow:'0 40px 90px rgba(0,0,0,.75)'}} volume={1}/>
    <div style={{position:'absolute',left:0,right:0,top:0,height:390,background:'linear-gradient(#050607 35%, transparent)'}}/>
    <div style={{position:'absolute',left:0,right:0,bottom:0,height:620,background:'linear-gradient(transparent, rgba(5,6,7,.92) 36%, #050607 76%)'}}/>
    <div style={{position:'absolute',left:56,top:70,fontFamily:'Thmanyah',display:'flex',alignItems:'center',gap:24,color:WHITE}}>
      <div style={{fontSize:24,color:GOLD,letterSpacing:2}}>GOAL {String(index).padStart(2,'0')}</div>
      <div style={{width:110,height:3,background:GOLD}}/>
      <div style={{fontSize:28,color:MUTED}}>بني ياس 0 — {index} الوصل</div>
    </div>
    <div style={{position:'absolute',right:62,bottom:166,width:890,fontFamily:'Thmanyah',textAlign:'right',color:WHITE,transform:`translateX(${(1-inP)*160}px)`,opacity:inP}}>
      <div style={{display:'inline-flex',alignItems:'center',gap:18,background:GOLD,color:'#15100A',padding:'12px 22px',fontSize:34,transform:`translateX(${(1-tag)*80}px)`}}><span>{minute}</span><span>دقيقة</span></div>
      <div style={{fontSize:86,lineHeight:1.1,marginTop:20,textShadow:'0 8px 30px rgba(0,0,0,.8)'}}>{scorer}</div>
      {assist ? <div style={{fontSize:30,color:'#C5CBD2',marginTop:12}}>صناعة: {assist}</div>:null}
      <div style={{marginTop:30,height:5,width:interpolate(tag,[0,1],[80,620]),marginLeft:'auto',background:`linear-gradient(90deg, transparent, ${GOLD})`}}/>
    </div>
    <Img src={staticFile('wasl_logo.png')} style={{position:'absolute',left:55,bottom:120,width:120,height:120,objectFit:'contain',opacity:.95}}/>
  </AbsoluteFill>;
};

const StatHeader:React.FC<{label:string;sub?:string}> = ({label,sub}) => <div style={{position:'absolute',top:82,left:64,right:64,fontFamily:'Thmanyah',color:WHITE,display:'flex',justifyContent:'space-between',alignItems:'end'}}>
  <div><div style={{fontSize:30,color:GOLD}}>MATCH DATA</div><div style={{fontSize:76,lineHeight:1.1,marginTop:10}}>{label}</div>{sub?<div style={{fontSize:27,color:MUTED,marginTop:10}}>{sub}</div>:null}</div>
  <Img src={staticFile('tactic_logo.png')} style={{width:210,objectFit:'contain'}}/>
</div>;

const Possession:React.FC = () => {
  const f=useCurrentFrame(); const p=clamp(interpolate(f,[10,58],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease}));
  const a=Math.round(46*p),b=Math.round(54*p);
  return <AbsoluteFill><BrandBg/><StatHeader label="الاستحواذ" sub="سيطرة متقاربة.. أفضلية طفيفة للوصل"/>
    <div style={{position:'absolute',top:560,left:70,right:70,fontFamily:'Thmanyah',color:WHITE}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:55}}>
        <div style={{display:'flex',alignItems:'center',gap:22}}><Logo src="baniyas_logo.png" size={110}/><span style={{fontSize:45}}>بني ياس</span></div>
        <div style={{display:'flex',alignItems:'center',gap:22}}><span style={{fontSize:45}}>الوصل</span><Logo src="wasl_logo.png" size={110}/></div>
      </div>
      <div style={{display:'flex',fontSize:118,lineHeight:1,justifyContent:'space-between',fontVariantNumeric:'tabular-nums'}}><span>{a}%</span><span style={{color:GOLD}}>{b}%</span></div>
      <div style={{height:56,display:'flex',marginTop:44,background:'#1E242B',overflow:'hidden',borderRadius:4}}>
        <div style={{width:`${46*p}%`,background:'#D9DEE4'}}/><div style={{width:`${54*p}%`,background:GOLD,marginLeft:'auto'}}/>
      </div>
      <div style={{marginTop:115,fontSize:32,color:MUTED,textAlign:'center'}}>الكرة موزعة.. الحسم جاء من جودة الفرص</div>
    </div>
  </AbsoluteFill>;
};

const XgRace:React.FC = () => {
 const f=useCurrentFrame(); const p=clamp(interpolate(f,[5,64],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease}));
 const a=(1.57*p).toFixed(2),b=(2.57*p).toFixed(2);
 return <AbsoluteFill><BrandBg energy={.8}/><StatHeader label="جودة الفرص • xG" sub="النتيجة لم تكن صدفة"/>
   <div style={{position:'absolute',top:500,left:74,right:74,fontFamily:'Thmanyah',color:WHITE}}>
    {[{name:'بني ياس',v:1.57,text:a,logo:'baniyas_logo.png',gold:false},{name:'الوصل',v:2.57,text:b,logo:'wasl_logo.png',gold:true}].map((x,i)=><div key={x.name} style={{marginBottom:105}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}><div style={{display:'flex',alignItems:'center',gap:20}}><Logo src={x.logo} size={90}/><span style={{fontSize:42}}>{x.name}</span></div><span style={{fontSize:92,color:x.gold?GOLD:WHITE,fontVariantNumeric:'tabular-nums'}}>{x.text}</span></div>
      <div style={{height:42,background:'#1B2026',overflow:'hidden'}}><div style={{height:'100%',width:`${(x.v/3)*100*p}%`,background:x.gold?`linear-gradient(90deg,#8A641D,${GOLD2})`:'linear-gradient(90deg,#68717B,#EFF3F5)',boxShadow:x.gold?`0 0 30px ${GOLD}`:'none'}}/></div>
    </div>)}
    <div style={{marginTop:60,borderTop:'1px solid rgba(255,255,255,.12)',paddingTop:40,fontSize:31,color:MUTED}}>xG الوصل أعلى بـ 1.00 — فعالية هجومية أوضح في اللحظات الحاسمة</div>
   </div>
 </AbsoluteFill>;
};

const ShotMap:React.FC = () => {
 const f=useCurrentFrame(); const p=clamp(interpolate(f,[0,65],[0,1],{extrapolateRight:'clamp',easing:ease}));
 const ban=19,was=13;
 const dots=(count:number,side:'l'|'r',gold=false)=>Array.from({length:count}).map((_,i)=>{
   const appear=clamp((p*count-i)/3); const col=i%5,row=Math.floor(i/5); const x=(side==='l'?100:610)+col*72; const y=670+row*88;
   return <div key={`${side}${i}`} style={{position:'absolute',left:x,top:y,width:30,height:30,borderRadius:30,background:gold?GOLD:'#E9ECEF',opacity:appear,transform:`scale(${.4+.6*appear})`,boxShadow:gold?'0 0 18px rgba(231,184,75,.55)':'none'}}/>;
 });
 return <AbsoluteFill><BrandBg/><StatHeader label="التسديدات" sub="بني ياس أكثر تسديدًا.. الوصل أكثر دقة"/>
   <div style={{position:'absolute',top:485,left:75,right:75,height:980,border:'2px solid rgba(255,255,255,.14)',borderRadius:16}}>
    <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'rgba(255,255,255,.12)'}}/>
    <div style={{position:'absolute',left:0,right:0,top:52,display:'flex',justifyContent:'space-around',fontFamily:'Thmanyah',color:WHITE}}><div style={{textAlign:'center'}}><div style={{fontSize:92}}>19</div><div style={{fontSize:30,color:MUTED}}>بني ياس</div></div><div style={{textAlign:'center'}}><div style={{fontSize:92,color:GOLD}}>13</div><div style={{fontSize:30,color:MUTED}}>الوصل</div></div></div>
    {dots(ban,'l',false)}{dots(was,'r',true)}
    <div style={{position:'absolute',bottom:44,left:45,right:45,display:'flex',justifyContent:'space-around',fontFamily:'Thmanyah',fontSize:29,color:MUTED}}><span>4 على المرمى</span><span style={{color:GOLD2}}>6 على المرمى</span></div>
   </div>
 </AbsoluteFill>;
};

const BigChance:React.FC = () => {
 const f=useCurrentFrame(); const p=clamp(interpolate(f,[5,55],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease}));
 const goalGlow=.45+.25*Math.sin(f*.16);
 return <AbsoluteFill><BrandBg energy={1}/><StatHeader label="الفرص الكبيرة" sub="من وصل لمنطقة الخطر أكثر؟"/>
   <div style={{position:'absolute',top:510,left:72,right:72,height:850,fontFamily:'Thmanyah',color:WHITE}}>
    <div style={{position:'absolute',left:100,right:100,top:60,height:560,border:'4px solid rgba(255,255,255,.18)',borderTop:'none'}}>
      <div style={{position:'absolute',left:'50%',bottom:0,width:420,height:190,transform:'translateX(-50%)',border:'4px solid rgba(255,255,255,.15)',borderBottom:'none'}}/>
      {[0,1,2].map((i)=>i<Math.ceil(2*p)?<div key={i} style={{position:'absolute',left:540+i*70,top:320-i*100,width:76,height:76,borderRadius:76,background:GOLD,boxShadow:`0 0 ${40+30*goalGlow}px rgba(231,184,75,${goalGlow})`}}/>:null)}
      {p>.55?<div style={{position:'absolute',left:240,top:380,width:70,height:70,borderRadius:70,background:'#E8ECEF',opacity:clamp((p-.55)*3)}}/>:null}
    </div>
    <div style={{position:'absolute',bottom:40,left:30,right:30,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:82}}>1 <span style={{fontSize:34,color:MUTED}}>بني ياس</span></div><div style={{fontSize:82,color:GOLD}}>2 <span style={{fontSize:34,color:GOLD2}}>الوصل</span></div></div>
   </div>
 </AbsoluteFill>;
};

const StatsSequence:React.FC = () => <AbsoluteFill>
 <Sequence from={0} durationInFrames={75}><Possession/></Sequence>
 <Sequence from={75} durationInFrames={75}><XgRace/></Sequence>
 <Sequence from={150} durationInFrames={75}><ShotMap/></Sequence>
 <Sequence from={225} durationInFrames={105}><BigChance/></Sequence>
</AbsoluteFill>;

const Motm:React.FC = () => {
 const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:14,stiffness:105}}); const statP=clamp(interpolate(f,[30,95],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease}));
 return <AbsoluteFill><BrandBg energy={1}/>
   <div style={{position:'absolute',top:78,left:60,fontFamily:'Thmanyah',color:GOLD,fontSize:30}}>PLAYER OF THE MATCH</div>
   <Img src={staticFile('cameron_puertas_cutout.png')} style={{position:'absolute',left:-70,bottom:0,width:730,height:1500,objectFit:'contain',objectPosition:'bottom',filter:'drop-shadow(45px 35px 50px rgba(0,0,0,.7))',transform:`translateX(${(1-p)*-180}px) scale(${.92+.08*p})`}}/>
   <div style={{position:'absolute',right:60,top:350,width:560,fontFamily:'Thmanyah',color:WHITE,textAlign:'right'}}>
    <div style={{fontSize:42,color:MUTED}}>الوصل</div><div style={{fontSize:86,lineHeight:1.12,marginTop:12}}>كاميرون<br/>بويرتاس</div>
    <div style={{display:'flex',justifyContent:'flex-end',alignItems:'baseline',gap:18,marginTop:30}}><span style={{fontSize:36,color:GOLD}}>التقييم</span><span style={{fontSize:126,color:GOLD,lineHeight:1}}>8.3</span></div>
    <div style={{height:4,background:GOLD,margin:'30px 0 34px',transformOrigin:'right',transform:`scaleX(${statP})`}}/>
    {[['الأهداف','1'],['التمريرات المفتاحية','2'],['دقة التمرير','89%'],['اللمسات','76']].map(([k,v],i)=><div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,.12)',padding:'18px 0',opacity:clamp((statP*4-i)/1.2),transform:`translateY(${(1-clamp((statP*4-i)/1.2))*20}px)`}}><span style={{fontSize:42,color:GOLD2}}>{v}</span><span style={{fontSize:29,color:'#C7CDD4'}}>{k}</span></div>)}
   </div>
 </AbsoluteFill>;
};

const Outro:React.FC = () => {
 const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:13,stiffness:120}}); const glow=.25+.1*Math.sin(f*.15);
 return <AbsoluteFill><BrandBg energy={1}/>
   <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Thmanyah',color:WHITE,textAlign:'center'}}>
    <div style={{fontSize:34,color:GOLD,letterSpacing:2}}>FULL TIME</div>
    <div style={{display:'flex',alignItems:'center',gap:55,marginTop:42,transform:`scale(${.8+.2*p})`}}><Logo src="baniyas_logo.png" size={170}/><div style={{fontSize:125}}>0 <span style={{color:GOLD}}>—</span> 2</div><Logo src="wasl_logo.png" size={170}/></div>
    <div style={{fontSize:56,marginTop:48}}>الوصل يعود بالنقاط الثلاث</div>
    <div style={{marginTop:110,width:300,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,boxShadow:`0 0 28px rgba(231,184,75,${glow})`}}/>
    <Img src={staticFile('tactic_logo.png')} style={{width:330,marginTop:65,objectFit:'contain'}}/>
   </div>
 </AbsoluteFill>;
};

export const BlindMatchFilm:React.FC = () => {
  return <AbsoluteFill style={{background:BG}}>
    <style>{fontCss}</style>
    <Audio src={staticFile('music.wav')} volume={0.13}/>
    <Sequence from={0} durationInFrames={120}><Intro/></Sequence>
    <Sequence from={120} durationInFrames={360}><GoalScene video="goal_01.mp4" minute="11'" scorer="مهدي طارمي" assist="نيكولاس خيمينيز" index={1}/></Sequence>
    <Sequence from={480} durationInFrames={360}><GoalScene video="goal_02.mp4" minute="45+1'" scorer="كاميرون بويرتاس" index={2}/></Sequence>
    <Sequence from={840} durationInFrames={330}><StatsSequence/></Sequence>
    <Sequence from={1170} durationInFrames={210}><Motm/></Sequence>
    <Sequence from={1380} durationInFrames={120}><Outro/></Sequence>
  </AbsoluteFill>;
};
