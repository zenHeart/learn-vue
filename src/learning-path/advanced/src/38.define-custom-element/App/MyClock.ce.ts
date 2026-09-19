// 把 Vue 组件包成 Custom Element 构造函数
import { defineCustomElement } from 'vue'
import MyClock from './MyClock.vue'

export default defineCustomElement(MyClock, {
  shadowRoot: true, // 显式开启，演示 useShadowRoot
})