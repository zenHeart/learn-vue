<template>
  <div>
    <h2>验证 transition</h2>
    <p>
      <button @click="addMsg">add</button>
      <button @click="clear">clear</button>
    </p>
    <transition-group class="card-wrap" name="l" tag="div">
      <div :key="item.id" v-for="(item) in msgs" class="card">
        <h3>{{ item.title }} <strong class="close" @click="close(item)">X</strong></h3>
        <p>{{ item }}</p>
      </div>
    </transition-group>
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
      delMsg(msg) {
        let index =this.msgs.findIndex(el => el.id === msg.id);
        if(index !== -1) {
          this.msgs.splice(index, 1);
        }
      },
      addMsg() {
        let msg = {
          title: new Date().toISOString(),
          id: new Date().getTime()
        };
        if(this.msgs.length >= 3) {
          this.msgs.shift()
        } 
        this.msgs.push(msg);
        console.log(this.msgs.length);
        setTimeout(() => {
          this.delMsg(msg)
        }, 30000)
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
    width 300px
    padding 10px
    .close
      position absolute
      cursor pointer
      top 4px
      right 4px

.l-enter-active, .l-leave-active 
  transition: all 1s;
.l-enter
  opacity: 0;
  transform: translateY(60px);
.l-leave-to 
  opacity: 0;
  transform: translateY(-60px);
</style>