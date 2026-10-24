const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../src/character/model.cjs'),root=path.resolve(__dirname,'..'),raw=p=>fs.readFileSync(path.join(root,p),'utf8');
const conf=(id,stats)=>({...R.defaults(),skills:R.pilot(id).recommended.slice(),...(stats?{stats}:{} )});
const allocations=R.NEEDS.map(()=>[]);{const people=Array(8).fill(0);function walk(i){if(i===8){const got=R.counts({people});R.NEEDS.forEach((need,d)=>{if(need.every((n,j)=>got[j]>=n))allocations[d].push(people.slice());});return;}for(let j=0;j<5;j++){people[i]=j;walk(i+1);}}walk(0);}
function tick(w,n=1,input={}){for(let i=0;i<n&&w.status==='playing';i++)R.step(w,input,.05);}
function solve(w){if(w.kind==='zhuzi')return require('./helpers/zhuzi-character-player.cjs')(R,w);if(w.kind==='spring')return require('./helpers/spring-player.cjs')(R,w);if(w.kind==='warring')return require('./helpers/warring-player.cjs')(R,w);if(w.kind==='chuhan')return require('./helpers/chuhan-player.cjs')(R,w);
 if(w.kind==='action'){
  const go=(x,y)=>{R.command(w,'move',{x,y});let guard=0;while(w.status==='playing'&&(Math.abs(w.x-x)>.7||Math.abs(w.y-y)>.3)&&guard++<2000)tick(w);R.command(w,'stop');assert(w.status==='playing',w.notice);};
  go(22,0);go(22,26);assert(R.command(w,'deliver'));go(22,35);go(78,35);go(78,57);assert(R.command(w,'deliver'));go(78,66);go(42,66);go(42,83);assert(R.command(w,'deliver'));go(42,100);assert(R.command(w,'finish'));
 }else if(w.kind==='strategy'){
  while(w.day<4&&w.status==='playing'){const options=allocations[w.day].map(people=>({people,moves:people.filter((x,i)=>x!==w.people[i]).length})).sort((a,b)=>a.moves-b.moves),choice=options[0];if(choice.moves>w.orders)assert(R.command(w,'skill','plan'));for(let i=0;i<8;i++)if(w.people[i]!==choice.people[i])assert(R.command(w,'transfer',{person:i,to:choice.people[i]}));assert(R.command(w,'commit'));tick(w);}
 }else{
  while(w.status==='playing'){const t=R.TEXTS[w.page],chars=Array.from(t.original);for(let i=0;i<chars.length;i++)if(w.draft[i]!==chars[i]){assert(R.command(w,'probe',i));tick(w,25);assert(R.command(w,'select',i));assert(R.command(w,'patch',chars[i]),w.notice);}assert(R.command(w,'reason',t.reason));assert(R.command(w,'check'),w.notice);}
 }return w;
}
test('一角固定12點、八能力與本次訪客三篇範圍，拒絕越界配點與多裝備',()=>{
 assert.equal(R.SKILLS.length,8);assert.equal(new Set(R.SKILLS.map(s=>s.id)).size,8);
 assert.equal(R.PILOTS.length,52);assert.equal(R.PILOTS.filter(p=>p.kind==='chuhan').length,9);
 assert.throws(()=>R.config({...R.defaults(),stats:{...R.defaults().stats,agility:3}}),/12點/);
 assert.throws(()=>R.config({...R.defaults(),stats:{...R.defaults().stats,agility:-1}}));
 assert.throws(()=>R.config({...R.defaults(),skills:['swift','steady','trace']}));
 assert.throws(()=>R.config({...R.defaults(),skills:['steady','steady']}));
 assert.throws(()=>R.create(R.PILOTS[1].id,R.defaults()),/本篇/);
});
test('三款透過公開指令可完成，三種配點與三個巡燈種子保持可解',()=>{
 const builds=[R.defaults().stats,{agility:4,strength:4,dexterity:1,focus:1,insight:1,planning:1},{agility:0,strength:0,dexterity:4,focus:4,insight:4,planning:0}];
 for(const p of R.PILOTS)for(const stats of builds)for(const seed of [1,15,29]){const w=solve(R.create(p.id,conf(p.id,stats),{nickname:'測試同行者'},seed));assert.equal(w.status,'won');assert(R.score(w)>0);assert.deepEqual(R.restore(JSON.parse(JSON.stringify(w))),w);}
});
test('放置與亂按交付、推進、核對不會通關，失敗存檔仍可還原',()=>{
 for(const p of R.PILOTS){const w=R.create(p.id,conf(p.id));for(let i=0;i<5;i++){R.command(w,'deliver');R.command(w,'finish');R.command(w,'commit');R.command(w,'check');}assert.notEqual(w.status,'won');for(let i=0;i<15000&&w.status==='playing';i++)tick(w);assert.notEqual(w.status,'won');assert.doesNotThrow(()=>R.restore(w));}
});
test('配裝快照不隨編輯變動，存讀後同一操作有相同狀態，dt過大亦有上限',()=>{
 const c=conf(R.PILOTS[0].id),a=R.create(R.PILOTS[0].id,c);c.stats.agility=4;c.skills[0]='swift';assert.equal(a.snapshot.config.stats.agility,2);assert.equal(a.snapshot.config.skills[0],'steady');
 tick(a,20,{right:true});const b=R.restore(JSON.parse(JSON.stringify(a)));tick(a,30,{down:true});tick(b,30,{down:true});assert.deepEqual(a,b);const before=a.time;R.step(a,{},999);assert(a.time-before<=.10001);
});
test('八能力均有作用與代價，次數冷卻、每輪運籌不能重複刷',()=>{
 for(const s of R.SKILLS){const p=R.PILOTS.find(p=>s.kinds.includes(p.kind)),other=R.SKILLS.find(x=>x.id!==s.id&&x.kinds.includes(p.kind));const w=R.create(p.id,{...R.defaults(),skills:[s.id,other.id]});
  if(s.id==='light'){assert.equal(w.maxGrip,80);assert.equal(R.skill(w,s.id),false);continue;}
  const before=JSON.stringify(w);assert(R.skill(w,s.id),s.id);assert.notEqual(JSON.stringify(w),before);assert.equal(w.uses[s.id],1);assert(!R.skill(w,s.id));tick(w,220);
  if(s.id==='plan'){assert(!R.skill(w,s.id));assert.equal(w.orders,9);}else{assert(R.skill(w,s.id));tick(w,220);assert(!R.skill(w,s.id));}
 }
 const base=R.create(R.PILOTS[0].id,{...R.defaults(),skills:['steady','listen']}),fast=R.create(R.PILOTS[0].id,{...R.defaults(),skills:['swift','light']});R.skill(fast,'swift');tick(base,20,{right:true});tick(fast,20,{right:true});assert(fast.x>base.x);assert(fast.grip<base.grip);
});
test('對勘須先展讀，不可隔空改字；錯誤論證標籤不能過段',()=>{
 const w=R.create(R.PILOTS[2].id,conf(R.PILOTS[2].id)),i=w.draft.findIndex((x,i)=>x!==Array.from(R.TEXTS[0].original)[i]);R.command(w,'select',i);assert(!R.command(w,'patch','過'));R.command(w,'probe',i);tick(w,25);assert(R.command(w,'patch','過'));R.command(w,'reason',2);assert(!R.command(w,'check'));assert.equal(w.page,0);R.command(w,'reason',0);assert(R.command(w,'check'));assert.equal(w.page,1);
});
test('還原拒絕未完成卻自稱通關、超額次數與無限增益',()=>{
 for(const p of R.PILOTS){const w=R.create(p.id,conf(p.id));w.status='won';assert.throws(()=>R.restore(w),/尚未完成/);}
 const w=R.create(R.PILOTS[0].id,conf(R.PILOTS[0].id));w.uses.steady=999;assert.throws(()=>R.restore(w));w.uses={};w.buffs.steady=999;assert.throws(()=>R.restore(w));
});
function apiHarness(){
 const tables=new Map(),calls=[];let email='a@school.test',uuid=0;const ctx={console,Math,Date,JSON,Number,Object,Array,Set,Map,Error,Utilities:{getUuid:()=>String(++uuid)},paUser_:()=>({email}),paEmail_:x=>String(x).toLowerCase(),paLock_:fn=>fn(),nowStr_:()=> '2026-10-21 16:00:00',pfJson_:(x,f)=>{try{return JSON.parse(x);}catch{return f;}},pfRead_:e=>({email:e}),pfPublic_:p=>({nickname:p.email==='a@school.test'?'甲角':'乙角',avatarId:'ink',appearance:null}),pfRows_:name=>(tables.get(name)||[]).slice(1),pfSheet_:(name,headers)=>{
  if(!tables.has(name))tables.set(name,[headers]);const rows=tables.get(name);return {getLastRow:()=>rows.length,getRange:(row,col,h,w)=>({setNumberFormat(){return this;},setValues(values){for(let i=0;i<h;i++){rows[row-1+i]=rows[row-1+i]||[];for(let j=0;j<w;j++)rows[row-1+i][col-1+j]=values[i][j];}calls.push(name);return this;}})};}};
 vm.createContext(ctx);vm.runInContext(raw('gas/OriginalCharacterRules.gs'),ctx);vm.runInContext(raw('gas/OriginalCharacterApi.gs'),ctx);return {ctx,tables,calls,user:v=>email=v};
}
test('學校雲端只保存本人、固定預算與兩配裝，拒絕舊revision及換角續檔',()=>{
 const h=apiHarness(),a=h.ctx;let c=a.api_getOriginalCharacter().character.config;assert(a.api_saveOriginalCharacter(c).ok);assert(!a.api_saveOriginalCharacter(c).ok);c=a.api_getOriginalCharacter().character.config;c.stats.agility=9;assert(!a.api_saveOriginalCharacter(c).ok);
 let r=a.api_startCharacterAdventure(R.PILOTS[0].id).run;assert(r);h.user('b@school.test');assert.equal(a.api_getCharacterAdventure(R.PILOTS[0].id).run,null);assert(!a.api_saveCharacterAdventure({runId:r.runId,revision:0,world:r.world}).ok);h.user('a@school.test');
 const mod=R.copy(r.world);mod.snapshot.config.skills=['swift','light'];assert(!a.api_saveCharacterAdventure({runId:r.runId,revision:0,world:mod}).ok);
 tick(r.world,20,{down:true});assert(a.api_saveCharacterAdventure({runId:r.runId,revision:0,world:r.world}).ok);assert(!a.api_saveCharacterAdventure({runId:r.runId,revision:0,world:r.world}).ok);assert(h.calls.every(x=>['OriginalCharacters','CharacterAdventures'].includes(x)));
});
test('雲端冒險通關重送只留一筆旅歷，原題、原分數與存檔工作表不被寫入',()=>{
 const h=apiHarness(),a=h.ctx;let c=conf(R.PILOTS[1].id);assert(a.api_saveOriginalCharacter(c).ok);const r=a.api_startCharacterAdventure(R.PILOTS[1].id).run;solve(r.world);const v=a.api_saveCharacterAdventure({runId:r.runId,revision:0,world:r.world});assert(v.ok,v.msg);assert.equal(v.journal.length,1);assert(a.api_saveCharacterAdventure({runId:r.runId,revision:v.revision,world:r.world}).ok);assert.equal(a.api_getOriginalCharacter().character.journal.length,1);assert(!h.tables.has('Saves'));assert(!h.tables.has('MiniGameLog'));assert(!h.tables.has('AnchorLog'));
});
test('GAS傳輸重排物件欄位後，相同配點仍可保存及續玩，改點仍被拒絕',()=>{
 const wire=o=>Array.isArray(o)?o.map(wire):o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,wire(o[k])])):o;
 const h=apiHarness(),a=h.ctx;assert(a.api_saveOriginalCharacter(wire(conf(R.PILOTS[1].id))).ok);const r=wire(a.api_startCharacterAdventure(R.PILOTS[1].id).run);solve(r.world);
 const v=a.api_saveCharacterAdventure(wire({runId:r.runId,revision:0,world:r.world}));assert(v.ok,v.msg);assert.equal(a.api_getCharacterAdventure(R.PILOTS[1].id).run.world.status,'won');
 assert(a.api_saveCharacterAdventure(wire({runId:r.runId,revision:v.revision,world:r.world})).ok);
 const bad=wire(r.world);bad.snapshot.config.stats.agility++;bad.snapshot.config.stats.strength--;assert(!a.api_saveCharacterAdventure(wire({runId:r.runId,revision:2,world:bad})).ok);
});
test('角色能力不發送正式作答／分數；教師試玩與訪客使用隔離分頁儲存',()=>{
 const app=raw('src/character/app.js');assert(!/ZH\.(track|finishScenario|save)\(/.test(app));assert(app.includes('ZH.isGuest()||test()'));assert(app.includes('inTest!==test()'));assert(app.includes("ZH.session.set(key(snapshot.id),own)"));assert(app.includes('api_saveCharacterAdventure'));
 const preview=raw('src/legacy/Teacher_preview.html');assert(preview.includes('if(active()&&!readOnly.has(name))'));
});
