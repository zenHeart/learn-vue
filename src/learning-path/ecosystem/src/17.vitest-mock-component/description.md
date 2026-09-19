> **版本**：Vitest 1.x+ | **状态**：stable | **概念**：组件隔离与 mock

# Vitest 中 mock 组件 / SFC

## 这是什么

Vue 组件测试有三种"隔离粒度"：真挂载、浅挂载、**完全 mock 掉子组件**。本节聚焦第三种：用 `vi.mock` 替换某个 SFC，让上层组件的测试**只关注当前组件的逻辑**，而不被深层依赖拖慢或污染。

这种 mock 跟「mock 一个普通 ES 模块」一样——只是目标文件恰好是 `.vue`。Vitest 在 `resolve.alias` / 插件链里识别 SFC，并允许 mock 后用 stub 替代。

## 实战配置

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

测试代码：

```ts
// UserCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

// mock 掉深层依赖：Avatar.vue
vi.mock('./Avatar.vue', () => ({
  default: {
    name: 'AvatarStub',
    props: ['src', 'alt'],
    template: '<img :src="src" :alt="alt" data-test="avatar-stub" />',
  },
}))

describe('UserCard', () => {
  it('passes src to Avatar', () => {
    const wrapper = mount(UserCard, {
      props: { user: { name: 'Alice', avatar: '/a.png' } },
    })
    const avatar = wrapper.find('[data-test=avatar-stub]')
    expect(avatar.attributes('src')).toBe('/a.png')
    expect(avatar.attributes('alt')).toBe('Alice')
  })
})
```

## mock 进阶：从 props 推断

```ts
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

it('uses default avatar when missing', () => {
  const wrapper = mount(UserCard, {
    props: { user: { name: 'Bob' } },
    global: {
      stubs: { Avatar: true },   // 一行 stub，自带 attrs 透传
    },
  })
  // stub 后组件名仍可用：findComponent({ name: 'Avatar' })
})
```

`global.stubs` 比 `vi.mock` 更轻——只对当前 `mount` 生效，不改全局 module cache，适合单测试隔离。

## 源码走读

```ts
// packages/test-utils/src/mount.ts
function getStubsFromGlobalConfig(stubs: Record<string, Component>) {
  return Object.entries(stubs).map(([key, value]) => [key, value === true ? createStubFromComponent(value) : value])
}
```

`stubs: true` 时，`@vue/test-utils` 动态生成一个保留 props/slots 的占位组件；这跟 `vi.mock` 的"写死渲染函数"行为不同——stub 仍按 props 渲染，mock 可以完全换实现。

## 三种粒度对照

| 方式 | 适用 | 代价 |
|---|---|---|
| `mount(Comp)` | 集成测试 | 慢，依赖深 |
| `mount(Comp, { shallow: true })` | 单元测试，关心当前层 | 中等 |
| `global.stubs: { Foo: true }` | 单测隔离某子组件 | 快 |
| `vi.mock('./Foo.vue')` | 完全替换实现 | 最快，但要写 stub |

## 常见踩坑

- **mock 路径**：Vitest 默认解析相对路径，必须用相对 mock 目标文件一致的字符串；alias 别名不会自动展开。
- **`vi.mock` hoist**：`vi.mock` 调用会被 Vitest 提升到文件顶部，不能放在 `describe` 里（要放的话用 `vi.doMock`）。
- **SFC 插件顺序**：`@vitejs/plugin-vue` 必须在测试配置里注册，否则 `vi.mock('./X.vue')` 会失败。
- **`findComponent` 与 stub**：被 stub 的组件在 wrapper 里依然存在，`findComponent` 可查；纯 `vi.mock` 替换的组件在 wrapper 树里完全消失。

## 延伸阅读

| 资源 | 内容 |
|---|---|
| [vi.mock API](https://vitest.dev/api/vi.html#vi-mock) | hoisting 与工厂函数 |
| [@vue/test-utils stubs](https://test-utils.vuejs.org/api/#global-stubs) | global.stubs 与 shallow 的边界 |
| [相关 demo](./) | 07.vitest-component 是 mount 基础，08.vitest-reactivity 是不挂载 reactivity 测试 |
