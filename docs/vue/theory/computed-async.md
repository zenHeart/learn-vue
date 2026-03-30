# Vue Computed 与异步数据：常见陷阱与解决方案

> 为什么 computed 在异步接口返回后无法响应数据变化？Vue 3 响应式系统的深层机制解析。

## 1. 问题现象

### 1.1 典型错误代码

```javascript
// ❌ 常见错误：computed 依赖异步数据
const { data } = await fetchUser();
const isAdult = computed(() => data.value.age > 18);
// data.value.age 变化时，isAdult 不会重新计算
```

### 1.2 错误表现

- 异步数据返回后，computed 不触发更新
- 控制台没有报错，但计算结果不正确
- 打印 `data.value` 发现有值，但 computed 返回旧值

---

## 2. 根因分析

### 2.1 Vue Computed 实现原理

Vue 3 的 computed 基于**懒评估（Laziness）**和**脏标记（Dirty Flag）**：

```javascript
// computed 内部简化逻辑
function computed(getter) {
  let dirty = true;        // 初始为脏（需要计算）
  let value;

  const effect = () => {
    dirty = true;          // 依赖变化时标记为脏
    value = getter();      // 下次访问时重新计算
  };

  return {
    get value() {
      if (dirty) {
        value = getter();  // 懒评估：只在首次/脏时计算
        dirty = false;
      }
      return value;
    }
  };
}
```

**关键点**：computed 的响应式依赖追踪发生在**评估时**。

### 2.2 异步场景下的失效机制

```javascript
// 场景分析
async function fetchUser() {
  const response = await api.getUser();
  return response.data;
}

// setup 中
setup() {
  const data = ref(null);

  // ❌ 错误：Promise 建立时 data.value 为 null
  // computed 此时建立依赖关系，追踪 null
  const isAdult = computed(() => data.value?.age > 18);

  // 这之后才设置值，但 computed 已经"记住"了旧依赖
  fetchUser().then(res => data.value = res);

  return { data, isAdult };
}
```

**时序问题**：
```
t0: setup() 执行，computed 建立依赖追踪
    computed 追踪的是 data（响应式对象本身）
    但 data.value 此时是 null

t1: async 请求发出

t2: 数据返回，data.value = res
    data 触发更新

t3: computed 重新求值
    读取 data.value?.age
    此时 data.value 已经是新值
```

实际上这段代码**应该是正常工作的**。真正的问题在下面。

### 2.3 真正的问题场景

```javascript
// ❌ 真正的问题：watchEffect 中使用 computed
const user = ref(null);
const isAdult = computed(() => user.value?.age > 18);

watchEffect(() => {
  console.log('isAdult:', isAdult.value);
});

// 设置值
setTimeout(() => {
  user.value = { age: 25 };
  // 预期：触发 watchEffect
  // 实际：可能不触发
}, 1000);
```

### 2.4 常见误区

| 误区 | 真相 |
|------|------|
| computed 可以监听 Promise | ❌ computed 只能追踪响应式对象的访问 |
| 异步数据"之后"设置值，computed 就失效 | ❌ 响应式赋值会触发更新 |
| watch 和 computed 没有区别 | ❌ watch 监听数据变化，computed 推导数据 |

---

## 3. 解决方案

### 3.1 方案一：使用 watch + immediate

```javascript
// ✅ 正确：在 watch 中处理异步数据
const user = ref(null);
const isAdult = ref(false);

watch(user, (newUser) => {
  isAdult.value = newUser?.age > 18;
}, { immediate: true });
```

### 3.2 方案二：watchEffect + async/await

```javascript
// ✅ 正确：在 watchEffect 中处理
const user = ref(null);
const isAdult = ref(false);

watchEffect(async () => {
  if (user.value) {
    isAdult.value = user.value.age > 18;
  }
});
```

### 3.3 方案三：computed + 明确依赖

```javascript
// ✅ 正确：确保 computed 追踪正确的响应式数据
const user = ref(null);
const age = computed(() => user.value?.age ?? 0);
const isAdult = computed(() => age.value > 18);
```

### 3.4 方案四：nextTick 配合

```javascript
// ✅ 正确：等待数据更新后再读取
async function updateUser() {
  user.value = await fetchUser();
  await nextTick();
  console.log(isAdult.value); // 此时是正确的值
}
```

---

## 4. Vue 3 响应式系统基础

### 4.1 reactive vs ref

| 特性 | reactive | ref |
|------|----------|-----|
| 适用类型 | 对象、数组 | 任意类型 |
| 访问方式 | 直接访问 | `.value` |
| 解构丢失响应 | 是（需 toRefs） | 否 |
| 内部实现 | Proxy | 包装对象 + get/set |

```javascript
// reactive
const state = reactive({ count: 0 });
state.count++; // 响应式

// ref
const count = ref(0);
count.value++; // 需要 .value
```

### 4.2 响应式依赖追踪

Vue 3 的响应式系统通过**Proxy**拦截 get/set 来追踪依赖：

```javascript
const data = reactive({ name: 'John' });

// 当执行这段代码时
console.log(data.name);
// → Proxy 拦截 get，收集依赖

// 当修改时
data.name = 'Jane';
// → Proxy 拦截 set，触发更新
```

### 4.3 computed 的评估时机

```javascript
const count = ref(0);
const doubled = computed(() => count.value * 2);

// 评估时机：首次访问时
console.log(doubled.value); // 0 → 开始追踪 count

count.value = 5;
// → count 变化，标记 doubled 为脏

console.log(doubled.value); // 10 → 重新评估
```

---

## 5. 常见踩坑场景与解决方案

### 5.1 场景一：解构丢失响应式

```javascript
// ❌ 错误
const { name } = reactive({ name: 'John' });
console.log(name); // 不是响应式的

// ✅ 正确
const state = reactive({ name: 'John' });
const name = toRef(state, 'name');

// 或者
const { name } = toRefs(state);
```

### 5.2 场景二： computed 中修改其他 ref

```javascript
// ❌ 错误：computed 不应有副作用
const count = ref(0);
const doubled = computed(() => {
  count.value = count.value * 2; // 警告：在 computed 中修改响应式状态
  return count.value;
});

// ✅ 正确：computed 只读
const count = ref(1);
const doubled = computed(() => count.value * 2);
```

### 5.3 场景三：异步 computed

```javascript
// ❌ 错误：computed 不能是异步
const user = computed(async () => {
  return await fetchUser(); // 不起作用
});

// ✅ 正确：使用 watch + async
const user = ref(null);
watchEffect(async () => {
  user.value = await fetchUser();
});
```

### 5.4 场景四：computed 依赖数组变化

```javascript
// ❌ 常见问题
const list = ref([1, 2, 3]);
const sum = computed(() => list.value.reduce((a, b) => a + b, 0));

// push 不触发更新（Vue 3 的已知行为）
list.value.push(4);

// ✅ 正确：替换整个数组
list.value = [...list.value, 4];

// 或者
const list = reactive([1, 2, 3]);
// reactive 的数组方法有响应式版本
list.push(4); // 正常工作
```

---

## 6. watch vs computed vs watchEffect

| 特性 | computed | watch | watchEffect |
|------|----------|-------|-------------|
| **用途** | 派生数据 | 观察变化 | 副作用 |
| **返回值** | ref | 停止函数 | 停止函数 |
| **首次执行** | 懒执行 | 需 immediate | 立即执行 |
| **依赖追踪** | 自动 | 显式指定 | 自动 |
| **适用场景** | 同步计算 | 异步/复杂逻辑 | 副作用操作 |

### 6.1 选择指南

```
需要基于响应式数据计算派生值？
  → computed

需要执行异步操作或复杂逻辑？
  → watchEffect

需要精确控制何时执行？
  → watch

需要监听旧值和新值？
  → watch
```

### 6.2 示例对比

```javascript
// computed：计算派生值
const firstName = ref('John');
const lastName = ref('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

// watchEffect：执行副作用
watchEffect(() => {
  document.title = fullName.value;
});

// watch：精确控制
watch(firstName, (newVal, oldVal) => {
  console.log(`从 ${oldVal} 变为 ${newVal}`);
});
```

---

## 7. 最佳实践

### 7.1 Computed 最佳实践

1. **保持 computed 纯函数**：不修改状态，只返回值
2. **避免嵌套 computed**：难以维护
3. **使用短路径访问**：减少不必要的依赖追踪

```javascript
// ✅ 好实践
const user = ref(null);
const isAdult = computed(() => user.value?.age > 18);

// ❌ 不好实践
const isAdult = computed(() => {
  const u = user.value;
  if (!u) return false;
  return u.profile?.age > 18; // 深层访问
});
```

### 7.2 响应式数据最佳实践

1. **优先使用 reactive**：对于对象/数组更自然
2. **注意数组操作**：Vue 3 对数组的 push/splice 有特殊处理
3. **使用 toRefs 保持解构响应式**

```javascript
// ✅ 好实践
const state = reactive({
  user: null,
  loading: false,
  error: null
});

// ✅ 好实践
const { user, loading, error } = toRefs(state);
```

### 7.3 异步数据最佳实践

1. **使用 watchEffect 处理异步**
2. **处理 loading 和 error 状态**
3. **使用 onMounted 发起请求**

```javascript
const user = ref(null);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    user.value = await fetchUser();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});
```

---

## 8. 参考资料

- [Vue 3 响应式系统](https://vuejs.org/guide/reactivity-core.html)
- [Vue 3 computed](https://vuejs.org/api/reactivity-core.html#computed)
- [Vue 3 watch](https://vuejs.org/api/reactivity-core.html#watch)
- [Vue 3 watchEffect](https://vuejs.org/api/reactivity-core.html#watcheffect)
- [Vue 3 异步组件](https://vuejs.org/guide/components/async.html)

---

## 9. 相关文档

- [Vue 响应式原理](./reactive.md)
- [Vue 3 变更检测](./vue3.md)
- [组合式 API](./composition-api.md)
