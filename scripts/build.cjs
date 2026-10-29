const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),source=path.join(root,'src/legacy'),dist=path.join(root,'dist'),config=JSON.parse(fs.readFileSync(path.join(root,'project.json'),'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
require('./generate-zhuzi.cjs');
require('./generate-classics.cjs');
require('./generate-a-selections.cjs');
require('./generate-character.cjs');
const raw=name=>fs.readFileSync(path.join(source,name+'.html'),'utf8');
const manifest=JSON.parse(raw('Data_assets').split('/* ASSET_MANIFEST_START */')[1].split('/* ASSET_MANIFEST_END */')[0]);
const fingerprints=fs.readdirSync(source).sort().filter(n=>/\.html$|_data\.gs$|^code\.gs$/.test(n)).map(n=>hash(fs.readFileSync(path.join(source,n))));
for(const dir of ['media','music'])for(const file of fs.readdirSync(path.join(root,'public',dir)).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'public',dir,file))));
for(const file of fs.readdirSync(path.join(root,'src/academy')).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'src/academy',file))));
for(const file of fs.readdirSync(path.join(root,'src/character')).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'src/character',file))));
for(const file of fs.readdirSync(path.join(root,'src/character3d')).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'src/character3d',file))));
fingerprints.push(hash(fs.readFileSync(path.join(root,'public/models/scholar-pilot.glb'))));
for(const file of ['hero-scholar.glb','hero-scholar-mobile.glb'])fingerprints.push(hash(fs.readFileSync(path.join(root,'public/models',file))));
for(const file of ['anime-male.glb','anime-male-mobile.glb','anime-female.glb','anime-female-mobile.glb'])fingerprints.push(hash(fs.readFileSync(path.join(root,'public/models',file))));
for(const file of fs.readdirSync(path.join(root,'src/village')).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'src/village',file))));
for(const file of ['orbit-village.glb','museum-interior.glb','spring-interior.glb'])fingerprints.push(hash(fs.readFileSync(path.join(root,'public/models',file))));
const godotBundle=JSON.parse(fs.readFileSync(path.join(root,'public/godot/release.json'),'utf8'));
fingerprints.push(hash(JSON.stringify(godotBundle)));
for(const file of fs.readdirSync(path.join(root,'src/godot')).sort())fingerprints.push(hash(fs.readFileSync(path.join(root,'src/godot',file))));
const revision=hash(fingerprints.concat(hash(fs.readFileSync(__filename)),hash(fs.readFileSync(path.join(root,'package-lock.json'))),JSON.stringify(config)).join('\n')).slice(0,14);
const release='v4-'+revision,releaseDir=path.join(dist,'releases',release);
fs.mkdirSync(path.join(root,'qa'),{recursive:true});
fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(releaseDir,{recursive:true});fs.mkdirSync(path.join(dist,'assets'),{recursive:true});
fs.cpSync(path.join(root,'public'),dist,{recursive:true});
esbuild.buildSync({entryPoints:[path.join(path.dirname(require.resolve('three')),'three.module.js')],outfile:path.join(dist,'assets/three-r180.min.js'),bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none'});
function academyAsset(label,text){const file='assets/'+label+'-'+hash(text).slice(0,16)+'.'+(label==='academy-data'?'json':label.endsWith('-style')?'css':'js');fs.writeFileSync(path.join(dist,file),text);return file;}
const academyApp=esbuild.buildSync({entryPoints:[path.join(root,'src/academy/app.js')],bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020'}).outputFiles[0].text;
const screenshotApp=esbuild.buildSync({entryPoints:[require.resolve('html2canvas')],bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020'}).outputFiles[0].text;
const gameFiles=['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_classics','Literary_seven','Literary_canvas','Literary_classics_canvas','Literary_seven_canvas','Literary_creative_canvas','Literary_pointer'];
const gameSource='window.ZH_ACADEMY_ENGINE={};\n'+gameFiles.map(n=>raw(n).replace(/<\/?script>/g,'').replaceAll('window.ZH','window.ZH_ACADEMY_ENGINE')).join('\n');
const academyAssets={version:config.version,release,app:academyAsset('academy-app',academyApp),screenshot:academyAsset('academy-screenshot',screenshotApp),css:academyAsset('academy-style',esbuild.transformSync(fs.readFileSync(path.join(root,'src/academy/style.css'),'utf8'),{loader:'css',minify:true}).code),games:academyAsset('academy-games',esbuild.transformSync(gameSource,{minify:true,target:'es2020',charset:'utf8',legalComments:'none'}).code),data:''};
const characterApp=esbuild.buildSync({entryPoints:[path.join(root,'src/character/app.js')],bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020'}).outputFiles[0].text;
const characterAssets={version:config.version,app:academyAsset('character-app',characterApp),css:academyAsset('character-style',esbuild.transformSync(['style.css','warring-style.css','spring-style.css','zhuzi-style.css'].map(f=>fs.readFileSync(path.join(root,'src/character',f),'utf8')).join('\n'),{loader:'css',minify:true}).code)};
// Keep one Three.js module instance for the existing workshop and the GLB pilot.
const character3dSource=fs.readFileSync(path.join(root,'src/character3d/preview.js'),'utf8').replace(/from 'three\/addons\/([^']+)'/g,(_,file)=>'from '+JSON.stringify(require.resolve('three/addons/'+file)));
const character3dApp=esbuild.buildSync({stdin:{contents:character3dSource,resolveDir:path.join(root,'src/character3d'),sourcefile:'preview.js'},bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020',external:['three']}).outputFiles[0].text.replace(/from"three"/g,'from"./three-r180.min.js"');
const character3dModel=fs.readFileSync(path.join(root,'public/models/scholar-pilot.glb'));
const character3dModelFile='models/scholar-pilot-'+hash(character3dModel).slice(0,16)+'.glb';
fs.mkdirSync(path.join(dist,'models'),{recursive:true});fs.writeFileSync(path.join(dist,character3dModelFile),character3dModel);
const character3dAssets={version:1,app:academyAsset('character3d-app',character3dApp),model:character3dModelFile};
for(const [key,name] of Object.entries({hero:'anime-male',heroMobile:'anime-male-mobile',heroFemale:'anime-female',heroFemaleMobile:'anime-female-mobile'})){
 const bytes=fs.readFileSync(path.join(root,'public/models',name+'.glb')),file='models/'+name+'-'+hash(bytes).slice(0,16)+'.glb';
 fs.writeFileSync(path.join(dist,file),bytes);character3dAssets[key]=file;
}
const villageSource=fs.readFileSync(path.join(root,'src/village/app.js'),'utf8').replace(/from 'three\/addons\/([^']+)'/g,(_,file)=>'from '+JSON.stringify(require.resolve('three/addons/'+file)));
const villageApp=esbuild.buildSync({stdin:{contents:villageSource,resolveDir:path.join(root,'src/village'),sourcefile:'app.js'},bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020',external:['three']}).outputFiles[0].text.replace(/from"three"/g,'from"./three-r180.min.js"');
const villageModels={character:character3dModelFile,hero:character3dAssets.heroMobile,heroFemale:character3dAssets.heroFemaleMobile};
for(const [key,name]of Object.entries({exterior:'orbit-village',interior:'museum-interior',springInterior:'spring-interior'})){
 const bytes=fs.readFileSync(path.join(root,'public/models',name+'.glb')),file='models/'+name+'-'+hash(bytes).slice(0,16)+'.glb';fs.writeFileSync(path.join(dist,file),bytes);villageModels[key]=file;
}
const villageAssets={version:1,app:academyAsset('village-app',villageApp),css:academyAsset('village-style',esbuild.transformSync(fs.readFileSync(path.join(root,'src/village/style.css'),'utf8'),{loader:'css',minify:true}).code),assets:villageModels};
const godotApp=esbuild.buildSync({entryPoints:[path.join(root,'src/godot/app.js')],bundle:true,format:'esm',minify:true,charset:'utf8',legalComments:'none',write:false,target:'es2020'}).outputFiles[0].text;
const godotAssets={version:1,entry:godotBundle.entry,app:academyAsset('godot-app',godotApp),css:academyAsset('godot-style',esbuild.transformSync(fs.readFileSync(path.join(root,'src/godot/style.css'),'utf8'),{loader:'css',minify:true}).code)};
const media={},home={};
for(const [id,entry]of Object.entries(manifest.entries)){
 const file=path.join(dist,'media',entry.file);if(!fs.existsSync(file))throw Error('缺少素材：'+entry.file);
 media[id]='media/'+encodeURIComponent(entry.file)+'?v='+hash(fs.readFileSync(file)).slice(0,12);
}
fs.mkdirSync(path.join(dist,'home'),{recursive:true});
for(const m of raw('HubArt').matchAll(/--hub-art-(cq|zg|ch|foreground)\s*:\s*url\("data:image\/webp;base64,([A-Za-z0-9+/=]+)"\)/g)){
 const file=m[1]+'.webp',bytes=Buffer.from(m[2],'base64');fs.writeFileSync(path.join(dist,'home',file),bytes);home[m[1]]='home/'+file+'?v='+hash(bytes).slice(0,12);
}
if(Object.keys(home).length!==4)throw Error('首頁四張插畫不完整');
function read(name){let text=raw(name);
 if(name==='Character3D_boot')text=text.replace('const ASSETS=null; // CHARACTER3D_ASSETS','const ASSETS='+JSON.stringify(character3dAssets)+';');
 if(name==='Village_boot')text=text.replace('const ASSETS=null; // VILLAGE_ASSETS','const ASSETS='+JSON.stringify(villageAssets)+';');
 if(name==='Godot_boot')text=text.replace('const ASSETS=null; // GODOT_ASSETS','const ASSETS='+JSON.stringify(godotAssets)+';');
 if(name==='Studio3D')text=text.replace("const LIB='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js';","const LIB=window.ZH_STATIC_URL('assets/three-r180.min.js');");
 if(name==='Core_js'){
  const start=text.indexOf("      const data = await ZH.call('api_musicTrack', key);"),end=text.indexOf("      return { blob: blob, source: 'server' };",start);
  if(start<0||end<0)throw Error('配樂載入器版本不相符');
  text=text.slice(0,start)+`      const response = await fetch(window.ZH_STATIC_URL('music/'+key+'.m4a'), {credentials:'omit'});
      if (!response.ok) throw new Error('配樂暫時無法讀取');
      const bytes = await response.arrayBuffer(), mime = inspectBytes(bytes);
      if (!mime) throw new Error('音檔格式無法辨識');
      return {blob:new Blob([bytes],{type:mime}),source:'github'};`+text.slice(end+"      return { blob: blob, source: 'server' };".length);
  // 不沿用原 Drive Blob 的磁碟快取，避免遷移後仍讀到舊音檔。
  text=text.replace("const CACHE_REVISION = '20261011-2';","const CACHE_REVISION = 'github-v4';");
  text=text.replace('<script>',`<script>window.ZH_STATIC_URL=function(file){return new URL(file,window.ZH_BOOT.assetBase||${JSON.stringify(config.siteUrl)}).href;};window.ZH_STATIC_MEDIA=${JSON.stringify(media)};window.ZH_STATIC_HOME=${JSON.stringify(home)};`);
 }
 if(name==='Asset_js'){
  text=text.replace(/function get\(id,options\)\{[^\n]*\}/,`function get(id,options){return Promise.resolve(Object.hasOwn(window.ZH_STATIC_MEDIA,id)?window.ZH_STATIC_URL(window.ZH_STATIC_MEDIA[id]):null);}`);
  text=text.replace(/function getHubArt\(key,priority=1\)\{[^\n]*\}/,`function getHubArt(key,priority=1){return Promise.resolve(Object.hasOwn(window.ZH_STATIC_HOME,key)?window.ZH_STATIC_URL(window.ZH_STATIC_HOME[key]):null);}`);
 }
 if(name==='Core_js')text+='\n'+raw('Teacher_preview')+'\n<script>window.ZH_ACADEMY_ASSETS='+JSON.stringify(academyAssets)+';</script>\n'+raw('Academy_boot');
 if(name==='Core_js')text+='\n<script>window.ZH_CHARACTER_ASSETS='+JSON.stringify(characterAssets)+';</script>\n'+raw('Character_boot');
 return text;
}
function environment(){
 const output=content=>({getContent:()=>content,setTitle(){return this;},addMetaTag(){return this;},setXFrameOptionsMode(){return this;}});
 const e={HtmlService:{XFrameOptionsMode:{ALLOWALL:'all'},createHtmlOutput:output,createHtmlOutputFromFile:n=>output(read(n)),createTemplateFromFile:n=>{
  const template={evaluate(){return output(read(n).replace(/<\?!=([\s\S]*?)\?>/g,(_,expr)=>vm.runInNewContext(expr,{...template,include:e.include,includeOptional_:e.includeOptional_})));}};return template;
 }}};
 vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(source,'code.gs'),'utf8'),e);
 e.getCurrentUser_=()=>({email:'',isSchool:true,isGuest:false,isTeacher:false});e.getAppUrl_=()=>'';e.getLoginUrl_=()=>'';e.getConfig_=()=>({allow_guest:'TRUE'});
 for(const f of fs.readdirSync(source).filter(f=>/_data\.gs$/.test(f)))vm.runInContext(fs.readFileSync(path.join(source,f),'utf8'),e);
 return e;
}
function externalize(html){
 // 保持各模組原順序，合併相鄰腳本，減少首次載入的連續往返。
 html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attributes,body)=>/window\.ZH_BOOT\s*=/.test(body)?'<!--ZH_SERVER_BOOT-->':whole);
 html=html.replace(/<\/script>(?:\s|<!--(?:(?!-->)[\s\S])*-->)*<script>/g,';\n');
 html=html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attributes,body)=>{
  if(/\bsrc=|\btype=["'](?:application\/ld\+json|importmap)/i.test(attributes)||!body.trim())return whole;
  if(/window\.ZH_BOOT\s*=/.test(body))return '<!--ZH_SERVER_BOOT-->';
  const result=esbuild.transformSync(body,{minify:true,target:'es2020',charset:'utf8',legalComments:'none',loader:'js'}).code;
  const file='assets/'+hash(result).slice(0,24)+'.js';fs.writeFileSync(path.join(dist,file),result);
  return '<script src="'+config.siteUrl+file+'"'+attributes+'></script>';
 });
 html=html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(_,attrs,css)=>{
  const result=esbuild.transformSync(css,{loader:'css',minify:true,charset:'utf8',legalComments:'none'}).code;
  const file='assets/'+hash(result).slice(0,24)+'.css';fs.writeFileSync(path.join(dist,file),result);
  return '<link rel="stylesheet" href="'+config.siteUrl+file+'">';
 });
 if(!/<meta[^>]*name=["']viewport/.test(html))html=html.replace('<head>','<head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">');
 if(!/<title>/i.test(html))html=html.replace('</head>','<title>Re:縱橫鼎業</title></head>');
 html=html.replace(/<!--[\s\S]*?-->/g,comment=>comment==='<!--ZH_SERVER_BOOT-->'?comment:'');
 if(html.split('<!--ZH_SERVER_BOOT-->').length!==2||html.includes('<?'))throw Error('頁面樣板未完整轉換');
 return html;
}
const e=environment(),catalogModel={window:{ZH:{}}};vm.createContext(catalogModel);
for(const m of e.include('Data_catalog').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],catalogModel);
const chapters=catalogModel.window.ZH.CATALOG.filter(s=>s.status==='ready');if(chapters.length!==90)throw Error('正式與舊存檔路由應為90關，實際'+chapters.length);
const central=JSON.parse(fs.readFileSync(path.join(root,'src/central-anchors.json'),'utf8')),registry=e.scenarioRegistry_();
const localAnchors={};
for(const s of chapters)localAnchors[s.id]=(registry[s.id]?.anchors||central[s.id]||[]).map(a=>({...a,scenarioId:s.id,options:Object.entries(a.options||{}).map(([key,v])=>({key,text:v[0],type:v[1]||'',fork:v[2]||''}))}));
const studyChapters={...require('./generate-zhuzi.cjs').chapters,...require('./generate-classics.cjs').chapters,...require('./generate-a-selections.cjs').chapters};
const activityEnv={window:{}};vm.createContext(activityEnv);vm.runInContext(raw('Textplay_data').replace(/<\/?script>/g,''),activityEnv);
academyAssets.data=academyAsset('academy-data',JSON.stringify(require('../src/academy/content.cjs').makeData(chapters,studyChapters,localAnchors,activityEnv.window.ZH_TEXTPLAY.activities)));
fs.writeFileSync(path.join(root,'qa/anchors.json'),JSON.stringify(localAnchors));
const routes={Hub:'hub',Profile:'profile',Gallery:'gallery',Map:'map',Result:'result',Teacher:'teacher',...Object.fromEntries(chapters.map(s=>[s.id,s.id]))};
const pages={};fs.mkdirSync(path.join(releaseDir,'pages'),{recursive:true});
for(const [name,page]of Object.entries(routes)){
 e.INCLUDED_={};const html=externalize(e.doGet({parameter:{page}}).getContent());
 const file='pages/'+name+'.html';fs.writeFileSync(path.join(releaseDir,file),html);
 pages[name]={file,sha256:hash(html),bytes:Buffer.byteLength(html)};
}
const result={release,version:config.version,character3d:character3dAssets,village:villageAssets,godotVillage:{...godotAssets,engine:godotBundle.engine,estimatedTransferBytes:godotBundle.estimatedTransferBytes,files:godotBundle.files},chapterCount:chapters.length,activeChapterCount:chapters.filter(c=>!c.legacyOnly).length,mediaCount:Object.keys(media).length,homeCount:4,musicCount:7,pages};
fs.writeFileSync(path.join(releaseDir,'manifest.json'),JSON.stringify(result,null,2));
fs.writeFileSync(path.join(dist,'release.json'),JSON.stringify({release,manifest:'releases/'+release+'/manifest.json'},null,2));
fs.writeFileSync(path.join(dist,'.nojekyll'),'');
// 保存已發布的共用檔與空殼；新版本發布期間，既有 GAS 釘選版本仍讀得到。
fs.cpSync(path.join(dist,'assets'),path.join(root,'public/assets'),{recursive:true});
fs.cpSync(path.join(dist,'models'),path.join(root,'public/models'),{recursive:true});
fs.cpSync(releaseDir,path.join(root,'public/releases',release),{recursive:true});
// 公開入口只提供進入學校遊戲的連結；不接觸學生資料或私密設定。
fs.writeFileSync(path.join(dist,'index.html'),`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Re:縱橫鼎業</title><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:linear-gradient(#111b30aa,#111b30ee),url('home/cq.webp') center/cover;color:#f5e8c6;font:18px/1.8 "PingFang TC",sans-serif}main{max-width:780px;padding:36px}h1{font-size:clamp(32px,6vw,58px)}a{display:inline-block;background:#e4bd5e;color:#202a32;border-radius:10px;padding:12px 28px;text-decoration:none;font-weight:700}p{max-width:640px}.sub{color:#ebce8d}</style><main><h1>Re:縱橫鼎業</h1><p class="sub">〜轉生成 Lv.1 亂世策士的我，只能靠《古文觀止》問鼎天下〜</p><p>春秋、戰國、楚漢四十話，加上先秦諸子初進階冒險，古文十五篇，以及經典著作二十三篇。</p><a href="${config.gasUrl}" target="_self">進入遊戲</a><p>使用學校 Google 帳號保存進度；訪客可遊玩四篇課綱選文。學生資料由原本的 Google 試算表保存。</p></main></html>`);
if(!process.argv.includes('--no-pin')){const bridge=path.join(root,'gas/GitHubBridge.gs');let bridgeSource=fs.readFileSync(bridge,'utf8');bridgeSource=bridgeSource.replace(/const GH_RELEASE_DEFAULT_ = '[^']*';/,`const GH_RELEASE_DEFAULT_ = '${release}';`);fs.writeFileSync(bridge,bridgeSource);}
fs.writeFileSync(path.join(root,'qa/build.json'),JSON.stringify({...result,assets:fs.readdirSync(path.join(dist,'assets')).length,generatedAt:new Date().toISOString()},null,2));
console.log(`已完成 ${chapters.length} 話、${Object.keys(pages).length} 頁、${Object.keys(media).length} 件素材、4 張首頁圖、7 首配樂。版本 ${release}`);
module.exports={root,dist,config,release,result,environment,read};
