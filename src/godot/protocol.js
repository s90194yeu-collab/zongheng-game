export const PROTOCOL='zh-godot-v1';
const sets={body:['male','female'],outfit:['scholar','traveler','armor'],color:['jade','ink','amber','crane','plum','moon','peach','sky'],skin:['warm','porcelain','honey','deep'],hairColor:['ink','chestnut','silver','rose','honey','violet']};
export function safeAppearance(value={}){return Object.fromEntries(Object.entries(sets).map(([key,values])=>[key,values.includes(value[key])?value[key]:(key==='skin'?'warm':values[0])]));}
export function validEvent(event,{source,origin,channel}){const d=event?.data;return event.source===source&&event.origin===origin&&!!d&&d.protocol===PROTOCOL&&d.channel===channel&&typeof d.type==='string';}
export function chapterAllowed(catalog,id,canPlay){const c=catalog.find(c=>c.id===id);return !!c&&c.status==='ready'&&!c.legacyOnly&&canPlay(id);}
