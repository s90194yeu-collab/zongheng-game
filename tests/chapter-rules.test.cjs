const {test}=require('node:test'),assert=require('node:assert/strict');
const {R,config,tick,answerStage,solveMission,complete}=require('./helpers/chapter-player.cjs');
const ids=R.PILOTS.map(p=>p.id),clone=x=>JSON.parse(JSON.stringify(x));
test('三篇章內證據先行，閱讀期間不計操作時間或接受能力指令',()=>{
 for(const id of ids){const w=R.createChapter(id,config(id));assert.equal(w.chapter.phase,'evidence');assert(!R.command(w,'skill',w.snapshot.config.skills[0]));assert(!R.chapterCommand(w,'startMission'));R.step(w,{},99);assert.equal(w.time,0);assert.deepEqual(R.restore(clone(w)),w);answerStage(w,'evidence');assert(R.chapterCommand(w,'startMission'));tick(w,2);assert(w.time>0);assert.doesNotThrow(()=>R.restore(w));}
});
test('每篇全部路線、三種配點與三個種子皆可合法完成並續存',()=>{
 const stats=[R.defaults().stats,{agility:4,strength:4,dexterity:1,focus:1,insight:1,planning:1},{agility:0,strength:0,dexterity:4,focus:4,insight:4,planning:0}];
 for(const id of ids)for(const route of R.chapterRoutes(id))for(const s of stats)for(const seed of [1,15,29]){const w=complete(id,{config:config(id,s),route:route.id,seed});assert.deepEqual(R.restore(clone(w)),w);assert.equal(R.chapterReport(w).reading.firstCorrect,4);assert.equal(R.chapterReport(w).record.readingTotal,4);assert(R.score(w)>0);}
});
test('章內首答保留錯誤，訂正後仍須不同補救題，能力不能替代原文判斷',()=>{
 for(const id of ids){const w=R.createChapter(id,config(id));answerStage(w,'evidence',{wrong:true});assert.equal(w.chapter.history.filter(x=>!x.correct).length,1);assert(R.chapterCommand(w,'startMission'));solveMission(w);const at=w.time;answerStage(w,'reflection',{wrong:true});assert(R.chapterCommand(w,'finishReflection'));assert.equal(w.chapter.phase,'remedy');assert(!R.chapterCommand(w,'finishRemedy'));assert(R.chapterQuestions(w,'remedy').length);assert(R.chapterQuestions(w,'remedy').every(q=>!R.CHAPTERS[id].evidence.concat(R.CHAPTERS[id].reflection).some(x=>x.id===q.id)));answerStage(w,'remedy');assert(R.chapterCommand(w,'finishRemedy'));const r=R.chapterReport(w);assert.equal(r.reading.firstCorrect,2);assert.equal(r.reading.correct,4);assert.equal(w.time,at);assert.equal(w.status,'won');assert.doesNotThrow(()=>R.restore(clone(w)));}
});
test('校勘把誤字、論證標籤與未展讀操作分開診斷',()=>{
 const id=ids[2],w=R.createChapter(id,config(id));answerStage(w,'evidence');R.chapterCommand(w,'startMission');const t=R.TEXTS[0],i=Array.from(t.draft).findIndex((x,i)=>x!==Array.from(t.original)[i]);R.command(w,'select',i);assert(!R.command(w,'patch','過'));assert.equal(w.chapter.metrics.unreadPatchAttempts,1);R.command(w,'probe',i);tick(w,25);R.command(w,'patch','功');assert.equal(w.chapter.metrics.patchErrors,1);R.command(w,'patch','過');R.command(w,'reason',2);assert(!R.command(w,'check'));assert.equal(w.chapter.metrics.argumentErrors,1);assert.equal(w.chapter.metrics.patchErrors,1);const r=R.chapterReport(w);assert(r.operation.suggestions.some(s=>s.includes('校字失誤不等同論證不懂')));assert(r.operation.suggestions.some(s=>s.includes('論證')));assert.equal(r.reading.firstCorrect,2);assert.doesNotThrow(()=>R.restore(w));
});
test('動作路線實際改變停靠、速度與代價，繞道目標需親自接近',()=>{
 const id=ids[0],a=R.createChapter(id,config(id),{},1,{route:'shadow'}),b=R.createChapter(id,config(id),{},1,{route:'shelter'});for(const w of [a,b]){answerStage(w,'evidence');R.chapterCommand(w,'startMission');}assert.notDeepEqual(R.coverPoints(a),R.coverPoints(b));tick(a,20,{right:true});tick(b,20,{right:true});assert(a.x>b.x);assert(a.grip<b.grip);assert(!R.command(a,'recover'));assert(!a.chapter.optional.seal);const w=complete(id,{route:'shadow',optional:true});assert(w.chapter.optional.seal);assert(R.chapterReport(w).challenge.objectives.find(o=>o.id==='seal').done);
});
test('校字通過與原文證據都不能偽裝整章完成；章內字段有嚴格還原核對',()=>{
 for(const id of ids){const w=R.createChapter(id,config(id));for(const mutate of [x=>x.status='won',x=>x.chapter.phase='done',x=>x.chapter.answers.evidence.fake={correct:true},x=>x.chapter.history.push({stage:'evidence',questionId:'fake',choice:0,evidenceId:'fake',correct:true}),x=>x.chapter.missionResult={time:0,score:100,quality:100},x=>x.chapter.metrics.transfers=-1,x=>x.chapter.optional.seal=true]){const bad=clone(w);mutate(bad);assert.throws(()=>R.restore(bad));}}
 const w=R.createChapter(ids[1],config(ids[1]));answerStage(w,'evidence');R.chapterCommand(w,'startMission');solveMission(w);assert.equal(w.status,'playing');const bad=clone(w);bad.chapter.missionResult.score=0;assert.throws(()=>R.restore(bad));
});
test('續玩拒絕路線、歷程、已完任務及操作診斷倒退',()=>{
 const w=R.createChapter(ids[1],config(ids[1])),before=clone(w);answerStage(w,'evidence');assert(R.chapterProgress(before,w));const saved=clone(w);R.chapterCommand(w,'startMission');solveMission(w);assert(R.chapterProgress(saved,w));for(const mutate of [x=>x.chapter.route='rotation',x=>x.chapter.history.shift(),x=>x.chapter.phase='evidence',x=>x.chapter.metrics.transfers=0]){const bad=clone(w);mutate(bad);assert.throws(()=>R.chapterProgress(w,bad));}const next=clone(w);answerStage(next,'reflection');R.chapterCommand(next,'finishReflection');assert(R.chapterProgress(w,next));assert(R.restore(next));
});
test('最佳時間與最佳品質各自保留，不將閱讀訂正累加成分數',()=>{
 const id=ids[2],slow=complete(id,{wait:500,wrongEvidence:true}),fast=complete(id,{collationError:true}),clean=complete(id,{wait:200});let j=R.mergeJournal([],slow,'a');j=R.mergeJournal(j,fast,'b');j=R.mergeJournal(j,clean,'c');j=R.mergeJournal(j,clean,'d');assert.equal(j.length,1);assert.equal(j[0].chapterQuality.quality,100);assert.equal(j[0].chapterQuality.readingTotal,4);assert.equal(j[0].chapterFastest.seconds,R.chapterReport(fast).record.seconds);assert.equal(j[0].chapterBest.score,R.score(clean));assert.equal(j[0].chapterBest.readingFirstCorrect,4);const incomplete=R.createChapter(id,config(id));assert.deepEqual(R.mergeJournal(j,incomplete,'e'),j);
});
