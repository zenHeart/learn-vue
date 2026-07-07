import { watch } from '@vue/composition-api';
import { store } from './store'
export function useSotre() {
  const { getters,  } = store.a;
  watch(() => getters.newCount.value, (...args)=> {
    console.log('watch change:', args)
  }, { immediate: true  })

  return {
    store: store.a
  }
}
