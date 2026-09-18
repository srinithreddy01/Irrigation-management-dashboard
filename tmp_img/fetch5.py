import json,urllib.parse,urllib.request,os,re,time
UA={'User-Agent':'AquaFarmDocsBot/1.0 (demo; contact demo@example.com)'}
Q={
 'tomatocrop':'tomato field harvest tomatoes farm',
 'cottongreen':'cotton field green crop India',
 'pumpstation':'irrigation pump station control agriculture',
 'farmerphone':'farmer mobile phone India agriculture',
 'fieldaerial':'aerial view agricultural fields irrigated green',
}
os.makedirs('tmp_img/c5',exist_ok=True); man={}
for k,q in Q.items():
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({
      'action':'query','format':'json','generator':'search','gsrsearch':f'filetype:bitmap {q}',
      'gsrlimit':'12','gsrnamespace':'6','prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':'1920'})
    try:
        d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=30))
    except Exception as e:
        print(k,'search fail',str(e)[:50]); continue
    n=0
    for p in list(d.get('query',{}).get('pages',{}).values()):
        ii=p['imageinfo'][0]; w,h=ii['width'],ii['height']
        if w<1600 or h<900 or w/h<1.4: continue
        md=ii.get('extmetadata',{})
        lic=md.get('LicenseShortName',{}).get('value','?')
        art=re.sub('<[^>]+>','',md.get('Artist',{}).get('value','unknown'))[:60]
        fn=f"tmp_img/c5/{k}-{n}.jpg"
        try:
            r=urllib.request.Request(ii['thumburl'],headers={**UA,'Referer':'https://commons.wikimedia.org/'})
            open(fn,'wb').write(urllib.request.urlopen(r,timeout=90).read())
        except Exception as e:
            print('  dl fail',fn,str(e)[:40]); continue
        man[fn]={'title':p['title'][5:],'license':lic,'creator':art,'source':ii.get('descriptionurl'),'w':w,'h':h}
        n+=1; time.sleep(1)
        if n>=3: break
    print(k,'->',n)
json.dump(man,open('tmp_img/manifest5.json','w'),indent=1)
