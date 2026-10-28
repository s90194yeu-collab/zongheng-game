const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..');
function glb(name){const bytes=fs.readFileSync(path.join(root,'public/models',name+'.glb'));assert.equal(bytes.toString('ascii',0,4),'glTF');return{bytes,data:JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))};}
test('精修模型嵌入真正PNG貼圖、保持網頁預算，舊版模型仍可供釘選版本使用',()=>{
 for(const name of ['museum-village','spring-interior']){
  const {bytes,data}=glb(name);assert(bytes.length<8*1024*1024);assert(data.images.length>=10);
  const binOffset=20+bytes.readUInt32LE(12)+8;
  for(const image of data.images){assert.equal(image.mimeType,'image/png');assert(!image.uri);const view=data.bufferViews[image.bufferView],start=binOffset+(view.byteOffset||0);assert.equal(bytes.subarray(start+1,start+4).toString(),'PNG');assert(bytes.readUInt32BE(start+16)<=512);assert(bytes.readUInt32BE(start+20)<=512);}
  assert(data.meshes.length<(name==='spring-interior'?65:30));
 }
 assert(fs.existsSync(path.join(root,'public/models/museum-village-739b721eb15164b4.glb')));
 assert.notEqual(glb('spring-interior').bytes.compare(glb('museum-interior').bytes),0);
});
test('三件教學模型與六個竹簡活動分組可由正式GLTFLoader解析，位置符合原展櫃',async()=>{
 global.self=globalThis;global.createImageBitmap||=async()=>({width:256,height:256,close(){}});
 const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),THREE=await import('three'),{ARTIFACTS}=await import('../src/village/artifacts.js');
 const {bytes}=glb('spring-interior');const parsed=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');
 for(const [id,pos]of Object.entries({west:[-5,-1],north:[0,-5],east:[5,-1]})){
  const object=parsed.scene.getObjectByName(ARTIFACTS[id].node);assert(object,id);const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  assert(Math.abs(center.x-pos[0])<.3,id);assert(Math.abs(center.z-pos[1])<.3,id);assert(size.x>1&&size.x<2.5);assert(size.z>.8&&size.z<1.8);assert(bounds.min.y>1.2&&bounds.max.y<2.6);
 }
 const bamboo=parsed.scene.getObjectByName('Artifact_Bamboo');assert.equal(bamboo.children.filter(o=>/^BambooPanel_\d+$/.test(o.name)).length,6);
});
test('近看文字對應三件不同展品，藝術示意與原文來源界線清楚',async()=>{
 const {ARTIFACTS,artifactFor}=await import('../src/village/artifacts.js');assert.equal(artifactFor('bad'),ARTIFACTS.north);
 for(const info of Object.values(ARTIFACTS)){assert.equal(info.details.length,3);assert.equal(new Set(info.details.map(d=>d.label)).size,3);for(const d of info.details)assert(d.view.every(Number.isFinite));}
 assert(ARTIFACTS.north.note.includes('美術示意'));assert(ARTIFACTS.east.note.includes('不按比例'));
});

const source=fs.readFileSync(path.join(root,'src/village/app.js'),'utf8'),nodes=[];
function visit(n){if(!n||typeof n!=='object')return;if(n.type)nodes.push(n);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}visit(acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'}));
function functions(...names){return names.map(name=>{const n=nodes.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(n);return source.slice(n.start,n.end);}).join('\n');}
function fixture(){
 const elements=new Map(),q=s=>{if(!elements.has(s))elements.set(s,{children:[],textContent:'',hidden:false,focus(){},setAttribute(k,v){this[k]=v;},replaceChildren(...a){this.children=a;},append(...a){this.children.push(...a);}});return elements.get(s);};
 let created=0,disposed=0,selected=0,focused=[];
 const info={title:'盟書',subtitle:'提問',intro:'觀察',note:'說明',details:[{label:'看編繩',text:'推理依據',view:[0,3,2]}]};
 const ctx={museum:{id:'cq'},dialog:{open:true},artifactDialog:{open:false,showModal(){this.open=true;},close(){this.open=false;}},artifactViewer:null,q,selectedCase:'north',spring:{scene:{}},media:{matches:true},OrbitControls:function(){},stop(){},renderMission(){},artifactFor:()=>info,el:()=>({setAttribute(){}}),onSelect(){selected++;},mountArtifactViewer(){created++;return{focus:i=>focused.push(i),dispose(){disposed++;}};}};
 vm.createContext(ctx);vm.runInContext(functions('openArtifact','closeArtifact'),ctx);return{ctx,q,stats:()=>({created,disposed,selected,focused})};
}
test('近看只在春秋展櫃可開，切換觀察不觸發選章，反覆開關會釋放檢視器',()=>{
 const f=fixture();f.ctx.museum.id='zg';f.ctx.openArtifact();assert.equal(f.stats().created,0);f.ctx.museum.id='cq';f.ctx.dialog.open=false;f.ctx.openArtifact();assert.equal(f.stats().created,0);f.ctx.dialog.open=true;
 for(let i=0;i<3;i++){f.ctx.openArtifact();assert(f.ctx.artifactDialog.open);f.q('[data-v-artifact-details]').children[0].onclick();assert.equal(f.q('[data-v-artifact-detail]').textContent,'推理依據');f.ctx.closeArtifact();assert(!f.ctx.artifactDialog.open);}
 assert.deepEqual(f.stats(),{created:3,disposed:3,selected:0,focused:[0,0,0]});
});
test('WebGL近看失敗會顯示可讀訊息，仍可關閉回到原篇章清單',()=>{
 const f=fixture();f.ctx.mountArtifactViewer=()=>{throw Error('近看畫面暫時無法開啟。');};f.ctx.openArtifact();assert(f.ctx.artifactDialog.open);assert.equal(f.q('[data-v-artifact-stage]').children.length,1);assert.equal(f.ctx.artifactViewer,null);f.ctx.closeArtifact();assert(f.ctx.dialog.open);assert.equal(f.stats().selected,0);
});
