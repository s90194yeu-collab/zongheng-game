const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
test('v4.6全部220題的原典、題幹、選項、答案、解析及順序逐字保留',()=>{
 for(const [file,expected]of Object.entries(require('./fixtures/study-anchor-v46.json'))){const e={};vm.createContext(e);vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',file),'utf8'),e);const rows=Object.entries(e.SCENARIO_DATA).filter(([id])=>!/^S_al(?:2[1-7])_/.test(id)).sort().map(([id,d])=>[id,d.anchors]);assert.equal(rows.reduce((n,[,a])=>n+a.length,0),expected.count);assert.equal(crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'),expected.sha256);}
});
test('50篇選單玩法直接取自可執行任務，指明實際機制與章內變化',()=>{
 const e={window:{ZH:{LEARNING_TEXTS:{}}}};e.ZH=e.window.ZH;vm.createContext(e);for(const file of ['Data_zhuzi','Data_classics','Data_a_selections'])vm.runInContext(fs.readFileSync(path.join(root,'src/legacy',file+'.html'),'utf8').replace(/<\/?script>/g,''),e);
 let count=0;for(const group of ['ZHUZI','CLASSICS','A_SELECTIONS'])for(const c of Object.values(e.window.ZH[group].chapters)){count++;assert(c.playline.length>3,c.id);assert(!/^(課文情境探險|人物情境探險|劇情RPG)/.test(c.genre),c.id);for(const t of c.stages)assert(c.playline.includes(t.mission.title.split('・')[0]),c.id);assert(c.gameTypes.length>0);}
 assert.equal(count,50);
});
