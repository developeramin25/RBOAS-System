"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = (name) => fs.readFileSync(path.join(root,name),"utf8");
const site = file("index.html");
const app = file("app.js");
const script = file("demo-bank.js");

const sandbox={window:{}};
vm.runInNewContext(script,sandbox,{filename:"demo-bank.js",timeout:500});
const bank=Array.from(sandbox.window.RBOAS_DEMO_BANK||[]);

test("public management demo keeps exactly fifty fully formed questions",()=>{
  assert.equal(bank.length,50);
  assert.equal(new Set(bank.map(q=>q.prompt)).size,50);
  for(const q of bank){
    assert.equal(q.options.length,4);
    assert.equal(typeof q.prompt,"string");
    assert.ok(q.prompt.length>15);
    assert.ok(Number.isInteger(q.correct));
    assert.ok(q.correct>=0 && q.correct<=3);
    assert.equal(new Set(q.options).size,4);
  }
});
test("25-question practice selection is balanced and nonrepeating",()=>{
  const cats=["ERX Processing","Refill Processing","Insurance & Rejections","LTC Billing","Coupons & Follow-Up"];
  for(const category of cats){
    assert.equal(bank.filter(q=>q.category===category).length,10);
  }
  for(let trial=0;trial<250;trial++){
    const sample=cats.flatMap(category=>{
      const shuffled=[...bank.filter(q=>q.category===category)];
      for(let i=shuffled.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
      }
      return shuffled.slice(0,5);
    });
    assert.equal(sample.length,25);
    assert.equal(new Set(sample.map(q=>q.prompt)).size,25);
    assert.equal(new Set(sample.map(q=>q.category)).size,5);
  }
});
test("application includes secure employee paths separately from demo",()=>{
  assert.match(app,/async function api\(/);
  assert.match(app,/question_approve/);
  assert.match(app,/data-live-answer/);
  assert.match(app,/async function beginOfficial/);
  assert.match(app,/async function submitOfficial/);
  assert.match(app,/function launchReadiness/);
  assert.match(app,/function preparePractice/);
  assert.match(app,/const DEMO_BANK/);
  assert.ok(!/sb_secret_|SUPABASE_SERVICE_ROLE_KEY\s*=/.test(app),"Never expose secret keys in browser code");
});
test("Netlify static site references the local code and has staff forms",()=>{
  assert.match(site, /src="\/demo-bank\.js"/);
  assert.match(site, /src="\/app\.js"/);
  assert.match(site, /id="loginForm"/);
  assert.match(site, /id="inviteForm"/);
  assert.match(site, /id="assignmentForm"/);
  assert.match(site, /id="questionForm"/);
  assert.match(site, /id="passwordForm"/);
  assert.match(site, /id="staffForm"/);
});
test("public preview is clearly marked and does not embed the imported training questions",()=>{
  assert.match(app,/Design preview:/);
  assert.match(app,/Staff-only questions/);
  assert.ok(!bank.some(q=>q.prompt.includes("Using the training\u2019s cash-price formula")));
});
