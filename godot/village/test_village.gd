extends SceneTree

func _initialize():
 create_timer(80).timeout.connect(func(): quit(1))
 run.call_deferred()

func run():
 var scene = load("res://main.tscn").instantiate()
 root.add_child(scene)
 for i in range(12):await physics_frame
 assert(Engine.max_fps==0)
 assert(scene.player is CharacterBody3D)
 assert(scene.player.is_on_floor())
 assert(scene.animation!=null)
 var animations = scene.animation.get_animation_list()
 for name in ["Idle","Walk","Run","Bow"]:assert(animations.has(name),"Missing animation "+name)
 scene.receive([JSON.stringify({"type":"appearance","appearance":{"body":"female","outfit":"armor","color":"plum"}})])
 await process_frame
 assert(scene.actor.scene_file_path.ends_with("anime-female-mobile.glb"))
 var visible_outfits = []
 for mesh in scene.actor.find_children("*","MeshInstance3D",true,false):
  var n = str(mesh.name)
  if mesh.visible and ("_scholar_" in n or "_traveler_" in n or "_armor_" in n):visible_outfits.append(n)
 assert(visible_outfits.size()>0)
 for n in visible_outfits:assert("_armor_" in n)
 scene.receive([JSON.stringify({"type":"hall","id":"cq"})])
 assert(scene.route.size()>0)
 for point in scene.route:assert(not scene.blocked(Vector2(point.x,point.z)))
 for i in range(900):
  await physics_frame
  if scene.nearest=="cq" and scene.route.is_empty():break
 assert(scene.nearest=="cq","Character must physically reach hall")
 scene.interact()
 await physics_frame
 assert(scene.place=="cq" and scene.spring.visible and not scene.exterior.visible)
 scene.receive([JSON.stringify({"type":"exhibit"})])
 for i in range(600):
  await physics_frame
  if scene.nearest=="north" and scene.route.is_empty():break
 assert(scene.nearest=="north","Character must reach an exhibit")
 scene.receive([JSON.stringify({"type":"exit"})])
 await physics_frame
 assert(scene.place=="village" and scene.exterior.visible)
 scene.receive([JSON.stringify({"type":"jump"})])
 for i in range(10):await physics_frame
 assert(scene.player.position.y>.4,"Jump must move real physics body")
 scene.receive([JSON.stringify({"type":"pause","paused":true})])
 var before = scene.player.position
 for i in range(3):await physics_frame
 assert(scene.player.position==before)
 print("GODOT_SCENE_TEST_OK: female armor, four clips, pathfinding, real hall/exhibit arrival, entry/exit, jumping, pause, unlimited FPS")
 scene.queue_free()
 quit(0)
