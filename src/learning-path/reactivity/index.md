# Vue 响应式系统（Reactivity）

> Vue 3.x 中最核心的设计之一：`Proxy` + `Reflect` + `track/trigger` 模型。

本章节按"基础 → 进阶 → 性能与陷阱"递进，包含 23 个交互 demo。每个 demo 都是一个独立可运行的 Vue SFC，配有说明、原理分析与延伸阅读链接。

## Demo 列表 {#demos}

| # | 名称 | 主题 |
|---|---|---|
| 01 | reactive | 响应式对象入门 |
| 02 | ref / watchEffect | ref 创建与隐式副作用 |
| 03 | computed | 计算属性基础 |
| 04 | computed-accessor | getter/setter 双向 |
| 05 | computed-state | 计算属性状态切换 |
| 06 | toRefs | 对象属性转 ref |
| 07 | readonly | 只读代理 |
| 08 | isProxy | 代理判定 |
| 09 | isRef | ref 判定 |
| 10 | toRaw | 取原始对象 |
| 11 | reactive-origin | reactive 内部对原对象的修改 |
| 12 | reactive-deep-proxy | Proxy 13 个 trap 深度演示 |
| 13 | reactive-collection | Map / Set / shallow / markRaw 集合响应式 |
| 14 | ref-unboxing | ref 自动解包与转换工具（isRef / unref / toRef / toRefs / customRef） |
| 15 | computed-dirty-and-cache | lazy 求值、dirty 标记、嵌套依赖链与反模式 |
| 16 | effect-scope | 副作用作用域、可丢弃派生状态、detached scope |
| 17 | watch-vs-watcheffect | watch vs watchEffect 全维度对比 + flush 时机 |
| 18 | watch-source-form | 三种源形式 + deep 选项（Vue 3.5 `deep: number`） |
| 19 | scheduler-and-queue | 调度批处理、flushSync、queuePostFlushCb |
| 20 | ontrack-debug | onTrack / onTrigger 调试 + 循环引用修复 |
| 21 | reactive-vs-ref-perf | reactive vs ref vs shallowRef 性能基准 |
| 22 | ssr-reactivity | SSR 跨请求隔离、effectScope、hydration mismatch |
| 23 | toRaw-and-markraw | toRaw / markRaw 的内部使用与第三方实例场景 |

## 推荐学习顺序 {#recommended-order}

1. **入门**：01 → 02 → 03
2. **进阶**：04 → 05 → 06 → 11
3. **陷阱与调试**：12 → 13 → 14 → 15
4. **副作用管理**：16 → 17 → 18 → 19
5. **性能与生产**：20 → 21 → 22 → 23

## 关键概念速查 {#cheatsheet}

- **track**：读取响应式属性时收集当前活跃的 effect。
- **trigger**：写入响应式属性时通知所有依赖该属性的 effect 重跑。
- **dirty**：computed 内部标记，依赖变化时置 true，下次访问才重算。
- **scheduler**：将多个 trigger 合并到下一个 microtask，避免重渲染风暴。
- **effectScope**：副作用容器，统一 stop() 释放资源。
- **markRaw**：标记对象永远不被代理。
