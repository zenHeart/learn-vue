# 组队列表投影：spread 响应式代理的性能陷阱

## 案例背景

Electron 客户端 **nn.exe** 在「组队列表分页下拉」时出现 3–5 秒长任务卡顿。Chrome Performance 采样（`Profile-20260707T165121.json`，27s / 216k 样本）定位到两个叠加热点：

| 热点 | 耗时 | 性质 | 本 Demo |
|------|------|------|---------|
| A：preload IM IPC 回调风暴 | 13.4s / 49.4% | 常驻，空闲也烧 CPU | 见 README 说明 |
| **B：`buildLegacyTeamListProjection`** | **5.3s / 26.5%** | 滚动期整表重建 | **本 Demo 复现** |

修复提交：`nn-client-all@166d6d2a` — `perf(channelList): 组队投影 raw 化`

## 业务 MVP 抽象

真实代码在 `app/nn-website/src/stores/channelList/`：

```
channelListFactState
├── channelMap: Map<channelId, ChannelEntity>   // reactive 事实层
└── teamChannelIds: string[]                    // 组队房 ID 有序列表

legacyTeamList = computed(() =>
  buildLegacyTeamListProjection(channelListFactState)
)
```

消费方（虚拟列表）依赖 `legacyTeamList` 渲染组队卡片。分页 `loadMore` 每次追加房间都会触发事实层变更 → 投影失效 → **整表重建**。

## 根因链（热点 B）

### 1. 坏代码：spread 响应式代理

```js
// ❌ 优化前
.map((channel) =>
  Object.freeze({
    ...channel,              // 对 reactive Proxy 逐键 spread
    ...(channel.teamInfo || {}),
    cardType: 'team',
    userList: channel.memberList,
  }),
)
```

### 2. 为什么慢？

在 `computed` 里 spread `reactive` 实体时，**每个键**都会：

1. 触发 Proxy 的 `get` / `ownKeys` trap（有 CPU 成本）
2. **向 computed 注册一个响应式依赖**（隐藏大头）

依赖规模 = **O(房间数 × 字段数)**。线上实体约 40–60 个字段，50 个房间实测 **2805 个依赖**。

### 3. 为什么滚动期爆炸？

分页下拉时，每秒多次 `mergeTeamList` / `applyChannelUpdate` → `legacyTeamList` 反复失效重建。每次重建要：

- 清理数千旧依赖
- 重新 spread 数百个实体、逐键收集依赖
- 触发虚拟列表 diff

Trace 中两段滚动窗口（4–9s、16–22s）内投影每秒烧 ~450ms。

## 修复：raw 快照派生

```js
// ✅ 优化后
.map((channel) => {
  const raw = toRaw(channel)           // 脱离 Proxy，零 trap
  return Object.freeze({
    ...raw,
    ...(raw.teamInfo || {}),
    cardType: 'team',
    memberList: channel.memberList,    // 保留响应式引用！
    userList: channel.memberList,
  })
})
```

### 能否直接返回原始对象？

**不能裸返**。出口需要：

- 平铺 `teamInfo` 字段
- 注入 `cardType: 'team'`
- `userList` 别名
- `Object.freeze` 只读契约

正确做法是 **toRaw 后浅拷贝**，仅保留刻意的响应式引用。

### 失效时机契约

| 变更类型 | 写入方式 | 投影是否重算 |
|----------|----------|--------------|
| 字段内容变更 | `channelMap.set` 新对象 | ✅ 重算 |
| 结构变更（增删房） | `teamChannelIds` 变更 | ✅ 重算 |
| 成员进出房 | `memberList.splice` 原地 | ❌ 不重算，靠行内引用 |

因此 `removeTeamInfo` 也必须从原地 `delete` 改为 **换对象写入**，否则 raw 派生感知不到。

## 收益

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 依赖规模（50 房） | ~2805 | < 400 |
| 微基准（300 房×53 字段） | 11.32 ms | 2.14 ms |
| 加速比 | — | **5.3×** |
| Trace 投影耗时 | ~5.3s | 预计 < 1s |

## 交互 Demo 操作指南

1. **关闭优化开关**，将房间数拉到 80+，点击「运行基准测试」记录 `avgMs` 和依赖数
2. **开启优化开关**，同样参数再跑基准，对比倍数
3. **模拟分页 +20 房**：观察 `computed 依赖数` 和 `重建次数`
4. **模拟字段更新**：换对象写入 → 投影重算
5. **模拟成员更新**：原地 splice → 投影**不**重算，但列表人数会变

## 经验沉淀（避免再犯）

1. **不要在高频 computed 里 spread reactive 代理** — 依赖收集比 trap 更贵
2. **只读投影用 toRaw 快照** — 配合「换对象写入」失效契约
3. **原地 mutation 字段保留响应式引用** — 如 `memberList`
4. **先写失败单测** — `computed(fn, { onTrack })` 断言依赖规模 O(n)
5. **火焰图里 JSON.parse 烧在 JS 帧上** — 先查 IPC 消息量，别只盯 computed

## 相关链接

- [Vue 性能章节 README](/learning-path/performance/)
- [响应式 API](/learning-path/reactivity/)
- [nn-client-all 修复提交](https://github.com/zenHeart/learn-vue)（私有仓库）
