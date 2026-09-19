import type { InjectionKey, Ref } from 'vue'

export interface Theme {
  primary: string
  mode: 'light' | 'dark'
}

export interface UserInfo {
  name: string
  level: number
}

export const ThemeKey: InjectionKey<Theme> = Symbol('Theme')
export const UserKey: InjectionKey<UserInfo> = Symbol('User')
export const StringThemeKey = 'theme-string' // 字符串 key 不会推断类型

// 响应式 provide 也可以包成 InjectionKey
export const CountKey: InjectionKey<Ref<number>> = Symbol('Count')
