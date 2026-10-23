const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..');
// GAS 與瀏覽器使用同一份 bundled 純規則，包括春秋、戰國與楚漢同行模組。
const source=esbuild.buildSync({entryPoints:[path.join(root,'src/character/model.cjs')],bundle:true,format:'cjs',platform:'neutral',write:false,target:'es2020',charset:'utf8',legalComments:'none'}).outputFiles[0].text;
fs.mkdirSync(path.join(root,'gas'),{recursive:true});
fs.writeFileSync(path.join(root,'gas/OriginalCharacterRules.gs'),'// 自動產生：src/character/model.cjs 與相依純規則；與前端共用。\nvar OC_RULES_=(function(){var module={exports:{}};\n'+source+'\nreturn module.exports;})();\n');
