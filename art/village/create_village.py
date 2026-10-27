"""Original museum village; Blender 4.5. World coordinates X/right,Y/up,Z/front."""
import argparse
import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

random.seed(43)
MUSEUMS = [
    dict(id='cq', name='春秋史館', x=-12, z=-11, rotation=0, width=8, depth=6, roof='Jade', tier=1),
    dict(id='zg', name='戰國史館', x=0, z=-16, rotation=0, width=9, depth=6, roof='Blue', tier=2),
    dict(id='ch', name='楚漢史館', x=12, z=-11, rotation=0, width=8, depth=6, roof='Red', tier=1),
    dict(id='zz', name='諸子學宮', x=-18, z=3, rotation=math.pi/2, width=6, depth=6, roof='Jade', tier=3),
    dict(id='gw', name='古文書院', x=18, z=3, rotation=-math.pi/2, width=7, depth=6, roof='Blue', tier=1),
    dict(id='al', name='選文雅集', x=-12, z=17, rotation=math.pi, width=7, depth=5, roof='Red', tier=1),
]

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    colors={'Ivory':(.75,.65,.45),'Plaster':(.88,.81,.64),'Wood':(.16,.09,.055),
            'RedWood':(.36,.08,.045),'Gold':(.72,.46,.15),'Jade':(.08,.29,.24),
            'Blue':(.10,.22,.29),'Red':(.43,.13,.095),'Stone':(.51,.54,.45),
            'Paving':(.69,.64,.48),'PavingLight':(.78,.74,.58),'Grass':(.22,.38,.23),
            'Moss':(.37,.51,.29),'Leaves':(.10,.29,.16),'LeafLight':(.29,.44,.20),
            'Pink':(.79,.39,.40),'PinkLight':(.91,.62,.59),'Water':(.15,.45,.43),
            'Lantern':(.99,.54,.16),'Ink':(.055,.095,.095)}
    mats={}
    for name,color in colors.items():
        mat=bpy.data.materials.new(name);mat.diffuse_color=(*color,1);mat.use_nodes=True
        p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
        p.inputs['Roughness'].default_value=.8
        if name=='Lantern':
            p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=.45
        mats[name]=mat
    return mats

mats={}
def point(p):return (p[0],-p[2],p[1])
def bind(obj,name,mat):
    obj.name=name;obj.data.materials.append(mats[mat]);return obj

def box(name,p,size,mat,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=point(p));o=bpy.context.object
    o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return bind(o,name,mat)

def cone(name,p,r1,r2,height,mat,verts=12):
    bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=height,location=point(p))
    return bind(bpy.context.object,name,mat)

def ball(name,p,scale,mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1,location=point(p));o=bpy.context.object
    o.scale=(scale[0],scale[2],scale[1]);return bind(o,name,mat)

def beam(name,a,b,radius,mat):
    va,vb=Vector(point(a)),Vector(point(b));o=cone(name,((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),radius,radius,(vb-va).length,mat,8)
    o.rotation_euler=(vb-va).to_track_quat('Z','Y').to_euler();return o

def roof(name,x,y,z,width,depth,mat):
    # Curved two-sided ceramic roof; ribs follow the same raised eave profile.
    segments=10
    verts=[]
    for i in range(segments+1):
        t=(i/segments)*2-1
        h=y+1.45*(1-abs(t))+.28*(abs(t)**5)
        for end in (-1,1):verts.append(point((x+end*width/2,h,z+t*depth/2)))
    faces=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(segments)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);bind(o,name,mat)
    for end in (-1,1):
        for i in range(segments):
            a,b=verts[i*2+(end==1)],verts[(i+1)*2+(end==1)]
            aw=(a[0],a[2],-a[1]);bw=(b[0],b[2],-b[1]);beam(name+'_GiltEave',aw,bw,.055,'Gold')
    for rib in range(max(3,int(width/.45))+1):
        rx=x-width/2+rib*width/max(3,int(width/.45))
        for i in range(segments):
            ta=i/segments*2-1;tb=(i+1)/segments*2-1
            beam(name+'_TileRib',(rx,y+1.45*(1-abs(ta))+.28*abs(ta)**5+.03,z+ta*depth/2),
                 (rx,y+1.45*(1-abs(tb))+.28*abs(tb)**5+.03,z+tb*depth/2),.032,mat)
    beam(name+'_Ridge',(x-width*.48,y+1.5,z),(x+width*.48,y+1.5,z),.10,'Gold')

def lantern(x,z,height=2.7):
    cone('LampFoot',(x,.15,z),.22,.15,.30,'Stone')
    cone('LampPost',(x,height/2,z),.065,.065,height,'Wood',8)
    box('LampBeam',(x,height,z),(.7,.09,.09),'Wood')
    cone('SilkLantern',(x+.28,height-.4,z),.17,.17,.43,'Lantern')
    cone('LanternCap',(x+.28,height-.15,z),.22,.17,.06,'Gold')
    beam('Tassel',(x+.28,height-.64,z),(x+.28,height-.88,z),.025,'RedWood')

def tree(x,z,pink=False,scale=1):
    beam('TreeTrunk',(x,0,z),(x+.20,2.5*scale,z),.16*scale,'Wood')
    for i,(dx,dy,dz) in enumerate([(-.8,2.6,0),(.8,3.0,.1),(0,3.4,-.5),(.2,2.9,.8)]):
        beam('TreeBranch',(x+.1,1.7*scale,z),(x+dx*scale,(dy-.25)*scale,z+dz*scale),.075,'Wood')
        ball('Canopy',(x+dx*scale,dy*scale,z+dz*scale),(1.18*scale,.88*scale,1.1*scale),
             ('PinkLight' if i%2 else 'Pink') if pink else ('LeafLight' if i%2 else 'Leaves'))

def museum(data):
    before=set(bpy.data.objects)
    w,d=data['width'],data['depth']
    box('StoneFoundation',(0,.22,0),(w+.8,.44,d+.8),'Stone',.12)
    for i in range(3):box('DoorStep',(0,.08+i*.10,d/2+.45-i*.18),(3,.16,.75),'PavingLight',.04)
    box('HallWalls',(0,1.9,0),(w,3.2,d),'Plaster',.06)
    box('HallUpperTrim',(0,3.5,0),(w+.15,.22,d+.15),'Wood')
    for sign in (-1,1):
        for x in (-w*.44,0,w*.44):
            box('TimberColumn',(x,1.95,sign*(d/2+.045)),(.18,3.1,.18),'RedWood',.025)
        for x in (-w*.26,w*.26):
            box('Window',(x,2.05,sign*(d/2+.075)),(1.05,1.25,.07),'Wood',.03)
            for j in range(4):box('WindowLattice',(x-.40+j*.27,2.05,sign*(d/2+.12)),(.04,1.18,.03),'Gold')
    box('Door',(0,1.55,d/2+.10),(1.7,2.6,.11),'Ink',.07)
    for x in (-.92,.92):box('DoorFrame',(x,1.6,d/2+.18),(.13,2.8,.15),'Gold')
    box('DoorLintel',(0,3.02,d/2+.18),(2,.14,.16),'Gold')
    box('Plaque',(0,3.28,d/2+.21),(2.75,.52,.12),'Wood',.04)
    box('PlaqueInset',(0,3.28,d/2+.29),(2.5,.37,.03),'Gold')
    roof('MainRoof',0,3.65,0,w+1.8,d+1.8,data['roof'])
    for tier in range(1,data['tier']):
        shrink=.72**tier;ty=3.65+tier*1.75
        box('UpperHall',(0,ty-.38,0),(w*shrink,.9,d*shrink),'Plaster',.04)
        roof('UpperRoof',0,ty,0,(w+1.8)*shrink,(d+1.8)*shrink,data['roof'])
    for sign in (-1,1):lantern(sign*(w/2+.6),d/2+.95)
    objects=set(bpy.data.objects)-before
    root=bpy.data.objects.new('Museum_'+data['id'],None);bpy.context.collection.objects.link(root)
    for obj in objects:obj.parent=root
    root.location=point((data['x'],0,data['z']));root.rotation_euler.z=data['rotation']
    # Blender's world Z rotation maps to Three's Y rotation.
    angle=data['rotation'];front=(math.sin(angle),math.cos(angle));door=d/2+1.75
    data['entry']=[round(data['x']+front[0]*door,3),round(data['z']+front[1]*door,3)]

def join_materials():
    bpy.ops.object.select_all(action='DESELECT')
    groups={}
    for obj in list(bpy.data.objects):
        if obj.type=='MESH':
            matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=matrix
            groups.setdefault(obj.data.materials[0].name,[]).append(obj)
    for name,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Village_'+name
    for obj in list(bpy.data.objects):
        if obj.type=='EMPTY':bpy.data.objects.remove(obj,do_unlink=True)

def save(out,name):
    bpy.context.view_layer.update();join_materials()
    out.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str((out/(name+'.blend')).resolve()))
    bpy.ops.export_scene.gltf(filepath=str((out/(name+'.glb')).resolve()),export_format='GLB',
        export_animations=False,export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=False)
    triangles=sum(len(p.vertices)-2 for o in bpy.data.objects if o.type=='MESH' for p in o.data.polygons)
    return {'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'triangles':triangles,'bytes':(out/(name+'.glb')).stat().st_size}

def exterior(out):
    global mats
    mats=reset()
    box('Island',(0,-.48,0),(49,.9,49),'Stone',.7)
    box('Lawn',(0,-.05,0),(47.5,.18,47.5),'Grass',.4)
    cone('CentralPlaza',(0,.025,2),6.7,6.7,.10,'Paving',64)
    cone('CentralInset',(0,.09,2),5.9,5.9,.035,'PavingLight',64)
    # Walkways cross the courtyard; irregular small pavers catch the light.
    for x,z,w,d in [(0,-7,3.8,19),(-8,-3,18,3.1),(8,-3,18,3.1),(-9,4,19,3.0),(9,4,19,3.0),(-8,12,3.0,17)]:
        box('Walkway',(x,.025,z),(w,.09,d),'Paving',.04)
    for i in range(46):
        z=-18+i*.85
        for x in (-1.25,0,1.25):box('PavingStone',(x,.10,z),(1.18,.06,.76),'PavingLight' if i%3 else 'Stone',.035)
    # Ding on its own garden plinth, offset from the main walking axis.
    cone('DingDais',(3.6,.18,3),1.65,1.65,.32,'Stone',32)
    cone('DingRim',(3.6,1.5,3),.94,.99,.14,'Gold',24)
    cone('DingBody',(3.6,1.12,3),.60,.89,.68,'Jade',24)
    for dx,dz in [(-.5,-.32),(.5,-.32),(0,.56)]:beam('DingLeg',(3.6+dx,.31,3+dz),(3.6+dx*.9,.94,3+dz*.9),.11,'Jade')
    for dx in (-.83,.83):
        box('DingHandle',(3.6+dx,1.73,3),(.16,.58,.55),'Jade',.04)
    # Water garden, stone edging and low foliage.
    for x,z in [(10,8),(-6,8)]:
        cone('PondEdge',(x,.03,z),2.25,2.25,.18,'Stone',32)
        cone('Pond',(x,.135,z),2.02,2.02,.05,'Water',32)
        for i in range(7):
            a=i*2.4;ball('PondRock',(x+math.cos(a)*2.1,.23,z+math.sin(a)*2.1),(.35,.28,.29),'Stone')
    for data in MUSEUMS:museum(data)
    for x,z in [(-22,-18),(-21,-5),(-22,12),(22,-17),(22,-3),(21,13),(8,19),(-4,-21),(5,-22)]:tree(x,z,pink=(x<0),scale=.9 if abs(z)>19 else 1.05)
    for x,z in [(-7,-7),(7,-7),(-8,5),(8,5),(-12,10),(12,10),(-3,-11),(3,-11)]:lantern(x,z)
    for i in range(50):
        x=random.choice([-1,1])*random.uniform(19,22);z=random.uniform(-21,21)
        ball('GardenShrub',(x,.33,z),(.55,.45,.6),'Moss' if i%2 else 'LeafLight')
    return save(out,'museum-village')

def interior(out):
    global mats
    mats=reset()
    box('InteriorFloor',(0,-.10,0),(18,.20,18),'Paving',.10)
    box('FloorInset',(0,.025,0),(15,.03,15),'PavingLight',.04)
    box('BackWall',(0,2.2,-8.7),(18,4.4,.3),'Plaster',.07)
    for x in (-8.7,8.7):box('SideWall',(x,.5,0),(.3,1,18),'Plaster')
    for x in (-8,-4,4,8):
        cone('MuseumColumn',(x,2.1,-7.9),.19,.19,4.2,'RedWood')
    box('BackBeam',(0,4.15,-8.2),(18,.35,.45),'Wood')
    box('WelcomePlaque',(0,3.2,-8.45),(5.4,.95,.15),'Wood',.06)
    box('WelcomePlaqueInset',(0,3.2,-8.34),(5,.70,.04),'Gold')
    for x,z in [(-5,-1),(0,-5),(5,-1)]:
        box('ExhibitBase',(x,.15,z),(2.4,.3,1.8),'Stone',.10)
        box('ExhibitCase',(x,.85,z),(2.1,1.2,1.5),'Wood',.10)
        box('ExhibitTop',(x,1.48,z),(2.3,.12,1.7),'Gold',.04)
        box('ScrollPaper',(x,1.59,z),(1.55,.08,.75),'Ivory',.02)
        for dx in (-.82,.82):
            roll=cone('ScrollRoll',(x+dx,1.65,z),.10,.10,.91,'Wood');roll.rotation_euler.x=math.pi/2
        for j in range(6):box('ScrollInk',(x-.50+j*.18,1.64,z),(.03,.03,.45),'Ink')
    for x in (-7,7):
        box('BookShelf',(x,1.6,-5.8),(1.6,3.1,.8),'Wood',.04)
        for y in (.7,1.6,2.5):
            box('ShelfBoard',(x,y-.18,-5.8),(1.5,.10,.88),'Gold')
            for i in range(5):box('BoundBook',(x-.53+i*.26,y+.18,-5.7),(.19,.54,.50),['Jade','Red','Blue'][i%3],.025)
    for x,z in [(-7,5),(7,5),(-6,-6),(6,-6)]:lantern(x,z,2.5)
    cone('ExitMedallion',(0,.04,6.5),1.5,1.5,.04,'Jade',32)
    return save(out,'museum-interior')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    report={'exterior':exterior(args.output),'interior':interior(args.output),'museums':MUSEUMS,'source':'original Blender procedural geometry, not Tripo generation'}
    (args.output/'village-layout.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2))
