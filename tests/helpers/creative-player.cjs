// 只使用公開操作事件及固定時間步長；不改座標、生命、命中或通關旗標。
function play(L,w,{tick,cmd,sel,primary,secondary,skill,wait}){
 if(w.creativeVersion!==2)return false;
 const m=L.modes[w.mode],point=(x,y)=>L.point(w,x,y,true),drag=(x,y)=>m.drag?.(w,x,y),release=(x=0,y=0)=>m.release?.(w,x,y);
 switch(w.mode){
 case 'archive':for(let i=0;i<6;i++){sel(i);if(w.flip[i])primary();if(w.covers[i])skill();point(160+i*136,420);drag(160+w.order[i]*136,220);release(160+w.order[i]*136,220);tick({},.1);}break;
 case 'haoliang':for(let i=0;i<3;i++){const j=w.permutation.indexOf(i);point(155+(i%2)*180,205+Math.floor(i/2)*145);drag(605+(j%2)*180,205+Math.floor(j/2)*145);release(605+(j%2)*180,205+Math.floor(j/2)*145);tick({},.1);}break;
 case 'contracts':for(let i=0;i<4;i++){sel(i);tick({},.02);primary();point(180+w.orders[i].actual*64,382);release();wait(()=>w.orders[i].measured,1600);cmd(w.orders[i].actual===w.orders[i].claim&&w.orders[i].elapsed<=w.orders[i].due?'secondary':'skill');}break;
 case 'weave':for(let row=0;row<3;row++){for(let i=0;i<5;i++)if(w.warp[i]!==((i+row+w.index)%2)){sel(i);primary();}point(w.shuttle.x,320);drag(row%2?110:890,320);wait(()=>w.row>row,1000);release();}break;
 case 'paperMoon':if(w.screen>=0)secondary();for(let i=0;i<4;i++){const p=[{x:300,y:310},{x:300,y:150},{x:720,y:150},{x:720,y:420}][i],a=i<2?-Math.PI/4:Math.PI/4;point(p.x,p.y);drag(p.x+Math.cos(a)*65,p.y+Math.sin(a)*65);release();}tick({},1.9);break;
 case 'riverSong':while(w.status==='playing'&&w.next<8){const n=w.next,scale=w.index===0?0:w.index===1?(n<4?0:1):n%2;if(w.scale!==scale)skill();wait(()=>w.time>=w.noteTimes[n]-.7,1800);point([240,500,760][w.notes[n]],425);tick({},1);release();wait(()=>w.next>n,600);}break;
 case 'moonwalk':for(let i=0;i<3;i++){const n=w.targets[i],g={x:w.bridges[n].x+25,y:285+(n%2?10:-10),zoom:[1,1.25,1.5][i]};point(110+[6,18,21][w.index]*32.5,130);release();point(g.x,g.y);release();point(930,220+(2-g.zoom)*140);release();point(170+[1,2,3][w.index]*125,500);release();point(850,500);release();tick({},.1);}break;
 case 'woodcut':for(let i=0;i<6;i++){const [a,x]=[[-.35,420],[.25,560],[-.1,485],[.4,590],[-.25,445],[.1,525]][(i+w.index)%6];point(x,480);release();point(190+a*125,260);release();point(500,300);tick({},.9);release();tick({},.5);}break;
 default:return false;
 }
 return true;
}
module.exports={play};
