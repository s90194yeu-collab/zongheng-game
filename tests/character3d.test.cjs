const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
async function asset(){
  const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
  const bytes=fs.readFileSync(path.join(root,'public/models/scholar-pilot.glb'));
  return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
}
test('策士GLB可由正式載入器解析，尺寸、蒙皮與三段動作完整，無外部資源',async()=>{
  const THREE=await import('three'),gltf=await asset(),bytes=fs.readFileSync(path.join(root,'public/models/scholar-pilot.glb'));
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
  assert(bytes.length<1024*1024);assert(!JSON.stringify(json).includes('"uri"'));
  assert.deepEqual(gltf.animations.map(c=>c.name).sort(),['Bow','Idle','Run']);
  const bones=[],skins=[];gltf.scene.traverse(o=>{if(o.isBone)bones.push(o);if(o.isSkinnedMesh)skins.push(o);});
  assert.equal(bones.length,14);assert(skins.length>0);
  gltf.scene.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(gltf.scene,true),height=bounds.max.y-bounds.min.y;
  assert(Math.abs(height-1.8)<.01,'身高應為1.8m，實際'+height);assert(Math.abs(bounds.min.y)<.001);
  let triangles=0;
  for(const mesh of skins){
    const weights=mesh.geometry.attributes.skinWeight,joints=mesh.geometry.attributes.skinIndex;
    for(let i=0;i<weights.count;i++){
      const sum=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);assert(Math.abs(sum-1)<1e-5);
      for(const j of [joints.getX(i),joints.getY(i),joints.getZ(i),joints.getW(i)])assert(j>=0&&j<mesh.skeleton.bones.length);
    }
    triangles+=(mesh.geometry.index?.count||mesh.geometry.attributes.position.count)/3;
  }
  assert(triangles<25000);assert(json.materials.some(m=>m.name==='Robe_Main'));assert(json.materials.some(m=>m.name==='Robe_Shade'));
});
test('待機、跑步、行禮確實改變骨架，跑步也會改變蒙皮頂點',async()=>{
  const THREE=await import('three');
  for(const name of ['Idle','Run','Bow']){
    const gltf=await asset(),mixer=new THREE.AnimationMixer(gltf.scene),clip=gltf.animations.find(c=>c.name===name);
    assert(clip.duration>.5);assert(clip.tracks.length>=3);gltf.scene.updateMatrixWorld(true);
    const nodes=[];gltf.scene.traverse(o=>{if(o.isBone)nodes.push(o);});
    const start=nodes.map(o=>[...o.position.toArray(),...o.quaternion.toArray()]);
    let foot;gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&/Boot/.test(o.name))foot=o;});assert(foot);
    const v=new THREE.Vector3().fromBufferAttribute(foot.geometry.attributes.position,0);foot.skeleton.update();
    const before=foot.applyBoneTransform(0,v.clone());
    mixer.clipAction(clip).play();mixer.update(name==='Bow'?1:clip.duration*.25);gltf.scene.updateMatrixWorld(true);foot.skeleton.update();
    assert(nodes.some((o,i)=>[...o.position.toArray(),...o.quaternion.toArray()].some((n,j)=>Math.abs(n-start[i][j])>1e-5)),name+'應改變骨架');
    if(name==='Run')assert(foot.applyBoneTransform(0,v.clone()).distanceTo(before)>.01,'跑步應移動靴子頂點');
  }
});
test('建置後的預覽模組共用Three.js，Profile使用內容雜湊模型，其他關卡不載入試點',()=>{
  const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))),manifest=JSON.parse(fs.readFileSync(path.join(root,'dist',release.manifest)));
  const assets=manifest.character3d;assert(assets);assert(/scholar-pilot-[0-9a-f]{16}\.glb$/.test(assets.model));
  const bundle=fs.readFileSync(path.join(root,'dist',assets.app),'utf8');
  assert(bundle.length>50000&&bundle.length<150000);assert(!bundle.includes('"three/addons/'));
  const imports=[...bundle.matchAll(/from"([^"]+)"/g)].map(m=>m[1]);assert(imports.length>0);assert(imports.every(s=>s==='./three-r180.min.js'));
  const page=name=>fs.readFileSync(path.join(root,'dist/releases',release.release,manifest.pages[name].file),'utf8');
  assert(page('Profile').includes('character3d-pilot'));assert(!page('Hub').includes('character3d-pilot'));
  assert(!/<script[^>]+src="[^"]*character3d-app/.test(page('Profile')),'新模組應於開啟時才載入');
  const original=fs.readFileSync(path.join(root,'public/models/scholar-pilot.glb'));
  assert.deepEqual(fs.readFileSync(path.join(root,'dist',assets.model)),original);
});
