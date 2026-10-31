// Run from the repository root: node event_radar/test/stage14-offline.mjs
// No network requests, real credentials, or test posts are used.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
const env = { GROUPME_TOKEN:'test', GROUPME_GROUP_ID:'test', GROUPME_BOT_ID:'test', SUPABASE_URL:'https://test.invalid', SUPABASE_SECRET_KEYS:'{"default":"test"}', SUPABASE_PUBLISHABLE_KEYS:'{"default":"public-test"}', OPENAI_API_KEY:'test' };
globalThis.Deno={env:{get:key=>env[key]}};
let cursor={last_id:null,read_count:0,updated_at:new Date().toISOString()}, bookmarks=[], batch=[], calls=[], failed=false;
globalThis.mockClient=()=>({from:()=>({
 upsert:async()=>({error:null}),
 select:()=>({eq:()=>({maybeSingle:async()=>({data:cursor,error:null})})}),
 update:values=>{
  const q={eq:()=>q,lt:()=>q,select:()=>q,maybeSingle:async()=>{
   if ('lease_id' in values) return {data:{...cursor},error:null};
   cursor={...cursor,...values};bookmarks.push(values.last_id);return {data:{source:'groupme'},error:null};
  },then:resolve=>resolve({error:null})};return q;
 }
})});
function response(value,status=200){return new Response(JSON.stringify(value),{status});}
globalThis.fetch=async(url,init={})=>{
 calls.push({url,init});
 if(url.includes('/bots/post')) return new Response(null,{status:202});
 if(url.includes('/submit-event')) return failed ? response({ok:false},503) : response({ok:true,status:'published',message:'Published',reasons:[]});
 if(url.includes('limit=1')&&!url.includes('100')) return response({response:{messages:[{id:'10',created_at:1000}]}});
 if(url.includes('before_id')) return response({response:{messages:[]}});
 return response({response:{messages:batch}});
};
async function load(path){
 let text=fs.readFileSync(path,'utf8').replace(/^import .*\n/,'const createClient=globalThis.mockClient;\n').replace('if (import.meta.main) Deno.serve(handler);','');
 text=text.replace('constructor(message: string, public status = 500) { super(message); }','status: number; constructor(message: string, status = 500) { super(message); this.status = status; }');
 return import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(text)).toString('base64'));
}
const reader=await load('event_radar/supabase/functions/read-channel/index.ts');
const post=()=>reader.handler(new Request('https://test.invalid',{method:'POST'}));
assert.equal((await(await post()).json()).initialized,true);
assert.equal(cursor.last_id,'10');assert.equal(calls.filter(c=>c.url.includes('/submit-event')).length,0);
batch=[{id:'12',created_at:1002,user_id:'u',text:'event',sender_type:'user'},{id:'11',created_at:1001,user_id:'b',text:'bot',sender_type:'bot'},{id:'13',created_at:1003,user_id:'s',text:'system',system:true}];
assert.equal((await(await post()).json()).processed,3);
assert.deepEqual(bookmarks.slice(-3),['11','12','13']);
assert.equal(calls.filter(c=>c.url.includes('/submit-event')).length,1);
const sent=JSON.parse(calls.find(c=>c.url.includes('/submit-event')).init.body);assert.equal(sent.source_id,'12');assert.deepEqual(sent.thread,[]);
batch=[{id:'14',created_at:1004,user_id:'u',text:'next'}];failed=true;
assert.equal((await post()).status,503);assert.equal(cursor.last_id,'13');
const history=Array.from({length:6},(_,i)=>({id:String(i+1),created_at:100+i,user_id:'u',text:'x'.repeat(600)}));
history.push({id:'7',created_at:106,user_id:'other',text:'ignore'});
assert.equal(reader.contextFrom(history,{id:'8',created_at:110,user_id:'u'}).length,4);
assert.equal(reader.contextFrom(history,{id:'8',created_at:110,user_id:'u'})[0].length,500);
// The agent must return already_read before spending-limit queries or AI calls.
let reads=0;
globalThis.mockClient=()=>({from:()=>({select:()=>{reads++;const q={eq:()=>q,maybeSingle:async()=>({data:{id:'saved'},error:null})};return q;}})});
const agent=await load('event_radar/supabase/functions/submit-event/index.ts');
const before=calls.length;
const result=await agent.handler(new Request('https://test.invalid',{method:'POST',headers:{'content-type':'application/json',apikey:'public-test'},body:JSON.stringify({announcement:'event',source:'groupme',source_id:'12',thread:['earlier']})}));
assert.equal((await result.json()).already_read,true);assert.equal(reads,1);assert.equal(calls.length,before);
console.log('PASS: TypeScript parsing, first-run bookmark, chronological processing, bot/system skips, context bounds, failure retry, and duplicate check before AI. No network used.');
