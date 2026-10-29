const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
// Node has no raster decoder. Geometry tests use a bitmap stand-in; actual
// texture decoding and rendering are checked separately in the browser.
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
async function asset(mobile=false){const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');const b=fs.readFileSync(path.join(root,'public/models/hero-scholar'+(mobile?'-mobile':'')+'.glb'));return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
test('精緻與手機角色均含一套53骨骨架、三套服裝與四段有效動作，材質完全內嵌',async()=>{
 for(const mobile of [false,true]){
  const g=await asset(mobile),bones=[],meshes=[];g.scene.traverse(o=>{if(o.isBone)bones.push(o);if(o.isSkinnedMesh)meshes.push(o);});
  assert.equal(bones.length,53);assert.deepEqual(g.animations.map(c=>c.name).sort(),['Bow','Idle','Run','Walk']);
  const costumes=new Set(meshes.map(m=>m.userData.outfit));assert.deepEqual([...costumes].sort(),['armor','scholar','shared','traveler']);
  for(const m of meshes){
   const {position,normal,skinWeight,skinIndex}=m.geometry.attributes;
   for(const values of [position.array,normal.array,skinWeight.array])assert(values.every(Number.isFinite),m.name+'不可含損壞座標');
   for(let i=0;i<skinWeight.count;i++){
    const sum=skinWeight.getX(i)+skinWeight.getY(i)+skinWeight.getZ(i)+skinWeight.getW(i);assert(Math.abs(sum-1)<.00001,m.name+'權重必須正規化');
    for(const j of [skinIndex.getX(i),skinIndex.getY(i),skinIndex.getZ(i),skinIndex.getW(i)])assert(j>=0&&j<m.skeleton.bones.length);
   }
  }
  const b=fs.readFileSync(path.join(root,'public/models/hero-scholar'+(mobile?'-mobile':'')+'.glb')),json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  assert(b.length<(mobile?3:8)*1024*1024);assert(!JSON.stringify(json).includes('"uri"'));assert(json.images.length===2);
 }
});
test('換裝只顯示指定衣裝；紙娃娃與村莊使用同一個外觀函式，手機拓樸確實較少',async()=>{
 const {applyHeroAppearance,heroSelection,isHero}=await import('../src/character3d/appearance.js');
 const high=await asset(),low=await asset(true);assert(isHero(high.scene));
 for(const outfit of ['scholar','traveler','armor']){
  const a=applyHeroAppearance(high.scene,{outfit,color:'plum',hairColor:'silver',skin:'honey'}),b=applyHeroAppearance(low.scene,{outfit,color:'plum'});
  assert(a.visibleTriangles>b.visibleTriangles*1.25);assert(a.visibleMeshes<20);assert(b.visibleTriangles<32000);
  high.scene.traverse(m=>{if(m.isMesh)assert.equal(m.visible,m.userData.outfit==='shared'||m.userData.outfit===outfit);});
 }
 assert.equal(heroSelection({outfit:'unknown',color:'<script>'}).outfit,'scholar');
});
test('走路、跑步與行禮會移動蒙皮頂點；兩段循環在頭尾接合且沒有根位移',async()=>{
 const THREE=await import('three');
 for(const mobile of [false,true])for(const clipName of ['Idle','Walk','Run','Bow']){
  const g=await asset(mobile),clip=g.animations.find(c=>c.name===clipName),mixer=new THREE.AnimationMixer(g.scene),nodes=[];
  g.scene.traverse(o=>{if(o.isBone)nodes.push(o);});const act=mixer.clipAction(clip);act.setLoop(THREE.LoopOnce,1);act.clampWhenFinished=true;act.play();mixer.setTime(0);g.scene.updateMatrixWorld(true);
  const start=nodes.map(o=>o.quaternion.clone());mixer.setTime(clip.duration*.25);g.scene.updateMatrixWorld(true);
  assert(nodes.some((o,i)=>Math.abs(o.quaternion.dot(start[i]))<.9999999),clipName+'必須有實際骨架動作');
  if(clipName==='Walk'||clipName==='Run'){
   let shoe;g.scene.traverse(o=>{if(o.isSkinnedMesh&&o.material.name==='Hero_Leather'&&o.userData.outfit==='shared')shoe=o;});assert(shoe);
   mixer.setTime(0);g.scene.updateMatrixWorld(true);shoe.skeleton.update();const p=new THREE.Vector3().fromBufferAttribute(shoe.geometry.attributes.position,0),before=shoe.applyBoneTransform(0,p.clone());
   mixer.setTime(clip.duration*.25);g.scene.updateMatrixWorld(true);shoe.skeleton.update();assert(shoe.applyBoneTransform(0,p.clone()).distanceTo(before)>.015);
  }
  if(clipName!=='Bow'){mixer.setTime(clip.duration);assert(nodes.every((o,i)=>Math.abs(o.quaternion.dot(start[i]))>.99999),'循環末端需接回起點');}
  const rootBone=nodes.find(o=>o.name==='Root');assert(rootBone.position.length()<1.2,'角色由遊戲控制位置，不由動畫拉走');
 }
});
test('GAS外觀驗證接受新增樣式，舊造型自動保留經典樣式且拒絕未列入的設定',t=>{
 const privateFile=path.join(root,'gas-private-source/ProfileApi.gs');if(!fs.existsSync(privateFile)){t.skip('私有GAS驗證來源只在本機');return;}
 const html=fs.readFileSync(path.join(root,'src/legacy/Data_doll3d.html'),'utf8'),manifest=JSON.parse(html.split('/* DOLL_MANIFEST_START */')[1].split('/* DOLL_MANIFEST_END */')[0]);
 const c={HtmlService:{createHtmlOutputFromFile(){return {getContent:()=>html};}}};vm.createContext(c);vm.runInContext(fs.readFileSync(privateFile,'utf8'),c);
 const look={version:1};for(const [k,v]of Object.entries(manifest.look))if(k!=='characterStyle')look[k]=manifest.defaults[k]||v[0][0];
 assert.equal(c.pfLook_(look).characterStyle,'classic');const hero=c.pfLook_({...look,characterStyle:'hero',outfit:'armor'});assert.equal(hero.characterStyle,'hero');assert.equal(hero.outfit,'armor');
 assert.equal(c.pfLook_(look,hero).characterStyle,'hero');assert.throws(()=>c.pfLook_({...look,characterStyle:'remote_url'}),/紙娃娃選項/);assert.throws(()=>c.pfLook_({...look,modelUrl:'https:\/\/example.com'}),/不支援/);
});
test('建置使用內容雜湊角色；原始模型仍保留，個人頁和村莊延後載入新樣式',()=>{
 const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))),manifest=JSON.parse(fs.readFileSync(path.join(root,'dist',release.manifest))),a=manifest.character3d;
 assert(/hero-scholar-[a-f0-9]{16}\.glb$/.test(a.hero));assert(/hero-scholar-mobile-[a-f0-9]{16}\.glb$/.test(a.heroMobile));assert.equal(manifest.village.assets.hero,a.heroMobile);
 for(const key of ['hero','heroMobile'])assert(fs.existsSync(path.join(root,'dist',a[key])));assert(/scholar-pilot/.test(a.model));
 const profile=fs.readFileSync(path.join(root,'dist/releases',release.release,manifest.pages.Profile.file),'utf8');assert(profile.includes('character3d-pilot'));assert(!/<script[^>]*src="[^"]*character3d-app/.test(profile));
});
