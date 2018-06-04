import Main from '@/views/Main';

export const locking = { // 锁屏
  path: '/locking',
  name: 'locking',
  component: () => import('@/views/main-components/lock-screen/components/locking-page.vue')
};

export const otherRouter = { // 主页上的路由(个人中心、 消息中心等)
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  children: [
    {path: 'home', title: {i18n: 'home'}, name: 'home_index', component: () => import('@/views/home/home.vue')}
  ]
};

// 菜单栏路由
export const appRouter = [
  {
    path: '/baidu-map',
    icon: 'key',
    name: 'baidumap',
    title: '百度地图',
    component: Main,
    children: [
      { path: 'index', title: '权限管理', name: 'baidumap_index', component: () => import('@/views/baidu-map/map') }
    ]
  }
];

export const routers = [
  locking,
  otherRouter,
  ...appRouter
];
