extends SceneTree
var game
func _initialize():call_deferred("capture")
func shot(name):
 for i in range(16):await process_frame
 await RenderingServer.frame_post_draw
 var image=root.get_texture().get_image()
 image.save_png(OS.get_cmdline_user_args()[0]+"/"+name+".png")
func capture():
 root.size=Vector2i(1280,800)
 game=load("res://myth.tscn").instantiate();root.add_child(game)
 await process_frame
 game.begin_run({"id":"art-preview","test":true,"weapon":"sword","difficulty":"guided","checkpoint":0,"seed":4})
 game.player.position=Vector3(0,.15,20)
 game.paused=true;game.zoom_size=12;game.yaw=.38;game.camera_started=false
 await shot("HD2D林口")
 game.look.body="female";game.update_character();game.equip_weapon()
 game.player.position=Vector3(0,.15,7.5);game.yaw=-.4;game.camera_started=false
 await shot("HD2D溪橋女角色")
 game.begin_run({"id":"boss-preview","test":true,"weapon":"talisman","difficulty":"guided","checkpoint":3,"seed":4})
 game.player.position=Vector3(0,.15,-32);game.paused=true;game.zoom_size=14;game.yaw=.23;game.camera_started=false
 await shot("HD2D九尾狐")
 print("HD2D_CAPTURE_DONE");quit()
