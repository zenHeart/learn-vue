import { reactive, provide, inject } from '@vue/composition-api';
const sym = Symbol('state');

const createStore = () => reactive({ count: 1 });
export const provideState = () => {
  let state = createStore();
  provide(sym, state);
  return state;
};

export const useState = () => inject(sym);
