<!--  -->
<template>
    <div id="mapContainer" class="baidu-map">
    </div>
</template>

<script>
import Draw,{ Control } from './util/Draw'
import Edit from './util/Edit.js';
import Merge from './util/Merge.js';

export default {
  name: 'baidumap',
  mixins:[Draw, Edit, Merge],
  data:function(){
    return {
      buttons: {}, // 工具按钮
    }
  },
  mounted(){
    this.initialize();

    class Controls {
      constructor(status, onClick){
        this.status = status;
        this.onClick = onClick;
      }

      toggled(){
        return this[this.status];
      }

      toggle() {
          this.onClick();
      }
    }
    this.buttons['drawButton'] = new Controls('enabledDraw', this.toggleDraw);
    this.buttons['mergeButton'] = new Controls('enabledMerge', this.toggleMerge);
    Control(this.map, this.toggleButton);
    this.initPolygonClick();
  },
  methods:{
    triggerClickOnToggledButtons(exceptThisButton) {
      for (const name in this.buttons) {
        if (this.buttons[name] !== exceptThisButton && this.buttons[name].toggled()) {
          this.buttons[name].toggle();
        }
      }
    },
    toggleButton(name){
      console.log(this.buttons[name]);
      this.triggerClickOnToggledButtons();
      this.buttons[name].toggle();
    }
  }
};
</script>

<style lang="less">
  @import "./map.less";
</style>
