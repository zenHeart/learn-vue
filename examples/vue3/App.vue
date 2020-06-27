<template>
  <div class="app">
    <nav>
      <div class="nav-item"  @click="id=index" v-for = "(item,index) in COMPONENTS" :key="item.name">{{item.name}}</div>
    </nav>
    <div  class="content" >
      <component :is="COMPONENTS[id].component"></component>
    </div>
  </div>
</template>

<script>
import { COMPONENTS } from "./utils";

export default {
  data() {
    return {
      COMPONENTS,
      id:0
    };
  }
};
</script>

<style lang="stylus">
@import '../common/index.styl';

  
</style>
