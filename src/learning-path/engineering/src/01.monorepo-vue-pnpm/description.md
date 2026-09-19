> 版本: pnpm 8+ | RFC: — | 状态: stable | 概念: pnpm workspace

# pnpm workspace 与 Vue 组件库共享

## 你会学到什么

- `pnpm-workspace.yaml` 配置多包
- `@my-org/components` 共享给 web / admin / mobile
- 用 topological sort 排构建顺序（依赖 → 被依赖）

## 真实场景（抽象）

三层 monorepo：
- `packages/ui`：UI 组件库
- `packages/utils`：通用工具
- `apps/web`：主应用，依赖 ui + utils

## 关键配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// apps/web/package.json
{
  "dependencies": {
    "@my-org/ui": "workspace:*",
    "@my-org/utils": "workspace:*"
  }
}
```

## 构建顺序（拓扑）

```
@my-org/utils    @my-org/ui (depends on utils)
       \         /
        \       /
         \     /
          apps/web
```

工具实现：Kahn 算法从入度 0 的节点开始，逐层 pop。

## 动手试

1. 看 build order 展示：utils → ui → web
2. 切换「并行构建」开关：观察 maxParallel 参数如何影响总耗时

## 修复 / 选型

- `pnpm -r --filter=...^ build` 自动拓扑
- Turborepo：`turbo.json` 的 `dependsOn` 显式声明
- Nx / Rush：更完整但学习曲线高

## 延伸阅读

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/)

## 小结

1. **场景**：多 Vue 应用共享组件库。
2. **配置**：`pnpm-workspace.yaml` + `workspace:*`。
3. **构建**：拓扑排序避免依赖未编译。
