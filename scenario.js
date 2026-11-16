const HDScenario = (() => {
  const version = 2;
  const resultKey = 'hd_wind_result';
  const optionsKey = 'hd_scenario';
  const limits = {strength: [0, 150], days: [0, 14], delay: [0, 2], shoe: [70, 120]};
  const baseline = Object.freeze({strength: 0, days: 0, delay: 0, shoe: 100});
  const storm = Object.freeze({...baseline, strength: 100, days: 7});
  const metrics = ['p10', 'p50', 'p90', 'hit'];
  let lastResult;

  function normalize(input) {
    return Object.fromEntries(Object.entries(limits).map(([key, [min, max]]) => {
      const value = input[key];
      return [key, Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : baseline[key]];
    }));
  }

  function toOptions({strength, days, delay, shoe}) {
    const opts = {};
    if (strength) opts.typhoon = {strength: strength / 100, days};
    if (delay) opts.nuclearDelay = delay;
    if (shoe !== 100) opts.shoeFactor = shoe / 100;
    return opts;
  }

  function fromOptions(opts) {
    return normalize({
      strength: opts.typhoon ? (opts.typhoon.strength ?? 1) * 100 : 0,
      days: opts.typhoon ? opts.typhoon.days ?? 7 : 0,
      delay: opts.nuclearDelay,
      shoe: opts.shoeFactor == null ? 100 : opts.shoeFactor * 100
    });
  }

  const token = conditions => Object.keys(limits).map(key => conditions[key]).join('.');

  function parseToken(value) {
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value ?? '')) return null;
    const values = value.split('.').map(Number);
    return normalize(Object.fromEntries(Object.keys(limits).map((key, i) => [key, values[i]])));
  }

  function readStorage(type, key) {
    try {
      return JSON.parse(window[type].getItem(key));
    } catch {
      return null;
    }
  }

  function readConditions(search = location.search) {
    const params = new URLSearchParams(search);
    return parseToken(params.get('run'));
  }

  function reportConditions(search = location.search) {
    const fromLink = readConditions(search);
    if (fromLink) return fromLink;

    const params = new URLSearchParams(search);
    if (['typhoon', 'nuclearDelay', 'shoeFactor'].some(key => params.has(key))) {
      return fromOptions({
        typhoon: params.get('typhoon') === '1' ? {strength: 1, days: 7} : undefined,
        nuclearDelay: Number.parseInt(params.get('nuclearDelay'), 10),
        shoeFactor: Number.parseFloat(params.get('shoeFactor'))
      });
    }

    const saved = readStorage('localStorage', optionsKey);
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) return fromOptions(saved);
    return parseToken(readStorage('sessionStorage', resultKey)?.token) ?? baseline;
  }

  function run(input) {
    const conditions = normalize(input);
    const id = token(conditions);
    if (lastResult?.token === id) return lastResult;
    const saved = readStorage('sessionStorage', resultKey);
    if (saved?.version === version && saved.token === id &&
        metrics.every(key => Number.isFinite(saved.summary?.[key])) &&
        ['女鞋时尚', '清洁能源'].every(name => Number.isFinite(saved.pathMeans?.[name])) &&
        Array.isArray(saved.histogram) && saved.histogram.length > 0 &&
        saved.histogram.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite))) {
      lastResult = {...saved, conditions};
      return lastResult;
    }

    const result = HT.run(42, 10000, HT.DEFAULT_PATHS, toOptions(conditions));
    const counts = new Map();
    const binSize = 20;
    const first = Math.floor(result.results[0] / binSize) * binSize;
    const last = Math.floor(result.results.at(-1) / binSize) * binSize;
    for (const value of result.results) {
      const bin = Math.floor(value / binSize) * binSize;
      counts.set(bin, (counts.get(bin) ?? 0) + 1);
    }
    const histogram = [];
    for (let bin = first; bin <= last; bin += binSize) histogram.push([bin + binSize / 2, counts.get(bin) ?? 0]);

    lastResult = {
      version, token: id, conditions, histogram,
      pathMeans: result.pathMeans,
      summary: Object.fromEntries(metrics.map(key => [key, result[key]]))
    };
    return lastResult;
  }

  function remember(result) {
    try { sessionStorage.setItem(resultKey, JSON.stringify(result)); } catch {}
    try { localStorage.setItem(optionsKey, JSON.stringify(toOptions(result.conditions))); } catch {}
  }

  function stormEffects({strength, days}) {
    if (!strength) return {tourism: 0, fishery: 0, energy: 0, total: 0, flow: Array(11).fill(100)};
    const loss = HT.typhoonLoss(strength / 100, days);
    const curve = HT.typhoonCurve(strength / 100, days);
    return {...loss, flow: curve.loss.map(loss => +(100 - loss).toFixed(1))};
  }

  return {baseline, storm, run, remember, readConditions, reportConditions, stormEffects, toOptions};
})();
