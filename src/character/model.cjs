'use strict';
// 同一份純規則用於瀏覽器、GAS 配點核對與測試；不接觸原篇分數。
const CH=require('./chuhan.cjs');
const VERSION='oc-1',BUDGET=12;
const STATS=[['agility','身法','移位速度與楚漢行動時機'],['strength','臂力','握力、渡運載重與攜糧'],['dexterity','巧手','展讀速度與拼符、試放餘裕'],['focus','定力','察覺餘裕、校勘時間與起跳窗口'],['insight','察勢','觀測持續時間'],['planning','籌算','輪值調度、護衛令與解謎餘裕']];
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
PILOTS.push(...CH.PILOTS);
const JOBS=['養老','育幼','照護','勞作','公共倉'];
const SPECIALTIES=[[0,2],[0,4],[1,2],[1,3],[2,4],[3,0],[3,1],[4,2]];
const NEEDS=[[4,2,2,3,2],[2,3,4,2,2],[3,2,2,2,4],[2,4,3,3,2]];
const EVENTS=['安頓鄉里：養老與勞作的需求較高。','雨後照護：照護與育幼需求上升，重新銜接輪值。','倉儲整備：公共倉需求上升，兼顧養老。','巡視回訪：育幼、照護與勞作都需要適任的人。'];
const TEXTS=[
 {original:'臣聞吏議逐客，竊以為過矣。',draft:'臣聞吏議逐客，竊以為善矣。',choices:['過','善','功'],labels:['提出判斷','鋪陳宮廷珍寶','作出讓步'],reason:0,explain:'「過」指出逐客之議的錯誤，開宗明義提出反對判斷。'},
 {original:'此四君者，皆以客之功。',draft:'此四君者，皆以客之過。',choices:['過','利','功'],labels:['否定客卿功績','歸結四君用客之效','主張只看出身'],reason:1,explain:'「功」歸結四君受益於客卿，承接歷史事證。'},
 {original:'今取人則不然，不問可否，不論曲直，非秦者去，為客者逐。',draft:'今取人則不然，但問可否，但論曲直，非秦者去，為客者逐。',choices:['但','不','皆'],labels:['以國籍代替才能的取人標準','讚賞秦國唯才是舉','敘述異國器物之美'],reason:0,explain:'兩個「不」呈現不察是非才能、只按出身逐客的矛盾。'}
];
// 同行章節使用原篇已收錄的語句；教學推演、操作品質與閱讀首答分開保存。
const CHAPTER_VERSION='chapter-1';
const CHAPTERS={
 S_cq08_weizheng:{title:'夜縋與說秦',intro:'你作為護簡同行者，先讀夜縋的處境與說秦的理由，再自行決定潛行路線。燭之武的外交言辭及秦伯決定仍依原篇。',evidence:[
  {id:'wz-night',tag:'處境與行動',prompt:'同行者必須避開巡燈下城，哪個判斷最貼近原文？',choices:['鄭國已安全，可以公開出使','圍城下採夜間縋城，仍有行動風險','燭之武已指揮秦軍攻晉'],evidence:[{id:'night',text:'夜縋而出，見秦伯。'},{id:'far',text:'越國以鄙遠，君知其難也。'}],answer:1,correctEvidence:'night',explain:'夜縋而出交代夜間用繩下城；這是危局中的接近途徑，不能推成鄭已脫困。'},
  {id:'wz-interest',tag:'利害推論',prompt:'「越國以鄙遠」用來提醒秦伯什麼？',choices:['秦能輕易把鄭當近郊','鄭與秦之間沒有其他國家','越過別國控制遠地有困難'],evidence:[{id:'far',text:'越國以鄙遠，君知其難也。'},{id:'night',text:'夜縋而出，見秦伯。'}],answer:2,correctEvidence:'far',explain:'越國、鄙遠指出地理與治理成本，說服從秦國可得的利益及困難展開。'}
 ],reflection:[
  {id:'wz-role',tag:'秦晉利害',prompt:'「鄰之厚，君之薄也」為何能用來勸秦退兵？',choices:['亡鄭主要使鄰國晉增強，秦的相對力量反而減弱','只要鄰國變強，秦一定同等變強','鄭國增土便能讓秦立即吞晉'],evidence:[{id:'balance',text:'焉用亡鄭以陪鄰？鄰之厚，君之薄也。'},{id:'night',text:'夜縋而出。'}],answer:0,correctEvidence:'balance',explain:'陪鄰即增加鄰國土地與勢力；晉得利不等於秦得利，厚薄須放在秦晉相對利害中理解。'},
  {id:'wz-end',tag:'利害推論',prompt:'「失其所與，不知」反映晉文公最後考量的是？',choices:['把盟友當成永久敵人','失去同盟不合明智，撤軍另有政治判斷','只因夜縋速度太快而撤軍'],evidence:[{id:'ally',text:'因人之力而敝之，不仁；失其所與，不知；以亂易整，不武。吾其還也。'},{id:'far',text:'越國以鄙遠，君知其難也。'}],answer:1,correctEvidence:'ally',explain:'結尾列仁、知、武三層理由，晉文公的退兵也有自己的判斷，不能化約為操作成績。'}
 ],remedy:[
  {id:'wz-r-night',tags:['處境與行動'],tag:'處境與行動',prompt:'重讀後，哪一組把行動者與行動正確接合？',choices:['同行者代秦伯與鄭人盟','燭之武夜縋出城，見秦伯陳說利害','晉文公夜縋出城請秦攻晉'],evidence:[{id:'night',text:'夜縋而出，見秦伯曰。'}],answer:1,correctEvidence:'night',explain:'把夜縋、見秦伯及發言連讀，保留原作人物行動；護簡是另外標示的同行推演。'},
  {id:'wz-r-interest',tags:['利害推論'],tag:'利害推論',prompt:'若只說「我很可憐，請退兵」，尚未掌握哪個關鍵？',choices:['秦國控制遠鄭的成本及秦晉利害','夜縋時穿什麼顏色','書簡越多就一定能說服'],evidence:[{id:'far',text:'越國以鄙遠，君知其難也。'}],answer:0,correctEvidence:'far',explain:'這句讓秦伯衡量自身利害；閱讀理由與動作熟練是兩項不同表現。'},
  {id:'wz-r-balance',tags:['秦晉利害'],tag:'秦晉利害',prompt:'晉得到鄭地而增強，秦為什麼未必受益？',choices:['秦會因此自動取得同樣土地','鄰國晉的相對勢力增加，秦的相對地位反而減弱','晉得到鄭地就表示秦已控制鄭'],evidence:[{id:'balance',text:'焉用亡鄭以陪鄰？鄰之厚，君之薄也。'}],answer:1,correctEvidence:'balance',explain:'焉用的反問把亡鄭與陪鄰相連，指出秦出力卻主要厚晉的相對損失。'}
 ]},
 S_cq16_datong:{title:'皆有所養的四日',intro:'你是協助鄉里輪值的調度者。八人專長、數量與四日需求皆為自編推演，藉此檢查照養是否遺漏；完成配置不表示歷史上已實現大同。',evidence:[
  {id:'dt-merit',tag:'選賢與能',prompt:'安排輪值時，哪個理由符合「選賢與能」？',choices:['只選自己親近的人','查核專長是否符合工作需要','只看誰願意搶最快'],evidence:[{id:'merit',text:'大道之行也，天下為公。選賢與能，講信修睦。'},{id:'care',text:'故人不獨親其親，不獨子其子。'}],answer:1,correctEvidence:'merit',explain:'選任要看賢能與職務需要，還要講信修睦；專長只是推演中的一種可查線索。'},
  {id:'dt-care',tag:'照養範圍',prompt:'遇到照護需求升高，應先確認什麼？',choices:['只照顧輪值者家人','每項都分一人便算公平','不同需要者有無落在照養範圍外'],evidence:[{id:'care',text:'使老有所終，壯有所用，幼有所長，矜寡孤獨廢疾者皆有所養。'},{id:'merit',text:'選賢與能，講信修睦。'}],answer:2,correctEvidence:'care',explain:'皆有所養針對不同處境，不是要求人人領同額，更不是只照顧熟人。'}
 ],reflection:[
  {id:'dt-fair',tag:'照養範圍',prompt:'為何四日需求不平均，仍可能是公平配置？',choices:['公平是讓不同需求得到照應，未必每處同額','公共倉永遠不必有人','人少的工作可以不管'],evidence:[{id:'care',text:'老有所終，壯有所用，幼有所長。'},{id:'kin',text:'故人不獨親其親，不獨子其子。'}],answer:0,correctEvidence:'care',explain:'老、壯、幼的需要不同；遊戲的份數是教學工具，不能用整齊同額取代照養。'},
  {id:'dt-boundary',tag:'公家對照',prompt:'「天下為家」與大同的哪一項原則形成對照？',choices:['天下為家表示天下所有人都被視作同一家，已超越大同','小康完全沒有制度與禮義','天下為公、不獨親其親，與各親其親、貨力為己形成對照'],evidence:[{id:'public-family',text:'故人不獨親其親，不獨子其子。……今大道既隱，天下為家，各親其親，各子其子。貨力為己，大人世及以為禮。'},{id:'care',text:'使老有所終，壯有所用，幼有所長。'}],answer:2,correctEvidence:'public-family',explain:'為家轉向親子、貨力與世及的私有承襲；小康仍有禮義為紀，不能把天下為家誤作更廣大的天下一家。'}
 ],remedy:[
  {id:'dt-r-merit',tags:['選賢與能'],tag:'選賢與能',prompt:'某人雖是熟人，仍須做哪一步？',choices:['免查實績直接任命','查核能力是否合職，並對公共責任說明','由遊戲分數證明他德行完美'],evidence:[{id:'merit',text:'選賢與能，講信修睦。'}],answer:1,correctEvidence:'merit',explain:'親近不能取代能力與責任查核；數量達標也不直接證明德行。'},
  {id:'dt-r-care',tags:['照養範圍'],tag:'照養範圍',prompt:'遇到不能出力的病者，哪項安排符合本段？',choices:['因不能工作便排除照養','只照顧與自己同姓者','仍須把照護需求納入分工'],evidence:[{id:'care',text:'矜寡孤獨廢疾者皆有所養。'}],answer:2,correctEvidence:'care',explain:'照養範圍包括無依與廢疾者，不能把是否能出勞力當成受養資格。'},
  {id:'dt-r-family',tags:['公家對照'],tag:'公家對照',prompt:'小康有城郭溝池，又說「禮義以為紀」，應怎樣理解？',choices:['天下為家仍須禮義維持秩序，不能說完全沒有規範','有城牆便不再需要禮義','小康與大同的親子、貨力原則完全相同'],evidence:[{id:'rules',text:'城郭溝池以為固，禮義以為紀。'}],answer:0,correctEvidence:'rules',explain:'小康雖不同於天下為公的理想，仍以禮義為綱紀；制度差異須分項對照。'}
 ]},
 S_zg11_zhuke:{title:'校字與辨論',intro:'你作為校讀同行者，先確認論證的用意，再對勘三段教學書簡。訛字為自編材料，校字正確與理解論證分開診斷。',evidence:[
  {id:'zk-history',tag:'歷史事證',prompt:'「此四君者，皆以客之功」在文中主要做什麼？',choices:['歸結四君用客所得，以支持反對逐客','證明外來士人每個都無風險','把四君本人都說成客卿'],evidence:[{id:'history',text:'此四君者，皆以客之功。由此觀之，客何負於秦哉！'},{id:'standard',text:'非秦者去，為客者逐。'}],answer:0,correctEvidence:'history',explain:'四君的歷史例證歸結於用客之功；不能把多例概括誤作對所有人的絕對保證。'},
  {id:'zk-standard',tag:'對比論證',prompt:'「不問可否，不論曲直」揭示哪個取人問題？',choices:['先查才能再問國籍','只按是否秦人排斥，未察是非才能','秦王完全不接受外國珍寶'],evidence:[{id:'standard',text:'今取人則不然，不問可否，不論曲直，非秦者去，為客者逐。'},{id:'history',text:'此四君者，皆以客之功。'}],answer:1,correctEvidence:'standard',explain:'李斯把取物與取人的標準相對照，揭出不察才能而以出身逐客的矛盾。'}
 ],reflection:[
  {id:'zk-word',tag:'字詞與論旨',prompt:'把首段的「過」誤成「善」，影響是什麼？',choices:['只有字形不同，不影響立場','把反對逐客的判斷改成贊成，必須對讀校正','讓四君用客的史實增加一例'],evidence:[{id:'judgment',text:'臣聞吏議逐客，竊以為過矣。'},{id:'history',text:'此四君者，皆以客之功。'}],answer:1,correctEvidence:'judgment',explain:'過、善在這裡改變對逐客之議的評價；校字須放回句意，不能只追求手速。'},
  {id:'zk-order',tag:'論證層次',prompt:'從四君用客之功轉向當今取人標準，應如何理解？',choices:['兩段都是無關主張的裝飾','四君事證推翻一切審查人才的必要','先舉歷史成效，再揭當前取人矛盾'],evidence:[{id:'connection',text:'此四君者，皆以客之功。……今取人則不然，不問可否，不論曲直。'},{id:'judgment',text:'臣聞吏議逐客，竊以為過矣。'}],answer:2,correctEvidence:'connection',explain:'歷史例證與當今矛盾層層支撐諫言，並不是否定查核人才的必要。'}
 ],remedy:[
  {id:'zk-r-history',tags:['歷史事證','論證層次'],tag:'歷史事證',prompt:'四君用客例證最能支持哪項結論？',choices:['客卿曾對秦有重大貢獻，逐客之議須重新衡量','只要外來便一定比秦人高明','文章沒有使用任何事證'],evidence:[{id:'history',text:'此四君者，皆以客之功。'}],answer:0,correctEvidence:'history',explain:'事證支持用客之利，不支持「所有外來者一定最好」的過度推論。'},
  {id:'zk-r-standard',tags:['對比論證','字詞與論旨'],tag:'對比論證',prompt:'對讀「不問可否」時，應保留哪個意思？',choices:['已逐一問清人才是否可用','尚未察人可用與否，便按出身驅逐','逐客完全沒有國家影響'],evidence:[{id:'standard',text:'不問可否，不論曲直，非秦者去，為客者逐。'}],answer:1,correctEvidence:'standard',explain:'兩個不字與後面的逐客相連；校正文字後還要掌握它對取人標準的批評。'}
 ]}
};
Object.assign(CHAPTERS,CH.CHAPTERS);
const CHAPTER_ROUTES={
 action:[{id:'shadow',name:'巡燈迂迴線',brief:'沿三處暗龕橫移，觀察巡燈後穿越。',build:'察勢型：先觀察、分段前進。',tradeoff:'移動距離較長，停在暗龕可回握力。',points:[{x:22,y:26},{x:78,y:57},{x:42,y:83}],speed:1,grip:1,radius:10,limit:150},
 {id:'shelter',name:'近壁守穩線',brief:'暗龕沿牆排列，較少橫移，放繩需耐心。',build:'臂力型：慢行、保握力、把握停留。',tradeoff:'速度降15%，握力耗損降25%，可停靠範圍較寬。',points:[{x:22,y:26},{x:27,y:57},{x:22,y:83}],speed:.85,grip:.75,radius:13,limit:180},
 {id:'daring',name:'中庭搶隙線',brief:'接近巡燈中線，利用短暫空檔快速下行。',build:'身法型：抓空檔、及時轉向。',tradeoff:'移速增12%，暴露累積增15%，限時130秒。',points:[{x:65,y:26},{x:50,y:57},{x:65,y:83}],speed:1.12,grip:1,radius:10,limit:130}],
 strategy:[{id:'common',name:'鄉里四日',brief:'安頓、雨後、倉儲、回訪依序銜接。',build:'觀察專長，保留可接續的配置。',tradeoff:'每次調動都耗一令；專長之外一般分工只承擔一份。',order:[0,1,2,3]},
 {id:'rotation',name:'倉雨調序',brief:'倉儲整備提前，雨後照護延後，重新推演調度。',build:'預看需求，降低反覆調動。',tradeoff:'需求輪序改變；不能沿用前一局的固定調動順序。',order:[0,2,1,3]}],
 collation:[{id:'original',name:'三段對勘',brief:'首段判斷、歷史事證、取人標準依次校讀。',build:'巧手管理展讀，定力保留核對時間。',tradeoff:'校字與論證標籤都須親自判斷；能力不代答。'}]
};
for(const s of SKILLS){s.kinds.push('chuhan');s.chuhanDesc=({swift:'迅影：短暫擴大起跳與傳訊時機，或縮短行路間隔。',steady:'握定：短暫擴大起跳、穿行暗窗。',precise:'巧勁：拼符顯示逐片錯位，營建預覽整塊範圍。',foresight:'望勢：預看後續敵襲、全圖或本篇配置線索。',listen:'聽息：停步2秒，短暫看清全圖及行路時機。',light:'輕裝：行路更快、時機稍寬；總時限減少25秒。',plan:'運籌：依本篇增加航次、護衛令、換旗令或重畫餘裕。',trace:'留痕：記下自己目前的進度，供後續比較。'})[s.id];}
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
function compatible(c,id){const p=pilot(id);return (p.kind!=='chuhan'||CH.compatible(c,p.id))&&config(c).skills.every(k=>SKILLS.find(s=>s.id===k).kinds.includes(p.kind));}
function create(id,raw,identity={},seed=1){
 const p=pilot(id),c=config(raw);if(!compatible(c,id))throw Error('請先改配本篇可用的兩項能力。');
 const snapshot={config:c,identity:copy(identity)},w={schema:VERSION,id,kind:p.kind,seed:Math.abs(seed|0)||1,snapshot,status:'playing',time:0,limit:p.kind==='action'?150:p.kind==='collation'?190+c.stats.focus*6:720,uses:{},cooldowns:{},buffs:{},notice:'',errors:0,trace:null};
 if(p.kind==='chuhan'){w.limit=210+c.stats.focus*8+(p.mechanic==='seal'?c.stats.dexterity*6:0)-(c.skills.includes('light')?25:0);w.campaign=CH.initial(w);}
 if(p.kind==='action')Object.assign(w,{x:50,y:0,target:null,grip:c.skills.includes('light')?80:100,maxGrip:c.skills.includes('light')?80:100,exposure:0,maxExposure:100+c.stats.focus*5,delivered:[],pins:[],lanternOffset:(w.seed%30)/10});
 if(p.kind==='strategy')Object.assign(w,{day:0,people:Array(8).fill(-1),selected:0,orders:8,results:[],plannedDay:-1});
 if(p.kind==='collation')Object.assign(w,{page:0,draft:Array.from(TEXTS[0].draft),seen:{},probe:-1,selected:-1,reason:-1,finished:[]});
 return w;
}
function chapterRoutes(id){return pilot(id).kind==='chuhan'?CH.routes(id):copy(CHAPTER_ROUTES[pilot(id).kind]);}
function routeFor(w){if(w.kind==='chuhan')return CH.routes(w.id)[0];return CHAPTER_ROUTES[w.kind].find(r=>r.id===w.chapter?.route)||CHAPTER_ROUTES[w.kind][0];}
function coverPoints(w){return copy(w.chapter?routeFor(w).points:[{x:22,y:26},{x:78,y:57},{x:42,y:83}]);}
function needs(w,day=w.day){return NEEDS[w.chapter?routeFor(w).order[day]:day]?.slice()||[];}
function event(w,day=w.day){return EVENTS[w.chapter?routeFor(w).order[day]:day]||'';}
function createChapter(id,raw,identity={},seed=1,options={}){
 const w=create(id,raw,identity,seed),routes=chapterRoutes(id),route=options.route||routes[0].id;if(!routes.some(r=>r.id===route))throw Error('本篇沒有這條同行路線。');
 w.chapter={version:CHAPTER_VERSION,phase:'evidence',route,answers:{evidence:{},reflection:{},remedy:{}},history:[],missionResult:null,metrics:{peakExposure:0,minGrip:w.grip??100,distance:0,transfers:0,redundantTransfers:0,patchErrors:0,argumentErrors:0,unreadPatchAttempts:0},optional:{}};
 if(w.kind==='action')w.limit=routeFor(w).limit;
 w.notice='先讀原文並選出支持判斷的證據，任務計時尚未開始。';return w;
}
function skill(w,id){
 if(w.kind==='chuhan')return command(w,'skill',id);
 if(w.status!=='playing'||w.chapter&&w.chapter.phase!=='mission')return false;const s=SKILLS.find(s=>s.id===id);if(!s||!w.snapshot.config.skills.includes(id)||!s.kinds.includes(w.kind)){w.notice='本局未裝備這項能力。';return false;}
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
 if(w.chapter&&w.kind==='action'){w.chapter.metrics.peakExposure=Math.max(w.chapter.metrics.peakExposure,w.exposure);w.chapter.metrics.minGrip=Math.min(w.chapter.metrics.minGrip,w.grip);}
 w.notice=s.name+'已使用；本局配裝仍固定。';return true;
}
function lit(w,t=w.time){return [26,57,83].map((y,i)=>({x:50+Math.sin((t+w.lanternOffset)*(0.38+i*.07)+i*2)*38,y}));}
function cover(w){return coverPoints(w).findIndex(p=>Math.abs(p.x-w.x)<(w.chapter?routeFor(w).radius:10)&&Math.abs(p.y-w.y)<5);}
function inspect(w,index,dt){
 if(w.kind!=='collation'||w.status!=='playing'||w.chapter&&w.chapter.phase!=='mission')return;
 const text=TEXTS[w.page].original,rate=1+w.snapshot.config.stats.dexterity*.12;
 if(Number.isInteger(index)&&index>=0&&index<Array.from(text).length){w.probe=index;w.seen[index]=Math.min(1,(w.seen[index]||0)+dt*rate);}
}
function step(w,input={},seconds=.05){
 if(w.status!=='playing'||w.chapter&&w.chapter.phase!=='mission')return w;const dt=clamp(Number(seconds)||0,0,.1),beforeX=w.x,beforeY=w.y;w.time+=dt;
 if(w.kind==='action'){
  const s=w.snapshot.config.stats,light=w.snapshot.config.skills.includes('light'),swift=w.buffs.swift>w.time,steady=w.buffs.steady>w.time;
  if(!(w.buffs.listening>w.time)){
   const speed=(9+s.agility*1.2)*(light?1.15:1)*(swift?1.65:1)*(w.chapter?routeFor(w).speed:1),xBefore=w.x,yBefore=w.y;
   if(w.target){w.x+=clamp(w.target.x-w.x,-speed*3*dt,speed*3*dt);w.y+=clamp(w.target.y-w.y,-speed*dt,speed*dt)*(steady?.65:1);}
   else {w.x+=((input.right?1:0)-(input.left?1:0))*speed*3*dt;w.y+=((input.down?1:0)-(input.up?1:0))*speed*dt*(steady?.65:1);}
   const moving=Math.abs(w.x-xBefore)+Math.abs(w.y-yBefore)>.001;
   if(moving){w.grip-=(1.3-s.strength*.12)*dt*(w.chapter?routeFor(w).grip:1);w.x+=Math.sin(w.time*2.1)*dt*(steady?.2:1.5);}
   w.x=clamp(w.x,5,95);w.y=clamp(w.y,0,100);
  }
  const safe=cover(w)>=0,exposed=!safe&&lit(w).some(p=>Math.abs(p.y-w.y)<5&&Math.abs(p.x-w.x)<14);
  w.exposure=clamp(w.exposure+(exposed?23*(w.chapter?.route==='daring'?1.15:1):-3)*dt,0,w.maxExposure);if(safe)w.grip=Math.min(w.maxGrip,w.grip+4*dt);
  w.grip=clamp(w.grip,0,w.maxGrip);if(w.exposure>=w.maxExposure||w.grip<=0){w.status='lost';w.notice='巡察察覺或握力不足。沿暗龕停留，觀察巡燈後再行動。';}
 }
 if(w.kind==='collation'){
  if(w.buffs.precise>w.time)w.time+=dt*.25;
  if(w.probe>=0)inspect(w,w.probe,dt*(w.buffs.steady>w.time?1.6:1));
 }
 if(w.time>=w.limit){w.status='lost';w.notice='本次時間已到，可重試；原篇首答與分數保留。';}
 if(w.chapter&&w.kind==='action'){const m=w.chapter.metrics;m.peakExposure=Math.max(m.peakExposure,w.exposure);m.minGrip=Math.min(m.minGrip,w.grip);m.distance+=Math.hypot(w.x-beforeX,w.y-beforeY);}
 settleChapter(w);return w;
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
 const need=needs(w),got=counts(w),ok=need.every((n,i)=>got[i]>=n);w.results.push({day:w.day,people:w.people.slice(),got,need:need.slice(),ok});
 if(!ok){w.status='lost';w.notice='有照顧或公共分工缺口。回看原文，再重新安排這四日。';return false;}
 w.day++;if(w.day===4){w.status='won';w.notice='四日分工皆已銜接。';}else{w.orders=3+Math.floor(w.snapshot.config.stats.planning/2);w.notice=event(w);}return true;
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
function coreCommand(w,name,value){
 if(w.status!=='playing')return false;
 if(w.kind==='chuhan'){if(name==='stop')return true;return CH.command(w,name,value);}
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
function missionScore(w){return Math.round(clamp(100-w.errors*4-(w.kind==='action'?w.exposure*.15:0)-Math.max(0,w.time-45)*.08,0,100));}
function score(w){return w.status==='won'?missionScore(w):0;}
function coreComplete(w){
 if(w.kind==='chuhan')return CH.complete(w);
 if(w.kind==='action')return w.delivered.length===3&&w.y>=95;
 if(w.kind==='strategy')return w.day===4&&w.results.length===4&&w.results.every((r,i)=>r.day===i&&r.ok===true&&Array.isArray(r.got)&&r.got.length===5&&Array.isArray(r.people)&&r.people.length===8&&r.people.every(n=>Number.isInteger(n)&&n>=0&&n<5)&&counts(r).every((v,j)=>v===r.got[j])&&needs(w,i).every((n,j)=>r.got[j]>=n));
 return Array.isArray(w.finished)&&w.finished.join(',')==='0,1,2'&&w.draft.join('')===TEXTS[2].original&&w.reason===TEXTS[2].reason;
}
function chapterObjectives(w){
 if(!w.chapter)return [];
 if(w.kind==='chuhan')return CH.objectives(w);
 if(w.kind==='action')return [{id:'seal',label:'繞道拾回封印',done:w.chapter.optional.seal===true,x:85,y:41},{id:'quiet',label:'最高暴露低於25',done:w.chapter.metrics.peakExposure<25},{id:'grip',label:'結束保有至少65握力',done:w.grip>=65}];
 if(w.kind==='strategy')return [{id:'specialty',label:'四日都依專長分工',done:w.results.length===4&&w.results.every(r=>r.people.every((to,i)=>SPECIALTIES[i].includes(to)))},{id:'handover',label:'總調動不超過14次',done:w.chapter.metrics.transfers<=14}];
 return [{id:'characters',label:'校字沒有誤改',done:w.chapter.metrics.patchErrors===0},{id:'argument',label:'論證標籤首次皆正確',done:w.chapter.metrics.argumentErrors===0}];
}
function operationReport(w){
 if(w.kind==='chuhan')return CH.report(w);
 const m=w.chapter.metrics,won=!!w.chapter.missionResult,seconds=Math.round(w.time*10)/10,items=[],suggestions=[];let quality=0;
 if(w.kind==='action'){
  quality=Math.round(clamp(100-m.peakExposure*.35-Math.max(0,65-w.grip)*.3,0,100));
  items.push({label:'最高暴露',value:Math.round(m.peakExposure)},{label:'最低握力',value:Math.round(m.minGrip)},{label:'已交書簡',value:w.delivered.length+'/3'});
  if(m.peakExposure>=25)suggestions.push('巡燈接近時先進暗龕，等燈移遠再下行；可改試近壁守穩線。');
  if(m.minGrip<50)suggestions.push('臂力可減少移動耗損；停在暗龕回握力，勿連續趕路。');
  if(!suggestions.length)suggestions.push('再挑戰拾回封印或另一條路線，觀察同配點的時間與品質差異。');
 }else if(w.kind==='strategy'){
  const valid=w.results.filter(r=>r.ok).length,general=w.results.reduce((n,r)=>n+r.people.filter((to,i)=>!SPECIALTIES[i].includes(to)).length,0);
  quality=Math.round(clamp(valid*25-general*2-Math.max(0,m.transfers-14)*3-m.redundantTransfers*2,0,100));
  items.push({label:'達標日數',value:valid+'/4'},{label:'總調動',value:m.transfers},{label:'重複調動嘗試',value:m.redundantTransfers},{label:'非專長輪值',value:general});
  if(general)suggestions.push('先比較專長的兩份貢獻與一般分工的一份，再把人放到缺口較大的工作。');
  if(m.transfers>14||m.redundantTransfers)suggestions.push('先預看明日需求，再調整必要的人，減少來回搬動。');
  if(!suggestions.length)suggestions.push('改試'+(w.chapter.route==='rotation'?'鄉里四日':'倉雨調序')+'，以較少調動維持四日照養，檢查原配置是否仍合用。');
 }else{
  quality=Math.round(clamp(100-m.patchErrors*8-m.argumentErrors*10-m.unreadPatchAttempts*3,0,100));
  items.push({label:'校字誤改',value:m.patchErrors},{label:'論證標籤誤判',value:m.argumentErrors},{label:'未展讀改字嘗試',value:m.unreadPatchAttempts},{label:'已核對段數',value:w.finished.length+'/3'});
  if(m.patchErrors||m.unreadPatchAttempts)suggestions.push('先展讀底本同字位及上下文，再改待校字；校字失誤不等同論證不懂。');
  if(m.argumentErrors)suggestions.push('分清首段判斷、四君事證與取人標準的對照，校字全對仍須再讀論證。');
  if(!suggestions.length)suggestions.push('已能把文字與論證分開核對，可嘗試減少展讀來回並保持品質。');
 }
 return {title:w.kind==='action'?'潛行操作':w.kind==='strategy'?'調度操作':'校字與論證操作',completed:won,seconds,quality,items,suggestions};
}
function settleChapter(w){
 if(!w.chapter||w.chapter.phase!=='mission'||w.status!=='won')return;
 const operation=operationReport(w);w.chapter.missionResult={time:w.time,score:missionScore(w),quality:operation.quality};w.chapter.phase='reflection';w.status='playing';w.target=null;w.probe=-1;w.notice='同行任務完成。接著用原文說明判斷；操作成績與閱讀表現分開保留。';
}
function command(w,name,value){
 if(w.chapter&&w.chapter.phase!=='mission')return false;
 if(w.chapter&&name==='recover'&&w.kind==='action'){
  if(w.status!=='playing'||w.chapter.optional.seal||Math.abs(w.x-85)>7||Math.abs(w.y-41)>5){w.notice='封印落在右側85、41附近；須親自繞道接近才可拾回。';return false;}
  w.chapter.optional.seal=true;w.notice='封印已拾回；仍須交齊書簡並抵達接應。';return true;
 }
 const m=w.chapter?.metrics,oldErrors=w.errors,unread=m&&name==='patch'&&w.kind==='collation'&&(w.seen[w.selected]||0)<1,wrongWord=m&&name==='check'&&w.kind==='collation'&&w.draft.join('')!==TEXTS[w.page].original,wrongReason=m&&name==='check'&&w.kind==='collation'&&w.reason!==TEXTS[w.page].reason;
 const ok=coreCommand(w,name,value);
 if(m){if(name==='transfer'){if(ok)m.transfers++;else if(value&&w.people[value.person]===value.to)m.redundantTransfers++;}if(unread)m.unreadPatchAttempts++;if(name==='patch'&&w.errors>oldErrors)m.patchErrors++;if(wrongWord)m.patchErrors++;if(wrongReason)m.argumentErrors++;if(w.kind==='action'){m.peakExposure=Math.max(m.peakExposure,w.exposure);m.minGrip=Math.min(m.minGrip,w.grip);}}
 settleChapter(w);return ok;
}
function wrongTags(w){return [...new Set(w.chapter.history.filter(a=>a.stage!=='remedy'&&!a.correct).map(a=>chapterQuestions(w,a.stage).find(q=>q.id===a.questionId)?.tag).filter(Boolean))];}
function chapterQuestions(w,stage){
 if(!w.chapter||!['evidence','reflection','remedy'].includes(stage))return [];
 const d=CHAPTERS[w.id];if(stage!=='remedy')return copy(d[stage]);
 const tags=wrongTags(w);return copy(d.remedy.filter(q=>q.tags.some(t=>tags.includes(t))));
}
function stageComplete(w,stage){const qs=chapterQuestions(w,stage);return qs.every(q=>w.chapter.answers[stage][q.id]?.correct===true);}
function chapterCommand(w,name,value={}){
 if(!w.chapter||w.status!=='playing')return false;const c=w.chapter;
 const stage={answerEvidence:'evidence',answerReflection:'reflection',answerRemedy:'remedy'}[name];
 if(stage){
  if(c.phase!==stage)return false;const q=chapterQuestions(w,stage).find(q=>q.id===value.questionId);
  if(!q||c.answers[stage][q.id]?.correct||!Number.isInteger(value.choice)||value.choice<0||value.choice>=q.choices.length||!q.evidence.some(e=>e.id===value.evidenceId)){w.notice='請選一項判斷，並選出支持它的原文證據。';return false;}
  if(c.history.length>=180){w.notice='本局答題次數已滿，請保存後重新開始。';return false;}
  const correct=value.choice===q.answer&&value.evidenceId===q.correctEvidence,attempts=(c.answers[stage][q.id]?.attempts||0)+1,a={choice:value.choice,evidenceId:value.evidenceId,correct,attempts};c.answers[stage][q.id]=a;c.history.push({stage,questionId:q.id,choice:value.choice,evidenceId:value.evidenceId,correct});w.notice=(correct?'判斷與證據相合。':'請回讀原文，再調整判斷與證據。')+q.explain;return correct;
 }
 if(name==='startMission'&&c.phase==='evidence'&&stageComplete(w,'evidence')){c.phase='mission';w.notice=pilot(w.id).rule;return true;}
 if(name==='finishReflection'&&c.phase==='reflection'&&stageComplete(w,'reflection')){if(chapterQuestions(w,'remedy').length){c.phase='remedy';w.notice='先前曾有誤解，請用另一道短題回到原文核對。';}else{c.phase='done';w.status='won';w.notice='章內閱讀、同行任務與反思均已完成。';}return true;}
 if(name==='finishRemedy'&&c.phase==='remedy'&&stageComplete(w,'remedy')){c.phase='done';w.status='won';w.notice='補救核對完成。首次判斷與訂正歷程都保留。';return true;}
 return false;
}
function chapterReport(w){
 if(!w.chapter)return null;const c=w.chapter,all=c.history.filter(a=>a.stage!=='remedy'),first=all.filter((a,i)=>all.findIndex(b=>b.stage===a.stage&&b.questionId===a.questionId)===i),total=CHAPTERS[w.id].evidence.length+CHAPTERS[w.id].reflection.length,correct=Object.values(c.answers.evidence).concat(Object.values(c.answers.reflection)).filter(a=>a.correct).length,remedies=chapterQuestions(w,'remedy'),operation=operationReport(w),objectives=chapterObjectives(w),optionalDone=objectives.filter(o=>o.done).length;
 const reading={title:'原文證據與閱讀判斷',firstCorrect:first.filter(a=>a.correct).length,total,answered:first.length,correct,wrongTags:wrongTags(w),remedyCorrect:Object.values(c.answers.remedy).filter(a=>a.correct).length,remedyTotal:remedies.length,items:[{label:'閱讀首次正確',value:first.filter(a=>a.correct).length+'/'+total},{label:'已訂正完成',value:correct+'/'+total}],suggestions:wrongTags(w).length?['回到以下概念的原文證據：'+wrongTags(w).join('、')+'。完成短題後仍保留首次判斷。']:['保持先找原文、再下判斷；操作熟練不會自動增加閱讀成績。']};
 const record={version:CHAPTER_VERSION,id:w.id,route:c.route,score:c.missionResult?.score||0,seconds:operation.seconds,quality:operation.quality,readingFirstCorrect:reading.firstCorrect,readingTotal:total,readingCorrect:correct,optionalDone,optionalTotal:objectives.length};
 return {phase:c.phase,title:CHAPTERS[w.id].title,completed:c.phase==='done',reading,operation,remedies,challenge:{title:routeFor(w).name,objectives,optionalDone,optionalTotal:objectives.length},record};
}
function mergeJournal(journal,w,at){
 const list=copy(Array.isArray(journal)?journal:[]);if(w.status!=='won'||w.chapter&&w.chapter.phase!=='done')return list;
 let j=list.find(x=>x.id===w.id);if(!j){j={id:w.id,score:score(w),seconds:Math.round(w.time),at};list.push(j);}else if(score(w)>j.score||score(w)===j.score&&Math.round(w.time)<j.seconds)Object.assign(j,{score:score(w),seconds:Math.round(w.time),at});
 if(w.chapter){const r={...chapterReport(w).record,at},best=j.chapterBest,fast=j.chapterFastest,quality=j.chapterQuality;if(!best||r.score>best.score||r.score===best.score&&r.seconds<best.seconds)j.chapterBest=copy(r);if(!fast||r.seconds<fast.seconds||r.seconds===fast.seconds&&r.quality>fast.quality)j.chapterFastest=copy(r);if(!quality||r.quality>quality.quality||r.quality===quality.quality&&r.seconds<quality.seconds)j.chapterQuality=copy(r);}
 return list;
}
function stable(x){return JSON.stringify(Array.isArray(x)?x.map(v=>JSON.parse(stable(v))):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,JSON.parse(stable(x[k]))])):x);}
function validateChapter(w){
 const c=w.chapter,fail=()=>{throw Error('章內閱讀與任務進度無法核對。');},keys=(x,ks)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===ks.slice().sort().join(',');
 if(!keys(c,['version','phase','route','answers','history','missionResult','metrics','optional'])||c.version!==CHAPTER_VERSION||!['evidence','mission','reflection','remedy','done'].includes(c.phase)||!chapterRoutes(w.id).some(r=>r.id===c.route)||!keys(c.answers,['evidence','reflection','remedy'])||!Array.isArray(c.history)||c.history.length>180)fail();
 const replay={evidence:{},reflection:{},remedy:{}},order={evidence:0,reflection:1,remedy:2};let previous=0;
 for(const a of c.history){
  if(!keys(a,['stage','questionId','choice','evidenceId','correct'])||!(a.stage in order)||order[a.stage]<previous)fail();previous=order[a.stage];
  const q=chapterQuestions(w,a.stage).find(q=>q.id===a.questionId),old=replay[a.stage][a.questionId];
  if(!q||old?.correct||!Number.isInteger(a.choice)||a.choice<0||a.choice>=q.choices.length||!q.evidence.some(e=>e.id===a.evidenceId)||a.correct!==(a.choice===q.answer&&a.evidenceId===q.correctEvidence))fail();
  if(a.stage!=='evidence'&&!CHAPTERS[w.id].evidence.every(q=>replay.evidence[q.id]?.correct))fail();
  if(a.stage==='remedy'&&!CHAPTERS[w.id].reflection.every(q=>replay.reflection[q.id]?.correct))fail();
  replay[a.stage][a.questionId]={choice:a.choice,evidenceId:a.evidenceId,correct:a.correct,attempts:(old?.attempts||0)+1};
 }
 if(stable(c.answers)!==stable(replay))fail();
 const evidenceDone=stageComplete(w,'evidence'),reflectionDone=stageComplete(w,'reflection'),remedyDone=stageComplete(w,'remedy');
 if(c.phase!=='evidence'&&!evidenceDone||['evidence','mission'].includes(c.phase)&&Object.keys(c.answers.reflection).length||!['remedy','done'].includes(c.phase)&&Object.keys(c.answers.remedy).length||['remedy','done'].includes(c.phase)&&!reflectionDone||c.phase==='remedy'&&!chapterQuestions(w,'remedy').length||c.phase==='done'&&!remedyDone)fail();
 const m=c.metrics,metricKeys=['peakExposure','minGrip','distance','transfers','redundantTransfers','patchErrors','argumentErrors','unreadPatchAttempts'];
 if(!keys(m,metricKeys)||metricKeys.some(k=>!Number.isFinite(m[k])||m[k]<0)||['transfers','redundantTransfers','patchErrors','argumentErrors','unreadPatchAttempts'].some(k=>!Number.isInteger(m[k])||m[k]>1000)||m.distance>30000||m.minGrip>100||m.peakExposure>120||!c.optional||typeof c.optional!=='object'||Array.isArray(c.optional)||Object.entries(c.optional).some(([k,v])=>w.kind!=='action'||k!=='seal'||v!==true))fail();
 if(w.kind==='action'&&(m.peakExposure<w.exposure||m.minGrip>w.grip||m.transfers||m.redundantTransfers||m.patchErrors||m.argumentErrors||m.unreadPatchAttempts))fail();
 if(w.kind==='strategy'&&(m.peakExposure||m.minGrip!==100||m.distance||m.patchErrors||m.argumentErrors||m.unreadPatchAttempts))fail();
 if(w.kind==='collation'&&(m.peakExposure||m.minGrip!==100||m.distance||m.transfers||m.redundantTransfers||m.patchErrors>w.errors||m.argumentErrors>w.errors))fail();
 if(c.phase==='evidence'&&(w.time!==0||w.status!=='playing'||Object.keys(w.uses).length||Object.keys(w.buffs).length||Object.keys(c.optional).length||metricKeys.some(k=>m[k]!== (k==='minGrip'?(w.grip??100):0))))fail();
 if(c.phase==='evidence'){
  const fresh=create(w.id,w.snapshot.config,w.snapshot.identity,w.seed),fields=w.kind==='chuhan'?['campaign']:w.kind==='action'?['x','y','target','grip','exposure','delivered','pins']:w.kind==='strategy'?['day','people','selected','orders','results','plannedDay']:['page','draft','seen','probe','selected','reason','finished'];
  if(w.errors!==0||w.trace!==null||fields.some(k=>stable(w[k])!==stable(fresh[k])))fail();
 }
 if(w.kind==='strategy'&&w.results.some((r,i)=>!r||r.day!==i||!Array.isArray(r.people)||r.people.length!==8||r.people.some(n=>!Number.isInteger(n)||n< -1||n>4)||stable(r.need)!==stable(needs(w,i))||stable(r.got)!==stable(counts(r))||r.ok!==needs(w,i).every((n,j)=>r.got[j]>=n)))fail();
 const after=['reflection','remedy','done'].includes(c.phase);
 if(after){if(!coreComplete(w)||!keys(c.missionResult,['time','score','quality'])||c.missionResult.time!==w.time||c.missionResult.score!==missionScore(w)||c.missionResult.quality!==operationReport(w).quality)fail();}
 else if(c.missionResult!==null||coreComplete(w))fail();
 if(c.phase==='done'?w.status!=='won':w.status==='won'||w.status==='lost'&&c.phase!=='mission')fail();
 return w;
}
function chapterProgress(before,next){
 if(!before.chapter&&!next.chapter)return true;if(!before.chapter||!next.chapter)throw Error('續玩不能改換章內模式。');
 validateChapter(before);validateChapter(next);if(before.kind==='chuhan')CH.progress(before,next);const a=before.chapter,b=next.chapter,order=['evidence','mission','reflection','remedy','done'];
 if(a.version!==b.version||a.route!==b.route||order.indexOf(b.phase)<order.indexOf(a.phase)||a.history.length>b.history.length||stable(a.history)!==stable(b.history.slice(0,a.history.length))||a.missionResult&&stable(a.missionResult)!==stable(b.missionResult)||Object.keys(a.optional).some(k=>!b.optional[k]))throw Error('續玩不能倒退或改寫已完成的章內紀錄。');
 if(a.missionResult){const core=w=>{const x=copy(w);delete x.chapter;delete x.status;delete x.notice;return x;};if(stable(core(before))!==stable(core(next))||stable(a.metrics)!==stable(b.metrics)||stable(a.optional)!==stable(b.optional))throw Error('完成任務後不能改寫操作紀錄。');}
 for(const k of ['peakExposure','distance','transfers','redundantTransfers','patchErrors','argumentErrors','unreadPatchAttempts'])if(b.metrics[k]<a.metrics[k])throw Error('操作診斷紀錄不能倒退。');
 if(b.metrics.minGrip>a.metrics.minGrip)throw Error('最低握力紀錄不能倒退。');return true;
}
function restore(raw){
 if(!raw||raw.schema!==VERSION)throw Error('角色冒險存檔格式不符。');const c=config(raw.snapshot?.config),p=pilot(raw.id);
 if(!compatible(c,p.id)||raw.kind!==p.kind||!['playing','won','lost'].includes(raw.status)||!Number.isFinite(raw.time)||raw.time<0||raw.time>1200||!Number.isFinite(raw.limit)||raw.limit<1||raw.limit>900)throw Error('角色冒險狀態無法核對。');
 const w=copy(raw);if(JSON.stringify(w).length>30000)throw Error('角色冒險存檔過大。');
 const allFinite=o=>{for(const v of Object.values(o||{})){if(typeof v==='number'&&!Number.isFinite(v))return false;if(v&&typeof v==='object'&&!allFinite(v))return false;}return true;};if(!allFinite(w))throw Error('角色冒險數值無法辨識。');
 const fresh=w.chapter?createChapter(p.id,c,w.snapshot.identity,w.seed,{route:w.chapter.route}):create(p.id,c,w.snapshot.identity,w.seed);
 if(w.limit!==fresh.limit||w.errors<0||w.errors>1000||!Number.isInteger(w.errors))throw Error('冒險條件與開局不同。');
 for(const [k,v]of Object.entries(w.cooldowns||{}))if(!c.skills.includes(k)||!Number.isFinite(v)||v<0||v>w.time+20)throw Error('能力冷卻不正確。');
 for(const [k,v]of Object.entries(w.buffs||{}))if(!['swift','steady','precise','foresight','listening'].includes(k)||!Number.isFinite(v)||v<0||v>w.time+20)throw Error('能力持續時間不正確。');
 for(const [id,n]of Object.entries(w.uses||{})){const s=SKILLS.find(s=>s.id===id);if(!s||!c.skills.includes(id)||!Number.isInteger(n)||n<0||n>s.uses)throw Error('能力次數不正確。');}
 if(p.kind==='chuhan')CH.validate(w);
 if(p.kind==='action'&&(!Array.isArray(w.delivered)||new Set(w.delivered).size!==w.delivered.length||w.delivered.some(n=>![0,1,2].includes(n))||!Number.isFinite(w.x)||!Number.isFinite(w.y)||!Number.isFinite(w.grip)||w.x<5||w.x>95||w.y<0||w.y>100||w.maxGrip!==fresh.maxGrip||w.grip<0||w.grip>w.maxGrip||w.maxExposure!==fresh.maxExposure||!Number.isFinite(w.exposure)||w.exposure<0||w.exposure>w.maxExposure))throw Error('夜縋存檔不正確。');
 if(p.kind==='strategy'&&(!Array.isArray(w.people)||w.people.length!==8||w.people.some(n=>!Number.isInteger(n)||n< -1||n>4)||!Number.isInteger(w.day)||w.day<0||w.day>4||!Number.isInteger(w.orders)||w.orders<0||w.orders>9||!Array.isArray(w.results)||![w.day,w.day+1].includes(w.results.length)))throw Error('調度存檔不正確。');
 if(p.kind==='collation'&&(!Number.isInteger(w.page)||w.page<0||w.page>2||!Array.isArray(w.draft)||w.draft.length!==Array.from(TEXTS[w.page].original).length||w.draft.some(x=>typeof x!=='string'||Array.from(x).length!==1)||Object.entries(w.seen||{}).some(([i,n])=>!/^\d+$/.test(i)||+i>=w.draft.length||typeof n!=='number'||n<0||n>1)))throw Error('對勘存檔不正確。');
 if(w.status==='won'){
  const valid=coreComplete(w);
  if(!valid)throw Error('任務條件尚未完成，不能記為通關。');
 }
 if(w.chapter)validateChapter(w);return w;
}
module.exports={CH,VERSION,BUDGET,STATS,SKILLS,PILOTS,JOBS,SPECIALTIES,NEEDS,EVENTS,TEXTS,CHAPTER_VERSION,CHAPTERS,copy,clamp,pilot,config,defaults,compatible,create,createChapter,chapterCreate:createChapter,chapterRoutes,chapterQuestions,chapterCommand,chapterReport,chapterObjectives,chapterProgress,mergeJournal,coverPoints,needs,event,skill,lit,cover,step,inspect,command,counts,score,restore};
