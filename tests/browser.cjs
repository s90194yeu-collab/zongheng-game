// npm test 驗證路由與資料隔離；此檔另以 Playwright 驗證實際遊戲畫面。
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),report=[],errors=[],failures=[];
(async()=>{
 const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
 page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()});});
 const base='http://127.0.0.1:4173';
 try{
 const info=JSON.parse(fs.readFileSync(path.join(root,'qa/build.json'),'utf8'));
 for(const name of Object.keys(info.pages)){
  const start=Date.now();await page.goto(base+'/__preview__/'+name+'.html',{waitUntil:'domcontentloaded'});await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>!!window.ZH),true,name+' core');
  const text=await page.locator('body').innerText();assert(!text.includes('ReferenceError')&&!text.includes('共用核心待更新'),name);
  if(/^S_/.test(name)){
    const buttons=page.locator('button'),labels=await buttons.allTextContents(),index=labels.findIndex(t=>/^開始|^進入/.test(t.trim()));
    assert(index>=0,name+' start missing');await buttons.nth(index).click();
    await page.waitForSelector('.sty-say,.sty-choice,.slg,.sty-game,.zh-anchor,.stl',{timeout:10000});
    await page.waitForTimeout(120);
    const state=await page.evaluate(()=>({media:document.querySelector('[data-ai-asset]')?.getAttribute('href')||document.querySelector('[data-ai-asset]')?.src,calls:ZH_LOCAL_PREVIEW_CALLS.map(x=>x.name)}));
    assert(!state.calls.some(n=>['api_getImageAssets','api_getImageAssetInfo','api_getHubArtwork','api_musicTrack'].includes(n)),name+' media RPC');
    report.push({name,started:true,mediaRpcCalls:0,ms:Date.now()-start});
  }else report.push({name,loaded:true,ms:Date.now()-start});
 }
 await page.goto(base+'/__preview__/Hub.html');await page.waitForTimeout(1800);await page.screenshot({path:path.join(root,'qa/首頁_桌面.png')});
 assert(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--hub-art-cq').includes('/home/cq.webp')),'首頁插畫未載入');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/__preview__/Hub.html');await page.waitForTimeout(500);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'首頁手機溢出');await page.screenshot({path:path.join(root,'qa/首頁_手機.png')});
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/__preview__/Profile.html');await page.waitForTimeout(2500);await page.screenshot({path:path.join(root,'qa/紙娃娃.png')});
 const doll={canvas:await page.locator('canvas').count(),text:(await page.locator('body').innerText()).slice(-1800)};
 assert(doll.canvas>0,'3D紙娃娃必須實際建立WebGL畫布');
 await page.getByRole('button',{name:'女生',exact:true}).click();await page.waitForTimeout(150);
 await page.emulateMedia({reducedMotion:'no-preference'});
 const motion=page.locator('[data-motion]').first();assert.equal(await motion.evaluate(button=>{button.click();return button.getAttribute('aria-pressed');}),'true');
 assert(await page.locator('canvas').count()>0,'換裝與動作後保留3D畫布');
 doll.female=true;doll.motion=true;
 assert.deepEqual(errors,[],'瀏覽器錯誤');assert.deepEqual(failures.filter(r=>r.url.startsWith(base)),[],'本機檔案缺漏');
 const result={passed:true,pages:report,pageErrors:errors,resourceFailures:failures,doll};fs.writeFileSync(path.join(root,'qa/browser.json'),JSON.stringify(result,null,2));console.log('PASS 46頁、40話啟動、素材不經GAS、手機首頁及紙娃娃畫面。');
 }catch(e){fs.writeFileSync(path.join(root,'qa/browser-failed.json'),JSON.stringify({message:e.stack,report,errors,failures},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
