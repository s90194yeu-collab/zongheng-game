const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
if(!fs.existsSync(path.join(dist,'release.json')))require('../scripts/build.cjs');
const {release}=JSON.parse(fs.readFileSync(path.join(dist,'release.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'releases',release,'manifest.json'),'utf8'));
function bridge(){
 const props=new Map(),cache=new Map(),requests=[];let who='student1@gm.nssh.ntpc.edu.tw';
 const output=s=>({getContent:()=>s,setTitle(){return this;},addMetaTag(){return this;},setXFrameOptionsMode(){return this;}});
 const e={PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v),setProperties:obj=>Object.entries(obj).forEach(([k,v])=>props.set(k,v))})},CacheService:{getScriptCache:()=>({get:k=>cache.get(k)||null,put:(k,v)=>cache.set(k,v)})},
 Utilities:{DigestAlgorithm:{SHA_256:1},Charset:{UTF_8:1},computeDigest:(algo,text)=>[...crypto.createHash('sha256').update(text).digest()],newBlob:text=>({getBytes:()=>Buffer.from(text)})},
 UrlFetchApp:{fetch(url){requests.push(url);const p=new URL(url).pathname.replace('/zongheng-game/',''),file=path.resolve(dist,p);assert(file.startsWith(dist+'/'));return {getResponseCode:()=>fs.existsSync(file)?200:404,getContentText:()=>fs.existsSync(file)?fs.readFileSync(file,'utf8'):''};}},
 HtmlService:{XFrameOptionsMode:{ALLOWALL:'x'},createHtmlOutput:output,createTemplateFromFile:()=>({evaluate:()=>output('LEGACY-FALLBACK')})},Logger:{log(){}},
 };
 vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(root,'gas/Code.gs'),'utf8'),e);vm.runInContext(fs.readFileSync(path.join(root,'gas/GitHubBridge.gs'),'utf8'),e);
 e.getAppUrl_=()=> 'https://script.google.com/macros/s/test/exec';e.getLoginUrl_=()=>'/login';e.getCurrentUser_=()=>({email:who,isSchool:!!who,isGuest:!who,isTeacher:false});e.getConfig_=()=>({allow_guest:'TRUE'});
 return {e,cache,props,requests,user:value=>who=value};
}
test('完整40話與六個平台頁面、每份內容完整可驗證',()=>{
 assert.equal(manifest.chapterCount,40);assert.equal(Object.keys(manifest.pages).length,46);assert.equal(manifest.mediaCount,202);assert.equal(manifest.musicCount,7);
 for(const [name,entry]of Object.entries(manifest.pages)){
  const html=fs.readFileSync(path.join(dist,'releases',release,entry.file),'utf8');
  assert.equal(crypto.createHash('sha256').update(html).digest('hex'),entry.sha256,name);
  assert.equal(html.split('<!--ZH_SERVER_BOOT-->').length,2,name);assert(!html.includes('<?'),name);
  for(const match of html.matchAll(/(?:src|href)="https:\/\/s90194yeu-collab\.github\.io\/zongheng-game\/(assets\/[^"?]+)"/g))assert(fs.existsSync(path.join(dist,match[1])),name+' missing '+match[1]);
 }
});
test('GitHub啟用前仍走原GAS，啟用後讀46頁共用畫面，沒有搬學生資料',()=>{
 const q=bridge();assert.equal(q.e.doGet({parameter:{page:'hub'}}).getContent(),'LEGACY-FALLBACK');
 const result=q.e.installGitHubFrontend_();assert.equal(result.chapters,40);assert.equal(result.pages,46);assert.equal(q.props.get('GITHUB_FRONTEND_ENABLED'),'TRUE');
 assert.equal(q.requests.length,48);assert(q.requests.every(url=>url.startsWith('https://s90194yeu-collab.github.io/zongheng-game/')));
 const html=q.e.doGet({parameter:{page:'hub'}}).getContent();assert(html.includes('student1@gm.nssh.ntpc.edu.tw'));
});
test('共用快取不含身分，第二位學生只取得自己的資料',()=>{
 const q=bridge();q.e.installGitHubFrontend_();q.e.doGet({parameter:{page:'hub',secret:'first-person'}});const calls=q.requests.length;
 q.user('student2@gm.nssh.ntpc.edu.tw');const html=q.e.doGet({parameter:{page:'hub'}}).getContent();assert(!html.includes('student1@'));assert(!html.includes('first-person'));assert(html.includes('student2@'));assert.equal(q.requests.length,calls);
 for(const content of q.cache.values())assert(!content.includes('student1@')&&!content.includes('student2@')&&!content.includes('first-person'));
});
test('參數跳脫、訪客關卡控管、教師API皆保留原伺服器權限',()=>{
 const q=bridge();q.e.installGitHubFrontend_();const html=q.e.doGet({parameter:{page:'hub',s:'</script><img src=x onerror=alert(1)>'}}).getContent();assert(!html.includes('<img src=x'));assert(html.includes('\\u003c/script\\u003e'));
 q.user('');q.e.buildLockedPage_=()=>({getContent:()=> 'LOCKED'});assert.equal(q.e.doGet({parameter:{page:'S_ch03_julu'}}).getContent(),'LOCKED');
 assert(!q.e.doGet({parameter:{page:'S_ch04_hongmen'}}).getContent().includes('LOCKED'));
 assert.equal(typeof q.e.api_saveGame,'undefined','橋接檔未另開公開寫入端點');
});
test('GitHub失效與內容損壞可回原版，未啟用未完整的更新',()=>{
 const q=bridge();q.e.UrlFetchApp.fetch=()=>({getResponseCode:()=>404});assert.throws(()=>q.e.installGitHubFrontend_());assert(!q.props.has('GITHUB_FRONTEND_ENABLED'));
 q.props.set('GITHUB_FRONTEND_ENABLED','TRUE');assert.equal(q.e.doGet({parameter:{page:'hub'}}).getContent(),'LEGACY-FALLBACK');
 const r=bridge();const fetch=r.e.UrlFetchApp.fetch;r.e.UrlFetchApp.fetch=url=>{const result=fetch(url);return url.endsWith('Hub.html')?{...result,getContentText:()=> 'tampered'}:result;};assert.throws(()=>r.e.installGitHubFrontend_(),/驗證失敗/);
});
test('圖片與配樂改為直接檔案；原始API呼叫介面保留',()=>{
 const codes=fs.readdirSync(path.join(dist,'assets')).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(dist,'assets',f),'utf8'));
 assert(codes.some(c=>c.includes('google.script.run')));assert(codes.some(c=>c.includes('ZH_STATIC_MEDIA')));assert(codes.some(c=>c.includes('music/')&&c.includes('fetch(')));
 assert(!codes.some(c=>c.includes('api_musicTrack')));
});
test('燭之武中央題庫可登記學習歷程，明確資料檔仍優先',()=>{
 const q=bridge();q.e.ANCHOR_DRAFTS={S_cq08_weizheng:[{id:'wz_01'}]};
 assert.equal(q.e.scenarioRegistry_().S_cq08_weizheng.anchors[0].id,'wz_01');
 q.e.SCENARIO_DATA={S_cq08_weizheng:{status:'planned',anchors:[]}};
 assert.equal(q.e.scenarioRegistry_().S_cq08_weizheng.status,'planned');
});
