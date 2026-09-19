import { defineCustomElement } from 'vue'
import MyLightCard from './MyLightCard.vue'

// shadowRoot: false → light DOM；样式会泄漏到外部
export default defineCustomElement(MyLightCard, {
  shadowRoot: false,
})