const {test}=require('node:test'),assert=require('node:assert/strict');
const {R,config,answerStage}=require('./helpers/chapter-player.cjs');
const solve=require('./helpers/warring-player.cjs');

// Minimal DOM for the real view's delegated events. Rules and command dispatch stay real.
class Host{
 constructor(){this.events={};this.nodes=[];this.renders=0;}
 addEventListener(name,fn){this.events[name]=fn;}
 set innerHTML(html){
  this.html=html;this.renders++;this.nodes=[];
  for(const tag of html.matchAll(/<([a-z]+)\b([^>]*)>/g)){
   const attrs={};for(const[,name,value]of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[name]=value||'';
   const el={attrs,dataset:{},style:{},value:attrs.value||'',disabled:/\bdisabled\b/.test(tag[2]),classList:{toggle(){}},focus(){document.activeElement=this;}};
   for(const[key,value]of Object.entries(attrs))if(key.startsWith('data-'))el.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
   el.closest=selector=>this.matches(el,selector)?el:null;this.nodes.push(el);
  }
 }
 matches(el,selector){const match=/^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);return !!match&&match[1]in el.attrs&&(match[2]===undefined||el.attrs[match[1]]===match[2]);}
 querySelectorAll(selector){return this.nodes.filter(el=>this.matches(el,selector));}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
const esc=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function launch(id){const world=R.createChapter(id,config(id));answerStage(world,'evidence');R.chapterCommand(world,'startMission');return world;}

test('戰國十二篇以真實畫面事件走完合法路線，完成後可存讀，計時畫面不反覆重建控制項',async()=>{
 const {createWarringView}=await import('../src/character/warring-view.js'),previousDocument=global.document;
 global.document={activeElement:null};
 try{
  for(const pilot of R.WA.PILOTS){
   const solved=launch(pilot.id);solve(R,solved);
   const world=launch(pilot.id),host=new Host();
   const view=createWarringView({host,world,R,esc,avatar:()=>'<svg></svg>',paused:()=>false,send:(name,value)=>{assert(R.command(world,name,value),pilot.id+' rejected '+name);view.paint();}});
   view.paint();
   const renders=host.renders,first=host.querySelector('[data-wa]');global.document.activeElement=first;
   for(let n=0;n<30;n++)view.paint();
   assert.equal(host.renders,renders,pilot.id+' rebuilds controls without an operation');
   assert.equal(global.document.activeElement,first,pilot.id+' steals focus');
   const value=el=>el.dataset.v===undefined?undefined:JSON.parse(decodeURIComponent(el.dataset.v));
   const click=(name,requested)=>{
    const el=host.querySelectorAll('[data-wa]').find(el=>el.dataset.wa===name&&JSON.stringify(value(el))===JSON.stringify(requested)&&!el.disabled);
    assert(el,pilot.id+' has no enabled control for '+name+' '+JSON.stringify(requested));
    host.events.click({target:el});view.paint();
   };
   // The solver supplies a plan through public commands. All actual play below uses
   // controls visible to a student: +/- buttons, country/key selections and sliders.
   for(const command of solved.campaign.log){
    assert(!/undefined|NaN/.test(host.html),pilot.id);
    while(world.time+.001<command.t)R.step(world,{},Math.min(.05,command.t-world.time));
    const name=command.name,v=command.value;
    if(['setGate','setDelay','setWeight'].includes(name)){
     const fields={setGate:'gates',setDelay:'delays',setWeight:'weights'},values=world.campaign[fields[name]];
     while(values[v.index]!==v.value)click(name,{index:v.index,value:values[v.index]+(v.value>values[v.index]?1:-1)});
    }else if(name==='pair'){
     click('chooseCountry',v.a);click('chooseCountry',v.b);
    }else if(name==='keyPlace'){
     click('chooseKey',v.key);click('keySlot',v.slot);
    }else if(name==='aim'){
     for(const axis of ['x','y']){const el=host.querySelector('[data-wa-range="'+axis+'"]');el.value=String(v[axis]);host.events.change({target:el});view.paint();}
    }else if(name==='row'){
     // The view offers rest instead of spending energy to paddle against the bank.
     // Both leave the boat in the same lane before the current moves it.
     const atBank=v===-1&&world.campaign.lane===0||v===1&&world.campaign.lane===2;
     click(name,atBank?0:v);
    }else click(name,v===null?undefined:v);
   }
   assert(world.campaign.done,pilot.id+' did not finish through its visible controls');
   assert(R.restore(world),pilot.id+' did not round-trip');
   assert(world.campaign.log.length<240,pilot.id+' exhausted its replay log');
   assert(!/undefined|NaN/.test(host.html),pilot.id+' final view is malformed');
  }
 }finally{global.document=previousDocument;}
});
