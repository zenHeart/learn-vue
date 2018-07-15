export default {
    created:function() {
        this.hello();
    },
    data() {
        return {
            a:1,
            b:2,
            c:3
        }
    },
    methods:{
      hello:() => {
          console.log('hello form mixin!')
      },
      show() {
        console.log('混入对象',this.$data)
      }}
}