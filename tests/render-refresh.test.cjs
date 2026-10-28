const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..');
function extract(file,name){const s=fs.readFileSync(path.join(root,file),'utf8'),ast=acorn.parse(s,{sourceType:'module',ecmaVersion:'latest'});let result;function walk(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&n.id.name===name)result=s.slice(n.start,n.end);for(const x of Object.values(n))if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')walk(x);}walk(ast);assert(result,file+':'+name);return result;}
function evaluate(c,code){vm.createContext(c);vm.runInContext(code,c);return c;}
function world(){let renders=0,scheduled=0;const c={disposed:false,frame:0,requestAnimationFrame:()=>++scheduled,clock:{last:0},document:{hidden:false},visible:true,lost:false,artifactDialog:{open:false},position:{x:0,z:0},keys:new Set(['right']),path:[],modalOpen:()=>false,guide:{hidden:true},place:'village',quality:'high',hasMoved:true,animateMotion(){},routeTarget:null,toastUntil:0,museum:{id:'cq'},media:{matches:true},actor:{rotation:{y:0},position:{set(){}}},actorShadow:{position:{set(){}}},mixer:{update(){}},resetCamera(){},proximity(){},updateLabels(){},scene:{},camera:{},renderer:{render(){renders++;},info:{render:{calls:2}}},move:(p,d)=>({x:p.x+d.x,z:p.z+d.z})};evaluate(c,extract('src/village/app.js','tick'));return{c,renders:()=>renders,scheduled:()=>scheduled};}
function artifact(){let renders=0,elapsed=0;const c={disposed:false,frame:0,requestAnimationFrame:()=>1,last:0,visible:true,expanded:true,opening:1,reduced:true,panels:[],rotate:false,controls:{update(){}},renderer:{render(){renders++;}},scene:{},camera:{}};evaluate(c,extract('src/village/artifacts.js','tick'));return{c,renders:()=>renders};}
function character(){let renders=0,elapsed=0;const c={disposed:false,frame:0,requestAnimationFrame:()=>1,previous:0,document:{hidden:false},visible:true,lost:false,paused:false,reduced:false,mixer:{update(dt){elapsed+=dt;}},controls:{update(){}},draw(){renders++;}};evaluate(c,extract('src/character3d/preview.js','tick'));return{c,renders:()=>renders,elapsed:()=>elapsed};}
test('三個真正3D視圖在60／120／144Hz回呼都逐次繪製，不以24或30fps丟棄回呼',()=>{
 for(const hz of [60,120,144])for(const make of [world,artifact,character]){const h=make();for(let i=1;i<=hz;i++)h.c.tick(i*1000/hz);assert.equal(h.renders(),hz,make.name+':'+hz);}
});
test('解除繪製限制後，村莊每秒移動距離及策士動畫時間仍按經過時間計算',()=>{
 for(const hz of [30,60,120,144]){const w=world(),a=character();for(let i=1;i<=hz;i++){w.c.tick(i*1000/hz);a.c.tick(i*1000/hz);}assert(Math.abs(w.c.position.x-3.5)<.0001,'world '+hz);assert(Math.abs(a.elapsed()-1)<.0001,'character '+hz);}
});
test('畫面不可見或資源已釋放時仍停止繪製，不取消背景與關閉保護',()=>{
 for(const make of [world,artifact,character]){for(const state of ['visible','disposed']){const h=make();h.c[state]=state==='disposed';h.c.tick(100);assert.equal(h.renders(),0,make.name+':'+state);}}
 for(const make of [world,character]){const h=make();h.c.document.hidden=true;h.c.tick(100);assert.equal(h.renders(),0,make.name+':hidden');}
});
test('投影館牌使用ResizeObserver更新的尺寸，不在逐個館牌寫入樣式時同步讀取版面',()=>{
 let reads=0;const stage={get clientWidth(){reads++;return 1000;},get clientHeight(){reads++;return 600;}};
 const c={stage,viewport:{width:1000,height:600},camera:{},labelVector:{x:.2,y:.3,z:.5,set(){return this;},project(){return this;}}};evaluate(c,extract('src/village/app.js','placeLabel'));const label={style:{}};for(let i=0;i<7;i++)c.placeLabel(label,1,2,3);assert.equal(reads,0);assert(label.style.transform.includes('600px,210px'));assert.equal(label.hidden,false);
});
