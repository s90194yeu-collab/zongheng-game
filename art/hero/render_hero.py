"""Render the saved, rigged 3D asset for visual QA and handoff."""
import sys
from pathlib import Path
import bpy
from mathutils import Vector

root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'hero-scholar.blend'))
scene=bpy.context.scene
rig=bpy.data.objects['HeroRig']
world=bpy.data.worlds.new('Portrait studio');world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.19,.23,.24,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.4;scene.world=world
for loc,energy,size in [((-2,-4,5),450,4),((3,-1,3),250,3),((0,3,4),500,3)]:
 lamp=bpy.data.lights.new('Softbox','AREA');lamp.energy=energy;lamp.shape='DISK';lamp.size=size
 ob=bpy.data.objects.new('Softbox',lamp);scene.collection.objects.link(ob);ob.location=loc
 ob.rotation_euler=(Vector((0,0,1))-ob.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(cam)
cam.location=(2.2,-4.7,2.15);target=Vector((0,0,.96))
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.03;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
for outfit in ('scholar','traveler','armor'):
 for o in scene.objects:
  if o.type=='MESH':o.hide_render=o.get('outfit') not in ('shared',outfit)
 rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0)
 scene.render.filepath=str(root/('model-'+outfit+'.png'));bpy.ops.render.render(write_still=True)
for motion,frame in [('Run',6),('Bow',36)]:
 for o in scene.objects:
  if o.type=='MESH':o.hide_render=o.get('outfit') not in ('shared','scholar')
 rig.animation_data.action=bpy.data.actions[motion];scene.frame_set(frame)
 scene.render.filepath=str(root/('motion-'+motion.lower()+'.png'));bpy.ops.render.render(write_still=True)
