// 简易事件总线，供守卫与组件共享日志
import { reactive } from 'vue'

export const log = reactive<string[]>([])

export function record(message: string) {
  log.push(`[${new Date().toLocaleTimeString()}] ${message}`)
}