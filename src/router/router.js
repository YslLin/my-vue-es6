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
    title: '百度地图',
    component: Main,
    children: [
      {path: 'index', title: '画图', name: 'baidumap_index', component: () => import('@/views/baidu-map/map')}
    ]
  }, {
    path: '/js-xlsx',
    icon: 'key',
    title: '导出Excel',
    component: Main,
    children: [
      {path: 'index', title: '导出Excel', name: 'jsxlsx_index', component: () => import('@/views/js-xlsx/js-xlsx')}
    ]
  }, {
    path: '/memory_leak1',
    icon: 'key',
    title: '内存溢出01',
    component: Main,
    children: [
      {
        path: 'index',
        title: '内存溢出01',
        name: 'memory_leak1',
        component: () => import('@/views/memory-leak/memory-leak01')
      },
      {
        path: 'index',
        title: '内存溢出02',
        name: 'memory_leak2',
        component: () => import('@/views/memory-leak/memory-leak02')
      }
    ]
  }, {
    path: '/museUI',
    icon: 'key',
    title: 'MuseUI',
    component: Main,
    children: [
      {path: 'index', title: 'MuseUI', name: 'museUI', component: () => import('@/views/museUI/museUI')}
    ]
  }, {
    path: '/sq',
    icon: 'key',
    title: 'MuseUI',
    component: Main,
    children: [
      {path: 'wxsq', title: 'MuseUI', name: 'wxsq', component: () => import('@/views/museUI/wxsq')},
      {path: 'qywx', title: 'MuseUI', name: 'qywx', component: () => import('@/views/museUI/qywx')},
      {path: 'appdy', title: 'MuseUI', name: 'appdy', component: () => import('@/views/museUI/appdy')},
      {path: 'ddsq', title: 'MuseUI', name: 'ddsq', component: () => import('@/views/museUI/ddsq')}
    ]
  }
];

export const routers = [
  locking,
  otherRouter,
  ...appRouter
];
