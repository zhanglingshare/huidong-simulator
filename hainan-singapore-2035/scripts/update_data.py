"""Collect official source metadata; apply separately reviewed indicator/event records.

No model files are changed. A failed retrieval preserves the last successful
record. A fetched document is NOT automatically a verified economic fact.
Python 3.9+, standard library only.
"""
import argparse
import copy
import hashlib
import json
import os
import re
import tempfile
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.in_title = False; self.skip = 0; self.title = []; self.text = []
    def handle_starttag(self, tag, attrs):
        if tag == 'title': self.in_title = True
        if tag in ('script', 'style', 'noscript'): self.skip += 1
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag in ('script', 'style', 'noscript'): self.skip = max(0, self.skip-1)
    def handle_data(self, data):
        if self.in_title: self.title.append(data)
        if not self.skip: self.text.append(data)

def iso_now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')

def validate_dataset(d):
    if d.get('schema_version') != '1.0' or d.get('project_key') != 'two-islands-2035-20261030':
        raise ValueError('数据协议或项目标识不匹配')
    for key in ('documents', 'indicators', 'events', 'failures'):
        if not isinstance(d.get(key), list): raise ValueError(key+'必须是数组')
    for kind in ('indicators', 'events'):
        seen = set()
        for item in d[kind]:
            if not isinstance(item, dict): raise ValueError('记录必须是对象')
            for key in ('id', 'label', 'tier', 'source_url', 'published_at', 'status', 'reviewed_by', 'reviewed_at'):
                if not item.get(key): raise ValueError('记录缺少'+key)
            if item['id'] in seen: raise ValueError('记录ID重复')
            seen.add(item['id'])
            if item['tier'] not in ('A','B','C'): raise ValueError('证据等级无效')
            if item['status'] not in ('reported','verified','effective','observed'): raise ValueError('事件状态无效')
            if urlsplit(item['source_url']).scheme != 'https': raise ValueError('来源须使用HTTPS')
            if kind == 'indicators':
                for key in ('value','unit','period','region','definition'):
                    if key not in item or item[key] is None: raise ValueError('指标缺少'+key)
                if isinstance(item['value'], bool) or not isinstance(item['value'], (float,int)):
                    raise ValueError('指标数值须为数字')
                if not __import__('math').isfinite(item['value']): raise ValueError('指标数值无效')
    return d

def fetch_document(source, opener=urllib.request.urlopen):
    allowed = set(source['allowed_hosts'])
    class RestrictedRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            u = urlsplit(newurl)
            if u.scheme != 'https' or u.hostname not in allowed: raise ValueError('来源重定向到未配置域名')
            return super().redirect_request(req, fp, code, msg, headers, newurl)
    if urlsplit(source['url']).scheme != 'https' or urlsplit(source['url']).hostname not in allowed:
        raise ValueError('来源域名无效')
    req = urllib.request.Request(source['url'], headers={'User-Agent':'TwoIslands2035/2.0 (public-source-metadata; no-auth)'})
    open_fn = urllib.request.build_opener(RestrictedRedirect()).open if opener is urllib.request.urlopen else opener
    with open_fn(req, timeout=25) as response:
        if urlsplit(response.geturl()).hostname not in allowed: raise ValueError('来源重定向域名无效')
        data = response.read(2_000_001)
        if len(data)>2_000_000: raise ValueError('来源页面过大')
        charset = response.headers.get_content_charset() or 'utf-8'
        html = data.decode(charset, errors='replace')
    page = Page(); page.feed(html)
    text = re.sub(r'\s+', ' ', ' '.join(page.text)).strip()
    if len(text)<50: raise ValueError('来源正文为空或不可解析')
    # Store only metadata/hash, never mirror a whole third-party article.
    return {'id':source['id'],'label':source['name'],'title':''.join(page.title).strip()[:200],
            'source_url':source['url'],'fetched_at':iso_now(),'content_sha256':hashlib.sha256(text.encode()).hexdigest(),
            'tier':'unreviewed','status':'collected','purpose':source.get('purpose','')}

def collect(current, registry, fetch=fetch_document):
    out=copy.deepcopy(current); docs={d['id']:d for d in out['documents']}; failures=[]
    for source in registry['sources']:
        try:
            new=fetch(source); old=docs.get(new['id'])
            if old and old.get('content_sha256') == new['content_sha256']:
                continue
            docs[new['id']]=new
        except Exception as exc:
            failures.append({'source_id':source['id'],'error':str(exc)[:180]})
    out['documents']=list(docs.values());out['failures']=failures
    # No retrieved page is promoted to a verified indicator/event automatically.
    return out

def apply_reviewed(current, patch):
    out=copy.deepcopy(current)
    for kind in ('indicators','events'):
        rows={row['id']:row for row in out[kind]}
        for item in patch.get(kind,[]): rows[item['id']]=item
        out[kind]=list(rows.values())
    return validate_dataset(out)

def atomic_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix='.data-', dir=str(path.parent))
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f:
            json.dump(obj,f,ensure_ascii=False,indent=2,allow_nan=False);f.write('\n')
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def main():
    a=argparse.ArgumentParser();a.add_argument('--check',action='store_true');a.add_argument('--apply-reviewed',type=Path);args=a.parse_args()
    target=ROOT/'data/latest.json';old=validate_dataset(json.loads(target.read_text(encoding='utf-8')))
    if args.check: print('Data schema valid');return
    if args.apply_reviewed:
        out=apply_reviewed(old,json.loads(args.apply_reviewed.read_text(encoding='utf-8')))
    else:
        registry=json.loads((ROOT/'data/sources.json').read_text(encoding='utf-8'));out=collect(old,registry)
    if out == old: print('No source changes; previous dataset retained');return
    if not out['documents'] and not out['indicators'] and not out['events']:
        print('All sources unavailable; prior dataset retained. No update published.');return
    now=iso_now();out['updated_at']=now;out['mode']='collected_unreviewed' if not out['indicators'] and not out['events'] else 'reviewed_records'
    out['version']=hashlib.sha256(json.dumps(out,sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:16]
    validate_dataset(out)
    # Immutable per-update snapshot, written before replacing latest.
    stamp=now.replace(':','').replace('+','_')
    atomic_json(ROOT/'data/history'/f'{stamp}-{out["version"]}.json',out)
    atomic_json(target,out)
    print(f'Published data version {out["version"]}: {len(out["documents"])} sources, {len(out["failures"])} failures')

if __name__=='__main__': main()
