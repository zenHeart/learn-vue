# AGENTS.md

本文件约束 AI Agent 在本仓库中的行为，**优先级高于一般推断**。

## 内容安全（强制）

本仓库为 **Public** 开源项目。所有写入仓库的文件（含 demo、文档、注释、commit message、AGENTS.md 自身）**不得包含**：

### 禁止出现的信息

| 类别 | 示例（禁止） |
|------|-------------|
| 公司名称 / 产品名 | 具体公司、App 名称、内部项目代号 |
| 内部仓库 / 提交 | 私有 repo 名、内部 commit hash、分支名 |
| 内部文件路径 | `app/xxx/src/stores/...` 等真实业务路径 |
| 性能采样原始数据 | Profile JSON 文件名、采样时长、具体耗时占比 |
| 内网 / 基础设施 | 内网 IP、主机名、CI job 号、域名（非公开站点） |
| 员工信息 | 邮箱、工号、真实姓名（作者字段除外且须脱敏） |
| 未公开业务术语 | 内部功能名、业务场景专有名词 |

### 必须做的抽象

将真实案例抽象为**通用教学场景**：

- 「组队列表分页」→「虚拟列表分页加载」
- `buildLegacyTeamListProjection` → `buildListProjection`
- `channelMap` / `teamChannelIds` → `itemMap` / `orderedIds`
- 具体 trace 数据 →「依赖规模 O(n×k)」「基准测试加速比」等可复现描述
- 内部单测路径 →「契约测试」「onTrack 断言」

### 允许引用

- [Vue 官方文档](https://vuejs.org/)
- [vuejs/core](https://github.com/vuejs/core) 公开 issue / PR
- 本仓库公开地址 `vue.zenheart.site`
- 通用技术概念（Proxy、computed、toRaw、虚拟列表）

## 代码规范

- Demo 必须在 REPL 中可运行，**computed getter 禁止副作用**（不可在 getter 内修改 ref）
- 性能对比用 `onTrack` / `performance.now()`，不伪造数据
- 学习路径遵循 `src/learning-path/contributor.md` 目录规范

## 部署

- 站点：`vue.zenheart.site`（GitHub Pages）
- DNS：阿里云解析，勿在文档中写具体操作凭证
- 推送 `main` 自动部署，无需手动 OSS

## 自检清单（每次提交前）

- [ ] 全文搜索：公司名、产品名、内部 repo、commit hash、Profile、内网 IP
- [ ] Demo 本地/构建通过（`pnpm build`）
- [ ] computed 无循环依赖 / 栈溢出
- [ ] 无 `.env`、密钥、token 进入版本库
