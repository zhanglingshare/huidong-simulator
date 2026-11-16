(() => {
  const $ = id => document.getElementById(id);
  const whole = new Intl.NumberFormat('zh-CN', {maximumFractionDigits: 0});
  const tenths = new Intl.NumberFormat('zh-CN', {minimumFractionDigits: 1, maximumFractionDigits: 1});
  const amount = value => whole.format(value) + ' 亿';
  const lossAmount = value => tenths.format(value) + ' 亿';
  const percent = value => whole.format(value) + '%';
  const range = ({p10, p90}) => whole.format(p10) + '–' + whole.format(p90) + ' 亿';
  const setText = (id, value) => { $(id).textContent = value; };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = {
    storm: {conditions: HDScenario.storm, evidence: 'v2/scenarios.html#typhoon-recovery'},
    shoe: {conditions: {...HDScenario.baseline, shoe: 80}, evidence: 'v2/models.html#path-assessment'},
    energy: {conditions: {...HDScenario.baseline, delay: 1}, evidence: 'v2/models.html#path-assessment'}
  };

  function readScene(conditions) {
    const key = new URLSearchParams(location.search).get('scene');
    if (Object.hasOwn(scenes, key)) return key;
    if (conditions.strength) return 'storm';
    if (conditions.shoe !== 100) return 'shoe';
    return conditions.delay ? 'energy' : 'storm';
  }

  function conditionsText({strength, days, delay, shoe}) {
    const storm = strength ? '参考风力的 ' + strength + '%、涉海停业 ' + days + ' 天' : '无台风冲击';
    const energy = delay ? '太平岭投产晚 ' + delay + ' 年' : '太平岭按期投产';
    return storm + ' · ' + energy + ' · 女鞋景气 ' + shoe + '%';
  }

  function setResult(run) {
    const {summary} = run;
    const values = {p50: amount(summary.p50), hit: percent(summary.hit), range: range(summary)};
    for (const node of document.querySelectorAll('[data-output]')) node.textContent = values[node.dataset.output];
  }

  function runLink(page, run, scene) {
    const params = new URLSearchParams({run: run.token, scene});
    return page + '?' + params.toString();
  }

  function surface(canvas) {
    const {width, height} = canvas.getBoundingClientRect();
    if (!width || !height) return null;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    return {context, width, height};
  }

  function drawCoast() {
    const frame = surface($('coast-canvas'));
    if (!frame) return;
    const {context: ctx, width: w, height: h} = frame;
    const ocean = ctx.createLinearGradient(0, 0, w * .8, h);
    ocean.addColorStop(0, '#164850');
    ocean.addColorStop(.55, '#103944');
    ocean.addColorStop(1, '#081f32');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1;
    for (let row = 0; row < 12; row++) {
      ctx.strokeStyle = row % 3 === 0 ? '#87c8c62b' : '#87c8c613';
      ctx.beginPath();
      for (let step = 0; step <= 60; step++) {
        const t = step / 60;
        const y = (.31 + row * .059 + t * .13 + Math.sin(t * 10 - row * .42) * .047) * h;
        if (step === 0) ctx.moveTo(0, y);
        else ctx.lineTo(t * w, y);
      }
      ctx.stroke();
    }

    const coast = [
      [0, .33], [.04, .30], [.09, .32], [.118, .38], [.16, .39], [.19, .42],
      [.24, .43], [.27, .47], [.30, .46], [.33, .37], [.37, .35], [.41, .40],
      [.435, .49], [.47, .50], [.50, .53], [.53, .51], [.55, .45], [.58, .42],
      [.625, .445], [.66, .40], [.705, .37], [.75, .42], [.78, .44], [.825, .48],
      [.87, .475], [.91, .53], [.945, .51], [1, .56]
    ];
    const drawShore = () => {
      ctx.beginPath();
      coast.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x * w, y * h);
        else ctx.lineTo(x * w, y * h);
      });
    };
    drawShore();
    ctx.lineTo(w, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    const land = ctx.createLinearGradient(0, 0, w * .2, h * .55);
    land.addColorStop(0, '#2c4441');
    land.addColorStop(1, '#1a3235');
    ctx.fillStyle = land;
    ctx.fill();
    ctx.save();
    ctx.clip();
    for (let row = 0; row < 8; row++) {
      ctx.beginPath();
      for (let step = 0; step <= 45; step++) {
        const t = step / 45;
        const y = (.02 + row * .063 + t * .16 + Math.sin(t * 13 + row * .51) * .038) * h;
        if (step === 0) ctx.moveTo(0, y);
        else ctx.lineTo(t * w, y);
      }
      ctx.strokeStyle = '#a9c49d26';
      ctx.stroke();
    }
    ctx.restore();
    drawShore();
    ctx.strokeStyle = '#a2e7c258';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = '#b9ebca';
    ctx.lineWidth = 1.15;
    ctx.stroke();

    for (const [x, y, size] of [[.09, .58, 8], [.16, .635, 6], [.277, .63, 4], [.59, .69, 6], [.65, .72, 4], [.84, .67, 7]]) {
      ctx.beginPath();
      ctx.ellipse(x * w, y * h, size, size * .44, -.35, 0, Math.PI * 2);
      ctx.fillStyle = '#509584';
      ctx.fill();
      ctx.strokeStyle = '#a2e7c285';
      ctx.stroke();
    }
  }

  function flowChart(canvas) {
    let visible;
    let reference;
    let animation;

    function paint() {
      const frame = surface(canvas);
      if (!frame || !visible) return;
      const {context: ctx, width: w, height: h} = frame;
      const max = Math.max(140, Math.ceil(Math.max(...visible, ...(reference ?? [])) / 10) * 10);
      const bottom = h - 8;
      const x = index => 35 + index / (visible.length - 1) * (w - 42);
      const y = value => bottom - value / max * (bottom - 6);
      ctx.font = '10px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 1;
      for (const tick of [0, 50, 100]) {
        ctx.fillStyle = '#b4cbd0';
        ctx.fillText(tick + '%', 0, y(tick));
        ctx.strokeStyle = tick === 100 ? '#86b9bb85' : '#31505e';
        ctx.setLineDash(tick === 100 ? [4, 4] : []);
        ctx.beginPath();
        ctx.moveTo(x(0), y(tick));
        ctx.lineTo(x(visible.length - 1), y(tick));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      const trace = values => {
        ctx.beginPath();
        values.forEach((value, index) => {
          if (index === 0) ctx.moveTo(x(index), y(value));
          else ctx.lineTo(x(index), y(value));
        });
      };
      trace(visible);
      ctx.lineTo(x(visible.length - 1), bottom);
      ctx.lineTo(x(0), bottom);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, 0, 0, bottom);
      fill.addColorStop(0, '#81e4c84c');
      fill.addColorStop(1, '#81e4c80d');
      ctx.fillStyle = fill;
      ctx.fill();
      if (reference) {
        trace(reference);
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = '#abc5cd9c';
        ctx.stroke();
        ctx.setLineDash([]);
      }
      trace(visible);
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#91e8cb';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x(0), y(visible[0]), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffac88';
      ctx.fill();
    }

    new ResizeObserver(paint).observe(canvas);
    return (next, comparison, label) => {
      canvas.setAttribute('aria-label', label);
      reference = comparison;
      cancelAnimationFrame(animation);
      if (!visible || motion.matches || visible.every((value, index) => value === next[index])) {
        visible = next;
        paint();
        return;
      }
      const start = visible;
      const t0 = performance.now();
      const frame = now => {
        const progress = Math.min(1, (now - t0) / 420);
        const eased = 1 - Math.pow(1 - progress, 3);
        visible = next.map((value, index) => start[index] + (value - start[index]) * eased);
        paint();
        if (progress < 1) animation = requestAnimationFrame(frame);
      };
      animation = requestAnimationFrame(frame);
    };
  }

  function initHome() {
    const button = $('change-days');
    const before = HDScenario.stormEffects(HDScenario.storm);
    const drawFlow = flowChart($('home-flow'));
    let days = HDScenario.storm.days;
    let active;
    new ResizeObserver(drawCoast).observe($('coast-stage'));

    function render() {
      active = HDScenario.run({...HDScenario.storm, days});
      const effects = HDScenario.stormEffects(active.conditions);
      const extra = days > HDScenario.storm.days;
      $('coast-stage').dataset.pressure = extra ? 'raised' : 'reference';
      button.setAttribute('aria-pressed', String(extra));
      setText('change-days-label', extra ? '回到停业 7 天' : '多停一天');
      button.lastElementChild.textContent = extra ? '↶' : '＋';
      setText('home-days', '停业 ' + days + ' 天');
      setText('home-loss', lossAmount(effects.tourism));
      setText('home-delta', extra ? '比停 7 天多约 ' + lossAmount(effects.tourism - before.tourism) : '模型估算');
      setText('home-flow-key', extra ? '虚线曲线为停业 7 天' : '正常水平 = 100%');
      setResult(active);
      setText('home-announcement', '停业 ' + days + ' 天。旅游停业损失约 ' + lossAmount(effects.tourism) +
        '。2030 年全县 GDP 模拟中位数 ' + amount(active.summary.p50) + '。');
      drawFlow(effects.flow, extra ? before.flow : null, '停业 ' + days + ' 天情景。登陆当周客流约为正常的 ' + percent(effects.flow[0]) +
        (extra ? '。虚线为停业 7 天的对照曲线。' : '。'));
      $('open-wind').href = runLink('windtunnel.html', active, 'storm');
      $('open-report').href = runLink('report.html', active, 'storm');
    }

    button.addEventListener('click', () => {
      days = days === 7 ? 8 : 7;
      render();
      HDScenario.remember(active);
    });
    for (const id of ['open-wind', 'open-report']) $(id).addEventListener('click', () => HDScenario.remember(active));
    render();
    button.disabled = false;
  }

  function initWind() {
    const fromLink = HDScenario.readConditions();
    let scene = readScene(fromLink ?? HDScenario.storm);
    let conditions = fromLink ?? scenes[scene].conditions;
    let active;
    const change = $('change-condition');
    const drawFlow = flowChart($('wind-flow'));
    const sliders = ['strength', 'days', 'delay', 'shoe'].map($);
    const buttons = [...document.querySelectorAll('button[data-scene]')];
    const nextStorm = current => current.strength ? {...current, days: current.days === 7 ? 8 : 7} :
      {...current, strength: HDScenario.storm.strength, days: HDScenario.storm.days};

    function renderStorm() {
      const effects = HDScenario.stormEffects(conditions);
      const comparison = HDScenario.stormEffects({...conditions, days: 7});
      const diff = effects.tourism - comparison.tourism;
      setText('experiment-title', '台风停业 · 客流怎么恢复');
      setText('wind-comparison', diff ? '比同风力停 7 天' + (diff > 0 ? '多损失约 ' : '少损失约 ') + lossAmount(Math.abs(diff)) :
        '当年旅游停业损失约 ' + lossAmount(effects.tourism));
      change.textContent = !conditions.strength ? '设为参考风力' : conditions.days === 7 ? '多停一天' : '回到停业 7 天';
      setText('observation-title', '滨海客流恢复');
      setText('wind-flow-note', '登陆当周约 ' + percent(effects.flow[0]));
      setText('storm-tourism', lossAmount(effects.tourism));
      setText('storm-fishery', lossAmount(effects.fishery));
      setText('storm-total', lossAmount(effects.total));
      drawFlow(effects.flow, diff ? comparison.flow : null, '滨海客流模拟。登陆当周约为正常的 ' + percent(effects.flow[0]) + '。');
    }

    function renderPath() {
      const isShoe = scene === 'shoe';
      const referenceInput = isShoe ? {...conditions, shoe: conditions.shoe === 100 ? 80 : 100} :
        {...conditions, delay: conditions.delay ? 0 : 1};
      const referenceResult = HDScenario.run(referenceInput);
      const difference = Math.round(active.summary.p50 - referenceResult.summary.p50);
      const label = input => isShoe ? '女鞋景气 ' + input.shoe + '%' :
        input.delay ? '太平岭晚 ' + input.delay + ' 年' : '太平岭按期投产';
      setText('experiment-title', isShoe ? '女鞋承压 · 行业景气变弱' : '能源提速 · 太平岭按期投产');
      setText('wind-comparison', difference === 0 ? '两种条件的全县中位数接近' :
        '全县中位数比对照' + (difference < 0 ? '低 ' : '高 ') + amount(Math.abs(difference)));
      change.textContent = isShoe ? (conditions.shoe === 100 ? '把女鞋景气调到 80%' : '恢复正常景气') :
        (conditions.delay ? '改为按期投产' : '改为晚 1 年');
      const pathName = isShoe ? '女鞋时尚' : '清洁能源';
      setText('observation-title', isShoe ? '女鞋路径的变化' : '清洁能源路径的变化');
      setText('path-unit', '2030 年单条路径的模型设定贡献');
      const scale = Math.max(active.pathMeans[pathName], referenceResult.pathMeans[pathName], 1);
      for (const [key, run] of [['reference', referenceResult], ['current', active]]) {
        setText('path-' + key + '-label', (key === 'current' ? '本次 · ' : '对照 · ') + label(run.conditions));
        setText('path-' + key + '-value', amount(run.pathMeans[pathName]));
        $('path-' + key + '-bar').style.width = (run.pathMeans[pathName] / scale * 100) + '%';
      }
    }

    function render(save = false) {
      active = HDScenario.run(conditions);
      conditions = active.conditions;
      const storm = scene === 'storm';
      $('wind-storm-chart').hidden = !storm;
      $('wind-path-chart').hidden = storm;
      change.hidden = false;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === scene)));
      for (const slider of sliders) slider.value = conditions[slider.id];
      setText('strengthV', conditions.strength ? conditions.strength + '%' : '无台风');
      setText('daysV', conditions.days + ' 天');
      setText('delayV', conditions.delay + ' 年');
      setText('shoeV', conditions.shoe + '%');
      setText('wind-condition', conditionsText(conditions));
      if (storm) renderStorm();
      else renderPath();
      setResult(active);
      setText('wind-announcement', conditionsText(conditions) + '。2030 年全县中位数 ' + amount(active.summary.p50) +
        '，越过参考线比例 ' + percent(active.summary.hit) + '。');
      document.querySelector('[data-evidence]').href = scenes[scene].evidence;
      $('open-report').href = runLink('report.html', active, scene);
      if (save) {
        HDScenario.remember(active);
        try { history.replaceState(null, '', runLink('windtunnel.html', active, scene)); } catch {}
      }
    }

    for (const button of buttons) button.addEventListener('click', () => {
      scene = button.dataset.scene;
      conditions = scenes[scene].conditions;
      render(true);
    });
    for (const slider of sliders) slider.addEventListener('input', () => {
      conditions = {...conditions, [slider.id]: Number(slider.value)};
      render(true);
    });
    change.addEventListener('click', () => {
      if (scene === 'storm') conditions = nextStorm(conditions);
      else if (scene === 'shoe') conditions = {...conditions, shoe: conditions.shoe === 100 ? 80 : 100};
      else conditions = {...conditions, delay: conditions.delay ? 0 : 1};
      render(true);
    });
    $('open-report').addEventListener('click', () => HDScenario.remember(active));
    render();
  }

  function initReport() {
    const active = HDScenario.run(HDScenario.reportConditions());
    const {conditions, summary} = active;
    const scene = readScene(conditions);
    setResult(active);
    setText('report-conditions', '本次条件 · ' + conditionsText(conditions));
    if (conditions.strength) {
      const effects = HDScenario.stormEffects(conditions);
      setText('report-summary', '在停业 ' + conditions.days + ' 天的模拟情景下，当年旅游停业损失约 ' +
        lossAmount(effects.tourism) + '，渔业与海洋牧场损失约 ' + lossAmount(effects.fishery) + '。');
    } else {
      setText('report-summary', '在这组条件下，2030 年全县 GDP 模拟结果的中央 80% 落在 ' + range(summary) + '。');
    }
    $('adjust-run').href = runLink('windtunnel.html', active, scene);
    $('open-ending').href = runLink('ending.html', active, scene);
    document.querySelector('[data-evidence]').href = scenes[scene].evidence;

    const track = $('report-range');
    const low = Math.min(HT.TARGET - 100, Math.floor(summary.p10 / 50) * 50);
    const high = Math.max(HT.TARGET + 100, Math.ceil(summary.p90 / 50) * 50);
    const position = value => ((value - low) / (high - low) * 100) + '%';
    track.style.setProperty('--range-low', position(summary.p10));
    track.style.setProperty('--range-med', position(summary.p50));
    track.style.setProperty('--range-high', position(summary.p90));
    track.style.setProperty('--range-target', position(HT.TARGET));
    track.setAttribute('aria-label', '全县 GDP 模拟区间 ' + range(summary) + '，中位数 ' + amount(summary.p50) + '。');
    setText('report-axis-low', amount(low));
    setText('report-axis-high', amount(high));
  }

  const view = document.body.dataset.hdView;
  if (view === 'home') initHome();
  if (view === 'wind') initWind();
  if (view === 'report') initReport();
})();
