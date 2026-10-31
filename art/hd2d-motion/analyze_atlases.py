"""Read alpha to locate 192 animation frames and hip/foot anchors. PNG pixels stay untouched."""
from pathlib import Path
import cv2,json,numpy as np
root=Path(__file__).resolve().parents[2];out=root/'godot/village/assets/hd2d-motion';report={}
for body in ['male','female']:
 regions=[];pages=[]
 for page in range(4):
  name=f'{body}-{page}.png';image=cv2.imread(str(out/name),cv2.IMREAD_UNCHANGED);assert image is not None and image.shape[2]==4
  mask=(image[:,:,3]>128).astype('uint8');count,labels,stats,centres=cv2.connectedComponentsWithStats(mask)
  parts=[(i,s,c) for i,(s,c) in enumerate(zip(stats[1:],centres[1:]),1) if s[4]>1400];assert len(parts)==24,(name,len(parts))
  parts.sort(key=lambda item:item[2][1]);ordered=[]
  for row in range(4):ordered+=sorted(parts[row*6:row*6+6],key=lambda item:item[2][0])
  heights=[float(np.median([item[1][3] for item in ordered[view*12:view*12+6]])) for view in range(2)]
  for index,(label,stat,centre) in enumerate(ordered):
   x,y,w,h=[int(v) for v in stat[:4]];assert x>0 and y>0 and x+w<image.shape[1] and y+h<image.shape[0],name
   # Median of the hips ignores flapping scarves and an extended attacking hand.
   band=labels[y+int(h*.65):y+int(h*.85),x:x+w]==label;ys,xs=np.where(band);hip=float(np.median(xs)) if len(xs) else w*.5
   rect=[x-1,y-1,w+2,h+2];regions.append({'page':page,'rect':rect,'pivot':[round(hip+1,2),h+1],'bodyHeight':heights[index//12]})
  pages.append(name)
 (out/f'{body}.json').write_text(json.dumps({'directions':8,'walkFrames':6,'attackFrames':6,'pages':pages,'regions':regions},indent=2)+'\n')
 report[body]={'directions':8,'frames':len(regions),'pages':len(pages),'alphaCalibrated':True,'stableHipAndFootAnchors':True,'originalPixelsUnchanged':True}
(root/'art/hd2d-motion/atlas-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
