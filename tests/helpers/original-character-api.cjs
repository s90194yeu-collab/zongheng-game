const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
module.exports=function harness(){
 const tables=new Map(),writes=[];let email='teacher@school.test',uuid=0;
 const ctx={console,Math,Date,JSON,Number,Object,Array,Set,Map,Error,
  Utilities:{getUuid:()=>String(++uuid)},paUser_:()=>({email}),paEmail_:x=>String(x).toLowerCase(),paLock_:fn=>fn(),nowStr_:()=> '2026-10-22 12:00:00',
  pfJson_:(x,f)=>{try{return JSON.parse(x);}catch{return f;}},pfRead_:e=>({email:e}),pfPublic_:p=>({nickname:p.email==='teacher@school.test'?'測試同行者':'另一同行者',avatarId:'ink',appearance:null}),
  pfRows_:name=>(tables.get(name)||[]).slice(1),pfSheet_:(name,headers)=>{if(!tables.has(name))tables.set(name,[headers]);const rows=tables.get(name);return{getLastRow:()=>rows.length,getRange:(row,col,h,w)=>({setNumberFormat(){return this;},setValues(values){for(let i=0;i<h;i++){rows[row-1+i]=rows[row-1+i]||[];for(let j=0;j<w;j++)rows[row-1+i][col-1+j]=values[i][j];}writes.push(name);return this;}})};}};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'gas/OriginalCharacterRules.gs'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'gas/OriginalCharacterApi.gs'),'utf8'),ctx);
 return {ctx,tables,writes,user:v=>email=v};
};
