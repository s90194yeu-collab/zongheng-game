import * as THREE from 'three';

// One fixed view keeps the painted building silhouettes aligned while the camera pans.
export const PAINTED_VIEW=Object.freeze({x:14,y:20,z:24});
export function paintedFrustum(width,height){
 const aspect=Math.max(1,width)/Math.max(1,height),span=24/Math.min(1,aspect);
 return {left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2,aspect};
}
export function paintedCameraOffset(){return new THREE.Vector3(PAINTED_VIEW.x,PAINTED_VIEW.y,PAINTED_VIEW.z);}

export function preparePaintedWorld(root){
 const materials=new Map();let planes=0,triangles=0;
 root.traverse(object=>{
  if(!object.isMesh)return;
  object.castShadow=false;object.receiveShadow=false;
  triangles+=(object.geometry.index?.count||object.geometry.attributes.position.count)/3;
  const convert=old=>{
   if(materials.has(old))return materials.get(old);
   const cutout=old.transparent||old.alphaTest>0||old.name.startsWith('Cutout_');
   const paper=old.name==='Ivory'&&object.name==='Batched_Ivory';
   const material=new THREE.MeshBasicMaterial({name:old.name,map:paper?null:old.map,color:paper?'#f7f0e3':old.map?'#ffffff':old.color,vertexColors:!!object.geometry.attributes.color,transparent:cutout,
    alphaTest:cutout ? .015 : 0,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
   materials.set(old,material);return material;
  };
  object.material=Array.isArray(object.material)?object.material.map(convert):convert(object.material);
  if(object.userData.kind==='hall'||object.userData.kind==='garden'||object.userData.kind==='mountain')planes++;
 });
 for(const old of materials.keys())old.dispose();
 return {planes,triangles,materials:materials.size};
}

// Small painted contact shadow, shared by the actor and plaza prop; no shadow-map pass.
export function createContactShadow(){
 const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
 const context=canvas.getContext('2d');
 const gradient=context.createRadialGradient(32,32,3,32,32,31);gradient.addColorStop(0,'rgba(62,66,47,.24)');gradient.addColorStop(.5,'rgba(62,66,47,.12)');gradient.addColorStop(1,'rgba(62,66,47,0)');
 context.fillStyle=gradient;context.fillRect(0,0,64,64);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.0),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=.05;
 return mesh;
}
