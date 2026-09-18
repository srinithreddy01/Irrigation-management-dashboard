from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os, json
IMG='irrigation-dashboard/assets/images'
os.makedirs(IMG, exist_ok=True)
credits=[]

def crop_to(im, ratio):
    w,h=im.size; target=ratio
    if w/h > target:
        nw=int(h*target); off=(w-nw)//2; im=im.crop((off,0,off+nw,h))
    else:
        nh=int(w/target); off=int((h-nh)*0.35); im=im.crop((0,off,w,off+nh))
    return im

def save(src, dst, size, ratio, q=82, enhance=1.0):
    im=Image.open(src).convert('RGB')
    im=crop_to(im, ratio).resize(size, Image.LANCZOS)
    if enhance!=1.0: im=ImageEnhance.Color(im).enhance(enhance)
    im.save(os.path.join(IMG,dst), 'JPEG', quality=q, optimize=True, progressive=True, subsampling=1)
    kb=os.path.getsize(os.path.join(IMG,dst))/1024
    print(f"{dst:26s} {size[0]}x{size[1]}  {kb:7.1f} KB")
    return dst

# Hero: prominent, slightly saturated for a premium look
save('tmp_img/c4/greencrop-0.jpg','hero-field.jpg',(1920,1080),16/9,84,1.05)
# Field + section imagery (1200x675)
save('tmp_img/c3/paddy-0.jpg','field-rice.jpg',(1200,675),16/9,82)
save('tmp_img/c5/tomatocrop-2.jpg','field-tomato.jpg',(1200,675),16/9,82)
save('tmp_img/c3/cottonfield-0.jpg','field-cotton.jpg',(1200,675),16/9,82)
save('tmp_img/c4/cloudfarm-0.jpg','weather-sky.jpg',(1200,675),16/9,82,1.03)
save('tmp_img/c3/sprinklerirr-1.jpg','irrigation-sprinkler.jpg',(1200,675),16/9,82)
save('tmp_img/c5/pumpstation-2.jpg','pump-control.jpg',(1200,675),16/9,82)
save('tmp_img/c5/pumpstation-0.jpg','field-monitoring.jpg',(1200,675),16/9,82)
# Small thumbs for schedule/activity lists (4:3)
save('tmp_img/c3/paddy-0.jpg','thumb-rice.jpg',(480,360),4/3,80)
save('tmp_img/c5/tomatocrop-2.jpg','thumb-tomato.jpg',(480,360),4/3,80)
save('tmp_img/c3/cottonfield-0.jpg','thumb-cotton.jpg',(480,360),4/3,80)

# ---- Open Graph image (1200x630) ----
base=Image.open('tmp_img/c4/greencrop-0.jpg').convert('RGB')
og=crop_to(base,1200/630).resize((1200,630), Image.LANCZOS)
ov=Image.new('L',(1200,630),0); d=ImageDraw.Draw(ov)
for y in range(630):
    t=y/629
    d.line([(0,y),(1200,y)], fill=int(255*min(1.0, max(0.0,(t-0.15)/0.85)**1.15)*0.88))
ov=ov.filter(__import__('PIL.ImageFilter',fromlist=['ImageFilter']).GaussianBlur(0))
dark=Image.new('RGB',(1200,630),(8,38,28))
og=Image.composite(dark, og, ov)
d=ImageDraw.Draw(og)
try:
    F='/usr/share/fonts/truetype/dejavu/'
    f_big=ImageFont.truetype(F+'DejaVuSans-Bold.ttf',74)
    f_sub=ImageFont.truetype(F+'DejaVuSans.ttf',34)
    f_tag=ImageFont.truetype(F+'DejaVuSans.ttf',25)
except Exception as e:
    print('font err',e); f_big=f_sub=f_tag=ImageFont.load_default()
# accent bar
d.rectangle([64,92,140,100], fill=(74,222,128))
d.text((64,140), "AquaFarm", font=f_big, fill=(255,255,255))
d.text((64,238), "Smart Irrigation Management Dashboard", font=f_sub, fill=(226,240,232))
d.text((64,300), "Monitor  |  Analyze  |  Recommend  |  Control  |  Save Water", font=f_tag, fill=(134,239,172))
d.line([(64,392),(400,392)], fill=(45,120,85), width=2)
d.text((64,420), "Soil moisture, pump control, water analytics and irrigation", font=f_tag, fill=(198,222,209))
d.text((64,456), "scheduling in one responsive monitoring dashboard.", font=f_tag, fill=(198,222,209))
og.save(os.path.join(IMG,'og-image.jpg'),'JPEG',quality=86,optimize=True,progressive=True)
print('og-image.jpg', os.path.getsize(os.path.join(IMG,'og-image.jpg'))/1024,'KB')
