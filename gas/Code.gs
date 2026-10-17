/**
 * ============================================================
 *  Re:縱橫鼎業
 *  〜轉生成 Lv.1 亂世策士的我，只能靠《古文觀止》問鼎天下〜
 * ------------------------------------------------------------
 *  檔名：Code.gs
 *  版本：v0.2.3（2026-10-16）
 *  依賴：Auth.gs（登入判定、教師驗證）
 *  說明：網頁路由、訪客關卡控管、全域設定、試算表結構與初始化、
 *        試算表自訂選單、連線測試頁、需要登入的提示頁
 *  v0.1.1：新增訪客模式。未登入者可完整遊玩課綱選文四關，
 *          其他劇本頁改顯示「登入學校帳號」提示頁。
 *  v0.1.2：試算表上方新增「縱橫鼎業」選單，可一鍵建立／補齊工作表、
 *          檢查設定狀態、查看遊戲網址。
 *  v0.1.3：傳給頁面的資料改用 safeJson_ 跳脫，網址參數無法插入程式碼。
 *  v0.1.4：支援「劇本資料檔」（S_ch04_hongmen_data.gs 這類檔案）。
 *          每一話的開放狀態、圖鑑、錨點都寫在自己的資料檔，
 *          include('Data_catalog')、include('Data_codex') 會自動接上，
 *          新增劇本不必再修改 Data_catalog、Data_codex、AnchorBank。
 *  v0.1.5：頁面 include('Eng_Story') 時，自動先插入 Art_kit（Q 版立繪、精細場景）
 *          與 Arena_js（小遊戲挑戰賽、排行榜），所有劇本頁不用修改就能升級；
 *          同一頁裡每個檔只插入一次。Config 新增 leaderboard（排行榜開關）。
 *  v0.1.6：以使用者提供的現用 v0.1.5 全文整合，新增個人頁 Profile 與
 *          可愛 3D 收藏館 Gallery 的入口；預設首頁與既有功能維持。
 *  v0.1.7：Anchor_js 後自動接上 StoryAnchor_js，讀取目前題庫，避免空題庫快取卡住。
 *  v0.2.3：對話背景統一 AI 圖；沿用首頁漸進載入與素材快取。
 *  v0.2.2：首頁美術改漸進載入，避免大型內嵌插畫阻擋第一畫面；沿用圖片診斷。
 *  v0.2.1：連線測試新增 AI 圖片索引與載入器檔案檢查；背景缺件不再只看一般素材資料夾。
 *  v0.1.15：楚漢九話接入集中場景任務，三篇共用載入。
 *  v0.1.14：戰國十三話接入共用場景任務，保留春秋設定。
 *  v0.1.13：春秋篇集中載入場景任務，不必逐話修改。
 *  v0.1.12：SLG 引擎自動載入關鍵演出；秦晉圍鄭依實際錨點定位。
 *  v0.1.11：Core_js 後接上集中素材清單與載入器；既有美術介面與遊戲路由沿用。
 * ============================================================
 */

// ───────────────────────── 全域設定 ─────────────────────────

const APP_NAME = 'Re:縱橫鼎業';
const APP_SUBTITLE = '〜轉生成 Lv.1 亂世策士的我，只能靠《古文觀止》問鼎天下〜';
const APP_VERSION = 'v4.0.0-google';
const APP_TIMEZONE = 'Asia/Taipei';

/** 可寫入紀錄的學校網域 */
const SCHOOL_DOMAINS = ['gm.nssh.ntpc.edu.tw', 'stdmail.nssh.ntpc.edu.tw'];

/** 指令碼屬性（Script Properties）的鍵名 */
const PROP_PWD_SALT = 'TEACHER_PWD_SALT';
const PROP_PWD_HASH = 'TEACHER_PWD_HASH';
const PROP_TEACHERS = 'TEACHER_EMAILS';
const PROP_SS_ID = 'SPREADSHEET_ID';
const PROP_ASSET_FOLDER = 'ASSET_FOLDER_ID';

/** 頁面路由：網址參數 ?page= 的值 → HTML 檔名 */
const PAGE_ROUTES = {
  hub: 'Hub',        // 首頁與登入
  profile: 'Profile',// 策士個人頁與 3D 紙娃娃
  gallery: 'Gallery',// 可愛 3D 收藏館
  map: 'Map',        // 天下大地圖
  result: 'Result',  // 結算與列傳
  teacher: 'Teacher',// 教師後臺
  lab3d: 'Profile'   // 3D 紙娃娃整合於個人頁
};

/** 劇本頁檔名格式：S_cq08_weizheng（時期 cq／zg／ch ＋ 兩位數序號 ＋ 小寫拼音） */
const SCENARIO_PAGE_PATTERN = /^S_(cq|zg|ch)\d{2}_[a-z0-9]+$/;

/**
 * 訪客可完整遊玩的課綱選文四關（未登入也能玩，但不寫入紀錄）：
 * 秦晉圍鄭〈燭之武退秦師〉、大同與小康〈大同與小康〉、
 * 奇貨可居與逐客〈諫逐客書〉、鴻門宴〈鴻門宴〉。
 * 實際名單以 Config 工作表的 guest_scenarios 為準。
 */
const GUEST_SCENARIOS_DEFAULT = 'S_cq08_weizheng,S_cq16_datong,S_zg11_zhuke,S_ch04_hongmen';

/** 課綱選文四關的顯示名稱（需要登入的提示頁使用） */
const GUEST_SCENARIO_TITLES = ['秦晉圍鄭〈燭之武退秦師〉', '大同與小康〈大同與小康〉', '奇貨可居與逐客〈諫逐客書〉', '鴻門宴〈鴻門宴〉'];

/** 試算表結構：工作表名稱 → 第一列欄位 */
const SHEETS = {
  Users: ['email', 'domain', 'classSeat', 'displayName', 'rank', 'statsJson', 'firstLogin', 'lastLogin', 'loginCount'],
  Saves: ['email', 'scenarioId', 'mode', 'stateJson', 'updatedAt', 'clientVersion'],
  ScenarioLog: ['timestamp', 'email', 'scenarioId', 'mode', 'faction', 'ending', 'scoreStrategy', 'scoreVirtue', 'turns', 'durationSec', 'clientVersion'],
  AnchorLog: ['timestamp', 'email', 'scenarioId', 'anchorId', 'attempt', 'choice', 'correct', 'firstTry', 'path', 'distractorType', 'seconds'],
  MiniGameLog: ['timestamp', 'email', 'scenarioId', 'gameId', 'score', 'maxScore', 'durationSec'],
  Codex: ['email', 'itemType', 'itemId', 'scenarioId', 'unlockedAt'],
  Reflection: ['timestamp', 'email', 'scenarioId', 'kind', 'text'],
  AnchorBank: ['anchorId', 'scenarioId', 'seq', 'kind', 'stem', 'sourceRef', 'passage',
    'optA', 'optB', 'optC', 'optD', 'answer',
    'typeA', 'typeB', 'typeC', 'typeD',
    'forkA', 'forkB', 'forkC', 'forkD',
    'followUp', 'explanation', 'enabled'],
  Config: ['key', 'value', 'description']
};

/** 各工作表的中文說明（寫在 A1 儲存格的附註） */
const SHEET_NOTES = {
  Users: '學生名冊：學校帳號第一次進入遊戲時自動建立。classSeat＝班級座號（5 碼），rank＝名位，statsJson＝五維。',
  Saves: '存檔：每位學生每個劇本、每種模式一列；stateJson 為遊戲狀態。',
  ScenarioLog: '每局紀錄：劇本、模式（正史／演義）、陣營、結局與分數。',
  AnchorLog: '史實錨點作答紀錄。path：direct＝直選史實；fork＝歧路推演後回歸；fail＝回歸後追問仍錯。',
  MiniGameLog: '小遊戲成績。',
  Codex: '史冊圖鑑解鎖紀錄。itemType：person 人物／idiom 成語／treasure 寶物／text 原文／school 諸子／classic 六經。',
  Reflection: '反思與列傳文字。kind：reflection 反思／biography 列傳。',
  AnchorBank: '錨點題庫，老師可直接修改。answer 填 A～D；typeA～D 填誘答類型（字義、人物、動機、情節、史實）；forkA～D 填選到該項時的歧路推演說明；enabled 填 TRUE 才會出題。',
  Config: '遊戲設定：修改 value 欄即可，不要改 key 欄。'
};

/** Config 工作表的預設值 */
const CONFIG_DEFAULTS = [
  ['weight_history', 35, '五維權重：史識（%）'],
  ['weight_letters', 25, '五維權重：文辭（%）'],
  ['weight_strategy', 20, '五維權重：謀略（%）'],
  ['weight_virtue', 10, '五維權重：德望（%）'],
  ['weight_erudition', 10, '五維權重：博通（%）'],
  ['required_scenarios', 'S_cq08_weizheng', '必玩劇本代碼，以逗號分隔'],
  ['deadline', '', '必玩劇本期限（YYYY-MM-DD，可空白）'],
  ['allow_guest', 'TRUE', '是否開放訪客遊玩（TRUE／FALSE）'],
  ['guest_scenarios', GUEST_SCENARIOS_DEFAULT, '訪客可完整遊玩的劇本代碼（課綱選文四關），以逗號分隔'],
  ['leaderboard', 'TRUE', '小遊戲排行榜（TRUE 開啟；FALSE 學生只看得到自己的最佳成績）']
];


// ───────────────────────── 網頁進入點 ─────────────────────────

/**
 * 網頁應用程式的進入點。
 * 網址加上 ?page=hub、?page=map、?page=S_cq08_weizheng 等切換頁面；
 * ?page=diag 永遠顯示連線測試頁。
 */
function doGet(e) {
  const params = (e && e.parameter) || {};
  const page = String(params.page || 'hub').trim();

  if (page === 'diag') return buildDiagPage_('');

  const fileName = resolvePage_(page);
  if (!fileName) {
    return buildDiagPage_('找不到「' + page + '」這個頁面，以下先顯示連線測試。');
  }
  CURRENT_PAGE_ = fileName;
  CURRENT_SCENARIO_ = SCENARIO_PAGE_PATTERN.test(fileName) ? fileName
    : (fileName === 'Result' && SCENARIO_PAGE_PATTERN.test(String(params.s || '')) ? String(params.s) : '');

  const user = getCurrentUser_();

  // 劇本頁：訪客只能進入開放的關卡，其餘顯示「登入學校帳號」提示頁
  if (SCENARIO_PAGE_PATTERN.test(fileName) && !user.isSchool && !isGuestPlayable_(fileName)) {
    return buildLockedPage_();
  }

  // 帳號與關卡控管留在 Google；GitHub 只提供沒有個人資料的畫面空殼與素材。
  if (typeof githubEnabled_ === 'function' && githubEnabled_()) {
    try { return buildGithubGamePage_(fileName, page, params, user); }
    catch (err) { Logger.log('GitHub 畫面暫不可用，沿用 GAS HTML。'); }
  }

  let template;
  try {
    template = HtmlService.createTemplateFromFile(fileName);
  } catch (err) {
    return buildDiagPage_('「' + fileName + '」頁面還沒建立，以下先顯示連線測試。');
  }

  template.appUrl = getAppUrl_();
  template.page = page;
  template.params = safeJson_(params);
  template.version = APP_VERSION;
  template.userJson = safeJson_({
    email: user.email,
    isSchool: user.isSchool,
    isGuest: user.isGuest,
    isTeacher: user.isTeacher,
    loginUrl: getLoginUrl_()
  });
  template.guestScenariosJson = safeJson_(getGuestScenarios_());
  return finalizeOutput_(template.evaluate());
}

/** 目前開放給訪客的劇本代碼清單（allow_guest 為 FALSE 時為空） */
function getGuestScenarios_() {
  const config = getConfig_();
  if (String(config.allow_guest).toUpperCase() === 'FALSE') return [];
  return String(config.guest_scenarios || GUEST_SCENARIOS_DEFAULT)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/** 這個劇本是否開放訪客遊玩 */
function isGuestPlayable_(scenarioId) {
  return getGuestScenarios_().indexOf(scenarioId) > -1;
}

/** 網址參數 → HTML 檔名；不合法時回傳空字串 */
function resolvePage_(page) {
  if (Object.prototype.hasOwnProperty.call(PAGE_ROUTES, page)) return PAGE_ROUTES[page];
  if (SCENARIO_PAGE_PATTERN.test(page)) return page;
  return '';
}

/** 所有頁面共用的輸出設定 */
function finalizeOutput_(output) {
  return output
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 轉成可直接放進 <script> 的 JSON。
 * 把 < > & 與 U+2028／U+2029 改成 \u 跳脫，避免有人在網址參數放入
 * </script> 之類的字串，讓頁面執行不該執行的程式。
 */
function safeJson_(value) {
  return JSON.stringify(value === undefined ? null : value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** 給 HTML 樣板使用：<?!= include('Core_css') ?> */
function include(fileName) {
  if (fileName === 'Core_js') return includeOptional_('Data_doll3d') + includeOnce_('Core_js') + includeOptional_('Data_assets') + includeOptional_('Asset_js') + includeOptional_('Data_cutin') + (/^S_(cq|zg|ch)/.test(CURRENT_PAGE_) ? includeOptional_('Data_spring') + includeOptional_('Data_warring') + includeOptional_('Data_chuhan') + includeOptional_('SpringModels') + includeOptional_('Spring_css') + includeOptional_('Spring_js') + includeOptional_('Data_gameplay') + includeOptional_('GameplayModels') + includeOptional_('GameplayNative') + includeOptional_('GameplayCanvas') + includeOptional_('Gameplay_css') + includeOptional_('Gameplay_js') + textplayIncludesIfInstalled_() : '');
  if (fileName === 'Art_kit') return includeOptional_('Art_kit') + '<script>if(window.ZH&&ZH.assets&&window.ART)ZH.assets.installArt(window.ART);</script>';
  if (fileName === 'Data_assets' || fileName === 'Asset_js' || fileName === 'Data_doll3d' || fileName === 'Data_cutin' || fileName === 'Cutin_js') return includeOptional_(fileName);
  if (fileName === 'Anchor_js') return includeOnce_('Anchor_js') + includeOptional_('StoryAnchor_js');
  if (fileName === 'StoryAnchor_js') return includeOptional_('StoryAnchor_js');
  // 劇情引擎會用到的美術與挑戰賽：自動先插入（每一頁只插入一次）
  if (fileName === 'Eng_SLG') return includeOptional_('Data_cutin') + includeOptional_('Cutin_js') + includeOnce_('Eng_SLG');
  if (fileName === 'Eng_Story') return include('Art_kit') + includeOptional_('Arena_js') + includeOptional_('Data_cutin') + includeOptional_('Cutin_js') + includeOnce_('Eng_Story');
  if (fileName === 'Art_kit' || fileName === 'Arena_js') return includeOptional_(fileName);
  if (fileName === 'Codex_js') return includeOptional_('Data_cutin') + includeOptional_('Cutin_js') + includeOnce_('Codex_js');
  const html = HtmlService.createHtmlOutputFromFile(fileName).getContent();
  if (fileName === 'Data_catalog' || fileName === 'Data_codex') return html + scenarioDataScript_(fileName) + (fileName === 'Data_codex' ? includeOptional_('Data_cutin') + includeOptional_('CutinBook_js') : '');
  return html;
}

/** 這一頁已經插入過的檔（每次產生頁面都會重新開始） */
var INCLUDED_ = {};

/** 插入一次；同一頁第二次 include 同一個檔時回傳空字串 */
function includeOnce_(fileName) {
  if (INCLUDED_[fileName]) return '';
  INCLUDED_[fileName] = true;
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}

/** 選用的檔：還沒建立時不要讓整頁壞掉（引擎會退回舊的畫法） */
function includeOptional_(fileName) {
  if (fileName === 'HubArt') {
    try { return includeOnce_('HubArtLoader'); } catch (err) { /* 未新增時沿用原美術。 */ }
  }
  try {
    return includeOnce_(fileName);
  } catch (err) {
    return '\n<!-- ' + fileName + ' 還沒建立：先用舊的畫法 -->\n';
  }
}


// ───────────────────────── 劇本資料檔 ─────────────────────────
// 每一話可以有一個「劇本資料檔」（例如 S_ch04_hongmen_data.gs），內容固定是：
//   var SCENARIO_DATA = SCENARIO_DATA || {};
//   SCENARIO_DATA['S_ch04_hongmen'] = { version, status, anchors: [...], codex: [...] };
// status：ready 在首頁開放｜planned 製作中（只有直接開網址才看得到）｜sample 範例（不出現在首頁與後臺）
// 圖鑑：ready 的劇本到處都看得到；planned、sample 只在自己的劇本頁與結算頁出現。
// 這樣新增劇本只要「新增兩個檔」，不必修改共用的資料檔。

/** 目前正在產生的頁面檔名，以及這一頁屬於哪一話（劇本頁本身，或結算頁網址的 s=） */
var CURRENT_PAGE_ = '';
var CURRENT_SCENARIO_ = '';

/** 全部劇本資料檔登記的內容（沒有任何資料檔時是空物件） */
function scenarioRegistry_() {
  const reg = typeof SCENARIO_DATA !== 'undefined' && SCENARIO_DATA && typeof SCENARIO_DATA === 'object' ? SCENARIO_DATA : {};
  const out = {};
  Object.keys(reg).forEach(id => {
    if (SCENARIO_PAGE_PATTERN.test(id) && reg[id] && typeof reg[id] === 'object') out[id] = reg[id];
  });
  return out;
}

/** 接在 Data_catalog／Data_codex 後面的資料：開放狀態、圖鑑項目 */
function scenarioDataScript_(fileName) {
  const reg = scenarioRegistry_();
  const ids = Object.keys(reg);
  if (!ids.length) return '';
  if (fileName === 'Data_catalog') {
    const patch = {};
    const extra = [];
    ids.forEach(id => {
      const status = String(reg[id].status || '');
      if (status === 'ready' || status === 'planned') patch[id] = { status: status };
      // 範例劇本不在目錄裡：只在它自己的頁面與它的結算頁補上目錄資料
      const m = reg[id].meta;
      if (status === 'sample' && CURRENT_SCENARIO_ === id && m && typeof m === 'object') {
        extra.push({
          id: id, vol: id.slice(2, 4), ep: Number(id.slice(4, 6)) || 0, name: String(m.name || id), episode: String(m.episode || ''),
          year: Number(m.year) || 0, genre: String(m.genre || ''), source: String(m.source || ''), guest: false, status: 'sample'
        });
      }
    });
    return '\n<script>/* 劇本資料檔：開放狀態 */(function (ZH, p, add) { (ZH.CATALOG || []).forEach(function (s) { if (p[s.id]) s.status = p[s.id].status; }); add.forEach(function (s) { if (!ZH.findScenario(s.id)) ZH.CATALOG.push(s); }); })(window.ZH, ' + safeJson_(patch) + ', ' + safeJson_(extra) + ');</script>\n';
  }
  const items = [];
  ids.forEach(id => {
    const status = String(reg[id].status || '');
    const show = status === 'ready' || CURRENT_SCENARIO_ === id;
    if (!show || !Array.isArray(reg[id].codex)) return;
    reg[id].codex.forEach(c => {
      if (!c || !c.type || !c.id || !c.name) return;
      items.push({
        type: String(c.type), id: String(c.id), scenarioId: id,
        name: String(c.name), glyph: String(c.glyph || String(c.name).slice(0, 1)), title: String(c.title || ''),
        quote: String(c.quote || ''), text: String(c.text || ''), source: String(c.source || '')
      });
    });
  });
  if (!items.length) return '';
  return '\n<script>/* 劇本資料檔：圖鑑 */(function (ZH, a) { a.forEach(function (it) { var i = (ZH.CODEX || []).findIndex(function (x) { return x.type === it.type && x.id === it.id; }); if (i > -1) ZH.CODEX[i] = it; else ZH.CODEX.push(it); }); })(window.ZH, ' + safeJson_(items) + ');</script>\n';
}

/** 目前部署的網址 */
function getAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (err) {
    return '';
  }
}


// ───────────────────────── 試算表工具 ─────────────────────────

/** 取得資料試算表：優先用綁定的試算表，否則用屬性中記錄的 ID */
function getSS_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const id = PropertiesService.getScriptProperties().getProperty(PROP_SS_ID);
  if (!id) {
    throw new Error('找不到資料試算表。請從試算表的「擴充功能 > Apps Script」建立專案，再執行 setupSheets()。');
  }
  return SpreadsheetApp.openById(id);
}

/** 取得指定工作表，不存在時提示先執行 setupSheets() */
function getSheet_(name) {
  const sheet = getSS_().getSheetByName(name);
  if (!sheet) throw new Error('找不到工作表「' + name + '」，請先執行 setupSheets()。');
  return sheet;
}

/** 台北時間的時間字串 */
function nowStr_() {
  return Utilities.formatDate(new Date(), APP_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

/** 在某一欄（第 2 列以後）找完全相同的值，回傳列號；找不到回傳 0 */
function findRowByValue_(sheet, col, value) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2 || value === '' || value === null || value === undefined) return 0;
  const cell = sheet.getRange(2, col, lastRow - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .matchCase(false)
    .findNext();
  return cell ? cell.getRow() : 0;
}

/** 讀取 Config 工作表（快取 5 分鐘），回傳 { key: value } */
function getConfig_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('config_v1');
  if (cached) return JSON.parse(cached);

  const config = {};
  CONFIG_DEFAULTS.forEach(row => { config[row[0]] = row[1]; });
  try {
    const sheet = getSheet_('Config');
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      sheet.getRange(2, 1, lastRow - 1, 2).getValues().forEach(row => {
        const key = String(row[0]).trim();
        if (key) config[key] = row[1];
      });
    }
  } catch (err) {
    // 尚未初始化時沿用預設值
  }
  cache.put('config_v1', JSON.stringify(config), 300);
  return config;
}

/** HTML 跳脫 */
function esc_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// ───────────────────────── 一次性設定函式 ─────────────────────────

/**
 * 【手動執行】建立或補齊所有工作表、欄位與預設設定。
 * 可以重複執行：已存在的工作表與資料不會被覆蓋。
 */
function setupSheets() {
  const ss = getSS_();
  PropertiesService.getScriptProperties().setProperty(PROP_SS_ID, ss.getId());

  const report = [];
  Object.keys(SHEETS).forEach(name => {
    const headers = SHEETS[name];
    let sheet = ss.getSheetByName(name);
    let created = false;
    if (!sheet) {
      sheet = ss.insertSheet(name);
      created = true;
    }

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    const current = headerRange.getValues()[0];
    const isEmpty = current.every(v => v === '');
    if (isEmpty) {
      headerRange.setValues([headers]);
    } else if (current.join('|') !== headers.join('|')) {
      report.push('⚠ ' + name + '：第一列欄位和程式不同，未覆蓋，請手動確認。');
    }

    headerRange
      .setFontWeight('bold')
      .setBackground('#1f2a24')
      .setFontColor('#f3efe4');
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1).setNote(SHEET_NOTES[name] || '');
    report.push((created ? '新增 ' : '已存在 ') + name);
  });

  // 班級座號維持文字格式，避免開頭的 0 消失
  ss.getSheetByName('Users').getRange('C:C').setNumberFormat('@');

  // Config 預設值：補上還沒有的設定項，已存在的不覆蓋
  const config = ss.getSheetByName('Config');
  const lastRow = config.getLastRow();
  const existingKeys = lastRow >= 2
    ? config.getRange(2, 1, lastRow - 1, 1).getValues().map(r => String(r[0]).trim())
    : [];
  const missingRows = CONFIG_DEFAULTS.filter(row => existingKeys.indexOf(row[0]) === -1);
  if (missingRows.length) {
    config.getRange(Math.max(lastRow, 1) + 1, 1, missingRows.length, 3).setValues(missingRows);
    report.push('Config 補上 ' + missingRows.length + ' 個設定項：' + missingRows.map(r => r[0]).join('、'));
  }

  // 刪除新試算表預設的空白工作表
  ['工作表1', 'Sheet1'].forEach(n => {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) {
      ss.deleteSheet(s);
      report.push('已刪除空白的「' + n + '」');
    }
  });

  CacheService.getScriptCache().remove('config_v1');
  const text = report.join('\n');
  Logger.log('setupSheets 完成：\n' + text);
  return text;
}

/** 【手動執行】在執行紀錄中列出目前的設定狀態 */
function showSetupStatus() {
  Logger.log(JSON.stringify(getSetupStatus_(), null, 2));
}


// ───────────────────────── 試算表自訂選單 ─────────────────────────

/** 開啟試算表時自動在上方加入「縱橫鼎業」選單 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('縱橫鼎業')
    .addItem('一鍵建立／補齊所有工作表', 'menuSetupSheets')
    .addItem('檢查系統設定狀態', 'menuShowStatus')
    .addItem('安裝／更新 AI 圖片素材', 'menuSetupImageAssets_')
    .addSeparator()
    .addItem('查看遊戲網址', 'menuShowAppUrl')
    .addToUi();
}

/** 選單：一鍵建立或補齊所有工作表、欄位與預設設定 */
function menuSetupSheets() {
  const ui = SpreadsheetApp.getUi();
  try {
    const report = setupSheets();
    ui.alert('工作表已建立／補齊', report || '全部工作表都已就緒。', ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('建立失敗', err.message, ui.ButtonSet.OK);
  }
}

/** 選單：以對話框顯示目前的設定狀態 */
function menuShowStatus() {
  const ui = SpreadsheetApp.getUi();
  const s = getSetupStatus_();
  const lines = [
    '程式版本：' + s.version,
    '工作表：' + (s.sheets.ok ? '齊全（' + Object.keys(SHEETS).length + ' 張）' : '缺少 ' + s.sheets.missing.join('、') + '，請點「一鍵建立／補齊所有工作表」'),
    '教師密碼：' + (s.teacherPassword ? '已設定' : '尚未設定，請在 Apps Script 執行 setupTeacherPassword'),
    '教師白名單：' + (s.teacherWhitelistCount ? s.teacherWhitelistCount + ' 個帳號' : '尚未設定'),
    '素材資料夾：' + (s.assetFolder ? '已設定' : '尚未設定（之後的步驟會處理）'),
    'AI 圖片素材：' + (s.imageAssets ? '已安裝' : '尚未安裝，請點「安裝／更新 AI 圖片素材」'),
    '遊戲網址：' + (s.appUrl || '尚未部署')
  ];
  ui.alert('縱橫鼎業｜系統設定狀態', lines.join('\n'), ui.ButtonSet.OK);
}

/** 選單：顯示可點擊的遊戲網址與連線測試網址 */
function menuShowAppUrl() {
  const url = getAppUrl_();
  const html = url
    ? '<div style="font-family:sans-serif;line-height:1.8">' +
      '<p>遊戲網址：<br><a href="' + esc_(url) + '" target="_blank">' + esc_(url) + '</a></p>' +
      '<p>連線測試：<br><a href="' + esc_(url + '?page=diag') + '" target="_blank">' + esc_(url + '?page=diag') + '</a></p></div>'
    : '<p style="font-family:sans-serif">還沒部署。請到 Apps Script 點「部署 > 新增部署作業」。</p>';
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(520).setHeight(200),
    '縱橫鼎業｜遊戲網址'
  );
}

/** 目前的設定狀態（連線測試頁與 showSetupStatus 共用） */
function getSetupStatus_() {
  const props = PropertiesService.getScriptProperties();
  const sheetInfo = { ok: false, name: '', missing: Object.keys(SHEETS), error: '' };
  try {
    const ss = getSS_();
    const missing = Object.keys(SHEETS).filter(n => !ss.getSheetByName(n));
    sheetInfo.ok = missing.length === 0;
    sheetInfo.name = ss.getName();
    sheetInfo.missing = missing;
  } catch (err) {
    sheetInfo.error = err.message;
  }
  const whitelist = (props.getProperty(PROP_TEACHERS) || '').split(',').filter(s => s.trim());
  return {
    version: APP_VERSION,
    sheets: sheetInfo,
    teacherPassword: !!(props.getProperty(PROP_PWD_HASH) && props.getProperty(PROP_PWD_SALT)),
    teacherWhitelistCount: whitelist.length,
    assetFolder: !!props.getProperty(PROP_ASSET_FOLDER),
    githubFrontend: typeof githubEnabled_ === 'function' && githubEnabled_(),
    imageAssets: !!(props.getProperty('IMAGE_ASSET_REVISION') && props.getProperty('IMAGE_ASSET_FOLDER_ID')),
    imageLoader: hasImageLoaderFile_(),
    appUrl: getAppUrl_()
  };
}


/** 檢查圖片載入器是否已建立；不讀 Drive 圖片、不修改設定。 */
function hasImageLoaderFile_() {
  try {
    const source = HtmlService.createHtmlOutputFromFile('Asset_js').getContent();
    return /installArt/.test(source) && /data-ai-asset/.test(source);
  } catch (err) { return false; }
}

// ───────────────────────── 連線測試頁 ─────────────────────────

/** 不依賴任何 HTML 檔的連線測試頁：顯示帳號偵測結果與系統設定狀態 */
function buildDiagPage_(note) {
  const user = getCurrentUser_();
  const status = getSetupStatus_();
  const loginUrl = getLoginUrl_();
  const appUrl = status.appUrl;

  let identity;
  let identityState;
  if (user.isTeacher) {
    identity = '教師（白名單內的學校帳號）';
    identityState = 'ok';
  } else if (user.isSchool) {
    identity = '學校帳號：遊戲紀錄會寫入試算表';
    identityState = 'ok';
  } else if (user.rawEmail) {
    identity = '非學校帳號：可以遊玩，但不寫入紀錄';
    identityState = 'warn';
  } else {
    identity = '訪客：可以遊玩，但不寫入紀錄';
    identityState = 'warn';
  }

  const sheetText = status.sheets.ok
    ? '已連線：' + status.sheets.name
    : (status.sheets.error || '缺少工作表：' + status.sheets.missing.join('、') + '（請執行 setupSheets）');

  const rows = [
    ['偵測到的帳號', user.rawEmail || '（未偵測到 Google 帳號）', user.rawEmail ? 'ok' : 'warn'],
    ['身分判定', identity, identityState],
    ['資料試算表', sheetText, status.sheets.ok ? 'ok' : 'bad'],
    ['教師密碼', status.teacherPassword ? '已設定' : '尚未設定（請執行 setupTeacherPassword）', status.teacherPassword ? 'ok' : 'bad'],
    ['教師白名單', status.teacherWhitelistCount ? status.teacherWhitelistCount + ' 個帳號' : '尚未設定（只憑密碼即可進後臺）', status.teacherWhitelistCount ? 'ok' : 'warn'],
    ['畫面與素材來源', status.githubFrontend ? 'GitHub；學生紀錄仍由 Google 試算表保存' : '原本 GAS 畫面與素材', 'ok'],
    ['AI 圖片索引', status.githubFrontend ? 'GitHub 直接載入，可執行 checkGitHubFrontend_ 檢查' : status.imageAssets ? '已設定（圖片實際讀取請執行 checkAIBackgroundSetup）' : '尚未設定，請執行 installAIBackgroundAssets 或選單的「安裝／更新 AI 圖片素材」', status.githubFrontend || status.imageAssets ? 'ok' : 'bad'],
    ['AI 圖片載入器', status.imageLoader ? 'Asset_js 檔案已建立' : '缺少 Asset_js，或檔案不是支援 AI 背景的版本', status.imageLoader ? 'ok' : 'bad'],
    ['程式版本', APP_VERSION, 'ok']
  ];

  const rowHtml = rows.map(r =>
    '<div class="row ' + r[2] + '"><span class="k">' + esc_(r[0]) + '</span><span class="v">' + esc_(r[1]) + '</span></div>'
  ).join('');

  const noteHtml = note ? '<p class="note">' + esc_(note) + '</p>' : '';

  const guestHelp = user.isSchool ? '' :
    '<div class="help"><p>想留下遊戲紀錄，請用學校帳號（@gm 或 @stdmail）登入。</p>' +
    '<a class="btn" href="' + esc_(loginUrl) + '" target="_top">登入學校帳號</a>' +
    '<p class="small">已經用學校帳號登入卻仍顯示訪客：通常是瀏覽器同時登入了好幾個 Google 帳號。請改用無痕視窗，只登入學校帳號後再開一次。</p></div>';

  const body =
    noteHtml +
    '<div class="card">' + rowHtml + '</div>' +
    guestHelp +
    '<p class="foot">' + (appUrl ? '<a href="' + esc_(appUrl + '?page=diag') + '" target="_top">重新整理測試</a>　' : '') +
    '測試時間：' + esc_(nowStr_()) + '</p>';

  return finalizeOutput_(HtmlService.createHtmlOutput(pageShell_('連線測試', body)));
}

/** 訪客進入未開放劇本時的提示頁：說明可玩的四關，並提供登入按鈕 */
function buildLockedPage_() {
  const appUrl = getAppUrl_();
  const loginUrl = getLoginUrl_();
  const guestList = getGuestScenarios_().length
    ? '<p>沒有登入也可以完整遊玩以下四關（不會留下紀錄）：</p><ul>' +
      GUEST_SCENARIO_TITLES.map(t => '<li>' + esc_(t) + '</li>').join('') + '</ul>'
    : '<p>目前遊戲只開放學校帳號登入遊玩。</p>';

  const body =
    '<div class="card pad">' +
    '<h2>這一關要先登入學校帳號</h2>' +
    '<p>請用學校發的 Google 帳號（@gm 或 @stdmail）登入，登入後就能解鎖全部劇本，並把進度與成績存起來。</p>' +
    '<a class="btn" href="' + esc_(loginUrl) + '" target="_top">登入學校帳號</a>' +
    guestList +
    (appUrl ? '<p><a class="link" href="' + esc_(appUrl) + '" target="_top">回到首頁</a></p>' : '') +
    '</div>' +
    '<p class="small">已經登入學校帳號卻還是看到這一頁：通常是瀏覽器同時登入了好幾個 Google 帳號。請改用無痕視窗，只登入學校帳號後再開一次。</p>';

  return finalizeOutput_(HtmlService.createHtmlOutput(pageShell_('需要登入', body)));
}

/** 連線測試頁與提示頁共用的外框與樣式 */
function pageShell_(tag, bodyHtml) {
  return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">' +
    '<style>' +
    ':root{--paper:#f3efe4;--ink:#1f2a24;--muted:#6b6f63;--line:#d8d0bd;--ok:#2f7a5b;--warn:#b07a1c;--bad:#b13a25}' +
    '*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;line-height:1.6}' +
    '.wrap{max-width:640px;margin:0 auto;padding:28px 18px 40px}' +
    'h1{font-family:"Noto Serif TC","PMingLiU",serif;font-size:28px;margin:0;letter-spacing:.04em}' +
    'h2{font-family:"Noto Serif TC","PMingLiU",serif;font-size:20px;margin:0 0 8px}' +
    '.sub{margin:4px 0 2px;color:var(--muted);font-size:14px}.tag{display:inline-block;margin-top:10px;padding:3px 10px;border:1px solid var(--ink);border-radius:999px;font-size:13px}' +
    '.card{margin-top:20px;border:1px solid var(--line);border-radius:12px;background:#fbf8f0;overflow:hidden}.card.pad{padding:18px 18px 8px}' +
    '.card ul{margin:6px 0 12px;padding-left:1.3em}' +
    '.row{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);border-left:4px solid var(--line)}.row:last-child{border-bottom:0}' +
    '.row.ok{border-left-color:var(--ok)}.row.warn{border-left-color:var(--warn)}.row.bad{border-left-color:var(--bad)}' +
    '.k{flex:0 0 7.5em;color:var(--muted);font-size:14px}.v{flex:1;min-width:0;overflow-wrap:anywhere;font-size:15px}' +
    '.note{margin-top:16px;padding:10px 14px;border-radius:8px;background:#efe6cf;font-size:14px}' +
    '.help{margin-top:18px}.btn{display:inline-block;margin:6px 0 10px;padding:10px 18px;border-radius:8px;background:var(--ink);color:var(--paper);text-decoration:none;font-weight:700}' +
    '.link{color:var(--ink)}.small{font-size:13px;color:var(--muted)}.foot{margin-top:22px;font-size:13px;color:var(--muted)}.foot a{color:var(--ink)}' +
    '</style></head><body><div class="wrap">' +
    '<h1>' + esc_(APP_NAME) + '</h1>' +
    '<p class="sub">' + esc_(APP_SUBTITLE) + '</p>' +
    '<span class="tag">' + esc_(tag) + '</span>' +
    bodyHtml +
    '</div></body></html>';
}

/** 逐話只傳當話任務資料，降低下載量；原始登錄仍完整供安裝檢查與離線總覽使用。 */
function textplayDataScript_() {
  if (INCLUDED_['Textplay_data']) return '';
  INCLUDED_['Textplay_data'] = true;
  const raw = HtmlService.createHtmlOutputFromFile('Textplay_data').getContent();
  const match = raw.match(/window\.ZH_TEXTPLAY=([\s\S]*?);<\/script>/);
  if (!match) throw new Error('Textplay_data 格式不完整，請完整更新文本玩法檔案。');
  const data = JSON.parse(match[1]);
  const sid = CURRENT_SCENARIO_ || CURRENT_PAGE_;
  if (!data.chapters[sid]) return raw;
  const activities = {};
  Object.keys(data.activities).forEach(id => { if (data.activities[id].scenarioId === sid) activities[id] = data.activities[id]; });
  const scoped = { version: data.version, chapters: {}, activities: activities, dialoguePatches: {} };
  scoped.chapters[sid] = data.chapters[sid];
  if (data.dialoguePatches && data.dialoguePatches[sid]) scoped.dialoguePatches[sid] = data.dialoguePatches[sid];
  return '<script>window.ZH_TEXTPLAY=' + safeJson_(scoped) + ';</script>';
}

/** 未同步文本模組時，回復既有 GAS 畫面仍可正常載入。 */
function textplayIncludesIfInstalled_() {
  try {
    ['Textplay_data','Textplay_models','Textplay_canvas','Textplay_css','Textplay_js'].forEach(n => HtmlService.createHtmlOutputFromFile(n));
    return textplayDataScript_() + includeOnce_('Textplay_models') + includeOnce_('Textplay_canvas') + includeOnce_('Textplay_css') + includeOnce_('Textplay_js');
  } catch (err) { return ''; }
}
