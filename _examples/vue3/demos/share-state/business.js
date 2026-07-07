import { reactive } from "vue";

const shareState = reactive({
  count: 0
});
export function useBusiness() {
  return {
    state: shareState,
    reset() {
      shareState.count = 0;
    },
    add() {
      shareState.count++;
    }
  }
}