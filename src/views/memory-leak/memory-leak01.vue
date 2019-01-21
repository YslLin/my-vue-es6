<template>
  <div>
    01
  </div>
</template>

<script>
  export default {
    name: 'memory-leak01',
    mounted(){
      let i = 0;
      // 该定时器不会随着组件注销而停止
      setInterval(()=>{
        console.log(1);
        this.$store.commit('setArr', [i++]);
      }, 1000)
    }
  }
</script>

<style scoped>

</style>
