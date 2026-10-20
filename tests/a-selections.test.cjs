const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),strip=s=>[...s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const {entries,additional,scope}=require('../src/content/a-selections.cjs');
const e={window:{ZH:{LEARNING_TEXTS:{}}}};e.ZH=e.window.ZH;vm.createContext(e);for(const f of ['Data_catalog','Data_classics','Data_a_selections','Zhuzi_models'])vm.runInContext(strip(read('src/legacy/'+f+'.html')),e);
const d={};vm.createContext(d);vm.runInContext(read('src/legacy/ASelections_data.gs'),d);const drafts=d.SCENARIO_DATA;
test('經典著作23篇：移除論語與古文十五篇重複、王道整合孟子、馮諼沿用原ID',()=>{
 const expected=['馮諼客孟嘗君','漁父','庖丁解牛','典論論文','石壕吏','諫太宗十思疏','岳陽樓記','醉翁亭記','左忠毅公逸事','花和尚大鬧桃花村','林沖夜奔','劉姥姥','孔乙己','一桿「稱仔」','散戲','髻','過秦論','登樓賦','蘭亭集序','始得西山宴遊記','賣柑者言','指喻','臺灣通史序'];
 assert.deepEqual(entries.map(x=>x.title),expected);assert.equal(e.ZH.scenariosOf('al').length,23);assert.equal(entries.filter(x=>x.reuse).length,1);assert.equal(new Set(e.ZH.CATALOG.map(x=>x.id )).size,90);
 const gw=new Set(e.ZH.scenariosOf('gw').map(x=>x.id));for(const x of entries){assert(!gw.has(x.id));assert(!x.title.includes('王道'));const menu=e.ZH.scenariosOf('al').find(m=>m.name===x.title);assert.equal(menu.id,x.id);assert.equal(e.ZH.CATALOG.filter(c=>c.id===x.id).length,1);}
 assert.equal(entries[0].id,'S_zg09_mengchang');assert(!drafts[entries[0].id]);const king=e.ZH.findScenario('S_al04_wangdao');assert.equal(king.vol,'zz');assert.equal(king.level,'read');assert.equal(e.ZH.scenariosOf('zz').length,13);assert(e.ZH.LEARNING_TEXTS[king.id]);assert.equal(e.ZH.A_SELECTIONS.chapters[king.id].collection,'先秦諸子');
 for(const id of ['S_al05_zhixue','S_al06_ruxiao','S_al07_xuesi','S_al08_wenren']){assert(!e.ZH.scenariosOf('al').some(x=>x.id===id));assert(e.ZH.A_SELECTIONS.chapters[id].legacyOnly);assert(drafts[id]);}
 assert(!read('src/legacy/Hub.html').includes('依龍騰108'));assert(!read('src/legacy/Hub.html').includes('A類選文之境'));assert.equal(e.ZH.VOLUMES.find(x=>x.key==='al').name,'經典著作');
});
test('27個新舊路由共62幕128題；新增八篇20幕44題，題面與收藏完整',()=>{
 assert.equal(additional.length,27);let stages=0,questions=0;const ids=[];
 for(const x of additional){const c=e.ZH.A_SELECTIONS.chapters[x.id],a=drafts[x.id];stages+=c.stages.length;questions+=a.anchors.length;
  assert.equal(c.stages.length,['zhixue','ruxiao','xuesi','wenren','shihao','taohua'].includes(x.key)?1:x.no>20?2:3);assert.equal(a.anchors.length,c.stages.reduce((n,s)=>n+s.questionIds.length,0));assert.equal(a.codex.length,2);assert(c.fullText.length>0);assert(c.url.startsWith('https://'));
  for(const s of c.stages){assert.equal(s.questionIds.length,['shihao','taohua'].includes(x.key)?4:2);assert.equal(s.game.targets.length,3);assert(s.story.length>30);assert(s.gloss.length>20);assert(!('questions'in s));assert(s.gameId.startsWith('al_'));}
  for(const q of a.anchors){assert(/^[a-z]{2,4}_\d{2}$/.test(q.id));assert.equal(Object.keys(q.options).length,4);assert.equal(q.options[q.answer].length,1);assert.equal(new Set(Object.values(q.options).map(x=>x[0])).size,4);for(const[,quote]of q.stem.matchAll(/「([^」]+)」/g))assert(q.passage.includes(quote.replace(/…/g,''))||x.title.includes(quote),q.id+'缺引句'+quote);ids.push(q.id);}
 }
 assert.equal(stages,62);assert.equal(questions,128);assert.equal(new Set(ids).size,128);
});
test('髻與散戲清楚標示自編導讀，不冒稱原文；其餘全文與選段也區分',()=>{
 for(const key of ['ji','sanxi']){const x=additional.find(x=>x.key===key),lib=e.ZH.A_SELECTIONS.library[x.id],c=e.ZH.A_SELECTIONS.chapters[x.id];assert.equal(lib.readerKind,'guide');assert.equal(lib.readerLabel,'自編導讀');assert.equal(c.readerLabel,'自編導讀');assert(c.note.includes('課本'));assert(c.fullText.every(t=>t.startsWith('【自編導讀】')));assert(drafts[x.id].anchors.every(q=>q.source.includes('自編導讀')));assert.equal(drafts[x.id].codex[0].quote,'');}
 assert.equal(e.ZH.A_SELECTIONS.chapters.S_al01_yufu.readerKind,'full');assert.equal(e.ZH.A_SELECTIONS.chapters.S_al02_liulao.readerKind,'selected');
});
test('一段與三段以各自段數計算首輪操作；重試最佳成績不改寫首輪',()=>{
 const M=e.ZH.zhuziModel;assert.equal(M.strategy([{firstScore:10}],1),100);assert.equal(M.strategy([{firstScore:8}],1),80);assert.equal(M.strategy([{firstScore:8},{firstScore:9},{firstScore:10}],3),90);
 let s=M.fresh('S_al07_xuesi');const lost=M.create('seam');lost.status='lost';M.recordGame(s,lost,'al_xuesi_1');s=JSON.parse(JSON.stringify(s));const won=M.create('seam');won.status='won';M.recordGame(s,won,'al_xuesi_1');assert.equal(M.strategy(s.games,1),0);assert.equal(s.games[0].bestScore,10);
});
test('經典及舊路由沿用GAS題庫與停用規則，新章收藏分母與德望計算正確',{skip:!fs.existsSync(path.join(root,'gas-private-source/AnchorBank.gs'))},()=>{
 const v={};vm.createContext(v);for(const f of ['gas/Code.gs','gas-private-source/TeacherApi.gs','gas-private-source/AnchorBank.gs','gas-private-source/StoryGuard.gs','src/legacy/ASelections_data.gs'])vm.runInContext(read(f),v);v.readBankRows_=()=>[];
 for(const x of additional){const qs=drafts[x.id].anchors;for(const q of qs)assert.equal(v.draftProblems_(q).length,0,x.title+'/'+q.id);assert.equal(v.api_getStoryAnchors(x.id,qs.map(q=>q.id)).ok,true);}
 const x=additional[0],q=drafts[x.id].anchors[0];v.readBankRows_=()=>[{scenarioId:x.id,id:q.id,enabled:false}];assert.equal(v.api_getStoryAnchors(x.id,[q.id]).missing[0].reason,'disabled');
 const r=v.studentDims_({anch:{},games:{},scen:{S_cq08_weizheng:{strategy:80,virtue:70},S_al01_yufu:{strategy:90,virtue:0}},codex:14},{codexPerScenario:12});assert.equal(r.virtue,70);assert.equal(r.erudition,100);
});
