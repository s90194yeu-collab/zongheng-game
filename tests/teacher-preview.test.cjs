const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8');
function setup({teacher=true,query=false,flush,settle}={}){
 const persisted={local:new Map([['save',{formal:1}]]),session:new Map([['result:demo',{formal:2}]])},calls=[],events=[],writes=[];
 const ZH={boot:{page:'S_cq01_zhengzhuang',params:query?{teacherPreview:'1'}:{},user:{isTeacher:teacher}},user:{isTeacher:teacher},call:async(name,...args)=>{calls.push([name,...args]);return{ok:true};},save:async()=>{writes.push('save');return{ok:true};},load:async()=>({ok:true,state:{formal:true}}),deleteSave:async()=>{writes.push('delete');},clearDeviceSave:async()=>{writes.push('deviceDelete');},track:(...a)=>events.push(a),flush:async()=>({ok:true}),flushAll:flush||(async()=>({ok:true})),flushJournals:async()=>{},pendingCount:()=>events.length,finishScenario:async()=>writes.push('finish'),go:(...a)=>calls.push(['go',...a]),runs:{begin(){},record:async()=>writes.push('run'),ensure:async()=>writes.push('ensure'),choose:async()=>writes.push('choose'),restart:async()=>writes.push('restart')},codex:{unlock:()=>writes.push('codex'),grantFor:()=>writes.push('grant'),fresh:()=>[]},player:{initRun:async()=>writes.push('skillRun'),consume:async()=>writes.push('skill')},toast(){},esc:x=>String(x),ready(){}};
 for(const kind of ['local','session'])ZH[kind]={get:(k,f)=>persisted[kind].has(k)?persisted[kind].get(k):f,set:(k,v)=>persisted[kind].set(k,v),remove:k=>persisted[kind].delete(k)};
 const context={ZH,window:{ZH},document:{body:null},console,Date,setTimeout,clearTimeout,Map,Set,Promise,MutationObserver:function(){}};vm.createContext(context);for(const m of raw('Teacher_preview').matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],context);
 return{ZH,context,calls,events,writes,persisted,TP:ZH.teacherPreview};
}
test('學生或只有前端教師旗標不能開測試；教師正式流程仍寫入原存檔',async()=>{
 const student=setup({teacher:false,query:true});student.ZH.user.isTeacher=true;
 assert.equal(student.TP.active(),false);await assert.rejects(student.TP.enter(),/教師/);await student.ZH.save();assert.deepEqual(student.writes,['save']);
 const teacher=setup();assert.equal(teacher.TP.active(),false);await teacher.ZH.save();assert.deepEqual(teacher.writes,['save']);
});
test('進預覽前必須等正式儲存及排隊紀錄；儲存失敗維持正式模式',async()=>{
 const sequence=[];let release;const barrier=new Promise(r=>release=r),s=setup({flush:async()=>{sequence.push('flush');await barrier;sequence.push('flushed');return{ok:true};}});
 const enter=s.TP.enter({settle:async()=>{sequence.push('save');return{ok:true};}});await new Promise(r=>setImmediate(r));assert.equal(s.TP.active(),false);assert.deepEqual(sequence,['save','flush']);release();await enter;assert.equal(s.TP.active(),true);assert.deepEqual(sequence,['save','flush','flushed']);
 const bad=setup();await assert.rejects(bad.TP.enter({settle:async()=>({ok:false,msg:'離線'})}),/離線/);assert.equal(bad.TP.active(),false);
 const failedFlush=setup({flush:async()=>({ok:false})});await assert.rejects(failedFlush.TP.enter(),/送出/);assert.equal(failedFlush.TP.active(),false);
});
test('測試存檔、首答、小遊戲、收藏、技能及通關均與正式資料隔離，未知寫入API也阻擋',async()=>{
 const s=setup({query:true}),{ZH}=s;assert.equal(s.TP.active(),true);
 assert.equal((await ZH.load()).state,null);assert.equal(ZH.local.get('save',null),null);assert.equal(ZH.session.get('result:demo',null),null);
 ZH.local.set('save',{preview:1});ZH.session.set('result:demo',{preview:2});ZH.local.remove('save');
 await ZH.save();await ZH.deleteSave();await ZH.clearDeviceSave();ZH.track('anchor',{first:true});ZH.track('minigame',{score:10});ZH.codex.unlock('person','x');await ZH.runs.record({});await ZH.runs.restart('demo');await ZH.finishScenario({});await ZH.player.initRun({},'story','demo');await ZH.player.consume({},'x','y');await ZH.call('api_futureWrite',{score:100});await ZH.flushAll();
 assert.deepEqual(s.writes,[]);assert.deepEqual(s.events,[]);assert.deepEqual(s.calls,[]);assert.deepEqual(s.persisted.local.get('save'),{formal:1});assert.deepEqual(s.persisted.session.get('result:demo'),{formal:2});
 await ZH.call('api_getStoryAnchors','demo',['a']);assert.equal(s.calls[0][0],'api_getStoryAnchors');
 s.TP.exit();assert.equal(s.calls[1][0],'go');assert.equal(s.calls[1][1],'S_cq01_zhengzhuang');assert(!Object.hasOwn(s.calls[1][2],'teacherPreview'));
});
test('既有章節Journal在預覽僅存記憶體，不開本機資料庫或遠端紀錄',async()=>{
 const s=setup({query:true});let storage=0,remote=0;
 s.context.window.localStorage={setItem(){storage++;},getItem(){storage++;},removeItem(){storage++;}};s.context.window.ZHGameLibs={Dexie:function(){storage++;throw Error('不得開啟正式Journal');}};
 const source=raw('Eng_Story'),a=source.indexOf('function createJournal('),b=source.indexOf('  ZH.story =',a);vm.runInContext(source.slice(a,b),s.context);const journal=s.context.createJournal({id:'demo',mode:'history',scope:'teacher',remote:async()=>{remote++;return{ok:true};}});
 assert.equal(await journal.load({formal:true}),null);await journal.enqueue({v:1,node:'n_23'},true);assert.equal((await journal.load(null)).node,'n_23');await journal.flush();await journal.clear();assert.equal(await journal.load({formal:true}),null);assert.equal(storage,0);assert.equal(remote,0);
});
test('跳讀回報只建立未評分示範值，保留所有原錨點與遊戲紀錄為空',()=>{
 const {TP}=setup({query:true}),state={vars:{choices:{stance:'chosen'}},anchors:[],games:[],progress:{}};
 TP.prepareState(state,{report:"ctx.state.vars.wait.firstScore; challenge(ctx,'zz_tunnel','tunnel','闕地及泉');"});
 assert.equal(state.vars.wait.score,0);assert.equal(state.vars.wait.completed,false);assert.equal(state.vars.tunnel.completed,false);assert.equal(state.vars.choices.stance,'chosen');assert.deepEqual(state.anchors,[]);assert.deepEqual(state.games,[]);assert.deepEqual(state.progress,{});
});
function nodeObjects(){const found=[];for(const file of fs.readdirSync(path.join(root,'src/legacy')).filter(n=>/^S_(cq|zg|ch)\d{2}_/.test(n)&&n.endsWith('.html')&&!n.includes('_sample'))){let nodes=null;for(const [,source]of raw(file.slice(0,-5)).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(source.includes('<?'))continue;const ast=acorn.parse(source,{ecmaVersion:'latest'});function visit(n){if(!n||typeof n!=='object')return;if(n.type==='VariableDeclarator'&&n.id.name==='NODES'&&n.init?.type==='ObjectExpression')nodes=Object.fromEntries(n.init.properties.map(p=>[p.key.name||p.key.value,source.slice(p.value.start,p.value.end)]));for(const value of Object.values(n)){if(Array.isArray(value))value.forEach(visit);else if(typeof value==='object')visit(value);}}visit(ast);}if(nodes)found.push({file,nodes});}return found;}
test('歷史39話完整列出原節點與可直接試玩的小遊戲，秦晉圍鄭另含事件及夜縋入口',()=>{
 const {TP}=setup(),chapters=nodeObjects();assert.equal(chapters.length,39);let nodes=0,games=0;
 for(const c of chapters){const entries=TP.historyItems(c.nodes);assert.equal(new Set(entries.map(e=>e.nodeId)).size,Object.keys(c.nodes).length,c.file);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length,c.file);nodes+=entries.length;games+=entries.filter(e=>e.game).length;for(const e of entries)assert(e.label&&!/[<>]/.test(e.label),c.file+' '+e.id);}
 assert(nodes>950);assert.equal(games,109,'直接試玩索引應涵蓋原有靜態挑戰');
 const zheng=TP.historyItems(chapters.find(c=>c.file==='S_cq01_zhengzhuang.html').nodes);assert(zheng.some(e=>e.game?.id==='zz_tunnel'));
 const wu=TP.historyItems(chapters.find(c=>c.file==='S_cq14_wushi.html').nodes);assert(wu.some(e=>e.game?.id==='ws_zhaoguan'&&e.game.stealth));
 const slg=raw('Eng_SLG');assert(slg.includes('C.events.map'));assert(slg.includes('C.commands.flatMap'));const wz=raw('S_cq08_weizheng');assert(wz.includes("game:{id:STL_GAME,title:'夜縋潛行'}"));assert(wz.includes('run:a2Sneak'));
 const xy=raw('S_ch06_xingyang');for(const n of ['1','2','3'])assert(xy.includes("id:'xy_deck_"+n+"'"));assert(xy.includes('previewPrepare(state)'));assert(slg.includes("launchParams:{previewRole:C.player==='zheng'?''"));
});
