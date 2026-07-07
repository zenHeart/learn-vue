<template>
  <div>
    <SlotA>
      <template #default="count">
        <h3>{{ count }}</h3>
      </template> 
    </SlotA> 
    <SlotA>
      <template #default="{ obj,count }">
        <h3>{{ obj }}</h3>
        <h3> count {{ count }}</h3>
      </template> 
    </SlotA> 
  </div>
</template>

<script>
  import SlotA from './SlotA.vue'
  export default {
    components: {
      SlotA
    },
    meta: {
      tags: [ 'slot', 'reactive' ]
    }
  }
</script>
