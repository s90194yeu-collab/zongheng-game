/** 歷屆／示範資料管理。SIM_批次為合成資料，不能標成歷屆實測。
 * 編輯器可執行 archiveUseRealDataOnly／archiveIncludeSyntheticDemo。
 * 只影響教師唯讀分析；學生、排行榜、正式同步及成績匯出均使用原始資料。
 */
const ARCHIVE_BATCH_='SIM-GW-20261027-V1';
const ARCHIVE_COHORT_='國文增廣';
const ARCHIVE_MODE_KEY_='TEACHER_ARCHIVE_DATA_MODE';
const ARCHIVE_SCENARIOS_=['S_cq08_weizheng','S_zg09_mengchang'];
const ARCHIVE_TABLES_=['Users','ScenarioLog','AnchorLog','MiniGameLog','Codex','Reflection','AnchorBank'];

function archiveUseRealDataOnly(){return archiveSetMode_('actual');}
function archiveIncludeSyntheticDemo(){return archiveSetMode_('combined');}
function archiveCheckDataMode(){githubRequireSetupUser_();const r=archiveTeacherContext_();console.log(JSON.stringify(r.info));return r.info;}
function archiveSetMode_(mode){
 githubRequireSetupUser_();
 if(!['actual','combined'].includes(mode))throw Error('不支援的資料模式。');
 if(mode==='combined'){archiveMeta_();archiveReadRows_('Users');}
 PropertiesService.getScriptProperties().setProperty(ARCHIVE_MODE_KEY_,mode);
 const r={ok:true,mode:mode,label:mode==='actual'?'只統計真實資料':'合併90位合成示範資料（非實測成效）'};
 console.log(JSON.stringify(r));return r;
}
function archiveMeta_(){
 const sh=getSS_().getSheetByName('SIM_Meta');if(!sh||sh.getLastRow()<2)throw Error('示範資料尚未匯入完成。');
 const rows=sh.getRange(2,1,sh.getLastRow()-1,5).getValues(),map={};
 rows.forEach(r=>{if(r[2]!==true||r[3]!==ARCHIVE_BATCH_||r[4]!==ARCHIVE_COHORT_)throw Error('合成資料來源標記不一致，已停止讀取。');map[String(r[0])]=r[1];});
 if(map.batchId!==ARCHIVE_BATCH_||Number(map.students)!==90||map.isSimulated!==true)throw Error('示範資料批次或人數無法核對。');return map;
}
function archiveReadRows_(name,cols){
 if(!Object.prototype.hasOwnProperty.call(SHEETS,name)||!ARCHIVE_TABLES_.includes(name))throw Error('不支援的示範資料表。');
 const sh=getSS_().getSheetByName('SIM_'+name),length=SHEETS[name].length;if(!sh||sh.getLastRow()<2)throw Error('示範資料表尚未就緒：'+name);
 const header=sh.getRange(1,1,1,length+3).getValues()[0],expected=SHEETS[name].concat(['isSimulated','simulationBatchId','cohort']);
 if(JSON.stringify(header)!==JSON.stringify(expected))throw Error('示範資料欄位不相符：'+name);
 const rows=sh.getRange(2,1,sh.getLastRow()-1,length+3).getValues();
 rows.forEach(r=>{if(r[length]!==true||r[length+1]!==ARCHIVE_BATCH_||r[length+2]!==ARCHIVE_COHORT_)throw Error('發現未標示的合成紀錄，已停止讀取。');});
 if(name==='Users'&&(rows.length!==90||new Set(rows.map(r=>String(r[0]))).size!==90||rows.some(r=>!/^nss(00[1-9]|0[1-8]\d|090)$/.test(String(r[0])))))throw Error('示範學生人數或匿名代碼無法核對。');
 return rows.map(r=>r.slice(0,cols||length));
}
/** 每次教師請求固定來源，避免切換後詳情或反思混入另一種資料。 */
function archiveTeacherContext_(requested){
 const mode=requested||PropertiesService.getScriptProperties().getProperty(ARCHIVE_MODE_KEY_)||'actual';
 if(!['actual','combined','simulation'].includes(mode))throw Error('資料模式無效。');
 if(mode==='actual')return{mode:mode,options:undefined,readRows:readRows_,info:{kind:'actual',mode:mode,label:'正式學生資料',includesSynthetic:false}};
 const meta=archiveMeta_(),actualCache={},demoCache={};
 const real=name=>actualCache[name]||(actualCache[name]=readRows_(name));
 const demo=name=>demoCache[name]||(demoCache[name]=archiveReadRows_(name));
 const demoIds=new Set(demo('Users').map(r=>String(r[0])));
 if(mode==='combined'&&real('Users').some(r=>demoIds.has(lower_(r[0]))))throw Error('匿名示範代碼與正式帳號重複，已停止合併。');
 const reader=(name,cols)=>{
  let rows;
  if(mode==='simulation')rows=demo(name);
  else if(name==='AnchorBank'){
   rows=real(name).slice();const ids=new Set(rows.map(r=>String(r[0])));
   demo(name).forEach(r=>{if(!ids.has(String(r[0]))){rows.push(r);ids.add(String(r[0]));}});
  }else rows=real(name).concat(demo(name));
  return cols?rows.map(r=>r.slice(0,cols)):rows;
 };
 const options={readRows:reader,classify:(email,seat,teachers)=>demoIds.has(email)?ARCHIVE_COHORT_:classOf_(email,seat,teachers)};
 if(mode==='simulation'){
  const cfg=JSON.parse(JSON.stringify(teacherConfig_()));cfg.required=ARCHIVE_SCENARIOS_.slice();options.config=cfg;
  options.days=Array.from({length:14},(_,i)=>new Date(Date.UTC(2026,9,14+i)).toISOString().slice(0,10));
 }
 return{mode:mode,readRows:reader,options:options,info:{kind:mode==='combined'?'mixed':'synthetic',mode:mode,label:mode==='combined'?'含90位合成示範資料（非實測成效）':'90位合成示範資料（非實測成效）',includesSynthetic:true,syntheticStudents:90,cohort:ARCHIVE_COHORT_,batchId:ARCHIVE_BATCH_,simulationPeriod:String(meta.simulationPeriod||''),warning:'合成示範資料，不代表真實學生、歷屆實測或實際學習成效。'}};
}
