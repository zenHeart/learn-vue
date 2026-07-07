<template>
  <div>
    <h2>利用 slot-scope 实现父容器访问子元素变量</h2>
    <C1>
      <template v-slot="a">
        {{a}}
      </template>
    </C1>
    <!-- 使用 v-slot:default 效果相同  -->
    <C1>
      <template v-slot:default="a">
        {{a}}
      </template>
    </C1>
  </div>
</template>

<script>
export default {
  components: {
    C1: {
      template: `
        <button @click="show^=1">
          trigger
          <slot :show="show"></slot>
        </button>
      `,
      data() {
        return {
          show: false
        }
      }
    }
  }
}
</script>

<style>
button {
  margin: 10px;
  padding: 5px;
}
</style> 