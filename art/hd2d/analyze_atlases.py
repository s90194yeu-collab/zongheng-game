"""Read AI alpha components to calibrate atlas regions; never edits generated pixels."""
from pathlib import Path
import cv2,json
root=Path(__file__).resolve().parents[2];out=root/'godot/village/assets/hd2d'
report={}
for name in ['male','female','enemies']:
 image=cv2.imread(str(out/(name+'.png')),cv2.IMREAD_UNCHANGED)
 assert image is not None and image.shape[2]==4
 count,labels,stats,centres=cv2.connectedComponentsWithStats((image[:,:,3]>128).astype('uint8'))
 parts=[(s,c) for s,c in zip(stats[1:],centres[1:]) if s[4]>2000]
 assert len(parts)==16,(name,len(parts))
 parts.sort(key=lambda v:v[1][1]);regions=[]
 for row in range(4):
  for stat,c in sorted(parts[row*4:row*4+4],key=lambda v:v[1][0]):
   x,y,w,h=[int(v) for v in stat[:4]];regions.append([max(0,x-1),max(0,y-1),min(image.shape[1],x+w+1)-max(0,x-1),min(image.shape[0],y+h+1)-max(0,y-1)])
 (out/(name+'.json')).write_text(json.dumps({'regions':regions,'width':image.shape[1],'height':image.shape[0]},indent=2)+'\n')
 report[name]={'regions':len(regions),'actualTransparency':True}
(root/'art/hd2d/atlas-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(report)
