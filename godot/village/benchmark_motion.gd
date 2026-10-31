extends SceneTree
var game
var output={"version":1,"viewport":[1280,720],"renderer":"Compatibility","fpsCap":0,"cases":[]}
func _initialize():call_deferred("run")
func percentile(samples:Array,p:float):
 var sorted=samples.duplicate();sorted.sort();return sorted[clampi(int(ceil((sorted.size()-1)*p)),0,sorted.size()-1)]
func measure(label:String,checkpoint:int):
 game.begin_run({"id":"local-performance","test":true,"weapon":"sword","difficulty":"guided","checkpoint":checkpoint,"seed":5})
 for foe in game.enemies:foe.hp=1000000;foe.max=1000000
 game.zoom_size=12.8;game.yaw=.3;game.elevation=.67
 for i in range(60):await process_frame
 var frames=[];var draw=[];var triangles=[];var cpu=[];var before=Time.get_ticks_usec()
 for i in range(240):
  game.remote_keys={"right":i%120<60,"left":i%120>=60};game.yaw+=.003
  await process_frame
  var now=Time.get_ticks_usec();frames.append((now-before)/1000.0);before=now
  draw.append(Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME));triangles.append(Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME));cpu.append(Performance.get_monitor(Performance.TIME_PROCESS)*1000.0)
 game.remote_keys.clear()
 var result={"label":label,"samples":frames.size(),"frameMedianMs":percentile(frames,.5),"frameP95Ms":percentile(frames,.95),"frameMaxMs":frames.max(),"over33ms":frames.filter(func(v):return v>33.4).size(),"drawCallsMedian":percentile(draw,.5),"primitivesMedian":percentile(triangles,.5),"cpuP95Ms":percentile(cpu,.95)}
 output.cases.append(result);print("PERF_CASE ",JSON.stringify(result))
func run():
 root.size=Vector2i(1280,720)
 game=load("res://myth.tscn").instantiate();root.add_child(game)
 await process_frame
 await game.warm_character()
 await measure("forest_walk_orbit",0)
 await measure("fox_orbit",3)
 output["staticMeshes"]=game.level_root.find_children("*","MeshInstance3D",true,false).size()
 var args=OS.get_cmdline_user_args();var target=args[0] if args.size()>0 else "/private/tmp/zh-motion-perf.json"
 var file=FileAccess.open(target,FileAccess.WRITE);file.store_string(JSON.stringify(output,"  ")+"\n");file.close()
 print("MOTION_BENCHMARK_DONE");quit()
