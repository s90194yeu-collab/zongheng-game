const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/character/model.cjs'),'utf8');
fs.mkdirSync(path.join(root,'gas'),{recursive:true});
fs.writeFileSync(path.join(root,'gas/OriginalCharacterRules.gs'),'// 自動產生：src/character/model.cjs；純規則，與前端共用。\nvar OC_RULES_=(function(){var module={exports:{}};\n'+source+'\nreturn module.exports;})();\n');
