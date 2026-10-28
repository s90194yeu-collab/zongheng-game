/**
 * 縱橫鼎業 v4：GitHub 供應畫面、圖片與配樂；Google 繼續登入並保存所有學生紀錄。
 * 不改試算表分享，不搬移資料，不接受用戶端提供遠端網址。
 * 安裝：GitHub Pages 發布成功後，在編輯器執行 installGitHubFrontend。
 * 現有網頁已部署橋接核心時，啟用設定立即生效，不需要再次部署。
 */
const GH_SITE_DEFAULT_ = 'https://s90194yeu-collab.github.io/zongheng-game/';
const GH_RELEASE_DEFAULT_ = 'v4-9c2651dfe99729';
// 本次已授權並完整核對的前端發布：既有正式站只遷移一次，後續仍可手動回復舊版。
const GH_VILLAGE_ROLLOUT_ = 'village-4.18.0';
const GH_VILLAGE_PREVIOUS_ = ['v4-ba33d827d69573','v4-09e4affc72dda0','v4-bd52dc10ef27fb','v4-93fc8e00808d34'];

/** 手動執行入口：只允許目前的部署教師操作，不能由訪客或學生切換全站設定。 */
function githubRequireSetupUser_() {
  const user = getCurrentUser_();
  const effectiveEmail = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  if (!user.isTeacher || !user.email || user.email !== effectiveEmail) {
    throw new Error('請使用原部署教師帳號，在 Apps Script 編輯器執行此函式。');
  }
}

/** 【上方函式選單】啟用 GitHub 畫面與素材。 */
function installGitHubFrontend() {
  githubRequireSetupUser_();
  return installGitHubFrontend_();
}

/** 【上方函式選單】檢查 GitHub 接線狀態。 */
function checkGitHubFrontend() {
  githubRequireSetupUser_();
  return checkGitHubFrontend_();
}

/** 【上方函式選單】回復原本 GAS 畫面，學生紀錄保留。 */
function disableGitHubFrontend() {
  githubRequireSetupUser_();
  return disableGitHubFrontend_();
}

function githubSettings_() {
  const p = PropertiesService.getScriptProperties();
  const site = String(p.getProperty('GITHUB_SITE_URL') || GH_SITE_DEFAULT_).replace(/\/*$/, '/');
  let release = String(p.getProperty('GITHUB_RELEASE_ID') || GH_RELEASE_DEFAULT_);
  const enabled = p.getProperty('GITHUB_FRONTEND_ENABLED') === 'TRUE';
  if (!/^https:\/\/[a-z0-9-]+\.github\.io\/[a-z0-9_/-]*\/$/i.test(site) || !/^[a-zA-Z0-9._-]{1,80}$/.test(release)) throw new Error('GitHub 網址或版本設定不正確。');
  // 只從這次核准的既有版本升級；停用、其他站點或未知釘選一律不動。
  // 每次部署固定目標，不使用訪客參數，也不自動追蹤未來版本。
  if (enabled && site === GH_SITE_DEFAULT_ && p.getProperty('GITHUB_VILLAGE_ROLLOUT') !== GH_VILLAGE_ROLLOUT_ && GH_VILLAGE_PREVIOUS_.includes(release) && !GH_VILLAGE_PREVIOUS_.includes(GH_RELEASE_DEFAULT_)) {
    p.setProperties({ GITHUB_RELEASE_ID: GH_RELEASE_DEFAULT_, GITHUB_VILLAGE_ROLLOUT: GH_VILLAGE_ROLLOUT_ });
    release = GH_RELEASE_DEFAULT_;
  }
  return { site: site, release: release, enabled: enabled };
}
function githubEnabled_() { try { return githubSettings_().enabled; } catch (e) { return false; } }
function githubDigest_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}
function githubFetchText_(url, limit) {
  const r = UrlFetchApp.fetch(url, { followRedirects: false, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('GitHub 頁面尚未就緒（' + r.getResponseCode() + '）。');
  const content = r.getContentText('UTF-8');
  if (Utilities.newBlob(content).getBytes().length > limit) throw new Error('GitHub 檔案超出大小限制。');
  return content;
}
function githubManifest_(settings) {
  const cache = CacheService.getScriptCache(), key = 'gh4:manifest:' + settings.release;
  const saved = cache.get(key);
  const manifest = JSON.parse(saved || githubFetchText_(settings.site + 'releases/' + settings.release + '/manifest.json', 90000));
  if (manifest.release !== settings.release || ![40,52,63,75,83,90].includes(manifest.chapterCount) || !manifest.pages || !manifest.pages.Hub) throw new Error('GitHub 遊戲清單不完整。');
  const names = Object.keys(manifest.pages);
  if (names.length !== manifest.chapterCount + 6 || names.filter(n => /^S_(cq|zg|ch)\d{2}_[a-z0-9]+$/.test(n)).length !== 40 || names.filter(n => /^S_zz\d{2}_[a-z0-9]+$/.test(n)).length !== (manifest.chapterCount >= 52 ? 12 : 0) || names.filter(n => /^S_gw\d{2}_[a-z0-9]+$/.test(n)).length !== (manifest.chapterCount >= 63 ? 11 : 0) || names.filter(n => /^S_al\d{2}_[a-z0-9]+$/.test(n)).length !== (manifest.chapterCount === 90 ? 27 : manifest.chapterCount === 83 ? 20 : manifest.chapterCount === 75 ? 12 : 0) || ['Hub','Map','Result','Teacher','Profile','Gallery'].some(n => !manifest.pages[n])) throw new Error('GitHub 章節頁面數量不完整。');
  if (!saved) { try { cache.put(key, JSON.stringify(manifest), 21600); } catch (e) {} }
  return manifest;
}
function githubPageSource_(fileName, settings) {
  if (!/^(Hub|Map|Result|Teacher|Profile|Gallery|S_(cq|zg|ch|zz|gw|al)\d{2}_[a-z0-9]+)$/.test(fileName)) throw new Error('不支援的遊戲頁面。');
  const manifest = githubManifest_(settings), entry = manifest.pages[fileName];
  if (!entry || entry.file !== 'pages/' + fileName + '.html' || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('找不到遊戲畫面。');
  const cache = CacheService.getScriptCache(), key = 'gh4:page:' + settings.release + ':' + fileName;
  let source = cache.get(key);
  if (!source) {
    source = githubFetchText_(settings.site + 'releases/' + settings.release + '/' + entry.file, 500000);
    if (githubDigest_(source) !== entry.sha256 || source.split('<!--ZH_SERVER_BOOT-->').length !== 2) throw new Error('遊戲畫面內容驗證失敗。');
    if (Utilities.newBlob(source).getBytes().length < 90000) { try { cache.put(key, source, 21600); } catch (e) {} }
  }
  return source;
}
function buildGithubGamePage_(fileName, page, params, user) {
  const settings = githubSettings_();
  const source = githubPageSource_(fileName, settings);
  const boot = {
    appUrl: getAppUrl_(), page: page, params: params || {}, version: 'v4.0.0-google',
    assetBase: settings.site, assetRelease: settings.release,
    user: { email: user.email, isSchool: user.isSchool, isGuest: user.isGuest, isTeacher: user.isTeacher, loginUrl: getLoginUrl_() },
    guestScenarios: getGuestScenarios_()
  };
  // 快取的是沒有任何帳號或參數的共用空殼，每次回應才加入自己的身分。
  const html = source.replace('<!--ZH_SERVER_BOOT-->', '<script>window.ZH_BOOT=' + safeJson_(boot) + ';</script>');
  return finalizeOutput_(HtmlService.createHtmlOutput(html));
}
/** 編輯器手動執行：只讀取公開遊戲檔案，不讀寫學生資料。 */
function checkGitHubFrontend_() {
  const s = githubSettings_(), manifest = githubManifest_(s), source = githubPageSource_('Hub', s);
  const result = { ok: true, enabled: s.enabled, site: s.site, release: s.release, chapters: manifest.chapterCount, pages: Object.keys(manifest.pages).length, media: manifest.mediaCount, music: manifest.musicCount, sampleBytes: Utilities.newBlob(source).getBytes().length };
  Logger.log(JSON.stringify(result, null, 2)); return result;
}
/** 編輯器手動執行：先驗證全部頁面，全部通過才啟用；不修改試算表。 */
function installGitHubFrontend_() {
  const settings = githubSettings_();
  const latest = JSON.parse(githubFetchText_(settings.site + 'release.json', 4000));
  if (!/^v4-[a-f0-9]{14}$/.test(latest.release || '') || latest.manifest !== 'releases/' + latest.release + '/manifest.json') throw new Error('最新版本清單不正確。');
  settings.release = latest.release;
  const manifest = githubManifest_(settings);
  Object.keys(manifest.pages).forEach(name => githubPageSource_(name, settings));
  PropertiesService.getScriptProperties().setProperties({GITHUB_FRONTEND_ENABLED: 'TRUE', GITHUB_RELEASE_ID: settings.release});
  return checkGitHubFrontend_();
}
/** 編輯器手動執行：回到原本 GAS 畫面，學生資料原地保留。 */
function disableGitHubFrontend_() {
  PropertiesService.getScriptProperties().setProperty('GITHUB_FRONTEND_ENABLED', 'FALSE');
  Logger.log('已停用 GitHub 畫面，下次載入沿用原本 GAS HTML。');
}
