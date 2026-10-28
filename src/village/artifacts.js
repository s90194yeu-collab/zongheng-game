import * as THREE from 'three';

export const ARTIFACTS=Object.freeze({
 west:{node:'Artifact_Ding',title:'青銅禮器',subtitle:'器物如何表達身分與權力？',
  intro:'觀察三足、雙耳與腹部紋帶，再想想：春秋諸侯爭的是疆土，還是決定天下秩序的資格？',
  note:'教學器形模型：觀察器足、雙耳與紋帶，搭配課文理解禮器的意義。',
  details:[{label:'看雙耳',text:'雙耳是器形的一部分。從器物結構入手，再回到文本辨識「問鼎」所指向的政治意涵。',view:[1.7,1.6,2.8]},
   {label:'看紋帶',text:'紋帶在器腹周圍反覆排列。試著區分：眼前可觀察的器形，和需要原文支持的身分推論。',view:[.2,.6,2.3]},
   {label:'看三足',text:'轉到較低的角度觀察支撐方式。若要解釋禮器與權力的關係，你會選哪段原文作為證據？',view:[1.7,-.2,2.4]}]},
 north:{node:'Artifact_Bamboo',title:'盟書竹簡',subtitle:'承諾寫下來，就一定可信嗎？',
  intro:'展開竹簡，看看簡片與編繩如何連成一份文書。帶著「誰作承諾、為何守約」的問題讀春秋故事。',
  note:'簡上墨痕為美術示意；完整原文與人物言辭請至篇章閱讀。',
  details:[{label:'看編繩',text:'編繩讓分散的簡片連成一體。文本中的承諾又靠什麼維繫：利益、信用，還是實力？',view:[.1,3,2]},
   {label:'看簡片',text:'展開後，逐片觀察竹簡的次序。讀論辯時也可以逐句拆開，找出立場、理由與結論。',view:[2,2.7,1.6]},
   {label:'看全貌',text:'把目光拉回整份盟書。試著比較秦、晉、鄭三方：相同承諾，對各方的利益是否相同？',view:[0,3.4,2.7]}]},
 east:{node:'Artifact_Map',title:'列國沙盤',subtitle:'換一個位置，理由會改變嗎？',
  intro:'轉動沙盤，比較山河、城邑與行動路線。再回到〈燭之武退秦師〉，追問秦、晉、鄭各自的利害。',
  note:'列國沙盤為教學空間示意，疆界、地形與距離不按比例。',
  details:[{label:'看山河',text:'地形可以限制行動，也可能成為說服的理由。哪一句原文把空間關係轉成利害判斷？',view:[2.4,2.7,2.3]},
   {label:'看城邑',text:'把城邑看作不同立場。若你站在秦國的位置，哪些結果對自己有利？請用原文支持。',view:[-2.2,2.6,2.1]},
   {label:'看全局',text:'從上方比較各方位置。合作可以暫時一致，長期利益卻未必相同；找出燭之武拆解同盟的關鍵。',view:[0,4,.9]}]},
});

export function artifactFor(id){return ARTIFACTS[id]||ARTIFACTS.north;}

// Uses the already-loaded hall meshes. Closing inspection never disposes shared GLB data.
export function mountArtifactViewer(host,source,id,{Controls,reduced=false,onStatus=()=>{}}={}){
 const info=artifactFor(id),original=source.getObjectByName(info.node);
 if(!original)throw Error('這件展品暫時無法近看，仍可繼續閱讀導讀與篇章。');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label',info.title+'近看模型，可拖曳旋轉；也可用下方視角與縮放按鈕。');host.replaceChildren(canvas);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dedac9');
 scene.add(new THREE.HemisphereLight('#fff5df','#405c55',2.5));
 const light=new THREE.DirectionalLight('#fff0d1',3.5);light.position.set(-3,5,4);scene.add(light);
 const fill=new THREE.DirectionalLight('#b8d5cf',1.3);fill.position.set(4,2,-3);scene.add(fill);
 const model=original.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.set(1,1,1);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const group=new THREE.Group();group.add(model);scene.add(group);model.position.sub(center);group.scale.setScalar(2.5/Math.max(size.x,size.y,size.z));
 const camera=new THREE.PerspectiveCamera(38,1,.02,40);
 const controls=new Controls(camera,canvas);controls.enablePan=false;controls.enableDamping=!reduced;controls.dampingFactor=.12;controls.minDistance=2.1;controls.maxDistance=7;controls.maxPolarAngle=Math.PI*.9;
 const home=id==='west'?[2,1.4,3.5]:[1.5,3,3.1];camera.position.set(...home);controls.target.set(0,0,0);controls.update();
 const panels=[];model.traverse(o=>{if(/^BambooPanel_\d+$/.test(o.name))panels.push({object:o,base:o.position.clone(),index:Number(o.name.split('_').at(-1))});});
 let disposed=false,frame=0,rendered=0,last=performance.now(),expanded=true,opening=1,rotate=false,visible=true;
 const observer=new ResizeObserver(()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(host);
 const visibility=()=>{visible=!document.hidden;last=performance.now();};document.addEventListener('visibilitychange',visibility);
 const lost=event=>{event.preventDefault();onStatus('近看畫面暫時中斷，請關閉後重新開啟。');};canvas.addEventListener('webglcontextlost',lost);
 function tick(time){if(disposed)return;frame=requestAnimationFrame(tick);if(time-rendered<1000/(innerWidth<700?24:30))return;rendered=time;const dt=Math.min(.1,(time-last)/1000);last=time;if(!visible)return;
  const target=expanded?1:.18;opening=reduced?target:THREE.MathUtils.damp(opening,target,8,dt);
  for(const {object,index,base}of panels){object.position.copy(base);object.position.x=(index-2.5)*.324*(opening-1);object.rotation.z=(index-2.5)*.08*(1-opening);}
  if(rotate&&!reduced)group.rotation.y+=dt*.22;controls.update();renderer.render(scene,camera);
 }
 frame=requestAnimationFrame(tick);
 function reset(){group.rotation.set(0,0,0);camera.position.set(...home);controls.target.set(0,0,0);controls.update();}
 function zoom(factor){const direction=camera.position.clone().sub(controls.target);direction.setLength(THREE.MathUtils.clamp(direction.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(direction);controls.update();}
 return {reset,zoomIn:()=>zoom(.82),zoomOut:()=>zoom(1.22),
  focus(index){const detail=info.details[index];if(!detail)return;group.rotation.set(0,0,0);camera.position.set(...detail.view);controls.target.set(0,0,0);controls.update();},
  toggleOpen(){expanded=!expanded;return expanded;},toggleRotate(){rotate=!rotate;return rotate;},
  inspect:()=>({id,expanded,panels:panels.length,disposed}),
  dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',lost);controls.dispose();renderer.dispose();renderer.forceContextLoss();host.replaceChildren();}
 };
}
