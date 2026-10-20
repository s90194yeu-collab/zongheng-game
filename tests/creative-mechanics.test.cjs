const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),e={window:{ZH:{LEARNING_TEXTS:{}}}};vm.createContext(e);for(const name of ['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations','Literary_canvas','Literary_classics','Literary_seven','Literary_classics_canvas','Literary_seven_canvas','Literary_creative_canvas'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',name+'.html'),'utf8').replace(/<\/?script>/g,''),e);
const ZH=e.window.ZH,L=ZH.literary,creative=require('./helpers/creative-player.cjs'),keys=['archive','haoliang','contracts','weave','paperMoon','riverSong','moonwalk','woodcut'];
const fresh=(mode,index=0)=>L.create({mode,index,key:'creative-test'},false,'read',109);
function api(w){const tick=(k={},sec=1/60)=>{for(let n=0;n<Math.ceil(sec*60)&&w.status==='playing';n++)L.step(w,k,1/60);},cmd=c=>{L.command(w,c);tick();},sel=i=>cmd('select:'+i),wait=(pred,max=2400)=>{let n=0;while(w.status==='playing'&&!pred()&&n++<max)tick();assert(n<max,w.mode+' waiting limit '+JSON.stringify(L.progress(w)));};return {tick,cmd,sel,primary:()=>cmd('primary'),secondary:()=>cmd('secondary'),skill:()=>cmd('skill'),wait};}
test('八款器物／光學／節拍／構圖新玩法，三幕均以合法點按拖曳完成，不需方向移動',()=>{
 for(const mode of keys)for(const index of [0,1,2]){const w=fresh(mode,index);assert.equal(creative.play(L,w,api(w)),true);assert.equal(w.status,'won',mode+'/'+index+' '+JSON.stringify(L.progress(w)));assert(w.time>0&&w.time<w.limit);assert.equal(L.modes[mode].interaction(w).directions,false);}
});
test('新規則的放置與只長按互動均不會自動完成；錯誤的物理／證據操作會被阻擋',()=>{
 for(const mode of keys)for(const held of [false,true]){const w=fresh(mode);const a=api(w);a.tick(held?{action:true}:{},220);assert.notEqual(w.status,'won',mode);}
 const archive=fresh('archive'),am=L.modes.archive;L.point(archive,160,420,true);am.release(archive,160,220);assert.equal(archive.placed.filter(x=>x>=0).length,0);assert(archive.hp<archive.maxHp);
 const fish=fresh('haoliang'),fm=L.modes.haoliang;L.point(fish,155,205,true);fm.release(fish,605,205);assert.equal(fish.pairs.length,0);assert(fish.hp<fish.maxHp);
 const scale=fresh('contracts');L.action(scale);L.secondary(scale);assert.equal(scale.orders[0].done,false);assert.equal(scale.orders[0].measured,false);
 const loom=fresh('weave');L.secondary(loom);api(loom).tick({},4);assert.equal(loom.row,0);assert(loom.fray>0);
 const optics=fresh('paperMoon');api(optics).tick({},5);assert.equal(optics.hold,0);assert.equal(optics.optic.lit,false);
 const camera=fresh('moonwalk');L.action(camera);assert.equal(camera.shots.length,0);assert.equal(camera.film,6);
});
test('取消按壓不會落斧、落簡或接線；局中JSON與三梭織樣可續玩',()=>{
 for(const mode of keys){const w=fresh(mode,1),m=L.modes[mode];L.point(w,500,300,true);m.cancel(w);const saved=JSON.parse(JSON.stringify(w));L.restore(saved);for(let n=0;n<90;n++){L.step(w,{},1/60);L.step(saved,{},1/60);}assert.deepEqual(JSON.parse(JSON.stringify(w)),JSON.parse(JSON.stringify(saved)),mode);assert.equal(w.status,'playing');}
 const w=fresh('woodcut');L.point(w,500,300,true);api(w).tick({},.8);L.modes.woodcut.cancel(w);assert.equal(w.wood,0);assert.equal(w.axeDown,false);assert.equal(w.charge,0);
});
test('新繪圖可畫初始與完成畫面，舊存檔未帶版本旗標時保留原模型與原畫法',()=>{
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 for(const mode of keys){const w=fresh(mode,0);assert.doesNotThrow(()=>ZH.literaryCanvas.draw(ctx,w,{mission:{title:'情境',genre:'驗證',place:'文本'}},{}));creative.play(L,w,api(w));assert.doesNotThrow(()=>ZH.literaryCanvas.draw(ctx,w,{mission:{title:'情境',genre:'驗證',place:'文本'}},{}));const old=fresh(mode);delete old.creativeVersion;L.restore(old);assert.equal(L.modes[mode].interaction(old),null);assert.doesNotThrow(()=>L.step(old,{},1/60));assert.doesNotThrow(()=>ZH.literaryCanvas.draw(ctx,old,{mission:{title:'原存檔',genre:'驗證',place:'文本'}},{}));}
});
test('真實舊版八款24幕存檔，在新版模型中仍可用原按鍵解法通關',()=>{
 const oldEnv={window:{ZH:{LEARNING_TEXTS:{}}}};vm.createContext(oldEnv);
 for(const name of ['Literary_core','Literary_puzzles','Literary_strategy','Literary_action','Literary_simulations']){
  let source=fs.readFileSync(path.join(root,'src/legacy',name+'.html'),'utf8');
  const marker=name==='Literary_puzzles'?' // 第二代直接操作':name==='Literary_simulations'?' // 這些世界另存操作版本':null;
  if(marker){const start=source.indexOf(marker),end=source.lastIndexOf('})(window.ZH.literary);');assert(start>0&&end>start);source=source.slice(0,start)+source.slice(end);}
  vm.runInContext(source.replace(/<\/?script>/g,''),oldEnv);
 }
 const oldL=oldEnv.window.ZH.literary,{play}=require('./helpers/literary-player.cjs');
 for(const mode of keys)for(const index of [0,1,2]){
  const original=oldL.create({mode,index,key:'original-save'},false,'read',8421);assert.equal(original.creativeVersion,undefined);const saved=JSON.parse(JSON.stringify(original));L.restore(saved);const result=play(L,saved);assert.equal(result.status,'won',mode+'/'+index+' '+JSON.stringify(result));assert.equal(saved.creativeVersion,undefined);
 }
});
