> 版本: unplugin-vue-components 0.x+ | RFC: — | 状态: stable | 概念: unplugin-vue-components 自动注册

# unplugin-vue-components 自动注册

## 你会学到什么

`unplugin-vue-components/vite` 把组件库的 import 语句**静态扫描**后改写：原来你要写 `import { ElButton } from 'element-plus'`，现在可以直接 `<ElButton>`，插件会自动生成 import 并注入到产物的虚拟模块里。

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

Components({
  resolvers: [ElementPlusResolver()],
  dts: true,           // 自动生成 components.d.ts
  dirs: ['src/components'],
  extensions: ['vue'],
})
```

## 手写 import vs 自动注册

| 维度 | 手写 import | unplugin-vue-components |
|---|---|---|
| 模板写法 | `<ElButton>` + `import { ElButton }` | 只写 `<ElButton>` |
| 类型提示 | 立即可见 | 依赖 `components.d.ts`（开启 `dts: true` 后由插件生成） |
| Tree-shaking | 天然 | 配合 `ElementPlusResolver` 自动按需 |
| 体积影响 | 0 浪费 | 0 浪费（按需） |
| 维护成本 | 每次新增组件要改两处 | 只改模板 |

## 实战要点

1. **`dts: 'src/types/components.d.ts'`** — 必须开，否则 IDE 无法识别自动注册的组件
2. **`extensions: ['vue']`** — 显式列出，TypeScript SFC 也要扫到
3. **自定义组件目录** — `dirs: ['src/components']` 会扫描并自动注册命名导出
4. **多 UI 库** — `resolvers` 数组里放多个 resolver，按顺序解析

## 动手试

打开右侧 REPL，观察：

- 模板里直接写 `<ElButton>`、`<NaiveButton>` 不需要 import
- 看 dev 产物的 Network：`/@id/virtual:unplugin-vue-components-generated` 路径有自动生成的 import 语句
- 想看类型：打开自动生成的 `components.d.ts`

> 反例：如果 `<ElButton>` 没生效，先 `git status` 看 `components.d.ts` 是否被生成且被 `tsconfig.json` 包含。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) | 仓库 |
| [Element Plus 自动导入](https://element-plus.org/zh-CN/guide/quickstart.html#按需导入) | resolver 用法 |
| [`components.d.ts` 集成](https://github.com/antfu/unplugin-vue-components#typescript) | dts 字段 |
| [Naive UI resolver](https://www.naiveui.com/zh-CN/os-theme/docs/import-on-demand) | 多 UI 库协同 |
