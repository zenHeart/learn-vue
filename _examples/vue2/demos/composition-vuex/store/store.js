import { shallowReactive, toRefs, computed, readonly } from '@vue/composition-api'
export function createStore() {
  const state = shallowReactive({
    count: 0
  })

  const getters = {
    doubleCount: computed(() => {
      return state.count
    }),
    newCount: computed(() => {
      if(getters.doubleCount.value) {
        return {
          new: getters.doubleCount.value
        }
      } else {
        return { }
      }
    }),
  }
  const mutation = {
    add() {
      state.count++;
    }
  }
  return {
    state: readonly(toRefs(state)),
    getters,
    mutation,
  }
}
