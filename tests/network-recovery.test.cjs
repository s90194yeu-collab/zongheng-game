const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8'),script=n=>raw(n).replace(/<\/?script>/g,'');
function rpc(respond){
 const calls=[],delays=[],events=[],timers=new Map();let next=0;
 const google={script:{get run(){const handlers={};return new Proxy({withSuccessHandler(fn){handlers.success=fn;return this;},withFailureHandler(fn){handlers.failure=fn;return this;}},{get(target,key){if(key in target)return target[key];return(...args)=>{const call={fn:key,args,...handlers};calls.push(call);respond(call,calls.length);};}});}}};
 const ZH={sleep:async ms=>{delays.push(ms);}},document={dispatchEvent:e=>events.push(e)},global={google,CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail;}}};
 const ctx={ZH,global,google,document,Set,Error,Promise,setTimeout:(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};vm.createContext(ctx);
 const s=raw('Core_js');vm.runInContext(s.slice(s.indexOf('  const RETRY_READS'),s.indexOf('// ───────────────────────── 頁面切換')),ctx);
 return{...ctx,calls,delays,events,timers};
}
test('HTTP 0只重試允許的唯讀請求，沿用同一關與參數，成功才交回原存檔',async()=>{
 const original={schema:'zhuzi-v1',stage:0,answers:{first:{correct:false}},games:[{gameId:'old',firstScore:0,bestScore:8}]};
 const h=rpc((c,n)=>n<3?c.failure({message:'NetworkError: 連線失敗。原因： HTTP 0'}):c.success({ok:true,state:original}));
 const r=await h.ZH.call('api_loadGame','S_al19_taohua','history');assert.equal(r.state,original);assert.equal(h.calls.length,3);assert.deepEqual(h.delays,[700,1800]);assert(h.calls.every(c=>c.fn==='api_loadGame'&&c.args[0]==='S_al19_taohua'&&c.args[1]==='history'));assert.equal(h.events.length,2);assert.equal(h.timers.size,0);assert.equal(original.answers.first.correct,false);
});
test('永久斷線在三次內終止，保留錯誤步驟且不偽造空白成功資料',async()=>{
 const h=rpc(c=>c.failure(new Error('NetworkError: HTTP 0')));await assert.rejects(h.ZH.call('api_getStoryAnchors','S_al19_taohua',['a']),e=>e.operation==='api_getStoryAnchors'&&h.ZH.isConnectionError(e));assert.equal(h.calls.length,3);assert.equal(h.timers.size,0);
});
test('存檔、首答、通關、技能與未知寫入遇HTTP 0均只呼叫一次，不自動重送',async()=>{
 for(const fn of ['api_saveGame','api_logBatch','api_recordPlaythrough','api_usePlayerSkill','api_futureWrite']){const h=rpc(c=>c.failure({message:'NetworkError: HTTP 0'}));await assert.rejects(h.ZH.call(fn,{key:'same'}),/HTTP 0/);assert.equal(h.calls.length,1,fn);assert.equal(h.delays.length,0);}
});
test('權限、停用與格式錯誤沿用原結果，不被重試掩蓋或轉成成功',async()=>{
 const denied=rpc(c=>c.failure({message:'沒有權限讀取此資料'}));await assert.rejects(denied.ZH.call('api_loadGame'),/沒有權限/);assert.equal(denied.calls.length,1);
 const disabled=rpc(c=>c.success({ok:false,msg:'題目停用'}));assert.equal((await disabled.ZH.call('api_getStoryAnchors')).ok,false);assert.equal(disabled.calls.length,1);
});
test('逾時不自動延長至90秒，晚到的回應不能覆蓋下一次讀取；同步例外會清掉計時器',async()=>{
 const h=rpc(()=>{}),p=h.ZH.call('api_loadGame');const timeout=[...h.timers.values()][0];timeout.fn();await assert.rejects(p,e=>e.code==='RPC_TIMEOUT'&&e.operation==='api_loadGame');assert.equal(h.calls.length,1);h.calls[0].success({ok:true,state:{late:true}});assert.equal(h.delays.length,0);
 const bad=rpc(()=>{throw Error('參數無法傳送');});await assert.rejects(bad.ZH.call('api_getStoryAnchors'),/參數無法傳送/);assert.equal(bad.calls.length,1);assert.equal(bad.timers.size,0);
});
function functionSource(source,name){const tree=acorn.parse(source,{ecmaVersion:'latest'});let found;function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id?.name===name)found=n;for(const x of Object.values(n))if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object')visit(x);}visit(tree);assert(found,name);return source.slice(found.start,found.end);}
function startup({load,questions}={}){
 const html=[],buttons={reload:{disabled:false},home:{}},status={},rootNode={set innerHTML(v){html.push(v);},get innerHTML(){return html.at(-1);},querySelector:s=>s.includes('reload')?buttons.reload:s.includes('home')?buttons.home:status},writes=[],rendered=[];
 const saved={schema:'zhuzi-v1',chapterId:'S_al19_taohua',stage:0,phase:'intro',answers:{old:{correct:false}},games:[]};
 const ZH={A_SELECTIONS:{chapters:{S_al19_taohua:{id:'S_al19_taohua',stages:[{title:'一幕'}]}}},boot:{params:{page:'obsolete',mode:'history',teacherPreview:'1',seed:'kept'}},requireStudentProfile:async()=>true,load:load||(async()=>({ok:true,state:saved})),call:questions||(async()=>({ok:true,anchors:[{id:'a',answer:'A'}]})),isConnectionError:e=>/HTTP 0/.test(e.message),url:(page,p)=>'https://script.google.com/macros/s/demo/exec?'+new URLSearchParams({...p,page}).toString(),go(){},runs:{begin(){}},player:{load:async()=>{}},save:()=>writes.push('save')};
 const ctx={ZH,document:{body:{classList:{add(){}}},getElementById:()=>rootNode},root:null,s:null,c:null,bank:null,chapterLoading:false,bootOptions:null,disposed:false,paused:false,busy:false,saveError:'',teacherPanelOpen:false,saving:Promise.resolve(),M:{fresh:id=>({schema:'zhuzi-v1',chapterId:id,answers:{},games:[]})},L:{restore(){},cancel(){}},stop(){},testing:()=>false,loadArt:async()=>{},render(){rendered.push(ctx.s);},note(){},esc:x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),button:(t,a)=>'<button data-action="'+a+'">'+t+'</button>',Promise,Date,URLSearchParams};vm.createContext(ctx);vm.runInContext(functionSource(script('Zhuzi_js'),'start'),ctx);
 return{ctx,ZH,html,buttons,writes,rendered,saved,options:{id:'S_al19_taohua',collection:'aSelections',anchorOrder:['a']}};
}
test('返回正式桃花村時任一讀取失敗都不新建或保存空白局，原地重試可讀回原首答',async()=>{
 let fail=true;const h=startup({questions:async()=>{if(fail){const e=Error('NetworkError: HTTP 0');e.operation='api_getStoryAnchors';throw e;}return{ok:true,anchors:[{id:'a',answer:'A'}]};}});
 await h.ctx.start(h.options);assert.equal(h.rendered.length,0);assert.equal(h.writes.length,0);assert(h.html.at(-1).includes('讀取原文題庫'));assert(h.html.at(-1).includes('target="_top"'));assert(h.html.at(-1).includes('page=S_al19_taohua'));assert(!h.html.at(-1).includes('page=obsolete'));assert(h.html.at(-1).includes('teacherPreview=1'));assert.equal(h.ctx.chapterLoading,false);
 fail=false;await h.buttons.reload.onclick();await new Promise(r=>setImmediate(r));assert.equal(h.rendered.length,1);assert.equal(h.ctx.s.answers.old.correct,false);assert.equal(h.writes.length,0);
});
test('重讀期間重複點擊只啟動一輪；題庫停用仍顯示原錯誤而不放行',async()=>{
 let resolve,loads=0;const waiting=new Promise(r=>resolve=r),h=startup({load:async()=>{loads++;return waiting;}});const p=h.ctx.start(h.options);await new Promise(r=>setImmediate(r));await h.ctx.start(h.options);assert.equal(loads,1);resolve({ok:true,state:h.saved});await p;assert.equal(h.ctx.chapterLoading,false);
 const off=startup({questions:async()=>({ok:false,msg:'題庫停用'})});await off.ctx.start(off.options);assert(off.html.at(-1).includes('題庫停用'));assert(!off.html.at(-1).includes('data-reconnect'));assert.equal(off.rendered.length,0);
});
