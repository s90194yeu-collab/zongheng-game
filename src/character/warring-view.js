// 戰國同行：規則由 R.WA 決定；畫面只把點選、觸控與鍵盤操作送往指令橋接。
export function createWarringView({host,world:w,R,esc,avatar,send,paused}){
 const C=R.WA;
 let signature='',hover=-1,dragging=null,selectedCountry=null,selectedKey=null,suppressUntil=0;
 const attr=value=>esc(String(value));
 const b=(label,name,value,extra='')=>'<button type="button" data-wa="'+name+'"'+(value===undefined?'':' data-v="'+encodeURIComponent(JSON.stringify(value))+'"')+' '+extra+'>'+label+'</button>';
 const grid=(count,cell,cols=4,extra='')=>'<div class="oc-wa-grid" style="--wa-cols:'+cols+'" '+extra+'>'+Array.from({length:count},(_,i)=>cell(i)).join('')+'</div>';
 const row=html=>'<div class="oc-wa-row">'+html+'</div>';
 const instruction=text=>'<p class="oc-wa-instruction">'+esc(text)+'</p>';
 const active=key=>(w.buffs?.[key]||0)>w.time;
 const listening=()=>active('listening')&&w.time<w.buffs.listening-6;
 const blocked=()=>paused()||w.status!=='playing'||w.campaign.done||listening();
 const call=(name,value)=>{if(blocked())return;send(name,value);};
 const lock=value=>' data-wa-lock="'+Boolean(value)+'"';
 const signed=n=>n>0?'＋'+n:String(n);
 const num=n=>Number.isInteger(n)?String(n):Number(n).toFixed(1);
 const gauge=(n,max)=>'<div class="oc-wa-gauge" aria-hidden="true"><span style="width:'+Math.max(0,Math.min(100,n/max*100))+'%"></span></div>';
 const qty=(title,n,max,command,index)=>'<section class="oc-wa-slot"><strong>'+title+'</strong><span class="oc-wa-counter">'+n+'／'+max+'</span>'+row(b('−',command,{index,value:n-1},lock(n<=0)+' aria-label="減少'+attr(title)+'"')+b('＋',command,{index,value:n+1},lock(n>=max)+' aria-label="增加'+attr(title)+'"'))+'</section>';
 const near=(a,c,cols=4)=>Math.abs(a%cols-c%cols)+Math.abs(Math.floor(a/cols)-Math.floor(c/cols))===1;
 const color=n=>['青','赤','金'][n];
 function render(){
  const g=w.campaign,p=C.pilot(w);
  let html='';
  if(g.done||w.status!=='playing'){
   host.innerHTML='<section class="oc-wa-board" aria-label="'+esc(p.title)+'"><header class="oc-wa-head"><div class="oc-wa-avatar" aria-hidden="true">'+avatar()+'</div><div><h4>'+esc(p.title)+'</h4><p>'+(g.done?'本次同行操作已完成':'本次操作已結束')+'</p></div></header><p data-wa-hint class="oc-wa-hint" aria-live="polite"></p></section>';return;
  }
  if(g.mechanic==='flood'){
   const f=C.floodState(w),total=g.gates.reduce((a,n)=>a+n,0);
   html=instruction('用三道閘門分走來水。調整後才放閘；以總分流量等於來水為目標，每閘不能超過安全上限。運籌的暫存可吸收等量總分流差額。')+'<p>第 '+Math.min(5,g.round+1)+'／5 輪 · 來水 <b class="oc-wa-counter">'+f.inflow+'</b> · 已分流 '+total+' · 安全 '+g.saved+' 輪 · 損傷 '+g.damage+'／'+g.maxDamage+' · 暫存 '+g.reserve+'</p>'+grid(3,i=>'<section><h4>'+['城外閘','田渠閘','下游閘'][i]+'</h4><p>安全上限 '+f.ceilings[i]+'</p>'+gauge(g.gates[i],3)+qty('第'+(i+1)+'閘',g.gates[i],3,'setGate',i)+'</section>',3)+row(b('放閘，推進一輪','release'));
  }
  if(g.mechanic==='canal'){
   const wet=C.watered(w);
   html=instruction('點地格挖低一層，水只會沿相鄰且更低的渠床流動。讓左側水源通到右側三塊田；同高不會通水，中段挖得比出口低也會斷流。')+'<p>已挖 '+g.dug+'／'+g.budget+' 鏟 · 三田通水 '+[3,7,11].filter(i=>wet.includes(i)).length+'／3</p><div class="oc-wa-route-map">'+grid(12,i=>b((i===4?'泉源': [3,7,11].includes(i)?'田 '+([3,7,11].indexOf(i)+1):'渠床')+'<strong>'+g.heights[i]+' 層</strong><small>'+(wet.includes(i)?'≈ 有水':'尚未通水')+'</small>','dig',i,'data-wa-cell="'+i+'" class="'+(i===4?'is-current':wet.includes(i)?'is-path':'')+'"'+lock(i===4||g.heights[i]<=0||g.dug>=g.budget)))+'</div>'+row(b('驗水，交付渠圖','testCanal'));
  }
  if(g.mechanic==='balance'){
   const f=C.balanceState(w);
   html=instruction('搬木每走一段，側風都會改變。先左右調整重心，再抬木前進；重心與風相加後須落在容許範圍。')+'<p>第 '+Math.min(6,g.stage+1)+'／6 段 · 側風 <span data-wa-balance-wind>'+signed(f.wind)+'</span> · 重心 '+signed(g.lean)+' · 容許偏差 ±<span data-wa-balance-tolerance>'+num(f.tolerance)+'</span> · 負荷 '+g.fatigue+'／'+g.endurance+'</p><div class="oc-wa-beam" aria-hidden="true"><div style="transform:rotate('+g.lean*5+'deg)"></div></div>'+row(b('← 重心左移','shift',-1,lock(g.lean<=-3))+b('抬木，前進一段','carry')+b('重心右移 →','shift',1,lock(g.lean>=3)))+'<p class="oc-wa-stage-note">目前合成偏移 <span data-wa-balance-total>'+signed(g.lean+f.wind)+'</span>；左右移動不會自動向前。</p>';
  }
  if(g.mechanic==='forum'){
   html=instruction('三條進言通道每輪都會有人加入。點通道接待一人，先用完接待令或清空所有等候者，再開下一輪；優先疏通人多的通道。')+'<p>第 '+Math.min(4,g.round+1)+'／4 輪 · 本輪接待令 '+g.orders+' · 累計聽取 '+g.served+' 人</p>'+grid(3,i=>'<section><h4>'+['市井','朝臣','宗室'][i]+'通道</h4><div class="oc-wa-queues" aria-label="等候'+g.queues[i]+'人">'+Array.from({length:g.queues[i]},()=>'<span></span>').join('')+'</div><p>等候 '+g.queues[i]+' 人</p>'+b('聽取一人進言','dispatch',i,lock(g.queues[i]===0||g.orders<=0))+'</section>',3)+row(b('收束本輪，開下一輪','nextForum',undefined,lock(g.orders>0&&g.queues.some(n=>n>0))))+'<p class="oc-wa-stage-note">四輪至少接待十二人，結束時各通道至多三人；中途超過五人會壅塞。三條通道不代表意見的好壞。</p>';
  }
  if(g.mechanic==='ambush'){
   const f=C.ambushState(w),arrival=g.delays.map((n,i)=>n+f.travel[i]),largest=Math.max(...arrival,1);
   html=instruction('三組伏兵走的距離不同。設定各組延後出發的拍數，讓到位時刻靠近，再一同發令；每輪道路會變。')+'<p>第 '+Math.min(3,g.round+1)+'／3 輪 · 到位時刻的最大差距須 ≤ <span data-wa-ambush-tolerance>'+num(f.tolerance)+'</span> 拍 · 核對 '+g.attempts+'／'+g.budget+' 次</p>'+grid(3,i=>'<section><h4>伏隊 '+(i+1)+'</h4><p>路程 '+f.travel[i]+' 拍</p>'+qty('延後出發',g.delays[i],6,'setDelay',i)+'<p>到位 '+arrival[i]+' 拍</p>'+gauge(arrival[i],largest)+'</section>',3)+row(b('發令，核對三隊到位','spring',undefined,lock(g.attempts>=g.budget)));
  }
  if(g.mechanic==='treaty'){
   const f=C.treatyState(w),names=C.nations||['韓','趙','魏','楚','燕','齊'],goods=C.goodsNames||['穀','馬','鐵'];
   html=instruction('先點一國，再點另一國締成一對。三組都須互換不同貨品，並避開本輪不能互約的組合。已成的一對可在下方撤回。')+'<p>第 '+Math.min(3,g.round+1)+'／3 輪 · 已配 '+g.pairs.length+'／3 組 · 核對 '+g.attempts+'／'+g.budget+' 次</p><div class="oc-wa-treaties">'+names.map((name,i)=>{const pair=g.pairs.find(p=>p.includes(i));return b('<strong>'+name+'</strong><small>持有 '+esc(goods[f.goods[i]])+'</small><small>'+(pair?'已與 '+names[pair.find(n=>n!==i)]+' 配對':selectedCountry===i?'已選，請點另一國':'尚未配對')+'</small>','chooseCountry',i,'class="'+(selectedCountry===i?'is-selected':pair?'is-placed':'')+'" aria-pressed="'+(selectedCountry===i)+'"'+lock(Boolean(pair)));}).join('')+'</div><p class="oc-wa-stage-note">本輪不能互約：'+f.forbidden.map(pair=>pair.map(i=>names[i]).join('↔')).join('、')+'。貨品分配僅為自編交換模型。</p>'+row(g.pairs.map(pair=>b('撤回 '+pair.map(i=>names[i]).join('↔'),'pair',{a:pair[0],b:pair[1]})).join(''))+row(b('履約，進入下一輪','ratify',undefined,lock(g.pairs.length!==3||g.attempts>=g.budget)));
  }
  if(g.mechanic==='drift'){
   const f=C.river(w),free=w.snapshot.config.skills.includes('light')||active('swift');
   html=instruction('先划槳修正一個航道，或停槳休息，再順流一段。水流會再把船推移；接近書簡可收取，碰到障礙會損船。每段最多下槳一次。')+'<p>第 '+Math.min(8,g.stage+1)+'／8 段 · 體力 '+g.energy+' · 護簡 '+g.scrolls+'／至少4 · 船體 '+g.hull+'</p><div class="oc-wa-river">'+grid(3,i=>'<section><h4>'+['左岸','中流','右岸'][i]+'</h4><p>'+(f.scroll===i?'▤ 書簡':'　')+' '+(f.obstacle===i?'▲ 障礙':'　')+'</p><p>'+(g.lane===i?'<span class="oc-wa-pawn" aria-label="我的角色">'+avatar()+'</span>':'≈')+'</p></section>',3)+'</div><p>水流：'+(f.current===0?'平流，不推移':f.current<0?'← 向左推一格':'向右推一格 →')+' · '+(g.paddled?'本段已下槳':'本段尚可下槳')+'</p>'+row(b('← 划向左道','row',-1,lock(g.paddled||g.lane===0||g.energy<=0&&!free))+b('停槳休息＋2體力','row',0,lock(g.paddled))+b('划向右道 →','row',1,lock(g.paddled||g.lane===2||g.energy<=0&&!free)))+row(b('順流一段','drift',undefined,lock(!g.paddled)));
  }
  if(g.mechanic==='archery'){
   html=instruction('點靶盤或調整兩個滑桿瞄準，再按放箭。箭的橫向落點受風與馬背晃動影響；準星是瞄準位置，亮點是當下預估落點。')+'<p>第 '+Math.min(8,g.target+1)+'／8 靶 · 已中 '+g.hits+' · 落空 '+g.misses+'／最多4 · 已射 '+g.shots+' 支</p><div class="oc-wa-aim-board" data-wa-aim tabindex="0" role="group" aria-label="騎射靶盤，可點選瞄準；也可使用下方滑桿"><i data-wa-target-disc></i><span data-wa-reticle>＋</span><b data-wa-impact>●</b></div><p data-wa-wind class="oc-wa-time-note"></p>'+['橫向','高低'].map((title,i)=>'<label class="oc-wa-slider">'+title+'<input type="range" min="0" max="100" step="1" value="'+g.aim[i?'y':'x']+'" data-wa-range="'+(i?'y':'x')+'" aria-label="'+title+'瞄準位置"><output data-wa-output="'+(i?'y':'x')+'">'+g.aim[i?'y':'x']+'</output></label>').join('')+row(b('放箭','fire'))+'<p class="oc-wa-stage-note">按住滑桿拖動，放開後更新瞄準。靶盤可用觸控；所有操作也可用 Tab、方向鍵與 Enter。</p>';
  }
  if(g.mechanic==='locks'){
   const used=g.slots.filter(n=>n!==null),clues=C.keyClues(w);
   html=instruction('先選一把鑰匙，再點門中的空位放入；點已放的鑰匙可收回。每門三色齊全，同一橫排跨三門不能重色；每門第一格還須符合門冠色。')+'<p>已開 '+g.opened.length+'／3 門 · '+(selectedKey===null?'請選鑰匙':'已選 '+color(g.tokens[selectedKey])+'色鑰匙 '+(selectedKey+1))+'</p><div class="oc-wa-pieces">'+g.tokens.map((c,i)=>b(color(c)+' '+(i+1)+(used.includes(i)?'<small>已放入</small>':'<small>選取鑰匙</small>'),'chooseKey',i,'class="'+(selectedKey===i?'is-selected':'')+'"'+lock(used.includes(i)))).join('')+'</div>'+grid(3,door=>'<section><h4>第 '+(door+1)+' 窟 '+(g.opened.includes(door)?'✓':'⌑')+'</h4><p>門冠：'+color(clues[door])+'</p>'+Array.from({length:3},(_,r)=>{const slot=door*3+r,key=g.slots[slot];return b('<small>第 '+(r+1)+' 橫排</small><span class="oc-wa-lock">'+(key===null?'□':color(g.tokens[key]))+'</span>','keySlot',slot,'data-wa-cell="'+slot+'" class="'+(key===null?'':'is-placed')+'"'+lock(g.opened.includes(door)||key===null&&selectedKey===null));}).join('')+b(g.opened.includes(door)?'已開門':'轉動門鎖','unlockDoor',door,lock(g.opened.includes(door)))+'</section>',3);
  }
  if(g.mechanic==='jade'){
   html=instruction('點與空位相鄰的板片滑入，也可把板片拖到空位。將一至八依序排好、空位留在右下，讓玉璧送到指定位置。')+'<p>移動 '+g.moves+'／'+g.budget+' 次 · 玉璧以「璧1」標示</p><div class="oc-wa-route-map">'+grid(9,i=>b(g.board[i]===0?'<small>空位</small>':g.board[i]===1?'<strong>璧 1</strong>':'<strong>'+g.board[i]+'</strong>','slide',i,'data-wa-cell="'+i+'" '+(g.board[i]?'data-wa-drag="'+i+'"':'data-wa-drop="blank"')+' class="'+(g.board[i]===1?'is-target':g.board[i]===0?'is-muted':'')+'"'+lock(!g.board[i]||!near(i,g.blank,3)||g.moves>=g.budget)),3)+'</div><p class="oc-wa-stage-note">目標：1 2 3 ／ 4 5 6 ／ 7 8 空位。只有相鄰空位的板片可動。</p>';
  }
  if(g.mechanic==='twin'){
   const at=g.positions[g.active],other=g.positions[1-g.active],walls=[5,9],goals=[15,14],plateFor={6:2,10:7};
   html=instruction('輪流操縱兩位接應者。每人都要經過兩處任務點，再各到會合口；一人踩住壓板，另一人穿過對應的門，開過的門會保持開啟。')+row([0,1].map(i=>b((g.active===i?'◉ ':'')+'操縱'+['甲','乙'][i]+'使'+(g.delivered[i]?' ✓ 已抵達':''),'selectAgent',i,'aria-pressed="'+(g.active===i)+'"')).join(''))+'<p>步數 '+g.steps+'／'+g.budget+' · 已開 '+g.unlocked.filter(Boolean).length+'／2 門 · '+[0,1].map(i=>['甲','乙'][i]+'使已訪 '+g.visits[i].filter(n=>[3,11].includes(n)).length+'／2 處').join(' · ')+'</p><div class="oc-wa-route-map">'+grid(16,i=>{
    const agents=g.positions.flatMap((p,n)=>p===i?[n]:[]),doorIndex=i===6?0:i===10?1:-1,opened=doorIndex>=0&&g.unlocked[doorIndex],blocked=walls.includes(i)||Object.hasOwn(plateFor,i)&&!opened&&other!==plateFor[i];
    const place=walls.includes(i)?'石牆':i===2?'壓板 A':i===7?'壓板 B':i===6?'門 A'+(opened?' ✓':''):i===10?'門 B'+(opened?' ✓':''):i===3?'任務點 ①':i===11?'任務點 ②':goals.includes(i)?['甲','乙'][goals.indexOf(i)]+'使會合口':'路';
    const text=agents.length?'<span class="oc-wa-pawn" aria-hidden="true">'+avatar()+'</span><small>'+agents.map(n=>['甲','乙'][n]+'使'+(n===g.active?' ◉':'')).join('、')+'</small><small>'+place+'</small>':place;
    return b(text,'walkTwin',i,'data-wa-cell="'+i+'" aria-label="第'+(i+1)+'格 '+attr(agents.map(n=>['甲','乙'][n]+'使').join('、')+' '+place)+'" class="'+(walls.includes(i)?'is-obstacle':i===at?'is-current':agents.length?'is-placed':doorIndex>=0?blocked?'is-danger':'is-path':'')+'"'+lock(!near(at,i)||blocked||g.steps>=g.budget));
   })+'</div><p class="oc-wa-stage-note">壓板 A 開 A 門，壓板 B 開 B 門。兩門都要開啟，兩人各訪任務點後才能完成；兩使可以同格交會。</p>';
  }
  if(g.mechanic==='measures'){
   const f=C.measureState(w),total=g.weights.reduce((n,q,i)=>n+q*f.unit[i],0),count=g.weights.reduce((a,n)=>a+n,0);
   html=instruction('三種砝碼的單位不同。增減砝碼，使總重符合本輪目標，同時不超過枚數限制，再放上天秤校驗。')+'<p>第 '+Math.min(3,g.round+1)+'／3 輪 · 最多 '+f.cap+' 枚</p><div class="oc-wa-scale-pans"><div>標準衡<strong>'+f.target+' 單位</strong></div><div>目前砝碼<strong>'+total+' 單位</strong><small>'+count+'／'+f.cap+' 枚</small></div></div><div class="oc-wa-beam" aria-hidden="true"><div style="transform:rotate('+Math.max(-16,Math.min(16,(total-f.target)*2))+'deg)"></div></div>'+grid(3,i=>qty('每枚 '+f.unit[i]+' 單位',g.weights[i],4,'setWeight',i),3)+row(b('上秤，校驗本輪','weigh'))+'<p class="oc-wa-stage-note">砝碼數值是教學推演設定；本任務練習換算與約束，不能當作出土秦制器物的實測值。</p>';
  }
  host.innerHTML='<section class="oc-wa-board" aria-label="'+esc(p.title)+'"><header class="oc-wa-head"><div class="oc-wa-avatar" aria-hidden="true">'+avatar()+'</div><div><h4>'+esc(p.title)+'</h4><p>'+esc(p.role)+'</p><small>本篇獨立操作 · 原劇情接續進行</small></div></header>'+html+'<p data-wa-hint class="oc-wa-hint" aria-live="polite"></p></section>';
 }
 host.addEventListener('click',e=>{
  const el=e.target.closest?.('[data-wa]');
  if(!el||el.disabled||blocked())return;
  if(Date.now()<suppressUntil)return;
  let value;try{value=el.dataset.v===undefined?undefined:JSON.parse(decodeURIComponent(el.dataset.v));}catch{return;}
  if(el.dataset.wa==='chooseCountry'){
   if(selectedCountry===null)selectedCountry=value;
   else if(selectedCountry===value)selectedCountry=null;
   else{const a=selectedCountry;selectedCountry=null;call('pair',{a,b:value});}
   paint();return;
  }
  if(el.dataset.wa==='chooseKey'){selectedKey=selectedKey===value?null:value;paint();return;}
  if(el.dataset.wa==='keySlot'){
   if(w.campaign.slots[value]!==null)call('keyRemove',value);
   else if(selectedKey!==null){const key=selectedKey;selectedKey=null;call('keyPlace',{key,slot:value});}
   paint();return;
  }
  call(el.dataset.wa,value);
 });
 host.addEventListener('input',e=>{
  const el=e.target.closest?.('[data-wa-range]');if(!el)return;
  if(blocked()){el.value=String(w.campaign.aim[el.dataset.waRange]);return;}
  const output=host.querySelector('[data-wa-output="'+el.dataset.waRange+'"]');if(output)output.textContent=el.value;
 });
 host.addEventListener('change',e=>{
  const el=e.target.closest?.('[data-wa-range]');if(!el)return;
  if(blocked()){el.value=String(w.campaign.aim[el.dataset.waRange]);return;}
  const aim={...w.campaign.aim,[el.dataset.waRange]:Number(el.value)};call('aim',aim);
 });
 const aimPoint=(el,e)=>{const rect=el.getBoundingClientRect();return{x:Math.max(0,Math.min(100,Math.round((e.clientX-rect.left)*100/rect.width))),y:Math.max(0,Math.min(100,Math.round((e.clientY-rect.top)*100/rect.height)))};};
 host.addEventListener('pointerdown',e=>{
  if(blocked())return;
  const aim=e.target.closest?.('[data-wa-aim]'),tile=e.target.closest?.('[data-wa-drag]');
  if(aim){e.preventDefault();dragging={type:'aim',id:e.pointerId,point:aimPoint(aim,e)};host.setPointerCapture?.(e.pointerId);}
  else if(tile&&!tile.disabled){dragging={type:'slide',id:e.pointerId,index:Number(tile.dataset.waDrag),x:e.clientX,y:e.clientY,moved:false};host.setPointerCapture?.(e.pointerId);}
 });
 host.addEventListener('pointermove',e=>{
  if(!dragging||e.pointerId!==dragging.id||blocked())return;
  if(dragging.type==='aim'){
   const chart=host.querySelector('[data-wa-aim]');if(!chart)return;
   dragging.point=aimPoint(chart,e);const cross=host.querySelector('[data-wa-reticle]');cross.style.left=dragging.point.x+'%';cross.style.top=dragging.point.y+'%';
  }else if(Math.hypot(e.clientX-dragging.x,e.clientY-dragging.y)>8)dragging.moved=true;
 });
 host.addEventListener('pointerup',e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  const prior=dragging;dragging=null;
  if(blocked())return;
  if(prior.type==='aim'){call('aim',prior.point);return;}
  if(prior.moved){suppressUntil=Date.now()+250;const drop=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-wa-drop]');if(drop?.dataset.waDrop==='blank')call('slide',prior.index);}
 });
 for(const name of ['pointercancel','lostpointercapture'])host.addEventListener(name,()=>{dragging=null;});
 host.addEventListener('keydown',e=>{
  const aim=e.target.closest?.('[data-wa-aim]');
  if(aim&&w.campaign.mechanic==='archery'){
   if(blocked())return;
   if(e.key==='Enter'||e.key===' '){e.preventDefault();call('fire');return;}
   const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
   if(delta){e.preventDefault();call('aim',{x:Math.max(0,Math.min(100,w.campaign.aim.x+delta[0])),y:Math.max(0,Math.min(100,w.campaign.aim.y+delta[1]))});}
   return;
  }
  const cell=e.target.closest?.('[data-wa-cell]'),cols=w.campaign.mechanic==='jade'?3:4;
  if(!cell||!['canal','jade','twin'].includes(w.campaign.mechanic))return;
  const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key];
  if(delta===undefined)return;
  e.preventDefault();const at=Number(cell.dataset.waCell),to=at+delta;
  if(to<0||Math.abs(at%cols-to%cols)+Math.abs(Math.floor(at/cols)-Math.floor(to/cols))!==1)return;
  const found=[...host.querySelectorAll('[data-wa-cell]')].find(el=>Number(el.dataset.waCell)===to&&!el.disabled);found?.focus({preventScroll:true});
 });
 host.addEventListener('pointerover',e=>{const el=e.target.closest?.('[data-wa-cell]');hover=el?Number(el.dataset.waCell):-1;});
 host.addEventListener('focusin',e=>{const el=e.target.closest?.('[data-wa-cell]');hover=el?Number(el.dataset.waCell):-1;});
 function paint(){
  const g=w.campaign;
  if(!g)return;
  const key=w.status+':'+JSON.stringify(g)+':'+selectedCountry+':'+selectedKey;
  let restoreFocus=null;
  if(key!==signature){
   const focusables=['[data-wa]','[data-wa-range]','[data-wa-aim]'].flatMap(selector=>[...host.querySelectorAll(selector)]),focused=focusables.includes(document.activeElement)?document.activeElement:null,action=focused?.dataset?.wa,value=focused?.dataset?.v,range=focused?.dataset?.waRange,isAim=focused?.dataset?.waAim!==undefined;
   render();signature=key;
   if(focused)restoreFocus={action,value,range,isAim};
  }
  const stopped=blocked();
  if(stopped)dragging=null;
  for(const el of host.querySelectorAll('[data-wa]'))el.disabled=stopped||el.dataset.waLock==='true';
  for(const el of host.querySelectorAll('[data-wa-range]'))el.disabled=stopped;
  if(g.mechanic==='drift'){
   const free=w.snapshot.config.skills.includes('light')||active('swift');
   for(const el of host.querySelectorAll('[data-wa]'))if(el.dataset.wa==='row'){
    const direction=JSON.parse(decodeURIComponent(el.dataset.v));
    el.disabled=stopped||g.paddled||direction!==0&&(g.energy<=0&&!free||g.lane+direction<0||g.lane+direction>2);
   }
  }
  if(restoreFocus&&!stopped){
   const {action,value,range,isAim}=restoreFocus;
   if(action){const buttons=[...host.querySelectorAll('[data-wa]')],same=buttons.find(el=>el.dataset.wa===action&&el.dataset.v===value&&!el.disabled),fallback=buttons.find(el=>el.dataset.wa===action&&!el.disabled);(same||fallback)?.focus({preventScroll:true});}
   else if(range)host.querySelector('[data-wa-range="'+range+'"]')?.focus({preventScroll:true});
   else if(isAim)host.querySelector('[data-wa-aim]')?.focus({preventScroll:true});
  }
  if(g.mechanic==='archery'&&w.status==='playing'&&!g.done){
   const t=C.target(w),disc=host.querySelector('[data-wa-target-disc]'),cross=host.querySelector('[data-wa-reticle]'),impact=host.querySelector('[data-wa-impact]'),wind=host.querySelector('[data-wa-wind]'),aim=dragging?.type==='aim'?dragging.point:g.aim;
   disc.style.cssText='left:'+t.x+'%;top:'+t.y+'%;width:'+t.radius*2+'%;height:'+t.radius*2+'%';
   cross.style.left=aim.x+'%';cross.style.top=aim.y+'%';
   impact.style.left=(aim.x+t.wind+t.motion)+'%';impact.style.top=aim.y+'%';
   wind.textContent='側風 '+signed(t.wind)+' · 馬背晃動 '+signed(Number(t.motion.toFixed(1)))+' · 靶心容許半徑 '+num(t.radius);
  }
  if(g.mechanic==='balance'&&w.status==='playing'&&!g.done){
   const f=C.balanceState(w);
   host.querySelector('[data-wa-balance-wind]').textContent=signed(f.wind);
   host.querySelector('[data-wa-balance-tolerance]').textContent=num(f.tolerance);
   host.querySelector('[data-wa-balance-total]').textContent=signed(g.lean+f.wind);
  }
  if(g.mechanic==='ambush'&&w.status==='playing'&&!g.done)host.querySelector('[data-wa-ambush-tolerance]').textContent=num(C.ambushState(w).tolerance);
  const hints=C.uiHints?C.uiHints(w):[];
  const text=(listening()?'靜候 '+Math.max(1,Math.ceil(w.buffs.listening-6-w.time))+' 秒後可繼續操作。 ':'')+(Array.isArray(hints)?hints.join(' '):String(hints||''));
  const hint=host.querySelector('[data-wa-hint]');if(hint.textContent!==text)hint.textContent=text;
 }
 return{paint};
}
