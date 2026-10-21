// 自動產生：src/character/model.cjs；純規則，與前端共用。
var OC_RULES_=(function(){var module={exports:{}};
'use strict';
// 同一份純規則用於瀏覽器、GAS 配點核對與測試；不接觸原篇分數。
const VERSION='oc-1',BUDGET=12;
const STATS=[['agility','身法','夜縋移位速度'],['strength','臂力','夜縋握力消耗'],['dexterity','巧手','對勘展讀速度'],['focus','定力','潛行察覺餘裕與校勘時間'],['insight','察勢','觀測持續時間'],['planning','籌算','治理每輪可用調度令']];
const SKILLS=[
 {id:'swift',name:'迅影',kinds:['action'],uses:2,desc:'短暫加速2.5秒，耗握力12並增加聲響。'},
 {id:'steady',name:'握定',kinds:['action','collation'],uses:2,desc:'夜縋減少橫風但放繩變慢；對勘讓照明停留較久。'},
 {id:'precise',name:'巧勁',kinds:['collation'],uses:2,desc:'放大對讀視窗8秒，但這段時間計時較快。'},
 {id:'foresight',name:'望勢',kinds:['action','strategy','collation'],uses:2,desc:'夜縋顯示巡燈預跡；治理預看下輪需求；對勘提示本段論證作用。'},
 {id:'listen',name:'聽息',kinds:['action'],uses:2,desc:'停步聽察2秒，之後短暫看見巡燈方向；巡燈仍會移動。'},
 {id:'light',name:'輕裝',kinds:['action'],uses:0,desc:'自動生效：移動快15%，握力上限降為80。'},
 {id:'plan',name:'運籌',kinds:['strategy'],uses:2,desc:'取得一枚本輪調度令；每輪最多使用一次。'},
 {id:'trace',name:'留痕',kinds:['action','strategy','collation'],uses:2,desc:'記下自己的位置、配置或展讀區，方便比較；不提供最佳解。'}
];
const PILOTS=[
 {id:'S_cq08_weizheng',kind:'action',name:'燭之武退秦師',title:'夜縋護簡',scene:'scene:cq08_world',role:'夜縋同行者',recommended:['steady','listen'],quote:'夜縋而出，見秦伯曰：「秦、晉圍鄭，鄭既知亡矣。」',source:'《左傳・僖公三十年》',brief:'燭之武將出城見秦伯。你沿繩下行，把三束隨行書簡交到牆邊暗龕，再抵達城下接應點。這是自編同行任務。',rule:'拖曳角色移位／放繩，或按住方向按鈕。避開巡燈，在三處暗龕旁停穩後按「交付書簡」，最後到城下按「抵達接應」。',after:'秦伯說，與鄭人盟。燭之武的說服仍從秦國利害展開；你完成的是沿途護送，沒有替他決定談判結果。'},
 {id:'S_cq16_datong',kind:'strategy',name:'大同與小康',title:'公天下調度',scene:'scene:cq16_world',role:'鄉里調度者',recommended:['plan','foresight'],quote:'故人不獨親其親，不獨子其子。使老有所終，壯有所用，幼有所長，矜寡孤獨廢疾者皆有所養。',source:'《禮記・禮運》',brief:'八位鄉人各有兩項專長。你要讓養老、育幼、照護、勞作與公共倉五處分工在四日中都有人承擔。需求來自自編治理情境。',rule:'選一位鄉人再點工作區：專長可承擔2份，一般分工1份。首輪八令，其後每輪三令加籌算加成；調動一人耗一令。需求每日改變，四日都達標才完成。',after:'你完成了四日的公共分工。文本還要求選賢與能、講信修睦，不能只用人數配置概括大同；接著回原篇比較天下為公與天下為家。'},
 {id:'S_zg11_zhuke',kind:'collation',name:'諫逐客書',title:'諫書對勘',scene:'scene:zg11_world',role:'書簡校讀者',recommended:['precise','trace'],quote:'此四君者，皆以客之功。由此觀之，客何負於秦哉！',source:'李斯〈諫逐客書〉',brief:'李斯上書之前，你受託對讀三段書簡。展開底本，圈出待校文字，修正並說明它在論證中的作用。訛字為自編教學材料，不當作真實版本異文。',rule:'在上方底本移動光窗並停留展讀，下方點選待校字，再選替換字。每段另選論證標籤並按「核對本段」；三段都校妥才完成。',after:'書簡校讀完成。首段判斷、四君事證與取人標準的對照共同支撐李斯的諫言；上書與秦王的決策仍按原篇敘述。'}
];
const JOBS=['養老','育幼','照護','勞作','公共倉'];
const SPECIALTIES=[[0,2],[0,4],[1,2],[1,3],[2,4],[3,0],[3,1],[4,2]];
const NEEDS=[[4,2,2,3,2],[2,3,4,2,2],[3,2,2,2,4],[2,4,3,3,2]];
const EVENTS=['安頓鄉里：養老與勞作的需求較高。','雨後照護：照護與育幼需求上升，重新銜接輪值。','倉儲整備：公共倉需求上升，兼顧養老。','巡視回訪：育幼、照護與勞作都需要適任的人。'];
const TEXTS=[
 {original:'臣聞吏議逐客，竊以為過矣。',draft:'臣聞吏議逐客，竊以為善矣。',choices:['過','善','功'],labels:['提出判斷','鋪陳宮廷珍寶','作出讓步'],reason:0,explain:'「過」指出逐客之議的錯誤，開宗明義提出反對判斷。'},
 {original:'此四君者，皆以客之功。',draft:'此四君者，皆以客之過。',choices:['過','利','功'],labels:['否定客卿功績','歸結四君用客之效','主張只看出身'],reason:1,explain:'「功」歸結四君受益於客卿，承接歷史事證。'},
 {original:'今取人則不然，不問可否，不論曲直，非秦者去，為客者逐。',draft:'今取人則不然，但問可否，但論曲直，非秦者去，為客者逐。',choices:['但','不','皆'],labels:['以國籍代替才能的取人標準','讚賞秦國唯才是舉','敘述異國器物之美'],reason:0,explain:'兩個「不」呈現不察是非才能、只按出身逐客的矛盾。'}
];
const copy=x=>JSON.parse(JSON.stringify(x)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pilot(id){const p=PILOTS.find(p=>p.id===id);if(!p)throw Error('此篇尚未開放角色冒險。');return p;}
function config(value){
 if(!value||value.schema!==VERSION)throw Error('原創角色配點格式不正確。');
 const stats={};let total=0;for(const [k]of STATS){const n=value.stats?.[k];if(!Number.isInteger(n)||n<0||n>4)throw Error('每項冒險屬性須為0至4點。');stats[k]=n;total+=n;}
 if(total!==BUDGET)throw Error('請分配完整12點，總點數不能增加。');
 const skills=value.skills;if(!Array.isArray(skills)||skills.length!==2||new Set(skills).size!==2||skills.some(k=>!SKILLS.some(s=>s.id===k)))throw Error('請裝備兩項不同能力。');
 const revision=value.revision??0;if(!Number.isInteger(revision)||revision<0)throw Error('角色資料版本不正確。');
 return {schema:VERSION,stats,skills:skills.slice(),revision};
}
function defaults(){return {schema:VERSION,stats:Object.fromEntries(STATS.map(([k])=>[k,2])),skills:['steady','listen'],revision:0};}
function compatible(c,id){const p=pilot(id);return config(c).skills.every(k=>SKILLS.find(s=>s.id===k).kinds.includes(p.kind));}
function create(id,raw,identity={},seed=1){
 const p=pilot(id),c=config(raw);if(!compatible(c,id))throw Error('請先改配本篇可用的兩項能力。');
 const snapshot={config:c,identity:copy(identity)},w={schema:VERSION,id,kind:p.kind,seed:Math.abs(seed|0)||1,snapshot,status:'playing',time:0,limit:p.kind==='action'?150:p.kind==='collation'?190+c.stats.focus*6:720,uses:{},cooldowns:{},buffs:{},notice:'',errors:0,trace:null};
 if(p.kind==='action')Object.assign(w,{x:50,y:0,target:null,grip:c.skills.includes('light')?80:100,maxGrip:c.skills.includes('light')?80:100,exposure:0,maxExposure:100+c.stats.focus*5,delivered:[],pins:[],lanternOffset:(w.seed%30)/10});
 if(p.kind==='strategy')Object.assign(w,{day:0,people:Array(8).fill(-1),selected:0,orders:8,results:[],plannedDay:-1});
 if(p.kind==='collation')Object.assign(w,{page:0,draft:Array.from(TEXTS[0].draft),seen:{},probe:-1,selected:-1,reason:-1,finished:[]});
 return w;
}
function skill(w,id){
 if(w.status!=='playing')return false;const s=SKILLS.find(s=>s.id===id);if(!s||!w.snapshot.config.skills.includes(id)||!s.kinds.includes(w.kind)){w.notice='本局未裝備這項能力。';return false;}
 if(!s.uses){w.notice='輕裝已在開局生效；握力上限為80。';return false;}
 if((w.uses[id]||0)>=s.uses||w.time<(w.cooldowns[id]||0)){w.notice='次數已用完，或能力尚在冷卻。';return false;}
 if(id==='plan'&&w.plannedDay===w.day){w.notice='每輪只能加用一枚調度令。';return false;}
 w.uses[id]=(w.uses[id]||0)+1;w.cooldowns[id]=w.time+10;
 const insight=w.snapshot.config.stats.insight;
 if(id==='swift'){w.buffs.swift=w.time+2.5;w.grip=Math.max(0,w.grip-12);w.exposure+=7;}
 if(id==='steady')w.buffs.steady=w.time+7;
 if(id==='precise')w.buffs.precise=w.time+8;
 if(id==='foresight')w.buffs.foresight=w.time+6+insight;
 if(id==='listen'){w.buffs.listening=w.time+2;w.buffs.foresight=w.time+8+insight;}
 if(id==='plan'){w.orders++;w.plannedDay=w.day;}
 if(id==='trace')w.trace=w.kind==='action'?{x:w.x,y:w.y}:w.kind==='strategy'?{day:w.day,people:w.people.slice()}:{page:w.page,seen:copy(w.seen)};
 w.notice=s.name+'已使用；本局配裝仍固定。';return true;
}
function lit(w,t=w.time){return [26,57,83].map((y,i)=>({x:50+Math.sin((t+w.lanternOffset)*(0.38+i*.07)+i*2)*38,y}));}
function cover(w){return [{x:22,y:26},{x:78,y:57},{x:42,y:83}].findIndex(p=>Math.abs(p.x-w.x)<10&&Math.abs(p.y-w.y)<5);}
function inspect(w,index,dt){
 if(w.kind!=='collation'||w.status!=='playing')return;
 const text=TEXTS[w.page].original,rate=1+w.snapshot.config.stats.dexterity*.12;
 if(Number.isInteger(index)&&index>=0&&index<Array.from(text).length){w.probe=index;w.seen[index]=Math.min(1,(w.seen[index]||0)+dt*rate);}
}
function step(w,input={},seconds=.05){
 if(w.status!=='playing')return w;const dt=clamp(Number(seconds)||0,0,.1);w.time+=dt;
 if(w.kind==='action'){
  const s=w.snapshot.config.stats,light=w.snapshot.config.skills.includes('light'),swift=w.buffs.swift>w.time,steady=w.buffs.steady>w.time;
  if(!(w.buffs.listening>w.time)){
   const speed=(9+s.agility*1.2)*(light?1.15:1)*(swift?1.65:1),xBefore=w.x,yBefore=w.y;
   if(w.target){w.x+=clamp(w.target.x-w.x,-speed*3*dt,speed*3*dt);w.y+=clamp(w.target.y-w.y,-speed*dt,speed*dt)*(steady?.65:1);}
   else {w.x+=((input.right?1:0)-(input.left?1:0))*speed*3*dt;w.y+=((input.down?1:0)-(input.up?1:0))*speed*dt*(steady?.65:1);}
   const moving=Math.abs(w.x-xBefore)+Math.abs(w.y-yBefore)>.001;
   if(moving){w.grip-=(1.3-s.strength*.12)*dt;w.x+=Math.sin(w.time*2.1)*dt*(steady?.2:1.5);}
   w.x=clamp(w.x,5,95);w.y=clamp(w.y,0,100);
  }
  const safe=cover(w)>=0,exposed=!safe&&lit(w).some(p=>Math.abs(p.y-w.y)<5&&Math.abs(p.x-w.x)<14);
  w.exposure=clamp(w.exposure+(exposed?23:-3)*dt,0,w.maxExposure);if(safe)w.grip=Math.min(w.maxGrip,w.grip+4*dt);
  w.grip=clamp(w.grip,0,w.maxGrip);if(w.exposure>=w.maxExposure||w.grip<=0){w.status='lost';w.notice='巡察察覺或握力不足。沿暗龕停留，觀察巡燈後再行動。';}
 }
 if(w.kind==='collation'){
  if(w.buffs.precise>w.time)w.time+=dt*.25;
  if(w.probe>=0)inspect(w,w.probe,dt*(w.buffs.steady>w.time?1.6:1));
 }
 if(w.time>=w.limit){w.status='lost';w.notice='本次時間已到，可重試；原篇首答與分數保留。';}return w;
}
function transfer(w,person,to){
 if(w.kind!=='strategy'||w.status!=='playing'||!Number.isInteger(person)||person<0||person>7||!Number.isInteger(to)||to<0||to>4)return false;
 if(w.people[person]===to){w.notice='這位鄉人已在此輪值。';return false;}
 if(w.orders<1){w.notice='本輪調度令已用完；可檢視配置或使用運籌。';return false;}
 w.people[person]=to;w.orders--;return true;
}
function counts(w){return JOBS.map((_,i)=>w.people.reduce((n,x,j)=>n+(x===i?(SPECIALTIES[j].includes(i)?2:1):0),0));}
function commit(w){
 if(w.kind!=='strategy'||w.status!=='playing')return false;
 const need=NEEDS[w.day],got=counts(w),ok=need.every((n,i)=>got[i]>=n);w.results.push({day:w.day,people:w.people.slice(),got,need:need.slice(),ok});
 if(!ok){w.status='lost';w.notice='有照顧或公共分工缺口。回看原文，再重新安排這四日。';return false;}
 w.day++;if(w.day===4){w.status='won';w.notice='四日分工皆已銜接。';}else{w.orders=3+Math.floor(w.snapshot.config.stats.planning/2);w.notice=EVENTS[w.day];}return true;
}
function patch(w,value){
 if(w.kind!=='collation'||w.status!=='playing')return false;const t=TEXTS[w.page],i=w.selected;
 if(i<0||(w.seen[i]||0)<1){w.notice='先在底本照明並停留展讀相同位置，再校字。';return false;}
 if(!t.choices.includes(value))return false;
 if(Array.from(t.original)[i]!==value||w.draft[i]===value){w.errors++;w.time+=6;w.notice='這次改字尚未與底本相合；展讀上下文後再核對。';return false;}
 w.draft[i]=value;w.notice='改字已記下；還須核對本段與論證標籤。';return true;
}
function check(w){
 if(w.kind!=='collation'||w.status!=='playing')return false;const t=TEXTS[w.page];
 if(w.draft.join('')!==t.original||w.reason!==t.reason){w.errors++;w.time+=5;w.notice='仍有待校文字，或論證作用尚未吻合。請再對讀。';return false;}
 w.finished.push(w.page);w.page++;if(w.page===3){w.status='won';w.page=2;w.notice='三段文字與論證作用均已核對。';}else{w.draft=Array.from(TEXTS[w.page].draft);w.seen={};w.selected=-1;w.probe=-1;w.reason=-1;w.notice=t.explain;}return true;
}
function command(w,name,value){
 if(w.status!=='playing')return false;
 if(name==='skill')return skill(w,value);
 if(name==='move'&&w.kind==='action'&&value&&Number.isFinite(value.x)&&Number.isFinite(value.y)){w.target={x:clamp(value.x,5,95),y:clamp(value.y,0,100)};return true;}
 if(name==='stop'){w.target=null;w.probe=-1;return true;}
 if(name==='deliver'&&w.kind==='action'){const at=cover(w);if(at<0||w.delivered.includes(at)){w.notice='到尚未交付的暗龕旁停穩，再交付書簡。';return false;}w.delivered.push(at);w.target=null;w.notice='第'+w.delivered.length+'束書簡已交付。';return true;}
 if(name==='finish'&&w.kind==='action'){if(w.delivered.length!==3||w.y<95){w.notice='先交付三束書簡，再抵達城下接應點。';return false;}w.status='won';return true;}
 if(name==='transfer')return transfer(w,value?.person,value?.to);
 if(name==='commit')return commit(w);
 if(name==='select'&&w.kind==='collation'&&Number.isInteger(value)&&value>=0&&value<w.draft.length){w.selected=value;return true;}
 if(name==='probe'&&w.kind==='collation'&&Number.isInteger(value)&&value>=0&&value<w.draft.length){w.probe=value;return true;}
 if(name==='patch')return patch(w,value);
 if(name==='reason'&&w.kind==='collation'&&Number.isInteger(value)&&value>=0&&value<3){w.reason=value;return true;}
 if(name==='check')return check(w);return false;
}
function score(w){if(w.status!=='won')return 0;return Math.round(clamp(100-w.errors*4-(w.kind==='action'?w.exposure*.15:0)-Math.max(0,w.time-45)*.08,0,100));}
function restore(raw){
 if(!raw||raw.schema!==VERSION)throw Error('角色冒險存檔格式不符。');const c=config(raw.snapshot?.config),p=pilot(raw.id);
 if(!compatible(c,p.id)||raw.kind!==p.kind||!['playing','won','lost'].includes(raw.status)||!Number.isFinite(raw.time)||raw.time<0||raw.time>1200||!Number.isFinite(raw.limit)||raw.limit<1||raw.limit>900)throw Error('角色冒險狀態無法核對。');
 const w=copy(raw);if(JSON.stringify(w).length>30000)throw Error('角色冒險存檔過大。');
 const allFinite=o=>{for(const v of Object.values(o||{})){if(typeof v==='number'&&!Number.isFinite(v))return false;if(v&&typeof v==='object'&&!allFinite(v))return false;}return true;};if(!allFinite(w))throw Error('角色冒險數值無法辨識。');
 const fresh=create(p.id,c,w.snapshot.identity,w.seed);
 if(w.limit!==fresh.limit||w.errors<0||w.errors>1000||!Number.isInteger(w.errors))throw Error('冒險條件與開局不同。');
 for(const [k,v]of Object.entries(w.cooldowns||{}))if(!c.skills.includes(k)||!Number.isFinite(v)||v<0||v>w.time+20)throw Error('能力冷卻不正確。');
 for(const [k,v]of Object.entries(w.buffs||{}))if(!['swift','steady','precise','foresight','listening'].includes(k)||!Number.isFinite(v)||v<0||v>w.time+20)throw Error('能力持續時間不正確。');
 for(const [id,n]of Object.entries(w.uses||{})){const s=SKILLS.find(s=>s.id===id);if(!s||!c.skills.includes(id)||!Number.isInteger(n)||n<0||n>s.uses)throw Error('能力次數不正確。');}
 if(p.kind==='action'&&(!Array.isArray(w.delivered)||new Set(w.delivered).size!==w.delivered.length||w.delivered.some(n=>![0,1,2].includes(n))||!Number.isFinite(w.x)||!Number.isFinite(w.y)||!Number.isFinite(w.grip)||w.x<5||w.x>95||w.y<0||w.y>100||w.maxGrip!==fresh.maxGrip||w.grip<0||w.grip>w.maxGrip||w.maxExposure!==fresh.maxExposure||!Number.isFinite(w.exposure)||w.exposure<0||w.exposure>w.maxExposure))throw Error('夜縋存檔不正確。');
 if(p.kind==='strategy'&&(!Array.isArray(w.people)||w.people.length!==8||w.people.some(n=>!Number.isInteger(n)||n< -1||n>4)||!Number.isInteger(w.day)||w.day<0||w.day>4||!Number.isInteger(w.orders)||w.orders<0||w.orders>9||!Array.isArray(w.results)||![w.day,w.day+1].includes(w.results.length)))throw Error('調度存檔不正確。');
 if(p.kind==='collation'&&(!Number.isInteger(w.page)||w.page<0||w.page>2||!Array.isArray(w.draft)||w.draft.length!==Array.from(TEXTS[w.page].original).length||w.draft.some(x=>typeof x!=='string'||Array.from(x).length!==1)||Object.entries(w.seen||{}).some(([i,n])=>!/^\d+$/.test(i)||+i>=w.draft.length||typeof n!=='number'||n<0||n>1)))throw Error('對勘存檔不正確。');
 if(w.status==='won'){
  const valid=p.kind==='action'?w.delivered.length===3&&w.y>=95:p.kind==='strategy'?w.day===4&&w.results.length===4&&w.results.every((r,i)=>r.day===i&&r.ok===true&&Array.isArray(r.got)&&r.got.length===5&&Array.isArray(r.people)&&r.people.length===8&&r.people.every(n=>Number.isInteger(n)&&n>=0&&n<5)&&counts(r).every((v,j)=>v===r.got[j])&&NEEDS[i].every((n,j)=>r.got[j]>=n)):Array.isArray(w.finished)&&w.finished.join(',')==='0,1,2'&&w.draft.join('')===TEXTS[2].original&&w.reason===TEXTS[2].reason;
  if(!valid)throw Error('任務條件尚未完成，不能記為通關。');
 }
 return w;
}
module.exports={VERSION,BUDGET,STATS,SKILLS,PILOTS,JOBS,SPECIALTIES,NEEDS,EVENTS,TEXTS,copy,clamp,pilot,config,defaults,compatible,create,skill,lit,cover,step,inspect,command,counts,score,restore};

return module.exports;})();
