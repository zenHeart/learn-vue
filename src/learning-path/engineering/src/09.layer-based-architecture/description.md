> 版本: 通用 | RFC: — | 状态: stable | 概念: 分层架构

# 分层架构 vs Feature-Sliced

## 你会学到什么

- 传统分层 `views / components / composables / stores / utils / types`
- 单向依赖：`views → components → composables → utils`
- Feature-Sliced Design（FSD）：按业务切片，每层 `app / processes / pages / widgets / features / entities / shared`

## 传统分层结构

```
src/
├── views/        # 页面级（路由）
├── components/   # 通用 UI 组件
├── composables/  # 组合式函数
├── stores/       # Pinia stores
├── utils/        # 纯函数
└── types/        # 类型定义
```

依赖方向：

```
views ──→ components ──→ composables ──→ utils
   │           │              │
   └───→ stores ─────────────┘
```

## FSD 分层

```
src/
├── app/         # 应用入口、provider、router
├── processes/   # 跨页面流程（如 onboarding）
├── pages/       # 页面（路由）
├── widgets/     # 复合 UI 块
├── features/    # 用户操作（feature toggle）
├── entities/    # 业务实体（user, product）
└── shared/      # 通用工具、UI kit
```

依赖规则：上层依赖下层，**下层不可 import 上层**。

## 对比

| 维度 | 传统分层 | FSD |
|------|----------|-----|
| 学习曲线 | 低 | 中 |
| 跨层共享 | 自由 | 显式 import 段 |
| 大团队协作 | 易冲突 | 按切片独立演进 |
| 适用范围 | 中小项目 | 大型多团队 |

## 动手试

1. 看下方传统分层结构
2. 切换到 FSD 看分层对比
3. 查看依赖图箭头方向是否合法

## 修复 / 选型

- 小项目（< 5 万行）：传统分层足够
- 中大型：FSD 或 Nuxt Layers
- 微前端：每个子应用一个独立 FSD 切片

## 延伸阅读

- [Feature-Sliced Design](https://feature-sliced.design/)

## 小结

1. **场景**：代码组织失控。
2. **方案**：分层或 FSD 切片。
3. **原则**：单向依赖、下层无业务。
