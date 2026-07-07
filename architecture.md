# 项目架构理解

## 项目概述
该项目是一个 Vue 相关的实验和验证 demo，主要用于展示和测试 Vue 的功能和用法。

## 目录结构
- **config**: 存放配置文件
- **examples**: 存放测试代码
- **graph**: 存放相关图例
- **scripts**: 存放脚本文件
- **docs**: 存放文档
- **README.md**: 项目介绍
- **package.json**: 项目依赖和脚本配置
- **todo**: 待办事项
- **src**: 源代码目录
  - **learning-path**: 学习路径子章节
    - **README.md**: 当前文件，包含 Vue 学习路径的概述和项目结构。
    - **LearningPathRepl.vue**: 通用 REPL 组件，用于展示和交互。
    - **learning-path.data.ts**: 数据加载模块，负责加载学习路径的数据。
    - **utils.ts**: 工具函数，提供辅助功能。
    - **reactivity/**: 响应式学习路径，包含 Watch API 和 WatchEffect API 的教程。
      - **index.md**: 入口页面。
      - **src/**: 包含示例代码和描述文档。
        - **01.watch/**: Watch API 教程，包含示例代码和提示解决方案。
        - **02.watchEffect/**: WatchEffect API 教程，包含示例代码和提示解决方案。
    - **theory/**: Vue 理论学习路径，包含示例步骤。
      - **index.md**: 入口页面。
      - **src/**: 包含示例步骤。
        - **01.xxx/**: 示例步骤，包含描述文档和示例代码。

## 依赖管理
项目使用 `pnpm` 作为包管理工具，依赖包括：
- **Vue**: 用于构建用户界面的渐进式框架
- **VitePress**: 用于生成静态网站
- 其他相关库如 `@vue/repl`, `dynamics.js`, `gsap` 等

## 常用命令
- `npm run start:vue2`: 运行 Vue 2 的示例
- `npm run start:vue3`: 运行 Vue 3 的示例
- `npm run docs:dev`: 运行文档

## 开发环境
- Node.js 版本要求: >=18.0.0
- 使用 TypeScript 进行开发 