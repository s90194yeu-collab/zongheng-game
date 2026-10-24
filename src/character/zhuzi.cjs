'use strict';
// 諸子同行：自編模型與原典閱讀分開；不改原三幕遊戲、首次分數或史傳結局。
const copy=x=>JSON.parse(JSON.stringify(x));
const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const same=(a,b)=>canonical(a)===canonical(b);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const rows=[
 {
  "id": "S_zz01_laobio",
  "name": "老子・初階人物",
  "title": "守藏升架",
  "mechanic": "lift",
  "stage": 0,
  "recommended": [
   "steady",
   "foresight"
  ],
  "role": "守藏升架者",
  "rule": "拖動書車到倉口取簡，再到升降臺。臺到低位才上車，到指定書架高度再歸簡；三架都須送達。升架是自編典藏模型，不視為老子生平實錄。",
  "person": "laozi",
  "level": "bio",
  "quotes": [
   [
    "《史記・老子韓非列傳》",
    "老子者，楚苦縣厲鄉曲仁里人也，姓李氏，名耳，字耼，周守藏室之史也。"
   ],
   [
    "《史記・老子韓非列傳》",
    "孔子適周，將問禮於老子。……去子之驕氣與多欲，態色與淫志，是皆無益於子之身。"
   ],
   [
    "《史記・老子韓非列傳》",
    "至關，關令尹喜曰：「子將隱矣，彊為我著書。」於是老子乃著書上下篇，言道德之意五千餘言而去，莫知其所終。"
   ]
  ],
  "qs": [
   [
    "典藏職務",
    "周守藏室之史在這段傳述中交代什麼？",
    [
     "老子管理典藏的職務",
     "老子統一秦國",
     "老子已確定所有生卒年"
    ],
    0,
    0
   ],
   [
    "史家留白",
    "出關留書後，史家如何記老子的去向？",
    [
     "確定永居秦宮",
     "莫知其所終，保留未知",
     "尹喜立刻銷毀上下篇"
    ],
    1,
    2
   ],
   [
    "典藏職務",
    "升架遊戲能補成老子親自操作機械的證據嗎？",
    [
     "能，畫面就是出土文書",
     "能，只要三架送達",
     "不能，這是依典藏職務自編的情境"
    ],
    2,
    0
   ],
   [
    "史家留白",
    "關口敘事中，留書與人的去向應怎樣區分？",
    [
     "著書有傳述，最終下落仍留白",
     "有留書就表示生平無爭議",
     "五千餘言是其精確壽命"
    ],
    0,
    2
   ],
   [
    "典藏職務",
    "史在周守藏室之史中較合語境的是？",
    [
     "史書名稱",
     "管理典藏的史官",
     "攻城兵器"
    ],
    1,
    0
   ],
   [
    "史家留白",
    "哪項改寫越過莫知的界線？",
    [
     "保留史家不知去向",
     "交代尹喜請其著書",
     "宣稱此後每站行程都可確定"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz02_laoread",
  "name": "老子・進階思想",
  "title": "虛室試器",
  "mechanic": "hollow",
  "stage": 1,
  "recommended": [
   "precise",
   "plan"
  ],
  "role": "器用試作者",
  "rule": "鑿出六乘六塊坯的中空。兩口須連通，中空須可容二乘二物件與三格長柄，所有開孔相連且至多十格；邊框不可毀。從實體與空間共同檢驗用途。",
  "person": "laozi",
  "level": "read",
  "quotes": [
   [
    "《老子》第八章",
    "上善若水。水善利萬物而不爭，處眾人之所惡，故幾於道。"
   ],
   [
    "《老子》第十一章",
    "埏埴以為器，當其無，有器之用。鑿戶牖以為室，當其無，有室之用。故有之以為利，無之以為用。"
   ],
   [
    "《老子》第六十四章",
    "其安易持，其未兆易謀。其脆易泮，其微易散。為之於未有，治之於未亂。"
   ]
  ],
  "qs": [
   [
    "有無相成",
    "器與室的兩例共同說明？",
    [
     "材料與可用空間共同成就用途",
     "必須把材料完全刪去",
     "空間要全部填滿"
    ],
    0,
    1
   ],
   [
    "處理時機",
    "治之於未亂把適當處理放在何時？",
    [
     "災害最大後",
     "尚未混亂時",
     "永遠不作為"
    ],
    1,
    2
   ],
   [
    "有無相成",
    "把器皿塞滿、門窗封死，為何不能只說有已足夠？",
    [
     "器完全無須邊壁",
     "老子只談房價",
     "實體材料仍需中空與開口，才能共同成就用途"
    ],
    2,
    1
   ],
   [
    "處理時機",
    "試器發現小裂口時，與原文可相通的判斷是？",
    [
     "察微而及早處理，並非不停擾動",
     "必須等全器破碎才處理",
     "只要稱無為就不必觀察"
    ],
    0,
    2
   ],
   [
    "有無相成",
    "當其無，有器之用的無較接近？",
    [
     "任何東西都不存在",
     "器內可容物的中空",
     "取消一切製作材料"
    ],
    1,
    1
   ],
   [
    "處理時機",
    "哪個說法不合為之、治之？",
    [
     "在問題小時適當處理",
     "維持安定要看條件",
     "無為就是所有事情都不處理"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz03_zhuangbio",
  "name": "莊子・初階人物",
  "title": "漆園轉坯",
  "mechanic": "lacquer",
  "stage": 0,
  "recommended": [
   "precise",
   "steady"
  ],
  "role": "漆坯照料者",
  "rule": "轉坯上有八個塗區。看當前扇區所需的刷徑與壓力，調整後落刷；每次塗後須稍待乾層。八區完整才完成，不以這項工藝推定莊子親做漆器。",
  "person": "zhuangzi",
  "level": "bio",
  "quotes": [
   [
    "《史記・老子韓非列傳》",
    "莊子者，蒙人也，名周。周嘗為蒙漆園吏，與梁惠王、齊宣王同時。"
   ],
   [
    "《史記・老子韓非列傳》",
    "楚威王聞莊周賢，使使厚幣迎之，許以為相。……我寧游戲汙瀆之中自快，無為有國者所羈。"
   ],
   [
    "《史記・老子韓非列傳》",
    "其學無所不闚，然其要本歸於老子之言。故其著書十餘萬言，大抵率寓言也。"
   ]
  ],
  "qs": [
   [
    "人物與職務",
    "蒙漆園吏這句傳述中的人物名是？",
    [
     "周",
     "軻",
     "況"
    ],
    0,
    0
   ],
   [
    "寓言與傳記",
    "大抵率寓言提醒？",
    [
     "全書每事都是親歷實錄",
     "故事形象常承載思想寄託",
     "寓言完全沒有思考內容"
    ],
    1,
    2
   ],
   [
    "人物與職務",
    "使者認為厚幣、相位人人必求，莊子的回覆質疑哪個前提？",
    [
     "遊戲證明每塊漆器是莊子作品",
     "一切工藝細節都有史記實測",
     "權位厚禮未必高於個人自處、不受拘束的選擇"
    ],
    2,
    1
   ],
   [
    "寓言與傳記",
    "閱讀寓言不能直接補進作者履歷，因為？",
    [
     "寓言人物與事件不等於生平實錄",
     "故事有動物就毫無內容",
     "史記從不談著述"
    ],
    0,
    2
   ],
   [
    "人物與職務",
    "嘗為蒙漆園吏的嘗表示？",
    [
     "品嘗",
     "曾經",
     "每時每刻必然"
    ],
    1,
    0
   ],
   [
    "寓言與傳記",
    "把寓言僅當笑話，漏掉哪一層？",
    [
     "故事的敘事形式",
     "作者使用形象",
     "故事所寄託的思想問題"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz04_zhuangread",
  "name": "莊子・進階思想",
  "title": "濠上移鏡",
  "mechanic": "lens",
  "stage": 1,
  "recommended": [
   "precise",
   "foresight"
  ],
  "role": "濠上觀測者",
  "rule": "切換三個觀測位置，等魚移出遮擋與反光，再調焦留影。每點各取一張。相片只留可見位置與形態，不能測定魚是否快樂。",
  "person": "zhuangzi",
  "level": "read",
  "quotes": [
   [
    "《莊子・養生主》",
    "依乎天理，批大郤，導大窾，因其固然。……每至於族，吾見其難為，怵然為戒，視為止，行為遲。"
   ],
   [
    "《莊子・秋水》",
    "惠子曰：「子非魚，安知魚之樂？」莊子曰：「子非我，安知我不知魚之樂？」……我知之濠上也。"
   ],
   [
    "《莊子・逍遙遊》",
    "今子有五石之瓠，何不慮以為大樽而浮乎江湖，而憂其瓠落無所容？則夫子猶有蓬之心也夫！"
   ]
  ],
  "qs": [
   [
    "認知根據",
    "惠子以子非魚追問什麼？",
    [
     "莊子知道魚樂的根據",
     "濠橋的所有權",
     "魚應繳多少官俸"
    ],
    0,
    1
   ],
   [
    "使用尺度",
    "大瓠的回應改變了什麼？",
    [
     "所有物件都無用途",
     "使用情境與評價尺度",
     "把大瓠立即縮小"
    ],
    1,
    2
   ],
   [
    "認知根據",
    "兩鏡位把魚形記得同樣清楚，惠子仍會追問什麼？",
    [
     "可以，清晰就等於情緒證明",
     "可以，鏡位多就不需論證",
     "觀看描述如何支持知道魚樂，仍需說明認知根據"
    ],
    2,
    1
   ],
   [
    "使用尺度",
    "從不同鏡位觀察，與大瓠寓言可相通的是？",
    [
     "反省原有尺度是否限制理解",
     "任何觀點都能自動證真",
     "只接受唯一原來用途"
    ],
    0,
    2
   ],
   [
    "認知根據",
    "我知之濠上也如何轉換回應？",
    [
     "宣告持有魚的心臟",
     "轉向知道的所在與觀看經驗",
     "完成科學情緒測量"
    ],
    1,
    1
   ],
   [
    "使用尺度",
    "把大瓠只按小容器用途判為無用，問題是？",
    [
     "完全沒有看到物件",
     "器物只能有一種用途",
     "忽略改換情境可能出現的用途"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz05_xunbio",
  "name": "荀子・初階人物",
  "title": "習藝追譜",
  "mechanic": "memory",
  "stage": 1,
  "recommended": [
   "foresight",
   "trace"
  ],
  "role": "學宮習藝者",
  "rule": "觀察九格習藝臺逐次亮起的位置，待示範完再依次重現；三輪長度遞增。可用有限重播重新看，不把記憶速度當作學問或人格。",
  "person": "xunzi",
  "level": "bio",
  "quotes": [
   [
    "《史記・孟子荀卿列傳》",
    "荀卿，趙人。年五十始來游學於齊。"
   ],
   [
    "《史記・孟子荀卿列傳》",
    "齊尚修列大夫之缺，而荀卿三為祭酒焉。"
   ],
   [
    "《史記・孟子荀卿列傳》",
    "荀卿乃適楚而春申君以為蘭陵令。……因家蘭陵。……序列著數萬言而卒。"
   ]
  ],
  "qs": [
   [
    "遊學行跡",
    "這段傳述明確交代荀卿的來處與遊學地是？",
    [
     "趙人，到齊遊學",
     "楚人，到漢遊學",
     "宋人，到唐遊學"
    ],
    0,
    0
   ],
   [
    "職稱語境",
    "三為祭酒的祭酒在此應讀為？",
    [
     "喝酒比賽",
     "學宮中受尊重的職稱",
     "荀卿的本名"
    ],
    1,
    1
   ],
   [
    "遊學行跡",
    "以為蘭陵令與因家蘭陵，可分出哪兩層？",
    [
     "能，背完亮點就懂全部思想",
     "能，操作次數是史家年表",
     "任職身分與定居行跡，是人物經歷的不同面向"
    ],
    2,
    2
   ],
   [
    "職稱語境",
    "操作熟練之後，為何仍不能只把祭酒拆字解？",
    [
     "職稱義要依學宮語境，不是字面飲酒",
     "所有職稱只能按字面猜",
     "只需知道三次便不用讀語境"
    ],
    0,
    1
   ],
   [
    "遊學行跡",
    "來游學於齊的於齊交代？",
    [
     "學說已無爭議",
     "遊學所在",
     "他任秦王之處"
    ],
    1,
    0
   ],
   [
    "職稱語境",
    "哪項解釋會混淆職務和個人姓名？",
    [
     "荀卿在學宮受尊重",
     "祭酒是一項職稱",
     "荀卿的姓名就是祭酒"
    ],
    2,
    1
   ]
  ]
 },
 {
  "id": "S_zz06_xunread",
  "name": "荀子・進階思想",
  "title": "積步飛渡",
  "mechanic": "leap",
  "stage": 1,
  "recommended": [
   "swift",
   "precise"
  ],
  "role": "積步行者",
  "rule": "拖動蓄力，再跳到下一塊踏石。風與踏石位置公開可觀察，飛行結束後驗步；五次落穩才到達。起跳只是積累與善假外物的操作譬喻。",
  "person": "xunzi",
  "level": "read",
  "quotes": [
   [
    "《荀子・勸學》",
    "君子曰：學不可以已。青，取之於藍，而青於藍；冰，水為之，而寒於水。"
   ],
   [
    "《荀子・勸學》",
    "君子生非異也，善假於物也。……故不積跬步，無以至千里；不積小流，無以成江海。"
   ],
   [
    "《荀子・性惡》",
    "人之性惡，其善者偽也。……故聖人化性而起偽，偽起而生禮義，禮義生而制法度。"
   ]
  ],
  "qs": [
   [
    "積累與條件",
    "善假於物的假較接近？",
    [
     "借助外物條件",
     "只用虛假資料",
     "完全不憑工具"
    ],
    0,
    1
   ],
   [
    "後天人為",
    "其善者偽也的偽在本段指？",
    [
     "所有善行都是騙局",
     "後天人為的學習教化",
     "天生不用學"
    ],
    1,
    2
   ],
   [
    "積累與條件",
    "同起點兩人，一人借工具且逐日練習，可如何用生非異、善假於物解釋？",
    [
     "可以，跳遠就是全部學問",
     "可以，踏石是荀子原有實驗",
     "差異應看借助條件與積累，不只歸於天生資質"
    ],
    2,
    1
   ],
   [
    "後天人為",
    "反覆練習後仍須區分什麼？",
    [
     "操作熟練與禮義教化的論述層次",
     "遊戲成功就等於所有人道德相同",
     "偽在此必是欺騙他人"
    ],
    0,
    2
   ],
   [
    "積累與條件",
    "不積跬步，無以至千里強調？",
    [
     "跳過小步才有效",
     "逐步累積是到達的條件",
     "每人必須走同一條路"
    ],
    1,
    1
   ],
   [
    "後天人為",
    "化性而起偽之後，原文接著談？",
    [
     "君子完全不需學習",
     "只要跳得遠就有禮義",
     "人為產生禮義、進而制法度"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz07_hanbio",
  "name": "韓非・初階人物",
  "title": "書諫疊影",
  "mechanic": "overlay",
  "stage": 1,
  "recommended": [
   "precise",
   "trace"
  ],
  "role": "書諫整讀者",
  "rule": "拖動三張半透明文牘片，使各自四個準點與底本對齊，再驗讀。幾何對齊不會替韓非改寫進諫與入秦的遭遇。",
  "person": "hanfei",
  "level": "bio",
  "quotes": [
   [
    "《史記・老子韓非列傳》",
    "韓非者，韓之諸公子也。喜刑名法術之學，而其歸本於黃老。……與李斯俱事荀卿。"
   ],
   [
    "《史記・老子韓非列傳》",
    "韓非見韓之削弱，數以書諫韓王，韓王不能用。……故作孤憤、五蠹、內外儲、說林、說難十餘萬言。"
   ],
   [
    "《史記・老子韓非列傳》",
    "秦王悅之，未信用。……李斯使人遺非藥，使自殺。韓非欲自陳，不得見。"
   ]
  ],
  "qs": [
   [
    "著述處境",
    "數以書諫韓王，韓王不能用寫出？",
    [
     "多次書面進諫而未被採用",
     "韓王早已全部採行",
     "韓非從不關心韓國"
    ],
    0,
    1
   ],
   [
    "權力條件",
    "欲自陳，不得見交代？",
    [
     "已長期任秦相",
     "想申辯卻無法見秦王",
     "已平安回韓著書"
    ],
    1,
    2
   ],
   [
    "著述處境",
    "秦王悅之，未信用，欣賞與任用有何差別？",
    [
     "字跡清楚等於主張全被採納",
     "拼圖已取消韓王權力",
     "表示欣賞，不等於已信任任用本人"
    ],
    2,
    2
   ],
   [
    "權力條件",
    "理解說服知識與實際結局時，應留意？",
    [
     "能否表達還受權力與接見條件限制",
     "只要有著作就能安全申辯",
     "遊戲高分表示韓非在秦長期任相"
    ],
    0,
    2
   ],
   [
    "著述處境",
    "數以書諫的數是？",
    [
     "章節編號",
     "屢次、多次",
     "只限一次"
    ],
    1,
    1
   ],
   [
    "權力條件",
    "不得見的得在此表示？",
    [
     "得到一張獎狀",
     "獲得全部信任",
     "能夠得到接見"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz08_hanread",
  "name": "韓非・進階思想",
  "title": "名實稽核",
  "mechanic": "audit",
  "stage": 2,
  "recommended": [
   "precise",
   "plan"
  ],
  "role": "實測核驗者",
  "rule": "對三臺工序各做至少兩種不同試驗，依公開六種假設表辨認其實測型態，再記錄核對。取樣次數有限，名號不能代替結果。",
  "person": "hanfei",
  "level": "read",
  "quotes": [
   [
    "《韓非子・說難》",
    "凡說之難，在知所說之心，可以吾說當之。"
   ],
   [
    "《韓非子・二柄》",
    "明主之所導制其臣者，二柄而已矣。二柄者，刑、德也。何謂刑德？曰：殺戮之謂刑，慶賞之謂德。"
   ],
   [
    "《韓非子・定法》",
    "術者，因任而授官，循名而責實，操殺生之柄，課群臣之能者也，此人主之所執也。法者，憲令著於官府……此臣之所師也。"
   ]
  ],
  "qs": [
   [
    "名實核對",
    "循名而責實要求？",
    [
     "按職責考核實際表現",
     "只聽自稱能幹",
     "漂亮文書取代成果"
    ],
    0,
    2
   ],
   [
    "刑德語義",
    "二柄中的德由原文限定為？",
    [
     "所有美德的總稱",
     "慶賞",
     "關愛所有人的情感"
    ],
    1,
    1
   ],
   [
    "名實核對",
    "官名與所報績效漂亮，實績卻不合，循名責實要求？",
    [
     "用了法字就已具全部權利保障",
     "工序測過便可取消責任",
     "依職分核實成果，不能只聽聲稱"
    ],
    2,
    2
   ],
   [
    "刑德語義",
    "核驗概念時，不能把同字一律套成同義，因為？",
    [
     "語境明確以慶賞說明此處德的內容",
     "字典只有一個德義",
     "德從未在原文獲解釋"
    ],
    0,
    1
   ],
   [
    "名實核對",
    "憲令著於官府較直接說明？",
    [
     "所有手段都完全公開",
     "法令公布於官府供依循",
     "官名永不需要核對"
    ],
    1,
    2
   ],
   [
    "刑德語義",
    "二柄者，刑、德也是如何說明二柄？",
    [
     "宣告兩項家庭倫理",
     "兩把真實兵器的重量",
     "解釋控制手段的兩項內容"
    ],
    2,
    1
   ]
  ]
 },
 {
  "id": "S_zz09_mobio",
  "name": "墨子・初階人物",
  "title": "墨線承重",
  "mechanic": "truss",
  "stage": 2,
  "recommended": [
   "plan",
   "precise"
  ],
  "role": "守備結構者",
  "rule": "以八根桿連接六個節點。兩個底座固定，上方節點須連到兩個更低且已穩固的支點，形成不扁平的三角支撐。使頂部承重點穩固；這是集體守備的工藝推演。",
  "person": "mozi",
  "level": "bio",
  "quotes": [
   [
    "《史記・孟子荀卿列傳》",
    "蓋墨翟，宋之大夫，善守禦，為節用。或曰並孔子時，或曰在其後。"
   ],
   [
    "《墨子・公輸》",
    "公輸盤為楚造雲梯之械，成，將以攻宋。子墨子聞之，起於齊，行十日十夜而至於郢。"
   ],
   [
    "《墨子・公輸》",
    "公輸盤九設攻城之機變，子墨子九距之。……臣之弟子禽滑釐等三百人，已持臣守圉之器，在宋城上而待楚寇矣。"
   ]
  ],
  "qs": [
   [
    "史料界線",
    "或曰並孔子時，或曰在其後表現？",
    [
     "保留不同年代傳述",
     "毫無爭議的精確生日",
     "墨子生活於唐代"
    ],
    0,
    0
   ],
   [
    "集體守備",
    "弟子已持守圉之器在宋城，支持什麼？",
    [
     "只需個人辯才",
     "止攻還有集體實際準備",
     "公輸盤已是宋王"
    ],
    1,
    2
   ],
   [
    "史料界線",
    "八桿承重模型能補足墨子的確定年表嗎？",
    [
     "能，八根桿就是八個年代",
     "能，橋高可換算生日",
     "不能，模型不消除或曰的知識界線"
    ],
    2,
    0
   ],
   [
    "集體守備",
    "若只讚美墨子個人，會漏讀？",
    [
     "禽滑釐等門人已集體準備守備",
     "宋城上並無任何準備",
     "攻械盡就是宋已攻占楚國"
    ],
    0,
    2
   ],
   [
    "史料界線",
    "蓋墨翟，宋之大夫中的人物名是？",
    [
     "孟軻",
     "墨翟",
     "荀況"
    ],
    1,
    0
   ],
   [
    "集體守備",
    "守圉之器的圉在此通向何義？",
    [
     "宮殿娛樂",
     "文學諷刺",
     "防禦守備"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz10_moread",
  "name": "墨子・進階思想",
  "title": "兼愛解結",
  "mechanic": "untangle",
  "stage": 0,
  "recommended": [
   "precise",
   "trace"
  ],
  "role": "互利連結者",
  "rule": "拖動八個人物結點，保留全部關聯線，使線路不相交、人物不擠疊。沒有任何群體可以刪掉；解結的形式不等於已證明現實政策成效。",
  "person": "mozi",
  "level": "read",
  "quotes": [
   [
    "《墨子・兼愛中》",
    "夫愛人者，人亦從而愛之；利人者，人亦從而利之。……當兼相愛，交相利，此聖王之法，天下之治道也。"
   ],
   [
    "《墨子・非攻上》",
    "今至大為不義攻國，則弗知非，從而譽之，謂之義。此可謂知義與不義之別乎？"
   ],
   [
    "《墨子・公輸》",
    "吾義固不殺人。……義不殺少而殺眾，不可謂知類。……公輸盤之攻械盡，子墨子之守圉有餘。"
   ]
  ],
  "qs": [
   [
    "關愛互利",
    "兼相愛，交相利強調？",
    [
     "關愛與助益擴及他人",
     "只有自己群體能得利",
     "任何利益都應消滅"
    ],
    0,
    0
   ],
   [
    "尺度一致",
    "面對攻國之不義卻從而譽之、謂之義，作者批評什麼？",
    [
     "小事都不需評價",
     "把不義的攻國稱作義，混淆義與不義",
     "只要規模大就正義"
    ],
    1,
    1
   ],
   [
    "關愛互利",
    "援助只給己方而排除陌生人，兼愛互利會反省什麼？",
    [
     "線不交就能保證所有政策成功",
     "人物可因陌生而刪掉",
     "關愛與助益的範圍過窄，沒有推及他人"
    ],
    2,
    0
   ],
   [
    "尺度一致",
    "義不殺少而殺眾，不可謂知類指出？",
    [
     "沒有對同類侵害用一致判準",
     "國家只需比版圖大小",
     "勝負本來就能替代義不義"
    ],
    0,
    2
   ],
   [
    "關愛互利",
    "交相的交在此偏向？",
    [
     "交出所有財產",
     "相互、彼此",
     "只許單向"
    ],
    1,
    0
   ],
   [
    "尺度一致",
    "此可謂知義與不義之別乎採何語氣？",
    [
     "單純詢問城池數量",
     "完全肯定攻國為義",
     "反問，揭露判準矛盾"
    ],
    2,
    1
   ]
  ]
 },
 {
  "id": "S_zz11_mengbio",
  "name": "孟子・初階人物",
  "title": "七篇工序",
  "mechanic": "schedule",
  "stage": 2,
  "recommended": [
   "plan",
   "foresight"
  ],
  "role": "門人編校者",
  "rule": "在抄錄與校讀兩條工序中拖動篇件次序；同一本必須先抄後校、每一站一次只能做一件。計算到全部完成不超過十一刻；時間是自編排程刻度。",
  "person": "mengzi",
  "level": "bio",
  "quotes": [
   [
    "《史記・孟子荀卿列傳》",
    "孟軻，騶人也。受業子思之門人。"
   ],
   [
    "《史記・孟子荀卿列傳》",
    "道既通，游事齊宣王，宣王不能用。適梁，梁惠王不果所言，則見以為迂遠而闊於事情。"
   ],
   [
    "《史記・孟子荀卿列傳》",
    "退而與萬章之徒序詩書，述仲尼之意，作孟子七篇。"
   ]
  ],
  "qs": [
   [
    "傳記中的評價",
    "見以為迂遠而闊於事情屬於？",
    [
     "當時人對主張的一種評價",
     "孟子的名字",
     "要求所有後人照單全收"
    ],
    0,
    1
   ],
   [
    "著述與門人",
    "退而與萬章之徒…作孟子七篇呈現？",
    [
     "孟子從不整理文字",
     "與門人整理傳述、著述的活動",
     "韓非在秦替孟子寫書"
    ],
    1,
    2
   ],
   [
    "傳記中的評價",
    "遊說不能用後，退而與萬章之徒作七篇，呈現何種轉變？",
    [
     "能，工作刻度就是政治效果",
     "能，校書快就使齊王採用全部政策",
     "政治主張未獲採用後，轉向整理傳述與著述"
    ],
    2,
    2
   ],
   [
    "著述與門人",
    "把抄校各自安排好，較能照應文本哪層？",
    [
     "著述傳承包含與門人的整理工作",
     "原文列出每篇抄錄工時",
     "七篇就是七臺真實機器"
    ],
    0,
    2
   ],
   [
    "傳記中的評價",
    "宣王不能用與梁惠王不果所言共同指出？",
    [
     "孟子沒有任何思想",
     "主張未獲充分採用的處境",
     "他已兼相兩國"
    ],
    1,
    1
   ],
   [
    "著述與門人",
    "萬章之徒的徒在此是？",
    [
     "只有步行者",
     "囚犯",
     "門人、弟子之眾"
    ],
    2,
    2
   ]
  ]
 },
 {
  "id": "S_zz12_mengread",
  "name": "孟子・進階思想",
  "title": "推恩護車",
  "mechanic": "escort",
  "stage": 2,
  "recommended": [
   "steady",
   "swift"
  ],
  "role": "外援護送者",
  "rule": "三輛護送車的路線在中間交會。點車放行或停車，觀察實際車距避免碰撞，再在終點接收三組外援；不同來處都須照應。車速不評量學生品德。",
  "person": "mengzi",
  "level": "read",
  "quotes": [
   [
    "《孟子・梁惠王上》",
    "王何必曰利？亦有仁義而已矣。……上下交征利，而國危矣。"
   ],
   [
    "《孟子・公孫丑上》",
    "今人乍見孺子將入於井，皆有怵惕惻隱之心。……惻隱之心，仁之端也。"
   ],
   [
    "《孟子・梁惠王上》",
    "老吾老，以及人之老；幼吾幼，以及人之幼。……推恩足以保四海，不推恩無以保妻子。"
   ]
  ],
  "qs": [
   [
    "推恩範圍",
    "老吾老，以及人之老中的以及表示？",
    [
     "由自己親長推及他人親長",
     "只准照顧同姓者",
     "先取消所有親情"
    ],
    0,
    2
   ],
   [
    "善端與培養",
    "仁之端的端指？",
    [
     "已完成全部德行",
     "可培養擴充的開端",
     "官位與血統"
    ],
    1,
    1
   ],
   [
    "推恩範圍",
    "只照顧自家長者而拒絕其他長者，與以及的方向何異？",
    [
     "關懷須照應不同來處",
     "具體實施要考慮路況與風險",
     "親長是關懷的起點，仍須推及他人的親長"
    ],
    2,
    2
   ],
   [
    "善端與培養",
    "護車操作速度為何不能當學生道德分數？",
    [
     "原文談向善開端及擴充，操作模型不等於品德評定",
     "反應快者一定具完整德行",
     "只要感動一次就無須關懷"
    ],
    0,
    1
   ],
   [
    "推恩範圍",
    "不推恩無以保妻子中的妻子指？",
    [
     "只指現代配偶",
     "妻與子女",
     "所有官員職名"
    ],
    1,
    2
   ],
   [
    "善端與培養",
    "乍見孺子將入於井中的乍是？",
    [
     "每天按表重演",
     "完成十年研究後",
     "突然、乍然"
    ],
    2,
    1
   ]
  ]
 }
];
const PILOTS=rows.map(r=>({id:r.id,name:r.name,title:r.title,role:r.role,mechanic:r.mechanic,node:'stage-'+r.stage,stage:r.stage,point:'第'+(r.stage+1)+'幕原遊戲前',recommended:r.recommended,rule:r.rule,kind:'zhuzi',scene:'scene:zhuzi_'+r.person,source:r.quotes[0][0],quote:r.quotes[0][1],brief:'以自己的角色完成「'+r.title+'」；此為自編同行，不更改三幕原遊戲、人物傳述或原文判斷。',after:'同行模型完成。請回到原三幕及原典，操作結果不改史傳結局、原遊戲成績與首次閱讀作答。'}));
function optionOrder(id,index,count){let seed=2166136261;for(const ch of id+':'+index)seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;const order=Array.from({length:count},(_,i)=>i);for(let i=count-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;}
const CHAPTERS=Object.fromEntries(rows.map(r=>{const qs=r.qs.map((a,n)=>{const order=optionOrder(r.id,n,a[2].length);return{id:'zz-'+(n<2?'e':n<4?'f':'r')+(n%2+1),tag:a[0],prompt:a[1],choices:order.map(i=>a[2][i]),answer:order.indexOf(a[3]),evidence:r.quotes.map((q,i)=>({id:'quote'+i,text:q[1]+'（'+q[0]+'）'})),correctEvidence:'quote'+a[4],explain:'本題讀「'+a[0]+'」：'+a[2][a[3]]+'。原文依據是「'+r.quotes[a[4]][1]+'」（'+r.quotes[a[4]][0]+'）；'+(n>=4?'把詞義及推論範圍放回此處語境，不能憑遊戲成績改寫。':'人物傳述、思想論證與自編模型應分別核對。'),...(n>=4?{tags:[a[0]]}:{})};});return[r.id,{title:r.title,intro:PILOTS.find(p=>p.id===r.id).brief,evidence:qs.slice(0,2),reflection:qs.slice(2,4),remedy:qs.slice(4)}];}));
const skillNames={swift:'迅影',steady:'握定',precise:'巧勁',foresight:'望勢',listen:'聽息',light:'輕裝',plan:'運籌',trace:'留痕'};
const allowed={lift:['swift','steady','precise','foresight','listen','light','plan','trace'],hollow:['precise','listen','light','plan','trace'],lacquer:['steady','precise','listen','plan','trace'],lens:['steady','precise','foresight','listen','light','plan','trace'],memory:['foresight','listen','plan','trace'],leap:['swift','steady','precise','foresight','listen','light','plan','trace'],overlay:['precise','listen','light','plan','trace'],audit:['precise','listen','plan','trace'],truss:['precise','listen','light','plan','trace'],untangle:['precise','listen','light','plan','trace'],schedule:['precise','foresight','listen','light','plan','trace'],escort:['swift','steady','listen','light','plan','trace']};
const SKILL_DESCRIPTIONS={swift:'迅影：升架與飛渡的落點餘裕加寬；護車時安全判定半徑暫減二。',steady:'握定：升架、落刷、對焦與飛渡有額外容差；護車取得一次碰撞緩衝。',precise:'巧勁：提供器用、疊影、試驗、桁架、解結與工序的局部核對；動作任務增加精細容差。',foresight:'望勢：顯示下一次升架低位與未來魚位、踏石；習藝示範每格延長四成；工序可預覽後續時段。',listen:'聽息：先靜候兩秒，八秒內一次操作誤判不扣品質；操作不會因此自動成功。',light:'輕裝：同行操作多十二次餘裕，升架對車位置增加三格容差；總時限少二十五秒。',plan:'運籌：補充十二次操作、兩次核驗；追譜多一次重播、稽核多兩次取樣。',trace:'留痕：記下當前盤面與進度，供自己對照；不提供未觀察的追譜串或閱讀答案。'};
function pilot(w){return PILOTS.find(p=>p.id===(typeof w==='string'?w:w.id));}
function compatible(c,id){const p=pilot(id);return !!p&&Array.isArray(c.skills)&&c.skills.every(k=>allowed[p.mechanic].includes(k));}
function limit(c){return 360+c.stats.focus*8-(c.skills.includes('light')?25:0);}
function routes(id){const p=pilot(id);return[{id:'companion',name:p.title,brief:p.rule,build:'臂力、巧手與籌算增加操作餘裕；身法協助定位，察勢延長觀測，定力增加時間。',tradeoff:'能力只改同行操作的餘裕，不替你回答原文或抹去傳述的不確定性。'}];}
const active=(w,id)=>(w.buffs[id]||0)>w.time;
function adjacent(a,b,cols=6,total=36){return integer(b,0,total-1)&&Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols))===1;}
function close(a,b,tolerance){return Math.abs(a-b)<=tolerance;}
const protectedCells=Array.from({length:36},(_,i)=>i).filter(i=>(i<6||i>=30||i%6===0||i%6===5)&&![2,32].includes(i));
function cavity(g){const cut=g.cut.map((x,i)=>x?i:-1).filter(i=>i>=0),seen=new Set(),q=[];if(g.cut[2]){seen.add(2);q.push(2);}for(let at=0;at<q.length;at++)for(const i of cut)if(!seen.has(i)&&adjacent(q[at],i)){seen.add(i);q.push(i);}const square=cut.some(i=>i%6<5&&i<30&&[i,i+1,i+6,i+7].every(j=>g.cut[j])),column=cut.some(i=>i<24&&[i,i+6,i+12].every(j=>g.cut[j]));return{cut,connected:[...seen],square,column};}
function pattern(w,round=w.campaign.round){let n=(w.seed+round*97)>>>0;return Array.from({length:3+round},(_,i)=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return (n+i)%9;});}
const catalog=[{name:'按式完成',signature:[0,0,0]},{name:'中後段延滯',signature:[0,1,1]},{name:'首末段偏差',signature:[1,0,1]},{name:'前兩段偏差',signature:[1,1,0]},{name:'首末段重偏',signature:[2,0,2]},{name:'前兩段重偏',signature:[2,2,0]}];
const trussNodes=[{x:50,y:10,anchored:false},{x:25,y:43,anchored:false},{x:75,y:43,anchored:false},{x:12,y:92,anchored:true},{x:88,y:92,anchored:true},{x:50,y:73,anchored:false}];
const beamCandidates=[[0,1],[0,2],[0,5],[0,3],[0,4],[1,2],[1,3],[1,5],[1,4],[2,3],[2,4],[2,5],[3,4],[3,5],[4,5]];
function trussSupport(g){const supported=new Set([3,4]);for(const i of [5,1,2,0]){const lower=g.beams.flatMap(([a,b])=>a===i?[b]:b===i?[a]:[]).filter(j=>supported.has(j)&&trussNodes[j].y>trussNodes[i].y);let stable=false;for(const a of lower)for(const b of lower){if(a===b)continue;const n=trussNodes[i],p=trussNodes[a],q=trussNodes[b],area=Math.abs((p.x-n.x)*(q.y-n.y)-(p.y-n.y)*(q.x-n.x));if(area>=250&&n.x>=Math.min(p.x,q.x)-1&&n.x<=Math.max(p.x,q.x)+1)stable=true;}if(stable)supported.add(i);}return[...supported];}
const webEdges=Array.from({length:8},(_,i)=>[i,(i+1)%8]).concat([[0,2],[2,4],[4,6],[6,0]]);
function orient(a,b,c){return(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function crossing(a,b,c,d){const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);const between=(p,q,r)=>Math.abs(orient(p,q,r))<1e-7&&r.x>=Math.min(p.x,q.x)-1e-7&&r.x<=Math.max(p.x,q.x)+1e-7&&r.y>=Math.min(p.y,q.y)-1e-7&&r.y<=Math.max(p.y,q.y)+1e-7;return(o1*o2<0&&o3*o4<0)||between(a,b,c)||between(a,b,d)||between(c,d,a)||between(c,d,b);}
function webCrossings(nodes){const out=[];for(let a=0;a<webEdges.length;a++)for(let b=a+1;b<webEdges.length;b++){const e=webEdges[a],f=webEdges[b];if(e.some(x=>f.includes(x)))continue;if(crossing(nodes[e[0]],nodes[e[1]],nodes[f[0]],nodes[f[1]]))out.push([a,b]);}return out;}
const jobs=[{name:'民情問答',write:2,review:1},{name:'經典引文',write:1,review:3},{name:'門人札記',write:3,review:2},{name:'篇章校目',write:2,review:1}];
function timeline(g){const scribe=[],review=[],ready={},end={scribe:0,review:0};for(const job of g.orders.scribe){const start=end.scribe,finish=start+jobs[job].write;scribe.push({job,start,end:finish});ready[job]=finish;end.scribe=finish;}for(const job of g.orders.review){const start=Math.max(end.review,ready[job]),finish=start+jobs[job].review;review.push({job,start,end:finish});end.review=finish;}return{scribe,review,makespan:end.review};}
const roads=[{from:{x:5,y:50},to:{x:95,y:50}},{from:{x:50,y:5},to:{x:50,y:95}},{from:{x:8,y:8},to:{x:92,y:92}}];
function escortPositions(w,time=w.time){return w.campaign.carts.map((c,i)=>{const progress=clamp(c.progress+(c.go?(time-c.at)*20:0),0,100),r=roads[i];return{x:r.from.x+(r.to.x-r.from.x)*progress/100,y:r.from.y+(r.to.y-r.from.y)*progress/100,progress,go:c.go};});}
function scene(w){const g=w.campaign,s=w.snapshot.config.stats,k=g.mechanic;
 if(k==='lift'){const platformY=50-50*Math.cos(w.time*Math.PI/3),tolerance=6+s.dexterity*.3+(active(w,'steady')?4:0)+(active(w,'precise')?3:0)+(active(w,'swift')?2:0),cartTolerance=5+(w.snapshot.config.skills.includes('light')?3:0);return{platformY,shelfY:[20,50,80],tolerance,canBoard:!g.onLift&&g.cargo&&close(g.cartX,50,cartTolerance)&&platformY<=tolerance,canLeave:g.onLift&&close(platformY,[20,50,80][g.shelf],tolerance),wareX:10,liftX:50,cartTolerance};}
 if(k==='hollow')return{cols:6,total:36,ports:[2,32],protected:protectedCells,maxCut:10,tests:[{kind:'connect',label:'兩口及全部中空相連'},{kind:'square',width:2,height:2,label:'容納二乘二物件'},{kind:'column',length:3,label:'容納三格長柄'}]};
 if(k==='lacquer'){const angle=(w.time*.85+w.seed*.2)%(Math.PI*2),currentSector=Math.floor(angle/(Math.PI/4));return{angle,currentSector,requiredRadius:Array.from({length:8},(_,i)=>25+((i+w.seed)%5)*10),requiredPressure:Array.from({length:8},(_,i)=>1+(i+w.seed)%3),dryUntil:g.dryUntil,canCoat:w.time>=g.dryUntil&&!g.coated[currentSector],tolerance:7+s.dexterity*.5+(active(w,'precise')?4:0)+(active(w,'steady')?3:0)};}
 if(k==='lens'){const fishX=50+30*Math.sin(w.time*.7),depth=40+10*Math.cos(w.time*.5),cameras=[{x:10,y:90},{x:50,y:90},{x:90,y:90}],visible=[fishX>=35,fishX<=70,depth<=45][g.camera],camera=cameras[g.camera];return{fishX,depth,cameras,visible,focusTarget:Math.hypot(fishX-camera.x,depth-camera.y),tolerance:6+s.dexterity*.6+(active(w,'precise')?5:0)+(active(w,'steady')?3:0)};}
 if(k==='memory'){const length=3+g.round,duration=g.duration,elapsed=g.previewAt===null?-1:w.time-g.previewAt,index=Math.floor(elapsed/duration);return{cols:3,cue:g.phase==='preview'&&index>=0&&index<length?pattern(w)[index]:null,patternLength:length,previewEnd:g.previewAt===null?null:g.previewAt+duration*length,duration};}
 if(k==='leap'){const duration=g.flight?g.flight.duration:(active(w,'swift')?1:1.2),landAt=g.flight?g.flight.at+duration:w.time+duration,at=(i,t)=>5+i*18+(i?Math.sin(t*.8+i)*2:0),platforms=Array.from({length:6},(_,i)=>({x:at(i,w.time),y:20,width:10})),wind=(w.seed+g.platform)%3-1,ratio=g.flight?clamp((w.time-g.flight.at)/duration,0,1):0,character=g.flight?{x:g.x+(10+g.flight.power*.2+g.flight.wind)*ratio,y:20+Math.sin(Math.PI*ratio)*25}:{x:g.x,y:20};return{platforms,character,landingTarget:at(Math.min(5,g.platform+1),landAt),wind,duration,tolerance:g.flight?g.flight.tolerance:4+s.agility*.3+s.dexterity*.2+(active(w,'precise')?3:0)+(active(w,'steady')?2:0),canLand:!!g.flight&&w.time>=landAt};}
 return sceneRest(w);
}
function sceneRest(w){const g=w.campaign,k=g.mechanic;
 if(k==='overlay'){const reference=[{x:1,y:1},{x:3,y:1},{x:1,y:3},{x:2,y:4}];return{size:6,reference,sheets:Array.from({length:3},(_,i)=>{const dx=(w.seed+i)%3-1,dy=(w.seed+i*2+1)%3-1;return{points:reference.map(p=>({x:p.x+dx,y:p.y+dy})),color:['#e6b953','#69b1c9','#c387ac'][i],label:['進諫稿','著述目','處境記'][i]};}),bounds:[-3,3]};}
 if(k==='audit')return{stations:['任務甲','任務乙','任務丙'],inputs:['首段試驗','中段試驗','末段試驗'],catalog:copy(catalog)};
 if(k==='truss')return{nodes:copy(trussNodes),candidates:copy(beamCandidates),load:0,maxBeams:8,minArea:250,requireBracket:true,supportRule:'上點須位於兩支點的橫向範圍內；叉積面積至少250，且兩支點更低、已穩固。',supported:trussSupport(g)};
 if(k==='untangle')return{edges:copy(webEdges),crossings:webCrossings(g.nodes),minDistance:16,maxLength:90,bounds:[5,95]};
 if(k==='schedule')return{jobs:copy(jobs),timeline:timeline(g),deadline:11};
 if(k==='escort'){const carts=escortPositions(w);return{carts,speed:20,collisionRadius:Math.max(4,7-w.snapshot.config.stats.agility*.15)-(active(w,'swift')?2:0),roads:copy(roads),canReceive:carts.map((c,i)=>c.progress>=100&&!g.arrived[i])};}
 return{};
}
function initial(w){const s=w.snapshot.config.stats,k=pilot(w).mechanic,g={version:1,mechanic:k,log:[],errors:0,spent:0,done:false,budget:140+s.planning*6+s.strength*2+s.dexterity+(w.snapshot.config.skills.includes('light')?12:0),checks:0,maxChecks:8+Math.floor(s.insight/2),held:false,misses:0,maxMisses:5+Math.floor(s.strength/2)};
 if(k==='lift')Object.assign(g,{cartX:10,shelf:0,delivered:[],onLift:false,cargo:false});
 if(k==='hollow')Object.assign(g,{cut:Array(36).fill(false),cuts:0});
 if(k==='lacquer')Object.assign(g,{radius:50,pressure:1,coated:Array(8).fill(false),dryUntil:0});
 if(k==='lens')Object.assign(g,{camera:0,focus:50,photos:[]});
 if(k==='memory')Object.assign(g,{round:0,phase:'idle',previewAt:null,duration:.65,recall:[],replays:0,maxReplays:7+Math.floor(s.insight/2),observations:[]});
 if(k==='leap')Object.assign(g,{platform:0,x:5,charge:50,flight:null,landings:[]});
 if(k==='overlay')Object.assign(g,{layers:Array.from({length:3},()=>({x:0,y:0})),moves:0});
 if(k==='audit')Object.assign(g,{samples:[],findings:[null,null,null],tests:0,maxTests:8+Math.floor(s.planning/2)});
 if(k==='truss')Object.assign(g,{beams:[]});
 if(k==='untangle')Object.assign(g,{nodes:Array.from({length:8},(_,i)=>{const order=[0,4,1,5,2,6,3,7][i],a=(order+w.seed%8)*Math.PI/4;return{x:Math.round(50+36*Math.cos(a)),y:Math.round(50+36*Math.sin(a))};}),moves:0});
 if(k==='schedule')Object.assign(g,{orders:{scribe:[0,1,2,3],review:[3,2,1,0]},moves:0});
 if(k==='escort')Object.assign(g,{carts:Array.from({length:3},()=>({progress:0,go:false,at:0})),arrived:[false,false,false],collisions:0,incidents:[],checkedAt:0,guard:0});
 return g;
}
function advanceEscort(w){const g=w.campaign;if(g.mechanic!=='escort')return;const at=g.checkedAt,end=w.time,steps=Math.max(1,Math.ceil((end-at)/.025));for(let n=0;n<=steps;n++){const time=at+(end-at)*n/steps,p=escortPositions(w,time),radius=Math.max(4,7-w.snapshot.config.stats.agility*.15)-(active({...w,time},'swift')?2:0);for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){const key=a+'-'+b;if(g.incidents.includes(key)||g.arrived[a]||g.arrived[b]||p[a].progress<=0||p[a].progress>=100||p[b].progress<=0||p[b].progress>=100)continue;if(Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y)<radius){g.incidents.push(key);if(g.guard>0){g.guard--;w.notice='握定緩衝護住一次護車碰撞；仍須安排路權。';}else{g.collisions++;g.errors++;w.errors=g.errors;w.notice='護送車在交會處相碰，先停車讓出安全距離。';}}}}const positions=escortPositions(w);g.carts=g.carts.map((c,i)=>({...c,progress:positions[i].progress,at:w.time}));g.checkedAt=w.time;if(g.collisions>=3)w.status='lost';}
function candidatesFor(g,station){const samples=g.samples.filter(x=>x.station===station);return catalog.map((_,i)=>i).filter(type=>samples.every(s=>catalog[type].signature[s.input]===s.output));}
function uiHints(w){const g=w.campaign,k=g.mechanic,a=scene(w),out=[];
 if(active(w,'foresight')){if(k==='lift'){const nextLow=Math.ceil(w.time/6)*6;out.push('下一次低位約在 '+nextLow.toFixed(1)+' 秒；本架高度 '+a.shelfY[g.shelf]+'。');}else if(k==='lens'){const t=w.time+1;out.push('一秒後魚的橫位約 '+(50+30*Math.sin(t*.7)).toFixed(1)+'、深位 '+(40+10*Math.cos(t*.5)).toFixed(1)+'；只預測可見形態。');}else if(k==='memory')out.push('望勢示範已加長：下一次開始時每格亮起時間多四成，仍須親自觀察。');else if(k==='leap'){const next=Math.min(5,g.platform+2),t=w.time+a.duration*2;out.push('再下一塊踏石在 '+t.toFixed(1)+' 秒的預估中心 '+(5+next*18+Math.sin(t*.8+next)*2).toFixed(1)+'；下跳風偏 '+((w.seed+g.platform+1)%3-1)+'，可先規劃連續落點。');}else if(k==='schedule'){const alternative={orders:{scribe:g.orders.scribe.slice(1).concat(g.orders.scribe[0]),review:g.orders.review.slice()}};out.push('試想把抄錄首篇移到最後，校讀次序不動：預估總工序 '+timeline(alternative).makespan+' 刻（目前 '+a.timeline.makespan+' 刻）；只是比較預演，尚未替你更動排程。');}else out.push(pilot(w).rule);}
 if(active(w,'precise')){if(k==='hollow'){const c=cavity(g);out.push('中空 '+c.cut.length+' 格；入口相連 '+c.connected.length+' 格；二乘二'+(c.square?'可容':'未可')+'、三格長柄'+(c.column?'可容':'未可')+'。');}else if(k==='overlay'){out.push('各紙已對準點數：'+a.sheets.map((s,i)=>s.points.filter(p=>a.reference.some(q=>q.x===p.x+g.layers[i].x&&q.y===p.y+g.layers[i].y)).length).join('／')+'，每紙需四點全合。');}else if(k==='audit')out.push('依已做試驗，各臺剩下可能型態數：'+[0,1,2].map(i=>candidatesFor(g,i).length).join('／')+'；尚未取樣不會替你判型。');else if(k==='truss')out.push('已穩固節點：'+a.supported.join('、')+'；每個上節需兩個更低且已穩固的支點。');else if(k==='untangle'){let tight=0;for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(Math.hypot(g.nodes[i].x-g.nodes[j].x,g.nodes[i].y-g.nodes[j].y)<a.minDistance)tight++;out.push('相交 '+a.crossings.length+' 處；人物距離不足 '+tight+' 對，不能用重疊結點掩蓋交線。');}else if(k==='schedule'){const idle=a.timeline.review.reduce((n,x,i)=>n+x.start-(i?a.timeline.review[i-1].end:0),0);out.push('校讀等待累計 '+idle+' 刻；調整次序仍須保留同篇先抄後校。');}else if(k==='memory')out.push('本輪需記 '+a.patternLength+' 點，已答 '+g.recall.length+' 點；不提供尚未觀察的亮點串。');else if(k==='escort')out.push('三車進度：'+a.carts.map(c=>c.progress.toFixed(1)).join('／')+'；中段交會，先觀察再放行。');else out.push('精細操作容差已加寬，請以畫面目前位置核對。');}
 if(active(w,'steady'))out.push(k==='escort'?'握定：碰撞緩衝尚有 '+g.guard+' 次；仍須安排交會路權。':'握定：本任務定位、落刷或落點容差已暫時擴大。');if(active(w,'swift'))out.push(k==='escort'?'迅影：護送交會安全判定半徑暫減二。':'迅影：升架落點或飛渡的操作餘裕已暫時擴大。');if(active(w,'listening'))out.push('聽息：先靜候兩秒，八秒內一次誤判可免品質扣分。');if(w.trace)out.push('留痕：'+w.trace.summary);return out;
}
function skill(w,id){const g=w.campaign;if(!w.snapshot.config.skills.includes(id)||id==='light'||(w.uses[id]||0)>=2||w.time<(w.cooldowns[id]||0))return false;advanceEscort(w);if(w.status==='lost')return true;w.uses[id]=(w.uses[id]||0)+1;w.cooldowns[id]=w.time+10;if(id==='trace')w.trace={mechanic:g.mechanic,at:w.time,summary:summary(w),board:copy(Object.fromEntries(Object.entries(g).filter(([k])=>k!=='log')))};else if(id==='plan'){g.budget+=12;g.maxChecks+=2;if(g.mechanic==='memory')g.maxReplays++;if(g.mechanic==='audit')g.maxTests+=2;}else if(id==='listen'){w.buffs.listening=w.time+8;g.held=true;}else{w.buffs[id]=w.time+(id==='foresight'?Math.min(18,10+w.snapshot.config.stats.insight):8);if(id==='steady'&&g.mechanic==='escort')g.guard++;}w.notice='已使用'+skillNames[id]+'；仍須自行操作與判讀原文。';return true;}
function reduce(w,name,v){const g=w.campaign,k=g.mechanic;let failed=false;const fail=(text,risk=false)=>{failed=true;if(risk){g.misses++;if(g.misses>=g.maxMisses)w.status='lost';}if(g.held&&active(w,'listening')){g.held=false;w.notice='聽息重整：'+text;return true;}g.errors++;w.errors=g.errors;w.notice=text;return true;},check=()=>{if(g.checks>=g.maxChecks)return false;g.checks++;return true;};
 if(name==='skill')return skill(w,v);
 if(g.spent>=g.budget)return fail('操作餘裕已用完，可用運籌補充或重新規劃。');
 if(k==='lift'&&name==='moveCart'&&Number.isFinite(v)&&v>=0&&v<=100){if(g.onLift)return false;g.cartX=Math.round(v*100)/100;}
 else if(k==='lift'&&name==='loadScroll'){const a=scene(w);if(g.cargo||g.onLift)return false;if(!close(g.cartX,a.wareX,a.cartTolerance))return fail('先把書車移到倉口，再取本架書簡。');g.cargo=true;}
 else if(k==='lift'&&name==='boardLift'){if(!scene(w).canBoard)return fail('書車須載簡並對準升臺，臺到低位才上車。',true);g.onLift=true;}
 else if(k==='lift'&&name==='leaveLift'){if(!scene(w).canLeave)return fail('升臺尚未到本架高度，先觀察再歸簡。',true);g.delivered.push(g.shelf);g.shelf++;g.cargo=false;g.onLift=false;g.cartX=90;g.done=g.shelf===3;}
 else if(k==='hollow'&&name==='cutCell'&&integer(v,0,35)){if(g.cut[v])return false;if(protectedCells.includes(v))return fail('此格是必要邊框，不可把所有實體都鑿掉。');g.cut[v]=true;g.cuts++;}
 else if(k==='hollow'&&name==='restoreCell'&&integer(v,0,35)&&g.cut[v])g.cut[v]=false;
 else if(k==='hollow'&&name==='testVessel'){if(!check())return fail('試器次數用完，可用運籌補充核驗。');const c=cavity(g);if(!g.cut[2]||!g.cut[32]||c.cut.length>10||c.connected.length!==c.cut.length||!c.connected.includes(32)||!c.square||!c.column)return fail('兩口與中空須連通，容下方器與長柄，且開孔不超十格；保留結構再試。');g.done=true;}
 else if(k==='lacquer'&&name==='setBrush'&&v&&Number.isFinite(v.radius)&&v.radius>=0&&v.radius<=100&&integer(v.pressure,1,3)){g.radius=Math.round(v.radius*100)/100;g.pressure=v.pressure;}
 else if(k==='lacquer'&&name==='coat'){const a=scene(w);if(!a.canCoat)return false;if(!close(g.radius,a.requiredRadius[a.currentSector],a.tolerance)||g.pressure!==a.requiredPressure[a.currentSector])return fail('刷徑或壓力未對上當前塗區；轉坯在動，先看再落刷。',true);g.coated[a.currentSector]=true;g.dryUntil=w.time+.35;g.done=g.coated.every(Boolean);}
 else if(k==='lens'&&name==='moveLens'&&integer(v,0,2))g.camera=v;
 else if(k==='lens'&&name==='setFocus'&&Number.isFinite(v)&&v>=0&&v<=100)g.focus=Math.round(v*100)/100;
 else if(k==='lens'&&name==='capture'){if(g.photos.some(x=>x.camera===g.camera))return false;const a=scene(w);if(!a.visible||!close(g.focus,a.focusTarget,a.tolerance))return fail('視線有遮擋、反光或未合焦，等待可見條件再取像。',true);g.photos.push({camera:g.camera,at:w.time,x:a.fishX,depth:a.depth});g.done=g.photos.length===3;}
 else if(k==='memory'&&name==='showPattern'){if(g.replays>=g.maxReplays)return fail('重播餘裕已用完，可用運籌再加一次。');g.replays++;g.phase='preview';g.previewAt=w.time;g.duration=.65*(active(w,'foresight')?1.4:1);g.recall=[];}
 else if(k==='memory'&&name==='recallStep'&&integer(v,0,8)){const a=scene(w);if(g.phase==='idle'||a.previewEnd===null||w.time<a.previewEnd)return false;if(g.phase==='preview')g.phase='recall';const sequence=pattern(w);if(v!==sequence[g.recall.length]){g.phase='idle';g.previewAt=null;g.recall=[];return fail('次序未合；可以有限重播重新觀察，閱讀首答不受影響。');}g.recall.push(v);if(g.recall.length===sequence.length){g.observations.push(g.recall.slice());g.round++;g.recall=[];g.previewAt=null;g.phase='idle';g.done=g.round===3;}}
 else if(k==='leap'&&name==='setCharge'&&Number.isFinite(v)&&v>=0&&v<=100){if(g.flight)return false;g.charge=Math.round(v*100)/100;}
 else if(k==='leap'&&name==='jump'){if(g.flight||g.platform>=5)return false;const a=scene(w);g.flight={at:w.time,power:g.charge,duration:a.duration,wind:a.wind,tolerance:a.tolerance};}
 else if(k==='leap'&&name==='land'){const a=scene(w);if(!a.canLand)return false;const landedX=g.x+10+g.flight.power*.2+g.flight.wind;g.flight=null;if(!close(landedX,a.landingTarget,a.tolerance))return fail('落點偏離踏石；保留已到平台，重看風與飛行期間的石位再試。',true);g.x=a.landingTarget;g.platform++;g.landings.push({at:w.time,x:g.x});g.done=g.platform===5;}
 else if(k==='overlay'&&name==='shiftSheet'&&v&&integer(v.index,0,2)&&integer(v.x,-3,3)&&integer(v.y,-3,3)){g.layers[v.index]={x:v.x,y:v.y};g.moves++;}
 else if(k==='overlay'&&name==='verifyOverlay'){if(!check())return fail('合讀核驗用完，可用運籌補充。');const a=scene(w);if(!a.sheets.every((s,i)=>s.points.every(p=>a.reference.some(q=>q.x===p.x+g.layers[i].x&&q.y===p.y+g.layers[i].y))))return fail('三紙各四個準點都須對齊底本，不能只看一張大概重合。');g.done=true;}
 else if(k==='audit'&&name==='testWorkshop'&&v&&integer(v.station,0,2)&&integer(v.input,0,2)){if(g.samples.some(x=>x.station===v.station&&x.input===v.input))return false;if(g.tests>=g.maxTests)return fail('取樣餘裕已用完，可用運籌補充。');const type=(w.seed+v.station*2)%6;g.samples.push({station:v.station,input:v.input,output:catalog[type].signature[v.input]});g.tests++;}
 else if(k==='audit'&&name==='recordFinding'&&v&&integer(v.station,0,2)&&integer(v.type,0,5))g.findings[v.station]=v.type;
 else if(k==='audit'&&name==='verifyAudit'){if(!check())return fail('核驗次數用完，可用運籌補充。');if(!g.findings.every((type,i)=>type===(w.seed+i*2)%6&&new Set(g.samples.filter(x=>x.station===i).map(x=>x.input)).size>=2))return fail('三臺各須至少兩種實測，型態須符合觀察；不能只憑名號或猜測。');g.done=true;}
 else if(k==='truss'&&name==='toggleBeam'&&v&&integer(v.a,0,5)&&integer(v.b,0,5)&&v.a!==v.b){const pair=[v.a,v.b].sort((a,b)=>a-b);if(!beamCandidates.some(x=>same(x,pair)))return false;const at=g.beams.findIndex(x=>same(x,pair));if(at>=0)g.beams.splice(at,1);else{if(g.beams.length>=8)return false;g.beams.push(pair);}}
 else if(k==='truss'&&name==='testTruss'){if(!check())return fail('承重核驗用完，可用運籌補充。');if(trussSupport(g).length!==6)return fail('每個上方節點都須獲兩個下方穩固支點，形成非扁三角，且上點須落在兩支點的橫向範圍。');g.done=true;}
 else if(k==='untangle'&&name==='moveKnot'&&v&&integer(v.index,0,7)&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=5&&v.x<=95&&v.y>=5&&v.y<=95){g.nodes[v.index]={x:Math.round(v.x*100)/100,y:Math.round(v.y*100)/100};g.moves++;}
 else if(k==='untangle'&&name==='testWeb'){if(!check())return fail('解結核驗用完，可用運籌補充。');const a=scene(w);let tight=false;for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)if(Math.hypot(g.nodes[i].x-g.nodes[j].x,g.nodes[i].y-g.nodes[j].y)<a.minDistance)tight=true;if(a.crossings.length||tight||webEdges.some(([x,y])=>Math.hypot(g.nodes[x].x-g.nodes[y].x,g.nodes[x].y-g.nodes[y].y)>a.maxLength))return fail('線仍交叉、人物擠疊或連結過長；保留所有人物再調整。');g.done=true;}
 else if(k==='schedule'&&name==='moveJob'&&v&&['scribe','review'].includes(v.station)&&integer(v.job,0,3)&&integer(v.index,0,3)){const order=g.orders[v.station];order.splice(order.indexOf(v.job),1);order.splice(v.index,0,v.job);g.moves++;}
 else if(k==='schedule'&&name==='publishBooks'){if(!check())return fail('工序核驗用完，可用運籌補充。');if(timeline(g).makespan>11)return fail('總工序超過十一刻；看校讀的等待空檔，調整兩站篇件次序。');g.done=true;}
 else if(k==='escort'&&name==='driveCart'&&v&&integer(v.index,0,2)&&typeof v.go==='boolean'){if(g.arrived[v.index])return false;advanceEscort(w);if(w.status==='lost')return true;g.carts[v.index].go=v.go;}
 else if(k==='escort'&&name==='receiveCart'&&integer(v,0,2)){if(g.arrived[v])return false;advanceEscort(w);if(w.status==='lost')return true;if(g.carts[v].progress<100)return fail('護車尚未到終點，觀察路線再接收。');g.arrived[v]=true;g.carts[v].go=false;g.done=g.arrived.every(Boolean);}
 else return false;
 g.spent++;if(!failed)w.notice=g.done?'本篇同行操作完成，接著回到原文反思。':'操作已記下，觀察公開條件再安排下一步。';return true;
}
function command(w,name,value){const g=w.campaign;if(g.log.length>=240||g.done||w.status!=='playing'||w.time>=w.limit)return false;if(name!=='skill'&&active(w,'listening')&&w.time<w.buffs.listening-6)return false;const v=value===undefined?null:copy(value),ok=reduce(w,name,v);if(ok){g.log.push({t:w.time,name,value:v});if(g.done)w.status='won';}return ok;}
function complete(w){return w.campaign.done===true;}
function validate(w){const g=w.campaign;if(!g||g.version!==1||g.mechanic!==pilot(w).mechanic||!Array.isArray(g.log)||g.log.length>240)throw Error('諸子同行存檔格式不符。');const fresh={id:w.id,seed:w.seed,snapshot:copy(w.snapshot),time:0,limit:w.limit,uses:{},cooldowns:{},buffs:{},trace:null,errors:0,status:'playing',notice:''};fresh.campaign=initial(fresh);let at=0;for(const a of g.log){if(!a||Object.keys(a).sort().join(',')!=='name,t,value'||!Number.isFinite(a.t)||a.t<at||a.t>w.time||a.t>=w.limit||fresh.campaign.done||fresh.status==='lost'||(a.name!=='skill'&&active({...fresh,time:a.t},'listening')&&a.t<fresh.buffs.listening-6))throw Error('諸子操作歷程無法核對。');at=a.t;fresh.time=at;if(!reduce(fresh,a.name,a.value))throw Error('諸子操作條件無法核對。');fresh.campaign.log.push(copy(a));}for(const key of ['campaign','uses','cooldowns','buffs','trace','errors'])if(!same(w[key],fresh[key]))throw Error('諸子操作結果與歷程不符。');if(g.done&&w.time>=w.limit)throw Error('諸子任務不能在逾時後完成。');if(w.status==='won'&&!g.done)throw Error('諸子任務尚未完成，不能記為通關。');const expected=g.done?(w.chapter&&['reflection','remedy'].includes(w.chapter.phase)?'playing':'won'):(fresh.status==='lost'||w.time>=w.limit?'lost':'playing');if(w.status!==expected)throw Error('諸子任務狀態與重放結果不符。');return true;}
function progress(before,next){const a=before.campaign.log,b=next.campaign.log;if(a.length>b.length||!same(a,b.slice(0,a.length)))throw Error('諸子同行操作不能倒退或改寫。');}
function summary(w){const g=w.campaign;return({lift:()=>g.delivered.length+'/3架歸簡',hollow:()=>g.cut.filter(Boolean).length+'/10格開孔',lacquer:()=>g.coated.filter(Boolean).length+'/8區覆塗',lens:()=>g.photos.length+'/3點留影',memory:()=>g.round+'/3輪 · 本輪'+g.recall.length+'點',leap:()=>g.platform+'/5次落穩',overlay:()=>g.moves+'次透片移位',audit:()=>g.tests+'次取樣 · '+g.findings.filter(x=>x!==null).length+'/3型核實',truss:()=>trussSupport(g).length+'/6點穩固 · '+g.beams.length+'/8桿',untangle:()=>webCrossings(g.nodes).length+'處交線 · '+g.moves+'次移位',schedule:()=>timeline(g).makespan+'刻完成 · '+g.moves+'次排程',escort:()=>g.arrived.filter(Boolean).length+'/3組外援 · '+g.collisions+'次碰撞'})[g.mechanic]();}
function specialObjective(w){const g=w.campaign,done=g.done,result={lift:()=>['lift-twenty','二十秒內歸妥三架書簡',done&&w.time<=20],hollow:()=>['eight-cuts','八格開孔即成二用',done&&g.cut.filter(Boolean).length<=8],lacquer:()=>['clean-coat','八區落刷零失誤',done&&g.misses===0&&g.log.filter(x=>x.name==='coat').length===8],lens:()=>['three-shots','三鏡位各一次清晰取像',done&&g.log.filter(x=>x.name==='capture').length===3],memory:()=>['first-recall','三輪各看一次追譜',done&&g.replays===3],leap:()=>['five-landings','五次起跳逐石落穩',done&&g.log.filter(x=>x.name==='jump').length===5],overlay:()=>['three-sheets','三次移紙全合準點',done&&g.moves<=3],audit:()=>['six-tests','六次試驗辨明三臺',done&&g.tests===6],truss:()=>['eight-beams','八桿一次連接成穩架',done&&g.log.filter(x=>x.name==='toggleBeam').length===8],untangle:()=>['eight-knots','八次移結化開全網',done&&g.moves<=8],schedule:()=>['nine-ticks','九刻內完成抄校',done&&timeline(g).makespan<=9],escort:()=>['escort-ten','十秒內零碰撞全車接應',done&&g.collisions===0&&w.time<=10]}[g.mechanic]();return{id:result[0],label:result[1],done:result[2]};}
function objectives(w){return[{id:'accurate',label:'零操作誤判',done:w.campaign.errors===0},specialObjective(w),{id:'unassisted',label:'不使用主動能力完成',done:w.campaign.done&&Object.values(w.uses).every(n=>n===0)}];}
function report(w){return{title:pilot(w).title,completed:w.campaign.done,seconds:Math.round(w.time*10)/10,quality:clamp(100-w.campaign.errors*8,0,100),items:[{label:'同行進度',value:summary(w)},{label:'操作誤判',value:w.campaign.errors},{label:'有效操作',value:w.campaign.spent}],suggestions:[w.campaign.errors?'重看公開線索及條件，分步安排再試；動作得分不能代替原典論證。':'可試不同配點、更少調整或專屬挑戰；閱讀首答與原篇三幕成績獨立保存。']};}
module.exports={PILOTS,CHAPTERS,SKILL_DESCRIPTIONS,pilot,compatible,limit,routes,initial,active,adjacent,command,complete,validate,progress,scene,summary,objectives,report,uiHints};
