import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const GOLD = '#E4B23D';
const BG = '#0B0E12';
const WHITE = '#F5F5F2';
const MUTED = '#BFC4CB';

const css = `
@font-face{font-family:Thmanyah;src:url('${staticFile('thmanyah-bold.otf')}') format('opentype');font-weight:700;font-style:normal;font-display:swap;}
*{box-sizing:border-box} body{margin:0} .ar{font-family:Thmanyah, sans-serif;direction:rtl}
`;

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Fade: React.FC<{children: React.ReactNode; duration: number}> = ({children, duration}) => {
  const f = useCurrentFrame();
  const opacity = Math.min(
    interpolate(f, [0, 10], [0, 1], clamp),
    interpolate(f, [duration - 12, duration], [1, 0], clamp),
  );
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const GridBg: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, #19202a 0%, #0B0E12 46%, #07090c 100%)'}}>
    <AbsoluteFill style={{opacity: 0.18, backgroundImage: 'linear-gradient(#73808d22 1px, transparent 1px), linear-gradient(90deg, #73808d22 1px, transparent 1px)', backgroundSize: '72px 72px'}} />
  </AbsoluteFill>
);

const Brand: React.FC<{small?: boolean}> = ({small}) => (
  <Img src={staticFile('tactic_logo.png')} style={{position:'absolute', top: small ? 48 : 72, left: small ? 50 : 64, width: small ? 180 : 230, objectFit:'contain', zIndex:20}} />
);

const ScoreBug: React.FC = () => (
  <div className="ar" style={{position:'absolute', top:70, right:52, padding:'18px 30px', border:'1px solid #E4B23D77', background:'#07090ccc', borderRadius:28, color:WHITE, fontSize:38, zIndex:20}}>
    بني ياس <span style={{color:GOLD}}>0 - 2</span> الوصل
  </div>
);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame:f, fps, config:{damping:13, stiffness:110}});
  const score = Math.round(interpolate(f,[20,55],[0,2],clamp));
  return <Fade duration={90}>
    <GridBg />
    <Brand />
    <AbsoluteFill style={{alignItems:'center', justifyContent:'center'}}>
      <div className="ar" style={{position:'absolute', top:230, color:GOLD, fontSize:44}}>دوري أدنوك للمحترفين</div>
      <div style={{display:'flex', width:'88%', justifyContent:'space-between', alignItems:'center', transform:`scale(${0.72+0.28*p})`}}>
        <Img src={staticFile('baniyas_logo.png')} style={{width:260,height:260,objectFit:'contain'}} />
        <div style={{textAlign:'center'}}>
          <div className="ar" style={{fontSize:66,color:WHITE, marginBottom:18}}>نهاية المباراة</div>
          <div style={{fontFamily:'Thmanyah',fontSize:126,fontWeight:700,color:GOLD}}>0 - {score}</div>
        </div>
        <Img src={staticFile('wasl_logo.png')} style={{width:250,height:250,objectFit:'contain'}} />
      </div>
      <div className="ar" style={{position:'absolute', bottom:330, fontSize:76,color:WHITE}}>بني ياس × الوصل</div>
      <div style={{position:'absolute', bottom:245,width:650,height:3,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`, transform:`scaleX(${interpolate(f,[35,70],[0,1],clamp)})`}} />
      <div className="ar" style={{position:'absolute',bottom:150,color:MUTED,fontSize:34}}>16 أكتوبر 2026 • استاد بني ياس</div>
    </AbsoluteFill>
  </Fade>;
};

const GoalScene: React.FC<{file:string; scorer:string; minute:string; assist?:string; duration:number; accent?:'left'|'right'}> = ({file,scorer,minute,assist,duration,accent='right'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lower = spring({frame:f-12,fps,config:{damping:16,stiffness:120}});
  const pulse = interpolate(f,[0,20,45],[0,1,0.25],clamp);
  return <Fade duration={duration}>
    <AbsoluteFill style={{background:BG, overflow:'hidden'}}>
      <OffthreadVideo src={staticFile(file)} muted style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',filter:'blur(36px) brightness(.36) saturate(.9)',transform:'scale(1.18)'}} />
      <OffthreadVideo src={staticFile(file)} volume={1} style={{position:'absolute',left:'50%',top:'50%',width:'122%',height:'auto',transform:'translate(-50%,-50%)',objectFit:'contain'}} />
      <Brand small/><ScoreBug/>
      <div style={{position:'absolute',left:0,right:0,bottom:0,height:520,background:'linear-gradient(transparent,#050709e8 52%,#050709 100%)'}} />
      <div style={{position:'absolute',bottom:150,[accent]:55,width:770,transform:`translateX(${(1-lower)*(accent==='right'?120:-120)}px)`,opacity:lower}}>
        <div style={{height:3,width:180,background:GOLD,boxShadow:`0 0 ${25*pulse}px ${GOLD}`}} />
        <div className="ar" style={{fontSize:74,color:WHITE,marginTop:24,lineHeight:1.05}}>{scorer}</div>
        <div className="ar" style={{fontSize:38,color:MUTED,marginTop:18}}>{assist ? `صناعة: ${assist}` : 'هدف الوصل'}</div>
      </div>
      <div style={{position:'absolute',bottom:145,[accent==='right'?'left':'right']:70,color:GOLD,fontFamily:'Thmanyah',fontSize:72,fontWeight:700}}>{minute}'</div>
    </AbsoluteFill>
  </Fade>;
};

const StatFrame: React.FC<{title:string; children:React.ReactNode; duration:number}> = ({title,children,duration}) => {
  const f=useCurrentFrame();
  const sweep=interpolate(f,[0,22],[0,1],clamp);
  return <Fade duration={duration}><GridBg/><Brand small/>
    <div className="ar" style={{position:'absolute',top:210,right:90,fontSize:66,color:WHITE}}>{title}</div>
    <div style={{position:'absolute',top:310,right:90,width:760,height:3,background:`linear-gradient(90deg,${GOLD},transparent)`,transformOrigin:'right',transform:`scaleX(${sweep})`}} />
    {children}
  </Fade>;
};

const Possession: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[15,58],[0,1],clamp);
  const a=Math.round(46*p), b=Math.round(54*p);
  return <StatFrame title="الاستحواذ" duration={72}>
    <div style={{position:'absolute',top:690,left:100,right:100}}>
      <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Thmanyah',fontSize:84,color:WHITE}}><span>{a}%</span><span style={{color:GOLD}}>{b}%</span></div>
      <div style={{display:'flex',height:72,marginTop:38,borderRadius:36,overflow:'hidden',background:'#222832'}}>
        <div style={{width:`${46*p}%`,background:'#E9ECEF'}}/><div style={{width:`${54*p}%`,background:GOLD}}/>
      </div>
      <div className="ar" style={{display:'flex',justifyContent:'space-between',marginTop:28,color:MUTED,fontSize:38}}><span>بني ياس</span><span>الوصل</span></div>
    </div>
  </StatFrame>;
};

const XG: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[12,62],[0,1],clamp);
  return <StatFrame title="الأهداف المتوقعة xG" duration={72}>
    <div style={{position:'absolute',top:590,left:145,right:145,height:720,display:'flex',alignItems:'flex-end',justifyContent:'space-around'}}>
      {[{v:1.57,c:'#E9ECEF',n:'بني ياس'},{v:2.57,c:GOLD,n:'الوصل'}].map((x,i)=><div key={i} style={{width:260,textAlign:'center'}}>
        <div style={{fontFamily:'Thmanyah',fontSize:78,color:x.c,marginBottom:28}}>{(x.v*p).toFixed(2)}</div>
        <div style={{height:520,background:'#1d222a',borderRadius:34,overflow:'hidden',display:'flex',alignItems:'flex-end'}}><div style={{width:'100%',height:`${(x.v/2.57)*100*p}%`,background:`linear-gradient(180deg,${x.c},${x.c}77)`}} /></div>
        <div className="ar" style={{fontSize:36,color:MUTED,marginTop:26}}>{x.n}</div>
      </div>)}
    </div>
  </StatFrame>;
};

const Shots: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[10,58],[0,1],clamp);
  return <StatFrame title="التسديدات" duration={72}>
    <div style={{position:'absolute',top:520,left:80,right:80,height:900,border:'3px solid #747b8455',borderRadius:38,overflow:'hidden'}}>
      <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'#747b8444'}} />
      {Array.from({length:13}).map((_,i)=>{const y=80+(i%7)*105; const from=i%2===0?110:790; const len=160+((i*53)%260); const prog=Math.max(0,Math.min(1,(p*13-i)/3)); return <div key={i} style={{position:'absolute',top:y,left:from,width:len*prog,height:4,background:i%3===0?GOLD:'#E9ECEF99',transform:`rotate(${i%2===0?-18:198}deg)`,transformOrigin:'left',boxShadow:i%3===0?`0 0 12px ${GOLD}`:'none'}}/>})}
      <div style={{position:'absolute',bottom:80,left:90,fontFamily:'Thmanyah',fontSize:98,color:WHITE}}>{Math.round(19*p)}</div>
      <div style={{position:'absolute',bottom:80,right:90,fontFamily:'Thmanyah',fontSize:98,color:GOLD}}>{Math.round(13*p)}</div>
    </div>
  </StatFrame>;
};

const OnTarget: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[12,58],[0,1],clamp);
  const dots=[[-260,-160],[-80,-100],[90,-190],[250,-70],[-150,90],[130,100]];
  return <StatFrame title="على المرمى" duration={72}>
    <div style={{position:'absolute',top:610,left:135,right:135,height:620,border:`5px solid ${WHITE}`,borderBottomWidth:10}}>
      {[1,2].map(i=><div key={i} style={{position:'absolute',left:`${i*33.33}%`,top:0,bottom:0,width:2,background:'#ffffff33'}}/>)}
      {[1,2].map(i=><div key={i} style={{position:'absolute',top:`${i*33.33}%`,left:0,right:0,height:2,background:'#ffffff33'}}/>)}
      {dots.map(([x,y],i)=>{const s=interpolate(p,[i/8,(i+2)/8],[0,1],clamp);return <div key={i} style={{position:'absolute',left:`calc(50% + ${x}px)`,top:`calc(50% + ${y}px)`,width:44,height:44,borderRadius:'50%',background:GOLD,transform:`scale(${s})`,boxShadow:`0 0 28px ${GOLD}`}}/>})}
    </div>
    <div style={{position:'absolute',bottom:270,left:150,fontFamily:'Thmanyah',fontSize:86,color:WHITE}}>4</div>
    <div style={{position:'absolute',bottom:270,right:150,fontFamily:'Thmanyah',fontSize:86,color:GOLD}}>{Math.round(6*p)}</div>
  </StatFrame>;
};

const BigChances: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[10,52],[0,1],clamp); const ring=0.86+0.14*Math.sin(f/4);
  return <StatFrame title="الفرص الكبيرة" duration={72}>
    <div style={{position:'absolute',top:600,left:140,right:140,height:700,border:'3px solid #7c838d66',borderRadius:36}}>
      <div style={{position:'absolute',top:180,left:80,right:80,height:360,border:'3px solid #7c838d55'}} />
      <div style={{position:'absolute',top:320,left:'50%',width:210,height:210,borderRadius:'50%',border:`5px solid ${GOLD}`,transform:`translate(-50%,-50%) scale(${ring*p})`,boxShadow:`0 0 45px ${GOLD}66`}} />
      <div style={{position:'absolute',bottom:75,left:100,fontFamily:'Thmanyah',fontSize:98,color:WHITE}}>{Math.round(1*p)}</div>
      <div style={{position:'absolute',bottom:75,right:100,fontFamily:'Thmanyah',fontSize:98,color:GOLD}}>{Math.round(2*p)}</div>
    </div>
  </StatFrame>;
};

const Motm: React.FC = () => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig(); const p=spring({frame:f-6,fps,config:{damping:15,stiffness:95}}); const rating=(8.3*interpolate(f,[15,75],[0,1],clamp)).toFixed(1);
  return <Fade duration={180}><GridBg/><Brand small/>
    <div className="ar" style={{position:'absolute',top:200,right:90,fontSize:62,color:GOLD}}>نجم المباراة</div>
    <Img src={staticFile('cameron_puertas_cutout.png')} style={{position:'absolute',bottom:0,left:40,width:700,height:1420,objectFit:'contain',objectPosition:'bottom',transform:`translateY(${(1-p)*130}px) scale(${0.88+0.12*p})`,filter:'drop-shadow(0 28px 45px #000)'}}/>
    <div style={{position:'absolute',top:470,right:90,width:390,height:390,border:`10px solid ${GOLD}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',transform:`scale(${p})`,boxShadow:`0 0 60px ${GOLD}33`}}><div style={{fontFamily:'Thmanyah',fontSize:110,color:WHITE}}>{rating}</div></div>
    <div className="ar" style={{position:'absolute',top:920,right:85,width:520,fontSize:74,color:WHITE}}>كاميرون بويرتاس</div>
    {[['هدف','1'],['تمريرات مفتاحية','2'],['دقة التمرير','89%'],['لمسات','76']].map((x,i)=><div key={i} className="ar" style={{position:'absolute',top:1100+i*120,right:90+(i%2)*55,opacity:interpolate(f,[70+i*10,90+i*10],[0,1],clamp),color:i===0?GOLD:MUTED,fontSize:38}}><span style={{color:WHITE,fontSize:50,marginLeft:16}}>{x[1]}</span>{x[0]}</div>)}
  </Fade>;
};

const Outro: React.FC = () => {
  const f=useCurrentFrame(); const p=interpolate(f,[0,34],[0,1],clamp);
  return <Fade duration={120}><GridBg/><Brand/>
    <AbsoluteFill style={{alignItems:'center',justifyContent:'center'}}>
      <div className="ar" style={{fontSize:58,color:MUTED,marginBottom:35}}>نهاية المباراة</div>
      <div className="ar" style={{fontSize:92,color:WHITE}}>بني ياس <span style={{color:GOLD}}>0 - 2</span> الوصل</div>
      <div style={{width:700,height:3,background:GOLD,marginTop:55,transform:`scaleX(${p})`}}/>
      <div className="ar" style={{fontSize:48,color:WHITE,marginTop:70}}>الوصل يحسم المواجهة</div>
    </AbsoluteFill>
  </Fade>;
};

export const Scene: React.FC = () => {
  const f=useCurrentFrame();
  const musicVol = f < 90 ? 0.30 : f < 840 ? 0.10 : 0.26;
  return <AbsoluteFill style={{background:BG}}>
    <style>{css}</style>
    <Audio src={staticFile('music.wav')} volume={musicVol} />
    <Sequence from={0} durationInFrames={90}><Intro/></Sequence>
    <Sequence from={90} durationInFrames={360}><GoalScene file="goal_01.mp4" scorer="مهدي طارمي" minute="11" assist="نيكولاس خيمينيز" duration={360} accent="right"/></Sequence>
    <Sequence from={450} durationInFrames={390}><GoalScene file="goal_02.mp4" scorer="كاميرون بويرتاس" minute="45+1" duration={390} accent="left"/></Sequence>
    <Sequence from={840} durationInFrames={72}><Possession/></Sequence>
    <Sequence from={912} durationInFrames={72}><XG/></Sequence>
    <Sequence from={984} durationInFrames={72}><Shots/></Sequence>
    <Sequence from={1056} durationInFrames={72}><OnTarget/></Sequence>
    <Sequence from={1128} durationInFrames={72}><BigChances/></Sequence>
    <Sequence from={1200} durationInFrames={180}><Motm/></Sequence>
    <Sequence from={1380} durationInFrames={120}><Outro/></Sequence>
  </AbsoluteFill>;
};
