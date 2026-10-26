"use strict";
const SB_URL = "https://dgusnyfhcizbmdmryjbj.supabase.co";
const SB_KEY = "sb_publishable_swxw_VUy3QCvdtmEbSdNBA_DIN1t5sg"; // Browser-safe publishable key only.
const CATEGORIES = ["ERX Processing","Refill Processing","Insurance & Rejections","LTC Billing","Coupons & Follow-Up"];
const ICONS={
 overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 questions:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
 exam:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 11h6M9 16h3"/>',
 results:'<path d="M3 3v18h18"/><path d="m7 15 4-5 4 3 5-8"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-2.83 2.83-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-4v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-2.83-2.83.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3v-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06 2.83-2.83.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2h4v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 2.83 2.83-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21v4h-.09A1.65 1.65 0 0 0 19.4 15Z"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
 arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 cap:'<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 3 9 3 12 0v-5M22 9v7"/>',
 lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>'
};
const svg = (name) => '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.overview)+'</svg>';
const esc = (s) => String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const state={page:"overview", client:null, signedIn:false, role:"preview", profile:null, user:null,
 trainees:[],questions:[],assessments:[],attempts:[],assignments:[],filter:"",question:0,choices:{},quizFinished:false,sessionLoading:true};
const SAMPLE_TRAINEES=[
 {display_name:"Trainee 001",employee_code:"TR-001",store_code:"475",active:true,created_at:"2026-10-20"},
 {display_name:"Trainee 002",employee_code:"TR-002",store_code:"1030",active:true,created_at:"2026-10-21"},
 {display_name:"Trainee 003",employee_code:"TR-003",store_code:"872",active:true,created_at:"2026-10-22"},
 {display_name:"Trainee 004",employee_code:"TR-004",store_code:"904",active:true,created_at:"2026-10-23"}];
const SAMPLE_QUESTIONS=[
 {category:"ERX Processing",prompt:"Which area is used to review new electronic prescriptions requiring attention?",options:["ERX Action List","Payroll history","Supply orders","Inventory reports"]},
 {category:"Refill Processing",prompt:"What should be checked before processing a refill request?",options:["Prescription refill availability","Employee ID expiration","Building address","Monthly marketing plan"]},
 {category:"Insurance & Rejections",prompt:"What should happen when an insurance rejection requires a pharmacist's authorization?",options:["Consult the pharmacist","Override it without approval","Change the patient record arbitrarily","Ignore the rejection"]},
 {category:"LTC Billing",prompt:"What must be verified before submitting an LTC billing claim?",options:["Facility eligibility and billing instructions","Marketing coupons only","The technician's own schedule","The store's social-media activity"]},
 {category:"Coupons & Follow-Up",prompt:"What should be checked before applying a manufacturer savings coupon?",options:["Plan and patient eligibility","The employee work shift","The patient's email newsletter","The store's delivery schedule"]}];
const DEMO_BANK = Array.isArray(window.RBOAS_DEMO_BANK) ? window.RBOAS_DEMO_BANK : [];
const PRACTICE = [];
function randomize(items){ const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function preparePractice(){
 const selection = CATEGORIES.flatMap(cat=>randomize(DEMO_BANK.filter(q=>q.category===cat)).slice(0,5));
 if(selection.length!==25){toast("Question bank unavailable. Refresh the page.");return false;}
 PRACTICE.splice(0,PRACTICE.length,...randomize(selection.map(q=>{
  const picked=q.options.map((label,index)=>({label,original:index}));
  const order=randomize(picked);
  return {category:q.category,prompt:q.prompt,options:order.map(x=>x.label),correct:order.findIndex(x=>x.original===q.correct)};
 })));
 state.question=0;state.choices={};state.quizFinished=false;
 state.practiceEndsAt=Date.now()+30*60*1000;state.practiceStarted=true;
 return true;
}
function remainingTime(){if(!state.practiceEndsAt)return "30:00";const remaining=Math.max(0,Math.ceil((state.practiceEndsAt-Date.now())/1000));return String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0");}
function demo(){return !state.signedIn;}
function role(){return demo()?"preview":state.role;}
function me(){return state.profile&&state.profile.display_name||state.user&&state.user.email||"Guest reviewer";}
function initials(name){return String(name||"T").split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();}
function navItems(){if(role()==="trainee")return [["overview","Overview","overview"],["assessments","My assessments","exam"],["results","My results","results"],["settings","My account","settings"]];return [["overview","Overview","overview"],["trainees","Trainees","users"],["questions","Question bank","questions"],["assessments","Assessments","exam"],["results","Results & insights","results"],["settings","Settings","settings"]];}
function label(){return demo()?"Design preview":role()==="admin"?"Administrator":role()==="manager"?"Manager / HR":"Trainee";}
function navButton(item){return '<button class="nav-button '+(state.page===item[0]?"active":"")+'" data-nav="'+item[0]+'">'+svg(item[2])+esc(item[1])+'</button>';}
function content(){switch(state.page){case "overview":return overview();case "trainees":return trainees();case "questions":return questions();case "assessments":return assessments();case "results":return results();case "settings":return settings();case "practice":return practice();default:return overview();}}
function render(){
 const all=navItems();if(!all.some(x=>x[0]===state.page)&&state.page!=="practice")state.page="overview";
 const title=state.page==="practice"?"Assessment experience":state.page==="overview"?"Overview":state.page==="questions"?"Question bank":state.page==="trainees"?"Trainees":state.page==="assessments"?"Assessments":state.page==="results"?"Results & insights":"Settings";
 document.getElementById("app").innerHTML=
 '<div class="app-shell"><aside class="sidebar" id="sidebar"><a href="#" class="brand" data-nav="overview">'+
 '<div class="brand-icon">R</div><div><div class="brand-title">RBOAS<span style="color:#58a7f9">.</span></div><div class="brand-sub">ASSESSMENT SYSTEM</div></div></a>'+
 '<div class="side-label">WORKSPACE</div><nav class="nav">'+all.map(navButton).join("")+'</nav><div class="side-spacer"></div>'+
 '<div class="side-help"><div class="side-help-icon">'+svg("cap")+'</div><h4>Built for better onboarding</h4><p>Structured learning. Objective evaluations. Confident pharmacy billing teams.</p></div>'+
 '<div class="side-foot">REMOTE BILLING · TRAINING & DEVELOPMENT<br><span style="line-height:2.5">Phase 2 · Management-ready demonstration</span></div></aside>'+
 '<main class="main"><header class="topbar"><div class="mobile-top"><button aria-label="Toggle menu" id="mobileMenu">'+svg("menu")+'</button>RBOAS</div>'+
 '<div class="breadcrumb">Workspace&nbsp; / &nbsp;<strong>'+esc(title)+'</strong></div><div class="top-actions">'+
 '<span class="mode-pill"><span class="dot"></span>'+esc(label())+'</span>'+
 (demo()?'<button class="outline" data-action="login">'+svg("lock")+' Sign in</button>':'<button class="outline" data-action="logout">Sign out</button>')+
 '<span class="avatar">'+esc(initials(me()))+'</span></div></header>'+
 (demo()?'<div class="notice"><strong>Design preview:</strong> Figures and trainee names are illustrative. This public preview does not expose employee records or accept real assessment submissions. Select <strong>Sign in</strong> to access authorized Supabase data.</div>':'')+
 content()+'</main></div>';
}
function metric(title,value,icon,foot){return '<div class="card"><div class="metric-top"><span class="metric-name">'+esc(title)+'</span><span class="metric-icon">'+svg(icon)+'</span></div><div class="metric-value">'+esc(value)+'</div><div class="metric-foot">'+foot+'</div></div>';}
function header(title,desc,button){return '<div class="page-top"><div><h1 class="header-title">'+esc(title)+'</h1><p class="header-desc">'+esc(desc)+'</p></div>'+(button||"")+'</div>';}
function overview(){
 const total=demo()?24:state.trainees.length;
 const completed=demo()?18:state.attempts.filter(x=>x.status==="submitted").length;
 const submitted=demo()?[92,84,68,88,76,83]:state.attempts.filter(x=>x.status==="submitted"&&x.score_percent!=null).map(x=>Number(x.score_percent));
 const average=submitted.length?Math.round(submitted.reduce((a,b)=>a+b,0)/submitted.length):0;
 const passed=demo()?15:state.attempts.filter(x=>x.passed===true).length;
 let counts=CATEGORIES.map((cat,i)=>({cat:cat,value:demo()?DEMO_BANK.filter(x=>x.category===cat).length:state.questions.filter(x=>x.category===cat).length}));
 return header("Good to see you"+(demo()?", reviewer":"")+".","A clear view of your remote billing onboarding journey.")+
 '<section class="hero"><div class="hero-content"><div class="eyebrow">'+svg("activity")+' TRAINING INTELLIGENCE, SIMPLIFIED</div>'+
 '<h2>Stronger billing teams start with better assessments.</h2>'+
 '<p>Manage onboarding, measure competency and identify training opportunities—all in one thoughtfully designed workspace.</p>'+
 '<div class="button-row"><button class="primary" data-nav="assessments">Explore assessments '+svg("arrow")+'</button><button class="outline" data-nav="practice">Try quiz preview</button></div></div>'+
 '<div class="hero-visual"><div class="orb"><div class="orb-inner">'+svg("shield")+'</div></div></div></section>'+
 '<section class="stats">'+metric("Total trainees",total,"users",demo()?"Illustrative sample":"Authorized trainee profiles")+
 metric("Completed exams",completed,"exam",demo()?"Illustrative sample":"Submitted attempts")+
 metric("Average score",average+"%","results",demo()?"Illustrative sample":"Submitted results")+
 metric("Passed assessments",passed,"shield",demo()?"Illustrative sample":"Passing results")+'</section>'+
 '<section class="section-grid"><div class="card"><div class="section-heading"><h3>Question bank coverage</h3><button class="mini-link" data-nav="questions">View question bank →</button></div>'+
 '<p class="muted">Question distribution across five core billing topics. Draft: 10 questions per category, awaiting SOP and management approval.</p>'+
 counts.map(x=>'<div class="category-line"><span>'+esc(x.cat)+'</span><div class="track"><div class="fill" style="width:'+Math.min(100,10*x.value)+'%"></div></div><strong>'+x.value+'/10</strong></div>').join("")+
 '</div><div class="card"><div class="section-heading"><h3>Development milestones</h3><span class="status blue">Phase 1</span></div>'+
 activity("Database foundation","Supabase tables, authorization policies and protected answer keys","check")+
 activity("Dashboard experience","Responsive management interface and role-aware navigation","check")+
 activity("Live authentication","Supabase login connected; accounts to be provisioned","lock")+
 activity("Management quiz demo","25 random draft questions, 30-minute countdown and sample score report","check")+
 '</div></section>';
}
function activity(title,sub,icon){return '<div class="activity"><span class="activity-mark '+(icon==="lock"||icon==="clock"?"blue":"")+'">'+svg(icon)+'</span><div><h4>'+esc(title)+'</h4><p>'+esc(sub)+'</p></div></div>';}
function trainees(){
 const rows=demo()?SAMPLE_TRAINEES:state.trainees;
 const button=role()==="admin"?'<button class="subtle-btn" disabled title="Secure administrator invitations will be added in the next phase">Invite trainee · Next phase</button>':"";
 return header("Trainee directory","Monitor assigned trainees, store locations and onboarding status.",button)+
 '<div class="toolbar"><label class="search-box">'+svg("search")+'<input type="search" id="traineeFilter" placeholder="Search by name, store or ID" aria-label="Search trainees"></label>'+
 '<span class="status blue">'+rows.length+' '+(demo()?"sample records":"authorized records")+'</span></div>'+
 '<div class="card full-table">'+(rows.length?'<table class="data-table"><thead><tr><th>Trainee</th><th>Employee ID</th><th>Store</th><th>Account</th><th>Onboarding</th></tr></thead><tbody>'+rows.map(x=>
 '<tr data-search="'+esc((x.display_name+" "+(x.store_code||"")+" "+(x.employee_code||"")).toLowerCase())+'">'+
 '<td><div class="person-cell"><span class="initials">'+esc(initials(x.display_name))+'</span>'+esc(x.display_name)+'</div></td>'+
 '<td>'+esc(x.employee_code||"—")+'</td><td>'+esc(x.store_code||"—")+'</td><td><span class="status '+(x.active?"green":"gray")+'">'+(x.active?"Active":"Inactive")+'</span></td>'+
 '<td><span class="status blue">'+(demo()?"Sample trainee":"Registered")+'</span></td></tr>').join("")+'</tbody></table>':
 empty("No trainee profiles yet","Once administrator invitations are configured, new trainee accounts will appear here."))+'</div>';
}
function empty(title,description){return '<div class="empty"><span class="empty-icon">'+svg("users")+'</span><h3>'+esc(title)+'</h3><p>'+esc(description)+'</p></div>';}
function questions(){
 const rows=demo()?DEMO_BANK:state.questions;
 return header("Question bank","Organize the foundational billing knowledge required after five days of training.",'<button class="subtle-btn" disabled title="Secure question authoring and answer keys are the next milestone">Add question · Next phase</button>')+
 '<section class="mini-cards">'+CATEGORIES.map((c,i)=>'<div class="mini-card"><span class="badge-icon">'+svg("questions")+'</span><strong>'+ (demo()?DEMO_BANK.filter(x=>x.category===c).length:rows.filter(x=>x.category===c).length)+'</strong><p>'+esc(c)+'</p><small>'+(demo()?"Planned per category":"Approved questions in bank")+'</small></div>').join("")+'</section>'+
 '<div class="card"><div class="section-heading"><h3>Question library</h3><span class="status blue">'+(demo()?"50 draft questions · management review required":"Database records · draft questions inactive")+'</span></div>'+
 (rows.length?'<div class="full-table"><table class="data-table"><thead><tr><th>Question</th><th>Category</th><th>Difficulty</th><th>Status</th></tr></thead><tbody>'+rows.map(x=>'<tr><td style="max-width:480px;color:#344861;font-weight:700">'+esc(x.prompt)+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.difficulty||"basic")+'</td><td><span class="status green">'+(demo()?"Draft":x.active?"Active":"Draft")+'</span></td></tr>').join("")+'</tbody></table></div>':
 empty("The question bank is empty","Administrators will be able to add 50 reviewed questions with securely stored answer keys."))+'</div>';
}
function assessments(){
 const rows=demo()?[{id:"demo",title:"Five-Day Remote Billing Onboarding Assessment",description:"Core onboarding assessment",duration_minutes:30,question_count:25,passing_percent:80,published:false}]:state.assessments;
 return header(role()==="trainee"?"My assessments":"Assessments","Configure consistent evaluations of core billing competencies.")+
 '<div class="notice"><strong>Exam specifications:</strong> A 50-question bank, 25 randomly assigned per attempt, five categories, 30-minute timer and an 80% recommended passing threshold. The interactive 25-question preview is ready; official server-side grading requires activation after SOP review.</div>'+
 (rows.length?rows.map(x=>'<div class="card" style="margin-bottom:16px"><div class="section-heading"><div><h3 style="font-size:16px;margin-bottom:8px">'+esc(x.title)+'</h3><p class="muted">'+esc(x.description||"Structured onboarding evaluation")+'</p></div><span class="status '+(x.published?"green":"amber")+'">'+(x.published?"Published":"Draft")+'</span></div>'+
 '<div class="quiz-meta"><span>'+svg("questions")+' '+esc(x.question_count)+' questions</span><span>'+svg("clock")+' '+esc(x.duration_minutes)+' minutes</span><span>'+svg("shield")+' Pass: '+esc(x.passing_percent)+'%</span></div>'+
 '<button class="outline" data-nav="practice">Start randomized 25-question demo '+svg("arrow")+'</button></div>').join(""):
 '<div class="card">'+empty("No accessible assessments","Your assigned assessments will appear here after an administrator publishes and assigns them.")+'</div>');
}
function results(){
 const rows=demo()?[{id:"DEMO-001",name:"Trainee 001",score_percent:92,passed:true},{id:"DEMO-002",name:"Trainee 002",score_percent:84,passed:true},{id:"DEMO-003",name:"Trainee 003",score_percent:68,passed:false}]:
 state.attempts.filter(x=>x.status==="submitted").map(x=>({id:x.id,name:(state.trainees.find(t=>t.id===x.trainee_id)||{}).display_name||(x.trainee_id===state.user?.id?me():"Authorized trainee"),score_percent:x.score_percent,passed:x.passed}));
 return header(role()==="trainee"?"My results":"Results & insights","Review outcomes and identify training needs.")+
 '<div class="card"><div class="section-heading"><h3>Assessment outcomes</h3><span class="status blue">'+(demo()?"Sample results":"Live authorized results")+'</span></div>'+
 (rows.length?'<div class="full-table"><table class="data-table"><thead><tr><th>Trainee</th><th>Score</th><th>Result</th><th>Exam record</th></tr></thead><tbody>'+rows.map(x=>'<tr><td><div class="person-cell"><span class="initials">'+esc(initials(x.name))+'</span>'+esc(x.name)+'</div></td><td><strong>'+esc(x.score_percent)+'%</strong></td><td><span class="status '+(x.passed?"green":"amber")+'">'+(x.passed?"Passed":"Needs review")+'</span></td><td>'+esc(String(x.id).slice(0,12))+'</td></tr>').join("")+'</tbody></table></div>':
 empty("No submitted exams","Completed assessments and verified grading results will appear here."))+'</div>';
}
function settings(){
 return header("Workspace settings","Configuration, privacy and account details for the RBOAS platform.")+
 '<div class="card"><div class="section-heading"><h3>System configuration</h3><span class="status green">Database provisioned</span></div><div class="settings-list">'+
 setRow("Application","Remote Billing Onboarding Assessment System")+
 setRow("Backend","Supabase PostgreSQL + Authentication")+
 setRow("Project status","Phase 1: visual interface and secure sign-in")+
 setRow("Access",demo()?"Public demonstration — no employee information":label()+" · "+me())+
 setRow("Question model","50 approved question bank · 25 random per attempt")+
 setRow("Scoring","Server-controlled grading — scheduled, not yet enabled")+
 setRow("Data privacy","Role-based access; answer keys stored in a private schema")+
 '</div></div>'+(demo()?'<div class="spaced"><button class="primary" data-action="login">'+svg("lock")+' Sign in to your account</button></div>':'');
}
function setRow(k,v){return '<div class="settings-row"><b>'+esc(k)+'</b><span>'+esc(v)+'</span></div>';}
function practice(){
 if(!state.practiceStarted&&!preparePractice())return header("Assessment unavailable","The draft question bank could not be loaded.");
 const count=PRACTICE.length;
 const answered=Object.keys(state.choices).length;
 const score=PRACTICE.reduce((sum,q,index)=>sum+(state.choices[index]===q.correct?1:0),0);
 if(state.quizFinished){
  const pass=score>=20;
  const categoryPerformance=CATEGORIES.map(category=>{
   const positions=PRACTICE.map((q,i)=>({q,i})).filter(item=>item.q.category===category);
   return {name:category,correct:positions.filter(x=>state.choices[x.i]===x.q.correct).length};
  });
  return '<div class="quiz-container">'+header("Assessment preview completed","An illustrative score report for management review. This result is not stored.")+
  '<div class="card" style="text-align:center;padding:35px 26px">'+
  '<div class="empty-icon">'+svg("shield")+'</div><p class="small-caps">DEMONSTRATION RESULT · NOT AN EMPLOYEE RECORD</p>'+
  '<h2 style="font-size:32px;margin:12px 0">'+score+' / '+count+' <span style="color:#8496ad;font-size:18px">('+Math.round(score/count*100)+'%)</span></h2>'+
  '<span class="status '+(pass?'green':'amber')+'">'+(pass?'Meets suggested 80% threshold':'Below suggested 80% threshold')+'</span>'+
  '<p class="muted" style="line-height:1.7;margin:18px 0">Answered '+answered+' of '+count+' questions. This demonstration uses draft content and does not count as a trainee assessment.</p>'+
  '<div class="section-grid" style="margin:24px 0;text-align:left"><div><h3 style="font-size:14px">Category breakdown</h3>'+
  categoryPerformance.map(c=>'<div class="category-line"><span>'+esc(c.name)+'</span><div class="track"><div class="fill" style="width:'+(c.correct*20)+'%"></div></div><strong>'+c.correct+'/5</strong></div>').join('')+
  '</div><div class="card" style="background:#f5faff"><h3 style="font-size:13px">Next steps</h3><p class="muted" style="line-height:1.9;margin-top:12px">A manager can review category gaps, assign retraining and authorize another attempt when the live assessment engine is activated.</p></div></div>'+
  '<div class="button-row" style="justify-content:center"><button class="primary" data-action="resetQuiz">Generate a new random test</button><button class="outline" data-action="printResult">Print sample result</button><button class="outline" data-nav="overview">Back to dashboard</button></div></div></div>';
 }
 const q=PRACTICE[state.question];
 const numbering='<div class="question-jump">'+PRACTICE.map((_,i)=>'<button aria-label="Go to question '+(i+1)+'" title="Question '+(i+1)+'" data-jump="'+i+'" class="jump '+(i===state.question?'current':(state.choices[i]!==undefined?'answered':''))+'">'+(i+1)+'</button>').join('')+'</div>';
 return '<div class="quiz-container">'+
 '<div class="quiz-header"><div><div class="eyebrow">'+svg("cap")+' 25-QUESTION MANAGEMENT DEMO</div><h1 class="header-title">Remote Billing Assessment</h1></div><span class="status blue">Draft practice only</span></div>'+
 '<div class="notice warning"><strong>Presentation preview:</strong> 25 questions selected randomly from 50 draft questions (5 per category). An official assessment requires reviewed, approved questions and staff authorization.</div>'+
 '<div class="quiz-meta"><span>Question '+(state.question+1)+' / '+count+'</span><span>'+answered+' answered</span><span>'+esc(q.category)+'</span><span style="font-weight:800;color:#2675d3">'+svg("clock")+' <span id="demo-timer">'+remainingTime()+'</span></span></div>'+
 '<div class="quiz-progress"><div style="width:'+((answered/count)*100)+'%"></div></div>'+
 '<div class="card question-card"><div class="small-caps">SELECT ONE ANSWER</div><h2>'+esc(q.prompt)+'</h2>'+
 '<div class="answers">'+q.options.map((opt,i)=>'<button class="option '+(state.choices[state.question]===i?'chosen':'')+'" data-choice="'+i+'"><span class="option-index">'+String.fromCharCode(65+i)+'</span>'+esc(opt)+'</button>').join('')+'</div>'+
 '<div class="quiz-footer"><button class="outline" data-action="prevQuiz" '+(state.question===0?'disabled':'')+'>Previous</button>'+
 '<div class="button-row">'+(state.question===count-1?'<button class="primary" data-action="nextQuiz">Submit sample exam '+svg("check")+'</button>':'<button class="primary" data-action="nextQuiz">Next question '+svg("arrow")+'</button>')+'</div></div>'+
 '<div class="divider"></div><p class="muted" style="margin-bottom:12px">Jump to any question:</p>'+numbering+
 '</div></div>';
}
function toast(message){const t=document.createElement("div");t.className="toast";t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),3300);}
async function initializeAuth(){
 try{
  const module=await import("https://esm.sh/@supabase/supabase-js@2.95.0");
  state.client=module.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const result=await state.client.auth.getSession();
  if(result.data&&result.data.session)await syncUser();
 }catch(e){console.warn("Supabase initialization unavailable:",e.message);}
 finally{state.sessionLoading=false;render();}
}
async function syncUser(){
 const res=await state.client.auth.getUser();
 if(res.error||!res.data.user){state.signedIn=false;state.user=null;state.profile=null;return;}
 const user=res.data.user;state.user=user;
 state.role=user.app_metadata&&user.app_metadata.rboas_role||"trainee";
 const p=await state.client.from("user_profiles").select("id,display_name,email,store_code,employee_code,active").eq("id",user.id).maybeSingle();
 state.profile=p.data||{display_name:user.email,email:user.email,active:true};
 if(state.profile.active===false){await state.client.auth.signOut();state.signedIn=false;throw Error("Account disabled. Contact your administrator.");}
 state.signedIn=true;await loadData();
}
async function loadData(){
 if(!state.client||!state.signedIn)return;
 const admin=state.role==="admin",manager=state.role==="manager";
 const results=await Promise.all([
  admin||manager?state.client.from("user_profiles").select("id,display_name,employee_code,store_code,active,created_at").order("created_at",{ascending:false}):Promise.resolve({data:[]}),
  admin||manager?state.client.from("question_bank").select("id,category,prompt,difficulty,active").order("created_at",{ascending:false}):Promise.resolve({data:[]}),
  state.client.from("assessments").select("id,title,description,published,duration_minutes,passing_percent,question_count"),
  state.client.from("assessment_attempts").select("id,trainee_id,score_percent,passed,status,submitted_at").order("started_at",{ascending:false}),
  state.client.from("assessment_assignments").select("id,assessment_id,trainee_id,status")
 ]);
 state.trainees=results[0].data||[];
 state.questions=results[1].data||[];
 state.assessments=results[2].data||[];
 state.attempts=results[3].data||[];
 state.assignments=results[4].data||[];
}
document.addEventListener("click",async function(e){
 const menu=e.target.closest("#mobileMenu");if(menu){document.getElementById("sidebar")?.classList.toggle("open");return;}
 const link=e.target.closest("[data-nav]");if(link){e.preventDefault();if(link.dataset.nav==="practice"&&!state.practiceStarted)preparePractice();state.page=link.dataset.nav;document.getElementById("sidebar")?.classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});render();return;}
 const ch=e.target.closest("[data-choice]");if(ch){state.choices[state.question]=Number(ch.dataset.choice);render();return;}const jump=e.target.closest("[data-jump]");if(jump){state.question=Number(jump.dataset.jump);render();return;}
 const btn=e.target.closest("[data-action]");if(!btn)return;
 const action=btn.dataset.action;
 if(action==="login"){const d=document.getElementById("authDialog");d.showModal();return;}
 if(action==="logout"){if(state.client)await state.client.auth.signOut();state.signedIn=false;state.profile=null;state.user=null;state.role="preview";state.page="overview";state.trainees=[];state.questions=[];state.attempts=[];state.assignments=[];state.assessments=[];render();toast("Signed out");return;}
 if(action==="prevQuiz"){state.question=Math.max(0,state.question-1);render();return;}
 if(action==="nextQuiz"){if(state.question===PRACTICE.length-1){if(!window.confirm("Submit this practice exam? Unanswered questions count as incorrect."))return;state.quizFinished=true;}else state.question++;render();return;}
 if(action==="resetQuiz"){preparePractice();render();return;}if(action==="printResult"){window.print();return;}
});
document.addEventListener("input",function(e){
 if(e.target.id==="traineeFilter"){const q=e.target.value.toLowerCase().trim();document.querySelectorAll("tr[data-search]").forEach(row=>{row.hidden=!row.dataset.search.includes(q);});}
});
document.getElementById("closeLogin").addEventListener("click",()=>document.getElementById("authDialog").close());
document.getElementById("loginForm").addEventListener("submit",async function(e){
 e.preventDefault();
 const msg=document.getElementById("loginMessage"),button=document.getElementById("loginSubmit");
 msg.textContent="";button.disabled=true;button.textContent="Signing in…";
 try{
  if(!state.client)throw Error("Authentication service unavailable. Refresh and retry.");
  const email=document.getElementById("loginEmail").value.trim();
  const password=document.getElementById("loginPassword").value;
  const login=await state.client.auth.signInWithPassword({email:email,password:password});
  if(login.error)throw login.error;
  await syncUser();state.page="overview";document.getElementById("authDialog").close();e.target.reset();render();toast("Signed in to your secure workspace");
 }catch(error){msg.textContent=error.message||"Unable to sign in. Check your credentials.";}
 finally{button.disabled=false;button.textContent="Sign in securely";}
});
setInterval(()=>{if(state.page==="practice"&&state.practiceStarted&&!state.quizFinished){const timer=document.getElementById("demo-timer");if(timer)timer.textContent=remainingTime();if(Date.now()>=state.practiceEndsAt){state.quizFinished=true;render();toast("Practice time completed");}}},1000);
render();initializeAuth();