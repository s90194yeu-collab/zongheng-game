const {test}=require('node:test'),assert=require('node:assert/strict');
const {R}=require('./helpers/chapter-player.cjs');
const {Host,esc,launch}=require('./helpers/zhuzi-character-view-host.cjs');

test('諸子十二篇由真實畫面控制完成，物件參數及計時操作均可存讀重播',async()=>{
 const solve=require('./helpers/zhuzi-character-player.cjs'),{createZhuziView}=await import('../src/character/zhuzi-view.js'),old=global.document;global.document={activeElement:null};
 try{for(const p of R.ZZ.PILOTS){const solved=launch(p);solve(R,solved);const world=launch(p),host=new Host();let view;view=createZhuziView({host,world,R,esc,avatar:()=>'<svg></svg>',paused:()=>false,send:(name,value)=>{assert(R.command(world,name,value),p.id+' rejected '+name+' '+JSON.stringify(value)+' '+world.notice);view.paint();}});view.paint();
  const decode=el=>el.dataset.v===undefined?undefined:JSON.parse(decodeURIComponent(el.dataset.v));
  const control=(name,value)=>host.querySelectorAll('[data-zz]').find(el=>el.dataset.zz===name&&JSON.stringify(decode(el))===JSON.stringify(value)&&!el.disabled);
  const click=(name,value)=>{const el=control(name,value);assert(el,p.id+' lacks enabled control '+name+' '+JSON.stringify(value));host.events.click({target:el});view.paint();};
  const range=(name,value)=>{const el=host.querySelector('[data-zz-range="'+name+'"]');assert(el&&!el.disabled,p.id+' missing range '+name);el.value=String(Math.round(value*100)/100);host.events.change({target:el});view.paint();};
  for(const command of solved.campaign.log){assert(!/undefined|NaN/.test(host.html),p.id+' malformed playing view');while(world.time+.001<command.t)R.step(world,{},Math.min(.05,command.t-world.time));view.paint();assert.notEqual(command.name,'skill','route solver must use mission controls');const name=command.name,value=command.value;
   if(name==='setBrush'){if(world.campaign.pressure!==value.pressure)click('setBrush',{radius:world.campaign.radius,pressure:value.pressure});if(world.campaign.radius!==value.radius)range('brushRadius',value.radius);}
   else if(['setFocus','setCharge'].includes(name))range(name,value);
   else if(name==='moveCart'){if(control(name,value))click(name,value);else range(name,value);}
   else if(name==='shiftSheet'){
    click('chooseSheet',value.index);const before={...world.campaign.layers[value.index]},target=host.querySelector('[data-zz-sheet="'+value.index+'"]');if(before.x!==value.x||before.y!==value.y){const event=(x,y)=>({target,pointerId:1,clientX:x,clientY:y,preventDefault(){}});host.events.pointerdown(event(50,50));host.events.pointermove(event(50+(value.x-before.x)/6*100,50+(value.y-before.y)/6*100));host.events.pointerup(event(50+(value.x-before.x)/6*100,50+(value.y-before.y)/6*100));view.paint();}
   }else if(name==='moveKnot'){click('chooseKnot',value.index);if(world.campaign.nodes[value.index].x!==Math.round(value.x*100)/100)range('knotX',value.x);if(world.campaign.nodes[value.index].y!==Math.round(value.y*100)/100)range('knotY',value.y);}
   else if(name==='moveJob'){let at=world.campaign.orders[value.station].indexOf(value.job);while(at!==value.index){click('moveJob',{station:value.station,job:value.job,index:at+(value.index>at?1:-1)});at=world.campaign.orders[value.station].indexOf(value.job);}}
   else click(name,value===null?undefined:value);
  }
  assert(world.campaign.done,p.id+' failed to finish through visible controls');assert(R.restore(world),p.id+' UI save cannot replay');assert(world.campaign.log.length<240,p.id+' exhausted replay log');view.paint();assert(!/undefined|NaN/.test(host.html),p.id+' malformed completed view');
 }}finally{global.document=old;}
});
