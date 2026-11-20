/* ═══════════════════════════════════════════════════════════════
   惠东内部版 · 引擎测试套件 v01（node engine-v01.test.js）
   覆盖：初始化/确定性/值域不变量/五链转移/触发器正反例/
        冲击吸收/全流程 28 季/事件注入
   ═══════════════════════════════════════════════════════════════ */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('./engine-v01.js');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'state-machine-v01.json'), 'utf8'));

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.message)); }
}
function s0() { return E.initState(DATA); }
function deep(a, b, msg) { assert.deepStrictEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg); }
function chain(state, id) { return state.firms[id].chain; }
function ids(state) { return Object.keys(state.firms); }

console.log('引擎测试 engine-v01 · firms=' + DATA.firms.length + ' projects=' + DATA.projects.length + ' links=' + DATA.links.length + '\n');

// ═══ 1. 初始化 ═══════════════════════════════════════════
t('初始化：28 主体 / 9 项目 / 18 边 / 五要素', function () {
  const s = s0();
  assert.strictEqual(ids(s).length, 28);
  assert.strictEqual(Object.keys(s.projects).length, 9);
  assert.strictEqual(s.links.length, 18);
  E.RESOURCES.forEach(function (r) { assert.strictEqual(s.resources[r].capacity, 100); });
});
t('初始化：确定性（同 seed 两次一致）', function () {
  deep(s0(), s0());
});
t('初始化：链状态初值在定义域', function () {
  const s = s0();
  ids(s).forEach(function (id) {
    const f = chain(s, id);
    assert.ok(f.orderBook >= 0 && f.orderBook <= 100, id + ' orderBook');
    assert.ok(f.deltaOrder >= -10 && f.deltaOrder <= 10, id + ' deltaOrder');
    assert.ok(f.deliveryLag >= 1 && f.deliveryLag <= 3, id + ' lag');
    assert.ok(f.capacityUtil >= 20 && f.capacityUtil <= 98, id + ' util');
    assert.ok(f.inventory >= 0 && f.inventory <= 100, id + ' inventory');
    assert.ok(f.arDays >= 30 && f.arDays <= 180, id + ' arDays');
    assert.ok(f.cashBuffer >= 0 && f.cashBuffer <= 12, id + ' cash');
  });
});

// ═══ 2. 链1 订单-交付-回款 ═══════════════════════════════
t('链1：交付正常（lag=1）零流失，订单簿仅随新增订单变化', function () {
  const s = s0();
  const before = chain(s, 'nuclear').orderBook;
  const d = chain(s, 'nuclear').deltaOrder;
  E.tickOrder(s);
  assert.strictEqual(chain(s, 'nuclear').orderBook, before + d);
});
t('链1：交付超时 → 本季即流失，且与 lostCoef 成正比', function () {
  const a = s0(), b = s0();
  chain(a, 'nuclear').capacityUtil = 90; // → 本季 lag=2 → 流失
  chain(b, 'nuclear').capacityUtil = 90;
  a.X.lostCoef = 0.05; b.X.lostCoef = 0.15;
  const da = chain(a, 'nuclear').deltaOrder;
  E.tickOrder(a); E.tickOrder(b);
  assert.ok(chain(a, 'nuclear').orderBook < chain(a, 'nuclear').prevOrderBook + da, '高产能有流失');
  assert.ok(chain(b, 'nuclear').orderBook < chain(a, 'nuclear').orderBook, 'lostCoef 更大流失更多');
});
t('链1：产能>85 / 缺口任一成立 → deliveryLag=2', function () {
  const s = s0();
  chain(s, 'nuclear').capacityUtil = 90;
  E.tickOrder(s);
  assert.strictEqual(chain(s, 'nuclear').deliveryLag, 2);
  const s2 = s0();
  chain(s2, 'nuclear').materialGap = true;
  E.tickOrder(s2);
  assert.strictEqual(chain(s2, 'nuclear').deliveryLag, 2);
});
t('链1：回款周期长 → 现金缓冲薄', function () {
  const s = s0();
  chain(s, 'nuclear').arDays = 150;
  E.tickOrder(s);
  assert.ok(chain(s, 'nuclear').cashBuffer < 6);
});

// ═══ 3. 触发器 T1 ═══════════════════════════════════════
t('T1-4：订单未降但交付变慢 → 触发', function () {
  const s = s0();
  s.X.lostCoef = 0.02; // 流失 < 新增，订单仍升
  ids(s).forEach(function (id) { const f = chain(s, id); f.deltaOrder = 3; f.prevLag = 1; f.capacityUtil = 88; });
  E.tickOrder(s);
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T1-4'; }).run(s);
  assert.ok(r && r.msg.indexOf('交付变慢') >= 0);
});
t('T1-4：订单未降且交付正常 → 不触发', function () {
  const s = s0();
  E.tickOrder(s);
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T1-4'; }).run(s);
  assert.strictEqual(r, null);
});
t('T1-1：需求转负+库存累积 → 触发', function () {
  const s = s0();
  ids(s).forEach(function (id) { const f = chain(s, id); f.deltaOrder = -3; f.prevInventory = 10; f.inventory = 30; });
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T1-1'; }).run(s);
  assert.ok(r && r.msg.indexOf('需求衰退') >= 0);
});

// ═══ 4. 链2 项目兑现 ═══════════════════════════════════
t('链2：nuclear 投产 28 季内爬坡 → 达产 → 成熟', function () {
  const s = s0();
  for (let q = 0; q < 40; q++) E.tickProjects(s);
  const p = s.projects.nuclear;
  assert.ok(['达产', '成熟'].indexOf(p.stage) >= 0, 'stage=' + p.stage);
  assert.ok(p.rampRate > 0.9);
});
t('链2：线索项目在 60 季内至少 1 个进入状态机', function () {
  const s = s0();
  for (let q = 0; q < 60; q++) E.tickProjects(s);
  const moved = Object.keys(s.projects).filter(function (id) { return s.projects[id].stage !== '线索'; }).length;
  assert.ok(moved >= 1, 'moved=' + moved);
});
t('链2：签约停滞 4 季 → 停滞态（记录停滞于签约）+ T2-1 触发', function () {
  const s = s0();
  const p = s.projects['nuclear-om'];
  p.stage = '签约'; p.stallQ = 3;
  s.X.pTable = JSON.parse(JSON.stringify(s.X.pTable));
  Object.keys(s.X.pTable).forEach(function (k) { s.X.pTable[k].mode = 0; }); // 采样必失败 → 停滞
  E.tickProjects(s);
  assert.strictEqual(p.stage, '停滞');
  assert.strictEqual(p.stallAtStage, '签约');
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T2-1'; }).run(s);
  assert.ok(r && r.msg.indexOf('签约未开工') >= 0);
});
t('链2：签约临近限值（stallQ=3）→ T2-1 预警', function () {
  const s = s0();
  s.projects['nuclear-om'].stage = '签约';
  s.projects['nuclear-om'].stallQ = 3;
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T2-1'; }).run(s);
  assert.ok(r && r.msg.indexOf('签约未开工') >= 0);
});
t('链2：确定性（同 seed 采样一致）', function () {
  const a = s0(), b = s0();
  for (let q = 0; q < 20; q++) { E.tickProjects(a); E.tickProjects(b); }
  deep(a.projects, b.projects);
});

// ═══ 5. 链3 约束-瓶颈（四证联合）══════════════════════
function setConstraint(s, res, slack, meanDelta, meanLag) {
  s.resources[res].allocated = 100 - slack;
  ids(s).forEach(function (id) { const f = chain(s, id); f.deltaOrder = meanDelta; f.deliveryLag = meanLag; f.claimed = {}; f.claimed[res] = true; });
}
t('链3：声称缺但需求未升 → T3-1（非绑定）', function () {
  const s = s0();
  setConstraint(s, 'talent', 10, -2, 1);
  const r = E.diagnoseConstraints(s);
  assert.ok(r.some(function (x) { return x.id === 'T3-1' && x.resource === 'talent'; }));
});
t('链3：四证齐全 → T3-2（绑定+杠杆建议）', function () {
  const s = s0();
  setConstraint(s, 'land', 10, 3, 2);
  const r = E.diagnoseConstraints(s);
  const hit = r.find(function (x) { return x.id === 'T3-2' && x.resource === 'land'; });
  assert.ok(hit && hit.lever.indexOf('用地') >= 0);
});
t('链3：四证缺一不触发（slack≥15 / 交付正常 / 无人声称）', function () {
  const s1 = s0(); setConstraint(s1, 'land', 20, 3, 2);
  assert.strictEqual(E.diagnoseConstraints(s1).length, 0);
  const s2 = s0(); setConstraint(s2, 'land', 10, 3, 1);
  assert.strictEqual(E.diagnoseConstraints(s2).length, 0);
  const s3 = s0(); s3.resources.land.allocated = 90;
  ids(s3).forEach(function (id) { const f = chain(s3, id); f.deltaOrder = 3; f.deliveryLag = 2; });
  assert.strictEqual(E.diagnoseConstraints(s3).length, 0);
});

// ═══ 6. 链4 交易-替代 ═══════════════════════════════════
t('链4：alt 观测公式 = clamp(n/3)·(1−cost)/time', function () {
  assert.ok(Math.abs(E.altIndexOf({ alternates: 2, switchCost: 0.4, switchTime: 2 }) - 0.2) < 1e-9);
  assert.ok(Math.abs(E.altIndexOf({ alternates: 3, switchCost: 0, switchTime: 1 }) - 1.0) < 1e-9);
});
t('链4：待核槽 alt=null → 中性吸收 0.3（显性未知）', function () {
  const l = s0().links[0];
  assert.strictEqual(E.altIndexOf(l), null);
  assert.ok(Math.abs(E.absorbedAlt(l) - 0.3) < 1e-9);
});
t('链4：share 待核 → strength 代理权重', function () {
  const l = s0().links[0];
  assert.ok(Math.abs(E.edgeWeight(l) - l.strength) < 1e-9);
  assert.ok(Math.abs(E.edgeWeight({ share: 0.3, strength: 0.9 }) - 0.3) < 1e-9);
});
t('链4：冲击传播两阶、效应≤源、高 alt 吸收', function () {
  const s = s0();
  const eff = E.propagateShock(s, 'nuclear', 0.5);
  assert.ok(Object.keys(eff).length > 1, '有传导');
  Object.keys(eff).forEach(function (id) { assert.ok(eff[id] <= 0.5 + 1e-9); });
  // 高 alt：注入 alternates=3, cost=0, time=1 → 吸收全
  const s2 = s0();
  s2.links.forEach(function (l) { l.alternates = 3; l.switchCost = 0; l.switchTime = 1; });
  const eff2 = E.propagateShock(s2, 'nuclear', 0.5);
  assert.strictEqual(Object.keys(eff2).length, 1, '全部吸收');
});
t('链4：低 alt（0 替代者）→ 传导更强', function () {
  const s = s0();
  const low = E.propagateShock(s, 'nuclear', 0.5);
  const s2 = s0();
  s2.links.forEach(function (l) { l.alternates = 0; l.switchCost = 1; l.switchTime = 8; });
  const none = E.propagateShock(s2, 'nuclear', 0.5);
  const sum = function (e) { return Object.keys(e).reduce(function (a, k) { return a + e[k]; }, 0); };
  assert.ok(sum(none) > sum(low));
});
t('链4：事件注入 新建/终止/观测升级', function () {
  const s = s0();
  E.applyLinkEvents(s, [
    { action: 'new', from: 'nuclear', to: 'logistics', type: 'service', strength: 0.5 },
    { action: 'end', from: 'nuclear', to: 'energy-equip', q: 3 },
    { action: 'observe', id: 0, share: 0.3, alternates: 2 }
  ]);
  assert.strictEqual(s.links.length, 19);
  assert.strictEqual(s.links.filter(function (l) { return l.from === 'nuclear' && l.to === 'energy-equip'; })[0].endQ, 3);
  assert.strictEqual(s.links[0].share, 0.3);
  assert.strictEqual(s.links[0].observed, true);
});

// ═══ 7. 链5 本地贡献 ═══════════════════════════════════
t('链5：待核 → IMP 代理并显性标注', function () {
  const s = s0();
  const f = s.firms.nuclear;
  const r = E.retentionIndexOf(f.chain, f.base, [0.4, 0.3, 0.3]);
  assert.strictEqual(r.proxy, true);
  assert.ok(Math.abs(r.index - f.base.sixDim.values[5] / 100) < 1e-9);
});
t('链5：观测齐全 → 加权公式', function () {
  const s = s0();
  const f = s.firms.nuclear;
  f.chain.localProcureRate = 0.5; f.chain.localLaborRate = 0.4; f.chain.localServiceRate = 0.6;
  const r = E.retentionIndexOf(f.chain, f.base, [0.4, 0.3, 0.3]);
  assert.strictEqual(r.proxy, false);
  assert.ok(Math.abs(r.index - (0.4 * 0.5 + 0.3 * 0.4 + 0.3 * 0.6)) < 1e-9);
});

// ═══ 8. 触发器 T4/T5 ═══════════════════════════════════
t('T4-1：单点依赖（share>0.5 且 alternates=0）→ 触发', function () {
  const s = s0();
  s.links[0].share = 0.6; s.links[0].alternates = 0;
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T4-1'; }).run(s);
  assert.ok(r && r.msg.indexOf('单点依赖') >= 0);
});
t('T4-2：替代昂贵（切换>4季 且成本>0.6）→ 触发', function () {
  const s = s0();
  s.links[0].switchTime = 5; s.links[0].switchCost = 0.7;
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T4-2'; }).run(s);
  assert.ok(r && r.msg.indexOf('替代昂贵') >= 0);
});
t('T5-2：规划产值挂未投产项目 → 触发', function () {
  const s = s0();
  s.projects['nuclear-om'].base.claimedOutput = 50;
  const r = E.TRIGGERS.find(function (x) { return x.id === 'T5-2'; }).run(s);
  assert.ok(r && r.msg.indexOf('口径污染') >= 0);
});

// ═══ 9. 全流程 tickQuarter ═════════════════════════════
t('全流程：28 季无 NaN、值域合法、history 完整、信号带三元组', function () {
  const s = s0();
  for (let q = 0; q < 28; q++) E.tickQuarter(s);
  assert.strictEqual(s.history.length, 28);
  ids(s).forEach(function (id) {
    const f = chain(s, id);
    [f.orderBook, f.inventory, f.cashBuffer].forEach(function (v) { assert.ok(!Number.isNaN(v) && v >= 0 && v <= 100, id + ' NaN/range'); });
    assert.ok(!Number.isNaN(f.deliveryLag) && f.deliveryLag >= 1 && f.deliveryLag <= 3);
  });
  s.history.forEach(function (h) {
    assert.ok(Array.isArray(h.signals));
    h.signals.forEach(function (sig) { assert.ok(typeof sig === 'string'); });
  });
});
t('全流程：确定性（同 seed 同输入 28 季一致）', function () {
  const a = s0(), b = s0();
  for (let q = 0; q < 28; q++) { E.tickQuarter(a, { orderDrift: 2 }); E.tickQuarter(b, { orderDrift: 2 }); }
  deep(a, b);
});
t('全流程：台风注入 → 台风风险主体订单受压', function () {
  const s = s0();
  const before = chain(s, 'coastal-scenic').deltaOrder;
  E.tickQuarter(s, { typhoon: true });
  assert.ok(chain(s, 'coastal-scenic').deltaOrder <= before - 4);
  s.X.typhoon = false;
  E.tickQuarter(s);
  assert.ok(chain(s, 'coastal-scenic').deltaOrder <= before - 4 + 10);
});
t('全流程：冲击注入 → EVT-SHOCK 信号 + 效应写入', function () {
  const s = s0();
  E.tickQuarter(s, { shocks: [{ source: 'nuclear', shock: 0.5 }] });
  assert.ok(s.signals.some(function (x) { return x.id === 'EVT-SHOCK'; }));
  assert.ok(Object.keys(s.lastEffects).length > 0);
});
t('全流程：订单漂移注入 → 订单簿变化方向一致', function () {
  const s = s0();
  const before = meanOf(ids(s).map(function (id) { return chain(s, id).orderBook; }));
  E.tickQuarter(s, { orderDrift: 5 });
  const after = meanOf(ids(s).map(function (id) { return chain(s, id).orderBook; }));
  assert.ok(after > before);
});
t('触发器输出三元组：observedAt/direction/quality 齐全', function () {
  const s = s0();
  ids(s).forEach(function (id) { const f = chain(s, id); f.deltaOrder = -3; f.prevInventory = 10; f.inventory = 40; });
  E.tickQuarter(s);
  const sig = s.signals.find(function (x) { return x.id === 'T1-1'; });
  assert.ok(sig && sig.trio.observedAt === 1 && typeof sig.trio.direction === 'string' && typeof sig.trio.quality === 'string');
});
function meanOf(arr) { return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length; }

// ═══ 10. 基准 JSON 联查 ════════════════════════════════
t('联查：引擎初值只依赖 JSON（不依赖渲染层）', function () {
  const s = s0();
  ids(s).forEach(function (id) {
    assert.ok(s.firms[id].base.sixDim.values.length === 6);
    assert.strictEqual(typeof s.firms[id].base.blood, 'string');
  });
});
t('联查：边端点全部在主体池', function () {
  const s = s0();
  const pool = ids(s);
  s.links.forEach(function (l) {
    assert.ok(pool.indexOf(l.from) >= 0 && pool.indexOf(l.to) >= 0, l.from + '→' + l.to);
  });
});

console.log('\n════════ 结果：' + pass + ' 通过 / ' + fail + ' 失败 ════════');
process.exit(fail ? 1 : 0);
