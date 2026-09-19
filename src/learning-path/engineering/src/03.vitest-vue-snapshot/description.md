> 版本: Vitest 1.x | RFC: — | 状态: stable | 概念: 组件快照测试

# Vitest 组件快照测试

## 你会学到什么

- `expect(component.html()).toMatchSnapshot()` 序列化组件输出
- 快照更新：`vitest --update`
- 与覆盖率（`--coverage`）配合验证关键路径

## 关键代码

```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from './Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter, { props: { initial: 5 } })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('increments on click', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Count: 1')
  })
})
```

## 跑测试

```bash
pnpm vitest run                # 一次性
pnpm vitest --coverage         # 覆盖率
pnpm vitest --update           # 更新快照
```

## 快照策略

| 场景 | 建议 |
|------|------|
| 纯展示组件 | 全量 HTML 快照 |
| 含动态 id / 时间戳 | 用 `serializer` 过滤 |
| 复杂状态机 | 行为测试 + 关键属性快照 |
| 不稳定元素（动画） | 用 `toMatchInlineSnapshot` 减少 fixture |

## 动手试

1. 看下方「快照输出」预览
2. 切换「过滤动态属性」观察差异
3. 切换覆盖率门禁看通过/失败标记

## 修复 / 选型

- 覆盖率达 80% 作为合并门禁
- 关键组件 100%，其余按风险评估
- 业务组件优先行为测试，纯 UI 优先快照

## 延伸阅读

- [Vitest Snapshot](https://vitest.dev/guide/snapshot.html)
- [@vue/test-utils](https://test-utils.vuejs.org/)

## 小结

1. **场景**：组件回归保护。
2. **配置**：`@vue/test-utils` + Vitest。
3. **维护**：快照变更必须人工 review。
