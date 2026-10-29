import * as THREE from 'three';
import {heroMetadata} from './appearance.js';

export function isAnime(root){let yes=false;root.traverse(o=>{if(o.userData?.assetId==='zongheng-anime-v1')yes=true;});return yes;}

export function prepareAnime(root){
 if(!isAnime(root))return false;
 const gradient=new THREE.DataTexture(new Uint8Array([170,170,170,255,222,222,222,255,255,255,255,255]),3,1,THREE.RGBAFormat);
 gradient.minFilter=gradient.magFilter=THREE.NearestFilter;gradient.needsUpdate=true;
 const cache=new Map(),sources=[],originals=new Set();root.traverse(o=>{if(o.isMesh&&!o.userData.animeOutline)sources.push(o);});
 function convert(m){
  if(cache.has(m))return cache.get(m);originals.add(m);
  const face=/^Anime_(Face|Line|Eye|Iris|Skin)/.test(m.name),cutout=!!(m.transparent||m.alphaTest);
  const options={name:m.name,color:m.color.clone(),map:m.map||null,side:THREE.DoubleSide,alphaTest:cutout?.45:0,transparent:false};
  const n=face?new THREE.MeshBasicMaterial(options):new THREE.MeshToonMaterial({...options,gradientMap:gradient});
  if(face)n.toneMapped=false;cache.set(m,n);return n;
 }
 for(const o of sources){Object.assign(o.userData,heroMetadata(o));o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}
 // A thin inverted hull is a real 3D contour. It shares geometry and skinning,
 // follows the selected outfit, and adds no extra texture downloads.
 for(const source of sources){
  const list=Array.isArray(source.material)?source.material:[source.material];
  if(!list.every(m=>/^Anime_(Hair|Face$|Cloth|Ivory|Armor|Leather|Trousers|Lining)/.test(m.name)))continue;
  const materials=list.map(m=>{
   const outline=new THREE.MeshBasicMaterial({name:'Anime_Outline',color:'#273443',side:THREE.BackSide,map:m.map,alphaTest:m.alphaTest,toneMapped:false});
   outline.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * 0.0013;');};
   outline.customProgramCacheKey=()=> 'zongheng-anime-outline-v1';return outline;
  });
  const contour=source.isSkinnedMesh?new THREE.SkinnedMesh(source.geometry,Array.isArray(source.material)?materials:materials[0]):new THREE.Mesh(source.geometry,materials[0]);
  contour.name=source.name+'_Contour';contour.position.copy(source.position);contour.quaternion.copy(source.quaternion);contour.scale.copy(source.scale);
  if(source.isSkinnedMesh){contour.bindMode=source.bindMode;contour.bind(source.skeleton,source.bindMatrix);}
  if(source.morphTargetInfluences){contour.morphTargetDictionary=source.morphTargetDictionary;contour.morphTargetInfluences=source.morphTargetInfluences;}
  contour.userData={...source.userData,animeOutline:true};contour.castShadow=false;contour.receiveShadow=false;source.parent.add(contour);
 }
 originals.forEach(m=>m.dispose());return true;
}

export function animeClips(root,clips){
 if(!isAnime(root))return clips;
 return clips.map(clip=>{
  if(clip.name!=='Idle')return clip;
  const copy=clip.clone(),d=copy.duration;
  root.traverse(o=>{
   if(o.userData.animeOutline||!o.morphTargetDictionary||!Object.hasOwn(o.morphTargetDictionary,'Blink'))return;
   const index=o.morphTargetDictionary.Blink;
   copy.tracks.push(new THREE.NumberKeyframeTrack(o.uuid+'.morphTargetInfluences['+index+']',[0,d*.63,d*.66,d*.68,d*.71,d],[0,0,1,1,0,0]));
  });return copy;
 });
}
