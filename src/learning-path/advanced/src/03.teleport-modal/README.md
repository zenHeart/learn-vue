# 模态框传送示例

这个示例展示了如何使用 Vue 3 的 teleport 功能来实现模态框。

## 主要功能

1. 使用 teleport 将模态框传送到指定的 DOM 节点
2. 通过 v-show 控制模态框的显示和隐藏
3. 使用 props 传递数据
4. 使用事件通信

## 代码说明

1. 在模板中定义传送目标：
```html
<div id="modals"></div>
```

2. 使用 teleport 组件：
```html
<teleport to="#modals">
  <div v-show="show" class="modal">
    <!-- 模态框内容 -->
  </div>
</teleport>
```

3. 使用 Composition API 管理状态：
```js
setup() {
  const text = ref('hello vue')
  const showModal = ref(false)

  return {
    text,
    showModal
  }
}
```

## 注意事项

1. teleport 的目标节点必须在组件挂载之前存在
2. 可以使用多个 teleport 将内容传送到不同的目标节点
3. 如果目标节点不存在，teleport 的内容会被忽略 