import json,urllib.parse,urllib.request,os,re
UA={'User-Agent':'AquaFarmDocsBot/1.0 (demo project; contact demo@example.com)'}
QUERIES={
 'pivot':'centre pivot irrigation aerial field',
 'sprinkler':'sprinkler irrigation crops field',
 'drip':'drip irrigation rows crops',
 'paddy':'rice paddy field green aerial',
 'tomato':'tomato field plants',
 'cotton':'cotton field bolls plant',
 'sensor':'soil moisture sensor agriculture',
 'clouds':'cumulus clouds over farmland',
 'tech':'farmer smartphone tablet field technology',
 'tank':'water storage tank farm',
}
os.makedirs('tmp_img/cand',exist_ok=True)
manifest={}
for key,q in QUERIES.items():
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({
      'action':'query','format':'json','generator':'search',
      'gsrsearch':f'filetype:bitmap {q}','gsrlimit':'8','gsrnamespace':'6',
      'prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':'1600'})
    req=urllib.request.Request(url,headers=UA)
    d=json.load(urllib.request.urlopen(req,timeout=30))
    pages=list(d.get('query',{}).get('pages',{}).values())
    picked=0
    for p in pages:
        ii=p['imageinfo'][0]
        w,h=ii['width'],ii['height']
        if w<1400 or h<800 or w/h<1.25: continue
        md=ii.get('extmetadata',{})
        lic=md.get('LicenseShortName',{}).get('value','?')
        art=re.sub('<[^>]+>','',md.get('Artist',{}).get('value','unknown'))[:60]
        fn=f"tmp_img/cand/{key}-{picked}.jpg"
        try:
            r=urllib.request.Request(ii['thumburl'],headers={**UA,'Referer':'https://commons.wikimedia.org/'})
            open(fn,'wb').write(urllib.request.urlopen(r,timeout=60).read())
        except Exception as e:
            print('dl fail',fn,e); continue
        manifest[fn]={'title':p['title'],'license':lic,'artist':art,'source':ii.get('descriptionurl'),'orig':f'{w}x{h}'}
        picked+=1
        if picked>=3: break
    print(key,'->',picked)
json.dump(manifest,open('tmp_img/manifest.json','w'),indent=1)
