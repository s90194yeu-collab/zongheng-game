"""Build a pinned, single-threaded Godot Web module using official tools.

Usage: python3 scripts/export-godot.py --godot /path/to/Godot --template /path/to/web_nothreads_release.zip
No Godot editor is required by students, or by the ordinary website CI build.
"""
import argparse,gzip,hashlib,json,os,shutil,subprocess,tempfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--godot',required=True);p.add_argument('--template',required=True);args=p.parse_args()
root=Path(__file__).resolve().parent.parent;project=root/'godot/village';preset=project/'export_presets.cfg';old=preset.read_text()
out=Path(tempfile.mkdtemp(prefix='zh-godot-export-'))
try:
 preset.write_text(old.replace('custom_template/release=""','custom_template/release='+json.dumps(str(Path(args.template).resolve()))))
 subprocess.run([args.godot,'--headless','--path',str(project),'--export-release','Web',str(out/'index.html')],check=True)
finally:preset.write_text(old)
(out/'index.wasm.gz').write_bytes(gzip.compress((out/'index.wasm').read_bytes(),compresslevel=9,mtime=0))
files=sorted(f for f in out.iterdir() if f.is_file() and f.suffix not in ['.png','.tmp'])
assert {'index.html','index.js','index.wasm','index.pck'}.issubset({f.name for f in files})
assert '"threads"' not in (out/'index.html').read_text() or 'threads:false' in (out/'index.html').read_text()
assert '$GODOT_' not in (out/'index.html').read_text()
revision=hashlib.sha256(b''.join(f.name.encode()+hashlib.sha256(f.read_bytes()).digest() for f in files)).hexdigest()[:16]
relative='godot/village-'+revision;dest=root/'public'/relative;dest.mkdir(parents=True,exist_ok=True)
records=[]
for f in files:
 shutil.copy2(f,dest/f.name);records.append({'path':relative+'/'+f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
version=subprocess.check_output([args.godot,'--headless','--version'],text=True).strip()
data={'version':1,'engine':version,'threadSupport':False,'entry':relative+'/index.html','files':records,'estimatedTransferBytes':sum(f['bytes'] for f in records if not f['path'].endswith('.wasm'))}
(root/'public/godot/release.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(root/'qa/godot-build.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('GODOT_WEB_BUILD '+json.dumps(data));shutil.rmtree(out)
