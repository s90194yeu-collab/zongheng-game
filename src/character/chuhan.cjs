'use strict';
// 楚漢同行推演：九種操作各自保存；原篇史實、錨點與首輪不在此修改。
const rows=[
 ['S_ch01_shaqiu','沙丘','合符驗詔','詔書核驗者','seal','n20','沙丘密議前',['precise','trace'],'旋轉四片符印，對齊拓本的接縫，再按核驗。核對印記不能證明詔書內容真實。'],
 ['S_ch02_dazexiang','大澤鄉','雨夜急遞','雨夜傳令者','jump','n_04','雨阻失期後',['swift','steady'],'看雨勢與斷木位置，選可落腳的路；游標進入金色區時按躍過。連過六處，把營地消息送到。'],
 ['S_ch03_julu','鉅鹿','限舟接應','渡口接應者','ferry','n_10','鉅鹿決戰前',['plan','foresight'],'勾選人員與物資，三航內送齊六項。首航須有先遣隊，傷者與藥箱須同船；不可超過載重。'],
 ['S_ch04_hongmen','鴻門宴','席外傳訊','席外接應者','relay','n_24','沛公離席後、張良留謝前',['listen','swift'],'點相鄰接點傳訊。等巡察燈轉暗再穿過通道，經廚下或廊道送到接應口。這是席外自編任務。'],
 ['S_ch05_sanqin','三秦','棧道雙線','糧道繪圖者','paths','n_10','漢中整備時',['plan','trace'],'沿相鄰格畫出示蹤線至右上角，再畫運糧線至右下角。兩線除起點外不得共用格；可退一格重畫。'],
 ['S_ch06_xingyang','滎陽','糧車護行','糧道護送者','convoy','n_10','滎陽相持的糧道任務',['plan','foresight'],'先點道路部署護衛，再選糧車要走的鄰道。四段敵襲會變化，護衛可擋同道襲擊，至少三箱糧抵營才完成。'],
 ['S_ch07_hanxin','韓信','拔旗換幟','趙營換旗者','flags','n_10','井陘部署時',['plan','trace'],'每點一旗，同時翻轉本格與上下左右的旗。用有限軍令把九旗轉成漢旗。陣列是自編連動解謎。'],
 ['S_ch08_gaixia','垓下','回聲尋伴','夜路照應者','maze','n_09','夜間突圍時',['listen','light'],'點相鄰路格移動，在霧中找回左下方同伴，再到右下角會合。障礙須繞行，巡察轉暗再過；可用聽息暫看全圖。'],
 ['S_ch09_dafeng','大風','歸鄉重建','鄉里營建者','city','n_20','還鄉守成時',['precise','plan'],'選民居、糧倉或道路，再點左上起格放置；道路可旋轉。填滿十二格，讓兩處建物都接到橫貫道路；點已選的建物可收回。']
];
const readings=[
 ['《史記・秦始皇本紀》《李斯列傳》','丞相斯為上崩在外，恐諸公子及天下有變，乃祕之，不發喪。','隱瞞死訊','李斯祕不發喪，從原文可判斷什麼？',['擔憂政治局勢生變','已正式公開繼承詔命','天下已完全沒有異議'],0,'於是斯乃聽高。','責任辨析','印記拼合完成，能否據此說李斯沒有責任？',['能，印記正確就免責','不能，原文明寫他聽從趙高','能，整件事只有扶蘇參與'],1],
 ['《史記・陳涉世家》','會天大雨，道不通，度已失期。失期，法皆斬。','處境因果','篇中失期的直接原因是？',['無人願意出發','大雨阻路，估計已不能如期到達','已經攻取咸陽'],1,'王侯將相寧有種乎！','反問語氣','這句反問意在挑戰什麼？',['下雨的成因','軍糧的保存方法','身分只能由血統決定的看法'],2],
 ['《史記・項羽本紀》','皆沈船，破釜甑，燒廬舍，持三日糧。','決戰部署','沉船破釜的部署顯示？',['表明決戰，不留退路','準備長期海運','取消作戰回家'],0,'楚戰士無不一以當十，楚兵呼聲動天。','敘事效果','一以當十的描寫著重什麼？',['逐字統計每人的擊殺數','突出楚軍決戰的勇猛氣勢','證明諸侯已在戰前統一聽命'],1],
 ['《史記・項羽本紀》','大行不顧細謹，大禮不辭小讓。','情勢取捨','樊噲此言用來勸什麼？',['留下補完所有禮節','大事當前，先脫離險境','立即攻擊所有賓客'],1,'沛公已去，間至軍中。張良入謝。','行動時序','原文的先後關係是？',['張良先謝，沛公才決定離開','角色傳訊決定項羽的結局','沛公先回軍中，張良再入謝'],2],
 ['《史記・蕭相國世家》','何獨先入收秦丞相御史律令圖書藏之。','文書價值','蕭何優先收藏的資料是？',['律令與圖書，能供治理參考','宮中珍寶與酒器','只收私人詩稿'],0,'漢王所以具知天下阸塞，戶口多少，彊弱之處，民所疾苦者，以何具得秦圖書也。','資料與治理','圖書使漢王得以掌握什麼？',['保證所有決策永不出錯','地勢、人口與民間疾苦等資訊','直接取代將領的臨場指揮'],1],
 ['《史記・陳丞相世家》','常出奇計，救紛糾之難，振國家之患。','謀略作用','此句把陳平的謀略與什麼相連？',['一定能免除一切風險','協助紓解危難、振救國家','廢除所有軍事部署'],1,'事已急矣，請為王誑楚為王，王可以間出。','脫困分工','紀信此言提出什麼安排？',['請劉邦先在東門公開露面','取消脫困計畫','由紀信假扮漢王，讓漢王從間道離去'],2],
 ['《史記・淮陰侯列傳》','選輕騎二千人，人持一赤幟，從間道萆山而望趙軍。','部署條件','換旗前先安排輕騎做什麼？',['持赤幟走間道，隱蔽觀察趙軍','公開站在趙營中央宣告','先回漢中休息'],0,'趙軍已不勝，不能得信等，欲還歸壁，壁皆漢赤幟，而大驚。','前後接應','趙軍回營時大驚，與什麼部署相連？',['所有敵軍已先投降','趙軍追逐而營壁空虛時，迅速入營換旗','只要旗色變了就必然取勝'],1],
 ['《史記・項羽本紀》','夜聞漢軍四面皆楚歌，項王乃大驚。','見聞與推論','原文確實交代的是？',['楚地已全部被漢軍取得','項羽聽到楚歌而驚訝','項羽已成功渡江'],1,'此天之亡我，非戰之罪也。','人物觀點','這句話應如何判讀？',['史家已證明項羽沒有任何責任','遊戲角色可以據此改寫史實','這是項羽的自我解釋，仍可用其他事件檢視'],2],
 ['《史記・高祖本紀》','此三者，皆人傑也，吾能用之，此吾所以取天下也。','用人觀點','劉邦在這句強調什麼？',['自己能任用不同專長的人才','自己每項能力都勝過三傑','天下只靠一個人取得'],0,'安得猛士兮守四方！','守成憂思','末句表達哪種憂思？',['要再把故鄉拆毀','希望得到能守衛四方的人才','天下已定，所以人才不再需要'],1]
];
const REFLECTIONS=[[["驗詔與判斷","符印接縫已對齊，還須查什麼？",["只看印記就相信任何命令","傳命來源與是否受命，印記不能單獨證真","同行者的造型"],1],["聽從與責任","於是二字把這句放在趙高勸說之後，應讀作？",["李斯完全未受影響","作者讚美詔書排版","李斯在此前壓力下聽從，須連讀其選擇"],2]],[["模擬與史文","你在遊戲中送到消息，能否說史文的失期被消除了？",["不能，急遞是自編推演，原文仍記雨阻失期","能，一次跳躍就能改變秦法","能，陳勝從未遇雨"],0],["反問與主張","把寧有種乎改成一定有種，語意有何變化？",["完全不變","變成支持血統決定身分，失去原來的挑戰","只改變下雨的時間"],1]],[["渡運與決心","同行渡運成功後，原作的沉船破釜應如何接讀？",["渡運配置證明楚軍有永久船隊","數字全是史書實錄","準備渡河與渡後決戰有時序差別，不能混作長期退路"],2],["誇飾效果","若把一以當十只當逐人統計，會忽略什麼？",["文字渲染決戰聲勢的效果","糧袋的重量","渡河船的顏色"],0]],[["細謹與大事","若只用未告辭判斷沛公失禮，忽略了哪個條件？",["宴席完全安全","當時人為刀俎、我為魚肉的危局","宴席根本不存在"],1],["任務與人物","席外傳訊完成後，張良的哪項任務仍須自己完成？",["代項羽統一天下","代樊噲起兵","等沛公至軍中後入帳留謝"],2]],[["資料的用途","繪出兩條遊戲路線，是否足以代表蕭何圖書的全部價值？",["不能，圖書還含治理、人口與疾苦等資料","能，圖書只有棧道圖","能，遊戲棋盤就是秦代原圖"],0],["據料推論","以何具得秦圖書也在句中起什麼作用？",["否定漢王掌握資訊","解釋漢王何以能掌握前列資訊","指出資料毫無用途"],1]],[["謀略與風險","運糧挑戰成功，能否推成陳平每一計都沒有代價？",["能，遊戲通過即為史實","不能，須回到具體危局與後果判斷","能，奇計等於不必取捨"],1],["脫困與分工","若把紀信假王與劉邦間出都寫成同一人公開逃走，問題在？",["把不同人的分工與虛實配置混為一談","只是更換字體","可證楚軍早已投降"],0]],[["隱蔽與觀察","只把換旗看作變顏色，會漏掉哪個前提？",["必須人人站在水裡換旗","史書說旗色能自動控制所有人","先藏輕騎觀察趙軍，再配合營壁空虛的時機"],2],["次序與效果","趙軍回營才見漢赤幟而大驚，應避免哪種倒置？",["把回營後的驚亂寫成趙軍出營前已看穿全部部署","保留驚亂描寫","把壁理解為營壘"],0]],[["見聞的限度","只聽楚歌便斷言楚地全失，增加了哪個未必成立的步驟？",["把聲音直接當作領土全失的充分證明","聽見歌聲","知道時在夜間"],0],["人物與史家","閱讀非戰之罪時，接著用戰略與用人事件檢查，意義是？",["不准理解人物的心情","區分人物自辯與可檢視的責任","讓原創角色替項羽獲勝"],1]],[["用人與專長","城市拼放完成，能否推成劉邦自稱每項專業都最強？",["能，所有職務都由劉邦一人完成","不能，吾能用之強調任用不同人才","能，三傑沒有各自職掌"],1],["疑問與憂思","安得猛士用疑問語氣收束，與威加海內合讀顯示？",["完全沒有守成問題","勝利後不必人才","勝利與還鄉之中仍有守四方的憂思"],2]]];
const copy=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const PILOTS=rows.map((r,i)=>({id:r[0],name:r[1],title:r[2],role:r[3],mechanic:r[4],node:r[5],point:r[6],recommended:r[7],rule:r[8],kind:'chuhan',scene:'scene:ch'+String(i+1).padStart(2,'0')+'_world',source:readings[i][0],quote:readings[i][1],brief:'以自己的造型完成「'+r[2]+'」，操作方式與本篇情境相連；原有必做體驗仍完整保留。',after:'同行任務完成。這是自編情境推演，接著回原篇人物與事件；任務成功不改變史實結局。'}));
const CHAPTERS=Object.fromEntries(PILOTS.map((p,i)=>{const d=readings[i],q=(id,tag,prompt,choices,answer,text)=>({id,tag,prompt,choices,answer,evidence:[{id:'text',text},{id:'other',text:text===d[1]?d[6]:d[1]}],correctEvidence:'text',explain:'請把判斷放回這句原文及前後情境；操作結果不能代替文本證據。'}),a=q('ch-e1',d[2],d[3],d[4],d[5],d[1]),b=q('ch-f1',d[7],d[8],d[9],d[10],d[6]);return[p.id,{title:p.title,intro:p.brief,evidence:[a,{...b,id:'ch-e2',prompt:'出發前核對：'+b.prompt}],reflection:REFLECTIONS[i].map((r,n)=>q('ch-f'+(n+1),n?b.tag:a.tag,r[1],r[2],r[3],n?d[6]:d[1])),remedy:[{...a,id:'ch-r1',tags:[a.tag],prompt:REFLECTIONS[i][0][1],choices:REFLECTIONS[i][0][2],answer:REFLECTIONS[i][0][3]},{...b,id:'ch-r2',tags:[b.tag],prompt:REFLECTIONS[i][1][1],choices:REFLECTIONS[i][1][2],answer:REFLECTIONS[i][1][3]}]}];}));
function pilot(w){return PILOTS.find(p=>p.id===(typeof w==='string'?w:w.id));}
function compatible(c,id){return c.skills.every(k=>({seal:['precise','foresight','trace'],jump:['swift','steady','foresight','listen','light','trace'],ferry:['plan','foresight','trace'],relay:['listen','swift','steady','foresight','trace','light'],paths:['plan','trace','foresight'],convoy:['plan','foresight','trace'],flags:['plan','trace','foresight'],maze:['listen','light','swift','foresight','trace','steady'],city:['precise','plan','trace','foresight']})[pilot(id).mechanic].includes(k));}
function routes(id){const p=pilot(id);return[{id:'companion',name:p.title,brief:p.rule,build:'本篇配點：'+({seal:'巧手擴大拼符時間，察勢延長觀察。',jump:'身法與定力擴大落腳窗口。',ferry:'臂力增加載重，籌算保留航次。',relay:'身法縮短傳遞等待，察勢延長預看。',paths:'籌算增加重畫餘裕。',convoy:'臂力增加攜糧，籌算增加護衛調度。',flags:'籌算增加換旗軍令。',maze:'身法縮短行路間隔，察勢延長聽察。',city:'巧手與籌算增加試放餘裕。'})[p.mechanic],tradeoff:'能力只協助觀察、時間或資源，不替你解題。'}];}
function adjacent(a,b,cols=4){return Number.isInteger(b)&&b>=0&&b<cols*(cols===3?3:4)&&Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols))===1;}
const cargo=[['先遣隊',2],['接應繩',1],['糧袋',2],['工具',1],['傷者',2],['藥箱',1]],edges=[[1,2],[0,3],[0,3,4],[1,2,5],[2,5],[3,4]],places=['帳後','廚下','廊道','側門','後廊','接應口'];
function flip(flags,i){for(let j=0;j<9;j++)if(i===j||adjacent(i,j,3))flags[j]=1-flags[j];}
function initial(w){const s=w.snapshot.config.stats,k=pilot(w).mechanic;let g={version:1,mechanic:k,log:[],errors:0,spent:0,done:false};
 if(k==='seal')Object.assign(g,{tiles:[0,1,2,3].map(i=>(w.seed+i*3)%4),target:[0,1,2,3].map(i=>(w.seed*3+i)%4)});
 if(k==='jump')Object.assign(g,{stage:0});
 if(k==='ferry')Object.assign(g,{aboard:[],landed:[],trips:[],capacity:3+Math.floor(s.strength/3),maxTrips:3});
 if(k==='relay')Object.assign(g,{at:0,visited:[0],lastMove:-10});
 if(k==='paths')Object.assign(g,{phase:0,path:[0],decoy:[],undos:0,budget:6+s.planning});
 if(k==='convoy')Object.assign(g,{wave:0,lane:1,guards:[],grain:5+Math.floor(s.strength/2),orders:3+s.planning,arrivals:[]});
 if(k==='flags'){const flags=Array(9).fill(1);for(let i of [0,2,4,7].map(x=>(x+w.seed)%9))flip(flags,i);Object.assign(g,{flags,moves:0,budget:7+Math.floor(s.planning/2)});}
 if(k==='maze')Object.assign(g,{at:0,visited:[0],rescued:false,lastMove:-10,steps:0});
 if(k==='city')Object.assign(g,{pieces:[null,null,null],selected:0,rotation:0,budget:8+s.planning+Math.floor(s.dexterity/2)});
 return g;
}
function active(w,key){return(w.buffs[key]||0)>w.time;}
function gate(w,n=0){const s=w.snapshot.config.stats,cycle=(w.time+n*.71+(w.seed%7)*.1)%3,margin=.12*s.agility+.06*s.focus+(active(w,'steady')?.35:0)+(active(w,'swift')?.3:0)+(w.snapshot.config.skills.includes('light')?.15:0);return{cycle,open:cycle>1-margin&&cycle<2+margin,start:clamp(1-margin,0,3),end:clamp(2+margin,0,3)};}
function jumpBlocked(w){return(w.seed+w.campaign.stage*2)%3;}
function threats(w){return[(w.seed+w.campaign.wave)%3,(w.seed+w.campaign.wave+1)%3];}
function walls(w){return w.seed%2?[5,7,9]:[5,6,9];}
function tilesFor(piece,at,rotation=0){const x=at%4,y=Math.floor(at/4),shape=piece===2?(rotation%2?[[0,0],[0,1],[0,2],[0,3]]:[[0,0],[1,0],[2,0],[3,0]]):[[0,0],[1,0],[0,1],[1,1]];if(shape.some(([dx,dy])=>x+dx>=4||y+dy>=3))return null;return shape.map(([dx,dy])=>(y+dy)*4+x+dx);}
function cityComplete(g){if(g.pieces.some(x=>!x))return false;const cells=g.pieces.flatMap(p=>p.cells);return new Set(cells).size===12&&g.pieces.slice(0,2).every(p=>p.cells.some(a=>g.pieces[2].cells.some(b=>adjacent(a,b))));}
function skill(w,id){const g=w.campaign,uses=w.uses[id]||0;if(!w.snapshot.config.skills.includes(id)||id==='light'||uses>=2||w.time<(w.cooldowns[id]||0))return false;
 w.uses[id]=uses+1;w.cooldowns[id]=w.time+10;const insight=w.snapshot.config.stats.insight;
 if(id==='trace')w.trace={mechanic:g.mechanic,at:w.time,summary:summary(w)};
 else if(id==='plan'){if(g.mechanic==='ferry')g.maxTrips++;else if(g.mechanic==='convoy')g.orders+=2;else if(['paths','flags','city'].includes(g.mechanic))g.budget+=2;else w.buffs.steady=w.time+8;}
 else if(id==='listen'){w.buffs.listening=w.time+2;w.buffs.foresight=w.time+8+insight;}
 else w.buffs[id]=w.time+(id==='swift'?3:id==='foresight'?6+insight:8);
 w.notice='已使用'+({swift:'迅影',steady:'握定',precise:'巧勁',foresight:'望勢',listen:'聽息',plan:'運籌',trace:'留痕'})[id]+'；仍須親自完成本篇操作。';return true;
}
function reduce(w,name,v){const g=w.campaign,s=w.snapshot.config.stats,k=g.mechanic,fail=text=>{g.errors++;w.errors=g.errors;w.notice=text;return true;};
 if(name==='skill')return skill(w,v);
 if(k==='seal'&&name==='rotate'&&Number.isInteger(v)&&v>=0&&v<4){g.tiles[v]=(g.tiles[v]+1)%4;g.spent++;}
 else if(k==='seal'&&name==='verify'){if(!same(g.tiles,g.target))return fail('接縫尚未吻合，逐片比較方向再核驗。');g.done=true;}
 else if(k==='jump'&&name==='jump'&&Number.isInteger(v)&&v>=0&&v<3){if(v===jumpBlocked(w)||!gate(w,g.stage).open)return fail('落點是斷木，或起跳尚未對準窗口。先看游標與道路再試。');g.stage++;g.spent++;g.done=g.stage===6;}
 else if(k==='ferry'&&name==='load'&&Number.isInteger(v)&&v>=0&&v<6&&!g.landed.includes(v)){g.aboard=g.aboard.includes(v)?g.aboard.filter(x=>x!==v):g.aboard.concat(v);}
 else if(k==='ferry'&&name==='sail'){const weight=g.aboard.reduce((n,i)=>n+cargo[i][1],0);if(!g.aboard.length||weight>g.capacity||(!g.trips.length&&!g.aboard.includes(0))||g.aboard.includes(4)!==g.aboard.includes(5))return fail('核對載重、首航先遣，以及傷者與藥箱同船的條件。');if(g.trips.length>=g.maxTrips)return fail('航次用盡，可用運籌增加一次，或重新挑戰。');g.trips.push(g.aboard.slice());g.landed.push(...g.aboard);g.aboard=[];g.spent++;g.done=g.landed.length===6;}
 else if(k==='relay'&&name==='relay'&&edges[g.at].includes(v)){if(w.time-g.lastMove<Math.max(.2,1-s.agility*.1-(active(w,'swift')?.4:0)))return false;if(!gate(w,v).open)return fail('巡察尚亮，等暗窗再傳過通道。');g.at=v;g.visited.push(v);g.lastMove=w.time;g.spent++;g.done=v===5;}
 else if(k==='paths'&&name==='path'&&adjacent(g.path.at(-1),v)&&![5,10].includes(v)&&!g.path.includes(v)&&!g.decoy.includes(v)){g.path.push(v);g.spent++;}
 else if(k==='paths'&&name==='undo'&&g.path.length>1){if(g.undos>=g.budget)return fail('本局重畫餘裕用盡。');g.path.pop();g.undos++;}
 else if(k==='paths'&&name==='commitPath'){if(g.path.at(-1)!==(g.phase===0?3:15))return fail('路線尚未到指定出口。');if(g.phase===0){g.decoy=g.path.slice(1);g.path=[0];g.phase=1;}else g.done=true;}
 else if(k==='convoy'&&name==='guard'&&Number.isInteger(v)&&v>=0&&v<3){if(g.guards.includes(v))return false;if(g.orders<=0)return fail('護衛調度令已用完。');g.guards.push(v);g.orders--;g.spent++;}
 else if(k==='convoy'&&name==='drive'&&Number.isInteger(v)&&v>=0&&v<3&&Math.abs(g.lane-v)<=1){const hit=threats(w).includes(v)&&!g.guards.includes(v);if(hit){g.grain--;g.errors++;w.errors=g.errors;}g.arrivals.push({lane:v,hit});g.lane=v;g.guards=[];g.wave++;g.spent++;if(g.wave===4){g.done=g.grain>=3;if(!g.done)w.status='lost';}}
 else if(k==='flags'&&name==='flag'&&Number.isInteger(v)&&v>=0&&v<9){if(g.moves>=g.budget)return fail('軍令用盡，可用運籌補兩令，或重新挑戰。');flip(g.flags,v);g.moves++;g.spent++;g.done=g.flags.every(x=>x===1);}
 else if(k==='maze'&&name==='walk'&&adjacent(g.at,v)){if(w.time-g.lastMove<Math.max(.15,(.6-s.agility*.08-(active(w,'swift')?.15:0))*(w.snapshot.config.skills.includes('light')?.85:1)))return false;if(walls(w).includes(v))return fail('此處不通，回看附近的路。');if([6,11].includes(v)&&!gate(w,v).open)return fail('巡察未過，先停在原地。');g.at=v;if(!g.visited.includes(v))g.visited.push(v);g.lastMove=w.time;g.steps++;g.spent++;if(v===12)g.rescued=true;g.done=v===15&&g.rescued;}
 else if(k==='city'&&name==='selectPiece'&&Number.isInteger(v)&&v>=0&&v<3){g.selected=v;}
 else if(k==='city'&&name==='rotatePiece'){g.rotation=1-g.rotation;}
 else if(k==='city'&&name==='removePiece'){if(!g.pieces[g.selected])return false;g.pieces[g.selected]=null;}
 else if(k==='city'&&name==='place'&&Number.isInteger(v)&&v>=0&&v<12){if(g.spent>=g.budget)return fail('試放餘裕用盡，可使用運籌再安排。');const cells=tilesFor(g.selected,v,g.rotation),taken=g.pieces.flatMap((p,i)=>i!==g.selected&&p?p.cells:[]);if(!cells||cells.some(x=>taken.includes(x)))return fail('此處會超界或重疊，先換起格或旋轉道路。');g.pieces[g.selected]={at:v,rotation:g.rotation,cells};g.spent++;g.done=cityComplete(g);}
 else return false;
 w.notice=g.done?'本篇操作完成，接著回原文。':'操作已記下，請觀察下一步。';return true;
}
function command(w,name,v){if(['jump','relay','walk'].includes(name)&&active(w,'listening'))return false;if(w.campaign.log.length>=240){w.notice='本局操作已達上限，請保存或重新挑戰。';return false;}const ok=reduce(w,name,v);if(ok){w.campaign.log.push({t:w.time,name,value:v===undefined?null:copy(v)});if(w.campaign.done)w.status='won';}return ok;}
function complete(w){return w.campaign.done===true;}
function validate(w){const g=w.campaign;if(!g||g.version!==1||g.mechanic!==pilot(w).mechanic||!Array.isArray(g.log)||g.log.length>240)throw Error('楚漢同行存檔格式不符。');
 const fresh={id:w.id,seed:w.seed,snapshot:copy(w.snapshot),time:0,uses:{},cooldowns:{},buffs:{},trace:null,errors:0,status:'playing',notice:''};fresh.campaign=initial(fresh);let time=0;
 for(const a of g.log){if(!a||Object.keys(a).sort().join(',')!=='name,t,value'||!Number.isFinite(a.t)||a.t<time||a.t>w.time||fresh.campaign.done||fresh.status==='lost')throw Error('楚漢操作歷程無法核對。');time=a.t;fresh.time=a.t;if(!reduce(fresh,a.name,a.value))throw Error('楚漢操作條件無法核對。');fresh.campaign.log.push(copy(a));}
 const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 for(const key of ['campaign','uses','cooldowns','buffs','trace','errors'])if(canonical(w[key])!==canonical(fresh[key]))throw Error('楚漢操作結果與歷程不符。');
 if(w.status==='lost'&&w.time<w.limit&&fresh.status!=='lost')throw Error('楚漢任務尚未達失敗條件。');return true;
}
function canonical(value){return JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);}
function progress(a,b){const x=a.campaign.log,y=b.campaign.log;if(x.length>y.length||canonical(x)!==canonical(y.slice(0,x.length)))throw Error('楚漢操作歷程不能倒退或改寫。');}
function summary(w){const g=w.campaign;return({seal:()=>g.tiles.map(x=>'↑→↓←'[x]).join(' '),jump:()=>g.stage+'/6處',ferry:()=>g.landed.length+'/6項 · '+g.trips.length+'航',relay:()=>places[g.at],paths:()=>g.phase===0?'示蹤線 '+g.path.length+'格':'運糧線 '+g.path.length+'格',convoy:()=>g.wave+'/4段 · '+g.grain+'箱糧',flags:()=>g.flags.filter(x=>x===1).length+'/9漢旗 · '+g.moves+'令',maze:()=>g.rescued?'已找到同伴':'尋找同伴中',city:()=>g.pieces.filter(Boolean).length+'/3建物'})[g.mechanic]();}
function objectives(w){return[{id:'accurate',label:'操作無誤判',done:w.campaign.errors===0},{id:'efficient',label:'限時內完成並保留半數時間',done:w.campaign.done&&w.time<=w.limit/2}];}
function report(w){return{title:pilot(w).title,completed:w.campaign.done,seconds:Math.round(w.time*10)/10,quality:clamp(100-w.campaign.errors*8,0,100),items:[{label:'任務進度',value:summary(w)},{label:'誤判次數',value:w.campaign.errors},{label:'有效操作',value:w.campaign.spent}],suggestions:[w.campaign.errors?'先觀察規則與目前狀態，再安排下一步；角色能力提供餘裕，操作仍由你完成。':'可改配點或減少能力使用，挑戰更短時間與零誤判。']};}
module.exports={compatible,PILOTS,CHAPTERS,pilot,routes,initial,command,complete,validate,progress,summary,objectives,report,gate,jumpBlocked,threats,walls,adjacent,cargo,edges,places,tilesFor};
