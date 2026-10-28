/** 村莊的即時導覽；只描述本次逛展，不記作學習成績，也不讀寫雲端。 */
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const HALL_GUIDES=freeze({
 cq:{id:'cq',title:'春秋史館',intro:'從一座城的困境出發，看看使者、君主與盟友如何在列國之間作選擇。',question:'同一個提議，為何可能打動一國，卻讓另一國不安？',reason:'想從人物對話與局勢判斷開始，可以先逛春秋史館。',exhibits:{
  west:{title:'人物的立場',intro:'先認清誰在說話、對誰說話，再留意他想守住什麼。',question:'這個人最在意國家、盟約，還是眼前的危機？'},
  north:{title:'言辭的轉折',intro:'把勸說放回當時的局勢，觀察一段話如何改變對方的判斷。',question:'若拿掉其中一個理由，對方還會接受嗎？'},
  east:{title:'盟誓與後果',intro:'眼前的一次退讓或出兵，可能牽動之後的關係。',question:'這次選擇讓誰得利，又把風險留給了誰？'}}},
 zg:{id:'zg',title:'戰國史館',intro:'走進變法、遊說與門客的世界，從不同人的處境理解國家競逐。',question:'主張聽起來有道理，是否就適合眼前這個國家？',reason:'想比較策略、辨認論證與用人抉擇，可以從戰國史館挑一篇。',exhibits:{
  west:{title:'制度與變局',intro:'把新主張與既有習慣放在一起看，找出改革真正要改變的事。',question:'誰會支持改變，誰又可能付出代價？'},
  north:{title:'遊說的籌碼',intro:'留意說客如何選擇事例、安排利害，而不只記住結論。',question:'他的理由回應了對方哪一種擔憂？'},
  east:{title:'識人與用人',intro:'從門客、臣子與君主的互動，觀察能力如何被看見或忽略。',question:'眼前不起眼的人，可能在什麼情境派上用場？'}}},
 ch:{id:'ch',title:'楚漢史館',intro:'從軍營走到宴席，再回望勝敗之後的人生，觀察局勢如何壓向人物。',question:'當資訊不完整、時間又緊迫時，你會根據什麼判斷？',reason:'想體驗緊張的情節、辨認人物行動與席間訊號，楚漢史館很適合。',exhibits:{
  west:{title:'陣前的局勢',intro:'先看兵力、補給與接應，再理解人物為何冒險或等待。',question:'局勢中的哪個限制，讓選擇變得困難？'},
  north:{title:'席間的暗流',intro:'從座次、動作與對話，找出人物尚未說破的意圖。',question:'哪一個細節，讓你重新理解這場相會？'},
  east:{title:'勝敗的回聲',intro:'讓結果與先前的決定相互照看，別只用成敗評斷人物。',question:'如果只保留最後的輸贏，會漏掉什麼？'}}},
 zz:{id:'zz',title:'諸子學宮',intro:'先認識思想家的處境，再帶著問題閱讀他的主張，試著用情境檢驗理解。',question:'這位思想家想處理的問題，與你的生活有哪些相似之處？',reason:'第一次接觸先秦思想，可以先選人物篇，再進入同一人的思想篇。',exhibits:{
  west:{title:'遇見思想家',intro:'人物篇是入口：先看看一個人如何面對時代與自身的處境。',question:'他的經歷，讓你對主張產生了什麼疑問？'},
  north:{title:'讀懂一個主張',intro:'思想篇需要細讀關鍵概念，分清例子、理由與結論。',question:'你能用自己的話說明，而不只重述一句名言嗎？'},
  east:{title:'換個情境思辨',intro:'把同一問題交給不同觀點回應，觀察各自重視與忽略的部分。',question:'遇到新的情境，原本的主張需要補充哪些條件？'}}},
 gw:{id:'gw',title:'古文書院',intro:'從文章的場景與聲音走進去，看看敘事、寫景與議論如何一起推進。',question:'作者為何要用這樣的順序，讓你看見這件事？',reason:'想練習從段落線索理解文章、把原文與玩法相互對照，可以先逛古文書院。',exhibits:{
  west:{title:'文章如何開場',intro:'先觀察開頭交代的時間、地點與人物，看看閱讀期待如何形成。',question:'如果換一種開頭，這篇文章會少了什麼感覺？'},
  north:{title:'情景如何相接',intro:'沿著細節尋找轉折，分辨作者在描寫什麼，又在感受什麼。',question:'哪一個景物或動作，最能支持你的理解？'},
  east:{title:'觀點如何立住',intro:'把作者的判斷與所舉的理由連起來，看看結尾如何回應前文。',question:'這個結論有哪些文本依據，又有什麼值得追問？'}}},
 al:{id:'al',title:'選文雅集',intro:'在經典著作之間漫遊，從不同時代的人物、處境與聲音尋找值得追問的問題。',question:'不同篇章面對相似困境時，會給出相同答案嗎？',reason:'已經有喜歡的篇章，想再探索不同文體與人物，可以到選文雅集看看。',exhibits:{
  west:{title:'人物的處境',intro:'先走近人物身處的限制，再觀察他如何應對，而不急著貼上評價。',question:'哪一個處境，讓你對人物多了一層理解？'},
  north:{title:'篇章的聲音',intro:'留意敘述者如何挑選細節與語氣，同一事件也可能有不同說法。',question:'這個聲音希望你同情、懷疑，還是重新思考？'},
  east:{title:'跨篇的對話',intro:'選一個共同問題，讓兩篇文章互相回應；比較時仍要回到各自的文本。',question:'兩篇的差異出自觀點，還是面對的情境不同？'}}}
});

const HALL_IDS=Object.keys(HALL_GUIDES),EXHIBIT_IDS=['west','north','east'];
const validHall=id=>typeof id==='string'&&HALL_IDS.includes(id);
const unique=items=>[...new Set(Array.isArray(items)?items:[])];
/** index 是已完成的導覽步驟數（0至4），不表示課文或學習進度。 */
export function createGuideState(){return {stage:'welcome',muted:false,hallId:null,exhibitId:null,chapterId:null,visitedHall:[],viewedExhibits:[]};}
function copyState(state){const base=createGuideState(),s=state&&typeof state==='object'?state:base;return {...base,...s,visitedHall:unique(s.visitedHall).filter(validHall),viewedExhibits:unique(s.viewedExhibits)};}
/** payload 為 {hallId,exhibitId,chapterId}；館號亦可直接傳入字串。 */
export function advanceGuide(state,event,payload={}){
 const next=copyState(state),p=payload&&typeof payload==='object'?payload:{},candidate=typeof payload==='string'?payload:p.hallId||p.id;
 const hallId=validHall(candidate)?candidate:validHall(next.hallId)?next.hallId:null;
 if(event==='reset')return createGuideState();
 if(event==='skip'){next.muted=true;return next;}
 if(event==='reopen'){next.muted=false;return next;}
 if(event==='leave'){next.stage='welcome';next.hallId=null;next.exhibitId=null;next.chapterId=null;return next;}
 if(event==='start'){
  next.stage='walking';next.hallId=hallId;next.exhibitId=null;next.chapterId=null;return next;
 }
 if(event==='move'){
  if(['welcome','walking','arrived'].includes(next.stage))next.stage='walking';
  if(hallId)next.hallId=hallId;return next;
 }
 if(event==='arrive'&&hallId){next.stage='arrived';next.hallId=hallId;next.exhibitId=null;return next;}
 if(event==='enter'&&hallId){next.stage='inside';next.hallId=hallId;next.exhibitId=null;next.chapterId=null;next.visitedHall=unique(next.visitedHall.concat(hallId));return next;}
 const exhibitId=p.exhibitId||p.exhibit;
 if(event==='exhibit'&&hallId&&EXHIBIT_IDS.includes(exhibitId)){
  next.stage='exhibit';next.hallId=hallId;next.exhibitId=exhibitId;next.viewedExhibits=unique(next.viewedExhibits.concat(hallId+':'+exhibitId));return next;
 }
 const chapterId=p.chapterId||(typeof payload==='string'&&!validHall(payload)?payload:'');
 if(event==='select'&&hallId&&typeof chapterId==='string'&&chapterId.trim()){
  next.stage='complete';next.hallId=hallId;next.chapterId=chapterId.trim();return next;
 }
 return next;
}
/** 用來呈現小卡；略過只隱藏小卡，不阻止移動、進館或選課。 */
export function guideStep(state){
 const s=copyState(state),hall=HALL_GUIDES[s.hallId],name=hall?.title||'展館';
 const steps={
  welcome:{index:0,title:'跟著書僮，先逛一館',body:'選一座感興趣的館，沿路找到館門，再進館看展、挑選篇章。也可以先自由走走。',action:'chooseHall',label:'選一館，開始探索'},
  walking:{index:0,title:'沿著小徑找到館門',body:s.hallId?'目的地是'+name+'。點導覽可自動帶路，也能用方向鍵或點地面自行走動。':'先選一館作為目的地，或在廣場自由走動。',action:'walk',label:s.hallId?'前往'+name:'選擇目的地'},
  arrived:{index:1,title:'到館門了，現在可以進館',body:'你已走到'+name+'附近。按互動按鈕或鍵盤 E，就能進入展廳。',action:'enter',label:'進入'+name},
  inside:{index:2,title:'走近展櫃，帶著問題看',body:hall?hall.intro:'走近一座展櫃，看看這裡收藏了哪些篇章。',action:'view',label:'走向主展櫃'},
  exhibit:{index:3,title:'挑一篇，開始你的故事',body:hall?.exhibits[s.exhibitId]?.question||'閱讀篇章簡介，挑一篇目前可進入的課文。選課後會接回原有劇本。',action:'select',label:'查看可玩的篇章'},
  complete:{index:4,title:'這一站已找到篇章',body:'即將接續原有課文遊戲。村莊導覽只記錄這次逛展，不代替閱讀、作答或課文成績。',action:'replay',label:'再逛一館'}
 };
 const step=steps[s.stage]||steps.welcome;return {key:steps[s.stage]?s.stage:'welcome',...step,total:4,completed:s.stage==='complete',visible:!s.muted};
}

const PREFERRED=freeze({cq:['S_cq08_weizheng','S_cq16_datong'],zg:['S_zg11_zhuke','S_zg09_mengchang'],ch:['S_ch04_hongmen'],zz:['S_zz01_laobio','S_zz03_zhuangbio'],gw:['S_gw06_taoyuan','S_gw07_shishuo'],al:['S_al01_yufu','S_al02_liulao']});
/** 只回傳真正可玩的原目錄物件；不新增篇章、擴張訪客權限或改寫目錄。 */
export function recommendChapters(catalog,canPlay,{hallId,limit=3}={}){
 if(!Array.isArray(catalog)||typeof canPlay!=='function')return [];
 if(hallId&&!validHall(hallId))return [];
 const count=Number.isFinite(Number(limit))?Math.max(0,Math.min(12,Math.floor(Number(limit)))):3;if(!count)return [];
 const seen=new Set(),candidates=[];
 for(const chapter of catalog){
  if(!chapter||typeof chapter.id!=='string'||seen.has(chapter.id)||!validHall(chapter.vol)||chapter.status!=='ready'||chapter.legacyOnly||(hallId&&chapter.vol!==hallId))continue;
  seen.add(chapter.id);let allowed=false;try{allowed=!!canPlay(chapter.id);}catch(_){allowed=false;}if(allowed)candidates.push(chapter);
 }
 const rank=chapter=>{const at=PREFERRED[chapter.vol].indexOf(chapter.id);return at<0?100:at;};
 return candidates.map((chapter,index)=>({chapter,index})).sort((a,b)=>rank(a.chapter)-rank(b.chapter)||a.index-b.index).slice(0,count).map(item=>item.chapter);
}
