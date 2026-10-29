"""Fetch the two explicitly CC0 historical VRoid beta source assets.

This downloads data only. It does not install or execute third-party software.
The source binaries are kept locally; runtime GLBs are committed separately.
"""
from pathlib import Path
import hashlib
import json
import struct
import urllib.request

root=Path(__file__).resolve().parent/'source'
record=json.loads((root/'sources.json').read_text())
for model in record['models']:
    target=root/(model['gender']+'-base.glb')
    if target.exists():data=target.read_bytes()
    else:
        with urllib.request.urlopen(model['url'],timeout=120) as response:data=response.read()
    if hashlib.sha256(data).hexdigest()!=model['sha256']:raise ValueError('Source checksum differs: '+model['gender'])
    if data[:4]!=b'glTF':raise ValueError('Invalid model container')
    size=struct.unpack_from('<I',data,12)[0];gltf=json.loads(data[20:20+size])
    if gltf['extensions']['VRM']['meta'].get('licenseName')!='CC0':raise ValueError('Source does not identify itself as CC0')
    target.write_bytes(data)
    (root/(model['gender']+'-gltf.json')).write_text(json.dumps(gltf))
    print(model['gender']+' CC0 source verified')
