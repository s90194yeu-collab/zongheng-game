/** 原創角色試點。每帳號一角；配點／獨立冒險表，不寫原篇首答或成績。 */
var OC_PROFILE_HEADERS_=['email','configJson','journalJson','revision','updatedAt'];
var OC_RUN_HEADERS_=['email','scenarioId','runId','stateJson','revision','updatedAt'];
// google.script.run 不保證物件欄位順序；比較值而非傳輸後的插入順序。
function ocComparable_(o){if(Array.isArray(o))return o.map(ocComparable_);if(o&&typeof o==='object'){const out={};Object.keys(o).sort().forEach(k=>out[k]=ocComparable_(o[k]));return out;}return o;}
function ocSame_(a,b){return JSON.stringify(ocComparable_(a))===JSON.stringify(ocComparable_(b));}
function ocProfile_(email){
 const rows=pfRows_('OriginalCharacters',OC_PROFILE_HEADERS_),i=rows.findIndex(r=>paEmail_(r[0])===email),r=rows[i];
 if(!r)return {config:OC_RULES_.defaults(),journal:[],row:0};
 const c=OC_RULES_.config(pfJson_(r[1],null));if(c.revision!==Number(r[3]))throw Error('角色資料版本不一致。');
 return {config:c,journal:pfJson_(r[2],[]).filter(j=>OC_RULES_.PILOTS.some(p=>p.id===j.id)),row:i+2};
}
function ocPublic_(p){return {config:p.config,journal:p.journal};}
function ocWriteProfile_(email,p){const sh=pfSheet_('OriginalCharacters',OC_PROFILE_HEADERS_);p.row=p.row||sh.getLastRow()+1;sh.getRange(p.row,1,1,OC_PROFILE_HEADERS_.length).setNumberFormat('@').setValues([[email,JSON.stringify(p.config),JSON.stringify(p.journal),p.config.revision,nowStr_()]]);}
function ocRun_(email,sid){const rows=pfRows_('CharacterAdventures',OC_RUN_HEADERS_),i=rows.findIndex(r=>paEmail_(r[0])===email&&r[1]===sid);if(i<0)return null;const r=rows[i];return {row:i+2,runId:String(r[2]),revision:Number(r[4]),world:OC_RULES_.restore(pfJson_(r[3],null))};}
function ocRunPublic_(r){return r?{runId:r.runId,revision:r.revision,world:r.world}:null;}
function ocWriteRun_(email,r){const sh=pfSheet_('CharacterAdventures',OC_RUN_HEADERS_);r.row=r.row||sh.getLastRow()+1;sh.getRange(r.row,1,1,OC_RUN_HEADERS_.length).setNumberFormat('@').setValues([[email,r.world.id,r.runId,JSON.stringify(r.world),r.revision,nowStr_()]]);}
function api_getOriginalCharacter(){try{const u=paUser_();return {ok:true,character:ocPublic_(ocProfile_(u.email))};}catch(e){return {ok:false,msg:e.message};}}
function api_saveOriginalCharacter(input){try{const u=paUser_(),c=OC_RULES_.config(input);return paLock_(()=>{const p=ocProfile_(u.email);if(c.revision!==p.config.revision)throw Error('角色已在另一分頁更新，請重新讀取後再配點。');c.revision++;p.config=c;ocWriteProfile_(u.email,p);return {ok:true,character:ocPublic_(p)};});}catch(e){return {ok:false,msg:e.message};}}
function api_getCharacterAdventure(sid){try{const u=paUser_();OC_RULES_.pilot(sid);return {ok:true,run:ocRunPublic_(ocRun_(u.email,sid))};}catch(e){return {ok:false,msg:e.message};}}
// 一次讀取本人所選篇章，避免開設定時同時送出多次試算表請求。
function api_getCharacterAdventures(ids){try{
 const u=paUser_();if(!Array.isArray(ids)||ids.length>OC_RULES_.PILOTS.length||new Set(ids).size!==ids.length)throw Error('角色篇章清單不正確。');ids.forEach(id=>OC_RULES_.pilot(id));
 const runs={};ids.forEach(id=>runs[id]=null);
 pfRows_('CharacterAdventures',OC_RUN_HEADERS_).forEach(r=>{if(paEmail_(r[0])!==u.email||!Object.prototype.hasOwnProperty.call(runs,r[1])||runs[r[1]])return;runs[r[1]]={runId:String(r[2]),revision:Number(r[4]),world:OC_RULES_.restore(pfJson_(r[3],null))};});
 return {ok:true,runs};
}catch(e){return {ok:false,msg:e.message};}}
function api_startCharacterAdventure(sid,options){try{const u=paUser_();OC_RULES_.pilot(sid);const o=options||{};if(typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!['chapter','route'].includes(k))||(o.chapter!==undefined&&typeof o.chapter!=='boolean'))throw Error('角色章內模式設定不正確。');return paLock_(()=>{const p=ocProfile_(u.email),base=pfPublic_(pfRead_(u.email)),identity={nickname:base.nickname,avatarId:base.avatarId,appearance:base.appearance||null},old=ocRun_(u.email,sid),seed=Math.floor(Math.random()*99991)+1,r={row:old&&old.row||0,runId:'oc_'+Utilities.getUuid().replace(/-/g,''),revision:0,world:o.chapter?OC_RULES_.createChapter(sid,p.config,identity,seed,{route:o.route}):OC_RULES_.create(sid,p.config,identity,seed)};ocWriteRun_(u.email,r);return {ok:true,run:ocRunPublic_(r)};});}catch(e){return {ok:false,msg:e.message};}}
function api_saveCharacterAdventure(input){try{
 const u=paUser_(),o=input||{};if(!o.world||typeof o.world!=='object')throw Error('冒險資料不完整。');OC_RULES_.pilot(o.world.id);
 return paLock_(()=>{const r=ocRun_(u.email,o.world.id);if(!r||r.runId!==o.runId)throw Error('這份冒險已被新局取代，請重新讀取。');if(r.revision!==o.revision)throw Error('冒險已在另一分頁更新，請重新讀取。');
  const before=r.world,incoming=o.world;if(!ocSame_(OC_RULES_.config(incoming.snapshot?.config),OC_RULES_.config(before.snapshot.config)))throw Error('續玩不能變更開局配點與能力。');
  if(!!before.chapter!==!!incoming.chapter)throw Error('續玩不能切換角色章內模式。');
  const common=['status','time','uses','cooldowns','buffs','notice','errors','trace'].concat(before.chapter?['chapter']:[]),fields=['chuhan','warring','spring','zhuzi'].includes(before.kind)?['campaign']:before.kind==='action'?['x','y','target','grip','exposure','delivered','pins']:before.kind==='strategy'?['day','people','selected','orders','results','plannedDay']:['page','draft','seen','probe','selected','reason','finished'];
  const merged=JSON.parse(JSON.stringify(before));common.concat(fields).forEach(k=>{if(Object.prototype.hasOwnProperty.call(incoming,k))merged[k]=incoming[k];});merged.notice=String(merged.notice||'').slice(0,300);const next=OC_RULES_.restore(merged);
  if(next.time<before.time||Object.entries(before.uses||{}).some(([k,n])=>(next.uses[k]||0)<n))throw Error('續玩時間或能力次數不能倒退。');
  if(before.chapter)OC_RULES_.chapterProgress(before,next);
  if(before.status!=='playing'&&!ocSame_(next,before))throw Error('本局已結束；請開新局再挑戰。');
  r.world=next;r.revision++;const p=ocProfile_(u.email);if(next.status==='won'){p.journal=OC_RULES_.mergeJournal(p.journal,next,nowStr_());ocWriteProfile_(u.email,p);}
  ocWriteRun_(u.email,r);return {ok:true,revision:r.revision,journal:p.journal};
 });
}catch(e){return {ok:false,msg:e.message};}}
