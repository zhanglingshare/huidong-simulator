/* ============================================================
 * 惠东产业风洞 · 三层共用数据层 huidong-data.js
 * ------------------------------------------------------------
 * 用途：大众版(legacy) / 爱好者版(v2) / 内部版 共用同一份离线数据
 * 血统分级：A=官方公报直接数字 · B=官方口径换算 · C=建模/模拟假设
 * 纪律：
 *   1. 微观系数不折算 GDP（结构关系用 C 级，水平值单独校准）
 *   2. 2023 三产为五经普修订前口径，2024/2025 为修订后口径
 *   3. 2032 三产 1:5:4 是结构方向（罗盘），不是硬指标
 * 来源：huidong-portal/payload-real-004.json（OSINT 驱动，partial_real）
 * ============================================================ */
(function (root) {
  'use strict';

  var HD_DATA = {
    meta: {
      name: '惠东产业风洞 · 数据底座',
      version: 'data-2026-11',
      dataStatus: 'partial_real',
      statusNote: '历史总量为真实公开数据；问卷为 OSINT 驱动模拟（N=800, C级）；模型水平值为校准假设',
      caliber: '亿元（人民币）、万人次、%',
      bloodLegend: { A: '官方公报直接数字', B: '官方口径换算', C: '建模/模拟假设' }
    },

    /* ---------- 历史总量（2020-2025，真实公开数据） ---------- */
    history: {
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      gdp: {
        unit: '亿元',
        blood: ['B', 'B', 'B', 'A', 'A', 'A'],
        values: [636.59, 731.06, 767.91, 800.48, 828.51, 861.25]
      },
      growth: {
        unit: '%',
        blood: ['B', 'B', 'B', 'A', 'A', 'A'],
        values: [1.5, 10.7, 2.3, 4.6, 3.5, 4.0]
      },
      p1: {
        unit: '亿元',
        blood: ['C', 'C', 'C', 'B', 'A', 'A'],
        values: [78.0, 82.0, 85.0, 87.44, 98.27, 99.0],
        caliberNote: '2023 为五经普修订前初步核算数（总量合计 762.13），与修订后总量 800.48 口径不同；2024、2025 为修订口径，与 GDP 总量自洽'
      },
      p2: {
        unit: '亿元',
        blood: ['C', 'C', 'C', 'B', 'A', 'A'],
        values: [215.0, 240.0, 252.0, 269.69, 290.57, 305.39],
        caliberNote: '同上：2023 修订前口径，2024/2025 修订口径'
      },
      p3: {
        unit: '亿元',
        blood: ['C', 'C', 'C', 'B', 'A', 'A'],
        values: [315.0, 356.5, 381.9, 405.0, 439.68, 456.86],
        caliberNote: '同上：2023 修订前口径，2024/2025 修订口径'
      },
      structure2025: { p1: 99.0, p2: 305.39, p3: 456.86 },
      readStructure: function (yearIndex) {
        var total = this.gdp.values[yearIndex];
        return {
          year: this.years[yearIndex],
          p1: this.p1.values[yearIndex], p2: this.p2.values[yearIndex], p3: this.p3.values[yearIndex],
          p1pct: +(100 * this.p1.values[yearIndex] / total).toFixed(1),
          p2pct: +(100 * this.p2.values[yearIndex] / total).toFixed(1),
          p3pct: +(100 * this.p3.values[yearIndex] / total).toFixed(1)
        };
      }
    },

    /* ---------- 理论假设（学术层） ---------- */
    theory: {
      hypotheses: [
        { id: 'H1', type: '反常识', text: '改变惠东的，主要是产业内部组成、主体网络与价值捕获，而非产业间比例' },
        { id: 'H2', type: '待检验', text: '能源大投资的产值存在过路成分，本地留存取决于配套与服务网络' },
        { id: 'H3', type: '已有初步证据', text: '台风冲击的是民宿与渔排，按抗台标准建设的能源设施近乎无损' }
      ]
    },

    /* ---------- 网络结构（SNA） ---------- */
    network: {
      centrality: [
        { name: '滨海文旅', degree: 6, between: 42 },
        { name: '平海', degree: 6, between: 38 },
        { name: '港口', degree: 5, between: 24 },
        { name: '平山', degree: 3, between: 19 },
        { name: '新材料', degree: 2, between: 12 }
      ]
    },

    /* ---------- 多模型估计（C 级校准假设，不折算 GDP） ---------- */
    models: {
      blood: 'C',
      note: '结构关系由 OSINT 驱动模拟问卷给出（C），水平值为校准假设，微观系数不折算 GDP',
      estimates: [
        { path: '清洁能源', assumed: 120, est: 118, lo: 96, hi: 140 },
        { path: '新材料', assumed: 90, est: 84, lo: 62, hi: 106 },
        { path: '滨海旅游', assumed: 70, est: 73, lo: 56, hi: 90 },
        { path: '女鞋', assumed: 100, est: 96, lo: 82, hi: 110 },
        { path: '特色农渔', assumed: 60, est: 58, lo: 46, hi: 70 }
      ],
      backtest: {
        years: [2023, 2024, 2025],
        actual: [800.48, 828.51, 861.25],
        predicted: [776.0, 812.5, 849.0],
        note: '方向全对，水平偏保守（平均低 2.1%），模型按此校准'
      }
    },

    /* ---------- 情景推演 ---------- */
    scenarios: {
      target2030: 1200,
      list: [
        { id: 'base', name: '基准', p50: 1212, p10: 1126, p90: 1297, hit: 56.8 },
        { id: 'energy', name: '清洁能源拉动', p50: 1245, p10: 1150, p90: 1340, hit: 62.0 },
        { id: 'shoe', name: '女鞋焕新', p50: 1198, p10: 1110, p90: 1280, hit: 49.0 },
        { id: 'storm', name: '台风年', p50: 1140, p10: 1040, p90: 1220, hit: 30.0 }
      ],
      tornado: [
        { var: '清洁能源 ±20%', lo: -58, hi: 62 },
        { var: '新材料 ±20%', lo: -40, hi: 44 },
        { var: '滨海旅游 ±20%', lo: -30, hi: 33 },
        { var: '女鞋 ±20%', lo: -17, hi: 19 },
        { var: '农渔 ±20%', lo: -10, hi: 12 }
      ]
    },

    /* ---------- 台风事件（真实） ---------- */
    typhoon: {
      event: '红霞 · 2026-07-26 平海登陆 · 14级',
      blood: 'B',
      loss: {
        total: 6.3,
        unit: '亿元',
        breakdown: { tourism: 2.3, fishery: 4.0, energy: 0 },
        note: '能源设施按抗台标准建设，近乎无损——H3 的初步证据'
      },
      recovery: { tourismMonths: 3, fisheryMonths: 6 }
    },

    /* ---------- 决策尺子（C 级） ---------- */
    decision: {
      blood: 'C',
      rulers: [
        { ruler: '经济总量', first: '清洁能源', note: '大项目撑起骨架' },
        { ruler: '就业饭碗', first: '女鞋', note: '每亿元带动岗位最多' },
        { ruler: '生态岸线', first: '特色农渔', note: '对海洋最友好' }
      ],
      indicators: [
        { name: '本地价值留存率', watch: '配套与服务网络密度' },
        { name: '三产占比变化', watch: '结构升级而非单纯规模' },
        { name: '台风恢复月数', watch: '保险与复产速度' },
        { name: '单位岸线产值', watch: '一片海多用法的协调' }
      ]
    },

    /* ---------- 模拟问卷（C 级，OSINT 驱动） ---------- */
    survey: {
      simulated: true,
      blood: 'C',
      seed: 42,
      n: 800,
      likertScale: 5,
      method: '开源情报驱动的模拟问卷，结构关系可信，绝对水平不可直接引用'
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = HD_DATA;
  root.HD_DATA = HD_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
