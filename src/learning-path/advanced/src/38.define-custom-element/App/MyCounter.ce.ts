import { defineCustomElement } from 'vue'
import MyCounter from './MyCounter.vue'

export default defineCustomElement(MyCounter, {
  shadowRoot: true,
})