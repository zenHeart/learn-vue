import test from 'node:test';
import assert from 'node:assert/strict';
const variant = process.env.LEARN_CASE_VARIANT === 'starter' ? 'App' : '_hint/App';
const load = name => import(`../src/learning-path/cases/src/${name}/${variant}/model.js`);
const { createOrderBook } = await load('01.order-workflow');
const { reactive, effect, flush } = await load('02.reactivity-core');
const { createLatestRequest } = await load('03.request-race');
test('orders reject invalid input and unauthorized review', () => {
 const book=createOrderBook();assert.throws(()=>book.submit('',10));assert.throws(()=>book.submit('x',-1));
 const order=book.submit('x',10);assert.throws(()=>book.approve(order.id,'operator',1));
 assert.equal(book.approve(order.id,'reviewer',1).status,'approved');
});
test('orders reject stale and duplicate review; snapshots cannot mutate state', () => {
 const book=createOrderBook(), order=book.submit('x',10);
 assert.throws(()=>book.approve(order.id,'reviewer',0));book.approve(order.id,'reviewer',1);
 assert.throws(()=>book.approve(order.id,'reviewer',2));
 book.list()[0].status='pending';assert.equal(book.list()[0].status,'approved');
});
test('reactive branch dependencies are cleaned and writes batch', async () => {
 const state=reactive({left:true,a:1,b:10});const out=[];const stop=effect(()=>out.push(state.left?state.a:state.b));
 state.a=2;state.a=3;await flush();assert.deepEqual(out,[1,3]);
 state.left=false;await flush();state.a=4;await flush();assert.deepEqual(out,[1,3,10]);
 state.b=11;await flush();assert.deepEqual(out,[1,3,10,11]);stop();
});
test('stopping cancels queued effect and unchanged writes do not trigger', async () => {
 const state=reactive({a:1});let count=0;const stop=effect(()=>{state.a;count++});
 state.a=1;await flush();assert.equal(count,1);state.a=2;stop();await flush();assert.equal(count,1);
});
const deferred = () => { let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}; };
test('latest request wins independent of completion order', async () => {
 const out=[],c=createLatestRequest(v=>out.push(v.value)),a=deferred(),b=deferred();
 const pa=c.run(()=>a.promise),pb=c.run(()=>b.promise);b.resolve('new');await pb;a.resolve('old');await pa;assert.deepEqual(out,['new']);
});
test('obsolete errors and disposed completions are ignored; current error reported', async () => {
 const out=[],c=createLatestRequest(v=>out.push(v)),a=deferred();const pa=c.run(()=>a.promise);
 await c.run(()=>Promise.resolve('new'));a.reject(new Error('old'));await pa;assert.equal(out.length,1);
 await c.run(()=>Promise.reject(new Error('current')));assert.equal(out[1].error,'current');
 const b=deferred(),pb=c.run(()=>b.promise);c.dispose();b.resolve('disposed');await pb;assert.equal(out.length,2);
});
