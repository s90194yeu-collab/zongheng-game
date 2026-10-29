"""Keep the high-detail handoff file editable, with one outfit visible."""
from pathlib import Path
import bpy

root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'hero-scholar.blend'))
scene=bpy.context.scene
labels={'shared':'00 人物與共用細節','scholar':'01 書院服','traveler':'02 行旅服','armor':'03 輕甲'}
collections={}
for key,label in labels.items():
 collection=bpy.data.collections.get(label) or bpy.data.collections.new(label)
 if collection.name not in scene.collection.children:scene.collection.children.link(collection)
 collections[key]=collection
for obj in list(scene.objects):
 if obj.type!='MESH':continue
 key=obj.get('outfit','shared');collection=collections[key]
 for old in list(obj.users_collection):old.objects.unlink(obj)
 collection.objects.link(obj)
 obj.hide_set(False);obj.hide_render=False
for key,collection in collections.items():
 collection.hide_viewport=key not in ('shared','scholar')
 collection.hide_render=key not in ('shared','scholar')
rig=bpy.data.objects['HeroRig'];rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.wm.save_as_mainfile(filepath=str(root/'hero-scholar.blend'))
