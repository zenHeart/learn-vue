> 版本: Vue 3.x | RFC: — | 状态: stable | 概念: provide / inject 默认值

# provide / inject 默认值不参与响应式

## 你会学到什么

- `inject('key', defaultValue)` 的默认值是「无 provider 时的兜底」
- provider 给了普通对象时，inject 拿到的不是 ref
- 想响应式：provider 给 ref 或 reactive

## 错误示例

```js
// 父
provide('count', 0)

// 子
const count = inject('count', 0)
function inc() { count++ }  // 普通 number，不响应
```

## 修复版本

```js
// 父
const count = ref(0)
provide('count', count)

// 子
const count = inject('count')  // 拿到 ref
function inc() { count.value++ }
```

## 工厂函数默认值

```js
const store = inject('store', () => createDefaultStore(), true)
```

第二个参数可以是工厂函数，第三个参数 `true` 让默认值也是响应式。

## 动手试

1. 点击「错误：provide 普通值」 — 自增不响应
2. 切换「修复：provide ref」 — 自增响应

## 根因

`provide` 透传任意值，**Vue 不会自动包装成响应式**。Inject 拿到的就是当时传入的引用。

## 修复 / 选型

- 共享状态：用 `ref` / `reactive`
- 共享不可变配置：普通值
- 类型：在 provide 处用 InjectionKey 收紧类型

## 延伸阅读

- [provide / inject](https://vuejs.org/guide/components/provide-inject.html)

## 小结

1. **现象**：inject 后改值不触发更新。
2. **复现**：错误版本自增失效。
3. **修复**：provider 处用 ref 包裹。
