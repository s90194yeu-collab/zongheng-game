import Report from '../academy/report.cjs';
function el(tag,text){const n=document.createElement(tag);if(text)n.textContent=text;return n;}
export function buildReport(context){
 const element=el('div'),field=el('textarea'),image=el('img'),note=el('p','正在準備遊戲場景截圖，也可以先填寫說明。');
 let bytes=null,contentType='image/jpeg';
 field.rows=12;
 field.value=['山海異境問題回報','','問題說明：','操作步驟：','預期結果：','實際結果：','','區段：'+context.stage,'流派：'+context.weapon,'保存狀態：'+context.save,'規則版本：'+context.rules,'時間：'+new Date().toLocaleString('zh-TW'),'瀏覽器：'+navigator.userAgent].join('\n');
 image.alt='問題回報的遊戲截圖';image.hidden=true;image.style.cssText='display:block;max-width:100%;max-height:230px;border-radius:8px;margin:12px 0';
 function capture(data,type='image/jpeg'){
  if(!element.isConnected||typeof data!=='string'||data.length>6000000||!/^[A-Za-z0-9+/=]+$/.test(data))return;
  bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));contentType=type;image.src='data:'+type+';base64,'+data;image.hidden=false;note.textContent='已附上截圖，可移除或改用自己的圖片。';
 }
 const upload=el('input');upload.type='file';upload.accept='image/png,image/jpeg,image/webp';upload.setAttribute('aria-label','附上問題截圖');
 upload.onchange=()=>{const file=upload.files?.[0];if(!file)return;if(file.size>4*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type)){context.notify('請選擇 4 MB 以內的 JPG、PNG 或 WebP 圖片。');return;}const reader=new FileReader();reader.onload=()=>capture(String(reader.result).split(',')[1],file.type);reader.readAsDataURL(file);};
 const remove=el('button','移除截圖');remove.onclick=()=>{bytes=null;image.hidden=true;image.removeAttribute('src');upload.value='';note.textContent='這份回報不附截圖。';};
 const download=el('button','下載含附件的郵件草稿');download.className='myth-primary';
 download.onclick=()=>{const draft=Report.eml({subject:'縱橫鼎業｜山海異境問題回報',body:field.value,image:bytes,contentType});const url=URL.createObjectURL(new Blob([draft],{type:'message/rfc822'})),a=el('a');a.href=url;a.download='縱橫鼎業_問題回報.eml';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 const mail=el('button','開啟純文字郵件草稿');mail.onclick=()=>{location.href='mailto:'+Report.RECIPIENT+'?subject='+encodeURIComponent('縱橫鼎業｜山海異境問題回報')+'&body='+encodeURIComponent(field.value);};
 element.append(el('p','收件人：'+Report.RECIPIENT+'。說明與圖片可先檢查、修改，再自行寄出。遊戲場景截圖不含帳號。'),field,note,image,upload,remove,download,mail);
 return {element,capture};
}
