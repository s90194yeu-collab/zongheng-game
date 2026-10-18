// One content source generates the public reading, GAS question drafts and twelve routes.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'src/legacy');
const {version,people}=require('../src/content/zhuzi.cjs');
const suffixes=['lao','zhuang','xun','han','mo','meng'],prefixes=['l','z','x','h','m','n'];
const chapters={},drafts={},catalog=[];
const json=o=>JSON.stringify(o,null,2).replace(/</g,'\\u003c');
const write=(file,value)=>{if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==value)fs.writeFileSync(file,value);};
for(const [pi,p]of people.entries())for(const [li,level]of ['bio','read'].entries()){
 const ep=pi*2+li+1,id='S_zz'+String(ep).padStart(2,'0')+'_'+suffixes[pi]+level;
 let n=0;
 const anchors=[],stages=p[level].map((s,si)=>{
  const questionIds=s.questions.map(question=>{
   n++;const qid=prefixes[pi]+(level==='bio'?'b':'r')+'_'+String(n).padStart(2,'0');
   const correct=(n+pi+li)%4,options={};let wrong=0;
   for(let i=0;i<4;i++)options['ABCD'[i]]=i===correct?[question.good]:[question.bad[wrong++],'情節',question.explanation];
   anchors.push({id:qid,seq:n,kind:'reading',source:s.source,passage:s.passage,stem:question.stem,answer:'ABCD'[correct],options,explanation:question.explanation,followUp:''});return qid;
  });
  const {questions,...publicStage}=s;return {...publicStage,questionIds,gameId:'zz_'+p.key+'_'+level+'_'+(si+1)};
 });
 const name=p.name+'・'+(level==='bio'?'初階人物':'進階思想'),title=level==='bio'?p.bioTitle:p.readTitle;
 const meta={id,vol:'zz',ep,name,episode:title,year:p.year,period:level==='bio'?'史傳與人物':'原典與論證',genre:level==='bio'?'人物劇情RPG＋競技':'思想劇情RPG＋競技',source:[...new Set(stages.map(s=>s.source))].join('、'),guest:false,status:'ready',philosopher:p.key,level,scene:'scene:zhuzi_'+p.key};
 catalog.push(meta);
 chapters[id]={...meta,person:p.name,glyph:p.glyph,school:p.school,color:p.color,intro:p.intro,note:p.note,stages};
 drafts[id]={version,status:'ready',meta,anchors,codex:[
  {type:level==='bio'?'person':'text',id:'zz_'+p.key+'_'+level,name:level==='bio'?p.name+'的生平傳述':p.name+'思想選讀',glyph:p.glyph,title,text:p.note,quote:stages[0].passage,source:meta.source},
  {type:'treasure',id:'zz_'+p.key+'_'+level+'_notes',name:title+'・研讀札記',glyph:'簡',title:'三段文本與操作回讀',quote:'',text:p.intro+'動作紀錄與首次作答分開呈現。',source:meta.source}
 ]};
 const includes=['Core_js','Data_catalog','Data_codex','Art_kit','Data_zhuzi','Zhuzi_models','Adventure_models','Adventure_canvas','Zhuzi_js'].map(x=>"<?!= include('"+x+"') ?>").join('\n');
 write(path.join(dir,id+'.html'),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><base target="_top"><title>${name}｜Re:縱橫鼎業</title>
<script>window.ZH_BOOT={appUrl:<?!= JSON.stringify(appUrl) ?>,page:<?!= JSON.stringify(page) ?>,params:<?!= params ?>,version:<?!= JSON.stringify(version) ?>,user:<?!= userJson ?>,guestScenarios:<?!= guestScenariosJson ?>};</script>
<?!= include('Core_css') ?><?!= include('Zhuzi_css') ?></head><body class="zhuzi-page"><main id="zhuzi-root"></main>
${includes}
<script>ZH.ready(()=>ZH.zhuzi.start({id:${JSON.stringify(id)},anchorOrder:${JSON.stringify(anchors.map(a=>a.id))}}));</script></body></html>\n`);
}
Object.values(chapters).forEach(require('../src/content/adventure.cjs').enrich);
write(path.join(dir,'Data_zhuzi.html'),'<script>window.ZH.ZHUZI='+json({version,chapters})+';\nObject.values(ZH.ZHUZI.chapters).forEach(c=>{ZH.LEARNING_TEXTS[c.id]={titles:[...new Set(c.stages.map(s=>s.source))]};});</script>\n');
write(path.join(dir,'Zhuzi_data.gs'),'/** 先秦諸子 '+version+'; generated from src/content/zhuzi.cjs. No sheet import required. */\nvar SCENARIO_DATA=SCENARIO_DATA||{};\nObject.assign(SCENARIO_DATA,'+json(drafts)+');\n');
const catFile=path.join(dir,'Data_catalog.html');let cat=fs.readFileSync(catFile,'utf8');
const catalogBlock='  /* ZHUZI_CATALOG_START */\n  ZH.VOLUMES.push({key:"zz",no:"諸子篇",name:"先秦諸子",span:"初階人物・進階思想",tagline:"走進人物的時代，讀懂思想的理由"});\n  ZH.CATALOG.push(...'+json(catalog)+');\n  ZH.LEARNING_TEXTS=ZH.LEARNING_TEXTS||{};ZH.CATALOG.filter(s=>s.vol==="zz").forEach(s=>{ZH.LEARNING_TEXTS[s.id]={titles:s.source.split("、")};});\n  /* ZHUZI_CATALOG_END */';
cat=cat.includes('/* ZHUZI_CATALOG_START */')?cat.replace(/[ \t]*\/\* ZHUZI_CATALOG_START \*\/[\s\S]*?\/\* ZHUZI_CATALOG_END \*\//,catalogBlock):cat.replace('  /** 依代碼找劇本 */',catalogBlock+'\n\n  /** 依代碼找劇本 */');
cat=cat.replace(/\n{3,}/g,'\n\n');
cat=cat.replace("ZH.episodeLabel = s => (s.ep === 0", "ZH.episodeLabel = s => s.vol === 'zz' ? (s.level === 'bio' ? '初階・人物' : '進階・思想') : (s.ep === 0");
write(catFile,cat);
const assetsFile=path.join(dir,'Data_assets.html'),assetsRaw=fs.readFileSync(assetsFile,'utf8');
const assets=JSON.parse(assetsRaw.split('/* ASSET_MANIFEST_START */')[1].split('/* ASSET_MANIFEST_END */')[0]);
for(const p of people)assets.entries['scene:zhuzi_'+p.key]={file:'scene_zhuzi_'+p.key+'_ai.webp',kind:'scene',label:p.name+'・先秦諸子場景',focusX:.5,focusY:.5};
assets.version='1.4.0';
write(assetsFile,assetsRaw.replace(/\/\* ASSET_MANIFEST_START \*\/[\s\S]*?\/\* ASSET_MANIFEST_END \*\//,'/* ASSET_MANIFEST_START */\n'+json(assets)+'\n/* ASSET_MANIFEST_END */').replace('Data_assets v1.3.0：202 件素材；沿用既有 v1.2.0 資料夾並追加 6 張。','Data_assets v1.4.0：208 件素材；追加六位先秦諸子 AI 場景。'));
module.exports={chapters,drafts,catalog};
