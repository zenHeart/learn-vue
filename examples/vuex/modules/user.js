const LOGIN = 'login'
const LOGOUT = 'logout'

const ADD_USER = 'addUser';
const DEL_USER = 'delUser'



const state = {};

const mutations = {
    [ADD_USER](state,userInfo) {
        state.user = userInfo;
    },
    [DEL_USER](state) {
        delete state.user
    }
}
const actions = {
    [LOGIN]({commit},userInfo) {
        commit(ADD_USER,userInfo);
    },
    [LOGOUT]({commit}) {
        commit(DEL_USER);
    }
}

export default {
    state,
    mutations,
    actions
}

export const EVENTS = {
    LOGIN,
    LOGOUT,
    ADD_USER,
    DEL_USER
}

