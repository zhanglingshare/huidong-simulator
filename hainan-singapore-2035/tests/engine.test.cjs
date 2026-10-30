const {test}=require('node:test');
const assert=require('node:assert/strict');
const {join}=require('node:path');
const {evaluate,initialInputs,validate}=require(join(process.env.WT_ENGINE_BUILD,'engine.js'));
const base=initialInputs();
const event={id:'test-route',title:'测试航运',description:'合成',year:2029,kind:'shipping',magnitude:1.2,status:'effective',demo:true};
test('identical inputs reproduce the full output',()=>{assert.deepEqual(evaluate(base),evaluate(base));});
test('server enforces resource limits and rejects nonfinite values',()=>{
 assert.throws(()=>validate({...base,strategy:{shipping:45,services:55,talent:50,resilience:50,start_year:2027}}),/资源/);
 assert.throws(()=>validate({...base,strategy:{...base.strategy,shipping:NaN}}));
});
test('future events cannot change earlier years',()=>{
 const a=evaluate(base),b=evaluate({...base,events:[event]});
 assert.deepEqual(a.timeline.slice(0,3),b.timeline.slice(0,3));assert.deepEqual(a.frames['2028'],b.frames['2028']);
 assert.notDeepEqual(a.timeline[9],b.timeline[9]);assert.notDeepEqual(a.frames['2030'],b.frames['2030']);
});
test('unverified reports never change paths or weights',()=>{
 const a=evaluate(base),b=evaluate({...base,events:[{...event,status:'reported'}]});
 assert.deepEqual(a.timeline,b.timeline);assert.deepEqual(a.frames,b.frames);
});
test('announcement and effective states produce different effects',()=>{
 const a=evaluate({...base,events:[{...event,status:'verified'}]}),b=evaluate({...base,events:[event]});
 assert.notEqual(a.timeline[9].hn.p50,b.timeline[9].hn.p50);
});
test('bridges affect paths after capacity formation',()=>{
 const a=evaluate(base),b=evaluate({...base,bridges:['service']});assert.deepEqual(a.timeline[0],b.timeline[0]);
 assert.notDeepEqual(a.timeline[9],b.timeline[9]);assert.equal(b.frames['2035'].edges.filter(e=>e.bridge).length,1);
});
test('both regions respond and comparator has the same shocks',()=>{
 const a=evaluate(base),b=evaluate({...base,strategy:{...base.strategy,services:35},events:[event]});
 assert.notEqual(a.timeline[9].hn.p50,b.timeline[9].hn.p50);assert.notEqual(a.timeline[9].sg.p50,b.timeline[9].sg.p50);
 assert.deepEqual(b.control,evaluate({...base,events:[event]}).timeline);
});
test('actor selection changes the intervention recipient',()=>{
 const a=evaluate(base),b=evaluate({...base,actor:'sg'});assert.notEqual(a.timeline[9].hn.p50,b.timeline[9].hn.p50);assert.notEqual(a.timeline[9].sg.p50,b.timeline[9].sg.p50);
});
