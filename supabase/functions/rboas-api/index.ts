import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const URL=Deno.env.get("SUPABASE_URL")||"";
const SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const supabase=createClient(URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const CATS=["ERX Processing","Refill Processing","Insurance & Rejections","LTC Billing","Coupons & Follow-Up"];
const ORIGINS=["https://astonishing-beijinho-a0f70b.netlify.app","https://rboas-assessment.netlify.app","http://localhost:8888","http://localhost:5173"];
function headers(req:Request){const origin=req.headers.get("origin")||"";return {
 "Access-Control-Allow-Origin":ORIGINS.includes(origin)?origin:ORIGINS[0],
 "Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info",
 "Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin","Cache-Control":"no-store",
 "Content-Type":"application/json"};}
function json(req:Request,content:unknown,status=200){return new Response(JSON.stringify(content),{status,headers:headers(req)});}
class RequestError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;}}
const bad=(message:string,status=400):never=>{throw new RequestError(message,status);};
const ok=<T>(r:{data:T,error:any}):T=>{if(r.error)bad(r.error.message,400);return r.data;};
const uid=(value:unknown)=>{if(typeof value!=="string"||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value))bad("Invalid identifier");return value;};
const text=(value:unknown,label:string,max=200,min=1)=>{if(typeof value!=="string"||value.trim().length<min||value.trim().length>max)bad("Invalid "+label);return value.trim();};
function randomInt(max:number){const bytes=new Uint32Array(1);const limit=Math.floor(4294967296/max)*max;let n=0;do{crypto.getRandomValues(bytes);n=bytes[0]}while(n>=limit);return n%max;}
function shuffle<T>(array:T[]):T[]{const arr=[...array];for(let i=arr.length-1;i>0;i--){const j=randomInt(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
async function record(actor:string,action:string,entity_type:string,entity_id:string|null,metadata:object={}){const r=await supabase.from("audit_logs").insert({actor_id:actor,action,entity_type,entity_id,metadata});if(r.error)console.warn("audit failed",r.error.message);}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=="POST")return json(req,{error:"POST only"},405);
 if(!URL||!SERVICE_KEY)return json(req,{error:"Backend not configured"},503);
 try{
  const bearer=(req.headers.get("authorization")||"").replace(/^Bearer /i,"");
  if(!bearer)bad("Authentication required",401);
  const result=await supabase.auth.getUser(bearer);
  const user=result.data.user;
  if(result.error||!user)bad("Session invalid",401);
  const person=ok(await supabase.from("user_profiles").select("id,active,display_name").eq("id",user.id).maybeSingle());
  if(!person||!person.active)bad("RBOAS account not activated",403);
  const role=user.app_metadata?.rboas_role||"trainee";
  let body:any;try{body=await req.json()}catch{bad("Invalid JSON");}
  const action=text(body?.action,"action",40);
  const adminOnly=()=>{if(role!=="admin")bad("Administrator role required",403);};
  const staffOnly=()=>{if(role!=="admin"&&role!=="manager")bad("Manager role required",403);};
  const ownAttempt=async(value:unknown)=>{
   const attempt=ok(await supabase.from("assessment_attempts").select("*").eq("id",uid(value)).maybeSingle());
   if(!attempt||attempt.trainee_id!==user.id)bad("Attempt not found",404);
   return attempt;
  };
  let data:any=null;
  switch(action){
   case "reports_summary":{
    if(role!=="admin"&&role!=="manager")bad("Staff access required",403);
    const people=ok(await supabase.from("user_profiles").select("id,display_name,store_code,manager_id,active").order("created_at",{ascending:false}));
    const allowed=role==="admin"?people:people.filter((p:any)=>p.manager_id===user.id);
    const allowedIds=allowed.map((p:any)=>p.id);
    const attempts=allowedIds.length?ok(await supabase.from("assessment_attempts")
      .select("id,trainee_id,assignment_id,score_percent,passed,status,started_at,submitted_at,correct_count")
      .in("trainee_id",allowedIds).order("started_at",{ascending:false}).limit(1000)):[];
    const assignments=allowedIds.length?ok(await supabase.from("assessment_assignments")
      .select("id,trainee_id,assessment_id,status,assigned_at,due_at")
      .in("trainee_id",allowedIds).order("assigned_at",{ascending:false}).limit(1000)):[];
    data={people:allowed,attempts,assignments};break;
   }
   case "report_attempt":{
    const attemptId=uid(body.attempt_id);
    const attempt=ok(await supabase.from("assessment_attempts").select("*").eq("id",attemptId).maybeSingle());
    if(!attempt||attempt.status!=="submitted")bad("Submitted attempt not found",404);
    if(attempt.trainee_id!==user.id && role!=="admin"){
      if(role!=="manager")bad("Report access denied",403);
      const managed=ok(await supabase.from("user_profiles").select("manager_id").eq("id",attempt.trainee_id).maybeSingle());
      if(!managed||managed.manager_id!==user.id)bad("Report access denied",403);
    }
    const questions=ok(await supabase.from("attempt_questions").select("id,question_id,displayed_options").eq("attempt_id",attempt.id));
    if(!questions.length)bad("No assessment questions found");
    const qids=questions.map((x:any)=>x.question_id);
    const ids=questions.map((x:any)=>x.id);
    const [bankResult,answerResult,keyResult,personResult]=await Promise.all([
      supabase.from("question_bank").select("id,category,options").in("id",qids),
      supabase.from("attempt_answers").select("attempt_question_id,selected_index").in("attempt_question_id",ids),
      supabase.rpc("rboas_get_scoring_keys",{p_question_ids:qids}),
      supabase.from("user_profiles").select("id,display_name,store_code,employee_code").eq("id",attempt.trainee_id).single()
    ]);
    const bank=ok(bankResult),answers=ok(answerResult),keys=ok(keyResult),person=ok(personResult);
    const bankMap=new Map(bank.map((x:any)=>[x.id,x]));
    const answerMap=new Map(answers.map((x:any)=>[x.attempt_question_id,x.selected_index]));
    const keyMap=new Map(keys.map((x:any)=>[x.question_id,x.correct_option_index]));
    const breakdown=CATS.map(name=>({category:name,correct:0,total:0}));
    let answered=0;
    for(const row of questions){
      const q=bankMap.get(row.question_id),correct=keyMap.get(row.question_id);
      if(!q||correct===undefined)bad("Scoring data unavailable",503);
      const item=breakdown.find(x=>x.category===q.category);
      if(!item)bad("Unknown assessment category",503);
      item.total++;
      const chosen=answerMap.get(row.id);
      if(chosen!==undefined){
        answered++;
        if(row.displayed_options[chosen]===q.options[correct])item.correct++;
      }
    }
    data={attempt:{
      id:attempt.id,score_percent:attempt.score_percent,passed:attempt.passed,
      correct_count:attempt.correct_count,submitted_at:attempt.submitted_at,
      started_at:attempt.started_at,answered,total:questions.length,
      category_breakdown:breakdown
    },trainee:person};
    break;
   }
   case "assessment_settings":{
    adminOnly();
    const assessment_id=uid(body.assessment_id);
    const duration_minutes=Number(body.duration_minutes);
    const passing_percent=Number(body.passing_percent);
    const allowed_attempts=Number(body.allowed_attempts);
    if(!Number.isInteger(duration_minutes)||duration_minutes<10||duration_minutes>120)bad("Duration must be 10 to 120 minutes");
    if(!Number.isInteger(passing_percent)||passing_percent<50||passing_percent>100)bad("Pass mark must be 50-100%");
    if(!Number.isInteger(allowed_attempts)||allowed_attempts<1||allowed_attempts>3)bad("Attempts must be 1-3");
    const existing=ok(await supabase.from("assessments").select("id,published").eq("id",assessment_id).maybeSingle());
    if(!existing)bad("Assessment not found",404);
    if(existing.published)bad("Unpublish before changing exam settings");
    data=ok(await supabase.from("assessments").update({
      duration_minutes,passing_percent,allowed_attempts
    }).eq("id",assessment_id).select("id,duration_minutes,passing_percent,allowed_attempts").single());
    await record(user.id,"update_assessment_settings","assessments",assessment_id,data);
    break;
   }
   case "invite":{
    adminOnly();const email=text(body.email,"email",254,6).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))bad("Invalid email");
    const display_name=text(body.display_name,"name",120,2);
    const store_code=typeof body.store_code==="string"?body.store_code.trim().slice(0,30):null;
    const employee_code=typeof body.employee_code==="string"?body.employee_code.trim().slice(0,30):null;
    const newRole=["trainee","manager"].includes(body.role)?body.role:"trainee";
    const manager_id=body.manager_id?uid(body.manager_id):null;
    const invited=ok(await supabase.auth.admin.inviteUserByEmail(email,{data:{display_name}}));
    if(!invited?.user)bad("Invitation was not created");
    const invitedUser=invited.user;
    ok(await supabase.auth.admin.updateUserById(invitedUser.id,{app_metadata:{...(invitedUser.app_metadata||{}),rboas_role:newRole}}));
    data=ok(await supabase.from("user_profiles").upsert({id:invitedUser.id,email,display_name,store_code,employee_code,manager_id,active:true},{onConflict:"id"}).select("id,display_name,email,store_code").single());
    await record(user.id,"invite_user","user_profiles",invitedUser.id,{role:newRole});
    break;
   }
   case "question_save":{
    adminOnly();
    const category=text(body.category,"category",80);
    if(!CATS.includes(category))bad("Unknown category");
    const prompt=text(body.prompt,"question",2000,10);
    if(!Array.isArray(body.options)||body.options.length!==4)bad("Four answer choices required");
    const options=body.options.map((o:unknown)=>text(o,"answer choice",400,1));
    if(new Set(options.map((o:string)=>o.toLowerCase())).size!==4)bad("Answer choices must be different");
    const correct=Number(body.correct);if(!Number.isInteger(correct)||correct<0||correct>3)bad("Choose a correct answer");
    const difficulty=["basic","intermediate","advanced"].includes(body.difficulty)?body.difficulty:"basic";
    let id:string;
    if(body.id){id=uid(body.id);ok(await supabase.from("question_bank").update({category,prompt,options,difficulty,active:false}).eq("id",id));}
    else {const inserted=ok(await supabase.from("question_bank").insert({category,prompt,options,difficulty,active:false,created_by:user.id}).select("id").single());id=inserted.id;}
    ok(await supabase.rpc("rboas_upsert_answer_key",{p_question_id:id,p_correct_index:correct,p_explanation:typeof body.explanation==="string"?body.explanation.slice(0,1500):null}));
    await record(user.id,"save_draft_question","question_bank",id);
    data={id,status:"draft"};break;
   }
   case "question_approve":{
    adminOnly();const id=uid(body.id);
    const q=ok(await supabase.from("question_bank").select("id").eq("id",id).maybeSingle());
    if(!q)bad("Question not found",404);
    ok(await supabase.from("question_bank").update({active:Boolean(body.active)}).eq("id",id));
    await record(user.id,"set_question_active","question_bank",id,{active:Boolean(body.active)});
    data={id,active:Boolean(body.active)};break;
   }
   case "assessment_publish":{
    adminOnly();const id=uid(body.id);
    const publishing=Boolean(body.published);
    if(publishing){
     const list=ok(await supabase.from("question_bank").select("category").eq("active",true));
     if(CATS.some(category=>list.filter((x:any)=>x.category===category).length<5))bad("Review and approve at least five questions from each category before publishing");
    }
    const changed=ok(await supabase.from("assessments").update({published:publishing}).eq("id",id).select("id,published").single());
    await record(user.id,"publish_assessment","assessments",id,{published:publishing});data=changed;break;
   }
   case "assignment_create":{
    adminOnly();
    const trainee_id=uid(body.trainee_id),assessment_id=uid(body.assessment_id);
    const trainee=ok(await supabase.from("user_profiles").select("id,active").eq("id",trainee_id).maybeSingle());
    const assessment=ok(await supabase.from("assessments").select("id,published").eq("id",assessment_id).maybeSingle());
    if(!trainee||!trainee.active||!assessment||!assessment.published)bad("Trainee must be active and assessment must be published");
    data=ok(await supabase.from("assessment_assignments").insert({trainee_id,assessment_id,assigned_by:user.id,due_at:body.due_at||null}).select("id,status").single());
    await record(user.id,"assign_assessment","assessment_assignments",data.id);break;
   }
   case "exam_start":{
    const assignment_id=uid(body.assignment_id);
    const assignment=ok(await supabase.from("assessment_assignments").select("*").eq("id",assignment_id).maybeSingle());
    if(!assignment||assignment.trainee_id!==user.id)bad("Assessment assignment not found",404);
    if(assignment.status==="cancelled")bad("Assignment cancelled");
    const config=ok(await supabase.from("assessments").select("*").eq("id",assignment.assessment_id).single());
    if(!config.published)bad("Assessment unavailable");
    const attempts=ok(await supabase.from("assessment_attempts").select("*").eq("assignment_id",assignment.id).order("attempt_number",{ascending:false}));
    const running=attempts.find((a:any)=>a.status==="in_progress");
    if(running){data={attempt_id:running.id};break;}
    if(attempts.length>=config.allowed_attempts)bad("No attempts remaining");
    const bank=ok(await supabase.from("question_bank").select("id,category,options").eq("active",true));
    const pick=CATS.flatMap(category=>shuffle(bank.filter((q:any)=>q.category===category)).slice(0,5));
    if(pick.length!==25)bad("Assessment question bank is incomplete");
    const expires_at=new Date(Date.now()+config.duration_minutes*60*1000).toISOString();
    const newAttempt=ok(await supabase.from("assessment_attempts").insert({
      assignment_id:assignment.id,trainee_id:user.id,attempt_number:attempts.length+1,expires_at
    }).select("id").single());
    const rows=shuffle(pick).map((q:any,i:number)=>({
      attempt_id:newAttempt.id,question_id:q.id,position:i+1,displayed_options:shuffle(q.options)
    }));
    const ins=await supabase.from("attempt_questions").insert(rows);
    if(ins.error){await supabase.from("assessment_attempts").delete().eq("id",newAttempt.id);bad("Unable to prepare questions");}
    ok(await supabase.from("assessment_assignments").update({status:"in_progress"}).eq("id",assignment.id));
    await record(user.id,"start_assessment","assessment_attempts",newAttempt.id);
    data={attempt_id:newAttempt.id};break;
   }
   case "exam_get":{
    const attempt=await ownAttempt(body.attempt_id);
    const rows=ok(await supabase.from("attempt_questions").select("id,question_id,position,displayed_options").eq("attempt_id",attempt.id).order("position"));
    const ids=rows.map((x:any)=>x.question_id);
    const questions=ids.length?ok(await supabase.from("question_bank").select("id,prompt,category").in("id",ids)):[];
    const byId=new Map(questions.map((q:any)=>[q.id,q]));
    const answers=ok(await supabase.from("attempt_answers").select("attempt_question_id,selected_index").in("attempt_question_id",rows.map((x:any)=>x.id)));
    data={attempt:{id:attempt.id,status:attempt.status,expires_at:attempt.expires_at,score_percent:attempt.status==="submitted"?attempt.score_percent:null,passed:attempt.status==="submitted"?attempt.passed:null},
      questions:rows.map((r:any)=>({id:r.id,position:r.position,category:byId.get(r.question_id)?.category||"",prompt:byId.get(r.question_id)?.prompt||"",options:r.displayed_options})),
      answers:Object.fromEntries(answers.map((a:any)=>[a.attempt_question_id,a.selected_index]))};break;
   }
   case "exam_answer":{
    const attempt=await ownAttempt(body.attempt_id);
    if(attempt.status!=="in_progress"||Date.now()>Date.parse(attempt.expires_at))bad("Assessment closed");
    const question_id=uid(body.question_id);
    const selected_index=Number(body.selected_index);
    if(!Number.isInteger(selected_index)||selected_index<0||selected_index>3)bad("Invalid choice");
    const question=ok(await supabase.from("attempt_questions").select("id").eq("id",question_id).eq("attempt_id",attempt.id).maybeSingle());
    if(!question)bad("Question not part of this attempt");
    ok(await supabase.from("attempt_answers").upsert({attempt_question_id:question.id,selected_index,saved_at:new Date().toISOString()},{onConflict:"attempt_question_id"}));
    data={saved:true};break;
   }
   case "exam_submit":{
    const attempt=await ownAttempt(body.attempt_id);
    if(attempt.status==="submitted"){data={score_percent:attempt.score_percent,passed:attempt.passed,correct_count:attempt.correct_count};break;}
    const rows=ok(await supabase.from("attempt_questions").select("id,question_id,displayed_options").eq("attempt_id",attempt.id));
    const submitted=ok(await supabase.from("attempt_answers").select("attempt_question_id,selected_index").in("attempt_question_id",rows.map((x:any)=>x.id)));
    const keys=ok(await supabase.rpc("rboas_get_scoring_keys",{p_question_ids:rows.map((x:any)=>x.question_id)}));
    const questions=ok(await supabase.from("question_bank").select("id,options").in("id",rows.map((x:any)=>x.question_id)));
    const keyMap=new Map(keys.map((x:any)=>[x.question_id,x.correct_option_index]));
    const questionMap=new Map(questions.map((x:any)=>[x.id,x.options]));
    const answerMap=new Map(submitted.map((x:any)=>[x.attempt_question_id,x.selected_index]));
    let correct_count=0;
    for(const row of rows){
      const answer=answerMap.get(row.id), original=questionMap.get(row.question_id);
      const correctIndex=keyMap.get(row.question_id);
      if(!original||correctIndex===undefined)bad("Unable to score incomplete key set",503);
      const expected=original[correctIndex];
      if(answer!==undefined && row.displayed_options[answer]===expected)correct_count++;
    }
    const percentage=Number((100*correct_count/rows.length).toFixed(2));
    const setting=ok(await supabase.from("assessment_assignments").select("assessment_id").eq("id",attempt.assignment_id).single());
    const config=ok(await supabase.from("assessments").select("passing_percent").eq("id",setting.assessment_id).single());
    const passed=percentage>=config.passing_percent;
    ok(await supabase.from("assessment_attempts").update({status:"submitted",submitted_at:new Date().toISOString(),correct_count,score_percent:percentage,passed}).eq("id",attempt.id).eq("status","in_progress"));
    ok(await supabase.from("assessment_assignments").update({status:"completed"}).eq("id",attempt.assignment_id));
    await record(user.id,"submit_assessment","assessment_attempts",attempt.id,{score_percent:percentage,passed});
    data={score_percent:percentage,passed,correct_count,question_count:rows.length};break;
   }
   default:bad("Unsupported action",404);
  }
  return json(req,{data});
 }catch(err){const status=err instanceof RequestError?err.status:500;console.error("RBOAS operation:",err instanceof Error?err.message:"unknown");return json(req,{error:err instanceof RequestError?err.message:"Unexpected server error"},status);}
});
