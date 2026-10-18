const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
if(!fs.existsSync(path.join(dist,'release.json')))require('./build.cjs');
const p=JSON.parse(fs.readFileSync(path.join(dist,'release.json'))),m=JSON.parse(fs.readFileSync(path.join(dist,p.manifest)));
console.log(JSON.stringify({ok:Object.keys(m.pages).length===89,release:m.release,chapters:m.chapterCount,pages:Object.keys(m.pages).length,media:m.mediaCount,home:m.homeCount,music:m.musicCount,maxHtmlBytes:Math.max(...Object.values(m.pages).map(p=>p.bytes)),studentDataStored:'原Google試算表',newDatabaseRequired:false},null,2));
