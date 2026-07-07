import { createStore } from './store'

export let store = {};

export function setupStore() {
  store.a = createStore()
}
