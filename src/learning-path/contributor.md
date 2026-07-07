# 贡献指南

## 添加一个新的章节

1. **创建章节目录**: 在 `learning-path` 目录下创建一个新的章节目录，例如 `new-chapter/`。
2. **添加 README.md**: 在新章节目录中创建一个 `README.md` 文件，描述该章节的功能和内容。
3. **添加入口页面**: 在新章节目录中创建一个 `index.md` 文件，作为该章节的入口页面。
4. **添加示例代码**: 在新章节目录中创建一个 `src/` 目录，并在其中添加示例代码和描述文档。

## 在某个章节中添加一个 Demo

1. **进入章节目录**: 导航到要添加 Demo 的章节目录，例如 `new-chapter/`。
2. **创建 Demo 目录**: 在 `src/` 目录下创建一个新的目录，例如 `new-demo/`。
3. **添加描述文档**: 在新 Demo 目录中创建一个 `description.md` 文件，描述该 Demo 的功能和步骤。
4. **添加示例代码**: 在新 Demo 目录中创建一个 `App/` 目录，并在其中添加示例代码。
5. **添加提示解决方案**: 在新 Demo 目录中创建一个 `_hint/` 目录，并在其中添加提示解决方案。

## 目录结构示例

```
learning-path/
├── new-chapter/
│   ├── README.md
│   ├── index.md
│   └── src/
│       └── new-demo/
│           ├── description.md
│           ├── App/
│           │   └── example.vue
│           └── _hint/
│               └── solution.vue
```

## 流程说明

- **README.md**: 描述章节的功能和内容。
- **index.md**: 作为章节的入口页面，提供导航和概述。
- **description.md**: 描述 Demo 的功能和步骤。
- **App/**: 存放示例代码，确保代码可运行。
- **_hint/**: 存放提示解决方案，帮助用户理解代码。

通过以上步骤，新人可以轻松地添加新的章节或 Demo，确保项目的可扩展性和可维护性。

## Demo 目录详细规范

每个章节的 `src/` 目录下，每个 demo 子目录需遵循如下规范：

### 必须文件
- **description.md**：
  - 必须存在。
  - 用于 markdown 格式描述当前 demo 的功能、步骤、说明等内容。
  - 页面会自动渲染该内容作为步骤说明。

- **App/**：
  - 必须存在。
  - 存放实际的 Vue 组件代码（如 `App.vue`）。
  - `App/` 目录下可以包含多个文件（如 `App.vue`、`Child.vue` 等），但应有一个主入口文件 `App.vue`，REPL 默认以此为入口。

### 可选文件
- **_hint/**：
  - 可选。
  - 用于存放"提示"或"参考答案"相关的代码结构。
  - 如果存在，页面会显示"显示提示"按钮，点击后 REPL 会加载 `_hint` 目录下的内容作为演示参考。
  - `_hint/` 目录结构应与主 demo 目录结构一致（如也有 `App/`、`Child.vue` 等），但可以只包含需要提示的部分文件。

### 目录结构举例

```
src/learning-path/reactivity/src/01.watch/
├── description.md      # 步骤说明，必须
├── App/
│   ├── App.vue        # 主 demo 入口，必须
│   └── Child.vue      # 可选，辅助组件
└── _hint/             # 可选，提示/参考答案
    └── App/
        └── App.vue
```

### 相关说明
- 只要有 `description.md` 和 `App/`，就能被识别为一个有效 demo。
- `App/` 下可以有多个 demo 组件文件，但需有 `App.vue` 作为入口。
- `_hint/` 不是必须的，但如果有，会在 UI 上显示"显示提示"按钮，点击后 REPL 区域会切换到 `_hint` 代码。
- `_hint/` 目录结构应与主目录一致，内容可精简，仅用于提示。 