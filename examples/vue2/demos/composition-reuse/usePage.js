import { reactive, computed } from '@vue/composition-api'

const INTI = {
  SIZE: 10,
  NUM: 1,

}
export function usePage() {
  let pageInfo = reactive({
    size: INTI.SIZE,
    num: INTI.NUM
  })

  let isOver = computed(() => pageInfo.num > 5 ? true : false)

  function increment() {
    pageInfo.size;
    pageInfo.num++;
  }

  return {
    pageInfo,
    isOver,
    increment
  }
}