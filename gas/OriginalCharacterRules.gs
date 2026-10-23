// 自動產生：src/character/model.cjs 與相依純規則；與前端共用。
var OC_RULES_=(function(){var module={exports:{}};
"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// src/character/chuhan.cjs
var require_chuhan = __commonJS({
  "src/character/chuhan.cjs"(exports2, module2) {
    "use strict";
    var rows = [
      ["S_ch01_shaqiu", "沙丘", "合符驗詔", "詔書核驗者", "seal", "n20", "沙丘密議前", ["precise", "trace"], "旋轉四片符印，對齊拓本的接縫，再按核驗。核對印記不能證明詔書內容真實。"],
      ["S_ch02_dazexiang", "大澤鄉", "雨夜急遞", "雨夜傳令者", "jump", "n_04", "雨阻失期後", ["swift", "steady"], "看雨勢與斷木位置，選可落腳的路；游標進入金色區時按躍過。連過六處，把營地消息送到。"],
      ["S_ch03_julu", "鉅鹿", "限舟接應", "渡口接應者", "ferry", "n_10", "鉅鹿決戰前", ["plan", "foresight"], "勾選人員與物資，三航內送齊六項。首航須有先遣隊，傷者與藥箱須同船；不可超過載重。"],
      ["S_ch04_hongmen", "鴻門宴", "席外傳訊", "席外接應者", "relay", "n_24", "沛公離席後、張良留謝前", ["listen", "swift"], "點相鄰接點傳訊。等巡察燈轉暗再穿過通道，經廚下或廊道送到接應口。這是席外自編任務。"],
      ["S_ch05_sanqin", "三秦", "棧道雙線", "糧道繪圖者", "paths", "n_10", "漢中整備時", ["plan", "trace"], "沿相鄰格畫出示蹤線至右上角，再畫運糧線至右下角。兩線除起點外不得共用格；可退一格重畫。"],
      ["S_ch06_xingyang", "滎陽", "糧車護行", "糧道護送者", "convoy", "n_10", "滎陽相持的糧道任務", ["plan", "foresight"], "先點道路部署護衛，再選糧車要走的鄰道。四段敵襲會變化，護衛可擋同道襲擊，至少三箱糧抵營才完成。"],
      ["S_ch07_hanxin", "韓信", "拔旗換幟", "趙營換旗者", "flags", "n_10", "井陘部署時", ["plan", "trace"], "每點一旗，同時翻轉本格與上下左右的旗。用有限軍令把九旗轉成漢旗。陣列是自編連動解謎。"],
      ["S_ch08_gaixia", "垓下", "回聲尋伴", "夜路照應者", "maze", "n_09", "夜間突圍時", ["listen", "light"], "點相鄰路格移動，在霧中找回左下方同伴，再到右下角會合。障礙須繞行，巡察轉暗再過；可用聽息暫看全圖。"],
      ["S_ch09_dafeng", "大風", "歸鄉重建", "鄉里營建者", "city", "n_20", "還鄉守成時", ["precise", "plan"], "選民居、糧倉或道路，再點左上起格放置；道路可旋轉。填滿十二格，讓兩處建物都接到橫貫道路；點已選的建物可收回。"]
    ];
    var readings = [
      ["《史記・秦始皇本紀》《李斯列傳》", "丞相斯為上崩在外，恐諸公子及天下有變，乃祕之，不發喪。", "隱瞞死訊", "李斯祕不發喪，從原文可判斷什麼？", ["擔憂政治局勢生變", "已正式公開繼承詔命", "天下已完全沒有異議"], 0, "於是斯乃聽高。", "責任辨析", "印記拼合完成，能否據此說李斯沒有責任？", ["能，印記正確就免責", "不能，原文明寫他聽從趙高", "能，整件事只有扶蘇參與"], 1],
      ["《史記・陳涉世家》", "會天大雨，道不通，度已失期。失期，法皆斬。", "處境因果", "篇中失期的直接原因是？", ["無人願意出發", "大雨阻路，估計已不能如期到達", "已經攻取咸陽"], 1, "王侯將相寧有種乎！", "反問語氣", "這句反問意在挑戰什麼？", ["下雨的成因", "軍糧的保存方法", "身分只能由血統決定的看法"], 2],
      ["《史記・項羽本紀》", "皆沈船，破釜甑，燒廬舍，持三日糧。", "決戰部署", "沉船破釜的部署顯示？", ["表明決戰，不留退路", "準備長期海運", "取消作戰回家"], 0, "楚戰士無不一以當十，楚兵呼聲動天。", "敘事效果", "一以當十的描寫著重什麼？", ["逐字統計每人的擊殺數", "突出楚軍決戰的勇猛氣勢", "證明諸侯已在戰前統一聽命"], 1],
      ["《史記・項羽本紀》", "大行不顧細謹，大禮不辭小讓。", "情勢取捨", "樊噲此言用來勸什麼？", ["留下補完所有禮節", "大事當前，先脫離險境", "立即攻擊所有賓客"], 1, "沛公已去，間至軍中。張良入謝。", "行動時序", "原文的先後關係是？", ["張良先謝，沛公才決定離開", "角色傳訊決定項羽的結局", "沛公先回軍中，張良再入謝"], 2],
      ["《史記・蕭相國世家》", "何獨先入收秦丞相御史律令圖書藏之。", "文書價值", "蕭何優先收藏的資料是？", ["律令與圖書，能供治理參考", "宮中珍寶與酒器", "只收私人詩稿"], 0, "漢王所以具知天下阸塞，戶口多少，彊弱之處，民所疾苦者，以何具得秦圖書也。", "資料與治理", "圖書使漢王得以掌握什麼？", ["保證所有決策永不出錯", "地勢、人口與民間疾苦等資訊", "直接取代將領的臨場指揮"], 1],
      ["《史記・陳丞相世家》", "常出奇計，救紛糾之難，振國家之患。", "謀略作用", "此句把陳平的謀略與什麼相連？", ["一定能免除一切風險", "協助紓解危難、振救國家", "廢除所有軍事部署"], 1, "事已急矣，請為王誑楚為王，王可以間出。", "脫困分工", "紀信此言提出什麼安排？", ["請劉邦先在東門公開露面", "取消脫困計畫", "由紀信假扮漢王，讓漢王從間道離去"], 2],
      ["《史記・淮陰侯列傳》", "選輕騎二千人，人持一赤幟，從間道萆山而望趙軍。", "部署條件", "換旗前先安排輕騎做什麼？", ["持赤幟走間道，隱蔽觀察趙軍", "公開站在趙營中央宣告", "先回漢中休息"], 0, "趙軍已不勝，不能得信等，欲還歸壁，壁皆漢赤幟，而大驚。", "前後接應", "趙軍回營時大驚，與什麼部署相連？", ["所有敵軍已先投降", "趙軍追逐而營壁空虛時，迅速入營換旗", "只要旗色變了就必然取勝"], 1],
      ["《史記・項羽本紀》", "夜聞漢軍四面皆楚歌，項王乃大驚。", "見聞與推論", "原文確實交代的是？", ["楚地已全部被漢軍取得", "項羽聽到楚歌而驚訝", "項羽已成功渡江"], 1, "此天之亡我，非戰之罪也。", "人物觀點", "這句話應如何判讀？", ["史家已證明項羽沒有任何責任", "遊戲角色可以據此改寫史實", "這是項羽的自我解釋，仍可用其他事件檢視"], 2],
      ["《史記・高祖本紀》", "此三者，皆人傑也，吾能用之，此吾所以取天下也。", "用人觀點", "劉邦在這句強調什麼？", ["自己能任用不同專長的人才", "自己每項能力都勝過三傑", "天下只靠一個人取得"], 0, "安得猛士兮守四方！", "守成憂思", "末句表達哪種憂思？", ["要再把故鄉拆毀", "希望得到能守衛四方的人才", "天下已定，所以人才不再需要"], 1]
    ];
    var REFLECTIONS = [[["驗詔與判斷", "符印接縫已對齊，還須查什麼？", ["只看印記就相信任何命令", "傳命來源與是否受命，印記不能單獨證真", "同行者的造型"], 1], ["聽從與責任", "於是二字把這句放在趙高勸說之後，應讀作？", ["李斯完全未受影響", "作者讚美詔書排版", "李斯在此前壓力下聽從，須連讀其選擇"], 2]], [["模擬與史文", "你在遊戲中送到消息，能否說史文的失期被消除了？", ["不能，急遞是自編推演，原文仍記雨阻失期", "能，一次跳躍就能改變秦法", "能，陳勝從未遇雨"], 0], ["反問與主張", "把寧有種乎改成一定有種，語意有何變化？", ["完全不變", "變成支持血統決定身分，失去原來的挑戰", "只改變下雨的時間"], 1]], [["渡運與決心", "同行渡運成功後，原作的沉船破釜應如何接讀？", ["渡運配置證明楚軍有永久船隊", "數字全是史書實錄", "準備渡河與渡後決戰有時序差別，不能混作長期退路"], 2], ["誇飾效果", "若把一以當十只當逐人統計，會忽略什麼？", ["文字渲染決戰聲勢的效果", "糧袋的重量", "渡河船的顏色"], 0]], [["細謹與大事", "若只用未告辭判斷沛公失禮，忽略了哪個條件？", ["宴席完全安全", "當時人為刀俎、我為魚肉的危局", "宴席根本不存在"], 1], ["任務與人物", "席外傳訊完成後，張良的哪項任務仍須自己完成？", ["代項羽統一天下", "代樊噲起兵", "等沛公至軍中後入帳留謝"], 2]], [["資料的用途", "繪出兩條遊戲路線，是否足以代表蕭何圖書的全部價值？", ["不能，圖書還含治理、人口與疾苦等資料", "能，圖書只有棧道圖", "能，遊戲棋盤就是秦代原圖"], 0], ["據料推論", "以何具得秦圖書也在句中起什麼作用？", ["否定漢王掌握資訊", "解釋漢王何以能掌握前列資訊", "指出資料毫無用途"], 1]], [["謀略與風險", "運糧挑戰成功，能否推成陳平每一計都沒有代價？", ["能，遊戲通過即為史實", "不能，須回到具體危局與後果判斷", "能，奇計等於不必取捨"], 1], ["脫困與分工", "若把紀信假王與劉邦間出都寫成同一人公開逃走，問題在？", ["把不同人的分工與虛實配置混為一談", "只是更換字體", "可證楚軍早已投降"], 0]], [["隱蔽與觀察", "只把換旗看作變顏色，會漏掉哪個前提？", ["必須人人站在水裡換旗", "史書說旗色能自動控制所有人", "先藏輕騎觀察趙軍，再配合營壁空虛的時機"], 2], ["次序與效果", "趙軍回營才見漢赤幟而大驚，應避免哪種倒置？", ["把回營後的驚亂寫成趙軍出營前已看穿全部部署", "保留驚亂描寫", "把壁理解為營壘"], 0]], [["見聞的限度", "只聽楚歌便斷言楚地全失，增加了哪個未必成立的步驟？", ["把聲音直接當作領土全失的充分證明", "聽見歌聲", "知道時在夜間"], 0], ["人物與史家", "閱讀非戰之罪時，接著用戰略與用人事件檢查，意義是？", ["不准理解人物的心情", "區分人物自辯與可檢視的責任", "讓原創角色替項羽獲勝"], 1]], [["用人與專長", "城市拼放完成，能否推成劉邦自稱每項專業都最強？", ["能，所有職務都由劉邦一人完成", "不能，吾能用之強調任用不同人才", "能，三傑沒有各自職掌"], 1], ["疑問與憂思", "安得猛士用疑問語氣收束，與威加海內合讀顯示？", ["完全沒有守成問題", "勝利後不必人才", "勝利與還鄉之中仍有守四方的憂思"], 2]]];
    var copy2 = (x) => JSON.parse(JSON.stringify(x));
    var same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    var clamp2 = (n, a, b) => Math.max(a, Math.min(b, n));
    var PILOTS2 = rows.map((r, i) => ({ id: r[0], name: r[1], title: r[2], role: r[3], mechanic: r[4], node: r[5], point: r[6], recommended: r[7], rule: r[8], kind: "chuhan", scene: "scene:ch" + String(i + 1).padStart(2, "0") + "_world", source: readings[i][0], quote: readings[i][1], brief: "以自己的造型完成「" + r[2] + "」，操作方式與本篇情境相連；原有必做體驗仍完整保留。", after: "同行任務完成。這是自編情境推演，接著回原篇人物與事件；任務成功不改變史實結局。" }));
    var CHAPTERS2 = Object.fromEntries(PILOTS2.map((p, i) => {
      const d = readings[i], q = (id, tag, prompt, choices, answer, text) => ({ id, tag, prompt, choices, answer, evidence: [{ id: "text", text }, { id: "other", text: text === d[1] ? d[6] : d[1] }], correctEvidence: "text", explain: "請把判斷放回這句原文及前後情境；操作結果不能代替文本證據。" }), a = q("ch-e1", d[2], d[3], d[4], d[5], d[1]), b = q("ch-f1", d[7], d[8], d[9], d[10], d[6]);
      return [p.id, { title: p.title, intro: p.brief, evidence: [a, { ...b, id: "ch-e2", prompt: "出發前核對：" + b.prompt }], reflection: REFLECTIONS[i].map((r, n) => q("ch-f" + (n + 1), n ? b.tag : a.tag, r[1], r[2], r[3], n ? d[6] : d[1])), remedy: [{ ...a, id: "ch-r1", tags: [a.tag], prompt: REFLECTIONS[i][0][1], choices: REFLECTIONS[i][0][2], answer: REFLECTIONS[i][0][3] }, { ...b, id: "ch-r2", tags: [b.tag], prompt: REFLECTIONS[i][1][1], choices: REFLECTIONS[i][1][2], answer: REFLECTIONS[i][1][3] }] }];
    }));
    function pilot2(w) {
      return PILOTS2.find((p) => p.id === (typeof w === "string" ? w : w.id));
    }
    function compatible2(c, id) {
      return c.skills.every((k) => ({ seal: ["precise", "foresight", "trace"], jump: ["swift", "steady", "foresight", "listen", "light", "trace"], ferry: ["plan", "foresight", "trace"], relay: ["listen", "swift", "steady", "foresight", "trace", "light"], paths: ["plan", "trace", "foresight"], convoy: ["plan", "foresight", "trace"], flags: ["plan", "trace", "foresight"], maze: ["listen", "light", "swift", "foresight", "trace", "steady"], city: ["precise", "plan", "trace", "foresight"] })[pilot2(id).mechanic].includes(k));
    }
    function routes(id) {
      const p = pilot2(id);
      return [{ id: "companion", name: p.title, brief: p.rule, build: "本篇配點：" + { seal: "巧手擴大拼符時間，察勢延長觀察。", jump: "身法與定力擴大落腳窗口。", ferry: "臂力增加載重，籌算保留航次。", relay: "身法縮短傳遞等待，察勢延長預看。", paths: "籌算增加重畫餘裕。", convoy: "臂力增加攜糧，籌算增加護衛調度。", flags: "籌算增加換旗軍令。", maze: "身法縮短行路間隔，察勢延長聽察。", city: "巧手與籌算增加試放餘裕。" }[p.mechanic], tradeoff: "能力只協助觀察、時間或資源，不替你解題。" }];
    }
    function adjacent(a, b, cols = 4) {
      return Number.isInteger(b) && b >= 0 && b < cols * (cols === 3 ? 3 : 4) && Math.abs(a % cols - b % cols) + Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) === 1;
    }
    var cargo = [["先遣隊", 2], ["接應繩", 1], ["糧袋", 2], ["工具", 1], ["傷者", 2], ["藥箱", 1]];
    var edges = [[1, 2], [0, 3], [0, 3, 4], [1, 2, 5], [2, 5], [3, 4]];
    var places = ["帳後", "廚下", "廊道", "側門", "後廊", "接應口"];
    function flip(flags, i) {
      for (let j = 0; j < 9; j++) if (i === j || adjacent(i, j, 3)) flags[j] = 1 - flags[j];
    }
    function initial(w) {
      const s = w.snapshot.config.stats, k = pilot2(w).mechanic;
      let g = { version: 1, mechanic: k, log: [], errors: 0, spent: 0, done: false };
      if (k === "seal") Object.assign(g, { tiles: [0, 1, 2, 3].map((i) => (w.seed + i * 3) % 4), target: [0, 1, 2, 3].map((i) => (w.seed * 3 + i) % 4) });
      if (k === "jump") Object.assign(g, { stage: 0 });
      if (k === "ferry") Object.assign(g, { aboard: [], landed: [], trips: [], capacity: 3 + Math.floor(s.strength / 3), maxTrips: 3 });
      if (k === "relay") Object.assign(g, { at: 0, visited: [0], lastMove: -10 });
      if (k === "paths") Object.assign(g, { phase: 0, path: [0], decoy: [], undos: 0, budget: 6 + s.planning });
      if (k === "convoy") Object.assign(g, { wave: 0, lane: 1, guards: [], grain: 5 + Math.floor(s.strength / 2), orders: 3 + s.planning, arrivals: [] });
      if (k === "flags") {
        const flags = Array(9).fill(1);
        for (let i of [0, 2, 4, 7].map((x) => (x + w.seed) % 9)) flip(flags, i);
        Object.assign(g, { flags, moves: 0, budget: 7 + Math.floor(s.planning / 2) });
      }
      if (k === "maze") Object.assign(g, { at: 0, visited: [0], rescued: false, lastMove: -10, steps: 0 });
      if (k === "city") Object.assign(g, { pieces: [null, null, null], selected: 0, rotation: 0, budget: 8 + s.planning + Math.floor(s.dexterity / 2) });
      return g;
    }
    function active(w, key) {
      return (w.buffs[key] || 0) > w.time;
    }
    function gate(w, n = 0) {
      const s = w.snapshot.config.stats, cycle = (w.time + n * 0.71 + w.seed % 7 * 0.1) % 3, margin = 0.12 * s.agility + 0.06 * s.focus + (active(w, "steady") ? 0.35 : 0) + (active(w, "swift") ? 0.3 : 0) + (w.snapshot.config.skills.includes("light") ? 0.15 : 0);
      return { cycle, open: cycle > 1 - margin && cycle < 2 + margin, start: clamp2(1 - margin, 0, 3), end: clamp2(2 + margin, 0, 3) };
    }
    function jumpBlocked(w) {
      return (w.seed + w.campaign.stage * 2) % 3;
    }
    function threats(w) {
      return [(w.seed + w.campaign.wave) % 3, (w.seed + w.campaign.wave + 1) % 3];
    }
    function walls(w) {
      return w.seed % 2 ? [5, 7, 9] : [5, 6, 9];
    }
    function tilesFor(piece, at, rotation = 0) {
      const x = at % 4, y = Math.floor(at / 4), shape = piece === 2 ? rotation % 2 ? [[0, 0], [0, 1], [0, 2], [0, 3]] : [[0, 0], [1, 0], [2, 0], [3, 0]] : [[0, 0], [1, 0], [0, 1], [1, 1]];
      if (shape.some(([dx, dy]) => x + dx >= 4 || y + dy >= 3)) return null;
      return shape.map(([dx, dy]) => (y + dy) * 4 + x + dx);
    }
    function cityComplete(g) {
      if (g.pieces.some((x) => !x)) return false;
      const cells = g.pieces.flatMap((p) => p.cells);
      return new Set(cells).size === 12 && g.pieces.slice(0, 2).every((p) => p.cells.some((a) => g.pieces[2].cells.some((b) => adjacent(a, b))));
    }
    function skill2(w, id) {
      const g = w.campaign, uses = w.uses[id] || 0;
      if (!w.snapshot.config.skills.includes(id) || id === "light" || uses >= 2 || w.time < (w.cooldowns[id] || 0)) return false;
      w.uses[id] = uses + 1;
      w.cooldowns[id] = w.time + 10;
      const insight = w.snapshot.config.stats.insight;
      if (id === "trace") w.trace = { mechanic: g.mechanic, at: w.time, summary: summary(w) };
      else if (id === "plan") {
        if (g.mechanic === "ferry") g.maxTrips++;
        else if (g.mechanic === "convoy") g.orders += 2;
        else if (["paths", "flags", "city"].includes(g.mechanic)) g.budget += 2;
        else w.buffs.steady = w.time + 8;
      } else if (id === "listen") {
        w.buffs.listening = w.time + 2;
        w.buffs.foresight = w.time + 8 + insight;
      } else w.buffs[id] = w.time + (id === "swift" ? 3 : id === "foresight" ? 6 + insight : 8);
      w.notice = "已使用" + { swift: "迅影", steady: "握定", precise: "巧勁", foresight: "望勢", listen: "聽息", plan: "運籌", trace: "留痕" }[id] + "；仍須親自完成本篇操作。";
      return true;
    }
    function reduce(w, name, v) {
      const g = w.campaign, s = w.snapshot.config.stats, k = g.mechanic, fail = (text) => {
        g.errors++;
        w.errors = g.errors;
        w.notice = text;
        return true;
      };
      if (name === "skill") return skill2(w, v);
      if (k === "seal" && name === "rotate" && Number.isInteger(v) && v >= 0 && v < 4) {
        g.tiles[v] = (g.tiles[v] + 1) % 4;
        g.spent++;
      } else if (k === "seal" && name === "verify") {
        if (!same(g.tiles, g.target)) return fail("接縫尚未吻合，逐片比較方向再核驗。");
        g.done = true;
      } else if (k === "jump" && name === "jump" && Number.isInteger(v) && v >= 0 && v < 3) {
        if (v === jumpBlocked(w) || !gate(w, g.stage).open) return fail("落點是斷木，或起跳尚未對準窗口。先看游標與道路再試。");
        g.stage++;
        g.spent++;
        g.done = g.stage === 6;
      } else if (k === "ferry" && name === "load" && Number.isInteger(v) && v >= 0 && v < 6 && !g.landed.includes(v)) {
        g.aboard = g.aboard.includes(v) ? g.aboard.filter((x) => x !== v) : g.aboard.concat(v);
      } else if (k === "ferry" && name === "sail") {
        const weight = g.aboard.reduce((n, i) => n + cargo[i][1], 0);
        if (!g.aboard.length || weight > g.capacity || !g.trips.length && !g.aboard.includes(0) || g.aboard.includes(4) !== g.aboard.includes(5)) return fail("核對載重、首航先遣，以及傷者與藥箱同船的條件。");
        if (g.trips.length >= g.maxTrips) return fail("航次用盡，可用運籌增加一次，或重新挑戰。");
        g.trips.push(g.aboard.slice());
        g.landed.push(...g.aboard);
        g.aboard = [];
        g.spent++;
        g.done = g.landed.length === 6;
      } else if (k === "relay" && name === "relay" && edges[g.at].includes(v)) {
        if (w.time - g.lastMove < Math.max(0.2, 1 - s.agility * 0.1 - (active(w, "swift") ? 0.4 : 0))) return false;
        if (!gate(w, v).open) return fail("巡察尚亮，等暗窗再傳過通道。");
        g.at = v;
        g.visited.push(v);
        g.lastMove = w.time;
        g.spent++;
        g.done = v === 5;
      } else if (k === "paths" && name === "path" && adjacent(g.path.at(-1), v) && ![5, 10].includes(v) && !g.path.includes(v) && !g.decoy.includes(v)) {
        g.path.push(v);
        g.spent++;
      } else if (k === "paths" && name === "undo" && g.path.length > 1) {
        if (g.undos >= g.budget) return fail("本局重畫餘裕用盡。");
        g.path.pop();
        g.undos++;
      } else if (k === "paths" && name === "commitPath") {
        if (g.path.at(-1) !== (g.phase === 0 ? 3 : 15)) return fail("路線尚未到指定出口。");
        if (g.phase === 0) {
          g.decoy = g.path.slice(1);
          g.path = [0];
          g.phase = 1;
        } else g.done = true;
      } else if (k === "convoy" && name === "guard" && Number.isInteger(v) && v >= 0 && v < 3) {
        if (g.guards.includes(v)) return false;
        if (g.orders <= 0) return fail("護衛調度令已用完。");
        g.guards.push(v);
        g.orders--;
        g.spent++;
      } else if (k === "convoy" && name === "drive" && Number.isInteger(v) && v >= 0 && v < 3 && Math.abs(g.lane - v) <= 1) {
        const hit = threats(w).includes(v) && !g.guards.includes(v);
        if (hit) {
          g.grain--;
          g.errors++;
          w.errors = g.errors;
        }
        g.arrivals.push({ lane: v, hit });
        g.lane = v;
        g.guards = [];
        g.wave++;
        g.spent++;
        if (g.wave === 4) {
          g.done = g.grain >= 3;
          if (!g.done) w.status = "lost";
        }
      } else if (k === "flags" && name === "flag" && Number.isInteger(v) && v >= 0 && v < 9) {
        if (g.moves >= g.budget) return fail("軍令用盡，可用運籌補兩令，或重新挑戰。");
        flip(g.flags, v);
        g.moves++;
        g.spent++;
        g.done = g.flags.every((x) => x === 1);
      } else if (k === "maze" && name === "walk" && adjacent(g.at, v)) {
        if (w.time - g.lastMove < Math.max(0.15, (0.6 - s.agility * 0.08 - (active(w, "swift") ? 0.15 : 0)) * (w.snapshot.config.skills.includes("light") ? 0.85 : 1))) return false;
        if (walls(w).includes(v)) return fail("此處不通，回看附近的路。");
        if ([6, 11].includes(v) && !gate(w, v).open) return fail("巡察未過，先停在原地。");
        g.at = v;
        if (!g.visited.includes(v)) g.visited.push(v);
        g.lastMove = w.time;
        g.steps++;
        g.spent++;
        if (v === 12) g.rescued = true;
        g.done = v === 15 && g.rescued;
      } else if (k === "city" && name === "selectPiece" && Number.isInteger(v) && v >= 0 && v < 3) {
        g.selected = v;
      } else if (k === "city" && name === "rotatePiece") {
        g.rotation = 1 - g.rotation;
      } else if (k === "city" && name === "removePiece") {
        if (!g.pieces[g.selected]) return false;
        g.pieces[g.selected] = null;
      } else if (k === "city" && name === "place" && Number.isInteger(v) && v >= 0 && v < 12) {
        if (g.spent >= g.budget) return fail("試放餘裕用盡，可使用運籌再安排。");
        const cells = tilesFor(g.selected, v, g.rotation), taken = g.pieces.flatMap((p, i) => i !== g.selected && p ? p.cells : []);
        if (!cells || cells.some((x) => taken.includes(x))) return fail("此處會超界或重疊，先換起格或旋轉道路。");
        g.pieces[g.selected] = { at: v, rotation: g.rotation, cells };
        g.spent++;
        g.done = cityComplete(g);
      } else return false;
      w.notice = g.done ? "本篇操作完成，接著回原文。" : "操作已記下，請觀察下一步。";
      return true;
    }
    function command2(w, name, v) {
      if (["jump", "relay", "walk"].includes(name) && active(w, "listening")) return false;
      if (w.campaign.log.length >= 240) {
        w.notice = "本局操作已達上限，請保存或重新挑戰。";
        return false;
      }
      const ok = reduce(w, name, v);
      if (ok) {
        w.campaign.log.push({ t: w.time, name, value: v === void 0 ? null : copy2(v) });
        if (w.campaign.done) w.status = "won";
      }
      return ok;
    }
    function complete(w) {
      return w.campaign.done === true;
    }
    function validate(w) {
      const g = w.campaign;
      if (!g || g.version !== 1 || g.mechanic !== pilot2(w).mechanic || !Array.isArray(g.log) || g.log.length > 240) throw Error("楚漢同行存檔格式不符。");
      const fresh = { id: w.id, seed: w.seed, snapshot: copy2(w.snapshot), time: 0, uses: {}, cooldowns: {}, buffs: {}, trace: null, errors: 0, status: "playing", notice: "" };
      fresh.campaign = initial(fresh);
      let time = 0;
      for (const a of g.log) {
        if (!a || Object.keys(a).sort().join(",") !== "name,t,value" || !Number.isFinite(a.t) || a.t < time || a.t > w.time || fresh.campaign.done || fresh.status === "lost") throw Error("楚漢操作歷程無法核對。");
        time = a.t;
        fresh.time = a.t;
        if (!reduce(fresh, a.name, a.value)) throw Error("楚漢操作條件無法核對。");
        fresh.campaign.log.push(copy2(a));
      }
      const canonical2 = (x) => JSON.stringify(x, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
      for (const key of ["campaign", "uses", "cooldowns", "buffs", "trace", "errors"]) if (canonical2(w[key]) !== canonical2(fresh[key])) throw Error("楚漢操作結果與歷程不符。");
      if (w.status === "lost" && w.time < w.limit && fresh.status !== "lost") throw Error("楚漢任務尚未達失敗條件。");
      return true;
    }
    function canonical(value) {
      return JSON.stringify(value, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
    }
    function progress(a, b) {
      const x = a.campaign.log, y = b.campaign.log;
      if (x.length > y.length || canonical(x) !== canonical(y.slice(0, x.length))) throw Error("楚漢操作歷程不能倒退或改寫。");
    }
    function summary(w) {
      const g = w.campaign;
      return { seal: () => g.tiles.map((x) => "↑→↓←"[x]).join(" "), jump: () => g.stage + "/6處", ferry: () => g.landed.length + "/6項 · " + g.trips.length + "航", relay: () => places[g.at], paths: () => g.phase === 0 ? "示蹤線 " + g.path.length + "格" : "運糧線 " + g.path.length + "格", convoy: () => g.wave + "/4段 · " + g.grain + "箱糧", flags: () => g.flags.filter((x) => x === 1).length + "/9漢旗 · " + g.moves + "令", maze: () => g.rescued ? "已找到同伴" : "尋找同伴中", city: () => g.pieces.filter(Boolean).length + "/3建物" }[g.mechanic]();
    }
    function objectives(w) {
      return [{ id: "accurate", label: "操作無誤判", done: w.campaign.errors === 0 }, { id: "efficient", label: "限時內完成並保留半數時間", done: w.campaign.done && w.time <= w.limit / 2 }];
    }
    function report(w) {
      return { title: pilot2(w).title, completed: w.campaign.done, seconds: Math.round(w.time * 10) / 10, quality: clamp2(100 - w.campaign.errors * 8, 0, 100), items: [{ label: "任務進度", value: summary(w) }, { label: "誤判次數", value: w.campaign.errors }, { label: "有效操作", value: w.campaign.spent }], suggestions: [w.campaign.errors ? "先觀察規則與目前狀態，再安排下一步；角色能力提供餘裕，操作仍由你完成。" : "可改配點或減少能力使用，挑戰更短時間與零誤判。"] };
    }
    module2.exports = { compatible: compatible2, PILOTS: PILOTS2, CHAPTERS: CHAPTERS2, pilot: pilot2, routes, initial, command: command2, complete, validate, progress, summary, objectives, report, gate, jumpBlocked, threats, walls, adjacent, cargo, edges, places, tilesFor };
  }
});

// src/character/warring.cjs
var require_warring = __commonJS({
  "src/character/warring.cjs"(exports2, module2) {
    "use strict";
    var copy2 = (x) => JSON.parse(JSON.stringify(x));
    var clamp2 = (n, a, b) => Math.max(a, Math.min(b, n));
    var canonical = (x) => JSON.stringify(x, (_, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
    var same = (a, b) => canonical(a) === canonical(b);
    var rows = [
      ["S_zg01_sanjia", "三家分晉", "晉陽分洪", "堤上調度者", "flood", "n_08", "風雨圍城、調度守城前", ["plan", "foresight"], "調整三座分洪閘，再放水驗流。五輪來水不同；分流總量須等於來水，各閘也不可超載。至少守住四輪。"],
      ["S_zg02_weiwen", "魏文霸業", "鄴渠分流", "渠床測繪者", "canal", "n_23", "西門豹治渠前", ["precise", "plan"], "點渠格挖低一級。水從左中源頭沿相鄰且更低的渠床流動，把水引到右側三田，再驗水。挖得太低會斷掉後續坡降，先規劃再動工。"],
      ["S_zg03_shangyang", "商鞅變法", "徙木守衡", "搬木同行者", "balance", "n_08", "南門徙木前", ["steady", "swift"], "看側風，左右移重心，再抬木走一段。六段風向不同；重心加側風須落在安全區。此操作不代替徙木後如約給賞。"],
      ["S_zg04_jixia", "稷下百家", "開言接力", "進言疏流者", "forum", "n_19", "學宮論辯前", ["plan", "listen"], "三條進言通道每輪都會有人加入。點通道接引一人，用完四次調度或全員接引後再開下一輪；四輪至少接引十二人，不能讓通道積壓。通道不是意見正誤分級。"],
      ["S_zg05_maling", "桂陵馬陵", "灶影伏節", "伏陣傳令者", "ambush", "n_16", "減灶傳令時", ["foresight", "steady"], "按各組行程設定出發延遲，再發合令。三組須在相近時刻抵達；三輪地形與行程不同。這是自編協同操演，不把遊戲秒數當作史書實測。"],
      ["S_zg06_hezong", "合縱連橫", "六國盟約盤", "盟約協調者", "treaty", "n_10", "六國遊說時", ["plan", "trace"], "每輪替六國組成三組互惠約定；每國只能加入一組，兩方物資須不同，且不能碰當輪禁配。三輪都要重新議約。物資與禁配為自編模型。"],
      ["S_zg07_quyuan", "屈原與楚", "江流護簡", "江畔護簡者", "drift", "n_17", "江畔行吟時", ["swift", "light"], "每段先划一次左、停槳或右，再順流前進。水流會再推一格；接取竹簡、避開浮木，八段至少護回四束。護簡是自編照應情境，不改寫屈原結局。"],
      ["S_zg08_hufu", "胡服與火牛", "騎射校場", "騎射操練者", "archery", "n_04", "趙國騎射教練時", ["precise", "steady"], "移動準星，補償風偏與馬步晃動後放箭。命中八靶；五次落空即須重試。可點靶盤或調整瞄準座標，不必使用鍵盤移動。"],
      ["S_zg09_mengchang", "孟嘗君", "三窟機關", "避難處整備者", "locks", "n_17", "三窟規劃後、薛地宗廟整備時", ["precise", "trace"], "把九枚三色鑰牌放進三道門。每門三色俱全，同一高度跨三門不得同色，各門第一格還須合門冠色；核對後逐門開啟。機關是自編，不代表史書實有彩鎖。"],
      ["S_zg10_changping", "將相長平", "護璧移位", "歸璧接應者", "jade", "n_07", "秦廷齋戒後、從者懷璧走小路時", ["plan", "trace"], "點空格旁的木牌推移，把九宮重排為一到八、空格在右下；一號牌代表玉璧。不能跳格或直接搬玉，須在步數內開出歸璧通道。"],
      ["S_zg12_handan", "邯鄲之圍", "雙使接應", "救趙接應者", "twin", "n_21", "合符後、魏軍在鄴地整軍接應時", ["light", "plan"], "切換兩位使者、點相鄰格移動。一人守二號壓板，另一人通過六號門；再一人守七號壓板，另一人通過十號門，門開後保持開啟。兩人各訪三號與十一號接應點，再到各自終點。"],
      ["S_zg13_tongyi", "天下一統", "度量衡工坊", "衡器校準者", "measures", "n_28", "六國年表完成後、秦廷議帝號時", ["precise", "plan"], "調配一、三、五單位砝碼，在指定枚數內稱準目標，完成三輪校準。這是統一後治理的自編延伸，砝碼數值不宣稱是秦代實物規格。"]
    ];
    var reading = [
      { quotes: [["《資治通鑑・周紀一》", "城不浸者三版。沈竈產鼃，民無叛意。"], ["《資治通鑑・周紀一》", "臣聞脣亡則齒寒。今智伯帥韓、魏而攻趙，趙亡則韓、魏為之次矣。"]], qs: [
        ["民心與守城", "爐竈中有蛙而民無叛意，突出了哪個對照？", ["水困嚴重，人民仍願共同堅守", "城中完全沒有進水", "守城只靠城牆厚度"], 0, 0],
        ["共同利害", "張孟談以脣亡齒寒說明什麼？", ["三家彼此毫無關係", "趙亡後，韓魏也可能受威脅", "韓魏已被趙氏滅亡"], 1, 1],
        ["民心與守城", "五輪分洪達標，是否足以說明史文的民無叛意？", ["足夠，遊戲水位就是人民想法", "足夠，原文只記三座閘", "不足，還須連讀人民與統治者的關係"], 2, 0],
        ["共同利害", "遊戲分流須互相配合，與說辭可相通的是？", ["只要一方得利就永不生變", "看見各方安危互相牽連，才能談合作", "韓魏應無條件接受智伯所有要求"], 1, 1],
        ["民心與守城", "若改寫為城已乾燥所以民心不變，哪裡不合原句？", ["忽略沈竈產鼃所寫的水困", "把蛙解成動物", "保留人民的反應"], 0, 0],
        ["共同利害", "下列哪項推論有原文支持？", ["智伯永不再索地", "韓魏已完全安全", "韓魏不能把趙亡視為與己無關"], 2, 1]
      ] },
      { quotes: [["《史記・滑稽列傳》", "西門豹即發民鑿十二渠，引河水灌民田，田皆溉。"], ["《史記・滑稽列傳》", "當其時，民治渠少煩苦，不欲也。"]], qs: [
        ["工程目的", "鑿十二渠的直接用途是？", ["築祭壇續收娶婦錢", "引河水灌溉民田", "只為顯示官員威嚴"], 1, 0],
        ["民力負擔", "民治渠少煩苦，不欲也寫出什麼？", ["工程開始時百姓覺得辛苦、不願做", "百姓從未參與工程", "渠已完全失去灌溉功能"], 0, 1],
        ["工程目的", "三塊田通水後，能否說遊戲還原了鄴城全部渠網？", ["可以，三田就是原文十二渠", "可以，畫面等同考古圖", "不能，縮小模型只呈現引水與坡降的關係"], 2, 0],
        ["民力負擔", "若只追求驗水成功而不計挖渠成本，會漏讀什麼？", ["官員的衣服顏色", "當時百姓承受的工程負擔", "河伯娶婦已被恢復"], 1, 1],
        ["工程目的", "田皆溉中的溉應解為？", ["得到灌溉", "全被淹沒而棄耕", "每田都建祭壇"], 0, 0],
        ["民力負擔", "哪種說法能同時保留工程成果與民眾處境？", ["既有成果就不必再談成本", "百姓不欲，證明水渠永久無用", "水利可有成效，初期辛苦仍須被看見"], 2, 1]
      ] },
      { quotes: [["《史記・商君列傳》", "民怪之，莫敢徙。復曰「能徙者予五十金」。有一人徙之，輒予五十金，以明不欺。"], ["《史記・商君列傳》", "衛鞅曰：「法之不行，自上犯之。」將法太子。"]], qs: [
        ["徙木立信", "徙木後輒予五十金，重點在？", ["立即依約給賞，以示不欺", "搬木者成為秦王", "所有人已先相信新令"], 0, 0],
        ["法與責任", "自上犯之把法不行的問題指向哪裡？", ["人民天生不懂法律", "木頭的重量", "上位者違犯規範的影響"], 2, 1],
        ["徙木立信", "守衡搬木完成後，立信還需要哪個行動？", ["再把賞金取消", "如約履行承諾", "只稱讚遊戲速度"], 1, 0],
        ["法與責任", "若把操作成功當作任何執法都正當，問題是？", ["忽略法律實施仍須檢視上位者與具體責任", "對法之不行作了字面翻譯", "保留上犯的主語"], 0, 1],
        ["徙木立信", "莫敢徙與有人徙之形成哪種變化？", ["從人人搬運到無人搬運", "從不敢行動到有人實行並獲兌賞", "從五十金變成沒有獎賞"], 1, 0],
        ["法與責任", "法之不行的行，在此最接近？", ["道路", "隊伍排列", "施行、實行"], 2, 1]
      ] },
      { quotes: [["《戰國策・齊策一》", "吾妻之美我者，私我也；妾之美我者，畏我也；客之美我者，欲有求於我也。"], ["《戰國策・齊策一》", "群臣吏民，能面刺寡人之過者，受上賞；上書諫寡人者，受中賞；能謗議於市朝，聞寡人之耳者，受下賞。"]], qs: [
        ["說話者關係", "妻、妾、客都稱美，鄒忌反省的重點是？", ["三人必然共同策畫欺騙", "說話者與自己的關係可能影響評價", "所有讚美一律無價值"], 1, 0],
        ["進諫管道", "齊王的命令列出哪些方式？", ["只有私下稱讚", "只許軍人書信", "當面、上書及市朝議論等進言管道"], 2, 1],
        ["說話者關係", "疏通進言人流，能否直接判定每個人的話都真實？", ["不能，仍須查核內容與關係", "能，排到隊就一定正確", "能，三條通道等於三種固定真理"], 0, 0],
        ["進諫管道", "為何不應把隊列長短當成意見好壞？", ["原文禁止所有人說話", "管道與內容品質是不同問題，須讓意見可被聽見再判斷", "通道越窄內容必越真"], 1, 1],
        ["說話者關係", "私我在這句指什麼？", ["偏愛我", "私藏我的畫像", "獨自在家"], 0, 0],
        ["進諫管道", "面刺寡人之過的刺最接近？", ["真正用兵器傷人", "只在背後讚美", "當面指出過失"], 2, 1]
      ] },
      { quotes: [["《史記・孫子吳起列傳》", "使齊軍入魏地為十萬灶，明日為五萬灶，又明日為三萬灶。"], ["《史記・孫子吳起列傳》", "彼三晉之兵素悍勇而輕齊，齊號為怯，善戰者因其勢而利導之。"]], qs: [
        ["減灶次序", "灶數的先後變化是？", ["三萬、五萬、十萬", "十萬、五萬、三萬", "每天保持十萬"], 1, 0],
        ["因勢利導", "輕齊在此是什麼意思？", ["使齊軍裝備變輕", "齊國地形較低", "輕視齊軍"], 2, 1],
        ["減灶次序", "三輪伏節的倒數能否直接證明史書灶數？", ["不能，須用原文明載的三日灶數核對", "能，倒數設定就是古代帳簿", "能，三輪表示三灶"], 0, 0],
        ["因勢利導", "若只背減灶數字，不讀敵軍輕齊，會忽略？", ["三晉兵素來悍勇的字義", "計策借用對方既有判斷傾向的條件", "龐涓從未參戰"], 1, 1],
        ["減灶次序", "第二天五萬灶，相對第一天表示什麼？", ["火灶增加一倍", "齊軍被證明真的只剩五萬人", "所見灶數減半，不能直接當實際逃亡統計"], 2, 0],
        ["因勢利導", "哪個解讀最合因其勢而利導之？", ["利用當前情勢與對方傾向加以引導", "任何戰場都照同一數字即可必勝", "完全不用觀察敵情"], 0, 1]
      ] },
      { quotes: [["《戰國策・秦策一》〈蘇秦以連橫說秦〉", "說秦王書十上而說不行。黑貂之裘弊，黃金百斤盡，資用乏絕，去秦而歸。"], ["《史記・蘇秦列傳》", "蘇秦為從約長，並相六國。"]], qs: [
        ["遊說處境", "說不行與資用乏絕連讀，寫出？", ["遊說成功後富貴歸鄉", "秦王不能行走", "主張未被採納且資財用盡的失意"], 2, 0],
        ["合縱身分", "從約長與並相六國突出蘇秦的何種身分？", ["聯盟約定的領導者、兼任六國相職", "六國都已由秦王統治", "已永久消除所有國際衝突"], 0, 1],
        ["遊說處境", "三輪互惠配對有何閱讀界線？", ["配對分數等於蘇秦的黃金百斤", "遊戲只示範協調取捨，不能抹去蘇秦曾失意的敘事", "所有遊說第一次必成功"], 1, 0],
        ["合縱身分", "完成三組配對後，還應避免哪種推論？", ["蘇秦參與從約", "各國利益需要協調", "合縱既成便永不需要維繫"], 2, 1],
        ["遊說處境", "去秦而歸的去是？", ["離開", "前往秦國", "再上書一次"], 0, 0],
        ["合縱身分", "並相六國的並最接近？", ["六國地圖相鄰", "兼、同時", "把六國合併成一個郡"], 1, 1]
      ] },
      { quotes: [["《楚辭・漁父》", "舉世皆濁我獨清，眾人皆醉我獨醒，是以見放。"], ["《楚辭・漁父》", "聖人不凝滯於物，而能與世推移。"]], qs: [
        ["人物自述", "屈原以清濁醉醒說明什麼？", ["只在報告水質與酒量", "自認與世態不合，因而被放逐", "承認自己完全沒有主張"], 1, 0],
        ["處世分歧", "漁父所說與世推移偏向？", ["永不因情勢調整", "必須傷害自己證明清白", "不拘泥一端，隨時勢調整處世"], 2, 1],
        ["人物自述", "順流護簡成功，是否已替屈原與漁父判出誰絕對正確？", ["沒有，操作分數不能代替兩種價值立場的辨析", "已經證明所有人都濁", "已經取消屈原被放逐的情節"], 0, 0],
        ["處世分歧", "船可順流或修正方向，適合用來提出哪種閱讀問題？", ["屈原一定不會划船", "堅守與因應各有什麼條件及代價", "漁父命令所有人不讀書"], 1, 1],
        ["人物自述", "見放中的見表示？", ["看見別人", "被，表被動", "立即見到君王"], 1, 0],
        ["處世分歧", "凝滯於物與與世推移形成？", ["同義重複", "水流快慢的實測記錄", "拘泥與調整之間的對照"], 2, 1]
      ] },
      { quotes: [["《史記・趙世家》", "今吾將胡服騎射以教百姓，而世必議寡人，柰何？"], ["《史記・趙世家》", "臣聞疑事無功，疑行無名。"]], qs: [
        ["改革阻力", "世必議寡人寫出趙武靈王擔心？", ["世俗輿論對改革的批評", "完全不懂騎射用途", "已經下令停止一切軍事訓練"], 0, 0],
        ["決斷與條件", "疑事無功、疑行無名主要勸什麼？", ["遇到風險就不必查核", "考量後不要因猶疑而不實行", "任何衝動都會成功"], 1, 1],
        ["改革阻力", "八靶全中後，胡服改革的哪些問題仍不能靠分數回答？", ["靶心的位置", "箭偏左或偏右", "制度、禮俗與輿論的阻力如何處理"], 2, 0],
        ["決斷與條件", "射擊要先補風偏再決定，與原句相連時應保留？", ["決斷仍須建立在條件與判斷上", "瞄準越少越等於有名", "所有改革都只需要箭術"], 0, 1],
        ["改革阻力", "柰何最接近？", ["不用再問", "怎麼辦", "百姓已全部服從"], 1, 0],
        ["決斷與條件", "把原句改讀為有疑問的人都不准發言，哪裡不妥？", ["失去猶疑不行難成事的語境", "保留了無功兩字", "正確呈現了諮詢討論"], 0, 1]
      ] },
      { quotes: [["《戰國策・齊策四》", "狡兔有三窟，僅得免其死耳；今君有一窟，未得高枕而臥也。請為君復鑿二窟。"], ["《戰國策・齊策四》", "臣竊計，君宮中積珍寶，狗馬實外廄，美人充下陳。君家所寡有者以義耳！竊以為君市義。"]], qs: [
        ["三窟與風險", "兔有三窟的比喻要提醒？", ["只靠一處依憑還不穩妥，須另作安排", "真的要替孟嘗君養三隻兔子", "三次開門就能永遠無事"], 0, 0],
        ["市義轉折", "馮諼把君家所少解為什麼？", ["珍寶更多", "義與民心", "馬匹數量"], 1, 1],
        ["三窟與風險", "三門全開後，為何仍不能寫成孟嘗君永久安全？", ["機關少用一枚鑰匙", "史文完全沒有談風險", "比喻強調增加依憑，僅得免其死仍有界線"], 2, 0],
        ["市義轉折", "若把全部成功只歸給機關巧妙，會忽略？", ["收買更多珍寶才是全文唯一目的", "馮諼把物質所缺轉成義與民心的判斷", "門冠顏色是歷史事實"], 1, 1],
        ["三窟與風險", "復鑿二窟的復在此是？", ["再、另外", "恢復一隻兔子", "否定已有一窟"], 0, 0],
        ["市義轉折", "市義中的市應讀為？", ["市場地名", "搬家", "買，用買物比喻取得義"], 2, 1]
      ] },
      { quotes: [["《史記・廉頗藺相如列傳》", "乃使其從者衣褐，懷其璧，從徑道亡，歸璧於趙。"], ["《史記・廉頗藺相如列傳》", "秦亦不以城予趙，趙亦終不予秦璧。"]], qs: [
        ["歸璧分工", "從者衣褐、從徑道亡的行動是？", ["秦王公開護送璧往趙", "藺相如把璧送入秦倉", "從者穿粗布衣，懷璧由小路逃回趙"], 2, 0],
        ["外交結果", "這段交涉的結果是？", ["秦未交城，趙最終也未交璧", "秦已正式交出十五城", "從者成為秦王"], 0, 1],
        ["歸璧分工", "移位通路完成後，原文中的歸璧由誰執行？", ["方格牌自己飛回趙", "相如所派的從者", "秦王親自駕車"], 1, 0],
        ["外交結果", "不能把滑塊全復位寫成成功換得十五城，因為？", ["遊戲牌只有八枚", "十五是錯誤數字", "原文明記秦亦不以城予趙"], 2, 1],
        ["歸璧分工", "衣褐的衣在此是？", ["衣服的顏色", "穿，作動詞", "把璧交還秦王"], 1, 0],
        ["外交結果", "終不予秦璧的終提示？", ["最後、最終的結果", "事情從未開始", "秦趙已結為一國"], 0, 1]
      ] },
      { quotes: [["《史記・魏公子列傳》", "公子從車騎，虛左，自迎夷門侯生。"], ["《史記・魏公子列傳》", "將在外，主令有所不受，以便國家。"]], qs: [
        ["禮士行動", "虛左、自迎具體表現什麼？", ["空著尊位，親自迎接侯生", "讓侯生永遠在城門等待", "命車騎阻止侯生上車"], 0, 0],
        ["軍令與責任", "將在外有所不受所依據的理由是？", ["凡事只顧個人名聲", "讓軍事處置有利於國家", "將領永遠不用負責"], 1, 1],
        ["禮士行動", "兩使協作開門，與信陵君禮士可以相連的是？", ["每位賓客都應替他控制機關", "原文真的有兩道彩色壓板", "不同角色需要被尊重，也須有實際參與的空間"], 2, 0],
        ["軍令與責任", "若以遊戲門已打開便斷言任何抗命都合理，忽略了？", ["以便國家的理由與具體情勢", "將在外的外字", "按鈕的大小"], 0, 1],
        ["禮士行動", "自迎的自指？", ["自己親自", "自動車隊", "侯生不必參加"], 0, 0],
        ["軍令與責任", "有所不受中的有所在語意上表示？", ["所有命令一律不接受", "毫無條件永遠服從", "某些情況下不接受，不能擴成無限制拒令"], 2, 1]
      ] },
      { quotes: [["《史記・秦始皇本紀》", "秦王初並天下，令丞相、御史曰……"], ["《戰國策・魏策四》", "秦王色撓，長跪而謝之曰：「先生坐，何至於此，寡人諭矣。夫韓、魏滅亡，而安陵以五十里之地存者，徒以有先生也。」"]], qs: [
        ["統一與治理", "初並天下在本篇年代線上指？", ["秦完成六國統一，隨後議帝號", "秦已被漢取代", "荊軻成功奪位"], 0, 0],
        ["事件界線", "安陵插曲中，秦王色撓、長跪謝之是？", ["天下從此永久停戰", "這一段與唐雎對話中的態度轉變", "秦王宣布禪位唐雎"], 1, 1],
        ["統一與治理", "衡器校準完成，是否能說政治統一已解決所有治理問題？", ["能，砝碼從不需要再檢查", "能，初並等於永久太平", "不能，制度推行與民生仍需繼續面對"], 2, 0],
        ["事件界線", "回看安陵插曲時，為何不能把秦王謝之直接當作統一終止？", ["具體對話結果有其範圍，不能推成全天下歷史結局", "謝只表示聲音變大", "韓魏滅亡是遊戲憑空捏造"], 0, 1],
        ["統一與治理", "並天下的並在此是？", ["並排列隊", "兼併、統一", "同時擺放三顆砝碼"], 1, 0],
        ["事件界線", "徒以有先生也的徒最接近？", ["徒弟", "徒步", "只、僅僅"], 2, 1]
      ] }
    ];
    var PILOTS2 = rows.map((r, i) => ({ id: r[0], name: r[1], title: r[2], role: r[3], mechanic: r[4], node: r[5], point: r[6], recommended: r[7], rule: r[8], kind: "warring", scene: "scene:zg" + r[0].slice(4, 6) + "_world", source: reading[i].quotes[0][0], quote: reading[i].quotes[0][1], brief: "以自己的角色完成「" + r[2] + "」，各篇保留原有必做體驗與史實走向。", after: "同行任務完成。回到原篇人物與事件；這項自編推演不改變人物決定及史實結局。" }));
    var CHAPTERS2 = Object.fromEntries(PILOTS2.map((p, i) => {
      const r = reading[i], qs = r.qs.map((a, n) => ({ id: "wa-" + (n < 2 ? "e" : n < 4 ? "f" : "r") + (n % 2 + 1), tag: a[0], prompt: a[1], choices: a[2], answer: a[3], evidence: r.quotes.map((q, j) => ({ id: "quote" + j, text: q[1] + "（" + q[0] + "）" })), correctEvidence: "quote" + a[4], explain: "請核對這一句原文及其說話者、前後情勢；同行操作不會替你回答。", ...n >= 4 ? { tags: [a[0]] } : {} }));
      return [p.id, { title: p.title, intro: p.brief, evidence: qs.slice(0, 2), reflection: qs.slice(2, 4), remedy: qs.slice(4) }];
    }));
    var nations = ["韓", "趙", "魏", "楚", "燕", "齊"];
    var goodsNames = ["穀", "馬", "鐵"];
    var jadeGoal = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    var skillNames = { swift: "迅影", steady: "握定", precise: "巧勁", foresight: "望勢", listen: "聽息", light: "輕裝", plan: "運籌", trace: "留痕" };
    var allowed = { flood: ["plan", "foresight", "listen", "trace"], canal: ["precise", "plan", "foresight", "trace"], balance: ["swift", "steady", "precise", "foresight", "light", "trace"], forum: ["plan", "listen", "foresight", "trace"], ambush: ["steady", "foresight", "plan", "trace"], treaty: ["plan", "foresight", "trace", "listen"], drift: ["swift", "steady", "foresight", "listen", "light", "trace"], archery: ["swift", "steady", "precise", "foresight", "listen", "light", "trace"], locks: ["precise", "plan", "foresight", "trace"], jade: ["plan", "foresight", "trace", "light"], twin: ["plan", "foresight", "listen", "light", "trace"], measures: ["precise", "plan", "foresight", "trace"] };
    var SKILL_DESCRIPTIONS = { swift: "迅影：搬木可抵消一級側風；護簡短暫免划槳耗力；騎射時減半馬步晃動。", steady: "握定：搬木、伏節與騎射短暫擴大容許誤差；護簡可抵一次浮木衝撞。", precise: "巧勁：騎射短暫擴大命中範圍；搬木增加平衡餘裕，工程與機關顯示局部核對提示。", foresight: "望勢：預看下一輪水勢、來人、行程或江流，亦可看機關及砝碼條件。", listen: "聽息：靜候兩秒，八秒內操作誤判有一次不扣品質的重整機會。", light: "輕裝：搬運與划槳更省力；推牌、雙使多十步；騎射晃動減少15%，總時限減少25秒。", plan: "運籌：補充工程、通道調度、推移或核對餘裕；分洪多一單位暫存，吸收一次小幅差額。", trace: "留痕：記下當前進度與操作盤面，供自己對照後續改動。" };
    function pilot2(w) {
      return PILOTS2.find((p) => p.id === (typeof w === "string" ? w : w.id));
    }
    function compatible2(c, id) {
      const p = pilot2(id);
      return !!p && c.skills.every((k) => allowed[p.mechanic].includes(k));
    }
    function limit(c) {
      return 240 + c.stats.focus * 8 - (c.skills.includes("light") ? 25 : 0);
    }
    function routes(id) {
      const p = pilot2(id);
      return [{ id: "companion", name: p.title, brief: p.rule, build: "臂力增加工程及搬運餘裕；巧手、身法協助操作；察勢、籌算提供觀察與安排空間。", tradeoff: "配點與能力只能增加操作餘裕，原文證據和反思仍須自己判斷。" }];
    }
    var active = (w, id) => (w.buffs[id] || 0) > w.time;
    var integer = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
    function adjacent(a, b, cols = 4, total = 16) {
      return integer(b, 0, total - 1) && Math.abs(a % cols - b % cols) + Math.abs(Math.floor(a / cols) - Math.floor(b / cols)) === 1;
    }
    function initial(w) {
      const s = w.snapshot.config.stats, k = pilot2(w).mechanic, g = { version: 1, mechanic: k, log: [], errors: 0, spent: 0, done: false };
      if (k === "flood") Object.assign(g, { round: 0, gates: [0, 0, 0], damage: 0, saved: 0, reserve: 0, maxDamage: 3 + Math.floor(s.strength / 2) });
      if (k === "canal") Object.assign(g, { heights: Array(12).fill(4), dug: 0, budget: 30 + s.strength * 2 + s.planning, tests: 0 });
      if (k === "canal") g.heights[4] = 5;
      if (k === "balance") Object.assign(g, { stage: 0, lean: 0, shifts: 0, fatigue: 0, endurance: 20 + s.strength * 2 + (w.snapshot.config.skills.includes("light") ? 4 : 0) });
      if (k === "forum") Object.assign(g, { round: 0, queues: [3, 3, 3], orders: 4, served: 0, overflow: 0 });
      if (k === "ambush") Object.assign(g, { round: 0, delays: [0, 0, 0], attempts: 0, budget: 6 + Math.floor(s.planning / 2), arrivals: [] });
      if (k === "treaty") Object.assign(g, { round: 0, pairs: [], agreements: [], attempts: 0, budget: 6 + Math.floor(s.planning / 2) });
      if (k === "drift") Object.assign(g, { stage: 0, lane: 1, energy: 6 + Math.floor(s.strength / 2), scrolls: 0, hull: 4, paddled: false, held: false });
      if (k === "archery") Object.assign(g, { target: 0, aim: { x: 50, y: 50 }, shots: 0, hits: 0, misses: 0 });
      if (k === "locks") Object.assign(g, { slots: Array(9).fill(null), tokens: [0, 1, 2, 0, 1, 2, 0, 1, 2], opened: [], attempts: 0, budget: 7 + Math.floor(s.planning / 2) });
      if (k === "jade") {
        let board = jadeGoal.slice(), blank = 8, previous = -1, n = w.seed >>> 0;
        for (let i = 0; i < 20; i++) {
          const choices = board.map((_, j) => j).filter((j) => adjacent(blank, j, 3, 9) && j !== previous);
          n = Math.imul(n, 1664525) + 1013904223 >>> 0;
          const at = choices[n % choices.length];
          [board[blank], board[at]] = [board[at], board[blank]];
          previous = blank;
          blank = at;
        }
        if (same(board, jadeGoal)) {
          [board[8], board[7]] = [board[7], board[8]];
          blank = 7;
        }
        Object.assign(g, { board, blank, moves: 0, budget: 70 + s.planning * 6 + (w.snapshot.config.skills.includes("light") ? 10 : 0) });
      }
      if (k === "twin") Object.assign(g, { positions: [0, 4], active: 0, visits: [[], []], unlocked: [false, false], delivered: [false, false], steps: 0, budget: 80 + s.planning * 5 + (w.snapshot.config.skills.includes("light") ? 10 : 0) });
      if (k === "measures") Object.assign(g, { round: 0, weights: [0, 0, 0], attempts: 0, budget: 6 + Math.floor(s.planning / 2), calibrated: [] });
      return g;
    }
    function floodState(w, round = w.campaign.round) {
      const inflow = [5, 4, 6, 5, 3][round % 5], ceilings = [[2, 2, 3], [1, 3, 2], [3, 2, 2], [2, 3, 1], [1, 2, 3]][(round + w.seed % 5) % 5];
      return { inflow, ceilings };
    }
    function watered(w) {
      const h = w.campaign.heights, seen = /* @__PURE__ */ new Set([4]), queue = [4];
      for (let i = 0; i < queue.length; i++) for (let j = 0; j < 12; j++) if (adjacent(queue[i], j, 4, 12) && h[j] < h[queue[i]] && !seen.has(j)) {
        seen.add(j);
        queue.push(j);
      }
      return [...seen];
    }
    function balanceState(w, stage = w.campaign.stage) {
      const s = w.snapshot.config.stats, wind = [-2, 1, 2, -1, 2, -2][(stage + w.seed % 6) % 6];
      return { wind: active(w, "swift") ? Math.sign(wind) * Math.max(0, Math.abs(wind) - 1) : wind, tolerance: 0.4 + s.dexterity * 0.12 + s.agility * 0.08 + Math.floor(s.strength / 3) * 0.2 + (active(w, "steady") ? 0.8 : 0) + (active(w, "precise") ? 0.5 : 0) };
    }
    function incoming(w, round = w.campaign.round) {
      return [0, 1, 2].map((i) => [0, 1, 2][(i + round + w.seed) % 3]);
    }
    function ambushState(w, round = w.campaign.round) {
      return { travel: [0, 1, 2].map((i) => 2 + (w.seed + round * 2 + i * 3) % 5), tolerance: 0.35 + w.snapshot.config.stats.insight * 0.08 + (active(w, "steady") ? 1 : 0) };
    }
    function treatyState(w, round = w.campaign.round) {
      return { goods: [0, 1, 2, 0, 1, 2].map((x, i) => (x + round * (i % 2)) % 3), forbidden: [[round % 6, (round + 1) % 6]], round };
    }
    function river(w, stage = w.campaign.stage) {
      return { current: [-1, 0, 1, 0][(stage + w.seed) % 4], scroll: (stage + w.seed) % 3, obstacle: (stage + w.seed + 1) % 3 };
    }
    function target(w) {
      const g = w.campaign, s = w.snapshot.config.stats;
      return { x: 30 + (w.seed + g.target * 7) % 41, y: 30 + (w.seed * 2 + g.target * 11) % 41, wind: ((w.seed + g.target) % 5 - 2) * 4, motion: Math.sin(w.time * 2 + g.target) * 8 * (active(w, "swift") ? 0.5 : 1) * (w.snapshot.config.skills.includes("light") ? 0.85 : 1), radius: 4 + s.dexterity * 0.7 + s.agility * 0.2 + (active(w, "precise") ? 5 : 0) + (active(w, "steady") ? 3 : 0) };
    }
    function keyClues(w) {
      return [0, 1, 2].map((x) => (x + w.seed) % 3);
    }
    function measureState(w, round = w.campaign.round) {
      return { unit: [1, 3, 5], target: [11, 14, 17][(round + w.seed % 3) % 3], cap: [5, 4, 5][(round + w.seed % 3) % 3] };
    }
    function uiHints(w) {
      const g = w.campaign, out = [];
      if (g.mechanic === "flood" && g.reserve) out.push("運籌暫存尚餘 " + g.reserve + " 單位；可吸收等量總分流差額，單閘上限仍須遵守。");
      if (active(w, "foresight")) {
        const k = g.mechanic;
        if (k === "flood") {
          const n = floodState(w, g.round + 1);
          out.push("下一輪來水 " + n.inflow + "；閘限 " + n.ceilings.join("/"));
        } else if (k === "canal") out.push("望勢測流：目前可到 " + watered(w).map((x) => x + 1).join("、") + " 格；留意右側三田前還要保留下降空間。");
        else if (k === "balance") out.push("下一段側風：" + balanceState(w, g.stage + 1).wind + "；移重心前可先規劃負荷。");
        else if (k === "forum") out.push("下一輪各通道新增：" + incoming(w, g.round + 1).join("/"));
        else if (k === "ambush") out.push("下一輪行程：" + ambushState(w, g.round + 1).travel.join("/"));
        else if (k === "treaty") {
          const n = treatyState(w, g.round + 1);
          out.push("下一輪物資 " + n.goods.map((x) => goodsNames[x]).join("/") + "；禁配 " + n.forbidden.map((p) => p.map((x) => nations[x]).join("／")).join("、") + "。");
        } else if (k === "drift") {
          const n = river(w, g.stage + 1);
          out.push("下一段水流 " + n.current + "，竹簡在 " + (n.scroll + 1) + " 道。");
        } else if (k === "archery") out.push("下一靶風偏：" + ((w.seed + g.target + 1) % 5 - 2) * 4 + "；馬步仍持續晃動。");
        else if (k === "locks") out.push("三門門冠次序：" + keyClues(w).map((x) => ["青", "赤", "金"][x]).join("／") + "；先固定首格再核對同高度。");
        else if (k === "jade") {
          const distance = g.board.reduce((n, x, i) => x ? n + Math.abs(i % 3 - (x - 1) % 3) + Math.abs(Math.floor(i / 3) - Math.floor((x - 1) / 3)) : n, 0);
          out.push("各牌到目標的總格距：" + distance + "；這是最低移動需求參考，不含互相讓路。");
        } else if (k === "twin") out.push("另一使者目前在 " + g.positions[1 - g.active] + " 號格；六號門" + (g.unlocked[0] ? "已開" : "尚需守二號壓板") + "、十號門" + (g.unlocked[1] ? "已開" : "尚需守七號壓板") + "。");
        else if (k === "measures") {
          const n = measureState(w, g.round + 1);
          out.push("下一輪目標 " + n.target + "，砝碼最多 " + n.cap + " 枚；可先估算較大砝碼的使用。");
        }
      }
      if (active(w, "precise")) {
        if (g.mechanic === "canal") out.push("巧勁測流：目前水已到 " + watered(w).map((x) => x + 1).join("、") + " 格；渠床必須逐步降低。");
        else if (g.mechanic === "locks") out.push("巧勁核對：逐門三色俱全，同高度不可重色；先檢查門冠首格。");
        else if (g.mechanic === "measures") out.push("巧勁讀秤：目前差 " + (measureState(w).target - g.weights.reduce((a, n, i) => a + n * [1, 3, 5][i], 0)) + " 單位。");
        else out.push("巧勁中：操作容許誤差已暫時擴大。");
      }
      if (active(w, "steady")) out.push("握定中：平衡、同步與命中容許擴大，或可護住一次浮木碰撞。");
      if (active(w, "swift")) out.push("迅影中：搬木、划槳或騎射操作更有餘裕。");
      if (active(w, "listening")) out.push("聽息中：先靜候兩秒，本次重整可免一次品質扣分。");
      if (w.trace) out.push("留痕：" + w.trace.summary);
      return out;
    }
    function skill2(w, id) {
      const g = w.campaign;
      if (!w.snapshot.config.skills.includes(id) || id === "light" || (w.uses[id] || 0) >= 2 || w.time < (w.cooldowns[id] || 0)) return false;
      w.uses[id] = (w.uses[id] || 0) + 1;
      w.cooldowns[id] = w.time + 10;
      if (id === "trace") w.trace = { mechanic: g.mechanic, at: w.time, summary: summary(w), board: copy2(Object.fromEntries(Object.entries(g).filter(([k]) => k !== "log"))) };
      else if (id === "plan") {
        if (g.mechanic === "forum") g.orders += 2;
        else if (["canal", "jade", "twin"].includes(g.mechanic)) g.budget += g.mechanic === "canal" ? 8 : 12;
        else if ("budget" in g) g.budget += 2;
        else if (g.mechanic === "flood") {
          g.maxDamage++;
          g.reserve++;
        } else w.buffs.foresight = w.time + 10;
      } else if (id === "listen") {
        w.buffs.listening = w.time + 8;
        g.held = true;
      } else w.buffs[id] = w.time + (id === "foresight" ? Math.min(18, 10 + w.snapshot.config.stats.insight) : 8);
      w.notice = "已使用" + skillNames[id] + "；原文與主要操作仍由你完成。";
      return true;
    }
    function reduce(w, name, v) {
      const g = w.campaign, k = g.mechanic;
      let failed = false;
      const fail = (text) => {
        failed = true;
        if (g.held && active(w, "listening")) {
          g.held = false;
          w.notice = "聽息重整：" + text;
          return true;
        }
        g.errors++;
        w.errors = g.errors;
        w.notice = text;
        return true;
      };
      if (name === "skill") return skill2(w, v);
      if (k === "flood" && name === "setGate" && v && integer(v.index, 0, 2) && integer(v.value, 0, 3)) g.gates[v.index] = v.value;
      else if (k === "flood" && name === "release") {
        const a = floodState(w), gap = Math.abs(g.gates.reduce((a2, b) => a2 + b, 0) - a.inflow);
        if (gap <= g.reserve && g.gates.every((x, i) => x <= a.ceilings[i])) {
          g.saved++;
          g.reserve -= gap;
        } else {
          g.damage++;
          fail("總分流量或單閘負荷不合，堤身承受一次損傷。");
        }
        g.round++;
        g.spent++;
        if (g.damage >= g.maxDamage) w.status = "lost";
        else if (g.round === 5) {
          g.done = g.saved >= 4;
          if (!g.done) w.status = "lost";
        }
      } else if (k === "canal" && name === "dig" && integer(v, 0, 11) && v !== 4) {
        if (g.dug >= g.budget) return fail("工程餘裕已用完，可用運籌補充或重新規劃。");
        if (g.heights[v] <= 0) return false;
        g.heights[v]--;
        g.dug++;
        g.spent++;
      } else if (k === "canal" && name === "testCanal") {
        g.tests++;
        if (![3, 7, 11].every((x) => watered(w).includes(x))) return fail("尚有田地未通水；檢查相鄰格是否逐級下降，別把中段挖得比出口還低。");
        g.done = true;
      } else if (k === "balance" && name === "shift" && [-1, 1].includes(v)) {
        if (Math.abs(g.lean + v) > 3) return false;
        g.lean += v;
        g.shifts++;
        g.fatigue += w.snapshot.config.skills.includes("light") || active(w, "swift") ? 0 : 1;
        g.spent++;
        if (g.fatigue > g.endurance) w.status = "lost";
      } else if (k === "balance" && name === "carry") {
        const a = balanceState(w);
        if (Math.abs(g.lean + a.wind) > a.tolerance) return fail("側風與重心尚未平衡，先調整再走。");
        g.stage++;
        g.fatigue++;
        g.lean = 0;
        g.spent++;
        g.done = g.stage === 6;
        if (g.fatigue > g.endurance && !g.done) w.status = "lost";
      } else if (k === "forum" && name === "dispatch" && integer(v, 0, 2)) {
        if (g.orders <= 0) return false;
        if (g.queues[v] === 0) return fail("這條通道暫無人等待，請先看其他通道。");
        g.queues[v]--;
        g.orders--;
        g.served++;
        g.spent++;
      } else if (k === "forum" && name === "nextForum") {
        if (g.orders > 0 && g.queues.some((n) => n > 0)) return fail("本輪調度尚未完成，先用完可用的接引次數。");
        g.round++;
        if (g.round === 4) {
          g.done = g.served >= 12 && g.queues.every((n) => n <= 3);
          if (!g.done) w.status = "lost";
        } else {
          g.queues = g.queues.map((n, i) => n + incoming(w)[i]);
          g.orders = 4;
          if (g.queues.some((n) => n > 5)) {
            g.overflow++;
            fail("通道過度積壓，請優先接引等候較多的一側。");
            if (g.overflow >= 2) w.status = "lost";
          }
        }
      } else if (k === "ambush" && name === "setDelay" && v && integer(v.index, 0, 2) && integer(v.value, 0, 6)) g.delays[v.index] = v.value;
      else if (k === "ambush" && name === "spring") {
        if (g.attempts >= g.budget) return fail("合令核對次數用完，可用運籌補充。");
        g.attempts++;
        g.spent++;
        const a = ambushState(w), arrivals = a.travel.map((x, i) => x + g.delays[i]);
        if (Math.max(...arrivals) - Math.min(...arrivals) > a.tolerance) return fail("三組到達差距過大；行程較短的組需要較晚出發。");
        g.arrivals.push(arrivals);
        g.round++;
        g.delays = [0, 0, 0];
        g.done = g.round === 3;
      } else if (k === "treaty" && name === "pair" && v && integer(v.a, 0, 5) && integer(v.b, 0, 5) && v.a !== v.b) {
        const pair = [v.a, v.b].sort((a, b) => a - b), at = g.pairs.findIndex((x) => same(x, pair));
        if (at >= 0) g.pairs.splice(at, 1);
        else {
          if (g.pairs.some((x) => x.includes(v.a) || x.includes(v.b))) return false;
          g.pairs.push(pair);
        }
      } else if (k === "treaty" && name === "ratify") {
        if (g.attempts >= g.budget) return fail("本局履約核對餘裕用完，可用運籌補充。");
        g.attempts++;
        g.spent++;
        const a = treatyState(w);
        if (g.pairs.length !== 3 || g.pairs.some(([x, y]) => a.goods[x] === a.goods[y] || a.forbidden.some((z) => same(z.slice().sort((x2, y2) => x2 - y2), [x, y])))) return fail("六國須各參與一組，物資互補且避開禁配；先撤去衝突配對再議。");
        g.agreements.push(copy2(g.pairs));
        g.round++;
        g.pairs = [];
        g.done = g.round === 3;
      } else if (k === "drift" && name === "row" && [-1, 0, 1].includes(v)) {
        if (g.paddled) return false;
        const cost = w.snapshot.config.skills.includes("light") || active(w, "swift") ? 0 : 1;
        if (v !== 0 && g.energy < cost) return fail("體力不足，停槳一段可回復兩點。");
        if (v === 0) g.energy = Math.min(8, g.energy + 2);
        else g.energy -= cost;
        g.lane = clamp2(g.lane + v, 0, 2);
        g.paddled = true;
        g.spent++;
      } else if (k === "drift" && name === "drift") {
        if (!g.paddled) return false;
        const a = river(w);
        g.lane = clamp2(g.lane + a.current, 0, 2);
        if (g.lane === a.obstacle) {
          if (active(w, "steady")) w.buffs.steady = w.time;
          else {
            g.hull--;
            fail("浮木撞船，先算進水流的推移再下槳。");
          }
        }
        if (g.lane === a.scroll) g.scrolls++;
        g.stage++;
        g.paddled = false;
        g.spent++;
        if (g.hull <= 0) w.status = "lost";
        else if (g.stage === 8) {
          g.done = g.scrolls >= 4;
          if (!g.done) w.status = "lost";
        }
      } else if (k === "archery" && name === "aim" && v && Number.isFinite(v.x) && Number.isFinite(v.y) && v.x >= 0 && v.x <= 100 && v.y >= 0 && v.y <= 100) g.aim = { x: Math.round(v.x * 100) / 100, y: Math.round(v.y * 100) / 100 };
      else if (k === "archery" && name === "fire") {
        const a = target(w), dx = g.aim.x + a.wind + a.motion - a.x, dy = g.aim.y - a.y;
        g.shots++;
        g.spent++;
        if (Math.hypot(dx, dy) <= a.radius) {
          g.hits++;
          g.target++;
          g.done = g.target === 8;
        } else {
          g.misses++;
          fail("未中靶；風偏與馬步晃動都會移動落點。");
          if (g.misses >= 5) w.status = "lost";
        }
      } else if (k === "locks" && name === "keyPlace" && v && integer(v.key, 0, 8) && integer(v.slot, 0, 8)) {
        if (g.opened.includes(Math.floor(v.slot / 3)) || g.slots[v.slot] !== null || g.slots.includes(v.key)) return false;
        g.slots[v.slot] = v.key;
        g.spent++;
      } else if (k === "locks" && name === "keyRemove" && integer(v, 0, 8) && g.slots[v] !== null && !g.opened.includes(Math.floor(v / 3))) {
        g.slots[v] = null;
        g.spent++;
      } else if (k === "locks" && name === "unlockDoor" && integer(v, 0, 2) && !g.opened.includes(v)) {
        if (g.attempts >= g.budget) return fail("機關核對餘裕已用完，可用運籌補充。");
        g.attempts++;
        g.spent++;
        const row = g.slots.slice(v * 3, v * 3 + 3), colors = row.map((x) => x === null ? -1 : g.tokens[x]);
        if (row.includes(null) || new Set(colors).size !== 3 || colors[0] !== keyClues(w)[v] || colors.some((color, col) => g.slots.some((key, j) => key !== null && Math.floor(j / 3) !== v && j % 3 === col && g.tokens[key] === color))) return fail("核對本門三色、門冠首格，以及跨門同高度的重色。");
        g.opened.push(v);
        g.done = g.opened.length === 3;
      } else if (k === "jade" && name === "slide" && integer(v, 0, 8) && adjacent(g.blank, v, 3, 9)) {
        if (g.moves >= g.budget) return fail("推移步數用完，可用運籌補充。");
        [g.board[g.blank], g.board[v]] = [g.board[v], g.board[g.blank]];
        g.blank = v;
        g.moves++;
        g.spent++;
        g.done = same(g.board, jadeGoal);
      } else if (k === "twin" && name === "selectAgent" && integer(v, 0, 1)) g.active = v;
      else if (k === "twin" && name === "walkTwin" && integer(v, 0, 15) && adjacent(g.positions[g.active], v)) {
        if ([5, 9].includes(v)) return fail("此格是牆，改走相鄰通道。");
        if (g.steps >= g.budget) return fail("行路餘裕用完，可用運籌補充。");
        if (v === 6 && !g.unlocked[0]) {
          if (g.positions[1 - g.active] !== 2) return fail("六號門未開，請另一使者先守住二號壓板。");
          g.unlocked[0] = true;
        }
        if (v === 10 && !g.unlocked[1]) {
          if (g.positions[1 - g.active] !== 7) return fail("十號門未開，請另一使者先守住七號壓板。");
          g.unlocked[1] = true;
        }
        g.positions[g.active] = v;
        if ([3, 11].includes(v) && !g.visits[g.active].includes(v)) g.visits[g.active].push(v);
        g.steps++;
        g.spent++;
        g.delivered = g.positions.map((at, i) => at === [15, 14][i] && [3, 11].every((n) => g.visits[i].includes(n)));
        g.done = g.delivered.every(Boolean) && g.unlocked.every(Boolean);
      } else if (k === "measures" && name === "setWeight" && v && integer(v.index, 0, 2) && integer(v.value, 0, 4)) g.weights[v.index] = v.value;
      else if (k === "measures" && name === "weigh") {
        if (g.attempts >= g.budget) return fail("校準核對次數用完，可用運籌補充。");
        g.attempts++;
        g.spent++;
        const a = measureState(w), weight = g.weights.reduce((n, x, i) => n + x * a.unit[i], 0);
        if (weight !== a.target || g.weights.reduce((a2, b) => a2 + b, 0) > a.cap) return fail("重量或枚數不合；同樣重量也須在砝碼枚數上限內。");
        g.calibrated.push(copy2(g.weights));
        g.round++;
        g.weights = [0, 0, 0];
        g.done = g.round === 3;
      } else return false;
      if (!failed) w.notice = g.done ? "本篇同行操作完成，接著回到原文反思。" : "操作已記下，請觀察下一步。";
      return true;
    }
    function command2(w, name, value) {
      const g = w.campaign;
      if (g.log.length >= 240 || g.done || w.status !== "playing") return false;
      if (name !== "skill" && active(w, "listening") && w.time < w.buffs.listening - 6) return false;
      const v = value === void 0 ? null : copy2(value), ok = reduce(w, name, v);
      if (ok) {
        g.log.push({ t: w.time, name, value: v });
        if (g.done) w.status = "won";
      }
      return ok;
    }
    function complete(w) {
      return w.campaign.done === true;
    }
    function validate(w) {
      const g = w.campaign;
      if (!g || g.version !== 1 || g.mechanic !== pilot2(w).mechanic || !Array.isArray(g.log) || g.log.length > 240) throw Error("戰國同行存檔格式不符。");
      const fresh = { id: w.id, seed: w.seed, snapshot: copy2(w.snapshot), time: 0, limit: w.limit, uses: {}, cooldowns: {}, buffs: {}, trace: null, errors: 0, status: "playing", notice: "" };
      fresh.campaign = initial(fresh);
      let at = 0;
      for (const a of g.log) {
        if (!a || Object.keys(a).sort().join(",") !== "name,t,value" || !Number.isFinite(a.t) || a.t < at || a.t > w.time || fresh.campaign.done || fresh.status === "lost" || a.name !== "skill" && active({ ...fresh, time: a.t }, "listening") && a.t < fresh.buffs.listening - 6) throw Error("戰國操作歷程無法核對。");
        at = a.t;
        fresh.time = at;
        if (!reduce(fresh, a.name, a.value)) throw Error("戰國操作條件無法核對。");
        fresh.campaign.log.push(copy2(a));
      }
      for (const key of ["campaign", "uses", "cooldowns", "buffs", "trace", "errors"]) if (!same(w[key], fresh[key])) throw Error("戰國操作結果與歷程不符。");
      if (w.status === "lost" && w.time < w.limit && fresh.status !== "lost") throw Error("戰國任務尚未達失敗條件。");
      return true;
    }
    function progress(before, next) {
      const a = before.campaign.log, b = next.campaign.log;
      if (a.length > b.length || !same(a, b.slice(0, a.length))) throw Error("戰國同行操作不能倒退或改寫。");
    }
    function summary(w) {
      const g = w.campaign;
      return { flood: () => g.round + "/5輪 · 守住" + g.saved + "輪", canal: () => [3, 7, 11].filter((x) => watered(w).includes(x)).length + "/3田 · 動工" + g.dug, balance: () => g.stage + "/6段 · 搬運負荷" + g.fatigue + "/" + g.endurance, forum: () => g.round + "/4輪 · 接引" + g.served + "人", ambush: () => g.round + "/3輪同步", treaty: () => g.round + "/3輪 · 本輪" + g.pairs.length + "/3約", drift: () => g.stage + "/8段 · 竹簡" + g.scrolls + "束 · 船況" + g.hull, archery: () => g.hits + "/8靶 · " + g.shots + "箭", locks: () => g.opened.length + "/3門 · 已放" + g.slots.filter((x) => x !== null).length + "/9牌", jade: () => g.moves + "步 · " + g.board.filter((x, i) => x === jadeGoal[i]).length + "/9格復位", twin: () => g.unlocked.filter(Boolean).length + "/2門 · " + g.delivered.filter(Boolean).length + "/2使抵達", measures: () => g.round + "/3輪校準" }[g.mechanic]();
    }
    function objectives(w) {
      return [{ id: "accurate", label: "零操作誤判", done: w.campaign.errors === 0 }, { id: "efficient", label: "半數時限內完成", done: w.campaign.done && w.time <= w.limit / 2 }, { id: "unassisted", label: "不使用主動能力完成", done: w.campaign.done && Object.values(w.uses).every((n) => n === 0) }];
    }
    function report(w) {
      return { title: pilot2(w).title, completed: w.campaign.done, seconds: Math.round(w.time * 10) / 10, quality: clamp2(100 - w.campaign.errors * 8, 0, 100), items: [{ label: "同行進度", value: summary(w) }, { label: "操作誤判", value: w.campaign.errors }, { label: "有效操作", value: w.campaign.spent }], suggestions: [w.campaign.errors ? "重新看清本篇限制，再分段安排操作；能力增加餘裕，不代替原文判斷。" : "可挑戰更少調整、不同配點或不用主動能力，閱讀首次作答仍獨立保留。"] };
    }
    module2.exports = { PILOTS: PILOTS2, CHAPTERS: CHAPTERS2, SKILL_DESCRIPTIONS, pilot: pilot2, routes, compatible: compatible2, limit, initial, command: command2, complete, validate, progress, summary, objectives, report, uiHints, active, adjacent, floodState, watered, balanceState, incoming, ambushState, treatyState, river, target, keyClues, measureState, nations, goodsNames, jadeGoal };
  }
});

// src/character/model.cjs
var CH = require_chuhan();
var WA = require_warring();
var VERSION = "oc-1";
var BUDGET = 12;
var STATS = [["agility", "身法", "移位速度與楚漢行動時機"], ["strength", "臂力", "握力、渡運載重與攜糧"], ["dexterity", "巧手", "展讀速度與拼符、試放餘裕"], ["focus", "定力", "察覺餘裕、校勘時間與起跳窗口"], ["insight", "察勢", "觀測持續時間"], ["planning", "籌算", "輪值調度、護衛令與解謎餘裕"]];
var SKILLS = [
  { id: "swift", name: "迅影", kinds: ["action"], uses: 2, desc: "短暫加速2.5秒，耗握力12並增加聲響。" },
  { id: "steady", name: "握定", kinds: ["action", "collation"], uses: 2, desc: "夜縋減少橫風但放繩變慢；對勘讓照明停留較久。" },
  { id: "precise", name: "巧勁", kinds: ["collation"], uses: 2, desc: "放大對讀視窗8秒，但這段時間計時較快。" },
  { id: "foresight", name: "望勢", kinds: ["action", "strategy", "collation"], uses: 2, desc: "夜縋顯示巡燈預跡；治理預看下輪需求；對勘提示本段論證作用。" },
  { id: "listen", name: "聽息", kinds: ["action"], uses: 2, desc: "停步聽察2秒，之後短暫看見巡燈方向；巡燈仍會移動。" },
  { id: "light", name: "輕裝", kinds: ["action"], uses: 0, desc: "自動生效：移動快15%，握力上限降為80。" },
  { id: "plan", name: "運籌", kinds: ["strategy"], uses: 2, desc: "取得一枚本輪調度令；每輪最多使用一次。" },
  { id: "trace", name: "留痕", kinds: ["action", "strategy", "collation"], uses: 2, desc: "記下自己的位置、配置或展讀區，方便比較；不提供最佳解。" }
];
var PILOTS = [
  { id: "S_cq08_weizheng", kind: "action", name: "燭之武退秦師", title: "夜縋護簡", scene: "scene:cq08_world", role: "夜縋同行者", recommended: ["steady", "listen"], quote: "夜縋而出，見秦伯曰：「秦、晉圍鄭，鄭既知亡矣。」", source: "《左傳・僖公三十年》", brief: "燭之武將出城見秦伯。你沿繩下行，把三束隨行書簡交到牆邊暗龕，再抵達城下接應點。這是自編同行任務。", rule: "拖曳角色移位／放繩，或按住方向按鈕。避開巡燈，在三處暗龕旁停穩後按「交付書簡」，最後到城下按「抵達接應」。", after: "秦伯說，與鄭人盟。燭之武的說服仍從秦國利害展開；你完成的是沿途護送，沒有替他決定談判結果。" },
  { id: "S_cq16_datong", kind: "strategy", name: "大同與小康", title: "公天下調度", scene: "scene:cq16_world", role: "鄉里調度者", recommended: ["plan", "foresight"], quote: "故人不獨親其親，不獨子其子。使老有所終，壯有所用，幼有所長，矜寡孤獨廢疾者皆有所養。", source: "《禮記・禮運》", brief: "八位鄉人各有兩項專長。你要讓養老、育幼、照護、勞作與公共倉五處分工在四日中都有人承擔。需求來自自編治理情境。", rule: "選一位鄉人再點工作區：專長可承擔2份，一般分工1份。首輪八令，其後每輪三令加籌算加成；調動一人耗一令。需求每日改變，四日都達標才完成。", after: "你完成了四日的公共分工。文本還要求選賢與能、講信修睦，不能只用人數配置概括大同；接著回原篇比較天下為公與天下為家。" },
  { id: "S_zg11_zhuke", kind: "collation", name: "諫逐客書", title: "諫書對勘", scene: "scene:zg11_world", role: "書簡校讀者", recommended: ["precise", "trace"], quote: "此四君者，皆以客之功。由此觀之，客何負於秦哉！", source: "李斯〈諫逐客書〉", brief: "李斯上書之前，你受託對讀三段書簡。展開底本，圈出待校文字，修正並說明它在論證中的作用。訛字為自編教學材料，不當作真實版本異文。", rule: "在上方底本移動光窗並停留展讀，下方點選待校字，再選替換字。每段另選論證標籤並按「核對本段」；三段都校妥才完成。", after: "書簡校讀完成。首段判斷、四君事證與取人標準的對照共同支撐李斯的諫言；上書與秦王的決策仍按原篇敘述。" }
];
PILOTS.push(...CH.PILOTS, ...WA.PILOTS);
var JOBS = ["養老", "育幼", "照護", "勞作", "公共倉"];
var SPECIALTIES = [[0, 2], [0, 4], [1, 2], [1, 3], [2, 4], [3, 0], [3, 1], [4, 2]];
var NEEDS = [[4, 2, 2, 3, 2], [2, 3, 4, 2, 2], [3, 2, 2, 2, 4], [2, 4, 3, 3, 2]];
var EVENTS = ["安頓鄉里：養老與勞作的需求較高。", "雨後照護：照護與育幼需求上升，重新銜接輪值。", "倉儲整備：公共倉需求上升，兼顧養老。", "巡視回訪：育幼、照護與勞作都需要適任的人。"];
var TEXTS = [
  { original: "臣聞吏議逐客，竊以為過矣。", draft: "臣聞吏議逐客，竊以為善矣。", choices: ["過", "善", "功"], labels: ["提出判斷", "鋪陳宮廷珍寶", "作出讓步"], reason: 0, explain: "「過」指出逐客之議的錯誤，開宗明義提出反對判斷。" },
  { original: "此四君者，皆以客之功。", draft: "此四君者，皆以客之過。", choices: ["過", "利", "功"], labels: ["否定客卿功績", "歸結四君用客之效", "主張只看出身"], reason: 1, explain: "「功」歸結四君受益於客卿，承接歷史事證。" },
  { original: "今取人則不然，不問可否，不論曲直，非秦者去，為客者逐。", draft: "今取人則不然，但問可否，但論曲直，非秦者去，為客者逐。", choices: ["但", "不", "皆"], labels: ["以國籍代替才能的取人標準", "讚賞秦國唯才是舉", "敘述異國器物之美"], reason: 0, explain: "兩個「不」呈現不察是非才能、只按出身逐客的矛盾。" }
];
var CHAPTER_VERSION = "chapter-1";
var CHAPTERS = {
  S_cq08_weizheng: { title: "夜縋與說秦", intro: "你作為護簡同行者，先讀夜縋的處境與說秦的理由，再自行決定潛行路線。燭之武的外交言辭及秦伯決定仍依原篇。", evidence: [
    { id: "wz-night", tag: "處境與行動", prompt: "同行者必須避開巡燈下城，哪個判斷最貼近原文？", choices: ["鄭國已安全，可以公開出使", "圍城下採夜間縋城，仍有行動風險", "燭之武已指揮秦軍攻晉"], evidence: [{ id: "night", text: "夜縋而出，見秦伯。" }, { id: "far", text: "越國以鄙遠，君知其難也。" }], answer: 1, correctEvidence: "night", explain: "夜縋而出交代夜間用繩下城；這是危局中的接近途徑，不能推成鄭已脫困。" },
    { id: "wz-interest", tag: "利害推論", prompt: "「越國以鄙遠」用來提醒秦伯什麼？", choices: ["秦能輕易把鄭當近郊", "鄭與秦之間沒有其他國家", "越過別國控制遠地有困難"], evidence: [{ id: "far", text: "越國以鄙遠，君知其難也。" }, { id: "night", text: "夜縋而出，見秦伯。" }], answer: 2, correctEvidence: "far", explain: "越國、鄙遠指出地理與治理成本，說服從秦國可得的利益及困難展開。" }
  ], reflection: [
    { id: "wz-role", tag: "秦晉利害", prompt: "「鄰之厚，君之薄也」為何能用來勸秦退兵？", choices: ["亡鄭主要使鄰國晉增強，秦的相對力量反而減弱", "只要鄰國變強，秦一定同等變強", "鄭國增土便能讓秦立即吞晉"], evidence: [{ id: "balance", text: "焉用亡鄭以陪鄰？鄰之厚，君之薄也。" }, { id: "night", text: "夜縋而出。" }], answer: 0, correctEvidence: "balance", explain: "陪鄰即增加鄰國土地與勢力；晉得利不等於秦得利，厚薄須放在秦晉相對利害中理解。" },
    { id: "wz-end", tag: "利害推論", prompt: "「失其所與，不知」反映晉文公最後考量的是？", choices: ["把盟友當成永久敵人", "失去同盟不合明智，撤軍另有政治判斷", "只因夜縋速度太快而撤軍"], evidence: [{ id: "ally", text: "因人之力而敝之，不仁；失其所與，不知；以亂易整，不武。吾其還也。" }, { id: "far", text: "越國以鄙遠，君知其難也。" }], answer: 1, correctEvidence: "ally", explain: "結尾列仁、知、武三層理由，晉文公的退兵也有自己的判斷，不能化約為操作成績。" }
  ], remedy: [
    { id: "wz-r-night", tags: ["處境與行動"], tag: "處境與行動", prompt: "重讀後，哪一組把行動者與行動正確接合？", choices: ["同行者代秦伯與鄭人盟", "燭之武夜縋出城，見秦伯陳說利害", "晉文公夜縋出城請秦攻晉"], evidence: [{ id: "night", text: "夜縋而出，見秦伯曰。" }], answer: 1, correctEvidence: "night", explain: "把夜縋、見秦伯及發言連讀，保留原作人物行動；護簡是另外標示的同行推演。" },
    { id: "wz-r-interest", tags: ["利害推論"], tag: "利害推論", prompt: "若只說「我很可憐，請退兵」，尚未掌握哪個關鍵？", choices: ["秦國控制遠鄭的成本及秦晉利害", "夜縋時穿什麼顏色", "書簡越多就一定能說服"], evidence: [{ id: "far", text: "越國以鄙遠，君知其難也。" }], answer: 0, correctEvidence: "far", explain: "這句讓秦伯衡量自身利害；閱讀理由與動作熟練是兩項不同表現。" },
    { id: "wz-r-balance", tags: ["秦晉利害"], tag: "秦晉利害", prompt: "晉得到鄭地而增強，秦為什麼未必受益？", choices: ["秦會因此自動取得同樣土地", "鄰國晉的相對勢力增加，秦的相對地位反而減弱", "晉得到鄭地就表示秦已控制鄭"], evidence: [{ id: "balance", text: "焉用亡鄭以陪鄰？鄰之厚，君之薄也。" }], answer: 1, correctEvidence: "balance", explain: "焉用的反問把亡鄭與陪鄰相連，指出秦出力卻主要厚晉的相對損失。" }
  ] },
  S_cq16_datong: { title: "皆有所養的四日", intro: "你是協助鄉里輪值的調度者。八人專長、數量與四日需求皆為自編推演，藉此檢查照養是否遺漏；完成配置不表示歷史上已實現大同。", evidence: [
    { id: "dt-merit", tag: "選賢與能", prompt: "安排輪值時，哪個理由符合「選賢與能」？", choices: ["只選自己親近的人", "查核專長是否符合工作需要", "只看誰願意搶最快"], evidence: [{ id: "merit", text: "大道之行也，天下為公。選賢與能，講信修睦。" }, { id: "care", text: "故人不獨親其親，不獨子其子。" }], answer: 1, correctEvidence: "merit", explain: "選任要看賢能與職務需要，還要講信修睦；專長只是推演中的一種可查線索。" },
    { id: "dt-care", tag: "照養範圍", prompt: "遇到照護需求升高，應先確認什麼？", choices: ["只照顧輪值者家人", "每項都分一人便算公平", "不同需要者有無落在照養範圍外"], evidence: [{ id: "care", text: "使老有所終，壯有所用，幼有所長，矜寡孤獨廢疾者皆有所養。" }, { id: "merit", text: "選賢與能，講信修睦。" }], answer: 2, correctEvidence: "care", explain: "皆有所養針對不同處境，不是要求人人領同額，更不是只照顧熟人。" }
  ], reflection: [
    { id: "dt-fair", tag: "照養範圍", prompt: "為何四日需求不平均，仍可能是公平配置？", choices: ["公平是讓不同需求得到照應，未必每處同額", "公共倉永遠不必有人", "人少的工作可以不管"], evidence: [{ id: "care", text: "老有所終，壯有所用，幼有所長。" }, { id: "kin", text: "故人不獨親其親，不獨子其子。" }], answer: 0, correctEvidence: "care", explain: "老、壯、幼的需要不同；遊戲的份數是教學工具，不能用整齊同額取代照養。" },
    { id: "dt-boundary", tag: "公家對照", prompt: "「天下為家」與大同的哪一項原則形成對照？", choices: ["天下為家表示天下所有人都被視作同一家，已超越大同", "小康完全沒有制度與禮義", "天下為公、不獨親其親，與各親其親、貨力為己形成對照"], evidence: [{ id: "public-family", text: "故人不獨親其親，不獨子其子。……今大道既隱，天下為家，各親其親，各子其子。貨力為己，大人世及以為禮。" }, { id: "care", text: "使老有所終，壯有所用，幼有所長。" }], answer: 2, correctEvidence: "public-family", explain: "為家轉向親子、貨力與世及的私有承襲；小康仍有禮義為紀，不能把天下為家誤作更廣大的天下一家。" }
  ], remedy: [
    { id: "dt-r-merit", tags: ["選賢與能"], tag: "選賢與能", prompt: "某人雖是熟人，仍須做哪一步？", choices: ["免查實績直接任命", "查核能力是否合職，並對公共責任說明", "由遊戲分數證明他德行完美"], evidence: [{ id: "merit", text: "選賢與能，講信修睦。" }], answer: 1, correctEvidence: "merit", explain: "親近不能取代能力與責任查核；數量達標也不直接證明德行。" },
    { id: "dt-r-care", tags: ["照養範圍"], tag: "照養範圍", prompt: "遇到不能出力的病者，哪項安排符合本段？", choices: ["因不能工作便排除照養", "只照顧與自己同姓者", "仍須把照護需求納入分工"], evidence: [{ id: "care", text: "矜寡孤獨廢疾者皆有所養。" }], answer: 2, correctEvidence: "care", explain: "照養範圍包括無依與廢疾者，不能把是否能出勞力當成受養資格。" },
    { id: "dt-r-family", tags: ["公家對照"], tag: "公家對照", prompt: "小康有城郭溝池，又說「禮義以為紀」，應怎樣理解？", choices: ["天下為家仍須禮義維持秩序，不能說完全沒有規範", "有城牆便不再需要禮義", "小康與大同的親子、貨力原則完全相同"], evidence: [{ id: "rules", text: "城郭溝池以為固，禮義以為紀。" }], answer: 0, correctEvidence: "rules", explain: "小康雖不同於天下為公的理想，仍以禮義為綱紀；制度差異須分項對照。" }
  ] },
  S_zg11_zhuke: { title: "校字與辨論", intro: "你作為校讀同行者，先確認論證的用意，再對勘三段教學書簡。訛字為自編材料，校字正確與理解論證分開診斷。", evidence: [
    { id: "zk-history", tag: "歷史事證", prompt: "「此四君者，皆以客之功」在文中主要做什麼？", choices: ["歸結四君用客所得，以支持反對逐客", "證明外來士人每個都無風險", "把四君本人都說成客卿"], evidence: [{ id: "history", text: "此四君者，皆以客之功。由此觀之，客何負於秦哉！" }, { id: "standard", text: "非秦者去，為客者逐。" }], answer: 0, correctEvidence: "history", explain: "四君的歷史例證歸結於用客之功；不能把多例概括誤作對所有人的絕對保證。" },
    { id: "zk-standard", tag: "對比論證", prompt: "「不問可否，不論曲直」揭示哪個取人問題？", choices: ["先查才能再問國籍", "只按是否秦人排斥，未察是非才能", "秦王完全不接受外國珍寶"], evidence: [{ id: "standard", text: "今取人則不然，不問可否，不論曲直，非秦者去，為客者逐。" }, { id: "history", text: "此四君者，皆以客之功。" }], answer: 1, correctEvidence: "standard", explain: "李斯把取物與取人的標準相對照，揭出不察才能而以出身逐客的矛盾。" }
  ], reflection: [
    { id: "zk-word", tag: "字詞與論旨", prompt: "把首段的「過」誤成「善」，影響是什麼？", choices: ["只有字形不同，不影響立場", "把反對逐客的判斷改成贊成，必須對讀校正", "讓四君用客的史實增加一例"], evidence: [{ id: "judgment", text: "臣聞吏議逐客，竊以為過矣。" }, { id: "history", text: "此四君者，皆以客之功。" }], answer: 1, correctEvidence: "judgment", explain: "過、善在這裡改變對逐客之議的評價；校字須放回句意，不能只追求手速。" },
    { id: "zk-order", tag: "論證層次", prompt: "從四君用客之功轉向當今取人標準，應如何理解？", choices: ["兩段都是無關主張的裝飾", "四君事證推翻一切審查人才的必要", "先舉歷史成效，再揭當前取人矛盾"], evidence: [{ id: "connection", text: "此四君者，皆以客之功。……今取人則不然，不問可否，不論曲直。" }, { id: "judgment", text: "臣聞吏議逐客，竊以為過矣。" }], answer: 2, correctEvidence: "connection", explain: "歷史例證與當今矛盾層層支撐諫言，並不是否定查核人才的必要。" }
  ], remedy: [
    { id: "zk-r-history", tags: ["歷史事證", "論證層次"], tag: "歷史事證", prompt: "四君用客例證最能支持哪項結論？", choices: ["客卿曾對秦有重大貢獻，逐客之議須重新衡量", "只要外來便一定比秦人高明", "文章沒有使用任何事證"], evidence: [{ id: "history", text: "此四君者，皆以客之功。" }], answer: 0, correctEvidence: "history", explain: "事證支持用客之利，不支持「所有外來者一定最好」的過度推論。" },
    { id: "zk-r-standard", tags: ["對比論證", "字詞與論旨"], tag: "對比論證", prompt: "對讀「不問可否」時，應保留哪個意思？", choices: ["已逐一問清人才是否可用", "尚未察人可用與否，便按出身驅逐", "逐客完全沒有國家影響"], evidence: [{ id: "standard", text: "不問可否，不論曲直，非秦者去，為客者逐。" }], answer: 1, correctEvidence: "standard", explain: "兩個不字與後面的逐客相連；校正文字後還要掌握它對取人標準的批評。" }
  ] }
};
Object.assign(CHAPTERS, CH.CHAPTERS, WA.CHAPTERS);
var CHAPTER_ROUTES = {
  action: [
    { id: "shadow", name: "巡燈迂迴線", brief: "沿三處暗龕橫移，觀察巡燈後穿越。", build: "察勢型：先觀察、分段前進。", tradeoff: "移動距離較長，停在暗龕可回握力。", points: [{ x: 22, y: 26 }, { x: 78, y: 57 }, { x: 42, y: 83 }], speed: 1, grip: 1, radius: 10, limit: 150 },
    { id: "shelter", name: "近壁守穩線", brief: "暗龕沿牆排列，較少橫移，放繩需耐心。", build: "臂力型：慢行、保握力、把握停留。", tradeoff: "速度降15%，握力耗損降25%，可停靠範圍較寬。", points: [{ x: 22, y: 26 }, { x: 27, y: 57 }, { x: 22, y: 83 }], speed: 0.85, grip: 0.75, radius: 13, limit: 180 },
    { id: "daring", name: "中庭搶隙線", brief: "接近巡燈中線，利用短暫空檔快速下行。", build: "身法型：抓空檔、及時轉向。", tradeoff: "移速增12%，暴露累積增15%，限時130秒。", points: [{ x: 65, y: 26 }, { x: 50, y: 57 }, { x: 65, y: 83 }], speed: 1.12, grip: 1, radius: 10, limit: 130 }
  ],
  strategy: [
    { id: "common", name: "鄉里四日", brief: "安頓、雨後、倉儲、回訪依序銜接。", build: "觀察專長，保留可接續的配置。", tradeoff: "每次調動都耗一令；專長之外一般分工只承擔一份。", order: [0, 1, 2, 3] },
    { id: "rotation", name: "倉雨調序", brief: "倉儲整備提前，雨後照護延後，重新推演調度。", build: "預看需求，降低反覆調動。", tradeoff: "需求輪序改變；不能沿用前一局的固定調動順序。", order: [0, 2, 1, 3] }
  ],
  collation: [{ id: "original", name: "三段對勘", brief: "首段判斷、歷史事證、取人標準依次校讀。", build: "巧手管理展讀，定力保留核對時間。", tradeoff: "校字與論證標籤都須親自判斷；能力不代答。" }]
};
for (const s of SKILLS) {
  s.kinds.push("chuhan", "warring");
  s.warringDesc = WA.SKILL_DESCRIPTIONS?.[s.id] || "依本篇操作規則生效，能力不代替原文判斷。";
  s.chuhanDesc = { swift: "迅影：短暫擴大起跳與傳訊時機，或縮短行路間隔。", steady: "握定：短暫擴大起跳、穿行暗窗。", precise: "巧勁：拼符顯示逐片錯位，營建預覽整塊範圍。", foresight: "望勢：預看後續敵襲、全圖或本篇配置線索。", listen: "聽息：停步2秒，短暫看清全圖及行路時機。", light: "輕裝：行路更快、時機稍寬；總時限減少25秒。", plan: "運籌：依本篇增加航次、護衛令、換旗令或重畫餘裕。", trace: "留痕：記下自己目前的進度，供後續比較。" }[s.id];
}
var copy = (x) => JSON.parse(JSON.stringify(x));
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function pilot(id) {
  const p = PILOTS.find((p2) => p2.id === id);
  if (!p) throw Error("此篇尚未開放角色冒險。");
  return p;
}
function config(value) {
  if (!value || value.schema !== VERSION) throw Error("原創角色配點格式不正確。");
  const stats = {};
  let total = 0;
  for (const [k] of STATS) {
    const n = value.stats?.[k];
    if (!Number.isInteger(n) || n < 0 || n > 4) throw Error("每項冒險屬性須為0至4點。");
    stats[k] = n;
    total += n;
  }
  if (total !== BUDGET) throw Error("請分配完整12點，總點數不能增加。");
  const skills = value.skills;
  if (!Array.isArray(skills) || skills.length !== 2 || new Set(skills).size !== 2 || skills.some((k) => !SKILLS.some((s) => s.id === k))) throw Error("請裝備兩項不同能力。");
  const revision = value.revision ?? 0;
  if (!Number.isInteger(revision) || revision < 0) throw Error("角色資料版本不正確。");
  return { schema: VERSION, stats, skills: skills.slice(), revision };
}
function defaults() {
  return { schema: VERSION, stats: Object.fromEntries(STATS.map(([k]) => [k, 2])), skills: ["steady", "listen"], revision: 0 };
}
function campaignRules(w) {
  return w.kind === "chuhan" ? CH : w.kind === "warring" ? WA : null;
}
function compatible(c, id) {
  const p = pilot(id), checked = config(c), core = campaignRules(p);
  return (!core || core.compatible(checked, p.id)) && checked.skills.every((k) => SKILLS.find((s) => s.id === k).kinds.includes(p.kind));
}
function create(id, raw, identity = {}, seed = 1) {
  const p = pilot(id), c = config(raw);
  if (!compatible(c, id)) throw Error("請先改配本篇可用的兩項能力。");
  const snapshot = { config: c, identity: copy(identity) }, w = { schema: VERSION, id, kind: p.kind, seed: Math.abs(seed | 0) || 1, snapshot, status: "playing", time: 0, limit: p.kind === "action" ? 150 : p.kind === "collation" ? 190 + c.stats.focus * 6 : 720, uses: {}, cooldowns: {}, buffs: {}, notice: "", errors: 0, trace: null };
  if (p.kind === "chuhan") {
    w.limit = 210 + c.stats.focus * 8 + (p.mechanic === "seal" ? c.stats.dexterity * 6 : 0) - (c.skills.includes("light") ? 25 : 0);
    w.campaign = CH.initial(w);
  }
  if (p.kind === "warring") {
    w.limit = WA.limit ? WA.limit(c, p) : 240 + c.stats.focus * 8 - (c.skills.includes("light") ? 25 : 0);
    w.campaign = WA.initial(w);
  }
  if (p.kind === "action") Object.assign(w, { x: 50, y: 0, target: null, grip: c.skills.includes("light") ? 80 : 100, maxGrip: c.skills.includes("light") ? 80 : 100, exposure: 0, maxExposure: 100 + c.stats.focus * 5, delivered: [], pins: [], lanternOffset: w.seed % 30 / 10 });
  if (p.kind === "strategy") Object.assign(w, { day: 0, people: Array(8).fill(-1), selected: 0, orders: 8, results: [], plannedDay: -1 });
  if (p.kind === "collation") Object.assign(w, { page: 0, draft: Array.from(TEXTS[0].draft), seen: {}, probe: -1, selected: -1, reason: -1, finished: [] });
  return w;
}
function chapterRoutes(id) {
  const p = pilot(id), core = campaignRules(p);
  return core ? core.routes(id) : copy(CHAPTER_ROUTES[p.kind]);
}
function routeFor(w) {
  const core = campaignRules(w);
  if (core) return core.routes(w.id)[0];
  return CHAPTER_ROUTES[w.kind].find((r) => r.id === w.chapter?.route) || CHAPTER_ROUTES[w.kind][0];
}
function coverPoints(w) {
  return copy(w.chapter ? routeFor(w).points : [{ x: 22, y: 26 }, { x: 78, y: 57 }, { x: 42, y: 83 }]);
}
function needs(w, day = w.day) {
  return NEEDS[w.chapter ? routeFor(w).order[day] : day]?.slice() || [];
}
function event(w, day = w.day) {
  return EVENTS[w.chapter ? routeFor(w).order[day] : day] || "";
}
function createChapter(id, raw, identity = {}, seed = 1, options = {}) {
  const w = create(id, raw, identity, seed), routes = chapterRoutes(id), route = options.route || routes[0].id;
  if (!routes.some((r) => r.id === route)) throw Error("本篇沒有這條同行路線。");
  w.chapter = { version: CHAPTER_VERSION, phase: "evidence", route, answers: { evidence: {}, reflection: {}, remedy: {} }, history: [], missionResult: null, metrics: { peakExposure: 0, minGrip: w.grip ?? 100, distance: 0, transfers: 0, redundantTransfers: 0, patchErrors: 0, argumentErrors: 0, unreadPatchAttempts: 0 }, optional: {} };
  if (w.kind === "action") w.limit = routeFor(w).limit;
  w.notice = "先讀原文並選出支持判斷的證據，任務計時尚未開始。";
  return w;
}
function skill(w, id) {
  if (campaignRules(w)) return command(w, "skill", id);
  if (w.status !== "playing" || w.chapter && w.chapter.phase !== "mission") return false;
  const s = SKILLS.find((s2) => s2.id === id);
  if (!s || !w.snapshot.config.skills.includes(id) || !s.kinds.includes(w.kind)) {
    w.notice = "本局未裝備這項能力。";
    return false;
  }
  if (!s.uses) {
    w.notice = "輕裝已在開局生效；握力上限為80。";
    return false;
  }
  if ((w.uses[id] || 0) >= s.uses || w.time < (w.cooldowns[id] || 0)) {
    w.notice = "次數已用完，或能力尚在冷卻。";
    return false;
  }
  if (id === "plan" && w.plannedDay === w.day) {
    w.notice = "每輪只能加用一枚調度令。";
    return false;
  }
  w.uses[id] = (w.uses[id] || 0) + 1;
  w.cooldowns[id] = w.time + 10;
  const insight = w.snapshot.config.stats.insight;
  if (id === "swift") {
    w.buffs.swift = w.time + 2.5;
    w.grip = Math.max(0, w.grip - 12);
    w.exposure += 7;
  }
  if (id === "steady") w.buffs.steady = w.time + 7;
  if (id === "precise") w.buffs.precise = w.time + 8;
  if (id === "foresight") w.buffs.foresight = w.time + 6 + insight;
  if (id === "listen") {
    w.buffs.listening = w.time + 2;
    w.buffs.foresight = w.time + 8 + insight;
  }
  if (id === "plan") {
    w.orders++;
    w.plannedDay = w.day;
  }
  if (id === "trace") w.trace = w.kind === "action" ? { x: w.x, y: w.y } : w.kind === "strategy" ? { day: w.day, people: w.people.slice() } : { page: w.page, seen: copy(w.seen) };
  if (w.chapter && w.kind === "action") {
    w.chapter.metrics.peakExposure = Math.max(w.chapter.metrics.peakExposure, w.exposure);
    w.chapter.metrics.minGrip = Math.min(w.chapter.metrics.minGrip, w.grip);
  }
  w.notice = s.name + "已使用；本局配裝仍固定。";
  return true;
}
function lit(w, t = w.time) {
  return [26, 57, 83].map((y, i) => ({ x: 50 + Math.sin((t + w.lanternOffset) * (0.38 + i * 0.07) + i * 2) * 38, y }));
}
function cover(w) {
  return coverPoints(w).findIndex((p) => Math.abs(p.x - w.x) < (w.chapter ? routeFor(w).radius : 10) && Math.abs(p.y - w.y) < 5);
}
function inspect(w, index, dt) {
  if (w.kind !== "collation" || w.status !== "playing" || w.chapter && w.chapter.phase !== "mission") return;
  const text = TEXTS[w.page].original, rate = 1 + w.snapshot.config.stats.dexterity * 0.12;
  if (Number.isInteger(index) && index >= 0 && index < Array.from(text).length) {
    w.probe = index;
    w.seen[index] = Math.min(1, (w.seen[index] || 0) + dt * rate);
  }
}
function step(w, input = {}, seconds = 0.05) {
  if (w.status !== "playing" || w.chapter && w.chapter.phase !== "mission") return w;
  const dt = clamp(Number(seconds) || 0, 0, 0.1), beforeX = w.x, beforeY = w.y;
  w.time += dt;
  if (w.kind === "action") {
    const s = w.snapshot.config.stats, light = w.snapshot.config.skills.includes("light"), swift = w.buffs.swift > w.time, steady = w.buffs.steady > w.time;
    if (!(w.buffs.listening > w.time)) {
      const speed = (9 + s.agility * 1.2) * (light ? 1.15 : 1) * (swift ? 1.65 : 1) * (w.chapter ? routeFor(w).speed : 1), xBefore = w.x, yBefore = w.y;
      if (w.target) {
        w.x += clamp(w.target.x - w.x, -speed * 3 * dt, speed * 3 * dt);
        w.y += clamp(w.target.y - w.y, -speed * dt, speed * dt) * (steady ? 0.65 : 1);
      } else {
        w.x += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * speed * 3 * dt;
        w.y += ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * speed * dt * (steady ? 0.65 : 1);
      }
      const moving = Math.abs(w.x - xBefore) + Math.abs(w.y - yBefore) > 1e-3;
      if (moving) {
        w.grip -= (1.3 - s.strength * 0.12) * dt * (w.chapter ? routeFor(w).grip : 1);
        w.x += Math.sin(w.time * 2.1) * dt * (steady ? 0.2 : 1.5);
      }
      w.x = clamp(w.x, 5, 95);
      w.y = clamp(w.y, 0, 100);
    }
    const safe = cover(w) >= 0, exposed = !safe && lit(w).some((p) => Math.abs(p.y - w.y) < 5 && Math.abs(p.x - w.x) < 14);
    w.exposure = clamp(w.exposure + (exposed ? 23 * (w.chapter?.route === "daring" ? 1.15 : 1) : -3) * dt, 0, w.maxExposure);
    if (safe) w.grip = Math.min(w.maxGrip, w.grip + 4 * dt);
    w.grip = clamp(w.grip, 0, w.maxGrip);
    if (w.exposure >= w.maxExposure || w.grip <= 0) {
      w.status = "lost";
      w.notice = "巡察察覺或握力不足。沿暗龕停留，觀察巡燈後再行動。";
    }
  }
  if (w.kind === "collation") {
    if (w.buffs.precise > w.time) w.time += dt * 0.25;
    if (w.probe >= 0) inspect(w, w.probe, dt * (w.buffs.steady > w.time ? 1.6 : 1));
  }
  if (w.time >= w.limit) {
    w.status = "lost";
    w.notice = "本次時間已到，可重試；原篇首答與分數保留。";
  }
  if (w.chapter && w.kind === "action") {
    const m = w.chapter.metrics;
    m.peakExposure = Math.max(m.peakExposure, w.exposure);
    m.minGrip = Math.min(m.minGrip, w.grip);
    m.distance += Math.hypot(w.x - beforeX, w.y - beforeY);
  }
  settleChapter(w);
  return w;
}
function transfer(w, person, to) {
  if (w.kind !== "strategy" || w.status !== "playing" || !Number.isInteger(person) || person < 0 || person > 7 || !Number.isInteger(to) || to < 0 || to > 4) return false;
  if (w.people[person] === to) {
    w.notice = "這位鄉人已在此輪值。";
    return false;
  }
  if (w.orders < 1) {
    w.notice = "本輪調度令已用完；可檢視配置或使用運籌。";
    return false;
  }
  w.people[person] = to;
  w.orders--;
  return true;
}
function counts(w) {
  return JOBS.map((_, i) => w.people.reduce((n, x, j) => n + (x === i ? SPECIALTIES[j].includes(i) ? 2 : 1 : 0), 0));
}
function commit(w) {
  if (w.kind !== "strategy" || w.status !== "playing") return false;
  const need = needs(w), got = counts(w), ok = need.every((n, i) => got[i] >= n);
  w.results.push({ day: w.day, people: w.people.slice(), got, need: need.slice(), ok });
  if (!ok) {
    w.status = "lost";
    w.notice = "有照顧或公共分工缺口。回看原文，再重新安排這四日。";
    return false;
  }
  w.day++;
  if (w.day === 4) {
    w.status = "won";
    w.notice = "四日分工皆已銜接。";
  } else {
    w.orders = 3 + Math.floor(w.snapshot.config.stats.planning / 2);
    w.notice = event(w);
  }
  return true;
}
function patch(w, value) {
  if (w.kind !== "collation" || w.status !== "playing") return false;
  const t = TEXTS[w.page], i = w.selected;
  if (i < 0 || (w.seen[i] || 0) < 1) {
    w.notice = "先在底本照明並停留展讀相同位置，再校字。";
    return false;
  }
  if (!t.choices.includes(value)) return false;
  if (Array.from(t.original)[i] !== value || w.draft[i] === value) {
    w.errors++;
    w.time += 6;
    w.notice = "這次改字尚未與底本相合；展讀上下文後再核對。";
    return false;
  }
  w.draft[i] = value;
  w.notice = "改字已記下；還須核對本段與論證標籤。";
  return true;
}
function check(w) {
  if (w.kind !== "collation" || w.status !== "playing") return false;
  const t = TEXTS[w.page];
  if (w.draft.join("") !== t.original || w.reason !== t.reason) {
    w.errors++;
    w.time += 5;
    w.notice = "仍有待校文字，或論證作用尚未吻合。請再對讀。";
    return false;
  }
  w.finished.push(w.page);
  w.page++;
  if (w.page === 3) {
    w.status = "won";
    w.page = 2;
    w.notice = "三段文字與論證作用均已核對。";
  } else {
    w.draft = Array.from(TEXTS[w.page].draft);
    w.seen = {};
    w.selected = -1;
    w.probe = -1;
    w.reason = -1;
    w.notice = t.explain;
  }
  return true;
}
function coreCommand(w, name, value) {
  if (w.status !== "playing") return false;
  if (campaignRules(w)) {
    if (name === "stop") return true;
    return campaignRules(w).command(w, name, value);
  }
  if (name === "skill") return skill(w, value);
  if (name === "move" && w.kind === "action" && value && Number.isFinite(value.x) && Number.isFinite(value.y)) {
    w.target = { x: clamp(value.x, 5, 95), y: clamp(value.y, 0, 100) };
    return true;
  }
  if (name === "stop") {
    w.target = null;
    w.probe = -1;
    return true;
  }
  if (name === "deliver" && w.kind === "action") {
    const at = cover(w);
    if (at < 0 || w.delivered.includes(at)) {
      w.notice = "到尚未交付的暗龕旁停穩，再交付書簡。";
      return false;
    }
    w.delivered.push(at);
    w.target = null;
    w.notice = "第" + w.delivered.length + "束書簡已交付。";
    return true;
  }
  if (name === "finish" && w.kind === "action") {
    if (w.delivered.length !== 3 || w.y < 95) {
      w.notice = "先交付三束書簡，再抵達城下接應點。";
      return false;
    }
    w.status = "won";
    return true;
  }
  if (name === "transfer") return transfer(w, value?.person, value?.to);
  if (name === "commit") return commit(w);
  if (name === "select" && w.kind === "collation" && Number.isInteger(value) && value >= 0 && value < w.draft.length) {
    w.selected = value;
    return true;
  }
  if (name === "probe" && w.kind === "collation" && Number.isInteger(value) && value >= 0 && value < w.draft.length) {
    w.probe = value;
    return true;
  }
  if (name === "patch") return patch(w, value);
  if (name === "reason" && w.kind === "collation" && Number.isInteger(value) && value >= 0 && value < 3) {
    w.reason = value;
    return true;
  }
  if (name === "check") return check(w);
  return false;
}
function missionScore(w) {
  return Math.round(clamp(100 - w.errors * 4 - (w.kind === "action" ? w.exposure * 0.15 : 0) - Math.max(0, w.time - 45) * 0.08, 0, 100));
}
function score(w) {
  return w.status === "won" ? missionScore(w) : 0;
}
function coreComplete(w) {
  if (campaignRules(w)) return campaignRules(w).complete(w);
  if (w.kind === "action") return w.delivered.length === 3 && w.y >= 95;
  if (w.kind === "strategy") return w.day === 4 && w.results.length === 4 && w.results.every((r, i) => r.day === i && r.ok === true && Array.isArray(r.got) && r.got.length === 5 && Array.isArray(r.people) && r.people.length === 8 && r.people.every((n) => Number.isInteger(n) && n >= 0 && n < 5) && counts(r).every((v, j) => v === r.got[j]) && needs(w, i).every((n, j) => r.got[j] >= n));
  return Array.isArray(w.finished) && w.finished.join(",") === "0,1,2" && w.draft.join("") === TEXTS[2].original && w.reason === TEXTS[2].reason;
}
function chapterObjectives(w) {
  if (!w.chapter) return [];
  if (campaignRules(w)) return campaignRules(w).objectives(w);
  if (w.kind === "action") return [{ id: "seal", label: "繞道拾回封印", done: w.chapter.optional.seal === true, x: 85, y: 41 }, { id: "quiet", label: "最高暴露低於25", done: w.chapter.metrics.peakExposure < 25 }, { id: "grip", label: "結束保有至少65握力", done: w.grip >= 65 }];
  if (w.kind === "strategy") return [{ id: "specialty", label: "四日都依專長分工", done: w.results.length === 4 && w.results.every((r) => r.people.every((to, i) => SPECIALTIES[i].includes(to))) }, { id: "handover", label: "總調動不超過14次", done: w.chapter.metrics.transfers <= 14 }];
  return [{ id: "characters", label: "校字沒有誤改", done: w.chapter.metrics.patchErrors === 0 }, { id: "argument", label: "論證標籤首次皆正確", done: w.chapter.metrics.argumentErrors === 0 }];
}
function operationReport(w) {
  if (campaignRules(w)) return campaignRules(w).report(w);
  const m = w.chapter.metrics, won = !!w.chapter.missionResult, seconds = Math.round(w.time * 10) / 10, items = [], suggestions = [];
  let quality = 0;
  if (w.kind === "action") {
    quality = Math.round(clamp(100 - m.peakExposure * 0.35 - Math.max(0, 65 - w.grip) * 0.3, 0, 100));
    items.push({ label: "最高暴露", value: Math.round(m.peakExposure) }, { label: "最低握力", value: Math.round(m.minGrip) }, { label: "已交書簡", value: w.delivered.length + "/3" });
    if (m.peakExposure >= 25) suggestions.push("巡燈接近時先進暗龕，等燈移遠再下行；可改試近壁守穩線。");
    if (m.minGrip < 50) suggestions.push("臂力可減少移動耗損；停在暗龕回握力，勿連續趕路。");
    if (!suggestions.length) suggestions.push("再挑戰拾回封印或另一條路線，觀察同配點的時間與品質差異。");
  } else if (w.kind === "strategy") {
    const valid = w.results.filter((r) => r.ok).length, general = w.results.reduce((n, r) => n + r.people.filter((to, i) => !SPECIALTIES[i].includes(to)).length, 0);
    quality = Math.round(clamp(valid * 25 - general * 2 - Math.max(0, m.transfers - 14) * 3 - m.redundantTransfers * 2, 0, 100));
    items.push({ label: "達標日數", value: valid + "/4" }, { label: "總調動", value: m.transfers }, { label: "重複調動嘗試", value: m.redundantTransfers }, { label: "非專長輪值", value: general });
    if (general) suggestions.push("先比較專長的兩份貢獻與一般分工的一份，再把人放到缺口較大的工作。");
    if (m.transfers > 14 || m.redundantTransfers) suggestions.push("先預看明日需求，再調整必要的人，減少來回搬動。");
    if (!suggestions.length) suggestions.push("改試" + (w.chapter.route === "rotation" ? "鄉里四日" : "倉雨調序") + "，以較少調動維持四日照養，檢查原配置是否仍合用。");
  } else {
    quality = Math.round(clamp(100 - m.patchErrors * 8 - m.argumentErrors * 10 - m.unreadPatchAttempts * 3, 0, 100));
    items.push({ label: "校字誤改", value: m.patchErrors }, { label: "論證標籤誤判", value: m.argumentErrors }, { label: "未展讀改字嘗試", value: m.unreadPatchAttempts }, { label: "已核對段數", value: w.finished.length + "/3" });
    if (m.patchErrors || m.unreadPatchAttempts) suggestions.push("先展讀底本同字位及上下文，再改待校字；校字失誤不等同論證不懂。");
    if (m.argumentErrors) suggestions.push("分清首段判斷、四君事證與取人標準的對照，校字全對仍須再讀論證。");
    if (!suggestions.length) suggestions.push("已能把文字與論證分開核對，可嘗試減少展讀來回並保持品質。");
  }
  return { title: w.kind === "action" ? "潛行操作" : w.kind === "strategy" ? "調度操作" : "校字與論證操作", completed: won, seconds, quality, items, suggestions };
}
function settleChapter(w) {
  if (!w.chapter || w.chapter.phase !== "mission" || w.status !== "won") return;
  const operation = operationReport(w);
  w.chapter.missionResult = { time: w.time, score: missionScore(w), quality: operation.quality };
  w.chapter.phase = "reflection";
  w.status = "playing";
  w.target = null;
  w.probe = -1;
  w.notice = "同行任務完成。接著用原文說明判斷；操作成績與閱讀表現分開保留。";
}
function command(w, name, value) {
  if (w.chapter && w.chapter.phase !== "mission") return false;
  if (w.chapter && name === "recover" && w.kind === "action") {
    if (w.status !== "playing" || w.chapter.optional.seal || Math.abs(w.x - 85) > 7 || Math.abs(w.y - 41) > 5) {
      w.notice = "封印落在右側85、41附近；須親自繞道接近才可拾回。";
      return false;
    }
    w.chapter.optional.seal = true;
    w.notice = "封印已拾回；仍須交齊書簡並抵達接應。";
    return true;
  }
  const m = w.chapter?.metrics, oldErrors = w.errors, unread = m && name === "patch" && w.kind === "collation" && (w.seen[w.selected] || 0) < 1, wrongWord = m && name === "check" && w.kind === "collation" && w.draft.join("") !== TEXTS[w.page].original, wrongReason = m && name === "check" && w.kind === "collation" && w.reason !== TEXTS[w.page].reason;
  const ok = coreCommand(w, name, value);
  if (m) {
    if (name === "transfer") {
      if (ok) m.transfers++;
      else if (value && w.people[value.person] === value.to) m.redundantTransfers++;
    }
    if (unread) m.unreadPatchAttempts++;
    if (name === "patch" && w.errors > oldErrors) m.patchErrors++;
    if (wrongWord) m.patchErrors++;
    if (wrongReason) m.argumentErrors++;
    if (w.kind === "action") {
      m.peakExposure = Math.max(m.peakExposure, w.exposure);
      m.minGrip = Math.min(m.minGrip, w.grip);
    }
  }
  settleChapter(w);
  return ok;
}
function wrongTags(w) {
  return [...new Set(w.chapter.history.filter((a) => a.stage !== "remedy" && !a.correct).map((a) => chapterQuestions(w, a.stage).find((q) => q.id === a.questionId)?.tag).filter(Boolean))];
}
function chapterQuestions(w, stage) {
  if (!w.chapter || !["evidence", "reflection", "remedy"].includes(stage)) return [];
  const d = CHAPTERS[w.id];
  if (stage !== "remedy") return copy(d[stage]);
  const tags = wrongTags(w);
  return copy(d.remedy.filter((q) => q.tags.some((t) => tags.includes(t))));
}
function stageComplete(w, stage) {
  const qs = chapterQuestions(w, stage);
  return qs.every((q) => w.chapter.answers[stage][q.id]?.correct === true);
}
function chapterCommand(w, name, value = {}) {
  if (!w.chapter || w.status !== "playing") return false;
  const c = w.chapter;
  const stage = { answerEvidence: "evidence", answerReflection: "reflection", answerRemedy: "remedy" }[name];
  if (stage) {
    if (c.phase !== stage) return false;
    const q = chapterQuestions(w, stage).find((q2) => q2.id === value.questionId);
    if (!q || c.answers[stage][q.id]?.correct || !Number.isInteger(value.choice) || value.choice < 0 || value.choice >= q.choices.length || !q.evidence.some((e) => e.id === value.evidenceId)) {
      w.notice = "請選一項判斷，並選出支持它的原文證據。";
      return false;
    }
    if (c.history.length >= 180) {
      w.notice = "本局答題次數已滿，請保存後重新開始。";
      return false;
    }
    const correct = value.choice === q.answer && value.evidenceId === q.correctEvidence, attempts = (c.answers[stage][q.id]?.attempts || 0) + 1, a = { choice: value.choice, evidenceId: value.evidenceId, correct, attempts };
    c.answers[stage][q.id] = a;
    c.history.push({ stage, questionId: q.id, choice: value.choice, evidenceId: value.evidenceId, correct });
    w.notice = (correct ? "判斷與證據相合。" : "請回讀原文，再調整判斷與證據。") + q.explain;
    return correct;
  }
  if (name === "startMission" && c.phase === "evidence" && stageComplete(w, "evidence")) {
    c.phase = "mission";
    w.notice = pilot(w.id).rule;
    return true;
  }
  if (name === "finishReflection" && c.phase === "reflection" && stageComplete(w, "reflection")) {
    if (chapterQuestions(w, "remedy").length) {
      c.phase = "remedy";
      w.notice = "先前曾有誤解，請用另一道短題回到原文核對。";
    } else {
      c.phase = "done";
      w.status = "won";
      w.notice = "章內閱讀、同行任務與反思均已完成。";
    }
    return true;
  }
  if (name === "finishRemedy" && c.phase === "remedy" && stageComplete(w, "remedy")) {
    c.phase = "done";
    w.status = "won";
    w.notice = "補救核對完成。首次判斷與訂正歷程都保留。";
    return true;
  }
  return false;
}
function chapterReport(w) {
  if (!w.chapter) return null;
  const c = w.chapter, all = c.history.filter((a) => a.stage !== "remedy"), first = all.filter((a, i) => all.findIndex((b) => b.stage === a.stage && b.questionId === a.questionId) === i), total = CHAPTERS[w.id].evidence.length + CHAPTERS[w.id].reflection.length, correct = Object.values(c.answers.evidence).concat(Object.values(c.answers.reflection)).filter((a) => a.correct).length, remedies = chapterQuestions(w, "remedy"), operation = operationReport(w), objectives = chapterObjectives(w), optionalDone = objectives.filter((o) => o.done).length;
  const reading = { title: "原文證據與閱讀判斷", firstCorrect: first.filter((a) => a.correct).length, total, answered: first.length, correct, wrongTags: wrongTags(w), remedyCorrect: Object.values(c.answers.remedy).filter((a) => a.correct).length, remedyTotal: remedies.length, items: [{ label: "閱讀首次正確", value: first.filter((a) => a.correct).length + "/" + total }, { label: "已訂正完成", value: correct + "/" + total }], suggestions: wrongTags(w).length ? ["回到以下概念的原文證據：" + wrongTags(w).join("、") + "。完成短題後仍保留首次判斷。"] : ["保持先找原文、再下判斷；操作熟練不會自動增加閱讀成績。"] };
  const record = { version: CHAPTER_VERSION, id: w.id, route: c.route, score: c.missionResult?.score || 0, seconds: operation.seconds, quality: operation.quality, readingFirstCorrect: reading.firstCorrect, readingTotal: total, readingCorrect: correct, optionalDone, optionalTotal: objectives.length };
  return { phase: c.phase, title: CHAPTERS[w.id].title, completed: c.phase === "done", reading, operation, remedies, challenge: { title: routeFor(w).name, objectives, optionalDone, optionalTotal: objectives.length }, record };
}
function mergeJournal(journal, w, at) {
  const list = copy(Array.isArray(journal) ? journal : []);
  if (w.status !== "won" || w.chapter && w.chapter.phase !== "done") return list;
  let j = list.find((x) => x.id === w.id);
  if (!j) {
    j = { id: w.id, score: score(w), seconds: Math.round(w.time), at };
    list.push(j);
  } else if (score(w) > j.score || score(w) === j.score && Math.round(w.time) < j.seconds) Object.assign(j, { score: score(w), seconds: Math.round(w.time), at });
  if (w.chapter) {
    const r = { ...chapterReport(w).record, at }, best = j.chapterBest, fast = j.chapterFastest, quality = j.chapterQuality;
    if (!best || r.score > best.score || r.score === best.score && r.seconds < best.seconds) j.chapterBest = copy(r);
    if (!fast || r.seconds < fast.seconds || r.seconds === fast.seconds && r.quality > fast.quality) j.chapterFastest = copy(r);
    if (!quality || r.quality > quality.quality || r.quality === quality.quality && r.seconds < quality.seconds) j.chapterQuality = copy(r);
  }
  return list;
}
function stable(x) {
  return JSON.stringify(Array.isArray(x) ? x.map((v) => JSON.parse(stable(v))) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, JSON.parse(stable(x[k]))])) : x);
}
function validateChapter(w) {
  const c = w.chapter, fail = () => {
    throw Error("章內閱讀與任務進度無法核對。");
  }, keys = (x, ks) => x && typeof x === "object" && !Array.isArray(x) && Object.keys(x).sort().join(",") === ks.slice().sort().join(",");
  if (!keys(c, ["version", "phase", "route", "answers", "history", "missionResult", "metrics", "optional"]) || c.version !== CHAPTER_VERSION || !["evidence", "mission", "reflection", "remedy", "done"].includes(c.phase) || !chapterRoutes(w.id).some((r) => r.id === c.route) || !keys(c.answers, ["evidence", "reflection", "remedy"]) || !Array.isArray(c.history) || c.history.length > 180) fail();
  const replay = { evidence: {}, reflection: {}, remedy: {} }, order = { evidence: 0, reflection: 1, remedy: 2 };
  let previous = 0;
  for (const a of c.history) {
    if (!keys(a, ["stage", "questionId", "choice", "evidenceId", "correct"]) || !(a.stage in order) || order[a.stage] < previous) fail();
    previous = order[a.stage];
    const q = chapterQuestions(w, a.stage).find((q2) => q2.id === a.questionId), old = replay[a.stage][a.questionId];
    if (!q || old?.correct || !Number.isInteger(a.choice) || a.choice < 0 || a.choice >= q.choices.length || !q.evidence.some((e) => e.id === a.evidenceId) || a.correct !== (a.choice === q.answer && a.evidenceId === q.correctEvidence)) fail();
    if (a.stage !== "evidence" && !CHAPTERS[w.id].evidence.every((q2) => replay.evidence[q2.id]?.correct)) fail();
    if (a.stage === "remedy" && !CHAPTERS[w.id].reflection.every((q2) => replay.reflection[q2.id]?.correct)) fail();
    replay[a.stage][a.questionId] = { choice: a.choice, evidenceId: a.evidenceId, correct: a.correct, attempts: (old?.attempts || 0) + 1 };
  }
  if (stable(c.answers) !== stable(replay)) fail();
  const evidenceDone = stageComplete(w, "evidence"), reflectionDone = stageComplete(w, "reflection"), remedyDone = stageComplete(w, "remedy");
  if (c.phase !== "evidence" && !evidenceDone || ["evidence", "mission"].includes(c.phase) && Object.keys(c.answers.reflection).length || !["remedy", "done"].includes(c.phase) && Object.keys(c.answers.remedy).length || ["remedy", "done"].includes(c.phase) && !reflectionDone || c.phase === "remedy" && !chapterQuestions(w, "remedy").length || c.phase === "done" && !remedyDone) fail();
  const m = c.metrics, metricKeys = ["peakExposure", "minGrip", "distance", "transfers", "redundantTransfers", "patchErrors", "argumentErrors", "unreadPatchAttempts"];
  if (!keys(m, metricKeys) || metricKeys.some((k) => !Number.isFinite(m[k]) || m[k] < 0) || ["transfers", "redundantTransfers", "patchErrors", "argumentErrors", "unreadPatchAttempts"].some((k) => !Number.isInteger(m[k]) || m[k] > 1e3) || m.distance > 3e4 || m.minGrip > 100 || m.peakExposure > 120 || !c.optional || typeof c.optional !== "object" || Array.isArray(c.optional) || Object.entries(c.optional).some(([k, v]) => w.kind !== "action" || k !== "seal" || v !== true)) fail();
  if (w.kind === "action" && (m.peakExposure < w.exposure || m.minGrip > w.grip || m.transfers || m.redundantTransfers || m.patchErrors || m.argumentErrors || m.unreadPatchAttempts)) fail();
  if (w.kind === "strategy" && (m.peakExposure || m.minGrip !== 100 || m.distance || m.patchErrors || m.argumentErrors || m.unreadPatchAttempts)) fail();
  if (w.kind === "collation" && (m.peakExposure || m.minGrip !== 100 || m.distance || m.transfers || m.redundantTransfers || m.patchErrors > w.errors || m.argumentErrors > w.errors)) fail();
  if (c.phase === "evidence" && (w.time !== 0 || w.status !== "playing" || Object.keys(w.uses).length || Object.keys(w.buffs).length || Object.keys(c.optional).length || metricKeys.some((k) => m[k] !== (k === "minGrip" ? w.grip ?? 100 : 0)))) fail();
  if (c.phase === "evidence") {
    const fresh = create(w.id, w.snapshot.config, w.snapshot.identity, w.seed), fields = campaignRules(w) ? ["campaign"] : w.kind === "action" ? ["x", "y", "target", "grip", "exposure", "delivered", "pins"] : w.kind === "strategy" ? ["day", "people", "selected", "orders", "results", "plannedDay"] : ["page", "draft", "seen", "probe", "selected", "reason", "finished"];
    if (w.errors !== 0 || w.trace !== null || fields.some((k) => stable(w[k]) !== stable(fresh[k]))) fail();
  }
  if (w.kind === "strategy" && w.results.some((r, i) => !r || r.day !== i || !Array.isArray(r.people) || r.people.length !== 8 || r.people.some((n) => !Number.isInteger(n) || n < -1 || n > 4) || stable(r.need) !== stable(needs(w, i)) || stable(r.got) !== stable(counts(r)) || r.ok !== needs(w, i).every((n, j) => r.got[j] >= n))) fail();
  const after = ["reflection", "remedy", "done"].includes(c.phase);
  if (after) {
    if (!coreComplete(w) || !keys(c.missionResult, ["time", "score", "quality"]) || c.missionResult.time !== w.time || c.missionResult.score !== missionScore(w) || c.missionResult.quality !== operationReport(w).quality) fail();
  } else if (c.missionResult !== null || coreComplete(w)) fail();
  if (c.phase === "done" ? w.status !== "won" : w.status === "won" || w.status === "lost" && c.phase !== "mission") fail();
  return w;
}
function chapterProgress(before, next) {
  if (!before.chapter && !next.chapter) return true;
  if (!before.chapter || !next.chapter) throw Error("續玩不能改換章內模式。");
  validateChapter(before);
  validateChapter(next);
  if (campaignRules(before)) campaignRules(before).progress(before, next);
  const a = before.chapter, b = next.chapter, order = ["evidence", "mission", "reflection", "remedy", "done"];
  if (a.version !== b.version || a.route !== b.route || order.indexOf(b.phase) < order.indexOf(a.phase) || a.history.length > b.history.length || stable(a.history) !== stable(b.history.slice(0, a.history.length)) || a.missionResult && stable(a.missionResult) !== stable(b.missionResult) || Object.keys(a.optional).some((k) => !b.optional[k])) throw Error("續玩不能倒退或改寫已完成的章內紀錄。");
  if (a.missionResult) {
    const core = (w) => {
      const x = copy(w);
      delete x.chapter;
      delete x.status;
      delete x.notice;
      return x;
    };
    if (stable(core(before)) !== stable(core(next)) || stable(a.metrics) !== stable(b.metrics) || stable(a.optional) !== stable(b.optional)) throw Error("完成任務後不能改寫操作紀錄。");
  }
  for (const k of ["peakExposure", "distance", "transfers", "redundantTransfers", "patchErrors", "argumentErrors", "unreadPatchAttempts"]) if (b.metrics[k] < a.metrics[k]) throw Error("操作診斷紀錄不能倒退。");
  if (b.metrics.minGrip > a.metrics.minGrip) throw Error("最低握力紀錄不能倒退。");
  return true;
}
function restore(raw) {
  if (!raw || raw.schema !== VERSION) throw Error("角色冒險存檔格式不符。");
  const c = config(raw.snapshot?.config), p = pilot(raw.id);
  if (!compatible(c, p.id) || raw.kind !== p.kind || !["playing", "won", "lost"].includes(raw.status) || !Number.isFinite(raw.time) || raw.time < 0 || raw.time > 1200 || !Number.isFinite(raw.limit) || raw.limit < 1 || raw.limit > 900) throw Error("角色冒險狀態無法核對。");
  const w = copy(raw);
  if (JSON.stringify(w).length > 3e4) throw Error("角色冒險存檔過大。");
  const allFinite = (o) => {
    for (const v of Object.values(o || {})) {
      if (typeof v === "number" && !Number.isFinite(v)) return false;
      if (v && typeof v === "object" && !allFinite(v)) return false;
    }
    return true;
  };
  if (!allFinite(w)) throw Error("角色冒險數值無法辨識。");
  const fresh = w.chapter ? createChapter(p.id, c, w.snapshot.identity, w.seed, { route: w.chapter.route }) : create(p.id, c, w.snapshot.identity, w.seed);
  if (w.limit !== fresh.limit || w.errors < 0 || w.errors > 1e3 || !Number.isInteger(w.errors)) throw Error("冒險條件與開局不同。");
  for (const [k, v] of Object.entries(w.cooldowns || {})) if (!c.skills.includes(k) || !Number.isFinite(v) || v < 0 || v > w.time + 20) throw Error("能力冷卻不正確。");
  for (const [k, v] of Object.entries(w.buffs || {})) if (!["swift", "steady", "precise", "foresight", "listening"].includes(k) || !Number.isFinite(v) || v < 0 || v > w.time + 20) throw Error("能力持續時間不正確。");
  for (const [id, n] of Object.entries(w.uses || {})) {
    const s = SKILLS.find((s2) => s2.id === id);
    if (!s || !c.skills.includes(id) || !Number.isInteger(n) || n < 0 || n > s.uses) throw Error("能力次數不正確。");
  }
  if (campaignRules(p)) campaignRules(p).validate(w);
  if (p.kind === "action" && (!Array.isArray(w.delivered) || new Set(w.delivered).size !== w.delivered.length || w.delivered.some((n) => ![0, 1, 2].includes(n)) || !Number.isFinite(w.x) || !Number.isFinite(w.y) || !Number.isFinite(w.grip) || w.x < 5 || w.x > 95 || w.y < 0 || w.y > 100 || w.maxGrip !== fresh.maxGrip || w.grip < 0 || w.grip > w.maxGrip || w.maxExposure !== fresh.maxExposure || !Number.isFinite(w.exposure) || w.exposure < 0 || w.exposure > w.maxExposure)) throw Error("夜縋存檔不正確。");
  if (p.kind === "strategy" && (!Array.isArray(w.people) || w.people.length !== 8 || w.people.some((n) => !Number.isInteger(n) || n < -1 || n > 4) || !Number.isInteger(w.day) || w.day < 0 || w.day > 4 || !Number.isInteger(w.orders) || w.orders < 0 || w.orders > 9 || !Array.isArray(w.results) || ![w.day, w.day + 1].includes(w.results.length))) throw Error("調度存檔不正確。");
  if (p.kind === "collation" && (!Number.isInteger(w.page) || w.page < 0 || w.page > 2 || !Array.isArray(w.draft) || w.draft.length !== Array.from(TEXTS[w.page].original).length || w.draft.some((x) => typeof x !== "string" || Array.from(x).length !== 1) || Object.entries(w.seen || {}).some(([i, n]) => !/^\d+$/.test(i) || +i >= w.draft.length || typeof n !== "number" || n < 0 || n > 1))) throw Error("對勘存檔不正確。");
  if (w.status === "won") {
    const valid = coreComplete(w);
    if (!valid) throw Error("任務條件尚未完成，不能記為通關。");
  }
  if (w.chapter) validateChapter(w);
  return w;
}
module.exports = { CH, WA, campaignRules, VERSION, BUDGET, STATS, SKILLS, PILOTS, JOBS, SPECIALTIES, NEEDS, EVENTS, TEXTS, CHAPTER_VERSION, CHAPTERS, copy, clamp, pilot, config, defaults, compatible, create, createChapter, chapterCreate: createChapter, chapterRoutes, chapterQuestions, chapterCommand, chapterReport, chapterObjectives, chapterProgress, mergeJournal, coverPoints, needs, event, skill, lit, cover, step, inspect, command, counts, score, restore };

return module.exports;})();
