const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{ZH:{}}};vm.createContext(ctx);for(const n of ['Literary_core','Literary_seven'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8').replace(/<\/?script>/g,''),ctx);
const L=ctx.window.ZH.literary,{additional,modes}=require('../src/content/classic-seven.cjs'),{play}=require('./helpers/literary-player.cjs'),fresh=(m,i=0,seed=123)=>L.create({mode:m,index:i,key:'new'},false,'read',seed),tick=(w,t=1)=>{for(let i=0;i<Math.ceil(t*60)&&w.status==='playing';i++)L.step(w,{},1/60);};
test('七篇14幕28題與原典範圍完整，七種主玩法互不重用、皆有專屬AI場景',()=>{
 assert.deepEqual(additional.map(c=>c.title),['過秦論','登樓賦','蘭亭集序','始得西山宴遊記','賣柑者言','指喻','臺灣通史序']);assert.equal(Object.keys(modes).length,7);
 const unique=new Set();for(const c of additional){assert.equal(c.stages.length,2);unique.add(c.stages[0].mode);assert(c.fullText.join('').length>300,c.title);assert(!/mw-parser|Publicdomain|一作|[{}]/.test(c.fullText.join('')),c.title);assert(fs.statSync(path.join(root,'public/media/scene_seven_'+c.key+'_ai.webp')).size>30000);for(const s of c.stages){assert.equal(s.questions.length,2);for(const q of s.questions){assert(s.passage.length>50);assert.equal(q.bad.length,3);assert.equal(new Set([q.good,...q.bad]).size,4);assert(q.explanation.length>25);}}}
 assert.equal(unique.size,7);const qin=additional[0];assert(qin.editionNote.includes('上篇'));assert(!qin.fullText.join('').includes('前事之不忘'));assert(additional.find(c=>c.key==='tongshi').link.includes('歷史脈絡'));
});
test('七款兩幕各用三個種子，以公開操作均可過關，包含真的拖曳而非設定通關旗標',()=>{
 for(const mode of Object.keys(modes))for(const i of [0,1])for(const seed of [1,123,8421]){const w=fresh(mode,i,seed);const result=play(L,w);assert.equal(result.status,'won',mode+'/'+i+'/'+seed+' '+JSON.stringify(result));assert(w.time>0);assert(w.time<w.limit);assert(L.score(w)>0);}
});
test('曲水杯須從杯身施力、停穩才可接札；中斷拖曳不會偷偷發射',()=>{
 const w=fresh('cupCurrent');L.action(w);assert.equal(w.next,0);L.point(w,800,300,true);L.release(w,900,300);assert.equal(w.shots,0);L.point(w,140,450,true);L.drag(w,360,415);L.cancel(w);L.release(w,360,415);assert.equal(w.shots,0);tick(w);assert.equal(w.next,0);
});
test('剖柑不可未驗先猜、不可從外圈隔空跳到內圈；換果後必須重新驗證',()=>{
 const w=fresh('citrusPeel');L.secondary(w);L.skill(w);assert.equal(w.fruit,0);const p=w.path[0];L.point(w,p.x,p.y,true);const n=w.cut;L.drag(w,700,100);assert.equal(w.cut,n);L.cancel(w);assert.equal(w.fruit,0);
});
test('攀壁遠點和鬆點都不能抓，拖曳取消不換岩點；兩幕有不同位置',()=>{
 const a=fresh('cliffHands'),b=fresh('cliffHands',1);assert.notDeepEqual(a.holds,b.holds);const p={x:a.hands[0].x,y:a.hands[0].y-Math.min(650,a.bodyY-355)};L.point(a,p.x,p.y,true);L.drag(a,380,160);L.cancel(a);assert.equal(a.top,1);L.command(a,'select:8');L.action(a);assert.equal(a.top,1);assert.equal(a.hp,5);
});
test('封源須阻止所有出口，不能只封一線；晚處理確實增加受損格，回看最多一次',()=>{
 const w=fresh('faultContain');L.command(w,'select:0');L.action(w);L.secondary(w);assert(w.active.length>1);const expanded=w.active.length;L.skill(w);assert.equal(w.active.length,1);L.skill(w);assert.equal(w.active.length,1);assert(w.rewound);assert(expanded>1);assert.notEqual(w.status,'won');
});
test('視差與校刊尚未穩定時不能提交；所有模式的JSON存讀會接續同一狀態',()=>{
 for(const m of ['horizon','sourcePress']){const w=fresh(m);if(m==='horizon')L.action(w);else L.command(w,'publish');assert.equal(w.hp,5);assert.notEqual(w.status,'won');}
 for(const mode of Object.keys(modes)){const a=fresh(mode,1);tick(a,.3);const b=JSON.parse(JSON.stringify(a));for(let i=0;i<80;i++){L.step(a,{left:true},.02);L.step(b,{left:true},.02);}assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),mode);assert(JSON.stringify(a).length<16000);}
});
