// 一个使用 hasInjectionContext + runWithContext 的 composable
import { hasInjectionContext, inject, getCurrentInstance, type InjectionKey } from 'vue'

export const ThemeKey: InjectionKey<{ primary: string }> = Symbol('theme')

/**
 * 安全访问 inject 上下文；不存在时返回 fallback。
 */
export function useSafeInject<T>(key: InjectionKey<T>, fallback?: T): T | undefined {
  if (hasInjectionContext()) {
    return inject(key, fallback as T)
  }
  return fallback
}

/**
 * 在 setup 之外也能解析 inject：包一层 runWithContext。
 */
export async function withInjectedTheme<T>(
  app: any,
  fn: (theme: { primary: string }) => T | Promise<T>
): Promise<T | undefined> {
  if (!app) return undefined
  // app.runWithContext 把 currentApp 切换到该 app，再调用 fn
  return app.runWithContext(async () => {
    const theme = inject(ThemeKey, { primary: '#000' })
    return fn(theme)
  })
}