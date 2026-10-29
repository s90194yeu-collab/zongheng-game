"""Actual 3D model renders, separate from the AI reference sheets."""
import argparse
import sys
from pathlib import Path
import bpy
from mathutils import Vector

p=argparse.ArgumentParser();p.add_argument('--sex',choices=('male','female'),required=True);p.add_argument('--outfit',default='scholar');args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
root=Path(__file__).resolve().parent;bpy.ops.wm.open_mainfile(filepath=str(root/('anime-'+args.sex+'.blend')));scene=bpy.context.scene
rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0)
for o in scene.objects:
 if o.type=='MESH':o.hide_render=o.get('outfit') not in ('shared',args.outfit)
for m in bpy.data.materials:
 if not m.use_nodes or not any(m.name.startswith(s) for s in ['Anime_Face','Anime_Line','Anime_Eye','Anime_Iris']):continue
 nodes=m.node_tree.nodes;shader=next((n for n in nodes if n.type=='BSDF_PRINCIPLED'),None)
 if not shader:continue
 emit=nodes.new('ShaderNodeEmission');emit.inputs['Strength'].default_value=.9
 if shader.inputs['Base Color'].is_linked:m.node_tree.links.new(shader.inputs['Base Color'].links[0].from_socket,emit.inputs['Color'])
 else:emit.inputs['Color'].default_value=shader.inputs['Base Color'].default_value
 if shader.inputs['Alpha'].is_linked:
  transparent=nodes.new('ShaderNodeBsdfTransparent');mix=nodes.new('ShaderNodeMixShader');m.node_tree.links.new(shader.inputs['Alpha'].links[0].from_socket,mix.inputs[0]);m.node_tree.links.new(transparent.outputs[0],mix.inputs[1]);m.node_tree.links.new(emit.outputs[0],mix.inputs[2]);m.node_tree.links.new(mix.outputs[0],nodes.get('Material Output').inputs['Surface'])
 else:m.node_tree.links.new(emit.outputs[0],nodes.get('Material Output').inputs['Surface'])
world=bpy.data.worlds.new('Anime studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.3,.35,.34,1);world.node_tree.nodes['Background'].inputs[1].default_value=.65;scene.world=world
for loc,energy,size in [((-2,-4,5),350,5),((3,-1,3),220,4),((0,3,5),350,4)]:
 l=bpy.data.lights.new('Softbox','AREA');l.energy=energy;l.size=size;o=bpy.data.objects.new('Softbox',l);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
camera=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(camera);camera.location=(1.6,-5,1.8);target=Vector((0,0,.94));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=1.98;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False;scene.view_settings.view_transform='Standard';scene.render.filepath=str(root/('model-'+args.sex+'-'+args.outfit+'.png'));bpy.ops.render.render(write_still=True)
