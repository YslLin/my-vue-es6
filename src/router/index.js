import Vue from 'vue';
import Router from 'vue-router';
import {routers} from './router';
import iView from 'iview';
import Cookies from 'js-cookie';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: 'YslLin',
  routes: routers
});

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
    next({
      replace: true,
      name: 'locking'
    });
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

export default router;
