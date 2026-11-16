import { quizzes, setups, reportDuel } from './huidong-duel-data.js';

const page = document.body.dataset.duelPage;
const mount = document.getElementById('friend-duel');
const query = new URLSearchParams(location.search);
const pageKey = query.get('duel');
const canShare = typeof navigator.share === 'function';

function inviteFor(spec, valid) {
  if (pageKey !== spec.id) return { incoming: false, from: null, reply: null };
  const from = query.get('from');
  const reply = query.get('reply');
  return {
    incoming: true,
    from: valid(from) ? from : null,
    reply: valid(from) && valid(reply) ? reply : null
  };
}

function validOption(spec, option) {
  return option !== null && /^[0-9]$/.test(option) && Number(option) < spec.options.length;
}

function inviteMessage(spec, own, visit) {
  const responding = own !== null && visit.from !== null && visit.reply === null;
  const sharingComparison = visit.reply !== null && (spec.metric === undefined || own === visit.reply);
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('duel', spec.id);
  if (own !== null || sharingComparison) url.searchParams.set('from', responding || sharingComparison ? visit.from : own);
  if (responding || sharingComparison) url.searchParams.set('reply', sharingComparison ? visit.reply : own);
  const setting = spec.metric !== undefined;
  return {
    title: spec.title,
    text: sharingComparison ? '我和朋友都做了，打开看看两边差在哪。' :
      responding ? '我也选了，打开看看我们差在哪。' :
      setting ? '这是我试的一组设置。打开改一项，跟我比比。' :
      own === null ? '这题你会怎么选？' : '我已经选了，你选完再看我们是不是一样。',
    url: url.href
  };
}

function mountShare(getPayload) {
  mount.insertAdjacentHTML('beforeend', `
    <div class="duel-actions">
      <button type="button" data-duel-action="share" class="duel-share"></button>
      ${canShare ? '<button type="button" data-duel-action="copy" class="duel-copy-button">复制题目和链接</button>' : ''}
    </div>
    <p class="duel-status" role="status"></p>
    <div class="duel-copy" hidden>
      <a class="duel-invite-link" target="_blank" rel="noopener">看看朋友打开的页面 →</a>
      <div class="duel-copy-text" hidden>
        <label for="duel-invite-text">长按或选中复制这段邀请</label>
        <textarea id="duel-invite-text" readonly></textarea>
      </div>
    </div>`);
  const button = mount.querySelector('[data-duel-action="share"]');
  const status = mount.querySelector('.duel-status');
  const copyBox = mount.querySelector('.duel-copy');
  const manual = mount.querySelector('.duel-copy-text');
  const invite = mount.querySelector('.duel-invite-link');
  const field = mount.querySelector('textarea');

  async function send(action) {
    const payload = getPayload();
    const text = payload.title + '\n' + payload.text + '\n' + payload.url;
    copyBox.hidden = true;
    if (action === 'share' && canShare) {
      try {
        await navigator.share({ title: payload.title, text: payload.title + '\n' + payload.text, url: payload.url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    copyBox.hidden = false;
    manual.hidden = true;
    invite.href = payload.url;
    field.value = text;
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = '题目和链接已复制，可以发给朋友。';
    } catch {
      manual.hidden = false;
      status.textContent = '可以手动复制下面的题目和链接。';
      field.focus();
      field.select();
    }
  }

  mount.querySelector('.duel-actions').addEventListener('click', event => {
    const item = event.target.closest('[data-duel-action]');
    if (item) send(item.dataset.duelAction);
  });
  document.querySelector('[data-duel-footer]')?.addEventListener('click', () => {
    mount.scrollIntoView({ block: 'nearest' });
    button.focus({ preventScroll: true });
  });

  return function setButton(label) {
    button.textContent = label;
    status.textContent = '';
    copyBox.hidden = true;
  };
}

function choicesTogether(spec, own, visit) {
  if (visit.from === null || own === null) return '';
  const answer = visit.reply ?? own;
  return `<div class="duel-pair">
    <div><span>${visit.reply !== null ? '发起人的选择' : '朋友先选'}</span><strong>${spec.options[Number(visit.from)]}</strong></div>
    <div><span>${visit.reply !== null ? '好友回传的选择' : '你刚选'}</span><strong>${spec.options[Number(answer)]}</strong></div>
  </div><p class="duel-detail">${visit.from === answer ? '你们选到一起了。' : '你们选得不一样。'}</p>`;
}

function invitationNote(visit) {
  if (visit.reply !== null) return '好友回传了答案';
  if (visit.from !== null) return '朋友已选，选完一起揭晓';
  return visit.incoming ? '朋友发来一道题' : '';
}

function shareLabel(visit, own, setting = false, preference = false) {
  if (visit.from !== null && visit.reply === null && own !== null) return setting ? '把新设置回给朋友' : '把答案回给朋友';
  if (visit.reply !== null && (!setting || own === visit.reply)) return '转发这次对照';
  if (setting) return '发给朋友试这组设置';
  return preference ? '邀朋友也选一次' : '邀朋友同猜';
}

function factsMarkup(facts) {
  if (!facts?.length) return '';
  return `<div class="duel-facts">${facts.map(([name, value, portion]) => `
    <div class="duel-fact"><span>${name}</span><strong>${value}</strong>
      ${Number.isFinite(portion) ? `<div class="duel-meter" aria-hidden="true"><span style="--duel-amount:${portion * 100}%"></span></div>` : ''}
    </div>`).join('')}</div>`;
}

function loadOutcome(spec) {
  if (spec.model !== 'spread') return spec;
  if (typeof HT === 'undefined') return { ...spec, failed: true, answer: '打开下方图表，可以继续查看模拟分布。' };
  const { p10, p90 } = HT.run(42, 10000, HT.DEFAULT_PATHS);
  const gap = p90 - p10;
  return { ...spec,
    correct: gap < 100 ? 0 : gap <= 200 ? 1 : 2,
    answer: `约差 ${Math.round(gap)} 亿元`,
    facts: [['中间区间低端', `约 ${Math.round(p10)} 亿`], ['中间区间高端', `约 ${Math.round(p90)} 亿`]]
  };
}

function jumpToInvite(visit, target = mount) {
  if (visit.incoming) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}

function startQuiz(spec) {
  const visit = inviteFor(spec, token => validOption(spec, token));
  let own = visit.reply;
  let revealed;
  if (visit.incoming && own === null) mount.classList.add('duel-landing');
  mount.innerHTML = `
    <p class="duel-kicker">${invitationNote(visit) || (spec.type === 'pick' ? '和朋友选一选' : '给朋友出道题')}</p>
    <h2 class="duel-title" id="duel-title">${spec.title}</h2>
    <div class="duel-options" role="group" aria-label="作出你的选择">
      ${spec.options.map((option, index) => `<button type="button" data-duel-choice="${index}" aria-pressed="false" aria-controls="duel-result">${option}</button>`).join('')}
    </div>
    <div class="duel-result" id="duel-result" aria-live="polite" hidden></div>`;
  const result = mount.querySelector('#duel-result');
  const setButton = mountShare(() => inviteMessage(spec, own, visit));

  function update(animate = false) {
    setButton(shareLabel(visit, own, false, spec.type === 'pick'));
    if (own === null) return;
    const option = Number(own);
    const pick = spec.type === 'pick';
    if (!revealed && !pick) revealed = loadOutcome(spec);
    for (const button of mount.querySelectorAll('[data-duel-choice]')) {
      button.setAttribute('aria-pressed', String(button.dataset.duelChoice === own));
    }
    const headline = pick ? spec.options[option] : revealed.answer;
    const detail = pick ? spec.picks[option] : revealed.detail;
    const right = !pick && !revealed.failed && visit.reply === null
      ? (option === revealed.correct ? '你猜中了。' : '这一题的答案是') : '';
    result.hidden = false;
    result.classList.toggle('reveal-duel', animate);
    result.innerHTML = `<p class="duel-answer">${right && !pick ? `<span class="duel-kicker">${right}</span> ` : ''}${headline}</p>
      ${choicesTogether(spec, own, visit)}${pick ? '' : factsMarkup(revealed.facts)}
      <p class="duel-detail">${detail || ''}</p><div class="duel-evidence">
        <a href="${spec.evidence.href}">${spec.evidence.label} →</a>
        ${spec.source ? `<a href="${spec.source.href}">${spec.source.label}</a>` : ''}
      </div>`;
  }

  mount.querySelector('.duel-options').addEventListener('click', event => {
    const button = event.target.closest('[data-duel-choice]');
    if (!button) return;
    const first = own === null;
    own = button.dataset.duelChoice;
    mount.classList.remove('duel-landing');
    update(first);
  });
  update();
  jumpToInvite(visit);
}

function setupBinding() {
  if (page === 'choices') {
    const paths = Array.from(document.querySelectorAll('.path[data-i]')).sort((a, b) => Number(a.dataset.i) - Number(b.dataset.i));
    return {
      controlSelector: '.path[data-i]',
      valid: token => token !== null && /^[01]{5}$/.test(token),
      read: () => paths.map(path => path.classList.contains('on') ? '1' : '0').join(''),
      apply: token => paths.forEach((path, index) => {
        if (path.classList.contains('on') !== (token[index] === '1')) path.click();
      }),
      caption: token => {
        const names = ['清洁能源', '新材料', '滨海旅游', '女鞋时尚', '特色农渔'];
        const selected = names.filter((_, index) => token[index] === '1');
        return selected.length ? selected.join(' · ') : '五条全部关闭';
      }
    };
  }
  const sliderIds = ['strength', 'days', 'delay', 'shoe'];
  const sliders = sliderIds.map(id => document.getElementById(id));
  const split = token => token.split(',');
  return {
    controlSelector: '#strength, #days, #delay, #shoe',
    valid: token => {
      if (token === null || !/^-?\d{1,3}(,-?\d{1,3}){3}$/.test(token)) return false;
      return split(token).every((v, i) => Number(v) >= Number(sliders[i].min) && Number(v) <= Number(sliders[i].max));
    },
    read: () => sliders.map(el => el.value).join(','),
    apply: token => {
      split(token).forEach((value, index) => { sliders[index].value = value; });
      sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
    },
    caption: token => {
      const [strength, days, delay, shoe] = split(token);
      const strengthLabel = Number(strength) === 0 ? '无台风' : `台风强度 ${strength}%`;
      return `${strengthLabel} · 停业 ${days} 天 · 核电延迟 ${delay} 年 · 女鞋景气 ${shoe}%`;
    }
  };
}

function startSetup(spec) {
  const binding = setupBinding();
  const visit = inviteFor(spec, binding.valid);
  const metric = document.getElementById(spec.target);
  if (visit.from !== null && visit.from !== binding.read()) binding.apply(visit.from);
  const baseline = visit.from !== null ? metric.textContent.trim() : null;
  if (visit.reply !== null && visit.reply !== binding.read()) binding.apply(visit.reply);

  mount.innerHTML = `<p class="duel-kicker">${visit.reply !== null ? '好友回传了设置' : visit.from !== null ? '已载入好友的设置' : '和朋友比一组设置'}</p>
    <h2 class="duel-title" id="duel-title">${spec.title}</h2>
    <p class="duel-hint">${visit.from !== null && visit.reply === null ? '就在下面改一个开关或滑杆，上方会显示改前改后的差别。' : spec.hint}</p>
    <div class="duel-comparison" aria-live="polite"></div>`;
  const compare = mount.querySelector('.duel-comparison');
  const sendable = () => binding.valid(binding.read()) ? binding.read() : null;
  const setButton = mountShare(() => inviteMessage(spec, sendable(), visit));

  function update() {
    const own = binding.read();
    const value = metric.textContent.trim();
    const original = visit.from !== null ? `<div><span>${visit.reply !== null ? '原设置' : '好友的设置'} · ${spec.metric}</span>
      <strong class="duel-number">${baseline}</strong><p>${binding.caption(visit.from)}</p></div>` : '';
    const rateOf = text => Number.parseFloat((text || '').replace(/[^.\d-]/g, ''));
    const gap = Math.round((rateOf(value) - rateOf(baseline)) * 10) / 10;
    const summary = baseline === null || !Number.isFinite(gap) ? '' : own === visit.from ? '你们现在用的是同一组设置。' :
      gap === 0 ? '两组设置显示相同的过线率。' :
      `这组设置比原来${gap > 0 ? '高' : '低'} ${Math.abs(gap)} 个百分点。`;
    compare.innerHTML = `<div class="duel-pair">${original}
      <div><span>${visit.reply !== null && own === visit.reply ? '收到的设置' : '你现在的设置'} · ${spec.metric}</span>
      <strong class="duel-number">${value}</strong><p>${binding.caption(own)}</p></div></div>
      ${summary ? `<p class="duel-delta">${summary}</p>` : ''}`;
    setButton(shareLabel(visit, own, true));
  }

  function controlChanged(event) {
    if (event.target.closest(binding.controlSelector)) update();
  }
  document.addEventListener('input', controlChanged);
  document.addEventListener('click', controlChanged);
  update();
  jumpToInvite(visit);
}

function endingSpecs() {
  const { topics } = JSON.parse(document.getElementById('question-data').textContent);
  return Object.fromEntries(Object.entries(topics).map(([key, topic]) => [key, {
    id: 'follow-' + key,
    title: topic.guess.title.join(''),
    options: topic.guess.choices,
    keys: topic.guess.choices.map((_, index) => String(index)),
    selectors: { stage: '#guess-stage', ballot: '#vote-buttons' }
  }]));
}

function startNative() {
  const ending = page === 'ending';
  const specs = ending ? endingSpecs() : { report: reportDuel };
  const wanted = Object.keys(specs).find(key => specs[key].id === pageKey);
  if (ending && wanted) document.querySelector(`#subject-switch [data-question="${wanted}"]`)?.click();

  const specForPage = () => specs[ending ? document.getElementById('question-detail').dataset.topic : 'report'] || specs.tourists;
  const selected = spec => {
    const pressed = document.querySelector(spec.selectors.ballot + ' [data-vote][aria-pressed="true"]');
    return pressed ? String(spec.keys.indexOf(pressed.dataset.vote)) : null;
  };
  const view = spec => inviteFor(spec, token => validOption(spec, token));

  mount.innerHTML = '<p class="duel-kicker"></p><div class="duel-native-compare" aria-live="polite"></div>';
  const note = mount.querySelector('.duel-kicker');
  const compare = mount.querySelector('.duel-native-compare');
  const setButton = mountShare(() => {
    const spec = specForPage();
    return inviteMessage(spec, selected(spec), view(spec));
  });
  function update() {
    const spec = specForPage();
    const own = selected(spec);
    const visit = view(spec);
    note.textContent = own !== null && visit.reply === null ? '' : invitationNote(visit);
    compare.innerHTML = choicesTogether(spec, own, visit);
    setButton(shareLabel(visit, own));
  }

  const spec = specForPage();
  const visit = view(spec);
  if (visit.reply !== null) {
    document.querySelector(spec.selectors.ballot + ` [data-vote="${spec.keys[Number(visit.reply)]}"]`)?.click();
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-vote], #subject-switch button, #retake, #report-retake')) update();
  });
  window.addEventListener('hashchange', update);
  window.addEventListener('popstate', update);
  update();
  jumpToInvite(visit, document.querySelector(spec.selectors.stage));
}

if (mount) {
  if (Object.hasOwn(quizzes, page)) startQuiz(quizzes[page]);
  else if (Object.hasOwn(setups, page)) startSetup(setups[page]);
  else startNative();
  mount.hidden = false;
}
