const {test}=require('node:test'),assert=require('node:assert/strict');
const load=()=>import('../src/village/guidance.js');
test('六館導讀各有探索問題，三座展櫃提供不同觀察角度',async()=>{
 const {HALL_GUIDES}=await load();const {HALLS}=await import('../src/village/world.js');assert.deepEqual(Object.keys(HALL_GUIDES).sort(),HALLS.map(h=>h.id).sort());
 for(const h of HALLS){const g=HALL_GUIDES[h.id];assert.equal(g.title,h.name);for(const k of ['intro','question','reason'])assert(g[k].length>12);assert(Object.isFrozen(g));assert.equal(new Set(Object.values(g.exhibits).map(e=>e.title)).size,3);assert.equal(new Set(Object.values(g.exhibits).map(e=>e.question)).size,3);}
});
test('導覽可由選館走到選課，每次回傳新狀態而不把逛展當課文完成',async()=>{
 const {createGuideState,advanceGuide,guideStep}=await load();let s=createGuideState();const initial=JSON.stringify(s);assert.equal(guideStep(s).index,0);
 s=advanceGuide(s,'start',{hallId:'cq'});assert.equal(s.stage,'walking');assert.equal(guideStep(s).index,0);
 s=advanceGuide(s,'arrive',{hallId:'cq'});assert.equal(guideStep(s).index,1);
 s=advanceGuide(s,'enter',{hallId:'cq'});assert.deepEqual(s.visitedHall,['cq']);assert.equal(guideStep(s).index,2);
 s=advanceGuide(s,'move');assert.equal(s.stage,'inside','室內走動不應退回找館步驟');
 s=advanceGuide(s,'exhibit',{exhibitId:'north'});assert.equal(guideStep(s).index,3);assert.equal(s.viewedExhibits[0],'cq:north');
 s=advanceGuide(s,'select',{chapterId:'S_cq08_weizheng'});const step=guideStep(s);assert.equal(step.index,4);assert(step.completed);assert(step.body.includes('不代替'));assert.equal(JSON.stringify(createGuideState()),initial);
});
test('略過導覽不鎖住探索，重開沿用本次位置與已看的展櫃',async()=>{
 const {createGuideState,advanceGuide,guideStep}=await load();let s=advanceGuide(createGuideState(),'skip');assert.equal(guideStep(s).visible,false);
 s=advanceGuide(s,'enter',{hallId:'zg'});s=advanceGuide(s,'exhibit',{exhibitId:'east'});assert.equal(s.muted,true);assert.equal(s.stage,'exhibit');
 const prior=s;s=advanceGuide(s,'reopen');assert.equal(guideStep(s).visible,true);assert.equal(s.hallId,'zg');assert.equal(s.exhibitId,'east');assert.equal(prior.muted,true);assert.notEqual(s.viewedExhibits,prior.viewedExhibits);
 const reset=advanceGuide(s,'reset');assert.equal(reset.stage,'welcome');assert.equal(reset.visitedHall.length,0);assert.equal(s.visitedHall.length,1);
});
test('未知館、未知展櫃與空白選課不產生假導覽進度，反覆進出不重複計數',async()=>{
 const {createGuideState,advanceGuide}=await load();let s=createGuideState();assert.equal(advanceGuide(s,'enter',{hallId:'fake'}).stage,'welcome');assert.equal(advanceGuide(s,'select',{chapterId:'chapter'}).stage,'welcome');
 s=advanceGuide(s,'enter','cq');s=advanceGuide(s,'enter','cq');assert.deepEqual(s.visitedHall,['cq']);assert.equal(advanceGuide(s,'exhibit',{exhibitId:'fake'}).stage,'inside');assert.equal(advanceGuide(s,'select',{chapterId:' '}).stage,'inside');
 s=advanceGuide(s,'exhibit',{exhibitId:'west'});s=advanceGuide(s,'exhibit',{exhibitId:'west'});assert.deepEqual(s.viewedExhibits,['cq:west']);
});
test('訪客推薦先核對可玩權限，不會因優先推薦篇章而帶往鎖關或舊路由',async()=>{
 const {recommendChapters}=await load();const catalog=[{id:'S_cq08_weizheng',vol:'cq',status:'ready'},{id:'S_cq16_datong',vol:'cq',status:'ready'},{id:'open',vol:'cq',status:'ready'},{id:'legacy',vol:'cq',status:'ready',legacyOnly:true},{id:'planned',vol:'cq',status:'planned'}];
 const calls=[];const result=recommendChapters(catalog,id=>{calls.push(id);return id==='open';},{hallId:'cq'});assert.deepEqual(result,[catalog[2]]);assert(!calls.includes('legacy'));assert(!calls.includes('planned'));assert.equal(catalog.length,5);
 assert.deepEqual(recommendChapters(catalog,()=>true,{hallId:'fake'}),[]);assert.deepEqual(recommendChapters(catalog,()=>{throw Error('連線');}),[]);
});
test('推薦保留原目錄物件，依館篩選且限制數量，無權限函式時保守不推薦',async()=>{
 const {recommendChapters}=await load();const catalog=[{id:'other',vol:'zg',status:'ready'},{id:'S_cq16_datong',vol:'cq',status:'ready'},{id:'S_cq08_weizheng',vol:'cq',status:'ready'}];const result=recommendChapters(catalog,()=>true,{hallId:'cq',limit:1});assert.equal(result[0],catalog[2]);assert.equal(result.length,1);assert.deepEqual(recommendChapters(catalog,null),[]);assert.deepEqual(recommendChapters(catalog,()=>true,{limit:0}),[]);
});

test('離館清除當前館與選課脈絡，保留逛展足跡和略過偏好',async()=>{
 const {createGuideState,advanceGuide,guideStep}=await load();let s=advanceGuide(createGuideState(),'skip');s=advanceGuide(s,'enter',{hallId:'cq'});s=advanceGuide(s,'exhibit',{exhibitId:'north'});s=advanceGuide(s,'select',{chapterId:'S_cq08_weizheng'});const prior=s;s=advanceGuide(s,'leave');assert.equal(s.stage,'welcome');assert.equal(s.hallId,null);assert.equal(s.exhibitId,null);assert.equal(s.chapterId,null);assert.deepEqual(s.visitedHall,['cq']);assert.deepEqual(s.viewedExhibits,['cq:north']);assert.equal(s.muted,true);assert.equal(guideStep(s).visible,false);assert.equal(prior.stage,'complete');
});
test('自由探索時點館名開始帶路不重新開啟小卡，只有說明按鈕明確重開',async()=>{
 const {createGuideState,advanceGuide,guideStep}=await load();let s=advanceGuide(createGuideState(),'skip');s=advanceGuide(s,'start',{hallId:'zg'});assert.equal(s.stage,'walking');assert.equal(s.hallId,'zg');assert.equal(s.muted,true);assert.equal(guideStep(s).visible,false);s=advanceGuide(s,'reopen');assert.equal(guideStep(s).visible,true);assert.equal(s.stage,'walking');assert.equal(s.hallId,'zg');
});

test('展櫃帶路在24／30／60幀及抵達容差下都停在可互動範圍內',async()=>{
 const W=await import('../src/village/world.js');for(const exhibit of W.EXHIBITS)for(const fps of [24,30,60]){
  let position={x:0,z:4.2},points=W.route(position,W.exhibitApproach(exhibit.id),'cq'),steps=0;assert(points.length);
  while(points.length&&steps++<2000){const x=points[0].x-position.x,z=points[0].z-position.z,len=Math.hypot(x,z);if(len<.15){points.shift();continue;}const stride=Math.min(4.8/fps,len);position=W.move(position,{x:x/len*stride,z:z/len*stride},'cq');}
  assert.equal(points.length,0,exhibit.id+' '+fps);assert(Math.hypot(position.x-exhibit.x,position.z-exhibit.z)<2.05,exhibit.id+' '+fps+' 必須顯示互動按鈕');
 }assert.equal(W.exhibitApproach('unknown'),null);
});
