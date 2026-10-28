import * as THREE from 'three';
export function createOrbit(){return {azimuth:Math.atan2(14,24),elevation:Math.atan2(20,Math.hypot(14,24))};}
export function rotateOrbit(state,dx,dy){state.azimuth=((state.azimuth-dx*.007)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);state.elevation=THREE.MathUtils.clamp(state.elevation+dy*.004,Math.PI/6,Math.PI*.40);}
export function orbitOffset(state){const radius=34,h=radius*Math.cos(state.elevation);return new THREE.Vector3(Math.sin(state.azimuth)*h,Math.sin(state.elevation)*radius,Math.cos(state.azimuth)*h);}
export function cameraMovement(x,z,azimuth){return {x:x*Math.cos(azimuth)+z*Math.sin(azimuth),z:-x*Math.sin(azimuth)+z*Math.cos(azimuth)};}

// A tap walks; a drag or any multi-touch gesture can never finish as a walk.
export function installCameraInput(canvas,{blocked=()=>false,rotate,zoom,tap}){
 const points=new Map(),listeners=[];let start=null,dragged=false,pinch=0;
 const listen=(name,fn,options)=>{canvas.addEventListener(name,fn,options);listeners.push(()=>canvas.removeEventListener(name,fn,options));};
 const distance=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
 function cancel(){points.clear();start=null;dragged=false;pinch=0;}
 listen('pointerdown',e=>{if(blocked())return;e.preventDefault();canvas.focus({preventScroll:true});points.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(points.size===1){start={x:e.clientX,y:e.clientY};dragged=e.button===2;}else{dragged=true;pinch=distance();}});
 listen('pointermove',e=>{const before=points.get(e.pointerId);if(!before)return;if(blocked()){cancel();return;}e.preventDefault();points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(points.size>=2){const next=distance();if(pinch>0&&next>0)zoom(next/pinch);pinch=next;dragged=true;return;}if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)dragged=true;if(dragged)rotate(e.clientX-before.x,e.clientY-before.y);});
 listen('pointerup',e=>{if(!points.has(e.pointerId))return;const walk=points.size===1&&!dragged&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<=8&&!blocked();points.delete(e.pointerId);if(walk)tap(e);if(!points.size)cancel();});
 listen('pointercancel',cancel);listen('lostpointercapture',e=>{if(points.has(e.pointerId))cancel();});
 listen('contextmenu',e=>e.preventDefault());listen('selectstart',e=>e.preventDefault());
 listen('wheel',e=>{if(blocked())return;e.preventDefault();if(e.deltaY)zoom(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.002));},{passive:false});
 return ()=>{cancel();listeners.forEach(fn=>fn());};
}

// Cut away the rear wall only when the camera is behind it; exhibits stay intact.
export function prepareMuseumWalls(root){
 root.updateMatrixWorld(true);const walls=[],meshes=[];root.traverse(o=>{if(o.isMesh&&o.geometry&&!o.isSkinnedMesh)meshes.push(o);});
 for(const object of meshes){const original=object.geometry,g=original.index?original.toNonIndexed():original.clone(),pos=g.attributes.position,wall=[],solid=[],v=new THREE.Vector3();
  for(let i=0;i<pos.count;i+=3){let z=0,y=0;for(let k=0;k<3;k++){v.fromBufferAttribute(pos,i+k).applyMatrix4(object.matrixWorld);z+=v.z/3;y+=v.y/3;}(z< -7.5&&y>.65?wall:solid).push(i,i+1,i+2);}
  if(!wall.length){g.dispose();continue;}
  const part=indices=>{const out=new THREE.BufferGeometry();for(const [name,a]of Object.entries(g.attributes)){const data=new a.array.constructor(indices.length*a.itemSize);indices.forEach((index,n)=>{for(let k=0;k<a.itemSize;k++)data[n*a.itemSize+k]=a.array[index*a.itemSize+k];});out.setAttribute(name,new THREE.BufferAttribute(data,a.itemSize,a.normalized));}return out;};
  const cut=object.clone(false);cut.name='CameraCutaway_'+object.name;cut.geometry=part(wall);object.parent.add(cut);walls.push(cut);object.geometry=part(solid);original.dispose();g.dispose();
 }
 return walls;
}
