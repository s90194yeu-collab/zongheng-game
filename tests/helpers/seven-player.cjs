// All changes go through the same commands / pointer events used by the UI.
function play(L,w,{tick,cmd,sel,primary,secondary,skill,wait}){
 const modes=['empireLoad','horizon','cupCurrent','cliffHands','citrusPeel','faultContain','sourcePress'];if(!modes.includes(w.mode))return false;
 const down=(x,y)=>L.point(w,x,y,true),drag=(x,y)=>L.drag(w,x,y),up=(x,y)=>L.release(w,x,y);
 const stroke=(a,b,n=25)=>{down(a.x,a.y);for(let i=1;i<=n;i++){drag(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n);tick();}up(b.x,b.y);};
 switch(w.mode){
 case 'empireLoad':{let n=0;while(w.status==='playing'&&n++<1600){if(w.phase===1)skill();const base=w.phase===2?[1,3,2,1,3,2]:[3,1,2,3,1,2],rot=Math.floor(w.clock/3)%6,load=base.map((_,i)=>base[(i+rot)%6]);for(let i=0;i<6;i++){sel(i);while(w.alloc[i]>load[i]&&w.status==='playing')secondary();}for(let i=0;i<6;i++){sel(i);while(w.alloc[i]<load[i]&&w.reserve&&w.status==='playing')primary();}tick({},.08);}break;}
 case 'horizon':for(let round=0;round<3&&w.status==='playing';round++){const bases=[[220,650,710],[730,260,540],[410,780,190]][round];for(let row=0;row<3;row++){const shift=500-bases[row]-w.shifts[row];stroke({x:500,y:175+row*105},{x:500+shift,y:175+row*105});}tick({},.7);primary();}break;
 case 'cupCurrent':for(let i=0;i<3&&w.status==='playing';i++){const targets=[{x:360,y:415},{x:600,y:339},{x:820,y:310}],p=targets[i];stroke(w.cup,p);wait(()=>w.caught,900);primary();}break;
 case 'cliffHands':while(w.status==='playing'&&w.top<8){const cam=Math.min(650,Math.max(0,w.bodyY-355)),a=w.hands[w.hand],b=w.holds[w.top+1];stroke({x:a.x,y:a.y-cam},{x:b.x,y:b.y-cam},30);}break;
 case 'citrusPeel':for(let fruit=0;fruit<3&&w.status==='playing';fruit++){const ps=w.path.slice();down(ps[0].x,ps[0].y);for(const p of ps){drag(p.x,p.y);tick();}up(ps.at(-1).x,ps.at(-1).y);const progress=L.progress(w);cmd(progress.threat.includes('鮮實')?'secondary':'skill');}break;
 case 'faultContain':{while(w.status==='playing'){const sources=w.active.slice();for(let i=0;i<w.edges.length;i++){const [a,b]=w.edges[i];if(sources.includes(a)!==sources.includes(b)){const p=L.options(w)[i];down(p.x,p.y);up(p.x,p.y);tick();}}secondary();secondary();}break;}
 case 'sourcePress':for(let round=0;round<4&&w.status==='playing';round++){for(let row=0;row<3;row++){sel(row);primary();}tick({},1.5);for(let row=0;row<3;row++){let d=((round-w.pos[row]+6)%4)-2;stroke({x:500,y:175+105*row},{x:500-d*190,y:175+105*row},20);}tick({},.25);cmd([1,3].includes(round)?'uncertain':'publish');}break;
 }
 return true;
}
module.exports={play};
