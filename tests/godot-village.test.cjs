const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
test('Godot訊息只接受指定視窗、來源與本次通道，偽造結果不會通過',async()=>{
 const {validEvent,PROTOCOL}=await import('../src/godot/protocol.js'),source={},context={source,origin:'https://s90194yeu-collab.github.io',channel:'unique-session'};
 const event={source,origin:context.origin,data:{protocol:PROTOCOL,channel:context.channel,type:'ready'}};
 assert(validEvent(event,context));for(const patch of [{source:{}},{origin:'https://example.com'},{data:{...event.data,channel:'old-session'}},{data:{...event.data,protocol:'other'}},{data:null}])assert(!validEvent({...event,...patch},context));
});
test('Godot外觀只傳五個有效選項，不帶入帳號、姓名、試算表或其他資料',async()=>{
 const {safeAppearance}=await import('../src/godot/protocol.js');const look=safeAppearance({body:'female',outfit:'armor',color:'plum',skin:'deep',hairColor:'silver',email:'private',studentId:'private',sheetId:'private'});
 assert.deepEqual(look,{body:'female',outfit:'armor',color:'plum',skin:'deep',hairColor:'silver'});assert.equal(safeAppearance({body:'remote',outfit:'invalid'}).body,'male');assert.equal(safeAppearance({outfit:'invalid'}).outfit,'scholar');
});
test('Godot選課沿用可玩條件，未開放、舊章與需登入課程均不會放行',async()=>{
 const {chapterAllowed}=await import('../src/godot/protocol.js');const catalog=[{id:'cq08',status:'ready'},{id:'locked',status:'ready'},{id:'old',status:'ready',legacyOnly:true},{id:'soon',status:'draft'}],canPlay=id=>id!=='locked';
 assert(chapterAllowed(catalog,'cq08',canPlay));for(const id of ['locked','old','soon','missing'])assert(!chapterAllowed(catalog,id,canPlay));
});
test('Godot網頁模組有真正WebAssembly與PCK，所有檔案固定版本且雜湊一致',()=>{
 const record=JSON.parse(fs.readFileSync(path.join(root,'public/godot/release.json')));assert.equal(record.threadSupport,false);assert(record.engine.startsWith('4.7.2.'));assert(record.entry.includes('godot/village-'));
 for(const file of record.files){const bytes=fs.readFileSync(path.join(root,'public',file.path));assert.equal(bytes.length,file.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256);if(file.path.endsWith('.wasm'))assert.equal(bytes.subarray(0,4).toString('hex'),'0061736d');if(file.path.endsWith('.pck'))assert.equal(bytes.subarray(0,4).toString(),'GDPC');}
 const html=fs.readFileSync(path.join(root,'public',record.entry),'utf8');assert(html.includes('threads:false'));assert(html.includes('event.source!==parent'));assert(html.includes('value.channel!==channel'));assert(!html.includes('$GODOT_'));
 const cfg=fs.readFileSync(path.join(root,'godot/village/project.godot'),'utf8');assert(cfg.includes('gl_compatibility'));assert(!cfg.includes('max_fps='));
});
test('Godot子頁的實際接線接受GAS動態網域，拒絕其他視窗、錯誤通道及來源變更',()=>{
 const vm=require('node:vm'),record=JSON.parse(fs.readFileSync(path.join(root,'public/godot/release.json'))),html=fs.readFileSync(path.join(root,'public',record.entry),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const listeners={},parent={postMessage(){}},element={},received=[],context={URLSearchParams,location:{hash:'#channel=unit123'},parent,document:{querySelector:()=>element}};context.window=context;context.addEventListener=(name,fn)=>listeners[name]=fn;vm.runInNewContext(script,context);context.ZH_GODOT.register(value=>received.push(JSON.parse(value)));
 const origin='https://n-example-0lu-script.googleusercontent.com',data={protocol:'zh-godot-v1',channel:'unit123',type:'init',appearance:{body:'female'}};
 for(const event of [{source:parent,origin:'https://evil.example',data},{source:{},origin,data},{source:parent,origin,data:{...data,channel:'wrong'}}])listeners.message(event);assert.equal(received.length,0);
 listeners.message({source:parent,origin,data});assert.equal(received.length,1);assert.equal(received[0].appearance.body,'female');listeners.message({source:parent,origin:'https://other-script.googleusercontent.com',data});assert.equal(received.length,1);
});
