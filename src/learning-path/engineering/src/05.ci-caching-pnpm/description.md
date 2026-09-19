> 版本: GitHub Actions | RFC: — | 状态: stable | 概念: CI 缓存策略

# GitHub Actions 中 pnpm 缓存与构建产物

## 你会学到什么

- `pnpm/action-setup` 自动配置 pnpm
- 用 `actions/cache` 缓存 `~/.local/share/pnpm/store` 和 `node_modules`
- 缓存命中后构建从 8min 降到 1.5min

## 关键配置

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Cache Vite build
        uses: actions/cache@v4
        with:
          path: |
            node_modules/.vite
            dist
          key: ${{ runner.os }}-vite-${{ hashFiles('pnpm-lock.yaml') }}

      - run: pnpm build
      - run: pnpm test
```

## 缓存键策略

| 键 | 用途 |
|----|------|
| `${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}` | 锁文件变才重建 |
| `${{ runner.os }}-vite-${{ hashFiles('pnpm-lock.yaml', '**/vite.config.*') }}` | 构建产物缓存 |
| `${{ github.sha }}` | 按 PR 区分 |

## 动手试

1. 看下方对比表（无缓存 vs 缓存命中）
2. 切换「命中 / 未命中」观察节省时间
3. 看 build 阶段耗时变化

## 修复 / 选型

- monorepo：用 `--filter` 只构建受影响包
- Turborepo Remote Caching：跨 PR 共享 build 产物
- 自托管 runner：缓存磁盘本地化

## 延伸阅读

- [GitHub Actions Cache](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)

## 小结

1. **场景**：CI 慢。
2. **配置**：cache pnpm store + build 产物。
3. **收益**：冷启动 8min → 命中 1.5min。
