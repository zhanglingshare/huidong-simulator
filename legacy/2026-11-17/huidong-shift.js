(() => {
  const key = 'huidong-public-shift-v1';
  const choices = { keep: '按原班', add: '多排一人' };
  const query = new URLSearchParams(location.search);
  const archive = document.querySelector('[data-shift-archive]');
  const by = (name) => document.querySelector(`[data-shift-${name}]`);
  const numbers = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 });
  const signed = (cents) => (cents > 0 ? '+' : cents < 0 ? '−' : '') + numbers.format(Math.abs(cents) / 100) + ' 元';
  const validChoice = (value) => value === 'keep' || value === 'add';

  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return validChoice(saved?.first) ? saved : null;
    } catch {
      return null;
    }
  }

  let record = read();

  function save(value) {
    record = value;
    try {
      if (value) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function revealArchive() {
    if (query.has('duel') || location.hash === '#grid') archive.open = true;
  }
  revealArchive();
  window.addEventListener('hashchange', revealArchive);
  const archiveFooter = document.querySelector('.likebar');
  if (archiveFooter) {
    const reflectArchive = () => { archiveFooter.hidden = !archive.open; };
    archive.addEventListener('toggle', reflectArchive);
    reflectArchive();
  }

  function renderEntry() {
    by('choices').hidden = Boolean(record);
    by('resume').hidden = !record;
    if (!record) {
      by('heading').textContent = '你第一反应怎么排？';
      by('summary').textContent = '下一页查开复业时间，再用房间和班费试一笔账。';
      return;
    }
    by('heading').textContent = record.final ? '你上次的排班决定' : '继续你上次的判断';
    const context = record.trial?.example ? '演示 · ' : '';
    by('summary').textContent = context + '起初选「' + choices[record.first] + '」' +
      (record.final ? '，对照记录后选「' + choices[record.final] + '」。' : '。');
    by('resume').href = record.trial ? 'town.html#shift-review' : 'town.html#shift-case';
  }

  if (by('entry')) {
    renderEntry();
    window.addEventListener('pageshow', () => {
      record = read();
      renderEntry();
    });
    window.addEventListener('storage', (event) => {
      if (event.key === key || event.key === null) {
        record = read();
        renderEntry();
      }
    });
    return;
  }

  const start = query.get('start');
  let persistent = Boolean(record);
  if (!record && validChoice(start)) persistent = save({ first: start });
  if (validChoice(start) && persistent) {
    const clean = new URL(location.href);
    clean.searchParams.delete('start');
    history.replaceState(null, '', clean);
  }

  const forecast = document.getElementById('shift-forecast');
  const observation = document.getElementById('shift-observation');
  const review = document.getElementById('shift-review');
  const cost = forecast.elements.cost;
  const margin = forecast.elements.margin;
  const expected = forecast.elements.expected;
  const night = forecast.elements.night;
  const rooms = observation.elements.rooms;
  const source = observation.elements.source;
  let example = false;

  function getTrial() {
    const inputs = [cost, margin, expected, night];
    if (inputs.some((input) => !input.validity.valid)) return null;
    return {
      cost: Math.round(cost.valueAsNumber * 100),
      margin: Math.round(margin.valueAsNumber * 100),
      expected: expected.valueAsNumber,
      night: night.value,
      example
    };
  }

  function net(trial, count) {
    return trial.margin * count - trial.cost;
  }

  function putNet(element, cents) {
    element.textContent = signed(cents);
    element.toggleAttribute('data-loss', cents < 0);
  }

  function renderPreview(trial) {
    by('preview').hidden = !trial;
    if (!trial) return;
    by('mode').textContent = trial.example ? '演示数 · 金额和房间数均为虚构' : '你填的估算';
    putNet(by('estimate'), net(trial, trial.expected));
    by('threshold').textContent = '至少多接 ' + numbers.format(Math.ceil(trial.cost / trial.margin)) + ' 间，才能付这班的钱。';
  }

  function fillTrial(trial) {
    cost.value = trial.cost / 100;
    margin.value = trial.margin / 100;
    expected.value = trial.expected;
    night.value = trial.night;
    example = trial.example;
  }

  function updateDraft() {
    by('own').hidden = !example;
    by('mode').textContent = example ? '演示数 · 金额和房间数均为虚构' : '';
    renderPreview(getTrial());
  }

  function renderReview(trial) {
    const check = record.check;
    review.hidden = false;
    observation.hidden = Boolean(check);
    by('observation-fields').hidden = trial.example;
    by('observe').hidden = trial.example;
    by('demo-review').hidden = !trial.example;
    by('review-lead').textContent = trial.example
      ? '复业通告里没有店铺订单数。这里用虚构记录练习怎么核。'
      : '对照 ' + trial.night + ' 当晚，只记原班接不下、加一人能接的房间。';
    by('result').hidden = !check;
    if (!check) return;
    const oldNet = net(trial, trial.expected);
    const checkedNet = net(trial, check.rooms);
    by('before-label').textContent = '预估多接 ' + trial.expected + ' 间';
    const evidence = { demo: '演示记录', bookings: '实际订单', inquiries: '订房意向' };
    by('after-label').textContent = evidence[check.source] + ' · ' + check.rooms + ' 间';
    putNet(by('before-value'), oldNet);
    putNet(by('after-value'), checkedNet);
    by('verdict').textContent = checkedNet < 0 ? '按这笔记录试算，补班费还差 ' + signed(-checkedNet).slice(1) + '。' :
      checkedNet === 0 ? '按这笔记录试算，刚好付清补班费。' :
      '按这笔记录试算，付了补班费，余 ' + signed(checkedNet).slice(1) + '。';
    by('observation-note').textContent = check.source === 'inquiries'
      ? '意向先用来核对接单判断。要对账，再查实际成交和当晚的开销。'
      : '两边沿用同一份成本估算。对账时可再核实收和开销。';
    by('revise').hidden = Boolean(record.final);
    by('finish').hidden = !record.final;
    if (record.final) {
      by('final-status').textContent = '原先「' + choices[record.first] + '」 → 现在「' + choices[record.final] + '」。' +
        (persistent ? ' 两次判断和对照数已保存在本机。' : ' 当前浏览器未能保存。');
    } else {
      by('final-status').textContent = '';
    }
  }

  function renderCase() {
    const trial = record?.trial;
    by('start').hidden = Boolean(record);
    by('first').hidden = !record;
    forecast.hidden = !record;
    review.hidden = !trial;
    by('abandon').hidden = !record || Boolean(record.final);
    if (!record) return;
    by('first').textContent = '你第一反应是「' + choices[record.first] + '」。';
    for (const input of [cost, margin, expected, night]) input.readOnly = Boolean(trial);
    by('forecast-actions').hidden = Boolean(trial);
    by('lock').hidden = Boolean(trial);
    by('calc-status').textContent = trial ? (persistent ? '预估已保存。' : '预估留在当前页。') : '';
    if (!trial) {
      updateDraft();
      return;
    }
    fillTrial(trial);
    renderPreview(trial);
    renderReview(trial);
  }

  forecast.addEventListener('input', updateDraft);
  by('demo').addEventListener('click', () => {
    fillTrial({ cost: 24000, margin: 12000, expected: 3, night: '2026-07-26', example: true });
    updateDraft();
  });
  by('own').addEventListener('click', () => {
    example = false;
    forecast.reset();
    updateDraft();
    cost.focus();
  });
  forecast.addEventListener('submit', (event) => {
    event.preventDefault();
    const trial = getTrial();
    if (!trial || !record || record.trial) return;
    persistent = save({ ...record, trial });
    renderCase();
    review.scrollIntoView({ block: 'start' });
  });

  function checkAgainst(count, type) {
    if (!record?.trial || record.check) return;
    persistent = save({ ...record, check: { rooms: count, source: type } });
    renderCase();
    by('final').focus();
  }

  observation.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!record?.trial || record.trial.example) return;
    const now = new Date();
    const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map((part) => String(part).padStart(2, '0')).join('-');
    if (record.trial.night > today) {
      by('review-status').textContent = '等到这一天，再带回同一晚的记录。';
      return;
    }
    checkAgainst(rooms.valueAsNumber, source.value);
  });
  by('demo-review').addEventListener('click', () => checkAgainst(1, 'demo'));
  for (const button of document.querySelectorAll('[data-shift-final]')) {
    button.addEventListener('click', () => {
      if (!record?.check || record.final) return;
      persistent = save({ ...record, final: button.dataset.shiftFinal });
      renderCase();
      by('finish').querySelector('a').focus();
    });
  }
  for (const button of document.querySelectorAll('[data-shift-reset]')) {
    button.addEventListener('click', () => {
      save(null);
      location.replace('index.html');
    });
  }
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) {
      record = read();
      persistent = Boolean(record);
      renderCase();
    }
  });
  renderCase();
})();
