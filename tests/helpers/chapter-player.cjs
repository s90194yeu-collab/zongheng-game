// 測試用合法操作：只透過公開規則函式前進，不直接填通關或閱讀紀錄。
const assert=require('node:assert/strict'),R=require('../../src/character/model.cjs');
const config=(id,stats)=>({...R.defaults(),skills:R.pilot(id).recommended.slice(),...(stats?{stats}:{} )});
function tick(w,n=1,input={}){for(let i=0;i<n&&w.status==='playing'&&(!w.chapter||w.chapter.phase==='mission');i++)R.step(w,input,.05);return w;}
let allocations;
function plans(){if(allocations)return allocations;allocations=R.NEEDS.map(()=>[]);const people=Array(8).fill(0);function walk(i){if(i===8){const got=R.counts({people});R.NEEDS.forEach((need,d)=>{if(need.every((n,j)=>got[j]>=n))allocations[d].push(people.slice());});return;}for(let j=0;j<5;j++){people[i]=j;walk(i+1);}}walk(0);return allocations;}
function answerStage(w,stage,{wrong=false}={}){
 let first=true;for(const q of R.chapterQuestions(w,stage)){
  const name={evidence:'answerEvidence',reflection:'answerReflection',remedy:'answerRemedy'}[stage];
  if(wrong&&first){assert.equal(R.chapterCommand(w,name,{questionId:q.id,choice:(q.answer+1)%q.choices.length,evidenceId:q.correctEvidence}),false);first=false;}
  if(!w.chapter.answers[stage][q.id]?.correct)assert(R.chapterCommand(w,name,{questionId:q.id,choice:q.answer,evidenceId:q.correctEvidence}),w.notice);
 }return w;
}
function solveMission(w,{optional=false,wait=0,collationError=false}={}){
 assert.equal(w.chapter?.phase,'mission');tick(w,wait);
 if(w.kind==='zhuzi'){require('./zhuzi-character-player.cjs')(R,w);}
 else if(w.kind==='spring'){require('./spring-player.cjs')(R,w);}
 else if(w.kind==='warring'){require('./warring-player.cjs')(R,w);}
 else if(w.kind==='chuhan'){require('./chuhan-player.cjs')(R,w);}
 else if(w.kind==='action'){
  const go=(x,y)=>{R.command(w,'move',{x,y});let guard=0;while(w.status==='playing'&&w.chapter.phase==='mission'&&(Math.abs(w.x-x)>.7||Math.abs(w.y-y)>.3)&&guard++<5000)tick(w);R.command(w,'stop');assert.equal(w.status,'playing',w.notice);};
  const pts=R.coverPoints(w);go(pts[0].x,0);
  for(let i=0;i<pts.length;i++){if(i){const gap=pts[i-1].y+10;go(pts[i-1].x,gap);if(optional&&i===1){go(85,41);assert(R.command(w,'recover'));}go(pts[i].x,gap);}go(pts[i].x,pts[i].y);assert(R.command(w,'deliver'),w.notice);}go(pts[2].x,100);assert(R.command(w,'finish'),w.notice);
 }else if(w.kind==='strategy'){
  while(w.day<4&&w.chapter.phase==='mission'){const need=R.needs(w),d=R.NEEDS.findIndex(ns=>JSON.stringify(ns)===JSON.stringify(need)),choice=plans()[d].map(people=>({people,moves:people.filter((x,i)=>x!==w.people[i]).length})).sort((a,b)=>a.moves-b.moves)[0];if(choice.moves>w.orders)assert(R.command(w,'skill','plan'));for(let i=0;i<8;i++)if(w.people[i]!==choice.people[i])assert(R.command(w,'transfer',{person:i,to:choice.people[i]}));tick(w,1);assert(R.command(w,'commit'),w.notice);}
 }else{
  let erred=false;while(w.chapter.phase==='mission'){const t=R.TEXTS[w.page],chars=Array.from(t.original);for(let i=0;i<chars.length;i++)if(w.draft[i]!==chars[i]){assert(R.command(w,'probe',i));tick(w,25);assert(R.command(w,'select',i));if(collationError&&!erred){assert(!R.command(w,'patch',t.choices.find(x=>x!==chars[i])));erred=true;}assert(R.command(w,'patch',chars[i]),w.notice);}assert(R.command(w,'reason',t.reason));assert(R.command(w,'check'),w.notice);}
 }assert.equal(w.chapter.phase,'reflection');assert.equal(w.status,'playing');return w;
}
function complete(id,options={}){const w=R.createChapter(id,options.config||config(id),{nickname:'合法操作測試'},options.seed||1,{route:options.route});answerStage(w,'evidence',{wrong:options.wrongEvidence});assert(R.chapterCommand(w,'startMission'));solveMission(w,options);answerStage(w,'reflection',{wrong:options.wrongReflection});assert(R.chapterCommand(w,'finishReflection'));if(w.chapter.phase==='remedy'){answerStage(w,'remedy');assert(R.chapterCommand(w,'finishRemedy'));}assert.equal(w.status,'won');assert.equal(w.chapter.phase,'done');return w;}
module.exports={R,config,tick,answerStage,solveMission,complete};
