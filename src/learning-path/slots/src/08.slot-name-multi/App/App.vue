<template>
  <div>
    <h2>可以包含默认插槽和多个具名插槽</h2>
    <C1>
      <template v-slot:header>
        <h1>header</h1>
      </template>
      <div>content</div>
      <div>content1</div>
      <template v-slot:footer>
        <h1>footer</h1>
      </template>
    </C1>
  </div>
</template>

<script>
export default {
  components: {
    C1: {
      template: `
        <div>
          <header>
            <slot name="header"></slot>
          </header>
          <main>
            <slot></slot>
          </main>
          <footer>
            <slot name="footer"></slot>
          </footer>
        </div>
      `
    }
  }
}
</script>

<style>
div {
  margin: 10px;
  padding: 5px;
}
</style> 