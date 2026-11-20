/* ═══════════════════════════════════════════════════════════════
   惠东内部版 · 五链状态机引擎 v01（P1，未挂渲染）
   设计底稿：惠东内部版-状态机与变量血缘设计底稿-2026-11-20
   数据层：state-machine-v01.json

   纪律：
   · 确定性：全部用 hashId 派生，无 Math.random，同输入必同输出
   · 无观测输入不凭空造数：链状态初值=六维先验映射（lineage S），
     变化只来自注入的 X（外部条件）或关系事件
   · 待核槽（null）显性处理：回退到标注 lineage 的中性先验，绝不伪装观测
   · 未观测 ≠ 不存在；strength（先验关联）≠ share（真实份额）
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── 工具 ──────────────────────────────────────────────
  function hashId(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 100003; return h; }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function rng01(seed) { return (hashId(String(seed)) % 1000) / 1000; }
  function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

  // ── 常量 ──────────────────────────────────────────────
  var RESOURCES = ['land', 'energy', 'capital', 'talent', 'platform'];
  var STAGES = ['线索', '意向', '签约', '开工', '建设', '设备', '投产', '达产', '成熟', '停滞', '退出'];
  var STAGE_NEXT = { '线索': '意向', '意向': '签约', '签约': '开工', '开工': '建设', '建设': '设备', '设备': '投产' };
  var STALL_LIMIT = { '签约': 4, '开工': 3, '建设': 6, '设备': 4, '意向': 4 };
  var LEVER_MAP = { land: '用地指标/闲置流转', energy: '绿电接入/能耗指标', capital: '贴息/担保', talent: '培训/通勤配套', platform: '载体/检测/审批提速' };
  // 项目类型 → pTable 键（线索项目按赛道映射）
  var PROJECT_TYPE = {
    nuclear: 'energy', 'nuclear-om': 'energy', 'om-wind': 'energy', 'wind-solar': 'energy',
    'marine-bio': 'manufacturing', 'shoe-brand': 'manufacturing', 'prepared-dish': 'agriculture',
    'coastal-premium': 'tourism', 'agri-brand': 'agriculture'
  };

  // ── 初始化 ────────────────────────────────────────────
  // 六维先验 → 链状态初值。全部 lineage S（先验映射，非观测）。
  function initFirmChain(f) {
    var v = f.sixDim.values, h = hashId(f.id);
    return {
      // 链1 订单-交付-回款
      orderBook: clamp(50 + Math.round(v[0] * 0.2) + h % 9, 10, 100),   // S
      deltaOrder: clamp(Math.round((v[1] - 50) / 5), -10, 10),         // S
      deliveryLag: 1,                                                  // S 先验=正常
      capacityUtil: clamp(45 + Math.round(v[0] * 0.4) + h % 7, 20, 98),// S
      inventory: clamp(40 + h % 20, 0, 100),                           // S
      arDays: 45 + h % 46,                                             // S [45,90]
      cashBuffer: 6,                                                   // S 先验=6月
      materialGap: false, laborGap: false,                             // S 先验=无缺口
      prevOrderBook: 0, prevLag: 1, prevInventory: 0,                  // 触发器差分用
      // 链3 声称缺要素（外部输入，默认空）
      claimed: {},
      // 链5 本地贡献（待核，null）
      localProcureRate: null, localLaborRate: null, localServiceRate: null
    };
  }

  function initState(data, opts) {
    opts = opts || {};
    var firms = {}, projects = {};
    data.firms.forEach(function (f) { firms[f.id] = { base: f, chain: initFirmChain(f) }; });
    data.projects.forEach(function (p) {
      projects[p.id] = {
        base: p,
        stage: p.stage,
        stageQ: p.stageQ,
        stallQ: 0,
        stallAtStage: null,
        rampRate: p.rampRate,
        settled: false
      };
    });
    return {
      version: 'engine-v01',
      q: 0,
      seed: opts.seed || 'huidong-engine-v01',
      firms: firms,
      projects: projects,
      links: data.links.map(function (l) {
        return {
          from: l.from, to: l.to, type: l.type,
          strength: l.strength, strengthLineage: l.strengthLineage,
          share: l.share, alternates: l.alternates,
          switchTime: l.switchTime, switchCost: l.switchCost,
          startQ: l.startQ, endQ: l.endQ,
          status: l.status, observed: l.observed
        };
      }),
      resources: JSON.parse(JSON.stringify(data.resources)),
      system: data.system,
      scenarios: data.scenarios,
      X: {
        lostCoef: data.scenarios.lostCoef.mode,
        deliveryTolerance: data.scenarios.deliveryTolerance.value,
        orderDrift: 0,      // 外部订单漂移/季（默认 0=无观测变化）
        typhoon: false,     // 台风冲击档
        pTable: data.scenarios.pTable,
        retentionWeights: data.scenarios.retentionWeights
      },
      signals: [],
      history: [],
      lastEffects: {}
    };
  }

  // ── 链1 · 订单-交付-回款 ──────────────────────────────
  function tickOrder(state) {
    var X = state.X;
    Object.keys(state.firms).forEach(function (id) {
      var f = state.firms[id].chain;
      // 记录差分基线（触发器用）
      f.prevOrderBook = f.orderBook; f.prevLag = f.deliveryLag; f.prevInventory = f.inventory;
      // 外部订单漂移（默认 0）+ 台风冲击（X 情景）
      if (X.orderDrift !== 0) f.deltaOrder = clamp(f.deltaOrder + X.orderDrift, -10, 10);
      if (X.typhoon && state.firms[id].base.risks.indexOf('台风季节性') >= 0) {
        f.deltaOrder = clamp(f.deltaOrder - 4, -10, 10);
      }
      // 交付周期：本季瓶颈 → 本季交付即变慢（先于流失计算）
      f.deliveryLag = 1 + Math.max(f.capacityUtil > 85 ? 1 : 0, f.materialGap ? 1 : 0, f.laborGap ? 1 : 0);
      // 交付超时 → 订单流失
      var lag = f.deliveryLag, tolerance = X.deliveryTolerance;
      var lost = lag > tolerance ? Math.round(f.orderBook * X.lostCoef * (lag - tolerance)) : 0;
      // 订单簿 = 存量 + 新增 − 流失；交付跟新增订单走
      f.orderBook = clamp(f.orderBook + f.deltaOrder - lost, 0, 100);
      // 库存：订单减少 → 积压上升；订单增加 → 交付消化
      f.inventory = clamp(f.inventory + Math.max(0, -f.deltaOrder) - Math.min(f.inventory, Math.max(0, f.deltaOrder) * 0.5), 0, 100);
      // 回款 → 现金缓冲
      f.cashBuffer = clamp(12 - Math.round((f.arDays - 30) / 12), 0, 12);
    });
  }

  // ── 链2 · 项目兑现（状态机，确定性采样）───────────────
  function tickProjects(state) {
    Object.keys(state.projects).forEach(function (id) {
      var p = state.projects[id];
      if (p.settled) return;
      var typeKey = PROJECT_TYPE[id] || 'manufacturing';
      var pt = state.X.pTable[typeKey] || state.X.pTable.manufacturing;
      if (p.stage === '投产') {
        // 爬坡：S 先验每季 +0.08
        p.rampRate = p.rampRate === null ? 0.30 : clamp(p.rampRate + 0.08, 0, 1);
        if (p.rampRate >= 0.95) { p.stage = '达产'; p.stageQ = state.q; }
        return;
      }
      if (p.stage === '达产') { p.stage = '成熟'; p.stageQ = state.q; return; }
      if (p.stage === '成熟' || p.stage === '停滞' || p.stage === '退出') return;
      // 线索 → 意向：进入状态机
      if (p.stage === '线索') {
        if (rng01(state.seed + ':' + id + ':' + state.q + ':lead') < pt.mode) {
          p.stage = '意向'; p.stageQ = state.q; p.stallQ = 0;
        }
        return;
      }
      // 意向→签约→开工→建设→设备：确定性采样转移
      p.stallQ += 1;
      if (rng01(state.seed + ':' + id + ':' + state.q + ':' + p.stage) < pt.mode) {
        p.stage = STAGE_NEXT[p.stage]; p.stageQ = state.q; p.stallQ = 0;
        if (p.stage === '投产') p.rampRate = 0.10;
      } else if (p.stallQ >= (STALL_LIMIT[p.stage] || 4)) {
        p.stallAtStage = p.stage; p.stage = '停滞'; p.stageQ = state.q;
      }
    });
  }

  // ── 链3 · 约束-瓶颈（四证联合）───────────────────────
  function diagnoseConstraints(state) {
    var out = [];
    var deltas = Object.keys(state.firms).map(function (id) { return state.firms[id].chain.deltaOrder; });
    var lags = Object.keys(state.firms).map(function (id) { return state.firms[id].chain.deliveryLag; });
    var meanDelta = mean(deltas), meanLag = mean(lags);
    RESOURCES.forEach(function (r) {
      var slack = state.resources[r].capacity - state.resources[r].allocated;
      var claimedBy = Object.keys(state.firms).filter(function (id) { return state.firms[id].chain.claimed[r]; });
      if (!claimedBy.length) return;
      // T3-1 声称缺但需求未升 → 非绑定
      if (meanDelta <= 0) {
        out.push({ id: 'T3-1', resource: r, firms: claimedBy, kind: '非绑定约束', lever: null,
          msg: '声称缺' + r + '但样本需求未升（Δ订单均值≤0），先救需求，不补' + r + '。' });
        return;
      }
      // T3-2 四证齐全 → 绑定约束
      if (slack < 15 && meanLag > 1) {
        out.push({ id: 'T3-2', resource: r, firms: claimedBy, kind: '绑定约束', lever: LEVER_MAP[r],
          msg: r + '构成绑定约束（需求升+余量<15+交付变慢+主体声称缺），建议' + LEVER_MAP[r] + '。' });
      }
    });
    return out;
  }

  // ── 链4 · 交易-替代 ──────────────────────────────────
  // alt 替代能力指数：观测槽齐 → 公式；待核 → null（显性未知）
  function altIndexOf(l) {
    if (l.alternates !== null && l.switchCost !== null && l.switchTime !== null && l.switchTime > 0) {
      return clamp(l.alternates / 3, 0, 1) * (1 - l.switchCost) / l.switchTime;
    }
    return null;
  }
  // 待核吸收率：中性先验 0.3（S，显性标注）
  function absorbedAlt(l) { var a = altIndexOf(l); return a === null ? 0.3 : clamp(a, 0, 1); }
  // 传导权重：share 待核 → strength 代理（S，显性标注）
  function edgeWeight(l) { return l.share !== null ? l.share : l.strength; }

  function propagateShock(state, sourceId, shock) {
    var links = state.links.filter(function (l) { return l.endQ === null; });
    var effects = {}; effects[sourceId] = clamp(shock, 0, 1);
    var frontier = [sourceId];
    for (var stage = 1; stage <= 2; stage++) {
      var next = [];
      frontier.forEach(function (id) {
        // 依赖 id 的主体受损（id 为供应商：to===id，from 受损）
        links.filter(function (l) { return l.to === id; }).forEach(function (l) {
          var c = effects[id] * edgeWeight(l) * (stage === 1 ? 0.58 : 0.42) * (1 - absorbedAlt(l));
          if (c > 0.006 && c > (effects[l.from] || 0)) { effects[l.from] = c; next.push(l.from); }
        });
        // id 依赖的供应商受损 → id 反向承压（from===id，to 受损）
        links.filter(function (l) { return l.from === id; }).forEach(function (l) {
          var c = effects[id] * edgeWeight(l) * (stage === 1 ? 0.58 : 0.42) * (1 - absorbedAlt(l));
          if (c > 0.006 && c > (effects[l.to] || 0)) { effects[l.to] = c; next.push(l.to); }
        });
      });
      frontier = [];
      next.forEach(function (x) { if (frontier.indexOf(x) < 0) frontier.push(x); });
    }
    state.lastEffects = effects;
    return effects;
  }
  // 关系事件（外部观测输入）：新建/终止/证据升级。无输入则网络不变。
  function applyLinkEvents(state, events) {
    (events || []).forEach(function (ev) {
      if (ev.action === 'end' && !ev.id && ev.from && ev.to) {
        state.links.forEach(function (l) { if (l.from === ev.from && l.to === ev.to) l.endQ = ev.q || state.q; });
      } else if (ev.action === 'new') {
        state.links.push({
          from: ev.from, to: ev.to, type: ev.type || 'procure',
          strength: ev.strength || 0.4, strengthLineage: 'C',
          share: ev.share || null, alternates: ev.alternates || null,
          switchTime: ev.switchTime || null, switchCost: ev.switchCost || null,
          startQ: ev.q || state.q, endQ: null, status: ev.status || 'reported', observed: true
        });
      } else if (ev.action === 'observe' && ev.id != null) {
        var l = state.links[ev.id];
        if (l) { ['share', 'alternates', 'switchTime', 'switchCost'].forEach(function (k) { if (ev[k] != null) l[k] = ev[k]; }); l.observed = true; l.status = 'reported'; }
      }
    });
  }

  // ── 链5 · 本地贡献 ───────────────────────────────────
  function retentionIndexOf(chain, base, weights) {
    var rates = [chain.localProcureRate, chain.localLaborRate, chain.localServiceRate];
    if (rates.some(function (r) { return r === null; })) {
      // 待核：六维带动 IMP 代理（S，显性标注 proxy）
      return { index: clamp((base.sixDim.values[5] / 100), 0, 1), proxy: true, lineage: 'S-代理' };
    }
    return {
      index: clamp(weights[0] * rates[0] + weights[1] * rates[1] + weights[2] * rates[2], 0, 1),
      proxy: false, lineage: 'D'
    };
  }

  // ── 触发器注册表（15 条）─────────────────────────────
  function trio(q, direction, quality) { return { observedAt: q, direction: direction, quality: quality }; }
  var TRIGGERS = [
    { id: 'T1-1', run: function (s) {
        var ds = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deltaOrder; }));
        var inv = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.inventory; }));
        var prev = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.prevInventory; }));
        if (ds < 0 && inv > prev) return { msg: '需求衰退：新增订单转负且库存累积，深查客户订单。', trio: trio(s.q, 'down', '先验S') };
        return null;
      } },
    { id: 'T1-2', run: function (s) {
        var ds = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deltaOrder; }));
        var lag = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deliveryLag; }));
        var util = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.capacityUtil; }));
        if (ds > 0 && lag > 1 && util > 85) return { msg: '供给瓶颈·产能：需求升+交付变慢+产能利用率>85，核验扩产条件。', trio: trio(s.q, 'up', '先验S') };
        return null;
      } },
    { id: 'T1-3', run: function (s) {
        var ds = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deltaOrder; }));
        var lag = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deliveryLag; }));
        var util = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.capacityUtil; }));
        if (ds > 0 && lag > 1 && util < 70) return { msg: '供给瓶颈·中间投入：需求升+交付变慢+产能未满，核验缺料缺工与替代能力。', trio: trio(s.q, 'up', '先验S') };
        return null;
      } },
    { id: 'T1-4', run: function (s) {
        var ob = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.orderBook; }));
        var pOb = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.prevOrderBook; }));
        var lag = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.deliveryLag; }));
        var pLag = mean(Object.keys(s.firms).map(function (i) { return s.firms[i].chain.prevLag; }));
        if (ob >= pOb && lag > pLag) return { msg: '订单未降但交付变慢：问题不是需求，是投入替代——最高优先级深查。', trio: trio(s.q, 'flat→slow', '先验S') };
        return null;
      } },
    { id: 'T2-1', run: function (s) {
        var hit = Object.keys(s.projects).filter(function (i) { var p = s.projects[i]; return (p.stage === '签约' && p.stallQ >= 3) || (p.stage === '停滞' && p.stallAtStage === '签约'); });
        if (hit.length) return { msg: '项目停滞·签约未开工：' + hit.map(nm).join('、') + '，核验开工障碍。', trio: trio(s.q, 'stalled', '状态机') };
        return null;
      } },
    { id: 'T2-2', run: function (s) {
        var hit = Object.keys(s.projects).filter(function (i) { var p = s.projects[i]; return (p.stage === '建设' && p.stallQ >= 5) || (p.stage === '停滞' && p.stallAtStage === '建设'); });
        if (hit.length) return { msg: '项目停滞·建设停留：' + hit.map(nm).join('、') + '，核验建设障碍。', trio: trio(s.q, 'stalled', '状态机') };
        return null;
      } },
    { id: 'T2-3', run: function (s) {
        var hit = Object.keys(s.projects).filter(function (i) { var p = s.projects[i]; return p.stage === '投产' && p.rampRate !== null && p.rampRate < 0.5 && (s.q - p.stageQ) >= 4; });
        if (hit.length) return { msg: '达产停滞：' + hit.map(nm).join('、') + ' 投产≥4季且达产率<50%，核验达产障碍。', trio: trio(s.q, 'slow', '状态机') };
        return null;
      } },
    { id: 'T2-4', run: function (s) {
        var hit = Object.keys(s.projects).filter(function (i) { var p = s.projects[i]; return p.base.paidInv !== null && p.base.planInv !== null && p.base.paidInv / p.base.planInv < 0.5; });
        if (hit.length) return { msg: '资金缺口：' + hit.map(nm).join('、') + ' 到资/计划<50%，核验到位节奏。', trio: trio(s.q, 'gap', '观测') };
        return null;
      } },
    { id: 'T4-1', run: function (s) {
        var hit = s.links.filter(function (l) { return l.endQ === null && l.alternates === 0 && (l.share !== null ? l.share : l.strength) > 0.5; });
        if (hit.length) return { msg: '单点依赖：' + hit.map(function (l) { return l.from + '→' + l.to; }).join('、') + '，深查替代者。', trio: trio(s.q, 'exposed', '待核') };
        return null;
      } },
    { id: 'T4-2', run: function (s) {
        var hit = s.links.filter(function (l) { return l.endQ === null && l.switchTime !== null && l.switchCost !== null && l.switchTime > 4 && l.switchCost > 0.6; });
        if (hit.length) return { msg: '替代昂贵：' + hit.map(function (l) { return l.from + '→' + l.to; }).join('、') + ' 切换>4季且成本>0.6，深查替代。', trio: trio(s.q, 'exposed', '观测') };
        return null;
      } },
    { id: 'T4-3', run: function (s) {
        var deg = {};
        s.links.forEach(function (l) { if (l.endQ === null) { deg[l.from] = (deg[l.from] || 0) + 1; deg[l.to] = (deg[l.to] || 0) + 1; } });
        var hit = Object.keys(deg).filter(function (id) {
          if (deg[id] < 4) return false;
          var alts = s.links.filter(function (l) { return l.endQ === null && (l.from === id || l.to === id); }).map(absorbedAlt);
          return mean(alts) > 0.5;
        });
        if (hit.length) return { msg: '中心≠不可替代：' + hit.map(nm).join('、') + ' 中心度高但替代能力足，勿高估系统重要性。', trio: trio(s.q, 'flat', '先验S') };
        return null;
      } },
    { id: 'T5-1', run: function (s) {
        var hit = Object.keys(s.firms).filter(function (i) { var b = s.firms[i].base; return b.mergeLocalRatio !== undefined && b.mergeLocalRatio !== null && b.mergeLocalRatio < 0.5; });
        if (hit.length) return { msg: '统计识别风险：' + hit.map(nm).join('、') + ' 集团合并收入/本地产出>2，拆分口径。', trio: trio(s.q, 'gap', '观测') };
        return null;
      } },
    { id: 'T5-2', run: function (s) {
        var hit = Object.keys(s.projects).filter(function (i) { var p = s.projects[i]; return p.base.claimedOutput !== undefined && p.base.claimedOutput !== null && p.stage !== '投产' && p.stage !== '达产' && p.stage !== '成熟'; });
        if (hit.length) return { msg: '口径污染：' + hit.map(nm).join('、') + ' 规划产值挂在未投产项目，禁入贡献口径。', trio: trio(s.q, 'flag', '观测') };
        return null;
      } }
  ];
  function nm(id) { return id; }

  // ── 季度主循环（六步时间结构）────────────────────────
  function tickQuarter(state, inputs) {
    inputs = inputs || {};
    var X = state.X;
    if (inputs.lostCoef != null) X.lostCoef = inputs.lostCoef;
    if (inputs.deliveryTolerance != null) X.deliveryTolerance = inputs.deliveryTolerance;
    if (inputs.orderDrift != null) X.orderDrift = inputs.orderDrift;
    if (inputs.typhoon != null) X.typhoon = inputs.typhoon;
    state.q += 1;
    state.signals = [];

    // 1. X 采样：外部条件由 inputs 注入（默认无变化）
    // 2. 领先更新
    applyLinkEvents(state, inputs.linkEvents);
    tickProjects(state);
    // 3. 链传播
    tickOrder(state);
    (inputs.shocks || []).forEach(function (sh) {
      propagateShock(state, sh.source, sh.shock);
      state.signals.push({ id: 'EVT-SHOCK', source: sh.source, shock: sh.shock, kind: '冲击事件',
        msg: '注入冲击：' + sh.source + ' 强度 ' + sh.shock + '，两阶传导写入。', trio: trio(state.q, 'injected', '情景S') });
    });
    // 4. 瓶颈诊断
    diagnoseConstraints(state).forEach(function (sig) { state.signals.push(sig); });
    // 5. 滞后沉淀
    Object.keys(state.firms).forEach(function (id) {
      var f = state.firms[id];
      f.retention = retentionIndexOf(f.chain, f.base, X.retentionWeights);
    });
    // 6. 信号面板：全部触发器
    TRIGGERS.forEach(function (t) {
      var r = t.run(state);
      if (r) state.signals.push({ id: t.id, kind: '触发器', msg: r.msg, trio: r.trio });
    });
    state.history.push({ q: state.q, signals: state.signals.map(function (s) { return s.id; }) });
    return state;
  }

  var SM = {
    version: 'engine-v01',
    hashId: hashId, clamp: clamp, rng01: rng01, mean: mean,
    RESOURCES: RESOURCES, STAGES: STAGES, STAGE_NEXT: STAGE_NEXT,
    initState: initState, initFirmChain: initFirmChain,
    tickOrder: tickOrder, tickProjects: tickProjects,
    diagnoseConstraints: diagnoseConstraints,
    altIndexOf: altIndexOf, absorbedAlt: absorbedAlt, edgeWeight: edgeWeight,
    propagateShock: propagateShock, applyLinkEvents: applyLinkEvents,
    retentionIndexOf: retentionIndexOf,
    TRIGGERS: TRIGGERS, tickQuarter: tickQuarter
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SM;
  else global.HuidongEngine = SM;
})(typeof window !== 'undefined' ? window : this);
