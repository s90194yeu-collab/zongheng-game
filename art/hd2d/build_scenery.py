"""Original HD-2D miniature props. Shared atlas is attached once by Godot.
Blender --background --python build_scenery.py -- --output /path/to/assets
"""
import bpy,math,random,argparse,sys
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--output',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);out=Path(a.output);out.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
M={};parts=[];all_objects=[]
for name,c in [('HD_Stone',(.86,.83,.71)),('HD_Jade',(.32,.51,.43)),('HD_Leaf',(.51,.65,.35)),('HD_Wood',(.32,.20,.12)),('HD_Gold',(.82,.60,.26)),('HD_Roof',(.12,.27,.25))]:
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;m.node_tree.nodes.clear();shader=m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');output=m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(shader.outputs['BSDF'],output.inputs['Surface']);shader.inputs['Base Color'].default_value=(*c,1);M[name]=m
def add(o,name,mat):
 o.name=name;o.data.materials.append(M[mat]);parts.append(o);return o
def box(n,loc,size,mat='HD_Stone',bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 add(o,n,mat)
 if bevel:
  md=o.modifiers.new('Carved_edge','BEVEL');md.width=bevel;md.segments=1;bpy.ops.object.modifier_apply(modifier=md.name)
 return o
def rod(n,a,b,r,mat='HD_Wood'):
 a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=r,radius2=r*.83,depth=(b-a).length,location=(a+b)/2)
 o=add(bpy.context.object,n,mat);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def ico(n,loc,size,mat):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=loc);o=add(bpy.context.object,n,mat);o.scale=size;return o
def finish(name,display):
 global parts
 print('BUILD_PROP',name,flush=True)
 bpy.context.view_layer.update()
 for o in parts:
  mesh=o.data
  color=mesh.color_attributes.new(name='BakedLight',type='BYTE_COLOR',domain='CORNER')
  uv=mesh.uv_layers.new(name='AtlasUV') if not mesh.uv_layers else mesh.uv_layers.active
  light=Vector((-.5,-.6,.9)).normalized();normal=o.matrix_world.to_3x3().inverted().transposed()
  kind=o.data.materials[0].name;tile=(1,0) if kind=='HD_Stone' else (0,1) if kind=='HD_Leaf' else (1,1)
  for poly in mesh.polygons:
   n=(normal@poly.normal).normalized();brightness=.63+.37*max(0,n.dot(light))
   for li in poly.loop_indices:
    co=mesh.vertices[mesh.loops[li].vertex_index].co
    if abs(poly.normal.z)>.65:q=(co.x,co.y)
    elif abs(poly.normal.x)>.65:q=(co.y,co.z)
    else:q=(co.x,co.z)
    uv.data[li].uv=((tile[0]+.015+(q[0]*.65%1)*.97)*.5,1-(tile[1]+.015+(q[1]*.65%1)*.97)*.5)
    color.data[li].color=(brightness,brightness*.98,brightness*.93,1)
  mesh.color_attributes.active_color=color
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0]
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',use_selection=True,export_animations=False,export_vertex_color='NAME',export_vertex_color_name='BakedLight')
 for o in parts:o.location.x+=display;all_objects.append(o)
 parts=[]
# Raised miniature Chinese forest gate, open centre keeps combat silhouettes readable.
for x in [-4.7,4.7]:
 box('StonePlinth',(x,0,.22),(1.15,1.15,.44))
 rod('CarvedTimber',(x,0,.4),(x,0,4.0),.23)
 box('JadeCollar',(x,0,3.45),(.72,.55,.3),'HD_Jade')
box('GateLintel',(0,0,3.85),(10.5,.65,.36),'HD_Wood')
for i in range(13):
 x=-5.4+i*.9;roof=box('CurvedJadeTiles',(x,0,4.25+.045*x*x),(.95,1.6,.16),'HD_Roof');roof.rotation_euler.y=-x*.07
box('BronzeTablet',(0,-.41,3.45),(1.7,.12,.72),'HD_Jade')
for x in [-.65,.65]:box('TabletGold',(x,-.49,3.45),(.07,.05,.60),'HD_Gold')
finish('hd2d-gate',0)
# Bridge deck follows the existing flat collision plane; railings add depth.
for i in range(13):box('BridgePaver',(0,-2.08+i*.34,.12),(6.8,.3,.18))
for x in [-3.35,3.35]:
 for y in [-2,-1,0,1,2]:
  box('Baluster',(x,y,.58),(.24,.24,.95));box('Cap',(x,y,1.10),(.39,.39,.15),'HD_Jade')
 rod('BridgeHandrail',(x,-2.1,1.07),(x,2.1,1.07),.09,'HD_Jade')
 box('BridgeSide',(x,0,-.10),(.30,4.6,.45),'HD_Jade')
finish('hd2d-bridge',16)
# Branching trees retain volumetric canopy silhouettes through a full camera orbit.
random.seed(1029)
rod('Trunk',(0,0,0),(.15,.1,2.9),.32)
for i in range(7):
 a=i*math.tau/7;end=(math.cos(a)*1.2,math.sin(a)*1.2,2.7+i%3*.3)
 rod('Branch',(.05,0,1.6),end,.12)
 ico('PaintedCanopy',end,(1.55,1.3,1.0),'HD_Leaf')
ico('Crown',(0,0,3.6),(1.7,1.6,1.2),'HD_Leaf')
finish('hd2d-tree',30)
for x,h in [(-1.7,2.6),(1.7,1.9)]:
 for z in range(int(h/.35)):box('RuinedPier',(x,0,.17+z*.35),(.9,.85,.32),'HD_Jade')
 box('RuinedBase',(x,0,.12),(1.25,1.15,.24))
for i in range(5):box('BrokenStep',(0,-1+i*.33,.06+i*.035),(2.6,.29,.12))
for x,y in [(-.8,.4),(.3,.8),(1.2,-.5)]:box('FallenStone',(x,y,.23),(.7,.6,.46),'HD_Stone').rotation_euler.z=x*.5
finish('hd2d-ruins',44)
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).parent/'qingqiu-hd2d-scenery.blend'))
print('HD2D_BLENDER_PROPS_DONE')
