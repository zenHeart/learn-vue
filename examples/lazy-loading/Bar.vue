<template>
  <div>
    <h2>{{ errMsg }}</h2>
    <p>I am lazy-loaded. (check out the Networks tab in Chrome devtools)</p>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  data () {
    return { errMsg: 'This is Bar!' }
  }
}
</script>
