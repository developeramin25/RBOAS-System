import {useEffect,useState} from 'react'
import {ArrowLeft,ArrowRight,BarChart3,BookOpenCheck,CheckCircle2,Clock,ShieldCheck,Users} from 'lucide-react'
import {DEMO_BANK} from './demoBank'

type DemoItem={category:string;prompt:string;options:string[];correct:number}
const CATS=['ERX Processing','Refill Processing','Insurance & Rejections','LTC Billing','Coupons & Follow-Up']
const shuffle=<T,>(rows:T[])=>{
  const a=[...rows]
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a
}
function generate():DemoItem[]{
  return shuffle(CATS.flatMap(category=>shuffle(DEMO_BANK.filter(q=>q.category===category)).slice(0,5)))
    .map(q=>{
      const options=shuffle(q.options.map((text,index)=>({text,index})))
      return {category:q.category,prompt:q.prompt,options:options.map(x=>x.text),
        correct:options.findIndex(x=>x.index===q.correct)}
    }))
}
export default function Demo({go}:{go:(route:string)=>void}){
  const [mode,setMode]=useState<'tour'|'quiz'|'result'>('tour')
  const [items,setItems]=useState<DemoItem[]>([])
  const [idx,setIdx]=useState(0)
  const [choices,setChoices]=useState<Record<number,number>>({})
  const [endsAt,setEndsAt]=useState(0)
  const [remaining,setRemaining]=useState(1800)
  const start=()=>{
    setItems(generate());setChoices({});setIdx(0);setEndsAt(Date.now()+1800000);setRemaining(1800);setMode('quiz')
  }
  useEffect(()=>{
    if(mode!=='quiz')return
    const tick=()=>{
      const n=Math.max(0,Math.ceil((endsAt-Date.now())/1000))
      setRemaining(n)
      if(n===0)setMode('result')
    }
    tick();const handle=setInterval(tick,1000);return ()=>clearInterval(handle)
  },[mode,endsAt])
  const correct=items.reduce((sum,q,i)=>sum+(choices[i]===q.correct?1:0),0)
  const total=Object.keys(choices).length
  const score=items.length?Math.round(100*correct/items.length):0
  const time=Math.floor(remaining/60).toString().padStart(2,'0')+':'+(remaining%60).toString().padStart(2,'0')
  return <div className="demo-shell">
    <header className="demo-header"><div className="brand-small"><BookOpenCheck size={22}/>RBOAS <span>MANAGEMENT PREVIEW</span></div>
      <div><span className="status-badge warning">Sample data only</span><button className="button-outline" onClick={()=>go('/login')}>Staff login <ArrowRight size={16}/></button></div></header>
    {mode==='tour'&&<main className="demo-content">
      <div className="demo-hero"><div className="eyebrow-text">A SMARTER WAY TO EVALUATE REMOTE BILLING</div>
        <h1>Training progress. Clearer decisions.</h1>
        <p>Explore an interactive RBOAS assessment demonstration. Sample records are fictional and no real employee scores are saved.</p>
        <button className="button-blue" onClick={start}>Try randomized 25-question quiz <ArrowRight size={18}/></button>
      </div>
      <div className="stats-grid">
        <div className="panel-card stat-card"><div className="stat-top"><span>Training categories</span><BookOpenCheck size={20}/></div><strong>5</strong><small>Generic demo topics</small></div>
        <div className="panel-card stat-card"><div className="stat-top"><span>Question samples</span><Users size={20}/></div><strong>50</strong><small>Public illustrative questions</small></div>
        <div className="panel-card stat-card"><div className="stat-top"><span>Exam length</span><Clock size={20}/></div><strong>25</strong><small>Random questions</small></div>
        <div className="panel-card stat-card"><div className="stat-top"><span>Passing benchmark</span><BarChart3 size={20}/></div><strong>80%</strong><small>Suggested review threshold</small></div>
      </div>
      <div className="content-columns"><div className="panel-card"><h3>How RBOAS works</h3>
        {['Manager/HR creates trainee credentials','Administrator reviews the question bank',
          '25 random approved questions are assigned','Server grades the completed assessment','Manager reviews outcomes and training gaps'].map((v,i)=>
          <div className="tour-line" key={v}><span>{i+1}</span>{v}</div>)}
      </div><div className="panel-card"><h3>Preview availability</h3>
        <p className="muted">This public tour is safe to show management. The official questions, employee accounts, and results require verified Supabase access.</p>
        <div className="notice-banner"><ShieldCheck size={17}/>Sample content only — separate from the protected official assessment bank.</div>
        <button className="button-outline" onClick={()=>go('/register')}>Explore staff registration <ArrowRight size={16}/></button>
      </div></div>
    </main>}
    {mode==='quiz'&&items[idx]&&<main className="demo-content exam-page">
      <div className="exam-top"><div><div className="eyebrow-text">PRESENTATION PRACTICE · NOT AN OFFICIAL EXAM</div>
        <h1>Practice assessment</h1></div><div className="exam-time"><Clock size={18}/>{time}</div></div>
      <div className="exam-meta">Question {idx+1} of {items.length} <span>{total} answered</span><span>{items[idx].category}</span></div>
      <div className="progress-track"><div style={{width:100*total/items.length+'%'}}/></div>
      <div className="panel-card exam-card"><div className="eyebrow-text">SELECT ONE ANSWER</div>
        <h2>{items[idx].prompt}</h2>
        <div className="exam-options">{items[idx].options.map((o,i)=><button key={o}
          className={choices[idx]===i?'chosen':''} onClick={()=>setChoices(v=>({...v,[idx]:i}))}>
          <span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
        <div className="exam-actions"><button disabled={!idx} className="button-outline" onClick={()=>setIdx(idx-1)}>Previous</button>
          {idx===items.length-1?<button className="button-blue" onClick={()=>setMode('result')}>Submit practice <ArrowRight size={17}/></button>:
          <button className="button-blue" onClick={()=>setIdx(idx+1)}>Next question <ArrowRight size={17}/></button>}</div>
        <p className="muted">Jump to any question</p><div className="exam-jumps">{items.map((q,i)=><button key={q.prompt}
          className={i===idx?'current':choices[i]!==undefined?'answered':''} onClick={()=>setIdx(i)}>{i+1}</button>)}</div>
      </div>
    </main>}
    {mode==='result'&&<main className="demo-content"><div className="panel-card demo-result"><CheckCircle2 size={42}/>
      <h1>Practice complete</h1><strong>{score}%</strong><p>{correct} of {items.length} answers correct · {total} answered</p>
      <span className="status-badge">{score>=80?'Sample passing threshold met':'Further practice recommended'}</span>
      <div className="demo-breakdown">{CATS.map(c=>{
        const indexes=items.map((q,i)=>({q,i})).filter(v=>v.q.category===c)
        const count=indexes.filter(v=>choices[v.i]===v.q.correct).length
        return <div className="category-track" key={c}><span>{c}</span><div className="track"><div style={{width:100*count/5+'%'}}/></div><b>{count}/5</b></div>
      })}</div>
      <p className="muted">Demonstration only; this score is not saved as an employee record.</p>
      <div className="actions"><button className="button-blue" onClick={start}>Try another random test <ArrowRight size={17}/></button>
        <button className="button-outline" onClick={()=>setMode('tour')}><ArrowLeft size={17}/>Back to tour</button></div>
    </div></main>}
  </div>
}
