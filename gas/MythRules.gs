// Generated from src/myth/rules.cjs. No student data.
var MYTH_RULES_=(function(){

// Pure rules shared by guest play, GAS and tests. No course grades are written here.
const VERSION='myth-1',RULES='qingqiu-r1';
const STATS=['agility','strength','dexterity','focus','insight','planning'];
const ABILITIES=['swift','steady','precise','foresight','listen','light','plan','trace'];
const COLLECTIONS=[
 ['ink_card','墨靈卡','異獸卡','完成林口墨靈區段','ink'],
 ['paper_card','符紙妖卡','異獸卡','完成符紋遺跡','paper'],
 ['ape_card','石甲猿妖卡','異獸卡','擊敗石甲猿妖','ape'],
 ['fox_card','狐靈卡','異獸卡','首次完成九尾狐試煉','fox'],
 ['fox_jade','狐紋玉墜','立體器物','首次通關青丘','jade'],
 ['lantern','符紋燈','立體器物','找到三枚燈芯，再以 6 靈砂製作','lantern'],
 ['bracer','猿紋護腕複製品','立體器物','以 4 石甲片、12 靈砂製作','bracer'],
 ['forest_scene','林間遇墨','名場面','完成初見墨靈事件','forest'],
 ['creek_scene','溪畔照影','名場面','在溪畔觀察點互動','creek'],
 ['lamps_scene','雙燈映狐','名場面','九尾狐戰中啟動雙燈並通關','lamps'],
 ['fox_statue','青丘九尾狐立像','首領雕像','標準／進階額外掉落 10%，或 8 枚青丘印記兌換','statue'],
 ['qingqiu_banner','守卷者・青丘旗','榮譽展示','收集其他 11 件青丘藏品','banner']
].map(([id,name,kind,hint,model])=>({id:'myth:qingqiu:'+id,name,kind,hint,model}));
const key=id=>'myth:qingqiu:'+id;
const clone=v=>JSON.parse(JSON.stringify(v));
const int=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
function defaults(){return {schema:VERSION,revision:0,stats:Object.fromEntries(STATS.map(s=>[s,2])),abilities:['steady','listen'],weapon:'sword',levels:{sword:1,talisman:1},sand:0,marks:0,cores:0,plates:0,owned:{},slots:Array(6).fill(null),run:null,records:[],receipts:[],clears:0};}
function normalize(value){
 if(!value)return defaults();
 if(value.schema!==VERSION||!int(value.revision,0,1e9))throw Error('冒險存檔版本無法辨識，請回報問題。');
 const s=clone(value);validateConfig(s);
 for(const k of ['sand','marks','cores','plates','clears'])if(!int(s[k],0,1e7))throw Error('冒險資源資料不正確。');
 if(!s.owned||Object.keys(s.owned).some(k=>!COLLECTIONS.some(c=>c.id===k)))throw Error('收藏資料不正確。');
 if(!Array.isArray(s.slots)||s.slots.length!==6||s.slots.some(k=>k!==null&&!s.owned[k]))throw Error('展示配置不正確。');
 if(!Array.isArray(s.receipts)||s.receipts.length>40||!Array.isArray(s.records)||s.records.length>20)throw Error('冒險紀錄超出範圍。');
 return s;
}
function validateConfig(s){
 if(!s.stats||Object.keys(s.stats).length!==6||STATS.some(k=>!int(s.stats[k],0,4))||STATS.reduce((n,k)=>n+s.stats[k],0)!==12)throw Error('六項屬性各 0～4 點，總共須分配 12 點。');
 if(!Array.isArray(s.abilities)||s.abilities.length!==2||new Set(s.abilities).size!==2||s.abilities.some(k=>!ABILITIES.includes(k)))throw Error('請選兩項不同的同行能力。');
 if(!['sword','talisman'].includes(s.weapon)||!s.levels||['sword','talisman'].some(k=>!int(s.levels[k],1,3)))throw Error('武器配置不正確。');
}
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
function apply(value,input,env={}){
 const s=normalize(value),c=clone(input||{}),now=env.now??Date.now();
 if(!/^[A-Za-z0-9_-]{8,96}$/.test(c.requestId||''))throw Error('請求識別不正確。');
 if(JSON.stringify(c).length>900)throw Error('冒險請求超出大小限制。');
 const signature=JSON.stringify(canonical(c)),old=s.receipts.find(x=>x.id===c.requestId);
 if(old){if(old.signature!==signature)throw Error('同一請求內容已改變，請重新讀取。');return {state:s,replayed:true,notice:old.notice};}
 if(c.revision!==s.revision)throw Error('冒險已在另一個分頁更新，請先重新讀取。');
 const fields={configure:['stats','abilities','weapon'],start:['weapon','difficulty'],checkpoint:['runId','checkpoint','optional'],discover:['runId','item'],finish:['runId','metrics'],craft:['item'],upgrade:['weapon'],display:['slots']};
 if(!fields[c.type]||Object.keys(c).some(k=>!['type','revision','requestId',...fields[c.type]].includes(k)))throw Error('冒險請求包含不支援的欄位。');
 let notice='已存到雲端。';const gained=[];
 const unlock=id=>{const k=key(id);if(!s.owned[k]){s.owned[k]={at:now,source:s.run?.id||'craft'};gained.push(k);}};
 const run=()=>{if(!s.run||s.run.id!==c.runId||s.run.status!=='playing')throw Error('這場冒險已被新局取代，請重新開局。');if(now-s.run.startedAt>86400000)throw Error('本局授權已逾期，已確認的收藏仍然保留。');return s.run;};
 switch(c.type){
  case 'configure':
   if(c.stats)s.stats=c.stats;if(c.abilities)s.abilities=c.abilities;if(c.weapon)s.weapon=c.weapon;validateConfig(s);notice='神話配置已儲存；下次出發生效。';break;
  case 'start':{
   if(!['guided','standard','advanced'].includes(c.difficulty))throw Error('請選擇可用的難度。');
   if(c.weapon)s.weapon=c.weapon;validateConfig(s);
   s.run={id:env.id||('run_'+now),rules:RULES,startedAt:now,checkpointAt:now,difficulty:c.difficulty,weapon:s.weapon,level:s.levels[s.weapon],stats:clone(s.stats),abilities:s.abilities.slice(),checkpoint:0,status:'playing',seed:env.seed??1,optional:{creek:false,cores:[]}};
   notice='青丘冒險已準備好。';break;
  }
  case 'checkpoint':{
   const r=run(),n=c.checkpoint;
   if(!int(n,1,3)||n!==r.checkpoint+1)throw Error('區段順序不正確，請先重新確認本局。');
   if(now-r.checkpointAt<1000)throw Error('區段紀錄過快，請稍候再確認。');
   r.checkpoint=n;r.checkpointAt=now;s.sand += [0,3,4,6][n];
   const o=c.optional||{};
   if(o.creek===true&&!r.optional.creek){r.optional.creek=true;unlock('creek_scene');}
   if(Array.isArray(o.cores)){for(const id of new Set(o.cores)){if(['core1','core2','core3'].includes(id)&&!r.optional.cores.includes(id)){r.optional.cores.push(id);s.cores++;}}}
   if(n===1){unlock('ink_card');unlock('forest_scene');}
   if(n===2)unlock('paper_card');
   if(n===3){unlock('ape_card');s.plates+=2;}
   notice='第 '+n+' 區段已確認，素材與新收藏已保存。';break;
  }
  case 'discover':{
   const r=run();
   if(c.item==='creek'){if(!r.optional.creek){r.optional.creek=true;unlock('creek_scene');}}
   else if(['core1','core2','core3'].includes(c.item)){if(!r.optional.cores.includes(c.item)){r.optional.cores.push(c.item);s.cores++;}}
   else throw Error('探索物件不存在。');
   notice='探索發現已保存。';break;
  }
  case 'finish':{
   const r=run(),m=c.metrics||{};
   if(r.checkpoint!==3)throw Error('請先完成三個區段。');
   if(!int(m.activeMs,20000,86400000)||m.activeMs>now-r.startedAt+5000||!int(m.hits,0,10000)||!int(m.lamps,2,200)||!int(m.kills,1,200))throw Error('結算資料不完整，請重新確認。');
   r.status='cleared';s.clears++;s.sand+=9;if(r.difficulty!=='guided')s.marks++;
   unlock('fox_card');unlock('fox_jade');unlock('lamps_scene');
   if(r.difficulty!=='guided'&&(env.random??Math.random)()<.1)unlock('fox_statue');
   s.records.unshift({at:now,weapon:r.weapon,difficulty:r.difficulty,activeMs:m.activeMs,hits:m.hits,lamps:m.lamps});s.records=s.records.slice(0,20);
   notice='九尾狐試煉完成！戰利品已確認，可回館布置。';break;
  }
  case 'craft':{
   const recipes={lantern:{cores:3,sand:6},bracer:{plates:4,sand:12},fox_statue:{marks:8}};
   const recipe=recipes[c.item];if(!recipe)throw Error('這件收藏沒有可用配方。');
   if(s.owned[key(c.item)])throw Error('已持有這件收藏，材料不會重複扣除。');
   for(const [resource,n]of Object.entries(recipe))if(s[resource]<n)throw Error('材料還不足，請查看取得線索。');
   for(const [resource,n]of Object.entries(recipe))s[resource]-=n;unlock(c.item);notice='製作完成，已加入收藏。';break;
  }
  case 'upgrade':{
   if(!['sword','talisman'].includes(c.weapon))throw Error('武器不存在。');
   const lv=s.levels[c.weapon];if(lv>=3)throw Error('這把武器已完成三級鍛造。');
   const cost=lv*18;if(s.sand<cost)throw Error('需要 '+cost+' 靈砂。');
   s.sand-=cost;s.levels[c.weapon]++;notice='武器已鍛造至 '+s.levels[c.weapon]+' 級，下局生效。';break;
  }
  case 'display':
   if(!Array.isArray(c.slots)||c.slots.length!==6||c.slots.some(k=>k!==null&&!s.owned[k])||new Set(c.slots.filter(Boolean)).size!==c.slots.filter(Boolean).length)throw Error('請選擇六個展位，每件藏品最多擺一次。');
   s.slots=c.slots.slice();notice='六個展位已保存。';break;
  default:throw Error('不支援的冒險操作。');
 }
 if(COLLECTIONS.slice(0,11).every(x=>s.owned[x.id]))unlock('qingqiu_banner');
 s.revision++;s.receipts.push({id:c.requestId,signature,notice});s.receipts=s.receipts.slice(-40);
 return {state:normalize(s),gained,notice,replayed:false};
}
function publicState(s){const out=clone(normalize(s));delete out.receipts;return out;}
return {VERSION,RULES,STATS,ABILITIES,COLLECTIONS,defaults,normalize,validateConfig,apply,publicState,key};

})();
