extends SceneTree
var game
var failures=[]
func _initialize():call_deferred("run_tests")
func check(value,label):
 if not value:failures.append(label);printerr("FAIL ",label)
func run_tests():
 game=load("res://myth.tscn").instantiate();root.add_child(game)
 await physics_frame
 check(game.player is CharacterBody3D,"real physics character")
 check(Engine.max_fps==0,"no FPS cap")
 game.begin_run({"id":"test","weapon":"sword","difficulty":"standard","stats":{"agility":2,"strength":2,"dexterity":2,"focus":2,"insight":2,"planning":2},"abilities":["steady","listen"],"checkpoint":0,"seed":4})
 check(game.enemies.size()==3,"three first-encounter enemies")
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
 print("MYTH_SCENE_TESTS ",JSON.stringify({"ok":failures.is_empty(),"failures":failures,"checks":15}))
 quit(0 if failures.is_empty() else 1)
