> 版本: TypeScript 5 + Vite 5 | RFC: — | 状态: stable | 概念: 路径别名一致性

# 路径别名：tsconfig paths 与 Vite alias 同步

## 你会学到什么

- 在 `tsconfig.json` 的 `compilerOptions.paths` 声明别名
- 在 `vite.config.ts` 的 `resolve.alias` 同步声明
- monorepo 跨包别名 `@my-lib/hooks`

## 关键配置

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@my-lib/hooks": ["../../packages/hooks/src/index.ts"]
    }
  }
}
```

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'

export default {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@my-lib/hooks': fileURLToPath(new URL('./packages/hooks/src/index.ts', import.meta.url)),
    },
  },
}
```

## 一致性陷阱

| 情况 | 现象 | 解决 |
|------|------|------|
| tsconfig 写了 vite 没写 | 类型 OK，运行报错 Cannot resolve | 两处都写 |
| vite 写了 tsconfig 没写 | 运行 OK，类型报 Unable to find | 两处都写 |
| monorepo 跨包 | 路径相对根解析 | 用绝对路径或 `pnpm workspace` |

## 动手试

1. 看下方别名映射表
2. 切换「包内别名 / 跨包别名」观察路径生成

## 修复 / 选型

- 同步工具：`vite-tsconfig-paths` 自动从 tsconfig 读
- IDE 提示：装 `TypeScript Vue Plugin`
- 单源：让 Vite alias 自动从 tsconfig 生成

## 延伸阅读

- [Vite resolve.alias](https://vite.dev/config/shared-options.html#resolve-alias)
- [TypeScript paths](https://www.typescriptlang.org/tsconfig#paths)

## 小结

1. **场景**：深层 import 难读。
2. **配置**：tsconfig + Vite 双声明。
3. **工具**：`vite-tsconfig-paths` 自动同步。
