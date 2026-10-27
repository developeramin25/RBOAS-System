import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://dgusnyfhcizbmdmryjbj.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_swxw_VUy3QCvdtmEbSdNBA_DIN1t5sg'

export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
})
export const STORES = [
  { id:'475', label:'475 New Lots Avenue' },
  { id:'904', label:'904 Prospect' },
  { id:'872', label:'872 Rockaway' },
  { id:'1030', label:'1030' },
  { id:'1070', label:'1070 Southern Boulevard' },
  { id:'864', label:'864 Tremont' },
  { id:'1101', label:'1101 Jefferson' },
]
export const TRAINING_CATEGORIES = [
  'Module 1: Refill Processing',
  'Module 2: New Prescription Processing',
  'Module 3: Insurance Billing Basics',
  'Module 4: SIG Codes and Documentation',
  'Module 5: Common Rejections and Troubleshooting',
  'Module 6: Follow-Up Tags and Queue Management',
  'Practical Application: Medication-Specific Calculations',
  'LTC Billing','Coupons & Follow-Up'
]
export type UserRole = 'admin'|'manager'|'hr'|'trainee'
export interface StaffProfile {
  id:string; email:string; display_name:string; store_code:string|null;
  manager_id:string|null; employee_code:string|null; active:boolean; created_at?:string
}
export interface AccessRequest {
  id:string; email:string; display_name:string; requested_role:'manager'|'hr';
  store_code:string|null; status:string; email_verified:boolean; created_at:string
}
export interface Assessment {
  id:string;title:string;description:string|null;published:boolean;
  question_count:number;duration_minutes:number;passing_percent:number;allowed_attempts:number
}
export interface Question {
  id:string;category:string;prompt?:string;active:boolean;
  source_kind?:string;source_number?:number;difficulty?:string
}
export interface Assignment {
  id:string;assessment_id:string;trainee_id:string;status:string;
  available_from:string|null;due_at:string|null;assigned_at:string
}
export interface Attempt {
  id:string;assignment_id:string;trainee_id:string;status:string;
  score_percent:number|null;passed:boolean|null;submitted_at:string|null;started_at:string
}
export interface OverviewData {
  people:StaffProfile[]; assessments:Assessment[];questions:Question[];
  assignments:Assignment[];attempts:Attempt[];
  current_user:{id:string;role:UserRole;display_name:string;store_code:string|null}
}
export interface ExamQuestion {
  id:string;prompt:string;category:string;options:string[];position:number
}
export interface ExamState {
  attempt:{id:string;expires_at:string;status:string;score_percent:number|null;passed:boolean|null};
  questions:ExamQuestion[]; answers:Record<string,number>
}
export interface ExamReport {
  trainee:{display_name:string;store_code:string|null;employee_code:string|null};
  attempt:{id:string;score_percent:number;passed:boolean;correct_count:number;answered:number;
  total:number;submitted_at:string;category_breakdown:{category:string;correct:number;total:number}[]}
}
export async function callApi<T=unknown>(action:string,body:Record<string,unknown>={}) :Promise<T>{
  const {data,error}=await supabase.functions.invoke('rboas-api',{body:{action,...body}})
  if(error){
    let message=error.message
    const context=error.context
    if(context && typeof context.json==='function'){
      try{const json=await context.json() as {error?:string};message=json.error||message}catch{/* malformed error */}
    }
    throw Error(message||'The service could not complete this request')
  }
  if(data?.error)throw Error(data.error)
  return data.data as T
}
export function fmtDate(value?:string|null){
  if(!value)return '—'
  const d=new Date(value)
  return Number.isNaN(d.valueOf())?'—':d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})
}
export function shortName(value:string){return value.split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase()}
export function roleLabel(role:UserRole){return role==='admin'?'Administrator':role==='hr'?'Human Resources':role==='manager'?'Branch Manager':'Trainee'}
