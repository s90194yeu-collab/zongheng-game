/** 大同與小康 v1.1.0，2026-10-12。更新 S_cq16_datong_data；保留 Code。
 * ready；14錨點、12章內圖鑑（中央既有10項、本話新增2項）、3必要體驗。沿用中央圖鑑授予規則。
 * 蜡祭後問答與武城弦歌對讀；治理操作為教學情境，不作歷史實現之證。
 * 三種評語皆固定史實；候選任命、照養數量與制度安置為教學推演。
 */
var SCENARIO_DATA = SCENARIO_DATA || {};
SCENARIO_DATA['S_cq16_datong'] = {
  "version": "v1.1.0",
  "status": "ready",
  "anchors": [
    {
      "id": "dt_01",
      "seq": 1,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "仲尼之歎，蓋歎魯也。",
      "stem": "蜡祭後孔子的喟歎，原文指向什麼？",
      "answer": "B",
      "options": {
        "A": [
          "他稱武城已經成了大同，所以慶祝勝利。",
          "情節",
          "此處是歎魯與問答，未記武城成了大同。"
        ],
        "B": [
          "感歎魯國，引出對理想與現實秩序的思考。"
        ],
        "C": [
          "喟是吞下祭肉，與感歎無關。",
          "字義",
          "喟然是長歎的樣子。"
        ],
        "D": [
          "仲尼是周公，正在下令征秦。",
          "人物",
          "仲尼是孔子，言偃在側詢問。"
        ]
      },
      "explanation": "本文由歎魯引出問答，不是記錄一座理想國的建成。",
      "followUp": "言偃在側，曰：「君子何歎？」"
    },
    {
      "id": "dt_02",
      "seq": 2,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "丘未之逮也，而有志焉。",
      "stem": "「未之逮」與「有志」怎麼讀？",
      "answer": "D",
      "options": {
        "A": [
          "孔子親眼看過所有三代君主，志是現在的官位。",
          "情節",
          "未之逮是未能趕上，志與古代記載相連。"
        ],
        "B": [
          "逮是把言偃逮捕，志是懲罰告示。",
          "字義",
          "逮在此為趕上，不是捕人。"
        ],
        "C": [
          "有志表示孔子已決定率軍建立大同。",
          "動機",
          "這句不是出征命令，亦未交代現世實現。"
        ],
        "D": [
          "我未能趕上那個時代，但古代記載留有其說；不能當作孔子親見的實錄。"
        ]
      },
      "explanation": "未之逮是未逮之的否定賓語前置；志在本句指古代記載，可與今語立志區分。",
      "followUp": ""
    },
    {
      "id": "dt_03",
      "seq": 3,
      "kind": "decision",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "大道之行也，天下為公。選賢與能，講信修睦。",
      "stem": "【你是言偃】教學推演的任命，怎樣接上這段原則？",
      "answer": "A",
      "options": {
        "A": [
          "按德行、才能與可核實績任事，讓信用與和睦能持續建立。"
        ],
        "B": [
          "只看宗族，熟人免查實績才叫天下為公。",
          "動機",
          "天下為公與選賢與能相連，不能只任親。"
        ],
        "C": [
          "與能是和能者吵架，不必安排職務。",
          "字義",
          "與通舉，為推舉有才能者。"
        ],
        "D": [
          "只要把門鎖拿走，任命與互信都會自動完成。",
          "情節",
          "外戶不閉在後段，是秩序的結果而非捷徑。"
        ]
      },
      "explanation": "賢重德行、能重才能，與通舉；講信修睦須有守約與協同的實踐。",
      "followUp": ""
    },
    {
      "id": "dt_04",
      "seq": 4,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "故人不獨親其親，不獨子其子。",
      "stem": "「不獨親其親」的照養範圍是什麼？",
      "answer": "C",
      "options": {
        "A": [
          "親其親是廢除親人，連自家長輩也不能關心。",
          "字義",
          "不獨是不限於，不是否定親愛自己的家人。"
        ],
        "B": [
          "子其子是只養自己的小孩，陌生幼者不得入簿。",
          "情節",
          "不獨子其子要把責任推至家門之外。"
        ],
        "C": [
          "不只親愛自己的長輩、不只慈愛自己的子女，也推及其他需要的人。"
        ],
        "D": [
          "此句只要求富裕者多存糧，與照養對象無關。",
          "動機",
          "下文使老壯幼及矜寡孤獨廢疾皆受照養。"
        ]
      },
      "explanation": "第一個親、子為動詞，第二個親、子是自己的長輩與子女；重點在不獨。",
      "followUp": ""
    },
    {
      "id": "dt_05",
      "seq": 5,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "使老有所終，壯有所用，幼有所長，矜、寡、孤、獨、廢、疾者皆有所養。",
      "stem": "下列哪種照養安排最合於原文？",
      "answer": "B",
      "options": {
        "A": [
          "每戶只領相同一份糧，病者不能出力就不得受養。",
          "動機",
          "皆有所養不能排除廢疾；幼成長與老終養也有不同需求。"
        ],
        "B": [
          "依年齡、能力與照養需求安排；無親支持、病弱者也受養，糧與照護不能互代。"
        ],
        "C": [
          "矜是驕傲者、獨是偶爾獨自散步者，與無依無靠無關。",
          "字義",
          "矜通鰥，獨在此為老而無子者。"
        ],
        "D": [
          "壯有所用表示有力者只可服務自己的家。",
          "情節",
          "下文力不必為己，不能限於自家。"
        ]
      },
      "explanation": "老終養、壯任用、幼成長，各有不同需要；矜通鰥。廢疾者受養，不把同額出力當受養資格。",
      "followUp": ""
    },
    {
      "id": "dt_06",
      "seq": 6,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "貨惡其棄於地也，不必藏於己；力惡其不出於身也，不必為己。",
      "stem": "財貨與勞力的共同原則是什麼？",
      "answer": "D",
      "options": {
        "A": [
          "不能藏己就是所有備糧都得丟掉，也不能有儲備。",
          "字義",
          "惡棄強調避免浪費，不必藏己並非反對一切儲備。"
        ],
        "B": [
          "力不必為己是任何人都不用出力，公共事務自然完成。",
          "字義",
          "惡其不出於身要求盡可用之力，不必為己是不限私利。"
        ],
        "C": [
          "應強逼病者出相同勞力，否則取消所有照養。",
          "動機",
          "須和廢疾皆有所養合讀，不能用勉強出力排除病者。"
        ],
        "D": [
          "避免貨物浪費與能力閒置，把使用與分工推向公共需要，不只藏己、為己。"
        ]
      },
      "explanation": "兩句以貨、力平行對舉：不浪費、不只為己。不必不是一律禁止，公共儲備仍可供接續照養。",
      "followUp": ""
    },
    {
      "id": "dt_07",
      "seq": 7,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "是故謀閉而不興，盜竊亂賊而不作，故外戶而不閉，是謂「大同」。",
      "stem": "外戶不閉在論述中，處於什麼位置？",
      "answer": "A",
      "options": {
        "A": [
          "前述互信、照養與公共使用使謀亂不興，外戶不閉是安定秩序的結果。"
        ],
        "B": [
          "只要先移除門鎖，就證明所有人已有互信與照養。",
          "動機",
          "原文是故、故串起因果，門戶狀態不能倒當充分原因。"
        ],
        "C": [
          "外戶是外國的軍隊，不閉是晉軍不撤退。",
          "字義",
          "外戶是外門，與此處社會秩序相連。"
        ],
        "D": [
          "這段是武城當日戶籍實查，已逐戶證明大同存在。",
          "史實",
          "本文論理想，不是現世普查；本遊戲的配置更不是史證。"
        ]
      },
      "explanation": "閉而不興與不閉並列，用字相反而對象不同：奸謀止息、外門不必緊閉。",
      "followUp": ""
    },
    {
      "id": "dt_08",
      "seq": 8,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "今大道既隱，天下為家，各親其親，各子其子。貨力為己，大人世及以為禮。",
      "stem": "從大同轉到小康，哪些基礎改變了？",
      "answer": "C",
      "options": {
        "A": [
          "大人就是所有年滿十八歲的人，都自動成為國君。",
          "字義",
          "大人在此指有位者、諸侯，不是今日成年年齡。"
        ],
        "B": [
          "世及是世界及格，所以只是在比較學校成績。",
          "字義",
          "世及指父死子繼、兄終弟及的承襲。"
        ],
        "C": [
          "天下為家、親子與貨力集中於各家；有位者以承襲為禮，現實秩序另須規範。"
        ],
        "D": [
          "小康仍是天下為公，而且文中毫無禮義制度。",
          "情節",
          "此段明記天下為家，後段又以禮義為紀。"
        ]
      },
      "explanation": "世為父死子繼，及為兄終弟及；小康的起點不是大同已完美實現，也不等於完全沒有禮。",
      "followUp": ""
    },
    {
      "id": "dt_09",
      "seq": 9,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "城郭溝池以為固，禮義以為紀。",
      "stem": "「固」與「紀」分別指什麼作用？",
      "answer": "B",
      "options": {
        "A": [
          "固是把人凍住，紀是計算每戶現代年收入。",
          "字義",
          "固指防固屏障，紀指綱紀規範。"
        ],
        "B": [
          "城郭溝池鞏固防禦，禮義作為規範秩序的綱紀；不能只築城而忽略禮。"
        ],
        "C": [
          "城郭就是天下為公，所以不用再看君臣父子。",
          "情節",
          "城防出現在小康，後文以禮正人倫設制度。"
        ],
        "D": [
          "小康是國家不再有任何謀與兵，和大同完全一樣。",
          "情節",
          "後文明記謀用是作、兵由此起，二者不能混同。"
        ]
      },
      "explanation": "物理防固與規範秩序有不同功能。外有城郭不代表內政已能自動持續。",
      "followUp": ""
    },
    {
      "id": "dt_10",
      "seq": 10,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "以正君臣，以篤父子，以睦兄弟，以和夫婦，以設制度，以立田里，以賢勇知，以功為己。",
      "stem": "「禮義以為紀」如何展開？",
      "answer": "D",
      "options": {
        "A": [
          "只要祭禮服飾漂亮，君臣關係與田里都不必安排。",
          "動機",
          "本文逐項列人倫、制度、田里等，不限儀式外觀。"
        ],
        "B": [
          "賢勇知表示每天只招勇於打架者，不需要智慧。",
          "字義",
          "賢在此為推重，勇知包含勇力與智謀。"
        ],
        "C": [
          "以功為己直接等於不必為己，二者沒有差異。",
          "字義",
          "為己與不必為己正是兩段的對照之一。"
        ],
        "D": [
          "禮須落在人倫關係、制度與田里等實務；文中也保留推重勇智、建立自身事功的現實。"
        ]
      },
      "explanation": "連續以字列出禮的實際作用；不能把小康等同只有城牆、祭典或富裕。",
      "followUp": ""
    },
    {
      "id": "dt_11",
      "seq": 11,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "故謀用是作，而兵由此起。",
      "stem": "這句怎樣連接小康的現實基礎？",
      "answer": "A",
      "options": {
        "A": [
          "家族私利與功為己的秩序會生爭奪、謀與兵，因而更需禮義規範。"
        ],
        "B": [
          "謀和兵都永遠消失了，因為小康與大同完全相同。",
          "情節",
          "作與起明記發生，對照大同的閉而不興、不作。"
        ],
        "C": [
          "兵指紙上的竹簡，不關乎利益衝突。",
          "字義",
          "兵在此指兵爭、戰爭，不能改成文書工具。"
        ],
        "D": [
          "只要謀兵會起，所有禮義都沒有任何作用。",
          "動機",
          "後文六君子謹禮仍維持小康，不能因此說禮無效。"
        ]
      },
      "explanation": "文章沒有說現實完全無規範，而是指出利益爭奪與禮的必要。",
      "followUp": ""
    },
    {
      "id": "dt_12",
      "seq": 12,
      "kind": "reading",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "禹、湯、文、武、成王、周公，由此其選也。此六君子者，未有不謹於禮者也。",
      "stem": "六君子在本段的作用是什麼？",
      "answer": "C",
      "options": {
        "A": [
          "六君子都是孔子當天任命的武城里長。",
          "人物",
          "他們是文中歷代人物，不是同時代候選人。"
        ],
        "B": [
          "周公與言偃一起親自參加這次武城推演。",
          "史實",
          "周公早於孔子，畫面只能作回看意象。"
        ],
        "C": [
          "舉出謹於禮的歷代典範，說明大道既隱的現實仍能以禮建立較有秩序的小康。"
        ],
        "D": [
          "六君子從不看禮，只比誰的城郭最高。",
          "動機",
          "未有不謹於禮者也正強調謹禮。"
        ]
      },
      "explanation": "此處論小康的謹禮典範，不把歷代人物排成同時代內閣，也不誤判為只屬大同段。",
      "followUp": ""
    },
    {
      "id": "dt_13",
      "seq": 13,
      "kind": "decision",
      "source": "〈大同與小康〉，《禮記・禮運》",
      "passage": "以著其義，以考其信，著有過，刑仁講讓，示民有常。如有不由此者，在埶者去，眾以為殃，是謂「小康」。",
      "stem": "【你是言偃】制度比較最後，怎樣記錄禮對在位者的要求？",
      "answer": "B",
      "options": {
        "A": [
          "只有百姓受查核，親族與執政者永遠例外。",
          "動機",
          "在埶者去也把規範指向有位者。"
        ],
        "B": [
          "明示義與過、考信，以仁為典型、講讓；不依禮的在位者也不能永遠免責。"
        ],
        "C": [
          "刑仁是懲罰仁者，所以無須示範與禮讓。",
          "字義",
          "刑通型，為效法、以仁為典型，非把仁者當刑罰對象。"
        ],
        "D": [
          "常是現代固定收入門檻，與規則或人倫無關。",
          "字義",
          "示民有常為昭示可遵循常法，非現代收入數字。"
        ]
      },
      "explanation": "刑通型，埶通勢。本文既要求德行示範、禮讓與常法，也述不由禮的在位者去。",
      "followUp": ""
    },
    {
      "id": "dt_14",
      "seq": 14,
      "kind": "reading",
      "source": "《論語・陽貨》",
      "passage": "子曰：「二三子！偃之言是也，前言戲之耳！」",
      "stem": "孔子聞武城弦歌後的這句，能支持何種判斷？",
      "answer": "D",
      "options": {
        "A": [
          "他明言言偃已建立大同，故不用辨課文與推演。",
          "史實",
          "此章肯定子游的學道禮樂之說，沒有宣布武城實現大同。"
        ],
        "B": [
          "二三子指兩三個國君，偃就是周公。",
          "人物",
          "二三子為對弟子們的稱呼；偃為言偃。"
        ],
        "C": [
          "他撤回愛人，只留下割雞必須使用牛刀的命令。",
          "情節",
          "前言戲之耳澄清前面的戲語，非武器或宰殺操作命令。"
        ],
        "D": [
          "他肯定言偃以學道禮樂治理小邑；仍不能用這句或遊戲高分證明歷史上實現大同。"
        ]
      },
      "explanation": "《論語》武城弦歌與《禮運》問答可對讀治理志向，不能混成同一天的實驗成功證明。",
      "followUp": ""
    }
  ],
  "codex": [
    {
      "type": "treasure",
      "id": "cq16_gongbu",
      "name": "公共照養簿",
      "glyph": "簿",
      "title": "教學器物・糧與力分開",
      "text": "遊戲自擬的照養簿，記錄三期各戶所需糧與人力、實際配給與待命人力。讓學生親自核配，避免用一個抽象愛心分數代替所有照養；非出土言偃施政簿。",
      "source": "本話教學推演"
    },
    {
      "type": "treasure",
      "id": "cq16_shuangtu",
      "name": "公家制度雙圖",
      "glyph": "圖",
      "title": "教學器物・比較不冒充實現",
      "text": "把六項制度安到大同、小康兩圖，再以原文與責任核定收束。圖上的安置是閱讀與治理推演，不證明武城真曾成大同，也不把小康讀成無禮無規範。",
      "source": "本話教學推演"
    }
  ]
};

/**
 * 安裝新版第十六話後，在 Apps Script 編輯器手動執行 updateCq16AnchorBank_。
 * 平台會優先讀取試算表；一般「匯入錨點」不會覆寫同 ID 的舊題。
 * 本功能只更新本話 dt_01～dt_14 的 23 欄題目內容並啟用，缺題則補入。
 * 保留其他篇章、額外欄位、學生作答紀錄與成績；重複執行不會重複新增。
 * 尾端底線讓本功能不開放給網頁呼叫，不會在開啟遊戲時執行。
 * 請先貼好本資料檔，再執行，最後部署新版本。
 */
function updateCq16AnchorBank_() {
  const scenarioId = 'S_cq16_datong';
  const data = SCENARIO_DATA[scenarioId];
  if (!data || !Array.isArray(data.anchors) || data.anchors.length !== 14) {
    throw new Error('第十六話資料不完整，請先貼入完整的 S_cq16_datong_data。');
  }
  const headers = ['anchorId', 'scenarioId', 'seq', 'kind', 'stem', 'sourceRef', 'passage',
    'optA', 'optB', 'optC', 'optD', 'answer',
    'typeA', 'typeB', 'typeC', 'typeD', 'forkA', 'forkB', 'forkC', 'forkD',
    'followUp', 'explanation', 'enabled'];
  const drafts = data.anchors.map(function (anchor, i) {
    const expectedId = 'dt_' + String(i + 1).padStart(2, '0');
    if (anchor.id !== expectedId || anchor.seq !== i + 1) {
      throw new Error('第十六話錨點順序不符，尚未更新題庫：' + expectedId);
    }
    return draftToRow_(scenarioId, anchor);
  });
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  let wrote = false;
  try {
    const sheet = getSheet_('AnchorBank');
    const values = sheet.getDataRange().getValues();
    if (!values.length || headers.some(function (name, i) { return values[0][i] !== name; })) {
      throw new Error('AnchorBank 欄位與平台規格不同，尚未更新題庫。');
    }
    const wanted = {};
    drafts.forEach(function (row) { wanted[row[0]] = true; });
    const found = {};
    for (let i = 1; i < values.length; i++) {
      const id = String(values[i][0] || '').trim();
      if (!wanted[id]) continue;
      if (String(values[i][1] || '').trim() !== scenarioId || found[id]) {
        throw new Error('錨點 ' + id + ' 重複或屬於其他篇章，尚未更新題庫。');
      }
      found[id] = { row: i + 1, values: values[i] };
    }
    const changes = [], additions = [];
    drafts.forEach(function (row) {
      const old = found[row[0]];
      if (!old) additions.push(row);
      else if (row.some(function (value, i) { return value !== old.values[i]; })) {
        changes.push({ row: old.row, values: row });
      }
    });
    if (additions.length) {
      const required = sheet.getLastRow() + additions.length;
      if (required > sheet.getMaxRows()) {
        sheet.insertRowsAfter(sheet.getMaxRows(), required - sheet.getMaxRows());
      }
    }
    changes.forEach(function (change) {
      wrote = true;
      sheet.getRange(change.row, 1, 1, headers.length).setValues([change.values]);
    });
    if (additions.length) {
      wrote = true;
      sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, headers.length).setValues(additions);
    }
    if (wrote) SpreadsheetApp.flush();
    const message = '大同與小康 v1.1.0 題庫完成：更新 ' + changes.length + ' 題，新增 ' + additions.length +
      ' 題，共 14 題。請部署新版本，並重整遊戲頁面。';
    Logger.log(message);
    return message;
  } finally {
    try {
      // 即使寫入途中遇到服務錯誤，下一次讀取仍會取得目前試算表內容。
      CacheService.getScriptCache().remove(anchorCacheKey_(scenarioId));
    } finally {
      lock.releaseLock();
    }
  }
}
