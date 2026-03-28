# 组件流程步骤模式 - 演示项目

> 主题：复杂的组件场景——例如确认框等逻辑，组件是顺序流程的一个步骤

## 目标

通过交互式演示，深入理解 Vue 3 中将复杂组件（如确认框）设计为顺序流程步骤的设计模式和最佳实践。

## 验收标准

### 文档验收
- [x] 覆盖 Step Pattern / Wizard Pattern 核心概念
- [x] 覆盖 State Machine Pattern 状态管理模式
- [x] 覆盖 Flow Context 上下文传递方案
- [x] 提供 provide/inject + defineEmits + v-model 的完整实现
- [x] 包含 Vue vs React 对比（render props vs scoped slot）
- [x] 列举常见踩坑点和最佳实践

### 演示验收
- [x] 使用 Vue 3 Composition API + `<script setup>` 语法
- [x] 展示多步骤确认流程（步骤条 + 内容 + 按钮）
- [x] 包含「上一步」「下一步」「确认」「取消」按钮
- [x] 演示状态管理和数据传递
- [x] 可直接在浏览器中运行（CDN Vue）
- [x] 至少 5 个 Tab：概念总览 / 单步确认 / 多步流程 / 状态机 / 自测题

## 核心设计模式

1. **Step Pattern** - 将流程拆分为独立步骤组件
2. **State Machine** - 用有限状态机管理流程状态转换
3. **Flow Context** - 通过 provide/inject 跨组件传递流程上下文
4. **Compound Component** - 复合组件模式实现步骤组合

## 文件结构

```
examples/vue3/demos/component-flow-step-pattern/
├── README.md           # 本文件
└── index.html          # 交互式演示页面

docs/vue/advanced/
└── component-flow-step-pattern.md  # 技术文档
```

## 运行方式

直接在浏览器中打开 `index.html` 即可运行演示。
