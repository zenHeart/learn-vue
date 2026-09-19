> **版本**：Vue 3.x + Element Plus 2.x | **状态**：stable | **概念**：`GlobalComponents` 类型增强 + unplugin-vue-components 自动类型 | **延伸阅读**：[Element Plus 官方](https://element-plus.org/zh-CN/guide/typescript.html) | [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components)

# GlobalComponents 类型增强 + 自动组件注册类型

## 这是什么

`GlobalComponents` 是 Vue 3 的官方扩展点：把第三方组件库（Element Plus、Naive UI、shadcn-vue 等）注册到全局 `GlobalComponents` 接口上，让 `<ElButton>` / `<NButton>` 在模板里**不用 import、还有完整类型提示**。

两条路径：

1. **手动类型扩展**（传统）：写一个 `components.d.ts`，用 TypeScript 的「模块声明合并」把组件库导出注册到 `GlobalComponents`。
2. **unplugin-vue-components 自动生成**（推荐）：插件扫描模板里用到的组件名 + 注册器声明，自动产出 `components.d.ts`，无需手写。

## 源码走读

```ts
// src/types/components.d.ts
declare module 'vue' {
  interface GlobalComponents {
    ElButton: typeof import('element-plus/es')['ElButton']
    ElInput: typeof import('element-plus/es')['ElInput']
    NButton: typeof import('naive-ui')['NButton']
  }
}

export {}
```

- `declare module 'vue'` 触发 TypeScript 模块声明合并，覆盖 Vue 自带的 `GlobalComponents` 接口。
- `typeof import(...)` 让编译器从真实包元数据里推导组件 props / events / slots，类型完全精确。
- 文件末尾 `export {}` 把文件标记为模块（否则 declare 全局作用域会污染）。

## 实战配置

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

Components({
  resolvers: [ElementPlusResolver()],
  dts: 'src/types/components.d.ts',   // 自动写入
})
```

## Element Plus 全局类型 vs 按需引入

| 维度 | 全量引入 + GlobalComponents | 按需引入 + resolver |
|---|---|---|
| 包大小 | 全部进首屏 chunk | 仅用到的组件进 chunk |
| 模板用法 | `<el-button>` 直接用 | `<ElButton>` 任意大小写 |
| 类型提示 | 写一次 `components.d.ts` | 插件自动生成 |
| 主题定制 | 通过 SCSS 变量 | 通过 SCSS + ConfigProvider |

## shadcn-vue 模板示例

shadcn-vue 不发布组件包，而是复制组件源码到项目本地。它的类型增强是「手写 + 同名组件库映射」：

```ts
// src/types/shadcn-components.d.ts
import type { Button } from '@/components/ui/button'
import type { Card } from '@/components/ui/card'

declare module 'vue' {
  interface GlobalComponents {
    Button: typeof Button
    Card: typeof Card
  }
}
```

## 常见踩坑

- **`components.d.ts` 没被 tsconfig 包含**：`include: ["src/**/*.ts"]` 必须覆盖；否则声明合并不生效，模板提示 `Cannot find name 'ElButton'`。
- **类型增强与 `unplugin-vue-components` 冲突**：手写的声明会被自动生成的覆盖；保留一份即可。
- **`tsconfig.json` 没开 `skipLibCheck: true`**：第三方库的类型错误可能传导到工程里编译失败。
- **大小写约定**：Element Plus 模板里写 `<el-button>`（全小写、kebab）或 `<ElButton>`（PascalCase）都识别；类型声明建议用 PascalCase。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [Element Plus TS 指南](https://element-plus.org/zh-CN/guide/typescript.html) | 官方类型扩展模板 |
| [unplugin-vue-components README](https://github.com/antfu/unplugin-vue-components) | dts 自动生成原理 |
| [shadcn-vue](https://www.shadcn-vue.com/docs/) | 复制源码模式 + 类型扩展 |
| [Vue 官方 · GlobalComponents](https://vuejs.org/api/sfc-script-setup.html#typescript-only-features) | 官方扩展点说明 |