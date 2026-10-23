// 春秋同行：畫面呈現公開線索，所有進度仍經由純規則指令與重播驗證。
export function createSpringView({host,world:w,R,esc,avatar,send,paused}){
 const C=R.SP;
 let signature='',selected=null,rotation=0,dragging=null,suppressUntil=0;
 const attr=value=>esc(String(value));
 const b=(label,name,value,extra='')=>'<button type="button" data-sp="'+name+'"'+(value===undefined?'':' data-v="'+encodeURIComponent(JSON.stringify(value))+'"')+' '+extra+'>'+label+'</button>';
 const lock=value=>' data-sp-lock="'+Boolean(value)+'"';
 const row=html=>'<div class="oc-sp-row">'+html+'</div>';
 const grid=(count,cell,cols=4)=>'<div class="oc-sp-grid" style="--sp-cols:'+cols+'">'+Array.from({length:count},(_,i)=>cell(i)).join('')+'</div>';
 const instruction=text=>'<p class="oc-sp-instruction">'+esc(text)+'</p>';
 const stats=items=>'<div class="oc-sp-stats">'+items.map(([label,value])=>'<span>'+esc(label)+' <b>'+esc(String(value))+'</b></span>').join('')+'</div>';
 const note=text=>'<p class="oc-sp-note">'+esc(text)+'</p>';
 const signed=value=>value>0?'＋'+value:String(value);
 const on=key=>(w.buffs?.[key]||0)>w.time;
 const listening=()=>on('listening')&&w.time<w.buffs.listening-6;
 const blocked=()=>paused()||w.status!=='playing'||w.campaign.done||listening()||w.campaign.spent>=w.campaign.budget;
 const checks=new Set(['fireBeacon','dismissBeacon','testTunnel','verifyScouts','sendDispatch','sealPeace','verifySources','passDisguise']);
 const call=(name,value)=>{if(blocked())return;send(name,value);};
 const valueOf=el=>el.dataset.v===undefined?undefined:JSON.parse(decodeURIComponent(el.dataset.v));
 const qty=(label,value,max,name,index,min=0)=>'<section class="oc-sp-card"><h4>'+esc(label)+'</h4><strong>'+value+'／'+max+'</strong>'+row(b('−',name,{index,value:value-1},lock(value<=min)+' aria-label="減少'+attr(label)+'"')+b('＋',name,{index,value:value+1},lock(value>=max)+' aria-label="增加'+attr(label)+'"'))+'</section>';
 const slider=(label,name,value,min,max,extra='')=>'<label class="oc-sp-slider">'+esc(label)+'<input type="range" data-sp-range="'+name+'" min="'+min+'" max="'+max+'" step="1" value="'+value+'" aria-label="'+attr(label)+'" '+extra+'><output data-sp-output="'+name+'">'+value+'</output></label>';
 const near=(a,c,cols)=>Math.abs(a%cols-c%cols)+Math.abs(Math.floor(a/cols)-Math.floor(c/cols))===1;
 function render(){
  const g=w.campaign,p=C.pilot(w);let html='';
  if(g.done||w.status!=='playing')html='<p>'+(g.done?'本次同行操作已完成。':'本次操作已結束。')+'</p>';
  else html=renderMission(g,C.scene(w));
  host.innerHTML='<section class="oc-sp-board" data-sp-layout="'+attr(g.mechanic)+'" aria-label="'+attr(p.title)+'"><header class="oc-sp-head"><div class="oc-sp-avatar" aria-hidden="true">'+avatar()+'</div><div><h4>'+esc(p.title)+'</h4><p>'+esc(p.role)+'</p><small>本篇獨立操作 · 原劇情接續進行</small></div></header>'+html+'<p data-sp-hint class="oc-sp-hint" aria-live="polite"></p></section>';
 }
 function renderMission(g,s){
  let html='';
  if(g.mechanic==='beacon')html=instruction('比對巡候傳來的燈號，把四盞回應燈調成同樣的排列。有敵情才舉烽；無敵情要解除警報。每次判讀後會收到下一則巡候。')+stats([['巡候',Math.min(6,g.round+1)+'／6'],['失誤',g.errors],['操作',g.spent+'／'+g.budget]])+'<div class="oc-sp-beacon-report"><h4>巡候傳訊</h4><p>'+esc(s.report)+'</p><div class="oc-sp-beacon-lights" aria-label="巡候燈號">'+s.pattern.map((lit,i)=>'<span class="'+(lit?'is-lit':'')+'">'+(i+1)+' '+(lit?'亮':'暗')+'</span>').join('')+'</div></div><div class="oc-sp-orbit">'+g.switches.map((lit,i)=>b('回應燈 '+(i+1)+'<strong>'+(lit?'● 亮':'○ 暗')+'</strong>','toggleSignal',i,'class="'+(lit?'is-selected':'')+'" aria-pressed="'+Boolean(lit)+'"')).join('')+'</div>'+row(b('舉烽示警','fireBeacon')+b('解除警報','dismissBeacon'));
  if(g.mechanic==='tunnel'){
   const glyph=mask=>[1,2,4,8].map((bit,i)=>mask&bit?'↑→↓←'[i]:'').join('');
   html=instruction('點管節順時針轉四分之一圈，讓左上西口通到右下東口。沿路相鄰管口須互相接上，入口朝西、出口朝東；配好後試水。')+stats([['轉動',g.spent+'／'+g.budget],['試水失誤',g.errors]])+'<div class="oc-sp-tunnel">'+grid(12,i=>b('<small>'+(i===s.source?'← 西入口':i===s.goal?'東出口 →':'管節 '+(i+1))+'</small><strong>'+glyph(s.masks[i])+'</strong>','turnPipe',i,'data-sp-cell="'+i+'" data-sp-cols="4" class="'+([s.source,s.goal].includes(i)?'is-target':'')+'"'),4)+'</div>'+row(b('試水，檢查隧道','testTunnel'))+note('箭頭表示目前管口朝向；點一下轉90度。入口與出口也可以旋轉。');
  }
  if(g.mechanic==='scouts'){
   const clue=parts=>parts.length?parts.join('、'):'0';
   html=instruction('行列數字表示該行／列中威脅格的連續長度。不同組之間至少空一格。點地格循環標記「安全→威脅→未定」，全部判明再交圖。')+stats([['已判明',g.marks.filter(n=>n!==-1).length+'／16'],['核對失誤',g.errors],['操作',g.spent+'／'+g.budget]])+'<div class="oc-sp-nonogram"><div></div>'+s.colClues.map((parts,i)=>'<strong aria-label="第'+(i+1)+'列線索">'+clue(parts)+'</strong>').join('')+Array.from({length:4},(_,r)=>'<strong aria-label="第'+(r+1)+'行線索">'+clue(s.rowClues[r])+'</strong>'+Array.from({length:4},(_,c)=>{const i=r*4+c,v=g.marks[i];return b(v===-1?'？':v===0?'○ 安全':'▲ 威脅','markScout',{index:i,value:v===-1?0:v===0?1:-1},'data-sp-cell="'+i+'" data-sp-cols="4" aria-label="第'+(r+1)+'行第'+(c+1)+'列 '+(v===-1?'未定':v===0?'安全':'威脅')+'" class="'+(v===1?'is-danger':v===0?'is-done':'')+'"');}).join('')).join('')+'</div>'+row(b('交付偵察圖','verifyScouts'));
  }
  if(g.mechanic==='drums')html=instruction('游標進入金色節拍區時擊鼓。先完成三次有節奏的軍令，敵退後仍要觀察車轍與旗幟，兩項都確認才追擊。')+stats([['鼓令',Math.min(3,g.round)+'／3'],['車轍',g.trackSeen?'已察':'未察'],['旗幟',g.flagSeen?'已察':'未察'],['誤令',g.errors]])+'<div class="oc-sp-drum"><span>鼓</span><div class="oc-sp-timing"><i data-sp-window></i><b data-sp-marker></b><small data-sp-timing-label></small></div></div>'+row(b('擊鼓，傳令','strikeDrum',undefined,lock(g.round>=3))+b('下視車轍','observeTrack',undefined,lock(g.round<3||g.trackSeen))+b('登軾望旗','observeFlag',undefined,lock(g.round<3||g.flagSeen)))+row(b('確認敵退，追擊','pursue',undefined,lock(g.round<3||!g.trackSeen||!g.flagSeen)));
  if(g.mechanic==='baggage'){
   const occupied=Array(16).fill(-1);g.placements.forEach((placement,item)=>{if(!placement)return;const d=s.items[item],width=placement.rotation?d.height:d.width,height=placement.rotation?d.width:d.height;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const cell=placement.cell+y*4+x;if(cell<16)occupied[cell]=item;}});
   html=instruction('四件行囊形狀不同，要全放進四乘四車廂。先選行囊、決定橫直，再點左上起格；也能把行囊拖到車格。不能重疊或超出邊界。')+stats([['已裝',g.placements.filter(Boolean).length+'／4'],['裝填',g.spent+'／'+g.budget],['失誤',g.errors]])+'<div class="oc-sp-split"><div><h4>待裝行囊</h4><div class="oc-sp-tokens">'+s.items.map((item,i)=>b(esc(item.name)+'<small>'+item.width+'×'+item.height+(g.placements[i]?' · 已裝':'')+'</small>','selectPack',i,'data-sp-drag="'+i+'" class="'+(selected===i?'is-selected':g.placements[i]?'is-done':'')+'" aria-pressed="'+(selected===i)+'"')).join('')+'</div>'+row(b('旋轉選取行囊 '+(rotation?'直置':'橫置'),'rotatePack',undefined,lock(selected===null))+b('收回選取行囊','unpack',selected,lock(selected===null||!g.placements[selected])) )+'</div><div class="oc-sp-map">'+grid(16,i=>b(occupied[i]<0?'空格':'<small>'+esc(s.items[occupied[i]].name)+'</small>','packAt',i,'data-sp-cell="'+i+'" data-sp-cols="4" data-sp-drop="pack" class="'+(occupied[i]===selected?'is-current':occupied[i]<0?'':'is-done')+'"'+lock(selected===null)),4)+'</div></div>'+row(b('行囊就緒，啟程','depart',undefined,lock(g.placements.some(p=>!p))));
  }
  if(g.mechanic==='ferry'){
   html=instruction('人每航只能攜帶一件物資，也可以空船折返。人不在的那一岸，不能把禁配的兩件物資留在一起。先讀禁配規則，再選本航要帶的物資。')+stats([['船在',g.boat===0?'此岸':'彼岸'],['航次',g.crossings],['失誤',g.errors],['操作',g.spent+'／'+g.budget]])+'<div class="oc-sp-river"><div class="oc-sp-split">'+[0,1].map(side=>'<section class="oc-sp-card"><h4>'+['此岸','彼岸'][side]+'</h4>'+(g.boat===side?'<p><span class="oc-sp-pawn">'+avatar()+'</span> 船與我在此</p>':'<p>≈</p>')+s.cargoNames.map((name,i)=>g.sides[i]===side?b(esc(name)+'<small>帶它渡河</small>','crossFerry',i,lock(g.boat!==side)):'').join('')+'</section>').join('')+'</div></div>'+note('不能獨留：'+s.forbidden.map(pair=>pair.map(i=>s.cargoNames[i]).join('＋')).join('；')+'。')+row(b('空船渡河','crossFerry',null));
  }
  if(g.mechanic==='bridge'){
   const occupied=Array(s.total).fill(-1);g.placements.forEach((placement,piece)=>{if(placement)for(let j=0;j<s.lengths[piece];j++)occupied[placement.start+j]=piece;});
   html=instruction('以三段木料補齊斷橋。木料要完整鋪在缺口內，不能壓到岸地或另一段木料。先選木料再點起格，也能拖到起格；補齊後才護送通行。')+stats([['已鋪',g.placements.filter(Boolean).length+'／3'],['嘗試',g.spent+'／'+g.budget],['失誤',g.errors]])+'<div class="oc-sp-tokens">'+s.lengths.map((length,i)=>b('木料 '+(i+1)+'<strong>'+Array(length).fill('▰').join('')+'</strong><small>長 '+length+' 格</small>','selectBridge',i,'data-sp-drag="'+i+'" class="'+(selected===i?'is-selected':g.placements[i]?'is-done':'')+'" aria-pressed="'+(selected===i)+'"')).join('')+'</div><div class="oc-sp-bridge-track">'+Array.from({length:s.total},(_,i)=>b('<small>第 '+(i+1)+' 格</small>'+(s.banks.includes(i)?'<strong>岸</strong>':occupied[i]>=0?'<strong>木 '+(occupied[i]+1)+'</strong>':'<strong>≈ 缺口</strong>'),'bridgeAt',i,'data-sp-cell="'+i+'" data-sp-cols="10" data-sp-drop="layBridge" class="'+(s.banks.includes(i)?'is-wall':occupied[i]>=0?'is-path':'is-danger')+'"'+lock(selected===null||s.banks.includes(i)))).join('')+'</div>'+row(b('收回選取木料','liftBridge',selected,lock(selected===null||!g.placements[selected]))+b('護送通過','crossBridge',undefined,lock(g.placements.some(p=>!p))));
  }
  if(g.mechanic==='retreat')html=instruction('先向下退讓三舍；每一步都只能走到相鄰一格。三退後中央通路封鎖，從側翼繞回左上會合口。點亮框旁的鄰格行動。')+stats([['退讓',g.retreats+'／3'],['步數',g.spent+'／'+g.budget],['失誤',g.errors]])+'<div class="oc-sp-retreat-map">'+grid(s.total,i=>b(i===g.position?'<span class="oc-sp-pawn">'+avatar()+'</span><small>我</small>':i===s.goal?'會合口':s.blocked.includes(i)?'封鎖':'<small>'+('甲乙丙丁戊'[i%s.cols])+(Math.floor(i/s.cols)+1)+'</small>','stepRetreat',i,'data-sp-cell="'+i+'" data-sp-cols="'+s.cols+'" class="'+(i===g.position?'is-current':i===s.goal?'is-target':s.blocked.includes(i)?'is-wall':'')+'"'+lock(!near(g.position,i,s.cols)||s.blocked.includes(i))),s.cols)+'</div>'+note(g.retreats<3?'先依約退讓，勿搶側路。':'三舍已退，中央封鎖；觀察左右兩翼的連通路。');
  if(g.mechanic==='dispatch')html=instruction('三枚傳訊轉盤共用五個刻度。調整刻度，使三條封泥關係同時成立；計算結果只保留除以五的餘數，再封緘送出。')+stats([['急報',Math.min(3,g.round+1)+'／3'],['核對失誤',g.errors],['操作',g.spent+'／'+g.budget]])+'<div class="oc-sp-dispatch"><div class="oc-sp-wheel">'+g.dials.map((n,i)=>'<section><h4>封 '+['甲','乙','丙'][i]+'</h4><strong>'+n+'</strong>'+row(b('−','turnSeal',{index:i,delta:-1},'aria-label="封'+['甲','乙','丙'][i]+'逆轉一格"')+b('＋','turnSeal',{index:i,delta:1},'aria-label="封'+['甲','乙','丙'][i]+'順轉一格"'))+'</section>').join('')+'</div><div class="oc-sp-card"><h4>三條封泥約束</h4><p>（甲＋乙）÷5 的餘數＝'+s.constraints.ab+'</p><p>（乙＋丙）÷5 的餘數＝'+s.constraints.bc+'</p><p>（甲＋2×丙）÷5 的餘數＝'+s.constraints.ac2+'</p></div></div>'+row(b('封緘，送出急報','sendDispatch'));
  if(g.mechanic==='rubbing'){
   const names=['青','朱','金'];
   html=instruction('從左上角的連通區開始換墨。新墨會吸收相鄰同色格，讓拓印範圍逐次擴展；用有限次換墨將整面鐘鼎拓片連成同色。')+stats([['換墨',g.moves+'／'+g.budget],['失誤',g.errors]])+'<div class="oc-sp-rubbing">'+grid(16,i=>'<div class="oc-sp-ink oc-sp-ink-'+g.colors[i]+'" aria-label="第'+(i+1)+'格 '+names[g.colors[i]]+'墨">'+(i===0?'起拓':'<span aria-hidden="true">'+['丶','丨','一','丿'][i%4]+'</span>')+'</div>',4)+'</div><div class="oc-sp-tokens">'+Array.from({length:s.palette},(_,i)=>b(names[i]+'墨','ink',i,'class="oc-sp-ink-'+i+'"'+lock(g.colors[0]===i))).join('')+'</div>'+note('只改左上連通區的墨色；墨色相接後才會納入下一次拓印。');
  }
  if(g.mechanic==='chariot')html=instruction('拉動一根韁索會同時翻轉這一輪與相鄰輪的制動。五輪都轉成「行」才可續駕。觀察連動範圍，規劃拉索順序。')+stats([['拉索',g.pulls+'／'+g.budget],['可行輪',g.gears.filter(Boolean).length+'／5'],['失誤',g.errors]])+'<div class="oc-sp-chariot"><div class="oc-sp-axle" aria-hidden="true"></div>'+g.gears.map((gear,i)=>'<section><div class="oc-sp-gear '+(gear?'is-ready':'')+'">'+(gear?'行':'止')+'</div><p>第 '+(i+1)+' 輪</p>'+b('拉索 '+(i+1),'pullRein',i)+'<small>連動 '+s.neighbors[i].map(n=>n+1).join('、')+' 輪</small></section>').join('')+'</div>'+note('「行」表示制動已解除；任務只推演車組協作，不取代原劇情的駕車與戰局結果。');
  if(g.mechanic==='armistice'){
   const totals=g.offers.reduce((sum,i)=>[sum[0]+s.cards[i].jin,sum[1]+s.cards[i].chu,sum[2]+s.cards[i].cost],[0,0,0]);
   html=instruction('從議約條件選出雙方都能接受的一組。晉、楚各自的信任值須達標，總代價不能超額，而且條件數須剛好符合要求。再次點條件即可撤回。')+stats([['會盟',Math.min(3,g.round+1)+'／3'],['晉方',totals[0]+'／至少'+s.minJin],['楚方',totals[1]+'／至少'+s.minChu],['代價',totals[2]+'／最多'+s.maxCost],['已選',g.offers.length+'／'+s.count],['失誤',g.errors]])+'<table class="oc-sp-ledger"><thead><tr><th scope="col">議約條件</th><th scope="col">晉信任</th><th scope="col">楚信任</th><th scope="col">代價</th></tr></thead><tbody>'+s.cards.map((card,i)=>'<tr class="'+(g.offers.includes(i)?'is-selected':'')+'"><td>'+b((g.offers.includes(i)?'✓ ':'')+esc(card.name),'toggleOffer',i,'aria-pressed="'+g.offers.includes(i)+'"'+lock(!g.offers.includes(i)&&g.offers.length>=s.count))+'</td><td>'+card.jin+'</td><td>'+card.chu+'</td><td>'+card.cost+'</td></tr>').join('')+'</tbody></table>'+row(b('締約，送交雙方','sealPeace',undefined,lock(g.offers.length!==s.count)))+note('條件與信任數值為自編談判模型。需同時滿足雙方，不以任何一方分數較高當作唯一目標。');
  }
  if(g.mechanic==='school'){
   const kinds=[...new Set(s.nodes.map(node=>node.kind))],label=i=>s.nodes[i].name;
   html=instruction('鄉校的意見要追查來源。沿可查核的關係連線，讓每項請求各接三段回到指定來源；兩項共六段，不能混接、多接或指向矛盾的兩個源。再次點連線可撤回。')+stats([['已連',g.links.length+' 條'],['查核失誤',g.errors],['操作',g.spent+'／'+g.budget]])+'<div class="oc-sp-source-requests">'+s.requests.map(request=>'<p>待查：<strong>'+esc(label(request.node))+'</strong> → 指定源 <strong>'+esc(label(request.origin))+'</strong></p>').join('')+'</div><div class="oc-sp-source-layers">'+kinds.map(kind=>'<section><h4>'+esc(({origin:'一手來源',witness:'親聞記錄',relay:'轉述線索',request:'待查議論'})[kind]||String(kind))+'</h4>'+s.nodes.map((node,i)=>node.kind===kind?'<article class="oc-sp-card"><strong>'+esc(node.name)+'</strong><p>'+esc(node.text)+'</p></article>':'').join('')+'</section>').join('')+'</div><h4>查核連線</h4><div class="oc-sp-source-links">'+s.edges.map(([from,to])=>{const linked=g.links.some(link=>link.from===from&&link.to===to);return b((linked?'✓ ':'')+esc(label(from))+' → '+esc(label(to)),'linkSource',{from,to},'class="'+(linked?'is-path':'')+'" aria-pressed="'+linked+'"');}).join('')+'</div>'+row(b('交付來源查核圖','verifySources'));
  }
  if(g.mechanic==='disguise')html=instruction('關卡會以冠、衣、帶、履的色碼查驗行旅。色碼為青0、赤1、素2；四件相加須符合當關總數，同時留意同色與異色的約束。')+stats([['關隘',Math.min(3,g.round+1)+'／3'],['目前合碼',g.garments.reduce((a,n)=>a+n,0)+'／目標'+s.rules.sum],['盤查失誤',g.errors]])+'<div class="oc-sp-disguise"><div class="oc-sp-disguise-doll" aria-hidden="true">'+avatar()+'</div><div>'+s.parts.map((part,i)=>'<section class="oc-sp-string"><b>'+esc(part)+'</b>'+s.choices.map((name,value)=>b(esc(name)+' '+value,'dress',{slot:i,value},'class="'+(g.garments[i]===value?'is-selected':'')+'" aria-pressed="'+(g.garments[i]===value)+'"')).join('')+'</section>').join('')+'</div></div>'+note(s.rules.paired.map(i=>s.parts[i]).join('與')+'必須同色；'+s.rules.different.map(i=>s.parts[i]).join('與')+'必須異色。')+row(b('整理衣冠，接受盤查','passDisguise'));
  if(g.mechanic==='slips')html=instruction('整理五束竹簡，每次只搬一柱最上方的一束。大束不可壓小束；將全部移往右柱，保留竹簡順序。先選來源柱，再點目的柱，也能把頂束拖到另一柱。')+stats([['搬簡',g.moves+'／'+g.budget],['右柱',g.pegs[s.goal].length+'／5'],['失誤',g.errors]])+'<div class="oc-sp-tower">'+g.pegs.map((peg,i)=>'<section data-sp-drop="moveSlip" data-sp-cell="'+i+'"><h4>'+['左柱','中柱','右柱'][i]+(i===s.goal?' · 目標':'')+'</h4><div class="oc-sp-slip-stack">'+peg.slice().reverse().map((size,j)=>'<span class="oc-sp-layer" style="width:'+Math.min(100,30+size*13)+'%">'+size+' 號簡束'+(j===0?' · 頂束':'')+'</span>').join('')+'</div>'+b(selected===i?'已選，點目的柱':'選取／移入','choosePeg',i,'data-sp-cell="'+i+'" data-sp-cols="3" '+(peg.length?'data-sp-drag="'+i+'"':'')+' data-sp-drop="moveSlip" class="'+(selected===i?'is-selected':'')+'"'+lock(selected===null&&!peg.length))+'</section>').join('')+'</div>'+note(selected===null?'請選一個有簡束的來源柱。':'已選'+['左','中','右'][selected]+'柱；點另一柱搬動頂束，點原柱取消。');
  if(g.mechanic==='growth'){
   html=instruction('連續經營六季，每季先決定三塊田的作物，再一起收成。收成後全村需四份糧；稻作會消耗土力且不能連作，豆作、休耕能回復土地。')+stats([['季節',Math.min(s.seasons,g.season+1)+'／'+s.seasons],['天候',s.weather==='rain'?'雨季':'晴季'],['存糧',g.food+'／期末至少'+s.goalFood],['操作',g.spent+'／'+g.budget],['失誤',g.errors]])+'<div class="oc-sp-fields">'+grid(3,i=>'<section><h4>第 '+(i+1)+' 田</h4><p>土力 '+g.soil[i]+' · 前季 '+(g.previous[i]===null||g.previous[i]===-1?'尚未耕作':esc(s.cropNames[g.previous[i]]))+'</p><div class="oc-sp-field-art oc-sp-crop-'+g.crops[i]+'" aria-hidden="true">'+['〃〃〃','♧ ♧','﹏﹏﹏'][g.crops[i]]+'</div>'+s.cropNames.map((name,crop)=>b((g.crops[i]===crop?'✓ ':'')+esc(name),'sow',{field:i,crop},'aria-pressed="'+(g.crops[i]===crop)+'"'+lock(crop===0&&(g.soil[i]<1||g.previous[i]===0)))).join('')+'</section>',3)+'</div>'+note('稻作：'+(s.weather==='rain'?'雨季收2':'晴季收3')+'糧，土力−1；豆作：收1糧，土力＋1；休耕：不收糧，土力＋2（上限3）。六季後存糧須達標，且三田土力皆至少1。')+row(b('收成，推進一季','harvest'));
  }
  if(['beacon','tunnel','scouts','dispatch','armistice','school','disguise'].includes(g.mechanic))html+=stats([['核驗餘裕',Math.max(0,g.maxChecks-g.checks)+' 次']]);
  return html;
 }
 host.addEventListener('click',event=>{
  const el=event.target.closest?.('[data-sp]');if(!el||el.disabled||blocked()||Date.now()<suppressUntil)return;
  let value;try{value=valueOf(el);}catch{return;}
  if(el.dataset.sp==='selectPack'||el.dataset.sp==='selectBridge'){selected=selected===value?null:value;paint();return;}
  if(el.dataset.sp==='rotatePack'){rotation=1-rotation;paint();return;}
  if(el.dataset.sp==='packAt'){if(selected!==null)call('pack',{item:selected,cell:value,rotation});return;}
  if(el.dataset.sp==='bridgeAt'){if(selected!==null)call('layBridge',{piece:selected,start:value});return;}
  if(el.dataset.sp==='choosePeg'){
   if(selected===null)selected=value;
   else if(selected===value)selected=null;
   else{const from=selected;selected=null;call('moveSlip',{from,to:value});}
   paint();return;
  }
  call(el.dataset.sp,value);
 });
 host.addEventListener('input',event=>{
  const el=event.target.closest?.('[data-sp-range]');if(!el)return;
  if(blocked())return;
  const output=host.querySelector('[data-sp-output="'+el.dataset.spRange+'"]');if(output)output.textContent=el.value;
 });
 host.addEventListener('change',event=>{
  const el=event.target.closest?.('[data-sp-range]');if(!el||blocked())return;
  call(el.dataset.spRange,Number(el.value));
 });
 host.addEventListener('pointerdown',event=>{
  if(blocked())return;
  const el=event.target.closest?.('[data-sp-drag]');if(!el||el.disabled)return;
  dragging={id:event.pointerId,index:Number(el.dataset.spDrag),x:event.clientX,y:event.clientY,moved:false};host.setPointerCapture?.(event.pointerId);
  selected=dragging.index;paint();
 });
 host.addEventListener('pointermove',event=>{if(dragging&&event.pointerId===dragging.id&&!blocked()&&Math.hypot(event.clientX-dragging.x,event.clientY-dragging.y)>8)dragging.moved=true;});
 host.addEventListener('pointerup',event=>{
  if(!dragging||event.pointerId!==dragging.id)return;const prior=dragging;dragging=null;if(blocked()||!prior.moved)return;
  suppressUntil=Date.now()+250;
  const target=document.elementFromPoint?.(event.clientX,event.clientY)?.closest?.('[data-sp-drop]');
  if(target&&!target.disabled){
   const command=target.dataset.spDrop,cell=Number(target.dataset.spCell);
   if(command==='pack')call('pack',{item:prior.index,cell,rotation});
   else if(command==='layBridge')call('layBridge',{piece:prior.index,start:cell});
   else if(command==='moveSlip'){selected=null;call('moveSlip',{from:prior.index,to:cell});}
  }
 });
 for(const name of ['pointercancel','lostpointercapture'])host.addEventListener(name,()=>{dragging=null;});
 host.addEventListener('keydown',event=>{
  const el=event.target.closest?.('[data-sp-cell]');if(!el||blocked())return;
  const cols=Number(el.dataset.spCols||4),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[event.key];if(delta===undefined)return;
  event.preventDefault();const at=Number(el.dataset.spCell),to=at+delta;if(to<0||!near(at,to,cols))return;
  const found=[...host.querySelectorAll('[data-sp-cell]')].find(node=>Number(node.dataset.spCell)===to&&!node.disabled);found?.focus({preventScroll:true});
 });
 function paint(){
  const g=w.campaign;if(!g)return;
  const key=w.status+':'+JSON.stringify(g)+':'+selected+':'+rotation;let restoreFocus=null;
  if(key!==signature){const nodes=['[data-sp]','[data-sp-range]'].flatMap(selector=>[...host.querySelectorAll(selector)]),focused=nodes.includes(document.activeElement)?document.activeElement:null;if(focused)restoreFocus={action:focused.dataset.sp,value:focused.dataset.v,range:focused.dataset.spRange};render();signature=key;}
  const stopped=blocked();if(stopped)dragging=null;
  for(const el of host.querySelectorAll('[data-sp]'))el.disabled=stopped||el.dataset.spLock==='true'||checks.has(el.dataset.sp)&&g.checks>=g.maxChecks;
  for(const el of host.querySelectorAll('[data-sp-range]'))el.disabled=stopped;
  if(g.mechanic==='drums'&&w.status==='playing'&&!g.done){
   const s=C.scene(w),window=host.querySelector('[data-sp-window]'),marker=host.querySelector('[data-sp-marker]'),label=host.querySelector('[data-sp-timing-label]');
   if(window)window.style.cssText='left:'+s.window[0]/s.period*100+'%;width:'+(s.window[1]-s.window[0])/s.period*100+'%';
   if(marker)marker.style.left=s.phase/s.period*100+'%';
   for(const el of host.querySelectorAll('[data-sp]'))if(el.dataset.sp==='strikeDrum')el.disabled=stopped||g.round>=3||!s.canStrike;
   if(label)label.textContent=g.round>=3?'三鼓完成，先察轍、望旗':s.canStrike?'第三鼓亮窗，可擊鼓':g.lastCycle===s.cycle?'本輪已發令，等下一輪':'第 '+(Math.floor(s.phase)+1)+' 鼓 · 等金色亮窗';
  }
  if(restoreFocus&&!stopped){const {action,value,range}=restoreFocus;if(action){const nodes=[...host.querySelectorAll('[data-sp]')],found=nodes.find(el=>el.dataset.sp===action&&el.dataset.v===value&&!el.disabled)||nodes.find(el=>el.dataset.sp===action&&!el.disabled);found?.focus({preventScroll:true});}else if(range)host.querySelector('[data-sp-range="'+range+'"]')?.focus({preventScroll:true});}
  const hints=w.status==='playing'&&!g.done&&C.uiHints?C.uiHints(w):[],text=(listening()?'靜候 '+Math.max(1,Math.ceil(w.buffs.listening-6-w.time))+' 秒後可繼續操作。 ':'')+(w.status==='playing'&&!g.done&&g.spent>=g.budget?'操作餘裕已用完，可使用運籌或重試本次同行。 ':'')+(w.status==='playing'&&!g.done&&g.checks>=g.maxChecks?'核驗餘裕已用完，可使用運籌或重試本次同行。 ':'')+(Array.isArray(hints)?hints.join(' '):String(hints||'')),hint=host.querySelector('[data-sp-hint]');if(hint&&hint.textContent!==text)hint.textContent=text;
 }
 return{paint};
}
