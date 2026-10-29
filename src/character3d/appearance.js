// One appearance source is used by the workshop and the playable village.
export const HERO_OUTFITS=Object.freeze(['scholar','traveler','armor']);
export const HERO_TINTS=Object.freeze({jade:'#defff1',ink:'#a1c6ec',amber:'#edcc91',crane:'#f7eee1',plum:'#eba9be',moon:'#c6b4f1',peach:'#fac2bc',sky:'#b7e7f0'});
const HAIR=Object.freeze({ink:'#211a17',chestnut:'#68452d',silver:'#b0b9c5',rose:'#a36270',honey:'#a47a39',violet:'#79608f'});
const SKIN=Object.freeze({warm:'#ffffff',porcelain:'#fff0e4',honey:'#ceaa8d',deep:'#99745f'});
const ANIME_COLORS=Object.freeze({jade:'#49b7a2',ink:'#5d88b5',amber:'#d3a45d',crane:'#b9cfdb',plum:'#ca7e9e',moon:'#a794d3',peach:'#e6a0a8',sky:'#7dc4d6'});
const ANIME_HAIR=Object.freeze({ink:'#344665',chestnut:'#947052',silver:'#c9d7e5',rose:'#ce8da5',honey:'#d6b46e',violet:'#a898d1'});
const ANIME_SKIN=Object.freeze({warm:'#f4d3b8',porcelain:'#ffe5d1',honey:'#d0a07b',deep:'#aa7d5d'});

export function heroSelection(appearance={}){
 return {body:appearance.body==='female'?'female':'male',outfit:HERO_OUTFITS.includes(appearance.outfit)?appearance.outfit:'scholar',
  color:Object.hasOwn(HERO_TINTS,appearance.color)?appearance.color:'jade',
  hairColor:Object.hasOwn(HAIR,appearance.hairColor)?appearance.hairColor:'ink',
  skin:Object.hasOwn(SKIN,appearance.skin)?appearance.skin:'warm'};
}
export function isHero(root){let found=false;root.traverse(o=>{if(['zongheng-hero-v1','zongheng-anime-v1'].includes(o.userData?.assetId))found=true;});return found;}
export function heroMetadata(object){
 const result={};for(let o=object;o;o=o.parent)for(const key of ['assetId','body','outfit'])if(result[key]===undefined&&o.userData?.[key]!==undefined)result[key]=o.userData[key];
 return result;
}
export function applyHeroAppearance(root,appearance={}){
 let modelBody;root.traverse(o=>{if(o.userData?.assetId==='zongheng-anime-v1'&&['male','female'].includes(o.userData.body))modelBody=o.userData.body;});
 const look=heroSelection({...appearance,...(modelBody?{body:modelBody}:{})});let visibleTriangles=0,visibleMeshes=0;
 root.traverse(o=>{
  if(!o.isMesh)return;
  const outfit=heroMetadata(o).outfit||'shared';o.visible=outfit==='shared'||outfit===look.outfit;
  if(o.visible){visibleMeshes++;visibleTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(m.name==='Hero_Cloth')m.color.set(HERO_TINTS[look.color]);
   if(m.name==='Hero_Cloth_Shade')m.color.set(HERO_TINTS[look.color]).multiplyScalar(.12);
   if(m.name.startsWith('Hero_Hair'))m.color.set(HAIR[look.hairColor]).multiplyScalar(m.name==='Hero_Hair_Threads'?.55:.22);
   if(m.name==='Hero_Skin')m.color.set(SKIN[look.skin]);
   if(m.name==='Anime_Cloth'||m.name==='Anime_Armor')m.color.set(ANIME_COLORS[look.color]).multiplyScalar(m.name==='Anime_Armor'?.72:1);
   if(m.name.startsWith('Anime_Hair'))m.color.set(ANIME_HAIR[look.hairColor]);
   if(m.name==='Anime_Face')m.color.set(SKIN[look.skin]);
   if(m.name==='Anime_Skin')m.color.set(ANIME_SKIN[look.skin]);
  }
 });
 return {...look,visibleTriangles,visibleMeshes};
}
