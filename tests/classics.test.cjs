const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const{entries}=require('../src/content/classics.cjs');
const strip=s=>[...s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
function env(){const e={window:{ZH:{LEARNING_TEXTS:{}}}};e.ZH=e.window.ZH;vm.createContext(e);return e;}
const cenv=env();vm.runInContext(strip(read('src/legacy/Data_catalog.html')),cenv);vm.runInContext(strip(read('src/legacy/Data_classics.html')),cenv);
const d={};vm.createContext(d);vm.runInContext(read('src/legacy/Classics_data.gs'),d);const drafts=d.SCENARIO_DATA;
test('課綱十五篇順序完整，四篇直接沿用原ID，不重複登記或另建存檔',()=>{
 assert.deepEqual(entries.map(e=>e.title),['燭之武退秦師','大同與小康','諫逐客書','鴻門宴','出師表','桃花源記','師說','虯髯客傳','赤壁賦','項脊軒志','晚遊六橋待月記','勞山道士','勸和論','鹿港乘桴記','畫菊自序']);
 const ZH=cenv.ZH,menu=ZH.scenariosOf('gw');assert.equal(menu.length,15);assert.equal(ZH.CATALOG.length,75);assert.equal(new Set(ZH.CATALOG.map(s=>s.id)).size,75);
 assert.deepEqual(entries.filter(e=>e.reuse).map(e=>e.id),['S_cq08_weizheng','S_cq16_datong','S_zg11_zhuke','S_ch04_hongmen']);
 for(const e of entries){assert.equal(menu.find(s=>s.id===e.id).name,e.title);if(!e.reuse)assert.equal(menu.find(s=>s.id===e.id).status,'ready');assert.equal(ZH.CATALOG.filter(s=>s.id===e.id).length,1);if(e.reuse)assert(!drafts[e.id]);}
});
test('十五篇原文與來源可回讀，新十一篇各三段、六題、兩收藏，題幹引句在題面可核對',()=>{
 const ids=[];for(const e of entries){const lib=cenv.ZH.CLASSICS.library[e.id];assert(lib.fullText.length>=2);assert.equal(lib.fullText.join(''),e.fullText.join(''));assert(lib.url.startsWith('https://cerclearning.tp.edu.tw/classical/datapage/'));
  if(e.reuse)continue;const ch=cenv.ZH.CLASSICS.chapters[e.id],data=drafts[e.id];assert.equal(ch.stages.length,3);assert.equal(data.anchors.length,6);assert.equal(data.codex.length,2);assert(ch.fullText.join('').length>150);
  for(const s of ch.stages){assert.equal(s.game.targets.length,3);assert.equal(s.questionIds.length,2);assert(s.gameId.startsWith('gw_'));assert(s.story.length>30);assert(s.gloss.length>20);assert(!('questions'in s));}
  for(const a of data.anchors){assert(/^[a-z]{2,4}_\d{2}$/.test(a.id));assert.equal(Object.keys(a.options).length,4);assert.equal(a.options[a.answer].length,1);assert.equal(new Set(Object.values(a.options).map(x=>x[0])).size,4);for(const [,quote]of a.stem.matchAll(/「([^」]+)」/g))assert(a.passage.includes(quote.replace(/…/g,''))||e.title.includes(quote),a.id+' 題面缺引句 '+quote);ids.push(a.id);}
 }
 assert.equal(ids.length,66);assert.equal(new Set(ids).size,66);
});
test('新增題庫沿用教師列優先，缺題或停用時拒絕啟動',{skip:!fs.existsSync(path.join(root,'gas-private-source/AnchorBank.gs'))},()=>{
 const e={};vm.createContext(e);for(const f of ['gas/Code.gs','gas-private-source/TeacherApi.gs','gas-private-source/AnchorBank.gs','gas-private-source/StoryGuard.gs','src/legacy/Classics_data.gs'])vm.runInContext(read(f),e);
 e.readBankRows_=()=>[];
 for(const x of entries.filter(x=>!x.reuse)){const qs=drafts[x.id].anchors;for(const q of qs)assert.equal(e.draftProblems_(q).length,0,x.title+'/'+q.id);assert.equal(e.api_getStoryAnchors(x.id,qs.map(q=>q.id)).ok,true);}
 const ch=entries.find(e=>e.key==='huaju'),q=drafts[ch.id].anchors[0];e.readBankRows_=()=>[{scenarioId:ch.id,id:q.id,enabled:false}];assert.equal(e.api_getStoryAnchors(ch.id,[q.id]).missing[0].reason,'disabled');
});
test('古文新增章不以缺省德望拉低舊分數，兩收藏按實際數量計',{skip:!fs.existsSync(path.join(root,'gas-private-source/TeacherApi.gs'))},()=>{
 const e={};vm.createContext(e);vm.runInContext(read('gas-private-source/TeacherApi.gs'),e);const r=e.studentDims_({anch:{},games:{},scen:{S_cq08_weizheng:{strategy:80,virtue:70},S_gw15_huaju:{strategy:90,virtue:0}},codex:14},{codexPerScenario:12});assert.equal(r.virtue,70);assert.equal(r.erudition,100);
});
