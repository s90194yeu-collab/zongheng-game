// 合法操作求解器：搜尋只在複本上呼叫公開命令，最後逐項重播到真實測試局。
// 不寫 done、分數、讀題紀錄或其他通關欄位。
const assert=require('node:assert/strict'),copy=v=>JSON.parse(JSON.stringify(v)),paths={jade:new Map(),twin:new Map(),canal:new Map(),drift:new Map()};
function adjacent(a,b,cols){return Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols))===1;}
function replay(R,w,path){for(const [name,value]of path)assert(R.command(w,name,value),w.id+' '+name+' '+w.notice);}
function pairing(goods,forbidden){
 const banned=new Set(forbidden.map(([a,b])=>[a,b].sort((x,y)=>x-y).join(',')));
 function match(left){if(!left.length)return[];const a=left[0];for(const b of left.slice(1)){if(goods[a]===goods[b]||banned.has([a,b].sort((x,y)=>x-y).join(',')))continue;const tail=match(left.filter(i=>i!==a&&i!==b));if(tail)return[[a,b],...tail];}return null;}
 return match(goods.map((_,i)=>i));
}
function jadePath(board,goal){
 const initial=board.join(''),target=goal.join('');if(paths.jade.has(initial))return paths.jade.get(initial);const queue=[initial],parents=new Map([[initial,null]]);let found;
 for(let cursor=0;cursor<queue.length;cursor++){const key=queue[cursor];if(key===target){found=key;break;}const blank=key.indexOf('0');for(let i=0;i<9;i++)if(adjacent(blank,i,3)){const next=key.split('');[next[blank],next[i]]=[next[i],next[blank]];const value=next.join('');if(!parents.has(value)){parents.set(value,{before:key,index:i});queue.push(value);}}}
 assert(found,'護璧滑塊必須可解');const path=[];while(parents.get(found)){const {before,index}=parents.get(found);path.push(['slide',index]);found=before;}const result=path.reverse();paths.jade.set(initial,result);return result;
}
function twinPath(R,w){
 const cacheKey=JSON.stringify([w.campaign.positions,w.campaign.active,w.campaign.visits,w.campaign.delivered,w.campaign.unlocked]);if(paths.twin.has(cacheKey))return paths.twin.get(cacheKey);
 const key=g=>JSON.stringify([g.positions,g.active,g.visits,g.delivered,g.unlocked,g.opened,g.gates,g.crossed]),queue=[{world:copy(w),path:[]}],seen=new Set([key(w.campaign)]);
 for(let cursor=0;cursor<queue.length&&cursor<120000;cursor++){
  const {world,path}=queue[cursor],g=world.campaign;if(g.done){paths.twin.set(cacheKey,path);return path;}
  for(let agent=0;agent<2;agent++)for(let i=0;i<16;i++)if(adjacent(g.positions[agent],i,4)){
   const trial=copy(world),commands=[];if(trial.campaign.active!==agent){if(!R.command(trial,'selectAgent',agent))continue;commands.push(['selectAgent',agent]);}
   if(!R.command(trial,'walkTwin',i)||trial.status==='lost'||trial.campaign.positions[agent]!==i)continue;commands.push(['walkTwin',i]);const value=key(trial.campaign);if(!seen.has(value)){seen.add(value);queue.push({world:trial,path:path.concat(commands)});}
  }
 }
 throw Error(w.id+' 雙使接應找不到公開命令可達的合作路線');
}
function driftPath(R,w){
 const cacheKey=JSON.stringify([w.seed%12,w.campaign.stage,w.campaign.lane,w.campaign.energy,w.campaign.scrolls,w.campaign.hull,w.snapshot.config.skills.slice().sort(),w.buffs]);if(paths.drift.has(cacheKey))return paths.drift.get(cacheKey);
 const key=g=>JSON.stringify([g.stage,g.lane,g.energy,g.scrolls,g.hull]),queue=[{world:copy(w),path:[]}],seen=new Set([key(w.campaign)]);
 for(let cursor=0;cursor<queue.length&&cursor<30000;cursor++){
  const {world,path}=queue[cursor],g=world.campaign;if(g.done){paths.drift.set(cacheKey,path);return path;}if(g.stage>=8)continue;
  for(const direction of [null,-1,0,1]){
   const trial=copy(world),commands=[];if(direction!==null){if(!R.command(trial,'row',direction))continue;commands.push(['row',direction]);}
   if(!R.command(trial,'drift')||trial.status==='lost')continue;commands.push(['drift']);const value=key(trial.campaign);if(!seen.has(value)){seen.add(value);queue.push({world:trial,path:path.concat(commands)});}
  }
 }
 throw Error(w.id+' 江流護簡沒有可完成的公開路線');
}
function canalPath(R,w){
 const cacheKey=w.campaign.heights.join(',');if(paths.canal.has(cacheKey))return paths.canal.get(cacheKey);
 const C=R.WA,farms=[3,7,11],flow=world=>{const result=C.watered(world);return Array.isArray(result)?result:(result.cells||result.watered||[]);},key=g=>g.heights.join(','),queue=[{world:copy(w),path:[],cost:0}],seen=new Map([[key(w.campaign),0]]);
 for(let cursor=0;queue.length&&cursor<120000;cursor++){
  queue.sort((a,b)=>b.cost-a.cost);const {world,path,cost}=queue.pop(),water=flow(world);if(farms.every(i=>water.includes(i))){paths.canal.set(cacheKey,path);return path;}const reached=new Set(water);
  for(let index=0;index<12;index++)if(!reached.has(index)&&water.some(i=>adjacent(i,index,4))){
   const trial=copy(world),commands=[];let lowered=0;while(!flow(trial).includes(index)&&lowered++<10){if(!R.command(trial,'dig',index))break;commands.push(['dig',index]);}
   if(!flow(trial).includes(index)||!commands.length||trial.status==='lost')continue;const value=key(trial.campaign),nextCost=cost+commands.length;if(seen.has(value)&&seen.get(value)<=nextCost)continue;seen.set(value,nextCost);queue.push({world:trial,path:path.concat(commands),cost:nextCost});
  }
 }
 throw Error(w.id+' 渠床預算內找不到通往三田的水路');
}
module.exports=function solveWarring(R,w){
 const C=R.WA,g=w.campaign,send=(name,value)=>assert(R.command(w,name,value),w.id+' '+name+' '+w.notice);let wait=0;while(C.active(w,'listening')&&w.time<w.buffs.listening-6&&wait++<100)R.step(w,{},.05);
 switch(g.mechanic){
 case 'flood':while(g.round<5&&!g.done){const {inflow,ceilings}=C.floodState(w);let left=inflow;for(let i=0;i<3;i++){const value=Math.min(left,ceilings[i]);send('setGate',{index:i,value});left-=value;}assert.equal(left,0,'閘門容量需足以承接水量');send('release');}break;
 case 'canal':replay(R,w,canalPath(R,w));send('testCanal');break;
 case 'balance':while(g.stage<6&&!g.done){let balance=C.balanceState(w),guard=0;while(![-3,-2,-1,0,1,2,3].some(n=>Math.abs(n+balance.wind)<=balance.tolerance)&&guard++<200){R.step(w,{},.05);balance=C.balanceState(w);}const {wind,tolerance}=balance,target=[-3,-2,-1,0,1,2,3].filter(n=>Math.abs(n+wind)<=tolerance).sort((a,b)=>Math.abs(a-g.lean)-Math.abs(b-g.lean))[0];assert(Number.isInteger(target),'守衡需要可行整數重心');while(g.lean!==target)send('shift',g.lean<target?1:-1);assert(Math.abs(g.lean+wind)<=tolerance,'守衡風勢需有可行站位');send('carry');}break;
 case 'forum':while(g.round<4&&!g.done){while(g.orders>0&&Math.max(...g.queues)>0){const lane=g.queues.indexOf(Math.max(...g.queues));send('dispatch',lane);}send('nextForum');}break;
 case 'ambush':while(g.round<3&&!g.done){const {travel,tolerance}=C.ambushState(w);let delays;for(let a=0;a<=6&&!delays;a++)for(let b=0;b<=6&&!delays;b++)for(let c=0;c<=6;c++){const arrived=travel.map((n,i)=>n+[a,b,c][i]);if(Math.max(...arrived)-Math.min(...arrived)<=tolerance){delays=[a,b,c];break;}}assert(delays,'伏兵應有可同步的延時');for(let i=0;i<3;i++)send('setDelay',{index:i,value:delays[i]});send('spring');}break;
 case 'treaty':while(g.round<3&&!g.done){const {goods,forbidden}=C.treatyState(w),pairs=pairing(goods,forbidden);assert(pairs,'盟約盤應有合法六國匹配');for(const [a,b]of pairs)send('pair',{a,b});send('ratify');}break;
 case 'drift':replay(R,w,driftPath(R,w));break;
 case 'archery':while(g.target<8&&!g.done){const target=C.target(w);send('aim',{x:Math.max(0,Math.min(100,target.x-target.wind-target.motion)),y:target.y});send('fire');}break;
 case 'locks':{const used=new Set();for(let door=0;door<3;door++)for(let column=0;column<3;column++){const colour=(C.keyClues(w)[door]+column)%3,key=g.tokens.findIndex((c,i)=>c===colour&&!used.has(i));assert(key>=0,'三窟鑰匙需有三色各三枚');send('keyPlace',{key,slot:door*3+column});used.add(key);}for(let door=0;door<3;door++)send('unlockDoor',door);break;}
 case 'jade':replay(R,w,jadePath(g.board,C.jadeGoal));break;
 case 'twin':replay(R,w,twinPath(R,w));break;
 case 'measures':while(g.round<3&&!g.done){const {unit,target,cap}=C.measureState(w);let weights;for(let a=0;a<=4&&!weights;a++)for(let b=0;b<=4&&!weights;b++)for(let c=0;c<=4;c++)if(a+b+c<=cap&&a*unit[0]+b*unit[1]+c*unit[2]===target){weights=[a,b,c];break;}assert(weights,'度量衡需有枚數限制內的配重');for(let i=0;i<3;i++)send('setWeight',{index:i,value:weights[i]});send('weigh');}break;
 default:throw Error('Unknown Warring mechanic: '+g.mechanic);
 }
 assert(g.done,w.id+' '+w.notice);return w;
};
