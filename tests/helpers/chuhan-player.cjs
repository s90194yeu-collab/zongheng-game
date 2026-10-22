const assert=require('node:assert/strict');
module.exports=function solveChuhan(R,w){
 const C=R.CH,g=w.campaign,send=(name,value)=>assert(R.command(w,name,value),w.id+' '+name+' '+w.notice),wait=predicate=>{let i=0;while(!predicate()&&w.status==='playing'&&i++<300)R.step(w,{},.05);assert(predicate(),w.notice);};
 switch(g.mechanic){
 case 'seal':for(let i=0;i<4;i++)while(g.tiles[i]!==g.target[i])send('rotate',i);send('verify');break;
 case 'jump':while(g.stage<6){wait(()=>C.gate(w,g.stage).open);send('jump',[0,1,2].find(i=>i!==C.jumpBlocked(w)));R.step(w,{},.05);}break;
 case 'ferry':for(const trip of [[0,1],[2,3],[4,5]]){for(const i of trip)send('load',i);send('sail');}break;
 case 'relay':for(const i of [1,3,5]){wait(()=>C.gate(w,i).open&&w.time-g.lastMove>=1);send('relay',i);}break;
 case 'paths':for(const i of [1,2,3])send('path',i);send('commitPath');for(const i of [4,8,12,13,14,15])send('path',i);send('commitPath');break;
 case 'convoy':while(g.wave<4){const next=[0,1,2].find(i=>Math.abs(g.lane-i)<=1&&!C.threats(w).includes(i))??g.lane;if(C.threats(w).includes(next))send('guard',next);send('drive',next);}break;
 case 'flags':{const start=g.flags.join(''),queue=[[start,[]]],seen=new Set([start]);let solution;for(let n=0;n<queue.length;n++){const [state,path]=queue[n];if(state==='111111111'){solution=path;break;}for(let i=0;i<9;i++){const next=state.split('').map(Number);for(let j=0;j<9;j++)if(i===j||C.adjacent(i,j,3))next[j]=1-next[j];const key=next.join('');if(!seen.has(key)){seen.add(key);queue.push([key,path.concat(i)]);}}}assert(solution);for(const i of solution)send('flag',i);break;}
 case 'maze':for(const i of [4,8,12,13,14,15]){wait(()=>w.time-g.lastMove>=.6);send('walk',i);}break;
 case 'city':send('selectPiece',0);send('place',0);send('selectPiece',1);send('place',2);send('selectPiece',2);send('place',8);break;
 default:throw Error('Unknown ChuHan mechanic');
 }
 assert(g.done);return w;
};
