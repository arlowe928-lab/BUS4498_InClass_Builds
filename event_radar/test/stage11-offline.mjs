// From the repository root: node event_radar/test/stage11-offline.mjs
// All database and AI requests are mocked; this sends no real posts.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';

const clubs = [
  { id:'1', name:'Board Game Guild', nicknames:'BGG, board game club', usual_place_code:'UU', usual_place_detail:'Room 220' },
  { id:'2', name:'Mustang Pitch Society', nicknames:'MPS, pitch club', usual_place_code:'UU-PLAZA', usual_place_detail:'' },
];
const env = { OPENAI_API_KEY:'mock', SUPABASE_URL:'https://test.invalid', SUPABASE_SECRET_KEYS:'{"default":"mock"}', SUPABASE_PUBLISHABLE_KEYS:'{"default":"public-mock"}' };
globalThis.Deno = { env: { get: key => env[key] } };
let inserted, aiCalls=0, lookupFails=false, prompt;
let club='BGG', place='UU', date='';
globalThis.mockClient = () => ({ from(table) {
  if (table === 'clubs') return { select() { return { eq() { return { order: async()=>({ data:lookupFails?null:clubs, error:lookupFails?{}:null }) }; } }; } };
  return {
    select() { return { gte: async()=>({ count:0, error:null }) }; },
    insert(row) { inserted=row; return { select() { return { single:async()=>({ data:{id:'saved', ...row}, error:null }) }; } }; },
  };
} });
globalThis.fetch = async (_url, init) => {
  aiCalls++;
  prompt=JSON.parse(init.body).instructions;
  const card={is_event:true, not_event_reason:'', title:'Club event', club, event_date:date, start_time:'18:00', end_time:'', place_code:place, place_detail:'', cost:'Free', free_food:false, summary:'Meet the club.', missing:place?[]:['place'], rule_flags:[], note_for_moderator:''};
  return new Response(JSON.stringify({status:'completed', output:[{type:'message', content:[{type:'output_text', text:JSON.stringify(card)}]}]}));
};
let source=fs.readFileSync('event_radar/supabase/functions/submit-event/index.ts','utf8')
  .replace(/^import .*\n/, 'const createClient=globalThis.mockClient;\n')
  .replace('constructor(message: string, public status = 500) { super(message); }','status: number; constructor(message: string, status = 500) { super(message); this.status = status; }')
  .replace('if (import.meta.main) Deno.serve(handler);','');
const {handler,matchClub}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
async function post(announcement) {
  const response=await handler(new Request('https://test.invalid',{method:'POST',headers:{'content-type':'application/json', apikey:'public-mock'},body:JSON.stringify({announcement})}));
  assert.equal(response.status,200);
  return response.json();
}
let result=await post('BGG trivia night at 6 pm today at UU');
assert.equal(result.status,'published'); assert.equal(inserted.club,'Board Game Guild');
assert.deepEqual(inserted.agent_notes,result.looked_at);
assert.match(result.looked_at[0],/matched “BGG”/);
assert.ok(prompt.includes('board game club')); assert.ok(!prompt.split('Active club names and nicknames')[1].includes('Room 220'));
assert.equal(matchClub('BGGG party',clubs),null);
assert.equal(matchClub('Pitch Club social',[...clubs,{id:'3',name:'Pitch',nicknames:'',usual_place_code:'',usual_place_detail:''}]).club.name,'Mustang Pitch Society');
club='Cal Poly Kite Flyers';
result=await post('Cal Poly Kite Flyers: kite day today at 6 pm at UU');
assert.equal(result.status,'waiting');assert.ok(result.reasons.some(r=>r.includes('isn’t on the club list')));
clubs.push({id:'3',name:'Cal Poly Kite Flyers',nicknames:'kite flyers, kite club',usual_place_code:'',usual_place_detail:''});
club='Kite Flyers';result=await post('Kite Flyers general meeting today at 6 pm at UU');
assert.equal(result.status,'published');assert.equal(inserted.club,'Cal Poly Kite Flyers');
club='BGG';place='';result=await post('Board Game Guild meeting today at 6 pm, usual spot');
assert.equal(result.status,'waiting');assert.equal(inserted.place_code,'');assert.equal(inserted.place_name,'');assert.equal(inserted.place_detail,'');
assert.ok(result.reasons.some(r=>r.includes('Room 220')&&r.includes('hint only')));
assert.ok(!prompt.split('Active club names and nicknames')[1].includes('Room 220'));
// AI can identify a listed club from a flyer even when text names no club.
place='UU';result=await post('Club event today at 6 pm at UU');
assert.equal(result.status,'published');assert.equal(inserted.club,'Board Game Guild');
club='';result=await post('Club event today at 6 pm at UU');
assert.equal(result.status,'waiting');assert.ok(result.reasons.some(r=>r.includes('doesn’t say which club')));
const before=aiCalls;
result=await(await handler(new Request('https://test.invalid'))).json();
assert.equal(result.clubs,3);assert.equal(aiCalls,before);
lookupFails=true;
const response=await handler(new Request('https://test.invalid',{method:'POST',headers:{'content-type':'application/json',apikey:'public-mock'},body:JSON.stringify({announcement:'BGG event'})}));
assert.equal(response.status,503);assert.equal(aiCalls,before);
console.log('PASS: nickname/longest matching, unknown/new/missing clubs, usual-place hint without filling or prompt leakage, saved notes, fresh lookups, GET count, and lookup failure before AI. No network used.');
