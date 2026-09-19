import type { InjectionKey, Ref } from 'vue'

export const CountKey: InjectionKey<Ref<number>> = Symbol('Count')
export const AppCountKey: InjectionKey<Ref<number>> = Symbol('AppCount')

export interface CounterActions {
  inc(): void
  dec(): void
  reset(v?: number): void
}

export const ActionsKey: InjectionKey<CounterActions> = Symbol('Actions')
