<!-- 首页 -->
<template>
  <div class="home">首页
    <input :value="val" id="ysl"/>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      val: ''
    }
  },
  mounted () {
    document.getElementById('ysl').value = 'ysl'
    this.$nextTick(function () {
      console.log(this.val)
    })
    document.getElementById('ysl').value = '123'
  }
}
</script>

<style scoped>

</style>
