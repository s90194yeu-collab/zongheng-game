const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('六個村莊館門都可從廣場抵達，路線避開建築與庭園障礙',async()=>{
 const W=await import('../src/village/world.js');for(const h of W.HALLS){const route=W.route({x:0,z:7},h.entry);assert(route.length,h.id);assert(route.every(p=>W.walkable(p)));assert(Math.hypot(route.at(-1).x-h.entry.x,route.at(-1).z-h.entry.z)<.001);}
});
test('村莊與室內碰撞不因大dt穿牆，舊路由與未開放篇章不進展櫃',async()=>{
 const W=await import('../src/village/world.js');const moved=W.move({x:0,z:0},{x:0,z:-100});assert(W.walkable(moved));assert(moved.z>-12.2);const room=W.move({x:0,z:4},{x:0,z:-100},'cq');assert(room.z>-4);assert(W.walkable(room,'cq'));
 assert.deepEqual(W.chaptersFor([{id:'a',vol:'cq',status:'ready',legacyOnly:true},{id:'b',vol:'cq',status:'planned'}],'cq'),[]);
});
test('村莊GLB使用真正網格、無外部URI，材質合併且單一模型小於8MiB',async()=>{
 global.self=globalThis;global.createImageBitmap||=async()=>({width:256,height:256,close(){}});const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');for(const name of ['museum-village','museum-interior','spring-interior']){const b=fs.readFileSync(path.join(root,'public/models',name+'.glb'));assert(b.length<8*1024*1024);const model=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'');let meshes=0;model.scene.traverse(o=>{if(o.isMesh)meshes++;});assert(meshes>10&&meshes<(name==='spring-interior'?65:30));const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert(!JSON.stringify(json).includes('"uri"'));}
});
test('村莊只在首頁開啟後載入，共用Three.js且模型與模組以內容雜湊保存',()=>{
 const release=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))),m=JSON.parse(fs.readFileSync(path.join(root,'dist',release.manifest))),v=m.village;assert(v);
 for(const model of Object.values(v.assets)){assert(/-[0-9a-f]{16}\.glb$/.test(model));assert(fs.existsSync(path.join(root,'dist',model)));assert(fs.existsSync(path.join(root,'public',model)));}
 const app=fs.readFileSync(path.join(root,'dist',v.app),'utf8');assert(app.length<150000);assert([...app.matchAll(/from"([^"]+)"/g)].every(m=>m[1]==='./three-r180.min.js'));
 const page=name=>fs.readFileSync(path.join(root,'dist/releases',release.release,m.pages[name].file),'utf8');assert(page('Hub').includes('data-village-open'));assert(!page('Profile').includes('data-village-open'));assert(!/<script[^>]+src="[^"]*village-app/.test(page('Hub')));
});
