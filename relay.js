/* relay.js — 旧版（公众叙事轨）页面注入「研究证据视角」接力按钮，纯前端无依赖 */
(function(){
  var MAP={
    'index.html':'v2/index.html',
    'town.html':'v2/history.html',
    'who.html':'v2/history.html',
    'network.html':'v2/network.html',
    'choices.html':'v2/models.html',
    'blindspot.html':'v2/theory.html',
    'future.html':'v2/scenarios.html',
    'windtunnel.html':'v2/scenarios.html',
    'report.html':'v2/decision.html',
    'ending.html':'v2/decision.html',
    'role.html':'v2/index.html'
  };
  var file=location.pathname.split('/').pop()||'index.html';
  var target=MAP[file]||'v2/index.html';
  var css='#relay-fab{position:fixed;right:18px;bottom:18px;z-index:999;display:flex;align-items:center;gap:8px;'
    +'background:rgba(14,116,144,.92);border:1px solid #22d3ee;color:#fff;padding:10px 16px 10px 12px;'
    +'border-radius:24px;font:600 12.5px/1.2 -apple-system,"PingFang SC",sans-serif;text-decoration:none;'
    +'box-shadow:0 8px 24px rgba(0,0,0,.42);backdrop-filter:blur(8px);transition:.2s}'
    +'#relay-fab:hover{background:#0891b2;transform:translateY(-1px)}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var a=document.createElement('a');a.id='relay-fab';a.href=target;
  a.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>研究证据视角';
  document.body.appendChild(a);
})();
