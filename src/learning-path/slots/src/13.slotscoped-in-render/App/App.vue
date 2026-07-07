<template>
  <div>
    <h2>采用 $slots.default(arg,...) 传入参数</h2>
    <C1>
      <template #default="a">
        <h1>test {{a}}</h1>
      </template>
    </C1>
    <C1>
      <template #default="a">
        {{a}}
      </template>
    </C1>
  </div>
</template>

<script>
import { h } from 'vue'

export default {
  components: {
    C1: {
      data() {
        return {
          trigger: false
        }
      },
      render() {
        return h('button', {
          onClick: () => {
            this.trigger ^= 1
          }
        }, [this.$slots.default(this.trigger) || 'default'])
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