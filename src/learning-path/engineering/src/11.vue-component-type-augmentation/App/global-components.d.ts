// 全局组件类型增强
// 在 tsconfig include 范围内的 .d.ts 文件会被自动加载
import type { GlobalComponents } from 'vue'

// 内部组件库的类型增强
import AppButton from './AppButton.vue'
import AppCard from './AppCard.vue'
import AppBadge from './AppBadge.vue'

declare module 'vue' {
  interface GlobalComponents {
    /** 通用按钮 */
    AppButton: typeof AppButton
    /** 卡片容器 */
    AppCard: typeof AppCard
    /** 徽标 */
    AppBadge: typeof AppBadge
  }
}

// 全局导出，避免「文件无导出」的 TS 警告
export {}