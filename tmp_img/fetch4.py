import json,urllib.parse,urllib.request,os,time
UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
Q={
 'tomato':'tomato plants field',
 'farmtech':'farmer smartphone field',
 'cloudfarm':'clouds sky over green fields',
 'reservoir':'water reservoir irrigation farm dam',
 'soilmoist':'soil moisture sensor probe agriculture',
 'greencrop':'green crop field rows landscape',
}
os.makedirs('tmp_img/c4',exist_ok=True); man={}
for k,q in Q.items():
    time.sleep(4)
    url='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({
      'q':q,'license_type':'commercial,modification','aspect_ratio':'wide','size':'large',
      'page_size':'8','format':'json'})
    try:
        d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30))
    except Exception as e:
        print(k,'search fail',str(e)[:60]); continue
    n=0
    for r in d.get('results',[]):
        w,h=r.get('width') or 0, r.get('height') or 0
        if w<1500 or w/h<1.4: continue
        fn=f"tmp_img/c4/{k}-{n}.jpg"
        try:
            u=r.get('url') or r.get('thumbnail')
            open(fn,'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read())
        except Exception as e:
            print('  dl fail',fn,str(e)[:50]); continue
        man[fn]={'title':r.get('title'),'license':f"{r.get('license')} {r.get('license_version') or ''}".strip(),
                 'creator':r.get('creator'),'source':r.get('foreign_landing_url'),'w':w,'h':h}
        n+=1; time.sleep(1)
        if n>=3: break
    print(k,'->',n)
json.dump(man,open('tmp_img/manifest4.json','w'),indent=1)
