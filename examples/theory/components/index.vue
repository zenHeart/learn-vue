<template>
    <div>
        <comma-value></comma-value>
        <slot-scope-todo :todos="todos">
            <template slot-scope="test">
                <li v-if="test.ha.done">X {{test.ha.text}}</li>
                <strong>{{test.demo}}</strong>
            </template>
        </slot-scope-todo>
    </div>
</template>

<script>
import CommaValue from "./CommaValue.vue";
import SlotScopeTodo from "./slot-scope.vue";

export default {
  components: {
    CommaValue,
    SlotScopeTodo
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