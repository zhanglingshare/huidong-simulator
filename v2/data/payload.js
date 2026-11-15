window.__EMBEDDED_PAYLOAD__={
  "meta": {
    "version": "example-002",
    "generated_at": "2026-11-15",
    "data_status": "example_placeholder",
    "status_note": "示例数据，仅用于搭建与验证前台；2025锚点为真实公开值，其余为待火山引擎核实的占位，不得对外引用",
    "caliber": "亿元（人民币），万人次，%",
    "blood_legend": {"A": "实测", "B": "推估", "C": "假设·示例"},
    "quality_gate": "pending"
  },
  "history": {
    "years": [2020, 2021, 2022, 2023, 2024, 2025],
    "gdp": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [608.2, 678.5, 718.9, 792.4, 828.6, 861.25]},
    "growth": {"unit": "%", "blood": ["C", "C", "C", "C", "C", "A"], "values": [1.5, 11.6, 6.0, 10.2, 4.6, 4.0]},
    "p1": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [78.0, 82.0, 85.0, 90.0, 94.0, 99.0]},
    "p2": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [215.0, 240.0, 252.0, 280.0, 292.0, 305.39]},
    "p3": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [315.0, 356.5, 381.9, 422.4, 442.6, 456.86]},
    "tourists": {"unit": "万人次", "blood": ["C", "C", "C", "C", "A", "C"], "values": [820, 1010, 965, 1420, 1756, 1756]},
    "energy": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [45, 52, 58, 66, 73, 80]},
    "new_material": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "A"], "values": [28, 33, 38, 43, 47, 50]},
    "shoes": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "C"], "values": [380, 405, 420, 450, 478, 500]},
    "fixed_invest": {"unit": "亿元", "blood": ["C", "C", "C", "C", "C", "C"], "values": [230, 268, 300, 335, 360, 388]}
  },
  "dictionary": [
    {"key": "gdp", "name": "地区生产总值", "unit": "亿元", "caliber": "当年价", "source": "统计公报", "blood": "A"},
    {"key": "p1", "name": "第一产业增加值", "unit": "亿元", "caliber": "当年价", "source": "统计公报", "blood": "A"},
    {"key": "p2", "name": "第二产业增加值", "unit": "亿元", "caliber": "当年价", "source": "统计公报", "blood": "A"},
    {"key": "p3", "name": "第三产业增加值", "unit": "亿元", "caliber": "当年价", "source": "统计公报", "blood": "A"},
    {"key": "tourists", "name": "接待游客", "unit": "万人次", "caliber": "年度累计", "source": "文旅部门", "blood": "A"},
    {"key": "energy", "name": "能源年产值", "unit": "亿元", "caliber": "规上口径", "source": "政府公开信息", "blood": "A"}
  ],
  "theory": {
    "layers": [
      {"id": "L1", "name": "增长生成层", "desc": "资本、劳动、技术与项目投资如何生成增加值", "micro": "微观系数不直接折算GDP"},
      {"id": "L2", "name": "网络传导与价值留存层", "desc": "主体网络如何传导冲击、决定价值留在本地还是外流", "micro": "中心性与价值留存挂钩"},
      {"id": "L3", "name": "条件推演与韧性层", "desc": "在台风、景气等条件下的情景边界与恢复韧性", "micro": "脉冲与噪声分开"}
    ],
    "hypotheses": [
      {"id": "H1", "text": "改变惠东的，主要是产业内部组成、主体网络与价值捕获，而非产业间比例", "type": "反常识"},
      {"id": "H2", "text": "能源大投资的产值存在过路成分，本地留存取决于配套与服务网络", "type": "待检验"},
      {"id": "H3", "text": "台风冲击的是民宿与渔排，按抗台标准建设的能源设施近乎无损", "type": "已有初步证据"}
    ],
    "uncertainty": [
      {"kind": "随机噪声 aleatory", "desc": "路径贡献的年度随机波动，用蒙特卡洛刻画"},
      {"kind": "参数/认知 epistemic", "desc": "μ/σ本身的不确定，用估计区间与情景边界刻画，不做单点伪装"}
    ]
  },
  "network": {
    "blood": "C",
    "nodes": [
      {"id": "sz", "name": "深圳", "type": "ext"}, {"id": "gz", "name": "广州", "type": "ext"},
      {"id": "hk", "name": "香港", "type": "ext"}, {"id": "ss", "name": "深汕", "type": "ext"},
      {"id": "ps", "name": "平山", "type": "space"}, {"id": "dl", "name": "大岭", "type": "space"},
      {"id": "xl", "name": "巽寮", "type": "space"}, {"id": "ph", "name": "平海", "type": "space"},
      {"id": "gk", "name": "港口", "type": "space"}, {"id": "jl", "name": "吉隆", "type": "space"},
      {"id": "np", "name": "太平岭核电", "type": "ind"}, {"id": "wind", "name": "海上风电", "type": "ind"},
      {"id": "lng", "name": "LNG", "type": "ind"}, {"id": "mat", "name": "新材料", "type": "ind"},
      {"id": "shoe", "name": "女鞋", "type": "ind"}, {"id": "tour", "name": "滨海文旅", "type": "ind"},
      {"id": "fish", "name": "海洋渔业", "type": "ind"}
    ],
    "edges": [
      ["sz", "tour", "observed"], ["sz", "ps", "observed"], ["gz", "tour", "observed"],
      ["hk", "tour", "constructed"], ["ss", "shoe", "constructed"],
      ["ps", "dl", "observed"], ["dl", "mat", "observed"], ["ps", "tour", "constructed"],
      ["tour", "xl", "observed"], ["tour", "ph", "observed"], ["tour", "gk", "observed"],
      ["ph", "gk", "observed"], ["np", "ph", "constructed"], ["np", "lng", "constructed"],
      ["wind", "gk", "observed"], ["shoe", "jl", "constructed"], ["jl", "ph", "constructed"],
      ["fish", "gk", "observed"], ["fish", "ph", "constructed"], ["mat", "ps", "constructed"],
      ["lng", "ph", "constructed"], ["tour", "np", "constructed"]
    ],
    "centrality": [
      {"name": "滨海文旅", "degree": 6, "between": 42},
      {"name": "平海", "degree": 6, "between": 38},
      {"name": "港口", "degree": 5, "between": 24},
      {"name": "平山", "degree": 3, "between": 19},
      {"name": "新材料", "degree": 2, "between": 12}
    ],
    "evolution": {
      "years": [2022, 2023, 2024, 2025],
      "nodes": [28, 30, 32, 33],
      "edges": [34, 38, 42, 46],
      "density": [8.9, 8.7, 8.5, 8.7]
    }
  },
  "models": {
    "blood": "C",
    "estimates": [
      {"path": "清洁能源", "assumed": 120, "est": 118, "lo": 96, "hi": 140},
      {"path": "新材料", "assumed": 90, "est": 84, "lo": 62, "hi": 106},
      {"path": "滨海旅游", "assumed": 70, "est": 73, "lo": 58, "hi": 88},
      {"path": "女鞋", "assumed": 45, "est": 41, "lo": 30, "hi": 52},
      {"path": "特色农渔", "assumed": 25, "est": 27, "lo": 21, "hi": 33}
    ],
    "comparison": [
      {"model": "加性蒙特卡洛", "rmse": 38, "mae": 31, "r2": 0.62},
      {"model": "结构计量", "rmse": 33, "mae": 26, "r2": 0.71},
      {"model": "时间序列基准", "rmse": 41, "mae": 34, "r2": 0.58}
    ],
    "backtest": {
      "years": [2023, 2024, 2025],
      "actual": [792.4, 828.6, 861.25],
      "predicted": [776.0, 812.5, 849.0]
    }
  },
  "scenarios": {
    "blood": "C",
    "target": 1200,
    "list": [
      {"id": "base", "name": "基准", "p50": 1212, "p10": 1126, "p90": 1297, "hit": 56.8},
      {"id": "energy", "name": "能源提速", "p50": 1268, "p10": 1170, "p90": 1366, "hit": 72.0},
      {"id": "shoe", "name": "女鞋承压", "p50": 1175, "p10": 1090, "p90": 1262, "hit": 38.0},
      {"id": "storm", "name": "台风叠加", "p50": 1150, "p10": 1040, "p90": 1260, "hit": 31.0}
    ],
    "tornado": [
      {"var": "清洁能源 ±20%", "lo": -58, "hi": 62},
      {"var": "新材料 ±20%", "lo": -40, "hi": 44},
      {"var": "滨海旅游 ±20%", "lo": -30, "hi": 33},
      {"var": "女鞋 ±20%", "lo": -17, "hi": 19},
      {"var": "农渔 ±20%", "lo": -10, "hi": 11}
    ],
    "histogram": {
      "bins": [1040, 1070, 1100, 1130, 1160, 1190, 1220, 1250, 1280, 1310, 1340],
      "freq": [12, 38, 96, 182, 268, 305, 246, 158, 82, 34, 11]
    }
  },
  "typhoon": {
    "blood": "C",
    "event": "红霞 · 2026-07-26 平海登陆 · 14级",
    "loss": {"total": 6.3, "tourism": 2.3, "fishery": 4.0, "energy": 0.0},
    "recovery": {
      "months": [0, 1, 2, 3, 6, 9, 12],
      "recover": [0, 35, 58, 72, 90, 97, 100]
    }
  },
  "decision": {
    "blood": "C",
    "rulers": [
      {"ruler": "经济总量", "first": "清洁能源", "note": "大项目撑起骨架"},
      {"ruler": "就业饭碗", "first": "女鞋", "note": "每亿元带动岗位最多"},
      {"ruler": "生态岸线", "first": "特色农渔", "note": "对海洋最友好"}
    ],
    "indicators": [
      {"name": "本地价值留存率", "watch": "配套与服务网络密度"},
      {"name": "三产占比变化", "watch": "结构升级而非单纯规模"},
      {"name": "台风恢复月数", "watch": "保险与复产速度"},
      {"name": "单位岸线产值", "watch": "一片海多用法的协调"}
    ]
  }
}
;