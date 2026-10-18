// 選單顯示實際玩法；閱讀分類不再冒充遊戲種類。
function apply(chapters,catalog,drafts){
 for(const c of Object.values(chapters)){
  const games=c.stages.map(s=>s.mission).filter(Boolean),unique=a=>[...new Set(a)];
  const genre=unique(games.map(g=>{const last=g.genre.split('／').at(-1);return /[\u3400-\u9fff]/.test(last)?last:g.title.split('・')[0];})).join('＋');
  const playline=unique(games.map(g=>g.title.split('・')[0])).join(' → '),meta=catalog.find(m=>m.id===c.id);
  Object.assign(c,{genre,playline,gameTypes:unique(games.map(g=>g.genre))});if(meta)Object.assign(meta,{genre,playline,gameTypes:c.gameTypes});if(drafts[c.id]?.meta)Object.assign(drafts[c.id].meta,{genre,playline,gameTypes:c.gameTypes});
 }
}
module.exports={apply};
