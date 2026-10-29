const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
async function asset(body,mobile=false){const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');const b=fs.readFileSync(path.join(root,'public/models/anime-'+body+(mobile?'-mobile':'')+'.glb'));return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
function metadata(o){const m={};for(;o;o=o.parent)for(const k of ['assetId','body','outfit'])if(m[k]===undefined&&o.userData[k]!==undefined)m[k]=o.userData[k];return m;}
test('動漫男女各有精緻及手機模型，含三套衣裝、骨架、眨眼與四段動作；不含外部貼圖',async()=>{
 for(const body of ['male','female'])for(const mobile of [false,true]){
  const gltf=await asset(body,mobile),b=fs.readFileSync(path.join(root,'public/models/anime-'+body+(mobile?'-mobile':'')+'.glb')),data=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  assert(b.length<(mobile?3:5)*1024*1024);assert(!JSON.stringify(data).includes('"uri"'));assert.equal(data.skins.length,1);assert.deepEqual(gltf.animations.map(c=>c.name).sort(),['Bow','Idle','Run','Walk']);
  const outfits=new Set();let skinCount=0,blink=0;
  gltf.scene.traverse(o=>{
   if(o.isMesh){const m=metadata(o);assert.equal(m.body,body);assert.equal(m.assetId,'zongheng-anime-v1');outfits.add(m.outfit);}
   if(o.morphTargetDictionary?.Blink!==undefined)blink++;
   if(!o.isSkinnedMesh)return;skinCount++;
   const {position,normal,skinWeight,skinIndex}=o.geometry.attributes;
   for(const attr of [position,normal,skinWeight])assert(attr.array.every(Number.isFinite),o.name+'不可有損壞數值');
   for(let i=0;i<skinWeight.count;i++){
    assert(Math.abs(skinWeight.getX(i)+skinWeight.getY(i)+skinWeight.getZ(i)+skinWeight.getW(i)-1)<1e-5);
    for(const j of [skinIndex.getX(i),skinIndex.getY(i),skinIndex.getZ(i),skinIndex.getW(i)])assert(j>=0&&j<o.skeleton.bones.length);
   }
  });
  assert(skinCount>8);assert(blink>0);assert.deepEqual([...outfits].sort(),['armor','scholar','shared','traveler']);
 }
});
test('兩種體型是不同網格；選中衣裝才可見，手機版降低幾何量且保留所有衣裝',async()=>{
 const {heroSelection,applyHeroAppearance}=await import('../src/character3d/appearance.js');
 const {Box3,Vector3}=await import('three');
 const dimensions=[];
 for(const body of ['male','female']){
  const high=await asset(body),low=await asset(body,true);high.scene.updateMatrixWorld(true);dimensions.push(new Box3().setFromObject(high.scene,true).getSize(new Vector3()).toArray());
  for(const outfit of ['scholar','traveler','armor']){
   const a=applyHeroAppearance(high.scene,{body,outfit,color:'plum'}),b=applyHeroAppearance(low.scene,{body,outfit,color:'plum'});
   assert.equal(a.body,body);assert(a.visibleTriangles>b.visibleTriangles*1.25);assert(b.visibleTriangles<30000);
   high.scene.traverse(o=>{if(o.isMesh)assert.equal(o.visible,metadata(o).outfit==='shared'||metadata(o).outfit===outfit);});
  }
  assert.equal(applyHeroAppearance(high.scene,{body:body==='male'?'female':'male'}).body,body,'回報的體型應符合實際載入模型');
 }
 assert.notDeepEqual(dimensions[0],dimensions[1]);assert(dimensions.every(v=>v[1]>1.5&&v[1]<1.95));assert.equal(heroSelection({body:'remote'}).body,'male');
});
test('動漫使用分階陰影與保留眼睛細節的材質，輪廓共用原幾何與骨架',async()=>{
 const {prepareAnime}=await import('../src/character3d/anime.js');const {applyHeroAppearance}=await import('../src/character3d/appearance.js');
 const gltf=await asset('female');assert(prepareAnime(gltf.scene));let face=0,toon=0,outlines=0;
 gltf.scene.traverse(o=>{
  if(!o.isMesh)return;const materials=Array.isArray(o.material)?o.material:[o.material];
  if(o.userData.animeOutline){outlines++;const source=gltf.scene.getObjectByName(o.name.replace(/_Contour$/,''));assert(source);assert.equal(o.geometry,source.geometry);assert.equal(o.skeleton,source.skeleton);return;}
  for(const m of materials){
   if(m.name==='Anime_Face'){assert(m.isMeshBasicMaterial);assert.equal(m.toneMapped,false);assert(m.map);face++;}
   if(m.name==='Anime_Cloth'){assert(m.isMeshToonMaterial);assert(m.gradientMap);toon++;}
  }
 });
 assert(face>0&&toon>0&&outlines>0);applyHeroAppearance(gltf.scene,{body:'female',outfit:'traveler'});
 gltf.scene.traverse(o=>{if(o.userData.animeOutline)assert.equal(o.visible,o.userData.outfit==='shared'||o.userData.outfit==='traveler');});
});
test('待機眨眼是實際的眼瞼變形，循環會張眼；走跑行禮也會改變蒙皮',async()=>{
 const THREE=await import('three'),{animeClips}=await import('../src/character3d/anime.js');
 for(const body of ['male','female']){
  const gltf=await asset(body),clips=animeClips(gltf.scene,gltf.animations),idle=clips.find(c=>c.name==='Idle'),mixer=new THREE.AnimationMixer(gltf.scene);
  const blink=[];gltf.scene.traverse(o=>{if(o.morphTargetDictionary?.Blink!==undefined)blink.push(o);});mixer.clipAction(idle).play();mixer.setTime(idle.duration*.665);
  assert(blink.some(o=>o.morphTargetInfluences[o.morphTargetDictionary.Blink]>.8));mixer.setTime(idle.duration*.8);assert(blink.every(o=>o.morphTargetInfluences[o.morphTargetDictionary.Blink]===0));mixer.stopAllAction();
  for(const name of ['Walk','Run','Bow']){
   const clip=clips.find(c=>c.name===name);mixer.stopAllAction();mixer.clipAction(clip).reset().play();mixer.setTime(0);gltf.scene.updateMatrixWorld(true);
   let skin;gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&(name==='Bow'?o.material.name==='Anime_Face':o.userData.outfit==='shared'&&o.material.name==='Anime_Leather'))skin=o;});assert(skin);
   skin.skeleton.update();const pos=new THREE.Vector3().fromBufferAttribute(skin.geometry.attributes.position,0),before=skin.applyBoneTransform(0,pos.clone());mixer.setTime(clip.duration*(name==='Bow'?.5:.25));gltf.scene.updateMatrixWorld(true);skin.skeleton.update();assert(skin.applyBoneTransform(0,pos.clone()).distanceTo(before)>.005,name+'必須實際改變頂點');
  }
 }
});
test('GAS沿用既有男女欄位與hero樣式，儲存女角不需新增學生欄位',t=>{
 const file=path.join(root,'gas-private-source/ProfileApi.gs');if(!fs.existsSync(file)){t.skip('私有GAS來源僅本機提供');return;}
 const html=fs.readFileSync(path.join(root,'src/legacy/Data_doll3d.html'),'utf8'),d=JSON.parse(html.split('/* DOLL_MANIFEST_START */')[1].split('/* DOLL_MANIFEST_END */')[0]);
 const c={HtmlService:{createHtmlOutputFromFile(){return {getContent:()=>html};}}};vm.createContext(c);vm.runInContext(fs.readFileSync(file,'utf8'),c);
 const old={version:1};for(const [k,v]of Object.entries(d.look))old[k]=d.defaults[k]||v[0][0];
 const result=c.pfLook_({...old,characterStyle:'hero',body:'female',outfit:'armor'});assert.equal(result.body,'female');assert.equal(result.characterStyle,'hero');assert.equal(result.outfit,'armor');assert.throws(()=>c.pfLook_({...old,body:'unsupported'}),/選項/);
});
test('發布清單有男女四個模型；村莊選用對應輕量版，原模型繼續保留',()=>{
 const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))),m=JSON.parse(fs.readFileSync(path.join(root,'dist',release.manifest))),a=m.character3d;
 for(const [key,part]of Object.entries({hero:'anime-male-',heroMobile:'anime-male-mobile-',heroFemale:'anime-female-',heroFemaleMobile:'anime-female-mobile-'})){assert(a[key].includes(part));assert(fs.existsSync(path.join(root,'dist',a[key])));}
 assert.equal(m.village.assets.hero,a.heroMobile);assert.equal(m.village.assets.heroFemale,a.heroFemaleMobile);assert(fs.existsSync(path.join(root,'public/models/hero-scholar.glb')));
 const sources=JSON.parse(fs.readFileSync(path.join(root,'art/anime/source/sources.json')));assert.equal(sources.models.length,2);for(const model of sources.models){assert.equal(model.meta.licenseName,'CC0');assert(/^[a-f0-9]{64}$/.test(model.sha256));}
});
