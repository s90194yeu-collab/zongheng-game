extends Node3D

const HALLS = [
 {"id":"cq","name":"春秋史館","x":-12.0,"z":-11.0,"w":8.0,"d":6.0},
 {"id":"zg","name":"戰國史館","x":0.0,"z":-16.0,"w":9.0,"d":6.0},
 {"id":"ch","name":"楚漢史館","x":12.0,"z":-11.0,"w":8.0,"d":6.0},
 {"id":"zz","name":"諸子學宮","x":-18.0,"z":3.0,"w":6.0,"d":6.0},
 {"id":"gw","name":"古文書院","x":18.0,"z":3.0,"w":7.0,"d":6.0},
 {"id":"al","name":"經典雅集","x":-12.0,"z":17.0,"w":7.0,"d":5.0}
]
const EXHIBITS = [Vector3(-5,0,-1),Vector3(0,0,-5),Vector3(5,0,-1)]
const TINTS = {"jade":"#49b7a2","ink":"#5d88b5","amber":"#d3a45d","crane":"#b9cfdb","plum":"#ca7e9e","moon":"#a794d3","peach":"#e6a0a8","sky":"#7dc4d6"}
const HAIR = {"ink":"#344665","chestnut":"#947052","silver":"#c9d7e5","rose":"#ce8da5","honey":"#d6b46e","violet":"#a898d1"}
const SKIN = {"warm":"#ffffff","porcelain":"#fff0e4","honey":"#ceaa8d","deep":"#99745f"}
var player: CharacterBody3D
var actor: Node3D
var camera: Camera3D
var exterior: Node3D
var room: Node3D
var spring: Node3D
var animation: AnimationPlayer
var floor_body: StaticBody3D
var colliders: Node3D
var path_markers: Node3D
var astar = AStarGrid2D.new()
var route = PackedVector3Array()
var route_goal = ""
var nearest = ""
var place = "village"
var look = {"body":"male","outfit":"scholar","color":"jade","skin":"warm","hairColor":"ink"}
var remote_keys = {}
var yaw = 0.53
var elevation = 0.62
var zoom_size = 12.5
var paused = false
var camera_started = false
var callback_ref
var bridge
var elapsed = 0.0
var blink_time = 0.0
var motion = ""
var touch_points = {}
var touch_last_distance = 0.0
var drag_start = Vector2.ZERO
var dragging = false
var pointer_down = false
var touches_moved = false
var last_touch = Vector2.ZERO
var material_refs: Array[Material] = []
var rear_walls: Array[MeshInstance3D] = []

func _ready():
 Engine.max_fps = 0
 var world = WorldEnvironment.new()
 world.environment = Environment.new()
 world.environment.background_mode = Environment.BG_COLOR
 world.environment.background_color = Color("#f7f0e3")
 world.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
 world.environment.ambient_light_color = Color("#fff3df")
 world.environment.ambient_light_energy = 0.85
 world.environment.tonemap_mode = Environment.TONE_MAPPER_LINEAR
 add_child(world)
 var sun = DirectionalLight3D.new()
 sun.rotation_degrees = Vector3(-48,-25,0)
 sun.light_color = Color("#fff1d8")
 sun.light_energy = 0.9
 sun.shadow_enabled = false
 add_child(sun)
 exterior = load("res://assets/orbit-village.glb").instantiate()
 room = load("res://assets/museum-interior.glb").instantiate()
 spring = load("res://assets/spring-interior.glb").instantiate()
 for scene in [exterior,room,spring]:
  add_child(scene)
  paint_world(scene)
 for scene in [room,spring]:cut_rear_wall(scene)
 var ding = spring.find_child("Artifact_Ding",true,false)
 if ding:
  var bronze = ding.duplicate()
  exterior.add_child(bronze)
  bronze.position=Vector3(3.6,.30,3)
  bronze.scale=Vector3.ONE*1.28
 room.visible = false
 spring.visible = false
 player = CharacterBody3D.new()
 player.name = "Player"
 player.position = Vector3(0,0.13,7)
 player.floor_snap_length = 0.25
 var shape = CollisionShape3D.new()
 shape.shape = CapsuleShape3D.new()
 shape.shape.radius = 0.29
 shape.shape.height = 1.6
 shape.position.y = 0.8
 player.add_child(shape)
 add_child(player)
 floor_body = StaticBody3D.new()
 var ground = CollisionShape3D.new()
 ground.shape = BoxShape3D.new()
 ground.shape.size = Vector3(52,0.2,52)
 ground.position.y = 0.02
 floor_body.add_child(ground)
 add_child(floor_body)
 colliders = Node3D.new()
 add_child(colliders)
 path_markers = Node3D.new()
 add_child(path_markers)
 camera = Camera3D.new()
 camera.projection = Camera3D.PROJECTION_ORTHOGONAL
 camera.near = 0.1
 camera.far = 160
 camera.current = true
 add_child(camera)
 make_guide()
 update_character()
 rebuild_navigation()
 if OS.has_feature("web"):
  bridge = JavaScriptBridge.get_interface("ZH_GODOT")
  callback_ref = JavaScriptBridge.create_callback(receive)
  bridge.register(callback_ref)
 send({"type":"ready"})

func paint_world(root):
 for node in root.find_children("*","MeshInstance3D",true,false):
  for i in range(node.mesh.get_surface_count()):
   var old = node.get_active_material(i)
   if old is StandardMaterial3D:
    material_refs.append(old)
    var material = old.duplicate()
    material_refs.append(material)
    material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
    material.cull_mode = BaseMaterial3D.CULL_DISABLED
    if node.name == "Batched_Ivory":
     material.albedo_texture = null
     material.albedo_color = Color("#f7f0e3")
    node.set_surface_override_material(i,material)

func cut_rear_wall(root):
 for node in root.find_children("*","MeshInstance3D",true,false):
  var solid = ArrayMesh.new()
  var back = ArrayMesh.new()
  for i in range(node.mesh.get_surface_count()):
   var arrays = node.mesh.surface_get_arrays(i)
   var vertices = arrays[Mesh.ARRAY_VERTEX]
   var indices = arrays[Mesh.ARRAY_INDEX]
   if indices==null or indices.size()==0:continue
   var keep = PackedInt32Array()
   var cut = PackedInt32Array()
   for k in range(0,indices.size(),3):
    var center = Vector3.ZERO
    for j in range(3):center+=(node.global_transform*vertices[indices[k+j]])/3
    if center.z < -7.5 and center.y>.65:
     for j in range(3):cut.append(indices[k+j])
    else:
     for j in range(3):keep.append(indices[k+j])
   for pair in [[solid,keep],[back,cut]]:
    if pair[1].size()==0:continue
    var portion = arrays.duplicate()
    portion[Mesh.ARRAY_INDEX]=pair[1]
    pair[0].add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,portion)
    pair[0].surface_set_material(pair[0].get_surface_count()-1,node.get_active_material(i))
  if back.get_surface_count()>0:
   var wall = MeshInstance3D.new()
   wall.mesh=back
   node.get_parent().add_child(wall)
   wall.transform=node.transform
   rear_walls.append(wall)
   node.mesh=solid
   for i in range(solid.get_surface_count()):node.set_surface_override_material(i,null)

func make_guide():
 var guide = load("res://assets/anime-male-mobile.glb").instantiate()
 guide.name="Guide"
 guide.position=Vector3(-3.2,.12,5.3)
 guide.scale=Vector3.ONE*.82
 guide.rotation.y=.65
 add_child(guide)
 for node in guide.find_children("*","MeshInstance3D",true,false):
  var label = str(node.name)
  node.visible=not ("_traveler_" in label or "_armor_" in label)
  for i in range(node.mesh.get_surface_count()):
   var old = node.get_active_material(i)
   if not old is StandardMaterial3D:continue
   material_refs.append(old)
   var material = old.duplicate()
   material_refs.append(material)
   material.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED
   material.cull_mode=BaseMaterial3D.CULL_DISABLED
   if str(material.resource_name)=="Anime_Cloth":material.albedo_color=Color("#b99254")
   if material.transparency!=BaseMaterial3D.TRANSPARENCY_DISABLED:
    material.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
    material.alpha_scissor_threshold=.45
   node.set_surface_override_material(i,material)
 for anim in guide.find_children("*","AnimationPlayer",true,false):
  if anim.has_animation("Idle"):
   anim.get_animation("Idle").loop_mode=Animation.LOOP_LINEAR
   anim.play("Idle")

func update_character():
 if actor:
  player.remove_child(actor)
  actor.queue_free()
 var file = "anime-female-mobile" if look.get("body")=="female" else "anime-male-mobile"
 actor = load("res://assets/"+file+".glb").instantiate()
 player.add_child(actor)
 animation = null
 for node in actor.find_children("*","AnimationPlayer",true,false):
  animation = node
 for node in actor.find_children("*","MeshInstance3D",true,false):
  var n = String(node.name)
  node.visible = not ("_scholar_" in n or "_traveler_" in n or "_armor_" in n) or ("_"+str(look.get("outfit","scholar"))+"_") in n
  for i in range(node.mesh.get_surface_count()):
   var old = node.get_active_material(i)
   if not old is StandardMaterial3D:continue
   material_refs.append(old)
   var material = old.duplicate()
   material_refs.append(material)
   var label = String(material.resource_name)
   material.cull_mode = BaseMaterial3D.CULL_DISABLED
   material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
   if label == "Anime_Cloth" or label == "Anime_Armor":
    material.albedo_color = Color(TINTS.get(look.get("color"),TINTS.jade))
    if label == "Anime_Armor":material.albedo_color = material.albedo_color.darkened(.18)
   if label.begins_with("Anime_Hair"):material.albedo_color = Color(HAIR.get(look.get("hairColor"),HAIR.ink))
   if label == "Anime_Face":material.albedo_color = Color(SKIN.get(look.get("skin"),SKIN.warm))
   if material.transparency != BaseMaterial3D.TRANSPARENCY_DISABLED:
    material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
    material.alpha_scissor_threshold = .45
   node.set_surface_override_material(i,material)
 motion = ""
 set_motion("Idle")

func set_motion(next):
 if next==motion or animation==null:return
 for clip in animation.get_animation_list():
  if String(clip).get_file()==next or String(clip).ends_with(next):
   animation.get_animation(clip).loop_mode = Animation.LOOP_LINEAR if next!="Bow" else Animation.LOOP_NONE
   animation.play(clip,.16)
   motion = next
   return

func blocked(pos:Vector2):
 var limit = 22.4 if place=="village" else 8.0
 if abs(pos.x)>limit or abs(pos.y)>limit:return true
 if place=="village":
  for hall in HALLS:
   if abs(pos.x-hall.x)<hall.w*.5+.65 and abs(pos.y-hall.z)<hall.d*.5+.65:return true
  for item in [Vector3(3.6,3,1.9),Vector3(10,8,2.6),Vector3(-6,8,2.6)]:
   if abs(pos.x-item.x)<item.z and abs(pos.y-item.y)<item.z:return true
 else:
  for item in EXHIBITS:
   if abs(pos.x-item.x)<1.7 and abs(pos.y-item.z)<1.4:return true
  if pos.y < -7.8:return true
 return false

func add_box(pos:Vector3,size:Vector3):
 var body = StaticBody3D.new()
 var shape = CollisionShape3D.new()
 shape.shape = BoxShape3D.new()
 shape.shape.size = size
 body.add_child(shape)
 body.position = pos
 colliders.add_child(body)

func rebuild_navigation():
 for child in colliders.get_children():
  colliders.remove_child(child)
  child.queue_free()
 if place=="village":
  for hall in HALLS:add_box(Vector3(hall.x,2,hall.z),Vector3(hall.w+.4,4,hall.d+.4))
  for item in [Vector3(3.6,3,1.7),Vector3(10,8,2.3),Vector3(-6,8,2.3)]:add_box(Vector3(item.x,.8,item.y),Vector3(item.z*2,1.6,item.z*2))
 else:
  for item in EXHIBITS:add_box(item+Vector3(0,.8,0),Vector3(2.7,1.6,2))
 var limit = 23.0 if place=="village" else 8.5
 add_box(Vector3(-limit-1,2,0),Vector3(2,4,limit*2+4))
 add_box(Vector3(limit+1,2,0),Vector3(2,4,limit*2+4))
 add_box(Vector3(0,2,-limit-1),Vector3(limit*2+4,4,2))
 add_box(Vector3(0,2,limit+1),Vector3(limit*2+4,4,2))
 astar.region = Rect2i(-32,-32,65,65)
 astar.cell_size = Vector2(.75,.75)
 astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
 astar.update()
 for x in range(-32,33):
  for z in range(-32,33):astar.set_point_solid(Vector2i(x,z),blocked(Vector2(x*.75,z*.75)))

func stop_route():
 route.clear()
 route_goal = ""
 for marker in path_markers.get_children():
  path_markers.remove_child(marker)
  marker.queue_free()

func navigate(target:Vector3,goal=""):
 if blocked(Vector2(target.x,target.z)):return
 var start = Vector2i(round(player.position.x/.75),round(player.position.z/.75))
 var end = Vector2i(round(target.x/.75),round(target.z/.75))
 if not astar.is_in_boundsv(start) or not astar.is_in_boundsv(end) or astar.is_point_solid(end):return
 var points = astar.get_point_path(start,end)
 stop_route()
 route_goal = goal
 for i in range(1,points.size()):
  route.append(Vector3(points[i].x,.13,points[i].y))
 route.append(Vector3(target.x,.13,target.z))
 for i in range(0,route.size(),3):
  var mark = MeshInstance3D.new()
  mark.mesh = CylinderMesh.new()
  mark.mesh.top_radius = .1
  mark.mesh.bottom_radius = .1
  mark.mesh.height = .018
  var material = StandardMaterial3D.new()
  material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
  material.albedo_color = Color("#ceaa50")
  mark.material_override = material
  mark.position = route[i]+Vector3(0,.025,0)
  path_markers.add_child(mark)
 send({"type":"route","goal":goal})

func enter_hall(id):
 stop_route()
 remote_keys.clear()
 if place=="village":
  if nearest!=id:return
  place = id
  exterior.visible = false
  get_node("Guide").visible = false
  spring.visible = id=="cq"
  room.visible = id!="cq"
  player.position = Vector3(0,.13,5.2)
 else:
  var old = place
  place = "village"
  exterior.visible = true
  get_node("Guide").visible = true
  spring.visible = false
  room.visible = false
  for hall in HALLS:
   if hall.id==old:player.position = Vector3(hall.x,.13,hall.z+hall.d*.5+1.75)
 player.velocity = Vector3.ZERO
 nearest = ""
 rebuild_navigation()
 camera_started = false
 send({"type":"place","place":place})

func interact():
 if nearest.is_empty():return
 if place=="village":
  if nearest=="guide":send({"type":"guide"})
  else:enter_hall(nearest)
 elif nearest=="exit":enter_hall("")
 else:send({"type":"exhibit","place":place,"case":nearest})

func receive(args):
 if args.size()!=1:return
 var msg = JSON.parse_string(str(args[0]))
 if not msg is Dictionary:return
 if msg.get("type")=="init" and msg.get("mode")=="myth":
  get_tree().call_deferred("change_scene_to_file","res://myth.tscn")
  return
 match msg.get("type",""):
  "init","appearance":
   var value = msg.get("appearance",{})
   if value is Dictionary:
    var previous = look.duplicate()
    for key in look.keys():
     if value.has(key):look[key]=str(value[key])
    if previous!=look:update_character()
   send({"type":"configured","body":look.body,"outfit":look.outfit})
  "key":
   var key = str(msg.get("key",""))
   if key in ["up","down","left","right","sprint"]:remote_keys[key]=msg.get("down",false)==true
  "jump":
   if player.is_on_floor() and not paused:player.velocity.y=6.0
  "stop":remote_keys.clear();stop_route()
  "pause":paused=msg.get("paused",false)==true;remote_keys.clear()
  "interact":interact()
  "hall":
   if place!="village":return
   for hall in HALLS:
    if hall.id==msg.get("id"):navigate(Vector3(hall.x,0,hall.z+hall.d*.5+1.75),hall.id)
  "guideRoute":
   if place=="village":navigate(Vector3(-3.2,.13,5.3),"guide")
  "exhibit":
   if place!="village":navigate(Vector3(0,0,-3.15),"north")
  "exit":
   if place!="village":enter_hall("")
  "zoom":zoom_size=clamp(zoom_size+float(msg.get("delta",0)),6.5,35)
  "rotate":yaw+=float(msg.get("delta",0))
  "reset":yaw=.53;elevation=.62;zoom_size=12.5
  "bow":set_motion("Bow")

func send(message:Dictionary):
 if bridge:bridge.emit(JSON.stringify(message))

func _physics_process(delta):
 if player==null or paused:return
 if not player.is_on_floor():player.velocity.y-=19.0*delta
 var movement = Vector2.ZERO
 if Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP) or remote_keys.get("up",false):movement.y-=1
 if Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN) or remote_keys.get("down",false):movement.y+=1
 if Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT) or remote_keys.get("left",false):movement.x-=1
 if Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT) or remote_keys.get("right",false):movement.x+=1
 var sprint = Input.is_physical_key_pressed(KEY_SHIFT) or remote_keys.get("sprint",false)
 var direction = Vector3.ZERO
 if movement.length()>0:
  stop_route()
  movement = movement.normalized()
  direction = Vector3(movement.x*cos(yaw)+movement.y*sin(yaw),0,-movement.x*sin(yaw)+movement.y*cos(yaw))
 elif route.size()>0:
  var next = route[0]-player.position
  next.y=0
  if next.length()<.2:
   route.remove_at(0)
   if route.is_empty():stop_route();send({"type":"arrived"})
  else:direction=next.normalized()
 var speed = 5.8 if sprint else 3.4
 player.velocity.x = direction.x*speed
 player.velocity.z = direction.z*speed
 player.move_and_slide()
 if direction.length()>.1:
  actor.rotation.y=lerp_angle(actor.rotation.y,atan2(direction.x,direction.z),min(1,delta*12))
  set_motion("Run" if sprint else "Walk")
 elif motion!="Bow" or not animation.is_playing():set_motion("Idle")
 var next_nearest = ""
 var best = 2.2
 var options = []
 if place=="village":
  for hall in HALLS:options.append([hall.id,Vector3(hall.x,player.position.y,hall.z+hall.d*.5+1.75)])
  options.append(["guide",Vector3(-3.2,player.position.y,5.3)])
 else:
  options.append(["exit",Vector3(0,player.position.y,6.5)])
  for i in range(3):options.append([["west","north","east"][i],Vector3(EXHIBITS[i].x,player.position.y,EXHIBITS[i].z)])
 for option in options:
  var distance = player.position.distance_to(option[1])
  if distance<best:best=distance;next_nearest=option[0]
 if next_nearest!=nearest:
  nearest=next_nearest
  send({"type":"near","id":nearest,"place":place})

func _process(delta):
 if player==null:return
 var portrait = get_viewport().get_visible_rect().size.x < 650
 camera.size=zoom_size*(1.5 if portrait else 1.0)
 var target = player.position+Vector3(0,.7,0)
 var offset = Vector3(sin(yaw)*cos(elevation),sin(elevation),cos(yaw)*cos(elevation))*32
 camera.position=target+offset if not camera_started else camera.position.lerp(target+offset,1-exp(-8*delta))
 camera.look_at(target)
 for wall in rear_walls:wall.visible=camera.position.z>-6
 camera_started=true
 blink_time+=delta
 var blink = clamp(1-abs(fmod(blink_time,4)-2.68)/.08,0,1)
 for node in actor.find_children("*","MeshInstance3D",true,false):
  var index = node.find_blend_shape_by_name("Blink")
  if index>=0:node.set_blend_shape_value(index,blink)
 elapsed+=delta
 if elapsed>.4:
  elapsed=0
  send({"type":"state","x":snapped(player.position.x,.01),"z":snapped(player.position.z,.01),"y":snapped(player.position.y,.01),"place":place,"nearest":nearest,"body":look.body,"outfit":look.outfit,"motion":motion,"routing":route.size()>0,"fps":Engine.get_frames_per_second()})

func tap_screen(pos):
 if paused:return
 var origin = camera.project_ray_origin(pos)
 var point = Plane(Vector3.UP,.13).intersects_ray(origin,camera.project_ray_normal(pos))
 if point!=null:navigate(point)

func _input(event):
 if paused:return
 if event is InputEventKey and event.pressed and not event.echo:
  if event.physical_keycode==KEY_E:interact()
  if event.physical_keycode==KEY_SPACE and player.is_on_floor():player.velocity.y=6.0
 if event is InputEventMouseButton:
  if event.button_index==MOUSE_BUTTON_WHEEL_UP:zoom_size=clamp(zoom_size-1,6.5,35)
  if event.button_index==MOUSE_BUTTON_WHEEL_DOWN:zoom_size=clamp(zoom_size+1,6.5,35)
  if event.button_index in [MOUSE_BUTTON_LEFT,MOUSE_BUTTON_RIGHT]:
   if event.pressed:drag_start=event.position;pointer_down=true;dragging=event.button_index==MOUSE_BUTTON_RIGHT
   else:
    if pointer_down and not dragging:tap_screen(event.position)
    pointer_down=false
 if event is InputEventMouseMotion and pointer_down:
  if event.position.distance_to(drag_start)>8:dragging=true
  if dragging:yaw-=event.relative.x*.007;elevation=clamp(elevation+event.relative.y*.004,.32,1.25)
 if event is InputEventScreenTouch:
  if event.pressed:
   touch_points[event.index]=event.position
   if touch_points.size()==1:drag_start=event.position;touches_moved=false
   else:touches_moved=true
  else:
   if touch_points.size()==1 and not touches_moved:tap_screen(event.position)
   touch_points.erase(event.index)
   touch_last_distance=0
 if event is InputEventScreenDrag:
  touch_points[event.index]=event.position
  if touch_points.size()>1:
   var values = touch_points.values()
   var distance = values[0].distance_to(values[1])
   if touch_last_distance>0:zoom_size=clamp(zoom_size*touch_last_distance/max(1,distance),6.5,35)
   touch_last_distance=distance
   touches_moved=true
  elif event.position.distance_to(drag_start)>8:
   touches_moved=true
   yaw-=event.relative.x*.007
   elevation=clamp(elevation+event.relative.y*.004,.32,1.25)
