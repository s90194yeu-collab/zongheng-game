const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/village/app.js'),'utf8'),ast=acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'}),nodes=[];
function visit(node){if(!node||typeof node!=='object')return;if(node.type)nodes.push(node);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}visit(ast);
function declaration(name){const node=nodes.find(n=>n.type==='FunctionDeclaration'&&n.id?.name===name);assert(node,'找不到函式 '+name);return source.slice(node.start,node.end);}
function listener(target,event){const node=nodes.find(n=>n.type==='CallExpression'&&n.callee.name==='listen'&&n.arguments[0]?.name===target&&n.arguments[1]?.value===event);assert(node,'找不到事件 '+target+':'+event);return source.slice(node.arguments[2].start,node.arguments[2].end);}
function clickHandler(selector){const node=nodes.find(n=>n.type==='AssignmentExpression'&&n.left.type==='MemberExpression'&&n.left.property.name==='onclick'&&n.left.object.type==='CallExpression'&&n.left.object.callee.name==='q'&&n.left.object.arguments[0]?.value===selector);assert(node,'找不到按鈕 '+selector);return source.slice(node.right.start,node.right.end);}
function evaluate(ctx,code){if(!vm.isContext(ctx))vm.createContext(ctx);return vm.runInContext(code,ctx);}
function install(ctx,...names){evaluate(ctx,names.map(declaration).join('\n'));return ctx;}
function invoke(ctx,body,...args){return evaluate(ctx,'('+body+')')(...args);}
function fakeElement(){const classes=new Set(['is-target']);return{hidden:false,textContent:'',dataset:{},children:[],style:{},focus(){this.focused=true;},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},setAttribute(name,value){this[name]=value;},classList:{remove:name=>classes.delete(name),contains:name=>classes.has(name),toggle(name,force){const next=force===undefined?!classes.has(name):force;if(next)classes.add(name);else classes.delete(name);return next;}}};}
function harness(extra={}){
 const elements=new Map(),element=selector=>{if(!elements.has(selector))elements.set(selector,fakeElement());return elements.get(selector);};
 const status=element('[data-v-status]');status.textContent='正在前往春秋史館。跟著光點走。';
 const ctx={path:[{x:0,z:1},{x:0,z:2}],routeTarget:{kind:'hall',id:'cq',name:'春秋史館',x:0,z:2},routeGroup:{visible:true},routeDots:{count:12},lastRouteDistance:'尚餘約 8 步',labels:[{hall:{id:'cq'},element:fakeElement()},{hall:{id:'zg'},element:fakeElement()}],keys:new Set(['up']),status,q:element,canvas:fakeElement(),dialog:{open:false},help:{open:false},artifactDialog:{open:false},closeArtifact(){},guide:{hidden:true},...extra};
 install(ctx,'setStatus','endRoute','stop','modalOpen');return{ctx,element,elements};
}
function keyEvent(code,target){return{code,target,repeat:false,prevented:false,preventDefault(){this.prevented=true;}};}

test('結束帶路清空路徑、目的地與光點，並更新可讀提示而非只藏起路徑面板',()=>{
 const h=harness(),{ctx}=h;ctx.endRoute('已停止帶路，可以自由探索。');assert.equal(ctx.path.length,0);assert.equal(ctx.routeTarget,null);assert.equal(ctx.routeGroup.visible,false);assert.equal(ctx.routeDots.count,0);assert.equal(h.element('[data-v-route-info]').hidden,true);assert.equal(ctx.lastRouteDistance,'');assert(ctx.labels.every(l=>!l.element.classList.contains('is-target')));assert.equal(ctx.status.textContent,'已停止帶路，可以自由探索。');
});
test('開啟導覽或說明時 stop 會清掉前進公告，重複停止不產生新的前進訊息',()=>{
 const h=harness(),{ctx}=h;ctx.stop();assert.equal(ctx.keys.size,0);assert.equal(ctx.path.length,0);assert.equal(ctx.routeTarget,null);assert(!ctx.status.textContent.includes('正在前往'));assert(ctx.status.textContent.includes('停止'));const message=ctx.status.textContent;ctx.stop();assert.equal(ctx.status.textContent,message);
 let opened=0;ctx.help.showModal=()=>{ctx.help.open=true;opened++;};ctx.renderMission=()=>{};ctx.guide.hidden=false;install(ctx,'showHelp');ctx.showHelp();assert.equal(opened,1);assert.equal(ctx.guide.hidden,true);assert.equal(ctx.help.open,true);assert(h.element('[data-v-help-close]').focused);
});
test('無法抵達的新點保留原有路徑與目標，不誤清除正在進行的帶路',()=>{
 const h=harness(),{ctx}=h,oldPath=ctx.path,oldTarget=ctx.routeTarget;let redraw=0,toasts=0;Object.assign(ctx,{position:{x:1,z:1},place:'village',route:()=>[],toast:()=>toasts++,drawRoute:()=>redraw++,renderMission(){}});install(ctx,'navigate');assert.equal(ctx.navigate({x:100,z:100}),false);assert.equal(ctx.path,oldPath);assert.equal(ctx.routeTarget,oldTarget);assert.equal(ctx.routeGroup.visible,true);assert.equal(ctx.routeDots.count,12);assert.equal(redraw,0);assert.equal(toasts,1);assert(ctx.status.textContent.includes('保持不變'));
});
test('取消帶路與鍵盤接管都取消視覺目標，且不留下「前往」狀態',()=>{
 const h=harness(),{ctx}=h;ctx.toast=()=>{};invoke(ctx,clickHandler('[data-v-route-cancel]'));assert.equal(ctx.keys.size,0);assert.equal(ctx.routeTarget,null);assert(!ctx.status.textContent.includes('正在前往'));assert(ctx.canvas.focused);
 const k=harness(),c=k.ctx;c.keyMap={KeyW:'up'};c.interact=()=>{};const event=keyEvent('KeyW',c.canvas);invoke(c,listener('root','keydown'),event);assert(event.prevented);assert(c.keys.has('up'));assert.equal(c.routeTarget,null);assert.equal(c.path.length,0);assert.equal(c.routeGroup.visible,false);assert(c.status.textContent.includes('自行移動'));
});
test('說明、展櫃與展館導覽開啟時，世界方向鍵和 E 不消耗按鍵也不移動或互動',()=>{
 for(const state of ['help','dialog','guide','artifactDialog']){
  const h=harness(),{ctx}=h;ctx.keys.clear();if(state==='guide')ctx.guide.hidden=false;else ctx[state].open=true;ctx.keyMap={KeyW:'up'};let interactions=0;ctx.interact=()=>interactions++;
  for(const code of ['KeyW','KeyE']){const event=keyEvent(code,ctx.canvas);invoke(ctx,listener('root','keydown'),event);assert.equal(event.prevented,false,state+':'+code);}
  assert.equal(ctx.keys.size,0,state);assert.equal(interactions,0,state);assert(ctx.routeTarget,state+' 不應由被攔截按鍵改變目標');
 }
 const h=harness(),ctx=h.ctx;ctx.keys.clear();ctx.keyMap={ArrowDown:'down'};ctx.interact=()=>{};const uiButton={closest:()=>null};const event=keyEvent('ArrowDown',uiButton);invoke(ctx,listener('root','keydown'),event);assert.equal(ctx.keys.size,0);assert.equal(event.prevented,false,'普通按鈕的方向鍵交由瀏覽器處理');
});
function tickHarness(block){
 const h=harness(),c=h.ctx;c.routeTarget=null;c.keys=new Set(['right']);c.path=[];c.position={x:0,z:0};c.place='village';c.museum=null;c.npc={rotation:{y:0}};c.head={rotation:{x:0}};c.GUIDE_POINT={x:0,z:0};c.nearest=null;c.clock={last:0,rendered:0};c.quality='high';c.document={hidden:false};c.visible=true;c.lost=false;c.disposed=false;c.hasMoved=true;c.toastUntil=0;c.media={matches:true};c.mixer={update(){}};c.actor={position:{set(){}},rotation:{y:0}};c.scene={};c.camera={};c.renderer={render(){},info:{render:{calls:3}}};c.frame=0;c.requestAnimationFrame=()=>1;c.animateMotion=()=>{};c.resetCamera=()=>{};c.proximity=()=>{};c.updateLabels=()=>{};c.updateGuide=()=>{};let moved=0;c.move=(p,d)=>{moved++;return{x:p.x+d.x,z:p.z+d.z};};if(block==='guide')c.guide.hidden=false;else if(block)c[block].open=true;install(c,'tick');return{...h,moved:()=>moved};
}
test('動畫迴圈在各種導覽遮罩開啟時不推進角色；關閉遮罩後相同輸入能移動',()=>{
 for(const state of ['help','dialog','guide','artifactDialog'])for(const mode of ['manual','route']){const h=tickHarness(state);if(mode==='route'){h.ctx.keys.clear();h.ctx.path=[{x:4,z:0}];}h.ctx.tick(100);assert.equal(h.ctx.position.x,0,state+':'+mode);assert.equal(h.ctx.position.z,0,state+':'+mode);assert.equal(h.moved(),0,state+':'+mode);}
 const active=tickHarness();active.ctx.tick(100);assert(active.ctx.position.x>0);assert.equal(active.moved(),1);
});
test('抵達館門清理帶路後改成入館提示，不自動進館或觸發選課',()=>{
 const h=harness(),{ctx}=h;const events=[];let selections=0,entries=0;ctx.proximity=()=>{};ctx.updateGuide=(...args)=>events.push(args);ctx.toast=()=>{};ctx.onSelect=()=>selections++;ctx.setPlace=()=>entries++;install(ctx,'arrive');ctx.arrive();assert.equal(ctx.routeTarget,null);assert.equal(ctx.routeGroup.visible,false);assert.equal(ctx.path.length,0);assert(ctx.status.textContent.includes('門口'));assert.equal(events[0][0],'arrive');assert.equal(entries,0);assert.equal(selections,0);
});
test('推薦篇章顯示後若權限變更，點擊仍重新檢查，不能從舊按鈕進入鎖關',()=>{
 const h=harness(),{ctx}=h,catalog=[{id:'open',vol:'cq',status:'ready',name:'原篇章'},{id:'locked',vol:'cq',status:'ready',name:'尚未開放'}];let permitted=true,selected=[],progress=[],notices=[];
 Object.assign(ctx,{museum:{id:'cq',name:'春秋史館',subtitle:'原目錄'},help:{open:false,close(){}},stop(){},selectCase(){ctx.selectedCase='north';},nearest:{id:'north'},catalog,recommendChapters:()=>[catalog[0]],chaptersFor:()=>catalog,canPlay:id=>id==='open'&&permitted,el:(tag,cls,text)=>({...fakeElement(),tagName:tag,className:cls,textContent:text||''}),updateGuide:(...a)=>progress.push(a),renderMission(){},toast:s=>notices.push(s),onSelect:id=>selected.push(id)});
 ctx.dialog.showModal=()=>ctx.dialog.open=true;install(ctx,'exhibit');ctx.exhibit();const buttons=h.element('[data-v-chapters]').children;assert.equal(buttons.length,2);assert.equal(buttons[0].disabled,false);assert.equal(buttons[1].disabled,true);assert(ctx.dialog.open);
 permitted=false;buttons[0].onclick();assert.equal(selected.length,0);assert.equal(progress.filter(a=>a[0]==='select').length,0);assert.equal(notices.length,1);
 permitted=true;buttons[0].onclick();assert.deepEqual(selected,['open']);assert.equal(progress.filter(a=>a[0]==='select').length,1);
});
test('書僮推薦按下時才依最新權限重算，沒有可玩篇章時不帶往鎖關',async()=>{
 const {recommendChapters}=await import('../src/village/guidance.js');const h=harness(),{ctx}=h;let allowed=false,navigated=[];Object.assign(ctx,{recommendChapters,catalog:[{id:'S_cq08_weizheng',vol:'cq',status:'ready'}],canPlay:()=>allowed,museum:null,help:{close(){}},toast(){},updateGuide(){},renderMission(){},goHall:id=>navigated.push(id)});
 invoke(ctx,clickHandler('[data-v-help-recommend]'));assert.equal(navigated.length,0);allowed=true;invoke(ctx,clickHandler('[data-v-help-recommend]'));assert.deepEqual(navigated,['cq']);
});
test('觸控拖曳與 pointercancel 清除起點，後續 pointerup 不會誤觸尋路',()=>{
 const h=harness(),{ctx}=h;let navigations=0;ctx.press={x:0,y:0};ctx.navigate=()=>navigations++;invoke(ctx,listener('canvas','pointerup'),{clientX:40,clientY:0});assert.equal(ctx.press,null);assert.equal(navigations,0);ctx.press={x:10,y:10};invoke(ctx,listener('canvas','pointercancel'));assert.equal(ctx.press,null);invoke(ctx,listener('canvas','pointerup'),{clientX:10,clientY:10});assert.equal(navigations,0);
});
