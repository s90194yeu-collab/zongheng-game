"""Normalize a reviewed Tripo/artist GLB to the museum's footprint; no API calls."""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

def bounds():
    bpy.context.view_layer.update()
    points=[o.matrix_world@Vector(v) for o in bpy.context.scene.objects if o.type=='MESH' for v in o.bound_box]
    if not points:raise ValueError('輸入沒有網格。')
    low=Vector([min(p[i] for p in points) for i in range(3)])
    high=Vector([max(p[i] for p in points) for i in range(3)])
    return low,high

def main(args):
    if args.input.suffix.lower()!='.glb':raise ValueError('請提供已下載的GLB。')
    if not args.input.is_file():raise ValueError('找不到輸入GLB。')
    if args.output.resolve()==args.input.resolve():raise ValueError('輸出路徑須與輸入不同，以保留原檔。')
    if min(args.width,args.depth,args.height)<=0:raise ValueError('尺寸必須大於零。')
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(args.input.resolve()))
    for o in list(bpy.context.scene.objects):
        if o.type in {'CAMERA','LIGHT'}:bpy.data.objects.remove(o,do_unlink=True)
    anchor=bpy.data.objects.new('ReviewedAssetRoot',None);bpy.context.collection.objects.link(anchor)
    for o in list(bpy.context.scene.objects):
        if o!=anchor and o.parent is None:o.parent=anchor
    anchor.rotation_euler.z=math.radians(args.yaw)
    low,high=bounds();size=high-low
    scale=min(args.width/max(size.x,.0001),args.depth/max(size.y,.0001),args.height/max(size.z,.0001))
    anchor.scale=(scale,)*3;anchor.location=(-(low.x+high.x)/2*scale,-(low.y+high.y)/2*scale,-low.z*scale)
    for mapping in args.rename_clip:
        old,new=mapping.split('=',1)
        action=bpy.data.actions.get(old)
        if not action:raise ValueError('找不到指定片段：'+old)
        action.name=new
    low,high=bounds()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(args.output.resolve()),export_format='GLB',export_animations=True,
        export_animation_mode='ACTIONS',export_skins=True,export_cameras=False,export_lights=False,
        export_draco_mesh_compression_enable=False)
    report={'input':args.input.name,'output':args.output.name,'world_size_x_depth_height':list(high-low),
            'floor_z':low.z,'scale':scale,'yaw_degrees':args.yaw,'actions':[a.name for a in bpy.data.actions],
            'triangles':sum(len(p.vertices)-2 for o in bpy.context.scene.objects if o.type=='MESH' for p in o.data.polygons),
            'bytes':args.output.stat().st_size,'notes':'保持比例縮放；不猜測前方、不自動重拓樸或判定綁定品質。'}
    args.output.with_suffix('.report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--width',type=float,default=8);p.add_argument('--depth',type=float,default=6);p.add_argument('--height',type=float,default=7)
    p.add_argument('--yaw',type=float,default=0);p.add_argument('--rename-clip',action='append',default=[])
    main(p.parse_args(sys.argv[sys.argv.index('--')+1:]))
