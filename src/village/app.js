import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {HALLS,EXHIBITS,move,route,chaptersFor,walkable} from './world.js';
import {HALL_GUIDES,createGuideState,advanceGuide,guideStep,recommendChapters} from './guidance.js';

const robeColors={jade:'#46745f',ink:'#47627a',amber:'#967342',crane:'#84959f',plum:'#986579',moon:'#77749d',peach:'#c68e91',sky:'#73a2ad'};
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
function disposeTree(root){
 const geometry=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
 root.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.skeleton)skeletons.add(o.skeleton);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());skeletons.forEach(s=>s.dispose());
}

export async function mountVillage(root,{assets,catalog=[],canPlay=()=>false,onSelect=()=>{},onClose=()=>{},color='jade',signal}={}){
 root.innerHTML=`<div class="village-shell">
 <header class="village-top"><div><p class="village-eyebrow">RE：縱橫鼎業 · 博物館村</p><h2 data-v-title>問鼎書院</h2></div><div class="village-top-actions"><button type="button" data-v-help>遊玩指引</button><button type="button" data-v-camera>俯瞰村莊</button><button type="button" data-v-map>展館導覽</button><button type="button" data-v-close>返回選關</button></div></header>
 <div class="village-stage" data-v-stage><div class="village-labels"></div><div class="village-loading" role="status">正在打開村莊的大門……</div>
 <aside class="village-mission" data-v-mission hidden aria-label="探索指引"><span class="village-mission__step" data-v-step></span><h3 data-v-mission-title></h3><p data-v-mission-body></p><div class="village-mission__steps" data-v-steps></div><div><button type="button" data-v-next>選一館帶路</button><button type="button" data-v-dismiss>自由探索</button></div></aside>
 <div class="village-route-info" data-v-route-info hidden><strong data-v-route-name></strong><span data-v-route-distance></span><button type="button" data-v-route-cancel>停止帶路</button></div>
 <aside class="village-guide" data-v-guide hidden aria-label="展館導覽"><h3>今天想探索哪種故事？</h3><p>選場館或地圖上的館名，跟著光點前往。</p><div class="village-guide-list" data-v-halls></div><button type="button" data-v-guide-close>先自由逛逛</button></aside>
 <div class="village-context" data-v-context hidden><p data-v-context-name></p><button type="button" data-v-interact>進入展館</button></div>
 <div class="village-pad" role="group" aria-label="角色移動"><button type="button" data-v-dir="up" aria-label="向前走">↑</button><button type="button" data-v-dir="left" aria-label="向左走">←</button><button type="button" data-v-dir="down" aria-label="向後走">↓</button><button type="button" data-v-dir="right" aria-label="向右走">→</button></div>
 <aside class="village-minimap" data-v-minimap aria-label="村莊小地圖"><h3>六館方位</h3><button type="button" data-v-minimap-toggle aria-expanded="true">收起地圖</button><div class="village-minimap__map" data-v-map-surface></div><p>圓點是你的位置 · 點館名可帶路</p></aside>
 <div class="village-legend"><span class="village-dot"></span><span data-v-location>中央鼎廣場</span></div><div class="village-toast" data-v-toast role="status" hidden></div></div>
 <footer class="village-bottom"><p role="status" aria-live="polite" data-v-status>模型載入中。</p><p>WASD／方向鍵移動 · E 互動 · 點地面走動<span class="village-desktop"> · Shift 奔跑</span></p><button type="button" data-v-respawn>回到廣場</button></footer>
 <dialog class="village-exhibition" data-v-dialog aria-labelledby="village-exhibit-title"><div class="village-exhibit-head"><div><p class="village-eyebrow" data-v-exhibit-sub></p><h3 id="village-exhibit-title"></h3></div><button type="button" data-v-dialog-close>繼續逛展</button></div><div class="village-exhibit-tabs" data-v-case-tabs></div><div class="village-exhibit-intro"><h4 data-v-case-title></h4><p data-v-case-intro></p><strong data-v-case-question></strong></div><p class="village-fine">先帶著一個問題讀原文。下方保留本館完整篇章，進入後沿用原帳號與存檔。</p><div class="village-chapters" data-v-chapters></div></dialog>
 <dialog class="village-help-dialog village-exhibition" data-v-help-dialog aria-labelledby="village-help-title"><div class="village-exhibit-head"><div><p class="village-eyebrow">引路書僮 · 探索手札</p><h3 id="village-help-title">先逛一館，再讀一篇</h3></div><button type="button" data-v-help-close>回到探索</button></div><ol><li>點館名、小地圖或「展館導覽」，光點會帶你走到館門。</li><li>到館門後按 E 或「進入展館」，不會自動替你進關。</li><li>靠近展櫃，看情境、人物與原文三種導讀，再選一篇課文。</li><li>課文仍照原來玩法進行；參觀導覽不會計作學習成績。</li></ol><p>也可以直接用方向鍵、畫面方向鈕或點地面移動。遇到牆面時，試著點附近石板路；「停止帶路」可隨時取消目標。</p><div><button type="button" data-v-help-recommend>幫我挑一篇可玩的課</button><button type="button" data-v-help-resume>繼續探索指引</button></div></dialog></div>`;
 const q=s=>root.querySelector(s),stage=q('[data-v-stage]'),status=q('[data-v-status]'),title=q('[data-v-title]'),locationLabel=q('[data-v-location]'),guide=q('[data-v-guide]'),dialog=q('[data-v-dialog]'),help=q('[data-v-help-dialog]'),mission=q('[data-v-mission]'),minimap=q('[data-v-minimap]');
 q('[data-v-close]').onclick=onClose;
 const aborter=new AbortController(),abort=()=>aborter.abort();signal?.addEventListener('abort',abort,{once:true});
 const timeout=setTimeout(abort,25000),loaded=[];
 let environment,interior,character;
 async function load(url){
  const response=await fetch(url,{signal:aborter.signal,credentials:'omit'});if(!response.ok)throw Error('場景檔案暫時無法讀取，請重新載入。');
  const bytes=await response.arrayBuffer();if(bytes.byteLength>16*1024*1024)throw Error('場景檔案過大。');
  const asset=await new GLTFLoader().parseAsync(bytes,new URL('.',url).href);if(aborter.signal.aborted){disposeTree(asset.scene);throw new DOMException('Cancelled','AbortError');}loaded.push(asset.scene);const loading=q('.village-loading');if(loading)loading.textContent='正在準備場景（'+loaded.length+'／3）……';return asset;
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
 let guideState=createGuideState(),routeTarget=null,toastUntil=0,selectedCase='north',lastRouteDistance='',hasMoved=false;
 const GUIDE_POINT={id:'guide',name:'引路書僮',x:-3.2,z:5.3};
 const routeGroup=new THREE.Group();scene.add(routeGroup);
 const routeLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:'#ac7732',dashSize:.32,gapSize:.18,transparent:true,opacity:.95}));routeGroup.add(routeLine);
 const routeDots=new THREE.InstancedMesh(new THREE.RingGeometry(.13,.19,16),new THREE.MeshBasicMaterial({color:'#b9842c',side:THREE.DoubleSide}),24);routeGroup.add(routeDots);routeDots.count=0;
 const beacon=new THREE.Mesh(new THREE.ConeGeometry(.24,.65,4),new THREE.MeshBasicMaterial({color:'#f7c969'}));beacon.rotation.z=Math.PI;routeGroup.add(beacon);routeGroup.visible=false;
 const npc=new THREE.Group(),npcSkin=new THREE.MeshToonMaterial({color:'#ead5b3'}),npcRobe=new THREE.MeshToonMaterial({color:'#c18d53'}),npcHair=new THREE.MeshToonMaterial({color:'#303f43'});
 const robe=new THREE.Mesh(new THREE.ConeGeometry(.34,.85,6),npcRobe);robe.position.y=.53;const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8),npcSkin);head.position.y=1.12;const hat=new THREE.Mesh(new THREE.SphereGeometry(.2,12,6,0,Math.PI*2,0,Math.PI/2),npcHair);hat.position.y=1.16;const book=new THREE.Mesh(new THREE.BoxGeometry(.4,.27,.09),new THREE.MeshToonMaterial({color:'#f7e5b2'}));book.position.set(0,.8,.29);npc.add(robe,head,hat,book);npc.position.set(GUIDE_POINT.x,.12,GUIDE_POINT.z);scene.add(npc);
 const labelRoot=q('.village-labels'),labels=HALLS.map(h=>{
  const label=el('button','village-hall-label');label.type='button';label.setAttribute('aria-label','帶路到'+h.name);label.append(el('span','',h.name),el('small','',h.subtitle));label.onclick=()=>goHall(h.id);labelRoot.append(label);return {hall:h,element:label};
 });
 const npcLabel=el('button','village-hall-label');npcLabel.type='button';npcLabel.setAttribute('aria-label','帶路到引路書僮');npcLabel.append(el('span','','引路書僮'),el('small','','不知道去哪？來聊聊'));npcLabel.onclick=()=>navigate(GUIDE_POINT,{kind:'guide',id:'guide',name:'引路書僮'});labelRoot.append(npcLabel);
 const mapSurface=q('[data-v-map-surface]');for(const hall of HALLS){const b=el('button','',hall.name.replace('史館','').replace('學宮','').replace('書院','').replace('雅集',''));b.type='button';b.dataset.mapHall=hall.id;const mark={cq:[12,23],zg:[50,10],ch:[88,23],zz:[10,58],gw:[90,58],al:[25,91]}[hall.id];b.style.left=mark[0]+'%';b.style.top=mark[1]+'%';b.setAttribute('aria-label','地圖帶路到'+hall.name);b.onclick=()=>goHall(hall.id);mapSurface.append(b);}const mapPlayer=el('span','village-map-player');mapPlayer.dataset.vMapPlayer='';mapPlayer.setAttribute('aria-label','你的位置');mapSurface.append(mapPlayer);
 if(innerWidth<700)minimap.classList.add('is-collapsed');
 const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),hit=new THREE.Vector3();
 function listen(target,name,fn,options){target.addEventListener(name,fn,options);cleanup.push(()=>target.removeEventListener(name,fn,options));}
 function stop(){keys.clear();endRoute();}
 function modalOpen(){return dialog.open||help.open;}
 function animateMotion(running){const next=running&&!media.matches?'Run':'Idle';if(next===action)return;actions[next].reset().setEffectiveWeight(1).play().crossFadeFrom(actions[action],.18,false);action=next;}
 function setStatus(text){if(status.textContent!==text)status.textContent=text;}
 function toast(text){const box=q('[data-v-toast]');box.textContent=text;box.hidden=false;toastUntil=performance.now()+3600;}
 function updateGuide(event,payload={}){guideState=advanceGuide(guideState,event,payload);renderMission();}
 function renderMission(){
  const step=guideStep(guideState);mission.hidden=!step.visible||!guide.hidden||modalOpen();
  q('[data-v-step]').textContent='探索指引 · '+Math.min(step.index+1,4)+'／4';q('[data-v-mission-title]').textContent=step.title;q('[data-v-mission-body]').textContent=step.body;
  q('[data-v-next]').textContent=step.label;q('[data-v-steps]').replaceChildren(...['找館','入館','觀展','選課'].map((t,i)=>{const n=el('span',i<step.index?'is-done':i===step.index?'is-current':'',t);return n;}));
 }
 function endRoute(message=''){
  const wasNavigating=!!routeTarget;path=[];routeTarget=null;routeGroup.visible=false;routeDots.count=0;q('[data-v-route-info]').hidden=true;lastRouteDistance='';
  if(message)setStatus(message);else if(wasNavigating)setStatus('帶路已停止。關閉說明後可自由探索，或再次選一館出發。');labels.forEach(l=>l.element.classList.remove('is-target'));
 }
 function drawRoute(points){
  routeLine.geometry.dispose();routeLine.geometry=new THREE.BufferGeometry().setFromPoints([{...position},...points].map(p=>new THREE.Vector3(p.x,.18,p.z)));routeLine.computeLineDistances();
  const matrix=new THREE.Matrix4(),step=Math.max(1,Math.ceil(points.length/24));let count=0;
  for(let i=0;i<points.length&&count<24;i+=step){matrix.makeRotationX(-Math.PI/2);matrix.setPosition(points[i].x,.2,points[i].z);routeDots.setMatrixAt(count++,matrix);}
  routeDots.count=count;routeDots.instanceMatrix.needsUpdate=true;const end=points.at(-1);beacon.position.set(end.x,1.5,end.z);routeGroup.visible=true;
 }
 function navigate(target,info={kind:'ground',name:'選定位置'}){
  const result=route(position,target,place);if(!result.length){toast('這裡走不到，試著點石板路，或用展館導覽帶路。');setStatus('目標無法抵達，原本的位置與路線保持不變。');return false;}
  keys.clear();path=result;routeTarget={...info,x:target.x,z:target.z};drawRoute(result);guide.hidden=true;
  q('[data-v-route-info]').hidden=false;q('[data-v-route-name]').textContent='前往'+info.name;lastRouteDistance='';canvas.focus({preventScroll:true});
  labels.forEach(l=>l.element.classList.toggle('is-target',l.hall.id===info.id));renderMission();setStatus('正在前往'+info.name+'。跟著光點走，可隨時停止帶路或改用方向鍵。');return true;
 }
 function goHall(id){const h=HALLS.find(h=>h.id===id);if(!h||place!=='village')return false;overview=false;const ok=navigate(h.entry,{kind:'hall',id:h.id,name:h.name});if(ok)updateGuide('start',{hallId:h.id});return ok;}
 function arrive(){
  const target=routeTarget;if(!target)return;endRoute();proximity();
  if(target.kind==='hall'){updateGuide('arrive',{hallId:target.id});toast('已抵達'+target.name+'，按 E 或「進入展館」。');setStatus('已到'+target.name+'門口。選擇「進入展館」或按 E。');}
  else if(target.kind==='case'){toast('已到展櫃，按 E 看導讀與篇章。');setStatus('已到'+target.name+'，可觀看篇章。');}
  else if(target.kind==='guide'){toast('引路書僮在這裡，按 E 聊聊。');setStatus('靠近書僮後，可請他推薦一篇可玩的課。');}
  else setStatus('已到選定位置。靠近館門或書僮時會出現互動按鈕。');
 }
 const list=q('[data-v-halls]');
 for(const h of HALLS){const button=el('button','village-hall-link');button.type='button';button.dataset.hall=h.id;const all=chaptersFor(catalog,h.id),available=all.filter(c=>canPlay(c.id));button.append(el('strong','',h.name),el('small','',h.subtitle),el('span','village-hall-detail',HALL_GUIDES[h.id].reason),el('span','village-hall-count',available.length+'篇可進入 · 共'+all.length+'篇'));button.onclick=()=>goHall(h.id);list.append(button);}
 function resetCamera(instant=false,dt=1/30){
  const target=overview&&place==='village'?new THREE.Vector3(0,0,0):new THREE.Vector3(position.x,.8,position.z-1.8);
  const offset=place==='village'?(overview?new THREE.Vector3(34,43,48):new THREE.Vector3(13,19,22)):new THREE.Vector3(10,16,16);
  cameraGoal.copy(target).add(offset);
  if(instant){camera.position.copy(cameraGoal);cameraTarget.copy(target);}else{const blend=1-Math.exp(-7*dt);camera.position.lerp(cameraGoal,blend);cameraTarget.lerp(target,blend);}
  camera.lookAt(cameraTarget);
 }
 function setPlace(id){
  stop();dialog.close();help.close();museum=HALLS.find(h=>h.id===id)||null;place=museum?museum.id:'village';
  environment.scene.visible=!museum;interior.scene.visible=!!museum;npc.visible=!museum;npcLabel.hidden=!!museum;minimap.hidden=!!museum;
  position=museum?{x:0,z:4.2}:{x:0,z:7};actor.position.set(position.x,.12,position.z);actor.rotation.y=Math.PI;
  title.textContent=museum?museum.name:'問鼎書院';locationLabel.textContent=museum?museum.subtitle:'中央鼎廣場';
  q('[data-v-map]').disabled=!!museum;q('[data-v-respawn]').textContent=museum?'走出展館':'回到廣場';guide.hidden=true;
  overview=false;contextKey='';nearest=null;q('[data-v-context]').hidden=true;resetCamera(true);setStatus(museum?'到館了。走近展櫃看三種導讀，或按左上指引帶路。':'可點館名或小地圖帶路；也能去和引路書僮聊聊。');if(museum)updateGuide('enter',{hallId:museum.id});renderMission();
 }
 function leaveMuseum(){const previous=museum;updateGuide('leave');setPlace(null);if(previous){position={x:previous.entry.x,z:previous.entry.z};actor.position.set(position.x,.12,position.z);resetCamera(true);}}
 function selectCase(id){
  if(!museum)return;selectedCase=id;const copy=HALL_GUIDES[museum.id].exhibits[id]||HALL_GUIDES[museum.id].exhibits.north;
  q('[data-v-case-title]').textContent=copy.title;q('[data-v-case-intro]').textContent=copy.intro;q('[data-v-case-question]').textContent='帶著問題讀：'+copy.question;
  root.querySelectorAll('[data-v-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vCase===id)));
 }
 function exhibit(){
  if(!museum)return;stop();help.close();q('#village-exhibit-title').textContent=museum.name+' · 展藏篇章';q('[data-v-exhibit-sub]').textContent=museum.subtitle;
  const tabs=q('[data-v-case-tabs]');tabs.replaceChildren();for(const [id,label]of [['west','人物抉擇'],['north','情境線索'],['east','原文提問']]){const b=el('button','',label);b.type='button';b.dataset.vCase=id;b.onclick=()=>{selectCase(id);updateGuide('exhibit',{hallId:museum.id,exhibitId:id});};tabs.append(b);}
  selectCase(nearest&&nearest.id!=='exit'?nearest.id:'north');const list=q('[data-v-chapters]');list.replaceChildren();
  const recommended=new Set(recommendChapters(catalog,canPlay,{hallId:museum.id,limit:2}).map(c=>c.id));
  for(const chapter of chaptersFor(catalog,museum.id)){
   const button=el('button','village-chapter');button.type='button';button.dataset.chapter=chapter.id;const allowed=!!canPlay(chapter.id);button.disabled=!allowed;
   button.append(el('span','village-chapter-no',String(chapter.ep>0?chapter.ep:'卷')),el('strong','',chapter.name),el('small','',chapter.source||chapter.episode||''),el('span','village-chapter-state',allowed?'進入篇章 →':'需學校帳號'));
   if(recommended.has(chapter.id))button.append(el('em','','可從這篇開始探索'));
   button.onclick=()=>{if(!canPlay(chapter.id)){toast('這篇需要學校帳號，請選可進入的篇章。');return;}updateGuide('select',{chapterId:chapter.id});stop();onSelect(chapter.id);};list.append(button);
  }
  if(!list.children.length)list.append(el('p','','這個展館的篇章正在整理中。'));
  updateGuide('exhibit',{hallId:museum.id,exhibitId:selectedCase});dialog.showModal();renderMission();q('[data-v-dialog-close]').focus();
 }
 function showHelp(){stop();guide.hidden=true;if(dialog.open)dialog.close();help.showModal();renderMission();q('[data-v-help-close]').focus();}
 function interact(){if(lost||modalOpen())return;if(place==='village'){if(nearest?.id==='guide')showHelp();else if(nearest)setPlace(nearest.id);}else if(nearest?.id==='exit')leaveMuseum();else if(nearest)exhibit();}
 function proximity(){
  const candidates=museum?[{id:'exit',name:'回到村莊',x:0,z:6.5},...EXHIBITS]:HALLS.map(h=>({...h,x:h.entry.x,z:h.entry.z})).concat([GUIDE_POINT]);
  nearest=candidates.find(h=>Math.hypot(position.x-h.x,position.z-h.z)<2.05)||null;
  const key=nearest?.id||'';if(key===contextKey)return;contextKey=key;
  if(nearest&&!museum&&nearest.id!=='guide'&&guideState.stage!=='arrived')updateGuide('arrive',{hallId:nearest.id});
  q('[data-v-context]').hidden=!nearest;if(nearest){q('[data-v-context-name]').textContent=nearest.name;q('[data-v-interact]').textContent=museum?(nearest.id==='exit'?'走出展館 · E':'觀看篇章 · E'):nearest.id==='guide'?'和書僮聊聊 · E':'進入'+nearest.name+' · E';}
 }
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;quality=innerWidth<700?'low':'high';renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='low'?1:1.5));renderer.shadowMap.enabled=quality==='high';renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();}
 const labelVector=new THREE.Vector3();
 function placeLabel(element,x,y,z){labelVector.set(x,y,z).project(camera);element.hidden=labelVector.z>1||Math.abs(labelVector.x)>1.1||Math.abs(labelVector.y)>1.1;element.style.transform=`translate(-50%,-50%) translate(${Math.max(80,Math.min(stage.clientWidth-80,(labelVector.x*.5+.5)*stage.clientWidth))}px,${Math.max(45,Math.min(stage.clientHeight-45,(-labelVector.y*.5+.5)*stage.clientHeight))}px)`;}
 function updateLabels(){
  for(const {hall,element} of labels){if(museum){element.hidden=true;continue;}placeLabel(element,hall.x,6+(hall.id==='zz'?3:0),hall.z);element.classList.toggle('is-near',nearest?.id===hall.id);}
  if(!museum)placeLabel(npcLabel,GUIDE_POINT.x,2.1,GUIDE_POINT.z);
  mapPlayer.style.left=(position.x+26)/52*100+'%';mapPlayer.style.top=(position.z+26)/52*100+'%';
 }
 function tick(time){
  if(disposed)return;frame=requestAnimationFrame(tick);if(time-clock.rendered<1000/(quality==='low'?24:30))return;
  const dt=Math.min(.10,Math.max(0,(time-clock.last)/1000));clock.last=time;clock.rendered=time;
  if(document.hidden||!visible||lost)return;
  const before={...position};
  if(!modalOpen()&&guide.hidden){
   let x=(keys.has('right')?1:0)-(keys.has('left')?1:0),z=(keys.has('down')?1:0)-(keys.has('up')?1:0);
   const manual=x||z;
   if(manual)path=[];
   else if(path.length){x=path[0].x-position.x;z=path[0].z-position.z;if(Math.hypot(x,z)<.15){path.shift();x=0;z=0;if(!path.length)arrive();}}
   const length=Math.hypot(x,z);if(length){const speed=keys.has('sprint')?5.8:path.length?4.8:3.5;const stride=Math.min(speed*dt,length);position=move(position,{x:x/length*stride,z:z/length*stride},place);}
  }
  moving=Math.hypot(position.x-before.x,position.z-before.z)>.001;animateMotion(moving);if(moving&&!hasMoved){hasMoved=true;updateGuide('move');}
  if(routeTarget){const d=Math.round(Math.hypot(routeTarget.x-position.x,routeTarget.z-position.z));const text='尚餘約 '+d+' 步';if(text!==lastRouteDistance){q('[data-v-route-distance]').textContent=text;lastRouteDistance=text;}beacon.position.y=1.5+(media.matches?0:Math.sin(time*.004)*.12);}
  if(toastUntil&&time>toastUntil){q('[data-v-toast]').hidden=true;toastUntil=0;}
  if(moving){const desired=Math.atan2(position.x-before.x,position.z-before.z);let d=desired-actor.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));actor.rotation.y+=d*Math.min(1,dt*13);}
  actor.position.set(position.x,.12,position.z);if(!media.matches)mixer.update(dt);resetCamera(false,dt);proximity();updateLabels();renderer.render(scene,camera);draws=renderer.info.render.calls;
 }
 const keyMap={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'sprint',ShiftRight:'sprint'};
 listen(root,'keydown',event=>{if(event.code==='Escape'&&!guide.hidden){event.preventDefault();event.stopPropagation();guide.hidden=true;renderMission();canvas.focus({preventScroll:true});return;}if(modalOpen()||!guide.hidden||!(event.target===canvas||event.target.closest?.('[data-v-dir]')))return;
  if(keyMap[event.code]){event.preventDefault();if(routeTarget)endRoute('已改為自行移動；可再次點館名帶路。');keys.add(keyMap[event.code]);}
  if(event.code==='KeyE'&&!event.repeat){event.preventDefault();interact();}
 });
 listen(window,'keyup',event=>{if(keyMap[event.code])keys.delete(keyMap[event.code]);});
 listen(window,'blur',()=>keys.clear());listen(document,'visibilitychange',()=>{keys.clear();clock.last=performance.now();});
 let press=null;
 listen(canvas,'pointerdown',event=>{press={x:event.clientX,y:event.clientY};canvas.focus({preventScroll:true});});
 listen(canvas,'pointerup',event=>{
  const start=press;press=null;if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>12||modalOpen()||!guide.hidden)return;
  const bounds=canvas.getBoundingClientRect();pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);ray.setFromCamera(pointer,camera);
  if(ray.ray.intersectPlane(ground,hit)){overview=false;if(walkable({x:hit.x,z:hit.z},place))navigate({x:hit.x,z:hit.z});else{toast('這裡是建物或庭園，請點附近石板路；點館名可直接帶路。');setStatus('無法走到該位置。');}}
 });
 listen(canvas,'pointercancel',()=>{press=null;});
 for(const button of root.querySelectorAll('[data-v-dir]')){
  listen(button,'pointerdown',event=>{event.preventDefault();if(modalOpen()||!guide.hidden)return;if(routeTarget)endRoute('已改為方向鈕移動。');keys.add(button.dataset.vDir);button.setPointerCapture(event.pointerId);});
  const up=()=>keys.delete(button.dataset.vDir);listen(button,'pointerup',up);listen(button,'pointercancel',up);listen(button,'lostpointercapture',up);
 }
 q('[data-v-camera]').onclick=()=>{overview=!overview;q('[data-v-camera]').textContent=overview?'跟隨策士':'俯瞰村莊';canvas.focus({preventScroll:true});};
 q('[data-v-map]').onclick=()=>{guide.hidden=!guide.hidden;stop();renderMission();};q('[data-v-guide-close]').onclick=()=>{guide.hidden=true;renderMission();canvas.focus({preventScroll:true});};q('[data-v-interact]').onclick=interact;
 q('[data-v-respawn]').onclick=()=>{if(museum)leaveMuseum();else setPlace(null);canvas.focus({preventScroll:true});};
 q('[data-v-dialog-close]').onclick=()=>{dialog.close();renderMission();canvas.focus({preventScroll:true});};
 q('[data-v-help]').onclick=showHelp;q('[data-v-help-close]').onclick=()=>{help.close();renderMission();canvas.focus({preventScroll:true});};
 q('[data-v-help-resume]').onclick=()=>{help.close();updateGuide('reopen');canvas.focus({preventScroll:true});};
 q('[data-v-help-recommend]').onclick=()=>{help.close();updateGuide('reopen');const first=recommendChapters(catalog,canPlay,{limit:1})[0];if(!first){toast('目前沒有可進入的課文，仍可自由參觀六館。');renderMission();return;}if(museum&&museum.id===first.vol)exhibit();else{if(museum)leaveMuseum();goHall(first.vol);}};
 q('[data-v-dismiss]').onclick=()=>{updateGuide('skip');canvas.focus({preventScroll:true});};
 q('[data-v-next]').onclick=()=>{const step=guideStep(guideState);if(step.action==='enter'&&nearest&&nearest.id!=='guide'){interact();return;}if(step.action==='view'&&museum){if(nearest&&nearest.id!=='exit')exhibit();else navigate({x:0,z:-3},{kind:'case',id:'north',name:'主展櫃'});return;}if(step.action==='select'&&museum){exhibit();return;}if(step.action==='walk'&&guideState.hallId){goHall(guideState.hallId);return;}guide.hidden=false;stop();renderMission();};
 q('[data-v-route-cancel]').onclick=()=>{keys.clear();endRoute('已停止帶路。點館名可重新出發，也可以自由移動。');toast('已停止帶路');canvas.focus({preventScroll:true});};
 const toggleMap=()=>{const collapsed=minimap.classList.toggle('is-collapsed');q('[data-v-minimap-toggle]').textContent=collapsed?'展開地圖':'收起地圖';q('[data-v-minimap-toggle]').setAttribute('aria-expanded',String(!collapsed));};q('[data-v-minimap-toggle]').onclick=toggleMap;const collapsed=minimap.classList.contains('is-collapsed');q('[data-v-minimap-toggle]').textContent=collapsed?'展開地圖':'收起地圖';q('[data-v-minimap-toggle]').setAttribute('aria-expanded',String(!collapsed));
 listen(dialog,'cancel',event=>{event.preventDefault();event.stopPropagation();dialog.close();stop();renderMission();canvas.focus({preventScroll:true});});listen(help,'cancel',event=>{event.preventDefault();event.stopPropagation();help.close();stop();renderMission();canvas.focus({preventScroll:true});});
 listen(canvas,'webglcontextlost',event=>{event.preventDefault();lost=true;stop();setStatus('立體畫面暫時中斷，請返回選關後重新開啟村莊。');});
 listen(canvas,'webglcontextrestored',()=>{lost=false;clock.last=performance.now();setStatus('村莊畫面已恢復。');});
 listen(media,'change',()=>{if(media.matches){mixer.stopAllAction();actions.Idle.reset().play();mixer.update(0);action='Idle';}});
 const observer=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;clock.last=performance.now();});
 observer.observe(stage);intersection.observe(stage);stage.prepend(canvas);q('.village-loading').remove();setPlace(null);resize();resetCamera(true);frame=requestAnimationFrame(tick);canvas.focus({preventScroll:true});
 function dispose(){if(disposed)return;disposed=true;stop();cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();cleanup.forEach(fn=>fn());mixer.stopAllAction();mixer.uncacheRoot(character.scene);disposeTree(scene);sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();dialog.close();help.close();routeDots.dispose();root.replaceChildren();}
 return {dispose,navigateToHall(id){const h=HALLS.find(h=>h.id===id);if(place!=='village'||!h)return false;return goHall(id);},
  inspect(){return {place,position:{...position},museum:museum?.id||null,animation:action,animationTime:actions[action].time,moving,pathRemaining:path.length,near:nearest?.id||null,drawCalls:draws,quality,pixelRatio:renderer.getPixelRatio(),reduced:media.matches,lost,disposed,dialog:dialog.open,help:help.open,guide:{...guideState},routeTarget:routeTarget?{...routeTarget}:null,routeVisible:routeGroup.visible,chapterCount:museum?chaptersFor(catalog,museum.id).length:0};}};
}
