import { App } from 'vue'

// 全局属性类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $env: string
    $apiVersion: string
    $formatDate: (date: Date) => string
    $formatCurrency: (amount: number) => string
  }
}

// 全局属性配置
export function setupGlobalProperties(app: App) {
  // 环境变量
  app.config.globalProperties.$env = process.env.NODE_ENV

  // API 版本
  app.config.globalProperties.$apiVersion = 'v1'

  // 日期格式化
  app.config.globalProperties.$formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 金额格式化
  app.config.globalProperties.$formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  // 全局通知方法
  window.$notify = (options: any) => {
    console.log('通知:', options)
    // 这里可以实现实际的通知逻辑
  }

  // 全局确认框方法
  window.$confirm = (options: any) => {
    console.log('确认框:', options)
    // 这里可以实现实际的确认框逻辑
    return new Promise((resolve, reject) => {
      if (window.confirm(options.message)) {
        resolve(true)
      } else {
        reject(false)
      }
    })
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    $notify: (options: any) => void
    $confirm: (options: any) => Promise<boolean>
  }
} 