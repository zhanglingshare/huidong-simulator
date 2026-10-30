// SERVER ONLY. Synthetic scenario engine v2; not a calibrated economic model.
import { BRIDGES,FIELDS,PRESETS } from './contracts';
import type { Inputs,Strategy,WorldEvent,World,Edge,Frame,Point,Field,Discovery,GraphNode } from './contracts';
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const round=(n:number)=>Math.round(n*100)/100;
export function validate(raw:unknown):Inputs {
 if(!raw||typeof raw!=='object')throw Error('请输入完整方案');
 const r=raw as Inputs,s=r.strategy;if(!s||typeof s!=='object')throw Error('缺少行动方案');
 const strategy={} as Strategy;
 for(const f of FIELDS){const v=s[f.key];if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>f.max)throw Error(`${f.label}超出示例范围`);strategy[f.key]=Math.round(v*10)/10;}
 if(!Number.isInteger(s.start_year)||s.start_year<2026||s.start_year>2033)throw Error('实施年份须为2026—2033');strategy.start_year=s.start_year;
 if(used(strategy)>100.0001)throw Error('资源超出100单位，请先进行取舍');
 if(!['hn','sg'].includes(r.actor))throw Error('行动对象无效');
 if(!['value','network','resilience'].includes(r.objective))throw Error('目标无效');
 if(!Array.isArray(r.events)||r.events.length>16)throw Error('实验事件最多16条');
 const ids=new Set<string>();
 const events=r.events.map((e:WorldEvent)=>{if(!e||typeof e.id!=='string'||e.id.length>64||!e.id||ids.has(e.id))throw Error('事件标识为空或重复');ids.add(e.id);if(!['shipping','trade','finance','talent','services','resilience'].includes(e.kind)||!['reported','verified','effective'].includes(e.status)||!Number.isInteger(e.year)||e.year<2026||e.year>2035||typeof e.magnitude!=='number'||!Number.isFinite(e.magnitude)||Math.abs(e.magnitude)>2)throw Error('事件字段无效');return {id:e.id,title:String(e.title||'情景事件').slice(0,120),description:String(e.description||'').slice(0,500),year:e.year,kind:e.kind,magnitude:e.magnitude,status:e.status,demo:true as const,source:'情景设计 · 非真实新闻'};});
 if(!Array.isArray(r.bridges)||r.bridges.length>3||r.bridges.some(b=>!BRIDGES.find(x=>x.id===b)))throw Error('候选桥梁无效');
 return {strategy,actor:r.actor,objective:r.objective,events,bridges:[...new Set(r.bridges)]};
}
export const initialInputs=():Inputs=>({strategy:{...PRESETS[0].strategy},actor:'hn',objective:'value',events:[],bridges:[]});
export const used=(s:Strategy)=>round(FIELDS.reduce((a,f)=>a+s[f.key]*f.cost,0));
function rng(seed:number){let x=seed>>>0;return ()=>{x+=0x6d2b79f5;let t=Math.imul(x^x>>>15,1|x);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
const SEED=20352026;
function signal(events:WorldEvent[],year:number){const s:Record<string,number>={};for(const e of events){if(e.year>year||e.status==='reported')continue;s[e.kind]=(s[e.kind]||0)+e.magnitude*(e.status==='verified'?.16:1)*(.78**(year-e.year));}return s;}
const NODES:GraphNode[]=[
 {id:'hn-port',label:'海南港航',x:260,y:145,side:'hn',group:'航运'},
 {id:'hn-service',label:'海南服务',x:350,y:265,side:'hn',group:'商业服务'},
 {id:'hn-trade',label:'海南贸易',x:145,y:100,side:'hn',group:'贸易'},
 {id:'hn-tech',label:'人才与创新',x:120,y:310,side:'hn',group:'人才'},
 {id:'hn-tourism',label:'消费与生活',x:245,y:405,side:'hn',group:'消费'},
 {id:'hn-capital',label:'海南资本',x:370,y:390,side:'hn',group:'金融'},
 {id:'sg-port',label:'新加坡港航',x:690,y:145,side:'sg',group:'航运'},
 {id:'sg-service',label:'新加坡服务',x:610,y:270,side:'sg',group:'商业服务'},
 {id:'sg-trade',label:'新加坡贸易',x:805,y:100,side:'sg',group:'贸易'},
 {id:'sg-tech',label:'人才与创新',x:825,y:320,side:'sg',group:'人才'},
 {id:'sg-capital',label:'新加坡资本',x:700,y:410,side:'sg',group:'金融'},
 {id:'global-trade',label:'全球订单',x:475,y:60,side:'global',group:'贸易'},
 {id:'regional-industry',label:'区域制造',x:475,y:465,side:'global',group:'产业'},
 {id:'shipping-routes',label:'国际航线',x:475,y:195,side:'global',group:'航运'},
];
const EDGES:[string,string,number,string][]=[
 ['hn-port','hn-trade',.71,'航运'],['hn-port','shipping-routes',.40,'航运'],['hn-port','regional-industry',.51,'产业'],['hn-service','hn-capital',.38,'金融'],['hn-service','hn-trade',.55,'商业服务'],['hn-tech','hn-service',.40,'人才'],['hn-tech','regional-industry',.34,'产业'],['hn-tourism','hn-service',.55,'消费'],['hn-tourism','hn-capital',.38,'消费'],['hn-port','hn-service',.34,'商业服务'],
 ['sg-port','sg-trade',.78,'航运'],['sg-port','shipping-routes',.84,'航运'],['sg-port','regional-industry',.63,'产业'],['sg-service','sg-capital',.80,'金融'],['sg-service','sg-trade',.77,'商业服务'],['sg-tech','sg-service',.65,'人才'],['sg-tech','regional-industry',.51,'产业'],['sg-port','sg-service',.67,'商业服务'],['global-trade','hn-trade',.45,'贸易'],['global-trade','sg-trade',.83,'贸易'],['global-trade','shipping-routes',.80,'航运'],['regional-industry','shipping-routes',.72,'产业'],['hn-trade','sg-trade',.28,'贸易'],['hn-capital','sg-capital',.24,'金融'],
];
function network(i:Inputs,y:number):Frame {
 const sig=signal(i.events,y),s=i.strategy,f=clamp((y-s.start_year)/4,0,1);
 const edges:Edge[]=EDGES.map(([source,target,w,layer])=>{let d=0;const own=source.startsWith(i.actor+'-')||target.startsWith(i.actor+'-');if(own){if(layer==='航运')d+=s.shipping/45*.29*f+(sig.shipping||0)*.16;if(layer==='商业服务')d+=s.services/55*.32*f+(sig.services||0)*.13;if(layer==='人才')d+=s.talent/50*.23*f+(sig.talent||0)*.15;if(layer==='产业')d+=s.resilience/50*.17*f;}else d+=.04*f*(s.shipping+s.services)/100;if(layer==='贸易')d+=(sig.trade||0)*.09;if(layer==='金融')d+=(sig.finance||0)*.11;return {source,target,layer,weight:round(clamp(w+d,.04,.98))};});
 for(const id of i.bridges){const b=BRIDGES.find(b=>b.id===id)!;const capacity=id==='innovation'?s.talent/50:Math.min(s.services/55,s.talent/30);edges.push({source:b.a,target:b.b,layer:'候选桥梁',bridge:true,weight:round(clamp(capacity*f*.8,.01,.8))});}
 const strength:Record<string,number>={};for(const n of NODES)strength[n.id]=0;for(const e of edges){strength[e.source]+=e.weight;strength[e.target]+=e.weight;}
 function largest(excluded=''){const unseen=new Set(NODES.map(n=>n.id).filter(n=>n!==excluded));let max=0;while(unseen.size){const first=[...unseen][0];const stack=[first];unseen.delete(first);let size=0;while(stack.length){const n=stack.pop()!;size++;for(const e of edges){if(e.weight<.18)continue;const other=e.source===n?e.target:e.target===n?e.source:'';if(unseen.has(other)){unseen.delete(other);stack.push(other);}}}max=Math.max(max,size);}return max;}
 const big=largest();return {edges,hubs:NODES.map(n=>({id:n.id,strength:round(strength[n.id])})).sort((a,b)=>b.strength-a.strength).slice(0,4),connections:edges.filter(e=>e.weight>=.4).length,fragile:NODES.map(n=>({id:n.id,loss:big-largest(n.id)})).sort((a,b)=>b.loss-a.loss).slice(0,3)};
}
function quantile(v:number[],q:number){v.sort((a,b)=>a-b);const idx=(v.length-1)*q,l=Math.floor(idx);return round(v[l]*(1-idx+l)+v[Math.min(l+1,v.length-1)]*(idx-l));}
function paths(i:Inputs,samples=480):Point[]{const random=rng(SEED);const normal=()=>Math.sqrt(-2*Math.log(Math.max(.000001,random())))*Math.cos(2*Math.PI*random());
 const arr=Array.from({length:10},()=>({hn:[] as number[],sg:[] as number[],value:[] as number[],resilience:[] as number[]}));
 for(let p=0;p<samples;p++){let hn=100,sg=100;const persistent=normal()*.45;for(let y=2026;y<=2035;y++){const t=y-2026,s=i.strategy,sig=signal(i.events,y),elapsed=Math.max(0,y-s.start_year),ship=Math.min(1,elapsed/3)*s.shipping/45,serv=Math.min(1,elapsed/2)*s.services/55,tal=Math.min(1,elapsed/4)*s.talent/50,res=Math.min(1,elapsed/2)*s.resilience/50;
 const ext=(sig.trade||0)*.66+(sig.finance||0)*.36,impact=(sig.shipping||0)*.58+(sig.services||0)*.46+(sig.talent||0)*.22+(sig.resilience||0)*.24,drain=.42*Math.max(0,ship-serv)+.12*Math.max(0,ship-tal);
 const bridge=i.bridges.length*Math.min(serv,tal)*Math.min(1,elapsed/3)*.4;
 const own=2+2.1*ship+2.3*serv+1.25*tal+.75*res-drain+ext+impact+bridge;
 const rival=2.7+.19*ship+.14*serv+ext*.82+bridge*.65;
 const n1=normal()*.82,n2=normal()*.65;
 if(y>2026){hn+=(i.actor==='hn'?own:rival)+persistent*.42+n1;sg+=(i.actor==='sg'?own:rival)+persistent*.35+n2;}
 const value=clamp(48+11*serv+5.5*tal-6.2*Math.max(0,ship-serv)+(sig.services||0)*4+bridge*3+normal()*2.7,10,95);
 const robust=clamp(45+25*res+4*tal+Math.min(0,ext+impact)*(9-4*res)+normal()*1.5,0,100);
 arr[t].hn.push(hn);arr[t].sg.push(sg);arr[t].value.push(value);arr[t].resilience.push(robust);
 }}return arr.map((a,n)=>{const p={year:2026+n} as Point;for(const k of ['hn','sg','value','resilience'] as const)p[k]={p10:quantile(a[k],.1),p50:quantile(a[k],.5),p90:quantile(a[k],.9)};return p;});}
function discover(i:Inputs):Discovery[]{const s=i.strategy;const r:Discovery[]=[];
 if(s.shipping>s.services*1.25)r.push({id:'capture',type:'consequence',title:'航线增加，价值未必留下',detail:'港航扩张快于服务配套，示例规则提示能力脱节。该判断取决于服务承接参数。',challenge:'把部分港航投入改为专业服务，再比较十年后的变化。',focus:'services',nodes:[`${i.actor}-port`,`${i.actor}-service`]});
 if(s.talent<s.services*.7)r.push({id:'talent',type:'constraint',title:'服务要扩张，人才可能晚到',detail:'人才积累存在延迟。服务投入增加后，可用人才未必同步形成。',challenge:'提高人才投入，或将实施时间推迟两年检验。',focus:'talent',nodes:[`${i.actor}-tech`,`${i.actor}-service`]});
 if(s.resilience<22)r.push({id:'brittle',type:'constraint',title:'最忙的节点，也可能最怕中断',detail:'当前替代能力投入较少。关键航线受阻时，测试网络能否绕行。',challenge:'加入“关键航线受阻”情景，观察不利条件下的路径。',focus:'resilience',nodes:['shipping-routes',`${i.actor}-port`]});
 for(const b of BRIDGES.filter(b=>!i.bridges.includes(b.id)).slice(0,2))r.push({id:'bridge-'+b.id,type:'bridge',title:b.title,detail:b.detail,challenge:'将候选桥梁加入方案，保持其他条件相同后重跑。',focus:b.id==='innovation'?'talent':'services',bridge:b.id,nodes:[b.a,b.b]});
 if(!r.length)r.push({id:'uncertain',type:'constraint',title:'最需要检验的是尚未标定的前提',detail:'当前所有路径依赖合成参数，优先寻找现实证据缩小不确定性。',challenge:'收集服务承接、企业选择与航线业务的独立证据。',focus:'services',nodes:[`${i.actor}-service`]});return r;}
export function evaluate(raw:unknown):World {const i=validate(raw),timeline=paths(i),controlInput={...i,strategy:{...PRESETS[0].strategy},bridges:[]},control=paths(controlInput),noEvents=paths({...i,events:[]});
 const frames:Record<string,Frame>={},controlFrames:Record<string,Frame>={},noEventsFrames:Record<string,Frame>={};for(let y=2026;y<=2035;y++){frames[y]=network(i,y);controlFrames[y]=network(controlInput,y);noEventsFrames[y]=network({...i,events:[]},y);}
 const metric=i.objective==='value'?'value':i.objective==='resilience'?'resilience':i.actor;
 const attribution=FIELDS.map(f=>{const modified={...i,strategy:{...i.strategy,[f.key]:Math.max(0,i.strategy[f.key]-5)}};const series=paths(modified,480);return {field:f.key,delta:round(timeline[9][metric].p50-series[9][metric].p50)};}).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
 const fingerprint=JSON.stringify({engine:'synthetic-2.0',seed:SEED,i});let h=2166136261;for(let c=0;c<fingerprint.length;c++)h=Math.imul(h^fingerprint.charCodeAt(c),16777619);
 return {id:'WT-'+(h>>>0).toString(16).padStart(8,'0'),engine:'synthetic-2.0',seed:SEED,inputs:i,timeline,control,noEvents,nodes:NODES,frames,controlFrames,noEventsFrames,discoveries:discover(i),used:used(i.strategy),attribution,samples:480};}
