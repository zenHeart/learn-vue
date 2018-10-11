<script>
    export default {
        name:'RenderH',
        render:function(createElement) {
            return createElement('h'+this.level,this.$slots.default)
        },
        props:{
            level:{
                type:Number,
                required:true
            }
        }
    }
</script>