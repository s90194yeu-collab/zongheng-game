const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),raw=id=>fs.readFileSync(path.join(root,'src/legacy',id+'.html'),'utf8'),copy=x=>JSON.parse(JSON.stringify(x));
const points=[['S_zg01_sanjia','n_08'],['S_zg02_weiwen','n_23'],['S_zg03_shangyang','n_08'],['S_zg04_jixia','n_19'],['S_zg05_maling','n_16'],['S_zg06_hezong','n_10'],['S_zg07_quyuan','n_17'],['S_zg08_hufu','n_04'],['S_zg09_mengchang','n_17'],['S_zg10_changping','n_07'],['S_zg12_handan','n_21'],['S_zg13_tongyi','n_28']];
function boot({guest=false,allowed=['S_zg11_zhuke'],result={status:'completed',completed:true,score:99},params={}}={}){
 const calls=[],mockApp={async playChapter(id,context){calls.push({id,context});return typeof result==='function'?result():result;},async open(){}};
 const ZH={boot:{page:'hub',params,guestScenarios:allowed},user:{email:'own@school.test'},isGuest:()=>guest,esc:String,ready(){},toast(){}};
 const env={window:{ZH,ZH_CHARACTER_ASSETS:{app:'app.js',css:'app.css'}},document:{createElement:()=>({}),head:{appendChild(){}}},ZH_STATIC_URL:x=>x,Date,Map,Promise,mockApp};vm.createContext(env);
 vm.runInContext(raw('Character_boot').replace(/<\/?script>/g,'').replace('import(ZH_STATIC_URL(assets.app))','Promise.resolve({install:async()=>mockApp})'),env);
 return{ZH,c:ZH.character,calls};
}
function holder(){const controls={'[data-character-mode]':{},'[data-character-config]':{}};return{controls,set innerHTML(html){this.html=html;controls['[data-character-mode]'].checked=html.includes('data-character-mode checked');},querySelector:s=>controls[s]};}
function startHarness(id,bridge,state){
 const source=raw(id),node=points.find(p=>p[0]===id)[1],calls=[],writes=[];let config,started,original=0;
 const game={async save(){const snap={node:state.node,vars:{},anchors:copy(state.anchors),games:copy(state.games),progress:{}};config.snapshot(snap,state);writes.push(snap);calls.push('save');},start(saved){started=saved;}};
 const realNodes={[node]:async()=>{original++;calls.push('original');return 'original-next';},other:async()=> 'other-next'};
 const env={ZH:bridge.ZH,SID:id,MODE:'original-mode',SCHEMA:'existing-schema',ROOT:{},params:{},CHARACTERS:[],SCENES:{},NODES:realNodes,HELP:'',ORDER:[],copy,loading:false,game:null,window:{},crypto:{getRandomValues:a=>(a[0]=123,a)},anchorRunner(){},save(){},onEnd(){}};
 bridge.ZH.story={create(_root,options){config=options;return game;}};vm.createContext(env);
 vm.runInContext(source.match(/const checkpoint=\(\)=>game\?game.save\(\):Promise.resolve\(\);/)[0],env);
 vm.runInContext(source.slice(source.indexOf('function snapshot(snap,live)'),source.indexOf('\nfunction save(s)')),env);
 vm.runInContext(source.slice(source.indexOf('async function start(saved)'),source.indexOf('function title(saved)')),env);
 return{async start(saved){await env.start(saved);return config;},get config(){return config;},get started(){return started;},get original(){return original;},calls,writes,game,realNodes};
}
function stateAt(node){return{node,vars:{schema:'existing-schema',firstAnchors:{wrong:{correct:false}},firstScore:2},rng:7,anchors:[{anchorId:'original-wrong',correct:false}],games:[{gameId:'original-game',score:3,skipped:false}],progress:{},_ocChapter:{version:1,enabled:true,checkpoints:{}}};}
test('戰國十二篇首畫面可選同行，舊局須明確加入；訪客清單仍是唯一權限來源',()=>{
 const b=boot();for(const [id,node]of points){const chapter=b.c.chapters[id];assert(chapter,id);assert.equal(chapter.node,node);assert(new RegExp('\\b'+node+':\\s*async ctx').test(raw(id)),id+' hook exists');assert.equal(b.c.newChapterState(id).enabled,true);
  const old={node,vars:{firstScore:2},anchors:[{correct:false}]};b.c.applyChapterChoice(id,old);assert.equal(old._ocChapter.enabled,false);assert.equal(old.vars.firstScore,2);
  const card=holder();b.c.mountEntry(card,id,old);assert.equal(card.controls['[data-character-mode]'].checked,false);card.controls['[data-character-mode]'].onchange({target:{checked:true}});b.c.applyChapterChoice(id,old);assert.equal(old._ocChapter.enabled,true);card.controls['[data-character-mode]'].onchange({target:{checked:false}});assert.equal(b.c.newChapterState(id).enabled,false);
 }
 const visitor=boot({guest:true});for(const [id]of points)assert.equal(visitor.c.enabled(id,{_ocChapter:{enabled:true}}),false,id);assert.equal(visitor.c.enabled('S_zg11_zhuke',{_ocChapter:{enabled:true}}),true);
 const permitted=boot({guest:true,allowed:[points[0][0]]});assert.equal(permitted.c.enabled(points[0][0],{_ocChapter:{enabled:true}}),true);assert.equal(permitted.c.enabled(points[1][0],{_ocChapter:{enabled:true}}),false);
 const explicit=boot({params:{character:'1'}}),old={node:'past'};explicit.c.applyChapterChoice(points[0][0],old);assert.equal(old._ocChapter.enabled,true);
});
test('實際十二章start設定使用公開game.save，同行完成、離開與失敗均返回原節點且保留原首績',async()=>{
 for(const [id,node]of points)for(const status of ['completed','left','failed']){
  const b=boot({result:{status,completed:status==='completed',score:99}}),state=stateAt(node),initial=JSON.stringify({vars:state.vars,anchors:state.anchors,games:state.games}),h=startHarness(id,b,state);const config=await h.start(null),fresh=config.initState();assert.equal(fresh._ocChapter.enabled,true);assert.equal(fresh.vars.schema,'existing-schema');assert.equal(config.nodes.other,h.realNodes.other);assert.equal(h.started,null);
  const next=await config.nodes[node]({state,say:async()=>{h.calls.push('say');}});assert.equal(next,'original-next');assert.equal(h.original,1);assert.equal(h.writes.length,2,'real game.save adapter called before and after');assert(h.writes[0]._ocChapter.pending);assert(!h.writes[1]._ocChapter.pending);assert(h.writes.every(s=>s.node===node));assert.equal(state._ocChapter.checkpoints['warring-companion'].status,status);assert.equal(state._ocChapter.checkpoints['warring-companion'].completed,status==='completed');assert.equal(JSON.stringify({vars:state.vars,anchors:state.anchors,games:state.games}),initial);
  assert.notEqual(h.writes[1]._ocChapter,state._ocChapter);state._ocChapter.checkpoints.extra={status:'left'};assert.equal(h.writes[1]._ocChapter.checkpoints.extra,undefined,'snapshot deep copy');
 }
});
test('實際十二章舊存讀不插入同行，已完成返回點重讀不重開角色任務，原節點仍可執行',async()=>{
 for(const [id,node]of points){const b=boot(),state=stateAt(node);delete state._ocChapter;const h=startHarness(id,b,state);await h.start(state);assert.equal(h.started._ocChapter.enabled,false);assert.equal(await h.config.nodes[node]({state,say:async()=>{}}),'original-next');assert.equal(h.writes.length,0);assert.equal(b.calls.length,0);
  state._ocChapter={version:1,enabled:true,checkpoints:{'warring-companion':{status:'completed',completed:true}}};assert.equal(await h.config.nodes[node]({state,say:async()=>{}}),'original-next');assert.equal(b.calls.length,0);assert.equal(h.original,2);assert.equal(h.writes.length,0);
 }
});
test('教師模式或帳號在角色等待期間改變會中止十二篇舊節點，且不回寫完成結果',async()=>{
 for(const [id,node]of points)for(const change of ['preview','account']){let preview=false,b; b=boot({result:()=>{if(change==='preview')preview=true;else b.ZH.user.email='changed@school.test';return{status:'completed',completed:true,score:100};}});b.ZH.teacherPreview={active:()=>preview};const state=stateAt(node),h=startHarness(id,b,state);await h.start(state);assert.equal(await h.config.nodes[node]({state,say:async()=>{throw Error('changed scope cannot continue');}}),null);assert.equal(h.original,0);assert.equal(h.writes.length,1);assert.equal(state._ocChapter.checkpoints['warring-companion'],undefined);assert.equal(state.vars.firstScore,2);assert.equal(state.anchors[0].correct,false);assert.equal(state.games[0].score,3);}
});

test('同行返回訊息等待時切換模式也不會啟動舊原節點',async()=>{
 for(const [id,node]of points){let preview=false;const b=boot();b.ZH.teacherPreview={active:()=>preview};const state=stateAt(node),h=startHarness(id,b,state);await h.start(state);assert.equal(await h.config.nodes[node]({state,say:async()=>{preview=true;}}),null);assert.equal(h.original,0);assert.equal(h.writes.length,2);assert.equal(h.writes[1]._ocChapter.checkpoints['warring-companion'].status,'completed');}
});
