"""Organize editable high-detail avatars without changing exported GLBs."""
import sys
from pathlib import Path
import bpy
root=Path(__file__).resolve().parent
for sex in ('male','female'):
    target=root/('anime-'+sex+'.blend');bpy.ops.wm.open_mainfile(filepath=str(target))
    scene=bpy.context.scene
    groups={k:bpy.data.collections.new(k.title()) for k in ('shared','scholar','traveler','armor')}
    for c in groups.values():scene.collection.children.link(c)
    for obj in list(scene.objects):
        key=obj.get('outfit','shared');dest=groups.get(key,groups['shared'])
        for c in list(obj.users_collection):c.objects.unlink(obj)
        dest.objects.link(obj)
    for key in ('traveler','armor'):groups[key].hide_viewport=True;groups[key].hide_render=True
    rig=next(o for o in scene.objects if o.type=='ARMATURE');rig.animation_data.action=bpy.data.actions['Idle'];scene.frame_set(0)
    scene['Instructions']='Shared + Scholar shown. Toggle Scholar / Traveler / Armor collections. Idle, Walk, Run, Bow actions share the rig. CC0 sources and AI design references are recorded beside this file.'
    bpy.ops.wm.save_as_mainfile(filepath=str(target))
