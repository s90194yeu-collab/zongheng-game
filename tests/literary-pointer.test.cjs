const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),env={window:{ZH:{}}};vm.createContext(env);
for(const name of ['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_canvas','Literary_classics','Literary_seven','Literary_classics_canvas','Literary_seven_canvas','Literary_pointer'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',name+'.html'),'utf8').replace(/<\/?script>/g,''),env);
const ZH=env.window.ZH,L=ZH.literary,P=ZH.literaryPointer;
const fresh=(mode,index=0)=>L.create({mode,index,key:'public-pointer'},false,'read',91);
function ticks(w,seconds,k={}){for(let i=0;i<Math.ceil(seconds*60)&&w.status==='playing';i++)L.step(w,k,1/60);}
function tap(w,x,y){P.down(w,x,y);P.release(w,x,y);}
function drag(w,from,to,seconds=.8){P.down(w,from.x,from.y);P.drag(w,to.x,to.y);ticks(w,seconds);P.release(w,to.x,to.y);}

test('先秦諸子與古文分卷不載新增經典模型時，仍可安全載入直接操作模組',()=>{
 const partial={window:{ZH:{}}};vm.createContext(partial);for(const name of ['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_pointer'])assert.doesNotThrow(()=>vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',name+'.html'),'utf8').replace(/<\/?script>/g,''),partial));
 const a=partial.window.ZH.literary;assert.equal(a.modes.lookout,undefined);assert.equal(a.modes.knife.interaction(a.create({mode:'knife'})).kind,'trace-seam');
});

test('18款場景各有具體互動，指標取消不提交、舊鍵盤仍可操作',()=>{
 assert.equal(P.modes.length,18);assert.equal(new Set(P.modes.map(mode=>P.describe(fresh(mode)).kind)).size,18);
 for(const mode of P.modes){const w=fresh(mode),info=P.describe(w);assert(info.hint.length>25,mode);assert.equal(info.directions,false);assert.equal(L.modes[mode].interaction(w).kind,info.kind);assert.deepEqual(JSON.parse(JSON.stringify(P.geometry(w).canvas)),{width:1000,height:560});
  P.down(w,500,300);P.drag(w,650,400);P.cancel(w);const log=w.log.length;P.release(w,650,400);assert.equal(w.log.length,log,mode+' cancel must not submit');ticks(w,.1,{right:true});assert.doesNotThrow(()=>L.progress(w));
 }
 const old=fresh('snowcloak'),x=old.corners[0].x;ticks(old,.3,{left:true});assert(old.corners[0].x<x,'keyboard remains available before any pointer gesture');
});

test('護卷要展讀且四角親自慢拖到位；取消與只點案角不會固定',()=>{
 const w=fresh('snowcloak');tap(w,500,320);assert(w.observed);tap(w,320,210);assert.equal(w.corners.filter(p=>p.pinned).length,0);
 const p=w.corners[0];P.down(w,p.x,p.y);P.drag(w,320,210);ticks(w,.75);P.cancel(w);assert.equal(w.corners[0].pinned,false);
 for(let i=0;i<4;i++)drag(w,{...w.corners[i]},w.anchors[i],.8);ticks(w,2.2);assert.equal(w.status,'won');assert.equal(w.corners.filter(p=>p.pinned).length,4);assert(w.dry>60);
});

test('染布按住、提起、候氧化可完成三輪；一味長壓會損布',()=>{
 const w=fresh('dye');for(let i=0;i<3;i++){P.down(w,570,270);ticks(w,1.9);P.release(w,570,270);ticks(w,1.5);}assert.equal(w.status,'won');assert.equal(w.cycles,3);assert(w.color>=1.35&&w.color<=2.5);
 const rough=fresh('dye');P.down(rough,570,270);ticks(rough,4.6);assert(rough.mistakes>0);assert.equal(rough.cycles,0);assert.notEqual(rough.status,'won');
});

test('暫停取消未放手的浸染不會誤當提布；正常提布已提交的工序可跨JSON續算一次',()=>{
 const aborted=fresh('dye');L.point(aborted,570,270,true);ticks(aborted,1.9);L.cancel(aborted);ticks(aborted,.1);assert.equal(aborted.cycles,0);assert.equal(aborted.color,0);
 const released=fresh('dye');L.point(released,570,270,true);ticks(released,1.9);L.release(released,570,270);const saved=JSON.parse(JSON.stringify(released));L.restore(saved);L.cancel(saved);assert.equal(saved.cycles,0);ticks(saved,.02);assert.equal(saved.cycles,1);assert(saved.color>.45);ticks(saved,.2);assert.equal(saved.cycles,1);
});

test('已放手的落簡、篙勢及煞停意圖在暫停或JSON讀檔後保留；未放手的手勢才取消',()=>{
 for(const mode of ['fallingText','canglang','reins','frost']){
  const a=fresh(mode);if(mode==='fallingText'){L.point(a,480,145,true);L.drag(a,360,145);L.release(a,360,145);}else if(mode==='canglang'){L.point(a,300,300,true);L.drag(a,500,350);L.release(a,500,350);}else if(mode==='reins'){L.point(a,820,300,true);ticks(a,1);L.release(a,820,300);}else{L.point(a,700,480,true);L.drag(a,760,480);ticks(a,1);L.release(a,760,480);}
  const b=JSON.parse(JSON.stringify(a));L.restore(b);L.cancel(b);assert.equal(b.pointerControl.down,false);ticks(a,1);ticks(b,1);
  for(const key of ['x','y','speed','vx','vy','distance','angle','placed','board','counts'])if(a[key]!==undefined)assert.deepEqual(JSON.parse(JSON.stringify(b[key])),JSON.parse(JSON.stringify(a[key])),mode+'/'+key);
  if(mode==='fallingText')assert.equal(b.placed,1);if(mode==='canglang')assert(b.vx>0);if(mode==='reins')assert.equal(b.speed,0);if(mode==='frost')assert(Math.hypot(b.vx,b.vy)<1);
 }
 const held=fresh('fallingText');L.point(held,480,145,true);L.drag(held,360,145);L.cancel(held);L.release(held,360,145);ticks(held,.5);assert.equal(held.placed,0);
});

test('實際前端事件鏈區分正常放手和失去capture，第二指不會劫走主手勢',()=>{
 const source=fs.readFileSync(path.join(root,'src/legacy/Zhuzi_js.html'),'utf8'),from=source.indexOf('const coord=e=>'),to=source.indexOf('updateLiteraryHud();lastFrame=0',from);assert(from>=0&&to>from);
 const listeners={},captured=new Set(),s={world:fresh('fallingText')};let cancelled=0;
 const canvas={getBoundingClientRect:()=>({left:0,top:0,width:1000,height:560}),addEventListener:(name,fn)=>{listeners[name]=fn;},setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture(id){captured.delete(id);listeners.lostpointercapture?.({pointerId:id});}};
 const runtime={canvas,s,L:{...L,cancel(w){cancelled++;return L.cancel(w);}},updateLiteraryHud(){},draw(){}};vm.runInNewContext(source.slice(from,to),runtime);
 const event=(pointerId,x,y)=>({pointerId,clientX:x,clientY:y,preventDefault(){}});
 listeners.pointerdown(event(1,480,145));listeners.pointermove(event(1,360,145));listeners.pointerdown(event(2,620,145));listeners.pointermove(event(2,620,145));listeners.pointerup(event(2,620,145));assert.equal(s.world.pointerControl.column,0);assert.equal(s.world.pointerControl.down,true);
 listeners.pointerup(event(1,360,145));assert.equal(cancelled,0,'normal releasePointerCapture is not a cancellation');ticks(s.world,.7);assert.equal(s.world.placed,1);
 s.world=fresh('fallingText');listeners.pointerdown(event(3,480,145));listeners.pointermove(event(3,360,145));canvas.releasePointerCapture(3);assert.equal(cancelled,1);ticks(s.world,.3);assert.equal(s.world.placed,0);assert.equal(s.world.pointerControl.down,false);
});

test('文札拖欄、點轉形、放手落簡，八份依公開形制完成；取消不會硬落',()=>{
 const w=fresh('fallingText');P.down(w,480,140);P.drag(w,360,140);P.cancel(w);ticks(w,.2);assert.equal(w.placed,0);
 for(let n=0;n<8&&w.status==='playing';n++){
  if(w.piece.vertical!==w.target.vertical)tap(w,830,435);
  const target={x:340+w.target.x*40+20,y:145};drag(w,{x:480,y:145},target,.7);ticks(w,.25);
 }
 assert.equal(w.status,'won');assert(w.counts.every(n=>n===2));assert.equal(w.mistakes,0);
});

test('輪哨須把實際班次拖入哨位；點班次與放錯位置不會派遣',()=>{
 const w=fresh('watchrelay');tap(w,150,330);assert.equal(w.active,-1);drag(w,{x:150,y:330},{x:350,y:118},.05);assert.equal(w.active,-1);
 for(let n=0;n<10;n++){const pair=n%5;drag(w,{x:150+pair*175,y:330},{x:500,y:118},.05);assert.equal(w.active,pair);ticks(w,4.02);}
 assert.equal(w.status,'won');assert.equal(w.round,10);assert.equal(w.used.length,5);
});

test('孟子井繩操作保留實際行走、擺動、繩長與慢提；按住目標不會傳送繩端',()=>{
 const w=fresh('well');P.down(w,w.anchor.x,w.anchor.y);ticks(w,.2);assert.equal(w.anchored,false);assert(w.x>100&&w.x<180);ticks(w,2.1);P.release(w,w.anchor.x,w.anchor.y);assert(w.anchored);
 P.down(w,w.child.x,w.child.y);ticks(w,.1);assert(D(w.tip,w.child)>100);assert(!w.caught);ticks(w,9);P.release(w,w.child.x,w.child.y);assert(w.caught,'release catches only after actual rope physics reaches the child');
 P.down(w,500,235);ticks(w,10);P.release(w,500,235);assert.equal(w.status,'won');assert.equal(w.grip,100);
 function D(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
});

test('稱錘拖動須等物理平衡與校正，三幕皆能經手勢完成讀數',()=>{
 for(const index of [0,1,2]){const w=fresh('steelyard',index);if(index===2){tap(w,180,112);ticks(w,1.4);}const length=-160+w.mass*12,x=500+Math.cos(w.angle)*length,y=225+Math.sin(w.angle)*length;
  P.down(w,x,y);ticks(w,.1);assert.notEqual(w.slider,w.mass,'cannot teleport the weight');ticks(w,5);P.release(w,x,y);tap(w,830,480);assert.notEqual(w.status,'won','unsettled beam cannot be recorded');ticks(w,22);tap(w,830,480);assert.equal(w.status,'won');assert.equal(w.slider,[16,30,32][index]);
 }
});

test('洞庭三幕須選水道並實際拖光追船；從浮標區外長按不能直接示航',()=>{
 for(const index of [0,1,2]){const w=fresh('lookout',index);for(const boat of w.boats){
   while(boat.x<515&&w.status==='playing')ticks(w,.02);
   const opt=L.options(w)[boat.route];tap(w,opt.x,opt.y);P.down(w,boat.x,boat.y);
   for(let n=0;n<900&&!boat.done&&w.status==='playing';n++){P.drag(w,boat.x,boat.y);ticks(w,1/60);}P.release(w,boat.x,boat.y);
   assert(boat.done,'boat must receive physical light, correct channel and sufficient time');
  }assert.equal(w.status,'won');assert(w.power>=0);
 }
 const early=fresh('lookout');P.down(early,140,180);ticks(early,1);P.release(early,140,180);assert(early.boats.every(b=>b.signal===0));assert.notEqual(early.status,'won');
});

test('石壕吏兩線以拖行、上划越牆及點老婦應門完成，不會只點應門就逃離',()=>{
 const w=fresh('doorflee');tap(w,700,420);assert.equal(w.answers,0);
 const walk=(seconds,jump=false)=>{P.down(w,w.x,w.y);P.drag(w,w.x+100,w.y-(jump?55:0));ticks(w,seconds);P.release(w,w.x+100,w.y-(jump?55:0));};
 walk(.3);tap(w,700,420);assert.equal(w.answers,1);walk(1,true);walk(.6);tap(w,700,420);assert.equal(w.answers,2);walk(1.1,true);ticks(w,.2);walk(1,true);tap(w,700,420);assert.equal(w.answers,3);walk(.6);assert.equal(w.status,'won');assert(w.x>905);
});

test('桃花村伸手時按住接招、稍候放開卸勢；退讓後須收手，取消不會代替卸勢',()=>{
 const w=fresh('grapple');tap(w,120,420);assert(w.safe);drag(w,{x:170,y:420},{x:335,y:420},.82);assert.equal(w.phase,'wait');ticks(w,4.2);
 for(let i=0;i<2;i++){for(let n=0;n<250&&w.enemyState!=='伸手';n++)ticks(w,.02);P.down(w,w.enemy.x,370);assert(w.grip);ticks(w,.3);P.release(w,w.enemy.x,370);assert.equal(w.throws,i+1);ticks(w,.05);}
 assert.equal(w.phase,'yield');P.down(w,500,400);P.drag(w,400,400);P.release(w,400,400);tap(w,830,515);assert.equal(w.status,'won');
 const paused=fresh('grapple');tap(paused,120,420);drag(paused,{x:170,y:420},{x:335,y:420},.82);ticks(paused,5.1);P.down(paused,paused.enemy.x,370);ticks(paused,.3);P.cancel(paused);const count=paused.throws;P.release(paused,paused.enemy.x,370);assert.equal(paused.throws,count);
});

test('雪路三幕拖滑、抬指收步、按棚護信可完成；港口仍須停穩候訊',()=>{
 for(const index of [0,1,2]){const w=fresh('frost',index),road=x=>330+Math.sin(x/260+index*.5)*55;
  const go=(x,y)=>{P.down(w,700,480);assert.equal(w.pointerControl.kind,'snow');for(let n=0;n<2500&&w.status==='playing';n++){const yy=y??road(w.x),dx=x-w.x,dy=yy-w.y;if(Math.hypot(dx,dy)<25)break;P.drag(w,700+(Math.abs(dx)>10?Math.sign(dx)*60:0),480+(Math.abs(dy)>10?Math.sign(dy)*60:0));ticks(w,1/60);}P.release(w,700,480);ticks(w,.6);};
  for(const i of [0,1]){const s=w.shelters[i];go(s.x,s.y);const cam=Math.max(0,w.x-240);P.down(w,s.x-cam,s.y);ticks(w,1.6);P.release(w,s.x-cam,s.y);assert(w.rested.includes(i),'stationary shelter hold must precede sealing');}
  go(2135);if(index===2){assert.equal(w.status,'playing');while(w.signal!==1&&w.status==='playing')ticks(w,.02);tap(w,2140-Math.max(0,w.x-240)+50,350);}assert.equal(w.status,'won');assert(w.sealed);assert(w.letter>40);
 }
});

test('墨守把不同守具拖往城壁才消耗木材，放在水面不會隔空架設',()=>{
 const w=fresh('engineer');drag(w,{x:470,y:112},{x:800,y:350},.05);assert(w.tools.every(n=>n===-1));assert.equal(w.wood,14);
 for(let i=0;i<3;i++)drag(w,{x:470+i*190,y:112},{x:150,y:170+i*135},.05);assert.deepEqual(Array.from(w.tools),[0,1,2]);assert.equal(w.wood,8);
});

test('指標狀態可JSON保存且後續相同；18款新增控制都可安全繪製',()=>{
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 for(const mode of P.modes){const a=fresh(mode);P.down(a,500,300);P.drag(a,580,360);ticks(a,.2);const b=JSON.parse(JSON.stringify(a));for(let n=0;n<60;n++){L.step(a,{},1/60);L.step(b,{},1/60);}assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),mode);assert.doesNotThrow(()=>P.draw(ctx,a),mode);P.cancel(a);assert.equal(!!a.pointerControl?.down,false);}
});
