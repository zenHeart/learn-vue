import { defineCustomElement } from 'vue'
import MyGreeting from './MyGreeting.vue'

export default defineCustomElement(MyGreeting, {
  shadowRoot: true,
})