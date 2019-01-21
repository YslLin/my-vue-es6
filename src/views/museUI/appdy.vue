<!--  -->
<template>
  <div>
    <a href="weixin://dl/business/?ticket=t4c3973ab66cebc30e6cd26168d07d8ce" class="dl-btn" id="download">打开微信</a>
    <p><a href="weixin://dl/businessWebview/link/?appid=wx77233474609dcf12&url=baidu.com">test </a></p>
    <p><a href="taobao://">淘宝 </a></p>
    <p><a href="mqq://">QQ </a></p>
    <p><a href="sms://">短信 </a></p>
    <p><a href="dingtalk://">钉钉 </a></p>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        url: encodeURIComponent('baidu.com')
      }
    },
    methods: {
      testApp(url) {
        alert(url);
        var timeout, t = 1000, hasApp = true;
        setTimeout(function () {
          if (!hasApp) {
            //没有安装微信
            var r = confirm("您没有安装微信，请先安装微信!");
            if (r === true) {
              location.href = "http://weixin.qq.com/"
            }
          } else {
            //安装微信
          }
          document.body.removeChild(ifr);
        }, 2000)

        var t1 = Date.now();
        var ifr = document.createElement("iframe");
        ifr.setAttribute('src', url);
        ifr.setAttribute('style', 'display:none');
        document.body.appendChild(ifr);
        timeout = setTimeout(function () {
          var t2 = Date.now();
          if (!t1 || t2 - t1 < t + 100) {
            hasApp = false;
          }
        }, t);
      }
    }
  }
</script>

<style scoped>

</style>
