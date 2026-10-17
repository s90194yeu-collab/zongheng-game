// 僅由 localhost 預覽工具注入，不會發布到 GitHub Pages 或正式 GAS 畫面。
(function(){
 const calls=[];window.ZH_LOCAL_PREVIEW_CALLS=calls;
 async function call(name,args){
  calls.push({name,args});
  if(name==='api_getUser')return {ok:true,email:'',isSchool:false,isGuest:true,isTeacher:false,profile:null,loginUrl:''};
  if(name==='api_getAnchors'||name==='api_getStoryAnchors')return {ok:true,anchors:window.ZH_PREVIEW_ANCHORS[args[0]]||[],missing:[],source:'local-preview'};
  if(name==='api_getLearningReview')return {ok:true,anchors:window.ZH_PREVIEW_ANCHORS[args[0]]||[]};
  if(name==='api_listSaves')return {ok:true,saves:[]};
  if(name==='api_loadGame')return {ok:true,state:null};
  if(name==='api_getCodex')return {ok:true,items:[]};
  if(name==='api_gameBoard')return {ok:true,scoreScale:10,me:null,top:[],classScores:[],schoolScores:[]};
  throw Error('本機試玩不連線學生資料：'+name);
 }
 function runner(success,failure){return new Proxy({}, {get(target,key){
  if(key==='withSuccessHandler')return fn=>runner(fn,failure);
  if(key==='withFailureHandler')return fn=>runner(success,fn);
  return (...args)=>Promise.resolve().then(()=>call(key,args)).then(success,failure);
 }});}
 window.google={script:{run:runner(()=>{},()=>{})}};
 document.addEventListener('DOMContentLoaded',()=>{
  const banner=document.createElement('div');banner.textContent='本機完整試玩｜不登入、不寫入學校紀錄';banner.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2000;padding:6px 12px;background:#183844ec;color:#f5dfad;border:1px solid #c8a152;border-radius:8px;font:12px sans-serif;pointer-events:none';document.body.append(banner);
  window.ZH.login=()=>ZH.toast('本機試玩不提供學校登入，正式版沿用原 GAS 登入。');
 },{once:true});
})();
