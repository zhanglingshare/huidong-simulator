/* 惠东产业风洞 · 内部版 lab.js — 七工作区渲染与交互 */
(function () {
  'use strict';
  const D = window.HD_INTERNAL;
  if (!D) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── 页面切换 ── */
  const pages = ['home', 'mission', 'data', 'survey', 'models', 'wind', 'archive'];
  function go(page) {
    pages.forEach(p => {
      const stage = $(`[data-stage="${p}"]`);
      if (stage) stage.hidden = p !== page;
    });
    document.querySelectorAll('[data-page]').forEach(b => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-page]');
    if (nav) { go(nav.dataset.page); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) go(jump.dataset.jump);
  });

  /* ── 时钟 ── */
  function tick() {
    const n = new Date();
    $('#clock').textContent = n.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);

  /* ════════ 00 研究总览 ════════ */
  function renderHome() {
    const typeMeta = {
      '提醒': { cls: 'remind', color: '#6ce0f1' },
      '预警': { cls: 'warn', color: '#ff7a87' },
      '达标': { cls: 'goal', color: '#ffbe6d' }
    };
    $('#deskCards').innerHTML = D.cards.map(c => {
      const m = typeMeta[c.type];
      return `<div class="desk-card ${m.cls}">
        <div class="head"><b><span class="t-ico" style="color:${m.color}">${c.icon}</span>${c.title}</b><span class="when">${c.when}</span></div>
        <p>${esc(c.body)}</p></div>`;
    }).join('');

    const gdp = D.history.gdp.values;
    const growth = D.history.growth.values;
    $('#homeStats').innerHTML = [
      { n: '861.25', u: '亿元', l: '2025 GDP', s: 'A 级 · 统计公报', c: '' },
      { n: '11.5·35.5·53.0', u: '', l: '2025 三产结构', s: 'A 级 · 修订口径', c: 'gold' },
      { n: '53.0%', u: '', l: '服务业占比 · 全市第 2', s: 'A 级 · 七县区公报', c: 'good' },
      { n: '6.3', u: '亿元', l: '红霞台风损失', s: 'B 级 · 报道核算', c: 'bad' }
    ].map(k => `<div class="tile"><small>${k.l}</small><strong class="big ${k.c}">${k.n}<span style="font-size:14px">${k.u}</span></strong><p>${k.s}</p></div>`).join('');

    $('#counterEvidence').innerHTML = `
      <div class="ev-item"><span class="tag model">C</span>若能源设备与设计本就是低频定制（一年几单），本地建能力不划算，「补配套」论站不住——先拿到订单频次数据再排行动。</div>
      <div class="ev-item"><span class="tag model">C</span>若客户指定县外机构（认可权不在本地），补供给没用，问题变成「帮本地机构拿认可」。</div>
      <div class="ev-item"><span class="tag real">A</span>大亚湾 2025 年因石化周期几乎零增长——若能源产值波动远大于预期留存收益，押注配套的收益被波动吃掉。</div>`;

    $('#earlySignals').innerHTML = `
      <div class="ev-item"><b style="color:#6ce0f1">1 个月内</b>：能源企业采购负责人访谈落地，拿到「检测/设计本地承接比例」第一手数字。</div>
      <div class="ev-item"><b style="color:#6ce0f1">1 个季度内</b>：本地机构资质申报数、与客户的第一份合同是否签下。</div>
      <div class="ev-item"><b style="color:#6ce0f1">1 年内</b>：能源增加值增速与本地生产性服务业增速是否同向。</div>`;
  }

  /* ════════ 01 研究任务 ════════ */
  function renderMission() {
    $('#missionCards').innerHTML = D.missions.map((m, i) => `
      <div class="card mission-card">
        <div class="m-id">选项 ${String.fromCharCode(65 + i)}</div>
        <h4>${esc(m.t)}</h4>
        <p>${esc(m.d)}</p>
        <div class="m-meta"><b>成本：</b>${esc(m.cost)}<br><b>风险：</b>${esc(m.risk)}</div>
      </div>`).join('');
  }

  /* ════════ 02 数据中心 ════════ */
  function renderData() {
    const H = D.history;
    const gdp = H.gdp.values, growth = H.growth.values, years = H.years;
    const p1 = H.p1.values, p2 = H.p2.values, p3 = H.p3.values;
    const gdpMax = 900, gMin = 600;
    const gMax = 12;

    $('#dataStats').innerHTML = [
      { n: '861.25', u: '亿元', l: '2025 GDP（+4.0%）', s: 'A 级' },
      { n: '1005.45', u: '亿元', l: '博罗 · 广东首个千亿县', s: 'A 级 · 对照' },
      { n: '53.0%', u: '', l: '惠东三产占比', s: 'A 级 · 仅次惠城' },
      { n: '1756', u: '万人次', l: '2024 游客峰值', s: 'A 级' }
    ].map(k => `<div class="tile"><small>${k.l}</small><strong class="big">${k.n}<span style="font-size:14px">${k.u}</span></strong><p>${k.s}</p></div>`).join('');

    // GDP 双轴 SVG
    let svg = `<g transform="translate(54,16)">`;
    const W = 560, Hgt = 250;
    const yG = v => 250 - (v - gMin) / (gdpMax - gMin) * 250;
    const x = i => 16 + i * (W - 16) / (years.length - 1);
    const yGrow = v => 250 - v / gMax * 250;
    for (let t = 0; t <= 4; t++) {
      const yy = yG(gMin + t * (gdpMax - gMin) / 4);
      svg += `<line x1="16" y1="${yy}" x2="${W}" y2="${yy}" stroke="rgba(158,190,232,.12)" stroke-dasharray="3 4"/>
        <text x="4" y="${yy + 3}" class="svg-label" text-anchor="end">${gMin + t * (gdpMax - gMin) / 4}</text>`;
    }
    svg += `<text x="4" y="14" class="svg-label" text-anchor="end">增速%</text>`;
    for (let t = 0; t <= 3; t++) {
      svg += `<text x="${W + 40}" y="${yGrow(t * 4) + 3}" class="svg-label">${t * 4}</text>`;
    }
    svg += years.map((yr, i) => `<text x="${x(i)}" y="266" class="svg-year" text-anchor="middle">${yr}</text>`).join('');
    svg += `<path d="M${years.map((_, i) => `${x(i)},${yG(gdp[i])}`).join(' L')}" fill="none" stroke="#6ce0f1" stroke-width="2.4"/>`;
    svg += years.map((_, i) => `<circle cx="${x(i)}" cy="${yG(gdp[i])}" r="3.4" fill="#6ce0f1"/>`).join('');
    svg += `<path d="M${years.map((_, i) => `${x(i)},${yGrow(growth[i])}`).join(' L')}" fill="none" stroke="#ffbe6d" stroke-width="2" stroke-dasharray="5 4"/>`;
    svg += years.map((_, i) => `<circle cx="${x(i)}" cy="${yGrow(growth[i])}" r="3" fill="#ffbe6d"/>`).join('');
    svg += `</g>`;
    $('#gdpChart').innerHTML = svg;

    // 三产结构堆叠
    let svg2 = `<g transform="translate(46,14)">`;
    const tot = years.map((_, i) => p1[i] + p2[i] + p3[i]);
    const barW = 44;
    years.forEach((yr, i) => {
      const cx = 30 + i * (520 - 30) / (years.length - 1) - barW / 2;
      const h1 = p1[i] / tot[i] * 230, h2 = p2[i] / tot[i] * 230, h3 = p3[i] / tot[i] * 230;
      const yTop = 240 - (h1 + h2 + h3);
      svg2 += `<rect x="${cx}" y="${yTop}" width="${barW}" height="${h1}" fill="#64dcbb" rx="2"/>
        <rect x="${cx}" y="${yTop + h1}" width="${barW}" height="${h2}" fill="#4e9ef9"/>
        <rect x="${cx}" y="${yTop + h1 + h2}" width="${barW}" height="${h3}" fill="#eab475" rx="2"/>
        <text x="${cx + barW / 2}" y="${262}" class="svg-year" text-anchor="middle">${yr}</text>`;
      svg2 += `<text x="${cx + barW / 2}" y="${yTop - 6}" class="svg-label" text-anchor="middle">${(p3[i] / tot[i] * 100).toFixed(0)}</text>`;
    });
    svg2 += `</g>`;
    $('#structChart').innerHTML = svg2;

    // 七县区条形
    const R = D.region.rows.slice().sort((a, b) => b.gdp - a.gdp);
    let svg3 = `<g transform="translate(10,10)">`;
    R.forEach((r, i) => {
      const yy = 22 + i * 42;
      const w = r.gdp / 1250 * 430;
      const hd = r.name === '惠东县';
      svg3 += `<text x="96" y="${yy + 13}" class="svg-label" text-anchor="end" style="${hd ? 'fill:#ffbe6d;font-weight:700' : ''}">${r.name}</text>
        <rect x="104" y="${yy}" width="${w}" height="20" rx="4" fill="${hd ? '#ffbe6d' : 'url(#barGrad)'}"/>
        <text x="${104 + w + 8}" y="${yy + 14}" class="svg-label">${r.gdp}亿 · +${r.g}%</text>`;
    });
    svg3 += `<defs><linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#49a5ff"/><stop offset="1" stop-color="#6ce0f1"/></linearGradient></defs></g>`;
    $('#regionChart').innerHTML = svg3;
    $('#caliberNote').textContent = `口径：${D.region.source}。总量按现价、增速按不变价；历史数据已按五经普修订。大亚湾 2025 年增速 2.3% 为石化检修与价格下行双重冲击所致——单一支柱的代价。`;

    $('#eventTable').innerHTML = D.events.map(e => `
      <div class="table-row"><span class="ev-time">${esc(e.t)}</span>
      <span class="ev-text">${esc(e.ev)}<span class="tag ${e.blood === 'A' ? 'real' : e.blood === 'B' ? 'model' : 'warn'}" style="margin-left:8px">${e.blood}</span><br><span class="micro">${esc(e.src)}</span></span></div>`).join('');
  }

  /* ════════ 03 社会调查 ════════ */
  function renderSurvey() {
    $('#callCards').innerHTML = D.calls.map((c, i) => `
      <div class="card call-card">
        <div class="m-id">电话 ${i + 1}</div>
        <div class="who">${esc(c.who)}</div>
        <div class="q">「${esc(c.q)}」</div>
        <div class="sig">信号：${esc(c.signal)}</div>
      </div>`).join('');
  }

  /* ════════ 04 多模型实验室 ════════ */
  let curHypo = D.hypotheses[0];
  function renderModels() {
    $('#hypoTabs').innerHTML = D.hypotheses.map(h => `
      <button class="${h.id === curHypo.id ? 'active' : ''}" data-hypo="${h.id}">${esc(h.name)} · ${esc(h.claim.slice(0, 18))}…</button>`).join('');
    drawHypo();
  }
  function drawHypo() {
    $('#hypoPath').innerHTML = `<div style="font-size:13px;color:#c5dded;margin-bottom:12px">「${esc(curHypo.claim)}」</div>` +
      curHypo.path.map((p, i) => `<div class="path-step"><b>${i + 1}</b>${esc(p)}</div>`).join('');
    $('#hypoEvidence').innerHTML =
      `<div class="ev-item" style="color:#d7efe6">证据</div>` +
      curHypo.evidence.map(e => `<div class="ev-item">${esc(e)}</div>`).join('') +
      `<div class="ev-item" style="color:#ffe3c2">最强反例</div>` +
      `<div class="ev-item">${esc(curHypo.counter)}</div>`;
    $('#hypoAction').innerHTML = `<div class="act-box">${esc(curHypo.action)}</div>
      <p class="footnote">同一组事实，切换解释后行动就换方向——这就是为什么开会要带两套模型，而不是一套。</p>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-hypo]');
    if (!b) return;
    curHypo = D.hypotheses.find(h => h.id === b.dataset.hypo);
    renderModels();
  });

  /* ════════ 05 情景风洞 ════════ */
  let curScen = D.scenarios.list[0];
  function renderWind() {
    $('#scenTabs').innerHTML = D.scenarios.list.map(s => `
      <button class="${s.id === curScen.id ? 'active' : ''}" data-scen="${s.id}">${esc(s.name)}</button>`).join('');
    drawWind();
  }
  function drawWind() {
    const target = D.scenarios.target;
    $('#windStats').innerHTML = [
      { n: curScen.p50, u: '亿元', l: 'p50 中位情景', s: 'C 级校准' },
      { n: `${curScen.p10}–${curScen.p90}`, u: '亿元', l: 'p10–p90 区间', s: 'C 级校准' },
      { n: curScen.hit + '%', u: '', l: '命中 1200 亿目标', s: 'C 级校准', c: curScen.hit >= 60 ? 'good' : curScen.hit <= 35 ? 'bad' : 'gold' },
      { n: '2032', u: '1:5:4', l: '三产结构方向', s: '罗盘 · 非硬指标', c: '' }
    ].map(k => `<div class="tile"><small>${k.l}</small><strong class="big ${k.c}">${k.n}<span style="font-size:13px">${k.u}</span></strong><p>${k.s}</p></div>`).join('');

    // fan：当前情景区间 + 目标线 + 全部情景背景
    const min = 1000, max = 1400;
    const px = v => 40 + (v - min) / (max - min) * 560;
    const yy = 100;
    let svg = `<g>`;
    D.scenarios.list.forEach((s, i) => {
      const y = 40 + i * 40;
      const dim = s.id === curScen.id ? 1 : 0.32;
      svg += `<line x1="${px(s.p10)}" y1="${y}" x2="${px(s.p90)}" y2="${y}" stroke="rgba(108,224,241,${dim})" stroke-width="${s.id === curScen.id ? 9 : 5}" stroke-linecap="round"/>
        <circle cx="${px(s.p50)}" cy="${y}" r="${s.id === curScen.id ? 6 : 4}" fill="${s.id === curScen.id ? '#ffbe6d' : '#6ce0f1'}"/>
        <text x="8" y="${y + 4}" class="svg-label">${s.name}</text>`;
    });
    svg += `<line x1="${px(target)}" y1="12" x2="${px(target)}" y2="180" stroke="#ffbe6d" stroke-width="1.5" stroke-dasharray="6 5"/>
      <text x="${px(target) + 6}" y="20" class="svg-label" fill="#ffbe6d">1200 亿目标</text>
      <text x="${px(target) + 6}" y="34" class="svg-label">命中率 ${curScen.hit}%</text></g>`;
    $('#fanChart').innerHTML = svg;

    // tornado
    const t = D.scenarios.tornado.slice().sort((a, b) => Math.abs(a.lo) - Math.abs(b.lo));
    const maxV = 62;
    $('#tornadoChart').innerHTML = t.map(row => {
      const ml = Math.abs(row.lo) / maxV * 50, pl = row.hi / maxV * 50;
      return `<div class="torn-row"><b>${esc(row.var)}</b>
        <div class="track"><div class="minus" style="width:${ml}%"></div><div class="plus" style="width:${pl}%"></div></div>
        <b>${row.lo} / +${row.hi}</b></div>`;
    }).join('');

    // 恢复曲线
    const rec = D.typhoon.recovery;
    let svg4 = `<g transform="translate(44,12)">`;
    const rx = i => 20 + i * (540 - 20) / (rec.months.length - 1);
    const ry = v => 180 - v / 100 * 180;
    for (let t2 = 0; t2 <= 4; t2++) {
      const yy2 = ry(t2 * 25);
      svg4 += `<line x1="20" y1="${yy2}" x2="540" y2="${yy2}" stroke="rgba(158,190,232,.12)" stroke-dasharray="3 4"/>
        <text x="4" y="${yy2 + 3}" class="svg-label" text-anchor="end">${t2 * 25}%</text>`;
    }
    svg4 += rec.months.map((m, i) => `<text x="${rx(i)}" y="198" class="svg-year" text-anchor="middle">M${m}</text>`).join('');
    svg4 += `<path d="M${rec.months.map((_, i) => `${rx(i)},${ry(rec.recover[i])}`).join(' L')}" fill="none" stroke="#ffbe6d" stroke-width="2.4"/>`;
    svg4 += rec.months.map((_, i) => `<circle cx="${rx(i)}" cy="${ry(rec.recover[i])}" r="3.2" fill="#ffbe6d"/>`).join('');
    svg4 += `<circle cx="${rx(3)}" cy="${ry(72)}" r="5" fill="none" stroke="#6ce0f1" stroke-width="1.6"/>
      <text x="${rx(3)}" y="${ry(72) - 12}" class="svg-label" text-anchor="middle" fill="#6ce0f1">M3 · 72%</text></g>`;
    $('#recoverChart').innerHTML = svg4;

    // 行动跟踪
    $('#actionPlan').innerHTML = `
      <div class="path-step"><b>1</b>本周：约能源企业采购负责人一次访谈（30 分钟，只问检测/设计/维护三笔账）。</div>
      <div class="path-step"><b>2</b>两周内：列出本地可承接机构清单与资质缺口，形成一页纸交承办科室。</div>
      <div class="path-step"><b>3</b>下季度初：若第一份本地检测合同签下 → 继续推；若连续两月零进展 → 改推「帮本地机构拿客户认可」，不硬撑。</div>
      <p class="footnote">行动筛选原则：模型里最敏感的变量，还要经过权限、成本和时间三道筛，才能变成行动。敏感不等于可行动。</p>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-scen]');
    if (!b) return;
    curScen = D.scenarios.list.find(s => s.id === b.dataset.scen);
    renderWind();
  });

  /* ════════ 06 研究档案：判断账本 ════════ */
  const LEDGER_KEY = 'hd_internal_ledger';
  function readLedger() {
    try { const l = JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch { return []; }
  }
  function writeLedger(list) { try { localStorage.setItem(LEDGER_KEY, JSON.stringify(list)); } catch {} }
  function renderLedger() {
    const list = readLedger().slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
    $('#ledgerList').innerHTML = list.length ? list.map((j, i) => {
      const v = verdictBadge(j);
      const due = j.date && new Date(j.date) <= new Date();
      return `<div class="ledger-item">
        <div class="l-head"><span class="l-judge">${esc(j.judge)}</span>${v}</div>
        <div class="l-meta">预付于 ${j.at} · 回看 ${esc(j.date)}${due ? ' · <span style="color:#ffbe6d">已到期</span>' : ''}</div>
        ${j.why ? `<div class="l-why">当时理由：${esc(j.why)}</div>` : ''}
        <div class="l-actions">
          <button class="tiny-btn" data-verdict="done" data-i="${i}">方向✓机制✓</button>
          <button class="tiny-btn" data-verdict="mech" data-i="${i}">方向✓机制✗</button>
          <button class="tiny-btn" data-verdict="wrong" data-i="${i}">判断失误</button>
          <button class="tiny-btn" data-verdict="unknown" data-i="${i}">无法裁定</button>
          <button class="tiny-btn" data-del="${i}" style="border-color:rgba(255,122,135,.3);color:#ff7a87">删除</button>
        </div>
      </div>`;
    }).join('') : `<div class="empty-hint">账本还是空的。<br>写下第一条判断——你倾向什么、为什么、先看哪个信号、哪天回看。<br>判断的价值不在于「准」，在于「可回看」。</div>`;
  }
  function verdictBadge(j) {
    if (!j.verdict) return '';
    const map = {
      done: ['方向✓ 机制✓', 'verdict-done'],
      mech: ['方向✓ 机制✗', 'verdict-mech'],
      wrong: ['判断失误', 'verdict-wrong'],
      unknown: ['无法裁定', 'verdict-unknown']
    };
    const m = map[j.verdict];
    return m ? `<span class="ledger-verdict ${m[1]}">${m[0]}</span>` : '';
  }
  $('#saveJudge').addEventListener('click', () => {
    const judge = $('#judgeText').value.trim();
    if (!judge) { $('#judgeText').focus(); return; }
    const list = readLedger();
    list.push({
      judge,
      why: $('#judgeWhy').value.trim(),
      date: $('#judgeDate').value.trim() || '未定',
      at: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      verdict: ''
    });
    writeLedger(list);
    $('#judgeText').value = ''; $('#judgeWhy').value = ''; $('#judgeDate').value = '';
    renderLedger();
  });
  document.addEventListener('click', e => {
    const v = e.target.closest('[data-verdict]');
    if (v) {
      const list = readLedger();
      const item = list.sort((a, b) => String(a.date).localeCompare(String(b.date)))[Number(v.dataset.i)];
      if (!item) return;
      item.verdict = v.dataset.verdict;
      writeLedger(list);
      renderLedger();
      return;
    }
    const del = e.target.closest('[data-del]');
    if (del) {
      const sorted = readLedger().slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
      sorted.splice(Number(del.dataset.i), 1);
      writeLedger(sorted);
      renderLedger();
    }
  });

  /* ── 启动 ── */
  renderHome();
  renderMission();
  renderData();
  renderSurvey();
  renderModels();
  renderWind();
  renderLedger();
  go('home');
})();
