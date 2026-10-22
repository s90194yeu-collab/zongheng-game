const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const load=()=>Promise.all([import(pathToFileURL(path.join(root,'src/character/app.js')).href),import(pathToFileURL(path.join(root,'src/character/chapter-session.js')).href)]);
function environment(){
 class Element{
  constructor(){this.children=[];this.classList={add(){},remove(){},toggle(){}};this.isConnected=true;this.dataset={};this.nodes=new Map();}
  setAttribute(){} addEventListener(){} getClientRects(){return [1];} focus(){this.focused=true;}
  appendChild(el){this.children.push(el);return el;} remove(){this.isConnected=false;}
  querySelector(sel){if(!this.nodes.has(sel))this.nodes.set(sel,new Element());return this.nodes.get(sel);}
  querySelectorAll(){return [];}
 }
 const previous={document:global.document,cancelAnimationFrame:global.cancelAnimationFrame};
 global.document={activeElement:new Element(),body:new Element(),createElement:()=>new Element(),addEventListener(){}};global.cancelAnimationFrame=()=>{};
 const calls=[],saved=new Map([['original-character:run:S_cq08_weizheng',{untouched:true}]]);
 const ZH={esc:x=>String(x),isGuest:()=>false,boot:{guestScenarios:['S_cq08_weizheng']},session:{get:(k,f)=>saved.get(k)||f,set:(k,v)=>saved.set(k,v)},player:{load:async()=>{throw Error('模擬連線失敗');}},call:async name=>{calls.push(name);throw Error('不應寫入');}};
 return {ZH,calls,saved,restore(){global.document=previous.document;global.cancelAnimationFrame=previous.cancelAnimationFrame;}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
test('章內開啟失敗仍能離開，原劇本等待的Promise必定結束，舊存檔不清除',async()=>{
 const e=environment();try{const [{install}]=await load(),app=await install({ZH:e.ZH}),pending=app.playChapter('S_cq08_weizheng',{returnLabel:'回到城下'});await flush();await app.close();const result=await pending;assert.equal(result.status,'left');assert.equal(result.completed,false);assert.equal(result.id,'S_cq08_weizheng');assert.deepEqual(e.saved.get('original-character:run:S_cq08_weizheng'),{untouched:true});assert.deepEqual(e.calls,[]);}finally{e.restore();}
});
test('同章重複入口等待同一次離開，其他篇與獨立設定忙碌時立即回覆',async()=>{
 const e=environment();try{const [{install}]=await load(),app=await install({ZH:e.ZH}),a=app.playChapter('S_cq08_weizheng'),b=app.playChapter('S_cq08_weizheng');await flush();const other=await app.playChapter('S_cq16_datong');assert.equal(other.status,'failed');await app.close();assert.deepEqual(await a,await b);await app.open();const busy=await app.playChapter('S_cq08_weizheng');assert.equal(busy.status,'failed');await app.close();}finally{e.restore();}
});
test('訪客章節權限在開啟前檢查，未知篇章不建立角色冒險',async()=>{
 const e=environment();try{e.ZH.isGuest=()=>true;const [{install}]=await load(),app=await install({ZH:e.ZH});assert.equal((await app.playChapter('S_cq16_datong')).status,'failed');assert.equal((await app.playChapter('not-a-pilot')).status,'failed');assert.deepEqual(e.calls,[]);}finally{e.restore();}
});
test('完成閘門只回報一次，未完成與保存失敗不能被誤當章內通關',async()=>{
 const [,{createChapterSession}]=await load(),session=createChapterSession(),a=session.begin('chapter',{checkpoint:'one'});assert.equal(session.begin('chapter'),a);assert.throws(()=>session.begin('different'));assert(session.finish({completed:false,unsaved:true}));assert(!session.finish({completed:true}));const first=await a;assert.equal(first.status,'left');assert.equal(first.completed,false);assert(first.unsaved);const b=session.begin('chapter');session.finish({completed:true,score:99});assert.deepEqual(await b,{id:'chapter',status:'completed',completed:true,left:false,score:99});
});
test('開窗後切換教師測試或本人帳號，關閉只回報離開且不發出保存',async()=>{
 for(const change of ['preview','account']){const e=environment();try{let mode=false;e.ZH.teacherPreview={active:()=>mode};e.ZH.user={email:'teacher@school.test'};const [{install}]=await load(),app=await install({ZH:e.ZH}),pending=app.playChapter('S_cq08_weizheng');await flush();if(change==='preview')mode=true;else e.ZH.user.email='other@school.test';await app.close();const result=await pending;assert.equal(result.completed,false);assert.equal(result.status,'left');assert.equal(result.modeChanged,true);assert.deepEqual(e.calls,[]);assert.deepEqual(e.saved.get('original-character:run:S_cq08_weizheng'),{untouched:true});}finally{e.restore();}}
});
test('關閉後舊讀取延遲回來，不會替新開的測試視窗讀寫正式資料',async()=>{
 const e=environment();try{let firstResolve,n=0,mode=false;e.ZH.teacherPreview={active:()=>mode};e.ZH.player.load=()=>++n===1?new Promise(resolve=>firstResolve=resolve):Promise.reject(Error('新視窗測試中'));const [{install}]=await load(),app=await install({ZH:e.ZH}),old=app.playChapter('S_cq08_weizheng');await flush();await app.close();mode=true;const current=app.playChapter('S_cq08_weizheng');await flush();firstResolve();await flush();assert.equal((await old).status,'left');assert.deepEqual(e.calls,[]);await app.close();assert.equal((await current).status,'left');assert.deepEqual(e.saved.get('original-character:run:S_cq08_weizheng'),{untouched:true});}finally{e.restore();}
});
