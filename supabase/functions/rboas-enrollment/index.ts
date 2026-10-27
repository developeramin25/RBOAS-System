import { createClient } from "npm:@supabase/supabase-js@2.95.0";
const url=Deno.env.get("SUPABASE_URL")||"";
const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const client=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
const origin="https://astonishing-beijinho-a0f70b.netlify.app";
const known=[origin,"http://localhost:8888","http://localhost:5173"];
Deno.serve(async request=>{
 const o=request.headers.get("origin")||"";
 const headers={"Access-Control-Allow-Origin":known.includes(o)?o:origin,
 "Access-Control-Allow-Methods":"POST,OPTIONS",
 "Access-Control-Allow-Headers":"apikey,authorization,content-type,x-client-info",
 "Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin"};
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(request.method!=="POST")return new Response(JSON.stringify({error:"POST required"}),{status:405,headers});
 // Generic response prevents public discovery of authorized email addresses.
 const done=()=>new Response(JSON.stringify({message:"If this email is approved, a secure invitation will be sent."}),{status:200,headers});
 try{
  const body=await request.json();
  const email=String(body?.email||"").trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return done();
  const reservation=await client.rpc("rboas_reserve_invite",{p_email:email});
  if(reservation.error||reservation.data!==true)return done();
  const result=await client.auth.admin.inviteUserByEmail(email,{redirectTo:origin+"/"});
  if(result.error)console.warn("RBOAS preapproved invitation failed:",result.error.message);
 }catch(e){console.warn("RBOAS enrollment request failure:",e instanceof Error?e.message:"unknown");}
 return done();
});