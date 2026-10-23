const {test}=require('node:test'),assert=require('node:assert/strict');
const {R}=require('./helpers/chapter-player.cjs');
const {Host,esc,launch}=require('./helpers/spring-view-host.cjs');

test('春秋十六篇由真實畫面控制完成合法操作，物件參數保留、觸控替代與存讀均可完成',async()=>{
 const solve=require('./helpers/spring-player.cjs'),{createSpringView}=await import('../src/character/spring-view.js'),old=global.document;global.document={activeElement:null};
 try{for(const p of R.SP.PILOTS){
  const solved=launch(p);solve(R,solved);
  const world=launch(p),host=new Host();let view;
  view=createSpringView({host,world,R,esc,avatar:()=>'<svg></svg>',paused:()=>false,send:(name,value)=>{assert(R.command(world,name,value),p.id+' rejected '+name+' '+JSON.stringify(value)+' '+world.notice);view.paint();}});view.paint();
  const decode=el=>el.dataset.v===undefined?undefined:JSON.parse(decodeURIComponent(el.dataset.v));
  const control=(name,value)=>host.querySelectorAll('[data-sp]').find(el=>el.dataset.sp===name&&JSON.stringify(decode(el))===JSON.stringify(value)&&!el.disabled);
  const click=(name,value)=>{const el=control(name,value);assert(el,p.id+' lacks control '+name+' '+JSON.stringify(value));host.events.click({target:el});view.paint();};
  let rotation=0;
  for(const command of solved.campaign.log){
   assert(!/undefined|NaN/.test(host.html),p.id+' malformed playing view');
   while(world.time+.001<command.t)R.step(world,{},Math.min(.05,command.t-world.time));view.paint();
   const name=command.name,value=command.value;
   if(name==='pack'){
    const selected=control('selectPack',value.item);assert(selected);if(selected.attrs['aria-pressed']!=='true')click('selectPack',value.item);
    if(rotation!==value.rotation){click('rotatePack');rotation=1-rotation;}
    click('packAt',value.cell);
   }else if(name==='layBridge'){
    const selected=control('selectBridge',value.piece);assert(selected);if(selected.attrs['aria-pressed']!=='true')click('selectBridge',value.piece);
    click('bridgeAt',value.start);
   }else if(name==='moveSlip'){
    click('choosePeg',value.from);click('choosePeg',value.to);
   }else if(name==='markScout'){
    let guard=0;while(world.campaign.marks[value.index]!==value.value&&guard++<3){const el=host.querySelectorAll('[data-sp]').find(el=>el.dataset.sp==='markScout'&&decode(el).index===value.index&&!el.disabled);assert(el);host.events.click({target:el});view.paint();}assert.equal(world.campaign.marks[value.index],value.value);
   }else if(name==='skill')throw Error('UI route solver must use mission controls, not substitute a skill');
   else click(name,value===null&&name!=='crossFerry'?undefined:value);
  }
  assert(world.campaign.done,p.id+' failed to complete through visible controls');assert(R.restore(world),p.id+' invalid UI replay');assert(world.campaign.log.length<240,p.id+' exhausted replay log');
  view.paint();assert(!/undefined|NaN/.test(host.html),p.id+' malformed completed view');
 }}finally{global.document=old;}
});
