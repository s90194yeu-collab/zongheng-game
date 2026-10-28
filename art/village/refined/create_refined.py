"""Original Blender geometry and painted textures for the plaza / Spring hall.

Run Blender --background --python-exit-code 1 --python this_file -- --output DIR
Coordinates below follow the game's X/right, Y/up, Z/front convention.
These are teaching reconstructions, not scans or archaeological replicas.
"""
import argparse
import importlib.util
import json
import math
import random
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('village_base', HERE.parent / 'create_village.py')
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)
random.seed(419)
PI = math.pi
box, cone, ball = B.box, B.cone, B.ball

def beam(name,a,b,radius,mat,verts=8):
    va,vb=Vector(B.point(a)),Vector(B.point(b))
    o=cone(name,tuple((a[i]+b[i])/2 for i in range(3)),radius,radius,(vb-va).length,mat,verts)
    o.rotation_euler=(vb-va).to_track_quat('Z','Y').to_euler()
    return o


def texture(name, base, kind, size=256):
    """Small original painted base-colour maps; exported as embedded PNGs."""
    yy, xx = np.mgrid[0:size, 0:size] / size
    rng = np.random.default_rng(sum(map(ord, name)))
    grain = rng.normal(0, .018, (size, size))
    shade = .93 + .035*np.sin(xx*PI*6) + .03*np.cos(yy*PI*4) + grain
    if kind == 'wood':
        shade += .055*np.sin((xx*38 + .3*np.sin(yy*9))*PI)
        shade += .025*np.sin((xx*95 + yy*.4)*PI)
        shade -= .11*np.exp(-((xx-.5)/.055)**2)*np.cos(yy*PI*3)**8
    elif kind == 'stone':
        shade += .045*np.sin(xx*23+yy*19)*np.cos(xx*39-yy*13)
        border = np.minimum.reduce([xx, yy, 1-xx, 1-yy])
        shade -= .16*np.exp(-border/.02)
        shade += .055*np.exp(-((border-.035)/.02)**2)
    elif kind == 'bronze':
        patina = np.sin(xx*22+np.sin(yy*21))*np.cos(yy*18+xx*3)
        shade += .12*patina
    elif kind == 'paper':
        shade += .015*np.sin(yy*270) + .015*np.sin(xx*310)
        shade -= .08*((xx-.5)**2+(yy-.5)**2)
    elif kind == 'tile':
        shade += .09*np.cos(xx*PI*2)
        shade -= .16*np.exp(-yy/.045)
    elif kind == 'grass':
        shade += .08*np.sin(xx*24)*np.cos(yy*27) + .03*np.sin(yy*180+xx*40)
    rgba = np.ones((size,size,4), dtype=np.float32)
    for c,v in enumerate(base): rgba[:,:,c] = np.clip(v*shade,0,1)
    image=bpy.data.images.new(name+'_Paint',width=size,height=size,alpha=False)
    image.pixels.foreach_set(rgba.ravel());image.update()
    image.filepath_raw=str(TEXTURE_DIR/(name+'.png'));image.file_format='PNG';image.save();image.pack()
    return image


original_reset = B.reset
def reset():
    mats = original_reset()
    kinds = {'Wood':'wood','RedWood':'wood','Stone':'stone','Paving':'stone',
             'PavingLight':'stone','Plaster':'paper','Ivory':'paper','Grass':'grass',
             'Jade':'tile','Blue':'tile','Red':'tile'}
    # Muted palette: readable timber / stone rather than bright plastic surfaces.
    palette={'Wood':(.19,.105,.055),'RedWood':(.31,.15,.075),'Stone':(.47,.49,.42),
             'Paving':(.53,.51,.42),'PavingLight':(.70,.66,.53),'Plaster':(.80,.74,.59),
             'Jade':(.12,.27,.23),'Grass':(.33,.40,.25),'Gold':(.59,.39,.16)}
    for name, mat in mats.items():
        shader=mat.node_tree.nodes.get('Principled BSDF')
        base=palette.get(name,tuple(mat.diffuse_color[:3]))
        shader.inputs['Base Color'].default_value=(*base,1)
        mat.diffuse_color=(*base,1)
        if name in kinds:
            node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture(name,base,kinds[name])
            mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
    for name,color,metal,rough in [('Bronze',(.20,.35,.28),.65,.58),('BronzeEdge',(.52,.40,.19),.7,.42),
                                  ('Silk',(.50,.29,.17),0,.86),('Bamboo',(.65,.53,.32),0,.75),
                                  ('WaterLight',(.22,.46,.42),.1,.40),('Mountain',(.36,.47,.43),0,1),
                                  ('MountainFar',(.53,.62,.56),0,1),('Clay',(.43,.35,.24),0,.85)]:
        mat=bpy.data.materials.new(name);mat.use_nodes=True;mat.diffuse_color=(*color,1)
        shader=mat.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Base Color'].default_value=(*color,1);shader.inputs['Metallic'].default_value=metal
        shader.inputs['Roughness'].default_value=rough
        if name in ['Bronze','BronzeEdge','Bamboo','Silk','Clay']:
            node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture(name,color,'bronze' if 'Bronze' in name else 'wood' if name=='Bamboo' else 'paper')
            mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
        mats[name]=mat
    return mats
B.reset=reset


def mesh(name, vertices, faces, mat, uv=None):
    m=bpy.data.meshes.new(name);m.from_pydata([B.point(p) for p in vertices],[],faces);m.update()
    o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);B.bind(o,name,mat)
    layer=m.uv_layers.new(name='UVMap')
    for face in m.polygons:
        for loop in face.loop_indices:
            p=vertices[m.loops[loop].vertex_index]
            layer.data[loop].uv=uv[m.loops[loop].vertex_index] if uv else (p[0]*.25,p[2]*.25)
    return o


def ring(name,x,y,z,radius,tube,mat,segments=48):
    vertices=[];faces=[]
    for i in range(segments):
        a=i*PI*2/segments
        for j in range(6):
            b=j*PI/3;r=radius+tube*math.cos(b)
            vertices.append((x+r*math.cos(a),y+tube*math.sin(b),z+r*math.sin(a)))
    for i in range(segments):
        for j in range(6):faces.append((i*6+j,((i+1)%segments)*6+j,((i+1)%segments)*6+(j+1)%6,i*6+(j+1)%6))
    return mesh(name,vertices,faces,mat)


def lathe(name,profile,mat,segments=48):
    vertices=[];uv=[];faces=[]
    for j,(r,y) in enumerate(profile):
        for i in range(segments+1):
            a=i*2*PI/segments;vertices.append((r*math.cos(a),y,r*math.sin(a)));uv.append((i/segments,j/(len(profile)-1)))
    for j in range(len(profile)-1):
        for i in range(segments):
            k=j*(segments+1)+i;faces.append((k,k+1,k+segments+2,k+segments+1))
    o=mesh(name,vertices,faces,mat,uv)
    for p in o.data.polygons:p.use_smooth=True
    return o


def parent_new(before,name,position=(0,0,0)):
    root=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(root)
    for o in set(bpy.data.objects)-before-{root}:o.parent=root
    root.location=B.point(position)
    return root


def ding(name='Artifact_Ding',position=(0,0,0),scale=1):
    before=set(bpy.data.objects)
    lathe('BronzeVessel',[(.08,.43),(.35,.43),(.55,.53),(.70,.84),(.74,1.03),(.73,1.09),(.68,1.09),(.66,.85),(.49,.57),(.08,.49)],'Bronze',48)
    for y,r in [(1.07,.71),(.88,.70),(.73,.65)]:ring('CastBand',0,y,0,r,.027,'BronzeEdge',48)
    # Two cast rectangular loop ears; open centre remains genuinely hollow.
    for x in [-.61,.61]:
        for z in [-.15,.15]:beam('DingEar',(x,1.04,z),(x,1.43,z),.052,'Bronze',10)
        beam('DingEarTop',(x,1.43,-.15),(x,1.43,.15),.065,'BronzeEdge',10)
    for i in range(3):
        a=i*2*PI/3+PI/2
        beam('DingFoot',(.45*math.cos(a),.05,.45*math.sin(a)),(.43*math.cos(a),.58,.43*math.sin(a)),.085,'Bronze',10)
    for i in range(20):
        a=i*2*PI/20
        # Raised spiral-like geometric band, visible at close inspection.
        for j in range(3):
            b=a+(j-1)*.023;r=.713
            beam('Leiwen', (r*math.cos(b),.92+j*.025,r*math.sin(b)),(r*math.cos(b+.052),.92+j*.025,r*math.sin(b+.052)),.012,'BronzeEdge',6)
    root=parent_new(before,name,position);root.scale=(scale,)*3
    return root


def bamboo(name='Artifact_Bamboo',position=(0,0,0)):
    before=set(bpy.data.objects)
    for panel in range(6):
        panel_before=set(bpy.data.objects)
        for i in range(3):
            n=panel*3+i;x=(n-8.5)*.108
            box('BambooSlat',(x,.025,0),(.098,.05,1.24),'Bamboo',.015)
            for y in [-.39,.39]:box('BindingCord',(x,.065,y),(.108,.018,.027),'Wood',.005)
            # Abstract ink strokes deliberately do not pretend to be a transcription.
            for j in range(6):
                z=-.26+j*.105
                box('BrushStroke',(x,.057,z),(.036,.007,.013),'Ink')
                if (n+j)%3:box('BrushStroke',(x-.012,.058,z+.019),(.011,.007,.045),'Ink')
        group=parent_new(panel_before,'BambooPanel_'+str(panel))
        group['panel']=panel
    root=parent_new(before,name,position)
    # Only top-level parts belong directly to the artifact.
    for o in set(bpy.data.objects)-before-{root}:
        if o.name.startswith('BambooPanel_'):o.parent=root
    # Restore panel membership after parent_new's generic flattening.
    panels=sorted([o for o in root.children if o.name.startswith('BambooPanel_')],key=lambda o:o['panel'])
    for o in list(root.children):
        if o.type=='MESH':
            x=o.location.x;index=max(0,min(5,int((x/.108+8.5)//3)))
            o.parent=panels[index]
    return root


def map_model(name='Artifact_Map',position=(0,0,0)):
    before=set(bpy.data.objects)
    box('MapFrame',(0,0,0),(2.05,.14,1.5),'Wood',.06)
    box('MapGround',(0,.09,0),(1.89,.06,1.34),'PavingLight',.025)
    for i in range(7):
        x=-.85+i*.25
        mesh('MapMountain',[(x,.13,-.5),(x+.28,.13,-.51),(x+.1,.42+(i%3)*.08,-.47),(x+.12,.12,-.24)],[(0,1,2),(1,3,2),(3,0,2)],'Jade')
    for i in range(12):
        x=-.7+i*.12;z=.1+math.sin(i*.65)*.18
        box('MapRiver',(x,.14,z),(.17,.018,.08),'WaterLight',.01)
    for x,z in [(-.6,.44),(.2,-.12),(.65,.30),(-.2,.28)]:
        box('MapCity',(x,.21,z),(.17,.15,.15),'Clay',.015)
        beam('MapFlagPole',(x,.23,z),(x,.56,z),.012,'Wood',6)
        mesh('MapFlag',[(x,.55,z),(x+.13,.52,z),(x,.45,z)],[(0,1,2)],'Silk')
    return parent_new(before,name,position)


def column(x,z,y=0,height=3.6):
    cone('ColumnFoot',(x,y+.12,z),.23,.21,.24,'Stone',12)
    cone('FlutedColumn',(x,y+height/2,z),.13,.11,height,'RedWood',12)
    cone('ColumnCollar',(x,y+height-.12,z),.18,.18,.13,'BronzeEdge',12)
    for j in range(3):
        box('BracketArm',(x,y+height+j*.12,z),(.35+j*.2,.10,.27),'Wood',.02)
        box('BracketCross',(x,y+height+j*.12,z),(.24,.10,.4+j*.13),'RedWood',.02)


original_museum=B.museum
def museum(data):
    if data['id']!='cq':return original_museum(data)
    before=set(bpy.data.objects)
    box('SpringDais',(0,.23,0),(8.7,.46,6.7),'Stone',.10)
    box('SpringWall',(0,1.9,-.3),(7.8,3.0,5.4),'Plaster',.07)
    for i in range(3):box('SpringStep',(0,.09+i*.11,3.55-i*.17),(3.1,.18,.70),'PavingLight',.035)
    # Open timber frontage with inset doors and narrow latticed bays.
    for x in [-3.65,-1.65,1.65,3.65]:column(x,2.84,.30,3.05)
    for x in [-2.65,2.65]:
        box('WindowRecess',(x,1.95,2.43),(1.45,1.66,.08),'Wood',.03)
        for i in range(6):box('LatticeBar',(x-.61+i*.244,1.95,2.51),(.035,1.55,.045),'Bamboo')
        for y in [1.40,1.95,2.50]:box('LatticeCross',(x,y,2.53),(1.32,.035,.04),'RedWood')
    for x in [-.70,.70]:
        box('SpringDoor',(x,1.62,2.47),(1.35,2.45,.11),'Wood',.035)
        for y in [.60,1.18,1.76,2.34]:box('DoorPanel',(x,y,2.55),(1.13,.44,.045),'RedWood',.02)
        ring('DoorKnocker',x+(.40 if x<0 else -.40),1.65,2.61,.09,.025,'BronzeEdge',16).rotation_euler.x=PI/2
    box('SpringLintel',(0,3.58,2.8),(8,.28,.4),'Wood',.035)
    box('SpringPlaque',(0,3.35,3.08),(2.6,.6,.16),'Wood',.04)
    for x in [-1.26,1.26]:box('PlaqueBorder',(x,3.35,3.18),(.04,.52,.04),'BronzeEdge')
    for y in [3.10,3.60]:box('PlaqueBorder',(0,y,3.18),(2.56,.04,.04),'BronzeEdge')
    B.roof('SpringRoof',0,3.82,-.15,10.1,8.0,'Jade')
    # Individually profiled ridge caps and under-eave rafters.
    for i in range(23):
        x=-4.6+i*.418
        for sign in [-1,1]:beam('EaveRafter',(x,3.85,sign*3.6),(x,3.62,sign*2.45),.045,'Wood',8)
        cone('RidgeCap',(x,5.35,-.15),.14,.14,.38,'BronzeEdge',8).rotation_euler.y=PI/2
    for x in [-4.5,4.5]:
        for k in range(3):ball('RidgeFinial',(x,5.45+k*.12,-.15+k*.08),(.13-k*.025,.13,.13),'Bronze',)
    for x in [-4.05,4.05]:B.lantern(x,3.35,2.8)
    for x in [-3.35,3.35]:
        cone('SpringPlanter',(x,.55,3.1),.38,.46,.55,'Clay',12)
        for j in range(4):beam('PlanterBamboo',(x+(j-1.5)*.12,.65,3.1),(x+(j-1.5)*.15,1.9+random.random()*.4,3.1),.032,'Jade',8)
    root=parent_new(before,'SpringHall')
    root.location=B.point((data['x'],0,data['z']))
    data['entry']=[data['x'],data['z']+data['depth']/2+1.75]


def join_static(keep_roots=()):
    """Batch static meshes per material, retaining named articulated artifacts."""
    keep=set()
    for root in keep_roots:keep.add(root);keep.update(root.children_recursive)
    groups={}
    for o in list(bpy.data.objects):
        if o.type=='MESH' and o not in keep:
            matrix=o.matrix_world.copy();o.parent=None;o.matrix_world=matrix
            groups.setdefault(o.data.materials[0].name,[]).append(o)
    for name,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Batched_'+name
    # Artifacts retain their roots, but combine meshes within each articulated panel.
    for root in keep_roots:
        parts=list(root.children) if root.name.startswith('Artifact_Bamboo') else [root]
        for part in parts:
            groups={}
            for o in part.children_recursive:
                if o.type=='MESH':groups.setdefault(o.data.materials[0].name,[]).append(o)
            for name,objects in groups.items():
                if not objects:continue
                bpy.ops.object.select_all(action='DESELECT')
                for o in objects:o.select_set(True)
                bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=part.name+'_'+name
    for o in list(bpy.data.objects):
        if o.type=='EMPTY' and o not in keep and not o.children:bpy.data.objects.remove(o,do_unlink=True)


def save(out,name,keep_roots=()):
    bpy.context.view_layer.update();join_static(keep_roots)
    out.mkdir(parents=True,exist_ok=True)
    for image in bpy.data.images:
        if image.has_data and image.source!='GENERATED':image.pack()
    bpy.ops.wm.save_as_mainfile(filepath=str((out/(name+'.blend')).resolve()),compress=True)
    bpy.ops.export_scene.gltf(filepath=str((out/(name+'.glb')).resolve()),export_format='GLB',
        export_animations=False,export_cameras=False,export_lights=False,export_extras=True,
        export_draco_mesh_compression_enable=False)
    return {'meshes':sum(o.type=='MESH' for o in bpy.data.objects),
            'triangles':sum(len(p.vertices)-2 for o in bpy.data.objects if o.type=='MESH' for p in o.data.polygons),
            'bytes':(out/(name+'.glb')).stat().st_size,'embeddedPaintedTextures':len(json.loads((out/(name+'.glb')).read_bytes()[20:20+int.from_bytes((out/(name+'.glb')).read_bytes()[12:16],'little')]).get('images',[]))}


def route_surface():
    rects=[(0,-7,3.8,19),(-8,-3,18,3.1),(8,-3,18,3.1),(-9,4,19,3.0),(9,4,19,3.0),(-8,12,3.0,17)]
    vertices=[];faces=[]
    for ix in range(-38,39):
        for iz in range(-34,42):
            x=ix*.5;z=iz*.5
            if not any(abs(x-a)<w/2 and abs(z-b)<d/2 for a,b,w,d in rects):continue
            k=len(vertices);vertices += [(x-.25,.086,z-.25),(x+.25,.086,z-.25),(x+.25,.086,z+.25),(x-.25,.086,z+.25)]
            faces.append((k,k+3,k+2,k+1))
    mesh('RouteSurface',vertices,faces,'Paving')


def enhance_plaza():
    route_surface()
    for o in list(bpy.data.objects):
        if o.name.startswith('Ding'):bpy.data.objects.remove(o,do_unlink=True)
    cone('DingStoneDais',(3.6,.20,3),1.55,1.55,.36,'Stone',48)
    ring('DingDaisInlay',3.6,.39,3,1.30,.035,'BronzeEdge')
    ding('PlazaDing',(3.6,.39,3),1.28)
    # Sunken joints and individually shaded stone border around the main plaza.
    for i in range(64):
        a=i*2*PI/64
        o=box('PlazaBorder',(math.cos(a)*6.15,.10,2+math.sin(a)*6.15),(.48,.10,.28),'Stone',.03)
        o.rotation_euler.z=-a
    for x,z in [(10,8),(-6,8)]:
        for i in range(5):
            a=i*1.35+.4;px=x+math.cos(a)*1.1;pz=z+math.sin(a)*1.1
            cone('LotusLeaf',(px,.18,pz),.23,.23,.018,'Moss',16)
            if i%2==0:
                for j in range(5):
                    a2=j*2*PI/5
                    ball('LotusPetal',(px+.09*math.cos(a2),.24,pz+.09*math.sin(a2)),(.09,.06,.055),'PinkLight')
        for i in range(2):ring('PondRipple',x+.35+i*.25,.18,z+.2, .4+i*.28,.008,'WaterLight',40)
    # Landscape is outside the existing playable boundary; no new invisible barriers.
    box('FarMeadow',(0,-.5,0),(140,.12,140),'Grass')
    for layer,mat in [(0,'Mountain'),(1,'MountainFar')]:
        for i in range(11):
            x=-68+i*13;z=-44-layer*18
            h=8+random.random()*12
            mesh('DistantRidge',[(x-10,-.6,z),(x+12,-.6,z),(x+3,h,z-3),(x-2,h*.66,z+2)],[(0,1,2),(0,2,3)],mat)
    for x,z in [(-21,12),(22,-17),(-22,-18),(21,13)]:
        for i in range(4):
            beam('BambooStem',(x+i*.16,0,z),(x+i*.16,3+i*.15,z+.18),.034,'Jade',8)
            for j in range(3):
                mesh('BambooLeaf',[(x+i*.16,1.8+j*.45,z),(x+i*.16+.6,2.05+j*.45,z+.1),(x+i*.16+.13,1.95+j*.45,z+.05)],[(0,1,2)],'Leaves')


def exterior(out):
    # Reuse the exact original footprint and route geometry of the other five halls.
    original_save=B.save
    def finish(out,name):
        enhance_plaza();return save(out,name)
    B.save=finish;B.museum=museum
    try:return B.exterior(out)
    finally:B.save=original_save


def interior(out):
    B.mats=reset()
    box('SpringFloor',(0,-.1,0),(18,.2,18),'Stone',.06)
    for x in range(-8,9,2):
        for z in range(-8,9,2):box('FloorTile',(x,.015,z),(1.94,.07,1.94),'PavingLight' if (x+z)%4 else 'Paving',.025)
    box('HallBackWall',(0,2.4,-8.7),(18,4.8,.3),'Plaster',.06)
    box('WallSkirting',(0,.45,-8.48),(17.8,.72,.08),'Wood',.025)
    for x in [-8,-4,4,8]:column(x,-7.85,0,4.1)
    for y in [3.8,4.45]:box('HallBeam',(0,y,-8.0),(17.6,.24,.40),'Wood',.03)
    for x in [-6,-2,2,6]:
        box('ScreenRecess',(x,2.25,-8.45),(2.65,2.7,.06),'Jade',.03)
        for i in range(7):box('ScreenLattice',(x-1.16+i*.385,2.25,-8.38),(.04,2.55,.04),'Bamboo')
        for y in [1.15,2.25,3.35]:box('ScreenCross',(x,y,-8.35),(2.5,.04,.04),'Wood')
    # Cutaway side rails preserve the player's view into the room.
    for x in [-8.7,8.7]:
        box('SideRail',(x,.75,0),(.12,.12,17.2),'Wood',.025)
        for z in [-7,-5,-3,-1,1,3,5,7]:box('SideBaluster',(x,.4,z),(.10,.72,.10),'Wood',.02)
    for x,z in [(-5,-1),(0,-5),(5,-1)]:
        box('DisplayDais',(x,.12,z),(2.4,.24,1.8),'Stone',.06)
        box('DisplayLeg',(x,.65,z),(1.85,.9,1.28),'Wood',.045)
        box('DisplayApron',(x,1.08,z),(2.1,.16,1.5),'RedWood',.035)
        box('DisplayTop',(x,1.20,z),(2.3,.12,1.7),'Wood',.04)
        box('DisplayCloth',(x,1.27,z),(2.15,.016,1.55),'Silk',.015)
        for dx in [-1.03,1.03]:box('TableInlay',(x+dx,1.29,z),(.025,.02,1.5),'BronzeEdge')
        box('DisplayLabel',(x,1.30,z+.72),(.60,.04,.19),'Ivory',.01)
    roots=[ding(position=(-5,1.29,-1),scale=.72),bamboo(position=(0,1.29,-5)),map_model(position=(5,1.29,-1))]
    for x in [-7,7]:
        box('Cabinet',(x,1.55,-5.8),(1.6,3.0,.80),'Wood',.04)
        for y in [.65,1.55,2.45]:
            box('CabinetShelf',(x,y,-5.38),(1.52,.08,.12),'BronzeEdge')
            for j in range(5):
                o=box('BambooBundle',(x-.56+j*.27,y+.25,-5.46),(.19,.43,.45),'Bamboo',.02)
                box('BookBinding',(x-.56+j*.27,y+.25,-5.21),(.2,.05,.015),'Silk')
    for x,z in [(-7,5),(7,5),(-6,-6),(6,-6)]:B.lantern(x,z,2.5)
    for x in [-2.45,2.45]:
        box('HangingScroll',(x,2.65,-8.40),(.65,1.85,.05),'Ivory',.02)
        for y in [1.70,3.60]:beam('ScrollRod',(x-.39,y,-8.35),(x+.39,y,-8.35),.06,'Wood',12)
        for j in range(7):box('ScrollMark',(x,3.30-j*.19,-8.34),(.22,.06,.03),'Ink')
    ring('EntryInlay',0,.065,6.5,1.4,.025,'BronzeEdge',48)
    return save(out,'spring-interior',roots)


def render(out,name,location,target):
    scene=bpy.context.scene
    scene.render.engine='CYCLES';scene.cycles.samples=32
    scene.cycles.use_denoising=True;scene.render.resolution_x=1440;scene.render.resolution_y=1000
    scene.render.resolution_percentage=100
    if scene.world is None:scene.world=bpy.data.worlds.new('PaperSky')
    scene.world.color=(.33,.38,.34)
    world=scene.world;world.use_nodes=True;world.node_tree.nodes.get('Background').inputs[0].default_value=(.47,.57,.53,1)
    world.node_tree.nodes.get('Background').inputs[1].default_value=.75
    bpy.ops.object.light_add(type='AREA',location=B.point((-15,26,15)));light=bpy.context.object
    light.data.energy=4200;light.data.shape='DISK';light.data.size=18
    light.rotation_euler=(Vector(B.point(target))-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.light_add(type='SUN',location=(0,0,15));sun=bpy.context.object;sun.data.energy=2.0;sun.data.angle=.20
    sun.rotation_euler=(.45,-.4,-.5)
    bpy.ops.object.camera_add(location=B.point(location));camera=bpy.context.object
    camera.rotation_euler=(Vector(B.point(target))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO';camera.data.ortho_scale=33 if name=='plaza-preview' else 21
    scene.camera=camera;scene.render.filepath=str(out/(name+'.png'))
    bpy.ops.render.render(write_still=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);parser.add_argument('--render',action='store_true');parser.add_argument('--resume',action='store_true')
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:]);args.output.mkdir(parents=True,exist_ok=True)
    TEXTURE_DIR=args.output/'textures';TEXTURE_DIR.mkdir(exist_ok=True)
    report={'tool':bpy.app.version_string,'source':'original Blender geometry and original procedural painted textures','historicalStatus':'teaching reconstruction, not artifact scans'}
    if args.resume and (args.output/'museum-village.blend').exists():
        bpy.ops.wm.open_mainfile(filepath=str(args.output/'museum-village.blend'))
        for mat in bpy.data.materials:
            if not mat.use_nodes:continue
            for node in mat.node_tree.nodes:
                if node.type=='TEX_IMAGE':
                    name=mat.name.split('.')[0]
                    kind='wood' if name in ['Wood','RedWood','Bamboo'] else 'stone' if name in ['Stone','Paving','PavingLight'] else 'bronze' if name.startswith('Bronze') else 'tile' if name in ['Jade','Blue','Red'] else 'grass' if name=='Grass' else 'paper'
                    node.image=texture(name,mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value[:3],kind)
        report['exterior']=save(args.output,'museum-village')
    else:report['exterior']=exterior(args.output)
    if args.render:render(args.output,'plaza-preview',(16,23,31),(-5,0,-3))
    report['springInterior']=interior(args.output)
    if args.render:render(args.output,'spring-preview',(11,16,19),(0,1,-2))
    (args.output/'refined-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False,indent=2))
