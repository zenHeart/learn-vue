<template>
  <div>
    <h1>测试 compositon 状态复用</h1>
    <p>
      <button @click="increment">增加页面1</button
      ><span> {{ pageInfo }} {{ isOver }}</span>
    </p>
    <p>
      <button @click="increment1">增加页面2</button
      ><span> {{ pageInfo1 }} {{ isOver1 }}</span>
    </p>
  </div>
</template>

<script >
  import {usePage}  from './usePage.js'
  export default {
    name: 'App',
    setup() {
      const {  pageInfo,isOver,increment  } = usePage();
  const {  pageInfo:pageInfo1,isOver:isOver1,increment :increment1  } = usePage();

  return {
    pageInfo,
    isOver,
    increment,
    pageInfo1,
    isOver1,
    increment1
  }
    },
  }


</script>