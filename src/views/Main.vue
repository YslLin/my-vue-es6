<!-- 主页 -->
<template>
  <div class="main">
    <layout class="main-layout">
      <sider ref="side1" hide-trigger collapsible :collapsed-width="78" v-model="isCollapsed">
        <div class="logo-con">
          <Icon type="ios-analytics" class="logo"/>
          <span v-show="!isCollapsed">YslLin</span>
        </div>
        <i-menu active-name="1-2" theme="dark" width="auto" :class="menuitemClasses" @on-select="handleChange">
          <menu-item name="baidumap_index">
            <icon type="ios-navigate"/>
            <span>百度地图</span>
          </menu-item>
          <menu-item name="jsxlsx_index">
            <icon type="search"/>
            <span>导出Excel</span>
          </menu-item>
          <menu-item name="memory_leak1">
            <icon type="settings"/>
            <span>内存泄漏1</span>
          </menu-item>
          <menu-item name="memory_leak2">
            <icon type="settings"/>
            <span>内存泄漏2</span>
          </menu-item>
          <menu-item name="museUI">
            <icon type="ios-toggle-outline"/>
            <span>museUI</span>
          </menu-item>
          <menu-item name="wxsq">
            <icon type="chatbubbles"/>
            <span>微信授权</span>
          </menu-item>
          <menu-item name="qywx">
            <icon type="chatbox-working"/>
            <span>企业微信</span>
          </menu-item>
          <menu-item name="appdy">
            <Icon type="link"></Icon>
            <span>app唤起</span>
          </menu-item>
          <menu-item name="ddsq">
            <Icon type="lock-combination"/>
            <span>钉钉授权</span>
          </menu-item>
          <menu-item name="worker1">
            <Icon type="lock-combination"/>
            <span>多线程</span>
          </menu-item>
        </i-menu>
      </sider>
      <layout>
        <i-header :style="{padding: 0}" class="layout-header-bar">
          <icon @click.native="collapsedSider" :class="rotateIcon" :style="{margin: '20px 20px 0'}" type="navicon-round" size="24"/>
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
    data() {
      return {
        isCollapsed: true,
        isFullScreen: false
      };
    },
    computed: {
      rotateIcon() {
        return [
          'menu-icon',
          this.isCollapsed ? 'rotate-icon' : ''
        ];
      },
      menuitemClasses() {
        return [
          'menu-item',
          this.isCollapsed ? 'collapsed-menu' : ''
        ];
      }
    },
    methods: {
      collapsedSider() {
        this.$refs.side1.toggleCollapse();
      },
      handleChange(name) {
        console.log(name);
        let willpush = true;
        if (this.beforePush !== undefined) {
          if (!this.beforePush(name)) {
            willpush = false;
          }
        }
        if (willpush) {
          this.$router.push({
            name: name
          });
        }
        this.$emit('on-change', name);
      }
    }
  };
</script>

<style lang="less">
  @import './Main.less';
</style>
