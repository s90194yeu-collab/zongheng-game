const {test}=require('node:test'),assert=require('node:assert/strict');
const R=require('../src/character/model.cjs'),harness=require('./helpers/original-character-api.cjs');
const {answerStage,solveMission}=require('./helpers/chapter-player.cjs');
const plain=x=>JSON.parse(JSON.stringify(x)),wire=o=>Array.isArray(o)?o.map(wire):o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,wire(o[k])])):o;
function configured(id){const h=harness(),c={...R.defaults(),skills:R.pilot(id).recommended};assert(h.ctx.api_saveOriginalCharacter(wire(c)).ok);return h;}
function save(h,r){const v=h.ctx.api_saveCharacterAdventure(wire({runId:r.runId,revision:r.revision,world:r.world}));if(v.ok)r.revision=v.revision;return v;}
test('三篇章內API保留本人造型與路線；錯誤選項不取代原局、不得指定其他帳號',()=>{
 for(const p of R.PILOTS){const h=configured(p.id),a=h.ctx,route=R.chapterRoutes(p.id).at(-1).id,r=a.api_startCharacterAdventure(p.id,{chapter:true,route}).run;assert(r,p.id);assert.equal(r.world.chapter.phase,'evidence');assert.equal(r.world.chapter.route,route);assert.equal(r.world.snapshot.identity.nickname,'測試同行者');
  for(const options of [{chapter:true,route:'invented'},{chapter:true,email:'other@school.test'},{chapter:'true'}])assert.equal(a.api_startCharacterAdventure(p.id,options).ok,false);
  assert.equal(a.api_getCharacterAdventure(p.id).run.runId,r.runId);h.user('other@school.test');assert.equal(a.api_getCharacterAdventure(p.id).run,null);assert(!save(h,r).ok);
 }
});
test('章內原文錯答、訂正與同階段存讀保留；GAS欄位重排不丟歷程',()=>{
 for(const p of R.PILOTS){const h=configured(p.id),a=h.ctx,r=plain(a.api_startCharacterAdventure(p.id,{chapter:true}).run),q=R.CHAPTERS[p.id].evidence[0];
  R.chapterCommand(r.world,'answerEvidence',{questionId:q.id,choice:(q.answer+1)%q.choices.length,evidenceId:q.correctEvidence});assert(save(h,r).ok);
  let loaded=plain(a.api_getCharacterAdventure(p.id).run);assert.equal(loaded.world.chapter.history.length,1);assert.equal(loaded.world.chapter.history[0].correct,false);
  R.chapterCommand(loaded.world,'answerEvidence',{questionId:q.id,choice:q.answer,evidenceId:q.correctEvidence});assert(save(h,loaded).ok);
  const current=plain(a.api_getCharacterAdventure(p.id).run);assert.equal(current.world.chapter.history.length,2);assert.equal(current.world.chapter.answers.evidence[q.id].attempts,2);assert.equal(current.world.chapter.answers.evidence[q.id].correct,true);
  const reverted=plain(current);reverted.world=r.world;assert(!save(h,reverted).ok,'不可倒退已保存的作答歷程');assert.equal(a.api_getCharacterAdventure(p.id).run.world.chapter.history.length,2);
 }
});
test('角色章內模式與路線凍結，不能將舊獨立局注入新版流程或移除章內進度',()=>{
 const id=R.PILOTS[0].id,h=configured(id),a=h.ctx,old=plain(a.api_startCharacterAdventure(id).run),injected=plain(old);injected.world=R.createChapter(id,old.world.snapshot.config,old.world.snapshot.identity,old.world.seed);assert(!save(h,injected).ok);assert(!a.api_getCharacterAdventure(id).run.world.chapter);
 const r=plain(a.api_startCharacterAdventure(id,{chapter:true,route:'shadow'}).run),removed=plain(r);delete removed.world.chapter;assert(!save(h,removed).ok);
 const changed=plain(r);changed.world.chapter.route='shelter';assert(!save(h,changed).ok);assert.equal(a.api_getCharacterAdventure(id).run.world.chapter.route,'shadow');
 assert(h.writes.every(n=>['OriginalCharacters','CharacterAdventures'].includes(n)));assert(!h.tables.has('Saves'));assert(!h.tables.has('MiniGameLog'));assert(!h.tables.has('AnchorLog'));
});
test('三篇學校局逐段存讀到補救完成才寫個人最佳，完成重送不累加，原成績表不變',()=>{
 for(const p of R.PILOTS){const h=configured(p.id),a=h.ctx;let r=plain(a.api_startCharacterAdventure(p.id,{chapter:true,route:R.chapterRoutes(p.id)[0].id}).run);
  const checkpoint=()=>{const v=save(h,r);assert(v.ok,v.msg);r=plain(a.api_getCharacterAdventure(p.id).run);assert.doesNotThrow(()=>R.restore(r.world));return v;};
  answerStage(r.world,'evidence',{wrong:true});checkpoint();assert(R.chapterCommand(r.world,'startMission'));checkpoint();
  solveMission(r.world);checkpoint();assert.equal(r.world.chapter.phase,'reflection');assert.equal(a.api_getOriginalCharacter().character.journal.length,0,'操作通過還不能冒充整章完成');
  answerStage(r.world,'reflection',{wrong:true});assert(R.chapterCommand(r.world,'finishReflection'));checkpoint();assert.equal(r.world.chapter.phase,'remedy');
  answerStage(r.world,'remedy');assert(R.chapterCommand(r.world,'finishRemedy'));const v=checkpoint();assert.equal(v.journal.length,1);const j=plain(v.journal[0]);assert.equal(j.chapterBest.readingFirstCorrect,2);assert.equal(j.chapterBest.readingCorrect,4);assert.equal(j.chapterBest.readingTotal,4);assert(j.chapterFastest);assert(j.chapterQuality);assert.equal(j.id,p.id);
  assert(checkpoint().ok);assert.equal(a.api_getOriginalCharacter().character.journal.length,1);
  assert(h.writes.every(n=>['OriginalCharacters','CharacterAdventures'].includes(n)));for(const name of ['Saves','AnchorLog','MiniGameLog','RankLog'])assert(!h.tables.has(name));
 }
});
