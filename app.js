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
const state={page:"overview", client:null, signedIn:false, role:"preview", profile:null, user:null, liveExam:null,liveQuestions:[],liveAnswers:{},liveIndex:0,liveSubmitting:false,reportDetail:null,reportLoading:false,managementReports:null,
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
function content(){switch(state.page){case "overview":return overview();case "trainees":return trainees();case "questions":return questions();case "assessments":return assessments();case "results":return results();case "report":return report();case "settings":return settings();case "practice":return practice();case "take":return liveExamUi();default:return overview();}}
function render(){
 const all=navItems();if(!all.some(x=>x[0]===state.page)&&state.page!=="practice"&&state.page!=="report"&&state.page!=="take")state.page="overview";
 const title=state.page==="report"?"Individual report":state.page==="take"?"Official assessment":state.page==="practice"?"Assessment experience":state.page==="overview"?"Overview":state.page==="questions"?"Question bank":state.page==="trainees"?"Trainees":state.page==="assessments"?"Assessments":state.page==="results"?"Results & insights":"Settings";
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
 const button=role()==="admin"?'<button class="primary" data-open-dialog="inviteDialog">'+svg("users")+' Invite trainee</button>':"";
 return header("Trainee directory","Monitor assigned trainees, store locations and onboarding status.",button)+
 '<div class="toolbar"><label class="search-box">'+svg("search")+'<input type="search" id="traineeFilter" placeholder="Search by name, store or ID" aria-label="Search trainees"></label>'+
 '<span class="status blue">'+rows.length+' '+(demo()?"sample records":"authorized records")+'</span></div>'+
 '<div class="card full-table">'+(rows.length?'<table class="data-table"><thead><tr><th>Trainee</th><th>Employee ID</th><th>Store</th><th>Account</th><th>Onboarding</th><th>Actions</th></tr></thead><tbody>'+rows.map(x=>
 '<tr data-search="'+esc((x.display_name+" "+(x.store_code||"")+" "+(x.employee_code||"")).toLowerCase())+'">'+
 '<td><div class="person-cell"><span class="initials">'+esc(initials(x.display_name))+'</span>'+esc(x.display_name)+'</div></td>'+
 '<td>'+esc(x.employee_code||"—")+'</td><td>'+esc(x.store_code||"—")+'</td><td><span class="status '+(x.active?"green":"gray")+'">'+(x.active?"Active":"Inactive")+'</span></td>'+
 '<td><span class="status blue">'+(demo()?"Sample trainee":"Registered")+'</span></td>'+
 '<td>'+(role()==="admin"&&!demo()?'<button class="outline" data-edit-employee="'+esc(x.id)+'">Edit</button>':'<span class="pale">—</span>')+'</td></tr>').join("")+'</tbody></table>':
 empty("No trainee profiles yet","Once administrator invitations are configured, new trainee accounts will appear here."))+'</div>';
}
function empty(title,description){return '<div class="empty"><span class="empty-icon">'+svg("users")+'</span><h3>'+esc(title)+'</h3><p>'+esc(description)+'</p></div>';}
function questions(){
 const rows=demo()?DEMO_BANK:state.questions;
 return header("Question bank","Review draft questions and approve only those verified against current policies.",role()==="admin"?'<button class="primary" data-open-dialog="questionDialog">'+svg("questions")+' Add question</button>':'')+
 '<section class="mini-cards">'+CATEGORIES.map((c,i)=>'<div class="mini-card"><span class="badge-icon">'+svg("questions")+'</span><strong>'+ (demo()?DEMO_BANK.filter(x=>x.category===c).length:rows.filter(x=>x.category===c).length)+'</strong><p>'+esc(c)+'</p><small>'+(demo()?"Planned per category":"Approved questions in bank")+'</small></div>').join("")+'</section>'+
 '<div class="card"><div class="section-heading"><h3>Question library</h3><span class="status blue">'+(demo()?"50 draft questions · management review required":"Database records · draft questions inactive")+'</span></div>'+
 (rows.length?'<div class="full-table"><table class="data-table"><thead><tr><th>Question</th><th>Category</th><th>Difficulty</th><th>Status</th><th>Review</th></tr></thead><tbody>'+rows.map(x=>'<tr><td style="max-width:480px;color:#344861;font-weight:700">'+esc(x.prompt)+'</td><td>'+esc(x.category)+'</td><td>'+esc(x.difficulty||"basic")+'</td><td><span class="status green">'+(demo()?"Draft":x.active?"Active":"Draft")+'</span></td><td>'+(role()==="admin"&&!demo()?'<button class="outline" data-approve-q="'+esc(x.id)+'" data-next-status="'+(!x.active)+'">'+(x.active?"Deactivate":"Approve")+'</button>':'<span class="pale">—</span>')+'</td></tr>').join("")+'</tbody></table></div>':
 empty("The question bank is empty","Administrators will be able to add 50 reviewed questions with securely stored answer keys."))+'</div>';
}
function assessments(){
 const isPreview=demo();
 const available=isPreview?[{id:"demo",title:"Five-Day Remote Billing Onboarding Assessment",description:"Five-category onboarding review",duration_minutes:30,question_count:25,passing_percent:80,published:false}]:state.assessments;
 const assigned=isPreview?[]:state.assignments;
 const canAdmin=role()==="admin";
 const buttons=canAdmin?'<button class="primary" data-open-dialog="assignmentDialog">'+svg("exam")+' Assign exam</button>':"";
 return header(role()==="trainee"?"My assessments":"Assessments","Structured five-day onboarding evaluation with secure server-side scoring.",buttons)+
 '<div class="notice"><strong>'+ (isPreview?"Management demonstration":"Official assessment management")+':</strong> 25 questions randomly selected from 50, balanced across five categories, a 30-minute limit, 80% suggested pass mark, and one authorized attempt.</div>'+
 (available.length?available.map(x=>{
   const related=assigned.filter(a=>a.assessment_id===x.id);
   const trainee=role()==="trainee";
   if(trainee&&!related.length)return "";
   const action=isPreview?'<button class="primary" data-nav="practice">Try the randomized assessment demo '+svg("arrow")+'</button>':
    trainee?related.map(a=>'<button class="primary" data-start-assignment="'+esc(a.id)+'">'+(a.status==="completed"?"View previous result":"Start / Resume assessment")+'</button>').join(" "):
    canAdmin?'<button class="outline" data-publish-assessment="'+esc(x.id)+'" data-publish-status="'+(!x.published)+'">'+(x.published?"Unpublish":"Publish after review")+'</button>':"";
   return '<div class="card" style="margin-bottom:16px"><div class="section-heading"><div><h3 style="font-size:16px;margin-bottom:8px">'+esc(x.title)+'</h3><p class="muted">'+esc(x.description||"Billing competency assessment")+'</p></div><span class="status '+(x.published?"green":"amber")+'">'+(x.published?"Published":"Draft")+'</span></div>'+
   '<div class="quiz-meta"><span>'+svg("questions")+' '+x.question_count+' questions</span><span>'+svg("clock")+' '+x.duration_minutes+' minutes</span><span>'+svg("shield")+' Pass '+x.passing_percent+'%</span></div>'+
   '<div class="button-row">'+action+'</div></div>';
 }).join(""):'')+
 (isPreview||role()!=="trainee"?"":assigned.length?"":'<div class="card">'+empty("No assigned assessments","An administrator must assign you a published exam before you can take it.")+'</div>')+
 (isPreview?'':'<div class="spaced"><button class="outline" data-nav="practice">Open the presentation-only demo</button></div>');
}
function sampleCategoryBreakdown(){
 return [{category:"ERX Processing",correct:5,total:5},{category:"Refill Processing",correct:4,total:5},
 {category:"Insurance & Rejections",correct:3,total:5},{category:"LTC Billing",correct:5,total:5},
 {category:"Coupons & Follow-Up",correct:3,total:5}];
}
function currentResults(){
 const isDemo=demo();
 if(isDemo)return [{id:"DEMO-001",name:"Trainee 001",store_code:"475",score_percent:92,passed:true,submitted_at:"2026-10-25T14:30:00Z"},
 {id:"DEMO-002",name:"Trainee 002",store_code:"1030",score_percent:84,passed:true,submitted_at:"2026-10-24T14:30:00Z"},
 {id:"DEMO-003",name:"Trainee 003",store_code:"872",score_percent:68,passed:false,submitted_at:"2026-10-23T14:30:00Z"},
 {id:"DEMO-004",name:"Trainee 004",store_code:"904",score_percent:88,passed:true,submitted_at:"2026-10-22T14:30:00Z"}];
 return state.attempts.filter(x=>x.status==="submitted").map(x=>{
  const person=state.trainees.find(t=>t.id===x.trainee_id)||{};
  return {id:x.id,name:person.display_name||(x.trainee_id===state.user?.id?me():"Authorized trainee"),store_code:person.store_code||"—",score_percent:Number(x.score_percent||0),passed:Boolean(x.passed),submitted_at:x.submitted_at};
 });
}
function results(){
 const rows=currentResults();
 const passed=rows.filter(x=>x.passed).length;
 const percent=rows.length?Math.round(rows.reduce((sum,x)=>sum+x.score_percent,0)/rows.length):0;
 const completion=demo()?75:state.assignments.length?Math.round(100*rows.length/state.assignments.length):0;
 const toolbar=role()==="trainee"?"":'<div class="button-row"><button class="outline" data-action="exportReportCSV">'+svg("results")+' Export CSV</button><button class="outline" data-action="printOverview">'+svg("exam")+' Print overview</button></div>';
 return header(role()==="trainee"?"My assessment results":"Performance & reporting","Measure onboarding outcomes and identify targeted coaching opportunities.",toolbar)+
 '<div class="stats">'+metric("Submitted exams",rows.length,"exam",demo()?"Demonstration sample":"Verified exam submissions")+
 metric("Average score",percent+"%","results",demo()?"Sample cohort":"Actual submitted results")+
 metric("Passing results",passed,"shield",demo()?"Illustrative outcomes":"Verified assessment results")+
 metric("Completion rate",completion+"%","users",demo()?"Illustrative sample":"Assignments with submitted results")+'</div>'+
 '<div class="section-grid report-lower">'+
 '<div class="card"><div class="section-heading"><h3>Assessment outcomes</h3><span class="status blue">'+(demo()?"Sample trainee results":"Authorized records only")+'</span></div>'+
 (rows.length?'<div class="full-table"><table class="data-table"><thead><tr><th>Trainee / Store</th><th>Score</th><th>Status</th><th>Submitted</th><th>Details</th></tr></thead><tbody>'+
 rows.map(x=>'<tr><td><div class="person-cell"><span class="initials">'+esc(initials(x.name))+'</span><div>'+esc(x.name)+'<div class="muted">Store '+esc(x.store_code)+'</div></div></div></td>'+
 '<td><strong>'+esc(x.score_percent)+'%</strong></td><td><span class="status '+(x.passed?"green":"amber")+'">'+(x.passed?"Passed":"Review")+'</span></td>'+
 '<td>'+esc(x.submitted_at?new Date(x.submitted_at).toLocaleDateString():"—")+'</td>'+
 '<td><button class="mini-link" data-report-id="'+esc(x.id)+'">View report</button></td></tr>').join("")+'</tbody></table></div>':
 empty("No reports yet","Official exam reports become available after trainees submit assessments."))+
 '</div><div class="card"><div class="section-heading"><h3>Management insights</h3></div>'+
 '<p class="muted">A consistent assessment helps identify learning gaps and prioritize targeted refresher training.</p>'+
 '<div class="divider"></div>'+activity("Passing threshold","Recommended 80% · 20 of 25 correct answers","shield")+
 activity("Category-level insights","Five categories with five questions each","results")+
 activity("Assessment governance","Managers review reports; HR makes onboarding decisions","check")+
 '<div class="notice" style="margin-top:18px">Results support onboarding decisions; a quiz score is not a substitute for supervised practical competency.</div></div></div>';
}
function report(){
 const d=state.reportDetail;
 if(!d)return header("Assessment report","Choose a submitted assessment in Results & insights.")+
 '<button class="outline" data-nav="results">Back to results</button>';
 const a=d.attempt,person=d.trainee;
 const categories=a.category_breakdown||[];
 return '<div class="quiz-container">'+header("Individual assessment report","Training & Development · Remote Billing Onboarding Assessment System",
 '<div class="button-row"><button class="outline" data-nav="results">Back</button><button class="primary" data-action="printDetail">'+svg("exam")+' Print report</button></div>')+
 (demo()?'<div class="notice warning">Illustrative report for a demonstration trainee; not a verified employee assessment.</div>':'<div class="notice good">This report reflects a saved Supabase assessment submission and authorized access.</div>')+
 '<div class="card"><div class="report-heading"><div><div class="eyebrow">ASSESSMENT PERFORMANCE REVIEW</div><h2 style="font-size:23px">'+esc(person.display_name)+'</h2>'+
 '<p class="muted" style="margin-top:8px">Employee '+esc(person.employee_code||"—")+' · Store '+esc(person.store_code||"—")+'</p>'+
 '<p class="muted" style="margin-top:5px">Submitted '+esc(a.submitted_at?new Date(a.submitted_at).toLocaleString():"—")+'</p></div>'+
 '<div class="report-score"><strong>'+esc(a.score_percent)+'%</strong><span class="status '+(a.passed?"green":"amber")+'">'+(a.passed?"Pass":"Review")+'</span></div></div>'+
 '<div class="divider"></div><div class="grid-summary">'+
 '<div><p class="small-caps">CORRECT</p><h3>'+esc(a.correct_count)+' / '+esc(a.total)+'</h3></div>'+
 '<div><p class="small-caps">ANSWERED</p><h3>'+esc(a.answered)+' / '+esc(a.total)+'</h3></div>'+
 '<div><p class="small-caps">STATUS</p><h3>'+(a.passed?"Passed":"Training review")+'</h3></div></div>'+
 '<div class="divider"></div><h3 style="font-size:15px">Skills breakdown</h3><p class="muted" style="margin:8px 0 22px">Category results guide follow-up training and coaching.</p>'+
 categories.map(c=>'<div class="category-line"><span>'+esc(c.category)+'</span><div class="track"><div class="fill" style="width:'+(c.total?c.correct/c.total*100:0)+'%"></div></div><strong>'+esc(c.correct)+'/'+esc(c.total)+'</strong></div>').join("")+
 '<div class="divider"></div><h3 style="font-size:14px">Manager review</h3>'+
 '<p class="muted" style="margin-top:9px;line-height:1.8">Suggested discussion: Review categories with missed questions, verify practical billing skills with supervised exercises, and document the final onboarding recommendation separately.</p>'+
 '<p class="tagline">Confidential training record · No patient information included.</p></div></div>';
}
function settings(){
 const config=state.assessments[0]||{id:"demo",duration_minutes:30,passing_percent:80,allowed_attempts:1};
 const canEdit=!demo()&&role()==="admin"&&!config.published;
 const form=role()==="admin"&&!demo()?
 '<div class="card spaced"><div class="section-heading"><h3>Administrator assessment controls</h3><span class="status '+(config.published?"amber":"blue")+'">'+(config.published?"Unpublish to edit":"Draft configuration")+'</span></div>'+
 '<p class="muted" style="margin-bottom:15px">Official assessments continue to draw exactly five questions from each of the five approved categories.</p>'+
 '<form id="settingsForm" class="settings-form"><input type="hidden" name="assessment_id" value="'+esc(config.id)+'"/>'+
 '<label>Duration (minutes)<input type="number" name="duration_minutes" min="10" max="120" required value="'+esc(config.duration_minutes)+'" '+(!canEdit?"disabled":"")+'/></label>'+
 '<label>Pass mark (%)<input type="number" name="passing_percent" min="50" max="100" required value="'+esc(config.passing_percent)+'" '+(!canEdit?"disabled":"")+'/></label>'+
 '<label>Allowed attempts<input type="number" name="allowed_attempts" min="1" max="3" required value="'+esc(config.allowed_attempts)+'" '+(!canEdit?"disabled":"")+'/></label>'+
 '<button class="primary" type="submit" '+(!canEdit?"disabled":"")+'>Save exam settings</button></form></div>':"";
 return header("Workspace settings","Configuration, privacy and account settings for RBOAS.")+
 '<div class="card"><div class="section-heading"><h3>System configuration</h3><span class="status green">Backend deployed</span></div><div class="settings-list">'+
 setRow("Application","Remote Billing Onboarding Assessment System")+
 setRow("Database","Supabase PostgreSQL (protected by role-based security)")+
 setRow("Authorization",demo()?"Presentation preview (no employee data)":label()+" · "+me())+
 setRow("Question bank","50 draft questions; approve against SOP before publishing")+
 setRow("Exam","25 random questions · 5 per category")+
 setRow("Scoring","Server-side submission and protected answer keys")+
 setRow("Reports","Role-limited score and category summaries")+
 setRow("Readiness","Presentation demo ready · Official onboarding not approved yet")+
 '</div></div>'+form+
 (!demo()?'<div class="spaced"><button class="outline" data-open-password>'+svg("lock")+' Set or change password</button></div>':'<div class="spaced"><button class="primary" data-action="login">'+svg("lock")+' Staff sign-in</button></div>');
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
function liveExamUi(){
 const exam=state.liveExam;
 if(!exam)return header("Official assessment","Start an assigned exam from My assessments.")+'<button class="outline" data-nav="assessments">Back to assessments</button>';
 if(exam.status==="submitted"||state.liveFinished){
  const score=Number(exam.score_percent||0);
  return '<div class="quiz-container">'+header("Assessment submitted","Your result has been saved securely.")+
  '<div class="card" style="text-align:center;padding:40px"><h2 style="font-size:30px">'+score+'%</h2><span class="status '+(exam.passed?"green":"amber")+'">'+(exam.passed?"Passed":"Training review recommended")+'</span>'+
  '<p class="muted" style="margin:20px 0">Your assessment outcome is recorded. Contact your trainer or manager about feedback and next steps.</p><button class="primary" data-nav="results">View results</button></div></div>';
 }
 const q=state.liveQuestions[state.liveIndex];
 if(!q)return header("Assessment unavailable","This exam did not provide any questions.");
 const answered=Object.keys(state.liveAnswers).length;
 const remain=Math.max(0,Math.ceil((Date.parse(exam.expires_at)-Date.now())/1000));
 const timer=String(Math.floor(remain/60)).padStart(2,"0")+":"+String(remain%60).padStart(2,"0");
 return '<div class="quiz-container">'+header("Official Billing Assessment","Your answers are saved to your secure assessment record.")+
 '<div class="notice">Submit before the timer expires. The exam can be resumed while still open. Your answers are saved after each selection.</div>'+
 '<div class="quiz-meta"><span>Question '+(state.liveIndex+1)+' / '+state.liveQuestions.length+'</span><span>'+answered+' answered</span><span>'+esc(q.category)+'</span><span style="color:#2573d7;font-weight:800" id="official-timer">'+timer+'</span></div>'+
 '<div class="quiz-progress"><div style="width:'+100*answered/state.liveQuestions.length+'%"></div></div>'+
 '<div class="card question-card"><p class="small-caps">SECURE EXAM · CHOOSE ONE ANSWER</p><h2>'+esc(q.prompt)+'</h2>'+
 '<div class="answers">'+q.options.map((v,i)=>'<button class="option '+(state.liveAnswers[q.id]===i?"chosen":"")+'" data-live-answer="'+i+'" '+(state.liveSubmitting?"disabled":"")+'><span class="option-index">'+String.fromCharCode(65+i)+'</span>'+esc(v)+'</button>').join("")+'</div>'+
 '<div class="quiz-footer"><button class="outline" data-live-prev '+(state.liveIndex===0?"disabled":"")+'>Previous</button><button class="primary" data-live-next>'+ (state.liveIndex===state.liveQuestions.length-1?"Submit assessment":"Next question")+' '+svg("arrow")+'</button></div>'+
 '<div class="divider"></div><p class="muted" style="margin-bottom:12px">Question navigation</p><div class="question-jump">'+state.liveQuestions.map((v,i)=>'<button class="jump '+(i===state.liveIndex?"current":state.liveAnswers[v.id]!==undefined?"answered":"")+'" data-live-jump="'+i+'">'+(i+1)+'</button>').join("")+'</div></div></div>';
}
async function api(action,payload={}){
 if(!state.client)throw new Error("Authentication client is not available");
 const response=await state.client.functions.invoke("rboas-api",{body:{action,...payload}});
 if(response.error) {
   const server=response.error.context;
   let detail=response.error.message;
   if(server&&typeof server.json==="function")try{const parsed=await server.json();detail=parsed.error||detail}catch{}
   throw new Error(detail);
 }
 if(response.data&&response.data.error)throw new Error(response.data.error);
 return response.data&&response.data.data;
}
async function reload(){await loadData();render();}
async function beginOfficial(assignment_id){
 const started=await api("exam_start",{assignment_id});
 const received=await api("exam_get",{attempt_id:started.attempt_id});
 state.liveExam=received.attempt;
 state.liveQuestions=received.questions||[];
 state.liveAnswers=received.answers||{};
 state.liveIndex=0;state.liveFinished=false;state.page="take";render();
}
async function submitOfficial(){
 if(!window.confirm("Submit your official assessment? You cannot change answers afterward."))return;
 state.liveSubmitting=true;
 try{
  const result=await api("exam_submit",{attempt_id:state.liveExam.id});
  state.liveExam={...state.liveExam,...result,status:"submitted"};
  state.liveFinished=true;await loadData();render();toast("Official assessment submitted");
 }catch(e){toast(e.message||"Submission failed")}finally{state.liveSubmitting=false;}
}
function initAssignmentForm(){
 const t=document.getElementById("assignmentTrainee"),a=document.getElementById("assignmentAssessment");
 t.innerHTML=state.trainees.filter(x=>x.active).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.display_name+' · Store '+(x.store_code||"—"))+'</option>').join("");
 a.innerHTML=state.assessments.filter(x=>x.published).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+'</option>').join("");
}
async function openReport(id){
 if(demo()){
   const row=currentResults().find(x=>x.id===id);
   if(!row)return;
   state.reportDetail={
    trainee:{display_name:row.name,store_code:row.store_code,employee_code:id},
    attempt:{score_percent:row.score_percent,passed:row.passed,correct_count:Math.round(row.score_percent*.25),
      answered:25,total:25,submitted_at:row.submitted_at,category_breakdown:sampleCategoryBreakdown()}
   };
 }else{
   state.reportDetail=await api("report_attempt",{attempt_id:id});
 }
 state.page="report";render();window.scrollTo({top:0,behavior:"smooth"});
}
function exportResultsCSV(){
 const rows=currentResults();
 const safeValue=(v)=>{
  let t=String(v==null?"":v);
  if(/^[=+\-@\t\r]/.test(t))t="'"+t;
  return '"'+t.replace(/"/g,'""')+'"';
 };
 const header=["Trainee","Store","Score (%)","Result","Submitted at","Record"];
 const values=[header,...rows.map(x=>[x.name,x.store_code,x.score_percent,x.passed?"Passed":"Review",x.submitted_at||"",x.id])];
 const csv=values.map(x=>x.map(safeValue).join(",")).join("\r\n");
 const objectUrl=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=objectUrl;a.download="rboas-assessment-summary.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
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
 if(p.error||!p.data){await state.client.auth.signOut();state.signedIn=false;throw Error("Account not activated. Contact an RBOAS administrator.");}state.profile=p.data;
 if(state.profile.active===false){await state.client.auth.signOut();state.signedIn=false;throw Error("Account disabled. Contact your administrator.");}
 state.signedIn=true;await loadData();
}
async function loadData(){
 if(!state.client||!state.signedIn)return;
 const admin=state.role==="admin",manager=state.role==="manager";
 const results=await Promise.all([
  admin||manager?state.client.from("user_profiles").select("id,display_name,employee_code,store_code,active,created_at").order("created_at",{ascending:false}):Promise.resolve({data:[]}),
  admin||manager?state.client.from("question_bank").select("id,category,prompt,difficulty,active").order("created_at",{ascending:false}):Promise.resolve({data:[]}),
  state.client.from("assessments").select("id,title,description,published,duration_minutes,passing_percent,question_count,allowed_attempts"),
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
 const detail=e.target.closest("[data-report-id]");
 if(detail){try{await openReport(detail.dataset.reportId)}catch(err){toast(err.message||"Report unavailable")}return;}
 const passwordButton=e.target.closest("[data-open-password]");
 if(passwordButton){if(!state.signedIn){toast("Sign in to change your password");return;}document.getElementById("passwordDialog").showModal();return;}
 const edit=e.target.closest("[data-edit-employee]");
 if(edit){
  try{
   const staff=await api("staff_get",{id:edit.dataset.editEmployee});
   const form=document.getElementById("staffForm");
   form.elements.namedItem("id").value=staff.id;
   form.elements.namedItem("display_name").value=staff.display_name;
   form.elements.namedItem("employee_code").value=staff.employee_code||"";
   form.elements.namedItem("store_code").value=staff.store_code||"";
   form.elements.namedItem("role").value=staff.role==="manager"?"manager":"trainee";
   form.elements.namedItem("active").checked=Boolean(staff.active);
   const list=document.getElementById("staffManager");
   list.innerHTML='<option value="">Unassigned</option>'+state.trainees.filter(x=>x.active&&x.id!==staff.id).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.display_name)+'</option>').join("");
   list.value=staff.manager_id||"";
   document.getElementById("staffDialog").showModal();
  }catch(err){toast(err.message||"Could not load staff record");}
  return;
 }
 const close=e.target.closest("[data-close-dialog]");
 if(close){document.getElementById(close.dataset.closeDialog)?.close();return;}
 const open=e.target.closest("[data-open-dialog]");
 if(open){if(!state.signedIn||role()!=="admin"){toast("Administrator access required");return;}if(open.dataset.openDialog==="assignmentDialog")initAssignmentForm();document.getElementById(open.dataset.openDialog)?.showModal();return;}
 const approve=e.target.closest("[data-approve-q]");
 if(approve){if(!window.confirm("Only approve this question if it matches the current approved SOP. Continue?"))return;
  try{await api("question_approve",{id:approve.dataset.approveQ,active:approve.dataset.nextStatus==="true"});await reload();toast("Question status updated");}catch(err){toast(err.message)}return;}
 const publish=e.target.closest("[data-publish-assessment]");
 if(publish){if(!window.confirm("Publish only after all assessment questions have been reviewed and approved. Continue?"))return;
  try{await api("assessment_publish",{id:publish.dataset.publishAssessment,published:publish.dataset.publishStatus==="true"});await reload();toast("Assessment status updated");}catch(err){toast(err.message)}return;}
 const begin=e.target.closest("[data-start-assignment]");
 if(begin){try{await beginOfficial(begin.dataset.startAssignment)}catch(err){toast(err.message)}return;}
 const pick=e.target.closest("[data-live-answer]");
 if(pick){const q=state.liveQuestions[state.liveIndex];state.liveSubmitting=true;
  try{await api("exam_answer",{attempt_id:state.liveExam.id,question_id:q.id,selected_index:Number(pick.dataset.liveAnswer)});state.liveAnswers[q.id]=Number(pick.dataset.liveAnswer);render();}catch(err){toast(err.message)}finally{state.liveSubmitting=false;}return;}
 const jumpLive=e.target.closest("[data-live-jump]");if(jumpLive){state.liveIndex=Number(jumpLive.dataset.liveJump);render();return;}
 if(e.target.closest("[data-live-prev]")){state.liveIndex=Math.max(0,state.liveIndex-1);render();return;}
 if(e.target.closest("[data-live-next]")){if(state.liveIndex===state.liveQuestions.length-1)await submitOfficial();else{state.liveIndex++;render();}return;}
 const menu=e.target.closest("#mobileMenu");if(menu){document.getElementById("sidebar")?.classList.toggle("open");return;}
 const link=e.target.closest("[data-nav]");if(link){e.preventDefault();if(link.dataset.nav==="practice"&&!state.practiceStarted)preparePractice();state.page=link.dataset.nav;document.getElementById("sidebar")?.classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});render();return;}
 const ch=e.target.closest("[data-choice]");if(ch){state.choices[state.question]=Number(ch.dataset.choice);render();return;}const jump=e.target.closest("[data-jump]");if(jump){state.question=Number(jump.dataset.jump);render();return;}
 const btn=e.target.closest("[data-action]");if(!btn)return;
 const action=btn.dataset.action;
 if(action==="exportReportCSV"){exportResultsCSV();return;}
 if(action==="printOverview"||action==="printDetail"){window.print();return;}
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

async function handleAdminForm(formId,messageId,build,action,dialogId){
 const form=document.getElementById(formId),msg=document.getElementById(messageId);
 form.addEventListener("submit",async e=>{
  e.preventDefault();msg.textContent="";
  const button=form.querySelector('[type="submit"]');button.disabled=true;
  try{const data=build(new FormData(form));await api(action,data);form.reset();document.getElementById(dialogId).close();await reload();toast(action==="invite"?"Invitation sent":"Changes saved");}
  catch(err){msg.textContent=err.message||"Operation failed";}finally{button.disabled=false;}
 });
}
document.addEventListener("submit",async e=>{
 if(e.target.id!=="settingsForm")return;
 e.preventDefault();
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const form=new FormData(e.target);
  await api("assessment_settings",{
   assessment_id:form.get("assessment_id"),
   duration_minutes:Number(form.get("duration_minutes")),
   passing_percent:Number(form.get("passing_percent")),
   allowed_attempts:Number(form.get("allowed_attempts"))
  });
  await reload();toast("Settings saved");
 }catch(err){toast(err.message||"Unable to save settings");}
 finally{button.disabled=false;}
});
document.getElementById("passwordForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.target,message=document.getElementById("passwordMessage");
 message.textContent="";
 const pass=form.elements.namedItem("password").value,confirm=form.elements.namedItem("confirm").value;
 if(pass.length<12){message.textContent="Use at least 12 characters.";return;}
 if(pass!==confirm){message.textContent="Passwords do not match.";return;}
 const submit=form.querySelector('[type="submit"]');submit.disabled=true;
 try{
  if(!state.client||!state.signedIn)throw new Error("Sign in before changing your password.");
  const r=await state.client.auth.updateUser({password:pass});
  if(r.error)throw r.error;
  form.reset();document.getElementById("passwordDialog").close();
  toast("Password updated securely");
 }catch(err){message.textContent=err.message||"Unable to set password.";}finally{submit.disabled=false;}
});

handleAdminForm("inviteForm","inviteMessage",f=>({
 display_name:f.get("display_name"),email:f.get("email"),store_code:f.get("store_code"),employee_code:f.get("employee_code"),role:f.get("role")
}),"invite","inviteDialog");
handleAdminForm("questionForm","questionMessage",f=>({
 category:f.get("category"),prompt:f.get("prompt"),
 options:[f.get("option0"),f.get("option1"),f.get("option2"),f.get("option3")],
 correct:Number(f.get("correct")),difficulty:f.get("difficulty")
}),"question_save","questionDialog");
handleAdminForm("staffForm","staffMessage",f=>({
 id:f.get("id"),display_name:f.get("display_name"),employee_code:f.get("employee_code"),
 store_code:f.get("store_code"),manager_id:f.get("manager_id"),
 active:document.getElementById("staffActive").checked,role:f.get("role")
}),"staff_update","staffDialog");
handleAdminForm("assignmentForm","assignmentMessage",f=>({
 trainee_id:f.get("trainee_id"),assessment_id:f.get("assessment_id")
}),"assignment_create","assignmentDialog");

setInterval(()=>{if(state.page==="take"&&state.liveExam&&state.liveExam.status==="in_progress"){const el=document.getElementById("official-timer");if(el){const n=Math.max(0,Math.ceil((Date.parse(state.liveExam.expires_at)-Date.now())/1000));el.textContent=String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");if(n===0)toast("Time expired. Submit your recorded answers.");}}},1000);
render();initializeAuth();