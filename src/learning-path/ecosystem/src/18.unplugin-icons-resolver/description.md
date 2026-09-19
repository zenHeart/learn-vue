> **版本**：unplugin-icons 0.x+ | **状态**：stable | **概念**：图标按需自动注册

# unplugin-icons + unplugin-vue-components 自动注册图标

## 这是什么

Iconify 把 200+ 套图标库做成 JSON，`@iconify-json/<set>` 是按需 subset（如 `@iconify-json/mdi` 含 Material Design Icons）。`unplugin-icons` 在 Vite/Webpack/Rollup 编译期把图标按需 import 进 SFC；`unplugin-vue-components` 的 `IconResolver` 让 `<IconMdiAccount />` 这样的写法**无需 import**——像用组件库一样用图标。

体积收益明显：全量 `@iconify/fa-solid` 200KB+；按需后每个图标 < 1KB，bundle 里只出现用到的。

## 实战配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        // 自动从 '@iconify-json/mdi' 按需取图标
        IconsResolver({
          prefix: 'Icon',
          enabledCollections: ['mdi', 'mdi-light', 'carbon', 'tabler'],
        }),
      ],
      dts: 'src/types/components.d.ts',
    }),
    // 编译时把图标 import 转成 SVG 内联
    Icons({ autoInstall: true, compiler: 'vue3' }),
  ],
})
```

模板里直接写：

```vue
<template>
  <IconMdiAccount />
  <IconMdiHomeVariant />
  <button><IconMdiMagnify /> 搜索</button>
</template>
```

`Icon` 前缀 + `Mdi` 集合 + 图标名 PascalCase → 编译器自动 import 对应 SVG。

## 自定义图标（项目内 SVG）

```ts
// vite.config.ts
Components({
  resolvers: [
    IconsResolver({
      customCollections: [
        FileSystemIconLoader('src/assets/icons', svg => svg.replace(/^.*\//, '')),
      ],
      prefix: 'Icon',
    }),
  ],
})
```

`src/assets/icons/home.svg` → `<IconHome />`，不再手写 import 也不依赖 Iconify。

## 源码走读

```ts
// node_modules/unplugin-icons/dist/resolver.js (简化)
function resolveIcons(name, options) {
  const collection = parseCollection(name, options.prefix)
  // collection = 'mdi', iconName = 'Account'
  return {
    from: `@iconify-icons/${collection}/${iconName}`,
    sideEffects: `@iconify-icons/${collection}/${iconName}`,
  }
}
```

`@iconify-icons/mdi/account` 是一个**预生成的 ESM 模块**——unplugin-icons 在 build 时把 JSON subset 拆成单图标文件，所以你 import 时拿到的已经是 `<svg>` JSX/虚拟节点。

## 常见踩坑

- **`@iconify-json/<set>` 没装**：`autoInstall: true` 会自动装，但生产 CI 里要确保网络可达；否则预先 `pnpm i @iconify-json/mdi -D`。
- **TypeScript 找不到组件**：开 `Components({ dts: true })`，生成 `components.d.ts` 并在 `tsconfig.json` include。
- **动态图标名不工作**：`unplugin-icons` 走静态分析，`<IconMdiAccount />` 字符串写死才生效；`<Icon :icon="`mdi-${name}`" />` 不行，需要 `unplugin-icons/runtime` 或预生成。
- **SSR 体积**：每个图标都是独立 ESM，但 SSR 阶段会被全量收集到 critical CSS——用 `Icons({ defaultStyle: 'display: inline-block' })` 显式给兜底样式。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [unplugin-icons 官方](https://github.com/antfu/unplugin-icons) | 完整配置 |
| [Iconify 集合列表](https://icon-sets.iconify.design/) | 200+ 图标库 |
| [FileSystemIconLoader](https://github.com/antfu/unplugin-icons#filesystem-icon-loader) | 自定义项目 SVG |
| [相关 demo](./) | 02.unplugin-vue-components 是 component resolver 入门 |
