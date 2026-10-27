import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HALLS,EXHIBITS,move,route,chaptersFor,walkable} from './world.js';

const robeColors={jade:'#46745f',ink:'#47627a',amber:'#967342',crane:'#84959f',plum:'#986579',moon:'#77749d',peach:'#c68e91',sky:'#73a2ad'};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
function disposeTree(root){
 const geometry=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
 root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());skeletons.forEach(s=>s.dispose());
}

export async function mountVillage(root,{assets,catalog=[],canPlay=()=>false,onSelect=()=>{},onClose=()=>{},color='jade',signal}={}){
 root.innerHTML=`<div class="village-shell"><header class="village-top"><div><p class="village-eyebrow">RE：縱橫鼎業 · 博物館村</p><h2 data-v-title>問鼎書院</h2></div><div class="village-top-actions"><button type="button" data-v-camera>俯瞰村莊</button><button type="button" data-v-map>展館導覽</button><button type="button" data-v-close>返回選關</button></div></header><div class="village-stage" data-v-stage><div class="village-labels" aria-hidden="true"></div><div class="village-loading" role="status">正在打開村莊的大門……</div><aside class="village-guide" data-v-guide hidden><h3>想先去哪一館？</h3><p>選一館，策士會沿著小徑走到館門。</p><div data-v-halls></div><p class="village-fine">角色為固定造型試用版，正式造型尚待接入。</p></aside><div class="village-context" data-v-context hidden><p data-v-context-name></p><button type="button" data-v-interact>進入展館</button></div><div class="village-pad" role="group" aria-label="角色移動"><button type="button" data-v-dir="up" aria-label="向前走">↑</button><button type="button" data-v-dir="left" aria-label="向左走">←</button><button type="button" data-v-dir="down" aria-label="向後走">↓</button><button type="button" data-v-dir="right" aria-label="向右走">→</button></div><div class="village-legend"><span class="village-dot"></span><span data-v-location>中央鼎廣場</span></div></div><footer class="village-bottom"><p role="status" aria-live="polite" data-v-status>模型載入中。</p><p>WASD／方向鍵移動 · E 互動 · 點地面走動<span class="village-desktop"> · Shift 奔跑</span></p><button type="button" data-v-respawn>回到廣場</button></footer><dialog class="village-exhibition" data-v-dialog aria-labelledby="village-exhibit-title"><div class="village-exhibit-head"><div><p class="village-eyebrow" data-v-exhibit-sub></p><h3 id="village-exhibit-title"></h3></div><button type="button" data-v-dialog-close>繼續逛展</button></div><p class="village-fine">選擇篇章後，接續原有遊戲入口與帳號權限。</p><div class="village-chapters" data-v-chapters></div></dialog></div>`;
 const q=s=>root.querySelector(s),stage=q('[data-v-stage]'),status=q('[data-v-status]'),title=q('[data-v-title]'),locationLabel=q('[data-v-location]'),guide=q('[data-v-guide]'),dialog=q('[data-v-dialog]');
 q('[data-v-close]').onclick=onClose;
 const aborter=new AbortController(),abort=()=>aborter.abort();signal?.addEventListener('abort',abort,{once:true});
 const timeout=setTimeout(abort,25000),loaded=[];
 let environment,interior,character;
 async function load(url){
  const response=await fetch(url,{signal:aborter.signal,credentials:'omit'});if(!response.ok)throw Error('場景檔案暫時無法讀取，請重新載入。');
  const bytes=await response.arrayBuffer();if(bytes.byteLength>16*1024*1024)throw Error('場景檔案過大。');
  const asset=await new GLTFLoader().parseAsync(bytes,new URL('.',url).href);if(aborter.signal.aborted){disposeTree(asset.scene);throw new DOMException('Cancelled','AbortError');}loaded.push(asset.scene);return asset;
 }
 try{
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  [environment,interior,character]=await Promise.all([load(assets.exterior),load(assets.interior),load(assets.character)]);
  if(aborter.signal.aborted||!root.isConnected)throw new DOMException('Cancelled','AbortError');
 }catch(error){abort();for(const model of loaded)disposeTree(model);throw Error(signal?.aborted?'已停止載入。':'村莊暫時無法開啟，請重試或返回原選關頁。');}
 finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}

 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});}
 catch(error){loaded.forEach(disposeTree);throw Error('這個瀏覽器目前無法開啟3D村莊，請返回原選關頁。');}
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.className='village-canvas';canvas.setAttribute('aria-label','博物館村遊戲畫面，WASD或方向鍵移動，E互動。');
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d4e2df');scene.fog=new THREE.Fog('#d4e2df',45,100);
 scene.add(new THREE.HemisphereLight('#fff3d7','#779d8a',2.5));
 const sun=new THREE.DirectionalLight('#fff0cc',3);sun.position.set(-20,35,18);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-29,right:29,top:29,bottom:-29,near:.5,far:85});sun.shadow.normalBias=.07;sun.shadow.bias=-.0001;scene.add(sun);
 const fill=new THREE.DirectionalLight('#d5e9f1',.7);fill.position.set(25,15,-20);scene.add(fill);
 scene.add(environment.scene);interior.scene.visible=false;scene.add(interior.scene);
 const actor=new THREE.Group();actor.add(character.scene);scene.add(actor);
 scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 character.scene.traverse(o=>{
  if(!o.isMesh)return;o.receiveShadow=false;
  const convert=m=>{const n=new THREE.MeshToonMaterial({name:m.name,color:m.color.clone(),map:m.map||null,normalMap:m.normalMap||null,alphaMap:m.alphaMap||null,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest,side:m.side});if(/^Robe_(Main|Shade)$/.test(m.name)){n.color.set(robeColors[color]||robeColors.jade);if(m.name==='Robe_Shade')n.color.multiplyScalar(.72);}m.dispose();return n;};
  o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);
 });
 const mixer=new THREE.AnimationMixer(character.scene),actions={};
 for(const name of ['Idle','Run']){const clip=character.animations.find(c=>c.name===name);if(!clip){disposeTree(scene);renderer.dispose();throw Error('角色動作不完整，請返回原選關頁。');}actions[name]=mixer.clipAction(clip);}
 let action='Idle';actions.Idle.play();
 const camera=new THREE.PerspectiveCamera(42,1,.1,150),cameraTarget=new THREE.Vector3(0,0,0),cameraGoal=new THREE.Vector3();
 const clock={last:performance.now(),rendered:0},keys=new Set(),cleanup=[],media=matchMedia('(prefers-reduced-motion: reduce)');
 let position={x:0,z:7},place='village',museum=null,path=[],nearest=null,contextKey='',disposed=false,frame=0,overview=false,visible=true,lost=false,moving=false,quality='high',draws=0;
 const labelRoot=q('.village-labels'),labels=HALLS.map(h=>{
  const label=el('div','village-hall-label');label.append(el('span','',h.name),el('small','',h.subtitle));labelRoot.append(label);return {hall:h,element:label};
 });
 const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),hit=new THREE.Vector3();
 function listen(target,name,fn,options){target.addEventListener(name,fn,options);cleanup.push(()=>target.removeEventListener(name,fn,options));}
 function stop(){keys.clear();path=[];}
 function animateMotion(running){const next=running&&!media.matches?'Run':'Idle';if(next===action)return;actions[next].reset().setEffectiveWeight(1).play().crossFadeFrom(actions[action],.18,false);action=next;}
 function setStatus(text){if(status.textContent!==text)status.textContent=text;}
 function navigate(target){
  const result=route(position,target,place);if(!result.length){setStatus('這裡沒有可走的小徑，試試附近的石板路。');return false;}
  path=result;keys.clear();guide.hidden=true;canvas.focus({preventScroll:true});setStatus('沿著小徑前進中，按方向鍵可自行操作。');return true;
 }
 const list=q('[data-v-halls]');
 for(const h of HALLS){const button=el('button','village-hall-link');button.type='button';button.dataset.hall=h.id;button.append(el('strong','',h.name),el('small','',h.subtitle));button.onclick=()=>{if(place!=='village')return;overview=false;navigate(h.entry);};list.append(button);}
 function resetCamera(instant=false,dt=1/30){
  const target=overview&&place==='village'?new THREE.Vector3(0,0,0):new THREE.Vector3(position.x,.8,position.z-1.8);
  const offset=place==='village'?(overview?new THREE.Vector3(34,43,48):new THREE.Vector3(13,19,22)):new THREE.Vector3(10,16,16);
  cameraGoal.copy(target).add(offset);
  if(instant){camera.position.copy(cameraGoal);cameraTarget.copy(target);}else{const blend=1-Math.exp(-7*dt);camera.position.lerp(cameraGoal,blend);cameraTarget.lerp(target,blend);}
  camera.lookAt(cameraTarget);
 }
 function setPlace(id){
  stop();dialog.close();museum=HALLS.find(h=>h.id===id)||null;place=museum?museum.id:'village';
  environment.scene.visible=!museum;interior.scene.visible=!!museum;
  position=museum?{x:0,z:4.2}:{x:0,z:7};actor.position.set(position.x,.12,position.z);actor.rotation.y=Math.PI;
  title.textContent=museum?museum.name:'問鼎書院';locationLabel.textContent=museum?museum.subtitle:'中央鼎廣場';
  q('[data-v-map]').disabled=!!museum;q('[data-v-respawn]').textContent=museum?'走出展館':'回到廣場';guide.hidden=true;
  overview=false;contextKey='';nearest=null;q('[data-v-context]').hidden=true;resetCamera(true);setStatus(museum?'走近展櫃，按 E 或下方按鈕挑選篇章。':'走近一座展館，開始你的古文旅程。');
 }
 function leaveMuseum(){const previous=museum;setPlace(null);if(previous){position={x:previous.entry.x,z:previous.entry.z};actor.position.set(position.x,.12,position.z);resetCamera(true);}}
 function exhibit(){
  if(!museum)return;stop();q('#village-exhibit-title').textContent=museum.name+' · 展藏篇章';q('[data-v-exhibit-sub]').textContent=museum.subtitle;
  const list=q('[data-v-chapters]');list.replaceChildren();
  for(const chapter of chaptersFor(catalog,museum.id)){
   const button=el('button','village-chapter');button.type='button';button.dataset.chapter=chapter.id;
   const allowed=!!canPlay(chapter.id);button.disabled=!allowed;
   button.append(el('span','village-chapter-no',String(chapter.ep>0?chapter.ep:'卷')),el('strong','',chapter.name),el('small','',chapter.source||chapter.episode||''),el('span','village-chapter-state',allowed?'進入篇章 →':'需學校帳號'));
   button.onclick=()=>{if(!canPlay(chapter.id))return;stop();onSelect(chapter.id);};list.append(button);
  }
  if(!list.children.length)list.append(el('p','','這個展館的篇章正在整理中。'));
  dialog.showModal();q('[data-v-dialog-close]').focus();
 }
 function interact(){if(lost||dialog.open)return;if(place==='village'){if(nearest)setPlace(nearest.id);}else if(nearest?.id==='exit')leaveMuseum();else if(nearest)exhibit();}
 function proximity(){
  const candidates=museum?[{id:'exit',name:'回到村莊',x:0,z:6.5},...EXHIBITS]:HALLS.map(h=>({...h,x:h.entry.x,z:h.entry.z}));
  nearest=candidates.find(h=>Math.hypot(position.x-h.x,position.z-h.z)<2.05)||null;
  const key=nearest?.id||'';if(key===contextKey)return;contextKey=key;
  q('[data-v-context]').hidden=!nearest;if(nearest){q('[data-v-context-name]').textContent=nearest.name;q('[data-v-interact]').textContent=museum?(nearest.id==='exit'?'走出展館 · E':'觀看篇章 · E'):'進入'+nearest.name+' · E';}
 }
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;quality=innerWidth<700?'low':'high';renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='low'?1:1.5));renderer.shadowMap.enabled=quality==='high';renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();}
 function updateLabels(){
  const vec=new THREE.Vector3();for(const {hall,element} of labels){if(museum){element.hidden=true;continue;}
   vec.set(hall.x,6+(hall.id==='zz'?3:0),hall.z);vec.project(camera);
   element.hidden=vec.z>1||Math.abs(vec.x)>1.1||Math.abs(vec.y)>1.1;
   element.style.transform=`translate(-50%,-50%) translate(${(vec.x*.5+.5)*stage.clientWidth}px,${(-vec.y*.5+.5)*stage.clientHeight}px)`;
  }
 }
 function tick(time){
  if(disposed)return;frame=requestAnimationFrame(tick);if(time-clock.rendered<1000/(quality==='low'?24:30))return;
  const dt=Math.min(.10,Math.max(0,(time-clock.last)/1000));clock.last=time;clock.rendered=time;
  if(document.hidden||!visible||lost)return;
  const before={...position};
  if(!dialog.open){
   let x=(keys.has('right')?1:0)-(keys.has('left')?1:0),z=(keys.has('down')?1:0)-(keys.has('up')?1:0);
   const manual=x||z;
   if(manual)path=[];
   else if(path.length){x=path[0].x-position.x;z=path[0].z-position.z;if(Math.hypot(x,z)<.15){path.shift();x=0;z=0;}}
   const length=Math.hypot(x,z);if(length){const speed=keys.has('sprint')?5.8:path.length?4.8:3.5;const stride=Math.min(speed*dt,length);position=move(position,{x:x/length*stride,z:z/length*stride},place);}
  }
  moving=Math.hypot(position.x-before.x,position.z-before.z)>.001;animateMotion(moving);
  if(moving){const desired=Math.atan2(position.x-before.x,position.z-before.z);let d=desired-actor.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));actor.rotation.y+=d*Math.min(1,dt*13);}
  actor.position.set(position.x,.12,position.z);if(!media.matches)mixer.update(dt);resetCamera(false,dt);proximity();updateLabels();renderer.render(scene,camera);draws=renderer.info.render.calls;
 }
 const keyMap={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sprint',ShiftRight:'sprint'};
 listen(root,'keydown',event=>{if(dialog.open)return;if(['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;
  if(keyMap[event.code]){event.preventDefault();keys.add(keyMap[event.code]);}
  if(event.code==='KeyE'&&!event.repeat){event.preventDefault();interact();}
 });
 listen(window,'keyup',event=>{if(keyMap[event.code])keys.delete(keyMap[event.code]);});
 listen(window,'blur',()=>keys.clear());listen(document,'visibilitychange',()=>{keys.clear();clock.last=performance.now();});
 let press=null;
 listen(canvas,'pointerdown',event=>{press={x:event.clientX,y:event.clientY};canvas.focus({preventScroll:true});});
 listen(canvas,'pointerup',event=>{
  if(!press||Math.hypot(event.clientX-press.x,event.clientY-press.y)>12||dialog.open)return;press=null;
  const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);ray.setFromCamera(pointer,camera);
  if(ray.ray.intersectPlane(ground,hit)&&walkable({x:hit.x,z:hit.z},place)){overview=false;navigate({x:hit.x,z:hit.z});}
 });
 for(const button of root.querySelectorAll('[data-v-dir]')){
  listen(button,'pointerdown',event=>{event.preventDefault();path=[];keys.add(button.dataset.vDir);button.setPointerCapture(event.pointerId);});
  const up=()=>keys.delete(button.dataset.vDir);listen(button,'pointerup',up);listen(button,'pointercancel',up);listen(button,'lostpointercapture',up);
 }
 q('[data-v-camera]').onclick=()=>{overview=!overview;q('[data-v-camera]').textContent=overview?'跟隨策士':'俯瞰村莊';canvas.focus({preventScroll:true});};
 q('[data-v-map]').onclick=()=>{guide.hidden=!guide.hidden;stop();};q('[data-v-interact]').onclick=interact;
 q('[data-v-respawn]').onclick=()=>{if(museum)leaveMuseum();else setPlace(null);canvas.focus({preventScroll:true});};
 q('[data-v-dialog-close]').onclick=()=>{dialog.close();canvas.focus({preventScroll:true});};
 listen(dialog,'cancel',()=>{stop();});
 listen(canvas,'webglcontextlost',event=>{event.preventDefault();lost=true;stop();setStatus('立體畫面暫時中斷，請返回選關後重新開啟村莊。');});
 listen(canvas,'webglcontextrestored',()=>{lost=false;clock.last=performance.now();setStatus('村莊畫面已恢復。');});
 listen(media,'change',()=>{if(media.matches){mixer.stopAllAction();actions.Idle.reset().play();mixer.update(0);action='Idle';}});
 const observer=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;clock.last=performance.now();});
 observer.observe(stage);intersection.observe(stage);stage.prepend(canvas);q('.village-loading').remove();setPlace(null);resize();resetCamera(true);frame=requestAnimationFrame(tick);canvas.focus({preventScroll:true});
 function dispose(){if(disposed)return;disposed=true;stop();cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();cleanup.forEach(fn=>fn());mixer.stopAllAction();mixer.uncacheRoot(character.scene);disposeTree(scene);sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();dialog.close();root.replaceChildren();}
 return {dispose,navigateToHall(id){const h=HALLS.find(h=>h.id===id);if(place!=='village'||!h)return false;return navigate(h.entry);},
  inspect(){return {place,position:{...position},museum:museum?.id||null,animation:action,animationTime:actions[action].time,moving,pathRemaining:path.length,near:nearest?.id||null,drawCalls:draws,quality,pixelRatio:renderer.getPixelRatio(),reduced:media.matches,lost,disposed,dialog:dialog.open,chapterCount:museum?chaptersFor(catalog,museum.id).length:0};}};
}
