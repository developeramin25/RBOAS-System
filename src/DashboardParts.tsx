import {useState} from 'react'
import type {FormEvent,ReactNode} from 'react'
import {ArrowLeft,ArrowRight,CheckCircle2,Clock,Eye,EyeOff,HelpCircle,Lock,Printer,ShieldCheck,X} from 'lucide-react'
import {callApi,fmtDate,roleLabel,STORES,supabase,TRAINING_CATEGORIES} from './lib'
import type {Assessment,ExamReport,ExamState,Question,StaffProfile,UserRole} from './lib'

function Dialog({title,children,close}:{title:string;children:ReactNode;close:()=>void}){
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <section className="modal-dialog" role="dialog" aria-modal="true" aria-label={title}>
   <header><h2>{title}</h2><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19}/></button></header>
   {children}
  </section>
 </div>
}
function StoreSelect({value,onChange,disabled=false}:{value:string;onChange:(s:string)=>void;disabled?:boolean}){
 return <select value={value} disabled={disabled} required onChange={e=>onChange(e.target.value)}>
   <option value="">Select store location</option>
   {STORES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
  </select>
}
export function InviteModal({role,profile,close,confirm}:{role:UserRole;profile:StaffProfile;close:()=>void;confirm:(payload:Record<string,unknown>)=>Promise<void>}){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[store,setStore]=useState(profile.store_code||'')
 const [code,setCode]=useState(''),[busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('')
  if(role==='manager'&&store!==profile.store_code){setError('You can only invite trainees for your assigned store.');return}
  if(!store){setError('Select a store for the trainee.');return}
  setBusy(true)
  try{await confirm({display_name:name.trim(),email:email.trim().toLowerCase(),store_code:store,employee_code:code.trim(),role:'trainee'})}
  catch(err){setError(err instanceof Error?err.message:'Unable to invite trainee')}
  finally{setBusy(false)}
 }
 return <Dialog close={close} title="Create trainee credentials">
  <div className="modal-description">Issue secure access to a trainee. They will receive an email invitation and create their own password.</div>
  <form className="modal-form" onSubmit={submit}>
    <label>Full name<input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="New trainee name"/></label>
    <label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="trainee@company.com"/></label>
    <label>Store location<StoreSelect value={store} disabled={role==='manager'} onChange={setStore}/></label>
    <label>Employee ID (optional)<input value={code} onChange={e=>setCode(e.target.value)} placeholder="Employee number"/></label>
    <div className="notice-banner"><ShieldCheck size={18}/> Role: Trainee. Managers and HR cannot assign administrative access.</div>
    {error&&<div className="feedback error">{error}</div>}
    <button className="button-blue" disabled={busy} type="submit">{busy?'Sending invitation…':'Create & invite trainee'} <ArrowRight size={17}/></button>
  </form>
 </Dialog>
}
export function AssignModal({people,assessments,close,confirm}:{people:StaffProfile[];assessments:Assessment[];close:()=>void;confirm:(payload:Record<string,unknown>)=>Promise<void>}){
 const [trainee,setTrainee]=useState(''),[assessment,setAssessment]=useState('')
 const [from,setFrom]=useState(''),[due,setDue]=useState('')
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const published=assessments.filter(x=>x.published)
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('')
  if(!trainee||!assessment){setError('Select the trainee and a published assessment.');return}
  setBusy(true)
  try{await confirm({trainee_id:trainee,assessment_id:assessment,
     available_from:from?new Date(from).toISOString():null,due_at:due?new Date(due).toISOString():null})}
  catch(err){setError(err instanceof Error?err.message:'Unable to assign exam')}
  finally{setBusy(false)}
 }
 return <Dialog title="Assign an assessment" close={close}>
  <div className="modal-description">An official assessment must be published before it can be assigned.</div>
  <form className="modal-form" onSubmit={submit}>
   <label>Trainee<select required value={trainee} onChange={e=>setTrainee(e.target.value)}>
    <option value="">Select a trainee</option>{people.filter(x=>x.active).map(p=><option key={p.id} value={p.id}>{p.display_name} · {p.store_code||'Store'}</option>)}
   </select></label>
   <label>Assessment<select required value={assessment} onChange={e=>setAssessment(e.target.value)}>
    <option value="">Select published exam</option>{published.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}
   </select></label>
   <label>Available from (optional)<input type="datetime-local" value={from} onChange={e=>setFrom(e.target.value)}/></label>
   <label>Due date (optional)<input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label>
   {published.length===0&&<div className="feedback warning">No exams are published. The administrator must approve questions and publish the assessment first.</div>}
   {error&&<div className="feedback error">{error}</div>}
   <button className="button-blue" disabled={busy||!published.length} type="submit">Assign assessment <ArrowRight size={17}/></button>
  </form>
 </Dialog>
}
export function QuestionModal({initial,close,confirm}:{initial:(Question &{options:string[];correct:number})|null;close:()=>void;confirm:(payload:Record<string,unknown>)=>Promise<void>}){
 const [category,setCategory]=useState(initial?.category||TRAINING_CATEGORIES[0])
 const [prompt,setPrompt]=useState(initial?.prompt||'')
 const [options,setOptions]=useState(initial?.options||['','','',''])
 const [correct,setCorrect]=useState(initial?.correct||0)
 const [error,setError]=useState(''),[busy,setBusy]=useState(false)
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');setBusy(true)
  try{await confirm({id:initial?.id||undefined,category,prompt,options,correct,difficulty:initial?.difficulty||'basic'})}
  catch(err){setError(err instanceof Error?err.message:'Unable to save question')}
  finally{setBusy(false)}
 }
 return <Dialog title={initial?'Review & edit question':'Add draft question'} close={close}>
  <div className="modal-description">Question updates remain drafts until they are reapproved by an administrator.</div>
  <form className="modal-form" onSubmit={submit}>
   <label>Training topic<select value={category} onChange={e=>setCategory(e.target.value)}>{TRAINING_CATEGORIES.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   <label>Question<textarea rows={3} maxLength={2000} required minLength={10} value={prompt} onChange={e=>setPrompt(e.target.value)}/></label>
   {options.map((value,i)=><label key={i}>Answer {String.fromCharCode(65+i)}
    <input required value={value} maxLength={400} onChange={e=>setOptions(prev=>prev.map((p,j)=>j===i?e.target.value:p))}/></label>)}
   <label>Correct answer<select value={correct} onChange={e=>setCorrect(Number(e.target.value))}>
    {options.map((_x,i)=><option key={i} value={i}>{String.fromCharCode(65+i)}</option>)}</select></label>
   {error&&<div className="feedback error">{error}</div>}
   <button className="button-blue" disabled={busy} type="submit">{busy?'Saving…':'Save as draft'}<ArrowRight size={17}/></button>
  </form>
 </Dialog>
}
export function ExamView({exam,index,remaining,saving,setIndex,answer,submit,close}:{
 exam:ExamState;index:number;remaining:number;saving:boolean;setIndex:(index:number)=>void;
 answer:(index:number)=>void;submit:()=>void;close:()=>void
}){
 if(exam.attempt.status==='submitted')return <div className="exam-page"><button className="button-outline" onClick={close}><ArrowLeft size={16}/>Back to assessments</button>
  <div className="exam-result"><CheckCircle2 size={42}/><h2>Assessment completed</h2>
  <strong>{exam.attempt.score_percent}%</strong><p>{exam.attempt.passed?'Passed':'Manager review recommended'}</p>
  <span>Your results have been saved securely.</span></div></div>
 const q=exam.questions[index],answered=Object.keys(exam.answers).length
 if(!q)return <div className="exam-page"><p>No questions were loaded. Contact your manager.</p><button onClick={close}>Back</button></div>
 const time=Math.floor(remaining/60).toString().padStart(2,'0')+':'+(remaining%60).toString().padStart(2,'0')
 return <section className="exam-page">
  <div className="exam-top"><div><div className="eyebrow-text">OFFICIAL BILLING ASSESSMENT</div><h1>Knowledge assessment</h1></div>
   <div className={'exam-time '+(remaining<180?'urgent':'')}><Clock size={19}/>{time}</div></div>
  <div className="notice-banner">Your answers save after each selection. The system automatically submits at the time limit.</div>
  <div className="exam-meta">Question {index+1} of {exam.questions.length} <span>{answered} answered</span><span>{q.category}</span></div>
  <div className="progress-track"><div style={{width:100*answered/exam.questions.length+'%'}}/></div>
  <CardExam><div className="eyebrow-text">CHOOSE ONE ANSWER</div><h2>{q.prompt}</h2>
   <div className="exam-options">{q.options.map((opt,i)=><button disabled={saving||remaining===0} key={i}
     className={exam.answers[q.id]===i?'chosen':''} onClick={()=>answer(i)}>
      <span>{String.fromCharCode(65+i)}</span>{opt}</button>)}</div>
   <div className="exam-actions"><button className="button-outline" disabled={!index||saving} onClick={()=>setIndex(index-1)}>Previous</button>
     {index===exam.questions.length-1?<button className="button-blue" disabled={saving} onClick={submit}>Submit assessment <ArrowRight size={17}/></button>:
      <button className="button-blue" onClick={()=>setIndex(index+1)}>Next question <ArrowRight size={17}/></button>}</div>
   <p className="muted">Jump to a question</p><div className="exam-jumps">{exam.questions.map((v,i)=><button key={v.id} className={i===index?'current':exam.answers[v.id]!==undefined?'answered':''} onClick={()=>setIndex(i)}>{i+1}</button>)}</div>
  </CardExam>
 </section>
}
function CardExam({children}:{children:ReactNode}){return <div className="panel-card exam-card">{children}</div>}
export function ReportView({report,close}:{report:ExamReport;close:()=>void}){
 const {trainee,attempt}=report
 return <div className="report-page"><div className="section-header"><div><div className="eyebrow-text">ASSESSMENT PERFORMANCE REVIEW</div><h1>Individual assessment report</h1>
  <p>Training & development · RBOAS</p></div>
  <div className="actions"><button className="button-outline" onClick={close}><ArrowLeft size={16}/>Back</button>
   <button className="button-blue" onClick={()=>window.print()}><Printer size={16}/>Print report</button></div></div>
  <div className="panel-card report-inner"><div className="report-person"><div><h2>{trainee.display_name}</h2>
    <p>Store {trainee.store_code||'—'} · Employee {trainee.employee_code||'—'}</p>
    <p>Submitted {fmtDate(attempt.submitted_at)}</p></div><div className="report-score"><strong>{attempt.score_percent}%</strong>
      <small>{attempt.passed?'PASS':'TRAINING REVIEW'}</small></div></div>
  <div className="report-mini"><div><span>Correct answers</span><strong>{attempt.correct_count}/{attempt.total}</strong></div>
    <div><span>Answered</span><strong>{attempt.answered}/{attempt.total}</strong></div>
    <div><span>Recommended outcome</span><strong>{attempt.passed?'Passed':'Review needed'}</strong></div></div>
  <h3>Skills breakdown</h3><p className="muted">Training priorities from this individual evaluation.</p>
  {attempt.category_breakdown.map(c=><div className="category-track" key={c.category}>
   <span>{c.category}</span><div className="track"><div style={{width:c.total?100*c.correct/c.total+'%':'0%'}}/></div><b>{c.correct}/{c.total}</b></div>)}
  <div className="report-note"><HelpCircle size={19}/> Exam results support training decisions, but practical billing competency must also be reviewed by a supervisor.</div>
  </div></div>
}
export function SettingsPanel({role,profile,notify,refresh}:{role:UserRole;profile:StaffProfile;notify:(message:string)=>void;refresh:()=>Promise<void>}){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false)
 async function change(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  if(password.length<12||password!==confirm){notify('Enter matching passwords of at least 12 characters.');return}
  setBusy(true)
  try{const {error}=await supabase.auth.updateUser({password});if(error)throw error
   setPassword('');setConfirm('');notify('Your password has been updated.');await refresh()
  }catch(err){notify(err instanceof Error?err.message:'Unable to change password')}
  finally{setBusy(false)}
 }
 return <><div className="section-header"><div><h1>Workspace settings</h1><p>Your account identity and access controls.</p></div></div>
  <div className="content-columns"><div className="panel-card"><h3>Account information</h3><div className="settings-item"><span>Name</span><strong>{profile.display_name}</strong></div>
   <div className="settings-item"><span>Work email</span><strong>{profile.email}</strong></div>
   <div className="settings-item"><span>Access role</span><strong>{roleLabel(role)}</strong></div>
   <div className="settings-item"><span>Store</span><strong>{profile.store_code||'Organization-wide'}</strong></div>
   <div className="settings-item"><span>Status</span><strong>Active</strong></div></div>
  <div className="panel-card"><h3>Change password</h3><p className="muted">Your password is managed by Supabase Authentication.</p>
   <form className="modal-form" onSubmit={change}><label>New password<div className="inline-password"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required/>
    <button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
    <label>Confirm password<input type={show?'text':'password'} value={confirm} minLength={12} required onChange={e=>setConfirm(e.target.value)}/></label>
    <button className="button-blue" type="submit" disabled={busy}><Lock size={17}/>{busy?'Updating…':'Update password'}</button></form></div></div>
  <div className="notice-banner" style={{marginTop:20}}><ShieldCheck size={18}/>Only administrators can approve Manager or HR account requests. Managers and HR issue trainee invitations from Trainee management.</div>
 </>}
