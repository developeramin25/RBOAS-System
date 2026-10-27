import {useState} from 'react'
import type {FormEvent,ReactNode} from 'react'
import {ArrowRight,BookOpenCheck,CheckCircle2,Eye,EyeOff,HelpCircle,LockKeyhole,Mail,ShieldCheck,UserRound,MapPin} from 'lucide-react'
import {callApi,supabase,STORES,roleLabel} from './lib'
import type {Identity} from './useAuth'

type Props={identity:Identity;go:(route:string)=>void;refresh:()=>Promise<void>;notify:(text:string)=>void}
type FormRole='manager'|'hr'|'admin'
const Field=({label,children,help}:{label:string;children:ReactNode;help?:string})=>
  <label className="auth-field"><span>{label}</span>{children}{help&&<small>{help}</small>}</label>
function Password({value,onChange,placeholder='Enter password',required=true}:{
  value:string;onChange:(value:string)=>void;placeholder?:string;required?:boolean
}){
  const [visible,setVisible]=useState(false)
  return <div className="auth-input-wrap"><LockKeyhole size={16} className="input-leading"/>
    <input type={visible?'text':'password'} minLength={required?12:undefined} required={required}
      value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete="new-password"/>
    <button aria-label={visible?'Hide password':'Show password'} type="button" className="input-eye"
      onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={16}/>:<Eye size={16}/>}</button>
  </div>
}
function AuthFrame({children,title,description,tag}:{children:ReactNode;title:string;description:string;tag:string}){
  return <main className="auth-root">
    <div className="auth-glow"/>
    <div className="auth-card">
      <div className="auth-mini-brand"><span className="auth-brand-mark"><BookOpenCheck size={20}/></span>
        <span>RBOAS <small>Training & Assessment</small></span></div>
      <div className="auth-eyebrow">{tag}</div>
      <h1>{title}</h1><p className="auth-subtitle">{description}</p>
      {children}
      <div className="auth-footer"><ShieldCheck size={16}/> Secure access powered by Supabase Authentication</div>
    </div>
    <div className="auth-copyright">Remote Billing Onboarding Assessment System · Boca Pharmacy Group</div>
  </main>
}
function TabNav({go,active,trainee=false}:{go:(route:string)=>void;active:'login'|'register';trainee?:boolean}){
  return <div className="auth-tabs" role="tablist" aria-label="Account access">
    <button role="tab" aria-selected={active==='login'} className={active==='login'?'active':''}
      onClick={()=>go(trainee?'/trainee-login':'/login')}>Log in</button>
    <button role="tab" aria-selected={active==='register'} className={active==='register'?'active':''}
      disabled={trainee} onClick={()=>go('/register')}>{trainee?'Invitation only':'Request access'}</button>
  </div>
}
function ErrorStatus({message,success=false}:{message:string;success?:boolean}){
  return message?<div role="status" className={'auth-feedback '+(success?'success':'error')}>{success?<CheckCircle2 size={18}/>:<HelpCircle size={18}/>}<span>{message}</span></div>:null
}
export function Register({go,notify}:Props){
  const [role,setRole]=useState<FormRole>('manager')
  const [name,setName]=useState('')
  const [store,setStore]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirm,setConfirm]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [submitted,setSubmitted]=useState(false)
  const manager=role==='manager',admin=role==='admin'
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError('');setSubmitted(false)
    if(!name.trim()||name.trim().length<2){setError('Enter your full name.');return}
    if(manager&&!store){setError('Select the store you manage.');return}
    if(!admin){
      if(password.length<12){setError('Use a password with at least 12 characters.');return}
      if(password!==confirm){setError('Your passwords do not match.');return}
    }
    setBusy(true)
    try{
      if(admin){
        const {error:requestError}=await supabase.functions.invoke('rboas-enrollment',{body:{email:email.trim().toLowerCase()}})
        if(requestError)throw requestError
        setSubmitted(true)
        return
      }
      const {error:signUpError}=await supabase.auth.signUp({
        email:email.trim().toLowerCase(),password,
        options:{
          data:{rboas_request:'staff',requested_role:role,display_name:name.trim(),store_code:manager?store:null},
          emailRedirectTo:window.location.origin+import.meta.env.BASE_URL+'#/login'
        }
      })
      if(signUpError)throw signUpError
      await supabase.auth.signOut()
      notify('Registration submitted. Verify your email, then wait for administrator approval before signing in.')
      go('/login')
    }catch(err){setError(err instanceof Error?err.message:'Unable to submit this request.')}
    finally{setBusy(false)}
  }
  return <AuthFrame tag="STAFF REGISTRATION" title="Create your account"
    description="Request secure access to your remote billing training workspace.">
    <TabNav go={go} active="register"/>
    {submitted?<div className="auth-success-state"><CheckCircle2 size={32}/>
      <h3>Check your inbox</h3><p>If your administrator email is preapproved, you will receive a secure invitation link.</p>
      <button className="auth-primary" onClick={()=>go('/login')}>Continue to sign in <ArrowRight size={17}/></button>
    </div>:<form className="auth-form" onSubmit={submit}>
      <Field label="Access type">
        <div className="auth-input-wrap"><ShieldCheck size={16} className="input-leading"/>
          <select value={role} onChange={e=>setRole(e.target.value as FormRole)}>
            <option value="manager">Branch Manager</option><option value="hr">Human Resources (HR)</option>
            <option value="admin">Administrator — invitation only</option>
          </select></div>
      </Field>
      <Field label="Full name"><div className="auth-input-wrap"><UserRound size={16} className="input-leading"/>
        <input value={name} required minLength={2} maxLength={120} autoComplete="name"
          onChange={e=>setName(e.target.value)} placeholder="Enter your full name"/></div>
      </Field>
      {manager&&<Field label="Which store do you manage?" help="Your store access will be limited to your approved location.">
        <div className="auth-input-wrap"><MapPin size={16} className="input-leading"/>
          <select required value={store} onChange={e=>setStore(e.target.value)}>
            <option value="">Select store location</option>{STORES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </select></div></Field>}
      <Field label="Email address"><div className="auth-input-wrap"><Mail size={16} className="input-leading"/>
        <input type="email" value={email} required autoComplete="email" maxLength={254}
          onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></div>
      </Field>
      {!admin&&<>
        <Field label="Password" help="Use at least 12 characters.">
          <Password value={password} onChange={setPassword} placeholder="Create a secure password"/>
        </Field>
        <Field label="Confirm password">
          <Password value={confirm} onChange={setConfirm} placeholder="Re-enter your password"/>
        </Field>
      </>}
      {admin&&<div className="auth-hint">Administrator accounts are invitation-only. Your password is set using the secure invitation email, not on this form.</div>}
      <ErrorStatus message={error}/>
      <button disabled={busy} className="auth-primary" type="submit">
        {busy?'Submitting…':admin?'Request administrator invitation':'Submit access request'} <ArrowRight size={17}/></button>
    </form>}
    <div className="auth-switch">Already registered? <button onClick={()=>go('/login')}>Sign in</button></div>
    <div className="auth-info"><ShieldCheck size={18}/><span>Administrator approval is required for new Manager and HR accounts. Trainee accounts are created inside the staff dashboard—there is no public trainee registration.</span></div>
  </AuthFrame>
}
export function Login({go,notify,refresh}:Props & {trainee?:boolean}){
  const trainee=(window.location.hash.split('?')[0]||'').includes('trainee-login')
  const [email,setEmail]=useState(''),[password,setPassword]=useState('')
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  const [notice,setNotice]=useState('')
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError('');setNotice('');setBusy(true)
    try{
      const {data,error:loginError}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password})
      if(loginError)throw loginError
      if(!data.user?.email_confirmed_at)throw Error('Verify your email before signing in.')
      const {data:profile,error:profileError}=await supabase.from('user_profiles')
        .select('id,active').eq('id',data.user.id).maybeSingle()
      if(profileError)throw profileError
      let role=data.user.app_metadata?.rboas_role as string|undefined
      if(!profile&&data.user.invited_at){
        try{
          await callApi('activate_preapproved')
          await supabase.auth.refreshSession()
          role=(await supabase.auth.getUser()).data.user?.app_metadata?.rboas_role
        }catch{/* Trainees have provisioned profiles, public signups await review */}
      }
      const fresh=await supabase.from('user_profiles').select('id,active')
        .eq('id',data.user.id).maybeSingle()
      if(!fresh.data||!fresh.data.active){
        await supabase.auth.signOut()
        throw Error('Your account is awaiting approval, or access has been disabled. Contact the administrator.')
      }
      if(trainee&&role!=='trainee'){
        await supabase.auth.signOut();throw Error('Use the staff login for Administrator, Manager, or HR accounts.')
      }
      if(!trainee&&role==='trainee'){
        await supabase.auth.signOut();throw Error('Trainees must use the trainee sign-in portal.')
      }
      if(data.user.invited_at&&!data.user.user_metadata?.rboas_profile_completed){
        notify('Complete your invitation and create a password.');go('/setup');return
      }
      await refresh()
      go('/dashboard')
    }catch(err){
      setError(err instanceof Error?err.message:'Unable to sign in')
    }finally{setBusy(false)}
  }
  async function recover(){
    if(!email.trim()){setError('Enter your email above, then request a password reset.');return}
    setError('')
    const result=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{
      redirectTo:window.location.origin+import.meta.env.BASE_URL+'#/setup'
    })
    if(result.error)setError(result.error.message)
    else setNotice('If the account exists, you will receive password reset instructions.')
  }
  return <AuthFrame tag={trainee?'TRAINEE PORTAL':'SECURE STAFF ACCESS'}
    title={trainee?'Trainee sign in':'Welcome back'}
    description={trainee?'Sign in using the account issued by your Manager or HR team.':
      'Sign in to manage billing training, assessments and trainee progress.'}>
    {!trainee&&<TabNav go={go} active="login"/>}
    <form className="auth-form" onSubmit={submit}>
      <Field label="Email address"><div className="auth-input-wrap"><Mail size={16} className="input-leading"/>
        <input type="email" required value={email} autoComplete="username"
          placeholder="name@company.com" onChange={e=>setEmail(e.target.value)}/></div>
      </Field>
      <Field label="Password"><Password value={password} onChange={setPassword} placeholder="Enter your password"/></Field>
      <button type="button" className="auth-forgot" onClick={()=>{void recover()}}>Forgot password?</button>
      <ErrorStatus message={error}/><ErrorStatus message={notice} success/>
      <button type="submit" disabled={busy} className="auth-primary">
        {busy?'Signing in…':'Sign in to dashboard'} <ArrowRight size={17}/></button>
    </form>
    <div className="auth-switch">{trainee?'Are you staff?':'New staff member?'} <button onClick={()=>go(trainee?'/login':'/register')}>
      {trainee?'Staff login':'Request access'}</button></div>
    {!trainee&&<div className="auth-aux">Are you a trainee? <button onClick={()=>go('/trainee-login')}>Open trainee portal</button></div>}
    <div className="auth-info"><ShieldCheck size={18}/><span>Protected company workspace. Access is limited to authorized employees and assigned trainees.</span></div>
  </AuthFrame>
}
export function SetupPassword({go,identity,refresh}:Props){
  const [name,setName]=useState(identity.user?.user_metadata?.display_name||'')
  const [password,setPassword]=useState(''),[confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError('')
    if(password.length<12||password!==confirm){setError('Choose a matching password of at least 12 characters.');return}
    if(!identity.user){setError('Open your invitation link again before completing this form.');return}
    setBusy(true)
    try{
      const {error:changeError}=await supabase.auth.updateUser({
        password,data:{display_name:name.trim(),rboas_profile_completed:true}
      })
      if(changeError)throw changeError
      if(!identity.profile){await callApi('activate_preapproved')}
      await callApi('profile_setup',{display_name:name.trim()})
      await supabase.auth.signOut()
      await refresh()
      go('/login')
    }catch(err){setError(err instanceof Error?err.message:'Unable to finish account setup')}
    finally{setBusy(false)}
  }
  return <AuthFrame tag="INVITATION ACCEPTED" title="Complete your profile"
    description="Finish setting up your account before signing in to RBOAS.">
    <div className="auth-hint"><CheckCircle2 size={18}/> Email verified: {identity.user?.email||'Please open your invitation link'}</div>
    <form className="auth-form" onSubmit={submit}>
      <Field label="Full name"><div className="auth-input-wrap"><UserRound size={16} className="input-leading"/>
        <input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></div></Field>
      <Field label="New password"><Password value={password} onChange={setPassword} placeholder="At least 12 characters"/></Field>
      <Field label="Confirm password"><Password value={confirm} onChange={setConfirm} placeholder="Confirm your password"/></Field>
      <ErrorStatus message={error}/>
      <button disabled={busy} className="auth-primary" type="submit">{busy?'Saving…':'Finish registration'}<ArrowRight size={17}/></button>
    </form>
    <div className="auth-switch"><button onClick={()=>go('/login')}>Back to login</button></div>
  </AuthFrame>
}
