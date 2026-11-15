/* ============================================================
 * data-bridge.js —— 数据驱动桥（消费方，不做任何估计）
 * 加载火山引擎已审核的契约数据包，暴露与旧 model.js 同名的 HT 接口；
 * run() 不再跑浏览器蒙特卡洛，而是返回数据包内已算好的情景分位数。
 * 自动适配不同目录深度；file:// 双击时回退到内嵌 payload.js。
 * ============================================================ */
(function () {
  var CANDIDATES = ['v2/data/payload.json', '../v2/data/payload.json', 'data/payload.json'];

  function load() {
    return new Promise(function (resolve, reject) {
      var i = 0;
      function next() {
        if (i >= CANDIDATES.length) {
          if (window.__EMBEDDED_PAYLOAD__) return resolve(window.__EMBEDDED_PAYLOAD__);
          return reject(new Error('payload unavailable'));
        }
        var url = CANDIDATES[i++];
        fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); })
          .then(resolve).catch(next);
      }
      next();
    });
  }

  var COLORS = { '清洁能源': '#0891b2', '新材料': '#8b5cf6', '滨海旅游': '#fbbf24',
    '女鞋时尚': '#ec4899', '女鞋': '#ec4899', '特色农渔': '#34d399' };

  function build(D) {
    var last = function (a) { return a[a.length - 1]; };
    var base = last(D.history.gdp.values);
    var target = D.scenarios.target;
    var paths = D.models.estimates.map(function (e) {
      var name = e.path === '女鞋' ? '女鞋时尚' : e.path;
      return {
        name: name, mu: e.est, lo: e.lo, hi: e.hi,
        sd: Math.round((e.hi - e.lo) / 3.92),
        color: COLORS[name] || '#0891b2', blood: D.models.blood
      };
    });
    var scen = {};
    D.scenarios.list.forEach(function (s) { scen[s.id] = s; });

    function pickScenario(opts) {
      if (!opts) return 'base';
      if (opts.typhoon) return 'storm';
      if (opts.shoeFactor != null && opts.shoeFactor < 1) return 'shoe';
      if (opts.nuclearDelay) return 'shoe';
      return 'base';
    }

    return {
      BASE: base, TARGET: target, NOISE_SD: 35,
      DEFAULT_PATHS: paths, META: D.meta, DATA: D,

      valueTable: function () {
        var gdp = paths.map(function (p) {
          return { name: p.name, color: p.color, val: Math.round(p.mu), unit: '亿' };
        }).sort(function (a, b) { return b.val - a.val; });
        return { gdp: gdp, jobs: [], eco: [] };
      },

      typhoonLoss: function () {
        var l = D.typhoon.loss;
        return { tourism: l.tourism, fishery: l.fishery, energy: l.energy, total: l.total };
      },

      typhoonCurve: function () {
        var r = D.typhoon.recovery;
        return {
          weeks: r.months.map(function (m) { return '第' + m + '月'; }),
          loss: r.recover.map(function (v) { return +(100 - v).toFixed(1); })
        };
      },

      /* 情景读取：忽略 seed/N，直接返回该情景已审核的 P10/P50/P90 与达标率 */
      run: function (seed, N, ps, opts) {
        var id = pickScenario(opts);
        var s = scen[id] || scen.base;
        return {
          scenarioId: id,
          p10: s.p10, p50: s.p50, p90: s.p90, hit: s.hit,
          coefs: [], results: [], rawResults: [],
          typhoon: opts && opts.typhoon ? this.typhoonLoss() : null
        };
      }
    };
  }

  window.HTBridge = { ready: load().then(build), build: build };
})();
