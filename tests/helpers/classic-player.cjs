// 只透過公開按鍵、選擇與固定時間步長操作；不改位置、生命或通關旗標。
function play(L,w,{tick,cmd,sel,primary,secondary,skill,walk,wait}){
 const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<r;
 switch(w.mode){
 case 'lookout':for(const b of w.boats){sel(b.route);let n=0;while(!b.done&&w.status==='playing'&&n++<5000){const dx=b.x-w.aim;tick({right:dx>7,left:dx< -7,action:Math.abs(dx)<32&&b.x>=500&&b.x<=800});}}break;
 case 'soundtrail':for(let i=0;i<w.spots.length&&w.status==='playing';i++){if(i===2){walk({x:540,y:430});walk({x:850,y:430});}else walk(w.spots[i]);tick({action:true},.85);if(w.index===2)wait(()=>near(w,w.party,70),2000);secondary();}break;
 case 'snowcloak':secondary();for(let i=0;i<4;i++){sel(i);let n=0;while(w.status==='playing'&&!near(w.corners[i],w.anchors[i],10)&&n++<2000){const a=w.anchors[i],p=w.corners[i];tick({right:a.x>p.x+4,left:a.x<p.x-4,down:a.y>p.y+4,up:a.y<p.y-4});}primary();}tick({},2.2);break;
 case 'incognito':for(let i=0;i<5;i++){sel(i);primary();}walk({x:400,y:w.y});wait(()=>w.phase===1&&w.time%3<.06,3000);secondary();walk({x:625,y:w.y});secondary();walk({x:850,y:w.y});primary();walk({x:620,y:w.y});wait(()=>w.phase===1&&w.time%3<.06,3000);secondary();walk({x:395,y:w.y});secondary();walk({x:100,y:w.y});break;
 case 'watchrelay':for(let i=0;i<10&&w.status==='playing';i++){sel(i%5);primary();wait(()=>w.active<0,1000);}break;
 case 'fallingText':for(let n=0;n<24&&w.status==='playing';n++){if(w.piece.vertical!==w.target.vertical)secondary();const target=w.target.x;let tries=0;while(w.piece.x!==target&&w.status==='playing'&&tries++<200)tick({left:w.piece.x>target,right:w.piece.x<target});wait(()=>w.cooldown<=0,60);primary();}break;
 case 'reins':{let n=0;const lane=d=>{let i=0;while(i<w.road.length-2&&d>w.road[i+1].d)i++;const a=w.road[i],b=w.road[i+1];return a.y+(b.y-a.y)*Math.min(1,Math.max(0,(d-a.d)/(b.d-a.d)));};while(w.status==='playing'&&n++<10000){const y=lane(w.distance+18);tick({up:w.speed<64,down:w.speed>70,right:y>w.y+3,left:y<w.y-3});}break;}
 case 'doorflee':{const go=x=>{let n=0;while(w.status==='playing'&&w.x<x&&n++<4000){const wall=w.walls.find(p=>p.x+70>w.x);if(wall&&w.ground&&wall.x-w.x<88)skill();tick({right:true});}};for(const x of [140,445,825]){go(x);secondary();primary();secondary();}go(915);break;}
 case 'grapple':primary();walk({x:335,y:420});secondary();wait(()=>w.phase==='duel',2000);for(let n=0;n<4000&&w.phase==='duel'&&w.status==='playing';n++){if(w.enemyState==='伸手'&&near(w,w.enemy,110)){primary();tick({},.25);secondary();}else{const target=w.enemy.x-85;tick({right:target>w.x+5,left:target<w.x-5});}}while(w.status==='playing'&&w.phase==='yield'&&w.enemy.x-w.x<175)tick({left:true});secondary();break;
 case 'frost':{const drive=(point,finish=false)=>{let n=0;while(w.status==='playing'&&(!near(w,point,18)||Math.hypot(w.vx,w.vy)>20)&&n++<7000){const targetY=finish?330+Math.sin((w.x+25)/260+w.index*.5)*55:point.y,dx=point.x-w.x,dy=targetY-w.y,cx=dx*3-w.vx*2,cy=dy*3-w.vy*2;tick({right:cx>12,left:cx< -12,down:cy>12,up:cy< -12,guard:Math.hypot(dx,dy)<70});}if(n>=7000)throw Error('snow drive exceeded');};for(const point of w.shelters.slice(0,2)){drive(point);tick({guard:true},1.4);primary();}drive({x:w.index===2?2130:2170,y:330+Math.sin((w.index===2?2130:2170)/260+w.index*.5)*55},true);if(w.index===2&&w.status==='playing'){tick({guard:true},1);wait(()=>w.signal===1,1000);primary();}break;}
 default:throw Error('No player '+w.mode);
 }
}
module.exports={play};
