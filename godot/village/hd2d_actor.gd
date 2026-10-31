extends Node3D
## Original AI atlases: four true views, two walk poses and one attack pose.
## Physics, identity and rewards remain in the original game and GAS bridge.
static var sheets = {}
var sprite: Sprite3D
var data: Dictionary
var enemy_row = -1
var clock = 0.0
var current_frame = -1
var scale_per_pixel = .006
var motion = "Idle"

func setup(path:String,height:float,row:int=-1):
 enemy_row=row
 if not sheets.has(path):
  var tex=load(path) as Texture2D
  var metadata=JSON.parse_string(FileAccess.get_file_as_string(path.get_basename()+".json"))
  var regions=[]
  for r in metadata.regions:regions.append(Rect2(r[0],r[1],r[2],r[3]))
  sheets[path]={"texture":tex,"regions":regions}
 data=sheets[path]
 var base=data.regions[maxi(0,row)*4]
 scale_per_pixel=height/maxf(1.0,base.size.y)
 sprite=Sprite3D.new()
 sprite.texture=data.texture
 sprite.billboard=BaseMaterial3D.BILLBOARD_ENABLED
 sprite.alpha_cut=SpriteBase3D.ALPHA_CUT_DISCARD
 sprite.alpha_scissor_threshold=.32
 sprite.texture_filter=BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
 sprite.shaded=false
 sprite.double_sided=true
 sprite.region_enabled=true
 sprite.pixel_size=scale_per_pixel
 sprite.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
 add_child(sprite)
 set_frame(maxi(0,row)*4)

func set_frame(index:int):
 if current_frame==index:return
 current_frame=index
 sprite.region_rect=data.regions[index]
 sprite.position.y=data.regions[index].size.y*scale_per_pixel*.5

func face_camera(cam:Camera3D,heading:Vector3,walking:bool,attacking:bool,delta:float):
 clock+=delta
 var toward=cam.global_position-global_position;toward.y=0;toward=toward.normalized()
 var right=cam.global_basis.x;right.y=0
 var forward=heading.normalized()
 var front=forward.dot(toward)
 var direction=0 if front>.70 else 2 if front<-.70 else 1 if forward.dot(right)>0 else 3
 if enemy_row>=0:set_frame(enemy_row*4+direction)
 else:
  var pose=3 if attacking else (1+int(clock*8)%2) if walking else 0
  set_frame(direction*4+pose)
 sprite.global_position=global_position+cam.global_basis.y*(data.regions[current_frame].size.y*scale_per_pixel*global_basis.get_scale().y*.5)
 # Gentle gait deformation complements actual painted foot changes.
 sprite.scale=Vector3(1.0,1.0+sin(clock*16)*.018 if walking else 1.0+sin(clock*2.2)*.008,1.0)

func set_appearance(look:Dictionary):
 # Restrained color grading preserves the painted face and line work.
 var colors={"jade":Color("#d9fff0"),"ink":Color("#c9e1ff"),"amber":Color("#ffe6b6"),"crane":Color.WHITE,"plum":Color("#ffd0e5"),"moon":Color("#e6d7ff"),"peach":Color("#ffddd1"),"sky":Color("#d2f6ff")}
 sprite.modulate=Color.WHITE.lerp(colors.get(look.get("color"),Color.WHITE),.35)
