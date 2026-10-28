const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function target(){const listeners=new Map();return {listeners,focus(){},setPointerCapture(){},addEventListener(k,fn){listeners.set(k,fn)},removeEventListener(k){listeners.delete(k)},send(k,e={}){e.preventDefault=()=>e.prevented=true;listeners.get(k)?.(e);return e;}};}
test('內外館共用鏡頭可繞完整360度，抬頭角度與角色相對方向保持合理',async()=>{
 const C=await import('../src/village/camera.js'),a=C.createOrbit(),home=C.orbitOffset(a);C.rotateOrbit(a,Math.PI*2/.007,0);assert(C.orbitOffset(a).distanceTo(home)<1e-8);C.rotateOrbit(a,0,99999);assert(a.elevation<=Math.PI*.4);C.rotateOrbit(a,0,-99999);assert(a.elevation>=Math.PI/6);
 for(const az of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const r=C.cameraMovement(1,0,az),u=C.cameraMovement(0,-1,az);assert(Math.abs(Math.hypot(r.x,r.z)-1)<1e-10);assert(Math.abs(r.x*u.x+r.z*u.z)<1e-10);}
});
test('點一下走路；拖曳、雙指縮放、取消和失去擷取都不會誤觸走路',async()=>{
 const {installCameraInput}=await import('../src/village/camera.js');let taps=0,turns=0,zooms=[],blocked=false;const t=target(),dispose=installCameraInput(t,{tap:()=>taps++,rotate:()=>turns++,zoom:n=>zooms.push(n),blocked:()=>blocked});
 const event=(id,x,y=0)=>({pointerId:id,clientX:x,clientY:y,button:0});
 t.send('pointerdown',event(1,10));t.send('pointerup',event(1,10));assert.equal(taps,1);
 t.send('pointerdown',event(1,0));t.send('pointermove',event(1,30));t.send('pointerup',event(1,30));assert.equal(turns,1);assert.equal(taps,1);
 t.send('pointerdown',event(1,0));t.send('pointerdown',event(2,100));t.send('pointermove',event(2,150));t.send('pointerup',event(2,150));t.send('pointerup',event(1,0));assert.equal(zooms[0],1.5);assert.equal(taps,1);
 for(const kind of ['pointercancel','lostpointercapture']){t.send('pointerdown',event(1,0));t.send(kind,event(1,0));t.send('pointerup',event(1,0));assert.equal(taps,1);}
 blocked=true;t.send('pointerdown',event(1,0));t.send('pointerup',event(1,0));assert.equal(taps,1);blocked=false;assert(t.send('wheel',{deltaY:-40}).prevented);assert(zooms.at(-1)>1);dispose();assert.equal(t.listeners.size,0);
});
test('轉至館內後方時可剖開背牆，展櫃與文物幾何保持不變',async()=>{
 const THREE=await import('three'),{prepareMuseumWalls}=await import('../src/village/camera.js'),scene=new THREE.Group(),material=new THREE.MeshBasicMaterial(),wall=new THREE.Mesh(new THREE.BoxGeometry(18,4,.3),material),exhibit=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),material);wall.position.set(0,2,-8.7);exhibit.position.set(0,1,-5);scene.add(wall,exhibit);const original=exhibit.geometry,parts=prepareMuseumWalls(scene);assert(parts.length);assert(parts.some(x=>x.geometry.attributes.position.count>0));assert.equal(exhibit.geometry,original);assert.equal(exhibit.visible,true);
});
test('長按防選字限於操作控制，閱讀及輸入欄位可選取',()=>{
 const root=path.resolve(__dirname,'..'),css=fs.readFileSync(path.join(root,'src/legacy/Core_css.html'),'utf8'),js=fs.readFileSync(path.join(root,'src/legacy/Core_js.html'),'utf8');assert(css.includes('-webkit-touch-callout:none'));assert(css.includes('button,button *'));
 const start=js.lastIndexOf('(function(){function protect'),code=js.slice(start,js.indexOf('</script>',start)),events={};vm.runInNewContext(code,{document:{addEventListener:(k,fn)=>events[k]=fn}});
 for(const kind of ['selectstart','contextmenu']){let prevented=0;const send=(control,editable)=>events[kind]({target:{closest:s=>s.startsWith('input')?editable:control},preventDefault:()=>prevented++});send(true,false);assert.equal(prevented,1);send(false,false);send(true,true);assert.equal(prevented,1);}
});
test('新版外景是含四面牆與屋頂的立體網格，烘焙色彩保留，六館正門和碰撞一致',async()=>{
 global.self=globalThis;global.createImageBitmap||=async()=>({width:256,height:256,close(){}});const THREE=await import('three'),{GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{HALLS}=await import('../src/village/world.js'),{preparePaintedWorld}=await import('../src/village/scenery.js');
 const root=path.resolve(__dirname,'..'),bytes=fs.readFileSync(path.join(root,'public/models/orbit-village.glb'));assert(bytes.length<8*1024*1024);const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));assert(!json.nodes.some(n=>n.name?.startsWith('PaintedHall_')));assert(json.images.every(i=>i.bufferView!==undefined&&!i.uri));const model=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');model.scene.updateMatrixWorld(true);
 const points=[];model.scene.traverse(o=>{if(o.isMesh&&o.userData.bakedLighting){assert(o.geometry.attributes.color);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
 for(const h of HALLS){const near=points.filter(p=>Math.abs(p.x-h.x)<h.width/2+.1&&Math.abs(p.z-h.z)<h.depth/2+.1&&p.y>.3&&p.y<3.8);assert(near.length>12,h.id);assert(Math.max(...near.map(p=>p.z))-Math.min(...near.map(p=>p.z))>h.depth*.8,h.id+' true depth');}
 const stats=preparePaintedWorld(model.scene);assert(stats.triangles<50000);assert(stats.materials<35);model.scene.traverse(o=>{if(o.isMesh&&o.userData.bakedLighting){assert(o.material.vertexColors);assert.equal(o.material.type,'MeshBasicMaterial');}});
});
