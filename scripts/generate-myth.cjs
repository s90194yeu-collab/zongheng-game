const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(root,'src/myth/rules.cjs'),'utf8').replace(/^'use strict';/,'').replace('module.exports=','return ');
fs.writeFileSync(path.join(root,'gas/MythRules.gs'),'// Generated from src/myth/rules.cjs. No student data.\nvar MYTH_RULES_=(function(){\n'+src+'\n})();\n');
