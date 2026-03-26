# Vue Watch 句柄管理 - 手动取消 Watch 的完整指南

> 深入理解 Vue 3 Composition API 中 watch/watchEffect 返回值的使用，以及如何批量管理、取消多个 watch。

## 目录

1. [核心结论](#核心结论)
2. [watch / watchEffect 返回值](#watch--watcheffect-返回值)
3. [手动取消单个 watch](#手动取消单个-watch)
4. [批量管理多个 watch](#批量管理多个-watch)
5. [自动清理 vs 手动清理](#自动清理-vs-手动清理)
6. [常见使用场景](#常见使用场景)
7. [watchEffect 的清理机制](#watcheffect-的清理机制)
8. [Vue 2 vs Vue 3 对比](#vue-2-vs-vue-3-对比)
9. [常见问题](#常见问题)

---

## 核心结论

```js
// ✅ watch 返回 StopHandle
const stop = watch(source, callback, options);
stop(); // 取消 watch

// ✅ watchEffect 返回 StopHandle
const stop = watchEffect(() => { ... });
stop(); // 取消 watchEffect

// ✅ 批量管理：数组
const watchers = [];
watchers.push(watch(source1, callback1));
watchers.push(watch(source2, callback2));
watchers.forEach(s => s()); // 批量取消

// ✅ 批量管理：Map（推荐）
const watchers = new Map();
watchers.set('user', watch(() => user.value, cb));
watchers.set('settings', watch(() => settings.value, cb));
watchers.get('user')?.(); // 取消单个
watchers.forEach(s => s()); // 批量取消
```

---

## watch / watchEffect 返回值

### watch 的返回值

```ts
import { watch } from 'vue';

const stop: StopHandle = watch(
  source,           // ReactiveRef / Getter / Array
  callback,         // (newValue, oldValue) => void
  options?          // { immediate?, deep?, flush?, onTrack?, onTrigger? }
);

// StopHandle 类型
type StopHandle = () => void;
```

### watchEffect 的返回值

```ts
import { watchEffect } from 'vue';

const stop: StopHandle = watchEffect(
  onCleanup => {    // onCleanup(callback) 注册清理函数
    const result = doSomething();
    onCleanup(() => result.cleanup()); // 清理
  },
  options?          // { flush?, onTrack?, onTrigger? }
);

stop(); // 取消 watchEffect
```

---

## 手动取消单个 watch

### 基本用法

```vue
<script setup>
import { ref, watch, onUnmounted } from 'vue';

const count = ref(0);

// ✅ 返回 StopHandle
const stop = watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} → ${newVal}`);
});

// ❌ 不要这样做：直接忽略返回值
watch(count, callback);

// 手动取消
onUnmounted(() => {
  stop(); // 组件卸载时取消 watch
});
</script>
```

### 取消后的行为

```js
const count = ref(0);
const stop = watch(count, (val) => {
  console.log('value:', val);
});

count.value = 1; // 打印: value: 1
count.value = 2; // 打印: value: 2

stop(); // 取消 watch

count.value = 3; // 不打印（watch 已取消）
```

---

## 批量管理多个 watch

### 方法一：数组存储

```vue
<script setup>
import { ref, watch } from 'vue';
import { onUnmounted } from 'vue';

const user = ref({ name: 'Tom', age: 25 });
const settings = ref({ theme: 'dark', lang: 'zh' });
const posts = ref([]);

// 数组存储所有 stop handle
const watchers = [];

watchers.push(
  watch(user, (u) => console.log('user changed:', u), { deep: true })
);

watchers.push(
  watch(settings, (s) => console.log('settings changed:', s), { deep: true })
);

watchers.push(
  watch(posts, (p) => console.log('posts changed:', p))
);

// 批量取消（在组件卸载时）
onUnmounted(() => {
  watchers.forEach(stop => stop());
});
</script>
```

### 方法二：Map 管理（推荐）

```vue
<script setup>
import { ref, watch } from 'vue';
import { onUnmounted } from 'vue';

const user = ref({ name: 'Tom' });
const settings = ref({ theme: 'dark' });
const posts = ref([]);

// Map 存储，可按 key 精准控制
const watchers = new Map();

// 注册 watch
watchers.set('user',
  watch(user, (u) => console.log('user:', u), { deep: true })
);

watchers.set('settings',
  watch(settings, (s) => console.log('settings:', s), { deep: true })
);

watchers.set('posts',
  watch(posts, (p) => console.log('posts:', p))
);

// 按 key 取消单个
const cancelUser = () => watchers.get('user')?.();

// 批量取消所有
const cancelAll = () => {
  watchers.forEach(stop => stop());
  watchers.clear();
};

// 重新注册
const reWatchUser = () => {
  watchers.get('user')?.(); // 先取消旧的
  watchers.set('user', watch(user, callback));
};

// 组件卸载时清理
onUnmounted(cancelAll);
</script>
```

### 方法三：类/组合式函数封装

```js
// useWatchManager.js
import { watch, watchEffect } from 'vue';

export function useWatchManager() {
  const watchers = new Map();
  let idCounter = 0;

  const add = (key, stopHandle) => {
    if (watchers.has(key)) {
      watchers.get(key)(); // 取消旧的
    }
    watchers.set(key, stopHandle);
  };

  const remove = (key) => {
    watchers.get(key)?.();
    watchers.delete(key);
  };

  const clear = () => {
    watchers.forEach(stop => stop());
    watchers.clear();
  };

  const pause = (key) => {
    watchers.get(key)?.();
  };

  const resume = (key, watchFn) => {
    if (watchers.has(key)) return;
    watchers.set(key, watchFn());
  };

  // 卸载时自动清理
  import { onUnmounted } from 'vue';
  onUnmounted(clear);

  return { add, remove, clear, pause, resume, watchers };
}
```

```vue
<script setup>
import { ref } from 'vue';
import { useWatchManager } from './useWatchManager';

const { add, remove, clear } = useWatchManager();

const count = ref(0);
const name = ref('Tom');

// 注册 watch
add('count', watch(count, (n) => console.log('count:', n)));
add('name', watch(name, (n) => console.log('name:', n)));

// 单独取消
remove('name');

// 批量取消
clear();
</script>
```

---

## 自动清理 vs 手动清理

### Vue 3 自动清理机制

```vue
<script setup>
import { watch, onUnmounted } from 'vue';

// ✅ Vue 3 在组件卸载时自动清理 watch
watch(count, (n) => {
  // 这个 watch 会在组件卸载时自动取消
  // 不需要手动调用 stop()
  console.log('count:', n);
});

// ⚠️ 但如果你需要提前取消，必须手动处理
const stop = watch(count, callback);
onUnmounted(stop); // 或者 stop()
</script>
```

### 为什么还需要手动清理？

**场景一：条件性 watch**

```vue
<script setup>
import { ref, watch } from 'vue';

const isActive = ref(true);
const data = ref(null);

// ❌ 错误：如果 watch 在 isActive=false 时注册，不会有问题
// 但如果是动态创建的 watch，可能需要手动清理
const stop = watch(isActive, async (active) => {
  if (!active) return;
  data.value = await fetchData();
}, { immediate: true });

// 清理
stop();
</script>
```

**场景二：动态启用/禁用 watch**

```vue
<script setup>
import { ref, watch } from 'vue';

const enableWatch = ref(false);
const data = ref([]);

let stop = null;

watch(enableWatch, (enabled) => {
  if (enabled && !stop) {
    // 启用时创建 watch
    stop = watch(data, (d) => console.log('data:', d));
  } else if (!enabled && stop) {
    // 禁用时取消 watch
    stop();
    stop = null;
  }
}, { immediate: true });
</script>
```

**场景三：切换数据源**

```vue
<script setup>
import { ref, watch } from 'vue';

const source = ref('user');
const userData = ref(null);
const postData = ref(null);

let currentStop = null;

watch(source, (newSource) => {
  // 先取消旧的 watch
  currentStop?.();

  // 创建新的 watch
  if (newSource === 'user') {
    currentStop = watch(userData, (d) => console.log('user:', d));
  } else {
    currentStop = watch(postData, (d) => console.log('post:', d));
  }
}, { immediate: true });
</script>
```

---

## 常见使用场景

### 场景一：防抖 watch

```vue
<script setup>
import { ref, watch } from 'vue';
import { onUnmounted } from 'vue';

const keyword = ref('');
const results = ref([]);
let timeoutId = null;

// ✅ 用 stop handle 实现防抖
const stop = watch(keyword, (kw) => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    if (kw.trim()) {
      results.value = await search(kw);
    }
  }, 300);
});

onUnmounted(() => {
  stop();
  if (timeoutId) clearTimeout(timeoutId);
});
</script>
```

### 场景二：取消上一个请求

```vue
<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const userId = ref(1);
const user = ref(null);
let cancelToken = null;

watch(userId, async (id, oldId) => {
  // 取消上一个请求
  if (cancelToken) cancelToken.cancel('user changed');

  // 创建新的 cancel token
  cancelToken = axios.CancelToken.source();

  try {
    user.value = await axios.get(`/api/user/${id}`, {
      cancelToken: cancelToken.token
    });
  } catch (e) {
    if (!axios.isCancel(e)) console.error(e);
  }
}, { immediate: true });
</script>
```

### 场景三：自动重试

```vue
<script setup>
import { ref, watch } from 'vue';

const url = ref('https://api.example.com/data');
let retryCount = 0;
const maxRetries = 3;
let stop = null;

async function fetchWithRetry() {
  while (retryCount < maxRetries) {
    try {
      const res = await fetch(url.value);
      if (res.ok) return res.json();
    } catch (e) {
      retryCount++;
      if (retryCount >= maxRetries) throw e;
      await new Promise(r => setTimeout(r, 1000 * retryCount));
    }
  }
}

stop = watch(url, async (newUrl) => {
  retryCount = 0;
  await fetchWithRetry();
}, { immediate: true });
</script>
```

### 场景四：批量注册/取消

```vue
<script setup>
import { ref, watch } from 'vue';
import { onMounted, onUnmounted } from 'vue';

// 定义所有需要监控的数据源
const dependencies = {
  user: ref(null),
  settings: ref(null),
  posts: ref([]),
  comments: ref([])
};

// 回调函数映射
const callbacks = {
  user: (u) => console.log('user:', u),
  settings: (s) => console.log('settings:', s),
  posts: (p) => console.log('posts:', p),
  comments: (c) => console.log('comments:', c)
};

// 批量注册
const stopHandles = Object.entries(dependencies).map(([key, dep]) =>
  watch(dep, callbacks[key], { deep: true })
);

// 批量取消
onUnmounted(() => {
  stopHandles.forEach(stop => stop());
});
</script>
```

---

## watchEffect 的清理机制

### onCleanup 注册清理函数

```vue
<script setup>
import { ref, watchEffect } from 'vue';

const count = ref(0);

watchEffect((onCleanup) => {
  console.log('count:', count.value);

  // ✅ 注册清理函数
  onCleanup(() => {
    console.log('清理：上一个 effect 即将重新执行或停止');
  });
});

// 第一次触发：count=0 → 打印 "count: 0"
// 第二次触发：count=1 → 先打印 "清理" → 再打印 "count: 1"
// 组件卸载时：→ 打印 "清理"
</script>
```

### stopEffect vs onCleanup

```js
import { watchEffect } from 'vue';

// stop 返回后，watchEffect 不会再次触发
const stop = watchEffect((onCleanup) => {
  console.log('effect running');
  onCleanup(() => console.log('cleanup'));
});

stop(); // 取消 watchEffect
// 控制台：cleanup → effect 不再执行
```

---

## Vue 2 vs Vue 3 对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| `$watch` 返回函数 | ✅ 返回 unregister 函数 | — |
| `watch` option | ✅ 返回 unregister 函数 | — |
| `watch` Composition API | — | ✅ 返回 StopHandle |
| `watchEffect` | ❌ 不存在 | ✅ 返回 StopHandle |
| 组件卸载自动清理 | ✅ `$watch` 自动 | ✅ watch 自动 |
| Map 批量管理 | ⚠️ 不常用 | ✅ 推荐 |
| onCleanup | ❌ 不存在 | ✅ watchEffect 支持 |

### Vue 2 示例

```js
export default {
  data() {
    return { count: 0 };
  },
  watch: {
    count: {
      handler(newVal) {
        console.log('count:', newVal);
      },
      immediate: true
    }
  },
  created() {
    // ✅ 组件卸载时自动清理
  }
};

// 手动取消
const unwatch = this.$watch('count', callback);
unwatch(); // 取消 watch
```

---

## 常见问题

### Q1: 如何获取当前组件中所有 watch？

Vue 3 **不提供**直接获取所有 watch 的 API。你需要自己管理：

```js
// ✅ 推荐：自己维护一个 Map 或数组
const watchers = new Map();

// 注册时记录
watchers.set('key', watch(source, callback));

// 获取所有
console.log([...watchers.keys()]);

// 取消所有
watchers.forEach(s => s());
```

### Q2: watch 在组件卸载时自动取消吗？

**是的**，Vue 3 的 watch 在组件卸载时自动取消：

```vue
<script setup>
import { watch } from 'vue';

watch(count, (n) => console.log(n));
// ✅ 组件卸载时自动取消
// ✅ 不需要 onUnmounted(() => stop())
</script>
```

**但注意**：如果你需要**提前取消**（在组件卸载前），必须手动处理。

### Q3: 如何暂停/恢复 watch？

```js
const paused = ref(false);
let stop = null;

stop = watch(
  () => paused.value ? null : source,
  (val) => {
    if (val !== null) {
      console.log('source changed:', val);
    }
  }
);

// 暂停
paused.value = true;

// 恢复
paused.value = false;
```

### Q4: watch 和 watchEffect 的 stop handle 有何不同？

| | `watch` | `watchEffect` |
|--|---------|---------------|
| 返回值 | `StopHandle` | `StopHandle` |
| 取消行为 | 取消后不触发 | 取消后不触发 |
| 清理函数 | ❌ 无内置 | ✅ `onCleanup(fn)` |
| 懒执行 | `immediate: true` 才立即执行 | 立即执行 |

---

## 参考资料

- [Vue 3 Composition API - watch](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue 3 Composition API - watchEffect](https://vuejs.org/api/reactivity-core.html#watcheffect)
- [Vue 3 调试 Composition API](https://vuejs.org/guide/extras/composition-api-debugging.html)
