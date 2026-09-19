> **版本**：Vue 3.x | **状态**：stable | **源码**：`packages/runtime-core/types/globalComponents.d.ts` | **延伸阅读**：[Vue 官方 · 组件库类型](https://vuejs.org/guide/typescript/overview.html#augmenting-global-properties) | [Element Plus 类型增强](https://element-plus.org/en-US/guide/typescript.html)

# .d.ts 增强 GlobalComponents：第三方组件库的类型接入

## 这是什么

`GlobalComponents` 是 Vue 暴露给第三方组件库的扩展点。当你在模板里写 `<MyButton />` 而没有 import，TypeScript 不知道 MyButton 是什么，编辑器会标红。

解决方案：在 `*.d.ts` 里扩展 `GlobalComponents` 接口：

```ts
// src/types/components.d.ts
import type { GlobalComponents } from 'vue'
import MyButton from '@/components/MyButton.vue'

declare module 'vue' {
  interface GlobalComponents {
    MyButton: typeof MyButton
    MyDialog: typeof import('@/components/MyDialog.vue')['default']
    ElButton: typeof import('element-plus/es/components/button')['default']
  }
}
```

之后模板里 `<MyButton />` 自动获得：

- props 推断（`<MyButton :size="...">`）
- emits 推断（`@click="..."`）
- slots / expose 提示

### GlobalDirectives

同样的机制适用于自定义指令：

```ts
import type { GlobalDirectives } from 'vue'

declare module 'vue' {
  interface GlobalDirectives {
    vTooltip: typeof import('@/directives/tooltip')['default']
  }
}
```

但 GlobalDirectives 在 Vue 3.x 里仍处于提案状态——主流方式还是 `app.directive()` 注册 + 手动维护类型。

### 主流组件库的类型增强套路

以 Element Plus 为例：

1. 仓库内自带 `element-plus/global.d.ts`，覆盖了全部组件类型
2. 使用方在 `tsconfig.json` 的 `include` 里加上 `**/*.d.ts` 或显式导入
3. 模板里写 `<el-button type="primary">` 即可获得 props 提示

shadcn-vue、Naive UI、Ant Design Vue 都遵循同一模式：暴露 `*.d.ts`，用户无需手写。

## 源码走读

`packages/runtime-core/types/globalComponents.d.ts`：

```ts
export interface GlobalComponents {
  // 用户可扩展的接口
}
```

这是 Vue 给出的"插槽"接口——组件库只要在 declare module 里往里塞字段，TypeScript 就把对应组件加入模板全局可见列表。

`packages/runtime-core/types/globalDirectives.ts` 同理：

```ts
export interface GlobalDirectives {
  // vXXX 自定义指令的全局类型
}
```

## 实战场景

1. **内部组件库发布**：把 `GlobalComponents` 增强打包成 npm 包 `types/global-components.d.ts`，消费者只需 `include` 它。
2. **多团队协作**：A 团队做的 UI 组件，B 团队项目里想直接 `<TeamAButton />`，B 项目里加一份 `.d.ts` 即可。
3. **统一组件风格**：所有页面统一从 `GlobalComponents` 里取，tsconfig 写 `strict: true`，禁止临时 inline 组件。

## 常见踩坑

- **未在 tsconfig include 里**：`.d.ts` 文件被 IDE 忽略 → Volar 不识别 → 模板错误。常见原因：放在 `examples/` 或 `docs/` 目录。
- **`typeof import('xxx')['default']`**：第三方组件默认导出是 default，必须 `['default']` 取出；ESM 兼容写法。
- **同名冲突**：多个 `.d.ts` 里声明了同名 GlobalComponents 字段，TS 取**合并声明**而非报错；可能导致组件类型不可预期。
- **未注册但用了**：模板用了某个组件但没有注册且没有 GlobalComponents 增强，Vue 3 默认走运行时 fallback（控制台 warn）；TypeScript 也只在严格模式下报 unknown tag。
- **scoped 组件名 vs 增强名**：GlobalComponents 的 key 是注册名（PascalCase 优先），而不是标签实际写法——`<my-button>` 与 `<MyButton>` 都能匹配相同 GlobalComponents key。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Vue 官方 · GlobalComponents](https://vuejs.org/api/utility-types.html#globalcomponents) | 接口定义 |
| [Element Plus · TypeScript](https://element-plus.org/en-US/guide/typescript.html) | 实际组件库增强范例 |
| [TypeScript · 模块声明](https://www.typescriptlang.org/docs/handbook/2/modules.html) | declare module 语法 |
| [Vue 源码 · globalComponents.d.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/types/globalComponents.d.ts) | 接口定义所在 |
| [Vue 源码 · globalDirectives.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/types/globalDirectives.ts) | 指令扩展接口 |