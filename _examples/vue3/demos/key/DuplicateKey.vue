<template>
  <div>
    <h1>如果出现重复的 key 会导致渲染错乱，在添加场景下会有问题</h1>
    <p><button @click="shuffle">shuflle</button></p>
    <ul>
      <li v-for="todo in todoList" :key="todo.id">
        {{ todo.name }} - {{ todo.status }}
      </li>
    </ul>
  </div>
</template>
<script setup>
  import { reactive } from "vue";

  const todoList = reactive([
    { id: 3, name: "todo1", status: 0 },
    { id: 1, name: "todo2", status: 0 },
    { id: 1, name: "todo3", status: 1 },
  ]);

  function shuffle() {
    todoList[0].name = "shuffl e1";
    todoList[1].name = "shuffl e2";
    todoList[2].name = "shuffl e3";
    todoList[0].id = 2;
    todoList[1].id = 1;
    todoList[2].id = 1;
    todoList[3] = { Id: 1 };
  }
</script>
