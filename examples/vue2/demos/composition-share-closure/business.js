import { reactive } from '@vue/composition-api';
let share;

const useShareState = (opts) => {
  if (!share) {
    share = reactive(opts);
  }
  return share;
};
export const useCount = () => {
  let state = useShareState({ count: 0 });
  const add = () => state.count++;
  const reset = () => (state.count = 0);
  return {
    state,
    add,
    reset
  };
};
