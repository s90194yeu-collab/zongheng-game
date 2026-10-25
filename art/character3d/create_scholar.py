"""Original stylized scholar prototype. Blender 4.5, Z-up, front -Y.

blender --background --factory-startup --python-exit-code 1 --python
art/character3d/create_scholar.py -- --output public/models/scholar-pilot.glb
--blend art/character3d/scholar-pilot.blend
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def make_material(name, color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = 0.85
    return material


def build(output, blend=None, report=None):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.fps = 30
    palette = {
        "Robe_Main": (0.12, 0.38, 0.34), "Robe_Shade": (0.08, 0.24, 0.24),
        "Ivory": (0.91, 0.86, 0.70), "Gold": (0.67, 0.46, 0.18),
        "Jade": (0.25, 0.60, 0.48), "Skin": (0.91, 0.65, 0.48),
        "Hair": (0.035, 0.035, 0.075), "Ink": (0.025, 0.022, 0.04),
        "Boots": (0.07, 0.10, 0.13), "Eye_White": (0.98, 0.98, 0.95),
        "Eye_Iris": (0.04, 0.25, 0.27), "Blush": (0.83, 0.39, 0.34),
    }
    materials = {name: make_material(name, color) for name, color in palette.items()}
    rig = bpy.data.objects.new("ScholarRig", bpy.data.armatures.new("ScholarSkeleton"))
    scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bones = {
        "Root": ((0, 0, 0), (0, 0, 0.2), None),
        "Hips": ((0, 0, 0.72), (0, 0, 0.92), "Root"),
        "Spine": ((0, 0, 0.92), (0, 0, 1.25), "Hips"),
        "Head": ((0, 0, 1.25), (0, 0, 1.75), "Spine"),
    }
    for side, sign in (("L", 1), ("R", -1)):
        bones.update({
            "UpperArm."+side: ((0.24*sign, 0, 1.2), (0.34*sign, 0, 0.99), "Spine"),
            "Forearm."+side: ((0.34*sign, 0, 0.99), (0.37*sign, -0.025, 0.79), "UpperArm."+side),
            "Thigh."+side: ((0.12*sign, 0, 0.76), (0.12*sign, 0, 0.44), "Hips"),
            "Shin."+side: ((0.12*sign, 0, 0.44), (0.12*sign, 0, 0.12), "Thigh."+side),
            "Foot."+side: ((0.12*sign, 0, 0.12), (0.12*sign, -0.13, 0.10), "Shin."+side),
        })
    for name, (head, tail, parent) in bones.items():
        bone = rig.data.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        if parent:
            bone.parent = rig.data.edit_bones[parent]
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)

    def bind(obj, name, material, bone):
        obj.name = name
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        obj.data.materials.append(materials[material])
        obj.parent = rig
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1, "REPLACE")
        modifier = obj.modifiers.new("Skin", "ARMATURE")
        modifier.object = rig
        for face in obj.data.polygons:
            face.use_smooth = True
        return obj

    def ellipsoid(name, position, scale, material, bone="Spine", rotation=None):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=position)
        obj = bpy.context.object
        obj.scale = scale
        if rotation:
            obj.rotation_euler = rotation
        return bind(obj, name, material, bone)

    def cylinder(name, position, upper, lower, depth, material, bone="Spine", rotation=None):
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=lower, radius2=upper, depth=depth, location=position)
        obj = bpy.context.object
        if rotation:
            obj.rotation_euler = rotation
        return bind(obj, name, material, bone)

    def ribbon(name, points, width, material, bone="Spine"):
        # A shallow raised strip on the robe; opaque geometry, no texture dependencies.
        vertices = [(x+offset, y, z) for x, y, z in points for offset in (-width/2, width/2)]
        faces = [(2*i, 2*i+1, 2*i+3, 2*i+2) for i in range(len(points)-1)]
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        scene.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        result = bind(obj, name, material, bone)
        obj.select_set(False)
        return result

    def tube(name, points, radius, material, bone="Head"):
        curve = bpy.data.curves.new(name, "CURVE")
        curve.dimensions = "3D"
        curve.bevel_depth, curve.bevel_resolution = radius, 2
        spline = curve.splines.new("BEZIER")
        spline.bezier_points.add(len(points)-1)
        for vertex, point in zip(spline.bezier_points, points):
            vertex.co = point
            vertex.handle_left_type = vertex.handle_right_type = "AUTO"
        obj = bpy.data.objects.new(name, curve)
        scene.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.ops.object.convert(target="MESH")
        return bind(bpy.context.object, name, material, bone)

    cylinder("Robe_Torso", (0, 0, 1.02), 0.23, 0.275, 0.47, "Robe_Main")
    ellipsoid("Shoulders", (0, 0, 1.19), (0.265, 0.14, 0.13), "Robe_Main")
    cylinder("Underrobe", (0, 0, 0.77), 0.22, 0.27, 0.22, "Ivory", "Hips")
    cylinder("Belt", (0, 0, 0.87), 0.278, 0.283, 0.064, "Gold", "Hips")
    ellipsoid("Jade_Knot", (0, -0.286, 0.87), (0.042, 0.021, 0.045), "Jade", "Hips")
    ribbon("Cross_Collar_Under", [(0.16,-0.15,1.25), (0.04,-0.245,1.10), (-0.14,-0.267,0.92)], 0.065, "Ivory")
    ribbon("Cross_Collar_Over", [(-0.16,-0.16,1.25), (-0.04,-0.26,1.10), (0.15,-0.273,0.91)], 0.065, "Ivory")
    for side, sign in (("L", 1), ("R", -1)):
        thigh, shin, foot = "Thigh."+side, "Shin."+side, "Foot."+side
        ellipsoid("Trousers_"+side, (0.12*sign, 0, 0.56), (0.085,0.095,0.22), "Robe_Shade", thigh)
        ellipsoid("Boot_Shaft_"+side, (0.12*sign, 0, 0.28), (0.086,0.09,0.18), "Boots", shin)
        ellipsoid("Boot_"+side, (0.12*sign, -0.045, 0.095), (0.10,0.16,0.095), "Boots", foot)
        # Open sides let the running legs move without a rigid full skirt.
        ellipsoid("Robe_Panel_"+side, (0.18*sign, 0.02, 0.64), (0.115,0.165,0.23), "Robe_Main", thigh)
        arm = "UpperArm."+side
        ellipsoid("Sleeve_"+side, (0.30*sign,0,1.08), (0.14,0.135,0.19), "Robe_Main", arm)
        forearm = "Forearm."+side
        ellipsoid("Cuff_"+side, (0.355*sign,-0.012,0.91), (0.125,0.125,0.055), "Ivory", forearm)
        ellipsoid("Hand_"+side, (0.37*sign,-0.02,0.82), (0.071,0.069,0.09), "Skin", forearm)
        ellipsoid("Ear_"+side, (0.275*sign,0.003,1.54), (0.065,0.042,0.09), "Skin", "Head")
    ellipsoid("Face", (0,-0.02,1.55), (0.28,0.235,0.30), "Skin", "Head")
    ellipsoid("Hair_Back", (0,0.075,1.60), (0.295,0.215,0.285), "Hair", "Head")
    ellipsoid("Topknot", (0,0.07,1.88), (0.11,0.10,0.095), "Hair", "Head")
    cylinder("Topknot_Tie", (0,0.07,1.84), 0.10,0.10,0.028,"Gold","Head")
    for index in range(5):
        x=(index-2)*0.09
        ellipsoid("Fringe_"+str(index), (x,-0.17,1.75-abs(index-2)*0.022),
                  (0.073,0.085,0.135), "Hair", "Head", (0,(index-2)*0.12,0))
    for side, sign in (("L",1),("R",-1)):
        x=0.105*sign
        ellipsoid("Eye_Line_"+side,(x,-0.235,1.56),(0.069,0.018,0.09),"Ink","Head")
        ellipsoid("Eye_White_"+side,(x,-0.250,1.558),(0.06,0.014,0.078),"Eye_White","Head")
        ellipsoid("Iris_"+side,(x,-0.264,1.554),(0.032,0.01,0.058),"Eye_Iris","Head")
        ellipsoid("Pupil_"+side,(x,-0.273,1.554),(0.016,0.006,0.039),"Ink","Head")
        ellipsoid("Glint_"+side,(x-0.012,-0.28,1.578),(0.011,0.005,0.016),"Eye_White","Head")
        ellipsoid("Cheek_"+side,(sign*0.18,-0.215,1.47),(0.039,0.009,0.016),"Blush","Head")
        tube("Brow_"+side,[(x-sign*0.05,-0.232,1.685),(x,-0.246,1.699),(x+sign*0.05,-0.232,1.69)],0.009,"Hair")
    ellipsoid("Nose",(0,-0.253,1.477),(0.025,0.025,0.032),"Skin","Head")
    tube("Smile",[(-0.045,-0.241,1.41),(0,-0.255,1.399),(0.045,-0.241,1.41)],0.006,"Blush")
    # One shared rig and three explicitly named in-place animation clips.
    for name, length in (("Idle",60),("Run",24),("Bow",72)):
        rig.animation_data_create()
        rig.animation_data.action=None
        for step in range(9):
            frame=1+round(length*step/8)
            phase=step/8*math.tau
            for bone in rig.pose.bones:
                bone.rotation_mode="XYZ"
                bone.rotation_euler=(0,0,0)
                bone.location=(0,0,0)
            if name=="Idle":
                rig.pose.bones["Spine"].rotation_euler.x=math.sin(phase)*0.018
                rig.pose.bones["Head"].rotation_euler.z=math.sin(phase)*0.016
            elif name=="Run":
                rig.pose.bones["Spine"].rotation_euler.x=0.08
                for side,sign in (("L",1),("R",-1)):
                    wave=math.sin(phase)*sign
                    rig.pose.bones["Thigh."+side].rotation_euler.x=wave*0.62
                    rig.pose.bones["Shin."+side].rotation_euler.x=-max(0,-wave)*0.6
                    rig.pose.bones["UpperArm."+side].rotation_euler.x=-wave*0.45
                    rig.pose.bones["Forearm."+side].rotation_euler.x=-0.35
            else:
                ease=math.sin(math.pi*step/8)**2
                rig.pose.bones["Spine"].rotation_euler.x=ease*0.30
                rig.pose.bones["Head"].rotation_euler.x=ease*0.18
                for side,sign in (("L",1),("R",-1)):
                    rig.pose.bones["UpperArm."+side].rotation_euler.x=-ease*0.48
                    rig.pose.bones["UpperArm."+side].rotation_euler.z=-sign*ease*0.55
                    rig.pose.bones["Forearm."+side].rotation_euler.x=-ease*0.65
            for bone in rig.pose.bones:
                bone.keyframe_insert(data_path="rotation_euler",frame=frame,group=bone.name)
        action=rig.animation_data.action
        action.name=name
        action.use_fake_user=True
        track=rig.animation_data.nla_tracks.new()
        track.name=name
        track.strips.new(name,1,action)
        track.mute=True
    rig.animation_data.action=None
    for bone in rig.pose.bones:
        bone.rotation_euler=(0,0,0)
    scene.frame_set(1)
    bpy.context.view_layer.update()
    meshes=[obj for obj in scene.objects if obj.type=="MESH"]
    points=[obj.matrix_world @ vertex.co for obj in meshes for vertex in obj.data.vertices]
    height=max(p.z for p in points)-min(p.z for p in points)
    rig.scale=(1.8/height,)*3
    rig["asset_id"]="zongheng-original-scholar-pilot-v1"
    rig["prototype"]="Fixed outfit and hair; cloth color preview only"
    output=Path(output).resolve()
    output.parent.mkdir(parents=True,exist_ok=True)
    if blend:
        path=Path(blend).resolve();path.parent.mkdir(parents=True,exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(path))
    bpy.ops.export_scene.gltf(filepath=str(output),export_format="GLB",export_yup=True,
        export_animations=True,export_animation_mode="ACTIONS",export_force_sampling=True,
        export_skins=True,export_apply=False,export_extras=True,
        export_cameras=False,export_lights=False,export_draco_mesh_compression_enable=False)
    triangles=0
    for obj in meshes:
        obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
    info={"blender":bpy.app.version_string,"mesh_objects":len(meshes),"triangles":triangles,
          "bones":len(rig.data.bones),"clips":[a.name for a in bpy.data.actions],
          "target_height_m":1.8,"bytes":output.stat().st_size,"original_procedural_asset":True}
    if report:
        path=Path(report);path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps(info,indent=2)+"\n")
    print(json.dumps(info,indent=2))


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",required=True)
    parser.add_argument("--blend")
    parser.add_argument("--report")
    args=parser.parse_args(sys.argv[sys.argv.index("--")+1:])
    build(args.output,args.blend,args.report)
