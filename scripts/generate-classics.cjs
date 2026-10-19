const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'src/legacy');
const {version,entries}=require('../src/content/classics.cjs');
const json=o=>JSON.stringify(o,null,2).replace(/</g,'\\u003c');
const write=(f,s)=>{if(!fs.existsSync(f)||fs.readFileSync(f,'utf8')!==s)fs.writeFileSync(f,s);};
const chapters={},drafts={},catalog=[];
for(const e of entries.filter(e=>!e.reuse)){
 let n=0;const anchors=[],stages=e.stages.map((s,si)=>{
  const questionIds=s.questions.map(q=>{
   n++;const id='g'+String(e.no).padStart(2,'0')+'_'+String(n).padStart(2,'0');
   // StoryGuard permits 2–4 lowercase letters for anchor IDs; retain a stable alphabetic prefix.
   const qid='g'+String.fromCharCode(96+e.no)+'_'+String(n).padStart(2,'0');
   const correct=(e.no+n)%4,options={};let wrong=0;for(let i=0;i<4;i++)options['ABCD'[i]]=i===correct?[q.good]:[q.bad[wrong++],'情節',q.explanation];
   let passage=e.fullText[s.paragraph];if(e.key==='qiuran'&&n===6)passage=e.fullText[9];if(e.key==='xiangji'&&si===2&&n===5)passage=e.fullText[4];if(e.key==='laoshan'&&si===0)passage=e.fullText[0]+e.fullText[1];
   anchors.push({id:qid,seq:n,kind:'reading',source:'〈'+e.title+'〉',passage,stem:q.stem,answer:'ABCD'[correct],options,explanation:q.explanation,followUp:''});return qid;
  });const{questions,...publicStage}=s;return {...publicStage,questionIds,gameId:'gw_'+e.key+'_'+(si+1)};
 });
 const meta={id:e.id,vol:'gw',ep:e.no,name:e.title,episode:e.episode,year:0,period:e.period,genre:'劇情RPG＋攻防競技',source:'〈'+e.title+'〉',guest:false,status:'ready',scene:e.scene,study:true,author:e.author};catalog.push(meta);
 chapters[e.id]={...meta,collection:'古文十五篇',studyLabel:'課文情境・原文閱讀',person:e.person,philosopher:e.key,glyph:e.glyph,color:e.color,school:e.author,note:e.note,intro:e.focus,fullText:e.fullText,url:e.url,stages};
 drafts[e.id]={version,status:'ready',meta,anchors,codex:[
  {type:'text',id:'gw_'+e.key,name:e.title,glyph:e.glyph,title:e.author+'・'+e.period,text:e.focus,quote:stages[0].passage,source:meta.source},
  {type:'treasure',id:'gw_'+e.key+'_notes',name:e.title+'・研讀札記',glyph:'簡',title:e.episode,text:e.note,quote:'',source:meta.source}
 ]};
 const includes=['Core_js','Data_catalog','Data_codex','Art_kit','Data_classics','Zhuzi_models','Adventure_models','Adventure_canvas','Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_canvas','Literary_creative_canvas','Literary_pointer','Zhuzi_js'].map(n=>"<?!= include('"+n+"') ?>").join('\n');
 write(path.join(dir,e.id+'.html'),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><base target="_top"><title>${e.title}｜Re:縱橫鼎業</title><script>window.ZH_BOOT={appUrl:<?!= JSON.stringify(appUrl) ?>,page:<?!= JSON.stringify(page) ?>,params:<?!= params ?>,version:<?!= JSON.stringify(version) ?>,user:<?!= userJson ?>,guestScenarios:<?!= guestScenariosJson ?>};</script><?!= include('Core_css') ?><?!= include('Zhuzi_css') ?></head><body class="zhuzi-page"><main id="zhuzi-root"></main>\n${includes}\n<script>ZH.ready(()=>ZH.zhuzi.start({id:${JSON.stringify(e.id)},collection:'classics',anchorOrder:${JSON.stringify(anchors.map(a=>a.id))}}));</script></body></html>\n`);
}
const library=Object.fromEntries(entries.map(e=>[e.id,{id:e.id,title:e.title,author:e.author,period:e.period,url:e.url,fullText:e.fullText,focus:e.focus,reuse:!!e.reuse}]));
Object.values(chapters).forEach(require('../src/content/adventure.cjs').enrich);
Object.values(chapters).forEach(require('../src/content/literary-missions.cjs').enrich);
require('../src/content/game-genres.cjs').apply(chapters,catalog,drafts);
write(path.join(dir,'Data_classics.html'),'<script>window.ZH.CLASSICS='+json({version,chapters,library})+';</script>\n');
write(path.join(dir,'Classics_data.gs'),'/** 古文十五篇；generated from src/content/classics.cjs. Existing four routes keep their IDs and saves. */\nvar SCENARIO_DATA=SCENARIO_DATA||{};\nObject.assign(SCENARIO_DATA,'+json(drafts)+');\n');
const menu=entries.map(e=>({id:e.id,no:e.no,title:e.title,author:e.author,period:e.period,scene:e.scene,reuse:!!e.reuse,focus:e.focus}));
const file=path.join(dir,'Data_catalog.html');let cat=fs.readFileSync(file,'utf8');
const block='  /* CLASSICS_CATALOG_START */\n  ZH.VOLUMES.push({key:"gw",no:"課綱專區",name:"古文十五篇",span:"先秦至臺灣・十五篇齊備",tagline:"循十五篇課文，走進文字中的世界"});\n  ZH.CATALOG.push(...'+json(catalog)+');\n  ZH.CLASSICS_MENU='+json(menu)+';\n  ZH.CLASSICS_MENU.forEach(e=>{const s=ZH.CATALOG.find(s=>s.id===e.id);if(s&&s.vol==="gw")ZH.LEARNING_TEXTS[e.id]={titles:["〈"+e.title+"〉"]};});\n  /* CLASSICS_CATALOG_END */';
cat=cat.includes('/* CLASSICS_CATALOG_START */')?cat.replace(/[ \t]*\/\* CLASSICS_CATALOG_START \*\/[\s\S]*?\/\* CLASSICS_CATALOG_END \*\//,block):cat.replace('  /** 依代碼找劇本 */',block+'\n\n  /** 依代碼找劇本 */');
cat=cat.replace('ZH.scenariosOf = vol => ZH.CATALOG.filter(s => s.vol === vol);','ZH.scenariosOf = vol => vol === "gw" ? ZH.CLASSICS_MENU.map(e=>({...ZH.findScenario(e.id),classicNo:e.no,name:e.title,period:e.period,author:e.author,scene:e.scene,classicReuse:e.reuse,classicTitle:e.title})) : ZH.CATALOG.filter(s => s.vol === vol);');
cat=cat.replace("ZH.episodeLabel = s => s.vol === 'zz' ?", "ZH.episodeLabel = s => (s.classicNo || s.vol === 'gw') ? ('第 '+(s.classicNo||s.ep)+' 篇') : s.vol === 'zz' ?");write(file,cat);
const assetsFile=path.join(dir,'Data_assets.html');let a=fs.readFileSync(assetsFile,'utf8');const assets=JSON.parse(a.split('/* ASSET_MANIFEST_START */')[1].split('/* ASSET_MANIFEST_END */')[0]);
for(const [key,label]of [['peach','桃源山村'],['study','古典書齋'],['moon','江湖月色'],['port','臺灣舊港'],['chrysanthemum','畫菊書室']])assets.entries['scene:classic_'+key]={file:'scene_classic_'+key+'_ai.webp',kind:'scene',label:label+'・古文十五篇',focusX:.5,focusY:.5};
assets.version='1.5.0';write(assetsFile,a.replace(/\/\* ASSET_MANIFEST_START \*\/[\s\S]*?\/\* ASSET_MANIFEST_END \*\//,'/* ASSET_MANIFEST_START */\n'+json(assets)+'\n/* ASSET_MANIFEST_END */'));
module.exports={chapters,drafts,catalog,menu};
