<!--  -->
<template>
    <div id="mapContainer" class="baidu-map">
    </div>
</template>

<script>
import Draw,{ Control } from './util/Draw'
import Edit from './util/Edit.js';

export default {
  name: 'baidumap',
  mixins:[Draw, Edit],
  mounted(){
    this.initialize();
    Control(this.map, this.toggleDraw);
  }
};
</script>

<style lang="less">
  @import "./map.less";
</style>
