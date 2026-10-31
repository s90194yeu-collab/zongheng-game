extends SceneTree
var game
var failures=[]
var count=0
func check(value,label):
 count+=1
 if not value:failures.append(label);printerr("FAIL ",label)
func _initialize():call_deferred("run")
func run():
 game=load("res://myth.tscn").instantiate();root.add_child(game);await physics_frame
 check(physics_interpolation,"physics and drawing are interpolated")
 check(game.actor.data.directions==8 and game.actor.data.regions.size()==96,"male has eight real directions and 96 frames")
 var actor=game.actor;var seen=[]
 for view in range(8):
  game.camera.position=game.player.position+Vector3(sin(view*TAU/8)*10,8,cos(view*TAU/8)*10);game.camera.look_at(game.player.position)
  actor.face_camera(game.camera,Vector3.BACK,false,true,0,.60)
  seen.append(actor.direction)
  check(actor.current_frame%12==9,"camera orbit preserves strike phase "+str(view))
 seen.sort();check(seen==[0,1,2,3,4,5,6,7],"all eight view sectors are independently reachable")
 game.camera.position=game.player.position+Vector3(0,8,10);game.camera.look_at(game.player.position)
 var steps=[]
 for i in range(6):actor.walk_phase=(i+.1)/6.0;actor.face_camera(game.camera,Vector3.BACK,true,false,0);steps.append(actor.current_frame%12)
 check(steps==[0,1,2,3,4,5],"walk actually plays six different painted frames")
 actor.direction=0;var jitter=[]
 for angle in [.39,.40,.38,.41,.37]:
  game.camera.position=game.player.position+Vector3(sin(angle)*10,8,cos(angle)*10);game.camera.look_at(game.player.position);actor.face_camera(game.camera,Vector3.BACK,false,false,0);jitter.append(actor.direction)
 check(jitter.all(func(v):return v==0),"small camera fluctuations do not flicker directions")
 game.look.body="female";game.update_character();game.equip_weapon()
 check(game.actor.data.regions.size()==96 and game.actor.data.textures[0].resource_path.ends_with("female-0.png"),"female has independent complete animation")
 game.begin_run({"id":"motion-test","test":true,"weapon":"sword","difficulty":"guided","checkpoint":0,"seed":5})
 var target=game.enemies[0];game.place_player(target.node.position+Vector3(0,.15,1.8));game.selected=target
 var hp=target.hp;game.attack();check(target.hp==hp and not game.pending_strike.is_empty(),"attack anticipation does not deal damage before impact")
 for i in range(12):await physics_frame
 check(target.hp<hp and game.pending_strike.is_empty(),"damage lands during animated impact")
 game.attack_cd=0;game.attack();game.dodge();check(game.pending_strike.is_empty(),"dodge cancels an unlanded strike")
 game.begin_run({"id":"ranged","test":true,"weapon":"talisman","checkpoint":0,"seed":5})
 var ranged=game.enemies[0];game.place_player(ranged.node.position+Vector3(0,.15,6));game.selected=ranged;game.attack()
 check(game.projectiles.is_empty(),"talisman also has anticipation")
 for i in range(12):await physics_frame
 check(game.projectiles.size()>0,"talisman launches on the impact frame")
 var at=Vector3(7,.15,24);game.place_player(at);check(game.player.get_global_transform_interpolated().origin.distance_to(at)<.01,"teleport resets interpolation without a long visual streak")
 check(game.hd_surface(Vector2(1,0))==game.hd_surface(Vector2(1,0)),"surface shaders and materials are shared")
 var forest=game.level_root.get_child(0)
 game.begin_run({"id":"repeat","test":true,"checkpoint":0,"seed":5})
 check(game.level_root.get_child(0)==forest and game.enemies.size()==3,"new run reuses static forest and resets combat")
 for i in range(90):game.update_render_quality(.035)
 check(game.quality_scale<game.quality_ceiling and game.quality_scale>=game.quality_ceiling*.70,"slow frames adapt 3D quality without an FPS cap")
 check(Engine.max_fps==0,"no artificial FPS cap")
 print("MOTION_TESTS ",JSON.stringify({"ok":failures.is_empty(),"checks":count,"failures":failures}));quit(0 if failures.is_empty() else 1)
