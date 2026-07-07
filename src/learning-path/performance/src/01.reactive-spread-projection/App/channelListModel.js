/**
 * MVP：从 nn-client-all channelList/model.ts 抽象
 * 保留 buildLegacyTeamListProjection 坏/好两种实现
 */
import { reactive, toRaw } from 'vue'

export function createChannelListFactState() {
  return reactive({
    channelMap: new Map(),
    teamChannelIds: [],
  })
}

export function buildManyTeamChannels(count, fieldCount = 40) {
  return Array.from({ length: count }, (_, i) => {
    const base = {
      channelId: 1000 + i,
      channelType: -98,
      serverId: 1,
      cardType: 'team',
      teamType: 1,
      teamMaxMembersNum: 4,
      contentText: `招募 #${i}`,
      memberList: [{ userId: i + 1, name: `玩家${i}` }],
      upTime: 100 + i,
      teamInfo: {
        teamLabel: `队${i}`,
        recruitText: `来人打本 ${i}`,
      },
    }
    for (let f = 0; f < fieldCount; f++) {
      base[`extraField${f}`] = f
    }
    return base
  })
}

export function mergeTeamList(state, channels) {
  for (const ch of channels) {
    const key = String(ch.channelId)
    state.channelMap.set(key, {
      ...ch,
      memberList: ch.memberList ? [...ch.memberList] : [],
    })
    if (!state.teamChannelIds.includes(key)) {
      state.teamChannelIds.push(key)
    }
  }
}

/** 换对象写入 — 与 applyChannelUpdate 一致 */
export function applyChannelUpdate(state, patch) {
  const key = String(patch.channelId)
  const existing = state.channelMap.get(key)
  if (!existing) return
  const raw = toRaw(existing)
  state.channelMap.set(key, {
    ...raw,
    ...patch,
    memberList: existing.memberList,
  })
}

/** 成员原地 splice — 605 高频路径 */
export function updateMembers(state, { channelId, memberList }) {
  const channel = state.channelMap.get(String(channelId))
  if (!channel) return
  channel.memberList.splice(0, channel.memberList.length, ...memberList)
}

/**
 * ❌ 坏实现：spread 响应式代理
 * 每个键触发 get/ownKeys trap 并逐键注册 computed 依赖
 */
export function buildProjectionBad(state) {
  return Object.freeze(
    state.teamChannelIds
      .map((id) => state.channelMap.get(id))
      .filter(Boolean)
      .map((channel) =>
        Object.freeze({
          ...channel,
          ...(channel.teamInfo || {}),
          cardType: 'team',
          userList: channel.memberList,
        }),
      ),
  )
}

/**
 * ✅ 好实现：toRaw 快照 + 保留响应式 memberList 引用
 * 依赖规模降为 O(房间数)，成员级更新仍由消费组件追踪
 */
export function buildProjectionOptimized(state) {
  return Object.freeze(
    state.teamChannelIds
      .map((id) => state.channelMap.get(id))
      .filter(Boolean)
      .map((channel) => {
        const raw = toRaw(channel)
        return Object.freeze({
          ...raw,
          ...(raw.teamInfo || {}),
          cardType: 'team',
          memberList: channel.memberList,
          userList: channel.memberList,
        })
      }),
  )
}

export function benchmarkProjection(buildFn, state, rounds = 30) {
  const start = performance.now()
  let last
  for (let i = 0; i < rounds; i++) {
    last = buildFn(state)
  }
  const elapsed = performance.now() - start
  return {
    rows: last?.length ?? 0,
    rounds,
    totalMs: elapsed,
    avgMs: elapsed / rounds,
  }
}
