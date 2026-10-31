extends SceneTree
var game
var failures=[]
var check_count=0
func _initialize():call_deferred("run_tests")
func check(value,label):
 check_count+=1
 if not value:failures.append(label);printerr("FAIL ",label)
func run_tests():
 game=load("res://myth.tscn").instantiate();root.add_child(game)
 await physics_frame
 root.size=Vector2i(390,844)
 await process_frame
 await process_frame
 check(game.camera.keep_aspect==Camera3D.KEEP_WIDTH,"portrait camera preserves horizontal combat space")
 root.size=Vector2i(1280,720)
 await process_frame
 await process_frame
 check(game.camera.keep_aspect==Camera3D.KEEP_HEIGHT,"landscape camera returns to original framing")
 check(game.player is CharacterBody3D,"real physics character")
 check(Engine.max_fps==0,"no FPS cap")
 check(game.actor.sprite is Sprite3D,"painted player is a real sprite in 3D")
 check(game.actor.data.regions.size()==16,"sixteen painted player frames")
 var heading=Vector3.BACK
 game.camera.position=game.player.position+Vector3(0,8,10)
 game.camera.look_at(game.player.position)
 game.actor.face_camera(game.camera,heading,false,false,0.0)
 check(game.actor.current_frame==0,"front view faces camera")
 game.actor.face_camera(game.camera,heading,true,false,.15)
 check(game.actor.current_frame in [1,2],"walk uses painted stepping frames")
 game.actor.face_camera(game.camera,heading,false,true,0.0)
 check(game.actor.current_frame==3,"attack uses painted action frame")
 game.camera.position=game.player.position+Vector3(0,8,-10)
 game.camera.look_at(game.player.position)
 game.actor.face_camera(game.camera,heading,false,false,0.0)
 check(game.actor.current_frame==8,"camera orbit selects actual back artwork")
 game.look.body="female";game.update_character();game.equip_weapon()
 check(game.actor.data.texture.resource_path.ends_with("female.png"),"female character has independent painted atlas")
 game.begin_run({"id":"test","weapon":"sword","difficulty":"standard","stats":{"agility":2,"strength":2,"dexterity":2,"focus":2,"insight":2,"planning":2},"abilities":["steady","listen"],"checkpoint":0,"seed":4})
 check(game.enemies.size()==3,"three first-encounter enemies")
 check(game.enemies[0].visual.sprite is Sprite3D,"monsters use directional standees")
 await process_frame
 game.tap_screen(game.enemy_screen_rect(game.enemies[0]).get_center())
 check(game.selected==game.enemies[0],"painted enemy body is clickable")
 game.auto_attack=false;game.selected={}
 var before=game.player.position
 game.remote_keys.right=true
 for i in range(20):await physics_frame
 game.remote_keys.clear()
 check(game.player.position.distance_to(before)>.5,"direction controls move through physics")
 var energy=game.energy
 game.dodge()
 check(game.energy<energy and game.invulnerable>0,"dodge uses energy and protects")
 var hp=game.health
 game.hero_hurt(100)
 check(game.health==hp,"invulnerability blocks damage")
 game.invulnerable=0;game.hero_hurt(100)
 check(game.health<hp,"enemy damage reaches health")
 var e=game.enemies[0]
 var count=game.enemies.size()
 game.damage_enemy(e,200,true)
 check(game.enemies.size()==count+2 and e.dead,"ink splits once on heavy hit")
 var small=game.enemies[-1]
 var after_split=game.enemies.size()
 game.damage_enemy(small,200,true)
 check(game.enemies.size()==after_split,"split children do not split")
 game.begin_run({"id":"boss","weapon":"talisman","difficulty":"standard","stats":{"agility":2,"strength":2,"dexterity":2,"focus":2,"insight":2,"planning":2},"abilities":["steady","listen"],"checkpoint":3,"seed":5})
 var fox=game.enemies[0]
 fox.hp=fox.max*.3
 game.update_fox(fox,.016,Vector3.BACK)
 check(game.phase==3,"fox enters third phase")
 var foxhp=fox.hp
 game.damage_enemy(fox,150)
 check(fox.hp==foxhp,"shield blocks direct damage")
 for i in range(2):
  game.projectile(game.lamp_nodes[i].position+Vector3(0,.7,0),game.player.position,"fire",100)
  game.update_attacks(0.0)
 check(game.lit_lamps[0] and game.lit_lamps[1] and game.shield_window>0,"fire lights both lamps and breaks shield")
 game.damage_enemy(fox,150)
 check(fox.hp<foxhp,"broken shield allows damage")
 game.mode="museum";game.museum_slots=["myth:qingqiu:fox_jade",null,null,null,null,"myth:qingqiu:fox_statue"];game.build_museum()
 await process_frame
 check(game.display_models.size()==6,"six actual 3D display slots")
 check(game.display_models[0].get_child_count()>0,"owned item is instantiated")
 game.navigate(Vector3(0,.15,4))
 check(game.route.size()>0,"museum has real pathfinding")
 print("MYTH_SCENE_TESTS ",JSON.stringify({"ok":failures.is_empty(),"failures":failures,"checks":check_count}))
 quit(0 if failures.is_empty() else 1)
