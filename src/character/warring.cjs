'use strict';
// 戰國同行：操作歷程可重放核驗，角色推演不改原篇人物、結局或首答。
const copy=x=>JSON.parse(JSON.stringify(x));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const same=(a,b)=>canonical(a)===canonical(b);
const rows=[
 ['S_zg01_sanjia','三家分晉','晉陽分洪','堤上調度者','flood','n_08','風雨圍城、調度守城前',['plan','foresight'],'調整三座分洪閘，再放水驗流。五輪來水不同；分流總量須等於來水，各閘也不可超載。至少守住四輪。'],
 ['S_zg02_weiwen','魏文霸業','鄴渠分流','渠床測繪者','canal','n_23','西門豹治渠前',['precise','plan'],'點渠格挖低一級。水從左中源頭沿相鄰且更低的渠床流動，把水引到右側三田，再驗水。挖得太低會斷掉後續坡降，先規劃再動工。'],
 ['S_zg03_shangyang','商鞅變法','徙木守衡','搬木同行者','balance','n_08','南門徙木前',['steady','swift'],'看側風，左右移重心，再抬木走一段。六段風向不同；重心加側風須落在安全區。此操作不代替徙木後如約給賞。'],
 ['S_zg04_jixia','稷下百家','開言接力','進言疏流者','forum','n_19','學宮論辯前',['plan','listen'],'三條進言通道每輪都會有人加入。點通道接引一人，用完四次調度或全員接引後再開下一輪；四輪至少接引十二人，不能讓通道積壓。通道不是意見正誤分級。'],
 ['S_zg05_maling','桂陵馬陵','灶影伏節','伏陣傳令者','ambush','n_16','減灶傳令時',['foresight','steady'],'按各組行程設定出發延遲，再發合令。三組須在相近時刻抵達；三輪地形與行程不同。這是自編協同操演，不把遊戲秒數當作史書實測。'],
 ['S_zg06_hezong','合縱連橫','六國盟約盤','盟約協調者','treaty','n_10','六國遊說時',['plan','trace'],'每輪替六國組成三組互惠約定；每國只能加入一組，兩方物資須不同，且不能碰當輪禁配。三輪都要重新議約。物資與禁配為自編模型。'],
 ['S_zg07_quyuan','屈原與楚','江流護簡','江畔護簡者','drift','n_17','江畔行吟時',['swift','light'],'每段先划一次左、停槳或右，再順流前進。水流會再推一格；接取竹簡、避開浮木，八段至少護回四束。護簡是自編照應情境，不改寫屈原結局。'],
 ['S_zg08_hufu','胡服與火牛','騎射校場','騎射操練者','archery','n_04','趙國騎射教練時',['precise','steady'],'移動準星，補償風偏與馬步晃動後放箭。命中八靶；五次落空即須重試。可點靶盤或調整瞄準座標，不必使用鍵盤移動。'],
 ['S_zg09_mengchang','孟嘗君','三窟機關','避難處整備者','locks','n_17','三窟規劃後、薛地宗廟整備時',['precise','trace'],'把九枚三色鑰牌放進三道門。每門三色俱全，同一高度跨三門不得同色，各門第一格還須合門冠色；核對後逐門開啟。機關是自編，不代表史書實有彩鎖。'],
 ['S_zg10_changping','將相長平','護璧移位','歸璧接應者','jade','n_07','秦廷齋戒後、從者懷璧走小路時',['plan','trace'],'點空格旁的木牌推移，把九宮重排為一到八、空格在右下；一號牌代表玉璧。不能跳格或直接搬玉，須在步數內開出歸璧通道。'],
 ['S_zg12_handan','邯鄲之圍','雙使接應','救趙接應者','twin','n_21','合符後、魏軍在鄴地整軍接應時',['light','plan'],'切換兩位使者、點相鄰格移動。一人守二號壓板，另一人通過六號門；再一人守七號壓板，另一人通過十號門，門開後保持開啟。兩人各訪三號與十一號接應點，再到各自終點。'],
 ['S_zg13_tongyi','天下一統','度量衡工坊','衡器校準者','measures','n_28','六國年表完成後、秦廷議帝號時',['precise','plan'],'調配一、三、五單位砝碼，在指定枚數內稱準目標，完成三輪校準。這是統一後治理的自編延伸，砝碼數值不宣稱是秦代實物規格。']
];
const reading=[
 {quotes:[['《資治通鑑・周紀一》','城不浸者三版。沈竈產鼃，民無叛意。'],['《資治通鑑・周紀一》','臣聞脣亡則齒寒。今智伯帥韓、魏而攻趙，趙亡則韓、魏為之次矣。']],qs:[
  ['民心與守城','爐竈中有蛙而民無叛意，突出了哪個對照？',['水困嚴重，人民仍願共同堅守','城中完全沒有進水','守城只靠城牆厚度'],0,0],['共同利害','張孟談以脣亡齒寒說明什麼？',['三家彼此毫無關係','趙亡後，韓魏也可能受威脅','韓魏已被趙氏滅亡'],1,1],
  ['民心與守城','五輪分洪達標，是否足以說明史文的民無叛意？',['足夠，遊戲水位就是人民想法','足夠，原文只記三座閘','不足，還須連讀人民與統治者的關係'],2,0],['共同利害','遊戲分流須互相配合，與說辭可相通的是？',['只要一方得利就永不生變','看見各方安危互相牽連，才能談合作','韓魏應無條件接受智伯所有要求'],1,1],
  ['民心與守城','若改寫為城已乾燥所以民心不變，哪裡不合原句？',['忽略沈竈產鼃所寫的水困','把蛙解成動物','保留人民的反應'],0,0],['共同利害','下列哪項推論有原文支持？',['智伯永不再索地','韓魏已完全安全','韓魏不能把趙亡視為與己無關'],2,1]]},
 {quotes:[['《史記・滑稽列傳》','西門豹即發民鑿十二渠，引河水灌民田，田皆溉。'],['《史記・滑稽列傳》','當其時，民治渠少煩苦，不欲也。']],qs:[
  ['工程目的','鑿十二渠的直接用途是？',['築祭壇續收娶婦錢','引河水灌溉民田','只為顯示官員威嚴'],1,0],['民力負擔','民治渠少煩苦，不欲也寫出什麼？',['工程開始時百姓覺得辛苦、不願做','百姓從未參與工程','渠已完全失去灌溉功能'],0,1],
  ['工程目的','三塊田通水後，能否說遊戲還原了鄴城全部渠網？',['可以，三田就是原文十二渠','可以，畫面等同考古圖','不能，縮小模型只呈現引水與坡降的關係'],2,0],['民力負擔','若只追求驗水成功而不計挖渠成本，會漏讀什麼？',['官員的衣服顏色','當時百姓承受的工程負擔','河伯娶婦已被恢復'],1,1],
  ['工程目的','田皆溉中的溉應解為？',['得到灌溉','全被淹沒而棄耕','每田都建祭壇'],0,0],['民力負擔','哪種說法能同時保留工程成果與民眾處境？',['既有成果就不必再談成本','百姓不欲，證明水渠永久無用','水利可有成效，初期辛苦仍須被看見'],2,1]]},
 {quotes:[['《史記・商君列傳》','民怪之，莫敢徙。復曰「能徙者予五十金」。有一人徙之，輒予五十金，以明不欺。'],['《史記・商君列傳》','衛鞅曰：「法之不行，自上犯之。」將法太子。']],qs:[
  ['徙木立信','徙木後輒予五十金，重點在？',['立即依約給賞，以示不欺','搬木者成為秦王','所有人已先相信新令'],0,0],['法與責任','自上犯之把法不行的問題指向哪裡？',['人民天生不懂法律','木頭的重量','上位者違犯規範的影響'],2,1],
  ['徙木立信','守衡搬木完成後，立信還需要哪個行動？',['再把賞金取消','如約履行承諾','只稱讚遊戲速度'],1,0],['法與責任','若把操作成功當作任何執法都正當，問題是？',['忽略法律實施仍須檢視上位者與具體責任','對法之不行作了字面翻譯','保留上犯的主語'],0,1],
  ['徙木立信','莫敢徙與有人徙之形成哪種變化？',['從人人搬運到無人搬運','從不敢行動到有人實行並獲兌賞','從五十金變成沒有獎賞'],1,0],['法與責任','法之不行的行，在此最接近？',['道路','隊伍排列','施行、實行'],2,1]]},
 {quotes:[['《戰國策・齊策一》','吾妻之美我者，私我也；妾之美我者，畏我也；客之美我者，欲有求於我也。'],['《戰國策・齊策一》','群臣吏民，能面刺寡人之過者，受上賞；上書諫寡人者，受中賞；能謗議於市朝，聞寡人之耳者，受下賞。']],qs:[
  ['說話者關係','妻、妾、客都稱美，鄒忌反省的重點是？',['三人必然共同策畫欺騙','說話者與自己的關係可能影響評價','所有讚美一律無價值'],1,0],['進諫管道','齊王的命令列出哪些方式？',['只有私下稱讚','只許軍人書信','當面、上書及市朝議論等進言管道'],2,1],
  ['說話者關係','疏通進言人流，能否直接判定每個人的話都真實？',['不能，仍須查核內容與關係','能，排到隊就一定正確','能，三條通道等於三種固定真理'],0,0],['進諫管道','為何不應把隊列長短當成意見好壞？',['原文禁止所有人說話','管道與內容品質是不同問題，須讓意見可被聽見再判斷','通道越窄內容必越真'],1,1],
  ['說話者關係','私我在這句指什麼？',['偏愛我','私藏我的畫像','獨自在家'],0,0],['進諫管道','面刺寡人之過的刺最接近？',['真正用兵器傷人','只在背後讚美','當面指出過失'],2,1]]},
 {quotes:[['《史記・孫子吳起列傳》','使齊軍入魏地為十萬灶，明日為五萬灶，又明日為三萬灶。'],['《史記・孫子吳起列傳》','彼三晉之兵素悍勇而輕齊，齊號為怯，善戰者因其勢而利導之。']],qs:[
  ['減灶次序','灶數的先後變化是？',['三萬、五萬、十萬','十萬、五萬、三萬','每天保持十萬'],1,0],['因勢利導','輕齊在此是什麼意思？',['使齊軍裝備變輕','齊國地形較低','輕視齊軍'],2,1],
  ['減灶次序','三輪伏節的倒數能否直接證明史書灶數？',['不能，須用原文明載的三日灶數核對','能，倒數設定就是古代帳簿','能，三輪表示三灶'],0,0],['因勢利導','若只背減灶數字，不讀敵軍輕齊，會忽略？',['三晉兵素來悍勇的字義','計策借用對方既有判斷傾向的條件','龐涓從未參戰'],1,1],
  ['減灶次序','第二天五萬灶，相對第一天表示什麼？',['火灶增加一倍','齊軍被證明真的只剩五萬人','所見灶數減半，不能直接當實際逃亡統計'],2,0],['因勢利導','哪個解讀最合因其勢而利導之？',['利用當前情勢與對方傾向加以引導','任何戰場都照同一數字即可必勝','完全不用觀察敵情'],0,1]]},
 {quotes:[['《戰國策・秦策一》〈蘇秦以連橫說秦〉','說秦王書十上而說不行。黑貂之裘弊，黃金百斤盡，資用乏絕，去秦而歸。'],['《史記・蘇秦列傳》','蘇秦為從約長，並相六國。']],qs:[
  ['遊說處境','說不行與資用乏絕連讀，寫出？',['遊說成功後富貴歸鄉','秦王不能行走','主張未被採納且資財用盡的失意'],2,0],['合縱身分','從約長與並相六國突出蘇秦的何種身分？',['聯盟約定的領導者、兼任六國相職','六國都已由秦王統治','已永久消除所有國際衝突'],0,1],
  ['遊說處境','三輪互惠配對有何閱讀界線？',['配對分數等於蘇秦的黃金百斤','遊戲只示範協調取捨，不能抹去蘇秦曾失意的敘事','所有遊說第一次必成功'],1,0],['合縱身分','完成三組配對後，還應避免哪種推論？',['蘇秦參與從約','各國利益需要協調','合縱既成便永不需要維繫'],2,1],
  ['遊說處境','去秦而歸的去是？',['離開','前往秦國','再上書一次'],0,0],['合縱身分','並相六國的並最接近？',['六國地圖相鄰','兼、同時','把六國合併成一個郡'],1,1]]},
 {quotes:[['《楚辭・漁父》','舉世皆濁我獨清，眾人皆醉我獨醒，是以見放。'],['《楚辭・漁父》','聖人不凝滯於物，而能與世推移。']],qs:[
  ['人物自述','屈原以清濁醉醒說明什麼？',['只在報告水質與酒量','自認與世態不合，因而被放逐','承認自己完全沒有主張'],1,0],['處世分歧','漁父所說與世推移偏向？',['永不因情勢調整','必須傷害自己證明清白','不拘泥一端，隨時勢調整處世'],2,1],
  ['人物自述','順流護簡成功，是否已替屈原與漁父判出誰絕對正確？',['沒有，操作分數不能代替兩種價值立場的辨析','已經證明所有人都濁','已經取消屈原被放逐的情節'],0,0],['處世分歧','船可順流或修正方向，適合用來提出哪種閱讀問題？',['屈原一定不會划船','堅守與因應各有什麼條件及代價','漁父命令所有人不讀書'],1,1],
  ['人物自述','見放中的見表示？',['看見別人','被，表被動','立即見到君王'],1,0],['處世分歧','凝滯於物與與世推移形成？',['同義重複','水流快慢的實測記錄','拘泥與調整之間的對照'],2,1]]},
 {quotes:[['《史記・趙世家》','今吾將胡服騎射以教百姓，而世必議寡人，柰何？'],['《史記・趙世家》','臣聞疑事無功，疑行無名。']],qs:[
  ['改革阻力','世必議寡人寫出趙武靈王擔心？',['世俗輿論對改革的批評','完全不懂騎射用途','已經下令停止一切軍事訓練'],0,0],['決斷與條件','疑事無功、疑行無名主要勸什麼？',['遇到風險就不必查核','考量後不要因猶疑而不實行','任何衝動都會成功'],1,1],
  ['改革阻力','八靶全中後，胡服改革的哪些問題仍不能靠分數回答？',['靶心的位置','箭偏左或偏右','制度、禮俗與輿論的阻力如何處理'],2,0],['決斷與條件','射擊要先補風偏再決定，與原句相連時應保留？',['決斷仍須建立在條件與判斷上','瞄準越少越等於有名','所有改革都只需要箭術'],0,1],
  ['改革阻力','柰何最接近？',['不用再問','怎麼辦','百姓已全部服從'],1,0],['決斷與條件','把原句改讀為有疑問的人都不准發言，哪裡不妥？',['失去猶疑不行難成事的語境','保留了無功兩字','正確呈現了諮詢討論'],0,1]]},
 {quotes:[['《戰國策・齊策四》','狡兔有三窟，僅得免其死耳；今君有一窟，未得高枕而臥也。請為君復鑿二窟。'],['《戰國策・齊策四》','臣竊計，君宮中積珍寶，狗馬實外廄，美人充下陳。君家所寡有者以義耳！竊以為君市義。']],qs:[
  ['三窟與風險','兔有三窟的比喻要提醒？',['只靠一處依憑還不穩妥，須另作安排','真的要替孟嘗君養三隻兔子','三次開門就能永遠無事'],0,0],['市義轉折','馮諼把君家所少解為什麼？',['珍寶更多','義與民心','馬匹數量'],1,1],
  ['三窟與風險','三門全開後，為何仍不能寫成孟嘗君永久安全？',['機關少用一枚鑰匙','史文完全沒有談風險','比喻強調增加依憑，僅得免其死仍有界線'],2,0],['市義轉折','若把全部成功只歸給機關巧妙，會忽略？',['收買更多珍寶才是全文唯一目的','馮諼把物質所缺轉成義與民心的判斷','門冠顏色是歷史事實'],1,1],
  ['三窟與風險','復鑿二窟的復在此是？',['再、另外','恢復一隻兔子','否定已有一窟'],0,0],['市義轉折','市義中的市應讀為？',['市場地名','搬家','買，用買物比喻取得義'],2,1]]},
 {quotes:[['《史記・廉頗藺相如列傳》','乃使其從者衣褐，懷其璧，從徑道亡，歸璧於趙。'],['《史記・廉頗藺相如列傳》','秦亦不以城予趙，趙亦終不予秦璧。']],qs:[
  ['歸璧分工','從者衣褐、從徑道亡的行動是？',['秦王公開護送璧往趙','藺相如把璧送入秦倉','從者穿粗布衣，懷璧由小路逃回趙'],2,0],['外交結果','這段交涉的結果是？',['秦未交城，趙最終也未交璧','秦已正式交出十五城','從者成為秦王'],0,1],
  ['歸璧分工','移位通路完成後，原文中的歸璧由誰執行？',['方格牌自己飛回趙','相如所派的從者','秦王親自駕車'],1,0],['外交結果','不能把滑塊全復位寫成成功換得十五城，因為？',['遊戲牌只有八枚','十五是錯誤數字','原文明記秦亦不以城予趙'],2,1],
  ['歸璧分工','衣褐的衣在此是？',['衣服的顏色','穿，作動詞','把璧交還秦王'],1,0],['外交結果','終不予秦璧的終提示？',['最後、最終的結果','事情從未開始','秦趙已結為一國'],0,1]]},
 {quotes:[['《史記・魏公子列傳》','公子從車騎，虛左，自迎夷門侯生。'],['《史記・魏公子列傳》','將在外，主令有所不受，以便國家。']],qs:[
  ['禮士行動','虛左、自迎具體表現什麼？',['空著尊位，親自迎接侯生','讓侯生永遠在城門等待','命車騎阻止侯生上車'],0,0],['軍令與責任','將在外有所不受所依據的理由是？',['凡事只顧個人名聲','讓軍事處置有利於國家','將領永遠不用負責'],1,1],
  ['禮士行動','兩使協作開門，與信陵君禮士可以相連的是？',['每位賓客都應替他控制機關','原文真的有兩道彩色壓板','不同角色需要被尊重，也須有實際參與的空間'],2,0],['軍令與責任','若以遊戲門已打開便斷言任何抗命都合理，忽略了？',['以便國家的理由與具體情勢','將在外的外字','按鈕的大小'],0,1],
  ['禮士行動','自迎的自指？',['自己親自','自動車隊','侯生不必參加'],0,0],['軍令與責任','有所不受中的有所在語意上表示？',['所有命令一律不接受','毫無條件永遠服從','某些情況下不接受，不能擴成無限制拒令'],2,1]]},
 {quotes:[['《史記・秦始皇本紀》','秦王初並天下，令丞相、御史曰……'],['《戰國策・魏策四》','秦王色撓，長跪而謝之曰：「先生坐，何至於此，寡人諭矣。夫韓、魏滅亡，而安陵以五十里之地存者，徒以有先生也。」']],qs:[
  ['統一與治理','初並天下在本篇年代線上指？',['秦完成六國統一，隨後議帝號','秦已被漢取代','荊軻成功奪位'],0,0],['事件界線','安陵插曲中，秦王色撓、長跪謝之是？',['天下從此永久停戰','這一段與唐雎對話中的態度轉變','秦王宣布禪位唐雎'],1,1],
  ['統一與治理','衡器校準完成，是否能說政治統一已解決所有治理問題？',['能，砝碼從不需要再檢查','能，初並等於永久太平','不能，制度推行與民生仍需繼續面對'],2,0],['事件界線','回看安陵插曲時，為何不能把秦王謝之直接當作統一終止？',['具體對話結果有其範圍，不能推成全天下歷史結局','謝只表示聲音變大','韓魏滅亡是遊戲憑空捏造'],0,1],
  ['統一與治理','並天下的並在此是？',['並排列隊','兼併、統一','同時擺放三顆砝碼'],1,0],['事件界線','徒以有先生也的徒最接近？',['徒弟','徒步','只、僅僅'],2,1]]}
];
const PILOTS=rows.map((r,i)=>({id:r[0],name:r[1],title:r[2],role:r[3],mechanic:r[4],node:r[5],point:r[6],recommended:r[7],rule:r[8],kind:'warring',scene:'scene:zg'+r[0].slice(4,6)+'_world',source:reading[i].quotes[0][0],quote:reading[i].quotes[0][1],brief:'以自己的角色完成「'+r[2]+'」，各篇保留原有必做體驗與史實走向。',after:'同行任務完成。回到原篇人物與事件；這項自編推演不改變人物決定及史實結局。'}));
const CHAPTERS=Object.fromEntries(PILOTS.map((p,i)=>{const r=reading[i],qs=r.qs.map((a,n)=>({id:'wa-'+(n<2?'e':n<4?'f':'r')+(n%2+1),tag:a[0],prompt:a[1],choices:a[2],answer:a[3],evidence:r.quotes.map((q,j)=>({id:'quote'+j,text:q[1]+'（'+q[0]+'）'})),correctEvidence:'quote'+a[4],explain:'請核對這一句原文及其說話者、前後情勢；同行操作不會替你回答。',...(n>=4?{tags:[a[0]]}:{})}));return[p.id,{title:p.title,intro:p.brief,evidence:qs.slice(0,2),reflection:qs.slice(2,4),remedy:qs.slice(4)}];}));
const nations=['韓','趙','魏','楚','燕','齊'],goodsNames=['穀','馬','鐵'],jadeGoal=[1,2,3,4,5,6,7,8,0];
const skillNames={swift:'迅影',steady:'握定',precise:'巧勁',foresight:'望勢',listen:'聽息',light:'輕裝',plan:'運籌',trace:'留痕'};
const allowed={flood:['plan','foresight','listen','trace'],canal:['precise','plan','foresight','trace'],balance:['swift','steady','precise','foresight','light','trace'],forum:['plan','listen','foresight','trace'],ambush:['steady','foresight','plan','trace'],treaty:['plan','foresight','trace','listen'],drift:['swift','steady','foresight','listen','light','trace'],archery:['swift','steady','precise','foresight','listen','light','trace'],locks:['precise','plan','foresight','trace'],jade:['plan','foresight','trace','light'],twin:['plan','foresight','listen','light','trace'],measures:['precise','plan','foresight','trace']};
const SKILL_DESCRIPTIONS={swift:'迅影：搬木可抵消一級側風；護簡短暫免划槳耗力；騎射時減半馬步晃動。',steady:'握定：搬木、伏節與騎射短暫擴大容許誤差；護簡可抵一次浮木衝撞。',precise:'巧勁：騎射短暫擴大命中範圍；搬木增加平衡餘裕，工程與機關顯示局部核對提示。',foresight:'望勢：預看下一輪水勢、來人、行程或江流，亦可看機關及砝碼條件。',listen:'聽息：靜候兩秒，八秒內操作誤判有一次不扣品質的重整機會。',light:'輕裝：搬運與划槳更省力；推牌、雙使多十步；騎射晃動減少15%，總時限減少25秒。',plan:'運籌：補充工程、通道調度、推移或核對餘裕；分洪多一單位暫存，吸收一次小幅差額。',trace:'留痕：記下當前進度與操作盤面，供自己對照後續改動。'};
function pilot(w){return PILOTS.find(p=>p.id===(typeof w==='string'?w:w.id));}
function compatible(c,id){const p=pilot(id);return !!p&&c.skills.every(k=>allowed[p.mechanic].includes(k));}
function limit(c){return 240+c.stats.focus*8-(c.skills.includes('light')?25:0);}
function routes(id){const p=pilot(id);return[{id:'companion',name:p.title,brief:p.rule,build:'臂力增加工程及搬運餘裕；巧手、身法協助操作；察勢、籌算提供觀察與安排空間。',tradeoff:'配點與能力只能增加操作餘裕，原文證據和反思仍須自己判斷。'}];}
const active=(w,id)=>(w.buffs[id]||0)>w.time;
const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
function adjacent(a,b,cols=4,total=16){return integer(b,0,total-1)&&Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols))===1;}
function initial(w){const s=w.snapshot.config.stats,k=pilot(w).mechanic,g={version:1,mechanic:k,log:[],errors:0,spent:0,done:false};
 if(k==='flood')Object.assign(g,{round:0,gates:[0,0,0],damage:0,saved:0,reserve:0,maxDamage:3+Math.floor(s.strength/2)});
 if(k==='canal')Object.assign(g,{heights:Array(12).fill(4),dug:0,budget:30+s.strength*2+s.planning,tests:0});
 if(k==='canal')g.heights[4]=5;
 if(k==='balance')Object.assign(g,{stage:0,lean:0,shifts:0,fatigue:0,endurance:20+s.strength*2+(w.snapshot.config.skills.includes('light')?4:0)});
 if(k==='forum')Object.assign(g,{round:0,queues:[3,3,3],orders:4,served:0,overflow:0});
 if(k==='ambush')Object.assign(g,{round:0,delays:[0,0,0],attempts:0,budget:6+Math.floor(s.planning/2),arrivals:[]});
 if(k==='treaty')Object.assign(g,{round:0,pairs:[],agreements:[],attempts:0,budget:6+Math.floor(s.planning/2)});
 if(k==='drift')Object.assign(g,{stage:0,lane:1,energy:6+Math.floor(s.strength/2),scrolls:0,hull:4,paddled:false,held:false});
 if(k==='archery')Object.assign(g,{target:0,aim:{x:50,y:50},shots:0,hits:0,misses:0});
 if(k==='locks')Object.assign(g,{slots:Array(9).fill(null),tokens:[0,1,2,0,1,2,0,1,2],opened:[],attempts:0,budget:7+Math.floor(s.planning/2)});
 if(k==='jade'){let board=jadeGoal.slice(),blank=8,previous=-1,n=w.seed>>>0;for(let i=0;i<20;i++){const choices=board.map((_,j)=>j).filter(j=>adjacent(blank,j,3,9)&&j!==previous);n=(Math.imul(n,1664525)+1013904223)>>>0;const at=choices[n%choices.length];[board[blank],board[at]]=[board[at],board[blank]];previous=blank;blank=at;}if(same(board,jadeGoal)){[board[8],board[7]]=[board[7],board[8]];blank=7;}Object.assign(g,{board,blank,moves:0,budget:70+s.planning*6+(w.snapshot.config.skills.includes('light')?10:0)});}
 if(k==='twin')Object.assign(g,{positions:[0,4],active:0,visits:[[],[]],unlocked:[false,false],delivered:[false,false],steps:0,budget:80+s.planning*5+(w.snapshot.config.skills.includes('light')?10:0)});
 if(k==='measures')Object.assign(g,{round:0,weights:[0,0,0],attempts:0,budget:6+Math.floor(s.planning/2),calibrated:[]});
 return g;
}
function floodState(w,round=w.campaign.round){const inflow=[5,4,6,5,3][round%5],ceilings=[[2,2,3],[1,3,2],[3,2,2],[2,3,1],[1,2,3]][(round+w.seed%5)%5];return{inflow,ceilings};}
function watered(w){const h=w.campaign.heights,seen=new Set([4]),queue=[4];for(let i=0;i<queue.length;i++)for(let j=0;j<12;j++)if(adjacent(queue[i],j,4,12)&&h[j]<h[queue[i]]&&!seen.has(j)){seen.add(j);queue.push(j);}return[...seen];}
function balanceState(w,stage=w.campaign.stage){const s=w.snapshot.config.stats,wind=[-2,1,2,-1,2,-2][(stage+w.seed%6)%6];return{wind:active(w,'swift')?Math.sign(wind)*Math.max(0,Math.abs(wind)-1):wind,tolerance:.4+s.dexterity*.12+s.agility*.08+Math.floor(s.strength/3)*.2+(active(w,'steady')?.8:0)+(active(w,'precise')?.5:0)};}
function incoming(w,round=w.campaign.round){return[0,1,2].map(i=>[0,1,2][(i+round+w.seed)%3]);}
function ambushState(w,round=w.campaign.round){return{travel:[0,1,2].map(i=>2+(w.seed+round*2+i*3)%5),tolerance:.35+w.snapshot.config.stats.insight*.08+(active(w,'steady')?1:0)};}
function treatyState(w,round=w.campaign.round){return{goods:[0,1,2,0,1,2].map((x,i)=>(x+(round*(i%2)))%3),forbidden:[[round%6,(round+1)%6]],round};}
function river(w,stage=w.campaign.stage){return{current:[-1,0,1,0][(stage+w.seed)%4],scroll:(stage+w.seed)%3,obstacle:(stage+w.seed+1)%3};}
function target(w){const g=w.campaign,s=w.snapshot.config.stats;return{x:30+(w.seed+g.target*7)%41,y:30+(w.seed*2+g.target*11)%41,wind:((w.seed+g.target)%5-2)*4,motion:Math.sin(w.time*2+g.target)*8*(active(w,'swift')?.5:1)*(w.snapshot.config.skills.includes('light')?.85:1),radius:4+s.dexterity*.7+s.agility*.2+(active(w,'precise')?5:0)+(active(w,'steady')?3:0)};}
function keyClues(w){return[0,1,2].map(x=>(x+w.seed)%3);}
function measureState(w,round=w.campaign.round){return{unit:[1,3,5],target:[11,14,17][(round+w.seed%3)%3],cap:[5,4,5][(round+w.seed%3)%3]};}
function uiHints(w){const g=w.campaign,out=[];if(g.mechanic==='flood'&&g.reserve)out.push('運籌暫存尚餘 '+g.reserve+' 單位；可吸收等量總分流差額，單閘上限仍須遵守。');if(active(w,'foresight')){
 const k=g.mechanic;if(k==='flood'){const n=floodState(w,g.round+1);out.push('下一輪來水 '+n.inflow+'；閘限 '+n.ceilings.join('/'));}
 else if(k==='canal')out.push('望勢測流：目前可到 '+watered(w).map(x=>x+1).join('、')+' 格；留意右側三田前還要保留下降空間。');
 else if(k==='balance')out.push('下一段側風：'+balanceState(w,g.stage+1).wind+'；移重心前可先規劃負荷。');
 else if(k==='forum')out.push('下一輪各通道新增：'+incoming(w,g.round+1).join('/'));
 else if(k==='ambush')out.push('下一輪行程：'+ambushState(w,g.round+1).travel.join('/'));
 else if(k==='treaty'){const n=treatyState(w,g.round+1);out.push('下一輪物資 '+n.goods.map(x=>goodsNames[x]).join('/')+'；禁配 '+n.forbidden.map(p=>p.map(x=>nations[x]).join('／')).join('、')+'。');}
 else if(k==='drift'){const n=river(w,g.stage+1);out.push('下一段水流 '+n.current+'，竹簡在 '+(n.scroll+1)+' 道。');}
 else if(k==='archery')out.push('下一靶風偏：'+(((w.seed+g.target+1)%5-2)*4)+'；馬步仍持續晃動。');
 else if(k==='locks')out.push('三門門冠次序：'+keyClues(w).map(x=>['青','赤','金'][x]).join('／')+'；先固定首格再核對同高度。');
 else if(k==='jade'){const distance=g.board.reduce((n,x,i)=>x?n+Math.abs(i%3-(x-1)%3)+Math.abs(Math.floor(i/3)-Math.floor((x-1)/3)):n,0);out.push('各牌到目標的總格距：'+distance+'；這是最低移動需求參考，不含互相讓路。');}
 else if(k==='twin')out.push('另一使者目前在 '+g.positions[1-g.active]+' 號格；六號門'+(g.unlocked[0]?'已開':'尚需守二號壓板')+'、十號門'+(g.unlocked[1]?'已開':'尚需守七號壓板')+'。');
 else if(k==='measures'){const n=measureState(w,g.round+1);out.push('下一輪目標 '+n.target+'，砝碼最多 '+n.cap+' 枚；可先估算較大砝碼的使用。');}
 }if(active(w,'precise')){if(g.mechanic==='canal')out.push('巧勁測流：目前水已到 '+watered(w).map(x=>x+1).join('、')+' 格；渠床必須逐步降低。');else if(g.mechanic==='locks')out.push('巧勁核對：逐門三色俱全，同高度不可重色；先檢查門冠首格。');else if(g.mechanic==='measures')out.push('巧勁讀秤：目前差 '+(measureState(w).target-g.weights.reduce((a,n,i)=>a+n*[1,3,5][i],0))+' 單位。');else out.push('巧勁中：操作容許誤差已暫時擴大。');}
 if(active(w,'steady'))out.push('握定中：平衡、同步與命中容許擴大，或可護住一次浮木碰撞。');if(active(w,'swift'))out.push('迅影中：搬木、划槳或騎射操作更有餘裕。');if(active(w,'listening'))out.push('聽息中：先靜候兩秒，本次重整可免一次品質扣分。');if(w.trace)out.push('留痕：'+w.trace.summary);return out;}
function skill(w,id){const g=w.campaign;if(!w.snapshot.config.skills.includes(id)||id==='light'||(w.uses[id]||0)>=2||w.time<(w.cooldowns[id]||0))return false;w.uses[id]=(w.uses[id]||0)+1;w.cooldowns[id]=w.time+10;
 if(id==='trace')w.trace={mechanic:g.mechanic,at:w.time,summary:summary(w),board:copy(Object.fromEntries(Object.entries(g).filter(([k])=>k!=='log')))};
 else if(id==='plan'){if(g.mechanic==='forum')g.orders+=2;else if(['canal','jade','twin'].includes(g.mechanic))g.budget+=g.mechanic==='canal'?8:12;else if('budget'in g)g.budget+=2;else if(g.mechanic==='flood'){g.maxDamage++;g.reserve++;}else w.buffs.foresight=w.time+10;}
 else if(id==='listen'){w.buffs.listening=w.time+8;g.held=true;}
 else w.buffs[id]=w.time+(id==='foresight'?Math.min(18,10+w.snapshot.config.stats.insight):8);
 w.notice='已使用'+skillNames[id]+'；原文與主要操作仍由你完成。';return true;}
function reduce(w,name,v){const g=w.campaign,k=g.mechanic;let failed=false;const fail=text=>{failed=true;if(g.held&&active(w,'listening')){g.held=false;w.notice='聽息重整：'+text;return true;}g.errors++;w.errors=g.errors;w.notice=text;return true;};
 if(name==='skill')return skill(w,v);
 if(k==='flood'&&name==='setGate'&&v&&integer(v.index,0,2)&&integer(v.value,0,3))g.gates[v.index]=v.value;
 else if(k==='flood'&&name==='release'){const a=floodState(w),gap=Math.abs(g.gates.reduce((a,b)=>a+b,0)-a.inflow);if(gap<=g.reserve&&g.gates.every((x,i)=>x<=a.ceilings[i])){g.saved++;g.reserve-=gap;}else{g.damage++;fail('總分流量或單閘負荷不合，堤身承受一次損傷。');}g.round++;g.spent++;if(g.damage>=g.maxDamage)w.status='lost';else if(g.round===5){g.done=g.saved>=4;if(!g.done)w.status='lost';}}
 else if(k==='canal'&&name==='dig'&&integer(v,0,11)&&v!==4){if(g.dug>=g.budget)return fail('工程餘裕已用完，可用運籌補充或重新規劃。');if(g.heights[v]<=0)return false;g.heights[v]--;g.dug++;g.spent++;}
 else if(k==='canal'&&name==='testCanal'){g.tests++;if(![3,7,11].every(x=>watered(w).includes(x)))return fail('尚有田地未通水；檢查相鄰格是否逐級下降，別把中段挖得比出口還低。');g.done=true;}
 else if(k==='balance'&&name==='shift'&&[-1,1].includes(v)){if(Math.abs(g.lean+v)>3)return false;g.lean+=v;g.shifts++;g.fatigue+=(w.snapshot.config.skills.includes('light')||active(w,'swift'))?0:1;g.spent++;if(g.fatigue>g.endurance)w.status='lost';}
 else if(k==='balance'&&name==='carry'){const a=balanceState(w);if(Math.abs(g.lean+a.wind)>a.tolerance)return fail('側風與重心尚未平衡，先調整再走。');g.stage++;g.fatigue++;g.lean=0;g.spent++;g.done=g.stage===6;if(g.fatigue>g.endurance&&!g.done)w.status='lost';}
 else if(k==='forum'&&name==='dispatch'&&integer(v,0,2)){if(g.orders<=0)return false;if(g.queues[v]===0)return fail('這條通道暫無人等待，請先看其他通道。');g.queues[v]--;g.orders--;g.served++;g.spent++;}
 else if(k==='forum'&&name==='nextForum'){if(g.orders>0&&g.queues.some(n=>n>0))return fail('本輪調度尚未完成，先用完可用的接引次數。');g.round++;if(g.round===4){g.done=g.served>=12&&g.queues.every(n=>n<=3);if(!g.done)w.status='lost';}else{g.queues=g.queues.map((n,i)=>n+incoming(w)[i]);g.orders=4;if(g.queues.some(n=>n>5)){g.overflow++;fail('通道過度積壓，請優先接引等候較多的一側。');if(g.overflow>=2)w.status='lost';}}}
 else if(k==='ambush'&&name==='setDelay'&&v&&integer(v.index,0,2)&&integer(v.value,0,6))g.delays[v.index]=v.value;
 else if(k==='ambush'&&name==='spring'){if(g.attempts>=g.budget)return fail('合令核對次數用完，可用運籌補充。');g.attempts++;g.spent++;const a=ambushState(w),arrivals=a.travel.map((x,i)=>x+g.delays[i]);if(Math.max(...arrivals)-Math.min(...arrivals)>a.tolerance)return fail('三組到達差距過大；行程較短的組需要較晚出發。');g.arrivals.push(arrivals);g.round++;g.delays=[0,0,0];g.done=g.round===3;}
 else if(k==='treaty'&&name==='pair'&&v&&integer(v.a,0,5)&&integer(v.b,0,5)&&v.a!==v.b){const pair=[v.a,v.b].sort((a,b)=>a-b),at=g.pairs.findIndex(x=>same(x,pair));if(at>=0)g.pairs.splice(at,1);else{if(g.pairs.some(x=>x.includes(v.a)||x.includes(v.b)))return false;g.pairs.push(pair);}}
 else if(k==='treaty'&&name==='ratify'){if(g.attempts>=g.budget)return fail('本局履約核對餘裕用完，可用運籌補充。');g.attempts++;g.spent++;const a=treatyState(w);if(g.pairs.length!==3||g.pairs.some(([x,y])=>a.goods[x]===a.goods[y]||a.forbidden.some(z=>same(z.slice().sort((x,y)=>x-y),[x,y]))))return fail('六國須各參與一組，物資互補且避開禁配；先撤去衝突配對再議。');g.agreements.push(copy(g.pairs));g.round++;g.pairs=[];g.done=g.round===3;}
 else if(k==='drift'&&name==='row'&&[-1,0,1].includes(v)){if(g.paddled)return false;const cost=(w.snapshot.config.skills.includes('light')||active(w,'swift'))?0:1;if(v!==0&&g.energy<cost)return fail('體力不足，停槳一段可回復兩點。');if(v===0)g.energy=Math.min(8,g.energy+2);else g.energy-=cost;g.lane=clamp(g.lane+v,0,2);g.paddled=true;g.spent++;}
 else if(k==='drift'&&name==='drift'){if(!g.paddled)return false;const a=river(w);g.lane=clamp(g.lane+a.current,0,2);if(g.lane===a.obstacle){if(active(w,'steady'))w.buffs.steady=w.time;else{g.hull--;fail('浮木撞船，先算進水流的推移再下槳。');}}if(g.lane===a.scroll)g.scrolls++;g.stage++;g.paddled=false;g.spent++;if(g.hull<=0)w.status='lost';else if(g.stage===8){g.done=g.scrolls>=4;if(!g.done)w.status='lost';}}
 else if(k==='archery'&&name==='aim'&&v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=100&&v.y>=0&&v.y<=100)g.aim={x:Math.round(v.x*100)/100,y:Math.round(v.y*100)/100};
 else if(k==='archery'&&name==='fire'){const a=target(w),dx=g.aim.x+a.wind+a.motion-a.x,dy=g.aim.y-a.y;g.shots++;g.spent++;if(Math.hypot(dx,dy)<=a.radius){g.hits++;g.target++;g.done=g.target===8;}else{g.misses++;fail('未中靶；風偏與馬步晃動都會移動落點。');if(g.misses>=5)w.status='lost';}}
 else if(k==='locks'&&name==='keyPlace'&&v&&integer(v.key,0,8)&&integer(v.slot,0,8)){if(g.opened.includes(Math.floor(v.slot/3))||g.slots[v.slot]!==null||g.slots.includes(v.key))return false;g.slots[v.slot]=v.key;g.spent++;}
 else if(k==='locks'&&name==='keyRemove'&&integer(v,0,8)&&g.slots[v]!==null&&!g.opened.includes(Math.floor(v/3))){g.slots[v]=null;g.spent++;}
 else if(k==='locks'&&name==='unlockDoor'&&integer(v,0,2)&&!g.opened.includes(v)){if(g.attempts>=g.budget)return fail('機關核對餘裕已用完，可用運籌補充。');g.attempts++;g.spent++;const row=g.slots.slice(v*3,v*3+3),colors=row.map(x=>x===null?-1:g.tokens[x]);if(row.includes(null)||new Set(colors).size!==3||colors[0]!==keyClues(w)[v]||colors.some((color,col)=>g.slots.some((key,j)=>key!==null&&Math.floor(j/3)!==v&&j%3===col&&g.tokens[key]===color)))return fail('核對本門三色、門冠首格，以及跨門同高度的重色。');g.opened.push(v);g.done=g.opened.length===3;}
 else if(k==='jade'&&name==='slide'&&integer(v,0,8)&&adjacent(g.blank,v,3,9)){if(g.moves>=g.budget)return fail('推移步數用完，可用運籌補充。');[g.board[g.blank],g.board[v]]=[g.board[v],g.board[g.blank]];g.blank=v;g.moves++;g.spent++;g.done=same(g.board,jadeGoal);}
 else if(k==='twin'&&name==='selectAgent'&&integer(v,0,1))g.active=v;
 else if(k==='twin'&&name==='walkTwin'&&integer(v,0,15)&&adjacent(g.positions[g.active],v)){if([5,9].includes(v))return fail('此格是牆，改走相鄰通道。');if(g.steps>=g.budget)return fail('行路餘裕用完，可用運籌補充。');if(v===6&&!g.unlocked[0]){if(g.positions[1-g.active]!==2)return fail('六號門未開，請另一使者先守住二號壓板。');g.unlocked[0]=true;}if(v===10&&!g.unlocked[1]){if(g.positions[1-g.active]!==7)return fail('十號門未開，請另一使者先守住七號壓板。');g.unlocked[1]=true;}g.positions[g.active]=v;if([3,11].includes(v)&&!g.visits[g.active].includes(v))g.visits[g.active].push(v);g.steps++;g.spent++;g.delivered=g.positions.map((at,i)=>at===[15,14][i]&&[3,11].every(n=>g.visits[i].includes(n)));g.done=g.delivered.every(Boolean)&&g.unlocked.every(Boolean);}
 else if(k==='measures'&&name==='setWeight'&&v&&integer(v.index,0,2)&&integer(v.value,0,4))g.weights[v.index]=v.value;
 else if(k==='measures'&&name==='weigh'){if(g.attempts>=g.budget)return fail('校準核對次數用完，可用運籌補充。');g.attempts++;g.spent++;const a=measureState(w),weight=g.weights.reduce((n,x,i)=>n+x*a.unit[i],0);if(weight!==a.target||g.weights.reduce((a,b)=>a+b,0)>a.cap)return fail('重量或枚數不合；同樣重量也須在砝碼枚數上限內。');g.calibrated.push(copy(g.weights));g.round++;g.weights=[0,0,0];g.done=g.round===3;}
 else return false;
 if(!failed)w.notice=g.done?'本篇同行操作完成，接著回到原文反思。':'操作已記下，請觀察下一步。';return true;
}
function command(w,name,value){const g=w.campaign;if(g.log.length>=240||g.done||w.status!=='playing')return false;if(name!=='skill'&&active(w,'listening')&&w.time<(w.buffs.listening-6))return false;const v=value===undefined?null:copy(value),ok=reduce(w,name,v);if(ok){g.log.push({t:w.time,name,value:v});if(g.done)w.status='won';}return ok;}
function complete(w){return w.campaign.done===true;}
function validate(w){const g=w.campaign;if(!g||g.version!==1||g.mechanic!==pilot(w).mechanic||!Array.isArray(g.log)||g.log.length>240)throw Error('戰國同行存檔格式不符。');const fresh={id:w.id,seed:w.seed,snapshot:copy(w.snapshot),time:0,limit:w.limit,uses:{},cooldowns:{},buffs:{},trace:null,errors:0,status:'playing',notice:''};fresh.campaign=initial(fresh);let at=0;for(const a of g.log){if(!a||Object.keys(a).sort().join(',')!=='name,t,value'||!Number.isFinite(a.t)||a.t<at||a.t>w.time||fresh.campaign.done||fresh.status==='lost'||(a.name!=='skill'&&active({...fresh,time:a.t},'listening')&&a.t<fresh.buffs.listening-6))throw Error('戰國操作歷程無法核對。');at=a.t;fresh.time=at;if(!reduce(fresh,a.name,a.value))throw Error('戰國操作條件無法核對。');fresh.campaign.log.push(copy(a));}for(const key of ['campaign','uses','cooldowns','buffs','trace','errors'])if(!same(w[key],fresh[key]))throw Error('戰國操作結果與歷程不符。');if(w.status==='lost'&&w.time<w.limit&&fresh.status!=='lost')throw Error('戰國任務尚未達失敗條件。');return true;}
function progress(before,next){const a=before.campaign.log,b=next.campaign.log;if(a.length>b.length||!same(a,b.slice(0,a.length)))throw Error('戰國同行操作不能倒退或改寫。');}
function summary(w){const g=w.campaign;return({flood:()=>g.round+'/5輪 · 守住'+g.saved+'輪',canal:()=>[3,7,11].filter(x=>watered(w).includes(x)).length+'/3田 · 動工'+g.dug,balance:()=>g.stage+'/6段 · 搬運負荷'+g.fatigue+'/'+g.endurance,forum:()=>g.round+'/4輪 · 接引'+g.served+'人',ambush:()=>g.round+'/3輪同步',treaty:()=>g.round+'/3輪 · 本輪'+g.pairs.length+'/3約',drift:()=>g.stage+'/8段 · 竹簡'+g.scrolls+'束 · 船況'+g.hull,archery:()=>g.hits+'/8靶 · '+g.shots+'箭',locks:()=>g.opened.length+'/3門 · 已放'+g.slots.filter(x=>x!==null).length+'/9牌',jade:()=>g.moves+'步 · '+g.board.filter((x,i)=>x===jadeGoal[i]).length+'/9格復位',twin:()=>g.unlocked.filter(Boolean).length+'/2門 · '+g.delivered.filter(Boolean).length+'/2使抵達',measures:()=>g.round+'/3輪校準'})[g.mechanic]();}
function objectives(w){return[{id:'accurate',label:'零操作誤判',done:w.campaign.errors===0},{id:'efficient',label:'半數時限內完成',done:w.campaign.done&&w.time<=w.limit/2},{id:'unassisted',label:'不使用主動能力完成',done:w.campaign.done&&Object.values(w.uses).every(n=>n===0)}];}
function report(w){return{title:pilot(w).title,completed:w.campaign.done,seconds:Math.round(w.time*10)/10,quality:clamp(100-w.campaign.errors*8,0,100),items:[{label:'同行進度',value:summary(w)},{label:'操作誤判',value:w.campaign.errors},{label:'有效操作',value:w.campaign.spent}],suggestions:[w.campaign.errors?'重新看清本篇限制，再分段安排操作；能力增加餘裕，不代替原文判斷。':'可挑戰更少調整、不同配點或不用主動能力，閱讀首次作答仍獨立保留。']};}
module.exports={PILOTS,CHAPTERS,SKILL_DESCRIPTIONS,pilot,routes,compatible,limit,initial,command,complete,validate,progress,summary,objectives,report,uiHints,active,adjacent,floodState,watered,balanceState,incoming,ambushState,treatyState,river,target,keyClues,measureState,nations,goodsNames,jadeGoal};
