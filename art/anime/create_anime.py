"""Anime scholar/traveler/armor avatars built in Blender 4.5 LTS.

CC0 VRoid beta anatomy, facial textures and layered hair; original Han-inspired
wardrobe, proportions, accessories, shading and animation. See source/sources.json.
The AI design sheets are references, never substituted for the actual 3D model.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector, Matrix, Quaternion
from mathutils.kdtree import KDTree

ROOT=Path(__file__).resolve().parent
OUTFITS=('scholar','traveler','armor')


def material(name,rgb,roughness=.85):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*rgb,1)
    shader=m.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*rgb,1)
    shader.inputs['Roughness'].default_value=roughness;shader.inputs['Specular IOR Level'].default_value=.12
    return m


def build(sex,args):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene;scene.render.fps=30
    source=json.loads((ROOT/'source'/(sex+'-gltf.json')).read_text())
    humanoid={b['bone']:source['nodes'][b['node']]['name'] for b in source['extensions']['VRM']['humanoid']['humanBones']}
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'source'/(sex+'-base.glb')))
    rig=next(o for o in scene.objects if o.type=='ARMATURE')
    body=bpy.data.objects.get('Body');face=bpy.data.objects.get('Face');hair=next(o for o in scene.objects if o.name.startswith('Hair') and o.type=='MESH')
    for obj in list(scene.objects):
        if obj not in (rig,body,face,hair):bpy.data.objects.remove(obj,do_unlink=True)
    for bone in rig.pose.bones:bone.custom_shape=None
    # Bake the imported object transforms before editing its geometry/rest rig.
    for obj in (body,face,hair):
        matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4);obj.data.transform(matrix,shape_keys=True)
    matrix=rig.matrix_world.copy();rig.parent=None;rig.data.transform(matrix);rig.matrix_world=Matrix.Identity(4)
    bpy.context.view_layer.update()
    iris_index=next(i for i,m in enumerate(face.data.materials) if 'EyeIris' in m.name)
    iris_ids={i for f in face.data.polygons if f.material_index==iris_index for i in f.vertices}
    front=sum(face.data.vertices[i].co.y for i in iris_ids)/len(iris_ids)
    rotation=Matrix.Rotation(math.pi if front>0 else 0,4,'Z')
    floor=min(v.co.z for v in body.data.vertices)
    old_height=max(v.co.z for v in hair.data.vertices)-floor
    scale=(1.76 if sex=='male' else 1.66)/old_height
    def linear(co):return (rotation@(Vector(co)-Vector((0,0,floor))))*scale
    pivot=linear(rig.data.bones[humanoid['head']].head_local)
    neck=linear(rig.data.bones[humanoid['neck']].head_local)
    head_scale=1.13 if sex=='male' else 1.06
    def stylize(co):
        p=linear(co);w=max(0,min(1,(p.z-neck.z-.012)/.065));w=w*w*(3-2*w)
        return p.lerp(pivot+(p-pivot)*head_scale,w)
    for obj in (body,face,hair):
        if obj.data.shape_keys:
            for block in obj.data.shape_keys.key_blocks:
                for vertex in block.data:vertex.co=stylize(vertex.co)
        else:
            for vertex in obj.data.vertices:vertex.co=stylize(vertex.co)
        obj.data.update()
        obj.parent=rig;obj.matrix_parent_inverse=Matrix.Identity(4);obj.matrix_basis=Matrix.Identity(4)
    bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
    for bone in rig.data.edit_bones:
        bone.head=stylize(bone.head);bone.tail=stylize(bone.tail)
    bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
    rig.name='AnimeRig_'+sex;rig['assetId']='zongheng-anime-v1';rig['body']=sex;rig['style']='anime'
    bpy.ops.object.select_all(action='DESELECT')
    # Retain one proper eyelid morph instead of dozens of unused expressions.
    blink=next(g for g in source['extensions']['VRM']['blendShapeMaster']['blendShapeGroups'] if g.get('presetName')=='blink')
    if face.data.shape_keys:
        original=list(face.data.shape_keys.key_blocks);basis=original[0]
        blink_key=face.shape_key_add(name='Blink',from_mix=False)
        for i,point in enumerate(blink_key.data):
            value=basis.data[i].co.copy()
            for binding in blink['binds']:value+=(original[binding['index']+1].data[i].co-basis.data[i].co)*(binding['weight']/100)
            point.co=value
        for block in original[1:]:face.shape_key_remove(block)
        blink_key.value=0
    for obj in (face,hair):obj['assetId']='zongheng-anime-v1';obj['outfit']='shared';obj['body']=sex
    face.name='Anime_Face_'+sex;hair.name='Anime_LayeredHair_'+sex
    # Material factors recolor the original grayscale hair fibers. The facial
    # drawing stays intact, with its eyebrows, eyelashes and painted highlights.
    for m in list(face.data.materials)+list(hair.data.materials):
        old=m.name
        if 'Hair' in old:
            m.name='Anime_Hair_'+str(len([x for x in bpy.data.materials if x.name.startswith('Anime_Hair_')]))
            factor=(.035,.055,.105,1)
        elif 'EyeIris' in old:m.name='Anime_Iris';factor=(1,1,1,1)
        elif 'Face_00_SKIN' in old:m.name='Anime_Face';factor=(1,1,1,1)
        elif 'EyeWhite' in old:m.name='Anime_EyeWhite';factor=(1,1,1,1)
        elif 'EyeHighlight' in old:m.name='Anime_EyeHighlight';factor=(1,1,1,1)
        else:m.name='Anime_Line_'+old.split('_')[-2];factor=(1,1,1,1)
        # Importer's factor Mix node can be replaced by a new diffuse setup,
        # retaining the PNG's alpha and UV mapping.
        texture=next((n.image for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image),None)
        nodes=m.node_tree.nodes;nodes.clear();out=nodes.new('ShaderNodeOutputMaterial');p=nodes.new('ShaderNodeBsdfPrincipled')
        p.inputs['Base Color'].default_value=factor;p.inputs['Roughness'].default_value=1;p.inputs['Specular IOR Level'].default_value=0
        if texture:
            tex=nodes.new('ShaderNodeTexImage');tex.image=texture
            tint=nodes.new('ShaderNodeMixRGB');tint.blend_type='MULTIPLY';tint.inputs[0].default_value=1;tint.inputs[2].default_value=factor
            m.node_tree.links.new(tex.outputs['Color'],tint.inputs[1]);m.node_tree.links.new(tint.outputs[0],p.inputs['Base Color'])
            if old!='M00_000_00_Face_00_SKIN' and old!='F00_000_00_Face_00_SKIN':m.node_tree.links.new(tex.outputs['Alpha'],p.inputs['Alpha'])
        m.node_tree.links.new(p.outputs[0],out.inputs['Surface']);m.diffuse_color=factor
        m.use_backface_culling=False
        m.surface_render_method='DITHERED'
    # Flat-color wardrobe deliberately uses clear, readable large color blocks.
    ivory=material('Anime_Ivory',(.91,.86,.72));jade=material('Anime_Cloth',(.09,.39,.34));lining=material('Anime_Lining',(.035,.15,.16))
    dark=material('Anime_Trousers',(.025,.055,.085));leather=material('Anime_Leather',(.105,.065,.04));gold=material('Anime_Gold',(.67,.43,.12))
    gem=material('Anime_Jade',(.19,.65,.49));ink=material('Anime_Ink',(.018,.025,.045));skin=material('Anime_Skin',(.95,.76,.63))
    armor_mat=material('Anime_Armor',(.05,.24,.29));trim=material('Anime_Embroidery',(.74,.6,.28))
    # Cache the original body's normalized weights and geometry for garments.
    coords=[v.co.copy() for v in body.data.vertices]
    weights=[]
    for v in body.data.vertices:
        row={body.vertex_groups[g.group].name:g.weight for g in v.groups if g.weight>.001};s=sum(row.values())
        weights.append({k:w/s for k,w in row.items()} if s else {humanoid['hips']:1})
    tree=KDTree(len(coords))
    for i,p in enumerate(coords):tree.insert(p,i)
    tree.balance()
    def nearest(co):return weights[tree.find(co)[1]]
    def bone(name):return rig.data.bones[humanoid[name]].head_local.copy()
    hips=bone('hips').z;chest=bone('chest').z;neckz=bone('neck').z
    waist=hips+.055;shoulder=abs(bone('leftUpperArm').x)
    def mesh(name,positions,polygons,mat,vw=None,uvs=None,outfit='shared',slot='detail'):
        data=bpy.data.meshes.new(name);data.from_pydata(positions,[],polygons);data.update()
        obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);data.materials.append(mat)
        for f in data.polygons:f.use_smooth=True
        if uvs:
            layer=data.uv_layers.new(name='UVMap')
            for f,row in zip(data.polygons,uvs):
                for i,xy in zip(f.loop_indices,row):layer.data[i].uv=xy
        vw=vw or [nearest(Vector(v)) for v in positions]
        for key in sorted({k for r in vw for k in r}):
            group=obj.vertex_groups.new(name=key)
            for i,row in enumerate(vw):
                if row.get(key,0)>.001:group.add([i],row[key],'REPLACE')
        obj.parent=rig;mod=obj.modifiers.new('Anime skin','ARMATURE');mod.object=rig
        obj['assetId']='zongheng-anime-v1';obj['body']=sex;obj['outfit']=outfit;obj['slot']=slot
        return obj
    def extract(name,check,mat,outfit='shared',inflate=0):
        selected=[f for f in body.data.polygons if check(f)]
        ids=sorted({i for f in selected for i in f.vertices});remap={v:i for i,v in enumerate(ids)}
        points=[]
        for i in ids:
            p=coords[i].copy();normal=body.data.vertices[i].normal
            if inflate:p+=normal*inflate
            points.append(p)
        uv=body.data.uv_layers.active
        return mesh(name,points,[tuple(remap[i] for i in f.vertices) for f in selected],mat,[weights[i] for i in ids],
                    [[tuple(uv.data[i].uv) for i in f.loop_indices] for f in selected] if uv else None,outfit)
    mat_name=lambda f:body.data.materials[f.material_index].name
    def influence(i,words):return sum(w for k,w in weights[i].items() if any(s in k for s in words))
    extract('Anime neck and hands',lambda f:'Body_00_SKIN' in mat_name(f) and all(influence(i,['Head','Neck','Hand','Thumb','Index','Middle','Ring','Little'])>.45 for i in f.vertices),skin)
    ankle_cut=min(bone('leftFoot').z,bone('rightFoot').z)+.015
    extract('Anime fitted trousers',lambda f:'Body_00_SKIN' in mat_name(f) and all(influence(i,['UpperLeg','LowerLeg','Foot','Toe','Hips'])>.6 and ankle_cut<coords[i].z<waist for i in f.vertices),dark,inflate=.004)
    extract('Anime boots',lambda f:'Shoes' in mat_name(f),leather)
    # The cache holds just the torso, preventing nearby T-pose sleeves from
    # inflating collars, belts or armor to the width of the arms.
    torso_ids={i for f in body.data.polygons if 'Tops' in mat_name(f) for i in f.vertices if abs(coords[i].x)<shoulder*1.55 and influence(i,['Hips','Spine','Chest'])>.6}
    torso=[coords[i] for i in torso_ids]
    torso_faces=[f for f in body.data.polygons if 'Tops' in mat_name(f)]
    sections={}
    zmin=min(v.z for v in torso);zmax=max(v.z for v in torso)
    def section(z):
        z=max(zmin+.001,min(zmax-.001,z));key=round(z,5)
        if key in sections:return sections[key]
        segments=[]
        for f in torso_faces:
            pp=[coords[i] for i in f.vertices]
            if min(v.z for v in pp)>z or max(v.z for v in pp)<z:continue
            hits=[]
            for a,b in zip(pp,pp[1:]+pp[:1]):
                if (a.z-z)*(b.z-z)<=0 and abs(b.z-a.z)>1e-7:
                    c=a.lerp(b,(z-a.z)/(b.z-a.z))
                    if abs(c.x)<shoulder*1.7:hits.append(c)
            if len(hits)>=2:segments.append((hits[0],hits[1]))
        sections[key]=segments;return segments
    cross=lambda a,b:a.x*b.y-a.y*b.x
    def shell(angle,z,extra=.006):
        d=Vector((math.cos(angle),math.sin(angle),0));found=[]
        for a,b in section(z):
            e=b-a;denom=cross(d,e)
            if abs(denom)<1e-8:continue
            t=cross(a,e)/denom;u=cross(a,d)/denom
            if t>0 and -.001<=u<=1.001:found.append(t)
        radius=max(found)+extra if found else (shoulder*.84+extra)
        return Vector((d.x*radius,d.y*radius,z))
    def front_y(x,z):
        values=[]
        for a,b in section(z):
            if (a.x-x)*(b.x-x)<=0 and abs(b.x-a.x)>1e-8:values.append(a.y+(b.y-a.y)*(x-a.x)/(b.x-a.x))
        return min(values) if values else -.11
    def ribbon(name,points,width,mat,bone_name,outfit='shared'):
        pos=[];polys=[]
        for j,p in enumerate(points):
            d=Vector(points[min(j+1,len(points)-1)])-Vector(points[max(j-1,0)])
            a=d.cross(Vector((0,-1,0))).normalized()*width/2
            pos.extend([Vector(p)-a,Vector(p)+a])
            if j:polys.append((j*2-2,j*2-1,j*2+1,j*2))
        return mesh(name,pos,polys,mat,[{bone_name:1} for _ in pos],outfit=outfit)
    def ring(name,z0,z1,mat,outfit='shared',extra=.008,segments=48,bind=None):
        pos=[shell(math.tau*k/segments,z,extra) for z in (z0,z1) for k in range(segments)];polys=[]
        for k in range(segments):n=(k+1)%segments;polys.append((k,n,segments+n,segments+k))
        return mesh(name,pos,polys,mat,[{bind or humanoid['hips']:1} for _ in pos],outfit=outfit)
    def ellipsoid(name,co,scale,mat,bind,outfit='shared',segments=20,rings=10):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=co);temp=bpy.context.object;temp.scale=scale
        bpy.ops.object.transform_apply(location=True,rotation=False,scale=True)
        pos=[v.co.copy() for v in temp.data.vertices];polys=[tuple(f.vertices) for f in temp.data.polygons];bpy.data.objects.remove(temp,do_unlink=True)
        return mesh(name,pos,polys,mat,[{bind:1} for _ in pos],outfit=outfit)
    def curve(name,points,radius,mat,bind,outfit='shared'):
        # Conversion affects every selected object, including imported meshes.
        # Isolate the new curve so facial shape keys and skinning stay intact.
        bpy.ops.object.select_all(action='DESELECT')
        data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.bevel_depth=radius;data.bevel_resolution=1;data.resolution_u=3
        s=data.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
        for p,co in zip(s.bezier_points,points):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
        temp=bpy.data.objects.new(name,data);scene.collection.objects.link(temp);bpy.context.view_layer.objects.active=temp;temp.select_set(True);bpy.ops.object.convert(target='MESH')
        pos=[v.co.copy() for v in temp.data.vertices];polys=[tuple(f.vertices) for f in temp.data.polygons];bpy.data.objects.remove(temp,do_unlink=True)
        return mesh(name,pos,polys,mat,[{bind:1} for _ in pos],outfit=outfit)
    # Personalize the original layered hair with a small jade pin and ribbon.
    head=bone('head');top=max(v.co.z for v in hair.data.vertices)
    pinz=top-.04;piny=head.y
    curve('Jade hairpin',[(-.065,piny,pinz),(.07,piny,pinz)],.0035,gold,humanoid['head'])
    ellipsoid('Hairpin jade',(.067,piny,pinz),(.012,.006,.013),gem,humanoid['head'])
    if sex=='female':
        for sign in (-1,1):
            points=[(sign*.03,head.y+.035,top-.035),(sign*.055,head.y+.07,top-.12),(sign*.065,head.y+.075,top-.24)]
            ribbon('Jade hair ribbon',points,.018,jade,humanoid['head'])
    for side in ('left','right'):
        foot=bone(side+'Foot');knee=bone(side+'LowerLeg');segments=28;pos=[];polys=[]
        for z,radius in [(foot.z-.035,.04),(foot.z+.07,.052),(foot.z+.20,.06)]:
            t=(z-foot.z)/(knee.z-foot.z);center=foot.lerp(knee,t)
            for k in range(segments):
                a=math.tau*k/segments;pos.append((center.x+math.cos(a)*radius,center.y+math.sin(a)*radius*.9,z))
        for j in range(2):
            for k in range(segments):n=(k+1)%segments;polys.append((j*segments+k,j*segments+n,(j+1)*segments+n,(j+1)*segments+k))
        mesh('Fitted boot shaft '+side,pos,polys,leather,[{humanoid[side+'LowerLeg']:1}]*len(pos))
    # Every outfit uses the same armature and silhouette with distinct garments.
    for outfit in OUTFITS:
        shirt=extract(outfit+' crossed-collar tunic',lambda f:'Tops' in mat_name(f) and all(waist-.025<coords[i].z<neckz+.008 and abs(coords[i].x)<shoulder+.024 for i in f.vertices),ivory,outfit)
        # Continuous long sleeves bridge the T-pose shoulders, elbows and wrists.
        for side in ('left','right'):
            a=bone(side+'UpperArm');b=bone(side+'LowerArm');c=bone(side+'Hand');n=28;rows=15;pos=[];polys=[]
            for j in range(rows):
                t=j/(rows-1)
                center=a.lerp(b,t*2) if t<.5 else b.lerp(c,(t-.5)*1.92)
                radius=(.057+.035*t) if outfit=='scholar' else (.056-.018*t)
                for k in range(n):
                    angle=math.tau*k/n;pos.append(center+Vector((0,math.cos(angle)*radius*.82,math.sin(angle)*radius)))
                if j:
                    for k in range(n):nk=(k+1)%n;polys.append(((j-1)*n+k,(j-1)*n+nk,j*n+nk,j*n+k))
            mesh(outfit+' long sleeve '+side,pos,polys,ivory,outfit=outfit)
        # The small inner collar covers the seam between the face and neck mesh.
        n=36;pos=[];polys=[]
        for z in (neckz-.035,neckz+.018):
            for k in range(n):
                a=math.tau*k/n;pos.append((math.cos(a)*.044,neck.y+math.sin(a)*.045,z))
        for k in range(n):nk=(k+1)%n;polys.append((k,nk,n+nk,n+k))
        mesh(outfit+' ivory inner collar',pos,polys,ivory,[{humanoid['neck']:1}]*len(pos),outfit=outfit)
        # A jade hem, a proper flat crossed collar, a narrow fitted belt.
        span=neckz-waist
        for side in (-1,1):
            xz=[(side*.034,neckz-.012),(side*.065,neckz-.065),(side*.02,neckz-span*.43),(-side*.055,waist+.12),(-side*.095,waist+.035)]
            if side==1:xz=xz[:3]+[(0,neckz-span*.49)]
            points=[(x,front_y(x,z)-.012,z) for x,z in xz]
            ribbon(outfit+' jade crossed collar',points,.027,jade,humanoid['chest'],outfit)
            ribbon(outfit+' gold collar stitch',[(x,y-.001,z) for x,y,z in points],.0025,gold,humanoid['chest'],outfit)
        ring(outfit+' narrow leather belt',waist-.022,waist+.028,leather,outfit,extra=.008)
        clasp=shell(-math.pi/2,waist+.002,.019)
        ellipsoid(outfit+' gold belt fitting',clasp,(.024,.006,.016),gold,humanoid['hips'],outfit)
        ellipsoid(outfit+' jade clasp',clasp+Vector((0,-.007,0)),(.014,.003,.01),gem,humanoid['hips'],outfit)
        # Flowing split robe, shorter traveling coat, or articulated armor skirt.
        bottom=(.36 if sex=='male' else .32) if outfit=='scholar' else waist-.22
        pos=[];polys=[];vw=[];rows=12;segments=64
        for j in range(rows):
            t=j/(rows-1);z=waist-.014+(bottom-waist+.014)*t
            for k in range(segments+1):
                a=math.tau*k/segments;base=shell(a,waist-.018,.006)
                flare=(.13 if outfit=='scholar' else .06)*t
                if sex=='female' and outfit=='scholar':flare+=.035*t
                base.x+=math.cos(a)*flare;base.y+=math.sin(a)*flare*.65;base.z=z
                ripple=math.sin(a*12)*.006*t;base.x+=math.cos(a)*ripple;base.y+=math.sin(a)*ripple
                pos.append(base);leg=humanoid['leftUpperLeg'] if base.x>0 else humanoid['rightUpperLeg'];w=t*.35
                vw.append({humanoid['hips']:1-w,leg:w})
                if j and k:
                    if abs(math.sin(a))<.075 and j>3:continue
                    polys.append(((j-1)*(segments+1)+k-1,(j-1)*(segments+1)+k,j*(segments+1)+k,j*(segments+1)+k-1))
        robe=mesh(outfit+' flowing robe',pos,polys,ivory if outfit=='scholar' else jade,vw,outfit=outfit)
        # Front jade lapels make the long robe read as layered Han clothing.
        if outfit=='scholar':
            for sign in (-1,1):
                pp=[];pol=[];ww=[]
                for j in range(rows):
                    t=j/(rows-1);z=waist-.014+(bottom-waist+.014)*t
                    x=sign*(.055+.075*t);y=front_y(0,waist)-.022-.09*t
                    pp.extend([(x-sign*.02,y,z),(x+sign*.02,y,z)]);leg=humanoid['leftUpperLeg'] if sign>0 else humanoid['rightUpperLeg']
                    ww.extend([{humanoid['hips']:1-t*.3,leg:t*.3}]*2)
                    if j:pol.append((j*2-2,j*2-1,j*2+1,j*2))
                mesh('Scholar jade lapel',pp,pol,jade,ww,outfit=outfit)
        for side in ('left','right'):
            arm=bone(side+'LowerArm');hand=bone(side+'Hand');d=(hand-arm).normalized();center=arm.lerp(hand,.91)
            # Wrist cuffs follow the original horizontal sleeve axis.
            circles=[];pf=[];n=20
            for center2 in [center-d*.024,center+d*.024]:
                for k in range(n):
                    a=math.tau*k/n;radius=.093 if outfit=='scholar' else .041;circles.append(center2+Vector((0,math.cos(a)*radius*.84,math.sin(a)*radius)))
            for k in range(n):nk=(k+1)%n;pf.append((k,nk,n+nk,n+k))
            mesh('Jade cuff '+side,circles,pf,jade,[{humanoid[side+'LowerArm']:1}]*len(circles),outfit=outfit)
        if outfit=='traveler':
            pp=[];pol=[];ww=[];n=44
            for j in range(7):
                t=j/6;z=neckz-.045-.29*t
                for k in range(n+1):
                    a=-.13+(math.pi+.26)*k/n
                    pp.append((math.cos(a)*(.07+(shoulder+.065)*t),.025+math.sin(a)*(.085+.07*t),z))
                    ww.append({humanoid['chest']:1})
                    if j and k:pol.append(((j-1)*(n+1)+k-1,(j-1)*(n+1)+k,j*(n+1)+k,j*(n+1)+k-1))
            mesh('Traveler short cape',pp,pol,jade,ww,outfit=outfit)
            xz=[(-.11,neckz-.09),(-.035,chest-.02),(.09,waist+.04),(.15,waist-.075)]
            ribbon('Traveler shoulder strap',[(x,front_y(x,z)-.026,z) for x,z in xz],.022,leather,humanoid['chest'],outfit)
            ellipsoid('Traveler satchel',(.165,-.025,waist-.085),(.052,.044,.065),leather,humanoid['hips'],outfit)
            ellipsoid('Satchel clasp',(.165,-.069,waist-.06),(.008,.003,.007),gold,humanoid['hips'],outfit)
        if outfit=='armor':
            # Compact, matte lamellae fit the actual tunic's cross-section.
            for row in range(6):
                z=waist+.04+row*(neckz-waist-.15)/6
                for k in range(20):
                    a=math.tau*k/20
                    pp=[shell(a+aa,z+zz,.022) for zz in (-.022,.022) for aa in (-.145,.145)]
                    mesh('Jade lamellar plate',pp,[(0,1,3,2)],armor_mat,[{humanoid['chest']:1}]*4,outfit=outfit)
                    ellipsoid('Lamellar bronze rivet',shell(a,z+.009,.026),(.0023,.0023,.0023),gold,humanoid['chest'],outfit,8,4)
            for side,sign in [('left',1),('right',-1)]:
                co=bone(side+'UpperArm');pp=[co+Vector((x*sign,y,z)) for x,y,z in [(-.035,-.065,.015),(.07,-.07,-.015),(.085,.015,-.04),(.025,.075,.01),(-.035,.045,.025),(0,0,.055)]]
                pol=[(0,1,5),(1,2,5),(2,3,5),(3,4,5),(4,0,5)]
                mesh('Compact shoulder guard '+side,pp,pol,armor_mat,[{humanoid[side+'UpperArm']:1}]*len(pp),outfit=outfit)
    # Original uniform geometry is not part of the delivered character.
    bpy.data.objects.remove(body,do_unlink=True)
    # Combine clothing by outfit/material, preserving the separate facial morph.
    buckets={}
    for obj in list(scene.objects):
        if obj.type=='MESH' and obj not in (face,hair):buckets.setdefault((obj['outfit'],obj.data.materials[0].name),[]).append(obj)
    for (outfit,mat),items in buckets.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in items:obj.select_set(True)
        bpy.context.view_layer.objects.active=items[0]
        if len(items)>1:bpy.ops.object.join()
        obj=items[0];obj.name='Anime_'+sex+'_'+outfit+'_'+mat
        obj['assetId']='zongheng-anime-v1';obj['body']=sex;obj['outfit']=outfit
    # Reduce the source hair's dense individual strands for a mobile game.
    bpy.context.view_layer.objects.active=hair
    dec=hair.modifiers.new('Game hair topology','DECIMATE');dec.ratio=.7 if sex=='male' else .85
    bpy.ops.object.modifier_apply(modifier=dec.name)
    bpy.data.orphans_purge(do_recursive=True)
    for image in bpy.data.images:
        if image.has_data and image.name not in ('Render Result','Viewer Node'):
            if max(image.size)>1024:
                ratio=1024/max(image.size);image.scale(max(16,round(image.size[0]*ratio)),max(16,round(image.size[1]*ratio)))
            image.pack()
    # Keyed joints use the VRoid T-pose convention, with actual elbow flexion.
    rig.animation_data_create()
    def rotate(name,x=0,y=0,z=0):
        pb=rig.pose.bones[humanoid.get(name,name)];basis=pb.bone.matrix_local.to_quaternion();q=Quaternion((1,0,0),x)@Quaternion((0,1,0),y)@Quaternion((0,0,1),z)
        pb.rotation_mode='QUATERNION';pb.rotation_quaternion=basis.inverted()@q@basis
    animated=[humanoid[k] for k in ['hips','spine','chest','neck','head','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot']]
    for clip,duration in [('Idle',120),('Walk',36),('Run',24),('Bow',72)]:
        action=bpy.data.actions.new(clip);rig.animation_data.action=action
        for frame in range(0,duration+1,3):
            wave=math.sin(math.tau*frame/duration)
            for n in animated:rotate(n)
            for side,sign in [('left',1),('right',-1)]:
                rotate(side+'UpperArm',y=1.14*sign)
                rotate(side+'LowerArm',z=-.15*sign)
                if clip in ('Walk','Run'):
                    stride=(.27 if clip=='Walk' else .46)*wave*sign
                    rotate(side+'UpperLeg',x=stride);rotate(side+'LowerLeg',x=max(0,-stride)*1.45)
                    rotate(side+'Foot',x=-max(0,-stride)*.3)
                    rotate(side+'UpperArm',x=-stride*.85,y=1.1*sign)
                    rotate(side+'LowerArm',z=-(.38 if clip=='Walk' else .8)*sign)
                if clip=='Idle':rotate(side+'UpperArm',y=(1.14+.008*wave)*sign)
                if clip=='Bow':
                    t=math.sin(math.pi*frame/duration)**2
                    rotate(side+'UpperArm',x=-.3*t,y=(1.14+.1*t)*sign);rotate(side+'LowerArm',z=-(.15+.35*t)*sign)
            if clip=='Idle':rotate('chest',x=.006*wave);rotate('head',z=.012*wave)
            if clip=='Bow':
                t=math.sin(math.pi*frame/duration)**2;rotate('spine',x=.2*t);rotate('chest',x=.16*t);rotate('head',x=.15*t)
            for n in animated:rig.pose.bones[n].keyframe_insert(data_path='rotation_quaternion',frame=frame,group=n)
        action.use_fake_user=True;track=rig.animation_data.nla_tracks.new();track.name=clip;track.strips.new(clip,0,action);track.mute=True
    rig.animation_data.action=None
    for n in animated:rotate(n)
    meshes=[o for o in scene.objects if o.type=='MESH']
    def tris(obj):return sum(len(p.vertices)-2 for p in obj.data.polygons)
    assert face.data.shape_keys and 'Blink' in face.data.shape_keys.key_blocks, 'Facial blink must survive geometry operations'
    assert any(m.type=='ARMATURE' for m in face.modifiers), 'Face must follow the animated head'
    report={'assetId':'zongheng-anime-v1','body':sex,'bones':len(rig.data.bones),'clips':['Idle','Walk','Run','Bow'],'outfits':list(OUTFITS),'blinkMorph':True,
            'visibleTriangles':{outfit:sum(tris(o) for o in meshes if o.get('outfit') in ('shared',outfit)) for outfit in OUTFITS}}
    output=Path(args.output);output.mkdir(parents=True,exist_ok=True)
    high=output/('anime-'+sex+'.glb');low=output/('anime-'+sex+'-mobile.glb')
    def export(path):
        bpy.ops.export_scene.gltf(filepath=str(path.resolve()),export_format='GLB',export_animation_mode='ACTIONS',export_animations=True,export_nla_strips=True,
            export_force_sampling=True,export_skins=True,export_yup=True,export_extras=True,export_cameras=False,export_lights=False,export_morph=True)
    export(high);report['bytes']=high.stat().st_size
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/('anime-'+sex+'.blend')))
    for obj in meshes:
        if obj==face or len(obj.data.polygons)<120 or any(m and m.name in ('Anime_Armor','Anime_Jade') for m in obj.data.materials):continue
        bpy.context.view_layer.objects.active=obj;dec=obj.modifiers.new('Mobile topology','DECIMATE');dec.ratio=.55 if obj==hair else .72
        bpy.ops.object.modifier_apply(modifier=dec.name)
    for image in bpy.data.images:
        if image.has_data and max(image.size)>512:
            ratio=512/max(image.size);image.scale(max(16,round(image.size[0]*ratio)),max(16,round(image.size[1]*ratio)));image.pack()
    export(low);report['mobileBytes']=low.stat().st_size
    report['mobileVisibleTriangles']={outfit:sum(tris(o) for o in meshes if o.get('outfit') in ('shared',outfit)) for outfit in OUTFITS}
    (ROOT/(sex+'-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('ANIME_REPORT '+json.dumps(report))


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--sex',choices=('male','female'),required=True);p.add_argument('--output',default='public/models')
    args=p.parse_args(sys.argv[sys.argv.index('--')+1:]);build(args.sex,args)
