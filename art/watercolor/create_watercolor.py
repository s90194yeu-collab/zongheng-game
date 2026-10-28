"""Build a lightweight painted 2.5D village from the selected original AI artwork.

Blender --background --python-exit-code 1 --python create_watercolor.py --
  --sources DIR --layout layout.json --output DIR
Images are packed into the .blend and GLB. Original generated PNGs remain intact.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

def xyz(p):return (p[0],-p[2],p[1])

class Builder:
    def __init__(self,sources,layout,out):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        self.sources=sources;self.layout=layout;self.out=out;self.images={};self.materials={};self.report=[]
        self.normal=Vector(tuple(layout['view'][k] for k in ['x','y','z'])).normalized()
        self.right=Vector((self.normal.z,0,-self.normal.x)).normalized()
        self.up=self.normal.cross(self.right).normalized()
        (out/'textures').mkdir(parents=True,exist_ok=True)

    def image(self,key):
        if key in self.images:return self.images[key]
        image=bpy.data.images.load(str((self.sources/(key+'.png')).resolve()),check_existing=False)
        width,height=image.size;limit=1024 if key=='mountains' else 640
        if max(width,height)>limit:
            scale=limit/max(width,height);image.scale(round(width*scale),round(height*scale))
        image.name='Watercolor_'+key;image.filepath_raw=str((self.out/'textures'/(key+'.png')).resolve());image.file_format='PNG';image.save();image.pack()
        self.images[key]=image
        return image

    def material(self,key,cutout=False):
        name=('Cutout_' if cutout else 'Ground_')+key
        if name in self.materials:return self.materials[name]
        mat=bpy.data.materials.new(name);mat.use_nodes=True
        shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=1
        node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=self.image(key)
        mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
        if cutout:mat.node_tree.links.new(node.outputs['Alpha'],shader.inputs['Alpha'])
        self.materials[name]=mat;return mat

    def mesh(self,name,vertices,faces,uvs,material,position=(0,0,0),extras=None):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata([xyz(p) for p in vertices],[],faces);mesh.update()
        obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.location=xyz(position);mesh.materials.append(material)
        uv=mesh.uv_layers.new(name='UVMap')
        for loop in mesh.loops:uv.data[loop.index].uv=uvs[loop.vertex_index]
        for k,v in (extras or {}).items():obj[k]=v
        return obj

    def crop(self,key,region=(0,0,1,1)):
        image=self.image(key);w,h=image.size
        pixels=np.asarray(image.pixels[:],dtype=np.float32).reshape((h,w,4));alpha=pixels[:,:,3]
        if key not in ['grass','paving'] and np.mean(alpha<.02)<.01:raise ValueError(key+' requires real transparent alpha')
        x0,y0,x1,y1=[round(v*n) for v,n in zip(region,[w,h,w,h])]
        yy,xx=np.where(alpha[y0:y1,x0:x1]>.025)
        if len(xx)<10:raise ValueError(key+' empty atlas cell')
        lo_x=max(x0,x0+int(xx.min())-2);hi_x=min(x1,x0+int(xx.max())+3)
        lo_y=max(y0,y0+int(yy.min())-2);hi_y=min(y1,y0+int(yy.max())+3)
        return (lo_x/w,lo_y/h,hi_x/w,hi_y/h),(hi_y-lo_y)/(hi_x-lo_x)

    def sprite(self,name,key,position,width,region=(0,0,1,1),kind='garden',hall=None):
        crop,ratio=self.crop(key,region);u0,v0,u1,v1=crop;height=width*ratio
        vertices=[self.right*(-width/2),self.right*(width/2),self.right*(width/2)+self.up*height,self.right*(-width/2)+self.up*height]
        extras={'kind':kind,'painted':True,'paintedWidth':width,'paintedHeight':height,'groundAnchor':list(position)}
        if hall:extras['hallId']=hall
        obj=self.mesh(name,vertices,[(0,1,2,3)],[(u0,v0),(u1,v0),(u1,v1),(u0,v1)],self.material(key,True),position,extras)
        self.report.append({'name':name,'source':key,'kind':kind,'anchor':list(position),'width':width,'height':height,'uv':list(crop)})
        return obj

    def ground(self):
        self.mesh('PaintedGround',[(-25,0,-25),(25,0,-25),(25,0,25),(-25,0,25)],[(0,3,2,1)],[(0,1),(1,1),(1,0),(0,0)],self.material('grass'),extras={'kind':'ground','painted':True})
        # One union of route cells prevents coplanar overlapping road surfaces.
        lines=[r['points'] for r in self.layout['routes']]+[[{'x':0,'z':7},{'x':0,'z':2}]]
        def distance(x,z,a,b):
            dx=b['x']-a['x'];dz=b['z']-a['z'];t=max(0,min(1,((x-a['x'])*dx+(z-a['z'])*dz)/max(.00001,dx*dx+dz*dz)))
            return math.hypot(x-a['x']-dx*t,z-a['z']-dz*t)
        vertices=[];faces=[];uv=[]
        for ix in range(-31,32):
            for iz in range(-31,32):
                x,z=ix*.75,iz*.75
                if not any(distance(x,z,a,b)<.85 for line in lines for a,b in zip(line,line[1:])):continue
                k=len(vertices);points=[(x-.375,.018,z-.375),(x+.375,.018,z-.375),(x+.375,.018,z+.375),(x-.375,.018,z+.375)]
                vertices.extend(points);uv.extend([(p[0]/12,p[2]/12)for p in points]);faces.append((k,k+3,k+2,k+1))
        self.mesh('PaintedPaths',vertices,faces,uv,self.material('paving'),extras={'kind':'path','painted':True})
        c=self.layout['plaza'];vertices=[(c['x'],.025,c['z'])]+[(c['x']+c['radius']*math.cos(i*2*math.pi/72),.025,c['z']+c['radius']*math.sin(i*2*math.pi/72))for i in range(72)]
        faces=[(0,(i+1)%72+1,i+1)for i in range(72)]
        self.mesh('PaintedPlaza',vertices,faces,[(p[0]/12,p[2]/12)for p in vertices],self.material('paving'),extras={'kind':'plaza','painted':True})
        # A shallow physical plinth supports the true 3D bronze vessel.
        bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=1.5,depth=.25,location=xyz((3.6,.15,3)))
        o=bpy.context.object;o.name='DingPlinth';o.data.materials.append(self.material('paving'));o['kind']='plinth'

    def build(self):
        self.ground()
        for h in self.layout['halls']:
            width=(h['width']+1.8)*self.right.x+(h['depth']+1.8)*abs(self.right.z)
            self.sprite('PaintedHall_'+h['id'],h['id'],(h['x'],.04,h['z']+h['depth']/2),width,kind='hall',hall=h['id'])
        # Atlas coordinates use bottom-left origin, as in exported UVs.
        regions={'bamboo':(0,.5,.5,1),'cherry':(.5,.5,1,1),'rocks':(0,0,.5,.5),'pond':(.5,0,1,.5)}
        for i,p in enumerate(self.layout['ponds']):
            crop,_=self.crop('garden',regions['pond']);u0,v0,u1,v1=crop
            self.mesh('PaintedPond_'+str(i),[(-2.25,0,-2.25),(2.25,0,-2.25),(2.25,0,2.25),(-2.25,0,2.25)],[(0,3,2,1)],[(u0,v1),(u1,v1),(u1,v0),(u0,v0)],self.material('garden',True),(p['x'],.035,p['z']),{'kind':'pond','painted':True})
        decorations=[('bamboo',-24,-12,5),('bamboo',-24,4,5),('cherry',-22,-22,7),('cherry',22,-21,6.5),('bamboo',24,-5,5),('cherry',24,16,6),('rocks',23,23,4),('rocks',-22,23,4),('bamboo',-6,-24,5),('cherry',12,24,6)]
        for i,(kind,x,z,w)in enumerate(decorations):self.sprite('Garden_'+str(i),'garden',(x,.02,z),w,regions[kind])
        for i,(z,width,region)in enumerate([(-72,145,(0,2/3,1,1)),(-56,125,(0,1/3,1,2/3)),(-40,105,(0,0,1,1/3))]):
            self.sprite('MountainLayer_'+str(i),'mountains',(-8,(z+40)*.625-15,z),width,region,kind='mountain')
        bpy.context.view_layer.update()
        self.out.mkdir(exist_ok=True,parents=True)
        bpy.ops.wm.save_as_mainfile(filepath=str((self.out/'watercolor-village.blend').resolve()),compress=True)
        bpy.ops.export_scene.gltf(filepath=str((self.out/'watercolor-village.glb').resolve()),export_format='GLB',export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
        report={'tool':bpy.app.version_string,'style':'warm watercolor storybook, selected option 2','source':'original built-in imagegen artwork; Blender 2.5D planes and path geometry','view':self.layout['view'],
                'triangles':sum(len(p.vertices)-2 for o in bpy.data.objects if o.type=='MESH' for p in o.data.polygons),'meshes':sum(o.type=='MESH' for o in bpy.data.objects),'textures':len(self.images),'bytes':(self.out/'watercolor-village.glb').stat().st_size,'sprites':self.report}
        (self.out/'watercolor-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items()if k!='sprites'},ensure_ascii=False))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--sources',type=Path,required=True);p.add_argument('--layout',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args(sys.argv[sys.argv.index('--')+1:]);Builder(a.sources,json.loads(a.layout.read_text()),a.output).build()
