import {useCallback,useEffect,useState} from 'react'
import type {User} from '@supabase/supabase-js'
import {callApi, supabase} from './lib'
import type {StaffProfile,UserRole} from './lib'

export type Identity = {
  status:'loading'|'guest'|'pending'|'approved'|'setup'
  user:User|null;profile:StaffProfile|null;role:UserRole|null
}
const blank:Identity={status:'loading',user:null,profile:null,role:null}
export function useAuth(){
  const [identity,setIdentity]=useState<Identity>(blank)
  const refresh=useCallback(async()=>{
    try{
      const result=await supabase.auth.getUser()
      let user=result.data.user
      if(result.error||!user){setIdentity({status:'guest',user:null,profile:null,role:null});return}
      let query=await supabase.from('user_profiles')
        .select('id,email,display_name,store_code,employee_code,manager_id,active,created_at')
        .eq('id',user.id).maybeSingle()
      let profile=(query.data||null) as StaffProfile|null
      if(!profile&&user.invited_at&&user.email_confirmed_at){
        try{
          await callApi('activate_preapproved')
          await supabase.auth.refreshSession()
          const fresh=await supabase.auth.getUser()
          if(fresh.data.user)user=fresh.data.user
          query=await supabase.from('user_profiles')
            .select('id,email,display_name,store_code,employee_code,manager_id,active,created_at')
            .eq('id',user.id).maybeSingle()
          profile=query.data as StaffProfile|null
        }catch{/* A non-preapproved account cannot bootstrap */}
      }
      const rawRole=user.app_metadata?.rboas_role
      const role=(['admin','manager','hr','trainee'].includes(rawRole)?rawRole:null) as UserRole|null
      if(!user.email_confirmed_at){setIdentity({status:'pending',user,profile,role:null});return}
      if(user.invited_at&&!user.user_metadata?.rboas_profile_completed){
        setIdentity({status:'setup',user,profile,role});return
      }
      if(profile?.active===true&&role){
        setIdentity({status:'approved',user,profile,role});return
      }
      setIdentity({status:'pending',user,profile,role:null})
    }catch{
      setIdentity({status:'guest',user:null,profile:null,role:null})
    }
  },[])
  useEffect(()=>{
    void refresh()
    const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{
      setTimeout(()=>{void refresh()},0)
    })
    return ()=>subscription.unsubscribe()
  },[refresh])
  return {identity,refresh}
}
