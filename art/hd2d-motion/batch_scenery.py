"""Preserve the original Blender art; merge static meshes by material for the Web build."""
import bpy,sys,argparse
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--output',required=True);args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);source=Path(args.source);out=Path(args.output);out.mkdir(exist_ok=True,parents=True)
all_props=[]
for index,name in enumerate(['gate','bridge','tree','ruins']):
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 bpy.ops.import_scene.gltf(filepath=str(source/('hd2d-'+name+'.glb')))
 groups={}
 for obj in list(bpy.context.scene.objects):
  if obj.type=='MESH':
   key=obj.data.materials[0].name.split('.')[0];groups.setdefault(key,[]).append(obj)
 count=0
 for key,objects in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for obj in objects:obj.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();merged=bpy.context.object;merged.name='Batched_'+key
  # Import can create duplicate references of the same material; keep one surface.
  material=merged.data.materials[0];material.name=key;merged.data.materials.clear();merged.data.materials.append(material)
  for face in merged.data.polygons:face.material_index=0
  count+=1
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.export_scene.gltf(filepath=str(out/('hd2d-'+name+'.glb')),export_format='GLB',use_selection=True,export_animations=False,export_vertex_color='NAME',export_vertex_color_name='BakedLight')
 print('BATCHED_PROP',name,'surfaces',count,flush=True)
 if name=='tree':bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).parent/'tree-batched.blend'))
print('MOTION_BATCH_DONE')
