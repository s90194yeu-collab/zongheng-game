const assert=require('node:assert/strict');
const {R,config,answerStage}=require('./chapter-player.cjs');
class Host{
 constructor(){this.events={};this.nodes=[];this.html='';this.renders=0;}
 addEventListener(name,fn){this.events[name]=fn;}setPointerCapture(){}releasePointerCapture(){}
 set innerHTML(html){this.html=html;this.renders++;this.nodes=[];for(const tag of html.matchAll(/<([a-z]+)\b([^>]*)>/g)){const attrs={};for(const[,name,value]of tag[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[name]=value||'';const el={attrs,dataset:{},style:{},value:attrs.value||'',disabled:/\bdisabled\b/.test(tag[2]),classList:{toggle(name,on){const classes=new Set((attrs.class||'').split(/\s+/).filter(Boolean));if(on===undefined)on=!classes.has(name);if(on)classes.add(name);else classes.delete(name);attrs.class=[...classes].join(' ');},contains(name){return (attrs.class||'').split(/\s+/).includes(name);}},setAttribute(name,value){this.attrs[name]=String(value);},getAttribute(name){return this.attrs[name]??null;},focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:100,height:100})};for(const[key,value]of Object.entries(attrs))if(key.startsWith('data-'))el.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;el.closest=selector=>this.matches(el,selector)?el:null;this.nodes.push(el);}}
 get innerHTML(){return this.html;}
 matches(el,selector){const m=/^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);return !!m&&m[1]in el.attrs&&(m[2]===undefined||el.attrs[m[1]]===m[2]);}
 querySelectorAll(selector){return this.nodes.filter(el=>this.matches(el,selector));}querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const launch=p=>{const world=R.createChapter(p.id,config(p.id));answerStage(world,'evidence');assert(R.chapterCommand(world,'startMission'));return world;};
module.exports={Host,esc,launch};
