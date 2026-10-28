import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CLIPS = Object.freeze({idle:'Idle',run:'Run',bow:'Bow'});
const COLORS = Object.freeze({jade:'#46745f',ink:'#47627a',amber:'#967342',crane:'#84959f',plum:'#986579',moon:'#77749d'});
export { CLIPS, COLORS };

function release(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
  root.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    if(object.skeleton)skeletons.add(object.skeleton);
    for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material){
      materials.add(material);
      for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
    }
  });
  textures.forEach(texture=>{texture.source?.data?.close?.();texture.dispose();});
  materials.forEach(material=>material.dispose());geometries.forEach(geometry=>geometry.dispose());
  skeletons.forEach(skeleton=>skeleton.dispose());
  root.clear();
}

export async function createPreview(host, {modelUrl,color='jade',quality='auto',signal,onState=()=>{}}={}) {
  if(!host?.isConnected)throw Error('試看已關閉。');
  const request=new AbortController(),abort=()=>request.abort();
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  signal?.addEventListener('abort',abort,{once:true});
  const timeout=setTimeout(abort,18000);
  let model;
  try {
    const response=await fetch(modelUrl,{credentials:'omit',signal:request.signal});
    if(!response.ok)throw Error('角色檔案暫時無法讀取，請重新載入。');
    const bytes=await response.arrayBuffer();
    if(bytes.byteLength>8*1024*1024)throw Error('角色檔案超過試看大小限制。');
    let asset;
    try{asset=await new GLTFLoader().parseAsync(bytes,new URL('.',new URL(modelUrl,location.href)).href);}
    catch(error){throw Error('角色檔案無法開啟，請重新載入。');}
    model=asset.scene;
    if(request.signal.aborted||signal?.aborted||!host.isConnected){release(model);throw new DOMException('Cancelled','AbortError');}
    return mount(host,model,asset.animations,{color,quality,onState});
  } catch(error) {
    if(error.name==='AbortError'&&!signal?.aborted)throw Error('角色載入逾時，請重新載入。');
    if(error instanceof TypeError)throw Error('目前無法連線讀取角色，請稍後重試。');
    throw error;
  } finally {
    clearTimeout(timeout);signal?.removeEventListener('abort',abort);
  }
}

function mount(host,model,clips,{color,quality,onState}) {
  let renderer;
  const scene=new THREE.Scene(),canvas=document.createElement('canvas');
  canvas.className='c3-canvas';canvas.tabIndex=0;
  canvas.setAttribute('aria-label','古風策士立體試看；拖曳旋轉、雙指或滾輪縮放，方向鍵旋轉，加減鍵縮放，Home回正。');
  try {renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'default'});}
  catch(error){release(model);throw Error('目前無法開啟立體試看，請返回我的造型，或換個瀏覽器再試。');}
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.background=new THREE.Color('#172e36');
  scene.add(new THREE.HemisphereLight('#fff0d8','#6b8b91',1.8));
  const sun=new THREE.DirectionalLight('#ffedc5',2.5);sun.position.set(-3,5,4);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.025;
  Object.assign(sun.shadow.camera,{left:-2.5,right:2.5,top:2.5,bottom:-2.5,near:.1,far:12});
  scene.add(sun);
  const fill=new THREE.DirectionalLight('#b9dcf0',.8);fill.position.set(3,2,-2);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.18,.08,64),new THREE.MeshStandardMaterial({color:'#496363',roughness:.95}));
  floor.position.y=-.045;floor.receiveShadow=true;scene.add(floor);
  const edge=new THREE.Mesh(new THREE.TorusGeometry(1.12,.014,8,64),new THREE.MeshBasicMaterial({color:'#c7a76f'}));
  edge.rotation.x=Math.PI/2;edge.position.y=-.008;scene.add(edge);
  const actor=new THREE.Group();actor.add(model);scene.add(actor);
  const cloth=[];let bones=0,triangles=0;
  model.traverse(object=>{
    if(object.isBone)bones++;
    if(!object.isMesh)return;
    object.castShadow=true;object.receiveShadow=false;
    triangles+=(object.geometry.index?.count||object.geometry.attributes.position.count)/3;
    const convert=material=>{
      const replacement=new THREE.MeshToonMaterial({name:material.name,color:material.color.clone(),map:material.map||null,side:material.side});
      if(/^Robe_(Main|Shade)$/.test(material.name))cloth.push({material:replacement,shade:material.name==='Robe_Shade'});
      material.dispose();return replacement;
    };
    object.material=Array.isArray(object.material)?object.material.map(convert):convert(object.material);
  });
  model.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(model,true),size=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.y)||size.y<.01){release(scene);renderer.dispose();throw Error('角色尺寸無法辨識。');}
  // Wrapper alignment does not overwrite the skeleton's animation tracks.
  actor.position.set(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
  const camera=new THREE.PerspectiveCamera(35,1,.05,30);camera.position.set(2.4,1.8,3.8);
  const controls=new OrbitControls(camera,canvas);
  controls.target.set(0,.93,0);controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.12;
  controls.minDistance=2.4;controls.maxDistance=6.5;controls.minPolarAngle=.4;controls.maxPolarAngle=Math.PI*.52;
  controls.update();controls.saveState();
  const mixer=new THREE.AnimationMixer(model),actions={};
  for(const [key,name]of Object.entries(CLIPS)){
    const clip=clips.find(item=>item.name===name);
    if(!clip){controls.dispose();release(scene);renderer.dispose();throw Error('角色缺少必要動作：'+name);}
    actions[key]=mixer.clipAction(clip);
  }
  actions.bow.setLoop(THREE.LoopOnce,1);actions.bow.clampWhenFinished=true;
  let disposed=false,paused=false,visible=true,lost=false,frame=0,previous=0,current='idle',colorId='jade';
  const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches,qualityMode='auto';
  function notify(){onState({status:lost?'lost':'ready',motion:current,paused,reduced,color:colorId});}
  function draw(){if(!disposed&&!lost)renderer.render(scene,camera);}
  function setColor(value){
    if(disposed||!Object.hasOwn(COLORS,value))return false;
    colorId=value;for(const entry of cloth){entry.material.color.set(COLORS[value]);if(entry.shade)entry.material.color.multiplyScalar(.72);}
    draw();notify();return true;
  }
  function play(key){
    if(disposed||lost||!Object.hasOwn(actions,key))return false;
    if(reduced){notify();return false;}
    const next=actions[key];if(current===key&&next.isRunning()){paused=false;previous=performance.now();notify();return true;}
    const old=actions[current];next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
    if(old&&old!==next)next.crossFadeFrom(old,.18,false);
    current=key;paused=false;previous=performance.now();notify();return true;
  }
  function finished(event){if(event.action===actions.bow&&!disposed)play('idle');}
  mixer.addEventListener('finished',finished);
  function resize(){if(disposed)return;const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();}
  function setQuality(value){
    qualityMode=['auto','low','high'].includes(value)?value:'auto';
    const low=qualityMode==='low'||(qualityMode==='auto'&&innerWidth<700);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,low?1:1.5));renderer.shadowMap.enabled=!low;resize();
  }
  function setPaused(value){if(disposed)return;paused=!!value;previous=performance.now();notify();draw();}
  function changeReduced(){reduced=media.matches;if(reduced){mixer.stopAllAction();actions.idle.reset().play();mixer.update(0);current='idle';}else play('idle');draw();notify();}
  function key(event){
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='Home'){controls.reset();draw();return;}
    const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
    if(event.key==='ArrowLeft')spherical.theta-=.12;if(event.key==='ArrowRight')spherical.theta+=.12;
    if(event.key==='ArrowUp')spherical.phi=Math.max(.4,spherical.phi-.1);
    if(event.key==='ArrowDown')spherical.phi=Math.min(Math.PI*.52,spherical.phi+.1);
    if(['+','='].includes(event.key))spherical.radius=Math.max(2.4,spherical.radius*.9);
    if(event.key==='-')spherical.radius=Math.min(6.5,spherical.radius/0.9);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();draw();
  }
  function contextLost(event){event.preventDefault();lost=true;notify();}
  function contextRestored(){lost=false;previous=performance.now();resize();notify();}
  function pageVisibility(){previous=performance.now();if(!document.hidden)draw();}
  const observer=new ResizeObserver(()=>setQuality(qualityMode)),intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previous=performance.now();});
  function tick(time){
    if(disposed)return;frame=requestAnimationFrame(tick);
    const dt=Math.min(.08,Math.max(0,(time-previous)/1000));previous=time;
    if(document.hidden||!visible||lost)return;
    if(!paused&&!reduced)mixer.update(dt);
    controls.update();draw();
  }
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();
    media.removeEventListener('change',changeReduced);document.removeEventListener('visibilitychange',pageVisibility);
    canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);
    controls.dispose();mixer.removeEventListener('finished',finished);mixer.stopAllAction();mixer.uncacheRoot(model);
    release(scene);sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }
  const controller={play,setColor,setQuality,setPaused,dispose,reset(){controls.reset();draw();},
    snapshot(){if(disposed||lost)throw Error('畫面暫時無法拍照。');draw();return canvas.toDataURL('image/png');},
    inspect(){return {engine:'three',revision:THREE.REVISION,asset:'scholar-pilot-v1',clips:clips.map(item=>item.name),bones,triangles,
      height:size.y,footY:bounds.min.y+actor.position.y,motion:current,time:actions[current]?.time,
      clothColor:COLORS[colorId],clothMaterials:cloth.length,colorId,reduced,paused,disposed,lost,
      quality:qualityMode,pixelRatio:renderer.getPixelRatio(),drawCalls:renderer.info.render.calls,
      camera:camera.position.toArray(),geometries:renderer.info.memory.geometries};}
  };
  host.replaceChildren(canvas);observer.observe(host);intersection.observe(host);
  canvas.addEventListener('keydown',key);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
  document.addEventListener('visibilitychange',pageVisibility);media.addEventListener('change',changeReduced);
  actions.idle.play();mixer.update(0);setColor(Object.hasOwn(COLORS,color)?color:'jade');setQuality(quality);
  previous=performance.now();frame=requestAnimationFrame(tick);notify();return controller;
}
