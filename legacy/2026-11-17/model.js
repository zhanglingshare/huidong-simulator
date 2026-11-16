/* ============================================================
 * model.js —— 惠东产业风洞 统一模型内核
 * future / windtunnel / report / choices 共用这一份。
 *
 * 口径：
 *  - BASE 861.25 亿：惠东 2025 年地区生产总值现实锚点
 *  - TARGET 1200 亿：模型外延参考目标（再上一个台阶），非政府刚性指标
 *  - 五条路径 μ/σ：模型设定的情景参数，非实测
 *  - 全局噪声：加性，模型设定的外部冲击波动
 *  - 台风“红霞”：2026-07-26 以强台风级在平海登陆（真实事件），
 *    风洞按“脉冲冲击 + 恢复”测算，区别于日常慢性波动
 * ============================================================ */
const HT = {
  BASE: 861.25,
  TARGET: 1200,
  NOISE_SD: 35,
  // jobs=每亿元增量带动就业（人/亿，模型估算的劳动密集度）；eco=生态友好度（0–100，模型估算）
  DEFAULT_PATHS: [
    {mu: 120, sd: 35, name: '清洁能源', color: '#0891b2', jobs: 350,  eco: 66},
    {mu: 90,  sd: 30, name: '新材料',   color: '#8b5cf6', jobs: 600,  eco: 58},
    {mu: 70,  sd: 24, name: '滨海旅游', color: '#fbbf24', jobs: 1600, eco: 80},
    {mu: 45,  sd: 18, name: '女鞋时尚', color: '#ec4899', jobs: 2400, eco: 72},
    {mu: 25,  sd: 10, name: '特色农渔', color: '#34d399', jobs: 3000, eco: 92}
  ],

  // 基本面事实（均来自 2025 统计公报 / 2026 政府工作报告公开口径）
  FACTS: {
    gdp: 861.25, growth: 4.0, pop: 103.3, urban: 63.8,
    ind: {p1: 99.00, p2: 305.39, p3: 456.86},
    coast: 214.3, sea: 3200, islands: 66,
    industry: 576, industryGrowth: 13.6, firms: 476,
    vaGrowth: 12.1, retail: 345.2, budget: 56.53,
    tourists2024: 1756,
    energy: 80, energyTarget: 120, newMaterial: 50,
    shoe: 500, shoe2030: 610
  },

  // 台风“红霞”真实参数（用于风洞校准）
  TYPHOON: {
    name: '红霞', date: '2026-07-26', landfall: '惠东平海',
    grade: 14, note: '2016年“海马”以来登陆珠江口以东最强台风',
    tourismDaily: 0.55,   // 旺季单日旅游收入（亿，模型估算）
    rebook: 0.4,          // 停业客流中可改期回补比例
    fisheryBase: 4.0      // 14级下渔业/海洋牧场设施与当造损失基数（亿）
  },

  mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  },
  makeRandn(prng) {
    return function () {
      let u = 0, v = 0;
      while (u === 0) u = prng();
      while (v === 0) v = prng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
  },
  quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const pos = (sorted.length - 1) * q;
    const lo = Math.floor(pos), hi = Math.ceil(pos), w = pos - lo;
    return sorted[lo] * (1 - w) + sorted[hi] * w;
  },
  corr(xs, ys) {
    const n = xs.length;
    let mx = 0, my = 0;
    for (let k = 0; k < n; k++) { mx += xs[k]; my += ys[k]; }
    mx /= n; my /= n;
    let num = 0, dx = 0, dy = 0;
    for (let k = 0; k < n; k++) {
      num += (xs[k] - mx) * (ys[k] - my);
      dx += (xs[k] - mx) * (xs[k] - mx);
      dy += (ys[k] - my) * (ys[k] - my);
    }
    return num / Math.sqrt(dx * dy);
  },

  // 一次台风的净损失（亿）：旅游停业（扣回补）+ 渔业设施；能源抗台、几乎无损
  typhoonLoss(strength, days) {
    const T = this.TYPHOON;
    strength = strength == null ? 1 : strength;
    days = days == null ? 7 : days;
    const tourism = T.tourismDaily * days * (1 - T.rebook) * strength;
    const fishery = T.fisheryBase * strength;
    return {tourism, fishery, energy: 0, total: tourism + fishery};
  },

  // 台风后客流恢复曲线（周）：停业周谷底→逐周回升→改期客流短暂回补→回到趋势。
  // 曲线积分（换算金额）与 typhoonLoss 的旅游净损失严格同源（同一组停业天数与回补比例）
  typhoonCurve(strength, days) {
    strength = strength == null ? 1 : strength;
    days = days == null ? 7 : days;
    const T = this.TYPHOON, W = 10, D = days / 7;
    const trough = Math.min(0.95, 0.55 + 0.35 * strength); // 登陆当周客流损失率
    const weeks = [], g = [], rb = [];
    for (let w = 0; w <= W; w++) {
      weeks.push('第' + w + '周');
      const lo = Math.max(w, 0), hi = Math.min(w + 1, D), cf = Math.max(0, hi - lo);
      const dt = (w + 0.5) - D;
      const rec = dt > 0 ? trough * Math.exp(-0.7 * dt) : 0; // 停业结束后的滞后损失
      g.push(cf * trough + (1 - cf) * rec);
      const x = (w + 0.5) - (D + 1.5);
      rb.push(Math.exp(-(x * x) / 2));                        // 改期回补客流形状
    }
    const Ag = g.reduce((a, b) => a + b, 0);
    const target = D * (1 - T.rebook) * strength;             // 目标净损失（周）
    const rbi = rb.reduce((a, b) => a + b, 0);
    const B = rbi > 0 ? (Ag - target) / rbi : 0;
    const loss = g.map((v, w) => +((v - B * rb[w]) * 100).toFixed(1));
    return {weeks, loss};
  },

  // 价值实验：三把尺子各问各的问题，返回各尺子下五条路的排序（确定性，不随机）
  //  gdp  比谁撑起的总盘子大（μ，亿）；jobs 比每亿元带动多少岗位（人/亿）；eco 比生态友好度（0–100）
  valueTable(paths) {
    const P = (paths || this.DEFAULT_PATHS).map(p => Object.assign({}, p));
    const mk = (key, unit) => P.map(p => ({name: p.name, color: p.color,
      val: +p[key].toFixed(0), unit}))
      .sort((a, b) => b.val - a.val);
    return {
      gdp: mk('mu', '亿'),
      jobs: mk('jobs', '人/亿'),
      eco: mk('eco', '分')
    };
  },

  run(seed, N, paths, opts = {}) {
    const base = opts.base != null ? opts.base : this.BASE;
    const target = opts.target != null ? opts.target : this.TARGET;
    const noise = opts.noise != null ? opts.noise : this.NOISE_SD;
    // 路径深拷贝，允许按情景调整 μ
    const P = paths.map(p => Object.assign({}, p));
    if (opts.nuclearDelay) {
      const e = P.find(x => x.name === '清洁能源');
      if (e) e.mu = Math.max(0, e.mu - 18 * opts.nuclearDelay);
    }
    if (opts.shoeFactor != null) {
      const s = P.find(x => x.name === '女鞋时尚');
      if (s) s.mu = Math.max(0, s.mu * opts.shoeFactor);
    }
    let typhoon = null;
    if (opts.typhoon) {
      typhoon = this.typhoonLoss(opts.typhoon.strength, opts.typhoon.days);
    }
    const prng = this.mulberry32(seed), randn = this.makeRandn(prng);
    const raw = [], sorted = [], contribs = P.map(() => []);
    for (let i = 0; i < N; i++) {
      let total = base;
      for (let j = 0; j < P.length; j++) {
        let v = P[j].mu + randn() * P[j].sd;
        if (v < 0) v = 0;
        total += v;
        contribs[j].push(v);
      }
      if (typhoon) total -= typhoon.total;   // 台风脉冲净损失（已含恢复回补）
      total += randn() * noise;
      raw.push(total);
      sorted.push(total);
    }
    sorted.sort((a, b) => a - b);
    return {
      p10: this.quantile(sorted, 0.10),
      p50: this.quantile(sorted, 0.50),
      p90: this.quantile(sorted, 0.90),
      hit: sorted.filter(x => x >= target).length / N * 100,
      coefs: contribs.map(c => Math.abs(this.corr(c, raw))),
      results: sorted,
      rawResults: raw,
      typhoon
    };
  }
};
if (typeof module !== 'undefined' && module.exports) module.exports = HT;
