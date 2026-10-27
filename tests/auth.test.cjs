"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=(name)=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const login=read("login.html");
const registration=read("register.html");
const auth=read("auth-pages.js");
const dashboard=read("app.js");
const enrollment=read("supabase/functions/rboas-enrollment/index.ts");
const api=read("supabase/functions/rboas-api/index.ts");
test("login and register pages have separate functional forms",()=>{
  assert.match(login,/id="loginForm"/);
  assert.match(login,/id="forgotPassword"/);
  assert.match(login,/href="\/register.html"/);
  assert.match(registration,/id="enrollmentForm"/);
  assert.match(registration,/id="profileForm"/);
  assert.match(registration,/id="profilePassword"/);
  assert.match(registration,/id="profileConfirm"/);
  assert.match(registration,/href="\/login.html"/);
  assert.match(login,/auth-pages\.js/);
  assert.match(registration,/auth-pages\.js/);
});
test("registration finishes at login, and login opens the dashboard",()=>{
  assert.match(auth,/location\.replace\("\/login\.html\?registered=1"\)/);
  assert.match(auth,/location\.replace\("\/"\)/);
  assert.match(auth,/signInWithPassword/);
  assert.match(auth,/auth\.updateUser/);
  assert.match(dashboard,/location\.replace\("\/register\.html"\)/);
  assert.match(dashboard,/location\.replace\("\/login\.html"\)/);
});
test("privileged roles cannot be created by visitor input",()=>{
  assert.doesNotMatch(registration,/<select[^>]*name="role"/);
  assert.doesNotMatch(auth,/app_metadata:\s*\{.*rboas_role/s);
  assert.match(api,/activate_preapproved/);
  assert.match(api,/profile_setup/);
  assert.match(enrollment,/rboas_reserve_invite/);
  assert.match(enrollment,/inviteUserByEmail/);
  assert.doesNotMatch(login,/sb_secret_|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(registration,/sb_secret_|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(auth,/sb_secret_|SUPABASE_SERVICE_ROLE_KEY/);
});
test("profiles store only identity details; passwords use Supabase Auth",()=>{
  assert.match(auth,/auth\.updateUser\(\{\s*password/);
  assert.match(auth,/callBackend\("profile_setup"/);
  assert.match(auth,/auth\.signOut\(\)/);
  assert.match(api,/\.eq\("id",user\.id\)/);
});
