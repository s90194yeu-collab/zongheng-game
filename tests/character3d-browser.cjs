// Run after build and preview: PLAYWRIGHT_MODULE=/path/to/playwright CHROME_PATH=/path/to/Chrome node tests/character3d-browser.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),base=process.env.PREVIEW_URL||'http://127.0.0.1:4174',qa=path.join(root,'qa');
const report={passed:false,checks:[],pageErrors:[],localFailures:[]};fs.mkdirSync(qa,{recursive:true});
const check=(name)=>report.checks.push(name);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1400,height:1100},reducedMotion:'no-preference',acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',error=>report.pageErrors.push(error.message));
 page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)report.localFailures.push({url:new URL(response.url()).pathname,status:response.status()});});
 const inspect=()=>page.evaluate(()=>ZH.character3d.inspect());
 const open=async()=>{await page.getByRole('button',{name:'開啟古風策士試看',exact:true}).click();await page.waitForFunction(()=>ZH.character3d?.active);};
 const close=async()=>{await page.getByRole('button',{name:'返回我的造型',exact:true}).click();assert(await page.locator('#profile-player').isVisible());assert.equal(await page.locator('.c3-canvas').count(),0);};
 try{
  await page.goto(base+'/__preview__/Profile.html');await page.waitForFunction(()=>ZH.character3d&&document.querySelector('#profile-player canvas'));
  assert.equal(await page.locator('.c3-canvas').count(),0);assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/character3d-app|scholar-pilot.*\.glb/.test(r.name)).length),0);check('初始頁保留原換裝，模型與新模組均延後下載');
  await open();const initial=await inspect();assert.equal(initial.revision,'180');assert.equal(initial.bones,14);assert.equal(initial.triangles,18688);assert(Math.abs(initial.height-1.8)<.01);assert(initial.clothMaterials>0);report.asset=initial;
  await page.locator('#character3d-pilot').screenshot({path:path.join(qa,'策士3D_桌面.png')});check('桌面WebGL成功載入與畫面截圖');
  const callIndex=await page.evaluate(()=>ZH_LOCAL_PREVIEW_CALLS.length);
  await page.getByRole('button',{name:'跑步',exact:true}).click();await page.waitForFunction(()=>ZH.character3d.inspect().motion==='run'&&ZH.character3d.inspect().time>.15);check('跑步片段持續推進');
  await page.getByRole('button',{name:'暫停動作',exact:true}).click();const frozen=(await inspect()).time;await page.waitForTimeout(250);assert.equal((await inspect()).time,frozen);check('暫停凍結動畫時間');
  await page.getByRole('button',{name:'梅紅',exact:true}).click();assert.equal((await inspect()).colorId,'plum');assert.equal((await inspect()).time,frozen);check('暫停時可獨立換衣色');
  await page.getByRole('button',{name:'跑步',exact:true}).click();assert.equal((await inspect()).paused,false);check('暫停後重選相同動作可恢復播放');
  const startCamera=(await inspect()).camera;await page.locator('.c3-canvas').focus();await page.keyboard.press('ArrowLeft');assert.notDeepEqual((await inspect()).camera,startCamera);await page.getByRole('button',{name:'鏡頭回正',exact:true}).click();check('鍵盤旋轉與鏡頭回正');
  await page.getByRole('button',{name:'行禮',exact:true}).click();await page.waitForFunction(()=>ZH.character3d.inspect().motion==='bow');await page.waitForFunction(()=>ZH.character3d.inspect().motion==='idle',{timeout:8000});check('行禮播放完成自動回待機');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'下載角色照片',exact:true}).click();const download=await downloadPromise;await download.saveAs(path.join(qa,'策士3D_角色照片.png'));assert(fs.statSync(path.join(qa,'策士3D_角色照片.png')).size>20000);check('角色照片可下載');
  assert.equal(await page.evaluate(i=>ZH_LOCAL_PREVIEW_CALLS.length-i,callIndex),0);check('試看操作不呼叫GAS或寫入角色存檔');
  await close();await open();assert.equal((await inspect()).colorId,'plum');await close();check('關閉釋放畫布，重開保留本次試看配色');
  await page.setViewportSize({width:390,height:844});await open();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert((await inspect()).pixelRatio<=1);await page.screenshot({path:path.join(qa,'策士3D_手機.png'),fullPage:true});check('390px手機排版無橫向溢出並自動降低畫質');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>ZH.character3d.inspect().reduced);const still=(await inspect()).time;await page.getByRole('button',{name:'跑步',exact:true}).click();await page.waitForTimeout(200);assert.equal((await inspect()).time,still);assert.equal((await inspect()).motion,'idle');await close();check('減少動態設定顯示靜態姿勢');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.route('**/*.glb',route=>route.fulfill({status:404,body:'test missing'}));await page.getByRole('button',{name:'開啟古風策士試看',exact:true}).click();await page.getByRole('button',{name:'重新載入角色',exact:true}).waitFor();assert(await page.getByText('角色檔案暫時無法讀取，請重新載入。',{exact:true}).isVisible());await page.unroute('**/*.glb');await page.getByRole('button',{name:'重新載入角色',exact:true}).click();await page.waitForFunction(()=>ZH.character3d.active);await close();check('模型404有錯誤提示，可原頁重試成功');
  let unblock;const blocked=new Promise(resolve=>unblock=resolve);await page.route('**/*.glb',async route=>{await blocked;await route.continue().catch(()=>{});});await page.getByRole('button',{name:'開啟古風策士試看',exact:true}).click();await close();unblock();await page.unroute('**/*.glb');await page.waitForTimeout(300);assert.equal(await page.locator('.c3-canvas').count(),0);check('載入中關閉會取消請求且不留下畫布');
  await open();await page.evaluate(()=>document.querySelector('.c3-canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.getByRole('button',{name:'重新載入角色',exact:true}).waitFor();assert((await inspect()).lost);await page.getByRole('button',{name:'重新載入角色',exact:true}).click();await page.waitForFunction(()=>ZH.character3d.active&&!ZH.character3d.inspect().lost);await close();check('WebGL context遺失有提示，重新載入可恢復');
  await page.route('**/*.glb',route=>route.fulfill({status:200,contentType:'model/gltf-binary',body:'invalid asset'}));await page.getByRole('button',{name:'開啟古風策士試看',exact:true}).click();await page.getByRole('button',{name:'重新載入角色',exact:true}).waitFor();assert(await page.getByText('角色檔案無法開啟，請重新載入。',{exact:true}).isVisible());await page.unroute('**/*.glb');await close();check('模型損壞顯示可理解的錯誤提示');
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|experimental-webgl/.test(type)?null:get.call(this,type,...args);};});
  await page.reload();await page.getByRole('button',{name:'開啟古風策士試看',exact:true}).click();await page.getByRole('button',{name:'重新載入角色',exact:true}).waitFor();assert(await page.getByText('目前無法開啟立體試看，請返回我的造型，或換個瀏覽器再試。',{exact:true}).isVisible());await close();check('無WebGL可返回原造型，頁面仍可操作');
  assert.deepEqual(report.pageErrors,[]);assert.equal(report.localFailures.filter(x=>x.status!==404).length,0);
  report.passed=true;
 }finally{await browser.close();fs.writeFileSync(path.join(qa,'character3d-browser.json'),JSON.stringify(report,null,2));}
 console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
