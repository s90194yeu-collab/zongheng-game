const {test}=require('node:test'),assert=require('node:assert/strict');
const {R,config,answerStage}=require('./helpers/chapter-player.cjs');
class Host{
 constructor(){this.events={};this.nodes=[];this.html='';}
 addEventListener(name,fn){this.events[name]=fn;}
 set innerHTML(value){this.html=value;this.nodes=[];for(const tag of value.matchAll(/<(button|span|small|i|p)\b([^>]*)>/g)){const attrs={};for(const [,name,val]of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[name]=val||'';const e={attrs,dataset:{},style:{},disabled:/\bdisabled\b/.test(tag[2]),classList:{toggle(){}},focus(){document.activeElement=this;}};for(const [name,val]of Object.entries(attrs))if(name.startsWith('data-'))e.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=val;e.closest=selector=>selector==='[data-ch]'&&attrs['data-ch']?e:null;this.nodes.push(e);}}
 get innerHTML(){return this.html;}
 querySelectorAll(selector){const attr=selector.slice(1,-1);return this.nodes.filter(e=>attr in e.attrs);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
test('九種實際介面渲染、暫停阻擋與按鈕指令一致；畫面沒有undefined或NaN',async()=>{
 const {createChuhanView}=await import('../src/character/chuhan-view.js'),old=global.document;global.document={activeElement:null};try{for(const p of R.CH.PILOTS){const world=R.createChapter(p.id,config(p.id)),host=new Host();answerStage(world,'evidence');R.chapterCommand(world,'startMission');let paused=true,count=0;const view=createChuhanView({host,world,R,esc:String,avatar:()=>'<svg></svg>',paused:()=>paused,send:(name,value)=>{count++;R.command(world,name,value);}});view.paint();assert(!/undefined|NaN/.test(host.html),p.id);assert(host.querySelectorAll('[data-ch]').length>0);assert(host.querySelectorAll('[data-ch]').every(e=>e.disabled));const disabled=host.querySelectorAll('[data-ch]')[0];host.events.click({target:disabled});assert.equal(count,0);paused=false;view.paint();const enabled=host.querySelectorAll('[data-ch]').find(e=>!e.disabled);assert(enabled,p.id);host.events.click({target:enabled});assert.equal(count,1,p.id);view.paint();assert(R.restore(world));paused=true;view.paint();assert(host.querySelectorAll('[data-ch]').every(e=>e.disabled));}}finally{global.document=old;}
});
