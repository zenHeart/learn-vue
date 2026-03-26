# Vue 生命周期钩子与异步

> 深入理解 Vue 2 / Vue 3 生命周期钩子对 async/await 的支持情况、行为差异及最佳实践。

## 目录

1. [核心结论](#核心结论)
2. [Vue 2 生命周期钩子与异步](#vue-2-生命周期钩子与异步)
3. [Vue 3 生命周期钩子与异步](#vue-3-生命周期钩子与异步)
4. [setup - 唯一可以真正 await 的钩子](#setup---唯一可以真正-await-的钩子)
5. [组件渲染与异步钩子的关系](#组件渲染与异步钩子的关系)
6. [async mounted 的执行时序](#async-mounted-的执行时序)
7. [错误处理](#错误处理)
8. [最佳实践](#最佳实践)
9. [Vue 2 vs Vue 3 对比](#vue-2-vs-vue-3-对比)
10. [常见问题](#常见问题)

---

## 核心结论

| 场景 | Vue 2 | Vue 3 |
|------|-------|-------|
| `beforeCreate` / `created` async | ⚠️ 不推荐 | — |
| `setup` async | — | ✅ 完全支持 |
| `beforeMount` / `mounted` async | ⚠️ 不等待 | ⚠️ 不等待 |
| `beforeUpdate` / `updated` async | ⚠️ 不推荐 | ⚠️ 不推荐 |
| `beforeDestroy` / `destroyed` async | ⚠️ 不推荐 | ⚠️ 不推荐 |
| 组件异步渲染阻塞 | ❌ 不支持 | ❌ 不支持 |

> **关键认知**：Vue 的组件渲染管线是**同步的**，所有生命周期钩子无论是否 async，都不会阻塞组件渲染。async 钩子会启动异步任务，但 Vue 不会等待 async 函数执行完毕。

---

## Vue 2 生命周期钩子与异步

### 官方文档说明

Vue 2 官方不推荐在生命周期钩子中使用 async/await，主要原因是：

1. **钩子不会等待 async 函数完成**
2. **错误处理困难**
3. **内存泄漏风险**（异步操作在组件销毁后仍可能执行）

### 各钩子分析

```js
export default {
  // ❌ 不推荐：此时 data/Computed 不可用
  async beforeCreate() {
    // this.name 是 undefined
  },

  // ⚠️ 可用但不推荐：可以访问 data，但组件不会等待
  async created() {
    const res = await fetchData();
    // ⚠️ 此时组件可能已经挂载，render 可能用不到这个数据
    this.data = res;
  },

  // ⚠️ 可用：可以操作 DOM，但组件不等待
  async beforeMount() {
    await fetchData();
  },

  // ⚠️ 可用但不等待
  async mounted() {
    await fetchData();
    // ⚠️ 此时用户可能已经看到了组件（虽然状态未更新）
  },

  // ❌ 不推荐：组件可能已经在销毁中
  async beforeDestroy() {
    await cleanup();
    // ⚠️ cleanup 可能无法正确执行
  },

  // ❌ 不推荐
  async destroyed() {
    // 组件已销毁，this 上下文可能不可用
  }
};
```

### 为什么 async created 不等待

```js
// 假设我们这样写
export default {
  async created() {
    console.log('1 - created 开始');
    const data = await this.fetchUser();
    console.log('3 - data 获取完成');
    this.user = data;
  },
  mounted() {
    console.log('2 - mounted 执行');
  }
};

// 控制台输出顺序（注意 1 → 2 → 3）：
// 1 - created 开始
// 2 - mounted 执行
// 3 - data 获取完成
```

**原因**：Vue 的生命周期调用不 await 钩子函数，所以 mounted 会在 created 的 async 操作完成前执行。

---

## Vue 3 生命周期钩子与异步

### setup - 唯一可以真正 await 的钩子

Vue 3 的 `setup` 函数是**唯一一个被 Vue 真正等待的 async 钩子**：

```vue
<template>
  <div v-if="pending">Loading...</div>
  <div v-else>{{ data }}</div>
</template>

<script setup>
import { ref } from 'vue';

const pending = ref(true);
const data = ref(null);

// ✅ setup 可以是 async，Vue 会等待它完成
// 如果 setup 被挂起（suspense），组件不会渲染，直到 await 完成
const init = async () => {
  const res = await fetch('/api/data');
  data.value = res;
  pending.value = false;
};

init();
</script>
```

### 使用 await onMounted 的模式

Vue 3 不支持在 `onMounted` 中 await，但可以使用以下模式：

```js
import { onMounted, nextTick } from 'vue';

onMounted(async () => {
  // ❌ 这个 await 不会阻塞组件渲染
  await fetchData();

  // ✅ 如果需要在数据加载后执行 DOM 操作
  await nextTick();
  // 此时 DOM 已更新
});
```

### onBeforeMount / onMounted

```js
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

onBeforeMount(async () => {
  // ⚠️ 不等待 - 组件即将挂载但未挂载
  console.log('onBeforeMount - 组件即将挂载');
});

onMounted(async () => {
  // ⚠️ 不等待 - 组件已挂载，但不等待 async 完成
  console.log('onMounted - 组件已挂载');
  await fetchData();
  // ⚠️ 这时 DOM 已渲染，但数据可能未更新
  console.log('onMounted async 完成');
});
```

### onBeforeUnmount / onUnmounted - 关键注意点

```js
onBeforeUnmount(async () => {
  // ⚠️ 不等待 - 组件即将卸载
  await this.cancelRequest(); // 可能无法正确取消
  this.stopTimer(); // ✅ 同步操作可以正常执行
});

onUnmounted(async () => {
  // ❌ 风险最高 - 组件已卸载
  // async 操作可能在组件销毁后仍尝试执行
  // 导致内存泄漏或内存泄漏警告
  await this.saveState(); // ❌ 危险
});
```

---

## 组件渲染与异步钩子的关系

### Vue 的渲染管线（简化）

```
setup() → onBeforeMount() → 渲染(VNode) → 
onMounted() → (用户看到组件)
```

**关键点**：步骤 1-4 都是同步执行的，Vue 不会因为某个钩子是 async 就暂停渲染。

### async setup 的特殊行为（Suspense）

唯一例外是 `async setup` 与 Vue 的 `<Suspense>` 机制：

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

```js
// AsyncComponent.vue
export default {
  // ✅ 如果 setup 是 async，Suspense 会等待它完成
  async setup() {
    const data = await fetchData();
    return { data };
  }
};
```

### 没有 Suspense 时的行为

```vue
<!-- Parent.vue -->
<template>
  <Child />  <!-- 即使 Child setup 是 async，Parent 也不会等待 -->
</template>
```

---

## async mounted 的执行时序

### 详细示例

```vue
<script>
export default {
  async created() {
    console.log('[1] created 开始');
    await new Promise(r => setTimeout(r, 100));
    console.log('[4] created await 完成');
  },
  async mounted() {
    console.log('[2] mounted 开始');
    await new Promise(r => setTimeout(r, 50));
    console.log('[5] mounted await 完成');
  }
};
</script>
<!-- 组件渲染时，控制台顺序： -->
<!-- [1] created 开始    -->
<!-- [2] mounted 开始    -->
<!-- [4] created await 完成  (100ms 后) -->
<!-- [5] mounted await 完成  (50ms 后) -->
```

---

## 错误处理

### async 钩子中的未捕获错误

```js
// ❌ 错误：async 钩子中的错误不会被 Vue 错误处理捕获
onMounted(async () => {
  throw new Error('在 onMounted 中'); // 不会触发 app.config.errorHandler
});

// ✅ 正确：显式 catch
onMounted(async () => {
  try {
    await fetchData();
  } catch (e) {
    console.error('onMounted error:', e);
  }
});
```

### Vue 3 错误处理钩子

```js
import { onErrorCaptured } from 'vue';

onErrorCaptured((err, instance, info) => {
  console.error('捕获到错误:', err);
  console.error('错误信息:', info);
  return false; // 停止传播
});
```

**注意**：`onErrorCaptured` **不会**捕获 async 钩子中未 await 的 Promise 拒绝：

```js
onMounted(async () => {
  // ⚠️ 这个错误不会被 onErrorCaptured 捕获
  // 因为 onMounted 本身不被 await
  fetch('/api')
    .then(r => r.json())
    .catch(e => console.error(e)); // 错误在这里被吞掉
});
```

---

## 最佳实践

### 1. 优先在 setup 中处理异步

```js
// ✅ 推荐：setup 中处理所有异步逻辑
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const data = ref(null);
    const loading = ref(true);
    const error = ref(null);

    onMounted(async () => {
      // 实际上更好的做法是在 setup 顶层 await
    });

    // ✅ 最佳：setup 顶层 await（需要 Suspense 或 async component）
    const init = async () => {
      try {
        data.value = await fetchData();
      } catch (e) {
        error.value = e;
      } finally {
        loading.value = false;
      }
    };

    init();

    return { data, loading, error };
  }
};
```

### 2. 使用 async component + Suspense

```js
// Child.vue
export default {
  async setup() {
    const data = await fetchData();
    return { data };
  }
};
```

```vue
<!-- Parent.vue -->
<template>
  <Suspense>
    <template #default>
      <Child />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
```

### 3. 组件卸载时的清理

```js
import { onUnmounted } from 'vue';

export default {
  setup() {
    let timer = null;
    const data = ref(null);

    // ✅ 使用同步清理函数
    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    // 如果必须用 async 清理，使用变量跟踪
    let ignore = false;
    onMounted(async () => {
      const result = await fetchData();
      if (!ignore) {
        data.value = result;
      }
    });

    onUnmounted(() => {
      ignore = true; // 标记忽略异步结果
    });

    return { data };
  }
};
```

### 4. 路由守卫中的异步处理

```js
// 路由守卫可以真正 await（路由切换本身是异步的）
router.beforeEach(async (to, from) => {
  const permission = await checkPermission(to.meta.permission);
  if (!permission) return false;
});
```

---

## Vue 2 vs Vue 3 对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| `beforeCreate` async | ❌ 不推荐 | — |
| `created` async | ⚠️ 可以但不等待 | — |
| `setup` async | — | ✅ 完全支持 |
| `beforeMount` async | ⚠️ 可以但不等待 | ⚠️ 可以但不等待 |
| `mounted` async | ⚠️ 可以但不等待 | ⚠️ 可以但不等待 |
| `beforeUpdate` async | ❌ 不推荐 | ❌ 不推荐 |
| `updated` async | ❌ 不推荐 | ❌ 不推荐 |
| `beforeDestroy` async | ❌ 不推荐 | — |
| `beforeUnmount` async | — | ⚠️ 不推荐 |
| `destroyed` async | ❌ 不推荐 | — |
| `unmounted` async | — | ❌ 不推荐 |
| async setup + Suspense | ❌ 不支持 | ✅ 支持 |
| 组件级 async 加载 | ❌ 需要 vue-async-computed | ✅ 内置 Suspense |

---

## 常见问题

### Q1: 为什么 async mounted 中的数据更新不会触发重新渲染？

```js
onMounted(async () => {
  this.items = await fetchItems();
  // ⚠️ 数据更新了，但可能不触发渲染
});
```

**原因**：Vue 的响应式系统在 `mounted` 阶段正常工作，但你需要确保数据是响应式的。Vue 2 中如果直接赋值而非使用 `this.$set`，可能不会触发更新。

**解决**：
```js
onMounted(async () => {
  const items = await fetchItems();
  this.$set(this, 'items', items); // Vue 2
  // 或确保使用响应式引用
});
```

### Q2: 可以在 beforeDestroy 中发起异步请求吗？

**强烈不建议**。组件销毁后，异步操作的回调中尝试访问 `this` 会：
- 内存泄漏
- 内存只读警告
- 控制台报错

### Q3: Vue 3 如何实现"等待 mounted 完成后再显示"？

```vue
<template>
  <div v-if="ready">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const ready = ref(false);

onMounted(async () => {
  await fetchInitialData();
  ready.value = true;
});
</script>
```

### Q4: async setup 和 onMounted 中的 await 行为有何不同？

| 位置 | 是否等待 | 使用场景 |
|------|---------|---------|
| `setup` 顶层 await（Suspense） | ✅ 等待 | 异步初始化数据 |
| `setup` 内部不 await | ❌ 不等待 | 并行加载 |
| `onMounted` 内部 await | ❌ 不等待（但不阻塞其他钩子）| DOM 操作后处理 |

---

## 参考资料

- [Vue 3 Composition API - 生命周期钩子](https://vuejs.org/api/composition-api-lifecycle.html)
- [Vue 3 Suspense](https://vuejs.org/guide/built-ins/suspense.html)
- [Vue 2 生命周期钩子](https://v2.vuejs.org/v2/api/#Options-Lifecycle-Hooks)
- [Vue 3 Composition API FAQ](https://vuejs.org/guide/extras/composition-api-faq.html)
