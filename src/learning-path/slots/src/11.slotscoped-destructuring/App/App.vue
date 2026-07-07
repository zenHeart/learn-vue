<template>
  <div>
    <h2>作用域插槽支持解构语法替换变量名</h2>
    <C1>
      <template v-slot="{show}">
        show: {{show}}
      </template>
    </C1>
    <!-- 使用 v-slot:default 效果相同  -->
    <C1>
      <template v-slot:default="{show}">
        show:{{show}}
      </template>
    </C1>
    <!-- 解构支持替换变量名  -->
    <C1>
      <template v-slot:default="{ show:a }">
        show a:{{a}}
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