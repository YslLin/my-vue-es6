import Vue from 'vue';
import Vuex from 'vuex';

import user from './modules/user';
import memoryLeak from './modules/memory-leak';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    user,
    memoryLeak
  }
});

export default store;
