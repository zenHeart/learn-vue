
<template>
    <div>
        <h1>组件属性为函数</h1>
        <h2>基本使用,动态设定父组件 data</h2>
        <p>
            默认值:{{name}}<br/>
            传递函数作为属性产生的结果:{{hiName}}<br/>
        </p>
        <h2>将子组件 this 传递给父组件</h2>
        <p><strong @click="show(showThis)">点击控制台查看 showThis</strong></p>
        <p><strong @click="show(showThisInfo)">点击控制台查看 showThis 函数的 this 值,该值为父级作用域</strong></p>
        <h2>通过传入函数,实现组件双向数据绑定</h2>
        <p>这种绑定,取决于父组件传入的函数来动态修改,注意传入函数必须为箭头函数,
            原因是箭头函数的 this 继承上级父元素,若无 function 会导致 this 指向当前执行环境,而丢失模块 this
        </p>
        <p @click="changeParent">点击修改父组件值:<strong>{{parentData}}</strong> 
        </p>
    </div>
</template>

<script>
export default {
  data() {
      return {
          name:'tom',
          showThisInfo:this.showThis()
      }
  },  
  props: {
    hi:{
        default:null,
    },
    showThis:{
        default:null
    },
    changeParent:{
        default:null
    },
    parentData:{
        default:0
    }
  },
  methods:{
      show() {
          console.log(arguments);
      }
  },
  computed:{
      hiName() {
          return this.hi(this.name);
      }
  }
};
</script>

<style scoped>
</style>