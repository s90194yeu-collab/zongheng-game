extends Node3D
## Animated transparent atlases; all directions share the same action clock.
## A render-only sprite follows interpolated physics without moving the collision body.
static var sheets = {}
var sprite: Sprite3D
var data: Dictionary
var enemy_row = -1
var clock = 0.0
var walk_phase = 0.0
var attack_clock = 0.0
var was_attacking = false
var current_frame = -1
var current_page = -1
var direction = -1
var scale_per_pixel = .006
var actor_height = 2.15
var motion = "Idle"

func setup(path:String,height:float,row:int=-1):
 enemy_row=row;actor_height=height
 if not sheets.has(path):
  var metadata=JSON.parse_string(FileAccess.get_file_as_string(path if path.ends_with(".json") else path.get_basename()+".json"))
  var regions=[];var pivots=[];var heights=[];var pages=[];var textures=[]
  var animated=metadata.has("pages")
  if animated:
   for name in metadata.pages:textures.append(load(path.get_base_dir()+"/"+str(name)))
   for entry in metadata.regions:
    var r=entry.rect;regions.append(Rect2(r[0],r[1],r[2],r[3]));pivots.append(Vector2(entry.pivot[0],entry.pivot[1]));heights.append(float(entry.bodyHeight));pages.append(int(entry.page))
  else:
   textures.append(load(path))
   for r in metadata.regions:
    regions.append(Rect2(r[0],r[1],r[2],r[3]));pivots.append(Vector2(r[2]*.5,r[3]));heights.append(float(r[3]));pages.append(0)
  sheets[path]={"textures":textures,"regions":regions,"pivots":pivots,"heights":heights,"pages":pages,"animated":animated,"directions":8 if animated else 4}
 data=sheets[path]
 sprite=Sprite3D.new();sprite.top_level=true;sprite.physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_OFF
 sprite.billboard=BaseMaterial3D.BILLBOARD_ENABLED
 sprite.alpha_cut=SpriteBase3D.ALPHA_CUT_DISCARD;sprite.alpha_scissor_threshold=.32
 sprite.texture_filter=BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
 sprite.shaded=false;sprite.double_sided=true;sprite.region_enabled=true
 sprite.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
 add_child(sprite);set_frame(maxi(0,row)*4 if not data.animated else 6)

func set_frame(index:int):
 if current_frame==index:return
 current_frame=index
 var page=int(data.pages[index])
 if current_page!=page:sprite.texture=data.textures[page];current_page=page
 sprite.region_rect=data.regions[index]
 scale_per_pixel=actor_height/maxf(1.0,float(data.heights[index]));sprite.pixel_size=scale_per_pixel

func advance_walk(distance:float):
 walk_phase=fposmod(walk_phase+distance/2.4,1.0)

func view_direction(cam:Camera3D,heading:Vector3):
 # Orthographic viewers share the camera basis, not a varying eye-to-sprite ray.
 var toward=cam.global_basis.z;toward.y=0;toward=toward.normalized()
 var right=cam.global_basis.x;right.y=0;right=right.normalized()
 var forward=heading;forward.y=0;forward=forward.normalized()
 var angle=atan2(forward.dot(right),forward.dot(toward))
 var step=TAU/float(data.directions)
 var candidate=int(floor(fposmod(angle+step*.5,TAU)/step))%int(data.directions)
 # Small hysteresis prevents flickering when movement/camera rests at a sector edge.
 if direction<0 or absf(wrapf(angle-direction*step,-PI,PI))>step*.5+.06:direction=candidate
 return direction

func face_camera(cam:Camera3D,heading:Vector3,walking:bool,attacking:bool,delta:float,attack_progress:float=-1.0):
 clock+=delta
 var view=view_direction(cam,heading)
 if attacking and not was_attacking:attack_clock=0.0
 if attacking:attack_clock+=delta
 was_attacking=attacking
 if enemy_row>=0:set_frame(enemy_row*4+view)
 elif data.animated:
  var phase=clampf(attack_progress if attack_progress>=0 else attack_clock/.34,0.0,.9999)
  var pose=6+mini(5,int(phase*6)) if attacking else int(floor(walk_phase*6))%6 if walking else 6
  set_frame(view*12+pose)
 else:
  var pose=3 if attacking else (1+int(clock*8)%2) if walking else 0
  set_frame(view*4+pose)
 var origin=get_global_transform_interpolated().origin
 var region=data.regions[current_frame];var pivot=data.pivots[current_frame]
 var root_scale=global_basis.get_scale().y
 var pixel=scale_per_pixel*root_scale
 sprite.global_position=origin+cam.global_basis.x*(region.size.x*.5-pivot.x)*pixel+cam.global_basis.y*(pivot.y-region.size.y*.5)*pixel
 sprite.scale=Vector3.ONE*root_scale

func set_appearance(look:Dictionary):
 var colors={"jade":Color("#d9fff0"),"ink":Color("#c9e1ff"),"amber":Color("#ffe6b6"),"crane":Color.WHITE,"plum":Color("#ffd0e5"),"moon":Color("#e6d7ff"),"peach":Color("#ffddd1"),"sky":Color("#d2f6ff")}
 sprite.modulate=Color.WHITE.lerp(colors.get(look.get("color"),Color.WHITE),.35)
