<!-- 首页 -->
<template>
  <div class="home">首页
    <input v-model="val" id="ysl" @keydown.enter="onInput"/>
    <button @click="onClick">打开新页面</button>
    <button @click="">关闭当前页</button>
    <div>
      {{txt}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      val: '123',
      txt: false,
    }
  },
  mounted () {
    // this.$axios.post('http://10.10.12.211:11010/api/bdxorgan/organisation/v2/getWebCorpChildrenJsonByPk',
    //   {"pk_corp": "5879","dataSource": "bdx"}).then(response => {
    //     let data1 = response.data.data;
    // });
    //
    // document.getElementById('ysl').value = 'ysl';
    // this.$nextTick(function () {
    //   console.log(this.val)
    // });
    // document.getElementById('ysl').value = '123'
  },
  methods:{
    onInput(){
      let pwd = this.val;
      let along = /(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){2}\d/;
      let inverse = /(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){2}\d/;
      let repeat = /(\d)\1{2,}/;
      let zjs = /zjs/i;
      let a = /\d+/.test(pwd);
      let b = /[A-Za-z]+/.test(pwd);
      let c = /\W+/.test(pwd);
      if (pwd.length <= 8) {
        this.txt = '密码为至少 8 位';
      } else if (!((a && b) || (a && c) || (b && c))) {
        this.txt = '数字、字母、特殊字符中至少任意两种相合';
      } else if (along.test(pwd) || inverse.test(pwd)){
        this.txt = '连续数字不可超过 3 位及以上，如：123、321';
      } else if (repeat.test(pwd)) {
        this.txt = '重复数字不可超过 3 位及以上'
      } else if (this.txt.indexOf('305904') > -1) {
        this.txt = '数字不可为登陆人工号'
      } else if (zjs.test(pwd)){
        this.txt = '字母中不可出现 ZJS (不区分大小写)'
      } else {
        this.txt = '合格'
      }
    },
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
