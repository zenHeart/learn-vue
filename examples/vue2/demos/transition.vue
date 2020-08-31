<template>
  <div>
    <h2>验证 transition</h2>
    <p>
      <button @click="addMsg">add</button>
      <button @click="clear">clear</button>
    </p>
    <div class="card-wrap">
      <div :key="item.id" v-for="(item) in msgs" class="card">
        <h3>{{ item.title }} <strong class="close" @click="close(item)">X</strong></h3>
        <p>{{ item }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    meta: {
      tags: ['transition']
    },
    data() {
      return {
        msgs: []
      }
    },
    methods: {
      addMsg() {
        let msg = {
          title: new Date().toISOString(),
          id: new Date().getTime()
        };
        if(this.msgs.length >= 3) {
          this.msgs.shift()
        } 
        this.msgs.push(msg);
      },
      clear() {
        this.msgs = []
      },
      close(msg) {
        let index = this.msgs.findIndex(el => el.id === msg.id);
        if(index !== -1) {
          this.msgs.splice(index,1);
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
.card-wrap 
  position: absolute;
  right: 10px;
  bottom: 10px;
  .card 
    position relative
    border 1px solid #000
    margin-bottom 10px
    width 200px
    padding 10px
    .close
      position absolute
      cursor pointer
      top 4px
      right 4px
</style>