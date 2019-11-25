<!-- 首页 -->
<template>
  <div class="home">首页
    <input :value="val" id="ysl"/>
    <button @click="onClick">打开新页面</button>
    <button @click="">关闭当前页</button>
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
  },
  methods:{
    onClick(){
      console.log(1);
      window.open('http://www.baidu.com','_blank','top=300,left=800,width=500,height=300,location=no,menubar=no,resizable=no,status=no,toolbar=no')
      // window.open('http://www.baidu.com')
    }
  }
}
</script>

<style scoped>

</style>
