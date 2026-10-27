import {useCallback,useEffect,useMemo,useState} from 'react'
import type {FormEvent,ReactNode} from 'react'
import {
  Activity,ArrowLeft,ArrowRight,BarChart3,BookOpenCheck,CheckCircle2,ClipboardCheck,
  Clock,Download,FileText,HelpCircle,LayoutDashboard,Lock,LogOut,Mail,
  MapPin,Plus,Printer,Search,Settings,ShieldCheck,UserPlus,Users,X
} from 'lucide-react'
import {callApi,fmtDate,roleLabel,shortName,STORES,supabase,TRAINING_CATEGORIES} from './lib'
import type {AccessRequest,Assignment,Assessment,Attempt,ExamReport,ExamState,OverviewData,Question,StaffProfile,UserRole} from './lib'
import type {Identity} from './useAuth'

type Props={identity:Identity;go:(route:string)=>void;notify:(message:string)=>void;refresh:()=>Promise<void>}
type Section='overview'|'trainees'|'requests'|'questions'|'assessments'|'results'|'settings'
type ModalName='invite'|'assign'|'question'|null
const tabs:[Section,string,typeof LayoutDashboard][]=[
  ['overview','Overview',LayoutDashboard],
  ['trainees','Trainees',Users],
  ['requests','Access requests',ShieldCheck],
  ['questions','Question bank',BookOpenCheck],
  ['assessments','Assessments',ClipboardCheck],
  ['results','Results & reports',BarChart3],
  ['settings','Settings',Settings],
]
function Card({children,className=''}:{children:ReactNode;className?:string}){
  return <div className={'panel-card '+className}>{children}</div>
}
function Empty({message,description}:{message:string;description:string}){
  return <div className="empty-state"><BookOpenCheck size={29}/><h3>{message}</h3><p>{description}</p></div>
}
function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="modal-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></header>
      {children}
    </section>
  </div>
}
function badge(value:string,kind:'success'|'warning'|'neutral'='neutral'){
  return <span className={'status-badge '+kind}>{value}</span>
}
function Heading({title,description,actions}:{title:string;description:string;actions?:ReactNode}){
  return <div className="section-header"><div><h1>{title}</h1><p>{description}</p></div><div className="actions">{actions}</div></div>
}
function initialsAvatar(user:StaffProfile){return <span className="row-avatar">{shortName(user.display_name)}</span>}
function Stat({icon:Icon,label,value,sub}:{icon:typeof LayoutDashboard;label:string;value:string|number;sub:string}){
  return <Card className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={20}/></div></div>
    <strong>{value}</strong><small>{sub}</small></Card>
}
function buildCSV(rows:(string|number|boolean|null|undefined)[][]){
  const esc=(value:unknown)=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
  const text=rows.map(row=>row.map(esc).join(',')).join('\r\n')
  const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}))
  const a=document.createElement('a');a.href=url;a.download='rboas-results.csv';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),500)
}
export default function Dashboard({identity,go,notify,refresh}:Props){
  const role=identity.role as UserRole
  const me=identity.profile as StaffProfile
  const staff=role!=='trainee'
  const admin=role==='admin'
  const [section,setSection]=useState<Section>('overview')
  const [data,setData]=useState<OverviewData|null>(null)
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState<ModalName>(null)
  const [editQuestionInitial,setEditQuestionInitial]=useState<(Question & {options:string[];correct:number})|null>(null)
  const [requests,setRequests]=useState<AccessRequest[]>([])
  const [search,setSearch]=useState('')
  const [report,setReport]=useState<ExamReport|null>(null)
  const [exam,setExam]=useState<ExamState|null>(null)
  const [examIndex,setExamIndex]=useState(0)
  const [savingAnswer,setSavingAnswer]=useState(false)
  const [remaining,setRemaining]=useState(0)
  const [pendingSubmit,setPendingSubmit]=useState(false)
  const load=useCallback(async()=>{
    setLoading(true)
    try{
      const d=await callApi<OverviewData>('team_overview')
      setData(d)
      if(admin){
        const r=await callApi<AccessRequest[]>('staff_requests')
        setRequests(r)
      }
    }catch(err){notify(err instanceof Error?err.message:'Could not load the dashboard')}
    finally{setLoading(false)}
  },[admin,notify])
  useEffect(()=>{void load()},[load])
  useEffect(()=>{
    if(!exam||exam.attempt.status!=='in_progress')return
    const tick=()=>setRemaining(Math.max(0,Math.ceil((Date.parse(exam.attempt.expires_at)-Date.now())/1000)))
    tick()
    const id=setInterval(tick,1000)
    return ()=>clearInterval(id)
  },[exam])
  const people=(data?.people||[]).filter(p=>p.id!==me.id&&!!p.manager_id)
  const visiblePeople=people.filter(p=>(p.display_name+' '+p.email+' '+p.store_code).toLowerCase().includes(search.toLowerCase()))
  const attempts=data?.attempts||[]
  const completed=attempts.filter(a=>a.status==='submitted')
  const avg=completed.length?Math.round(completed.reduce((sum,a)=>sum+Number(a.score_percent||0),0)/completed.length):0
  const pass=completed.filter(a=>a.passed).length
  const approved=(data?.questions||[]).filter(q=>q.active).length
  const draft=(data?.questions||[]).filter(q=>!q.active).length
  const published=data?.assessments.find(a=>a.published)
  const pendingRequests=requests.filter(r=>r.status==='pending')
  const assigned=data?.assignments||[]
  const assignmentById=useMemo(()=>new Map((data?.assignments||[]).map(a=>[a.id,a])),[data])
  const peopleById=useMemo(()=>new Map((data?.people||[]).map(p=>[p.id,p])),[data])
  async function perform(fn:()=>Promise<unknown>,success:string){
    try{await fn();notify(success);await load();setModal(null)}
    catch(err){notify(err instanceof Error?err.message:'Action failed')}
  }
  async function logout(){await supabase.auth.signOut();await refresh();go('/login')}
  async function openExam(assignment:Assignment){
    try{
      const started=await callApi<{attempt_id:string}>('exam_start',{assignment_id:assignment.id})
      let e=await callApi<ExamState>('exam_get',{attempt_id:started.attempt_id})
      if(e.attempt.status==='in_progress'&&Date.now()>=Date.parse(e.attempt.expires_at)){
        await callApi('exam_submit',{attempt_id:started.attempt_id})
        e=await callApi<ExamState>('exam_get',{attempt_id:started.attempt_id})
      }
      setExam(e);setExamIndex(0);setRemaining(Math.max(0,Math.ceil((Date.parse(e.attempt.expires_at)-Date.now())/1000)))
    }catch(err){notify(err instanceof Error?err.message:'Could not start assessment')}
  }
  async function chooseAnswer(index:number){
    if(!exam||savingAnswer)return
    const question=exam.questions[examIndex]
    setSavingAnswer(true)
    try{
      await callApi('exam_answer',{attempt_id:exam.attempt.id,question_id:question.id,selected_index:index})
      setExam({...exam,answers:{...exam.answers,[question.id]:index}})
    }catch(err){notify(err instanceof Error?err.message:'Unable to save answer')}
    finally{setSavingAnswer(false)}
  }
  async function finishExam(auto=false){
    if(!exam||pendingSubmit)return
    if(!auto&&!window.confirm('Submit the assessment? Your answers cannot be changed afterward.'))return
    setPendingSubmit(true)
    try{
      const result=await callApi<{score_percent:number;passed:boolean}>('exam_submit',{attempt_id:exam.attempt.id})
      setExam({...exam,attempt:{...exam.attempt,status:'submitted',score_percent:result.score_percent,passed:result.passed}})
      await load()
      notify('Your assessment has been submitted.')
    }catch(err){notify(err instanceof Error?err.message:'Unable to submit exam')}
    finally{setPendingSubmit(false)}
  }
  useEffect(()=>{
    if(exam?.attempt.status==='in_progress'&&remaining===0&&!pendingSubmit){
      void finishExam(true)
    }
    // Submitting only upon expiry; expiry time comes from the trusted server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[remaining,exam?.attempt.id,exam?.attempt.status,pendingSubmit])
  async function openReport(id:string){
    try{const d=await callApi<ExamReport>('report_attempt',{attempt_id:id});setReport(d)}
    catch(err){notify(err instanceof Error?err.message:'Unable to retrieve report')}
  }
  const allowedTabs=tabs.filter(([key])=>{
    if(role==='trainee')return ['overview','assessments','results','settings'].includes(key)
    if(role!=='admin')return key!=='requests'&&key!=='questions'
    return true
  })
  const title=section==='overview'?'Overview':section==='trainees'?'Trainees':
    section==='requests'?'Staff access requests':section==='questions'?'Question bank':
    section==='assessments'?'Assessments':section==='results'?'Results & reports':'Settings'
  if(loading&&!data)return <div className="loading-screen"><BookOpenCheck size={30}/>Loading your secure workspace…</div>
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="side-logo"><div><BookOpenCheck size={23}/></div><span>RBOAS<small>ASSESSMENT SYSTEM</small></span></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">{allowedTabs.map(([key,label,Icon])=>
        <button key={key} className={section===key?'selected':''} onClick={()=>{setSection(key);setReport(null);setExam(null);setSearch('')}}>
          <Icon size={18}/>{label}{key==='requests'&&pendingRequests.length>0&&<em>{pendingRequests.length}</em>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="side-tip"><ShieldCheck size={19}/><strong>Secure training workspace</strong>
        <span>Employee access, question review and results stay protected by Supabase permissions.</span></div>
        <button className="side-signout" onClick={()=>{void logout()}}><LogOut size={17}/>Sign out</button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <span className="breadcrumbs">Workspace <span>/</span> <strong>{title}</strong></span>
        <div className="top-right"><span className="role-chip"><ShieldCheck size={14}/>{roleLabel(role)}</span>
          <span className="person-avatar">{shortName(me.display_name)}</span></div>
      </header>
      {report? <ReportView report={report} close={()=>setReport(null)}/>:
        exam? <ExamView exam={exam}index={examIndex}remaining={remaining}
          saving={savingAnswer||pendingSubmit}setIndex={setExamIndex}
          answer={i=>{void chooseAnswer(i)}}submit={()=>{void finishExam()}}
          close={()=>{setExam(null);void load()}}/> :
      <div className="page-section">
        {section==='overview'&&<>
          <Heading title={'Good to see you, '+me.display_name.split(' ')[0]+'.'}
            description="Your remote billing onboarding workspace, all in one place."
            actions={<button className="button-soft" onClick={()=>{go('/preview')}}>Presentation preview <ArrowRight size={16}/></button>}/>
          <section className="dashboard-hero"><div>
            <div className="hero-eyebrow"><Activity size={15}/> TRAINING INTELLIGENCE, SIMPLIFIED</div>
            <h2>Stronger billing teams start with better assessments.</h2>
            <p>Monitor training readiness, manage trainee accounts and assess competency through one connected workspace.</p>
            <button className="button-blue" onClick={()=>setSection(staff?'trainees':'assessments')}>
              {staff?'Manage trainees':'View my assessments'} <ArrowRight size={17}/></button></div>
            <div className="hero-art"><BookOpenCheck size={76}/></div></section>
          <section className="stats-grid">
            <Stat icon={Users} label={staff?'Assigned trainees':'My assignments'} value={staff?people.length:assigned.length} sub="Authorized accounts"/>
            <Stat icon={ClipboardCheck} label="Completed exams" value={completed.length} sub="Saved submissions"/>
            <Stat icon={BarChart3} label="Average score" value={avg+'%'} sub="Verified results"/>
            <Stat icon={ShieldCheck} label="Passing results" value={pass} sub="Suggested pass mark: 80%"/>
          </section>
          <section className="content-columns">
            <Card><div className="card-head"><h3>Assessment readiness</h3>{badge(published?'Published':'Draft',published?'success':'warning')}</div>
              <p className="muted">Official question approval is managed by the administrator.</p>
              {TRAINING_CATEGORIES.map(category=>{
                const questions=(data?.questions||[]).filter(q=>q.category===category)
                const approvedForCategory=questions.filter(q=>q.active).length
                return <div className="category-track" key={category}><span title={category}>{category}</span>
                  <div className="track"><div style={{width:questions.length?100*approvedForCategory/questions.length+'%':'0%'}}/></div>
                  <b>{role==='trainee'?'—':approvedForCategory+'/'+questions.length}</b></div>
              })}
            </Card>
            <Card><div className="card-head"><h3>Recent activity</h3><Clock size={19}/></div>
              {completed.length?completed.slice(0,4).map(item=><div className="activity-line" key={item.id}>
                <CheckCircle2 size={19}/><div><b>Assessment submitted</b><span>{fmtDate(item.submitted_at)} · {item.score_percent}%</span></div></div>):
                <Empty message="No completed exams yet" description="Once trainees finish their assessments, results will appear here."/>}
            </Card>
          </section>
        </>}
        {section==='trainees'&&staff&&<>
          <Heading title="Trainee management" description="Invite new trainees and manage onboarding accounts."
            actions={<button className="button-blue" onClick={()=>setModal('invite')}><UserPlus size={17}/> Invite trainee</button>}/>
          <Card><div className="table-tools"><div className="search-wrap"><Search size={17}/>
            <input placeholder="Search trainee name, email or store" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            {badge(people.length+' trainee records')}</div>
            {visiblePeople.length?<div className="table-scroll"><table><thead><tr><th>Employee</th><th>Store</th><th>Employee code</th><th>Account</th><th>Created</th></tr></thead>
              <tbody>{visiblePeople.map(p=><tr key={p.id}><td><div className="person-row">{initialsAvatar(p)}
                <div><strong>{p.display_name}</strong><small>{p.email}</small></div></div></td><td>{p.store_code||'—'}</td>
                <td>{p.employee_code||'—'}</td><td>{badge(p.active?'Active':'Inactive',p.active?'success':'warning')}</td>
                <td>{fmtDate(p.created_at)}</td></tr>)}</tbody></table></div>:
              <Empty message="No trainees found" description="Use Invite trainee to issue secure login credentials by email."/>}
          </Card>
        </>}
        {section==='requests'&&admin&&<>
          <Heading title="Access request approvals" description="Review verified Manager and HR requests. Administrator privileges cannot be self-requested."/>
          <Card>{requests.length?<div className="table-scroll"><table><thead><tr><th>Applicant</th><th>Requested access</th><th>Store</th><th>Email verification</th><th>Status / action</th></tr></thead>
            <tbody>{requests.map(r=><tr key={r.id}><td><div><strong>{r.display_name}</strong><small className="small-row">{r.email}</small></div></td>
              <td>{r.requested_role==='hr'?'Human Resources':'Branch Manager'}</td><td>{r.store_code||'Organization-wide'}</td>
              <td>{badge(r.email_verified?'Verified':'Pending email',r.email_verified?'success':'warning')}</td>
              <td>{r.status==='pending'?<div className="inline-buttons">
                <button className="button-outline small" disabled={!r.email_verified} onClick={()=>{void perform(()=>callApi('staff_request_review',{id:r.id,approve:true}),'Access request approved')}}>Approve</button>
                <button className="button-quiet small" onClick={()=>{if(window.confirm('Reject this request?'))void perform(()=>callApi('staff_request_review',{id:r.id,approve:false}),'Request rejected')}}>Reject</button>
              </div>:badge(r.status,r.status==='approved'?'success':'warning')}</td></tr>)}</tbody></table></div>:
              <Empty message="No staff requests" description="New Manager and HR registration requests will appear here after signup."/>}</Card>
        </>}
        {section==='questions'&&admin&&<>
          <Heading title="Question bank" description="Review the 50 draft questions against the latest company SOPs."
            actions={<button className="button-blue" onClick={()=>setModal('question')}><Plus size={17}/> Add question</button>}/>
          <div className="notice-banner"><HelpCircle size={17}/> {approved} approved · {draft} awaiting review. Published assessments require administrator approval of all training topics.</div>
          <Card>{data?.questions.length?<div className="table-scroll"><table><thead><tr><th>Question</th><th>Topic</th><th>Status</th><th>Review</th></tr></thead>
            <tbody>{data.questions.map(q=><tr key={q.id}><td className="question-text">{q.prompt||'Question'}</td><td>{q.category}</td>
              <td>{badge(q.active?'Approved':'Draft',q.active?'success':'warning')}</td>
              <td><div className="inline-buttons"><button className="button-outline small" onClick={()=>{void editQuestion(q.id)}}>Review</button>
                <button className="button-quiet small" onClick={()=>{if(window.confirm(q.active?'Deactivate this question?':'Approve only after SOP review. Continue?'))void perform(()=>callApi('question_approve',{id:q.id,active:!q.active}),'Question status updated')}}>{q.active?'Deactivate':'Approve'}</button></div></td></tr>)}</tbody></table></div>:
              <Empty message="No questions found" description="Imported training questions will appear here once accessible."/>}</Card>
        </>}
        {section==='assessments'&&<>
          <Heading title={staff?'Assessment management':'My assessments'} description={staff?'Publish reviewed exams and assign them to trainees.':'Start or resume an assessment assigned by your training team.'}
            actions={staff?<button className="button-blue" onClick={()=>setModal('assign')}><Plus size={17}/> Assign assessment</button>:null}/>
          {(data?.assessments||[]).filter(a=>staff||assigned.some(x=>x.assessment_id===a.id)).map(a=>
            <Card key={a.id} className="assessment-card"><div className="card-head"><div><h3>{a.title}</h3><p className="muted">{a.description}</p></div>
              {badge(a.published?'Published':'Draft',a.published?'success':'warning')}</div>
              <div className="assessment-facts"><span><BookOpenCheck size={16}/>{a.question_count} questions</span>
                <span><Clock size={16}/>{a.duration_minutes} minutes</span><span><ShieldCheck size={16}/>{a.passing_percent}% pass threshold</span></div>
              {admin&&<button className="button-outline small" onClick={()=>{if(window.confirm(a.published?'Unpublish assessment?':'Publish only after every question has been verified. Continue?'))void perform(()=>callApi('assessment_publish',{id:a.id,published:!a.published}), 'Assessment status changed')}}>{a.published?'Unpublish':'Publish assessment'}</button>}
              {!staff&&assigned.filter(x=>x.assessment_id===a.id).map(x=><div className="assigned-line" key={x.id}><div>
                <span>Assigned {fmtDate(x.assigned_at)} · {x.status.replace('_',' ')}</span>{x.due_at&&<small>Due {fmtDate(x.due_at)}</small>}</div>
                {x.status==='completed'?<button className="button-outline" onClick={()=>setSection('results')}>View results</button>:
                  <button className="button-blue" onClick={()=>{void openExam(x)}}>Start / resume <ArrowRight size={16}/></button>}</div>)}
            </Card>
          )}
          {!data?.assessments.length&&<Card><Empty message="No assessment available" description="A published and assigned assessment will appear here."/></Card>}
        </>}
        {section==='results'&&<>
          <Heading title="Results & reports" description="Verified assessment outcomes and individual performance details."
            actions={<button className="button-outline" onClick={()=>buildCSV([['Employee','Store','Score','Outcome','Date'],...completed.map(a=>[peopleById.get(a.trainee_id)?.display_name||'Trainee',peopleById.get(a.trainee_id)?.store_code||'',a.score_percent,a.passed?'Pass':'Review',fmtDate(a.submitted_at)])])}>
              <Download size={17}/> Export CSV</button>}/>
          <Card>{completed.length?<div className="table-scroll"><table><thead><tr><th>Trainee</th><th>Score</th><th>Outcome</th><th>Submitted</th><th>Report</th></tr></thead>
            <tbody>{completed.map(a=><tr key={a.id}><td>{peopleById.get(a.trainee_id)?.display_name||'My assessment'}</td><td><strong>{a.score_percent}%</strong></td>
              <td>{badge(a.passed?'Passed':'Review',a.passed?'success':'warning')}</td>
              <td>{fmtDate(a.submitted_at)}</td><td><button className="button-outline small" onClick={()=>{void openReport(a.id)}}>View report</button></td></tr>)}</tbody></table></div>:
              <Empty message="No results available" description="Reports become available when trainees complete their exams."/>}</Card>
        </>}
        {section==='settings'&&<SettingsPanel role={role}profile={me}notify={notify}refresh={refresh}/>}
      </div>}
    </main>
    {modal==='invite'&&<InviteModal role={role}profile={me}close={()=>setModal(null)}confirm={async payload=>{await perform(()=>callApi('invite',payload),'Trainee invitation sent to the approved email address')}}/>}
    {modal==='assign'&&<AssignModal people={people}assessments={data?.assessments||[]}close={()=>setModal(null)}
      confirm={async payload=>{await perform(()=>callApi('assignment_create',payload),'Assessment assigned successfully')}}/>}
    {modal==='question'&&<QuestionModal initial={editQuestionInitial}close={()=>{setModal(null);setEditQuestionInitial(null)}}
      confirm={async payload=>{await perform(()=>callApi('question_save',payload),'Draft question saved')}}/>}
  </div>
  async function editQuestion(id:string){
    try{const q=await callApi<Question & {options:string[];correct:number}>('question_get',{id});setEditQuestionInitial(q);setModal('question')}
    catch(err){notify(err instanceof Error?err.message:'Could not open question')}
  }
  // The question editor is reset whenever the modal is closed.
}
