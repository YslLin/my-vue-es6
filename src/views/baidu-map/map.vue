<!--  -->
<template>
  <div>
    <div v-if="enabledMerge" class="merge-button">
      <Button type="primary" shape="circle" @click="mergePolygon">完成合并</Button>
    </div>
    <div id="mapContainer" class="baidu-map">
    </div>
  </div>
</template>

<script>
  import Draw, {Control} from './util/Draw'
  import Edit from './util/Edit.js';
  import Merge from './util/Merge.js';

  export default {
    name: 'baidumap',
    mixins: [Draw, Edit, Merge],
    data: function () {
      return {
        buttons: {}, // 工具按钮
      }
    },
    mounted() {
      const _this = this;

      // 初始化地图
      this.initialize();

      // 按钮控制类
      class Controls {

        // 构造函数
        constructor(name, status, onClick) {
          // 按钮名称
          this.name = name;

          // 按钮状态
          this.status = status;

          // 单击事件
          this.onClick = onClick;
        }

        // 获取按钮状态
        toggled() {
          return _this[this.status];
        }

        // 切换按钮状态
        toggle(e) {
          // 获取按钮DOM元素
          const button = document.getElementById(this.name);

          // 如果参数非boolean类型 则 调用单击事件
          if(typeof e !== 'boolean'){
            this.onClick();
          }

          // 根据按钮状态 设置 按钮样式
          if (this.toggled()) {
            button.style.backgroundColor = '#48c332';
          } else {
            button.style.backgroundColor = '#ffffff';
          }
        }
      }

      // 实例化绘图按钮
      this.buttons[this.drawButtonName] = new Controls(this.drawButtonName, 'enabledDraw', this.toggleDraw);

      // 实例化合并按钮
      this.buttons[this.mergeButtonName] = new Controls(this.mergeButtonName, 'enabledMerge', this.toggleMerge);

      // 初始化地图控件
      Control(this.map, this.toggleButton, this.drawButtonName, this.mergeButtonName);

      // 初始化多边形覆盖物单击事件
      this.initPolygonClick();
    },
    methods: {

      // 根据按钮关闭其它按钮启用的模式
      triggerClickOnToggledButtons(exceptThisButton) {
        // 遍历按钮对象集合
        for (const name in this.buttons) {

          // 非当前单击的按钮 并且 是已启用状态的按钮 则 停用已开启的模式
          if (this.buttons[name] !== exceptThisButton && this.buttons[name].toggled()) {
            this.buttons[name].toggle();
          }

        }
      },

      // 根据按钮名称切换按钮状态
      toggleButton(name) {

        // 停用其它模式
        this.triggerClickOnToggledButtons(this.buttons[name]);

        // 切换按钮状态
        this.buttons[name].toggle();
      }
    }
  };
</script>

<style lang="less">
  @import "./map.less";
</style>
