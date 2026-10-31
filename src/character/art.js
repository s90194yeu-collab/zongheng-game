// 個人角色同行共用美術。只讀取場景與身份，不參與命令、計分或存檔。
const MATERIALS = {
 stone:['beacon','tunnel','scouts','retreat','dispatch','jump','relay','maze','ambush','locks'],
 water:['ferry','bridge','flood','canal','drift','twin'],
 bronze:['drums','rubbing','chariot','seal','flags','balance','archery','measures','overlay'],
 paper:['slips','school','forum','treaty','memory','audit','schedule','collation'],
 wood:['baggage','disguise','paths','convoy','city','lift','lacquer','truss','untangle','escort'],
 jade:['armistice','growth','jade','hollow','lens','leap','strategy']
};
export function artDirection(world, R){
 const p=R.pilot(world.id),mechanic=world.campaign?.mechanic||world.kind;
 const material=Object.keys(MATERIALS).find(k=>MATERIALS[k].includes(mechanic))||'stone';
 return {scene:p.scene,mechanic,material,title:p.title,name:p.name,role:p.role,quote:p.quote||'',source:p.source||''};
}
export function sceneURL(key){
 const file=typeof window!=='undefined'&&window.ZH_STATIC_MEDIA?.[key];
 return file&&typeof ZH_STATIC_URL==='function'?ZH_STATIC_URL(file):'';
}
// 取消人物卡片的矩形背景；保留原配件、衣飾、髮型與性別。
export function fieldDoll(svg){
 if(typeof svg!=='string')return '';
 if(svg.includes('data-oc-field="true"'))return svg;
 const start=svg.indexOf('<g class="pl-doll-actor"');
 if(start<0)return svg;
 const open=svg.slice(0,svg.indexOf('>')).replace('<svg','<svg data-oc-field="true"')+'>';
 const tint=(hex,amount)=>'#'+[1,3,5].map(i=>{const n=parseInt(hex.slice(i,i+2),16);return Math.round(amount>0?n+(255-n)*amount:n*(1+amount)).toString(16).padStart(2,'0');}).join('');
 let actor=svg.slice(start),defs='';
 for(const hex of new Set([...actor.matchAll(/fill="(#[0-9a-f]{6})"/gi)].map(m=>m[1]))){
  const id='oc-look-'+hex.slice(1);defs+='<linearGradient id="'+id+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="'+tint(hex,.16)+'"/><stop offset=".45" stop-color="'+hex+'"/><stop offset="1" stop-color="'+tint(hex,-.2)+'"/></linearGradient>';
  actor=actor.replaceAll('fill="'+hex+'"','fill="url(#'+id+')"');
 }
 return open+'<defs>'+defs+'</defs><ellipse cx="90" cy="248" rx="43" ry="7" fill="#091b28" opacity=".35"/>'+actor;
}
export function illustratedStage({world,R,esc,avatar}){
 const a=artDirection(world,R),url=sceneURL(a.scene);
 return '<header class="oc-tableau" data-art-material="'+a.material+'" data-art-mechanic="'+esc(a.mechanic)+'">'+
 (url?'<img class="oc-tableau-scene" src="'+esc(url)+'" alt="" decoding="async">':'')+
 '<div class="oc-tableau-copy"><span class="oc-tableau-kicker">'+esc(a.name)+' · 角色同行</span><h4>'+esc(a.title)+'</h4><p>'+esc(a.role)+'</p></div>'+
 '<div class="oc-tableau-actor" aria-hidden="true">'+fieldDoll(avatar())+'</div><span class="oc-tableau-seal" aria-hidden="true">'+esc(a.name.slice(0,1))+'</span></header>';
}
// 物件圖形沿用遊戲的可編輯向量系統；文字與操作入口始終保留。
const P={
 scroll:'<path d="M16 20h47v49H16z" fill="#dbc79a"/><path d="M14 16h7v58h-7zM60 16h7v58h-7z" fill="#936543"/><path d="M26 28h27M26 36h27M26 44h27M26 52h20M26 61h27" stroke="#806f4d"/><path d="M39 17v56" stroke="#b39863"/><circle cx="40" cy="52" r="7" fill="#994d3c"/>',
 boat:'<path d="M8 52q30 18 64 0L60 68H23Z" fill="#986a43"/><path d="M13 55l53 3M24 61h36M39 52V13" stroke="#e7c797"/><path d="M42 15q25 12 16 32H42Z" fill="#d9cfaa"/><path d="M43 21l15 6M43 31l17 5M43 42l16 3" stroke="#b39e73"/><path d="M6 72q12-6 24 0t24 0t22 0" fill="none" stroke="#81b8b7"/>',
 lantern:'<path d="M39 7v12M22 19h34M25 62h28M39 64v12" stroke="#d6b875" stroke-width="3"/><path d="M22 24Q8 44 25 61H54Q72 42 55 24Z" fill="#d79e59"/><path d="M27 24q-9 20 0 37M39 24v37M51 24q10 20 0 37" stroke="#f6d69b"/><path d="M21 23h36M24 61h30" stroke="#79573c" stroke-width="4"/>',
 gate:'<path d="M10 24h60v48H10Z" fill="#647b79"/><path d="M7 24L17 12h9v8h10v-8h10v8h10v-8h9l8 12" fill="#8e9c89"/><path d="M25 71V47q0-22 30 0v24" fill="#203b41"/><path d="M30 70V45M39 70V40M48 70V45M18 32h10m21 0h14M12 41h10m36 0h13M13 55h11m33 0h13" stroke="#d2bd87"/>',
 drum:'<ellipse cx="40" cy="56" rx="29" ry="13" fill="#574339"/><path d="M12 28v26q28 27 56 0V28Z" fill="#984b3b"/><ellipse cx="40" cy="27" rx="28" ry="14" fill="#e4cf9a"/><ellipse cx="40" cy="27" rx="23" ry="10" fill="none" stroke="#a07b49"/><path d="M19 37v18M30 41v19M43 41v21M57 37v20M7 9l43 27M74 7L34 36" stroke="#d9b67e" stroke-width="3"/>',
 bronze:'<path d="M22 24h36l-3 34q-14 14-29 0Z" fill="#809b8e"/><path d="M18 22h44v7H18Z" fill="#c0b87c"/><path d="M25 57l-5 16M53 57l6 16M18 31Q1 25 10 46h14M62 31q17-6 9 15H57" fill="none" stroke="#a7b590" stroke-width="5"/><path d="M30 36h18v15H30Z M34 40h10v7H34Z" fill="none" stroke="#d9cc96"/><path d="M27 16v-5m25 5v-5" stroke="#a7b590"/>',
 bow:'<path d="M24 9Q76 41 24 73" fill="none" stroke="#bb8958" stroke-width="6"/><path d="M24 9v64M8 40h62m-9-7 10 7-10 7M10 35l8 5-8 5" fill="none" stroke="#e4d3ac" stroke-width="2"/><path d="M44 28l5-3M49 34l5-2M48 49l5 2" stroke="#6c493b" stroke-width="3"/>',
 cart:'<path d="M12 39h54l-5 22H21Z" fill="#926447"/><path d="M17 39V25h43v14M27 26v30m20-30v30M13 47h50M64 44l12-8" stroke="#d4b27c" stroke-width="3"/><circle cx="26" cy="64" r="10" fill="#3f4240" stroke="#c6ac7a" stroke-width="3"/><circle cx="57" cy="64" r="10" fill="#3f4240" stroke="#c6ac7a" stroke-width="3"/><path d="M26 56v16m-8-8h16M57 56v16m-8-8h16" stroke="#b2a383"/>',
 flag:'<path d="M20 8v66M12 74h17" stroke="#d2b57f" stroke-width="3"/><path d="M22 12q22-10 45 2L55 31l10 16q-24-12-43-3Z" fill="#9d4e3c"/><path d="M26 16q17-6 33 0M26 38q17-6 30 0" stroke="#e9c88b"/><path d="M37 21v12m-6-6h13" stroke="#daba7e" stroke-width="3"/>',
 jade:'<path d="M40 8L66 22l4 30-30 21L10 52l4-30Z" fill="#719d89" stroke="#ccdab1" stroke-width="2"/><path d="M40 17l20 10 3 22-23 16-23-16 3-22Z" fill="none" stroke="#b9ceb0"/><circle cx="40" cy="40" r="13" fill="#173d3c" stroke="#b9ceb0" stroke-width="3"/><path d="M23 25l5 4m25-4-5 4M25 53l5-4m23 4-5-4" stroke="#d5dfbe"/>',
 brush:'<path d="M22 62L56 10" stroke="#b29261" stroke-width="8"/><path d="M23 59L8 75q20-2 21-13" fill="#333f3e"/><path d="M28 50l7 5M50 17l7 5" stroke="#dec596" stroke-width="3"/><path d="M44 65h26v8H40Z" fill="#3d4d4d" stroke="#8a9b88"/><ellipse cx="55" cy="63" rx="14" ry="4" fill="#1a3035"/>',
 bridge:'<path d="M6 60Q40 10 74 60L66 65Q40 29 14 65Z" fill="#8f8170" stroke="#d3c29b" stroke-width="2"/><path d="M14 53v-20m12 5V20m14 12V15m14 23V20m12 33V33M12 35Q40 2 68 35" fill="none" stroke="#c5b087" stroke-width="3"/><path d="M6 73q12-6 24 0t24 0t22 0" fill="none" stroke="#83b6b0"/>',
 tree:'<path d="M37 69l3-40 6 40M40 46L22 31m20 9 17-16" stroke="#9a7355" stroke-width="5"/><path d="M16 36Q-1 16 24 16Q23-3 42 12Q65-4 63 20Q88 22 65 41Q49 52 39 37Q27 52 16 36Z" fill="#78957a" stroke="#b4b797" stroke-width="2"/><path d="M14 73q27-12 53 0" fill="#4b6d5b"/>',
 scale:'<path d="M40 14v53M22 70h36M8 25h64M40 12l-5 9h10Z" stroke="#cab47c" fill="#ae9567" stroke-width="3"/><path d="M16 27L6 52h23L18 27m45 0L51 52h24L65 27" fill="none" stroke="#d7c797"/><path d="M5 52q12 20 25 0M50 52q13 20 26 0" fill="#849d90" stroke="#c9c599"/>',
 lock:'<path d="M24 35V22q16-24 32 0v13" stroke="#c0ad7a" fill="none" stroke-width="7"/><path d="M17 32h47v34H17Z" fill="#8b9b84" stroke="#d2c28e" stroke-width="2"/><path d="M23 38h35v22H23Z" fill="none" stroke="#c3b37d"/><circle cx="40" cy="46" r="5" fill="#203d3b"/><path d="M38 49v8h4v-8" fill="#203d3b"/>',
 fish:'<path d="M9 42q25-35 50 0Q33 70 9 42Z" fill="#9cbdaf" stroke="#d9dfbd" stroke-width="2"/><path d="M58 42l15-18v34Z" fill="#70978e"/><path d="M29 25l9-13 9 14m-17 29 11 12 5-13" fill="#789f92"/><circle cx="21" cy="39" r="3" fill="#193b40"/><path d="M31 31q-7 11 1 22m8-22q-7 11 1 22m8-19q-5 8 1 15" fill="none" stroke="#d2debf"/>',
 house:'<path d="M18 37h44v32H18Z" fill="#aa8a62"/><path d="M7 37L40 10l33 27-10 6-23-18-23 18Z" fill="#517572" stroke="#b9c4a4" stroke-width="2"/><path d="M32 69V47h16v22M22 46h7v11h-7m30-11h7v11h-7" fill="#314b4d"/><path d="M16 70h49M22 39h36" stroke="#d4bd8b" stroke-width="3"/>',
 wheel:'<circle cx="40" cy="42" r="28" fill="#4a635e" stroke="#ba9c66" stroke-width="5"/><circle cx="40" cy="42" r="20" fill="none" stroke="#d5bc87"/><path d="M40 16v52M14 42h52M22 24l36 36m-36 0 36-36" stroke="#bb9f6d" stroke-width="3"/><circle cx="40" cy="42" r="7" fill="#d9c18d"/>'
};
export function propIcon(type, className='oc-prop'){
 const shape=P[type]||P.scroll;
 return '<svg class="'+className+'" viewBox="0 0 80 80" aria-hidden="true" focusable="false"><ellipse cx="40" cy="74" rx="31" ry="4" fill="#071e2a" opacity=".3"/><g stroke-linejoin="round" stroke-linecap="round">'+shape+'</g></svg>';
}
const ACTION_PROPS={fireBeacon:'lantern',toggleSignal:'lantern',dismissBeacon:'lantern',testTunnel:'gate',markScout:'flag',strikeDrum:'drum',selectPack:'cart',crossFerry:'boat',crossBridge:'bridge',stepRetreat:'flag',sendDispatch:'scroll',turnSeal:'bronze',ink:'brush',pullRein:'wheel',sealPeace:'jade',linkSource:'scroll',dress:'house',passDisguise:'gate',choosePeg:'scroll',sow:'tree',harvest:'tree',release:'bridge',dig:'bridge',testCanal:'bridge',weigh:'scale',nextForum:'scroll',spring:'bow',ratify:'scroll',row:'boat',fire:'bow',chooseKey:'lock',unlockDoor:'lock',carry:'jade',walkTwin:'gate',pair:'scale',rotate:'bronze',verify:'bronze',jump:'bridge',load:'boat',sail:'boat',relay:'gate',commitPath:'flag',drive:'cart',flag:'flag',walk:'lantern',place:'house',loadScroll:'scroll',boardLift:'wheel',leaveLift:'scroll',testVessel:'bronze',coat:'brush',capture:'fish',showPattern:'scroll',recallStep:'scroll',land:'bridge',chooseSheet:'scroll',verifyOverlay:'scroll',recordFinding:'brush',verifyAudit:'scale',toggleBeam:'bridge',testTruss:'bridge',chooseKnot:'wheel',testWeb:'wheel',publishBooks:'scroll',receiveCart:'cart',driveCart:'cart'};
export function controlArt(name){return ACTION_PROPS[name]?propIcon(ACTION_PROPS[name]):'';}
export const ART_MATERIALS=MATERIALS;
export function pipeIcon(mask){
 const paths=[[1,'M40 40V5'],[2,'M40 40H75'],[4,'M40 40V75'],[8,'M40 40H5']].filter(([bit])=>mask&bit).map(([,d])=>'<path d="'+d+'"/>').join('');
 return '<svg class="oc-pipe" viewBox="0 0 80 80" aria-hidden="true"><g fill="none" stroke-linecap="square"><g stroke="#223a3c" stroke-width="24">'+paths+'</g><g stroke="#c0b087" stroke-width="18">'+paths+'</g><g stroke="#6f948b" stroke-width="8">'+paths+'</g></g><circle cx="40" cy="40" r="7" fill="#7d9e90"/></svg>';
}
export function fieldArt(crop){
 const rice=Array.from({length:7},(_,i)=>{const x=12+i*9;return '<path d="M'+x+' 70q-4-23 4-39m-1 17-10-8m9 18 9-12"/><ellipse cx="'+(x+4)+'" cy="31" rx="3" ry="8" fill="#d7c681"/>';}).join('');
 return '<svg class="oc-field-illustration" viewBox="0 0 90 80" aria-hidden="true"><path d="M3 72l18-22h53l13 22Z" fill="#7e7e54"/><path d="M8 69h71M13 61h62M22 53l-7 18m25-18-3 18m19-18 2 18m11-18 7 18" stroke="#b6b58b" fill="none"/><g stroke="#a7c18e" stroke-width="2" fill="none">'+(crop===0?rice:crop===1?Array.from({length:5},(_,i)=>'<path d="M'+(16+i*14)+' 66V37q-17-20 0-9q18-12 0 9"/>').join(''):'')+'</g></svg>';
}
