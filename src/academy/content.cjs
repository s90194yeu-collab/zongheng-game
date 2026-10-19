'use strict';
// 原有三卷的挑戰仍使用原篇遊戲；限定目標與文本任務逐篇編寫。
const original={
dongqian:['餘燼中的遷都','辨認遷都前後的權力轉移，為護送路線留下周室處境的證據。'],
zhengzhuang:['等候與越界','掌握制止共叔段的時機，區分人物布局與敘事者的褒貶。'],
handong:['示弱之後','守住觀察位置，從楚軍示弱與季梁進諫辨認不能追擊的理由。'],
qihuan:['一鼓之機','在長勺的節奏與時機中保留攻勢，核對曹劌先問民、後論戰的層次。'],
chonger:['十九年的行囊','在流亡與接應中安排有限資源，用人物對話說明進退的依據。'],
hanyuan:['舟糧與信義','完成運輸與接應，從借糧、閉糴與戰後對話追蹤關係變化。'],
songxiang:['渡河與成列','判讀敵軍渡河、成列的時間窗，再區分宋襄公與子魚的戰爭觀。'],
chengpu:['三舍之後','讓三軍撤退與接應銜接，用退避的承諾和後續部署解釋戰術。'],
weizheng:['夜縋不失其辭','完成夜縋與交涉，圈出從秦國利益切入、拆解秦晉同盟的一句。'],
xiao:['牛商的虛實','利用訊息與伏擊時機化解危機，區分弦高的應對與蹇叔的預見。'],
wending:['問鼎與問德','在問鼎交鋒中保留回應餘地，用王孫滿的話說明重量以外的問題。'],
jinba:['絕交書中的證詞','核對言辭與事實，再用原文辨別呂相如何建立責任歸屬。'],
jinchu:['夾縫中的尺度','安排多方交涉，選出駒支或子產維持立場而調整說辭的依據。'],
zichan:['鄉校之聲','完成治理或觀樂任務，指出保留批評與改正政事如何相連。'],
wushi:['昭關到郢都','掌握通關、行軍與軍紀，區分人物遭遇、行動與史傳評價。'],
kongzi:['困境中的講席','完成周遊中的學習與接應，指出人物如何在困厄中維持主張。'],
datong:['公與私的安排','在治理分工中保留照顧缺口的解法，對照大同與小康的制度差異。'],
wuyue:['生聚不竭','完成生產與戰備，從求成、進諫與復興讀出短期勝敗之外的代價。'],
sanjia:['水勢與盟約','利用水勢與聯盟轉向，說明智伯的力量如何形成反制條件。'],
weiwen:['任賢的次序','安排人才與資源，從魏文侯相關對話區分才能、信任與政治選擇。'],
shangyang:['徙木之後','在變法任務中建立可核對的規則，指出取信與制度推行的關聯。'],
jixia:['聽見遮蔽','從不同立場的訊息辨別偏見，找出鄒忌如何由私事推及國政。'],
maling:['減灶與追兵','掌握示形、追擊與伏擊的節奏，用原文解釋敵方判斷如何被引導。'],
hezong:['六印的牽制','維持結盟與交涉，指出共同利益與個別利益何時可能衝突。'],
quyuan:['江潭兩種聲音','在探索中保留屈原與漁父各自的立場，避免把兩者說成同一主張。'],
hufu:['更衣與易法','完成戰術轉換，從胡服騎射或火牛部署辨別因地制宜的理由。'],
mengchang:['三窟之間','處理門客、焚券與政治接應，說明眼前支出如何換得後來的支持。'],
changping:['和璧到長平','在交涉與指揮中辨認權責，區分人物能力、訊息落差與決策後果。'],
zhuke:['客卿之辯','在交涉中保留外來資源的用途，用李斯的對照指出逐客論的矛盾。'],
handan:['存趙的代價','完成求援與接應，說明信陵君的選擇牽動哪些責任與風險。'],
tongyi:['統一之後的裂縫','完成制度與調度任務，再用文本檢視統一成果和治理問題的差別。'],
shaqiu:['道路與勞役','完成道路、農時或徭役任務，以原文核對建設與民力的張力。'],
dazexiang:['雨阻之際','在限時與訊息不全中安排起事，區分陳涉的說辭、動機與實際條件。'],
julu:['背水之前','掌握渡河與進軍的承諾，用原文說明破釜沉舟如何改變行動條件。'],
hongmen:['席間四方','在鴻門的座次、示意與退席中辨認危機，用言行說明人物立場。'],
sanqin:['封國與還定','安排兵力與進路，用原文區分分封造成的局勢與還定三秦的條件。'],
xingyang:['糧道與廣武','完成糧道或卡牌交鋒，以原文指出正面對峙之外的牽制方式。'],
hanxin:['臨河布陣','安排旗幟、伏兵與渡河，用作戰順序說明出奇制勝的條件。'],
gaixia:['四面之聲','在聲音與突圍中作判斷，區分項羽自述、場景安排與史家筆法。'],
dafeng:['歌後之問','完成歌辭或回鄉任務，從歌句辨認得天下與守天下的不同焦慮。']
};
const targets={dongqian:'dq_dongqian',zhengzhuang:'zz_wait',handong:'su_kanpo',qihuan:'qh_changshao',chonger:'ce_liuwang',hanyuan:'hy_fanzhou',songxiang:'sx_hong',chengpu:'cp_battle',weizheng:'stl_yezhui',xiao:'xo_ambush',wending:'wen_wd_ding',jinba:'jb_audit',jinchu:'jc_mibing',zichan:'zc_xiangxiao',wushi:'ws_boju',kongzi:'kz_jueliang',datong:'dt_care',wuyue:'wy_shengju',sanjia:'sj_flood',weiwen:'ww_qu',shangyang:'sy_xumu',jixia:'jx_jixia',maling:'ml_jianzao',hezong:'hz_duel',quyuan:'qy_jiangpan',hufu:'hf_huoniu',mengchang:'mc_fenquan',changping:'cg_buji',zhuke:'zk_xunbao',handan:'hd_qiefu',tongyi:'wen_ty_liuguo',shaqiu:'sq_unify',dazexiang:'ch02_march',julu:'ch03_nine',hongmen:'ch04_watch',sanqin:'ch05_manage',xingyang:'xy_deck_1',hanxin:'jingxing_board',gaixia:'ch08_chuge',dafeng:'df_zhu'};
const resources={knife:{key:'blade',min:80,label:'刀刃耐久至少80'},snowcloak:{key:'dry',min:65,label:'文稿乾燥至少65％'},studio:{key:'wood',min:0,label:'木料不透支'},contracts:{key:'hp',min:5,label:'保留至少5格核驗餘裕'},waterworks:{key:'water',min:65,label:'保留至少65份可用水'}};
function makeData(catalog,chapters,anchors,activities={}){const entries={};for(const c of catalog.filter(c=>c.status==='ready'&&!c.legacyOnly)){const study=chapters[c.id],qs=anchors[c.id]||[],key=c.id.split('_').slice(2).join('_'),seed=original[key],stage=study?.stages.at(-1),mission=stage?.mission;const readings=[];for(const x of [...(study?.stages||[]),...qs]){const passage=String(x.passage||'').trim(),source=x.source||x.sourceRef||c.source;if(passage&&!readings.some(r=>r.passage===passage))readings.push({passage,source,url:x.url||study?.url||'',guide:study?.readerKind==='guide'});}entries[c.id]={id:c.id,name:c.name,source:c.source,vol:c.vol,scene:study?.scene||'scene:'+c.vol+String(c.ep).padStart(2,'0')+'_world',readings:readings.slice(0,10),questionIds:qs.map(q=>q.id),challenge:{title:seed?.[0]||mission?.title||c.name+'・原文進階',brief:seed?.[1]||mission?.connection||c.source,kind:mission?'literary':'original',target:mission?null:targets[key],targetTitle:mission?'':activities[targets[key]]?.title||seed?.[0]||'',mission:mission?{...mission,index:stage.mission.index}:null,precision:mission?2:undefined,resource:mission?resources[mission.mode]:undefined,goal:mission?'完成本幕、操作至少8／10，並留下能解釋操作與文本關係的原文證據。':'在原篇完成「'+(activities[targets[key]]?.title||seed?.[0]||c.name)+'」至少8／10，再留下能解釋本篇人物行動的原文證據。'}};}
 const find=text=>Object.values(entries).find(e=>e.name.includes(text))?.id;
 const pairs=[['樂與責任','岳陽樓記','醉翁亭記','作者如何從自己的處境走向他人之樂？'],['勸諫如何有效','秦晉圍鄭','諫太宗十思疏','面對掌權者，應先談利益，還是先談責任？'],['用人與成事','出師表','典論論文','辨認才能與安排人才，需要哪些依據？'],['守其志與順其勢','漁父','莊子・進階','面對不合己意的世界，兩篇各提出了什麼回應？'],['制度與民生','王道之始','石壕吏','治理者的需要與百姓的承受應如何衡量？'],['困厄中的選擇','左忠毅公逸事','林沖夜奔','人物如何在危險中取捨責任與生存？'],['積學與得道','荀子・進階','勞山道士','學習成果需要哪些累積？捷徑為何可能失敗？'],['歸去與遠行','歸去來辭','赤壁賦','作者如何重新理解身處的環境與自己的選擇？']].map(([title,a,b,prompt],i)=>({id:'debate_'+(i+1),title,left:find(a),right:find(b),prompt})).filter(p=>p.left&&p.right&&p.left!==p.right);
 return{version:'4.8.0',entries,pairs};}
module.exports={makeData,original,targets};
