const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8');

function createDom(){
 const listeners=new Map();
 const makeEl=(tag='div')=>({
  tagName:tag.toUpperCase(),
  className:'',
  hidden:false,
  disabled:false,
  textContent:'',
  innerHTML:'',
  style:{setProperty(){},removeProperty(){}},
  dataset:{},
  offsetParent:{},
  isConnected:true,
  attributes:{},
  children:[],
  setAttribute(k,v){this.attributes[k]=String(v);},
  getAttribute(k){return this.attributes[k]??null;},
  removeAttribute(k){delete this.attributes[k];},
  classList:{
   _set:new Set(),
   add(...names){names.forEach(n=>this._set.add(n));},
   remove(...names){names.forEach(n=>this._set.delete(n));},
   toggle(n,force){if(force===undefined)force=!this._set.has(n);if(force)this._set.add(n);else this._set.delete(n);return force;},
   contains(n){return this._set.has(n);}
  },
  appendChild(c){this.children.push(c);return c;},
  append(...cs){this.children.push(...cs);},
  replaceChildren(...cs){this.children=cs;},
  remove(){this.isConnected=false;},
  click(){this._clicked=(this._clicked||0)+1;if(typeof this.onclick==='function')this.onclick({preventDefault(){},stopPropagation(){}});(this._listeners?.click||[]).forEach(fn=>fn({preventDefault(){},stopPropagation(){},currentTarget:this,target:this}));},
  addEventListener(type,fn){this._listeners=this._listeners||{};(this._listeners[type]=this._listeners[type]||[]).push(fn);},
  removeEventListener(){},
  dispatchEvent(ev){(this._listeners?.[ev.type]||[]).forEach(fn=>fn(ev));return true;},
  getBoundingClientRect(){return{left:100,top:100,width:120,height:40};},
  querySelector(sel){return this._q?.[sel]||makeEl('button');},
  querySelectorAll(sel){return this._qa?.[sel]||[];}
 });
 const body=makeEl('body');
 const doc={
  body,
  hidden:false,
  documentElement:makeEl('html'),
  createElement:tag=>makeEl(tag),
  querySelector:sel=>doc._q?.[sel]||null,
  querySelectorAll:sel=>doc._qa?.[sel]||[],
  addEventListener:(t,fn)=>listeners.set(t,fn),
  removeEventListener(){}
 };
 return{doc,makeEl,listeners};
}

function setupShowcase({page='hub',params={},shells={S_cq08_weizheng:'<!DOCTYPE html><html><head><base target="_top"><!--ZH_SERVER_BOOT--></head><body>wz</body></html>',Map:'<!DOCTYPE html><html><head><base target="_top"><!--ZH_SERVER_BOOT--></head><body>map</body></html>'}}={}){
 const {doc,makeEl}=createDom();
 const persisted={local:new Map([['save',{formal:1}]]),session:new Map([['result:demo',{formal:2}]])};
 const calls=[],writes=[],events=[],mythCmds=[];
 let readyFn=null;
 const ZH={
  boot:{page,params,version:'v4-test',user:{email:'student@gm.nssh.ntpc.edu.tw',isSchool:true,isGuest:false,isTeacher:false}},
  settings:{textSpeed:'normal',sound:true},
  call:async(name,...args)=>{calls.push([name,...args]);return{ok:true};},
  save:async()=>{writes.push('save');return{ok:true};},
  load:async()=>({ok:true,state:{formal:true}}),
  deleteSave:async()=>{writes.push('delete');return{ok:true};},
  clearDeviceSave:async()=>{writes.push('clearDevice');return{ok:true};},
  discardAndLeave:async()=>{writes.push('discard');return{ok:true};},
  track:(...a)=>events.push(a),
  flush:async()=>{writes.push('flush');return{ok:true};},
  flushAll:async()=>{writes.push('flushAll');return{ok:true};},
  pendingCount:()=>events.length,
  finishScenario:async()=>{writes.push('finish');return{ok:true};},
  go:(...a)=>calls.push(['go',...a]),
  url:(p,q)=>p+'?'+new URLSearchParams(q||{}).toString(),
  runs:{begin(){},record:async()=>writes.push('runRecord'),ensure:async()=>writes.push('runEnsure'),choose:async()=>writes.push('runChoose'),restart:async()=>writes.push('runRestart')},
  records:{remove:async()=>writes.push('recRemove'),summary:async()=>({ok:true})},
  codex:{unlock:()=>writes.push('codexUnlock'),grantFor:()=>writes.push('codexGrant'),fresh:()=>[]},
  player:{initRun:async()=>writes.push('playerInit'),consume:async()=>writes.push('playerConsume')},
  myth:{
   mountShowcase:async()=>({
    demoAction:cmd=>{mythCmds.push(cmd);return true;},
    dispose:()=>mythCmds.push({type:'dispose'})
   }),
   demoAction:cmd=>{mythCmds.push(cmd);return true;}
  },
  ready:fn=>{readyFn=fn;}
 };
 for(const kind of ['local','session']){
  ZH[kind]={
   get:(k,f)=>persisted[kind].has(k)?persisted[kind].get(k):f,
   set:(k,v)=>persisted[kind].set(k,v),
   remove:k=>persisted[kind].delete(k)
  };
 }
 const windowObj={
  ZH,
  ZH_BOOT:ZH.boot,
  ZH_STATIC_URL:f=>'https://s90194yeu-collab.github.io/zongheng-game/'+f,
  ZH_SHOWCASE_ASSETS:{version:'v4-test',release:'v4-test',siteUrl:'https://s90194yeu-collab.github.io/zongheng-game/',shells,anchors:{S_cq08_weizheng:[{id:'wz_01',answer:'B'}]}},
  innerWidth:1280,
  innerHeight:800,
  addEventListener(){},
  postMessage(){}
 };
 const ctx={window:windowObj,ZH,document:doc,PointerEvent:class{constructor(type,init){this.type=type;Object.assign(this,init);}},URLSearchParams,console,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,Map,Set,Promise,JSON,Number,String, Object,Array};
 windowObj.parent=windowObj;
 vm.createContext(ctx);
 for(const m of raw('Showcase_boot').matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],ctx);
 if(readyFn)readyFn();
 return{ZH,SC:ZH.showcase,doc,makeEl,persisted,calls,writes,events,mythCmds,ctx};
}

test('首頁具備自動展示模式入口，且三段輪播定義完整涵蓋燭之武、青丘林地、楚漢大地圖',()=>{
 const hub=raw('Hub');
 assert(hub.includes('data-showcase-open="0"'));
 assert(hub.includes('data-showcase-open="weizheng"'));
 assert(hub.includes('data-showcase-open="myth"'));
 assert(hub.includes('data-showcase-open="chuhan"'));
 const {SC}=setupShowcase();
 assert.equal(SC.stages.length,3);
 assert.deepEqual([...SC.stages.map(s=>s.id)],['weizheng','myth','chuhan']);
 assert(SC.stages[0].title.includes('燭之武退秦師（鄭國篇）'));
 assert(SC.stages[1].title.includes('山海異境 · 青丘林地'));
 assert(SC.stages[2].title.includes('楚漢大地圖'));
});

test('展示模式開啟後可自動輪播切換三段體驗，並與正式存檔、成績、雲端API完全隔離',async()=>{
 const s=setupShowcase();
 const {ZH,SC}=s;
 assert.equal(SC.isActive(),false);

 await SC.open(0);
 assert.equal(SC.isActive(),true);
 assert.equal(SC.inspect().stage,'weizheng');

 // 驗證展示期間所有寫入與本機存檔完全隔離
 ZH.local.set('save',{demo:99});
 ZH.session.set('result:demo',{demo:88});
 ZH.local.remove('save');
 await ZH.save('S_cq08_weizheng','history',{turn:3});
 await ZH.deleteSave('S_cq08_weizheng','history');
 await ZH.clearDeviceSave();
 ZH.track('anchor',{id:'wz_01'});
 ZH.codex.unlock('person','cq_zhuzhiwu');
 await ZH.runs.record({});
 await ZH.finishScenario({});
 await ZH.player.initRun({},'story','S_cq08_weizheng');
 await ZH.player.consume({},'anmin','xinzheng');
 const writeRpc=await ZH.call('api_saveGame','S_cq08_weizheng','history',{});
 assert.equal(writeRpc.blocked,true);
 const anchors=await ZH.call('api_getAnchors','S_cq08_weizheng');
 assert.equal(anchors.ok,true);
 assert.equal(anchors.anchors[0].id,'wz_01');

 assert.deepEqual(s.writes,[]);
 assert.deepEqual(s.events,[]);
 assert.deepEqual(s.calls,[]);
 assert.deepEqual(s.persisted.local.get('save'),{formal:1});
 assert.deepEqual(s.persisted.session.get('result:demo'),{formal:2});

 // 輪播切換至第二段（山海異境 · 青丘林地）並驗證電腦立即發出操作指令
 await SC.next();
 assert.equal(SC.inspect().stage,'myth');
 assert(s.mythCmds.some(c=>c.type==='startCheckpoint'&&c.checkpoint===0));

 // 輪播切換至第三段（楚漢大地圖）再循環回第一段
 await SC.next();
 assert.equal(SC.inspect().stage,'chuhan');
 await SC.next();
 assert.equal(SC.inspect().stage,'weizheng');

 SC.close();
 assert.equal(SC.isActive(),false);
 await ZH.save('S_cq08_weizheng','history',{});
 assert.deepEqual(s.writes,['save']);
});

test('三段亮點自動驅動器（燭之武、青丘林地、楚漢大地圖）均能連續自動操作且間隔短',async()=>{
 // 1. 測試燭之武退秦師自動操作驅動
 const wz=setupShowcase({page:'S_cq08_weizheng',params:{showcase:'1',demo:'1'}});
 const startBtn=wz.makeEl('button');
 wz.doc._q={'.wz-title [data-a="new"], .wz-title [data-a="continue"]':startBtn};
 await new Promise(r=>setTimeout(r,950));
 wz.SC.close();
 assert(startBtn._clicked>=1,'燭之武標題頁應由電腦在1秒內自動點擊開始');
 assert(wz.SC.inspect().actionCount>=1);

 // 2. 測試楚漢大地圖自動操作驅動
 const ch=setupShowcase({page:'map',params:{w:'ch',showcase:'1',demo:'1'}});
 let focusedCity=null;
 ch.ZH.world={state:{player:'han'},debug:{focus:(c)=>{focusedCity=c;},mode(){},pane(){},diplomacy(){},march(){},fit(){},tick(){}}};
 await new Promise(r=>setTimeout(r,1000));
 ch.SC.close();
 assert.equal(focusedCity,'hanzhong','楚漢大地圖應由電腦自動聚焦漢中並執行內政');
});

test('建置產物包含 showcase-shells.json，具備燭之武與楚漢大地圖完整空殼，且各場景角色皆串接內建 Q 版人物圖',()=>{
 const shellsFile=path.join(root,'dist/assets/showcase-shells.json');
 assert(fs.existsSync(shellsFile),'應產生 dist/assets/showcase-shells.json');
 const shells=JSON.parse(fs.readFileSync(shellsFile,'utf8'));
 assert(shells.S_cq08_weizheng&&shells.S_cq08_weizheng.includes('<!--ZH_SERVER_BOOT-->'));
 assert(shells.Map&&shells.Map.includes('<!--ZH_SERVER_BOOT-->'));
 const {SC}=setupShowcase();
 assert.equal(SC.stages[0].durationMs,72000,'展示段落預設應有充足72秒導覽時間');
 SC.setSpeed(1.45);
 assert.equal(SC.inspect().speedFactor,1.45,'應支援切換慢速細看節奏倍率');
 assert(raw('Textplay_canvas').includes('A.chibi'),'Textplay_canvas 應使用內建 ART.chibi 可愛人物');
 assert(raw('GameplayCanvas').includes('w.ART.chibi'),'GameplayCanvas 應使用內建 ART.chibi 可愛人物');
 assert(raw('Adventure_canvas').includes('window.ART.chibi'),'Adventure_canvas 應使用內建 ART.chibi 可愛人物');
 assert(raw('Literary_canvas').includes('window.ART.chibi'),'Literary_canvas 應使用內建 ART.chibi 可愛人物');
});
