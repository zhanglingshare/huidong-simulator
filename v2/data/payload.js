window.__EMBEDDED_PAYLOAD__={
  "meta": {
    "version": "real-003",
    "generated_at": "2026-11-15",
    "data_status": "partial_real",
    "status_note": "历史GDP/增速、三产分项、固投为真实公开数据(A/B)；测量模型与结构路径由【模拟问卷】驱动(血统C，N=800，仅跑通信效度与SEM管线，非真实调研)；五条路径水平估计与情景仍为假设，微观系数不折算GDP，待真实问卷替换",
    "caliber": "亿元（人民币），万人次，%",
    "blood_legend": {
      "A": "实测",
      "B": "推估/合作库修订口径",
      "C": "假设·示例"
    },
    "quality_gate": "history_verified_simulated_measurement_models_pending",
    "sources": [
      {
        "id": "S1",
        "blood": "A",
        "name": "2025年惠东县国民经济和社会发展统计公报",
        "url": "https://www.huidong.gov.cn/attachment/0/346/346580/5769408.pdf"
      },
      {
        "id": "S2",
        "blood": "A",
        "name": "2024年1-12月惠东经济运行简析（含2023修订值800.48）",
        "url": "https://www.huidong.gov.cn/hdxtjj/xtjj/tjfx/content/post_5471208.html"
      },
      {
        "id": "S3",
        "blood": "A",
        "name": "2023年惠东县地区生产总值（政府官网）",
        "url": "https://www.huidong.gov.cn/hdxwz/zwgk/sjfb/sjs/content/post_5249385.html"
      },
      {
        "id": "S4",
        "blood": "B",
        "name": "官方合作数据库·惠东县GDP（五经普修订口径，2020-2022）"
      },
      {
        "id": "S5",
        "blood": "A",
        "name": "2025年1-12月惠东县主要经济指标完成情况表（县统计局）",
        "url": "https://www.huidong.gov.cn/hzhdtjj/gkmlpt/content/5/5716/post_5716243.html"
      },
      {
        "id": "S6",
        "blood": "A",
        "name": "2024年惠东县国民经济和社会发展统计公报",
        "url": "https://www.huidong.gov.cn/attachment/0/306/306309/5511757.pdf"
      },
      {
        "id": "S7",
        "blood": "B",
        "name": "2023年惠东县地区生产总值（修订前初步核算）",
        "url": "https://www.huidong.gov.cn/hdxwz/zwgk/sjfb/sjs/content/post_5249385.html"
      },
      {
        "id": "S8",
        "blood": "C",
        "name": "模拟问卷测量与结构模型管线（build_survey.py，seed=42，N=800，合成数据）",
        "url": "internal://survey_responses_sim.csv"
      }
    ],
    "sha256": "41d1a7220e380b8531ffd8338c1902143f2396346710092283efd6745620d0f0"
  },
  "history": {
    "years": [
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ],
    "gdp": {
      "unit": "亿元",
      "blood": [
        "B",
        "B",
        "B",
        "A",
        "A",
        "A"
      ],
      "values": [
        636.59,
        731.06,
        767.91,
        800.48,
        828.51,
        861.25
      ]
    },
    "growth": {
      "unit": "%",
      "blood": [
        "B",
        "B",
        "B",
        "A",
        "A",
        "A"
      ],
      "values": [
        1.5,
        10.7,
        2.3,
        4.6,
        3.5,
        4.0
      ]
    },
    "p1": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "B",
        "A",
        "A"
      ],
      "values": [
        78.0,
        82.0,
        85.0,
        87.44,
        98.27,
        99.0
      ],
      "caliber_note": "2023为五经普修订前初步核算数（合计762.13），与修订后总量800.48口径不同；2024、2025为修订口径，与GDP总量自洽"
    },
    "p2": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "B",
        "A",
        "A"
      ],
      "values": [
        215.0,
        240.0,
        252.0,
        269.69,
        290.57,
        305.39
      ],
      "caliber_note": "2023为五经普修订前初步核算数（合计762.13），与修订后总量800.48口径不同；2024、2025为修订口径，与GDP总量自洽"
    },
    "p3": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "B",
        "A",
        "A"
      ],
      "values": [
        315.0,
        356.5,
        381.9,
        405.0,
        439.68,
        456.86
      ],
      "caliber_note": "2023为五经普修订前初步核算数（合计762.13），与修订后总量800.48口径不同；2024、2025为修订口径，与GDP总量自洽"
    },
    "tourists": {
      "unit": "万人次",
      "blood": [
        "C",
        "C",
        "C",
        "C",
        "A",
        "C"
      ],
      "values": [
        820,
        1010,
        965,
        1420,
        1756,
        1756
      ]
    },
    "energy": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "C",
        "C",
        "A"
      ],
      "values": [
        45,
        52,
        58,
        66,
        73,
        80
      ]
    },
    "new_material": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "C",
        "C",
        "A"
      ],
      "values": [
        28,
        33,
        38,
        43,
        47,
        50
      ]
    },
    "shoes": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "C",
        "C",
        "C"
      ],
      "values": [
        380,
        405,
        420,
        450,
        478,
        500
      ]
    },
    "fixed_invest": {
      "unit": "亿元",
      "blood": [
        "C",
        "C",
        "C",
        "A",
        "A",
        "A"
      ],
      "values": [
        230,
        268,
        300,
        503.0,
        459.73,
        305.03
      ]
    }
  },
  "dictionary": [
    {
      "key": "gdp",
      "name": "地区生产总值",
      "unit": "亿元",
      "caliber": "当年价",
      "source": "统计公报",
      "blood": "A"
    },
    {
      "key": "p1",
      "name": "第一产业增加值",
      "unit": "亿元",
      "caliber": "当年价",
      "source": "统计公报",
      "blood": "A"
    },
    {
      "key": "p2",
      "name": "第二产业增加值",
      "unit": "亿元",
      "caliber": "当年价",
      "source": "统计公报",
      "blood": "A"
    },
    {
      "key": "p3",
      "name": "第三产业增加值",
      "unit": "亿元",
      "caliber": "当年价",
      "source": "统计公报",
      "blood": "A"
    },
    {
      "key": "tourists",
      "name": "接待游客",
      "unit": "万人次",
      "caliber": "年度累计",
      "source": "文旅部门",
      "blood": "A"
    },
    {
      "key": "energy",
      "name": "能源年产值",
      "unit": "亿元",
      "caliber": "规上口径",
      "source": "政府公开信息",
      "blood": "A"
    }
  ],
  "theory": {
    "layers": [
      {
        "id": "L1",
        "name": "增长生成层",
        "desc": "资本、劳动、技术与项目投资如何生成增加值",
        "micro": "微观系数不直接折算GDP"
      },
      {
        "id": "L2",
        "name": "网络传导与价值留存层",
        "desc": "主体网络如何传导冲击、决定价值留在本地还是外流",
        "micro": "中心性与价值留存挂钩"
      },
      {
        "id": "L3",
        "name": "条件推演与韧性层",
        "desc": "在台风、景气等条件下的情景边界与恢复韧性",
        "micro": "脉冲与噪声分开"
      }
    ],
    "hypotheses": [
      {
        "id": "H1",
        "text": "改变惠东的，主要是产业内部组成、主体网络与价值捕获，而非产业间比例",
        "type": "反常识"
      },
      {
        "id": "H2",
        "text": "能源大投资的产值存在过路成分，本地留存取决于配套与服务网络",
        "type": "待检验"
      },
      {
        "id": "H3",
        "text": "台风冲击的是民宿与渔排，按抗台标准建设的能源设施近乎无损",
        "type": "已有初步证据"
      }
    ],
    "uncertainty": [
      {
        "kind": "随机噪声 aleatory",
        "desc": "路径贡献的年度随机波动，用蒙特卡洛刻画"
      },
      {
        "kind": "参数/认知 epistemic",
        "desc": "μ/σ本身的不确定，用估计区间与情景边界刻画，不做单点伪装"
      }
    ]
  },
  "network": {
    "blood": "C",
    "nodes": [
      {
        "id": "sz",
        "name": "深圳",
        "type": "ext"
      },
      {
        "id": "gz",
        "name": "广州",
        "type": "ext"
      },
      {
        "id": "hk",
        "name": "香港",
        "type": "ext"
      },
      {
        "id": "ss",
        "name": "深汕",
        "type": "ext"
      },
      {
        "id": "ps",
        "name": "平山",
        "type": "space"
      },
      {
        "id": "dl",
        "name": "大岭",
        "type": "space"
      },
      {
        "id": "xl",
        "name": "巽寮",
        "type": "space"
      },
      {
        "id": "ph",
        "name": "平海",
        "type": "space"
      },
      {
        "id": "gk",
        "name": "港口",
        "type": "space"
      },
      {
        "id": "jl",
        "name": "吉隆",
        "type": "space"
      },
      {
        "id": "np",
        "name": "太平岭核电",
        "type": "ind"
      },
      {
        "id": "wind",
        "name": "海上风电",
        "type": "ind"
      },
      {
        "id": "lng",
        "name": "LNG",
        "type": "ind"
      },
      {
        "id": "mat",
        "name": "新材料",
        "type": "ind"
      },
      {
        "id": "shoe",
        "name": "女鞋",
        "type": "ind"
      },
      {
        "id": "tour",
        "name": "滨海文旅",
        "type": "ind"
      },
      {
        "id": "fish",
        "name": "海洋渔业",
        "type": "ind"
      }
    ],
    "edges": [
      [
        "sz",
        "tour",
        "observed"
      ],
      [
        "sz",
        "ps",
        "observed"
      ],
      [
        "gz",
        "tour",
        "observed"
      ],
      [
        "hk",
        "tour",
        "constructed"
      ],
      [
        "ss",
        "shoe",
        "constructed"
      ],
      [
        "ps",
        "dl",
        "observed"
      ],
      [
        "dl",
        "mat",
        "observed"
      ],
      [
        "ps",
        "tour",
        "constructed"
      ],
      [
        "tour",
        "xl",
        "observed"
      ],
      [
        "tour",
        "ph",
        "observed"
      ],
      [
        "tour",
        "gk",
        "observed"
      ],
      [
        "ph",
        "gk",
        "observed"
      ],
      [
        "np",
        "ph",
        "constructed"
      ],
      [
        "np",
        "lng",
        "constructed"
      ],
      [
        "wind",
        "gk",
        "observed"
      ],
      [
        "shoe",
        "jl",
        "constructed"
      ],
      [
        "jl",
        "ph",
        "constructed"
      ],
      [
        "fish",
        "gk",
        "observed"
      ],
      [
        "fish",
        "ph",
        "constructed"
      ],
      [
        "mat",
        "ps",
        "constructed"
      ],
      [
        "lng",
        "ph",
        "constructed"
      ],
      [
        "tour",
        "np",
        "constructed"
      ]
    ],
    "centrality": [
      {
        "name": "滨海文旅",
        "degree": 6,
        "between": 42
      },
      {
        "name": "平海",
        "degree": 6,
        "between": 38
      },
      {
        "name": "港口",
        "degree": 5,
        "between": 24
      },
      {
        "name": "平山",
        "degree": 3,
        "between": 19
      },
      {
        "name": "新材料",
        "degree": 2,
        "between": 12
      }
    ],
    "evolution": {
      "years": [
        2022,
        2023,
        2024,
        2025
      ],
      "nodes": [
        28,
        30,
        32,
        33
      ],
      "edges": [
        34,
        38,
        42,
        46
      ],
      "density": [
        8.9,
        8.7,
        8.5,
        8.7
      ]
    }
  },
  "models": {
    "blood": "C",
    "estimates": [
      {
        "path": "清洁能源",
        "assumed": 120,
        "est": 118,
        "lo": 96,
        "hi": 140,
        "evidence": "simulated_survey",
        "evidence_note": "结构关系由模拟问卷SEM给出（血统C），水平值仍为校准假设，微观系数不折算GDP"
      },
      {
        "path": "新材料",
        "assumed": 90,
        "est": 84,
        "lo": 62,
        "hi": 106,
        "evidence": "simulated_survey",
        "evidence_note": "结构关系由模拟问卷SEM给出（血统C），水平值仍为校准假设，微观系数不折算GDP"
      },
      {
        "path": "滨海旅游",
        "assumed": 70,
        "est": 73,
        "lo": 58,
        "hi": 88,
        "evidence": "simulated_survey",
        "evidence_note": "结构关系由模拟问卷SEM给出（血统C），水平值仍为校准假设，微观系数不折算GDP"
      },
      {
        "path": "女鞋",
        "assumed": 45,
        "est": 41,
        "lo": 30,
        "hi": 52,
        "evidence": "simulated_survey",
        "evidence_note": "结构关系由模拟问卷SEM给出（血统C），水平值仍为校准假设，微观系数不折算GDP"
      },
      {
        "path": "特色农渔",
        "assumed": 25,
        "est": 27,
        "lo": 21,
        "hi": 33,
        "evidence": "simulated_survey",
        "evidence_note": "结构关系由模拟问卷SEM给出（血统C），水平值仍为校准假设，微观系数不折算GDP"
      }
    ],
    "comparison": [
      {
        "model": "加性蒙特卡洛",
        "rmse": 38,
        "mae": 31,
        "r2": 0.62
      },
      {
        "model": "结构计量",
        "rmse": 33,
        "mae": 26,
        "r2": 0.71
      },
      {
        "model": "时间序列基准",
        "rmse": 41,
        "mae": 34,
        "r2": 0.58
      }
    ],
    "backtest": {
      "years": [
        2023,
        2024,
        2025
      ],
      "actual": [
        800.48,
        828.51,
        861.25
      ],
      "predicted": [
        776.0,
        812.5,
        849.0
      ]
    },
    "survey_ref": "survey"
  },
  "scenarios": {
    "blood": "C",
    "target": 1200,
    "list": [
      {
        "id": "base",
        "name": "基准",
        "p50": 1212,
        "p10": 1126,
        "p90": 1297,
        "hit": 56.8
      },
      {
        "id": "energy",
        "name": "能源提速",
        "p50": 1268,
        "p10": 1170,
        "p90": 1366,
        "hit": 72.0
      },
      {
        "id": "shoe",
        "name": "女鞋承压",
        "p50": 1175,
        "p10": 1090,
        "p90": 1262,
        "hit": 38.0
      },
      {
        "id": "storm",
        "name": "台风叠加",
        "p50": 1150,
        "p10": 1040,
        "p90": 1260,
        "hit": 31.0
      }
    ],
    "tornado": [
      {
        "var": "清洁能源 ±20%",
        "lo": -58,
        "hi": 62
      },
      {
        "var": "新材料 ±20%",
        "lo": -40,
        "hi": 44
      },
      {
        "var": "滨海旅游 ±20%",
        "lo": -30,
        "hi": 33
      },
      {
        "var": "女鞋 ±20%",
        "lo": -17,
        "hi": 19
      },
      {
        "var": "农渔 ±20%",
        "lo": -10,
        "hi": 11
      }
    ],
    "histogram": {
      "bins": [
        1040,
        1070,
        1100,
        1130,
        1160,
        1190,
        1220,
        1250,
        1280,
        1310,
        1340
      ],
      "freq": [
        12,
        38,
        96,
        182,
        268,
        305,
        246,
        158,
        82,
        34,
        11
      ]
    }
  },
  "typhoon": {
    "blood": "C",
    "event": "红霞 · 2026-07-26 平海登陆 · 14级",
    "loss": {
      "total": 6.3,
      "tourism": 2.3,
      "fishery": 4.0,
      "energy": 0.0
    },
    "recovery": {
      "months": [
        0,
        1,
        2,
        3,
        6,
        9,
        12
      ],
      "recover": [
        0,
        35,
        58,
        72,
        90,
        97,
        100
      ]
    }
  },
  "decision": {
    "blood": "C",
    "rulers": [
      {
        "ruler": "经济总量",
        "first": "清洁能源",
        "note": "大项目撑起骨架"
      },
      {
        "ruler": "就业饭碗",
        "first": "女鞋",
        "note": "每亿元带动岗位最多"
      },
      {
        "ruler": "生态岸线",
        "first": "特色农渔",
        "note": "对海洋最友好"
      }
    ],
    "indicators": [
      {
        "name": "本地价值留存率",
        "watch": "配套与服务网络密度"
      },
      {
        "name": "三产占比变化",
        "watch": "结构升级而非单纯规模"
      },
      {
        "name": "台风恢复月数",
        "watch": "保险与复产速度"
      },
      {
        "name": "单位岸线产值",
        "watch": "一片海多用法的协调"
      }
    ]
  },
  "survey": {
    "simulated": true,
    "blood": "C",
    "seed": 42,
    "n": 800,
    "likert_scale": 5,
    "generated_at": "2026-11-15",
    "description": "模拟问卷数据，仅用于跑通测量模型与结构方程管线，不代表真实调研结果，不得对外引用",
    "constructs": {
      "POL": "政策支持",
      "BUS": "营商环境",
      "TAL": "人才与创新",
      "INF": "基础设施",
      "MKT": "市场需求",
      "CE": "清洁能源",
      "NM": "新材料",
      "TR": "滨海旅游",
      "SH": "女鞋",
      "AG": "特色农渔"
    },
    "reliability": {
      "POL": {
        "name": "政策支持",
        "alpha": 0.789,
        "items": [
          {
            "code": "POL_1",
            "text": "政策扶持力度",
            "true_loading": 0.72,
            "item_total_corr": 0.84
          },
          {
            "code": "POL_2",
            "text": "审批便利度",
            "true_loading": 0.78,
            "item_total_corr": 0.83
          },
          {
            "code": "POL_3",
            "text": "专项资金到位",
            "true_loading": 0.83,
            "item_total_corr": 0.85
          }
        ],
        "n_items": 3
      },
      "BUS": {
        "name": "营商环境",
        "alpha": 0.787,
        "items": [
          {
            "code": "BUS_1",
            "text": "营商环境满意度",
            "true_loading": 0.72,
            "item_total_corr": 0.81
          },
          {
            "code": "BUS_2",
            "text": "要素获取便利",
            "true_loading": 0.78,
            "item_total_corr": 0.84
          },
          {
            "code": "BUS_3",
            "text": "企业服务质量",
            "true_loading": 0.83,
            "item_total_corr": 0.86
          }
        ],
        "n_items": 3
      },
      "TAL": {
        "name": "人才与创新",
        "alpha": 0.799,
        "items": [
          {
            "code": "TAL_1",
            "text": "人才储备",
            "true_loading": 0.72,
            "item_total_corr": 0.84
          },
          {
            "code": "TAL_2",
            "text": "技术创新能力",
            "true_loading": 0.78,
            "item_total_corr": 0.84
          },
          {
            "code": "TAL_3",
            "text": "研发投入强度",
            "true_loading": 0.83,
            "item_total_corr": 0.85
          }
        ],
        "n_items": 3
      },
      "INF": {
        "name": "基础设施",
        "alpha": 0.738,
        "items": [
          {
            "code": "INF_1",
            "text": "交通通达度",
            "true_loading": 0.72,
            "item_total_corr": 0.8
          },
          {
            "code": "INF_2",
            "text": "园区配套",
            "true_loading": 0.78,
            "item_total_corr": 0.81
          },
          {
            "code": "INF_3",
            "text": "信息网络条件",
            "true_loading": 0.83,
            "item_total_corr": 0.82
          }
        ],
        "n_items": 3
      },
      "MKT": {
        "name": "市场需求",
        "alpha": 0.764,
        "items": [
          {
            "code": "MKT_1",
            "text": "市场需求景气",
            "true_loading": 0.72,
            "item_total_corr": 0.82
          },
          {
            "code": "MKT_2",
            "text": "订单增长",
            "true_loading": 0.78,
            "item_total_corr": 0.82
          },
          {
            "code": "MKT_3",
            "text": "客户拓展",
            "true_loading": 0.83,
            "item_total_corr": 0.83
          }
        ],
        "n_items": 3
      },
      "CE": {
        "name": "清洁能源",
        "alpha": 0.798,
        "items": [
          {
            "code": "CE_1",
            "text": "清洁能源项目进展",
            "true_loading": 0.72,
            "item_total_corr": 0.82
          },
          {
            "code": "CE_2",
            "text": "装机/产能扩张",
            "true_loading": 0.78,
            "item_total_corr": 0.84
          },
          {
            "code": "CE_3",
            "text": "绿色投资意愿",
            "true_loading": 0.83,
            "item_total_corr": 0.87
          }
        ],
        "n_items": 3
      },
      "NM": {
        "name": "新材料",
        "alpha": 0.812,
        "items": [
          {
            "code": "NM_1",
            "text": "新材料研发进展",
            "true_loading": 0.72,
            "item_total_corr": 0.83
          },
          {
            "code": "NM_2",
            "text": "新材料订单",
            "true_loading": 0.78,
            "item_total_corr": 0.87
          },
          {
            "code": "NM_3",
            "text": "产业集聚度",
            "true_loading": 0.83,
            "item_total_corr": 0.86
          }
        ],
        "n_items": 3
      },
      "TR": {
        "name": "滨海旅游",
        "alpha": 0.757,
        "items": [
          {
            "code": "TR_1",
            "text": "游客增长",
            "true_loading": 0.72,
            "item_total_corr": 0.8
          },
          {
            "code": "TR_2",
            "text": "旅游收入",
            "true_loading": 0.78,
            "item_total_corr": 0.82
          },
          {
            "code": "TR_3",
            "text": "旅游项目投资",
            "true_loading": 0.83,
            "item_total_corr": 0.84
          }
        ],
        "n_items": 3
      },
      "SH": {
        "name": "女鞋",
        "alpha": 0.797,
        "items": [
          {
            "code": "SH_1",
            "text": "女鞋订单",
            "true_loading": 0.72,
            "item_total_corr": 0.84
          },
          {
            "code": "SH_2",
            "text": "品牌升级",
            "true_loading": 0.78,
            "item_total_corr": 0.84
          },
          {
            "code": "SH_3",
            "text": "渠道拓展",
            "true_loading": 0.83,
            "item_total_corr": 0.85
          }
        ],
        "n_items": 3
      },
      "AG": {
        "name": "特色农渔",
        "alpha": 0.79,
        "items": [
          {
            "code": "AG_1",
            "text": "特色种养规模",
            "true_loading": 0.72,
            "item_total_corr": 0.82
          },
          {
            "code": "AG_2",
            "text": "渔业转型",
            "true_loading": 0.78,
            "item_total_corr": 0.84
          },
          {
            "code": "AG_3",
            "text": "农产品品牌化",
            "true_loading": 0.83,
            "item_total_corr": 0.86
          }
        ],
        "n_items": 3
      }
    },
    "structural": {
      "CE": {
        "name": "清洁能源",
        "beta": {
          "POL": 0.325,
          "BUS": 0.104,
          "TAL": 0.21,
          "INF": 0.22,
          "MKT": 0.068
        },
        "ci95": {
          "POL": [
            0.265,
            0.385
          ],
          "BUS": [
            0.045,
            0.164
          ],
          "TAL": [
            0.15,
            0.27
          ],
          "INF": [
            0.161,
            0.279
          ],
          "MKT": [
            0.009,
            0.127
          ]
        },
        "p": {
          "POL": 0.0,
          "BUS": 0.0006,
          "TAL": 0.0,
          "INF": 0.0,
          "MKT": 0.0243
        }
      },
      "NM": {
        "name": "新材料",
        "beta": {
          "POL": 0.178,
          "BUS": 0.178,
          "TAL": 0.242,
          "INF": 0.093,
          "MKT": 0.172
        },
        "ci95": {
          "POL": [
            0.115,
            0.242
          ],
          "BUS": [
            0.116,
            0.24
          ],
          "TAL": [
            0.179,
            0.305
          ],
          "INF": [
            0.031,
            0.155
          ],
          "MKT": [
            0.109,
            0.234
          ]
        },
        "p": {
          "POL": 0.0,
          "BUS": 0.0,
          "TAL": 0.0,
          "INF": 0.0033,
          "MKT": 0.0
        }
      },
      "TR": {
        "name": "滨海旅游",
        "beta": {
          "POL": 0.203,
          "BUS": 0.141,
          "TAL": 0.13,
          "INF": 0.202,
          "MKT": 0.27
        },
        "ci95": {
          "POL": [
            0.142,
            0.264
          ],
          "BUS": [
            0.08,
            0.201
          ],
          "TAL": [
            0.07,
            0.191
          ],
          "INF": [
            0.142,
            0.262
          ],
          "MKT": [
            0.21,
            0.33
          ]
        },
        "p": {
          "POL": 0.0,
          "BUS": 0.0,
          "TAL": 0.0,
          "INF": 0.0,
          "MKT": 0.0
        }
      },
      "SH": {
        "name": "女鞋",
        "beta": {
          "POL": 0.169,
          "BUS": 0.131,
          "TAL": 0.148,
          "INF": 0.154,
          "MKT": 0.301
        },
        "ci95": {
          "POL": [
            0.107,
            0.231
          ],
          "BUS": [
            0.07,
            0.192
          ],
          "TAL": [
            0.087,
            0.21
          ],
          "INF": [
            0.093,
            0.215
          ],
          "MKT": [
            0.24,
            0.362
          ]
        },
        "p": {
          "POL": 0.0,
          "BUS": 0.0,
          "TAL": 0.0,
          "INF": 0.0,
          "MKT": 0.0
        }
      },
      "AG": {
        "name": "特色农渔",
        "beta": {
          "POL": 0.195,
          "BUS": 0.142,
          "TAL": 0.067,
          "INF": 0.176,
          "MKT": 0.163
        },
        "ci95": {
          "POL": [
            0.129,
            0.261
          ],
          "BUS": [
            0.077,
            0.207
          ],
          "TAL": [
            0.002,
            0.133
          ],
          "INF": [
            0.111,
            0.242
          ],
          "MKT": [
            0.098,
            0.228
          ]
        },
        "p": {
          "POL": 0.0,
          "BUS": 0.0,
          "TAL": 0.0445,
          "INF": 0.0,
          "MKT": 0.0
        }
      }
    },
    "fit": {
      "CE": {
        "r2": 0.343,
        "adj_r2": 0.338
      },
      "NM": {
        "r2": 0.272,
        "adj_r2": 0.267
      },
      "TR": {
        "r2": 0.321,
        "adj_r2": 0.317
      },
      "SH": {
        "r2": 0.298,
        "adj_r2": 0.294
      },
      "AG": {
        "r2": 0.2,
        "adj_r2": 0.195
      }
    },
    "parameter_recovery": {
      "summary": {
        "beta_correlation_true_vs_est": 0.806,
        "mean_abs_bias": 0.045,
        "ci95_coverage": 0.72,
        "note": "模拟数据下可对照真实生成参数，检验管线是否准确回收结构；真实问卷无此对照"
      },
      "detail": [
        {
          "path": "CE",
          "driver": "POL",
          "true_beta": 0.3,
          "est_beta": 0.325,
          "ci_covered_true": true
        },
        {
          "path": "CE",
          "driver": "BUS",
          "true_beta": 0.1,
          "est_beta": 0.104,
          "ci_covered_true": true
        },
        {
          "path": "CE",
          "driver": "TAL",
          "true_beta": 0.25,
          "est_beta": 0.21,
          "ci_covered_true": true
        },
        {
          "path": "CE",
          "driver": "INF",
          "true_beta": 0.3,
          "est_beta": 0.22,
          "ci_covered_true": false
        },
        {
          "path": "CE",
          "driver": "MKT",
          "true_beta": 0.15,
          "est_beta": 0.068,
          "ci_covered_true": false
        },
        {
          "path": "NM",
          "driver": "POL",
          "true_beta": 0.2,
          "est_beta": 0.178,
          "ci_covered_true": true
        },
        {
          "path": "NM",
          "driver": "BUS",
          "true_beta": 0.2,
          "est_beta": 0.178,
          "ci_covered_true": true
        },
        {
          "path": "NM",
          "driver": "TAL",
          "true_beta": 0.35,
          "est_beta": 0.242,
          "ci_covered_true": false
        },
        {
          "path": "NM",
          "driver": "INF",
          "true_beta": 0.1,
          "est_beta": 0.093,
          "ci_covered_true": true
        },
        {
          "path": "NM",
          "driver": "MKT",
          "true_beta": 0.15,
          "est_beta": 0.172,
          "ci_covered_true": true
        },
        {
          "path": "TR",
          "driver": "POL",
          "true_beta": 0.2,
          "est_beta": 0.203,
          "ci_covered_true": true
        },
        {
          "path": "TR",
          "driver": "BUS",
          "true_beta": 0.15,
          "est_beta": 0.141,
          "ci_covered_true": true
        },
        {
          "path": "TR",
          "driver": "TAL",
          "true_beta": 0.1,
          "est_beta": 0.13,
          "ci_covered_true": true
        },
        {
          "path": "TR",
          "driver": "INF",
          "true_beta": 0.3,
          "est_beta": 0.202,
          "ci_covered_true": false
        },
        {
          "path": "TR",
          "driver": "MKT",
          "true_beta": 0.3,
          "est_beta": 0.27,
          "ci_covered_true": true
        },
        {
          "path": "SH",
          "driver": "POL",
          "true_beta": 0.1,
          "est_beta": 0.169,
          "ci_covered_true": false
        },
        {
          "path": "SH",
          "driver": "BUS",
          "true_beta": 0.25,
          "est_beta": 0.131,
          "ci_covered_true": false
        },
        {
          "path": "SH",
          "driver": "TAL",
          "true_beta": 0.15,
          "est_beta": 0.148,
          "ci_covered_true": true
        },
        {
          "path": "SH",
          "driver": "INF",
          "true_beta": 0.1,
          "est_beta": 0.154,
          "ci_covered_true": true
        },
        {
          "path": "SH",
          "driver": "MKT",
          "true_beta": 0.35,
          "est_beta": 0.301,
          "ci_covered_true": true
        },
        {
          "path": "AG",
          "driver": "POL",
          "true_beta": 0.25,
          "est_beta": 0.195,
          "ci_covered_true": true
        },
        {
          "path": "AG",
          "driver": "BUS",
          "true_beta": 0.1,
          "est_beta": 0.142,
          "ci_covered_true": true
        },
        {
          "path": "AG",
          "driver": "TAL",
          "true_beta": 0.1,
          "est_beta": 0.067,
          "ci_covered_true": true
        },
        {
          "path": "AG",
          "driver": "INF",
          "true_beta": 0.25,
          "est_beta": 0.176,
          "ci_covered_true": false
        },
        {
          "path": "AG",
          "driver": "MKT",
          "true_beta": 0.2,
          "est_beta": 0.163,
          "ci_covered_true": true
        }
      ]
    },
    "raw_file": "survey_responses_sim.csv"
  }
};
