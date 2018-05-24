import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import iview from 'iview';
import '@/views/main-components/theme-switch/theme/index.less';

Vue.config.productionTip = false;
Vue.use(iview);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
