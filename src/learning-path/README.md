# Vue Learning Paths

这个目录包含了 Vue 的多条学习路径，每个路径专注于 Vue 的不同方面。

## 项目结构

```
learning-path/
├── README.md (当前文件)
├── LearningPathRepl.vue (通用 REPL 组件)
├── learning-path.data.ts (数据加载模块)
├── utils.ts (工具函数)
├── reactivity/ (响应式学习路径)
│   ├── index.md (入口页面)
│   └── src/
│       ├── 01.watch/ (Watch API 教程)
│       │   ├── App/ (示例代码)
│       │   ├── _hint/ (提示解决方案)
│       │   └── description.md (步骤说明)
│       └── 02.watchEffect/ (WatchEffect API 教程)
└── theory/ (Vue 理论学习路径)
    ├── index.md (入口页面)
    └── src/
        └── 01.xxx/ (示例步骤)
```

## 实现计划

1. ✅ 创建目录结构和 README.md
2. ✅ 创建通用 LearningPathRepl.vue 组件
3. ✅ 创建数据加载模块
4. ✅ 创建 utils.ts 工具函数
5. ✅ 实现 reactivity 学习路径
6. ✅ 实现 theory 学习路径
7. ✅ 集成到 VitePress 配置

## Bug修复任务

1. [x] 修复导航显示问题：导航栏只需一个 Learning Path 选项，左侧显示完整目录
2. [x] 修复内容显示问题：已添加调试信息以跟踪数据加载和渲染流程
3. [ ] 修复子步骤链接：确保 description.md 中的内部链接正确指向各子步骤
4. [ ] 优化加载流程：确保数据正确加载并显示

## 如何使用

每个学习路径都包含多个步骤，每个步骤都有:
- 描述文档 (description.md)
- 示例代码 (App/ 目录下)
- 提示解决方案 (_hint/ 目录下)

用户可以通过 URL 访问不同学习路径，如:
- /learning-path/reactivity/ 访问响应式学习路径
- /learning-path/theory/ 访问理论学习路径

## 迁移任务的最小成本方案

1. **分析 demos 目录**：快速分析 `src/examples/vue3/demos` 目录下的所有 demo 文件，按功能和用例进行分类。
2. **创建学习路径章节**：在 `src/learning-path` 目录下创建对应的章节目录，例如 `basics`、`reactivity`、`slots` 等。
3. **编写章节说明**：为每个章节创建 `README.md` 和 `index.md` 文件，描述该章节的功能和内容。
4. **迁移 demo 文件**：将 `demos` 目录下的 demo 文件迁移到对应的章节目录下的 `src` 目录中，并按照 `contributor.md` 中的规范组织文件结构。
5. **添加描述文档**：为每个 demo 创建 `description.md` 文件，描述该 demo 的功能和步骤。
6. **添加示例代码**：为每个 demo 创建 `App` 目录，并在其中添加示例代码。
7. **添加提示解决方案**：为每个 demo 创建 `_hint` 目录，并在其中添加提示解决方案。
8. **更新文档**：更新 `README.md` 和 `contributor.md` 文件，确保文档与新的目录结构一致。
9. **测试和验证**：测试每个 demo 的功能，确保其在新目录下正常运行。
10. **提交更改**：将更改提交到版本控制系统，并确保代码库的完整性。

### 最小成本方案

- **使用脚本自动化迁移**：编写脚本自动将 `demos` 目录下的文件迁移到 `learning-path` 目录中，减少手动操作。
- **批量处理**：将相似功能的 demo 批量处理，减少重复工作。
- **优先处理核心功能**：优先迁移核心功能的 demo，确保基本功能可用。
- **逐步完善**：在迁移过程中逐步完善文档和代码，确保每个 demo 都能正常运行。
