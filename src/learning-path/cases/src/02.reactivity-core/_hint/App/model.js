// 教学模型：只实现普通对象属性、动态依赖、微任务去重与停止。
const targets = new WeakMap();
const queue = new Set();
let active, scheduled;
function cleanup(runner) { for (const dep of runner.deps) dep.delete(runner); runner.deps.length = 0; }
function enqueue(runner) {
  queue.add(runner);
  if (!scheduled) scheduled = Promise.resolve().then(() => {
    try { for (const job of queue) { queue.delete(job); if (!job.stopped) job(); } }
    finally { queue.clear(); scheduled = undefined; }
  });
}
export function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      if (active) {
        let keys = targets.get(obj); if (!keys) targets.set(obj, keys = new Map());
        let dep = keys.get(key); if (!dep) keys.set(key, dep = new Set());
        if (!dep.has(active)) { dep.add(active); active.deps.push(dep); }
      }
      return Reflect.get(obj, key);
    },
    set(obj, key, value) {
      const changed = !Object.is(obj[key], value), ok = Reflect.set(obj, key, value);
      if (ok && changed) for (const runner of targets.get(obj)?.get(key) || []) if (runner !== active) enqueue(runner);
      return ok;
    }
  });
}
export function effect(fn) {
  const runner = () => { cleanup(runner); const prev = active; active = runner; try { fn(); } finally { active = prev; } };
  runner.deps = []; runner.stopped = false; runner();
  return () => { runner.stopped = true; cleanup(runner); queue.delete(runner); };
}
export function flush() { return scheduled || Promise.resolve(); }
