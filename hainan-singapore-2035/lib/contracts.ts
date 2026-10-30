export type Strategy={shipping:number;services:number;talent:number;resilience:number;start_year:number};
export type Field=Exclude<keyof Strategy,'start_year'>;
export type EventKind='shipping'|'trade'|'finance'|'talent'|'services'|'resilience';
export type WorldEvent={id:string;title:string;description:string;year:number;kind:EventKind;magnitude:number;status:'reported'|'verified'|'effective';demo:true;source:string};
export type Inputs={strategy:Strategy;actor:'hn'|'sg';objective:'value'|'network'|'resilience';events:WorldEvent[];bridges:string[]};
export type Quantile={p10:number;p50:number;p90:number};
export type Point={year:number;hn:Quantile;sg:Quantile;value:Quantile;resilience:Quantile};
export type GraphNode={id:string;label:string;x:number;y:number;side:string;group:string};
export type Edge={source:string;target:string;weight:number;layer:string;bridge?:boolean};
export type Frame={edges:Edge[];hubs:{id:string;strength:number}[];connections:number;fragile:{id:string;loss:number}[]};
export type Discovery={id:string;type:'constraint'|'consequence'|'bridge';title:string;detail:string;challenge:string;focus:Field;bridge?:string;nodes:string[]};
export type World={id:string;engine:string;seed:number;inputs:Inputs;timeline:Point[];control:Point[];noEvents:Point[];nodes:GraphNode[];frames:Record<string,Frame>;controlFrames:Record<string,Frame>;noEventsFrames:Record<string,Frame>;discoveries:Discovery[];used:number;attribution:{field:Field;delta:number}[];samples:number};
export const FIELDS:{key:Field;label:string;short:string;max:number;cost:number;lag:string;desc:string;icon:string}[]=[
 {key:'shipping',label:'港航与物流',short:'港航',max:45,cost:1.1,lag:'约3年形成能力',desc:'增加连接与通达能力，也需要服务和人才接得住。',icon:'anchor'},
 {key:'services',label:'商业与专业服务',short:'服务',max:55,cost:.9,lag:'约2年形成能力',desc:'让保险、结算、法律与商业服务跟上流动的生意。',icon:'layers'},
 {key:'talent',label:'人才与创新',short:'人才',max:50,cost:.85,lag:'约4年形成能力',desc:'服务扩张需要人才积累，短期投入不会立即兑现。',icon:'people'},
 {key:'resilience',label:'供应链韧性',short:'韧性',max:50,cost:.75,lag:'约2年形成能力',desc:'预留替代通路，应对订单收缩和关键连接受阻。',icon:'shield'},
];
export const PRESETS:{name:string;desc:string;strategy:Strategy}[]=[
 {name:'均衡起步',desc:'四种能力同步积累',strategy:{shipping:24,services:19,talent:15,resilience:18,start_year:2027}},
 {name:'港航先行',desc:'先打开连接，再补配套',strategy:{shipping:40,services:15,talent:12,resilience:16,start_year:2027}},
 {name:'服务留值',desc:'优先承接连接背后的服务',strategy:{shipping:18,services:38,talent:23,resilience:14,start_year:2027}},
 {name:'稳住底盘',desc:'为不利情况留下余地',strategy:{shipping:19,services:20,talent:17,resilience:35,start_year:2027}},
];
export const EVENT_TEMPLATES:WorldEvent[]=[
 {id:'demo-route',title:'多一条航线，生意会留下吗？',description:'假设国际航运连接改善，观察港航扩张能否带动本地专业服务。',year:2028,kind:'shipping',magnitude:1.1,status:'effective',demo:true,source:'情景设计 · 非真实新闻'},
 {id:'demo-trade',title:'全球订单收缩，两岛谁先感到压力？',description:'假设外部贸易需求下降，观察共同冲击与不同承受能力。',year:2030,kind:'trade',magnitude:-1.4,status:'effective',demo:true,source:'情景设计 · 非真实新闻'},
 {id:'demo-block',title:'关键航线受阻，还有替代通路吗？',description:'假设主要航运联系受阻，检验枢纽依赖和供应链韧性。',year:2029,kind:'shipping',magnitude:-1.8,status:'effective',demo:true,source:'情景设计 · 非真实新闻'},
 {id:'demo-talent',title:'人才晚到两年，服务扩张会怎样？',description:'假设人才供给遭遇阻力，观察配套能力与网络变化。',year:2029,kind:'talent',magnitude:-1.1,status:'effective',demo:true,source:'情景设计 · 非真实新闻'},
];
export const BRIDGES=[
 {id:'service',a:'hn-service',b:'sg-service',title:'把港航连接到跨岛专业服务',detail:'检验两地商业服务协作能否提高价值承接。合作意愿与执行效率均为待验证假设。',need:'服务能力、人才配套、双方合作意愿'},
 {id:'innovation',a:'hn-tech',b:'sg-tech',title:'让人才与创新形成双向连接',detail:'检验人才和创新协作能否缓解服务扩张的能力瓶颈。',need:'人才供给、机构对接、持续投入'},
 {id:'industry',a:'hn-service',b:'regional-industry',title:'把区域制造接到本地服务',detail:'检验制造需求能否转化为本地结算、物流和专业服务需求。',need:'企业需求、服务资质、业务可达性'},
];
export const MODELS=[
 ['SNA 网络分析','已运行','连接强度、关键节点、移除节点后的连通性变化。'],
 ['蒙特卡洛','已运行','480条合成路径，共用随机抽样，输出条件情景区间。'],
 ['年度规则演化','已运行','示例投入延迟、约束与对方响应；未经现实数据标定。'],
 ['SmartPLS / PLS-SEM','待接入','导入测量模型、路径参数与区间；本轮没有运行SmartPLS。'],
 ['ABM 多主体','待接入','企业、航运商的异质行为与策略选择。'],
 ['SD 存量反馈','待接入','显式存量—流量、反馈与时间延迟。'],
 ['动态博弈','待接入','双方策略与收益的动态回应。当前仅有示例响应规则。'],
 ['MCDA / 渗流','待接入','多目标权衡与结构失效的平行检验。'],
];
