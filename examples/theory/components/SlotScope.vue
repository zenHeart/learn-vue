<template>
    <div>
        <h1>作用域插槽组件,实现子组件引用父组件作用域</h1>
        <ul>
            <li  v-for="todo in todos" :key="todo.key">
               <slot name="list" v-bind:todo="todo">
                   {{todo.text}}
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
  }
};
</script>

<style scoped>
</style>