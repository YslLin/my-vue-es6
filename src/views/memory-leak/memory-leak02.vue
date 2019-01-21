<template>
  <div>
    02
  </div>
</template>

<script>
  // import Vue from 'vue'
  export default {
    name: 'memory-leak02',
    watch: {
      // 该监听会在最贱关闭后停止
      '$store.state.memoryLeak.arr': function () {
        console.log(2);
      }
    },
    mounted() {
      // 该监听会在组件关闭后停止
      this.$watch('$store.state.memoryLeak.arr', function () {
        console.log(3);
      });
      // const unWatch = Vue.$watch('$store.state.memoryLeak.arr', function () {
      //   console.log(4);
      // });
    }
  }
</script>

<style scoped>

</style>
