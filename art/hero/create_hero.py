"""Original Chinese fantasy character; Blender 4.5 LTS, Z-up, front -Y.

Human anatomy, topology, rig definitions and skin weights: MakeHuman CC0 core
assets (see source/sources.json). Outfit, hair, materials and animation: original.
AI artwork is a design/texture reference; this script builds actual skinned 3D.
"""
import argparse
import gzip
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector, Quaternion
from mathutils.kdtree import KDTree

ROOT = Path(__file__).resolve().parent
OUTFITS = ('scholar', 'traveler', 'armor')


def material(name, color, roughness=.65, metal=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metal
    return m


def build(args):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = 30
    source = ROOT / 'source'
    vertices, texcoords, faces, face_uvs = [], [], [], []
    body_group = False
    for line in (source / 'base.obj').read_text().splitlines():
        if line.startswith('v '):
            vertices.append(Vector(tuple(map(float, line.split()[1:4]))))
        elif line.startswith('vt '):
            texcoords.append(tuple(map(float, line.split()[1:3])))
        elif line.startswith('g '):
            body_group = line.split()[1] == 'body'
        elif line.startswith('f ') and body_group:
            corners = [s.split('/') for s in line.split()[1:]]
            faces.append(tuple(int(s[0])-1 for s in corners))
            face_uvs.append(tuple(texcoords[int(s[1])-1] for s in corners))
    for line in gzip.open(source / 'asian-male-young.target.gz', 'rt'):
        if not line.strip() or line.startswith('#'):
            continue
        row = line.split()
        vertices[int(row[0])] += Vector(tuple(map(float, row[1:4])))
    floor = min(v.y for v in vertices[:13380])
    scale = 1.8 / (max(v.y for v in vertices[:13380])-floor)
    verts = [Vector((v.x*scale, -v.z*scale, (v.y-floor)*scale)) for v in vertices]
    groups = json.loads((source / 'basemesh_vertex_groups.json').read_text())
    definitions = json.loads((source / 'rig.game_engine.json').read_text())
    source_weights = json.loads((source / 'weights.game_engine.json').read_text())['weights']
    weights = [{} for _ in verts]
    for bone, values in source_weights.items():
        for index, weight in values:
            if weight > .001:
                weights[index][bone] = weight
    for row in weights:
        total = sum(row.values())
        if total:
            for key in row:
                row[key] /= total

    def group_center(name):
        ids = [i for start, end in groups[name] for i in range(start, end+1)]
        return sum((verts[i] for i in ids), Vector())/len(ids)

    def joint(spec):
        if spec.get('cube_name') in groups:
            return group_center(spec['cube_name'])
        if spec.get('vertex_indices'):
            return sum((verts[i] for i in spec['vertex_indices']), Vector()) / len(spec['vertex_indices'])
        # Root's fallback has no geometry anchor. Positions are in metres.
        v = Vector(spec.get('default_position', (0, 0, 0)))
        v.z += -floor*scale
        return v

    rig = bpy.data.objects.new('HeroRig', bpy.data.armatures.new('HeroSkeleton'))
    scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for name, definition in definitions.items():
        bone = rig.data.edit_bones.new(name)
        bone.head = joint(definition['head'])
        bone.tail = joint(definition['tail'])
        if (bone.tail-bone.head).length < .001:
            bone.tail.z += .03
        bone.roll = definition.get('roll', 0)
        bone.use_deform = name != 'Root'
    for name, definition in definitions.items():
        if definition.get('parent'):
            rig.data.edit_bones[name].parent = rig.data.edit_bones[definition['parent']]
    bpy.ops.object.mode_set(mode='OBJECT')
    rig.select_set(False)
    rig['assetId'] = 'zongheng-hero-v1'
    rig['license'] = 'CC0 anatomy + original clothing; AI reference artwork'
    rig['outfits'] = json.dumps(list(OUTFITS))

    tree = KDTree(13380)
    for i, v in enumerate(verts[:13380]):
        tree.insert(v, i)
    tree.balance()

    def nearest_weights(co):
        return weights[tree.find(co)[1]] or {'pelvis': 1}

    def object_mesh(name, positions, polygons, mat, vertex_weights=None, uvs=None, outfit='shared', slot='body'):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(positions, [], polygons)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        scene.collection.objects.link(obj)
        mesh.materials.append(mat)
        for poly in mesh.polygons:
            poly.use_smooth = True
        if uvs:
            uv = mesh.uv_layers.new(name='UVMap')
            for poly, row in zip(mesh.polygons, uvs):
                for loop_index, xy in zip(poly.loop_indices, row):
                    uv.data[loop_index].uv = xy
        if vertex_weights is None:
            vertex_weights = [nearest_weights(Vector(v)) for v in positions]
        names = {name for row in vertex_weights for name in row}
        for bone in sorted(names):
            group = obj.vertex_groups.new(name=bone)
            for i, row in enumerate(vertex_weights):
                if row.get(bone, 0) > .001:
                    group.add([i], row[bone], 'REPLACE')
        modifier = obj.modifiers.new('Hero skin', 'ARMATURE')
        modifier.object = rig
        obj.parent = rig
        obj['outfit'] = outfit
        obj['slot'] = slot
        obj['assetId'] = 'zongheng-hero-v1'
        return obj

    skin = material('Hero_Skin', (.63, .41, .29), .62)
    cloth = material('Hero_Cloth', (.32, .53, .51), .83)
    cloth.node_tree.nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value = .18
    fabric = bpy.data.images.load(str(ROOT/'images/fabric.png'))
    fabric.scale(1024, 1024)
    fabric.pack()
    fabric_node = cloth.node_tree.nodes.new('ShaderNodeTexImage')
    fabric_node.image = fabric
    fabric_node.extension = 'REPEAT'
    cloth.node_tree.links.new(fabric_node.outputs['Color'], cloth.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    # UV image colours retain the AI brocade, while the material colour is a tint.
    shade = material('Hero_Cloth_Shade', (.025, .075, .085), .85)
    ivory = material('Hero_Ivory', (.7, .64, .48), .87)
    leather = material('Hero_Leather', (.045, .035, .025), .72)
    armor = material('Hero_Armor', (.035, .075, .09), .4, .7)
    gold = material('Hero_Bronze', (.45, .27, .09), .36, .78)
    jade = material('Hero_Jade', (.1, .35, .25), .23, .12)
    hair = material('Hero_Hair', (.012, .009, .007), .48)
    hair_light = material('Hero_Hair_Threads', (.028, .02, .013), .52)
    white = material('Hero_Eye_White', (.72, .7, .65), .2)
    iris = material('Hero_Eye_Iris', (.055, .025, .01), .25)
    black = material('Hero_Pupil', (.001, .001, .001), .17)

    def bone_weight(index, prefix):
        return sum(v for k, v in weights[index].items() if prefix(k))

    def extract(name, condition, mat, inflate=0, outfit='shared', slot='body'):
        selected = [i for i, face in enumerate(faces) if condition(face)]
        retained = sorted({v for i in selected for v in faces[i]})
        remap = {old: new for new, old in enumerate(retained)}
        # Directional expansion around the local arm/leg/torso gives a garment
        # shell without shipping any concealed unclothed body geometry.
        positions = []
        for old in retained:
            co = verts[old].copy()
            if inflate:
                if co.z < .95:
                    center = Vector((.13 if co.x > 0 else -.13, 0, co.z))
                elif abs(co.x) > .23:
                    side = 'l' if co.x > 0 else 'r'
                    a = joint(definitions['upperarm_'+side]['head'])
                    b = joint(definitions['lowerarm_'+side]['tail'])
                    t = max(0, min(1, (co-a).dot(b-a)/(b-a).length_squared))
                    center = a.lerp(b, t)
                else:
                    center = Vector((0, 0, co.z))
                direction = co-center
                if direction.length:
                    co += direction.normalized()*inflate
            positions.append(co)
        obj = object_mesh(name, positions, [tuple(remap[v] for v in faces[i]) for i in selected], mat,
                          [weights[v] or {'head':1} for v in retained], [face_uvs[i] for i in selected], outfit, slot)
        return obj, retained

    exposed, exposed_ids = extract('Hero face and hands',
        lambda face: all(bone_weight(i, lambda k:k=='head' or k=='neck_01' or k.startswith(('hand_', 'thumb_', 'index_', 'middle_', 'ring_', 'pinky_'))) > .38 for i in face), skin)

    # Project the original fictional face to the anatomical mesh and bake into
    # its non-overlapping UV atlas. No live projected image plane is exported.
    eye = group_center('joint-l-eye')
    face_image = bpy.data.images.load(str(ROOT/'images/face.png'))
    mask = exposed.data.color_attributes.new(name='FaceMask', type='FLOAT_COLOR', domain='CORNER')
    sx = .246/(eye.x*2)
    sy = sx*face_image.size[0]/face_image.size[1]
    for poly in exposed.data.polygons:
        for li in poly.loop_indices:
            v = exposed.data.vertices[exposed.data.loops[li].vertex_index]
            # Fade at the cheeks/temples and neck; hands use a plain skin tone.
            front = max(0, min(1, (-v.normal.y-.08)/.55))
            height = min(1, max(0, (v.co.z-1.51)/.055))
            sides = min(1, max(0, (.1-abs(v.co.x))/.02))
            weight = front*height*sides
            mask.data[li].color = (weight, weight, weight, 1)
    nodes, links = skin.node_tree.nodes, skin.node_tree.links
    coordinate = nodes.new('ShaderNodeTexCoord')
    separate = nodes.new('ShaderNodeSeparateXYZ')
    links.new(coordinate.outputs['Object'], separate.inputs[0])
    px = nodes.new('ShaderNodeMath'); px.operation = 'MULTIPLY_ADD'
    py = nodes.new('ShaderNodeMath'); py.operation = 'MULTIPLY_ADD'
    px.inputs[1].default_value = sx; px.inputs[2].default_value = .5
    py.inputs[1].default_value = sy; py.inputs[2].default_value = .622-sy*eye.z
    links.new(separate.outputs['X'], px.inputs[0]); links.new(separate.outputs['Z'], py.inputs[0])
    uv_node = nodes.new('ShaderNodeCombineXYZ')
    links.new(px.outputs[0], uv_node.inputs['X']); links.new(py.outputs[0], uv_node.inputs['Y'])
    photo = nodes.new('ShaderNodeTexImage'); photo.image = face_image; photo.extension = 'EXTEND'
    links.new(uv_node.outputs[0], photo.inputs['Vector'])
    attribute = nodes.new('ShaderNodeVertexColor'); attribute.layer_name = 'FaceMask'
    mix = nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MIX'
    mix.inputs[1].default_value = (.63, .41, .29, 1)
    links.new(attribute.outputs['Color'], mix.inputs[0]); links.new(photo.outputs['Color'], mix.inputs[2])
    emit = nodes.new('ShaderNodeEmission'); links.new(mix.outputs[0], emit.inputs['Color'])
    out = nodes.get('Material Output'); links.new(emit.outputs[0], out.inputs['Surface'])
    baked = bpy.data.images.new('HeroSkin1024', width=1024, height=1024, alpha=False)
    target = nodes.new('ShaderNodeTexImage'); target.image = baked; nodes.active = target
    exposed.data.uv_layers.active_index = 0
    exposed.data.uv_layers['UVMap'].active_render = True
    bpy.context.view_layer.objects.active = exposed; exposed.select_set(True)
    scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = 1
    scene.render.bake.margin = 8
    bpy.ops.object.bake(type='EMIT', uv_layer='UVMap')
    baked.filepath_raw = str(ROOT/'textures/hero-skin.png'); baked.file_format='PNG'; baked.save(); baked.pack()
    nodes.clear(); out = nodes.new('ShaderNodeOutputMaterial'); shader = nodes.new('ShaderNodeBsdfPrincipled')
    shader.inputs['Roughness'].default_value = .67
    shader.inputs['Subsurface Weight'].default_value = .05
    tex = nodes.new('ShaderNodeTexImage'); tex.image = baked
    links.new(tex.outputs['Color'], shader.inputs['Base Color']); links.new(shader.outputs['BSDF'], out.inputs['Surface'])
    exposed.data.color_attributes.remove(exposed.data.color_attributes['FaceMask'])
    exposed.select_set(False)

    is_leg=lambda i:bone_weight(i,lambda k:k=='pelvis' or k.startswith(('thigh_','calf_','foot_','ball_')))>.6
    trousers, _ = extract('Hero dark trousers', lambda f:all(.14<verts[i].z<1.01 and is_leg(i) for i in f), shade, .012, slot='legs')

    def tube(name, rings, radii, mat, outfit='shared', bone=None, segments=20, slot='detail'):
        pos, polygons, uvs = [], [], []
        for j, (center, radius) in enumerate(zip(rings, radii)):
            center = Vector(center)
            tangent = Vector(rings[min(j+1,len(rings)-1)])-Vector(rings[max(j-1,0)])
            if not tangent.length: tangent = Vector((0, 0, 1))
            tangent.normalize()
            a = tangent.cross(Vector((0, 1, 0)))
            if a.length < .01: a = tangent.cross(Vector((1, 0, 0)))
            a.normalize(); b = tangent.cross(a).normalized()
            if not isinstance(radius, (tuple, list)): radius = (radius, radius)
            for k in range(segments):
                angle = 2*math.pi*k/segments
                pos.append(center+a*math.cos(angle)*radius[0]+b*math.sin(angle)*radius[1])
            if j:
                for k in range(segments):
                    nk = (k+1)%segments
                    polygons.append(((j-1)*segments+k,(j-1)*segments+nk,j*segments+nk,j*segments+k))
                    u0, u1 = k/segments*2, (k+1)/segments*2
                    v0, v1 = (j-1)/max(1,len(rings)-1)*2, j/max(1,len(rings)-1)*2
                    uvs.append(((u0,v0),(u1,v0),(u1,v1),(u0,v1)))
        vw = [{bone:1} for _ in pos] if bone else None
        return object_mesh(name, pos, polygons, mat, vw, uvs, outfit, slot)

    def sphere(name, center, radius, mat, bone='head', outfit='shared', segments=20, rings=12):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=center)
        obj = bpy.context.object; obj.name=name
        obj.scale=radius if isinstance(radius,(tuple,list)) else (radius,)*3
        bpy.ops.object.transform_apply(location=True,rotation=False,scale=True)
        mesh = obj.data; positions=[v.co.copy() for v in mesh.vertices]; polygons=[tuple(f.vertices) for f in mesh.polygons]
        bpy.data.objects.remove(obj,do_unlink=True)
        return object_mesh(name,positions,polygons,mat,[{bone:1} for _ in positions],outfit=outfit,slot='detail')

    def curve(name, coords, radius, mat, bone='head', outfit='shared'):
        c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D';c.resolution_u=3;c.bevel_depth=radius;c.bevel_resolution=1
        spl=c.splines.new('BEZIER');spl.bezier_points.add(len(coords)-1)
        for p,co in zip(spl.bezier_points,coords): p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
        obj=bpy.data.objects.new(name,c);scene.collection.objects.link(obj)
        bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH')
        positions=[v.co.copy() for v in obj.data.vertices]; polygons=[tuple(f.vertices) for f in obj.data.polygons]
        bpy.data.objects.remove(obj,do_unlink=True)
        return object_mesh(name,positions,polygons,mat,[{bone:1} for _ in positions],outfit=outfit,slot='trim')

    def ribbon(name,coords,width,mat,bone,outfit='shared'):
        positions=[];polys=[];uv=[]
        for i,p in enumerate(coords):
            tangent=Vector(coords[min(i+1,len(coords)-1)])-Vector(coords[max(0,i-1)])
            side=tangent.cross(Vector((0,-1,0))).normalized()*width/2
            positions.extend([Vector(p)-side,Vector(p)+side])
            if i:
                polys.append((i*2-2,i*2-1,i*2+1,i*2));uv.append(((0,i-1),(1,i-1),(1,i),(0,i)))
        return object_mesh(name,positions,polys,mat,[{bone:1} for _ in positions],uv,outfit,'trim')

    def front_y(x,z):
        near=[v.y for v in verts[:13380] if abs(v.x-x)<.035 and abs(v.z-z)<.025]
        return min(near) if near else -.13

    for side in ('l','r'):
        ankle=joint(definitions['foot_'+side]['head'])
        x=ankle.x
        # Closed leather footwear has a smooth toe box instead of anatomical toes.
        tube('Riding boot shaft '+side,[(x,ankle.y,.08),(x,ankle.y,.23),(x,ankle.y,.36)],[(.058,.085),(.057,.059),(.065,.067)],leather,bone='calf_'+side,segments=28)
        sphere('Leather toe box '+side,(x,ankle.y-.06,.073),(.061,.14,.066),leather,'foot_'+side,segments=28,rings=14)
        sphere('Boot sole '+side,(x,ankle.y-.058,.029),(.063,.142,.025),black,'foot_'+side,segments=28,rings=10)
        tube('Boot cuff '+side,[(x,ankle.y,.34),(x,ankle.y,.355)],[(.066,.068),(.066,.068)],gold,bone='calf_'+side,segments=28)

    for side in ('l','r'):
        e=group_center('joint-'+side+'-eye')
        sphere('Eye '+side,e,(.011,.011,.011),white)
        sphere('Iris '+side,e+Vector((0,-.0102,0)),(.0052,.0014,.0052),iris)
        sphere('Pupil '+side,e+Vector((0,-.0113,0)),(.0024,.0005,.0024),black,segments=16,rings=8)

    # Anatomically fitted scalp, layered locks and a swept high knot.
    cap,_=extract('Swept black hair cap',lambda f:all(verts[i].z>1.72 or (verts[i].z>1.63 and verts[i].y>-.045) for i in f),hair,.006,slot='hair')
    sphere('Crown hair volume',(0,.018,1.766),(.074,.079,.045),hair)
    for sign in (-1,1):
        for k in range(13):
            u=k/12
            coords=[(sign*(.008+.065*u),-.102+.024*u,1.735-.025*u),
                    (sign*(.035+.056*u),-.058+.015*u,1.778-.024*u),
                    (sign*(.022+.057*u),.014+.04*u,1.772-.029*u),
                    (sign*(.012+.052*u),.049+.028*u,1.718-.043*u)]
            curve('Swept lock',coords,.0055,hair_light if k%3==0 else hair)
        for k in range(7):
            x=sign*(.045+k*.004)
            curve('Long back lock',[(x,.068,1.74),(x*1.1,.1,1.62),(x*.98,.112,1.46),(x*.7,.12,1.32-k*.005)],.007,hair if k%2 else hair_light)
        curve('Temple lock',[(sign*.073,-.08,1.75),(sign*.083,-.09,1.69),(sign*.078,-.074,1.58)],.004,hair)
    sphere('High knot',(0,.022,1.802),(.035,.041,.041),hair)
    for k in range(7):
        a=k/6*math.pi
        curve('Knot strands',[(-.032*math.cos(a),.02,1.8+.035*math.sin(a)),(0,.057,1.8+.035*math.sin(a)),(.032*math.cos(a),.02,1.8+.035*math.sin(a))],.002,hair_light)
    tube('Jade hairpin',[(-.06,.025,1.8),(.063,.025,1.8)],[.0035,.0035],jade,bone='head',segments=12)
    sphere('Hairpin finial',(.065,.025,1.8),(.009,.006,.009),gold)

    # Garments share the same skeleton, hidden geometry is removed.
    for outfit in OUTFITS:
        shirt,_=extract(outfit+' fitted tunic',lambda f:all(verts[i].z>1.025 and verts[i].z<1.53 and bone_weight(i,lambda k:k.startswith(('spine_','clavicle_','upperarm_','lowerarm_')) or k=='pelvis')>.4 for i in f), cloth if outfit!='armor' else shade,.014,outfit,'tunic')
        # Long coat split at both sides; each panel can follow its leg.
        bottom=.28 if outfit=='scholar' else .74 if outfit=='traveler' else .68
        pos, polys, uv, vw=[],[],[],[]
        seg=64; rows=11
        for j in range(rows):
            t=j/(rows-1); z=1.055+(bottom-1.055)*t
            rx=.18+(.115 if outfit=='scholar' else .05)*t
            ry=.155+(.035 if outfit=='scholar' else .005)*t
            for k in range(seg+1):
                a=2*math.pi*k/seg
                ripple=1+.025*math.sin(a*14)*t
                pos.append((rx*math.cos(a)*ripple,ry*math.sin(a)*ripple,z))
                leg='thigh_l' if math.cos(a)>0 else 'thigh_r'
                w=max(0,min(.75,t*.9))
                vw.append({'pelvis':1-w,leg:w})
                if j and k:
                    # Cut small side gaps for leg movement.
                    if abs(math.sin(a))<.09 and j>3:continue
                    polys.append(((j-1)*(seg+1)+k-1,(j-1)*(seg+1)+k,j*(seg+1)+k,j*(seg+1)+k-1))
                    uv.append((((k-1)/seg*3,(j-1)/(rows-1)*2),(k/seg*3,(j-1)/(rows-1)*2),(k/seg*3,j/(rows-1)*2),((k-1)/seg*3,j/(rows-1)*2)))
        coat=object_mesh(outfit+' split coat',pos,polys,cloth if outfit!='armor' else shade,vw,uv,outfit,'coat')
        for sign in (-1,1):
            # Layered cross collar follows the chest, independently of sleeves.
            xz=[(sign*.05,1.525),(sign*.07,1.46),(sign*.025,1.4),(-sign*.03,1.34),(-sign*.08,1.25),(-sign*.11,1.14)]
            if sign==1:xz=[(.05,1.525),(.07,1.46),(.025,1.4),(.005,1.365)]
            coords=[(x,front_y(x,z)-.024,z) for x,z in xz]
            ribbon(outfit+' ivory collar',coords,.033,ivory,'spine_03',outfit)
            ribbon(outfit+' bronze seam',[(x,-.001+y,z) for x,y,z in coords],.003,gold,'spine_03',outfit)
        # Belt and buckle, cuffs and ankle bands; fine accent detail costs little.
        belt=tube(outfit+' leather belt',[(0,0,1.015),(0,0,1.11)],[(.19,.18),(.188,.18)],leather,outfit,'pelvis',48)
        sphere(outfit+' jade belt clasp',(0,-.185,1.063),(.028,.009,.022),gold,'pelvis',outfit)
        sphere(outfit+' inset jade',(0,-.194,1.063),(.018,.004,.014),jade,'pelvis',outfit)
        for side in ('l','r'):
            a=joint(definitions['lowerarm_'+side]['head']); b=joint(definitions['lowerarm_'+side]['tail'])
            tube(outfit+' leather bracer '+side,[a.lerp(b,.55),a.lerp(b,.91)],[.048,.038],leather,outfit,'lowerarm_'+side,20)
            tube(outfit+' cuff border '+side,[a.lerp(b,.88),a.lerp(b,.91)],[.039,.039],gold,outfit,'lowerarm_'+side,20)
        if outfit=='traveler':
            # Open front mantle has clear shoulders and a short back cape.
            pos=[];polys=[];vw=[]
            for j in range(7):
                t=j/6
                for k in range(33):
                    a=-.15+(math.pi+.3)*k/32
                    pos.append((math.cos(a)*(.11+.15*t),.01+math.sin(a)*(.09+.06*t),1.49-.34*t))
                    vw.append({'spine_03':1})
                    if j and k:polys.append(((j-1)*33+k-1,(j-1)*33+k,j*33+k,j*33+k-1))
            object_mesh('Traveler shoulder mantle',pos,polys,leather,vw,outfit=outfit,slot='cape')
            xz=[(-.13,1.43),(-.04,1.31),(.08,1.13),(.17,1.02)]
            ribbon('Traveler shoulder strap',[(x,front_y(x,z)-.043,z) for x,z in xz],.027,leather,'spine_02',outfit)
            sphere('Traveler satchel',(.19,-.018,1.0),(.064,.048,.08),leather,'pelvis',outfit)
            sphere('Satchel brass clasp',(.19,-.064,1.03),(.012,.004,.01),gold,'pelvis',outfit)
        if outfit=='armor':
            # Curved lamellar rows, small rivets, independent shoulder pieces.
            torso=[v for i,v in enumerate(verts[:13380]) if abs(v.x)<.255 and bone_weight(i,lambda k:k.startswith(('spine_','clavicle_')) or k=='pelvis')>.65]
            def shell(angle,z):
                d=Vector((math.cos(angle),math.sin(angle),0))
                candidates=[v.dot(d) for v in torso if abs(v.z-z)<.025 and v.dot(d)>0 and abs(v.x*d.y-v.y*d.x)<.033]
                radius=max(candidates)+.032 if candidates else .21
                return Vector((d.x*radius,d.y*radius,z))
            for row in range(7):
                z=1.12+row*.043
                for k in range(18):
                    a=2*math.pi*k/18
                    if row>=5 and abs(math.sin(a))<.45:continue
                    pp=[]
                    for zz in (-.024,.024):
                        for aa in (-.155,.155):pp.append(shell(a+aa,z+zz))
                    object_mesh('Lamellar plate',pp,[(0,1,3,2)],armor,[{'spine_03':1}]*4,outfit=outfit,slot='lamellar')
                    sphere('Bronze rivet',shell(a,z+.011)+Vector((math.cos(a)*.003,math.sin(a)*.003,0)),.0027,gold,'spine_03',outfit,8,4)
            for side in ('l','r'):
                shoulder=joint(definitions['upperarm_'+side]['head'])
                sphere('Shoulder guard '+side,shoulder+Vector((0,0,.005)),(.095,.1,.053),armor,'upperarm_'+side,outfit,20,10)
                for i in range(3):
                    shift=(.035+i*.025)*(1 if side=='l' else -1)
                    sphere('Shoulder bronze trim',shoulder+Vector((shift,0,-i*.01)),(.009,.101,.007),gold,'upperarm_'+side,outfit,12,6)

    # Consolidate objects by outfit/material: the browser only submits visible
    # garment meshes. Skin weights, UVs and metadata survive joining.
    buckets={}
    for obj in list(scene.objects):
        if obj.type=='MESH':buckets.setdefault((obj.get('outfit','shared'),obj.data.materials[0].name,obj.get('slot','body')=='hair'),[]).append(obj)
    for (outfit,mat_name,is_hair),objs in buckets.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objs:obj.select_set(True)
        bpy.context.view_layer.objects.active=objs[0]
        bpy.ops.object.join()
        obj=objs[0];obj.name='Hero_'+outfit+'_'+mat_name+('_Hair' if is_hair else '')
        obj['outfit']=outfit;obj['slot']='hair' if is_hair else 'garment'
        if mat_name in ('Hero_Cloth','Hero_Cloth_Shade'):obj['tintable']=True
        if mat_name.startswith('Hero_Hair'):obj['hairTintable']=True
    bpy.ops.object.select_all(action='DESELECT')

    # Animations are authored in world axes then transformed to the bone frame.
    # They keep their root in place so the browser's movement remains authoritative.
    rig.animation_data_create()
    def rotate(pb, x=0,y=0,z=0):
        basis=pb.bone.matrix_local.to_quaternion()
        q=Quaternion((1,0,0),x) @ Quaternion((0,1,0),y) @ Quaternion((0,0,1),z)
        pb.rotation_mode='QUATERNION';pb.rotation_quaternion=basis.inverted()@q@basis
    for clip,duration in [('Idle',120),('Walk',36),('Run',24),('Bow',72)]:
        action=bpy.data.actions.new(clip);rig.animation_data.action=action
        frames=range(0,duration+1,3)
        for frame in frames:
            phase=frame/duration*math.tau
            wave=math.sin(phase)
            for pb in rig.pose.bones:rotate(pb)
            for side,sign in [('l',1),('r',-1)]:
                arm=.4*sign
                rotate(rig.pose.bones['upperarm_'+side],y=arm)
                if clip in ('Walk','Run'):
                    stride=(.28 if clip=='Walk' else .48)*wave*sign
                    rotate(rig.pose.bones['thigh_'+side],x=stride)
                    rotate(rig.pose.bones['calf_'+side],x=-max(0,stride)*1.3)
                    rotate(rig.pose.bones['upperarm_'+side],x=-stride*.65,y=arm)
                    rotate(rig.pose.bones['lowerarm_'+side],x=-.35 if clip=='Run' else -.05)
                elif clip=='Idle':
                    rotate(rig.pose.bones['upperarm_'+side],y=arm+.008*wave*sign)
                elif clip=='Bow':
                    t=frame/duration;amount=math.sin(math.pi*t)**2
                    rotate(rig.pose.bones['upperarm_'+side],x=-.45*amount,y=arm+.28*amount*sign,z=-.25*amount*sign)
                    rotate(rig.pose.bones['lowerarm_'+side],x=-.4*amount)
            if clip=='Bow':
                amount=math.sin(math.pi*frame/duration)**2
                rotate(rig.pose.bones['spine_02'],x=.25*amount)
                rotate(rig.pose.bones['spine_03'],x=.15*amount)
                rotate(rig.pose.bones['head'],x=.18*amount)
            elif clip=='Idle':rotate(rig.pose.bones['spine_03'],x=.007*wave)
            for pb in rig.pose.bones:pb.keyframe_insert(data_path='rotation_quaternion',frame=frame,group=pb.name)
        action.use_fake_user=True
        track=rig.animation_data.nla_tracks.new();track.name=clip
        track.strips.new(clip,0,action);track.mute=True
    rig.animation_data.action=None
    for pb in rig.pose.bones:rotate(pb)
    scene.frame_set(0)
    meshes=[o for o in scene.objects if o.type=='MESH']
    stats={'asset':'zongheng-hero-v1','bones':len(rig.data.bones),'outfits':list(OUTFITS),'animations':['Idle','Walk','Run','Bow'],
           'meshes':len(meshes),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes),
           'source':'MakeHuman CC0 core anatomy and rig; original garments/hair/animation','aiMode':'built-in imagegen design and texture references'}
    for im in bpy.data.images:
        if im.name not in ('Render Result','Viewer Node') and im.has_data:im.pack()
    # Remove AI photo source from the exported working file; only the baked skin
    # texture and brocade are needed at runtime. Originals stay in art/images.
    for im in list(bpy.data.images):
        if im.users==0 and im.name not in ('Render Result','Viewer Node'):bpy.data.images.remove(im)
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(Path(args.output).resolve()),export_format='GLB',export_animations=True,
        export_animation_mode='ACTIONS',export_nla_strips=True,export_force_sampling=True,
        export_apply=False,export_extras=True,export_yup=True,export_skins=True,export_all_influences=False,
        export_cameras=False,export_lights=False)
    stats['bytes']=Path(args.output).stat().st_size
    stats['visibleTriangles']={outfit:sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes if o.get('outfit') in ('shared',outfit)) for outfit in OUTFITS}
    Path(args.report).write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n')
    bpy.ops.wm.save_as_mainfile(filepath=str(Path(args.blend).resolve()))
    if args.low:
        for obj in meshes:
            if len(obj.data.polygons)<90 or obj.data.materials[0].name in ('Hero_Armor','Hero_Ivory','Hero_Jade'):continue
            bpy.context.view_layer.objects.active=obj
            dec=obj.modifiers.new('Mobile topology','DECIMATE');dec.ratio=.75 if obj.data.materials[0]==skin else .5
            bpy.ops.object.modifier_apply(modifier=dec.name)
        for im in (fabric,baked):im.scale(512,512);im.pack()
        bpy.ops.export_scene.gltf(filepath=str(Path(args.low).resolve()),export_format='GLB',export_animations=True,
            export_animation_mode='ACTIONS',export_nla_strips=True,export_force_sampling=True,
            export_apply=False,export_extras=True,export_yup=True,export_skins=True,export_all_influences=False,
            export_cameras=False,export_lights=False)
        stats['mobileBytes']=Path(args.low).stat().st_size
        stats['mobileVisibleTriangles']={outfit:sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes if o.get('outfit') in ('shared',outfit)) for outfit in OUTFITS}
        Path(args.report).write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n')
    if args.render:
        # Render the actual finished 3D model, never a reference image overlay.
        for o in meshes:o.hide_render=o.get('outfit') not in ('shared',args.outfit)
        idle=bpy.data.actions['Idle'];rig.animation_data.action=idle;scene.frame_set(0)
        world=bpy.data.worlds.new('Studio world');world.use_nodes=True
        world.node_tree.nodes['Background'].inputs[0].default_value=(.19,.23,.24,1)
        world.node_tree.nodes['Background'].inputs[1].default_value=.4;scene.world=world
        for loc,energy,size in [((-2,-4,5),450,4),((3,-1,3),250,3),((0,3,4),500,3)]:
            lamp=bpy.data.lights.new('Softbox','AREA');lamp.energy=energy;lamp.shape='DISK';lamp.size=size
            ob=bpy.data.objects.new('Softbox',lamp);scene.collection.objects.link(ob);ob.location=loc
            ob.rotation_euler=(Vector((0,0,1))-ob.location).to_track_quat('-Z','Y').to_euler()
        cam=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(cam)
        cam.location=(2.2,-4.7,2.15);target=Vector((0,0,.96))
        cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.13;scene.camera=cam
        scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32
        scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
        scene.render.image_settings.file_format='PNG';scene.render.filepath=str(Path(args.render).resolve())
        scene.view_settings.view_transform='AgX';bpy.ops.render.render(write_still=True)
    print('HERO_REPORT '+json.dumps(stats))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',required=True);p.add_argument('--blend',required=True);p.add_argument('--report',required=True)
    p.add_argument('--render');p.add_argument('--low');p.add_argument('--outfit',choices=OUTFITS,default='scholar')
    args=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
    (ROOT/'textures').mkdir(exist_ok=True)
    build(args)
