function play(L,w,{maxFrames=24000}={}){
 const dt=1/60;let frames=0;
 const tick=(k={},sec=dt)=>{for(let n=0;n<Math.ceil(sec/dt)&&w.status==='playing';n++){L.step(w,k,dt);if(++frames>maxFrames)throw Error('solver frame limit '+w.mode);}};
 const cmd=(c)=>{L.command(w,c);tick({},dt);},sel=i=>cmd('select:'+i),primary=()=>cmd('primary'),secondary=()=>cmd('secondary'),skill=()=>cmd('skill');
 const hold=(key,sec)=>{cmd({action:'primary',guard:'secondary',dash:'skill'}[key]);tick({[key]:true},sec);tick({},.05);};
 const walk=(target,get=()=>w,extra={})=>{let n=0;while(w.status==='playing'&&Math.hypot(get().x-target.x,get().y-target.y)>12&&n++<3600){const p=get(),dx=target.x-p.x,dy=target.y-p.y;tick({...extra,right:dx>7,left:dx< -7,down:dy>7,up:dy< -7});}if(n>=3600)throw Error('walk blocked '+w.mode+' '+JSON.stringify({target,current:get()}));};
 const wait=(pred,max=3000)=>{let n=0;while(w.status==='playing'&&!pred()&&n++<max)tick();};
 switch(w.mode){
 case 'archive':for(let i=0;i<6;i++){let j=w.order.indexOf(i);while(j>i){sel(j-1);secondary();j--;}sel(i);if(w.flip[i])primary();if(w.covers[i])skill();}break;
 case 'waterworks':if(w.index===1){for(let i=0;i<12;i++){const target=[5,6].includes(i)?0:1;if(w.clay[i]!==target){sel(i);primary();}}}else{const base={0:10,1:12,5:3,6:12,10:3,11:10};for(const [i,target]of Object.entries(base)){sel(+i);let n=0;while(w.pipes[+i]!==target&&n++<4)primary();}}tick({},3);break;
 case 'slices':for(let i=0;i<3;i++){sel(i);while(w.rot[i]!==0)primary();}secondary();break;
 case 'haoliang':for(let side=0;side<2;side++){if(w.side!==side)secondary();for(let i=0;i<5;i++){sel(i);primary();}}break;
 case 'paperMoon':{if(w.screen>=0)secondary();const set=(i,n)=>{sel(i);while(w.mirrors[i]!==n)primary();};set(5,0);set(1,1);tick({},1.1);set(5,1);set(9,0);tick({},1.1);set(9,1);set(10,2);tick({},1.1);break;}
 case 'studio':for(const i of [1,3,6]){sel(i);primary();}{const mirror=[0,1,2,3].find(m=>w.deskPlaces.includes(8+(m+1)%4)&&!w.wall.includes(8+(m+1)%4));while(w.mirror!==mirror)skill();sel((mirror+w.sunAngle)%4);secondary();sel(8+(mirror+1)%4);cmd('desk');tick({},3.2);}break;
 case 'seals':while(w.status==='playing'){for(const t of w.tokens)if(!t.checked&&t.pos===t.verify){sel(t.pos);primary();}tick({},.05);}break;
 case 'contracts':for(let i=0;i<4;i++){sel(i);primary();primary();cmd(w.orders[i].actual===w.orders[i].claim&&w.orders[i].elapsed<=w.orders[i].due?'secondary':'skill');}break;
 case 'audience':for(let i=0;i<2;i++){secondary();sel(w.concerns[w.round]);primary();}break;
 case 'weave':for(let i=0;i<5;i++){let j=w.strands.indexOf(w.target[i]);while(j>i){sel(j-1);primary();j--;}}break;
 case 'chess':secondary();for(const i of [9,10,11]){sel(i);primary();}break;
 case 'academy':for(let i=0;i<9;i++){sel(i);while(w.teacher!==w.target[i])secondary();primary();}skill();skill();skill();break;
 case 'ritual':secondary();for(let round=0;round<3;round++){for(let i=0;i<3;i++){sel(i);primary();}tick({},6.6);}break;
 case 'reciprocity':for(const pair of [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]){sel(pair[0]);primary();sel(pair[1]);primary();}secondary();secondary();secondary();break;
 case 'itinerary':for(const n of [1,2,4,3,4,5]){sel(n);primary();secondary();}break;
 case 'commons':for(let round=0;round<2;round++){for(let i=0;i<3;i++){sel(i);for(let n=0;n<w.needs[i];n++)primary();}skill();}break;
 case 'care':for(const [role,route]of [[0,[1,2]],[1,[4,3]]]){if(w.agent!==role)secondary();for(const n of route){sel(n);primary();wait(()=>w.helpers[role].to<0,1000);}}break;
 case 'regency':{const md=(a,b)=>Math.abs(a%4-b%4)+Math.abs(Math.floor(a/4)-Math.floor(b/4));const valid=(p,i)=>w.tasks[i].every(n=>i===1?md(n,p)<=1:n%4===p%4);let chosen;for(let a=0;a<12;a++)for(let b=0;b<12;b++)for(let c=0;c<12;c++)if(new Set([a,b,c]).size===3&&valid(a,0)&&valid(b,1)&&valid(c,2))chosen=[a,b,c];for(let i=0;i<3;i++){sel(chosen[i]);primary();secondary();}tick({},2.5);break;}
 case 'engineer':while(w.status==='playing'){for(const e of w.enemies){if(w.tools[e.lane]!==e.type){sel(e.lane);while(w.tool!==e.type)secondary();primary();}}tick({},.1);}break;
 case 'dye':for(let i=0;i<3;i++){hold('action',2.0);tick({},1.5);}break;
 case 'harbor':for(let i=0;i<4;i++){sel(i);wait(()=>w.tide>w.ships[i].draft+.5,12000);secondary();tick({},.1);}wait(()=>w.status!=='playing',1000);break;
 case 'granary':for(let i=0;i<3;i++){sel(i);for(let n=0;n<w.villages[i].need;n++)primary();secondary();if(i<2)skill();}tick({},.1);break;
 case 'seasons':secondary();sel(1);primary();primary();secondary();sel(0);primary();primary();secondary();sel(2);primary();primary();break;
 case 'fourGates':while(w.status==='playing'){for(let lane=0;lane<4;lane++){const head=w.packets.filter(p=>!p.done&&p.lane===lane&&w.time>=p.at).sort((a,b)=>a.x-b.x)[0];if(head&&w.open[lane]!==head.good){sel(lane);primary();}}tick({},.05);}break;
 case 'backstage':while(w.status==='playing'){const c=w.cues.find(c=>!c.done&&Math.abs(w.time-c.at)<.08);if(c){sel(c.station);primary();}tick({},.02);}break;
 case 'tavern':for(let i=0;i<4;i++){sel(i);const o=w.orders[i];if(!o.absent){hold('action',o.target/.85);for(let n=0;n<o.paid;n++)skill();}secondary();}tick({},.1);break;
 case 'knife':while(w.status==='playing'){const t=w.path[w.next];if(!t)break;const dx=t.x-w.x,dy=t.y-w.y;tick({pointer:{x:t.x,y:t.y},action:true,guard:w.index===2});}break;
 case 'woodcut':while(w.status==='playing'){let n=0;cmd('primary');while(w.status==='playing'&&w.charge<.85&&n++<150){const delta=w.grain-w.angle;tick({action:true,left:delta<-.03,right:delta>.03});}tick({},.05);cmd('secondary');tick({guard:true},.7);}break;
 case 'mudTurtle':for(const p of w.reeds.slice(0,2)){walk(p);hold('guard',.85);}walk(w.exit);tick({},.1);break;
 case 'courier':walk(w.screens[0]);hold('guard',.8);for(const p of w.letters){walk(p,()=>w,{guard:true});primary();}break;
 case 'march':case 'lifepath':{tick({},.3);let jumpWait=0;while(w.status==='playing'){jumpWait-=dt;if(w.mode==='lifepath'&&w.lessons<6){const x=150+w.lessons*350;if(w.x>x-58&&w.x<x+30&&w.grounded){tick({action:true,guard:w.lessons>=3},1.25);continue;}}const p=w.platforms.find(p=>w.x>=p.x&&w.x<=p.x+p.w);if(w.grounded&&p&&p.x+p.w-w.x<70&&jumpWait<=0){skill();jumpWait=.4;}tick({right:true,guard:w.mode==='lifepath'&&w.lessons>=3});}break;}
 case 'borrow':for(const o of w.obstacles){walk({x:o.x-45,y:390});while(w.tool!==o.tool)secondary();primary();walk({x:o.end+15,y:390});}walk({x:935,y:390});break;
 case 'mentor':walk(w.desks[0],()=>w.party[w.role]);primary();secondary();walk(w.desks[1],()=>w.party[w.role]);secondary();walk(w.plate,()=>w.party[w.role]);secondary();walk({x:650,y:220},()=>w.party[w.role]);primary();secondary();walk({x:700,y:250},()=>w.party[w.role]);secondary();walk(w.desks[2],()=>w.party[w.role]);primary();walk({x:930,y:390},()=>w.party[w.role]);secondary();walk({x:930,y:390},()=>w.party[w.role]);secondary();walk({x:930,y:390},()=>w.party[w.role]);break;
 case 'redsilk':{tick({},.3);let jumpWait=0;while(w.status==='playing'){jumpWait-=dt;if(w.rope>=0){const h=w.hooks[w.rope];if(w.x>h.x+100&&w.y<370&&w.vy<0)primary();}else{const p=w.platforms.find(p=>w.x>=p.x&&w.x<=p.x+p.w);if(w.grounded&&p&&p.x+p.w-w.x<85&&jumpWait<=0){skill();jumpWait=.5;}const near=w.hooks.map((h,i)=>({h,i,d:Math.hypot(h.x-w.x,h.y-w.y)})).filter(x=>x.d<300&&x.h.x>w.x+20)[0];if(!w.grounded&&near&&w.y<390)primary();}tick({right:true,guard:w.grounded});}break;}
 case 'wallrun':for(let i=0;i<2;i++){walk({x:w.walls[i].x-135,y:400});secondary();primary();wait(()=>w.walls[i].passed,200);skill();}walk({x:765,y:400});secondary();skill();tick({},.1);break;
 case 'tether':walk({x:280,y:200},()=>w.people[w.role]);secondary();walk(w.levers[0],()=>w.people[w.role]);secondary();walk(w.levers[1],()=>w.people[w.role]);secondary();walk({x:655,y:420},()=>w.people[w.role]);secondary();walk({x:720,y:200},()=>w.people[w.role]);secondary();walk({x:900,y:420},()=>w.people[w.role]);secondary();walk({x:900,y:200},()=>w.people[w.role]);break;
 case 'retreat':for(let i=0;i<2;i++){tick({right:true},w.targets[i]*6/170+.1);secondary();primary();}tick({},.1);break;
 case 'gourd':sel(1);primary();sel(2);primary();primary();secondary();while(w.status==='playing'){const direction=-(w.roll*1.8+w.omega*.8+Math.sin(w.time*1.7)*.3+w.center*.5);tick({left:direction<-.08,right:direction>.08,up:w.y>330,down:w.y<320});}break;
 case 'well':walk(w.anchor);primary();{const angle=Math.atan2(w.child.x-w.anchor.x,w.child.y-w.anchor.y),length=Math.hypot(w.child.x-w.anchor.x,w.child.y-w.anchor.y);let n=0;while(w.status==='playing'&&!w.caught&&n++<3000){const delta=angle-w.angle,k={guard:true,left:delta<-.02,right:delta>.02,down:w.length<length-8,up:w.length>length+8};tick(k);if(Math.hypot(w.tip.x-w.child.x,w.tip.y-w.child.y)<42)primary();}while(w.status==='playing'&&w.caught){tick({guard:true,up:true,left:w.angle>.05,right:w.angle<-.05});}}break;
 case 'peach':if(w.index===0){while(w.status==='playing'&&w.x<740){const center=300+Math.sin(w.x/160)*65;tick({right:true,up:w.y>center+5,down:w.y<center-5});}primary();walk({x:880,y:300});}else if(w.index===1){walk({x:710,y:300});primary();walk({x:915,y:300});}else{walk({x:270,y:300});primary();walk({x:500,y:300});primary();walk({x:780,y:300});walk({x:100,y:300});}break;
 case 'riverSong':while(w.status==='playing'){const needed=w.index===0?0:w.index===1?(w.next<4?0:1):w.next%2;if(w.scale!==needed)skill();sel(w.notes[w.next]??1);if(w.breath<28)hold('guard',1.8);const k={action:true,up:w.roll>.2,down:w.roll<-.2};tick(k,.08);}break;
 case 'moonwalk':{const hour=[6,18,21][w.index];while(w.hour<hour-1.1){secondary();tick({},.01);}const exposure=[1,2,3][w.index];while(w.exposure<exposure){const old=w.exposure;while(w.exposure===old)tick({up:true});tick({},.3);}for(const i of w.targets){walk({x:w.bridges[i].x,y:350});primary();}break;}
 case 'ink':for(const p of w.targets){walk(p);hold('action',.5);}break;
 case 'canglang':while(w.status==='playing'){const target=w.stops[w.next];if(target&&Math.abs(w.x-target)<50){const desired=w.water==='清'?0:1;if(w.use!==desired)secondary();skill();}if(w.cooldown<=0)primary();tick({up:w.y>330,down:w.y<300},.04);}break;
 case 'banquet':if(w.index===0){while(w.status==='playing'){if(w.selected!==w.flowerSlots[w.flowers])sel(w.flowerSlots[w.flowers]);if(Math.abs(w.balance)<.25&&w.cooldown===0)primary();tick({left:w.balance>.1,right:w.balance<-.1},.04);}}else if(w.index===1){primary();for(let i=0;i<5;i++){tick({},1.6);primary();}}else while(w.status==='playing'){const r=w.reactions.find(r=>!r.done&&Math.abs(w.time-r.at)<.1);if(r){sel(r.person);primary();}tick({},.03);}break;
 case 'errands':walk(w.tasks[0]);hold('action',2.2);secondary();walk(w.tasks[1]);walk({x:580,y:175},()=>w,{action:true});walk(w.tasks[2]);primary();walk(w.tasks[3]);secondary();primary();walk(w.tasks[4]);hold('guard',2.2);walk(w.tasks[5]);hold('action',3.2);break;
 case 'evidence':primary();secondary();primary();{const moves=[['up',4],['up',0],['right',1],['down',5],['down',9],['right',10],['right',11],['up',7],['up',3]];for(const [key,n]of moves){const g=w.gates.indexOf(n);if(g>=0)wait(()=>w.phase===g&&w.nav<=0,1000);else wait(()=>w.nav<=0,100);const current=w.cell;while(w.status==='playing'&&w.cell===current)tick({[key]:true});tick({},.28);}}break;
 case 'steelyard':if(!w.calibrated){secondary();tick({},1.5);}while(w.slider<w.mass)cmd('more');while(w.slider>w.mass)cmd('less');wait(()=>w.stable>=.8,2500);primary();break;
 default:throw Error('No player '+w.mode);
 }
 return {status:w.status,time:w.time,hp:w.hp,view:L.progress(w),frames};
}
module.exports={play};
