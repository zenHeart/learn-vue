# ref 自动解包与转换工具：isRef / unref / toRef / toRefs / customRef {#ref-unboxing}

> 版本: Vue 3.x | RFC: 0001-composition-api, 0013-composition-api-ref-sugar | 状态: stable

`ref` 是一个**带 value 属性的对象**，Vue 通过模板编译器和 `Proxy` get 拦截实现了多种场景下的自动解包：

| 场景 | 是否自动解包 |
|---|---|
| 模板内插值 `{{ count }}` | 是 |
| 模板属性绑定 `:value="count"` | 是 |
| 响应式对象属性 `reactive({ r }).r` | 是（`Reflect.get` 中检测 `isRef` 分支） |
| 普通 JS 上下文 `state.r.value` | 否（必须 `.value`） |
| `reactive` 数组/集合内部 | 否（解包只在 get 时进行，但数组方法依赖反射） |
| `readonly()` 包装后 | 是 |

转换工具对照：

- `isRef(r)` — 是否是 ref 实例
- `unref(r)` — `isRef(r) ? r.value : r`，等价于 `r == null ? r : r.value`
- `toRef(obj, 'key')` — 把对象的某个属性转为 ref，保持双向同步（不会丢失响应性）
- `toRefs(obj)` — 一次性把对象所有属性转 ref，常用于解构 `setup` 返回值
- `triggerRef(ref)` — 强制触发更新（用于 ref 内部持有 reactive 但跳过追踪的场景）
- `customRef(factory)` — 自定义 ref，工厂返回 `get/set` 钩子，常用于**防抖**或**异步 ref**

## 关键陷阱 {#pitfalls}

1. **解构丢失响应性**：`const { count } = state` 解构后 `count` 是普通值，必须用 `toRefs(state)`。
2. **不要把 ref 当作 class 字段的默认值**：`new MyClass({ count })` 会传 ref 对象而不是值。
3. **`customRef` 的 track/trigger 必须正确调用**：漏掉 `track()` 会导致依赖不收集，`trigger()` 漏掉则更新不通知。

## 延伸阅读 {#further-reading}

- [Vue 官方文档 · ref](https://vuejs.org/api/reactivity-core.html#ref)
- [Vue 官方文档 · toRef / toRefs](https://vuejs.org/api/reactivity-utilities.html#toref)
- [Vue 官方文档 · customRef](https://vuejs.org/api/reactivity-advanced.html#customref)
- [RFC 0001 Composition API](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0001-composition-api.md)
- [RFC 0013 Composition API ref sugar](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0013-composition-api-ref-sugar.md)
- [Vue 源码洞察：customRef 是 2.x Vue.observable 缺失的逃生口](_analysis/vue-source-insights.md#customref-是-2x-vueobservable-缺失的逃生口) | `packages/reactivity/src/ref.ts` 引用

<!-- description.md -->
