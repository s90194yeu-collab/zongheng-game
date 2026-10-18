const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'src/legacy');
const {version,entries,additional,scope}=require('../src/content/a-selections.cjs');
const json=o=>JSON.stringify(o,null,2).replace(/</g,'\\u003c');
const write=(f,s)=>{if(!fs.existsSync(f)||fs.readFileSync(f,'utf8')!==s)fs.writeFileSync(f,s);};
const chapters={},drafts={},catalog=[];
for(const e of additional){
 const anchors=[];let n=0;
 const stages=e.stages.map((s,si)=>{
  const questionIds=s.questions.map(q=>{
   const id='a'+String.fromCharCode(96+e.no)+'_'+String(++n).padStart(2,'0'),correct=(e.no+n)%4,options={};let wrong=0;
   for(let i=0;i<4;i++)options['ABCD'[i]]=i===correct?[q.good]:[q.bad[wrong++],'情節',q.explanation];
   anchors.push({id,seq:n,kind:'reading',source:'〈'+e.title+'〉'+(e.readerKind==='guide'?'・自編導讀':'選讀'),passage:s.passage,stem:q.stem,answer:'ABCD'[correct],options,explanation:q.explanation,followUp:''});return id;
  });const{questions,...t}=s;return {...t,source:'〈'+e.title+'〉'+(e.readerKind==='guide'?'・自編導讀':''),url:e.url,readerKind:e.readerKind,questionIds,gameId:'al_'+e.key+'_'+(si+1)};
 });
 const meta={id:e.id,vol:'al',ep:e.menuNo,name:e.title,episode:e.episode,year:0,period:e.period,genre:'角色操作＋文本閱讀',source:'〈'+e.title+'〉'+(e.readerKind==='guide'?'・自編導讀':''),guest:false,status:'ready',scene:e.scene,study:true,author:e.author,stageCount:stages.length,readerKind:e.readerKind};catalog.push(meta);
 const readerLabel=e.readerKind==='guide'?'自編導讀':e.readerKind==='selected'?'原文選段':'全篇原文';
 chapters[e.id]={...meta,collection:'A 類選文',studyLabel:e.readerKind==='guide'?'導讀任務・課本對讀':'課文情境・文本閱讀',person:e.person,philosopher:e.key,glyph:e.glyph,color:e.color,school:e.author,note:e.note,intro:e.focus,fullText:e.fullText,url:e.url,readerLabel,editionNote:e.editionNote||'',art:e.art||{hat:'jin',old:false,beard:e.key==='kong'?2:0},stages};
 drafts[e.id]={version,status:'ready',meta,anchors,codex:[{type:'text',id:'al_'+e.key,name:e.title,glyph:e.glyph,title:e.author+'・'+e.period,text:e.focus,quote:e.readerKind==='guide'?'':stages[0].passage,source:meta.source},{type:'treasure',id:'al_'+e.key+'_notes',name:e.title+'・研讀札記',glyph:'簡',title:e.episode,text:e.note,quote:'',source:meta.source}]};
 const includes=['Core_js','Data_catalog','Data_codex','Art_kit','Data_a_selections','Zhuzi_models','Zhuzi_js'].map(n=>"<?!= include('"+n+"') ?>").join('\n');
 write(path.join(dir,e.id+'.html'),`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><base target="_top"><title>${e.title}｜Re:縱橫鼎業</title><script>window.ZH_BOOT={appUrl:<?!= JSON.stringify(appUrl) ?>,page:<?!= JSON.stringify(page) ?>,params:<?!= params ?>,version:<?!= JSON.stringify(version) ?>,user:<?!= userJson ?>,guestScenarios:<?!= guestScenariosJson ?>};</script><?!= include('Core_css') ?><?!= include('Zhuzi_css') ?></head><body class="zhuzi-page"><main id="zhuzi-root"></main>\n${includes}\n<script>ZH.ready(()=>ZH.zhuzi.start({id:${JSON.stringify(e.id)},collection:'aSelections',anchorOrder:${JSON.stringify(anchors.map(a=>a.id))}}));</script></body></html>\n`);
}
const library=Object.fromEntries(entries.map(e=>[e.id,{id:e.id,title:e.title,author:e.author,period:e.period,url:e.url,fullText:e.fullText,focus:e.focus,reuse:!!e.reuse,readerKind:e.readerKind,editionNote:e.editionNote||'',readerLabel:e.readerKind==='guide'?'自編導讀':e.readerKind==='selected'?'原文選段':'原文'}]));
write(path.join(dir,'Data_a_selections.html'),'<script>window.ZH.A_SELECTIONS='+json({version,chapters,library,scope})+';</script>\n');
write(path.join(dir,'ASelections_data.gs'),'/** 龍騰108/109 A類選文；自編教學題，generated from src/content/a-selections.cjs. */\nvar SCENARIO_DATA=SCENARIO_DATA||{};\nObject.assign(SCENARIO_DATA,'+json(drafts)+');\n');
const menu=entries.map(e=>({id:e.id,no:e.menuNo,title:e.title,author:e.author,period:e.period,scene:e.scene,reuse:!!e.reuse,focus:e.focus,readerKind:e.readerKind,aliases:e.aliases||[]}));
const f=path.join(dir,'Data_catalog.html');let cat=fs.readFileSync(f,'utf8');
const block='  /* A_SELECTIONS_CATALOG_START */\n  ZH.VOLUMES.push({key:"al",no:"教材選文",name:"A 類選文",span:"108／109選文表・26篇",tagline:"讀課本，也走進人物的處境"});\n  ZH.CATALOG.push(...'+json(catalog)+');\n  ZH.A_SELECTIONS_MENU='+json(menu)+';\n  ZH.A_SELECTIONS_MENU.filter(e=>!e.reuse).forEach(e=>{ZH.LEARNING_TEXTS[e.id]={titles:["〈"+e.title+"〉"+(e.readerKind==="guide"?"・自編導讀":"")]};});\n  /* A_SELECTIONS_CATALOG_END */';
cat=cat.includes('/* A_SELECTIONS_CATALOG_START */')?cat.replace(/[ \t]*\/\* A_SELECTIONS_CATALOG_START \*\/[\s\S]*?\/\* A_SELECTIONS_CATALOG_END \*\//,block):cat.replace('  /** 依代碼找劇本 */',block+'\n\n  /** 依代碼找劇本 */');
cat=cat.replace(/ZH.scenariosOf = vol =>[^\n]+/, 'ZH.scenariosOf = vol => ["gw","al"].includes(vol) ? (vol==="al"?ZH.A_SELECTIONS_MENU:ZH.CLASSICS_MENU).map(e=>({...ZH.findScenario(e.id),classicNo:e.no,name:e.title,episode:e.focus,period:e.period,author:e.author,scene:e.scene,classicReuse:e.reuse,classicTitle:e.title,readerKind:e.readerKind})) : ZH.CATALOG.filter(s => s.vol === vol);');
cat=cat.replace("s.vol === 'gw')","['gw','al'].includes(s.vol))");write(f,cat);
const af=path.join(dir,'Data_assets.html');let a=fs.readFileSync(af,'utf8'),assets=JSON.parse(a.split('/* ASSET_MANIFEST_START */')[1].split('/* ASSET_MANIFEST_END */')[0]);
for(const[key,label]of [['street','街市與酒店'],['theatre','戲臺後場'],['hairroom','家屋與記憶']])assets.entries['scene:a_'+key]={file:'scene_a_'+key+'_ai.webp',kind:'scene',label:label+'・A類選文',focusX:.5,focusY:.5};
assets.version='1.6.0';write(af,a.replace(/\/\* ASSET_MANIFEST_START \*\/[\s\S]*?\/\* ASSET_MANIFEST_END \*\//,'/* ASSET_MANIFEST_START */\n'+json(assets)+'\n/* ASSET_MANIFEST_END */'));
module.exports={chapters,drafts,catalog,menu,library};
