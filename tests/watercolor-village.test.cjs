const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('水彩六館的入口對齊正門，從廣場與其他館門均能抵達',async()=>{
 const W=await import('../src/village/world.js');
 for(const h of W.HALLS){assert.equal(h.rotation,0);assert.equal(h.entry.x,h.x);assert.equal(h.entry.z,h.z+h.depth/2+1.75);
  for(const start of [{x:0,z:7},...W.HALLS.filter(x=>x!==h).map(x=>x.entry)]){const r=W.route(start,h.entry);assert(r.length,h.id);assert(r.every(p=>W.walkable(p)));const last=r.at(-1);assert(Math.hypot(last.x-h.entry.x,last.z-h.entry.z)<.001);}
 }
});
test('直橫式水彩鏡頭都保留至少24單位的短邊，俯視方向不隨移動改變',async()=>{
 const S=await import('../src/village/scenery.js');for(const [w,h]of [[1600,900],[390,844],[768,1024]]){const f=S.paintedFrustum(w,h);assert(Math.min(f.right-f.left,f.top-f.bottom)>=24-1e-10);assert(Math.abs((f.right-f.left)/(f.top-f.bottom)-w/h)<1e-10);}
 const a=S.paintedCameraOffset(),b=S.paintedCameraOffset();a.x=100;assert.equal(b.x,14);assert.equal(b.y,20);assert.equal(b.z,24);
});
test('水彩GLB以內嵌貼圖和分層網格呈現六館、庭園、遠山，材質不受即時光影重算',async()=>{
 global.self=globalThis;global.createImageBitmap||=async()=>({width:640,height:640,close(){}});
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),S=await import('../src/village/scenery.js');
 const b=fs.readFileSync(path.join(root,'public/models/watercolor-village.glb'));assert(b.length<8*1024*1024);
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.equal(j.images.length,10);assert(j.images.every(i=>i.bufferView!==undefined&&!i.uri));
 const model=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'');const stats=S.preparePaintedWorld(model.scene);assert.equal(stats.planes,19);assert(stats.triangles<1500);assert.equal(stats.materials,10);
 const halls=[];model.scene.traverse(o=>{if(!o.isMesh)return;assert.equal(o.material.type,'MeshBasicMaterial');assert.equal(o.material.toneMapped,false);assert.equal(o.castShadow,false);if(o.userData.kind==='hall'){halls.push(o.userData.hallId);assert(o.material.alphaTest>0);assert.equal(o.geometry.index.count,6);assert(Math.abs(o.position.z-o.userData.groundAnchor[2])<.001);}});assert.deepEqual(halls.sort(),['al','ch','cq','gw','zg','zz']);
});
test('發布入口使用新外景，原3D角色、文物與關卡功能保留，無陰影貼圖或固定FPS',()=>{
 const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))),m=JSON.parse(fs.readFileSync(path.join(root,'dist',release.manifest)));
 assert.match(m.village.assets.exterior,/orbit-village-/);assert.match(m.village.assets.character,/\.glb$/);assert.match(m.village.assets.springInterior,/spring-interior-/);
 const s=fs.readFileSync(path.join(root,'src/village/app.js'),'utf8');assert(s.includes('VillageBronzeDing'));assert(s.includes('mountArtifactViewer'));assert(s.includes('renderer.shadowMap.enabled=false'));assert(!/1000\s*\/\s*(24|30)/.test(s));assert(s.includes('canPlay(chapter.id)'));
});
