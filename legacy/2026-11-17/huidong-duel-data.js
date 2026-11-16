const bulletin = {
  label: '2025 年惠东县统计公报（站内报告收录）',
  href: 'report.html'
};

export const quizzes = {
  index: {
    id: 'introduce',
    type: 'pick',
    title: '向外地朋友介绍惠东，你会先讲哪一样？',
    options: ['双月湾', '海龟湾', '赤岸生蚝', '惠东女鞋', '太平岭核电'],
    picks: [
      '可以从双月湾的日出讲起。双湾抱月，来逛、吃一顿海鲜、住一晚，是三种不同的体验。',
      '可以从海龟湾讲起。大陆唯一海龟国家级保护区，是“惠东的海足够干净”最硬的招牌。',
      '可以从一口赤岸蚝讲起。铁涌赤岸村秋冬蚝肥，背后是养殖、加工和销路的一笔账。',
      '可以从女鞋讲起。吉隆、黄埠是“中国女鞋生产基地”，厂房背后还有配套和工作机会。',
      '可以从核电讲起。华龙一号落地太平岭，清洁能源基地，按抗台标准建设、风浪里几乎不停摆。'
    ],
    evidence: { href: 'town.html', label: '看各镇的海味与山海' }
  },
  town: {
    id: 'weekend',
    type: 'pick',
    title: '只有半天，你想和朋友去哪边？',
    options: ['双月湾看海', '海龟湾亲子'],
    picks: [
      '双月湾这条路，先选你想看的海景，再决定在附近吃哪一顿海鲜。',
      '海龟湾这条路，把时间留给海龟和科普馆。可以从各镇卡片先找平海、港口。'
    ],
    evidence: { href: '#grid', label: '去看两地的镇街卡' }
  },
  network: {
    id: 'connection',
    type: 'guess',
    title: '图上深圳、广州两条外联线，哪一条画得更粗？',
    options: ['深圳', '广州'],
    correct: 0,
    answer: '深圳的线更粗',
    facts: [['深圳', '大湾区客源 · 产业'], ['广州', '省会 · 客源']],
    detail: '两条线都在本站关系图里。线宽表示图中的关系强弱设定。要查真实的人流与订单，还得看高铁班次、自驾客流和实际订单。',
    evidence: { href: '#svg', label: '回到原关系图找这两条线' }
  },
  who: {
    id: 'population',
    type: 'guess',
    title: '每 100 位惠东常住居民，大约几位住在城镇？',
    options: ['不到 50 位', '约 60 位', '超过 80 位'],
    correct: 1,
    answer: '约 64 位',
    facts: [['城镇常住居民', '约 65.9 万', .638], ['农村常住居民', '约 37.4 万', .362]],
    detail: '2025 年末惠东常住人口约 103.3 万，城镇化率 63.8%，统计范围包括全县各镇街。',
    source: bulletin,
    evidence: { href: '#c6', label: '看人口对照图' }
  },
  future: {
    id: 'future-spread',
    type: 'guess',
    title: '同一组条件推演 2030 年，常见结果能差多少？',
    options: ['不到 100 亿', '100 到 200 亿', '200 亿以上'],
    detail: '取默认一万次模拟中间 80% 的结果，比较这段区间的两端。高端和低端是同一组假设下的两种可能。',
    model: 'spread',
    evidence: { href: '#chHist', label: '打开分布图看整个区间' }
  },
  blindspot: {
    id: 'visitor-spend',
    type: 'guess',
    title: '惠东一年游客 1800 万，旅游收入摊下来每人次多少？',
    options: ['约 300 元', '约 750 元', '约 1,200 元'],
    correct: 1,
    answer: '约 749 元／人次',
    facts: [['2025 年旅游综合收入', '约 135 亿元'], ['2025 年接待游客', '1,803 万人次']],
    detail: '全县旅游综合收入除以接待游客人次，得到这个平均数。过夜游客约 809 万人次、占四成多，当天往返的仍占多数。',
    source: bulletin,
    evidence: { href: 'report.html', label: '看报告里的游客与收入' }
  }
};

export const setups = {
  choices: {
    id: 'five-roads',
    title: '五条路，你会留下哪几条？',
    hint: '拨下面的开关，试出你的一套组合。好友打开即看到同一组开关，可以再改一项回给你。',
    metric: '2030 模拟过约 1200 比例',
    target: 'curHit'
  },
  windtunnel: {
    id: 'wind-dials',
    title: '同一场风洞，朋友会先改哪一项？',
    hint: '拖动下面任意滑杆，把这组设置发给朋友。好友可以只改一项，看两种结果相差多少。',
    metric: '2030 模拟过约 1200 比例',
    target: 'oHit'
  }
};

export const reportDuel = {
  id: 'five-year-guess',
  title: '惠东按 4.0% 连续增长五年，能到 1200 亿吗？',
  options: ['够，能追上', '还会差一截'],
  correct: 1,
  selectors: {
    stage: '#report-stage',
    ballot: '#report-vote'
  },
  keys: ['reach', 'short']
};
