import json,urllib.parse,urllib.request,os,re
UA={'User-Agent':'AquaFarmDocsBot/1.0 (demo project; contact demo@example.com)'}
QUERIES={
 'rice2':'rice paddy field water green crop',
 'toma2':'tomato plant fruit greenhouse rows',
 'cott2':'cotton bolls field harvest plant',
 'irr2':'irrigation sprinkler water spraying crop field',
 'canal':'irrigation canal water flowing farmland',
 'sky':'cumulus cloud blue sky above green field',
 'tech2':'farmer using mobile phone in field agriculture',
 'solar':'solar water pump irrigation agriculture',
 'soil':'soil moisture sensor probe measurement',
 'tank2':'water tank storage village agriculture',
 'drone':'drone flying over agricultural field',
 'mustard':'vegetable crop rows farm green',
}
os.makedirs('tmp_img/cand2',exist_ok=True)
manifest={}
for key,q in QUERIES.items():
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({
      'action':'query','format':'json','generator':'search',
      'gsrsearch':f'filetype:bitmap {q}','gsrlimit':'10','gsrnamespace':'6',
      'prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':'1920'})
    try:
        d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30))
    except Exception as e:
        print(key,'search fail',e); continue
    picked=0
    for p in list(d.get('query',{}).get('pages',{}).values()):
        ii=p['imageinfo'][0]; w,h=ii['width'],ii['height']
        if w<1600 or h<900 or w/h<1.4: continue
        md=ii.get('extmetadata',{})
        lic=md.get('LicenseShortName',{}).get('value','?')
        art=re.sub('<[^>]+>','',md.get('Artist',{}).get('value','unknown'))[:60]
        fn=f"tmp_img/cand2/{key}-{picked}.jpg"
        try:
            r=urllib.request.Request(ii['thumburl'],headers={**UA,'Referer':'https://commons.wikimedia.org/'})
            open(fn,'wb').write(urllib.request.urlopen(r,timeout=60).read())
        except Exception as e:
            print('dl fail',fn,e); continue
        manifest[fn]={'title':p['title'],'license':lic,'artist':art,'source':ii.get('descriptionurl'),'orig':f'{w}x{h}'}
        picked+=1
        if picked>=2: break
    print(key,'->',picked)
json.dump(manifest,open('tmp_img/manifest2.json','w'),indent=1)
