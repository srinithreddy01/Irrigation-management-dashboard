import json,urllib.parse,urllib.request,os,re,sys
UA={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
Q={
 'paddy':'rice paddy field green water',
 'tomatofield':'tomato plants farm field rows',
 'cottonfield':'cotton plant field bolls',
 'dripirr':'drip irrigation field',
 'sprinklerirr':'sprinkler irrigation field crops',
 'canalirr':'irrigation canal water agriculture',
 'farmertech':'farmer tablet field technology',
 'sensors':'soil moisture sensor agriculture',
 'cloudsfarm':'clouds over farmland landscape',
 'watertank':'water tank farm storage',
 'croproll':'green crop rows farm landscape',
 'solarpump':'solar panel irrigation farm',
}
os.makedirs('tmp_img/c3',exist_ok=True)
man={}
for k,q in Q.items():
    url='https://api.openverse.org/v1/images/?'+urllib.parse.urlencode({
      'q':q,'license_type':'commercial,modification','aspect_ratio':'wide','size':'large',
      'page_size':'6','format':'json'})
    try:
        d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30))
    except Exception as e:
        print(k,'search fail',e); continue
    n=0
    for r in d.get('results',[]):
        w,h=r.get('width') or 0, r.get('height') or 0
        if w<1600 or w/h<1.45: continue
        fn=f"tmp_img/c3/{k}-{n}.jpg"
        try:
            u=r.get('url') or r.get('thumbnail')
            open(fn,'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read())
        except Exception as e:
            print('  dl fail',fn,str(e)[:60]); continue
        man[fn]={'title':r.get('title'),'license':f"{r.get('license')} {r.get('license_version') or ''}".strip(),
                 'creator':r.get('creator'),'source':r.get('foreign_landing_url'),'w':w,'h':h}
        n+=1
        if n>=2: break
    print(k,'->',n)
json.dump(man,open('tmp_img/manifest3.json','w'),indent=1)
