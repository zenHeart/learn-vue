// 组合式封装：把 route.query[name] 暴露成可读写的 ComputedRef
import { computed, ComputedRef } from 'vue'
import { LocationQuery, useRoute, useRouter } from 'vue-router'

export interface UseRouteQueryOptions<T> {
  defaultValue?: T
  parse?: (raw: string | null) => T
  serialize?: (value: T) => string | null
}

const identity = <T,>(v: T) => v

export function useRouteQuery<T>(
  name: string,
  options: UseRouteQueryOptions<T> = {},
): ComputedRef<T | undefined> {
  const route = useRoute()
  const router = useRouter()
  const parse = options.parse ?? (identity as (raw: string | null) => T)
  const serialize = options.serialize ?? ((v: T) => String(v))

  return computed<T | undefined>({
    get() {
      const raw = (route.query[name] as string | undefined) ?? null
      const v = parse(raw)
      return (v ?? options.defaultValue) as T | undefined
    },
    set(value) {
      const next: LocationQuery = { ...route.query }
      if (value === undefined || value === null || value === '') {
        delete next[name]
      } else {
        next[name] = serialize(value as T)
      }
      router.replace({ query: next })
    },
  })
}

// 工厂：把数字、布尔、字符串常用解析预置好
export const useRouteQueryNumber = (name: string, fallback = 1) =>
  useRouteQuery<number>(name, {
    defaultValue: fallback,
    parse: (raw) => (raw === null ? fallback : Number(raw) || fallback),
    serialize: (v) => String(v),
  })

export const useRouteQueryString = (name: string, fallback = '') =>
  useRouteQuery<string>(name, {
    defaultValue: fallback,
    parse: (raw) => raw ?? fallback,
    serialize: (v) => v,
  })

export const useRouteQueryBoolean = (name: string, fallback = false) =>
  useRouteQuery<boolean>(name, {
    defaultValue: fallback,
    parse: (raw) => raw === '1' || raw === 'true',
    serialize: (v) => (v ? '1' : '0'),
  })