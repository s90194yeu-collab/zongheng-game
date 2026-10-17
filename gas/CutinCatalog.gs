/** 名場面收藏 v0.9.2：讀取原始清單，不經 HtmlOutput 的 HTML 轉換。 */
function cutinCodexItems_() {
  const raw = HtmlService.createTemplateFromFile('Data_cutin').getRawContent();
  const match = raw.match(/CUTIN_MANIFEST_START \*\/([\s\S]*?)\/\* CUTIN_MANIFEST_END/);
  if (!match) throw new Error('名場面清單格式不正確。');
  const data = JSON.parse(match[1]);
  if (!Array.isArray(data.entries) || data.entries.length > 300) throw new Error('名場面清單數量不正確。');
  const seen = new Set();
  return data.entries.filter(e => {
    if (!e || !e.collectible || e.enabled === false || !/^[a-z0-9_]+$/.test(e.id || '') || !SCENARIO_PAGE_PATTERN.test(e.scenarioId || '') || e.asset !== 'cutin:' + e.id || seen.has(e.id)) return false;
    seen.add(e.id); return true;
  }).map(e => ({type:'text', id:'cutin_' + e.id, kind:'cutin', cueId:e.id, scenarioId:e.scenarioId,
    name:String(e.title || ''), title:String(e.chapterName || '') + '・名場面', glyph:'畫', text:String(e.caption || ''),
    source:String(e.sourceRef || '篇章原典與劇情'), assetId:e.asset}));
}

/** 教師在編輯器執行的唯讀檢查；只回報清單數量，不讀取學生紀錄。 */
function checkCutinCatalogSetup() {
  githubRequireSetupUser_();
  const raw = HtmlService.createTemplateFromFile('Data_cutin').getRawContent();
  const output = HtmlService.createHtmlOutputFromFile('Data_cutin').getContent();
  const pattern = /CUTIN_MANIFEST_START \*\/([\s\S]*?)\/\* CUTIN_MANIFEST_END/;
  const result = { ok:true, rawHasManifest:pattern.test(raw), htmlOutputHasManifest:pattern.test(output), collectibleCount:cutinCodexItems_().length };
  Logger.log(JSON.stringify(result));
  return result;
}
