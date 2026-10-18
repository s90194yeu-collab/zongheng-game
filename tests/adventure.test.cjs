const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8'),strip=s=>s.replace(/<\/?script>/g,'');
const env={window:{ZH:{LEARNING_TEXTS:{}}}};env.ZH=env.window.ZH;vm.createContext(env);for(const n of ['Data_zhuzi','Data_classics','Data_a_selections','Zhuzi_models','Adventure_models'])vm.runInContext(strip(raw(n)),env);const A=env.ZH.adventureModel,M=env.ZH.zhuziModel;
const chapters=Object.values(env.ZH.ZHUZI.chapters).concat(Object.values(env.ZH.CLASSICS.chapters),Object.values(env.ZH.A_SELECTIONS.chapters));
test('35關97幕皆有獨立敘事、改編對話、對手與動態挑戰，原典不混作改編台詞',()=>{
 assert.equal(chapters.length,35);let count=0;const intros=new Set(),types=new Set();for(const c of chapters){assert.equal(c.adventureVersion,2);for(const t of c.stages){count++;const a=t.adventure;types.add(a.type);assert.equal(a.frames.length,3);assert.equal(a.frames[0].kind,'narration');assert.equal(a.frames[1].kind,'adapted');assert(a.frames[0].text.length>25);assert(!intros.has(a.frames[0].text));intros.add(a.frames[0].text);assert(a.place);assert(a.rival);assert(a.scene.startsWith('scene:'));assert(t.passage);assert(t.source);}}
 assert.equal(count,97);assert.deepEqual([...types].sort(),['clash','race','siege','tempo']);
});
test('176題原典、題幹、選項、答案與解析逐字保留，不因遊戲改造更動',()=>{
 const baseline=require('./fixtures/study-anchor-baseline.json');for(const [f,expected]of Object.entries(baseline)){const e={};vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',f),'utf8'),e);const rows=Object.entries(e.SCENARIO_DATA).sort().map(([id,d])=>[id,d.anchors]);assert.equal(rows.reduce((n,[,a])=>n+a.length,0),expected.count);assert.equal(crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'),expected.sha256);}
});
function simulate(type,{assist=false,tactic='read',seed=582,variant=1,passive=false,guard=false}={}){
 const w=A.create({type,variant},assist,tactic,seed);let cooldown=0;for(let i=0;i<18000&&w.status==='playing';i++){
  const dt=1/60;cooldown-=dt;let input={},target;if(!passive){
   if(type==='clash'){const b=w.boss;if(b.state==='tell'&&b.pattern===1&&A.dist(w,b)<210){target={x:w.x+(w.x-b.x),y:w.y+(w.y-b.y)};input.dash=true;}else if(b.state==='tell'&&b.pattern===0){target={x:w.x+(w.y<b.y?-100:100),y:w.y+100};input.dash=true;}else if(b.state==='rush'){target={x:80,y:470};input.guard=true;}else{target=b;if(A.dist(w,b)<125&&b.state==='recover'&&cooldown<=0){A.action(w);cooldown=.46;}}}
   else if(type==='race'){target=w.route[w.next%w.route.length];input.dash=w.stamina>55;}
   else if(type==='siege'){const enemy=w.enemies.filter(e=>e.hp>0).sort((a,b)=>a.x-b.x)[0];if(enemy){target=enemy;if(A.dist(w,enemy)<120&&cooldown<=0){A.action(w);cooldown=.35;}if(guard&&A.dist(w,enemy)<90)input.guard=true;}else target={x:700,y:320};input.dash=w.stamina>75;}
   else if(type==='tempo'){const n=w.notes.filter(n=>!n.done).sort((a,b)=>a.x-b.x)[0];if(n){target={x:170,y:n.y};if(Math.abs(n.x-180)<30&&Math.abs(w.y-n.y)<45&&cooldown<=0){A.action(w);cooldown=.3;}}}
   if(target){input.right=target.x>w.x+7;input.left=target.x<w.x-7;input.down=target.y>w.y+7;input.up=target.y<w.y-7;}
  }
  A.step(w,input,dt);
 }return w;
}
test('四種新機制都可用固定步長的真實移動及互動完成；不移位、不改生命或命中結果',()=>{
 for(const [type,tactic]of [['clash','guard'],['race','read'],['siege','rush'],['tempo','read']]){const w=simulate(type,{tactic});assert.equal(w.status,'won',type+' '+JSON.stringify(A.progress(w)));assert(w.time>8);assert(w.time<w.limit);assert(A.score(w)>0&&A.score(w)<=10);}
});
test('放著不動四種都會輸，對手可先到終點；守備會因漏敵失敗',()=>{
 for(const type of ['clash','race','siege','tempo']){const w=simulate(type,{passive:true});assert.equal(w.status,'lost',type);assert.equal(A.score(w),0);if(type==='race')assert.equal(w.rival.next,12);if(type==='siege')assert(w.baseHp<=0||w.hp<=0);}
});
test('對決必須抓破綻，連按無法穿過防禦，三個攻勢階段會轉換',()=>{
 const w=A.create({type:'clash',variant:0},false,'rush',123),b=w.boss;w.x=b.x-100;w.y=b.y;const hp=b.hp;A.action(w);assert.equal(b.hp,hp);assert(w.misses>0);
 b.state='recover';w.attack=0;A.action(w);assert(b.hp<hp);const after=b.hp;w.attack=0;A.action(w);assert.equal(b.hp,after,'同一瞬間不重複扣血');
 const phases=new Set(),patterns=new Set();const run=simulate('clash',{tactic:'guard'});assert.equal(run.status,'won');assert(run.boss.phase===3);assert(run.boss.pattern>=0&&run.boss.pattern<=2);
});
test('戰術是體力、速度、傷害與氣力的取捨；衝刺消耗氣力且有冷卻',()=>{
 const safe=A.create({type:'clash'},false,'guard',2),rush=A.create({type:'clash'},false,'rush',2),read=A.create({type:'clash'},false,'read',2);assert(safe.hp>rush.hp);assert(safe.speed<rush.speed);assert(rush.power>safe.power);assert(read.maxStamina>rush.maxStamina);
 A.step(read,{right:true,dash:true},1/60);assert(read.stamina<read.maxStamina);assert(read.cooldown>0);const first=read.stamina;A.step(read,{right:true,dash:true},1/60);assert(read.stamina>=first,'冷卻中不重扣衝刺氣力');
});
test('節拍須走到對應線並在時間窗出手，空按破連段，練習仍需親自命中',()=>{
 const w=A.create({type:'tempo'},false,'read',42);A.action(w);assert.equal(w.hits,0);assert.equal(w.misses,1);A.step(w,{},.05);assert.equal(w.fans,0);
 const practice=simulate('tempo',{assist:true});assert.equal(practice.hits,24);assert.equal(practice.status,'won');assert.equal(practice.assist,true);
});
test('JSON中途儲存可重現同一場對手與節拍，重試換種子會產生不同排列',()=>{
 for(const type of ['clash','race','siege','tempo']){let w=A.create({type,variant:2},false,'read',12);for(let i=0;i<100;i++)A.step(w,{up:true},1/60);const saved=JSON.parse(JSON.stringify(w));for(let i=0;i<200;i++){A.step(w,{right:true},1/60);A.step(saved,{right:true},1/60);}assert.deepEqual(JSON.parse(JSON.stringify(w)),JSON.parse(JSON.stringify(saved)),type);}
 const a=A.create({type:'tempo'},false,'read',12),b=A.create({type:'tempo'},false,'read',99);for(let i=0;i<600;i++){A.step(a,{},1/60);A.step(b,{},1/60);}assert.notDeepEqual(a.notes.map(n=>n.lane),b.notes.map(n=>n.lane));
});
test('舊存檔首答與舊挑戰保留，舊新版並存時每幕只取一局，重試不覆寫首輪',()=>{
 const old=M.fresh('S_al07_xuesi');old.stage=1;old.answers.test={correct:false};old.games=[{gameId:'al_xuesi_1',firstScore:10,bestScore:10}];const s=M.relaunch(old);assert.equal(s.stage,0);assert.equal(s.answers.test.correct,false);assert.equal(old.stage,1);assert.equal(s.games.length,1);
 const lost=A.create({type:'clash'},false,'read',1);lost.status='lost';M.recordGame(s,lost,'al_xuesi_1_v2');const won=A.create({type:'clash'},false,'read',1);won.status='won';M.recordGame(s,won,'al_xuesi_1_v2');s.stageGames[0]='al_xuesi_1_v2';const chosen=M.stageGames([{gameId:'al_xuesi_1'}],s);assert.equal(chosen.length,1);assert.equal(chosen[0].firstScore,0);assert(chosen[0].bestScore>0);assert.equal(M.strategy(chosen,1),0);assert.equal(s.games[0].firstScore,10);
});
