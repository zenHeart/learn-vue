// 类型声明文件：增强 Vue 全局类型
// 这里演示三个增强接口的用法
import type { ComponentCustomProperties, ComponentCustomOptions, ComponentCustomProps } from 'vue'

declare module 'vue' {
  // 1. ComponentCustomProperties：增强 this / 模板里的 $xxx
  interface ComponentCustomProperties {
    $api: {
      getUser: (id: number) => Promise<{ id: number; name: string }>
      listPosts: () => { id: number; title: string }[]
    }
    $filters: {
      formatDate: (d: Date) => string
      formatCurrency: (amount: number) => string
    }
    $track: (event: string, payload?: Record<string, unknown>) => void
  }

  // 2. ComponentCustomOptions：增强组件选项
  // 比如路由库的 beforeRouteEnter、beforeRouteUpdate
  interface ComponentCustomOptions {
    beforeRouteEnter?(to: { path: string }, from: { path: string }, next: () => void): void
  }

  // 3. ComponentCustomProps：增强所有组件的 props
  // 比如 vue-i18n 的 t 函数、vue-router 的 router-link 自定义 prop
  interface ComponentCustomProps {
    /** 用于 i18n 的简化 prop：t 函数 */
    t?: (key: string) => string
  }
}

export {}