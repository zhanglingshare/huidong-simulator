/* Standalone HTML interaction layer. All paths, scores, strengths and 2035 values here are synthetic experience fixtures, NOT the v2.1 server engine or calibrated forecasts. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const ns = 'http://www.w3.org/2000/svg';
const names = {
  world:['01 / THE CONNECTED WORLD','一张会变化的连接网','点击或拖动一个主体，找到它与另一座岛的关系。'],
  change:['02 / FOLLOW THE CHANGE','一条事件，能改变多少条线？','选择一个假设事件，再观察十年里的直接和间接变化。'],
  strategy:['03 / MAKE YOUR MOVE','资源有限，你敢把钱放在哪？','总共只有 7 格资源：加一项，另一项可能不得不减。'],
  run:['04 / WATCH IT UNFOLD','让十年在眼前发生','按下播放，观察关系如何逐年生长、变弱与修复。'],
  future:['05 / EXPLORE THE FUTURES','同样的时间，不同的未来','比较你选的路径与均衡起步的合成体验轨迹。'],
  blind:['06 / FIND ANOTHER WAY','你可能忽略了哪一座桥？','试着补一条关键连接，再看看变化是否只发生在一处。']
};
const stages = Object.keys(names);
const nodeData = [
  {id:'h-port',name:'港口物流',sub:'海南 / 航运',x:145,y:115,side:'hn',type:'物流',desc:'港口物流连接制造、贸易、供应链，但吞吐量不是最终价值。'},
  {id:'h-trade',name:'跨境贸易',sub:'海南 / 贸易',x:337,y:105,side:'hn',type:'产业',desc:'贸易增长是否留得住配套服务，决定了价值在本地停留多久。'},
  {id:'h-industry',name:'加工制造',sub:'海南 / 产业',x:120,y:258,side:'hn',type:'产业',desc:'制造业扩张不仅需要空间和订单，更需要持续运转的服务网络。'},
  {id:'h-tour',name:'旅游消费',sub:'海南 / 消费',x:340,y:340,side:'hn',type:'产业',desc:'客流不等于本地留下的价值：服务质量与人才供给决定转化。'},
  {id:'h-talent',name:'人才教育',sub:'海南 / 人才',x:200,y:441,side:'hn',type:'人才',desc:'人才不只影响一个产业，而是让几条产业关系同时有了执行能力。'},
  {id:'h-digital',name:'数字服务',sub:'海南 / 服务',x:430,y:455,side:'hn',type:'人才',desc:'数字服务是连接贸易、制造与创业者的桥，不等于简单再造一个港口。'},
  {id:'s-port',name:'港口网络',sub:'新加坡 / 航运',x:802,y:130,side:'sg',type:'物流',desc:'新加坡的港口网络依赖全球航线及后端金融、法律与组织能力。'},
  {id:'s-trade',name:'贸易协作',sub:'新加坡 / 贸易',x:628,y:89,side:'sg',type:'产业',desc:'贸易协作需要制度、物流、信息的连续配合，单个环节升级不够。'},
  {id:'s-finance',name:'专业服务',sub:'新加坡 / 服务',x:683,y:255,side:'sg',type:'产业',desc:'专业服务是把货物流动变成高附加值活动的重要条件。'},
  {id:'s-talent',name:'国际人才',sub:'新加坡 / 人才',x:848,y:355,side:'sg',type:'人才',desc:'人才的跨境流动对网络具有放大效应，也面临生活成本与制度约束。'},
  {id:'s-tech',name:'创新科技',sub:'新加坡 / 创新',x:590,y:430,side:'sg',type:'人才',desc:'创新不仅靠投入，还取决于跨境知识链接能不能落地。'},
  {id:'s-green',name:'绿色航运',sub:'新加坡 / 转型',x:790,y:473,side:'sg',type:'物流',desc:'绿色航运是港口、能源、船舶服务与规则之间的共同升级。'}
];
const edges = [
  ['h-port','h-trade','物流',.75],['h-port','h-industry','物流',.76],
  ['h-trade','h-digital','产业',.48],['h-industry','h-talent','人才',.40],['h-tour','h-talent','人才',.66],
  ['h-tour','h-digital','产业',.5],['h-talent','h-digital','人才',.67],['h-industry','h-tour','产业',.25],
  ['s-port','s-trade','物流',.95],['s-port','s-finance','产业',.76],['s-port','s-green','物流',.73],
  ['s-trade','s-finance','产业',.8],['s-finance','s-talent','人才',.82],['s-finance','s-tech','产业',.76],
  ['s-talent','s-tech','人才',.74],['s-green','s-tech','人才',.54],
  ['h-port','s-port','物流',.46],['h-trade','s-trade','产业',.51],
  ['h-digital','s-finance','产业',.27],['h-talent','s-talent','人才',.26],
  ['h-tour','s-talent','人才',.22],['h-industry','s-port','物流',.36]
].map(([a,b,type,w]) => ({a,b,type,w}));
const bridgeData = {
  standards:{label:'跨岛服务认证',a:'h-digital',b:'s-finance',type:'产业',desc:'使海南本地的服务商更容易与国际服务网络形成长期连接。'},
  skills:{label:'人才协作通道',a:'h-talent',b:'s-tech',type:'人才',desc:'把人才的流动变成共同培养、共同项目与双向知识协作。'}
};
const events = {
  none:{title:'没有附加事件',text:'按基准演示观察关系变化。'},
  shipping:{title:'国际航线受阻',text:'物流连接变弱，受影响的不止港口，还可能包括配套产业与服务。'},
  talent:{title:'人才互访增多',text:'人才连接变强，但产业是否受益还取决于服务和承接能力。'},
  trade:{title:'跨境规则改善',text:'贸易连接更顺畅；谁能把订单转化为服务机会，仍然取决于本地结构。'}
};
const state = {
  stage:'world',year:2026,lens:'all',event:'none',
  allocation:{物流:2,产业:2,人才:2},bridges:{standards:false,skills:false},
  selected:null,positions:{},playing:false
};
let timer=null,drag=null;
function el(tag,attrs={},children=[]){
  const node=document.createElementNS(ns,tag);
  for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,String(value));
  for(const child of children) node.appendChild(typeof child==='string'?document.createTextNode(child):child);
  return node;
}
function clamp(x,min,max){return Math.max(min,Math.min(max,x));}
function loc(id){return {...nodeData.find(n=>n.id===id),...(state.positions[id]||{})};}
function intensity(e,yr=state.year,condition=state){
  let v=e.w + (yr-2026)*.008;
  if(e.type==='物流') v+=(condition.allocation['物流']-2)*.055*(yr-2026)/9;
  if(e.type==='产业') v+=(condition.allocation['产业']-2)*.047*(yr-2026)/9;
  if(e.type==='人才') v+=(condition.allocation['人才']-2)*.06*(yr-2026)/9;
  if(condition.event==='shipping'&&yr>=2029&&e.type==='物流') v-=.33;
  if(condition.event==='talent'&&yr>=2028&&e.type==='人才') v+=.24;
  if(condition.event==='trade'&&yr>=2029&&e.type==='产业') v+=.18;
  return clamp(v,.07,.98);
}
function graphEdges(){
  const result=edges.map(e=>({...e,bridge:false}));
  for(const [key,v] of Object.entries(bridgeData)){
    if(state.bridges[key]) result.push({...v,w:.8,bridge:true});
  }
  return result;
}
function draw(){
  const layer=$('#edge-layer'),nodes=$('#node-layer');layer.replaceChildren();nodes.replaceChildren();
  for(const e of graphEdges()){
    const a=loc(e.a),b=loc(e.b);
    const cx=(a.x+b.x)/2+(a.y-b.y)*.11,cy=(a.y+b.y)/2+(b.x-a.x)*.09;
    const w=intensity(e);
    const path=el('path',{d:`M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`});
    const eventHit=(state.event==='shipping'&&e.type==='物流'&&state.year>=2029);
    const typeColor=e.bridge?'#e9b77c':e.type==='物流'?'#76bbd8':e.type==='人才'?'#b8a2e7':'#60d7b3';
    const highlighted=state.selected&&(e.a===state.selected||e.b===state.selected);
    path.setAttribute('stroke',eventHit?'#f59389':typeColor);
    path.setAttribute('stroke-width',String(highlighted?4:1.15+w*2.2));
    path.setAttribute('opacity',String(state.lens!=='all'&&state.lens!==e.type?.075:highlighted?1:.23+w*.44));
    const cl=['edge'];
    if(eventHit)cl.push('cut');else if(e.bridge||w>.66)cl.push('pulse-edge');
    if(highlighted)cl.push('focused');path.setAttribute('class',cl.join(' '));
    path.style.cursor='pointer';
    path.addEventListener('click',()=>{
      const n=nodeData.find(n=>n.id===e.a);
      state.selected=e.a;
      setFocus('发现一条关系',`${n.name} ↔ ${nodeData.find(n=>n.id===e.b).name}：${e.type}连接的强弱，会影响其他主体的机会。`,'在演示网络中，红色虚线表示受压连接，并不表示现实已发生断裂。');
      draw();
    });
    layer.append(path);
  }
  for(const n of nodeData){
    const p=loc(n.id),hn=n.side==='hn',color=hn?'#5ee6be':'#f2bc7e';
    const group=el('g',{class:'node'+(state.selected===n.id?' chosen':''),'data-node':n.id,role:'button',tabindex:'0','aria-label':`${n.name}，${n.sub}`});
    group.append(el('circle',{cx:p.x,cy:p.y,r:22,class:'node-ring',stroke:color,fill:hn?'#153d39':'#413327'}));
    group.append(el('circle',{cx:p.x,cy:p.y,r:6.2,class:'node-dot',fill:color}));
    group.append(el('text',{x:p.x,y:p.y-29,class:'node-label','text-anchor':'middle'},[n.name]));
    group.append(el('text',{x:p.x,y:p.y+39,class:'node-sub','text-anchor':'middle'},[n.sub]));
    group.addEventListener('pointerdown',evt=>{
      evt.preventDefault();
      $('#network-svg').setPointerCapture(evt.pointerId);
      drag={id:n.id,x:evt.clientX,y:evt.clientY,moved:false};
    });
    group.addEventListener('click',evt=>{if(evt.detail===0)selectNode(n.id);});
    group.addEventListener('keydown',evt=>{if(evt.key==='Enter'||evt.key===' '){evt.preventDefault();selectNode(n.id);}});
    nodes.append(group);
  }
}
function setFocus(title,desc,extra){
  $('#focus-title').textContent=title;
  $('#focus-desc').textContent=desc;
  $('#focus-extra').textContent=extra;
}
function selectNode(id){
  state.selected=id;const n=nodeData.find(q=>q.id===id);const neighbors=graphEdges().filter(e=>e.a===id||e.b===id).length;
  setFocus(n.name,n.desc,`当前演示网络中，它连接 ${neighbors} 条关系。真正重要的是这些关系能否在冲击下保持功能。`);
  draw();
}
function setSurprise(title,text){
  $('#surprise-title').textContent=title;$('#surprise-desc').textContent=text;
}
function updateAside(){
  if(state.stage==='world'){setSurprise('更大的港口，不一定带来更多本地价值。','港口能力只是起点；产业承接、服务能力、人才供给可能决定了价值留在哪座岛。');}
  if(state.stage==='change'){
    const s=state.event;
    const messages={
      none:['没有坏消息，也不代表网络没有脆弱点。','即便平静时期，单点依赖仍可能累积。'],
      shipping:['断掉的不只是航线，可能还有订单。','港口与产业配套同步受压时，单独恢复物流未必恢复原来的网络。'],
      talent:['人才流动加快，也可能让差距扩大。','有承接能力的一方更容易形成价值放大，另一方可能只能输送人才。'],
      trade:['通关更快，不等于企业赚得更多。','服务链条与订单转化能力若没跟上，效率收益可能沿网络流向他处。']
    };setSurprise(...messages[s]);
  }
  if(state.stage==='strategy')setSurprise('资源配置最难的，不是选对一项。','真正的约束是：一项投入必须依赖另一项投入才能产生价值。所有方向都选“最大”不是可执行方案。');
  if(state.stage==='run')setSurprise('时间是隐藏的第四个变量。','同一项投入，先后顺序不同，可能导致不同连接先形成或先断裂。');
  if(state.stage==='future')setSurprise('未来不是一根确定的线。','本页只展示合成体验路径；真实世界需要数据标定、情景验证和反事实比较。');
  if(state.stage==='blind')setSurprise('有时最有价值的行动，是先搭一座桥。','不必永远增加节点数量；连接原本孤立的主体，可能比扩大最强节点更重要。');
}
function refreshHeader(){
  const [sid,title,sub]=names[state.stage];
  $('#section-id').textContent=sid;$('#section-title').textContent=title;$('#section-sub').textContent=sub;
  $('#year-chip').textContent=state.year;
  $('#network-status').textContent=`双岛关系网 · ${state.year} 年 · ${events[state.event].title}`;
  const svgRoot=$('#network-svg');
svgRoot.addEventListener('pointermove',evt=>{
  if(!drag)return;
  const matrix=svgRoot.getScreenCTM();if(!matrix)return;
  const pt=svgRoot.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;
  const v=pt.matrixTransform(matrix.inverse());
  if(Math.abs(evt.clientX-drag.x)+Math.abs(evt.clientY-drag.y)>5)drag.moved=true;
  if(!drag.moved)return;
  state.positions[drag.id]={x:clamp(v.x,48,910),y:clamp(v.y,65,485)};
  draw();
});
svgRoot.addEventListener('pointerup',()=>{
  if(!drag)return;
  const id=drag.id,moved=drag.moved;drag=null;
  if(!moved)selectNode(id);
});
svgRoot.addEventListener('pointercancel',()=>{drag=null;});
document.querySelectorAll('[data-stage]').forEach(btn=>{const on=btn.dataset.stage===state.stage;btn.classList.toggle('active',on);btn.setAttribute('aria-current',on?'step':'false');});
  document.querySelectorAll('[data-lens]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.lens===state.lens));
  const i=stages.indexOf(state.stage);
  $('#prev-stage').disabled=i===0;$('#prev-stage').style.opacity=i===0?'.4':'1';
  $('#next-stage').innerHTML=i===stages.length-1?'回到第一幕 <span>↺</span>':'进入下一幕 <span>→</span>';
  updateAside();draw();
}
function rating(year,side,control=false){
  const n=year-2026;
  let base=(side==='hn'?49:59)+n*(side==='hn'?2:1.55);
  const alloc=control?{物流:2,产业:2,人才:2}:state.allocation;
  base+=n/9*((alloc['物流']-2)*2.1+(alloc['产业']-2)*1.8+(alloc['人才']-2)*2.0)*(side==='hn'?1:.75);
  if(state.event==='shipping'&&year>=2029)base-=Math.min(8,3+(n-3)*.85)*(side==='hn'?.95:1);
  if(state.event==='talent'&&year>=2028)base+=Math.min(5,1+(n-2)*.7);
  if(state.event==='trade'&&year>=2029)base+=Math.min(5,1+(n-3)*.8);
  if(!control){
    base+=(state.bridges.standards?Math.max(0,n-2)*.6:0);
    base+=(state.bridges.skills?Math.max(0,n-3)*.54:0);
  }
  return Math.round(clamp(base,12,95));
}
function chartSvg(){
  const w=860,h=254,left=40,right=22,top=20,bottom=33;
  const x=i=>left+i*(w-left-right)/9,y=v=>h-bottom-(v-25)*(h-top-bottom)/65;
  const yrs=Array.from({length:10},(_,i)=>2026+i);
  const paths=(side,control)=>yrs.map((yr,i)=>`${i?'L':'M'}${x(i).toFixed(1)} ${y(rating(yr,side,control)).toFixed(1)}`).join(' ');
  const current=state.year-2026;
  return `<svg viewBox="0 0 860 254" role="img" aria-label="两座岛十年合成体验指数曲线，不是经济预测">
    ${[30,50,70,90].map(v=>`<line x1="${left}" x2="${w-right}" y1="${y(v)}" y2="${y(v)}" stroke="#31505b" stroke-dasharray="4 7"/><text x="8" y="${y(v)+4}" fill="#8aabb3" font-size="12">${v}</text>`).join('')}
    <path d="${paths('hn',true)}" stroke="#688eac" stroke-dasharray="6 6" stroke-width="2.2" fill="none"/>
    <path d="${paths('hn',false)}" stroke="#5be3bd" stroke-width="3" fill="none"/>
    <path d="${paths('sg',false)}" stroke="#e8b979" stroke-width="3" fill="none"/>
    <line x1="${x(current)}" x2="${x(current)}" y1="${top}" y2="${h-bottom}" stroke="#e2f8ec" stroke-opacity=".3" stroke-width="2"/>
    <circle cx="${x(current)}" cy="${y(rating(state.year,'hn'))}" r="5.5" fill="#7ffff0"/>
    <circle cx="${x(current)}" cy="${y(rating(state.year,'sg'))}" r="5.5" fill="#ffd59f"/>
    ${[2026,2028,2030,2032,2035].map(yr=>`<text x="${x(yr-2026)}" y="247" fill="#8eacb5" text-anchor="middle" font-size="12">${yr}</text>`).join('')}
   </svg>`;
}
function yearControl(){
  return `<div class="filter-bar"><label class="year-control"><span class="key-text">拖动时间</span><input id="year-range" type="range" min="2026" max="2035" step="1" value="${state.year}" aria-label="观察年份"><output id="year-output">${state.year}</output></label><span class="key-text">从 2026 逐年看到 2035</span></div>`;
}
function renderDetail(){
  const panel=$('#stage-detail'),s=state.stage;
  let content='';
  if(s==='world')content=`<div class="stage-tag">你看见的，可能只是第一层</div>
    <div class="three-cards">
      <div class="mini-card"><div class="card-kicker">01 / 港口</div><h3>货物流动，不等于价值留下</h3><p>港航连接与服务网络必须一起看。</p></div>
      <div class="mini-card"><div class="card-kicker">02 / 人才</div><h3>人才可能是隐形枢纽</h3><p>一处断点，影响的不止一个行业。</p></div>
      <div class="mini-card"><div class="card-kicker">03 / 选择</div><h3>一座桥，可能比十个节点重要</h3><p>先找机会，再决定是否投入。</p></div>
    </div><p class="caption-text">提示：点击任意节点，右侧显示它的局部关系。网络节点与连接为合成演示结构，不是实际企业名录。</p>`;
  if(s==='change')content=`<div class="stage-tag">加入一条假设事件，观察网络如何响应</div><div class="two-cards">
    ${[['shipping','国际航线受阻','物流压力从航线向产业链传导'],['talent','人才互访增多','更多合作机会，也有更大承接要求'],['trade','跨境规则改善','贸易效率与服务能力一起被检验'],['none','不加入事件','回到无附加事件的演示基准']].map(([key,title,sub])=>`<div class="mini-card event-card"><div class="card-kicker">情景演示 / ${key==='none'?'BASELINE':'EVENT'}</div><h3>${title}</h3><p>${sub}</p><p class="note">${state.event===key?'当前已选中':'此处是可撤回的假设，不代表真实发生'}</p><button type="button" class="${state.event===key?'on':''}" data-event="${key}">${state.event===key?'正在观察 ✓':'把它放进世界'}</button></div>`).join('')}
    </div><div style="margin-top:16px">${yearControl()}</div>`;
  if(s==='strategy'){
    const used=Object.values(state.allocation).reduce((a,b)=>a+b,0);
    content=`<div class="stage-tag">只有 7 格资源，不能无限加码</div><div class="budget-line"><span>已分配资源 <strong>${used} / 7</strong></span><span>余量：${7-used} 格</span></div><div class="budget-track"><div class="budget-fill" style="width:${used/7*100}%"></div></div><p class="caption-text">每项 0—4 格，合计不超过 7 格；超出时系统会自动限制调整。这里只检验操作和结构变化。</p>
    <div class="choice-grid" style="margin-top:17px">
      ${[['物流','港航与航线韧性','让货物与航线保持流动'],['产业','产业与专业服务','让订单变成当地服务和能力'],['人才','人才培养与双向协作','让机会有能力落地']].map(([name,label,sub])=>`<label class="allocation"><span><strong>${label}</strong><small>${sub}</small></span><input type="range" min="0" max="4" step="1" value="${state.allocation[name]}" data-allocation="${name}" aria-label="${label}投入格数"><output>${state.allocation[name]}</output></label>`).join('')}
    </div><div class="blind-insight">真正的限制不是你想投多少，而是这些投入之间有没有足够的连接让它们发挥作用。</div>`;
  }
  if(s==='run')content=`<div class="stage-tag">让决策经历十年，而不只是拿到一个数字</div><div class="play-row"><button id="play" class="play-button">${state.playing?'暂停播放 Ⅱ':state.year===2035?'从 2026 重播 ↺':'▶ 播放十年变化'}</button><span class="key-text">合成关系动画 · 每年可停留观察</span></div>
   ${yearControl()}<div class="metric-grid">
    <div class="metric"><small>海南体验指数</small><strong>${rating(state.year,'hn')}</strong><span>/ 100 · 合成情景</span></div>
    <div class="metric"><small>新加坡体验指数</small><strong>${rating(state.year,'sg')}</strong><span>/ 100 · 合成情景</span></div>
    <div class="metric"><small>当前跨岛桥梁</small><strong>${Object.values(state.bridges).filter(Boolean).length}</strong><span>/ 2 · 可手动加入</span></div>
   </div><div class="plot-wrap">${chartSvg()}<div class="plot-legend"><b><i style="border-color:#5be3bd"></i>海南</b><b><i style="border-color:#e8b979"></i>新加坡</b><b><i style="border-color:#688eac;border-top-style:dashed"></i>均衡起步对照</b></div></div><p class="caption-text">体验指数纯属视觉化演示刻度，不对应 GDP、实际增长率或真实达标概率。</p>`;
  if(s==='future')content=`<div class="stage-tag">把同一场假设，放进不同的路径</div>${yearControl()}<div class="plot-wrap">${chartSvg()}<div class="plot-legend"><b><i style="border-color:#5be3bd"></i>海南 · 当前选择</b><b><i style="border-color:#e8b979"></i>新加坡 · 当前选择</b><b><i style="border-color:#688eac;border-top-style:dashed"></i>海南 · 均衡起步</b></div></div><div class="two-cards" style="margin-top:12px">
    <div class="mini-card"><div class="card-kicker">海南 · ${state.year}</div><strong class="big-index">${rating(state.year,'hn')}</strong><span class="unit">合成体验指数 / 100</span><p style="margin-top:8px">看结构上的连接机会，不把指数误读成经济规模。</p></div>
    <div class="mini-card"><div class="card-kicker">新加坡 · ${state.year}</div><strong class="big-index">${rating(state.year,'sg')}</strong><span class="unit">合成体验指数 / 100</span><p style="margin-top:8px">同一组事件下，观察两地网络各自的变化。</p></div>
    </div><p class="caption-text">两条演示路径没有统计置信区间，不能用于推断哪座岛在 2035 年会领先。</p>`;
  if(s==='blind'){
    content=`<div class="stage-tag">别急着扩张节点，先试试搭一座桥</div><div class="two-cards">
      ${Object.entries(bridgeData).map(([key,b])=>`<div class="mini-card bridge-card"><div><div class="card-kicker">POTENTIAL BRIDGE</div><h3>${b.label}</h3><p>${b.desc}</p></div><button type="button" class="${state.bridges[key]?'on':''}" data-bridge="${key}">${state.bridges[key]?'移除桥梁':'搭起桥梁 +'}</button></div>`).join('')}</div>
    <div class="blind-insight"><strong>你可能忽略的：</strong> ${Object.values(state.bridges).some(Boolean)?'新连接出现后，网络里的合作选择增加了；但这仍不意味着合作必然发生。':'如果资源已经投入，却没有把能够互相支持的主体连接起来，最强节点也可能成为孤岛。'}</div>
    <div class="metric-grid"><div class="metric"><small>候选桥梁已加入</small><strong>${Object.values(state.bridges).filter(Boolean).length}</strong><span>/ 2</span></div><div class="metric"><small>海南2035体验指数</small><strong>${rating(2035,'hn')}</strong><span>合成演示</span></div><div class="metric"><small>新加坡2035体验指数</small><strong>${rating(2035,'sg')}</strong><span>合成演示</span></div></div><p class="caption-text">行动建议只是候选连接，不是证据充分的现实决策建议。选择是否行动，应由玩家自行判断。</p>`;
  }
  panel.innerHTML=content;
  panel.querySelectorAll('[data-event]').forEach(btn=>btn.addEventListener('click',()=>{state.event=btn.dataset.event;render();}));
  panel.querySelectorAll('[data-bridge]').forEach(btn=>btn.addEventListener('click',()=>{state.bridges[btn.dataset.bridge]=!state.bridges[btn.dataset.bridge];render();}));
  panel.querySelectorAll('[data-allocation]').forEach(input=>input.addEventListener('input',()=>{
    const name=input.dataset.allocation;
    const used=Object.entries(state.allocation).filter(([k])=>k!==name).reduce((total,[,v])=>total+v,0);
    state.allocation[name]=clamp(Number(input.value),0,Math.min(4,7-used));render();
  }));
  panel.querySelector('#year-range')?.addEventListener('input',evt=>{stop();state.year=Number(evt.target.value);render();});
  panel.querySelector('#play')?.addEventListener('click',()=>{
    if(state.playing){stop();render();return;}
    if(state.year===2035)state.year=2026;
    state.playing=true;render();
    timer=setInterval(()=>{
      if(state.year>=2035){stop();render();return;}
      state.year++;render();
    },680);
  });
}
function stop(){if(timer!==null)clearInterval(timer);timer=null;state.playing=false;}
function render(){refreshHeader();renderDetail();}
function goto(stage){
  if(!names[stage])return;
  stop();state.stage=stage;
  if(stage==='run'&&state.year===2035)state.year=2026;
  render();$('#workspace').scrollIntoView({behavior:'smooth',block:'start'});
}
async function loadEvidence(){
  try{
    const response=await fetch('./data/latest.json',{cache:'no-cache'});
    if(!response.ok)throw Error('资料未加载');
    const data=await response.json();
    if(data.project_key!=='two-islands-2035-20261030'||!Array.isArray(data.indicators))throw Error('资料标识不匹配');
    const ids=['hn-gdp-2025','sg-gdp-2025','hn-port-cargo-2025','sg-port-teu-2025'];
    $('#intel-version').textContent=`版本 ${String(data.version||'').slice(0,8)}`;
    $('#intel-data').replaceChildren();
    ids.forEach(id=>{
      const row=data.indicators.find(x=>x.id===id);
      if(!row)return;
      const wrap=document.createElement('div');wrap.className='intel-item';
      const name=document.createElement('small');name.textContent=row.label;
      const strong=document.createElement('strong');strong.textContent=`${row.value.toLocaleString('zh-CN')} ${row.unit}`;
      const a=document.createElement('a');a.textContent=`${row.period} · 查看原始来源 ↗`;
      if(typeof row.source_url==='string'&&row.source_url.startsWith('https://')){a.href=row.source_url;a.target='_blank';a.rel='noopener noreferrer';}
      wrap.append(name,strong,a);$('#intel-data').append(wrap);
    });
  }catch(e){
    $('#intel-version').textContent='暂不可读';
    $('#intel-data').innerHTML='<p class="loading">参考资料未加载。请使用 GitHub Pages 网址打开；网络不可用时仍可完成合成演示。</p>';
  }
}
function shareText(){
 const a=state.allocation;const on=Object.entries(state.bridges).filter(([,v])=>v).map(([k])=>bridgeData[k].label);
 return `双岛2035 · 我的判断卡（HTML 演示）\n观察年份：${state.year}\n所在视角：${names[state.stage][1]}\n假设事件：${events[state.event].title}\n资源投入：港航 ${a['物流']} / 产业与服务 ${a['产业']} / 人才 ${a['人才']}（上限7）\n选择的桥梁：${on.join('、')||'暂未加入'}\n海南体验指数：${rating(state.year,'hn')}；新加坡体验指数：${rating(state.year,'sg')}\n说明：以上指数完全为合成演示，不是真实预测。\n体验地址：https://zhanglingshare.github.io/huidong-simulator/hainan-singapore-2035/`;
}
function reset(){
 stop();Object.assign(state,{stage:'world',year:2026,lens:'all',event:'none',allocation:{物流:2,产业:2,人才:2},bridges:{standards:false,skills:false},selected:null,positions:{}});
 setFocus('两座岛之间的连接','点击中间的节点，看看一个局部变化会牵动哪些关系。','关系不是越多越好，关键是哪些连接一旦失效，会让其他连接也失去价值。');
 render();
}
document.querySelectorAll('[data-stage]').forEach(btn=>btn.addEventListener('click',()=>goto(btn.dataset.stage)));
document.querySelectorAll('[data-lens]').forEach(btn=>btn.addEventListener('click',()=>{state.lens=btn.dataset.lens;refreshHeader();}));
$('#next-stage').addEventListener('click',()=>goto(stages[(stages.indexOf(state.stage)+1)%stages.length]));
$('#prev-stage').addEventListener('click',()=>goto(stages[Math.max(0,stages.indexOf(state.stage)-1)]));
$('#reset-state').addEventListener('click',reset);
$('#share').addEventListener('click',async()=>{
 const text=shareText();
 try{await navigator.clipboard.writeText(text);$('#share-msg').textContent='已复制判断卡。';}
 catch{const field=document.createElement('textarea');field.value=text;field.style.width='100%';field.rows=7;$('#share-msg').replaceChildren(field);field.select();}
});
const stageFromUrl=new URLSearchParams(location.search).get('stage');
if(stageFromUrl&&names[stageFromUrl])state.stage=stageFromUrl;
render();loadEvidence();
})();
