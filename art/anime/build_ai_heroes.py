"""Canonical A-pose skinning + geodesic weights + FK aim-retargeting & compression for AI hero GLBs.
Inspired by the 複習造島 GLB pipeline (no local Blender required).
"""
import heapq
import json
import os
import struct
import cv2
import numpy as np

NAME_ALIAS = {"Spine1": "Spine01"}


def norm_name(name):
    return NAME_ALIAS.get(name, name)


def norm_v(v):
    n = float(np.linalg.norm(v))
    return v / n if n > 1e-8 else np.array([0.0, 1.0, 0.0], dtype=np.float64)


def q_to_m(q):
    x, y, z, w = [float(v) for v in q]
    n = np.sqrt(x * x + y * y + z * z + w * w) or 1.0
    x, y, z, w = x / n, y / n, z / n, w / n
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 0.0],
        [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 0.0],
        [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y), 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ], dtype=np.float64)


def r_to_q(R):
    tr = R[0, 0] + R[1, 1] + R[2, 2]
    if tr > 0:
        s = np.sqrt(tr + 1.0) * 2.0
        w = 0.25 * s
        x = (R[2, 1] - R[1, 2]) / s
        y = (R[0, 2] - R[2, 0]) / s
        z = (R[1, 0] - R[0, 1]) / s
    elif R[0, 0] > R[1, 1] and R[0, 0] > R[2, 2]:
        s = np.sqrt(1.0 + R[0, 0] - R[1, 1] - R[2, 2]) * 2.0
        w = (R[2, 1] - R[1, 2]) / s
        x = 0.25 * s
        y = (R[0, 1] + R[1, 0]) / s
        z = (R[0, 2] + R[2, 0]) / s
    elif R[1, 1] > R[2, 2]:
        s = np.sqrt(1.0 + R[1, 1] - R[0, 0] - R[2, 2]) * 2.0
        w = (R[0, 2] - R[2, 0]) / s
        x = (R[0, 1] + R[1, 0]) / s
        y = 0.25 * s
        z = (R[1, 2] + R[2, 1]) / s
    else:
        s = np.sqrt(1.0 + R[2, 2] - R[0, 0] - R[1, 1]) * 2.0
        w = (R[1, 0] - R[0, 1]) / s
        x = (R[0, 2] + R[2, 0]) / s
        y = (R[1, 2] + R[2, 1]) / s
        z = 0.25 * s
    q = np.array([x, y, z, w], dtype=np.float64)
    return q / (np.linalg.norm(q) or 1.0)


def q_slerp(qa, qb, alpha):
    dot = float(np.dot(qa, qb))
    if dot < 0:
        qb = -qb
        dot = -dot
    if dot > 0.9995:
        res = (1.0 - alpha) * qa + alpha * qb
        return res / (np.linalg.norm(res) or 1.0)
    theta = np.arccos(np.clip(dot, -1.0, 1.0))
    res = (np.sin((1.0 - alpha) * theta) * qa + np.sin(alpha * theta) * qb) / np.sin(theta)
    return res / (np.linalg.norm(res) or 1.0)


def r_from_to(v_from, v_to):
    a = norm_v(v_from)
    b = norm_v(v_to)
    dot = float(np.clip(np.dot(a, b), -1.0, 1.0))
    if dot > 0.999999:
        return np.eye(3, dtype=np.float64)
    if dot < -0.999999:
        axis = np.cross(a, np.array([1.0, 0.0, 0.0]) if abs(a[0]) < 0.9 else np.array([0.0, 0.0, 1.0]))
        axis = norm_v(axis)
        K = np.array([[0, -axis[2], axis[1]], [axis[2], 0, -axis[0]], [-axis[1], axis[0], 0]])
        return np.eye(3) + 2.0 * (K @ K)
    v = np.cross(a, b)
    K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]], dtype=np.float64)
    return np.eye(3, dtype=np.float64) + K + (K @ K) * (1.0 / (1.0 + dot))


def trs_to_m(t, q, s):
    M = q_to_m(q)
    M[:3, 0] *= s[0]
    M[:3, 1] *= s[1]
    M[:3, 2] *= s[2]
    M[:3, 3] = t
    return M


def node_local_m(node):
    if "matrix" in node:
        return np.array(node["matrix"], dtype=np.float64).reshape(4, 4).T
    return trs_to_m(
        np.array(node.get("translation", [0.0, 0.0, 0.0]), dtype=np.float64),
        np.array(node.get("rotation", [0.0, 0.0, 0.0, 1.0]), dtype=np.float64),
        np.array(node.get("scale", [1.0, 1.0, 1.0]), dtype=np.float64),
    )


def parse_glb(path):
    with open(path, "rb") as f:
        data = f.read()
    jlen = struct.unpack("<I", data[12:16])[0]
    j = json.loads(data[20 : 20 + jlen])
    bin_off = 20 + jlen + 8
    bin_len = struct.unpack("<I", data[20 + jlen : 24 + jlen])[0]
    return j, data[bin_off : bin_off + bin_len]


def read_accessor(j, bin_data, idx):
    acc = j["accessors"][idx]
    bv = j["bufferViews"][acc["bufferView"]]
    start = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    count = acc["count"]
    comp = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[acc["componentType"]]
    num_c = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}[acc["type"]]
    stride = bv.get("byteStride")
    if stride:
        elem = np.dtype(comp).itemsize * num_c
        out = np.empty((count, num_c), dtype=comp)
        for i in range(count):
            out[i] = np.frombuffer(bin_data[start + i * stride : start + i * stride + elem], dtype=comp)
        return out
    arr = np.frombuffer(bin_data[start : start + count * num_c * np.dtype(comp).itemsize], dtype=comp)
    return arr if num_c == 1 else arr.reshape(count, num_c)


def sample_track(times, vals, t, is_quat=False):
    if len(times) == 1 or t <= times[0]:
        return vals[0].copy()
    if t >= times[-1]:
        return vals[-1].copy()
    i = max(0, min(int(np.searchsorted(times, t, side="right")) - 1, len(times) - 2))
    dt = float(times[i + 1] - times[i])
    alpha = (t - float(times[i])) / dt if dt > 1e-8 else 0.0
    if is_quat:
        return q_slerp(vals[i], vals[i + 1], alpha)
    return (1.0 - alpha) * vals[i] + alpha * vals[i + 1]


def build_canonical_skeleton(pts):
    """Build symmetric +Z-facing humanoid skeleton fitted to A-pose mesh vertices."""
    H = float(pts[:, 1].max())
    fL = pts[(pts[:, 1] < 0.08 * H) & (pts[:, 0] > 0.02)]
    fR = pts[(pts[:, 1] < 0.08 * H) & (pts[:, 0] < -0.02)]
    fx = 0.5 * (abs(float(np.median(fL[:, 0]))) + abs(float(np.median(fR[:, 0])))) if len(fL) and len(fR) else 0.15

    def arm_pt(xmin, xmax, sign, def_x, def_y):
        sel = pts[(pts[:, 0] * sign > xmin) & (pts[:, 0] * sign < xmax) & (pts[:, 1] > 0.45 * H)]
        if len(sel) >= 6:
            return np.array([float(np.median(sel[:, 0])), float(np.median(sel[:, 1])), float(np.median(sel[:, 2]))])
        return np.array([sign * def_x, def_y * H, 0.0])

    el_l, el_r = arm_pt(0.21, 0.27, +1, 0.24, 0.62), arm_pt(0.21, 0.27, -1, 0.24, 0.62)
    wr_l, wr_r = arm_pt(0.33, 0.40, +1, 0.36, 0.52), arm_pt(0.33, 0.40, -1, 0.36, 0.52)

    ankle_y = 0.065 * H
    knee_y = 0.29 * H
    hip_y = 0.515 * H
    sh_y = 0.76 * H

    pos = {
        "Hips": np.array([0.0, 0.54 * H, 0.0]),
        "Spine02": np.array([0.0, 0.60 * H, 0.0]),
        "Spine01": np.array([0.0, 0.66 * H, 0.0]),
        "Spine": np.array([0.0, 0.72 * H, 0.0]),
        "neck": np.array([0.0, 0.78 * H, 0.0]),
        "Head": np.array([0.0, 0.85 * H, 0.0]),
        "head_end": np.array([0.0, 0.97 * H, 0.0]),
        "headfront": np.array([0.0, 0.85 * H, 0.16]),
        "LeftShoulder": np.array([0.055, sh_y, 0.0]),
        "LeftArm": np.array([0.125, sh_y - 0.015, 0.0]),
        "LeftForeArm": el_l,
        "LeftHand": wr_l,
        "RightShoulder": np.array([-0.055, sh_y, 0.0]),
        "RightArm": np.array([-0.125, sh_y - 0.015, 0.0]),
        "RightForeArm": el_r,
        "RightHand": wr_r,
        "LeftUpLeg": np.array([0.65 * fx, hip_y, 0.0]),
        "LeftLeg": np.array([0.92 * fx, knee_y, 0.01]),
        "LeftFoot": np.array([fx, ankle_y, 0.0]),
        "LeftToeBase": np.array([fx, 0.02 * H, 0.11]),
        "RightUpLeg": np.array([-0.65 * fx, hip_y, 0.0]),
        "RightLeg": np.array([-0.92 * fx, knee_y, 0.01]),
        "RightFoot": np.array([-fx, ankle_y, 0.0]),
        "RightToeBase": np.array([-fx, 0.02 * H, 0.11]),
    }

    parents = {
        "Spine02": "Hips", "Spine01": "Spine02", "Spine": "Spine01",
        "neck": "Spine", "Head": "neck", "head_end": "Head", "headfront": "Head",
        "LeftShoulder": "Spine", "LeftArm": "LeftShoulder", "LeftForeArm": "LeftArm", "LeftHand": "LeftForeArm",
        "RightShoulder": "Spine", "RightArm": "RightShoulder", "RightForeArm": "RightArm", "RightHand": "RightForeArm",
        "LeftUpLeg": "Hips", "LeftLeg": "LeftUpLeg", "LeftFoot": "LeftLeg", "LeftToeBase": "LeftFoot",
        "RightUpLeg": "Hips", "RightLeg": "RightUpLeg", "RightFoot": "RightLeg", "RightToeBase": "RightFoot",
    }
    joint_order = [
        "Hips", "Spine02", "Spine01", "Spine", "neck", "Head", "head_end", "headfront",
        "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
        "RightShoulder", "RightArm", "RightForeArm", "RightHand",
        "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase",
        "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase",
    ]
    return H, pos, parents, joint_order


def compute_geodesic_skin_weights(pts, tris, joint_pos, joint_order, H):
    """Surface geodesic bone-capsule weights with strict anatomical masks (zero boot/cape webbing)."""
    keys = np.round(pts * 2000.0).astype(np.int64)
    _, inv, counts = np.unique(keys, axis=0, return_inverse=True, return_counts=True)
    n_u = len(counts)
    u_pts = np.zeros((n_u, 3), dtype=np.float64)
    np.add.at(u_pts, inv, pts)
    u_pts /= counts[:, None]

    adj = [{} for _ in range(n_u)]
    for a, b, c in tris:
        ia, ib, ic = int(inv[a]), int(inv[b]), int(inv[c])
        for u, v in ((ia, ib), (ib, ic), (ic, ia)):
            if u != v and v not in adj[u]:
                adj[u][v] = adj[v][u] = float(np.linalg.norm(u_pts[u] - u_pts[v]))

    def seg_samples(p0, p1, k=5):
        return [p0 + (i / (k - 1)) * (p1 - p0) for i in range(k)]

    bone_segs = [
        ("Hips", joint_pos["Hips"] - np.array([0, 0.04 * H, 0]), joint_pos["Spine02"]),
        ("Spine02", joint_pos["Spine02"], joint_pos["Spine01"]),
        ("Spine01", joint_pos["Spine01"], joint_pos["Spine"]),
        ("Spine", joint_pos["Spine"], joint_pos["neck"]),
        ("neck", joint_pos["neck"], joint_pos["Head"]),
        ("Head", joint_pos["Head"], joint_pos["head_end"]),
        ("LeftShoulder", joint_pos["LeftShoulder"], joint_pos["LeftArm"]),
        ("LeftArm", joint_pos["LeftArm"], joint_pos["LeftForeArm"]),
        ("LeftForeArm", joint_pos["LeftForeArm"], joint_pos["LeftHand"]),
        ("LeftHand", joint_pos["LeftHand"], joint_pos["LeftHand"] + np.array([0.07, -0.02, 0.0])),
        ("RightShoulder", joint_pos["RightShoulder"], joint_pos["RightArm"]),
        ("RightArm", joint_pos["RightArm"], joint_pos["RightForeArm"]),
        ("RightForeArm", joint_pos["RightForeArm"], joint_pos["RightHand"]),
        ("RightHand", joint_pos["RightHand"], joint_pos["RightHand"] + np.array([-0.07, -0.02, 0.0])),
        ("LeftUpLeg", joint_pos["LeftUpLeg"], joint_pos["LeftLeg"]),
        ("LeftLeg", joint_pos["LeftLeg"], joint_pos["LeftFoot"]),
        ("LeftFoot", joint_pos["LeftFoot"], joint_pos["LeftToeBase"] - np.array([0.0, 0.0, 0.05])),
        ("LeftToeBase", joint_pos["LeftToeBase"] - np.array([0.0, 0.0, 0.02]), joint_pos["LeftToeBase"] + np.array([0.0, 0.0, 0.03])),
        ("RightUpLeg", joint_pos["RightUpLeg"], joint_pos["RightLeg"]),
        ("RightLeg", joint_pos["RightLeg"], joint_pos["RightFoot"]),
        ("RightFoot", joint_pos["RightFoot"], joint_pos["RightToeBase"] - np.array([0.0, 0.0, 0.05])),
        ("RightToeBase", joint_pos["RightToeBase"] - np.array([0.0, 0.0, 0.02]), joint_pos["RightToeBase"] + np.array([0.0, 0.0, 0.03])),
    ]

    def pt_seg_dist(P, a, b):
        ab = b - a
        ab2 = float(np.dot(ab, ab)) or 1e-8
        proj = np.sum((P - a[None, :]) * ab[None, :], axis=1) / ab2
        t = np.clip(proj, 0.0, 1.0)[:, None]
        return np.linalg.norm(P - (a[None, :] + t * ab[None, :]), axis=1)

    j_idx = {nm: i for i, nm in enumerate(joint_order)}
    n_bones = len(bone_segs)
    dists = np.full((n_u, n_bones), 1e9, dtype=np.float64)

    for bi, (bname, a, b) in enumerate(bone_segs):
        eu_d = pt_seg_dist(u_pts, a, b)
        # Seed surface vertices closest to sample points along bone segment
        dist = np.full(n_u, 1e9, dtype=np.float64)
        pq = []
        for sp in seg_samples(a, b, 5):
            # Restrict Left/Right leg/foot seeds strictly to matching side
            if bname.startswith("Left") and ("Leg" in bname or "Foot" in bname or "Toe" in bname):
                cand = np.where(u_pts[:, 0] > 0.01)[0]
            elif bname.startswith("Right") and ("Leg" in bname or "Foot" in bname or "Toe" in bname):
                cand = np.where(u_pts[:, 0] < -0.01)[0]
            elif bname.startswith("Left") and ("Arm" in bname or "Hand" in bname):
                cand = np.where((u_pts[:, 0] > 0.09) & (u_pts[:, 1] > 0.42 * H))[0]
            elif bname.startswith("Right") and ("Arm" in bname or "Hand" in bname):
                cand = np.where((u_pts[:, 0] < -0.09) & (u_pts[:, 1] > 0.42 * H))[0]
            else:
                cand = np.arange(n_u)
            if not len(cand):
                cand = np.arange(n_u)
            best = int(cand[np.argmin(np.linalg.norm(u_pts[cand] - sp, axis=1))])
            d0 = float(np.linalg.norm(u_pts[best] - sp))
            if d0 < dist[best]:
                dist[best] = d0
                heapq.heappush(pq, (d0, best))
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u] or d > 0.85:
                continue
            for v, w in adj[u].items():
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    heapq.heappush(pq, (nd, v))
        # Blend pure Euclidean distance for tiny disconnected buttons/tassels (>1e8)
        unreach = dist > 1e6
        dist[unreach] = eu_d[unreach] + 0.12
        dists[:, bi] = dist + 0.15 * eu_d

    # Anatomical exclusion masks: impossible to leak across boots, arms, or skirt->wrist
    ux, uy = u_pts[:, 0], u_pts[:, 1]
    left_lower = np.array([nm.startswith("Left") and ("Leg" in nm or "Foot" in nm or "Toe" in nm) for nm, _, _ in bone_segs])
    right_lower = np.array([nm.startswith("Right") and ("Leg" in nm or "Foot" in nm or "Toe" in nm) for nm, _, _ in bone_segs])
    left_arm_outer = np.array([nm in ("LeftArm", "LeftForeArm", "LeftHand") for nm, _, _ in bone_segs])
    right_arm_outer = np.array([nm in ("RightArm", "RightForeArm", "RightHand") for nm, _, _ in bone_segs])
    foot_toe = np.array([nm in ("LeftFoot", "LeftToeBase", "RightFoot", "RightToeBase") for nm, _, _ in bone_segs])

    # Boot split (hard exclusion only below ankle/shin; skirts above blend smoothly!)
    for bi in range(n_bones):
        if right_lower[bi]:
            dists[(uy < 0.15 * H) & (ux >= 0.0), bi] = 1e9
        if left_lower[bi]:
            dists[(uy < 0.15 * H) & (ux < 0.0), bi] = 1e9
        # Prevent outer forearms/hands from grabbing inner torso/hips below chest
        if left_arm_outer[bi] or right_arm_outer[bi]:
            dists[(uy < 0.54 * H) & (np.abs(ux) < 0.16), bi] = 1e9
            dists[uy < 0.36 * H, bi] = 1e9
        if left_arm_outer[bi]:
            dists[ux < 0.02, bi] = 1e9
        if right_arm_outer[bi]:
            dists[ux > -0.02, bi] = 1e9
        if bone_segs[bi][0] == "Head":
            dists[uy < 0.74 * H, bi] = 1e9
        if foot_toe[bi]:
            dists[uy > 0.25 * H, bi] = 1e9

    # Head strict rigid region above chin/collar
    head_bi = [i for i, (nm, _, _) in enumerate(bone_segs) if nm == "Head"][0]
    head_zone = uy > 0.81 * H
    for bi in range(n_bones):
        if bi != head_bi:
            dists[head_zone, bi] += 0.25

    # Convert distances to smooth normalized top-4 weights per vertex
    dmin = dists.min(axis=1, keepdims=True)
    # Wider falloff on upper body & skirt for crisp crease-free bends; tighter on boots
    sigma = np.where((uy[:, None] < 0.16 * H), 0.035, np.where((uy[:, None] > 0.45 * H), 0.085, 0.070))
    raw_w = np.exp(-np.square((dists - dmin) / sigma))
    cutoff = np.where((uy[:, None] < 0.16 * H), 0.12, 0.22)
    raw_w[dists > dmin + cutoff] = 0.0
    # Safety fallback when all weights under threshold
    zero_rows = raw_w.sum(axis=1) < 1e-8
    if np.any(zero_rows):
        best_col = np.argmin(dists[zero_rows], axis=1)
        raw_w[zero_rows, best_col] = 1.0

    # Top-4 bone selection per unique vertex
    top4 = np.argsort(-raw_w, axis=1)[:, :4]
    top4_w = np.take_along_axis(raw_w, top4, axis=1)
    top4_w /= np.maximum(top4_w.sum(axis=1, keepdims=True), 1e-8)

    u_joints = np.zeros((n_u, 4), dtype=np.uint16)
    for k in range(4):
        for u in range(n_u):
            u_joints[u, k] = j_idx[bone_segs[int(top4[u, k])][0]]

    return u_joints[inv], top4_w[inv].astype(np.float32)


def load_source_world_motion(src_path, max_fps=30.0):
    """Extract frame timestamps and yaw-aligned (+Z forward, +Y up, +X left) world joint positions."""
    j, b = parse_glb(src_path)
    nodes = j["nodes"]
    parents = {}
    for pid, n in enumerate(nodes):
        for cid in n.get("children", []):
            parents[cid] = pid
    by_name = {norm_name(n.get("name", "")): idx for idx, n in enumerate(nodes)}
    skin = j["skins"][0]
    ibms = read_accessor(j, b, skin["inverseBindMatrices"]).reshape(-1, 4, 4)
    ibm_by_name = {norm_name(nodes[nid].get("name", "")): ibms[k].T.astype(np.float64) for k, nid in enumerate(skin["joints"])}

    def topo(nodes):
        vis, ord_ = set(), []
        def v(i):
            if i in vis: return
            if i in parents: v(parents[i])
            vis.add(i); ord_.append(i)
        for i in range(len(nodes)): v(i)
        return ord_

    order = topo(nodes)
    anim = j["animations"][0]
    tracks = {}
    t_min, t_max = 1e9, 0.0
    for ch in anim["channels"]:
        s = anim["samplers"][ch["sampler"]]
        ts = read_accessor(j, b, s["input"]).astype(np.float64)
        vs = read_accessor(j, b, s["output"]).astype(np.float64)
        tracks.setdefault(ch["target"]["node"], {})[ch["target"]["path"]] = (ts, vs)
        t_min = min(t_min, float(ts[0]))
        t_max = max(t_max, float(ts[-1]))

    n_frames = max(2, min(int(round(max(0.1, t_max - t_min) * max_fps)) + 1, 90))
    times = np.linspace(t_min, t_max, n_frames, dtype=np.float32)
    base_trs = {i: (np.array(n.get("translation", [0,0,0]), float), np.array(n.get("rotation", [0,0,0,1]), float), np.array(n.get("scale", [1,1,1]), float)) for i, n in enumerate(nodes)}
    if any("matrix" in n for n in nodes):
        from numpy.linalg import norm as _n
        for i, n in enumerate(nodes):
            if "matrix" in n:
                M = node_local_m(n)
                base_trs[i] = (M[:3, 3], r_to_q(M[:3, :3] / _n(M[:3, :3], axis=0)), _n(M[:3, :3], axis=0))

    fwd_vecs, scales = [], []
    raw_frames = []
    for t in times:
        tf = float(t)
        w = [None] * len(nodes)
        for nid in order:
            bt, bq, bs = base_trs[nid]
            tr = tracks.get(nid, {})
            lt = sample_track(*tr["translation"], tf, False) if "translation" in tr else bt
            lq = sample_track(*tr["rotation"], tf, True) if "rotation" in tr else bq
            ls = sample_track(*tr["scale"], tf, False) if "scale" in tr else bs
            lm = trs_to_m(lt, lq, ls)
            w[nid] = (w[parents[nid]] @ lm) if nid in parents else lm
        pos_frame = {nm: w[nid][:3, 3].copy() for nm, nid in by_name.items()}
        raw_frames.append(pos_frame)
        # Body forward from hips line (RightUpLeg -> LeftUpLeg cross +Y = +Z)
        lr = pos_frame["LeftUpLeg"] - pos_frame["RightUpLeg"]
        fwd = norm_v(np.cross(lr, np.array([0.0, 1.0, 0.0])))
        fwd_vecs.append(fwd)
        if "Hips" in ibm_by_name:
            scales.append(float(np.linalg.norm((w[by_name["Hips"]] @ ibm_by_name["Hips"])[:3, 1])))

    mean_scale = float(np.mean(scales)) if scales else 1.0
    mean_fwd = np.mean(fwd_vecs, axis=0)
    yaw = float(np.arctan2(mean_fwd[0], mean_fwd[2]))
    cy, sy = np.cos(-yaw), np.sin(-yaw)
    R_yaw = np.array([[cy, 0.0, sy], [0.0, 1.0, 0.0], [-sy, 0.0, cy]], dtype=np.float64)

    frames = []
    for pf in raw_frames:
        frames.append({nm: (R_yaw @ p) / mean_scale for nm, p in pf.items()})
    return (times - times[0]).astype(np.float32), frames


def solve_clip_from_motion(times, frames, clip_name, bind_pos, parents, joint_order, scale_ratio):
    """Reconstruct clean local (T, R, S) on our canonical A-pose skeleton using bone-direction FK."""
    out_t = {nm: np.zeros((len(times), 3), dtype=np.float32) for nm in joint_order}
    out_r = {nm: np.zeros((len(times), 4), dtype=np.float32) for nm in joint_order}
    out_s = {nm: np.ones((len(times), 3), dtype=np.float32) for nm in joint_order}

    # Mean hips horizontal center for pedastal pinning
    hips_arr = np.array([f["Hips"] for f in frames]) * scale_ratio
    mean_hx, mean_hz = float(np.mean(hips_arr[:, 0])), float(np.mean(hips_arr[:, 2]))

    # Natural child mapping for spine/limbs
    aim_child = {
        "Spine02": "Spine01", "Spine01": "Spine", "Spine": "neck", "neck": "Head", "Head": "head_end",
        "LeftShoulder": "LeftArm", "LeftArm": "LeftForeArm", "LeftForeArm": "LeftHand",
        "RightShoulder": "RightArm", "RightArm": "RightForeArm", "RightForeArm": "RightHand",
        "LeftUpLeg": "LeftLeg", "LeftLeg": "LeftFoot", "LeftFoot": "LeftToeBase",
        "RightUpLeg": "RightLeg", "RightLeg": "RightFoot", "RightFoot": "RightToeBase",
    }

    for fi, fp in enumerate(frames):
        R_w = {}
        # 1. Hips orientation from pelvic left (LeftUpLeg - RightUpLeg) and torso up (Spine02 - Hips)
        h_left = norm_v(fp["LeftUpLeg"] - fp["RightUpLeg"])
        h_up = norm_v(fp["Spine02"] - fp["Hips"])
        h_fwd = norm_v(np.cross(h_left, h_up))
        h_left = norm_v(np.cross(h_up, h_fwd))
        R_hips = np.column_stack([h_left, h_up, h_fwd])
        if clip_name == "Idle":
            q_hips = q_slerp(r_to_q(R_hips), np.array([0.0, 0.0, 0.0, 1.0]), 0.55)
            R_hips = q_to_m(q_hips)[:3, :3]
        R_w["Hips"] = R_hips

        hx = (hips_arr[fi, 0] - mean_hx) * 0.25
        hz = (hips_arr[fi, 2] - mean_hz) * 0.25
        hy = hips_arr[fi, 1]
        if clip_name == "Idle":
            hy = 0.65 * bind_pos["Hips"][1] + 0.35 * hy
        elif clip_name == "Bow":
            hy = 0.4 * bind_pos["Hips"][1] + 0.6 * hy
        out_t["Hips"][fi] = np.array([hx, hy, hz], dtype=np.float32)
        out_r["Hips"][fi] = r_to_q(R_hips).astype(np.float32)

        # Shoulder vector for torso twist
        sh_left = norm_v(fp["LeftArm"] - fp["RightArm"])

        # Solve remaining joints in order
        for jname in joint_order:
            if jname == "Hips":
                continue
            pname = parents[jname]
            Rp = R_w[pname]
            b_local_t = bind_pos[jname] - bind_pos[pname]
            out_t[jname][fi] = b_local_t.astype(np.float32)

            if jname in ("head_end", "headfront", "LeftHand", "RightHand", "LeftToeBase", "RightToeBase"):
                R_w[jname] = Rp
                out_r[jname][fi] = np.array([0.0, 0.0, 0.0, 1.0], dtype=np.float32)
                continue

            cname = aim_child[jname]
            d_bind = norm_v(bind_pos[cname] - bind_pos[jname])
            d_anim = norm_v(fp[cname] - fp[jname]) if cname in fp else (Rp @ d_bind)

            if jname in ("Spine02", "Spine01", "Spine", "neck"):
                up = norm_v(0.55 * d_anim + 0.45 * (Rp @ d_bind))
                tw = sh_left if jname in ("Spine01", "Spine", "neck") else norm_v(0.5 * sh_left + 0.5 * h_left)
                fwd = norm_v(np.cross(tw, up))
                lft = norm_v(np.cross(up, fwd))
                Rw = np.column_stack([lft, up, fwd])
                if clip_name == "Idle":
                    Rw = q_to_m(q_slerp(r_to_q(Rw), r_to_q(Rp), 0.35))[:3, :3]
            elif jname == "Head":
                up = norm_v(fp["head_end"] - fp["Head"]) if "head_end" in fp else norm_v(Rp[:, 1])
                fwd_h = norm_v(fp["headfront"] - fp["Head"]) if "headfront" in fp else norm_v(Rp[:, 2])
                if clip_name in ("Idle", "Bow", "Walk"):
                    up = norm_v(0.40 * up + 0.60 * np.array([0.0, 1.0, 0.0]))
                    fwd_h = norm_v(0.40 * fwd_h + 0.60 * np.array([0.0, -0.05, 1.0]))
                lft = norm_v(np.cross(up, fwd_h))
                fwd = norm_v(np.cross(lft, up))
                Rw = np.column_stack([lft, up, fwd])
            elif jname in ("LeftShoulder", "RightShoulder"):
                d_s = norm_v(0.25 * d_anim + 0.75 * (Rp @ d_bind))
                Rw = r_from_to(Rp @ d_bind, d_s) @ Rp
            elif jname in ("LeftUpLeg", "LeftLeg", "RightUpLeg", "RightLeg"):
                # Calm poised standing stance in Idle; smooth natural stride in Walk/Run
                if clip_name == "Idle":
                    stance_target = norm_v(np.array([0.04 if "Left" in jname else -0.04, -1.0, 0.04 if "LeftUp" in jname else -0.02]))
                    d_anim = norm_v(0.22 * d_anim + 0.78 * stance_target)
                elif clip_name in ("Walk", "Run"):
                    vert = np.array([0.04 if "Left" in jname else -0.04, -1.0, 0.0])
                    d_anim = norm_v(0.75 * d_anim + 0.25 * norm_v(vert))
                Rw = r_from_to(Rp @ d_bind, d_anim) @ Rp
            elif jname in ("LeftFoot", "RightFoot"):
                if clip_name == "Idle":
                    Rw = np.eye(3, dtype=np.float64)
                else:
                    # Keep foot pointed cleanly along motion direction, mild heel/toe pitch only
                    fwd_f = norm_v(fp[cname] - fp[jname])
                    fwd_f = norm_v(np.array([fwd_f[0] * 0.3, np.clip(fwd_f[1], -0.45, 0.45), max(0.35, fwd_f[2])]))
                    up_f = norm_v(Rp[:, 1] - fwd_f * float(np.dot(Rp[:, 1], fwd_f)))
                    lft_f = norm_v(np.cross(up_f, fwd_f))
                    Rw = np.column_stack([lft_f, up_f, fwd_f])
            else:
                # Arms & forearms: gentle relaxed hero stance in Idle so sleeves & capes stay smooth
                if clip_name == "Idle":
                    sx = 1.0 if "Left" in jname else -1.0
                    rest_arm = norm_v(np.array([sx * 0.38, -0.90, 0.08 if "ForeArm" not in jname else 0.24]))
                    d_anim = norm_v(0.45 * d_anim + 0.55 * rest_arm)
                Rw = r_from_to(Rp @ d_bind, d_anim) @ Rp

            R_w[jname] = Rw
            R_loc = Rp.T @ Rw
            out_r[jname][fi] = r_to_q(R_loc).astype(np.float32)

    for nm in joint_order:
        quats = out_r[nm]
        for fi in range(1, len(quats)):
            if float(np.dot(quats[fi - 1], quats[fi])) < 0:
                quats[fi] = -quats[fi]

    return clip_name, times, joint_order, out_t, out_r, out_s


def build_combined_glb(mesh_src_path, motion_specs, out_desktop, out_mobile, body, outfit):
    j, bin_data = parse_glb(mesh_src_path)
    prim = j["meshes"][0]["primitives"][0]
    attrs = prim["attributes"]

    # Rotate static mesh -90 deg around Y (x' = -z, y' = y, z' = +x) so Bind Pose faces +Z cleanly
    def rot_v3(arr):
        out = np.empty_like(arr, dtype=np.float32)
        out[:, 0] = -arr[:, 2]
        out[:, 1] = arr[:, 1]
        out[:, 2] = arr[:, 0]
        return out

    pts = rot_v3(read_accessor(j, bin_data, attrs["POSITION"]).astype(np.float32))
    nrms = rot_v3(read_accessor(j, bin_data, attrs["NORMAL"]).astype(np.float32))
    uvs = read_accessor(j, bin_data, attrs["TEXCOORD_0"]).astype(np.float32)
    tris = read_accessor(j, bin_data, prim["indices"]).astype(np.uint32).reshape(-1, 3)

    # Fit canonical A-pose skeleton and clean geodesic skin weights
    H, bind_pos, parents, joint_order = build_canonical_skeleton(pts.astype(np.float64))
    jnts, wgts = compute_geodesic_skin_weights(pts.astype(np.float64), tris, bind_pos, joint_order, H)

    # Build clean glTF buffer from scratch (only geometry + weights + images + new animations)
    new_buf = bytearray()
    new_bvs = []
    new_accs = []

    def push_bv(raw_bytes, target=None):
        while len(new_buf) % 4:
            new_buf.append(0)
        off = len(new_buf)
        new_buf.extend(raw_bytes)
        idx = len(new_bvs)
        bv = {"buffer": 0, "byteOffset": off, "byteLength": len(raw_bytes)}
        if target:
            bv["target"] = target
        new_bvs.append(bv)
        return idx

    def push_acc(arr, typ, comp, target=None, bounds=False):
        bv = push_bv(arr.tobytes(), target)
        idx = len(new_accs)
        acc = {"bufferView": bv, "componentType": comp, "count": int(len(arr)), "type": typ}
        if bounds:
            acc["min"] = [float(x) for x in arr.min(axis=0)]
            acc["max"] = [float(x) for x in arr.max(axis=0)]
        new_accs.append(acc)
        return idx

    pos_acc = push_acc(pts, "VEC3", 5126, 34962, bounds=True)
    nrm_acc = push_acc(nrms, "VEC3", 5126, 34962)
    uv_acc = push_acc(uvs, "VEC2", 5126, 34962)
    jnt_acc = push_acc(jnts.astype(np.uint16), "VEC4", 5123, 34962)
    wgt_acc = push_acc(wgts.astype(np.float32), "VEC4", 5126, 34962)
    ind_flat = tris.reshape(-1).astype(np.uint32)
    ind_bv = push_bv(ind_flat.tobytes(), 34963)
    ind_acc = len(new_accs)
    new_accs.append({"bufferView": ind_bv, "componentType": 5125, "count": int(len(ind_flat)), "type": "SCALAR"})

    # Copy images into new buffer (pre-resized later per variant)
    img_raw_blobs = []
    for im in j.get("images", []):
        obv = j["bufferViews"][im["bufferView"]]
        img_raw_blobs.append(bytes(bin_data[obv.get("byteOffset", 0) : obv.get("byteOffset", 0) + obv["byteLength"]]))
        im["bufferView"] = push_bv(img_raw_blobs[-1])

    # Inverse bind matrices: IBM[j] = translation(-bind_pos[j]) in column-major glTF order
    ibm_arr = np.zeros((len(joint_order), 4, 4), dtype=np.float32)
    for k, nm in enumerate(joint_order):
        M = np.eye(4, dtype=np.float32)
        M[:3, 3] = -bind_pos[nm].astype(np.float32)
        ibm_arr[k] = M.T  # transpose to glTF column-major
    ibm_acc = push_acc(ibm_arr, "MAT4", 5126)

    # Nodes: [0..23] = joints, 24 = Armature root, 25 = Character mesh
    j_idx = {nm: i for i, nm in enumerate(joint_order)}
    children_map = {nm: [] for nm in joint_order}
    for nm, pnm in parents.items():
        children_map[pnm].append(j_idx[nm])

    new_nodes = []
    for nm in joint_order:
        t = (bind_pos[nm] - bind_pos[parents[nm]]) if nm in parents else bind_pos[nm]
        nd = {
            "name": nm,
            "translation": [float(v) for v in t],
            "rotation": [0.0, 0.0, 0.0, 1.0],
            "scale": [1.0, 1.0, 1.0],
        }
        if children_map[nm]:
            nd["children"] = children_map[nm]
        new_nodes.append(nd)

    armature_id = len(new_nodes)
    mesh_node_id = armature_id + 1
    new_nodes.append({"name": "Armature", "children": [0, mesh_node_id]})
    meta = {"assetId": "zongheng-hero-ai-v1", "body": body, "outfit": outfit}
    new_nodes.append({"name": f"Hero_{body}_{outfit}", "mesh": 0, "skin": 0, "extras": meta})

    prim["attributes"] = {
        "POSITION": pos_acc,
        "NORMAL": nrm_acc,
        "TEXCOORD_0": uv_acc,
        "JOINTS_0": jnt_acc,
        "WEIGHTS_0": wgt_acc,
    }
    prim["indices"] = ind_acc

    for mat in j.get("materials", []):
        pbr = mat.setdefault("pbrMetallicRoughness", {})
        pbr["metallicFactor"] = 0.0
        pbr["roughnessFactor"] = 0.88

    # Retarget animations from clean humanoid motion set
    scale_ratio = H / 1.65
    new_anims = []
    for cname, src_path in motion_specs:
        times, frames = load_source_world_motion(src_path)
        _, out_times, _, out_t, out_r, out_s = solve_clip_from_motion(
            times, frames, cname, bind_pos, parents, joint_order, scale_ratio
        )
        t_bv = push_bv(out_times.tobytes())
        t_acc = len(new_accs)
        new_accs.append({
            "bufferView": t_bv, "componentType": 5126, "count": int(len(out_times)), "type": "SCALAR",
            "min": [float(out_times[0])], "max": [float(out_times[-1])],
        })
        samplers, channels = [], []
        for nm in joint_order:
            nid = j_idx[nm]
            for path, arr, typ in (("translation", out_t[nm], "VEC3"), ("rotation", out_r[nm], "VEC4"), ("scale", out_s[nm], "VEC3")):
                acc = push_acc(arr.astype(np.float32), typ, 5126)
                samp_i = len(samplers)
                samplers.append({"input": t_acc, "interpolation": "LINEAR", "output": acc})
                channels.append({"sampler": samp_i, "target": {"node": nid, "path": path}})
        new_anims.append({"name": cname, "channels": channels, "samplers": samplers})

    out_j = {
        "asset": {"version": "2.0", "generator": "zongheng-build-ai-heroes"},
        "scene": 0,
        "scenes": [{"nodes": [armature_id], "extras": meta}],
        "nodes": new_nodes,
        "skins": [{"inverseBindMatrices": ibm_acc, "joints": list(range(len(joint_order))), "skeleton": armature_id}],
        "meshes": j["meshes"],
        "materials": j.get("materials", []),
        "textures": j.get("textures", []),
        "images": j.get("images", []),
        "samplers": j.get("samplers", []),
        "animations": new_anims,
        "accessors": new_accs,
        "bufferViews": new_bvs,
        "buffers": [{"byteLength": len(new_buf)}],
    }

    # Write desktop (1024px) & mobile (512px) compressed GLBs
    for dst_path, max_sz, quality in ((out_desktop, 1024, 86), (out_mobile, 512, 80)):
        jc = json.loads(json.dumps(out_j))
        images = jc.get("images", [])
        img_bv = {im["bufferView"]: i for i, im in enumerate(images) if "bufferView" in im}
        out_bin = bytearray()
        for bi, bv in enumerate(jc["bufferViews"]):
            off, ln = bv["byteOffset"], bv["byteLength"]
            raw = bytes(new_buf[off : off + ln])
            if bi in img_bv:
                im_meta = images[img_bv[bi]]
                arr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_UNCHANGED)
                if arr is not None:
                    h, w = arr.shape[:2]
                    if max(h, w) > max_sz:
                        sc = max_sz / float(max(h, w))
                        arr = cv2.resize(arr, (max(1, int(round(w * sc))), max(1, int(round(h * sc)))), interpolation=cv2.INTER_AREA)
                    if arr.ndim == 3 and arr.shape[2] == 4:
                        arr = cv2.cvtColor(arr, cv2.COLOR_BGRA2BGR)
                    ok, enc = cv2.imencode(".jpg", arr, [cv2.IMWRITE_JPEG_QUALITY, quality])
                    if ok:
                        raw = enc.tobytes()
                        im_meta["mimeType"] = "image/jpeg"
            while len(out_bin) % 4:
                out_bin.append(0)
            bv["byteOffset"] = len(out_bin)
            bv["byteLength"] = len(raw)
            out_bin.extend(raw)
        while len(out_bin) % 4:
            out_bin.append(0)
        jc["buffers"][0]["byteLength"] = len(out_bin)
        jb = json.dumps(jc, separators=(",", ":")).encode("utf-8")
        while len(jb) % 4:
            jb += b" "
        total = 12 + 8 + len(jb) + 8 + len(out_bin)
        with open(dst_path, "wb") as f:
            f.write(struct.pack("<4sII", b"glTF", 2, total))
            f.write(struct.pack("<I4s", len(jb), b"JSON"))
            f.write(jb)
            f.write(struct.pack("<I4s", len(out_bin), b"BIN\x00"))
            f.write(out_bin)
        print(f"{os.path.basename(dst_path)}: {total/1024:.1f} KB")


if __name__ == "__main__":
    scratch = "/Users/chiuemacminim4/.gemini/antigravity/brain/1db6be3f-30ad-4eb0-82d1-5dd7b72c2da2/scratch"
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/models"))
    motion_specs = [
        ("Idle", os.path.join(scratch, "rig_female_scholar_idle.glb")),
        ("Walk", os.path.join(scratch, "rig_female_scholar_walk.glb")),
        ("Run", os.path.join(scratch, "rig_female_scholar_run.glb")),
        ("Bow", os.path.join(scratch, "rig_female_scholar_wave.glb")),
    ]
    for body in ("male", "female"):
        for outfit in ("scholar", "traveler", "armor"):
            mesh_src = os.path.join(scratch, f"rig_{body}_{outfit}_walk.glb")
            out_d = os.path.join(models_dir, f"hero-ai-{body}-{outfit}.glb")
            out_m = os.path.join(models_dir, f"hero-ai-{body}-{outfit}-mobile.glb")
            build_combined_glb(mesh_src, motion_specs, out_d, out_m, body, outfit)
