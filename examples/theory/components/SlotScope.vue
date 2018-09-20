<template>
    <div>
        <h1>作用域插槽组件</h1>
        <ul>
            <slot v-bind="name"></slot>
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
    },
    name:{
        type:String
    }
  }
};
</script>

<style scoped>
</style>