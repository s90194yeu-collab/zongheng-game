const{test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),strip=s=>[...s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const {entries,additional,scope}=require('../src/content/a-selections.cjs');
const e={window:{ZH:{LEARNING_TEXTS:{}}}};e.ZH=e.window.ZH;vm.createContext(e);for(const f of ['Data_catalog','Data_classics','Data_a_selections','Zhuzi_models'])vm.runInContext(strip(read('src/legacy/'+f+'.html')),e);
const d={};vm.createContext(d);vm.runInContext(read('src/legacy/ASelections_data.gs'),d);const drafts=d.SCENARIO_DATA;
test('108/109 A表26篇正確篩選：排除五項韻文、保留漁父，十四篇共用原ID與存檔',()=>{
 const expected=['燭之武退秦師','諫逐客書','大同與小康','鴻門宴','桃花源記','出師表','虯髯客傳','師說','晚遊六橋待月記','勞山道士','項脊軒志','鹿港乘桴記','畫菊自序','勸和論','漁父','劉姥姥','庖丁解牛','王道之始（五十步笑百步）','吾十有五而志於學','弟子入則孝（入孝出弟）','學而不思則罔','顏淵問仁（克己復禮為仁）','孔乙己','一桿「稱仔」','散戲','髻'];
 assert.deepEqual(entries.map(x=>x.title),expected);assert.equal(e.ZH.scenariosOf('al').length,26);assert.equal(entries.filter(x=>x.reuse).length,14);assert.equal(new Set(e.ZH.CATALOG.map(x=>x.id)).size,75);
 for(const t of scope.excluded)assert(!entries.some(x=>x.title===t));assert(e.ZH.scenariosOf('gw').some(x=>x.name==='赤壁賦'));
 for(const x of entries){const menu=e.ZH.scenariosOf('al').find(m=>m.name===x.title);assert.equal(menu.id,x.id);assert.equal(e.ZH.CATALOG.filter(c=>c.id===x.id).length,1);if(x.reuse)assert(!drafts[x.id]);}
 assert.equal(e.ZH.findScenario('S_zg07_quyuan').id,'S_zg07_quyuan');assert.equal(e.ZH.findScenario('S_zz04_zhuangread').id,'S_zz04_zhuangread');
});
test('十二篇新增28段56題，四短章各一段；題面引句、題型、答案與兩收藏完整',()=>{
 assert.equal(additional.length,12);let stages=0,questions=0;const ids=[];
 for(const x of additional){const c=e.ZH.A_SELECTIONS.chapters[x.id],a=drafts[x.id];stages+=c.stages.length;questions+=a.anchors.length;
  assert.equal(c.stages.length,['zhixue','ruxiao','xuesi','wenren'].includes(x.key)?1:3);assert.equal(a.anchors.length,c.stages.length*2);assert.equal(a.codex.length,2);assert(c.fullText.length>0);assert(c.url.startsWith('https://'));
  for(const s of c.stages){assert.equal(s.questionIds.length,2);assert.equal(s.game.targets.length,3);assert(s.story.length>30);assert(s.gloss.length>20);assert(!('questions'in s));assert(s.gameId.startsWith('al_'));}
  for(const q of a.anchors){assert(/^[a-z]{2,4}_\d{2}$/.test(q.id));assert.equal(Object.keys(q.options).length,4);assert.equal(q.options[q.answer].length,1);assert.equal(new Set(Object.values(q.options).map(x=>x[0])).size,4);for(const[,quote]of q.stem.matchAll(/「([^」]+)」/g))assert(q.passage.includes(quote.replace(/…/g,''))||x.title.includes(quote),q.id+'缺引句'+quote);ids.push(q.id);}
 }
 assert.equal(stages,28);assert.equal(questions,56);assert.equal(new Set(ids).size,56);
});
test('髻與散戲清楚標示自編導讀，不冒稱原文；其餘全文與選段也區分',()=>{
 for(const key of ['ji','sanxi']){const x=additional.find(x=>x.key===key),lib=e.ZH.A_SELECTIONS.library[x.id],c=e.ZH.A_SELECTIONS.chapters[x.id];assert.equal(lib.readerKind,'guide');assert.equal(lib.readerLabel,'自編導讀');assert.equal(c.readerLabel,'自編導讀');assert(c.note.includes('課本'));assert(c.fullText.every(t=>t.startsWith('【自編導讀】')));assert(drafts[x.id].anchors.every(q=>q.source.includes('自編導讀')));assert.equal(drafts[x.id].codex[0].quote,'');}
 assert.equal(e.ZH.A_SELECTIONS.chapters.S_al01_yufu.readerKind,'full');assert.equal(e.ZH.A_SELECTIONS.chapters.S_al02_liulao.readerKind,'selected');
});
test('一段與三段以各自段數計算首輪操作；重試最佳成績不改寫首輪',()=>{
 const M=e.ZH.zhuziModel;assert.equal(M.strategy([{firstScore:10}],1),100);assert.equal(M.strategy([{firstScore:8}],1),80);assert.equal(M.strategy([{firstScore:8},{firstScore:9},{firstScore:10}],3),90);
 let s=M.fresh('S_al07_xuesi');const lost=M.create('seam');lost.status='lost';M.recordGame(s,lost,'al_xuesi_1');s=JSON.parse(JSON.stringify(s));const won=M.create('seam');won.status='won';M.recordGame(s,won,'al_xuesi_1');assert.equal(M.strategy(s.games,1),0);assert.equal(s.games[0].bestScore,10);
});
test('十二篇沿用GAS題庫與停用規則，新章收藏分母與德望計算正確',{skip:!fs.existsSync(path.join(root,'gas-private-source/AnchorBank.gs'))},()=>{
 const v={};vm.createContext(v);for(const f of ['gas/Code.gs','gas-private-source/TeacherApi.gs','gas-private-source/AnchorBank.gs','gas-private-source/StoryGuard.gs','src/legacy/ASelections_data.gs'])vm.runInContext(read(f),v);v.readBankRows_=()=>[];
 for(const x of additional){const qs=drafts[x.id].anchors;for(const q of qs)assert.equal(v.draftProblems_(q).length,0,x.title+'/'+q.id);assert.equal(v.api_getStoryAnchors(x.id,qs.map(q=>q.id)).ok,true);}
 const x=additional[0],q=drafts[x.id].anchors[0];v.readBankRows_=()=>[{scenarioId:x.id,id:q.id,enabled:false}];assert.equal(v.api_getStoryAnchors(x.id,[q.id]).missing[0].reason,'disabled');
 const r=v.studentDims_({anch:{},games:{},scen:{S_cq08_weizheng:{strategy:80,virtue:70},S_al01_yufu:{strategy:90,virtue:0}},codex:14},{codexPerScenario:12});assert.equal(r.virtue,70);assert.equal(r.erudition,100);
});
