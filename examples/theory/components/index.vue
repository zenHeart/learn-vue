<template>
    <div>
        <comma-value></comma-value>
        <slot-scope-todo :todos="todos" >
            <template slot = "list" slot-scope="test">
                <li v-if="test.todo.done">X {{test.todo.text}}</li>
            </template>
        </slot-scope-todo>
        <props-pass-func :hi="(name) => `evening ${name}`" :showThis="() => this" :parent-data="parentData" :change-parent="() => { this.parentData += 1;this.ha=Date()}"></props-pass-func>
        {{ha}}
    </div>
</template>

<script>
import CommaValue from "./CommaValue.vue";
import SlotScopeTodo from "./SlotScope.vue";
import PropsPassFunc from "./PropsPassFunc.vue";

export default {
  components: {
    CommaValue,
    SlotScopeTodo,
    PropsPassFunc
  },
  data() {
    return {
      parentData:1,
      todos: [
        {
          text: 1,
          key: 1,
          done:true
        },
        {
          text: 1,
          key: 2,
          done:false 
        }
      ]
    };
  },
  computed: {
    
  }
};
</script>

<style scoped>
</style>