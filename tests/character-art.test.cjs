const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../src/character/model.cjs');
const config=p=>({...R.defaults(),skills:p.recommended.slice()});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
test('52篇同行都對應原章插畫與情境材質，美術不修改世界狀態',async()=>{
 const {artDirection,illustratedStage}=await import('../src/character/art.js');
 const text=fs.readFileSync(path.join(__dirname,'../src/legacy/Data_assets.html'),'utf8'),assets=JSON.parse(text.split('/* ASSET_MANIFEST_START */')[1].split('/* ASSET_MANIFEST_END */')[0]);
 const kinds=new Set();assert.equal(R.PILOTS.length,52);
 for(const p of R.PILOTS){const w=R.create(p.id,config(p),{nickname:'測試'},19),before=JSON.stringify(w),a=artDirection(w,R);assert.equal(a.scene,p.scene);assert(assets.entries[a.scene],p.id);assert(fs.existsSync(path.join(__dirname,'../public/media',assets.entries[a.scene].file)));const html=illustratedStage({world:w,R,esc,avatar:()=>'<svg data-outfit></svg>'});assert(html.includes('data-outfit'));assert(html.includes(esc(p.title)));assert(!/undefined|NaN/.test(html));assert.equal(JSON.stringify(w),before);kinds.add(a.material);}
 assert(kinds.size>=6);
});
test('角色透明化移除卡片底圖，保留全套衣飾與身份，不改原人物卡',async()=>{
 const {fieldDoll}=await import('../src/character/art.js');const svg='<svg viewBox="0 0 180 270"><rect data-backdrop/><g class="pl-doll-actor"><g data-hair="braid"/><g data-outfit="festival"/><g data-accessory="fan"/></g></svg>';
 const field=fieldDoll(svg);assert(!field.includes('data-backdrop'));for(const tag of ['data-hair="braid"','data-outfit="festival"','data-accessory="fan"'])assert(field.includes(tag));assert(svg.includes('data-backdrop'));assert.equal(fieldDoll(field),field);assert.equal(fieldDoll('<svg data-full-avatar></svg>'),'<svg data-full-avatar></svg>');
});
test('夜縋三路線的物件／巡燈／封印按實際規則座標繪製，不產生額外命中區',async()=>{
 const {nightLayout}=await import('../src/character/night-art.js'),p=R.pilot('S_cq08_weizheng');
 for(const route of R.chapterRoutes(p.id)){
  const w=R.createChapter(p.id,config(p),{},12,{route:route.id}),before=JSON.stringify(w),a=nightLayout(w,R);
  assert.deepEqual(a.covers.map(({x,y})=>({x,y})),R.coverPoints(w));assert.deepEqual(a.lights,R.lit(w));assert.deepEqual(a.player,{x:w.x,y:w.y});assert.equal(JSON.stringify(w),before);
 }
});
test('章名、角色與圖像URL以純文字輸出，不注入事件或改變操作名稱',async()=>{
 const {illustratedStage,controlArt}=await import('../src/character/art.js');const p=R.PILOTS[0],w=R.create(p.id,config(p),{},1),bad='<img src=x onerror=bad()>',mock={pilot:()=>({...p,name:bad,title:bad,role:bad})};const html=illustratedStage({world:w,R:mock,esc,avatar:()=>'<svg></svg>'});assert(!html.includes('<img src=x'));assert(html.includes('&lt;img'));assert(controlArt('sail').includes('aria-hidden="true"'));assert.equal(controlArt('not-a-command'),'');
});
test('手機、桌面與高解析畫布拖曳皆對齊角色座標，上下端保留完整人物空間',async()=>{
 const {nightPoint,nightPointer}=await import('../src/character/night-art.js');
 for(const [width,height] of [[1000,600],[750,450],[350,210],[2000,1200]])for(const point of [{x:50,y:0},{x:22,y:26},{x:78,y:57},{x:42,y:83},{x:50,y:100}]){
  const p=nightPoint(point),back=nightPointer(p.x/1000*width,p.y/600*height,width,height);assert(Math.abs(back.x-point.x)<1e-9);assert(Math.abs(back.y-point.y)<1e-9);
 }
 assert(nightPoint({x:50,y:0}).y>=68);assert(nightPoint({x:50,y:100}).y<=560);
});
test('巡燈光帶含四角，投影後邊界吻合規則橫向14及縱向5的範圍',async()=>{
 const {nightLightBox,nightPointer}=await import('../src/character/night-art.js');
 const box=nightLightBox({x:50,y:57});
 const near=nightPointer(box.x,box.y,1000,600);assert.equal(near.x,36);assert(Math.abs(near.y-52)<1e-9);
 const far=nightPointer(box.x+box.width,box.y+box.height,1000,600);assert.equal(far.x,64);assert(Math.abs(far.y-62)<1e-9);
});
