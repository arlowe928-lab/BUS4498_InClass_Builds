// Run: node event_radar/test/stage12-offline.mjs
// Tests use fake AI output and an in-memory database; no network or secrets.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {stripTypeScriptTypes} from 'node:module';
const path=process.argv[2] || 'event_radar/supabase/functions/submit-event/index.ts';
const env={OPENAI_API_KEY:'test',SUPABASE_URL:'https://test.invalid',SUPABASE_SECRET_KEYS:'{"default":"test"}',SUPABASE_PUBLISHABLE_KEYS:'{"default":"public-test"}'};
globalThis.Deno={env:{get:k=>env[k]}};
const club={id:'club',name:'Mustang Pitch Society',nicknames:'MPS',usual_place_code:'UU',usual_place_detail:'Room 220'};
let rows=[],nextCard,aiCalls=0,lastInput;
globalThis.mockClient=()=>({from:table=>{
 let mode='read',values,filters=[],count=false;
 const q={select:(_s,opts)=>{count=Boolean(opts?.count);return q},eq:(k,v)=>{filters.push(r=>r[k]===v);return q},in:(k,v)=>{filters.push(r=>v.includes(r[k]));return q},gte:()=>q,or:()=>q,order:()=>q,limit:()=>q,
 insert:v=>{mode='insert';values=v;return q},update:v=>{mode='update';values=v;return q},delete:()=>{mode='delete';return q},
 single:async()=>{const r=run();return {...r,data:Array.isArray(r.data)?r.data[0]:r.data}},maybeSingle:async()=>{const r=run();return {...r,data:r.data[0]||null}},then:(resolve,reject)=>Promise.resolve(run()).then(resolve,reject)};
 function run(){if(table==='clubs')return {data:[club],error:null};if(count)return {count:rows.length,error:null};let found=rows.filter(r=>filters.every(f=>f(r)));
 if(mode==='insert'){if(rows.some(r=>['published','waiting'].includes(r.status)&&r.dedupe_key===values.dedupe_key))return {error:{code:'23505'},data:null};const r={id:crypto.randomUUID(),...values};rows.push(r);return {data:[r],error:null}}
 if(mode==='update')found.forEach(r=>Object.assign(r,values));if(mode==='delete')rows=rows.filter(r=>!found.includes(r));return {data:found.map(r=>({...r})),error:null};}
 return q;
}});
globalThis.fetch=async(_url,init)=>{aiCalls++;lastInput=JSON.parse(init.body);return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(nextCard)}]}]}))};
let code=fs.readFileSync(path,'utf8').replace(/^import .*\n/,'const createClient=globalThis.mockClient;\n').replace('if (import.meta.main) Deno.serve(handler);','').replace('constructor(message: string, public status = 500) { super(message); }','status: number; constructor(message: string, status=500) { super(message); this.status=status; }');
const {handler,applyHistory}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(code)).toString('base64'));
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function card(over={}){return {is_event:true,not_event_reason:'',title:'Pitch practice',club:club.name,event_date:date,start_time:'18:00',end_time:'',place_code:'UU-PLAZA',place_detail:'',cost:'',free_food:false,summary:'Pitch practice.',missing:[],rule_flags:[],note_for_moderator:'',updates_post:0,...over}}
async function post(text,output,extra={}){nextCard=output;let response=await handler(new Request('https://test.invalid',{method:'POST',headers:{apikey:'public-test','content-type':'application/json'},body:JSON.stringify({announcement:text,...extra})}));let body=await response.json();assert.equal(response.status,200,JSON.stringify(body));return body}
let e=await post('Mustang Pitch Society pitch practice today 6 pm UU Plaza',card());assert.equal(e.status,'published');
let f=await post('Update from MPS: pitch practice today moved to 7 pm, same place',card({start_time:'19:00',place_code:'',missing:['place'],rule_flags:['R2'],updates_post:1}));assert.equal(f.status,'published');assert.equal(f.event.place_code,'UU-PLAZA');assert.equal(rows.find(r=>r.id===e.event.id).status,'replaced');assert.equal(rows.filter(r=>r.status==='published').length,1);assert.ok(f.replaced);assert.ok(f.looked_at.some(n=>n.includes('place')));
// The real API projects public columns; our mock returns the full row.
let g=await post('Reminder MPS today 7 pm UU Plaza',card({start_time:'19:00'}));assert.equal(g.status,'duplicate');
let fresh=await post('MPS new workshop today 8 pm',card({start_time:'20:00',place_code:'',missing:['place']}));assert.equal(fresh.status,'waiting');assert.equal(fresh.event.place_code,'');
let edited=await post('Update MPS: same event is free',card({start_time:'19:00',cost:'Free',updates_post:1}));assert.equal(edited.edited,true);
let held=await post('Update MPS moved to 9 pm, same place, alcohol',card({start_time:'21:00',place_code:'',updates_post:1,rule_flags:['R4']}));assert.equal(held.status,'waiting');assert.ok(held.event.updates_id);assert.equal(rows.find(r=>r.id===f.event.id).status,'published');
const history=[{...card(),id:'old',status:'published'}];
let newDay=card({event_date:'2099-01-01',place_code:'',updates_post:1});assert.equal(applyHistory(newDay,history,'MPS next regular meeting').earlier,null);assert.equal(newDay.place_code,'');
let reminder=card({place_code:'',updates_post:1});assert.equal(applyHistory(reminder,history,'Reminder MPS meeting').earlier,null);
let follow=await post('actually 10 pm',card({start_time:'22:00',place_code:'',updates_post:0,missing:['place']}),{thread:['discard','MPS meeting today','x'.repeat(600),'same place','last'],source_name:'Test sender'});assert.ok(follow.looked_at.some(n=>n.includes('read 4 earlier')));assert.ok(lastInput.input.includes('Earlier chat messages'));assert.ok(!lastInput.input.includes('discard'));assert.ok(!lastInput.input.includes('x'.repeat(501)));
console.log('PASS: replacement, reminder duplicate, no inheritance for new events, in-place edits, waiting updates preserve original, next-session guard, reminder guard, chat bounds and club lookup.');
