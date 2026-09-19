// 一个把指定 store 持久化到 localStorage 的 Pinia 插件
import type { PiniaPluginContext } from 'pinia'

export interface PersistOptions {
  /** store id；可选，默认取 store.$id */
  key?: string
  /** 选择要持久化的字段；缺省则整树 */
  paths?: string[]
}

declare module 'pinia' {
  // 给 store 注入 $persist 字段
  export interface PiniaCustomProperties {
    $persist?: {
      clear: () => void
    }
  }
}

function pick(obj: any, paths?: string[]): any {
  if (!paths) return JSON.parse(JSON.stringify(obj))
  const out: any = {}
  paths.forEach((p) => { out[p] = obj[p] })
  return out
}

export function persistencePlugin({ store, options }: PiniaPluginContext) {
  // 从 defineStore 第四个参数读 custom options
  const opts = (options as any).persist as PersistOptions | undefined
  if (!opts) return
  const key = `pinia-persist:${opts.key ?? store.$id}`

  // 1. 启动时尝试恢复
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const data = JSON.parse(raw)
      store.$patch(data)
    }
  } catch (e) {
    console.warn('[persist] restore failed', e)
  }

  // 2. 订阅变化
  const unsub = store.$subscribe((_mutation, state) => {
    try {
      const data = pick(state, opts.paths)
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.warn('[persist] save failed', e)
    }
  })

  // 3. 暴露清理方法
  store.$persist = {
    clear: () => localStorage.removeItem(key),
  }

  // 4. dispose 时取消订阅
  store.$onAction(({ after, onError }) => {
    after(() => unsub())
    onError(() => unsub())
  })
}