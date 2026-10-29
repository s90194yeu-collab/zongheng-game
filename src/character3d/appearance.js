// One appearance source is used by the workshop and the playable village.
export const HERO_OUTFITS=Object.freeze(['scholar','traveler','armor']);
export const HERO_TINTS=Object.freeze({jade:'#defff1',ink:'#a1c6ec',amber:'#edcc91',crane:'#f7eee1',plum:'#eba9be',moon:'#c6b4f1',peach:'#fac2bc',sky:'#b7e7f0'});
const HAIR=Object.freeze({ink:'#211a17',chestnut:'#68452d',silver:'#b0b9c5',rose:'#a36270',honey:'#a47a39',violet:'#79608f'});
const SKIN=Object.freeze({warm:'#ffffff',porcelain:'#fff0e4',honey:'#ceaa8d',deep:'#99745f'});

export function heroSelection(appearance={}){
 return {outfit:HERO_OUTFITS.includes(appearance.outfit)?appearance.outfit:'scholar',
  color:Object.hasOwn(HERO_TINTS,appearance.color)?appearance.color:'jade',
  hairColor:Object.hasOwn(HAIR,appearance.hairColor)?appearance.hairColor:'ink',
  skin:Object.hasOwn(SKIN,appearance.skin)?appearance.skin:'warm'};
}
export function isHero(root){let found=false;root.traverse(o=>{if(o.userData?.assetId==='zongheng-hero-v1')found=true;});return found;}
export function applyHeroAppearance(root,appearance={}){
 const look=heroSelection(appearance);let visibleTriangles=0,visibleMeshes=0;
 root.traverse(o=>{
  if(!o.isMesh)return;
  const outfit=o.userData.outfit||'shared';o.visible=outfit==='shared'||outfit===look.outfit;
  if(o.visible){visibleMeshes++;visibleTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(m.name==='Hero_Cloth')m.color.set(HERO_TINTS[look.color]);
   if(m.name==='Hero_Cloth_Shade')m.color.set(HERO_TINTS[look.color]).multiplyScalar(.12);
   if(m.name.startsWith('Hero_Hair'))m.color.set(HAIR[look.hairColor]).multiplyScalar(m.name==='Hero_Hair_Threads'?.55:.22);
   if(m.name==='Hero_Skin')m.color.set(SKIN[look.skin]);
  }
 });
 return {...look,visibleTriangles,visibleMeshes};
}
