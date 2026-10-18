const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),raw=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const script=name=>[...raw('src/legacy/'+name+'.html').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
function nodes(source,predicate){const out=[];function visit(n){if(!n||typeof n!=='object')return;if(predicate(n))out.push(n);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(typeof v==='object')visit(v);}visit(acorn.parse(source,{ecmaVersion:'latest'}));return out;}
function fn(source,name){const n=nodes(source,n=>n.type==='FunctionDeclaration'&&n.id?.name===name)[0];assert(n,'找不到 '+name);return source.slice(n.start,n.end);}
function assigned(source,owner,name){const n=nodes(source,n=>n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.object.name===owner&&n.left.property.name===name)[0];assert(n,'找不到 '+owner+'.'+name);return source.slice(n.right.start,n.right.end);}
function context({teacher=true,params={},save}={}){
 const writes=[],events=[],navigation=[],steps=[],store={formal:{progress:'keep'}};
 const ZH={boot:{page:'S_al18_shihao',params,user:{isTeacher:teacher}},user:{isTeacher:teacher},esc:x=>String(x??''),ready(){},isGuest:()=>false,
  save:async(id,mode,state)=>{steps.push('formal-save');if(save)return save(id,mode,state);writes.push(JSON.parse(JSON.stringify(state)));return{ok:true};},load:async()=>({ok:true,state:store.formal}),deleteSave:async()=>writes.push('delete'),clearDeviceSave:async()=>writes.push('device-delete'),
  call:async()=>({ok:true}),track:(...args)=>events.push(args),flush:async()=>({ok:true}),flushAll:async()=>{steps.push('flush');return{ok:true};},flushJournals:async()=>{},pendingCount:()=>0,finishScenario:async()=>writes.push('finish'),go:(...args)=>navigation.push(args),toast(){},sfx(){},
  runs:{begin(){},record:async()=>writes.push('run')},codex:{unlock:()=>writes.push('codex'),grantFor:()=>[],fresh:()=>[]},player:{initRun:async()=>{},consume:async()=>{}},local:{get:(k,f)=>f,set(){},remove(){}},session:{get:(k,f)=>f,set(){},remove(){}}};
 const document={body:null,hidden:false,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}};
 const ctx={ZH,window:{ZH},document,Date,Promise,Set,Map,console,setTimeout,clearTimeout,cancelAnimationFrame(){},performance:{now:()=>1},URL,CustomEvent:function(){},memoryStore:{},global:{},accessPromise:null};vm.createContext(ctx);
 return{ctx,ZH,writes,events,navigation,steps,store,loadPreview(){vm.runInContext(script('Teacher_preview'),ctx);}};
}
test('紀錄管理與收藏重設不能穿過隔離直接刪除裝置的正式資料',async()=>{
 const h=context({params:{teacherPreview:'1'}}),core=script('Core_js'),{ctx,ZH}=h;let deletes=0;
 const disk=new Map([['zh:save:demo:history',{formal:true}],['zh:result:demo',{formal:true}],['zh:codex',['original']]]);
 const storage={get length(){return disk.size;},key:i=>[...disk.keys()][i],removeItem:k=>{deletes++;disk.delete(k);}};
 Object.assign(ctx.global,{localStorage:storage,sessionStorage:storage});ctx.guestSaveKey=(id,mode)=>'save:'+id+':'+mode;
 ZH.modal=async()=>true;vm.runInContext(fn(core,'clearRecordLocal'),ctx);vm.runInContext('ZH.records='+assigned(core,'ZH','records')+';ZH.access='+assigned(core,'ZH','access')+';',ctx);ZH.access.apply=r=>r;
 h.loadPreview();await ZH.records.remove('all');await ZH.access.set('reset');
 assert.equal(deletes,0);assert.equal(disk.size,3);assert.deepEqual(disk.get('zh:result:demo'),{formal:true});
 const summary=await ZH.records.summary();assert.equal(summary.saves.length,0);assert.equal(summary.chapters.length,0);assert.deepEqual(h.writes,[]);
});
test('保存失敗後教師按鈕恢復可點，不依賴await後已清空的event.currentTarget',async()=>{
 const h=context();h.loadPreview();let resolve;const pending=new Promise(r=>resolve=r),button={disabled:false,isConnected:true,addEventListener(type,handler){this.handler=handler;}};
 const element=()=>({isConnected:true,setAttribute(){},remove(){this.isConnected=false;},querySelector:selector=>selector==='[data-tp="launch"]'?button:null});
 h.ctx.document.body={appendChild(){}};h.ctx.document.createElement=element;
 h.ZH.teacherPreview.mountLauncher({settle:()=>pending});let target=button;
 const job=button.handler({get currentTarget(){return target;}});target=null;assert.equal(button.disabled,true);resolve({ok:false,msg:'離線'});await job;
 assert.equal(button.disabled,false);assert.equal(h.ZH.teacherPreview.active(),false);
});
function zhuziHarness(options){
 const h=context(options);h.loadPreview();const {ctx,ZH}=h;vm.runInContext(script('Zhuzi_models'),ctx);
 const chapter={id:'S_al18_shihao',name:'石壕吏',person:'杜甫',collection:'經典著作',school:'唐',period:'唐',stages:[0,1].map(i=>({title:'第'+i+'幕',passage:'原文',gloss:'解析',url:'https://example.test/',source:'原典',questionIds:['q'+i],gameId:'game'+i,mission:{title:'挑戰',mode:'test'}}))};
 Object.assign(ctx,{M:ZH.zhuziModel,L:{cancel(){},create:()=>({engine:3,time:1,status:'playing',assist:false}),score:()=>7},A:{},c:chapter,s:ZH.zhuziModel.fresh(chapter.id),bank:{q0:{id:'q0',stem:'題目',passage:'原文',answer:'A',options:[{key:'A',text:'正確'},{key:'B',text:'錯誤'}]}},root:{querySelector:()=>null},saving:Promise.resolve(),paused:false,busy:false,disposed:false,teacherPanelOpen:false,lastClock:Date.now(),lastFrame:0,raf:0,input:{},saveError:'',handlers:{},renderCalls:0,note(){},stop(){},render(){ctx.renderCalls++;},showTeacherPanel(){},stage(){return ctx.c.stages[ctx.s.stage];},testing:()=>ZH.teacherPreview.active(),teacher:()=>ZH.teacherPreview.isTeacher(),esc:ZH.esc,button:(text,action)=>'<button data-action="'+action+'">'+text+'</button>',bind:(name,handler)=>ctx.handlers[name]=handler,sceneHTML:()=>'',level:()=> '進階',view:{innerHTML:'',querySelectorAll:()=>[]}});
 ZH.literary=ctx.L;const source=script('Zhuzi_js');for(const name of ['tickClock','checkpoint','jumpForTeacher','currentTactic','makeWorld','gameId','retry','settle','guard','currentQuestion','source','renderQuestion'])vm.runInContext(fn(source,name),ctx);
 return{...h,source};
}
test('新章教師跳關先等待既有儲存並保存原局，成功隔離後才建立獨立新局',async()=>{
 const h=zhuziHarness(),{ctx,ZH}=h;const original=ctx.s;original.answers.old={anchorId:'old',correct:false};original.stage=0;
 let release;ctx.saving=new Promise(r=>release=r);const task=ctx.jumpForTeacher(1,'question',0);await new Promise(r=>setImmediate(r));
 assert.equal(ctx.s,original);assert.equal(ZH.teacherPreview.active(),false);assert.equal(ctx.paused,true);assert.equal(h.writes.length,0);
 release({ok:true});await task;assert.equal(h.writes.length,1);assert.equal(h.writes[0].stage,0);assert.equal(h.writes[0].answers.old.correct,false);assert.equal(ZH.teacherPreview.active(),true);
 assert.notEqual(ctx.s,original);assert.equal(ctx.s.stage,1);assert.equal(ctx.s.phase,'question');assert.equal(Object.keys(ctx.s.answers).length,0);assert.equal(original.answers.old.correct,false);assert.deepEqual(h.steps,['formal-save','flush']);
});
test('新章正式存檔失敗不得切換測試或替換原首答；學生跳關直接拒絕',async()=>{
 const h=zhuziHarness({save:async()=>({ok:false,msg:'離線'})}),original=h.ctx.s;original.answers.old={correct:false};await assert.rejects(h.ctx.jumpForTeacher(1,'game',0),/離線/);assert.equal(h.ZH.teacherPreview.active(),false);assert.equal(h.ctx.s,original);assert.equal(h.ctx.paused,false);
 const student=zhuziHarness({teacher:false,params:{teacherPreview:'1',previewTeacher:'1'}});await assert.rejects(student.ctx.jumpForTeacher(0,'intro',0),/僅教師/);assert.equal(student.ZH.teacherPreview.active(),false);assert.deepEqual(student.writes,[]);
});
test('新章試玩通關、答題、再戰及退出均不增加正式存檔或首答與排行榜事件',async()=>{
 const h=zhuziHarness(),{ctx,ZH}=h;const original=ctx.s;original.answers.old={correct:false};await ctx.jumpForTeacher(0,'game',0);assert.equal(h.writes.length,1);
 ctx.s.world.status='won';await ctx.settle();await ctx.saving;assert.equal(ctx.s.games.length,1);assert.equal(ctx.s.games[0].firstScore,7);assert.equal(h.writes.length,1);assert.deepEqual(h.events,[]);
 await ctx.retry(true);await ctx.saving;assert.equal(ctx.s.phase,'game');assert.equal(h.writes.length,1);
 ctx.s.phase='question';ctx.s.questionIndex=0;const choices=[{dataset:{choice:'A'},disabled:false},{dataset:{choice:'B'},disabled:false}];ctx.view.querySelectorAll=()=>choices;
 ctx.renderQuestion();await choices[0].onclick();await ctx.saving;assert.equal(ctx.s.answers.q0.correct,true);assert.equal(original.answers.q0,undefined);assert.equal(original.answers.old.correct,false);assert.equal(h.writes.length,1);assert.deepEqual(h.events,[]);
 ctx.s=ZH.zhuziModel.relaunch(ctx.s);ZH.runs.begin(ctx.c.id,ctx.s,'history');await ctx.checkpoint();assert.equal(h.writes.length,1);
 ZH.teacherPreview.exit();assert.equal(h.navigation[0][0],ctx.c.id);assert(!Object.hasOwn(h.navigation[0][1],'teacherPreview'));assert.deepEqual(h.events,[]);
});
test('新章教師完成頁不掛正式通關或再戰送出入口',async()=>{
 const h=zhuziHarness({params:{teacherPreview:'1'}}),{ctx}=h;let formalComplete=0;ctx.s.stage=ctx.c.stages.length;ctx.s.phase='complete';ctx.syncStageArt=()=>{};ctx.shell=()=>{};ctx.renderComplete=()=>formalComplete++;
 ctx.document.body={classList:{toggle(){}}};vm.runInContext(fn(h.source,'render'),ctx);ctx.render();
 assert.equal(formalComplete,0);assert(ctx.view.innerHTML.includes('這段測試已完成'));assert.equal(typeof ctx.handlers['exit-test'],'function');assert.equal(ctx.handlers.finish,undefined);assert.equal(ctx.handlers.relaunch,undefined);
});
test('previewTeacher只由localhost fixture加入教師身分，正式橋接無法用query偽造',()=>{
 const serve=raw('scripts/serve.cjs'),boot=nodes(serve,n=>n.type==='VariableDeclarator'&&n.id.name==='boot')[0];assert(serve.includes(".listen(port,'127.0.0.1'"));
 const fixture=vm.runInNewContext('('+serve.slice(boot.init.start,boot.init.end)+')',{site:'http://127.0.0.1/',name:'S_al18_shihao',chapters:[],url:new URL('http://127.0.0.1/?previewTeacher=1')});assert.equal(fixture.user.isTeacher,true);
 const bridge=raw('gas/GitHubBridge.gs'),ctx={githubSettings_:()=>({site:'https://example.test/',release:'v4-demo'}),githubPageSource_:()=>'<html><!--ZH_SERVER_BOOT--></html>',getAppUrl_:()=>'',getLoginUrl_:()=>'',getGuestScenarios_:()=>[],safeJson_:JSON.stringify,HtmlService:{createHtmlOutput:html=>html},finalizeOutput_:x=>x};vm.createContext(ctx);vm.runInContext(fn(bridge,'buildGithubGamePage_'),ctx);
 const output=ctx.buildGithubGamePage_('demo','S_al18_shihao',{previewTeacher:'1',teacherPreview:'1',isTeacher:'true'},{email:'student',isSchool:true,isGuest:false,isTeacher:false});const payload=JSON.parse(output.match(/window.ZH_BOOT=(.*?);<\/script>/)[1]);assert.equal(payload.user.isTeacher,false);
});
