"""Blender 4.5: real all-sided halls with warm painted materials and baked shading.
Reuse the original teaching geometry, watercolor ground and existing artifact models.
No camera-facing building planes. Run -- --output DIR.
"""
import argparse, importlib.util, json, math, random, sys
from pathlib import Path
import bpy
from mathutils import Vector
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('refined',HERE.parent/'village/refined/create_refined.py')
F=importlib.util.module_from_spec(spec);spec.loader.exec_module(F);B=F.B

def close_gables(h):
    w,d=h['width'],h['depth']
    for tier in range(h['tier']):
        scale=.72**tier;top=3.65+tier*1.75
        for sign in [-1,1]:
            x=sign*w*scale/2
            F.mesh('ClosedGable',[(h['x']+x,top-.25,h['z']-d*scale/2),(h['x']+x,top+1.45,h['z']),(h['x']+x,top-.25,h['z']+d*scale/2)],[(0,1,2)],'Plaster')

def build(out):
    random.seed(421);F.TEXTURE_DIR=out/'textures';F.TEXTURE_DIR.mkdir(parents=True,exist_ok=True)
    B.mats=F.reset()
    palette={'Wood':(.58,.38,.20),'RedWood':(.65,.42,.24),'Stone':(.73,.72,.62),'Plaster':(.94,.86,.68),'Paving':(.82,.77,.63),'PavingLight':(.93,.86,.70),'Jade':(.40,.50,.48),'Blue':(.43,.51,.57),'Red':(.70,.42,.33),'Grass':(.67,.74,.47),'Gold':(.72,.56,.32),'Leaves':(.40,.57,.40),'LeafLight':(.58,.69,.42),'Pink':(.86,.56,.53),'PinkLight':(.97,.73,.65)}
    for name,mat in B.mats.items():
        base=palette.get(name,tuple(mat.diffuse_color[:3]));mat.diffuse_color=(*base,1)
        shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*base,1);shader.inputs['Metallic'].default_value=0;shader.inputs['Roughness'].default_value=1
        for node in mat.node_tree.nodes:
            if node.type=='TEX_IMAGE':node.image=F.texture(name,base,'wood' if name in ['Wood','RedWood','Bamboo'] else 'tile' if name in ['Jade','Blue','Red'] else 'paper')
    halls=[]
    for data in B.MUSEUMS:
        h=dict(data,rotation=0);h['name']='經典雅集' if h['id']=='al' else h['name'];h['tier']=min(h['tier'],2)
        F.museum(h);close_gables(h);halls.append(h)
    # Volumetric trees, rocks and hills remain visible from every azimuth.
    for x,z,pink in [(-23,-19,True),(-24,4,False),(-22,22,True),(23,-20,False),(24,13,True),(11,24,True)]:B.tree(x,z,pink,1.5)
    for x,z in [(-23,-7),(24,-5),(-5,-24)]:
        for i in range(4):
            F.beam('Bamboo',(x+i*.18,0,z),(x+i*.18,4+i*.18,z),.05,'Jade',8)
            for j in range(2):B.ball('BambooFoliage',(x+i*.18,2.6+j*.8,z),(.7,.35,.55),'LeafLight')
    for i in range(14):
        a=i*2*math.pi/14;x,z=math.cos(a)*67,math.sin(a)*67
        B.cone('DistantHill',(x,random.uniform(1,4),z),random.uniform(9,14),0,random.uniform(13,22),'MountainFar' if i%2 else 'Mountain',7)
    B.mats['Ivory'].diffuse_color=(.96,.91,.79,1);B.mats['Ivory'].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.96,.91,.79,1)
    B.box('DistantMeadow',(0,-.35,0),(180,.18,180),'Ivory')
    # Merge material batches for a small draw count, retaining baked directional colour.
    bpy.context.view_layer.update();F.join_static()
    for obj in bpy.data.objects:
        if obj.type=='MESH' and len(obj.data.polygons)>1500:
            bpy.context.view_layer.objects.active=obj
            mod=obj.modifiers.new('Lightweight silhouette','DECIMATE');mod.ratio=.55
            bpy.ops.object.modifier_apply(modifier=mod.name)
    light=Vector(B.point((-.45,.8,.5))).normalized()
    for obj in bpy.data.objects:
        if obj.type!='MESH':continue
        mesh=obj.data;layer=mesh.color_attributes.new(name='BakedLight',type='FLOAT_COLOR',domain='CORNER')
        uv=mesh.uv_layers.active or mesh.uv_layers.new(name='UVMap')
        for poly in mesh.polygons:
            normal=(obj.matrix_world.to_3x3()@poly.normal).normalized();shade=.73+.27*max(0,normal.dot(light))
            for li in poly.loop_indices:
                layer.data[li].color=(shade,shade*.985,shade*.95,1)
                v=obj.matrix_world@mesh.vertices[mesh.loops[li].vertex_index].co
                uv.data[li].uv=(v.x*.3,v.y*.3) if abs(normal.z)>.65 else ((v.x*.3,v.z*.3) if abs(normal.y)>.5 else (v.y*.3,v.z*.3))
        obj['bakedLighting']=True
    # Add watercolor paving, pond and grass surfaces, excluding all former facades.
    scene_path=HERE.parent/'watercolor/watercolor-village.blend'
    with bpy.data.libraries.load(str(scene_path),link=False) as (src,dst):dst.objects=[n for n in src.objects if n in ['PaintedGround','PaintedPaths','PaintedPlaza','DingPlinth','PaintedPond_0','PaintedPond_1']]
    for obj in dst.objects:
        if obj:bpy.context.collection.objects.link(obj);obj['paintedSurface']=True
    bpy.context.scene['hallLayout']=json.dumps(halls,ensure_ascii=False)
    bpy.context.scene['style']='warm watercolor, genuine 360 degree geometry'
    bpy.ops.wm.save_as_mainfile(filepath=str((out/'orbit-village.blend').resolve()),compress=True)
    bpy.ops.export_scene.gltf(filepath=str((out/'orbit-village.glb').resolve()),export_format='GLB',export_extras=True,export_animations=False,export_cameras=False,export_lights=False,export_all_vertex_colors=True)
    r={'tool':bpy.app.version_string,'style':'warm painted real 3D, all-sided architecture','halls':halls,'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'triangles':sum(len(p.vertices)-2 for o in bpy.data.objects if o.type=='MESH' for p in o.data.polygons),'bytes':(out/'orbit-village.glb').stat().st_size,'bakedLighting':True}
    (out/'orbit-report.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in r.items()if k!='halls'}))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);a.output.mkdir(parents=True,exist_ok=True);build(a.output)
