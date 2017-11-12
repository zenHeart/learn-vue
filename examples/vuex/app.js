import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

Vue.use(VueRouter)
Vue.use(Vuex)

//定义一个存储组件
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment(state) {
            state.count++
        }
    }
});

const Home = {
    template: '<div>' +
    '<p>>计数值: {{count}}</p>' +
    '<button v-on:click="add">点击加 1</button></div>',
    computed: {
        count() {
            return this.$store.state.count;
        }
    },
    methods:{
        add(){
            this.$store.commit('increment');
        }
    }
}

const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: [
        {path: '/', component: Home}
    ]
})

new Vue({
    router,
    store,
    template: `
    <div id="app">
      <h1>Basic</h1>
      <p>count: {{count}}</p>
      <ul>
        <li><router-link to="/">/</router-link></li>
      </ul>
      <router-view class="view"></router-view>
    </div>
  `, computed: {
            count() {
                return this.$store.state.count;
            }
    }
}).$mount('#app')
