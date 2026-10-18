const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),e={window:{ZH:{}}};vm.createContext(e);
for(const f of ['Literary_core','Literary_classics'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',f+'.html'),'utf8').replace(/<\/?script>/g,''),e);
const L=e.window.ZH.literary,fresh=(mode,index=0)=>L.create({mode,index,key:'test'}),tick=(w,k,seconds)=>{for(let i=0;i<Math.ceil(seconds*60)&&w.status==='playing';i++)L.step(w,k,1/60);};
test('林沖採百回本第十一回小說選段，含柴進薦書、風雪與朱貴號箭；八篇44題及AI場景皆可核對',()=>{
 const texts=require('../src/content/classic-texts.json'),{additional}=require('../src/content/classic-expansion.cjs');
 assert(decodeURIComponent(texts.linchong.url).includes('100回本')&&decodeURIComponent(texts.linchong.url).includes('第011回'));const text=texts.linchong.paragraphs.join('');for(const term of ['柴進','朱貴','號箭','雪'])assert(text.includes(term),term);assert(!text.includes('寶劍記'));
 assert.equal(additional.length,8);assert.equal(additional.reduce((n,c)=>n+c.stages.reduce((n,s)=>n+s.questions.length,0),0),44);
 for(const c of additional){assert(fs.statSync(path.join(root,'public/media/scene_classic_'+c.key+'_ai.webp')).size>20000);assert(!/mw-parser|style=|\.mw-|[{}]/.test(c.fullText.join('')),c.key+'不得混入網頁樣式');}
});
test('廠獄入門同時核對四件裝備、卸佩飾、清掃與巡查時機；門前連說不能完成石壕兩線',()=>{
 const bare=fresh('incognito');tick(bare,{right:true},1.6);assert(bare.x<430);assert(bare.mistakes>0);assert.equal(bare.visited,false);
 const dressed=fresh('incognito');for(let i=0;i<5;i++){L.command(dressed,'select:'+i);L.action(dressed);}tick(dressed,{},2.99);tick(dressed,{right:true},1.6);assert(dressed.x<430,'全套易裝仍須清掃行進');
 const night=fresh('doorflee');L.secondary(night);for(let i=0;i<6;i++){L.action(night);tick(night,{},.85);}assert.equal(night.answers,0);assert.notEqual(night.status,'won');
});
test('老翁起跳後切換老婦仍持續受重力，三道牆不能靠平走穿過',()=>{
 const w=fresh('doorflee');L.skill(w);tick(w,{},.2);assert(w.y<250);L.secondary(w);tick(w,{},1.1);assert.equal(w.y,250);assert.equal(w.ground,true);
 const walk=fresh('doorflee');tick(walk,{right:true},1.1);assert(walk.x<240);assert.equal(walk.y,250);assert.notEqual(walk.status,'won');
});
test('雪路停步一秒後可放開Q再按E護信；同一背風處不重複計數，離開須重新停步',()=>{
 const w=fresh('frost');tick(w,{right:true},1.6);tick(w,{guard:true},1.8);assert(w.restHold>=1);tick(w,{},.3);L.action(w);assert.equal(w.rested.length,1);assert.equal(w.sealed,true);L.action(w);assert.equal(w.rested.length,1);tick(w,{right:true},.8);assert.equal(w.restHold,0);assert.equal(w.restBay,-1);
});
test('文札同欄仍須符合橫直形制；帳前擒拿接手後須穩住，不能同刻連按卸勢',()=>{
 const wrong=fresh('fallingText');tick(wrong,{left:true},.29);assert.equal(wrong.piece.x,0);L.secondary(wrong);L.action(wrong);assert.equal(wrong.counts[0],0);assert.equal(wrong.mistakes,1);assert(wrong.board.some(x=>x>=0));
 const right=fresh('fallingText');tick(right,{left:true},.29);L.action(right);assert.equal(right.counts[0],1);assert.equal(right.mistakes,0);
 const fight=fresh('grapple');L.action(fight);tick(fight,{right:true},.8);L.secondary(fight);while(fight.phase==='wait')tick(fight,{},.05);while(fight.enemyState!=='伸手')tick(fight,{},.016);L.action(fight);assert.equal(fight.grip,true);L.secondary(fight);assert.equal(fight.throws,0);tick(fight,{},.25);L.secondary(fight);assert.equal(fight.throws,1);
});
