/* v2/relay.js — 研究证据轨页面注入「公众叙事视角」接力按钮，纯前端无依赖 */
(function(){
  var MAP={
    'index.html':'../index.html',
    'history.html':'../who.html',
    'theory.html':'../blindspot.html',
    'network.html':'../network.html',
    'models.html':'../choices.html',
    'scenarios.html':'../windtunnel.html',
    'decision.html':'../report.html'
  };
  var file=location.pathname.split('/').pop()||'index.html';
  var target=MAP[file]||'../index.html';
  var css='#relay-fab{position:fixed;right:18px;bottom:18px;z-index:999;display:flex;align-items:center;gap:8px;'
    +'background:rgba(120,82,40,.94);border:1px solid #fbbf24;color:#fff;padding:10px 16px 10px 12px;'
    +'border-radius:24px;font:600 12.5px/1.2 -apple-system,"PingFang SC",sans-serif;text-decoration:none;'
    +'box-shadow:0 8px 24px rgba(0,0,0,.42);backdrop-filter:blur(8px);transition:.2s}'
    +'#relay-fab:hover{background:#92640f;transform:translateY(-1px)}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var a=document.createElement('a');a.id='relay-fab';a.href=target;
  a.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z"/></svg>公众叙事视角';
  document.body.appendChild(a);
})();
