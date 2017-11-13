<template>
    <div>
        count : {{count}}
        <button v-on:click="mutation">突变 count 为 10</button>
    </div>
</template>
<script>
export default {
    computed:{
        count(){
            return this.$store.state.count;
        }
    },
    methods:{
        mutation() {
            this.$store.commit({
                type:'mutation',
                count:10
            })
        }
    }
}
</script>
