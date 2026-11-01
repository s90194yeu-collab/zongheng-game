// 夜縋畫面：靜態插畫只繪一次；動態與命中位置沿用規則的百分比座標。
const layers=new WeakMap();
export const nightPoint=p=>({x:p.x*10,y:80+p.y*4.6});
export const nightPointer=(x,y,width,height)=>({x:x/width*100,y:(y/height*600-80)/4.6});
export const nightLightBox=p=>{const q=nightPoint(p);return {x:q.x-140,y:q.y-23,width:280,height:46};};
export function nightLayout(world,R){
 return {covers:R.coverPoints(world).map((p,i)=>({...p,index:i,done:world.delivered.includes(i)})),lights:R.lit(world),player:{x:world.x,y:world.y},objectives:world.chapter?R.chapterObjectives(world).filter(o=>o.x!==undefined&&o.y!==undefined&&!o.done):[]};
}
function label(c,text,x,y,color='#eaddba'){
 c.font='600 15px "PingFang TC",sans-serif';c.textAlign='center';
 const width=c.measureText(text).width+22;c.fillStyle='#09202ce8';
 c.beginPath();c.roundRect(x-width/2,y-17,width,26,5);c.fill();
 c.fillStyle=color;c.fillText(text,x,y+1);
}
function scroll(c,x,y,done){
 c.save();c.translate(x,y);c.shadowColor='#0009';c.shadowBlur=7;c.shadowOffsetY=4;
 const gold=c.createLinearGradient(-35,0,35,0);gold.addColorStop(0,'#8f764f');gold.addColorStop(.45,'#dec495');gold.addColorStop(1,'#99815a');
 c.fillStyle=gold;c.strokeStyle=done?'#9fd4b5':'#ddc08a';c.lineWidth=2;
 c.beginPath();c.roundRect(-38,-24,76,39,3);c.fill();c.stroke();c.shadowBlur=0;
 c.strokeStyle='#66593c';c.lineWidth=1;
 for(let i=-30;i<=30;i+=10){c.beginPath();c.moveTo(i,-23);c.lineTo(i,14);c.stroke();}
 c.strokeStyle=done?'#a4d2b4':'#a75e49';c.lineWidth=4;
 c.beginPath();c.moveTo(-39,-12);c.lineTo(39,-12);c.moveTo(-39,5);c.lineTo(39,5);c.stroke();
 if(done){c.strokeStyle='#e2f3cd';c.lineWidth=3;c.beginPath();c.moveTo(-10,-4);c.lineTo(-3,4);c.lineTo(13,-11);c.stroke();}
 c.restore();
}
function niche(c,p){
 const {x,y}=nightPoint(p);
 c.save();c.translate(x,y);
 c.shadowColor='#000b';c.shadowBlur=11;c.shadowOffsetY=6;
 const frame=c.createLinearGradient(0,-39,0,29);frame.addColorStop(0,'#a99c78');frame.addColorStop(.35,'#6d7568');frame.addColorStop(1,'#354d50');
 c.fillStyle=frame;c.strokeStyle='#b3ad88';c.lineWidth=1.5;c.beginPath();c.roundRect(-64,-38,128,72,6);c.fill();c.stroke();
 c.shadowBlur=0;c.fillStyle='#0c2029';c.beginPath();c.roundRect(-53,-28,106,50,16);c.fill();
 c.strokeStyle='#697b70';c.beginPath();c.moveTo(-62,23);c.lineTo(62,23);c.stroke();
 scroll(c,0,4,p.done);c.restore();
 label(c,(p.done?'已交付 · ':'暗龕 ')+(p.index+1),x,y+47,p.done?'#b8e6c5':'#f5d99c');
}
function light(c,p,time,forecast=false){
 const {x,y}=nightPoint(p);
 c.save();c.translate(x,y);
 // 規則為橫向±14、縱向±5的光帶；投影後是280×46，四角亦清楚標示。
 const glow=c.createLinearGradient(-140,0,140,0);
 glow.addColorStop(0,forecast?'#9ed9dd30':'#efbd6626');glow.addColorStop(.5,forecast?'#9ed9dd55':'#fff5c1a0');glow.addColorStop(1,forecast?'#9ed9dd30':'#efbd6626');
 c.fillStyle=glow;c.strokeStyle=forecast?'#a9e6dc':'#ffe2a0';c.lineWidth=1.2;
 if(forecast)c.setLineDash([7,6]);c.fillRect(-140,-23,280,46);c.strokeRect(-140,-23,280,46);c.restore();
 if(forecast)return;
 // 中央提燈的金屬框與暖光，取代舊版黃色方塊。
 c.save();c.translate(x,y);c.strokeStyle='#e5ce97';c.lineWidth=2;
 c.beginPath();c.arc(0,-18,7,Math.PI,Math.PI*2);c.stroke();
 c.fillStyle='#e6aa60';c.beginPath();c.ellipse(0,-2,10,15,0,0,7);c.fill();
 c.strokeStyle='#f7dca6';c.beginPath();c.moveTo(-10,-12);c.lineTo(10,-12);c.moveTo(-9,9);c.lineTo(9,9);c.moveTo(0,-12);c.lineTo(0,13);c.stroke();
 c.restore();
}
function backdrop(canvas,wall,scene,dpr){
 const cached=layers.get(canvas);if(cached&&cached.wall===wall&&cached.scene===scene&&cached.dpr===dpr)return cached.layer;
 const layer=document.createElement('canvas');layer.width=1000*dpr;layer.height=600*dpr;
 const c=layer.getContext('2d');c.scale(dpr,dpr);
 c.fillStyle='#152c3b';c.fillRect(0,0,1000,600);
 if(wall||scene){c.drawImage(wall||scene,0,0,1000,600);}
 // 兩側暗角與月光採離線快取，保留石材細節。
 const edge=c.createLinearGradient(0,0,1000,0);edge.addColorStop(0,'#061a325c');edge.addColorStop(.18,'#0c203000');edge.addColorStop(.82,'#0c203000');edge.addColorStop(1,'#061a325c');c.fillStyle=edge;c.fillRect(0,0,1000,600);
 const bottom=c.createLinearGradient(0,515,0,600);bottom.addColorStop(0,'#091c2900');bottom.addColorStop(1,'#071d2ac4');c.fillStyle=bottom;c.fillRect(0,515,1000,85);
 label(c,'鄭城 · 繫繩處',500,32);label(c,'城下接應 · 下行95',500,586,'#b4dfca');
 layers.set(canvas,{wall,scene,dpr,layer});return layer;
}
export function drawNight({canvas,world:w,R,scene,wall,doll,paused}){
 const dpr=Math.max(1,Math.min(2.5,typeof devicePixelRatio==='number'?devicePixelRatio:1));
 if(canvas.width!==1000*dpr||canvas.height!==600*dpr){canvas.width=1000*dpr;canvas.height=600*dpr;}
 const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,1000,600);
 c.drawImage(backdrop(canvas,wall,scene,dpr),0,0,1000,600);
 const a=nightLayout(w,R);a.covers.forEach(p=>niche(c,p));
 a.lights.forEach(p=>light(c,p,w.time));
 if(w.buffs.foresight>w.time)R.lit(w,w.time+2).forEach(p=>light(c,p,w.time,true));
 const {x,y}=nightPoint(w);
 // 繩股的明暗沿實際角色端點走，不另外改動位置或物理。
 c.strokeStyle='#172c31';c.lineWidth=7;c.beginPath();c.moveTo(500,0);c.lineTo(x,y-22);c.stroke();
 c.strokeStyle='#d3ba88';c.lineWidth=w.buffs.steady>w.time?4.5:3;c.stroke();c.strokeStyle='#f0d7a0';c.lineWidth=1;c.setLineDash([3,5]);c.stroke();c.setLineDash([]);
 c.fillStyle='#06182455';c.beginPath();c.ellipse(x+5,y+31,28,8,0,0,7);c.fill();
 if(doll){c.save();c.translate(x,y);c.rotate(paused?0:Math.sin(w.time*2)*.018);c.drawImage(doll,-36,-68,72,108);c.restore();}
 else {c.fillStyle='#769d8f';c.beginPath();c.moveTo(x-18,y+22);c.lineTo(x+18,y+22);c.lineTo(x+9,y-13);c.lineTo(x-9,y-13);c.closePath();c.fill();c.fillStyle='#e3c9a5';c.beginPath();c.arc(x,y-23,10,0,7);c.fill();}
 for(const o of a.objectives){const q=nightPoint(o);c.save();c.translate(q.x,q.y);c.rotate(Math.PI/4);c.fillStyle='#a8e5cc';c.strokeStyle='#f7e9b8';c.lineWidth=2;c.fillRect(-9,-9,18,18);c.strokeRect(-9,-9,18,18);c.restore();label(c,'封印',q.x,q.y+31,'#b6efda');}
 if(w.trace){const q=nightPoint(w.trace);label(c,'留痕',q.x,q.y-12,'#afe2dc');}
 if(paused){label(c,'已暫停 · 按「開始／繼續」出發',500,310,'#ffe8b0');}
}
