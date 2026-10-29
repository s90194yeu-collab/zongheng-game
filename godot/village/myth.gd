extends "res://village.gd"

# Actual single-player combat. No student identity or cloud credentials enter this scene.
var mode = "lobby"
var level_root: Node3D
var decor: Node3D
var models = {}
var mats = {}
var enemies: Array = []
var hazards: Array = []
var projectiles: Array = []
var transient: Array = []
var pillars: Array = []
var pickups: Array = []
var display_models: Array = []
var weapon_node: Node3D
var skeleton: Skeleton3D
var arm_bones: Array = []
var health = 600.0
var max_health = 600.0
var energy = 100.0
var max_energy = 100.0
var shield = 0.0
var invulnerable = 0.0
var cooldowns = [0.0,0.0,0.0]
var attack_cd = 0.0
var combo = 0
var attack_pose = 0.0
var attack_total = .45
var dash_time = 0.0
var dash_direction = Vector3.ZERO
var regen_delay = 0.0
var combat_pressed = false
var auto_attack = false
var selected: Dictionary = {}
var run_data = {}
var weapon = "sword"
var difficulty = "guided"
var abilities = []
var stats = {}
var weapon_level = 1
var stage = 0
var phase = 1
var active_time = 0.0
var hits_taken = 0
var kills = 0
var lamp_count = 0
var lit_lamps = [false,false]
var lamp_nodes: Array = []
var lamp_rings: Array = []
var shield_window = 0.0
var optional = {"creek":false,"cores":[]}
var status = "ready"
var checkpoint = 0
var feedback_time = 0.0
var nearest_object = ""
var museum_slots = []
var focus_at = null
var anchor = null
var rng = RandomNumberGenerator.new()

func _ready():
 Engine.max_fps = 0
 var environment = WorldEnvironment.new()
 environment.environment = Environment.new()
 environment.environment.background_mode = Environment.BG_COLOR
 environment.environment.background_color = Color("#d8e5d5")
 environment.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 environment.environment.ambient_light_color = Color("#fff1d4")
 environment.environment.ambient_light_energy = .8
 environment.environment.tonemap_mode = Environment.TONE_MAPPER_LINEAR
 add_child(environment)
 var sun = DirectionalLight3D.new()
 sun.rotation_degrees = Vector3(-55,-30,0)
 sun.light_color = Color("#fff1d0")
 sun.light_energy = 1.0
 sun.shadow_enabled = false
 add_child(sun)
 level_root = Node3D.new()
 add_child(level_root)
 player = CharacterBody3D.new()
 player.name = "Player"
 player.floor_snap_length = .3
 var capsule = CollisionShape3D.new()
 capsule.shape = CapsuleShape3D.new()
 capsule.shape.radius = .3
 capsule.shape.height = 1.6
 capsule.position.y = .8
 player.add_child(capsule)
 add_child(player)
 camera = Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.current = true
 camera.far = 180
 add_child(camera)
 zoom_size = 12.8
 yaw = .3
 elevation = .67
 update_character()
 equip_weapon()
 build_forest()
 player.position = Vector3(0,.15,25)
 if OS.has_feature("web"):
  bridge = JavaScriptBridge.get_interface("ZH_GODOT")
  callback_ref = JavaScriptBridge.create_callback(receive)
  bridge.register(callback_ref)
 send({"type":"ready","mode":"myth"})

func material(color:String,alpha=1.0):
 var k = color+str(alpha)
 if mats.has(k):return mats[k]
 var m = StandardMaterial3D.new()
 m.albedo_color = Color(color)
 m.albedo_color.a = alpha
 m.roughness = .9
 m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
 if alpha<1:m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
 mats[k] = m
 return m

func painted_ground(low:String,high:String,density:float):
 var shader=Shader.new()
 shader.code="shader_type spatial;render_mode unshaded;varying vec3 world;uniform vec4 low_color:source_color;uniform vec4 high_color:source_color;uniform float density=1.0;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0)),f.x),f.y);}void vertex(){world=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;}void fragment(){float v=n(world.xz*density)*0.65+n(world.xz*density*5.0)*0.35;ALBEDO=mix(low_color.rgb,high_color.rgb,v);ROUGHNESS=1.0;}"
 var m=ShaderMaterial.new();m.shader=shader;m.set_shader_parameter("low_color",Color(low));m.set_shader_parameter("high_color",Color(high));m.set_shader_parameter("density",density)
 return m

func shape_mesh(shape:Mesh,at:Vector3,color:String,parent:Node=null,alpha=1.0):
 var node = MeshInstance3D.new()
 node.mesh = shape
 node.material_override = material(color,alpha)
 node.position = at
 (parent if parent else level_root).add_child(node)
 return node

func box(at:Vector3,size:Vector3,color:String,solid=false):
 var mesh = BoxMesh.new()
 mesh.size = size
 var node = shape_mesh(mesh,at,color)
 if solid:
  var body = StaticBody3D.new()
  var collision = CollisionShape3D.new()
  collision.shape = BoxShape3D.new()
  collision.shape.size = size
  body.add_child(collision)
  body.position = at
  level_root.add_child(body)
 return node

func disc(at:Vector3,radius:float,color:String,alpha=1.0,parent:Node=null):
 var mesh = CylinderMesh.new()
 mesh.top_radius = radius
 mesh.bottom_radius = radius
 mesh.height = .025
 mesh.radial_segments = 24
 return shape_mesh(mesh,at,color,parent,alpha)

func model(id:String,parent:Node,at:Vector3,scale_value=1.0):
 if not models.has(id):models[id]=load("res://assets/qingqiu-"+id+".glb")
 var node = models[id].instantiate()
 parent.add_child(node)
 node.position = at
 node.scale = Vector3.ONE*scale_value
 paint_world(node)
 return node

func instanced_trees(points:Array):
 if not models.has("tree"):models.tree=load("res://assets/qingqiu-tree.glb")
 var template = models.tree.instantiate()
 level_root.add_child(template)
 paint_world(template)
 for mesh in template.find_children("*","MeshInstance3D",true,false):
  var mm = MultiMesh.new()
  mm.transform_format = MultiMesh.TRANSFORM_3D
  mm.mesh = mesh.mesh
  mm.instance_count = points.size()
  for i in points.size():
   var p = points[i]
   var transform_value = Transform3D(Basis(Vector3.UP,float(i)*2.39).scaled(Vector3.ONE*(.9+(i%4)*.12)),p)
   mm.set_instance_transform(i,transform_value*mesh.global_transform)
  var node = MultiMeshInstance3D.new()
  node.multimesh = mm
  for surface in mm.mesh.get_surface_count():mm.mesh.surface_set_material(surface,mesh.get_active_material(surface))
  level_root.add_child(node)
 template.queue_free()

func clear_level():
 for c in level_root.get_children():
  level_root.remove_child(c)
  c.queue_free()
 enemies.clear();hazards.clear();projectiles.clear();transient.clear();pillars.clear();pickups.clear();lamp_nodes.clear();lamp_rings.clear();display_models.clear();rear_walls.clear()
 selected={};focus_at=null;stop_route();remote_keys.clear()

func stop_route():
 route.clear()
 route_goal=""

func build_forest():
 clear_level()
 var ground=box(Vector3(0,-.15,-8),Vector3(50,.3,90),"#719b70",true)
 ground.material_override=painted_ground("#698e65","#92aa77",.8)
 var path=box(Vector3(0,-.005,-8),Vector3(8,.035,78),"#d6c496")
 path.material_override=painted_ground("#b9a77b","#ded0a3",1.6)
 box(Vector3(0,.005,5.5),Vector3(37,.035,3.5),"#6eb5b5")
 box(Vector3(0,.055,5.5),Vector3(7,.1,4.1),"#b8a37c")
 for plank in range(12):box(Vector3(0,.12,3.55+plank*.35),Vector3(7,.05,.29),"#b3a17a")
 for x in [-3.4,3.4]:
  box(Vector3(x,.65,5.5),Vector3(.12,.12,4.3),"#796b4f")
  for z in [3.7,5.5,7.3]:box(Vector3(x,.35,z),Vector3(.18,.70,.18),"#8c7c58")
 for i in range(12):
  var z = 26-i*5.5
  for x in [-4.0,4.0]:
   var stone = disc(Vector3(x,.07,z),.52,"#d4d0b1")
   stone.scale.z = 1.25
 var trees = []
 for i in range(46):
  var z = 30-(i/2)*3.8
  var side = -1 if i%2 else 1
  trees.append(Vector3(side*(10.0+(i%3)*1.4),0,z))
 instanced_trees(trees)
 for i in range(30):
  var side=-1 if i%2 else 1
  var x=side*(5.2+(i%4)*.75)
  var z=29-i*2.6
  var rock=SphereMesh.new();rock.radius=.3+(i%3)*.12;rock.height=rock.radius*1.2;rock.radial_segments=7;rock.rings=4
  shape_mesh(rock,Vector3(x,.13,z),"#8d9a78" if i%3 else "#b0b695")
  for j in range(3):
   var flower=SphereMesh.new();flower.radius=.07;flower.height=.14;flower.radial_segments=6;flower.rings=3
   shape_mesh(flower,Vector3(x+.45+j*.16,.28,z+.12*j),"#f4dfad" if i%2 else "#d3b4ba")
 for z in [18,1,-14,-29]:
  for x in [-8.0,8.0]:model("lantern",level_root,Vector3(x,0,z),1.1)
 for p in [Vector3(-5,0,-13),Vector3(5,0,-17),Vector3(-4,0,-20)]:
  model("pillar",level_root,p,1.1)
  box(p+Vector3(0,1,0),Vector3(.7,2.0,.7),"#999e7f",true)
  pillars.append(p)
 disc(Vector3(0,.025,-37),11.5,"#b7c5a0")
 disc(Vector3(0,.055,-37),9.4,"#cad0b1")
 for x in [-5.5,5.5]:
  lamp_nodes.append(model("lantern",level_root,Vector3(x,.08,-37),1.45))
  var ring_mesh=TorusMesh.new();ring_mesh.inner_radius=1.87;ring_mesh.outer_radius=2.0;ring_mesh.rings=32;ring_mesh.ring_segments=4
  var ring=shape_mesh(ring_mesh,Vector3(x,.16,-37),"#56ac96")
  ring.visible=false;lamp_rings.append(ring)
 for i in range(10):
  var a = i*TAU/10
  model("pillar",level_root,Vector3(sin(a)*12.5,0,-37+cos(a)*12.5),.75)
 for p in [Vector3(-20,1,-8),Vector3(20,1,-8),Vector3(0,1,36),Vector3(0,1,-53)]:
  box(p,Vector3(1,3,90) if abs(p.x)>10 else Vector3(42,3,1),"#567f62",true)
 for item in [["core1",Vector3(-6,0,13)],["core2",Vector3(7,0,-2)],["core3",Vector3(-7,0,-19)],["creek",Vector3(-9,0,6)]]:
  var node = model("jade" if item[0]=="creek" else "lantern",level_root,item[1],.65)
  disc(item[1]+Vector3(0,.06,0),1.0,"#f0d58a",.45)
  pickups.append({"id":item[0],"node":node,"pos":item[1],"taken":false})
 rebuild_myth_navigation()

func build_museum():
 clear_level()
 box(Vector3(0,-.15,0),Vector3(23,.3,22),"#dbd2b5",true)
 for x in [-10.5,10.5]:box(Vector3(x,1.8,0),Vector3(.35,3.6,20),"#aebf9e",true)
 for x in [-9.0,-3.0,3.0,9.0]:
  model("pillar",level_root,Vector3(x,0,-8.5),1.5)
 box(Vector3(0,0,-8),Vector3(21,.08,2),"#839b82")
 for i in range(6):
  var p = Vector3((i%3-1)*5.6,0, -4.0 if i<3 else 2.0)
  box(p+Vector3(0,.55,0),Vector3(2.0,1.1,1.75),"#8a9f86",true)
  box(p+Vector3(0,1.14,0),Vector3(2.15,.12,1.9),"#d5bc7b")
  var holder = Node3D.new()
  holder.position = p+Vector3(0,1.25,0)
  level_root.add_child(holder)
  display_models.append(holder)
 player.position=Vector3(0,.15,7)
 zoom_size=15
 nearest_object=""
 update_displays()
 rebuild_myth_navigation()

func update_displays():
 for i in display_models.size():
  var holder=display_models[i]
  for c in holder.get_children():c.queue_free()
  var id = str(museum_slots[i]) if museum_slots.size()>i and museum_slots[i]!=null else ""
  if id.is_empty():
   disc(Vector3.ZERO,.45,"#e3d4ad",1.0,holder)
   continue
  var simple=id.get_slice(":",2)
  var names={"ink_card":"ink","paper_card":"paper","ape_card":"ape","fox_card":"fox","fox_jade":"jade","lantern":"lantern","bracer":"bracer","fox_statue":"fox","qingqiu_banner":"banner"}
  var asset=names.get(simple,"jade")
  var obj=model(asset,holder,Vector3.ZERO,.40 if asset=="fox" else .72)
  obj.rotation.y=.3
  if simple.ends_with("scene"):
   box_scene_frame(holder,simple)

func box_scene_frame(holder:Node3D,id:String):
 var frame = BoxMesh.new();frame.size=Vector3(1.6,1.15,.10)
 shape_mesh(frame,Vector3(0,.45,.3),"#436f61",holder)
 var center = SphereMesh.new();center.radius=.18;center.height=.36
 shape_mesh(center,Vector3(.4,.7,.21),"#ead5a0",holder)

func equip_weapon():
 if weapon_node and is_instance_valid(weapon_node):weapon_node.queue_free()
 weapon_node=Node3D.new()
 actor.add_child(weapon_node)
 weapon_node.position=Vector3(.45,.95,.15)
 if weapon=="sword":
  var blade=BoxMesh.new();blade.size=Vector3(.07,.07,1.12)
  shape_mesh(blade,Vector3(0,0,.48),"#e7eadc",weapon_node)
  var guard=BoxMesh.new();guard.size=Vector3(.36,.08,.12)
  shape_mesh(guard,Vector3.ZERO,"#caa458",weapon_node)
 else:
  var paper=BoxMesh.new();paper.size=Vector3(.22,.34,.035)
  shape_mesh(paper,Vector3(0,.1,.1),"#f9dfa2",weapon_node)
 arm_bones.clear();skeleton=null
 for b in actor.find_children("*","Skeleton3D",true,false):skeleton=b
 if skeleton:
  for i in skeleton.get_bone_count():
   var n=skeleton.get_bone_name(i).to_lower()
   if "upperarm" in n or "upper_arm" in n or "j_bip_r_upperarm" in n:arm_bones.append(i)

func begin_run(data:Dictionary):
 run_data=data.duplicate(true)
 weapon=str(data.get("weapon","sword"));difficulty=str(data.get("difficulty","guided"));abilities=data.get("abilities",[]);stats=data.get("stats",{})
 weapon_level=int(data.get("level",1));checkpoint=int(data.get("checkpoint",0));stage=checkpoint
 health=600;max_health=600;max_energy=80 if "light" in abilities else 100;energy=max_energy;shield=0;hits_taken=0;kills=0;lamp_count=0;phase=1
 active_time=0;cooldowns=[0.0,0.0,0.0];status="playing";mode="field";paused=false;auto_attack=false;combat_pressed=false;anchor=null
 optional=data.get("optional",{"creek":false,"cores":[]}).duplicate(true)
 rng.seed=int(data.get("seed",1))
 build_forest();equip_weapon()
 for p in pickups:
  if p.id in optional.cores or (p.id=="creek" and optional.creek):p.taken=true;p.node.visible=false
 player.position=Vector3(0,.15,[25,10,-8,-28.5][mini(stage,3)])
 spawn_stage()
 send({"type":"notice","message":"青丘林地：先清理林口墨靈。點地面移動，點怪物攻擊；空白鍵閃避。" if stage==0 else "已從確認的區段接續冒險。"})

func spawn_enemy(kind:String,at:Vector3,small=false):
 var root=Node3D.new();level_root.add_child(root);root.position=at
 var asset="fox" if kind in ["fox","ghost"] else kind
 var scale_value=.75 if kind=="ink" else 1.0
 if kind=="fox" or kind=="ghost":scale_value=1.18
 if small:scale_value*=.60
 var visual=model(asset,root,Vector3.ZERO,scale_value)
 var hp={"ink":125,"paper":150,"ape":850,"fox":4200,"ghost":1}.get(kind,100)
 if small:hp=55
 if difficulty=="guided":hp*=.72
 if difficulty=="advanced":hp*=1.12
 var bar=Node3D.new();root.add_child(bar)
 bar.position=Vector3(0,3.6 if kind=="fox" else 2.8 if kind=="ape" else 1.7,0)
 var bg=QuadMesh.new();bg.size=Vector2(1.0,.075)
 var b=shape_mesh(bg,Vector3.ZERO,"#314b44",bar)
 var fg=QuadMesh.new();fg.size=Vector2(.96,.045)
 var f=shape_mesh(fg,Vector3(0,0,.004),"#d8b36b",bar)
 disc(Vector3(0,.04,0),1.0 if kind in ["fox","ghost"] else .50,"#355846",.24,root)
 var tails=visual.find_children("Tail*","Node3D",true,false) if kind in ["fox","ghost"] else []
 var e={"tails":tails,"kind":kind,"node":root,"visual":visual,"hp":float(hp),"max":float(hp),"cd":rng.randf_range(1,2.2),"windup":0.0,"dead":false,"split":small,"stun":0.0,"facing":Vector3.FORWARD,"charging":0.0,"charge_hit":false,"bar":bar,"fill":f,"age":0.0,"special":5.0,"exposure":0.0}
 enemies.append(e)
 return e

func spawn_stage():
 match stage:
  0:
   spawn_enemy("ink",Vector3(-2,0,19));spawn_enemy("ink",Vector3(3,0,16));spawn_enemy("ink",Vector3(-3,0,13))
  1:
   spawn_enemy("paper",Vector3(-3,0,2));spawn_enemy("paper",Vector3(4,0,-2));spawn_enemy("ink",Vector3(0,0,0))
  2:
   spawn_enemy("ape",Vector3(0,0,-15));spawn_enemy("paper",Vector3(-6,0,-11))
  3:
   zoom_size=16.0
   spawn_enemy("fox",Vector3(0,0,-37));phase=1;lit_lamps=[false,false];shield_window=0;send({"type":"notice","message":"九尾狐：看腳印辨認真身；扇形尾掃要往側後方躲。"})

func current_foes():
 return enemies.filter(func(e):return not e.dead and e.kind!="ghost")

func damage_enemy(e:Dictionary,amount:float,heavy=false):
 if e.is_empty() or e.dead:return
 if e.kind=="ghost":
  e.dead=true;e.node.queue_free();send({"type":"notice","message":"這是幻影；真身會留下金色腳印。"});return
 if e.kind=="fox" and phase==3 and shield_window<=0:
  damage_number(e.node.position,0,"#8ac7b7");return
 if e.kind=="ape" and e.stun<=0:
  var to_player=(player.position-e.node.position).normalized()
  if to_player.dot(e.facing)>.1:amount*=.35
 if e.kind=="ink" and heavy and not e.split and current_foes().size()<9:
  var pos=e.node.position;e.dead=true;e.node.queue_free()
  spawn_enemy("ink",pos+Vector3(.4,0,.2),true);spawn_enemy("ink",pos+Vector3(-.4,0,-.2),true)
  damage_number(pos,int(amount),"#f4d483");return
 var multiplier=1.0+(weapon_level-1)*.12+(int(stats.get("strength" if weapon=="sword" else "focus",2))-2)*.02
 amount*=multiplier
 e.hp=maxf(0,e.hp-amount)
 send({"type":"sfx","kind":"hit"})
 e.fill.scale.x=maxf(.01,e.hp/e.max)
 e.visual.scale*=1.025
 damage_number(e.node.position,int(amount),"#fff0b2")
 if e.hp<=0:
  e.dead=true;e.node.visible=false;e.node.queue_free();kills+=1
  var spark=disc(e.node.position+Vector3(0,.08,0),.50,"#f4da88",.8)
  transient.append({"node":spark,"life":.6,"kind":"spark"})
  if e.kind=="fox":
   status="cleared";combat_pressed=false;auto_attack=false
   send({"type":"finish","metrics":{"activeMs":int(active_time*1000),"hits":hits_taken,"lamps":lamp_count,"kills":kills}})

func damage_number(at:Vector3,value:int,color:String):
 var label=Label3D.new();label.text=str(value) if value>0 else "SHIELD"
 label.font_size=50;label.pixel_size=.007;label.billboard=BaseMaterial3D.BILLBOARD_ENABLED;label.modulate=Color(color)
 label.position=at+Vector3(rng.randf_range(-.35,.35),1.7,0)
 level_root.add_child(label);transient.append({"node":label,"life":.65,"kind":"number"})

func attack():
 if status!="playing" or paused or attack_cd>0:return
 var target=target_enemy()
 if target.is_empty():return
 var reach=2.35 if weapon=="sword" else 11.0
 if player.position.distance_to(target.node.position)>reach:return
 attack_cd=.42*(1-.025*(int(stats.get("dexterity",2))-2));attack_pose=.34;attack_total=.34;combo=(combo+1)%3
 var direction=target.node.position-player.position;direction.y=0
 actor.rotation.y=atan2(direction.x,direction.z)
 if weapon=="sword":
  var heavy=combo==0
  swing_effect(player.position,direction,2.1,"#f5e0a8")
  for e in enemies.duplicate():
   if e.dead:continue
   var offset=e.node.position-player.position;offset.y=0
   if offset.length()<2.4 and offset.normalized().dot(direction.normalized())>-.15:damage_enemy(e,42 if heavy else 28,heavy)
 else:projectile(player.position+Vector3(0,.9,0),target.node.position+Vector3(0,.8,0),"hero",38)

func target_enemy():
 if not selected.is_empty() and not selected.dead:return selected
 var best=100.0;var result={}
 for e in enemies:
  if e.dead:continue
  var d=player.position.distance_to(e.node.position)
  if d<best:best=d;result=e
 return result

func skill(index:int):
 if status!="playing" or paused or index<0 or index>2 or cooldowns[index]>0:return
 var cost=[15,18,25][index]*(1-.02*(int(stats.get("planning",2))-2))
 if energy<cost:send({"type":"notice","message":"精力不足，稍微拉開距離再出招。"});return
 energy-=cost;regen_delay=.9;cooldowns[index]=[6.0,9.0,10.0][index];attack_pose=.6;attack_total=.6
 var target=target_enemy()
 var direction=Vector3(sin(actor.rotation.y),0,cos(actor.rotation.y))
 if not target.is_empty():direction=(target.node.position-player.position).normalized();direction.y=0;actor.rotation.y=atan2(direction.x,direction.z)
 if index==1 and "trace" in abilities:
  if anchor==null:anchor=player.position;cooldowns[index]=1.0;send({"type":"notice","message":"已留下撤退標記，再按此招回到標記旁。"})
  else:
   if player.position.distance_to(anchor)<12:player.position=anchor;invulnerable=.35
   anchor=null
  return
 if index==2 and "plan" in abilities:
  var circle=disc(player.position+Vector3(0,.06,0),3.2,"#79baa9",.45)
  transient.append({"node":circle,"life":3.0,"kind":"field","tick":0.0})
  send({"type":"notice","message":"支援符陣：陣內持續壓制敵人。"});return
 if index==1:
  shield=(160 if "steady" in abilities else 120)*(1+.04*(int(stats.get("focus",2))-2))
  invulnerable=.22
  disc_effect(player.position,1.0,"#79c6b5")
  return
 if index==0:
  if weapon=="sword":dash_direction=direction;dash_time=.20;invulnerable=.12
  for e in enemies.duplicate():
   if not e.dead and e.node.position.distance_to(player.position)<(4.0 if weapon=="sword" else 8.0):
    damage_enemy(e,80,false)
    if e.kind not in ["fox","ghost"]:e.stun=1.0
  disc_effect(player.position,3.0,"#a8d3b4")
 else:
  var damage=150.0 if "precise" in abilities else 125.0
  var center=player.position+direction*2 if weapon=="sword" or target.is_empty() else target.node.position
  disc_effect(center,3.5,"#f6ce72")
  for e in enemies.duplicate():
   if not e.dead and e.node.position.distance_to(center)<3.7:damage_enemy(e,damage,true)

func dodge():
 if status!="playing" or paused or dash_time>0:return
 var cost=30 if "swift" in abilities else 24
 if energy<cost:return
 energy-=cost;regen_delay=.85;dash_time=.38;invulnerable=.24
 var direction=movement_direction()
 if direction.length()<.1:direction=Vector3(sin(actor.rotation.y),0,cos(actor.rotation.y))
 dash_direction=direction.normalized();auto_attack=false;stop_route();disc_effect(player.position,.6,"#c8e6d6")

func hero_hurt(amount:float):
 if invulnerable>0 or status!="playing":return
 amount*=.68 if difficulty=="guided" else 1.1 if difficulty=="advanced" else 1.0
 if shield>0:
  var absorbed=minf(shield,amount);shield-=absorbed;amount-=absorbed
 health=maxf(0,health-amount);hits_taken+=1;invulnerable=.65+.02*(int(stats.get("focus",2))-2)
 damage_number(player.position,int(amount),"#f9b0a2")
 if health<=0:
  status="failed";combat_pressed=false;auto_attack=false;stop_route();set_motion("Bow")
  send({"type":"failed","message":"先保留精力躲尾掃；第三階段把追蹤狐火引到石燈。" if stage==3 else "看清地面預警，再換位反擊。已確認的素材保留。"})

func hazard(at:Vector3,radius:float,delay:float,damage:float,angle=TAU,facing=Vector3.FORWARD):
 var mesh=ArrayMesh.new();var verts=PackedVector3Array();var n=24
 var start=atan2(facing.x,facing.z)-angle*.5
 for i in range(n):
  var a=start+angle*i/n;var b=start+angle*(i+1)/n
  verts.append(Vector3.ZERO);verts.append(Vector3(sin(a)*radius,0,cos(a)*radius));verts.append(Vector3(sin(b)*radius,0,cos(b)*radius))
 var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=verts
 mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
 var node=shape_mesh(mesh,at+Vector3(0,.085,0),"#e7a45e",level_root,.58)
 node.material_override.cull_mode=BaseMaterial3D.CULL_DISABLED
 hazards.append({"node":node,"pos":at,"radius":radius,"left":delay+(.18 if "foresight" in abilities else 0.0)+.04*(int(stats.get("insight",2))-2),"damage":damage,"angle":angle,"facing":facing})

func swing_effect(at:Vector3,direction:Vector3,radius:float,color:String):
 var mesh=TorusMesh.new();mesh.inner_radius=radius*.85;mesh.outer_radius=radius;mesh.rings=24;mesh.ring_segments=4
 var node=shape_mesh(mesh,at+Vector3(0,.65,0),color,level_root,.7)
 transient.append({"node":node,"life":.20,"kind":"spark"})

func disc_effect(at:Vector3,radius:float,color:String):
 var node=disc(at+Vector3(0,.10,0),radius,color,.50)
 transient.append({"node":node,"life":.45,"kind":"spark"})

func projectile(from:Vector3,to:Vector3,kind:String,damage:float):
 var mesh=SphereMesh.new();mesh.radius=.18 if kind=="hero" else .28;mesh.height=mesh.radius*2
 var node=shape_mesh(mesh,from,"#a7e6c6" if kind=="hero" else "#f0b95d")
 projectiles.append({"node":node,"dir":(to-from).normalized(),"kind":kind,"damage":damage,"life":10.0})

func update_enemies(delta:float):
 for e in enemies.duplicate():
  if e.dead:continue
  e.age+=delta;e.cd-=delta;e.special-=delta;e.stun=maxf(0,e.stun-delta)
  e.bar.rotation=Vector3.ZERO
  e.visual.scale=e.visual.scale.lerp(Vector3.ONE*(1.18 if e.kind in ["fox","ghost"] else .45 if e.kind=="ink" and e.split else .75 if e.kind=="ink" else 1.0),minf(1,delta*9))
  if e.kind=="ghost":
   if e.age>7:e.dead=true;e.node.queue_free()
   continue
  if e.stun>0:continue
  var offset=player.position-e.node.position;offset.y=0
  var distance=offset.length();var direction=offset.normalized()
  if distance>16 and e.kind!="fox":continue
  if e.charging>0:
   e.charging-=delta;e.node.position+=e.facing*delta*10
   for p in pillars:
    if e.node.position.distance_to(p)<1.3:
     e.charging=0;e.stun=4.5;disc_effect(p,1.5,"#f0d28b");send({"type":"notice","message":"撞柱破甲！趁現在攻擊石甲猿妖。"})
   if e.node.position.distance_to(player.position)<1.4 and not e.charge_hit:e.charge_hit=true;hero_hurt(115)
   continue
  if e.kind=="fox":
   update_fox(e,delta,direction)
   continue
  var reach=2.5 if e.kind=="ink" else 9.0 if e.kind=="paper" else 4.5
  if distance>reach:
   e.node.position+=direction*delta*(2.2 if e.kind=="ink" else 1.5);e.node.rotation.y=atan2(direction.x,direction.z)
  elif e.cd<=0:
   e.facing=direction;e.node.rotation.y=atan2(direction.x,direction.z)
   e.cd=2.7 if e.kind=="ink" else 3.5 if e.kind=="paper" else 4.8
   if e.kind=="ink":hazard(player.position,1.35,.90,55)
   elif e.kind=="paper":hazard(player.position,1.8,1.05,65)
   else:
    hazard(e.node.position,6.0,1.0,0,.40,direction)
    e.windup=1.0;e.charge_hit=false
  if e.kind=="ape" and e.windup>0:
   e.windup-=delta
   if e.windup<=0:e.charging=.75
  e.visual.position.y=sin(e.age*4)*.045

func update_fox(e:Dictionary,delta:float,direction:Vector3):
 for i in e.tails.size():e.tails[i].rotation.z=sin(e.age*2+i*.45)*.035
 var wanted=3 if e.hp/e.max<=.35 else 2 if e.hp/e.max<=.70 else 1
 if wanted!=phase:
  phase=wanted
  for ghost in enemies:
   if not ghost.dead and ghost.kind=="ghost":ghost.dead=true;ghost.node.queue_free()
  if phase==2:send({"type":"notice","message":"第二階段：狐火會封住地面，留一條退路，別把精力用光。"})
  if phase==3:
   e.node.position=Vector3(0,0,-37);lit_lamps=[false,false];shield_window=0;e.cd=2
   send({"type":"notice","message":"引火破盾：把追蹤狐火帶到左右石燈，快碰到燈時閃開。"})
 if phase==3:
  shield_window=maxf(0,shield_window-delta)
  if shield_window==0 and lit_lamps[0] and lit_lamps[1]:lit_lamps=[false,false]
  for i in lamp_nodes.size():
   lamp_nodes[i].scale=Vector3.ONE*(1.6 if lit_lamps[i] else 1.45)
   lamp_rings[i].visible=true
   lamp_rings[i].material_override=material("#f8d787" if lit_lamps[i] else "#56ac96")
  if shield_window<=0 and e.cd<=0:
   projectile(e.node.position+Vector3(0,.7,0),player.position+Vector3(0,.7,0),"fire",100);e.cd=3.8 if difficulty=="guided" else 3.0
  elif shield_window>0 and e.cd<=0:
   hazard(e.node.position,4.0,1.1,95,PI*.85,direction);e.cd=3.0
 else:
  if e.cd<=0:
   e.node.rotation.y=atan2(direction.x,direction.z)
   if phase==2 and rng.randf()<.5:
    for i in range(3):hazard(player.position+Vector3((i-1)*2.7,0,i*.7),1.4,1.1+i*.25,90)
   else:hazard(e.node.position,5.8,1.0,110,PI*.8,direction)
   e.cd=2.6 if difficulty=="advanced" else 3.4
  if phase==1 and e.special<=0:
   for ghost in enemies:
    if not ghost.dead and ghost.kind=="ghost":ghost.dead=true;ghost.node.queue_free()
   var x=rng.randi_range(-1,1)*4.6
   e.node.position=Vector3(x,0,-37)
   for other in [-4.6,0.0,4.6]:
    if absf(other-x)>.1:spawn_enemy("ghost",Vector3(other,0,-37))
   e.special=11.0
  if e.age-float(e.get("foot_time",0))>.6:
   e.foot_time=e.age
   var foot=disc(e.node.position+Vector3(0,.10,1.6),.28,"#ffe2a0",.85)
   transient.append({"node":foot,"life":1.8 if "listen" in abilities else 1.1,"kind":"spark"})
 e.visual.position.y=sin(e.age*2)*.055

func update_attacks(delta:float):
 for h in hazards.duplicate():
  h.left-=delta
  if h.left<=0:
   var offset=player.position-h.pos;offset.y=0
   if h.damage>0 and offset.length()<h.radius and (h.angle>=TAU-.1 or offset.normalized().dot(h.facing)>cos(h.angle*.5)):hero_hurt(h.damage)
   disc_effect(h.pos,h.radius,"#eabb68");h.node.queue_free();hazards.erase(h)
 for p in projectiles.duplicate():
  p.life-=delta
  if p.kind=="fire":
   var target=player.position+Vector3(0,.7,0);p.dir=(target-p.node.position).normalized()
  p.node.position+=p.dir*delta*(13 if p.kind=="hero" else 3.9)
  var done=p.life<=0
  if p.kind=="hero":
   for e in enemies.duplicate():
    if not e.dead and p.node.position.distance_to(e.node.position+Vector3(0,.8,0))<(1.25 if e.kind in ["fox","ghost"] else .8):damage_enemy(e,p.damage);done=true;break
  else:
   for i in lamp_nodes.size():
    if not lit_lamps[i] and p.node.position.distance_to(lamp_nodes[i].position+Vector3(0,.7,0))<2.0:
     lit_lamps[i]=true;lamp_count+=1;done=true;disc_effect(lamp_nodes[i].position,1.7,"#f9dc8d")
     if lit_lamps[0] and lit_lamps[1]:shield_window=7.0;send({"type":"notice","message":"雙燈已亮，護盾解除！趁現在反擊。"})
   if not done and p.node.position.distance_to(player.position+Vector3(0,.7,0))<.65:hero_hurt(p.damage);done=true
  if done:p.node.queue_free();projectiles.erase(p)
 for t in transient.duplicate():
  t.life-=delta
  if t.kind=="number":t.node.position.y+=delta*1.0
  if t.kind=="field":
   t.tick+=delta
   if t.tick>.5:
    t.tick=0
    for e in enemies.duplicate():
     if not e.dead and e.node.position.distance_to(t.node.position)<3.2:damage_enemy(e,28*(1+.03*(int(stats.get("planning",2))-2)))
  if t.life<=0:t.node.queue_free();transient.erase(t)

func movement_direction():
 var input=Vector2.ZERO
 if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP) or remote_keys.get("up",false):input.y-=1
 if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN) or remote_keys.get("down",false):input.y+=1
 if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT) or remote_keys.get("left",false):input.x-=1
 if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT) or remote_keys.get("right",false):input.x+=1
 return Vector3(input.x*cos(yaw)+input.y*sin(yaw),0,-input.x*sin(yaw)+input.y*cos(yaw)).normalized()

func _physics_process(delta):
 if player==null or paused:return
 var direction=movement_direction()
 if direction.length()>.1:stop_route();auto_attack=false;focus_at=null
 elif route.size()>0:
  var offset=route[0]-player.position;offset.y=0
  if offset.length()<.22:route.remove_at(0)
  else:direction=offset.normalized()
 if mode=="field" and status=="playing":
  active_time+=delta;attack_cd=maxf(0,attack_cd-delta);invulnerable=maxf(0,invulnerable-delta);regen_delay=maxf(0,regen_delay-delta)
  for i in range(3):cooldowns[i]=maxf(0,cooldowns[i]-delta)
  if regen_delay<=0:energy=minf(max_energy,energy+18*delta)
  if (combat_pressed or auto_attack or Input.is_physical_key_pressed(KEY_J)) and dash_time<=0:
   var target=target_enemy()
   if auto_attack and not target.is_empty() and player.position.distance_to(target.node.position)>(2.0 if weapon=="sword" else 9.0):direction=(target.node.position-player.position).normalized();direction.y=0
   attack()
  if dash_time>0:dash_time-=delta;direction=dash_direction
  update_enemies(delta);update_attacks(delta)
  if status=="playing" and current_foes().is_empty() and stage<3:
   checkpoint=stage+1
   send({"type":"checkpoint","checkpoint":checkpoint,"optional":optional.duplicate(true)})
   stage+=1;health=minf(max_health,health+220);energy=max_energy;selected={};auto_attack=false;spawn_stage()
   send({"type":"notice","message":["","林口已清理，往溪橋後的符紋遺跡前進。","前往石燈庭：把石甲猿妖引向石柱。","九尾狐在北方石環臺；先整頓精力再前進。"][stage]})
 var speed=4.6*(1.15 if "light" in abilities else 1.0)*(1+.02*(int(stats.get("agility",2))-2))
 if dash_time>0:speed=11.0*(1.16 if "swift" in abilities else 1.0)
 if mode=="field" and status!="playing":direction=Vector3.ZERO
 player.velocity.x=direction.x*speed;player.velocity.z=direction.z*speed;player.velocity.y=-2
 player.move_and_slide()
 player.position.x=clampf(player.position.x,-9,9) if mode=="museum" else clampf(player.position.x,-18,18)
 player.position.z=clampf(player.position.z,-7,9) if mode=="museum" else clampf(player.position.z,[-1, -9, -27,-50][mini(stage,3)],32)
 if direction.length()>.1 and attack_pose<=0:actor.rotation.y=lerp_angle(actor.rotation.y,atan2(direction.x,direction.z),minf(1,delta*14));set_motion("Run")
 elif attack_pose<=0:set_motion("Idle")
 update_near()

func update_near():
 var next="";var best=2.2
 if mode=="museum":
  for i in display_models.size():
   var d=player.position.distance_to(display_models[i].position)
   if d<best:best=d;next="slot"+str(i)
 else:
  for p in pickups:
   var d=player.position.distance_to(p.pos)
   if not p.taken and d<best:best=d;next=p.id
 if next!=nearest_object:
  nearest_object=next
  send({"type":"interactHint","id":next})

func interact():
 if nearest_object.is_empty():return
 if nearest_object.begins_with("slot"):
  send({"type":"inspectSlot","slot":int(nearest_object.trim_prefix("slot"))});return
 for p in pickups:
  if p.id!=nearest_object or p.taken:continue
  p.taken=true;p.node.visible=false
  send({"type":"discovery","id":p.id})
  if p.id=="creek":optional.creek=true;send({"type":"notice","message":"溪水中的足跡與倒影，是辨認真身的線索。「溪畔照影」已送出保存。"})
  else:
   optional.cores.append(p.id);send({"type":"notice","message":"找到了燈芯（"+str(optional.cores.size())+"／3）。確認後可用來製作符紋燈。"})
  nearest_object=""

func _process(delta):
 if player==null:return
 var target=player.position+Vector3(0,.8,-2.6 if mode=="field" else 0.0) if focus_at==null else focus_at
 var offset=Vector3(sin(yaw)*cos(elevation),sin(elevation),cos(yaw)*cos(elevation))*35
 camera.position=target+offset if not camera_started else camera.position.lerp(target+offset,1-exp(-10*delta))
 camera.look_at(target);camera.size=zoom_size*(1.3 if get_viewport().get_visible_rect().size.x<650 else 1.0);camera_started=true
 for wall in rear_walls:
  if is_instance_valid(wall):wall.visible=camera.position.z>-6
 if not paused:
  attack_pose=maxf(0,attack_pose-delta)
  if weapon_node:
   var t=1-attack_pose/maxf(.01,attack_total)
   weapon_node.rotation=Vector3(-.7*sin(t*PI),sin(t*PI)*1.8,0) if attack_pose>0 else Vector3.ZERO
  if skeleton:
   for bone in arm_bones:
    if attack_pose>0:skeleton.set_bone_pose_rotation(bone,Quaternion(Vector3.RIGHT,-sin((1-attack_pose/maxf(.01,attack_total))*PI)*1.15))
  if status=="failed":actor.rotation.z=lerpf(actor.rotation.z,.8,minf(1,delta*4))
  else:actor.rotation.z=lerpf(actor.rotation.z,-.16 if dash_time>0 else 0.0,minf(1,delta*10))
  if mode=="museum":
   for holder in display_models:holder.rotation.y+=delta*.12
 feedback_time+=delta
 if feedback_time>.16:
  feedback_time=0
  var boss={}
  for e in enemies:
   if not e.dead and e.kind=="fox":boss={"hp":e.hp,"max":e.max,"phase":phase,"shielded":phase==3 and shield_window<=0,"window":shield_window}
  send({"type":"mythState","mode":mode,"status":status,"hp":health,"maxHp":max_health,"energy":energy,"maxEnergy":max_energy,"cooldowns":cooldowns,"stage":stage,"phase":phase,"seconds":int(active_time),"hits":hits_taken,"kills":kills,"lamps":lit_lamps,"lampCount":lamp_count,"boss":boss,"near":nearest_object,"x":snapped(player.position.x,.01),"z":snapped(player.position.z,.01),"fps":Engine.get_frames_per_second()})

func blocked(pos:Vector2):
 if mode=="museum":
  if absf(pos.x)>9 or pos.y<-7 or pos.y>9:return true
  for holder in display_models:
   if absf(pos.x-holder.position.x)<1.25 and absf(pos.y-holder.position.z)<1.15:return true
 else:
  if absf(pos.x)>18 or pos.y<-50 or pos.y>32:return true
  for p in pillars:
   if Vector2(p.x,p.z).distance_to(pos)<.8:return true
 return false

func rebuild_myth_navigation():
 astar.region=Rect2i(-22,-54,45,90);astar.cell_size=Vector2.ONE
 astar.diagonal_mode=AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES;astar.update()
 for x in range(-22,23):
  for z in range(-54,36):astar.set_point_solid(Vector2i(x,z),blocked(Vector2(x,z)))

func navigate(target:Vector3,goal=""):
 if blocked(Vector2(target.x,target.z)):return
 var start=Vector2i(roundi(player.position.x),roundi(player.position.z));var end=Vector2i(roundi(target.x),roundi(target.z))
 if not astar.is_in_boundsv(start) or not astar.is_in_boundsv(end) or astar.is_point_solid(end):return
 var points=astar.get_point_path(start,end)
 route.clear()
 for i in range(1,points.size()):route.append(Vector3(points[i].x,.15,points[i].y))
 route.append(target);auto_attack=false;focus_at=null

func tap_screen(pos):
 if paused:return
 var origin=camera.project_ray_origin(pos)
 var point=Plane(Vector3.UP,.15).intersects_ray(origin,camera.project_ray_normal(pos))
 if point==null:return
 for e in enemies:
  if not e.dead and point.distance_to(e.node.position)<(2.2 if e.kind in ["fox","ghost"] else 1.3):selected=e;auto_attack=true;route.clear();return
 navigate(point)

func capture_report():
 await RenderingServer.frame_post_draw
 var image=get_viewport().get_texture().get_image()
 if image==null:return
 if image.get_width()>1280:image.resize(1280,int(image.get_height()*1280.0/image.get_width()),Image.INTERPOLATE_BILINEAR)
 send({"type":"reportImage","data":Marshalls.raw_to_base64(image.save_jpg_to_buffer(.75))})

func receive(args):
 if args.size()!=1:return
 var msg=JSON.parse_string(str(args[0]))
 if not msg is Dictionary:return
 match msg.get("type",""):
  "init":
   var value=msg.get("appearance",{})
   if value is Dictionary:
    for k in look:
     if value.has(k):look[k]=str(value[k])
    update_character();equip_weapon()
   museum_slots=msg.get("slots",[])
   if msg.get("view")=="museum":mode="museum";status="ready";build_museum()
   send({"type":"configured","mode":mode})
  "appearance":
   var value=msg.get("appearance",{})
   if value is Dictionary:
    for k in look:
     if value.has(k):look[k]=str(value[k])
    update_character();equip_weapon()
  "startRun":begin_run(msg.get("run",{}))
  "museum":mode="museum";status="ready";paused=false;museum_slots=msg.get("slots",[]);build_museum()
  "display":museum_slots=msg.get("slots",[]);update_displays()
  "focusSlot":
   var slot=int(msg.get("slot",0))
   if slot>=0 and slot<display_models.size():focus_at=display_models[slot].position+Vector3(0,.45,0);zoom_size=5.5
  "focusReset":focus_at=null;zoom_size=15
  "key":
   var k=str(msg.get("key",""))
   if k in ["up","down","left","right"]:remote_keys[k]=msg.get("down",false)==true
  "captureReport":capture_report()
  "attack":combat_pressed=msg.get("down",false)==true;auto_attack=false
  "skill":skill(int(msg.get("index",-1)))
  "dodge":dodge()
  "interact":interact()
  "pause":paused=msg.get("paused",false)==true;remote_keys.clear();combat_pressed=false;auto_attack=false
  "stop":remote_keys.clear();combat_pressed=false;auto_attack=false;route.clear()
  "retry":
   if status=="failed":
    for e in enemies:
     if not e.dead:e.node.queue_free()
    enemies.clear()
    for h in hazards:h.node.queue_free()
    for p in projectiles:p.node.queue_free()
    hazards.clear();projectiles.clear();health=max_health;energy=max_energy;shield=0;invulnerable=1;status="playing";lit_lamps=[false,false];phase=1;shield_window=0
    player.position=Vector3(0,.15,[25,10,-8,-28.5][mini(stage,3)]);spawn_stage()
  "testPhase":
   if run_data.get("test",false):
    for e in enemies:
     if not e.dead and e.kind=="fox":e.hp=e.max*(.65 if msg.get("phase")==2 else .30);update_fox(e,0.0,Vector3.BACK)
  "zoom":zoom_size=clampf(zoom_size+float(msg.get("delta",0)),4.5,27)
  "rotate":yaw+=float(msg.get("delta",0))
  "reset":yaw=.3;elevation=.67;zoom_size=15 if mode=="museum" else 12.8;focus_at=null

func _input(event):
 if paused:return
 if event is InputEventKey and event.pressed and not event.echo:
  match event.physical_keycode:
   KEY_SPACE,KEY_K:dodge()
   KEY_1,KEY_U:skill(0)
   KEY_2,KEY_I:skill(1)
   KEY_3,KEY_O:skill(2)
   KEY_E:interact()
 if event is InputEventMouseButton:
  if event.button_index==MOUSE_BUTTON_WHEEL_UP:zoom_size=clampf(zoom_size-1,4.5,27)
  if event.button_index==MOUSE_BUTTON_WHEEL_DOWN:zoom_size=clampf(zoom_size+1,4.5,27)
  if event.button_index in [MOUSE_BUTTON_LEFT,MOUSE_BUTTON_RIGHT]:
   if event.pressed:drag_start=event.position;pointer_down=true;dragging=event.button_index==MOUSE_BUTTON_RIGHT
   else:
    if pointer_down and not dragging:tap_screen(event.position)
    pointer_down=false
 if event is InputEventMouseMotion and pointer_down:
  if event.position.distance_to(drag_start)>8:dragging=true
  if dragging:yaw-=event.relative.x*.007;elevation=clampf(elevation+event.relative.y*.004,.40,1.30)
 if event is InputEventScreenTouch:
  if event.pressed:
   touch_points[event.index]=event.position
   if touch_points.size()==1:drag_start=event.position;touches_moved=false
   else:touches_moved=true
  else:
   if touch_points.size()==1 and not touches_moved:tap_screen(event.position)
   touch_points.erase(event.index);touch_last_distance=0
 if event is InputEventScreenDrag:
  touch_points[event.index]=event.position
  if touch_points.size()>1:
   var values=touch_points.values();var d=values[0].distance_to(values[1])
   if touch_last_distance>0:zoom_size=clampf(zoom_size*touch_last_distance/maxf(1,d),4.5,27)
   touch_last_distance=d;touches_moved=true
  elif event.position.distance_to(drag_start)>8:
   touches_moved=true;yaw-=event.relative.x*.007;elevation=clampf(elevation+event.relative.y*.004,.40,1.30)
