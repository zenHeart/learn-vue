# Vue 核心原理深度解析

> 本文深入剖析 Vue 的核心运行机制，涵盖响应式原理、虚拟 DOM、组件系统、渲染流程四大模块。每个章节配有可运行的交互式 Demo。

## 目录

- [1. 响应式原理](#1-响应式原理)
  - [1.1 Vue 2: defineProperty](#11-vue-2-definoproperty)
  - [1.2 Vue 3: Proxy](#12-vue-3-proxy)
  - [1.3 Dep 订阅者模式](#13-dep-订阅者模式)
  - [1.4 响应式的边界](#14-响应式的边界)
- [2. 虚拟 DOM](#2-虚拟-dom)
  - [2.1 VNode 结构](#21-vnode-结构)
  - [2.2 模板编译](#22-模板编译)
  - [2.3 Diff 算法](#23-diff-算法)
- [3. 组件系统](#3-组件系统)
  - [3.1 组件注册](#31-组件注册)
  - [3.2 生命周期](#32-生命周期)
  - [3.3 组件通信](#33-组件通信)
- [4. 渲染流程](#4-渲染流程)
  - [4.1 初始化渲染](#41-初始化渲染)
  - [4.2 更新流程](#42-更新流程)
  - [4.3 批量更新](#43-批量更新)

---

## 1. 响应式原理

### 1.1 Vue 2: Object.defineProperty

Vue 2 通过 `Object.defineProperty` 在对象属性的 `getter/setter` 中埋入依赖收集和触发更新的逻辑。

```js
// 简易响应式实现
function defineReactive(obj, key, val) {
  // 每个响应式属性有一个独立的 Dep
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集：谁在读取这个属性，就把它的 Watcher 记录下来
      if (Dep.target) {
        dep.addSub(Dep.target);
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      val = newVal;
      // 触发更新：通知所有依赖的 Watcher 执行更新
      dep.notify();
    }
  });
}
```

**缺陷：**
- 无法检测对象属性的**新增/删除**（需用 `Vue.set / Vue.delete`）
- 无法检测**数组下标**变化（Vue 2 通过拦截 7 个变更方法实现）
- 递归遍历所有属性，性能开销大

👉 **Demo:** [defineProperty 响应式演示](./_demos/01-defineproperty.html)

### 1.2 Vue 3: Proxy

Vue 3 使用 Proxy 代理整个对象，从根本上解决了 Vue 2 的缺陷。

```js
// Vue 3 响应式核心
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      // 依赖收集
      track(target, key);
      // 如果是对象，递归代理（懒代理）
      return isObject(res) ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return res;
    },
    deleteProperty(target, key) {
      const oldValue = target[key];
      const res = Reflect.deleteProperty(target, key);
      if (res) {
        trigger(target, key);
      }
      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    }
  });
}
```

**优势：**
- 代理整个对象，无需递归（懒代理）
- 支持新增/删除属性的检测
- 支持 `in` 操作符、数组下标
- 性能更好

👉 **Demo:** [Proxy 响应式演示](./_demos/02-proxy.html)

### 1.3 Dep 订阅者模式

Vue 的响应式系统是典型的**发布-订阅模式**，核心角色：

| 角色 | 职责 |
|------|------|
| **Dep** | 管理依赖（Watcher），提供 `depend()` 收集依赖、`notify()` 触发更新 |
| **Watcher** | 渲染 watcher/计算属性 watcher，执行 `get()` 时读取响应式属性，建立依赖关系 |
| **Observer** | 遍历对象属性，调用 `defineReactive` 或生成 Proxy |

```
响应式数据变化
     ↓
  Dep.notify()
     ↓
Watcher.update() → queueWatcher() → nextTick() → 执行更新
```

```js
// Dep 实现
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach(w => w.update());
  }
}
Dep.target = null; // 当前正在计算的 Watcher
```

👉 **Demo:** [Dep 订阅者模式演示](./_demos/03-dep.html)

### 1.4 响应式的边界

| 场景 | Vue 2 | Vue 3 |
|------|-------|-------|
| 添加属性 | `Vue.set(obj, k, v)` | Proxy 自动支持 |
| 删除属性 | `Vue.delete(obj, k)` | `delete obj.k` 自动支持 |
| 数组索引 | 需 `Vue.set` | Proxy 自动支持 |
| 数组方法 | 7 个变更方法 | `ref`/`reactive` 自动支持 |
| Map/Set | 不支持 | 完全支持 |
| 原始值 | 需包装对象 | `ref()` 包装 |

---

## 2. 虚拟 DOM

### 2.1 VNode 结构

虚拟 DOM 是用普通 JS 对象描述真实 DOM 结构的抽象。

```js
// VNode 结构
const vnode = {
  type: 'div',              // 标签名
  props: {                  // 属性（包含事件）
    id: 'app',
    class: 'container',
    onClick: () => handle()
  },
  children: [               // 子节点
    { type: 'span', props: null, children: 'hello' },
    { type: 'p', props: null, children: 'world' }
  ],
  key: 'unique-key',        // 用于 diff 优化
  el: null                  // 指向真实 DOM 节点
};
```

**VNode 类型：**
- `Element VNode` — 普通标签
- `Text VNode` — 文本节点
- `Component VNode` — 组件
- `Fragment VNode` — 片段（Vue 3 支持多根节点）
- `Comment VNode` — 注释节点

👉 **Demo:** [VNode 结构演示](./_demos/04-vnode.html)

### 2.2 模板编译

模板 → AST → 优化（静态提升）→ 生成渲染函数

```
Template String
     ↓ parser
   AST（抽象语法树）
     ↓ generate
Render Function（h(tag, props, children) 调用序列）
     ↓
  render() → VNode
```

**Vue 2 vs Vue 3 编译差异：**

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 编译时机 | 运行时常量 | 支持构建时 + 运行时常量 |
| 静态提升 | 无 | `hoistStatic` 提升静态节点 |
| Patch Flag | 无 | 动态节点标记（类型+索引） |
| 缓存事件处理器 | 无 | `cacheHandlers` |
| Tree-shaking | 不支持 | 支持（按需引入） |

👉 **Demo:** [模板编译演示](./_demos/05-compile.html)

### 2.3 Diff 算法

**核心原则：** 同层级比较，不跨层移动（O(n) 复杂度）

**Vue 2 Diff（双端比较）：**
- 同时从新旧 children 的两端向中间遍历
- 依次比对开始/结束节点的 key 和 tag
- 移动、创建、删除节点

**Vue 3 Diff（最长递增子序列）：**
1. 构建 key → index 映射（快速定位）
2. 通过最长递增子序列（ LIS ）确定不需要移动的节点
3. 复用节点，只做最小化移动

```
old: [A, B, C, D, E]
new: [A, E, B, C, D]

Vue 3 策略：
1. A 相同，复用，old[0] → new[0]
2. E 是新的，创建
3. B C D 通过 LIS 确定最小移动路径
```

**Patch Flags（Vue 3）：**
```js
// 编译时给动态节点打上标记
const vnode = {
  type: 'div',
  patchFlag: 1, // 1 = TEXT，只关注文本内容变化
  children: 'dynamic text'
};
```

👉 **Demo:** [Diff 算法演示](./_demos/06-diff.html)

---

## 3. 组件系统

### 3.1 组件注册

**全局注册：**
```js
// Vue 2
Vue.component('my-button', { template: '<button>全局</button>' });

// Vue 3
const app = createApp({ template: '<my-button />' });
app.component('my-button', { template: '<button>全局</button>' });
```

**局部注册：**
```js
// Vue 2
export default {
  components: { MyButton }
}

// Vue 3
import MyButton from './MyButton.vue';
export default {
  components: { MyButton }
}
```

**异步组件（Vue 3）：**
```js
// Vue 3
const AsyncModal = defineAsyncComponent(() => import('./Modal.vue'));
```

### 3.2 生命周期

```
Vue 2 生命周期
─────────────────────────────────────────────────────────────
beforeCreate  → 实例刚创建，data/methods 不可用
     ↓
created       → 实例创建完成，data/methods 可用，DOM 不可用
     ↓
beforeMount   → 模板编译完成，即将挂载
     ↓
mounted       → DOM 挂载完成，可访问 $el/$refs
     ↓
beforeUpdate  → 数据变化，DOM 更新前
     ↓
updated       → DOM 更新完成
     ↓
beforeDestroy → 实例销毁前，清理定时器/事件
     ↓
destroyed     → 实例销毁完成

Vue 3 生命周期（Composition API）
────────────────────────────────────────────────────────────
setup           → 组件创建前，最早可访问响应式数据
onBeforeMount   → 挂载前
onMounted       → 挂载完成
onBeforeUpdate  → 更新前
onUpdated       → 更新完成
onBeforeUnmount → 卸载前
onUnmounted     → 卸载完成
onErrorCaptured → 错误捕获
```

### 3.3 组件通信

| 方式 | 适用场景 | Vue 2 | Vue 3 |
|------|----------|-------|-------|
| Props ↓ | 父 → 子 | `props: ['msg']` | `defineProps(['msg'])` |
| $emit ↑ | 子 → 父 | `this.$emit('update')` | `emit('update')` |
| $refs | 父访问子 | `this.$refs.child` | `const child = ref(null)` |
| provide/inject | 深层传值 | `provide/inject` | `provide/inject` |
| Vuex/Pinia | 全局状态 | Vuex | Pinia |
| mitt/EventBus | 跨组件通信 | `new Vue()` / `mitt` | `mitt` |
| slot | 父传内容给子 | `<slot>` | `<slot>` + 作用域插槽 |

**provide/inject 原理：**
```js
// 父组件
provide() {
  return { theme: this.theme };
}

// 子孙组件
inject: ['theme'];
// 或
const theme = inject('theme');
```

👉 **Demo:** [组件通信演示](./_demos/07-component-comm.html)

---

## 4. 渲染流程

### 4.1 初始化渲染

```
new Vue({ el: '#app' })
     ↓
init() → initState() → observe(data)
     ↓
$mount(el) → compile(template) → render()
     ↓
render() → VNode
     ↓
patch(vnode, container) → 首次创建所有 DOM 节点
     ↓
mounted
```

**$mount 核心流程：**
```js
// Vue 2 $mount
mountComponent(vm, el) {
  // 1. 创建渲染 Watcher
  const updateComponent = () => {
    vm._update(vm._render()); // render() → VNode, update() → patch
  };
  new Watcher(vm, updateComponent);

  // 2. 立即触发首次渲染
  vm._isMounted = true;
  callHook(vm, 'mounted');
}
```

### 4.2 更新流程

```
数据变化 → setter 触发 → Dep.notify()
     ↓
Watcher.update() → queueWatcher()
     ↓
nextTick(flushSchedulerQueue) → 异步执行更新队列
     ↓
watcher.run() → updateComponent() → _update(_render())
     ↓
patch(oldVnode, newVnode) → Diff 比较并更新 DOM
```

### 4.3 批量更新

**为什么需要批量？**
```js
// 连续修改同一数据
this.msg = 'a';
this.msg = 'b';
this.msg = 'c';
// 只应该触发一次渲染，而非三次
```

**实现机制（Vue 2）：**
```js
// queueWatcher 队列去重
let flushing = false;
let waiting = false;
const queue = [];

function queueWatcher(watcher) {
  const id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 正在 flush 时，从当前索引往后插入
      let i = queue.length - 1;
      while (i > queueIndex && queue[i].id > watcher.id) i--;
      queue.splice(i + 1, 0, watcher);
    }
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}
```

**Vue 3 批量更新：**
```js
// Vue 3 使用 Promise.then 批量执行
// 或者通过 scheduler 控制是否立即执行
const queue = [];
let isFlushPending = false;

function flushJobs() {
  isFlushPending = false;
  queue.forEach(job => job());
  queue.length = 0;
}

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushPending) {
    isFlushPending = true;
    Promise.resolve().then(flushJobs);
  }
}
```

👉 **Demo:** [批量更新演示](./_demos/08-batch-update.html)

---

## Demo 目录

| 文件 | 内容 |
|------|------|
| `01-defineproperty.html` | Vue 2 defineProperty 响应式原理 |
| `02-proxy.html` | Vue 3 Proxy 响应式原理 |
| `03-dep.html` | Dep 订阅者模式实现 |
| `04-vnode.html` | VNode 结构与渲染 |
| `05-compile.html` | 模板编译流程演示 |
| `06-diff.html` | Diff 算法演示 |
| `07-component-comm.html` | 组件通信方式演示 |
| `08-batch-update.html` | 批量更新机制演示 |

---

## 参考资料

- [Vue 3 官方响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 渲染流程](https://vuejs.org/guide/essentials/lifecycle.html)
- [Vue 3 虚拟 DOM](https://github.com/vuejs/core/tree/main/packages/runtime-dom)
- [Vue Template Explorer (Vue 2)](https://template-explorer.vuejs.org/)
- [Vue 3 Template Explorer](https://vue-next-template-explorer.netlify.app/)
