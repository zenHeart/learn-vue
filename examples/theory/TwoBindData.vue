<template>
  <div>时间是: {{time}}</div>
</template>

<script>
export default {
  data () {
    return { time: new Date() }
  },
    created(){
      var self = this;
      setInterval(function () {
          self.time = new Date();
      },1000);
    }
}
</script>
