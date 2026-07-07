<template>
  <div>
    <h2>利用 v-slot:name="valName" 访问绑定值</h2>
    <C1>
      <template v-slot:header="h">
        header: {{h}}
      </template>
      <template v-slot="d">
        main: {{d}}
      </template>
      <template v-slot:footer="f">
        footer:{{f}}
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
          <header @click="show.header^=1">
            <slot name="header" :show="show.header"></slot>
          </header>
          <main @click="show.default^=1">
            <slot :show="show.default"></slot>
          </main>
          <footer @click="show.footer^=1">
            <slot name="footer" :show="show.footer"></slot>
          </footer>
        </div>
      `,
      data() {
        return {
          show: {
            header: false,
            default: false,
            footer: false
          }
        }
      }
    }
  }
}
</script>

<style>
div {
  margin: 10px;
  padding: 5px;
}
header, main, footer {
  cursor: pointer;
  padding: 10px;
  margin: 5px;
  border: 1px solid #ccc;
}
</style> 