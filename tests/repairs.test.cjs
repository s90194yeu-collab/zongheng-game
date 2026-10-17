const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const raw=name=>fs.readFileSync(path.join(root,'src/legacy',name+'.html'),'utf8');

test('發布的同一張地圖包含三卷資料，各卷仍保留自己的分期與代碼',()=>{
 // CI 先測試再建置；驗證已納入版本控管的發布檔，不依賴本機 dist。
 const bridge=fs.readFileSync(path.join(root,'gas/GitHubBridge.gs'),'utf8');
 const release=bridge.match(/GH_RELEASE_DEFAULT_\s*=\s*'(v4-[a-f0-9]+)'/)[1];
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/releases',release,'manifest.json')));
 const html=fs.readFileSync(path.join(root,'public/releases',release,manifest.pages.Map.file),'utf8');
 const code=[...html.matchAll(/<script src="[^\"]+\/(assets\/[^\"]+\.js)"/g)].map(m=>fs.readFileSync(path.join(root,'public',m[1]),'utf8')).join('\n');
 const context={window:{ZH:{}}};vm.createContext(context);
 for(const id of ['ch','cq','zg']){
  assert(code.includes('.WORLDS.'+id+'='),'發布地圖缺少 '+id);
  for(const m of raw('Data_world_'+id).matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],context);
 }
 assert.deepEqual(Object.keys(context.window.ZH.WORLDS).sort(),['ch','cq','zg']);
 assert.equal(context.window.ZH.WORLDS.cq.epochs.length,7);
 assert.equal(context.window.ZH.WORLDS.zg.epochs.length,6);
 for(const [id,world]of Object.entries(context.window.ZH.WORLDS))assert.equal(world.id,id);
});

function cutinContext(content=raw('Data_cutin')){
 let outputReads=0,templateReads=0;
 const context={SCENARIO_PAGE_PATTERN:/^S_(cq|zg|ch)\d{2}_[a-z0-9]+$/,HtmlService:{
  createTemplateFromFile(name){assert.equal(name,'Data_cutin');templateReads++;return{getRawContent:()=>content};},
  createHtmlOutputFromFile(){outputReads++;return{getContent:()=>content.replace(/\/\*[\s\S]*?\*\//g,'')};}
 },githubRequireSetupUser_(){throw Error('教師權限未驗證');},Logger:{log(){}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'gas/CutinCatalog.gs'),'utf8'),context);
 return{context,reads:()=>({outputReads,templateReads})};
}
test('收藏清單從原始模板解析，HTML轉換移除註解仍不會阻斷收藏',()=>{
 const c=cutinContext(),items=c.context.cutinCodexItems_();
 assert.equal(items.length,46);assert.equal(new Set(items.map(x=>x.id)).size,46);
 assert.equal(c.reads().outputReads,0);assert.equal(c.reads().templateReads,1);
 assert(items.some(x=>x.id==='cutin_cq08_yezhui'&&x.name==='夜縋而出'));
});
test('收藏仍拒絕破損清單，過濾重複、停用及非法來源',()=>{
 assert.throws(()=>cutinContext('<script>invalid</script>').context.cutinCodexItems_(),/清單格式/);
 const entry={id:'demo',scenarioId:'S_cq08_weizheng',asset:'cutin:demo',collectible:true};
 const content='/* CUTIN_MANIFEST_START */'+JSON.stringify({entries:[entry,entry,{...entry,id:'off',asset:'cutin:off',enabled:false},{...entry,id:'bad',asset:'https://external.test'}]})+'/* CUTIN_MANIFEST_END */';
 assert.equal(cutinContext(content).context.cutinCodexItems_().length,1);
 assert.throws(()=>cutinContext().context.checkCutinCatalogSetup(),/教師權限/);
});

function navigation({blocked=false,pending=false}={}){
 const listeners=[],gates=[],destinations=[],boot={appUrl:'https://script.google.com/macros/s/game/exec',page:'S_cq16_datong',params:{page:'obsolete',mode:'history',seed:'17',w:'cq'}};
 const parentLocation={};Object.defineProperty(parentLocation,'href',{set(url){if(blocked)throw Error('sandbox');destinations.push(url);}});
 const ZH={url:null,pendingCount:()=>pending?1:0,loading(){},flushAll:()=>Promise.resolve({ok:true}),flush(){},sleep:()=>new Promise(()=>{}),esc:s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'),html:s=>{gates.push(s);return{querySelector:()=>({addEventListener(){},focus(){}})};},user:{}};
 const context={ZH,BOOT:boot,global:{top:{location:parentLocation},navigator:{userActivation:{isActive:true}},location:{href:'https://script.googleusercontent.com/userCodeAppPanel',reload(){throw Error('不得重載內層框架');}}},document:{addEventListener:(type,fn)=>listeners.push({type,fn}),querySelector:()=>null,body:{appendChild(){}}},URL,Date,setTimeout};
 vm.createContext(context);const source=raw('Core_js');vm.runInContext(source.slice(source.indexOf('  ZH.url ='),source.indexOf('// ───────────────────────── 存檔')),context);
 listeners.filter(x=>x.type==='pointerdown').forEach(x=>x.fn({isTrusted:true}));
 return{context,destinations,gates};
}
test('重新載入使用最外層正式入口，保留模式與參數',()=>{
 const n=navigation();n.context.ZH.reloadPage();
 assert.equal(n.destinations.length,1);const url=new URL(n.destinations[0]);
 assert.equal(url.hostname,'script.google.com');assert.equal(url.searchParams.get('page'),'S_cq16_datong');
 assert.equal(url.searchParams.get('mode'),'history');assert.equal(url.searchParams.get('seed'),'17');assert.equal(url.searchParams.get('w'),'cq');
});
test('iframe阻擋或儲存等待後，重載提供原分頁原生連結，不會重載空框架',async()=>{
 const blocked=navigation({blocked:true});blocked.context.ZH.reloadPage();
 assert.equal(blocked.gates.length,1);assert(blocked.gates[0].includes('target="_top"'));assert(blocked.gates[0].includes('page=S_cq16_datong'));
 const pending=navigation({pending:true});pending.context.ZH.reloadPage();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(pending.destinations.length,0);assert.equal(pending.gates.length,1);
 for(const name of fs.readdirSync(path.join(root,'src/legacy')).filter(n=>n.endsWith('.html')))assert(!/\blocation\.reload\s*\(/.test(fs.readFileSync(path.join(root,'src/legacy',name),'utf8')),name);
});
