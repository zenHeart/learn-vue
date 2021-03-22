import { reactive } from '@vue/composition-api';
let share;

const useShareState = (opts) => {
  if (!share) {
    share = reactive(opts);
  }
  return share;
};
export const useCount = () => {
  let shareState = useShareState({ count: 0 });
  let selfState = ref(0);

  const add = () => shareState.count++, selfState.value++ ;
  const reset = () => (shareState.count = 0);
  return {
    shareState,
    selfState,
    add,
    reset
  };
};
