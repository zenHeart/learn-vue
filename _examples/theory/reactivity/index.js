// 全员变量用来追踪变化
const trackMap = new WeakMap();
let activeEffect = null;
// 自动追踪响应式
export function effect(fn) {
  activeEffect = fn;
  fn()
  activeEffect = null;
}

function track(target, key) {
  // 如果某个副作用函数触发了 get 方法，则将其添加到 trackMap 中
  if (activeEffect) {
    // 没有此 target 对应的追踪则直接添加
    if (!trackMap.has(target)) {
      trackMap.set(target, new Map());
    }
    // 没有对应该 key 的追踪直接添加
    if (!trackMap.get(target).has(key)) {
      trackMap.get(target).set(key, new Set());
    }
    // 添加这个副作用函数
    trackMap.get(target).get(key).add(activeEffect);
  }
}

function trigger(target, key) {
  // 如果存在对应的副作用函数，则触发它
  if (trackMap.has(target) && trackMap.get(target).has(key)) {
    // 触发这个 key 的副作用函数
    trackMap.get(target).get(key).forEach(fn => fn());
  }
}

function createProxy(data) {
  const proxy = new Proxy(data, {
    has(target, key) {
      track(target, key);
      return key in target;
    },
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key);
      return true;
    },
    deleteProperty(target, key) {
      delete target[key];
      trigger(target, key);
      return true;
    }
  })
  for (let key in data) {
    let val = data[key];
    if (typeof val === 'object' && val !== null) {
      proxy[key] = createProxy(val);
    }
  }
  return proxy;
}

// 收集依赖
export function reactive(data) {
  return createProxy(data);
}

export function computed(fn) {
  
}



