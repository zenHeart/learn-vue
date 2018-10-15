import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import {myPlugin} from './plugin'
import user from './modules/user'

Vue.use(VueRouter)
Vue.use(Vuex)

//定义一个存储组件
const store = new Vuex.Store({
    //测试组件
    plugins: [myPlugin],
    modules:{
        user
    },
    state: {
        count: 0,
        todos:[
            {id:1,text:'代办项 1',done:true},
            {id:2,text:'代办项 2',done:true},
            {id:3,text:'代办项 3',done:true}
        ]
    },
    getters:{
        //类似组件的计算属性
        doneTodos: state => {
            return state.todos.filter(todo => todo.done);
        },
        //利用 getters 引用别的计算属性
        doneTodosCount:(state,getters) => {
            return getters.doneTodos.length;
        },
        //给 getters 传递函数,进行调用
        getTodoById:(state,getters) => (id) => {
            return state.todos.find(todo => todo.id === id)
        }

    },
    mutations: {
        increment(state) {
            state.count++
        },
        mutation(state,payload) {
            state.count = payload.count;
        },cancelTodesDone(state) {
            state.todos.forEach((ele,index,arr) => arr[index].done = false);
        },cancelTodesDoneAsync(state) {
            setTimeout(function () {
                state.todos.forEach((ele,index,arr) => arr[index].done = false);
            },1000);
        }
    },actions:{
        asyncIncrement({state,dispatch}) {
            return new Promise(function (resolve,reject) {
                setTimeout( () => {
                    if(state.count > 3) {
                        reject(new Error('无法继续增加,查过限定值 4'))
                    } else {
                        state.count += 1;
                        resolve()
                    }
                },100);
            });
        },//多个异步时间的触发调用
        actionA({commit,dispatch},payload) {
            setTimeout(function () {
                commit({
                    type:'mutation',
                    count:payload.count
                });
            },100);
            return dispatch({
                type:'actionB',
                count:2
            });
        },
        actionB({commit},payload) {
            return new Promise(function (resolve,reject) {
                setTimeout(function () {
                    commit({
                        type:'mutation',
                        count:payload.count});
                     resolve();
                        },1000) //1 秒后增加
                })
        }
    }
});

const Home = {
    template: '<div>' +
    '<p>count: {{count}}</p>' +
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

const Mutations = () => import(/* webpackChunkName: "/bar" */ './Mutations.vue')
const MapState = () => import(/* webpackChunkName: "/bar" */ './MapState.vue')
const MapGetters = () => import(/* webpackChunkName: "/bar" */ './MapGetters.vue')
const Actions = () => import(/* webpackChunkName: "/bar" */ './Actions.vue')
const User = () => import(/* webpackChunkName: "/bar" */ './user.vue')


const router = new VueRouter({
    mode: 'history',
    base: __dirname,
    routes: [
        {path: '/', component: Home},
        {path: '/mapState', component: MapState},
        {path: '/mapGetters', component: MapGetters},
        {path: '/mutation', component: Mutations},
        {path: '/actions', component: Actions},
        {path: '/user', component: User}
    ]
})

new Vue({
    router,
    store,
    template: `
    <div id="app">
      <h1>Basic</h1>
      <p>count: {{count}}</p>
      <p>代办事项: {{todoCount}}</p>
      <ul>
        <li><router-link to="/">state</router-link></li>
        <li><router-link to="/mapState">mapState</router-link></li>
        <li><router-link to="/mapGetters">getters,mapGetters</router-link></li>
        <li><router-link to="/mutation">mutations</router-link></li>
        <li><router-link to="/actions">actions</router-link></li>
        <li><router-link to="/user">user</router-link></li>
      </ul>
      <router-view class="view"></router-view>
    </div>
  `, computed: {
            count() {
                return this.$store.state.count;
            },todoCount()  {
                 return this.$store.getters.doneTodosCount;
                }
    }
}).$mount('#app')
