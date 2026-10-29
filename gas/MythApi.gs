/** 神話冒險獨立帳本。沿用 paUser_ 與原試算表，不寫原課程成績。 */
var MYTH_HEADERS_=['email','stateJson','updatedAt'];
function mythRead_(email){
 var rows=pfRows_('MythProfiles',MYTH_HEADERS_),index=rows.findIndex(function(r){return paEmail_(r[0])===email;});
 var raw=index<0?null:pfJson_(rows[index][1],null);
 if(index>=0&&!raw)throw Error('冒險存檔內容無法讀取，已停止寫入，請回報問題。');
 return {row:index<0?0:index+2,state:MYTH_RULES_.normalize(raw)};
}
function api_mythGet(){
 try {var user=paUser_();return {ok:true,state:MYTH_RULES_.publicState(mythRead_(user.email).state)};}
 catch(e){return {ok:false,msg:e.message};}
}
function api_mythApply(input){
 try{
  var user=paUser_();
  if(!input||typeof input!=='object'||Array.isArray(input)||JSON.stringify(input).length>12000)throw Error('冒險請求資料不正確。');
  return paLock_(function(){
   var saved=mythRead_(user.email),out=MYTH_RULES_.apply(saved.state,input,{now:Date.now(),id:'myth_'+Utilities.getUuid().replace(/-/g,''),seed:Math.floor(Math.random()*2147483646)+1,random:Math.random});
   if(!out.replayed){
    var sh=pfSheet_('MythProfiles',MYTH_HEADERS_),row=saved.row||sh.getLastRow()+1;
    // The receipt and all balances commit in one canonical JSON cell; retries read it first.
    sh.getRange(row,1,1,3).setNumberFormat('@').setValues([[user.email,JSON.stringify(out.state),nowStr_()]]);
   }
   return {ok:true,state:MYTH_RULES_.publicState(out.state),gained:out.gained||[],notice:out.notice,replayed:out.replayed};
  });
 }catch(e){return {ok:false,msg:e.message};}
}
