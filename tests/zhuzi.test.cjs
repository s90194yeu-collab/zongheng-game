const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8');
const {people}=require('../src/content/zhuzi.cjs');
const contentEnv={window:{ZH:{LEARNING_TEXTS:{}}}};contentEnv.ZH=contentEnv.window.ZH;vm.createContext(contentEnv);vm.runInContext(raw('Data_zhuzi').replace(/<\/?script>/g,''),contentEnv);const chapters=contentEnv.window.ZH.ZHUZI.chapters;const draftEnv={};vm.createContext(draftEnv);vm.runInContext(fs.readFileSync(path.join(root,'src/legacy/Zhuzi_data.gs'),'utf8'),draftEnv);const drafts=draftEnv.SCENARIO_DATA;
const env={window:{ZH:{}}};vm.createContext(env);vm.runInContext(raw('Zhuzi_models').replace(/<\/?script>/g,''),env);const M=env.window.ZH.zhuziModel;
test('六位諸子各有初階與進階，54題和36段任務皆有原典與唯一代碼',()=>{
 assert.equal(people.length,6);assert.equal(Object.keys(chapters).length,12);const ids=[];
 for(const c of Object.values(chapters)){
  assert.equal(c.stages.length,3);assert.equal(drafts[c.id].anchors.length,c.level==='bio'?3:6);
  assert.equal(drafts[c.id].codex.length,2);assert(fs.existsSync(path.join(root,'src/legacy',c.id+'.html')));
  for(const t of c.stages){assert(t.passage.length>=14);assert(t.url.startsWith('https://ctext.org/'));assert.equal(t.game.targets.length,3);assert(t.story.length>30);}
  for(const a of drafts[c.id].anchors){assert.equal(Object.keys(a.options).length,4);assert.equal(a.options[a.answer].length,1);assert(a.explanation);ids.push(a.id);}
 }
 assert.equal(ids.length,54);assert.equal(new Set(ids).size,54);
});
function move(w,x,y){
 // BFS over actual collision geometry, then real fixed-step movement (no teleports).
 const cells=[],key=(x,y)=>x+','+y,toCell=(x,y)=>[Math.round((x-50)/25),Math.round((y-145)/25)];
 const start=toCell(w.x,w.y),goal=toCell(x,y),queue=[start],seen=new Map([[key(...start),null]]);let found;
 while(queue.length){const a=queue.shift();if(a[0]===goal[0]&&a[1]===goal[1]){found=a;break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const b=[a[0]+dx,a[1]+dy],k=key(...b),px=50+b[0]*25,py=145+b[1]*25;if(px<50||px>950||py<145||py>495||seen.has(k)||M.blocked(w,px,py))continue;seen.set(k,a);queue.push(b);}}
 assert(found,'reachable target '+w.type+' '+x+','+y);
 for(let a=found;a;a=seen.get(key(...a)))cells.unshift({x:50+a[0]*25,y:145+a[1]*25});cells.push({x,y});
 for(const t of cells){let guard=0;while(M.dist(w,t)>4&&w.status==='playing'&&guard++<120){M.step(w,{right:t.x>w.x+2,left:t.x<w.x-2,down:t.y>w.y+2,up:t.y<w.y-2},1/60);}assert(guard<120,'movement stuck '+w.type);}
}
test('七種動作機制均可用實際移動與互動完成，牆面可繞行',()=>{
 for(const type of ['journey','flow','seam','practice','argue','rescue','defend']){
  const w=M.create(type,true),ts=M.targets(w);
  if(type==='defend'){
   for(let i=0;i<12000&&w.status==='playing';i++){const e=w.enemies[0],input=e?{right:e.x>w.x+20,left:e.x<w.x-20,down:e.y>w.y+15,up:e.y<w.y-15}:{};M.step(w,input,1/60);if(i%30===0)M.interact(w);}
  }else for(let i=0;i<3;i++){
   if(type==='rescue'){move(w,135,440);M.interact(w);}
   move(w,ts[i].x,ts[i].y);
   if(type==='practice'){for(let j=0;j<180&&!w.done.includes(i);j++){M.interact(w);M.step(w,{},1/60);}}
   else if(!['flow','seam'].includes(type))M.interact(w);
   if(['journey','argue'].includes(type)){move(w,885,170);M.interact(w);}
  }
  assert.equal(w.status,'won',type+': '+JSON.stringify(w));assert(M.score(w)>=1&&M.score(w)<=10);
 }
});
test('首答、訂正與首輪分數在JSON存讀及重試後仍分開保存',()=>{
 let s=M.fresh('S_zz01_laobio'),q=drafts.S_zz01_laobio.anchors[0];const wrong=Object.keys(q.options).find(k=>k!==q.answer);
 assert.equal(M.answer(s,q,wrong).correct,false);s=JSON.parse(JSON.stringify(s));assert.equal(M.answer(s,q,q.answer).correct,true);assert.equal(s.answers[q.id].correct,false);assert.equal(s.attempts[q.id],2);assert.equal(s.recovered[q.id],true);
 const lost=M.create('journey');lost.status='lost';M.recordGame(s,lost,'zz_test');const win=M.create('journey');win.status='won';M.recordGame(s,win,'zz_test');assert.equal(s.games[0].firstScore,0);assert.equal(s.games[0].bestScore,10);
});
test('失敗可重試、衝刺有冷卻、移動不穿牆，時間步長限制保護背景分頁',()=>{
 const w=M.create('seam');move(w,130,200);for(let i=0;i<1000;i++)M.step(w,{right:true},1/60);assert(w.x<355,'wall collision');const x=w.x;M.step(w,{right:true,dash:true},20);assert(w.x-x<25);assert(w.cooldown>0);
 const fail=M.create('journey');fail.time=149.99;M.step(fail,{},.03);assert.equal(fail.status,'lost');assert.equal(M.create('journey',true).status,'playing');
});
test('諸子題庫沿用GAS格式且題庫停用與缺題會阻止開關',{skip:!fs.existsSync(path.join(root,'gas-private-source/AnchorBank.gs'))},()=>{
 const e={};vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(root,'gas/Code.gs'),'utf8'),e);vm.runInContext(fs.readFileSync(path.join(root,'gas-private-source/TeacherApi.gs'),'utf8'),e);vm.runInContext(fs.readFileSync(path.join(root,'gas-private-source/AnchorBank.gs'),'utf8'),e);
 for(const d of Object.values(drafts))for(const a of d.anchors)assert.equal(e.draftProblems_(a).length,0,a.id);
 vm.runInContext(fs.readFileSync(path.join(root,'src/legacy/Zhuzi_data.gs'),'utf8'),e);assert.equal(Object.keys(e.scenarioRegistry_()).filter(id=>id.startsWith('S_zz')).length,12);
 vm.runInContext(fs.readFileSync(path.join(root,'gas-private-source/StoryGuard.gs'),'utf8'),e);
 e.readBankRows_=()=>[];const c=chapters.S_zz02_laoread,required=c.stages.flatMap(s=>s.questionIds);
 const res=e.api_getStoryAnchors(c.id,required);assert.equal(res.ok,true);assert.equal(res.anchors.length,6);
 e.readBankRows_=()=>[{scenarioId:c.id,id:required[0],enabled:false}];const blocked=e.api_getStoryAnchors(c.id,required);assert.equal(blocked.ok,false);assert.equal(blocked.missing[0].reason,'disabled');
});

test('新章不以缺省零分降低德望，兩項收藏以實際數量計算，舊章計算保留',{skip:!fs.existsSync(path.join(root,'gas-private-source/TeacherApi.gs'))},()=>{
 const e={};vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(root,'gas-private-source/TeacherApi.gs'),'utf8'),e);
 const cfg={codexPerScenario:12},base={anch:{},games:{},scen:{S_cq08_weizheng:{strategy:80,virtue:70}},codex:12};
 const old=e.studentDims_(base,cfg);assert.equal(old.virtue,70);assert.equal(old.erudition,100);
 base.scen.S_zz01_laobio={strategy:90,virtue:0};base.codex=14;const mixed=e.studentDims_(base,cfg);assert.equal(mixed.virtue,70);assert.equal(mixed.erudition,100);
 const only=e.studentDims_({anch:{},games:{},scen:{S_zz01_laobio:{strategy:90,virtue:0}},codex:2},cfg);assert.equal(only.virtue,null);assert.equal(only.erudition,100);
});
