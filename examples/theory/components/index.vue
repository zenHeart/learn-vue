<template>
    <div>
        <comma-value></comma-value>
        <slot-scope-todo :todos="todos" :name="[{a:1},{b:2}]">
            <template slot = "list" slot-scope="test">
                <li v-if="test.todo.done">X {{test.todo.text}}</li>
                <strong>{{name}}</strong>
            </template>
            <template slot-scope="a,b">
                {{b}}
            </template>
            
        </slot-scope-todo>
        <props-pass-func :hi="(name) => `evening ${name}`"></props-pass-func>
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
      todos: [
        {
          text: 1,
          key: 1,
          done:true
        },
        {
          text: 1,
          key: 1,
          done:false 
        }
      ]
    };
  }
};
</script>

<style scoped>
</style>