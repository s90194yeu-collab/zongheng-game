const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),files=['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_canvas'];
function environment(){const e={window:{ZH:{LEARNING_TEXTS:{}}}};vm.createContext(e);for(const n of files)vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8').replace(/<\/?script>/g,''),e);return e.window.ZH;}
const ZH=environment(),L=ZH.literary,{chapters,modes}=require('../src/content/literary-missions.cjs'),{play}=require('./helpers/literary-player.cjs');
const cases=Object.entries(chapters).flatMap(([key,c])=>c.modes.map((mode,index)=>({key,mode,index})));const fresh=(c,seed=8421)=>L.create(c,false,'read',seed);
function ticks(w,k,seconds){for(let i=0;i<Math.ceil(seconds*60)&&w.status==='playing';i++)L.step(w,k,1/60);}
test('35篇97幕依文本設計49種可執行機制，各篇不共用同一款遊戲核心',()=>{
 assert.equal(Object.keys(chapters).length,35);assert.equal(cases.length,97);assert.equal(Object.keys(modes).length,49);assert.deepEqual(Object.keys(L.modes).sort(),Object.keys(modes).sort());const owners=new Map();
 for(const [key,c]of Object.entries(chapters)){assert.equal(c.modes.length,c.scenes.length);assert(c.link.length>20);for(const m of c.modes){assert(modes[m].rule.length>30);assert(!owners.has(m)||owners.get(m)===key,'跨篇重用 '+m);owners.set(m,key);}}
});
test('97幕一般難度均以公開操作事件及固定步長完成；沒有改生命、座標、命中或通關旗標',()=>{
 for(const c of cases){const w=fresh(c),r=play(L,w);assert.equal(r.status,'won',c.key+'/'+c.index+' '+JSON.stringify(r));assert(r.time>0);assert(r.time<w.limit);assert(L.score(w)>0&&L.score(w)<=10);assert.equal(w.engine,3);}
});
test('97幕放置或只在原地長按互動皆不能過關，沒有自動替玩家完成情境',()=>{
 for(const c of cases)for(const spam of [false,true]){const w=fresh(c);let n=0;while(w.status==='playing'&&n++<16000){if(spam&&n%30===1)L.action(w);L.step(w,spam?{action:true}:{},1/60);}assert.notEqual(w.status,'won',c.key+'/'+c.index+' '+(spam?'held':'idle'));assert.equal(L.score(w),0);}
});
test('49機制的局中JSON存讀保持相同下一步，種子與時間步長皆受控',()=>{
 for(const mode of Object.keys(modes)){const a=fresh({mode,index:1,key:'test'},109);ticks(a,{right:true},1.3);const b=JSON.parse(JSON.stringify(a));for(let i=0;i<120;i++){const k={left:i%6<3,up:i%7<2,guard:i%8===0};L.step(a,k,.02);L.step(b,k,.02);}assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),mode);const before=a.time;L.step(a,{},8);assert(a.time-before<=.05001);assert(JSON.stringify(a).length<18000,mode+' snapshot unexpectedly large');}
});
test('循隙下刀不能硬切捷徑；聚結處須主動凝視緩行，收刀本身不會增加進度',()=>{
 const c={mode:'knife',index:2,key:'paoding'},hard=fresh(c);ticks(hard,{right:true,action:true},12);assert.notEqual(hard.status,'won');assert(hard.blade<100);const idle=fresh(c);ticks(idle,{right:true},5);assert.equal(idle.next,1);const careful=fresh(c);assert.equal(play(L,careful).status,'won');assert(careful.blade>70);
});
test('處下通流保留器壁、修屋限制北窗書案；二柄不能靠連按免驗',()=>{
 const pot=fresh({mode:'waterworks',index:1,key:'laozi_read'});for(let i=0;i<12;i++)if(pot.clay[i]){L.command(pot,'select:'+i);L.action(pot);}ticks(pot,{},3);assert.notEqual(pot.status,'won');assert.equal(pot.wet,0);
 const studio=fresh({mode:'studio',index:0,key:'xiangji'});L.command(studio,'select:8');L.secondary(studio);L.command(studio,'desk');assert.equal(studio.wood,5);assert.equal(studio.opened.length,0);assert.equal(studio.desk,9);for(const i of [1,3,6]){L.command(studio,'select:'+i);L.action(studio);}ticks(studio,{},4);assert.notEqual(studio.status,'won');assert.equal(studio.lightHold,0);assert.equal(play(L,studio).status,'won');assert.equal(studio.wood,1);const saved=JSON.parse(JSON.stringify(studio));for(const key of ['opened','deskPlaces','sunAngle','lightHold'])delete saved[key];L.restore(saved);assert.doesNotThrow(()=>L.progress(saved));assert.equal(saved.patched.length,3);assert.equal(saved.wood,1);assert.equal(saved.status,'won');
 const seals=fresh({mode:'seals',index:1,key:'hanfei_read'});for(let i=0;i<1800&&seals.status==='playing';i++){if(i%10===0)L.action(seals);L.step(seals,{},1/60);}assert.notEqual(seals.status,'won');assert(seals.breach>=4);assert(seals.tokens.every(t=>!t.checked));
});
test('稱仔須等待力矩穩定及空盤校正；16兩、30兩、32兩讀數可核對',()=>{
 for(const index of [0,1,2]){const w=fresh({mode:'steelyard',index,key:'cheng'});while(w.slider<w.mass)L.command(w,'more');L.action(w);assert.notEqual(w.status,'won');if(index===2){ticks(w,{},30);L.action(w);assert.notEqual(w.status,'won');L.secondary(w);ticks(w,{},1.5);}ticks(w,{},30);L.action(w);assert.equal(w.status,'won');assert.equal(w.slider,[16,30,32][index]);}
});
test('全部49種情境繪圖可讀取初始及通關後狀態；每幕有專用操作與可讀狀態',()=>{
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});for(const mode of Object.keys(modes)){const w=fresh({mode,index:0,key:'test'});const states=[JSON.parse(JSON.stringify(w))];play(L,w);states.push(w);for(const state of states){assert.doesNotThrow(()=>ZH.literaryCanvas.draw(ctx,state,{mission:{...modes[mode],place:'情境'}},{}),mode);assert(L.controls(state).every(x=>x.command&&x.label));const p=L.progress(state);assert(p.goal&&p.detail&&p.resource&&p.threat,mode);}}
});
test('35篇仍保留原典與題庫，新增情境採獨立v3計分且兼容舊v1／v2首答',()=>{
 const e={window:{ZH:{LEARNING_TEXTS:{}}}};e.ZH=e.window.ZH;vm.createContext(e);for(const n of ['Data_zhuzi','Data_classics','Data_a_selections','Zhuzi_models'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8').replace(/<\/?script>/g,''),e);let count=0;for(const group of ['ZHUZI','CLASSICS','A_SELECTIONS'])for(const c of Object.values(e.ZH[group].chapters)){assert.equal(c.missionVersion,3);for(const t of c.stages){count++;assert(t.passage&&t.source);assert(t.mission.rule&&t.mission.connection&&t.mission.after);assert.equal(t.mission.frames[1].kind,'adapted');}}
 assert.equal(count,97);const M=e.ZH.zhuziModel,s=M.fresh('sample'),q={id:'q',answer:'A'};M.answer(s,q,'B');M.answer(s,q,'A');s.games=[{gameId:'one',firstScore:3,bestScore:5},{gameId:'one_v2',firstScore:4,bestScore:8},{gameId:'one_v3',firstScore:0,bestScore:9}];const old=JSON.stringify(s),restart=M.relaunch(s);assert.equal(JSON.stringify(s),old);assert.equal(restart.answers.q.correct,false);assert.equal(restart.recovered.q,true);assert.equal(M.stageGames([{gameId:'one'}],restart)[0].gameId,'one_v3');assert.equal(M.stageGames([{gameId:'one'}],{...s,stageGames:{0:'one_v2'}})[0].firstScore,4);
});
