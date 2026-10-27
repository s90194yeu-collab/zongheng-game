export const HALLS=Object.freeze([
  {id:'cq',name:'春秋史館',subtitle:'盟誓與抉擇',x:-12,z:-11,rotation:0,width:8,depth:6,color:'#709d86'},
  {id:'zg',name:'戰國史館',subtitle:'策士與天下',x:0,z:-16,rotation:0,width:9,depth:6,color:'#638fa0'},
  {id:'ch',name:'楚漢史館',subtitle:'英雄與山河',x:12,z:-11,rotation:0,width:8,depth:6,color:'#b46e58'},
  {id:'zz',name:'諸子學宮',subtitle:'百家思想',x:-18,z:3,rotation:Math.PI/2,width:6,depth:6,color:'#819768'},
  {id:'gw',name:'古文書院',subtitle:'千年文章',x:18,z:3,rotation:-Math.PI/2,width:7,depth:6,color:'#6a9296'},
  {id:'al',name:'選文雅集',subtitle:'課綱選讀',x:-12,z:17,rotation:Math.PI,width:7,depth:5,color:'#ad8060'},
].map(h=>Object.freeze({...h,entry:{x:h.x+Math.sin(h.rotation)*(h.depth/2+1.75),z:h.z+Math.cos(h.rotation)*(h.depth/2+1.75)}})));
export const EXHIBITS=Object.freeze([{id:'west',x:-5,z:-1,name:'左廊展櫃'},{id:'north',x:0,z:-5,name:'主展櫃'},{id:'east',x:5,z:-1,name:'右廊展櫃'}]);
export function obstacles(place='village'){
 if(place!=='village')return EXHIBITS.map(e=>({x:e.x,z:e.z,w:2.6,d:2.0})).concat([{x:0,z:-8.8,w:18,d:.5},{x:-7,z:-5.8,w:2,d:1.2},{x:7,z:-5.8,w:2,d:1.2}]);
 return HALLS.map(h=>{const turned=Math.abs(Math.sin(h.rotation))>.5;return {x:h.x,z:h.z,w:(turned?h.depth:h.width)+1,d:(turned?h.width:h.depth)+1};}).concat([{x:3.6,z:3,w:3.3,d:3.3},{x:10,z:8,w:4.5,d:4.5},{x:-6,z:8,w:4.5,d:4.5}]);
}
export function walkable(p,place='village',radius=.36){
 const bound=place==='village'?23:8.2;
 if(!Number.isFinite(p.x)||!Number.isFinite(p.z)||Math.abs(p.x)>bound-radius||Math.abs(p.z)>bound-radius)return false;
 return !obstacles(place).some(o=>Math.abs(p.x-o.x)<o.w/2+radius&&Math.abs(p.z-o.z)<o.d/2+radius);
}
export function move(position,delta,place='village'){
 let p={...position};const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.z)/.16));
 for(let i=0;i<steps;i++){
  const x=p.x+delta.x/steps,z=p.z+delta.z/steps;
  if(walkable({x,z:p.z},place))p.x=x;
  if(walkable({x:p.x,z},place))p.z=z;
 }
 return p;
}
export function route(start,end,place='village'){
 if(!walkable(start,place)||!walkable(end,place))return [];
 const cell=.75,limit=place==='village'?30:10;
 const key=(x,z)=>x+','+z,grid=p=>({x:Math.round(p.x/cell),z:Math.round(p.z/cell)}),s=grid(start),goal=grid(end);
 const pending=[{...s,g:0,f:0}],known=new Map([[key(s.x,s.z),{g:0,from:null}]]),closed=new Set();
 let found=null;
 for(let step=0;pending.length&&step<7000;step++){
  pending.sort((a,b)=>a.f-b.f);const node=pending.shift(),id=key(node.x,node.z);if(closed.has(id))continue;closed.add(id);
  if(node.x===goal.x&&node.z===goal.z){found=id;break;}
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=node.x+dx,z=node.z+dz,k=key(x,z);if(Math.abs(x)>limit||Math.abs(z)>limit||closed.has(k)||!walkable({x:x*cell,z:z*cell},place,.48))continue;
   if(dx&&dz&&(!walkable({x:node.x*cell,z:z*cell},place,.48)||!walkable({x:x*cell,z:node.z*cell},place,.48)))continue;
   const g=node.g+Math.hypot(dx,dz);if((known.get(k)?.g??Infinity)<=g)continue;
   known.set(k,{g,from:id});pending.push({x,z,g,f:g+Math.hypot(x-goal.x,z-goal.z)});
  }
 }
 if(!found)return [];
 const result=[{...end}];for(let k=found;k;k=known.get(k).from){const [x,z]=k.split(',').map(Number);result.push({x:x*cell,z:z*cell});}result.reverse();
 return result.slice(1);
}
export function chaptersFor(catalog,id){return catalog.filter(c=>c.vol===id&&c.status==='ready'&&!c.legacyOnly);}
