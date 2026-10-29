"""Original low-poly hand-painted-style myth models, built in Blender.
Run with Blender --background --python this-file -- --output /path/to/godot/assets.
"""
import bpy, math, random, argparse, sys
from pathlib import Path
from mathutils import Vector
args=argparse.ArgumentParser();args.add_argument('--output',required=True)
opt=args.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
out=Path(opt.output);out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
random.seed(830)
def mat(name,c,emit=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True
 m.node_tree.nodes.clear();p=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');o=m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(p.outputs['BSDF'],o.inputs['Surface']);p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.82
 if emit:p.inputs['Emission Color'].default_value=(*c,1);p.inputs['Emission Strength'].default_value=emit
 return m
M={k:mat(k,c,e) for k,c,e in [
 ('Ivory',(.93,.90,.76),0),('White',(.99,.98,.89),0),('Gold',(.79,.55,.20),0),('Jade',(.20,.58,.46),0),('DeepJade',(.07,.27,.25),0),('Pink',(.78,.43,.47),0),('Ink',(.075,.12,.20),0),('Eye',(.03,.06,.09),0),('Glow',(.97,.69,.23),.6),('Rock',(.43,.48,.40),0),('RockLight',(.63,.64,.50),0),('Wood',(.39,.27,.18),0),('Leaf',(.27,.49,.31),0),('LeafLight',(.48,.66,.36),0),('LeafGold',(.72,.72,.39),0),('Paper',(.96,.86,.64),0)]}
parts=[]
def add(obj,name,material):
 obj.name=name;obj.data.materials.append(M[material]);parts.append(obj);return obj
def sphere(name,loc,scale,material='White',segments=12,rings=8):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=bpy.context.object;o.scale=scale
 for p in o.data.polygons:p.use_smooth=True
 return add(o,name,material)
def cube(name,loc,scale,material='Jade',bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;add(o,name,material)
 if bevel:
  bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);mod=o.modifiers.new('Soft_Edges','BEVEL');mod.width=bevel;mod.segments=1
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o
def cone(name,loc,r1,r2,depth,material='Jade',verts=8):
 bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=depth,location=loc);return add(bpy.context.object,name,material)
def rod(name,a,b,r,material='Gold'):
 mid=(Vector(a)+Vector(b))*.5;o=cone(name,mid,r,r,(Vector(b)-Vector(a)).length,material,8);o.rotation_euler=(Vector(b)-Vector(a)).to_track_quat('Z','Y').to_euler();return o
def torus(name,loc,major,minor,material='Gold',rot=(0,0,0)):
 bpy.ops.mesh.primitive_torus_add(major_segments=20,minor_segments=6,location=loc,major_radius=major,minor_radius=minor,rotation=rot);return add(bpy.context.object,name,material)
def finish(name,merge=True):
 global parts
 # Vertex-baked directional light and warm bounce: inexpensive volume in WebGL.
 for obj in parts:
  if obj.type!='MESH':continue
  mesh=obj.data;attr=mesh.color_attributes.new(name='BakedLight',type='BYTE_COLOR',domain='CORNER')
  normal_matrix=obj.matrix_world.to_3x3().inverted().transposed();light=Vector((-.45,-.6,.9)).normalized()
  for poly in mesh.polygons:
   for li in poly.loop_indices:
    n=(normal_matrix @ (mesh.vertices[mesh.loops[li].vertex_index].normal if poly.use_smooth else poly.normal)).normalized()
    bright=.58+.42*max(0,n.dot(light))
    attr.data[li].color=(bright,bright*.985,bright*.93,1)
  mesh.color_attributes.active_color=attr
 bpy.ops.object.select_all(action='DESELECT')
 if merge:
  for o in parts:o.select_set(True)
  bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();parts=[bpy.context.object];parts[0].name=name
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_vertex_color='NAME',export_vertex_color_name='BakedLight',export_all_vertex_colors=False)
 for o in list(parts):bpy.data.objects.remove(o,do_unlink=True)
 parts=[]
def tail(name,index):
 spread=(index-4)*.40;phase=(index%3)*.22
 points=[]
 for j in range(11):
  t=j/10;points.append(Vector((math.sin(spread)*t*3.6,1.0+t*(2.0+phase),.85+math.sin(t*math.pi*.70)*(1.4+abs(index-4)*.18))))
 verts=[];faces=[]
 for j,p in enumerate(points):
  t=j/10;rad=.10+math.sin(math.pi*t)**.7*.35
  if j==10:rad=.015
  tangent=(points[min(j+1,10)]-points[max(j-1,0)]).normalized();side=tangent.cross(Vector((0,0,1))).normalized();up=side.cross(tangent).normalized()
  for k in range(8):verts.append(tuple(p+(side*math.cos(k*math.tau/8)+up*math.sin(k*math.tau/8))*rad))
 for j in range(10):
  for k in range(8):faces.append((j*8+k,j*8+(k+1)%8,(j+1)*8+(k+1)%8,(j+1)*8+k))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);add(o,name,'Ivory');o.data.materials.append(M['Gold'])
 for p in mesh.polygons:p.use_smooth=True;p.material_index=1 if p.index//8>=8 else 0
 return o
# Nine-tailed fox: silhouette and facial details are original geometry.
sphere('Fox_Body',(0,.10,.95),(.68,1.15,.64),'Ivory',16,10)
sphere('Fox_Chest',(0,-.69,1.05),(.65,.65,.76),'White',16,10)
sphere('Fox_Head',(0,-1.28,1.60),(.57,.54,.53),'White',16,10)
sphere('Fox_Muzzle',(0,-1.75,1.45),(.29,.40,.20),'Ivory')
sphere('Fox_Nose',(0,-2.10,1.51),(.12,.10,.085),'DeepJade')
for side in [-1,1]:
 for y in [-.65,.90]:
  rod('Fox_Leg',(side*.43,y,.78),(side*.46,y-.12,.22),.15,'White');sphere('Fox_Paw',(side*.46,y-.24,.16),(.21,.30,.14),'Ivory')
 ear=cone('Fox_Ear',(side*.40,-1.20,2.17),.24,.015,.74,'White',4);ear.rotation_euler.y=side*.20
 inner=cone('Fox_EarInner',(side*.40,-1.27,2.17),.135,.008,.47,'Pink',4);inner.rotation_euler.y=side*.20
 eye=sphere('Fox_Eye',(side*.42,-1.69,1.72),(.12,.055,.08),'Eye');eye.rotation_euler.y=side*-.25
 sphere('Fox_Iris',(side*.41,-1.738,1.73),(.046,.02,.053),'Glow')
 for z in [1.26,1.42]:
  cheek=cone('Fox_Cheek',(side*.54,-1.29,z),.18,.005,.50,'White',5);cheek.rotation_euler.y=side*1.0
 gem=cube('Fox_JadeMark',(side*.34,-1.75,1.48),(.095,.055,.20),'Jade',.02);gem.rotation_euler.y=side*.45
mark=cube('Fox_Forehead',(0,-1.68,1.99),(.15,.065,.22),'Gold',.02);mark.rotation_euler.y=.65
for i in range(9):tail('Tail'+str(i),i)
torus('Fox_Collar',(0,-.70,1.13),.50,.055,'Gold',(math.pi/2,0,0))
finish('qingqiu-fox',False)
# Ink spirit.
sphere('Ink_Body',(0,0,.58),(.58,.48,.58),'Ink',14,9)
for side in [-1,1]:
 o=cone('Ink_BrushEar',(side*.33,.03,1.12),.19,.015,.58,'Ink',6);o.rotation_euler.y=side*.45
 sphere('Ink_Eye',(side*.18,-.445,.65),(.09,.035,.12),'White');sphere('Ink_Pupil',(side*.18,-.477,.64),(.035,.012,.055),'Eye')
 sphere('Ink_Foot',(side*.30,-.10,.12),(.22,.27,.10),'Ink')
sphere('Ink_Shine',(-.17,-.30,.96),(.12,.08,.07),'Jade');finish('qingqiu-ink')
# Animated paper creature.
for i in range(3):
 o=cube('Paper_Leaf',(0,i*.025,.65+i*.05),(.66,.09,1.02),'Paper',.015);o.rotation_euler.y=(i-1)*.18
for side in [-1,1]:
 cube('Paper_Eye',(side*.15,-.065,.85),(.055,.035,.09),'Eye',.01)
 cube('Paper_Ribbon',(side*.34,0,.25),(.16,.06,.65),'Jade',.01).rotation_euler.y=side*.25
cube('Paper_Seal',(0,-.075,.49),(.28,.035,.29),'Pink',.015);finish('qingqiu-paper')
# Stone armored ape.
sphere('Ape_Body',(0,0,1.05),(.70,.45,.84),'DeepJade')
sphere('Ape_Head',(0,-.10,1.92),(.48,.43,.48),'RockLight')
sphere('Ape_Muzzle',(0,-.46,1.80),(.35,.17,.22),'Rock')
for side in [-1,1]:
 rod('Ape_Arm',(side*.60,0,1.40),(side*1.0,-.18,.60),.28,'Rock')
 sphere('Ape_Fist',(side*1.0,-.18,.50),(.37,.34,.33),'RockLight')
 rod('Ape_Leg',(side*.36,0,.74),(side*.40,-.10,.20),.25,'DeepJade')
 sphere('Ape_Foot',(side*.40,-.22,.17),(.28,.38,.16),'Rock')
 sphere('Ape_Eye',(side*.19,-.49,2.03),(.08,.035,.055),'Glow')
 for j in range(3):
  o=cube('Ape_Armor',(side*(.64+j*.07),.03+j*.12,1.62-j*.10),(.40,.40,.28),'RockLight',.06);o.rotation_euler.y=side*.25
cone('Ape_Crest',(0,0,2.36),.30,.07,.40,'Jade',5);finish('qingqiu-ape')
# A single instanced tree mesh, with low-cost clustered crowns.
cone('Tree_Trunk',(0,0,1.05),.25,.13,2.1,'Wood',7)
for i in range(5):
 a=i*math.tau/5;r=.65
 sphere('Tree_Crown',(math.cos(a)*r,math.sin(a)*r,2.30+(.35 if i%2 else 0)),(1.10,1.00,.88),'LeafLight' if i%3 else 'Leaf',14,10)
sphere('Tree_Cap',(0,0,3.10),(1.1,1.0,.85),'LeafGold',14,10);finish('qingqiu-tree')
# Reusable masonry pillar.
cube('Pillar_Base',(0,0,.12),(1.18,1.18,.24),'Rock',.08)
cube('Pillar_Shaft',(0,0,1.20),(.64,.64,2.00),'RockLight',.06)
cube('Pillar_Cap',(0,0,2.28),(1.0,1.0,.22),'Rock',.06)
for z in [.6,1.5,2.0]:cube('Pillar_Mark',(0,-.335,z),(.28,.035,.10),'Jade',.01)
finish('qingqiu-pillar')
# Collectible lantern and its scene proxy.
cube('Lantern_Foot',(0,0,.10),(.70,.70,.20),'Rock',.05)
cone('Lantern_Stem',(0,0,.45),.14,.12,.70,'Wood')
cube('Lantern_Glass',(0,0,.98),(.42,.42,.56),'Glow',.03)
for x in [-.25,.25]:
 for y in [-.25,.25]:rod('Lantern_Frame',(x,y,.70),(x,y,1.30),.035,'Wood')
cone('Lantern_Roof',(0,0,1.40),.48,.08,.27,'DeepJade',4)
torus('Lantern_Ring',(0,0,1.60),.09,.025,'Gold',(math.pi/2,0,0));finish('qingqiu-lantern')
# Jade fox charm.
torus('Jade_Ring',(0,0,.70),.40,.12,'Jade',(math.pi/2,0,0))
torus('Jade_Gold',(0,-.03,.70),.40,.025,'Gold',(math.pi/2,0,0))
sphere('Jade_Fox',(0,-.02,1.14),(.24,.12,.19),'Ivory')
for side in [-1,1]:cone('Jade_Ear',(side*.15,-.02,1.34),.085,0,.25,'Gold',4)
rod('Jade_Tassel',(0,0,.30),(0,0,.04),.045,'Pink');finish('qingqiu-jade')
for z in [.27,.55]:torus('Bracer_Rim',(0,0,z),.31,.065,'Gold')
cone('Bracer_Band',(0,0,.41),.33,.33,.28,'DeepJade',12)
cube('Bracer_Gem',(0,-.34,.42),(.19,.07,.18),'Jade',.025);finish('qingqiu-bracer')
rod('Banner_Pole',(0,0,0),(0,0,2.0),.05,'Gold')
cube('Banner_Cloth',(.35,0,1.4),(.64,.06,.90),'Jade',.025)
cube('Banner_Seal',(.35,-.04,1.4),(.28,.025,.30),'Gold',.025)
cone('Banner_Base',(0,0,.08),.34,.26,.16,'Rock');finish('qingqiu-banner')
# Preserve a model lineup as an editable Blender source.
for i,p in enumerate(sorted(out.glob('qingqiu-*.glb'))):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(p))
 for obj in set(bpy.data.objects)-before:
  if obj.parent is None:obj.location.x+=i*6
bpy.ops.wm.save_as_mainfile(filepath=str(out.parent.parent.parent/'art/myth/qingqiu-models.blend'))
print('QINGQIU_ASSETS',len(list(out.glob('qingqiu-*.glb'))))
