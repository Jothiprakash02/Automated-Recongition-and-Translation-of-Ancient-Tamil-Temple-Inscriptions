import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Global CSS ──────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#020408;--surface:#080d14;--card:#0c1520;--card2:#101a28;
      --border:#1e2d40;--border2:#2a3f58;
      --accent:#00ffaa;--accent2:#3d9eff;--accent3:#ff7043;
      --warn:#ffd740;--danger:#ff4466;--purple:#a78bfa;
      --text:#f0f4ff;--muted:#5a7a9a;--muted2:#2d3f52;
      --font:'Outfit',sans-serif;--mono:'Fira Code',monospace;
    }
    body{background:var(--bg);color:var(--text);font-family:var(--font);font-weight:500;min-height:100vh;overflow-x:hidden;letter-spacing:.01em;}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes spinSlow{to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes glowPulse{0%,100%{box-shadow:0 0 20px #00ff8830}50%{box-shadow:0 0 40px #00ff8860}}
    @keyframes particleFloat{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:.6}90%{opacity:.2}100%{transform:translateY(-100px) scale(1.2);opacity:0}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes glow{0%,100%{text-shadow:0 0 10px currentColor}50%{text-shadow:0 0 30px currentColor,0 0 60px currentColor}}
    @keyframes barIn{from{width:0}to{}}
    .fade-up{animation:fadeUp .5s ease both}
    .fade-up-1{animation:fadeUp .5s .1s ease both}
    .fade-up-2{animation:fadeUp .5s .2s ease both}
    .fade-up-3{animation:fadeUp .5s .3s ease both}
    .fade-up-4{animation:fadeUp .5s .4s ease both}
    .fade-up-5{animation:fadeUp .5s .5s ease both}
    .f0{animation:fadeUp .4s ease both}
    .f1{animation:fadeUp .4s .07s ease both}
    .f2{animation:fadeUp .4s .14s ease both}
    .f3{animation:fadeUp .4s .21s ease both}
    .f4{animation:fadeUp .4s .28s ease both}
    .f5{animation:fadeUp .4s .35s ease both}
    input,select{transition:border-color .2s,box-shadow .2s}
    input:focus,select:focus{outline:none;border-color:var(--accent)!important;box-shadow:0 0 0 3px #00ff8815}
    button{transition:all .2s}
  `}</style>
);

const ExtraStyles = () => (
  <style>{`
    @keyframes orbitA{0%{transform:rotate(0deg) translateX(260px) rotate(0deg)}100%{transform:rotate(360deg) translateX(260px) rotate(-360deg)}}
    @keyframes orbitB{0%{transform:rotate(120deg) translateX(180px) rotate(-120deg)}100%{transform:rotate(480deg) translateX(180px) rotate(-480deg)}}
    @keyframes orbitC{0%{transform:rotate(240deg) translateX(320px) rotate(-240deg)}100%{transform:rotate(600deg) translateX(320px) rotate(-600deg)}}
    @keyframes shootStar{0%{transform:translateX(-200px) translateY(0) rotate(15deg);opacity:0}5%{opacity:.8}80%{opacity:.4}100%{transform:translateX(110vw) translateY(30px) rotate(15deg);opacity:0}}
    @keyframes floatOrb{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-28px) scale(1.06)}}
    @keyframes nebulaDrift{0%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-20px) scale(1.05)}66%{transform:translate(-20px,30px) scale(.97)}100%{transform:translate(0,0) scale(1)}}
    @keyframes scanDown{0%{top:-4px}100%{top:100%}}
    @keyframes twinkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:.9;transform:scale(1)}}
    @keyframes hexPulse{0%,100%{opacity:.04}50%{opacity:.10}}
  `}</style>
);

const Particles = () => (
  <>
    <ExtraStyles/>
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
      {[
        {x:'12%',y:'18%',size:600,color:'#00ffaa',dur:20,delay:0},
        {x:'80%',y:'65%',size:500,color:'#3d9eff',dur:25,delay:5},
        {x:'50%',y:'90%',size:400,color:'#ff7043',dur:28,delay:9},
        {x:'90%',y:'12%',size:350,color:'#00ffaa',dur:18,delay:3},
      ].map(({x,y,size,color,dur,delay},i)=>(
        <div key={i} style={{
          position:'absolute',left:x,top:y,width:size,height:size,borderRadius:'50%',
          background:`radial-gradient(circle,${color}10 0%,${color}05 45%,transparent 70%)`,
          transform:'translate(-50%,-50%)',
          animation:`nebulaDrift ${dur}s ${delay}s ease-in-out infinite`,filter:'blur(50px)',
        }}/>
      ))}
      <div style={{
        position:'absolute',inset:0,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z' fill='none' stroke='%2300ffaa' stroke-width='.5' opacity='.07'/%3E%3C/svg%3E")`,
        backgroundSize:'56px 100px',animation:'hexPulse 5s ease-in-out infinite',
      }}/>
      <div style={{position:'absolute',left:'50%',top:'50%',width:0,height:0}}>
        {[
          {anim:'orbitA',dur:'28s',color:'var(--accent)',size:5},
          {anim:'orbitB',dur:'20s',color:'var(--accent2)',size:4},
          {anim:'orbitC',dur:'36s',color:'var(--accent3)',size:4},
        ].map(({anim,dur,color,size},i)=>(
          <div key={i} style={{
            position:'absolute',width:size,height:size,borderRadius:'50%',
            background:color,boxShadow:`0 0 10px ${color},0 0 20px ${color}60`,
            animation:`${anim} ${dur} linear infinite`,opacity:.8,
          }}/>
        ))}
      </div>
      {Array.from({length:5},(_,i)=>(
        <div key={i} style={{
          position:'absolute',left:`${(i*19+5)%85}%`,top:`${(i*11+5)%35}%`,
          width:60+i*25,height:1.5,
          background:`linear-gradient(90deg,transparent,var(--accent)90,transparent)`,
          animation:`shootStar ${7+i*3}s ${i*3}s linear infinite`,
          boxShadow:`0 0 8px var(--accent)`,borderRadius:2,opacity:.7,
        }}/>
      ))}
      {Array.from({length:26},(_,i)=>(
        <div key={i} style={{
          position:'absolute',left:`${(i*17+3)%100}%`,
          width:i%4===0?3:i%4===1?2:1.5,height:i%4===0?3:i%4===1?2:1.5,
          borderRadius:'50%',
          background:i%3===0?'var(--accent)':i%3===1?'var(--accent2)':'var(--accent3)',
          opacity:.12+i%4*.06,
          boxShadow:i%4===0?`0 0 8px ${i%3===0?'var(--accent)':i%3===1?'var(--accent2)':'var(--accent3)'}`:undefined,
          animation:`floatOrb ${7+i*.6}s ${i*.4}s ease-in-out infinite,particleFloat ${10+i*.8}s ${i*.3}s linear infinite`,
        }}/>
      ))}
      {Array.from({length:35},(_,i)=>(
        <div key={i} style={{
          position:'absolute',left:`${(i*7+11)%100}%`,top:`${(i*11+7)%100}%`,
          width:i%5===0?2:1,height:i%5===0?2:1,
          borderRadius:'50%',background:'#ffffff',
          animation:`twinkle ${1.5+i%4*.5}s ${i*.25}s ease-in-out infinite`,
        }}/>
      ))}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.05) 2px,rgba(0,0,0,.05) 4px)'}}/>
      <div style={{position:'absolute',left:0,right:0,height:4,
        background:'linear-gradient(transparent,var(--accent)15,transparent)',
        animation:'scanDown 10s linear infinite',opacity:.5,
      }}/>
    </div>
  </>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt   = n => typeof n==="number" ? Math.abs(n).toLocaleString("en-IN",{maximumFractionDigits:0}) : "—";
const fmtD  = n => typeof n==="number" ? n.toLocaleString("en-IN",{maximumFractionDigits:1}) : "—";
const riskCol = r => r==="Low"?"var(--accent)":r==="Medium"?"var(--warn)":"var(--danger)";

/* ─── Rich UI Components ──────────────────────────────────────────────────── */
const AnimatedNumber = ({ value, duration=1200, prefix='', suffix='' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(()=>{
    const start=performance.now(), target=parseFloat(value)||0;
    const animate=(now)=>{
      const p=Math.min((now-start)/duration,1);
      setDisplay(target*(1-Math.pow(1-p,3)));
      if(p<1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },[value,duration]);
  const f=n=>Math.abs(n)>=100000?(n/1000).toFixed(0)+'K':Math.abs(n)>=1000?n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,','):n.toFixed(2);
  return <>{prefix}{f(display)}{suffix}</>;
};

const ScoreRing = ({ value, label, color, size=100, delay=0 }) => {
  const [on,setOn]=useState(false);
  useEffect(()=>{setTimeout(()=>setOn(true),delay)},[delay]);
  const r=36,circ=2*Math.PI*r,dash=on?(Math.max(0,Math.min(100,value||0))/100)*circ:0;
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}} className="fade-up">
      <div style={{position:'relative',width:size,height:size}}>
        <svg width={size} height={size} viewBox="0 0 80 80" style={{transform:'rotate(-90deg)'}}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border2)" strokeWidth="4"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{transition:`stroke-dasharray 1.2s ${delay}ms cubic-bezier(.4,0,.2,1)`,filter:`drop-shadow(0 0 6px ${color}80)`}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:'var(--mono)',fontSize:18,fontWeight:700,color}}>{Math.round(value||0)}</div>
        <div style={{position:'absolute',inset:-4,borderRadius:'50%',border:`1px solid ${color}20`,
          borderTopColor:color,animation:'spinSlow 4s linear infinite',opacity:on?1:0,transition:'opacity .5s'}}/>
      </div>
      <span style={{fontSize:10,color:'var(--muted)',letterSpacing:'.12em',textTransform:'uppercase'}}>{label}</span>
    </div>
  );
};

const GlowCard = ({ children, color='var(--accent)', style={}, glow=false, className='', onMouseEnter, onMouseLeave }) => (
  <div className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{
    background:'var(--card)',border:`1px solid ${glow?color+'60':'var(--border)'}`,
    borderRadius:16,padding:24,position:'relative',overflow:'hidden',transition:'border-color .3s',
    ...(glow?{boxShadow:`0 0 30px ${color}20,inset 0 0 30px ${color}05`}:{}), ...style,
  }}>
    {glow&&<div style={{position:'absolute',top:0,left:0,right:0,height:2,
      background:`linear-gradient(90deg,transparent,${color},transparent)`,
      animation:'shimmer 2s linear infinite',backgroundSize:'200% 100%'}}/>}
    {children}
  </div>
);

const Tag = ({label,color='var(--accent)'}) => (
  <span style={{display:'inline-block',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,
    letterSpacing:'.08em',textTransform:'uppercase',background:`${color}15`,color,
    border:`1px solid ${color}30`,fontFamily:'var(--mono)'}}>{label}</span>
);

const AnimBar = ({ label, value, max=100, color, delay=0 }) => {
  const [w,setW]=useState(0);
  useEffect(()=>{setTimeout(()=>setW((Math.min(value,max)/max)*100),delay+100)},[value,max,delay]);
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12}}>
        <span style={{color:'var(--muted)'}}>{label}</span>
        <span style={{color,fontFamily:'var(--mono)',fontWeight:600}}>{typeof value==='number'?value.toFixed(1):value}</span>
      </div>
      <div style={{height:4,background:'var(--border2)',borderRadius:2,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${w}%`,background:`linear-gradient(90deg,${color}80,${color})`,
          borderRadius:2,transition:`width 1s ${delay}ms cubic-bezier(.4,0,.2,1)`,boxShadow:`0 0 8px ${color}60`}}/>
      </div>
    </div>
  );
};

const TerminalText = ({ lines, speed=35 }) => {
  const [done,setDone]=useState([]);
  const [cur,setCur]=useState('');
  const [li,setLi]=useState(0);
  const [ci,setCi]=useState(0);
  useEffect(()=>{
    if(li>=lines.length) return;
    if(ci<lines[li].length){
      const t=setTimeout(()=>{setCur(c=>c+lines[li][ci]);setCi(i=>i+1);},speed);
      return()=>clearTimeout(t);
    } else {
      const t=setTimeout(()=>{setDone(d=>[...d,lines[li]]);setCur('');setCi(0);setLi(i=>i+1);},180);
      return()=>clearTimeout(t);
    }
  },[li,ci,lines,speed]);
  const cols=['var(--accent)','var(--accent2)','var(--muted)','var(--warn)','var(--text)'];
  return (
    <div style={{fontFamily:'var(--mono)',fontSize:12,lineHeight:1.8}}>
      {done.map((t,i)=><div key={i} style={{color:cols[i%cols.length],opacity:.8}}>{t}</div>)}
      {li<lines.length&&<div style={{color:cols[li%cols.length]}}>
        {cur}<span style={{animation:'blink .8s step-end infinite',display:'inline-block',
          width:6,height:12,background:cols[li%cols.length],marginLeft:2,verticalAlign:'middle'}}/>
      </div>}
    </div>
  );
};

const MPIGauge = ({ value }) => {
  const [w,setW]=useState(0);
  useEffect(()=>{setTimeout(()=>setW(Math.min(value,1)*100),300)},[value]);
  const color=value>0.6?'var(--danger)':value>0.35?'var(--warn)':'var(--accent)';
  const label=value>0.6?'High Risk':value>0.35?'Moderate':'Low Risk';
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13}}>
        <span style={{color:'var(--muted)',fontFamily:'var(--mono)'}}>Market Power Index</span>
        <span style={{color,fontFamily:'var(--mono)',fontWeight:700}}>{value?.toFixed(3)} — {label}</span>
      </div>
      <div style={{height:12,background:'linear-gradient(90deg,var(--accent),var(--warn),var(--danger))',
        borderRadius:6,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,bottom:0,width:`${100-w}%`,
          background:'var(--border)',borderRadius:'0 6px 6px 0',transition:'width 1.5s cubic-bezier(.4,0,.2,1)'}}/>
        <div style={{position:'absolute',top:'50%',left:`${w}%`,transform:'translate(-50%,-50%)',
          width:16,height:16,borderRadius:'50%',background:'var(--text)',border:'2px solid var(--bg)',
          transition:'left 1.5s cubic-bezier(.4,0,.2,1)',boxShadow:`0 0 8px ${color}`}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)'}}>
        <span>Low Risk</span><span>Moderate</span><span>High Risk</span>
      </div>
    </div>
  );
};

const StepBar = ({ current }) => {
  const steps=['Profile','Market Research','Optimization'];
  return (
    <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:32}}>
      {steps.map((s,i)=>{
        const done=i<current,active=i===current;
        const color=done||active?'var(--accent)':'var(--muted)';
        return (
          <div key={s} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'auto'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
              <div style={{width:32,height:32,borderRadius:'50%',
                background:done?'var(--accent)':active?'var(--accent)20':'var(--border)',
                border:`2px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:'var(--mono)',fontSize:13,fontWeight:700,color,transition:'all .4s'}}>
                {done?'✔':i+1}
              </div>
              <span style={{fontSize:10,color,letterSpacing:'.08em',textTransform:'uppercase',
                fontFamily:'var(--mono)',whiteSpace:'nowrap'}}>{s}</span>
            </div>
            {i<steps.length-1&&<div style={{flex:1,height:2,background:done?'var(--accent)':'var(--border)',
              margin:'0 8px',marginBottom:22,transition:'background .4s'}}/>}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Compat shims (used by DiscoverPage / ScenariosPage) ────────────────── */
const Card = ({children, style, glow, className}) => (
  <GlowCard glow={glow} color="var(--accent)" style={{borderRadius:10,...style}} className={className}>
    {children}
  </GlowCard>
);
const SectionLabel = ({children, color="var(--accent)"}) => (
  <div style={{fontFamily:'var(--mono)',fontSize:10,color,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:6}}>
    {children}
  </div>
);

/* ─── Navigation ──────────────────────────────────────────────────────────── */
const TABS=[
  {id:'discover',  label:'🔍 Discover'},
  {id:'analyze',   label:'⚡ Analyze'},
  {id:'profile',   label:'👤 Profile'},
  {id:'results',   label:'📊 Market'},
  {id:'optimize',  label:'🎯 Optimize'},
  {id:'scenarios', label:'📈 Scenarios'},
  {id:'signals',   label:'📡 Signals'},
  {id:'strategy',  label:'♟ Strategy'},
  {id:'content',   label:'✨ Content'},
  {id:'history',   label:'🕐 History'},
];

const Nav = ({tab, setTab, hasResults, apiOk}) => {
  const [hov,setHov]=useState(null);
  const free=['discover','analyze','history'];
  return (
    <nav style={{position:'sticky',top:0,zIndex:200,background:'rgba(2,4,8,.92)',
      backdropFilter:'blur(20px)',borderBottom:'1px solid var(--border)',
      display:'flex',alignItems:'center',padding:'0 20px',height:60,gap:2,flexWrap:'wrap'}}>
      <div style={{fontFamily:'var(--font)',fontWeight:900,fontSize:22,marginRight:24,
        letterSpacing:'-.03em',whiteSpace:'nowrap'}}>
        <span style={{color:'var(--accent)',textShadow:'0 0 24px var(--accent),0 0 48px var(--accent)60'}}>Market</span>
        <span style={{color:'var(--text)'}}>Mind</span>
      </div>
      {TABS.map(t=>{
        const locked=!free.includes(t.id)&&!hasResults&&t.id!=='settings';
        const active=tab===t.id;
        return (
          <button key={t.id} onMouseEnter={()=>setHov(t.id)} onMouseLeave={()=>setHov(null)}
            onClick={()=>!locked&&setTab(t.id)} style={{
              background:active?'var(--accent)20':'none',
              border:active?'1px solid var(--accent)60':'1px solid transparent',
              borderRadius:8,cursor:locked?'not-allowed':'pointer',
              padding:'6px 12px',fontFamily:'var(--font)',fontSize:12,
              fontWeight:active?800:600,
              color:active?'var(--accent)':locked?'var(--border2)':hov===t.id?'var(--text)':'var(--muted)',
              transition:'all .2s',letterSpacing:'.02em',whiteSpace:'nowrap',
              textShadow:active?'0 0 14px var(--accent)':'none',
              position:'relative',
            }}>
            {t.label}
            {active && <div style={{position:'absolute',bottom:-1,left:'50%',transform:'translateX(-50%)',
              width:'60%',height:2,background:'var(--accent)',borderRadius:'2px 2px 0 0',
              boxShadow:'0 0 8px var(--accent)'}}/>}
          </button>
        );
      })}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,
        fontSize:12,fontFamily:'var(--font)',fontWeight:700,
        color:apiOk?'var(--accent)':'var(--danger)',
        textShadow:apiOk?'0 0 10px var(--accent)':'none'}}>
        <div style={{width:7,height:7,borderRadius:'50%',
          background:apiOk?'var(--accent)':'var(--danger)',
          animation:apiOk?'glowPulse 2s ease-in-out infinite':'none',
          boxShadow:apiOk?'0 0 8px var(--accent)':'none'}}/>
        API {apiOk?'ONLINE':'OFFLINE'}
      </div>
    </nav>
  );
};

/* ─── DISCOVER PAGE (Module 0 — TrendScout) ──────────────────────────────── */
const DiscoverPage = ({onSelectProduct}) => {
  const [form,setForm] = useState({region:"India",category:"",time_range:"3_months"});
  const [loading,setLoading] = useState(false);
  const [trends,setTrends] = useState(null);
  const [error,setError] = useState("");

  const discover = async()=>{
    setError("");setLoading(true);
    try{
      const body={region:form.region,time_range:form.time_range};
      if(form.category) body.category=form.category;
      const res=await fetch("http://localhost:8080/discover-trends",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok){const e=await res.json();throw new Error(e.detail||"Discovery failed");}
      setTrends(await res.json());
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const velCol=v=>v==="High"?"var(--accent)":v==="Medium"?"var(--warn)":"var(--accent2)";
  const inp={background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontFamily:'var(--mono)',fontSize:13,padding:'11px 14px',width:'100%'};

  return (
    <div style={{maxWidth:1200,margin:'0 auto',padding:'60px 32px',position:'relative',zIndex:1}}>
      <div className="f0" style={{marginBottom:36,textAlign:'center'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--purple)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:12}}>
          MODULE 0 — INNOVATION LAYER
        </div>
        <h1 style={{fontFamily:'var(--font)',fontSize:52,fontWeight:900,letterSpacing:'-.03em',lineHeight:1.05,marginBottom:16}}>
          Trend<span style={{color:'var(--accent)',textShadow:'0 0 24px var(--accent)'}}>Scout</span>{" "}
          <span style={{fontSize:32,fontWeight:600,color:'var(--muted)'}}>Discovery Engine</span>
        </h1>
        <p style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',lineHeight:1.8,maxWidth:560,margin:'0 auto'}}>
          Discover what is trending <em style={{color:'var(--warn)'}}>before</em> you pick a product.<br/>
          Scans Google Trends, Amazon Movers &amp; Shakers, and Reddit.
        </p>
      </div>

      <GlowCard className="f1" glow color="var(--purple)" style={{maxWidth:720,margin:'0 auto 32px'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--purple)',letterSpacing:'.15em',marginBottom:20}}>// SCAN PARAMETERS</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>REGION</label>
            <select style={inp} value={form.region} onChange={e=>setForm({...form,region:e.target.value})}>
              {["India","US","UK","Canada","Australia"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>CATEGORY (OPTIONAL)</label>
            <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="">All Categories</option>
              {["electronics","home_kitchen","fitness","beauty","fashion","toys","automotive"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>TIME RANGE</label>
            <select style={inp} value={form.time_range} onChange={e=>setForm({...form,time_range:e.target.value})}>
              {[["3_months","3 Months"],["6_months","6 Months"],["1_year","1 Year"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        {error&&<div style={{marginTop:14,padding:'10px 14px',background:'var(--danger)10',border:'1px solid var(--danger)30',borderRadius:8,fontFamily:'var(--mono)',fontSize:12,color:'var(--danger)'}}>⚠ {error}</div>}
        <button onClick={discover} disabled={loading} style={{
          marginTop:20,width:'100%',padding:'14px',
          background:loading?'transparent':'linear-gradient(135deg,var(--purple),var(--accent2))',
          border:loading?'1px solid var(--purple)40':'none',
          borderRadius:10,cursor:loading?'not-allowed':'pointer',
          fontFamily:'var(--mono)',fontWeight:700,fontSize:14,
          color:loading?'var(--purple)':'var(--bg)',letterSpacing:'.08em',
          ...(loading?{}:{boxShadow:'0 0 20px var(--purple)30'}),
        }}>{loading?'SCANNING TRENDS...':'DISCOVER OPPORTUNITIES →'}</button>
      </GlowCard>

      {loading&&(
        <GlowCard className="f2" style={{textAlign:'center',padding:'48px 20px',maxWidth:480,margin:'0 auto'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',marginBottom:20}}>Scanning multiple data sources...</div>
          <div style={{display:'inline-block',width:36,height:36,border:'3px solid var(--border)',borderTopColor:'var(--purple)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        </GlowCard>
      )}

      {trends&&!loading&&(
        <>
          <div className="f2" style={{marginBottom:20}}>
            <GlowCard style={{padding:'20px 28px',background:'linear-gradient(135deg,var(--card),rgba(167,139,250,.06))'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
                <div>
                  <SectionLabel color="var(--purple)">Scan Complete</SectionLabel>
                  <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:22,marginTop:4}}>{trends.message}</div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  {trends.data_sources_used.map(s=><Tag key={s} label={s} color="var(--purple)"/>)}
                </div>
              </div>
            </GlowCard>
          </div>

          <div className="f3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            <GlowCard color="var(--accent)">
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>// EMERGING CATEGORIES</div>
              {trends.emerging_categories.slice(0,5).map((cat,i)=>(
                <div key={i} style={{marginBottom:16,padding:'12px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:16}}>{cat.category.toUpperCase()}</span>
                    <Tag label={cat.growth_velocity} color={velCol(cat.growth_velocity)}/>
                  </div>
                  <div style={{height:4,background:'var(--border)',borderRadius:2,marginBottom:10}}>
                    <div style={{height:'100%',background:'var(--accent)',borderRadius:2,width:`${cat.trend_strength}%`,animation:'barIn .9s ease'}}/>
                  </div>
                  <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)'}}>
                    {cat.suggested_products.slice(0,2).join(' • ')}
                  </div>
                </div>
              ))}
            </GlowCard>

            <GlowCard color="var(--warn)">
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--warn)',letterSpacing:'.15em',marginBottom:16}}>// SEASONAL SPIKES</div>
              {trends.seasonal_spikes.slice(0,8).map((spike,i)=>(
                <div key={i} style={{padding:'10px 0',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{color:'var(--warn)',fontSize:14}}>▲</span>
                  {spike}
                </div>
              ))}
            </GlowCard>
          </div>

          <GlowCard className="f4" color="var(--accent2)">
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// TOP PRODUCT OPPORTUNITIES</div>
            <div style={{display:'grid',gap:10}}>
              {trends.top_opportunities.slice(0,10).map((opp,i)=>(
                <div key={i} style={{
                  padding:'14px 16px',background:'var(--surface)',borderRadius:8,
                  border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',
                  alignItems:'center',gap:16,flexWrap:'wrap',transition:'border-color .2s',cursor:'pointer',
                }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                  onClick={()=>onSelectProduct(opp.product_name)}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:16,marginBottom:6}}>{opp.product_name}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <Tag label={opp.category} color="var(--purple)"/>
                      <Tag label={opp.source} color="var(--accent2)"/>
                      <Tag label={opp.growth_velocity} color={velCol(opp.growth_velocity)}/>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:20}}>
                    {[
                      {l:'STRENGTH',v:opp.trend_strength.toFixed(0),c:'var(--accent)'},
                      {l:'VOLUME',v:fmt(opp.search_volume_estimate),c:'var(--warn)'},
                      {l:'CONFIDENCE',v:`${(opp.confidence*100).toFixed(0)}%`,c:'var(--accent2)'},
                    ].map(({l,v,c})=>(
                      <div key={l} style={{textAlign:'center'}}>
                        <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:18,color:c}}>{v}</div>
                        <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',letterSpacing:'.1em'}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{padding:'8px 16px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:6,fontFamily:'var(--mono)',fontSize:11,fontWeight:700,letterSpacing:'.08em'}}>
                    ANALYZE →
                  </button>
                </div>
              ))}
            </div>
          </GlowCard>
        </>
      )}
    </div>
  );
};

/* ─── ANALYZE PAGE (Full Pipeline M1+M2+M3) ──────────────────────────────── */
const AnalyzePage = ({onResult, initialProduct=""}) => {
  const [form,setForm]=useState({niche:initialProduct||'',budget:'',risk_level:'moderate',country:'India',experience:'beginner'});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [stepIdx,setStepIdx]=useState(0);

  useEffect(()=>{ if(initialProduct) setForm(f=>({...f,niche:initialProduct})); },[initialProduct]);

  const STEPS=[
    '> [M1] Validating seller profile...',
    '> [M1] Normalizing budget & risk config...',
    '> [M1] Deriving effective budget & platform...',
    '> [M2] Connecting to Google Trends API...',
    '> [M2] Scraping Amazon search results...',
    '> [M2] Fetching keyword CPC data...',
    '> [M2] Scraping Alibaba supplier pricing...',
    '> [M2] Computing demand + competition scores...',
    '> [M2] Running LLM strategy generation...',
    '> [M3] Running 7-step MPI math engine...',
    '> [M3] Optimizing selling price & margin...',
    '> [M3] Computing recommended inventory...',
    '> Pipeline complete. Building response...',
  ];
  useEffect(()=>{
    if(!loading) return;
    const iv=setInterval(()=>setStepIdx(i=>(i+1)%STEPS.length),1800);
    return()=>clearInterval(iv);
  },[loading]);

  const inp={background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,
    color:'var(--text)',fontFamily:'var(--mono)',fontSize:13,padding:'11px 14px',width:'100%'};

  const run=async()=>{
    if(!form.niche||!form.budget){setError('Niche and budget are required.');return;}
    setError('');setLoading(true);setStepIdx(0);
    try{
      const res=await fetch('http://localhost:8080/analyze',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({niche:form.niche,budget:parseFloat(form.budget),
          risk_level:form.risk_level,country:form.country,experience:form.experience})
      });
      if(!res.ok){const e=await res.json();throw new Error(e.detail||'Analysis failed');}
      onResult(await res.json());
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'60px 32px',position:'relative',zIndex:1}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'start'}}>
        <div>
          <div className="fade-up" style={{marginBottom:36}}>
            <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:12}}>
              MODULE 1 + 2 + 3 — FULL PIPELINE
            </div>
            <h1 style={{fontFamily:'var(--font)',fontSize:40,fontWeight:700,lineHeight:1.1,letterSpacing:'-.03em',marginBottom:16}}>
              Commerce<br/>
              <span style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Intelligence</span>
            </h1>
            <p style={{color:'var(--muted)',fontSize:14,lineHeight:1.8}}>
              Profile → Market Research → Profit Optimization — all in one pipeline.
            </p>
          </div>
          {loading&&<div className="fade-up" style={{marginBottom:24}}><StepBar current={Math.min(Math.floor(stepIdx/4),2)}/></div>}
          <GlowCard className="fade-up-1" glow={loading} color="var(--accent)">
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:20}}>// SELLER PROFILE — MODULE 1</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div>
                <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>PRODUCT NICHE</label>
                <input style={inp} placeholder="e.g. wireless earbuds, yoga mat..."
                  value={form.niche} onChange={e=>setForm({...form,niche:e.target.value})}
                  onKeyDown={e=>e.key==='Enter'&&run()}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>BUDGET (USD)</label>
                  <input style={inp} type="number" placeholder="e.g. 5000" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>RISK LEVEL</label>
                  <select style={{...inp,cursor:'pointer'}} value={form.risk_level} onChange={e=>setForm({...form,risk_level:e.target.value})}>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>COUNTRY</label>
                  <select style={{...inp,cursor:'pointer'}} value={form.country} onChange={e=>setForm({...form,country:e.target.value})}>
                    {['India','US','UK','Canada','Australia'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em'}}>EXPERIENCE</label>
                  <select style={{...inp,cursor:'pointer'}} value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
            {error&&<div style={{marginTop:16,padding:'10px 14px',background:'var(--danger)10',
              border:'1px solid var(--danger)30',borderRadius:8,fontSize:12,color:'var(--danger)',fontFamily:'var(--mono)'}}>✗ {error}</div>}
            <button onClick={run} disabled={loading} style={{
              marginTop:20,width:'100%',padding:'14px',
              background:loading?'transparent':'linear-gradient(135deg,var(--accent),var(--accent2))',
              border:loading?'1px solid var(--accent)40':'none',
              borderRadius:10,cursor:loading?'not-allowed':'pointer',
              fontFamily:'var(--mono)',fontWeight:700,fontSize:14,
              color:loading?'var(--accent)':'var(--bg)',letterSpacing:'.08em',
              ...(loading?{}:{boxShadow:'0 0 20px var(--accent)30'}),
            }}>{loading?'RUNNING PIPELINE...':'RUN FULL PIPELINE →'}</button>
            {loading&&<div style={{marginTop:20,padding:'16px',background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)'}}>
              <TerminalText lines={STEPS.slice(0,stepIdx+2)} speed={20}/>
            </div>}
          </GlowCard>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <GlowCard className="fade-up-2" color="var(--accent2)">
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// PIPELINE ARCHITECTURE</div>
            {[
              {mod:'M0',title:'Trend Scouting',desc:'Google Trends + Amazon Movers + Reddit → opportunities',color:'var(--purple)'},
              {mod:'M1',title:'User Profiling',desc:'Validates niche, budget, risk, experience → ProcessedConfig',color:'var(--accent)'},
              {mod:'M2',title:'Market Intelligence',desc:'Google Trends + Amazon + Keywords + Supplier → Scores + LLM',color:'var(--accent2)'},
              {mod:'M3',title:'Profit Optimization',desc:'7-step MPI engine → Price, Margin, Volume, Inventory',color:'var(--accent3)'},
            ].map(({mod,title,desc,color},i)=>(
              <div key={mod} className={`fade-up-${i+2}`} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)',alignItems:'flex-start'}}>
                <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:`${color}15`,
                  border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',
                  fontFamily:'var(--mono)',fontSize:11,fontWeight:700,color}}>{mod}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{title}</div>
                  <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.6}}>{desc}</div>
                </div>
              </div>
            ))}
          </GlowCard>
          <GlowCard className="fade-up-3" color="var(--accent3)">
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent3)',letterSpacing:'.15em',marginBottom:12}}>// WHAT YOU GET</div>
            {[
              ['Profile config','risk multiplier, effective budget, platform'],
              ['Market signals','demand score, competition, trend, keywords'],
              ['Supplier cost','Alibaba/AliExpress landed cost'],
              ['MPI score','market power index – risk assessment'],
              ['Optimized price','selling price, margin, unit profit'],
              ['Monthly forecast','adjusted volume, monthly profit, inventory'],
              ['AI strategy','Llama3 strategic recommendations'],
            ].map(([k,v])=>(
              <div key={k} style={{display:'flex',gap:8,marginBottom:8,fontSize:12}}>
                <span style={{color:'var(--accent)',flexShrink:0}}>→</span>
                <span style={{color:'var(--text)',fontWeight:600}}>{k}</span>
                <span style={{color:'var(--muted)',marginLeft:'auto',textAlign:'right',fontSize:11}}>{v}</span>
              </div>
            ))}
          </GlowCard>
        </div>
      </div>
    </div>
  );
};

/* ─── PROFILE PAGE ────────────────────────────────────────────────────────── */
const ProfilePage = ({data}) => {
  if(!data) return null;
  const p=data.profile;
  const riskColor=p?.risk_level==='aggressive'?'var(--danger)':p?.risk_level==='moderate'?'var(--warn)':'var(--accent)';
  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// MODULE 1 — USER PROFILING & ONBOARDING</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>Seller Profile</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <GlowCard className="fade-up-1" color="var(--accent)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>// INPUT CONFIG</div>
          {[['Niche',p?.niche],['Budget',`$${p?.budget?.toLocaleString()}`],['Risk Level',p?.risk_level],
            ['Country',p?.country],['Platform',p?.platform],['Experience',p?.experience],['Currency',p?.currency_symbol]
          ].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
              <span style={{color:'var(--muted)'}}>{l}</span>
              <span style={{color:'var(--text)',fontFamily:'var(--mono)',fontWeight:600,textTransform:'capitalize'}}>{v||'—'}</span>
            </div>
          ))}
        </GlowCard>
        <GlowCard className="fade-up-2" color="var(--accent2)" glow>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// DERIVED CONFIG</div>
          {[
            ['Risk Multiplier',`${p?.risk_multiplier?.toFixed(2)}×`,'var(--warn)'],
            ['Target Margin',`${(p?.target_margin*100)?.toFixed(0)}%`,'var(--accent)'],
            ['Country Fee',`${(p?.country_fee*100)?.toFixed(0)}%`,'var(--accent2)'],
            ['Effective Budget',`$${p?.effective_budget?.toLocaleString()}`,'var(--accent)'],
          ].map(([l,v,c])=>(
            <div key={l} style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:11,color:'var(--muted)',marginBottom:4,fontFamily:'var(--mono)',letterSpacing:'.06em'}}>{l}</div>
              <div style={{fontSize:24,fontFamily:'var(--mono)',fontWeight:700,color:c}}>{v||'—'}</div>
            </div>
          ))}
        </GlowCard>
      </div>
      <GlowCard className="fade-up-3" color={riskColor} glow>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          <div style={{width:64,height:64,borderRadius:12,flexShrink:0,background:`${riskColor}15`,
            border:`2px solid ${riskColor}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>
            {p?.risk_level==='aggressive'?'🔥':p?.risk_level==='moderate'?'⚡':'🛡'}
          </div>
          <div>
            <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:20,marginBottom:4,color:riskColor,textTransform:'capitalize'}}>
              {p?.risk_level} Investor Profile
            </div>
            <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>
              Risk multiplier <span style={{color:riskColor}}>{p?.risk_multiplier?.toFixed(2)}×</span> ·{' '}
              Target margin <span style={{color:'var(--accent)'}}>{(p?.target_margin*100)?.toFixed(0)}%</span> ·{' '}
              Effective budget <span style={{color:'var(--accent2)'}}>${p?.effective_budget?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};

/* ─── RESULTS PAGE ────────────────────────────────────────────────────────── */
const ResultsPage = ({data}) => {
  if(!data) return null;
  const m=data.market, p=data.profile;
  const tc=m?.trend_direction==='Rising'?'var(--accent)':m?.trend_direction==='Stable'?'var(--warn)':'var(--danger)';
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32,padding:'28px 32px',
        background:'linear-gradient(135deg,var(--card),var(--card2))',
        borderRadius:20,border:'1px solid var(--border)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,
          background:'linear-gradient(90deg,var(--accent),var(--accent2),var(--accent3))',
          animation:'shimmer 3s linear infinite',backgroundSize:'200% 100%'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// MODULE 2 — MARKET INTELLIGENCE</div>
            <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em',marginBottom:12}}>{p?.niche}</h2>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Tag label={p?.country}/><Tag label={p?.platform} color="var(--accent2)"/>
              <Tag label={`Trend: ${m?.trend_direction}`} color={tc}/>
              <Tag label={`${p?.experience} seller`} color="var(--muted)"/>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginBottom:4}}>EST. MONTHLY SALES</div>
            <div style={{fontSize:40,fontFamily:'var(--mono)',fontWeight:700,color:'var(--accent)',animation:'glow 2s ease-in-out infinite'}}>
              <AnimatedNumber value={m?.estimated_sales||0}/> <span style={{fontSize:18}}>units</span>
            </div>
          </div>
        </div>
      </div>
      <GlowCard className="fade-up-1" style={{marginBottom:20,display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:24,padding:'32px'}}>
        <ScoreRing value={m?.demand_score||0} label="Demand" color="var(--accent)" delay={0}/>
        <ScoreRing value={m?.competition_score||0} label="Competition" color="var(--danger)" delay={150}/>
        <ScoreRing value={Math.min(100,(m?.demand_score||0)-(m?.competition_score||0)*0.4)} label="Viability" color="var(--accent2)" delay={300}/>
        <ScoreRing value={m?.supplier_cost>0?85:55} label="Data Quality" color="var(--warn)" delay={450}/>
      </GlowCard>
      <div className="fade-up-2" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:20}}>
        {[
          {label:'Supplier Cost',value:`${p?.currency_symbol||'$'}${m?.supplier_cost?.toFixed(2)}`,color:'var(--accent)'},
          {label:'Est. Monthly Sales',value:`${m?.estimated_sales} units`,color:'var(--text)'},
          {label:'Trend Direction',value:m?.trend_direction,color:tc},
          {label:'Top Keywords',value:`${m?.top_keywords?.length||0} found`,color:'var(--accent2)'},
        ].map(({label,value,color})=>(
          <GlowCard key={label} style={{padding:'18px 20px'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=color}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{fontSize:10,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8,fontFamily:'var(--mono)'}}>{label}</div>
            <div style={{fontSize:20,fontFamily:'var(--mono)',fontWeight:700,color}}>{value}</div>
          </GlowCard>
        ))}
      </div>
      <div className="fade-up-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <GlowCard color="var(--accent2)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// TOP KEYWORDS</div>
          {(m?.top_keywords||[]).map((kw,i)=>(
            <div key={kw} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
              <span style={{color:'var(--muted)',fontFamily:'var(--mono)',fontSize:10}}>#{i+1}</span>
              <span style={{color:'var(--text)'}}>{kw}</span>
              <div style={{marginLeft:'auto',height:3,width:60,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${100-(i*15)}%`,background:'var(--accent2)',borderRadius:2}}/>
              </div>
            </div>
          ))}
        </GlowCard>
        <GlowCard color="var(--accent)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>// SCORE BREAKDOWN</div>
          <AnimBar label="Demand Score" value={m?.demand_score||0} color="var(--accent)" delay={0}/>
          <AnimBar label="Competition Score" value={m?.competition_score||0} color="var(--danger)" delay={100}/>
          <AnimBar label="Trend Strength" value={m?.trend_direction==='Rising'?80:m?.trend_direction==='Stable'?50:25} color="var(--warn)" delay={200}/>
          <AnimBar label="Supplier Reliability" value={m?.supplier_cost>0?85:40} color="var(--accent2)" delay={300}/>
        </GlowCard>
      </div>
    </div>
  );
};

/* ─── OPTIMIZE PAGE ───────────────────────────────────────────────────────── */
const OptimizePage = ({data}) => {
  if(!data) return null;
  const o=data.optimization,p=data.profile;
  const rc=o?.risk_level==='Low'?'var(--accent)':o?.risk_level==='Medium'?'var(--warn)':'var(--danger)';
  const curr=p?.currency_symbol||'$';
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// MODULE 3 — PROFIT OPTIMIZATION ENGINE</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em',marginBottom:8}}>Optimization Results</h2>
        <p style={{color:'var(--muted)',fontSize:13}}>7-step MPI math engine — price, margin, volume and inventory optimization.</p>
      </div>
      <GlowCard className="fade-up-1" glow color={rc} style={{marginBottom:20}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:20}}>// MARKET POWER INDEX (MPI)</div>
        <MPIGauge value={o?.market_power_index||0}/>
        <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}>
          <Tag label={`Risk: ${o?.risk_level}`} color={rc}/>
          <Tag label={`MPI: ${o?.market_power_index?.toFixed(3)}`} color="var(--accent2)"/>
          <Tag label={p?.risk_level} color="var(--warn)"/>
        </div>
      </GlowCard>
      <div className="fade-up-2" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[
          {label:'Selling Price',value:`${curr}${o?.selling_price?.toFixed(2)}`,color:'var(--accent)'},
          {label:'Final Margin',value:`${(o?.final_margin*100)?.toFixed(1)}%`,color:'var(--accent)'},
          {label:'Unit Profit',value:`${curr}${o?.unit_profit?.toFixed(2)}`,color:'var(--accent)'},
          {label:'Adjusted Volume',value:`${o?.adjusted_volume} units`,color:'var(--text)'},
          {label:'Monthly Profit',value:`${curr}${o?.monthly_profit?.toLocaleString()}`,color:o?.monthly_profit>0?'var(--accent)':'var(--danger)'},
          {label:'Rec. Inventory',value:`${o?.recommended_inventory} units`,color:'var(--accent2)'},
        ].map(({label,value,color})=>(
          <GlowCard key={label} style={{padding:'18px 20px',transition:'transform .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='';}}>
            <div style={{fontSize:10,color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8,fontFamily:'var(--mono)'}}>{label}</div>
            <div style={{fontSize:20,fontFamily:'var(--mono)',fontWeight:700,color}}>{value}</div>
          </GlowCard>
        ))}
      </div>
      <div className="fade-up-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <GlowCard color="var(--accent)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>// FINANCIAL BREAKDOWN</div>
          <AnimBar label="Profit Margin" value={(o?.final_margin||0)*100} color="var(--accent)" delay={0}/>
          <AnimBar label="MPI Score" value={(o?.market_power_index||0)*100} max={100} color={rc} delay={100}/>
          <AnimBar label="Volume Efficiency" value={Math.min(100,(o?.adjusted_volume||0)/10)} color="var(--accent2)" delay={200}/>
          <AnimBar label="Inventory Coverage" value={Math.min(100,(o?.recommended_inventory||0)/5)} color="var(--warn)" delay={300}/>
        </GlowCard>
        <GlowCard color="var(--accent2)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// VS PROFILE TARGETS</div>
          {[
            ['Target Margin',`${(p?.target_margin*100)?.toFixed(0)}%`,`${(o?.final_margin*100)?.toFixed(1)}%`,o?.final_margin>=p?.target_margin],
            ['Risk Profile',p?.risk_level,o?.risk_level,o?.risk_level!=='High'],
            ['Experience',p?.experience,'Accounted ✔',true],
            ['Platform',p?.platform,'Optimized ✔',true],
          ].map(([label,target,actual,ok])=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
              <span style={{color:'var(--muted)'}}>{label}</span>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span style={{color:'var(--muted)',fontSize:10}}>{target} →</span>
                <span style={{color:ok?'var(--accent)':'var(--danger)',fontWeight:600,fontFamily:'var(--mono)'}}>{actual}</span>
              </div>
            </div>
          ))}
        </GlowCard>
      </div>
    </div>
  );
};

/* ─── SCENARIOS PAGE ──────────────────────────────────────────────────────── */
const ScenariosPage = ({data}) => {
  if(!data?.profit_scenarios) return (
    <div style={{maxWidth:700,margin:'80px auto',padding:'0 32px',textAlign:'center',zIndex:1,position:'relative'}}>
      <GlowCard>
        <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)'}}>
          No scenario data. Run the full pipeline first — profit_scenarios requires the /analyze endpoint.
        </div>
      </GlowCard>
    </div>
  );
  const COLS={conservative:'var(--warn)',expected:'var(--accent)',aggressive:'var(--accent2)'};
  const maxAbs=Math.max(...data.profit_scenarios.map(s=>Math.abs(s.net_profit)),1);
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="f0" style={{marginBottom:28}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// PROFIT SIMULATION ENGINE</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>3-Scenario Forecast</h2>
        <p style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',marginTop:6}}>
          Sales basis: <span style={{color:'var(--accent)'}}>{data.sales_basis==='bsr'?'Amazon BSR (real)':'Demand score (estimated)'}</span>
        </p>
      </div>
      <div className="f1" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
        {data.profit_scenarios.map(s=>{
          const col=COLS[s.scenario.toLowerCase()]||'var(--accent)';
          const neg=s.net_profit<0;
          const isExp=s.scenario.toLowerCase()==='expected';
          return (
            <GlowCard key={s.scenario} glow={isExp} color={col}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <Tag label={s.scenario} color={col}/>
                {isExp&&<span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)'}}>BASE CASE</span>}
              </div>
              <div style={{fontFamily:'var(--mono)',fontWeight:700,fontSize:32,color:neg?'var(--danger)':col,marginBottom:4}}>
                {neg?'−':''}₹{fmt(s.net_profit)}
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginBottom:20}}>NET PROFIT / MONTH</div>
              {[['Units sold',s.estimated_monthly_sales],['Revenue',`₹${fmt(s.revenue)}`],['COGS',`₹${fmt(s.cogs)}`],
                ['Platform fee',`₹${fmt(s.platform_fee)}`],['Ad spend',`₹${fmt(s.ad_spend)}`],
                ['ROI',`${s.roi_percent.toFixed(1)}%`],
                ['Break-even',s.break_even_months===Infinity?'∞':`${s.break_even_months.toFixed(1)} mo`]
              ].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12}}>
                  <span style={{color:'var(--muted)'}}>{l}</span>
                  <span style={{color:'var(--text)'}}>{v}</span>
                </div>
              ))}
            </GlowCard>
          );
        })}
      </div>
      <GlowCard className="f2" color="var(--accent2)">
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// NET PROFIT COMPARISON</div>
        {data.profit_scenarios.map(s=>{
          const col=COLS[s.scenario.toLowerCase()]||'var(--accent)';
          const neg=s.net_profit<0;
          const pct=Math.abs(s.net_profit)/maxAbs*100;
          return (
            <div key={s.scenario} style={{marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:15,textTransform:'uppercase'}}>{s.scenario}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:13,color:neg?'var(--danger)':col,fontWeight:600}}>
                  {neg?'−':''}₹{fmt(s.net_profit)}
                </span>
              </div>
              <div style={{height:32,background:'var(--surface)',borderRadius:4,overflow:'hidden',border:'1px solid var(--border)'}}>
                <div style={{height:'100%',width:`${pct}%`,background:neg?'var(--danger)':col,borderRadius:4,
                  animation:'barIn 1s ease',display:'flex',alignItems:'center',paddingLeft:12,minWidth:80}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--bg)',fontWeight:600}}>{fmt(s.estimated_monthly_sales)} units</span>
                </div>
              </div>
            </div>
          );
        })}
      </GlowCard>
    </div>
  );
};

/* ─── SIGNALS PAGE ────────────────────────────────────────────────────────── */
const SignalsPage = ({data}) => {
  if(!data) return null;
  const m=data.market,p=data.profile;
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// TRANSPARENCY LAYER</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>Raw Market Signals</h2>
      </div>
      <div className="fade-up-1" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <GlowCard color="var(--accent)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>// MARKET SUMMARY</div>
          {[['Demand Score',m?.demand_score?.toFixed(1)],['Competition Score',m?.competition_score?.toFixed(1)],
            ['Trend Direction',m?.trend_direction],['Est. Monthly Sales',`${m?.estimated_sales} units`],
            ['Supplier Cost',`${p?.currency_symbol||'$'}${m?.supplier_cost?.toFixed(2)}`],
          ].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
              <span style={{color:'var(--muted)'}}>{l}</span>
              <span style={{color:'var(--text)',fontFamily:'var(--mono)',fontWeight:600}}>{v||'—'}</span>
            </div>
          ))}
        </GlowCard>
        <GlowCard color="var(--accent2)">
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>// TOP KEYWORDS</div>
          {(m?.top_keywords||[]).slice(0,6).map((kw,i)=>(
            <div key={kw} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:12,alignItems:'center'}}>
              <span style={{width:20,height:20,borderRadius:4,background:'var(--accent2)15',border:'1px solid var(--accent2)30',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--accent2)',
                fontFamily:'var(--mono)',flexShrink:0}}>{i+1}</span>
              <span style={{color:'var(--text)'}}>{kw}</span>
            </div>
          ))}
        </GlowCard>
      </div>
      <GlowCard className="fade-up-2" color="var(--warn)" glow style={{display:'flex',alignItems:'center',gap:28,flexWrap:'wrap'}}>
        <div style={{position:'relative',flexShrink:0}}>
          <svg width={80} height={80} viewBox="0 0 80 80" style={{transform:'rotate(-90deg)'}}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border2)" strokeWidth="5"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--warn)" strokeWidth="5"
              strokeDasharray={`${0.75*2*Math.PI*34} ${2*Math.PI*34}`} strokeLinecap="round"
              style={{filter:'drop-shadow(0 0 8px var(--warn))'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'var(--mono)',fontSize:16,fontWeight:700,color:'var(--warn)'}}>75%</div>
        </div>
        <div>
          <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:18,marginBottom:6}}>Pipeline Data Quality</div>
          <div style={{fontSize:13,color:'var(--muted)',lineHeight:1.7}}>All 3 modules ran successfully. Data from Google Trends, Amazon, keywords and supplier APIs.</div>
          <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
            <Tag label="M1 ✔ Profile" color="var(--accent)"/>
            <Tag label="M2 ✔ Market" color="var(--accent2)"/>
            <Tag label="M3 ✔ Optimized" color="var(--accent3)"/>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};

/* ─── STRATEGY PAGE ───────────────────────────────────────────────────────── */
const StrategyPage = ({data}) => {
  if(!data) return null;
  const m=data.market,o=data.optimization,p=data.profile;
  const rc=o?.risk_level==='Low'?'var(--accent)':o?.risk_level==='Medium'?'var(--warn)':'var(--danger)';
  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// MODULE 2 — LLM STRATEGIC ASSESSMENT</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>AI Strategy Report</h2>
      </div>
      <GlowCard glow color={rc} className="fade-up-1" style={{marginBottom:20}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:12}}>// RISK ASSESSMENT</div>
        <div style={{fontSize:28,fontFamily:'var(--font)',fontWeight:700,color:rc,marginBottom:16,animation:'glow 3s ease-in-out infinite'}}>
          {o?.risk_level} Risk — {p?.niche}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Tag label={`MPI: ${o?.market_power_index?.toFixed(3)}`} color="var(--accent2)"/>
          <Tag label={`Margin: ${(o?.final_margin*100)?.toFixed(1)}%`} color="var(--accent)"/>
          <Tag label={`${p?.risk_level} investor`} color={rc}/>
        </div>
      </GlowCard>
      <GlowCard className="fade-up-2" color="var(--accent)" style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <span style={{fontSize:20,color:'var(--accent)',filter:'drop-shadow(0 0 8px var(--accent))'}}>♟</span>
          <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',textTransform:'uppercase'}}>AI Strategy (Llama3)</span>
        </div>
        <div style={{fontSize:14,color:'var(--text)',lineHeight:1.9,whiteSpace:'pre-line',fontFamily:'var(--mono)'}}>
          {m?.llm_strategy||<span style={{color:'var(--muted)'}}>No strategy available — Ollama may not be running.</span>}
        </div>
      </GlowCard>
      <GlowCard className="fade-up-3">
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:20}}>// DECISION METRICS</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {label:'Demand',value:m?.demand_score,suffix:'/100',color:'var(--accent)'},
            {label:'Competition',value:m?.competition_score,suffix:'/100',color:'var(--danger)'},
            {label:'Margin',value:(o?.final_margin||0)*100,suffix:'%',color:'var(--accent)'},
            {label:'Monthly Profit',value:o?.monthly_profit,suffix:'',color:'var(--warn)',prefix:p?.currency_symbol||'$'},
          ].map(({label,value,suffix,color,prefix})=>(
            <div key={label} style={{textAlign:'center',padding:'16px 8px',background:'var(--surface)',borderRadius:12,border:'1px solid var(--border)'}}>
              <div style={{fontSize:22,fontFamily:'var(--mono)',fontWeight:700,color,animation:'glow 3s ease-in-out infinite'}}>
                <AnimatedNumber value={value||0} suffix={suffix} prefix={prefix||''}/>
              </div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:6,letterSpacing:'.08em',textTransform:'uppercase'}}>{label}</div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
};

/* ─── SETTINGS PAGE ───────────────────────────────────────────────────────── */
const SettingsPage = () => {
  const [settings,setSettings]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  
  useEffect(()=>{
    fetch('http://localhost:8080/settings')
      .then(r=>r.json())
      .then(data=>{setSettings(data);setLoading(false);})
      .catch(()=>{setSettings(null);setLoading(false);});
  },[]);
  
  const handleSave = async (updates) => {
    setSaving(true);
    setMessage('');
    try {
      const resp = await fetch('http://localhost:8080/settings', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
      });
      const data = await resp.json();
      setMessage(data.message || 'Settings updated successfully');
      setTimeout(()=>setMessage(''), 3000);
      // Refresh settings
      const newSettings = await fetch('http://localhost:8080/settings').then(r=>r.json());
      setSettings(newSettings);
    } catch(e) {
      setMessage('Failed to update settings');
    }
    setSaving(false);
  };
  
  if(loading) return (
    <div style={{maxWidth:900,margin:'80px auto',padding:'0 32px',textAlign:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,justifyContent:'center',color:'var(--muted)',fontFamily:'var(--mono)',fontSize:13}}>
        <div style={{width:16,height:16,border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
        Loading settings...
      </div>
    </div>
  );
  
  if(!settings) return (
    <div style={{maxWidth:900,margin:'80px auto',padding:'0 32px'}}>
      <GlowCard color="var(--danger)">
        <div style={{color:'var(--danger)',fontFamily:'var(--mono)',fontSize:14}}>
          Failed to load settings. Check if backend is running.
        </div>
      </GlowCard>
    </div>
  );
  
  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// SYSTEM CONFIGURATION</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>Settings</h2>
      </div>
      
      {message && (
        <GlowCard className="fade-up" color="var(--accent)" style={{marginBottom:20}}>
          <div style={{color:'var(--accent)',fontFamily:'var(--mono)',fontSize:13}}>{message}</div>
        </GlowCard>
      )}
      
      {/* Ollama Configuration */}
      <GlowCard className="fade-up-1" color="var(--accent2)" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <span style={{fontSize:24}}>🤖</span>
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',textTransform:'uppercase'}}>LLM Engine</div>
            <div style={{fontFamily:'var(--font)',fontSize:18,fontWeight:700}}>Ollama Configuration</div>
          </div>
        </div>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Model</div>
            <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--mono)',fontSize:13}}>
              {settings.ollama_model}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Status</div>
            <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:settings.ollama_status==='online'?'var(--accent)':'var(--danger)',
                boxShadow:settings.ollama_status==='online'?'0 0 8px var(--accent)':'none'}}/>
              <span style={{fontFamily:'var(--mono)',fontSize:13,color:settings.ollama_status==='online'?'var(--accent)':'var(--danger)',textTransform:'uppercase'}}>
                {settings.ollama_status}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Base URL</div>
          <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)'}}>
            {settings.ollama_base_url}
          </div>
        </div>
        
        {settings.ollama_status !== 'online' && (
          <div style={{padding:12,background:'var(--danger)15',border:'1px solid var(--danger)40',borderRadius:8,fontSize:12,color:'var(--danger)',fontFamily:'var(--mono)'}}>
            ⚠️ Ollama is offline. Start it with: <code style={{background:'var(--bg)',padding:'2px 6px',borderRadius:4}}>ollama serve</code>
          </div>
        )}
      </GlowCard>
      
      {/* API Keys Status */}
      <GlowCard className="fade-up-2" color="var(--accent)" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <span style={{fontSize:24}}>🔑</span>
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',textTransform:'uppercase'}}>API Integration</div>
            <div style={{fontFamily:'var(--font)',fontSize:18,fontWeight:700}}>API Keys Status</div>
          </div>
        </div>
        
        <div style={{display:'grid',gap:12}}>
          {[
            {name:'SerpAPI',key:'serpapi_configured',desc:'Keyword research (Tier 2)',url:'https://serpapi.com'},
            {name:'Reddit API',key:'reddit_configured',desc:'Trend discovery from discussions',url:'https://www.reddit.com/prefs/apps'},
            {name:'Google Ads API',key:'google_ads_configured',desc:'Keyword research (Tier 1 - most accurate)',url:'https://ads.google.com'},
          ].map(({name,key,desc,url})=>(
            <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font)',fontSize:14,fontWeight:600,marginBottom:4}}>{name}</div>
                <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--mono)'}}>{desc}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:settings[key]?'var(--accent)':'var(--muted)',
                    boxShadow:settings[key]?'0 0 8px var(--accent)':'none'}}/>
                  <span style={{fontFamily:'var(--mono)',fontSize:11,color:settings[key]?'var(--accent)':'var(--muted)',textTransform:'uppercase'}}>
                    {settings[key]?'Configured':'Not Set'}
                  </span>
                </div>
                {!settings[key] && (
                  <a href={url} target="_blank" rel="noopener noreferrer" 
                    style={{fontSize:11,color:'var(--accent2)',textDecoration:'none',fontFamily:'var(--mono)',
                      padding:'4px 8px',border:'1px solid var(--accent2)40',borderRadius:4,transition:'all .2s'}}
                    onMouseEnter={e=>e.target.style.background='var(--accent2)20'}
                    onMouseLeave={e=>e.target.style.background='transparent'}>
                    Get Key →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{marginTop:16,padding:12,background:'var(--accent)10',border:'1px solid var(--accent)30',borderRadius:8,fontSize:12,color:'var(--muted)',fontFamily:'var(--mono)'}}>
          💡 Tip: Add API keys to <code style={{background:'var(--bg)',padding:'2px 6px',borderRadius:4,color:'var(--accent)'}}>.env</code> file and restart backend
        </div>
      </GlowCard>
      
      {/* Database & System Info */}
      <GlowCard className="fade-up-3" color="var(--purple)" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <span style={{fontSize:24}}>💾</span>
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--purple)',letterSpacing:'.15em',textTransform:'uppercase'}}>System Info</div>
            <div style={{fontFamily:'var(--font)',fontSize:18,fontWeight:700}}>Database & Storage</div>
          </div>
        </div>
        
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Database URL</div>
          <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',wordBreak:'break-all'}}>
            {settings.database_url}
          </div>
        </div>
        
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Default Country</div>
            <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--mono)',fontSize:13}}>
              {settings.default_country}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)',letterSpacing:'.08em',textTransform:'uppercase'}}>Default Currency</div>
            <div style={{padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,fontFamily:'var(--mono)',fontSize:13}}>
              {settings.default_currency}
            </div>
          </div>
        </div>
      </GlowCard>
      
      {/* Help & Documentation */}
      <GlowCard className="fade-up-4" color="var(--accent3)">
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <span style={{fontSize:24}}>📚</span>
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent3)',letterSpacing:'.15em',textTransform:'uppercase'}}>Resources</div>
            <div style={{fontFamily:'var(--font)',fontSize:18,fontWeight:700}}>Help & Documentation</div>
          </div>
        </div>
        
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          {[
            {label:'API Documentation',url:'http://localhost:8080/docs',icon:'📖'},
            {label:'Quick Start Guide',url:'#',icon:'🚀'},
            {label:'Testing Guide',url:'#',icon:'🧪'},
            {label:'GitHub Repository',url:'#',icon:'💻'},
          ].map(({label,url,icon})=>(
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'var(--surface)',
                border:'1px solid var(--border)',borderRadius:8,textDecoration:'none',color:'var(--text)',
                transition:'all .2s',cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent3)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';}}>
              <span style={{fontSize:20}}>{icon}</span>
              <span style={{fontFamily:'var(--font)',fontSize:13,fontWeight:600}}>{label}</span>
            </a>
          ))}
        </div>
      </GlowCard>
    </div>
  );
};

/* ─── CONTENT GENERATOR PAGE ──────────────────────────────────────────────── */
const ContentPage = ({data}) => {
  const [form,setForm]=useState({
    product_name:'',product_description:'',product_category:'',target_audience:'',
    key_features:'',keywords:'',
    platforms:['instagram','twitter','facebook'],
    tone:'professional',length:'medium',variations:3,
    include_emojis:true,include_call_to_action:true
  });
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState('');
  const [copied,setCopied]=useState('');

  useEffect(()=>{
    if(data){
      setForm(f=>({...f,
        product_name:data.product_name||'',
        product_description:data.product_description||'',
        product_category:data.category||'',
        target_audience:data.target_audience||'',
        keywords:data.seo_keywords?.join(', ')||''
      }));
    }
  },[data]);

  const generate=async()=>{
    setError('');setLoading(true);setResult(null);
    try{
      const body={
        product_name:form.product_name,
        product_description:form.product_description||null,
        product_category:form.product_category||null,
        target_audience:form.target_audience||null,
        key_features:form.key_features?form.key_features.split(',').map(f=>f.trim()):[],
        keywords:form.keywords?form.keywords.split(',').map(k=>k.trim()):[],
        platforms:form.platforms,
        tone:form.tone,
        length:form.length,
        variations:parseInt(form.variations),
        include_emojis:form.include_emojis,
        include_call_to_action:form.include_call_to_action,
        focus_seo:true
      };
      const res=await fetch('http://localhost:8080/generate-content',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
      });
      if(!res.ok){const e=await res.json();throw new Error(e.detail||'Generation failed');}
      setResult(await res.json());
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  const copyText=(text,label)=>{
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(()=>setCopied(''),2000);
  };

  const platformLabels={
    instagram:'Instagram',twitter:'Twitter/X',facebook:'Facebook',
    linkedin:'LinkedIn',tiktok:'TikTok',pinterest:'Pinterest',
    amazon:'Amazon',etsy:'Etsy',shopify:'Shopify'
  };

  const inp={background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,
    color:'var(--text)',fontFamily:'var(--mono)',fontSize:13,padding:'11px 14px',width:'100%'};

  return (
    <div style={{maxWidth:1400,margin:'0 auto',padding:'60px 32px'}}>
      <div className="f0" style={{marginBottom:36,textAlign:'center'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:12}}>
          MODULE 5 — CONTENT GENERATOR
        </div>
        <h1 style={{fontFamily:'var(--font)',fontSize:52,fontWeight:900,letterSpacing:'-.03em',lineHeight:1.05,marginBottom:16}}>
          SEO Content <span style={{color:'var(--accent)',textShadow:'0 0 24px var(--accent)'}}>Generator</span>
        </h1>
        <p style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',lineHeight:1.8,maxWidth:600,margin:'0 auto'}}>
          Generate platform-optimized content, hashtags, and SEO copy using AI.<br/>
          Perfect for social media, e-commerce, and marketing campaigns.
        </p>
      </div>

      <GlowCard className="f1" glow color="var(--accent)" style={{maxWidth:900,margin:'0 auto 32px'}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:20}}>
          // INPUT
        </div>
        <div style={{display:'grid',gap:14}}>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
              PRODUCT NAME *
            </label>
            <input style={inp} value={form.product_name} onChange={e=>setForm({...form,product_name:e.target.value})}
              placeholder="e.g., Wireless Bluetooth Headphones"/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
              DESCRIPTION (Optional)
            </label>
            <textarea style={{...inp,minHeight:80,resize:'vertical'}} value={form.product_description}
              onChange={e=>setForm({...form,product_description:e.target.value})}
              placeholder="Brief product description..."/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
                CATEGORY
              </label>
              <input style={inp} value={form.product_category}
                onChange={e=>setForm({...form,product_category:e.target.value})}
                placeholder="e.g., Electronics"/>
            </div>
            <div>
              <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
                TARGET AUDIENCE
              </label>
              <input style={inp} value={form.target_audience}
                onChange={e=>setForm({...form,target_audience:e.target.value})}
                placeholder="e.g., Young professionals"/>
            </div>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
              KEY FEATURES (comma-separated)
            </label>
            <input style={inp} value={form.key_features}
              onChange={e=>setForm({...form,key_features:e.target.value})}
              placeholder="e.g., Noise cancelling, 30hr battery, wireless"/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
              SEO KEYWORDS (comma-separated)
            </label>
            <input style={inp} value={form.keywords}
              onChange={e=>setForm({...form,keywords:e.target.value})}
              placeholder="e.g., bluetooth headphones, wireless audio, noise cancelling"/>
          </div>
        </div>

        <div style={{marginTop:24,paddingTop:24,borderTop:'1px solid var(--border)'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>
            // OPTIONS
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:14}}>
            <div>
              <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
                TONE
              </label>
              <select style={inp} value={form.tone} onChange={e=>setForm({...form,tone:e.target.value})}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="luxury">Luxury</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
                LENGTH
              </label>
              <select style={inp} value={form.length} onChange={e=>setForm({...form,length:e.target.value})}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:'var(--muted)',display:'block',marginBottom:6,fontFamily:'var(--mono)'}}>
                VARIATIONS
              </label>
              <input type="number" min="1" max="5" style={inp} value={form.variations}
                onChange={e=>setForm({...form,variations:e.target.value})}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,paddingTop:20}}>
              <label style={{fontSize:11,color:'var(--text)',fontFamily:'var(--mono)',display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={form.include_emojis}
                  onChange={e=>setForm({...form,include_emojis:e.target.checked})}/>
                Emojis
              </label>
              <label style={{fontSize:11,color:'var(--text)',fontFamily:'var(--mono)',display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={form.include_call_to_action}
                  onChange={e=>setForm({...form,include_call_to_action:e.target.checked})}/>
                CTA
              </label>
            </div>
          </div>
        </div>

        <div style={{marginTop:24,paddingTop:24,borderTop:'1px solid var(--border)'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:12}}>
            // PLATFORMS
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {['instagram','twitter','facebook','linkedin','tiktok','pinterest','amazon','etsy','shopify'].map(p=>(
              <label key={p} style={{
                padding:'8px 16px',background:form.platforms.includes(p)?'var(--accent)20':'var(--surface)',
                border:`1px solid ${form.platforms.includes(p)?'var(--accent)':'var(--border)'}`,
                borderRadius:20,fontSize:12,fontFamily:'var(--mono)',cursor:'pointer',
                transition:'all .2s',display:'flex',alignItems:'center',gap:8
              }}>
                <input type="checkbox" checked={form.platforms.includes(p)}
                  onChange={e=>{
                    if(e.target.checked) setForm({...form,platforms:[...form.platforms,p]});
                    else setForm({...form,platforms:form.platforms.filter(x=>x!==p)});
                  }}/>
                {platformLabels[p]}
              </label>
            ))}
          </div>
        </div>

        {error&&<div style={{marginTop:14,padding:'10px 14px',background:'var(--danger)10',
          border:'1px solid var(--danger)30',borderRadius:8,fontFamily:'var(--mono)',fontSize:12,color:'var(--danger)'}}>
          ⚠ {error}
        </div>}

        <button onClick={generate} disabled={loading||!form.product_name} style={{
          marginTop:20,width:'100%',padding:'14px',
          background:loading||!form.product_name?'transparent':'linear-gradient(135deg,var(--accent),var(--accent2))',
          border:loading||!form.product_name?'1px solid var(--border)':'none',
          borderRadius:10,cursor:loading||!form.product_name?'not-allowed':'pointer',
          fontFamily:'var(--mono)',fontWeight:700,fontSize:14,
          color:loading||!form.product_name?'var(--muted)':'var(--bg)',letterSpacing:'.08em',
          ...(loading||!form.product_name?{}:{boxShadow:'0 0 20px var(--accent)30'}),
        }}>{loading?'GENERATING CONTENT...':'GENERATE CONTENT →'}</button>
      </GlowCard>

      {loading&&(
        <GlowCard className="f2" style={{textAlign:'center',padding:'48px 20px',maxWidth:480,margin:'0 auto'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',marginBottom:20}}>
            Generating SEO-optimized content...
          </div>
          <div style={{display:'inline-block',width:36,height:36,border:'3px solid var(--border)',
            borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
        </GlowCard>
      )}

      {result&&!loading&&(
        <>
          <div className="f2" style={{marginBottom:20}}>
            <GlowCard style={{padding:'20px 28px',background:'linear-gradient(135deg,var(--card),var(--accent)06)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
                <div>
                  <SectionLabel color="var(--accent)">Content Generated</SectionLabel>
                  <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:22,marginTop:4}}>
                    {result.product_name}
                  </div>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <Tag label={`${result.variations.length} Variations`} color="var(--accent)"/>
                  <Tag label={result.tone} color="var(--accent2)"/>
                  <Tag label={`${result.generation_time}s`} color="var(--purple)"/>
                </div>
              </div>
            </GlowCard>
          </div>

          <div className="f3" style={{marginBottom:20}}>
            <GlowCard color="var(--accent2)">
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent2)',letterSpacing:'.15em',marginBottom:16}}>
                // UNIVERSAL CONTENT
              </div>
              <div style={{marginBottom:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,color:'var(--muted)',fontFamily:'var(--mono)'}}>Description</span>
                  <button onClick={()=>copyText(result.universal_description,'desc')} style={{
                    padding:'4px 12px',background:'var(--surface)',border:'1px solid var(--border)',
                    borderRadius:6,fontSize:11,color:'var(--text)',cursor:'pointer',fontFamily:'var(--mono)'
                  }}>{copied==='desc'?'✓ Copied':'Copy'}</button>
                </div>
                <div style={{padding:'12px',background:'var(--surface)',borderRadius:8,fontSize:13,lineHeight:1.8}}>
                  {result.universal_description}
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:12,color:'var(--muted)',fontFamily:'var(--mono)'}}>
                    Hashtags ({result.universal_hashtags.length})
                  </span>
                  <button onClick={()=>copyText(result.universal_hashtags.join(' '),'hashtags')} style={{
                    padding:'4px 12px',background:'var(--surface)',border:'1px solid var(--border)',
                    borderRadius:6,fontSize:11,color:'var(--text)',cursor:'pointer',fontFamily:'var(--mono)'
                  }}>{copied==='hashtags'?'✓ Copied':'Copy'}</button>
                </div>
                <div style={{padding:'12px',background:'var(--surface)',borderRadius:8,display:'flex',flexWrap:'wrap',gap:6}}>
                  {result.universal_hashtags.map((h,i)=>(
                    <span key={i} style={{fontSize:12,color:'var(--accent2)',fontFamily:'var(--mono)'}}>{h}</span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{fontSize:12,color:'var(--muted)',fontFamily:'var(--mono)',display:'block',marginBottom:8}}>
                  SEO Keywords ({result.seo_keywords.length})
                </span>
                <div style={{padding:'12px',background:'var(--surface)',borderRadius:8,display:'flex',flexWrap:'wrap',gap:6}}>
                  {result.seo_keywords.map((k,i)=>(
                    <span key={i} style={{
                      padding:'4px 10px',background:'var(--accent2)15',border:'1px solid var(--accent2)30',
                      borderRadius:12,fontSize:11,color:'var(--accent2)',fontFamily:'var(--mono)'
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            </GlowCard>
          </div>

          {result.variations.map((variation,vi)=>(
            <div key={vi} className="f4" style={{marginBottom:20}}>
              <GlowCard>
                <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',letterSpacing:'.15em',marginBottom:16}}>
                  // VARIATION #{variation.variation_number}
                </div>
                <div style={{display:'grid',gap:16}}>
                  {variation.platforms.map((plat,pi)=>(
                    <div key={pi} style={{padding:'16px',background:'var(--surface)',borderRadius:12,
                      border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:16}}>
                          {platformLabels[plat.platform]}
                        </span>
                        {plat.post&&<button onClick={()=>copyText(plat.post+(plat.hashtags?' '+plat.hashtags.join(' '):''),`${vi}-${pi}`)}
                          style={{padding:'4px 12px',background:'var(--card)',border:'1px solid var(--border)',
                            borderRadius:6,fontSize:11,color:'var(--text)',cursor:'pointer',fontFamily:'var(--mono)'}}>
                          {copied===`${vi}-${pi}`?'✓ Copied':'Copy All'}
                        </button>}
                      </div>
                      {plat.post&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>
                            Post ({plat.character_count} chars)
                          </div>
                          <div style={{padding:'10px',background:'var(--card)',borderRadius:6,fontSize:13,
                            lineHeight:1.6,whiteSpace:'pre-wrap'}}>{plat.post}</div>
                        </div>
                      )}
                      {plat.hashtags&&plat.hashtags.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>
                            Hashtags ({plat.hashtags.length})
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                            {plat.hashtags.map((h,hi)=>(
                              <span key={hi} style={{fontSize:11,color:'var(--accent)',fontFamily:'var(--mono)'}}>{h}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {plat.title&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>Title</div>
                          <div style={{padding:'10px',background:'var(--card)',borderRadius:6,fontSize:13,fontWeight:600}}>
                            {plat.title}
                          </div>
                        </div>
                      )}
                      {plat.description&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>Description</div>
                          <div style={{padding:'10px',background:'var(--card)',borderRadius:6,fontSize:13,lineHeight:1.6}}>
                            {plat.description}
                          </div>
                        </div>
                      )}
                      {plat.bullet_points&&plat.bullet_points.length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>
                            Bullet Points
                          </div>
                          <div style={{padding:'10px',background:'var(--card)',borderRadius:6}}>
                            {plat.bullet_points.map((b,bi)=>(
                              <div key={bi} style={{fontSize:13,marginBottom:6,paddingLeft:12,position:'relative'}}>
                                <span style={{position:'absolute',left:0,color:'var(--accent)'}}>•</span>
                                {b}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plat.meta_description&&(
                        <div>
                          <div style={{fontSize:11,color:'var(--muted)',marginBottom:6,fontFamily:'var(--mono)'}}>
                            Meta Description
                          </div>
                          <div style={{padding:'10px',background:'var(--card)',borderRadius:6,fontSize:12,
                            fontStyle:'italic',color:'var(--muted)'}}>{plat.meta_description}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlowCard>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

/* ─── HISTORY PAGE ────────────────────────────────────────────────────────── */
const HistoryPage = () => {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch('http://localhost:8080/history?limit=20')
      .then(r=>r.json()).then(setRecords).catch(()=>setRecords([]))
      .finally(()=>setLoading(false));
  },[]);
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 32px',position:'relative',zIndex:1}}>
      <div className="fade-up" style={{marginBottom:32}}>
        <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',letterSpacing:'.15em',marginBottom:8}}>// PAST ANALYSES</div>
        <h2 style={{fontFamily:'var(--font)',fontSize:32,fontWeight:700,letterSpacing:'-.02em'}}>History</h2>
      </div>
      {loading&&<div style={{display:'flex',alignItems:'center',gap:12,color:'var(--muted)',fontFamily:'var(--mono)',fontSize:13}}>
        <div style={{width:16,height:16,border:'2px solid var(--border)',borderTopColor:'var(--accent)',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>Loading...
      </div>}
      {!loading&&records.length===0&&<GlowCard><div style={{color:'var(--muted)',fontFamily:'var(--mono)',fontSize:13}}>No analyses yet!</div></GlowCard>}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {records.map((r,i)=>{
          const rc2=riskCol(r.risk_level);
          return (
            <GlowCard key={r.id||i} className="fade-up"
              style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap',transition:'transform .2s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateX(4px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{width:36,height:36,borderRadius:8,background:'var(--surface)',border:'1px solid var(--border)',
                display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',flexShrink:0}}>
                #{String(i+1).padStart(2,'0')}
              </div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:16,marginBottom:6}}>
                  {(r.product_name||r.niche||'—').toUpperCase()}
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {[r.platform,r.country].filter(Boolean).map((l,j)=>(
                    <Tag key={j} label={l} color={j===0?'var(--accent2)':'var(--purple)'}/>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                {[
                  {l:'Demand',v:r.demand_score?.toFixed(0),c:'var(--accent)'},
                  {l:'Comp.',v:r.competition_score?.toFixed(0),c:'var(--danger)'},
                  {l:'Margin',v:r.profit_margin!=null?`${r.profit_margin?.toFixed(1)}%`:null,c:'var(--accent)'},
                  {l:'Profit',v:r.estimated_monthly_profit!=null?`₹${fmt(r.estimated_monthly_profit)}`:null,c:r.estimated_monthly_profit>0?'var(--accent)':'var(--danger)'},
                  {l:'Risk',v:r.risk_level,c:rc2},
                ].filter(o=>o.v!=null).map(({l,v,c})=>(
                  <div key={l} style={{textAlign:'center'}}>
                    <div style={{fontSize:16,fontFamily:'var(--mono)',fontWeight:700,color:c}}>{v||'—'}</div>
                    <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--mono)',flexShrink:0}}>
                {r.created_at?new Date(r.created_at).toLocaleDateString('en-IN'):''}
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
};

/* ─── AI CHAT ASSISTANT WIDGET ────────────────────────────────────────────── */
const ChatWidget = ({ currentPage, userData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m your MarketMind AI Assistant. I can help you understand features, explain terminology, and guide you through the platform. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'What is MarketMind?',
    'How do I analyze a product?',
    'Explain demand score'
  ]);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;
    
    // Add user message
    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversation_history: messages.slice(-10), // Last 10 messages for context
          current_page: currentPage,
          user_context: userData
        })
      });
      
      if (!response.ok) throw new Error('Chat failed');
      
      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
      
      // Update suggestions
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
      
      // Handle actions (e.g., navigate to page)
      if (data.action === 'navigate_to' && data.action_data?.page) {
        // This would trigger navigation in parent component
        console.log('Navigate to:', data.action_data.page);
      }
      
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I\'m having trouble connecting right now. Please make sure the backend is running and try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };
  
  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,255,170,0.4), 0 0 40px rgba(0,255,170,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            zIndex: 1000,
            transition: 'all .3s',
            animation: 'glowPulse 2s ease-in-out infinite'
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
          💬
        </button>
      )}
      
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 400,
          height: 600,
          background: 'var(--card)',
          border: '1px solid var(--accent)60',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(0,255,170,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeUp .3s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--accent)20, var(--accent2)20)',
            borderBottom: '1px solid var(--accent)40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }}>
                🤖
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 700 }}>
                  AI Assistant
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  Powered by Gemini
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 24,
                cursor: 'pointer',
                padding: 0,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                transition: 'all .2s'
              }}
              onMouseEnter={e => {
                e.target.style.background = 'var(--danger)20';
                e.target.style.color = 'var(--danger)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'none';
                e.target.style.color = 'var(--muted)';
              }}>
              ×
            </button>
          </div>
          
          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--accent)30, var(--accent2)30)'
                    : 'var(--surface)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--accent)40' : 'var(--border)'}`,
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: 'var(--font)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  gap: 6
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'blink 1.4s infinite both',
                    animationDelay: '0s'
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'blink 1.4s infinite both',
                    animationDelay: '0.2s'
                  }} />
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: 'blink 1.4s infinite both',
                    animationDelay: '0.4s'
                  }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sug)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    fontSize: 12,
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    transition: 'all .2s'
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = 'var(--accent)';
                    e.target.style.background = 'var(--accent)20';
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.background = 'var(--surface)';
                  }}>
                  {sug}
                </button>
              ))}
            </div>
          )}
          
          {/* Input */}
          <div style={{
            padding: 16,
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  fontFamily: 'var(--font)',
                  fontSize: 14,
                  resize: 'none',
                  minHeight: 44,
                  maxHeight: 120,
                  outline: 'none',
                  transition: 'border-color .2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                rows={1}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: input.trim() && !loading
                    ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                    : 'var(--border)',
                  border: 'none',
                  color: input.trim() && !loading ? 'var(--bg)' : 'var(--muted)',
                  fontSize: 20,
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s',
                  flexShrink: 0
                }}
                onMouseEnter={e => {
                  if (input.trim() && !loading) {
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'scale(1)';
                }}>
                ↑
              </button>
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 10,
              color: 'var(--muted)',
              fontFamily: 'var(--mono)',
              textAlign: 'center'
            }}>
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ─── ROOT ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [tab,setTab]                         = useState('discover');
  const [result,setResult]                   = useState(null);
  const [apiOk,setApiOk]                     = useState(false);
  const [selectedProduct,setSelectedProduct] = useState('');

  useEffect(()=>{
    fetch('http://localhost:8080/health').then(r=>r.ok&&setApiOk(true)).catch(()=>setApiOk(false));
  },[]);

  const handleResult         = useCallback(data=>{ setResult(data); setTab('profile'); },[]);
  const handleSelectProduct  = useCallback(product=>{ setSelectedProduct(product); setTab('analyze'); },[]);

  return (
    <>
      <GlobalStyles/>
      <Particles/>
      <Nav tab={tab} setTab={setTab} hasResults={!!result} apiOk={apiOk}/>
      <main style={{position:'relative',zIndex:1}}>
        {tab==='discover'  && <DiscoverPage  onSelectProduct={handleSelectProduct}/>}
        {tab==='analyze'   && <AnalyzePage   onResult={handleResult} initialProduct={selectedProduct}/>}
        {tab==='profile'   && <ProfilePage   data={result}/>}
        {tab==='results'   && <ResultsPage   data={result}/>}
        {tab==='optimize'  && <OptimizePage  data={result}/>}
        {tab==='scenarios' && <ScenariosPage data={result}/>}
        {tab==='signals'   && <SignalsPage   data={result}/>}
        {tab==='strategy'  && <StrategyPage  data={result}/>}
        {tab==='content'   && <ContentPage   data={result}/>}
        {tab==='history'   && <HistoryPage/>}
      </main>
      <ChatWidget currentPage={tab} userData={result} />
    </>
  );
}