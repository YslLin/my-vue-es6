import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import axios from 'axios'
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import './utils/materialIcons/material-icons.css';
import iview from 'iview';
import './mock/index.js'
import '@/views/main-components/theme-switch/theme/index.less';
import "./utils/iconfont/test"; // 阿里图标库

Vue.use(MuseUI);
axios.defaults.withCredentials = true;
Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.use(iview);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
