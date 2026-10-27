import {useCallback,useEffect,useRef,useState} from 'react'
import {BookOpenCheck,CheckCircle2,X} from 'lucide-react'
import {useAuth} from './useAuth'
import {Register,Login,SetupPassword} from './Auth'
import Dashboard from './Dashboard'
import Demo from './Demo'

function currentRoute(){
  const hash=window.location.hash.replace(/^#/,'').split('?')[0]
  if(hash.startsWith('/'))return hash
  const path=window.location.pathname
  if(path.endsWith('/register.html'))return '/register'
  if(path.endsWith('/login.html'))return '/login'
  return '/login'
}
export default function App(){
  const [route,setRoute]=useState(currentRoute)
  const [notice,setNotice]=useState('')
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const {identity,refresh}=useAuth()
  const go=useCallback((name:string)=>{
    if(window.location.hash!=='#'+name)window.location.hash=name
    setRoute(name)
    window.scrollTo({top:0,behavior:'smooth'})
  },[])
  const notify=useCallback((message:string)=>{
    setNotice(message)
    if(timer.current)clearTimeout(timer.current)
    timer.current=setTimeout(()=>setNotice(''),6000)
  },[])
  useEffect(()=>{
    const onChange=()=>setRoute(currentRoute())
    window.addEventListener('hashchange',onChange)
    return ()=>window.removeEventListener('hashchange',onChange)
  },[])
  useEffect(()=>{
    if(identity.status==='loading')return
    if(identity.status==='setup'&&route!=='/setup')go('/setup')
    else if(identity.status==='approved'&&(['/login','/register','/trainee-login','/'].includes(route)))go('/dashboard')
    else if(identity.status!=='approved'&&route==='/dashboard')go('/login')
  },[identity.status,route,go])
  const props={identity,go,refresh,notify}
  let content
  if(identity.status==='loading'){
    content=<div className="loading-screen"><BookOpenCheck size={31}/>Establishing secure connection…</div>
  }else if(route==='/preview'){
    content=<Demo go={go}/>
  }else if(route==='/setup'){
    content=identity.user?<SetupPassword {...props}/>:<Login {...props}/>
  }else if(route==='/register'){
    content=<Register {...props}/>
  }else if(route==='/trainee-login'){
    content=<Login {...props} trainee/>
  }else if(route==='/dashboard'&&identity.status==='approved'){
    content=<Dashboard {...props} key={identity.user?.id||'dashboard'}/>
  }else{
    content=<Login {...props}/>
  }
  return <>{content}{notice&&<div className="app-toast" role="status"><CheckCircle2 size={19}/><span>{notice}</span>
    <button aria-label="Dismiss notification" onClick={()=>setNotice('')}><X size={16}/></button></div>}</>
}
