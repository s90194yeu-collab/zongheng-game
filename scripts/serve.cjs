const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../dist'), port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.m4a':'audio/mp4'};
http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.startsWith('/__preview__/')){
    const release=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8')).release;
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'releases',release,'manifest.json'),'utf8'));
    const url=new URL(req.url,'http://localhost'),names={hub:'Hub',map:'Map',profile:'Profile',gallery:'Gallery',result:'Result',teacher:'Teacher'};
    const key=url.searchParams.get('page')||pathname.split('/').pop().replace('.html','')||'Hub';
    const name=names[key]||key,entry=manifest.pages[name];
    if(!entry){res.writeHead(404).end('找不到試玩頁');return;}
    const site='http://127.0.0.1:'+port+'/',chapters=Object.keys(manifest.pages).filter(n=>/^S_/.test(n));
    const boot={appUrl:site+'__preview__/',page:/^S_/.test(name)?name:name.toLowerCase(),params:Object.fromEntries(url.searchParams),version:'v4-local-preview',assetBase:site,user:{email:'',isSchool:false,isGuest:true,isTeacher:false},guestScenarios:chapters};
    const anchors=fs.readFileSync(path.resolve(__dirname,'../qa/anchors.json'),'utf8');
    const adapter=fs.readFileSync(path.resolve(__dirname,'../src/platform/local-preview.js'),'utf8');
    let html=fs.readFileSync(path.join(root,'releases',release,entry.file),'utf8').replaceAll('https://s90194yeu-collab.github.io/zongheng-game/',site);
    html=html.replace('<!--ZH_SERVER_BOOT-->','<script>window.ZH_BOOT='+JSON.stringify(boot).replace(/</g,'\\u003c')+';window.ZH_PREVIEW_ANCHORS='+anchors.replace(/</g,'\\u003c')+';</script><script>'+adapter+'</script>');
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(html);return;
  }
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname+'index.html' : pathname));
  if (!file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
  fs.stat(file,(error,stat)=>{
    if(error || !stat.isFile()){res.writeHead(404).end('找不到頁面');return;}
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;
    if(start>end||start>=stat.size){res.writeHead(416).end();return;}
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
    if(range)headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    res.writeHead(range?206:200,headers);fs.createReadStream(file,{start,end}).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log(`遊戲預覽：http://127.0.0.1:${port}`));
