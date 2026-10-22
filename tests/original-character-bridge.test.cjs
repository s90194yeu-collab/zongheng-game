const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),raw=n=>fs.readFileSync(path.join(root,'src/legacy',n+'.html'),'utf8'),plain=v=>JSON.parse(JSON.stringify(v));
const ids=['S_cq08_weizheng','S_cq16_datong','S_zg11_zhuke'];
function holder(){const controls={'[data-character-mode]':{},'[data-character-config]':{}};return{controls,set innerHTML(html){this.html=html;controls['[data-character-mode]'].checked=html.includes('data-character-mode checked');},querySelector:s=>controls[s]};}
function boot({guest=false,allowed=ids,result={status:'completed',completed:true,runId:'companion'},params={}}={}){
 const calls=[],saves=[],mockApp={async playChapter(id,ctx){calls.push({id,ctx});return typeof result==='function'?result():result;},async open(){}};
 const ZH={boot:{page:ids[0],params,guestScenarios:allowed},isGuest:()=>guest,esc:s=>String(s),ready(){},toast(){}};
 const e={window:{ZH,ZH_CHARACTER_ASSETS:{app:'character.js',css:'character.css'}},document:{createElement:()=>({}),head:{appendChild(){}},querySelector:()=>null},ZH_STATIC_URL:x=>x,Date,Map,Promise,mockApp};vm.createContext(e);
 vm.runInContext(raw('Character_boot').replace(/<\/?script>/g,'').replace('import(ZH_STATIC_URL(assets.app))','Promise.resolve({install:async()=>mockApp})'),e);
 return{c:ZH.character,calls,saves,ZH};
}
test('三篇原章提供同行卡，新局開啟而舊局不被插入；訪客權限不擴張',()=>{
 const b=boot();for(const id of ids){assert(b.c.chapters[id]);assert.equal(b.c.newChapterState(id).enabled,true);const old={node:'old-node',anchors:[{correct:false}],vars:{firstScore:2}};const original=JSON.stringify(old);b.c.applyChapterChoice(id,old);assert.equal(old._ocChapter.enabled,false);delete old._ocChapter;assert.equal(JSON.stringify(old),original);}
 const card=holder();b.c.mountEntry(card,ids[0],null);assert.equal(card.controls['[data-character-mode]'].checked,true);assert.equal(b.c.newChapterState(ids[0]).enabled,true);
 b.c.mountEntry(card,ids[0],{node:'old'});assert.equal(card.controls['[data-character-mode]'].checked,false);assert.equal(b.c.newChapterState(ids[0]).enabled,false);card.controls['[data-character-mode]'].onchange({target:{checked:true}});assert.equal(b.c.newChapterState(ids[0]).enabled,true);
 const explicit=boot({params:{character:'1'}}),old={node:'saved'};explicit.c.applyChapterChoice(ids[1],old);assert.equal(old._ocChapter.enabled,true);
 const visitor=boot({guest:true,allowed:[ids[0]]});assert.equal(visitor.c.enabled(ids[1],{_ocChapter:{enabled:true}}),false);assert.equal(visitor.c.enabled(ids[0],{_ocChapter:{enabled:true}}),true);
 for(const id of ids){const s=raw(id);assert(s.includes('data-character-entry'));assert(s.includes('mountEntry'));assert(s.includes('applyChapterChoice'));}
});
test('章內橋接前後同一節點儲存，通關只寫獨立metadata，原題與原首輪不變',async()=>{
 const b=boot(),state={node:'n_13',_ocChapter:{enabled:true,checkpoints:{}},anchors:[{anchorId:'dt_05',correct:false}],games:[{gameId:'dt_talent',score:3}],meters:{heart:20},vars:{talent:{firstScore:3}}};
 const original=JSON.stringify({anchors:state.anchors,games:state.games,meters:state.meters,vars:state.vars});const writes=[];
 const result=await b.c.checkpoint(ids[1],state,async()=>writes.push(plain(state)),{checkpoint:'public-roster',nodeId:'n_13',title:'輪值'});
 assert(result.completed);assert.equal(result.status,'completed');assert.equal(writes.length,2);assert(writes[0]._ocChapter.pending);assert(!writes[1]._ocChapter.pending);assert(writes.every(s=>s.node==='n_13'));
 assert.equal(JSON.stringify({anchors:state.anchors,games:state.games,meters:state.meters,vars:state.vars}),original);
 await b.c.checkpoint(ids[1],state,async()=>writes.push(plain(state)),{checkpoint:'public-roster'});assert.equal(b.calls.length,1,'已完成的節點不重開任務');
});
test('離開與失敗均不冒充通關；假completed旗標、舊存讀與disabled也不誤開',async()=>{
 for(const result of [{status:'left',left:true},{status:'failed'},{status:'completed',completed:false}]){
  const b=boot({result}),state={node:'n_21',_ocChapter:{enabled:true,checkpoints:{}}};const r=await b.c.checkpoint(ids[2],state,async()=>{}, {checkpoint:'final-copy'});assert.equal(r.completed,false);assert.notEqual(state._ocChapter.checkpoints['final-copy'].status,'completed');
  const restored=plain(state);await b.c.checkpoint(ids[2],restored,async()=>{}, {checkpoint:'final-copy'});assert.equal(b.calls.length,2,'未完成可續開');
 }
 const b=boot(),r=await b.c.checkpoint(ids[1],{_ocChapter:{enabled:false}},async()=>{throw Error('不應保存');});assert.equal(r.status,'disabled');assert.equal(b.calls.length,0);
});
function wzHarness(results,original={caught:2,ropeCaught:1,seconds:44,assisted:false,skipped:false},flags={}){
 const selections=results.slice(),calls=[],state={flags:plain(flags),_ocChapter:{enabled:true},node:'night'},ctx={state,flag(k,v){if(arguments.length===1)return state.flags[k];state.flags[k]=v;},async save(){calls.push('save');},log(s){calls.push(['log',s]);},async say(s){calls.push(['say',s]);}};
 const ZH={character:{enabled:()=>true,async checkpoint(){const result=selections.shift();calls.push(['character',result]);return result;}},async modal(){const r=selections.shift();calls.push(['route',r]);return r;}};
 const e={ZH,SID:ids[0],async playStealth(){calls.push('original');return original;}};vm.createContext(e);const s=raw(ids[0]);vm.runInContext(s.slice(s.indexOf('  async function a2Sneak(ctx)'),s.indexOf('\n  function a2Talk(ctx)')),e);return{run:()=>e.a2Sneak(ctx),state,calls};
}
test('夜縋角色完成只走一次動作路線；舊原潛行存檔照常且不被重玩',async()=>{
 const h=wzHarness(['character',{status:'completed',completed:true}]);await h.run();assert(h.state.flags.a2_character_route);assert(!h.state.flags.a2_stealth);assert(!h.calls.includes('original'));
 const old=wzHarness([],{},{a2_stealth:{caught:1,seconds:33}});await old.run();assert.equal(old.calls.length,0);assert.equal(old.state.flags.a2_stealth.seconds,33);
});
test('夜縋角色失敗或離開回城頭選路，改原競技才保留實玩結果',async()=>{
 for(const status of ['left','failed']){const h=wzHarness(['character',{status,completed:false},'original']);await h.run();assert(!h.state.flags.a2_character_route);assert.equal(h.state.flags.a2_stealth.caught,2);assert.equal(h.calls.filter(c=>c==='original').length,1);assert.equal(h.calls.filter(c=>Array.isArray(c)&&c[0]==='route').length,2);}
});
test('夜縋未玩原競技不生原gameId、不送零次被發現的完美加分，原實玩計分不變',()=>{
 const s=raw(ids[0]),e={scores:()=>({strategy:50,virtue:50}),SID:ids[0],MODE:'history',STL_GAME:'stl_yezhui',stealthScore:r=>10-2*(r.caught||0),deeds2:()=>[],argCount:()=>0,tierOf:()=> 'great',CN:['零','一','二','三','四'],Date,Math};vm.createContext(e);
 vm.runInContext(s.slice(s.indexOf('  function scores2(s)'),s.indexOf('  function deeds2(s)')),e);
 vm.runInContext(s.slice(s.indexOf('  function deeds2(s)'),s.indexOf('  function payload2(s, ending)')),e);
 vm.runInContext(s.slice(s.indexOf('  function payload2(s, ending)'),s.indexOf('\n\n  // ═════════════════════════ 各陣營篇章共用')),e);
 const state={flags:{persuade:80,a2_character_route:true},vars:{startedAt:Date.now()},turn:4,anchors:[{correct:false}],codex:[],orderSeq:[],intel:[]};
 assert.equal(e.scores2(state).virtue,50);assert.equal(e.payload2(state,{}).games.length,0);assert.equal(e.payload2(state,{}).stealth,null);assert(e.payload2(state,{}).deeds.some(x=>x.includes('未記原潛行競技成績')));assert(!e.payload2(state,{}).deeds.some(x=>x.includes('人莫之覺')));
 state.flags.a2_stealth={caught:0,seconds:20};assert.equal(e.scores2(state).virtue,58);assert.equal(e.payload2(state,{}).games[0].score,10);
 state.flags.a2_stealth={caught:2,seconds:44};assert.equal(e.scores2(state).virtue,54);assert.equal(e.payload2(state,{}).games[0].score,6);
});
test('兩篇VN節點快照保留角色返回點，舊schema、原必要任務及親答流程持續有效',()=>{
 for(const [id,checkpoint,node,next]of [[ids[1],'public-roster','n_13','n_14'],[ids[2],'final-copy','n_21','n_22']]){
  const s=raw(id),e={copy:plain};vm.createContext(e);vm.runInContext(s.slice(s.indexOf('function snapshot(snap,live)'),s.indexOf('\nfunction save(s)')),e);
  const live={_ocChapter:{enabled:true,pending:{checkpoint,nodeId:node},checkpoints:{}},vars:{schema:id==='S_cq16_datong'?'datong-20261012':'zhuke-20261012',firstAnchors:{wrong:{correct:false}}}},snap={node,vars:{},anchors:[{correct:false}],games:[],progress:{}};e.snapshot(snap,live);assert.deepEqual(plain(snap._ocChapter),live._ocChapter);assert.equal(snap.anchors[0].correct,false);
  const nodeSource=s.match(new RegExp(node+":async ctx=>\\{[^\\n]+"))[0];assert(nodeSource.includes('await characterCheckpoint(ctx)'));assert(nodeSource.includes("null:'"+next+"'"));assert(s.includes('必要體驗或對讀尚未完成'));
 }
});

function storyContext(state,calls){
 // Build the actual Eng_Story ctx object. In particular it has no save method;
 // the chapter must use the public game.save checkpoint adapter instead.
 const engine=raw('Eng_Story'),a=engine.indexOf('    const ctx = {'),b=engine.indexOf('// 關鍵演出只改呈現狀態',a),e={S:{state},rng:()=>0,add:(k,n)=>{state.meters[k]=(state.meters[k]||0)+n;},log(){},say:async lines=>calls.push(['say',plain(lines)]),choose:async()=> 'include',banner:async()=>{},anchor:async()=>{},unlock:k=>calls.push(['unlock',k]),ZH:{toast(){}},ICONS:{},SCENES:{},minigame(){},renderTop(){}};
 vm.createContext(e);vm.runInContext(engine.slice(a,b).replace('const ctx =','globalThis.ctx ='),e);assert.equal('save' in e.ctx,false);return e.ctx;
}
function storyHarness(id,result,enabled=true){
 const b=boot({result}),source=raw(id),calls=[],state={node:id===ids[1]?'n_13':'n_21',_ocChapter:{enabled,checkpoints:{}},anchors:[{anchorId:'original-wrong',correct:false}],games:[],vars:{choices:{},firstAnchors:{wrong:{correct:false}},talent:{firstScore:2}},meters:{heart:20,crown:9}},ctx=storyContext(state,calls);
 const e={ZH:b.ZH,SID:id,copy:plain,game:{async save(){calls.push(['save',state.node]);}},async scene(){calls.push(['scene']);},async choice(){return 'include';},async challenge(ctx,gameId,kind){calls.push(['original-challenge',gameId]);const r={completed:true,score:4,firstScore:4};ctx.state.vars[kind]=r;ctx.state.games.push({gameId,score:4,skipped:false});return r;},firstScore:r=>r.score,setMeter:(ctx,k,n)=>ctx.add(k,n-ctx.meter(k))};vm.createContext(e);
 // Use the chapter's real public game.save adapter, not an invented ctx API.
 vm.runInContext(source.match(/const checkpoint=\(\)=>game\?game.save\(\):Promise.resolve\(\);/)[0],e);
 const at=source.indexOf('const NODES={'),end=source.indexOf(id===ids[1]?'const FIXED=':'const ENDINGS=',at);
 vm.runInContext(source.slice(source.indexOf('async function characterCheckpoint(ctx)'),at),e);
 vm.runInContext(source.slice(at,end).replace('const NODES=','globalThis.nodes='),e);
 return{...b,state,ctx,calls,nodes:e.nodes};
}
test('實際言偃/李斯節點await同行完成、離開或失敗，然後原必做任務仍由學生另做',async()=>{
 for(const id of [ids[1],ids[2]])for(const status of ['completed','left','failed']){
  const h=storyHarness(id,{status,completed:status==='completed',score:99}),node=h.state.node;
  const next=await h.nodes[node](h.ctx);assert.equal(next,id===ids[1]?'n_14':'n_22');assert.equal(h.calls.filter(x=>x[0]==='original-challenge').length,0);assert.equal(h.state.games.length,0);assert.equal(h.state.anchors[0].correct,false);assert.equal(h.state.vars.firstAnchors.wrong.correct,false);
  const checkpoint=id===ids[1]?'public-roster':'final-copy';assert.equal(h.state._ocChapter.checkpoints[checkpoint].status,status);assert.equal(h.calls.filter(x=>x[0]==='save').length,2);assert(h.calls.filter(x=>x[0]==='save').every(x=>x[1]===node));
  const after=h.calls.at(-1)[1][0].text;assert.equal(after.includes('尚未完成'),status!=='completed');
  if(id===ids[1]){assert.equal(h.state.vars.care,undefined);await h.nodes.n_14(h.ctx);assert.equal(h.state.vars.care.firstScore,4);assert.equal(h.state.meters.crown,25);assert.equal(h.state.games[0].gameId,'dt_care');}
  else{assert.equal(await h.nodes.n_22(h.ctx),'n_23');assert.equal(await h.nodes.n_23(h.ctx),'n_24');assert.equal(h.state.vars.shu,undefined);await h.nodes.n_24(h.ctx);assert.equal(h.state.vars.shu.firstScore,4);assert.equal(h.state.games[0].gameId,'wen_zk_shu');}
 }
});
test('章內await期間教師模式轉換不回寫完成、不污染正式存檔，原節點停止續跑',async()=>{
 for(const initial of [false,true]){
  let preview=initial,b;const writes=[];b=boot({result:()=>{preview=!preview;return{status:'completed',completed:true,score:100};}});b.ZH.teacherPreview={active:()=>preview};
  const state={node:'n_21',_ocChapter:{enabled:true,checkpoints:{}},anchors:[{correct:false}],vars:{firstScore:3}};
  const r=await b.c.checkpoint(ids[2],state,async()=>writes.push({preview,state:plain(state)}),{checkpoint:'final-copy'});assert.equal(r.modeChanged,true);assert.equal(r.completed,false);assert.equal(writes.length,1);assert.equal(writes[0].preview,initial);assert(!state._ocChapter.checkpoints['final-copy']);assert.equal(state.vars.firstScore,3);
 }
 for(const id of [ids[1],ids[2]]){
  const h=storyHarness(id,{status:'completed',completed:true});
  h.ZH.character.checkpoint=async()=>({status:'left',completed:false,left:true,modeChanged:true});
  const next=await h.nodes[h.state.node](h.ctx);assert.equal(next,null);assert.equal(h.calls.filter(x=>x[0]==='original-challenge').length,0);assert.equal(h.state.games.length,0);
 }
});

test('夜縋等待期間切換教師模式會中止舊流程，不進交涉或結算',async()=>{
 const h=wzHarness(['character',{status:'left',completed:false,modeChanged:true}]);const r=await h.run();assert.equal(r.modeChanged,true);assert(!h.state.flags.a2_character_route);assert(!h.state.flags.a2_stealth);assert(!h.calls.includes('original'));
 const calls=[],e={Date,ZH:{toast(){calls.push('toast');}},window:{},a2Intro:async()=>{},a2Sneak:async()=>({modeChanged:true}),a2Talk:async()=>calls.push('talk'),a2Qin:async()=>calls.push('qin'),a2Jin:async()=>calls.push('jin'),a2Finale:async()=>calls.push('finish')};vm.createContext(e);const s=raw(ids[0]);vm.runInContext(s.slice(s.indexOf('  function act2(ctx)'),s.indexOf('  function a2Intro(ctx)')),e);await e.act2({state:{flags:{}},subtitle(){},tab(){},night(){}});assert.deepEqual(calls,[]);
});
