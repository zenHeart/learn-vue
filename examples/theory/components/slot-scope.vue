<template>
    <div>
        <h1>作用域插槽组件</h1>
        <ul>
            <li v-for="todo in todos" :key="todo.key">
               <slot v-bind:ha="todo" :demo="b">
                   {{todo.text}}
                   <strong>{{b}}</strong>
               </slot>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  props: {
    todos: {
      type: Array
    }
  },
  data() {
    return {
      b: 'demo'
    };
  }
};
</script>

<style scoped>
</style>