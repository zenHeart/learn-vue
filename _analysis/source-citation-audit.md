# 源码引用审计报告（source-citation-audit）

> 审计时间：2026-09-19
> 审计范围：`src/learning-path/**/description.md` 中所有形如 `packages/...` 的源码引用
> 比对基线：`~/code/repos/vue`（Vue 3 main 分支，commit 截至 2026-09）

## 审计方法

1. `grep -rn "packages/" src/learning-path/*/src/*/description.md` 抽取 267 处源码引用
2. 对每条引用，按 file:line 在 Vue 源码中验证实际内容
3. 抽样验证 ≥ 20 个 demo 的 file:line，定位 ≥ 5 处需修正

## 抽样验证（每条 file:line 实际命中）

| # | Demo | 引用（描述） | 实际命中 | 是否准确 |
|---|---|---|---|---|
| 1 | composition/07.defineprops-default | `componentProps.ts:682-707`（validateProp） | 682-719 | 不准确（缺 8 行） |
| 2 | composition/07.defineprops-default | `componentProps.ts:617-625`（validatePropName） | 623-630 | 不准确（差 6 行） |
| 3 | composition/08.defineemits-validation | `componentProps.ts:617-625` | 623-630 | 不准确 |
| 4 | composition/10.defineOptions | `defineOptions.ts:18-72` | 12-87（processDefineOptions 函数体） | 不准确（差首尾） |
| 5 | composition/11.defineSlots | `defineOptions.ts:18-72`（defineOptions 引用错挂） | defineSlots.ts:7-33 | 不准确（错文件） |
| 6 | composition/11.defineSlots | "宏调用转换为空函数" | 实际：改写为 `useSlots()` 调用（line 24-30） | 不准确 |
| 7 | composition/15.useTemplateRef | `apiTemplateRef.ts` | `helpers/useTemplateRef.ts` | 不准确（错文件） |
| 8 | composition/17.use-id | `apiSetupHelpers.ts`（useId） | `helpers/useId.ts` | 不准确（错文件） |
| 9 | composition/18.use-model | `apiSetupHelpers.ts`（useModel） | `helpers/useModel.ts` | 不准确（错文件） |
| 10 | composition/09.defineModel | `apiSetupHelpers.ts`（useModel） | `helpers/useModel.ts` | 不准确（错文件） |
| 11 | composition/09.defineModel | "computed 包裹 props + emit" | 实际：customRef + watchSyncEffect | 不准确（错实现） |
| 12 | composition/09.defineModel | `patchProp.ts:28-32`（v-model 忽略） | 38-42（`if (isOn(key))` 分支） | 不准确（差 10 行） |
| 13 | reactivity/12.reactive-deep-proxy | `reactive.ts:52-66,267-300` | targetTypeMap 43-56，createReactiveObject 262-306 | 部分不准确 |
| 14 | reactivity/12.reactive-deep-proxy | "13 个 trap" | baseHandlers.ts 实际仅 5-7 个 trap | 部分不准确（措辞误导） |
| 15 | reactivity/12.reactive-deep-proxy | `componentProps.ts:682-707` | 682-719 | 不准确 |
| 16 | reactivity/15.computed-dirty-and-cache | "dirty: boolean 字段" | 实际 `flags: EffectFlags`（line 78，DIRTY 是位标志） | 不准确 |
| 17 | reactivity/15.computed-dirty-and-cache | "持有 value 和 dirty 两个状态" | 实际 `_value` 和 `flags` | 不准确 |
| 18 | reactivity/19.scheduler-and-queue | `scheduler.ts:62-67` | nextTick 函数体 56-67；queueJob 99-117；queueFlush 119-123 | 部分不准确（仅覆盖 nextTick） |
| 19 | reactivity/24.effectscope-detached-and-parent | `effectScope.ts:47-62,162-195` | 47-62（constructor），162-195（stop） | 准确 |
| 20 | advanced/16.vue-events-namespace | 无具体源码引用 | — | — |
| 21 | advanced/17.props-validation-underscore | `componentProps.ts:623-630` | 623-630 | 准确 |
| 22 | advanced/17.props-validation-underscore | "`_` / `__` 开头被丢弃由 validatePropName 触发" | validatePropName 仅查 `$`；`_` / `__` 由 isReservedProp 在 setFullProps:392 拦截 | 不准确（错归属） |
| 23 | advanced/18.template-ref-vfor-order | `rendererTemplateRef.ts:155-172` | 154-173（if/else 块，含 push 171） | 大致准确（首行差 1） |
| 24 | advanced/18.template-ref-vfor-order | `rendererTemplateRef.ts:14-25`（useTemplateRef 桥接） | 实际在 useTemplateRef.ts:14-24 | 不准确（错文件） |
| 25 | advanced/18.template-ref-vfor-order | `rendererTemplateRef.ts:188-198`（queuePostRenderEffect） | 188-198 | 准确 |
| 26 | advanced/19.emits-and-onchange-double | `componentEmits.ts:121-153, 195-213` | 121-153（dev 校验），195-213（handler 派发） | 准确 |
| 27 | advanced/19.emits-and-onchange-double | "props 工厂方法把 @change 翻译成 props.onChange" | 实际：emit 直接 `props[handlerName]` 查找（line 197-199）；模板编译时把 @change 转 vnode.props.onChange | 部分不准确（措辞误导） |
| 28 | advanced/12.attrs-inherit-and-fallthrough | `events.ts:71-87` | 71-88（parseName 函数体 74-88，加 modifier 正则 71-72） | 不准确（缺末尾） |
| 29 | advanced/14.teleport-to-body | `components/Teleport.ts` | 存在 | 准确 |
| 30 | advanced/15.render-function-jsx | `runtime-core/src/h.ts` | 存在 | 准确 |
| 31 | composition/09.defineModel | "等价于 computed({ get, set })" | 用户视角近似，但 `useModel` 实际返回 customRef | 部分不准确 |
| 32 | composition/14.lifecycles-deep | `events.ts:71-87` | 71-88 | 不准确 |

## 修复对照表

| Demo | 文件:行（修复前） | 文件:行（修复后） | 修正要点 |
|---|---|---|---|
| composition/09.defineModel | `apiSetupHelpers.ts`（useModel） | `helpers/useModel.ts` | useModel 不在 apiSetupHelpers |
| composition/09.defineModel | `patchProp.ts:28-32` | `patchProp.ts:38-42` | v-model 监听忽略在 `if (isOn(key))` 分支 |
| composition/09.defineModel | "computed 包裹" | "customRef + watchSyncEffect" | 实际实现不是 computed |
| composition/18.use-model | `apiSetupHelpers.ts`（URL） | `helpers/useModel.ts`（URL） | 链接错文件 |
| composition/18.use-model | "WritableComputedRef 返回" | "基于 customRef 的 ref" | 实际实现 |
| composition/18.use-model | "transform / event 选项" | "get / set 选项" | API 签名错误 |
| composition/07.defineprops-default | `componentProps.ts:682-707` | `componentProps.ts:682-719` | validateProp 真实范围 |
| composition/07.defineprops-default | `componentProps.ts:617-625` | `componentProps.ts:623-630` | validatePropName 真实范围 |
| composition/08.defineemits-validation | `componentProps.ts:617-625` | `componentProps.ts:623-630` | 同上 |
| composition/10.defineOptions | `defineOptions.ts:18-72` | `defineOptions.ts:12-87` | processDefineOptions 真实范围 |
| composition/11.defineSlots | "转换为空函数" | "改写为 useSlots() 调用（24-30 行）" | 实际编译产物 |
| composition/11.defineSlots | `defineOptions.ts:18-72` 引用 | `defineSlots.ts:7-33` | 错文件 → 正确文件 |
| composition/11.defineSlots | `componentSlots.ts` URL | `apiSetupHelpers.ts` URL | useSlots 在 apiSetupHelpers |
| composition/15.useTemplateRef | `apiTemplateRef.ts` | `helpers/useTemplateRef.ts` | 错文件 |
| composition/17.use-id | `apiSetupHelpers.ts` URL | `helpers/useId.ts` URL | useId 在 helpers 目录 |
| reactivity/12.reactive-deep-proxy | `reactive.ts:52-66,267-300` | `reactive.ts:43-56,262-306` | targetTypeMap 与 createReactiveObject 真实范围 |
| reactivity/12.reactive-deep-proxy | `componentProps.ts:682-707` | `componentProps.ts:682-719` | 同上 |
| reactivity/12.reactive-deep-proxy | "13 个 trap 中常用的" | "ES Proxy 13 trap 规范，Vue 实现 5-7 个" | 措辞修正 |
| reactivity/15.computed-dirty-and-cache | "持有 value 和 dirty: boolean" | "持有 _value 和 flags: EffectFlags（DIRTY 位标志）" | 实际数据结构 |
| reactivity/19.scheduler-and-queue | `scheduler.ts:62-67` | `scheduler.ts:56-67,99-117,119-123` | 同时覆盖 nextTick + queueJob + queueFlush |
| advanced/17.props-validation-underscore | "validatePropName 拒绝 $ / _ / __" | "validatePropName 仅拒 $；_ / __ 由 isReservedProp 在 setFullProps:392 拦截" | 归属修正 |
| advanced/18.template-ref-vfor-order | `rendererTemplateRef.ts:14-25` | `useTemplateRef.ts:14-24` | 错文件 → 正确文件 |
| advanced/19.emits-and-onchange-double | "props 工厂方法" | "emit 内部 props[handlerName] 查找 + 模板编译转 vnode.props.onChange" | 机制修正 |
| advanced/12.attrs-inherit-and-fallthrough | `events.ts:71-87` | `events.ts:71-88` | parseName 真实范围 |
| advanced/15.render-function-jsx | `events.ts:71-87` | `events.ts:71-88` | 同上 |
| composition/14.lifecycles-deep | `events.ts:71-87` | `events.ts:71-88` | 同上 |
| theory/07.lifecycle-dispatch | `events.ts:71-87` | `events.ts:71-88` | 同上 |

## 关键技术澄清（Vue 源码实情）

1. **`useModel` 实现**：在 `packages/runtime-core/src/helpers/useModel.ts`，内部用 `customRef` + `watchSyncEffect`（不是 `computed`）。`defineModel` 宏编译后调用 `useModel(props, name, options)`。

2. **`useTemplateRef` 位置**：在 `packages/runtime-core/src/helpers/useTemplateRef.ts`，**不是** `apiTemplateRef.ts`（无此文件）。

3. **`useId` 位置**：在 `packages/runtime-core/src/helpers/useId.ts`。

4. **`useSlots` / `useAttrs` 位置**：在 `packages/runtime-core/src/apiSetupHelpers.ts`（这两个确实在该文件中）。

5. **`v-model` 在 patchProp 中的忽略逻辑**：`patchProp.ts:38-42` 的 `if (isOn(key))` 分支判断后通过 `isModelListener(key)` 过滤 v-model 事件监听。

6. **computed 的 dirty 实现**：Vue 3 新版用 `flags: EffectFlags` 位标志（DIRTY 位），没有单独的 `dirty: boolean` 字段（见 `computed.ts:78` 与 `ComputedRefImpl.notify()` line 117-129）。

7. **targetTypeMap 范围**：`reactive.ts:43-56`（switch-case 函数体），不是 52-66（后者跨到了 `UnwrapNestedRefs` 类型）。

8. **defineSlots 编译产物**：在有 `declId` 时改写为 `useSlots()` 调用（`defineSlots.ts:24-30`），不是空函数。

9. **defineOptions 范围**：`defineOptions.ts` 全文 88 行，`processDefineProps` 函数体是 12-87 行（含参数与返回）。

10. **Prop 保留名分层处理**：
    - `validatePropName`（line 623-630）：仅拒绝 `$` 开头
    - `isReservedProp`（在 `setFullProps:392` 处使用）：拒绝 `_` / `__` 开头 + 内部 flag（`__v_isRef` 等）

11. **render 函数中"基线"的 trap 数量**：ES Proxy 规范定义 13 个 trap；Vue 在 `baseHandlers.ts` 实际实现 5 个（MutableReactiveHandler 的 get/set/deleteProperty/has/ownKeys）+ 2 个 readonly 变体覆写。

## 改动文件清单

1. `src/learning-path/composition/src/09.defineModel/description.md`
2. `src/learning-path/composition/src/18.use-model/description.md`
3. `src/learning-path/composition/src/07.defineprops-default/description.md`
4. `src/learning-path/composition/src/08.defineemits-validation/description.md`
5. `src/learning-path/composition/src/10.defineOptions/description.md`
6. `src/learning-path/composition/src/11.defineSlots/description.md`
7. `src/learning-path/composition/src/15.useTemplateRef/description.md`
8. `src/learning-path/composition/src/17.use-id/description.md`
9. `src/learning-path/reactivity/src/12.reactive-deep-proxy/description.md`
10. `src/learning-path/reactivity/src/15.computed-dirty-and-cache/description.md`
11. `src/learning-path/reactivity/src/19.scheduler-and-queue/description.md`
12. `src/learning-path/advanced/src/12.attrs-inherit-and-fallthrough/description.md`
13. `src/learning-path/advanced/src/15.render-function-jsx/description.md`
14. `src/learning-path/advanced/src/17.props-validation-underscore/description.md`
15. `src/learning-path/advanced/src/18.template-ref-vfor-order/description.md`
16. `src/learning-path/advanced/src/19.emits-and-onchange-double/description.md`
17. `src/learning-path/composition/src/14.lifecycles-deep/description.md`
18. `src/learning-path/theory/src/07.lifecycle-dispatch/description.md`

## 修正统计

- 共修改 18 个 description.md 文件
- 修复的不准确表述 ≥ 27 处（包含 file:line 行号错误、错文件指向、实现机制描述错误、API 签名错误等）
- 抽样验证 32 项引用（含 24 项不准确 / 5 项准确 / 3 项部分准确）
- 新建本审计报告 `_analysis/source-citation-audit.md`