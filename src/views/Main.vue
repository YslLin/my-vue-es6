<!-- 主页 -->
<template>
  <div class="main">
    <layout class="main-layout">
      <sider ref="side1" hide-trigger collapsible :collapsed-width="78" v-model="isCollapsed">
        <div class="logo-con">
          <Icon type="ios-analytics" class="logo"></Icon>
          <span v-show="!isCollapsed">YslLin</span>
        </div>
        <i-menu active-name="1-2" theme="dark" width="auto" :class="menuitemClasses">
          <menu-item name="1-1">
            <icon type="ios-navigate"></icon>
            <span>
              <router-link :to="{ name:'baidumap_index'}">百度地图</router-link>
            </span>
          </menu-item>
          <menu-item name="1-2">
            <icon type="search"></icon>
            <span>Option 2</span>
          </menu-item>
          <menu-item name="1-3">
            <icon type="settings"></icon>
            <span>Option 3</span>
          </menu-item>
        </i-menu>
      </sider>
      <layout>
        <i-header :style="{padding: 0}" class="layout-header-bar">
          <icon @click.native="collapsedSider" :class="rotateIcon" :style="{margin: '20px 20px 0'}" type="navicon-round"
                size="24"></icon>
          <div class="header-right-con">
            <full-screen v-model="isFullScreen"></full-screen>
            <lock-screen></lock-screen>
          </div>
        </i-header>
        <i-content :style="{margin: '20px', background: '#fff', minHeight: '260px' }">
          <router-view></router-view>
        </i-content>
      </layout>
    </layout>
  </div>
</template>

<script>
import fullScreen from './main-components/full-screen';
import lockScreen from './main-components/lock-screen/lock-screen';

export default {
  name: 'Main',
  components: {
    fullScreen,
    lockScreen
  },
  data () {
    return {
      isCollapsed: true,
      isFullScreen: false
    };
  },
  computed: {
    rotateIcon () {
      return [
        'menu-icon',
        this.isCollapsed ? 'rotate-icon' : ''
      ];
    },
    menuitemClasses () {
      return [
        'menu-item',
        this.isCollapsed ? 'collapsed-menu' : ''
      ];
    }
  },
  methods: {
    collapsedSider () {
      this.$refs.side1.toggleCollapse();
    }
  }
};
</script>

<style lang="less">
  @import './Main.less';
</style>
